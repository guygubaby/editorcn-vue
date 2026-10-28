import type { Editor } from "@tiptap/vue-3";
import { computed, shallowRef, toValue, watch } from "vue";
import type { ComputedRef, MaybeRefOrGetter } from "vue";

/**
 * Bumps on every editor transaction so selectors can re-evaluate.
 * Vue has no `useEditorState`, so reactivity is driven by the editor events.
 */
export const useEditorVersion = (
  editor: MaybeRefOrGetter<Editor | null | undefined>
) => {
  const version = shallowRef(0);
  const bump = () => {
    version.value += 1;
  };

  watch(
    () => toValue(editor),
    (current, _previous, onCleanup) => {
      if (!current || current.isDestroyed) {
        return;
      }
      current.on("transaction", bump);
      current.on("selectionUpdate", bump);
      current.on("update", bump);
      current.on("destroy", bump);
      bump();
      onCleanup(() => {
        current.off("transaction", bump);
        current.off("selectionUpdate", bump);
        current.off("update", bump);
        current.off("destroy", bump);
      });
    },
    { immediate: true }
  );

  return version;
};

export const useEditorState = <T>(
  editor: MaybeRefOrGetter<Editor | null | undefined>,
  selector: (editor: Editor | null) => T
): ComputedRef<T> => {
  const version = useEditorVersion(editor);
  return computed(() => {
    // touched so the computed re-runs on every editor transaction
    version.value;
    const current = toValue(editor);
    return selector(current && !current.isDestroyed ? current : null);
  });
};

export const shallowEqual = <T extends Record<string, unknown>>(
  a: T,
  b: T
): boolean => {
  if (a === b) {
    return true;
  }
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) {
    return false;
  }
  return ak.every((k) => a[k] === b[k]);
};
