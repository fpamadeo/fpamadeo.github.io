<template>
  <AiInstructions />
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import AiInstructions from '@/components/AiInstructions.vue'
</script>
