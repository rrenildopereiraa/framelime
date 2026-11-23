import { useRef } from "react";

// Changes in the same group closer together than this merge into one step:
// a slider drag, a color picker drag, a burst of typing.
export const MERGE_WINDOW_MS = 800;

// Enough to walk back through a long session without holding every keystroke forever.
const MAX_STEPS = 200;

interface Stack<T> {
  past: T[];
  future: T[];
  lastGroup: string | null;
  lastTime: number;
}

/**
 * One undo stack per key (a snippet's id). Each step is a snapshot of
 * everything the user can change, taken just before a change is applied, so
 * undo puts back the code and the settings together.
 */
export function createHistory<T>(now: () => number = Date.now) {
  const stacks = new Map<string, Stack<T>>();

  function stackFor(key: string) {
    let stack = stacks.get(key);
    if (!stack) {
      stack = { past: [], future: [], lastGroup: null, lastTime: 0 };
      stacks.set(key, stack);
    }
    return stack;
  }

  return {
    /**
     * Call before applying a change, with the state as it is now. A change
     * in the same group as the previous one, soon after it, joins that step.
     * A `null` group never merges.
     */
    record(key: string, current: T, group: string | null) {
      const stack = stackFor(key);
      const time = now();
      const merges =
        group !== null && group === stack.lastGroup && time - stack.lastTime < MERGE_WINDOW_MS;
      if (!merges) {
        stack.past.push(current);
        if (stack.past.length > MAX_STEPS) stack.past.shift();
      }
      stack.future = [];
      stack.lastGroup = group;
      stack.lastTime = time;
    },

    /** Returns the state to restore, or `null` when there is nothing to undo. */
    undo(key: string, current: T): T | null {
      const stack = stackFor(key);
      const previous = stack.past.pop();
      if (previous === undefined) return null;
      stack.future.push(current);
      stack.lastGroup = null;
      return previous;
    },

    /** Returns the state to restore, or `null` when there is nothing to redo. */
    redo(key: string, current: T): T | null {
      const stack = stackFor(key);
      const next = stack.future.pop();
      if (next === undefined) return null;
      stack.past.push(current);
      stack.lastGroup = null;
      return next;
    },

    forget(key: string) {
      stacks.delete(key);
    },
  };
}

export type History<T> = ReturnType<typeof createHistory<T>>;

/** A history that lives as long as the component. */
export function useHistory<T>(): History<T> {
  const history = useRef<History<T> | null>(null);
  history.current ??= createHistory<T>();
  return history.current;
}
