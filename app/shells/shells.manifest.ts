/**
 * shells.manifest.ts
 *
 * DATA-ONLY manifest for Shell Library
 * ⚠️  NO VUE DEPENDENCIES — Safe for Node.js scripts
 *
 * Used by:
 * - scripts/guard-pages.mjs (CI validation)
 * - ShellRegistry.ts (runtime registration)
 */

import type { ZodType } from 'zod/v4'

// Import schemas from individual shell folders
import {
  schema as headerDefaultSchema,
  fixtures as headerDefaultFixtures
} from './header.default/schema'
import {
  schema as headerMinimalSchema,
  fixtures as headerMinimalFixtures
} from './header.minimal/schema'
import {
  schema as footerDefaultSchema,
  fixtures as footerDefaultFixtures
} from './footer.default/schema'
// Interweb shells
import {
  schema as headerInterwebSchema,
  fixtures as headerInterwebFixtures
} from './header.interweb/schema'
import {
  schema as footerInterwebSchema,
  fixtures as footerInterwebFixtures
} from './footer.interweb/schema'

// =============================================================================
// SHELL MANIFEST ENTRY
// =============================================================================

export type ShellSlot = 'header' | 'footer'

export interface ShellManifestEntry {
  id: string
  slot: ShellSlot
  schema: ZodType
  fixtures: unknown[]
}

// =============================================================================
// SHELLS MANIFEST (Single Source of Truth for shell data)
// =============================================================================

export const SHELLS_MANIFEST: ShellManifestEntry[] = [
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
    id: 'header.interweb',
    slot: 'header',
    schema: headerInterwebSchema,
    fixtures: headerInterwebFixtures
  },
  {
    id: 'footer.default',
    slot: 'footer',
    schema: footerDefaultSchema,
    fixtures: footerDefaultFixtures
  },
  {
    id: 'footer.interweb',
    slot: 'footer',
    schema: footerInterwebSchema,
    fixtures: footerInterwebFixtures
  }
]

// =============================================================================
// HELPERS (For Node.js scripts)
// =============================================================================

/** Get all registered shell IDs */
export function getShellIds(): string[] {
  return SHELLS_MANIFEST.map((s) => s.id)
}

/** Check if a shell ID exists */
export function hasShellId(id: string): boolean {
  return SHELLS_MANIFEST.some((s) => s.id === id)
}

/** Get shell manifest entry by ID */
export function getShellManifestEntry(id: string): ShellManifestEntry | null {
  return SHELLS_MANIFEST.find((s) => s.id === id) ?? null
}

/** Get the expected slot for a shell ID based on prefix */
export function getExpectedSlotFromId(shellId: string): ShellSlot | null {
  if (shellId.startsWith('header.')) return 'header'
  if (shellId.startsWith('footer.')) return 'footer'
  return null
}

/** Check if a shell ID is valid for a given slot */
export function isValidShellSlot(shellId: string, slot: ShellSlot): boolean {
  return shellId.startsWith(`${slot}.`)
}

/** Validate props against a shell's schema */
export function validateShellProps(
  id: string,
  props: unknown
): { success: true; data: unknown } | { success: false; error: string } {
  const entry = getShellManifestEntry(id)

  if (!entry) {
    return { success: false, error: `Shell "${id}" not found in manifest` }
  }

  const result = entry.schema.safeParse(props)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
  return { success: false, error: issues }
}
