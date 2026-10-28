<script setup lang="ts">
import type { Node } from "@tiptap/pm/model";
import { EditorContent } from "@tiptap/vue-3";
import { DragHandle } from "@tiptap/extension-drag-handle-vue-3";
import { Plus } from "@lucide/vue";
import { computed, provide, shallowRef } from "vue";

import { cn } from "../editor/utils";
import { useEditorState } from "../editor/composables";
import BottomBar from "./bottom-bar.vue";
import BubbleMenu from "./bubble-menu-bubble-menu.vue";
import { blockEditorKey } from "./context";
import { DEFAULT_ICONS } from "./icons";
import { DEFAULT_BLOCK_EDITOR_LABELS } from "./labels";
import type { BlockEditorProps } from "./types";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<BlockEditorProps>(), { editor: null });

const editorRef = computed(() => props.editor ?? null);
const labels = computed(() => ({
  ...DEFAULT_BLOCK_EDITOR_LABELS,
  ...props.labels,
}));
const icons = computed(() => ({ ...DEFAULT_ICONS, ...props.icons }));

provide(blockEditorKey, { editor: editorRef, icons, labels });

const isEditable = useEditorState(
  editorRef,
  (editor) => editor?.isEditable ?? false
);

const computePositionConfig = {
  placement: "left-start",
  strategy: "absolute",
} as const;

const hoveredNodeRef = shallowRef<{ node: Node; pos: number } | null>(null);

const handleNodeChange = ({
  node,
  pos,
}: {
  node: Node | null;
  pos: number;
}) => {
  hoveredNodeRef.value = node ? { node, pos } : null;
};

const handleAdd = () => {
  const editor = editorRef.value;
  const dragNode = hoveredNodeRef.value;
  if (!dragNode || !editor || editor.isDestroyed) {
    return;
  }
  const { node, pos } = dragNode;
  if (node.type.spec.code || node.isLeaf) {
    return;
  }
  // The hovered position can be stale if the doc changed under it; only use it
  // when the node there is still the hovered one.
  const current = editor.state.doc.nodeAt(pos);
  if (!current || current.type !== node.type) {
    return;
  }
  editor.chain().focus(pos + 1).insertContent("/").run();
};
</script>

<template>
  <div :class="cn('rte', 'block-editor', $attrs.class)">
    <slot>
      <DragHandle
        v-if="editor && isEditable"
        :editor="editor"
        :compute-position-config="computePositionConfig"
        :on-node-change="handleNodeChange"
      >
        <button
          type="button"
          aria-label="Add block"
          class="block-editor-add-block"
          @click="handleAdd"
          @dragstart.prevent
        >
          <Plus />
        </button>
        <component
          :is="icons.dragHandleIcon"
          class="block-editor-drag-handle-icon"
        />
      </DragHandle>

      <BubbleMenu v-if="editor && isEditable" :editor="editor" />

      <EditorContent
        :editor="editor ?? undefined"
        class="block-editor-content"
      />

      <BottomBar v-if="editor && isEditable" :editor="editor" />
    </slot>
  </div>
</template>
