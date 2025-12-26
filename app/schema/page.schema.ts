import { z } from 'zod/v4'

// =============================================================================
// PAGE DEFINITION SCHEMA (Zod) — V4 with Shell System
// =============================================================================

/**
 * PageKind: determines routing and SEO rules
 * - site: indexed, served at /:slug
 * - p: never indexed, served at /p/:slug
 * - demo: never indexed, served at /demo/:slug
 */
export const PageKindSchema = z.enum(['site', 'p', 'demo'])
export type PageKind = z.infer<typeof PageKindSchema>

/**
 * Kinds that are NEVER indexed (noindex forced)
 */
export const NOINDEX_KINDS: PageKind[] = ['p', 'demo']

/**
 * CSS Variable Override schema
 * Keys must start with "--" (CSS custom properties)
 */
export const CssOverridesSchema = z
  .record(z.string(), z.string())
  .refine(
    (obj) => Object.keys(obj).every((k) => k.startsWith('--')),
    'Override keys must start with "--" (CSS custom properties)'
  )
  .optional()

/**
 * ShellComponent: defines a shell component (header or footer)
 * - null means "no component"
 * - { id, props? } means "use this shell component with optional props"
 */
export const ShellComponentSchema = z
  .union([
    z.null(),
    z.object({
      id: z.string().min(1, 'Shell id is required'),
      props: z.record(z.string(), z.unknown()).optional().default({})
    })
  ])
  .optional()

export type ShellComponent = z.infer<typeof ShellComponentSchema>

/**
 * PageShell: controls which shell components (header/footer) to render
 */
export const PageShellSchema = z.object({
  header: ShellComponentSchema,
  footer: ShellComponentSchema
})

/**
 * PageSeo: SEO metadata for the page
 */
export const PageSeoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().optional(),
  noindex: z.boolean().optional()
})

/**
 * SectionDef: defines a single section in the page (V3 with overrides)
 * - id: unique section identifier (e.g. "hero.split", "faq.simple", "layout.stack")
 * - pack: optional override for section-level pack (inherits from page if not set)
 * - props: section-specific props (validated per-section later)
 * - overrides: CSS variable overrides AT SECTION LEVEL for maximum flexibility
 */
export const SectionDefSchema = z.object({
  id: z.string().min(1, 'Section id is required'),
  pack: z.string().optional(),
  props: z.record(z.string(), z.unknown()).optional().default({}),
  overrides: CssOverridesSchema
})

/**
 * PageDef: the complete page definition (V4 with Shell System)
 */
export const PageDefSchema = z.object({
  kind: PageKindSchema,
  slug: z.string().optional(),
  packKey: z.string().optional(),
  themeOverrides: CssOverridesSchema,
  seo: PageSeoSchema,
  shell: PageShellSchema.optional().default({}),
  sections: z.array(SectionDefSchema).min(1, 'At least one section is required')
})

// =============================================================================
// INFERRED TYPES
// =============================================================================

export type CssOverrides = z.infer<typeof CssOverridesSchema>
export type PageShell = z.infer<typeof PageShellSchema>
export type PageSeo = z.infer<typeof PageSeoSchema>
export type SectionDef = z.infer<typeof SectionDefSchema>
export type PageDef = z.infer<typeof PageDefSchema>

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Force noindex for certain page kinds (p, demo)
 * Centralized SEO rule - used by both server loader and client
 */
export function forceNoindex(kind: PageKind, pageSeoNoindex?: boolean): boolean {
  if (NOINDEX_KINDS.includes(kind)) {
    return true
  }
  return pageSeoNoindex ?? false
}
