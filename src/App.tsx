import { useHotkey } from "@tanstack/react-hotkeys";
import { useQueryStates } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./components/canvas";
import { CommandPalette } from "./components/command-palette";
import { EditorHeader } from "./components/editor-header";
import type { ExportFormat } from "./components/format-picker";
import { FONT_FAMILIES, type FontFamilyId, Inspector } from "./components/inspector";
import { StatusBar } from "./components/status-bar";
import { useToast } from "./components/toast-provider";
import { DrawerIndent } from "./components/ui/drawer";
import type { BackgroundSettings, FrameBackground } from "./lib/background";
import { type ResolvedMode, useChromeTheme } from "./lib/chrome-theme";
import { buildCommands, SHORTCUTS } from "./lib/commands";
import { detectLanguage, renameForLanguage } from "./lib/detect-language";
import { captureDataUrl, copyImageToClipboard, type RasterOptions } from "./lib/export";
import { canFormat, formatCode } from "./lib/format";
import {
  framesColorsEqual,
  LANGUAGES,
  type LanguageId,
  loadCustomTheme,
  normalizeThemeName,
  requireThemeFrameColors,
  THEME_FRAME_COLORS,
  themeFrameColors,
} from "./lib/highlighter";
import { useHistory } from "./lib/history";
import { type Preset, parsePresetValues, serializeSettings, usePresets } from "./lib/presets";
import { randomPatch, useRandomizeLocks } from "./lib/randomize";
import { defaultShadowColor, shadowCss } from "./lib/shadow";
import { randomSnippet, SNIPPETS } from "./lib/snippets";
import {
  clamp,
  type CornerRadii,
  DECOR_SPACING_MAX,
  DECOR_SPACING_MIN,
  type EditorDocument,
  EXPORT_SCALE_DEFAULT,
  type ExportScale,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  FRAME_WIDTH_MAX,
  FRAME_WIDTH_MIN,
  type HighlightType,
  MAX_DOCUMENTS,
  PADDING_MAX,
  PADDING_MIN,
  presetSize,
} from "./lib/types";
import { settingsParsers } from "./lib/url-state";

type Settings = ReturnType<typeof useQueryStates<typeof settingsParsers>>[0];

interface Snapshot {
  doc: Omit<EditorDocument, "id">;
  settings: Settings;
}

// Where two versions of the code stop matching, counted from the end: the
// caret goes after the text an undo or redo put back.
function changeEnd(before: string, after: string) {
  let suffix = 0;
  const max = Math.min(before.length, after.length);
  let prefix = 0;
  while (prefix < max && before[prefix] === after[prefix]) prefix++;
  while (
    suffix < max - prefix &&
    before[before.length - 1 - suffix] === after[after.length - 1 - suffix]
  ) {
    suffix++;
  }
  return after.length - suffix;
}

// Prettier's parse errors carry a code frame after the first line; the toast shows only the reason.
function formatError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.split("\n")[0].replace(/\s*\(\d+:\d+\)$/, "") || "The code could not be parsed.";
}

function App() {
  const { resolvedMode } = useChromeTheme();
  const [documents, setDocuments] = useState<EditorDocument[]>(() => {
    const snippet = randomSnippet();
    return [
      {
        id: crypto.randomUUID(),
        fileName: snippet.fileName,
        code: snippet.code,
        language: snippet.language,
        highlightedLines: [],
        highlightedWords: [],
      },
    ];
  });
  const [activeId, setActiveId] = useState(() => documents[0].id);
  const [format, setFormat] = useState<ExportFormat>("png");
  const [exportScale, setExportScale] = useState<ExportScale>(EXPORT_SCALE_DEFAULT);
  const [exporting, setExporting] = useState(false);
  const [showBoundingBox, setShowBoundingBox] = useState(true);
  const [themeIsRandom, setThemeIsRandom] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [formatting, setFormatting] = useState(false);
  // Written with `history: "replace"`, so the browser keeps no trail of
  // settings: undo has a stack of its own (see `useHistory`).
  const [settings, writeSettings] = useQueryStates(settingsParsers, {
    history: "replace",
  });
  const frameRef = useRef<HTMLDivElement>(null);
  const codeTextareaRef = useRef<HTMLTextAreaElement>(null);
  const toast = useToast();
  const history = useHistory<Snapshot>();
  const randomizeLocks = useRandomizeLocks();
  const presets = usePresets();

  const active = documents.find((doc) => doc.id === activeId) ?? documents[0];

  // The latest state, for changes that land after an await.
  const latest = useRef({ documents, settings });
  latest.current = { documents, settings };

  function snapshotOf(id: string): Snapshot | null {
    const doc = latest.current.documents.find((d) => d.id === id);
    if (!doc) return null;
    const { id: _id, ...content } = doc;
    return { doc: content, settings: latest.current.settings };
  }

  // Every change the user makes is recorded on the active snippet's stack
  // first. Changes that leave everything as it was are not steps.
  function recordChange(group: string | null) {
    const snapshot = snapshotOf(activeId);
    if (snapshot) history.record(activeId, snapshot, group);
  }

  // Settings changes merge with the same change just before (a slider or a
  // color picker drag) unless given a group of their own.
  function setSettings(patch: Partial<Settings>, group?: string | null) {
    const changed = (Object.keys(patch) as (keyof Settings)[]).filter(
      (key) => JSON.stringify(patch[key]) !== JSON.stringify(settings[key]),
    );
    if (changed.length === 0) return;
    recordChange(group === undefined ? `settings:${changed.sort().join(",")}` : group);
    writeSettings(patch);
  }

  function restore(id: string, snapshot: Snapshot) {
    const before = documents.find((doc) => doc.id === id)?.code ?? "";
    setDocuments((docs) => docs.map((doc) => (doc.id === id ? { ...doc, ...snapshot.doc } : doc)));
    writeSettings(snapshot.settings);
    // Put the caret where the code changed, as a text editor's undo does.
    const textarea = codeTextareaRef.current;
    if (textarea && before !== snapshot.doc.code) {
      const caret = changeEnd(before, snapshot.doc.code);
      requestAnimationFrame(() => textarea.setSelectionRange(caret, caret));
    }
  }

  function undo() {
    const current = snapshotOf(activeId);
    const previous = current && history.undo(activeId, current);
    if (previous) restore(activeId, previous);
  }

  function redo() {
    const current = snapshotOf(activeId);
    const next = current && history.redo(activeId, current);
    if (next) restore(activeId, next);
  }

  // The code textarea's own undo would only know about typing, and React
  // resets it on every render: route the browser's Undo and Redo, from the
  // keyboard or the context menu, to the shared stack instead.
  const undoRedo = useRef({ undo, redo });
  undoRedo.current = { undo, redo };
  useEffect(() => {
    const textarea = codeTextareaRef.current;
    if (!textarea) return;
    const handleBeforeInput = (event: InputEvent) => {
      if (event.inputType === "historyUndo") {
        event.preventDefault();
        undoRedo.current.undo();
      } else if (event.inputType === "historyRedo") {
        event.preventDefault();
        undoRedo.current.redo();
      }
    };
    const handlePaste = (event: ClipboardEvent) => {
      pasteRef.current(event.clipboardData?.getData("text/plain") ?? "");
    };
    textarea.addEventListener("beforeinput", handleBeforeInput);
    textarea.addEventListener("paste", handlePaste);
    return () => {
      textarea.removeEventListener("beforeinput", handleBeforeInput);
      textarea.removeEventListener("paste", handlePaste);
    };
  }, []);

  // A language change on a snippet that may not be the active one, as a
  // step of its own. A file name ending in the old language's extension
  // takes the new one.
  function setDocumentLanguage(id: string, language: LanguageId) {
    const doc = latest.current.documents.find((d) => d.id === id);
    if (!doc || doc.language === language) return;
    const snapshot = snapshotOf(id);
    if (snapshot) history.record(id, snapshot, null);
    const fileName = renameForLanguage(doc.fileName, doc.language, language);
    setDocuments((docs) => docs.map((d) => (d.id === id ? { ...d, language, fileName } : d)));
  }

  // Code pasted into an empty snippet, or one still holding its sample,
  // sets the language to the one it's written in. That is a step after the
  // paste, so undo puts the language back first, as does the toast's button.
  function handlePaste(text: string) {
    const { id, code, language } = active;
    const fresh = code.trim() === "" || SNIPPETS.some((snippet) => snippet.code === code);
    if (!fresh) return;
    const detected = detectLanguage(text);
    if (!detected || detected === language) return;
    // After the paste itself has landed in the snippet.
    requestAnimationFrame(() => {
      setDocumentLanguage(id, detected);
      toast.add({
        title: `Detected ${LANGUAGES[detected]}`,
        description: "From the pasted code",
        type: "info",
        action: {
          label: `Use ${LANGUAGES[language]}`,
          onClick: () => setDocumentLanguage(id, language),
        },
      });
    });
  }
  const pasteRef = useRef(handlePaste);
  pasteRef.current = handlePaste;

  const themeName = normalizeThemeName(settings.theme);

  // The frame's light/dark preference resolves independently of the app:
  // "auto" follows the app scheme, light/dark force the code block.
  const frameMode = settings.frameMode;
  const resolvedFrameMode: ResolvedMode = frameMode === "auto" ? resolvedMode : frameMode;

  // The frame follows the app scheme for adaptive themes. While the user
  // hasn't customized the frame colors (they still match the theme's
  // defaults for the other scheme), swap to the current scheme's defaults
  // on first load and whenever the mode flips. Custom themes and
  // hand-tuned colors are left untouched.
  useEffect(() => {
    const legacyTheme = normalizeThemeName(settings.theme) !== settings.theme;
    if (legacyTheme) {
      writeSettings({ theme: normalizeThemeName(settings.theme) });
    }
    const nextColors = themeFrameColors(settings.theme, resolvedFrameMode);
    const otherColors = themeFrameColors(
      settings.theme,
      resolvedFrameMode === "light" ? "dark" : "light",
    );
    if (
      nextColors &&
      otherColors &&
      framesColorsEqual(settings.colors, otherColors) &&
      !framesColorsEqual(settings.colors, nextColors)
    ) {
      writeSettings({ colors: nextColors });
    }
  }, [resolvedFrameMode, settings.theme, settings.colors, writeSettings]);

  // A hand-edited link can carry any number; the frame only draws the slider's range.
  const padding = clamp(settings.pad, PADDING_MIN, PADDING_MAX);
  const fontSize = clamp(settings.size, FONT_SIZE_MIN, FONT_SIZE_MAX);
  const decoOpacity = clamp(settings.decoOpacity, 0, 100);
  const decoGap = clamp(settings.decoGap, DECOR_SPACING_MIN, DECOR_SPACING_MAX);
  const decoColor = settings.decoColor || settings.colors.border;
  // 0 in a link sizes the frame to fit.
  const frameWidth = settings.w > 0 ? clamp(settings.w, FRAME_WIDTH_MIN, FRAME_WIDTH_MAX) : null;

  // Empty gradient stops follow the theme: the frame's page color and its
  // accent, the status bar text.
  const background: BackgroundSettings = {
    bg: settings.bg,
    gradFrom: settings.gradFrom || settings.colors.page,
    gradVia: settings.gradVia,
    gradTo: settings.gradTo || settings.colors.statusBarText,
    gradAngle: clamp(settings.gradAngle, 0, 360),
  };
  const pageColor = settings.colors.page;
  const frameBackground: FrameBackground =
    background.bg === "gradient"
      ? {
          type: "gradient",
          color: pageColor,
          stops: [background.gradFrom, background.gradVia, background.gradTo].filter(Boolean),
          angle: background.gradAngle,
        }
      : { type: background.bg, color: pageColor };

  const shadowColor = settings.shadowColor || defaultShadowColor(settings.shadow, settings.colors);
  const shadow = shadowCss(settings.shadow, shadowColor);

  // A size preset fixes the image's size; the scale applies otherwise.
  const exportSize = presetSize(settings.ratio);
  const raster: RasterOptions = { scale: exportScale, size: exportSize };

  function setBackground(patch: Partial<BackgroundSettings>) {
    // Switching the type is a step of its own; tuning one merges.
    setSettings(patch, "bg" in patch ? null : undefined);
  }

  const radii: CornerRadii = {
    tl: settings.rtl,
    tr: settings.rtr,
    bl: settings.rbl,
    br: settings.rbr,
  };

  function setRadii(next: CornerRadii) {
    setSettings({ rtl: next.tl, rtr: next.tr, rbl: next.bl, rbr: next.br });
  }

  // Typing, renaming and picking a language merge with the same change just
  // before; a highlight is always a step of its own.
  function updateActive(patch: Partial<EditorDocument>, group?: string | null) {
    const changed = (Object.keys(patch) as (keyof EditorDocument)[]).filter(
      (key) => JSON.stringify(patch[key]) !== JSON.stringify(active[key]),
    );
    if (changed.length === 0) return;
    recordChange(group === undefined ? `doc:${changed.sort().join(",")}` : group);
    setDocuments((docs) => docs.map((doc) => (doc.id === activeId ? { ...doc, ...patch } : doc)));
  }

  const HIGHLIGHT_CYCLE: HighlightType[] = ["mark", "add", "remove"];

  function nextHighlightType(current: HighlightType | undefined) {
    if (current === undefined) return "mark" as const;
    const index = HIGHLIGHT_CYCLE.indexOf(current);
    return index === HIGHLIGHT_CYCLE.length - 1 ? null : HIGHLIGHT_CYCLE[index + 1];
  }

  // A plain click (no drag) on a single line cycles its type instead of a
  // binary toggle, so mark/add/remove are all reachable from one gesture.
  function cycleLineHighlight(line: number) {
    const current = active.highlightedLines;
    const existing = current.find((l) => l.line === line);
    const next = nextHighlightType(existing?.type);
    const withoutLine = current.filter((l) => l.line !== line);
    updateActive(
      {
        highlightedLines: next ? [...withoutLine, { line, type: next }] : withoutLine,
      },
      null,
    );
  }

  // Dragging across multiple lines sets the whole range to "mark" in one
  // gesture; dragging back over an already-all-marked range clears it.
  function setLineRangeHighlight(startLine: number, endLine: number) {
    const from = Math.min(startLine, endLine);
    const to = Math.max(startLine, endLine);
    const current = active.highlightedLines;
    const rangeLines: number[] = [];
    for (let line = from; line <= to; line++) rangeLines.push(line);
    const allAlreadyMarked = rangeLines.every((line) =>
      current.some((l) => l.line === line && l.type === "mark"),
    );
    const withoutRange = current.filter((l) => l.line < from || l.line > to);
    updateActive(
      {
        highlightedLines: allAlreadyMarked
          ? withoutRange
          : [...withoutRange, ...rangeLines.map((line) => ({ line, type: "mark" as const }))],
      },
      null,
    );
  }

  // A plain click (no drag) cycles whatever range sits exactly under the
  // cursor - an existing highlight if there is one, otherwise the whole
  // word - through mark -> add -> remove -> off.
  function cycleWordHighlight(line: number, startCol: number, endCol: number) {
    const current = active.highlightedWords;
    const existing = current.find(
      (w) => w.line === line && w.startCol === startCol && w.endCol === endCol,
    );
    const next = nextHighlightType(existing?.type);
    const withoutWord = current.filter(
      (w) => !(w.line === line && w.startCol === startCol && w.endCol === endCol),
    );
    updateActive(
      {
        highlightedWords: next
          ? [...withoutWord, { line, startCol, endCol, type: next }]
          : withoutWord,
      },
      null,
    );
  }

  // Dragging across text - possibly spanning multiple lines - marks the
  // exact selected range with character precision instead of snapping to
  // whole tokens; dragging back over an already-all-marked selection
  // clears it, mirroring the line-range gesture.
  function setWordRangeHighlight(ranges: { line: number; startCol: number; endCol: number }[]) {
    if (ranges.length === 0) return;
    const current = active.highlightedWords;
    const allAlreadyMarked = ranges.every((r) =>
      current.some(
        (w) =>
          w.line === r.line &&
          w.startCol === r.startCol &&
          w.endCol === r.endCol &&
          w.type === "mark",
      ),
    );
    const overlaps = (w: { line: number; startCol: number; endCol: number }) =>
      ranges.some((r) => r.line === w.line && r.startCol < w.endCol && r.endCol > w.startCol);
    const withoutOverlaps = current.filter((w) => !overlaps(w));
    updateActive(
      {
        highlightedWords: allAlreadyMarked
          ? withoutOverlaps
          : [...withoutOverlaps, ...ranges.map((r) => ({ ...r, type: "mark" as const }))],
      },
      null,
    );
  }

  function highlightCurrentLine() {
    const textarea = codeTextareaRef.current;
    if (!textarea) return;
    const caret = textarea.selectionStart;
    const line = active.code.slice(0, caret).split("\n").length - 1;
    cycleLineHighlight(line);
  }

  function clearHighlights() {
    updateActive({ highlightedLines: [], highlightedWords: [] }, null);
  }

  function addDocument() {
    if (documents.length >= MAX_DOCUMENTS) {
      toast.add({
        title: "Snippet limit reached",
        description: `You can have up to ${MAX_DOCUMENTS} snippets.`,
        type: "error",
      });
      return;
    }
    const snippet = randomSnippet();
    const doc: EditorDocument = {
      id: crypto.randomUUID(),
      fileName: snippet.fileName,
      code: snippet.code,
      language: snippet.language,
      highlightedLines: [],
      highlightedWords: [],
    };
    setDocuments((docs) => (docs.length >= MAX_DOCUMENTS ? docs : [...docs, doc]));
    setActiveId(doc.id);
  }

  function closeDocument(id: string) {
    if (documents.length <= 1) return;
    const index = documents.findIndex((doc) => doc.id === id);
    const remaining = documents.filter((doc) => doc.id !== id);
    setDocuments(remaining);
    history.forget(id);
    if (id === activeId) {
      setActiveId(remaining[Math.min(index, remaining.length - 1)].id);
    }
  }

  function selectDocument(id: string) {
    setActiveId(id);
  }

  async function handleUploadTheme(file: File) {
    try {
      const result = await loadCustomTheme(await file.text());
      recordChange(null);
      writeSettings({ theme: result.name, colors: result.frameColors });
      setThemeIsRandom(false);
      toast.add({
        title: "Theme loaded",
        description: result.name,
        type: "success",
      });
    } catch {
      toast.add({
        title: "Invalid theme",
        description: "Could not parse the uploaded file as a VS Code color theme.",
        type: "error",
      });
    }
  }

  function handleThemeChange(name: string) {
    const colors = themeFrameColors(name, resolvedFrameMode);
    setSettings({ theme: name, ...(colors ? { colors } : {}) }, null);
  }

  function handleManualThemeChange(name: string) {
    handleThemeChange(name);
    setThemeIsRandom(false);
  }

  // Locked groups keep their settings; locking the theme randomizes everything else.
  function randomizeAll() {
    const patch = randomPatch({
      locks: randomizeLocks.locks,
      currentTheme: themeName,
      themeNames: Object.keys(THEME_FRAME_COLORS),
      colorsFor: (name) => requireThemeFrameColors(name, resolvedFrameMode),
      fontIds: Object.keys(FONT_FAMILIES) as FontFamilyId[],
    });
    setSettings(patch, null);
    if (patch.theme !== undefined) setThemeIsRandom(true);
  }

  function savePreset(name: string) {
    presets.save(name, serializeSettings(settingsParsers, settings));
    toast.add({ title: "Preset saved", description: name, type: "success" });
  }

  // Everything but the code, in one step.
  function applyPreset(preset: Preset) {
    setSettings(parsePresetValues(settingsParsers, preset.values) as Partial<Settings>, null);
    setThemeIsRandom(false);
  }

  function removePreset(preset: Preset) {
    presets.remove(preset.id);
    toast.add({
      title: "Preset deleted",
      description: preset.name,
      action: { label: "Undo", onClick: () => presets.save(preset.name, preset.values) },
    });
  }

  // A format is one step, and is dropped if the code changed while Prettier
  // was loading or running.
  async function formatActive() {
    const id = active.id;
    const { code, language } = active;
    if (!canFormat(language) || formatting) return;
    setFormatting(true);
    try {
      const formatted = await formatCode(code, language);
      const doc = latest.current.documents.find((d) => d.id === id);
      if (!doc || doc.code !== code || formatted === code) return;
      const snapshot = snapshotOf(id);
      if (snapshot) history.record(id, snapshot, null);
      setDocuments((docs) => docs.map((d) => (d.id === id ? { ...d, code: formatted } : d)));
    } catch (error) {
      toast.add({
        title: "Couldn't format",
        description: formatError(error),
        type: "error",
      });
    } finally {
      setFormatting(false);
    }
  }

  // How big the image came out, for the toast; SVG has no pixel size.
  function exportDetail() {
    if (format === "svg") return "";
    return exportSize ? `, ${exportSize.width} × ${exportSize.height}` : ` at ${exportScale}×`;
  }

  async function handleExport() {
    if (!frameRef.current || exporting) return;
    setExporting(true);
    try {
      const dataUrl = await captureDataUrl(
        frameRef.current,
        format,
        raster,
        frameBackground.type === "transparent" ? pageColor : undefined,
      );
      const link = document.createElement("a");
      link.download = `${active.fileName || "framelime"}.${format}`;
      link.href = dataUrl;
      link.click();
      toast.add({
        title: "Exported",
        description: `Downloaded as ${format.toUpperCase()}${exportDetail()}`,
        type: "success",
      });
    } finally {
      setExporting(false);
    }
  }

  async function handleCopyImage() {
    if (!frameRef.current) return;
    await copyImageToClipboard(frameRef.current, raster);
    toast.add({
      title: "Copied",
      description: "Image copied to clipboard",
      type: "success",
    });
  }

  async function handleShare() {
    await navigator.clipboard.writeText(window.location.href);
    toast.add({
      title: "Link copied",
      description: "Anyone with this link sees the same settings",
      type: "success",
    });
  }

  useHotkey("Mod+K", (event) => {
    event.preventDefault();
    setPaletteOpen((open) => !open);
  });
  useHotkey("Mod+S", (event) => {
    event.preventDefault();
    handleExport();
  });
  useHotkey("Mod+Shift+C", (event) => {
    event.preventDefault();
    handleCopyImage();
  });
  useHotkey("Mod+Shift+R", (event) => {
    event.preventDefault();
    randomizeAll();
  });

  // Undo and redo belong to the frame: other fields, like the palette's
  // search, keep their own.
  function ownsUndo(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return true;
    const editable = target.closest("input, textarea, select, [contenteditable]");
    return !editable || (frameRef.current?.contains(editable) ?? false);
  }
  const UNDO_OPTIONS = { preventDefault: false, stopPropagation: false, ignoreInputs: false };
  useHotkey(
    "Mod+Z",
    (event) => {
      if (!ownsUndo(event.target)) return;
      event.preventDefault();
      undo();
    },
    UNDO_OPTIONS,
  );
  function redoHotkey(event: KeyboardEvent) {
    if (!ownsUndo(event.target)) return;
    event.preventDefault();
    redo();
  }
  useHotkey("Mod+Shift+Z", redoHotkey, UNDO_OPTIONS);
  useHotkey("Mod+Y", redoHotkey, UNDO_OPTIONS);
  useHotkey(
    "Alt+Shift+F",
    (event) => {
      event.preventDefault();
      void formatActive();
    },
    { ignoreInputs: false },
  );

  const commands = buildCommands({
    showTabBar: settings.tabBar,
    onShowTabBarChange: (value) => setSettings({ tabBar: value }),
    showStatusBar: settings.statusBar,
    onShowStatusBarChange: (value) => setSettings({ statusBar: value }),
    showLineNumbers: settings.lines,
    onShowLineNumbersChange: (value) => setSettings({ lines: value }),
    onLabelPositionChange: (value) => setSettings({ label: value }),
    documents,
    activeId,
    onSelectDocument: selectDocument,
    showDecorators: settings.deco,
    onShowDecoratorsChange: (value) => setSettings({ deco: value }),
    padding,
    onPaddingChange: (value) => setSettings({ pad: value }),
    fontSize,
    onFontSizeChange: (value) => setSettings({ size: value }),
    onAspectRatioChange: (value) => setSettings({ ratio: value }),
    onSetLanguage: (value) => updateActive({ language: value }),
    onSetFormat: setFormat,
    onSetFontFamily: (value) => setSettings({ font: value }),
    onCopyCode: () => {
      navigator.clipboard.writeText(active.code);
      toast.add({
        title: "Copied",
        description: "Code copied to clipboard",
        type: "success",
      });
    },
    onExport: handleExport,
    onCopyImage: handleCopyImage,
    onNewDocument: addDocument,
    onCloseDocument: () => closeDocument(activeId),
    onRandomizeAll: randomizeAll,
    onClearHighlights: clearHighlights,
    onHighlightCurrentLine: highlightCurrentLine,
    onUndo: undo,
    onRedo: redo,
    onFormat: canFormat(active.language) ? formatActive : undefined,
    exportScale,
    onSetExportScale: setExportScale,
    onSetShadow: (value) => setSettings({ shadow: value }),
    presets: presets.presets,
    onApplyPreset: applyPreset,
  });

  // `is:i` keeps the editor's z-indexes inside the app, so the settings
  // drawer, portaled to the body, always paints above the frame.
  return (
    <DrawerIndent className="bg:page">
      <div className="app-root is:i d:f fd:c h:vh o:h bg:page">
        <EditorHeader
          onOpenPalette={() => setPaletteOpen(true)}
          onCopy={handleCopyImage}
          onExport={handleExport}
          onShare={handleShare}
          exporting={exporting}
          format={format}
          onFormatChange={setFormat}
          scale={exportScale}
          onScaleChange={setExportScale}
          presetSize={exportSize}
        />

        <div className="f:1 d:f min-h:0">
          <Canvas
            code={active.code}
            onCodeChange={(value) => updateActive({ code: value })}
            language={active.language}
            fileName={active.fileName}
            onFileNameChange={(value) => updateActive({ fileName: value })}
            highlightedLines={active.highlightedLines}
            highlightedWords={active.highlightedWords}
            onCycleLineHighlight={cycleLineHighlight}
            onSetLineRangeHighlight={setLineRangeHighlight}
            onCycleWordHighlight={cycleWordHighlight}
            onSetWordRangeHighlight={setWordRangeHighlight}
            textareaRef={codeTextareaRef}
            showTabBar={settings.tabBar}
            showStatusBar={settings.statusBar}
            aspectRatio={settings.ratio}
            frameWidth={frameWidth}
            onFrameWidthChange={(value) => setSettings({ w: value ?? 0 })}
            radii={radii}
            fontFamily={FONT_FAMILIES[settings.font].stack}
            themeName={themeName}
            colors={settings.colors}
            showBoundingBox={showBoundingBox}
            frameRef={frameRef}
            mode={resolvedFrameMode}
            padding={padding}
            fontSize={fontSize}
            showLineNumbers={settings.lines}
            labelPosition={settings.label}
            tabs={documents.map(({ id, fileName }) => ({ id, fileName }))}
            activeTabId={activeId}
            onSelectTab={selectDocument}
            onCloseTab={closeDocument}
            onAddTab={documents.length < MAX_DOCUMENTS ? addDocument : undefined}
            decorators={
              settings.deco ? { color: decoColor, opacity: decoOpacity, gap: decoGap } : null
            }
            background={frameBackground}
            shadow={shadow}
          />

          <Inspector
            open={inspectorOpen}
            onOpenChange={setInspectorOpen}
            language={active.language}
            onLanguageChange={(value) => updateActive({ language: value })}
            onRandomize={randomizeAll}
            randomizeLocks={randomizeLocks.locks}
            onRandomizeLockChange={randomizeLocks.setLocked}
            showTabBar={settings.tabBar}
            onShowTabBarChange={(value) => setSettings({ tabBar: value })}
            showStatusBar={settings.statusBar}
            onShowStatusBarChange={(value) => setSettings({ statusBar: value })}
            showLineNumbers={settings.lines}
            onShowLineNumbersChange={(value) => setSettings({ lines: value })}
            labelPosition={settings.label}
            onLabelPositionChange={(value) => setSettings({ label: value })}
            showDecorators={settings.deco}
            onShowDecoratorsChange={(value) => setSettings({ deco: value })}
            decoratorColor={decoColor}
            onDecoratorColorChange={(value) => setSettings({ decoColor: value })}
            decoratorOpacity={decoOpacity}
            onDecoratorOpacityChange={(value) => setSettings({ decoOpacity: value })}
            decoratorSpacing={decoGap}
            onDecoratorSpacingChange={(value) => setSettings({ decoGap: value })}
            padding={padding}
            onPaddingChange={(value) => setSettings({ pad: value })}
            fontSize={fontSize}
            onFontSizeChange={(value) => setSettings({ size: value })}
            showBoundingBox={showBoundingBox}
            onShowBoundingBoxChange={setShowBoundingBox}
            aspectRatio={settings.ratio}
            onAspectRatioChange={(value) => setSettings({ ratio: value })}
            radii={radii}
            onRadiiChange={setRadii}
            fontFamily={settings.font}
            onFontFamilyChange={(value) => setSettings({ font: value })}
            themeName={themeName}
            onThemeChange={handleManualThemeChange}
            themeIsRandom={themeIsRandom}
            frameMode={frameMode}
            resolvedFrameMode={resolvedFrameMode}
            onFrameModeChange={(value) => setSettings({ frameMode: value })}
            frameColors={settings.colors}
            onFrameColorsChange={(value) => setSettings({ colors: value })}
            onUploadTheme={handleUploadTheme}
            background={background}
            onBackgroundChange={setBackground}
            shadow={settings.shadow}
            onShadowChange={(value) => setSettings({ shadow: value })}
            shadowColor={shadowColor}
            onShadowColorChange={(value) => setSettings({ shadowColor: value })}
            presets={presets.presets}
            onSavePreset={savePreset}
            onApplyPreset={applyPreset}
            onRemovePreset={removePreset}
          />
        </div>

        <StatusBar
          language={active.language}
          onLanguageChange={(value) => updateActive({ language: value })}
          onRandomize={randomizeAll}
          randomizeLocks={randomizeLocks.locks}
          onRandomizeLockChange={randomizeLocks.setLocked}
          canFormat={canFormat(active.language)}
          onFormat={formatActive}
          formatting={formatting}
        />

        <CommandPalette
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
          commands={commands}
          shortcuts={SHORTCUTS}
        />
      </div>
    </DrawerIndent>
  );
}

export default App;
