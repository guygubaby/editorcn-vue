import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { afterEach, describe, expect, it, vi } from "vitest";

import { copyBlock, deleteBlock } from "./lib";

const editors: Editor[] = [];

const createEditor = () => {
  const editor = new Editor({
    content: "<h2>Title</h2><p>Keep me</p>",
    extensions: [StarterKit],
  });
  editors.push(editor);
  return editor;
};

afterEach(() => {
  editors.splice(0).forEach((editor) => editor.destroy());
  vi.unstubAllGlobals();
});

describe("block actions", () => {
  it("copies a node selected at the document root", async () => {
    const editor = createEditor();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    editor.commands.setNodeSelection(0);

    await copyBlock(editor);

    expect(writeText).toHaveBeenCalledWith("Title");
  });

  it("deletes a node selected at the document root", () => {
    const editor = createEditor();
    editor.commands.setNodeSelection(0);

    deleteBlock(editor);

    expect(editor.getHTML()).toBe("<p>Keep me</p>");
  });

  it("still deletes the block containing a text cursor", () => {
    const editor = createEditor();
    editor.commands.setTextSelection(2);

    deleteBlock(editor);

    expect(editor.getHTML()).toBe("<p>Keep me</p>");
  });
});
