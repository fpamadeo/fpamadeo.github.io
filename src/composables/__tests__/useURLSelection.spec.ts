import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, ref, reactive } from 'vue'
import { useURLSelection } from '@/composables/useURLSelection'

type RouteState = {
  query: Record<string, string>
  params: Record<string, string>
  fullPath: string
}

const { holder } = vi.hoisted(() => ({
  holder: { route: null as RouteState | null },
}))

vi.mock('vue-router', () => ({
  useRoute: () => holder.route,
}))

beforeEach(() => {
  holder.route = reactive({
    query: {},
    params: {},
    fullPath: '',
  })
})

type Entry = { id: number; Title: string }

const entries: Entry[] = [
  { id: 1, Title: 'One' },
  { id: 2, Title: 'Two' },
]
const bySlug = (slug: string) =>
  slug === 'second' ? { id: 2, Title: 'Two' } : undefined

const Host = defineComponent({
  setup() {
    const selected = ref<Entry | null>(null)
    const { invalidId } = useURLSelection({
      findEntry: (id) => entries.find((e) => e.id === id),
      findEntryBySlug: bySlug,
      onSelect: (entry) => { selected.value = entry as Entry },
      onDeselect: () => { selected.value = null },
    })
    return { invalidId, selected }
  },
  template: `<div class="host">{{ invalidId ? 'invalid' : 'valid' }}|{{ selected ? selected.Title : 'none' }}</div>`,
})

function mountHost() {
  return mount(Host)
}

describe('useURLSelection', () => {
  it('selects an entry via slug param', async () => {
    holder.route!.params = { slug: 'second' }
    holder.route!.query = {}
    holder.route!.fullPath = '/other/second'
    const wrapper = mountHost()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.host').text()).toBe('valid|Two')
    wrapper.unmount()
  })

  it('selects an entry via uid query', async () => {
    holder.route!.params = {}
    holder.route!.query = { uid: '1' }
    holder.route!.fullPath = '/other?uid=1'
    const wrapper = mountHost()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.host').text()).toBe('valid|One')
    wrapper.unmount()
  })

  it('gives the slug param priority over the uid query', async () => {
    holder.route!.params = { slug: 'second' }
    holder.route!.query = { uid: '1' }
    holder.route!.fullPath = '/other/second?uid=1'
    const wrapper = mountHost()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.host').text()).toBe('valid|Two')
    wrapper.unmount()
  })

  it('flags an unknown slug as invalid', async () => {
    holder.route!.params = { slug: 'missing' }
    holder.route!.query = {}
    holder.route!.fullPath = '/other/missing'
    const wrapper = mountHost()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.host').text()).toBe('invalid|none')
    wrapper.unmount()
  })

  it('clears the invalid flag when a later navigation selects a valid entry', async () => {
    holder.route!.params = { slug: 'missing' }
    holder.route!.query = {}
    holder.route!.fullPath = '/other/missing'
    const wrapper = mountHost()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.host').text()).toBe('invalid|none')

    holder.route!.params = { slug: 'second' }
    holder.route!.fullPath = '/other/second'
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.host').text()).toBe('valid|Two')
    wrapper.unmount()
  })

  it('stays valid and unfocused when no selection params exist', async () => {
    holder.route!.params = {}
    holder.route!.query = {}
    holder.route!.fullPath = '/other'
    const wrapper = mountHost()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.host').text()).toBe('valid|none')
    wrapper.unmount()
  })

  it('calls onDeselect when route clears its slug and query params', async () => {
    holder.route!.params = { slug: 'second' }
    holder.route!.query = {}
    holder.route!.fullPath = '/other/second'
    const wrapper = mountHost()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.host').text()).toBe('valid|Two')

    holder.route!.params = {}
    holder.route!.query = {}
    holder.route!.fullPath = '/other'
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.host').text()).toBe('valid|none')
    wrapper.unmount()
  })
})