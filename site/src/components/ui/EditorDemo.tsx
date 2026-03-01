'use client';

import { useState } from 'react';
import { Editor } from '@rocktree/ash';

const INITIAL_CONTENT = `# Welcome to Ash ✦

A keyboard-driven text editor for React. Try it now.

## Keyboard Shortcuts

- **Bold** — select text, then Cmd+B (or Ctrl+B)
- _Italic_ — select text, then Cmd+I (or Ctrl+I)
- Tab / Shift+Tab — indent and unindent

## Lists Auto-Continue

Press Enter here to add another item:
- Item one
- Item two

Or use numbered lists:
1. First
2. Second

## Blockquotes

> Press Enter after a blockquote to continue it.
> Like this.

---

Start editing to explore. Everything works exactly as you'd expect.`;

export function EditorDemo() {
  const [value, setValue] = useState(INITIAL_CONTENT);

  const lineCount = value.split('\n').length;
  const wordCount = value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <div className="rounded-xl border border-ash-border overflow-hidden shadow-2xl shadow-black/40">
      {/* Window chrome */}
      <div className="bg-ash-surface border-b border-ash-border px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-ash-subtle text-xs font-mono ml-2 flex-1 text-center -ml-12">
          readme.md
        </span>
      </div>

      {/* Editor area */}
      <Editor
        value={value}
        onChange={setValue}
        className="w-full bg-ash-editor text-ash-text font-mono text-sm leading-relaxed p-6 resize-none focus:outline-none min-h-[480px]"
        style={{ tabSize: 2 }}
        tabSize={2}
        placeholder="Start writing..."
        aria-label="Live editor demo"
      />

      {/* Status bar */}
      <div className="bg-ash-surface border-t border-ash-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-ash-subtle font-mono">
          <span>{lineCount} lines</span>
          <span>{wordCount} words</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-ash-subtle">
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-ash-card border border-ash-border rounded text-[10px] font-mono">
              ⌘B
            </kbd>
            bold
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-ash-card border border-ash-border rounded text-[10px] font-mono">
              ⌘I
            </kbd>
            italic
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-ash-card border border-ash-border rounded text-[10px] font-mono">
              Tab
            </kbd>
            indent
          </span>
        </div>
      </div>
    </div>
  );
}
