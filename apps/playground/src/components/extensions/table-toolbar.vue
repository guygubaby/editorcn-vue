<script setup lang="ts">
import type { ChainedCommands } from "@tiptap/core";
import { Grid3x3 as GridIcon, CheckIcon } from "@lucide/vue";
import type { Editor } from "@tiptap/vue-3";
import { computed, ref } from "vue";

import { useEditorState } from "../editor/composables";
import { useToolbar, useToolbarEditor } from "./core-context";
import { extensionPresent } from "./core-utils";
import Popover from "./ui-popover.vue";

const props = defineProps<{ class?: string; editor?: Editor | null }>();

const { labels } = useToolbar();
const editor = useToolbarEditor(() => props.editor);

const GRID_INIT_SIZE = 6;
const GRID_MAX_SIZE = 10;
const GRID_DEFAULT = { cols: 1, rows: 1 };

const createRange = (length: number) =>
  Array.from({ length }, (_, index) => index + 1);

const selectionInTable = (current: Editor): boolean => {
  const { $head } = current.state.selection;
  for (let { depth } = $head; depth > 0; depth -= 1) {
    if ($head.node(depth).type.spec.tableRole === "row") {
      return true;
    }
  }
  return false;
};

const findFirstCellPos = (current: Editor): number => {
  let position = -1;
  current.state.doc.descendants((node, nodePos) => {
    if (position !== -1) {
      return false;
    }
    if (node.type.name === "tableCell" || node.type.name === "tableHeader") {
      // +1 is inside the cell, +2 lands in its first paragraph, where a
      // TextSelection endpoint is valid.
      position = nodePos + 2;
      return false;
    }
    return true;
  });
  return position;
};

const run = (
  current: Editor | null,
  operation: (chain: ChainedCommands) => ChainedCommands,
  disabled: boolean
) => {
  if (!current || current.isDestroyed || disabled) {
    return;
  }
  const chain = current.chain().focus();
  if (!selectionInTable(current)) {
    const position = findFirstCellPos(current);
    if (position !== -1) {
      chain.setTextSelection(position);
    }
  }
  operation(chain).run();
};

const open = ref(false);
const gridSize = ref({ cols: GRID_INIT_SIZE, rows: GRID_INIT_SIZE });
const selected = ref({ ...GRID_DEFAULT });
let selectedRef = { ...GRID_DEFAULT };
let activePointerId: number | null = null;

const state = useEditorState(
  editor,
  (edit) => ({
    canDeleteColumn: edit?.can().deleteColumn() ?? false,
    canDeleteRow: edit?.can().deleteRow() ?? false,
    canMerge: edit?.can().mergeCells() ?? false,
    canSplit: edit?.can().splitCell() ?? false,
    disabled: !extensionPresent(edit, "table"),
    headerOn: edit?.isActive("tableHeader") ?? false,
    inTable: edit?.isActive("table") ?? false,
  })
);

const resetGrid = () => {
  gridSize.value = { cols: GRID_INIT_SIZE, rows: GRID_INIT_SIZE };
  selectedRef = { ...GRID_DEFAULT };
  selected.value = { ...GRID_DEFAULT };
};

const selectGridSize = (rows: number, cols: number) => {
  if (rows === gridSize.value.rows && rows < GRID_MAX_SIZE) {
    gridSize.value = { ...gridSize.value, rows: gridSize.value.rows + 1 };
  }
  if (cols === gridSize.value.cols && cols < GRID_MAX_SIZE) {
    gridSize.value = { ...gridSize.value, cols: gridSize.value.cols + 1 };
  }
  const next = { cols, rows };
  selectedRef = next;
  selected.value = next;
};

const selectCell = (cell: HTMLElement): boolean => {
  const rows = Number(cell.dataset.rows);
  const cols = Number(cell.dataset.cols);
  if (Number.isNaN(rows) || Number.isNaN(cols)) {
    return false;
  }
  selectGridSize(rows, cols);
  return true;
};

const selectGridFromPointer = (event: PointerEvent): boolean => {
  const cell =
    event.target instanceof Element &&
    (event.target.closest("[data-table-grid-cell]") as HTMLElement | null);
  if (cell && (event.currentTarget as HTMLElement).contains(cell)) {
    return selectCell(cell);
  }
  const elementAtPointer = document.elementFromPoint(
    event.clientX,
    event.clientY
  );
  const fallback = elementAtPointer?.closest(
    "[data-table-grid-cell]"
  ) as HTMLElement | null;
  return fallback ? selectCell(fallback) : false;
};

const onPointerDown = (event: PointerEvent) => {
  if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) {
    return;
  }
  if (!selectGridFromPointer(event)) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  activePointerId = event.pointerId;
  try {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  } catch {
    /* pointer capture is best-effort */
  }
};

const onPointerMove = (event: PointerEvent) => {
  if (activePointerId !== null && activePointerId !== event.pointerId) {
    return;
  }
  if (activePointerId !== null) {
    event.preventDefault();
    event.stopPropagation();
  }
  selectGridFromPointer(event);
};

const onPointerUp = (event: PointerEvent) => {
  if (activePointerId !== event.pointerId) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  selectGridFromPointer(event);
  const target = event.currentTarget as HTMLElement;
  try {
    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
  } catch {
    /* pointer capture is best-effort */
  }
  activePointerId = null;
  const { rows, cols } = selectedRef;
  const current = editor.value;
  if (!current || current.isDestroyed || state.value.disabled) {
    return;
  }
  current.chain().focus().insertTable({ cols, rows, withHeaderRow: true }).run();
  open.value = false;
};

const onPointerCancel = (event: PointerEvent) => {
  if (activePointerId !== event.pointerId) {
    return;
  }
  const target = event.currentTarget as HTMLElement;
  try {
    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
  } catch {
    /* pointer capture is best-effort */
  }
  activePointerId = null;
};

const onOpenChange = (next: boolean) => {
  open.value = next;
  if (next) {
    resetGrid();
  }
};

const rowCount = computed(() => createRange(gridSize.value.rows));
const colCount = computed(() => createRange(gridSize.value.cols));

const menuLabel = (key: keyof typeof labels.value) => labels.value[key];
</script>

<template>
  <Popover
    :open="open"
    side="bottom"
    align="start"
    :side-offset="6"
    content-class="ext-table-toolbar-popover"
    @update:open="onOpenChange"
  >
    <template #trigger>
      <button
        type="button"
        :aria-label="labels.insertTable"
        :class="['ext-btn', 'ext-btn--icon-sm', props.class]"
        :data-state="state.inTable ? 'on' : 'off'"
        :aria-pressed="state.inTable"
        :disabled="state.disabled"
        :title="labels.insertTable"
      >
        <GridIcon />
      </button>
    </template>

    <div v-if="state.inTable" class="ext-table-grid" role="menu">
      <p class="ext-table-toolbar-label">{{ labels.rows }}</p>
      <button
        type="button"
        role="menuitem"
        data-dropdown-item
        class="ext-dropdown-item"
        @click="run(editor, (c) => c.addRowBefore(), state.disabled)"
      >
        {{ menuLabel("addRowAbove") }}
      </button>
      <button
        type="button"
        role="menuitem"
        data-dropdown-item
        class="ext-dropdown-item"
        @click="run(editor, (c) => c.addRowAfter(), state.disabled)"
      >
        {{ menuLabel("addRowBelow") }}
      </button>
      <button
        type="button"
        role="menuitem"
        data-dropdown-item
        class="ext-dropdown-item"
        :disabled="!state.canDeleteRow"
        @click="run(editor, (c) => c.deleteRow(), state.disabled)"
      >
        {{ menuLabel("deleteRow") }}
      </button>
      <div class="ext-separator ext-separator--horizontal" />
      <p class="ext-table-toolbar-label">{{ labels.columns }}</p>
      <button
        type="button"
        role="menuitem"
        data-dropdown-item
        class="ext-dropdown-item"
        @click="run(editor, (c) => c.addColumnBefore(), state.disabled)"
      >
        {{ menuLabel("addColumnLeft") }}
      </button>
      <button
        type="button"
        role="menuitem"
        data-dropdown-item
        class="ext-dropdown-item"
        @click="run(editor, (c) => c.addColumnAfter(), state.disabled)"
      >
        {{ menuLabel("addColumnRight") }}
      </button>
      <button
        type="button"
        role="menuitem"
        data-dropdown-item
        class="ext-dropdown-item"
        :disabled="!state.canDeleteColumn"
        @click="run(editor, (c) => c.deleteColumn(), state.disabled)"
      >
        {{ menuLabel("deleteColumn") }}
      </button>
      <div class="ext-separator ext-separator--horizontal" />
      <button
        type="button"
        role="menuitem"
        data-dropdown-item
        class="ext-dropdown-item"
        @click="run(editor, (c) => c.toggleHeaderRow(), state.disabled)"
      >
        <span class="ext-table-toolbar-item-spacer">{{ labels.headerRow }}</span>
        <CheckIcon v-if="state.headerOn" />
      </button>
      <button
        type="button"
        role="menuitem"
        data-dropdown-item
        class="ext-dropdown-item"
        :disabled="!state.canMerge"
        @click="run(editor, (c) => c.mergeCells(), state.disabled)"
      >
        {{ menuLabel("mergeCells") }}
      </button>
      <button
        type="button"
        role="menuitem"
        data-dropdown-item
        class="ext-dropdown-item"
        :disabled="!state.canSplit"
        @click="run(editor, (c) => c.splitCell(), state.disabled)"
      >
        {{ menuLabel("splitCell") }}
      </button>
      <div class="ext-separator ext-separator--horizontal" />
      <button
        type="button"
        role="menuitem"
        data-dropdown-item
        class="ext-dropdown-item ext-dropdown-item--danger"
        @click="run(editor, (c) => c.deleteTable(), state.disabled)"
      >
        {{ menuLabel("deleteTable") }}
      </button>
    </div>

    <div v-else class="ext-table-grid-popover">
      <div
        class="ext-table-grid ext-table-grid--picker"
        style="touch-action: none"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerCancel"
      >
        <div v-for="row in rowCount" :key="`table-row-${row}`" class="ext-table-grid-row">
          <div
            v-for="col in colCount"
            :key="`table-col-${col}`"
            :class="[
              'ext-table-grid-cell',
              col <= selected.cols &&
                row <= selected.rows &&
                'ext-table-grid-cell--selected',
            ]"
            :data-cols="col"
            :data-rows="row"
            data-table-grid-cell
          />
        </div>
      </div>
      <div class="ext-table-grid-result">{{ selected.rows }} x {{ selected.cols }}</div>
    </div>
  </Popover>
</template>
