import { IconCheck, IconCopy, IconCopyCheck, IconLink, IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import Button from "@/components/ui/button.tsx";
import Kbd from "@/components/ui/kbd.tsx";
import ThemeSwitcher from "@/components/ui/theme-switcher.tsx";
import { type ChromeMode, useChromeTheme } from "../lib/chrome-theme";
import { modKey } from "../lib/platform";
import { ExportButton } from "./export-button";
import type { ExportFormat } from "./format-picker";
import { Logo } from "./logo";
import { FOCUS } from "./styles";
import { Tooltip } from "./tooltip";

/** Yumma UI's switcher calls following the system `system`; the editor, `auto`. */
const TO_SWITCHER = { light: "light", dark: "dark", auto: "system" } as const;
const FROM_SWITCHER: Record<string, ChromeMode> = { light: "light", dark: "dark", system: "auto" };

const ICON = "w:4 h:4";

/** The editor's top bar: home link, search, share, copy, theme and export. */
export function EditorHeader({
  onOpenPalette,
  onCopy,
  onExport,
  onShare,
  exporting,
  format,
  onFormatChange,
}: {
  onOpenPalette: () => void;
  onCopy: () => void;
  onExport: () => void;
  onShare: () => void;
  exporting: boolean;
  format: ExportFormat;
  onFormatChange: (value: ExportFormat) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const { mode, setMode } = useChromeTheme();

  return (
    <header className="d:f ai:c g:3 p:st t:0 zi:10 px:3 py:2 bbw:1 bs:s bc:line bg:page">
      <Link
        href="/"
        aria-label="Framelime home"
        className={`d:f ai:c h:8 px:1 br:md td:none ${FOCUS}`}
      >
        <Logo />
      </Link>

      <div className="f:1" />

      <div className="d:f ai:c g:1 p:1 br:9999 bw:1 bs:s bc:rim bg:raised bs-o:key">
        <Button
          variant="ghost"
          size="sm"
          shape="pill"
          icon={<IconSearch className={ICON} />}
          onClick={onOpenPalette}
          className="d:none @lg:d:if pr:1 fw:400 bg:well c:label h:bg:line"
        >
          Search
          <Kbd keys={[modKey, "K"]} />
        </Button>

        <Tooltip content={shared ? "Link copied" : "Copy a link to this snippet"}>
          <Button
            variant="ghost"
            size="sm"
            shape="pill"
            iconOnly
            icon={
              shared ? <IconCheck className={`${ICON} c:accent`} /> : <IconLink className={ICON} />
            }
            onClick={() => {
              onShare();
              setShared(true);
              setTimeout(() => setShared(false), 1500);
            }}
            className="c:hint h:c:label"
          >
            Share
          </Button>
        </Tooltip>

        <Tooltip content={copied ? "Image copied" : "Copy image"}>
          <Button
            variant="ghost"
            size="sm"
            shape="pill"
            iconOnly
            icon={
              copied ? (
                <IconCopyCheck className={`${ICON} c:accent`} />
              ) : (
                <IconCopy className={ICON} />
              )
            }
            onClick={() => {
              onCopy();
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="c:hint h:c:label"
          >
            Copy image
          </Button>
        </Tooltip>

        <ThemeSwitcher
          variant="cycle"
          size="sm"
          shape="pill"
          value={TO_SWITCHER[mode]}
          onValueChange={(next) => setMode(FROM_SWITCHER[next] ?? "auto")}
          className="d:none @sm:d:f"
        />

        <ExportButton
          exporting={exporting}
          onExport={onExport}
          format={format}
          onFormatChange={onFormatChange}
        />
      </div>
    </header>
  );
}
