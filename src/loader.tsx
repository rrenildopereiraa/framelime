"use client";

import dynamic from "next/dynamic";
import { Splash } from "./components/splash.tsx";

/**
 * The editor reads `window`, `localStorage` and the URL on first render, so it
 * only ever runs in the browser. Until its bundle has loaded, the splash
 * screen stands in, and it is what the server sends as the first paint.
 */
export const EditorLoader = dynamic(() => import("./root.tsx"), {
  ssr: false,
  loading: () => <Splash />,
});
