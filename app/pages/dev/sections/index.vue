<script setup lang="ts">
/**
 * DEV ONLY: Section Library Index
 *
 * Lists all registered sections with links to their preview pages.
 * NOT accessible in production (throws 404).
 */
import { getRegisteredSectionIds, getSectionEntry } from '~/components/renderer/SectionRegistry'

// =============================================================================
// PRODUCTION GUARD — 404 if not DEV
// =============================================================================

if (!import.meta.dev) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Not Found'
  })
}

// =============================================================================
// SEO — noindex always
// =============================================================================

useHead({
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})

// =============================================================================
// SECTION DATA
// =============================================================================

const allSectionIds = getRegisteredSectionIds()

// Group sections by category as array of [category, ids[]]
const sectionCategories = computed(() => {
  const grouped: Record<string, string[]> = {}

  for (const id of allSectionIds) {
    const category = id.split('.')[0] || 'other'
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push(id)
  }

  return Object.entries(grouped)
})
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="border-b bg-white px-6 py-4">
      <div class="mx-auto max-w-4xl">
        <h1 class="text-2xl font-bold text-gray-900">🔧 Section Library</h1>
        <p class="mt-1 text-sm text-gray-500">
          DEV ONLY — {{ allSectionIds.length }} sections registered
        </p>
      </div>
    </header>

    <!-- Section list -->
    <div class="mx-auto max-w-4xl p-6">
      <div v-for="[category, sections] in sectionCategories" :key="category" class="mb-8">
        <h2 class="mb-4 text-lg font-semibold capitalize text-gray-700">
          {{ category }}
          <span class="ml-2 text-sm font-normal text-gray-400">({{ sections.length }})</span>
        </h2>

        <div class="grid gap-4 sm:grid-cols-2">
          <NuxtLink
            v-for="id in sections"
            :key="id"
            :to="`/dev/sections/${id}`"
            class="group block rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div class="flex items-center justify-between">
              <code class="font-mono text-sm font-medium text-gray-900">{{ id }}</code>
              <span class="text-gray-400 group-hover:text-blue-500">→</span>
            </div>
            <p class="mt-2 text-xs text-gray-500">
              {{ getSectionEntry(id)?.fixtures.length ?? 0 }} fixture(s)
            </p>
          </NuxtLink>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="allSectionIds.length === 0"
        class="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center"
      >
        <p class="text-gray-500">No sections registered yet.</p>
        <p class="mt-2 text-sm text-gray-400">Add sections in SectionRegistry.ts</p>
      </div>
    </div>
  </div>
</template>
