import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

type EntryLike = Record<string, unknown>

export function useURLSelection(opts: {
  findEntry: (id: number) => EntryLike | undefined | null
  findEntryBySlug?: (slug: string) => EntryLike | undefined | null
  onSelect: (entry: EntryLike) => void
  onDeselect?: () => void
}) {
  const route = useRoute()
  const invalidId = ref(false)

  function applyUID(raw: string | null | undefined) {
    if (!raw) return
    const id = parseInt(raw as string, 10)
    if (isNaN(id)) { invalidId.value = true; return }
    const entry = opts.findEntry(id)
    if (entry) { invalidId.value = false; opts.onSelect(entry) }
    else invalidId.value = true
  }

  function applySlug(slug: string) {
    const entry = opts.findEntryBySlug?.(slug)
    if (entry) { invalidId.value = false; opts.onSelect(entry) }
    else invalidId.value = true
  }

  function apply() {
    const slug = route.params?.slug
    if (typeof slug === 'string' && slug.length > 0) {
      applySlug(slug)
      return
    }
    const uid = route.query?.uid as string
    if (uid) {
      applyUID(uid)
      return
    }
    invalidId.value = false
    opts.onDeselect?.()
  }

  onMounted(() => apply())
  watch(() => route.fullPath, () => apply())

  return { invalidId }
}