import { IconChevronDown, IconDownload } from "@tabler/icons-react";
import Button from "@/components/ui/button.tsx";
import Menu from "@/components/ui/menu.tsx";
import { type ExportFormat, FORMAT_LABELS, IMAGE_FORMATS } from "./format-picker";

const ICON = "w:4 h:4";

/** Yumma UI's primary button, split: Export, and a menu for the format. */
export function ExportButton({
  exporting,
  onExport,
  format,
  onFormatChange,
}: {
  exporting: boolean;
  onExport: () => void;
  format: ExportFormat;
  onFormatChange: (value: ExportFormat) => void;
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
            type: "radio",
            value: format,
            onValueChange: (value) => onFormatChange(value as ExportFormat),
            options: IMAGE_FORMATS.map((key) => ({ value: key, label: FORMAT_LABELS[key] })),
          },
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
