import { IconBrandGithub } from "@tabler/icons-react";
import { LogoMark } from "@/components/logo.tsx";
import { FramesBackdrop } from "@/landing/frames-backdrop.tsx";
import { StartHotkey } from "@/landing/start-hotkey.tsx";
import { Tapes } from "@/landing/tapes.tsx";
import { DISPLAY_STYLE, MONO_STYLE } from "@/lib/fonts.ts";
import { site } from "@/lib/site.ts";
import "@/landing/landing.css";

const CONTAINER = "max-w:320 mx:auto px:8";
const BUTTON = "d:if ai:c g:3 py:4 px:5 br:9999 td:none fs:sm tp:c tdu:150";

export default function LandingPage() {
  return (
    <div className="o:h bg:page c:label">
      <StartHotkey />

      <section className="p:r h:180">
        <FramesBackdrop />

        <header className={`p:r d:f ai:c py:6 ${CONTAINER}`}>
          <a href="/" className="d:f ai:c g:3 td:none c:label">
            <LogoMark className="d:b w:4 h:6 c:brand" />
            <span className="fs:xl fw:500" style={DISPLAY_STYLE}>
              Framelime
            </span>
          </a>
        </header>

        <div className="p:r d:f fd:c ai:c ta:c g:6 pt:36 px:6">
          <h1 className="m:0 fs:5xl @md:fs:8xl lh:1 fw:500" style={DISPLAY_STYLE}>
            Every frame,
            <br />
            <span className="@md:ws:nw">exactly how you want it.</span>
          </h1>
          <p className="m:0 max-w:130 fs:sm lh:5 c:hint" style={MONO_STYLE}>
            Framelime turns a snippet into a clean image. The frame, the colors and the type are all
            yours to set, right from the editor.
          </p>
          <div className="d:f fw:w jc:c g:3">
            <a
              href="/editor"
              className={`${BUTTON} bg:fill c:on-fill h:bg:edge`}
              style={MONO_STYLE}
            >
              Start framing
              <kbd className="px:2 br:9999 bw:1 bs:s bc:on-fill fs:xs" style={MONO_STYLE}>
                ↵
              </kbd>
            </a>
            <a
              href={site.repo}
              className={`${BUTTON} bw:1 bs:s bc:line bg:page c:label h:bg:well`}
              style={MONO_STYLE}
            >
              <IconBrandGithub className="w:4 h:4" aria-hidden="true" />
              GitHub
            </a>
          </div>
        </div>
      </section>

      <Tapes />

      <footer className={`d:f jc:sb py:7 fs:xs c:hint ${CONTAINER}`} style={MONO_STYLE}>
        <span>© 2026 Framelime · MIT License</span>
      </footer>
    </div>
  );
}
