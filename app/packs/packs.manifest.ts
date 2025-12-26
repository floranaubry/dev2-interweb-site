/**
 * packs.manifest.ts
 *
 * DATA-ONLY manifest for Style Packs
 * ⚠️  NO NUXT DEPENDENCIES — Safe for Node.js scripts
 *
 * This is the SINGLE SOURCE OF TRUTH for pack keys.
 * Used by:
 * - scripts/guard-pages.ts (CI validation)
 * - scripts/guard-packs.mjs (CI validation)
 * - app/packs/packRegistry.ts (runtime, imports from here)
 */

// =============================================================================
// KNOWN PACKS (Single Source of Truth)
// =============================================================================

/**
 * List of all known pack keys
 * Add new packs here when creating them
 */
export const KNOWN_PACKS = ['interweb', 'pizza'] as const

export type PackKey = (typeof KNOWN_PACKS)[number]

// =============================================================================
// PURE HELPERS (No Nuxt, No side effects)
// =============================================================================

/**
 * Check if a pack key is registered
 */
export function isKnownPack(packKey: string): packKey is PackKey {
  return KNOWN_PACKS.includes(packKey as PackKey)
}

/**
 * Get all known pack keys (for guards and iteration)
 * Returns sorted array for deterministic output
 */
export function getKnownPacks(): readonly string[] {
  return [...KNOWN_PACKS].sort()
}

/**
 * Get the public href for a pack CSS file
 * @param packKey - The pack key
 * @returns URL path to the pack CSS (e.g., "/packs/interweb.css")
 */
export function getPackHref(packKey: string): string {
  return `/packs/${packKey}.css`
}
