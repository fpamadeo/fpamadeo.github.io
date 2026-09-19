import { watch } from 'vue'
import { useRoute, type RouteLocationNormalizedLoaded } from 'vue-router'
import { SITE_URL, SITE_NAME } from '../config'
import { buildSlugMap } from '../utils/slugs'
import type { WritingEntry } from '../types'
import writingData from '../data/writing.json'

const DEFAULT_DESCRIPTION =
  'Full stack software engineer building learning management systems, internal tools, and custom software with a focus on process optimization.'
const WRITING_DESCRIPTION =
  'Curated thoughts and writing by Francis Paul Amadeo on movies, music, books, and everything in between.'

export type MetaRoute = Pick<
  RouteLocationNormalizedLoaded,
  'path' | 'name' | 'params' | 'query' | 'meta'
>

const slugMap = buildSlugMap(writingData as WritingEntry[])

function setMetaContent(
  attr: 'name' | 'property',
  attrValue: string,
  content: string,
) {
  const selector = `meta[${attr}="${attrValue}"]`
  let meta = document.head.querySelector<HTMLMetaElement>(selector)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attr, attrValue)
    document.head.appendChild(meta)
  }
  meta.content = content
}

function setCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = href
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`{1,3}.+?`{1,3}/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function applyRouteMeta(route: MetaRoute) {
  const routeMeta = (route.meta ?? {}) as { title?: string; description?: string }
  let title = routeMeta.title ?? SITE_NAME
  let description = routeMeta.description ?? DEFAULT_DESCRIPTION
  let ogType = 'website'
  let publishedTime: string | null = null

  const slug = route.params?.slug
  if (route.name === 'OtherEntry' && typeof slug === 'string') {
    const entry = slugMap.get(slug)
    if (entry) {
      title = `${entry.Title} — ${SITE_NAME}`
      description = entry.summary
        ? stripMarkdown(entry.summary)
        : routeMeta.description ?? WRITING_DESCRIPTION
      ogType = 'article'
      publishedTime = entry.datePublished ? entry.datePublished.split('T')[0] : null
    } else {
      description = routeMeta.description ?? WRITING_DESCRIPTION
    }
  } else if (route.name === 'Other' && route.query?.uid != null) {
    const id = parseInt(String(route.query.uid), 10)
    if (!isNaN(id)) {
      const entry = (writingData as WritingEntry[]).find((e) => e.UID === id)
      if (entry?.summary) description = stripMarkdown(entry.summary)
    }
  }

  document.title = title
  setMetaContent('name', 'description', description)
  setMetaContent('property', 'og:title', title)
  setMetaContent('property', 'og:description', description)
  setMetaContent('property', 'og:type', ogType)
  setMetaContent('property', 'article:published_time', publishedTime ?? '')
  const canonical = `${SITE_URL}${route.path}`
  setCanonical(canonical)
  setMetaContent('property', 'og:url', canonical)
}

export function useRouteMeta(route?: MetaRoute) {
  const tracked = route ?? useRoute()
  const withFullPath = tracked as RouteLocationNormalizedLoaded
  watch(
    () =>
      `${String(withFullPath.name ?? '')}|${withFullPath.fullPath ?? withFullPath.path}`,
    () => applyRouteMeta(tracked),
    { immediate: true },
  )
}