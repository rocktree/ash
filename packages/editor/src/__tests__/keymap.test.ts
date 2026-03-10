import { describe, it, expect } from 'vitest';
import {
  applyBold,
  applyItalic,
  applyTab,
  applyShiftTab,
  applyEnter,
  applyLink,
  applyLinkPaste,
  detectMarkdownContext,
} from '../keymap';
import type { EditorState } from '../types';

// Helper to build a state object
function state(value: string, selectionStart: number, selectionEnd = selectionStart): EditorState {
  return { value, selectionStart, selectionEnd };
}

// ─── applyBold ────────────────────────────────────────────────────────────────

describe('applyBold', () => {
  it('wraps a selection in ** markers', () => {
    const result = applyBold(state('hello world', 6, 11));
    expect(result.value).toBe('hello **world**');
    expect(result.selectionStart).toBe(8);
    expect(result.selectionEnd).toBe(13);
  });

  it('places cursor between markers when there is no selection', () => {
    const result = applyBold(state('hello', 5, 5));
    expect(result.value).toBe('hello****');
    expect(result.selectionStart).toBe(7);
    expect(result.selectionEnd).toBe(7);
  });

  it('toggles off when selection is already wrapped', () => {
    const result = applyBold(state('**world**', 2, 7));
    expect(result.value).toBe('world');
    expect(result.selectionStart).toBe(0);
    expect(result.selectionEnd).toBe(5);
  });
});

// ─── applyItalic ──────────────────────────────────────────────────────────────

describe('applyItalic', () => {
  it('wraps a selection in _ markers', () => {
    const result = applyItalic(state('hello world', 6, 11));
    expect(result.value).toBe('hello _world_');
    expect(result.selectionStart).toBe(7);
    expect(result.selectionEnd).toBe(12);
  });

  it('places cursor between markers when there is no selection', () => {
    const result = applyItalic(state('hello', 5, 5));
    expect(result.value).toBe('hello__');
    expect(result.selectionStart).toBe(6);
    expect(result.selectionEnd).toBe(6);
  });

  it('toggles off when selection is already wrapped', () => {
    const result = applyItalic(state('_world_', 1, 6));
    expect(result.value).toBe('world');
    expect(result.selectionStart).toBe(0);
    expect(result.selectionEnd).toBe(5);
  });
});

// ─── applyTab ─────────────────────────────────────────────────────────────────

describe('applyTab', () => {
  it('inserts spaces at cursor when there is no selection', () => {
    const result = applyTab(state('hello', 5, 5), 2);
    expect(result.value).toBe('hello  ');
    expect(result.selectionStart).toBe(7);
    expect(result.selectionEnd).toBe(7);
  });

  it('indents all selected lines by tabSize spaces', () => {
    const text = 'line1\nline2';
    const result = applyTab(state(text, 0, text.length), 2);
    expect(result.value).toBe('  line1\n  line2');
  });

  it('respects tabSize', () => {
    const result = applyTab(state('text', 4, 4), 4);
    expect(result.value).toBe('text    ');
    expect(result.selectionStart).toBe(8);
  });
});

// ─── applyShiftTab ────────────────────────────────────────────────────────────

describe('applyShiftTab', () => {
  it('removes leading spaces up to tabSize', () => {
    const result = applyShiftTab(state('  hello', 7, 7), 2);
    expect(result).not.toBeNull();
    expect(result!.value).toBe('hello');
    expect(result!.selectionStart).toBe(5);
  });

  it('returns null when there is nothing to unindent', () => {
    const result = applyShiftTab(state('hello', 5, 5), 2);
    expect(result).toBeNull();
  });

  it('removes a tab character', () => {
    const result = applyShiftTab(state('\thello', 6, 6), 2);
    expect(result).not.toBeNull();
    expect(result!.value).toBe('hello');
  });

  it('unindents all selected lines', () => {
    const text = '  line1\n  line2';
    const result = applyShiftTab(state(text, 0, text.length), 2);
    expect(result).not.toBeNull();
    expect(result!.value).toBe('line1\nline2');
  });
});

// ─── applyEnter ───────────────────────────────────────────────────────────────

describe('applyEnter', () => {
  it('returns null for plain lines (browser handles the newline)', () => {
    expect(applyEnter(state('hello', 5, 5))).toBeNull();
  });

  it('continues an unordered list', () => {
    const text = '- item';
    const result = applyEnter(state(text, text.length, text.length));
    expect(result).not.toBeNull();
    expect(result!.value).toBe('- item\n- ');
  });

  it('exits an unordered list when the item is empty', () => {
    const text = '- ';
    const result = applyEnter(state(text, text.length, text.length));
    expect(result).not.toBeNull();
    expect(result!.value).toBe('\n');
  });

  it('continues an ordered list with the next number', () => {
    const text = '1. item';
    const result = applyEnter(state(text, text.length, text.length));
    expect(result).not.toBeNull();
    expect(result!.value).toBe('1. item\n2. ');
  });

  it('exits an ordered list when the item is empty', () => {
    const text = '1. ';
    const result = applyEnter(state(text, text.length, text.length));
    expect(result).not.toBeNull();
    expect(result!.value).toBe('\n');
  });

  it('continues a blockquote', () => {
    const text = '> quote';
    const result = applyEnter(state(text, text.length, text.length));
    expect(result).not.toBeNull();
    expect(result!.value).toBe('> quote\n> ');
  });

  it('exits a blockquote when the line is empty', () => {
    const text = '> ';
    const result = applyEnter(state(text, text.length, text.length));
    expect(result).not.toBeNull();
    expect(result!.value).toBe('\n');
  });

  it('returns null when there is a selection (let browser handle it)', () => {
    expect(applyEnter(state('hello', 1, 3))).toBeNull();
  });

  it('preserves indentation on nested list continuation', () => {
    const text = '  - nested';
    const result = applyEnter(state(text, text.length, text.length));
    expect(result).not.toBeNull();
    expect(result!.value).toBe('  - nested\n  - ');
  });
});

// ─── applyLink ────────────────────────────────────────────────────────────────

describe('applyLink', () => {
  it('inserts []() and places cursor between [] when there is no selection', () => {
    const result = applyLink(state('hello', 5, 5));
    expect(result.value).toBe('hello[]()');
    expect(result.selectionStart).toBe(6);
    expect(result.selectionEnd).toBe(6);
  });

  it('wraps selection as [text]() and places cursor between () ', () => {
    const result = applyLink(state('click here', 6, 10));
    expect(result.value).toBe('click [here]()');
    expect(result.selectionStart).toBe(13);
    expect(result.selectionEnd).toBe(13);
  });

  it('works when selection is at the start of value', () => {
    const result = applyLink(state('link text', 0, 4));
    expect(result.value).toBe('[link]() text');
    expect(result.selectionStart).toBe(7);
    expect(result.selectionEnd).toBe(7);
  });
});

// ─── applyLinkPaste ───────────────────────────────────────────────────────────

describe('applyLinkPaste', () => {
  it('wraps selection with pasted URL and places cursor after )', () => {
    const result = applyLinkPaste(state('click here for info', 6, 10), 'https://example.com');
    expect(result).not.toBeNull();
    expect(result!.value).toBe('click [here](https://example.com) for info');
    expect(result!.selectionStart).toBe(33);
    expect(result!.selectionEnd).toBe(33);
  });

  it('returns null when there is no selection', () => {
    const result = applyLinkPaste(state('hello', 5, 5), 'https://example.com');
    expect(result).toBeNull();
  });

  it('returns null when pasted text is not a URL', () => {
    const result = applyLinkPaste(state('hello world', 6, 11), 'not a url');
    expect(result).toBeNull();
  });

  it('accepts ftp:// URLs', () => {
    const result = applyLinkPaste(state('hello world', 6, 11), 'ftp://example.com');
    expect(result).not.toBeNull();
    expect(result!.value).toBe('hello [world](ftp://example.com)');
  });

  it('accepts mailto: URLs', () => {
    const result = applyLinkPaste(state('email me', 0, 8), 'mailto:user@example.com');
    expect(result).not.toBeNull();
    expect(result!.value).toBe('[email me](mailto:user@example.com)');
  });

  it('accepts https URLs', () => {
    const result = applyLinkPaste(state('world', 0, 5), 'https://example.com/path?q=1');
    expect(result).not.toBeNull();
    expect(result!.value).toBe('[world](https://example.com/path?q=1)');
  });
});

// ─── detectMarkdownContext ────────────────────────────────────────────────────

describe('detectMarkdownContext', () => {
  it('returns null for plain text', () => {
    expect(detectMarkdownContext(state('hello world', 5))).toBeNull();
  });

  it('detects heading 1', () => {
    const text = '# Title';
    expect(detectMarkdownContext(state(text, text.length))).toBe('Heading 1');
  });

  it('detects heading 2', () => {
    const text = '## Subtitle';
    expect(detectMarkdownContext(state(text, text.length))).toBe('Heading 2');
  });

  it('detects heading 3', () => {
    expect(detectMarkdownContext(state('### H3', 6))).toBe('Heading 3');
  });

  it('detects unordered list', () => {
    expect(detectMarkdownContext(state('- item', 6))).toBe('Unordered list');
  });

  it('detects ordered list', () => {
    expect(detectMarkdownContext(state('1. item', 7))).toBe('Ordered list');
  });

  it('detects blockquote', () => {
    expect(detectMarkdownContext(state('> quoted', 8))).toBe('Blockquote');
  });

  it('detects code block fence', () => {
    expect(detectMarkdownContext(state('```js', 5))).toBe('Code block');
  });

  it('detects bold inline', () => {
    // cursor is inside **bold**
    const text = '**bold**';
    expect(detectMarkdownContext(state(text, 4, 4))).toBe('Bold');
  });

  it('returns null when cursor is outside bold markers', () => {
    const text = 'before **bold** after';
    expect(detectMarkdownContext(state(text, 0, 0))).toBeNull();
  });
});
