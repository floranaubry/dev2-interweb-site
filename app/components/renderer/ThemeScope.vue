<script setup lang="ts">
/**
 * ThemeScope — Applies pack theming and CSS overrides
 *
 * V3 — Hardened:
 * - Loads pack CSS via useHead() (SSR-safe, no FOUC)
 * - FAIL FAST: unknown pack = DEV warn / PROD throw (before render)
 * - Packs are validated at route level, but we double-check here as safety net
 */
import type { CssOverrides } from '~/schema/page.schema'
import { isKnownPack, getPackHref, assertKnownPack } from '~/packs/packRegistry'

interface Props {
  /** Primary pack for this scope */
  pack?: string
  /** All packs used on the page (for loading) — calculated at route level */
  packsUsed?: string[]
  /** CSS variable overrides */
  overrides?: CssOverrides
  /** If true, renders as inline element (for section-level wrapping) */
  inline?: boolean
}

const props = defineProps<Props>()
const isDev = import.meta.dev

// =============================================================================
// PACK VALIDATION — Fail fast (safety net, main validation is at route level)
// =============================================================================

// Validate primary pack
assertKnownPack(props.pack, 'ThemeScope.pack')

// Validate all packs in packsUsed
if (props.packsUsed) {
  for (const packKey of props.packsUsed) {
    assertKnownPack(packKey, 'ThemeScope.packsUsed')
  }
}

// =============================================================================
// PACK CSS LOADING (On-demand via useHead)
// =============================================================================

// Collect all packs to load (already validated above)
const packsToLoad = computed(() => {
  const packs = new Set<string>()

  // Add primary pack
  if (props.pack && isKnownPack(props.pack)) {
    packs.add(props.pack)
  }

  // Add all used packs (from page-level)
  if (props.packsUsed) {
    for (const p of props.packsUsed) {
      if (p && isKnownPack(p)) packs.add(p)
    }
  }

  return Array.from(packs)
})

// Generate link tags for packs (SSR-safe)
const packLinks = computed(() => {
  return packsToLoad.value.map((packKey) => ({
    rel: 'stylesheet',
    href: getPackHref(packKey),
    key: `pack-${packKey}` // Prevents duplicates
  }))
})

// Inject pack stylesheets via useHead (SSR-safe, deduped by key)
useHead({
  link: packLinks
})

// =============================================================================
// CSS OVERRIDES
// =============================================================================

const inlineStyle = computed(() => {
  if (!props.overrides) return undefined

  const styles: Record<string, string> = {}
  for (const [key, value] of Object.entries(props.overrides)) {
    if (key.startsWith('--')) {
      styles[key] = value
    } else if (isDev) {
      console.warn(`[ThemeScope] Invalid override key "${key}" — must start with "--"`)
    }
  }

  return Object.keys(styles).length > 0 ? styles : undefined
})

// =============================================================================
// DEV WARNINGS
// =============================================================================

if (isDev && !props.pack && !props.inline && !props.packsUsed?.length) {
  console.warn('[ThemeScope] No pack provided — sections may not have themed styles')
}
</script>

<template>
  <div v-if="!inline" :data-pack="pack" :style="inlineStyle" class="theme-scope">
    <slot />
  </div>
  <div v-else :data-pack="pack" :style="inlineStyle" class="theme-scope-section">
    <slot />
  </div>
</template>
