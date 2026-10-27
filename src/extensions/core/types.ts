import type { Editor } from "@tiptap/vue-3";

export interface ToolbarComponentProps {
  class?: string;
  editor?: Editor | null;
  size?: "icon" | "icon-lg" | "icon-sm";
}
