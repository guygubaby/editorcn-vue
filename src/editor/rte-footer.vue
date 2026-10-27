<script setup lang="ts">
import { computed } from "vue";

import { useEditorVersion } from "./composables";
import { useRichTextEditorContext } from "./context";
import type { WordCountInfo } from "./types";
import { cn } from "./utils";

const props = withDefaults(
  defineProps<{
    class?: string;
    sticky?: boolean;
    stickyOffset?: number | string;
    showWordCount?: boolean;
    wordCountClassName?: string;
    wordCountFormatter?: (info: WordCountInfo) => string;
  }>(),
  { sticky: false, stickyOffset: 0, showWordCount: false }
);

const { editor, variant } = useRichTextEditorContext();
const version = useEditorVersion(editor);

const wordCount = computed<WordCountInfo | null>(() => {
  version.value;
  const current = editor.value;
  if (!current || !props.showWordCount) {
    return null;
  }
  const counter = (
    current.storage as unknown as Record<string, unknown>
  ).characterCount as
    | { words: () => number; characters: () => number }
    | undefined;
  return {
    characters: counter?.characters() ?? 0,
    words: counter?.words() ?? 0,
  };
});

const stickyStyle = computed(() => {
  if (!props.sticky) {
    return undefined;
  }
  return {
    bottom:
      typeof props.stickyOffset === "number"
        ? `${props.stickyOffset}px`
        : props.stickyOffset,
  };
});
</script>

<template>
  <div
    v-if="showWordCount || $slots.default"
    :class="
      cn(
        'rte-footer',
        variant !== 'default' && `rte-footer--${variant}`,
        sticky && 'sticky z-10',
        $props.class
      )
    "
    :data-sticky="sticky ? '' : undefined"
    :style="stickyStyle"
  >
    <span
      v-if="showWordCount && wordCount"
      :class="cn('rte-footer-word-count', wordCountClassName)"
    >
      <template v-if="wordCountFormatter">
        {{ wordCountFormatter(wordCount) }}
      </template>
      <template v-else>
        <span class="rte-footer-word-count-stat">
          <span class="rte-footer-word-count-number">{{
            wordCount.words
          }}</span>
          <span class="rte-footer-word-count-unit">words</span>
        </span>
        <span class="rte-footer-word-count-separator" aria-hidden="true" />
        <span class="rte-footer-word-count-stat">
          <span class="rte-footer-word-count-number">{{
            wordCount.characters
          }}</span>
          <span class="rte-footer-word-count-unit">characters</span>
        </span>
      </template>
    </span>
    <slot />
  </div>
</template>
