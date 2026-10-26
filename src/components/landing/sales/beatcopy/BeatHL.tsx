import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import { cn } from "@/lib/utils";
import { useSalesCopy } from "../proto";
import { Kicker, clamp, easeOut, pen, splitCore, stageName } from "./parts";
import type { Cored } from "./parts";
import type { HLLook } from "./style";
import "@/styles/beat-copy.css";

/*
 * The polished highlighters (?beat=6a..6e). The loss and the win open with
 * the same words ("Visitors browsing your catalog …") and differ only in
 * their [[core]]. The headline is set on two lines: the shared opening on
 * its own line, ending in an ellipsis ("Visitors browsing your catalog…"),
 * and under it, right-aligned to the block's edge, the core's line, opening
 * with one ("…find products worth buying, fast."; the ellipses are drawn
 * here, never in the copy). THE RULE: the opening is set once and never
 * moves, fades, blurs, reflows or changes size; only the core's line
 * changes, in place. The loss's and the win's core lines are stacked in one
 * grid cell, as tall as the taller from the start, so the block (centred on
 * its device) never jumps. Nothing animated touches layout: the letters only
 * change opacity and colour (or are clipped), and the marks (highlighter
 * bands, strikes, the caret) are drawn in SVG under or over the words, on
 * the lines the cores were laid out on (measured on layout, resize and font
 * load).
 *
 * Everything runs off the beat's clock (`since`, ms since the fix), so it
 * rewinds; reduced motion puts the clock on its end (the final state).
 *
 * a · retract & retype: a muted highlighter over the loss's core; at the fix
 *     it retracts right to left, taking the words with it; the win is typed
 *     in behind a caret and a bright highlighter sweeps it, ink under it.
 * b · paint over: a marker strikes the loss's core; one bright highlighter
 *     sweep paints over it, the loss's words going under the paint and the
 *     win's coming up out of it, in ink; then the paint settles on the win.
 * c · marker correction: the loss's core is struck and left as a ghost;
 *     the win is handwritten on the line under it, in the same white, and
 *     underlined by hand (both lines kept from the start).
 * d · underline marker: a low marker band under the core (muted for the
 *     loss, bright for the win), the cores crossfading in place.
 * e · squeeze: the muted highlighter squeezes into a strike through the
 *     loss, the loss goes, the strike slides over to the win's lines and
 *     opens back up as a bright highlighter with the win inside it.
 */

const len = (s: string) => [...s].length;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const easeInOut = (k: number) => {
  const x = clamp(k);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
};
const INK: [number, number, number] = [59, 36, 22];
/** White → ink (#3B2416) as `k` goes 0 → 1. */
const inkMix = (k: number) => {
  const x = clamp(k);
  return `rgb(${INK.map((c) => Math.round(lerp(255, c, x))).join(" ")})`;
};
const MUTED = [59, 36, 22, 0.24] as const;
const BRIGHT = [255, 217, 179, 1] as const;
/** The muted highlighter (0) → the bright one (1); `dark` thickens the muted one (a strike reads as a line). */
const fillMix = (k: number, dark = 0) => {
  const x = clamp(k);
  const from = [MUTED[0], MUTED[1], MUTED[2], lerp(MUTED[3], 0.62, clamp(dark))];
  const c = from.map((m, i) => lerp(m, BRIGHT[i], x));
  return `rgb(${Math.round(c[0])} ${Math.round(c[1])} ${Math.round(c[2])} / ${c[3].toFixed(3)})`;
};

/* ── the cores' geometry ── */

type Side = "L" | "W";
/** A measured glyph (or word): its x span, its line, that line's baseline, its font size. */
type Item = { l: number; r: number; row: number; base: number; fs: number; top: number; h: number };
type Geo = { L: (Item | undefined)[]; W: (Item | undefined)[]; fs: number };

/** Offsets up to `root` (offset*, so the parent's transforms and the tape's jitter never skew them). */
const offsetIn = (n: HTMLElement, root: HTMLElement) => {
  let x = n.offsetLeft;
  let y = n.offsetTop;
  let p = n.offsetParent as HTMLElement | null;
  while (p && p !== root) {
    x += p.offsetLeft;
    y += p.offsetTop;
    p = p.offsetParent as HTMLElement | null;
  }
  return { x, y };
};

/** The cores' glyphs ([data-c] = side + index) in `box`, grouped into lines. */
const useGeo = (box: RefObject<HTMLElement>, key: string) => {
  const [geo, setGeo] = useState<Geo | null>(null);
  useLayoutEffect(() => {
    const measure = () => {
      const el = box.current;
      if (!el) return;
      const fs = parseFloat(getComputedStyle(el).fontSize) || 16;
      const raw: { side: Side; i: number; l: number; r: number; top: number; h: number; base: number; fs: number }[] = [];
      const sizes = new Map<Element, number>();
      el.querySelectorAll<HTMLElement>("[data-c]").forEach((n) => {
        const tag = n.dataset.c ?? "";
        const side = tag[0] as Side;
        const i = Number(tag.slice(1));
        const parent = n.parentElement ?? n;
        let f = sizes.get(parent);
        if (f === undefined) {
          f = parseFloat(getComputedStyle(n).fontSize) || fs;
          sizes.set(parent, f);
        }
        const { x, y } = offsetIn(n, el);
        const w = n.offsetWidth;
        const h = n.offsetHeight;
        // the baseline: the content box's ascent share (Inter and Caveat both ~0.8 of it)
        raw.push({ side, i, l: x, r: x + w, top: y, h, base: y + h * 0.8, fs: f });
      });
      // lines: by baseline (an inline-block word's box is its line's, so its baseline sits lower: same tolerance)
      const bases: number[] = [];
      raw
        .map((g) => g.base)
        .sort((a, b) => a - b)
        .forEach((b) => {
          if (!bases.length || b - bases[bases.length - 1] > fs * 0.55) bases.push(b);
        });
      const next: Geo = { L: [], W: [], fs };
      raw.forEach((g) => {
        let row = 0;
        bases.forEach((b, k) => {
          if (Math.abs(g.base - b) < Math.abs(g.base - bases[row])) row = k;
        });
        next[g.side][g.i] = { l: g.l, r: g.r, row, base: g.base, fs: g.fs, top: g.top, h: g.h };
      });
      setGeo((prev) => (prev && JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };
    measure();
    document.fonts?.ready.then(measure).catch(() => undefined);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, [box, key]);
  return geo;
};

/** One line's run of a core: where it starts and ends, its baseline and size. */
type Seg = { row: number; l: number; r: number; base: number; fs: number };
/**
 * A pen's track over one or both cores, line after line: `frac` places a
 * glyph on it (0 → 1, its centre), `upTo` is the track drawn to `k`. Before
 * the first measure, glyphs are spaced evenly and nothing is drawn.
 */
type Track = { segs: Seg[]; frac: (side: Side, i: number) => number; upTo: (k: number) => Seg[]; fe: number };
const track = (geo: Geo | null, sides: Side[], n: number): Track => {
  if (!geo) return { segs: [], frac: (_s, i) => (i + 0.5) / Math.max(1, n), upTo: () => [], fe: 1.5 / Math.max(1, n) };
  const byRow = new Map<number, Seg>();
  sides.forEach((side) =>
    geo[side].forEach((g) => {
      if (!g) return;
      const s = byRow.get(g.row);
      if (s) {
        s.l = Math.min(s.l, g.l);
        s.r = Math.max(s.r, g.r);
        s.base = Math.max(s.base, g.base);
        s.fs = Math.max(s.fs, g.fs);
      } else byRow.set(g.row, { row: g.row, l: g.l, r: g.r, base: g.base, fs: g.fs });
    }),
  );
  const segs = [...byRow.values()].sort((a, b) => a.row - b.row);
  const cum: number[] = [];
  let total = 0;
  segs.forEach((s) => {
    cum.push(total);
    total += s.r - s.l;
  });
  total = Math.max(1, total);
  return {
    segs,
    frac: (side, i) => {
      const g = geo[side][i];
      if (!g) return 0;
      const k = segs.findIndex((s) => s.row === g.row);
      return k < 0 ? 0 : (cum[k] + (g.l + g.r) / 2 - segs[k].l) / total;
    },
    upTo: (k) =>
      segs.map((s, i) => {
        const w = s.r - s.l;
        return { ...s, r: s.l + clamp((k * total - cum[i]) / Math.max(1, w)) * w };
      }),
    fe: (geo.fs * 0.55) / total,
  };
};
/** How far past a glyph at `f` the pen at `k` is (0 → 1, over a soft edge `fe` wide). */
const passed = (k: number, f: number, fe: number) => (k <= 0 ? 0 : k >= 1 ? 1 : clamp((k - f) / fe + 0.5));

/* ── the marks ── */

type BandKind = "full" | "low";
/** Where a band sits on a line (from its baseline): a full highlighter, or a low marker under the words. */
const bandY = (s: { base: number; fs: number }, kind: BandKind): [number, number] =>
  kind === "full" ? [s.base - s.fs * 0.84, s.base + s.fs * 0.15] : [s.base - s.fs * 0.3, s.base + s.fs * 0.13];
/** A chisel-tip marker band, its edges a touch uneven (per line, so no two lines look stamped). */
const bandD = (l: number, r: number, y0: number, y1: number, seed: number) => {
  if (r - l < 0.6 || y1 - y0 < 0.3) return "";
  const h = y1 - y0;
  const sl = Math.min(h * 0.2, (r - l) / 2);
  const w = (k: number) => Math.sin(seed * 7.31 + k * 2.17) * h * 0.035;
  const mx = (l + r) / 2;
  return (
    `M${(l + sl).toFixed(1)} ${(y0 + w(1)).toFixed(1)}` +
    ` Q${mx.toFixed(1)} ${(y0 + w(2) - h * 0.03).toFixed(1)} ${r.toFixed(1)} ${(y0 + w(3)).toFixed(1)}` +
    ` L${(r - sl).toFixed(1)} ${(y1 + w(4)).toFixed(1)}` +
    ` Q${mx.toFixed(1)} ${(y1 + w(5) + h * 0.03).toFixed(1)} ${l.toFixed(1)} ${(y1 + w(6)).toFixed(1)} Z`
  );
};
const PAD = 0.12;
/** Bands over `segs` (padded a little past the words; a line not reached yet draws nothing). */
const Bands = ({
  segs,
  kind,
  className,
  style,
  y,
}: {
  segs: Seg[];
  kind: BandKind;
  className: string;
  style?: CSSProperties;
  /** Override of the band's top and bottom on a line. */
  y?: (s: Seg) => [number, number];
}) => (
  <>
    {segs.map((s) => {
      if (s.r - s.l < 0.6) return null;
      const [y0, y1] = y ? y(s) : bandY(s, kind);
      const p = s.fs * PAD;
      return <path key={s.row} className={className} style={style} d={bandD(s.l - p, s.r + p, y0, y1, s.row + 1)} />;
    })}
  </>
);
/** A marker strike through the words, line by line. */
const Strikes = ({ segs, style }: { segs: Seg[]; style?: CSSProperties }) => (
  <>
    {segs.map((s) => {
      if (s.r - s.l < 0.6) return null;
      const y = s.base - s.fs * 0.31;
      const t = (k: number) => Math.sin((s.row + 1) * 3.7 + k) * s.fs * 0.025;
      const l = s.l - s.fs * 0.06;
      const r = s.r + s.fs * 0.06;
      return (
        <path
          key={s.row}
          className="bch-strike"
          style={{ strokeWidth: s.fs * 0.085, ...style }}
          d={`M${l.toFixed(1)} ${(y + t(1)).toFixed(1)} Q${((l + r) / 2).toFixed(1)} ${(y + t(2) - s.fs * 0.02).toFixed(1)} ${r.toFixed(1)} ${(y + t(3)).toFixed(1)}`}
        />
      );
    })}
  </>
);

/** A hand-drawn underline under the words, line by line (the funnel's fixed labels' swoosh). */
const Underlines = ({ segs }: { segs: Seg[] }) => (
  <>
    {segs.map((s) => {
      if (s.r - s.l < 0.6) return null;
      const y = s.base + s.fs * 0.14;
      const t = (k: number) => Math.sin((s.row + 1) * 2.9 + k) * s.fs * 0.03;
      const l = s.l - s.fs * 0.04;
      const r = s.r + s.fs * 0.08;
      return (
        <path
          key={s.row}
          className="bch-strike"
          style={{ strokeWidth: s.fs * 0.075 }}
          d={`M${l.toFixed(1)} ${(y + t(1)).toFixed(1)} Q${((l + r) / 2).toFixed(1)} ${(y + t(2) + s.fs * 0.05).toFixed(1)} ${r.toFixed(1)} ${(y + t(3) - s.fs * 0.06).toFixed(1)}`}
        />
      );
    })}
  </>
);

/* ── the words ── */

/** The core's line opens with an ellipsis (the opening's line ends with one): drawn, never in the copy. */
const ELLIPSIS = "\u2026";
/** The opening as its own line: "Visitors browsing your catalog…". */
const opening = (pre: string) => `${pre.replace(/[\s,;:]+$/u, "")}${ELLIPSIS}`;

/**
 * A core's glyphs, each measured ([data-c]) and styled by `look`; words
 * never break inside. `lead` (the ellipsis) sits glued to the first word,
 * styled as its first glyph, and is never measured (no mark goes over it).
 */
const Glyphs = ({
  text,
  side,
  look,
  lead = ELLIPSIS,
  leadStyle,
}: {
  text: string;
  side: Side;
  look: (i: number) => CSSProperties | undefined;
  lead?: string;
  /** The ellipsis's own style (default: the first glyph's opacity; it stays white, off the marks). */
  leadStyle?: CSSProperties;
}) => {
  const words = text.split(" ");
  let pos = 0;
  const first = look(0);
  const ls = leadStyle ?? (first?.opacity !== undefined ? { opacity: first.opacity } : undefined);
  return (
    <>
      {words.map((w, wi) => {
        const start = pos;
        const chars = [...w];
        pos += chars.length + 1;
        return (
          <span key={wi}>
            <span className="bch-w">
              {wi === 0 && lead && (
                <span className="bch-lead" style={ls}>
                  {lead}
                </span>
              )}
              {chars.map((c, ci) => (
                <span key={ci} data-c={`${side}${start + ci}`} style={look(start + ci)}>
                  {c}
                </span>
              ))}
            </span>
            {wi < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </>
  );
};
/** A core's words as blocks (each measured: index = word), styled by `look(word, its first glyph, its length)`; `lead` as in Glyphs. */
const Words = ({
  text,
  side,
  look,
  className,
  lead = ELLIPSIS,
  leadStyle,
}: {
  text: string;
  side: Side;
  look: (wi: number, from: number, n: number) => CSSProperties | undefined;
  className?: string;
  lead?: string;
  leadStyle?: CSSProperties;
}) => {
  const words = text.split(" ");
  let pos = 0;
  return (
    <>
      {words.map((w, wi) => {
        const start = pos;
        pos += len(w) + 1;
        const st = look(wi, start, len(w));
        return (
          <span key={wi}>
            {wi === 0 && lead && (
              <span className={cn("bch-wb bch-lead", className)} style={leadStyle}>
                {lead}
              </span>
            )}
            <span className={cn("bch-wb", className)} data-c={`${side}${wi}`} style={st}>
              {w}
            </span>
            {wi < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </>
  );
};

/**
 * The headline, on two lines. The opening, on its own line, ending in an
 * ellipsis: set once, never touched again. Under it, right-aligned, the
 * core's line ("…find products worth buying, fast."): the loss's and the
 * win's stacked in one cell (as tall as the taller, from the start), or,
 * `stacked` off, the win's line kept under the loss's. The marks sit under
 * the words (`marks`) or over them (`over`).
 */
const Head = ({
  boxRef,
  pre,
  winPre,
  said,
  loss,
  win,
  marks,
  over,
  stacked = true,
}: {
  boxRef: RefObject<HTMLSpanElement>;
  pre: string;
  winPre?: { text: string; on: number };
  said: string;
  loss: ReactNode;
  win: ReactNode;
  marks: ReactNode;
  over?: ReactNode;
  stacked?: boolean;
}) => (
  <h3 className="bch-head">
    <span className="sr-only">{said}</span>
    <span ref={boxRef} className="bch-box" aria-hidden="true">
      <svg className="bch-marks" focusable="false">
        {marks}
      </svg>
      <span className="bch-pre">
        <span style={winPre ? { opacity: 1 - winPre.on } : undefined}>{opening(pre)}</span>
        {/* (only if the openings ever differ: the win's own, fading in over the loss's at the fix) */}
        {winPre && <span style={{ opacity: winPre.on }}>{opening(winPre.text)}</span>}
      </span>
      <span className={cn("bch-cores", stacked && "is-stacked")}>
        <span className="bch-layer">{loss}</span>
        <span className="bch-layer">{win}</span>
      </span>
      {over && (
        <svg className="bch-marks is-over" focusable="false">
          {over}
        </svg>
      )}
    </span>
  </h3>
);

type LookProps = { loss: Cored; win: Cored; since: number };

/** The shared bits every look starts from: the box, its geometry, the cores' lengths, what's said. */
const useLook = (loss: Cored, win: Cored, since: number, look: string) => {
  const boxRef = useRef<HTMLSpanElement>(null);
  const geo = useGeo(boxRef, `${look}|${loss.text}|${win.text}`);
  const same = loss.pre === win.pre;
  return {
    boxRef,
    geo,
    nL: len(loss.core),
    nW: len(win.core),
    said: since < 440 ? loss.text : win.text,
    // (if the openings ever differ, the win's own fades in over the loss's at the fix)
    winPre: same ? undefined : { text: win.pre, on: easeOut((since - 300) / 400) },
  };
};

/* ── a · retract & retype ── */
const LookA = ({ loss, win, since }: LookProps) => {
  const { boxRef, geo, nL, nW, said, winPre } = useLook(loss, win, since, "a");
  const tL = track(geo, ["L"], nL);
  const tW = track(geo, ["W"], nW);
  // the muted highlighter goes over the loss's core while the shopper still struggles
  const grey = pen((since + 1300) / 700);
  // at the fix it retracts, right to left, and the words go with it
  const back = easeInOut((since - 120) / 440);
  const kL = grey * (1 - back);
  // then the win is typed at an even pace, behind a caret
  const T0 = 640;
  const per = Math.min(34, 620 / Math.max(1, nW));
  const typed = (since - T0) / per;
  const typeEnd = T0 + nW * per;
  // and the bright highlighter sweeps it, its words turning ink under it
  const sweep = pen((since - typeEnd - 120) / 560);
  // the caret: at the end of the last letter typed
  let caret: ReactNode = null;
  const caretOn = clamp((since - (T0 - 120)) / 80) * (1 - clamp((since - (typeEnd + 220)) / 140));
  if (geo && caretOn > 0) {
    const j = Math.max(-1, Math.min(nW - 1, Math.floor(typed)));
    let g = j >= 0 ? geo.W[j] : undefined;
    for (let k = j; !g && k >= 0; k--) g = geo.W[k];
    const first = geo.W.find(Boolean);
    const at = g ?? first;
    if (at) {
      const x = g ? g.r + at.fs * 0.05 : at.l - at.fs * 0.04;
      const [y0, y1] = bandY(at, "full");
      caret = (
        <rect
          className="bch-caret"
          x={x}
          y={y0 + at.fs * 0.06}
          width={Math.max(2, at.fs * 0.07)}
          height={y1 - y0 - at.fs * 0.1}
          rx={1}
          style={{ opacity: caretOn }}
        />
      );
    }
  }
  return (
    <Head
      boxRef={boxRef}
      pre={loss.pre}
      winPre={winPre}
      said={said}
      marks={
        <>
          <Bands segs={tL.upTo(kL)} kind="full" className="bch-band is-muted" />
          <Bands segs={tW.upTo(sweep)} kind="full" className="bch-band is-bright" />
          {caret}
        </>
      }
      loss={
        <>
          <span className="bch-core">
            <Glyphs text={loss.core} side="L" look={(i) => (back > 0 ? { opacity: passed(kL, tL.frac("L", i), tL.fe) } : undefined)} />
          </span>
          <span style={{ opacity: 1 - clamp(back * 6) }}>{loss.post}</span>
        </>
      }
      win={
        <>
          <span className="bch-core">
            <Glyphs
              text={win.core}
              side="W"
              look={(i) => ({ opacity: clamp(typed - i), color: inkMix(passed(sweep, tW.frac("W", i), tW.fe)) })}
            />
          </span>
          <span style={{ opacity: clamp(typed - nW) }}>{win.post}</span>
        </>
      }
    />
  );
};

/* ── b · paint over ── */
const LookB = ({ loss, win, since }: LookProps) => {
  const { boxRef, geo, nL, nW, said, winPre } = useLook(loss, win, since, "b");
  const tL = track(geo, ["L"], nL);
  const tU = track(geo, ["L", "W"], Math.max(nL, nW));
  // the marker strikes the loss's core
  const strike = pen((since - 80) / 380);
  // one bright sweep over both cores' lines: the loss goes under the paint, the win comes up out of it
  const paint = pen((since - 560) / 920);
  // then the paint settles on the win's words alone
  const settle = easeInOut((since - 1520) / 420);
  const winSegs = track(geo, ["W"], nW).segs;
  const painted = tU.upTo(paint).map((s) => {
    const w = winSegs.find((x) => x.row === s.row);
    return w
      ? { ...s, l: lerp(s.l, w.l, settle), r: lerp(s.r, Math.min(s.r, w.r), settle) }
      : { ...s, r: lerp(s.r, s.l, settle) };
  });
  // the strike, where the paint hasn't covered it yet
  const front = tU.upTo(paint);
  const struck = tL.upTo(strike).map((s) => {
    const f = front.find((x) => x.row === s.row);
    const covered = f ? (f.r > f.l + 0.6 ? f.r + f.fs * PAD : s.l) : s.l;
    return { ...s, l: Math.max(s.l, covered) };
  });
  const lastL = tU.frac("L", nL - 1);
  const lastW = tU.frac("W", nW - 1);
  return (
    <Head
      boxRef={boxRef}
      pre={loss.pre}
      winPre={winPre}
      said={said}
      marks={
        <>
          <Bands segs={painted} kind="full" className="bch-band is-bright" />
        </>
      }
      over={<Strikes segs={struck.filter((s) => s.r > s.l)} />}
      loss={
        <>
          <span className="bch-core">
            <Glyphs
              text={loss.core}
              side="L"
              look={(i) => {
                const o = (1 - passed(paint, tU.frac("L", i), tU.fe)) * (1 - 0.18 * strike);
                return o < 1 ? { opacity: o } : undefined;
              }}
            />
          </span>
          <span style={{ opacity: 1 - passed(paint, lastL + tU.fe, tU.fe) }}>{loss.post}</span>
        </>
      }
      win={
        <>
          <span className="bch-core">
            <Glyphs
              text={win.core}
              side="W"
              // the ellipsis, ink while the paint runs under it, white again once it settles on the words
              leadStyle={(() => {
                const p = passed(paint, tU.frac("W", 0), tU.fe);
                return { opacity: p, color: inkMix(p * (1 - settle)) };
              })()}
              look={(i) => {
                const p = passed(paint, tU.frac("W", i), tU.fe);
                return { opacity: p, color: inkMix(1) };
              }}
            />
          </span>
          <span style={{ opacity: passed(paint, lastW + tU.fe, tU.fe) }}>{win.post}</span>
        </>
      }
    />
  );
};

/* ── c · marker correction ── */
const LookC = ({ loss, win, since }: LookProps) => {
  const { boxRef, geo, nL, nW, said, winPre } = useLook(loss, win, since, "c");
  const tL = track(geo, ["L"], nL);
  const tW = track(geo, ["W"], win.core.split(" ").length);
  // the marker strikes the loss's core; it stays, a ghost of it
  const strike = pen((since - 100) / 400);
  const ghost = easeOut((since - 300) / 420);
  // the win, handwritten on the line under it, word by word at the pen's pace
  const T0 = 640;
  const per = Math.min(40, 900 / Math.max(1, nW));
  const written = (since - T0) / per;
  const writeEnd = T0 + nW * per;
  // and underlined by hand, in the same white (as the funnel's labels are once fixed)
  const under = pen((since - writeEnd - 60) / 480);
  return (
    <Head
      boxRef={boxRef}
      pre={loss.pre}
      winPre={winPre}
      said={said}
      marks={null}
      over={
        <>
          <Strikes segs={tL.upTo(strike)} style={{ opacity: 1 - 0.25 * ghost }} />
          <Underlines segs={tW.upTo(under)} />
        </>
      }
      stacked={false}
      loss={
        <>
          <span className="bch-core" style={{ opacity: 1 - 0.6 * ghost }}>
            <Glyphs text={loss.core} side="L" look={() => undefined} />
          </span>
          <span style={{ opacity: 1 - ghost }}>{loss.post}</span>
        </>
      }
      win={
        <span className="bch-hand">
          <Words
            text={win.core}
            side="W"
            leadStyle={{ opacity: clamp(written * 2) }}
            look={(_wi, from, n) => {
              const k = clamp((written - from) / Math.max(1, n));
              return { clipPath: k >= 1 ? undefined : `inset(-30% ${((1 - k) * 100).toFixed(1)}% -30% -8%)` };
            }}
          />
          <span style={{ opacity: clamp(written - nW) }}>{win.post}</span>
        </span>
      }
    />
  );
};

/* ── d · underline marker ── */
const LookD = ({ loss, win, since }: LookProps) => {
  const { boxRef, geo, nL, nW, said, winPre } = useLook(loss, win, since, "d");
  const tL = track(geo, ["L"], nL);
  const tW = track(geo, ["W"], nW);
  // a muted marker under the loss's core while the shopper struggles
  const grey = pen((since + 1300) / 700);
  // at the fix the cores crossfade in place, quickly
  const out = easeOut((since - 140) / 260);
  const enter = easeOut((since - 300) / 300);
  // then the bright marker underlines the win, its words turning ink over it
  const sweep = pen((since - 640) / 560);
  return (
    <Head
      boxRef={boxRef}
      pre={loss.pre}
      winPre={winPre}
      said={said}
      marks={
        <>
          <Bands segs={tL.upTo(grey)} kind="low" className="bch-band is-muted-low" style={{ opacity: 1 - out }} />
          <Bands segs={tW.upTo(sweep)} kind="low" className="bch-band is-bright-low" />
        </>
      }
      loss={
        <>
          <span className="bch-core" style={{ opacity: 1 - out }}>
            <Glyphs text={loss.core} side="L" look={() => undefined} />
            {loss.post}
          </span>
        </>
      }
      win={
        <>
          <span className="bch-core" style={{ opacity: enter }}>
            <Glyphs text={win.core} side="W" look={(i) => ({ color: inkMix(passed(sweep, tW.frac("W", i), tW.fe)) })} />
            {win.post}
          </span>
        </>
      }
    />
  );
};

/* ── e · squeeze ── */
const LookE = ({ loss, win, since }: LookProps) => {
  const { boxRef, geo, nL, said, winPre } = useLook(loss, win, since, "e");
  const words = win.core.split(" ");
  const tL = track(geo, ["L"], nL);
  const tW = track(geo, ["W"], words.length);
  const grey = pen((since + 1300) / 700);
  // the highlighter squeezes into a strike through the loss…
  const squeeze = easeInOut((since - 100) / 320);
  // …the loss goes…
  const gone = easeOut((since - 400) / 300);
  // …the strike slides over to the win's lines, brightening…
  const morph = easeInOut((since - 640) / 360);
  // …and opens back up as a bright highlighter, the win inside it
  const open = easeOut((since - 1000) / 420);
  const lSegs = tL.upTo(grey);
  const wSegs = tW.segs;
  const rows = [...new Set([...lSegs.map((s) => s.row), ...wSegs.map((s) => s.row)])].sort((a, b) => a - b);
  const segs: Seg[] = rows.map((row) => {
    const a = lSegs.find((s) => s.row === row);
    const b = wSegs.find((s) => s.row === row);
    const from = a ?? { ...(b as Seg), r: (b as Seg).l };
    const to = b ?? { ...(a as Seg), r: (a as Seg).l };
    return {
      row,
      l: lerp(from.l, to.l, morph),
      r: lerp(from.r, to.r, morph),
      base: lerp(from.base, to.base, morph),
      fs: lerp(from.fs, to.fs, morph),
    };
  });
  // the band's height on a line: full → a strike → full again
  const thin = squeeze * (1 - open);
  const y = (s: Seg): [number, number] => {
    const [f0, f1] = bandY(s, "full");
    const c = s.base - s.fs * 0.31;
    const h = s.fs * 0.085;
    return [lerp(f0, c - h / 2, thin), lerp(f1, c + h / 2, thin)];
  };
  // the win's words, shown only inside the band as it opens (clipped to it, from the strike's height)
  const reveal = open;
  return (
    <Head
      boxRef={boxRef}
      pre={loss.pre}
      winPre={winPre}
      said={said}
      marks={<Bands segs={segs} kind="full" className="bch-band" style={{ fill: fillMix(morph, squeeze) }} y={y} />}
      loss={
        <>
          <span className="bch-core" style={{ opacity: 1 - gone }}>
            <Glyphs text={loss.core} side="L" look={() => undefined} />
            {loss.post}
          </span>
        </>
      }
      win={
        <>
          <span className="bch-core is-ink">
            <Words
              text={win.core}
              side="W"
              leadStyle={{ opacity: reveal }}
              look={() =>
                reveal >= 1
                  ? undefined
                  : reveal <= 0
                    ? { visibility: "hidden" }
                    : { clipPath: `inset(${(52 * (1 - reveal)).toFixed(1)}% -6% ${(44 * (1 - reveal)).toFixed(1)}% -6%)` }
              }
            />
          </span>
          <span style={{ opacity: reveal }}>{win.post}</span>
        </>
      }
    />
  );
};

const LOOKS: Record<HLLook, (p: LookProps) => JSX.Element> = { a: LookA, b: LookB, c: LookC, d: LookD, e: LookE };

/**
 * ?beat=9: the words are the opener alone ("Buyers with a full cart…"), set
 * once; the sentence ends in the funnel's own label for the stage ("Abandon
 * the cart", struck, then "Buy it ✓"), where and as it already is.
 */
export const BeatOpening = ({ index, numbered }: { index: number; numbered: boolean }) => {
  const s = useSalesCopy();
  return (
    <div className="sl-copy bc bch bch-opener">
      <Kicker index={index} name={stageName(s.titleParts[index])} numbered={numbered} />
      <h3 className="bch-head">
        <span className="bch-pre">{opening(s.openers[index])}</span>
      </h3>
    </div>
  );
};

/**
 * How long after the fix the words start changing (ms): the funnel's label
 * changes first (struck, its solution written and ticked, ~1.4 s), so the
 * eye never has two things changing at once.
 */
export const AFTER_LABEL = 1500;

type Props = {
  look: HLLook;
  index: number;
  t: number;
  fixAt: number;
  numbered: boolean;
  /** How long after the fix the words change (default AFTER_LABEL; 0 where the funnel has no label of its own). */
  delay?: number;
};

const BeatHL = ({ look, index, t, fixAt, numbered, delay = AFTER_LABEL }: Props) => {
  const s = useSalesCopy();
  const loss = splitCore(s.flip[index].problem);
  const win = splitCore(s.flip[index].fix);
  // one change at a time: the funnel's label first (struck, rewritten, ticked), then the words
  const since = t - fixAt - delay;
  const Look = LOOKS[look];
  return (
    <div className={cn("sl-copy bc bch", `bch-${look}`)} data-since={Math.round(since)}>
      {/* (no status chip: the funnel's label says it, one place) */}
      <Kicker index={index} name={stageName(s.titleParts[index])} numbered={numbered} />
      <Look loss={loss} win={win} since={since} />
    </div>
  );
};

export default BeatHL;
