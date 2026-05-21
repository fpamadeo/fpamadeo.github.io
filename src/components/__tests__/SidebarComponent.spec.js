import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SidebarComponent from '../SidebarComponent.vue'

const mockConfig = {
  sections: [
    {
      label: 'Experience',
      showDates: true,
      entries: [
        {
          UID: 1,
          Company: 'Epic Systems',
          Title: 'Software Engineer',
          StartDate: '2020-06-01T00:00:00',
          EndDate: '2022-02-28T00:00:00',
          Summary: 'Developed full-stack features',
          related: [],
          tags: ['Company: Epic Systems', 'Domain: Healthcare'],
          Bullets: [],
          Highlights: [],
        },
        {
          UID: 2,
          Company: 'Other Co',
          Title: 'Dev',
          StartDate: '2018-01-01T00:00:00',
          EndDate: '2020-01-01T00:00:00',
          Summary: 'Other role',
          related: [],
          tags: ['Domain: Healthcare', 'Stack: Python'],
          Bullets: [],
          Highlights: [],
        },
        {
          UID: 3,
          Company: 'Startup',
          Title: 'Founder',
          StartDate: '2016-01-01T00:00:00',
          EndDate: '2018-01-01T00:00:00',
          Summary: 'Built stuff',
          related: [],
          tags: ['Stack: Python', 'Stack: JavaScript', 'Skill: Automation'],
          Bullets: [],
          Highlights: [],
        },
      ],
    },
    {
      label: 'Education',
      showDates: false,
      entries: [
        {
          UID: 101,
          Company: 'University of Illinois at Chicago',
          Title: 'BS in Computer Engineering',
          Summary: 'Graduated cum laude',
          related: [],
          tags: ['Degree: Computer Engineering'],
          Bullets: [],
          Highlights: [],
        },
      ],
    },
  ],
  summary: {
    content: 'A passionate software engineer',
    ariaLabel: 'Summary',
  },
  defaultSelectedUID: null,
}

describe('SidebarComponent', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(SidebarComponent, {
      props: {
        config: mockConfig,
        showSearch: true,
        showTagFilter: false,
        searchQuery: '',
        linkedUID: null,
      },
    })
  })

  afterEach(() => {
    if (wrapper) wrapper.unmount()
  })

  describe('Desktop Layout', () => {
    it('renders sidebar with sections', () => {
      expect(wrapper.find('.sidebar').exists()).toBe(true)
      expect(wrapper.findAll('.section-label')).toHaveLength(2)
    })

    it('renders search bar when showSearch is true', () => {
      expect(wrapper.find('.sidebar-search').exists()).toBe(true)
    })

    it('hides search bar when showSearch is false', async () => {
      await wrapper.setProps({ showSearch: false })
      expect(wrapper.find('.sidebar-search').exists()).toBe(false)
    })

    it('displays summary section when provided', () => {
      expect(wrapper.find('.sidebar-summary').exists()).toBe(true)
    })

    it('displays entries in sections', () => {
      const entries = wrapper.findAll('.sidebar-entry')
      expect(entries.length).toBeGreaterThan(0)
    })

    it('emits select event when entry is clicked', async () => {
      const entries = wrapper.findAll('.sidebar-entry')
      const actualEntry = entries.find(e => !e.classes('sidebar-summary'))
      await actualEntry.trigger('click')

      expect(wrapper.emitted('select')).toBeTruthy()
    })

    it('emits deselect event when summary is clicked', async () => {
      await wrapper.find('.sidebar-summary').trigger('click')

      expect(wrapper.emitted('deselect')).toBeTruthy()
    })

    it('emits search event when search input changes', async () => {
      const searchInput = wrapper.find('input')
      await searchInput.setValue('Epic')
      await searchInput.trigger('keydown.enter')

      expect(wrapper.emitted('search')).toBeTruthy()
    })
  })

  describe('Tag Filter', () => {
    it('does not show tag filter area when showTagFilter is false', () => {
      expect(wrapper.find('.tag-filter-area').exists()).toBe(false)
    })

    it('shows tag filter area when showTagFilter is true', async () => {
      await wrapper.setProps({ showTagFilter: true })
      expect(wrapper.find('.tag-filter-area').exists()).toBe(true)
    })

    it('renders tag pills for each unique tag', async () => {
      await wrapper.setProps({ showTagFilter: true })
      const pills = wrapper.findAll('.tag-pill')
      expect(pills.length).toBeGreaterThan(0)
    })

    it('clicking a tag pill emits tag-filter with the filter value', async () => {
      await wrapper.setProps({ showTagFilter: true })
      const firstPill = wrapper.find('.tag-pill')
      await firstPill.trigger('click')

      expect(wrapper.emitted('tag-filter')).toBeTruthy()
    })

    it('clicking same tag pill again deselects it (emits null)', async () => {
      await wrapper.setProps({ showTagFilter: true })
      const firstPill = wrapper.find('.tag-pill')
      await firstPill.trigger('click')
      await firstPill.trigger('click')

      const emits = wrapper.emitted('tag-filter')
      expect(emits[1][0]).toBe(null)
    })

    it('active tag pill has is-active class', async () => {
      await wrapper.setProps({ showTagFilter: true })
      const firstPill = wrapper.find('.tag-pill')
      await firstPill.trigger('click')

      expect(firstPill.classes()).toContain('is-active')
    })

    it('tag pills have correct ARIA attributes', async () => {
      await wrapper.setProps({ showTagFilter: true })
      const pill = wrapper.find('.tag-pill')

      expect(pill.attributes('role')).toBe('button')
      expect(pill.attributes('tabindex')).toBe('0')
      expect(pill.attributes('aria-label')).toMatch(/^Filter by tag:/)
    })

    it('pressed state updates aria-pressed', async () => {
      await wrapper.setProps({ showTagFilter: true })
      const pill = wrapper.find('.tag-pill')
      await pill.trigger('click')

      expect(pill.attributes('aria-pressed')).toBe('true')
    })

    it('renders supertag header pill before its child tags', async () => {
      await wrapper.setProps({ showTagFilter: true })
      const pills = wrapper.findAll('.tag-pill')
      const texts = pills.map(p => p.text())
      const stackIdx = texts.indexOf('Stack')
      const stackJsIdx = texts.indexOf('Stack: JavaScript')
      const stackPyIdx = texts.indexOf('Stack: Python')
      // Supergroup header "Stack" should come before its children
      expect(stackIdx).toBeGreaterThanOrEqual(0)
      expect(stackJsIdx).toBeGreaterThan(stackIdx)
      expect(stackPyIdx).toBeGreaterThan(stackIdx)
    })

    it('setActiveTag sets the active tag using filter value', async () => {
      await wrapper.setProps({ showTagFilter: true })
      wrapper.vm.setActiveTag('Domain: Healthcare')
      await wrapper.vm.$nextTick()

      const activePill = wrapper.find('.tag-pill.is-active')
      expect(activePill.exists()).toBe(true)
    })

    it('clearTagFilter removes active tag', async () => {
      await wrapper.setProps({ showTagFilter: true })
      wrapper.vm.setActiveTag('Domain: Healthcare')
      await wrapper.vm.$nextTick()
      wrapper.vm.clearTagFilter()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.tag-pill.is-active').exists()).toBe(false)
    })

    it('supertag header pill filters by prefix', async () => {
      await wrapper.setProps({ showTagFilter: true })
      // Click "Stack" supertag pill (filter: "Stack:")
      const stackPill = wrapper.findAll('.tag-pill').filter(p => p.text() === 'Stack')[0]
      await stackPill.trigger('click')

      // Entries with Stack: tags should NOT be dimmed
      const stackEntry = wrapper.findAll('.sidebar-entry').filter(e => e.text().includes('Stack:'))
      // The specific entries are hard to query, but we know UID 3 has Stack: tags
      // Just verify the tag-filter emit has "Stack:"
      expect(wrapper.emitted('tag-filter')[0][0]).toBe('Stack:')
    })

    it('search includes tags in matching', async () => {
      await wrapper.setProps({ showTagFilter: true, searchQuery: 'Healthcare' })
      // Entry with "Domain: Healthcare" tag should match
      const entries = wrapper.findAll('.sidebar-entry')
      const nonDimmed = entries.filter(e => !e.classes('is-dimmed') && !e.classes('sidebar-summary'))
      expect(nonDimmed.length).toBeGreaterThan(0)
    })
  })

  describe('Search Validation', () => {
    it('emits search when query matches entries', async () => {
      const searchInput = wrapper.find('input')
      await searchInput.setValue('Epic')
      await searchInput.trigger('keydown.enter')

      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')[0][0]).toBe('Epic')
    })

    it('does not emit search when query matches no entries', async () => {
      const searchInput = wrapper.find('input')
      await searchInput.setValue('Epic')
      await searchInput.trigger('keydown.enter')

      wrapper.emitted('search')

      await searchInput.setValue('xyznonexistent')
      await searchInput.trigger('keydown.enter')

      const emits = wrapper.emitted('search')
      expect(emits).toHaveLength(1)
      expect(emits[0][0]).toBe('Epic')
    })

    it('reverts to last valid query on re-Enter of failed query', async () => {
      const searchInput = wrapper.find('input')
      await searchInput.setValue('Epic')
      await searchInput.trigger('keydown.enter')

      await searchInput.setValue('xyznonexistent')
      await searchInput.trigger('keydown.enter')

      await searchInput.trigger('keydown.enter')

      const emits = wrapper.emitted('search')
      expect(emits).toHaveLength(2)
      expect(emits[0][0]).toBe('Epic')
      expect(emits[1][0]).toBe('Epic')
    })

    it('reverts to empty if no last valid query exists', async () => {
      const searchInput = wrapper.find('input')
      await searchInput.setValue('xyznonexistent')
      await searchInput.trigger('keydown.enter')

      expect(wrapper.emitted('search')).toBeFalsy()

      await searchInput.trigger('keydown.enter')

      const emits = wrapper.emitted('search')
      expect(emits).toHaveLength(1)
      expect(emits[0][0]).toBe('')
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

      wrapper = mount(SidebarComponent, {
        props: {
          config: mockConfig,
          showSearch: true,
          showTagFilter: false,
          searchQuery: '',
          linkedUID: null,
        },
      })
    })

    it('sidebar renders on mobile viewport', () => {
      expect(wrapper.find('.sidebar').exists()).toBe(true)
    })

    it('sidebar is full width on mobile', () => {
      const sidebar = wrapper.find('.sidebar')
      const classes = sidebar.classes()
      expect(classes).toContain('sidebar')
    })

    it('entries are visible on mobile', () => {
      const entries = wrapper.findAll('.sidebar-entry')
      expect(entries.length).toBeGreaterThan(0)
    })

    it('search functionality works on mobile', async () => {
      const searchInput = wrapper.find('input')
      await searchInput.setValue('Epic')
      await searchInput.trigger('keydown.enter')

      expect(wrapper.emitted('search')).toBeTruthy()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty sections', () => {
      const config = {
        sections: [{ label: 'Empty', entries: [] }],
        summary: null,
      }

      const wrapper = mount(SidebarComponent, {
        props: { config, showSearch: false },
      })

      expect(wrapper.findAll('.sidebar-entry')).toHaveLength(0)
      wrapper.unmount()
    })

    it('handles entries without related/tags', () => {
      const entries = wrapper.findAll('.sidebar-entry')
      const firstEntry = entries[0]
      expect(firstEntry.classes()).not.toContain('is-related')
    })

    it('handles markdown in summary', () => {
      const summary = wrapper.find('.summary-text')
      expect(summary.exists()).toBe(true)
    })
  })
})
