<script setup lang="ts">
import { NodeViewWrapper, nodeViewProps } from "@tiptap/vue-3";

const props = defineProps(nodeViewProps);

const style = () => {
  const width = props.node.attrs.width ?? "100%";
  const height = props.node.attrs.height;
  return {
    width: typeof width === "number" ? `${width}px` : width,
    ...(height
      ? { height: typeof height === "number" ? `${height}px` : height }
      : {}),
  };
};
</script>

<template>
  <NodeViewWrapper
    class="ext-video-view"
    :class="props.selected && 'ext-video-view--selected'"
    :style="style()"
    data-drag-handle
  >
    <video
      class="ext-video-element"
      :src="props.node.attrs.src"
      :poster="props.node.attrs.poster ?? undefined"
      controls
      playsinline
      preload="metadata"
    />
  </NodeViewWrapper>
</template>
