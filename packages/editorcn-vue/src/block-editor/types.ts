import type { Editor } from "@tiptap/vue-3";
import type { ComputedRef } from "vue";

import type { BlockEditorIcons } from "./icon-types";

export interface BlockEditorLabels {
  paragraphLabel?: string;
  headingLabel?: string;
  bulletListLabel?: string;
  orderedListLabel?: string;
  taskListLabel?: string;
  blockquoteLabel?: string;
  codeBlockLabel?: string;
  dividerLabel?: string;
}

export interface BlockEditorProps {
  editor: Editor | null | undefined;
  labels?: Partial<BlockEditorLabels>;
  icons?: Partial<BlockEditorIcons>;
}

export interface BlockEditorContextValue {
  editor: ComputedRef<Editor | null>;
  labels: ComputedRef<BlockEditorLabels>;
  icons: ComputedRef<BlockEditorIcons>;
}
