<template>
  <aside ref="sidebarRef" class="sidebar">

    <!-- Search Bar -->
    <div v-if="showSearch" class="sidebar-search">
      <SearchBar ref="searchBarRef" @search="onSearch" />
    </div>

    <!-- Career Summary -->
    <div
      v-if="careerSummary"
      class="sidebar-entry sidebar-summary"
      :class="{ 'is-reset-active': selectedUID === null }"
      role="button"
      tabindex="0"
      aria-label="Career summary — click to reset selection"
      @click="resetSelection"
      @keydown.enter="resetSelection"
      @keydown.space.prevent="resetSelection"
    >
      <p class="summary-text">{{ careerSummary }}</p>
    </div>

    <!-- Divider label for Experience -->
    <div v-if="sortedExperiences.length" class="section-label">Experience</div>

    <!-- Experience Entries -->
    <div
      v-for="entry in sortedExperiences"
      :key="entry.UID"
      class="sidebar-entry"
      :class="{
        'is-selected': selectedUID === entry.UID,
        'is-dimmed': isDimmed(entry),
      }"
      :style="entryIndentStyle(entry, sortedExperiences)"
      role="button"
      tabindex="0"
      :aria-label="`${entry.Company} — ${entry.Title}`"
      :aria-pressed="selectedUID === entry.UID"
      @click="selectEntry(entry)"
      @keydown.enter="selectEntry(entry)"
      @keydown.space.prevent="selectEntry(entry)"
    >
      <div class="entry-top-line">
        <span class="entry-company">{{ entry.Company }}</span>
        <span class="entry-dates">{{ formatDateRange(entry.StartDate, entry.EndDate) }}</span>
      </div>
      <div class="entry-title">{{ entry.Title }}</div>
      <div class="entry-summary">{{ entry.Summary }}</div>
    </div>

    <!-- Education Entries -->
    <template v-if="sortedEducation.length">
      <div class="section-label section-label--education">Education</div>
      <div
        v-for="entry in sortedEducation"
        :key="entry.UID"
        class="sidebar-entry"
        :class="{
          'is-selected': selectedUID === entry.UID,
          'is-dimmed': isDimmed(entry),
        }"
        :style="entryIndentStyle(entry, sortedEducation)"
        role="button"
        tabindex="0"
        :aria-label="`${entry.Company} — ${entry.Title}`"
        :aria-pressed="selectedUID === entry.UID"
        @click="selectEntry(entry)"
        @keydown.enter="selectEntry(entry)"
        @keydown.space.prevent="selectEntry(entry)"
      >
        <div class="entry-top-line">
          <span class="entry-company">{{ entry.Company }}</span>
          <span class="entry-dates">{{ formatDateRange(entry.StartDate, entry.EndDate) }}</span>
        </div>
        <div class="entry-title">{{ entry.Title }}</div>
        <div class="entry-summary">{{ entry.Summary }}</div>
      </div>
    </template>

  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import SearchBar from './SearchBar.vue'

const props = defineProps({
  experiences: {
    type: Array,
    default: () => [],
  },
  education: {
    type: Array,
    default: () => [],
  },
  careerSummary: {
    type: String,
    default: '',
  },
  showSearch: {
    type: Boolean,
    default: false,
  },
  searchQuery: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['select', 'deselect', 'search'])

const sidebarRef = ref(null)
const searchBarRef = ref(null)
const selectedUID = ref(null)

// ─── Sorting ──────────────────────────────────────────────────────
function parseDate(dateStr) {
  if (!dateStr || dateStr === 'Present') return new Date(9999, 11, 31)
  return new Date(dateStr)
}

const sortedExperiences = computed(() =>
  [...props.experiences].sort(
    (a, b) => parseDate(b.EndDate) - parseDate(a.EndDate)
  )
)

const sortedEducation = computed(() =>
  [...props.education].sort(
    (a, b) => parseDate(b.EndDate) - parseDate(a.EndDate)
  )
)

// ─── Date formatting ──────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr || dateStr === 'Present') return 'Present'
  const d = new Date(dateStr)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  return `${mm}/${yy}`
}

function formatDateRange(start, end) {
  return `${formatDate(start)} – ${formatDate(end)}`
}

// ─── Same-company indent ──────────────────────────────────────────
function entryIndentStyle(entry, list) {
  const sidebarWidth = sidebarRef.value?.offsetWidth || 300
  const indentUnit = sidebarWidth * 0.05
  const sameCompanyEntries = list.filter((e) => e.Company === entry.Company)
  const index = sameCompanyEntries.findIndex((e) => e.UID === entry.UID)
  if (index <= 0) return {}
  return { paddingLeft: `${indentUnit * index}px` }
}

// ─── Search / dim logic ───────────────────────────────────────────
function entryMatchesQuery(entry, query) {
  if (!query) return true
  const q = query.toLowerCase()
  const fields = [
    entry.Company,
    entry.Title,
    entry.Summary,
    ...(entry.Bullets || []),
    ...(entry.Tags || []),
    ...(entry.Highlights || []),
  ]
  return fields.some((f) => f && f.toLowerCase().includes(q))
}

function isDimmed(entry) {
  // Dimmed if: search active and no match, OR another entry is selected
  const searchDim = props.searchQuery && !entryMatchesQuery(entry, props.searchQuery)
  const selectionDim = selectedUID.value !== null && selectedUID.value !== entry.UID
  return searchDim || selectionDim
}

// ─── Selection ────────────────────────────────────────────────────
function selectEntry(entry) {
  selectedUID.value = entry.UID
  emit('select', entry)
}

function resetSelection() {
  selectedUID.value = null
  emit('deselect')
  if (searchBarRef.value) searchBarRef.value.clear()
}

function onSearch(query) {
  emit('search', query)
}
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  min-width: 220px;
  height: 100%;
  overflow-y: auto;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

/* Search area: top 10% of sidebar height */
.sidebar-search {
  padding: 0.6rem var(--sidebar-padding);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

/* Section labels */
.section-label {
  padding: 0.4rem var(--sidebar-padding) 0.2rem;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-light);
  background: #fafafa;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.section-label--education {
  /* ~3% of sidebar component length as top padding */
  margin-top: 3%;
  border-top: 1px solid var(--color-border);
}

/* ─── Entry base styles ───────────────────────────────────────── */
.sidebar-entry {
  padding: 0.55rem var(--sidebar-padding);
  cursor: pointer;
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  transition:
    background-color var(--transition-fast),
    outline var(--transition-fast);
  outline: 2px solid transparent;
  outline-offset: -2px;
}

.sidebar-entry:hover {
  background-color: #f9f9f9;
}

/* Selected: yellow outline */
.sidebar-entry.is-selected {
  outline: 2px solid var(--color-selected-outline);
  background-color: var(--color-bg);
}

/* Dimmed: 5% gray shade */
.sidebar-entry.is-dimmed {
  background-color: var(--color-dimmed-bg);
}

/* ─── Career summary entry ────────────────────────────────────── */
.sidebar-summary {
  background-color: #fafafa;
}

.sidebar-summary:hover {
  background-color: #f3f3f3;
}

.summary-text {
  font-size: 0.8rem;
  color: var(--color-text-light);
  font-style: italic;
  line-height: 1.5;
}

/* ─── Entry internals ─────────────────────────────────────────── */
.entry-top-line {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.15rem;
  flex-wrap: wrap;
}

.entry-company {
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--color-text);
  text-align: left;
}

.entry-dates {
  font-style: italic;
  font-size: 0.72rem;
  color: var(--color-text-light);
  text-align: right;
  white-space: nowrap;
  flex-shrink: 0;
}

.entry-title {
  font-size: 0.82rem;
  color: var(--color-text);
  text-align: left;
  margin-bottom: 0.2rem;
}

.entry-summary {
  font-size: 0.75rem;
  color: var(--color-text-light);
  line-height: 1.4;
  text-align: left;
}

/* ─── Mobile ──────────────────────────────────────────────────── */
@media (max-width: 767px) {
  .sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-top: 1px solid var(--color-border);
  }
}
</style>
