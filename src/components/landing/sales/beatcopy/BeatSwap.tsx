import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSalesCopy } from "../proto";
import { Kicker, Strike, capFirst, clamp, easeOut, pen, splitCore, stageName } from "./parts";
import type { Cored } from "./parts";
import type { SwapLook } from "./style";
import "@/styles/beat-copy.css";

/*
 * The headline swaps (?beat=5a..5e): one headline slot per beat, the
 * merchant's loss in it, turned into the win in place at the fix. Each
 * sentence carries its core in [[…]] (`landing.sales.flip`): what hurts in
 * the loss, what pays in the win, and every look makes that core pop in both
 * states. All of it runs off the beat's clock (`since`: ms since the stage's
 * fix, `t` against `fixAt`), so scrolling back rewinds it; reduced motion
 * puts the clock on its end, the final state. Everything lands within the
 * beat's fixed stretch (FIXED, 2.3 s after the fix).
 *
 * a · strike & swoosh: the loss's core in bold, the rest muted; a marker
 *     strikes the core only and the rest fades; the win types in and its
 *     core gets a marker underline.
 * b · split-flap: the cores sit on flap tiles (dark for the loss, white for
 *     the win); every word flips over like a departures board.
 * c · big core: the core is the giant headline, the full sentence small
 *     under it; the loss's struck, the win's grows in, underlined.
 * d · highlighter: a muted highlighter on the loss's core as the shopper
 *     struggles; the win replaces it and a bright highlighter sweeps its
 *     core, the words turning ink under it.
 * e · stamp: the loss's core gets a hand-drawn ✗ stamp; the win's core is
 *     circled by the marker and gets a ✓ stamp.
 */

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const len = (s: string) => [...s].length;

/**
 * The one slot: the loss and the win stacked in the same place, the slot
 * as tall as what it shows (the loss's height, easing to the win's as `k`
 * goes 0 → 1), never the taller of the two.
 */
const SwapSlot = ({
  k,
  loss,
  win,
  lossStyle,
  winStyle,
  lossRef,
  winRef,
}: {
  k: number;
  loss: ReactNode;
  win: ReactNode;
  lossStyle?: CSSProperties;
  winStyle?: CSSProperties;
  lossRef?: RefObject<HTMLDivElement>;
  winRef?: RefObject<HTMLDivElement>;
}) => {
  const ownA = useRef<HTMLDivElement>(null);
  const ownB = useRef<HTMLDivElement>(null);
  const a = lossRef ?? ownA;
  const b = winRef ?? ownB;
  const [h, setH] = useState<[number, number] | null>(null);
  useLayoutEffect(() => {
    const measure = () => {
      const ha = a.current?.offsetHeight ?? 0;
      const hb = b.current?.offsetHeight ?? 0;
      setH((prev) => (prev && prev[0] === ha && prev[1] === hb ? prev : [ha, hb]));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    if (a.current) ro.observe(a.current);
    if (b.current) ro.observe(b.current);
    return () => ro.disconnect();
  }, [a, b]);
  const kk = clamp(k);
  return (
    <div className="bcs-slot" style={{ height: h ? lerp(h[0], h[1], kk) : undefined }}>
      <div ref={a} className="bcs-layer is-loss" style={lossStyle} aria-hidden={kk >= 1 || undefined}>
        {loss}
      </div>
      <div ref={b} className="bcs-layer is-win" style={winStyle} aria-hidden={kk <= 0 || undefined}>
        {win}
      </div>
    </div>
  );
};

/** `text`'s letters, each on as `shown` (letters typed so far, counted from the sentence's start) passes it. */
const Letters = ({ text, from, shown }: { text: string; from: number; shown: number }) => (
  <>
    {[...text].map((c, i) => (
      <span key={i} style={{ opacity: clamp(shown - (from + i)) }}>
        {c}
      </span>
    ))}
  </>
);

type LookProps = { loss: Cored; win: Cored; since: number };

/* ── a · strike & swoosh ── */
const LookA = ({ loss, win, since }: LookProps) => {
  const strike = pen((since - 140) / 420);
  const fade = easeOut((since - 140) / 520);
  const out = easeOut((since - 620) / 340);
  // typed at an even pace (so the moment its core is done is known), all of it in ~1.15 s at most
  const T0 = 700;
  const per = Math.min(13, 1150 / Math.max(1, len(win.text)));
  const shown = (since - T0) / per;
  const coreEnd = len(win.pre) + len(win.core);
  const swoosh = pen((since - (T0 + coreEnd * per + 40)) / 320);
  const rest = { opacity: 0.8 - 0.45 * fade };
  return (
    <SwapSlot
      k={easeOut((since - 620) / 480)}
      lossStyle={{ opacity: 1 - out, transform: `translateY(${(-out * 18).toFixed(1)}px)` }}
      loss={
        <h3 className="bcs-head">
          <span className="bcs-rest" style={rest}>
            {loss.pre}
          </span>
          <span className="bcs-core bcs-band is-strike" style={{ backgroundSize: `${(strike * 100).toFixed(1)}% 0.13em` }}>
            {loss.core}
          </span>
          <span className="bcs-rest" style={rest}>
            {loss.post}
          </span>
        </h3>
      }
      win={
        <h3 className="bcs-head">
          <span className="sr-only">{win.text}</span>
          <span aria-hidden="true">
            <span className="bcs-rest is-win">
              <Letters text={win.pre} from={0} shown={shown} />
            </span>
            <span className="bcs-core bcs-band is-under" style={{ backgroundSize: `${(swoosh * 100).toFixed(1)}% 0.3em` }}>
              <Letters text={win.core} from={len(win.pre)} shown={shown} />
            </span>
            <span className="bcs-rest is-win">
              <Letters text={win.post} from={coreEnd} shown={shown} />
            </span>
          </span>
        </h3>
      }
    />
  );
};

/* ── b · split-flap ── */
type Word = { segs: { text: string; core: boolean }[] };
/** The sentence's words, each cut where the core starts or ends ("competitor" | "."). */
const wordsOf = (c: Cored): Word[] => {
  const a = len(c.pre);
  const b = a + len(c.core);
  const out: Word[] = [];
  let pos = 0;
  for (const w of c.text.split(" ")) {
    const chars = [...w];
    const segs: Word["segs"] = [];
    chars.forEach((ch, i) => {
      const core = pos + i >= a && pos + i < b;
      const last = segs[segs.length - 1];
      if (last && last.core === core) last.text += ch;
      else segs.push({ text: ch, core });
    });
    out.push({ segs });
    pos += chars.length + 1;
  }
  return out;
};
const easeIn = (k: number) => clamp(k) ** 2;

const Flaps = ({ c, side, since, strike }: { c: Cored; side: "loss" | "win"; since: number; strike: number }) => {
  const words = wordsOf(c);
  return (
    <h3 className="bcs-head">
      <span className="sr-only">{c.text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => {
          // the loss's words flip away, one after the other; the win's flip in behind them
          const deg =
            side === "loss"
              ? 90 * easeIn((since - (460 + i * 18)) / 150)
              : -90 * (1 - easeOut((since - (640 + i * 30)) / 190));
          return (
            <span key={i}>
              <span
                className="bcs-b-word"
                style={{
                  transform: deg ? `perspective(500px) rotateX(${deg.toFixed(1)}deg)` : undefined,
                  opacity: Math.abs(deg) >= 89 ? 0 : 1,
                }}
              >
                {w.segs.map((sg, j) =>
                  sg.core ? (
                    <span key={j} className={cn("bcs-flap", `is-${side}`)}>
                      {side === "loss" ? <Strike k={strike}>{sg.text}</Strike> : sg.text}
                    </span>
                  ) : (
                    <span key={j} className="bcs-b-rest">
                      {sg.text}
                    </span>
                  ),
                )}
              </span>
              {i < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </span>
    </h3>
  );
};

const LookB = ({ loss, win, since }: LookProps) => (
  <SwapSlot
    k={easeOut((since - 460) / 640)}
    loss={<Flaps c={loss} side="loss" since={since} strike={pen((since - 140) / 300)} />}
    win={<Flaps c={win} side="win" since={since} strike={0} />}
  />
);

/* ── c · big core ── */
const LookC = ({ loss, win, since }: LookProps) => {
  const strike = pen((since - 140) / 340);
  const out = easeOut((since - 520) / 360);
  const grow = easeOut((since - 700) / 420);
  const under = pen((since - 1080) / 420);
  const sent = easeOut((since - 980) / 420);
  return (
    <SwapSlot
      k={easeOut((since - 520) / 520)}
      lossStyle={{ opacity: 1 - out, transform: `translateY(${(-out * 18).toFixed(1)}px)` }}
      winStyle={{ opacity: grow }}
      loss={
        <>
          <h3 className="bcs-c-big">
            <Strike k={strike} className="is-thick">
              {capFirst(loss.core)}
            </Strike>
          </h3>
          <p className="bcs-c-sent" style={{ opacity: 1 - 0.4 * strike }}>
            {loss.pre}
            <strong className="bcs-c-core">{loss.core}</strong>
            {loss.post}
          </p>
        </>
      }
      win={
        <>
          <h3
            className="bcs-c-big"
            style={{ transform: `scale(${(0.86 + 0.14 * grow).toFixed(3)})`, transformOrigin: "0 100%" }}
          >
            <span className="bcs-band is-under" style={{ backgroundSize: `${(under * 100).toFixed(1)}% 0.11em` }}>
              {capFirst(win.core)}
            </span>
          </h3>
          <p className="bcs-c-sent" style={{ opacity: sent, transform: `translateY(${((1 - sent) * 8).toFixed(1)}px)` }}>
            {win.pre}
            <strong className="bcs-c-core is-win">{win.core}</strong>
            {win.post}
          </p>
        </>
      }
    />
  );
};

/* ── d · highlighter ── */
const LookD = ({ loss, win, since }: LookProps) => {
  // the muted highlighter goes over the loss's core while the shopper still struggles (before the fix)
  const grey = pen((since + 1300) / 700);
  const out = easeOut((since - 300) / 420);
  const enter = easeOut((since - 560) / 420);
  const hl = pen((since - 1000) / 620);
  const p = (hl * 100).toFixed(1);
  return (
    <SwapSlot
      k={easeOut((since - 400) / 560)}
      lossStyle={{ opacity: 1 - out, filter: out > 0 ? `blur(${(out * 8).toFixed(1)}px)` : undefined }}
      winStyle={{
        opacity: enter,
        filter: enter < 1 ? `blur(${((1 - enter) * 8).toFixed(1)}px)` : undefined,
        transform: `translateY(${((1 - enter) * 10).toFixed(1)}px)`,
      }}
      loss={
        <h3 className="bcs-head">
          <span className="bcs-rest">{loss.pre}</span>
          <span className="bcs-core bcs-hl is-grey" style={{ backgroundSize: `${(grey * 100).toFixed(1)}% 1em` }}>
            {loss.core}
          </span>
          <span className="bcs-rest">{loss.post}</span>
        </h3>
      }
      win={
        <h3 className="bcs-head">
          <span className="bcs-rest is-win">{win.pre}</span>
          <span className="bcs-core bcs-hl is-bright" style={{ backgroundSize: `${p}% 1em` }}>
            {/* the words turn ink exactly where the highlighter has been */}
            <span
              className="bcs-hl-ink"
              style={{ backgroundImage: `linear-gradient(90deg, var(--bc-ink) ${p}%, #fff ${p}%)` }}
            >
              {win.core}
            </span>
          </span>
          <span className="bcs-rest is-win">{win.post}</span>
        </h3>
      }
    />
  );
};

/* ── e · stamp ── */
type Geo = { lines: { l: number; r: number; t: number; b: number }[] };
/** The core's line boxes (its `.bcs-core-m` parts), relative to its layer (read on layout, resize and font load). */
const useCoreGeo = (layer: RefObject<HTMLElement>, key: string) => {
  const [geo, setGeo] = useState<Geo | null>(null);
  useLayoutEffect(() => {
    const measure = () => {
      const el = layer.current;
      if (!el) return;
      const L = el.getBoundingClientRect();
      const lines: Geo["lines"] = [];
      el.querySelectorAll(".bcs-core-m").forEach((part) => {
        for (const r of part.getClientRects()) {
          if (r.width < 1) continue;
          const t = r.top - L.top;
          const same = lines.find((x) => Math.abs(x.t - t) < 4);
          if (same) {
            same.l = Math.min(same.l, r.left - L.left);
            same.r = Math.max(same.r, r.right - L.left);
          } else lines.push({ l: r.left - L.left, r: r.right - L.left, t, b: r.bottom - L.top });
        }
      });
      lines.sort((x, y) => x.t - y.t);
      const next = { lines };
      setGeo((prev) => (prev && JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };
    measure();
    document.fonts?.ready.then(measure).catch(() => undefined);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    if (layer.current) ro.observe(layer.current);
    return () => ro.disconnect();
  }, [layer, key]);
  return geo;
};

/**
 * The marker's loop around the core: a rounded outline of its lines,
 * closed with a little overshoot, as a hand draws it.
 */
const lassoPath = (g: Geo) => {
  const ls = g.lines;
  if (!ls.length) return "";
  const px = 7;
  // an inline's box is taller than its line (1.1): a touch in, so the loop doesn't cross the lines around it
  const py = -1;
  const n = ls.length;
  const mid = (k: number) => (ls[k].b + ls[k + 1].t) / 2;
  const top = (k: number) => (k === 0 ? ls[0].t - py : mid(k - 1));
  const bot = (k: number) => (k === n - 1 ? ls[n - 1].b + py : mid(k));
  const raw: [number, number][] = [[ls[0].l - px, top(0)]];
  for (let k = 0; k < n; k++) {
    raw.push([ls[k].r + px, top(k)], [ls[k].r + px, bot(k)]);
  }
  for (let k = n - 1; k >= 0; k--) {
    raw.push([ls[k].l - px, bot(k)], [ls[k].l - px, top(k)]);
  }
  // drop repeats and straight-through points
  const pts = raw.filter((p, i) => {
    const q = raw[(i - 1 + raw.length) % raw.length];
    return Math.hypot(p[0] - q[0], p[1] - q[1]) > 0.5;
  });
  const clean = pts.filter((p, i) => {
    const a = pts[(i - 1 + pts.length) % pts.length];
    const b = pts[(i + 1) % pts.length];
    return Math.abs((p[0] - a[0]) * (b[1] - p[1]) - (p[1] - a[1]) * (b[0] - p[0])) > 0.5;
  });
  const m = clean.length;
  const R = 14;
  let d = "";
  let lastB: [number, number] = clean[0];
  let lastV: [number, number] = [1, 0];
  for (let i = 0; i <= m; i++) {
    const p0 = clean[(i - 1 + m) % m];
    const p1 = clean[i % m];
    const p2 = clean[(i + 1) % m];
    const d1 = Math.hypot(p0[0] - p1[0], p0[1] - p1[1]);
    const d2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const r = Math.min(R, d1 / 2, d2 / 2);
    const v1: [number, number] = [(p0[0] - p1[0]) / d1, (p0[1] - p1[1]) / d1];
    const v2: [number, number] = [(p2[0] - p1[0]) / d2, (p2[1] - p1[1]) / d2];
    const a = [p1[0] + v1[0] * r, p1[1] + v1[1] * r];
    const b: [number, number] = [p1[0] + v2[0] * r, p1[1] + v2[1] * r];
    d += `${i === 0 ? "M" : " L"}${a[0].toFixed(1)} ${a[1].toFixed(1)} Q${p1[0].toFixed(1)} ${p1[1].toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
    lastB = b;
    lastV = v2;
  }
  // the overshoot: on past the first corner, a little off the line
  return `${d} L${(lastB[0] + lastV[0] * 22).toFixed(1)} ${(lastB[1] + lastV[1] * 22 - 3).toFixed(1)}`;
};

/** The stamp, in the line right after the core (its room kept from the start, so it never covers a word). */
const Stamp = ({ kind, slam, draw }: { kind: "x" | "check"; slam: number; draw: number }) => (
  <span
    className={cn("bcs-stamp", `is-${kind}`)}
    aria-hidden="true"
    style={{
      opacity: clamp(slam * 3),
      transform: `rotate(${kind === "x" ? -12 : 8}deg) scale(${(1.7 - 0.7 * slam).toFixed(3)})`,
    }}
  >
    <svg viewBox="0 0 40 40">
      {kind === "x" ? (
        <>
          <path d="M12 11 C 17 17, 22 23, 28 30" pathLength={1} style={{ strokeDashoffset: 1 - clamp(draw * 2) }} />
          <path d="M28 10 C 23 17, 17 24, 11 30" pathLength={1} style={{ strokeDashoffset: 1 - clamp(draw * 2 - 1) }} />
        </>
      ) : (
        <path d="M10 21 L 17 28 L 30 12" pathLength={1} style={{ strokeDashoffset: 1 - draw }} />
      )}
    </svg>
  </span>
);

/** The core cut for the stamp: all but its last word, then that word kept on one line with the punctuation after it and the stamp. */
const StampedCore = ({ c, stamp, children }: { c: Cored; stamp: ReactNode; children?: (t: string) => ReactNode }) => {
  const cut = c.core.lastIndexOf(" ") + 1;
  const punct = /^[.,;:!?…]*/u.exec(c.post)?.[0] ?? "";
  const wrap = children ?? ((t: string) => t);
  return (
    <>
      {cut > 0 && <span className="bcs-core bcs-core-m">{wrap(c.core.slice(0, cut))}</span>}
      <span className="bcs-nowrap">
        <span className="bcs-core bcs-core-m">{wrap(c.core.slice(cut))}</span>
        {punct}
        {stamp}
      </span>
    </>
  );
};
const tail = (c: Cored) => c.post.slice((/^[.,;:!?…]*/u.exec(c.post)?.[0] ?? "").length);

const LookE = ({ loss, win, since }: LookProps) => {
  const lossLayer = useRef<HTMLDivElement>(null);
  const winLayer = useRef<HTMLDivElement>(null);
  const wg = useCoreGeo(winLayer, win.text);
  const strike = pen((since - 140) / 320);
  const xSlam = easeOut((since - 160) / 220);
  const xDraw = pen((since - 220) / 300);
  const out = easeOut((since - 680) / 320);
  const enter = easeOut((since - 780) / 340);
  const lasso = pen((since - 1120) / 520);
  const vSlam = easeOut((since - 1560) / 220);
  const vDraw = pen((since - 1640) / 260);
  const rest = { opacity: 0.8 - 0.35 * strike };
  return (
    <SwapSlot
      k={easeOut((since - 680) / 440)}
      lossRef={lossLayer}
      winRef={winLayer}
      lossStyle={{ opacity: 1 - out, transform: `translateY(${(-out * 18).toFixed(1)}px)` }}
      winStyle={{ opacity: enter, transform: `translateY(${((1 - enter) * 12).toFixed(1)}px)` }}
      loss={
        <h3 className="bcs-head">
          <span className="bcs-rest" style={rest}>
            {loss.pre}
          </span>
          <StampedCore c={loss} stamp={<Stamp kind="x" slam={xSlam} draw={xDraw} />}>
            {(t) => <Strike k={strike}>{t}</Strike>}
          </StampedCore>
          <span className="bcs-rest" style={rest}>
            {tail(loss)}
          </span>
        </h3>
      }
      win={
        <>
          <h3 className="bcs-head">
            <span className="bcs-rest is-win">{win.pre}</span>
            <StampedCore c={win} stamp={<Stamp kind="check" slam={vSlam} draw={vDraw} />} />
            <span className="bcs-rest is-win">{tail(win)}</span>
          </h3>
          {wg && (
            <svg className="bcs-lasso" aria-hidden="true">
              <path d={lassoPath(wg)} pathLength={1} style={{ strokeDashoffset: 1 - lasso }} />
            </svg>
          )}
        </>
      }
    />
  );
};

const LOOKS: Record<SwapLook, (p: LookProps) => JSX.Element> = { a: LookA, b: LookB, c: LookC, d: LookD, e: LookE };

type Props = {
  look: SwapLook;
  index: number;
  t: number;
  fixAt: number;
  numbered: boolean;
  className?: string;
  style?: CSSProperties;
};

const BeatSwap = ({ look, index, t, fixAt, numbered, className, style }: Props) => {
  const s = useSalesCopy();
  const loss = splitCore(s.flip[index].problem);
  const win = splitCore(s.flip[index].fix);
  const since = t - fixAt;
  const fixed = since >= 440;
  const Look = LOOKS[look];
  return (
    <div className={cn("sl-copy bc bcs", `bcs-${look}`, className)} style={style} data-since={Math.round(since)}>
      <Kicker index={index} name={stageName(s.titleParts[index])} numbered={numbered}>
        {/* the funnel's own status for this stage: its problem, then its fix */}
        <span className={cn("bc5-chip", fixed && "is-fixed")}>
          {fixed && <Check strokeWidth={3.2} aria-hidden="true" />}
          {fixed ? s.funnel.solutions[index] : s.funnel.problems[index]}
        </span>
      </Kicker>
      <Look loss={loss} win={win} since={since} />
    </div>
  );
};

export default BeatSwap;
