export function pathFromHash(hash: string): string | null {
  if (!hash.startsWith('#/')) return null
  const path = hash.slice(1)
  return path.length > 0 ? path : '/'
}

export type SessionStorageLike = Pick<Storage, 'getItem' | 'removeItem'>

export function readRedirectPath(storage: SessionStorageLike): string | null {
  try {
    const value = storage.getItem('redirect')
    storage.removeItem('redirect')
    return value
  } catch {
    return null
  }
}

export function getPendingPath(opts: {
  hash: string
  storage: SessionStorageLike
}): string | null {
  return pathFromHash(opts.hash) ?? readRedirectPath(opts.storage)
}