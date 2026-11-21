import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/components/providers.tsx";
import { SANS } from "@/lib/fonts.ts";
import { site } from "@/lib/site.ts";
import { themeScript } from "@/lib/theme.ts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: site.name,
    description: site.description,
    siteName: site.name,
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: site.themeColor.light },
    { media: "(prefers-color-scheme: dark)", color: site.themeColor.dark },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="cs:ld" suppressHydrationWarning>
      <head>
        {/* Runs inline before first paint, ahead of any bundle. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      {/* Font set inline because Yumma CSS's `theme` carries colors, not families. */}
      <body
        className="m:0 bg:page c:label"
        style={{ fontFamily: SANS, WebkitFontSmoothing: "antialiased" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
