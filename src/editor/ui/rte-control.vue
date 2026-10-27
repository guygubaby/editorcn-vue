<script setup lang="ts">
import { cn } from "../utils";
import { toggleVariants } from "./toggle";

defineOptions({ inheritAttrs: false });

withDefaults(defineProps<{ active?: boolean; disabled?: boolean }>(), {
  active: false,
  disabled: false,
});
</script>

<template>
  <button
    v-bind="$attrs"
    type="button"
    data-slot="toggle"
    :data-state="active ? 'on' : 'off'"
    :aria-pressed="active"
    :disabled="disabled"
    :class="cn(toggleVariants({ size: 'sm' }), 'rte-control-button')"
    @mousedown.prevent
  >
    <slot />
  </button>
</template>
