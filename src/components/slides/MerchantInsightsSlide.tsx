import { FaFileAlt, FaPlay, FaTags } from "react-icons/fa";
import { ChartLine } from "lucide-react";
import { FeatureCard, LandingHead, ShotCard, Stains } from "./listingParts";
import { listingAsset } from "./listingAssets";

/** Meridian's Insights (Last 12 months) and one session's replay, captured 2026-11-03. */
const OVERVIEW_SRC = listingAsset("admin-insights-overview.png");
const REPLAY_SRC = listingAsset("admin-session-transcript.png");

const MerchantInsightsSlide = () => (
  <div className="relative flex h-full w-full flex-col overflow-visible">
    <LandingHead
      Icon={ChartLine}
      eyebrow="Store Insights"
      title="See what sells. Fix what doesn't."
      lead="Replay any session to see why a cart was left, what was said and which products were shown."
    />
    <div className="mt-9 grid min-h-0 flex-1 grid-cols-[0.62fr_1.45fr] gap-x-10">
      <div className="flex min-w-0 flex-col justify-center gap-3">
        <FeatureCard Icon={FaPlay} title="Session replays">
          Play the voice and follow the pages the shopper visited.
        </FeatureCard>
        <FeatureCard Icon={FaFileAlt} title="Transcripts">
          Every message, with the products your sales agent showed.
        </FeatureCard>
        <FeatureCard Icon={FaTags} title="Top products and questions">
          What shoppers asked about most, and what went into carts.
        </FeatureCard>
      </div>
      <div className="relative h-full min-h-0 min-w-0 overflow-visible">
        <Stains />
        <ShotCard
          src={OVERVIEW_SRC}
          alt="Bizmis Insights: sessions, products shown and added to cart over the last 12 months"
          className="absolute right-0 top-0 z-10 aspect-[1506/778] w-[86%]"
        />
        <ShotCard
          src={REPLAY_SRC}
          alt="A session's replay: the voice track and the transcript, with the product the agent showed"
          className="absolute bottom-0 left-0 z-20 aspect-[787/725] w-[36%] shadow-[0_16px_60px_-10px_rgba(0,0,0,0.25)]"
        />
      </div>
    </div>
  </div>
);

export default MerchantInsightsSlide;
