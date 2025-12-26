<script setup lang="ts">
/**
 * header.minimal — Minimal header shell component
 *
 * A simple header with just a logo, no navigation.
 * Placeholder UI — replace with actual design
 */
import type { HeaderMinimalProps } from './schema'

const props = withDefaults(defineProps<HeaderMinimalProps>(), {
  logoText: 'Logo',
  logoHref: '/'
})
</script>

<template>
  <header class="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
    <div class="mx-auto flex max-w-7xl items-center justify-center px-4 py-4">
      <NuxtLink :to="props.logoHref" class="text-xl font-semibold text-gray-800">
        {{ props.logoText }}
      </NuxtLink>
    </div>
  </header>
</template>
