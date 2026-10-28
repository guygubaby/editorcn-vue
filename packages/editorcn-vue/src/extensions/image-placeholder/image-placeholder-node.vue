<script setup lang="ts">
import { Image, Link, Upload } from "@lucide/vue";
import { NodeViewWrapper, nodeViewProps } from "@tiptap/vue-3";
import { computed, ref, useId } from "vue";

import { useToolbar } from "../core/context";
import { isValidUrl } from "../core/utils";
import type { ImagePlaceholderOptions } from "./index";
import type { UploadResult } from "../upload";
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
const uploading = ref(false);
const uploadError = ref<string | null>(null);

const options = () => props.extension.options as ImagePlaceholderOptions;

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result as string));
    reader.addEventListener("error", () =>
      reject(reader.error ?? new Error("Could not read file"))
    );
    reader.readAsDataURL(file);
  });

const insertImages = (results: UploadResult[]) => {
  const pos = props.getPos();
  if (typeof pos !== "number" || results.length === 0) {
    return;
  }
  // The placeholder may have moved while the upload was in flight, so the
  // current position is read at insert time and the node is matched by identity.
  if (
    props.editor.isDestroyed ||
    props.editor.state.doc.nodeAt(pos)?.type.name !== props.node.type.name
  ) {
    return;
  }
  props.editor
    .chain()
    .focus()
    .insertContentAt(
      { from: pos, to: pos + props.node.nodeSize },
      results.map((result) => ({
        attrs: {
          alt: result.alt ?? null,
          height: result.height ?? null,
          src: result.src,
          width: result.width ?? "60%",
        },
        type: "image",
      }))
    )
    .run();
};

const handleAcceptedFiles = async (files: File[]) => {
  if (files.length === 0) {
    return;
  }
  const limit = options().maxFiles;
  const tooMany = Boolean(limit) && files.length > limit!;
  const accepted = tooMany ? files.slice(0, limit) : files;
  if (tooMany) {
    options().onDropRejected?.(files.slice(limit), props.editor);
  }
  files = accepted;
  uploading.value = true;
  uploadError.value = null;
  try {
    const upload = options().upload;
    const results = upload
      ? await Promise.all(files.map((file) => upload(file, "image")))
      : await Promise.all(
          files.map(async (file) => ({ src: await readAsDataUrl(file) }))
        );
    insertImages(results);
    options().onDrop?.(files, props.editor);
  } catch (error) {
    uploadError.value =
      error instanceof Error ? error.message : "Upload failed";
    options().onDropRejected?.(files, props.editor);
  } finally {
    uploading.value = false;
  }
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

  const current = options();
  const accepted: File[] = [];
  const rejected: File[] = [];

  for (const file of files) {
    const mimeTypes = current.allowedMimeTypes;
    const tooLarge = Boolean(current.maxSize) && file.size > current.maxSize!;

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
    current.onDropRejected?.(rejected, props.editor);
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
  insertImages([{ src: url.value }]);
  options().onEmbed?.(url.value, props.editor);
};

const mimeTypeList = computed(() =>
  Object.keys(options().allowedMimeTypes ?? { "image/*": ["image/*"] }).join(
    ","
  )
);

const multiple = computed(() => options().maxFiles !== 1);
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
              :disabled="uploading"
              class="ext-sr-only"
              @change="handleFileInputChange"
            />
            <label
              :for="fileInputId"
              class="ext-image-upload-label"
              :style="uploading ? 'pointer-events: none; opacity: 0.6' : ''"
            >
              <Upload />
              {{
                uploading ? "Uploading…" : "Drag & drop or click to upload"
              }}
            </label>
            <p v-if="uploadError" class="ext-image-error">{{ uploadError }}</p>
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
