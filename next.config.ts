import type { NextConfig } from "next";

// The editor's settings, as its share links carry them in the query string.
const EDITOR_QUERY_KEYS = [
  "tabBar",
  "statusBar",
  "ratio",
  "rtl",
  "rtr",
  "rbl",
  "rbr",
  "font",
  "theme",
  "frameMode",
  "colors",
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    // The editor used to live at `/`: send its share links on to `/editor`,
    // query and all, now that `/` is the landing page.
    return EDITOR_QUERY_KEYS.map((key) => ({
      source: "/",
      has: [{ type: "query" as const, key }],
      destination: "/editor",
      permanent: true,
    }));
  },
};

export default nextConfig;
