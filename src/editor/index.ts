import { defineComponent, h } from "vue";

import { BubbleMenu } from "./bubble-menu";
import {
  AlignCenterControl,
  AlignJustifyControl,
  AlignLeftControl,
  AlignRightControl,
  BlockquoteControl,
  BoldControl,
  BulletListControl,
  ClearFormattingControl,
  CodeBlockControl,
  CodeControl,
  H1Control,
  H2Control,
  H3Control,
  H4Control,
  H5Control,
  H6Control,
  HighlightControl,
  HrControl,
  ItalicControl,
  OrderedListControl,
  RedoControl,
  StrikethroughControl,
  SubscriptControl,
  SuperscriptControl,
  UnderlineControl,
  UndoControl,
  UnlinkControl,
} from "./controls";
import LinkControl from "./link-control.vue";
import Content from "./rte-content.vue";
import ControlsGroup from "./rte-controls-group.vue";
import Footer from "./rte-footer.vue";
import RichTextEditorRoot from "./rte-text-editor.vue";
import Toolbar from "./rte-toolbar.vue";
import RichTextEditorControl from "./ui/rte-control.vue";

export const RichTextEditor = Object.assign(RichTextEditorRoot, {
  AlignCenter: AlignCenterControl,
  AlignJustify: AlignJustifyControl,
  AlignLeft: AlignLeftControl,
  AlignRight: AlignRightControl,
  Blockquote: BlockquoteControl,
  Bold: BoldControl,
  BubbleMenu,
  BulletList: BulletListControl,
  ClearFormatting: ClearFormattingControl,
  Code: CodeControl,
  CodeBlock: CodeBlockControl,
  Content,
  Control: RichTextEditorControl,
  ControlsGroup,
  Footer,
  H1: H1Control,
  H2: H2Control,
  H3: H3Control,
  H4: H4Control,
  H5: H5Control,
  H6: H6Control,
  Highlight: HighlightControl,
  Hr: HrControl,
  Italic: ItalicControl,
  Link: LinkControl,
  OrderedList: OrderedListControl,
  Redo: RedoControl,
  Strikethrough: StrikethroughControl,
  Subscript: SubscriptControl,
  Superscript: SuperscriptControl,
  Toolbar,
  Underline: UnderlineControl,
  Undo: UndoControl,
  Unlink: UnlinkControl,
});

export { useRichTextEditorContext } from "./context";
export { useEditorState } from "./composables";
export type {
  RichTextEditorFooterProps,
  RichTextEditorProps,
  RichTextEditorVariant,
  WordCountInfo,
} from "./types";
export type { RichTextEditorLabels } from "./labels";
export { DEFAULT_LABELS } from "./labels";
export type { RichTextEditorIcons } from "./icon-types";
export { DEFAULT_ICONS } from "./icons";
export { DEFAULT_LANGUAGE_ICONS } from "./language-icons";
export { Link, CodeBlock } from "./extensions";
export { createControl } from "./controls";
