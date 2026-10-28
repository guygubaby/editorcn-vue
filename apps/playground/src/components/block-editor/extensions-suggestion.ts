import { computePosition, flip, shift } from "@floating-ui/dom";
import { posToDOMRect } from "@tiptap/core";
import type { Editor } from "@tiptap/core";
import { VueRenderer } from "@tiptap/vue-3";
import type { SuggestionOptions } from "@tiptap/suggestion";

import { DEFAULT_ICONS } from "./icons";
import { chainFocus } from "./lib";
import type { SlashCommandSuggestionItem } from "./extensions-slash-command";
import SuggestionList from "./extensions-suggestion-list.vue";

type SuggestionType = Omit<
  SuggestionOptions<SlashCommandSuggestionItem>,
  "editor"
>;

export const defaultSlashCommandItems: SlashCommandSuggestionItem[] = [
  {
    command: ({ editor, range }) => {
      chainFocus(editor)
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .run();
    },
    description: "Just start typing with plain text.",
    icon: DEFAULT_ICONS.slashTextIcon,
    id: "text",
    keywords: ["p", "paragraph"],
    title: "Text",
  },
  {
    command: ({ editor, range }) => {
      chainFocus(editor).deleteRange(range).setNode("heading", { level: 1 }).run();
    },
    description: "Big section heading.",
    icon: DEFAULT_ICONS.slashHeadingIcon,
    id: "h1",
    keywords: ["title", "big", "large", "heading"],
    title: "Heading 1",
  },
  {
    command: ({ editor, range }) => {
      chainFocus(editor).deleteRange(range).setNode("heading", { level: 2 }).run();
    },
    description: "Medium section heading.",
    icon: DEFAULT_ICONS.slashHeadingIcon,
    id: "h2",
    keywords: ["subtitle", "medium", "heading"],
    title: "Heading 2",
  },
  {
    command: ({ editor, range }) => {
      chainFocus(editor).deleteRange(range).setNode("heading", { level: 3 }).run();
    },
    description: "Small section heading.",
    icon: DEFAULT_ICONS.slashHeadingIcon,
    id: "h3",
    keywords: ["subtitle", "small", "heading"],
    title: "Heading 3",
  },
  {
    command: ({ editor, range }) => {
      chainFocus(editor).deleteRange(range).toggleBulletList().run();
    },
    description: "Create a simple bullet list.",
    icon: DEFAULT_ICONS.slashBulletListIcon,
    id: "bulletList",
    keywords: ["unordered", "list", "bullet"],
    title: "Bullet List",
  },
  {
    command: ({ editor, range }) => {
      chainFocus(editor).deleteRange(range).toggleOrderedList().run();
    },
    description: "Create a list with numbering.",
    icon: DEFAULT_ICONS.slashOrderedListIcon,
    id: "orderedList",
    keywords: ["ordered", "list"],
    title: "Numbered List",
  },
  {
    command: ({ editor, range }) => {
      chainFocus(editor).deleteRange(range).toggleTaskList().run();
    },
    description: "Create a task list with checkboxes.",
    icon: DEFAULT_ICONS.slashTaskListIcon,
    id: "taskList",
    keywords: ["task", "todo", "checkbox"],
    title: "Task List",
  },
  {
    command: ({ editor, range }) =>
      chainFocus(editor)
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .toggleBlockquote()
        .run(),
    description: "Capture a quote.",
    icon: DEFAULT_ICONS.slashBlockquoteIcon,
    id: "blockquote",
    keywords: ["blockquote"],
    title: "Quote",
  },
  {
    command: ({ editor, range }) =>
      chainFocus(editor)
        .deleteRange(range)
        .toggleCodeBlock({ language: "plaintext" })
        .run(),
    description: "Capture a code snippet.",
    icon: DEFAULT_ICONS.slashCodeBlockIcon,
    id: "codeBlock",
    keywords: ["codeblock"],
    title: "Code",
  },
  {
    command: ({ editor, range }) =>
      chainFocus(editor).deleteRange(range).setHorizontalRule().run(),
    description: "Create a horizontal divider.",
    icon: DEFAULT_ICONS.slashDividerIcon,
    id: "divider",
    keywords: ["divider"],
    title: "Divider",
  },
  {
    command: ({ editor, range }) => {
      chainFocus(editor).deleteRange(range).run();
      (
        editor.commands as unknown as {
          insertImagePlaceholder?: () => boolean;
        }
      ).insertImagePlaceholder?.();
    },
    description: "Upload or embed an image.",
    icon: DEFAULT_ICONS.slashImageIcon,
    id: "image",
    isAvailable: (editor) =>
      editor.extensionManager.extensions.some(
        (extension) => extension.name === "imagePlaceholder"
      ),
    keywords: ["image", "img", "picture", "photo"],
    title: "Image",
  },
  {
    command: ({ editor, range }) => {
      chainFocus(editor).deleteRange(range).run();
      (
        editor.commands as unknown as {
          insertVideoPlaceholder?: () => boolean;
        }
      ).insertVideoPlaceholder?.();
    },
    description: "Upload or link a video.",
    icon: DEFAULT_ICONS.slashVideoIcon,
    id: "video",
    isAvailable: (editor) =>
      editor.extensionManager.extensions.some(
        (extension) => extension.name === "videoPlaceholder"
      ),
    keywords: ["video", "movie", "mp4"],
    title: "Video",
  },
  {
    command: ({ editor, range }) => {
      chainFocus(editor).deleteRange(range).run();
      (
        editor.commands as unknown as {
          insertTableWithHeader?: () => boolean;
        }
      ).insertTableWithHeader?.();
    },
    description: "Insert a table with a header row.",
    icon: DEFAULT_ICONS.slashTableIcon,
    id: "table",
    isAvailable: (editor) =>
      editor.extensionManager.extensions.some(
        (extension) => extension.name === "table"
      ),
    keywords: ["table", "grid", "sheet"],
    title: "Table",
  },
];

const updatePosition = async (
  editor: Editor,
  element: Element
): Promise<void> => {
  if (!(element instanceof HTMLElement)) {
    return;
  }

  const virtualElement = {
    getBoundingClientRect: () =>
      posToDOMRect(
        editor.view,
        editor.state.selection.from,
        editor.state.selection.to
      ),
  };

  const {
    x,
    y,
    strategy: posStrategy,
  } = await computePosition(virtualElement, element, {
    middleware: [shift(), flip()],
    placement: "bottom-start",
    strategy: "absolute",
  });
  element.style.width = "max-content";
  element.style.position = posStrategy;
  element.style.left = `${x}px`;
  element.style.top = `${y}px`;
};

export const getSlashCommandSuggestion = (
  customItems?: SlashCommandSuggestionItem[]
): SuggestionType => {
  const items = customItems
    ? [
        ...customItems,
        ...defaultSlashCommandItems.filter(
          (item) => !customItems.some((custom) => custom.id === item.id)
        ),
      ]
    : defaultSlashCommandItems;

  return {
    items: ({ editor, query }) => {
      const needle = query.toLowerCase();
      return items.filter(
        (item) =>
          (!item.isAvailable || item.isAvailable(editor)) &&
          (item.title.toLowerCase().startsWith(needle) ||
            item.keywords.some((keyword) => keyword.startsWith(needle)))
      );
    },
    render: () => {
      let component: VueRenderer | undefined;

      return {
        onExit() {
          component?.element?.remove();
          component?.destroy();
        },

        onKeyDown(props) {
          if (props.event.key === "Escape") {
            return true;
          }
          return component?.ref?.onKeyDown(props) ?? false;
        },

        onStart(props) {
          component = new VueRenderer(SuggestionList, {
            editor: props.editor,
            props,
          });

          if (!props.clientRect) {
            return;
          }

          if (component.element instanceof HTMLElement) {
            component.element.style.position = "absolute";
            document.body.append(component.element);
            updatePosition(props.editor, component.element);
          }
        },

        onUpdate(props) {
          component?.updateProps(props);
          if (!props.clientRect || !component) {
            return;
          }
          if (component.element) {
            updatePosition(props.editor, component.element);
          }
        },
      };
    },
  };
};
