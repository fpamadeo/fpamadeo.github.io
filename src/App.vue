<template>
  <AiInstructions />
  <div class="page-wrapper">
    <AppHeader />
    <RuleSeparator direction="horizontal" />
    <main
      id="main-content"
      class="page-main"
      :class="mainClass"
    >
      <RouterView />
    </main>
    <RuleSeparator direction="horizontal" />
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AiInstructions from '@/components/AiInstructions.vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import RuleSeparator from '@/components/RuleSeparator.vue'

const route = useRoute()
const mainClass = computed(() => {
  const name = route.name as string
  if (name === 'Experience' || name === 'Other') return 'page-main--reverse'
  return 'page-main--column'
})
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
  min-height: 0;
}
@media (max-width: 767px) {
  .page-main--column {
    flex-direction: column;
    overflow: visible;
  }
  .page-main--reverse {
    flex-direction: column-reverse;
    overflow: visible;
  }
}
</style>
