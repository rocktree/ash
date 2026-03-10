import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import type { EditResult, EditorProps } from './types';
import { applyBold, applyEnter, applyItalic, applyShiftTab, applyTab } from './keymap';
import { useUndoHistory } from './useUndoHistory';

// useLayoutEffect is synchronous and prevents cursor flicker, but SSR will warn.
// Fall back to useEffect during server rendering.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(function Editor(
  {
    value,
    onChange,
    tabSize = 2,
    placeholder = 'Start writing...',
    onKeyDown: userOnKeyDown,
    onPaste: userOnPaste,
    readOnly,
    disabled,
    wrapperClassName,
    ...rest
  },
  forwardedRef,
) {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const pendingSelection = useRef<{ start: number; end: number } | null>(null);
  const history = useUndoHistory(value);
  const pasteFlag = useRef(false);

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
      const el = internalRef.current;
      if (el) {
        // Commit the pre-shortcut state so it can be undone to
        history.commit({
          value: el.value,
          selectionStart: el.selectionStart,
          selectionEnd: el.selectionEnd,
        });
        // Immediately commit the post-shortcut state as its own undo group
        history.commit({
          value: result.value,
          selectionStart: result.selectionStart,
          selectionEnd: result.selectionEnd,
        });
      }
      pendingSelection.current = { start: result.selectionStart, end: result.selectionEnd };
      onChange(result.value);
      return true;
    },
    [onChange, history],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const el = internalRef.current;
      if (!el) return;

      // When read-only or disabled, skip all shortcut handling and let the
      // event (and the consumer's handler) pass through unchanged.
      if (readOnly || disabled) {
        userOnKeyDown?.(e);
        return;
      }

      const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
      const mod = isMac ? e.metaKey : e.ctrlKey;
      const state = {
        value: el.value,
        selectionStart: el.selectionStart,
        selectionEnd: el.selectionEnd,
      };

      if (mod && !e.altKey) {
        if (!e.shiftKey && e.key === 'z') {
          e.preventDefault();
          const current = {
            value: el.value,
            selectionStart: el.selectionStart,
            selectionEnd: el.selectionEnd,
          };
          const prev = history.undo(current);
          if (prev) {
            pendingSelection.current = { start: prev.selectionStart, end: prev.selectionEnd };
            onChange(prev.value);
          }
          userOnKeyDown?.(e);
          return;
        }
        if (e.shiftKey && e.key === 'z') {
          e.preventDefault();
          const next = history.redo();
          if (next) {
            pendingSelection.current = { start: next.selectionStart, end: next.selectionEnd };
            onChange(next.value);
          }
          userOnKeyDown?.(e);
          return;
        }
      }

      if (mod && !e.shiftKey && !e.altKey) {
        if (e.key === 'b') apply(applyBold(state), e);
        else if (e.key === 'i') apply(applyItalic(state), e);
      } else if (e.key === 'Tab') {
        apply(e.shiftKey ? applyShiftTab(state, tabSize) : applyTab(state, tabSize), e);
      } else if (e.key === 'Enter' && !mod && !e.shiftKey && !e.altKey) {
        apply(applyEnter(state), e);
      }

      // Always call the consumer's handler, even when Ash handled the shortcut.
      // The event will have `defaultPrevented === true` when Ash acted on it.
      userOnKeyDown?.(e);
    },
    [apply, history, onChange, tabSize, userOnKeyDown, readOnly, disabled],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      onChange(newValue);
      if (pasteFlag.current) {
        pasteFlag.current = false;
        // Commit the post-paste state immediately as its own undo group
        const el = internalRef.current;
        history.commit({
          value: newValue,
          selectionStart: el?.selectionStart ?? 0,
          selectionEnd: el?.selectionEnd ?? 0,
        });
      } else {
        // Debounce regular typing into history groups
        history.scheduleCommit(() => ({
          value: internalRef.current?.value ?? newValue,
          selectionStart: internalRef.current?.selectionStart ?? 0,
          selectionEnd: internalRef.current?.selectionEnd ?? 0,
        }));
      }
    },
    [onChange, history],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const el = internalRef.current;
      if (!el) return;
      // Commit the pre-paste state immediately so paste becomes its own undo group
      history.commit({
        value: el.value,
        selectionStart: el.selectionStart,
        selectionEnd: el.selectionEnd,
      });
      pasteFlag.current = true;
      userOnPaste?.(e);
    },
    [history, userOnPaste],
  );

  return (
    <div className={wrapperClassName} data-ash-wrapper>
      <textarea
        ref={setRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        spellCheck={false}
        {...rest}
      />
    </div>
  );
});
