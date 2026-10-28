import type { CommandProps } from "@tiptap/core";
import { Gapcursor } from "@tiptap/extension-gapcursor";
import {
  Table as TiptapTable,
  TableCell,
  TableHeader,
  TableRow,
} from "@tiptap/extension-table";
import {
  findTable,
  moveTableColumn,
  moveTableRow,
  TableMap,
} from "@tiptap/pm/tables";

export interface TableConfigOptions {
  HTMLAttributes?: Record<string, unknown>;
  defaultCols?: number;
  defaultRows?: number;
  tableCellMinWidth?: number;
  withHeaderRow?: boolean;
  resizable?: boolean;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    tableControl: {
      insertTableWithHeader: () => ReturnType;
      moveColumn: (from: number, to: number) => ReturnType;
      moveRow: (from: number, to: number) => ReturnType;
    };
  }
}

const clampIndex = (index: number, length: number): number =>
  Math.max(0, Math.min(index, length - 1));

export const Table = TiptapTable.extend<TableConfigOptions>({
  addCommands() {
    return {
      ...this.parent?.(),
      insertTableWithHeader:
        () =>
        ({ commands }: CommandProps) =>
          commands.insertTable({
            cols: this.options.defaultCols ?? 3,
            rows: this.options.defaultRows ?? 3,
            withHeaderRow: this.options.withHeaderRow ?? true,
          }),
      moveColumn:
        (from: number, to: number) =>
        ({ dispatch, state }: CommandProps) => {
          const table = findTable(state.selection.$from);
          if (!table || !Number.isInteger(from) || !Number.isInteger(to)) {
            return false;
          }

          const columnCount = TableMap.get(table.node).width;
          const source = clampIndex(from, columnCount);
          const target = clampIndex(to, columnCount);
          return moveTableColumn({ from: source, to: target, select: false })(
            state,
            dispatch
          );
        },
      moveRow:
        (from: number, to: number) =>
        ({ dispatch, state }: CommandProps) => {
          const table = findTable(state.selection.$from);
          if (!table || !Number.isInteger(from) || !Number.isInteger(to)) {
            return false;
          }

          return moveTableRow({
            from: clampIndex(from, table.node.childCount),
            to: clampIndex(to, table.node.childCount),
            select: false,
          })(state, dispatch);
        },
    };
  },
  addExtensions() {
    return [TableRow, TableCell, TableHeader, Gapcursor];
  },
  addOptions() {
    return {
      ...this.parent?.(),
      defaultCols: 3,
      defaultRows: 3,
      resizable: true,
      withHeaderRow: true,
    };
  },
});
