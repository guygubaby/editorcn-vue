# 快速开始

组件以 **shadcn registry** 形式分发：CLI 把源码写进你的项目，依赖自动安装。不需要等 npm 包，也不会有版本锁死。

下面是本站直接加载的真实组件（不是截图），可以直接编辑、选中文字、切换变体：

<DemoRichText />

## 1. 准备项目

只需要 **Vue 3**。不要求 Tailwind、不要求 shadcn-vue 初始化。

- 如果项目已经初始化过 shadcn-vue（有 `components.json`），文件会装到 `aliases.components`（默认 `@/components`）。
- 如果是普通 Vue 3 / Vite 项目，先跑一次 `init` 生成 `components.json` 即可，它只用来决定文件位置：

```bash
pnpm dlx shadcn-vue@latest init
```

组件的样式全部是自带的普通 CSS（`style.css` + CSS 变量），没有 Tailwind 类名依赖，也没有 Preflight 依赖。

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

`style.css` 依赖 shadcn 的 CSS 变量（`--border`、`--background`、`--muted`、`--radius` 等），请在全局样式之后导入。没有 Tailwind 的项目，把 [主题与样式](/guide/theming) 里的变量块贴进全局 CSS 即可。

## 给 LLM 用的文档

站点同时提供纯文本版本，方便把整份文档喂给 AI：

- `https://editorcn-vue.guygubaby.top/llms.txt` — 页面索引与摘要
- `https://editorcn-vue.guygubaby.top/llms-full.txt` — 全部页面合并

## 注意事项

- 图标默认来自 `@lucide/vue`，安装时会自动加入依赖。
- 每个控件对应的 Tiptap 扩展需要你自己注册（例如 `TextAlign`、`Highlight`、`TaskList`），控件只在扩展存在时才能真正生效。
- 组件使用 `@tiptap/vue-3` 的 `Editor` 类型；编辑器实例由你创建和销毁。
