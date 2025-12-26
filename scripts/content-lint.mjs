#!/usr/bin/env node

/**
 * content-lint.mjs
 * Validates frontmatter of blog articles and YAML page definitions.
 * V3: Added overrides validation and multilingual checks.
 * No external dependencies - pure Node.js
 */

import { readdir, readFile, stat } from 'node:fs/promises'
import { join, relative, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname as pathDirname } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = pathDirname(__filename)
const ROOT = join(__dirname, '..')
const CONTENT_DIR = join(ROOT, 'content')

// =============================================================================
// BLOG REQUIRED FIELDS
// =============================================================================

const BLOG_REQUIRED_FIELDS = [
  { name: 'title', type: 'string' },
  { name: 'description', type: 'string' },
  { name: 'date', type: 'date' },
  { name: 'updated', type: 'date' },
  { name: 'tags', type: 'array' },
  { name: 'category', type: 'string' },
  { name: 'cover', type: 'string' },
  { name: 'draft', type: 'boolean' }
]

// =============================================================================
// PAGE BUILDER VALIDATION
// =============================================================================

const VALID_PAGE_KINDS = ['site', 'p', 'demo']

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
function parseSimpleYaml(yaml) {
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
 * Parse YAML file content (more complete parser for nested structures)
 */
function parseYamlFile(content) {
  const result = {
    kind: null,
    seo: null,
    sections: null,
    packKey: null,
    _raw: content
  }

  // Check for kind field
  const kindMatch = content.match(/^kind:\s*['"]?(\w+)['"]?\s*$/m)
  if (kindMatch) {
    result.kind = kindMatch[1]
  }

  // Check for packKey field
  const packKeyMatch = content.match(/^packKey:\s*['"]?(\w+)['"]?\s*$/m)
  if (packKeyMatch) {
    result.packKey = packKeyMatch[1]
  }

  // Check for seo block
  if (content.includes('seo:')) {
    result.seo = {}
    const titleMatch = content.match(/title:\s*['"]?(.+?)['"]?\s*$/m)
    const descMatch = content.match(/description:\s*['"]?(.+?)['"]?\s*$/m)
    if (titleMatch) result.seo.title = titleMatch[1]
    if (descMatch) result.seo.description = descMatch[1]
  }

  // Check for sections array
  const sectionsMatch = content.match(/sections:\s*\n([\s\S]*?)(?=\n\w|$)/m)
  if (sectionsMatch) {
    const sectionLines = content.match(/^\s{2,4}-\s+(id|type):/gm)
    result.sections = sectionLines ? sectionLines.length : 0
  }

  // Extract section IDs for validation
  result.sectionIds = []
  const idMatches = content.matchAll(/^\s+-\s*id:\s*['"]?([^'"\n]+)['"]?\s*$/gm)
  for (const match of idMatches) {
    result.sectionIds.push(match[1])
  }

  // Extract section packs
  result.sectionPacks = []
  const packMatches = content.matchAll(/^\s+pack:\s*['"]?([^'"\n]+)['"]?\s*$/gm)
  for (const match of packMatches) {
    result.sectionPacks.push(match[1])
  }

  // Extract override keys (both page-level and section-level)
  result.overrideKeys = []
  const overrideMatches = content.matchAll(/^\s+['"]?(--[^'"\s:]+)['"]?\s*:/gm)
  for (const match of overrideMatches) {
    result.overrideKeys.push(match[1])
  }

  // Check for legacy type/variant format
  result.hasLegacyFormat = /^\s+-\s*type:/m.test(content) && /^\s+variant:/m.test(content)

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
      if (fullPath.includes('/blog/')) {
        files.push(fullPath)
      }
    }
  }

  return files
}

/**
 * Recursively find all YAML page files
 */
async function findPageFiles(dir, files = []) {
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)

    if (entry.isDirectory()) {
      await findPageFiles(fullPath, files)
    } else if (entry.isFile() && (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml'))) {
      if (fullPath.includes('/pages/')) {
        files.push(fullPath)
      }
    }
  }

  return files
}

/**
 * Validate a blog markdown file
 */
async function validateBlogFile(filePath) {
  const relativePath = relative(ROOT, filePath)
  const content = await readFile(filePath, 'utf-8')
  const errors = []

  const frontmatterRaw = extractFrontmatter(content)
  if (!frontmatterRaw) {
    return { path: relativePath, errors: ['Missing frontmatter (no --- ... --- block)'] }
  }

  const frontmatter = parseSimpleYaml(frontmatterRaw)

  for (const field of BLOG_REQUIRED_FIELDS) {
    const value = frontmatter[field.name]

    if (value === undefined || value === null || value === '') {
      errors.push(`Missing required field: ${field.name}`)
      continue
    }

    switch (field.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push(`Field "${field.name}" must be a string`)
        } else if (value.trim() === '') {
          errors.push(`Field "${field.name}" must not be empty`)
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
        } else if (!value.every((v) => typeof v === 'string')) {
          errors.push(`Field "${field.name}" must be an array of strings`)
        }
        break
    }
  }

  if (frontmatter.cover && typeof frontmatter.cover === 'string') {
    if (!frontmatter.cover.startsWith('/')) {
      errors.push(`Field "cover" should start with "/" (got: ${frontmatter.cover})`)
    }
  }

  return { path: relativePath, errors }
}

/**
 * Validate a YAML page file
 */
async function validatePageFile(filePath) {
  const relativePath = relative(ROOT, filePath)
  const content = await readFile(filePath, 'utf-8')
  const errors = []
  const warnings = []

  const parsed = parseYamlFile(content)

  // Check kind (required)
  if (!parsed.kind) {
    errors.push('Missing required field: kind')
  } else if (!VALID_PAGE_KINDS.includes(parsed.kind)) {
    errors.push(`Invalid kind "${parsed.kind}" — must be one of: ${VALID_PAGE_KINDS.join(', ')}`)
  }

  // Check seo (required)
  if (!parsed.seo) {
    errors.push('Missing required block: seo')
  } else {
    if (!parsed.seo.title) {
      errors.push('Missing required field: seo.title')
    }
    if (!parsed.seo.description) {
      errors.push('Missing required field: seo.description')
    }
  }

  // Check sections (required, at least 1)
  if (parsed.sections === null || parsed.sections === 0) {
    errors.push('Missing or empty sections array (at least 1 section required)')
  }

  // Check section IDs
  if (parsed.sectionIds && parsed.sectionIds.length > 0) {
    for (const id of parsed.sectionIds) {
      if (!id || id.trim() === '') {
        errors.push('Section has empty id')
      }
    }
  } else if (parsed.hasLegacyFormat) {
    errors.push('Using legacy type/variant format — migrate to "id" field (e.g., id: "hero.split")')
  } else if (parsed.sections > 0) {
    errors.push('Sections missing "id" field')
  }

  // Validate override keys start with "--"
  if (parsed.overrideKeys && parsed.overrideKeys.length > 0) {
    for (const key of parsed.overrideKeys) {
      if (!key.startsWith('--')) {
        errors.push(`Override key "${key}" must start with "--" (CSS custom property)`)
      }
    }
  }

  // Validate path matches kind
  const pathKindMatch = relativePath.match(/\/pages\/(site|p|demo)\//)
  if (pathKindMatch && parsed.kind && pathKindMatch[1] !== parsed.kind) {
    errors.push(
      `Path/kind mismatch: file is in "${pathKindMatch[1]}" folder but kind is "${parsed.kind}"`
    )
  }

  // Validate packKey and section packs are strings
  if (parsed.packKey && typeof parsed.packKey !== 'string') {
    errors.push('packKey must be a string')
  }
  for (const pack of parsed.sectionPacks) {
    if (typeof pack !== 'string') {
      errors.push(`Section pack must be a string, got: ${typeof pack}`)
    }
  }

  return { path: relativePath, errors, warnings }
}

/**
 * Check multilingual coverage (warnings only)
 */
async function checkMultilingualCoverage(pageFiles) {
  const warnings = []
  const pagesBySlug = new Map()

  for (const filePath of pageFiles) {
    const relativePath = relative(ROOT, filePath)
    // Extract locale and slug from path like content/fr/pages/site/about.yaml
    const match = relativePath.match(/content\/(\w{2})\/pages\/(\w+)\/(.+)\.ya?ml$/)
    if (!match) continue

    const [, locale, kind, slug] = match
    const key = `${kind}/${slug}`

    if (!pagesBySlug.has(key)) {
      pagesBySlug.set(key, new Set())
    }
    pagesBySlug.get(key).add(locale)
  }

  // Check for missing translations (warning, not error)
  const allLocales = new Set()
  for (const locales of pagesBySlug.values()) {
    for (const locale of locales) {
      allLocales.add(locale)
    }
  }

  for (const [slug, locales] of pagesBySlug) {
    for (const locale of allLocales) {
      if (!locales.has(locale)) {
        warnings.push(`Page "${slug}" exists in ${[...locales].join(', ')} but not in ${locale}`)
      }
    }
  }

  return warnings
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('📝 Content lint: validating blog frontmatter and page definitions...\n')

  try {
    await stat(CONTENT_DIR)
  } catch {
    console.log('⚠️  No content directory found. Skipping content lint.')
    process.exit(0)
  }

  let totalErrors = 0

  // ---------------------------------------------------------------------------
  // Validate blog articles
  // ---------------------------------------------------------------------------
  console.log('── Blog Articles ──────────────────────────────────────────────\n')

  const blogFiles = await findBlogFiles(CONTENT_DIR)

  if (blogFiles.length === 0) {
    console.log('⚠️  No blog articles found in content/**/blog/**/*.md\n')
  } else {
    console.log(`Found ${blogFiles.length} blog article(s)\n`)

    const blogResults = await Promise.all(blogFiles.map(validateBlogFile))
    const blogFailures = blogResults.filter((r) => r.errors.length > 0)

    for (const result of blogResults) {
      if (result.errors.length === 0) {
        console.log(`✅ ${result.path}`)
      } else {
        console.log(`❌ ${result.path}`)
        for (const error of result.errors) {
          console.log(`   └─ ${error}`)
        }
      }
    }

    totalErrors += blogFailures.length
    console.log('')
  }

  // ---------------------------------------------------------------------------
  // Validate page definitions
  // ---------------------------------------------------------------------------
  console.log('── Page Definitions ───────────────────────────────────────────\n')

  const pageFiles = await findPageFiles(CONTENT_DIR)

  if (pageFiles.length === 0) {
    console.log('⚠️  No page definitions found in content/**/pages/**/*.yaml\n')
  } else {
    console.log(`Found ${pageFiles.length} page definition(s)\n`)

    const pageResults = await Promise.all(pageFiles.map(validatePageFile))
    const pageFailures = pageResults.filter((r) => r.errors.length > 0)

    for (const result of pageResults) {
      if (result.errors.length === 0) {
        console.log(`✅ ${result.path}`)
      } else {
        console.log(`❌ ${result.path}`)
        for (const error of result.errors) {
          console.log(`   └─ ${error}`)
        }
      }
    }

    totalErrors += pageFailures.length
    console.log('')
  }

  // ---------------------------------------------------------------------------
  // Multilingual coverage (warnings only)
  // ---------------------------------------------------------------------------
  console.log('── Multilingual Coverage ──────────────────────────────────────\n')

  const i18nWarnings = await checkMultilingualCoverage(pageFiles)

  if (i18nWarnings.length === 0) {
    console.log('✅ All pages have consistent translations\n')
  } else {
    console.log(`⚠️  ${i18nWarnings.length} translation warning(s) (not blocking):\n`)
    for (const warning of i18nWarnings) {
      console.log(`   ⚠️  ${warning}`)
    }
    console.log('')
  }

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  if (totalErrors > 0) {
    console.error(`\n❌ ${totalErrors} file(s) with errors\n`)
    process.exit(1)
  }

  const totalFiles = blogFiles.length + pageFiles.length
  console.log(`\n✅ All ${totalFiles} file(s) valid\n`)
  process.exit(0)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
