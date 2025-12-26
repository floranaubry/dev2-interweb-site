<script setup lang="ts">
/**
 * interweb.hero — Hero Section
 *
 * Pixel-perfect recreation of the design system hero.
 * Features:
 * - Status pill with pulse
 * - Display headline (HTML support)
 * - Subheadline
 * - Primary CTA with icon
 * - Trust indicators with checkmarks
 */
import type { InterwebHeroProps } from './schema'

withDefaults(defineProps<InterwebHeroProps>(), {
  showPill: true,
  pillText: 'Disponible maintenant',
  titleHtml: 'Votre site professionnel,<br>prêt en <span class="text-accent">24 heures.</span>',
  subtitleHtml:
    'Un site internet clair, sérieux et moderne, conçu pour des professionnels comme vous. <strong style="color: var(--color-text-primary);">Vous n\'avez rien à faire</strong>, on s\'occupe de tout.',
  ctaLabel: 'Obtenir mon site gratuitement',
  ctaHref: '#contact',
  trustStatement:
    '<strong style="color: var(--color-text-primary);">+ de 150 professionnels</strong> nous font confiance',
  trustItems: () => [
    { label: 'Sans engagement' },
    { label: 'Satisfait ou remboursé' },
    { label: 'Support inclus' }
  ]
})
</script>

<template>
  <section :id="anchorId" class="section section--hero">
    <div class="container text-center">
      <!-- Status Pill -->
      <div v-if="showPill" class="pill mx-auto mb-6" style="display: inline-flex">
        <span class="pulse"></span>
        <span class="text-label">{{ pillText }}</span>
      </div>

      <!-- Headline -->
      <!-- eslint-disable-next-line vue/no-v-html -->
      <h1 class="text-display mx-auto mb-6" style="max-width: 900px" v-html="titleHtml"></h1>

      <!-- Subheadline -->
      <p
        class="text-body text-body--large mx-auto mb-8 max-w-2xl"
        style="color: var(--color-text-secondary)"
        v-html="subtitleHtml"
      ></p>

      <!-- CTA Button -->
      <div class="mb-10 flex justify-center">
        <NuxtLink :to="ctaHref" class="btn btn--primary btn--lg">
          <span>{{ ctaLabel }}</span>
          <span class="btn__icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </NuxtLink>
      </div>

      <!-- Trust Indicators -->
      <div class="flex flex-col items-center gap-4">
        <p class="text-caption" v-html="trustStatement"></p>
        <div class="flex flex-wrap items-center justify-center gap-6">
          <div v-for="item in trustItems" :key="item.label" class="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-success)"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="opacity: 0.7"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span class="text-caption">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
