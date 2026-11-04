import { FaBrain, FaComments, FaSearch, FaShoppingCart, FaSync } from "react-icons/fa";
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

/** Frame from the Meridian demo take v19-179 (live widget, 3 laptops on screen). */
const SCREENSHOT_SRC = listingAsset("store-discovery.jpg");

const REMEMBERED = ["Windows", "~$1,200", "Portable"] as const;

const FlowBadge = () => (
  <div className="relative w-fit">
    <div className="flex w-fit items-center rounded-xl border-2 border-primary/50 whitespace-nowrap px-5 py-3 text-sm font-semibold text-primary">
      <span className="inline-flex items-center gap-2">
        <FaBrain className="h-5 w-5 text-primary/80" />
        Understand the need
      </span>
      <span className="mx-2.5 text-xl text-primary/40">→</span>
      <span className="inline-flex items-center gap-2">
        <FaSearch className="h-5 w-5 text-primary/80" />
        Search the catalog
      </span>
      <span className="mx-2.5 text-xl text-primary/40">→</span>
      <span className="inline-flex items-center gap-2">
        <FaComments className="h-5 w-5 text-primary/80" />
        Ask what matters
      </span>
    </div>
    <div
      className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"
      aria-hidden
    >
      <FaSync className="h-4 w-4" />
    </div>
  </div>
);

const ProductDiscoverySlide = () => (
  <div className="relative grid h-full w-full grid-cols-[1.5fr_1fr] gap-x-12 overflow-visible">
    <div className="flex min-w-0 flex-col justify-center gap-10">
      <TitleBlock
        Icon={FaShoppingCart}
        eyebrow="Sales: match needs"
        title="More Shoppers Find a Fit"
        lead="Your sales agent narrows your whole catalog to the few products that fit what each shopper asks for."
      />
      <ShotCard
        src={SCREENSHOT_SRC}
        alt="Bizmis sales agent showing three matching laptops on a store's search page"
        className="relative aspect-[16/9] w-full"
      />
    </div>
    <div className="flex min-w-0 flex-col justify-center gap-10">
      <div className="flex justify-end">
        <FlowBadge />
      </div>
      <Exchange>
        <ShopperLine>
          I'm looking for a <Strong>Windows laptop</Strong> for work, around <Strong>$1,200</Strong>. I fly a
          lot, so it has to be <Strong>portable</Strong>.
        </ShopperLine>
        <ToolChip Icon={FaSearch} label="Shown products" NoteIcon={FaBrain} notes={REMEMBERED} />
        <AgentLine>
          Which matters more on all those flights: keeping the <Accent>weight</Accent> down, or stretching
          the <Accent>battery life</Accent>?
        </AgentLine>
      </Exchange>
    </div>
  </div>
);

export default ProductDiscoverySlide;
