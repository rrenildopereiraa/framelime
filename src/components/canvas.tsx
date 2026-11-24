import { useRef } from "react";
import type { ResolvedMode } from "../lib/chrome-theme";
import type { LanguageId } from "../lib/highlighter";
import type {
  AspectRatio,
  FrameTab,
  HighlightedLine,
  HighlightedWord,
  LabelPosition,
  WindowStyle,
} from "../lib/types";
import { BoundingBox } from "./bounding-box";
import { type Decorators, Frame, type FrameColors } from "./frame";
import type { CornerRadii } from "./inspector";

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
  windowStyle,
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onAddTab,
  decorators,
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
  windowStyle: WindowStyle;
  tabs: FrameTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onAddTab?: () => void;
  decorators: Decorators | null;
}) {
  const viewportRef = useRef<HTMLElement>(null);

  return (
    <main ref={viewportRef} className="f:1 d:f min-h:0 min-w:0 o:auto px:2 @sm:px:4 py:8 @sm:py:16">
      <div className="m:auto p:r min-w:0">
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
          windowStyle={windowStyle}
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={onSelectTab}
          onCloseTab={onCloseTab}
          onAddTab={onAddTab}
          decorators={decorators}
        />

        {showBoundingBox && <BoundingBox />}
      </div>
    </main>
  );
}
