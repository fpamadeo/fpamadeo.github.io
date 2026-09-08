<template>
  <SidebarComponent
    ref="sidebarRef"
    :config="sidebarConfig"
    :show-search="true"
    :show-tag-filter="true"
    :search-query="searchQuery"
    :linked-id="linkedUID"
    :mobile-collapsed="isCollapsed"
    @select="onSelect"
    @deselect="onDeselect"
    @search="onSearch"
    @tag-filter="onTagFilter"
    @toggle-collapse="toggle"
  />
  <HighlightComponent
    ref="highlightRef"
    :selected-entry="selectedEntry"
    :default-entry="defaultHighlights"
    :search-query="searchQuery"
    :invalid-id="invalidId"
    :tag-filter-enabled="true"
    :active-tag="activeTag"
    :entries="sortedEntries"
    :mobile-detail="isCollapsed"
    @tag-click="onTagClick"
    @tag-badge-click="onTagBadgeClick"
    @navigate="onNavigate"
    @expand-request="expand"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useURLSelection } from '@/composables/useURLSelection'
import { useCollapsibleSidebar } from '@/composables/useCollapsibleSidebar'
import { parseDate } from '@/utils/dates'
import type { Entry, WritingEntry } from '@/types'
import SidebarComponent from '@/components/SidebarComponent.vue'
import HighlightComponent from '@/components/HighlightComponent.vue'

import writingData from '@/data/writing.json'
import defaultWritingHighlightsData from '@/data/defaultWritingHighlights.json'

const defaultHighlights = ref(defaultWritingHighlightsData)
const selectedEntry = ref<Record<string, unknown> | undefined>(undefined)
const searchQuery = ref('')
const linkedUID = ref<number | undefined>(undefined)
const activeTag = ref('')
const sidebarRef = ref<InstanceType<typeof SidebarComponent> | null>(null)
const highlightRef = ref<InstanceType<typeof HighlightComponent> | null>(null)

const { isCollapsed, collapse, expand, toggle } = useCollapsibleSidebar()

const { invalidId } = useURLSelection({
  findEntry: (uid) => normalizedWritingEntries.value.find((e) => e.UID === uid),
  onSelect: (entry) => {
    selectedEntry.value = entry
    sidebarRef.value?.selectById(entry.UID as number)
    collapse()
  },
})

function truncateSummary(text: string | undefined): string {
  if (!text) return ''
  let clean = text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`{1,3}.+?`{1,3}/g, '')
    .replace(/^#+\s*/gm, '')
    .replace(/^>\s*/gm, '')
    .replace(/\n{2,}/g, ' ')
    .replace(/\n/g, ' ')
  const maxLen = 130
  if (clean.length <= maxLen) return clean
  const trimmed = clean.slice(0, maxLen)
  const lastSpace = trimmed.lastIndexOf(' ')
  return (lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed) + '…'
}

const normalizedWritingEntries = computed<Entry[]>(() =>
  (writingData as WritingEntry[]).map((w) => ({
    UID: w.UID,
    Title: w.Title,
    subtitle: w.subtitle || '',
    StartDate: w.datePublished || w.Date,
    EndDate: w.datePublished || w.Date,
    media: '',
    Description: w.summary || truncateSummary(w.Body),
    Bullets: [],
    related: w.related ?? [],
    tags: w.tags ?? [],
    Highlights: [],
    Body: w.Body,
  })),
)

const sortedEntries = computed(() =>
  [...normalizedWritingEntries.value].sort((a, b) => parseDate(b.EndDate) - parseDate(a.EndDate)),
)

const sidebarConfig = computed(() => ({
  sections: [
    {
      label: 'Writing',
      entries: normalizedWritingEntries.value,
      showDates: true,
      singularDate: true,
    },
  ],
  summary: {
    content:
      'A collection of writings and articles about my random interests and topics. If you would like to read my curated thoughts on professional topics and technologies, you can check my posts on [linkedin](https://linkedin.com/in/franpaul).',
    hint: '(Click any title to read more.)',
    ariaLabel: 'Writing overview — click to reset selection',
  },
  defaultSelectedUID: null,
}))

function onSelect(entry: Record<string, unknown>) {
  selectedEntry.value = entry
  collapse()
}
function onDeselect() {
  selectedEntry.value = undefined
  searchQuery.value = ''
  linkedUID.value = undefined
  activeTag.value = ''
}
function onSearch(query: string) {
  searchQuery.value = query
}

function onTagClick(uid: number | null) {
  linkedUID.value = uid ?? undefined
}

function onNavigate(uid: number) {
  const entry = normalizedWritingEntries.value.find((e) => e.UID === uid)
  if (entry) {
    selectedEntry.value = entry
    sidebarRef.value?.selectById(uid)
  }
}

function onTagFilter(tag: string | null) {
  activeTag.value = tag || ''
}

function onTagBadgeClick(tag: string) {
  if (activeTag.value === tag) {
    activeTag.value = ''
    if (sidebarRef.value?.clearTagFilter) sidebarRef.value.clearTagFilter()
  } else {
    activeTag.value = tag
    if (sidebarRef.value?.setActiveTag) sidebarRef.value.setActiveTag(tag)
  }
}

function findEntryById(id: number) {
  return normalizedWritingEntries.value.find((e) => e.UID === id) || null
}

defineExpose({ findEntryById, invalidId })

watch(selectedEntry, () => {
  nextTick(() => highlightRef.value?.focusHighlight())
})
</script>
