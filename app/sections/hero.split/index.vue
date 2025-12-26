<script setup lang="ts">
import type { HeroSplitProps } from './schema'

defineProps<HeroSplitProps>()
</script>

<template>
  <div
    class="py-16 sm:py-24"
    :style="{
      backgroundColor: 'rgb(var(--bg))',
      color: 'rgb(var(--fg))'
    }"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid items-center gap-12 lg:grid-cols-2">
        <!-- Text content -->
        <div class="text-center lg:text-left">
          <h1 class="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {{ title }}
          </h1>
          <p v-if="subtitle" class="mt-6 text-lg leading-8" :style="{ color: 'rgb(var(--muted))' }">
            {{ subtitle }}
          </p>
          <div v-if="ctaLabel && ctaHref" class="mt-10">
            <NuxtLink
              :to="ctaHref"
              class="inline-flex items-center px-6 py-3 text-base font-semibold transition-opacity hover:opacity-90"
              :style="{
                backgroundColor: 'rgb(var(--primary))',
                color: 'rgb(var(--primary-fg))',
                borderRadius: 'var(--radius)'
              }"
            >
              {{ ctaLabel }}
            </NuxtLink>
          </div>
        </div>

        <!-- Image (optional) -->
        <div v-if="imageUrl" class="flex justify-center lg:justify-end">
          <img
            :src="imageUrl"
            :alt="title"
            class="w-full max-w-md object-cover shadow-xl"
            :style="{ borderRadius: 'var(--radius)' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
