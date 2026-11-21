"use client";

import { useHotkey } from "@tanstack/react-hotkeys";
import { useRouter } from "next/navigation";

/** Enter opens the editor, as the hint on the hero's button says. */
export function StartHotkey() {
  const router = useRouter();
  useHotkey("Enter", (event) => {
    // A focused link or button already acts on Enter.
    if (event.target instanceof HTMLElement && event.target.closest("a, button, input, textarea"))
      return;
    router.push("/editor");
  });
  return null;
}
