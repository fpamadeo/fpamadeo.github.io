<template>
  <div class="page-wrapper">
    <AppHeader />

    <main class="page-main">
      <SidebarComponent
        :experiences="writingAsExperiences"
        :show-search="true"
        :search-query="searchQuery"
        @select="onSelect"
        @deselect="onDeselect"
        @search="onSearch"
      />
      <HighlightComponent
        :selected-entry="selectedEntry"
        :default-entry="defaultHighlights"
        :search-query="searchQuery"
      />
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import SidebarComponent from '@/components/SidebarComponent.vue'
import HighlightComponent from '@/components/HighlightComponent.vue'

import writingData from '@/data/writing.json'
import defaultHighlightsData from '@/data/defaultHighlights.json'

const defaultHighlights = ref(defaultHighlightsData)
const selectedEntry = ref(null)
const searchQuery = ref('')

// Map writing entries to the shape SidebarComponent expects
const writingAsExperiences = computed(() =>
  writingData.map((w) => ({
    UID: w.UID,
    Company: 'Writing',
    Title: w.Title,
    StartDate: w.Date,
    EndDate: w.Date,
    media: '',
    Summary: (w.Tags || []).join(', '),
    Bullets: [],
    Tags: w.Tags || [],
    Highlights: [],
    Content: w.Content,
  }))
)

function onSelect(entry) {
  selectedEntry.value = entry
}

function onDeselect() {
  selectedEntry.value = null
  searchQuery.value = ''
}

function onSearch(query) {
  searchQuery.value = query
}
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
}

@media (max-width: 767px) {
  .page-main {
    flex-direction: column-reverse;
    overflow: visible;
  }
}
</style>
