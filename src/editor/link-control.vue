<script setup lang="ts">
import {
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from "reka-ui";
import { onMounted, onUnmounted, ref, watch } from "vue";

import { useEditorState } from "./composables";
import { useRichTextEditorContext } from "./context";

const { editor, labels, icons } = useRichTextEditorContext();

const url = ref("");
const open = ref(false);

const active = useEditorState(editor, (current) =>
  current ? current.isActive("link") : false
);

watch(open, (isOpen) => {
  if (isOpen) {
    url.value = editor.value?.getAttributes("link").href || "";
  } else {
    url.value = "";
  }
});

const handleSave = () => {
  const current = editor.value;
  if (!current || current.isDestroyed) {
    return;
  }
  if (url.value === "") {
    current.chain().focus().extendMarkRange("link").unsetLink().run();
  } else {
    current
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.value })
      .run();
  }
  open.value = false;
  url.value = "";
};

const handleEditLink = () => {
  open.value = true;
};

onMounted(() => window.addEventListener("edit-link", handleEditLink));
onUnmounted(() => window.removeEventListener("edit-link", handleEditLink));
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child>
      <button
        type="button"
        class="rte-control-button"
        :data-state="active ? 'on' : 'off'"
        :aria-pressed="active"
        :aria-label="labels.linkControlLabel"
        :title="labels.linkControlLabel"
        @mousedown.prevent
      >
        <component :is="icons.linkControlIcon" class="rte-editor-icon" />
      </button>
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        side="bottom"
        :side-offset="4"
        class="rte-link-popover"
      >
        <div class="rte-link-editor">
          <input
            v-model="url"
            type="url"
            :placeholder="labels.linkEditorInputPlaceholder"
            :aria-label="labels.linkEditorInputLabel"
            class="rte-link-editor-input"
            @keydown.enter.prevent="handleSave"
          />
          <button
            type="button"
            class="rte-link-editor-save"
            @click="handleSave"
          >
            {{ labels.linkEditorSave }}
          </button>
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
