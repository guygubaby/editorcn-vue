<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import { computed, ref } from "vue";

import { useEditorState } from "../../editor/composables";
import { useBlockEditorContext } from "../context";
import Dropdown from "./dropdown.vue";

const props = defineProps<{ editor: Editor }>();

const { icons } = useBlockEditorContext();
const open = ref(false);

const state = useEditorState(
  () => props.editor,
  (editor) => ({
    isAlignCenter: editor?.isActive({ textAlign: "center" }) ?? false,
    isAlignLeft:
      !editor?.isActive({ textAlign: "center" }) &&
      !editor?.isActive({ textAlign: "right" }),
    isAlignRight: editor?.isActive({ textAlign: "right" }) ?? false,
  })
);

const items = computed(() => [
  {
    icon: icons.value.alignLeftIcon,
    isActive: state.value.isAlignLeft,
    label: "Left",
    run: () => props.editor.chain().focus().setTextAlign("left").run(),
  },
  {
    icon: icons.value.alignCenterIcon,
    isActive: state.value.isAlignCenter,
    label: "Center",
    run: () => props.editor.chain().focus().setTextAlign("center").run(),
  },
  {
    icon: icons.value.alignRightIcon,
    isActive: state.value.isAlignRight,
    label: "Right",
    run: () => props.editor.chain().focus().setTextAlign("right").run(),
  },
]);

const activeItem = computed(() => items.value.find((item) => item.isActive));
</script>

<template>
  <div class="rte-anchored">
    <button
      type="button"
      class="block-editor-bubble-btn"
      aria-label="Alignment"
      title="Alignment"
      @mousedown.prevent
      @click="open = !open"
    >
      <span class="block-editor-bubble-dropdown-icon">
        <component
          :is="activeItem ? activeItem.icon : icons.alignLeftIcon"
        />
      </span>
      <component :is="icons.dropdownArrowIcon" />
    </button>

    <template v-if="open">
      <div
        role="presentation"
        class="block-editor-bubble-overlay"
        @click="open = false"
        @keydown="($event.key === 'Escape') && (open = false)"
      />
      <Dropdown align="align" style="left: auto; right: 0">
        <button
          v-for="item in items"
          :key="item.label"
          type="button"
          data-dropdown-item
          :class="[
            'block-editor-bubble-dropdown-item',
            item.isActive && 'block-editor-bubble-dropdown-item--active',
          ]"
          @mousedown.prevent
          @click="
            () => {
              item.run();
              open = false;
            }
          "
        >
          <span class="block-editor-bubble-dropdown-icon">
            <component :is="item.icon" />
          </span>
          <span>{{ item.label }}</span>
        </button>
      </Dropdown>
    </template>
  </div>
</template>
