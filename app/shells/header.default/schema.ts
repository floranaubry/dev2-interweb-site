import { z } from 'zod/v4'

// =============================================================================
// header.default — Schema & Fixtures
// =============================================================================

/**
 * Props interface for header.default shell (explicit for Vue compiler)
 */
export interface HeaderDefaultProps {
  logoText?: string
  logoHref?: string
  navItems?: Array<{ label: string; href: string }>
}

/**
 * Props schema for header.default shell (Zod validation)
 * MUST be exported as `schema` for registry compatibility
 */
export const schema = z.object({
  logoText: z.string().optional().default('Logo'),
  logoHref: z.string().optional().default('/'),
  navItems: z
    .array(
      z.object({
        label: z.string(),
        href: z.string()
      })
    )
    .optional()
    .default([])
})

// Legacy alias for existing imports
export const HeaderDefaultSchema = schema

/**
 * Valid fixtures for testing and preview
 * Each fixture MUST pass schema validation
 * MUST be exported as `fixtures` for registry compatibility
 */
export const fixtures: HeaderDefaultProps[] = [
  {
    logoText: 'Acme Corp',
    logoHref: '/',
    navItems: [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' }
    ]
  },
  {
    logoText: 'Minimal',
    logoHref: '/'
  }
]
