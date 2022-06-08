import { keyboardModifierUseMeta } from "./runtime-env";

export const MODIFIER_KEYS_NONE = Object.freeze<ModifierKeys>({});

export interface ModifierKeys {
  ctrlMetaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}

export interface MouseEventModifierKeys {
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
}
export function getModifiers(e: MouseEventModifierKeys): ModifierKeys {
  const { ctrlKey, altKey, shiftKey, metaKey } = e;
  return {
    // Mac reserves ctrl for system use, apps use meta.
    ctrlMetaKey: keyboardModifierUseMeta ? metaKey : ctrlKey,
    altKey,
    shiftKey,
  };
}

export function isModifierPressed(event: React.MouseEvent<any>) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}
