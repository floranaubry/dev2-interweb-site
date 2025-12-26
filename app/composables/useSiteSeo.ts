// =============================================================================
// SEO HELPERS (pure functions, testable)
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
 * @param path - Current path (e.g. /blog/hello or /en/blog/hello)
 * @param _currentLocale - Current locale (unused but kept for signature consistency)
 * @param targetLocale - Target locale
 * @param defaultLocale - Default locale (no prefix)
 * @param locales - Available locale codes
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

// =============================================================================
// TYPES
// =============================================================================

type PageSeoInput = {
  title: string
  description: string
  type?: 'website' | 'article'
  image?: string
  noindex?: boolean
  jsonLd?: Record<string, unknown> | null
  publishedTime?: string
  modifiedTime?: string
}

// =============================================================================
// COMPOSABLE
// =============================================================================

export function useSiteSeo() {
  const appConfig = useAppConfig()
  const runtimeConfig = useRuntimeConfig()
  const route = useRoute()
  const { locale, locales: i18nLocales } = useI18n()

  // Site config from app.config.ts
  const siteConfig = appConfig.site as {
    name: string
    url: string
    defaultTitle: string
    defaultDescription: string
    defaultOgImage: string
    twitterHandle?: string
  }

  // Single source of truth from runtimeConfig
  const siteUrl = (runtimeConfig.public?.siteUrl as string) || siteConfig.url
  const defaultLocale = (runtimeConfig.public?.defaultLocale as string) || 'fr'
  const configLocales = (runtimeConfig.public?.locales as string[]) || ['fr', 'en']
  const localeMeta = (runtimeConfig.public?.localeMeta as Record<string, string>) || {
    fr: 'fr-FR',
    en: 'en-US'
  }

  // Normalize locales: guarantee defaultLocale is always included
  const normalizedLocales = uniq([defaultLocale, ...configLocales])

  // DEV-only warnings
  if (import.meta.dev) {
    // Warn if defaultLocale was missing from configLocales
    if (!configLocales.includes(defaultLocale)) {
      console.warn('[useSiteSeo] ⚠️ defaultLocale missing from runtimeConfig.public.locales:', {
        defaultLocale,
        configLocales
      })
    }

    // Warn if i18n locales diverge from runtimeConfig
    const i18nLocaleCodes = (i18nLocales.value as Array<{ code: string }>).map((l) => l.code)
    const mismatch =
      normalizedLocales.some((c) => !i18nLocaleCodes.includes(c)) ||
      i18nLocaleCodes.some((c) => !normalizedLocales.includes(c))
    if (mismatch) {
      console.warn('[useSiteSeo] ⚠️ i18n.locales and runtimeConfig.public.locales diverge:', {
        i18n: i18nLocaleCodes,
        runtimeConfig: normalizedLocales
      })
    }
  }

  function setPageSeo(input: PageSeoInput) {
    // Mark that SEO was set for this route (used by seo-guard plugin)
    if (import.meta.client) {
      const seoFlag = useState<boolean>('__seo_set_for_route__', () => false)
      seoFlag.value = true
    }

    const {
      title,
      description,
      type = 'website',
      image,
      noindex = false,
      jsonLd = null,
      publishedTime,
      modifiedTime
    } = input

    const fullTitle = `${title} | ${siteConfig.name}`
    const ogImage = image
      ? toAbsoluteUrl(siteUrl, image)
      : toAbsoluteUrl(siteUrl, siteConfig.defaultOgImage)
    const canonical = toAbsoluteUrl(siteUrl, route.path)

    // Force noindex in non-production or if explicitly set
    const isProduction = import.meta.env?.PROD ?? process.env.NODE_ENV === 'production'
    const shouldNoindex = noindex || !isProduction
    const robotsContent = shouldNoindex ? 'noindex, nofollow' : 'index, follow'

    // Build hreflang alternates for all normalized locales
    const alternateLinks: Array<{ rel: string; hreflang: string; href: string }> = []

    for (const code of normalizedLocales) {
      const alternatePath = switchLocalePath(
        route.path,
        locale.value,
        code,
        defaultLocale,
        normalizedLocales
      )
      alternateLinks.push({
        rel: 'alternate',
        hreflang: localeMeta[code] || code,
        href: toAbsoluteUrl(siteUrl, alternatePath)
      })
    }

    // x-default points to default locale version
    const defaultPath = switchLocalePath(
      route.path,
      locale.value,
      defaultLocale,
      defaultLocale,
      normalizedLocales
    )
    alternateLinks.push({
      rel: 'alternate',
      hreflang: 'x-default',
      href: toAbsoluteUrl(siteUrl, defaultPath)
    })

    // ogLocale from localeMeta (replace - with _)
    const currentLocaleMeta = localeMeta[locale.value] || locale.value
    const ogLocale = currentLocaleMeta.replace('-', '_')

    // SEO Meta
    useSeoMeta({
      title: fullTitle,
      description,
      robots: robotsContent,
      ogTitle: fullTitle,
      ogDescription: description,
      ogImage,
      ogUrl: canonical,
      ogType: type,
      ogSiteName: siteConfig.name,
      ogLocale,
      twitterCard: 'summary_large_image',
      twitterTitle: fullTitle,
      twitterDescription: description,
      twitterImage: ogImage,
      twitterSite: siteConfig.twitterHandle
    })

    // Head: canonical + alternates + JSON-LD
    const headConfig: {
      link: Array<{ rel: string; href?: string; hreflang?: string }>
      script?: Array<{ type: string; children: string }>
    } = {
      link: [{ rel: 'canonical', href: canonical }, ...alternateLinks]
    }

    // JSON-LD (auto-generate for articles if not provided)
    let jsonLdScript: Record<string, unknown> | null = jsonLd

    if (!jsonLdScript && type === 'article') {
      jsonLdScript = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description,
        image: ogImage,
        url: canonical,
        datePublished: publishedTime,
        dateModified: modifiedTime || publishedTime,
        publisher: {
          '@type': 'Organization',
          name: siteConfig.name,
          url: siteUrl
        }
      }
    }

    if (jsonLdScript) {
      headConfig.script = [
        {
          type: 'application/ld+json',
          children: JSON.stringify(jsonLdScript)
        }
      ]
    }

    useHead(headConfig)
  }

  return { setPageSeo }
}
