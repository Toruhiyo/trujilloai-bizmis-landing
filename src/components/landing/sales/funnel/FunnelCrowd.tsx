import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import AgentPin from "./AgentPin";
import type { ConceptProps } from "./model";
import { flows, seeded } from "./model";

const COLS = 16;
const ROWS = 8;

/** Each figure's place in the day's traffic: a stable random rank, and a little sway. */
const CROWD = (() => {
  const rnd = seeded(11);
  return Array.from({ length: COLS * ROWS }, (_, i) => ({
    col: i % COLS,
    row: Math.floor(i / COLS),
    rank: rnd(),
    sway: rnd(),
  }));
})();

const Person = () => (
  <svg viewBox="0 0 20 24" className="sl-crowd-person">
    <circle cx="10" cy="6.6" r="4.3" />
    <path d="M2.6 23c0-4.9 3.3-8.6 7.4-8.6s7.4 3.7 7.4 8.6z" />
  </svg>
);

const Bag = () => (
  <svg viewBox="0 0 20 24" className="sl-crowd-bag">
    <path d="M3.4 9.5h13.2l-1 12.2a1.6 1.6 0 0 1-1.6 1.5H6a1.6 1.6 0 0 1-1.6-1.5z" />
    <path d="M7 11V7.6a3 3 0 0 1 6 0V11" fill="none" strokeWidth="1.9" strokeLinecap="round" />
  </svg>
);

/**
 * Concept 2, the crowd: a day's visitors as a crowd of 128 figures. Faint,
 * they browsed and left; brighter, they found a fit; ringed, they decided;
 * and the ones who ordered turn into shopping bags. With Bizmis on a stage,
 * a wave sweeps across the crowd and more of them light up and turn into
 * orders. The same shoppers every time (seeded), so the change is the agent.
 */
const FunnelCrowd = ({ boost, focus, play, reduced, steps }: ConceptProps) => {
  const f = flows(boost);
  const state = (rank: number) => (rank < f[3] ? 3 : rank < f[2] ? 2 : rank < f[1] ? 1 : 0);

  return (
    <div className={cn("sl-crowd", play && !reduced && "is-playing")} aria-hidden="true">
      <div className="sl-crowd-grid" style={{ "--cols": COLS } as CSSProperties}>
        {CROWD.map((p, i) => {
          const s = state(p.rank);
          return (
            <span
              key={i}
              className="sl-crowd-fig"
              data-s={s}
              style={
                {
                  "--d": `${p.col * 42 + p.row * 14}ms`,
                  "--sway": `${(p.sway * -3).toFixed(2)}s`,
                } as CSSProperties
              }
            >
              <Person />
              <Bag />
            </span>
          );
        })}
      </div>
      <ul className="sl-crowd-legend">
        {[0, 1, 2, 3].map((s) => (
          <li
            key={s}
            className={cn("sl-crowd-key", (s === focus + 1 || (focus >= 3 && s > 0)) && "is-focus")}
          >
            <span className="sl-crowd-fig is-key" data-s={s}>
              <Person />
              <Bag />
            </span>
            <span className="sl-crowd-key-label">{steps[s]}</span>
            {s > 0 && (
              <AgentPin
                stage={s - 1}
                on={boost[s - 1] > 0}
                focus={focus === s - 1 || focus >= 3}
                size={18}
                className="is-inline"
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FunnelCrowd;
