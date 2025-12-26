import { z } from 'zod/v4'

// =============================================================================
// hero.split — Schema & Fixtures
// =============================================================================

/**
 * Props interface for hero.split section (explicit for Vue compiler)
 */
export interface HeroSplitProps {
  title: string
  subtitle?: string
  ctaLabel?: string
  ctaHref?: string
  imageUrl?: string
}

/**
 * Props schema for hero.split section (Zod validation)
 */
export const HeroSplitSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  imageUrl: z.string().url('Must be a valid URL').optional()
})

/**
 * Valid fixtures for testing and preview
 * Each fixture MUST pass schema validation
 */
export const fixtures: HeroSplitProps[] = [
  {
    title: 'Welcome to Our Platform',
    subtitle: 'Build amazing experiences with our powerful tools.',
    ctaLabel: 'Get Started',
    ctaHref: '/signup',
    imageUrl: 'https://picsum.photos/800/600'
  },
  {
    title: 'Minimal Hero',
    subtitle: 'Sometimes less is more.'
  }
]
