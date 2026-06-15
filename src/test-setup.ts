global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  get root(): Element | Document | null { return null }
  get rootMargin(): string { return '' }
  get thresholds(): ReadonlyArray<number> { return [] }
  takeRecords(): IntersectionObserverEntry[] { return [] }
} as unknown as typeof IntersectionObserver