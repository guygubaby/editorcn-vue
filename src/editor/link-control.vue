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
import { toggleVariants } from "./ui/toggle";
import { cn } from "./utils";

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
        :class="cn(toggleVariants({ size: 'sm' }), 'rte-control-button p-0')"
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
        class="z-50 w-72 rounded-none bg-popover p-3 text-xs text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
      >
        <div class="rte-link-editor">
          <input
            v-model="url"
            type="url"
            :placeholder="labels.linkEditorInputPlaceholder"
            :aria-label="labels.linkEditorInputLabel"
            class="rte-link-editor-input flex h-8 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            @keydown.enter.prevent="handleSave"
          />
          <button
            type="button"
            class="rte-link-editor-save inline-flex h-8 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
            @click="handleSave"
          >
            {{ labels.linkEditorSave }}
          </button>
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
