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
}
