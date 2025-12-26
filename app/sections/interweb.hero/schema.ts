import { z } from 'zod/v4'

// =============================================================================
// interweb.hero — Schema & Fixtures
// =============================================================================

/**
 * Trust indicator item
 */
export interface TrustItem {
  label: string
}

/**
 * Props interface for interweb.hero section (explicit for Vue compiler)
 */
export interface InterwebHeroProps {
  anchorId?: string
  showPill?: boolean
  pillText?: string
  titleHtml?: string
  subtitleHtml?: string
  ctaLabel?: string
  ctaHref?: string
  trustStatement?: string
  trustItems?: TrustItem[]
}

/**
 * Trust indicator Zod schema
 */
const TrustItemSchema = z.object({
  label: z.string().min(1)
})

/**
 * Props schema for interweb.hero section (Zod validation)
 */
export const schema = z.object({
  anchorId: z.string().optional(),
  showPill: z.boolean().default(true),
  pillText: z.string().default('Disponible maintenant'),
  titleHtml: z
    .string()
    .default('Votre site professionnel,<br>prêt en <span class="text-accent">24 heures.</span>'),
  subtitleHtml: z
    .string()
    .default(
      'Un site internet clair, sérieux et moderne, conçu pour des professionnels comme vous. <strong style="color: var(--color-text-primary);">Vous n\'avez rien à faire</strong>, on s\'occupe de tout.'
    ),
  ctaLabel: z.string().default('Obtenir mon site gratuitement'),
  ctaHref: z.string().default('#contact'),
  trustStatement: z
    .string()
    .default(
      '<strong style="color: var(--color-text-primary);">+ de 150 professionnels</strong> nous font confiance'
    ),
  trustItems: z
    .array(TrustItemSchema)
    .default([
      { label: 'Sans engagement' },
      { label: 'Satisfait ou remboursé' },
      { label: 'Support inclus' }
    ])
})

/**
 * Valid fixtures for testing and preview
 */
export const fixtures: InterwebHeroProps[] = [
  {
    showPill: true,
    pillText: 'Disponible maintenant',
    titleHtml: 'Votre site professionnel,<br>prêt en <span class="text-accent">24 heures.</span>',
    subtitleHtml:
      'Un site internet clair, sérieux et moderne, conçu pour des professionnels comme vous. <strong style="color: var(--color-text-primary);">Vous n\'avez rien à faire</strong>, on s\'occupe de tout.',
    ctaLabel: 'Obtenir mon site gratuitement',
    ctaHref: '#contact',
    trustStatement:
      '<strong style="color: var(--color-text-primary);">+ de 150 professionnels</strong> nous font confiance',
    trustItems: [
      { label: 'Sans engagement' },
      { label: 'Satisfait ou remboursé' },
      { label: 'Support inclus' }
    ]
  }
]
