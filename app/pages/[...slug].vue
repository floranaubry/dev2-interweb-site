<script setup lang="ts">
/**
 * Site pages route (kind='site')
 * Handles: /:slug, /en/:slug, /nested/path, etc.
 * NO queryContent here - uses server API only
 */
import { loadPageOrThrow, forceNoindex } from '~/composables/usePageLoader'
import { usePageAlternates } from '~/composables/usePageAlternates'
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
  kind: 'site',
  slug,
  locale: locale.value
})

// Calculate packs used (single source of truth)
const packsUsed = getPacksUsed(page)

// Validate all packs early — DEV warn, PROD throw 500
assertAllPacksKnown(packsUsed, `page site/${slug}`)

// Build alternates (only for translations that exist)
const alternates = await usePageAlternates('site', slug, locale.value)

// Set SEO with verified alternates
setPageSeo({
  title: page.seo.title,
  description: page.seo.description,
  ...(page.seo.image && { image: page.seo.image }),
  noindex: forceNoindex('site', page.seo.noindex),
  alternates
})
</script>

<template>
  <ThemeScope :pack="page.packKey" :packs-used="packsUsed" :overrides="page.themeOverrides">
    <PageRenderer :page="page" />
  </ThemeScope>
</template>
