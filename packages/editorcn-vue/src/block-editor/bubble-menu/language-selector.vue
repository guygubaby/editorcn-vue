<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import { computed, ref } from "vue";

import { useEditorState } from "../../editor/composables";
import {
  CODE_BLOCK_LANGUAGES,
  getLanguageLabel,
} from "../../editor/bubble-menu/utils";
import { useBlockEditorContext } from "../context";
import Dropdown from "./dropdown.vue";

const props = defineProps<{ editor: Editor }>();

const { icons } = useBlockEditorContext();
const open = ref(false);

const state = useEditorState(
  () => props.editor,
  (editor) => ({
    currentLanguage:
      (editor?.getAttributes("codeBlock").language as string) || "javascript",
  })
);

const langIcon = computed(
  () =>
    icons.value.languageIcons[state.value.currentLanguage] ??
    icons.value.codeBlockLanguageIcon
);

const select = (language: string) => {
  props.editor
    .chain()
    .focus()
    .updateAttributes("codeBlock", { language })
    .run();
  open.value = false;
};
</script>

<template>
  <div class="rte-anchored">
    <button
      type="button"
      class="block-editor-bubble-btn"
      @mousedown.prevent
      @click="open = !open"
    >
      <span class="block-editor-bubble-dropdown-icon">
        <component :is="langIcon" />
      </span>
      <span class="block-editor-bubble-btn-text">{{
        getLanguageLabel(state.currentLanguage)
      }}</span>
      <component :is="icons.dropdownArrowIcon" />
    </button>

    <template v-if="open">
      <div
        role="presentation"
        class="block-editor-bubble-overlay"
        @click="open = false"
        @keydown="($event.key === 'Escape') && (open = false)"
      />
      <Dropdown align="language" style="left: auto; right: 0">
        <button
          v-for="language in CODE_BLOCK_LANGUAGES"
          :key="language"
          type="button"
          data-dropdown-item
          :class="[
            'block-editor-bubble-dropdown-item',
            state.currentLanguage === language &&
              'block-editor-bubble-dropdown-item--active',
          ]"
          @mousedown.prevent
          @click="select(language)"
        >
          <span class="block-editor-bubble-dropdown-icon">
            <component
              :is="
                icons.languageIcons[language] ?? icons.codeBlockLanguageIcon
              "
            />
          </span>
          <span>{{ getLanguageLabel(language) }}</span>
        </button>
      </Dropdown>
    </template>
  </div>
</template>
