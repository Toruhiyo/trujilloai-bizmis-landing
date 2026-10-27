import { useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  FaBolt,
  FaBox,
  FaCheck,
  FaGlobe,
  FaPercent,
  FaShieldAlt,
  FaShopify,
  FaShoppingCart,
  FaSync,
  FaTag,
  FaUsers,
} from "react-icons/fa";
import { cn } from "@/lib/utils";
import { useMessages } from "@/i18n/LocaleProvider";
import Reveal from "./Reveal";
import { ScreenFx } from "./devices";
import { RewindMark } from "./RewindSign";
import { span } from "./useRewindLoop";
import {
  bump,
  easeInOut,
  easeOutBack,
  useMedia,
  useOnScreen,
  usePinProgress,
  useReducedMotion,
  useScrollPlay,
  useScrollThrough,
} from "./sales/hooks";
import RewindScreen from "./sales/RewindScreen";

// Same order as messages.setup.dataCards (as on the classic landing).
const ICONS = [FaGlobe, FaTag, FaPercent, FaShieldAlt, FaUsers, FaBox];

/** The timeline, in ms along the section's scroll clock. */
const CURSOR_AT = 400;
const PRESS_AT = 1300;
const SYNC_AT = 1500;
const CARD_EVERY = 160;
/** When card `i` ticks (and its wire starts drawing to the agent). */
const cardAt = (i: number) => SYNC_AT + 200 + i * CARD_EVERY;
/** The charge-up clip (scripts/setup-charge-anim.py): 92 frames at 24 fps. */
const FPS = 24;
const FRAMES = 92;
const CHARGE_MS = (FRAMES / FPS) * 1000;
/** After the charge, the sparks keep flowing a while: the end of the timeline. */
const FLOW_MS = 600;
/** One breath of the charge's aura and rim (ms). */
const BREATH = 2000;
/**
 * The clip as an image sequence (scripts/encode-setup-charge.sh): each frame
 * cropped to the box the figure moves in (in the 720x1200 render) and drawn on
 * a canvas there; the poster (the full first frame, the idle pose the clip
 * starts and ends on) shows until the frames are in.
 */
const CHARGE = {
  poster: "/landing/setup/charge-poster.webp",
  frame: (i: number) => `/landing/setup/charge/${String(i).padStart(2, "0")}.webp`,
  crop: { left: 104, top: 126, width: 504, height: 984 },
  w: 720,
  h: 1200,
};
/**
 * Pinned (screens tall enough, as Boost Sales: phones too): the section is one
 * screen, sticky at the top (its content under the nav) while the page scrolls
 * through a track TRACK screens longer than it; of that scroll, a short
 * lead-in, then the timeline, then a hold on its end before the page carries
 * on. TRACK sets the scroll per second of animation: about Customer Support's
 * (its 10.5 s scene over 0.8 of a 1.7-screen track, ~0.13 screens a second).
 */
const PIN_QUERY = "(min-height: 540px)";
const TRACK = 1.2;
const PIN_LEAD = 0.04;
const PIN_RUN = 0.8;
/** Not pinned (short screens): of the visual's own scroll through the screen, a lead-in, the timeline, a hold. */
const LEAD = 0.05;
const RUN = 0.7;

type Line = { d: string; pts: [number, number][]; dur: number; delay: number };

/** A wire's cubic, resampled into points evenly spaced along its length (a spark rides it at an even speed). */
const evenPoints = (p: [number, number][], n = 64): [number, number][] => {
  const [a, b, c, d] = p;
  const at = (s: number): [number, number] => {
    const u = 1 - s;
    return [
      u * u * u * a[0] + 3 * u * u * s * b[0] + 3 * u * s * s * c[0] + s * s * s * d[0],
      u * u * u * a[1] + 3 * u * u * s * b[1] + 3 * u * s * s * c[1] + s * s * s * d[1],
    ];
  };
  const fine = Array.from({ length: 241 }, (_, i) => at(i / 240));
  const len = [0];
  for (let i = 1; i < fine.length; i++)
    len.push(len[i - 1] + Math.hypot(fine[i][0] - fine[i - 1][0], fine[i][1] - fine[i - 1][1]));
  const total = len[len.length - 1] || 1;
  const out: [number, number][] = [];
  let j = 0;
  for (let k = 0; k <= n; k++) {
    const want = (k / n) * total;
    while (j < len.length - 2 && len[j + 1] < want) j++;
    const f = (want - len[j]) / Math.max(1e-6, len[j + 1] - len[j]);
    out.push([fine[j][0] + (fine[j + 1][0] - fine[j][0]) * f, fine[j][1] + (fine[j + 1][1] - fine[j][1]) * f]);
  }
  return out;
};
/** The point `u` (0..1) of the way along evenly spaced points. */
const pointAt = (pts: [number, number][], u: number) => {
  const x = Math.min(pts.length - 1, Math.max(0, u * (pts.length - 1)));
  const i = Math.min(pts.length - 2, Math.floor(x));
  const f = x - i;
  return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f];
};

/** The aura's breath (as the classic's keyframes: in by 35%, out by 70%, then rest), `k` 0..1 of one breath. */
const breath = (ms: number) => {
  const k = (((ms / BREATH) % 1) + 1) % 1;
  if (k < 0.35) return { o: easeInOut(k / 0.35), s: 0.5 + 0.5 * easeInOut(k / 0.35) };
  if (k < 0.7) return { o: 1 - easeInOut((k - 0.35) / 0.35), s: 1 + 0.08 * easeInOut((k - 0.35) / 0.35) };
  return { o: 0, s: 1.08 };
};

/**
 * True for a moment whenever `t` goes backwards while `on` (as Customer
 * Support's), but not on the frame the clock comes on: a clock picked up
 * mid-scroll starts where the scroll is, which is no rewind.
 */
const useRewindingOn = (t: number, on: boolean, linger = 420) => {
  const last = useRef(t);
  const was = useRef(on);
  const timer = useRef(0);
  const [back, setBack] = useState(false);
  useEffect(() => {
    if (on && was.current && t < last.current - 1) {
      setBack(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setBack(false), linger);
    }
    last.current = t;
    was.current = on;
  }, [t, on, linger]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return back;
};

/** Puts the tape look (RewindScreen's) over the whole setup visual, as a device frame puts it over its screen. */
const Tape = ({ children }: { children: ReactNode }) => {
  const fx = useContext(ScreenFx);
  return <>{fx ? fx(children) : children}</>;
};

/**
 * The charge clip, scrubbed: draws frame `frame` of the image sequence on a
 * canvas whenever it changes (or comes in), the nearest earlier frame that is
 * in while it loads, the poster before any. Starts loading when the section
 * is near; never with reduced motion (the clip ends on the poster's pose).
 */
const ChargeClip = ({ frame, load, rim, label }: { frame: number; load: boolean; rim: number; label: string }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const imgs = useRef<(HTMLImageElement | null)[]>([]);
  const want = useRef(frame);
  const drawn = useRef(-1);
  const [ready, setReady] = useState(false);
  want.current = frame;

  const draw = useCallback(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    let i = want.current;
    while (i >= 0 && !imgs.current[i]) i--;
    if (i < 0) i = imgs.current.findIndex(Boolean);
    if (i < 0 || i === drawn.current) return;
    const img = imgs.current[i]!;
    if (c.width !== img.naturalWidth) {
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
    }
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0);
    drawn.current = i;
    setReady(true);
  }, []);

  useEffect(() => {
    if (!load || imgs.current.length) return;
    imgs.current = Array(FRAMES).fill(null);
    let live = true;
    for (let i = 0; i < FRAMES; i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = CHARGE.frame(i);
      img
        .decode()
        .then(() => {
          if (!live) return;
          imgs.current[i] = img;
          // a closer frame came in: show it
          if (i <= want.current && i > drawn.current) draw();
          else if (drawn.current < 0) draw();
        })
        .catch(() => undefined);
    }
    return () => {
      live = false;
    };
  }, [load, draw]);

  useEffect(() => {
    if (frame !== drawn.current) draw();
  }, [frame, draw]);

  const { crop } = CHARGE;
  return (
    <div role="img" aria-label={label} className="absolute inset-0">
      <img
        src={CHARGE.poster}
        alt=""
        aria-hidden="true"
        className={cn("absolute inset-0 h-full w-full object-contain", ready && "opacity-0")}
      />
      <canvas
        ref={canvas}
        aria-hidden="true"
        className={cn("absolute", !ready && "opacity-0")}
        style={{
          left: `${(crop.left / CHARGE.w) * 100}%`,
          top: `${(crop.top / CHARGE.h) * 100}%`,
          width: `${(crop.width / CHARGE.w) * 100}%`,
          height: `${(crop.height / CHARGE.h) * 100}%`,
          // the charge's rim of light, breathing with the aura
          filter:
            rim > 0.01
              ? `drop-shadow(0 0 ${(10 * rim).toFixed(1)}px rgb(249 163 83 / ${(0.55 * rim).toFixed(3)})) drop-shadow(0 0 ${(2 * rim).toFixed(1)}px rgb(255 214 160 / ${(0.7 * rim).toFixed(3)}))`
              : undefined,
        }}
      />
    </div>
  );
};

/**
 * Setup on /v2: one click and the store is wired to the agent, right away. A
 * cursor clicks the Install button, the store's data cards sync in a quick
 * ripple (each one's wire draws to the agent as it ticks), and the agent
 * (Will, full figure, in a rendered anime-style charge-up: squeezed eyes,
 * gritted teeth, a shout on the burst) charges up with it while round sparks
 * of energy travel every wire, card → agent. The wires are drawn from the real
 * positions of the cards and the agent, so they always land.
 *
 * One clock, the scroll's (as Customer Support and Boost Sales, useScrollPlay).
 * The section pins (see TRACK): while it plays the page holds and the scroll
 * drives it; scrolling on plays the timeline (as fast as the scroll), scrolling
 * back rewinds it to the scroll, at rest it plays on at 1x, holds the end,
 * rewinds and plays again; past its end the page carries on. Short screens
 * don't pin: the visual's own way through the screen drives it. Everything is drawn from `t`, the clip too (an image
 * sequence on a canvas, so it scrubs both ways at once); while it rewinds the
 * visual goes analog (RewindScreen's tape) and the marker ◀◀ shows. At the end
 * the sparks and the aura keep flowing by themselves. Reduced motion shows the
 * end state.
 */
const SetupSection = () => {
  const messages = useMessages();
  const setup = messages.setup;
  const copy = messages.landing.setup;
  const reduced = useReducedMotion();
  const pinned = useMedia(PIN_QUERY) && !reduced;
  const [section, progress] = usePinProgress<HTMLElement>();
  const [pin, onScreen] = useOnScreen<HTMLDivElement>(0.2);
  const [ref, p] = useScrollThrough<HTMLDivElement>(0.7, 0.45);
  const fit = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const box = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLLIElement | null)[]>([]);
  const target = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [button, setButton] = useState({ x: 0, y: 0 });

  const n = setup.dataCards.length;
  const doneAt = cardAt(n - 1) + 150 + CARD_EVERY;
  const duration = doneAt + CHARGE_MS + FLOW_MS;

  // the scroll clock: pinned, the track's progress (the page holds while it plays); else the visual's way through the screen
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  // (only while it's held: before the pin the page brings it in at its start, after it the end stays)
  const through = p > 0 && p < 1;
  const held = onScreen && progress > 0 && progress < 1;
  const active = !reduced && (pinned ? held : through);
  const goal = pinned ? clamp01((progress - PIN_LEAD) / PIN_RUN) : clamp01((p - LEAD) / RUN);
  const play = useScrollPlay(goal * duration, duration, active);
  const t = reduced ? duration : Math.min(duration, Math.max(0, play));
  const rewinding = useRewindingOn(t, active);

  // pinned, the screen's content kept whole: scaled down if it comes out taller than the screen
  useEffect(() => {
    const el = fit.current;
    const room = pin.current;
    if (!pinned || !el || !room || typeof ResizeObserver === "undefined") {
      setScale(1);
      return;
    }
    const check = () => {
      const cs = getComputedStyle(room);
      const avail = room.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      setScale(Math.min(1, avail / Math.max(1, el.offsetHeight)));
    };
    const ro = new ResizeObserver(check);
    ro.observe(el);
    ro.observe(room);
    check();
    return () => ro.disconnect();
  }, [pinned, pin]);

  // at the end (held, or scrolled past while still on screen) the sparks and the aura flow on by themselves
  const flowing = !reduced && onScreen && t >= duration;
  const [extra, setExtra] = useState(0);
  useEffect(() => {
    if (!flowing) {
      setExtra(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      setExtra(now - start);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [flowing]);
  const ft = t + (flowing ? extra : 0);

  // load the clip's frames once the section is near
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = section.current;
    if (!el || near || reduced) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "150% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [section, near, reduced]);

  // wire each card to the agent's chest, from the real layout
  const measure = useCallback(() => {
    const el = box.current;
    const b = el?.getBoundingClientRect();
    const tg = target.current?.getBoundingClientRect();
    if (!el || !b || !tg || !el.offsetWidth) return;
    // in the box's own (unscaled) pixels: the pinned screen may be scaled down to fit
    const k = b.width / el.offsetWidth;
    const x2 = (tg.left + tg.width * 0.5 - b.left) / k;
    const y2 = (tg.top + tg.height * 0.6 - b.top) / k; // the chest, under the shirt logo
    setSize({ w: el.offsetWidth, h: el.offsetHeight });
    const first = cards.current[0]?.getBoundingClientRect();
    const last = cards.current[cards.current.length - 1]?.getBoundingClientRect();
    if (first && last) {
      // the Install button sits in the gap between the cards and the agent
      setButton({ x: ((first.right + tg.left) / 2 - b.left) / k, y: ((first.top + last.bottom) / 2 - b.top) / k });
    }
    setLines(
      cards.current.map((el, i) => {
        const r = el?.getBoundingClientRect();
        // each wire's own rhythm (fixed per wire, so a replay is the same)
        const dur = 2.4 + ((i * 0.618) % 1) * 1.4;
        const delay = ((i * 0.382 + 0.17) % 1) * 2;
        if (!r) return { d: "", pts: [], dur, delay };
        const x1 = (r.right - b.left) / k;
        const y1 = (r.top + r.height / 2 - b.top) / k;
        const dx = x2 - x1;
        const ctl: [number, number][] = [
          [x1, y1],
          [x1 + dx * 0.45, y1],
          [x2 - dx * 0.5, y2],
          [x2, y2],
        ];
        const f = (v: number) => v.toFixed(1);
        return {
          d: `M${f(x1)} ${f(y1)} C${f(ctl[1][0])} ${f(ctl[1][1])}, ${f(ctl[2][0])} ${f(ctl[2][1])}, ${f(x2)} ${f(y2)}`,
          pts: evenPoints(ctl),
          dur,
          delay,
        };
      }),
    );
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    // the reveals lift the cards and the agent in: measure once they've landed
    el.addEventListener("transitionend", measure);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => {
      el.removeEventListener("transitionend", measure);
      ro?.disconnect();
    };
  }, [measure]);
  useEffect(() => {
    if (!onScreen) return;
    const id = window.setTimeout(measure, 1000);
    return () => window.clearTimeout(id);
  }, [onScreen, measure, scale, pinned]);

  // the timeline, all from t
  const syncing = t >= SYNC_AT && t < doneAt;
  const done = t >= doneAt;
  const label = done ? copy.synced : syncing ? copy.syncing : copy.install;
  const buttonIn = easeInOut(span(t, CURSOR_AT, CURSOR_AT + 500));
  const buttonOut = easeInOut(span(t, doneAt + 700, doneAt + 1200));
  const press = bump(t, PRESS_AT - 50, 300);
  const cursorIn = 1 - (1 - span(t, CURSOR_AT, CURSOR_AT + 700)) ** 3;
  const cursorOut = 1 - (1 - span(t, SYNC_AT, SYNC_AT + 700)) ** 3;
  const cx = 64 + (4 - 64) * cursorIn + (32 - 4) * cursorOut;
  const cy = 56 + (4 - 56) * cursorIn + (40 - 4) * cursorOut;
  const frame = Math.min(FRAMES - 1, Math.max(0, Math.floor(((t - doneAt) * FPS) / 1000)));
  const auraOn = reduced ? 0 : span(t, doneAt, doneAt + 700);
  const aura = breath(ft - doneAt);
  const auraWide = breath(ft - doneAt - 120);
  const rim = t >= doneAt && t < doneAt + CHARGE_MS ? breath(t - doneAt).o * Math.min(1, span(t, doneAt, doneAt + 300), 1 - span(t, doneAt + CHARGE_MS - 300, doneAt + CHARGE_MS)) : 0;

  return (
    <section
      ref={section}
      id="setup"
      className={cn("relative", pinned ? "bzl-setup-track" : "bzl-section bzl-screen overflow-hidden bzl-setup-ground")}
      style={pinned ? { height: `${(1 + TRACK) * 100}svh` } : undefined}
    >
      {/* pinned: the one screen, sticky under the nav while the page scrolls the track */}
      <div ref={pin} className={cn(pinned && "bzl-setup-pin bzl-setup-ground")}>
        {/* the classic landing's warm glow around the section's edges */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-48 top-[10%] h-[45%] w-96 rounded-[50%] bg-[rgba(249,163,83,0.28)] blur-[80px]" />
          <div className="absolute -right-48 bottom-[8%] h-[45%] w-96 rounded-[50%] bg-[rgba(249,163,83,0.26)] blur-[80px]" />
          <div className="absolute -top-40 left-[20%] h-56 w-[60%] rounded-[50%] bg-[rgba(249,163,83,0.18)] blur-[80px]" />
        </div>

        <div
          ref={fit}
          className="bzl-wrap relative w-full"
          style={scale < 1 ? { transform: `scale(${scale.toFixed(3)})` } : undefined}
        >
          <div className="mx-auto max-w-3xl text-center">
            {/* its own centred header, the kicker over the title */}
            <Reveal>
              <p className="bzl-kicker">{setup.badge}</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="bzl-statement-sm mt-3">{copy.title}</h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="bzl-lead mx-auto mt-[2svh] max-w-2xl">{copy.lead}</p>
            </Reveal>
          </div>

          {/* ph-no-capture: the session recorder would log every animated frame of it */}
          <div ref={ref} className="ph-no-capture relative mx-auto mt-[4svh] flow-root max-w-5xl">
            {/* ◀◀ while the setup rewinds (the marker's, as the other sections') */}
            <RewindMark on={rewinding} className="is-setup" />
            <div className="bzl-setup-tape">
              <RewindScreen on={rewinding}>
                <Tape>
                  <div ref={box} className="relative flex items-center justify-between gap-3 sm:gap-12">
                    {/* the wiring, behind the cards and the agent */}
                    <svg
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 overflow-visible"
                      width={size.w}
                      height={size.h}
                      viewBox={`0 0 ${size.w || 1} ${size.h || 1}`}
                    >
                      {/* marker line art (as the Sales funnel): flat primary strokes, solid dots for the energy */}
                      <g className="bzl-setup-wires">
                        {lines.map((l, i) => {
                          if (!l.d) return null;
                          const draw = easeInOut(span(t, cardAt(i), cardAt(i) + 1100));
                          const sparks = span(t, doneAt, doneAt + 250);
                          return (
                            <g key={i}>
                              <path
                                d={l.d}
                                pathLength={1000}
                                fill="none"
                                className="bzl-setup-wire"
                                style={{ strokeDasharray: 1000, strokeDashoffset: 1000 * (1 - draw), opacity: draw > 0 ? 1 : 0 }}
                              />
                              {/* the energy: solid marker dots travelling card → agent, two per wire */}
                              {sparks > 0 &&
                                [0, 0.5].map((offset) => {
                                  const u = (((ft - doneAt) / 1000 + l.delay) / l.dur + offset) % 1;
                                  const [x, y] = pointAt(l.pts, u);
                                  return (
                                    <circle
                                      key={offset}
                                      className="bzl-setup-spark"
                                      r={6}
                                      cx={x}
                                      cy={y}
                                      style={{ opacity: sparks }}
                                    />
                                  );
                                })}
                            </g>
                          );
                        })}
                      </g>
                    </svg>

                    {/* Your Shopify store data, syncing card by card */}
                    <Reveal className="relative z-10 w-full max-w-[min(20rem,52%)] rounded-[26px] border border-[color-mix(in_oklab,hsl(var(--primary))_22%,transparent)] bg-white/75 p-3 shadow-[0_30px_70px_-40px_rgba(249,163,83,0.45)] backdrop-blur-md sm:p-4">
                      <p className="flex items-center justify-center gap-2 pb-3 pt-1 text-center text-sm font-semibold leading-tight text-[hsl(var(--primary))] sm:text-base">
                        <FaShopify className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                        {setup.storeDataTitle}
                      </p>
                      <ul className="grid gap-[max(0.375rem,0.9svh)]">
                        {setup.dataCards.map((card, i) => {
                          const Icon = ICONS[i];
                          const k = span(t, cardAt(i), cardAt(i) + 300);
                          return (
                            <li
                              key={card.title}
                              ref={(el) => (cards.current[i] = el)}
                              className="group relative flex h-[clamp(2.4rem,5.4svh,3.5rem)] items-center gap-2 overflow-hidden rounded-2xl bg-white/70 px-2.5 shadow-[0_4px_20px_-4px_rgba(28,24,20,0.06),0_2px_8px_-2px_rgba(249,163,83,0.1)] sm:gap-3 sm:px-3.5"
                              style={{ opacity: 0.6 + 0.4 * k }}
                            >
                              {/* synced: the card takes the primary's tint */}
                              <span
                                aria-hidden="true"
                                className="absolute inset-0 bg-[color-mix(in_oklab,hsl(var(--primary))_11%,#fff)]"
                                style={{ opacity: k }}
                              />
                              {/* the classic cards' Shopify watermark */}
                              <FaShopify
                                aria-hidden="true"
                                className="absolute -right-1 top-1/2 h-10 w-10 -translate-y-1/2 text-[hsl(var(--primary))] opacity-[0.12]"
                              />
                              <Icon className="relative h-[1.05rem] w-[1.05rem] flex-shrink-0 text-[color-mix(in_oklab,hsl(var(--primary))_75%,transparent)]" />
                              <span className="relative min-w-0 flex-1 text-[13px] font-semibold leading-tight tracking-[-0.01em] text-[var(--bzl-fg)] sm:truncate sm:text-base">
                                {card.title}
                              </span>
                              <span
                                aria-hidden="true"
                                className="relative grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-[hsl(var(--primary))] text-white"
                                style={{ opacity: k, transform: `scale(${0.5 + 0.5 * easeOutBack(k)})` }}
                              >
                                <FaCheck className="h-2.5 w-2.5" />
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </Reveal>

                    {/* one click: the Install button between the store and the agent, clicked by the cursor */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute z-20"
                      style={{
                        left: button.x,
                        top: button.y,
                        opacity: buttonIn * (1 - buttonOut),
                        transform: `translate(-50%, ${-50 - 30 * buttonOut}%)`,
                      }}
                    >
                      <span
                        className={cn(
                          "flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold shadow-[0_14px_30px_-12px_rgba(249,163,83,0.6)] transition-[background-color,color] duration-200 sm:text-base",
                          t >= SYNC_AT
                            ? "bg-white text-[hsl(var(--primary))] ring-1 ring-[color-mix(in_oklab,hsl(var(--primary))_35%,transparent)]"
                            : "bg-[hsl(var(--primary))] text-white",
                        )}
                        style={{ transform: `scale(${1 - 0.1 * press})` }}
                      >
                        {syncing ? (
                          <FaSync className="h-3.5 w-3.5" style={{ transform: `rotate(${((t - SYNC_AT) * 0.36).toFixed(1)}deg)` }} />
                        ) : done ? (
                          <FaCheck className="h-3.5 w-3.5" />
                        ) : (
                          <FaShopify className="h-4 w-4" />
                        )}
                        {label}
                      </span>
                      {/* the cursor glides in and clicks */}
                      <svg
                        viewBox="0 0 24 24"
                        className="absolute left-1/2 top-1/2 h-6 w-6 drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)]"
                        style={{
                          opacity: cursorIn * (1 - cursorOut),
                          transform: `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px) scale(${1 - 0.1 * press})`,
                        }}
                      >
                        <path d="M4 2l15 9-6.5 1.6L16 20l-3 1.4-3.5-7.4L4 18z" fill="#1c1814" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
                      </svg>
                    </div>

                    {/* the agent, charging up as the energy lands */}
                    <Reveal delay={150} className="relative z-10 flex flex-shrink-0 justify-center sm:mr-[4%]">
                      <div ref={target} className="relative aspect-[720/1199] h-[clamp(12rem,32svh,26rem)] sm:h-[clamp(14rem,40svh,26rem)]">
                        <span
                          aria-hidden="true"
                          className="bzl-charge-aura absolute left-1/2 top-1/2 aspect-square w-[150%] rounded-full"
                          style={{ opacity: auraOn * aura.o, scale: String(aura.s) }}
                        />
                        <span
                          aria-hidden="true"
                          className="bzl-charge-aura is-wide absolute left-1/2 top-1/2 aspect-square w-[200%] rounded-full"
                          style={{ opacity: auraOn * auraWide.o, scale: String(auraWide.s) }}
                        />
                        <div
                          aria-hidden="true"
                          className="absolute inset-x-[-25%] bottom-[-3%] h-[10%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(249,163,83,0.3),transparent)]"
                        />
                        {/* the charge-up, anime style (a rendered clip: squeezed eyes, gritted teeth, a shout on the burst), scrubbed from t */}
                        <ChargeClip frame={frame} load={near && !reduced} rim={rim} label={messages.landing.agentAlt} />
                      </div>
                    </Reveal>
                  </div>
                </Tape>
              </RewindScreen>
            </div>
          </div>

          <Reveal className="mt-[3.5svh] text-center">
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-semibold text-[var(--bzl-ink-2)]">
              {[
                { Icon: FaBolt, label: setup.badges.oneClick },
                { Icon: FaSync, label: setup.badges.alwaysSynced },
                { Icon: FaShoppingCart, label: copy.readyNow },
              ].map(({ Icon, label }) => (
                <span key={label} className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-[var(--bzl-orange-strong)]" />
                  {label}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default SetupSection;
