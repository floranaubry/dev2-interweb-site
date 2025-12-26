<script setup lang="ts">
/**
 * header.interweb — Interweb Design System Navigation
 *
 * Pixel-perfect recreation of the design system nav.
 * Features:
 * - Glassmorphism nav bar
 * - Centered navigation links
 * - Theme toggle (sun/moon)
 * - CTA button
 */
import type { HeaderInterwebProps } from './schema'
import { useDarkMode } from '~/composables/useDarkMode'

const props = withDefaults(defineProps<HeaderInterwebProps>(), {
  logoText: 'interweb',
  logoHref: '/',
  links: () => [
    { label: 'Fonctionnalités', href: '#features' },
    { label: 'Comment ça marche', href: '#how' },
    { label: 'Avis', href: '#testimonials' },
    { label: 'Tarifs', href: '#pricing' }
  ],
  ctaLabel: 'Commencer',
  ctaHref: '#contact',
  enableThemeToggle: true
})

const { isDark, toggle: toggleTheme } = useDarkMode()

// Build proper link hrefs (for non-home pages, prefix with /)
const route = useRoute()
const isHome = computed(() => route.path === '/' || route.path === '')

function buildHref(href: string): string {
  // If it's an anchor link and we're not on home, build full path
  if (href.startsWith('#') && !isHome.value) {
    return `/${href}`
  }
  return href
}
</script>

<template>
  <nav class="nav" id="nav">
    <div class="nav__container">
      <div class="nav__bar">
        <!-- Logo -->
        <NuxtLink :to="logoHref" class="nav__logo">{{ logoText }}</NuxtLink>

        <!-- Links (Desktop) - Centered -->
        <div class="nav__links">
          <NuxtLink
            v-for="link in links"
            :key="link.href"
            :to="buildHref(link.href)"
            class="nav__link"
          >
            <span>{{ link.label }}</span>
          </NuxtLink>
        </div>

        <!-- Actions -->
        <div class="nav__actions">
          <!-- Theme Toggle -->
          <button
            v-if="enableThemeToggle"
            class="theme-toggle"
            aria-label="Changer de thème"
            @click="toggleTheme"
          >
            <!-- Sun icon (shown in light mode) -->
            <svg
              v-if="!isDark"
              class="sun-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path
                d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
              />
            </svg>
            <!-- Moon icon (shown in dark mode) -->
            <svg
              v-else
              class="moon-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          </button>

          <!-- CTA Button -->
          <NuxtLink :to="buildHref(ctaHref)" class="btn btn--primary btn--sm">
            <span>{{ ctaLabel }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>
