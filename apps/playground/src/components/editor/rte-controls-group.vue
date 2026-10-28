<script setup lang="ts">
import { cn } from "./utils";
</script>

<template>
  <!-- `display: contents` in the stylesheet: the buttons flow as direct items of
       the toolbar so they wrap one at a time, and the divider stays a real
       element that wraps with them. -->
  <div :class="cn('rte-controls-group', $attrs.class)">
    <span aria-hidden="true" class="rte-controls-separator" />
    <slot />
  </div>
</template>
