import SlideDeck from "@/components/slides/SlideDeck";
import { SLIDES } from "@/components/slides/registry";
import Logo from "@/components/Logo";
import ProductDiscoverySlide from "@/components/slides/ProductDiscoverySlide";
import ProductComparisonSlide from "@/components/slides/ProductComparisonSlide";
import CustomerSupportSlide from "@/components/slides/CustomerSupportSlide";
import MerchantInsightsSlide from "@/components/slides/MerchantInsightsSlide";
import MerchantHomeSlide from "@/components/slides/MerchantHomeSlide";
import SmartphoneFrame from "@/components/slides/SmartphoneFrame";
import { listingAsset } from "@/components/slides/listingAssets";
import BrandPersonalizationSlide from "@/components/slides/BrandPersonalizationSlide";

const COVER_SIDE_MARGIN_PX = 80;
/** Landing v2 render of Will in the Bizmis shirt, waving. */
const COVER_AVATAR_SRC = "/landing/agents/setup-will-1080.webp";
/** Meridian product page on mobile with the Bizmis dock, captured 2026-11-03. */
const COVER_MOBILE_SRC = listingAsset("store-mobile-product.png");
const WAVEFORM_BAR_COUNT = 60;
const WAVEFORM_HEIGHTS = [
  65, 55, 45, 52, 38, 62, 78, 88, 68, 55, 72, 90, 75, 48, 58, 82, 65, 42, 55, 70,
  85, 92, 78, 62, 48, 65, 72, 58, 80, 68, 45, 52, 75, 88, 60, 42, 55, 70, 65, 48,
  58, 45, 50, 46, 42, 38, 44, 54 , 50, 65, 78, 55, 42, 68, 85, 72, 58, 45, 62,
  38, 52, 70, 82, 60, 48, 55, 75, 90, 68, 42, 58, 80, 65, 45, 52, 72, 88, 55, 38,
  62, 48, 70, 85, 58, 42, 65, 78, 50, 35, 55, 68, 45, 60, 72, 52, 38, 82, 65, 48,
  28, 42, 58, 75, 62, 45, 55, 70, 80, 52, 38, 65, 48, 58, 42, 35, 28, 22, 18, 12,
];

const WAVEFORM_FULL_WIDTH_BAR_COUNT = 200;

const EYEBROW_CENTER = 0.28;
const EYEBROW_FADE_HALF_WIDTH = 0.28;
const EYEBROW_MIN_OPACITY = 0.3;

const waveBarOpacity = (index: number) => {
  const progress = index / (WAVEFORM_FULL_WIDTH_BAR_COUNT - 1);
  const dist = Math.abs(progress - EYEBROW_CENTER) / EYEBROW_FADE_HALF_WIDTH;
  if (dist >= 1) return 1;
  return EYEBROW_MIN_OPACITY + (1 - EYEBROW_MIN_OPACITY) * dist * dist;
};

const ShopifyHeroContent = () => (
  <div
    className="relative flex flex-col h-full w-full overflow-visible"
    style={{
      paddingLeft: COVER_SIDE_MARGIN_PX,
      paddingRight: COVER_SIDE_MARGIN_PX,
      paddingTop: 24,
    }}
  >
    <div
      className="absolute top-[37.7%] -translate-y-1/2 flex items-center justify-center gap-[2px] h-32 pointer-events-none z-0 mix-blend-overlay"
      style={{
        left: -COVER_SIDE_MARGIN_PX,
        right: -COVER_SIDE_MARGIN_PX,
        maskImage: "linear-gradient(to right, transparent 2%, black 10%, black 90%, transparent 98%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 2%, black 10%, black 90%, transparent 98%)",
      }}
    >
      {Array.from({ length: WAVEFORM_FULL_WIDTH_BAR_COUNT }).map((_, i) => (
        <div
          key={i}
          className="flex-1 min-w-[2px] max-w-[8px] rounded-full bg-white/30 self-center"
          style={{
            height: `${WAVEFORM_HEIGHTS[i % WAVEFORM_HEIGHTS.length]}%`,
            opacity: waveBarOpacity(i),
          }}
        />
      ))}
    </div>
    <div className="relative flex flex-1 items-center z-10">
      <div className="flex-[1.5] flex flex-col h-full pt-2">
        <Logo variant="white" size="lg" showText className="shrink-0 scale-125 origin-left mt-1" />
        <div className="flex flex-1 flex-col justify-center gap-6 pr-10">
          <span className="text-white text-2xl font-body tracking-wide uppercase font-medium">
            Your AI sales agent
          </span>
        <h1 className="text-[4.9rem] font-heading font-bold text-white leading-[1.05]">
          Match needs.
          <br />
          Clear doubts.
          <br />
          Win sales.
        </h1>
        <p className="text-3xl text-white/80 font-body">
          Turn store visits into sales,
          <br /> by voice and text, day and night.
        </p>
        </div>
      </div>
      <div className="flex-1 relative flex items-end justify-center h-full overflow-visible">
        <div className="relative">
          <img
            src={COVER_AVATAR_SRC}
            alt="Bizmis sales agent avatar waving"
            className="max-h-[700px] w-auto object-contain relative z-10 translate-x-28"
          />
          <div
            className="absolute left-1/2 -translate-x-[35%] w-[700px] max-w-[150%] h-[80px] avatar-floor-shadow z-0 bottom-4"
            aria-hidden
          />
          <div className="absolute -left-20 bottom-12 z-20 -rotate-3">
            <SmartphoneFrame className="shadow-[0_18px_60px_-10px_rgba(0,0,0,0.35)]">
              <img
                src={COVER_MOBILE_SRC}
                alt="Bizmis sales agent on a store's product page on mobile"
                className="absolute bottom-0 left-0 block h-auto w-full"
              />
            </SmartphoneFrame>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SHOPIFY_SLIDES = [
  {
    ...SLIDES.hero,
    label: "Cover",
    content: <ShopifyHeroContent />,
  },
  {
    ...SLIDES.benefit1,
    label: "Sales > Product discovery",
    content: <ProductDiscoverySlide />,
  },
  {
    ...SLIDES.benefit1,
    label: "Sales > Comparison and add-ons",
    content: <ProductComparisonSlide />,
  },
  {
    ...SLIDES.benefit1,
    label: "Support > Answers on the spot",
    content: <CustomerSupportSlide />,
  },
  {
    ...SLIDES.benefit3,
    label: "Admin > Home",
    content: <MerchantHomeSlide />,
  },
  {
    ...SLIDES.benefit3,
    label: "Admin > Insights and replays",
    content: <MerchantInsightsSlide />,
  },
  {
    ...SLIDES.benefit1,
    label: "Admin > Customize",
    content: <BrandPersonalizationSlide />,
  },
];

const ShopifyDeck = () => (
  <SlideDeck slides={SHOPIFY_SLIDES} filenamePrefix="bizmis-shopify" />
);

export default ShopifyDeck;
