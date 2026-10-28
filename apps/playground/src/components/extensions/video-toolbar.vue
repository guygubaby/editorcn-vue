<script setup lang="ts">
import { Video } from "@lucide/vue";
import type { Editor } from "@tiptap/vue-3";

import { useEditorState } from "../editor/composables";
import { useToolbar, useToolbarEditor } from "./core-context";

const props = defineProps<{ class?: string; editor?: Editor | null }>();

const { labels } = useToolbar();
const editor = useToolbarEditor(() => props.editor);

const disabled = useEditorState(editor, (edit) =>
  edit
    ? Boolean(
        edit.isDestroyed ||
          !edit.isEditable ||
          !edit.extensionManager.extensions.some(
            (extension) => extension.name === "videoPlaceholder"
          )
      )
    : true
);

const insert = () => {
  const current = editor.value;
  if (!current || current.isDestroyed || disabled.value) {
    return;
  }
  current.chain().focus().insertVideoPlaceholder().run();
};
</script>

<template>
  <button
    type="button"
    :aria-label="labels.video"
    :class="['ext-btn', 'ext-btn--icon-sm', props.class]"
    :disabled="disabled"
    :title="labels.video"
    @click="insert"
  >
    <Video />
  </button>
</template>
