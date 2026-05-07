import {
  ShopperShortCaption,
  type ShopperShortCaptionProps,
} from "./CustomerVoiceCard";

export type MobileShopperCaptionRowProps = ShopperShortCaptionProps & {
  thumbnailSrc: string;
  thumbnailAlt?: string;
};

export default function MobileShopperCaptionRow({
  thumbnailSrc,
  thumbnailAlt = "",
  className = "",
  ...captionProps
}: MobileShopperCaptionRowProps) {
  return (
    <div className="flex w-full min-w-0 max-w-full items-center justify-start gap-2.5 xs:gap-3 sm:gap-3.5">
      <img
        src={thumbnailSrc}
        alt={thumbnailAlt}
        className="size-11 xs:size-12 shrink-0 rounded-full border border-primary/15 bg-muted/30 object-cover object-top shadow-md ring-2 ring-background"
      />
      <div className="flex min-w-0 flex-1 justify-start">
        <ShopperShortCaption
          {...captionProps}
          className={`justify-start text-left ${className}`.trim()}
        />
      </div>
    </div>
  );
}
