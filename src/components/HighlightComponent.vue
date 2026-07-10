<template>
  <section
    ref="highlightRef"
    class="highlight"
    tabindex="-1"
    aria-live="polite"
    aria-atomic="true"
  >

    <div
      v-if="showInvalidBanner"
      class="invalid-id-banner"
      role="alert"
    >
      <span class="invalid-id-text">The UID provided in the URL was not found. Showing default highlights.</span>
      <button
        class="invalid-id-close"
        aria-label="Dismiss"
        @click="dismissInvalidId = true"
      >
        ×
      </button>
    </div>

    <div
      v-if="isWip"
      class="wip-overlay"
      aria-hidden="true"
    >
      <div class="wip-watermark">
        WORK IN PROGRESS PO
      </div>
    </div>
      <!-- Entry Navigation -->
      <div
        v-if="entries.length && selectedEntry && (hasPrev || hasNext)"
        class="highlight-nav"
      >
        <button
          class="nav-btn nav-prev"
          :disabled="!hasPrev"
          :aria-label="prevLabel"
          @click="changeEntry(-1)"
        >
          ← Previous
        </button>
        <span class="nav-position">{{ currentIndex + 1 }} / {{ entries.length }}</span>
        <button
          class="nav-btn nav-next"
          :disabled="!hasNext"
          :aria-label="nextLabel"
          @click="changeEntry(+1)"
        >
          Next →
        </button>
      </div>

      <div
        v-if="activeEntry.media"
        class="highlight-media"
      >
        <img
          :src="activeEntry.media"
          :alt="`Media for ${activeEntry.Title || activeEntry.subtitle}`"
          class="highlight-img"
          :style="mediaStyle"
          loading="lazy"
          decoding="async"
        >
      </div>

      <article
        v-if="activeEntry.body"
        class="highlight-content"
      >
        <h2 class="highlight-title">
          {{ activeEntry.Title }}
        </h2>
        <div
          class="content-body"
          v-html="renderBlock(activeEntry.body)"
        />
      </article>

      <!-- Standard experience/education entry -->
      <template v-else>
        <div
          v-if="activeEntry.Highlights && activeEntry.Highlights.length"
          class="highlight-section"
        >
          <h3 class="highlight-section-title">
            HIGHLIGHTS
          </h3>
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
              <span
                class="item-text"
                v-html="highlightText(itemText(item))"
              />
            </li>
          </ul>
        </div>

        <div
          v-if="activeEntry.Bullets && activeEntry.Bullets.length"
          class="highlight-section"
        >
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
              <span
                class="item-text"
                v-html="highlightText(itemText(item))"
              />
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
      </template>

      <div
        v-if="activeEntry.tags && activeEntry.tags.length"
        class="highlight-section"
      >
        <h3 class="highlight-section-title">
          TAGS
        </h3>
        <div class="tag-filter-area">
          <span
            v-for="tag in activeEntry.tags"
            :key="tag"
            class="tag-pill-wrapper"
          >
            <button
              class="tag-pill"
              :class="{ 'is-active': tagFilterEnabled && activeTag === tag }"
              :disabled="!tagFilterEnabled"
              :aria-pressed="tagFilterEnabled ? activeTag === tag : undefined"
              @click="handleTagBadgeClick(tag)"
              @keydown.enter="handleTagBadgeClick(tag)"
              @keydown.space.prevent="handleTagBadgeClick(tag)"
            >{{ tag }}</button>
          </span>
        </div>
      </div>

      <div
        v-if="activeEntry.related && activeEntry.related.length"
        class="highlight-relations"
      >
        <span class="relations-label">Related entries:</span>
        <span class="relations-count">{{ activeEntry.related.length }}</span>
        <span class="relations-hint">(highlighted in sidebar)</span>
      </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch, inject } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  selectedEntry: { type: Object, default: null },
  defaultEntry: { type: Object, required: true },
  searchQuery: { type: String, default: '' },
  invalidId: { type: Boolean, default: false },
  tagFilterEnabled: { type: Boolean, default: false },
  activeTag: { type: String, default: '' },
  entries: { type: Array, default: () => [] },
})

const emit = defineEmits(['tag-click', 'tag-badge-click', 'navigate'])

const triggerPrinny = inject<(() => void) | null>('triggerPrinny', null)

const dismissInvalidId = ref(false)
const highlightRef = ref<any>(null)

type ObjectFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'

function toObjectFit(raw: string): ObjectFit {
  const normalized = raw.toLowerCase()
  switch (normalized) {
    case 'cover':
    case 'fill':
    case 'contain':
    case 'none':
    case 'scale-down':
      return normalized
    case 'as-is':
      return 'none'
    case 'force-height':
    case 'force-width':
      return 'fill'
    default:
      return 'cover'
  }
}

const activeEntry = computed(() => props.selectedEntry ?? props.defaultEntry)
const mediaStyle = computed(() => {
  const raw = activeEntry.value?.mediaFit || 'cover'
  const objectFit = toObjectFit(raw)
  switch (raw) {
    case 'as-is':
      return { objectFit, width: 'auto', height: 'auto', maxHeight: 'none' }
    case 'force-height':
      return { objectFit, maxHeight: 'none' }
    case 'force-width':
      return { objectFit, width: 'auto' }
    default:
      return { objectFit }
  }
})
const showInvalidBanner = computed(() => props.invalidId && !dismissInvalidId.value)
const isWip = computed(() => !!activeEntry.value?.isWip)

const activeLinkedUID = ref<any>(null)

interface NavEntry {
  id: number
  subtitle?: string
  Title?: string
}

const entryList = computed<NavEntry[]>(() => props.entries as NavEntry[])

const currentIndex = computed(() => {
  if (!props.selectedEntry) return -1
  return entryList.value.findIndex((e) => e.id === (props.selectedEntry as any).id)
})

const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value >= 0 && currentIndex.value < entryList.value.length - 1)

const prevEntry = computed(() => (hasPrev.value ? entryList.value[currentIndex.value - 1] : null))
const nextEntry = computed(() => (hasNext.value ? entryList.value[currentIndex.value + 1] : null))

const prevLabel = computed(() => {
  if (!prevEntry.value) return ''
  const desc = prevEntry.value.subtitle || prevEntry.value.Title
  return desc ? `Previous entry: ${desc}` : ''
})

const nextLabel = computed(() => {
  if (!nextEntry.value) return ''
  const desc = nextEntry.value.subtitle || nextEntry.value.Title
  return desc ? `Next entry: ${desc}` : ''
})

function changeEntry(delta: number) {
  const idx = currentIndex.value + delta
  if (idx < 0 || idx >= entryList.value.length) return
  emit('navigate', entryList.value[idx].id)
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
  position: relative;
  min-height: 300px;
}

.highlight:focus-visible {
  outline: 2px solid var(--color-selected-outline);
  outline-offset: -2px;
}
.wip-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
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

/* ─── Media ───────────────────────────────────────────────────── */
.highlight-media {
  width: 100%;
}

.highlight-img {
  width: 100%;
  max-height: 260px;
  aspect-ratio: auto;
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

.highlight-title {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 0.75rem;
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

/* ─── Tag pills ───────────────────────────────────────────────── */
.tag-filter-area {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  align-items: baseline;
}

/* ─── Related entries footer ─────────────────────────────────── */
.highlight-relations {
  display: flex;
  gap: 0.3rem;
  font-size: 0.75rem;
  color: var(--color-text-light);
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  margin-top: auto;
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
.content-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 0.8rem 0;
}
.content-body :deep(th) {
  background: var(--color-header-bg);
  color: var(--color-header-text);
  padding: 0.4rem 0.6rem;
  text-align: left;
  font-weight: 700;
  border: 1px solid var(--color-border);
}
.content-body :deep(td) {
  padding: 0.3rem 0.6rem;
  border: 1px solid var(--color-border);
}
.content-body :deep(tbody tr:nth-child(even)) {
  background: var(--color-dimmed-bg);
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

.invalid-id-banner {
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

.invalid-id-text {
  font-size: 0.85rem;
  color: #856404;
}

.invalid-id-close {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  color: #856404;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.invalid-id-close:hover {
  color: #533f03;
}

.invalid-id-close:focus-visible {
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
