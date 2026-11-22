import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// The home-screen icon: the mark in lime on the dark page. iOS rounds the corners.
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: "#0b0b0a",
      }}
    >
      <svg width={68} height={104} viewBox="0 0 31 48" fill="#d4ff3a">
        <path d="m0 17.8433 30.9054-17.8433-.8189 12.6994-26.32053 15.1961z" />
        <path d="m3.76562 27.8951 21.73568-12.5492-.8189 12.6994-17.15081 9.902z" opacity=".5" />
        <path d="m7.5293 37.9477 12.566-7.255-.8189 12.6994-7.9811 4.6079z" opacity=".25" />
      </svg>
    </div>,
    size,
  );
}
