import { IconBorderCorners } from "@tabler/icons-react";
import { useState } from "react";
import Knob from "@/components/ui/knob.tsx";
import Slider from "@/components/ui/slider.tsx";
import Toggle from "@/components/ui/toggle.tsx";
import type { CornerRadii } from "../lib/types";

export const RADIUS_MIN = 0;
export const RADIUS_MAX = 16;

// Under the slider, every 4 px: evenly spaced, as the slider spreads its marks.
const MARKS = ["0", "4", "8", "12", "16"];

const CORNERS: { id: keyof CornerRadii; label: string }[] = [
  { id: "tl", label: "Top left" },
  { id: "tr", label: "Top right" },
  { id: "bl", label: "Bottom left" },
  { id: "br", label: "Bottom right" },
];

export function RadiusControl({
  radii,
  onRadiiChange,
}: {
  radii: CornerRadii;
  onRadiiChange: (value: CornerRadii) => void;
}) {
  const [split, setSplit] = useState(false);

  const values = [radii.tl, radii.tr, radii.bl, radii.br];
  const uniform = values.every((value) => value === values[0]);

  function setAll(value: number) {
    onRadiiChange({ tl: value, tr: value, bl: value, br: value });
  }

  return (
    <div className="d:f fd:c g:3 pb:4">
      <Slider
        label="Border radius"
        value={uniform ? radii.tl : Math.max(...values)}
        onValueChange={(value) => setAll(Array.isArray(value) ? value[0] : value)}
        min={RADIUS_MIN}
        max={RADIUS_MAX}
        step={1}
        unit="px"
        marks={MARKS}
        formatValue={uniform ? undefined : () => "Mixed"}
        className="w:100%"
      />

      <Toggle
        size="sm"
        label="Per corner"
        icon={<IconBorderCorners className="w:4 h:4" />}
        pressed={split}
        onPressedChange={setSplit}
        className="as:s"
      />

      {split && (
        // Laid out as the frame's corners are: top left, top right, then the bottom two.
        <div className="d:g gtc:2 g:3 ji:c">
          {CORNERS.map(({ id, label }) => (
            <Knob
              key={id}
              label={label}
              size="sm"
              value={radii[id]}
              onValueChange={(value) => onRadiiChange({ ...radii, [id]: value })}
              min={RADIUS_MIN}
              max={RADIUS_MAX}
              step={1}
              unit="px"
            />
          ))}
        </div>
      )}
    </div>
  );
}
