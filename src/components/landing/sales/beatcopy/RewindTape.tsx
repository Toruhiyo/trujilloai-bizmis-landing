import { useEffect, useId, useLayoutEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "../hooks";
import "@/styles/rewind-analog.css";

/** Timeline ms per real ms at which the tape look is at full strength (the auto rewind peaks well above it). */
const FULL_SPEED = 6;
/** How often the tape's random parts (tear bands, jitter, flicker) re-roll: a VHS-ish ~20 fps, not every frame. */
const STEP_MS = 55;

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/**
 * A beat's words as a tape being rewound: while the beat's clock (`t`) runs
 * backwards, the block takes an analog VHS-rewind look (tracking bands
 * rolling up, horizontal tear slices, a warm RGB split, scanlines, a little
 * jitter and flicker). Its strength follows the rewind's speed, so it
 * gathers as the rewind speeds up and fades as it settles; nothing while the
 * beat plays forward or holds. Driven straight on the DOM (CSS variables and
 * one SVG displacement filter), never through React state, so it costs no
 * re-renders. Reduced motion: off.
 *
 * `className` / `style` (the parent's placement) go on the outer box; the
 * look goes on an inner one, so it never fights the placement's transforms.
 */
const RewindTape = ({
  t,
  className,
  style,
  children,
}: {
  t: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) => {
  const reduced = useReducedMotion();
  const id = `rwa-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const box = useRef<HTMLDivElement>(null);
  const turb = useRef<SVGFETurbulenceElement>(null);
  const disp = useRef<SVGFEDisplacementMapElement>(null);
  const st = useRef({ t, seen: t, v: 0, level: 0, raf: 0, last: 0, step: 0 });

  useLayoutEffect(() => {
    const s = st.current;
    const prev = s.t;
    s.t = t;
    if (reduced || s.raf || !(t < prev - 1)) return;
    // the clock went back: run the tape look until it has faded out again
    const el = box.current;
    if (!el) return;
    s.seen = prev;
    s.v = 0;
    s.last = performance.now();
    s.step = 0;
    const off = () => {
      s.raf = 0;
      s.level = 0;
      el.classList.remove("is-rw");
      el.style.removeProperty("filter");
      ["--rw", "--rw-x", "--rw-k"].forEach((p) => el.style.removeProperty(p));
      disp.current?.setAttribute("scale", "0");
    };
    const frame = (now: number) => {
      const dt = Math.max(1, Math.min(100, now - s.last));
      s.last = now;
      // backward speed, smoothed (frames where the clock didn't re-render yet read as 0)
      const back = Math.max(0, s.seen - s.t) / dt;
      s.seen = s.t;
      s.v = s.v * 0.65 + back * 0.35;
      const drive = Math.min(1, s.v / FULL_SPEED);
      // quick to come in, slower to go
      s.level += (drive - s.level) * (drive > s.level ? 0.28 : 0.1);
      if (drive < 0.002 && s.level < 0.012) {
        off();
        return;
      }
      const k = s.level;
      el.classList.add("is-rw");
      el.style.setProperty("--rw", k.toFixed(3));
      if (now - s.step >= STEP_MS) {
        s.step = now;
        // re-roll the tear bands (where they fall, how tall, how far they slip)
        turb.current?.setAttribute("seed", String(Math.floor(rand(1, 999))));
        turb.current?.setAttribute("baseFrequency", `0 ${rand(0.025, 0.07).toFixed(3)}`);
        disp.current?.setAttribute("scale", (k * rand(10, 24)).toFixed(1));
        el.style.setProperty("--rw-x", `${(rand(-1, 1) * 2.4 * k).toFixed(2)}px`);
        el.style.setProperty("--rw-k", `${(rand(-1, 1) * 1.2 * k).toFixed(2)}deg`);
        // a flicker: mostly a touch brighter, now and then a dip
        const b = Math.random() < 0.18 ? 1 - 0.12 * k : 1 + rand(0, 0.16) * k;
        el.style.filter = `url(#${id}) brightness(${b.toFixed(3)}) contrast(${(1 + 0.08 * k).toFixed(3)})`;
      }
      s.raf = requestAnimationFrame(frame);
    };
    s.raf = requestAnimationFrame(frame);
  }, [t, reduced, id]);

  // unmount (or reduced motion turned on mid-rewind): stop the loop
  useEffect(() => {
    if (!reduced) return;
    const s = st.current;
    if (s.raf) cancelAnimationFrame(s.raf);
    s.raf = 0;
    const el = box.current;
    el?.classList.remove("is-rw");
    el?.style.removeProperty("filter");
  }, [reduced]);
  useEffect(() => () => cancelAnimationFrame(st.current.raf), []);

  return (
    <div className={cn("rwa", className)} style={style}>
      <div ref={box} className="rwa-in">
        {children}
        <span className="rwa-fx" aria-hidden="true" />
      </div>
      {!reduced && (
        <svg className="rwa-svg" aria-hidden="true" focusable="false">
          <filter id={id} x="-4%" y="-4%" width="108%" height="108%" colorInterpolationFilters="sRGB">
            {/* horizontal bands of noise (no variation along x), quantised into a few hard slices that slip sideways */}
            <feTurbulence ref={turb} type="fractalNoise" baseFrequency="0 0.05" numOctaves={1} seed={1} result="noise" />
            <feComponentTransfer in="noise" result="bands">
              <feFuncR type="discrete" tableValues="0.5 0.5 0.5 0.66 0.5 0.5 0.3 0.5 0.5 0.5" />
              <feFuncG type="discrete" tableValues="0.5" />
            </feComponentTransfer>
            <feDisplacementMap ref={disp} in="SourceGraphic" in2="bands" scale={0} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      )}
    </div>
  );
};

export default RewindTape;
