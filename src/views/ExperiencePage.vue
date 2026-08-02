<template>
  <SidebarComponent
    ref="sidebarRef"
    :config="sidebarConfig"
    :show-search="true"
    :search-query="searchQuery"
    :linked-id="linkedUID"
    :mobile-collapsed="isCollapsed"
    @select="onSelect"
    @deselect="onDeselect"
    @search="onSearch"
    @toggle-collapse="toggle"
  />
  <HighlightComponent
    ref="highlightRef"
    :selected-entry="selectedEntry"
    :default-entry="defaultHighlights"
    :search-query="searchQuery"
    :invalid-id="invalidId"
    :entries="sortedEntries"
    :mobile-detail="isCollapsed"
    @tag-click="onTagClick"
    @navigate="onNavigate"
    @expand-request="expand"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useURLSelection } from '@/composables/useURLSelection'
import { useCollapsibleSidebar } from '@/composables/useCollapsibleSidebar'
import { parseDate } from '@/utils/dates'
import SidebarComponent from '@/components/SidebarComponent.vue'
import HighlightComponent from '@/components/HighlightComponent.vue'

import experienceData        from '@/data/experience.json'
import educationData         from '@/data/education.json'
import defaultHighlightsData from '@/data/defaultHighlights.json'

const defaultHighlights = ref(defaultHighlightsData)

const selectedEntry = ref<Record<string, unknown> | undefined>(undefined)
const searchQuery   = ref('')
const linkedUID     = ref<number | undefined>(undefined)
const sidebarRef    = ref<InstanceType<typeof SidebarComponent> | null>(null)
const highlightRef  = ref<InstanceType<typeof HighlightComponent> | null>(null)

const { isCollapsed, collapse, expand, toggle } = useCollapsibleSidebar()

const { invalidId } = useURLSelection({
  findEntry: (uid) => allEntries.value.find((e) => e.id === uid),
  onSelect: (entry) => {
    selectedEntry.value = entry
    sidebarRef.value?.selectById(entry.id as number)
    collapse()
  },
})

const allEntries = computed<{ id: number }[]>(() => [
  ...(experienceData as { id: number }[]),
  ...(educationData as { id: number }[]),
])

const sortedEntries = computed(() =>
  ([...experienceData] as { EndDate?: string }[])
    .sort((a, b) => parseDate(b.EndDate!) - parseDate(a.EndDate!))
    .concat(
      ([...educationData] as { EndDate?: string }[]).sort((a, b) => parseDate(b.EndDate!) - parseDate(a.EndDate!))
    )
)

function findEntryById(id: number) {
  return allEntries.value.find(entry => entry.id === id) || null
}

const sidebarConfig = computed(() => ({
  sections: [
    {
      label: 'Experience',
      entries: experienceData,
      showDates: true,
    },
    {
      label: 'Education',
      entries: educationData,
      showDates: false,
    },
  ],
  summary: {
    content: 'Full-stack engineer with 5+ years building scalable products. For freelance and professional opportunities, [connect on LinkedIn](https://linkedin.com/in/franpaul) or [send me an email](/#/contact).',
    hint: '(Click any role to explore details, or use search to filter by skill or keyword.)',
    ariaLabel: 'Career summary — click to reset selection',
  },
  defaultSelectedUID: null,
}))

function onSelect(entry: Record<string, unknown>)  {
  selectedEntry.value = entry
  collapse()
}
function   onDeselect()     { selectedEntry.value = undefined; searchQuery.value = ''; linkedUID.value = undefined }
function onSearch(query: string)  { searchQuery.value = query }

function onTagClick(uid: number | null) {
  linkedUID.value = uid ?? undefined
}

function onNavigate(uid: number) {
  const entry = findEntryById(uid)
  if (entry) {
    selectedEntry.value = entry
    sidebarRef.value?.selectById(uid)
  }
}

watch(selectedEntry, () => {
  nextTick(() => highlightRef.value?.focusHighlight())
})

defineExpose({ findEntryById, invalidId })
</script>
