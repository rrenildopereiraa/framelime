import { IconChevronRight } from "@tabler/icons-react";
import { type ReactNode, useId } from "react";
import { FOCUS } from "./styles";

/**
 * One group of the inspector: a header that opens and closes it and, while it
 * is closed, a summary of its values, so the whole setup reads at a glance.
 */
export function InspectorSection({
  title,
  summary,
  open,
  onOpenChange,
  inSheet = false,
  children,
}: {
  title: string;
  /** Shown beside the title while the section is closed. */
  summary?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The settings drawer, whose wider gutter the section lines up with. */
  inSheet?: boolean;
  children: ReactNode;
}) {
  const bodyId = useId();
  const gutter = inSheet ? "px:6" : "px:4";

  return (
    <section className="bbw:1 bs:s bc:line">
      <h3 className="m:0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => onOpenChange(!open)}
          className={`d:f ai:c g:2 w:100% h:11 ${gutter} bw:0 bg:transparent ta:l us:none c:p c:label h:bg:well ${FOCUS}`}
        >
          <IconChevronRight
            aria-hidden
            className={`w:3 h:3 fs:0 c:hint tp:a tdu:200 @prm:tp:none ${open ? "ro:18" : "ro:0"}`}
            stroke={2.5}
          />
          <span className="fs:xs fw:700 tt:u ls:4">{title}</span>
          {summary && (
            <span
              className={`ml:auto min-w:0 o:h to:e ws:nw fs:xs c:hint tp:o tdu:200 @prm:tp:none ${open ? "o:0" : ""}`}
            >
              {summary}
            </span>
          )}
        </button>
      </h3>
      <div id={bodyId} className={`frame-collapsible ${open ? "frame-collapsible-open" : ""}`}>
        {/* Closed, its controls leave the tab order along with the screen. */}
        <div className="o:h min-h:0" inert={!open}>
          <div className={`d:f fd:c g:3 ${gutter} pt:1 pb:4`}>{children}</div>
        </div>
      </div>
    </section>
  );
}

/** A small heading inside a section, over a few related rows. */
export function InspectorSubheading({ children }: { children: ReactNode }) {
  return <span className="pt:1 fs:xs fw:500 us:none c:hint">{children}</span>;
}
