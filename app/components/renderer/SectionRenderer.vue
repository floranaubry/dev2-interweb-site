<script setup lang="ts">
/**
 * SectionRenderer — Renders a single section from PageDef
 *
 * V4.1 — Industrialized + Hardened:
 * - Validates props against section schema BEFORE rendering
 * - DEV: shows visual error box for invalid props/packs
 * - PROD: throws for invalid props (500)
 * - PACK VALIDATION: DEV warn only (fail-fast happens at route/ThemeScope level)
 *
 * Override Rules (V3.1):
 * - Page overrides → applied by ThemeScope at page level (NOT here)
 * - Section overrides → applied HERE, only from section.overrides
 */
import type { SectionDef } from '~/schema/page.schema'
import { getSectionComponent, getSectionSchema, hasSectionComponent } from './SectionRegistry'
import { isKnownPack } from '~/packs/packRegistry'

interface Props {
  section: SectionDef
  pagePack?: string
}

const props = defineProps<Props>()
const isDev = import.meta.dev

// =============================================================================
// COMPONENT RESOLUTION
// =============================================================================

const resolvedComponent = computed(() => {
  return getSectionComponent(props.section.id)
})

// =============================================================================
// PROPS VALIDATION
// =============================================================================

interface ValidationState {
  valid: boolean
  error: string | null
  validatedProps: Record<string, unknown>
}

const validation = computed<ValidationState>(() => {
  const schema = getSectionSchema(props.section.id)

  // No schema found = section not registered
  if (!schema) {
    return {
      valid: false,
      error: `Section "${props.section.id}" not found in registry`,
      validatedProps: {}
    }
  }

  // Validate props
  const result = schema.safeParse(props.section.props)

  if (result.success) {
    return {
      valid: true,
      error: null,
      validatedProps: result.data as Record<string, unknown>
    }
  }

  // Format Zod error
  const issues = result.error.issues
    .map((i) => `${i.path.length > 0 ? i.path.join('.') + ': ' : ''}${i.message}`)
    .join('\n')

  return {
    valid: false,
    error: issues,
    validatedProps: {}
  }
})

// =============================================================================
// PROD ERROR — Throw on invalid props (no silent failures)
// =============================================================================

if (!isDev && !validation.value.valid) {
  throw createError({
    statusCode: 500,
    statusMessage: `Invalid section props for "${props.section.id}": ${validation.value.error}`
  })
}

// =============================================================================
// PACK VALIDATION — DEV warn only (route/ThemeScope are fail-fast in PROD)
// =============================================================================

// Check section.pack validity in DEV only — don't throw in PROD here
// Fail-fast for unknown packs happens at route level and ThemeScope level
if (isDev && props.section.pack && !isKnownPack(props.section.pack)) {
  console.warn(
    `[SectionRenderer] Unknown pack "${props.section.pack}" in section "${props.section.id}" — known packs will be validated at route level`
  )
}

// =============================================================================
// THEME OVERRIDES
// =============================================================================

const effectivePack = computed(() => {
  return props.section.pack || props.pagePack
})

const sectionStyle = computed(() => {
  const overrides = props.section.overrides
  if (!overrides) return undefined

  const styles: Record<string, string> = {}
  for (const [key, value] of Object.entries(overrides)) {
    if (key.startsWith('--')) {
      styles[key] = value
    } else if (isDev) {
      console.warn(
        `[SectionRenderer] Invalid override key "${key}" in section "${props.section.id}" — must start with "--"`
      )
    }
  }

  return Object.keys(styles).length > 0 ? styles : undefined
})
</script>

<template>
  <section :data-pack="effectivePack" :style="sectionStyle" class="section-renderer">
    <!-- ===================================================================== -->
    <!-- VALID: Render component with validated props -->
    <!-- ===================================================================== -->
    <component
      :is="resolvedComponent"
      v-if="validation.valid && resolvedComponent"
      v-bind="validation.validatedProps"
    />

    <!-- ===================================================================== -->
    <!-- INVALID PROPS: DEV error box -->
    <!-- ===================================================================== -->
    <div
      v-else-if="isDev && !validation.valid"
      class="border-4 border-dashed border-red-500 bg-red-50 p-8"
    >
      <p class="font-mono text-lg font-bold text-red-700">❌ Section Props Invalid</p>
      <p class="mt-2 font-mono text-sm text-red-600">
        id: <strong>{{ section.id }}</strong>
      </p>
      <pre class="mt-4 overflow-auto rounded bg-red-100 p-4 font-mono text-xs text-red-800">{{
        validation.error
      }}</pre>
      <details class="mt-4">
        <summary class="cursor-pointer font-mono text-xs text-red-600">Show received props</summary>
        <pre class="mt-2 overflow-auto rounded bg-red-100 p-4 font-mono text-xs text-red-800">{{
          JSON.stringify(section.props, null, 2)
        }}</pre>
      </details>
    </div>

    <!-- ===================================================================== -->
    <!-- COMPONENT NOT FOUND: DEV warning -->
    <!-- ===================================================================== -->
    <div
      v-else-if="isDev && !hasSectionComponent(section.id)"
      class="border-4 border-dashed border-orange-500 bg-orange-100 p-8 text-center"
    >
      <p class="font-mono text-lg font-bold text-orange-700">⚠️ Section not found in registry</p>
      <p class="mt-2 font-mono text-sm text-orange-600">
        id: <strong>{{ section.id }}</strong>
      </p>
      <p class="mt-1 font-mono text-xs text-orange-500">
        Register it in SectionRegistry.ts with key "{{ section.id }}"
      </p>
    </div>

    <!-- PROD: Nothing rendered for missing/invalid sections (error already thrown) -->
  </section>
</template>
