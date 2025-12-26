import { z } from 'zod/v4'

// =============================================================================
// header.interweb — Schema & Fixtures
// =============================================================================

/**
 * Navigation link interface (explicit for Vue compiler)
 */
export interface NavLink {
  label: string
  href: string
}

/**
 * Props interface for header.interweb shell (explicit for Vue compiler)
 */
export interface HeaderInterwebProps {
  logoText?: string
  logoHref?: string
  links?: NavLink[]
  ctaLabel?: string
  ctaHref?: string
  enableThemeToggle?: boolean
}

/**
 * Navigation link Zod schema
 */
const NavLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1)
})

/**
 * Props schema for header.interweb shell (Zod validation)
 * MUST be exported as `schema` for registry compatibility
 */
export const schema = z.object({
  logoText: z.string().default('interweb'),
  logoHref: z.string().default('/'),
  links: z.array(NavLinkSchema).default([
    { label: 'Fonctionnalités', href: '#features' },
    { label: 'Comment ça marche', href: '#how' },
    { label: 'Avis', href: '#testimonials' },
    { label: 'Tarifs', href: '#pricing' }
  ]),
  ctaLabel: z.string().default('Commencer'),
  ctaHref: z.string().default('#contact'),
  enableThemeToggle: z.boolean().default(true)
})

/**
 * Valid fixtures for testing and preview
 * MUST be exported as `fixtures` for registry compatibility
 */
export const fixtures: HeaderInterwebProps[] = [
  {
    logoText: 'interweb',
    logoHref: '/',
    links: [
      { label: 'Fonctionnalités', href: '#features' },
      { label: 'Comment ça marche', href: '#how' },
      { label: 'Avis', href: '#testimonials' },
      { label: 'Tarifs', href: '#pricing' }
    ],
    ctaLabel: 'Commencer',
    ctaHref: '#contact',
    enableThemeToggle: true
  }
]
