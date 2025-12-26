import { z } from 'zod/v4'

// =============================================================================
// interweb.bento — Schema & Fixtures
// =============================================================================

/**
 * Bento card visual type
 */
export type BentoVisualType = 'avatars' | 'guarantee' | 'pricing' | 'calendar'

/**
 * Bento card interface (explicit for Vue compiler)
 */
export interface BentoCard {
  gradient?: 'blue' | 'green' | 'orange' | 'teal' | 'purple'
  iconPath: string
  title: string
  text: string
  visualType?: BentoVisualType
}

/**
 * Props interface for interweb.bento section (explicit for Vue compiler)
 */
export interface InterwebBentoProps {
  anchorId?: string
  titleHtml?: string
  subtitle?: string
  cards?: BentoCard[]
}

/**
 * Bento visual type schema
 */
const BentoVisualTypeSchema = z.enum(['avatars', 'guarantee', 'pricing', 'calendar'])

/**
 * Bento card Zod schema
 */
const BentoCardSchema = z.object({
  gradient: z.enum(['blue', 'green', 'orange', 'teal', 'purple']).default('blue'),
  iconPath: z.string(),
  title: z.string().min(1),
  text: z.string(),
  visualType: BentoVisualTypeSchema.optional()
})

/**
 * Props schema for interweb.bento section (Zod validation)
 */
export const schema = z.object({
  anchorId: z.string().optional(),
  titleHtml: z.string().default('Pourquoi choisir <span class="text-accent">Interweb</span> ?'),
  subtitle: z.string().default('Ce qui nous distingue des autres solutions.'),
  cards: z.array(BentoCardSchema).default([
    {
      gradient: 'blue',
      iconPath:
        'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
      title: 'Une vraie équipe, pas un outil',
      text: 'Pas de logiciel à apprendre. Pas de template à configurer. Des humains créent votre site pour vous.',
      visualType: 'avatars'
    },
    {
      gradient: 'green',
      iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
      title: 'Zéro engagement',
      text: 'La première version est gratuite. Si ça ne vous plaît pas, on arrête là. 30 jours satisfait ou remboursé.',
      visualType: 'guarantee'
    },
    {
      gradient: 'orange',
      iconPath: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7ZM12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
      title: 'Simple et transparent',
      text: "Pas de jargon technique, pas de frais cachés. Un tarif clair, et c'est tout.",
      visualType: 'pricing'
    },
    {
      gradient: 'teal',
      iconPath: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
      title: 'Rapide',
      text: 'Un vrai site en 24 heures. Pas une maquette, un site que vous pouvez montrer à vos clients.',
      visualType: 'calendar'
    }
  ])
})

/**
 * Valid fixtures for testing and preview
 */
export const fixtures: InterwebBentoProps[] = [
  {
    anchorId: 'how',
    titleHtml: 'Pourquoi choisir <span class="text-accent">Interweb</span> ?',
    subtitle: 'Ce qui nous distingue des autres solutions.',
    cards: [
      {
        gradient: 'blue',
        iconPath:
          'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
        title: 'Une vraie équipe, pas un outil',
        text: 'Pas de logiciel à apprendre. Pas de template à configurer. Des humains créent votre site pour vous.',
        visualType: 'avatars'
      },
      {
        gradient: 'green',
        iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
        title: 'Zéro engagement',
        text: 'La première version est gratuite. Si ça ne vous plaît pas, on arrête là. 30 jours satisfait ou remboursé.',
        visualType: 'guarantee'
      },
      {
        gradient: 'orange',
        iconPath: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7ZM12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
        title: 'Simple et transparent',
        text: "Pas de jargon technique, pas de frais cachés. Un tarif clair, et c'est tout.",
        visualType: 'pricing'
      },
      {
        gradient: 'teal',
        iconPath: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
        title: 'Rapide',
        text: 'Un vrai site en 24 heures. Pas une maquette, un site que vous pouvez montrer à vos clients.',
        visualType: 'calendar'
      }
    ]
  }
]
