<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import { computed, ref } from "vue";

import { useEditorState } from "./composables";
import ColorSwatch from "./bubble-menu-color-swatch.vue";
import RteDropdown from "./bubble-menu-rte-dropdown.vue";

type SwatchType = "text" | "highlight";

interface RecentColor {
  type: SwatchType;
  color: string;
  label: string;
}

const props = defineProps<{ editor: Editor }>();

const RECENT_KEY = "editorcn-vue-editor-recent-colors";
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

const readRecentColors = (): RecentColor[] => {
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

const persistRecentColors = (next: RecentColor[]) => {
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignored */
  }
};

const open = ref(false);
const recent = ref<RecentColor[]>(readRecentColors());

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
  persistRecentColors(next);
};

const selectText = (color: string, label: string) => {
  remember("text", color, label);
  if (state.value.textColor === color) {
    props.editor.chain().focus().unsetColor().run();
  } else {
    props.editor.chain().focus().setColor(color).run();
  }
};

const selectHighlight = (color: string, label: string) => {
  remember("highlight", color, label);
  if (state.value.highlightColor === color) {
    props.editor.chain().focus().unsetHighlight().run();
  } else {
    props.editor.chain().focus().setHighlight({ color }).run();
  }
};
</script>

<template>
  <div v-if="hasColor || hasHighlight" class="rte-anchored">
    <button
      type="button"
      :class="[
        'rte-bubble-btn',
        (state.textColor || state.highlightColor) && 'rte-bubble-btn--active',
      ]"
      aria-label="Text color"
      title="Text color"
      :aria-pressed="Boolean(state.textColor || state.highlightColor)"
      @mousedown.prevent
      @click="open = !open"
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
        class="rte-bubble-overlay"
        @click="open = false"
        @keydown="($event.key === 'Escape') && (open = false)"
      />
      <RteDropdown variant="color">
        <div v-if="recent.length > 0" class="rte-bubble-color-section">
          <span class="rte-bubble-color-label">Recently Used</span>
          <div class="rte-bubble-color-recent">
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
              @select="
                () =>
                  item.type === 'text'
                    ? selectText(item.color, item.label)
                    : selectHighlight(item.color, item.label)
              "
            />
          </div>
        </div>

        <template v-if="hasColor">
          <div v-if="recent.length > 0" class="rte-bubble-dropdown-divider" />
          <div class="rte-bubble-color-section">
            <span class="rte-bubble-color-label">Text Color</span>
            <div class="rte-bubble-color-grid">
              <ColorSwatch
                v-for="item in TEXT_COLORS"
                :key="item.color"
                variant="text"
                :color="item.color"
                :label="item.label"
                :active="state.textColor === item.color"
                @select="() => selectText(item.color, item.label)"
              />
            </div>
          </div>
        </template>

        <template v-if="hasHighlight">
          <div
            v-if="recent.length > 0 || hasColor"
            class="rte-bubble-dropdown-divider"
          />
          <div class="rte-bubble-color-section">
            <span class="rte-bubble-color-label">Highlight Color</span>
            <div class="rte-bubble-color-grid">
              <ColorSwatch
                v-for="item in HIGHLIGHT_COLORS"
                :key="item.color"
                variant="highlight"
                :color="item.color"
                :label="item.label"
                :active="state.highlightColor === item.color"
                @select="() => selectHighlight(item.color, item.label)"
              />
            </div>
          </div>
        </template>
      </RteDropdown>
    </template>
  </div>
</template>
