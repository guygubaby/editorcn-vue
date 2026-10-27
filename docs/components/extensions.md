# 扩展：表格 / 图片 / 视频

`extensions` 包提供三组块和两个工具栏，全部以 Tiptap 扩展 + Vue node view 的形式实现。

```bash
pnpm dlx shadcn-vue@latest add https://raw.githubusercontent.com/guygubaby/editorcn-vue/main/registry/extensions.json
```

```ts
import "@/components/extensions/ui-style.css";
import "@/components/extensions/table-style.css";
import "@/components/extensions/image-placeholder-style.css";
import "@/components/extensions/video-style.css";
```

## 表格

```ts
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@/components/extensions";

const editor = useEditor({
  extensions: [
    StarterKit.configure({ gapcursor: false }), // Table 自带 gapcursor
    Table.configure({ resizable: true, defaultCols: 3, defaultRows: 3 }),
  ],
});
```

| 选项 | 默认 | 说明 |
| --- | --- | --- |
| `defaultCols` | `3` | 新表格列数 |
| `defaultRows` | `3` | 新表格行数 |
| `withHeaderRow` | `true` | 首行作为表头 |
| `resizable` | `true` | 拖拽列宽 |
| `tableCellMinWidth` | Tiptap 默认 | 单元格最小宽度 |

命令：

```ts
editor.chain().focus().insertTableWithHeader().run();
editor.chain().focus().moveRow(0, 2).run();
editor.chain().focus().moveColumn(1, 0).run();
```

### 工具栏与悬停抓手

```vue
<script setup lang="ts">
import {
  Table,
  TableHoverOverlay,
  TableToolbar,
} from "@/components/extensions";
</script>

<template>
  <RichTextEditor :editor="editor">
    <RichTextEditor.Toolbar>
      <TableToolbar :editor="editor" />
    </RichTextEditor.Toolbar>

    <RichTextEditor.Content>
      <TableHoverOverlay :editor="editor" />
      <RichTextEditor.BubbleMenu :editor="editor ?? null" />
    </RichTextEditor.Content>
  </RichTextEditor>
</template>
```

- `TableToolbar`：不在表格内时显示拖选网格（最大 10×10）；在表格内时换成插入/删除行列、合并/拆分、表头切换、删除表格。
- `TableHoverOverlay`：鼠标悬停时显示行/列抓手、行末和列末的追加按钮及其菜单。每帧测量表格几何，滚动和窗口缩放都能跟上。

## 图片

两个节点，二选一或同时注册：

```ts
import {
  ImagePlaceholder,
  ResizableImage,
} from "@/components/extensions";

const editor = useEditor({
  extensions: [
    StarterKit.configure({ gapcursor: false }),
    ImagePlaceholder.configure({ upload }),  // 占位块 + 上传
    ResizableImage.configure({              // 实际展示的图片节点
      inline: false,
      allowBase64: true,
    }),
  ],
});
```

`ImagePlaceholder` 是一个 atom 块：点击、拖入文件或粘贴 URL 后上传，成功后把自己替换成 `image` 节点（由 `ResizableImage` 提供）。`ResizableImage` 在 Tiptap `Image` 上增加了 `width`、`align`、`objectFit`，并带拖拽缩放的 node view 和浮动操作栏（对齐、复制、删除）。

占位块选项：

| 选项 | 说明 |
| --- | --- |
| `upload` | `UploadHandler`，见 [上传](/guide/uploads) |
| `maxSize` | 单文件字节上限 |
| `maxFiles` | 一次最多文件数 |
| `allowedMimeTypes` | 允许的 MIME，如 `{ "image/*": [] }` |
| `onDrop` / `onDropRejected` | 文件进入时的回调 |
| `onEmbed` | 直接输入 URL 时的回调 |

没有 `upload` 时会回退为 base64 data URL（仅演示用）。

### 图片工具栏

```vue
<ImagePlaceholderToolbar :editor="editor" />
```

在工具栏里插入一个图片占位块；编辑器可控（`editable`）时才可用。

## 视频

```ts
import { Video, VideoPlaceholder } from "@/components/extensions";
import { VideoToolbar } from "@/components/extensions";

const editor = useEditor({
  extensions: [
    StarterKit.configure({ gapcursor: false }),
    Video,                                  // 播放节点
    VideoPlaceholder.configure({ upload }), // 上传占位块
  ],
});
```

视频节点的属性见 [上传：视频选项](/guide/uploads#视频选项)。常用：

```ts
editor.chain().focus().insertVideo({
  src: "https://cdn.example.com/clip.mp4",
  poster: "https://cdn.example.com/clip.jpg",
  objectFit: "contain",
  align: "left",
  controls: true,
  autoplay: false,
  muted: true,
  loop: false,
  playsInline: true,
  preload: "metadata",
}).run();
```

`VideoPlaceholder` 选项与 `ImagePlaceholder` 一致，另有 `upload` 失败时块内报错、可重试。

## 粘贴 / 拖放上传

```ts
import { MediaUpload } from "@/components/extensions";

MediaUpload.configure({
  upload,
  maxSize: 20 * 1024 * 1024,
  video: true,             // false 时忽略视频文件
  onError: (error, file) => toast.error(`${file.name}: ${error.message}`),
});
```

图片和视频会插到拖放位置；目标节点类型没有注册时自动跳过。

## 文案与图标

```vue
<ToolbarProvider :editor="editor" :labels="{ tableControlLabel: '表格' }">
  <TableToolbar />
  <ImagePlaceholderToolbar />
</ToolbarProvider>
```

`useToolbar()` / `useToolbarEditor()` 也可以在自定义工具栏里读取同一份上下文。

## 共享工具

```ts
import {
  chainFocus,
  extensionPresent,
  isValidUrl,
  nodeActive,
} from "@/components/extensions";
```

这几个函数就是工具栏内部用的判断逻辑，写自己的控件时可以直接复用。
