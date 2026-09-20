import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { reactive, nextTick } from 'vue'
import AppHeader from '../AppHeader.vue'

type RouteState = {
  path: string
  name?: string
  params?: Record<string, string>
  query?: Record<string, string>
}

const { holder } = vi.hoisted(() => ({
  holder: { route: null as RouteState | null },
}))

vi.mock('vue-router', () => ({
  useRoute: () => holder.route,
  RouterLink: {
    name: 'RouterLink',
    props: ['to'],
    template: '<a :href="to"><slot /></a>',
  },
}))

describe('AppHeader', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    holder.route = reactive({
      path: '/',
    })
    wrapper = mount(AppHeader)
  })

  afterEach(() => {
    if (wrapper) wrapper.unmount()
  })

  describe('Desktop Layout', () => {
    it('renders header with title and nav', () => {
      expect(wrapper.find('.header-title').text()).toBe('Francis Paul Amadeo')
      expect(wrapper.find('.header-nav').exists()).toBe(true)
    })

    it('renders skip link targeting #main-content', () => {
      const skipLink = wrapper.find('.skip-link')
      expect(skipLink.exists()).toBe(true)
      expect(skipLink.attributes('href')).toBe('#main-content')
    })

    it('marks "at Work" as active when path is "/"', async () => {
      holder.route!.path = '/'
      await nextTick()

      const links = wrapper.findAll('.header-nav a')
      expect(links[0].text()).toBe('at Work')
      expect(links[0].classes()).toContain('active')
      expect(links[1].classes()).not.toContain('active')
      expect(links[2].classes()).not.toContain('active')
    })

    it('marks "at Life" as active when path is "/about"', async () => {
      holder.route!.path = '/about'
      await nextTick()

      const links = wrapper.findAll('.header-nav a')
      expect(links[1].text()).toBe('at Life')
      expect(links[0].classes()).not.toContain('active')
      expect(links[1].classes()).toContain('active')
      expect(links[2].classes()).not.toContain('active')
    })

    it('marks "at Random" as active when path is "/other"', async () => {
      holder.route!.path = '/other'
      await nextTick()

      const links = wrapper.findAll('.header-nav a')
      expect(links[2].text()).toBe('at Random')
      expect(links[0].classes()).not.toContain('active')
      expect(links[1].classes()).not.toContain('active')
      expect(links[2].classes()).toContain('active')
    })

    it('marks "at Random" as active when path is nested "/other/:slug"', async () => {
      holder.route!.path = '/other/2024-the-movie-watchlist-year'
      await nextTick()

      const links = wrapper.findAll('.header-nav a')
      expect(links[2].text()).toBe('at Random')
      expect(links[0].classes()).not.toContain('active')
      expect(links[1].classes()).not.toContain('active')
      expect(links[2].classes()).toContain('active')
    })
  })

  describe('Mobile Layout', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 375,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: 667,
      })
    })

    it('renders all navigation items on mobile viewport', async () => {
      const links = wrapper.findAll('.header-nav a')
      expect(links).toHaveLength(3)
      expect(links.map((l) => l.text())).toEqual(['at Work', 'at Life', 'at Random'])
    })

    it('updates active nav item correctly on mobile', async () => {
      holder.route!.path = '/about'
      await nextTick()

      const links = wrapper.findAll('.header-nav a')
      expect(links[1].classes()).toContain('active')
    })
  })
})
