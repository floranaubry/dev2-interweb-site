import type { PageAlternate } from '~/composables/useSiteSeo'

/**
 * Build page alternates by checking which translations exist
 *
 * Only generates hreflang for pages that actually exist.
 * Uses SSR-safe useRequestFetch to check via internal API.
 */
export async function usePageAlternates(
  kind: 'site' | 'p' | 'demo',
  slug: string,
  currentLocale: string
): Promise<PageAlternate[]> {
  const runtimeConfig = useRuntimeConfig()
  const defaultLocale = (runtimeConfig.public?.defaultLocale as string) || 'fr'
  const locales = (runtimeConfig.public?.locales as string[]) || ['fr', 'en']

  const alternates: PageAlternate[] = []
  const requestFetch = useRequestFetch()

  // Check each locale for existence
  for (const locale of locales) {
    // Always include current locale (we know it exists)
    if (locale === currentLocale) {
      const path = buildLocalePath(kind, slug, locale, defaultLocale)
      alternates.push({ locale, path })
      continue
    }

    // Check if translation exists
    try {
      const result = await requestFetch<{ exists: boolean }>('/api/__page__/exists', {
        query: { kind, slug, locale }
      })

      if (result.exists) {
        const path = buildLocalePath(kind, slug, locale, defaultLocale)
        alternates.push({ locale, path })
      }
    } catch {
      // Translation doesn't exist or error - skip
    }
  }

  return alternates
}

/**
 * Build the public URL path for a page
 * Respects prefix_except_default strategy
 */
function buildLocalePath(
  kind: 'site' | 'p' | 'demo',
  slug: string,
  locale: string,
  defaultLocale: string
): string {
  // Site pages: /:slug or /:locale/:slug
  // P pages: /p/:slug or /:locale/p/:slug
  // Demo pages: /demo/:slug or /:locale/demo/:slug

  const kindPrefix = kind === 'site' ? '' : `/${kind}`
  const basePath = `${kindPrefix}/${slug}`

  if (locale === defaultLocale) {
    return basePath
  }

  return `/${locale}${basePath}`
}
