#!/usr/bin/env node

/**
 * guard-shells.mjs
 *
 * CI guard for Shell Library integrity — BIDIRECTIONAL VALIDATION
 *
 * Blocks build if:
 * 1. A folder in app/shells/ is NOT registered in ShellRegistry.ts
 * 2. A shell in ShellRegistry.ts has NO folder in app/shells/
 * 3. A shell folder has no schema.ts or index.vue
 * 4. schema.ts doesn't export `schema` and `fixtures`
 * 5. Shell ID doesn't match slot prefix rule (header.* or footer.*)
 * 6. A shell is used in wrong slot in content YAML
 *
 * Run: node scripts/guard-shells.mjs
 */

import { readdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')
const SHELLS_DIR = join(ROOT, 'app', 'shells')
const REGISTRY_PATH = join(ROOT, 'app', 'components', 'renderer', 'ShellRegistry.ts')
const CONTENT_DIR = join(ROOT, 'content')

// =============================================================================
// SHELL SLOT RULES (IMMUTABLE)
// =============================================================================

function isValidShellId(shellId) {
  return shellId.startsWith('header.') || shellId.startsWith('footer.')
}

function getExpectedSlot(shellId) {
  if (shellId.startsWith('header.')) return 'header'
  if (shellId.startsWith('footer.')) return 'footer'
  return null
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get all shell directories (each dir = one shell)
 */
async function getShellDirs() {
  try {
    await stat(SHELLS_DIR)
  } catch {
    return []
  }

  const entries = await readdir(SHELLS_DIR, { withFileTypes: true })
  return entries.filter((e) => e.isDirectory()).map((e) => e.name)
}

/**
 * Parse ShellRegistry.ts to extract registered shell IDs
 * Looks for registerShell({ id: 'xxx' }) patterns
 */
async function getRegistryShellIds() {
  const content = await readFile(REGISTRY_PATH, 'utf-8')

  // Match registerShell calls with id property
  const idMatches = content.matchAll(/registerShell\s*\(\s*\{[^}]*id:\s*['"]([^'"]+)['"]/g)
  const ids = []
  for (const match of idMatches) {
    ids.push(match[1])
  }
  return ids
}

/**
 * Validate a shell folder's structure and exports
 */
async function validateShellFolder(shellId) {
  const errors = []
  const shellDir = join(SHELLS_DIR, shellId)

  // Check slot prefix rule
  if (!isValidShellId(shellId)) {
    errors.push(`Shell ID must start with "header." or "footer." — got "${shellId}"`)
  }

  // Check index.vue exists
  const componentPath = join(shellDir, 'index.vue')
  try {
    await stat(componentPath)
  } catch {
    errors.push(`Missing index.vue`)
  }

  // Check schema.ts exists
  const schemaPath = join(shellDir, 'schema.ts')
  try {
    await stat(schemaPath)
  } catch {
    errors.push(`Missing schema.ts`)
    return { shellId, errors }
  }

  // Read and validate schema.ts exports
  const schemaContent = await readFile(schemaPath, 'utf-8')

  // Must export `schema` (not just SomeSchema)
  if (!schemaContent.includes('export const schema')) {
    errors.push(`schema.ts must export "schema" (e.g., export const schema = z.object(...))`)
  }

  // Must export `fixtures`
  if (!schemaContent.includes('export const fixtures')) {
    errors.push(`schema.ts must export "fixtures" array`)
  }

  // Check fixtures is not empty
  if (/export const fixtures[^=]*=\s*\[\s*\]/.test(schemaContent)) {
    errors.push(`fixtures array must have at least 1 fixture`)
  }

  return { shellId, errors }
}

/**
 * Find all shell references in content YAML files with slot context
 */
async function findContentShellRefs() {
  const refs = []

  async function scanDir(dir) {
    let entries
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      const fullPath = join(dir, entry.name)

      if (entry.isDirectory()) {
        await scanDir(fullPath)
      } else if (entry.isFile() && (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml'))) {
        if (fullPath.includes('/pages/')) {
          const content = await readFile(fullPath, 'utf-8')
          const relPath = fullPath.replace(ROOT, '')

          // New format: header:\n  id: header.default
          const headerIdMatches = content.matchAll(/header:\s*\n\s+id:\s*['"]?([^'"\n]+)['"]?/gm)
          for (const match of headerIdMatches) {
            if (match[1] && match[1] !== 'null') {
              refs.push({ shellId: match[1], slot: 'header', file: relPath })
            }
          }

          const footerIdMatches = content.matchAll(/footer:\s*\n\s+id:\s*['"]?([^'"\n]+)['"]?/gm)
          for (const match of footerIdMatches) {
            if (match[1] && match[1] !== 'null') {
              refs.push({ shellId: match[1], slot: 'footer', file: relPath })
            }
          }

          // Old format: header: "header.default"
          const oldHeaderMatches = content.matchAll(
            /header:\s*['"]?([a-zA-Z][a-zA-Z0-9._-]*)['"]?\s*\n(?!\s+id:)/gm
          )
          for (const match of oldHeaderMatches) {
            if (match[1] && match[1] !== 'null') {
              refs.push({ shellId: match[1], slot: 'header', file: relPath })
            }
          }

          const oldFooterMatches = content.matchAll(
            /footer:\s*['"]?([a-zA-Z][a-zA-Z0-9._-]*)['"]?\s*\n(?!\s+id:)/gm
          )
          for (const match of oldFooterMatches) {
            if (match[1] && match[1] !== 'null') {
              refs.push({ shellId: match[1], slot: 'footer', file: relPath })
            }
          }
        }
      }
    }
  }

  await scanDir(CONTENT_DIR)
  return refs
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('🐚 Shell Library Guard: checking integrity...\n')

  let hasErrors = false

  // -------------------------------------------------------------------------
  // 1. Get shell folders and registry entries
  // -------------------------------------------------------------------------
  const shellDirs = await getShellDirs()
  const registryIds = await getRegistryShellIds()

  const shellDirsSet = new Set(shellDirs)
  const registryIdsSet = new Set(registryIds)

  // -------------------------------------------------------------------------
  // 2. Bidirectional check: folders ↔ registry
  // -------------------------------------------------------------------------
  console.log('── Bidirectional Sync (folders ↔ registry) ────────────────────\n')

  // Folders without registry entry
  const foldersNotInRegistry = shellDirs.filter((id) => !registryIdsSet.has(id))
  if (foldersNotInRegistry.length > 0) {
    hasErrors = true
    console.log('❌ Folders in app/shells/ NOT registered in ShellRegistry.ts:')
    for (const id of foldersNotInRegistry) {
      console.log(`   └─ ${id} → Add registerShell({ id: '${id}', ... }) in ShellRegistry.ts`)
    }
    console.log('')
  }

  // Registry entries without folder
  const registryNotInFolders = registryIds.filter((id) => !shellDirsSet.has(id))
  if (registryNotInFolders.length > 0) {
    hasErrors = true
    console.log('❌ Shells in ShellRegistry.ts with NO folder in app/shells/:')
    for (const id of registryNotInFolders) {
      console.log(`   └─ ${id} → Create app/shells/${id}/ or remove from registry`)
    }
    console.log('')
  }

  if (foldersNotInRegistry.length === 0 && registryNotInFolders.length === 0) {
    console.log(`✅ ${shellDirs.length} shell(s) in sync (folders ↔ registry)\n`)
  }

  // -------------------------------------------------------------------------
  // 3. Validate each shell folder
  // -------------------------------------------------------------------------
  console.log('── Shell Folder Validation ────────────────────────────────────\n')

  if (shellDirs.length === 0) {
    console.log('⚠️  No shells found in app/shells/\n')
  } else {
    const results = await Promise.all(shellDirs.map(validateShellFolder))

    for (const result of results) {
      if (result.errors.length === 0) {
        const slot = getExpectedSlot(result.shellId)
        console.log(`✅ ${result.shellId} (${slot} slot)`)
      } else {
        hasErrors = true
        console.log(`❌ ${result.shellId}`)
        for (const error of result.errors) {
          console.log(`   └─ ${error}`)
        }
      }
    }
    console.log('')
  }

  // -------------------------------------------------------------------------
  // 4. Check content references
  // -------------------------------------------------------------------------
  console.log('── Content Shell References ───────────────────────────────────\n')

  const shellRefs = await findContentShellRefs()

  if (shellRefs.length === 0) {
    console.log('ℹ️  No shell references found in content (shells may be null)\n')
  } else {
    const uniqueIds = [...new Set(shellRefs.map((r) => r.shellId))]
    console.log(`Found ${uniqueIds.length} unique shell ID(s) in content\n`)

    for (const ref of shellRefs) {
      const exists = registryIdsSet.has(ref.shellId)
      const expectedSlot = getExpectedSlot(ref.shellId)
      const slotMatch = expectedSlot === ref.slot

      if (!exists) {
        hasErrors = true
        console.log(`❌ ${ref.shellId} — not found in registry (${ref.file})`)
      } else if (!slotMatch) {
        hasErrors = true
        console.log(
          `❌ ${ref.shellId} — slot mismatch: is a ${expectedSlot} shell but used in ${ref.slot} slot (${ref.file})`
        )
      } else {
        console.log(`✅ ${ref.shellId} in ${ref.slot} slot`)
      }
    }
    console.log('')
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  if (hasErrors) {
    console.error('\n❌ Shell Library Guard failed\n')
    process.exit(1)
  }

  console.log('\n✅ Shell Library Guard passed\n')
  process.exit(0)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
