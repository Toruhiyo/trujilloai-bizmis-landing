import { useState, useCallback } from "react";
import {
  FaHeadset,
  FaCalendarCheck,
  FaBoxOpen,
  FaUndo,
  FaFileAlt,
  FaQuestionCircle,
  FaTruck,
  FaLock,
  FaEnvelope,
  FaCertificate,
  FaThList,
  FaPercent,
} from "react-icons/fa";
import SmartphoneFrame from "./SmartphoneFrame";
import {
  HALF_WAVE_BAR_COUNT,
  halfWaveBarHeightPercent,
  halfWaveBarOpacity,
} from "./slideWaveformHeights";

const ORBIT_RADIUS_X_PCT = 35;
const ORBIT_PHASE_DEG = 3;
const ORBIT_RADIUS_Y_PCT = 42;
const ORBIT_CORNER_RADIUS_PCT = 50;

function orbitPointOnRoundedRect(angleDeg: number): { cx: number; cy: number } {
  const rad = (angleDeg * Math.PI) / 180;
  const cosR = Math.cos(rad);
  const sinR = Math.sin(rad);
  const W = ORBIT_RADIUS_X_PCT;
  const H = ORBIT_RADIUS_Y_PCT;
  const r = Math.min(ORBIT_CORNER_RADIUS_PCT, W / 2, H / 2);
  const eps = 1e-6;
  const absCos = Math.abs(cosR) + eps;
  const absSin = Math.abs(sinR) + eps;
  const t = Math.min(W / absCos, H / absSin);
  const hitVertical = W / absCos <= H / absSin;
  const onFlat = hitVertical ? t * absSin <= H - r : t * absCos <= W - r;
  if (onFlat) {
    return { cx: 50 + t * cosR, cy: 50 + t * sinR };
  }
  const Cx = Math.sign(cosR) * (W - r);
  const Cy = Math.sign(sinR) * (H - r);
  const dot = Cx * cosR + Cy * sinR;
  const lambda =
    dot + Math.sqrt(Math.max(0, dot * dot - (Cx * Cx + Cy * Cy - r * r)));
  const px = lambda * cosR;
  const py = lambda * sinR;
  return { cx: 50 + px, cy: 50 + py };
}
const ORBIT_SOURCES: Array<{
  icon: typeof FaQuestionCircle;
  label: string;
  angleDeg: number;
  offsetX: number;
  offsetY: number;
}> = [
  {
    icon: FaQuestionCircle,
    label: "FAQs",
    angleDeg: 0,
    offsetX: 5,
    offsetY: 0,
  },
  {
    icon: FaTruck,
    label: "Shipping & tracking",
    angleDeg: 45,
    offsetX: 0,
    offsetY: 0,
  },
  {
    icon: FaThList,
    label: "Product catalog",
    angleDeg: 90,
    offsetX: 0,
    offsetY: 0,
  },
  {
    icon: FaLock,
    label: "Privacy Policy",
    angleDeg: 135,
    offsetX: 0,
    offsetY: 0,
  },
  {
    icon: FaEnvelope,
    label: "Contact info",
    angleDeg: 180,
    offsetX: -5,
    offsetY: 0,
  },
  {
    icon: FaCertificate,
    label: "Warranty policy",
    angleDeg: 225,
    offsetX: 0,
    offsetY: 0,
  },
  {
    icon: FaUndo,
    label: "Return Policy",
    angleDeg: 270,
    offsetX: 0,
    offsetY: 0,
  },
  {
    icon: FaPercent,
    label: "Discounts",
    angleDeg: 315,
    offsetX: 0,
    offsetY: 0,
  },
];

const SCREENSHOT_SRC =
  "/images/slides/shopify-listing/shopify-customer-support-screenshot-smartphone.png";

const COVERAGE_ITEMS = [
  "Returns",
  "Exchanges",
  "Warranty",
  "Address changes",
  "Policy questions",
  "FAQs",
  "More",
];

const SUPPORT_CUES = [
  { icon: FaCalendarCheck, label: "Within 30 days" },
  { icon: FaBoxOpen, label: "Box & accessories" },
  { icon: FaUndo, label: "Unless faulty" },
];

const CustomerSupportSlide = () => {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      if (img.naturalWidth && img.naturalHeight) {
        setAspectRatio(img.naturalWidth / img.naturalHeight);
      }
    },
    [],
  );

  return (
    <div className="relative flex flex-col h-full w-full overflow-visible">
      <div className="relative z-10 flex flex-col flex-1 min-h-0 overflow-visible">
        <div className="flex-1 grid grid-cols-[0.95fr_1.2fr] grid-rows-[auto_1fr] gap-x-10 gap-y-0 min-h-0 relative overflow-visible">
          {/* Row 1 col 2: Title block */}
          <div className="col-start-2 row-start-1 flex flex-col gap-1.5 mb-4 min-w-0">
            <div className="inline-flex items-center gap-2">
              <FaHeadset className="w-4 h-4 text-primary" />
              <span className="text-sm font-body font-semibold text-primary uppercase tracking-widest">
                Customer Support
              </span>
            </div>
            <h2 className="text-5xl font-heading font-bold text-foreground leading-tight">
              Emotionally Intelligent Support
            </h2>
            <p className="text-lg text-muted-foreground font-body leading-relaxed">
              After checkout, Bizmis answers support questions instantly with
              the warmth and thoughtfulness of a great in-store clerk, using
              your store&apos;s orders, shipping info, policies, and FAQs.
            </p>
          </div>

          {/* Col 1: Full-height left frame, centered phone + orbit (orbit in absolute positioning) */}
          <div className="col-start-1 row-start-1 row-span-2 relative flex flex-col flex-1 min-h-0 items-center justify-center min-w-0 overflow-visible">
            {/* Radial diffuse stains centered on SmartphoneFrame */}
            <div
              className="absolute left-1/2 top-1/2 z-0 h-[140%] w-[120%] min-h-[500px] min-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.09] blur-[80px] pointer-events-none"
              aria-hidden
            />
            <div
              className="absolute left-1/2 top-1/2 z-0 h-[100%] w-[85%] min-h-[380px] min-w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.12] blur-[50px] pointer-events-none"
              aria-hidden
            />
            <div
              className="absolute left-1/2 top-1/2 z-0 h-[70%] w-[55%] min-h-[280px] min-w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.07] blur-[35px] pointer-events-none"
              aria-hidden
            />
            <SmartphoneFrame className="relative z-10">
              <div className="relative w-full h-full min-h-0 overflow-hidden">
                <div
                  className="absolute inset-0 bg-primary/[0.03]"
                  aria-hidden
                />
                <img
                  src={SCREENSHOT_SRC}
                  alt="Customer asking about an order while Bizmis shows shipping status and delivery timing."
                  onLoad={onImageLoad}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-multiply"
                />
              </div>
            </SmartphoneFrame>
            {ORBIT_SOURCES.map(
              ({ icon: Icon, label, angleDeg, offsetX, offsetY }) => {
                const angleWithPhase = angleDeg + ORBIT_PHASE_DEG;
                const { cx, cy } = orbitPointOnRoundedRect(angleWithPhase);
                return (
                  <div
                    key={label}
                    className="absolute z-10 pointer-events-none flex flex-col items-center gap-2 text-muted-foreground/60"
                    style={{
                      left: `${cx + offsetX}%`,
                      top: `${cy + offsetY}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <Icon className="h-8 w-8 shrink-0 text-primary-dark/55" />
                    <span className="text-base font-body font-bold text-primary-dark/55 whitespace-nowrap">
                      {label}
                    </span>
                  </div>
                );
              },
            )}
          </div>

          {/* Row 2 col 2: Wave, conversation, wave, then coverage cues below */}
          <div className="col-start-2 row-start-2 relative flex flex-col flex-1 min-h-0 min-w-0 overflow-visible pt-2">
            <div
              className="flex w-full gap-[2px] h-14 items-end pointer-events-none shrink-0 bg-transparent -mx-0"
              aria-hidden
            >
              {Array.from({ length: HALF_WAVE_BAR_COUNT }).map((_, i) => (
                <div
                  key={`top-${i}`}
                  className="flex-1 min-w-[2px] rounded-full bg-primary/10"
                  style={{
                    height: `${halfWaveBarHeightPercent(i, "top")}%`,
                    opacity: halfWaveBarOpacity(i),
                  }}
                />
              ))}
            </div>
            <div className="relative flex flex-1 flex-col justify-center min-h-0 gap-6">
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[70%] min-w-[200px] min-h-[180px] rounded-full bg-primary/[0.06] blur-[60px] pointer-events-none z-0"
                aria-hidden
              />
              <div className="relative z-10 flex flex-col gap-6">
                {/* Customer question */}
                <p className="max-w-[82%] self-end text-right font-body text-xl leading-snug text-foreground/55">
                  Can I still{" "}
                  <strong className="font-semibold text-foreground">
                    return it
                  </strong>{" "}
                  if I&apos;ve opened the box?
                </p>
                {/* Tool call before reply */}
                <div className="flex flex-wrap items-center gap-3 self-start">
                  <span className="inline-flex items-center gap-1.5 shrink-0 rounded-full bg-primary/15 backdrop-blur-md border border-primary/25 px-4 py-2 text-sm font-heading font-semibold text-primary-dark">
                    <FaFileAlt className="w-3.5 h-3.5 text-primary/80" />
                    Return Policy Lookup
                  </span>
                  {SUPPORT_CUES.map(({ icon: Icon, label }) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap text-xs font-body font-medium text-primary-dark/70"
                    >
                      <Icon className="w-3 h-3 text-primary/60 shrink-0" />
                      {label}
                    </span>
                  ))}
                </div>
                {/* Bizmis answer */}
                <p className="max-w-[88%] self-start font-heading text-[1.35rem] font-bold leading-relaxed text-foreground/80">
                  Yes — if it&apos;s in{" "}
                  <strong className="font-extrabold text-primary-dark/85">
                    original condition
                  </strong>{" "}
                  with the box and accessories, you can return it within{" "}
                  <strong className="font-extrabold text-primary-dark/85">
                    30 days
                  </strong>
                  . Return shipping applies unless it&apos;s faulty.
                </p>
              </div>
            </div>
            <div
              className="flex w-full gap-[2px] h-14 items-end pointer-events-none shrink-0 scale-y-[-1] bg-transparent -mx-0"
              aria-hidden
            >
              {Array.from({ length: HALF_WAVE_BAR_COUNT }).map((_, i) => (
                <div
                  key={`bottom-${i}`}
                  className="flex-1 min-w-[2px] rounded-full bg-primary/10"
                  style={{
                    height: `${halfWaveBarHeightPercent(i, "bottom")}%`,
                    opacity: halfWaveBarOpacity(i),
                  }}
                />
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between shrink-0 mt-20 mb-8 w-full">
              {COVERAGE_ITEMS.flatMap((item, i) =>
                i === 0
                  ? [
                      <span
                        key={item}
                        className="text-base font-body text-primary-dark/50"
                      >
                        {item}
                      </span>,
                    ]
                  : [
                      <span
                        key={`dot-${item}`}
                        className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0"
                        aria-hidden
                      />,
                      <span
                        key={item}
                        className="text-base font-body text-primary-dark/50"
                      >
                        {item}
                      </span>,
                    ],
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupportSlide;
