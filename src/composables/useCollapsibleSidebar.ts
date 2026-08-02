import { ref, onMounted, onUnmounted } from 'vue'

const MOBILE_QUERY = '(max-width: 767px)'

type MediaListener = (event: MediaQueryList | MediaQueryListEvent) => void

/**
 * Responsive collapsed/expanded state for the sidebar on mobile.
 *
 * On desktop (>= 768px) `collapse()`/`expand()`/`toggle()` are no-ops and
 * `isCollapsed` is always `false`, so desktop layout is never affected.
 */
export function useCollapsibleSidebar() {
  const isCollapsed = ref(false)
  const isMobile = ref(false)

  let mql: MediaQueryList | null = null
  let listener: MediaListener | null = null

  onMounted(() => {
    if (typeof window.matchMedia !== 'function') return // jsdom / SSR guard
    mql = window.matchMedia(MOBILE_QUERY)
    listener = (event) => {
      isMobile.value = event.matches
      // Leaving mobile always restores the expanded (list) view.
      if (!event.matches) isCollapsed.value = false
    }
    isMobile.value = mql.matches
    mql.addEventListener('change', listener)
  })

  onUnmounted(() => {
    if (mql && listener) mql.removeEventListener('change', listener)
    mql = null
    listener = null
  })

  function collapse() {
    if (isMobile.value) isCollapsed.value = true
  }

  function expand() {
    if (isMobile.value) isCollapsed.value = false
  }

  function toggle() {
    if (isMobile.value) isCollapsed.value = !isCollapsed.value
  }

  return { isCollapsed, collapse, expand, toggle }
}
