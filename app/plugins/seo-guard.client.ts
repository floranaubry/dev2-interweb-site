/**
 * SEO Guard Plugin (DEV-only)
 *
 * 1. Warns if NUXT_PUBLIC_SITE_URL is still the placeholder value
 * 2. Warns if a page forgets to call setPageSeo()
 */
export default defineNuxtPlugin(() => {
  // Only run in development
  if (!import.meta.dev) return

  const runtimeConfig = useRuntimeConfig()
  const router = useRouter()

  // -------------------------------------------------------------------------
  // 1. Warn if siteUrl is placeholder (once)
  // -------------------------------------------------------------------------
  const siteUrl = runtimeConfig.public?.siteUrl as string
  if (siteUrl === 'https://example.com') {
    console.warn(
      '[SEO Guard] ⚠️ NUXT_PUBLIC_SITE_URL is still "https://example.com".\n' +
        'Set it to your real domain for correct canonical URLs and sitemap.'
    )
  }

  // -------------------------------------------------------------------------
  // 2. Check if setPageSeo() was called on each navigation
  // -------------------------------------------------------------------------
  const warnedRoutes = new Set<string>()

  router.beforeEach(() => {
    // Reset flag at start of navigation
    const seoFlag = useState<boolean>('__seo_set_for_route__', () => false)
    seoFlag.value = false
  })

  router.afterEach((to) => {
    // Skip internal routes (error pages, etc.)
    if (to.name === undefined || to.path.startsWith('/__')) return

    // Wait for page render to complete
    requestAnimationFrame(() => {
      setTimeout(() => {
        const seoFlag = useState<boolean>('__seo_set_for_route__')

        if (!seoFlag.value && !warnedRoutes.has(to.fullPath)) {
          warnedRoutes.add(to.fullPath)
          console.warn(
            `[SEO Guard] ⚠️ Page "${to.fullPath}" did not call setPageSeo().\n` +
              'All pages should use useSiteSeo().setPageSeo() for proper SEO.'
          )
        }
      }, 100) // Small delay to ensure setPageSeo had time to run
    })
  })
})
