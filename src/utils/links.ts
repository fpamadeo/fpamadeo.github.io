const PROTOCOL_RE = /^(mailto:|tel:|data:|blob:|javascript:)/i

export function isInternalLink(
  href: string | null | undefined,
  origin = window.location.origin,
): boolean {
  if (!href) return false
  if (href.startsWith('#')) return false
  if (PROTOCOL_RE.test(href)) return false
  if (href.startsWith('/')) return true
  const root = origin.replace(/\/+$/, '')
  if (href.startsWith(`${root}/`)) return true
  return href === root
}

export function getInternalPath(
  href: string | null | undefined,
  origin = window.location.origin,
): string | null {
  if (!isInternalLink(href, origin)) return null
  let target = href as string
  const root = origin.replace(/\/+$/, '')
  if (target.startsWith(root)) target = target.slice(root.length)
  return target || '/'
}