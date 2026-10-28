<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";

import { DEFAULT_ICONS } from "../icons";
import type { SlashCommandSuggestionItem } from "./slash-command";

const props = defineProps<{
  items: SlashCommandSuggestionItem[];
  command: (item: SlashCommandSuggestionItem) => void;
}>();

const selectedIndex = ref(0);
const searchQuery = ref("");
const listRef = ref<HTMLElement | null>(null);

const filteredItems = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return props.items.filter(
    (item) =>
      item.title.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
  );
});

watch(
  [() => filteredItems.value.length, searchQuery],
  () => {
    selectedIndex.value = 0;
  },
  { flush: "sync" }
);

watch(selectedIndex, async () => {
  await nextTick();
  const element = listRef.value?.children[selectedIndex.value] as
    | HTMLElement
    | undefined;
  element?.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

const selectItem = (index: number) => {
  const item = filteredItems.value[index];
  if (item) {
    props.command(item);
  }
};

const upHandler = () => {
  const length = filteredItems.value.length;
  if (!length) {
    return;
  }
  selectedIndex.value = (selectedIndex.value + length - 1) % length;
};

const downHandler = () => {
  const length = filteredItems.value.length;
  if (!length) {
    return;
  }
  selectedIndex.value = (selectedIndex.value + 1) % length;
};

const enterHandler = () => selectItem(selectedIndex.value);

const onKeyDown = ({ event }: { event: KeyboardEvent }) => {
  if (event.key === "ArrowUp") {
    upHandler();
    return true;
  }
  if (event.key === "ArrowDown") {
    downHandler();
    return true;
  }
  if (event.key === "Enter") {
    enterHandler();
    return true;
  }
  return false;
};

defineExpose({ onKeyDown });
</script>

<template>
  <div class="rte block-editor-slash-menu">
    <div class="block-editor-slash-menu-search">
      <span class="block-editor-slash-menu-search-icon">
        <component :is="DEFAULT_ICONS.searchIcon" class="block-editor-slash-menu-search-svg" />
      </span>
      <input
        v-model="searchQuery"
        class="block-editor-slash-menu-search-input"
        placeholder="Search commands..."
        @keydown.up.prevent="upHandler"
        @keydown.down.prevent="downHandler"
        @keydown.enter.prevent="enterHandler"
      />
    </div>

    <div ref="listRef" class="block-editor-slash-menu-list">
      <template v-if="filteredItems.length > 0">
        <button
          v-for="(item, index) in filteredItems"
          :key="item.id"
          type="button"
          :class="[
            'block-editor-slash-menu-item',
            index === selectedIndex && 'block-editor-slash-menu-item--selected',
          ]"
          @mouseenter="selectedIndex = index"
          @click="selectItem(index)"
        >
          <div class="block-editor-slash-menu-item-icon">
            <component
              :is="item.icon ?? DEFAULT_ICONS.fallbackIcon"
              class="size-4"
            />
          </div>
          <div class="block-editor-slash-menu-item-content">
            <span class="block-editor-slash-menu-item-label">{{
              item.title
            }}</span>
            <span v-if="item.description" class="block-editor-slash-menu-item-desc">
              {{ item.description }}
            </span>
          </div>
        </button>
      </template>
      <div v-else class="block-editor-slash-menu-empty">
        No results for "{{ searchQuery }}"
      </div>
    </div>
  </div>
</template>
