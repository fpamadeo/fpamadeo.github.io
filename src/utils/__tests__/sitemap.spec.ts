import { describe, it, expect } from 'vitest'
import { buildSitemap } from '@/utils/sitemap'
import type { WritingEntry } from '@/types'

const SITE = 'https://fpamadeo.github.io'

const entries: WritingEntry[] = [
  {
    UID: 2024,
    Title: '2024: The movie watchlist year',
    tags: ['Review: Movies'],
    related: [],
    Date: '2026-06-05T22:54:37.555029+00:00',
    summary: 'The year I started mindfully watching movies.',
    subtitle: '',
    datePublished: '2026-06-04T17:05:43.383475+00:00',
    Body: 'x',
  },
  {
    UID: 2026,
    Title: '2026: The Reading List Year',
    tags: ['Books'],
    related: [2024],
    Date: '2026-06-05T22:54:37.555029+00:00',
    summary: 'Reading year.',
    subtitle: '',
    datePublished: '2026-06-04T17:06:32.888307+00:00',
    Body: 'y',
  },
]

describe('buildSitemap', () => {
  it('includes every static top-level path', () => {
    const xml = buildSitemap(entries, SITE)
    expect(xml).toContain('<loc>https://fpamadeo.github.io/</loc>')
    expect(xml).toContain('<loc>https://fpamadeo.github.io/about</loc>')
    expect(xml).toContain('<loc>https://fpamadeo.github.io/other</loc>')
    expect(xml).toContain('<loc>https://fpamadeo.github.io/contact</loc>')
  })

  it('includes one URL per writing entry using its slug', () => {
    const xml = buildSitemap(entries, SITE)
    expect(xml).toContain('<loc>https://fpamadeo.github.io/other/2024-the-movie-watchlist-year</loc>')
    expect(xml).toContain('<loc>https://fpamadeo.github.io/other/2026-the-reading-list-year</loc>')
  })

  it('adds a lastmod date (YYYY-MM-DD) from datePublished', () => {
    const xml = buildSitemap(entries, SITE)
    expect(xml).toContain('<lastmod>2026-06-04</lastmod>')
  })

  it('emits valid XML wrapping', () => {
    const xml = buildSitemap(entries, SITE)
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true)
  })

  it('respects the trailing-slash of the default SITE_URL', () => {
    const xml = buildSitemap(entries)
    expect(xml).toContain('<loc>https://fpamadeo.github.io/</loc>')
  })
})