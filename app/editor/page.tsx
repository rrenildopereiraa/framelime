import type { Metadata } from "next";
import { EditorLoader } from "@/loader.tsx";

export const metadata: Metadata = {
  title: "Editor",
  alternates: { canonical: "/editor" },
};

export default function EditorPage() {
  return <EditorLoader />;
}
