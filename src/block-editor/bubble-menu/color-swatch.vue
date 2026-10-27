<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    color: string;
    label: string;
    variant: "text" | "highlight";
    active?: boolean;
  }>(),
  { active: false }
);

const emit = defineEmits<{ select: [color: string] }>();

const checkColor = computed(() => {
  const value = props.color.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16) / 255;
  const g = Number.parseInt(value.slice(2, 4), 16) / 255;
  const b = Number.parseInt(value.slice(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.5 ? "#18181b" : "#ffffff";
});
</script>

<template>
  <button
    type="button"
    :aria-pressed="active"
    :aria-label="label"
    :title="label"
    :class="[
      'block-editor-color-swatch',
      variant === 'text'
        ? 'block-editor-color-swatch--text'
        : 'block-editor-color-swatch--highlight',
      active && 'block-editor-color-swatch--active',
    ]"
    :style="{ '--swatch-check': checkColor, '--swatch-color': color }"
    @mousedown.prevent
    @click="emit('select', color)"
  >
    <span
      v-if="variant === 'text' && !active"
      class="block-editor-color-glyph"
      aria-hidden="true"
      >A</span
    >
    <span v-if="active" class="block-editor-color-check" aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  </button>
</template>
