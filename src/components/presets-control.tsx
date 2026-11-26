import { Input } from "@base-ui/react/input";
import { Popover } from "@base-ui/react/popover";
import { IconBookmarks, IconChevronDown, IconDeviceFloppy, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import Button from "@/components/ui/button.tsx";
import { type Preset, PRESET_NAME_MAX } from "../lib/presets";
import { FOCUS, POPUP } from "./styles";

const ICON = "w:4 h:4";

/** Names the current look to keep it, and reapplies a kept one in one click. */
export function PresetsControl({
  presets,
  onSave,
  onApply,
  onRemove,
}: {
  presets: Preset[];
  onSave: (name: string) => void;
  onApply: (preset: Preset) => void;
  onRemove: (preset: Preset) => void;
}) {
  const [name, setName] = useState("");
  const trimmed = name.trim();
  const replaces = presets.some((p) => p.name.toLowerCase() === trimmed.toLowerCase());

  function save() {
    if (!trimmed) return;
    onSave(trimmed);
    setName("");
  }

  return (
    <div className="d:f fd:c g:2">
      <form
        className="d:f g:2"
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        <Input
          aria-label="Preset name"
          value={name}
          maxLength={PRESET_NAME_MAX}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name this look"
          className={`f:1 min-w:0 h:8 px:3 bw:1 bs:s bc:line br:md bg:field bs-o:sunk fs:xs c:label p::c:hint ${FOCUS}`}
        />
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          disabled={!trimmed}
          icon={<IconDeviceFloppy className={ICON} />}
        >
          {replaces ? "Update" : "Save"}
        </Button>
      </form>

      {presets.length === 0 ? (
        <p className="fs:xs c:hint">Keeps everything but the code, in this browser.</p>
      ) : (
        <ul className="d:f fd:c g:1 m:0 p:0 lst:none">
          {presets.map((preset) => (
            <li key={preset.id} className="d:f ai:c g:1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onApply(preset)}
                className="f:1 min-w:0 jc:fs c:label"
              >
                <span className="o:h to:e">{preset.name}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                icon={<IconTrash className={ICON} />}
                onClick={() => onRemove(preset)}
                className="c:hint h:c:label"
              >
                {`Delete ${preset.name}`}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** The inspector's first row: a button that opens the presets in a popover. */
export function PresetsMenu(props: Parameters<typeof PresetsControl>[0]) {
  const count = props.presets.length;
  return (
    <Popover.Root>
      <Popover.Trigger
        render={
          <Button
            variant="secondary"
            size="sm"
            icon={<IconBookmarks className={ICON} />}
            className="w:100% jc:fs"
          />
        }
      >
        <span className="f:1 ta:l">Presets</span>
        <span className="d:if ai:c g:1 fw:400 c:hint">
          {count === 0 ? "None saved" : `${count} saved`}
          <IconChevronDown aria-hidden className="w:3 h:3" />
        </span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} align="start" className="zi:50">
          <Popover.Popup
            className={`popover-popup w:72 max-w:var(--available-width) p:3 c:label os:none ${POPUP}`}
          >
            <PresetsControl {...props} />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
