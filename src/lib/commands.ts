import type { ExportFormat } from "../components/format-picker";
import { FONT_FAMILIES, type FontFamilyId } from "../components/inspector";
import { LANGUAGES, type LanguageId } from "./highlighter";
import { modLabel } from "./platform";
import {
  ASPECT_RATIOS,
  type AspectRatio,
  FONT_SIZE_DEFAULT,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  LABEL_POSITIONS,
  type LabelPosition,
  PADDING_MAX,
  PADDING_MIN,
  PADDING_STEP,
  WINDOW_STYLES,
  type WindowStyle,
} from "./types";

export interface Command {
  id: string;
  label: string;
  kbd?: string;
  run: () => void;
}

export function buildCommands({
  showTabBar,
  onShowTabBarChange,
  showStatusBar,
  onShowStatusBarChange,
  showLineNumbers,
  onShowLineNumbersChange,
  onLabelPositionChange,
  onWindowStyleChange,
  showFrameTabs,
  onShowFrameTabsChange,
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
}: {
  showTabBar: boolean;
  onShowTabBarChange: (value: boolean) => void;
  showStatusBar: boolean;
  onShowStatusBarChange: (value: boolean) => void;
  showLineNumbers: boolean;
  onShowLineNumbersChange: (value: boolean) => void;
  onLabelPositionChange: (value: LabelPosition) => void;
  onWindowStyleChange: (value: WindowStyle) => void;
  showFrameTabs: boolean;
  onShowFrameTabsChange: (value: boolean) => void;
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
    {
      id: "toggle-frame-tabs",
      label: `${showFrameTabs ? "Hide" : "Show"} snippets as tabs in the frame`,
      run: () => onShowFrameTabsChange(!showFrameTabs),
    },
    {
      id: "toggle-decorators",
      label: `${showDecorators ? "Hide" : "Show"} hash lines`,
      run: () => onShowDecoratorsChange(!showDecorators),
    },
    ...WINDOW_STYLES.map(({ id, label }): Command => ({
      id: `window-style-${id}`,
      label: `Window style: ${label}`,
      run: () => onWindowStyleChange(id),
    })),
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
  ];
}
