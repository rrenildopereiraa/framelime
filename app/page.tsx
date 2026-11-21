import { LogoMark } from "@/components/logo.tsx";
import { FramesBackdrop } from "@/landing/frames-backdrop.tsx";
import { StartHotkey } from "@/landing/start-hotkey.tsx";
import { Tapes } from "@/landing/tapes.tsx";
import { DISPLAY_STYLE, MONO_STYLE } from "@/lib/fonts.ts";
import { site } from "@/lib/site.ts";
import "@/landing/landing.css";

const CONTROLS = [
  {
    title: "Four themes, or yours",
    body: "Lime, Default, Eclipsa and Amber. Or import a VS Code theme file.",
  },
  {
    title: "Eleven colors",
    body: "Every part of the frame has its own picker, from tab bar to highlights.",
  },
  {
    title: "Corners, one by one",
    body: "Radius from 0 to 16 px, on all corners or each on its own.",
  },
  {
    title: "Six aspect ratios",
    body: "Auto, 1:1, 4:3, 3:4, 16:9 and 9:16, for every feed.",
  },
  {
    title: "Four mono fonts",
    body: "System Mono, JetBrains Mono, Fira Code and IBM Plex Mono.",
  },
  {
    title: "Highlights and diffs",
    body: "Mark the lines and words that matter, or show what changed.",
  },
];

const CONTAINER = "max-w:320 mx:auto px:8";
const LINK = "td:none c:hint h:c:label tp:c tdu:150";

export default function LandingPage() {
  return (
    <div className="o:h bg:page c:label">
      <StartHotkey />

      <section className="p:r h:180">
        <FramesBackdrop />

        <header className={`p:r d:f ai:c jc:sb py:6 ${CONTAINER}`}>
          <a href="/" className="d:f ai:c g:3 td:none c:label">
            <LogoMark className="d:b w:4 h:6 c:brand" />
            <span className="fs:xl fw:500" style={DISPLAY_STYLE}>
              Framelime
            </span>
          </a>
          <nav className="d:f ai:c g:6 fs:sm" style={MONO_STYLE}>
            <a href={site.repo} className={LINK}>
              GitHub
            </a>
            <a href="/editor" className="td:none c:accent">
              Open editor →
            </a>
          </nav>
        </header>

        <div className="p:r d:f fd:c ai:c ta:c g:6 pt:36 px:6">
          <p className="m:0 fs:xs ls:2 tt:u c:accent" style={MONO_STYLE}>
            Code → image
          </p>
          <h1 className="m:0 fs:5xl @md:fs:8xl lh:1 fw:500" style={DISPLAY_STYLE}>
            Every frame,
            <br />
            <span className="@md:ws:nw">exactly how you want it.</span>
          </h1>
          <p className="m:0 max-w:130 fs:sm lh:5 c:hint" style={MONO_STYLE}>
            Framelime turns a snippet into a clean image. The frame, the colors and the type are all
            yours to set, right from the editor.
          </p>
          <a
            href="/editor"
            className="d:if ai:c g:3 py:4 px:5 br:9999 td:none fs:sm bg:fill c:on-fill h:bg:edge tp:c tdu:150"
            style={MONO_STYLE}
          >
            Start framing
            <kbd className="px:2 br:9999 bw:1 bs:s bc:on-fill fs:xs" style={MONO_STYLE}>
              ↵
            </kbd>
          </a>
        </div>
      </section>

      <Tapes />

      <section aria-label="What you can change" className={`${CONTAINER} pt:10 pb:18`}>
        <ul className="d:g gtc:1 @md:gtc:2 @lg:gtc:3 m:0 p:0 lst:none btw:1 bs:s bc:line">
          {CONTROLS.map((control, index) => (
            <li key={control.title} className="d:f g:5 py:7 pr:2 bbw:1 bs:s bc:line">
              <span className="pt:1 fs:xs c:accent" style={MONO_STYLE}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="d:f fd:c g:2">
                <h2 className="m:0 fs:lg fw:600">{control.title}</h2>
                <p className="m:0 fs:sm lh:5 c:hint" style={MONO_STYLE}>
                  {control.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <footer className={`d:f jc:sb py:7 fs:xs c:hint ${CONTAINER}`} style={MONO_STYLE}>
        <span>© 2026 Framelime · MIT License</span>
        <a href={site.repo} className={LINK}>
          GitHub
        </a>
      </footer>
    </div>
  );
}
