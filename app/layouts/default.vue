<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <div class="flex min-h-screen flex-col bg-slate-50 text-slate-900">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <NuxtLink
          to="/"
          class="text-xl font-bold text-slate-900 transition-colors hover:text-slate-700"
        >
          Nuxt Massive Site
        </NuxtLink>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-slate-200 bg-white">
      <div class="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
        © {{ year }} Nuxt Massive Site. All rights reserved.
      </div>
    </footer>
  </div>
</template>
