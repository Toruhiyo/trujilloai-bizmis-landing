import type { CSSProperties, ReactNode } from "react";
import { Check, Plus } from "lucide-react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import Reveal, { useInView } from "./Reveal";
import { ClayCard, ClayTile, StoreWindow } from "./clay";
import type { ClayShape } from "./clay";

const Avatar = () => (
  <img
    src="/landing/avatar/agent-wave.jpg"
    alt=""
    className="h-9 w-9 flex-shrink-0 rounded-full bg-[var(--bzl-orange-wash)] object-cover object-[50%_18%] ring-2 ring-white"
  />
);

/** The shopper's line and the agent's answer, as in the film. */
const Dialogue = ({ shopper, agent }: { shopper: string; agent: string }) => (
  <div className="mt-8 space-y-3">
    <Reveal delay={150}>
      <p className="bzl-bubble bzl-bubble-shopper w-fit">“{shopper}”</p>
    </Reveal>
    <Reveal delay={450}>
      <div className="flex items-end gap-2.5">
        <Avatar />
        <p className="bzl-bubble bzl-bubble-agent">{agent}</p>
      </div>
    </Reveal>
  </div>
);

/** Find it: the agent picks the right one out of three. */
const FindVisual = ({ label }: { label: string }) => {
  const [ref, inView] = useInView<HTMLDivElement>(0.5);
  return (
    <div ref={ref}>
      <StoreWindow label={label}>
        <div className="grid grid-cols-3 gap-4 p-5 sm:gap-6 sm:p-8">
          <ClayCard shape="capsule" tint="sage" />
          <ClayCard shape="sphere" tint="sand" picked={inView} />
          <ClayCard shape="cube" tint="warm" />
        </div>
      </StoreWindow>
    </div>
  );
};

/** Trust it: the doubts around the product get answered. */
const TrustVisual = ({ label }: { label: string }) => {
  const [ref, inView] = useInView<HTMLDivElement>(0.5);
  const doubts = ["left-[6%] top-[14%]", "left-[34%] top-[8%]", "left-[10%] top-[66%]"];
  return (
    <div ref={ref}>
      <StoreWindow label={label}>
        <div className="grid grid-cols-[1.1fr_1fr] items-center gap-6 p-5 sm:gap-8 sm:p-8">
          <div className="relative">
            <ClayTile shape="sphere" picked />
            {doubts.map((pos, i) => (
              <span
                key={pos}
                className={cn(
                  "absolute grid h-8 w-8 place-items-center rounded-full bg-white text-sm font-bold shadow-[0_6px_16px_-6px_rgba(0,0,0,0.3)] transition-all duration-500",
                  pos,
                  inView ? "text-[var(--bzl-orange-strong)]" : "text-[var(--bzl-faint)]"
                )}
                style={{ transitionDelay: `${700 + i * 220}ms` }}
              >
                {inView ? <Check className="h-4 w-4" strokeWidth={3} /> : "?"}
              </span>
            ))}
          </div>
          <div className="space-y-3">
            <div className="bzl-tile-line w-4/5" />
            <div className="bzl-tile-line w-2/5" />
            <div className="h-4 w-16 rounded-md bg-[#d9d4cc]" />
            <div className="bzl-tile-line w-full" />
            <div className="bzl-tile-line w-3/4" />
            <div className="mt-4 h-9 rounded-xl bg-[var(--bzl-orange)]" />
          </div>
        </div>
      </StoreWindow>
    </div>
  );
};

/** Buy it: the pair goes into the cart. */
const BuyVisual = ({ label, sold }: { label: string; sold: string }) => (
  <Reveal>
    <StoreWindow label={label}>
      <div className="relative flex items-center justify-center gap-4 p-6 sm:gap-6 sm:p-10">
        <ClayCard shape="sphere" picked className="w-[36%]" />
        <Plus className="h-7 w-7 flex-shrink-0 text-[color-mix(in_oklab,var(--bzl-orange)_80%,#8a5a2b)]" strokeWidth={1.6} />
        <ClayCard shape="slab" tint="warm" className="w-[36%]" />
        <div className="bzl-check">
          <span className="flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-1.5 text-base font-semibold text-[var(--bzl-orange-strong)] shadow-[0_8px_20px_-8px_rgba(236,119,9,0.6)] backdrop-blur-md">
            <Check className="h-4 w-4" strokeWidth={2.6} />
            {sold}
          </span>
        </div>
      </div>
    </StoreWindow>
  </Reveal>
);

const Beat = ({
  index,
  kicker,
  title,
  shopper,
  agent,
  visual,
}: {
  index: number;
  kicker: string;
  title: string;
  shopper: string;
  agent: string;
  visual: ReactNode;
}) => (
  <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
    <div className={cn(index % 2 === 1 && "lg:order-2")}>
      <Reveal>
        <p className="bzl-kicker">
          {String(index + 1).padStart(2, "0")} · {kicker}
        </p>
      </Reveal>
      <Reveal delay={80}>
        <h3 className="bzl-statement-sm mt-3">{title}</h3>
      </Reveal>
      <Dialogue shopper={shopper} agent={agent} />
    </div>
    <Reveal delay={120} className={cn(index % 2 === 1 && "lg:order-1")}>
      {visual}
    </Reveal>
  </div>
);

const SOLD_SHAPES: ClayShape[] = ["sphere", "capsule", "cube", "dome", "torus"];

/** "Same store. Now with Bizmis." — the film's find → trust → buy run. */
const StorySection = () => {
  const m = useMessages().landing.story;
  const visuals = [
    <FindVisual key="find" label={m.yourStore} />,
    <TrustVisual key="trust" label={m.yourStore} />,
    <BuyVisual key="buy" label={m.yourStore} sold={m.sold} />,
  ];
  return (
    <section id="benefits" className="bzl-section bg-[linear-gradient(180deg,#fff,#fbfaf8_30%,#fff)]">
      <div className="bzl-wrap">
        <div className="text-center">
          <Reveal>
            <p className="bzl-kicker">{m.kicker}</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="bzl-statement mt-4">{m.title}</h2>
          </Reveal>
        </div>

        <div className="mt-20 space-y-28 sm:mt-28 sm:space-y-36">
          {m.beats.map((beat, i) => (
            <Beat key={beat.kicker} index={i} {...beat} visual={visuals[i]} />
          ))}
        </div>

        <div className="mt-32 text-center sm:mt-40">
          <Reveal>
            <h3 className="bzl-statement-sm mx-auto max-w-3xl">{m.soldTitle}</h3>
          </Reveal>
          <Reveal delay={100} className="mx-auto mt-12 grid max-w-4xl grid-cols-3 gap-4 sm:grid-cols-5 sm:gap-6">
            {SOLD_SHAPES.map((shape, i) => (
              <div
                key={shape}
                className={cn("relative overflow-hidden rounded-[14px]", i > 2 && "hidden sm:block")}
                style={{ "--bzl-delay": `${i * 180}ms` } as CSSProperties}
              >
                <ClayTile shape={shape} tint="orange" />
                <div className="bzl-check" style={{ transitionDelay: `${300 + i * 180}ms` }}>
                  <svg viewBox="0 0 24 24" aria-hidden="true" style={{ transitionDelay: `${600 + i * 180}ms` }}>
                    <path d="M5 12.5l4.4 4.4L19 7.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
