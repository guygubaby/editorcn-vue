import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { afterEach, describe, expect, it } from "vitest";
import { createApp, h, nextTick } from "vue";
import type { App, Component } from "vue";
import type { Editor as VueEditor } from "@tiptap/vue-3";

import { BoldControl, UndoControl } from "./controls";
import Root from "./rte-text-editor.vue";
import TableToolbar from "../extensions/table/toolbar.vue";
import ImageToolbar from "../extensions/image-placeholder/toolbar.vue";
import { ImagePlaceholder } from "../extensions/image-placeholder";
import VideoToolbar from "../extensions/video/toolbar.vue";
import { VideoPlaceholder } from "../extensions/video";
import { useEditorState } from "./composables";

const editors: Editor[] = [];
const apps: App[] = [];

const createEditor = () => {
  const editor = new Editor({
    content: "<p>hello</p>",
    extensions: [
      StarterKit.configure({ undoRedo: false }),
      ImagePlaceholder,
      VideoPlaceholder,
    ],
  });
  editors.push(editor);
  return editor;
};

const mount = (component: Component, editor: Editor, control?: Component) => {
  const root = document.createElement("div");
  const app = createApp(() =>
    h(component, { editor: editor as unknown as VueEditor },
      control ? { default: () => h(control) } : undefined)
  );
  apps.push(app);
  app.mount(root);
  return root;
};

afterEach(() => {
  apps.splice(0).forEach((app) => app.unmount());
  editors.splice(0).forEach((editor) => editor.destroy());
});

describe("toolbar availability", () => {
  it("disables table controls when the table extension is missing", () => {
    const root = mount(TableToolbar, createEditor());
    expect(root.querySelector("button")?.disabled).toBe(true);
  });

  it("disables Undo when history is not installed", () => {
    const root = mount(Root, createEditor(), UndoControl);
    expect(root.querySelector("button")?.disabled).toBe(true);
  });

  it.each([ImageToolbar, VideoToolbar])(
    "disables a media toolbar after the editor becomes read-only",
    async (toolbar) => {
      const editor = createEditor();
      const root = mount(toolbar, editor);
      expect(root.querySelector("button")?.disabled).toBe(false);

      editor.setEditable(false);
      await nextTick();

      expect(root.querySelector("button")?.disabled).toBe(true);
    }
  );

  it("still runs an installed formatting control", async () => {
    const editor = createEditor();
    editor.commands.setTextSelection({ from: 1, to: 6 });
    const root = mount(Root, editor, BoldControl);

    root.querySelector("button")?.click();
    await nextTick();

    expect(editor.getHTML()).toBe("<p><strong>hello</strong></p>");
  });

  it("clears editor selectors when the editor is destroyed", async () => {
    const editor = createEditor();
    const app = createApp({
      setup() {
        const editableRef = useEditorState(
          editor as unknown as VueEditor,
          (current) => current?.isEditable ?? false
        );
        return () => h("span", String(editableRef.value));
      },
    });
    apps.push(app);
    const root = document.createElement("div");
    app.mount(root);
    expect(root.textContent).toBe("true");

    editor.destroy();
    await nextTick();

    expect(root.textContent).toBe("false");
  });
});
