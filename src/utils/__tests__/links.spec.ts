import { describe, it, expect } from 'vitest'
import { isInternalLink, getInternalPath } from '@/utils/links'

const ORIGIN = 'https://fpamadeo.github.io'

describe('isInternalLink', () => {
  it('accepts root-relative paths', () => {
    expect(isInternalLink('/about', ORIGIN)).toBe(true)
  })

  it('accepts fully-qualified same-origin URLs', () => {
    expect(isInternalLink(`${ORIGIN}/other/foo`, ORIGIN)).toBe(true)
  })

  it('accepts the bare same-origin root', () => {
    expect(isInternalLink(ORIGIN, ORIGIN)).toBe(true)
  })

  it('rejects empty and hash-only hrefs', () => {
    expect(isInternalLink('', ORIGIN)).toBe(false)
    expect(isInternalLink('#', ORIGIN)).toBe(false)
    expect(isInternalLink('#fragment', ORIGIN)).toBe(false)
  })

  it('rejects non-http protocols', () => {
    expect(isInternalLink('mailto:a@b.com', ORIGIN)).toBe(false)
    expect(isInternalLink('tel:123', ORIGIN)).toBe(false)
    expect(isInternalLink('javascript:alert(1)', ORIGIN)).toBe(false)
    expect(isInternalLink('data:text/html,hi', ORIGIN)).toBe(false)
    expect(isInternalLink('blob:https://x/y', ORIGIN)).toBe(false)
  })

  it('rejects cross-origin URLs', () => {
    expect(isInternalLink('https://other.com/x', ORIGIN)).toBe(false)
    expect(isInternalLink('https://fpamadeo.github.io.evil.com', ORIGIN)).toBe(false)
  })
})

describe('getInternalPath', () => {
  it('passes root-relative paths through', () => {
    expect(getInternalPath('/about', ORIGIN)).toBe('/about')
  })

  it('strips the origin from same-origin URLs', () => {
    expect(getInternalPath(`${ORIGIN}/other/2024-the-movie-watchlist-year`, ORIGIN)).toBe(
      '/other/2024-the-movie-watchlist-year',
    )
  })

  it('normalizes the bare root to /', () => {
    expect(getInternalPath(ORIGIN, ORIGIN)).toBe('/')
    expect(getInternalPath(`${ORIGIN}/`, ORIGIN)).toBe('/')
  })

  it('returns null for external links', () => {
    expect(getInternalPath('https://linkedin.com/in/franpaul', ORIGIN)).toBeNull()
    expect(getInternalPath('mailto:x@y.com', ORIGIN)).toBeNull()
  })
})