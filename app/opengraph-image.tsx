import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site.ts";

export const alt = `${site.name} · ${site.description}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LIME = "#d4ff3a";

// Satori reads WOFF but not WOFF2, so the two cuts it needs are committed.
function font(file: string) {
  return readFileSync(path.join(process.cwd(), "src/assets/fonts", file));
}

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: 80,
        backgroundColor: "#0b0b0a",
        backgroundImage:
          "radial-gradient(circle at 100% 0%, rgba(212, 255, 58, 0.22) 0%, rgba(11, 11, 10, 0) 55%)",
        color: "#eeefe9",
        fontFamily: "Stack Sans Text",
      }}
    >
      <svg width={62} height={96} viewBox="0 0 31 48" fill={LIME}>
        <path d="m0 17.8433 30.9054-17.8433-.8189 12.6994-26.32053 15.1961z" />
        <path d="m3.76562 27.8951 21.73568-12.5492-.8189 12.6994-17.15081 9.902z" opacity=".5" />
        <path d="m7.5293 37.9477 12.566-7.255-.8189 12.6994-7.9811 4.6079z" opacity=".25" />
      </svg>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontFamily: "Stack Sans Notch",
            fontSize: 140,
            lineHeight: 1,
            letterSpacing: -4,
          }}
        >
          Framelime
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 40, color: LIME }}>
          Gorgeous code images, fully customizable from the UI.
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Stack Sans Text",
          data: font("stack-sans-text-latin-400-normal.woff"),
          weight: 400,
          style: "normal",
        },
        {
          name: "Stack Sans Notch",
          data: font("stack-sans-notch-latin-500-normal.woff"),
          weight: 500,
          style: "normal",
        },
      ],
    },
  );
}
