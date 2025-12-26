import { defineAsyncComponent, type Component } from 'vue'
import type { ZodType } from 'zod/v4'

// =============================================================================
// SHELL REGISTRY — Single Source of Truth for Shell Components
// =============================================================================
//
// HOW TO ADD A SHELL:
// 1. Create folder: app/shells/{slot}.{name}/ (e.g., header.prospect)
// 2. Add schema.ts with: export const schema, export const fixtures
// 3. Add index.vue component
// 4. Register here with registerShell({ id, slot, ... })
// 5. Run: pnpm guard:shells (must pass)
//
// =============================================================================

/**
 * Shell registration entry
 * Every shell MUST have a component, schema, and fixtures
 */
export interface ShellEntry {
  id: string
  slot: 'header' | 'footer'
  component: Component
  schema: ZodType
  fixtures: unknown[]
}

/**
 * Internal registry storage
 */
const registry = new Map<string, ShellEntry>()

/**
 * Register a shell with its component, schema, and fixtures
 * Called at module initialization
 *
 * @param entry - Shell entry with id, slot, component, schema, fixtures
 */
function registerShell(entry: ShellEntry): void {
  // Validate id matches slot prefix
  const expectedPrefix = `${entry.slot}.`
  if (!entry.id.startsWith(expectedPrefix)) {
    console.error(
      `[ShellRegistry] Invalid shell id: "${entry.id}" must start with "${expectedPrefix}" for ${entry.slot} slot`
    )
  }

  if (registry.has(entry.id)) {
    console.warn(`[ShellRegistry] Duplicate shell id: "${entry.id}" — overwriting`)
  }

  registry.set(entry.id, entry)
}

// =============================================================================
// SHELL REGISTRATIONS
// All shells MUST be registered here. Guard CI validates this.
// =============================================================================

// header.default
import {
  schema as headerDefaultSchema,
  fixtures as headerDefaultFixtures
} from '~/shells/header.default/schema'
registerShell({
  id: 'header.default',
  slot: 'header',
  component: defineAsyncComponent(() => import('~/shells/header.default/index.vue')),
  schema: headerDefaultSchema,
  fixtures: headerDefaultFixtures
})

// header.minimal
import {
  schema as headerMinimalSchema,
  fixtures as headerMinimalFixtures
} from '~/shells/header.minimal/schema'
registerShell({
  id: 'header.minimal',
  slot: 'header',
  component: defineAsyncComponent(() => import('~/shells/header.minimal/index.vue')),
  schema: headerMinimalSchema,
  fixtures: headerMinimalFixtures
})

// footer.default
import {
  schema as footerDefaultSchema,
  fixtures as footerDefaultFixtures
} from '~/shells/footer.default/schema'
registerShell({
  id: 'footer.default',
  slot: 'footer',
  component: defineAsyncComponent(() => import('~/shells/footer.default/index.vue')),
  schema: footerDefaultSchema,
  fixtures: footerDefaultFixtures
})

// =============================================================================
// INTERWEB SHELLS
// =============================================================================

// header.interweb
import {
  schema as headerInterwebSchema,
  fixtures as headerInterwebFixtures
} from '~/shells/header.interweb/schema'
registerShell({
  id: 'header.interweb',
  slot: 'header',
  component: defineAsyncComponent(() => import('~/shells/header.interweb/index.vue')),
  schema: headerInterwebSchema,
  fixtures: headerInterwebFixtures
})

// footer.interweb
import {
  schema as footerInterwebSchema,
  fixtures as footerInterwebFixtures
} from '~/shells/footer.interweb/schema'
registerShell({
  id: 'footer.interweb',
  slot: 'footer',
  component: defineAsyncComponent(() => import('~/shells/footer.interweb/index.vue')),
  schema: footerInterwebSchema,
  fixtures: footerInterwebFixtures
})

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Get a shell entry by its id
 * @returns ShellEntry or null if not found
 */
export function getShellEntry(id: string): ShellEntry | null {
  return registry.get(id) ?? null
}

/**
 * Get a shell component by its id
 * @returns Component or null if not found
 */
export function getShellComponent(id: string): Component | null {
  return registry.get(id)?.component ?? null
}

/**
 * Get a shell schema by its id
 * @returns ZodType or null if not found
 */
export function getShellSchema(id: string): ZodType | null {
  return registry.get(id)?.schema ?? null
}

/**
 * Get shell fixtures by its id
 * @returns fixtures array or null if not found
 */
export function getShellFixtures(id: string): unknown[] | null {
  return registry.get(id)?.fixtures ?? null
}

/**
 * Check if a shell id exists in the registry
 */
export function hasShell(id: string): boolean {
  return registry.has(id)
}

/**
 * Get all registered shell ids (sorted alphabetically)
 * Used for validation and CI
 */
export function getRegisteredShellIds(): string[] {
  return Array.from(registry.keys()).sort()
}

/**
 * Get all registered shells (sorted by id)
 * Used for preview routes
 */
export function getAllShells(): ShellEntry[] {
  return Array.from(registry.values()).sort((a, b) => a.id.localeCompare(b.id))
}

/**
 * List shells (alias for getAllShells, sorted by id)
 * Stable ordering for UI and tests
 */
export function listShells(): ShellEntry[] {
  return getAllShells()
}

/**
 * List shells by slot (header or footer), sorted by id
 */
export function listShellsBySlot(slot: 'header' | 'footer'): ShellEntry[] {
  return Array.from(registry.values())
    .filter((entry) => entry.slot === slot)
    .sort((a, b) => a.id.localeCompare(b.id))
}

/**
 * Validate props against a shell's schema
 * @returns { success: true, data } or { success: false, error }
 */
export function validateShellProps(
  id: string,
  props: unknown
): { success: true; data: unknown } | { success: false; error: string } {
  const entry = registry.get(id)

  if (!entry) {
    return { success: false, error: `Shell "${id}" not found in registry` }
  }

  const result = entry.schema.safeParse(props)

  if (result.success) {
    return { success: true, data: result.data }
  }

  // Format Zod error
  const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
  return { success: false, error: issues }
}
