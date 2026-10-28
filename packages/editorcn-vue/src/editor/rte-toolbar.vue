<script setup lang="ts">
import { computed } from "vue";

import { useRichTextEditorContext } from "./context";
import { cn } from "./utils";

const props = withDefaults(
  defineProps<{ sticky?: boolean; stickyOffset?: number | string }>(),
  { sticky: false, stickyOffset: 0 }
);

const { variant, editable } = useRichTextEditorContext();

const stickyStyle = computed(() => {
  if (!props.sticky) {
    return undefined;
  }
  return {
    top:
      typeof props.stickyOffset === "number"
        ? `${props.stickyOffset}px`
        : props.stickyOffset,
  };
});
</script>

<template>
  <div
    v-if="editable"
    :class="cn('rte-toolbar', variant !== 'default' && `rte-toolbar--${variant}`)"
    :data-sticky="sticky ? '' : undefined"
    :style="stickyStyle"
  >
    <slot />
  </div>
</template>
