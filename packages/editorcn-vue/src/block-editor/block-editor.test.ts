import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp, h, nextTick } from "vue";
import type { App } from "vue";
import type { Editor as VueEditor } from "@tiptap/vue-3";

import BlockEditor from "./block-editor.vue";

vi.mock("@tiptap/extension-drag-handle-vue-3", async () => {
  const { defineComponent, h, onMounted } = await import("vue");
  return {
    DragHandle: defineComponent({
      props: {
        editor: { type: Object, required: true },
        onNodeChange: { type: Function, required: true },
      },
      setup(props, { slots }) {
        onMounted(() => props.onNodeChange({
          node: props.editor.state.doc.firstChild,
          pos: 0,
        }));
        return () => h("div", slots.default?.());
      },
    }),
  };
});
vi.mock("./bubble-menu/bubble-menu.vue", () => ({
  default: { render: () => null },
}));
vi.mock("./bottom-bar.vue", () => ({
  default: { render: () => null },
}));

let app: App;
let editor: Editor;

const mount = async () => {
  editor = new Editor({ content: "<p>hello</p>", extensions: [StarterKit] });
  const root = document.createElement("div");
  app = createApp(() => h(BlockEditor, {
    editor: editor as unknown as VueEditor,
  }));
  app.mount(root);
  await nextTick();
  return root;
};

afterEach(() => {
  app?.unmount();
  editor?.destroy();
});

describe("block editor drag actions", () => {
  it("opens the slash command at the hovered node", async () => {
    const root = await mount();

    root.querySelector<HTMLButtonElement>('button[aria-label="Add block"]')!.click();

    expect(editor.state.doc.textContent).toBe("/hello");
  });

  it("removes the drag action when the editor becomes read-only", async () => {
    const root = await mount();
    expect(root.querySelector('button[aria-label="Add block"]')).not.toBeNull();

    editor.setEditable(false);
    await nextTick();

    expect(root.querySelector('button[aria-label="Add block"]')).toBeNull();
  });
});
