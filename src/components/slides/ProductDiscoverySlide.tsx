import { useState, useCallback } from "react";
import { FaShoppingCart, FaSearch, FaSync, FaBrain, FaComments } from "react-icons/fa";
import { CONTENT_INSET_PX } from "./SlideDeck";

const SCREENSHOT_SRC = "/images/slides/shopify-listing/shopify-product-discovery-screenshot.png";

const BROWSER_CHROME_HEIGHT = 28;

const TOOL_CHIP_FIRST = "Shown products";
const TOOL_CHIP_SECOND = "Update shown products";

const MEMORY_AFTER_FIRST_RESPONSE = ["~$1,500", "Portable", "Everyday work"];
const MEMORY_AFTER_SECOND_RESPONSE = ["Long battery"];

const COVER_WAVEFORM_BAR_COUNT = 200;
const COVER_WAVEFORM_HEIGHTS = [
  28, 42, 58, 75, 62, 45, 55, 70, 80, 52, 38, 65, 48, 58, 82, 65, 42, 55, 70,
  85, 92, 78, 62, 48, 65, 72, 58, 80, 68, 45, 52, 75, 88, 60, 42, 55, 70, 65, 48,
  58, 45, 50, 46, 42, 38, 44, 54, 50, 65, 78, 55, 42, 68, 85, 72, 58, 45, 62,
  38, 52, 70, 82, 60, 48, 55, 75, 90, 68, 42, 58, 80, 65, 45, 52, 72, 88, 55, 38,
  62, 48, 70, 85, 58, 42, 65, 78, 50, 35, 55, 68, 45, 60, 72, 52, 38, 82, 65, 48,
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
      {/* Audio wave watermark — center line at 50% of row 2 */}
      <div
        className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex items-center justify-center gap-[2px] h-44 pointer-events-none z-0"
        style={{
          left: -CONTENT_INSET_PX,
          right: -CONTENT_INSET_PX,
          maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
        aria-hidden
      >
        {Array.from({ length: COVER_WAVEFORM_BAR_COUNT }).map((_, i) => (
          <div
            key={i}
            className="flex-1 min-w-[2px] max-w-[8px] rounded-full bg-primary/10"
            style={{ height: `${COVER_WAVEFORM_HEIGHTS[i % COVER_WAVEFORM_HEIGHTS.length]}%` }}
          />
        ))}
      </div>
      {/* Flow diagram — right-aligned, lowered and larger */}
      <div className="absolute top-20 left-0 right-0 z-20 flex items-center justify-end">
        <div className="flex items-center gap-0 text-lg font-semibold rounded-2xl px-6 py-3 border-2 border-primary-dark/30 text-primary-dark">
          <span className="inline-flex items-center gap-2">
            <FaBrain className="w-5 h-5 text-primary-dark/80" />
            Understand intent
          </span>
          <span className="text-primary/60 mx-2 text-xl">→</span>
          <span className="inline-flex items-center gap-2">
            <FaSearch className="w-5 h-5 text-primary-dark/80" />
            Search catalog
          </span>
          <span className="text-primary/60 mx-2 text-xl">→</span>
          <span className="inline-flex items-center gap-2">
            <FaComments className="w-5 h-5 text-primary-dark/80" />
            Refine with follow-up
          </span>
          <FaSync className="w-6 h-6 text-primary/80 ml-4 shrink-0" />
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

      {/* Row 2 col 2: Conversation — same row as image */}
      <div className="relative flex flex-col flex-1 min-h-0 min-w-0 overflow-visible pt-2">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[120%] min-w-[320px] min-h-[320px] rounded-full bg-primary/[0.08] blur-[80px] pointer-events-none z-0"
          aria-hidden
        />
        <div className="relative z-10 flex flex-1 flex-col justify-evenly min-h-0">
          <p className="text-xl text-foreground/70 font-body leading-snug text-right self-end max-w-[82%]">
            I’m looking for a <strong className="font-semibold text-foreground">lightweight laptop</strong>, something around <strong className="font-semibold text-foreground">$1,500</strong>.
          </p>
          <p className="text-[1.4rem] text-foreground/75 font-heading font-bold leading-snug self-start max-w-[82%]">
            What kind of <strong className="font-extrabold text-primary-dark/85">day-to-day use</strong> do you have in mind?
          </p>
          <p className="text-xl text-foreground/70 font-body leading-snug text-right self-end max-w-[82%]">
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
          <div
            className="flex flex-col gap-5 max-w-[82%] w-full"
            style={{
              maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
            }}
          >
            <p className="text-[1.4rem] text-foreground/75 font-heading font-bold leading-snug self-start max-w-[82%]">
              Would longer <strong className="font-extrabold text-primary-dark/85">battery life</strong> be more important than extra screen space?
            </p>
            <p className="text-xl text-foreground/70 font-body leading-snug text-right self-end max-w-[82%]">
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
            <div className="self-start flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
  );
};

export default ProductDiscoverySlide;
