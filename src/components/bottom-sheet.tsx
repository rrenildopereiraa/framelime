import { type ReactNode, useSyncExternalStore } from "react";
import Drawer from "@/components/ui/drawer.tsx";

// Tablets, from the md breakpoint up to lg, where the inspector takes over.
const TABLET = "(min-width: 48rem)";
// Opens at half the screen; drag it up for the rest.
const SNAP_POINTS = [0.5, 1];

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
  const tablet = useMediaQuery(TABLET);

  // No trigger of its own: a swipe up from the bottom edge opens it.
  return (
    <div className="@lg:d:none">
      <Drawer
        side="bottom"
        variant={tablet ? "flyout" : "edge"}
        title={title}
        open={open}
        onOpenChange={onOpenChange}
        snapPoints={SNAP_POINTS}
        swipeToOpen
      >
        {children}
      </Drawer>
    </div>
  );
}
