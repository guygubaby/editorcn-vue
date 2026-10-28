// Generates docs/public/llms.txt and llms-full.txt from the documentation
// sources, following https://llmstxt.org.
//
//   node scripts/build-llms.mjs
//
// Runs before `vitepress build docs` so VitePress copies both files from
// public/ into the site as /llms.txt and /llms-full.txt.
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SITE = "https://editorcn-vue.guygubaby.top";
const REPO = "https://github.com/guygubaby/editorcn-vue";

// Link text, route, source file and a one-line description per page.
const pages = [
  {
    title: "快速开始",
    url: "/guide/getting-started",
    file: "docs/guide/getting-started.md",
    description:
      "安装方式、最小可用编辑器、样式导入顺序，以及普通 Vue 3 项目（无需 Tailwind）的接入方式。",
  },
  {
    title: "通过 registry 安装",
    url: "/guide/registry",
    file: "docs/guide/registry.md",
    description:
      "用 shadcn-vue CLI 从 GitHub 直接安装四个包，含 registry 依赖关系、代理用法与普通 Vue 项目的 components.json。",
  },
  {
    title: "图片 / 视频上传",
    url: "/guide/uploads",
    file: "docs/guide/uploads.md",
    description:
      "UploadHandler 契约、占位块接入、MediaUpload 粘贴/拖放、视频节点属性（object-fit、poster、autoplay 等）。",
  },
  {
    title: "主题与样式",
    url: "/guide/theming",
    file: "docs/guide/theming.md",
    description:
      "shadcn CSS 变量清单、.rte 样式作用域、工具栏换行规则、变体、文案与图标覆盖。",
  },
  {
    title: "RichTextEditor",
    url: "/components/editor",
    file: "docs/components/editor.md",
    description:
      "工具栏编辑器：Props、全部控件及其所需 Tiptap 扩展、气泡菜单、链接弹层、字数统计、自定义控件。",
  },
  {
    title: "BlockEditor",
    url: "/components/block-editor",
    file: "docs/components/block-editor.md",
    description:
      "块编辑器：斜杠命令（含自定义项与可见性控制）、拖拽手柄、节点选择器、移动端底栏。",
  },
  {
    title: "扩展（表格 / 图片 / 视频）",
    url: "/components/extensions",
    file: "docs/components/extensions.md",
    description:
      "Table（含悬停抓手与行列命令）、ImagePlaceholder、ResizableImage、Video、VideoPlaceholder、MediaUpload。",
  },
  {
    title: "StaticRenderer",
    url: "/components/static-renderer",
    file: "docs/components/static-renderer.md",
    description:
      "把 HTML 或 ProseMirror JSON 渲染成只读内容，nodeMapping / markMapping 自定义输出，以及 renderStaticHTML 纯函数。",
  },
];

// Demo components only exist on the rendered site; drop them from the text.
const clean = (markdown) =>
  markdown
    .replace(/^---[\s\S]*?---\n/, "")
    .replace(/^<Demo[A-Za-z]+ \/>\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const intro = `# editorcn-vue

> Vue 3 富文本 / 块编辑器组件库，基于 Tiptap 3 与 shadcn 设计令牌。以 shadcn-vue registry 形式从 GitHub 分发源码，不发布 npm 包，也不依赖 Tailwind。

- 仓库：${REPO}
- 站点：${SITE}
- 安装：\`pnpm dlx shadcn-vue@latest add https://raw.githubusercontent.com/guygubaby/editorcn-vue/main/registry/editor.json\`
- 四个包：\`editor\`、\`block-editor\`、\`extensions\`、\`static-renderer\`；后两者自动带上 \`editor\`
`;

const llms = [
  intro,
  ...pages.map(
    (page) => `- [${page.title}](${SITE}${page.url}): ${page.description}`
  ),
  `- [完整文档（单文件）](${SITE}/llms-full.txt): 上面所有页面合并成的纯文本`,
].join("\n");

const full = [
  intro,
  `本文件合并了全部文档页面，供 LLM 一次性读取。`,
  ...pages.map((page) => {
    const body = clean(readFileSync(join(ROOT, page.file), "utf8"));
    return `---\n\n# ${page.title}\n\n来源：${SITE}${page.url}\n\n${body}`;
  }),
].join("\n\n");

mkdirSync(join(ROOT, "docs/public"), { recursive: true });
writeFileSync(join(ROOT, "docs/public/llms.txt"), `${llms}\n`);
writeFileSync(join(ROOT, "docs/public/llms-full.txt"), `${full}\n`);
console.log(
  `docs/public/llms.txt (${llms.length}B), docs/public/llms-full.txt (${full.length}B)`
);
