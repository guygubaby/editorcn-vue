import { Editor } from "@tiptap/core";
import { DecorationSet } from "@tiptap/pm/view";
import StarterKit from "@tiptap/starter-kit";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp, h, nextTick } from "vue";
import type { App } from "vue";

import { ImagePlaceholder, ResizableImage } from "./image-placeholder";
import ImageNode from "./image-placeholder/image-placeholder-node.vue";
import type { UploadHandler } from "./upload";
import { Video, VideoPlaceholder } from "./video";
import VideoNode from "./video/video-placeholder-node.vue";

vi.mock("./ui/popover.vue", async () => {
  const { defineComponent, h } = await import("vue");
  return {
    default: defineComponent({
      setup(_props, { slots }) {
        return () => h("div", [slots.trigger?.(), slots.default?.()]);
      },
    }),
  };
});

const editors: Editor[] = [];
const apps: App[] = [];
const cases = [
  { kind: "image", placeholder: ImagePlaceholder, component: ImageNode },
  { kind: "video", placeholder: VideoPlaceholder, component: VideoNode },
] as const;

const mount = (
  entry: (typeof cases)[number],
  upload: UploadHandler = vi.fn(async () => ({ src: "https://cdn/file" }))
) => {
  const onDropRejected = vi.fn();
  const extension = entry.placeholder.configure({
    upload,
    maxSize: 2,
    maxFiles: 1,
    onDropRejected,
  });
  const editor = new Editor({
    content: { type: "doc", content: [{ type: extension.name }] },
    extensions: [StarterKit, ResizableImage, Video, extension],
  });
  editors.push(editor);
  const root = document.createElement("div");
  const app = createApp(() => h(entry.component, {
    editor,
    extension,
    node: editor.state.doc.firstChild!,
    getPos: () => 0,
    decorations: [],
    innerDecorations: DecorationSet.empty,
    view: editor.view,
    selected: false,
    updateAttributes: vi.fn(),
    deleteNode: vi.fn(),
    HTMLAttributes: {},
  }));
  app.provide("onDragStart", vi.fn());
  app.provide("decorationClasses", "");
  apps.push(app);
  app.mount(root);
  return { root, upload, onDropRejected, editor };
};

const pick = (root: HTMLElement, files: File[]) => {
  const input = root.querySelector<HTMLInputElement>('input[type="file"]')!;
  Object.defineProperty(input, "files", { value: files, configurable: true });
  input.dispatchEvent(new Event("change", { bubbles: true }));
};

afterEach(() => {
  apps.splice(0).forEach((app) => app.unmount());
  editors.splice(0).forEach((editor) => editor.destroy());
});

describe.each(cases)("$kind placeholder", (entry) => {
  it("rejects oversized and wrong-type files selected from the file picker", () => {
    const { root, upload, onDropRejected } = mount(entry);
    const files = [
      new File(["big"], "large", { type: `${entry.kind}/test` }),
      new File(["x"], "text.txt", { type: "text/plain" }),
    ];

    pick(root, files);

    expect(upload).not.toHaveBeenCalled();
    expect(onDropRejected).toHaveBeenCalledWith(files, expect.any(Editor));
  });

  it("applies the count limit to dropped files instead of losing extra files silently", async () => {
    const { root, upload, onDropRejected } = mount(entry);
    const first = new File(["x"], "first", { type: `${entry.kind}/test` });
    const extra = new File(["x"], "extra", { type: `${entry.kind}/test` });
    const event = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "dataTransfer", { value: { files: [first, extra] } });

    root.querySelector(".ext-image-upload-zone")!.dispatchEvent(event);
    await nextTick();

    expect(upload).toHaveBeenCalledExactlyOnceWith(first, entry.kind);
    expect(onDropRejected).toHaveBeenCalledWith([extra], expect.any(Editor));
  });

  it("does not start a second upload while the first is pending", async () => {
    let finish!: (result: { src: string }) => void;
    const upload = vi.fn(() => new Promise<{ src: string }>((resolve) => {
      finish = resolve;
    }));
    const { root } = mount(entry, upload);
    const file = new File(["x"], "file", { type: `${entry.kind}/test` });

    pick(root, [file]);
    pick(root, [file]);
    expect(upload).toHaveBeenCalledTimes(1);
    finish({ src: "https://cdn/file" });
    await nextTick();
  });
});
