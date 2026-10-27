<script setup lang="ts">
import { Link, Upload, Video } from "@lucide/vue";
import { NodeViewWrapper, nodeViewProps } from "@tiptap/vue-3";
import { computed, ref, useId } from "vue";

import { useToolbar } from "../core/context";
import { isValidUrl } from "../core/utils";
import type { UploadResult } from "../upload";
import Popover from "../ui/popover.vue";
import type { VideoPlaceholderOptions } from "./index";

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

const options = () => props.extension.options as VideoPlaceholderOptions;

const insertVideo = (result: UploadResult) => {
  const pos = props.getPos();
  if (
    typeof pos !== "number" ||
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
      {
        attrs: {
          height: result.height ?? null,
          poster: result.poster ?? null,
          src: result.src,
          width: result.width ?? "100%",
        },
        type: "video",
      }
    )
    .run();
};

const handleAcceptedFiles = async (files: File[]) => {
  const file = files[0];
  if (!file) {
    return;
  }
  uploading.value = true;
  uploadError.value = null;
  try {
    const upload = options().upload;
    if (!upload) {
      throw new Error("No upload handler configured");
    }
    insertVideo(await upload(file, "video"));
    options().onDrop?.(files, props.editor);
  } catch (error) {
    uploadError.value =
      error instanceof Error ? error.message : "Upload failed";
    options().onDropRejected?.(files, props.editor);
  } finally {
    uploading.value = false;
  }
};

const handleFileInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  handleAcceptedFiles([...(input.files ?? [])]);
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

  const files = [...(event.dataTransfer?.files ?? [])];
  if (files.length === 0) {
    return;
  }

  const current = options();
  const accepted = files.filter((file) => {
    const mimeTypes = current.allowedMimeTypes;
    const tooLarge = Boolean(current.maxSize) && file.size > current.maxSize!;
    const matches = mimeTypes
      ? Object.keys(mimeTypes).some((type) => file.type.match(type))
      : true;
    return matches && !tooLarge;
  });
  const rejected = files.filter((file) => !accepted.includes(file));

  if (rejected.length > 0) {
    isDragReject.value = true;
    current.onDropRejected?.(rejected, props.editor);
  }
  if (accepted.length > 0) {
    handleAcceptedFiles(accepted);
  }
};

const handleInsertEmbed = () => {
  if (!isValidUrl(url.value)) {
    urlError.value = true;
    return;
  }
  insertVideo({ src: url.value });
  options().onEmbed?.(url.value, props.editor);
};

const mimeTypeList = computed(() =>
  Object.keys(options().allowedMimeTypes ?? { "video/*": ["video/*"] }).join(
    ","
  )
);
</script>

<template>
  <NodeViewWrapper class="ext-image-placeholder ext-video-placeholder">
    <Popover
      v-model:open="open"
      content-class="ext-image-placeholder-popover"
    >
      <template #trigger>
        <button
          type="button"
          :aria-label="labels.videoPlaceholder"
          :class="[
            'ext-image-placeholder-trigger',
            props.selected && 'ext-image-placeholder-trigger--selected',
          ]"
        >
          <Video />
          {{ labels.videoPlaceholder }}
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
            Video link
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
              placeholder="Paste the video link..."
              @input="urlError = false"
            />
            <p v-if="urlError" class="ext-image-error">
              Please enter a valid URL
            </p>
            <button type="submit" class="ext-btn ext-image-embed-submit">
              Embed video
            </button>
            <p class="ext-image-hint">MP4, WebM or any direct video URL</p>
          </form>
        </div>
      </div>
    </Popover>
  </NodeViewWrapper>
</template>
