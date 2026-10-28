<script setup lang="ts">
import { isTextSelection } from "@tiptap/core";
import type { Editor as CoreEditor } from "@tiptap/core";
import type { EditorState } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/vue-3";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/vue-3/menus";

import { useEditorState } from "./composables";
import ColorSelector from "./bubble-menu-color-selector.vue";
import LanguageSelector from "./bubble-menu-language-selector.vue";
import TextButtons from "./bubble-menu-text-buttons.vue";

const props = defineProps<{ editor: Editor | null }>();

const isCodeBlock = useEditorState(
  () => props.editor,
  (editor) => editor?.isActive("codeBlock") ?? false
);

const shouldShow = ({
  editor,
  state,
}: {
  editor: CoreEditor;
  state: EditorState;
}) => {
  const { selection } = state;
  if (!editor.isEditable) {
    return false;
  }
  if (selection.empty && !editor.isActive("codeBlock")) {
    return false;
  }
  if (!selection.empty && !isTextSelection(selection)) {
    return false;
  }
  return true;
};
</script>

<template>
  <!-- The wrapper Tiptap creates is a positioned element with no z-index, so
       it needs one to sit above the sticky toolbar. -->
  <TiptapBubbleMenu
    v-if="editor"
    class="rte-bubble-root"
    :editor="editor"
    :options="{ offset: 8, placement: 'top' }"
    :should-show="shouldShow"
  >
    <div class="rte-bubble-menu">
      <LanguageSelector v-if="isCodeBlock" :editor="editor" />
      <template v-else>
        <TextButtons :editor="editor" />
        <div class="rte-bubble-separator" />
        <ColorSelector :editor="editor" />
      </template>
    </div>
  </TiptapBubbleMenu>
</template>
