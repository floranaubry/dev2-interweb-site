import type { PageDef } from '~/schema/page.schema'

// =============================================================================
// PACKS USED HELPER — Single Source of Truth
// =============================================================================

/**
 * Calculate all unique pack keys used on a page
 *
 * Collects:
 * - page.packKey (if present)
 * - all section.pack values (if present)
 *
 * Returns deduplicated array preserving insertion order.
 * Does NOT validate packs — just collects.
 *
 * @param page - PageDef object
 * @returns Array of pack keys used (may be empty)
 */
export function getPacksUsed(page: PageDef): string[] {
  const packs: string[] = []
  const seen = new Set<string>()

  // Page-level pack
  if (page.packKey && !seen.has(page.packKey)) {
    seen.add(page.packKey)
    packs.push(page.packKey)
  }

  // Section-level packs
  for (const section of page.sections) {
    if (section.pack && !seen.has(section.pack)) {
      seen.add(section.pack)
      packs.push(section.pack)
    }
  }

  return packs
}
