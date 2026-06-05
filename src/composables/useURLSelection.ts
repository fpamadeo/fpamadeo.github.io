import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

export function useURLSelection(opts: {
  findEntry: (uid: number) => any
  onSelect: (entry: any) => void
}) {
  const route = useRoute()
  const invalidUID = ref(false)

  onMounted(() => {
    const raw = route.query.uid
    if (!raw) return
    const uid = parseInt(raw as string, 10)
    if (isNaN(uid)) { invalidUID.value = true; return }
    const entry = opts.findEntry(uid)
    if (entry) opts.onSelect(entry)
    else invalidUID.value = true
  })

  return { invalidUID }
}
