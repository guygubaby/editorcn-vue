# 主题与样式

组件读取 shadcn/ui 的 CSS 变量，不依赖 Tailwind。

- 不需要 Tailwind CSS，也不扫描类名。
- 组件内部只用普通的 `style.css`，样式文件随 registry 一起装。
- 你把下面的变量定义在 `:root`（普通 Vue 项目也一样），编辑器就能正常显示 shadcn 的观感。

## 在线演示

点击色板切换 `--muted` 与 `--ring`，编辑器外观随之变化：

<DemoTheming />

## 样式作用域

所有样式都限定在 `.rte` 下，不会污染你的应用：

```css
.rte.rte-root { … }        /* 根元素本身 */
.rte .rte-control-button { … }
.rte .ProseMirror h1 { … }
```

- `.rte` 由组件自动加到根元素上（`RichTextEditor` 的 `.rte-root`、`BlockEditor` 的 `.block-editor`、`StaticRenderer` 的根节点）。
- 会 portal 到 `<body>` 的浮层（链接弹层、颜色/对齐下拉、斜杠菜单、图片操作条、表格工具栏）自带 `.rte`，所以脱离根节点后样式依然生效。
- 组件不会输出任何全局选择器（`*`、`body`、`h1` 等），也不会与 Tailwind preflight 冲突。
- 如果你把编辑器嵌在 Shadow DOM 或 iframe 内，样式跟随组件走，无需额外配置。

## 工具栏布局

工具栏左对齐，控件逐个从左往右排，一行放不下时**按钮逐个换行**（不会整组挪到下一行）：

- `ControlsGroup` 使用 `display: contents`，按钮直接参与工具栏的 flex 排版。
- 分组之间的竖线是真实元素（`.rte-controls-separator`），跟着按钮一起换行。
- 需要整组不拆开时，给该组覆盖 `display: flex` 即可，它就会作为一个整体参与换行。

## 依赖的变量

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --border: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --radius: 0.625rem;
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.577 0.245 27.325);
}
```

暗色主题通过 `.dark` 覆盖同名变量即可，编辑器会自动跟随。

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
