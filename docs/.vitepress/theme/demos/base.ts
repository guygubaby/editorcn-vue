import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";

import { CodeBlock, Link } from "../../../../src/editor";
import type { UploadHandler } from "../../../../src/extensions";

export const baseExtensions = [
  StarterKit.configure({ codeBlock: false, link: false }),
  Link,
  CodeBlock,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Highlight.configure({ multicolor: true }),
  TextStyle,
  Color,
];

export const placeholder = (text: string) =>
  Placeholder.configure({ placeholder: text });

// Docs demo uploader: object URL, nothing leaves the page.
export const demoUpload: UploadHandler = async (file, kind) => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return {
    src: URL.createObjectURL(file),
    width: kind === "video" ? "100%" : "60%",
  };
};
