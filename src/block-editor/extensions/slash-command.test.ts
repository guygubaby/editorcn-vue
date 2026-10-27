import type { Editor } from "@tiptap/vue-3";
import { describe, expect, it } from "vitest";

import { getSlashCommandSuggestion } from "./suggestion";
import type { SlashCommandSuggestionItem } from "./slash-command";

const fakeEditor = (names: string[]) =>
  ({
    extensionManager: {
      extensions: names.map((name) => ({ name })),
    },
  }) as unknown as Editor;

const itemsFor = (names: string[], query = ""): SlashCommandSuggestionItem[] => {
  const suggestion = getSlashCommandSuggestion();
  return suggestion.items!({
    editor: fakeEditor(names),
    query,
    range: { from: 0, to: 0 },
  } as never) as SlashCommandSuggestionItem[];
};

const ids = (items: SlashCommandSuggestionItem[]) => items.map((item) => item.id);

describe("slash command items", () => {
  it("always offers the core block types", () => {
    expect(ids(itemsFor([]))).toEqual([
      "text",
      "h1",
      "h2",
      "h3",
      "bulletList",
      "orderedList",
      "taskList",
      "blockquote",
      "codeBlock",
      "divider",
    ]);
  });

  it("hides media and table commands without their extensions", () => {
    const available = ids(itemsFor(["paragraph"]));
    expect(available).not.toContain("image");
    expect(available).not.toContain("video");
    expect(available).not.toContain("table");
  });

  it("shows them once the extensions are registered", () => {
    const available = ids(
      itemsFor(["imagePlaceholder", "videoPlaceholder", "table"])
    );
    expect(available).toEqual(
      expect.arrayContaining(["image", "video", "table"])
    );
  });

  it("keeps custom items ahead of the defaults", () => {
    const custom = {
      id: "callout",
      title: "Callout",
      description: "Custom block",
      keywords: ["callout"],
      command: () => undefined,
    };

    const suggestion = getSlashCommandSuggestion([custom]);
    const result = suggestion.items!({
      editor: fakeEditor([]),
      query: "call",
      range: { from: 0, to: 0 },
    } as never) as SlashCommandSuggestionItem[];

    expect(ids(result)).toEqual(["callout"]);
  });

  it("filters by keyword prefix", () => {
    expect(ids(itemsFor([], "h"))).toEqual(["h1", "h2", "h3"]);
    expect(ids(itemsFor([], "quo"))).toEqual(["blockquote"]);
  });

  it("returns nothing for an unknown query", () => {
    expect(itemsFor([], "zzz")).toEqual([]);
  });
});
