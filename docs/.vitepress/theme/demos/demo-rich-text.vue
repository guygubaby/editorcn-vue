<script setup lang="ts">
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { useEditor } from "@tiptap/vue-3";
import { ref } from "vue";

import { RichTextEditor, type RichTextEditorVariant } from "../../../../src/editor";
import { baseExtensions, placeholder } from "./base";

const variants: RichTextEditorVariant[] = ["default", "subtle", "compact"];
const variant = ref<RichTextEditorVariant>("default");
const editable = ref(true);

const content = `
<h2>RichTextEditor</h2>
<p>Every control below is a Tiptap command wrapped in a shadcn button. Select some text to open the bubble menu, or put the cursor in the code block for the language picker.</p>
<ul>
  <li>Inline marks: <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strike</s>, <code>code</code></li>
  <li>Headings, alignment, lists, quotes</li>
  <li>Links with a keyboard-accessible popover</li>
</ul>
<pre><code class="language-typescript">const greet = (name: string) => \`Hello, \${name}!\`;</code></pre>
`;

const editor = useEditor({
  content,
  extensions: [
    ...baseExtensions,
    TaskList,
    TaskItem.configure({ nested: true }),
    placeholder("Start typing…"),
  ],
});
</script>

<template>
  <div class="docs-demo">
    <div class="docs-demo-bar">
      <span>Variant</span>
      <button
        v-for="option in variants"
        :key="option"
        type="button"
        :aria-pressed="variant === option"
        @click="variant = option"
      >
        {{ option }}
      </button>
      <span style="margin-left: auto" />
      <button
        type="button"
        :aria-pressed="!editable"
        @click="editable = !editable"
      >
        {{ editable ? "read only" : "editable" }}
      </button>
    </div>

    <RichTextEditor :editor="editor" :variant="variant" :editable="editable">
      <RichTextEditor.Toolbar sticky>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
          <RichTextEditor.Strikethrough />
          <RichTextEditor.Code />
          <RichTextEditor.ClearFormatting />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.H1 />
          <RichTextEditor.H2 />
          <RichTextEditor.H3 />
          <RichTextEditor.Blockquote />
          <RichTextEditor.Hr />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.BulletList />
          <RichTextEditor.OrderedList />
          <RichTextEditor.TaskList />
          <RichTextEditor.CodeBlock />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.AlignLeft />
          <RichTextEditor.AlignCenter />
          <RichTextEditor.AlignRight />
          <RichTextEditor.AlignJustify />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Highlight />
          <RichTextEditor.Subscript />
          <RichTextEditor.Superscript />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Link />
          <RichTextEditor.Unlink />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Undo />
          <RichTextEditor.Redo />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>

      <RichTextEditor.Content>
        <RichTextEditor.BubbleMenu :editor="editor ?? null" />
      </RichTextEditor.Content>

      <RichTextEditor.Footer show-word-count />
    </RichTextEditor>
  </div>
</template>
