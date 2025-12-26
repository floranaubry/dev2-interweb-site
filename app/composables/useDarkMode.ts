/**
 * useDarkMode — Dark mode toggle composable
 *
 * Features:
 * - Persists preference to localStorage
 * - Respects system preference as fallback
 * - SSR-safe (no DOM access on server)
 * - Syncs .dark-mode class on html + body (for design system)
 */

const STORAGE_KEY = 'theme'
const DARK_CLASS = 'dark-mode'

// Global state (shared across components)
const isDark = ref(false)
const isInitialized = ref(false)

/**
 * Initialize dark mode from localStorage or system preference
 * MUST be called client-side only
 */
function initialize(): void {
  if (import.meta.server) return
  if (isInitialized.value) return

  const stored = localStorage.getItem(STORAGE_KEY)
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  isDark.value = stored === 'dark' || (!stored && prefersDark)
  applyClass(isDark.value)
  isInitialized.value = true
}

/**
 * Apply or remove .dark-mode class on html + body
 */
function applyClass(dark: boolean): void {
  if (import.meta.server) return

  if (dark) {
    document.documentElement.classList.add(DARK_CLASS)
    document.body.classList.add(DARK_CLASS)
  } else {
    document.documentElement.classList.remove(DARK_CLASS)
    document.body.classList.remove(DARK_CLASS)
  }
}

/**
 * Toggle dark mode
 */
function toggle(): void {
  isDark.value = !isDark.value
  applyClass(isDark.value)

  if (!import.meta.server) {
    localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light')
  }
}

/**
 * Set dark mode explicitly
 */
function set(dark: boolean): void {
  isDark.value = dark
  applyClass(dark)

  if (!import.meta.server) {
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
  }
}

/**
 * Main composable export
 */
export function useDarkMode() {
  // Auto-initialize on client mount
  if (import.meta.client && !isInitialized.value) {
    initialize()
  }

  return {
    isDark: readonly(isDark),
    isInitialized: readonly(isInitialized),
    toggle,
    set,
    initialize
  }
}
