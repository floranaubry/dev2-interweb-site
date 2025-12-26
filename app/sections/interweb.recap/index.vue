<script setup lang="ts">
/**
 * interweb.recap — KPI Recap Section
 *
 * Pixel-perfect recreation of the design system KPI cards.
 */
import type { InterwebRecapProps } from './schema'

withDefaults(defineProps<InterwebRecapProps>(), {
  cards: () => []
})

function getCardClasses(card: { type?: string; wide?: boolean }): string {
  const classes = ['kpi-card']
  const type = card.type || 'glass'
  if (type === 'glass') classes.push('kpi-card--glass')
  if (type === 'inverted') classes.push('kpi-card--inverted')
  if (card.wide) classes.push('col-span-2')
  return classes.join(' ')
}
</script>

<template>
  <section :id="anchorId" class="section">
    <div class="container">
      <!-- KPI Grid -->
      <div class="grid--3 grid">
        <div v-for="(card, index) in cards" :key="index" :class="getCardClasses(card)">
          <!-- Glass card layers -->
          <template v-if="card.type === 'glass' && card.gradient">
            <div :class="`gradient-layer gradient-layer--${card.gradient}`"></div>
            <div class="glass-overlay"></div>
          </template>

          <div class="content-layer">
            <div class="kpi-card__metric">
              <span class="kpi-card__value">{{ card.value }}</span>
              <span v-if="card.unit" class="kpi-card__unit">{{ card.unit }}</span>
              <span v-if="card.label" class="kpi-card__label">{{ card.label }}</span>
            </div>
            <p class="kpi-card__description">{{ card.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
