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
 * the products each session searched for and added to the cart, and the real
 * recorded call: each session is voiced on ElevenLabs eleven_v4 (the agent in
 * its avatar's own preset voice, the shopper in a voice of their own) by
 * scripts/generate-replay-audio.mjs, and every line and event is timed to that
 * audio (scripts/replay-audio-timings.json, checked against speech-to-text).
 * The transcript lines are exactly what is spoken.
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
  /** When each bubble starts in the call audio (seconds, by bubble id). */
  cues: Record<string, number>;
  /** The call's loudness in bars, drawn as the replay's waveform. */
  wave: number[];
}

// The preset's head (only the face with the hair, framed for a round crop),
// rendered by scripts/render-landing-heads.py: the same images as the app's
// CDN heads (cdn.bizmis.ai/common/avatars/images/<id>.png).
const presetAvatar = (id: string, name: string) => ({
  name,
  image: `/landing/heads/${id}.webp`,
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

interface CallTiming {
  audioUrl: string;
  /** The call audio's length in seconds. */
  duration: number;
  /** Bubble id → the second it starts at: a line when its first word is
   * heard, an event when the agent's tool fires. */
  at: Record<string, number>;
  /** The call's loudness in 40 bars, for the replay's waveform. */
  wave: number[];
}

const clock = (t: number) =>
  `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

/** Put a session on its recorded call: bubble times, waveform marks and
 * durations all follow the audio. */
const onCall = (
  data: SessionReplayData,
  call: CallTiming,
): SessionReplayData => {
  // the shared marks' labels, handed out in order per speaker / event type
  const labels: Record<string, string[]> = {};
  for (const m of data.conversationMarks) (labels[m.type] ??= []).push(m.label);
  return {
    ...data,
    audioUrl: call.audioUrl,
    totalDurationSeconds: call.duration,
    durationSeconds: Math.floor(call.duration), // the player clock floors too
    conversations: data.conversations.map((c) => ({
      ...c,
      time: clock(call.at[c.id]),
      position: (call.at[c.id] / call.duration) * 100,
    })),
    conversationMarks: data.conversations.map((c) => ({
      time: call.at[c.id],
      type: c.type,
      label:
        c.type === "event" ? c.content : (labels[c.type]?.shift() ?? c.type),
    })),
  };
};

const AUDIO = "/landing/replay-audio";

// from scripts/replay-audio-timings.json (regenerate both together)
const SALE_CALL: CallTiming = {
  audioUrl: `${AUDIO}/sale.mp3`,
  duration: 35.33,
  at: {
    "1": 0.47,
    "2": 3.85,
    "3": 9.09,
    "4": 10.18,
    "5": 15.88,
    "6": 22.32,
    "7": 27.4,
    "8": 28.45,
    "9": 30.87,
  },
  wave: [
    71, 62, 100, 64, 69, 93, 58, 83, 53, 67, 18, 71, 84, 86, 68, 90, 76, 61, 91,
    41, 84, 70, 88, 80, 60, 72, 72, 50, 83, 67, 65, 18, 66, 87, 68, 81, 93, 61,
    89, 27,
  ],
};
const SALE_LOYAL_CALL: CallTiming = {
  audioUrl: `${AUDIO}/sale-loyal.mp3`,
  duration: 53.83,
  at: {
    "1": 0.47,
    "2": 5.32,
    "3": 12.13,
    "4": 19.34,
    "5": 26.96,
    "6": 28.07,
    "7": 34.26,
    "8": 35.19,
    "9": 40.98,
    "10": 47.06,
  },
  wave: [
    67, 88, 61, 84, 84, 79, 63, 88, 59, 100, 76, 47, 47, 45, 58, 83, 64, 78, 59,
    67, 39, 82, 83, 67, 64, 28, 76, 65, 64, 65, 51, 83, 48, 79, 83, 76, 78, 70,
    73, 51,
  ],
};
const SUPPORT_SUCCESS_CALL: CallTiming = {
  audioUrl: `${AUDIO}/support-success.mp3`,
  duration: 28.69,
  at: {
    "1": 0.47,
    "2": 4.91,
    "3": 8.84,
    "4": 9.75,
    "5": 17.05,
    "6": 20.52,
    "7": 25.62,
  },
  wave: [
    46, 52, 75, 56, 100, 61, 60, 72, 64, 94, 68, 43, 18, 69, 62, 77, 69, 60, 53,
    66, 77, 71, 57, 48, 59, 65, 72, 67, 91, 73, 58, 52, 74, 60, 42, 47, 70, 59,
    62, 18,
  ],
};
const SUPPORT_FAILED_CALL: CallTiming = {
  audioUrl: `${AUDIO}/support-failed.mp3`,
  duration: 36.8,
  at: {
    "1": 0.49,
    "2": 6.35,
    "3": 9.43,
    "4": 10.32,
    "5": 19.01,
    "6": 24.01,
    "7": 31.84,
  },
  wave: [
    47, 69, 72, 66, 57, 61, 66, 68, 61, 69, 18, 61, 62, 58, 74, 60, 47, 64, 90,
    31, 56, 49, 73, 47, 82, 39, 71, 50, 75, 63, 73, 43, 100, 64, 40, 54, 43, 71,
    92, 26,
  ],
};

export const REPLAY_SESSIONS: ReplaySession[] = [
  {
    id: "sale",
    data: onCall(
      withLines(saleGiftSessionReplayData, {
        "2": "Lovely! I'll pull a few sure-wins. Cozy or practical? Any preference or budget?",
        "4": "Could you compare the Candle Set and the Insulated Mug? Small apartment, under €50.",
        "5": "I'd pick the Cozy Candle Set. Space-friendly, clean scents, gift wrap available, and it ships in 2 days.",
        "6": 'Perfect, let\'s do the Candle Set. Add gift wrap and a note: "Happy Birthday!"',
        "8": "Thanks, this was super helpful!",
        "9": "My pleasure! I'm here anytime. Enjoy the celebration!",
      }),
      SALE_CALL,
    ),
    agent: presetAvatar("amber", "Amber"),
    searchResults: [CANDLE_SET, ARTISAN_CANDLES, INSULATED_MUG],
    cartItems: [CANDLE_SET],
    cues: SALE_CALL.at,
    wave: SALE_CALL.wave,
  },
  {
    id: "sale-loyal",
    data: onCall(
      withLines(saleLoyalCustomerSessionReplayData, {
        "1": "Hi! Time for my monthly coffee subscription renewal, and I'm running low!",
        "4": "Perfect! I added the Borosilicate French Press to your favorites. It'll pair beautifully with your Ethiopian beans. Let me bundle everything.",
      }),
      SALE_LOYAL_CALL,
    ),
    agent: presetAvatar("will", "Will"),
    searchResults: [FRENCH_PRESS, TRAVEL_MUG, ETHIOPIAN_BEANS],
    cartItems: [FRENCH_PRESS, TRAVEL_MUG],
    cues: SALE_LOYAL_CALL.at,
    wave: SALE_LOYAL_CALL.wave,
  },
  {
    id: "support-success",
    data: onCall(
      withLines(supportPolicyQuestionSessionReplayData, {
        "4": "Great news! We ship to Canada in 5 to 7 business days. Free shipping over $75, otherwise $12.",
      }),
      SUPPORT_SUCCESS_CALL,
    ),
    agent: presetAvatar("yue", "Yue"),
    policyNote: "International shipping · Canada · Covered",
    cues: SUPPORT_SUCCESS_CALL.at,
    wave: SUPPORT_SUCCESS_CALL.wave,
  },
  {
    id: "support-failed",
    data: onCall(supportFailedRequestSessionReplayData, SUPPORT_FAILED_CALL),
    agent: presetAvatar("yusuke", "Yusuke"),
    policyNote: "Shipping coverage · Rural Alaska · Not serviceable",
    cues: SUPPORT_FAILED_CALL.at,
    wave: SUPPORT_FAILED_CALL.wave,
  },
];
