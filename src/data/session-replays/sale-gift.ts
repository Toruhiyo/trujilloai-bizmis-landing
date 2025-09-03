import { SessionReplayData } from "./index";

// Gift purchase scenario - Birthday gift for sister
export const saleGiftSessionReplayData: SessionReplayData = {
  // Audio configuration
  audioUrl: "/audio/benefit-1-customization-voice-cloning-original.mp3",
  totalDurationSeconds: 20, // 0:20 = 20 seconds (actual audio duration)

  // Session metadata
  language: "English",
  duration: "1:18",
  messageCount: "9 messages",

  // Example information
  title: "Birthday Gift Purchase",
  category: "Sale",
  success: true,

  // Conversation marks for audio player (adjusted for 20-second audio)
  conversationMarks: [
    { time: 2, type: "customer", label: "Gift need" },
    { time: 4, type: "agent", label: "Agent response" },
    { time: 6, type: "event", label: "Product Search" },
    { time: 10, type: "customer", label: "Comparison request" },
    { time: 12, type: "agent", label: "Recommendation" },
    { time: 15, type: "customer", label: "Choice + message" },
    { time: 17, type: "event", label: "Add to Cart" },
    { time: 19, type: "customer", label: "Thanks" },
    { time: 20, type: "agent", label: "Goodbye" },
  ],

  // Conversation bubbles
  conversations: [
    {
      id: "1",
      time: "0:02",
      position: (2 / 20) * 100, // Using totalDurationSeconds = 20
      type: "customer",
      content: "Hi! I'm looking for a birthday gift for my sister.",
      delay: 800,
    },
    {
      id: "2",
      time: "0:04",
      position: (4 / 20) * 100,
      type: "agent",
      content:
        "Lovely! I'll pull a few sure-wins. Cozy or practical—any preference or budget?",
      delay: 1000,
    },
    {
      id: "3",
      time: "0:06",
      position: (6 / 20) * 100,
      type: "event",
      content: "Product Search",
      delay: 1200,
    },
    {
      id: "4",
      time: "0:10",
      position: (10 / 20) * 100,
      type: "customer",
      content:
        "Could you compare the Candle Set vs. the Insulated Mug? Small apartment, under €50.",
      delay: 1400,
    },
    {
      id: "5",
      time: "0:12",
      position: (12 / 20) * 100,
      type: "agent",
      content:
        "I'd pick the Cozy Candle Set—space-friendly, clean scents, gift-wrap available, ships in 2 days.",
      delay: 1600,
    },
    {
      id: "6",
      time: "0:15",
      position: (15 / 20) * 100,
      type: "customer",
      content:
        'Perfect—let\'s do the Candle Set. Add gift wrap and note: "Happy Birthday!"',
      delay: 1800,
    },
    {
      id: "7",
      time: "0:17",
      position: (17 / 20) * 100,
      type: "event",
      content: "Add to Cart",
      delay: 2000,
    },
    {
      id: "8",
      time: "0:19",
      position: (19 / 20) * 100,
      type: "customer",
      content: "Thanks—this was super helpful!",
      delay: 2200,
    },
    {
      id: "9",
      time: "0:20",
      position: (20 / 20) * 100,
      type: "agent",
      content: "My pleasure! I'm here anytime—enjoy the celebration!",
      delay: 2400,
    },
  ],
};

