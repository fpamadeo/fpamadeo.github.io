<template>
  <!--
    Mimics LaTeX \hrulefill / \vrulefill:
    - Stretches to fill available space
    - The visible line starts/ends 4vmin from each edge via a CSS gradient
    - No hard border props needed; this is purely cosmetic
  -->
  <div
    :class="['rule-separator', `rule-separator--${direction}`]"
    aria-hidden="true"
    role="separator"
  />
</template>

<script setup>
defineProps({
  /**
   * 'horizontal' → mimics \hrulefill (thin line across width)
   * 'vertical'   → mimics \vrulefill (thin line down height)
   */
  direction: {
    type: String,
    default: 'horizontal',
    validator: (v) => ['horizontal', 'vertical'].includes(v),
  },
})
</script>

<style scoped>
/* ── Horizontal rule (\hrulefill) ─────────────────────────────────
   Sits in a column flex; stretches full width.
   The gradient fades out 4vmin from left and right edges,
   so the visible line never touches the sides of the screen.       */
.rule-separator--horizontal {
  height: 1px;
  width: 100%;
  flex-shrink: 0;
  background: linear-gradient(
    to right,
    transparent        0%,
    transparent        4vmin,
    var(--color-rule)  4vmin,
    var(--color-rule)  calc(100% - 4vmin),
    transparent        calc(100% - 4vmin),
    transparent        100%
  );
}

/* ── Vertical rule (\vrulefill) ───────────────────────────────────
   Sits in a row flex; stretches full height (align-self: stretch).
   The gradient fades out 4vmin from top and bottom,
   so the visible line never touches the top/bottom of the section.  */
.rule-separator--vertical {
  width: 1px;
  align-self: stretch;
  flex-shrink: 0;
  background: linear-gradient(
    to bottom,
    transparent        0%,
    transparent        4vmin,
    var(--color-rule)  4vmin,
    var(--color-rule)  calc(100% - 4vmin),
    transparent        calc(100% - 4vmin),
    transparent        100%
  );
}
</style>
