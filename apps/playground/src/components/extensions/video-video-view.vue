<script setup lang="ts">
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Check,
  Copy,
  Maximize2,
  MoreHorizontal,
  Trash2,
} from "@lucide/vue";
import { NodeViewWrapper, nodeViewProps } from "@tiptap/vue-3";
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import type { ComponentPublicInstance } from "vue";

import DropdownMenu from "./ui-dropdown-menu.vue";

const props = defineProps(nodeViewProps);

const nodeRef = ref<Element | ComponentPublicInstance | null>(null);
const openedFit = ref(false);
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
  if (!props.selected) {
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
  () => props.selected,
  () => trackActionBar()
);

const attrs = computed(() => props.node.attrs);

const viewStyle = computed(() => {
  const width = attrs.value.width ?? "100%";
  const height = attrs.value.height;
  return {
    width: typeof width === "number" ? `${width}px` : width,
    ...(height
      ? { height: typeof height === "number" ? `${height}px` : height }
      : {}),
  };
});

const videoStyle = computed(() => ({
  objectFit: attrs.value.objectFit ?? "cover",
}));

const viewClass = computed(() =>
  [
    "ext-video-view",
    `ext-video-view--${attrs.value.align ?? "center"}`,
    props.selected ? "ext-video-view--selected" : "",
  ].join(" ")
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

const update = (patch: Record<string, unknown>) =>
  props.updateAttributes(patch);

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

const fits = [
  { label: "Contain", value: "contain" },
  { label: "Cover", value: "cover" },
  { label: "Fill", value: "fill" },
];

onMounted(() => trackActionBar());
onBeforeUnmount(() => cancelAnimationFrame(frame));
</script>

<template>
  <NodeViewWrapper
    ref="nodeRef"
    :class="viewClass"
    :style="viewStyle"
    data-drag-handle
  >
    <video
      class="ext-video-element"
      :src="attrs.src"
      :poster="attrs.poster ?? undefined"
      :style="videoStyle"
      :controls="attrs.controls"
      :autoplay="attrs.autoplay"
      :loop="attrs.loop"
      :muted="attrs.muted"
      :playsinline="attrs.playsInline"
      :preload="attrs.preload ?? 'metadata'"
    />
  </NodeViewWrapper>

  <Teleport
    v-if="props.editor?.isEditable && props.selected && actionBarRect"
    to="body"
  >
    <div
      class="rte ext-image-actions ext-image-actions--floating"
      :style="actionBarStyle"
    >
      <button
        type="button"
        class="ext-btn ext-image-action-btn"
        aria-label="Align left"
        :data-state="attrs.align === 'left' ? 'on' : 'off'"
        :aria-pressed="attrs.align === 'left'"
        @click="update({ align: 'left' })"
      >
        <AlignLeft />
      </button>
      <button
        type="button"
        class="ext-btn ext-image-action-btn"
        aria-label="Align center"
        :data-state="attrs.align === 'center' ? 'on' : 'off'"
        :aria-pressed="attrs.align === 'center'"
        @click="update({ align: 'center' })"
      >
        <AlignCenter />
      </button>
      <button
        type="button"
        class="ext-btn ext-image-action-btn"
        aria-label="Align right"
        :data-state="attrs.align === 'right' ? 'on' : 'off'"
        :aria-pressed="attrs.align === 'right'"
        @click="update({ align: 'right' })"
      >
        <AlignRight />
      </button>

      <div class="ext-separator ext-separator--vertical" />

      <DropdownMenu v-model:open="openedFit" content-class="ext-image-more-content">
        <template #trigger>
          <button
            type="button"
            class="ext-btn ext-image-action-btn"
            aria-label="Object fit"
            :title="`Object fit: ${attrs.objectFit}`"
          >
            <Maximize2 />
          </button>
        </template>
        <button
          v-for="fit in fits"
          :key="fit.value"
          type="button"
          role="menuitem"
          data-dropdown-item
          class="ext-dropdown-item"
          @click="
            () => {
              update({ objectFit: fit.value });
              openedFit = false;
            }
          "
        >
          <span class="ext-dropdown-label">{{ fit.label }}</span>
          <Check v-if="attrs.objectFit === fit.value" />
        </button>
      </DropdownMenu>

      <DropdownMenu
        v-model:open="openedMore"
        content-class="ext-image-more-content"
      >
        <template #trigger>
          <button
            type="button"
            class="ext-btn ext-image-action-btn"
            aria-label="Video options"
          >
            <MoreHorizontal />
          </button>
        </template>
        <button
          type="button"
          role="menuitem"
          data-dropdown-item
          class="ext-dropdown-item"
          @click="update({ loop: !attrs.loop })"
        >
          <span class="ext-dropdown-label">Loop</span>
          <Check v-if="attrs.loop" />
        </button>
        <button
          type="button"
          role="menuitem"
          data-dropdown-item
          class="ext-dropdown-item"
          @click="update({ autoplay: !attrs.autoplay })"
        >
          <span class="ext-dropdown-label">Autoplay</span>
          <Check v-if="attrs.autoplay" />
        </button>
        <button
          type="button"
          role="menuitem"
          data-dropdown-item
          class="ext-dropdown-item"
          @click="update({ muted: !attrs.muted })"
        >
          <span class="ext-dropdown-label">Muted</span>
          <Check v-if="attrs.muted" />
        </button>
        <button
          type="button"
          role="menuitem"
          data-dropdown-item
          class="ext-dropdown-item"
          @click="update({ controls: !attrs.controls })"
        >
          <span class="ext-dropdown-label">Controls</span>
          <Check v-if="attrs.controls" />
        </button>
        <div class="ext-dropdown-separator" />
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
          Delete video
        </button>
      </DropdownMenu>
    </div>
  </Teleport>
</template>
