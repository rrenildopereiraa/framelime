import {
  IconCheck,
  IconCopy,
  IconCopyCheck,
  IconLink,
  IconPlus,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import Button from "@/components/ui/button.tsx";
import Kbd from "@/components/ui/kbd.tsx";
import ThemeSwitcher from "@/components/ui/theme-switcher.tsx";
import { MONO_STYLE } from "@/lib/fonts.ts";
import { type ChromeMode, useChromeTheme } from "../lib/chrome-theme";
import { modKey } from "../lib/platform";
import { type EditorDocument, MAX_DOCUMENTS } from "../lib/types";
import { ExportButton } from "./export-button";
import type { ExportFormat } from "./format-picker";
import { Logo } from "./logo";
import { FOCUS } from "./styles";
import { Tooltip } from "./tooltip";

/** Yumma UI's switcher calls following the system `system`; the editor, `auto`. */
const TO_SWITCHER = { light: "light", dark: "dark", auto: "system" } as const;
const FROM_SWITCHER: Record<string, ChromeMode> = { light: "light", dark: "dark", system: "auto" };

const ICON = "w:4 h:4";

function TabItem({
  doc,
  isActive,
  canClose,
  onSelect,
  onClose,
}: {
  doc: EditorDocument;
  isActive: boolean;
  canClose: boolean;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
}) {
  return (
    <div
      className={`d:f ai:c fs:0 g:1 h:7 pl:3 bw:1 bs:s br:9999 tp:c tdu:150 ${canClose ? "pr:1" : "pr:3"} ${
        isActive ? "bg:raised bc:accent bs-o:key" : "bc:transparent h:bg:line"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(doc.id)}
        className={`d:f ai:c p:0 bg:transparent bw:0 br:sm fs:xs ws:nw us:none c:p ${isActive ? "c:label" : "c:hint h:c:label"} ${FOCUS}`}
        style={MONO_STYLE}
      >
        {doc.fileName || "Untitled"}
      </button>
      {canClose && (
        <Tooltip content="Close snippet">
          <button
            type="button"
            onClick={() => onClose(doc.id)}
            aria-label="Close snippet"
            className={`d:f ai:c jc:c w:5 h:5 p:0 bg:transparent bw:0 br:9999 c:p c:hint h:c:label h:bg:well ${FOCUS}`}
          >
            <IconX className="w:3 h:3 fs:0" stroke={2} />
          </button>
        </Tooltip>
      )}
    </div>
  );
}

export function EditorTabBar({
  documents,
  activeId,
  onSelect,
  onClose,
  onAdd,
  onOpenPalette,
  onCopy,
  onExport,
  onShare,
  exporting,
  format,
  onFormatChange,
}: {
  documents: EditorDocument[];
  activeId: string;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onAdd: () => void;
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
  const canClose = documents.length > 1;
  const atLimit = documents.length >= MAX_DOCUMENTS;
  const addLabel = atLimit ? `Snippet limit reached (${MAX_DOCUMENTS})` : "New snippet";

  return (
    <header className="d:f ai:c g:3 p:st t:0 zi:10 px:3 py:2 bbw:1 bs:s bc:line bg:page">
      <Link
        href="/"
        aria-label="Framelime home"
        className={`d:f ai:c h:8 px:1 br:md td:none ${FOCUS}`}
      >
        <Logo />
      </Link>

      <div className="d:none @lg:d:f ai:c g:1 min-w:0 ox:auto p:1 br:9999 bg:well bs-o:sunk">
        {documents.map((doc) => (
          <TabItem
            key={doc.id}
            doc={doc}
            isActive={doc.id === activeId}
            canClose={canClose}
            onSelect={onSelect}
            onClose={onClose}
          />
        ))}

        <Tooltip content={addLabel}>
          <Button
            variant="ghost"
            size="sm"
            shape="pill"
            iconOnly
            icon={<IconPlus className={ICON} />}
            onClick={onAdd}
            disabled={atLimit}
            focusableWhenDisabled
            className="w:7 h:7 c:hint h:c:label"
          >
            {addLabel}
          </Button>
        </Tooltip>
      </div>

      <div className="f:1" />

      <div className="d:f ai:c g:1 p:1 br:9999 bw:1 bs:s bc:rim bg:raised bs-o:key">
        <Button
          variant="ghost"
          size="sm"
          shape="pill"
          icon={<IconSearch className={ICON} />}
          onClick={onOpenPalette}
          className="d:none @lg:d:if pr:1 fw:400 c:hint h:c:label"
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
