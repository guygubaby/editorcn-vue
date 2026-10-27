import { mergeAttributes, Node } from "@tiptap/core";
import type { CommandProps, Editor } from "@tiptap/core";
import { VueNodeViewRenderer } from "@tiptap/vue-3";

import ImagePlaceholderNode from "./image-placeholder-node.vue";

export { ResizableImage } from "./image";

export interface ImagePlaceholderOptions {
  HTMLAttributes: Record<string, unknown>;
  allowedMimeTypes?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  onDrop?: (files: File[], editor: Editor) => void;
  onDropRejected?: (files: File[], editor: Editor) => void;
  onEmbed?: (url: string, editor: Editor) => void;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imagePlaceholder: {
      insertImagePlaceholder: () => ReturnType;
    };
  }
}

export const ImagePlaceholder = Node.create<ImagePlaceholderOptions>({
  name: "imagePlaceholder",
  group: "block",
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addCommands() {
    return {
      insertImagePlaceholder:
        () =>
        ({ chain, state }: CommandProps) => {
          const { from } = state.selection;
          const node = this.type.create();
          return chain()
            .insertContentAt(from, node.toJSON())
            .setTextSelection(from + node.nodeSize)
            .run();
        },
    };
  },

  addNodeView() {
    return VueNodeViewRenderer(ImagePlaceholderNode);
  },

  parseHTML() {
    return [{ tag: `div[data-type="${this.name}"]` }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": this.name,
      }),
    ];
  },
});
