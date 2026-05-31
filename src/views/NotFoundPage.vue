<template>
  <div class="page-wrapper">
    <AppHeader />
    <RuleSeparator direction="horizontal" />

    <main
      id="main-content"
      class="page-main not-found"
    >
      <div class="not-found-content">
        <h1 class="not-found-code">
          404
        </h1>
        <p class="not-found-message">
          Page not found
        </p>
        <p class="not-found-description">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <router-link
          to="/"
          class="not-found-link"
        >
          Return to Experience
        </router-link>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import RuleSeparator from '@/components/RuleSeparator.vue'
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.not-found-content {
  text-align: center;
  padding: 2rem;
}

.not-found-code {
  font-size: 6rem;
  font-weight: 700;
  color: var(--color-text-light, #999);
  margin: 0;
  line-height: 1;
}

.not-found-message {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text, #333);
  margin: 1rem 0;
}

.not-found-description {
  font-size: 1rem;
  color: var(--color-text-light, #666);
  margin-bottom: 2rem;
}

.not-found-link {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: var(--color-text, #333);
  color: var(--color-bg, #fff);
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: opacity 0.2s ease;
}

.not-found-link:hover {
  opacity: 0.8;
}
</style>