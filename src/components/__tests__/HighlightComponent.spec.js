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
  let wrapper

  beforeEach(() => {
    wrapper = mount(HighlightComponent, {
      props: {
        selectedEntry: null,
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
      expect(wrapper.emitted('tag-badge-click')[0][0]).toBe('Domain: Healthcare')
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
          selectedEntry: null,
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
        Content: 'This is the content field',
      }

      await wrapper.setProps({ selectedEntry: entryWithContent })

      expect(wrapper.find('.content-body').exists()).toBe(true)
      // Tags section still renders; highlights and bullets sections should be hidden
      expect(wrapper.find('.highlight-list').exists()).toBe(false)
    })

    it('handles WORK IN PROGRESS content', async () => {
      const wipEntry = {
        ...mockDefaultEntry,
        Content: 'WORK IN PROGRESS',
      }

      await wrapper.setProps({ selectedEntry: wipEntry })

      expect(wrapper.find('.highlight--wip').exists()).toBe(true)
      expect(wrapper.find('.wip-label').text()).toBe('This piece is not yet published.')
    })
  })

  describe('Tag Click Interactions', () => {
    it('emits tag-click with UID when item with tag is clicked', async () => {
      const entryWithTaggedItems = {
        UID: 1,
        Company: 'Test',
        Title: 'Test',
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
      expect(wrapper.emitted('tag-click')[0][0]).toBe(5)
    })
  })

  describe('Prinny Easter Egg', () => {
    it('is hidden by default', () => {
      const overlay = wrapper.find('.prinny-overlay')
      expect(overlay.exists()).toBe(true)
      expect(overlay.classes()).not.toContain('prinny-overlay--visible')
    })

    it('appears when searchQuery is "dood"', async () => {
      await wrapper.setProps({ searchQuery: 'dood' })
      const overlay = wrapper.find('.prinny-overlay')
      expect(overlay.classes()).toContain('prinny-overlay--visible')
    })

    it('appears when searchQuery is "prinny"', async () => {
      await wrapper.setProps({ searchQuery: 'prinny' })
      const overlay = wrapper.find('.prinny-overlay')
      expect(overlay.classes()).toContain('prinny-overlay--visible')
    })

    it('hides on click', async () => {
      await wrapper.setProps({ searchQuery: 'dood' })
      const overlay = wrapper.find('.prinny-overlay')
      expect(overlay.classes()).toContain('prinny-overlay--visible')
      await overlay.trigger('click')
      expect(overlay.classes()).not.toContain('prinny-overlay--visible')
    })

    it('auto-dismisses after 5 seconds', async () => {
      vi.useFakeTimers()
      await wrapper.setProps({ searchQuery: 'dood' })
      const overlay = wrapper.find('.prinny-overlay')
      expect(overlay.classes()).toContain('prinny-overlay--visible')
      vi.advanceTimersByTime(5000)
      await wrapper.vm.$nextTick()
      expect(overlay.classes()).not.toContain('prinny-overlay--visible')
      vi.useRealTimers()
    })
  })
})
