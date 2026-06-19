import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

export function useURLSelection(opts: {
  findEntry: (id: number) => any
  onSelect: (entry: any) => void
}) {
  const route = useRoute()
  const invalidId = ref(false)

  onMounted(() => {
    const raw = route.query.id
    if (!raw) return
    const id = parseInt(raw as string, 10)
    if (isNaN(id)) { invalidId.value = true; return }
    const entry = opts.findEntry(id)
    if (entry) opts.onSelect(entry)
    else invalidId.value = true
  })

  return { invalidId }
}
