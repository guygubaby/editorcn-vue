import type { Editor } from "@tiptap/vue-3";
import { inject } from "vue";
import type { ComputedRef, InjectionKey } from "vue";

import type { RichTextEditorIcons } from "./icon-types";
import type { RichTextEditorLabels } from "./labels";
import type { RichTextEditorVariant } from "./types";

export interface RichTextEditorContext {
  editor: ComputedRef<Editor | null>;
  labels: ComputedRef<RichTextEditorLabels>;
  icons: ComputedRef<RichTextEditorIcons>;
  variant: ComputedRef<RichTextEditorVariant>;
  editable: ComputedRef<boolean>;
}

export const richTextEditorKey: InjectionKey<RichTextEditorContext> =
  Symbol("RichTextEditor");

export const useRichTextEditorContext = (): RichTextEditorContext => {
  const context = inject(richTextEditorKey, null);
  if (!context) {
    throw new Error(
      "useRichTextEditorContext must be used within RichTextEditor"
    );
  }
  return context;
};
