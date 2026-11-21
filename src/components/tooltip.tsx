"use client";

import type { ReactElement, ReactNode } from "react";
import TooltipBase from "./ui/tooltip.tsx";

/** Yumma UI's tooltip on the element it wraps. */
export function Tooltip({
  content,
  children,
}: {
  content: ReactNode;
  children: ReactElement<{ className?: string }>;
}) {
  return <TooltipBase content={content} render={children} sideOffset={8} />;
}
