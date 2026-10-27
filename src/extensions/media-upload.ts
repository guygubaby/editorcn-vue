import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";

import type { UploadHandler, UploadKind } from "./upload";

export interface MediaUploadOptions {
  /** Required: your upload implementation, shared with the placeholder blocks. */
  upload: UploadHandler;
  /** Reject files above this size in bytes. */
  maxSize?: number;
  /** Insert video nodes for `video/*` files. Defaults to true. */
  video?: boolean;
  /** Called for rejected or failed files so you can surface a toast. */
  onError?: (error: unknown, file: File) => void;
}

const isMediaFile = (file: File) =>
  file.type.startsWith("image/") || file.type.startsWith("video/");

/**
 * Pastes and drops straight into the editor: every image or video file goes
 * through the same `UploadHandler` used by the placeholder blocks.
 */
export const MediaUpload = Extension.create<MediaUploadOptions>({
  name: "mediaUpload",

  addOptions() {
    return {
      upload: async () => {
        throw new Error("MediaUpload needs an upload handler");
      },
      video: true,
    };
  },

  addProseMirrorPlugins() {
    const { upload, maxSize, onError } = this.options;
    const allowVideo = this.options.video !== false;
    const editor = this.editor;

    const supports = (name: string) =>
      editor.extensionManager.extensions.some(
        (extension) => extension.name === name
      );

    const insertFiles = async (
      files: File[],
      position?: number
    ): Promise<void> => {
      for (const file of files) {
        if (maxSize && file.size > maxSize) {
          onError?.(new Error(`File is larger than ${maxSize} bytes`), file);
          continue;
        }

        const kind: UploadKind = file.type.startsWith("video/")
          ? "video"
          : "image";
        if (kind === "video" && (!allowVideo || !supports("video"))) {
          continue;
        }
        if (kind === "image" && !supports("image")) {
          continue;
        }

        try {
          const result = await upload(file, kind);
          const node =
            kind === "video"
              ? {
                  attrs: {
                    poster: result.poster ?? null,
                    src: result.src,
                    width: result.width ?? "100%",
                  },
                  type: "video",
                }
              : {
                  attrs: {
                    alt: result.alt ?? null,
                    height: result.height ?? null,
                    src: result.src,
                    width: result.width ?? "60%",
                  },
                  type: "image",
                };

          const chain = editor.chain().focus();
          if (typeof position === "number") {
            chain.insertContentAt(position, node).run();
            // keep subsequent files after the inserted node
            position += 1;
          } else {
            chain.insertContent(node).run();
          }
        } catch (error) {
          onError?.(error, file);
        }
      }
    };

    const filesFrom = (list: FileList | null | undefined): File[] =>
      [...(list ?? [])].filter(isMediaFile);

    return [
      new Plugin({
        props: {
          handlePaste: (_view: EditorView, event: ClipboardEvent) => {
            const files = filesFrom(event.clipboardData?.files);
            if (files.length === 0) {
              return false;
            }
            event.preventDefault();
            void insertFiles(files);
            return true;
          },

          handleDrop: (
            view: EditorView,
            event: DragEvent,
            _slice: unknown,
            moved: boolean
          ) => {
            if (moved) {
              return false;
            }
            const files = filesFrom(event.dataTransfer?.files);
            if (files.length === 0) {
              return false;
            }
            event.preventDefault();
            const coords = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });
            void insertFiles(files, coords?.pos);
            return true;
          },
        },
      }),
    ];
  },
});
