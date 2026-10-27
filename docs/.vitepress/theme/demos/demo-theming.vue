<script setup lang="ts">
import { useEditor } from "@tiptap/vue-3";
import { computed, ref } from "vue";

import { RichTextEditor } from "../../../../src/editor";
import { baseExtensions, placeholder } from "./base";

// A single accent token drives the editor chrome, which is the point of the
// shadcn variable layer: swap the variables, not the components.
const palettes = {
  neutral: {},
  indigo: { "--muted": "oklch(0.95 0.03 275)", "--ring": "oklch(0.55 0.2 275)" },
  emerald: { "--muted": "oklch(0.95 0.04 160)", "--ring": "oklch(0.6 0.14 160)" },
  rose: { "--muted": "oklch(0.96 0.03 15)", "--ring": "oklch(0.6 0.19 15)" },
} as const;

const palette = ref<keyof typeof palettes>("neutral");

const style = computed(() => palettes[palette.value]);

const editor = useEditor({
  content:
    "<p>This editor only reads shadcn CSS variables. Change <code>--muted</code> and <code>--ring</code> and the chrome follows.</p><p>Select some text to see the bubble menu pick up the accent.</p>",
  extensions: [...baseExtensions, placeholder("Type…")],
});
</script>

<template>
  <div class="docs-demo">
    <div class="docs-demo-bar">
      <button
        v-for="(_, name) in palettes"
        :key="name"
        type="button"
        :aria-pressed="palette === name"
        @click="palette = name"
      >
        {{ name }}
      </button>
    </div>

    <div :style="style">
      <RichTextEditor :editor="editor">
        <RichTextEditor.Toolbar>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Code />
            <RichTextEditor.Highlight />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.BulletList />
            <RichTextEditor.Link />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>
        <RichTextEditor.Content>
          <RichTextEditor.BubbleMenu :editor="editor ?? null" />
        </RichTextEditor.Content>
      </RichTextEditor>
    </div>
  </div>
</template>
