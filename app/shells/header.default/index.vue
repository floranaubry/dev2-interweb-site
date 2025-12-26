<script setup lang="ts">
/**
 * header.default — Default header shell component
 *
 * Placeholder UI — replace with actual design
 */
import type { HeaderDefaultProps } from './schema'

const props = withDefaults(defineProps<HeaderDefaultProps>(), {
  logoText: 'Logo',
  logoHref: '/',
  navItems: () => []
})
</script>

<template>
  <header class="border-b border-gray-200 bg-white">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
      <!-- Logo -->
      <NuxtLink :to="props.logoHref" class="text-lg font-bold text-gray-900">
        {{ props.logoText }}
      </NuxtLink>

      <!-- Navigation -->
      <nav v-if="props.navItems.length > 0" class="flex items-center gap-6">
        <NuxtLink
          v-for="item in props.navItems"
          :key="item.href"
          :to="item.href"
          class="text-sm text-gray-600 transition-colors hover:text-gray-900"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
