<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import { computed, provide } from "vue";

import { toolbarKey } from "./context";
import { DEFAULT_EXTENSION_LABELS } from "./labels";
import type { ExtensionLabels } from "./labels";

const props = withDefaults(
  defineProps<{
    editor?: Editor | null;
    labels?: Partial<ExtensionLabels>;
  }>(),
  { editor: null }
);

provide(toolbarKey, {
  editor: computed(() => props.editor ?? null),
  labels: computed(() => ({ ...DEFAULT_EXTENSION_LABELS, ...props.labels })),
});
</script>

<template>
  <slot />
</template>
