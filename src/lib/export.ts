import { toBlob, toCanvas, toJpeg, toPng, toSvg } from "html-to-image";
import type { ExportFormat } from "../components/format-picker";
import type { ExportScale, ImageSize } from "./types";

// On-screen editing controls in the frame, such as a tab's close button,
// carry `data-export-ignore` and stay out of every image.
function filter(node: HTMLElement) {
  return !(node instanceof HTMLElement && node.dataset.exportIgnore !== undefined);
}

export interface RasterOptions {
  /** Image pixels per CSS pixel of the frame. */
  scale: ExportScale;
  /** A size preset's exact size in pixels, which takes the place of `scale`. */
  size?: ImageSize;
}

/** html-to-image's options for a raster image at the chosen scale or size. */
export function rasterOptions({ scale, size }: RasterOptions) {
  return size
    ? { filter, pixelRatio: 1, canvasWidth: size.width, canvasHeight: size.height }
    : { filter, pixelRatio: scale };
}

/**
 * `fill` paints behind a transparent frame where the format has no alpha:
 * JPG would otherwise turn it black. PNG and WEBP keep it see-through.
 */
export async function captureDataUrl(
  node: HTMLElement,
  format: ExportFormat,
  raster: RasterOptions,
  fill?: string,
): Promise<string> {
  const options = rasterOptions(raster);
  switch (format) {
    case "svg":
      return toSvg(node, { filter });
    case "webp": {
      const canvas = await toCanvas(node, options);
      return canvas.toDataURL("image/webp");
    }
    case "jpg":
      return toJpeg(node, { ...options, quality: 0.95, backgroundColor: fill });
    default:
      return toPng(node, options);
  }
}

export async function copyImageToClipboard(node: HTMLElement, raster: RasterOptions) {
  const blob = await toBlob(node, rasterOptions(raster));
  if (!blob) return;
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}
