import { IconAdjustmentsHorizontal } from "@tabler/icons-react";
import type { ReactNode } from "react";
import Drawer from "@/components/ui/drawer.tsx";
import { FOCUS } from "./styles";

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
  return (
    <div className="bottom-sheet-handle @lg:d:none p:f l:0 r:0 zi:10 h:8">
      <Drawer
        side="bottom"
        title={title}
        open={open}
        onOpenChange={onOpenChange}
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
