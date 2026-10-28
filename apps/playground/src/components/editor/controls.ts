import type { ChainedCommands } from "@tiptap/core";
import type { Editor } from "@tiptap/vue-3";
import { computed, defineComponent, h } from "vue";

import { useEditorState } from "./composables";
import { useRichTextEditorContext } from "./context";
import type { RichTextEditorIcons } from "./icon-types";
import type { RichTextEditorLabels } from "./labels";
import RichTextEditorControl from "./ui-rte-control.vue";

type IsActiveConfig =
  | { name: string; attributes?: Record<string, unknown> | string }
  | { attrs: Record<string, unknown> };

type ChainCommand = (
  attributes?: Record<string, unknown> | string
) => Pick<ChainedCommands, "run">;

interface CreateControlProps {
  label: keyof RichTextEditorLabels;
  iconKey: Exclude<keyof RichTextEditorIcons, "languageIcons">;
  isActive?: IsActiveConfig;
  isDisabled?: (editor: Editor) => boolean;
  operation: { name: string; attributes?: Record<string, unknown> | string };
}

const resolveIsActive = (
  editor: Editor | null,
  config?: IsActiveConfig
): boolean => {
  if (!editor || !config) {
    return false;
  }
  if ("attrs" in config) {
    return editor.isActive(config.attrs);
  }
  return editor.isActive(config.name, config.attributes);
};

export const createControl = ({
  label,
  iconKey,
  isActive,
  isDisabled,
  operation,
}: CreateControlProps) => {
  return defineComponent({
    name: `RteControl${String(iconKey)}`,
    inheritAttrs: false,
    props: {
      class: { type: String, default: "" },
    },
    setup(props) {
      const { editor, labels, icons } = useRichTextEditorContext();

      const active = useEditorState(editor, (current) =>
        resolveIsActive(current, isActive)
      );
      const disabled = useEditorState(
        editor,
        (current) =>
          !current ||
          !current.isEditable ||
          !(operation.name in current.commands) ||
          (isDisabled?.(current) ?? false)
      );
      const ariaLabel = computed(() => labels.value[label]);

      const run = () => {
        const current = editor.value;
        if (!current || current.isDestroyed || disabled.value) {
          return;
        }
        const commands = current.chain().focus() as unknown as Record<
          string,
          ChainCommand
        >;
        commands[operation.name]?.(operation.attributes).run();
      };

      return () =>
        h(
          RichTextEditorControl,
          {
            active: active.value,
            class: props.class,
            disabled: disabled.value,
            "aria-label": ariaLabel.value,
            title: ariaLabel.value,
            onClick: run,
          },
          // Object form keeps the slot inside the render context.
          { default: () => h(icons.value[iconKey], { class: "rte-editor-icon" }) }
        );
    },
  });
};

interface HistoryCanCommands {
  redo: () => boolean;
  undo: () => boolean;
}

export const BoldControl = createControl({
  iconKey: "boldControlIcon",
  isActive: { name: "bold" },
  label: "boldControlLabel",
  operation: { name: "toggleBold" },
});

export const ItalicControl = createControl({
  iconKey: "italicControlIcon",
  isActive: { name: "italic" },
  label: "italicControlLabel",
  operation: { name: "toggleItalic" },
});

export const UnderlineControl = createControl({
  iconKey: "underlineControlIcon",
  isActive: { name: "underline" },
  label: "underlineControlLabel",
  operation: { name: "toggleUnderline" },
});

export const StrikethroughControl = createControl({
  iconKey: "strikeControlIcon",
  isActive: { name: "strike" },
  label: "strikeControlLabel",
  operation: { name: "toggleStrike" },
});

export const ClearFormattingControl = createControl({
  iconKey: "clearFormattingControlIcon",
  label: "clearFormattingControlLabel",
  operation: { name: "unsetAllMarks" },
});

export const CodeControl = createControl({
  iconKey: "codeControlIcon",
  isActive: { name: "code" },
  label: "codeControlLabel",
  operation: { name: "toggleCode" },
});

export const CodeBlockControl = createControl({
  iconKey: "codeBlockControlIcon",
  isActive: { name: "codeBlock" },
  label: "codeBlockControlLabel",
  operation: { name: "toggleCodeBlock" },
});

export const H1Control = createControl({
  iconKey: "h1ControlIcon",
  isActive: { attributes: { level: 1 }, name: "heading" },
  label: "h1ControlLabel",
  operation: { attributes: { level: 1 }, name: "toggleHeading" },
});

export const H2Control = createControl({
  iconKey: "h2ControlIcon",
  isActive: { attributes: { level: 2 }, name: "heading" },
  label: "h2ControlLabel",
  operation: { attributes: { level: 2 }, name: "toggleHeading" },
});

export const H3Control = createControl({
  iconKey: "h3ControlIcon",
  isActive: { attributes: { level: 3 }, name: "heading" },
  label: "h3ControlLabel",
  operation: { attributes: { level: 3 }, name: "toggleHeading" },
});

export const H4Control = createControl({
  iconKey: "h4ControlIcon",
  isActive: { attributes: { level: 4 }, name: "heading" },
  label: "h4ControlLabel",
  operation: { attributes: { level: 4 }, name: "toggleHeading" },
});

export const H5Control = createControl({
  iconKey: "h5ControlIcon",
  isActive: { attributes: { level: 5 }, name: "heading" },
  label: "h5ControlLabel",
  operation: { attributes: { level: 5 }, name: "toggleHeading" },
});

export const H6Control = createControl({
  iconKey: "h6ControlIcon",
  isActive: { attributes: { level: 6 }, name: "heading" },
  label: "h6ControlLabel",
  operation: { attributes: { level: 6 }, name: "toggleHeading" },
});

export const BulletListControl = createControl({
  iconKey: "bulletListControlIcon",
  isActive: { name: "bulletList" },
  label: "bulletListControlLabel",
  operation: { name: "toggleBulletList" },
});

export const OrderedListControl = createControl({
  iconKey: "orderedListControlIcon",
  isActive: { name: "orderedList" },
  label: "orderedListControlLabel",
  operation: { name: "toggleOrderedList" },
});

export const BlockquoteControl = createControl({
  iconKey: "blockquoteControlIcon",
  isActive: { name: "blockquote" },
  label: "blockquoteControlLabel",
  operation: { name: "toggleBlockquote" },
});

export const HrControl = createControl({
  iconKey: "hrControlIcon",
  label: "hrControlLabel",
  operation: { name: "setHorizontalRule" },
});

export const UnlinkControl = createControl({
  iconKey: "unlinkControlIcon",
  label: "unlinkControlLabel",
  operation: { name: "unsetLink" },
});

export const UndoControl = createControl({
  iconKey: "undoControlIcon",
  isDisabled: (editor) =>
    !(editor.can() as unknown as HistoryCanCommands).undo(),
  label: "undoControlLabel",
  operation: { name: "undo" },
});

export const RedoControl = createControl({
  iconKey: "redoControlIcon",
  isDisabled: (editor) =>
    !(editor.can() as unknown as HistoryCanCommands).redo(),
  label: "redoControlLabel",
  operation: { name: "redo" },
});

export const AlignLeftControl = createControl({
  iconKey: "alignLeftControlIcon",
  isActive: { attrs: { textAlign: "left" } },
  label: "alignLeftControlLabel",
  operation: { attributes: "left", name: "setTextAlign" },
});

export const AlignCenterControl = createControl({
  iconKey: "alignCenterControlIcon",
  isActive: { attrs: { textAlign: "center" } },
  label: "alignCenterControlLabel",
  operation: { attributes: "center", name: "setTextAlign" },
});

export const AlignRightControl = createControl({
  iconKey: "alignRightControlIcon",
  isActive: { attrs: { textAlign: "right" } },
  label: "alignRightControlLabel",
  operation: { attributes: "right", name: "setTextAlign" },
});

export const AlignJustifyControl = createControl({
  iconKey: "alignJustifyControlIcon",
  isActive: { attrs: { textAlign: "justify" } },
  label: "alignJustifyControlLabel",
  operation: { attributes: "justify", name: "setTextAlign" },
});

export const HighlightControl = createControl({
  iconKey: "highlightControlIcon",
  isActive: { name: "highlight" },
  label: "highlightControlLabel",
  operation: { name: "toggleHighlight" },
});

export const SubscriptControl = createControl({
  iconKey: "subscriptControlIcon",
  isActive: { name: "subscript" },
  label: "subscriptControlLabel",
  operation: { name: "toggleSubscript" },
});

export const SuperscriptControl = createControl({
  iconKey: "superscriptControlIcon",
  isActive: { name: "superscript" },
  label: "superscriptControlLabel",
  operation: { name: "toggleSuperscript" },
});

export const TaskListControl = createControl({
  iconKey: "taskListControlIcon",
  isActive: { name: "taskList" },
  label: "taskListControlLabel",
  operation: { name: "toggleTaskList" },
});
