import { useEffect, useRef, useState } from "react";
import type { FrameBackground } from "../lib/background";
import type { ResolvedMode } from "../lib/chrome-theme";
import type { LanguageId } from "../lib/highlighter";
import {
  ASPECT_RATIO_VALUES,
  type AspectRatio,
  FRAME_WIDTH_MAX,
  FRAME_WIDTH_MIN,
  type FrameTab,
  type HighlightedLine,
  type HighlightedWord,
  type LabelPosition,
} from "../lib/types";
import { BoundingBox } from "./bounding-box";
import { type Decorators, Frame, type FrameColors } from "./frame";
import type { CornerRadii } from "./inspector";

// The selection outline and its handles sit 8px outside the frame; keep them on the canvas too.
const OUTLINE = 8;

/** The canvas's inner size, inside its padding, kept current as it changes. */
function useCanvasRoom(viewportRef: React.RefObject<HTMLElement | null>) {
  const [room, setRoom] = useState<{ width: number; height: number } | null>(null);
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const measure = () => {
      const style = getComputedStyle(viewport);
      const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      // A tiny buffer stops sub-pixel rounding from producing a 1px scrollbar.
      setRoom({
        width: Math.max(0, viewport.clientWidth - padX - OUTLINE * 2 - 2),
        height: Math.max(0, viewport.clientHeight - padY - OUTLINE * 2 - 2),
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    measure();
    return () => observer.disconnect();
  }, [viewportRef]);
  return room;
}

/**
 * The widest the frame can be and still be seen whole: the canvas's width,
 * and for a fixed ratio, the width whose height still fits.
 */
function widestFrame(room: { width: number; height: number } | null, aspectRatio: AspectRatio) {
  if (!room) return FRAME_WIDTH_MAX;
  const value = ASPECT_RATIO_VALUES[aspectRatio];
  const [w, h] = value ? value.split(" / ").map(Number) : [];
  const byHeight = w && h ? room.height * (w / h) : Infinity;
  return Math.max(FRAME_WIDTH_MIN, Math.floor(Math.min(FRAME_WIDTH_MAX, room.width, byHeight)));
}

export function Canvas({
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
  frameWidth,
  onFrameWidthChange,
  radii,
  fontFamily,
  themeName,
  colors,
  showBoundingBox,
  frameRef,
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
  shadow,
}: {
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
  frameWidth: number | null;
  onFrameWidthChange: (width: number | null) => void;
  radii: CornerRadii;
  fontFamily?: string;
  themeName: string;
  colors: FrameColors;
  showBoundingBox: boolean;
  frameRef: React.RefObject<HTMLDivElement | null>;
  mode: ResolvedMode;
  padding: number;
  fontSize: number;
  showLineNumbers: boolean;
  labelPosition: LabelPosition;
  tabs: FrameTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onAddTab?: () => void;
  decorators: Decorators | null;
  background: FrameBackground;
  shadow?: string;
}) {
  const viewportRef = useRef<HTMLElement>(null);
  const [resizing, setResizing] = useState(false);
  const maxWidth = widestFrame(useCanvasRoom(viewportRef), aspectRatio);
  // A width set on a wider screen, or before the window shrank, shows at what fits.
  const width = frameWidth === null ? null : Math.min(frameWidth, maxWidth);

  return (
    <main ref={viewportRef} className="f:1 d:f min-h:0 min-w:0 o:auto px:2 @sm:px:4 py:8 @sm:py:16">
      <div className="m:auto p:r min-w:0">
        {/* Outside the frame, so exports keep it transparent. */}
        {background.type === "transparent" && (
          <div aria-hidden="true" className="transparency-grid p:a i:0 pe:none" />
        )}
        <Frame
          ref={frameRef}
          code={code}
          onCodeChange={onCodeChange}
          language={language}
          fileName={fileName}
          onFileNameChange={onFileNameChange}
          highlightedLines={highlightedLines}
          highlightedWords={highlightedWords}
          onCycleLineHighlight={onCycleLineHighlight}
          onSetLineRangeHighlight={onSetLineRangeHighlight}
          onCycleWordHighlight={onCycleWordHighlight}
          onSetWordRangeHighlight={onSetWordRangeHighlight}
          textareaRef={textareaRef}
          showTabBar={showTabBar}
          showStatusBar={showStatusBar}
          aspectRatio={aspectRatio}
          width={width}
          resizing={resizing}
          radii={radii}
          fontFamily={fontFamily}
          themeName={themeName}
          colors={colors}
          viewportRef={viewportRef}
          mode={mode}
          padding={padding}
          fontSize={fontSize}
          showLineNumbers={showLineNumbers}
          labelPosition={labelPosition}
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={onSelectTab}
          onCloseTab={onCloseTab}
          onAddTab={onAddTab}
          decorators={decorators}
          background={background}
          shadow={shadow}
        />

        {showBoundingBox && (
          <BoundingBox
            frameRef={frameRef}
            width={width}
            maxWidth={maxWidth}
            onWidthChange={onFrameWidthChange}
            onResizingChange={setResizing}
          />
        )}
      </div>
    </main>
  );
}
