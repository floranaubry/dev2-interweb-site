import { z } from 'zod/v4'

// =============================================================================
// interweb.testimonials — Schema & Fixtures
// =============================================================================

/**
 * Testimonial item interface (explicit for Vue compiler)
 */
export interface Testimonial {
  text: string
  name: string
  role: string
  rating?: string
  avatarGradient?: string
}

/**
 * Props interface for interweb.testimonials section (explicit for Vue compiler)
 */
export interface InterwebTestimonialsProps {
  anchorId?: string
  titleHtml?: string
  overallRating?: string
  ratingDescription?: string
  testimonials?: Testimonial[]
}

/**
 * Testimonial Zod schema
 */
const TestimonialSchema = z.object({
  text: z.string().min(1),
  name: z.string().min(1),
  role: z.string(),
  rating: z.string().default('5.0'),
  avatarGradient: z.string().default('linear-gradient(135deg, #60a5fa, #3b82f6)')
})

/**
 * Props schema for interweb.testimonials section (Zod validation)
 */
export const schema = z.object({
  anchorId: z.string().optional(),
  titleHtml: z.string().default('Ils nous font <span class="text-accent">confiance</span>'),
  overallRating: z.string().default('5/5'),
  ratingDescription: z.string().default('basé sur les retours clients'),
  testimonials: z.array(TestimonialSchema).default([
    {
      text: "Je n'y connaissais rien en sites web. En 24h j'avais quelque chose de propre à montrer. Exactement ce qu'il me fallait.",
      name: 'Marc L.',
      role: 'Électricien • Lyon',
      rating: '5.0',
      avatarGradient: 'linear-gradient(135deg, #60a5fa, #3b82f6)'
    },
    {
      text: "Enfin une solution simple. Pas besoin de comprendre le technique. Ils font, et c'est bien fait.",
      name: 'Sophie D.',
      role: 'Ostéopathe • Bordeaux',
      rating: '5.0',
      avatarGradient: 'linear-gradient(135deg, #a78bfa, #8b5cf6)'
    },
    {
      text: "Le rapport qualité/prix est imbattable. J'ai eu des devis à 3000€ ailleurs. Très satisfait.",
      name: 'Thomas B.',
      role: "Gérant d'agence • Nantes",
      rating: '5.0',
      avatarGradient: 'linear-gradient(135deg, #34d399, #10b981)'
    }
  ])
})

/**
 * Valid fixtures for testing and preview
 */
export const fixtures: InterwebTestimonialsProps[] = [
  {
    anchorId: 'testimonials',
    titleHtml: 'Ils nous font <span class="text-accent">confiance</span>',
    overallRating: '5/5',
    ratingDescription: 'basé sur les retours clients',
    testimonials: [
      {
        text: "Je n'y connaissais rien en sites web. En 24h j'avais quelque chose de propre à montrer. Exactement ce qu'il me fallait.",
        name: 'Marc L.',
        role: 'Électricien • Lyon',
        rating: '5.0',
        avatarGradient: 'linear-gradient(135deg, #60a5fa, #3b82f6)'
      },
      {
        text: "Enfin une solution simple. Pas besoin de comprendre le technique. Ils font, et c'est bien fait.",
        name: 'Sophie D.',
        role: 'Ostéopathe • Bordeaux',
        rating: '5.0',
        avatarGradient: 'linear-gradient(135deg, #a78bfa, #8b5cf6)'
      },
      {
        text: "Le rapport qualité/prix est imbattable. J'ai eu des devis à 3000€ ailleurs. Très satisfait.",
        name: 'Thomas B.',
        role: "Gérant d'agence • Nantes",
        rating: '5.0',
        avatarGradient: 'linear-gradient(135deg, #34d399, #10b981)'
      }
    ]
  }
]
