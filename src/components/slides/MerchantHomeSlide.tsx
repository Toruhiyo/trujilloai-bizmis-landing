import { FaCartPlus, FaComments, FaEye, FaHome } from "react-icons/fa";
import { FeatureCard, ShotCard, Stains, TitleBlock } from "./listingParts";
import { listingAsset } from "./listingAssets";

/** Meridian's Bizmis Home (admin, Last 12 months), captured 2026-11-03. */
const SCREENSHOT_SRC = listingAsset("admin-home.png");

const MerchantHomeSlide = () => (
  <div className="relative grid h-full w-full grid-cols-[0.75fr_1.45fr] gap-x-12 overflow-visible">
    <div className="flex min-w-0 flex-col justify-center gap-8">
      <TitleBlock
        Icon={FaHome}
        eyebrow="Home"
        title={
          <>
            See What Bizmis
            <br />
            Did for Your Store
          </>
        }
        lead="Home leads with what your sales agent achieved, and the products shoppers put in their carts with it."
      />
      <div className="flex flex-col gap-3">
        <FeatureCard Icon={FaComments} title="Asked">
          The questions shoppers brought to your sales agent.
        </FeatureCard>
        <FeatureCard Icon={FaEye} title="Shown products">
          What it put on screen for them.
        </FeatureCard>
        <FeatureCard Icon={FaCartPlus} title="Added to cart">
          The products that went into carts.
        </FeatureCard>
      </div>
    </div>
    <div className="relative flex min-w-0 items-center overflow-visible">
      <Stains />
      <ShotCard
        src={SCREENSHOT_SRC}
        alt="Bizmis Home in the Shopify admin: shoppers helped, products shown and added to cart"
        className="relative z-10 aspect-[1506/778] w-full"
      />
    </div>
  </div>
);

export default MerchantHomeSlide;
