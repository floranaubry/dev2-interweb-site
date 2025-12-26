import { serverQueryContent } from '#content/server'
import type { H3Event } from 'h3'

// =============================================================================
// TYPES
// =============================================================================

export interface SitemapEntry {
  loc: string
  lastmod?: string
  alternates?: Array<{ hreflang: string; href: string }>
}

interface ContentArticle {
  _path?: string
  date?: string
  updated?: string
  draft?: boolean
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

// =============================================================================
// MAIN SITEMAP GENERATOR
// =============================================================================

/**
 * Get all sitemap entries from static pages and blog content
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
  // Blog articles from Nuxt Content (v2 API)
  // ---------------------------------------------------------------------------
  try {
    // Query all blog articles, excluding drafts (primary filter)
    const queried = await serverQueryContent(event)
      .where({ draft: { $ne: true } })
      .find()

    // Safety net: double-check no drafts slip through
    const articles = (queried as ContentArticle[]).filter((a) => a.draft !== true)

    // Filter only blog articles
    const blogArticles = articles.filter((doc) => doc._path && doc._path.includes('/blog/'))

    // Group articles by slug to find translations
    const articlesBySlug = new Map<string, ContentArticle[]>()

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

  // Store in cache
  cache = {
    at: Date.now(),
    key: cacheKey,
    entries
  }

  return entries
}
