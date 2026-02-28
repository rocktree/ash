import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import type { EditResult, EditorProps } from './types';
import { applyBold, applyEnter, applyItalic, applyShiftTab, applyTab } from './keymap';

// useLayoutEffect is synchronous and prevents cursor flicker, but SSR will warn.
// Fall back to useEffect during server rendering.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(function Editor(
  { value, onChange, tabSize = 2, onKeyDown: userOnKeyDown, ...rest },
  forwardedRef,
) {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const pendingSelection = useRef<{ start: number; end: number } | null>(null);

  // Merge forwarded ref with internal ref
  const setRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      (internalRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
      if (typeof forwardedRef === 'function') {
        forwardedRef(el);
      } else if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
      }
    },
    [forwardedRef],
  );

  // After React commits the updated value, restore cursor/selection
  useIsomorphicLayoutEffect(() => {
    const sel = pendingSelection.current;
    if (sel && internalRef.current) {
      internalRef.current.setSelectionRange(sel.start, sel.end);
      pendingSelection.current = null;
    }
  });

  const apply = useCallback(
    (result: EditResult | null, e: React.KeyboardEvent): boolean => {
      if (!result) return false;
      e.preventDefault();
      pendingSelection.current = { start: result.selectionStart, end: result.selectionEnd };
      onChange(result.value);
      return true;
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const el = internalRef.current;
      if (!el) return;

      const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
      const mod = isMac ? e.metaKey : e.ctrlKey;
      const state = {
        value: el.value,
        selectionStart: el.selectionStart,
        selectionEnd: el.selectionEnd,
      };

      if (mod && !e.shiftKey && !e.altKey) {
        if (e.key === 'b') { apply(applyBold(state), e); return; }
        if (e.key === 'i') { apply(applyItalic(state), e); return; }
      }

      if (e.key === 'Tab') {
        apply(e.shiftKey ? applyShiftTab(state, tabSize) : applyTab(state, tabSize), e);
        return;
      }

      if (e.key === 'Enter' && !mod && !e.shiftKey && !e.altKey) {
        if (apply(applyEnter(state), e)) return;
      }

      userOnKeyDown?.(e);
    },
    [apply, tabSize, userOnKeyDown],
  );

  return (
    <textarea
      ref={setRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      spellCheck={false}
      {...rest}
    />
  );
});
