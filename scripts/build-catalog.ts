#!/usr/bin/env npx tsx

/**
 * build-catalog.ts
 *
 * Generates public/catalog.json from registries.
 * Machine-readable catalog for n8n and external tools.
 *
 * Run: npx tsx scripts/build-catalog.ts
 *      pnpm catalog:build
 */

import { writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Import registries and helpers
import { KNOWN_PACKS } from '../app/packs/packRegistry'
import { zodToShape, type SchemaShape } from '../app/utils/zodShape'

// Import section schemas directly
import { HeroSplitSchema, fixtures as heroSplitFixtures } from '../app/sections/hero.split/schema'
import { FaqSimpleSchema, fixtures as faqSimpleFixtures } from '../app/sections/faq.simple/schema'
import {
  LayoutStackSchema,
  fixtures as layoutStackFixtures
} from '../app/sections/layout.stack/schema'
import {
  LayoutSplitSchema,
  fixtures as layoutSplitFixtures
} from '../app/sections/layout.split/schema'

// Import shell schemas directly
import {
  schema as headerDefaultSchema,
  fixtures as headerDefaultFixtures
} from '../app/shells/header.default/schema'
import {
  schema as headerMinimalSchema,
  fixtures as headerMinimalFixtures
} from '../app/shells/header.minimal/schema'
import {
  schema as footerDefaultSchema,
  fixtures as footerDefaultFixtures
} from '../app/shells/footer.default/schema'

// =============================================================================
// TYPES
// =============================================================================

interface SectionCatalogEntry {
  id: string
  propsShape: SchemaShape
  fixtures: unknown[]
}

interface ShellCatalogEntry {
  id: string
  slot: 'header' | 'footer'
  propsShape: SchemaShape
  fixtures: unknown[]
}

interface Catalog {
  version: string
  generatedAt: string
  packs: string[]
  sections: SectionCatalogEntry[]
  shells: ShellCatalogEntry[]
}

// =============================================================================
// SECTION DEFINITIONS (must match SectionRegistry.ts)
// =============================================================================

const SECTIONS: Array<{ id: string; schema: unknown; fixtures: unknown[] }> = [
  { id: 'hero.split', schema: HeroSplitSchema, fixtures: heroSplitFixtures },
  { id: 'faq.simple', schema: FaqSimpleSchema, fixtures: faqSimpleFixtures },
  { id: 'layout.stack', schema: LayoutStackSchema, fixtures: layoutStackFixtures },
  { id: 'layout.split', schema: LayoutSplitSchema, fixtures: layoutSplitFixtures }
]

// =============================================================================
// SHELL DEFINITIONS (must match ShellRegistry.ts)
// =============================================================================

const SHELLS: Array<{
  id: string
  slot: 'header' | 'footer'
  schema: unknown
  fixtures: unknown[]
}> = [
  {
    id: 'header.default',
    slot: 'header',
    schema: headerDefaultSchema,
    fixtures: headerDefaultFixtures
  },
  {
    id: 'header.minimal',
    slot: 'header',
    schema: headerMinimalSchema,
    fixtures: headerMinimalFixtures
  },
  {
    id: 'footer.default',
    slot: 'footer',
    schema: footerDefaultSchema,
    fixtures: footerDefaultFixtures
  }
]

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('📦 Building catalog...\n')

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const ROOT = join(__dirname, '..')
  const OUTPUT_PATH = join(ROOT, 'public', 'catalog.json')

  // Build sections catalog
  const sections: SectionCatalogEntry[] = SECTIONS.map((s) => ({
    id: s.id,
    propsShape: zodToShape(s.schema as Parameters<typeof zodToShape>[0]),
    fixtures: s.fixtures
  })).sort((a, b) => a.id.localeCompare(b.id))

  // Build shells catalog
  const shells: ShellCatalogEntry[] = SHELLS.map((s) => ({
    id: s.id,
    slot: s.slot,
    propsShape: zodToShape(s.schema as Parameters<typeof zodToShape>[0]),
    fixtures: s.fixtures
  })).sort((a, b) => a.id.localeCompare(b.id))

  // Build catalog
  const catalog: Catalog = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    packs: [...KNOWN_PACKS].sort(),
    sections,
    shells
  }

  // Ensure public directory exists
  await mkdir(join(ROOT, 'public'), { recursive: true })

  // Write catalog
  await writeFile(OUTPUT_PATH, JSON.stringify(catalog, null, 2) + '\n', 'utf-8')

  console.log(`✅ Catalog generated: public/catalog.json`)
  console.log(`   - ${catalog.packs.length} pack(s)`)
  console.log(`   - ${catalog.sections.length} section(s)`)
  console.log(`   - ${catalog.shells.length} shell(s)`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
