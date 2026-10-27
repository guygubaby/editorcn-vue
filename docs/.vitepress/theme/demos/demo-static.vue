<script setup lang="ts">
import Highlight from "@tiptap/extension-highlight";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import TextAlign from "@tiptap/extension-text-align";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";

import { CodeBlock, Link } from "../../../../src/editor";
import { StaticRenderer } from "../../../../src/static-renderer";

const json = {
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
        {
          type: "text",
          text: " — no editor instance, no DOM hydration. Use it for comments, emails or article pages.",
        },
      ],
    },
    {
      type: "bulletList",
      content: ["Read-only", "Server-renderable", "Escaped by Tiptap"].map(
        (text) => ({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text }],
            },
          ],
        })
      ),
    },
    {
      type: "taskList",
      content: [
        {
          type: "taskItem",
          attrs: { checked: true },
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Works with task lists" }],
            },
          ],
        },
        {
          type: "taskItem",
          attrs: { checked: false },
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "And nested content" }],
            },
          ],
        },
      ],
    },
  ],
};

const extensions = [
  StarterKit.configure({ codeBlock: false, link: false }),
  Link,
  CodeBlock,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Highlight.configure({ multicolor: true }),
  TextStyle,
  Color,
  TaskList,
  TaskItem,
];
</script>

<template>
  <div class="docs-demo">
    <div class="docs-demo-frame">
      <StaticRenderer :content="json" :extensions="extensions" />
    </div>
  </div>
</template>
