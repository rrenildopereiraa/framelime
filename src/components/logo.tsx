import { DISPLAY_STYLE } from "@/lib/fonts.ts";

/** Framelime's mark: three stacked bars, fading as they narrow. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 31 48" fill="currentColor" aria-hidden="true" className={className}>
      <path d="m0 17.8433 30.9054-17.8433-.8189 12.6994-26.32053 15.1961z" />
      <path d="m3.76562 27.8951 21.73568-12.5492-.8189 12.6994-17.15081 9.902z" opacity=".5" />
      <path d="m7.5293 37.9477 12.566-7.255-.8189 12.6994-7.9811 4.6079z" opacity=".25" />
    </svg>
  );
}

/** The mark and the name, set in Stack Sans Notch. The name hides below `md`. */
export function Logo() {
  return (
    <span className="d:f ai:c g:2 fs:0 us:none">
      <LogoMark className="d:b w:4 h:6 c:brand" />
      <span className="d:none @md:d:b fs:lg fw:500 lh:1 c:label" style={DISPLAY_STYLE}>
        Framelime
      </span>
    </span>
  );
}
