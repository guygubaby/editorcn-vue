<script setup lang="ts">
import { computed, provide, watch } from "vue";

import { DEFAULT_ICONS } from "./icons";
import { DEFAULT_LABELS } from "./labels";
import { richTextEditorKey } from "./context";
import type { RichTextEditorProps } from "./types";

const props = withDefaults(defineProps<RichTextEditorProps>(), {
  editor: null,
  variant: "default",
  editable: true,
});

const editorRef = computed(() => props.editor ?? null);
const labels = computed(() => ({ ...DEFAULT_LABELS, ...props.labels }));
const icons = computed(() => ({ ...DEFAULT_ICONS, ...props.icons }));
const variant = computed(() => props.variant);
const editable = computed(() => props.editable);

watch(
  [() => props.editor, () => props.editable],
  ([editor, canEdit]) => {
    if (editor && !editor.isDestroyed && editor.isEditable !== canEdit) {
      editor.setEditable(canEdit);
    }
  },
  { immediate: true }
);

provide(richTextEditorKey, {
  editor: editorRef,
  labels,
  icons,
  variant,
  editable,
});
</script>

<template>
  <div
    :class="[
      'rte-root',
      variant !== 'default' && `rte-root--${variant}`,
    ]"
    :data-variant="variant"
  >
    <slot />
  </div>
</template>
