<template>
  <AiInstructions />
  <div class="page-wrapper">
    <AppHeader />
    <RuleSeparator direction="horizontal" />
    <div class="page-content-area">
      <main
        id="main-content"
        class="page-main"
        :class="mainClass"
      >
        <RouterView />
      </main>
      <div
        v-if="showPrinny"
        ref="prinnyOverlayRef"
        class="prinny-overlay"
        :class="prinnyAnimClass"
        @click="dismissPrinny"
      >
        <img
          ref="prinnyImgRef"
          src="/assets/images/prinny-twirl.gif"
          alt="Prinny"
          class="prinny-gif"
          :style="{
            left: posX + 'px',
            top: posY + 'px',
            position: 'absolute'
          }"
          decoding="async"
        >
        <div class="prinny-disclaimer">
          <p>Prinny is a trademark of Nippon Ichi Software, Inc.</p>
          <p>I'm just a fan, hence the easter egg. 🐧</p>
        </div>
        <button
          class="prinny-close"
          aria-label="Close"
        >
          x
        </button>
      </div>
    </div>
    <RuleSeparator direction="horizontal" />
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, provide, onUnmounted } from 'vue'
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

const showPrinny = ref(false)
const prinnyOverlayRef = ref<HTMLElement | null>(null)
const prinnyImgRef = ref<HTMLImageElement | null>(null)
const prinnyAnimClass = ref('')
const posX = ref(0)
const posY = ref(0)
const velX = ref(2.5)
const velY = ref(1.8)
let rafId: number | null = null
let prinnyTimeout: ReturnType<typeof setTimeout> | null = null

function dismissPrinny() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  if (prinnyTimeout !== null) {
    clearTimeout(prinnyTimeout)
    prinnyTimeout = null
  }
  prinnyAnimClass.value = 'prinny-overlay--exit'
  setTimeout(() => {
    showPrinny.value = false
  }, 300)
}

function updateBounce() {
  const overlay = prinnyOverlayRef.value
  const img = prinnyImgRef.value
  if (!overlay || !img) {
    rafId = requestAnimationFrame(updateBounce)
    return
  }

  const imgW = img.offsetWidth || 300
  const imgH = img.offsetHeight || 300
  const maxX = Math.max(0, overlay.clientWidth - imgW)
  const maxY = Math.max(0, overlay.clientHeight - imgH)

  let nx = posX.value + velX.value
  let ny = posY.value + velY.value

  if (nx <= 0 || nx >= maxX) velX.value *= -1
  if (ny <= 0 || ny >= maxY) velY.value *= -1

  posX.value = Math.max(0, Math.min(nx, maxX))
  posY.value = Math.max(0, Math.min(ny, maxY))

  rafId = requestAnimationFrame(updateBounce)
}

function triggerPrinny() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  if (prinnyTimeout !== null) {
    clearTimeout(prinnyTimeout)
    prinnyTimeout = null
  }

  showPrinny.value = true

  nextTick(() => {
    const overlay = prinnyOverlayRef.value
    const img = prinnyImgRef.value
    if (!overlay || !img) return

    const imgW = img.offsetWidth || 300
    const imgH = img.offsetHeight || 300
    const maxX = Math.max(0, overlay.clientWidth - imgW)
    const maxY = Math.max(0, overlay.clientHeight - imgH)

    posX.value = Math.random() * maxX
    posY.value = Math.random() * maxY
    velX.value = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 2)
    velY.value = (Math.random() > 0.5 ? 1 : -1) * (1.5 + Math.random() * 1.5)

    prinnyAnimClass.value = 'prinny-overlay--enter'
    rafId = requestAnimationFrame(updateBounce)
  })

  prinnyTimeout = setTimeout(dismissPrinny, 15000)
}

onUnmounted(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
  if (prinnyTimeout !== null) clearTimeout(prinnyTimeout)
})

provide('triggerPrinny', triggerPrinny)
</script>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.page-content-area {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
  min-height: 0;
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
.prinny-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  z-index: 100;
  cursor: pointer;
  overflow: hidden;
}
.prinny-gif {
  max-width: 300px;
  max-height: 300px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}
.prinny-overlay--enter .prinny-gif {
  animation: prinny-overlay-enter 0.4s ease-out forwards;
}
.prinny-overlay--exit .prinny-gif {
  animation: prinny-overlay-exit 0.3s ease-in forwards;
}
@keyframes prinny-overlay-enter {
  0%   { opacity: 0; transform: scale(0.3); }
  70%  { opacity: 1; transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes prinny-overlay-exit {
  0%   { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.3); }
}
.prinny-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #333;
  color: #fff;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  z-index: 1;
}
.prinny-close:focus-visible {
  outline: 2px solid var(--color-selected-outline);
  outline-offset: 2px;
}
.prinny-disclaimer {
  position: absolute;
  bottom: 1.5rem;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 0.72rem;
  color: #888;
  line-height: 1.5;
  pointer-events: none;
  user-select: none;
}
.prinny-disclaimer p {
  margin: 0;
}
</style>
