<template>
  <div
    class="search-bar squircle"
    role="search"
  >
    <label
      for="search-input"
      class="sr-only"
    >Search entries</label>
    <input
      id="search-input"
      ref="inputRef"
      v-model="query"
      type="text"
      class="search-input"
      placeholder="Search..."
      @keydown.enter="handleSearch"
    >
    <button
      class="search-btn"
      aria-label="Submit search"
      @click="handleSearch"
    >
      <!-- Search icon SVG -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle
          cx="11"
          cy="11"
          r="8"
        />
        <line
          x1="21"
          y1="21"
          x2="16.65"
          y2="16.65"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['search'])

const query = ref('')
const inputRef = ref<any>(null)

const RICK_STRINGS = ['rick', 'rick astley']

function handleSearch() {
  const trimmed = query.value.trim()
  if (RICK_STRINGS.includes(trimmed.toLowerCase())) {
    window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank', 'noopener,noreferrer')
    return
  }
  emit('search', trimmed)
}

// Exposed so parent (SidebarComponent) can clear the input on summary click
function clear() {
  query.value = ''
  emit('search', '')
}

defineExpose({ clear })
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  background-color: var(--color-search-bg);
  border: 1px solid var(--color-border);
  overflow: hidden;
  width: 100%;
  height: 36px;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.search-bar:focus-within {
  border-color: #aaaaaa;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.06);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0 0.6rem;
  font-family: var(--font-body);
  font-size: 0.82rem;
  color: var(--color-text);
  min-width: 0;
}

.search-input:focus-visible {
  outline: 2px solid var(--color-selected-outline);
  outline-offset: 1px;
  border-radius: 2px;
}

.search-input::placeholder {
  color: #bbbbbb;
}

.search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: #777777;
  cursor: pointer;
  transition: color var(--transition-fast), background-color var(--transition-fast);
}

.search-btn:hover {
  color: var(--color-text);
  background-color: rgba(0, 0, 0, 0.06);
}

.search-btn:focus-visible {
  outline: 2px solid var(--color-selected-outline);
  outline-offset: 1px;
}

.search-btn:active {
  background-color: rgba(0, 0, 0, 0.1);
}
</style>
