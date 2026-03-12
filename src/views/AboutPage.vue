<template>
  <div class="page-wrapper">
    <AppHeader />

    <main class="page-main">

      <!-- Left panel: profile picture + name + summary -->
      <aside class="about-sidebar">
        <div class="profile-section">
          <div class="profile-img-wrapper">
            <img
              v-if="aboutData.profileImage"
              :src="aboutData.profileImage"
              :alt="`Profile photo of ${aboutData.name}`"
              class="profile-img"
            />
            <!-- Placeholder circle when no image is provided -->
            <div v-else class="profile-img-placeholder" aria-label="Profile photo placeholder">
              <span class="placeholder-initials">{{ initials }}</span>
            </div>
          </div>

          <h1 class="profile-name">{{ aboutData.name }}</h1>
          <p class="profile-summary">{{ aboutData.summary }}</p>
        </div>
      </aside>

      <!-- Right panel: bio + favorites -->
      <section class="about-highlight">

        <div class="bio-section">
          <h2 class="section-heading">Bio</h2>
          <div class="bio-text">
            <p v-for="(paragraph, i) in bioParagraphs" :key="i" class="bio-paragraph">
              {{ paragraph }}
            </p>
          </div>
        </div>

        <div class="favorites-section">
          <h2 class="section-heading">Current Favorites</h2>
          <div class="favorites-grid">
            <div
              v-for="(items, category) in aboutData.favorites"
              :key="category"
              class="favorites-category"
            >
              <h3 class="favorites-category-title">{{ category }}</h3>
              <ol class="favorites-list">
                <li v-for="(item, i) in items" :key="i">{{ item }}</li>
              </ol>
            </div>
          </div>
        </div>

      </section>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import aboutData from '@/data/about.json'

const initials = computed(() => {
  return aboutData.name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('')
})

// Split bio into paragraphs on double newlines or \n\n
const bioParagraphs = computed(() =>
  aboutData.bio.split(/\n\n+/).filter((p) => p.trim())
)
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

/* ─── Left sidebar panel ──────────────────────────────────────── */
.about-sidebar {
  width: var(--sidebar-width);
  min-width: 220px;
  flex-shrink: 0;
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 25%;
  padding-bottom: 2rem;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.profile-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  text-align: center;
  width: 100%;
}

.profile-img-wrapper {
  margin-bottom: 5%;
}

.profile-img,
.profile-img-placeholder {
  width: clamp(80px, 12vw, 140px);
  height: clamp(80px, 12vw, 140px);
  border-radius: 50%;
  object-fit: cover;
  display: block;
  border: 2px solid var(--color-border);
}

.profile-img-placeholder {
  background: #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-initials {
  font-size: clamp(1.2rem, 3vw, 2rem);
  font-weight: 700;
  color: #aaaaaa;
  font-family: var(--font-body);
}

/* Barbara font — only for the name */
.profile-name {
  font-family: var(--font-barbara);
  font-size: clamp(1rem, 2.5vw, 1.6rem);
  font-weight: normal;
  color: var(--color-text);
  margin-bottom: 0.6rem;
  line-height: 1.2;
}

.profile-summary {
  font-size: 0.82rem;
  color: var(--color-text-light);
  line-height: 1.6;
  font-style: italic;
}

/* ─── Right highlight panel ───────────────────────────────────── */
.about-highlight {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.section-heading {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text-light);
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1rem;
}

/* Bio */
.bio-text {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.bio-paragraph {
  font-size: 0.88rem;
  line-height: 1.8;
  color: var(--color-text);
}

/* Favorites */
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1.5rem;
}

.favorites-category-title {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--color-text);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.favorites-list {
  padding-left: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.favorites-list li {
  font-size: 0.82rem;
  color: var(--color-text);
  line-height: 1.5;
}

/* ─── Mobile ──────────────────────────────────────────────────── */
@media (max-width: 767px) {
  .page-main {
    flex-direction: column;
  }

  .about-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    padding-top: 2rem;
  }

  .about-highlight {
    padding: 1.5rem 1rem;
  }

  .favorites-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
