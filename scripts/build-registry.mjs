// Builds shadcn-vue registry items from the source tree so the components can
// be installed straight from GitHub, without publishing to npm.
//
//   pnpm build:registry
//
// The shadcn CLI re-roots nested registry paths against the components alias
// (it keeps only the deepest shared directory), which would drop the package
// folder and break relative imports. So every file is flattened to a single
// directory and relative imports are rewritten to match.
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, posix, relative } from "node:path";

const ROOT = process.cwd();
const REPO = "https://raw.githubusercontent.com/guygubaby/editorcn-vue/main";
const SCHEMA = "https://shadcn-vue.com/schema/registry-item.json";

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
      "@tiptap/pm",
      "@tiptap/vue-3",
      "lowlight",
      "reka-ui",
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
      "@tiptap/vue-3",
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
      "@tiptap/vue-3",
      "reka-ui",
    ],
    registryDependencies: [`${REPO}/registry/editor.json`],
  },
  {
    name: "static-renderer",
    dir: "src/static-renderer",
    title: "Static renderer",
    description: "Read-only rendering of editor HTML or ProseMirror JSON.",
    deps: ["@tiptap/core", "@tiptap/pm", "@tiptap/static-renderer", "@tiptap/vue-3"],
    registryDependencies: [],
  },
];

const walk = (dir) => {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walk(full));
    } else if (/\.(ts|vue|css)$/.test(entry) && !/\.test\.ts$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
};

// "editor/bubble-menu/index.ts" -> "editor/bubble-menu-index.ts"
const flatten = (pkgPath) => {
  const [pkg, ...rest] = pkgPath.split("/");
  return `${pkg}/${rest.join("-")}`;
};

// package-relative file table, e.g. "editor/bubble-menu/index.ts"
const source = new Map();

for (const pkg of packages) {
  for (const file of walk(join(ROOT, pkg.dir))) {
    const rel = relative(join(ROOT, pkg.dir), file).split("\\").join("/");
    source.set(`${pkg.name}/${rel}`, {
      abs: file,
      pkg: pkg.name,
      rel,
      flat: `${pkg.name}/${rel.split("/").join("-")}`,
    });
  }
}

const resolveImport = (spec, from) => {
  if (!spec.startsWith(".")) {
    return null;
  }
  const base = posix.dirname(`${from.pkg}/${from.rel}`);
  const resolved = posix.normalize(posix.join(base, spec));
  for (const candidate of [
    resolved,
    `${resolved}.ts`,
    `${resolved}.vue`,
    `${resolved}/index.ts`,
    `${resolved}/index.vue`,
  ]) {
    if (source.has(candidate)) {
      return source.get(candidate);
    }
  }
  return null;
};

const IMPORT_RE = /(from\s+|import\s*\()(["'])(\.[^"']+)\2/g;

const rewriteImports = (content, from) =>
  content.replace(IMPORT_RE, (match, prefix, quote, spec) => {
    const target = resolveImport(spec, from);
    if (!target) {
      return match;
    }
    const [targetPkg, ...rest] = target.flat.split("/");
    // Drop the `.ts` extension so consumers don't need allowImportingTsExtensions.
    const fileName = rest.join("/").replace(/\.ts$/, "");
    const next =
      targetPkg === from.pkg ? `./${fileName}` : `../${targetPkg}/${fileName}`;
    return `${prefix}${quote}${next}${quote}`;
  });

mkdirSync(join(ROOT, "registry"), { recursive: true });

for (const pkg of packages) {
  const files = [...source.values()]
    .filter((entry) => entry.pkg === pkg.name)
    .map((entry) => ({
      // `path` is relative to the components alias, matching shadcn-vue's own items.
      // Keep the package folder: the CLI keeps the deepest shared directory for
      // nested-looking paths, so every file needs the same two-segment shape.
      path: entry.flat,
      type: "registry:component",
      content: rewriteImports(readFileSync(entry.abs, "utf8"), entry),
    }));

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
