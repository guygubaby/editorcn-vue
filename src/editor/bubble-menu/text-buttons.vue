<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";

import { useEditorState } from "../composables";

const props = defineProps<{ editor: Editor }>();

const state = useEditorState(
  () => props.editor,
  (ed) => ({
    isBold: ed?.isActive("bold") ?? false,
    isCode: ed?.isActive("code") ?? false,
    isItalic: ed?.isActive("italic") ?? false,
    isStrike: ed?.isActive("strike") ?? false,
    isUnderline: ed?.isActive("underline") ?? false,
  })
);

type TextItem = {
  key: string;
  markup: string;
  isActive: () => boolean;
  run: (editor: Editor) => void;
};

const items: TextItem[] = [
  {
    key: "bold",
    markup:
      '<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />',
    isActive: () => state.value.isBold,
    run: (editor) => {
      editor.chain().focus().toggleBold().run();
    },
  },
  {
    key: "italic",
    markup:
      '<line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" />',
    isActive: () => state.value.isItalic,
    run: (editor) => {
      editor.chain().focus().toggleItalic().run();
    },
  },
  {
    key: "underline",
    markup:
      '<path d="M6 4v6a6 6 0 0 0 12 0V4" /><line x1="4" y1="20" x2="20" y2="20" />',
    isActive: () => state.value.isUnderline,
    run: (editor) => {
      editor.chain().focus().toggleUnderline().run();
    },
  },
  {
    key: "strike",
    markup:
      '<path d="M16 4H9.5a3.5 3.5 0 0 0-2.9 5.4" /><path d="M14.5 14.6a3.5 3.5 0 0 1-2.9 5.4H8" /><line x1="4" y1="12" x2="20" y2="12" />',
    isActive: () => state.value.isStrike,
    run: (editor) => {
      editor.chain().focus().toggleStrike().run();
    },
  },
  {
    key: "code",
    markup:
      '<polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />',
    isActive: () => state.value.isCode,
    run: (editor) => {
      editor.chain().focus().toggleCode().run();
    },
  },
];
</script>

<template>
  <div class="rte-bubble-group">
    <button
      v-for="item in items"
      :key="item.key"
      type="button"
      :class="['rte-bubble-btn', item.isActive() && 'rte-bubble-btn--active']"
      @mousedown.prevent
      @click="item.run(editor)"
    >
      <span class="rte-bubble-btn-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="rte-editor-icon"
          v-html="item.markup"
        />
      </span>
    </button>
  </div>
</template>
