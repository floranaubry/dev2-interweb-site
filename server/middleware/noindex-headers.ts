/**
 * Server middleware to add X-Robots-Tag header for noindex routes
 *
 * This provides an additional layer of noindex protection for /p/* and /demo/* routes.
 * Even if a bot ignores meta robots, the HTTP header will block indexing.
 *
 * Protected paths:
 * - /p/* (private preview pages)
 * - /demo/* (demo/showcase pages)
 * - /dev/* (development pages)
 * - /:locale/p/* (localized)
 * - /:locale/demo/*
 * - /:locale/dev/*
 */
export default defineEventHandler((event) => {
  const path = event.path

  // Check if path matches noindex routes
  const isNoindexRoute =
    path.startsWith('/p/') ||
    path.startsWith('/demo/') ||
    path.startsWith('/dev/') ||
    // Localized versions (e.g., /en/p/, /fr/demo/)
    /^\/[a-z]{2}\/(p|demo|dev)\//.test(path)

  if (isNoindexRoute) {
    // Set X-Robots-Tag header
    // This is an additional protection layer on top of meta robots
    setHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
  }
})
