import {
  IconArrowsShuffle,
  IconDeviceDesktop,
  IconLayout,
  IconPalette,
  IconPhoto,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import { useState } from "react";
import tinycolor from "tinycolor2";
import Button from "@/components/ui/button.tsx";
import Separator from "@/components/ui/separator.tsx";
import Slider from "@/components/ui/slider.tsx";
import Switch from "@/components/ui/switch.tsx";
import Tabs from "@/components/ui/tabs.tsx";
import {
  BACKGROUND_TYPES,
  type BackgroundSettings,
  IMAGE_BLUR_MAX,
  IMAGE_DIM_MAX,
  IMAGE_FITS,
  PATTERN_SCALE_MAX,
  PATTERN_SCALE_MIN,
  PATTERN_SCALE_STEP,
  PATTERNS,
} from "../lib/background";
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

// The frame's own background color sits with the other background settings.
const FRAME_COLOR_FIELDS: { key: keyof FrameColors; label: string }[] = [
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

// Words under a slider's track, spread evenly from start to end, as Border
// radius labels its own: numbers there would crowd the sidebar.
const SIZE_MARKS = ["None", "Medium", "Large"];
const FONT_SIZE_MARKS = ["Small", "Medium", "Large"];
const OPACITY_MARKS = ["None", "Half", "Full"];
const SCALE_MARKS = ["Fine", "Even", "Coarse"];
const ANGLE_MARKS = ["Up", "Down", "Up"];
const BLUR_MARKS = ["None", "Soft", "Heavy"];
const DIM_MARKS = ["None", "Half", "Dark"];

function SliderField({
  label,
  value,
  onValueChange,
  min,
  max,
  step,
  unit = "px",
  marks,
}: {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  marks?: string[];
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
        marks={marks}
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
  /** Background settings, with empty colors already resolved from the theme. */
  background: BackgroundSettings;
  onBackgroundChange: (patch: Partial<BackgroundSettings>) => void;
  /** The uploaded background image, if this browser has one. */
  backgroundImage: string | null;
  onUploadBackgroundImage: (file: File) => void;
  onRemoveBackgroundImage: () => void;
}

/** Opens the file picker for one file of the given types. */
function pickFile(accept: string, onFile: (file: File) => void) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept;
  input.onchange = () => {
    const file = input.files?.[0];
    if (file) onFile(file);
  };
  input.click();
}

function BackgroundControls({
  background,
  onBackgroundChange,
  color,
  onColorChange,
  image,
  onUploadImage,
  onRemoveImage,
}: {
  background: BackgroundSettings;
  onBackgroundChange: (patch: Partial<BackgroundSettings>) => void;
  color: string;
  onColorChange: (value: string) => void;
  image: string | null;
  onUploadImage: (file: File) => void;
  onRemoveImage: () => void;
}) {
  const type = background.bg;
  return (
    <>
      <PickerField
        label="Type"
        value={type}
        options={BACKGROUND_TYPES}
        onValueChange={(value) => onBackgroundChange({ bg: value })}
      />

      {/* A gradient covers the base color; patterns and images show it. */}
      {type !== "gradient" && (
        <ColorInput
          label={type === "solid" ? "Color" : "Base color"}
          value={color}
          onChange={onColorChange}
        />
      )}

      {type === "gradient" && (
        <>
          <ColorInput
            label="Start"
            value={background.gradFrom}
            onChange={(value) => onBackgroundChange({ gradFrom: value })}
          />
          <OptionSwitch
            label="Middle stop"
            checked={background.gradVia !== ""}
            onCheckedChange={(on) =>
              onBackgroundChange({
                gradVia: on
                  ? tinycolor.mix(background.gradFrom, background.gradTo).toHexString()
                  : "",
              })
            }
          />
          {background.gradVia !== "" && (
            <ColorInput
              label="Middle"
              value={background.gradVia}
              onChange={(value) => onBackgroundChange({ gradVia: value })}
            />
          )}
          <ColorInput
            label="End"
            value={background.gradTo}
            onChange={(value) => onBackgroundChange({ gradTo: value })}
          />
          <div className="pt:2">
            <SliderField
              label="Angle"
              value={background.gradAngle}
              onValueChange={(value) => onBackgroundChange({ gradAngle: value })}
              min={0}
              max={360}
              step={15}
              unit="°"
              marks={ANGLE_MARKS}
            />
          </div>
        </>
      )}

      {type === "pattern" && (
        <>
          <div className="pt:2">
            <PickerField
              label="Pattern"
              value={background.pattern}
              options={PATTERNS}
              onValueChange={(value) => onBackgroundChange({ pattern: value })}
            />
          </div>
          <ColorInput
            label="Ink"
            value={background.patternInk}
            onChange={(value) => onBackgroundChange({ patternInk: value })}
          />
          <div className="pt:2">
            <SliderField
              label="Scale"
              value={background.patternScale}
              onValueChange={(value) => onBackgroundChange({ patternScale: value })}
              min={PATTERN_SCALE_MIN}
              max={PATTERN_SCALE_MAX}
              step={PATTERN_SCALE_STEP}
              unit="%"
              marks={SCALE_MARKS}
            />
          </div>
        </>
      )}

      {type === "image" && (
        <>
          <div className="d:f g:2 pt:2 pb:2">
            <Button
              onClick={() => pickFile("image/*", onUploadImage)}
              variant="secondary"
              size="sm"
              icon={<IconPhoto className="w:4 h:4" />}
              className="f:1"
            >
              {image ? "Replace image" : "Upload image"}
            </Button>
            {image && (
              <Button
                onClick={onRemoveImage}
                variant="secondary"
                size="sm"
                icon={<IconTrash className="w:4 h:4" />}
                iconOnly
              >
                Remove image
              </Button>
            )}
          </div>
          <p className="d:f g:2 pb:4 fs:xs c:hint">
            <IconDeviceDesktop className="fs:0 w:4 h:4" stroke={1.8} aria-hidden />
            <span>
              {image
                ? "Only in this browser. Share links show the base color instead."
                : "Or drop one on the canvas. It stays in this browser: share links show the base color instead."}
            </span>
          </p>
          <PickerField
            label="Fit"
            value={background.imgFit}
            options={IMAGE_FITS}
            onValueChange={(value) => onBackgroundChange({ imgFit: value })}
          />
          <SliderField
            label="Blur"
            value={background.imgBlur}
            onValueChange={(value) => onBackgroundChange({ imgBlur: value })}
            min={0}
            max={IMAGE_BLUR_MAX}
            step={2}
            marks={BLUR_MARKS}
          />
          <SliderField
            label="Dim"
            value={background.imgDim}
            onValueChange={(value) => onBackgroundChange({ imgDim: value })}
            min={0}
            max={IMAGE_DIM_MAX}
            step={5}
            unit="%"
            marks={DIM_MARKS}
          />
        </>
      )}
    </>
  );
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
  background,
  onBackgroundChange,
  backgroundImage,
  onUploadBackgroundImage,
  onRemoveBackgroundImage,
}: InspectorContentProps) {
  if (tab === "layout") {
    return (
      <>
        <OptionSwitch label="Tab bar" checked={showTabBar} onCheckedChange={onShowTabBarChange} />
        <OptionSwitch
          label="Bounding box"
          checked={showBoundingBox}
          onCheckedChange={onShowBoundingBoxChange}
        />
        <OptionSwitch
          label="Status bar"
          checked={showStatusBar}
          onCheckedChange={onShowStatusBarChange}
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
          marks={SIZE_MARKS}
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
          marks={FONT_SIZE_MARKS}
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
              marks={OPACITY_MARKS}
            />
            <SliderField
              label="Line spacing"
              value={decoratorSpacing}
              onValueChange={onDecoratorSpacingChange}
              min={DECOR_SPACING_MIN}
              max={DECOR_SPACING_MAX}
              step={DECOR_SPACING_STEP}
              marks={SIZE_MARKS}
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
          onClick={() => pickFile(".json", onUploadTheme)}
          variant="secondary"
          size="sm"
          icon={<IconUpload className="w:4 h:4" />}
          className="w:100%"
        >
          Import VS Code theme
        </Button>
      </div>

      <SectionSeparator label="Background" />

      <BackgroundControls
        background={background}
        onBackgroundChange={onBackgroundChange}
        color={frameColors.page}
        onColorChange={(value) => onFrameColorsChange({ ...frameColors, page: value })}
        image={backgroundImage}
        onUploadImage={onUploadBackgroundImage}
        onRemoveImage={onRemoveBackgroundImage}
      />

      <div className="pt:3">
        <SectionSeparator label="Colors" />
      </div>

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
