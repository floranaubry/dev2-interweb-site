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

const SITE_URL = process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com'
const DEFAULT_LOCALE = process.env.NUXT_PUBLIC_DEFAULT_LOCALE || 'fr'
const LOCALES = parseLocales(process.env.NUXT_PUBLIC_LOCALES, ['fr', 'en'])
const LOCALE_META = parseLocaleMeta(process.env.NUXT_PUBLIC_LOCALE_META, {
  fr: 'fr-FR',
  en: 'en-US'
})

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
      localeMeta: LOCALE_META
    }
  },

  app: {
    head: {
      title: 'Nuxt Massive Site',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }]
    }
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
  // Robots — dev: Disallow, prod: Allow + Sitemap
  // ---------------------------------------------------------------------------
  robots: {
    groups: [
      {
        userAgent: '*',
        allow: process.env.NODE_ENV === 'production' ? ['/'] : [],
        disallow: process.env.NODE_ENV === 'production' ? [] : ['/']
      }
    ],
    sitemap: process.env.NODE_ENV === 'production' ? `${SITE_URL}/sitemap.xml` : undefined
  }
})
