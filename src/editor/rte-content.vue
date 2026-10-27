<script setup lang="ts">
import { EditorContent } from "@tiptap/vue-3";

import { useRichTextEditorContext } from "./context";
import { cn } from "./utils";

defineProps<{ class?: string }>();

const { editor } = useRichTextEditorContext();
</script>

<template>
  <div class="relative">
    <EditorContent
      :editor="editor ?? undefined"
      :class="cn('rte-content w-full', $props.class)"
    />
    <slot />
  </div>
</template>
