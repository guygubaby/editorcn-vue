import { Extension } from "@tiptap/core";
import type { Editor, Range } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import { Suggestion } from "@tiptap/suggestion";
import type { SuggestionOptions } from "@tiptap/suggestion";
import type { Component } from "vue";

export type OnCommandSelect = (props: { editor: Editor; range: Range }) => void;

export interface SlashCommandSuggestionItem {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  icon?: Component;
  command: OnCommandSelect;
}

export interface SlashCommandOptions<
  Item extends SlashCommandSuggestionItem = SlashCommandSuggestionItem,
> {
  suggestion: Omit<SuggestionOptions<Item>, "editor">;
}

export const slashCommandPluginKey = new PluginKey("slashCommand");

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        allow: ({ editor }) => !editor.isActive("codeBlock"),
        char: "/",
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
        pluginKey: slashCommandPluginKey,
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
