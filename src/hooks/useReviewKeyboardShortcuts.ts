import { useEffect, useCallback } from "react";

type ReviewShortcutHandlers = {
  onApprove: () => void;
  onEdit: () => void;
  onReject: () => void;
  onNext: () => void;
  onPrevious: () => void;
};

/**
 * Keyboard shortcut hook for Review Studio per Section 65.
 *
 * A → Approve
 * E → Edit
 * R → Reject
 * J → Next review item
 * K → Previous review item
 *
 * Shortcuts are automatically disabled when focus is inside a text input,
 * textarea, select, or contenteditable element.
 */
export function useReviewKeyboardShortcuts(
  handlers: ReviewShortcutHandlers,
  enabled: boolean = true
) {
  const isTypingTarget = (el: EventTarget | null): boolean => {
    if (!el || !(el instanceof HTMLElement)) return false;
    const tag = el.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return true;
    if (el.isContentEditable) return true;
    return false;
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;
      // Never fire when modifier keys are held (browser/OS shortcuts)
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      // Never fire while typing
      if (isTypingTarget(document.activeElement)) return;

      switch (e.key.toLowerCase()) {
        case "a":
          e.preventDefault();
          handlers.onApprove();
          break;
        case "e":
          e.preventDefault();
          handlers.onEdit();
          break;
        case "r":
          e.preventDefault();
          handlers.onReject();
          break;
        case "j":
          e.preventDefault();
          handlers.onNext();
          break;
        case "k":
          e.preventDefault();
          handlers.onPrevious();
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled, handlers.onApprove, handlers.onEdit, handlers.onReject, handlers.onNext, handlers.onPrevious]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
