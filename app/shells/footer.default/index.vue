<script setup lang="ts">
/**
 * footer.default — Default footer shell component
 *
 * Placeholder UI — replace with actual design
 */
import type { FooterDefaultProps } from './schema'

const props = withDefaults(defineProps<FooterDefaultProps>(), {
  companyName: 'Company',
  year: () => new Date().getFullYear(),
  links: () => []
})
</script>

<template>
  <footer class="border-t border-gray-200 bg-gray-50">
    <div
      class="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-6 sm:flex-row sm:justify-between"
    >
      <!-- Copyright -->
      <p class="text-sm text-gray-500">
        © {{ props.year }} {{ props.companyName }}. All rights reserved.
      </p>

      <!-- Links -->
      <nav v-if="props.links.length > 0" class="flex items-center gap-4">
        <NuxtLink
          v-for="link in props.links"
          :key="link.href"
          :to="link.href"
          class="text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </div>
  </footer>
</template>
