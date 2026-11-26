import { useEffect, useRef, useState } from "react";
import { clamp, FRAME_WIDTH_MIN, FRAME_WIDTH_STEP } from "../lib/types";
import { FOCUS } from "./styles";

type Edge = "left" | "right";

interface Handle {
  id: string;
  edge: Edge;
  /** Where the hit area sits, centred on the outline's corner or side. */
  place: string;
  cursor: string;
  /** Side handles take keyboard focus; corners do the same job by pointer. */
  focusable: boolean;
}

// The outline sits 8px outside the frame (`i:-2`); each hit area is centred
// on it, larger for touch than for a mouse.
const CORNER = "w:4 h:4 @pc:w:8 @pc:h:8";
const SIDE = "t:0 b:0 my:auto w:4 h:4 @pc:w:8 @pc:h:8";

const HANDLES: Handle[] = [
  {
    id: "top-left",
    edge: "left",
    place: `t:-4 l:-4 @pc:t:-6 @pc:l:-6 ${CORNER}`,
    cursor: "c:nwser",
    focusable: false,
  },
  {
    id: "top-right",
    edge: "right",
    place: `t:-4 r:-4 @pc:t:-6 @pc:r:-6 ${CORNER}`,
    cursor: "c:neswr",
    focusable: false,
  },
  {
    id: "bottom-left",
    edge: "left",
    place: `b:-4 l:-4 @pc:b:-6 @pc:l:-6 ${CORNER}`,
    cursor: "c:neswr",
    focusable: false,
  },
  {
    id: "bottom-right",
    edge: "right",
    place: `b:-4 r:-4 @pc:b:-6 @pc:r:-6 ${CORNER}`,
    cursor: "c:nwser",
    focusable: false,
  },
  { id: "left", edge: "left", place: `l:-4 @pc:l:-6 ${SIDE}`, cursor: "c:er", focusable: true },
  { id: "right", edge: "right", place: `r:-4 @pc:r:-6 ${SIDE}`, cursor: "c:er", focusable: true },
];

/** Rounds to the step and keeps the width between the minimum and what the canvas shows. */
function snap(width: number, max: number) {
  if (width >= max) return max;
  return clamp(Math.round(width / FRAME_WIDTH_STEP) * FRAME_WIDTH_STEP, FRAME_WIDTH_MIN, max);
}

/** The frame's width in px as laid out, kept current as it changes. */
function useMeasuredWidth(frameRef: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new ResizeObserver(() => setWidth(frame.offsetWidth));
    observer.observe(frame);
    setWidth(frame.offsetWidth);
    return () => observer.disconnect();
  }, [frameRef]);
  return width;
}

/**
 * The frame's selection outline. Its side and corner handles drag the
 * frame's width; the side handles also take focus and move with the arrow
 * keys. A double-click, or Delete, sizes the frame to fit again. The width
 * stops where the frame would leave the canvas, so it is always seen whole.
 */
export function BoundingBox({
  frameRef,
  width,
  maxWidth,
  onWidthChange,
  onResizingChange,
}: {
  frameRef: React.RefObject<HTMLDivElement | null>;
  /** `null` while the frame sizes itself. */
  width: number | null;
  /** The widest the frame can be while the canvas still shows all of it. */
  maxWidth: number;
  onWidthChange: (width: number | null) => void;
  onResizingChange: (resizing: boolean) => void;
}) {
  const measured = useMeasuredWidth(frameRef);
  const [dragging, setDragging] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const drag = useRef<{
    edge: Edge;
    startX: number;
    startWidth: number;
  } | null>(null);

  const current = width ?? measured;

  function startDrag(event: React.PointerEvent<HTMLDivElement>, edge: Edge) {
    if (event.button !== 0) return;
    const frame = frameRef.current;
    if (!frame) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { edge, startX: event.clientX, startWidth: frame.offsetWidth };
    setDragging(true);
    onResizingChange(true);
  }

  function moveDrag(event: React.PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state) return;
    // How far the handle moved away from the frame's middle.
    const out = (event.clientX - state.startX) * (state.edge === "right" ? 1 : -1);
    // The frame is centred on the canvas, so both edges move and the width
    // changes twice as fast as the handle.
    onWidthChange(snap(state.startWidth + out * 2, maxWidth));
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    drag.current = null;
    setDragging(false);
    onResizingChange(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>, edge: Edge) {
    const base = snap(current, maxWidth);
    const step = event.shiftKey ? FRAME_WIDTH_STEP * 10 : FRAME_WIDTH_STEP;
    // Left and right move the handle itself: away from the frame widens it.
    const outward = edge === "right" ? "ArrowRight" : "ArrowLeft";
    const inward = edge === "right" ? "ArrowLeft" : "ArrowRight";
    let next: number | null | undefined;
    switch (event.key) {
      case outward:
      case "ArrowUp":
        next = snap(base + step, maxWidth);
        break;
      case inward:
      case "ArrowDown":
        next = snap(base - step, maxWidth);
        break;
      case "PageUp":
        next = snap(base + FRAME_WIDTH_STEP * 10, maxWidth);
        break;
      case "PageDown":
        next = snap(base - FRAME_WIDTH_STEP * 10, maxWidth);
        break;
      case "Home":
        next = FRAME_WIDTH_MIN;
        break;
      case "End":
        next = maxWidth;
        break;
      case "Delete":
      case "Backspace":
        next = null;
        break;
      default:
        return;
    }
    event.preventDefault();
    onWidthChange(next);
  }

  const readout = width === null ? `Auto · ${measured} px` : `${width} px`;
  const showReadout = dragging || focused || hovered;

  return (
    <>
      <div className="p:a i:-2 bw:1 bs:s bc:accent pe:none" aria-hidden="true" />

      {HANDLES.map((handle) => (
        <div
          key={handle.id}
          role={handle.focusable ? "slider" : undefined}
          tabIndex={handle.focusable ? 0 : undefined}
          aria-hidden={handle.focusable ? undefined : true}
          aria-label={handle.focusable ? `Frame width, ${handle.edge} edge` : undefined}
          aria-orientation={handle.focusable ? "horizontal" : undefined}
          aria-valuemin={handle.focusable ? FRAME_WIDTH_MIN : undefined}
          aria-valuemax={handle.focusable ? maxWidth : undefined}
          aria-valuenow={handle.focusable ? current : undefined}
          aria-valuetext={handle.focusable ? readout : undefined}
          onPointerDown={(event) => startDrag(event, handle.edge)}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
          onDoubleClick={() => onWidthChange(null)}
          onKeyDown={(event) => handleKeyDown(event, handle.edge)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          className={`p:a zi:20 d:f ai:c jc:c ta:none us:none br:sm ${handle.place} ${handle.cursor} ${FOCUS}`}
        >
          <span className="d:b w:2 h:2 bw:1 bs:s bc:accent bg:page pe:none" />
        </div>
      ))}

      {showReadout && current > 0 && (
        <div aria-hidden="true" className="p:a l:0 r:0 t:100% mt:4 d:f jc:c pe:none zi:20">
          <span className="px:2 py:1 br:sm bg:accent c:on-accent ff:m fs:xs fw:600 ws:nw">
            {readout}
          </span>
        </div>
      )}
    </>
  );
}
