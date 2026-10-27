<script setup lang="ts">
import { cn } from "./utils";
</script>

<template>
  <div :class="cn('rte-controls-group', $attrs.class)">
    <slot />
  </div>
</template>
