import { useState } from "react";
import { BeatStyleProvider, readBeatStyle } from "./sales/beatcopy/style";
import { SalesProtoProvider } from "./sales/proto";
import SalesSpine from "./sales/SalesSpine";
import "@/styles/landing-sales.css";

/**
 * Boost Sales: "Match needs. Clear doubts. Win sales." The title opens the
 * pillar big and docks as its sticky header (PillarIntro). The marker funnel
 * of the whole store's visits is the section's spine (SalesSpine): as you
 * scroll, each part's one conversation pops out of its own stage on a device
 * (find on desktop, trust on a phone, buy on a tablet), the same agent
 * sealing each stage's leak, and the pillar ends on all three fixed, the
 * orders pouring into the bag. Copy in `landing.sales` (the classic landing
 * keeps `benefits.sales`). Each beat's words are the merchant's loss, struck
 * through at the fix, then the win written in. The win metrics
 * (sales/Metrics.tsx) are parked.
 */
/** The loss → win copy is the section's words; the win metrics stay parked. */
const PROTO = { win: 0, flip: true };

const SalesSection = () => {
  // ?beat=1..6, 5a..5e: an alternative look for the beats' loss → win words (absent: today's)
  const [beat] = useState(readBeatStyle);
  return (
    <SalesProtoProvider value={PROTO}>
      <BeatStyleProvider value={beat}>
        <SalesSpine />
      </BeatStyleProvider>
    </SalesProtoProvider>
  );
};

export default SalesSection;
