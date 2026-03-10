import { useRef, useCallback } from 'react';

interface HistoryEntry {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

export function useUndoHistory(initialValue: string) {
  const stack = useRef<HistoryEntry[]>([
    { value: initialValue, selectionStart: 0, selectionEnd: 0 },
  ]);
  const index = useRef(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelDebounce = useCallback(() => {
    if (debounceTimer.current !== null) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
  }, []);

  const commit = useCallback(
    (entry: HistoryEntry) => {
      cancelDebounce();
      // Drop any forward history (new edit clears redo stack)
      stack.current = stack.current.slice(0, index.current + 1);
      // Skip duplicate entries (same value and selection)
      const last = stack.current[index.current];
      if (
        last &&
        last.value === entry.value &&
        last.selectionStart === entry.selectionStart &&
        last.selectionEnd === entry.selectionEnd
      )
        return;
      stack.current.push(entry);
      index.current++;
    },
    [cancelDebounce],
  );

  const scheduleCommit = useCallback(
    (getEntry: () => HistoryEntry, delay = 500) => {
      cancelDebounce();
      // Clear redo stack immediately so any new edit invalidates redo right away,
      // even before the debounce fires and commit() is called.
      stack.current = stack.current.slice(0, index.current + 1);
      debounceTimer.current = setTimeout(() => {
        debounceTimer.current = null;
        commit(getEntry());
      }, delay);
    },
    [cancelDebounce, commit],
  );

  const undo = useCallback(
    (currentEntry: HistoryEntry): HistoryEntry | null => {
      // If there are uncommitted changes, commit them first so they can be redone
      const last = stack.current[index.current];
      if (last.value !== currentEntry.value) {
        commit(currentEntry);
      } else {
        cancelDebounce();
      }
      if (index.current <= 0) return null;
      index.current--;
      return stack.current[index.current];
    },
    [commit, cancelDebounce],
  );

  const redo = useCallback((): HistoryEntry | null => {
    cancelDebounce();
    if (index.current >= stack.current.length - 1) return null;
    index.current++;
    return stack.current[index.current];
  }, [cancelDebounce]);

  return { commit, scheduleCommit, undo, redo, cancelDebounce };
}
