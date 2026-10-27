# editorcn-vue

Vue 3 port of [editorcn](https://github.com/shadcn-labs/editorcn) — rich text editor components built on Tiptap, themed with shadcn/ui tokens.

This repo currently contains two packages:

- **toolbar editor** — `RichTextEditor` with 25+ controls, the bubble menu, the link popover, word count, and three visual variants.
- **block editor** — `BlockEditor` with slash commands, a drag handle, a node selector, the bubble menu, and the mobile bottom bar.

## Getting started

```bash
pnpm install
pnpm dev
```

`pnpm build` type-checks with `vue-tsc` and builds the demo.

## Usage

```vue
<script setup lang="ts">
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/vue-3";
import { CodeBlock, Link, RichTextEditor } from "./editor";
import "./editor/style.css";

const editor = useEditor({
  content: "<h2>Hello</h2><p>Start typing…</p>",
  extensions: [
    StarterKit.configure({ link: false, codeBlock: false }),
    Link,
    CodeBlock,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Placeholder.configure({ placeholder: "Start typing..." }),
  ],
});
</script>

<template>
  <RichTextEditor :editor="editor" variant="default">
    <RichTextEditor.Toolbar sticky>
      <RichTextEditor.ControlsGroup>
        <RichTextEditor.Bold />
        <RichTextEditor.Italic />
        <RichTextEditor.Underline />
      </RichTextEditor.ControlsGroup>
      <RichTextEditor.ControlsGroup>
        <RichTextEditor.H1 />
        <RichTextEditor.H2 />
      </RichTextEditor.ControlsGroup>
      <RichTextEditor.ControlsGroup>
        <RichTextEditor.Link />
        <RichTextEditor.Unlink />
        <RichTextEditor.Undo />
        <RichTextEditor.Redo />
      </RichTextEditor.ControlsGroup>
    </RichTextEditor.Toolbar>

    <RichTextEditor.Content>
      <RichTextEditor.BubbleMenu :editor="editor ?? null" />
    </RichTextEditor.Content>

    <RichTextEditor.Footer show-word-count />
  </RichTextEditor>
</template>
```

Import `./editor/style.css` after your global stylesheet — the editor reads shadcn CSS variables (`--border`, `--background`, `--muted`, `--radius`, …).

## Components

| Component | Notes |
| --- | --- |
| `RichTextEditor` | Root wrapper; provides editor, labels, icons, variant and editable state |
| `.Toolbar` | Hidden when `editable` is false; `sticky` + `stickyOffset` supported |
| `.ControlsGroup` | Groups controls with separators |
| `.Control` | Base button for custom controls |
| `.Content` | Tiptap `EditorContent` wrapper |
| `.Footer` | `showWordCount`, `sticky`, `wordCountFormatter` |
| `.BubbleMenu` | Text formatting on selection; language picker inside code blocks |
| `.Bold` `.Italic` `.Underline` `.Strikethrough` `.Code` `.ClearFormatting` | Inline marks |
| `.H1`–`.H6` `.Blockquote` `.Hr` | Block types |
| `.BulletList` `.OrderedList` | Lists |
| `.AlignLeft` `.AlignCenter` `.AlignRight` `.AlignJustify` | Needs `TextAlign` |
| `.Link` `.Unlink` | Link popover, `Mod-k` opens it |
| `.Highlight` `.Subscript` `.Superscript` | Needs the matching Tiptap extensions |
| `.Undo` `.Redo` | Needs history (in StarterKit) |

All 25 controls are also exported flat from `./editor/controls` and can be created with `createControl`.

## Customization

```vue
<RichTextEditor
  :editor="editor"
  variant="compact"
  :labels="{ boldControlLabel: '加粗' }"
  :icons="{ boldControlIcon: CustomBoldIcon }"
/>
```

- `variant`: `default` | `subtle` | `compact`
- `labels`: partial override of `DEFAULT_LABELS`
- `icons`: partial override of `DEFAULT_ICONS`; each value is a Vue component
- `editable`: hides the toolbar and sets `editor.setEditable(...)`

Icons default to `@lucide/vue`. Language icons are the original editorcn SVG set.

## Block editor

```vue
<script setup lang="ts">
import { useEditor } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import {
  BlockEditor,
  CodeBlock,
  Link,
  SlashCommand,
  getSlashCommandSuggestion,
} from "./block-editor";
import "./block-editor/style.css";

const editor = useEditor({
  content: "<p>Type / for commands…</p>",
  extensions: [
    StarterKit.configure({ link: false, codeBlock: false }),
    Link,
    CodeBlock,
    TaskList,
    TaskItem.configure({ nested: true }),
    SlashCommand.configure({ suggestion: getSlashCommandSuggestion() }),
  ],
});
</script>

<template>
  <BlockEditor :editor="editor" />
</template>
```

`<BlockEditor>` renders the drag handle, bubble menu, content and bottom bar. You can compose it yourself with `<BlockEditor.BubbleMenu>`, `<BlockEditor.BottomBar>` and `<BlockEditor.Content>` inside the default slot.

- Slash menu items are customizable: `getSlashCommandSuggestion(customItems)` merges your items ahead of the defaults by `id`.
- The bottom bar only shows on touch devices (`hover: none` + `pointer: coarse`); desktop uses the drag handle and bubble menu.
- Node selector actions include copy and delete for the current block.

## Differences from the React original

- Compound components are Vue components attached to the `RichTextEditor` object; `<RichTextEditor.Bold />` works in templates.
- Active states use a small `useEditorState(editor, selector)` composable built on Tiptap editor events, since `@tiptap/vue-3` has no selector hook.
- The link popover uses [reka-ui](https://reka-ui.com) instead of Base UI; everything else is plain markup plus the original CSS (copied verbatim).

## Not ported yet

- `extensions` package (table, image placeholder)
- `static-renderer` (`@tiptap/static-renderer` has no Vue entry; use its `html-string` output)
- Twitter / YouTube embed controls
- shadcn registry distribution and the docs site

## License

MIT, same as the upstream project.
