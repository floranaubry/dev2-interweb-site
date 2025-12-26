<script setup lang="ts">
/**
 * DEV ONLY: Shell Library Index
 *
 * Lists all registered shells with links to their preview pages.
 * NOT accessible in production (throws 404).
 */
import {
  getRegisteredShellIds,
  getShellEntry,
  listShellsBySlot
} from '~/components/renderer/ShellRegistry'

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
// SHELL DATA
// =============================================================================

const allShellIds = getRegisteredShellIds()

const headerShells = listShellsBySlot('header')
const footerShells = listShellsBySlot('footer')
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="border-b bg-white px-6 py-4">
      <div class="mx-auto max-w-4xl">
        <h1 class="text-2xl font-bold text-gray-900">🐚 Shell Library</h1>
        <p class="mt-1 text-sm text-gray-500">
          DEV ONLY — {{ allShellIds.length }} shells registered
        </p>
      </div>
    </header>

    <!-- Shell list -->
    <div class="mx-auto max-w-4xl p-6">
      <!-- Headers -->
      <div class="mb-8">
        <h2 class="mb-4 text-lg font-semibold text-gray-700">
          🔝 Headers
          <span class="ml-2 text-sm font-normal text-gray-400">({{ headerShells.length }})</span>
        </h2>

        <div class="grid gap-4 sm:grid-cols-2">
          <NuxtLink
            v-for="shell in headerShells"
            :key="shell.id"
            :to="`/dev/shells/${shell.id}`"
            class="group block rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div class="flex items-center justify-between">
              <code class="font-mono text-sm font-medium text-gray-900">{{ shell.id }}</code>
              <span class="text-gray-400 group-hover:text-blue-500">→</span>
            </div>
            <p class="mt-2 text-xs text-gray-500">{{ shell.fixtures.length }} fixture(s)</p>
          </NuxtLink>
        </div>

        <div
          v-if="headerShells.length === 0"
          class="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center text-gray-400"
        >
          No header shells registered
        </div>
      </div>

      <!-- Footers -->
      <div class="mb-8">
        <h2 class="mb-4 text-lg font-semibold text-gray-700">
          🔻 Footers
          <span class="ml-2 text-sm font-normal text-gray-400">({{ footerShells.length }})</span>
        </h2>

        <div class="grid gap-4 sm:grid-cols-2">
          <NuxtLink
            v-for="shell in footerShells"
            :key="shell.id"
            :to="`/dev/shells/${shell.id}`"
            class="group block rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div class="flex items-center justify-between">
              <code class="font-mono text-sm font-medium text-gray-900">{{ shell.id }}</code>
              <span class="text-gray-400 group-hover:text-blue-500">→</span>
            </div>
            <p class="mt-2 text-xs text-gray-500">{{ shell.fixtures.length }} fixture(s)</p>
          </NuxtLink>
        </div>

        <div
          v-if="footerShells.length === 0"
          class="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center text-gray-400"
        >
          No footer shells registered
        </div>
      </div>

      <!-- Quick links -->
      <div class="rounded-lg bg-white p-4 shadow-sm">
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
