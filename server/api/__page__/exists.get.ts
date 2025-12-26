import { serverQueryContent } from '#content/server'

/**
 * Check if a page exists (lightweight lookup)
 *
 * Query params:
 * - kind: 'site' | 'p' | 'demo'
 * - slug: page slug
 * - locale: locale code (e.g., 'fr', 'en')
 *
 * Returns: { exists: boolean }
 *
 * Used by routes to verify translations before generating hreflang
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const kind = query.kind as string
  const slug = query.slug as string
  const locale = query.locale as string

  // Validate required params
  if (!kind || !slug || !locale) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required params: kind, slug, locale'
    })
  }

  // Build content path
  const contentPath = `/${locale}/pages/${kind}/${slug}`

  // Check if content exists (lightweight query, only returns _path)
  const doc = await serverQueryContent(event)
    .where({ _path: contentPath })
    .only(['_path'])
    .findOne()

  return { exists: doc !== null }
})
