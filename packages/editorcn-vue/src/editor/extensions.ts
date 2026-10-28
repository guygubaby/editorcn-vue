import LowlightCodeBlock from "@tiptap/extension-code-block-lowlight";
import TipTapLink from "@tiptap/extension-link";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

export const Link = TipTapLink.extend({
  addKeyboardShortcuts() {
    const editor = this.editor;
    return {
      "Mod-k": () => {
        // The detail carries the editor so only its own popover opens.
        window.dispatchEvent(new CustomEvent("edit-link", { detail: editor }));
        return true;
      },
    };
  },
}).configure({ openOnClick: false });

export const CodeBlock = LowlightCodeBlock.configure({
  defaultLanguage: "javascript",
  lowlight,
});
