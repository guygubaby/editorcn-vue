<script setup lang="ts">
import { computed } from "vue";

import { useEditorVersion } from "./composables";
import { useRichTextEditorContext } from "./context";
import type { WordCountInfo } from "./types";
import { cn } from "./utils";
import { countCharacters, countWords } from "./word-count";

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
  // Counted from the document itself, so no CharacterCount extension is
  // required, and CJK text counts per character rather than per space.
  const { doc } = current.state;
  const text = doc.textBetween(0, doc.content.size, "\n", " ");
  return {
    characters: countCharacters(text),
    words: countWords(text),
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
      cn('rte-footer', variant !== 'default' && `rte-footer--${variant}`, $props.class)
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
