<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3";
import { computed, nextTick, ref } from "vue";

import { useEditorState } from "../../editor/composables";
import { useBlockEditorContext } from "../context";
import Dropdown from "./dropdown.vue";

const props = defineProps<{ editor: Editor }>();

const { icons } = useBlockEditorContext();
const open = ref(false);
const url = ref("");
const inputRef = ref<HTMLInputElement | null>(null);

const state = useEditorState(
  () => props.editor,
  (editor) => ({
    isLink: editor?.isActive("link") ?? false,
    linkUrl: (editor?.getAttributes("link").href as string) || "",
  })
);

const isLink = computed(() => state.value.isLink);

const toggle = async () => {
  open.value = !open.value;
  if (open.value) {
    url.value = state.value.linkUrl;
    await nextTick();
    inputRef.value?.focus();
  }
};

const handleSubmit = () => {
  let href = url.value.trim();
  if (!href) {
    return;
  }
  if (!/^https?:\/\//i.test(href)) {
    href = `https://${href}`;
  }
  props.editor
    .chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href })
    .run();
  open.value = false;
};

const handleUnlink = () => {
  props.editor.chain().focus().unsetLink().run();
  open.value = false;
};
</script>

<template>
  <div class="rte-anchored">
    <button
      type="button"
      :class="[
        'block-editor-bubble-btn',
        isLink && 'block-editor-bubble-btn--active',
      ]"
      aria-label="Link"
      title="Link"
      @mousedown.prevent
      @click="toggle"
    >
      <component :is="icons.linkIcon" />
    </button>

    <template v-if="open">
      <div
        role="presentation"
        class="block-editor-bubble-overlay"
        @click="open = false"
        @keydown="($event.key === 'Escape') && (open = false)"
      />
      <Dropdown style="left: auto; min-width: 220px; right: 0">
        <form class="block-editor-link-form" @submit.prevent="handleSubmit">
          <input
            ref="inputRef"
            v-model="url"
            type="text"
            class="block-editor-link-input"
            placeholder="Paste a link..."
          />
          <div class="block-editor-link-actions">
            <button
              v-if="isLink"
              type="button"
              data-dropdown-item
              class="block-editor-bubble-dropdown-item block-editor-bubble-dropdown-item--danger justify-center"
              @mousedown.prevent
              @click="handleUnlink"
            >
              <span class="block-editor-bubble-dropdown-icon">
                <component :is="icons.unlinkIcon" />
              </span>
              <span>Remove</span>
            </button>
            <button
              type="submit"
              data-dropdown-item
              class="block-editor-bubble-dropdown-item justify-center"
            >
              <span class="block-editor-bubble-dropdown-icon">
                <component :is="icons.checkIcon" />
              </span>
              <span>{{ isLink ? "Update" : "Add" }}</span>
            </button>
          </div>
        </form>
      </Dropdown>
    </template>
  </div>
</template>
