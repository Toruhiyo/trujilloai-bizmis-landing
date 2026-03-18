import { FaChartLine, FaPlay, FaTags, FaRoute } from "react-icons/fa";

const DASHBOARD_IMAGE_SRC = "/images/slides/shopify-listing/merchant-insights-dashboard.png";

const INSIGHT_CARDS = [
  {
    icon: FaPlay,
    title: "Session Replays",
    description: "Jump straight to hesitation points and drop-offs.",
  },
  {
    icon: FaTags,
    title: "Auto-Tagged Chats",
    description: "See repeated questions grouped by topic and intent.",
  },
  {
    icon: FaRoute,
    title: "Funnel Insights",
    description: "Spot which conversations move customers toward checkout.",
  },
];

const EXAMPLE_INSIGHTS = [
  { label: "Top question", value: "Shipping times" },
  { label: "Top hesitation", value: "Battery life vs screen size" },
  { label: "Top path", value: "Compare → Add to cart → Checkout" },
];

const MerchantInsightsSlide = () => (
  <div className="relative flex flex-col h-full w-full overflow-visible">
    <div className="relative z-10 flex flex-col flex-1 min-h-0 overflow-visible">
      <div className="flex-1 grid grid-cols-[1fr_1.15fr] gap-x-12 gap-y-0 min-h-0 items-center">
        {/* Left: Eyebrow, title, subtitle, cards, example insights */}
        <div className="flex flex-col gap-6 min-w-0 py-2">
          <div className="flex flex-col gap-1.5">
            <div className="inline-flex items-center gap-2">
              <FaChartLine className="w-4 h-4 text-primary" />
              <span className="text-sm font-body font-semibold text-primary uppercase tracking-widest">
                Conversation Analytics
              </span>
            </div>
            <h2 className="text-5xl font-heading font-bold text-foreground leading-tight">
              Replays to Unlock Growth
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

          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 pt-1 border-t border-border/40">
            {EXAMPLE_INSIGHTS.map(({ label, value }) => (
              <span
                key={label}
                className="text-xs font-body text-muted-foreground/75"
              >
                <span className="font-medium text-muted-foreground/90">{label}:</span>{" "}
                {value}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Dashboard image */}
        <div className="flex flex-1 min-h-0 min-w-0 items-center justify-center">
          <div className="relative w-full max-w-full h-full min-h-[320px] flex items-center justify-center">
            <img
              src={DASHBOARD_IMAGE_SRC}
              alt="Merchant dashboard showing session replays, chat topics, and conversion insights"
              className="max-h-full w-full object-contain object-center rounded-xl shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)] border border-border/40"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default MerchantInsightsSlide;
