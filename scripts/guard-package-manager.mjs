#!/usr/bin/env node

/**
 * guard-package-manager.mjs
 * Prevents accidental npm usage in a pnpm-only repository.
 *
 * - CI (CI=true): exit(1) if npm detected
 * - Local: warn loudly but exit(0) to not block developers
 */

const userAgent = process.env.npm_config_user_agent || ''
const isCI = process.env.CI === 'true'

const isNpm = userAgent.includes('npm/') && !userAgent.includes('pnpm/')
const isPnpm = userAgent.includes('pnpm/')

if (isNpm) {
  console.error('')
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.error('⚠️  This repository uses pnpm, not npm.')
  console.error('')
  console.error('   To install dependencies, run:')
  console.error('')
  console.error('     corepack enable')
  console.error('     pnpm install')
  console.error('')
  console.error('   See README.md for more information.')
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.error('')

  if (isCI) {
    console.error('❌ CI build failed: use pnpm, not npm.')
    process.exit(1)
  } else {
    console.warn('⚠️  Continuing locally, but please use pnpm for consistency.')
    process.exit(0)
  }
}

// pnpm or other package manager — allow
if (isPnpm) {
  // Silent success for pnpm
  process.exit(0)
}

// Unknown package manager (yarn, bun, etc.) — allow with warning
if (userAgent && !isPnpm && !isNpm) {
  console.warn(`⚠️  Detected package manager: ${userAgent.split(' ')[0]}`)
  console.warn(
    '   This repo is optimized for pnpm. Consider using: corepack enable && pnpm install'
  )
}

process.exit(0)
