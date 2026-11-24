import { IconPhoto } from "@tabler/icons-react";
import { type DragEvent, useRef, useState } from "react";
import type { FrameBackground } from "../lib/background";
import type { ResolvedMode } from "../lib/chrome-theme";
import type { LanguageId } from "../lib/highlighter";
import type {
  AspectRatio,
  FrameTab,
  HighlightedLine,
  HighlightedWord,
  LabelPosition,
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
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onAddTab,
  decorators,
  background,
  onDropImage,
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
  tabs: FrameTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onAddTab?: () => void;
  decorators: Decorators | null;
  background: FrameBackground;
  /** An image file dropped on the canvas, for the background. */
  onDropImage: (file: File) => void;
}) {
  const viewportRef = useRef<HTMLElement>(null);
  const [dragging, setDragging] = useState(false);

  // Only files count: dragging selected code around the editor is not a drop.
  const carriesFile = (event: DragEvent) => event.dataTransfer.types.includes("Files");

  function handleDragOver(event: DragEvent) {
    if (!carriesFile(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setDragging(true);
  }

  function handleDragLeave(event: DragEvent) {
    // Leaving for one of the canvas's own children is not leaving it.
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setDragging(false);
  }

  function handleDrop(event: DragEvent) {
    if (!carriesFile(event)) return;
    event.preventDefault();
    setDragging(false);
    const file = Array.from(event.dataTransfer.files).find((f) => f.type.startsWith("image/"));
    if (file) onDropImage(file);
  }

  return (
    <main
      ref={viewportRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="p:r f:1 d:f min-h:0 min-w:0 o:auto px:2 @sm:px:4 py:8 @sm:py:16"
    >
      {dragging && (
        <div className="p:a i:2 zi:20 d:f ai:c jc:c pe:none br:lg bw:2 bs:d bc:accent bg:page/80">
          <span className="d:f ai:c g:2 fs:sm fw:500 c:label">
            <IconPhoto className="w:5 h:5 c:accent" stroke={1.8} aria-hidden />
            Drop an image for the background
          </span>
        </div>
      )}
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
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={onSelectTab}
          onCloseTab={onCloseTab}
          onAddTab={onAddTab}
          decorators={decorators}
          background={background}
        />

        {showBoundingBox && <BoundingBox />}
      </div>
    </main>
  );
}
