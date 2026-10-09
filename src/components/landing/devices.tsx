import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A minimal status bar, as phones and tablets show it. */
const StatusBar = ({ className }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={cn(
      "flex items-center justify-between px-6 text-[10px] font-semibold text-[var(--bzl-fg)]",
      className,
    )}
  >
    <span>9:41</span>
    <span className="flex items-center gap-1">
      <svg viewBox="0 0 18 12" className="h-2.5 w-3.5" fill="currentColor">
        <rect x="0" y="8" width="3" height="4" rx="1" />
        <rect x="5" y="5" width="3" height="7" rx="1" />
        <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
        <rect x="15" y="0" width="3" height="12" rx="1" opacity=".35" />
      </svg>
      <svg
        viewBox="0 0 25 12"
        className="h-2.5 w-5"
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

/** The store's own top bar inside a device: a URL pill, as mobile Safari shows it. */
const AddressPill = ({ label }: { label: string }) => (
  <div
    aria-hidden="true"
    className="mx-auto mt-1 flex h-6 w-[62%] items-center justify-center gap-1.5 rounded-full bg-[#f1ebe4] text-[9px] font-medium text-[var(--bzl-muted)]"
  >
    <svg viewBox="0 0 12 14" className="h-2 w-2" fill="currentColor">
      <path d="M3 6V4a3 3 0 0 1 6 0v2h.5A1.5 1.5 0 0 1 11 7.5v5A1.5 1.5 0 0 1 9.5 14h-7A1.5 1.5 0 0 1 1 12.5v-5A1.5 1.5 0 0 1 2.5 6H3zm1.5 0h3V4a1.5 1.5 0 0 0-3 0v2z" />
    </svg>
    {label}
  </div>
);

/**
 * A phone, at its real proportions (about 9 : 19.5): bezel, dynamic island,
 * status bar and the store's URL. Its size follows the height it's given.
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
      "relative mx-auto aspect-[9/19.5] rounded-[2.4rem] bg-[#1d1b1a] p-[0.55rem] shadow-[0_40px_80px_-40px_rgba(28,24,20,0.55),inset_0_0_0_1.5px_rgba(255,255,255,0.12)]",
      className,
    )}
  >
    <div className="relative flex h-full flex-col overflow-hidden rounded-[1.9rem] bg-white">
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-2 z-30 h-[1.15rem] w-[34%] -translate-x-1/2 rounded-full bg-[#1d1b1a]"
      />
      <StatusBar className="pt-3" />
      <AddressPill label={url} />
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  </div>
);

/** A tablet in landscape (about 4 : 3), with the same status bar and URL pill. */
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
      "relative mx-auto aspect-[4/3] rounded-[1.6rem] bg-[#1d1b1a] p-[0.7rem] shadow-[0_40px_80px_-40px_rgba(28,24,20,0.55),inset_0_0_0_1.5px_rgba(255,255,255,0.12)]",
      className,
    )}
  >
    <div className="relative flex h-full flex-col overflow-hidden rounded-[1.05rem] bg-white">
      <StatusBar className="pt-1.5" />
      <AddressPill label={url} />
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  </div>
);
