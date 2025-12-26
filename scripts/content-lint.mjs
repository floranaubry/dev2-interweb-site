#!/usr/bin/env node

/**
 * content-lint.mjs
 * Validates frontmatter of blog articles in content directory.
 * No external dependencies - pure Node.js
 */

import { readdir, readFile, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')
const CONTENT_DIR = join(ROOT, 'content')

// =============================================================================
// REQUIRED FIELDS
// =============================================================================

const REQUIRED_FIELDS = [
  { name: 'title', type: 'string' },
  { name: 'description', type: 'string' },
  { name: 'date', type: 'date' },
  { name: 'draft', type: 'boolean' }
]

// Optional but validated if present
const OPTIONAL_FIELDS = [
  { name: 'updated', type: 'date' },
  { name: 'tags', type: 'array' },
  { name: 'category', type: 'string' },
  { name: 'cover', type: 'string' }
]

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Extract frontmatter from markdown content
 */
function extractFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return null
  return match[1]
}

/**
 * Simple YAML parser for frontmatter (handles basic cases)
 */
function parseYaml(yaml) {
  const result = {}
  const lines = yaml.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const colonIndex = trimmed.indexOf(':')
    if (colonIndex === -1) continue

    const key = trimmed.slice(0, colonIndex).trim()
    let value = trimmed.slice(colonIndex + 1).trim()

    // Handle arrays: [item1, item2]
    if (value.startsWith('[') && value.endsWith(']')) {
      const arrayContent = value.slice(1, -1)
      result[key] = arrayContent
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean)
      continue
    }

    // Handle booleans
    if (value === 'true') {
      result[key] = true
      continue
    }
    if (value === 'false') {
      result[key] = false
      continue
    }

    // Handle numbers
    if (/^\d+$/.test(value)) {
      result[key] = parseInt(value, 10)
      continue
    }

    // Handle quoted strings
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      result[key] = value.slice(1, -1)
      continue
    }

    // Plain string
    result[key] = value
  }

  return result
}

/**
 * Validate date format YYYY-MM-DD
 */
function isValidDate(value) {
  if (typeof value !== 'string') return false
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(value)
  return !isNaN(date.getTime())
}

/**
 * Recursively find all .md files in blog directories
 */
async function findBlogFiles(dir, files = []) {
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)

    if (entry.isDirectory()) {
      await findBlogFiles(fullPath, files)
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      // Only include files in blog directories
      if (fullPath.includes('/blog/')) {
        files.push(fullPath)
      }
    }
  }

  return files
}

/**
 * Validate a single file
 */
async function validateFile(filePath) {
  const relativePath = relative(ROOT, filePath)
  const content = await readFile(filePath, 'utf-8')
  const errors = []

  // Extract frontmatter
  const frontmatterRaw = extractFrontmatter(content)
  if (!frontmatterRaw) {
    return { path: relativePath, errors: ['Missing frontmatter (no --- ... --- block)'] }
  }

  // Parse frontmatter
  const frontmatter = parseYaml(frontmatterRaw)

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    const value = frontmatter[field.name]

    if (value === undefined || value === null || value === '') {
      errors.push(`Missing required field: ${field.name}`)
      continue
    }

    // Type validation
    switch (field.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push(`Field "${field.name}" must be a string`)
        }
        break
      case 'date':
        if (!isValidDate(value)) {
          errors.push(`Field "${field.name}" must be a valid date (YYYY-MM-DD), got: ${value}`)
        }
        break
      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`Field "${field.name}" must be a boolean (true/false)`)
        }
        break
      case 'array':
        if (!Array.isArray(value)) {
          errors.push(`Field "${field.name}" must be an array`)
        } else if (value.length === 0) {
          errors.push(`Field "${field.name}" must not be empty`)
        }
        break
    }
  }

  // Check optional fields if present
  for (const field of OPTIONAL_FIELDS) {
    const value = frontmatter[field.name]
    if (value === undefined || value === null) continue

    switch (field.type) {
      case 'date':
        if (!isValidDate(value)) {
          errors.push(`Field "${field.name}" must be a valid date (YYYY-MM-DD), got: ${value}`)
        }
        break
      case 'array':
        if (!Array.isArray(value)) {
          errors.push(`Field "${field.name}" must be an array`)
        }
        break
    }
  }

  return { path: relativePath, errors }
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('📝 Content lint: validating blog frontmatter...\n')

  // Check if content directory exists
  try {
    await stat(CONTENT_DIR)
  } catch {
    console.log('⚠️  No content directory found. Skipping content lint.')
    process.exit(0)
  }

  // Find all blog markdown files
  const files = await findBlogFiles(CONTENT_DIR)

  if (files.length === 0) {
    console.log('⚠️  No blog articles found in content/**/blog/**/*.md')
    process.exit(0)
  }

  console.log(`Found ${files.length} blog article(s)\n`)

  // Validate each file
  const results = await Promise.all(files.map(validateFile))
  const failures = results.filter((r) => r.errors.length > 0)

  // Report results
  for (const result of results) {
    if (result.errors.length === 0) {
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
    console.error(`\n❌ ${failures.length} file(s) with errors\n`)
    process.exit(1)
  }

  console.log(`\n✅ All ${files.length} file(s) valid\n`)
  process.exit(0)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
