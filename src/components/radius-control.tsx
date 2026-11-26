import { IconBorderCorners } from "@tabler/icons-react";
import { useState } from "react";
import Knob from "@/components/ui/knob.tsx";
import Slider from "@/components/ui/slider.tsx";
import Toggle from "@/components/ui/toggle.tsx";
import { type CornerRadii, RADIUS_MAX, RADIUS_MIN } from "../lib/types";

export { RADIUS_MAX, RADIUS_MIN };

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
    <div className="d:f fd:c g:3">
      <Slider
        label="Corner radius"
        value={uniform ? radii.tl : Math.max(...values)}
        onValueChange={(value) => setAll(Array.isArray(value) ? value[0] : value)}
        min={RADIUS_MIN}
        max={RADIUS_MAX}
        step={1}
        // The per-corner toggle rides beside the value, so it takes no row of its own.
        formatValue={() => (
          <span className="d:if ai:c g:2">
            {uniform ? (
              <span>
                <span className="c:label fw:500">{radii.tl}</span> px
              </span>
            ) : (
              "Mixed"
            )}
            <Toggle
              size="sm"
              aria-label="Set each corner"
              icon={<IconBorderCorners className="w:4 h:4" />}
              pressed={split}
              onPressedChange={setSplit}
              className="w:6 h:6"
            />
          </span>
        )}
        className="w:100%"
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
