import { IconDownload } from "@tabler/icons-react";
import { MONO_STYLE } from "@/lib/fonts.ts";

/*
 * The two cards floating over the laptop. They picture the editor's
 * controls rather than being controls, so they are hidden from assistive
 * tech and hold nothing to tab to: the hero's copy already says the same.
 */

function Toggle({ label, on }: { label: string; on: boolean }) {
  return (
    <span className="d:f ai:c jc:sb">
      <span className="fs:lg fw:600">{label}</span>
      <span className={`landing-toggle ${on ? "landing-toggle-on" : ""}`}>
        <span className="landing-toggle-thumb" />
      </span>
    </span>
  );
}

/** Tab bar and status bar switches, then a nudge to load your own theme. */
export function SettingsCard() {
  return (
    <div aria-hidden="true" className="landing-card landing-card-settings">
      <div className="d:f fd:c g:3">
        <Toggle label="Tab bar" on />
        <Toggle label="Status bar" on={false} />
      </div>
      <div className="h:px my:4 bg:line" />
      <div className="fs:lg fw:600">Bring your VS Code theme</div>
      <div className="mt:1 fs:sm lh:5 c:hint">
        Drop a theme file in, and the frame takes its colors.
      </div>
      <div className="landing-pill landing-pill-fill mt:4 h:12">Load a theme</div>
    </div>
  );
}

/** Export as an image, or copy a link that opens the same frame. */
export function ShareCard() {
  return (
    <div aria-hidden="true" className="landing-card landing-card-share">
      <div className="fs:xl fw:600">Ready to share</div>
      <div className="mt:1 fs:md lh:5 c:hint">
        Export a crisp image, or send a link that opens this exact frame.
      </div>
      <div className="landing-pill landing-pill-fill mt:5 h:14 g:2 fs:lg">
        <IconDownload className="w:5 h:5" stroke={2.2} />
        Export PNG
      </div>
      <div className="d:f ai:c g:3 my:4 fs:sm c:hint">
        <span className="fg:1 h:px bg:line" />
        or share a link
        <span className="fg:1 h:px bg:line" />
      </div>
      <div className="landing-link p:r d:f ai:c jc:sb g:2 h:12 pl:4 pr:1 fs:sm c:hint">
        <span className="landing-link-url" style={MONO_STYLE}>
          framelime.dev/?t=lime&amp;r=12
        </span>
        <span className="landing-pill landing-pill-ink fs:0 h:10 px:4">Copy</span>
        <span className="landing-cursor">
          <svg viewBox="0 0 46 52" className="d:b w:10">
            <path
              d="M6 4l34 18l-15 4l-7 15z"
              fill="#11120e"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinejoin="round"
            />
          </svg>
          <span className="landing-pill landing-pill-ink landing-cursor-label">Copied!</span>
        </span>
      </div>
    </div>
  );
}
