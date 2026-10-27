# RichTextEditor

带工具栏、气泡菜单和页脚的基础富文本编辑器。所有子组件挂在 `RichTextEditor` 上，模板里可以直接写 `<RichTextEditor.Bold />`。

## 基本用法

```vue
<script setup lang="ts">
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/vue-3";

import { CodeBlock, Link, RichTextEditor } from "@/components/editor";
import "@/components/editor/style.css";

const editor = useEditor({
  content: "<p>你好</p>",
  extensions: [
    StarterKit.configure({ link: false, codeBlock: false }),
    Link,
    CodeBlock,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Placeholder.configure({ placeholder: "开始输入…" }),
  ],
});
</script>

<template>
  <RichTextEditor :editor="editor" variant="default">
    <RichTextEditor.Toolbar sticky :sticky-offset="0">
      <RichTextEditor.ControlsGroup>
        <RichTextEditor.Bold />
        <RichTextEditor.Italic />
        <RichTextEditor.Underline />
        <RichTextEditor.Strikethrough />
        <RichTextEditor.Code />
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
        <RichTextEditor.ClearFormatting />
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

    <RichTextEditor.Content class="min-h-64">
      <RichTextEditor.BubbleMenu :editor="editor ?? null" />
    </RichTextEditor.Content>

    <RichTextEditor.Footer show-word-count sticky />
  </RichTextEditor>
</template>
```

## Props

### RichTextEditor

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `editor` | `Editor \| null \| undefined` | — | `useEditor()` 返回的实例 |
| `variant` | `"default" \| "subtle" \| "compact"` | `"default"` | 视觉变体 |
| `editable` | `boolean` | `true` | `false` 时隐藏工具栏并切只读 |
| `labels` | `Partial<RichTextEditorLabels>` | — | 覆盖文案 |
| `icons` | `Partial<RichTextEditorIcons>` | — | 覆盖图标组件 |

### Toolbar / Footer

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `sticky` | `boolean` | 吸顶 |
| `stickyOffset` | `number \| string` | 吸顶距离，默认 `0` |

Footer 额外支持 `showWordCount`、`wordCountFormatter: (info) => string`、`wordCountClassName`。

### Content / Control / ControlsGroup

`Content` 接受 `class`；`Control` 是自定义控件的基座：

```vue
<RichTextEditor.Control
  :active="editor?.isActive('strike')"
  aria-label="删除线"
  @click="editor?.chain().focus().toggleStrike().run()"
>
  <MyIcon />
</RichTextEditor.Control>
```

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `active` | `boolean` | 高亮状态 |
| `disabled` | `boolean` | 禁用 |

其余属性（`aria-label`、`class`、事件）直接透传到按钮。

## 控件

| 控件 | 需要的扩展 |
| --- | --- |
| `Bold` `Italic` `Strikethrough` `Code` | StarterKit |
| `Underline` | `@tiptap/extension-underline` |
| `Highlight` | 需要 `Highlight`（多色需 `multicolor: true`） |
| `Subscript` `Superscript` | 对应扩展 |
| `H1`–`H6` `Blockquote` `Hr` `BulletList` `OrderedList` `CodeBlock` | StarterKit |
| `TaskList` | `TaskList` + `TaskItem` |
| `AlignLeft` `AlignCenter` `AlignRight` `AlignJustify` | `TextAlign` |
| `Link` `Unlink` | 组件自带的 `Link`（已配置 `openOnClick: false`） |
| `Undo` `Redo` | StarterKit 的 history |
| `ClearFormatting` | 无 |

没有注册对应扩展时，控件会静默失效或显示为不可用状态，不会抛错。

## 气泡菜单

选中文字后浮出：加粗 / 斜体 / 下划线 / 删除线 / 代码、文字颜色、背景色、链接、清除格式。在代码块内会切换成语言选择器。

```vue
<RichTextEditor.Content>
  <RichTextEditor.BubbleMenu :editor="editor ?? null" />
</RichTextEditor.Content>
```

也可以把气泡菜单放到页面任意位置，只需要传 `editor`。

## 链接

`RichTextEditor.Link` 打开 reka-ui 的 Popover：输入地址、回车确认、`Mod-k` 也可以触发。`Link` 扩展由组件包导出，配置已处理：

```ts
import { Link } from "@/components/editor";

Link.configure({ openOnClick: false, autolink: true });
```

## 字数统计

```vue
<RichTextEditor.Footer
  show-word-count
  :word-count-formatter="({ words, characters }) => `${characters} 字符 / ${words} 词`"
/>
```

## 自定义控件

```ts
import { createControl } from "@/components/editor";

export const HighlightControl = createControl({
  label: "highlightControlLabel",   // keyof RichTextEditorLabels
  iconKey: "highlightControlIcon",  // keyof RichTextEditorIcons
  isActive: { name: "highlight" },
  isDisabled: (editor) => editor.isActive("codeBlock"),
  operation: { name: "toggleHighlight" },
});
```

| 字段 | 说明 |
| --- | --- |
| `label` | 文案键，从 `labels` 上下文取值 |
| `iconKey` | 图标键，从 `icons` 上下文取值 |
| `isActive` | `{ name, attributes? }` 或 `{ attrs }`，也可以用 `editor.isActive` 的判断方式 |
| `isDisabled` | `(editor) => boolean`，可选 |
| `operation` | `{ name, attributes? }`，调用 `editor.chain().focus()[name](attributes).run()` |

返回值是普通 Vue 组件，放进 `<RichTextEditor.ControlsGroup>` 即可。注意它是通过 `operation.name` 动态派发链式命令的，`name` 必须是 Tiptap 命令名（如 `toggleHighlight`）。
