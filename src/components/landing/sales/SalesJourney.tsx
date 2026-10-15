import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import FunnelScale from "./funnel/FunnelScale";
import { useMedia, useReducedMotion } from "./hooks";
import SalesPayoff from "./SalesPayoff";
import { SalesShell, useBeat } from "./SalesShell";
import { Device, PanelCopy, Sentinel } from "./shared";

/**
 * Grouping 3, "the journey path" (?grp=3): Find it, Trust it, Buy it as
 * three columns, stepping down the page, strung on one continuous white
 * marker line that draws itself as you scroll: it enters at the first
 * stop, runs along the top of each column and drops between them, and
 * each column's device (with the small at-scale funnel under it, on the
 * same clock) starts playing when the line reaches its stop; the stops
 * still ahead wait, dimmed. After the third stop the line runs down the
 * side and sweeps back under the columns to the last stop: the payoff,
 * the whole funnel fixed and the bag filling. Phones: one column, the line
 * running down the left with a stop per part. Reduced motion: the line is
 * drawn and every part shown at its end.
 */
const SalesJourney = () => {
  const s = useMessages().landing.sales;
  const wide = useMedia("(min-width: 1024px)");
  const reduced = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLElement | null)[]>([]);
  const cols = useRef<(HTMLElement | null)[]>([]);
  const ink = useRef<SVGPathElement>(null);
  const [d, setD] = useState("");
  const [box, setBox] = useState({ W: 0, H: 0 });
  /** Each stop's length along the line, and the y it's at (wrap px). */
  const stops = useRef<{ len: number[]; y: number[]; total: number }>({ len: [], y: [], total: 0 });
  /** How many stops the line has reached (0–4). */
  const [reached, setReached] = useState(reduced ? 4 : 0);
  const setNode = useCallback((i: number) => (el: HTMLElement | null) => void (nodes.current[i] = el), []);
  const setCol = useCallback((i: number) => (el: HTMLElement | null) => void (cols.current[i] = el), []);

  const current = Math.min(reached, 4) - 1;
  const beats = [useBeat(0, reached > 0), useBeat(1, reached > 1), useBeat(2, reached > 2)];

  // the route: through every stop, metro style (straight runs, rounded corners), measured from the layout
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const build = () => {
      const r = el.getBoundingClientRect();
      const c = (n: HTMLElement | null) => {
        const b = n?.getBoundingClientRect();
        return b ? { x: b.left - r.left + b.width / 2, y: b.top - r.top + b.height / 2 } : { x: 0, y: 0 };
      };
      const P = nodes.current.map(c);
      if (P.length < 4) return;
      const pts: [number, number][] = [[P[0].x, P[0].y - 70]];
      if (wide) {
        const rect = cols.current.map((n) => {
          const b = n!.getBoundingClientRect();
          return { l: b.left - r.left, r: b.right - r.left, b: b.bottom - r.top };
        });
        pts.push([P[0].x, P[0].y]);
        for (let i = 0; i < 2; i++) {
          const gx = (rect[i].r + rect[i + 1].l) / 2;
          pts.push([gx, P[i].y], [gx, P[i + 1].y], [P[i + 1].x, P[i + 1].y]);
        }
        const xr = rect[2].r + 14;
        const yEnd = Math.max(...rect.map((q) => q.b)) + Math.max(24, (P[3].y - Math.max(...rect.map((q) => q.b))) * 0.45);
        pts.push([xr, P[2].y], [xr, yEnd], [P[3].x, yEnd], [P[3].x, P[3].y]);
      } else {
        for (const p of P) pts.push([P[0].x, p.y]);
      }
      const path = metro(pts, wide ? 34 : 0);
      setD(path);
      setBox({ W: r.width, H: r.height });
      // where each stop falls along it
      const probe = document.createElementNS("http://www.w3.org/2000/svg", "path");
      probe.setAttribute("d", path);
      const total = probe.getTotalLength();
      const N = 800;
      const len: number[] = [];
      let from = 0;
      for (const p of P) {
        let best = from;
        let bestD = Infinity;
        for (let n = from; n <= N; n++) {
          const q = probe.getPointAtLength((total * n) / N);
          const dd = (q.x - p.x) ** 2 + (q.y - p.y) ** 2;
          if (dd < bestD) {
            bestD = dd;
            best = n;
          }
        }
        len.push((total * best) / N);
        from = best;
      }
      stops.current = { len, y: P.map((p) => p.y), total };
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    return () => ro.disconnect();
  }, [wide]);

  // the pen: as the reading line (62% down the screen) passes each stop, the line has reached it
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = wrap.current;
      const path = ink.current;
      const { len, y, total } = stops.current;
      if (!el || !path || !total) return;
      if (reduced) {
        path.style.strokeDashoffset = "0";
        return;
      }
      const read = window.innerHeight * 0.62 - el.getBoundingClientRect().top;
      const ys = [y[0] - 160, ...y];
      const ls = [0, ...len];
      let drawn = read <= ys[0] ? 0 : total;
      for (let i = 0; i < ys.length - 1; i++) {
        if (read < ys[i + 1]) {
          drawn = ls[i] + (ls[i + 1] - ls[i]) * Math.max(0, (read - ys[i]) / (ys[i + 1] - ys[i]));
          break;
        }
      }
      if (read >= ys[ys.length - 1]) drawn = len[len.length - 1];
      path.style.strokeDasharray = `${total}`;
      path.style.strokeDashoffset = `${total - drawn}`;
      setReached(len.filter((l) => drawn >= l - 2).length);
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
  }, [d, reduced]);

  return (
    <SalesShell lit={current >= 3 ? "all" : Math.max(0, current)} className={cn("sl-g3", wide ? "is-wide" : "is-narrow")}>
      <div ref={wrap} className="bzl-wrap sl-g3-wrap">
        <svg
          className="sl-g3-line"
          width={box.W}
          height={box.H}
          viewBox={`0 0 ${box.W || 1} ${box.H || 1}`}
          aria-hidden="true"
        >
          <path className="sl-g3-route" d={d} />
          <path ref={ink} className="sl-g3-ink" d={d} />
        </svg>
        <div className="sl-g3-cols">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              ref={setCol(i)}
              className={cn("sl-g3-col", `is-${i}`, reached > i ? "is-reached" : "is-ahead", current === i && "is-here")}
            >
              <Sentinel ref={beats[i].sentinel} off={beats[i].off} />
              <span ref={setNode(i)} className="sl-g3-node" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <PanelCopy kicker={s.stages[i]} title={s.panels[i].title} body={s.panels[i].body} className="sl-g3-copy" />
              <div className="sl-g3-dev">
                <Device index={i} clock={beats[i]} active={current === i} />
              </div>
              <FunnelScale
                focus={i}
                t={beats[i].t}
                duration={beats[i].duration}
                fixAt={beats[i].fixAt}
                className="sl-g3-fn"
              />
            </div>
          ))}
        </div>
        <div className={cn("sl-g3-end", reached > 3 ? "is-reached" : "is-ahead")}>
          <div className="sl-g3-end-words">
            <span ref={setNode(3)} className="sl-g3-node is-bag" aria-hidden="true">
              <ShoppingBag strokeWidth={2.6} />
            </span>
            <PanelCopy kicker={s.payoff.kicker} title={s.payoff.title} body={s.payoff.body} className="sl-g3-copy" />
          </div>
          <SalesPayoff play={reached > 3} className="sl-g3-pay" />
        </div>
      </div>
    </SalesShell>
  );
};

/** A polyline as a path with rounded corners (radius `r`, shrunk where the runs are short). */
const metro = (pts: [number, number][], r: number) => {
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [x, y] = pts[i];
    if (i === pts.length - 1 || r <= 0) {
      d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
      continue;
    }
    const [px, py] = pts[i - 1];
    const [nx, ny] = pts[i + 1];
    const l1 = Math.hypot(x - px, y - py);
    const l2 = Math.hypot(nx - x, ny - y);
    if (l1 < 0.5 || l2 < 0.5) {
      d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
      continue;
    }
    const rr = Math.min(r, l1 / 2, l2 / 2);
    const ax = x - ((x - px) / l1) * rr;
    const ay = y - ((y - py) / l1) * rr;
    const bx = x + ((nx - x) / l2) * rr;
    const by = y + ((ny - y) / l2) * rr;
    d += ` L${ax.toFixed(1)} ${ay.toFixed(1)} Q${x.toFixed(1)} ${y.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;
  }
  return d;
};

export default SalesJourney;
