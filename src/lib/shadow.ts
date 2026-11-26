import tinycolor from "tinycolor2";
import type { ShadowStyle } from "./types";

/**
 * The shadow's color while none is picked, from the theme: a soft shadow is
 * the frame's background deepened toward black, so it reads on light and dark
 * themes alike; a hard one is the theme's accent, as a solid offset block.
 */
export function defaultShadowColor(
  style: ShadowStyle,
  colors: { page: string; statusBarText: string },
) {
  return style === "hard"
    ? tinycolor(colors.statusBarText).toHexString()
    : tinycolor.mix(colors.page, "#000000", 60).toHexString();
}

/** The code window's `box-shadow`; `undefined` when off. */
export function shadowCss(style: ShadowStyle, color: string) {
  if (style === "none") return undefined;
  if (style === "hard") return `8px 8px 0 0 ${tinycolor(color).toRgbString()}`;
  const at = (alpha: number) => tinycolor(color).setAlpha(alpha).toRgbString();
  // A wide, faint spread and a tight contact shadow: depth without a dark halo.
  return `0 16px 40px -16px ${at(0.32)}, 0 4px 12px -6px ${at(0.18)}`;
}
