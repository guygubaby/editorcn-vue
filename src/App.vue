<script setup lang="ts">
import CharacterCount from "@tiptap/extension-character-count";
import Highlight from "@tiptap/extension-highlight";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import { useEditor } from "@tiptap/vue-3";
import { ref } from "vue";

import {
  BlockEditor,
  CodeBlock,
  Link,
  SlashCommand,
  getSlashCommandSuggestion,
} from "./block-editor";
import { RichTextEditor } from "./editor";
import type { RichTextEditorVariant } from "./editor";

const toolbarContent = `
<h2>Welcome to editorcn-vue</h2>
<p><code>RichTextEditor</code> is a Vue 3 port of <a href="https://github.com/shadcn-labs/editorcn">editorcn</a>, built on <a href="https://tiptap.dev/">Tiptap</a> and styled with shadcn/ui tokens.</p>
<ul>
  <li>Text formatting: <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strikethrough</s></li>
  <li>Headings (h1–h6)</li>
  <li>Ordered, bullet and blockquote blocks</li>
  <li>Text alignment, links, highlights</li>
</ul>
<p>Select some text to try the bubble menu, or open a code block for the language picker.</p>
<pre><code class="language-typescript">const greet = (name: string) => \`Hello, \${name}!\`;</code></pre>
`;

const blockContent = `
<p>Type <code>/</code> on an empty line to open the slash menu. Hover a block to grab its drag handle.</p>
<h2>A block editor</h2>
<p>Everything is a block: headings, lists, quotes, code and dividers. Select text for the bubble menu.</p>
<ul>
  <li>Try the node selector on the left of the bubble menu</li>
  <li>Copy or delete a whole block from the same menu</li>
  <li>The bottom bar stays above the mobile keyboard</li>
</ul>
`;

const mode = ref<"toolbar" | "block">("toolbar");
const isDark = ref(true);
const editable = ref(true);
const variant = ref<RichTextEditorVariant>("default");

const baseExtensions = [
  StarterKit.configure({ codeBlock: false, link: false }),
  Link,
  CodeBlock,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Highlight.configure({ multicolor: true }),
  TextStyle,
  Color,
  Subscript,
  Superscript,
];

const editor = useEditor({
  content: toolbarContent,
  extensions: [
    ...baseExtensions,
    Placeholder.configure({ placeholder: "Start typing..." }),
    CharacterCount,
  ],
});

const blockEditor = useEditor({
  content: blockContent,
  extensions: [
    ...baseExtensions,
    Placeholder.configure({ placeholder: "Type '/' for commands..." }),
    TaskList,
    TaskItem.configure({ nested: true }),
    SlashCommand.configure({ suggestion: getSlashCommandSuggestion() }),
  ],
});

const toggleTheme = () => {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle("dark", isDark.value);
};

const variants: RichTextEditorVariant[] = ["default", "subtle", "compact"];
</script>

<template>
  <main class="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-6 md:py-12">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-xl font-semibold tracking-tight">editorcn-vue</h1>
        <p class="text-sm text-muted-foreground">
          Rich text editor components for Vue 3, built on Tiptap.
        </p>
      </div>

      <div class="flex items-center gap-2 text-xs">
        <div class="flex rounded-md border border-border p-0.5">
          <button
            v-for="option in (['toolbar', 'block'] as const)"
            :key="option"
            type="button"
            class="rounded px-2 py-1 capitalize transition-colors"
            :class="
              mode === option
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            "
            @click="mode = option"
          >
            {{ option }}
          </button>
        </div>
        <div v-if="mode === 'toolbar'" class="flex rounded-md border border-border p-0.5">
          <button
            v-for="option in variants"
            :key="option"
            type="button"
            class="rounded px-2 py-1 capitalize transition-colors"
            :class="
              variant === option
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            "
            @click="variant = option"
          >
            {{ option }}
          </button>
        </div>
        <button
          type="button"
          class="rounded-md border border-border px-2 py-1 transition-colors hover:bg-muted"
          @click="editable = !editable"
        >
          {{ editable ? "editable" : "read only" }}
        </button>
        <button
          type="button"
          class="rounded-md border border-border px-2 py-1 transition-colors hover:bg-muted"
          @click="toggleTheme"
        >
          {{ isDark ? "light" : "dark" }}
        </button>
      </div>
    </header>

    <RichTextEditor
      v-if="mode === 'toolbar'"
      :editor="editor"
      :editable="editable"
      :variant="variant"
    >
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
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.BulletList />
          <RichTextEditor.OrderedList />
          <RichTextEditor.Blockquote />
          <RichTextEditor.Hr />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.AlignLeft />
          <RichTextEditor.AlignCenter />
          <RichTextEditor.AlignRight />
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

    <BlockEditor v-else :editor="blockEditor" />
  </main>
</template>
