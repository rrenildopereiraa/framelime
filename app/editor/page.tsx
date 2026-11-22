import type { Metadata } from "next";
import { EditorLoader } from "@/loader.tsx";
import { site } from "@/lib/site.ts";

export const metadata: Metadata = {
  // The app itself, so its tab and a home-screen bookmark read just "Framelime".
  title: { absolute: site.name },
  alternates: { canonical: "/editor" },
};

export default function EditorPage() {
  return <EditorLoader />;
}
