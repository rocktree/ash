import React, { useState } from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Editor } from '../Editor';

function Wrapper({ initialValue = '' }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue);
  return <Editor value={value} onChange={setValue} />;
}

function getTextarea(container: HTMLElement): HTMLTextAreaElement {
  return container.querySelector('textarea')!;
}

// ─── Cmd/Ctrl+K shortcut ──────────────────────────────────────────────────────

describe('Editor onKeyDown — Ctrl+K (link shortcut)', () => {
  it('inserts []() and places cursor inside [] when there is no selection', () => {
    const { container } = render(<Wrapper />);
    const textarea = getTextarea(container);
    textarea.selectionStart = 0;
    textarea.selectionEnd = 0;
    fireEvent.keyDown(textarea, { key: 'k', ctrlKey: true });
    expect(textarea.value).toBe('[]()');
    expect(textarea.selectionStart).toBe(1);
    expect(textarea.selectionEnd).toBe(1);
  });

  it('wraps selected text as [text]() and places cursor inside ()', () => {
    const { container } = render(<Wrapper initialValue="click here" />);
    const textarea = getTextarea(container);
    textarea.selectionStart = 6;
    textarea.selectionEnd = 10;
    fireEvent.keyDown(textarea, { key: 'k', ctrlKey: true });
    expect(textarea.value).toBe('click [here]()');
    expect(textarea.selectionStart).toBe(13);
    expect(textarea.selectionEnd).toBe(13);
  });

  it('triggers with uppercase K (Caps Lock active)', () => {
    const { container } = render(<Wrapper />);
    const textarea = getTextarea(container);
    textarea.selectionStart = 0;
    textarea.selectionEnd = 0;
    fireEvent.keyDown(textarea, { key: 'K', ctrlKey: true });
    expect(textarea.value).toBe('[]()');
  });

  it('calls preventDefault when the shortcut fires', () => {
    const { container } = render(<Wrapper />);
    const textarea = getTextarea(container);
    textarea.selectionStart = 0;
    textarea.selectionEnd = 0;
    const handler = vi.fn();
    textarea.addEventListener('keydown', handler);
    fireEvent.keyDown(textarea, { key: 'k', ctrlKey: true });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].defaultPrevented).toBe(true);
  });

  it('does not trigger without a modifier key', () => {
    const { container } = render(<Wrapper />);
    const textarea = getTextarea(container);
    fireEvent.keyDown(textarea, { key: 'k' });
    expect(textarea.value).toBe('');
  });
});

// ─── Paste URL behavior ───────────────────────────────────────────────────────

function pasteData(text: string) {
  return {
    clipboardData: { getData: (type: string) => (type === 'text' ? text : '') },
  };
}

describe('Editor onPaste — URL paste to link', () => {
  it('formats [selection](url) when an https URL is pasted over selected text', () => {
    const { container } = render(<Wrapper initialValue="click here for info" />);
    const textarea = getTextarea(container);
    textarea.selectionStart = 6;
    textarea.selectionEnd = 10;
    fireEvent.paste(textarea, pasteData('https://example.com'));
    expect(textarea.value).toBe('click [here](https://example.com) for info');
    expect(textarea.selectionStart).toBe(33);
    expect(textarea.selectionEnd).toBe(33);
  });

  it('accepts ftp:// URLs', () => {
    const { container } = render(<Wrapper initialValue="link" />);
    const textarea = getTextarea(container);
    textarea.selectionStart = 0;
    textarea.selectionEnd = 4;
    fireEvent.paste(textarea, pasteData('ftp://files.example.com'));
    expect(textarea.value).toBe('[link](ftp://files.example.com)');
  });

  it('accepts mailto: URLs', () => {
    const { container } = render(<Wrapper initialValue="email" />);
    const textarea = getTextarea(container);
    textarea.selectionStart = 0;
    textarea.selectionEnd = 5;
    fireEvent.paste(textarea, pasteData('mailto:user@example.com'));
    expect(textarea.value).toBe('[email](mailto:user@example.com)');
  });

  it('calls preventDefault when URL paste is handled', () => {
    const { container } = render(<Wrapper initialValue="link" />);
    const textarea = getTextarea(container);
    textarea.selectionStart = 0;
    textarea.selectionEnd = 4;
    const handler = vi.fn();
    textarea.addEventListener('paste', handler);
    fireEvent.paste(textarea, pasteData('https://example.com'));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].defaultPrevented).toBe(true);
  });

  it('falls back to normal paste (no onChange) when pasted text is not a URL', () => {
    const onChange = vi.fn();
    const { container } = render(<Editor value="hello world" onChange={onChange} />);
    const textarea = getTextarea(container);
    textarea.selectionStart = 6;
    textarea.selectionEnd = 11;
    fireEvent.paste(textarea, pasteData('not a url'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('falls back to normal paste (no onChange) when there is no selection', () => {
    const onChange = vi.fn();
    const { container } = render(<Editor value="hello" onChange={onChange} />);
    const textarea = getTextarea(container);
    textarea.selectionStart = 5;
    textarea.selectionEnd = 5;
    fireEvent.paste(textarea, pasteData('https://example.com'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not call preventDefault for non-URL paste fallback', () => {
    const { container } = render(<Wrapper initialValue="hello world" />);
    const textarea = getTextarea(container);
    textarea.selectionStart = 6;
    textarea.selectionEnd = 11;
    const handler = vi.fn();
    textarea.addEventListener('paste', handler);
    fireEvent.paste(textarea, pasteData('not a url'));
    expect(handler.mock.calls[0][0].defaultPrevented).toBe(false);
  });
});
