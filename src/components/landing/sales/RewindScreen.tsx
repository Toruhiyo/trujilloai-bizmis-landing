import { useCallback, useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { ScreenFx } from "../devices";
import { useReducedMotion } from "./hooks";
import "@/styles/rewind-analog.css";

/** How often the tape's random parts (tear bands, RGB split, jitter, flicker) re-roll: a VHS-ish ~20 fps. */
const STEP_MS = 55;

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/**
 * A device's screen as a tape being rewound, while `on`: tracking bands
 * rolling up, horizontal tear slices, a red / cyan channel split, scanlines,
 * a little jitter and flicker (the analog look of beatcopy/RewindTape, made
 * for a lit screen rather than words, reusing its `.rwa-fx` overlay). Gathers
 * quickly as the rewind starts, fades as it stops; nothing while the beat
 * plays or holds. Driven straight on the DOM, never through React state.
 * Reduced motion: off. `band`: over something drawn on the band itself (the
 * payoff's funnel, its metric card), not a lit screen: no white ground, the
 * scanlines tuned for the orange.
 */
export const ScreenTape = ({ on, band = false, children }: { on: boolean; band?: boolean; children: ReactNode }) => {
  const reduced = useReducedMotion();
  const id = `rws-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const box = useRef<HTMLDivElement>(null);
  const turb = useRef<SVGFETurbulenceElement>(null);
  const disp = useRef<SVGFEDisplacementMapElement>(null);
  const offR = useRef<SVGFEOffsetElement>(null);
  const offB = useRef<SVGFEOffsetElement>(null);
  const st = useRef({ on, level: 0, raf: 0, step: 0 });
  st.current.on = on;

  useEffect(() => {
    const s = st.current;
    if (reduced || !on || s.raf) return;
    const el = box.current;
    if (!el) return;
    const off = () => {
      s.raf = 0;
      s.level = 0;
      el.classList.remove("is-rw");
      el.style.removeProperty("filter");
      ["--rw", "--rw-x", "--rw-y"].forEach((p) => el.style.removeProperty(p));
      disp.current?.setAttribute("scale", "0");
      offR.current?.setAttribute("dx", "0");
      offB.current?.setAttribute("dx", "0");
    };
    s.step = 0;
    const frame = (now: number) => {
      // quick to come in, slower to go
      const target = s.on ? 1 : 0;
      s.level += (target - s.level) * (target > s.level ? 0.3 : 0.12);
      if (!s.on && s.level < 0.015) {
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
        turb.current?.setAttribute("baseFrequency", `0 ${rand(0.02, 0.06).toFixed(3)}`);
        disp.current?.setAttribute("scale", (k * rand(8, 22)).toFixed(1));
        // the channel split: red one way, cyan the other
        offR.current?.setAttribute("dx", (-k * rand(1.5, 3.5)).toFixed(2));
        offB.current?.setAttribute("dx", (k * rand(1.5, 3.5)).toFixed(2));
        el.style.setProperty("--rw-x", `${(rand(-1, 1) * 2.2 * k).toFixed(2)}px`);
        el.style.setProperty("--rw-y", `${(rand(-1, 1) * 2.6 * k).toFixed(2)}px`);
        // a flicker: mostly a touch brighter and washed out, now and then a dip
        // (on the band, never a dip: it would read as the drawing going dark)
        const b = !band && Math.random() < 0.18 ? 1 - 0.1 * k : 1 + rand(0, 0.08) * k;
        el.style.filter = `url(#${id}) brightness(${b.toFixed(3)}) contrast(${(1 + 0.1 * k).toFixed(3)}) saturate(${(1 - 0.15 * k).toFixed(3)})`;
      }
      s.raf = requestAnimationFrame(frame);
    };
    s.raf = requestAnimationFrame(frame);
  }, [on, reduced, id, band]);

  // reduced motion turned on mid-rewind: stop and clear
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
    <div className={band ? "rws is-band" : "rws"}>
      <div ref={box} className="rws-in">
        {/* a screen nested inside this one keeps its own, plain */}
        <ScreenFx.Provider value={null}>{children}</ScreenFx.Provider>
        <span className="rwa-fx" aria-hidden="true" />
      </div>
      {!reduced && (
        <svg className="rwa-svg" aria-hidden="true" focusable="false">
          <filter id={id} x="-12%" y="-6%" width="124%" height="112%" colorInterpolationFilters="sRGB">
            {/* horizontal bands of noise, quantised into a few hard slices that slip sideways */}
            <feTurbulence ref={turb} type="fractalNoise" baseFrequency="0 0.04" numOctaves={1} seed={1} result="noise" />
            <feComponentTransfer in="noise" result="bands">
              <feFuncR type="discrete" tableValues="0.5 0.5 0.5 0.68 0.5 0.5 0.28 0.5 0.5 0.5" />
              <feFuncG type="discrete" tableValues="0.5" />
            </feComponentTransfer>
            <feDisplacementMap ref={disp} in="SourceGraphic" in2="bands" scale={0} xChannelSelector="R" yChannelSelector="G" result="torn" />
            {/* the channel split: the red channel shifted one way, green + blue the other, added back together */}
            <feOffset ref={offR} in="torn" dx={0} result="tornR" />
            <feOffset ref={offB} in="torn" dx={0} result="tornB" />
            {band ? (
              <>
                {/* on the band, red and cyan fringes behind the drawing instead: an added split turns
                    anything see-through (a line's soft edge, the tracking band) grey */}
                <feColorMatrix in="tornR" type="matrix" values="0 0 0 0 1  0 0 0 0 0.2  0 0 0 0 0.25  0 0 0 0.8 0" result="r" />
                <feColorMatrix in="tornB" type="matrix" values="0 0 0 0 0.15  0 0 0 0 0.95  0 0 0 0 1  0 0 0 0.8 0" result="gb" />
                <feMerge>
                  <feMergeNode in="r" />
                  <feMergeNode in="gb" />
                  <feMergeNode in="torn" />
                </feMerge>
              </>
            ) : (
              <>
                <feColorMatrix in="tornR" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
                <feColorMatrix in="tornB" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="gb" />
                <feComposite in="r" in2="gb" operator="arithmetic" k1={0} k2={1} k3={1} k4={0} />
              </>
            )}
          </filter>
        </svg>
      )}
    </div>
  );
};

/**
 * Lays the analog rewind over the screen of the device(s) inside it (the
 * frames' ScreenFx), not over the glass shell: `on` is the beat's rewinding
 * signal (useRewinding), the one the funnel's marker ◀◀ follows.
 */
const RewindScreen = ({ on, children }: { on: boolean; children: ReactNode }) => {
  const fx = useCallback((screen: ReactNode) => <ScreenTape on={on}>{screen}</ScreenTape>, [on]);
  return <ScreenFx.Provider value={fx}>{children}</ScreenFx.Provider>;
};

export default RewindScreen;
