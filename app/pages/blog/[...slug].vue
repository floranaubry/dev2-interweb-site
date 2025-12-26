<script setup lang="ts">
/**
 * Blog Article — Single article view with Interweb Design System
 */
import ThemeScope from '~/components/renderer/ThemeScope.vue'
import HeaderInterweb from '~/shells/header.interweb/index.vue'
import FooterInterweb from '~/shells/footer.interweb/index.vue'

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

// Header config
const headerConfig = {
  logoText: 'interweb',
  logoHref: '/',
  links: [
    { label: 'Accueil', href: '/' },
    { label: 'Blog', href: '/blog' }
  ],
  ctaLabel: 'Contact',
  ctaHref: '/#contact',
  enableThemeToggle: true
}

// Footer config
const footerConfig = {
  brand: 'interweb',
  tagline: 'Création de sites internet professionnels. Première version gratuite, sans engagement.',
  copyright: '© 2025 Interweb. Tous droits réservés.',
  links: [
    { label: 'Confidentialité', href: '/confidentialite' },
    { label: 'Mentions légales', href: '/mentions-legales' }
  ]
}

// Build blog list URL
const blogUrl = computed(() => locale.value === 'fr' ? '/blog' : `/${locale.value}/blog`)
</script>

<template>
  <ThemeScope pack="interweb" :packs-used="['interweb']">
    <!-- Header -->
    <HeaderInterweb v-bind="headerConfig" />

    <!-- Main Content -->
    <main class="section section--hero">
      <div class="container container--narrow">
        <article v-if="article" class="article">
          <!-- Article Header -->
          <header class="article__header text-center mb-12">
            <!-- Draft badge -->
            <div v-if="article.draft" class="mb-4">
              <span class="badge badge--primary">
                {{ $t('draft') }}
              </span>
            </div>

            <!-- Meta info -->
            <div class="flex items-center justify-center gap-3 mb-6">
              <span v-if="article.category" class="badge">
                {{ article.category }}
              </span>
              <span class="text-caption">•</span>
              <time :datetime="article.date" class="text-caption">
                {{ formatDate(article.date) }}
              </time>
            </div>

            <!-- Title -->
            <h1 class="text-display mb-6">
              {{ article.title }}
            </h1>

            <!-- Description -->
            <p class="text-body text-body--large max-w-2xl mx-auto mb-8">
              {{ article.description }}
            </p>

            <!-- Tags -->
            <div class="flex flex-wrap justify-center gap-2">
              <span
                v-for="tag in article.tags"
                :key="tag"
                class="pill"
              >
                {{ tag }}
              </span>
            </div>
          </header>

          <!-- Article Content -->
          <div class="article__content">
            <ContentRenderer :value="article" />
          </div>

          <!-- Article Footer -->
          <footer class="article__footer mt-16 pt-8" style="border-top: 1px solid var(--color-divider);">
            <NuxtLink :to="blogUrl" class="btn btn--secondary">
              <span class="btn__icon" style="margin-right: 0.5rem;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </span>
              <span>{{ $t('blogTitle') }}</span>
            </NuxtLink>
          </footer>
        </article>
      </div>
    </main>

    <!-- Footer -->
    <FooterInterweb v-bind="footerConfig" />
  </ThemeScope>
</template>

<style scoped>
/* Article Content Styling - Prose-like */
.article__content {
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
}

.article__content :deep(h1),
.article__content :deep(h2),
.article__content :deep(h3),
.article__content :deep(h4),
.article__content :deep(h5),
.article__content :deep(h6) {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-tight);
  margin-top: 2em;
  margin-bottom: 0.75em;
  line-height: var(--line-height-snug);
}

.article__content :deep(h1) {
  font-size: var(--font-size-3xl);
}

.article__content :deep(h2) {
  font-size: var(--font-size-2xl);
  padding-bottom: 0.5em;
  border-bottom: 1px solid var(--color-divider);
}

.article__content :deep(h3) {
  font-size: var(--font-size-xl);
}

.article__content :deep(h4) {
  font-size: var(--font-size-lg);
}

.article__content :deep(p) {
  margin-bottom: 1.25em;
}

.article__content :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color var(--duration-fast) var(--ease-default);
}

.article__content :deep(a:hover) {
  color: var(--color-primary-hover);
}

.article__content :deep(strong) {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

.article__content :deep(em) {
  font-style: italic;
}

.article__content :deep(ul),
.article__content :deep(ol) {
  margin-bottom: 1.25em;
  padding-left: 1.5em;
}

.article__content :deep(li) {
  margin-bottom: 0.5em;
}

.article__content :deep(ul li) {
  list-style-type: disc;
}

.article__content :deep(ol li) {
  list-style-type: decimal;
}

.article__content :deep(blockquote) {
  margin: 1.5em 0;
  padding: 1em 1.5em;
  background: var(--color-surface-hover);
  border-left: 4px solid var(--color-primary);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  font-style: italic;
  color: var(--color-text-tertiary);
}

.article__content :deep(code) {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 0.875em;
  padding: 0.2em 0.4em;
  background: var(--color-surface-hover);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
}

.article__content :deep(pre) {
  margin: 1.5em 0;
  padding: 1em 1.25em;
  background: var(--color-bg-inverse);
  border-radius: var(--radius-lg);
  overflow-x: auto;
}

.article__content :deep(pre code) {
  padding: 0;
  background: transparent;
  color: var(--color-text-inverse);
  font-size: 0.875em;
  line-height: 1.7;
}

.article__content :deep(hr) {
  margin: 2em 0;
  border: none;
  border-top: 1px solid var(--color-divider);
}

.article__content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-lg);
  margin: 1.5em 0;
}

.article__content :deep(table) {
  width: 100%;
  margin: 1.5em 0;
  border-collapse: collapse;
}

.article__content :deep(th),
.article__content :deep(td) {
  padding: 0.75em 1em;
  border: 1px solid var(--color-border);
  text-align: left;
}

.article__content :deep(th) {
  background: var(--color-surface-hover);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}
</style>
