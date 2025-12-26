<script setup lang="ts">
/**
 * ShellRenderer — Renders a shell component (header or footer)
 *
 * V1.1 — Hardened:
 * - Validates props against shell schema BEFORE rendering
 * - Validates slot ↔ prefix match (header.* in header, footer.* in footer)
 * - DEV: shows visual error box for invalid props/unknown shells/slot mismatch
 * - PROD: throws error (500) — client-safe via failHard()
 */
import type { ShellComponent } from '~/schema/page.schema'
import { getShellComponent, getShellSchema, hasShell, getShellEntry } from './ShellRegistry'
import {
  failHard,
  isValidShellSlot,
  getExpectedSlotForShellId,
  type ShellSlot
} from '~/utils/runtimeError'

interface Props {
  slot: 'header' | 'footer'
  shellDef: ShellComponent | null | undefined
}

const props = defineProps<Props>()
const isDev = import.meta.dev

// =============================================================================
// NULL CHECK — render nothing if shell is null/undefined
// =============================================================================

const shouldRender = computed(() => {
  return props.shellDef !== null && props.shellDef !== undefined
})

// =============================================================================
// COMPONENT RESOLUTION
// =============================================================================

const shellId = computed(() => props.shellDef?.id ?? null)

const resolvedComponent = computed(() => {
  if (!shellId.value) return null
  return getShellComponent(shellId.value)
})

// =============================================================================
// SLOT VALIDATION — shell.header.* in header slot, shell.footer.* in footer slot
// =============================================================================

interface SlotValidation {
  valid: boolean
  error: string | null
}

const slotValidation = computed<SlotValidation>(() => {
  if (!shellId.value) {
    return { valid: true, error: null }
  }

  if (isValidShellSlot(shellId.value, props.slot as ShellSlot)) {
    return { valid: true, error: null }
  }

  const expectedSlot = getExpectedSlotForShellId(shellId.value)
  const error = expectedSlot
    ? `Shell "${shellId.value}" is a ${expectedSlot} shell but used in ${props.slot} slot`
    : `Shell "${shellId.value}" must start with "header." or "footer."`

  return { valid: false, error }
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
  if (!shellId.value) {
    return { valid: true, error: null, validatedProps: {} }
  }

  const schema = getShellSchema(shellId.value)

  // No schema found = shell not registered
  if (!schema) {
    return {
      valid: false,
      error: `Shell "${shellId.value}" not found in registry`,
      validatedProps: {}
    }
  }

  // Validate props
  const result = schema.safeParse(props.shellDef?.props ?? {})

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
// Combined validity for rendering
// =============================================================================

const isFullyValid = computed(() => {
  return validation.value.valid && slotValidation.value.valid
})

// =============================================================================
// PROD ERROR — Throw on invalid shell (client-safe via failHard)
// =============================================================================

if (!isDev && shouldRender.value) {
  // Slot mismatch = fail hard
  if (!slotValidation.value.valid) {
    failHard(`Invalid shell for ${props.slot}: ${slotValidation.value.error}`)
  }

  // Props invalid or shell not found = fail hard
  if (!validation.value.valid) {
    failHard(`Invalid shell for ${props.slot}: ${validation.value.error}`)
  }
}
</script>

<template>
  <!-- Not rendering if shellDef is null/undefined -->
  <template v-if="shouldRender">
    <!-- ===================================================================== -->
    <!-- VALID: Render component with validated props -->
    <!-- ===================================================================== -->
    <component
      :is="resolvedComponent"
      v-if="isFullyValid && resolvedComponent"
      v-bind="validation.validatedProps"
    />

    <!-- ===================================================================== -->
    <!-- SLOT MISMATCH: DEV error box -->
    <!-- ===================================================================== -->
    <div
      v-else-if="isDev && !slotValidation.valid"
      class="border-4 border-dashed border-orange-500 bg-orange-50 p-8 text-center"
    >
      <p class="font-mono text-lg font-bold text-orange-700">⚠️ Shell Slot Mismatch</p>
      <p class="mt-2 font-mono text-sm text-orange-600">
        slot: <strong>{{ slot }}</strong> • id: <strong>{{ shellId }}</strong>
      </p>
      <p class="mt-2 font-mono text-xs text-orange-500">{{ slotValidation.error }}</p>
      <p class="mt-4 font-mono text-xs text-orange-400">
        Rule: header.* shells → header slot, footer.* shells → footer slot
      </p>
    </div>

    <!-- ===================================================================== -->
    <!-- SHELL NOT FOUND: DEV error box -->
    <!-- ===================================================================== -->
    <div
      v-else-if="isDev && shellId && !hasShell(shellId)"
      class="border-4 border-dashed border-red-500 bg-red-50 p-8 text-center"
    >
      <p class="font-mono text-lg font-bold text-red-700">❌ Shell not found in registry</p>
      <p class="mt-2 font-mono text-sm text-red-600">
        slot: <strong>{{ slot }}</strong> • id: <strong>{{ shellId }}</strong>
      </p>
      <p class="mt-1 font-mono text-xs text-red-500">
        Register it in ShellRegistry.ts with key "{{ shellId }}"
      </p>
    </div>

    <!-- ===================================================================== -->
    <!-- INVALID PROPS: DEV error box -->
    <!-- ===================================================================== -->
    <div
      v-else-if="isDev && !validation.valid"
      class="border-4 border-dashed border-red-500 bg-red-50 p-8"
    >
      <p class="font-mono text-lg font-bold text-red-700">❌ Shell Props Invalid</p>
      <p class="mt-2 font-mono text-sm text-red-600">
        slot: <strong>{{ slot }}</strong> • id: <strong>{{ shellId }}</strong>
      </p>
      <pre class="mt-4 overflow-auto rounded bg-red-100 p-4 font-mono text-xs text-red-800">{{
        validation.error
      }}</pre>
      <details class="mt-4">
        <summary class="cursor-pointer font-mono text-xs text-red-600">Show received props</summary>
        <pre class="mt-2 overflow-auto rounded bg-red-100 p-4 font-mono text-xs text-red-800">{{
          JSON.stringify(shellDef?.props, null, 2)
        }}</pre>
      </details>
    </div>

    <!-- PROD: Nothing rendered for missing/invalid shells (error already thrown) -->
  </template>
</template>
