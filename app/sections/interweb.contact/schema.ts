import { z } from 'zod/v4'

// =============================================================================
// interweb.contact — Schema & Fixtures
// =============================================================================

/**
 * Contact highlight interface (explicit for Vue compiler)
 */
export interface ContactHighlight {
  iconPath: string
  title: string
  text: string
}

/**
 * Direct contact interface (explicit for Vue compiler)
 */
export interface DirectContact {
  avatarUrl?: string
  avatarGradient?: string
  role?: string
  name?: string
  email?: string
  linkLabel?: string
}

/**
 * Form field interface (explicit for Vue compiler)
 */
export interface FormField {
  name: 'name' | 'email' | 'message'
  label: string
  required?: boolean
  placeholder: string
  type?: 'text' | 'email' | 'textarea'
}

/**
 * Props interface for interweb.contact section (explicit for Vue compiler)
 */
export interface InterwebContactProps {
  anchorId?: string
  formSubtitle?: string
  formTitle?: string
  formFields?: FormField[]
  formSubmitLabel?: string
  formDisclaimer?: string
  formAction?: string
  infoTitle?: string
  infoDescription?: string
  highlights?: ContactHighlight[]
  directContact?: DirectContact
}

/**
 * Contact highlight Zod schema
 */
const ContactHighlightSchema = z.object({
  iconPath: z.string(),
  title: z.string().min(1),
  text: z.string()
})

/**
 * Direct contact Zod schema
 */
const DirectContactSchema = z.object({
  avatarUrl: z.string().optional(),
  avatarGradient: z.string().default('linear-gradient(135deg, #0071e3, #5856d6)'),
  role: z.string().default('Responsable Projets'),
  name: z.string().default('Thomas Martin'),
  email: z.string().default('contact@gointerweb.com'),
  linkLabel: z.string().default('Contacter directement')
})

/**
 * Form field Zod schema
 */
const FormFieldSchema = z.object({
  name: z.enum(['name', 'email', 'message']),
  label: z.string(),
  required: z.boolean().default(false),
  placeholder: z.string(),
  type: z.enum(['text', 'email', 'textarea']).default('text')
})

/**
 * Props schema for interweb.contact section (Zod validation)
 */
export const schema = z.object({
  anchorId: z.string().optional(),
  formSubtitle: z.string().default('Interweb Support'),
  formTitle: z.string().default("Besoin d'aide ?"),
  formFields: z.array(FormFieldSchema).default([
    { name: 'name', label: 'Votre nom', required: true, placeholder: 'Jean Dupont', type: 'text' },
    {
      name: 'email',
      label: 'Email',
      required: true,
      placeholder: 'vous@exemple.com',
      type: 'email'
    },
    {
      name: 'message',
      label: 'Message',
      required: false,
      placeholder: 'Décrivez votre projet ou posez vos questions...',
      type: 'textarea'
    }
  ]),
  formSubmitLabel: z.string().default('Envoyer le message'),
  formDisclaimer: z
    .string()
    .default('En soumettant, vous acceptez nos Conditions et notre Politique de Confidentialité.'),
  formAction: z.string().default('mailto:contact@gointerweb.com'),
  infoTitle: z.string().default('Parlons de votre projet.'),
  infoDescription: z
    .string()
    .default(
      'Site vitrine, questions ou partenariats — dites-nous ce dont vous avez besoin. Nous répondons sous 24h.'
    ),
  highlights: z.array(ContactHighlightSchema).default([
    {
      iconPath: 'M12 6v6h4M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
      title: 'Réponse rapide',
      text: 'La plupart des messages reçoivent une réponse en moins de 24h.'
    },
    {
      iconPath:
        'M16 10a4 4 0 0 1-8 0M3.103 6.034h17.794M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z',
      title: 'Étapes claires',
      text: 'Nous vous envoyons un plan concis et un calendrier.'
    }
  ]),
  directContact: DirectContactSchema.optional()
})

/**
 * Valid fixtures for testing and preview
 */
export const fixtures: InterwebContactProps[] = [
  {
    anchorId: 'contact',
    formSubtitle: 'Interweb Support',
    formTitle: "Besoin d'aide ?",
    formFields: [
      {
        name: 'name',
        label: 'Votre nom',
        required: true,
        placeholder: 'Jean Dupont',
        type: 'text'
      },
      {
        name: 'email',
        label: 'Email',
        required: true,
        placeholder: 'vous@exemple.com',
        type: 'email'
      },
      {
        name: 'message',
        label: 'Message',
        required: false,
        placeholder: 'Décrivez votre projet ou posez vos questions...',
        type: 'textarea'
      }
    ],
    formSubmitLabel: 'Envoyer le message',
    formDisclaimer:
      'En soumettant, vous acceptez nos Conditions et notre Politique de Confidentialité.',
    formAction: 'mailto:contact@gointerweb.com',
    infoTitle: 'Parlons de votre projet.',
    infoDescription:
      'Site vitrine, questions ou partenariats — dites-nous ce dont vous avez besoin. Nous répondons sous 24h.',
    highlights: [
      {
        iconPath: 'M12 6v6h4M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
        title: 'Réponse rapide',
        text: 'La plupart des messages reçoivent une réponse en moins de 24h.'
      },
      {
        iconPath:
          'M16 10a4 4 0 0 1-8 0M3.103 6.034h17.794M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z',
        title: 'Étapes claires',
        text: 'Nous vous envoyons un plan concis et un calendrier.'
      }
    ],
    directContact: {
      avatarGradient: 'linear-gradient(135deg, #0071e3, #5856d6)',
      role: 'Responsable Projets',
      name: 'Thomas Martin',
      email: 'contact@gointerweb.com',
      linkLabel: 'Contacter directement'
    }
  }
]
