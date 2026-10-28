<script setup lang="ts">
import { useEditor } from "@tiptap/vue-3";
import type { ShallowRef } from "vue";
import type { Editor } from "@tiptap/vue-3";

import { RichTextEditor, type RichTextEditorVariant } from "../../../../src/editor";
import { baseExtensions, placeholder } from "./base";

// Each editor stays a top-level ref; the table holds the refs themselves and
// the template unwraps `.value` explicitly.
const defaultEditor = useEditor({
  content: "<p>The <code>default</code> variant. Edit me.</p>",
  extensions: [...baseExtensions, placeholder("Type…")],
});
const subtleEditor = useEditor({
  content: "<p>The <code>subtle</code> variant. Edit me.</p>",
  extensions: [...baseExtensions, placeholder("Type…")],
});
const compactEditor = useEditor({
  content: "<p>The <code>compact</code> variant. Edit me.</p>",
  extensions: [...baseExtensions, placeholder("Type…")],
});

const rows: {
  name: RichTextEditorVariant;
  editor: ShallowRef<Editor | undefined>;
}[] = [
  { name: "default", editor: defaultEditor },
  { name: "subtle", editor: subtleEditor },
  { name: "compact", editor: compactEditor },
];
</script>

<template>
  <div class="docs-demo">
    <div v-for="row in rows" :key="row.name" style="margin-bottom: 1rem">
      <p style="font-size: 0.75rem; margin-bottom: 0.375rem">
        Variant="{{ row.name }}"
      </p>
      <RichTextEditor :editor="row.editor.value ?? null" :variant="row.name">
        <RichTextEditor.Toolbar>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Code />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.BulletList />
            <RichTextEditor.Link />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>
        <RichTextEditor.Content />
      </RichTextEditor>
    </div>
  </div>
</template>
