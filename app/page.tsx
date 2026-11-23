import Image from "next/image";
import macbook from "@/assets/landing/macbook-air.webp";
import { LogoMark } from "@/components/logo.tsx";
import { Burst } from "@/landing/burst.tsx";
import { SettingsCard, ShareCard } from "@/landing/cards.tsx";
import { StartHotkey } from "@/landing/start-hotkey.tsx";
import { StickerBelt } from "@/landing/sticker-belt.tsx";
import { DISPLAY_STYLE } from "@/lib/fonts.ts";
import { site } from "@/lib/site.ts";
import "@/landing/landing.css";

export default function LandingPage() {
  return (
    <div className="landing-sky landing-screen o:h c:label">
      <StartHotkey />

      <div className="px:4 pt:5">
        <header className="landing-glass max-w:265 mx:auto d:f ai:c jc:sb g:3 p:2 br:9999">
          <a href="/" className="d:f ai:c g:3 td:none c:label">
            <span className="landing-logo-well d:f ai:c jc:c w:12 h:12 br:9999">
              <LogoMark className="d:b w:4 h:6 c:brand" />
            </span>
            <span className="fs:lg @sm:fs:xl fw:600" style={DISPLAY_STYLE}>
              Framelime
            </span>
          </a>
          <a
            href="/editor"
            aria-keyshortcuts="Enter"
            className="landing-ink d:if ai:c h:12 px:5 @sm:px:6 br:9999 fw:600 td:none ws:nw"
          >
            Open the editor
          </a>
        </header>
      </div>

      <section className="landing-hero max-w:265 mx:auto px:4 pt:16 ta:c">
        <h1
          className="landing-title m:0 fs:5xl @sm:fs:6xl @md:fs:7xl @lg:fs:8xl fw:700"
          style={DISPLAY_STYLE}
        >
          Code worth
          <br />
          <span className="landing-zest">showing off.</span>
        </h1>
        <p className="landing-lede m:0 mt:7 mx:auto max-w:155 fs:lg @md:fs:xl lh:5 c:hint">
          Squeeze the most out of your snippets. Pick a theme, tune the frame, and export a crisp
          image or a link that opens the same setup.
        </p>
      </section>

      {/* The laptop, the burst behind it and the cards over it. On a screen
          big enough to hold the whole page, the stage takes the height left
          over and everything on it scales together; otherwise the cards drop
          under the laptop and the burst is left out. */}
      <section className="landing-stage max-w:310 mx:auto mt:10 px:4">
        <div className="landing-stage-frame">
          <Burst />
          <Image
            src={macbook}
            alt="Framelime's editor on a MacBook Air, framing index.css beside its settings"
            preload
            sizes="(min-width: 64rem) 60vw, 100vw"
            className="landing-device"
          />
          <SettingsCard />
          <ShareCard />
        </div>
      </section>

      <StickerBelt />

      <footer className="landing-footer max-w:340 mx:auto px:8 pt:4 pb:8 d:f fw:w ai:c jc:c g:3 fs:md c:hint">
        <span>© 2026 Framelime</span>
        <span aria-hidden="true">·</span>
        <span>MIT License</span>
        <span aria-hidden="true">·</span>
        <a href={site.repo} className="td:none c:hint h:c:label tp:c tdu:150">
          GitHub
        </a>
        <span aria-hidden="true">·</span>
        <a href="/chrome" className="td:none c:hint h:c:label tp:c tdu:150">
          Chrome
        </a>
        <span aria-hidden="true">·</span>
        <span>
          Firefox <span className="landing-soon">soon</span>
        </span>
      </footer>
    </div>
  );
}
