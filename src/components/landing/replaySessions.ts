import {
  saleGiftSessionReplayData,
  saleLoyalCustomerSessionReplayData,
  supportFailedRequestSessionReplayData,
  supportPolicyQuestionSessionReplayData,
} from "@/data/session-replays";
import type { SessionReplayData } from "@/data/session-replays";

/**
 * The film landing's take on the classic session replays. The transcripts
 * come from the shared data in `@/data/session-replays` (also used by the
 * classic landing, so left untouched); this file layers the film's edits on
 * top: lines rewritten without dashes, a preset agent avatar per session,
 * and the products each session searched for and added to the cart.
 */

export interface ReplayProduct {
  name: string;
  description: string;
  image: string;
}

export interface ReplaySession {
  id: string;
  data: SessionReplayData;
  /** The Shopify app's preset avatar that answered this session. */
  agent: { name: string; image: string };
  /** The Product Search results shown in the transcript. */
  searchResults?: ReplayProduct[];
  /** What the Add to Cart event put in the cart. */
  cartItems?: ReplayProduct[];
  /** The Policy Lookup's finding. */
  policyNote?: string;
}

const presetAvatar = (id: string, name: string) => ({
  name,
  image: `https://cdn.bizmis.ai/common/avatars/images/${id}.png`,
});

const CANDLE_SET: ReplayProduct = {
  name: "Cozy Candle Set",
  description: "Scented • €35",
  image: "/images/benefit-3-session-replay-cozy-candle-set.png",
};
const ARTISAN_CANDLES: ReplayProduct = {
  name: "Artisan Candles",
  description: "Natural Wax • €28",
  image: "/images/benefit-3-session-replay-candles.png",
};
const INSULATED_MUG: ReplayProduct = {
  name: "Insulated Mug",
  description: "Ceramic • €18",
  image: "/images/benefit-3-session-replay-insulated-mug.png",
};
const FRENCH_PRESS: ReplayProduct = {
  name: "French Press",
  description: "Borosilicate • €45",
  image: "/images/benefit-3-session-replay-french-press.png",
};
const TRAVEL_MUG: ReplayProduct = {
  name: "Copper Travel Mug",
  description: "Insulated • €32",
  image: "/images/benefit-3-session-replay-insulated-travel-mug.png",
};
const ETHIOPIAN_BEANS: ReplayProduct = {
  name: "Ethiopian Beans",
  description: "Premium Roast • €25",
  image: "/images/benefit-3-session-replay-ethiopian-beans.png",
};

/** Replace transcript lines (by bubble id), keeping everything else. */
const withLines = (
  data: SessionReplayData,
  lines: Record<string, string>,
): SessionReplayData => ({
  ...data,
  conversations: data.conversations.map((c) =>
    lines[c.id] ? { ...c, content: lines[c.id] } : c,
  ),
});

export const REPLAY_SESSIONS: ReplaySession[] = [
  {
    id: "sale",
    data: withLines(saleGiftSessionReplayData, {
      "2": "Lovely! I'll pull a few sure-wins. Cozy or practical? Any preference or budget?",
      "5": "I'd pick the Cozy Candle Set. Space-friendly, clean scents, gift wrap available, and it ships in 2 days.",
      "6": 'Perfect, let\'s do the Candle Set. Add gift wrap and a note: "Happy Birthday!"',
      "8": "Thanks, this was super helpful!",
      "9": "My pleasure! I'm here anytime. Enjoy the celebration!",
    }),
    agent: presetAvatar("amber", "Amber"),
    searchResults: [CANDLE_SET, ARTISAN_CANDLES, INSULATED_MUG],
    cartItems: [CANDLE_SET],
  },
  {
    id: "sale-loyal",
    data: withLines(saleLoyalCustomerSessionReplayData, {
      "1": "Hi! Time for my monthly coffee subscription renewal, and I'm running low!",
      "4": "Perfect! I added the Borosilicate French Press to your favorites. It'll pair beautifully with your Ethiopian beans. Let me bundle everything.",
    }),
    agent: presetAvatar("will", "Will"),
    searchResults: [FRENCH_PRESS, TRAVEL_MUG, ETHIOPIAN_BEANS],
    cartItems: [FRENCH_PRESS, TRAVEL_MUG],
  },
  {
    id: "support-success",
    data: withLines(supportPolicyQuestionSessionReplayData, {
      "4": "Great news! We ship to Canada in 5 to 7 business days. Free shipping over $75, otherwise $12.",
    }),
    agent: presetAvatar("yue", "Yue"),
    policyNote: "International shipping · Canada · Covered",
  },
  {
    id: "support-failed",
    data: supportFailedRequestSessionReplayData,
    agent: presetAvatar("yusuke", "Yusuke"),
    policyNote: "Shipping coverage · Rural Alaska · Not serviceable",
  },
];
