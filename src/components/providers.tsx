"use client";

import { Tooltip } from "@base-ui/react/tooltip";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <Tooltip.Provider delay={200}>{children}</Tooltip.Provider>;
}
