<script setup lang="ts">
const { locale } = useI18n()
const route = useRoute()
const { setPageSeo } = useSiteSeo()

// Build content path from slug
const slug = route.params.slug as string[]
const contentPath = `/${locale.value}/blog/${slug.join('/')}`

// Fetch article
const { data: article, error } = await useAsyncData(`article-${contentPath}`, () =>
  queryContent(contentPath).findOne()
)

// Handle 404
if (error.value || !article.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Article not found'
  })
}

// Set SEO from frontmatter
setPageSeo({
  title: article.value.title ?? 'Article',
  description: article.value.description ?? '',
  type: 'article',
  image: article.value.cover,
  noindex: article.value.draft === true,
  publishedTime: article.value.date,
  modifiedTime: article.value.updated || article.value.date
})

// Format date
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <article v-if="article" class="py-16">
    <Container>
      <header class="mx-auto max-w-3xl text-center">
        <div v-if="article.draft" class="mb-4">
          <span class="rounded bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
            {{ $t('draft') }}
          </span>
        </div>

        <div class="flex items-center justify-center gap-4 text-sm text-slate-500">
          <span>{{ article.category }}</span>
          <span>•</span>
          <time :datetime="article.date">{{ formatDate(article.date) }}</time>
        </div>

        <h1 class="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          {{ article.title }}
        </h1>

        <p class="mt-4 text-xl text-slate-600">
          {{ article.description }}
        </p>

        <div class="mt-6 flex flex-wrap justify-center gap-2">
          <span
            v-for="tag in article.tags"
            :key="tag"
            class="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600"
          >
            {{ tag }}
          </span>
        </div>
      </header>

      <div class="prose prose-slate mx-auto mt-12 max-w-3xl">
        <ContentRenderer :value="article" />
      </div>

      <footer class="mx-auto mt-16 max-w-3xl border-t border-slate-200 pt-8">
        <NuxtLink
          :to="locale === 'fr' ? '/blog' : `/${locale}/blog`"
          class="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          ← {{ $t('blogTitle') }}
        </NuxtLink>
      </footer>
    </Container>
  </article>
</template>
