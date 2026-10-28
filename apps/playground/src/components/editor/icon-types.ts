import type { Component } from "vue";

export interface RichTextEditorIcons {
  boldControlIcon: Component;
  italicControlIcon: Component;
  underlineControlIcon: Component;
  strikeControlIcon: Component;
  clearFormattingControlIcon: Component;
  codeControlIcon: Component;
  codeBlockControlIcon: Component;
  h1ControlIcon: Component;
  h2ControlIcon: Component;
  h3ControlIcon: Component;
  h4ControlIcon: Component;
  h5ControlIcon: Component;
  h6ControlIcon: Component;
  bulletListControlIcon: Component;
  orderedListControlIcon: Component;
  blockquoteControlIcon: Component;
  hrControlIcon: Component;
  linkControlIcon: Component;
  unlinkControlIcon: Component;
  undoControlIcon: Component;
  redoControlIcon: Component;
  alignLeftControlIcon: Component;
  alignCenterControlIcon: Component;
  alignRightControlIcon: Component;
  alignJustifyControlIcon: Component;
  highlightControlIcon: Component;
  subscriptControlIcon: Component;
  superscriptControlIcon: Component;
  taskListControlIcon: Component;
  languageIcons: Record<string, Component>;
}

// Mirrors the icon sets the shadcn CLI installs.
export type EditorIconLibrary =
  | "lucide"
  | "tabler"
  | "hugeicons"
  | "phosphor"
  | "remixicon";

export const EDITOR_ICON_LIBRARY_PACKAGES: Record<EditorIconLibrary, string[]> =
  {
    hugeicons: ["@hugeicons/vue", "@hugeicons/core-free-icons"],
    lucide: ["@lucide/vue"],
    phosphor: ["@phosphor-icons/vue"],
    remixicon: ["@remixicon/vue"],
    tabler: ["@tabler/icons-vue"],
  };
