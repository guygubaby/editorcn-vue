// Builds shadcn-vue registry items from the source tree so the components can
// be installed straight from GitHub, without publishing to npm.
//
//   pnpm build:registry
//
// Each item inlines every file, so a single JSON per package is enough.
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const REPO = "https://raw.githubusercontent.com/guygubaby/editorcn-vue/main";
const SCHEMA = "https://shadcn-vue.com/schema/registry-item.json";

const tiptap = "@tiptap/vue-3";

const packages = [
  {
    name: "editor",
    dir: "src/editor",
    title: "Toolbar editor",
    description:
      "Rich text editor with 25+ toolbar controls, bubble menu, link popover and word count.",
    deps: [
      "@lucide/vue",
      "@tiptap/core",
      "@tiptap/extension-bubble-menu",
      "@tiptap/extension-code-block-lowlight",
      "@tiptap/extension-link",
      tiptap,
      "@tiptap/pm",
      "class-variance-authority",
      "clsx",
      "lowlight",
      "reka-ui",
      "tailwind-merge",
    ],
    registryDependencies: [],
  },
  {
    name: "block-editor",
    dir: "src/block-editor",
    title: "Block editor",
    description:
      "Notion-style block editor with slash commands, drag handle and a mobile bottom bar.",
    deps: [
      "@floating-ui/dom",
      "@lucide/vue",
      "@tiptap/extension-drag-handle-vue-3",
      "@tiptap/pm",
      "@tiptap/suggestion",
      tiptap,
    ],
    registryDependencies: [`${REPO}/registry/editor.json`],
  },
  {
    name: "extensions",
    dir: "src/extensions",
    title: "Editor extensions",
    description:
      "Table with hover controls, image and video blocks with pluggable uploads, paste/drop uploads.",
    deps: [
      "@lucide/vue",
      "@tiptap/extension-gapcursor",
      "@tiptap/extension-image",
      "@tiptap/extension-table",
      "@tiptap/pm",
      tiptap,
      "reka-ui",
    ],
    registryDependencies: [`${REPO}/registry/editor.json`],
  },
  {
    name: "static-renderer",
    dir: "src/static-renderer",
    title: "Static renderer",
    description: "Read-only rendering of editor HTML or ProseMirror JSON.",
    deps: ["@tiptap/core", "@tiptap/pm", "@tiptap/static-renderer", tiptap],
    registryDependencies: [],
  },
];

const walk = (dir) => {
  const entries = readdirSync(dir);
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walk(full));
    } else if (/\.(ts|vue|css)$/.test(entry) && !/\.test\.ts$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
};

mkdirSync(join(ROOT, "registry"), { recursive: true });

for (const pkg of packages) {
  const files = walk(join(ROOT, pkg.dir)).map((file) => {
    // `path` is relative to the project's components alias, matching how
    // shadcn-vue ships its own items (`ui/button/Button.vue`).
    const path = `${pkg.name}/${relative(join(ROOT, pkg.dir), file)}`;
    return {
      path,
      type: "registry:component",
      content: readFileSync(file, "utf8"),
    };
  });

  const item = {
    $schema: SCHEMA,
    name: pkg.name,
    type: "registry:ui",
    title: pkg.title,
    description: pkg.description,
    dependencies: pkg.deps,
    registryDependencies: pkg.registryDependencies,
    files,
  };

  writeFileSync(
    join(ROOT, "registry", `${pkg.name}.json`),
    `${JSON.stringify(item, null, 2)}\n`
  );
  console.log(
    `registry/${pkg.name}.json — ${files.length} files, ${(
      JSON.stringify(item).length / 1024
    ).toFixed(0)}KB`
  );
}
