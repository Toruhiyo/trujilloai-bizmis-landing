import type { IconType } from "react-icons";
import { FaBullseye, FaHandSparkles, FaHistory } from "react-icons/fa";
import { MdGraphicEq } from "react-icons/md";
import SmartphoneFrame from "./SmartphoneFrame";

const BADGE_ICON_CLASS = "h-3.5 w-3.5 shrink-0 text-primary-dark/80";

const BROWSER_CHROME_HEIGHT = 28;

/** Same Tailwind step: desktop margin-top and phone bottom offset. Margin (not row padding) avoids clipping h-[65%]. */
const MOCKUP_DESKTOP_TOP_MARGIN_CLASS = "mt-20";
const MOCKUP_PHONE_BOTTOM_CLASS = "bottom-20";

const DESKTOP_SRC = "/images/slides/shopify-listing/shopify-greeting-desktop.png";
const MOBILE_SRC = "/images/slides/shopify-listing/shopify-greeting-mobile.png";

const HALF_WAVE_BAR_COUNT = 80;
const HALF_WAVE_HEIGHTS_TOP = [
  32, 58, 88, 48, 72, 38, 82, 52, 68, 92, 42, 78, 55, 85, 35, 65, 95, 45, 62,
  75, 28, 70, 50, 90, 58, 40, 78, 68, 48, 82, 55, 72, 38, 88, 62, 45, 75, 52,
];
const HALF_WAVE_HEIGHTS_BOTTOM = [
  68, 42, 85, 55, 38, 78, 48, 92, 62, 35, 72, 88, 52, 65, 45, 82, 58, 28, 75,
  50, 90, 48, 70, 42, 68, 95, 55, 78, 40, 62, 72, 45, 88, 58, 32, 82, 65, 48,
];

const GREETING_OVERVIEW_CHIPS: readonly {
  id: string;
  label: string;
  Icon: IconType;
}[] = [
  { id: "activity", label: "Remembers activity", Icon: FaHistory },
  { id: "greeting", label: "Personalized greeting", Icon: FaHandSparkles },
  { id: "intent", label: "Understands intent", Icon: FaBullseye },
];

const GreetingFeatureBadges = () => (
  <div className="flex flex-wrap gap-2">
    {GREETING_OVERVIEW_CHIPS.map(({ id, label, Icon }) => (
      <span
        key={id}
        className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 backdrop-blur-md border border-primary/25 px-4 py-2 text-sm font-heading font-semibold text-primary-dark"
      >
        <Icon className={BADGE_ICON_CLASS} aria-hidden />
        {label}
      </span>
    ))}
  </div>
);

const GreetingOverviewSlide = () => (
  <div className="relative flex h-full w-full min-h-0 min-w-0 flex-col overflow-visible">
    <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-visible">
      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-[0.98fr_1.22fr] grid-rows-1 gap-x-12 items-stretch overflow-visible">
        {/* Left: proof-oriented headline (not cover); chips match welcome / intent / guidance; transcript unchanged */}
        <div className="flex min-h-0 min-w-0 flex-col justify-center gap-10 overflow-visible py-2 pr-1">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2.5">
              <MdGraphicEq className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              <span className="text-sm font-body font-semibold text-primary uppercase tracking-widest">
                Shopper engagement
              </span>
            </div>
            <h2 className="text-4xl font-heading font-bold !leading-[1.15] text-foreground xl:text-5xl">
              In-Store Guidance
              <br />
              From the First Hello
            </h2>
            <p className="max-w-[54ch] text-base font-body leading-[1.65] text-muted-foreground">
              Bizmis welcomes shoppers, understands what they need, and starts guiding them naturally — just like a helpful in-store clerk would.
            </p>
          </div>

          <GreetingFeatureBadges />

          {/* Greeting exchange — upper + lower half-wave bands (matches other deck slides) */}
          <div className="relative flex w-full min-w-0 flex-col overflow-visible">
            <div
              className="flex h-14 w-full shrink-0 items-end gap-[2px] bg-transparent pointer-events-none"
              aria-hidden
            >
              {Array.from({ length: HALF_WAVE_BAR_COUNT }).map((_, i) => (
                <div
                  key={`top-${i}`}
                  className="min-w-[2px] max-w-[6px] flex-1 rounded-full bg-primary/10"
                  style={{ height: `${HALF_WAVE_HEIGHTS_TOP[i % HALF_WAVE_HEIGHTS_TOP.length]}%` }}
                />
              ))}
            </div>
            <div className="relative flex min-h-0 flex-col justify-center py-8">
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[95%] min-h-[140px] w-[120%] min-w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.16] blur-[60px]"
                aria-hidden
              />
              <div className="relative z-10 flex flex-col gap-0 pl-1">
                <p className="max-w-[92%] self-end text-right font-heading text-[1.35rem] font-bold leading-[1.45] text-foreground/80">
                  Welcome back,{" "}
                  <strong className="font-extrabold text-primary-dark/85">Alex</strong>
                  {" "}— still looking for a light laptop for work and travel?
                </p>
                <p className="mt-12 max-w-[85%] self-start text-left font-body text-xl leading-[1.5] text-foreground/55">
                  Yes! I'd love a light laptop, ideally around{" "}
                  <strong className="font-semibold text-foreground">$1,500</strong>.
                </p>
              </div>
            </div>
            <div
              className="flex h-14 w-full shrink-0 scale-y-[-1] items-end gap-[2px] bg-transparent pointer-events-none"
              aria-hidden
            >
              {Array.from({ length: HALF_WAVE_BAR_COUNT }).map((_, i) => (
                <div
                  key={`bottom-${i}`}
                  className="min-w-[2px] max-w-[6px] flex-1 rounded-full bg-primary/10"
                  style={{ height: `${HALF_WAVE_HEIGHTS_BOTTOM[i % HALF_WAVE_HEIGHTS_BOTTOM.length]}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Desktop + mobile images with diffuse stains */}
        <div className="relative flex h-full min-h-0 min-w-0 flex-col overflow-visible">
          {/* Diffuse stains */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[130%] w-[115%] min-h-[460px] min-w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.09] blur-[80px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[100%] w-[90%] min-h-[340px] min-w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.12] blur-[50px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[75%] w-[65%] min-h-[260px] min-w-[230px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.07] blur-[35px]"
            aria-hidden
          />

          {/* Desktop top-right; phone overlapping */}
          <div className="relative z-10 flex h-full min-h-0 w-full flex-1 flex-col overflow-visible">
            <div className="relative flex min-h-0 flex-1 w-full items-start justify-end overflow-visible pr-0">
              {/* Desktop frame — smaller % + width so the change reads at 1600×900 export */}
              <div
                className={`relative ml-auto flex h-[65%] max-h-[65%] w-[86%] max-w-[86%] flex-col overflow-hidden rounded-xl border border-black/[0.06] shadow-[0_8px_40px_-8px_rgba(0,0,0,0.15)] ${MOCKUP_DESKTOP_TOP_MARGIN_CLASS}`}
              >
                <div
                  className="flex shrink-0 items-center gap-1.5 border-b border-black/5 bg-[#f1f1f1] px-3"
                  style={{ height: BROWSER_CHROME_HEIGHT }}
                >
                  <div className="h-2.5 w-2.5 rounded-full bg-primary-dark" />
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                  <div className="h-2.5 w-2.5 rounded-full bg-primary-light" />
                  <div className="min-w-0 flex-1 mx-8">
                    <div className="flex h-4 items-center rounded-md bg-white px-2">
                      <span className="truncate text-[8px] text-gray-400">
                        your-shopify-store.com
                      </span>
                    </div>
                  </div>
                </div>
                <div className="relative flex min-h-0 flex-1 w-full overflow-hidden bg-white">
                  <img
                    src={DESKTOP_SRC}
                    alt="Desktop storefront with Bizmis voice assistant active"
                    className="block h-full w-full object-cover object-top"
                  />
                </div>
              </div>

              {/* SmartphoneFrame — left side; bottom inset matches MOCKUP_DESKTOP_TOP_MARGIN */}
              <div
                className={`absolute -left-2 z-20 origin-bottom-left scale-[0.97] ${MOCKUP_PHONE_BOTTOM_CLASS}`}
              >
                <SmartphoneFrame className="relative z-10 shadow-[0_12px_48px_-8px_rgba(0,0,0,0.18)]">
                  <img
                    src={MOBILE_SRC}
                    alt="Mobile storefront with Bizmis voice assistant active"
                    className="block h-full w-full object-cover object-bottom"
                  />
                </SmartphoneFrame>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default GreetingOverviewSlide;
