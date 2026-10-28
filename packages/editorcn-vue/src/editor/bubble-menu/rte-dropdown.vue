<script setup lang="ts">
import { onMounted, ref } from "vue";

type Pill = { height: number; left: number; top: number; width: number };

const props = withDefaults(
  defineProps<{ variant?: "default" | "language" | "color" }>(),
  { variant: "default" }
);

defineOptions({ inheritAttrs: false });

const pill = ref<Pill | null>(null);
const root = ref<HTMLElement | null>(null);
const alignEnd = ref(false);
const above = ref(false);

// The dropdown is anchored to its trigger with `left: 0`. Flip it to the
// trigger's right edge / above when it would leave the viewport.
onMounted(() => {
  const el = root.value;
  const anchor = el?.parentElement;
  if (!el || !anchor) {
    return;
  }
  const pad = 8;
  const rect = anchor.getBoundingClientRect();
  const width = el.offsetWidth;
  const height = el.offsetHeight;
  alignEnd.value = rect.left + width > window.innerWidth - pad;
  above.value =
    rect.bottom + 4 + height > window.innerHeight - pad &&
    rect.top - 4 - height >= pad;
});

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
    ref="root"
    :class="[
      'rte-bubble-dropdown',
      variantClass[props.variant],
      alignEnd && 'rte-bubble-dropdown--end',
      above && 'rte-bubble-dropdown--above',
      $attrs.class,
    ]"
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
