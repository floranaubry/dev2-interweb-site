import { getSitemapEntries, type SitemapEntry } from '../utils/sitemap'

export default defineEventHandler(async (event) => {
  // Get entries directly from shared utility (NO $fetch)
  const entries: SitemapEntry[] = await getSitemapEntries(event)

  // Build XML with xhtml namespace for alternates
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml +=
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'

  for (const entry of entries) {
    xml += '  <url>\n'
    xml += `    <loc>${escapeXml(entry.loc)}</loc>\n`

    if (entry.lastmod) {
      const date = new Date(entry.lastmod).toISOString().split('T')[0]
      xml += `    <lastmod>${date}</lastmod>\n`
    }

    // Add xhtml:link alternates for hreflang
    if (entry.alternates && entry.alternates.length > 0) {
      for (const alt of entry.alternates) {
        xml += `    <xhtml:link rel="alternate" hreflang="${escapeXml(alt.hreflang)}" href="${escapeXml(alt.href)}"/>\n`
      }
    }

    xml += '  </url>\n'
  }

  xml += '</urlset>'

  // Set headers and return
  setHeader(event, 'Content-Type', 'application/xml')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')
  return xml
})

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
