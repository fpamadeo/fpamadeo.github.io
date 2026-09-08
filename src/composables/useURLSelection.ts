import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

export function useURLSelection(opts: {
  findEntry: (id: number) => Record<string, unknown> | undefined | null
  onSelect: (entry: Record<string, unknown>) => void
}) {
  const route = useRoute()
  const invalidId = ref(false)

  function applyUID(raw: string | null | undefined) {
    if (!raw) return
    const id = parseInt(raw as string, 10)
    if (isNaN(id)) { invalidId.value = true; return }
    const entry = opts.findEntry(id)
    if (entry) opts.onSelect(entry)
    else invalidId.value = true
  }

  onMounted(() => applyUID(route.query.uid as string))
  watch(() => route.query.uid, (newUid) => applyUID(newUid as string))

  return { invalidId }
}
