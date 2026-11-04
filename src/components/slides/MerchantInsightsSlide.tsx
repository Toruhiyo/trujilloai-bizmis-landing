import { FaChartLine, FaFileAlt, FaPlay, FaTags } from "react-icons/fa";
import { FeatureCard, ShotCard, Stains, TitleBlock } from "./listingParts";
import { listingAsset } from "./listingAssets";

/** Meridian's Insights (Last 12 months) and one session's replay, captured 2026-11-03. */
const OVERVIEW_SRC = listingAsset("admin-insights-overview.png");
const REPLAY_SRC = listingAsset("admin-session-transcript.png");

const MerchantInsightsSlide = () => (
  <div className="relative grid h-full w-full grid-cols-[0.8fr_1.35fr] gap-x-10 overflow-visible">
    <div className="flex min-w-0 flex-col justify-center gap-8">
      <TitleBlock
        Icon={FaChartLine}
        eyebrow="Store insights"
        title={
          <>
            See What Sells.
            <br />
            Fix What Doesn't.
          </>
        }
        lead="Replay any session to see why a cart was left, what was said and which products were shown."
      />
      <div className="flex flex-col gap-3">
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
    </div>
    <div className="relative h-full min-h-0 min-w-0 overflow-visible">
      <Stains />
      <ShotCard
        src={OVERVIEW_SRC}
        alt="Bizmis Insights: sessions, products shown and added to cart over the last 12 months"
        className="absolute right-0 top-0 z-10 aspect-[1506/778] w-[92%]"
      />
      <ShotCard
        src={REPLAY_SRC}
        alt="A session's replay: the voice track and the transcript, with the product the agent showed"
        className="absolute left-0 top-[40%] z-20 aspect-[787/725] w-[44%] shadow-[0_16px_60px_-10px_rgba(0,0,0,0.25)]"
      />
    </div>
  </div>
);

export default MerchantInsightsSlide;
