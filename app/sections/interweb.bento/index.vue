<script setup lang="ts">
/**
 * interweb.bento — Bento Grid Section
 *
 * Pixel-perfect recreation of the design system bento grid.
 * Features:
 * - 2x2 bento grid
 * - Gradient backgrounds per card
 * - Custom visuals (avatars, guarantee badge, pricing card, calendar)
 */
import type { InterwebBentoProps } from './schema'

withDefaults(defineProps<InterwebBentoProps>(), {
  titleHtml: 'Pourquoi choisir <span class="text-accent">Interweb</span> ?',
  subtitle: 'Ce qui nous distingue des autres solutions.',
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
      <div class="mb-10 flex flex-col gap-4" style="max-width: 600px">
        <h2 class="text-headline" v-html="titleHtml"></h2>
        <p class="text-body">{{ subtitle }}</p>
      </div>

      <!-- Bento Grid -->
      <div class="bento bento--2x2">
        <div v-for="(card, index) in cards" :key="index" class="bento-card">
          <div
            class="bento-card__gradient"
            :style="{ background: getGradientVar(card.gradient) }"
          ></div>
          <div class="bento-card__content">
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
            <h3 class="text-title mb-3">{{ card.title }}</h3>
            <p class="text-body">{{ card.text }}</p>
          </div>

          <!-- Visual: Team Avatars -->
          <div v-if="card.visualType === 'avatars'" class="bento-card__visual hide-mobile">
            <div class="avatar-group mb-4">
              <div
                class="avatar-group__item avatar-placeholder"
                style="background: linear-gradient(135deg, #0071e3, #5856d6)"
              ></div>
              <div
                class="avatar-group__item avatar-placeholder"
                style="background: linear-gradient(135deg, #30d158, #00c7be)"
              ></div>
              <div
                class="avatar-group__item avatar-placeholder"
                style="background: linear-gradient(135deg, #ff9f0a, #ff3b30)"
              ></div>
            </div>
            <span class="badge badge--primary">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
                />
              </svg>
              Fait main
            </span>
          </div>

          <!-- Visual: Guarantee Badge -->
          <div v-if="card.visualType === 'guarantee'" class="bento-card__visual hide-mobile">
            <span class="badge badge--success" style="padding: var(--space-3) var(--space-4)">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="m9 11 3 3L22 4" />
              </svg>
              30 jours satisfait ou remboursé
            </span>
          </div>

          <!-- Visual: Pricing Mini Card -->
          <div v-if="card.visualType === 'pricing'" class="bento-card__visual hide-mobile">
            <div class="mini-card" style="width: 200px">
              <div class="mini-card__header">
                <span
                  class="text-caption"
                  style="font-weight: 600; color: var(--color-text-primary)"
                  >Tarif V1</span
                >
              </div>
              <div class="mini-card__body text-center">
                <div class="mb-1 flex items-center justify-center gap-2">
                  <span class="text-caption" style="text-decoration: line-through; opacity: 0.5"
                    >1500€</span
                  >
                  <span class="text-caption">→</span>
                  <span style="font-size: 2rem; font-weight: 800; color: var(--color-success)"
                    >0€</span
                  >
                </div>
                <span class="text-caption">pour votre première version</span>
              </div>
              <div class="mini-card__footer justify-center">
                <span class="text-label text-success">Sans engagement ✓</span>
              </div>
            </div>
          </div>

          <!-- Visual: Calendar -->
          <div v-if="card.visualType === 'calendar'" class="bento-card__visual hide-mobile">
            <div class="mini-card" style="width: 220px">
              <div class="mini-card__header">
                <span
                  class="text-caption"
                  style="font-weight: 600; color: var(--color-text-primary)"
                  >Décembre 2025</span
                >
              </div>
              <div class="mini-card__body">
                <div
                  style="
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 4px;
                    margin-bottom: 8px;
                  "
                >
                  <span class="text-label text-center" style="font-size: 9px">L</span>
                  <span class="text-label text-center" style="font-size: 9px">M</span>
                  <span class="text-label text-center" style="font-size: 9px">M</span>
                  <span class="text-label text-center" style="font-size: 9px">J</span>
                  <span class="text-label text-center" style="font-size: 9px">V</span>
                  <span class="text-label text-center" style="font-size: 9px">S</span>
                  <span class="text-label text-center" style="font-size: 9px">D</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px">
                  <span class="text-caption text-center" style="padding: 4px">22</span>
                  <span class="text-caption text-center" style="padding: 4px">23</span>
                  <span class="text-caption text-center" style="padding: 4px">24</span>
                  <span
                    class="text-center"
                    style="
                      padding: 4px;
                      background: var(--color-primary);
                      color: white;
                      border-radius: 6px;
                      font-size: 13px;
                      font-weight: 500;
                    "
                    >25</span
                  >
                  <span
                    class="text-center"
                    style="
                      padding: 4px;
                      background: var(--color-success-alpha);
                      color: var(--color-success);
                      border-radius: 6px;
                      font-size: 13px;
                      font-weight: 500;
                    "
                    >26</span
                  >
                  <span class="text-caption text-center" style="padding: 4px">27</span>
                  <span class="text-caption text-center" style="padding: 4px">28</span>
                </div>
              </div>
              <div class="mini-card__footer">
                <div class="flex items-center gap-1">
                  <span
                    style="
                      width: 8px;
                      height: 8px;
                      background: var(--color-primary);
                      border-radius: 50%;
                    "
                  ></span>
                  <span class="text-caption" style="font-size: 10px">Demande</span>
                </div>
                <div class="flex items-center gap-1">
                  <span
                    style="
                      width: 8px;
                      height: 8px;
                      background: var(--color-success);
                      border-radius: 50%;
                    "
                  ></span>
                  <span class="text-label text-success" style="font-size: 10px">Site prêt</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
