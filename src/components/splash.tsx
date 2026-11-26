import { DISPLAY_STYLE } from "@/lib/fonts.ts";
import { LogoMark } from "./logo.tsx";

/**
 * What the page shows while the editor's bundle loads. It is rendered on the
 * server, so it is the first paint, and the editor replaces it once it runs.
 */
export function Splash() {
  return (
    <div role="status" className="d:f fd:c ai:c jc:c g:5 h:dvh bg:page us:none">
      <LogoMark className="d:b w:10 h:15 c:brand an:pulse adu:1000 aic:i @prm:an:none" />
      <span
        className="fs:xxl fw:500 lh:1 c:label an:reveal adu:400 @prm:an:none"
        style={DISPLAY_STYLE}
      >
        Framelime
      </span>
      <span className="p:a w:1 h:1 o:h">Loading the editor</span>
    </div>
  );
}
