<script setup lang="ts">
/**
 * footer.interweb — Interweb Design System Footer
 *
 * Pixel-perfect recreation of the design system footer.
 * Features:
 * - Glass card styling
 * - Brand + tagline
 * - Copyright + links
 */
import type { FooterInterwebProps } from './schema'

withDefaults(defineProps<FooterInterwebProps>(), {
  brand: 'interweb',
  tagline: 'Création de sites internet professionnels. Première version gratuite, sans engagement.',
  copyright: '© 2025 Interweb. Tous droits réservés.',
  links: () => [
    { label: 'Confidentialité', href: '/confidentialite' },
    { label: 'CGU', href: '/cgu' },
    { label: 'CGV', href: '/cgv' },
    { label: 'Mentions légales', href: '/mentions-legales' }
  ]
})
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer__card">
        <div class="footer__top">
          <div class="footer__brand">{{ brand }}</div>
          <p class="footer__tagline">{{ tagline }}</p>
        </div>
        <div class="footer__bottom">
          <p class="footer__copyright">{{ copyright }}</p>
          <div class="footer__links">
            <NuxtLink v-for="link in links" :key="link.href" :to="link.href" class="footer__link">
              {{ link.label }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
