import { FaCartPlus } from "react-icons/fa";
import { Scale } from "lucide-react";
import {
  AgentLine,
  Accent,
  Exchange,
  ShopperLine,
  ShotCard,
  Strong,
  LandingHead,
  ToolChip,
} from "./listingParts";
import { listingAsset } from "./listingAssets";

/** Frame from the Meridian demo take v19-179: travel adapters shown, the agent's pick in the subtitles (t=152 s). */
const SCREENSHOT_SRC = listingAsset("store-addon-pick.jpg");

const ProductComparisonSlide = () => (
  <div className="relative flex h-full w-full flex-col overflow-visible">
    <LandingHead
      Icon={Scale}
      eyebrow="Sales"
      title="Doubts turn into decisions"
      lead="It compares options on what the shopper cares about, then suggests what goes with the cart."
    />
    <div className="mt-9 grid min-h-0 flex-1 grid-cols-[1fr_1.45fr] items-center gap-x-12">
      <Exchange>
        <ShopperLine>
          <Strong>Weight</Strong> matters most. Is the Surface lighter?
        </ShopperLine>
        <AgentLine>
          Yeah, it's even lighter, <Accent>just under three pounds</Accent>.
        </AgentLine>
        <ToolChip Icon={FaCartPlus} label="Added to cart" notes={["Surface Laptop 7"]} />
        <AgentLine>
          Since you fly a lot, want to see a few <Accent>travel adapters</Accent> for it?
        </AgentLine>
        <ShopperLine>Sure. Which one would you pick?</ShopperLine>
        <AgentLine>
          The <Accent>Zendure</Accent>. It charges that Surface anywhere in the world.
        </AgentLine>
      </Exchange>
      <ShotCard
        src={SCREENSHOT_SRC}
        alt="Bizmis sales agent suggesting a travel adapter that goes with the laptop in the cart"
        className="relative aspect-[16/9] w-full"
      />
    </div>
  </div>
);

export default ProductComparisonSlide;
