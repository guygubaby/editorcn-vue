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
import {
  ImagePlaceholder,
  ImagePlaceholderToolbar,
  ResizableImage,
  Table,
  TableHoverOverlay,
  TableToolbar,
  Video,
  VideoPlaceholder,
  VideoToolbar,
} from "./extensions";
import type { UploadHandler } from "./extensions";
import { StaticRenderer } from "./static-renderer";
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

const extensionContent = `
<h2>Tables and images</h2>
<p>Insert a table from the toolbar, then hover a row or column to reveal its grip. The image block accepts a URL or a local file.</p>
<table>
  <tbody>
    <tr><th>Block</th><th>Status</th><th>Notes</th></tr>
    <tr><td>Table</td><td>Ported</td><td>Hover grips, add handles</td></tr>
    <tr><td>Image</td><td>Ported</td><td>Resize, align, duplicate</td></tr>
  </tbody>
</table>
<p></p>
<div data-type="imagePlaceholder"></div>
<p></p>
<div data-type="videoPlaceholder"></div>
<p></p>
`;

// Demo uploader: swap this for your OSS/COS presigned PUT or API call.
const fakeUpload: UploadHandler = async (file, kind) => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return {
    src: URL.createObjectURL(file),
    width: kind === "video" ? "100%" : "60%",
  };
};

const staticJson = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Static rendering" }],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "The same document rendered from " },
        { type: "text", marks: [{ type: "bold" }], text: "ProseMirror JSON" },
        { type: "text", text: " — no editor instance, no DOM hydration." },
      ],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Read-only comments, emails, PDFs" }],
            },
          ],
        },
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Server-rendered previews" }],
            },
          ],
        },
      ],
    },
    {
      type: "codeBlock",
      attrs: { language: "typescript" },
      content: [{ type: "text", text: "renderToHTMLString({ content, extensions })" }],
    },
  ],
};

const mode = ref<"toolbar" | "block" | "extensions" | "static">("toolbar");
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

const extensionEditor = useEditor({
  content: extensionContent,
  extensions: [
    StarterKit.configure({
      codeBlock: false,
      gapcursor: false,
      link: false,
    }),
    Link,
    CodeBlock,
    Highlight.configure({ multicolor: true }),
    TextStyle,
    Color,
    Table,
    ImagePlaceholder.configure({ upload: fakeUpload }),
    ResizableImage,
    Video,
    VideoPlaceholder.configure({ upload: fakeUpload }),
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
            v-for="option in (['toolbar', 'block', 'extensions', 'static'] as const)"
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

    <BlockEditor v-else-if="mode === 'block'" :editor="blockEditor" />

    <RichTextEditor v-else-if="mode === 'extensions'" :editor="extensionEditor">
      <RichTextEditor.Toolbar sticky>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
          <RichTextEditor.Strikethrough />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.H2 />
          <RichTextEditor.H3 />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.BulletList />
          <RichTextEditor.OrderedList />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Link />
          <RichTextEditor.Unlink />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <TableToolbar :editor="extensionEditor ?? null" />
          <ImagePlaceholderToolbar :editor="extensionEditor ?? null" />
          <VideoToolbar :editor="extensionEditor ?? null" />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Undo />
          <RichTextEditor.Redo />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>

      <RichTextEditor.Content>
        <TableHoverOverlay :editor="extensionEditor ?? null" />
      </RichTextEditor.Content>

      <RichTextEditor.Footer show-word-count />
    </RichTextEditor>

    <div v-else class="flex flex-col gap-4">
      <section class="rounded-lg border border-border p-4">
        <p class="mb-3 text-xs tracking-wide text-muted-foreground uppercase">
          From an HTML string
        </p>
        <StaticRenderer :content="editor?.getHTML() ?? ''" />
      </section>

      <section class="rounded-lg border border-border p-4">
        <p class="mb-3 text-xs tracking-wide text-muted-foreground uppercase">
          From ProseMirror JSON
        </p>
        <StaticRenderer :content="staticJson" :extensions="baseExtensions" />
      </section>
    </div>
  </main>
</template>
