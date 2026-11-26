import { IconChevronDown, IconDownload } from "@tabler/icons-react";
import Button from "@/components/ui/button.tsx";
import Menu, { type MenuItem } from "@/components/ui/menu.tsx";
import { EXPORT_SCALES, type ExportScale, type ImageSize } from "../lib/types";
import { type ExportFormat, FORMAT_LABELS, IMAGE_FORMATS } from "./format-picker";

const ICON = "w:4 h:4";

/**
 * Scale applies to raster formats; a size preset fixes the size instead, and
 * SVG has none.
 */
function scaleItems(
  format: ExportFormat,
  scale: ExportScale,
  onScaleChange: (value: ExportScale) => void,
  presetSize: ImageSize | undefined,
): MenuItem[] {
  if (format === "svg") return [];
  return [
    { type: "separator" },
    {
      type: "group",
      label: "Scale",
      items: presetSize
        ? [{ label: `${presetSize.width} × ${presetSize.height}, set by the size`, disabled: true }]
        : [
            {
              type: "radio",
              value: String(scale),
              onValueChange: (value) => onScaleChange(Number(value) as ExportScale),
              options: EXPORT_SCALES.map((key) => ({ value: String(key), label: `${key}×` })),
            },
          ],
    },
  ];
}

/** Yumma UI's primary button, split: Export, and a menu for the format and scale. */
export function ExportButton({
  exporting,
  onExport,
  format,
  onFormatChange,
  scale,
  onScaleChange,
  presetSize,
}: {
  exporting: boolean;
  onExport: () => void;
  format: ExportFormat;
  onFormatChange: (value: ExportFormat) => void;
  scale: ExportScale;
  onScaleChange: (value: ExportScale) => void;
  presetSize?: ImageSize;
}) {
  return (
    <div className="d:f ml:1">
      <Button
        size="sm"
        shape="none"
        loading={exporting}
        icon={<IconDownload className={ICON} />}
        onClick={onExport}
        className="blr:9999"
      >
        {exporting ? "Exporting" : `Export ${FORMAT_LABELS[format]}`}
      </Button>

      <Menu
        size="sm"
        items={[
          {
            type: "group",
            label: "Format",
            items: [
              {
                type: "radio",
                value: format,
                onValueChange: (value) => onFormatChange(value as ExportFormat),
                options: IMAGE_FORMATS.map((key) => ({ value: key, label: FORMAT_LABELS[key] })),
              },
            ],
          },
          ...scaleItems(format, scale, onScaleChange, presetSize),
        ]}
        render={
          <Button
            size="sm"
            shape="none"
            iconOnly
            icon={<IconChevronDown className={ICON} />}
            disabled={exporting}
            className="w:8 blw:0 brr:9999"
          >
            Export format
          </Button>
        }
      />
    </div>
  );
}
