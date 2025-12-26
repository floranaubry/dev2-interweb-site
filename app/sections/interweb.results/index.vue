<script setup lang="ts">
/**
 * interweb.results — Case Studies Section
 *
 * Pixel-perfect recreation of the design system results section.
 */
import type { InterwebResultsProps } from './schema'

withDefaults(defineProps<InterwebResultsProps>(), {
  titleHtml:
    'Des résultats <span class="text-muted" style="font-style: italic; font-weight: 500;">concrets</span>',
  subtitle: 'Quelques exemples de transformations réalisées.',
  cases: () => [],
  showCta: true,
  ctaLabel: 'Obtenir mon site gratuitement',
  ctaHref: '#contact',
  ctaHelperText: "C'est gratuit et sans engagement."
})

function getGradientVar(gradient?: string): string {
  return `var(--gradient-${gradient || 'blue'})`
}
</script>

<template>
  <section :id="anchorId" class="section" style="background: var(--color-bg-secondary)">
    <div class="container">
      <!-- Section Header (left-aligned) -->
      <div class="mb-8" style="max-width: 40rem">
        <h2 class="text-headline mb-2" v-html="titleHtml"></h2>
        <p class="text-body">{{ subtitle }}</p>
      </div>

      <!-- Cases Grid -->
      <div class="grid--3 grid">
        <article v-for="(caseItem, index) in cases" :key="index" class="case-card">
          <div
            class="card__gradient"
            :style="{ background: getGradientVar(caseItem.gradient) }"
          ></div>
          <div class="card__content">
            <div class="case-card__header">
              <span class="case-card__category">{{ caseItem.category }}</span>
              <h3 class="case-card__title">{{ caseItem.title }}</h3>
            </div>
            <div class="case-card__body">
              <p class="case-card__before">{{ caseItem.before }}</p>
              <p class="case-card__after">{{ caseItem.after }}</p>
            </div>
            <div class="case-card__footer">
              <p class="case-card__result">{{ caseItem.result }}</p>
            </div>
          </div>
        </article>
      </div>

      <!-- CTA -->
      <div v-if="showCta" class="mt-10 flex flex-col items-center text-center">
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
        <p class="text-caption mt-3">{{ ctaHelperText }}</p>
      </div>
    </div>
  </section>
</template>
