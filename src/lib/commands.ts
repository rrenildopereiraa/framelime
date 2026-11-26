import type { ExportFormat } from "../components/format-picker";
import { FONT_FAMILIES, type FontFamilyId } from "../components/inspector";
import { LANGUAGES, type LanguageId } from "./highlighter";
import { modLabel } from "./platform";
import type { Preset } from "./presets";
import {
  ASPECT_RATIOS,
  type AspectRatio,
  type EditorDocument,
  FONT_SIZE_DEFAULT,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  LABEL_POSITIONS,
  type LabelPosition,
  PADDING_MAX,
  PADDING_MIN,
  PADDING_STEP,
  EXPORT_SCALES,
  type ExportScale,
  SHADOW_STYLES,
  type ShadowStyle,
} from "./types";

export interface Command {
  id: string;
  label: string;
  kbd?: string;
  run: () => void;
}

export interface Shortcut {
  label: string;
  /** Keys pressed together, space-separated, as a command's `kbd`. */
  kbd: string;
}

/** Every shortcut, for the palette's list. Commands repeat the ones they run. */
export const SHORTCUTS: Shortcut[] = [
  { label: "Open the command palette", kbd: `${modLabel} K` },
  { label: "Export", kbd: `${modLabel} S` },
  { label: "Copy image to clipboard", kbd: `${modLabel} Shift C` },
  { label: "Randomize appearance", kbd: `${modLabel} Shift R` },
  { label: "Undo", kbd: `${modLabel} Z` },
  { label: "Redo", kbd: `${modLabel} Shift Z` },
  { label: "Redo", kbd: `${modLabel} Y` },
  { label: "Format code", kbd: "Alt Shift F" },
  { label: "Indent", kbd: "Tab" },
  { label: "Outdent", kbd: "Shift Tab" },
  { label: "Highlight a line, then add, remove, off", kbd: "Alt Click" },
  { label: "Highlight a range of lines", kbd: "Alt Drag" },
  { label: "Highlight words", kbd: "Alt Shift Drag" },
];

export function buildCommands({
  showTabBar,
  onShowTabBarChange,
  showStatusBar,
  onShowStatusBarChange,
  showLineNumbers,
  onShowLineNumbersChange,
  onLabelPositionChange,
  documents,
  activeId,
  onSelectDocument,
  showDecorators,
  onShowDecoratorsChange,
  padding,
  onPaddingChange,
  fontSize,
  onFontSizeChange,
  onAspectRatioChange,
  onSetLanguage,
  onSetFormat,
  onSetFontFamily,
  onCopyCode,
  onExport,
  onCopyImage,
  onNewDocument,
  onCloseDocument,
  onRandomizeAll,
  onClearHighlights,
  onHighlightCurrentLine,
  onUndo,
  onRedo,
  onFormat,
  exportScale,
  onSetExportScale,
  onSetShadow,
  presets,
  onApplyPreset,
}: {
  showTabBar: boolean;
  onShowTabBarChange: (value: boolean) => void;
  showStatusBar: boolean;
  onShowStatusBarChange: (value: boolean) => void;
  showLineNumbers: boolean;
  onShowLineNumbersChange: (value: boolean) => void;
  onLabelPositionChange: (value: LabelPosition) => void;
  documents: EditorDocument[];
  activeId: string;
  onSelectDocument: (id: string) => void;
  showDecorators: boolean;
  onShowDecoratorsChange: (value: boolean) => void;
  padding: number;
  onPaddingChange: (value: number) => void;
  fontSize: number;
  onFontSizeChange: (value: number) => void;
  onAspectRatioChange: (value: AspectRatio) => void;
  onSetLanguage: (value: LanguageId) => void;
  onSetFormat: (value: ExportFormat) => void;
  onSetFontFamily: (value: FontFamilyId) => void;
  onCopyCode: () => void;
  onExport: () => void;
  onCopyImage: () => void;
  onNewDocument: () => void;
  onCloseDocument: () => void;
  onRandomizeAll: () => void;
  onClearHighlights: () => void;
  onHighlightCurrentLine: () => void;
  onUndo: () => void;
  onRedo: () => void;
  // Left out for languages Prettier can't format without a plugin.
  onFormat?: () => void;
  exportScale: ExportScale;
  onSetExportScale: (value: ExportScale) => void;
  onSetShadow: (value: ShadowStyle) => void;
  presets: Preset[];
  onApplyPreset: (preset: Preset) => void;
}): Command[] {
  return [
    {
      id: "undo",
      label: "Undo",
      kbd: `${modLabel} Z`,
      run: onUndo,
    },
    {
      id: "redo",
      label: "Redo",
      kbd: `${modLabel} Shift Z`,
      run: onRedo,
    },
    ...(onFormat
      ? [
          {
            id: "format-code",
            label: "Format code",
            kbd: "Alt Shift F",
            run: onFormat,
          },
        ]
      : []),
    {
      id: "new-snippet",
      label: "New snippet",
      run: onNewDocument,
    },
    {
      id: "close-snippet",
      label: "Close snippet",
      run: onCloseDocument,
    },
    {
      id: "randomize",
      label: "Randomize appearance",
      kbd: `${modLabel} Shift R`,
      run: onRandomizeAll,
    },
    {
      id: "highlight-current-line",
      label: "Toggle highlight: current line",
      run: onHighlightCurrentLine,
    },
    {
      id: "clear-highlights",
      label: "Clear highlights",
      run: onClearHighlights,
    },
    {
      id: "export",
      label: "Export",
      kbd: `${modLabel} S`,
      run: onExport,
    },
    {
      id: "copy-image",
      label: "Copy image to clipboard",
      kbd: `${modLabel} Shift C`,
      run: onCopyImage,
    },
    {
      id: "copy-code",
      label: "Copy code to clipboard",
      run: onCopyCode,
    },
    {
      id: "toggle-tab-bar",
      label: `${showTabBar ? "Hide" : "Show"} tab bar`,
      run: () => onShowTabBarChange(!showTabBar),
    },
    {
      id: "toggle-status-bar",
      label: `${showStatusBar ? "Hide" : "Show"} status bar`,
      run: () => onShowStatusBarChange(!showStatusBar),
    },
    {
      id: "toggle-line-numbers",
      label: `${showLineNumbers ? "Hide" : "Show"} line numbers`,
      run: () => onShowLineNumbersChange(!showLineNumbers),
    },
    // Reaches every snippet while the tab bar is hidden.
    ...documents
      .filter((doc) => doc.id !== activeId)
      .map((doc): Command => ({
        id: `switch-snippet-${doc.id}`,
        label: `Switch to snippet: ${doc.fileName || "Untitled"}`,
        run: () => onSelectDocument(doc.id),
      })),
    {
      id: "toggle-decorators",
      label: `${showDecorators ? "Hide" : "Show"} hash lines`,
      run: () => onShowDecoratorsChange(!showDecorators),
    },
    {
      id: "font-size-increase",
      label: "Increase font size",
      run: () => onFontSizeChange(Math.min(FONT_SIZE_MAX, fontSize + 1)),
    },
    {
      id: "font-size-decrease",
      label: "Decrease font size",
      run: () => onFontSizeChange(Math.max(FONT_SIZE_MIN, fontSize - 1)),
    },
    {
      id: "font-size-reset",
      label: "Reset font size",
      run: () => onFontSizeChange(FONT_SIZE_DEFAULT),
    },
    {
      id: "padding-increase",
      label: "Increase padding",
      run: () => onPaddingChange(Math.min(PADDING_MAX, padding + PADDING_STEP)),
    },
    {
      id: "padding-decrease",
      label: "Decrease padding",
      run: () => onPaddingChange(Math.max(PADDING_MIN, padding - PADDING_STEP)),
    },
    ...LABEL_POSITIONS.map(({ id, label }): Command => ({
      id: `language-label-${id}`,
      label: `Language label: ${label}`,
      run: () => onLabelPositionChange(id),
    })),
    ...ASPECT_RATIOS.map(({ id, label }): Command => ({
      id: `aspect-ratio-${id}`,
      label: `Aspect ratio: ${label}`,
      run: () => onAspectRatioChange(id),
    })),
    ...(Object.keys(FONT_FAMILIES) as FontFamilyId[]).map((id): Command => ({
      id: `font-family-${id}`,
      label: `Set font family: ${FONT_FAMILIES[id].label}`,
      run: () => onSetFontFamily(id),
    })),
    ...(Object.entries(LANGUAGES) as [LanguageId, string][]).map(([id, label]): Command => ({
      id: `language-${id}`,
      label: `Set language: ${label}`,
      run: () => onSetLanguage(id),
    })),
    ...(["png", "jpg", "webp", "svg"] as ExportFormat[]).map((id): Command => ({
      id: `format-${id}`,
      label: `Set format: ${id.toUpperCase()}`,
      run: () => onSetFormat(id),
    })),
    ...EXPORT_SCALES.filter((scale) => scale !== exportScale).map((scale): Command => ({
      id: `export-scale-${scale}`,
      label: `Set export scale: ${scale}×`,
      run: () => onSetExportScale(scale),
    })),
    ...SHADOW_STYLES.map(({ id, label }): Command => ({
      id: `shadow-${id}`,
      label: `Shadow: ${label}`,
      run: () => onSetShadow(id),
    })),
    ...presets.map((preset): Command => ({
      id: `preset-${preset.id}`,
      label: `Apply preset: ${preset.name}`,
      run: () => onApplyPreset(preset),
    })),
  ];
}
