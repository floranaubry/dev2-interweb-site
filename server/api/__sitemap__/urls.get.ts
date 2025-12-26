import { getSitemapEntries, type SitemapEntry } from '../../utils/sitemap'

/**
 * Debug endpoint for sitemap entries
 * Uses shared getSitemapEntries() - NO duplicated logic
 */
export default defineEventHandler(async (event): Promise<SitemapEntry[]> => {
  return await getSitemapEntries(event)
})
