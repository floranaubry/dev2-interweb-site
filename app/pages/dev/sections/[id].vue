<script setup lang="ts">
/**
 * DEV ONLY: Section Preview Route
 *
 * Renders a section with its fixtures for isolated development/testing.
 * NOT accessible in production (throws 404).
 *
 * URL: /dev/sections/:id (e.g., /dev/sections/hero.split)
 */
import {
  getSectionEntry,
  getRegisteredSectionIds,
  type SectionEntry
} from '~/components/renderer/SectionRegistry'
import ThemeScope from '~/components/renderer/ThemeScope.vue'
import { getKnownPacks } from '~/packs/packRegistry'

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
// ROUTE PARAMS
// =============================================================================

const route = useRoute()
const sectionId = computed(() => route.params.id as string)

// =============================================================================
// SECTION DATA
// =============================================================================

const sectionEntry = computed<SectionEntry | null>(() => {
  return getSectionEntry(sectionId.value)
})

const allSectionIds = getRegisteredSectionIds()

// Selected fixture index
const fixtureIndex = ref(0)

const currentFixture = computed(() => {
  if (!sectionEntry.value) return null
  return sectionEntry.value.fixtures[fixtureIndex.value] ?? sectionEntry.value.fixtures[0]
})

// Selected pack for preview (from registry)
const availablePacks = getKnownPacks()
const selectedPack = ref(availablePacks[0] || 'interweb')

// Packs used for on-demand loading
const packsUsed = computed(() => [selectedPack.value])
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="border-b bg-white px-6 py-4">
      <div class="mx-auto flex max-w-7xl items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-gray-900">🔧 Section Preview</h1>
          <p class="text-sm text-gray-500">DEV ONLY — Not accessible in production</p>
        </div>
        <NuxtLink to="/dev/sections" class="text-sm text-blue-600 hover:underline">
          ← All Sections
        </NuxtLink>
      </div>
    </header>

    <!-- Section not found -->
    <div v-if="!sectionEntry" class="mx-auto max-w-4xl p-8">
      <div class="rounded-lg border-2 border-dashed border-red-300 bg-red-50 p-8 text-center">
        <p class="text-lg font-bold text-red-700">❌ Section not found: {{ sectionId }}</p>
        <p class="mt-4 text-sm text-red-600">Available sections:</p>
        <ul class="mt-2 space-y-1">
          <li v-for="id in allSectionIds" :key="id">
            <NuxtLink :to="`/dev/sections/${id}`" class="font-mono text-blue-600 hover:underline">
              {{ id }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>

    <!-- Section found -->
    <div v-else class="mx-auto max-w-7xl p-6">
      <!-- Controls -->
      <div class="mb-6 flex flex-wrap items-center gap-4 rounded-lg bg-white p-4 shadow-sm">
        <!-- Section ID -->
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-700">Section:</span>
          <code class="rounded bg-gray-100 px-2 py-1 font-mono text-sm">{{ sectionId }}</code>
        </div>

        <!-- Fixture selector -->
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-700">Fixture:</span>
          <select
            v-model="fixtureIndex"
            class="rounded border px-2 py-1 text-sm"
            :disabled="sectionEntry.fixtures.length <= 1"
          >
            <option v-for="(_, idx) in sectionEntry.fixtures" :key="idx" :value="idx">
              #{{ idx + 1 }}
            </option>
          </select>
          <span class="text-xs text-gray-500">({{ sectionEntry.fixtures.length }} available)</span>
        </div>

        <!-- Pack selector (from registry) -->
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-700">Pack:</span>
          <select v-model="selectedPack" class="rounded border px-2 py-1 text-sm">
            <option v-for="pack in availablePacks" :key="pack" :value="pack">
              {{ pack }}
            </option>
          </select>
        </div>
      </div>

      <!-- Preview area -->
      <div class="overflow-hidden rounded-lg border shadow-lg">
        <ThemeScope :pack="selectedPack" :packs-used="packsUsed">
          <component
            :is="sectionEntry.component"
            v-bind="currentFixture as Record<string, unknown>"
          />
        </ThemeScope>
      </div>

      <!-- Props inspector -->
      <details class="mt-6 rounded-lg bg-white p-4 shadow-sm">
        <summary class="cursor-pointer font-medium text-gray-700">📋 Current Props</summary>
        <pre class="mt-4 overflow-auto rounded bg-gray-50 p-4 font-mono text-xs text-gray-800">{{
          JSON.stringify(currentFixture, null, 2)
        }}</pre>
      </details>
    </div>
  </div>
</template>
