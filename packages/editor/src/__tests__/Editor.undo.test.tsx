import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { Editor } from '../Editor';

// Wrapper component that manages controlled state
function ControlledEditor(props: { initialValue?: string }) {
  const [value, setValue] = useState(props.initialValue ?? '');
  return (
    <Editor
      value={value}
      onChange={setValue}
      aria-label="editor"
    />
  );
}

function getTextarea() {
  return screen.getByRole('textbox') as HTMLTextAreaElement;
}

// Simulate typing into the controlled textarea (triggers React's onChange)
function type(el: HTMLTextAreaElement, value: string) {
  fireEvent.change(el, { target: { value } });
}

// Fire a keydown event on the element
function keyDown(
  el: HTMLElement,
  key: string,
  modifiers: { ctrlKey?: boolean; shiftKey?: boolean } = {},
) {
  fireEvent.keyDown(el, { key, bubbles: true, ...modifiers });
}

describe('undo (Ctrl+Z)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('undoes a committed chunk of typing', () => {
    render(<ControlledEditor initialValue="" />);
    const el = getTextarea();

    act(() => {
      type(el, 'hello world');
      vi.advanceTimersByTime(600);
    });

    expect(el.value).toBe('hello world');

    act(() => {
      keyDown(el, 'z', { ctrlKey: true });
    });

    expect(el.value).toBe('');
  });

  it('undoes back through multiple committed groups', () => {
    render(<ControlledEditor initialValue="" />);
    const el = getTextarea();

    act(() => {
      type(el, 'hello');
      vi.advanceTimersByTime(600);
    });
    act(() => {
      type(el, 'hello world');
      vi.advanceTimersByTime(600);
    });

    expect(el.value).toBe('hello world');

    act(() => {
      keyDown(el, 'z', { ctrlKey: true });
    });
    expect(el.value).toBe('hello');

    act(() => {
      keyDown(el, 'z', { ctrlKey: true });
    });
    expect(el.value).toBe('');
  });

  it('commits uncommitted typing before undoing', () => {
    render(<ControlledEditor initialValue="" />);
    const el = getTextarea();

    act(() => {
      type(el, 'hello');
      vi.advanceTimersByTime(600);
    });

    // Type more without letting the debounce fire
    act(() => {
      type(el, 'hello world');
      // intentionally NOT advancing timers
    });

    expect(el.value).toBe('hello world');

    // Undo should save "hello world" as a checkpoint then restore "hello"
    act(() => {
      keyDown(el, 'z', { ctrlKey: true });
    });
    expect(el.value).toBe('hello');
  });

  it('does nothing when already at the beginning of history', () => {
    render(<ControlledEditor initialValue="initial" />);
    const el = getTextarea();

    act(() => {
      keyDown(el, 'z', { ctrlKey: true });
    });
    expect(el.value).toBe('initial');
  });
});

describe('redo (Ctrl+Shift+Z)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('redoes the last undone change', () => {
    render(<ControlledEditor initialValue="" />);
    const el = getTextarea();

    act(() => {
      type(el, 'hello');
      vi.advanceTimersByTime(600);
    });

    act(() => {
      keyDown(el, 'z', { ctrlKey: true });
    });
    expect(el.value).toBe('');

    act(() => {
      keyDown(el, 'z', { ctrlKey: true, shiftKey: true });
    });
    expect(el.value).toBe('hello');
  });

  it('clears the redo stack when a new edit is made after undo', () => {
    render(<ControlledEditor initialValue="" />);
    const el = getTextarea();

    act(() => {
      type(el, 'hello');
      vi.advanceTimersByTime(600);
    });

    act(() => {
      keyDown(el, 'z', { ctrlKey: true });
    });
    expect(el.value).toBe('');

    // New edit clears redo stack
    act(() => {
      type(el, 'world');
      vi.advanceTimersByTime(600);
    });

    // Redo should be a no-op now
    act(() => {
      keyDown(el, 'z', { ctrlKey: true, shiftKey: true });
    });
    expect(el.value).toBe('world');
  });
});

describe('undo with Ctrl+B shortcut', () => {
  it('undoes bold formatting applied via Ctrl+B', () => {
    render(<ControlledEditor initialValue="hello world" />);
    const el = getTextarea();

    act(() => {
      el.setSelectionRange(6, 11);
      keyDown(el, 'b', { ctrlKey: true });
    });

    expect(el.value).toBe('hello **world**');

    act(() => {
      keyDown(el, 'z', { ctrlKey: true });
    });

    expect(el.value).toBe('hello world');
  });
});

describe('undo with paste', () => {
  it('undoes pasted content', () => {
    render(<ControlledEditor initialValue="hello " />);
    const el = getTextarea();

    act(() => {
      // Fire paste event — commits pre-paste state
      fireEvent.paste(el);
      // Then onChange fires from the paste result
      type(el, 'hello world');
    });

    expect(el.value).toBe('hello world');

    act(() => {
      keyDown(el, 'z', { ctrlKey: true });
    });

    expect(el.value).toBe('hello ');
  });
});
