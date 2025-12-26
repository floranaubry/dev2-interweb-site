<script setup lang="ts">
import type { FaqSimpleProps } from './schema'

defineProps<FaqSimpleProps>()
</script>

<template>
  <div
    class="py-16 sm:py-24"
    :style="{
      backgroundColor: 'rgb(var(--bg))',
      color: 'rgb(var(--fg))'
    }"
  >
    <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <!-- Title -->
      <h2 v-if="title" class="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
        {{ title }}
      </h2>

      <!-- FAQ Items -->
      <dl class="space-y-8">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="border-b pb-8"
          :style="{ borderColor: 'rgb(var(--muted) / 0.3)' }"
        >
          <dt class="text-lg font-semibold">
            {{ item.q }}
          </dt>
          <dd class="mt-3 leading-7" :style="{ color: 'rgb(var(--muted))' }">
            {{ item.a }}
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>
