import { loadPage, type PageKind } from '../../utils/page-loader'

/**
 * Internal API endpoint for page builder
 *
 * Query params:
 * - kind: 'site' | 'p' | 'demo'
 * - slug: string (the page path, can contain /)
 * - locale: string (e.g. 'fr', 'en')
 *
 * Returns: PageDef (validated) or 404
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  // Validate required params
  const kind = query.kind as PageKind | undefined
  const slug = query.slug as string | undefined
  const locale = query.locale as string | undefined

  if (!kind || !['site', 'p', 'demo'].includes(kind)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing or invalid "kind" parameter'
    })
  }

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing "slug" parameter'
    })
  }

  if (!locale) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing "locale" parameter'
    })
  }

  // Load page via canonical loader
  const page = await loadPage(event, { kind, slug, locale })

  if (!page) {
    throw createError({
      statusCode: 404,
      statusMessage: `Page not found: ${kind}/${slug}`
    })
  }

  return page
})
