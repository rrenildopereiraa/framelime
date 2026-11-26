import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    // The editor lived at `/editor` while `/` was a landing page. Its share
    // links still open, query and all, now that the editor is back at `/`.
    return [{ source: "/editor", destination: "/", permanent: true }];
  },
};

export default nextConfig;
