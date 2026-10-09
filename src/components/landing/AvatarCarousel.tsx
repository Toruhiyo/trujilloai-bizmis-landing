import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { useMessages } from "@/i18n/LocaleProvider";
import AgentImage from "./AgentImage";
import type { AgentName } from "./AgentImage";
import { useInView } from "./Reveal";

export type CarouselAvatar = { name: AgentName; label: string; tint: string };

/** One step every AUTOPLAY_MS while untouched and in view. */
const AUTOPLAY_MS = 3200;
/** After the visitor lets go, wait this long before the carousel moves on its own again. */
const RESUME_AFTER_MS = 6000;
/** Distance between neighbours, as a share of the stage width. */
const SPACING = 0.31;
/** Spring that settles the ring on an avatar (near-critical damping: a soft landing, no wobble). */
const STIFFNESS = 120;
const DAMPING = 22;
/** How far a flick carries: seconds of release velocity added before snapping. */
const THROW = 0.32;

const mod = (a: number, n: number) => ((a % n) + n) % n;

/**
 * One avatar at a time, its neighbours peeking in smaller on either side; the
 * spotlight takes the current avatar's shirt colour. The ring is the control:
 * drag it (it follows the finger 1:1), flick it (it carries on with inertia and
 * springs onto the nearest avatar), tap a neighbour, or use the arrow keys.
 * Left alone in view, it steps on with a calm rhythm. Wraps around.
 */
const AvatarCarousel = ({ avatars }: { avatars: readonly CarouselAvatar[] }) => {
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
  const drag = useRef({ startX: 0, startPos: 0, moved: 0, samples: [] as { t: number; x: number }[] });
  const lastTouch = useRef(0);

  const tick = useCallback(() => {
    if (raf.current !== undefined) return;
    let prev = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.032, (now - prev) / 1000);
      prev = now;
      if (!dragging.current) {
        const a = STIFFNESS * (target.current - x.current) - DAMPING * v.current;
        v.current += a * dt;
        x.current += v.current * dt;
        if (Math.abs(target.current - x.current) < 0.0005 && Math.abs(v.current) < 0.0005) {
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
    []
  );

  const goTo = useCallback(
    (to: number, byUser: boolean) => {
      target.current = to;
      if (byUser) lastTouch.current = performance.now();
      tick();
    },
    [tick]
  );

  // a calm rhythm while untouched and in view
  useEffect(() => {
    if (!inView || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (dragging.current || performance.now() - lastTouch.current < RESUME_AFTER_MS) return;
      goTo(Math.round(target.current) + 1, false);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [inView, goTo]);

  const unit = () => (stage.current?.clientWidth ?? 500) * SPACING;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    dragging.current = true;
    lastTouch.current = performance.now();
    drag.current = { startX: e.clientX, startPos: x.current, moved: 0, samples: [{ t: e.timeStamp, x: x.current }] };
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
      className="relative select-none rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bzl-orange)]"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") goTo(Math.round(target.current) + 1, true);
        if (e.key === "ArrowLeft") goTo(Math.round(target.current) - 1, true);
      }}
    >
      <div
        ref={stage}
        className="relative mx-auto aspect-[6/5] w-full max-w-[580px] cursor-grab touch-pan-y active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* the spotlight takes the current shirt colour */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-[8%] aspect-square w-[74%] -translate-x-1/2 rounded-full transition-[background] duration-700"
          style={{
            background: `radial-gradient(closest-side, color-mix(in oklab, ${current.tint} 26%, #fff8f0) 0%, color-mix(in oklab, ${current.tint} 10%, #fffaf4) 62%, transparent 100%)`,
          }}
        />
        <div
          aria-hidden="true"
          className="absolute bottom-[3%] left-1/2 h-[7%] w-[44%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(28,24,20,0.22),transparent)]"
        />

        {/* the ring, fading out toward the edges */}
        <div className="absolute inset-0 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
          {avatars.map((a, i) => {
            // continuous, shortest signed distance from the ring's position
            let off = mod(i - pos, n);
            if (off > n / 2) off -= n;
            const abs = Math.abs(off);
            const scale = 1 - 0.4 * Math.min(abs, 1) - 0.16 * Math.min(Math.max(abs - 1, 0), 1);
            const opacity =
              abs < 1 ? 1 - 0.25 * abs : abs < 2 ? 0.75 - 0.45 * (abs - 1) : Math.max(0, 0.3 - 0.3 * (abs - 2));
            return (
              <div
                key={a.name}
                data-off={Math.round(off)}
                aria-hidden={abs > 0.5}
                className="absolute bottom-[5%] h-[84%] origin-bottom"
                style={{
                  left: `${50 + off * SPACING * 100}%`,
                  transform: `translateX(-50%) scale(${scale})`,
                  opacity,
                  filter: abs < 0.5 ? "none" : `saturate(${1 - 0.25 * Math.min(abs, 1)})`,
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

      <p
        key={current.name}
        aria-live="polite"
        className="bzl-pop mt-3 text-center text-2xl font-bold tracking-[-0.03em] text-[var(--bzl-fg)]"
      >
        {current.label}
      </p>
    </div>
  );
};

export default AvatarCarousel;
