import { defineConfig } from "yummacss";

export default defineConfig({
  source: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  safelist: [
    "cs:l",
    "cs:d",
    "cs:ld",
    // Classes only referenced inside conditional expressions.
    "tp:d",
    "tdu:200",
    "tp:t",
    "tor:c",
    "o:40",
    "o:50",
    "bg:accent-dim",
    "ttx:0",
    "ttx:3",
  ],
  theme: {
    colors: {
      // Framelime's lime. Dark mode follows the near-black, lime-lit look;
      // light mode keeps the bright lime for fills (dark text on it) and a
      // deeper lime wherever lime is text, an icon or a border on white.
      // The logo mark: the lime itself in dark mode, a deeper one on white.
      brand: { light: "#65a30d", dark: "#d4ff3a" },
      accent: { light: "#4d7c0f", dark: "#d4ff3a" },
      "accent-dim": { light: "#65a30d", dark: "#a8cc2e" },
      "on-accent": { light: "#ffffff", dark: "#0b0b0a" },
      border: { light: "#e3e5dc", dark: "#232421" },
      page: { light: "#fafaf7", dark: "#0b0b0a" },
      surface: { light: "#ffffff", dark: "#121311" },
      "surface-2": { light: "#f1f2ec", dark: "#191a17" },
      text: { light: "#11120e", dark: "#eeefe9" },
      "text-dim": { light: "#63665a", dark: "#95978d" },

      // The code accent, diff highlights and toast states.
      code: "#2563eb",
      "diff-add": "#86efac",
      "diff-remove": "#fca5a5",
      warning: "#fcd34d",

      // Yumma UI's tokens in Framelime's neutrals and lime: its controls keep
      // their keycap shadows and borders.
      raised: { light: "#ffffff", dark: "#1a1b18" },
      well: { light: "#f1f2ec", dark: "#121311" },
      field: { light: "#ffffff", dark: "#121311" },
      fill: { light: "#d4ff3a", dark: "#d4ff3a" },
      "on-fill": { light: "#0b0b0a", dark: "#0b0b0a" },
      edge: { light: "#9bc21c", dark: "#a8cc2e" },
      label: { light: "#11120e", dark: "#eeefe9" },
      hint: { light: "#63665a", dark: "#95978d" },
      rim: { light: "#dcdfd3", dark: "#050505" },
      shadow: { light: "#b5b8aa", dark: "#050505" },
      chip: { light: "#f1f2ec", dark: "#262724" },
      line: { light: "#e3e5dc", dark: "#262724" },
      check: { light: "#4d7c0f", dark: "#d4ff3a" },
      on: { light: "#65a30d", dark: "#d4ff3a" },
      knob: { light: "#ffffff", dark: "#3a3b36" },
      focus: { light: "#65a30d", dark: "#d4ff3a" },
    },

    states: {
      closing: "[data-ending-style]",
      "from-left": "[data-activation-direction=left]",
      "from-right": "[data-activation-direction=right]",
      hovering: "[data-hovering]",
      opening: "[data-starting-style]",
      resizing: "[data-separator=active]",
      scrolling: "[data-scrolling]",
      swiping: "[data-swiping]",
      indented: "[data-active]",
      nested: "[data-nested-drawer-open]",
    },

    easings: {
      "in-out-cubic": "cubic-bezier(0.65, 0, 0.35, 1)",
      "out-back": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
    },

    keyframes: {
      leave: "from { opacity: 1; scale: 1; }",
      marquee: "to { translate: calc(var(--marquee-shift) * -1) 0; }",
      blink: "0%, 45% { opacity: 1; } 55%, 100% { opacity: 0; }",
      reveal: "from { opacity: 0; filter: blur(4px); }",
      shimmer: "from { mask-position: 100% 0; } to { mask-position: 0 0; }",
      pulse: "0%, 100% { opacity: .5; } 50% { opacity: 1; }",
      shake: "20%, 60% { translate: -8px 0; } 40%, 80% { translate: 8px 0; }",
      slide: "from { translate: -100% 0; } to { translate: 100% 0; }",
      spin: "to { rotate: 360deg; }",
    },

    boxShadow: {
      key: "inset 0 1px 0 light-dark(oklch(1 0 0), oklch(1 0 0 / .11)), 0 1px 0 light-dark(oklch(0.18 0.008 286 / .1), oklch(0 0 0 / .45)), 0 2px 4px -1px light-dark(oklch(0.18 0.008 286 / .08), oklch(0 0 0 / .4))",
      "key-fill":
        "inset 0 1px 0 light-dark(oklch(1 0 0 / .14), oklch(1 0 0 / .7)), 0 1px 0 light-dark(oklch(0.18 0.008 286 / .25), oklch(0 0 0 / 0)), 0 2px 4px -1px light-dark(oklch(0.18 0.008 286 / .2), oklch(0 0 0 / .35))",
      sunk: "inset 0 1px 2px light-dark(oklch(0 0 0 / .05), oklch(0 0 0 / .45))",
      pop: "0 12px 28px -12px light-dark(oklch(0 0 0 / .16), oklch(0 0 0 / .7)), 0 2px 6px -2px light-dark(oklch(0 0 0 / .05), oklch(0 0 0 / .3))",
    },
  },
});
