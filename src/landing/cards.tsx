import { IconDownload } from "@tabler/icons-react";
import { MONO_STYLE } from "@/lib/fonts.ts";

/*
 * The two cards floating over the laptop. They picture the editor's
 * controls rather than being controls, so they are hidden from assistive
 * tech and hold nothing to tab to: the hero's copy already says the same.
 *
 * Sized in `em` rather than Yumma CSS's `rem` steps, so that on the
 * one-screen layout they scale with the laptop from a single font size.
 */

/** The editor's switch: Yumma UI's rounded track and thumb, in its colors. */
function Toggle({ label, on }: { label: string; on: boolean }) {
  return (
    <span className="landing-card-row">
      <span className="landing-card-label">{label}</span>
      <span className={`landing-switch ${on ? "landing-switch-on" : ""}`}>
        <span className="landing-switch-thumb" />
      </span>
    </span>
  );
}

/** Tab bar and status bar switches, then a nudge to load your own theme. */
export function SettingsCard() {
  return (
    <div aria-hidden="true" className="landing-card landing-card-settings">
      <div className="landing-card-rows">
        <Toggle label="Tab bar" on />
        <Toggle label="Status bar" on={false} />
      </div>
      <div className="landing-card-rule" />
      <div className="landing-card-title">Bring your VS Code theme</div>
      <div className="landing-card-text">Drop a theme file in, and the frame takes its colors.</div>
      <div className="landing-pill landing-pill-fill landing-card-button">Load a theme</div>
    </div>
  );
}

/** Export as an image, or copy a link that opens the same frame. */
export function ShareCard() {
  return (
    <div aria-hidden="true" className="landing-card landing-card-share">
      <div className="landing-card-title landing-card-title-lg">Ready to share</div>
      <div className="landing-card-text">
        Export a crisp image, or send a link that opens this exact frame.
      </div>
      <div className="landing-pill landing-pill-fill landing-card-button landing-card-button-lg">
        <IconDownload className="landing-card-icon" stroke={2.2} />
        Export PNG
      </div>
      <div className="landing-card-or">
        <span />
        or share a link
        <span />
      </div>
      <div className="landing-link">
        <span className="landing-link-url" style={MONO_STYLE}>
          framelime.dev/?t=lime&amp;r=12
        </span>
        <span className="landing-pill landing-pill-ink landing-link-copy">Copy</span>
        <span className="landing-cursor">
          <svg viewBox="0 0 46 52" className="landing-cursor-arrow">
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
