import BlockEditorRoot from "./block-editor.vue";
import BottomBar from "./bottom-bar.vue";
import BubbleMenu from "./bubble-menu/bubble-menu.vue";

export const BlockEditor = Object.assign(BlockEditorRoot, {
  BottomBar,
  BubbleMenu,
  Content: BlockEditorRoot,
});

export { useBlockEditorContext } from "./context";
export {
  SlashCommand,
  slashCommandPluginKey,
  type OnCommandSelect,
  type SlashCommandOptions,
  type SlashCommandSuggestionItem,
} from "./extensions/slash-command";
export {
  defaultSlashCommandItems,
  getSlashCommandSuggestion,
} from "./extensions/suggestion";
export { CodeBlock, Link } from "../editor/extensions";
export type { BlockEditorLabels, BlockEditorProps } from "./types";
export { DEFAULT_BLOCK_EDITOR_LABELS } from "./labels";
export type { BlockEditorIcons } from "./icon-types";
export { DEFAULT_ICONS } from "./icons";
export {
  CODE_BLOCK_LANGUAGES,
  getLanguageLabel,
} from "../editor/bubble-menu/utils";
