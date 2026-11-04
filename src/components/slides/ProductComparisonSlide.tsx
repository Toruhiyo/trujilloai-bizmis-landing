import { FaBalanceScale, FaCartPlus } from "react-icons/fa";
import {
  AgentLine,
  Accent,
  Exchange,
  ShopperLine,
  ShotCard,
  Strong,
  TitleBlock,
  ToolChip,
} from "./listingParts";
import { listingAsset } from "./listingAssets";

/** Frame from the Meridian demo take v19-179: travel adapters shown, the agent's pick in the subtitles (t=152 s). */
const SCREENSHOT_SRC = listingAsset("store-addon-pick.jpg");

const ProductComparisonSlide = () => (
  <div className="relative grid h-full w-full grid-cols-[1fr_1.5fr] gap-x-12 overflow-visible">
    <div className="flex min-w-0 flex-col justify-center">
      <Exchange>
        <ShopperLine>
          <Strong>Weight</Strong> matters most. Is the Surface lighter?
        </ShopperLine>
        <AgentLine>
          Yeah, the Surface Laptop 7 is even lighter, <Accent>just under three pounds</Accent>.
        </AgentLine>
        <ToolChip Icon={FaCartPlus} label="Added to cart" notes={["Surface Laptop 7"]} />
        <AgentLine>
          It's in the cart, and since you fly a lot, want me to show you a few <Accent>travel adapters</Accent>{" "}
          for it?
        </AgentLine>
        <ShopperLine>Sure, show me. Which one would you pick?</ShopperLine>
        <AgentLine>
          My pick for you is the <Accent>Zendure</Accent>. It can charge that Surface anywhere in the world.
        </AgentLine>
      </Exchange>
    </div>
    <div className="flex min-w-0 flex-col justify-center gap-10">
      <TitleBlock
        Icon={FaBalanceScale}
        eyebrow="Sales: clear doubts"
        title={
          <>
            Doubts Turn
            <br />
            Into Decisions
          </>
        }
        lead="It compares options on what the shopper cares about, then suggests what goes with the cart."
      />
      <ShotCard
        src={SCREENSHOT_SRC}
        alt="Bizmis sales agent suggesting a travel adapter that goes with the laptop in the cart"
        className="relative aspect-[16/9] w-full"
      />
    </div>
  </div>
);

export default ProductComparisonSlide;
