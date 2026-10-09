import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Devices as the ad-1 film draws them: a thin shell of frosted white glass
 * (translucent white, hairline white rim, inner highlights, a sheen across
 * the top, a soft long shadow), not a black bezel. The screen inside renders
 * at the device's real size (a phone is 390 pt wide, a tablet 1024) and is
 * scaled down to fit, like a screenshot, so whatever sits on it — the store,
 * the Bizmis widget — keeps its true proportions instead of being squeezed.
 */

/** Scales a fixed-width virtual screen to the width it's given. */
const VirtualScreen = ({
  width,
  children,
  className,
}: {
  width: number;
  children: ReactNode;
  className?: string;
}) => {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) =>
      setScale(e.contentRect.width / width),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  return (
    <div
      ref={box}
      className={cn("relative h-full w-full overflow-hidden", className)}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width,
          height: scale ? `${100 / scale}%` : "100%",
          transform: `scale(${scale || 1})`,
          visibility: scale ? "visible" : "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
};

const StatusBar = ({ className }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={cn(
      "flex items-center justify-between px-8 text-[15px] font-semibold text-[#1d1b1a]",
      className,
    )}
  >
    <span>9:41</span>
    <span className="flex items-center gap-1.5">
      <svg viewBox="0 0 18 12" className="h-3 w-[18px]" fill="currentColor">
        <rect x="0" y="8" width="3" height="4" rx="1" />
        <rect x="5" y="5" width="3" height="7" rx="1" />
        <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
        <rect x="15" y="0" width="3" height="12" rx="1" opacity=".35" />
      </svg>
      <svg
        viewBox="0 0 25 12"
        className="h-3 w-[26px]"
        fill="none"
        stroke="currentColor"
      >
        <rect x=".5" y=".5" width="21" height="11" rx="3" opacity=".4" />
        <rect
          x="2"
          y="2"
          width="15"
          height="8"
          rx="1.6"
          fill="currentColor"
          stroke="none"
        />
        <path d="M23.5 4.5v3" strokeLinecap="round" opacity=".4" />
      </svg>
    </span>
  </div>
);

/** The URL pill, as mobile Safari shows it. */
const AddressPill = ({
  label,
  className,
}: {
  label: string;
  className?: string;
}) => (
  <div
    aria-hidden="true"
    className={cn(
      "mx-auto flex h-9 items-center justify-center gap-2 rounded-full bg-[#f2ede7] text-[13px] font-medium text-[#75695e]",
      className,
    )}
  >
    <svg viewBox="0 0 12 14" className="h-3 w-3" fill="currentColor">
      <path d="M3 6V4a3 3 0 0 1 6 0v2h.5A1.5 1.5 0 0 1 11 7.5v5A1.5 1.5 0 0 1 9.5 14h-7A1.5 1.5 0 0 1 1 12.5v-5A1.5 1.5 0 0 1 2.5 6H3zm1.5 0h3V4a1.5 1.5 0 0 0-3 0v2z" />
    </svg>
    {label}
  </div>
);

/**
 * A phone at its real proportions (390 × 844 pt), in the film's glass shell.
 * `children` are laid out on the 390 pt screen below the status bar and URL.
 */
export const PhoneFrame = ({
  children,
  url,
  className,
}: {
  children: ReactNode;
  url: string;
  className?: string;
}) => (
  <div
    className={cn(
      "bzl-device is-phone relative mx-auto aspect-[390/844] rounded-[2.6rem] p-[0.45rem]",
      className,
    )}
  >
    <div className="relative h-full overflow-hidden rounded-[2.2rem] bg-white">
      <VirtualScreen width={390}>
        <div className="relative flex h-full flex-col">
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-[11px] z-30 h-[34px] w-[122px] -translate-x-1/2 rounded-full bg-[#111]"
          />
          <StatusBar className="h-[54px] pt-[2px]" />
          <AddressPill label={url} className="w-[240px]" />
          <div className="relative min-h-0 flex-1">{children}</div>
        </div>
      </VirtualScreen>
    </div>
  </div>
);

/** A tablet in landscape (4 : 3), in the film's glass shell; its screen lays out at 760 pt so the store stays readable at this size. */
export const TabletFrame = ({
  children,
  url,
  className,
}: {
  children: ReactNode;
  url: string;
  className?: string;
}) => (
  <div
    className={cn(
      "bzl-device is-tablet relative mx-auto aspect-[1024/768] rounded-[1.7rem] p-[0.5rem]",
      className,
    )}
  >
    <div className="relative h-full overflow-hidden rounded-[1.25rem] bg-white">
      <VirtualScreen width={760}>
        <div className="relative flex h-full flex-col">
          <StatusBar className="h-[30px] pt-1 text-[13px]" />
          <AddressPill label={url} className="w-[340px]" />
          <div className="relative min-h-0 flex-1">{children}</div>
        </div>
      </VirtualScreen>
    </div>
  </div>
);
