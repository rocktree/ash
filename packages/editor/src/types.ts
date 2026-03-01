import type { TextareaHTMLAttributes } from 'react';

export interface EditResult {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

export interface EditorState {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

export interface EditorProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  /** The current text value (controlled) */
  value: string;
  /** Called whenever the value changes */
  onChange: (value: string) => void;
  /** Number of spaces per indent level. Defaults to 2. */
  tabSize?: number;
  /**
   * Show a subtle syntax-context hint label below the editor based on the
   * current cursor position (e.g. "Heading", "Bold", "Unordered list").
   * Defaults to true. Style the label via the `[data-ash-hint]` attribute.
   */
  showHints?: boolean;
  /**
   * CSS class name(s) applied to the wrapper `<div>` that surrounds the
   * textarea and hint label. Useful for layout or positioning overrides.
   */
  wrapperClassName?: string;
}
