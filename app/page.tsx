import { IconBrandGithub } from "@tabler/icons-react";
import { LogoMark } from "@/components/logo.tsx";
import Button from "@/components/ui/button.tsx";
import Kbd from "@/components/ui/kbd.tsx";
import { FramesBackdrop } from "@/landing/frames-backdrop.tsx";
import { StartHotkey } from "@/landing/start-hotkey.tsx";
import { Tapes } from "@/landing/tapes.tsx";
import { DISPLAY_STYLE } from "@/lib/fonts.ts";
import { site } from "@/lib/site.ts";
import "@/landing/landing.css";

const CONTAINER = "max-w:320 mx:auto px:8";

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
          <p className="m:0 max-w:130 fs:md lh:5 c:hint">
            Framelime turns a snippet into a clean image. The frame, the colors and the type are all
            yours to set, right from the editor.
          </p>
          {/* Yumma UI's buttons, drawn as links. Base UI marks a non-button
              `role="button"`; these navigate, so they say so. */}
          <div className="d:f fw:w jc:c g:3">
            <Button
              variant="primary"
              size="lg"
              shape="pill"
              render={<a href="/editor" />}
              nativeButton={false}
              role="link"
              className="g:3"
            >
              Start framing
              <Kbd keys={["↵"]} />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              shape="pill"
              icon={<IconBrandGithub className="w:4 h:4" />}
              render={<a href={site.repo} />}
              nativeButton={false}
              role="link"
            >
              GitHub
            </Button>
          </div>
        </div>
      </section>

      <Tapes />

      <footer className={`d:f jc:sb py:7 fs:sm c:hint ${CONTAINER}`}>
        <span>© 2026 Framelime · MIT License</span>
        <a href={site.repo} className="td:none c:hint h:c:label tp:c tdu:150">
          GitHub
        </a>
      </footer>
    </div>
  );
}
