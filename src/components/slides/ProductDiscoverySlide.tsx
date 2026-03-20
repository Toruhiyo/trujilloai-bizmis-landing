import { useState, useCallback } from "react";
import { FaShoppingCart, FaSearch, FaSync, FaBrain, FaComments } from "react-icons/fa";

const SCREENSHOT_SRC = "/images/slides/shopify-listing/shopify-product-discovery-screenshot.png";

const BROWSER_CHROME_HEIGHT = 28;

const TOOL_CHIP_FIRST = "Shown products";
const TOOL_CHIP_SECOND = "Update shown products";

const MEMORY_AFTER_FIRST_RESPONSE = ["~$1,500", "Light", "Everyday work"];
const MEMORY_AFTER_SECOND_RESPONSE = ["Long battery"];

const HALF_WAVE_BAR_COUNT = 80;
const HALF_WAVE_HEIGHTS_TOP = [
  32, 58, 88, 48, 72, 38, 82, 52, 68, 92, 42, 78, 55, 85, 35, 65, 95, 45, 62,
  75, 28, 70, 50, 90, 58, 40, 78, 68, 48, 82, 55, 72, 38, 88, 62, 45, 75, 52,
];
const HALF_WAVE_HEIGHTS_BOTTOM = [
  68, 42, 85, 55, 38, 78, 48, 92, 62, 35, 72, 88, 52, 65, 45, 82, 58, 28, 75,
  50, 90, 48, 70, 42, 68, 95, 55, 78, 40, 62, 72, 45, 88, 58, 32, 82, 65, 48,
];

const ProductDiscoverySlide = () => {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setAspectRatio(img.naturalWidth / img.naturalHeight);
    }
  }, []);

  return (
  <div className="relative flex flex-col h-full w-full overflow-visible">
    <div className="relative z-10 flex flex-col flex-1 min-h-0 overflow-visible">
      {/* Grid: row 1 = title (col 1) + spacer (col 2); row 2 = image (col 1) + conversation (col 2) */}
      <div className="flex-1 grid grid-cols-[1.35fr_1fr] grid-rows-[auto_1fr] gap-x-10 gap-y-0 min-h-0 relative overflow-visible">
      {/* Flow diagram — loop icon in badge at top-right */}
      <div className="absolute top-8 left-0 right-0 z-20 flex items-center justify-end">
        <div className="relative">
          <div className="flex items-center gap-0 text-lg font-semibold text-primary border-2 border-primary/50 rounded-xl px-7 py-3.5 w-fit">
            <span className="inline-flex items-center gap-2">
              <FaBrain className="w-6 h-6 text-primary/80" />
              Understand intent
            </span>
            <span className="text-primary/40 mx-2.5 text-xl">→</span>
            <span className="inline-flex items-center gap-2">
              <FaSearch className="w-6 h-6 text-primary/80" />
              Search catalog
            </span>
            <span className="text-primary/40 mx-2.5 text-xl">→</span>
            <span className="inline-flex items-center gap-2">
              <FaComments className="w-6 h-6 text-primary/80" />
              Refine with follow-up
            </span>
          </div>
          <div
            className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-md"
            aria-hidden
          >
            <FaSync className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Row 1 col 1: Title block */}
      <div className="flex flex-col gap-1.5 mb-4 min-w-0">
        <div className="inline-flex items-center gap-2">
          <FaShoppingCart className="w-4 h-4 text-primary" />
          <span className="text-sm font-body font-semibold text-primary uppercase tracking-widest">
            Assisted Sales
          </span>
        </div>
        <h2 className="text-5xl font-heading font-bold text-foreground leading-tight">
          Guided Product Discovery
        </h2>
        <p className="text-lg text-muted-foreground font-body leading-relaxed">
          Customers speak naturally, and Bizmis guides them to the best-fit products.<br />
          Just like a real store clerk would.
        </p>
      </div>
      {/* Row 1 col 2: Spacer so row 1 height matches title */}
      <div className="min-w-0" aria-hidden />

      {/* Row 2 col 1: Screenshot */}
      <div className="flex flex-col flex-1 min-h-0 items-center pt-2 min-w-0">
        <div className="relative flex flex-col flex-1 min-h-0 w-full max-w-full rounded-xl overflow-hidden shadow-[0_8px_40px_-8px_rgba(0,0,0,0.15)] border border-black/[0.06]">
          <div
            className="bg-[#f1f1f1] flex items-center px-3 gap-1.5 border-b border-black/5 shrink-0"
            style={{ height: BROWSER_CHROME_HEIGHT }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-primary-dark" />
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <div className="w-2.5 h-2.5 rounded-full bg-primary-light" />
            <div className="flex-1 mx-8 min-w-0">
              <div className="bg-white rounded-md h-4 flex items-center px-2">
                <span className="text-[8px] text-gray-400 truncate">
                  your-shopify-store.com
                </span>
              </div>
            </div>
          </div>
          <div
            className="relative flex-1 min-h-0 w-full bg-white overflow-hidden"
            style={
              aspectRatio != null
                ? {
                    aspectRatio: aspectRatio,
                    maxWidth: "100%",
                  }
                : undefined
            }
          >
            <img
              src={SCREENSHOT_SRC}
              alt="Bizmis voice assistant helping a customer discover products in an online store."
              onLoad={onImageLoad}
              className="block w-full h-full object-contain object-center"
            />
          </div>
        </div>
      </div>

      {/* Row 2 col 2: Conversation — two half waves in flow (top + bottom) */}
      <div className="relative flex flex-col flex-1 min-h-0 min-w-0 overflow-visible pt-2">
        <div
          className="flex w-full gap-[2px] h-14 items-end pointer-events-none shrink-0 bg-transparent"
          aria-hidden
        >
          {Array.from({ length: HALF_WAVE_BAR_COUNT }).map((_, i) => (
            <div
              key={`top-${i}`}
              className="flex-1 min-w-[2px] max-w-[6px] rounded-full bg-primary/10"
              style={{ height: `${HALF_WAVE_HEIGHTS_TOP[i % HALF_WAVE_HEIGHTS_TOP.length]}%` }}
            />
          ))}
        </div>
        <div className="relative flex flex-1 flex-col justify-evenly min-h-0">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[95%] min-w-[280px] min-h-[260px] rounded-full bg-primary/[0.16] blur-[60px] pointer-events-none z-0"
            aria-hidden
          />
          <div className="relative z-10 flex flex-1 flex-col justify-evenly min-h-0">
          <p className="max-w-[82%] self-end text-right font-body text-xl leading-snug text-foreground/55">
            I'd love a light laptop, ideally around $1,500.
          </p>
          <p className="max-w-[82%] self-start font-heading text-[1.35rem] font-bold leading-relaxed text-foreground/80">
            What kind of <strong className="font-extrabold text-primary-dark/85">day-to-day use</strong> do you have in mind?
          </p>
          <p className="max-w-[82%] self-end text-right font-body text-xl leading-snug text-foreground/55">
            Mostly <strong className="font-semibold text-foreground">work, travel, and browsing</strong>.
          </p>
          <div className="self-start flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 backdrop-blur-md border border-primary/25 px-4 py-2 text-sm font-heading font-semibold text-primary-dark">
              <FaSearch className="w-3.5 h-3.5 text-primary/80" />
              {TOOL_CHIP_FIRST}
            </span>
            <span className="inline-flex flex-wrap items-center gap-1.5 text-xs font-body text-muted-foreground">
              <FaBrain className="w-3 h-3 text-primary/50 shrink-0" />
              {MEMORY_AFTER_FIRST_RESPONSE.map((concept, i) => (
                <span key={concept} className="inline-flex items-center gap-1.5">
                  {i > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" aria-hidden />
                  )}
                  {concept}
                </span>
              ))}
            </span>
          </div>
          <div className="flex flex-col gap-5 max-w-[82%] w-full">
            <p className="max-w-[82%] self-start font-heading text-[1.35rem] font-bold leading-relaxed text-foreground/80">
              Would longer <strong className="font-extrabold text-primary-dark/85">battery life</strong> be more important than extra screen space?
            </p>
            <p className="max-w-[82%] self-end text-right font-body text-xl leading-snug text-foreground/55">
              Yeah, <strong className="font-semibold text-foreground">battery life</strong> for sure.
            </p>
            <div className="self-start flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 backdrop-blur-md border border-primary/25 px-4 py-2 text-sm font-heading font-semibold text-primary-dark">
                <FaSearch className="w-3.5 h-3.5 text-primary/80" />
                {TOOL_CHIP_SECOND}
              </span>
              <span className="inline-flex flex-wrap items-center gap-1.5 text-xs font-body text-muted-foreground">
                <FaBrain className="w-3 h-3 text-primary/50 shrink-0" />
                {MEMORY_AFTER_SECOND_RESPONSE.map((concept, i) => (
                  <span key={concept} className="inline-flex items-center gap-1.5">
                    {i > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" aria-hidden />
                    )}
                    {concept}
                  </span>
                ))}
              </span>
            </div>
          </div>
        </div>
        </div>
        <div
          className="flex w-full gap-[2px] h-14 items-end pointer-events-none shrink-0 scale-y-[-1] bg-transparent"
          aria-hidden
        >
          {Array.from({ length: HALF_WAVE_BAR_COUNT }).map((_, i) => (
            <div
              key={`bottom-${i}`}
              className="flex-1 min-w-[2px] max-w-[6px] rounded-full bg-primary/10"
              style={{ height: `${HALF_WAVE_HEIGHTS_BOTTOM[i % HALF_WAVE_HEIGHTS_BOTTOM.length]}%` }}
            />
          ))}
        </div>
      </div>
    </div>
    </div>
  </div>
  );
};

export default ProductDiscoverySlide;
