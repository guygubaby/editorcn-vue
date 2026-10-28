<script setup lang="ts">
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Copy,
  Maximize2,
  MoreHorizontal,
  Trash2,
} from "@lucide/vue";
import { NodeViewContent, NodeViewWrapper, nodeViewProps } from "@tiptap/vue-3";
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import type { ComponentPublicInstance } from "vue";

import DropdownMenu from "../ui/dropdown-menu.vue";

const props = defineProps(nodeViewProps);

const nodeRef = ref<Element | ComponentPublicInstance | null>(null);
const imageRef = ref<HTMLImageElement | null>(null);

const resizing = ref(false);
const resizingPosition = ref<"left" | "right">("left");
const resizeInitialWidth = ref(0);
const resizeInitialMouseX = ref(0);
const openedMore = ref(false);
const actionBarRect = ref<{ top: number; right: number } | null>(null);

let frame = 0;

const nodeElement = (): HTMLElement | null => {
  const value = nodeRef.value;
  if (value instanceof HTMLElement) {
    return value;
  }
  const el = (value as ComponentPublicInstance | null)?.$el;
  return el instanceof HTMLElement ? el : null;
};

const trackActionBar = () => {
  cancelAnimationFrame(frame);
  if (!props.selected || resizing.value) {
    return;
  }
  const loop = () => {
    const el = nodeElement();
    if (el) {
      const rect = el.getBoundingClientRect();
      actionBarRect.value = { right: rect.right, top: rect.bottom + 12 };
    }
    frame = requestAnimationFrame(loop);
  };
  frame = requestAnimationFrame(loop);
};

watch(
  () => [props.selected, resizing.value],
  () => trackActionBar()
);

const resize = (event: MouseEvent) => {
  if (!resizing.value) {
    return;
  }
  let dx = event.clientX - resizeInitialMouseX.value;
  if (resizingPosition.value === "left") {
    dx = resizeInitialMouseX.value - event.clientX;
  }
  const newWidth = Math.max(resizeInitialWidth.value + dx, 150);
  const parentWidth = nodeElement()?.parentElement?.offsetWidth || 0;
  if (newWidth < parentWidth) {
    // Store px so the value is unambiguous across string/number transitions.
    props.updateAttributes({ width: `${newWidth}px` });
  }
};

const endResize = () => {
  resizing.value = false;
  resizeInitialMouseX.value = 0;
  resizeInitialWidth.value = 0;
};

const handleTouchMove = (event: TouchEvent) => {
  if (!resizing.value) {
    return;
  }
  const touch = event.touches.item(0);
  if (!touch) {
    return;
  }
  let dx = touch.clientX - resizeInitialMouseX.value;
  if (resizingPosition.value === "left") {
    dx = resizeInitialMouseX.value - touch.clientX;
  }
  const newWidth = Math.max(resizeInitialWidth.value + dx, 150);
  const parentWidth = nodeElement()?.parentElement?.offsetWidth || 0;
  if (newWidth < parentWidth) {
    props.updateAttributes({ width: `${newWidth}px` });
  }
};

const startResize = (position: "left" | "right", clientX: number) => {
  resizing.value = true;
  resizingPosition.value = position;
  resizeInitialMouseX.value = clientX;
  if (imageRef.value) {
    resizeInitialWidth.value = imageRef.value.offsetWidth;
  }
};

const handleMouseDown = (position: "left" | "right", event: MouseEvent) => {
  event.preventDefault();
  startResize(position, event.clientX);
};

const handleTouchStart = (position: "left" | "right", event: TouchEvent) => {
  event.preventDefault();
  const touch = event.touches.item(0);
  if (!touch) {
    return;
  }
  startResize(position, touch.clientX);
};

const duplicate = () => {
  const pos = props.getPos();
  if (typeof pos !== "number" || props.editor.isDestroyed) {
    return;
  }
  props.editor
    .chain()
    .focus()
    .insertContentAt(pos + props.node.nodeSize, props.node.toJSON())
    .run();
};

const viewClass = computed(() =>
  [
    "ext-image-view",
    props.node.attrs.align === "left" ? "ext-image-view--left" : "",
    props.node.attrs.align === "center" ? "ext-image-view--center" : "",
    props.node.attrs.align === "right" ? "ext-image-view--right" : "",
    props.selected ? "ext-image-view--selected" : "",
    resizing.value ? "ext-image-view--resizing" : "",
  ]
    .filter(Boolean)
    .join(" ")
);

const actionBarStyle = computed(() => {
  const rect = actionBarRect.value;
  if (!rect) {
    return undefined;
  }
  return {
    right: `${window.innerWidth - rect.right}px`,
    top: `${rect.top}px`,
  };
});

onMounted(() => {
  window.addEventListener("mousemove", resize);
  window.addEventListener("mouseup", endResize);
  window.addEventListener("touchmove", handleTouchMove);
  window.addEventListener("touchend", endResize);
  trackActionBar();
});

onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  window.removeEventListener("mousemove", resize);
  window.removeEventListener("mouseup", endResize);
  window.removeEventListener("touchmove", handleTouchMove);
  window.removeEventListener("touchend", endResize);
});
</script>

<template>
  <NodeViewWrapper
    ref="nodeRef"
    :class="viewClass"
    :style="{ width: props.node.attrs.width }"
  >
    <img
      ref="imageRef"
      class="ext-image-view-img"
      :src="props.node.attrs.src"
      :alt="props.node.attrs.alt"
      :title="props.node.attrs.title"
      :style="{ objectFit: props.node.attrs.objectFit ?? 'contain' }"
    />
    <NodeViewContent
      v-if="props.node.attrs.title"
      class="ext-image-view-caption"
      >{{ props.node.attrs.title }}</NodeViewContent
    >

    <template v-if="props.editor?.isEditable">
      <div
        class="ext-image-resize ext-image-resize--left"
        @mousedown="handleMouseDown('left', $event)"
        @touchstart="handleTouchStart('left', $event)"
      >
        <div class="ext-image-resize-bar" />
      </div>
      <div
        class="ext-image-resize ext-image-resize--right"
        @mousedown="handleMouseDown('right', $event)"
        @touchstart="handleTouchStart('right', $event)"
      >
        <div class="ext-image-resize-bar" />
      </div>
    </template>
  </NodeViewWrapper>

  <Teleport v-if="props.editor?.isEditable && props.selected && actionBarRect && !resizing" to="body">
    <div class="rte ext-image-actions ext-image-actions--floating" :style="actionBarStyle">
      <button
        type="button"
        class="ext-btn ext-image-action-btn"
        aria-label="Align left"
        :data-state="props.node.attrs.align === 'left' ? 'on' : 'off'"
        :aria-pressed="props.node.attrs.align === 'left'"
        @click="props.updateAttributes({ align: 'left' })"
      >
        <AlignLeft />
      </button>
      <button
        type="button"
        class="ext-btn ext-image-action-btn"
        aria-label="Align center"
        :data-state="props.node.attrs.align === 'center' ? 'on' : 'off'"
        :aria-pressed="props.node.attrs.align === 'center'"
        @click="props.updateAttributes({ align: 'center' })"
      >
        <AlignCenter />
      </button>
      <button
        type="button"
        class="ext-btn ext-image-action-btn"
        aria-label="Align right"
        :data-state="props.node.attrs.align === 'right' ? 'on' : 'off'"
        :aria-pressed="props.node.attrs.align === 'right'"
        @click="props.updateAttributes({ align: 'right' })"
      >
        <AlignRight />
      </button>
      <div class="ext-separator ext-separator--vertical" />
      <DropdownMenu
        v-model:open="openedMore"
        content-class="ext-image-more-content"
      >
        <template #trigger>
          <button
            type="button"
            class="ext-btn ext-image-action-btn"
            aria-label="Image options"
          >
            <MoreHorizontal />
          </button>
        </template>
        <button
          type="button"
          role="menuitem"
          data-dropdown-item
          class="ext-dropdown-item"
          @click="duplicate"
        >
          <Copy />
          Duplicate
        </button>
        <button
          type="button"
          role="menuitem"
          data-dropdown-item
          class="ext-dropdown-item"
          @click="props.updateAttributes({ width: 'fit-content' })"
        >
          <Maximize2 />
          Full width
        </button>
        <div class="ext-dropdown-separator" />
        <button
          type="button"
          role="menuitem"
          data-dropdown-item
          class="ext-dropdown-item ext-dropdown-item--danger"
          @click="
            () => {
              openedMore = false;
              props.deleteNode();
            }
          "
        >
          <Trash2 />
          Delete image
        </button>
      </DropdownMenu>
    </div>
  </Teleport>
</template>
