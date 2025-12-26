#!/usr/bin/env node
/**
 * scope-pack-css.mjs
 *
 * Transform design-system.css into a scoped pack CSS
 * - Replace :root with [data-pack="interweb"]
 * - Prefix all component selectors with [data-pack="interweb"]
 * - Handle .dark-mode properly
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')

const inputFile = join(projectRoot, 'app/packs/interweb/design-system.source.css')
const outputFile = join(projectRoot, 'public/packs/interweb.css')

const SCOPE = '[data-pack="interweb"]'

let css = readFileSync(inputFile, 'utf-8')

// 1. Replace :root with scope selector
css = css.replace(/:root\s*\{/g, `${SCOPE} {`)

// 2. Replace html { with scope selector (for scroll behavior etc)
css = css.replace(/^html\s*\{/gm, `${SCOPE} {`)

// 3. Replace body { with scope selector (for base styles)
css = css.replace(/^body\s*\{/gm, `${SCOPE} {`)

// 4. Handle .dark-mode selectors - they need to work with html.dark-mode [data-pack="interweb"]
// Replace .dark-mode { with .dark-mode [data-pack="interweb"] {
css = css.replace(/^\.dark-mode\s*\{/gm, `.dark-mode ${SCOPE} {`)

// Replace .dark-mode .something with .dark-mode [data-pack="interweb"] .something
css = css.replace(/^\.dark-mode\s+\./gm, `.dark-mode ${SCOPE} .`)

// 5. Prefix all component selectors
// Match lines that start with . (class selector) and are not already scoped
const classSelectors = [
  // Primitives
  'gradient-layer',
  'glass-overlay',
  'content-layer',
  'shine-layer',
  'glass-border',
  'icon-container',
  // Layout
  'container',
  'section',
  'grid',
  'col-span',
  'bento',
  'flex',
  // Typography
  'text-display',
  'text-headline',
  'text-title',
  'text-body',
  'text-caption',
  'text-label',
  'text-accent',
  'text-muted',
  'text-center',
  'text-left',
  'text-right',
  // Components
  'btn',
  'pill',
  'pulse',
  'badge',
  'card',
  'icon-box',
  'bento-card',
  'kpi-card',
  'case-card',
  'contact-section',
  'contact-form',
  'contact-info',
  'contact-highlight',
  'contact-direct',
  'testimonial',
  'input',
  'glass-input',
  'glass-textarea',
  'nav',
  'theme-toggle',
  'footer',
  'mini-card',
  'avatar',
  'star',
  'divider',
  'tooltip',
  'glass-actor',
  'form',
  // Utilities
  'mt-',
  'mb-',
  'mx-',
  'gap-',
  'w-',
  'max-w-',
  'relative',
  'absolute',
  'inset-',
  'block',
  'inline',
  'hidden',
  'sr-only',
  'rounded',
  'shadow',
  'overflow',
  'items-',
  'justify-',
  'flex-',
  'hide-mobile',
  'show-mobile',
  'sm\\:',
  'md\\:',
  'lg\\:'
]

// Build regex to match class selectors at start of line (not already inside .dark-mode or scoped)
for (const selector of classSelectors) {
  // Match lines starting with .selector (but not after .dark-mode or already scoped)
  const regex = new RegExp(`^(\\.)${selector}`, 'gm')
  css = css.replace(regex, (match, dot) => {
    return `${SCOPE} ${match}`
  })
}

// 6. Handle remaining selectors that start with . and are not scoped
// This is more aggressive - scope any . at line start not already scoped
const lines = css.split('\n')
const scopedLines = lines.map((line) => {
  const trimmed = line.trim()

  // Skip empty lines, comments, @rules, already scoped lines
  if (
    !trimmed ||
    trimmed.startsWith('/*') ||
    trimmed.startsWith('*') ||
    trimmed.startsWith('@') ||
    trimmed.startsWith(SCOPE) ||
    trimmed.startsWith(`.dark-mode ${SCOPE}`) ||
    trimmed.includes(SCOPE)
  ) {
    return line
  }

  // If line starts with . (class selector), scope it
  if (/^\.[a-z]/i.test(trimmed)) {
    const indent = line.match(/^(\s*)/)[1]
    return `${indent}${SCOPE} ${trimmed}`
  }

  // Handle element selectors (*, img, svg, a, button, input, textarea, select)
  if (/^([\*]|img|svg|a|button|input|textarea|select)\s*[,\{]/i.test(trimmed)) {
    const indent = line.match(/^(\s*)/)[1]
    return `${indent}${SCOPE} ${trimmed}`
  }

  // Handle ::selection
  if (trimmed.startsWith('::selection')) {
    const indent = line.match(/^(\s*)/)[1]
    return `${indent}${SCOPE} ${trimmed}`
  }

  return line
})

css = scopedLines.join('\n')

// 7. Add header comment
const header = `/**
 * Interweb Pack CSS — Scoped Design System
 * 
 * AUTO-GENERATED from design-system.source.css
 * DO NOT EDIT DIRECTLY — Edit the source file instead
 * 
 * All styles are scoped under [data-pack="interweb"] to prevent global pollution.
 * Dark mode is handled via .dark-mode class on html/body.
 */

`

css = header + css

writeFileSync(outputFile, css, 'utf-8')
console.log(`✅ Generated scoped pack CSS: ${outputFile}`)
