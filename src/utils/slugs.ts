import { parseDate } from './dates'
import type { WritingEntry } from '../types'

export type SlugSource = Pick<WritingEntry, 'UID' | 'Title' | 'datePublished' | 'summary'>

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+$/, '')
}

export function buildSlugMap(entries: SlugSource[]): Map<string, SlugSource> {
  const sorted = [...entries].sort((a, b) => {
    const byDate = parseDate(b.datePublished) - parseDate(a.datePublished)
    return byDate !== 0 ? byDate : (b.UID ?? 0) - (a.UID ?? 0)
  })
  const map = new Map<string, SlugSource>()
  for (const entry of sorted) {
    const base = slugifyTitle(entry.Title) || `entry-${entry.UID}`
    let slug = base
    let n = 2
    while (map.has(slug)) {
      slug = `${base}-${n}`
      n++
    }
    map.set(slug, entry)
  }
  return map
}

export function findEntryBySlug(entries: SlugSource[], slug: string): SlugSource | undefined {
  return buildSlugMap(entries).get(slug)
}

export function buildUidToSlugMap(entries: SlugSource[]): Map<number, string> {
  const slugMap = buildSlugMap(entries)
  const uidMap = new Map<number, string>()
  for (const [slug, entry] of slugMap) {
    if (entry.UID != null) {
      uidMap.set(entry.UID, slug)
    }
  }
  return uidMap
}

export function findSlugByUID(entries: SlugSource[], uid: number): string | undefined {
  return buildUidToSlugMap(entries).get(uid)
}