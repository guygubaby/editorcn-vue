<script setup lang="ts">
import { ref } from "vue";

type Pill = { height: number; left: number; top: number; width: number };

const props = withDefaults(
  defineProps<{ variant?: "default" | "language" | "color" }>(),
  { variant: "default" }
);

defineOptions({ inheritAttrs: false });

const pill = ref<Pill | null>(null);

const variantClass: Record<string, string> = {
  color: "rte-bubble-dropdown--color",
  default: "",
  language: "rte-bubble-dropdown--language",
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
    :class="['rte-bubble-dropdown', variantClass[props.variant], $attrs.class]"
    @mouseover="enter($event.target)"
    @focus="enter($event.target)"
    @mouseleave="pill = null"
  >
    <div
      aria-hidden="true"
      :class="[
        'rte-bubble-dropdown-pill',
        pill && 'rte-bubble-dropdown-pill--visible',
      ]"
      :style="pill ?? undefined"
    />
    <slot />
  </div>
</template>
