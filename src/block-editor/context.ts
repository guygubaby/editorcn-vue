import { inject } from "vue";
import type { InjectionKey } from "vue";

import type { BlockEditorContextValue } from "./types";

export const blockEditorKey: InjectionKey<BlockEditorContextValue> =
  Symbol("BlockEditor");

export const useBlockEditorContext = (): BlockEditorContextValue => {
  const context = inject(blockEditorKey, null);
  if (!context) {
    throw new Error("BlockEditor components must be used within <BlockEditor>");
  }
  return context;
};
