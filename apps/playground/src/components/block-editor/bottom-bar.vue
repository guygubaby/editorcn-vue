<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import { Plus } from "@lucide/vue";
import { onBeforeUnmount, onMounted, ref } from "vue";

import AlignSelector from "./bubble-menu-align-selector.vue";
import ColorSelector from "./bubble-menu-color-selector.vue";
import LinkSelector from "./bubble-menu-link-selector.vue";
import NodeSelector from "./bubble-menu-node-selector.vue";
import TextButtons from "./bubble-menu-text-buttons.vue";

const props = defineProps<{ editor: Editor }>();

const barRef = ref<HTMLElement | null>(null);

const updateInset = () => {
  const viewport = window.visualViewport;
  const bar = barRef.value;
  if (!viewport || !bar) {
    return;
  }
  const inset = window.innerHeight - viewport.height - viewport.offsetTop;
  bar.style.setProperty(
    "--block-editor-keyboard-inset",
    `${Math.max(0, inset)}px`
  );
};

onMounted(() => {
  updateInset();
  window.visualViewport?.addEventListener("resize", updateInset);
  window.visualViewport?.addEventListener("scroll", updateInset);
});

onBeforeUnmount(() => {
  window.visualViewport?.removeEventListener("resize", updateInset);
  window.visualViewport?.removeEventListener("scroll", updateInset);
});

const handleAdd = () => {
  const editor = props.editor;
  const { $from } = editor.state.selection;
  const chain = editor.chain().focus();
  if ($from.depth > 0 && $from.parent.textContent) {
    const pos = $from.after();
    chain.insertContentAt(pos, { type: "paragraph" }).setTextSelection(pos + 1);
  }
  chain.insertContent("/").run();
};

const hasTextAlign = () =>
  props.editor.extensionManager.extensions.some(
    (ext) => ext.name === "textAlign"
  );
</script>

<template>
  <div ref="barRef" class="block-editor-bottom-bar">
    <div class="block-editor-bottom-bar-scroll">
      <button
        type="button"
        class="block-editor-bubble-btn"
        aria-label="Add block"
        @mousedown.prevent
        @click="handleAdd"
      >
        <Plus />
      </button>
      <NodeSelector :editor="editor" />
      <div class="block-editor-bubble-separator" />
      <TextButtons :editor="editor" />
      <div class="block-editor-bubble-separator" />
      <ColorSelector :editor="editor" />
      <LinkSelector :editor="editor" />
      <template v-if="hasTextAlign()">
        <div class="block-editor-bubble-separator" />
        <AlignSelector :editor="editor" />
      </template>
    </div>
  </div>
</template>
