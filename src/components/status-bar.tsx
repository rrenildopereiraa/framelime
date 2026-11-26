import { IconArrowsShuffle, IconBrandGithub, IconWand } from "@tabler/icons-react";
import Button from "@/components/ui/button.tsx";
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
}: {
  language: LanguageId;
  onLanguageChange: (value: LanguageId) => void;
  onRandomize: () => void;
  randomizeLocks: RandomizeLocksProps["locks"];
  onRandomizeLockChange: RandomizeLocksProps["onLockChange"];
  canFormat: boolean;
  onFormat: () => void;
  formatting: boolean;
}) {
  return (
    <footer className="d:none @lg:d:f ai:c g:2 px:2 py:1 btw:1 bs:s bc:line bg:page">
      <LanguagePicker value={language} onValueChange={onLanguageChange} />

      <Tooltip content={`Randomize appearance (${modLabel} Shift R)`}>
        <Button
          variant="ghost"
          size="sm"
          shape="pill"
          icon={<IconArrowsShuffle className="w:4 h:4" />}
          onClick={onRandomize}
          className="fw:400 c:hint h:c:label"
        >
          Randomize
        </Button>
      </Tooltip>
      <RandomizeLocksMenu locks={randomizeLocks} onLockChange={onRandomizeLockChange} />

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
