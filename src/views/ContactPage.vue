<template>
  <aside class="contact-sidebar">
    <div class="profile-section">
      <div class="profile-img-wrapper">
        <img
          v-if="aboutData.profileImage"
          :src="aboutData.profileImage"
          :alt="`Profile photo of ${aboutData.name}`"
          class="profile-img"
          loading="lazy"
          decoding="async"
        >
        <div
          v-else
          class="profile-img-placeholder"
          aria-label="Profile photo placeholder"
        >
          <span class="placeholder-initials">{{ initials }}</span>
        </div>
      </div>
      <h1 class="profile-name">
        {{ aboutData.name }}
      </h1>
      <p
        class="profile-summary"
        v-html="marked.parseInline(aboutData.summary)"
      />
    </div>
  </aside>

  <RuleSeparator direction="vertical" />

  <section class="contact-highlight">
    <div class="email-section">
      <h2 class="section-heading">
        Email
      </h2>
      <p class="email-text">
        Feel free to reach out at
        <a
          :href="'mailto:' + email"
          class="contact-email"
        >{{ displayEmail }}</a>
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import RuleSeparator from '@/components/RuleSeparator.vue'
import aboutData from '@/data/about.json'
import contactData from '@/data/contact.json'

const initials = computed(() =>
  aboutData.name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('')
)

const { local, domain } = contactData.email
const email = local + '@' + domain

const displayEmail = '[firstname][secondname].dev(at)[Google\'s email service]'
</script>

<style scoped>
/* ─── Left panel ─────────────────────────────────────────────── */
.contact-sidebar {
  width: var(--sidebar-width);
  min-width: 220px;
  flex-shrink: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 12.5%;
  padding-bottom: 2rem;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.profile-section {
  display: flex;
  flex-direction: column;
  align-items: center;
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
.profile-summary :deep(a) { text-decoration: underline; }

/* ─── Right panel ────────────────────────────────────────────── */
.contact-highlight {
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

.email-text {
  font-size: 0.88rem;
  line-height: 1.8;
  color: var(--color-text);
}

.contact-email {
  color: var(--color-text);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: opacity var(--transition-fast);
}

.contact-email:hover {
  opacity: 0.7;
}

/* ─── Mobile ─────────────────────────────────────────────────── */
@media (max-width: 767px) {
  .contact-sidebar {
    width: 100%;
    padding-top: 2rem;
  }
  .contact-highlight {
    padding: 1.5rem 1rem;
  }
}
</style>
