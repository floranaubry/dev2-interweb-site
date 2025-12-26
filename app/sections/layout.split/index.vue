<script setup lang="ts">
/**
 * Layout Primitive: Split
 *
 * A two-column layout with configurable ratio, gap, and alignment.
 * Used for side-by-side content (text + image, text + text, etc.)
 */
import type { LayoutSplitProps } from './schema'

const props = withDefaults(defineProps<LayoutSplitProps>(), {
  ratio: '1:1',
  reverse: false,
  gap: 12,
  align: 'center',
  paddingY: 16
})

// Grid column classes based on ratio
const gridClasses = computed(() => {
  const classes: string[] = ['grid', 'mx-auto', 'max-w-7xl', 'px-4', 'sm:px-6', 'lg:px-8']

  // Gap
  classes.push(`gap-${props.gap}`)

  // Vertical alignment
  switch (props.align) {
    case 'start':
      classes.push('items-start')
      break
    case 'end':
      classes.push('items-end')
      break
    default:
      classes.push('items-center')
  }

  // Responsive: stack on mobile, columns on lg
  classes.push('lg:grid-cols-2')

  return classes.join(' ')
})

// Column width styles based on ratio
const leftColStyle = computed(() => {
  const ratioMap: Record<string, string> = {
    '1:1': '1fr',
    '1:2': '1fr',
    '2:1': '2fr',
    '1:3': '1fr',
    '3:1': '3fr'
  }
  return { flex: ratioMap[props.ratio] || '1fr' }
})

const rightColStyle = computed(() => {
  const ratioMap: Record<string, string> = {
    '1:1': '1fr',
    '1:2': '2fr',
    '2:1': '1fr',
    '1:3': '3fr',
    '3:1': '1fr'
  }
  return { flex: ratioMap[props.ratio] || '1fr' }
})
</script>

<template>
  <div
    class="layout-split"
    :class="`py-${paddingY}`"
    :style="{
      backgroundColor: 'rgb(var(--bg))',
      color: 'rgb(var(--fg))'
    }"
  >
    <div :class="gridClasses">
      <!-- Left column (or right if reversed) -->
      <div
        :class="{ 'order-2 lg:order-1': !reverse, 'order-1 lg:order-2': reverse }"
        :style="leftColStyle"
      >
        <img
          v-if="leftImage"
          :src="leftImage"
          alt=""
          class="w-full rounded-lg object-cover shadow-lg"
          :style="{ borderRadius: 'var(--radius)' }"
        />
        <div v-else-if="left" class="prose max-w-none" v-html="left" />
        <slot v-else name="left" />
      </div>

      <!-- Right column (or left if reversed) -->
      <div
        :class="{ 'order-1 lg:order-2': !reverse, 'order-2 lg:order-1': reverse }"
        :style="rightColStyle"
      >
        <img
          v-if="rightImage"
          :src="rightImage"
          alt=""
          class="w-full rounded-lg object-cover shadow-lg"
          :style="{ borderRadius: 'var(--radius)' }"
        />
        <div v-else-if="right" class="prose max-w-none" v-html="right" />
        <slot v-else name="right" />
      </div>
    </div>
  </div>
</template>
