import { IconLock, IconLockOpen } from "@tabler/icons-react";
import Button from "@/components/ui/button.tsx";
import Menu from "@/components/ui/menu.tsx";
import Toggle from "@/components/ui/toggle.tsx";
import { RANDOMIZE_GROUPS, type RandomizeGroup } from "../lib/randomize";

const ICON = "w:4 h:4";

export interface RandomizeLocksProps {
  locks: RandomizeGroup[];
  onLockChange: (group: RandomizeGroup, locked: boolean) => void;
}

function lockLabel(locks: RandomizeGroup[]) {
  return locks.length === 0 ? "Randomize locks" : `Randomize locks, ${locks.length} locked`;
}

/** The end of the Randomize split button in the status bar: a menu of what it keeps. */
export function RandomizeLocksMenu({ locks, onLockChange }: RandomizeLocksProps) {
  const locked = new Set(locks);
  return (
    <Menu
      size="sm"
      items={[
        {
          type: "group",
          label: "Keep when randomizing",
          items: RANDOMIZE_GROUPS.map((group) => ({
            type: "checkbox" as const,
            label: group.label,
            checked: locked.has(group.id),
            onCheckedChange: (checked: boolean) => onLockChange(group.id, checked),
          })),
        },
        { type: "separator" },
        {
          label: "Unlock all",
          icon: <IconLockOpen className={ICON} />,
          disabled: locks.length === 0,
          onClick: () => {
            for (const group of locks) onLockChange(group, false);
          },
        },
      ]}
      render={
        <Button
          variant="ghost"
          size="sm"
          shape="none"
          iconOnly
          icon={
            locks.length > 0 ? (
              <IconLock className={`${ICON} c:accent`} />
            ) : (
              <IconLockOpen className={ICON} />
            )
          }
          className="w:8 brr:9999 c:hint h:c:label"
        >
          {lockLabel(locks)}
        </Button>
      }
    />
  );
}

/** Under Randomize in the settings drawer: a toggle per group. */
export function RandomizeLockToggles({ locks, onLockChange }: RandomizeLocksProps) {
  const locked = new Set(locks);
  return (
    <div role="group" aria-label="Keep when randomizing" className="d:f fd:c g:2">
      <span className="fs:xs c:hint">Keep when randomizing</span>
      <div className="d:f fw:w g:2">
        {RANDOMIZE_GROUPS.map((group) => (
          <Toggle
            key={group.id}
            size="sm"
            label={group.label}
            icon={<IconLockOpen className={ICON} />}
            pressedIcon={<IconLock className={ICON} />}
            pressed={locked.has(group.id)}
            onPressedChange={(pressed) => onLockChange(group.id, pressed)}
          />
        ))}
      </div>
    </div>
  );
}
