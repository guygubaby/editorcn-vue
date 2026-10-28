import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";

import "./docs.css";
import "../../../packages/editorcn-vue/src/editor/style.css";
import "../../../packages/editorcn-vue/src/block-editor/style.css";
import "../../../packages/editorcn-vue/src/extensions/ui/style.css";
import "../../../packages/editorcn-vue/src/extensions/table/style.css";
import "../../../packages/editorcn-vue/src/extensions/image-placeholder/style.css";
import "../../../packages/editorcn-vue/src/extensions/video/style.css";
import "../../../packages/editorcn-vue/src/static-renderer/style.css";

import DemoRichText from "./demos/demo-rich-text.vue";
import DemoVariants from "./demos/demo-variants.vue";
import DemoBlockEditor from "./demos/demo-block-editor.vue";
import DemoTable from "./demos/demo-table.vue";
import DemoMedia from "./demos/demo-media.vue";
import DemoStatic from "./demos/demo-static.vue";
import DemoTheming from "./demos/demo-theming.vue";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("DemoRichText", DemoRichText);
    app.component("DemoVariants", DemoVariants);
    app.component("DemoBlockEditor", DemoBlockEditor);
    app.component("DemoTable", DemoTable);
    app.component("DemoMedia", DemoMedia);
    app.component("DemoStatic", DemoStatic);
    app.component("DemoTheming", DemoTheming);
  },
} satisfies Theme;
