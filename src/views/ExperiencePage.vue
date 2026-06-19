<template>
  <SidebarComponent
    ref="sidebarRef"
    :config="sidebarConfig"
    :show-search="true"
    :search-query="searchQuery"
    :linked-id="linkedUID"
    @select="onSelect"
    @deselect="onDeselect"
    @search="onSearch"
  />
  <HighlightComponent
    ref="highlightRef"
    :selected-entry="selectedEntry"
    :default-entry="defaultHighlights"
    :search-query="searchQuery"
    :invalid-uid="invalidUID"
    :entries="sortedEntries"
    @tag-click="onTagClick"
    @navigate="onNavigate"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useURLSelection } from '@/composables/useURLSelection'
import SidebarComponent from '@/components/SidebarComponent.vue'
import HighlightComponent from '@/components/HighlightComponent.vue'

import experienceData        from '@/data/experience.json'
import educationData         from '@/data/education.json'
import defaultHighlightsData from '@/data/defaultHighlights.json'

const defaultHighlights = ref(defaultHighlightsData)

const selectedEntry = ref<any>(null)
const searchQuery   = ref('')
const linkedUID     = ref<any>(null)
const sidebarRef    = ref<any>(null)
const highlightRef  = ref<any>(null)

const { invalidUID } = useURLSelection({
  findEntry: (uid) => allEntries.value.find((e) => e.id === uid),
  onSelect: (entry) => {
    selectedEntry.value = entry
    sidebarRef.value?.selectById(entry.id)
  },
})

const allEntries = computed(() => [
  ...experienceData,
  ...educationData,
])

function parseDate(d: any): number {
  if (!d || d === 'Present') return new Date(9999, 11, 31).getTime()
  return new Date(d).getTime()
}

const sortedEntries = computed(() =>
  ([...experienceData] as any[])
    .sort((a, b) => parseDate(b.EndDate) - parseDate(a.EndDate))
    .concat(
      ([...educationData] as any[]).sort((a, b) => parseDate(b.EndDate) - parseDate(a.EndDate))
    )
)

function findEntryByUID(uid) {
  return allEntries.value.find(entry => entry.id === uid) || null
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

function onSelect(entry)  { selectedEntry.value = entry }
function onDeselect()     { selectedEntry.value = null; searchQuery.value = ''; linkedUID.value = null }
function onSearch(query)  { searchQuery.value = query }

function onTagClick(uid) {
  linkedUID.value = uid
}

function onNavigate(uid) {
  const entry = findEntryByUID(uid)
  if (entry) {
    selectedEntry.value = entry
    sidebarRef.value?.selectById(uid)
  }
}

watch(selectedEntry, () => {
  nextTick(() => highlightRef.value?.focusHighlight())
})

defineExpose({ findEntryByUID, invalidUID })
</script>
