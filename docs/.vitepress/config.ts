import { defineConfig } from "vitepress";

export default defineConfig({
  title: "editorcn-vue",
  description:
    "Vue 3 port of editorcn — Tiptap editor components styled with shadcn tokens.",
  lang: "zh-CN",
  cleanUrls: true,
  sitemap: { hostname: "https://editorcn-vue.guygubaby.top" },
  head: [
    // Advertise the LLM-friendly text files (https://llmstxt.org).
    [
      "link",
      {
        rel: "alternate",
        type: "text/plain",
        title: "llms.txt",
        href: "/llms.txt",
      },
    ],
    [
      "link",
      {
        rel: "alternate",
        type: "text/plain",
        title: "llms-full.txt",
        href: "/llms-full.txt",
      },
    ],
  ],
  themeConfig: {
    nav: [
      { text: "指南", link: "/guide/getting-started" },
      { text: "组件", link: "/components/editor" },
      { text: "GitHub", link: "https://github.com/guygubaby/editorcn-vue" },
    ],
    sidebar: [
      {
        text: "指南",
        items: [
          { text: "快速开始", link: "/guide/getting-started" },
          { text: "通过 registry 安装", link: "/guide/registry" },
          { text: "图片 / 视频上传", link: "/guide/uploads" },
          { text: "主题与样式", link: "/guide/theming" },
        ],
      },
      {
        text: "组件",
        items: [
          { text: "RichTextEditor", link: "/components/editor" },
          { text: "BlockEditor", link: "/components/block-editor" },
          { text: "扩展：表格 / 图片 / 视频", link: "/components/extensions" },
          { text: "StaticRenderer", link: "/components/static-renderer" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/guygubaby/editorcn-vue" },
    ],
    search: { provider: "local" },
    outline: { level: [2, 3] },
  },
});
