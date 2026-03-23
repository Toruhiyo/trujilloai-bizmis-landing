import type { IconType } from "react-icons";
import { FaCommentDots, FaPalette } from "react-icons/fa";
import { MdGraphicEq } from "react-icons/md";

const SHOPIFY_LISTING = "/images/slides/shopify-listing";

const PERSONALIZATION_DESKTOP_PINE_SRC = `${SHOPIFY_LISTING}/shopify-personalization-screenshot-pine-desktop.png`;
const PERSONALIZATION_DESKTOP_OUTFITTERS_SRC = `${SHOPIFY_LISTING}/shopify-personalization-screenshot-outfitters-tablet.png`;
const PERSONALIZATION_MOBILE_SRC = `${SHOPIFY_LISTING}/shopify-personalization-screenshot-apricot-mobile.png`;
const PERSONALIZATION_PINK_MOBILE_SRC = `${SHOPIFY_LISTING}/shopify-personalization-screenshot-pink-mobile.png`;
const PERSONALIZATION_TABLET_SRC = `${SHOPIFY_LISTING}/shopify-personalization-screenshot-pulse-tablet.png`;

/** Same card pattern as `INSIGHT_CARDS` on MerchantInsightsSlide (analytics). */
const PERSONALIZATION_FEATURE_CARDS: readonly {
  icon: IconType;
  title: string;
  description: string;
  titleBadge?: string;
}[] = [
  {
    icon: FaPalette,
    title: "Avatar appearance",
    description: "Align colors, layout, and avatar style with your storefront.",
  },
  {
    icon: MdGraphicEq,
    title: "Brand-matched voice",
    description: "Choose a voice profile that matches how your brand sounds.",
    titleBadge: "On request",
  },
  {
    icon: FaCommentDots,
    title: "Tone & behavior",
    description: "Shape greetings, sales guidance, and support style in one place.",
  },
];

const MOBILE_AVATAR_CORNER_OFFSET_PX = 34;
const MOBILE_AVATAR_CORNER_OFFSET_PY = -10;

const COLLAGE_SCREENSHOT_BOX_SHADOW =
  "0 14px 44px -12px rgb(0 0 0 / 0.2), 0 4px 16px -6px rgb(0 0 0 / 0.12)";

const BrandPersonalizationSlide = () => (
  <div className="relative flex h-full w-full min-h-0 min-w-0 flex-col overflow-visible">
    <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-visible">
      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-[1.22fr_1fr] grid-rows-1 items-stretch gap-x-20 overflow-visible">
        {/* Left: collage — portrait 13:16; Pink & Apricot 1:1 */}
        <div className="relative flex min-h-0 min-w-0 flex-col justify-start overflow-visible py-3">
          <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col justify-start">
            <div className="relative min-h-[min(64vh,38rem)] w-full flex-1">
              {/* Pine — top-right corner (outer: shadow; inner: clip — avoids overflow-hidden clipping the shadow) */}
              <div
                className="absolute right-0 top-0 z-[10] w-[min(40%,17rem)] rounded-xl sm:w-[min(38%,18.5rem)]"
                style={{ boxShadow: COLLAGE_SCREENSHOT_BOX_SHADOW }}
              >
                <div className="aspect-[14/16] w-full overflow-hidden rounded-xl border border-black/[0.07] bg-white">
                  <img
                    src={PERSONALIZATION_DESKTOP_PINE_SRC}
                    alt="Bizmis personalization — Pine storefront"
                    className="block h-full w-full object-cover object-top"
                  />
                </div>
              </div>

              {/* Pink mobile — top-left, nudged right/down */}
              <div
                className="absolute z-[40] w-[min(42%,13.5rem)] origin-top-left scale-[0.88] sm:w-[min(40%,14.5rem)] sm:scale-[0.92]"
                style={{ left: MOBILE_AVATAR_CORNER_OFFSET_PX, top: MOBILE_AVATAR_CORNER_OFFSET_PY }}
              >
                <div
                  className="aspect-square overflow-hidden rounded-full border border-black/[0.08] bg-white"
                  style={{ boxShadow: COLLAGE_SCREENSHOT_BOX_SHADOW }}
                >
                  <img
                    src={PERSONALIZATION_PINK_MOBILE_SRC}
                    alt="Bizmis personalization — Pink storefront"
                    className="block h-full w-full object-cover object-center"
                  />
                </div>
              </div>

              <div
                className="pointer-events-none absolute left-1/2 top-1/2 z-[45] h-[min(34rem,62vh)] w-[min(42rem,108%)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 blur-[52px] sm:h-[min(36rem,64vh)] sm:w-[min(44rem,112%)] sm:blur-[60px]"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 z-[45] h-[min(22rem,44vh)] w-[min(28rem,88%)] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[28px] sm:h-[min(24rem,46vh)] sm:w-[min(30rem,92%)] sm:blur-[32px]"
                style={{
                  background:
                    "radial-gradient(ellipse 50% 48% at 50% 50%, hsl(var(--primary) / 0.55) 0%, hsl(var(--primary-light) / 0.38) 48%, hsl(var(--primary) / 0.12) 72%, transparent 88%)",
                }}
                aria-hidden
              />

              {/* Outfitters — center (multiply: light/white UI picks up primary from layer below) */}
              <div
                className="absolute left-1/2 top-1/2 z-[50] w-[min(46%,16.5rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-black/[0.07] bg-transparent aspect-[13/15] sm:w-[min(44%,18.25rem)]"
                style={{ boxShadow: COLLAGE_SCREENSHOT_BOX_SHADOW }}
              >
                <div
                  className="absolute inset-0 bg-primary-light/15"
                  aria-hidden
                />
                <img
                  src={PERSONALIZATION_DESKTOP_OUTFITTERS_SRC}
                  alt="Bizmis personalization — Outfitters storefront"
                  className="relative z-[1] block h-full w-full object-cover object-top mix-blend-multiply"
                />
              </div>

              {/* Pulse — bottom left (outer: shadow; inner: clip) */}
              <div
                className="absolute bottom-1 left-1 z-[30] w-[min(40%,14.5rem)] rounded-xl sm:bottom-2 sm:left-2 sm:w-[min(38%,16rem)]"
                style={{ boxShadow: COLLAGE_SCREENSHOT_BOX_SHADOW }}
              >
                <div className="aspect-[14/16] w-full overflow-hidden rounded-xl border border-black/[0.08] bg-white">
                  <img
                    src={PERSONALIZATION_TABLET_SRC}
                    alt="Bizmis personalization — Pulse storefront"
                    className="block h-full w-full object-cover object-top"
                  />
                </div>
              </div>

              {/* Apricot — bottom-right, nudged toward top-left (same offset as Pink) */}
              <div
                className="absolute z-[40] w-[min(42%,13.5rem)] origin-bottom-right scale-[0.88] sm:w-[min(40%,14.5rem)] sm:scale-[0.92]"
                style={{
                  right: MOBILE_AVATAR_CORNER_OFFSET_PX,
                  bottom: MOBILE_AVATAR_CORNER_OFFSET_PY,
                }}
              >
                <div
                  className="aspect-square overflow-hidden rounded-full border border-black/[0.08] bg-white"
                  style={{ boxShadow: COLLAGE_SCREENSHOT_BOX_SHADOW }}
                >
                  <img
                    src={PERSONALIZATION_MOBILE_SRC}
                    alt="Bizmis personalization — Apricot storefront"
                    className="block h-full w-full object-cover object-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: title + analytics-style feature cards */}
        <div className="flex min-h-0 min-w-0 flex-col justify-center gap-10 overflow-visible py-4 pl-1">
          <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
            <div className="inline-flex items-center gap-2">
              <FaPalette className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span className="text-sm font-body font-semibold text-primary uppercase tracking-widest">
                Brand Personalization
              </span>
            </div>
            <h2 className="text-5xl font-heading font-bold !leading-[1.2] text-foreground">
              Bizmis Feels Like
              <br />
              Your Store
            </h2>
            <p className="max-w-[46ch] text-lg font-body leading-[1.65] text-muted-foreground">
              Customize Bizmis&apos;s avatar, voice, and tone so every interaction feels more like your brand — and less
              like a generic assistant.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:gap-5">
            {PERSONALIZATION_FEATURE_CARDS.map(({ icon: Icon, title, description, titleBadge }) => (
              <div
                key={title}
                className="flex items-start gap-4 rounded-xl border border-border/50 bg-background/60 px-5 py-4 sm:py-[1.125rem]"
              >
                <div className="mt-0.5 shrink-0 rounded-lg bg-primary/10 p-2">
                  <Icon className="h-4 w-4 text-primary-dark/80" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                    <h3 className="min-w-0 text-base font-heading font-semibold text-foreground">{title}</h3>
                    {titleBadge ? (
                      <span className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[10px] font-body font-semibold uppercase leading-none tracking-wide text-primary-dark">
                        {titleBadge}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 text-base font-body leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default BrandPersonalizationSlide;
