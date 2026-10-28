import type { Editor } from "@tiptap/vue-3";
import { computed, inject, unref } from "vue";
import type { ComputedRef, InjectionKey, MaybeRefOrGetter } from "vue";

import { DEFAULT_EXTENSION_LABELS } from "./labels";
import type { ExtensionLabels } from "./labels";

export interface ToolbarContextValue {
  editor: ComputedRef<Editor | null>;
  labels: ComputedRef<ExtensionLabels>;
}

export const toolbarKey: InjectionKey<ToolbarContextValue> =
  Symbol("ExtensionToolbar");

const fallback: ToolbarContextValue = {
  editor: computed(() => null),
  labels: computed(() => DEFAULT_EXTENSION_LABELS),
};

export const useToolbar = (): ToolbarContextValue =>
  inject(toolbarKey, fallback);

export const useToolbarEditor = (
  editor: MaybeRefOrGetter<Editor | null | undefined>
): ComputedRef<Editor | null> => {
  const context = useToolbar();
  return computed(() => unref(toValueSafe(editor)) ?? context.editor.value);
};

// `unref` does not call getters; this keeps `() => props.editor` working.
const toValueSafe = <T>(value: MaybeRefOrGetter<T>): T =>
  typeof value === "function" ? (value as () => T)() : unref(value);
