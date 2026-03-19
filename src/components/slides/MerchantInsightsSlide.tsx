import { FaChartLine, FaPlay, FaTags, FaRoute } from "react-icons/fa";

const BROWSER_CHROME_HEIGHT = 28;

const ANALYTICS_TABLE_SRC = "/images/slides/shopify-listing/shopify-analytics-screenshot-table.png";
const ANALYTICS_MODAL_SRC = "/images/slides/shopify-listing/shopify-analytics-screenshot-modal.png";

const INSIGHT_CARDS = [
  {
    icon: FaPlay,
    title: "Session Replays",
    description: "Jump straight to hesitation points and drop-offs.",
  },
  {
    icon: FaTags,
    title: "Auto-Tagged Chats",
    description: "See repeated questions grouped by topic.",
  },
  {
    icon: FaRoute,
    title: "Funnel Insights",
    description: "Spot which conversations move customers toward checkout.",
  },
];

const MerchantInsightsSlide = () => (
  <div className="relative flex h-full w-full min-h-0 min-w-0 flex-col overflow-visible">
    <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-visible">
      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-[0.88fr_1.78fr] grid-rows-1 gap-x-12 items-stretch overflow-visible">
        {/* Left: Eyebrow, title, subtitle, cards — overflow visible so card/title shadows are not clipped */}
        <div className="flex min-h-0 min-w-0 flex-col gap-6 overflow-visible py-2 pr-1">
          <div className="flex flex-col gap-1.5">
            <div className="inline-flex items-center gap-2">
              <FaChartLine className="w-4 h-4 text-primary" />
              <span className="text-sm font-body font-semibold text-primary uppercase tracking-widest">
                Conversation Analytics
              </span>
            </div>
            <h2 className="text-5xl font-heading font-bold text-foreground leading-tight">
              Replays to
              <br />
              Unlock Growth
            </h2>
            <p className="text-lg text-muted-foreground font-body leading-relaxed">
              See where customers move forward, where they get stuck, and what to change to grow sales and reduce support load.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {INSIGHT_CARDS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex items-start gap-4 rounded-xl border border-border/50 bg-background/60 px-4 py-3.5"
              >
                <div className="shrink-0 mt-0.5 rounded-lg bg-primary/10 p-2">
                  <Icon className="h-4 w-4 text-primary-dark/80" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-heading font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body leading-snug mt-0.5">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Diffuse stains + table + modal — overflow visible so drop shadows extend past column / inset without clipping */}
        <div className="relative flex h-full min-h-0 min-w-0 flex-col overflow-visible">
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[125%] w-[110%] min-h-[420px] min-w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.09] blur-[80px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[95%] w-[88%] min-h-[320px] min-w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.12] blur-[50px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[72%] w-[62%] min-h-[240px] min-w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.07] blur-[35px]"
            aria-hidden
          />
          <div className="relative z-10 flex h-full min-h-0 w-full flex-1 overflow-visible">
            <div className="absolute top-0 right-0 z-0 flex h-[85%] w-full max-w-[45.5rem] justify-end">
              <div className="relative inline-flex h-full min-h-0 w-max max-w-full flex-col overflow-hidden rounded-xl shadow-[0_8px_40px_-8px_rgba(0,0,0,0.15)] border border-black/[0.06]">
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
                <div className="relative flex min-h-0 flex-1 w-full items-center justify-center overflow-hidden bg-white">
                  <img
                    src={ANALYTICS_TABLE_SRC}
                    alt="Analytics table view of session replays and chat topics"
                    className="block h-full w-auto max-w-full object-contain object-center"
                  />
                </div>
              </div>
            </div>
            <img
              src={ANALYTICS_MODAL_SRC}
              alt="Session replay or detail modal overlay"
              className="absolute bottom-0 left-0 z-10 max-h-[min(78%,100%)] max-w-[min(88%,100%)] w-auto object-contain object-bottom rounded-xl shadow-[0_20px_60px_-12px_rgba(0,0,0,0.25)]"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default MerchantInsightsSlide;
