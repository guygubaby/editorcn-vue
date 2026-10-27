import LowlightCodeBlock from "@tiptap/extension-code-block-lowlight";
import TipTapLink from "@tiptap/extension-link";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

export const Link = TipTapLink.extend({
  addKeyboardShortcuts() {
    return {
      "Mod-k": () => {
        window.dispatchEvent(new Event("edit-link"));
        return true;
      },
    };
  },
}).configure({ openOnClick: false });

export const CodeBlock = LowlightCodeBlock.configure({
  defaultLanguage: "javascript",
  lowlight,
});
