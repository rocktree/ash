# @rocktree/ash

A keyboard-driven, markdown-aware text editor component for React.

## Install

```bash
npm install @rocktree/ash
```

## Usage

```tsx
import { useState } from 'react';
import { Editor } from '@rocktree/ash';

function App() {
  const [text, setText] = useState('');

  return (
    <Editor
      value={text}
      onChange={setText}
      placeholder="Start writing..."
      className="w-full h-64 p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none focus:outline-none"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | required | Current text value |
| `onChange` | `(value: string) => void` | required | Called when text changes |
| `tabSize` | `number` | `2` | Spaces per indent level |
| `placeholder` | `string` | `'Start writing...'` | Placeholder text |
| `className` | `string` | `''` | CSS class names |

All standard `<textarea>` HTML attributes are also accepted.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + B` | Toggle bold (`**text**`) |
| `Cmd/Ctrl + I` | Toggle italic (`_text_`) |
| `Cmd/Ctrl + K` (no selection) | Insert `[]()` with cursor inside `[]` |
| `Cmd/Ctrl + K` (with selection) | Wrap selection as `[text]()` with cursor inside `()` |
| `Tab` | Indent |
| `Shift + Tab` | Unindent |
| `Enter` on list item | Continue list |
| `Enter` on empty list item | End list |
| `Cmd/Ctrl + Z` | Undo (native) |
| `Cmd/Ctrl + Shift + Z` | Redo (native) |

### Paste URL to Link

When text is selected and you paste a valid URL (e.g. `https://`, `ftp://`, `mailto:`), the editor automatically formats it as a Markdown link: `[selected text](url)`. If the pasted content is not a URL, normal paste behavior applies.

## License

MIT
