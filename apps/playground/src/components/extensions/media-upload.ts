import { Extension } from "@tiptap/core";
import type { EditorEvents, JSONContent } from "@tiptap/core";
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
      const target = {
        from: position ?? editor.state.selection.from,
        to: position ?? editor.state.selection.to,
      };
      const originalContent = editor.state.doc.slice(
        target.from,
        target.to
      ).content;
      let valid = true;
      const canInsert = () => valid && !editor.isDestroyed && editor.isEditable;
      const mapTarget = ({
        transaction,
        appendedTransactions,
      }: EditorEvents["transaction"]) => {
        for (const tr of [transaction, ...appendedTransactions]) {
          const from = tr.mapping.mapResult(target.from, 1);
          const to = tr.mapping.mapResult(
            target.to,
            target.from === target.to ? 1 : -1
          );
          if (from.deleted && to.deleted) {
            valid = false;
          }
          target.from = from.pos;
          target.to = Math.max(from.pos, to.pos);
        }
      };

      // Keep the original paste/drop target as the document changes, not the
      // cursor or selection the user moves to while the upload is pending.
      editor.on("transaction", mapTarget);
      try {
        const nodes: JSONContent[] = [];
        for (const file of files) {
          if (!canInsert()) {
            return;
          }
          if (maxSize !== undefined && file.size > maxSize) {
            onError?.(new Error(`File is larger than ${maxSize} bytes`), file);
            continue;
          }

          const kind: UploadKind = file.type.startsWith("video/")
            ? "video"
            : "image";
          try {
            const result = await upload(file, kind);
            if (!canInsert()) {
              return;
            }
            nodes.push(
              kind === "video"
                ? {
                    attrs: {
                      height: result.height ?? null,
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
                  }
            );
          } catch (error) {
            if (canInsert()) {
              onError?.(error, file);
            }
          }
        }
        if (nodes.length > 0 && canInsert()) {
          // Do not replace text the user has edited since starting the upload.
          const currentContent = editor.state.doc.slice(
            target.from,
            target.to
          ).content;
          if (!currentContent.eq(originalContent)) {
            target.to = target.from;
          }
          try {
            editor.commands.insertContentAt(target, nodes, {
              updateSelection: false,
            });
          } catch (error) {
            onError?.(error, files[0]!);
          }
        }
      } finally {
        editor.off("transaction", mapTarget);
      }
    };

    const filesFrom = (list: FileList | null | undefined): File[] =>
      [...(list ?? [])].filter((file) =>
        file.type.startsWith("image/")
          ? supports("image")
          : file.type.startsWith("video/") && allowVideo && supports("video")
      );

    return [
      new Plugin({
        props: {
          handlePaste: (_view: EditorView, event: ClipboardEvent) => {
            if (!editor.isEditable) {
              return false;
            }
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
            if (moved || !editor.isEditable) {
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
