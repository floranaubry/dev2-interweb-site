<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  ctaLabel?: string
  ctaHref?: string
}

defineProps<Props>()
</script>

<template>
  <section class="bg-gradient-to-b from-slate-900 to-slate-800 py-20 sm:py-32">
    <Container>
      <SectionTitle
        :title="title"
        :subtitle="subtitle"
        class="[&_h2]:text-white [&_p]:text-slate-300"
      />
      <div v-if="ctaLabel && ctaHref" class="mt-10 flex justify-center">
        <NuxtLink
          :to="ctaHref"
          class="inline-flex items-center rounded-lg bg-white px-6 py-3 text-base font-medium text-slate-900 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          {{ ctaLabel }}
        </NuxtLink>
      </div>
    </Container>
  </section>
</template>
