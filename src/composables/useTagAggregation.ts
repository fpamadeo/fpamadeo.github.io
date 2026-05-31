interface TagDisplayItem {
  display: string
  filter: string
}

export function buildTagDisplay(allTags: string[]): TagDisplayItem[] {
  const groups = new Map<string, { supertag: string; tags: Array<{ full: string; subtag: string }> }>()
  const standalone: TagDisplayItem[] = []

  for (const tag of allTags) {
    const colonIdx = tag.indexOf(':')
    if (colonIdx > 0) {
      const supertag = tag.slice(0, colonIdx).trim()
      const subtag = tag.slice(colonIdx + 1).trim()
      const key = supertag.toLowerCase()
      if (!groups.has(key)) {
        groups.set(key, { supertag, tags: [] })
      }
      groups.get(key)!.tags.push({ full: tag, subtag })
    } else {
      standalone.push({ display: tag, filter: tag })
    }
  }

  const result: TagDisplayItem[] = []

  for (const [, group] of groups) {
    if (group.tags.length >= 2) {
      group.tags.sort((a, b) => a.subtag.localeCompare(b.subtag))
      result.push({ display: group.supertag, filter: group.supertag + ':' })
      for (const t of group.tags) {
        result.push({ display: t.full, filter: t.full })
      }
    } else {
      standalone.push({ display: group.tags[0].full, filter: group.tags[0].full })
    }
  }

  standalone.sort((a, b) => a.display.localeCompare(b.display))

  return [...result, ...standalone]
}

export function useTagAggregation(allEntries: Array<{ tags?: string[] }>) {
  const allTags = new Set<string>()
  for (const entry of allEntries) {
    if (entry.tags && Array.isArray(entry.tags)) {
      for (const tag of entry.tags) {
        allTags.add(tag)
      }
    }
  }

  const sortedTags = [...allTags].sort((a, b) => a.localeCompare(b))
  const tagDisplayData = buildTagDisplay(sortedTags)

  return { allTags: sortedTags, tagDisplayData }
}
