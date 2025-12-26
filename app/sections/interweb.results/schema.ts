import { z } from 'zod/v4'

// =============================================================================
// interweb.results — Schema & Fixtures
// =============================================================================

/**
 * Case study interface (explicit for Vue compiler)
 */
export interface CaseStudy {
  category: string
  title: string
  before: string
  after: string
  result: string
  gradient?: 'blue' | 'purple' | 'orange' | 'green'
}

/**
 * Props interface for interweb.results section (explicit for Vue compiler)
 */
export interface InterwebResultsProps {
  anchorId?: string
  titleHtml?: string
  subtitle?: string
  cases?: CaseStudy[]
  showCta?: boolean
  ctaLabel?: string
  ctaHref?: string
  ctaHelperText?: string
}

/**
 * Case study Zod schema
 */
const CaseSchema = z.object({
  category: z.string().min(1),
  title: z.string().min(1),
  before: z.string(),
  after: z.string(),
  result: z.string(),
  gradient: z.enum(['blue', 'purple', 'orange', 'green']).default('blue')
})

/**
 * Props schema for interweb.results section (Zod validation)
 */
export const schema = z.object({
  anchorId: z.string().optional(),
  titleHtml: z
    .string()
    .default(
      'Des résultats <span class="text-muted" style="font-style: italic; font-weight: 500;">concrets</span>'
    ),
  subtitle: z.string().default('Quelques exemples de transformations réalisées.'),
  cases: z.array(CaseSchema).default([
    {
      category: 'Artisan',
      title: 'Plombier indépendant',
      before: 'Aucune présence en ligne',
      after: '→ Site pro avec formulaire de contact',
      result: '+5 demandes / semaine',
      gradient: 'blue'
    },
    {
      category: 'Profession libérale',
      title: "Cabinet d'avocat",
      before: 'Site vieillissant, pas adapté mobile',
      after: '→ Site moderne et sobre',
      result: 'Image professionnelle renforcée',
      gradient: 'purple'
    },
    {
      category: 'Indépendant',
      title: 'Consultant en management',
      before: 'Uniquement présent sur LinkedIn',
      after: '→ Site vitrine complet',
      result: 'Crédibilité accrue',
      gradient: 'orange'
    }
  ]),
  showCta: z.boolean().default(true),
  ctaLabel: z.string().default('Obtenir mon site gratuitement'),
  ctaHref: z.string().default('#contact'),
  ctaHelperText: z.string().default("C'est gratuit et sans engagement.")
})

/**
 * Valid fixtures for testing and preview
 */
export const fixtures: InterwebResultsProps[] = [
  {
    anchorId: 'results',
    titleHtml:
      'Des résultats <span class="text-muted" style="font-style: italic; font-weight: 500;">concrets</span>',
    subtitle: 'Quelques exemples de transformations réalisées.',
    cases: [
      {
        category: 'Artisan',
        title: 'Plombier indépendant',
        before: 'Aucune présence en ligne',
        after: '→ Site pro avec formulaire de contact',
        result: '+5 demandes / semaine',
        gradient: 'blue'
      },
      {
        category: 'Profession libérale',
        title: "Cabinet d'avocat",
        before: 'Site vieillissant, pas adapté mobile',
        after: '→ Site moderne et sobre',
        result: 'Image professionnelle renforcée',
        gradient: 'purple'
      },
      {
        category: 'Indépendant',
        title: 'Consultant en management',
        before: 'Uniquement présent sur LinkedIn',
        after: '→ Site vitrine complet',
        result: 'Crédibilité accrue',
        gradient: 'orange'
      }
    ],
    showCta: true,
    ctaLabel: 'Obtenir mon site gratuitement',
    ctaHref: '#contact',
    ctaHelperText: "C'est gratuit et sans engagement."
  }
]
