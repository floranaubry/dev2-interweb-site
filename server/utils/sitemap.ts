import { serverQueryContent } from '#content/server'
import type { H3Event } from 'h3'
import { isSitemapKind, type PageKind, SCALE_THRESHOLDS } from '../../app/config/pagePolicy'

// =============================================================================
// TYPES
// =============================================================================

export interface SitemapEntry {
  loc: string
  lastmod?: string
  alternates?: Array<{ hreflang: string; href: string }>
}

interface ContentDocument {
  _path?: string
  _locale?: string
  date?: string
  updated?: string
  draft?: boolean
  seo?: {
    noindex?: boolean
  }
}

// =============================================================================
// CACHE (process-level, TTL-based)
// =============================================================================

const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

let cache: {
  at: number
  key: string
  entries: SitemapEntry[]
} | null = null

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
 * Normalize path: no trailing slash except for "/"
 */
export function normalizePath(path: string): string {
  const cleanPath = path.split('?')[0]?.split('#')[0] ?? ''
  if (cleanPath !== '/' && cleanPath.endsWith('/')) {
    return cleanPath.slice(0, -1)
  }
  return cleanPath || '/'
}

/**
 * Build absolute URL from normalized path
 */
export function toAbsoluteUrl(siteUrl: string, path: string): string {
  const normalizedSiteUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl
  return `${normalizedSiteUrl}${normalizePath(path)}`
}

/**
 * Switch locale in path (prefix_except_default strategy)
 */
export function switchLocalePath(
  path: string,
  _currentLocale: string,
  targetLocale: string,
  defaultLocale: string,
  locales: string[]
): string {
  let basePath = normalizePath(path)

  // Remove current locale prefix if present
  for (const loc of locales) {
    if (loc !== defaultLocale && basePath.startsWith(`/${loc}/`)) {
      basePath = basePath.slice(loc.length + 1)
      break
    } else if (loc !== defaultLocale && basePath === `/${loc}`) {
      basePath = '/'
      break
    }
  }

  // Add target locale prefix if not default
  if (targetLocale === defaultLocale) {
    return basePath
  } else {
    return basePath === '/' ? `/${targetLocale}` : `/${targetLocale}${basePath}`
  }
}

/**
 * Build hreflang alternates for a given path
 */
export function buildAlternates(
  path: string,
  siteUrl: string,
  locales: string[],
  localeMeta: Record<string, string>,
  defaultLocale: string
): Array<{ hreflang: string; href: string }> {
  const alternates: Array<{ hreflang: string; href: string }> = []

  for (const code of locales) {
    const alternatePath = switchLocalePath(path, defaultLocale, code, defaultLocale, locales)
    alternates.push({
      hreflang: localeMeta[code] || code,
      href: toAbsoluteUrl(siteUrl, alternatePath)
    })
  }

  // x-default points to default locale version
  const defaultPath = switchLocalePath(path, defaultLocale, defaultLocale, defaultLocale, locales)
  alternates.push({
    hreflang: 'x-default',
    href: toAbsoluteUrl(siteUrl, defaultPath)
  })

  return alternates
}

/**
 * Check if a content path is for an indexable page kind
 * Uses centralized PAGE_POLICY
 *
 * Path format: /{locale}/pages/{kind}/{slug}
 */
function isIndexablePage(path: string): boolean {
  // Extract kind from path: /{locale}/pages/{kind}/{slug}
  const kindMatch = path.match(/^\/\w{2}\/pages\/(\w+)\//)
  if (!kindMatch) return false

  const kind = kindMatch[1] as PageKind
  return isSitemapKind(kind)
}

/**
 * Check if a page should be excluded from sitemap
 * - Drafts are excluded
 * - Pages with noindex: true are excluded
 * - p and demo pages are excluded (never reach here due to path filtering)
 */
function shouldExcludeFromSitemap(doc: ContentDocument): boolean {
  if (doc.draft === true) return true
  if (doc.seo?.noindex === true) return true
  return false
}

// =============================================================================
// MAIN SITEMAP GENERATOR
// =============================================================================

/**
 * Get all sitemap entries from static pages, site pages, and blog content
 * Uses runtimeConfig as single source of truth
 * Cached for CACHE_TTL (10 minutes)
 */
export async function getSitemapEntries(event: H3Event): Promise<SitemapEntry[]> {
  // Read from runtimeConfig (single source of truth)
  const config = useRuntimeConfig(event)
  const siteUrl = (config.public?.siteUrl as string) || 'https://example.com'
  const defaultLocale = (config.public?.defaultLocale as string) || 'fr'
  const configLocales = (config.public?.locales as string[]) || ['fr', 'en']
  const localeMeta = (config.public?.localeMeta as Record<string, string>) || {
    fr: 'fr-FR',
    en: 'en-US'
  }

  // Normalize locales: guarantee defaultLocale is always included
  const normalizedLocales = uniq([defaultLocale, ...configLocales])

  // Cache key based on config (invalidate if config changes)
  const cacheKey = JSON.stringify({
    siteUrl,
    defaultLocale,
    locales: normalizedLocales,
    localeMeta
  })

  // Return cached entries if valid
  if (cache && cache.key === cacheKey && Date.now() - cache.at < CACHE_TTL) {
    return cache.entries
  }

  // ---------------------------------------------------------------------------
  // Generate entries
  // ---------------------------------------------------------------------------
  const entries: SitemapEntry[] = []

  // ---------------------------------------------------------------------------
  // Static pages
  // ---------------------------------------------------------------------------
  const staticPages = ['/', '/blog']

  for (const page of staticPages) {
    // Default locale version (no prefix)
    entries.push({
      loc: toAbsoluteUrl(siteUrl, page),
      alternates: buildAlternates(page, siteUrl, normalizedLocales, localeMeta, defaultLocale)
    })

    // Non-default locale versions
    for (const code of normalizedLocales) {
      if (code !== defaultLocale) {
        const localizedPath = switchLocalePath(
          page,
          defaultLocale,
          code,
          defaultLocale,
          normalizedLocales
        )
        entries.push({
          loc: toAbsoluteUrl(siteUrl, localizedPath),
          alternates: buildAlternates(
            localizedPath,
            siteUrl,
            normalizedLocales,
            localeMeta,
            defaultLocale
          )
        })
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Query all content documents
  // ---------------------------------------------------------------------------
  try {
    const queried = await serverQueryContent(event)
      .where({ draft: { $ne: true } })
      .find()

    const documents = queried as ContentDocument[]

    // ---------------------------------------------------------------------------
    // Site pages (indexable kinds only, via PAGE_POLICY)
    // ---------------------------------------------------------------------------
    const sitePages = documents.filter(
      (doc) => doc._path && isIndexablePage(doc._path) && !shouldExcludeFromSitemap(doc)
    )

    // Group site pages by slug to find translations
    const sitePagesBySlug = new Map<string, ContentDocument[]>()

    for (const page of sitePages) {
      if (!page._path) continue

      // page._path is like /fr/pages/site/about or /en/pages/site/about
      const pathMatch = page._path.match(/^\/(\w{2})\/pages\/site\/(.+)$/)
      if (!pathMatch) continue

      const slug = pathMatch[2]
      if (!slug) continue
      if (!sitePagesBySlug.has(slug)) {
        sitePagesBySlug.set(slug, [])
      }
      sitePagesBySlug.get(slug)!.push(page)
    }

    // Create sitemap entries for each site page
    for (const [slug, translations] of sitePagesBySlug) {
      for (const page of translations) {
        if (!page._path) continue

        const pathMatch = page._path.match(/^\/(\w{2})\/pages\/site\/(.+)$/)
        if (!pathMatch) continue

        const [, pageLocale] = pathMatch
        // Site pages are served at /:slug (not /pages/site/:slug)
        const urlPath = pageLocale === defaultLocale ? `/${slug}` : `/${pageLocale}/${slug}`

        // Build alternates only for translations that exist
        const pageAlternates: Array<{ hreflang: string; href: string }> = []

        for (const code of normalizedLocales) {
          const translationPath = code === defaultLocale ? `/${slug}` : `/${code}/${slug}`
          const hasTranslation = translations.some((t) => t._path?.startsWith(`/${code}/`))

          if (hasTranslation) {
            pageAlternates.push({
              hreflang: localeMeta[code] || code,
              href: toAbsoluteUrl(siteUrl, translationPath)
            })
          }
        }

        // x-default points to default locale if it exists
        const hasDefaultTranslation = translations.some((t) =>
          t._path?.startsWith(`/${defaultLocale}/`)
        )
        if (hasDefaultTranslation) {
          pageAlternates.push({
            hreflang: 'x-default',
            href: toAbsoluteUrl(siteUrl, `/${slug}`)
          })
        }

        entries.push({
          loc: toAbsoluteUrl(siteUrl, urlPath),
          alternates: pageAlternates.length > 0 ? pageAlternates : undefined
        })
      }
    }

    // ---------------------------------------------------------------------------
    // Blog articles from Nuxt Content
    // ---------------------------------------------------------------------------
    const blogArticles = documents.filter(
      (doc) => doc._path && doc._path.includes('/blog/') && !shouldExcludeFromSitemap(doc)
    )

    // Group articles by slug to find translations
    const articlesBySlug = new Map<string, ContentDocument[]>()

    for (const article of blogArticles) {
      if (!article._path) continue

      // article._path is like /fr/blog/hello-world or /en/blog/hello-world
      const pathMatch = article._path.match(/^\/(\w{2})\/blog\/(.+)$/)
      if (!pathMatch) continue

      const slug = pathMatch[2]
      if (!slug) continue
      if (!articlesBySlug.has(slug)) {
        articlesBySlug.set(slug, [])
      }
      articlesBySlug.get(slug)!.push(article)
    }

    // Create sitemap entries for each article
    for (const [slug, translations] of articlesBySlug) {
      for (const article of translations) {
        if (!article._path) continue

        const pathMatch = article._path.match(/^\/(\w{2})\/blog\/(.+)$/)
        if (!pathMatch) continue

        const [, articleLocale] = pathMatch
        const urlPath =
          articleLocale === defaultLocale ? `/blog/${slug}` : `/${articleLocale}/blog/${slug}`

        // Build alternates only for translations that exist
        const articleAlternates: Array<{ hreflang: string; href: string }> = []

        for (const code of normalizedLocales) {
          const translationPath = code === defaultLocale ? `/blog/${slug}` : `/${code}/blog/${slug}`
          const hasTranslation = translations.some((t) => t._path?.startsWith(`/${code}/`))

          if (hasTranslation) {
            articleAlternates.push({
              hreflang: localeMeta[code] || code,
              href: toAbsoluteUrl(siteUrl, translationPath)
            })
          }
        }

        // x-default points to default locale if it exists
        const hasDefaultTranslation = translations.some((t) =>
          t._path?.startsWith(`/${defaultLocale}/`)
        )
        if (hasDefaultTranslation) {
          articleAlternates.push({
            hreflang: 'x-default',
            href: toAbsoluteUrl(siteUrl, `/blog/${slug}`)
          })
        }

        entries.push({
          loc: toAbsoluteUrl(siteUrl, urlPath),
          lastmod: article.updated || article.date,
          alternates: articleAlternates.length > 0 ? articleAlternates : undefined
        })
      }
    }
  } catch (error) {
    // Content query failed - continue with static pages only
    console.warn('[sitemap] Content query failed:', error)
  }

  // ---------------------------------------------------------------------------
  // STABLE OUTPUT: Sort entries by loc for deterministic sitemap
  // ---------------------------------------------------------------------------
  entries.sort((a, b) => a.loc.localeCompare(b.loc))

  // ---------------------------------------------------------------------------
  // SCALE WARNING (dev/server-side only)
  // ---------------------------------------------------------------------------
  if (entries.length > SCALE_THRESHOLDS.SITEMAP_WARNING) {
    console.warn(
      `[sitemap] ⚠️ SCALE WARNING: ${entries.length} entries exceeds threshold (${SCALE_THRESHOLDS.SITEMAP_WARNING}). ` +
        `Consider pagination or sitemap index.`
    )
  }

  // Store in cache
  cache = {
    at: Date.now(),
    key: cacheKey,
    entries
  }

  return entries
}
