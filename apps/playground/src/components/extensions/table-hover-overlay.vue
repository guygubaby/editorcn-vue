<script setup lang="ts">
import type { ChainedCommands } from "@tiptap/core";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  MoreHorizontal,
  MoreVertical,
  Plus,
  Trash2,
} from "@lucide/vue";
import type { Editor } from "@tiptap/vue-3";
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";

import { useToolbar, useToolbarEditor } from "./core-context";
import { extensionPresent } from "./core-utils";
import DropdownMenu from "./ui-dropdown-menu.vue";

const props = defineProps<{ class?: string; editor?: Editor | null }>();

const { labels } = useToolbar();
const editor = useToolbarEditor(() => props.editor);

interface Box {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
}

interface TableColumnLayout {
  left: number;
  width: number;
}

interface TableRowLayout {
  height: number;
  top: number;
}

interface OverlayLayout {
  clippedBottom: boolean;
  clippedRight: boolean;
  columns: TableColumnLayout[];
  offset: { left: number; top: number };
  rows: TableRowLayout[];
  table: Box;
  visible: { height: number; width: number };
}

const GRIP_INSET = 9;
const ADD_SIZE = 20;
const ADD_GAP = 6;

const toBox = (
  left: number,
  top: number,
  right: number,
  bottom: number
): Box => ({
  bottom,
  height: bottom - top,
  left,
  right,
  top,
  width: right - left,
});

const intersect = (a: Box, b: Box): Box =>
  toBox(
    Math.max(a.left, b.left),
    Math.max(a.top, b.top),
    Math.min(a.right, b.right),
    Math.min(a.bottom, b.bottom)
  );

const isCollapsed = (box: Box): boolean => box.width <= 0 || box.height <= 0;

const clientBox = (node: HTMLElement): Box => {
  const r = node.getBoundingClientRect();
  const left = r.left + node.clientLeft;
  const top = r.top + node.clientTop;
  return toBox(left, top, left + node.clientWidth, top + node.clientHeight);
};

const visibleBounds = (dom: HTMLElement): Box | null => {
  let bounds: Box | null = null;
  for (let node: HTMLElement | null = dom; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.overflowX === "visible" && style.overflowY === "visible") {
      continue;
    }
    const box = clientBox(node);
    bounds = bounds ? intersect(bounds, box) : box;
    if (isCollapsed(bounds)) {
      return null;
    }
  }
  if (bounds) {
    return bounds;
  }
  const r = dom.getBoundingClientRect();
  return toBox(r.left, r.top, r.right, r.bottom);
};

const fitCenter = (
  start: number,
  size: number,
  from: number,
  to: number
): number | null => {
  const visibleFrom = Math.max(start, from);
  const visibleTo = Math.min(start + size, to);
  if (visibleTo - visibleFrom <= 0) {
    return null;
  }
  const min = from + GRIP_INSET;
  const max = Math.max(min, to - GRIP_INSET);
  return Math.min(Math.max((visibleFrom + visibleTo) / 2, min), max);
};

const fitEdge = (value: number, from: number, to: number): number => {
  const min = from + GRIP_INSET;
  const max = Math.max(min, to - GRIP_INSET);
  return Math.min(Math.max(value, min), max);
};

const cellChildren = (row: Element): HTMLElement[] =>
  [...row.children].filter(
    (cell) => cell.tagName === "TD" || cell.tagName === "TH"
  ) as HTMLElement[];

const measureLayout = (
  anchor: HTMLElement,
  dom: HTMLElement,
  table: HTMLElement
): OverlayLayout | null => {
  const visible = visibleBounds(dom);
  if (!visible || !table.isConnected) {
    return null;
  }

  const tRect = table.getBoundingClientRect();
  const tableBox = toBox(tRect.left, tRect.top, tRect.right, tRect.bottom);
  let tableBounds = intersect(tableBox, visible);

  const scroller = table.closest(".tableWrapper") as HTMLElement | null;
  if (scroller) {
    const sBox = clientBox(scroller);
    tableBounds = intersect(
      tableBounds,
      toBox(sBox.left, tableBounds.top, sBox.right, tableBounds.bottom)
    );
  }

  if (isCollapsed(tableBounds)) {
    return null;
  }

  const anchorRect = anchor.getBoundingClientRect();
  const rowElements = [...table.querySelectorAll("tr")];
  let widestCells: HTMLElement[] = [];
  for (const rowEl of rowElements) {
    const cells = cellChildren(rowEl);
    if (cells.length > widestCells.length) {
      widestCells = cells;
    }
  }

  const originX = visible.left;
  const originY = visible.top;

  return {
    clippedBottom: tableBox.bottom > tableBounds.bottom + 1,
    clippedRight: tableBox.right > tableBounds.right + 1,
    columns: widestCells.map((cell) => {
      const r = cell.getBoundingClientRect();
      return { left: r.left - originX, width: r.width };
    }),
    offset: {
      left: visible.left - anchorRect.left,
      top: visible.top - anchorRect.top,
    },
    rows: rowElements.map((rowEl) => {
      const r = rowEl.getBoundingClientRect();
      return { height: r.height, top: r.top - originY };
    }),
    table: toBox(
      tableBounds.left - originX,
      tableBounds.top - originY,
      tableBounds.right - originX,
      tableBounds.bottom - originY
    ),
    visible: { height: visible.height, width: visible.width },
  };
};

const anchorRef = ref<HTMLElement | null>(null);
const layout = ref<OverlayLayout | null>(null);
const hoveredCol = ref<number | null>(null);
const hoveredRow = ref<number | null>(null);
const colMenuOpen = ref(false);
const rowMenuOpen = ref(false);

let activeTable: HTMLElement | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;
let frame = 0;

const isEditable = computed(() => editor.value?.isEditable ?? false);
const hasTable = computed(() =>
  editor.value ? extensionPresent(editor.value, "table") : false
);
const isActive = computed(
  () => hoveredCol.value !== null || hoveredRow.value !== null
);

const scheduleHide = () => {
  hideTimer = setTimeout(() => {
    activeTable = null;
    hoveredCol.value = null;
    hoveredRow.value = null;
    colMenuOpen.value = false;
    rowMenuOpen.value = false;
  }, 200);
};

const cancelHide = () => {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
};

const recompute = () => {
  const table = activeTable;
  const anchor = anchorRef.value;
  const dom = editor.value?.view.dom as HTMLElement | undefined;
  layout.value = table && anchor && dom ? measureLayout(anchor, dom, table) : null;
};

const column = computed(() => {
  if (hoveredCol.value === null) {
    return undefined;
  }
  return layout.value?.columns[hoveredCol.value];
});

const row = computed(() => {
  if (hoveredRow.value === null) {
    return undefined;
  }
  return layout.value?.rows[hoveredRow.value];
});

const colCenter = computed(() => {
  const col = column.value;
  const l = layout.value;
  if (!col || !l) {
    return null;
  }
  return fitCenter(col.left, col.width, 0, l.visible.width);
});

const rowCenter = computed(() => {
  const r = row.value;
  const l = layout.value;
  if (!r || !l) {
    return null;
  }
  return fitCenter(r.top, r.height, 0, l.visible.height);
});

const colTop = computed(() => {
  const l = layout.value;
  return l ? fitEdge(l.table.top, 0, l.visible.height) : 0;
});

const rowLeft = computed(() => {
  const l = layout.value;
  return l ? fitEdge(l.table.left, 0, l.visible.width) : 0;
});

const showColumn = computed(() => {
  const l = layout.value;
  return Boolean(
    l &&
      colCenter.value !== null &&
      hoveredCol.value === l.columns.length - 1 &&
      !l.clippedRight &&
      l.table.right + ADD_GAP + ADD_SIZE <= l.visible.width
  );
});

const showRow = computed(() => {
  const l = layout.value;
  return Boolean(
    l &&
      rowCenter.value !== null &&
      hoveredRow.value === l.rows.length - 1 &&
      !l.clippedBottom &&
      l.table.bottom + ADD_GAP + ADD_SIZE <= l.visible.height
  );
});

const clipStyle = computed(() => {
  const l = layout.value;
  if (!l) {
    return undefined;
  }
  return {
    height: `${l.visible.height}px`,
    left: `${l.offset.left}px`,
    top: `${l.offset.top}px`,
    width: `${l.visible.width}px`,
  };
});

const addColumnStyle = computed(() => {
  const l = layout.value;
  if (!l) {
    return undefined;
  }
  return {
    cursor: "col-resize",
    height: `${l.table.height}px`,
    left: `${l.table.right + ADD_GAP}px`,
    top: `${l.table.top}px`,
    width: `${ADD_SIZE}px`,
  };
});

const addRowStyle = computed(() => {
  const l = layout.value;
  if (!l) {
    return undefined;
  }
  return {
    cursor: "row-resize",
    height: `${ADD_SIZE}px`,
    left: `${l.table.left}px`,
    top: `${l.table.bottom + ADD_GAP}px`,
    width: `${l.table.width}px`,
  };
});

const cellAt = (rowIdx: number, colIdx: number): HTMLElement | undefined => {
  if (!activeTable) {
    return undefined;
  }
  const rowEl = activeTable.querySelectorAll("tr")[rowIdx];
  const cell = rowEl?.children[colIdx] as HTMLElement | undefined;
  return cell?.tagName === "TD" || cell?.tagName === "TH" ? cell : undefined;
};

const cellPos = (cell: HTMLElement): number | null => {
  const current = editor.value;
  if (!current || current.isDestroyed) {
    return null;
  }
  const pos = current.view.posAtDOM(cell, 0, 0);
  return pos ?? null;
};

const runCellOp = (
  cell: HTMLElement | undefined,
  op: (chain: ChainedCommands) => ChainedCommands
) => {
  const current = editor.value;
  if (!current || current.isDestroyed || cell === undefined) {
    return;
  }
  const pos = cellPos(cell);
  if (pos === null) {
    return;
  }
  op(current.chain().focus().setTextSelection(pos)).run();
};

const runColumnOp = (op: (chain: ChainedCommands) => ChainedCommands) => {
  runCellOp(cellAt(0, hoveredCol.value ?? 0), op);
};

const runRowOp = (op: (chain: ChainedCommands) => ChainedCommands) => {
  runCellOp(cellAt(hoveredRow.value ?? 0, 0), op);
};

const handleOver = (event: PointerEvent) => {
  const current = editor.value;
  if (!current || current.isDestroyed) {
    return;
  }
  const dom = current.view.dom as HTMLElement;
  const target = event.target as HTMLElement;
  if (!dom.contains(target)) {
    return;
  }
  const tableWrapper = target.closest(".tableWrapper") as HTMLElement | null;
  if (!tableWrapper) {
    scheduleHide();
    return;
  }

  cancelHide();

  const cell = target.closest("td, th") as HTMLElement | undefined;
  const table = cell?.closest("table") as HTMLElement | undefined;
  if (!cell || !table) {
    if (activeTable && !tableWrapper.contains(activeTable)) {
      scheduleHide();
    }
    return;
  }

  activeTable = table;

  const rowEl = cell.parentElement;
  const allRows = [...table.querySelectorAll("tr")];
  const colIdx = rowEl ? [...rowEl.children].indexOf(cell) : -1;
  const rowIdx = rowEl ? allRows.indexOf(rowEl as HTMLTableRowElement) : -1;

  if (colIdx >= 0) {
    hoveredCol.value = colIdx;
  }
  if (rowIdx >= 0) {
    hoveredRow.value = rowIdx;
  }

  recompute();
};

const handleLeave = (event: PointerEvent) => {
  if (event.pointerType !== "mouse") {
    return;
  }
  const related = event.relatedTarget as HTMLElement | null;
  if (
    related &&
    (anchorRef.value?.contains(related) ||
      (related instanceof HTMLElement &&
        Boolean(related.closest("[data-ext-floating]"))))
  ) {
    cancelHide();
    return;
  }
  scheduleHide();
};

const handleOverlayOver = () => cancelHide();

// Remember what was actually bound: re-reading the refs in detach() would
// target the new elements and leak listeners on the old ones.
let boundDom: HTMLElement | null = null;
let boundAnchor: HTMLElement | null = null;

const attach = () => {
  detach();
  boundDom = (editor.value?.view.dom as HTMLElement | undefined) ?? null;
  boundAnchor = anchorRef.value;
  boundDom?.addEventListener("pointerover", handleOver);
  boundDom?.addEventListener("pointerleave", handleLeave);
  boundAnchor?.addEventListener("pointerover", handleOverlayOver);
};

const detach = () => {
  boundDom?.removeEventListener("pointerover", handleOver);
  boundDom?.removeEventListener("pointerleave", handleLeave);
  boundAnchor?.removeEventListener("pointerover", handleOverlayOver);
  boundDom = null;
  boundAnchor = null;
};

watch(() => editor.value, attach);

// The overlay measures every frame, which is only worth doing while the
// pointer is over a row or column; stop the loop otherwise.
watch(isActive, (active) => {
  cancelAnimationFrame(frame);
  if (!active) {
    return;
  }
  const loop = () => {
    recompute();
    frame = requestAnimationFrame(loop);
  };
  frame = requestAnimationFrame(loop);
});

onMounted(() => {
  attach();
});

onBeforeUnmount(() => {
  detach();
  cancelAnimationFrame(frame);
  if (hideTimer) {
    clearTimeout(hideTimer);
  }
});
</script>

<template>
  <div
    v-if="hasTable && isEditable"
    ref="anchorRef"
    :class="['ext-table-overlay', props.class]"
  >
    <div v-if="layout" class="ext-table-clip" :style="clipStyle">
      <div
        v-if="colCenter !== null"
        class="ext-table-control ext-table-control--column"
        :style="{
          left: `${colCenter}px`,
          top: `${colTop}px`,
          transform: 'translate(-50%, -50%)',
        }"
      >
        <DropdownMenu
          :open="colMenuOpen"
          side="bottom"
          @update:open="colMenuOpen = $event"
        >
          <template #trigger>
            <button
              type="button"
              :aria-label="labels.columnActions"
              class="ext-table-grip"
              :data-state="colMenuOpen ? 'open' : 'closed'"
            >
              <span
                class="ext-table-grip-stroke ext-table-grip-stroke--column"
                aria-hidden="true"
              />
              <MoreHorizontal />
            </button>
          </template>
          <button
            type="button"
            role="menuitem"
            data-dropdown-item
            class="ext-dropdown-item"
            @click="runColumnOp((c) => c.addColumnBefore())"
          >
            <ArrowLeft />
            {{ labels.addColumnLeft }}
          </button>
          <button
            type="button"
            role="menuitem"
            data-dropdown-item
            class="ext-dropdown-item"
            @click="runColumnOp((c) => c.addColumnAfter())"
          >
            <ArrowRight />
            {{ labels.addColumnRight }}
          </button>
          <div class="ext-dropdown-separator" />
          <button
            type="button"
            role="menuitem"
            data-dropdown-item
            class="ext-dropdown-item ext-dropdown-item--danger"
            @click="runColumnOp((c) => c.deleteColumn())"
          >
            <Trash2 />
            {{ labels.deleteColumn }}
          </button>
        </DropdownMenu>
      </div>

      <div
        v-if="rowCenter !== null"
        class="ext-table-control ext-table-control--row"
        :style="{
          left: `${rowLeft}px`,
          top: `${rowCenter}px`,
          transform: 'translate(-50%, -50%)',
        }"
      >
        <DropdownMenu
          :open="rowMenuOpen"
          side="right"
          @update:open="rowMenuOpen = $event"
        >
          <template #trigger>
            <button
              type="button"
              :aria-label="labels.rowActions"
              class="ext-table-grip ext-table-grip--row"
              :data-state="rowMenuOpen ? 'open' : 'closed'"
            >
              <span
                class="ext-table-grip-stroke ext-table-grip-stroke--row"
                aria-hidden="true"
              />
              <MoreVertical />
            </button>
          </template>
          <button
            type="button"
            role="menuitem"
            data-dropdown-item
            class="ext-dropdown-item"
            @click="runRowOp((c) => c.addRowBefore())"
          >
            <ArrowUp />
            {{ labels.addRowAbove }}
          </button>
          <button
            type="button"
            role="menuitem"
            data-dropdown-item
            class="ext-dropdown-item"
            @click="runRowOp((c) => c.addRowAfter())"
          >
            <ArrowDown />
            {{ labels.addRowBelow }}
          </button>
          <div class="ext-dropdown-separator" />
          <button
            type="button"
            role="menuitem"
            data-dropdown-item
            class="ext-dropdown-item ext-dropdown-item--danger"
            @click="runRowOp((c) => c.deleteRow())"
          >
            <Trash2 />
            {{ labels.deleteRow }}
          </button>
        </DropdownMenu>
      </div>

      <button
        v-if="showColumn"
        type="button"
        :aria-label="labels.addColumnRight"
        class="ext-table-add"
        :style="addColumnStyle"
        :title="labels.addColumnRight"
        @keydown.enter.prevent="runColumnOp((c) => c.addColumnAfter())"
        @keydown.space.prevent="runColumnOp((c) => c.addColumnAfter())"
        @click="runColumnOp((c) => c.addColumnAfter())"
      >
        <Plus />
      </button>

      <button
        v-if="showRow"
        type="button"
        :aria-label="labels.addRowBelow"
        class="ext-table-add"
        :style="addRowStyle"
        :title="labels.addRowBelow"
        @keydown.enter.prevent="runRowOp((c) => c.addRowAfter())"
        @keydown.space.prevent="runRowOp((c) => c.addRowAfter())"
        @click="runRowOp((c) => c.addRowAfter())"
      >
        <Plus />
      </button>
    </div>
  </div>
</template>
