<template>
  <div class="page-wrapper">
    <AppHeader />

    <main class="page-main">
      <SidebarComponent
        ref="sidebarRef"
        :config="sidebarConfig"
        :show-search="true"
        :search-query="searchQuery"
        :linked-uid="linkedUID"
        @select="onSelect"
        @deselect="onDeselect"
        @search="onSearch"
      />
      <HighlightComponent
        :selected-entry="selectedEntry"
        :default-entry="defaultHighlights"
        :search-query="searchQuery"
        :invalid-uid="invalidUID"
        :entries="sortedEntries"
        @tag-click="onTagClick"
        @navigate="onNavigate"
      />
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import SidebarComponent from '@/components/SidebarComponent.vue'
import HighlightComponent from '@/components/HighlightComponent.vue'

import experienceData        from '@/data/experience.json'
import educationData         from '@/data/education.json'
import defaultHighlightsData from '@/data/defaultHighlights.json'

const route = useRoute()
const defaultHighlights = ref(defaultHighlightsData)

const selectedEntry = ref(null)
const searchQuery   = ref('')
const linkedUID     = ref(null)
const invalidUID    = ref(false)
const sidebarRef    = ref(null)

const allEntries = computed(() => [
  ...experienceData,
  ...educationData,
])

// Matches sidebar sort order: sections in config order, entries sorted by EndDate desc
function parseDate(d) {
  if (!d || d === 'Present') return new Date(9999, 11, 31)
  return new Date(d)
}

const sortedEntries = computed(() =>
  [...experienceData]
    .sort((a, b) => parseDate(b.EndDate) - parseDate(a.EndDate))
    .concat(
      [...educationData].sort((a, b) => parseDate(b.EndDate) - parseDate(a.EndDate))
    )
)

function findEntryByUID(uid) {
  return allEntries.value.find(entry => entry.UID === uid) || null
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
    content: 'Full-stack engineer with 5+ years building scalable products. Click any role to explore details, or use search to filter by skill or keyword.',
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
    sidebarRef.value?.selectByUID(uid)
  }
}

onMounted(() => {
  const uidParam = route.query.uid
  if (uidParam) {
    const uid = parseInt(uidParam, 10)
    if (isNaN(uid)) {
      invalidUID.value = true
      return
    }
    const entry = findEntryByUID(uid)
    if (entry) {
      selectedEntry.value = entry
    } else {
      invalidUID.value = true
    }
  }
})

defineExpose({ findEntryByUID, invalidUID })
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
