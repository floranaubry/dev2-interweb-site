import { z } from 'zod/v4'

// =============================================================================
// layout.split — Schema & Fixtures
// =============================================================================

/**
 * Props interface for layout.split section (explicit for Vue compiler)
 */
export interface LayoutSplitProps {
  ratio?: '1:1' | '1:2' | '2:1' | '1:3' | '3:1'
  reverse?: boolean
  gap?: number
  align?: 'start' | 'center' | 'end'
  paddingY?: number
  left?: string
  right?: string
  leftImage?: string
  rightImage?: string
}

/**
 * Props schema for layout.split section (Zod validation)
 */
export const LayoutSplitSchema = z.object({
  /** Column ratio */
  ratio: z.enum(['1:1', '1:2', '2:1', '1:3', '3:1']).optional(),
  /** Reverse order (swap left/right) */
  reverse: z.boolean().optional(),
  /** Gap between columns (Tailwind spacing) */
  gap: z.number().int().min(0).max(64).optional(),
  /** Vertical alignment */
  align: z.enum(['start', 'center', 'end']).optional(),
  /** Vertical padding */
  paddingY: z.number().int().min(0).max(64).optional(),
  /** Left column content (HTML) */
  left: z.string().optional(),
  /** Right column content (HTML) */
  right: z.string().optional(),
  /** Left column image URL */
  leftImage: z.string().url().optional(),
  /** Right column image URL */
  rightImage: z.string().url().optional()
})

/**
 * Valid fixtures for testing and preview
 */
export const fixtures: LayoutSplitProps[] = [
  {
    ratio: '1:1',
    gap: 12,
    align: 'center',
    paddingY: 16,
    left: '<h2>Left Column</h2><p>Content on the left side.</p>',
    right: '<h2>Right Column</h2><p>Content on the right side.</p>'
  },
  {
    ratio: '2:1',
    reverse: true,
    gap: 8,
    leftImage: 'https://picsum.photos/600/400',
    right: '<h3>Image on left, text on right</h3><p>With reversed order and 2:1 ratio.</p>'
  }
]
