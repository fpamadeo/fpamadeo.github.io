export interface TagDisplayItem {
  display: string
  filter: string
}

export interface TagNode {
  name: string
  fullName: string
  children: TagNode[]
}

export function buildTagTree(allTags: string[]): TagNode[] {
  const root: TagNode[] = []

  const sorted = [...allTags].sort((a, b) => a.localeCompare(b))

  for (const tag of sorted) {
    const parts = tag.split(':').map(p => p.trim()).filter(Boolean)
    if (parts.length === 0) continue

    let current = root
    let accumulated = ''

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      accumulated = accumulated ? `${accumulated}: ${part}` : part
      const fullName = accumulated

      let existing = current.find(n => n.fullName.toLowerCase() === fullName.toLowerCase())
      if (!existing) {
        existing = { name: part, fullName, children: [] }
        current.push(existing)
      }
      current = existing.children
    }
  }

  return root
}

export function getVisiblePills(tree: TagNode[], activeFilter: string | null): TagDisplayItem[] {
  if (!activeFilter) {
    return tree.map(node => ({
      display: node.name,
      filter: node.children.length > 0 ? node.fullName + ':' : node.fullName,
    }))
  }

  const parts = activeFilter.split(':').map(p => p.trim()).filter(Boolean)
  if (parts.length === 0) {
    return tree.map(node => ({
      display: node.name,
      filter: node.children.length > 0 ? node.fullName + ':' : node.fullName,
    }))
  }

  // Traverse tree to find the target node
  let current = tree
  const pathNodes: TagNode[] = []
  for (const part of parts) {
    const found = current.find(n => n.name.toLowerCase() === part.toLowerCase())
    if (!found) break
    pathNodes.push(found)
    current = found.children
  }

  if (pathNodes.length === 0) {
    return tree.map(node => ({
      display: node.name,
      filter: node.children.length > 0 ? node.fullName + ':' : node.fullName,
    }))
  }

  const target = pathNodes[pathNodes.length - 1]
  const isParent = target.children.length > 0

  if (isParent) {
    // Parent node: show ancestor path + this node + all its children
    const pills: TagDisplayItem[] = pathNodes.map(n => ({
      display: n.name,
      filter: n.fullName + ':',
    }))
    for (const child of target.children) {
      pills.push({
        display: child.name,
        filter: child.children.length > 0 ? child.fullName + ':' : child.fullName,
      })
    }
    return pills
  } else {
    // Leaf node: show ancestor path to parent + all parent's children
    const parentPath = pathNodes.slice(0, -1)
    const parent = parentPath.length > 0 ? parentPath[parentPath.length - 1] : null

    const pills: TagDisplayItem[] = parentPath.map(n => ({
      display: n.name,
      filter: n.fullName + ':',
    }))

    if (parent) {
      for (const child of parent.children) {
        pills.push({
          display: child.name,
          filter: child.children.length > 0 ? child.fullName + ':' : child.fullName,
        })
      }
    } else {
      // Leaf at root level — just show the target itself
      pills.push({
        display: target.name,
        filter: target.fullName,
      })
    }

    return pills
  }
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

  return { allTags: sortedTags }
}
