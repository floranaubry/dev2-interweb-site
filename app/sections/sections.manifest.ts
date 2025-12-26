/**
 * sections.manifest.ts
 *
 * DATA-ONLY manifest for Section Library
 * ⚠️  NO VUE DEPENDENCIES — Safe for Node.js scripts
 *
 * Used by:
 * - scripts/guard-pages.mjs (CI validation)
 * - SectionRegistry.ts (runtime registration)
 */

import type { ZodType } from 'zod/v4'

// Import schemas from individual section folders
import { HeroSplitSchema, fixtures as heroSplitFixtures } from './hero.split/schema'
import { FaqSimpleSchema, fixtures as faqSimpleFixtures } from './faq.simple/schema'
import { LayoutStackSchema, fixtures as layoutStackFixtures } from './layout.stack/schema'
import { LayoutSplitSchema, fixtures as layoutSplitFixtures } from './layout.split/schema'

// Interweb sections
import {
  schema as interwebHeroSchema,
  fixtures as interwebHeroFixtures
} from './interweb.hero/schema'
import {
  schema as interwebFeaturesSchema,
  fixtures as interwebFeaturesFixtures
} from './interweb.features/schema'
import {
  schema as interwebBentoSchema,
  fixtures as interwebBentoFixtures
} from './interweb.bento/schema'
import {
  schema as interwebTestimonialsSchema,
  fixtures as interwebTestimonialsFixtures
} from './interweb.testimonials/schema'
import {
  schema as interwebRecapSchema,
  fixtures as interwebRecapFixtures
} from './interweb.recap/schema'
import {
  schema as interwebResultsSchema,
  fixtures as interwebResultsFixtures
} from './interweb.results/schema'
import {
  schema as interwebContactSchema,
  fixtures as interwebContactFixtures
} from './interweb.contact/schema'

// =============================================================================
// SECTION MANIFEST ENTRY
// =============================================================================

export interface SectionManifestEntry {
  id: string
  schema: ZodType
  fixtures: unknown[]
}

// =============================================================================
// SECTIONS MANIFEST (Single Source of Truth for section data)
// =============================================================================

export const SECTIONS_MANIFEST: SectionManifestEntry[] = [
  { id: 'hero.split', schema: HeroSplitSchema, fixtures: heroSplitFixtures },
  { id: 'faq.simple', schema: FaqSimpleSchema, fixtures: faqSimpleFixtures },
  { id: 'layout.stack', schema: LayoutStackSchema, fixtures: layoutStackFixtures },
  { id: 'layout.split', schema: LayoutSplitSchema, fixtures: layoutSplitFixtures },
  // Interweb sections
  { id: 'interweb.hero', schema: interwebHeroSchema, fixtures: interwebHeroFixtures },
  { id: 'interweb.features', schema: interwebFeaturesSchema, fixtures: interwebFeaturesFixtures },
  { id: 'interweb.bento', schema: interwebBentoSchema, fixtures: interwebBentoFixtures },
  {
    id: 'interweb.testimonials',
    schema: interwebTestimonialsSchema,
    fixtures: interwebTestimonialsFixtures
  },
  { id: 'interweb.recap', schema: interwebRecapSchema, fixtures: interwebRecapFixtures },
  { id: 'interweb.results', schema: interwebResultsSchema, fixtures: interwebResultsFixtures },
  { id: 'interweb.contact', schema: interwebContactSchema, fixtures: interwebContactFixtures }
]

// =============================================================================
// HELPERS (For Node.js scripts)
// =============================================================================

/** Get all registered section IDs */
export function getSectionIds(): string[] {
  return SECTIONS_MANIFEST.map((s) => s.id)
}

/** Check if a section ID exists */
export function hasSectionId(id: string): boolean {
  return SECTIONS_MANIFEST.some((s) => s.id === id)
}

/** Get section manifest entry by ID */
export function getSectionManifestEntry(id: string): SectionManifestEntry | null {
  return SECTIONS_MANIFEST.find((s) => s.id === id) ?? null
}

/** Validate props against a section's schema */
export function validateSectionProps(
  id: string,
  props: unknown
): { success: true; data: unknown } | { success: false; error: string } {
  const entry = getSectionManifestEntry(id)

  if (!entry) {
    return { success: false, error: `Section "${id}" not found in manifest` }
  }

  const result = entry.schema.safeParse(props)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
  return { success: false, error: issues }
}
