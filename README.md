# editorcn-vue

Vue 3 port of [editorcn](https://github.com/shadcn-labs/editorcn) — rich text editor components built on Tiptap, themed with shadcn/ui tokens.

Works in any Vue 3 project: the components ship plain CSS and read shadcn CSS variables. Tailwind is optional, not required.

Docs: https://editorcn-vue.pages.dev

This repo currently contains four packages:

- **toolbar editor** — `RichTextEditor` with 25+ controls, the bubble menu, the link popover, word count, and three visual variants.
- **block editor** — `BlockEditor` with slash commands, a drag handle, a node selector, the bubble menu, and the mobile bottom bar.
- **extensions** — `Table` with hover grips and add handles, `ImagePlaceholder` / `ResizableImage` with upload, embed, resize, align, duplicate and delete, and a `Video` block with a pluggable uploader.
- **static renderer** — `StaticRenderer` for read-only HTML or ProseMirror JSON.

## Install

No npm package. Each package is a shadcn-vue registry item served from GitHub, so the CLI writes the source straight into your project:

```bash
pnpm dlx shadcn-vue@latest add https://raw.githubusercontent.com/guygubaby/editorcn-vue/main/registry/editor.json
pnpm dlx shadcn-vue@latest add https://raw.githubusercontent.com/guygubaby/editorcn-vue/main/registry/block-editor.json
pnpm dlx shadcn-vue@latest add https://raw.githubusercontent.com/guygubaby/editorcn-vue/main/registry/extensions.json
pnpm dlx shadcn-vue@latest add https://raw.githubusercontent.com/guygubaby/editorcn-vue/main/registry/static-renderer.json
```

Files land in `src/components/{editor,block-editor,extensions,static-renderer}` and their dependencies are installed automatically. `block-editor` and `extensions` pull `editor` through `registryDependencies`.

Behind a proxy:

```bash
NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:7890 \
  pnpm dlx shadcn-vue@latest add https://raw.githubusercontent.com/guygubaby/editorcn-vue/main/registry/editor.json
```

## Local development

```bash
pnpm install
pnpm dev          # demo app
pnpm test
pnpm docs:dev     # documentation site
```

`pnpm build` type-checks with `vue-tsc` and builds the demo; `pnpm build:registry` regenerates `registry/*.json` from `src/`.

## Documentation

The docs site lives in `docs/` (VitePress): getting started, registry install, uploads, theming, and a page per package.

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

Import `./editor/style.css` after your global stylesheet — the editor reads shadcn CSS variables (`--border`, `--background`, `--muted`, `--radius`, …). A plain Vue 3 app only needs those variables defined on `:root`; no Tailwind setup is involved.

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

## Extensions

```vue
<script setup lang="ts">
import {
  ImagePlaceholder,
  ImagePlaceholderToolbar,
  ResizableImage,
  Table,
  TableHoverOverlay,
  TableToolbar,
} from "./extensions";
import "./extensions/ui/style.css";
import "./extensions/table/style.css";
import "./extensions/image-placeholder/style.css";

const editor = useEditor({
  extensions: [
    StarterKit.configure({ gapcursor: false }), // Table registers its own gapcursor
    Table,
    ImagePlaceholder,
    ResizableImage,
  ],
});
</script>

<template>
  <RichTextEditor :editor="editor">
    <RichTextEditor.Toolbar>
      <TableToolbar :editor="editor" />
      <ImagePlaceholderToolbar :editor="editor" />
    </RichTextEditor.Toolbar>
    <RichTextEditor.Content>
      <TableHoverOverlay :editor="editor" />
    </RichTextEditor.Content>
  </RichTextEditor>
</template>
```

- `TableToolbar` opens a drag-selectable grid picker; inside a table it shows row/column actions instead.
- `TableHoverOverlay` draws the row and column grips, the trailing add handles, and their menus. It measures the table every frame so the handles follow scroll and resize.
- `ImagePlaceholder` is an atom block that drops or embeds a file and replaces itself with the image node.
- `ResizableImage` adds `align` / `width` attributes and a drag-to-resize node view with a floating action bar.
- Wrap any of them in `<ToolbarProvider :editor :labels="...">` to translate labels or inject the editor once.

## Uploads

Uploading is not built in — you supply one function and the blocks do the rest:

```ts
import type { UploadHandler } from "./extensions";

const upload: UploadHandler = async (file, kind) => {
  // e.g. presigned PUT to OSS/COS, or your own API
  const { url, poster, width } = await api.upload(file, kind);
  return { src: url, poster, width };
};

const editor = useEditor({
  extensions: [
    ImagePlaceholder.configure({ upload }),
    Video,
    VideoPlaceholder.configure({ upload }),
  ],
});
```

`UploadHandler` receives `(file, "image" | "video")` and resolves to:

| field | required | used by | notes |
| --- | --- | --- | --- |
| `src` | yes | both | final URL of the file |
| `poster` | no | video | cover image shown before playback |
| `width` | no | both | number (px) or string (`"60%"`); image defaults to `60%`, video to `100%` |
| `height` | no | both | optional fixed height |
| `alt` | no | image | alt text |

Notes:

- Without `upload`, the image block falls back to a base64 data URL; the video block shows an error instead.
- Multiple images are uploaded in parallel and inserted in order.
- Upload failures keep the placeholder in place and show the message inside it.
- Both blocks also accept a direct URL instead of a file, so a pasted CDN link works without an uploader.

## Static renderer

```vue
<script setup lang="ts">
import { StaticRenderer } from "./static-renderer";
import "./static-renderer/style.css";
</script>

<template>
  <!-- HTML from editor.getHTML() -->
  <StaticRenderer :content="html" />

  <!-- ProseMirror JSON needs the extensions that define its nodes and marks -->
  <StaticRenderer :content="json" :extensions="extensions" />
</template>
```

`@tiptap/static-renderer` has no Vue entry, so JSON content is rendered with its `pm/html-string` renderer and set through `v-html`. `options.nodeMapping` / `markMapping` therefore return HTML strings rather than components.

> Content passed as a string is trusted input; sanitize it if it comes from users.

## Differences from the React original

- Compound components are Vue components attached to the `RichTextEditor` object; `<RichTextEditor.Bold />` works in templates.
- Active states use a small `useEditorState(editor, selector)` composable built on Tiptap editor events, since `@tiptap/vue-3` has no selector hook.
- The link popover uses [reka-ui](https://reka-ui.com) instead of Base UI; everything else is plain markup plus the original CSS (copied verbatim).

## Not ported yet

- Twitter / YouTube embed controls (skipped — the video block covers self-hosted media, and platform embeds need a per-platform iframe node)

## License

MIT, same as the upstream project.
