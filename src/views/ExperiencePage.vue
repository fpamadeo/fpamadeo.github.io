<template>
  <div class="page-wrapper">
    <AppHeader />

    <main class="page-main">
      <SidebarComponent
        :experiences="experiences"
        :education="education"
        :career-summary="careerSummary"
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
import { ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import SidebarComponent from '@/components/SidebarComponent.vue'
import HighlightComponent from '@/components/HighlightComponent.vue'

import experienceData from '@/data/experience.json'
import educationData from '@/data/education.json'
import defaultHighlightsData from '@/data/defaultHighlights.json'

const experiences = ref(experienceData)
const education = ref(educationData)
const defaultHighlights = ref(defaultHighlightsData)

const careerSummary = 'Full-stack engineer with 5+ years building scalable products. Click any role to explore details, or use search to filter by skill or keyword.'

const selectedEntry = ref(null)
const searchQuery = ref('')

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

/* ─── Mobile: stack Highlight above Sidebar ───────────────────── */
@media (max-width: 767px) {
  .page-main {
    flex-direction: column-reverse;
    overflow: visible;
  }
}
</style>
