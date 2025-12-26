<script setup lang="ts">
const { locale, t } = useI18n()
const { setPageSeo } = useSiteSeo()

// Set page SEO
setPageSeo({
  title: t('blogTitle'),
  description: t('blogDescription'),
  type: 'website'
})

// Query articles for current locale
const isProduction = process.env.NODE_ENV === 'production'

const { data: articles } = await useAsyncData(`blog-list-${locale.value}`, () =>
  queryContent(locale.value, 'blog')
    .where(isProduction ? { draft: { $ne: true } } : {})
    .sort({ date: -1 })
    .find()
)

// Build article URL based on locale
function getArticleUrl(article: { _path?: string }) {
  if (!article._path) return '/blog'
  // _path is like /fr/blog/hello-world, we need /blog/hello-world for FR
  // and /en/blog/hello-world for EN
  const pathWithoutLocale = article._path.replace(`/${locale.value}`, '')
  return locale.value === 'fr' ? pathWithoutLocale : `/${locale.value}${pathWithoutLocale}`
}
</script>

<template>
  <div class="py-16">
    <Container>
      <SectionTitle :title="t('blogTitle')" :subtitle="t('blogDescription')" />

      <div
        v-if="articles && articles.length > 0"
        class="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
      >
        <article
          v-for="article in articles"
          :key="article._path"
          class="group rounded-lg border border-slate-200 bg-white p-6 transition-shadow hover:shadow-lg"
        >
          <div class="flex items-start justify-between">
            <span
              v-if="article.draft"
              class="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800"
            >
              {{ t('draft') }}
            </span>
            <span v-else class="text-xs text-slate-500">
              {{ new Date(article.date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US') }}
            </span>
          </div>

          <h2 class="mt-4 text-xl font-semibold text-slate-900 group-hover:text-blue-600">
            <NuxtLink :to="getArticleUrl(article)">
              {{ article.title }}
            </NuxtLink>
          </h2>

          <p class="mt-2 line-clamp-3 text-slate-600">
            {{ article.description }}
          </p>

          <div class="mt-4 flex flex-wrap gap-2">
            <span
              v-for="tag in article.tags"
              :key="tag"
              class="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
            >
              {{ tag }}
            </span>
          </div>

          <NuxtLink
            :to="getArticleUrl(article)"
            class="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            {{ t('readMore') }} →
          </NuxtLink>
        </article>
      </div>

      <p v-else class="mt-12 text-center text-slate-500">
        {{ t('noArticles') }}
      </p>
    </Container>
  </div>
</template>
