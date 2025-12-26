/**
 * pagePolicy.ts
 *
 * CENTRALIZED PAGE CLASSIFICATION — Single Source of Truth
 *
 * This file defines the behavior of each page kind:
 * - SEO indexation
 * - Sitemap inclusion
 * - Prerender strategy
 *
 * Used by:
 * - server/utils/page-loader.ts (noindex enforcement)
 * - server/utils/sitemap.ts (sitemap inclusion)
 * - scripts/guard-pages.ts (validation)
 * - docs/scale.md (documentation)
 *
 * ⚠️  NO NUXT DEPENDENCIES — Safe for Node.js scripts
 */

// =============================================================================
// PAGE KINDS
// =============================================================================

export const PAGE_KINDS = ['site', 'p', 'demo'] as const
export type PageKind = (typeof PAGE_KINDS)[number]

// Blog is a special case handled by Nuxt Content
export const BLOG_KIND = 'blog' as const

// =============================================================================
// PAGE POLICY DEFINITION
// =============================================================================

export interface PageKindPolicy {
  /** Is this page indexed by search engines? */
  indexed: boolean
  /** Is this page included in sitemap.xml? */
  sitemap: boolean
  /** Is this page prerendered at build time? */
  prerender: boolean
  /** Human-readable description */
  description: string
}

/**
 * Page Policy Matrix — SINGLE SOURCE OF TRUTH
 *
 * | kind | indexed | sitemap | prerender | use case                    |
 * |------|---------|---------|-----------|----------------------------|
 * | site | ✅       | ✅       | ❌         | Public pages (SEO)          |
 * | blog | ✅       | ✅       | ❌         | Blog articles (SEO)         |
 * | p    | ❌       | ❌       | ❌         | Private previews, landing   |
 * | demo | ❌       | ❌       | ❌         | Demo/showcase pages         |
 */
export const PAGE_POLICY: Record<PageKind | typeof BLOG_KIND, PageKindPolicy> = {
  site: {
    indexed: true,
    sitemap: true,
    prerender: false, // SSR on-demand only
    description: 'Public indexed pages (SEO-friendly)'
  },
  blog: {
    indexed: true,
    sitemap: true,
    prerender: false, // SSR on-demand only
    description: 'Blog articles (SEO-friendly)'
  },
  p: {
    indexed: false,
    sitemap: false,
    prerender: false,
    description: 'Private previews, temporary landing pages'
  },
  demo: {
    indexed: false,
    sitemap: false,
    prerender: false,
    description: 'Demo/showcase pages for clients'
  }
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Check if a page kind should be indexed
 */
export function isIndexedKind(kind: PageKind | typeof BLOG_KIND): boolean {
  return PAGE_POLICY[kind]?.indexed ?? false
}

/**
 * Check if a page kind should be in sitemap
 */
export function isSitemapKind(kind: PageKind | typeof BLOG_KIND): boolean {
  return PAGE_POLICY[kind]?.sitemap ?? false
}

/**
 * Check if a page kind should be prerendered
 * Currently always false — SSR on-demand only
 */
export function isPrerenderKind(kind: PageKind | typeof BLOG_KIND): boolean {
  return PAGE_POLICY[kind]?.prerender ?? false
}

/**
 * Get kinds that should NOT be indexed (for noindex enforcement)
 */
export function getNoindexKinds(): PageKind[] {
  return PAGE_KINDS.filter((kind) => !PAGE_POLICY[kind].indexed)
}

/**
 * Get kinds that should be in sitemap
 */
export function getSitemapKinds(): (PageKind | typeof BLOG_KIND)[] {
  return [...PAGE_KINDS, BLOG_KIND].filter((kind) => PAGE_POLICY[kind].sitemap)
}

// =============================================================================
// SCALE THRESHOLDS
// =============================================================================

/**
 * Scale warning thresholds
 * Used by guard-pages for CI warnings (non-blocking)
 */
export const SCALE_THRESHOLDS = {
  /** Warn if total Page Builder pages exceeds this */
  PAGES_WARNING: 2000,
  /** Warn if blog articles exceeds this */
  BLOG_WARNING: 5000,
  /** Warn if sitemap entries exceeds this */
  SITEMAP_WARNING: 10000
} as const
