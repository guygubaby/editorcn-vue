import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { afterEach, describe, expect, it } from "vitest";

import { Table } from "./index";

const editors: Editor[] = [];

const createEditor = (content: string) => {
  const editor = new Editor({
    content,
    extensions: [
      StarterKit.configure({ codeBlock: false, gapcursor: false, link: false }),
      Table,
    ],
  });
  editors.push(editor);
  return editor;
};

const tableRows = (editor: Editor): string[][] => {
  const rows: string[][] = [];
  editor.state.doc.descendants((node) => {
    if (node.type.name === "tableRow") {
      const cells: string[] = [];
      node.forEach((cell) => {
        cells.push(cell.textContent);
      });
      rows.push(cells);
    }
    return true;
  });
  return rows;
};

const CONTENT = `
<table>
  <tbody>
    <tr><th>A</th><th>B</th><th>C</th></tr>
    <tr><td>1</td><td>2</td><td>3</td></tr>
    <tr><td>4</td><td>5</td><td>6</td></tr>
  </tbody>
</table>`;

afterEach(() => {
  while (editors.length > 0) {
    editors.pop()?.destroy();
  }
});

describe("table commands", () => {
  it("moves a column and keeps the other columns in order", () => {
    const editor = createEditor(CONTENT);

    expect(editor.commands.moveColumn(0, 2)).toBe(true);

    expect(tableRows(editor)).toEqual([
      ["B", "C", "A"],
      ["2", "3", "1"],
      ["5", "6", "4"],
    ]);
  });

  it("moves a row and keeps its cells intact", () => {
    const editor = createEditor(CONTENT);

    expect(editor.commands.moveRow(0, 2)).toBe(true);

    expect(tableRows(editor)).toEqual([
      ["1", "2", "3"],
      ["4", "5", "6"],
      ["A", "B", "C"],
    ]);
  });

  it("refuses no-op moves", () => {
    const editor = createEditor(CONTENT);
    const before = tableRows(editor);

    expect(editor.commands.moveColumn(1, 1)).toBe(false);
    expect(editor.commands.moveRow(0, 0)).toBe(false);
    expect(tableRows(editor)).toEqual(before);
  });

  it("clamps out-of-range targets instead of throwing", () => {
    const editor = createEditor(CONTENT);

    expect(editor.commands.moveColumn(0, 99)).toBe(true);
    expect(tableRows(editor)[0]).toEqual(["B", "C", "A"]);
  });

  it("moves the table under the cursor when there are two", () => {
    const editor = createEditor(`
<p>first</p>
<table><tbody><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></tr></tbody></table>
<p>second</p>
<table><tbody><tr><th>X</th><th>Y</th></tr><tr><td>7</td><td>8</td></tr></tbody></table>
`);

    // Put the cursor inside the second table's first cell.
    let secondTablePos = -1;
    let index = 0;
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === "table") {
        index += 1;
        if (index === 2) {
          secondTablePos = pos;
        }
      }
      return true;
    });
    editor.commands.setTextSelection(secondTablePos + 3);

    expect(editor.commands.moveColumn(0, 1)).toBe(true);

    const tables: string[][][] = [];
    editor.state.doc.descendants((node) => {
      if (node.type.name === "table") {
        const rows: string[][] = [];
        node.forEach((row) => {
          const cells: string[] = [];
          row.forEach((cell) => cells.push(cell.textContent));
          rows.push(cells);
        });
        tables.push(rows);
      }
      return true;
    });

    expect(tables[0]).toEqual([
      ["A", "B"],
      ["1", "2"],
    ]);
    expect(tables[1]).toEqual([
      ["Y", "X"],
      ["8", "7"],
    ]);
  });

  it("does nothing when the cursor is not inside a table", () => {
    const editor = createEditor(`<p>paragraph</p>${CONTENT}`);
    editor.commands.setTextSelection(2);

    expect(editor.commands.moveColumn(0, 1)).toBe(false);
  });
});
