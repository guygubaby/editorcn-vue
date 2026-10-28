# StaticRenderer

把编辑器产出的 HTML 或 ProseMirror JSON 渲染成只读内容，不创建 Editor 实例，适合文章详情页、邮件、SSR。

```bash
pnpm dlx shadcn-vue@latest add https://raw.githubusercontent.com/guygubaby/editorcn-vue/main/registry/static-renderer.json
```

## 在线演示

下面是 ProseMirror JSON 的实时渲染结果（没有 Editor 实例）：

<DemoStatic />

```vue
<script setup lang="ts">
import { StaticRenderer } from "@/components/static-renderer";
import "@/components/static-renderer/style.css";
</script>

<template>
  <!-- 编辑器保存的 HTML -->
  <StaticRenderer :content="html" />

  <!-- ProseMirror JSON -->
  <StaticRenderer :content="json" :extensions="extensions" />
</template>
```

## 样式

`static-renderer/style.css` 使用 `--rte-*` 主题变量，请在全局样式中定义，详情见 [主题与样式](/guide/theming)。

## Props

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `content` | `string \| JSONContent \| Node` | HTML 字符串，或 JSON 文档 / 节点 |
| `as` | `string \| Component` | 根元素，默认 `div` |
| `extensions` | `Extensions` | 渲染 JSON 时必须覆盖所有节点和 marks |
| `staticEditorOptions` | `StaticEditorOptions` | Tiptap 静态编辑器的选项 |
| `options` | `Partial<TiptapStaticRendererOptions<string, Mark, Node>>` | `nodeMapping` / `markMapping` |

## 自定义输出

`@tiptap/static-renderer` 没有 Vue 入口，JSON 走它的 `pm/html-string` 渲染器，再通过 `v-html` 输出。因此 mapping 返回的是 HTML 字符串而不是组件：

```vue
<StaticRenderer
  :content="json"
  :extensions="extensions"
  :options="{
    nodeMapping: {
      heading: ({ node, children }) =>
        `<h${node.attrs.level} class=\"article-h\">${children}</h${node.attrs.level}>`,
    },
    markMapping: {
      link: ({ mark, children }) =>
        `<a href=\"${mark.attrs.href}\" rel=\"noopener\">${children}</a>`,
    },
  }"
/>
```

## 纯函数版本

不想挂组件时，可以直接用 `render.ts` 的导出：

```ts
import { renderStaticHTML, resolveUniqueExtensions } from "@/components/static-renderer";

const html = renderStaticHTML({ content: json, extensions });
```

`resolveUniqueExtensions` 会按扩展名去重，避免 StarterKit 与其他扩展重复注册同类节点时报错。

## 安全

传入字符串时组件不转义、不消毒——它假设是 `editor.getHTML()` 的可信输出。用户提交的内容请先在服务端消毒（如 sanitize-html、DOMPurify）。

JSON 路径由 Tiptap 自己的转义渲染器处理，未知节点会报错而不是静默丢失。
