import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { reactive, nextTick } from 'vue'
import OtherPage from '../OtherPage.vue'
import writingData from '@/data/writing.json'
import { buildSlugMap, buildUidToSlugMap } from '@/utils/slugs'
import type { WritingEntry } from '@/types'

const writingEntries = writingData as WritingEntry[]
const slugMap = buildSlugMap(writingEntries)
const uidToSlugMap = buildUidToSlugMap(writingEntries)

type RouteState = {
  name: string
  params: Record<string, string>
  query: Record<string, string>
  fullPath: string
}

const { holder, mockRouter } = vi.hoisted(() => ({
  holder: { route: null as RouteState | null },
  mockRouter: {
    replace: vi.fn(),
    push: vi.fn(),
  },
}))

vi.mock('vue-router', () => ({
  useRoute: () => holder.route,
  useRouter: () => mockRouter,
}))

describe('OtherPage', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    vi.clearAllMocks()
    holder.route = reactive({
      name: 'Other',
      params: {},
      query: {},
      fullPath: '/other',
    })
  })

  afterEach(() => {
    if (wrapper) wrapper.unmount()
  })

  describe('Desktop Layout', () => {
    it('renders default overview when no slug is present', async () => {
      wrapper = mount(OtherPage)
      await nextTick()

      expect(wrapper.find('.sidebar-summary').exists()).toBe(true)
      expect(wrapper.find('.highlight').exists()).toBe(true)
      expect(wrapper.find('.highlight-title').exists()).toBe(false)
    })

    it('selects entry and displays content on direct slug route load', async () => {
      const firstSlug = Array.from(slugMap.keys())[0]
      const expectedEntry = slugMap.get(firstSlug)!

      holder.route!.name = 'OtherEntry'
      holder.route!.params = { slug: firstSlug }
      holder.route!.fullPath = `/other/${firstSlug}`

      wrapper = mount(OtherPage)
      await nextTick()

      expect(wrapper.find('.sidebar-entry.is-selected').exists()).toBe(true)
      expect(wrapper.find('.highlight-title').text()).toBe(expectedEntry.Title)
    })

    it('updates route with slug when clicking a sidebar entry', async () => {
      wrapper = mount(OtherPage)
      await nextTick()

      const firstEntry = writingEntries[0]
      const expectedSlug = uidToSlugMap.get(firstEntry.UID)!

      const sidebarEntryEl = wrapper.find(`[data-uid="${firstEntry.UID}"]`)
      expect(sidebarEntryEl.exists()).toBe(true)
      await sidebarEntryEl.trigger('click')
      await nextTick()

      expect(mockRouter.replace).toHaveBeenCalledWith({
        name: 'OtherEntry',
        params: { slug: expectedSlug },
      })
    })

    it('updates route when navigating via Next/Prev buttons', async () => {
      const firstEntry = writingEntries[0]
      const firstSlug = uidToSlugMap.get(firstEntry.UID)!

      holder.route!.name = 'OtherEntry'
      holder.route!.params = { slug: firstSlug }
      holder.route!.fullPath = `/other/${firstSlug}`

      wrapper = mount(OtherPage)
      await nextTick()

      const targetEntry = writingEntries[1]
      const targetSlug = uidToSlugMap.get(targetEntry.UID)!

      const highlight = wrapper.findComponent({ name: 'HighlightComponent' })
      highlight.vm.$emit('navigate', targetEntry.UID)
      await nextTick()

      expect(mockRouter.replace).toHaveBeenCalledWith({
        name: 'OtherEntry',
        params: { slug: targetSlug },
      })
    })

    it('reverts route to /other when deselecting', async () => {
      const firstSlug = Array.from(slugMap.keys())[0]
      holder.route!.name = 'OtherEntry'
      holder.route!.params = { slug: firstSlug }
      holder.route!.fullPath = `/other/${firstSlug}`

      wrapper = mount(OtherPage)
      await nextTick()

      const sidebar = wrapper.findComponent({ name: 'SidebarComponent' })
      sidebar.vm.$emit('deselect')
      await nextTick()

      expect(mockRouter.replace).toHaveBeenCalledWith({ name: 'Other' })
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
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('767'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    })

    it('collapses sidebar and updates route when selecting an entry on mobile', async () => {
      wrapper = mount(OtherPage)
      await nextTick()

      const firstEntry = writingEntries[0]
      const expectedSlug = uidToSlugMap.get(firstEntry.UID)!

      const sidebarEntryEl = wrapper.find(`[data-uid="${firstEntry.UID}"]`)
      await sidebarEntryEl.trigger('click')
      await nextTick()

      expect(wrapper.find('.sidebar.is-mobile-collapsed').exists()).toBe(true)
      expect(mockRouter.replace).toHaveBeenCalledWith({
        name: 'OtherEntry',
        params: { slug: expectedSlug },
      })
    })

    it('reverts route to /other on deselect in mobile layout', async () => {
      const firstSlug = Array.from(slugMap.keys())[0]
      holder.route!.name = 'OtherEntry'
      holder.route!.params = { slug: firstSlug }
      holder.route!.fullPath = `/other/${firstSlug}`

      wrapper = mount(OtherPage)
      await nextTick()

      const sidebar = wrapper.findComponent({ name: 'SidebarComponent' })
      sidebar.vm.$emit('deselect')
      await nextTick()

      expect(mockRouter.replace).toHaveBeenCalledWith({ name: 'Other' })
    })
  })
})
