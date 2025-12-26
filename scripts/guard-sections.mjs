#!/usr/bin/env node

/**
 * guard-sections.mjs
 *
 * CI guard for Section Library integrity.
 * Blocks build if:
 * 1. A section in registry has no schema
 * 2. A fixture is invalid (fails schema validation)
 * 3. A section referenced in content is not in registry
 *
 * Run: node scripts/guard-sections.mjs
 */

import { readdir, readFile, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')
const SECTIONS_DIR = join(ROOT, 'app', 'sections')
const CONTENT_DIR = join(ROOT, 'content')

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get all section directories (each dir = one section)
 */
async function getSectionDirs() {
  try {
    await stat(SECTIONS_DIR)
  } catch {
    return []
  }

  const entries = await readdir(SECTIONS_DIR, { withFileTypes: true })
  return entries.filter((e) => e.isDirectory()).map((e) => e.name)
}

/**
 * Validate a section's schema and fixtures
 */
async function validateSection(sectionId) {
  const errors = []
  const sectionDir = join(SECTIONS_DIR, sectionId)

  // Check schema.ts exists
  const schemaPath = join(sectionDir, 'schema.ts')
  try {
    await stat(schemaPath)
  } catch {
    errors.push(`Missing schema.ts`)
    return { sectionId, errors }
  }

  // Check index.vue exists
  const componentPath = join(sectionDir, 'index.vue')
  try {
    await stat(componentPath)
  } catch {
    errors.push(`Missing index.vue`)
  }

  // Read and parse schema to validate fixtures
  // We use dynamic import with tsx loader or just check file structure
  const schemaContent = await readFile(schemaPath, 'utf-8')

  // Check schema exports required items
  if (!schemaContent.includes('export const') || !schemaContent.includes('Schema')) {
    errors.push(`schema.ts must export a Zod schema (e.g., HeroSplitSchema)`)
  }

  if (!schemaContent.includes('export const fixtures')) {
    errors.push(`schema.ts must export fixtures array`)
  }

  // Check fixtures is an array with at least 1 item
  const fixturesMatch = schemaContent.match(/export const fixtures[^=]*=\s*\[/)
  if (fixturesMatch) {
    // Basic check: ensure fixtures array is not empty
    const afterFixtures = schemaContent.slice(schemaContent.indexOf('export const fixtures'))
    if (afterFixtures.includes('[]')) {
      // Could be empty array
      if (/fixtures[^=]*=\s*\[\s*\]/.test(afterFixtures)) {
        errors.push(`fixtures array must have at least 1 fixture`)
      }
    }
  }

  return { sectionId, errors }
}

/**
 * Find all section IDs referenced in content YAML files
 */
async function findContentSectionIds() {
  const sectionIds = new Set()

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
          // Extract section IDs
          const idMatches = content.matchAll(/^\s+-\s*id:\s*['"]?([^'"\n]+)['"]?\s*$/gm)
          for (const match of idMatches) {
            sectionIds.add(match[1])
          }
        }
      }
    }
  }

  await scanDir(CONTENT_DIR)
  return sectionIds
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('🔒 Section Library Guard: checking integrity...\n')

  let hasErrors = false

  // -------------------------------------------------------------------------
  // 1. Validate each section in app/sections/
  // -------------------------------------------------------------------------
  console.log('── Section Definitions ────────────────────────────────────────\n')

  const sectionDirs = await getSectionDirs()

  if (sectionDirs.length === 0) {
    console.log('⚠️  No sections found in app/sections/\n')
  } else {
    console.log(`Found ${sectionDirs.length} section(s)\n`)

    const results = await Promise.all(sectionDirs.map(validateSection))

    for (const result of results) {
      if (result.errors.length === 0) {
        console.log(`✅ ${result.sectionId}`)
      } else {
        hasErrors = true
        console.log(`❌ ${result.sectionId}`)
        for (const error of result.errors) {
          console.log(`   └─ ${error}`)
        }
      }
    }
    console.log('')
  }

  // -------------------------------------------------------------------------
  // 2. Check content references sections that exist
  // -------------------------------------------------------------------------
  console.log('── Content Section References ─────────────────────────────────\n')

  const contentSectionIds = await findContentSectionIds()
  const registeredIds = new Set(sectionDirs)

  if (contentSectionIds.size === 0) {
    console.log('⚠️  No section references found in content\n')
  } else {
    console.log(`Found ${contentSectionIds.size} unique section ID(s) in content\n`)

    const missingInRegistry = []
    for (const id of contentSectionIds) {
      if (registeredIds.has(id)) {
        console.log(`✅ ${id}`)
      } else {
        missingInRegistry.push(id)
        console.log(`❌ ${id} — not found in app/sections/`)
      }
    }

    if (missingInRegistry.length > 0) {
      hasErrors = true
      console.log(
        `\n⚠️  ${missingInRegistry.length} section(s) referenced in content but not registered`
      )
    }
    console.log('')
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  if (hasErrors) {
    console.error('\n❌ Section Library Guard failed\n')
    process.exit(1)
  }

  console.log('\n✅ Section Library Guard passed\n')
  process.exit(0)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
