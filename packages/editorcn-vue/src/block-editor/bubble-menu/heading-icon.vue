<script setup lang="ts">
import { Heading, Heading1, Heading2, Heading3 } from "@lucide/vue";
import { computed } from "vue";

const props = defineProps<{ level: number }>();

const icon = computed(
  () =>
    ({ 1: Heading1, 2: Heading2, 3: Heading3 })[props.level as 1 | 2 | 3] ??
    Heading
);
</script>

<template>
  <component :is="icon" />
</template>
