#!/usr/bin/env node

/**
 * guard-pagebuilder.mjs
 *
 * CI guard to prevent spaghetti code in page builder routes.
 * Fails if queryContent is used directly in page builder routes.
 * All content loading MUST go through the canonical server API.
 */

import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')

// Page builder route files to check
const ROUTES_TO_CHECK = [
  'app/pages/[...slug].vue',
  'app/pages/p/[...slug].vue',
  'app/pages/demo/[...slug].vue'
]

// Forbidden patterns in page builder routes
const FORBIDDEN_PATTERNS = [
  {
    pattern: /queryContent\s*\(/,
    message: 'Direct queryContent() usage is forbidden — use the server API via usePageLoader'
  },
  {
    pattern: /serverQueryContent\s*\(/,
    message: "serverQueryContent() should not be used in Vue routes — it's server-only"
  },
  {
    pattern: /\$fetch\s*\(\s*['"`]\/api\/content/,
    message: 'Direct content API calls are forbidden — use usePageLoader composable'
  }
]

// Allowed patterns (for documentation purposes, these are the right patterns)
const EXPECTED_PATTERNS = ['loadPageOrThrow', 'usePageLoader', 'forceNoindex']

async function checkFile(filePath) {
  const fullPath = join(ROOT, filePath)
  const errors = []

  try {
    await stat(fullPath)
  } catch {
    // File doesn't exist (maybe old route structure)
    return { path: filePath, errors: [], skipped: true }
  }

  const content = await readFile(fullPath, 'utf-8')

  for (const { pattern, message } of FORBIDDEN_PATTERNS) {
    if (pattern.test(content)) {
      errors.push(message)
    }
  }

  // Verify expected patterns are present (warning, not error)
  const hasExpectedPattern = EXPECTED_PATTERNS.some((p) => content.includes(p))
  if (!hasExpectedPattern) {
    errors.push(`Route should use one of: ${EXPECTED_PATTERNS.join(', ')} — found none`)
  }

  return { path: filePath, errors, skipped: false }
}

async function main() {
  console.log('🔒 Page Builder Guard: checking for anti-patterns...\n')

  const results = await Promise.all(ROUTES_TO_CHECK.map(checkFile))
  const failures = results.filter((r) => r.errors.length > 0)
  const skipped = results.filter((r) => r.skipped)

  for (const result of results) {
    if (result.skipped) {
      console.log(`⏭️  ${result.path} (skipped - file not found)`)
    } else if (result.errors.length === 0) {
      console.log(`✅ ${result.path}`)
    } else {
      console.log(`❌ ${result.path}`)
      for (const error of result.errors) {
        console.log(`   └─ ${error}`)
      }
    }
  }

  console.log('')

  if (failures.length > 0) {
    console.error(`\n❌ ${failures.length} route(s) with anti-patterns\n`)
    console.error('Fix: Use the canonical loader (usePageLoader / loadPageOrThrow)')
    console.error('     Never call queryContent directly in page routes.\n')
    process.exit(1)
  }

  const checked = results.length - skipped.length
  console.log(`\n✅ All ${checked} route(s) follow page builder conventions\n`)
  process.exit(0)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
