import { Button } from "@base-ui/react/button";
import { Dialog } from "@base-ui/react/dialog";
import { Input } from "@base-ui/react/input";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Kbd from "@/components/ui/kbd.tsx";
import { POPUP } from "./styles";

export interface Command {
  id: string;
  label: string;
  kbd?: string;
  run: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  commands,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: Command[];
}) {
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);

  const matches = commands.filter((command) =>
    command.label.toLowerCase().includes(query.toLowerCase()),
  );

  // Reset the search whenever the palette opens fresh.
  useEffect(() => {
    if (open) {
      setQuery("");
      setHighlighted(0);
    }
  }, [open]);

  // Keep the keyboard-highlighted row visible as arrow keys move past
  // the visible edge of the scrollable list.
  // biome-ignore lint/correctness/useExhaustiveDependencies: highlighted is the scroll trigger, read from the DOM
  useEffect(() => {
    document.querySelector("[data-palette-highlighted]")?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  function runCommand(command: Command) {
    onOpenChange(false);
    command.run();
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal keepMounted>
        <Dialog.Backdrop className="p:f i:0 zi:80 bg:page/70 tp:o tdu:250 ttf:out-quart opening:o:0 closing:o:0 closing:tdu:150 closing:ttf:eo @prm:tp:none" />
        <Dialog.Popup
          className={`p:f t:24 l:50% ttx:-half zi:90 w:120 max-w:calc(100%-2rem) o:h ${POPUP} tp:ot tdu:250 ttf:out-quart opening:o:0 opening:s:97 closing:o:0 closing:s:97 closing:tdu:150 closing:ttf:eo @prm:tp:none`}
        >
          <div className="p:3 pb:2">
            <div className="d:f ai:c g:2 h:10 px:3 bw:1 bs:s bc:line br:md bg:page bs-o:sunk">
              <IconSearch size={16} stroke={1.8} className="fs:0 c:hint" />
              <Input
                autoFocus
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setHighlighted(0);
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setHighlighted((index) => Math.min(index + 1, matches.length - 1));
                  } else if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setHighlighted((index) => Math.max(index - 1, 0));
                  } else if (event.key === "Enter" && matches[highlighted]) {
                    event.preventDefault();
                    runCommand(matches[highlighted]);
                  }
                }}
                placeholder="Search commands..."
                className="f:1 min-w:0 fs:md bg:transparent bw:0 os:none p:0 c:label p::c:hint"
              />
            </div>
          </div>

          <div className="p:1 max-h:80 oy:auto">
            {matches.length === 0 && (
              <div className="px:3 py:3 fs:sm c:hint">No commands found</div>
            )}
            {matches.map((command, index) => (
              <Button
                key={command.id}
                onClick={() => runCommand(command)}
                onMouseEnter={() => setHighlighted(index)}
                data-palette-highlighted={index === highlighted ? "" : undefined}
                className={`d:f ai:c jc:sb g:2 w:100% px:3 py:2 br:md fs:sm ta:l us:none c:p bw:0 ${
                  index === highlighted ? "bg:well c:label" : "bg:transparent c:hint"
                }`}
              >
                <span>{command.label}</span>
                {command.kbd && <Kbd keys={command.kbd.split(" ")} />}
              </Button>
            ))}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
