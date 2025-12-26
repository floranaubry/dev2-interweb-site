import { z } from 'zod/v4'

// =============================================================================
// interweb.recap — Schema & Fixtures
// =============================================================================

/**
 * KPI card interface (explicit for Vue compiler)
 */
export interface KpiCard {
  type?: 'glass' | 'inverted'
  wide?: boolean
  gradient?: 'blue' | 'green' | 'orange' | 'purple'
  value: string
  unit?: string
  label?: string
  description: string
}

/**
 * Props interface for interweb.recap section (explicit for Vue compiler)
 */
export interface InterwebRecapProps {
  anchorId?: string
  cards?: KpiCard[]
}

/**
 * KPI card Zod schema
 */
const KpiCardSchema = z.object({
  type: z.enum(['glass', 'inverted']).default('glass'),
  wide: z.boolean().default(false),
  gradient: z.enum(['blue', 'green', 'orange', 'purple']).optional(),
  value: z.string().min(1),
  unit: z.string().optional(),
  label: z.string().optional(),
  description: z.string()
})

/**
 * Props schema for interweb.recap section (Zod validation)
 */
export const schema = z.object({
  anchorId: z.string().optional(),
  cards: z.array(KpiCardSchema).default([
    {
      type: 'glass',
      wide: true,
      gradient: 'blue',
      value: '24h',
      label: 'Délai de livraison',
      description:
        'Votre première version de site est prête en moins de 24 heures après votre demande.'
    },
    {
      type: 'inverted',
      wide: false,
      value: '0',
      unit: '€',
      description: 'Pour votre première version. Sans engagement.'
    },
    {
      type: 'glass',
      wide: false,
      gradient: 'green',
      value: '100',
      unit: '%',
      description: 'Satisfaction ou remboursé sous 30 jours.'
    },
    {
      type: 'glass',
      wide: true,
      gradient: 'orange',
      value: 'Support',
      unit: 'Humain',
      description:
        "Vous n'êtes jamais seul grâce à notre support. On s'occupe de tout, vous n'avez qu'à demander."
    }
  ])
})

/**
 * Valid fixtures for testing and preview
 */
export const fixtures: InterwebRecapProps[] = [
  {
    anchorId: 'recap',
    cards: [
      {
        type: 'glass',
        wide: true,
        gradient: 'blue',
        value: '24h',
        label: 'Délai de livraison',
        description:
          'Votre première version de site est prête en moins de 24 heures après votre demande.'
      },
      {
        type: 'inverted',
        wide: false,
        value: '0',
        unit: '€',
        description: 'Pour votre première version. Sans engagement.'
      },
      {
        type: 'glass',
        wide: false,
        gradient: 'green',
        value: '100',
        unit: '%',
        description: 'Satisfaction ou remboursé sous 30 jours.'
      },
      {
        type: 'glass',
        wide: true,
        gradient: 'orange',
        value: 'Support',
        unit: 'Humain',
        description:
          "Vous n'êtes jamais seul grâce à notre support. On s'occupe de tout, vous n'avez qu'à demander."
      }
    ]
  }
]
