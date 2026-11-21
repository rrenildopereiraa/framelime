export type ColorScheme = "light" | "dark" | "auto";

export const STORAGE_KEY = "framelime-color-scheme";

export const SCHEME_CLASS: Record<ColorScheme, string> = {
  light: "cs:l",
  dark: "cs:d",
  auto: "cs:ld",
};

export const ALL_SCHEME_CLASSES = Object.values(SCHEME_CLASS);

// Inlined in the layout to apply the stored scheme before first paint.
export const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
    var scheme = stored === "light" || stored === "dark" ? stored : "auto";
    var map = ${JSON.stringify(SCHEME_CLASS)};
    var root = document.documentElement;
    root.classList.remove(${ALL_SCHEME_CLASSES.map((c) => JSON.stringify(c)).join(", ")});
    root.classList.add(map[scheme]);
  } catch (e) {}
})();
`.trim();
