import { SITE_URL } from '../config'
import { buildSlugMap } from './slugs'
import type { WritingEntry } from '../types'

const STATIC_PATHS = ['/', '/about', '/other', '/contact']

export function buildSitemap(entries: WritingEntry[], siteUrl = SITE_URL): string {
  const root = siteUrl.replace(/\/+$/, '')
  const slugMap = buildSlugMap(entries)
  const urls: Array<{ loc: string; lastmod?: string }> = STATIC_PATHS.map((path) => ({
    loc: `${root}${path}`,
  }))
  for (const [slug, entry] of slugMap) {
    urls.push({
      loc: `${root}/other/${slug}`,
      lastmod: entry.datePublished ? entry.datePublished.split('T')[0] : undefined,
    })
  }

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ]
  for (const { loc, lastmod } of urls) {
    lines.push(`  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`)
  }
  lines.push('</urlset>')
  return lines.join('\n') + '\n'
}