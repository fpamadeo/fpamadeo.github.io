import { describe, it, expect, afterEach, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { useCollapsibleSidebar } from '../useCollapsibleSidebar'

interface MatchMediaListener {
  (event: { matches: boolean }): void
}

function stubMatchMedia(initialMatches: boolean) {
  const listeners: MatchMediaListener[] = []
  const mql = {
    matches: initialMatches,
    addEventListener: (_type: string, cb: MatchMediaListener) => {
      listeners.push(cb)
    },
    removeEventListener: (_type: string, cb: MatchMediaListener) => {
      const index = listeners.indexOf(cb)
      if (index !== -1) listeners.splice(index, 1)
    },
  }
  return {
    mql,
    setMatches(matches: boolean) {
      mql.matches = matches
      listeners.forEach((cb) => cb({ matches }))
    },
  }
}

function mountComposable() {
  let api!: ReturnType<typeof useCollapsibleSidebar>
  const Host = defineComponent({
    setup() {
      api = useCollapsibleSidebar()
      return () => null
    },
  })
  const wrapper = mount(Host)
  return { wrapper, getApi: () => api }
}

describe('useCollapsibleSidebar', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts expanded', () => {
    const { getApi } = mountComposable()
    expect(getApi().isCollapsed.value).toBe(false)
  })

  it('collapse/toggle are no-ops when matchMedia is unavailable (jsdom)', () => {
    const { getApi } = mountComposable()
    const api = getApi()
    api.collapse()
    expect(api.isCollapsed.value).toBe(false)
    api.toggle()
    expect(api.isCollapsed.value).toBe(false)
  })

  it('collapse/toggle only apply on a mobile viewport', async () => {
    const stub = stubMatchMedia(false)
    vi.stubGlobal('matchMedia', vi.fn(() => stub.mql))
    const { getApi } = mountComposable()
    const api = getApi()

    // Desktop: no-ops
    api.collapse()
    expect(api.isCollapsed.value).toBe(false)
    api.toggle()
    expect(api.isCollapsed.value).toBe(false)

    // Rotate to mobile
    stub.setMatches(true)
    await nextTick()

    api.collapse()
    expect(api.isCollapsed.value).toBe(true)
    api.toggle()
    expect(api.isCollapsed.value).toBe(false)
    api.toggle()
    expect(api.isCollapsed.value).toBe(true)
  })

  it('resets to expanded when leaving mobile', async () => {
    const stub = stubMatchMedia(true)
    vi.stubGlobal('matchMedia', vi.fn(() => stub.mql))
    const { getApi } = mountComposable()
    const api = getApi()

    api.collapse()
    expect(api.isCollapsed.value).toBe(true)

    stub.setMatches(false)
    await nextTick()
    expect(api.isCollapsed.value).toBe(false)
  })

  it('removes the matchMedia listener on unmount', () => {
    const stub = stubMatchMedia(true)
    vi.stubGlobal('matchMedia', vi.fn(() => stub.mql))
    const { wrapper } = mountComposable()
    const removeSpy = vi.spyOn(stub.mql, 'removeEventListener')
    wrapper.unmount()
    expect(removeSpy).toHaveBeenCalled()
  })
})
