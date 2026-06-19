<template>
  <aside
    ref="sidebarRef"
    class="sidebar"
  >
    <!-- Search Bar -->
    <div
      v-if="showSearch"
      class="sidebar-search"
      :class="{ 'is-search-active': !!searchQuery }"
    >
      <SearchBar
        ref="searchBarRef"
        @search="onSearch"
      />
    </div>

    <!-- Tag Filter -->
    <div
      v-if="showTagFilter && tagDisplayData.length"
      class="tag-filter-area"
    >
      <span
        v-for="item in tagDisplayData"
        :key="item.filter"
        class="tag-pill-wrapper"
      >
        <button
          class="tag-pill"
          :class="{ 'is-active': selectedTag === item.filter }"
          role="button"
          tabindex="0"
          :aria-pressed="selectedTag === item.filter"
          :aria-label="'Filter by tag: ' + item.display"
          @click="toggleTag(item.filter)"
          @keydown.enter="toggleTag(item.filter)"
          @keydown.space.prevent="toggleTag(item.filter)"
        >{{ item.display }}</button>
      </span>
    </div>

    <!-- Configurable Summary Section -->
    <div
      v-if="config.summary"
      class="sidebar-entry sidebar-summary"
      role="button"
      tabindex="0"
      :aria-label="config.summary.ariaLabel || 'Summary — click to reset selection'"
      @click="resetSelection"
      @keydown.enter="resetSelection"
      @keydown.space.prevent="resetSelection"
    >
      <p
        class="summary-text"
        v-html="marked.parseInline(config.summary.content)"
      />
      <p
        v-if="config.summary.hint"
        class="summary-hint"
      >
        {{ config.summary.hint }}
      </p>
    </div>

    <!-- Configurable Sections -->
    <template
      v-for="(section, index) in sections"
      :key="section.label"
    >
      <div
        v-if="section.entries.length"
        class="section-label"
        :class="{ 'section-label--education': index !== 0 }"
      >
        {{ section.label }}
      </div>
      <div
        v-for="entry in sortedSectionEntries(section.entries)"
        :key="entry.id"
        :data-uid="entry.id"
        class="sidebar-entry"
        :class="entryClasses(entry)"
        :style="entryIndentStyle(entry, section.entries)"
        role="button"
        tabindex="0"
        :aria-label="`${entry.Title} — ${entry.subtitle}`"
        :aria-pressed="selectedId === entry.id"
        @click="selectEntry(entry)"
        @keydown.enter="selectEntry(entry)"
        @keydown.space.prevent="selectEntry(entry)"
      >
        <div class="entry-top-line">
          <span class="entry-company">{{ entry.Title }}</span>
          <span
            v-if="section.showDates !== false"
            class="entry-dates"
          >{{ section.singularDate ? formatSingularDate(entry.StartDate) : formatDateRange(entry.StartDate, entry.EndDate) }}</span>
        </div>
        <div
          v-if="entry.subtitle"
          class="entry-title"
        >
          {{ entry.subtitle }}
        </div>
        <div
          class="entry-summary"
          v-html="marked.parseInline(entry.Description)"
        />
      </div>
    </template>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { marked } from 'marked'
import SearchBar from './SearchBar.vue'
import { buildTagDisplay } from '@/composables/useTagAggregation'

const props = defineProps({
  config: {
    type: Object,
    default: () => ({
      sections: [],
      summary: null,
    }),
  },
  showSearch:    { type: Boolean, default: false },
  showTagFilter: { type: Boolean, default: false },
  searchQuery:   { type: String, default: '' },
  linkedId:     { type: Number, default: null },
})

const emit = defineEmits(['select', 'deselect', 'search', 'tag-filter'])

const sidebarRef    = ref<any>(null)
const searchBarRef  = ref<any>(null)
const selectedId   = ref<any>(null)
const selectedTag   = ref<any>(null)
const lastValidQuery = ref('')
const failedQuery    = ref<any>(null)

// All entries pool for tag lookups
const allEntries = computed(() =>
  (props.config.sections || []).flatMap((s: any) => s.entries || [])
)

const sections = computed(() => props.config.sections || [])

const currentSelectedEntry = computed(() =>
  allEntries.value.find((e) => e.id === selectedId.value) ?? null
)

// Tag aggregation
const tagDisplayData = computed(() => {
  const tags = new Set<string>()
  for (const entry of allEntries.value) {
    if (entry.tags && Array.isArray(entry.tags)) {
      for (const tag of entry.tags) tags.add(tag)
    }
  }
  const sorted = [...tags].sort((a, b) => a.localeCompare(b))
  return buildTagDisplay(sorted)
})

// Auto-select default entry on mount
watch(
  () => props.config.defaultSelectedId,
  (uid) => {
    if (uid != null) {
      const entry = allEntries.value.find((e) => e.id === uid)
      if (entry) {
        selectedId.value = uid
        emit('select', entry)
      }
    }
  },
  { immediate: true }
)

// Related UIDs from the selected entry's "related" field
const relatedIds = computed(() => {
  if (!currentSelectedEntry.value) return new Set()
  return new Set(currentSelectedEntry.value.related || [])
})

// Sorting
function parseDate(d: any): number {
  if (!d || d === 'Present') return new Date(9999, 11, 31).getTime()
  return new Date(d).getTime()
}

function sortedSectionEntries(entries) {
  return [...entries].sort((a, b) => parseDate(b.EndDate) - parseDate(a.EndDate))
}

function formatDate(d) {
  if (!d || d === 'Present') return 'Present'
  const dt = new Date(d)
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const yy = String(dt.getFullYear()).slice(-2)
  return `${mm}/${yy}`
}

function formatSingularDate(d) {
  if (!d) return ''
  const dt = new Date(d)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const mon = months[dt.getMonth()]
  const day = dt.getDate()
  const yr = dt.getFullYear()
  return `${mon} ${day}, ${yr}`
}

function formatDateRange(start, end) {
  return `${formatDate(start)} – ${formatDate(end)}`
}

function entryIndentStyle(entry, list) {
  const w = sidebarRef.value?.offsetWidth || 300
  const sameCompany = list.filter((e) => e.Title === entry.Title)
  const idx = sameCompany.findIndex((e) => e.id === entry.id)
  if (idx <= 0) return {}
  return { paddingLeft: `${w * 0.05 * idx}px` }
}

function isSelected(entry) {
  return selectedId.value === entry.id
}

function isRelated(entry) {
  if (props.searchQuery && entryMatchesQuery(entry, props.searchQuery)) return false
  return (
    selectedId.value !== null &&
    !isSelected(entry) &&
    relatedIds.value.has(entry.id)
  )
}

function isLinked(entry) {
  return (
    props.linkedId !== null &&
    entry.id === props.linkedId &&
    !isSelected(entry)
  )
}

function isSearchHighlight(entry) {
  if (!props.searchQuery || isSelected(entry) || isLinked(entry)) return false
  return entryMatchesQuery(entry, props.searchQuery)
}

function isDimmed(entry) {
  if (isSelected(entry)) return false
  if (props.searchQuery && entryMatchesQuery(entry, props.searchQuery)) return false
  const searchDim = !!(props.searchQuery && !entryMatchesQuery(entry, props.searchQuery))
  const selectionDim = selectedId.value !== null && !isSelected(entry)
  const tagDim = !!(selectedTag.value && !entryMatchesTag(entry, selectedTag.value))
  return searchDim || selectionDim || tagDim
}

function entryMatchesTag(entry, tag) {
  const entryTags = entry.tags || []
  if (tag.endsWith(':')) {
    const prefix = tag.toLowerCase()
    return entryTags.some(t => t.toLowerCase().startsWith(prefix))
  }
  return entryTags.includes(tag)
}

function entryMatchesQuery(entry, query) {
  if (!query) return true
  const q = query.toLowerCase()
  const fields = [
    entry.Title,
    entry.subtitle,
    entry.Description,
    ...(entry.tags || []),
    ...(entry.Bullets    || []).map((b) => (typeof b === 'string' ? b : b?.text || '')),
    ...(entry.Highlights || []).map((h) => (typeof h === 'string' ? h : h?.text || '')),
  ]
  return fields.some((f) => f && f.toLowerCase().includes(q))
}

function entryClasses(entry) {
  return {
    'is-selected':         isSelected(entry),
    'is-related':          isRelated(entry),
    'is-linked':           isLinked(entry),
    'is-dimmed':           isDimmed(entry),
    'is-search-highlight': isSearchHighlight(entry),
  }
}

function selectEntry(entry) {
  selectedId.value = entry.id
  emit('select', entry)
}

function resetSelection() {
  selectedId.value = null
  selectedTag.value = null
  lastValidQuery.value = ''
  failedQuery.value = null
  emit('deselect')
  emit('tag-filter', null)
  if (searchBarRef.value) searchBarRef.value.clear()
}

function onSearch(query) {
  // Revert attempt: pressing Enter on a previously-failed query
  if (failedQuery.value !== null && query === failedQuery.value) {
    const revertTo = lastValidQuery.value
    failedQuery.value = null
    searchBarRef.value?.setQuery(revertTo)
    emit('search', revertTo)
    return
  }

  const matchCount = allEntries.value.filter(e => entryMatchesQuery(e, query)).length
  if (matchCount === 0) {
    failedQuery.value = query
    return
  }

  lastValidQuery.value = query
  failedQuery.value = null
  emit('search', query)
}

function toggleTag(tag) {
  selectedTag.value = selectedTag.value === tag ? null : tag
  emit('tag-filter', selectedTag.value)
}

function setActiveTag(tag) {
  selectedTag.value = tag
}

function clearTagFilter() {
  selectedTag.value = null
  emit('tag-filter', null)
}

function selectById(uid) {
  const entry = allEntries.value.find((e) => e.id === uid)
  if (entry) {
    selectedId.value = uid
    emit('select', entry)
  }
}

function scrollToId(uid) {
  nextTick(() => {
    const el = sidebarRef.value?.querySelector(`[data-uid="${uid}"]`)
    if (!el) return
    const container = sidebarRef.value
    const entryTop = el.offsetTop
    const entryHeight = el.offsetHeight
    const containerHeight = container.clientHeight
    const targetScroll = entryTop - (containerHeight / 2) + (entryHeight / 2)
    const maxScroll = container.scrollHeight - containerHeight
    container.scrollTop = Math.max(0, Math.min(targetScroll, maxScroll))
  })
}

watch(selectedId, (uid) => {
  if (uid != null) scrollToId(uid)
})

defineExpose({ setActiveTag, clearTagFilter, selectById, scrollToId })
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

.sidebar-search {
  padding: 0.6rem var(--sidebar-padding);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.sidebar-search.is-search-active {
  background-color: var(--color-search-highlight-bg);
  outline: 2px solid var(--color-search-highlight-outline);
  outline-offset: -2px;
}

/* ─── Tag filter area ────────────────────────────────────────── */
.tag-filter-area {
  padding: 0.5rem var(--sidebar-padding);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  align-items: baseline;
}

/* ─── Section labels ─────────────────────────────────────────── */
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
  margin-top: 3%;
  border-top: 1px solid var(--color-border);
}

/* ─── Entry base ──────────────────────────────────────────────── */
.sidebar-entry {
  padding: 0.55rem var(--sidebar-padding);
  cursor: pointer;
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  transition:
    background-color var(--transition-fast),
    outline var(--transition-fast),
    max-height 0.2s ease,
    opacity 0.15s ease;
  outline: 2px solid transparent;
  outline-offset: -2px;
}

.sidebar-entry:hover { background-color: #f9f9f9; }

.sidebar-entry:focus-visible,
.sidebar-summary:focus-visible {
  outline: 2px solid var(--color-selected-outline);
  outline-offset: -2px;
}

.sidebar-entry.is-selected {
  outline: 2px solid var(--color-selected-outline);
  background-color: var(--color-bg);
}

.sidebar-entry.is-related {
  outline: 2px solid var(--color-selected-outline);
}

.sidebar-entry.is-linked {
  outline: 2px solid var(--color-selected-outline);
}

.sidebar-entry.is-search-highlight {
  background-color: var(--color-search-highlight-bg);
  outline: 2px solid var(--color-search-highlight-outline);
}

.sidebar-entry.is-dimmed { background-color: var(--color-dimmed-bg); }

/* ─── Summary ─────────────────────────────────────────────────── */
.sidebar-summary { background-color: #fafafa; }
.sidebar-summary:hover { background-color: #f3f3f3; }
.summary-text {
  font-size: 0.8rem;
  color: var(--color-text-light);
  font-style: italic;
  line-height: 1.5;
}
.summary-hint {
  margin-top: 0.35rem;
  font-size: 0.72rem;
  color: var(--color-text-light);
  opacity: 0.65;
  line-height: 1.4;
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
}

.entry-dates {
  font-style: italic;
  font-size: 0.72rem;
  color: var(--color-text-light);
  white-space: nowrap;
  flex-shrink: 0;
}

.entry-title {
  font-size: 0.82rem;
  color: var(--color-text);
  margin-bottom: 0.2rem;
}

.entry-summary {
  font-size: 0.75rem;
  color: var(--color-text-light);
  line-height: 1.4;
}

.entry-summary :deep(strong) { font-weight: 700; color: var(--color-text); }
.entry-summary :deep(em)     { font-style: italic; }
.entry-summary :deep(code)   {
  font-family: monospace;
  font-size: 0.72rem;
  background: #f0f0f0;
  padding: 0 2px;
  border-radius: 2px;
}

.summary-text :deep(strong) { font-weight: 700; color: var(--color-text); }
.summary-text :deep(em)     { font-style: italic; }
.summary-text :deep(a)      { text-decoration: underline; }

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
