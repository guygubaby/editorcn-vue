# 主题与样式

组件使用自己的 `--rte-*` 变量，不读取宿主的 `--background` 等变量，也不依赖 Tailwind。

- 不需要 Tailwind CSS，也不扫描类名。
- 组件内部只用普通的 `style.css`，样式文件随 registry 一起装。
- 变量由宿主定义（或映射到已有的 shadcn 变量）；变量名带 `rte` 前缀，不会和宿主的同名变量冲突。

## 在线演示

点击色板覆盖 `--rte-muted` 与 `--rte-ring`，编辑器外观随之变化：

<DemoTheming />

## 样式作用域

组件的样式都限定在 `.rte` 下，不会污染你的应用：

```css
.rte.rte-root { … }        /* 根元素本身 */
.rte .rte-control-button { … }
.rte .ProseMirror h1 { … }
```

- `.rte` 由组件自动加到根元素上（`RichTextEditor` 的 `.rte-root`、`BlockEditor` 的 `.block-editor`、`StaticRenderer` 的根节点）。
- 会 portal 到 `<body>` 的浮层（链接弹层、颜色/对齐下拉、斜杠菜单、图片操作条、表格工具栏）自带 `.rte`，所以脱离根节点后样式依然生效。
- 组件不会输出任何全局选择器（`*`、`body`、`h1` 等），也不会与 Tailwind preflight 冲突。
- 嵌入 iframe 时重新导入样式即可。Shadow DOM 内需要把 `--rte-*` 变量定义在 shadow root 内或 shadow host 上。

## 工具栏布局

工具栏左对齐，控件逐个从左往右排，一行放不下时**按钮逐个换行**（不会整组挪到下一行）：

- `ControlsGroup` 使用 `display: contents`，按钮直接参与工具栏的 flex 排版。
- 分组之间的竖线是真实元素（`.rte-controls-separator`），跟着按钮一起换行。
- 需要整组不拆开时，给该组覆盖 `display: flex` 即可，它就会作为一个整体参与换行。

## 依赖的变量

组件读取下列 `--rte-*` 变量。在 `:root` 定义亮色值，在 `.dark` 覆盖同名变量即可，编辑器会自动跟随。建议写在 `:root` / `.dark` 上：链接弹层、下拉菜单、图片/视频操作条会 portal 到 `<body>`，只有放在 `:root`（或 `body`）的覆盖才能作用到它们。

```css
:root {
  --rte-background: oklch(1 0 0);
  --rte-foreground: oklch(0.145 0 0);
  --rte-popover: oklch(1 0 0);
  --rte-popover-foreground: oklch(0.145 0 0);
  --rte-primary: oklch(0.205 0 0);
  --rte-primary-foreground: oklch(0.985 0 0);
  --rte-secondary: oklch(0.97 0 0);
  --rte-secondary-foreground: oklch(0.205 0 0);
  --rte-muted: oklch(0.97 0 0);
  --rte-muted-foreground: oklch(0.556 0 0);
  --rte-accent: oklch(0.97 0 0);
  --rte-accent-foreground: oklch(0.205 0 0);
  --rte-destructive: oklch(0.577 0.245 27.325);
  --rte-border: oklch(0.922 0 0);
  --rte-input: oklch(0.922 0 0);
  --rte-ring: oklch(0.708 0 0);
  --rte-radius: 0.625rem;
}
```

`.dark` 覆盖同名变量：

```css
.dark {
  --rte-background: oklch(0.145 0 0);
  --rte-foreground: oklch(0.985 0 0);
  --rte-popover: oklch(0.269 0 0);
  --rte-popover-foreground: oklch(0.985 0 0);
  --rte-primary: oklch(0.922 0 0);
  --rte-primary-foreground: oklch(0.205 0 0);
  --rte-secondary: oklch(0.269 0 0);
  --rte-secondary-foreground: oklch(0.985 0 0);
  --rte-muted: oklch(0.269 0 0);
  --rte-muted-foreground: oklch(0.708 0 0);
  --rte-accent: oklch(0.371 0 0);
  --rte-accent-foreground: oklch(0.985 0 0);
  --rte-destructive: oklch(0.704 0.191 22.216);
  --rte-border: oklch(1 0 0 / 10%);
  --rte-input: oklch(1 0 0 / 15%);
  --rte-ring: oklch(0.556 0 0);
}
```

`--rte-spacing`（默认 `0.75rem`）和 `--rte-font-mono`（默认 `monospace`）可选，不定义也能正常显示。

想让编辑器跟随宿主已有的 shadcn 变量，做一层映射即可：

```css
:root,
.dark {
  --rte-background: var(--background);
  --rte-foreground: var(--foreground);
  --rte-popover: var(--popover);
  --rte-popover-foreground: var(--popover-foreground);
  --rte-primary: var(--primary);
  --rte-primary-foreground: var(--primary-foreground);
  --rte-secondary: var(--secondary);
  --rte-secondary-foreground: var(--secondary-foreground);
  --rte-muted: var(--muted);
  --rte-muted-foreground: var(--muted-foreground);
  --rte-accent: var(--accent);
  --rte-accent-foreground: var(--accent-foreground);
  --rte-destructive: var(--destructive);
  --rte-border: var(--border);
  --rte-input: var(--input);
  --rte-ring: var(--ring);
  --rte-radius: var(--radius);
}
```

## 样式文件

| 文件 | 内容 |
| --- | --- |
| `editor/style.css` | 工具栏、控件、气泡菜单、链接弹层、页脚 |
| `block-editor/style.css` | 斜杠菜单、拖拽手柄、底部栏、块选择器 |
| `extensions/ui-style.css` | 下拉菜单、弹层等共享 UI |
| `extensions/table-style.css` | 表格、行列抓手、增删手柄 |
| `extensions/image-placeholder-style.css` | 图片占位与缩放控件 |
| `extensions/video-style.css` | 视频块与对齐 |

请在所有全局样式之后导入。

## 变体

`RichTextEditor` 的 `variant`：

- `default` — 带边框的工具栏
- `subtle` — 无边框、背景弱化
- `compact` — 更小的内边距，适合侧边栏

## 覆盖文案和图标

```vue
<RichTextEditor
  :editor="editor"
  :labels="{ boldControlLabel: '加粗', linkControlLabel: '链接' }"
  :icons="{ boldControlIcon: MyBoldIcon }"
/>
```

- `labels` 与 `DEFAULT_LABELS` 做浅合并，只需传要改的键。
- `icons` 的值是 Vue 组件；默认来自 `@lucide/vue`。
- `BlockEditor` 同样支持 `labels` / `icons`；扩展工具栏可通过 `<ToolbarProvider>` 注入。
- 语言选择器的图标是原项目 SVG，单独由 `DEFAULT_LANGUAGE_ICONS` 提供。

## 只读

```vue
<RichTextEditor :editor="editor" :editable="false" />
```

工具栏和气泡菜单会隐藏，编辑器切到只读。纯展示场景更适合 [StaticRenderer](/components/static-renderer)。
