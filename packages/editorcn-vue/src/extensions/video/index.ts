import { mergeAttributes, Node } from "@tiptap/core";
import type { CommandProps, Editor } from "@tiptap/core";
import { VueNodeViewRenderer } from "@tiptap/vue-3";

import type { UploadHandler } from "../upload";
import VideoNodeView from "./video-view.vue";
import VideoPlaceholderNode from "./video-placeholder-node.vue";

export interface VideoOptions {
  HTMLAttributes: Record<string, unknown>;
}

export interface VideoPlaceholderOptions {
  HTMLAttributes: Record<string, unknown>;
  allowedMimeTypes?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  /** Uploads a picked or dropped file and returns the video source. */
  upload?: UploadHandler;
  onDrop?: (files: File[], editor: Editor) => void;
  onDropRejected?: (files: File[], editor: Editor) => void;
  onEmbed?: (url: string, editor: Editor) => void;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    videoControl: {
      insertVideo: (attributes?: Record<string, unknown>) => ReturnType;
      insertVideoPlaceholder: () => ReturnType;
    };
  }
}

export const Video = Node.create<VideoOptions>({
  name: "video",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      src: { default: null },
      poster: { default: null },
      width: { default: "100%" },
      height: { default: null },
      /** CSS object-fit: contain | cover | fill | none | scale-down */
      objectFit: { default: "cover" },
      align: { default: "center" },
      autoplay: {
        default: false,
        parseHTML: (element) => element.hasAttribute("autoplay"),
      },
      loop: {
        default: false,
        parseHTML: (element) => element.hasAttribute("loop"),
      },
      muted: {
        default: false,
        parseHTML: (element) => element.hasAttribute("muted"),
      },
      controls: {
        default: true,
        parseHTML: (element) => element.hasAttribute("controls"),
      },
      playsInline: {
        default: true,
        rendered: false,
        parseHTML: (element) => element.hasAttribute("playsinline"),
      },
      preload: { default: "metadata" },
    };
  },

  addCommands() {
    return {
      insertVideo:
        (attributes = {}) =>
        ({ commands }: CommandProps) =>
          commands.insertContent({ attrs: attributes, type: this.name }),
    };
  },

  addNodeView() {
    return VueNodeViewRenderer(VideoNodeView);
  },

  parseHTML() {
    return [{ tag: "video[src]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const align = node.attrs.align as string;
    const style = [
      "display:block",
      align === "left"
        ? "margin-right:auto"
        : align === "right"
          ? "margin-left:auto"
          : "margin-left:auto;margin-right:auto",
      `object-fit:${node.attrs.objectFit}`,
    ].join(";");

    return [
      "video",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        autoplay: node.attrs.autoplay ? "true" : null,
        controls: node.attrs.controls ? "true" : null,
        loop: node.attrs.loop ? "true" : null,
        muted: node.attrs.muted ? "true" : null,
        playsinline: node.attrs.playsInline ? "true" : null,
        preload: node.attrs.preload ?? null,
        style,
      }),
    ];
  },
});

export const VideoPlaceholder = Node.create<VideoPlaceholderOptions>({
  name: "videoPlaceholder",
  group: "block",
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      allowedMimeTypes: { "video/*": ["video/*"] },
      maxFiles: 1,
    };
  },

  addCommands() {
    return {
      insertVideoPlaceholder:
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
    return VueNodeViewRenderer(VideoPlaceholderNode);
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
