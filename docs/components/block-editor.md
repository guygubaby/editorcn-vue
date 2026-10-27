# BlockEditor

Notion 风格的块编辑器：斜杠命令、拖拽手柄、块类型选择器、气泡菜单，触屏设备上还有底部工具栏。

## 基本用法

```vue
<script setup lang="ts">
import StarterKit from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { useEditor } from "@tiptap/vue-3";

import {
  BlockEditor,
  CodeBlock,
  Link,
  SlashCommand,
  getSlashCommandSuggestion,
} from "@/components/block-editor";
import "@/components/block-editor/style.css";

const editor = useEditor({
  content: "<p>输入 / 打开命令菜单</p>",
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

`<BlockEditor>` 一次渲染拖拽手柄、气泡菜单、内容区和底部栏。想自己排版可以用子组件：

```vue
<BlockEditor :editor="editor">
  <BlockEditor.BubbleMenu />
  <BlockEditor.Content />
  <BlockEditor.BottomBar />
</BlockEditor>
```

## Props

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `editor` | `Editor \| null \| undefined` | 编辑器实例 |
| `labels` | `Partial<BlockEditorLabels>` | 覆盖命令菜单文案 |
| `icons` | `Partial<BlockEditorIcons>` | 覆盖图标 |

`labels` 键：`paragraphLabel`、`headingLabel`、`bulletListLabel`、`orderedListLabel`、`taskListLabel`、`blockquoteLabel`、`codeBlockLabel`、`dividerLabel`。

## 斜杠菜单

默认项：文本、H1–H3、无序列表、有序列表、待办列表、引用、代码块、分割线。当编辑器注册了对应扩展时，还会出现：

- `table` — 需要 `Table`
- `image` — 需要 `ImagePlaceholder`
- `video` — 需要 `VideoPlaceholder`

匹配逻辑：按标题前缀或关键词前缀过滤。

### 加入自己的命令

```ts
import type { SlashCommandSuggestionItem } from "@/components/block-editor";

const callout: SlashCommandSuggestionItem = {
  id: "callout",
  title: "Callout",
  description: "强调块",
  keywords: ["callout", "提示"],
  command: ({ editor, range }) => {
    editor.chain().focus().deleteRange(range).insertContent("💡 ").run();
  },
};

SlashCommand.configure({
  suggestion: getSlashCommandSuggestion([callout]),
});
```

自定义项按 `id` 覆盖同名默认项，其余排在默认项之前。

### 控制可见性

```ts
{
  id: "signature",
  title: "签名",
  description: "插入签名",
  isAvailable: (editor) => editor.isActive("paragraph"),
  command: ...
}
```

## 拖拽手柄

手柄出现在 hover 的块左侧，可以拖动排序；点击右侧的下拉箭头打开块选择器，支持：

- 转换块类型（文本、标题、列表、引用、代码块）
- 待办列表（仅当注册了 `TaskList` 时显示）
- 复制当前块
- 删除当前块

## 底部栏

只在触屏设备显示（媒体查询 `hover: none` 和 `pointer: coarse`），提交通用格式操作，避免小屏上弹气泡菜单。桌面端使用拖拽手柄和气泡菜单。

## 气泡菜单

选中文字后显示节点选择器、加粗 / 斜体 / 下划线 / 删除线 / 代码、链接，以及块的复制 / 删除。

## 样式

`block-editor/style.css` 依赖 shadcn 变量，请放在全局样式之后。详情见 [主题与样式](/guide/theming)。
