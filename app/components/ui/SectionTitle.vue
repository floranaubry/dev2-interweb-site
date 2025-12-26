<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
}

defineProps<Props>()
</script>

<template>
  <div class="text-center">
    <h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
      {{ title }}
    </h2>
    <p v-if="subtitle" class="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
      {{ subtitle }}
    </p>
  </div>
</template>
