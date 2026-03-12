<template>
  <section class="highlight" :class="{ 'highlight--wip': isWip }">

    <!-- WIP Watermark (writing entries with Content = "WORK IN PROGRESS") -->
    <div v-if="isWip" class="wip-container">
      <div class="wip-watermark" aria-hidden="true">WORK IN PROGRESS</div>
      <p class="wip-label">This piece is not yet published.</p>
    </div>

    <!-- Normal highlight display -->
    <template v-else>

      <!-- Media image -->
      <div v-if="activeEntry.media" class="highlight-media">
        <img
          :src="activeEntry.media"
          :alt="`Media for ${activeEntry.Title || activeEntry.Company}`"
          class="highlight-img"
        />
      </div>

      <!-- Writing entry: Content text -->
      <div v-if="activeEntry.Content && activeEntry.Content !== 'WORK IN PROGRESS'" class="highlight-content">
        <h3 class="highlight-section-title">{{ activeEntry.Title }}</h3>
        <div class="content-body" v-html="highlightText(activeEntry.Content)" />
      </div>

      <!-- Standard experience/education entry -->
      <template v-else>

        <!-- Highlights section -->
        <div v-if="activeEntry.Highlights && activeEntry.Highlights.length" class="highlight-section">
          <h3 class="highlight-section-title">HIGHLIGHTS</h3>
          <ul class="highlight-list">
            <li
              v-for="(item, i) in activeEntry.Highlights"
              :key="`h-${i}`"
              v-html="highlightText(item)"
            />
          </ul>
        </div>

        <!-- Bullets section -->
        <div v-if="activeEntry.Bullets && activeEntry.Bullets.length" class="highlight-section">
          <h3 class="highlight-section-title">BULLETS</h3>
          <ul class="highlight-list">
            <li
              v-for="(item, i) in activeEntry.Bullets"
              :key="`b-${i}`"
              v-html="highlightText(item)"
            />
          </ul>
        </div>

        <!-- Tags -->
        <div v-if="activeEntry.Tags && activeEntry.Tags.length" class="highlight-tags">
          <span
            v-for="(tag, i) in activeEntry.Tags"
            :key="`t-${i}`"
            class="tag"
            v-html="highlightText(tag)"
          />
        </div>

      </template>
    </template>

  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  selectedEntry: {
    type: Object,
    default: null,
  },
  defaultEntry: {
    type: Object,
    required: true,
  },
  searchQuery: {
    type: String,
    default: '',
  },
})

const activeEntry = computed(() => props.selectedEntry ?? props.defaultEntry)

const isWip = computed(() =>
  activeEntry.value?.Content === 'WORK IN PROGRESS'
)

// Wraps matching substrings in <mark> tags for text highlighting
function highlightText(text) {
  if (!text || !props.searchQuery) return escapeHtml(text || '')
  const escaped = escapeHtml(text)
  const escapedQuery = escapeHtml(props.searchQuery)
  const regex = new RegExp(`(${escapedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return escaped.replace(regex, '<mark>$1</mark>')
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
</script>

<style scoped>
.highlight {
  flex: 1;
  min-width: 0;
  padding: 1.5rem 2rem;
  overflow-y: auto;
  background-color: var(--color-bg);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ─── WIP Watermark ───────────────────────────────────────────── */
.highlight--wip {
  position: relative;
  justify-content: center;
  align-items: center;
}

.wip-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 300px;
  position: relative;
}

.wip-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-30deg);
  font-size: clamp(1.5rem, 4vw, 3rem);
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(0, 0, 0, 0.08);
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
  text-transform: uppercase;
}

.wip-label {
  font-size: 0.85rem;
  color: var(--color-text-light);
  font-style: italic;
  position: relative;
  z-index: 1;
}

/* ─── Media ───────────────────────────────────────────────────── */
.highlight-media {
  width: 100%;
}

.highlight-img {
  width: 100%;
  max-height: 260px;
  object-fit: cover;
  border-radius: 6px;
  display: block;
}

/* ─── Sections ────────────────────────────────────────────────── */
.highlight-section {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.highlight-section-title {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-light);
  padding-bottom: 0.3rem;
  border-bottom: 1px solid var(--color-border);
}

.highlight-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.highlight-list li {
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--color-text);
  padding-left: 1rem;
  position: relative;
}

.highlight-list li::before {
  content: '–';
  position: absolute;
  left: 0;
  color: var(--color-text-light);
}

/* ─── Tags ────────────────────────────────────────────────────── */
.highlight-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tag {
  font-size: 0.72rem;
  padding: 0.2rem 0.55rem;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  color: var(--color-text-light);
  background: #fafafa;
}

/* ─── Writing content ─────────────────────────────────────────── */
.content-body {
  font-size: 0.9rem;
  line-height: 1.8;
  color: var(--color-text);
  white-space: pre-wrap;
}

/* ─── Mobile ──────────────────────────────────────────────────── */
@media (max-width: 767px) {
  .highlight {
    width: 100%;
    max-height: 45vh;
    padding: 1rem;
    border-bottom: 1px solid var(--color-border);
  }
}
</style>
