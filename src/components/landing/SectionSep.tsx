import { useEffect, useRef, useState } from "react";

/**
 * How One-Click Setup and "Make It Truly Yours" are set apart from the rest of
 * the page, each on its own (never the two in one surface): `?sep=2` "sheet",
 * each on its own soft cream panel inset from the page edges, rounded top and
 * bottom, with air between the two; `?sep=3` "band", each on its own very
 * light orange wash, full bleed, entering and leaving on a hand-drawn marker
 * edge in the primary. "none" (no parameter, or anything unknown) is the page
 * as it was. Read once, on mount. The look lives in section-sep.css, keyed on
 * the .bzl root's data-sep.
 */
export type Sep = "none" | "2" | "3";

export const useSep = (): Sep => {
  const [v] = useState<Sep>(() => {
    if (typeof window === "undefined") return "none";
    const q = new URLSearchParams(window.location.search).get("sep");
    return q === "2" || q === "3" ? q : "none";
  });
  return v;
};

/**
 * The hand's wobble (as the Sales funnel's marker): a smooth, FIXED offset for
 * a point `x` px along the edge, -1..1; `seed` tells edges apart. It depends
 * on where, never on when, so the line never boils.
 */
const wobble = (x: number, seed: number) =>
  (Math.sin(x * 0.0125 + seed * 1.7) * 0.7 +
    Math.sin(x * 0.0046 + seed * 4.1) * 0.7 +
    Math.sin(x * 0.029 + seed) * 0.35) /
  1.75;

const f = (n: number) => n.toFixed(1);

/**
 * A band's way in or out (`?sep=3`): a full-bleed hand-drawn marker line just
 * outside the section (above it for `top`, below it for `bottom`), the band's
 * wash filling from the line to the section, so the band starts and ends on
 * a wavy, drawn edge. Sized from its own box (section-sep.css sets the
 * height), redrawn when the width changes.
 */
export const MarkerEdge = ({ side, seed }: { side: "top" | "bottom"; seed: number }) => {
  const ref = useRef<SVGSVGElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => {
      const r = el.getBoundingClientRect();
      setBox((b) => (Math.abs(b.w - r.width) < 1 && Math.abs(b.h - r.height) < 1 ? b : { w: r.width, h: r.height }));
    };
    check();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = box;
  let line = "";
  let fill = "";
  if (w > 0 && h > 0) {
    // the line rides the edge's middle, its swing a third of the edge
    const amp = h * 0.3;
    const mid = side === "top" ? h * 0.52 : h * 0.48;
    const pts: [number, number][] = [];
    const step = 6;
    for (let x = -step; x <= w + step; x += step) pts.push([x, mid + amp * wobble(x + seed * 211, seed)]);
    line = `M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(" L")}`;
    // the wash: from the line to the section's side of the edge (a px past it, no hairline)
    const to = side === "top" ? h + 1 : -1;
    fill = `${line} L${f(w + step)} ${f(to)} L${f(-step)} ${f(to)} Z`;
  }

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      className={`bzl-sep-edge is-${side}`}
      width={w || undefined}
      height={h || undefined}
      viewBox={`0 0 ${w || 1} ${h || 1}`}
      preserveAspectRatio="none"
    >
      {fill && <path d={fill} className="bzl-sep-edge-wash" />}
      {line && <path d={line} className="bzl-sep-edge-line" />}
    </svg>
  );
};
