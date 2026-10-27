# 快速开始

组件以 **shadcn registry** 形式分发：CLI 把源码写进你的项目，依赖自动安装。不需要等 npm 包，也不会有版本锁死。

## 1. 准备项目

需要一个 Vue 3 + Tailwind CSS v4 项目，并初始化过 shadcn-vue（`components.json`）：

```bash
pnpm dlx shadcn-vue@latest init
```

`components.json` 里的 `aliases.components` 决定文件装到哪里，默认是 `@/components`。

## 2. 安装组件

```bash
pnpm dlx shadcn-vue@latest add https://raw.githubusercontent.com/guygubaby/editorcn-vue/main/registry/editor.json
```

安装结果：

```
src/components/editor/
├── index.ts          # RichTextEditor 与所有控件
├── style.css         # 编辑器样式
├── rte-*.vue
├── bubble-menu-*.vue
└── ...
```

导入：

```ts
import { RichTextEditor } from "@/components/editor";
import "@/components/editor/style.css";
```

其他三个包按需安装，命令见 [registry](/guide/registry)。

## 3. 最小可用编辑器

```vue
<script setup lang="ts">
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/vue-3";

import { Link, CodeBlock, RichTextEditor } from "@/components/editor";
import "@/components/editor/style.css";
import "@/app.css"; // 你的全局样式，包含 shadcn 变量

const editor = useEditor({
  content: "<h2>你好</h2><p>开始输入…</p>",
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
  <RichTextEditor :editor="editor">
    <RichTextEditor.Toolbar sticky>
      <RichTextEditor.ControlsGroup>
        <RichTextEditor.Bold />
        <RichTextEditor.Italic />
        <RichTextEditor.Underline />
      </RichTextEditor.ControlsGroup>
      <RichTextEditor.ControlsGroup>
        <RichTextEditor.H1 />
        <RichTextEditor.H2 />
        <RichTextEditor.Link />
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

## 4. 样式顺序

`style.css` 依赖 shadcn 的 CSS 变量（`--border`、`--background`、`--muted`、`--radius` 等），请在全局样式之后导入；组件自身不生成 Tailwind 类，也不要求 content 扫描。

## 注意事项

- 图标默认来自 `@lucide/vue`，安装时会自动加入依赖。
- 每个控件对应的 Tiptap 扩展需要你自己注册（例如 `TextAlign`、`Highlight`、`TaskList`），控件只在扩展存在时才能真正生效。
- 组件使用 `@tiptap/vue-3` 的 `Editor` 类型；编辑器实例由你创建和销毁。
