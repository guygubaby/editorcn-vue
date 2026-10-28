import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { afterEach, describe, expect, it } from "vitest";

import { Video } from "./index";

const editors: Editor[] = [];
const createEditor = (content: string) => {
  const editor = new Editor({ content, extensions: [StarterKit, Video] });
  editors.push(editor);
  return editor;
};

afterEach(() => editors.splice(0).forEach((editor) => editor.destroy()));

describe("video HTML", () => {
  it("parses boolean attributes by their presence, not their string value", () => {
    const editor = createEditor(
      '<video src="/clip.mp4" autoplay loop muted controls playsinline></video>'
    );

    expect(editor.state.doc.firstChild?.attrs).toMatchObject({
      autoplay: true,
      loop: true,
      muted: true,
      controls: true,
      playsInline: true,
    });
  });

  it("keeps disabled playback options disabled through an HTML round trip", () => {
    const editor = createEditor("<p></p>");
    editor.commands.insertVideo({
      src: "/clip.mp4",
      autoplay: false,
      loop: false,
      muted: false,
      controls: false,
      playsInline: false,
    });
    const restored = createEditor(editor.getHTML());

    expect(restored.state.doc.firstChild?.attrs).toMatchObject({
      autoplay: false,
      loop: false,
      muted: false,
      controls: false,
      playsInline: false,
    });
  });
});
