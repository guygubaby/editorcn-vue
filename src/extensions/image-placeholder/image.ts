import Image from "@tiptap/extension-image";
import { VueNodeViewRenderer } from "@tiptap/vue-3";

import ResizableImageView from "./image-view.vue";

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      align: { default: "center" },
      alt: { default: null },
      height: { default: null },
      src: { default: null },
      title: { default: null },
      width: { default: "100%" },
    };
  },
  addNodeView() {
    return VueNodeViewRenderer(ResizableImageView);
  },
}).configure({ allowBase64: true });
