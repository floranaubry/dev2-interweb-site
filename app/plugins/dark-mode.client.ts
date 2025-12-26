/**
 * Dark Mode Plugin — Client-side initialization
 *
 * Initializes dark mode on app startup based on:
 * 1. localStorage preference (if set)
 * 2. System preference (fallback)
 */
import { useDarkMode } from '~/composables/useDarkMode'

export default defineNuxtPlugin(() => {
  const { initialize } = useDarkMode()
  initialize()
})
