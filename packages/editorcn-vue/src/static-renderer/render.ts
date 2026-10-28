import type { TiptapStaticRendererOptions } from "@tiptap/static-renderer";
import { renderToHTMLString } from "@tiptap/static-renderer/pm/html-string";
import type { StaticEditorOptions } from "@tiptap/static-renderer/pm/html-string";
import type { Extensions, JSONContent } from "@tiptap/core";
import type { Mark, Node } from "@tiptap/pm/model";

export interface RenderStaticOptions {
  content: string | JSONContent | Node;
  extensions?: Extensions;
  staticEditorOptions?: StaticEditorOptions;
  options?: Partial<TiptapStaticRendererOptions<string, Mark, Node>>;
}

export const resolveUniqueExtensions = (extensions: Extensions) => {
  const byName = new Map<string, Extensions[number]>();
  for (const extension of extensions) {
    byName.set(extension.name, extension);
  }
  return [...byName.values()];
};

/**
 * Renders static content to HTML. Strings are treated as trusted HTML and
 * returned untouched; JSON goes through Tiptap's own escape-aware renderer.
 */
export const renderStaticHTML = ({
  content,
  extensions,
  staticEditorOptions,
  options,
}: RenderStaticOptions): string => {
  if (typeof content === "string") {
    return content;
  }
  return renderToHTMLString({
    content,
    extensions: resolveUniqueExtensions(extensions ?? []),
    options,
    staticEditorOptions,
  });
};
