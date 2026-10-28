import type { ChainedCommands } from "@tiptap/core";
import type { Editor } from "@tiptap/vue-3";

export const chainFocus = (editor: Editor): ChainedCommands =>
  editor.chain().focus();

export const isValidUrl = (url: string): boolean => /^https?:\/\/\S+$/.test(url);

export const extensionPresent = (
  editor: Editor | null,
  name: string
): boolean =>
  Boolean(
    editor &&
      !editor.isDestroyed &&
      editor.extensionManager.extensions.some(
        (extension) => extension.name === name
      )
  );

export const nodeActive = (
  editor: Editor | null,
  name: string,
  attributes?: Record<string, unknown>
): boolean =>
  Boolean(editor && !editor.isDestroyed && editor.isActive(name, attributes));
