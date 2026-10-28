<script setup lang="ts">
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { useEditor } from "@tiptap/vue-3";

import {
  BlockEditor,
  SlashCommand,
  getSlashCommandSuggestion,
} from "../../../../packages/editorcn-vue/src/block-editor";
import { baseExtensions, placeholder } from "./base";

const content = `
<p>Type <code>/</code> on an empty line for the slash menu. Hover a block to grab its drag handle.</p>
<h2>A block editor</h2>
<p>Everything is a block. Select text for the bubble menu, or use the node selector to change the current block.</p>
<ul>
  <li>Copy or delete a whole block from the node selector</li>
  <li>Drag the handle on the left to reorder</li>
</ul>
`;

const editor = useEditor({
  content,
  extensions: [
    ...baseExtensions,
    placeholder("Type '/' for commands…"),
    TaskList,
    TaskItem.configure({ nested: true }),
    SlashCommand.configure({ suggestion: getSlashCommandSuggestion() }),
  ],
});
</script>

<template>
  <div class="docs-demo">
    <BlockEditor :editor="editor" />
  </div>
</template>
