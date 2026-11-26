import { Button } from "@base-ui/react/button";
import { Dialog } from "@base-ui/react/dialog";
import { Input } from "@base-ui/react/input";
import { IconArrowLeft, IconKeyboard, IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Kbd from "@/components/ui/kbd.tsx";
import type { Shortcut } from "../lib/commands";
import { FOCUS, POPUP } from "./styles";

export interface Command {
  id: string;
  label: string;
  kbd?: string;
  run: () => void;
}

type View = "commands" | "shortcuts";

const SHORTCUTS_COMMAND_ID = "keyboard-shortcuts";

export function CommandPalette({
  open,
  onOpenChange,
  commands,
  shortcuts,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: Command[];
  shortcuts: Shortcut[];
}) {
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const [view, setView] = useState<View>("commands");

  function showView(next: View) {
    setView(next);
    setQuery("");
    setHighlighted(0);
  }

  // The shortcuts list opens inside the palette, which stays open for it.
  const allCommands: Command[] = [
    {
      id: SHORTCUTS_COMMAND_ID,
      label: "Keyboard shortcuts",
      run: () => showView("shortcuts"),
    },
    ...commands,
  ];
  const needle = query.toLowerCase();
  const matches = allCommands.filter((command) => command.label.toLowerCase().includes(needle));
  const shortcutMatches = shortcuts.filter(
    (shortcut) =>
      shortcut.label.toLowerCase().includes(needle) || shortcut.kbd.toLowerCase().includes(needle),
  );

  // Reset the search whenever the palette opens fresh.
  useEffect(() => {
    if (open) showView("commands");
  }, [open]);

  // Keep the keyboard-highlighted row visible as arrow keys move past
  // the visible edge of the scrollable list.
  // biome-ignore lint/correctness/useExhaustiveDependencies: highlighted is the scroll trigger, read from the DOM
  useEffect(() => {
    document.querySelector("[data-palette-highlighted]")?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  function runCommand(command: Command) {
    if (command.id !== SHORTCUTS_COMMAND_ID) onOpenChange(false);
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
              {view === "shortcuts" ? (
                <Button
                  aria-label="Back to commands"
                  onClick={() => showView("commands")}
                  className={`d:f ai:c jc:c fs:0 w:6 h:6 ml:-1 p:0 bw:0 br:sm bg:transparent c:hint c:p h:c:label h:bg:well ${FOCUS}`}
                >
                  <IconArrowLeft size={16} stroke={1.8} />
                </Button>
              ) : (
                <IconSearch size={16} stroke={1.8} className="fs:0 c:hint" />
              )}
              <Input
                autoFocus
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setHighlighted(0);
                }}
                onKeyDown={(event) => {
                  if (view === "shortcuts") {
                    // Backspace on an empty search goes back, as Escape closes.
                    if (event.key === "Backspace" && query === "") {
                      event.preventDefault();
                      showView("commands");
                    }
                    return;
                  }
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
                placeholder={view === "shortcuts" ? "Search shortcuts..." : "Search commands..."}
                className="f:1 min-w:0 fs:md bg:transparent bw:0 os:none p:0 c:label p::c:hint"
              />
            </div>
          </div>

          {view === "shortcuts" ? (
            <div className="p:1 max-h:80 oy:auto">
              <div className="d:f ai:c g:2 px:3 pt:1 pb:2 fs:xs c:hint">
                <IconKeyboard size={14} stroke={1.8} className="fs:0" />
                Keyboard shortcuts
              </div>
              {shortcutMatches.length === 0 && (
                <div className="px:3 py:3 fs:sm c:hint">No shortcuts found</div>
              )}
              <ul className="m:0 p:0 lst:none">
                {shortcutMatches.map((shortcut) => (
                  <li
                    key={`${shortcut.label} ${shortcut.kbd}`}
                    className="d:f ai:c jc:sb g:2 px:3 py:2 fs:sm c:label"
                  >
                    <span>{shortcut.label}</span>
                    <Kbd keys={shortcut.kbd.split(" ")} />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
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
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
