<template>
  <section
    ref="highlightRef"
    class="highlight"
    :class="{ 'highlight--wip': isWip, 'highlight--prinny': showPrinny }"
    tabindex="-1"
    aria-live="polite"
    aria-atomic="true"
  >
    <div
      class="prinny-overlay"
      :class="{ 'prinny-overlay--visible': showPrinny }"
      @click="dismissPrinny"
    >
      <img src="/assets/images/prinny-twirl.gif" alt="Prinny" class="prinny-gif" decoding="async" />
      <button class="prinny-close" aria-label="Close">x</button>
    </div>

    <div v-if="showInvalidBanner" class="invalid-uid-banner" role="alert">
      <span class="invalid-uid-text"
        >The UID provided in the URL was not found. Showing default highlights.</span
      >
      <button class="invalid-uid-close" aria-label="Dismiss" @click="dismissInvalidUID = true">
        ×
      </button>
    </div>

    <div v-if="isWip" class="wip-container">
      <div class="wip-watermark" aria-hidden="true">WORK IN PROGRESS PO</div>
      <p class="wip-label">This piece is not yet published.</p>
    </div>

    <!-- Normal highlight display -->
    <template v-else>
      <!-- Entry Navigation -->
      <div v-if="entries.length && selectedEntry" class="highlight-nav">
        <button
          class="nav-btn nav-prev"
          :disabled="!hasPrev"
          :aria-label="'Previous entry: ' + (prevEntry?.Title || '')"
          @click="goPrev"
        >
          ← Previous
        </button>
        <span class="nav-position">{{ currentIndex + 1 }} / {{ entries.length }}</span>
        <button
          class="nav-btn nav-next"
          :disabled="!hasNext"
          :aria-label="'Next entry: ' + (nextEntry?.Title || '')"
          @click="goNext"
        >
          Next →
        </button>
      </div>

      <div v-if="activeEntry.media" class="highlight-media">
        <img
          :src="activeEntry.media"
          :alt="`Media for ${activeEntry.Title || activeEntry.Company}`"
          class="highlight-img"
          :style="mediaStyle"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div v-if="activeEntry.tags && activeEntry.tags.length" class="highlight-section">
        <h3 class="highlight-section-title">TAGS</h3>
        <div class="tag-badges">
          <span
            v-for="tag in activeEntry.tags"
            :key="tag"
            class="tag-badge"
            :class="{
              'is-clickable': tagFilterEnabled,
              'is-active': tagFilterEnabled && activeTag === tag,
            }"
            :role="tagFilterEnabled ? 'button' : undefined"
            :tabindex="tagFilterEnabled ? 0 : undefined"
            :aria-label="tagFilterEnabled ? 'Filter by tag: ' + tag : undefined"
            :aria-pressed="tagFilterEnabled ? activeTag === tag : undefined"
            @click="tagFilterEnabled && handleTagBadgeClick(tag)"
            @keydown.enter="tagFilterEnabled && handleTagBadgeClick(tag)"
            @keydown.space.prevent="tagFilterEnabled && handleTagBadgeClick(tag)"
            >{{ tag }}</span
          >
        </div>
      </div>

      <article
        v-if="activeEntry.Content && activeEntry.Content !== 'WORK IN PROGRESS'"
        class="highlight-content"
      >
        <h3 class="highlight-section-title">
          {{ activeEntry.Title }}
        </h3>
        <div class="content-body" v-html="renderBlock(activeEntry.Content)" />
      </article>

      <!-- Standard experience/education entry -->
      <template v-else>
        <div
          v-if="activeEntry.Highlights && activeEntry.Highlights.length"
          class="highlight-section"
        >
          <h3 class="highlight-section-title">HIGHLIGHTS</h3>
          <ul class="highlight-list">
            <li
              v-for="(item, i) in activeEntry.Highlights"
              :key="`h-${i}`"
              :class="{
                'has-tag': itemTagUID(item) !== null,
                'is-active-link': isActiveLinkItem(item),
              }"
              @click="handleItemClick(item)"
            >
              <span class="item-text" v-html="highlightText(itemText(item))" />
            </li>
          </ul>
        </div>

        <div v-if="activeEntry.Bullets && activeEntry.Bullets.length" class="highlight-section">
          <h3 class="highlight-section-title">
            {{ activeEntry.BulletsTitle || 'BULLETS' }}
          </h3>
          <ul class="highlight-list">
            <li
              v-for="(item, i) in activeEntry.Bullets"
              :key="`b-${i}`"
              :class="{
                'has-tag': itemTagUID(item) !== null,
                'is-active-link': isActiveLinkItem(item),
              }"
              @click="handleItemClick(item)"
            >
              <span class="item-text" v-html="highlightText(itemText(item))" />
            </li>
          </ul>
        </div>

        <div
          v-if="activeEntry.Certifications && activeEntry.Certifications.length"
          class="highlight-section"
        >
          <h3 class="highlight-section-title">
            {{ activeEntry.CertificationsTitle || 'PROFESSIONAL DEVELOPMENT' }}
          </h3>
          <div class="cert-list">
            <div
              v-for="cert in activeEntry.Certifications"
              :key="cert.Name + cert.Date"
              class="cert-row"
            >
              <span class="cert-name">{{ cert.Name.trim() }}</span>
              <span class="cert-issuer">{{ cert.Issuer.trim() }}</span>
              <span class="cert-date">{{ cert.Date.trim() }}</span>
            </div>
          </div>
        </div>

        <div v-if="activeEntry.related && activeEntry.related.length" class="highlight-relations">
          <span class="relations-label">Related entries:</span>
          <span class="relations-count">{{ activeEntry.related.length }}</span>
          <span class="relations-hint">(highlighted in sidebar)</span>
        </div>
      </template>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  selectedEntry: { type: Object, default: null },
  defaultEntry: { type: Object, required: true },
  searchQuery: { type: String, default: '' },
  invalidUID: { type: Boolean, default: false },
  tagFilterEnabled: { type: Boolean, default: false },
  activeTag: { type: String, default: '' },
  entries: { type: Array, default: () => [] },
})

const emit = defineEmits(['tag-click', 'tag-badge-click', 'navigate'])

const showPrinny = ref(false)
let prinnyTimeout: ReturnType<typeof setTimeout> | null = null

function dismissPrinny() {
  if (prinnyTimeout) {
    clearTimeout(prinnyTimeout)
    prinnyTimeout = null
  }
  showPrinny.value = false
}

function triggerPrinny() {
  showPrinny.value = true
  if (prinnyTimeout) clearTimeout(prinnyTimeout)
  prinnyTimeout = setTimeout(dismissPrinny, 5000)
}

onUnmounted(() => {
  if (prinnyTimeout) clearTimeout(prinnyTimeout)
})

const dismissInvalidUID = ref(false)
const highlightRef = ref<any>(null)

const activeEntry = computed(() => props.selectedEntry ?? props.defaultEntry)
const mediaStyle = computed(() => {
  const fit = activeEntry.value?.mediaFit || 'cover'
  switch (fit) {
    case 'as-is':
      return { objectFit: 'none', width: 'auto', height: 'auto', maxHeight: 'none' }
    case 'force-height':
      return { objectFit: 'fill', maxHeight: 'none' }
    case 'force-width':
      return { objectFit: 'fill', width: 'auto' }
    default:
      return { objectFit: fit }
  }
})
const showInvalidBanner = computed(() => props.invalidUID && !dismissInvalidUID.value)
const isWip = computed(() => activeEntry.value?.Content === 'WORK IN PROGRESS')

const activeLinkedUID = ref<any>(null)

// Navigation
const currentIndex = computed(() => {
  if (!props.selectedEntry) return -1
  return (props.entries as any[]).findIndex((e: any) => e.UID === (props.selectedEntry as any).UID)
})

const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(
  () => currentIndex.value >= 0 && currentIndex.value < props.entries.length - 1,
)

const prevEntry = computed(() =>
  hasPrev.value ? (props.entries as any[])[currentIndex.value - 1] : null,
)
const nextEntry = computed(() =>
  hasNext.value ? (props.entries as any[])[currentIndex.value + 1] : null,
)

function goPrev() {
  if (!hasPrev.value) return
  emit('navigate', (props.entries as any[])[currentIndex.value - 1].UID)
}

function goNext() {
  if (!hasNext.value) return
  emit('navigate', (props.entries as any[])[currentIndex.value + 1].UID)
}

watch(
  () => props.selectedEntry,
  () => {
    activeLinkedUID.value = null
  },
)

watch(
  () => props.searchQuery,
  (val) => {
    if (['dood', 'prinny'].includes(val?.toLowerCase().trim())) {
      triggerPrinny()
    }
  },
)

function itemText(item: any): string {
  return typeof item === 'string' ? item : (item?.text ?? '')
}
function itemTagUID(item: any): number | null {
  if (typeof item === 'string' || !item) return null
  return item.tagUID ?? null
}
function isActiveLinkItem(item: any): boolean {
  const uid = itemTagUID(item)
  return uid !== null && uid === activeLinkedUID.value
}
function handleItemClick(item: any): void {
  const uid = itemTagUID(item)
  if (uid === null) return
  if (activeLinkedUID.value === uid) {
    activeLinkedUID.value = null
    emit('tag-click', null)
  } else {
    activeLinkedUID.value = uid
    emit('tag-click', uid)
  }
}

function handleTagBadgeClick(tag) {
  emit('tag-badge-click', tag)
}

function renderInline(text: string): string {
  if (!text) return ''
  const html = marked.parseInline(String(text))
  return applySearchMark(html as string)
}
function renderBlock(text: string): string {
  if (!text) return ''
  const html = marked.parse(String(text))
  return applySearchMark(html as string)
}
function applySearchMark(html: string): string {
  if (!props.searchQuery || !html) return html
  const safe = props.searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return html.replace(new RegExp(`(?![^<]*>)(${safe})`, 'gi'), '<mark>$1</mark>')
}
function highlightText(text: string): string {
  return renderInline(text)
}

function focusHighlight() {
  highlightRef.value?.focus({ preventScroll: true })
}

defineExpose({ focusHighlight })
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

.highlight:focus-visible {
  outline: 2px solid var(--color-selected-outline);
  outline-offset: -2px;
}
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
.content-body :deep(p) {
  margin-bottom: 0.8rem;
}
.content-body :deep(strong) {
  font-weight: 700;
}
.content-body :deep(em) {
  font-style: italic;
}
.content-body :deep(h1),
.content-body :deep(h2),
.content-body :deep(h3) {
  margin: 1rem 0 0.4rem;
  font-weight: 700;
}
.content-body :deep(code) {
  font-family: monospace;
  font-size: 0.82rem;
  background: #f0f0f0;
  padding: 0 3px;
  border-radius: 3px;
}
.content-body :deep(pre) {
  background: #f4f4f4;
  border-radius: 4px;
  padding: 0.8rem;
  overflow-x: auto;
  margin: 0.5rem 0;
}
.content-body :deep(ul),
.content-body :deep(ol) {
  padding-left: 1.2rem;
  margin: 0.3rem 0;
}
.content-body :deep(hr) {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 0.8rem 0;
}
.highlight-list li :deep(strong) {
  font-weight: 700;
}
.highlight-list li :deep(em) {
  font-style: italic;
}
.highlight-list li :deep(code) {
  font-family: monospace;
  font-size: 0.8rem;
  background: #f0f0f0;
  padding: 0 3px;
  border-radius: 3px;
}

/* ─── Certification list ─────────────────────────────────────── */
.cert-list {
  display: flex;
  flex-direction: column;
  font-size: 0.82rem;
  line-height: 1.5;
}
.cert-row {
  display: flex;
  gap: 0.6rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--color-border);
}
.cert-name {
  font-weight: 600;
  flex: 1;
}
.cert-issuer {
  flex: 1;
}
.cert-date {
  text-align: right;
  color: var(--color-text-light);
  white-space: nowrap;
}

.prinny-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  cursor: pointer;
  pointer-events: none;
  transition: background 0.5s ease;
}
.prinny-overlay--visible {
  background: rgba(255, 255, 255, 0.95);
  pointer-events: auto;
}
.prinny-gif {
  max-width: 300px;
  max-height: 300px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  transform: translateY(100%);
  opacity: 0;
  transition:
    transform 0.5s ease,
    opacity 0.5s ease;
}
.prinny-overlay--visible .prinny-gif {
  transform: translateY(0);
  opacity: 1;
}
.prinny-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #333;
  color: #fff;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.prinny-overlay--visible .prinny-close {
  pointer-events: auto;
  opacity: 1;
}

.prinny-close:focus-visible {
  outline: 2px solid var(--color-selected-outline);
  outline-offset: 2px;
}

.invalid-uid-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.invalid-uid-text {
  font-size: 0.85rem;
  color: #856404;
}

.invalid-uid-close {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  color: #856404;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.invalid-uid-close:hover {
  color: #533f03;
}

.invalid-uid-close:focus-visible {
  outline: 2px solid #856404;
  outline-offset: 2px;
  border-radius: 2px;
}

@media (max-width: 767px) {
  .highlight {
    width: 100%;
    max-height: 45vh;
    padding: 1rem;
    border-bottom: 1px solid var(--color-border);
  }
}
</style>
