import { IconArrowsShuffle, IconBrandGithub, IconWand } from "@tabler/icons-react";
import Button from "@/components/ui/button.tsx";
import Switch from "@/components/ui/switch.tsx";
import { site } from "@/lib/site.ts";
import { LANGUAGES, type LanguageId } from "../lib/highlighter";
import { modLabel } from "../lib/platform";
import { LanguagePicker } from "./language-picker";
import { RandomizeLocksMenu, type RandomizeLocksProps } from "./randomize-locks";
import { Tooltip } from "./tooltip";

export function StatusBar({
  language,
  onLanguageChange,
  onRandomize,
  randomizeLocks,
  onRandomizeLockChange,
  canFormat,
  onFormat,
  formatting,
  showBoundingBox,
  onShowBoundingBoxChange,
}: {
  language: LanguageId;
  onLanguageChange: (value: LanguageId) => void;
  onRandomize: () => void;
  randomizeLocks: RandomizeLocksProps["locks"];
  onRandomizeLockChange: RandomizeLocksProps["onLockChange"];
  canFormat: boolean;
  onFormat: () => void;
  formatting: boolean;
  showBoundingBox: boolean;
  onShowBoundingBoxChange: (value: boolean) => void;
}) {
  return (
    <footer className="d:none @lg:d:f ai:c g:2 px:2 py:1 btw:1 bs:s bc:line bg:page">
      <LanguagePicker value={language} onValueChange={onLanguageChange} />

      {/* One split button: Randomize, and the menu of what it keeps. */}
      <div role="group" aria-label="Randomize" className="d:f ai:c bw:1 bs:s bc:line br:9999">
        <Tooltip content={`Randomize appearance (${modLabel} Shift R)`}>
          <Button
            variant="ghost"
            size="sm"
            shape="none"
            icon={<IconArrowsShuffle className="w:4 h:4" />}
            onClick={onRandomize}
            className="blr:9999 fw:400 c:hint h:c:label"
          >
            Randomize
          </Button>
        </Tooltip>
        <RandomizeLocksMenu locks={randomizeLocks} onLockChange={onRandomizeLockChange} />
      </div>

      <Tooltip
        content={
          canFormat
            ? "Format code (Alt Shift F)"
            : `Formatting isn't available for ${LANGUAGES[language]}`
        }
      >
        <Button
          variant="ghost"
          size="sm"
          shape="pill"
          icon={<IconWand className="w:4 h:4" />}
          onClick={onFormat}
          disabled={!canFormat}
          loading={formatting}
          className="fw:400 c:hint h:c:label"
        >
          Format
        </Button>
      </Tooltip>

      <div className="f:1" />

      {/* An editing aid, not part of the image, so it sits with the editor's tools. */}
      <label className="d:f ai:c g:2 px:2 fs:sm us:none c:hint">
        Bounding box
        <Switch
          ariaLabel="Bounding box"
          size="sm"
          checked={showBoundingBox}
          onCheckedChange={onShowBoundingBoxChange}
        />
      </label>

      <Button
        variant="ghost"
        size="sm"
        shape="pill"
        icon={<IconBrandGithub className="w:4 h:4" />}
        render={<a href={site.repo} target="_blank" rel="noreferrer" />}
        nativeButton={false}
        className="fw:400 c:hint h:c:label"
      >
        GitHub
      </Button>
    </footer>
  );
}
