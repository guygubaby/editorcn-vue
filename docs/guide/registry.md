# 通过 registry 安装

项目不做 npm 发布。每个包都是一个 [shadcn-vue registry](https://shadcn-vue.com/docs/registry/getting-started) 条目，CLI 从 GitHub 拉取 JSON、写入源码、安装依赖。

## 四个包

| 包 | 内容 | 依赖 |
| --- | --- | --- |
| `editor` | `RichTextEditor`、工具栏控件、气泡菜单 | — |
| `block-editor` | `BlockEditor`、斜杠命令、拖拽手柄 | `editor` |
| `extensions` | 表格、图片、视频、粘贴/拖放上传 | `editor` |
| `static-renderer` | `StaticRenderer` | — |

`block-editor` 和 `extensions` 在 registry 里声明了对 `editor` 的依赖，CLI 会顺着 URL 自动把它一起装上，不需要手动先装 `editor`。

## 普通 Vue 3 项目

不要求 Tailwind，也不要求完整跑 shadcn-vue 初始化。CLI 只需要一个 `components.json` 来决定文件位置——没有 preferences 的项目手写这个文件即可：

```json
{
  "$schema": "https://shadcn-vue.com/schema.json",
  "style": "default",
  "typescript": true,
  "tailwind": { "css": "src/style.css", "baseColor": "neutral", "cssVariables": true },
  "aliases": {
    "components": "@/components",
    "composables": "@/composables",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib"
  },
  "iconLibrary": "lucide"
}
```

再确保 `tsconfig.json` 里有 `"paths": { "@/*": ["src/*"] }`（或把 `aliases.components` 改成你实际用的相对路径），就可以直接 `add`。组件不依赖 Tailwind 或 Preflight。

## 安装命令

```bash
# 工具栏编辑器
pnpm dlx shadcn-vue@latest add https://raw.githubusercontent.com/guygubaby/editorcn-vue/main/registry/editor.json

# 块编辑器（会连带安装 editor）
pnpm dlx shadcn-vue@latest add https://raw.githubusercontent.com/guygubaby/editorcn-vue/main/registry/block-editor.json

# 表格 / 图片 / 视频扩展（会连带安装 editor）
pnpm dlx shadcn-vue@latest add https://raw.githubusercontent.com/guygubaby/editorcn-vue/main/registry/extensions.json

# 静态渲染
pnpm dlx shadcn-vue@latest add https://raw.githubusercontent.com/guygubaby/editorcn-vue/main/registry/static-renderer.json
```

装完的目录：

```
src/components/
├── editor/
├── block-editor/
├── extensions/
└── static-renderer/
```

## 安装之后

1. 按需导入样式：

```ts
import "@/components/editor/style.css";
import "@/components/block-editor/style.css";
import "@/components/extensions/ui-style.css";
import "@/components/extensions/table-style.css";
import "@/components/extensions/image-placeholder-style.css";
import "@/components/extensions/video-style.css";
import "@/components/static-renderer/style.css";
```

2. 按 [RichTextEditor](/components/editor)、[BlockEditor](/components/block-editor)、[扩展](/components/extensions) 的说明注册 Tiptap 扩展。

## 网络问题

registry JSON 托管在 `raw.githubusercontent.com`。国内网络需要代理时，Node 24 起可以：

```bash
NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:7890 \
  pnpm dlx shadcn-vue@latest add https://raw.githubusercontent.com/guygubaby/editorcn-vue/main/registry/editor.json
```

raw CDN 对 `main` 有几分钟缓存；刚更新 registry 后如果装到旧版本，等一会儿或改用 commit SHA URL。

## 为什么是扁平文件名

shadcn CLI 会把 registry 里的嵌套路径按“最深的公共目录”重新落盘，导致包目录被丢掉、相对导入失效。构建脚本（`scripts/build-registry.mjs`）把所有文件压成一层目录，并同步改写相对导入，因此安装结果可预测。

## 更新

CLI 默认覆盖已存在的文件。改过组件源码后想升级，建议先用 git 对比再重装；也可以直接看仓库源码手动同步。

## 自己构建 registry

```bash
pnpm build:registry
```

从 `src/{editor,block-editor,extensions,static-renderer}` 生成 `registry/*.json`。推送到 GitHub 后即可用上面的 URL 安装。
