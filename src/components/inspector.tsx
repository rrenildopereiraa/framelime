import { IconArrowsShuffle, IconRestore, IconUpload } from "@tabler/icons-react";
import { useState } from "react";
import tinycolor from "tinycolor2";
import Button from "@/components/ui/button.tsx";
import Slider from "@/components/ui/slider.tsx";
import Switch from "@/components/ui/switch.tsx";
import Tabs from "@/components/ui/tabs.tsx";
import { BACKGROUND_TYPES, type BackgroundSettings } from "../lib/background";
import {
  type ChromeMode,
  type FrameMode,
  type ResolvedMode,
  useChromeTheme,
} from "../lib/chrome-theme";
import {
  framesColorsEqual,
  LANGUAGES,
  type LanguageId,
  THEMES,
  themeFrameColors,
  themePreview,
} from "../lib/highlighter";
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
  SHADOW_STYLES,
  type ShadowStyle,
} from "../lib/types";
import type { Preset } from "../lib/presets";
import { BottomSheet } from "./bottom-sheet";
import { ColorInput } from "./color-input";
import type { FrameColors } from "./frame";
import { InspectorSection, InspectorSubheading } from "./inspector-section";
import { PickerField } from "./picker-field";
import { PresetsMenu } from "./presets-control";
import { ThemePreview } from "./theme-preview";
import { RadiusControl } from "./radius-control";
import { RandomizeLockToggles, type RandomizeLocksProps } from "./randomize-locks";

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
  { id: "auto", label: "Auto" },
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

// The frame's own background color sits with the other background settings;
// the rest are grouped by the part of the window they paint.
const FRAME_COLOR_GROUPS: { title: string; fields: { key: keyof FrameColors; label: string }[] }[] =
  [
    {
      title: "Window",
      fields: [
        { key: "surface", label: "Surface" },
        { key: "border", label: "Border" },
        { key: "accentDim", label: "Text" },
      ],
    },
    {
      title: "Tab bar",
      fields: [
        { key: "tabBar", label: "Bar and inactive tabs" },
        { key: "tabActive", label: "Active tab" },
      ],
    },
    {
      title: "Status bar",
      fields: [
        { key: "statusBarBg", label: "Bar" },
        { key: "statusBarText", label: "Text" },
      ],
    },
    {
      title: "Highlights",
      fields: [
        { key: "highlightMark", label: "Mark" },
        { key: "highlightAdd", label: "Add" },
        { key: "highlightRemove", label: "Remove" },
      ],
    },
  ];

/** A section of the inspector, in the order they stack. */
type SectionId = "theme" | "background" | "window" | "code" | "canvas" | "colors";

const SECTIONS_OPEN_BY_DEFAULT: Record<SectionId, boolean> = {
  theme: true,
  background: true,
  window: true,
  code: false,
  canvas: false,
  colors: false,
};

const SECTIONS_KEY = "framelime:inspector-sections";

/** Which sections are open, kept in this browser so the panel opens as it was left. */
function useOpenSections() {
  const [open, setOpen] = useState<Record<SectionId, boolean>>(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(SECTIONS_KEY) ?? "null");
      return typeof saved === "object" && saved
        ? { ...SECTIONS_OPEN_BY_DEFAULT, ...saved }
        : SECTIONS_OPEN_BY_DEFAULT;
    } catch {
      return SECTIONS_OPEN_BY_DEFAULT;
    }
  });

  function setSection(id: SectionId, value: boolean) {
    setOpen((current) => {
      const next = { ...current, [id]: value };
      try {
        localStorage.setItem(SECTIONS_KEY, JSON.stringify(next));
      } catch {
        // Storage can be blocked; the sections still open and close.
      }
      return next;
    });
  }

  return { open, setSection };
}

type OpenSections = ReturnType<typeof useOpenSections>;

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
  );
}

/** Choices that fit side by side, as Yumma UI's tabs drawn as a segmented control. */
function SegmentedField<T extends string>({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onValueChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="d:f fd:c g:2">
      <span className="fs:sm fw:500 us:none c:label">{label}</span>
      <Tabs
        size="sm"
        value={value}
        onValueChange={(next) => onValueChange(next as T)}
        items={options.map(({ id, label }) => ({ value: id, label }))}
        className="inspector-tabs w:100%"
      />
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
    <div className="d:f ai:c jc:sb g:2">
      <span className={`fs:sm fw:500 us:none c:label ${disabled ? "o:60" : ""}`}>{label}</span>
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
  /** The scheme the frame draws in, which adaptive themes preview. */
  resolvedFrameMode: ResolvedMode;
  onFrameModeChange: (value: FrameMode) => void;
  frameColors: FrameColors;
  onFrameColorsChange: (value: FrameColors) => void;
  onUploadTheme: (file: File) => void;
  /** Background settings, with empty colors already resolved from the theme. */
  background: BackgroundSettings;
  onBackgroundChange: (patch: Partial<BackgroundSettings>) => void;
  shadow: ShadowStyle;
  onShadowChange: (value: ShadowStyle) => void;
  /** Resolved from the theme while none is picked. */
  shadowColor: string;
  onShadowColorChange: (value: string) => void;
  presets: Preset[];
  onSavePreset: (name: string) => void;
  onApplyPreset: (preset: Preset) => void;
  onRemovePreset: (preset: Preset) => void;
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

function labelOf<T extends string>(options: { id: T; label: string }[], id: T) {
  return options.find((option) => option.id === id)?.label ?? id;
}

function BackgroundControls({
  background,
  onBackgroundChange,
  color,
  onColorChange,
}: {
  background: BackgroundSettings;
  onBackgroundChange: (patch: Partial<BackgroundSettings>) => void;
  color: string;
  onColorChange: (value: string) => void;
}) {
  const type = background.bg;
  return (
    <>
      <SegmentedField
        label="Type"
        value={type}
        options={BACKGROUND_TYPES}
        onValueChange={(value) => onBackgroundChange({ bg: value })}
      />

      {type === "solid" && <ColorInput label="Color" value={color} onChange={onColorChange} />}

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
          <SliderField
            label="Angle"
            value={background.gradAngle}
            onValueChange={(value) => onBackgroundChange({ gradAngle: value })}
            min={0}
            max={360}
            step={15}
            unit="°"
          />
        </>
      )}

      {type === "transparent" && (
        <p className="m:0 fs:xs c:hint">
          PNG, WEBP and SVG keep it see-through. JPG has no transparency, so it uses the theme's
          background color.
        </p>
      )}
    </>
  );
}

/** What a closed section shows beside its title. */
function summaries(props: InspectorContentProps, themeColors: FrameColors | undefined) {
  const { radii } = props;
  const corners = [radii.tl, radii.tr, radii.bl, radii.br];
  const radius = corners.every((value) => value === corners[0]) ? `${corners[0]}px` : "Mixed";
  const shadow =
    props.shadow === "none"
      ? "no shadow"
      : `${labelOf(SHADOW_STYLES, props.shadow).toLowerCase()} shadow`;
  const background =
    props.background.bg === "solid"
      ? `Solid ${props.frameColors.page.toUpperCase()}`
      : labelOf(BACKGROUND_TYPES, props.background.bg);

  return {
    theme: `${props.themeName} · ${labelOf(FRAME_MODE_OPTIONS, props.frameMode)}`,
    background,
    window: `${radius} · ${shadow}`,
    code: `${FONT_FAMILIES[props.fontFamily].label} · ${props.fontSize}px`,
    canvas: `${props.padding}px · ${props.aspectRatio === "auto" ? "Auto" : props.aspectRatio}`,
    colors: themeColors
      ? colorsEdited(props.frameColors, themeColors)
        ? "Edited"
        : "From theme"
      : undefined,
  };
}

/** Whether any frame color differs from the theme's, leaving out the background. */
function colorsEdited(colors: FrameColors, themeColors: FrameColors) {
  return !framesColorsEqual(colors, { ...themeColors, page: colors.page });
}

function InspectorContent({
  sections,
  inSheet = false,
  ...props
}: InspectorContentProps & {
  sections: OpenSections;
  /** The settings drawer, where the status bar's controls aren't on screen. */
  inSheet?: boolean;
}) {
  const { open, setSection } = sections;
  const { frameColors, onFrameColorsChange } = props;
  // Uploaded themes have no catalog colors, so they offer no reset.
  const themeColors = themeFrameColors(props.themeName, props.resolvedFrameMode);
  const summary = summaries(props, themeColors);

  const section = (id: SectionId, title: string) => ({
    title,
    summary: summary[id],
    open: open[id],
    onOpenChange: (value: boolean) => setSection(id, value),
    inSheet,
  });

  return (
    <>
      <InspectorSection {...section("theme", "Theme")}>
        <PickerField
          label="Theme"
          value={props.themeName}
          options={Object.keys(THEMES).map((id) => {
            const preview = themePreview(id, props.resolvedFrameMode);
            return { id, label: id, icon: preview && <ThemePreview {...preview} /> };
          })}
          onValueChange={props.onThemeChange}
          badge={props.themeIsRandom ? { text: "*", title: "Randomly selected theme" } : undefined}
        />
        <SegmentedField
          label="Mode"
          value={props.frameMode}
          options={FRAME_MODE_OPTIONS}
          onValueChange={props.onFrameModeChange}
        />
        <Button
          onClick={() => pickFile(".json", props.onUploadTheme)}
          variant="ghost"
          size="sm"
          icon={<IconUpload className="w:4 h:4" />}
          className="as:fs fw:400 c:hint h:c:label"
        >
          Import VS Code theme
        </Button>
      </InspectorSection>

      <InspectorSection {...section("background", "Background")}>
        <BackgroundControls
          background={props.background}
          onBackgroundChange={props.onBackgroundChange}
          color={frameColors.page}
          onColorChange={(value) => onFrameColorsChange({ ...frameColors, page: value })}
        />
      </InspectorSection>

      <InspectorSection {...section("window", "Window")}>
        <OptionSwitch
          label="Tab bar"
          checked={props.showTabBar}
          onCheckedChange={props.onShowTabBarChange}
        />
        <OptionSwitch
          label="Status bar"
          checked={props.showStatusBar}
          onCheckedChange={props.onShowStatusBarChange}
        />
        <OptionSwitch
          label="Line numbers"
          checked={props.showLineNumbers}
          onCheckedChange={props.onShowLineNumbersChange}
        />
        <PickerField
          label="Language label"
          value={props.labelPosition}
          options={LABEL_POSITIONS}
          onValueChange={props.onLabelPositionChange}
        />
        <RadiusControl radii={props.radii} onRadiiChange={props.onRadiiChange} />
        <PickerField
          label="Shadow"
          value={props.shadow}
          options={SHADOW_STYLES}
          onValueChange={props.onShadowChange}
        />
        {props.shadow !== "none" && (
          <ColorInput
            label="Shadow color"
            value={props.shadowColor}
            onChange={props.onShadowColorChange}
          />
        )}
      </InspectorSection>

      <InspectorSection {...section("code", "Code")}>
        <PickerField
          label="Font"
          value={props.fontFamily}
          options={(Object.keys(FONT_FAMILIES) as FontFamilyId[]).map((id) => ({
            id,
            label: FONT_FAMILIES[id].label,
            style: FONT_FAMILIES[id].stack ? { fontFamily: FONT_FAMILIES[id].stack } : undefined,
          }))}
          onValueChange={props.onFontFamilyChange}
        />
        <SliderField
          label="Size"
          value={props.fontSize}
          onValueChange={props.onFontSizeChange}
          min={FONT_SIZE_MIN}
          max={FONT_SIZE_MAX}
          step={1}
        />
      </InspectorSection>

      <InspectorSection {...section("canvas", "Canvas")}>
        <SliderField
          label="Padding"
          value={props.padding}
          onValueChange={props.onPaddingChange}
          min={PADDING_MIN}
          max={PADDING_MAX}
          step={PADDING_STEP}
        />
        <PickerField
          label="Aspect ratio"
          value={props.aspectRatio}
          options={ASPECT_RATIOS.map(({ id, label }) => ({ id, label }))}
          onValueChange={props.onAspectRatioChange}
        />
        {/* On desktop it sits in the status bar: it guides editing, it isn't exported. */}
        {inSheet && (
          <OptionSwitch
            label="Bounding box"
            checked={props.showBoundingBox}
            onCheckedChange={props.onShowBoundingBoxChange}
          />
        )}

        <InspectorSubheading>Hash lines</InspectorSubheading>
        <OptionSwitch
          label="Show"
          checked={props.showDecorators}
          onCheckedChange={props.onShowDecoratorsChange}
        />
        {props.showDecorators && (
          <>
            <ColorInput
              label="Color"
              value={props.decoratorColor}
              onChange={props.onDecoratorColorChange}
            />
            <SliderField
              label="Opacity"
              value={props.decoratorOpacity}
              onValueChange={props.onDecoratorOpacityChange}
              min={0}
              max={100}
              step={5}
              unit="%"
            />
            <SliderField
              label="Spacing"
              value={props.decoratorSpacing}
              onValueChange={props.onDecoratorSpacingChange}
              min={DECOR_SPACING_MIN}
              max={DECOR_SPACING_MAX}
              step={DECOR_SPACING_STEP}
            />
          </>
        )}
      </InspectorSection>

      <InspectorSection {...section("colors", "Custom colors")}>
        {FRAME_COLOR_GROUPS.map(({ title, fields }) => (
          <div key={title} className="d:f fd:c g:3">
            <InspectorSubheading>{title}</InspectorSubheading>
            {fields.map(({ key, label }) => (
              <ColorInput
                key={key}
                label={label}
                value={frameColors[key]}
                onChange={(value) => onFrameColorsChange({ ...frameColors, [key]: value })}
              />
            ))}
          </div>
        ))}
        {themeColors && (
          <Button
            variant="secondary"
            size="sm"
            icon={<IconRestore className="w:4 h:4" />}
            disabled={!colorsEdited(frameColors, themeColors)}
            onClick={() => onFrameColorsChange({ ...themeColors, page: frameColors.page })}
            className="w:100%"
          >
            Reset to theme
          </Button>
        )}
      </InspectorSection>
    </>
  );
}

export function Inspector({
  open,
  onOpenChange,
  language,
  onLanguageChange,
  onRandomize,
  randomizeLocks,
  onRandomizeLockChange,
  ...contentProps
}: InspectorContentProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: LanguageId;
  onLanguageChange: (value: LanguageId) => void;
  onRandomize: () => void;
  randomizeLocks: RandomizeLocksProps["locks"];
  onRandomizeLockChange: RandomizeLocksProps["onLockChange"];
}) {
  const sections = useOpenSections();
  const { mode, setMode } = useChromeTheme();

  const presets = (
    <PresetsMenu
      presets={contentProps.presets}
      onSave={contentProps.onSavePreset}
      onApply={contentProps.onApplyPreset}
      onRemove={contentProps.onRemovePreset}
    />
  );

  return (
    <>
      <aside
        aria-label="Inspector"
        className="d:none @lg:d:f fd:c w:80 fs:0 min-h:0 oy:auto blw:1 bs:s bc:line bg:page"
      >
        <div className="p:4 bbw:1 bs:s bc:line">{presets}</div>
        <InspectorContent sections={sections} {...contentProps} />
      </aside>

      <BottomSheet open={open} onOpenChange={onOpenChange} title="Settings">
        {/* The status bar and the header's switcher are off screen on phones, so their
            controls lead the drawer. */}
        <div className="d:f fd:c g:3 pb:4 bbw:1 bs:s bc:line">
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
          <Button
            variant="secondary"
            size="sm"
            icon={<IconArrowsShuffle className="w:4 h:4" />}
            onClick={onRandomize}
            className="w:100%"
          >
            Randomize
          </Button>
          <RandomizeLockToggles locks={randomizeLocks} onLockChange={onRandomizeLockChange} />
          {presets}
        </div>
        <div className="mx:-6">
          <InspectorContent sections={sections} inSheet {...contentProps} />
        </div>
      </BottomSheet>
    </>
  );
}
