import { FaBook, FaPalette, FaUserAlt, FaWindowMaximize } from "react-icons/fa";
import { FeatureCard, ShotCard, Stains, TitleBlock } from "./listingParts";
import { listingAsset } from "./listingAssets";

/** Meridian's Customize > Avatar (Welcome intro on), captured 2026-11-03. */
const SCREENSHOT_SRC = listingAsset("admin-customize-avatar.png");

/** Landing v2 avatar renders in fictional stores' shirts. */
const DRESSED_AVATARS = [
  { src: "/landing/agents/style-mia-720.webp", alt: "Avatar in a store's coral shirt" },
  { src: "/landing/agents/style-victor-720.webp", alt: "Avatar in a store's blue shirt" },
  { src: "/landing/agents/style-yusuke-720.webp", alt: "Avatar in a store's green shirt" },
] as const;

const BrandPersonalizationSlide = () => (
  <div className="relative grid h-full w-full grid-cols-[1.35fr_0.85fr] gap-x-12 overflow-visible">
    <div className="relative h-full min-h-0 min-w-0 overflow-visible">
      <Stains />
      <ShotCard
        src={SCREENSHOT_SRC}
        alt="Customize in the Bizmis admin: avatar, outfit color, logo and welcome intro"
        className="absolute left-0 top-10 z-10 aspect-[1506/778] w-full"
      />
      <div className="absolute bottom-6 right-[-24px] z-20 flex items-end gap-3">
        {DRESSED_AVATARS.map(({ src, alt }) => (
          <div
            key={src}
            className="flex h-[200px] w-[150px] items-end justify-center overflow-hidden rounded-2xl border border-black/[0.06] bg-white/80 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.18)] backdrop-blur-md"
          >
            <img src={src} alt={alt} className="h-[185px] w-auto object-contain object-bottom" />
          </div>
        ))}
      </div>
    </div>
    <div className="flex min-w-0 flex-col justify-center gap-8">
      <TitleBlock
        Icon={FaPalette}
        eyebrow="Customize"
        title={
          <>
            Make It
            <br />
            Truly Yours
          </>
        }
        lead="Pick its avatar, put your logo on its shirt, and set what it knows and how it sells."
      />
      <div className="flex flex-col gap-3">
        <FeatureCard Icon={FaUserAlt} title="Avatar and welcome intro">
          Your outfit color and logo, and a greeting when shoppers arrive.
        </FeatureCard>
        <FeatureCard Icon={FaWindowMaximize} title="Widget and chat">
          Where it sits on the page and how it starts the chat.
        </FeatureCard>
        <FeatureCard Icon={FaBook} title="Knowledge and guidelines">
          Your store's words, and the way you want it to sell.
        </FeatureCard>
      </div>
    </div>
  </div>
);

export default BrandPersonalizationSlide;
