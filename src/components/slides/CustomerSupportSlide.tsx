import { FaFileAlt, FaHeadset } from "react-icons/fa";
import {
  AgentLine,
  Accent,
  Exchange,
  ShopperLine,
  ShotCard,
  TitleBlock,
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
  <div className="relative grid h-full w-full grid-cols-[1.5fr_1fr] gap-x-12 overflow-visible">
    <div className="flex min-w-0 flex-col justify-center gap-10">
      <TitleBlock
        Icon={FaHeadset}
        eyebrow="Customer support"
        title={<>Cut Support Workload,<br />Day and Night</>}
        lead="It answers warranty, shipping and returns questions from your own policies, so only the few that need you reach your inbox."
      />
      <ShotCard
        src={SCREENSHOT_SRC}
        alt="Bizmis sales agent answering a warranty question by voice on a product page"
        className="relative aspect-[16/9] w-full"
      />
    </div>
    <div className="flex min-w-0 flex-col justify-center gap-8">
      <Exchange>
        <ShopperLine>The smaller one's fine. Does it come with a warranty?</ShopperLine>
        <ToolChip Icon={FaFileAlt} label="Warranty policy" notes={["Checked on the spot"]} />
        <AgentLine>
          Yes, it includes a <Accent>2-year manufacturer and store warranty</Accent> for defects in materials
          and workmanship.
        </AgentLine>
      </Exchange>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-body text-primary/70">
        {TOPICS.map((topic, i) => (
          <span key={topic} className="inline-flex items-center gap-3">
            {i > 0 && <span className="h-1 w-1 rounded-full bg-primary/40" aria-hidden />}
            {topic}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default CustomerSupportSlide;
