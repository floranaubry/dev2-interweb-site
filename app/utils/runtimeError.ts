// =============================================================================
// RUNTIME ERROR HELPER — Client-safe production throws
// =============================================================================

/**
 * Throw a fatal error in a client-safe way
 *
 * Behavior:
 * - DEV: console.warn + throw Error (for dev flow)
 * - PROD SERVER: throw createError({ statusCode: 500, statusMessage })
 * - PROD CLIENT: throw new Error(message)
 *
 * Use this instead of raw `createError()` in any code that may execute client-side.
 *
 * @param message - Error message
 * @throws Always throws
 */
export function failHard(message: string): never {
  if (import.meta.dev) {
    console.warn(`[failHard] ${message}`)
    throw new Error(message)
  }

  if (import.meta.server) {
    // Server-side: use Nuxt's createError for proper 500 response
    throw createError({
      statusCode: 500,
      statusMessage: message
    })
  }

  // Client-side: standard Error (client-safe)
  throw new Error(message)
}

// =============================================================================
// SHELL SLOT VALIDATION — Immutable rules
// =============================================================================

/**
 * Shell ID prefix rules (IMMUTABLE):
 * - header.* shells can ONLY be used in header slot
 * - footer.* shells can ONLY be used in footer slot
 */
export const SHELL_SLOT_PREFIXES = {
  header: 'header.',
  footer: 'footer.'
} as const

export type ShellSlot = keyof typeof SHELL_SLOT_PREFIXES

/**
 * Check if a shell ID has the correct prefix for its slot
 */
export function isValidShellSlot(shellId: string, slot: ShellSlot): boolean {
  const expectedPrefix = SHELL_SLOT_PREFIXES[slot]
  return shellId.startsWith(expectedPrefix)
}

/**
 * Get the expected slot for a shell ID based on its prefix
 */
export function getExpectedSlotForShellId(shellId: string): ShellSlot | null {
  if (shellId.startsWith('header.')) return 'header'
  if (shellId.startsWith('footer.')) return 'footer'
  return null
}

/**
 * Assert shell ID matches expected slot — fail fast in PROD
 *
 * @param shellId - The shell ID to validate
 * @param slot - The slot where shell is being used ('header' | 'footer')
 * @param context - Context for error message
 */
export function assertValidShellSlot(
  shellId: string,
  slot: ShellSlot,
  context: string = 'shell'
): void {
  if (isValidShellSlot(shellId, slot)) {
    return // Valid
  }

  const expectedSlot = getExpectedSlotForShellId(shellId)
  const message = expectedSlot
    ? `[Shell] Slot mismatch: "${shellId}" is a ${expectedSlot} shell but used in ${slot} slot (${context})`
    : `[Shell] Invalid shell ID: "${shellId}" must start with "header." or "footer." (${context})`

  failHard(message)
}
