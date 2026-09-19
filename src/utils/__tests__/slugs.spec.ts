import { describe, it, expect } from 'vitest'
import {
  slugifyTitle,
  buildSlugMap,
  findEntryBySlug,
  buildUidToSlugMap,
  findSlugByUID,
} from '@/utils/slugs'

describe('slugifyTitle', () => {
  it('slugs a typical writing title', () => {
    expect(slugifyTitle('2024: The movie watchlist year')).toBe('2024-the-movie-watchlist-year')
  })

  it('lowercases and collapses whitespace to hyphens', () => {
    expect(slugifyTitle('Reading  Outlook\n 2026')).toBe('reading-outlook-2026')
  })

  it('strips diacritics', () => {
    expect(slugifyTitle('Café Noël')).toBe('cafe-noel')
  })

  it('drops punctuation and symbols', () => {
    expect(slugifyTitle('Movies & Music! (Vol. 1)')).toBe('movies-music-vol-1')
  })

  it('returns empty string for a fully stripped title', () => {
    expect(slugifyTitle('!!!')).toBe('')
  })
})

describe('buildSlugMap', () => {
  const entries = [
    { UID: 1, Title: 'Foo bar', datePublished: '2020-01-01T00:00:00' },
    { UID: 2, Title: 'Foo Bar', datePublished: '2021-01-01T00:00:00' },
    { UID: 3, Title: '', datePublished: '2019-01-01T00:00:00' },
  ]

  it('maps the slug to its entry', () => {
    const map = buildSlugMap(entries)
    expect(map.get('foo-bar')?.UID).toBe(2)
  })

  it('deduplicates collisions with numeric suffixes in date-desc order', () => {
    const map = buildSlugMap(entries)
    expect(map.get('foo-bar-2')?.UID).toBe(1)
  })

  it('falls back to entry-UID when the title produces no slug', () => {
    const map = buildSlugMap(entries)
    expect(map.get('entry-3')?.UID).toBe(3)
  })

  it('never produces duplicate slugs', () => {
    const map = buildSlugMap(entries)
    expect(new Set(map.keys()).size).toBe(map.size)
  })
})

describe('findEntryBySlug', () => {
  const entries = [{ UID: 42, Title: 'Hello world', datePublished: '2022-02-02T00:00:00' }]

  it('finds an existing entry', () => {
    expect(findEntryBySlug(entries, 'hello-world')?.UID).toBe(42)
  })

  it('returns undefined for an unknown slug', () => {
    expect(findEntryBySlug(entries, 'nope')).toBeUndefined()
  })
})

describe('buildUidToSlugMap & findSlugByUID', () => {
  const entries = [
    { UID: 101, Title: 'First Post', datePublished: '2020-01-01T00:00:00' },
    { UID: 102, Title: 'Second Post', datePublished: '2021-01-01T00:00:00' },
  ]

  it('maps UIDs to their generated slugs', () => {
    const map = buildUidToSlugMap(entries)
    expect(map.get(101)).toBe('first-post')
    expect(map.get(102)).toBe('second-post')
  })

  it('finds a slug by UID', () => {
    expect(findSlugByUID(entries, 101)).toBe('first-post')
    expect(findSlugByUID(entries, 999)).toBeUndefined()
  })
})