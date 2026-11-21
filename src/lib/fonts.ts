// Font stacks over the faces loaded in `app/globals.css`.

/** The interface face: Stack Sans Text, made for small sizes. */
export const SANS = '"Stack Sans Text Variable", system-ui, sans-serif';

/** The wordmark and headings: Stack Sans Notch, with its cut `t` and `a`. */
export const DISPLAY_STYLE = {
  fontFamily: '"Stack Sans Notch Variable", "Stack Sans Text Variable", system-ui, sans-serif',
} as const;

export const MONO_STYLE = {
  fontFamily: '"JetBrains Mono", ui-monospace, monospace',
} as const;
