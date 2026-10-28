<script setup lang="ts">
import { ref } from "vue";

type Pill = { height: number; left: number; top: number; width: number };

const props = withDefaults(
  defineProps<{ align?: "default" | "align" | "language" }>(),
  { align: "default" }
);

defineOptions({ inheritAttrs: false });

const pill = ref<Pill | null>(null);

const alignClass: Record<string, string> = {
  align: "block-editor-bubble-dropdown--align",
  default: "",
  language: "block-editor-bubble-dropdown--language",
};

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
  <div
    v-bind="$attrs"
    :class="['block-editor-bubble-dropdown', alignClass[props.align]]"
    @mouseover="enter($event.target)"
    @focus="enter($event.target)"
    @mouseleave="pill = null"
  >
    <div
      aria-hidden="true"
      :class="[
        'block-editor-bubble-dropdown-pill',
        pill && 'block-editor-bubble-dropdown-pill--visible',
      ]"
      :style="pill ?? undefined"
    />
    <slot />
  </div>
</template>
