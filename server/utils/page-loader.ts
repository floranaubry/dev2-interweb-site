import { serverQueryContent } from '#content/server'
import type { H3Event } from 'h3'
import { z } from 'zod/v4'

// =============================================================================
// TYPES (mirrored from app/schema for server-side)
// =============================================================================

// Import centralized policy (script-safe, no Nuxt deps)
import { type PageKind, getNoindexKinds } from '../../app/config/pagePolicy'

export type { PageKind }

// Derive NOINDEX_KINDS from centralized policy
export const NOINDEX_KINDS: PageKind[] = getNoindexKinds()

export interface PageSeo {
  title: string
  description: string
  image?: string
  noindex?: boolean
}

export interface ShellComponent {
  id: string
  props: Record<string, unknown>
}

export interface PageShell {
  header?: ShellComponent | null
  footer?: ShellComponent | null
}

export interface SectionDef {
  id: string
  pack?: string
  props: Record<string, unknown>
  overrides?: Record<string, string>
}

export interface PageDef {
  kind: PageKind
  slug?: string
  packKey?: string
  themeOverrides?: Record<string, string>
  seo: PageSeo
  shell: PageShell
  sections: SectionDef[]
}

export interface LoadPageParams {
  kind: PageKind
  slug: string
  locale: string
}

export interface RuntimeI18n {
  defaultLocale: string
  locales: string[]
  localeMeta: Record<string, string>
  siteUrl: string
}

// =============================================================================
// SHELL SLOT RULES (mirrored from app/utils/runtimeError.ts)
// =============================================================================

const SHELL_SLOT_PREFIXES = {
  header: 'header.',
  footer: 'footer.'
} as const

function isValidShellSlot(shellId: string, slot: 'header' | 'footer'): boolean {
  return shellId.startsWith(SHELL_SLOT_PREFIXES[slot])
}

// =============================================================================
// ZOD SCHEMA (Server-side validation) — V4 with Shell System
// =============================================================================

const CssOverridesSchema = z
  .record(z.string(), z.string())
  .refine(
    (obj) => Object.keys(obj).every((k) => k.startsWith('--')),
    'Override keys must start with "--"'
  )
  .optional()

const PageSeoSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  image: z.string().optional(),
  noindex: z.boolean().optional()
})

const ShellComponentSchema = z
  .union([
    z.null(),
    z.object({
      id: z.string().min(1),
      props: z.record(z.string(), z.unknown()).optional().default({})
    })
  ])
  .optional()

const PageShellSchema = z.object({
  header: ShellComponentSchema,
  footer: ShellComponentSchema
})

const SectionDefSchema = z.object({
  id: z.string().min(1),
  pack: z.string().optional(),
  props: z.record(z.string(), z.unknown()).optional().default({}),
  overrides: CssOverridesSchema
})

const PageDefSchema = z.object({
  kind: z.enum(['site', 'p', 'demo']),
  slug: z.string().optional(),
  packKey: z.string().optional(),
  themeOverrides: CssOverridesSchema,
  seo: PageSeoSchema,
  shell: PageShellSchema.optional().default({}),
  sections: z.array(SectionDefSchema).min(1)
})

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Dedupe string array, preserving order
 */
function uniq(list: string[]): string[] {
  return Array.from(new Set(list.filter(Boolean)))
}

/**
 * Get i18n config from runtimeConfig (single source of truth)
 */
export function getRuntimeI18n(event: H3Event): RuntimeI18n {
  const config = useRuntimeConfig(event)
  const defaultLocale = (config.public?.defaultLocale as string) || 'fr'
  const locales = (config.public?.locales as string[]) || ['fr', 'en']
  const localeMeta = (config.public?.localeMeta as Record<string, string>) || {
    fr: 'fr-FR',
    en: 'en-US'
  }
  const siteUrl = (config.public?.siteUrl as string) || 'https://example.com'

  // Normalize: ensure defaultLocale is always in locales
  const normalizedLocales = uniq([defaultLocale, ...locales])

  return {
    defaultLocale,
    locales: normalizedLocales,
    localeMeta,
    siteUrl
  }
}

/**
 * Get shell strict mode from runtimeConfig
 * When true, p/demo pages have shells forced to null
 */
function getShellStrictPrivate(event: H3Event): boolean {
  const config = useRuntimeConfig(event)
  return Boolean(config.public?.shellStrictPrivate)
}

/**
 * Force noindex for certain page kinds (p, demo)
 * Centralized SEO rule
 */
export function forceNoindex(kind: PageKind, pageSeoNoindex?: boolean): boolean {
  if (NOINDEX_KINDS.includes(kind)) {
    return true
  }
  return pageSeoNoindex ?? false
}

/**
 * Build content path for a page
 *
 * NOTE: Nuxt Content indexes `index.yaml` at the parent directory path.
 * So `content/fr/pages/site/index.yaml` becomes `_path: /fr/pages/site`
 *
 * For home page (slug empty or 'index'), we query the directory path.
 * For other pages, we query the full path.
 */
function buildContentPath(kind: PageKind, slug: string, locale: string): string {
  // Home page: index.yaml is indexed at parent directory
  if (!slug || slug === 'index') {
    return `/${locale}/pages/${kind}`
  }
  return `/${locale}/pages/${kind}/${slug}`
}

/**
 * Normalize shell component from old format (string | null) to new format ({ id, props } | null)
 * Provides backward compatibility for existing YAML files
 */
function normalizeShellComponent(
  value: unknown
): { id: string; props: Record<string, unknown> } | null | undefined {
  if (value === null) return null
  if (value === undefined) return undefined

  // Old format: string -> convert to { id, props: {} }
  if (typeof value === 'string') {
    return { id: value, props: {} }
  }

  // New format: { id, props? }
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const obj = value as { id: string; props?: Record<string, unknown> }
    return { id: obj.id, props: obj.props || {} }
  }

  // Invalid format
  return undefined
}

/**
 * Normalize shell object with backward compatibility
 */
function normalizeShell(shell: unknown): {
  header?: { id: string; props: Record<string, unknown> } | null
  footer?: { id: string; props: Record<string, unknown> } | null
} {
  if (!shell || typeof shell !== 'object') {
    return {}
  }

  const raw = shell as { header?: unknown; footer?: unknown }
  return {
    header: normalizeShellComponent(raw.header),
    footer: normalizeShellComponent(raw.footer)
  }
}

/**
 * Validate shell slot rules (header.* in header, footer.* in footer)
 * @throws createError if slot mismatch
 */
function validateShellSlots(shell: PageShell, isDev: boolean, contentPath: string): void {
  if (shell.header && shell.header.id) {
    if (!isValidShellSlot(shell.header.id, 'header')) {
      throw createError({
        statusCode: 500,
        statusMessage: isDev
          ? `Shell slot mismatch: "${shell.header.id}" must start with "header." to be used in header slot (${contentPath})`
          : 'Invalid shell configuration'
      })
    }
  }

  if (shell.footer && shell.footer.id) {
    if (!isValidShellSlot(shell.footer.id, 'footer')) {
      throw createError({
        statusCode: 500,
        statusMessage: isDev
          ? `Shell slot mismatch: "${shell.footer.id}" must start with "footer." to be used in footer slot (${contentPath})`
          : 'Invalid shell configuration'
      })
    }
  }
}

// =============================================================================
// MAIN LOADER (Server-side only)
// =============================================================================

/**
 * Load a page definition from content (server-side)
 *
 * Features:
 * - Uses serverQueryContent (NOT queryContent)
 * - Locale fallback to defaultLocale
 * - Zod validation with detailed errors in DEV
 * - Backward compatibility for old shell format (string | null)
 * - Shell slot validation (header.* in header, footer.* in footer)
 * - Optional strict mode for p/demo (forces shells to null)
 * - Returns null if not found (caller handles 404)
 *
 * @param event - H3 event
 * @param params - { kind, slug, locale }
 * @returns PageDef or null
 */
export async function loadPage(event: H3Event, params: LoadPageParams): Promise<PageDef | null> {
  const { kind, slug, locale } = params
  const i18n = getRuntimeI18n(event)
  const isDev = process.env.NODE_ENV !== 'production'
  const shellStrictPrivate = getShellStrictPrivate(event)

  // Build content path
  const contentPath = buildContentPath(kind, slug, locale)

  // Query content via serverQueryContent (server-only)
  let rawPage = await serverQueryContent(event).where({ _path: contentPath }).findOne()

  // Fallback to default locale if not found and locale is not default
  if (!rawPage && locale !== i18n.defaultLocale) {
    const fallbackPath = buildContentPath(kind, slug, i18n.defaultLocale)
    rawPage = await serverQueryContent(event).where({ _path: fallbackPath }).findOne()
  }

  // Not found
  if (!rawPage) {
    return null
  }

  // Normalize shell with backward compatibility
  let normalizedShell = normalizeShell(rawPage.shell)

  // ==========================================================================
  // STRICT MODE: Force shells to null for p/demo pages
  // ==========================================================================
  if (shellStrictPrivate && (kind === 'p' || kind === 'demo')) {
    const hadHeader = normalizedShell.header !== null && normalizedShell.header !== undefined
    const hadFooter = normalizedShell.footer !== null && normalizedShell.footer !== undefined

    if (hadHeader || hadFooter) {
      if (isDev) {
        console.warn(
          `[loadPage] STRICT MODE: Forcing shell.header and shell.footer to null for ${kind} page "${slug}" (NUXT_PUBLIC_SHELL_STRICT_PRIVATE=true)`
        )
      }
      normalizedShell = { header: null, footer: null }
    }
  } else if (isDev && (kind === 'p' || kind === 'demo')) {
    // Option B (flex): allow but warn
    if (normalizedShell.header !== null && normalizedShell.header !== undefined) {
      console.warn(
        `[loadPage] Warning: ${kind} page "${slug}" has shell.header set — consider using null for cleaner landing pages (or enable NUXT_PUBLIC_SHELL_STRICT_PRIVATE=true)`
      )
    }
    if (normalizedShell.footer !== null && normalizedShell.footer !== undefined) {
      console.warn(
        `[loadPage] Warning: ${kind} page "${slug}" has shell.footer set — consider using null for cleaner landing pages (or enable NUXT_PUBLIC_SHELL_STRICT_PRIVATE=true)`
      )
    }
  }

  // ==========================================================================
  // VALIDATE SHELL SLOT RULES
  // ==========================================================================
  validateShellSlots(normalizedShell, isDev, contentPath)

  // Build page data (exclude Nuxt Content metadata)
  const pageData = {
    kind: rawPage.kind ?? kind,
    slug: rawPage.slug ?? slug,
    packKey: rawPage.packKey,
    themeOverrides: rawPage.themeOverrides,
    seo: rawPage.seo,
    shell: normalizedShell,
    sections: rawPage.sections
  }

  // Validate with Zod
  const result = PageDefSchema.safeParse(pageData)

  if (!result.success) {
    if (isDev) {
      console.error('[loadPage] Invalid page definition:', {
        path: contentPath,
        issues: result.error.issues
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: isDev
        ? `Invalid page definition: ${result.error.issues.map((i) => i.message).join(', ')}`
        : 'Invalid page configuration'
    })
  }

  return result.data as PageDef
}
