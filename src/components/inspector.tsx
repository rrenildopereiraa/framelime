import { IconArrowsShuffle, IconLayout, IconPalette, IconUpload } from "@tabler/icons-react";
import { useState } from "react";
import Button from "@/components/ui/button.tsx";
import Separator from "@/components/ui/separator.tsx";
import Slider from "@/components/ui/slider.tsx";
import Switch from "@/components/ui/switch.tsx";
import Tabs from "@/components/ui/tabs.tsx";
import { type ChromeMode, type FrameMode, useChromeTheme } from "../lib/chrome-theme";
import { LANGUAGES, type LanguageId, THEMES } from "../lib/highlighter";
import {
  ASPECT_RATIOS,
  type AspectRatio,
  type CornerRadii,
  DECOR_SPACING_MAX,
  DECOR_SPACING_MIN,
  DECOR_SPACING_STEP,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  LABEL_POSITIONS,
  type LabelPosition,
  PADDING_MAX,
  PADDING_MIN,
  PADDING_STEP,
  WINDOW_STYLES,
  type WindowStyle,
} from "../lib/types";
import { BottomSheet, SubSheet } from "./bottom-sheet";
import { ColorInput } from "./color-input";
import type { FrameColors } from "./frame";
import { PickerField } from "./picker-field";
import { RadiusControl } from "./radius-control";

export type { CornerRadii };

const CHROME_MODE_OPTIONS: { id: ChromeMode; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "auto", label: "Auto (OS)" },
];

// The frame code block's own light/dark preference, independent of the
// app scheme. Auto keeps the frame following the app.
const FRAME_MODE_OPTIONS: { id: FrameMode; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "auto", label: "Auto (app)" },
];

export type FontFamilyId = "default" | "jetbrains-mono" | "fira-code" | "ibm-plex-mono";

export const FONT_FAMILIES: Record<FontFamilyId, { label: string; stack?: string }> = {
  default: { label: "System Mono" },
  "jetbrains-mono": {
    label: "JetBrains Mono",
    stack: '"JetBrains Mono", monospace',
  },
  "fira-code": { label: "Fira Code", stack: '"Fira Code", monospace' },
  "ibm-plex-mono": {
    label: "IBM Plex Mono",
    stack: '"IBM Plex Mono", monospace',
  },
};

const FRAME_COLOR_FIELDS: { key: keyof FrameColors; label: string }[] = [
  { key: "page", label: "Background" },
  { key: "surface", label: "Surface" },
  { key: "border", label: "Border" },
  { key: "accentDim", label: "Text" },
  { key: "tabBar", label: "Tab bar, inactive tabs" },
  { key: "tabActive", label: "Active tab" },
  { key: "statusBarBg", label: "Status bar" },
  { key: "statusBarText", label: "Status bar text" },
  { key: "highlightMark", label: "Highlight" },
  { key: "highlightAdd", label: "Highlight add" },
  { key: "highlightRemove", label: "Highlight remove" },
];

type SettingsTab = "layout" | "style";

function SettingsTabs({
  tab,
  onTabChange,
}: {
  tab: SettingsTab;
  onTabChange: (value: SettingsTab) => void;
}) {
  return (
    <Tabs
      size="sm"
      shape="pill"
      value={tab}
      onValueChange={(value) => onTabChange(value as SettingsTab)}
      items={[
        { value: "layout", label: "Layout" },
        { value: "style", label: "Style" },
      ]}
      className="inspector-tabs w:100% mb:5"
    />
  );
}

function SliderField({
  label,
  value,
  onValueChange,
  min,
  max,
  step,
  unit = "px",
}: {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
}) {
  return (
    <div className="pb:4">
      <Slider
        label={label}
        value={value}
        onValueChange={(next) => onValueChange(Array.isArray(next) ? next[0] : next)}
        min={min}
        max={max}
        step={step}
        unit={unit}
        className="w:100%"
      />
    </div>
  );
}

/** A small heading over a group, on Yumma UI's separator. */
function SectionSeparator({ label }: { label: string }) {
  return (
    <div className="pt:1 pb:3">
      <Separator label={label} />
    </div>
  );
}

function OptionSwitch({
  label,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="d:f ai:c jc:sb g:2 pb:3">
      <span className={`fs:sm us:none c:hint ${disabled ? "o:60" : ""}`}>{label}</span>
      <Switch
        ariaLabel={label}
        size="sm"
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}

interface InspectorContentProps {
  tab: SettingsTab;
  showTabBar: boolean;
  onShowTabBarChange: (value: boolean) => void;
  showStatusBar: boolean;
  onShowStatusBarChange: (value: boolean) => void;
  showLineNumbers: boolean;
  onShowLineNumbersChange: (value: boolean) => void;
  labelPosition: LabelPosition;
  onLabelPositionChange: (value: LabelPosition) => void;
  windowStyle: WindowStyle;
  onWindowStyleChange: (value: WindowStyle) => void;
  showDecorators: boolean;
  onShowDecoratorsChange: (value: boolean) => void;
  decoratorColor: string;
  onDecoratorColorChange: (value: string) => void;
  decoratorOpacity: number;
  onDecoratorOpacityChange: (value: number) => void;
  decoratorSpacing: number;
  onDecoratorSpacingChange: (value: number) => void;
  padding: number;
  onPaddingChange: (value: number) => void;
  fontSize: number;
  onFontSizeChange: (value: number) => void;
  showBoundingBox: boolean;
  onShowBoundingBoxChange: (value: boolean) => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (value: AspectRatio) => void;
  radii: CornerRadii;
  onRadiiChange: (value: CornerRadii) => void;
  fontFamily: FontFamilyId;
  onFontFamilyChange: (value: FontFamilyId) => void;
  themeName: string;
  onThemeChange: (value: string) => void;
  themeIsRandom: boolean;
  frameMode: FrameMode;
  onFrameModeChange: (value: FrameMode) => void;
  frameColors: FrameColors;
  onFrameColorsChange: (value: FrameColors) => void;
  onUploadTheme: (file: File) => void;
}

function InspectorContent({
  tab,
  showTabBar,
  onShowTabBarChange,
  showStatusBar,
  onShowStatusBarChange,
  showLineNumbers,
  onShowLineNumbersChange,
  labelPosition,
  onLabelPositionChange,
  windowStyle,
  onWindowStyleChange,
  showDecorators,
  onShowDecoratorsChange,
  decoratorColor,
  onDecoratorColorChange,
  decoratorOpacity,
  onDecoratorOpacityChange,
  decoratorSpacing,
  onDecoratorSpacingChange,
  padding,
  onPaddingChange,
  fontSize,
  onFontSizeChange,
  showBoundingBox,
  onShowBoundingBoxChange,
  aspectRatio,
  onAspectRatioChange,
  radii,
  onRadiiChange,
  fontFamily,
  onFontFamilyChange,
  themeName,
  onThemeChange,
  themeIsRandom,
  frameMode,
  onFrameModeChange,
  frameColors,
  onFrameColorsChange,
  onUploadTheme,
}: InspectorContentProps) {
  if (tab === "layout") {
    return (
      <>
        <PickerField
          label="Window style"
          value={windowStyle}
          options={WINDOW_STYLES}
          onValueChange={onWindowStyleChange}
        />
        <OptionSwitch
          label="Tab bar"
          checked={showTabBar}
          onCheckedChange={onShowTabBarChange}
          disabled={windowStyle !== "frame"}
        />
        <OptionSwitch
          label="Bounding box"
          checked={showBoundingBox}
          onCheckedChange={onShowBoundingBoxChange}
        />
        <OptionSwitch
          label="Status bar"
          checked={showStatusBar}
          onCheckedChange={onShowStatusBarChange}
          disabled={windowStyle === "none"}
        />
        <OptionSwitch
          label="Line numbers"
          checked={showLineNumbers}
          onCheckedChange={onShowLineNumbersChange}
        />

        <RadiusControl radii={radii} onRadiiChange={onRadiiChange} />

        <SliderField
          label="Padding"
          value={padding}
          onValueChange={onPaddingChange}
          min={PADDING_MIN}
          max={PADDING_MAX}
          step={PADDING_STEP}
        />

        <PickerField
          label="Aspect ratio"
          value={aspectRatio}
          options={ASPECT_RATIOS.map(({ id, label }) => ({ id, label }))}
          onValueChange={onAspectRatioChange}
        />

        <PickerField
          label="Font family"
          value={fontFamily}
          options={(Object.keys(FONT_FAMILIES) as FontFamilyId[]).map((id) => ({
            id,
            label: FONT_FAMILIES[id].label,
            style: FONT_FAMILIES[id].stack ? { fontFamily: FONT_FAMILIES[id].stack } : undefined,
          }))}
          onValueChange={onFontFamilyChange}
        />

        <SliderField
          label="Font size"
          value={fontSize}
          onValueChange={onFontSizeChange}
          min={FONT_SIZE_MIN}
          max={FONT_SIZE_MAX}
          step={1}
        />

        <PickerField
          label="Language label"
          value={labelPosition}
          options={LABEL_POSITIONS}
          onValueChange={onLabelPositionChange}
        />

        <SectionSeparator label="Decorators" />

        <OptionSwitch
          label="Hash lines"
          checked={showDecorators}
          onCheckedChange={onShowDecoratorsChange}
        />
        {showDecorators && (
          <>
            <ColorInput
              label="Line color"
              value={decoratorColor}
              onChange={onDecoratorColorChange}
            />
            <SliderField
              label="Line opacity"
              value={decoratorOpacity}
              onValueChange={onDecoratorOpacityChange}
              min={0}
              max={100}
              step={5}
              unit="%"
            />
            <SliderField
              label="Line spacing"
              value={decoratorSpacing}
              onValueChange={onDecoratorSpacingChange}
              min={DECOR_SPACING_MIN}
              max={DECOR_SPACING_MAX}
              step={DECOR_SPACING_STEP}
            />
          </>
        )}
      </>
    );
  }

  return (
    <>
      <SectionSeparator label="Theme" />

      <PickerField
        label="Theme"
        value={themeName}
        options={Object.keys(THEMES).map((id) => ({ id, label: id }))}
        onValueChange={onThemeChange}
        badge={themeIsRandom ? { text: "*", title: "Randomly selected theme" } : undefined}
      />

      <PickerField
        label="Frame theme"
        value={frameMode}
        options={FRAME_MODE_OPTIONS}
        onValueChange={onFrameModeChange}
      />

      <div className="pb:5">
        <Button
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json";
            input.onchange = () => {
              const file = input.files?.[0];
              if (file) onUploadTheme(file);
            };
            input.click();
          }}
          variant="secondary"
          size="sm"
          icon={<IconUpload className="w:4 h:4" />}
          className="w:100%"
        >
          Import VS Code theme
        </Button>
      </div>

      <SectionSeparator label="Colors" />

      {FRAME_COLOR_FIELDS.map(({ key, label }) => (
        <ColorInput
          key={key}
          label={label}
          value={frameColors[key]}
          onChange={(value) => onFrameColorsChange({ ...frameColors, [key]: value })}
        />
      ))}
    </>
  );
}

export function Inspector({
  open,
  onOpenChange,
  language,
  onLanguageChange,
  onRandomize,
  ...contentProps
}: Omit<InspectorContentProps, "tab"> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: LanguageId;
  onLanguageChange: (value: LanguageId) => void;
  onRandomize: () => void;
}) {
  const [tab, setTab] = useState<SettingsTab>("layout");
  const { mode, setMode } = useChromeTheme();

  return (
    <>
      <aside className="d:none @lg:d:f fd:c w:72 fs:0 min-h:0 oy:auto blw:1 bs:s bc:line bg:page p:4">
        <SettingsTabs tab={tab} onTabChange={setTab} />
        <InspectorContent tab={tab} {...contentProps} />
      </aside>

      <BottomSheet open={open} onOpenChange={onOpenChange} title="Settings">
        <SectionSeparator label="Quick actions" />

        <PickerField
          label="Appearance"
          value={mode}
          options={CHROME_MODE_OPTIONS}
          onValueChange={setMode}
        />

        <PickerField
          label="Language"
          value={language}
          options={Object.entries(LANGUAGES).map(([id, label]) => ({
            id: id as LanguageId,
            label,
          }))}
          onValueChange={onLanguageChange}
        />

        <div className="pb:5">
          <Button
            variant="secondary"
            size="sm"
            icon={<IconArrowsShuffle className="w:4 h:4" />}
            onClick={onRandomize}
            className="w:100%"
          >
            Randomize
          </Button>
        </div>

        {/* Layout and Style stack on top of this drawer; tabs stay on desktop. */}
        <SectionSeparator label="Customize" />
        <div className="d:f fd:c g:2 pb:2">
          <SubSheet title="Layout" icon={<IconLayout className="w:4 h:4" stroke={1.8} />}>
            <InspectorContent tab="layout" {...contentProps} />
          </SubSheet>
          <SubSheet title="Style" icon={<IconPalette className="w:4 h:4" stroke={1.8} />}>
            <InspectorContent tab="style" {...contentProps} />
          </SubSheet>
        </div>
      </BottomSheet>
    </>
  );
}
