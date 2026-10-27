<script setup lang="ts">
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { useEditor } from "@tiptap/vue-3";

import { RichTextEditor, CodeBlock, Link } from "../../../../src/editor";
import {
  ImagePlaceholder,
  ImagePlaceholderToolbar,
  MediaUpload,
  ResizableImage,
  Video,
  VideoPlaceholder,
  VideoToolbar,
} from "../../../../src/extensions";
import { demoUpload, placeholder } from "./base";

const content = `
<h2>Images and video</h2>
<p>Click a block, drop a file on it, or paste a URL. Uploads in this demo use an object URL — nothing leaves the page. Embed a featured image and a video below.</p>
<p></p>
<div data-type="imagePlaceholder"></div>
<p></p>
<div data-type="videoPlaceholder"></div>
<p></p>
`;

const editor = useEditor({
  content,
  extensions: [
    StarterKit.configure({ codeBlock: false, gapcursor: false, link: false }),
    Link,
    CodeBlock,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    TextStyle,
    Color,
    placeholder("Drop an image or video anywhere…"),
    ImagePlaceholder.configure({ upload: demoUpload }),
    ResizableImage,
    Video,
    VideoPlaceholder.configure({ upload: demoUpload }),
    MediaUpload.configure({ upload: demoUpload, maxSize: 20 * 1024 * 1024 }),
  ],
});
</script>

<template>
  <div class="docs-demo">
    <RichTextEditor :editor="editor">
      <RichTextEditor.Toolbar>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.AlignLeft />
          <RichTextEditor.AlignCenter />
          <RichTextEditor.AlignRight />
        </RichTextEditor.ControlsGroup>
        <RichTextEditor.ControlsGroup>
          <ImagePlaceholderToolbar :editor="editor ?? null" />
          <VideoToolbar :editor="editor ?? null" />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>

      <RichTextEditor.Content>
        <RichTextEditor.BubbleMenu :editor="editor ?? null" />
      </RichTextEditor.Content>
    </RichTextEditor>
  </div>
</template>
