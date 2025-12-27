// https://nuxt.com/docs/api/configuration/nuxt-config

// =============================================================================
// ENV PARSING HELPERS
// =============================================================================

function parseLocales(envValue: string | undefined, fallback: string[]): string[] {
  if (!envValue) return fallback
  return envValue
    .split(',')
    .map((l) => l.trim())
    .filter(Boolean)
}

function parseLocaleMeta(
  envValue: string | undefined,
  fallback: Record<string, string>
): Record<string, string> {
  if (!envValue) return fallback
  try {
    return JSON.parse(envValue)
  } catch {
    return fallback
  }
}

// =============================================================================
// CONFIGURATION CONSTANTS (Single Source of Truth)
// =============================================================================

// PROD URL: https://gointerweb.com
// Set NUXT_PUBLIC_SITE_URL in Vercel environment variables
const SITE_URL = process.env.NUXT_PUBLIC_SITE_URL || 'https://gointerweb.com'
const DEFAULT_LOCALE = process.env.NUXT_PUBLIC_DEFAULT_LOCALE || 'fr'
const LOCALES = parseLocales(process.env.NUXT_PUBLIC_LOCALES, ['fr', 'en'])
const LOCALE_META = parseLocaleMeta(process.env.NUXT_PUBLIC_LOCALE_META, {
  fr: 'fr-FR',
  en: 'en-US'
})

// Shell strict mode: when true, p/demo pages have shells forced to null
const SHELL_STRICT_PRIVATE = process.env.NUXT_PUBLIC_SHELL_STRICT_PRIVATE === 'true'

// Build i18n locales array from config
const i18nLocales = LOCALES.map((code) => ({
  code,
  language: LOCALE_META[code] || code,
  name: code.toUpperCase(),
  file: `${code}.json`
}))

// =============================================================================
// NUXT CONFIG
// =============================================================================

export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss', '@nuxt/content', '@nuxtjs/i18n', '@nuxtjs/robots'],

  css: ['~/assets/css/main.css'],

  typescript: {
    strict: true
  },

  // ---------------------------------------------------------------------------
  // RUNTIME CONFIG — Single Source of Truth
  // ---------------------------------------------------------------------------
  runtimeConfig: {
    public: {
      siteUrl: SITE_URL,
      defaultLocale: DEFAULT_LOCALE,
      locales: LOCALES,
      localeMeta: LOCALE_META,
      shellStrictPrivate: SHELL_STRICT_PRIVATE
    }
  },

  app: {
    head: {
      title: 'Interweb Site',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }]
    },
    // Simple page transitions
    pageTransition: { name: 'page', mode: 'out-in' }
  },

  devtools: { enabled: false },

  // ---------------------------------------------------------------------------
  // i18n — derived from runtimeConfig values
  // ---------------------------------------------------------------------------
  i18n: {
    locales: i18nLocales,
    defaultLocale: DEFAULT_LOCALE,
    strategy: 'prefix_except_default',
    langDir: '../i18n/locales',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      redirectOn: 'root'
    }
  },

  // ---------------------------------------------------------------------------
  // NITRO / BUILD STRATEGY — SSR on-demand ONLY
  // ---------------------------------------------------------------------------
  // ⚠️  DO NOT ADD prerender.routes or generate.routes
  //
  // Rationale (see docs/scale.md):
  // 1. Pages are rendered on-demand via SSR (no prerender bomb)
  // 2. Sitemap is generated dynamically (cached 10min)
  // 3. This scales to 10k+ pages without build time explosion
  // 4. p/demo pages are never indexed anyway
  //
  // If you need static generation for specific pages, use:
  //   nitro: { prerender: { routes: ['/specific-page'] } }
  // But avoid: crawlLinks, routes: ['/**'], or automatic discovery
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // Robots — Disallow /p/, /demo/, /dev/ + Sitemap (PROD only)
  // ---------------------------------------------------------------------------
  // NOTE: Using @nuxtjs/robots module for robots.txt generation
  // /p/* and /demo/* pages also have:
  //   - meta robots noindex (via useSiteSeo)
  //   - X-Robots-Tag header (via server middleware)
  robots: {
    groups: [
      {
        userAgent: '*',
        // In PROD: allow everything except private/demo/dev
        // In DEV: disallow everything
        allow: process.env.NODE_ENV === 'production' ? ['/'] : [],
        disallow:
          process.env.NODE_ENV === 'production' ? ['/p/', '/demo/', '/dev/', '/api/'] : ['/']
      }
    ],
    sitemap: process.env.NODE_ENV === 'production' ? `${SITE_URL}/sitemap.xml` : undefined
  }
})
