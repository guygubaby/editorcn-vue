import type { Editor as EditorInstance } from "@tiptap/core";
import type { AnyExtension } from "@tiptap/core";
import { Editor } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import StarterKit from "@tiptap/starter-kit";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MediaUpload } from "./media-upload";
import { Video } from "./video";
import type { UploadHandler } from "./upload";

const editors: EditorInstance[] = [];

const createEditor = (
  upload: UploadHandler,
  options: Partial<Parameters<typeof MediaUpload.configure>[0]> = {},
  extras: AnyExtension[] = [Image, Video]
) => {
  const editor = new Editor({
    content: "<p>hello</p>",
    extensions: [
      StarterKit.configure({ codeBlock: false, gapcursor: false, link: false }),
      MediaUpload.configure({ upload, ...options }),
      ...extras,
    ],
  });
  editors.push(editor);
  return editor;
};

const fileOf = (type: string, name = "a") =>
  new File(["x"], name, { type });

// Other extensions (e.g. list paste rules) also read the clipboard, so the
// fake event needs their methods too.
const clipboard = (files: File[]) => ({
  files,
  types: [] as string[],
  items: [] as unknown[],
  getData: () => "",
});

const paste = (editor: EditorInstance, files: File[]) => {
  const event = {
    clipboardData: clipboard(files),
    preventDefault: vi.fn(),
  } as unknown as ClipboardEvent;
  const handled = editor.view.someProp("handlePaste", (fn) =>
    fn(editor.view, event, null as never)
  );
  return { handled, prevented: event.preventDefault };
};

const drop = (editor: EditorInstance, files: File[], { moved = false } = {}) => {
  const event = {
    dataTransfer: clipboard(files),
    clientX: 0,
    clientY: 0,
    preventDefault: vi.fn(),
  } as unknown as DragEvent;
  const handled = editor.view.someProp("handleDrop", (fn) =>
    fn(editor.view, event, null as never, moved)
  );
  return { handled, prevented: event.preventDefault };
};

const nodeTypes = (editor: EditorInstance): string[] => {
  const types: string[] = [];
  editor.state.doc.descendants((node) => {
    if (node.isBlock && node.type.name !== "paragraph") {
      types.push(node.type.name);
    }
    return true;
  });
  return types;
};

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

afterEach(() => {
  while (editors.length > 0) {
    editors.pop()?.destroy();
  }
});

describe("MediaUpload", () => {
  it("uploads pasted images and inserts them", async () => {
    const upload = vi.fn(async () => ({ src: "https://cdn/x.png" }));
    const editor = createEditor(upload);

    const { handled, prevented } = paste(editor, [fileOf("image/png")]);
    expect(handled).toBe(true);
    expect(prevented).toHaveBeenCalled();

    await flush();
    expect(upload).toHaveBeenCalledWith(expect.any(File), "image");
    expect(editor.getJSON().content?.some((n) => n.type === "image")).toBe(true);
  });

  it("routes video files to the video node", async () => {
    const upload = vi.fn(async () => ({ src: "https://cdn/v.mp4" }));
    const editor = createEditor(upload);

    paste(editor, [fileOf("video/mp4")]);
    await flush();

    expect(upload).toHaveBeenCalledWith(expect.any(File), "video");
    expect(nodeTypes(editor)).toContain("video");
  });

  it("ignores plain text pastes", () => {
    const upload = vi.fn(async () => ({ src: "x" }));
    const editor = createEditor(upload);

    expect(paste(editor, []).handled).toBeFalsy();
    expect(upload).not.toHaveBeenCalled();
  });

  it("does not insert video when video support is off", async () => {
    const upload = vi.fn(async () => ({ src: "https://cdn/v.mp4" }));
    const editor = createEditor(upload, { video: false });

    const { handled } = paste(editor, [fileOf("video/mp4")]);
    await flush();

    expect(handled).toBe(true);
    expect(upload).not.toHaveBeenCalled();
    expect(nodeTypes(editor)).not.toContain("video");
  });

  it("skips nodes whose extension is missing", async () => {
    const upload = vi.fn(async () => ({ src: "https://cdn/x.png" }));
    // No Image extension registered.
    const editor = createEditor(upload, {}, [] as AnyExtension[]);

    paste(editor, [fileOf("image/png")]);
    await flush();

    expect(upload).not.toHaveBeenCalled();
  });

  it("rejects oversized files without calling the uploader", async () => {
    const upload = vi.fn(async () => ({ src: "x" }));
    const onError = vi.fn();
    const editor = createEditor(upload, { maxSize: 1, onError });

    paste(editor, [new File(["too big"], "big.png", { type: "image/png" })]);
    await flush();

    expect(upload).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("reports upload failures through onError", async () => {
    const upload = vi.fn(async () => {
      throw new Error("network");
    });
    const onError = vi.fn();
    const editor = createEditor(upload, { onError });

    paste(editor, [fileOf("image/png")]);
    await flush();

    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(File));
    expect(nodeTypes(editor)).not.toContain("image");
  });

  it("does not hijack an internal drag", () => {
    const upload = vi.fn(async () => ({ src: "x" }));
    const editor = createEditor(upload);

    const { handled } = drop(editor, [fileOf("image/png")], { moved: true });
    expect(handled).toBeFalsy();
    expect(upload).not.toHaveBeenCalled();
  });
});
