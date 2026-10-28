import type { Editor } from "@tiptap/vue-3";

import type { RichTextEditorIcons } from "./icon-types";
import type { RichTextEditorLabels } from "./labels";

export type RichTextEditorVariant = "default" | "subtle" | "compact";

export interface RichTextEditorProps {
  editor: Editor | null | undefined;
  labels?: Partial<RichTextEditorLabels>;
  icons?: Partial<RichTextEditorIcons>;
  variant?: RichTextEditorVariant;
  editable?: boolean;
}

export interface RichTextEditorToolbarProps {
  sticky?: boolean;
  stickyOffset?: number | string;
}

export interface RichTextEditorContentProps {
  class?: string;
}

export interface RichTextEditorControlProps {
  active?: boolean;
  interactive?: boolean;
  disabled?: boolean;
}

export interface WordCountInfo {
  words: number;
  characters: number;
}

export interface RichTextEditorFooterProps {
  class?: string;
  sticky?: boolean;
  stickyOffset?: number | string;
  showWordCount?: boolean;
  wordCountClassName?: string;
  wordCountFormatter?: (info: WordCountInfo) => string;
}
