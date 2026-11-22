import { IconChevronRight } from "@tabler/icons-react";
import { type ReactNode, useSyncExternalStore } from "react";
import Drawer from "@/components/ui/drawer.tsx";
import { FOCUS } from "./styles";

// Tablets, from the md breakpoint up to lg, where the inspector takes over.
const TABLET = "(min-width: 48rem)";

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Floats clear of the edges on tablets; sits against the bottom on phones. */
function useVariant() {
  return useMediaQuery(TABLET) ? "flyout" : "edge";
}

/** Settings on phones and tablets: Yumma UI's drawer, opened by a swipe up from the bottom edge. */
export function BottomSheet({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
}) {
  const variant = useVariant();

  // No trigger of its own: a swipe up from the bottom edge opens it.
  return (
    <div className="settings-sheet @lg:d:none">
      <Drawer
        side="bottom"
        variant={variant}
        title={title}
        open={open}
        onOpenChange={onOpenChange}
        swipeToOpen
      >
        {children}
      </Drawer>
    </div>
  );
}

/**
 * A row in the settings drawer that opens a drawer of its own on top, so the
 * settings stack instead of sitting behind tabs.
 */
export function SubSheet({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  const variant = useVariant();

  return (
    <Drawer
      side="bottom"
      variant={variant}
      title={title}
      trigger={
        <button
          type="button"
          className={`d:f ai:c g:3 w:100% px:3 py:3 bw:1 bs:s bc:line br:xl bg:raised bs-o:key fs:sm fw:500 ta:l us:none c:p c:label h:bg:well ${FOCUS}`}
        >
          <span className="d:f fs:0 c:hint">{icon}</span>
          <span className="f:1">{title}</span>
          <IconChevronRight className="w:4 h:4 fs:0 c:hint" stroke={1.8} />
        </button>
      }
    >
      {children}
    </Drawer>
  );
}
