<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import { computed, ref } from "vue";

import { useEditorState } from "../../editor/composables";
import { useBlockEditorContext } from "../context";
import { copyBlock, deleteBlock } from "../lib";
import Dropdown from "./dropdown.vue";
import HeadingIcon from "./heading-icon.vue";

const props = defineProps<{ editor: Editor }>();

const { icons } = useBlockEditorContext();
const open = ref(false);

const state = useEditorState(
  () => props.editor,
  (editor) => ({
    isBlockquote: editor?.isActive("blockquote") ?? false,
    isBulletList: editor?.isActive("bulletList") ?? false,
    isCodeBlock: editor?.isActive("codeBlock") ?? false,
    isHeading1: editor?.isActive("heading", { level: 1 }) ?? false,
    isHeading2: editor?.isActive("heading", { level: 2 }) ?? false,
    isHeading3: editor?.isActive("heading", { level: 3 }) ?? false,
    isOrderedList: editor?.isActive("orderedList") ?? false,
    isParagraph: editor?.isActive("paragraph") ?? false,
    isTaskList: editor?.isActive("taskList") ?? false,
  })
);

type NodeItem = {
  name: string;
  icon: unknown;
  level?: number;
  isActive: () => boolean;
  command: () => void;
};

const items = computed<NodeItem[]>(() => [
  {
    name: "Text",
    icon: icons.value.slashTextIcon,
    isActive: () =>
      state.value.isParagraph &&
      !state.value.isBulletList &&
      !state.value.isOrderedList &&
      !state.value.isTaskList &&
      !state.value.isBlockquote &&
      !state.value.isCodeBlock,
    command: () => props.editor.chain().focus().setParagraph().run(),
  },
  {
    name: "Heading 1",
    level: 1,
    icon: null,
    isActive: () => state.value.isHeading1,
    command: () =>
      props.editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    name: "Heading 2",
    level: 2,
    icon: null,
    isActive: () => state.value.isHeading2,
    command: () =>
      props.editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    name: "Heading 3",
    level: 3,
    icon: null,
    isActive: () => state.value.isHeading3,
    command: () =>
      props.editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    name: "Bullet List",
    icon: icons.value.slashBulletListIcon,
    isActive: () => state.value.isBulletList,
    command: () => props.editor.chain().focus().toggleBulletList().run(),
  },
  {
    name: "Numbered List",
    icon: icons.value.slashOrderedListIcon,
    isActive: () => state.value.isOrderedList,
    command: () => props.editor.chain().focus().toggleOrderedList().run(),
  },
  {
    name: "To-do List",
    icon: icons.value.slashTaskListIcon,
    isActive: () => state.value.isTaskList,
    command: () => props.editor.chain().focus().toggleTaskList().run(),
  },
  {
    name: "Quote",
    icon: icons.value.slashBlockquoteIcon,
    isActive: () => state.value.isBlockquote,
    command: () => props.editor.chain().focus().toggleBlockquote().run(),
  },
  {
    name: "Code Block",
    icon: icons.value.slashCodeBlockIcon,
    isActive: () => state.value.isCodeBlock,
    command: () => props.editor.chain().focus().toggleCodeBlock().run(),
  },
]);

const activeItems = computed(() => items.value.filter((item) => item.isActive()));
const activeName = computed(() =>
  activeItems.value.length > 1
    ? "Multiple"
    : (activeItems.value[0]?.name ?? "Text")
);
const activeItem = computed(() =>
  activeItems.value.length === 1 ? activeItems.value[0] : null
);
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="block-editor-bubble-btn"
      @mousedown.prevent
      @click="open = !open"
    >
      <span v-if="activeItem" class="block-editor-bubble-dropdown-icon">
        <HeadingIcon
          v-if="activeItem.level"
          :level="activeItem.level"
        />
        <component :is="activeItem.icon" v-else />
      </span>
      <span class="block-editor-bubble-btn-text">{{ activeName }}</span>
      <component :is="icons.dropdownArrowIcon" />
    </button>

    <template v-if="open">
      <div
        role="presentation"
        class="block-editor-bubble-overlay"
        @click="open = false"
        @keydown="($event.key === 'Escape') && (open = false)"
      />
      <Dropdown>
        <button
          v-for="item in items"
          :key="item.name"
          type="button"
          data-dropdown-item
          :class="[
            'block-editor-bubble-dropdown-item',
            item.isActive() && 'block-editor-bubble-dropdown-item--active',
          ]"
          @mousedown.prevent
          @click="
            () => {
              item.command();
              open = false;
            }
          "
        >
          <span class="block-editor-bubble-dropdown-icon">
            <HeadingIcon v-if="item.level" :level="item.level" />
            <component :is="item.icon" v-else />
          </span>
          <span>{{ item.name }}</span>
        </button>

        <div class="block-editor-bubble-dropdown-divider" />

        <button
          type="button"
          data-dropdown-item
          class="block-editor-bubble-dropdown-item"
          @mousedown.prevent
          @click="
            () => {
              copyBlock(editor);
              open = false;
            }
          "
        >
          <span class="block-editor-bubble-dropdown-icon">
            <component :is="icons.copyIcon" />
          </span>
          <span>Copy</span>
        </button>
        <button
          type="button"
          data-dropdown-item
          class="block-editor-bubble-dropdown-item block-editor-bubble-dropdown-item--danger"
          @mousedown.prevent
          @click="
            () => {
              deleteBlock(editor);
              open = false;
            }
          "
        >
          <span class="block-editor-bubble-dropdown-icon">
            <component :is="icons.deleteIcon" />
          </span>
          <span>Delete</span>
        </button>
      </Dropdown>
    </template>
  </div>
</template>
