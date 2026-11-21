"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { StrictMode } from "react";
import App from "./App.tsx";
import { ToastProvider } from "./components/toast-provider.tsx";
import { ChromeThemeProvider } from "./lib/chrome-theme.tsx";
import "./framelime.css";

export default function SiRoot() {
  return (
    <StrictMode>
      <NuqsAdapter>
        <ChromeThemeProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ChromeThemeProvider>
      </NuqsAdapter>
    </StrictMode>
  );
}
