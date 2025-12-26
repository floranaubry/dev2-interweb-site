import { type PageDef, type PageKind, forceNoindex } from '~/schema/page.schema'

// =============================================================================
// PAGE LOADER COMPOSABLE (SSR + Client)
// =============================================================================

export interface LoadPageParams {
  kind: PageKind
  slug: string
  locale: string
}

// Re-export forceNoindex for use in routes
export { forceNoindex }

// DEV-only SSR log (once per process, not per HMR reload)
const g = globalThis as Record<string, unknown>
if (import.meta.dev && import.meta.server && !g.__pageLoaderLogged) {
  g.__pageLoaderLogged = true
  console.log('[PageLoader] SSR using request-bound fetch (useRequestFetch)')
}

/**
 * Load a page definition
 *
 * Uses useRequestFetch() which is request-bound on server:
 * - Prevents external HTTP calls (direct handler invocation)
 * - Forwards cookies and headers from the original request
 * - Works identically on client (standard fetch behavior)
 */
export function usePageLoader(params: LoadPageParams) {
  const { kind, slug, locale } = params
  const cacheKey = `page-${kind}-${slug}-${locale}`

  // Request-bound fetch: SSR uses internal handler, client uses HTTP
  const requestFetch = useRequestFetch()

  return useAsyncData(
    cacheKey,
    async () => {
      try {
        const page = await requestFetch<PageDef>('/api/__page__/get', {
          query: { kind, slug, locale }
        })
        return page
      } catch {
        // Return null; caller decides (loadPageOrThrow throws 404)
        return null
      }
    },
    {
      // Cache on client navigation
      getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
    }
  )
}

/**
 * Type-safe wrapper that throws 404 if page not found
 */
export async function loadPageOrThrow(params: LoadPageParams): Promise<PageDef> {
  const { data, error } = await usePageLoader(params)

  if (error.value || !data.value) {
    throw createError({
      statusCode: 404,
      statusMessage: `Page not found: ${params.kind}/${params.slug}`
    })
  }

  return data.value
}
