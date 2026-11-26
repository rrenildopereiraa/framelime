import { Input } from "@base-ui/react/input";
import { IconDeviceFloppy, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import Button from "@/components/ui/button.tsx";
import { type Preset, PRESET_NAME_MAX } from "../lib/presets";
import { FOCUS } from "./styles";

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
    <div className="d:f fd:c g:2 pb:5">
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
