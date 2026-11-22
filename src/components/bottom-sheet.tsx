import { IconAdjustmentsHorizontal } from "@tabler/icons-react";
import { type ReactNode, useSyncExternalStore } from "react";
import Drawer from "@/components/ui/drawer.tsx";
import { FOCUS } from "./styles";

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

/** Settings on phones: a bar along the bottom that opens Yumma UI's drawer. */
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

  return (
    <div className="bottom-sheet-handle @lg:d:none p:f l:0 r:0 zi:10 h:8">
      <Drawer
        side="bottom"
        variant={tablet ? "flyout" : "edge"}
        title={title}
        open={open}
        onOpenChange={onOpenChange}
        snapPoints={SNAP_POINTS}
        swipeToOpen
        render={
          <button
            type="button"
            className={`d:f ai:c jc:c g:2 w:100% h:100% p:0 btw:1 bw:0 bs:s bc:line bg:raised fs:xs fw:500 us:none c:p c:hint h:c:label ${FOCUS}`}
          >
            <IconAdjustmentsHorizontal className="w:4 h:4 fs:0" stroke={1.8} />
            {title}
          </button>
        }
      >
        {children}
      </Drawer>
    </div>
  );
}
