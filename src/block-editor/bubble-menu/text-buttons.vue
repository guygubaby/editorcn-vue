<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";

import { useEditorState } from "../../editor/composables";
import { useBlockEditorContext } from "../context";

const props = defineProps<{ editor: Editor }>();

const { icons } = useBlockEditorContext();

const state = useEditorState(
  () => props.editor,
  (editor) => ({
    isBold: editor?.isActive("bold") ?? false,
    isCode: editor?.isActive("code") ?? false,
    isItalic: editor?.isActive("italic") ?? false,
    isStrike: editor?.isActive("strike") ?? false,
    isUnderline: editor?.isActive("underline") ?? false,
  })
);

const items = [
  {
    key: "bold",
    icon: () => icons.value.boldIcon,
    isActive: () => state.value.isBold,
    run: () => props.editor.chain().focus().toggleBold().run(),
  },
  {
    key: "italic",
    icon: () => icons.value.italicIcon,
    isActive: () => state.value.isItalic,
    run: () => props.editor.chain().focus().toggleItalic().run(),
  },
  {
    key: "underline",
    icon: () => icons.value.underlineIcon,
    isActive: () => state.value.isUnderline,
    run: () => props.editor.chain().focus().toggleUnderline().run(),
  },
  {
    key: "strike",
    icon: () => icons.value.strikethroughIcon,
    isActive: () => state.value.isStrike,
    run: () => props.editor.chain().focus().toggleStrike().run(),
  },
  {
    key: "code",
    icon: () => icons.value.codeIcon,
    isActive: () => state.value.isCode,
    run: () => props.editor.chain().focus().toggleCode().run(),
  },
];
</script>

<template>
  <div class="block-editor-bubble-group">
    <button
      v-for="item in items"
      :key="item.key"
      type="button"
      :class="[
        'block-editor-bubble-btn',
        item.isActive() && 'block-editor-bubble-btn--active',
      ]"
      @mousedown.prevent
      @click="item.run()"
    >
      <component :is="item.icon()" />
    </button>
  </div>
</template>
