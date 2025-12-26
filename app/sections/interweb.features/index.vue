<script setup lang="ts">
/**
 * interweb.features — Features Section
 *
 * Pixel-perfect recreation of the design system features grid.
 * Features:
 * - Section header with headline + subtitle
 * - 4-column grid of feature cards
 * - Gradient backgrounds per card
 * - Icon boxes with SVG icons
 */
import type { InterwebFeaturesProps } from './schema'

withDefaults(defineProps<InterwebFeaturesProps>(), {
  titleHtml: 'Pour qui est fait <span class="text-accent">Interweb</span> ?',
  subtitle: 'Pour les professionnels qui veulent un site internet efficace, sans prise de tête.',
  cards: () => []
})

function getGradientVar(gradient?: string): string {
  return `var(--gradient-${gradient || 'blue'})`
}
</script>

<template>
  <section :id="anchorId" class="section">
    <div class="container">
      <!-- Section Header -->
      <div class="mb-12 text-center">
        <h2 class="text-headline mb-4" v-html="titleHtml"></h2>
        <p class="text-body mx-auto max-w-xl">{{ subtitle }}</p>
      </div>

      <!-- Feature Cards Grid -->
      <div class="grid--4 grid">
        <div v-for="(card, index) in cards" :key="index" class="card">
          <div class="card__gradient" :style="{ background: getGradientVar(card.gradient) }"></div>
          <div class="card__content">
            <div class="icon-box mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path :d="card.iconPath" />
              </svg>
            </div>
            <h3 class="text-title mb-2">{{ card.title }}</h3>
            <p class="text-caption">{{ card.text }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
