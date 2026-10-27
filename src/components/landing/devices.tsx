import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { remScale } from "@/lib/remScale";

/**
 * Devices as the ad-1 film draws them: a thin shell of frosted white glass
 * (translucent white, hairline white rim, inner highlights, a sheen across
 * the top, a soft long shadow), not a black bezel. The screen inside renders
 * at the device's real size (a phone is 390 pt wide, a tablet 1024) and is
 * scaled down to fit, like a screenshot, so whatever sits on it — the store,
 * the Bizmis widget — keeps its true proportions instead of being squeezed.
 */

/**
 * A look laid over a device's screen (its content only, inside the glass
 * shell), e.g. the sales mockups' analog rewind: a wrapper the frames put
 * round their screen. Wrappers reset it for anything nested inside.
 */
export const ScreenFx = createContext<((screen: ReactNode) => ReactNode) | null>(null);

/**
 * Scales a fixed-width virtual screen to the width it's given. The scale is
 * published as --vs on the screen, so text on it can hold a legible size on
 * screen however small the device gets: e.g. `font-size: max(14px, calc(11px / var(--vs)))`.
 */
export const VirtualScreen = ({
  width,
  children,
  className,
}: {
  width: number;
  children: ReactNode;
  className?: string;
}) => {
  const box = useRef<HTMLDivElement>(null);
  // u: the page's rem over 16px (1 up to 1440 wide). On big screens the
  // screen's content (sized in rem) is u times bigger, so the screen is too:
  // it keeps the proportions it has at 1440 instead of its UI looking zoomed in.
  const [{ scale, u }, setFit] = useState({ scale: 0, u: 1 });
  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => {
      const k = remScale();
      setFit({ scale: e.contentRect.width / (width * k), u: k });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  const fx = useContext(ScreenFx);
  const screen = (
    <div
      ref={box}
      className={cn("relative h-full w-full overflow-hidden", className)}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: width * u,
          height: scale ? `${100 / scale}%` : "100%",
          transform: `scale(${scale || 1})`,
          visibility: scale ? "visible" : "hidden",
          "--vs": scale || 1,
        } as CSSProperties}
      >
        {children}
      </div>
    </div>
  );
  return fx ? fx(screen) : screen;
};

const StatusBar = ({ className }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={cn(
      "flex items-center justify-between px-8 text-[0.9375rem] font-semibold text-[#1d1b1a]",
      className,
    )}
  >
    <span>9:41</span>
    <span className="flex items-center gap-1.5">
      <svg viewBox="0 0 18 12" className="h-3 w-[1.125rem]" fill="currentColor">
        <rect x="0" y="8" width="3" height="4" rx="1" />
        <rect x="5" y="5" width="3" height="7" rx="1" />
        <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
        <rect x="15" y="0" width="3" height="12" rx="1" opacity=".35" />
      </svg>
      <svg
        viewBox="0 0 25 12"
        className="h-3 w-[1.625rem]"
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
      "mx-auto flex h-9 items-center justify-center gap-2 rounded-full bg-[#f2ede7] text-[0.8125rem] font-medium text-[#75695e]",
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
            className="absolute left-1/2 top-[0.6875rem] z-30 h-[2.125rem] w-[7.625rem] -translate-x-1/2 rounded-full bg-[#111]"
          />
          <StatusBar className="h-[3.375rem] pt-[0.125rem]" />
          <AddressPill label={url} className="w-[15rem]" />
          <div className="relative min-h-0 flex-1">{children}</div>
        </div>
      </VirtualScreen>
    </div>
  </div>
);

/**
 * A tablet in landscape (4 : 3), in the film's glass shell; its screen lays
 * out at 760 pt so the store stays readable at this size. `portrait` stands
 * it up (3 : 4, laid out at 600 pt), for narrow screens.
 */
export const TabletFrame = ({
  children,
  url,
  portrait = false,
  className,
}: {
  children: ReactNode;
  url: string;
  portrait?: boolean;
  className?: string;
}) => (
  <div
    className={cn(
      "bzl-device is-tablet relative mx-auto rounded-[1.7rem] p-[0.5rem]",
      portrait ? "aspect-[768/1024]" : "aspect-[1024/768]",
      className,
    )}
  >
    <div className="relative h-full overflow-hidden rounded-[1.25rem] bg-white">
      <VirtualScreen width={portrait ? 600 : 760}>
        <div className="relative flex h-full flex-col">
          <StatusBar className="h-[1.875rem] pt-1 text-[0.8125rem]" />
          <AddressPill label={url} className="w-[21.25rem]" />
          <div className="relative min-h-0 flex-1">{children}</div>
        </div>
      </VirtualScreen>
    </div>
  </div>
);

/**
 * A desktop browser window (16 : 10) in the same glass shell: the traffic
 * lights and the URL pill on top, then the page, laid out at `width` pt
 * (default 1180, a laptop) and scaled to fit, so the widget on it keeps its
 * real size relative to the store.
 */
export const BrowserFrame = ({
  children,
  url,
  width = 1180,
  className,
}: {
  children: ReactNode;
  url: string;
  width?: number;
  className?: string;
}) => (
  <div
    className={cn(
      "bzl-device is-browser relative mx-auto aspect-[16/10] rounded-[1.35rem] p-[0.45rem]",
      className,
    )}
  >
    <div className="relative h-full overflow-hidden rounded-[0.95rem] bg-white">
      <VirtualScreen width={width}>
        <div className="relative flex h-full flex-col">
          <div
            aria-hidden="true"
            className="flex h-[3.25rem] flex-shrink-0 items-center gap-2 border-b border-[#f1e9df] px-5"
          >
            <span className="flex gap-[0.4375rem]">
              <i className="h-3 w-3 rounded-full bg-[#ecdccb]" />
              <i className="h-3 w-3 rounded-full bg-[#ecdccb]" />
              <i className="h-3 w-3 rounded-full bg-[#ecdccb]" />
            </span>
            <AddressPill label={url} className="h-8 w-[22.5rem]" />
          </div>
          <div className="relative min-h-0 flex-1">{children}</div>
        </div>
      </VirtualScreen>
    </div>
  </div>
);
