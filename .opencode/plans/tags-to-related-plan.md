# Tags → Related + Supertag Implementation Plan

## Overview

Migrate from the old single `Tags` field to two separate fields (`related` and `tags`), add supertag aggregation, and implement clickable tag filter in the sidebar.

---

## Phase 1: Data Files (src/data/)

### 1. experience.json

**Changes:**
- `Tags` → `related` (rename, keep UID values)
- Add `tags` arrays with supertag-formatted strings

Each entry:

| UID | related | tags |
|-----|---------|------|
| 201 | `[]` | `["Client: Freelance", "Role: Full Stack", "Stack: JavaScript", "Stack: Python", "Skill: Automation", "Skill: Architecture"]` |
| 211 | `[212]` | `["Company: Epic Systems", "Domain: Healthcare", "Role: Full Stack", "Stack: JavaScript", "Stack: .NET", "Stack: C#", "Stack: TypeScript", "Stack: SQL", "Tech: Azure"]` |
| 212 | `[211]` | `["Company: Epic Systems", "Domain: Healthcare", "Role: Leadership", "Skill: Microservices", "Skill: HIPAA", "Skill: ETL"]` |
| 221 | `[101, 222]` | `["Domain: Robotics", "Role: Leadership", "Stack: C++", "Skill: Wireless", "Skill: Arduino", "Event: MRDC"]` |
| 222 | `[101, 221]` | `["Domain: Robotics", "Role: Mentoring", "Skill: Electrical Engineering", "Tool: Altium", "Tool: Eagle"]` |
| 231 | `[101]` | `["Domain: Education", "Stack: Python", "Skill: Circuit Simulation", "Skill: Research"]` |

### 2. education.json

**Changes:**
- Add `related` field
- Old Tags (string arrays) → new `tags` field

| UID | related | tags |
|-----|---------|------|
| 101 | `[211, 221, 222, 231]` | `["Degree: Computer Engineering", "Honor: Cum Laude", "Society: IEEE HKN", "Society: Tau Beta Pi"]` |
| 102 | `[]` | `["Degree: Engineering Science", "Honor: High Honors"]` |

### 3. writing.json

**Changes:**
- `Tags` → `tags` (rename)
- Add `related: []`

| UID | related | tags |
|-----|---------|------|
| 201 | `[]` | `["Topic: Distributed Systems", "Topic: Raft", "Topic: Paxos", "Domain: Computer Science"]` |
| 202 | `[]` | `["Tech: Vue.js", "Tech: React", "Domain: Frontend", "Type: Opinion"]` |
| 203 | `[]` | `["Topic: CI/CD", "Tool: GitHub Actions", "Domain: DevOps", "Type: Tutorial"]` |

---

## Phase 2: Supertag Aggregation Utility

Create `src/composables/useTagAggregation.js`:

```js
export function buildTagDisplay(allTags) {
  // Input: Set of unique tag strings from all entries
  // Output: Array of display items
  //
  // Each item is either:
  //   { type: 'group', supertag: 'Review', tags: [{ full: 'Review: movies', subtag: 'movies' }, ...] }
  //   { type: 'standalone', full: 'Topic: JavaScript' }
  //   { type: 'flat', full: 'frontend' }
  //
  // Rules:
  //   - Tags matching "Supertag: subtag" pattern are grouped by supertag (case-insensitive)
  //   - Groups with only 1 tag are flattened to standalone
  //   - Tags without ":" are flat items
  //   - Supertag display uses title-case (first letter capitalized)
}

export function useTagAggregation(allEntries) {
  // Computed: unique tag set from all entries
  // Computed: tag display data using buildTagDisplay
  // Returns: { allTags, tagDisplayData }
}
```

---

## Phase 3: SidebarComponent.vue

### New Props
- `showTagFilter`: Boolean (default `false`) — controls tag pill visibility

### New State
- `selectedTag`: ref(null) — active tag filter string

### Template (between search bar and summary)
```html
<div v-if="showTagFilter && tagDisplayData.length" class="tag-filter-area">
  <template v-for="item in tagDisplayData" :key="item.full || item.supertag">
    <!-- Supertag group -->
    <div v-if="item.type === 'group'" class="tag-group">
      <span class="tag-supertag-label">{{ item.supertag }}:</span>
      <span v-for="t in item.tags" :key="t.full" class="tag-pill-wrapper">
        <button
          class="tag-pill"
          :class="{ 'is-active': selectedTag === t.full }"
          role="button"
          tabindex="0"
          :aria-pressed="selectedTag === t.full"
          :aria-label="'Filter by tag: ' + t.full"
          @click="toggleTag(t.full)"
          @keydown.enter="toggleTag(t.full)"
          @keydown.space.prevent="toggleTag(t.full)"
        >{{ t.subtag }}</button>
      </span>
    </div>
    <!-- Standalone or flat tag -->
    <span v-else class="tag-pill-wrapper">
      <button
        class="tag-pill"
        :class="{ 'is-active': selectedTag === item.full }"
        role="button"
        tabindex="0"
        :aria-pressed="selectedTag === item.full"
        :aria-label="'Filter by tag: ' + item.full"
        @click="toggleTag(item.full)"
        @keydown.enter="toggleTag(item.full)"
        @keydown.space.prevent="toggleTag(item.full)"
      >{{ item.display || item.full }}</button>
    </span>
  </template>
</div>
```

### New Methods
- `toggleTag(tag)`: toggles `selectedTag` (click same = deselect)
- `setActiveTag(tag)` (exposed via `defineExpose`): sets `selectedTag` from external

### Updated Logic
- `isDimmed()`: add `|| (selectedTag.value && !(entry.tags || []).includes(selectedTag.value))`
- `entryMatchesQuery()`: add `entry.tags` to searched fields array
- `resetSelection()`: also clear `selectedTag = null`

### CSS for tag pills
```css
.tag-filter-area {
  padding: 0.5rem var(--sidebar-padding);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  align-items: baseline;
}

.tag-group {
  display: inline-flex;
  align-items: baseline;
  gap: 0.2rem;
  flex-wrap: wrap;
}

.tag-supertag-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--color-text-light);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-right: 0.1rem;
}

.tag-pill-wrapper {
  display: inline-flex;
}

.tag-pill {
  font-family: var(--font-body);
  font-size: 0.7rem;
  padding: 2px 7px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-tag-bg, #f0f0f0);
  color: var(--color-text);
  cursor: pointer;
  transition: background-color var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
  white-space: nowrap;
  line-height: 1.4;
}

.tag-pill:hover {
  background: var(--color-tag-hover-bg, #e4e4e4);
  border-color: #ccc;
}

.tag-pill:focus-visible {
  outline: 2px solid var(--color-selected-outline);
  outline-offset: 1px;
}

.tag-pill.is-active {
  background: var(--color-selected-outline);
  border-color: var(--color-selected-outline);
  color: #111;
  font-weight: 600;
}
```

---

## Phase 4: HighlightComponent.vue

### Changes
1. **Related entries count**: `activeEntry.Tags` → `activeEntry.related` (line ~81)
2. **New tag badges section** in template (before the related entries section):
```html
<div v-if="activeEntry.tags?.length" class="highlight-section">
  <h3 class="highlight-section-title">TAGS</h3>
  <div class="tag-badges">
    <span
      v-for="tag in activeEntry.tags"
      :key="tag"
      class="tag-badge"
      :class="{ 'is-clickable': tagFilterEnabled, 'is-active': tagFilterEnabled && activeTag === tag }"
      :role="tagFilterEnabled ? 'button' : undefined"
      :tabindex="tagFilterEnabled ? 0 : undefined"
      :aria-label="tagFilterEnabled ? 'Filter by tag: ' + tag : undefined"
      :aria-pressed="tagFilterEnabled ? activeTag === tag : undefined"
      @click="tagFilterEnabled && handleTagBadgeClick(tag)"
      @keydown.enter="tagFilterEnabled && handleTagBadgeClick(tag)"
      @keydown.space.prevent="tagFilterEnabled && handleTagBadgeClick(tag)"
    >{{ tag }}</span>
  </div>
</div>
```

### New Props
- `tagFilterEnabled`: Boolean (default `false`)
- `activeTag`: String (default `''`) — to show which tag is active

### New Emits
- `'tag-badge-click'` (payload: tag string)

### New Methods/State
- `activeTag` ref tracking (can be passed as prop from parent)
- `handleTagBadgeClick(tag)`: toggles emit (click same tag again = emit null to deselect)

### CSS for tag badges
```css
.tag-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.tag-badge {
  font-size: 0.7rem;
  padding: 2px 8px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-tag-bg, #f0f0f0);
  color: var(--color-text);
  transition: background-color var(--transition-fast);
}
.tag-badge.is-clickable {
  cursor: pointer;
}
.tag-badge.is-clickable:hover {
  background: var(--color-tag-hover-bg, #e4e4e4);
}
.tag-badge.is-clickable:focus-visible {
  outline: 2px solid var(--color-selected-outline);
  outline-offset: 1px;
}
.tag-badge.is-clickable.is-active {
  background: var(--color-selected-outline);
  border-color: var(--color-selected-outline);
  font-weight: 600;
}
```

---

## Phase 5: View Pages

### OtherPage.vue

**Changes:**
1. Pass `showTagFilter={true}` to SidebarComponent
2. Use a template ref on SidebarComponent to call `setActiveTag()`:
```js
const sidebarRef = ref(null)

// In template:
<SidebarComponent ref="sidebarRef" :show-tag-filter="true" ... />
<HighlightComponent @tag-badge-click="onTagBadgeClick" :tag-filter-enabled="true" ... />

// In script:
function onTagBadgeClick(tag) {
  if (sidebarRef.value?.setActiveTag) {
    sidebarRef.value.setActiveTag(tag)
  }
}
```
3. Pass `activeTag` to HighlightComponent:
```js
const activeTag = ref('')
function onTagBadgeClick(tag) {
  activeTag.value = activeTag.value === tag ? '' : tag
  if (sidebarRef.value?.setActiveTag) {
    sidebarRef.value.setActiveTag(activeTag.value)
  }
}
```
4. Update `writingAsExperiences` mapper:
```js
related:   w.related ?? [],
tags:      w.tags ?? [],
```
5. Summary line: `(w.tags || []).join(', ')`

### ExperiencePage.vue
**Changes:** None needed. Tag filter is off by default.

---

## Phase 6: Test Updates

### SidebarComponent.spec.js
- Update mock entries: `Tags` → `related`, add `tags` arrays
- Add test: renders tag pills when `showTagFilter` is true
- Add test: hides tag pills when `showTagFilter` is false
- Add test: clicking a tag pill sets it active
- Add test: clicking active tag pill deselects it
- Add test: active tag dims entries without that tag
- Add test: supertag groups display correctly
- Add test: standalone tags display correctly
- Add test: tag pills have correct ARIA attributes
- Add test: keyboard navigation on tag pills

### HighlightComponent.spec.js
- Update mock default entry: `Tags: [2, 3]` → `related: [2, 3]`, add `tags: []`
- Add test: tag badges render when entry has tags
- Add test: tag badges are clickable when `tagFilterEnabled` is true
- Add test: tag badges emit `tag-badge-click` on click
- Add test: tag badges are static when `tagFilterEnabled` is false
- Update existing related entries test from `Tags` → `related`
- Update `expect(wrapper.find('.relations-count').text()).toBe('2')` → stays same since mock has `related: [2, 3]`

---

## Phase 7: CSS Variables (global.css)

Add:
```css
--color-tag-bg: #f0f0f0;
--color-tag-hover-bg: #e4e4e4;
--color-tag-active-bg: var(--color-selected-outline);
```

---

## Files Modified Summary

| # | File | Action |
|---|------|--------|
| 1 | `src/data/experience.json` | Rewrite |
| 2 | `src/data/education.json` | Rewrite |
| 3 | `src/data/writing.json` | Rewrite |
| 4 | `src/composables/useTagAggregation.js` | **New** |
| 5 | `src/components/SidebarComponent.vue` | Edit |
| 6 | `src/components/HighlightComponent.vue` | Edit |
| 7 | `src/views/OtherPage.vue` | Edit |
| 8 | `src/assets/styles/global.css` | Edit (optional vars) |
| 9 | `src/components/__tests__/SidebarComponent.spec.js` | Edit |
| 10 | `src/components/__tests__/HighlightComponent.spec.js` | Edit |
