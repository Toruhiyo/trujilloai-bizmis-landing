import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import "@/styles/pillar-intro.css";

/**
 * PillarIntro: a pillar's benefit title as its scroll-driven entrance. When
 * the pillar is reached its title stands BIG, filling the screen with the
 * pillar chip above it; as the visitor scrolls on it shrinks and flies up
 * to dock as the section's sticky compact header, while the sub-benefits
 * (`children`) scroll in under it. The header stays docked to the end of the
 * section. With prefers-reduced-motion: the big title sits still at the top
 * and the docked header appears once it's scrolled past (no morph).
 *
 *   <PillarIntro
 *     chip={<PillarChip icon={HeadsetIcon} label={b.support.badge} />}
 *     title={<>Fewer tickets. <span className="tail">Happier customers.</span></>}
 *     docked={({ docked }) => <MyCompactTitle />}   // optional
 *     accent="rgb(255 240 236 / 0.86)"              // optional: the docked bar's ground
 *   >
 *     …the sub-benefits…
 *   </PillarIntro>
 *
 * - `title`: the big title (rendered in an <h2> unless `as` says otherwise).
 * - `docked`: the header's compact form, a node or a render prop receiving
 *   `{ docked }` (true once the morph has landed). Defaults to `title`, small.
 *   The chip sits to its left (desktop only).
 * - The morph: an element in the big title and one in the docked form that
 *   share a `data-morph="key"` fly from one to the other (translate + scale,
 *   then a crossfade), e.g. each part of a title; big elements without a
 *   partner shrink toward the header and fade. With no `data-morph` at all,
 *   the whole title flies to the whole docked form.
 * - Styling: `titleClassName` sizes the big title (default up to ~9vw);
 *   the root publishes `--pi-dock-h` (the docked header's height) so pinned
 *   children can sit right under it (`top: calc(nav + var(--pi-dock-h))`),
 *   and `--pi-e` (0 → 1, the morph's progress).
 */
export type PillarIntroProps = {
  chip?: ReactNode;
  title: ReactNode;
  docked?: ReactNode | ((state: { docked: boolean }) => ReactNode);
  /** The docked bar's ground (any CSS background); defaults to a glass of the pillar's soft accent. */
  accent?: string;
  /** The big title's element: "h2" (default), or "p"/"div" when the page has its heading elsewhere. */
  as?: "h2" | "p" | "div";
  className?: string;
  titleClassName?: string;
  dockClassName?: string;
  children?: ReactNode;
};

/** Scroll (in screen heights, after the header sticks) the big title holds, then takes to dock. */
const HOLD = 0.16;
const SHRINK = 0.62;

const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);

/**
 * The morph's progress, split so a stacked title unstacks cleanly: words
 * slide sideways into their row early (x), shrink a little ahead (scale),
 * and the lines close up last (y).
 */
const setMorph = (el: HTMLElement, k: number) => {
  // every piece lands by 90%; the last 10% is the crossfade onto the docked bar
  const m = Math.min(1, k / 0.9);
  el.style.setProperty("--pi-e", k.toFixed(4));
  el.style.setProperty("--pi-ex", Math.pow(m, 0.55).toFixed(4));
  el.style.setProperty("--pi-es", Math.min(1, k / 0.8).toFixed(4));
  el.style.setProperty("--pi-ey", Math.pow(m, 1.3).toFixed(4));
};

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

const PillarIntro = ({
  chip,
  title,
  docked,
  accent,
  as: Tag = "h2",
  className,
  titleClassName,
  dockClassName,
  children,
}: PillarIntroProps) => {
  const root = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const big = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const [reduced] = useState(prefersReduced);
  const [isDocked, setDocked] = useState(reduced);
  const e = useRef(reduced ? 1 : 0);

  // measure where each big element has to fly to dock, and the header's height
  useLayoutEffect(() => {
    const r = root.current;
    const h = head.current;
    const b = big.current;
    const d = dock.current;
    if (!r || !h || !d) return;
    const measure = () => {
      r.style.setProperty("--pi-dock-h", `${d.offsetHeight}px`);
      if (!b || reduced) return;
      setMorph(r, 0);
      let pairs: [HTMLElement, HTMLElement | null][] = Array.from(
        b.querySelectorAll<HTMLElement>("[data-morph]"),
      ).map((el) => [el, d.querySelector<HTMLElement>(`[data-morph="${el.dataset.morph}"]`)]);
      if (!pairs.length) {
        const whole = b.querySelector<HTMLElement>(".pi-title");
        const into = d.querySelector<HTMLElement>(".pi-dock-main");
        if (whole) pairs = [[whole, into]];
      }
      const home = d.getBoundingClientRect();
      for (const [el, to] of pairs) {
        const a = el.getBoundingClientRect();
        const t = to?.getBoundingClientRect();
        const has = !!t && t.width > 0 && t.height > 0;
        const tx = has ? t.left + t.width / 2 : home.left + home.width / 2;
        const ty = has ? t.top + t.height / 2 : home.top + home.height / 2;
        const s = has ? Math.min(t.height / a.height, t.width / a.width) : 0.25;
        el.style.setProperty("--pi-dx", `${(tx - (a.left + a.width / 2)).toFixed(1)}px`);
        el.style.setProperty("--pi-dy", `${(ty - (a.top + a.height / 2)).toFixed(1)}px`);
        el.style.setProperty("--pi-s", s.toFixed(4));
        el.classList.add("pi-morph");
        el.classList.toggle("pi-lone", !has);
      }
      setMorph(r, e.current);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(d);
    if (b) ro.observe(b);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [reduced]);

  // the scroll drives the morph
  useLayoutEffect(() => {
    const r = root.current;
    const h = head.current;
    if (!r || !h) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const top = parseFloat(getComputedStyle(h).top) || 0;
      const y = top - r.getBoundingClientRect().top; // > 0 once the header sticks
      const vh = window.innerHeight;
      let k: number;
      if (reduced) {
        const still = r.querySelector<HTMLElement>(".pi-still");
        k = still && still.getBoundingClientRect().bottom < top + (dock.current?.offsetHeight ?? 0) ? 1 : 0;
      } else k = ease(Math.min(1, Math.max(0, (y - HOLD * vh) / (SHRINK * vh))));
      if (Math.abs(k - e.current) > 0.0005 || k === 0 || k === 1) {
        e.current = k;
        setMorph(r, k);
      }
      setDocked(k >= 0.999);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced]);

  const bigBlock = (
    <div ref={big} className={reduced ? "pi-still" : "pi-big"}>
      <div className="pi-big-inner">
        {chip && (
          <span className="pi-chip" data-morph="pi-chip">
            {chip}
          </span>
        )}
        <Tag className={cn("pi-title", titleClassName)}>{title}</Tag>
      </div>
    </div>
  );
  const compact = typeof docked === "function" ? docked({ docked: isDocked }) : (docked ?? title);

  return (
    <div
      ref={root}
      className={cn("pi", reduced && "is-still", isDocked && "is-docked", className)}
      style={{ "--pi-e": reduced ? 1 : 0, ...(accent ? { "--pi-bar": accent } : {}) } as CSSProperties}
    >
      {reduced && bigBlock}
      <div ref={head} className="pi-head">
        <div ref={dock} className={cn("pi-dock", dockClassName)} aria-hidden="true">
          {chip && (
            <span className="pi-dock-chip" data-morph="pi-chip">
              {chip}
            </span>
          )}
          <div className="pi-dock-main">{compact}</div>
        </div>
        {!reduced && bigBlock}
      </div>
      {!reduced && <div className="pi-runway" aria-hidden="true" />}
      <div className="pi-body">{children}</div>
    </div>
  );
};

export default PillarIntro;
