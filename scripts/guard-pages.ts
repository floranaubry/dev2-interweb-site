/**
 * guard-pages.ts
 *
 * COMPREHENSIVE page-level validation for Page Builder YAML files.
 * This is the "final boss" guard — validates each page as a complete entity.
 *
 * Validates:
 * 1. STRUCTURE: kind, seo, sections array
 * 2. PACKS: page.packKey + section.pack → must be in KNOWN_PACKS
 * 3. SECTIONS: id exists + props validate STRICTLY via Zod schema
 * 4. SHELLS: id exists + slot match + props validate STRICTLY via Zod schema
 * 5. BUSINESS RULES: noindex warnings, strict mode shells
 * 6. I18N: translation coverage (warnings only)
 *
 * Run: pnpm guard:pages
 * (which calls: npx tsx scripts/guard-pages.ts)
 *
 * NOTE: No shebang — always run via package.json script for portability.
 */

import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { parse as parseYaml } from 'yaml'

// Manifests (data-only, no Vue/Nuxt deps — script-safe)
import {
  hasSectionId,
  validateSectionProps,
  getSectionIds
} from '../app/sections/sections.manifest'
import {
  hasShellId,
  isValidShellSlot,
  validateShellProps,
  getShellIds
} from '../app/shells/shells.manifest'
// Use packs.manifest.ts (script-safe) instead of packRegistry.ts (has Nuxt runtime)
import { getKnownPacks, isKnownPack } from '../app/packs/packs.manifest'
// Scale thresholds from centralized page policy
import { SCALE_THRESHOLDS } from '../app/config/pagePolicy'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')
const CONTENT_DIR = join(ROOT, 'content')

// =============================================================================
// TYPES
// =============================================================================

interface PageSeo {
  title?: string | null
  description?: string | null
  noindex?: boolean | null
}

interface SectionDef {
  id: string
  props?: Record<string, unknown>
  pack?: string
  overrides?: Record<string, string>
}

interface ShellComponent {
  id: string
  props?: Record<string, unknown>
}

interface PageShell {
  header?: ShellComponent | string | null
  footer?: ShellComponent | string | null
}

interface PageDef {
  kind?: string
  seo?: PageSeo
  packKey?: string
  shell?: PageShell
  sections?: SectionDef[]
}

interface ValidationResult {
  path: string
  locale: string
  kind: string
  slug: string
  errors: string[]
  warnings: string[]
}

// =============================================================================
// SHELL NORMALIZATION (script-only, mirrors runtime logic)
// =============================================================================

function normalizeShellComponent(
  raw: ShellComponent | string | null | undefined
): ShellComponent | null {
  if (raw === null || raw === undefined) {
    return null
  }
  if (typeof raw === 'string') {
    return { id: raw, props: {} }
  }
  // Object format
  return {
    id: raw.id,
    props: raw.props ?? {}
  }
}

// =============================================================================
// FILE SCANNING
// =============================================================================

async function findPageFiles(): Promise<string[]> {
  const files: string[] = []

  async function scanDir(dir: string): Promise<void> {
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
          files.push(fullPath)
        }
      }
    }
  }

  await scanDir(CONTENT_DIR)

  // STABLE OUTPUT: sort files by path for deterministic order
  return files.sort()
}

// =============================================================================
// YAML PARSING (robust, with yaml package)
// =============================================================================

function parseYamlFile(content: string, filePath: string): PageDef {
  try {
    const parsed = parseYaml(content)
    if (parsed === null || typeof parsed !== 'object') {
      throw new Error('YAML content is not an object')
    }
    return parsed as PageDef
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`Failed to parse YAML file ${filePath}: ${message}`)
  }
}

// =============================================================================
// VALIDATION
// =============================================================================

async function validatePage(filePath: string): Promise<ValidationResult> {
  const relativePath = relative(ROOT, filePath)
  const content = await readFile(filePath, 'utf-8')
  const errors: string[] = []
  const warnings: string[] = []

  // Extract locale and kind from path
  const pathMatch = relativePath.match(/content\/(\w{2})\/pages\/(\w+)\/(.+)\.ya?ml$/)
  const locale = pathMatch?.[1] ?? 'unknown'
  const pathKind = pathMatch?.[2] ?? 'unknown'
  const slug = pathMatch?.[3] ?? 'unknown'

  // Parse YAML
  let page: PageDef
  try {
    page = parseYamlFile(content, relativePath)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    errors.push(message)
    return { path: relativePath, locale, kind: pathKind, slug, errors, warnings }
  }

  // -------------------------------------------------------------------------
  // 1. STRUCTURE VALIDATION
  // -------------------------------------------------------------------------

  // kind
  if (!page.kind) {
    errors.push('Missing required field: kind')
  } else if (!['site', 'p', 'demo'].includes(page.kind)) {
    errors.push(`Invalid kind "${page.kind}" — must be one of: site, p, demo`)
  } else if (page.kind !== pathKind) {
    errors.push(`Path/kind mismatch: file is in "${pathKind}" folder but kind is "${page.kind}"`)
  }

  // seo
  if (!page.seo?.title) {
    errors.push('Missing required field: seo.title')
  }
  if (!page.seo?.description) {
    errors.push('Missing required field: seo.description')
  }

  // sections
  if (!page.sections || !Array.isArray(page.sections) || page.sections.length === 0) {
    errors.push('Missing or empty sections array (at least 1 section required)')
  }

  // -------------------------------------------------------------------------
  // 2. PACKS VALIDATION
  // -------------------------------------------------------------------------

  const knownPacks = getKnownPacks()

  if (page.packKey && !isKnownPack(page.packKey)) {
    errors.push(
      `Unknown packKey "${page.packKey}" — known packs: ${[...knownPacks].join(', ')}. ` +
        `Add to app/packs/packs.manifest.ts KNOWN_PACKS`
    )
  }

  // -------------------------------------------------------------------------
  // 3. SECTIONS VALIDATION (id + pack + STRICT props validation)
  // -------------------------------------------------------------------------

  const sections = page.sections ?? []

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]

    // Check section ID exists
    if (!section?.id) {
      errors.push(`Section[${i}]: Missing id`)
      continue
    }

    if (!hasSectionId(section.id)) {
      errors.push(
        `Section[${i}] (${section.id}): Unknown section id — ` +
          `register in app/sections/sections.manifest.ts or create app/sections/${section.id}/`
      )
      continue // Skip props validation if section doesn't exist
    }

    // Check section pack
    if (section.pack && !isKnownPack(section.pack)) {
      errors.push(
        `Section[${i}] (${section.id}): Unknown pack "${section.pack}" — known packs: ${[...knownPacks].join(', ')}`
      )
    }

    // STRICT props validation via Zod schema
    const propsToValidate = section.props ?? {}
    const propsResult = validateSectionProps(section.id, propsToValidate)

    if (!propsResult.success) {
      errors.push(`Section[${i}] (${section.id}): Invalid props — ${propsResult.error}`)
    }
  }

  // -------------------------------------------------------------------------
  // 4. SHELLS VALIDATION (id + slot + STRICT props validation)
  // -------------------------------------------------------------------------

  const shell = page.shell ?? {}

  for (const slot of ['header', 'footer'] as const) {
    const rawShellDef = shell[slot]

    // Normalize shell component
    const shellComponent = normalizeShellComponent(rawShellDef)

    // null is valid
    if (shellComponent === null) continue

    const shellId = shellComponent.id
    if (!shellId) continue

    // Check shell ID exists
    if (!hasShellId(shellId)) {
      errors.push(
        `shell.${slot}: Unknown shell id "${shellId}" — ` +
          `register in app/shells/shells.manifest.ts or create app/shells/${shellId}/`
      )
      continue
    }

    // Check slot/prefix match
    if (!isValidShellSlot(shellId, slot)) {
      errors.push(
        `shell.${slot}: Invalid shell "${shellId}" — ` +
          `${slot} slot requires shell id starting with "${slot}."`
      )
    }

    // STRICT props validation via Zod schema
    const propsToValidate = shellComponent.props ?? {}
    const propsResult = validateShellProps(shellId, propsToValidate)

    if (!propsResult.success) {
      errors.push(`shell.${slot} (${shellId}): Invalid props — ${propsResult.error}`)
    }
  }

  // -------------------------------------------------------------------------
  // 5. BUSINESS RULES
  // -------------------------------------------------------------------------

  const kind = page.kind ?? 'unknown'
  const isPrivateKind = kind === 'p' || kind === 'demo'
  const shellStrictMode = process.env.NUXT_PUBLIC_SHELL_STRICT_PRIVATE === 'true'

  // noindex warning for p/demo
  if (isPrivateKind && page.seo?.noindex === false) {
    warnings.push(
      `seo.noindex is explicitly false, but ${kind} pages are ALWAYS noindex at runtime — ` +
        `remove noindex: false to avoid confusion`
    )
  }

  // Shell strict mode for p/demo
  const headerComponent = normalizeShellComponent(shell.header)
  const footerComponent = normalizeShellComponent(shell.footer)

  if (isPrivateKind && shellStrictMode) {
    if (headerComponent && headerComponent.id) {
      errors.push(
        `shell.header must be null for ${kind} pages when NUXT_PUBLIC_SHELL_STRICT_PRIVATE=true`
      )
    }
    if (footerComponent && footerComponent.id) {
      errors.push(
        `shell.footer must be null for ${kind} pages when NUXT_PUBLIC_SHELL_STRICT_PRIVATE=true`
      )
    }
  } else if (isPrivateKind) {
    // Flex mode: warn only
    if (headerComponent && headerComponent.id) {
      warnings.push(`${kind} page has shell.header — consider using null for cleaner landing pages`)
    }
    if (footerComponent && footerComponent.id) {
      warnings.push(`${kind} page has shell.footer — consider using null for cleaner landing pages`)
    }
  }

  return { path: relativePath, locale, kind, slug, errors, warnings }
}

// =============================================================================
// I18N COVERAGE CHECK (Stable output)
// =============================================================================

function checkI18nCoverage(results: ValidationResult[]): string[] {
  const warnings: string[] = []
  const pagesBySlug = new Map<string, Set<string>>()

  for (const result of results) {
    const key = `${result.kind}/${result.slug}`
    if (!pagesBySlug.has(key)) {
      pagesBySlug.set(key, new Set())
    }
    pagesBySlug.get(key)!.add(result.locale)
  }

  // Collect all locales seen (sorted for stable output)
  const allLocales = [...new Set([...pagesBySlug.values()].flatMap((s) => [...s]))].sort()

  // Check for missing translations (sorted by slug for stable output)
  const sortedSlugs = [...pagesBySlug.keys()].sort()

  for (const slug of sortedSlugs) {
    const locales = pagesBySlug.get(slug)!
    for (const locale of allLocales) {
      if (!locales.has(locale)) {
        const presentLocales = [...locales].sort().join(', ')
        warnings.push(`Page "${slug}" exists in ${presentLocales} but not in ${locale}`)
      }
    }
  }

  return warnings
}

// =============================================================================
// MAIN
// =============================================================================

async function main(): Promise<void> {
  console.log('📄 Page Guard: comprehensive page validation (STRICT mode)...\n')

  // Show registry info (SORTED for stable output)
  const sortedPacks = [...getKnownPacks()].sort()
  const sortedSections = [...getSectionIds()].sort()
  const sortedShells = [...getShellIds()].sort()

  console.log(`   📦 Known packs: ${sortedPacks.join(', ')}`)
  console.log(`   🧩 Known sections: ${sortedSections.join(', ')}`)
  console.log(`   🐚 Known shells: ${sortedShells.join(', ')}`)
  console.log('')

  // Find all page files (already sorted by findPageFiles)
  const pageFiles = await findPageFiles()

  if (pageFiles.length === 0) {
    console.log('⚠️  No page definitions found in content/**/pages/**/*.yaml\n')
    process.exit(0)
  }

  console.log(`Found ${pageFiles.length} page definition(s)\n`)
  console.log('── Page Validation ────────────────────────────────────────────\n')

  // Validate all pages (sequential to maintain order)
  const results: ValidationResult[] = []
  for (const file of pageFiles) {
    results.push(await validatePage(file))
  }

  let totalErrors = 0
  let totalWarnings = 0

  for (const result of results) {
    const hasErrors = result.errors.length > 0
    const hasWarnings = result.warnings.length > 0

    if (!hasErrors && !hasWarnings) {
      console.log(`✅ ${result.path}`)
    } else if (!hasErrors) {
      console.log(`⚠️  ${result.path}`)
      for (const warning of result.warnings) {
        console.log(`   └─ ⚠️  ${warning}`)
      }
      totalWarnings += result.warnings.length
    } else {
      console.log(`❌ ${result.path}`)
      for (const error of result.errors) {
        console.log(`   └─ ❌ ${error}`)
      }
      for (const warning of result.warnings) {
        console.log(`   └─ ⚠️  ${warning}`)
      }
      totalErrors += result.errors.length
      totalWarnings += result.warnings.length
    }
  }

  console.log('')

  // I18n coverage check
  console.log('── Multilingual Coverage ──────────────────────────────────────\n')

  const i18nWarnings = checkI18nCoverage(results)

  if (i18nWarnings.length === 0) {
    console.log('✅ All pages have consistent translations\n')
  } else {
    console.log(`⚠️  ${i18nWarnings.length} translation warning(s) (not blocking):\n`)
    for (const warning of i18nWarnings) {
      console.log(`   ⚠️  ${warning}`)
    }
    console.log('')
  }

  // Scale check (non-blocking warning)
  console.log('── Scale Check ────────────────────────────────────────────────\n')

  if (pageFiles.length > SCALE_THRESHOLDS.PAGES_WARNING) {
    console.log(
      `   ⚠️  SCALE WARNING: ${pageFiles.length} pages exceeds threshold (${SCALE_THRESHOLDS.PAGES_WARNING})`
    )
    console.log(`      Consider: pagination, sitemap index, or content review`)
    totalWarnings++
  } else {
    console.log(`   ✅ Page count OK (${pageFiles.length} < ${SCALE_THRESHOLDS.PAGES_WARNING})`)
  }
  console.log('')

  // Summary
  console.log('── Summary ────────────────────────────────────────────────────\n')
  console.log(`   📄 Pages analyzed: ${pageFiles.length}`)
  console.log(`   ❌ Errors: ${totalErrors}`)
  console.log(`   ⚠️  Warnings: ${totalWarnings + i18nWarnings.length}`)
  console.log('')

  if (totalErrors > 0) {
    console.error('❌ Page Guard FAILED — fix errors above\n')
    console.log('💡 How to fix common errors:')
    console.log('   • Unknown section id → Create app/sections/{id}/ with schema.ts + index.vue')
    console.log('   • Unknown pack → Add to KNOWN_PACKS in app/packs/packs.manifest.ts')
    console.log(
      '   • Invalid props → Check schema in app/sections/{id}/schema.ts (Zod issues shown)'
    )
    console.log('   • Shell slot mismatch → header.* for header, footer.* for footer')
    console.log('')
    process.exit(1)
  }

  console.log('✅ Page Guard PASSED (STRICT validation)\n')
  process.exit(0)
}

main().catch((err: unknown) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
