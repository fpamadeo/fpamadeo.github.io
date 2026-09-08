import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import HighlightComponent from '../HighlightComponent.vue'

const mockDefaultEntry = {
  UID: 1,
  Company: 'Test Company',
  Title: 'Test Title',
  Summary: 'Test summary',
  Highlights: [
    'First highlight',
    'Second highlight',
  ],
  Bullets: [
    'First bullet',
    'Second bullet',
  ],
  related: [2, 3],
  tags: ['Domain: Healthcare', 'Stack: Python'],
  media: '',
}

describe('HighlightComponent', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(HighlightComponent, {
      props: {
        selectedEntry: undefined,
        defaultEntry: mockDefaultEntry,
        searchQuery: '',
        tagFilterEnabled: false,
        activeTag: '',
      },
    })
  })

  afterEach(() => {
    if (wrapper) wrapper.unmount()
  })

  describe('Desktop Layout', () => {
    it('renders highlight section', () => {
      expect(wrapper.find('.highlight').exists()).toBe(true)
    })

    it('renders highlights before bullets before tags', () => {
      const section = wrapper.findAll('.highlight-section-title')
      expect(section[0].text()).toBe('HIGHLIGHTS')
      expect(section[1].text()).toBe('BULLETS')
      expect(section[2].text()).toBe('TAGS')
    })

    it('renders list items for highlights', () => {
      const items = wrapper.findAll('.highlight-list li')
      expect(items).toHaveLength(4)
    })

    it('displays related entries count', () => {
      const relations = wrapper.find('.highlight-relations')
      expect(relations.exists()).toBe(true)
      expect(wrapper.find('.relations-count').text()).toBe('2')
    })

    it('shows media when provided', async () => {
      const entryWithMedia = {
        ...mockDefaultEntry,
        media: '/test-image.jpg',
      }

      await wrapper.setProps({ selectedEntry: entryWithMedia })

      expect(wrapper.find('.highlight-img').exists()).toBe(true)
    })

    it('applies cover as default mediaFit', async () => {
      const entryWithMedia = {
        ...mockDefaultEntry,
        media: '/test-image.jpg',
      }

      await wrapper.setProps({ selectedEntry: entryWithMedia })

      const img = wrapper.find('.highlight-img')
      expect(img.attributes('style')).toContain('object-fit: cover')
    })

    it('applies as-is mediaFit styles', async () => {
      const entryWithMedia = {
        ...mockDefaultEntry,
        media: '/test-image.jpg',
        mediaFit: 'as-is',
      }

      await wrapper.setProps({ selectedEntry: entryWithMedia })

      const img = wrapper.find('.highlight-img')
      expect(img.attributes('style')).toContain('object-fit: none')
      expect(img.attributes('style')).toContain('width: auto')
      expect(img.attributes('style')).toContain('height: auto')
      expect(img.attributes('style')).toContain('max-height: none')
    })

    it('applies force-height mediaFit styles', async () => {
      const entryWithMedia = {
        ...mockDefaultEntry,
        media: '/test-image.jpg',
        mediaFit: 'force-height',
      }

      await wrapper.setProps({ selectedEntry: entryWithMedia })

      const img = wrapper.find('.highlight-img')
      expect(img.attributes('style')).toContain('max-height: none')
      expect(img.attributes('style')).toContain('object-fit: fill')
    })

    it('applies force-width mediaFit styles', async () => {
      const entryWithMedia = {
        ...mockDefaultEntry,
        media: '/test-image.jpg',
        mediaFit: 'force-width',
      }

      await wrapper.setProps({ selectedEntry: entryWithMedia })

      const img = wrapper.find('.highlight-img')
      expect(img.attributes('style')).toContain('width: auto')
      expect(img.attributes('style')).toContain('object-fit: fill')
    })

    it('handles selected entry', async () => {
      const selectedEntry = {
        UID: 2,
        Company: 'Selected Company',
        Title: 'Selected Title',
        Summary: 'Selected summary',
        Highlights: ['Selected highlight'],
        Bullets: [],
        related: [],
        tags: [],
      }

      await wrapper.setProps({ selectedEntry })

      expect(wrapper.find('.highlight-section').exists()).toBe(true)
    })

    it('renders search highlighting', async () => {
      await wrapper.setProps({ searchQuery: 'First' })

      const highlighted = wrapper.findAll('.item-text')
      expect(highlighted[0].html()).toContain('<mark>')
    })
  })

  describe('Tag Badges', () => {
    it('renders tag pills when entry has tags', () => {
      const pills = wrapper.findAll('.tag-pill')
      expect(pills.length).toBe(2)
    })

    it('tag badges section has correct title', () => {
      const titles = wrapper.findAll('.highlight-section-title')
      expect(titles.map(t => t.text())).toContain('TAGS')
    })

    it('tag pills are disabled when tagFilterEnabled is false', () => {
      const pill = wrapper.find('.tag-pill')
      expect(pill.attributes('disabled')).toBeDefined()
    })

    it('tag pills become enabled when tagFilterEnabled is true', async () => {
      await wrapper.setProps({ tagFilterEnabled: true })
      const pill = wrapper.find('.tag-pill')
      expect(pill.attributes('disabled')).toBeUndefined()
    })

    it('clicking enabled tag pill emits tag-badge-click', async () => {
      await wrapper.setProps({ tagFilterEnabled: true })
      const pill = wrapper.find('.tag-pill')
      await pill.trigger('click')

      expect(wrapper.emitted('tag-badge-click')).toBeTruthy()
      expect(wrapper.emitted('tag-badge-click')![0][0]).toBe('Domain: Healthcare')
    })

    it('active tag pill has is-active class', async () => {
      await wrapper.setProps({ tagFilterEnabled: true, activeTag: 'Domain: Healthcare' })
      const pill = wrapper.find('.tag-pill.is-active')
      expect(pill.exists()).toBe(true)
    })

    it('non-matching active tag does not highlight other pills', async () => {
      await wrapper.setProps({ tagFilterEnabled: true, activeTag: 'Stack: Python' })
      const pills = wrapper.findAll('.tag-pill')
      expect(pills[1].classes()).toContain('is-active')
      expect(pills[0].classes()).not.toContain('is-active')
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

  wrapper = mount(HighlightComponent, {
    props: {
      selectedEntry: undefined,
      defaultEntry: mockDefaultEntry,
          searchQuery: '',
          tagFilterEnabled: false,
          activeTag: '',
        },
      })
    })

    it('renders on mobile viewport', () => {
      expect(wrapper.find('.highlight').exists()).toBe(true)
    })

    it('highlight component exists with correct classes on mobile', () => {
      const highlight = wrapper.find('.highlight')
      expect(highlight.exists()).toBe(true)
      expect(highlight.classes()).toContain('highlight')
    })

    it('related entries display correctly on mobile', () => {
      const relations = wrapper.find('.highlight-relations')
      expect(relations.exists()).toBe(true)
    })
  })

  describe('Mobile Detail View', () => {
    const navEntries = [
      { id: 1, Title: 'Entry One', subtitle: 'First' },
      { id: 2, Title: 'Entry Two', subtitle: 'Second' },
      { id: 3, Title: 'Entry Three', subtitle: 'Third' },
    ]
    const selectedEntry = {
      ...mockDefaultEntry,
      id: 2,
      Title: 'Entry Two',
    }
    const baseProps = {
      selectedEntry,
      defaultEntry: mockDefaultEntry,
      entries: navEntries,
      mobileDetail: true,
    }

    it('adds is-mobile-detail class when mobileDetail is true', () => {
      const w = mount(HighlightComponent, { props: baseProps })
      expect(w.find('.highlight').classes()).toContain('is-mobile-detail')
      w.unmount()
    })

    it('omits is-mobile-detail class when mobileDetail is false', () => {
      const w = mount(HighlightComponent, {
        props: { ...baseProps, mobileDetail: false },
      })
      expect(w.find('.highlight').classes()).not.toContain('is-mobile-detail')
      w.unmount()
    })

    it('renders the nav block with a swipe hint in detail mode', () => {
      const w = mount(HighlightComponent, { props: baseProps })
      expect(w.find('.highlight-nav').exists()).toBe(true)
      expect(w.find('.nav-prev').exists()).toBe(true)
      expect(w.find('.nav-next').exists()).toBe(true)
      expect(w.find('.nav-swipe-hint').exists()).toBe(true)
      w.unmount()
    })

    it('emits expand-request when the nav panel background is clicked', async () => {
      const w = mount(HighlightComponent, { props: baseProps })
      await w.find('.highlight-nav').trigger('click')
      expect(w.emitted('expand-request')).toBeTruthy()
      w.unmount()
    })

    it('does not emit expand-request when a nav button is clicked', async () => {
      const w = mount(HighlightComponent, { props: baseProps })
      await w.find('.nav-next').trigger('click')
      expect(w.emitted('expand-request')).toBeFalsy()
      expect(w.emitted('navigate')).toBeTruthy()
      w.unmount()
    })

    it('navigates to the next entry on a horizontal left swipe', async () => {
      const w = mount(HighlightComponent, { props: baseProps })
      const nav = w.find('.highlight-nav')
      await nav.trigger('touchstart', { touches: [{ clientX: 200, clientY: 100 }] })
      await nav.trigger('touchmove', { touches: [{ clientX: 80, clientY: 100 }] })
      await nav.trigger('touchend')
      expect(w.emitted('navigate')).toBeTruthy()
      expect(w.emitted('navigate')![0][0]).toBe(3)
      w.unmount()
    })

    it('navigates to the previous entry on a horizontal right swipe', async () => {
      const w = mount(HighlightComponent, { props: baseProps })
      const nav = w.find('.highlight-nav')
      await nav.trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
      await nav.trigger('touchmove', { touches: [{ clientX: 220, clientY: 100 }] })
      await nav.trigger('touchend')
      expect(w.emitted('navigate')).toBeTruthy()
      expect(w.emitted('navigate')![0][0]).toBe(1)
      w.unmount()
    })

    it('does not navigate on a vertical swipe', async () => {
      const w = mount(HighlightComponent, { props: baseProps })
      const nav = w.find('.highlight-nav')
      await nav.trigger('touchstart', { touches: [{ clientX: 200, clientY: 100 }] })
      await nav.trigger('touchmove', { touches: [{ clientX: 180, clientY: 300 }] })
      await nav.trigger('touchend')
      expect(w.emitted('navigate')).toBeFalsy()
      w.unmount()
    })
  })

  describe('Content Rendering', () => {
    it('renders markdown in highlights', () => {
      const entryWithMarkdown = {
        ...mockDefaultEntry,
        Highlights: ['**Bold** and *italic*'],
      }

      const wrapper = mount(HighlightComponent, {
        props: {
          selectedEntry: entryWithMarkdown,
          defaultEntry: mockDefaultEntry,
          searchQuery: '',
        },
      })

      const item = wrapper.find('.item-text')
      expect(item.html()).toContain('<strong>')
    })

    it('handles entry with Content field', async () => {
      const entryWithContent = {
        ...mockDefaultEntry,
        body: 'This is the content field',
      }

      await wrapper.setProps({ selectedEntry: entryWithContent })

      expect(wrapper.find('.content-body').exists()).toBe(true)
      // Tags section still renders; highlights and bullets sections should be hidden
      expect(wrapper.find('.highlight-list').exists()).toBe(false)
    })

    it('handles WORK IN PROGRESS content', async () => {
      const wipEntry = {
        ...mockDefaultEntry,
        isWip: true,
        body: 'Content visible beneath overlay',
      }

      await wrapper.setProps({ selectedEntry: wipEntry })

      expect(wrapper.find('.wip-overlay').exists()).toBe(true)
      expect(wrapper.find('.wip-watermark').text()).toContain('WORK IN PROGRESS')
      expect(wrapper.find('.highlight-content').exists()).toBe(true)
    })
  })

  describe('Tag Click Interactions', () => {
    it('emits tag-click with UID when item with tag is clicked', async () => {
      const entryWithTaggedItems = {
        id: 1,
        Title: 'Test',
        subtitle: 'Test',
        Highlights: [
          { text: 'Item with tag', tagUID: 5 },
          'Regular item',
        ],
        Bullets: [],
        related: [],
        tags: [],
      }

      const wrapper = mount(HighlightComponent, {
        props: {
          selectedEntry: entryWithTaggedItems,
          defaultEntry: mockDefaultEntry,
          searchQuery: '',
        },
      })

      const items = wrapper.findAll('.highlight-list li')
      await items[0].trigger('click')

      expect(wrapper.emitted('tag-click')).toBeTruthy()
      expect(wrapper.emitted('tag-click')![0][0]).toBe(5)
    })
  })

  describe('Prinny Easter Egg', () => {
    /**
     * The Prinny overlay is rendered in App.vue (via provide/inject).
     * HighlightComponent only holds the trigger logic — a watcher that
     * calls the injected `triggerPrinny()` when searchQuery matches
     * "dood" or "prinny". These tests verify the callback fires correctly.
     */

    function mountWithTrigger(initialQuery = '') {
      const mockTrigger = vi.fn()
      const w = mount(HighlightComponent, {
        props: {
          selectedEntry: undefined,
          defaultEntry: mockDefaultEntry,
          searchQuery: initialQuery,
        },
        global: {
          provide: {
            triggerPrinny: mockTrigger,
          },
        },
      })
      return { wrapper: w, mockTrigger }
    }

    it('calls triggerPrinny when searchQuery changes to "dood"', async () => {
      const { wrapper: w, mockTrigger } = mountWithTrigger()
      await w.setProps({ searchQuery: 'dood' })
      expect(mockTrigger).toHaveBeenCalledTimes(1)
    })

    it('calls triggerPrinny when searchQuery changes to "prinny"', async () => {
      const { wrapper: w, mockTrigger } = mountWithTrigger()
      await w.setProps({ searchQuery: 'prinny' })
      expect(mockTrigger).toHaveBeenCalledTimes(1)
    })

    it('does not call triggerPrinny for normal search queries', async () => {
      const { wrapper: w, mockTrigger } = mountWithTrigger()
      await w.setProps({ searchQuery: 'react' })
      expect(mockTrigger).not.toHaveBeenCalled()
    })

    it('is case-insensitive ("DOOD" triggers)', async () => {
      const { wrapper: w, mockTrigger } = mountWithTrigger()
      await w.setProps({ searchQuery: 'DOOD' })
      expect(mockTrigger).toHaveBeenCalledTimes(1)
    })

    it('trims whitespace around trigger words', async () => {
      const { wrapper: w, mockTrigger } = mountWithTrigger()
      await w.setProps({ searchQuery: '  dood  ' })
      expect(mockTrigger).toHaveBeenCalledTimes(1)
    })
  })

  describe('Footnote', () => {
    it('renders footnote section when footnote is present', async () => {
      const entryWithFootnote = {
        ...mockDefaultEntry,
        footnote: 'This is a footnote about the content.',
      }

      await wrapper.setProps({ selectedEntry: entryWithFootnote })

      const allTitles = wrapper.findAll('.highlight-section-title')
      const footnoteTitle = allTitles.find(t => t.text() === 'FOOTNOTE')
      expect(footnoteTitle).toBeTruthy()
    })

    it('does not render footnote section when footnote is absent', async () => {
      const entryWithoutFootnote = {
        ...mockDefaultEntry,
        footnote: '',
      }

      await wrapper.setProps({ selectedEntry: entryWithoutFootnote })

      const allTitles = wrapper.findAll('.highlight-section-title')
      const footnoteTitle = allTitles.find(t => t.text() === 'FOOTNOTE')
      expect(footnoteTitle).toBeUndefined()
    })

    it('renders footnote content with markdown', async () => {
      const entryWithFootnote = {
        ...mockDefaultEntry,
        footnote: 'See [this link](https://example.com) for more.',
      }

      await wrapper.setProps({ selectedEntry: entryWithFootnote })

      const footnoteContent = wrapper.find('.footnote-content')
      expect(footnoteContent.exists()).toBe(true)
      expect(footnoteContent.html()).toContain('<a href="https://example.com">')
    })
  })
})
