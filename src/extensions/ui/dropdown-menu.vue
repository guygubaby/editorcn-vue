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
    side?: "bottom" | "right";
    contentClass?: string;
  }>(),
  { open: false, side: "bottom" }
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
        :align="props.side === 'right' ? 'center' : 'start'"
        :side-offset="4"
        role="menu"
        data-ext-floating
        :class="['rte', 'ext-dropdown-content', props.contentClass]"
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
