<script setup lang="ts">
import Highlight from "@tiptap/extension-highlight";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { useEditor } from "@tiptap/vue-3";
import { ref } from "vue";

import { RichTextEditor, CodeBlock, Link } from "../../../../src/editor";
import {
  Table,
  TableHoverOverlay,
  TableToolbar,
} from "../../../../src/extensions";
import { placeholder } from "./base";

const content = `
<p>Insert a table from the toolbar, then hover a row or column to reveal its grip. The handles at the bottom-right add rows and columns.</p>
<table>
  <tbody>
    <tr><th>Block</th><th>Status</th><th>Notes</th></tr>
    <tr><td>Table</td><td>Ported</td><td>Hover grips, add handles</td></tr>
    <tr><td>Image</td><td>Ported</td><td>Resize, align, duplicate</td></tr>
    <tr><td>Video</td><td>Ported</td><td>object-fit, poster, autoplay</td></tr>
  </tbody>
</table>
<p></p>
`;

const editor = useEditor({
  content,
  extensions: [
    // Table registers its own gapcursor.
    StarterKit.configure({ codeBlock: false, gapcursor: false, link: false }),
    Link,
    CodeBlock,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Highlight.configure({ multicolor: true }),
    TextStyle,
    Color,
    placeholder("Type…"),
    Table,
  ],
});

const showOverlay = ref(true);
</script>

<template>
  <div class="docs-demo">
    <div class="docs-demo-bar">
      <button
        type="button"
        :aria-pressed="showOverlay"
        @click="showOverlay = !showOverlay"
      >
        {{ showOverlay ? "hide hover overlay" : "show hover overlay" }}
      </button>
      <span>Toggle it to see what the overlay draws.</span>
    </div>

    <RichTextEditor :editor="editor">
      <RichTextEditor.Toolbar>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Code />
        </RichTextEditor.ControlsGroup>
        <RichTextEditor.ControlsGroup>
          <TableToolbar :editor="editor ?? null" />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>

      <RichTextEditor.Content>
        <TableHoverOverlay v-if="showOverlay" :editor="editor ?? null" />
        <RichTextEditor.BubbleMenu :editor="editor ?? null" />
      </RichTextEditor.Content>
    </RichTextEditor>
  </div>
</template>
