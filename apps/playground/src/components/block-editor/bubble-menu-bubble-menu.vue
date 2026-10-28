<script setup lang="ts">
import { isTextSelection } from "@tiptap/core";
import type { Editor as CoreEditor } from "@tiptap/core";
import type { EditorState } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/vue-3";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/vue-3/menus";
import { ref } from "vue";

import { useEditorState } from "../editor/composables";
import { useBlockEditorContext } from "./context";
import AlignSelector from "./bubble-menu-align-selector.vue";
import ColorSelector from "./bubble-menu-color-selector.vue";
import LanguageSelector from "./bubble-menu-language-selector.vue";
import LinkSelector from "./bubble-menu-link-selector.vue";
import NodeSelector from "./bubble-menu-node-selector.vue";
import TextButtons from "./bubble-menu-text-buttons.vue";

const props = defineProps<{ editor: Editor | null }>();

const { icons } = useBlockEditorContext();
const copied = ref(false);

const isCodeBlock = useEditorState(
  () => props.editor,
  (editor) => editor?.isActive("codeBlock") ?? false
);

const hasTextAlign = () =>
  props.editor?.extensionManager.extensions.some(
    (ext) => ext.name === "textAlign"
  ) ?? false;

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

const copySelection = async () => {
  const editor = props.editor;
  if (!editor) {
    return;
  }
  const { from, to } = editor.state.selection;
  const text = editor.state.doc.textBetween(from, to, "\n");
  try {
    await navigator.clipboard.writeText(text);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    /* ignored */
  }
};
</script>

<template>
  <TiptapBubbleMenu
    v-if="editor"
    class="rte-bubble-root"
    :editor="editor"
    :options="{ offset: 8, placement: 'top' }"
    :should-show="shouldShow"
  >
    <div class="block-editor-bubble-menu">
      <template v-if="isCodeBlock">
        <NodeSelector :editor="editor" />
        <div class="block-editor-bubble-separator" />
        <LanguageSelector :editor="editor" />
        <div class="block-editor-bubble-separator" />
        <button
          type="button"
          class="block-editor-bubble-btn"
          @mousedown.prevent
          @click="copySelection"
        >
          <span
            :class="[
              'block-editor-copy-icon',
              copied && 'block-editor-copy-icon--copied',
            ]"
          >
            <component :is="copied ? icons.checkIcon : icons.copyIcon" />
          </span>
        </button>
      </template>

      <template v-else>
        <NodeSelector :editor="editor" />
        <div class="block-editor-bubble-separator" />
        <TextButtons :editor="editor" />
        <div class="block-editor-bubble-separator" />
        <ColorSelector :editor="editor" />
        <div class="block-editor-bubble-separator" />
        <LinkSelector :editor="editor" />
        <template v-if="hasTextAlign()">
          <div class="block-editor-bubble-separator" />
          <AlignSelector :editor="editor" />
        </template>
      </template>
    </div>
  </TiptapBubbleMenu>
</template>
