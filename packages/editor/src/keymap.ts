import type { EditorState, EditResult } from './types';

// ─── Inline formatting ────────────────────────────────────────────────────────

export function applyBold(state: EditorState): EditResult {
  return wrapSelection(state, '**', '**');
}

export function applyItalic(state: EditorState): EditResult {
  return wrapSelection(state, '_', '_');
}

function wrapSelection(
  { value, selectionStart, selectionEnd }: EditorState,
  before: string,
  after: string,
): EditResult {
  const selected = value.slice(selectionStart, selectionEnd);

  // Toggle off if already wrapped
  const preBefore = value.slice(selectionStart - before.length, selectionStart);
  const postAfter = value.slice(selectionEnd, selectionEnd + after.length);
  if (preBefore === before && postAfter === after) {
    return {
      value:
        value.slice(0, selectionStart - before.length) +
        selected +
        value.slice(selectionEnd + after.length),
      selectionStart: selectionStart - before.length,
      selectionEnd: selectionEnd - before.length,
    };
  }

  const newValue =
    value.slice(0, selectionStart) + before + selected + after + value.slice(selectionEnd);

  // No selection: place cursor between markers
  if (selectionStart === selectionEnd) {
    return {
      value: newValue,
      selectionStart: selectionStart + before.length,
      selectionEnd: selectionStart + before.length,
    };
  }

  // Selection: keep content selected (shifted by `before` length)
  return {
    value: newValue,
    selectionStart: selectionStart + before.length,
    selectionEnd: selectionEnd + before.length,
  };
}

// ─── Indentation ──────────────────────────────────────────────────────────────

export function applyTab(state: EditorState, tabSize: number): EditResult {
  const { value, selectionStart, selectionEnd } = state;
  const indent = ' '.repeat(tabSize);

  // No selection: insert spaces at cursor
  if (selectionStart === selectionEnd) {
    return {
      value: value.slice(0, selectionStart) + indent + value.slice(selectionEnd),
      selectionStart: selectionStart + tabSize,
      selectionEnd: selectionStart + tabSize,
    };
  }

  return indentLines(state, tabSize, false) as EditResult;
}

export function applyShiftTab(state: EditorState, tabSize: number): EditResult | null {
  return indentLines(state, tabSize, true);
}

function indentLines(
  { value, selectionStart, selectionEnd }: EditorState,
  tabSize: number,
  unindent: boolean,
): EditResult | null {
  const indent = ' '.repeat(tabSize);

  const firstLineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
  const endSearch = selectionStart === selectionEnd ? selectionStart : selectionEnd - 1;
  const nextNewline = value.indexOf('\n', endSearch);
  const lastLineEnd = nextNewline === -1 ? value.length : nextNewline;

  const lines = value.slice(firstLineStart, lastLineEnd).split('\n');

  if (unindent) {
    let firstLineRemoved = 0;
    let totalRemoved = 0;

    const newLines = lines.map((line, i) => {
      let removed = 0;
      let out = line;

      if (out.startsWith(indent)) {
        out = out.slice(tabSize);
        removed = tabSize;
      } else {
        while (removed < tabSize && out[0] === ' ') {
          out = out.slice(1);
          removed++;
        }
        if (removed === 0 && out[0] === '\t') {
          out = out.slice(1);
          removed = 1;
        }
      }

      if (i === 0) firstLineRemoved = removed;
      totalRemoved += removed;
      return out;
    });

    if (totalRemoved === 0) return null;

    const newValue =
      value.slice(0, firstLineStart) + newLines.join('\n') + value.slice(lastLineEnd);
    const newStart = Math.max(firstLineStart, selectionStart - firstLineRemoved);
    const newEnd =
      selectionStart === selectionEnd
        ? newStart
        : Math.max(newStart, selectionEnd - totalRemoved);
    return { value: newValue, selectionStart: newStart, selectionEnd: newEnd };
  } else {
    const newLines = lines.map((l) => indent + l);
    const newValue =
      value.slice(0, firstLineStart) + newLines.join('\n') + value.slice(lastLineEnd);
    const newStart = selectionStart + tabSize;
    const newEnd =
      selectionStart === selectionEnd ? newStart : selectionEnd + tabSize * lines.length;
    return { value: newValue, selectionStart: newStart, selectionEnd: newEnd };
  }
}

// ─── Syntax context detection ─────────────────────────────────────────────────

/**
 * Returns a human-readable label for the markdown context at the current
 * cursor position, or `null` when no recognizable context is detected.
 * Used to drive the optional syntax-hint indicator in the Editor UI.
 */
export function detectMarkdownContext(state: EditorState): string | null {
  const { value, selectionStart, selectionEnd } = state;

  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
  const line = value.slice(lineStart, selectionStart);
  const fullLine = value.slice(lineStart, value.indexOf('\n', lineStart) === -1
    ? value.length
    : value.indexOf('\n', lineStart));

  if (/^#{6} /.test(fullLine)) return 'Heading 6';
  if (/^#{5} /.test(fullLine)) return 'Heading 5';
  if (/^#{4} /.test(fullLine)) return 'Heading 4';
  if (/^#{3} /.test(fullLine)) return 'Heading 3';
  if (/^#{2} /.test(fullLine)) return 'Heading 2';
  if (/^# /.test(fullLine)) return 'Heading 1';
  if (/^\s*```/.test(fullLine)) return 'Code block';
  if (/^\s*> /.test(fullLine)) return 'Blockquote';
  if (/^\s*(\d+)\. /.test(fullLine)) return 'Ordered list';
  if (/^\s*[-*+] /.test(fullLine)) return 'Unordered list';
  if (/^\s{4}/.test(fullLine)) return 'Indented code';

  // Inline: check if cursor is inside **bold** or _italic_ markers
  const before = value.slice(0, selectionStart);
  const after = value.slice(selectionEnd);
  const boldOpen = before.lastIndexOf('**');
  const boldClose = after.indexOf('**');
  if (boldOpen !== -1 && boldClose !== -1 && !before.slice(boldOpen + 2).includes('**')) {
    return 'Bold';
  }
  const italicOpen = before.lastIndexOf('_');
  const italicClose = after.indexOf('_');
  if (italicOpen !== -1 && italicClose !== -1 && !before.slice(italicOpen + 1).includes('_')) {
    return 'Italic';
  }

  return null;
}

// ─── Link ─────────────────────────────────────────────────────────────────────

export function applyLink(state: EditorState): EditResult {
  const { value, selectionStart, selectionEnd } = state;
  const selected = value.slice(selectionStart, selectionEnd);

  if (selectionStart === selectionEnd) {
    // No selection: insert []() and place cursor between []
    const newValue = value.slice(0, selectionStart) + '[]()' + value.slice(selectionEnd);
    return {
      value: newValue,
      selectionStart: selectionStart + 1,
      selectionEnd: selectionStart + 1,
    };
  }

  // Has selection: wrap as [selected]() and place cursor between ()
  const newValue =
    value.slice(0, selectionStart) + '[' + selected + ']()' + value.slice(selectionEnd);
  const cursorPos = selectionStart + 1 + selected.length + 2;
  return {
    value: newValue,
    selectionStart: cursorPos,
    selectionEnd: cursorPos,
  };
}

const SAFE_URL_PROTOCOLS = new Set(['http:', 'https:', 'ftp:', 'mailto:']);

function isUrl(text: string): boolean {
  try {
    const url = new URL(text.trim());
    return SAFE_URL_PROTOCOLS.has(url.protocol);
  } catch {
    return false;
  }
}

export function applyLinkPaste(state: EditorState, pastedText: string): EditResult | null {
  const { value, selectionStart, selectionEnd } = state;
  const trimmed = pastedText.trim();

  if (selectionStart === selectionEnd) return null;
  if (!isUrl(trimmed)) return null;

  const selected = value.slice(selectionStart, selectionEnd);
  const newValue =
    value.slice(0, selectionStart) +
    '[' + selected + '](' + trimmed + ')' +
    value.slice(selectionEnd);
  const cursorPos = selectionStart + selected.length + trimmed.length + 4;
  return {
    value: newValue,
    selectionStart: cursorPos,
    selectionEnd: cursorPos,
  };
}

// ─── Smart Enter ─────────────────────────────────────────────────────────────

export function applyEnter(state: EditorState): EditResult | null {
  const { value, selectionStart, selectionEnd } = state;
  if (selectionStart !== selectionEnd) return null;

  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
  const currentLine = value.slice(lineStart, selectionStart);

  // Unordered list: - item, * item, + item
  const unordered = currentLine.match(/^(\s*)([-*+]) /);
  if (unordered) {
    const [full, indent, bullet] = unordered;
    const hasContent = currentLine.length > full.length;
    if (!hasContent) {
      const newValue = value.slice(0, lineStart) + '\n' + value.slice(selectionStart);
      return { value: newValue, selectionStart: lineStart + 1, selectionEnd: lineStart + 1 };
    }
    const ins = '\n' + indent + bullet + ' ';
    return {
      value: value.slice(0, selectionStart) + ins + value.slice(selectionEnd),
      selectionStart: selectionStart + ins.length,
      selectionEnd: selectionStart + ins.length,
    };
  }

  // Ordered list: 1. item
  const ordered = currentLine.match(/^(\s*)(\d+)\. /);
  if (ordered) {
    const [full, indent, numStr] = ordered;
    const hasContent = currentLine.length > full.length;
    if (!hasContent) {
      const newValue = value.slice(0, lineStart) + '\n' + value.slice(selectionStart);
      return { value: newValue, selectionStart: lineStart + 1, selectionEnd: lineStart + 1 };
    }
    const num = parseInt(numStr, 10) + 1;
    const ins = '\n' + indent + num + '. ';
    return {
      value: value.slice(0, selectionStart) + ins + value.slice(selectionEnd),
      selectionStart: selectionStart + ins.length,
      selectionEnd: selectionStart + ins.length,
    };
  }

  // Blockquote: > content
  const blockquote = currentLine.match(/^(\s*)(> )/);
  if (blockquote) {
    const [full, indent] = blockquote;
    const hasContent = currentLine.length > full.length;
    if (!hasContent) {
      const newValue = value.slice(0, lineStart) + '\n' + value.slice(selectionStart);
      return { value: newValue, selectionStart: lineStart + 1, selectionEnd: lineStart + 1 };
    }
    const ins = '\n' + indent + '> ';
    return {
      value: value.slice(0, selectionStart) + ins + value.slice(selectionEnd),
      selectionStart: selectionStart + ins.length,
      selectionEnd: selectionStart + ins.length,
    };
  }

  return null;
}
