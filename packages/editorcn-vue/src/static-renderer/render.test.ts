import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { describe, expect, it } from "vitest";

import { renderStaticHTML } from "./render";

const extensions = [
  StarterKit.configure({ codeBlock: false, gapcursor: false, link: false }),
];

const doc = (content: JSONContent[]): JSONContent => ({ type: "doc", content });

describe("renderStaticHTML", () => {
  it("passes HTML strings through unchanged", () => {
    expect(renderStaticHTML({ content: "<p>hi</p>" })).toBe("<p>hi</p>");
  });

  it("renders JSON through the extensions' renderHTML", () => {
    const html = renderStaticHTML({
      content: doc([
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Title" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", marks: [{ type: "bold" }], text: "hi" }],
        },
      ]),
      extensions,
    });

    expect(html).toContain("<h2>Title</h2>");
    expect(html).toContain("<strong>hi</strong>");
  });

  it("escapes text instead of injecting markup", () => {
    const html = renderStaticHTML({
      content: doc([
        {
          type: "paragraph",
          content: [{ type: "text", text: "<img src=x onerror=alert(1)>" }],
        },
      ]),
      extensions,
    });

    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });

  it("drops duplicate extensions before rendering", () => {
    const html = renderStaticHTML({
      content: doc([
        { type: "paragraph", content: [{ type: "text", text: "ok" }] },
      ]),
      extensions: [...extensions, ...extensions],
    });

    expect(html).toContain("ok");
  });
});
