#!/usr/bin/env node

/**
 * guard-catalog.mjs
 *
 * CI guard for catalog freshness.
 * Regenerates the catalog and checks if it matches the committed version.
 *
 * Blocks build if:
 * - public/catalog.json doesn't exist
 * - public/catalog.json is out of date (sections/shells/packs changed but catalog not rebuilt)
 *
 * Run: node scripts/guard-catalog.mjs
 */

import { execSync } from 'node:child_process'
import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { createHash } from 'node:crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')
const CATALOG_PATH = join(ROOT, 'public', 'catalog.json')

/**
 * Get content hash of a file (excluding generatedAt field)
 */
async function getCatalogHash(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8')
    const catalog = JSON.parse(content)

    // Remove volatile fields for comparison
    delete catalog.generatedAt

    const stableContent = JSON.stringify(catalog, null, 2)
    return createHash('sha256').update(stableContent).digest('hex').slice(0, 16)
  } catch {
    return null
  }
}

async function main() {
  console.log('📦 Catalog Guard: checking freshness...\n')

  let hasErrors = false

  // -------------------------------------------------------------------------
  // 1. Check if catalog exists
  // -------------------------------------------------------------------------
  try {
    await stat(CATALOG_PATH)
    console.log('✅ public/catalog.json exists')
  } catch {
    hasErrors = true
    console.log('❌ public/catalog.json not found')
    console.log('   └─ Run: pnpm catalog:build')
    console.error('\n❌ Catalog Guard failed\n')
    process.exit(1)
  }

  // -------------------------------------------------------------------------
  // 2. Get hash of current catalog
  // -------------------------------------------------------------------------
  const currentHash = await getCatalogHash(CATALOG_PATH)
  if (!currentHash) {
    hasErrors = true
    console.log('❌ Could not read current catalog')
    console.error('\n❌ Catalog Guard failed\n')
    process.exit(1)
  }

  console.log(`   Current hash: ${currentHash}`)

  // -------------------------------------------------------------------------
  // 3. Regenerate catalog to temp file and compare
  // -------------------------------------------------------------------------
  console.log('\n🔄 Regenerating catalog for comparison...')

  try {
    // Run the catalog build
    execSync('npx tsx scripts/build-catalog.ts', {
      cwd: ROOT,
      stdio: 'pipe'
    })
  } catch (err) {
    hasErrors = true
    console.log('❌ Failed to regenerate catalog')
    console.log(`   └─ ${err.message}`)
    console.error('\n❌ Catalog Guard failed\n')
    process.exit(1)
  }

  // -------------------------------------------------------------------------
  // 4. Compare hashes
  // -------------------------------------------------------------------------
  const newHash = await getCatalogHash(CATALOG_PATH)

  if (currentHash !== newHash) {
    hasErrors = true
    console.log(`\n❌ Catalog is out of date!`)
    console.log(`   Old hash: ${currentHash}`)
    console.log(`   New hash: ${newHash}`)
    console.log(`   └─ Commit the updated public/catalog.json`)
    console.error('\n❌ Catalog Guard failed\n')
    process.exit(1)
  }

  console.log(`   New hash: ${newHash}`)
  console.log('\n✅ Catalog is up to date\n')
  process.exit(0)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
