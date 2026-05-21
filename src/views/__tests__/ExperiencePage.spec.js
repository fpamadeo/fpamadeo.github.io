import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ExperiencePage from '../ExperiencePage.vue'

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRoute: () => ({ query: { uid: '' } }),
  }
})

describe('ExperiencePage', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(ExperiencePage, {
      global: {
        stubs: {
          AppHeader: { template: '<div></div>' },
          AppFooter: { template: '<div></div>' },
          SidebarComponent: { template: '<div></div>' },
          HighlightComponent: { template: '<div></div>' },
        },
      },
    })
  })

  afterEach(() => {
    if (wrapper) wrapper.unmount()
  })

  describe('Highlight via URL Parameter', () => {
    it('finds entry by valid UID', () => {
      const result = wrapper.vm.findEntryByUID(201)
      expect(result).toBeDefined()
      expect(result.UID).toBe(201)
    })

    it('finds entry from education data', () => {
      const result = wrapper.vm.findEntryByUID(101)
      expect(result).toBeDefined()
      expect(result.UID).toBe(101)
    })

    it('returns null for non-existent UID', () => {
      const result = wrapper.vm.findEntryByUID(99999)
      expect(result).toBe(null)
    })

    it('returns null for invalid UID input', () => {
      const result = wrapper.vm.findEntryByUID('invalid')
      expect(result).toBe(null)
    })
  })

  describe('Failsafe for Invalid UID', () => {
    it('selectedEntry is initially null (shows default highlights)', () => {
      expect(wrapper.vm.selectedEntry).toBe(null)
    })

    it('onDeselect resets selectedEntry to null', () => {
      wrapper.vm.selectedEntry = { UID: 201 }

      wrapper.vm.onDeselect()

      expect(wrapper.vm.selectedEntry).toBe(null)
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

      wrapper = mount(ExperiencePage, {
        global: {
          stubs: {
            AppHeader: { template: '<div></div>' },
            AppFooter: { template: '<div></div>' },
            SidebarComponent: { template: '<div></div>' },
            HighlightComponent: { template: '<div></div>' },
          },
        },
      })
    })

    it('renders on mobile viewport', () => {
      expect(wrapper.find('.page-wrapper').exists()).toBe(true)
      expect(wrapper.find('.page-main').exists()).toBe(true)
    })
  })
})