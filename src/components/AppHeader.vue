<template>
  <header class="app-header">
    <a
      href="#main-content"
      class="skip-link"
    >Skip to main content</a>
    <div class="header-title">
      Francis Paul Amadeo
    </div>
    <nav
      class="header-nav"
      aria-label="Main navigation"
    >
      <RouterLink
        to="/"
        :class="{ active: route.path === '/' }"
      >
        at Work
      </RouterLink>
      <span
        class="nav-sep"
        aria-hidden="true"
      > | </span>
      <RouterLink
        to="/about"
        :class="{ active: route.path === '/about' }"
      >
        at Life
      </RouterLink>
      <span
        class="nav-sep"
        aria-hidden="true"
      > | </span>
      <RouterLink
        to="/other"
        :class="{ active: route.path === '/other' }"
      >
        at Random
      </RouterLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
const route = useRoute()
</script>

<style scoped>
.app-header {
  width: 100%;
  height: min(20vh, 50px);
  min-height: 40px;
  background-color: var(--color-header-bg);
  color: var(--color-header-text);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  gap: 2px;
}

.header-title {
  font-family: var(--font-body);
  font-weight: 700;
  font-size: clamp(0.75rem, 1.5vw, 1rem);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-header-text);
  line-height: 1.2;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: clamp(0.6rem, 1.2vw, 0.8rem);
  letter-spacing: 0.05em;
}

.header-nav a {
  color: var(--color-header-text);
  text-decoration: none;
  opacity: 0.75;
  transition: opacity var(--transition-fast);
  padding: 0 0.3rem;
}

.header-nav a:hover,
.header-nav a.active {
  opacity: 1;
  text-decoration: none;
}

.header-nav a.active {
  font-weight: 700;
}

.nav-sep {
  color: var(--color-header-text);
  opacity: 0.4;
  font-size: 0.7em;
  user-select: none;
}

.skip-link {
  position: absolute;
  top: 0;
  left: 0;
  transform: translateY(-100%);
  background: #111;
  color: #fff;
  padding: 0.5rem 1rem;
  z-index: 200;
  font-size: 0.82rem;
  font-family: var(--font-body);
  text-decoration: none;
  transition: transform var(--transition-fast);
}

.skip-link:focus {
  transform: translateY(0);
}
</style>
