import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchBar from '../SearchBar.vue'

describe('SearchBar', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(SearchBar)
  })

  describe('Desktop Layout', () => {
    it('renders search input and button', () => {
      const input = wrapper.find('input')
      const button = wrapper.find('button')

      expect(input.exists()).toBe(true)
      expect(button.exists()).toBe(true)
    })

    it('emits search event on button click', async () => {
      const input = wrapper.find('input')
      await input.setValue('test query')

      const button = wrapper.find('button')
      await button.trigger('click')

      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')[0]).toEqual(['test query'])
    })

    it('emits search event on Enter key', async () => {
      const input = wrapper.find('input')
      await input.setValue('enter query')
      await input.trigger('keydown.enter')

      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')[0]).toEqual(['enter query'])
    })

    it('trims whitespace from search query', async () => {
      const input = wrapper.find('input')
      await input.setValue('  trimmed query  ')
      await input.trigger('keydown.enter')

      expect(wrapper.emitted('search')[0]).toEqual(['trimmed query'])
    })

    it('clears input via exposed clear method', async () => {
      const input = wrapper.find('input')
      await input.setValue('some text')

      wrapper.vm.clear()

      expect(wrapper.vm.query).toBe('')
      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')[0]).toEqual([''])
    })

    it('sets input value via exposed setQuery method', async () => {
      wrapper.vm.setQuery('restored query')

      expect(wrapper.vm.query).toBe('restored query')
    })

    it('has correct ARIA attributes', () => {
      expect(wrapper.attributes('role')).toBe('search')
      expect(wrapper.find('input').attributes('aria-label')).toBe('Search entries')
      expect(wrapper.find('button').attributes('aria-label')).toBe('Submit search')
    })
  })

  describe('Mobile Layout', () => {
    beforeEach(() => {
      wrapper = mount(SearchBar, {
        global: {
          stubs: {
            teleport: true,
          },
        },
      })
    })

    it('search bar remains visible on mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 375,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        value: 667,
      })

      expect(wrapper.find('.search-bar').exists()).toBe(true)
    })

    it('input field is functional on touch devices', async () => {
      const input = wrapper.find('input')

      await input.setValue('mobile test')
      expect(wrapper.vm.query).toBe('mobile test')
    })

    it('button is tappable on mobile', async () => {
      const button = wrapper.find('button')

      await button.trigger('click')
      expect(wrapper.emitted('search')).toBeTruthy()
    })

    it('enter key works on mobile keyboard', async () => {
      const input = wrapper.find('input')

      await input.setValue('mobile enter')
      await input.trigger('keydown.enter')
      expect(wrapper.emitted('search')).toBeTruthy()
    })
  })

  describe('Rick Roll Easter Egg', () => {
    it('opens Rick Astley video for "rick"', async () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => {})

      const input = wrapper.find('input')
      await input.setValue('rick')
      await input.trigger('keydown.enter')

      expect(openSpy).toHaveBeenCalledWith(
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        '_blank',
        'noopener,noreferrer'
      )

      openSpy.mockRestore()
    })

    it('opens Rick Astley video for "Rick Astley"', async () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => {})

      const input = wrapper.find('input')
      await input.setValue('Rick Astley')
      await input.trigger('keydown.enter')

      expect(openSpy).toHaveBeenCalled()

      openSpy.mockRestore()
    })

    it('does not trigger for non-rick queries', async () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => {})

      const input = wrapper.find('input')
      await input.setValue('normal search')
      await input.trigger('keydown.enter')

      expect(openSpy).not.toHaveBeenCalled()

      openSpy.mockRestore()
    })
  })
})