<template>
  <footer class="app-footer">
    <nav
      class="footer-nav"
      aria-label="Footer navigation"
    >
      <a
        href="https://github.com/fpamadeo"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub profile"
      >GitHub</a>
      <span
        class="nav-sep"
        aria-hidden="true"
      > | </span>
      <a
        href="https://linkedin.com/in/franpaul"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn profile"
      >LinkedIn</a>
      <span
        class="nav-sep"
        aria-hidden="true"
      > | </span>
      <!-- Easter egg: invisible text, tooltip hints to search for Rick -->
      <span
        class="easter-egg"
        :title="easterEggTooltip"
        aria-hidden="true"
      >{{ easterEggText }}</span>
    </nav>
  </footer>
</template>

<script setup lang="ts">
const easterEggTooltip = 'Search for Rick'
const easterEggText = '✦'
</script>

<style scoped>
.app-footer {
  width: 100%;
  height: var(--footer-height);
  background-color: var(--color-header-bg);
  color: var(--color-header-text);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: auto;
}

.footer-nav {
  display: flex;
  align-items: center;
  font-size: 0.7rem;
  letter-spacing: 0.05em;
}

.footer-nav a {
  color: var(--color-header-text);
  text-decoration: none;
  opacity: 0.7;
  transition: opacity var(--transition-fast);
}

.footer-nav a:hover {
  opacity: 1;
  text-decoration: none;
}

.nav-sep {
  color: var(--color-header-text);
  opacity: 0.4;
  user-select: none;
}

/* Easter egg: same color as background = invisible unless you look for it */
.easter-egg {
  color: var(--color-header-bg);
  cursor: default;
  user-select: none;
  font-size: 0.7rem;
  transition: color var(--transition-med);
}

.easter-egg:hover {
  color: var(--color-header-text);
  opacity: 0.3;
}
</style>
