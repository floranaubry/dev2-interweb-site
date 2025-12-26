<script setup lang="ts">
/**
 * Home page route ("/")
 *
 * Renders the Page Builder home page from:
 * - content/{locale}/pages/site/index.yaml
 *
 * This is a dedicated entrypoint for the home page.
 * The [...slug].vue catch-all handles other site pages.
 */
import { loadPageOrThrow, forceNoindex } from '~/composables/usePageLoader'
import { usePageAlternates } from '~/composables/usePageAlternates'
import PageRenderer from '~/components/renderer/PageRenderer.vue'
import ThemeScope from '~/components/renderer/ThemeScope.vue'
import { getPacksUsed } from '~/packs/getPacksUsed'
import { assertAllPacksKnown } from '~/packs/packRegistry'

const { locale } = useI18n()
const { setPageSeo } = useSiteSeo()

// Home page uses slug 'index' in the content structure
const slug = 'index'

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
