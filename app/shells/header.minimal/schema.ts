import { z } from 'zod/v4'

// =============================================================================
// header.minimal — Schema & Fixtures
// =============================================================================

/**
 * Props interface for header.minimal shell (explicit for Vue compiler)
 */
export interface HeaderMinimalProps {
  logoText?: string
  logoHref?: string
}

/**
 * Props schema for header.minimal shell (Zod validation)
 * MUST be exported as `schema` for registry compatibility
 */
export const schema = z.object({
  logoText: z.string().optional().default('Logo'),
  logoHref: z.string().optional().default('/')
})

// Legacy alias for existing imports
export const HeaderMinimalSchema = schema

/**
 * Valid fixtures for testing and preview
 * Each fixture MUST pass schema validation
 * MUST be exported as `fixtures` for registry compatibility
 */
export const fixtures: HeaderMinimalProps[] = [
  {
    logoText: 'Simple',
    logoHref: '/'
  },
  {
    logoText: '🚀 Startup',
    logoHref: '/'
  }
]
