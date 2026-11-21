"use client";

import dynamic from "next/dynamic";

/**
 * The editor reads `window`, `localStorage` and the URL on first render, so it
 * only ever runs in the browser. Loading it here also keeps Shiki and the
 * export code out of every other page's bundle.
 */
export const EditorLoader = dynamic(() => import("./root.tsx"), { ssr: false });
