import { describe, it, expect } from 'vitest'
import { pathFromHash, readRedirectPath, getPendingPath } from '@/utils/hash-redirect'

function makeStorage(): Storage {
  const store = new Map<string, string>()
  return {
    getItem: (k: string) => store.get(k) ?? null,
    removeItem: (k: string) => { store.delete(k) },
    setItem: (k: string, v: string) => { store.set(k, v) },
  } as unknown as Storage
}

describe('pathFromHash', () => {
  it('extracts a hash route path', () => {
    expect(pathFromHash('#/about')).toBe('/about')
  })

  it('normalizes the bare hash router root', () => {
    expect(pathFromHash('#/')).toBe('/')
  })

  it('rejects non-router hashes', () => {
    expect(pathFromHash('#about')).toBeNull()
    expect(pathFromHash('#')).toBeNull()
    expect(pathFromHash('')).toBeNull()
  })
})

describe('readRedirectPath', () => {
  it('reads then clears the pending redirect', () => {
    const storage = makeStorage()
    storage.setItem('redirect', '/other/2024-the-movie-watchlist-year')
    expect(readRedirectPath(storage)).toBe('/other/2024-the-movie-watchlist-year')
    expect(storage.getItem('redirect')).toBeNull()
  })

  it('returns null when nothing is stored', () => {
    expect(readRedirectPath(makeStorage())).toBeNull()
  })

  it('swallows storage failures', () => {
    const throwingStorage = {
      getItem: () => { throw new Error('denied') },
      removeItem: () => {},
    }
    expect(readRedirectPath(throwingStorage)).toBeNull()
  })
})

describe('getPendingPath', () => {
  it('prefers the legacy hash over the stored redirect', () => {
    const storage = makeStorage()
    storage.setItem('redirect', '/about')
    expect(getPendingPath({ hash: '#/other?uid=2026', storage })).toBe('/other?uid=2026')
  })

  it('falls back to the stored redirect', () => {
    const storage = makeStorage()
    storage.setItem('redirect', '/about')
    expect(getPendingPath({ hash: '', storage })).toBe('/about')
  })

  it('returns null when neither source has a path', () => {
    const storage = makeStorage()
    expect(getPendingPath({ hash: '#section', storage })).toBeNull()
  })

  it('is a reading-only consumer: does not clear storage for the hash branch', () => {
    const storage = makeStorage()
    storage.setItem('redirect', '/about')
    getPendingPath({ hash: '#/other', storage })
    expect(storage.getItem('redirect')).toBe('/about')
  })
})