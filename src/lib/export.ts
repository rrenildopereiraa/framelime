import { toBlob, toCanvas, toJpeg, toPng, toSvg } from "html-to-image";
import type { ExportFormat } from "../components/format-picker";

// On-screen editing controls in the frame, such as a tab's close button,
// carry `data-export-ignore` and stay out of every image.
function filter(node: HTMLElement) {
  return !(node instanceof HTMLElement && node.dataset.exportIgnore !== undefined);
}

const OPTIONS = { filter };

export async function captureDataUrl(node: HTMLElement, format: ExportFormat): Promise<string> {
  switch (format) {
    case "svg":
      return toSvg(node, OPTIONS);
    case "webp": {
      const canvas = await toCanvas(node, { ...OPTIONS, pixelRatio: 2 });
      return canvas.toDataURL("image/webp");
    }
    case "jpg":
      return toJpeg(node, { ...OPTIONS, pixelRatio: 2, quality: 0.95 });
    default:
      return toPng(node, { ...OPTIONS, pixelRatio: 2 });
  }
}

export async function copyImageToClipboard(node: HTMLElement) {
  const blob = await toBlob(node, { ...OPTIONS, pixelRatio: 2 });
  if (!blob) return;
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}
