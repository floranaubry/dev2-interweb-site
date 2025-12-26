import { z } from 'zod/v4'

// =============================================================================
// footer.default — Schema & Fixtures
// =============================================================================

/**
 * Props interface for footer.default shell (explicit for Vue compiler)
 */
export interface FooterDefaultProps {
  companyName?: string
  year?: number
  links?: Array<{ label: string; href: string }>
}

/**
 * Props schema for footer.default shell (Zod validation)
 * MUST be exported as `schema` for registry compatibility
 */
export const schema = z.object({
  companyName: z.string().optional().default('Company'),
  year: z.number().optional().default(new Date().getFullYear()),
  links: z
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
export const FooterDefaultSchema = schema

/**
 * Valid fixtures for testing and preview
 * Each fixture MUST pass schema validation
 * MUST be exported as `fixtures` for registry compatibility
 */
export const fixtures: FooterDefaultProps[] = [
  {
    companyName: 'Acme Corp',
    year: 2025,
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Contact', href: '/contact' }
    ]
  },
  {
    companyName: 'Startup Inc',
    year: 2025
  }
]
