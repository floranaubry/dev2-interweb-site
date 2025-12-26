import { z } from 'zod/v4'

// =============================================================================
// faq.simple — Schema & Fixtures
// =============================================================================

/**
 * Single FAQ item interface (explicit for Vue compiler)
 */
export interface FaqItem {
  q: string
  a: string
}

/**
 * Props interface for faq.simple section (explicit for Vue compiler)
 */
export interface FaqSimpleProps {
  title?: string
  items: FaqItem[]
}

/**
 * Single FAQ item schema (Zod validation)
 */
export const FaqItemSchema = z.object({
  q: z.string().min(1, 'Question is required'),
  a: z.string().min(1, 'Answer is required')
})

/**
 * Props schema for faq.simple section (Zod validation)
 */
export const FaqSimpleSchema = z.object({
  title: z.string().optional(),
  items: z.array(FaqItemSchema).min(1, 'At least one FAQ item is required')
})

/**
 * Valid fixtures for testing and preview
 * Each fixture MUST pass schema validation
 */
export const fixtures: FaqSimpleProps[] = [
  {
    title: 'Frequently Asked Questions',
    items: [
      { q: 'What is this product?', a: 'A powerful platform for building amazing experiences.' },
      {
        q: 'How do I get started?',
        a: 'Sign up for a free account and follow our quick start guide.'
      },
      { q: 'Is there a free tier?', a: 'Yes, we offer a generous free tier for personal projects.' }
    ]
  },
  {
    items: [{ q: 'Simple question?', a: 'Simple answer without a title.' }]
  }
]
