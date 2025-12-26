<script setup lang="ts">
/**
 * Blog Index — List of articles with Interweb Design System
 */
import ThemeScope from '~/components/renderer/ThemeScope.vue'
import HeaderInterweb from '~/shells/header.interweb/index.vue'
import FooterInterweb from '~/shells/footer.interweb/index.vue'

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
  const pathWithoutLocale = article._path.replace(`/${locale.value}`, '')
  return locale.value === 'fr' ? pathWithoutLocale : `/${locale.value}${pathWithoutLocale}`
}

// Format date elegantly
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
</script>

<template>
  <ThemeScope pack="interweb" :packs-used="['interweb']">
    <!-- Header -->
    <HeaderInterweb v-bind="headerConfig" />

    <!-- Main Content -->
    <main class="section section--hero">
      <div class="container">
        <!-- Hero Header -->
        <header class="text-center mb-12">
          <div class="pill mb-6 mx-auto" style="width: fit-content;">
            <span class="pulse"></span>
            <span>Articles & Guides</span>
          </div>
          <h1 class="text-display mb-4">{{ t('blogTitle') }}</h1>
          <p class="text-body text-body--large max-w-2xl mx-auto">
            {{ t('blogDescription') }}
          </p>
        </header>

        <!-- Articles Grid -->
        <div v-if="articles && articles.length > 0" class="grid grid--3 mt-12">
          <article
            v-for="article in articles"
            :key="article._path"
            class="card"
          >
            <!-- Gradient Layer -->
            <div class="card__gradient gradient-layer gradient-layer--blue"></div>
            
            <!-- Content -->
            <div class="card__content flex flex-col" style="height: 100%;">
              <!-- Header with date/draft -->
              <div class="flex items-center justify-between mb-4">
                <span
                  v-if="article.draft"
                  class="badge badge--primary"
                >
                  {{ t('draft') }}
                </span>
                <span v-else class="text-caption">
                  {{ formatDate(article.date) }}
                </span>
                
                <!-- Category badge -->
                <span v-if="article.category" class="badge">
                  {{ article.category }}
                </span>
              </div>

              <!-- Title -->
              <h2 class="text-title mb-3">
                <NuxtLink :to="getArticleUrl(article)" class="blog-link">
                  {{ article.title }}
                </NuxtLink>
              </h2>

              <!-- Description -->
              <p class="text-body mb-4" style="flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                {{ article.description }}
              </p>

              <!-- Tags -->
              <div class="flex flex-wrap gap-2 mb-4">
                <span
                  v-for="tag in article.tags"
                  :key="tag"
                  class="badge"
                >
                  {{ tag }}
                </span>
              </div>

              <!-- Read more link -->
              <NuxtLink :to="getArticleUrl(article)" class="btn btn--ghost" style="margin-top: auto; width: fit-content;">
                <span>{{ t('readMore') }}</span>
                <span class="btn__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </NuxtLink>
            </div>
          </article>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center mt-12">
          <div class="card mx-auto" style="max-width: 400px;">
            <div class="card__content text-center">
              <div class="icon-box mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
              </div>
              <p class="text-body">{{ t('noArticles') }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <FooterInterweb v-bind="footerConfig" />
  </ThemeScope>
</template>

<style scoped>
.blog-link {
  color: var(--color-text-primary);
  transition: color var(--duration-fast) var(--ease-default);
}
.blog-link:hover {
  color: var(--color-primary);
}
</style>
