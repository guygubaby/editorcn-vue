<script setup lang="ts">
import { Image, Link, Upload } from "@lucide/vue";
import { NodeViewWrapper, nodeViewProps } from "@tiptap/vue-3";
import { computed, ref, useId } from "vue";

import { useToolbar } from "../core/context";
import { isValidUrl } from "../core/utils";
import Popover from "../ui/popover.vue";

const props = defineProps(nodeViewProps);

const { labels } = useToolbar();
const fileInputId = useId();

const open = ref(false);
const tab = ref<"upload" | "url">("upload");
const url = ref("");
const urlError = ref(false);
const isDragActive = ref(false);
const isDragReject = ref(false);

const replaceWithImage = (src: string) => {
  const pos = props.getPos();
  if (typeof pos !== "number") {
    return;
  }
  props.editor
    .chain()
    .focus()
    .insertContentAt(
      { from: pos, to: pos + props.node.nodeSize },
      { attrs: { src, width: "60%" }, type: "image" }
    )
    .run();
};

const handleAcceptedFiles = (files: File[]) => {
  for (const file of files) {
    const reader = new FileReader();
    reader.addEventListener("load", () =>
      replaceWithImage(reader.result as string)
    );
    reader.readAsDataURL(file);
  }
  const options = props.extension.options;
  options.onDrop?.(files, props.editor);
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
};

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  isDragActive.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  isDragActive.value = false;
  isDragReject.value = false;
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  event.stopPropagation();
  isDragActive.value = false;
  isDragReject.value = false;

  const files = event.dataTransfer?.files;
  if (!files) {
    return;
  }

  const options = props.extension.options;
  const accepted: File[] = [];
  const rejected: File[] = [];

  for (const file of files) {
    const mimeTypes = options.allowedMimeTypes as
      | Record<string, string[]>
      | undefined;
    const tooLarge = Boolean(options.maxSize) && file.size > options.maxSize!;

    if (
      mimeTypes &&
      !Object.keys(mimeTypes).some((type) => file.type.match(type))
    ) {
      rejected.push(file);
    } else if (tooLarge) {
      rejected.push(file);
    } else {
      accepted.push(file);
    }
  }

  if (rejected.length > 0) {
    isDragReject.value = true;
    options.onDropRejected?.(rejected, props.editor);
  }

  if (accepted.length > 0) {
    handleAcceptedFiles(accepted);
  }
};

const handleFileInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  handleAcceptedFiles([...(input.files ?? [])]);
};

const handleInsertEmbed = () => {
  if (!isValidUrl(url.value)) {
    urlError.value = true;
    return;
  }
  replaceWithImage(url.value);
  props.extension.options.onEmbed?.(url.value, props.editor);
};

const mimeTypeList = computed(() =>
  Object.keys(
    (props.extension.options.allowedMimeTypes as
      | Record<string, string[]>
      | undefined) ?? { "image/*": ["image/*"] }
  ).join(",")
);

const multiple = computed(() => props.extension.options.maxFiles !== 1);
</script>

<template>
  <NodeViewWrapper class="ext-image-placeholder">
    <Popover
      v-model:open="open"
      content-class="ext-image-placeholder-popover"
    >
      <template #trigger>
        <button
          type="button"
          :aria-label="labels.imagePlaceholder"
          :class="[
            'ext-image-placeholder-trigger',
            props.selected && 'ext-image-placeholder-trigger--selected',
          ]"
        >
          <Image />
          {{ labels.imagePlaceholder }}
        </button>
      </template>

      <div class="ext-tabs">
        <div class="ext-tabs-list" role="tablist">
          <button
            type="button"
            role="tab"
            :aria-selected="tab === 'upload'"
            :class="[
              'ext-tabs-trigger',
              tab === 'upload' && 'ext-tabs-trigger--active',
            ]"
            @click="tab = 'upload'"
          >
            <Upload />
            Upload
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="tab === 'url'"
            :class="[
              'ext-tabs-trigger',
              tab === 'url' && 'ext-tabs-trigger--active',
            ]"
            @click="tab = 'url'"
          >
            <Link />
            Embed link
          </button>
        </div>

        <div v-if="tab === 'upload'" class="ext-tabs-content" role="tabpanel">
          <div
            :class="[
              'ext-image-upload-zone',
              isDragActive && 'ext-image-upload-zone--dragging',
              isDragReject && 'ext-image-upload-zone--reject',
            ]"
            @dragenter="handleDragEnter"
            @dragleave="handleDragLeave"
            @dragover="handleDragOver"
            @drop="handleDrop"
          >
            <input
              :id="fileInputId"
              type="file"
              :accept="mimeTypeList"
              :multiple="multiple"
              class="ext-sr-only"
              @change="handleFileInputChange"
            />
            <label :for="fileInputId" class="ext-image-upload-label">
              <Upload />
              Drag &amp; drop or click to upload
            </label>
          </div>
        </div>

        <div v-else class="ext-tabs-content" role="tabpanel">
          <form class="ext-image-embed" @submit.prevent="handleInsertEmbed">
            <input
              v-model="url"
              class="ext-input"
              placeholder="Paste the image link..."
              @input="urlError = false"
            />
            <p v-if="urlError" class="ext-image-error">
              Please enter a valid URL
            </p>
            <button type="submit" class="ext-btn ext-image-embed-submit">
              Embed Image
            </button>
            <p class="ext-image-hint">Works with any image from the web</p>
          </form>
        </div>
      </div>
    </Popover>
  </NodeViewWrapper>
</template>
