<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import { computed, ref } from "vue";

import { useEditorState } from "../composables";
import { useRichTextEditorContext } from "../context";
import RteDropdown from "./rte-dropdown.vue";
import { CODE_BLOCK_LANGUAGES, getLanguageLabel } from "./utils";

const props = defineProps<{ editor: Editor }>();

const open = ref(false);
const { icons } = useRichTextEditorContext();

const state = useEditorState(
  () => props.editor,
  (editor) => ({
    currentLanguage:
      (editor?.getAttributes("codeBlock").language as string) || "javascript",
  })
);

const langIcon = computed(
  () => icons.value.languageIcons[state.value.currentLanguage]
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
  <div class="relative">
    <button
      type="button"
      class="rte-bubble-btn"
      @mousedown.prevent
      @click="open = !open"
    >
      <span class="rte-bubble-btn-icon">
        <component v-if="langIcon" :is="langIcon" />
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="rte-editor-icon"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </span>
      <span class="rte-bubble-btn-text">{{
        getLanguageLabel(state.currentLanguage)
      }}</span>
      <span class="rte-bubble-btn-icon" style="height: 12px; width: 12px">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </button>

    <template v-if="open">
      <div
        role="presentation"
        class="rte-bubble-overlay"
        @click="open = false"
        @keydown="($event.key === 'Escape') && (open = false)"
      />
      <RteDropdown variant="language">
        <button
          v-for="language in CODE_BLOCK_LANGUAGES"
          :key="language"
          type="button"
          data-dropdown-item
          :class="[
            'rte-bubble-dropdown-item',
            state.currentLanguage === language &&
              'rte-bubble-dropdown-item--active',
          ]"
          @mousedown.prevent
          @click="select(language)"
        >
          <span class="rte-bubble-dropdown-icon">
            <component
              v-if="icons.languageIcons[language]"
              :is="icons.languageIcons[language]"
            />
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="rte-editor-icon"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </span>
          <span>{{ getLanguageLabel(language) }}</span>
        </button>
      </RteDropdown>
    </template>
  </div>
</template>
