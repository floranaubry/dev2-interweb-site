import { defineAsyncComponent, type Component } from 'vue'
import type { ZodType } from 'zod/v4'

// =============================================================================
// SECTION REGISTRY V4 — Industrialized
// =============================================================================

/**
 * Section registration entry
 * Every section MUST have a component, schema, and fixtures
 */
export interface SectionEntry {
  id: string
  component: Component
  schema: ZodType
  fixtures: unknown[]
}

/**
 * Internal registry storage
 */
const registry = new Map<string, SectionEntry>()

/**
 * Register a section with its component, schema, and fixtures
 * Called at module initialization
 */
function registerSection(entry: SectionEntry): void {
  if (registry.has(entry.id)) {
    console.warn(`[SectionRegistry] Duplicate section id: "${entry.id}" — overwriting`)
  }
  registry.set(entry.id, entry)
}

// =============================================================================
// SECTION REGISTRATIONS
// =============================================================================

// hero.split
import { HeroSplitSchema, fixtures as heroSplitFixtures } from '~/sections/hero.split/schema'
registerSection({
  id: 'hero.split',
  component: defineAsyncComponent(() => import('~/sections/hero.split/index.vue')),
  schema: HeroSplitSchema,
  fixtures: heroSplitFixtures
})

// faq.simple
import { FaqSimpleSchema, fixtures as faqSimpleFixtures } from '~/sections/faq.simple/schema'
registerSection({
  id: 'faq.simple',
  component: defineAsyncComponent(() => import('~/sections/faq.simple/index.vue')),
  schema: FaqSimpleSchema,
  fixtures: faqSimpleFixtures
})

// layout.stack
import { LayoutStackSchema, fixtures as layoutStackFixtures } from '~/sections/layout.stack/schema'
registerSection({
  id: 'layout.stack',
  component: defineAsyncComponent(() => import('~/sections/layout.stack/index.vue')),
  schema: LayoutStackSchema,
  fixtures: layoutStackFixtures
})

// layout.split
import { LayoutSplitSchema, fixtures as layoutSplitFixtures } from '~/sections/layout.split/schema'
registerSection({
  id: 'layout.split',
  component: defineAsyncComponent(() => import('~/sections/layout.split/index.vue')),
  schema: LayoutSplitSchema,
  fixtures: layoutSplitFixtures
})

// =============================================================================
// INTERWEB SECTIONS
// =============================================================================

// interweb.hero
import {
  schema as interwebHeroSchema,
  fixtures as interwebHeroFixtures
} from '~/sections/interweb.hero/schema'
registerSection({
  id: 'interweb.hero',
  component: defineAsyncComponent(() => import('~/sections/interweb.hero/index.vue')),
  schema: interwebHeroSchema,
  fixtures: interwebHeroFixtures
})

// interweb.features
import {
  schema as interwebFeaturesSchema,
  fixtures as interwebFeaturesFixtures
} from '~/sections/interweb.features/schema'
registerSection({
  id: 'interweb.features',
  component: defineAsyncComponent(() => import('~/sections/interweb.features/index.vue')),
  schema: interwebFeaturesSchema,
  fixtures: interwebFeaturesFixtures
})

// interweb.bento
import {
  schema as interwebBentoSchema,
  fixtures as interwebBentoFixtures
} from '~/sections/interweb.bento/schema'
registerSection({
  id: 'interweb.bento',
  component: defineAsyncComponent(() => import('~/sections/interweb.bento/index.vue')),
  schema: interwebBentoSchema,
  fixtures: interwebBentoFixtures
})

// interweb.testimonials
import {
  schema as interwebTestimonialsSchema,
  fixtures as interwebTestimonialsFixtures
} from '~/sections/interweb.testimonials/schema'
registerSection({
  id: 'interweb.testimonials',
  component: defineAsyncComponent(() => import('~/sections/interweb.testimonials/index.vue')),
  schema: interwebTestimonialsSchema,
  fixtures: interwebTestimonialsFixtures
})

// interweb.recap
import {
  schema as interwebRecapSchema,
  fixtures as interwebRecapFixtures
} from '~/sections/interweb.recap/schema'
registerSection({
  id: 'interweb.recap',
  component: defineAsyncComponent(() => import('~/sections/interweb.recap/index.vue')),
  schema: interwebRecapSchema,
  fixtures: interwebRecapFixtures
})

// interweb.results
import {
  schema as interwebResultsSchema,
  fixtures as interwebResultsFixtures
} from '~/sections/interweb.results/schema'
registerSection({
  id: 'interweb.results',
  component: defineAsyncComponent(() => import('~/sections/interweb.results/index.vue')),
  schema: interwebResultsSchema,
  fixtures: interwebResultsFixtures
})

// interweb.contact
import {
  schema as interwebContactSchema,
  fixtures as interwebContactFixtures
} from '~/sections/interweb.contact/schema'
registerSection({
  id: 'interweb.contact',
  component: defineAsyncComponent(() => import('~/sections/interweb.contact/index.vue')),
  schema: interwebContactSchema,
  fixtures: interwebContactFixtures
})

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Get a section entry by its id
 * @returns SectionEntry or null if not found
 */
export function getSectionEntry(id: string): SectionEntry | null {
  return registry.get(id) ?? null
}

/**
 * Get a section component by its id
 * @returns Component or null if not found
 */
export function getSectionComponent(id: string): Component | null {
  return registry.get(id)?.component ?? null
}

/**
 * Get a section schema by its id
 * @returns ZodType or null if not found
 */
export function getSectionSchema(id: string): ZodType | null {
  return registry.get(id)?.schema ?? null
}

/**
 * Get section fixtures by its id
 * @returns fixtures array or null if not found
 */
export function getSectionFixtures(id: string): unknown[] | null {
  return registry.get(id)?.fixtures ?? null
}

/**
 * Check if a section id exists in the registry
 */
export function hasSectionComponent(id: string): boolean {
  return registry.has(id)
}

/**
 * Get all registered section ids (useful for validation and CI)
 */
export function getRegisteredSectionIds(): string[] {
  return Array.from(registry.keys())
}

/**
 * Get all registered sections (for preview routes)
 */
export function getAllSections(): SectionEntry[] {
  return Array.from(registry.values())
}

/**
 * Validate props against a section's schema
 * @returns { success: true, data } or { success: false, error }
 */
export function validateSectionProps(
  id: string,
  props: unknown
): { success: true; data: unknown } | { success: false; error: string } {
  const entry = registry.get(id)

  if (!entry) {
    return { success: false, error: `Section "${id}" not found in registry` }
  }

  const result = entry.schema.safeParse(props)

  if (result.success) {
    return { success: true, data: result.data }
  }

  // Format Zod error
  const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
  return { success: false, error: issues }
}
