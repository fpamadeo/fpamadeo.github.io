import { describe, it, expect, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { marked } from 'marked'
import { renderMarkdown, renderMarkdownInline } from '@/composables/useMarkdown'
import { useURLSelection } from '@/composables/useURLSelection'
import SidebarComponent from '@/components/SidebarComponent.vue'
import HighlightComponent from '@/components/HighlightComponent.vue'
import ContactPage from '@/views/ContactPage.vue'

/**
 * Security audit: code-injection surface of the markdown -> v-html pipeline.
 *
 * Context (2026-08-02):
 * - 5 components render `marked.parse*()` output via `v-html` with NO sanitizer:
 *   SidebarComponent.vue (L75, L127), HighlightComponent.vue (L92/117/142,
 *   L390/395), ContactPage.vue (L26), AboutPage.vue (L26/43/65).
 * - `marked` v18 passes raw HTML and `javascript:`/`data:` URLs through
 *   unchanged (verified empirically below).
 * - Content sources today are repo-controlled static JSON, so real-world
 *   exposure is low — but there is zero defense-in-depth.
 *
 * The baseline tests below ASSERT the current (unsanitized) behavior to
 * document the vulnerability with proof. The safe-path tests assert what MUST
 * hold regardless. The final `describe.skip` block lists the expectations that
 * would only pass once a sanitizer (e.g. DOMPurify) is introduced.
 */

const SCRIPT_PAYLOAD = '<script>alert(1)</script>'
const IMG_ONERROR_PAYLOAD = '<img src=x onerror=alert(1)>'
const JAVASCRIPT_LINK_PAYLOAD = '[click](javascript:alert(1))'
const IFRAME_PAYLOAD = '<iframe srcdoc="<script>alert(1)</script>"></iframe>'
const DATA_URL_PAYLOAD = '<a href="data:text/html;base64,PHNjcmlwdD4=">x</a>'
const SVG_ONLOAD_PAYLOAD = '<svg onload=alert(1)>'

const sidebarConfig = {
  sections: [
    {
      label: 'Experience',
      showDates: true,
      entries: [
        {
          id: 1,
          Title: 'Malicious Co',
          subtitle: 'Dev',
          StartDate: '2020-01-01T00:00:00',
          EndDate: '2021-01-01T00:00:00',
          Description: IMG_ONERROR_PAYLOAD,
          related: [],
          tags: [],
          Bullets: [],
          Highlights: [],
        },
      ],
    },
  ],
  summary: { content: 'Summary', ariaLabel: 'Summary' },
  defaultSelectedId: null,
}

describe('Sink inventory: marked -> v-html renders without sanitization (baseline)', () => {
  it('passes raw <script> through block parsing', () => {
    expect(marked.parse(SCRIPT_PAYLOAD)).toContain('<script>alert(1)</script>')
  })

  it('passes raw <script> through inline parsing', () => {
    expect(marked.parseInline(SCRIPT_PAYLOAD)).toContain('<script>alert(1)</script>')
  })

  it('passes <img onerror> through block parsing', () => {
    expect(marked.parse(IMG_ONERROR_PAYLOAD)).toContain('onerror=alert(1)')
  })

  it('passes <img onerror> through inline parsing', () => {
    expect(marked.parseInline(IMG_ONERROR_PAYLOAD)).toContain('onerror=alert(1)')
  })

  it('keeps javascript: URL schemes in markdown links', () => {
    const out = marked.parse(JAVASCRIPT_LINK_PAYLOAD)
    expect(out).toContain('href="javascript:alert(1)"')
  })

  it('keeps javascript: URL schemes in markdown image sources', () => {
    const out = marked.parse('![alt](javascript:alert(1))')
    expect(out).toContain('src="javascript:alert(1)"')
  })

  it('keeps entity-encoded javascript: schemes (defeats naive checks)', () => {
    const out = marked.parse('[img](javascript&#58;alert(1))')
    expect(out).toContain('javascript&#58;alert(1)')
  })

  it('passes <iframe srcdoc> through', () => {
    expect(marked.parseInline(IFRAME_PAYLOAD)).toContain('srcdoc="<script>alert(1)</script>"')
  })

  it('passes data:text/html URL schemes through', () => {
    expect(marked.parseInline(DATA_URL_PAYLOAD)).toContain('data:text/html')
  })

  it('passes <svg onload> through', () => {
    expect(marked.parse(SVG_ONLOAD_PAYLOAD)).toContain('onload=alert(1)')
  })

  it('renderMarkdown() does not sanitize (composable wraps marked unchanged)', () => {
    expect(renderMarkdown(IMG_ONERROR_PAYLOAD)).toContain('onerror=alert(1)')
    expect(renderMarkdown(SCRIPT_PAYLOAD)).toContain('<script>alert(1)</script>')
  })

  it('renderMarkdownInline() does not sanitize', () => {
    expect(renderMarkdownInline(IMG_ONERROR_PAYLOAD)).toContain('onerror=alert(1)')
  })
})

describe('Component mount proofs: payloads reach the DOM unsanitized', () => {
  it('SidebarComponent renders entry.Description payload into .entry-summary', () => {
    const wrapper: VueWrapper = mount(SidebarComponent, {
      props: {
        config: sidebarConfig,
        showSearch: false,
        showTagFilter: false,
        searchQuery: '',
        linkedId: undefined,
      },
    })
    const summary = wrapper.find('.entry-summary')
    expect(summary.exists()).toBe(true)
    expect(summary.element.innerHTML).toContain('<img')
    expect(summary.element.innerHTML).toContain('onerror')
    wrapper.unmount()
  })

  it('HighlightComponent renders entry.body payload into .content-body', () => {
    const wrapper: VueWrapper = mount(HighlightComponent, {
      props: {
        selectedEntry: { UID: 1, Title: 'Malicious', body: SVG_ONLOAD_PAYLOAD },
        defaultEntry: {},
        searchQuery: '',
        tagFilterEnabled: false,
        activeTag: '',
      },
    })
    const body = wrapper.find('.content-body')
    expect(body.exists()).toBe(true)
    expect(body.element.innerHTML).toContain('<svg')
    expect(body.element.innerHTML).toContain('onload')
    wrapper.unmount()
  })

  it('HighlightComponent renders Highlight list-item payload into .item-text', () => {
    const wrapper: VueWrapper = mount(HighlightComponent, {
      props: {
        selectedEntry: { UID: 1, Title: 'Malicious', Highlights: [IFRAME_PAYLOAD], Bullets: [], related: [], tags: [] },
        defaultEntry: {},
        searchQuery: '',
        tagFilterEnabled: false,
        activeTag: '',
      },
    })
    const item = wrapper.find('.item-text')
    expect(item.exists()).toBe(true)
    expect(item.element.innerHTML).toContain('srcdoc="<script>alert(1)</script>"')
    wrapper.unmount()
  })
})

describe('Safe paths (must hold today)', () => {
  it('search highlight never injects an unmatched malicious query', () => {
    const out = renderMarkdown('hello world', '<img src=x onerror=alert(1)>')
    expect(out).not.toContain('onerror')
    expect(out).not.toContain('<mark>')
  })

  it('search highlight only wraps matched text (matched text cannot contain <)', () => {
    const out = renderMarkdown('<script>alert(1)</script>', 'alert(1)')
    expect(out).toContain('<mark>alert(1)</mark>')
    expect(out).not.toContain('onerror')
  })

  it('ContactPage mailto href renders from data without template injection', () => {
    const wrapper: VueWrapper = mount(ContactPage)
    const link = wrapper.find('.contact-email')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toMatch(/^mailto:.+@.+$/)
    expect(wrapper.html()).not.toContain('javascript:')
    wrapper.unmount()
  })
})

const { mockRoute } = vi.hoisted(() => ({ mockRoute: { query: {} as Record<string, string> } }))

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
}))

describe('URL/route parameter injection — useURLSelection', () => {
  const Host = defineComponent({
    setup() {
      const selected = ref<Record<string, unknown> | null>(null)
      const { invalidId } = useURLSelection({
        findEntry: (id) => (id === 7 ? { id: 7, Title: 'Entry Seven' } : undefined),
        onSelect: (entry) => { selected.value = entry },
      })
      return { invalidId, selected }
    },
    template: `<div class="host">{{ invalidId ? 'invalid' : 'valid' }}|{{ selected ? selected.Title : 'none' }}</div>`,
  })

  it('rejects a script-injected id param (NaN path) without rendering it', async () => {
    mockRoute.query = { id: '1"><script>alert(1)</script>' }
    const wrapper: VueWrapper = mount(Host)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.host').text()).toBe('invalid|none')
    expect(wrapper.html()).not.toContain('script')
    expect(wrapper.html()).not.toContain('alert')
    wrapper.unmount()
  })

  it('rejects non-numeric and out-of-range ids', async () => {
    mockRoute.query = { id: 'abc' }
    const wrapper: VueWrapper = mount(Host)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.host').text()).toBe('invalid|none')
    wrapper.unmount()
  })

  it('selects a valid numeric id', async () => {
    mockRoute.query = { id: '7' }
    const wrapper: VueWrapper = mount(Host)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.host').text()).toBe('valid|Entry Seven')
    wrapper.unmount()
  })

  it('does nothing when no id param is present', async () => {
    mockRoute.query = {}
    const wrapper: VueWrapper = mount(Host)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.host').text()).toBe('valid|none')
    wrapper.unmount()
  })
})

describe.skip('ADVISORY — expectations that currently FAIL (require a sanitizer like DOMPurify)', () => {
  it('renderMarkdown must strip <script> from output', () => {
    expect(renderMarkdown(SCRIPT_PAYLOAD)).not.toContain('<script>')
  })

  it('renderMarkdown must strip event-handler attributes', () => {
    expect(renderMarkdown(IMG_ONERROR_PAYLOAD)).not.toContain('onerror')
    expect(renderMarkdown(SVG_ONLOAD_PAYLOAD)).not.toContain('onload=')
  })

  it('markdown links must not allow javascript: or data: schemes', () => {
    expect(marked.parse(JAVASCRIPT_LINK_PAYLOAD)).not.toContain('href="javascript:')
    expect(marked.parse(DATA_URL_PAYLOAD)).not.toContain('data:text/html')
  })

  it('must strip <iframe> and other embedding tags', () => {
    expect(renderMarkdownInline(IFRAME_PAYLOAD)).not.toContain('<iframe')
  })

  it('SidebarComponent must not render raw payloads into the DOM', () => {
    const wrapper: VueWrapper = mount(SidebarComponent, {
      props: {
        config: sidebarConfig,
        showSearch: false,
        showTagFilter: false,
        searchQuery: '',
        linkedId: undefined,
      },
    })
    expect(wrapper.find('.entry-summary').element.innerHTML).not.toContain('onerror')
    wrapper.unmount()
  })
})
