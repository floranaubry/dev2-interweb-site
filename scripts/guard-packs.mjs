#!/usr/bin/env node

/**
 * guard-packs.mjs
 *
 * CI guard for Style Packs integrity.
 * Blocks build if:
 * 1. A pack in registry has no CSS file in public/packs/
 * 2. A page YAML references packKey that doesn't exist
 * 3. A section YAML references pack that doesn't exist
 *
 * Run: node scripts/guard-packs.mjs
 */

import { readdir, readFile, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')
const PUBLIC_PACKS_DIR = join(ROOT, 'public', 'packs')
const CONTENT_DIR = join(ROOT, 'content')
const PACK_MANIFEST_PATH = join(ROOT, 'app', 'packs', 'packs.manifest.ts')

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Extract KNOWN_PACKS array from packs.manifest.ts
 * (Single source of truth for pack keys)
 */
async function getRegistryPacks() {
  try {
    const content = await readFile(PACK_MANIFEST_PATH, 'utf-8')
    // Match: export const KNOWN_PACKS = ['interweb', 'pizza'] as const
    const match = content.match(/KNOWN_PACKS\s*=\s*\[([^\]]+)\]/)
    if (!match) return []

    // Extract pack names from the array
    const packs = match[1]
      .split(',')
      .map((s) => s.trim().replace(/['"]/g, ''))
      .filter(Boolean)

    return packs
  } catch {
    return []
  }
}

/**
 * Get CSS files in public/packs/
 */
async function getPublicPackFiles() {
  try {
    await stat(PUBLIC_PACKS_DIR)
  } catch {
    return []
  }

  const entries = await readdir(PUBLIC_PACKS_DIR, { withFileTypes: true })
  return entries
    .filter((e) => e.isFile() && e.name.endsWith('.css'))
    .map((e) => e.name.replace('.css', ''))
}

/**
 * Find all pack references in content YAML files
 */
async function findContentPackRefs() {
  const refs = {
    packKeys: new Map(), // packKey -> [file paths]
    sectionPacks: new Map() // section.pack -> [file paths]
  }

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
          const relativePath = relative(ROOT, fullPath)

          // Extract packKey (page-level)
          const packKeyMatch = content.match(/^packKey:\s*['"]?([^'"\n]+)['"]?\s*$/m)
          if (packKeyMatch) {
            const pack = packKeyMatch[1]
            if (!refs.packKeys.has(pack)) refs.packKeys.set(pack, [])
            refs.packKeys.get(pack).push(relativePath)
          }

          // Extract section packs
          const sectionPackMatches = content.matchAll(/^\s+pack:\s*['"]?([^'"\n]+)['"]?\s*$/gm)
          for (const match of sectionPackMatches) {
            const pack = match[1]
            if (!refs.sectionPacks.has(pack)) refs.sectionPacks.set(pack, [])
            refs.sectionPacks.get(pack).push(relativePath)
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
  console.log('🎨 Pack Guard: checking style pack integrity...\n')

  let hasErrors = false
  const registryPacks = await getRegistryPacks()
  const publicPacks = await getPublicPackFiles()
  const contentRefs = await findContentPackRefs()

  // -------------------------------------------------------------------------
  // 1. Check registry packs have CSS files
  // -------------------------------------------------------------------------
  console.log('── Registry vs Public Files ───────────────────────────────────\n')

  if (registryPacks.length === 0) {
    console.log('⚠️  No packs found in packs.manifest.ts\n')
  } else {
    console.log(`Found ${registryPacks.length} pack(s) in registry\n`)

    for (const pack of registryPacks) {
      if (publicPacks.includes(pack)) {
        console.log(`✅ ${pack} → public/packs/${pack}.css`)
      } else {
        hasErrors = true
        console.log(`❌ ${pack} → MISSING public/packs/${pack}.css`)
      }
    }
    console.log('')
  }

  // -------------------------------------------------------------------------
  // 2. Check content packKey references
  // -------------------------------------------------------------------------
  console.log('── Content packKey References ─────────────────────────────────\n')

  if (contentRefs.packKeys.size === 0) {
    console.log('ℹ️  No packKey references found in content\n')
  } else {
    console.log(`Found ${contentRefs.packKeys.size} unique packKey(s) in content\n`)

    for (const [pack, files] of contentRefs.packKeys) {
      if (registryPacks.includes(pack)) {
        console.log(`✅ ${pack} (used in ${files.length} file(s))`)
      } else {
        hasErrors = true
        console.log(`❌ ${pack} — NOT in registry`)
        for (const file of files) {
          console.log(`   └─ ${file}`)
        }
      }
    }
    console.log('')
  }

  // -------------------------------------------------------------------------
  // 3. Check section pack references
  // -------------------------------------------------------------------------
  console.log('── Section pack References ────────────────────────────────────\n')

  if (contentRefs.sectionPacks.size === 0) {
    console.log('ℹ️  No section.pack references found in content\n')
  } else {
    console.log(`Found ${contentRefs.sectionPacks.size} unique section.pack(s) in content\n`)

    for (const [pack, files] of contentRefs.sectionPacks) {
      if (registryPacks.includes(pack)) {
        console.log(`✅ ${pack} (used in ${files.length} file(s))`)
      } else {
        hasErrors = true
        console.log(`❌ ${pack} — NOT in registry`)
        for (const file of files) {
          console.log(`   └─ ${file}`)
        }
      }
    }
    console.log('')
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  if (hasErrors) {
    console.error('\n❌ Pack Guard failed\n')
    process.exit(1)
  }

  console.log('\n✅ Pack Guard passed\n')
  process.exit(0)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
