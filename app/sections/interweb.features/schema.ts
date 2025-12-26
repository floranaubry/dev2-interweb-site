import { z } from 'zod/v4'

// =============================================================================
// interweb.features — Schema & Fixtures
// =============================================================================

/**
 * Feature card item interface (explicit for Vue compiler)
 */
export interface FeatureCard {
  gradient?: 'blue' | 'orange' | 'purple' | 'green' | 'teal'
  iconPath: string
  title: string
  text: string
}

/**
 * Props interface for interweb.features section (explicit for Vue compiler)
 */
export interface InterwebFeaturesProps {
  anchorId?: string
  titleHtml?: string
  subtitle?: string
  cards?: FeatureCard[]
}

/**
 * Feature card Zod schema
 */
const FeatureCardSchema = z.object({
  gradient: z.enum(['blue', 'orange', 'purple', 'green', 'teal']).default('blue'),
  iconPath: z.string(),
  title: z.string().min(1),
  text: z.string()
})

/**
 * Props schema for interweb.features section (Zod validation)
 */
export const schema = z.object({
  anchorId: z.string().optional(),
  titleHtml: z.string().default('Pour qui est fait <span class="text-accent">Interweb</span> ?'),
  subtitle: z
    .string()
    .default('Pour les professionnels qui veulent un site internet efficace, sans prise de tête.'),
  cards: z.array(FeatureCardSchema).default([
    {
      gradient: 'blue',
      iconPath:
        'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
      title: 'Artisans',
      text: 'Plombiers, électriciens, menuisiers, peintres...'
    },
    {
      gradient: 'orange',
      iconPath:
        'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
      title: 'Indépendants',
      text: 'Consultants, coachs, formateurs, freelances...'
    },
    {
      gradient: 'purple',
      iconPath:
        'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
      title: 'Professions libérales',
      text: 'Avocats, médecins, architectes, comptables...'
    },
    {
      gradient: 'green',
      iconPath:
        'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18ZM6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4',
      title: 'TPE / PME',
      text: 'Commerces, restaurants, agences, startups...'
    }
  ])
})

// Legacy alias for schema inference if needed elsewhere
// export type InterwebFeaturesPropsInferred = z.infer<typeof schema>

/**
 * Valid fixtures for testing and preview
 */
export const fixtures: InterwebFeaturesProps[] = [
  {
    anchorId: 'features',
    titleHtml: 'Pour qui est fait <span class="text-accent">Interweb</span> ?',
    subtitle: 'Pour les professionnels qui veulent un site internet efficace, sans prise de tête.',
    cards: [
      {
        gradient: 'blue',
        iconPath:
          'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
        title: 'Artisans',
        text: 'Plombiers, électriciens, menuisiers, peintres...'
      },
      {
        gradient: 'orange',
        iconPath:
          'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
        title: 'Indépendants',
        text: 'Consultants, coachs, formateurs, freelances...'
      },
      {
        gradient: 'purple',
        iconPath:
          'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
        title: 'Professions libérales',
        text: 'Avocats, médecins, architectes, comptables...'
      },
      {
        gradient: 'green',
        iconPath:
          'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18ZM6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4',
        title: 'TPE / PME',
        text: 'Commerces, restaurants, agences, startups...'
      }
    ]
  }
]
