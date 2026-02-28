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
