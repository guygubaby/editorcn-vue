<script setup lang="ts">
import {
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from "reka-ui";
import { ref } from "vue";

type Pill = { height: number; left: number; top: number; width: number };

const props = withDefaults(
  defineProps<{
    open?: boolean;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
    sideOffset?: number;
    contentClass?: string;
    role?: string;
  }>(),
  { open: false, side: "bottom", align: "center", sideOffset: 4 }
);

const emit = defineEmits<{ "update:open": [open: boolean] }>();

const pill = ref<Pill | null>(null);

const enter = (target: EventTarget | null) => {
  const item = (target as HTMLElement | null)?.closest?.(
    "[data-dropdown-item]"
  ) as HTMLElement | null;
  if (!item) {
    return;
  }
  pill.value = {
    height: item.offsetHeight,
    left: item.offsetLeft,
    top: item.offsetTop,
    width: item.offsetWidth,
  };
};
</script>

<template>
  <PopoverRoot :open="open" @update:open="emit('update:open', $event)">
    <PopoverTrigger as-child>
      <slot name="trigger" />
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        :side="props.side"
        :align="props.align"
        :side-offset="props.sideOffset"
        :class="['rte', 'ext-popover-content', props.contentClass]"
        :role="props.role"
        data-ext-floating
        @mouseover="enter($event.target)"
        @focus="enter($event.target)"
        @mouseleave="pill = null"
      >
        <div
          aria-hidden="true"
          :class="[
            'ext-dropdown-pill',
            pill && 'ext-dropdown-pill--visible',
          ]"
          :style="pill ?? undefined"
        />
        <slot />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
