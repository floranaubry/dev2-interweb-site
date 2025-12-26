import { z } from 'zod/v4'

// =============================================================================
// footer.interweb — Schema & Fixtures
// =============================================================================

/**
 * Footer link interface (explicit for Vue compiler)
 */
export interface FooterLink {
  label: string
  href: string
}

/**
 * Props interface for footer.interweb shell (explicit for Vue compiler)
 */
export interface FooterInterwebProps {
  brand?: string
  tagline?: string
  copyright?: string
  links?: FooterLink[]
}

/**
 * Footer link Zod schema
 */
const FooterLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1)
})

/**
 * Props schema for footer.interweb shell (Zod validation)
 * MUST be exported as `schema` for registry compatibility
 */
export const schema = z.object({
  brand: z.string().default('interweb'),
  tagline: z
    .string()
    .default(
      'Création de sites internet professionnels. Première version gratuite, sans engagement.'
    ),
  copyright: z.string().default('© 2025 Interweb. Tous droits réservés.'),
  links: z.array(FooterLinkSchema).default([
    { label: 'Confidentialité', href: '/confidentialite' },
    { label: 'CGU', href: '/cgu' },
    { label: 'CGV', href: '/cgv' },
    { label: 'Mentions légales', href: '/mentions-legales' }
  ])
})

/**
 * Valid fixtures for testing and preview
 * MUST be exported as `fixtures` for registry compatibility
 */
export const fixtures: FooterInterwebProps[] = [
  {
    brand: 'interweb',
    tagline:
      'Création de sites internet professionnels. Première version gratuite, sans engagement.',
    copyright: '© 2025 Interweb. Tous droits réservés.',
    links: [
      { label: 'Confidentialité', href: '/confidentialite' },
      { label: 'CGU', href: '/cgu' },
      { label: 'CGV', href: '/cgv' },
      { label: 'Mentions légales', href: '/mentions-legales' }
    ]
  }
]
