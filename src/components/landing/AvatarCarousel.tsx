import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent, RefObject } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import AgentImage from "./AgentImage";
import type { AgentName } from "./AgentImage";
import { useInView } from "./Reveal";

export type CarouselAvatar = {
  name: AgentName;
  label: string;
  /** The avatar's brand colour (its shirt's, or its logo's on a neutral shirt): the spotlight under it and the name's tint. */
  color?: string;
};

/** The spotlight's colour when an avatar has none: the primary. */
const PRIMARY = "hsl(var(--primary))";

/** One step every AUTOPLAY_MS while untouched and in view. */
const AUTOPLAY_MS = 1600;
/** The first step comes almost at once on arrival, so a visitor scrolling past sees it's a carousel, not one still avatar. */
const FIRST_STEP_MS = 280;
/** After the visitor lets go, wait this long before the carousel moves on its own again. */
const RESUME_AFTER_MS = 4000;
/** Distance between neighbours, as a share of the stage width. */
const SPACING = 0.31;
/** Spring that settles the ring on an avatar (near-critical damping: a soft landing, no wobble). */
const STIFFNESS = 190;
const DAMPING = 27;
/** How far a flick carries: seconds of release velocity added before snapping. */
const THROW = 0.32;

const mod = (a: number, n: number) => ((a % n) + n) % n;

/**
 * One avatar at a time, its neighbours peeking in smaller on either side, in
 * a soft spotlight of the centre avatar's brand colour (the one colour the
 * carousel brings besides the avatars' own shirts and logos; it crossfades
 * from brand to brand as the ring turns, and the big name above the heads
 * takes a muted tint of it). The ring is the control:
 * drag it (it follows the finger 1:1), flick it (it carries on with inertia and
 * springs onto the nearest avatar), tap a neighbour, or use the arrow keys.
 * Left alone in view, it steps on with a brisk rhythm, from the first avatar
 * every time it comes into view, and never runs back: the ring is endless, so
 * after the last avatar comes the first again, in the same direction (its
 * position just keeps counting up; every avatar sits at its index modulo the
 * lineup). Leaving the view resets it to the first. If the visitor moves the
 * ring, it carries on from there once they let it be.
 *
 * The ambient light is the film's demo-store light, in the primary (orange
 * only, whatever the brand): blobs
 * that drift and breathe; dim and fast while the ring is moving, bright and
 * slow at rest, swelling on every new avatar. It's written as CSS variables
 * (--amb-glow, --amb-x/y/s 1–3) on `ambient`, the section, so the light can
 * fill it.
 */
const AvatarCarousel = ({
  avatars,
  ambient,
  stageClassName = "max-w-[min(580px,72svh)]",
}: {
  avatars: readonly CarouselAvatar[];
  ambient?: RefObject<HTMLElement>;
  /** The stage's size (its max width; it's square). */
  stageClassName?: string;
}) => {
  const t = useMessages().landing.carousel;
  const n = avatars.length;
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  const stage = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(0);

  // physics state lives in refs; `pos` mirrors x for rendering
  const x = useRef(0);
  const v = useRef(0);
  const target = useRef(0);
  const raf = useRef<number>();
  const dragging = useRef(false);
  const drag = useRef({
    startX: 0,
    startPos: 0,
    moved: 0,
    samples: [] as { t: number; x: number }[],
  });
  const lastTouch = useRef(0);

  const tick = useCallback(() => {
    if (raf.current !== undefined) return;
    let prev = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.032, (now - prev) / 1000);
      prev = now;
      if (!dragging.current) {
        const a =
          STIFFNESS * (target.current - x.current) - DAMPING * v.current;
        v.current += a * dt;
        x.current += v.current * dt;
        if (
          Math.abs(target.current - x.current) < 0.0005 &&
          Math.abs(v.current) < 0.0005
        ) {
          x.current = target.current;
          v.current = 0;
          setPos(x.current);
          raf.current = undefined;
          return;
        }
      }
      setPos(x.current);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, []);

  useEffect(
    () => () => {
      if (raf.current !== undefined) cancelAnimationFrame(raf.current);
    },
    [],
  );

  const goTo = useCallback(
    (to: number, byUser: boolean) => {
      target.current = to;
      if (byUser) lastTouch.current = performance.now();
      tick();
    },
    [tick],
  );

  // A brisk rhythm while untouched and in view: one step on, every
  // AUTOPLAY_MS, forever (the ring is endless: no pass, no rewind). A touch
  // holds it; RESUME_AFTER_MS after the visitor lets go it steps on again from
  // wherever they left it.
  const [held, setHeld] = useState(false);
  const holdTimer = useRef<number>();
  const holdOn = useCallback(() => {
    setHeld(true);
    window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(() => setHeld(false), RESUME_AFTER_MS);
  }, []);
  useEffect(() => () => window.clearTimeout(holdTimer.current), []);
  const reduced = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  ).current;
  // in view right now (useInView latches; this one follows the view both ways)
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), {
      threshold: 0.15,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  useEffect(() => {
    if (!active || reduced || held) return;
    const step = () => {
      if (!dragging.current) goTo(Math.round(target.current) + 1, false);
    };
    let id = 0;
    const first = window.setTimeout(() => {
      step();
      id = window.setInterval(step, AUTOPLAY_MS);
    }, FIRST_STEP_MS);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [active, reduced, held, goTo]);
  // out of view: back to the first avatar, ready for the next visit
  useEffect(() => {
    if (active) return;
    window.clearTimeout(holdTimer.current);
    setHeld(false);
    if (raf.current !== undefined) cancelAnimationFrame(raf.current);
    raf.current = undefined;
    dragging.current = false;
    x.current = 0;
    target.current = 0;
    v.current = 0;
    setPos(0);
  }, [active]);

  // The ambient light, running while the carousel is in view, on the same
  // rhythm as the names (both follow the ring itself), in the primary only.
  useEffect(() => {
    const el = ambient?.current;
    if (!el || !inView) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let phase = 0;
    let last = performance.now();
    let lastActive = Math.round(x.current);
    let hitAt = -1e9;
    let frame = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const pos = x.current;
      if (Math.round(pos) !== lastActive) {
        lastActive = Math.round(pos);
            hitAt = now;
      }
      if (!still) {
        const go = Math.min(1, Math.abs(v.current) / 3);
        const curve = Math.sin((go * Math.PI) / 2) ** 2;
        // a soft swell on each new avatar: eases in over 0.35 s, out over ~0.8 s
        const t = (now - hitAt) / 1000;
        const hit =
          t < 0.35
            ? Math.sin(((t / 0.35) * Math.PI) / 2)
            : Math.exp(-(t - 0.35) / 0.8);
        phase += dt * (0.35 + 2.2 * curve);
        const breath = Math.sin(now / 1100) ** 2;
        const glow = Math.min(
          1,
          0.46 - 0.2 * curve + 0.24 * breath + 0.38 * hit,
        );
        el.style.setProperty("--amb-glow", glow.toFixed(3));
        for (let j = 1; j <= 3; j++) {
          const ph = phase * (0.42 + 0.13 * j) + j * 1.9;
          el.style.setProperty(
            `--amb-x${j}`,
            `${(Math.sin(ph) * 22).toFixed(2)}%`,
          );
          el.style.setProperty(
            `--amb-y${j}`,
            `${(Math.cos(ph * 0.83) * 16).toFixed(2)}%`,
          );
          el.style.setProperty(
            `--amb-s${j}`,
            (1 + 0.18 * Math.sin(ph * 1.27) + 0.12 * hit).toFixed(3),
          );
        }
      } else {
        el.style.setProperty("--amb-glow", "0.6");
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [ambient, inView, avatars, n]);

  const unit = () => (stage.current?.clientWidth ?? 500) * SPACING;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    dragging.current = true;
    lastTouch.current = performance.now();
    holdOn();
    drag.current = {
      startX: e.clientX,
      startPos: x.current,
      moved: 0,
      samples: [{ t: e.timeStamp, x: x.current }],
    };
    v.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
    tick();
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const dx = e.clientX - drag.current.startX;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
    x.current = drag.current.startPos - dx / unit();
    const s = drag.current.samples;
    s.push({ t: e.timeStamp, x: x.current });
    while (s.length > 2 && e.timeStamp - s[0].t > 90) s.shift();
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    lastTouch.current = performance.now();
    holdOn();
    const s = drag.current.samples;
    const first = s[0];
    const last = s[s.length - 1];
    const span = (last.t - first.t) / 1000;
    const vel = span > 0.008 ? (last.x - first.x) / span : 0;
    v.current = vel;
    // a tap (no real drag) on a neighbour brings it to the centre
    if (drag.current.moved < 6) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const hit = el?.closest<HTMLElement>("[data-off]");
      const off = hit ? Number(hit.dataset.off) : 0;
      goTo(Math.round(x.current) + off, true);
      return;
    }
    goTo(Math.round(x.current + vel * THROW), true);
  };

  const current = avatars[mod(Math.round(pos), n)];

  return (
    <div
      ref={ref}
      role="region"
      aria-roledescription="carousel"
      aria-label={t.label}
      tabIndex={0}
      className="relative select-none rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          holdOn();
          goTo(Math.round(target.current) + 1, true);
        }
        if (e.key === "ArrowLeft") {
          holdOn();
          goTo(Math.round(target.current) - 1, true);
        }
      }}
    >
      <div
        ref={stage}
        className={`relative mx-auto aspect-square w-full ${stageClassName} cursor-grab touch-pan-y active:cursor-grabbing`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* the spotlight and its floor glow, in the centre avatar's brand colour: one layer per brand,
            each as strong as its avatar is close to the centre, so the colour crossfades as the ring turns */}
        {avatars.map((a, i) => {
          let off = mod(i - pos, n);
          if (off > n / 2) off -= n;
          const o = Math.max(0, 1 - Math.abs(off));
          if (o === 0) return null;
          const c = a.color ?? PRIMARY;
          return (
            <div
              key={a.name}
              aria-hidden="true"
              className="absolute inset-0"
              style={{ opacity: o }}
            >
              <div
                className="absolute left-1/2 top-[8%] aspect-square w-[74%] -translate-x-1/2 rounded-full"
                style={{
                  background: `radial-gradient(closest-side, color-mix(in oklab, ${c} 26%, #fffaf4) 0%, color-mix(in oklab, ${c} 9%, #fffcf8) 62%, transparent 100%)`,
                  opacity: "calc(0.55 + 0.45 * var(--amb-glow, 0.6))",
                }}
              />
              <div
                className="absolute bottom-[1%] left-1/2 h-[14%] w-[62%] -translate-x-1/2 rounded-[50%]"
                style={{
                  background: `radial-gradient(closest-side, color-mix(in oklab, ${c} 34%, transparent), color-mix(in oklab, ${c} 10%, transparent) 60%, transparent)`,
                  opacity: "calc(0.6 + 0.4 * var(--amb-glow, 0.6))",
                }}
              />
            </div>
          );
        })}
        <div
          aria-hidden="true"
          className="absolute bottom-[3%] left-1/2 h-[7%] w-[44%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(28,24,20,0.22),transparent)]"
        />

        {/* the name, huge and soft, above the heads, in a muted tint of its brand colour: it slides and fades with its avatar */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[25%] overflow-hidden"
        >
          {avatars.map((a, i) => {
            let off = mod(i - pos, n);
            if (off > n / 2) off -= n;
            const o = Math.max(0, 1 - Math.abs(off) * 1.6);
            if (o === 0) return null;
            return (
              <span
                key={a.name}
                className="absolute left-1/2 top-0 whitespace-nowrap text-[clamp(3rem,min(7.5vw,11svh),6.5rem)] font-extrabold leading-[0.9] tracking-[-0.06em]"
                style={{
                  transform: `translateX(calc(-50% + ${off * -18}%))`,
                  opacity: o,
                  color: `color-mix(in oklab, color-mix(in oklab, ${a.color ?? PRIMARY} 62%, #9c8a7c) 32%, transparent)`,
                }}
              >
                {a.label}
              </span>
            );
          })}
        </div>

        {/* the ring, fading out toward the edges */}
        <div className="absolute inset-0 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
          {avatars.map((a, i) => {
            // continuous, shortest signed distance from the ring's position
            let off = mod(i - pos, n);
            if (off > n / 2) off -= n;
            const abs = Math.abs(off);
            const scale =
              1 -
              0.4 * Math.min(abs, 1) -
              0.16 * Math.min(Math.max(abs - 1, 0), 1);
            const opacity =
              abs < 1
                ? 1 - 0.25 * abs
                : abs < 2
                  ? 0.75 - 0.45 * (abs - 1)
                  : Math.max(0, 0.3 - 0.3 * (abs - 2));
            return (
              <div
                key={a.name}
                data-off={Math.round(off)}
                aria-hidden={abs > 0.5}
                className="absolute bottom-[4%] h-[72%] origin-bottom"
                style={{
                  left: `${50 + off * SPACING * 100}%`,
                  transform: `translateX(-50%) scale(${scale})`,
                  opacity,
                  filter:
                    abs < 0.5
                      ? "none"
                      : `saturate(${1 - 0.25 * Math.min(abs, 1)})`,
                  zIndex: 100 - Math.round(abs * 10),
                  visibility: opacity <= 0.01 ? "hidden" : "visible",
                }}
              >
                <AgentImage
                  name={a.name}
                  alt={abs < 0.5 ? a.label : ""}
                  sizes="(min-width: 1024px) 260px, 45vw"
                  className="pointer-events-none h-full w-auto"
                />
              </div>
            );
          })}
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {current.label}
      </p>
    </div>
  );
};

export default AvatarCarousel;
