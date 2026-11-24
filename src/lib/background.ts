// What fills the frame around the code window.
export type BackgroundType = "solid" | "gradient" | "pattern" | "image";

export const BACKGROUND_TYPES: { id: BackgroundType; label: string }[] = [
  { id: "solid", label: "Solid" },
  { id: "gradient", label: "Gradient" },
  { id: "pattern", label: "Pattern" },
  { id: "image", label: "Image" },
];

export type PatternId =
  | "blueprint"
  | "drafting"
  | "ledger"
  | "stitched"
  | "perforated"
  | "junction";

// Each pattern is a class in framelime.css, `pattern-<id>`.
export const PATTERNS: { id: PatternId; label: string }[] = [
  { id: "blueprint", label: "Blueprint" },
  { id: "drafting", label: "Drafting" },
  { id: "ledger", label: "Ledger" },
  { id: "stitched", label: "Stitched" },
  { id: "perforated", label: "Perforated" },
  { id: "junction", label: "Junction" },
];

export const PATTERN_IDS = PATTERNS.map(({ id }) => id);

// A multiplier on the pattern's spacing, in percent.
export const PATTERN_SCALE_MIN = 50;
export const PATTERN_SCALE_MAX = 200;
export const PATTERN_SCALE_STEP = 25;
export const PATTERN_SCALE_DEFAULT = 100;

export const GRADIENT_ANGLE_DEFAULT = 135;

export type ImageFit = "cover" | "contain";

export const IMAGE_FITS: { id: ImageFit; label: string }[] = [
  { id: "cover", label: "Cover" },
  { id: "contain", label: "Contain" },
];

// Blur in px, dim in percent toward black.
export const IMAGE_BLUR_MAX = 24;
export const IMAGE_DIM_MAX = 80;

export type FrameBackground =
  | { type: "solid"; color: string }
  | { type: "gradient"; color: string; stops: string[]; angle: number }
  | {
      type: "pattern";
      color: string;
      pattern: PatternId;
      ink: string;
      /** 1 is the pattern's own spacing. */
      scale: number;
    }
  | {
      type: "image";
      color: string;
      src: string;
      fit: ImageFit;
      blur: number;
      dim: number;
    };

export function gradientCss(stops: string[], angle: number) {
  return `linear-gradient(${angle}deg, ${stops.join(", ")})`;
}

// Long edge of a stored image, in px. Twice the widest frame with room to
// spare, so a 2x export stays sharp while the stored copy stays small.
const IMAGE_MAX_EDGE = 2400;

/**
 * Reads an image file into a data URL, scaled down when it is larger than
 * any frame needs. SVGs and anything the browser can't decode as a bitmap
 * are kept as they are.
 */
export async function readImageFile(file: File): Promise<string> {
  const original = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  if (file.type === "image/svg+xml") return original;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Not an image the browser can read");
  }
  const scale = Math.min(1, IMAGE_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1) {
    bitmap.close();
    return original;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  // WebP keeps transparency, which JPEG would fill with black.
  return canvas.toDataURL("image/webp", 0.92);
}

// The uploaded image stays in this browser: share links carry only text.
const DB_NAME = "framelime";
const STORE = "background";
const KEY = "image";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = action(db.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export async function loadStoredImage(): Promise<string | null> {
  try {
    const value = await run<unknown>("readonly", (store) => store.get(KEY));
    return typeof value === "string" ? value : null;
  } catch {
    return null;
  }
}

export async function storeImage(src: string | null) {
  try {
    if (src) await run("readwrite", (store) => store.put(src, KEY));
    else await run("readwrite", (store) => store.delete(KEY));
  } catch {
    // Private windows can refuse storage; the image still shows until reload.
  }
}

/** The background settings a share link carries, under their link keys. */
export interface BackgroundSettings {
  bg: BackgroundType;
  gradFrom: string;
  gradVia: string;
  gradTo: string;
  gradAngle: number;
  pattern: PatternId;
  patternInk: string;
  patternScale: number;
  imgFit: ImageFit;
  imgBlur: number;
  imgDim: number;
}
