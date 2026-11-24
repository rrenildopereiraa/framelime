import { Input } from "@base-ui/react/input";
import { IconChevronRight, IconLock } from "@tabler/icons-react";
import { forwardRef, useLayoutEffect, useRef, useState } from "react";
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
  type WindowStyle,
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
  const offset = -gap - 1;
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

// The red, yellow and green of a desktop window's title bar.
const DOT_COLORS = ["#ff5f57", "#febc2e", "#28c840"];

function WindowDots() {
  return (
    <div className="d:f ai:c g:2 fs:0" aria-hidden="true">
      {DOT_COLORS.map((color) => (
        <span key={color} className="d:b w:3 h:3 br:9999" style={{ backgroundColor: color }} />
      ))}
    </div>
  );
}

function AddressBar({ colors, children }: { colors: FrameColors; children: React.ReactNode }) {
  return (
    <div
      className="f:1 d:f ai:c jc:c g:2 px:3 py:1 br:md min-w:0 bw:1 bs:s"
      style={{
        backgroundColor: colors.tabActive,
        borderColor: colors.border,
        color: colors.accentDim,
      }}
    >
      <IconLock size={12} stroke={2} className="fs:0" aria-hidden />
      {children}
    </div>
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
    windowStyle: WindowStyle;
    /** The open snippets as tabs, or null for the single tab. */
    tabs: FrameTab[] | null;
    activeTabId?: string;
    onSelectTab?: (id: string) => void;
    decorators: Decorators | null;
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
    windowStyle,
    tabs,
    activeTabId,
    onSelectTab,
    decorators,
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
  const activeChipStyle = { color: colors.accentDim };
  const inactiveChipStyle = { color: colors.accentDim, opacity: 0.6 };

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
        backgroundColor: colors.page,
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
            {windowStyle === "frame" && (
              <div className={`frame-collapsible ${showTabBar ? "frame-collapsible-open" : ""}`}>
                <div className="o:h min-h:0">
                  <div className="d:f" style={{ backgroundColor: colors.tabBar }}>
                    {tabs ? (
                      tabs.map((tab) =>
                        tab.id === activeTabId ? (
                          <div
                            key={tab.id}
                            className="d:f ai:c g:2 px:4 py:3"
                            style={activeTabStyle}
                          >
                            {fileNameInput}
                          </div>
                        ) : (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => onSelectTab?.(tab.id)}
                            className="d:f ai:c px:4 py:3 bg:transparent bw:0 c:p ff:m fs:sm ws:nw"
                            style={{ ...inactiveTabStyle, lineHeight: "normal", ...fontStyle }}
                          >
                            {tab.fileName || "Untitled"}
                          </button>
                        ),
                      )
                    ) : (
                      <div className="d:f ai:c g:2 px:4 py:3" style={activeTabStyle}>
                        {fileNameInput}
                      </div>
                    )}
                    <div
                      className="f:1 d:f ai:c jc:fe px:4"
                      style={{ borderBottom: `1px solid ${colors.border}` }}
                    >
                      {languageLabel}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {windowStyle === "browser" && (
              <div
                style={{
                  backgroundColor: colors.tabBar,
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                <div className="d:f ai:c g:3 px:4 py:3">
                  <WindowDots />
                  {tabs ? (
                    <div className="d:f ai:c g:1 min-w:0">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => onSelectTab?.(tab.id)}
                          className="px:3 py:1 bw:0 br:md c:p ff:m fs:xs ws:nw"
                          style={{
                            ...(tab.id === activeTabId ? activeChipStyle : inactiveChipStyle),
                            backgroundColor:
                              tab.id === activeTabId ? colors.tabActive : "transparent",
                            lineHeight: "normal",
                            ...fontStyle,
                          }}
                        >
                          {tab.fileName || "Untitled"}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <AddressBar colors={colors}>{fileNameInput}</AddressBar>
                  )}
                  {/* Holds the row's right edge when tabs, not the address bar, fill it. */}
                  <div className={`d:f jc:fe ${tabs ? "f:1" : ""}`}>{languageLabel}</div>
                </div>
                {tabs && (
                  <div className="d:f px:4 pb:3">
                    <AddressBar colors={colors}>{fileNameInput}</AddressBar>
                  </div>
                )}
              </div>
            )}

            {windowStyle === "terminal" && (
              <div
                className="d:g ai:c px:4 py:3"
                style={{
                  gridTemplateColumns: "1fr auto 1fr",
                  backgroundColor: colors.tabBar,
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                <WindowDots />
                <div className="d:f jc:c">{fileNameInput}</div>
                <div className="d:f jc:fe">{languageLabel}</div>
              </div>
            )}

            <div className="p:4" style={{ backgroundColor: colors.tabActive }}>
              {windowStyle === "terminal" && (
                <div
                  className="d:f ai:c g:2 pb:2 ff:m"
                  style={{ color: colors.accentDim, fontSize, lineHeight: 1.5, ...fontStyle }}
                >
                  <IconChevronRight
                    className="fs:0"
                    size={fontSize}
                    stroke={2.5}
                    style={{ color: colors.statusBarText }}
                    aria-hidden
                  />
                  <span>cat {fileName || "Untitled-1"}</span>
                </div>
              )}
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

            <div
              className={`frame-collapsible ${showStatusBar && windowStyle !== "none" ? "frame-collapsible-open" : ""}`}
            >
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
