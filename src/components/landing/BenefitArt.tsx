import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * The benefit, not the feature: a simple illustration of the OUTCOME each
 * sales pillar leads to, drawn straight onto its colour panel under the copy
 * (never over the mockup). One ink, the panel's own deep tone (--ink), at a
 * few strengths; flat shapes, calm looping motion, no words or numbers (no
 * made-up statistics). Motion lives in film-landing.css (.bzl-art-*).
 *
 *  convert — passers-by become shoppers, one after another, each with a bag
 *  upsell  — the cart fills up, past the brim
 *  retain  — a loyalty card collecting stamps, the last one a heart
 */

export type BenefitKind = "convert" | "upsell" | "retain";

const FIGURES = [30, 90, 150, 210];

const Convert = () => (
  <svg viewBox="0 0 240 110" className="bzl-art bzl-art-convert" aria-hidden="true">
    <path d="M8 102h224" stroke="currentColor" strokeOpacity=".18" strokeWidth="2" strokeLinecap="round" />
    {FIGURES.map((x, i) => (
      <g key={x} transform={`translate(${x} 0)`}>
        {/* a passer-by */}
        <g fill="none" stroke="currentColor" strokeOpacity=".32" strokeWidth="2.5">
          <circle cx="0" cy="40" r="10" />
          <path d="M-15 100v-17a15 15 0 0 1 30 0v17" strokeLinecap="round" />
        </g>
        {/* …who becomes a shopper */}
        <g className="buyer" style={{ "--i": i } as CSSProperties}>
          <circle cx="0" cy="40" r="11.2" fill="currentColor" />
          <path d="M-16.2 101v-18a16.2 16.2 0 0 1 32.4 0v18z" fill="currentColor" />
          <g className="bag">
            <path d="M16 74h18l-1.8 19a2.6 2.6 0 0 1-2.6 2.3H20.4a2.6 2.6 0 0 1-2.6-2.3z" fill="currentColor" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" />
            <path d="M21 74v-3a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </g>
        </g>
      </g>
    ))}
  </svg>
);

const Upsell = () => (
  <svg viewBox="0 0 240 110" className="bzl-art bzl-art-upsell" aria-hidden="true">
    <g className="cart">
      {/* what goes in, poking out above the rim */}
      <rect className="box b0" x="86" y="50" width="34" height="30" rx="5" fill="currentColor" fillOpacity=".55" />
      <rect className="box b1" x="124" y="30" width="30" height="50" rx="5" fill="currentColor" />
      <rect className="box b2" x="158" y="46" width="26" height="34" rx="5" fill="currentColor" fillOpacity=".75" />
      {/* the cart */}
      <path d="M44 22h14l10 22" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M66 44h132l-12 40H78z" fill="currentColor" fillOpacity=".14" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="92" cy="97" r="7" fill="currentColor" />
      <circle cx="172" cy="97" r="7" fill="currentColor" />
    </g>
  </svg>
);

const STAMPS = [46, 83, 120, 157, 194];

const Retain = () => (
  <svg viewBox="0 0 240 110" className="bzl-art bzl-art-retain" aria-hidden="true">
    <rect x="14" y="8" width="212" height="94" rx="16" fill="currentColor" fillOpacity=".1" stroke="currentColor" strokeOpacity=".4" strokeWidth="2.5" />
    <rect x="30" y="22" width="60" height="8" rx="4" fill="currentColor" fillOpacity=".35" />
    {STAMPS.map((x, i) => (
      <g key={x} transform={`translate(${x} 66)`}>
        <circle r="15.5" fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth="2" strokeDasharray="3 4" />
        <g className="stamp" style={{ "--i": i } as CSSProperties}>
          {i < STAMPS.length - 1 ? (
            <>
              <circle r="15.5" fill="currentColor" />
              <path d="M-6.5 0.5l4.5 4.5 9-9.5" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </>
          ) : (
            <path d="M0 16S-17.5 5.8-17.5-5.2A8.8 8.8 0 0 1 0-10 8.8 8.8 0 0 1 17.5-5.2C17.5 5.8 0 16 0 16z" fill="currentColor" />
          )}
        </g>
      </g>
    ))}
  </svg>
);

const ART: Record<BenefitKind, () => JSX.Element> = {
  convert: Convert,
  upsell: Upsell,
  retain: Retain,
};

const BenefitArt = ({ kind, className }: { kind: BenefitKind; className?: string }) => {
  const Art = ART[kind];
  return (
    <div className={cn("pointer-events-none w-[clamp(12rem,21vw,17.5rem)]", className)}>
      <Art />
    </div>
  );
};

export default BenefitArt;
