import { FaFileAlt } from "react-icons/fa";
import { Headset } from "lucide-react";
import {
  AgentLine,
  Accent,
  Exchange,
  ShopperLine,
  ShotCard,
  LandingHead,
  MUTED,
  ToolChip,
} from "./listingParts";
import { listingAsset } from "./listingAssets";

/** Frame from the Meridian demo take v19-179: voice mode, the warranty answer in the subtitles. */
const SCREENSHOT_SRC = listingAsset("store-warranty.jpg");

const TOPICS = [
  "Returns",
  "Shipping",
  "Order status",
  "Warranty",
  "Discounts",
  "FAQs",
] as const;

const CustomerSupportSlide = () => (
  <div className="relative flex h-full w-full flex-col overflow-visible">
    <LandingHead
      Icon={Headset}
      eyebrow="Customer Support"
      title="Cut support workload. Day and night."
      lead="It answers from your own policies, so only the few questions that need you reach your inbox."
    />
    <div className="mt-9 grid min-h-0 flex-1 grid-cols-[1.45fr_1fr] items-center gap-x-12">
      <ShotCard
        src={SCREENSHOT_SRC}
        alt="Bizmis sales agent answering a warranty question by voice on a product page"
        className="relative aspect-[16/9] w-full"
      />
      <div className="flex min-w-0 flex-col gap-6">
        <Exchange>
          <ShopperLine>The smaller one's fine. Does it come with a warranty?</ShopperLine>
          <ToolChip Icon={FaFileAlt} label="Warranty policy" notes={["Checked on the spot"]} />
          <AgentLine>
            Yes, it includes a <Accent>2-year manufacturer and store warranty</Accent> for defects in materials
            and workmanship.
          </AgentLine>
        </Exchange>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm" style={{ fontFamily: "Inter, sans-serif", color: MUTED }}>
          {TOPICS.map((topic, i) => (
            <span key={topic} className="inline-flex items-center gap-3">
              {i > 0 && <span className="h-1 w-1 rounded-full bg-primary/50" aria-hidden />}
              {topic}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default CustomerSupportSlide;
