<template>
  <div class="page-wrapper">
    <AppHeader />

    <main id="main-content" class="page-main">
      <SidebarComponent
        ref="sidebarRef"
        :config="sidebarConfig"
        :show-search="true"
        :show-tag-filter="true"
        :search-query="searchQuery"
        :linked-uid="linkedUID"
        @select="onSelect"
        @deselect="onDeselect"
        @search="onSearch"
        @tag-filter="onTagFilter"
      />
      <HighlightComponent
        ref="highlightRef"
        :selected-entry="selectedEntry"
        :default-entry="defaultHighlights"
        :search-query="searchQuery"
        :invalid-uid="invalidUID"
        :tag-filter-enabled="true"
        :active-tag="activeTag"
        :entries="sortedEntries"
        @tag-click="onTagClick"
        @tag-badge-click="onTagBadgeClick"
        @navigate="onNavigate"
      />
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useURLSelection } from '@/composables/useURLSelection'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import SidebarComponent from '@/components/SidebarComponent.vue'
import HighlightComponent from '@/components/HighlightComponent.vue'

import writingData from '@/data/writing.json'
import defaultWritingHighlightsData from '@/data/defaultWritingHighlights.json'

const defaultHighlights = ref(defaultWritingHighlightsData)
const selectedEntry = ref<any>(null)
const searchQuery = ref('')
const linkedUID = ref<any>(null)
const activeTag = ref('')
const sidebarRef = ref<any>(null)
const highlightRef = ref<any>(null)

const { invalidUID } = useURLSelection({
  findEntry: (uid) => writingAsExperiences.value.find((e) => e.UID === uid),
  onSelect: (entry) => {
    selectedEntry.value = entry
    sidebarRef.value?.selectByUID(entry.UID)
  },
})

const writingAsExperiences = computed(() =>
  writingData.map((w) => ({
    UID: w.UID,
    Company: 'Writing',
    Title: w.Title,
    StartDate: w.Date,
    EndDate: w.Date,
    media: '',
    Summary: (w.tags || []).join(', '),
    Bullets: [],
    related: w.related ?? [],
    tags: w.tags ?? [],
    Highlights: [],
    Content: w.Content,
  })),
)

// Matches sidebar sort order: entries sorted by EndDate desc
function parseDate(d: any): number {
  if (!d || d === 'Present') return new Date(9999, 11, 31).getTime()
  return new Date(d).getTime()
}

const sortedEntries = computed(() =>
  [...writingAsExperiences.value].sort((a, b) => parseDate(b.EndDate) - parseDate(a.EndDate)),
)

const sidebarConfig = computed(() => ({
  sections: [
    {
      label: 'Writing',
      entries: writingAsExperiences.value,
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

function onSelect(entry) {
  selectedEntry.value = entry
}
function onDeselect() {
  selectedEntry.value = null
  searchQuery.value = ''
  linkedUID.value = null
  activeTag.value = ''
}
function onSearch(query) {
  searchQuery.value = query
}

function onTagClick(uid) {
  linkedUID.value = uid
}

function onNavigate(uid) {
  const entry = writingAsExperiences.value.find((e) => e.UID === uid)
  if (entry) {
    selectedEntry.value = entry
    sidebarRef.value?.selectByUID(uid)
  }
}

function onTagFilter(tag) {
  activeTag.value = tag || ''
}

function onTagBadgeClick(tag) {
  if (activeTag.value === tag) {
    activeTag.value = ''
    if (sidebarRef.value?.clearTagFilter) sidebarRef.value.clearTagFilter()
  } else {
    activeTag.value = tag
    if (sidebarRef.value?.setActiveTag) sidebarRef.value.setActiveTag(tag)
  }
}

function findEntryByUID(uid: number) {
  return writingAsExperiences.value.find((e) => e.UID === uid) || null
}

defineExpose({ findEntryByUID, invalidUID })

watch(selectedEntry, () => {
  nextTick(() => highlightRef.value?.focusHighlight())
})
</script>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page-main {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

@media (max-width: 767px) {
  .page-main {
    flex-direction: column-reverse;
    overflow: visible;
  }
}
</style>
