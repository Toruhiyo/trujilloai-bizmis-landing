import { FaCartPlus, FaComments, FaEye } from "react-icons/fa";
import { House } from "lucide-react";
import { FeatureCard, LandingHead, ShotCard, Stains } from "./listingParts";
import { listingAsset } from "./listingAssets";

/** Meridian's Bizmis Home (admin, Last 12 months), captured 2026-11-03. */
const SCREENSHOT_SRC = listingAsset("admin-home.png");

const MerchantHomeSlide = () => (
  <div className="relative flex h-full w-full flex-col overflow-visible">
    <LandingHead
      Icon={House}
      eyebrow="Home"
      title="See what Bizmis did for your store"
      lead="Home leads with what your sales agent did, and the products shoppers put in their carts with it."
    />
    <div className="mt-9 grid min-h-0 flex-1 grid-cols-[0.62fr_1.45fr] items-center gap-x-12">
      <div className="flex min-w-0 flex-col gap-3">
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
      <div className="relative flex min-w-0 items-center overflow-visible">
        <Stains />
        <ShotCard
          src={SCREENSHOT_SRC}
          alt="Bizmis Home in the Shopify admin: shoppers helped, products shown and added to cart"
          className="relative z-10 aspect-[1506/778] w-full"
        />
      </div>
    </div>
  </div>
);

export default MerchantHomeSlide;
