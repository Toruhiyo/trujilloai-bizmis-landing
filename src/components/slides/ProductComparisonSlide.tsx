import { useState, useCallback } from "react";
import { FaShoppingCart, FaBalanceScale, FaCheckCircle, FaCartPlus, FaTag } from "react-icons/fa";
import {
  HALF_WAVE_BAR_COUNT,
  halfWaveBarHeightPercent,
  halfWaveBarOpacity,
} from "./slideWaveformHeights";

const SCREENSHOT_SRC = "/images/slides/shopify-listing/shopify-product-comparison-and-checkout-screenshot.png";

const BROWSER_CHROME_HEIGHT = 28;

const ProductComparisonSlide = () => {
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
        {/* Grid: col 1 = title + process (row 1), conversation (row 2); col 2 = screenshot spanning full height */}
        <div className="flex-1 grid grid-cols-[1.1fr_1.25fr] grid-rows-[auto_1fr] gap-x-10 gap-y-0 min-h-0 relative overflow-visible">
          {/* Row 1 col 1: Title block + process bar */}
          <div className="flex flex-col gap-3 mb-2 min-w-0">
            <div className="flex flex-col gap-1.5">
              <div className="inline-flex items-center gap-2">
                <FaShoppingCart className="w-4 h-4 text-primary" />
                <span className="text-sm font-body font-semibold text-primary uppercase tracking-widest">
                  Assisted Sales
                </span>
              </div>
              <h2 className="text-5xl font-heading font-bold text-foreground leading-tight">
                Product Comparison & Cross-sell
              </h2>
              <p className="text-lg text-muted-foreground font-body leading-relaxed">
                Bizmis compares the best-fit options, answers buying questions, and can cross-sell related items (e.g. laptop case, sleeve) before checkout.
              </p>
            </div>
            {/* Process bar — single line, compact spacing */}
            <div className="flex items-center flex-nowrap gap-0 text-base font-semibold text-primary border-2 border-primary/50 rounded-xl px-4 py-3 w-fit whitespace-nowrap">
              <span className="inline-flex items-center gap-1.5 shrink-0">
                <FaBalanceScale className="w-5 h-5 text-primary/80 shrink-0" />
                Compare options
              </span>
              <span className="text-primary/40 mx-1.5 text-lg shrink-0">→</span>
              <span className="inline-flex items-center gap-1.5 shrink-0">
                <FaCheckCircle className="w-5 h-5 text-primary/80 shrink-0" />
                Confirm best fit
              </span>
              <span className="text-primary/40 mx-1.5 text-lg shrink-0">→</span>
              <span className="inline-flex items-center gap-1.5 shrink-0">
                <FaTag className="w-5 h-5 text-primary/80 shrink-0" />
                Cross-sell add-ons
              </span>
            </div>
          </div>

          {/* Row 2 col 1: Conversation — two half waves in flow (top + bottom) */}
          <div className="relative flex flex-col flex-1 min-h-0 min-w-0 overflow-visible pt-2">
            <div
              className="flex w-full gap-[2px] h-14 items-end pointer-events-none shrink-0 bg-transparent"
              aria-hidden
            >
              {Array.from({ length: HALF_WAVE_BAR_COUNT }).map((_, i) => (
                <div
                  key={`top-${i}`}
                  className="flex-1 min-w-[2px] max-w-[6px] rounded-full bg-primary/10"
                  style={{
                  height: `${halfWaveBarHeightPercent(i, "top")}%`,
                  opacity: halfWaveBarOpacity(i),
                }}
                />
              ))}
            </div>
            <div className="relative flex flex-1 flex-col justify-evenly min-h-0 gap-5">
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[95%] min-w-[280px] min-h-[260px] rounded-full bg-primary/[0.20] blur-[60px] pointer-events-none z-0"
                aria-hidden
              />
              <div className="relative z-10 flex flex-col gap-5">
                <p className="max-w-[82%] self-start text-left font-body text-xl leading-snug text-foreground/55">
                  Which would you say is <strong className="font-semibold text-foreground">better for travel</strong>?
                </p>
                <div className="self-end max-w-[82%] text-right">
                  <p className="font-heading text-[1.35rem] font-bold leading-relaxed text-foreground/80">
                    The <strong className="font-extrabold text-primary-dark/85">LG gram</strong>—lighter and longer battery.
                  </p>
                </div>
                <p className="max-w-[82%] self-start text-left font-body text-xl leading-snug text-foreground/55">
                  Let&apos;s go with <strong className="font-semibold text-foreground">that one</strong>. How long is <strong className="font-semibold text-foreground">shipping</strong>?
                </p>
                <div className="self-end max-w-[82%] text-right">
                  <p className="font-heading text-[1.35rem] font-bold leading-relaxed text-foreground/80">
                    <strong className="font-extrabold text-primary-dark/85">2–3 business days</strong>. Want a <strong className="font-extrabold text-primary-dark/85">laptop case</strong> or <strong className="font-extrabold text-primary-dark/85">sleeve</strong> to go with it? I can add the laptop to your cart.
                  </p>
                </div>
                <div className="self-end flex flex-nowrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap rounded-full bg-primary/15 backdrop-blur-md border border-primary/25 px-4 py-2 text-sm font-heading font-semibold text-primary-dark">
                    <FaCartPlus className="w-3.5 h-3.5 shrink-0 text-primary/80" />
                    Add to cart
                  </span>
                  <span className="inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap rounded-full bg-primary/15 backdrop-blur-md border border-primary/25 px-4 py-2 text-sm font-heading font-semibold text-primary-dark">
                    <FaTag className="w-3.5 h-3.5 shrink-0 text-primary/80" />
                    Cross-sell related items
                  </span>
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
                  style={{
                  height: `${halfWaveBarHeightPercent(i, "bottom")}%`,
                  opacity: halfWaveBarOpacity(i),
                }}
                />
              ))}
            </div>
          </div>

          {/* Col 2: Screenshot spanning full height (same vertical area as title + conversation on left) */}
          <div className="col-start-2 row-start-1 row-span-2 flex flex-col flex-1 min-h-0 items-center justify-center min-w-0">
            <div className="relative flex flex-col flex-1 min-h-0 w-full max-w-full rounded-xl overflow-hidden shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)] border border-black/[0.06]">
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
                  alt="Bizmis helping customer compare products and add to cart on a Shopify store."
                  onLoad={onImageLoad}
                  className="block w-full h-full object-contain object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductComparisonSlide;
