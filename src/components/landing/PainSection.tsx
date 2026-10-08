import type { CSSProperties } from "react";
import { X } from "lucide-react";
import { useMessages } from "@/i18n/LocaleProvider";
import Reveal from "./Reveal";
import { ClayTile } from "./clay";
import type { ClayShape } from "./clay";

const SHAPES: ClayShape[] = ["sphere", "capsule", "cube", "cone", "torus", "cylinder", "slab", "dome", "egg", "box", "frustum", "lens"];
// Which cards get stamped LOST, in the order they're stamped.
const LOST_ORDER = [7, 2, 13, 9, 4, 16, 11, 0, 15, 5];

/** "Unattended visits cost you sales": the film's grey sea of lost stores. */
const PainSection = () => {
  const m = useMessages().landing.pain;
  return (
    <section className="bzl-section overflow-hidden pb-0">
      <div className="bzl-wrap text-center">
        <Reveal>
          <p className="bzl-kicker">{m.kicker}</p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="bzl-statement mt-4">
            {m.title}
            <br />
            <span className="bzl-tail">{m.titleTail}</span>
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <p className="bzl-lead mx-auto mt-6 max-w-2xl">{m.lead}</p>
        </Reveal>
      </div>

      <Reveal className="bzl-sea mt-6" delay={200}>
        <div className="bzl-sea-plane" aria-hidden="true">
          {Array.from({ length: 18 }, (_, i) => {
            const stamp = LOST_ORDER.indexOf(i);
            return (
              <div key={i} className="bzl-sea-card">
                <div className="mb-2 flex gap-1">
                  <i className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
                  <i className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
                  <i className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map((k) => (
                    <ClayTile key={k} shape={SHAPES[(i * 3 + k) % SHAPES.length]} tint="stone" />
                  ))}
                </div>
                {stamp >= 0 && (
                  <span className="bzl-lost" style={{ "--bzl-delay": `${500 + stamp * 260}ms` } as CSSProperties}>
                    <span>
                      <X className="h-[0.9em] w-[0.9em]" strokeWidth={1.6} />
                      {m.lost}
                    </span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
};

export default PainSection;
