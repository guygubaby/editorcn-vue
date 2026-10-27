<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import { computed, ref } from "vue";

import { useEditorState } from "../../editor/composables";
import { chainFocus } from "../lib";
import ColorSwatch from "./color-swatch.vue";
import Dropdown from "./dropdown.vue";

type SwatchType = "text" | "highlight";

interface RecentColor {
  type: SwatchType;
  color: string;
  label: string;
}

const props = defineProps<{ editor: Editor }>();

const RECENT_KEY = "editorcn-block-editor-recent-colors";
const RECENT_LIMIT = 10;

const TEXT_COLORS = [
  { color: "#0f172a", label: "Foreground" },
  { color: "#ef4444", label: "Red" },
  { color: "#f97316", label: "Orange" },
  { color: "#f59e0b", label: "Amber" },
  { color: "#22c55e", label: "Green" },
  { color: "#0ea5e9", label: "Sky" },
  { color: "#3b82f6", label: "Blue" },
  { color: "#6366f1", label: "Indigo" },
  { color: "#a855f7", label: "Purple" },
  { color: "#ec4899", label: "Pink" },
];

const HIGHLIGHT_COLORS = [
  { color: "#fef08a", label: "Yellow" },
  { color: "#fed7aa", label: "Orange" },
  { color: "#fecaca", label: "Red" },
  { color: "#fbcfe8", label: "Pink" },
  { color: "#e9d5ff", label: "Purple" },
  { color: "#ddd6fe", label: "Violet" },
  { color: "#bfdbfe", label: "Blue" },
  { color: "#a5f3fc", label: "Cyan" },
  { color: "#99f6e4", label: "Teal" },
  { color: "#bbf7d0", label: "Green" },
];

const readRecent = (): RecentColor[] => {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as RecentColor[];
    return Array.isArray(parsed) ? parsed.slice(0, RECENT_LIMIT) : [];
  } catch {
    return [];
  }
};

const open = ref(false);
const recent = ref<RecentColor[]>(readRecent());

const state = useEditorState(
  () => props.editor,
  (editor) => ({
    highlightColor: editor?.isActive("highlight")
      ? (editor.getAttributes("highlight").color as string | undefined)
      : undefined,
    textColor: editor?.isActive("textStyle")
      ? (editor.getAttributes("textStyle").color as string | undefined)
      : undefined,
  })
);

const hasColor = computed(() =>
  props.editor.extensionManager.extensions.some((ext) => ext.name === "color")
);
const hasHighlight = computed(() =>
  props.editor.extensionManager.extensions.some(
    (ext) => ext.name === "highlight"
  )
);

const remember = (type: SwatchType, color: string, label: string) => {
  const next = [
    { color, label, type },
    ...recent.value.filter(
      (item) => !(item.type === type && item.color === color)
    ),
  ].slice(0, RECENT_LIMIT);
  recent.value = next;
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignored */
  }
};

const selectColor = (type: SwatchType, color: string, label: string) => {
  remember(type, color, label);
  const editor = props.editor;

  if (type === "text") {
    if (state.value.textColor === color) {
      chainFocus(editor).unsetColor().run();
    } else {
      chainFocus(editor).setColor(color).run();
    }
    return;
  }

  if (state.value.highlightColor === color) {
    chainFocus(editor).unsetHighlight().run();
  } else {
    chainFocus(editor).setHighlight({ color }).run();
  }
};
</script>

<template>
  <div v-if="hasColor || hasHighlight" class="relative">
    <button
      type="button"
      :class="[
        'block-editor-bubble-btn',
        (state.textColor || state.highlightColor) &&
          'block-editor-bubble-btn--active',
      ]"
      title="Text color"
      @mousedown.prevent
      @click="open = !open"
    >
      <span class="block-editor-color-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M4 20h16" />
          <path d="m6 16 6-12 6 12" />
          <path d="M8 12h8" />
        </svg>
      </span>
    </button>

    <template v-if="open">
      <div
        role="presentation"
        class="block-editor-bubble-overlay"
        @click="open = false"
        @keydown="($event.key === 'Escape') && (open = false)"
      />
      <Dropdown class="block-editor-bubble-dropdown--color">
        <div v-if="recent.length > 0" class="block-editor-color-section">
          <span class="block-editor-color-label">Recently Used</span>
          <div class="block-editor-color-recent">
            <ColorSwatch
              v-for="item in recent"
              :key="`${item.type}-${item.color}`"
              :variant="item.type"
              :color="item.color"
              :label="item.label"
              :active="
                item.type === 'text'
                  ? state.textColor === item.color
                  : state.highlightColor === item.color
              "
              @select="() => selectColor(item.type, item.color, item.label)"
            />
          </div>
        </div>

        <template v-if="hasColor">
          <div v-if="recent.length > 0" class="block-editor-bubble-dropdown-divider" />
          <div class="block-editor-color-section">
            <span class="block-editor-color-label">Text Color</span>
            <div class="block-editor-color-grid">
              <ColorSwatch
                v-for="item in TEXT_COLORS"
                :key="item.color"
                variant="text"
                :color="item.color"
                :label="item.label"
                :active="state.textColor === item.color"
                @select="() => selectColor('text', item.color, item.label)"
              />
            </div>
          </div>
        </template>

        <template v-if="hasHighlight">
          <div
            v-if="recent.length > 0 || hasColor"
            class="block-editor-bubble-dropdown-divider"
          />
          <div class="block-editor-color-section">
            <span class="block-editor-color-label">Highlight Color</span>
            <div class="block-editor-color-grid">
              <ColorSwatch
                v-for="item in HIGHLIGHT_COLORS"
                :key="item.color"
                variant="highlight"
                :color="item.color"
                :label="item.label"
                :active="state.highlightColor === item.color"
                @select="() => selectColor('highlight', item.color, item.label)"
              />
            </div>
          </div>
        </template>
      </Dropdown>
    </template>
  </div>
</template>
