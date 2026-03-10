import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import type { EditResult, EditorProps } from './types';
import {
  applyBold,
  applyEnter,
  applyItalic,
  applyLink,
  applyLinkPaste,
  applyShiftTab,
  applyTab,
} from './keymap';

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

      if (mod && !e.shiftKey && !e.altKey) {
        const key = e.key.toLowerCase();
        if (key === 'b') apply(applyBold(state), e);
        else if (key === 'i') apply(applyItalic(state), e);
        else if (key === 'k') apply(applyLink(state), e);
      } else if (e.key === 'Tab') {
        apply(e.shiftKey ? applyShiftTab(state, tabSize) : applyTab(state, tabSize), e);
      } else if (e.key === 'Enter' && !mod && !e.shiftKey && !e.altKey) {
        apply(applyEnter(state), e);
      }

      // Always call the consumer's handler, even when Ash handled the shortcut.
      // The event will have `defaultPrevented === true` when Ash acted on it.
      userOnKeyDown?.(e);
    },
    [apply, tabSize, userOnKeyDown, readOnly, disabled],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const el = internalRef.current;
      if (!el || readOnly || disabled) {
        userOnPaste?.(e);
        return;
      }

      const pastedText = e.clipboardData.getData('text');
      const state = {
        value: el.value,
        selectionStart: el.selectionStart,
        selectionEnd: el.selectionEnd,
      };
      const result = applyLinkPaste(state, pastedText);
      if (result) {
        e.preventDefault();
        pendingSelection.current = { start: result.selectionStart, end: result.selectionEnd };
        onChange(result.value);
      }
      userOnPaste?.(e);
    },
    [onChange, readOnly, disabled, userOnPaste],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange],
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
