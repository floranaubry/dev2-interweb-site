import { z } from 'zod/v4'

// =============================================================================
// layout.stack — Schema & Fixtures
// =============================================================================

/**
 * Props interface for layout.stack section (explicit for Vue compiler)
 */
export interface LayoutStackProps {
  gap?: number
  align?: 'start' | 'center' | 'end'
  maxWidth?: string
  paddingY?: number
  paddingX?: number
  content?: string
}

/**
 * Props schema for layout.stack section (Zod validation)
 */
export const LayoutStackSchema = z.object({
  /** Gap between items (Tailwind spacing: 4, 8, 12, 16, etc.) */
  gap: z.number().int().min(0).max(64).optional(),
  /** Horizontal alignment */
  align: z.enum(['start', 'center', 'end']).optional(),
  /** Max width (Tailwind sizes) */
  maxWidth: z.string().optional(),
  /** Vertical padding (Tailwind spacing) */
  paddingY: z.number().int().min(0).max(64).optional(),
  /** Horizontal padding (Tailwind spacing) */
  paddingX: z.number().int().min(0).max(64).optional(),
  /** Content as HTML string */
  content: z.string().optional()
})

/**
 * Valid fixtures for testing and preview
 */
export const fixtures: LayoutStackProps[] = [
  {
    gap: 8,
    align: 'center',
    maxWidth: '3xl',
    paddingY: 16,
    content: '<h2>Centered Content</h2><p>This is a simple stack with centered alignment.</p>'
  },
  {
    gap: 4,
    align: 'start',
    maxWidth: '2xl',
    paddingY: 8,
    paddingX: 6,
    content: '<p>Minimal stack with small gap.</p>'
  }
]
