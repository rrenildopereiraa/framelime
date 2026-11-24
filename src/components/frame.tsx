import { Input } from "@base-ui/react/input";
import { IconPlus, IconX } from "@tabler/icons-react";
import { forwardRef, useLayoutEffect, useRef, useState } from "react";
import { type FrameBackground, gradientCss } from "../lib/background";
import type { ResolvedMode } from "../lib/chrome-theme";
import type { LanguageId } from "../lib/highlighter";
import { LANGUAGES } from "../lib/highlighter";
import {
  ASPECT_RATIO_VALUES,
  type AspectRatio,
  type FrameTab,
  type HighlightedLine,
  type HighlightedWord,
  type LabelPosition,
} from "../lib/types";
import { CodeEditor } from "./code-editor";
import type { CornerRadii } from "./inspector";

export interface FrameColors {
  page: string;
  surface: string;
  border: string;
  accentDim: string;
  tabBar: string;
  tabActive: string;
  statusBarBg: string;
  statusBarText: string;
  highlightMark: string;
  highlightAdd: string;
  highlightRemove: string;
}

export interface Decorators {
  color: string;
  /** 0 to 100. */
  opacity: number;
  /** Gap between each line and the code window, in px. */
  gap: number;
}

// Far enough to cross any frame's padding; the frame clips the rest.
const HASH_REACH = 4000;

/** Lines along the code window's edges, running past it to form a #. */
function HashLines({ color, opacity, gap }: Decorators) {
  const line = { backgroundColor: color, opacity: opacity / 100 };
  // At 0 the lines lie on the window's 1px border and carry it on, rather
  // than sitting beside it and doubling it into a 2px edge. Past 0 they keep
  // `gap` px clear of the border.
  const offset = gap === 0 ? 0 : -gap - 1;
  return (
    <div aria-hidden="true" className="pe:none">
      <div
        className="p:a h:px"
        style={{ ...line, top: offset, left: -HASH_REACH, right: -HASH_REACH }}
      />
      <div
        className="p:a h:px"
        style={{ ...line, bottom: offset, left: -HASH_REACH, right: -HASH_REACH }}
      />
      <div
        className="p:a w:px"
        style={{ ...line, left: offset, top: -HASH_REACH, bottom: -HASH_REACH }}
      />
      <div
        className="p:a w:px"
        style={{ ...line, right: offset, top: -HASH_REACH, bottom: -HASH_REACH }}
      />
    </div>
  );
}

/** What fills the frame behind the code window. */
function Backdrop({ background }: { background: FrameBackground }) {
  if (background.type !== "gradient") return null;
  return (
    <div
      aria-hidden="true"
      className="p:a i:0 pe:none"
      style={{ backgroundImage: gradientCss(background.stops, background.angle) }}
    />
  );
}

export const Frame = forwardRef<
  HTMLDivElement,
  {
    code: string;
    onCodeChange: (value: string) => void;
    language: LanguageId;
    fileName: string;
    onFileNameChange: (value: string) => void;
    highlightedLines: HighlightedLine[];
    highlightedWords: HighlightedWord[];
    onCycleLineHighlight: (line: number) => void;
    onSetLineRangeHighlight: (startLine: number, endLine: number) => void;
    onCycleWordHighlight: (line: number, startCol: number, endCol: number) => void;
    onSetWordRangeHighlight: (ranges: { line: number; startCol: number; endCol: number }[]) => void;
    textareaRef: React.RefObject<HTMLTextAreaElement | null>;
    showTabBar: boolean;
    showStatusBar: boolean;
    aspectRatio: AspectRatio;
    radii: CornerRadii;
    fontFamily?: string;
    themeName: string;
    colors: FrameColors;
    viewportRef: React.RefObject<HTMLElement | null>;
    mode: ResolvedMode;
    padding: number;
    fontSize: number;
    showLineNumbers: boolean;
    labelPosition: LabelPosition;
    /** The open snippets, shown as the frame's tabs. */
    tabs: FrameTab[];
    activeTabId: string;
    onSelectTab: (id: string) => void;
    onCloseTab: (id: string) => void;
    /** Left out once the snippet limit is reached. */
    onAddTab?: () => void;
    decorators: Decorators | null;
    background: FrameBackground;
  }
>(function Frame(
  {
    code,
    onCodeChange,
    language,
    fileName,
    onFileNameChange,
    highlightedLines,
    highlightedWords,
    onCycleLineHighlight,
    onSetLineRangeHighlight,
    onCycleWordHighlight,
    onSetWordRangeHighlight,
    textareaRef,
    showTabBar,
    showStatusBar,
    aspectRatio,
    radii,
    fontFamily,
    themeName,
    colors,
    viewportRef,
    mode,
    padding,
    fontSize,
    showLineNumbers,
    labelPosition,
    tabs,
    activeTabId,
    onSelectTab,
    onCloseTab,
    onAddTab,
    decorators,
    background,
  },
  ref,
) {
  const fontStyle = fontFamily ? { fontFamily } : undefined;
  const activeTabStyle = {
    backgroundColor: colors.tabActive,
    borderRight: `1px solid ${colors.border}`,
  };
  const inactiveTabStyle = {
    color: colors.accentDim,
    opacity: 0.6,
    borderRight: `1px solid ${colors.border}`,
    borderBottom: `1px solid ${colors.border}`,
  };
  const several = tabs.length > 1;

  // A tab that isn't the active one: its name, which switches to it.
  const tabButton = (tab: FrameTab, size: string) => (
    <button
      type="button"
      onClick={() => onSelectTab(tab.id)}
      className={`d:b p:0 bg:transparent bw:0 c:p ff:m ws:nw ${size}`}
      style={{ color: colors.accentDim, lineHeight: "normal", ...fontStyle }}
    >
      {tab.fileName || "Untitled"}
    </button>
  );

  // Editing controls show on screen only: exports leave out anything marked
  // `data-export-ignore`, and these sit over the tab without taking room in
  // it, so the image keeps the layout seen on screen.
  const closeButton = (tab: FrameTab, background: string) => (
    <button
      type="button"
      data-export-ignore
      aria-label={`Close ${tab.fileName || "Untitled"}`}
      onClick={() => onCloseTab(tab.id)}
      className="frame-tab-close p:a t:0 b:0 r:1 my:auto d:f ai:c jc:c w:3 h:3 p:0 bw:0 br:9999 c:p"
      style={{ backgroundColor: background, color: colors.accentDim }}
    >
      <IconX size={10} stroke={2.5} aria-hidden />
    </button>
  );

  const addButton = onAddTab ? (
    <button
      type="button"
      data-export-ignore
      aria-label="New snippet"
      onClick={onAddTab}
      className="d:f ai:c jc:c fs:0 w:5 h:5 mr:auto p:0 bg:transparent bw:0 br:sm c:p o:60 h:o:100"
      style={{ color: colors.accentDim }}
    >
      <IconPlus size={14} stroke={2} aria-hidden />
    </button>
  ) : null;

  const fileNameInput = (
    <Input
      value={fileName}
      onChange={(event) => onFileNameChange(event.target.value)}
      size={Math.max(fileName.length, 10)}
      spellCheck={false}
      placeholder="Untitled-1"
      className="ff:m fs:sm bg:transparent bw:0 os:none p:0 w:fc"
      // `normal`, not the inherited line height: exported
      // images keep the tab bar height they always had.
      style={{ color: colors.accentDim, lineHeight: "normal", ...fontStyle }}
    />
  );

  const languageLabel =
    labelPosition === "tab" ? (
      <span className="ff:m fs:xs fw:700" style={{ color: colors.statusBarText, ...fontStyle }}>
        {LANGUAGES[language]}
      </span>
    ) : null;
  const borderRadius = `${radii.tl}px ${radii.tr}px ${radii.br}px ${radii.bl}px`;
  const ratioValue = ASPECT_RATIO_VALUES[aspectRatio];
  const contentRef = useRef<HTMLDivElement>(null);

  // Fit-to-frame for fixed ratios. The outer box is locked to the largest
  // exact-ratio rectangle that fits the viewport, so it can never outgrow
  // the canvas; the code frame is then zoomed down (uniformly, never up and
  // never stretched) to fit inside it. `auto` stays untouched.
  const [fit, setFit] = useState<{
    width: number;
    height: number;
    scale: number;
  } | null>(null);

  // Whether a fitted size has ever been painted. The first fit must apply
  // synchronously (before paint) so the initial render doesn't flash the
  // aspect-ratio fallback; once something is on screen, ratio changes defer
  // to the next frame so the CSS transition can animate the shrink.
  const hasFitRef = useRef(false);

  useLayoutEffect(() => {
    if (!ratioValue) {
      setFit(null);
      return;
    }
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    const [ratioWidth, ratioHeight] = ratioValue.split(" / ").map(Number) as [number, number];
    const ratio = ratioWidth / ratioHeight;

    let raf = 0;
    const update = () => {
      const viewportStyle = getComputedStyle(viewport);
      const padX = parseFloat(viewportStyle.paddingLeft) + parseFloat(viewportStyle.paddingRight);
      const padY = parseFloat(viewportStyle.paddingTop) + parseFloat(viewportStyle.paddingBottom);
      // A tiny buffer stops sub-pixel rounding from producing a 1px
      // scrollbar on the canvas.
      const availWidth = Math.max(0, viewport.clientWidth - padX - 2);
      const availHeight = Math.max(0, viewport.clientHeight - padY - 2);

      const boxWidth = Math.min(availWidth, availHeight * ratio);
      const boxHeight = boxWidth / ratio;

      const naturalWidth = content.offsetWidth;
      const naturalHeight = content.offsetHeight;
      const scale = Math.min(
        1,
        (boxWidth - padding * 2) / naturalWidth,
        (boxHeight - padding * 2) / naturalHeight,
      );

      hasFitRef.current = true;
      setFit({
        width: boxWidth,
        height: boxHeight,
        scale: Number.isFinite(scale) ? scale : 1,
      });
    };

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    });
    observer.observe(viewport);
    observer.observe(content);

    if (hasFitRef.current) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    } else {
      update();
    }

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [ratioValue, viewportRef, padding]);

  return (
    <div
      ref={ref}
      className={`p:r min-w:0 o:h ${ratioValue ? "d:f ai:c jc:c tp:d tdu:200" : ""}`}
      style={{
        padding,
        backgroundColor: background.type === "transparent" ? undefined : background.color,
        ...(ratioValue
          ? {
              // Locked to the fitted rectangle once measured; the
              // aspect-ratio only fills the pre-measure frame so the
              // first (unpainted) render is already shaped.
              width: fit ? fit.width : undefined,
              height: fit ? fit.height : undefined,
              aspectRatio: fit ? undefined : ratioValue,
            }
          : {}),
      }}
    >
      <Backdrop background={background} />
      <div
        ref={contentRef}
        className={`p:r zi:10 w:192 o:v ${ratioValue ? "tp:t tdu:200 tor:c" : "max-w:100%"}`}
        style={{
          backgroundColor: colors.surface,
          borderRadius,
          transform: fit ? `scale(${fit.scale})` : undefined,
        }}
      >
        {decorators && <HashLines {...decorators} />}
        <div
          className="d:f bw:1 bs:s o:h"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius,
          }}
        >
          <div className="f:1 min-w:0 min-h:0">
            <div className={`frame-collapsible ${showTabBar ? "frame-collapsible-open" : ""}`}>
              <div className="o:h min-h:0">
                <div className="d:f" style={{ backgroundColor: colors.tabBar }}>
                  {tabs.map((tab) => {
                    const isActive = tab.id === activeTabId;
                    return (
                      <div
                        key={tab.id}
                        className="frame-tab p:r d:f ai:c g:2 px:4 py:3"
                        style={
                          isActive
                            ? several
                              ? // Matches the inactive tabs' bottom border, so every name sits on one line.
                                {
                                  ...activeTabStyle,
                                  borderBottom: `1px solid ${colors.tabActive}`,
                                }
                              : activeTabStyle
                            : inactiveTabStyle
                        }
                      >
                        {isActive ? fileNameInput : tabButton(tab, "fs:sm")}
                        {several && closeButton(tab, isActive ? colors.tabActive : colors.tabBar)}
                      </div>
                    );
                  })}
                  <div
                    className="f:1 d:f ai:c jc:fe px:4"
                    style={{ borderBottom: `1px solid ${colors.border}` }}
                  >
                    {addButton}
                    {languageLabel}
                  </div>
                </div>
              </div>
            </div>

            <div className="p:4" style={{ backgroundColor: colors.tabActive }}>
              <CodeEditor
                code={code}
                onCodeChange={onCodeChange}
                language={language}
                themeName={themeName}
                fontFamily={fontFamily}
                background={colors.tabActive}
                highlightedLines={highlightedLines}
                highlightedWords={highlightedWords}
                onCycleLineHighlight={onCycleLineHighlight}
                onSetLineRangeHighlight={onSetLineRangeHighlight}
                onCycleWordHighlight={onCycleWordHighlight}
                onSetWordRangeHighlight={onSetWordRangeHighlight}
                textareaRef={textareaRef}
                mode={mode}
                fontSize={fontSize}
                showLineNumbers={showLineNumbers}
                highlightColors={{
                  mark: colors.highlightMark,
                  add: colors.highlightAdd,
                  remove: colors.highlightRemove,
                }}
              />
            </div>

            <div className={`frame-collapsible ${showStatusBar ? "frame-collapsible-open" : ""}`}>
              <div className="o:h min-h:0">
                <div
                  className="d:f ai:c jc:fe px:4 py:2 btw:1 bs:s"
                  style={{
                    backgroundColor: colors.statusBarBg,
                    borderColor: colors.border,
                  }}
                >
                  {/* Hidden, not removed, so the bar keeps its height without the label. */}
                  <span
                    className={`ff:m fs:xs fw:700 ${labelPosition === "status" ? "" : "v:h"}`}
                    aria-hidden={labelPosition === "status" ? undefined : true}
                    style={{ color: colors.statusBarText, ...fontStyle }}
                  >
                    {LANGUAGES[language]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
