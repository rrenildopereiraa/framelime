// What fills the frame around the code window.
export type BackgroundType = "solid" | "gradient" | "transparent";

export const BACKGROUND_TYPES: { id: BackgroundType; label: string }[] = [
  { id: "solid", label: "Solid" },
  { id: "gradient", label: "Gradient" },
  { id: "transparent", label: "Transparent" },
];

export const GRADIENT_ANGLE_DEFAULT = 135;

export type FrameBackground =
  | { type: "solid"; color: string }
  | { type: "gradient"; color: string; stops: string[]; angle: number }
  | { type: "transparent"; color: string };

export function gradientCss(stops: string[], angle: number) {
  return `linear-gradient(${angle}deg, ${stops.join(", ")})`;
}

/** The background settings a share link carries, under their link keys. */
export interface BackgroundSettings {
  bg: BackgroundType;
  gradFrom: string;
  gradVia: string;
  gradTo: string;
  gradAngle: number;
}
