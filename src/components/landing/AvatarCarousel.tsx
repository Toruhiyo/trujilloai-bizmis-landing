import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import AgentImage from "./AgentImage";
import type { AgentName } from "./AgentImage";
import { useInView } from "./Reveal";

export type CarouselAvatar = { name: AgentName; label: string; tint: string };

const AUTOPLAY_MS = 2800;
/** After a visitor picks one, let it sit before the carousel moves on again. */
const RESUME_AFTER_MS = 9000;

/**
 * One avatar at a time, with its neighbours peeking in smaller on either side
 * (the Apple-Watch-Studio pattern): the stage's spotlight takes the current
 * avatar's shirt colour, and a row of shirt swatches below jumps straight to
 * any look. Moves on by itself while in view; arrows, swatches, a click on a
 * neighbour, swipes and the arrow keys all work. Wraps around.
 */
const AvatarCarousel = ({
  avatars,
}: {
  avatars: readonly CarouselAvatar[];
}) => {
  const t = useMessages().landing.carousel;
  const n = avatars.length;
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const resume = useRef<number>();
  const drag = useRef<number | null>(null);

  const go = useCallback(
    (i: number, byUser = true) => {
      setActive(((i % n) + n) % n);
      if (!byUser) return;
      setHeld(true);
      window.clearTimeout(resume.current);
      resume.current = window.setTimeout(() => setHeld(false), RESUME_AFTER_MS);
    },
    [n],
  );

  useEffect(() => () => window.clearTimeout(resume.current), []);

  useEffect(() => {
    if (
      !inView ||
      held ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const timer = window.setInterval(
      () => setActive((a) => (a + 1) % n),
      AUTOPLAY_MS,
    );
    return () => window.clearInterval(timer);
  }, [inView, held, n]);

  const onPointerDown = (e: PointerEvent) => {
    drag.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (drag.current === null) return;
    const dx = e.clientX - drag.current;
    drag.current = null;
    if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
  };

  const current = avatars[active];

  return (
    <div
      ref={ref}
      role="region"
      aria-roledescription="carousel"
      aria-label={t.label}
      className="relative select-none"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(active + 1);
        if (e.key === "ArrowLeft") go(active - 1);
      }}
    >
      {/* Stage */}
      <div
        className="relative mx-auto aspect-[6/5] w-full max-w-[580px] touch-pan-y"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = null)}
      >
        {/* avatars fade out toward the edges */}
        <div className="absolute inset-0 [mask-image:linear-gradient(90deg,transparent,#000_14%,#000_86%,transparent)]">
          {/* the spotlight takes the current shirt colour */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-[8%] aspect-square w-[78%] -translate-x-1/2 rounded-full transition-[background] duration-700"
            style={{
              background: `radial-gradient(closest-side, color-mix(in oklab, ${current.tint} 26%, #fff8f0) 0%, color-mix(in oklab, ${current.tint} 10%, #fffaf4) 62%, transparent 100%)`,
            }}
          />
          <div
            aria-hidden="true"
            className="absolute bottom-[3%] left-1/2 h-[7%] w-[46%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(28,24,20,0.22),transparent)]"
          />

          {avatars.map((a, i) => {
            // shortest signed distance around the ring
            let off = i - active;
            if (off > n / 2) off -= n;
            if (off < -n / 2) off += n;
            const abs = Math.abs(off);
            const visible = abs <= 2;
            return (
              <button
                key={a.name}
                type="button"
                tabIndex={off === 0 ? 0 : -1}
                aria-label={a.label}
                aria-current={off === 0}
                onClick={() => off !== 0 && go(i)}
                className={cn(
                  "absolute bottom-[5%] left-1/2 h-[84%] origin-bottom transition-[transform,opacity,filter] duration-700 focus-visible:outline-none",
                  off === 0 ? "cursor-default" : "cursor-pointer",
                )}
                style={{
                  transform: `translateX(calc(-50% + ${off * 92}%)) scale(${off === 0 ? 1 : abs === 1 ? 0.6 : 0.42})`,
                  opacity: !visible
                    ? 0
                    : off === 0
                      ? 1
                      : abs === 1
                        ? 0.75
                        : 0.3,
                  filter: off === 0 ? "none" : "saturate(0.75)",
                  zIndex: 10 - abs,
                  transitionTimingFunction: "var(--bzl-spring)",
                  pointerEvents: visible ? "auto" : "none",
                }}
              >
                <AgentImage
                  name={a.name}
                  alt=""
                  sizes="(min-width: 1024px) 260px, 45vw"
                  className="h-full w-auto"
                />
              </button>
            );
          })}
        </div>

        {/* arrows */}
        {[
          { dir: -1, Icon: ChevronLeft, label: t.prev, pos: "left-0" },
          { dir: 1, Icon: ChevronRight, label: t.next, pos: "right-0" },
        ].map(({ dir, Icon, label, pos }) => (
          <button
            key={dir}
            type="button"
            aria-label={label}
            onClick={() => go(active + dir)}
            className={cn(
              "absolute top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/80 bg-white/70 text-[var(--bzl-fg)] shadow-[0_8px_20px_-10px_rgba(28,24,20,0.4)] backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bzl-orange)]",
              pos,
            )}
          >
            <Icon className="h-5 w-5" />
          </button>
        ))}
      </div>

      {/* Name + shirt swatches */}
      <p
        aria-live="polite"
        className="mt-3 text-center text-2xl font-bold tracking-[-0.03em] text-[var(--bzl-fg)]"
      >
        {current.label}
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2.5">
        {avatars.map((a, i) => (
          <button
            key={a.name}
            type="button"
            aria-label={a.label}
            aria-pressed={i === active}
            onClick={() => go(i)}
            className={cn(
              "h-7 w-7 rounded-full transition-[box-shadow,transform] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bzl-orange)] focus-visible:ring-offset-2",
              i === active
                ? "scale-110 shadow-[0_0_0_3px_#fff,0_0_0_5px_var(--bzl-orange)]"
                : "shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] hover:scale-110",
            )}
            style={{ background: a.tint }}
          />
        ))}
      </div>
    </div>
  );
};

export default AvatarCarousel;
