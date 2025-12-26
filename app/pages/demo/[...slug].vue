<script setup lang="ts">
/**
 * Demo pages route (kind='demo')
 * Handles: /demo/:slug, /en/demo/:slug, /demo/nested/path, etc.
 * noindex is ALWAYS forced for demo pages
 * NO queryContent here - uses server API only
 */
import { loadPageOrThrow, forceNoindex } from '~/composables/usePageLoader'
import PageRenderer from '~/components/renderer/PageRenderer.vue'
import ThemeScope from '~/components/renderer/ThemeScope.vue'
import { getPacksUsed } from '~/packs/getPacksUsed'
import { assertAllPacksKnown } from '~/packs/packRegistry'

const route = useRoute()
const { locale } = useI18n()
const { setPageSeo } = useSiteSeo()

// Extract slug from route params (supports nested paths)
const rawSlug = route.params.slug
const slug = Array.isArray(rawSlug) ? rawSlug.join('/') : rawSlug || ''

if (!slug) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found'
  })
}

// Load page via canonical API loader
const page = await loadPageOrThrow({
  kind: 'demo',
  slug,
  locale: locale.value
})

// Calculate packs used (single source of truth)
const packsUsed = getPacksUsed(page)

// Validate all packs early — DEV warn, PROD throw 500
assertAllPacksKnown(packsUsed, `page demo/${slug}`)

// Set SEO with forced noindex for demo pages
// No alternates for noindex pages (unnecessary, keeps it clean)
setPageSeo({
  title: page.seo.title,
  description: page.seo.description,
  ...(page.seo.image && { image: page.seo.image }),
  noindex: forceNoindex('demo', page.seo.noindex)
  // alternates: not provided → no hreflang for noindex pages
})
</script>

<template>
  <ThemeScope :pack="page.packKey" :packs-used="packsUsed" :overrides="page.themeOverrides">
    <PageRenderer :page="page" />
  </ThemeScope>
</template>
