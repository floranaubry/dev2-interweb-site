<script setup lang="ts">
/**
 * Layout Primitive: Stack
 *
 * A vertical stacking container with configurable spacing and alignment.
 * Used for composing flexible page layouts without templates.
 */
import type { LayoutStackProps } from './schema'

const props = withDefaults(defineProps<LayoutStackProps>(), {
  gap: 8,
  align: 'start',
  maxWidth: '4xl',
  paddingY: 16,
  paddingX: 4
})

// Build dynamic classes
const containerClasses = computed(() => {
  const classes: string[] = ['flex', 'flex-col', 'mx-auto']

  // Gap
  classes.push(`gap-${props.gap}`)

  // Alignment
  switch (props.align) {
    case 'center':
      classes.push('items-center', 'text-center')
      break
    case 'end':
      classes.push('items-end', 'text-right')
      break
    default:
      classes.push('items-start', 'text-left')
  }

  // Max width
  if (props.maxWidth !== 'full') {
    classes.push(`max-w-${props.maxWidth}`)
  }

  // Padding
  classes.push(`py-${props.paddingY}`, `px-${props.paddingX}`)

  return classes.join(' ')
})
</script>

<template>
  <div
    class="layout-stack"
    :style="{
      backgroundColor: 'rgb(var(--bg))',
      color: 'rgb(var(--fg))'
    }"
  >
    <div :class="containerClasses">
      <!-- Render content if provided -->
      <div v-if="content" class="prose max-w-none" v-html="content" />

      <!-- Slot for child components (when used programmatically) -->
      <slot v-else />
    </div>
  </div>
</template>
