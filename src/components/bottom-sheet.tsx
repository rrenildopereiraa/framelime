import { type ReactNode, useSyncExternalStore } from "react";
import Drawer from "@/components/ui/drawer.tsx";

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
