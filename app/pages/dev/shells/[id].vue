<script setup lang="ts">
/**
 * DEV ONLY: Shell Preview Route
 *
 * Renders a shell with its fixtures for isolated development/testing.
 * NOT accessible in production (throws 404).
 *
 * URL: /dev/shells/:id (e.g., /dev/shells/header.default)
 */
import {
  getShellEntry,
  getRegisteredShellIds,
  type ShellEntry
} from '~/components/renderer/ShellRegistry'
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
const shellId = computed(() => route.params.id as string)

// =============================================================================
// SHELL DATA
// =============================================================================

const shellEntry = computed<ShellEntry | null>(() => {
  return getShellEntry(shellId.value)
})

const allShellIds = getRegisteredShellIds()

// Selected fixture index
const fixtureIndex = ref(0)

const currentFixture = computed(() => {
  if (!shellEntry.value) return null
  return shellEntry.value.fixtures[fixtureIndex.value] ?? shellEntry.value.fixtures[0]
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
          <h1 class="text-xl font-bold text-gray-900">🐚 Shell Preview</h1>
          <p class="text-sm text-gray-500">DEV ONLY — Not accessible in production</p>
        </div>
        <NuxtLink to="/dev/shells" class="text-sm text-blue-600 hover:underline">
          ← All Shells
        </NuxtLink>
      </div>
    </header>

    <!-- Shell not found -->
    <div v-if="!shellEntry" class="mx-auto max-w-4xl p-8">
      <div class="rounded-lg border-2 border-dashed border-red-300 bg-red-50 p-8 text-center">
        <p class="text-lg font-bold text-red-700">❌ Shell not found: {{ shellId }}</p>
        <p class="mt-4 text-sm text-red-600">Available shells:</p>
        <ul class="mt-2 space-y-1">
          <li v-for="id in allShellIds" :key="id">
            <NuxtLink :to="`/dev/shells/${id}`" class="font-mono text-blue-600 hover:underline">
              {{ id }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>

    <!-- Shell found -->
    <div v-else class="mx-auto max-w-7xl p-6">
      <!-- Controls -->
      <div class="mb-6 flex flex-wrap items-center gap-4 rounded-lg bg-white p-4 shadow-sm">
        <!-- Shell ID -->
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-700">Shell:</span>
          <code class="rounded bg-gray-100 px-2 py-1 font-mono text-sm">{{ shellId }}</code>
          <span class="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
            {{ shellEntry.slot }}
          </span>
        </div>

        <!-- Fixture selector -->
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-700">Fixture:</span>
          <select
            v-model="fixtureIndex"
            class="rounded border px-2 py-1 text-sm"
            :disabled="shellEntry.fixtures.length <= 1"
          >
            <option v-for="(_, idx) in shellEntry.fixtures" :key="idx" :value="idx">
              #{{ idx + 1 }}
            </option>
          </select>
          <span class="text-xs text-gray-500">({{ shellEntry.fixtures.length }} available)</span>
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
            :is="shellEntry.component"
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

      <!-- Quick links -->
      <div class="mt-6 rounded-lg bg-white p-4 shadow-sm">
        <h3 class="font-medium text-gray-700">Related</h3>
        <div class="mt-2 flex gap-4">
          <NuxtLink to="/dev/sections" class="text-sm text-blue-600 hover:underline">
            → Section Library
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
