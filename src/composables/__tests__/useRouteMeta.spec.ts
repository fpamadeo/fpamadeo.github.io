import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick, reactive } from 'vue'
import {
  applyRouteMeta,
  useRouteMeta,
  type MetaRoute,
} from '@/composables/useRouteMeta'

const { holder } = vi.hoisted(() => ({
  holder: { route: null as MetaRoute | null },
}))

vi.mock('vue-router', () => ({
  useRoute: () => holder.route,
}))

const SITE_URL = 'https://fpamadeo.github.io'

function resetHead() {
  document.title = ''
  document.head.querySelectorAll('meta[property]').forEach((m) => m.remove())
  document.head.querySelectorAll('meta[name="description"]').forEach((m) => m.remove())
  document.head.querySelectorAll('link[rel="canonical"]').forEach((m) => m.remove())
  document.head.querySelectorAll('meta[property="article:published_time"]').forEach((m) => m.remove())
}

const metaContent = (selector: string) =>
  document.head.querySelector<HTMLMetaElement>(selector)?.content ?? ''

function route(overrides: Partial<MetaRoute>): MetaRoute {
  return {
    path: '/',
    name: undefined,
    params: {},
    query: {},
    meta: { title: 'Francis Paul Amadeo', description: 'Default description.' },
    ...overrides,
  }
}

describe('applyRouteMeta', () => {
  beforeEach(resetHead)

  it('applies the route meta title and description', () => {
    applyRouteMeta(route({ path: '/about', name: 'About', meta: { title: 'About', description: 'About me.' } }))
    expect(document.title).toBe('About')
    expect(metaContent('meta[name="description"]')).toBe('About me.')
  })

  it('sets canonical and og:url to SITE_URL + path, ignoring the query string', () => {
    applyRouteMeta(route({ path: '/other', name: 'Other', query: { uid: '2026' } }))
    const href = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href
    expect(href).toBe(`${SITE_URL}/other`)
    expect(metaContent('meta[property="og:url"]')).toBe(`${SITE_URL}/other`)
  })

  it('synthesizes article metadata for a known writing slug', () => {
    applyRouteMeta(
      route({
        path: '/other/2024-the-movie-watchlist-year',
        name: 'OtherEntry',
        params: { slug: '2024-the-movie-watchlist-year' },
      }),
    )
    expect(document.title).toBe('2024: The movie watchlist year — Francis Paul Amadeo')
    expect(metaContent('meta[property="og:type"]')).toBe('article')
    expect(metaContent('meta[property="article:published_time"]')).toBe('2026-06-04')
  })

  it('renders the entry summary as the description, stripped of markdown', () => {
    applyRouteMeta(
      route({
        path: '/other/2024-the-movie-watchlist-year',
        name: 'OtherEntry',
        params: { slug: '2024-the-movie-watchlist-year' },
      }),
    )
    const description = metaContent('meta[name="description"]')
    expect(description).toContain('The year I started mindfully watching movies.')
  })

  it('falls back to route meta for an unknown slug', () => {
    applyRouteMeta(
      route({
        path: '/other/does-not-exist',
        name: 'OtherEntry',
        params: { slug: 'does-not-exist' },
        meta: {
          title: 'Writing — Francis Paul Amadeo',
          description: 'Writing description.',
        },
      }),
    )
    expect(document.title).toBe('Writing — Francis Paul Amadeo')
    expect(metaContent('meta[property="og:type"]')).toBe('website')
  })

  it('uses the entry summary for a legacy uid query', () => {
    applyRouteMeta(route({ path: '/other', name: 'Other', query: { uid: '2024' } }))
    expect(metaContent('meta[name="description"]')).toContain(
      'The year I started mindfully watching movies.',
    )
  })

  it('keeps route meta for the writing index without a selection', () => {
    applyRouteMeta(route({ path: '/other', name: 'Other' }))
    expect(metaContent('meta[name="description"]')).toBe('Default description.')
    expect(metaContent('meta[property="og:type"]')).toBe('website')
  })

  it('re-applies meta when the initial navigation resolves onto the home path', async () => {
    holder.route = reactive<MetaRoute & { fullPath: string }>({
      path: '/',
      name: undefined,
      params: {},
      query: {},
      meta: {},
      fullPath: '/',
    }) as unknown as MetaRoute
    useRouteMeta()
    await nextTick()
    expect(document.title).toBe('Francis Paul Amadeo')

    Object.assign(holder.route, {
      name: 'Experience',
      meta: {
        title: 'Francis Paul Amadeo — Full Stack Software Engineer',
        description: 'Portfolio of Francis Paul Amadeo.',
      },
    })
    await nextTick()
    expect(document.title).toBe(
      'Francis Paul Amadeo — Full Stack Software Engineer',
    )
  })
})