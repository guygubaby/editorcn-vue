<script setup lang="ts">
import type { Extensions, JSONContent } from "@tiptap/core";
import type { Mark, Node } from "@tiptap/pm/model";
import { renderToHTMLString } from "@tiptap/static-renderer/pm/html-string";
import type { TiptapStaticRendererOptions } from "@tiptap/static-renderer";
import type { StaticEditorOptions } from "@tiptap/static-renderer/pm/html-string";
import { computed } from "vue";
import type { Component } from "vue";

const props = withDefaults(
  defineProps<{
    // HTML from editor.getHTML(), or a ProseMirror JSON document.
    content: string | JSONContent | Node;
    // Root element, defaults to "div".
    as?: string | Component;
    // Extensions used to render JSON content; every node/mark must be registered.
    extensions?: Extensions;
    // Editor-level options applied while rendering JSON.
    staticEditorOptions?: StaticEditorOptions;
    // Node/mark mapping for custom output; values are HTML strings.
    options?: Partial<TiptapStaticRendererOptions<string, Mark, Node>>;
  }>(),
  { as: "div" }
);

const resolveUniqueExtensions = (extensions: Extensions) => {
  const byName = new Map<string, Extensions[number]>();
  for (const extension of extensions) {
    byName.set(extension.name, extension);
  }
  return [...byName.values()];
};

const html = computed(() => {
  if (typeof props.content === "string") {
    return props.content;
  }
  return renderToHTMLString({
    content: props.content,
    extensions: resolveUniqueExtensions(props.extensions ?? []),
    options: props.options,
    staticEditorOptions: props.staticEditorOptions,
  });
});
</script>

<template>
  <component :is="props.as" class="rte-static-renderer" v-html="html" />
</template>
