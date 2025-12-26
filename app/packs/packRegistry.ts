// =============================================================================
// PACK REGISTRY — Runtime utilities for Style Packs
// =============================================================================

/**
 * This file provides RUNTIME utilities for pack validation.
 * The source of truth for pack keys is in packs.manifest.ts
 *
 * Use this file for:
 * - Runtime validation with Nuxt-aware error handling (assertKnownPack)
 *
 * For script/CI usage, import directly from packs.manifest.ts
 */

// Re-export everything from manifest (single source of truth)
export {
  KNOWN_PACKS,
  type PackKey,
  isKnownPack,
  getKnownPacks,
  getPackHref
} from './packs.manifest'

// Import for local use
import { KNOWN_PACKS, isKnownPack } from './packs.manifest'

/**
 * Assert a pack is known — FAIL FAST in PROD (client-safe)
 *
 * Behavior:
 * - If packKey is empty/undefined → returns (no error)
 * - If packKey is known → returns
 * - If packKey is unknown:
 *   - DEV: console.warn only (no throw, helps dev flow)
 *   - PROD SERVER: throw createError({ statusCode: 500 })
 *   - PROD CLIENT: throw new Error()
 *
 * @param packKey - The pack key to validate
 * @param context - Context string for error messages
 */
export function assertKnownPack(packKey: string | undefined, context: string = 'pack'): void {
  // Empty = OK (no pack specified)
  if (!packKey) return

  // Known = OK
  if (isKnownPack(packKey)) return

  // Unknown = FAIL
  const message = `[Packs] Unknown pack "${packKey}" in ${context} — known packs: ${KNOWN_PACKS.join(', ')}`

  if (import.meta.dev) {
    // DEV: warn only, don't break dev flow
    console.warn(message)
  } else if (import.meta.server) {
    // PROD SERVER: use Nuxt's createError (SSR-safe)
    throw createError({
      statusCode: 500,
      statusMessage: message
    })
  } else {
    // PROD CLIENT: standard Error (client-safe)
    throw new Error(message)
  }
}

/**
 * Validate all packs used on a page — FAIL FAST in PROD
 *
 * @param packsUsed - Array of pack keys to validate
 * @param context - Context for error messages
 */
export function assertAllPacksKnown(packsUsed: string[], context: string = 'page'): void {
  for (const packKey of packsUsed) {
    assertKnownPack(packKey, context)
  }
}
