import { SessionReplayData } from "./index";

// Customer support scenario - Shipping restriction issue
export const supportFailedRequestSessionReplayData: SessionReplayData = {
  // Audio configuration
  audioUrl: "/audio/benefit-1-customization-voice-cloning-original.mp3",
  totalDurationSeconds: 20, // 0:20 = 20 seconds (actual audio duration)

  // Session metadata
  date: new Date(2025, 11, 12), // Dec 12, 2025 (month is 0-indexed)
  language: "English",
  durationSeconds: 58, // 0:58 = 58 seconds
  messageCount: 7,

  // Customer information
  customer: {
    name: null, // Anonymous customer
    isLoyal: false,
  },

  // Example information
  title: "Shipping Restriction Issue",
  category: "Support",
  success: false,

  // Conversation marks for audio player (adjusted for 20-second audio)
  conversationMarks: [
    { time: 2, type: "customer", label: "Shipping inquiry" },
    { time: 4, type: "agent", label: "Initial check" },
    { time: 7, type: "event", label: "Policy Lookup" },
    { time: 11, type: "agent", label: "Restriction found" },
    { time: 15, type: "customer", label: "Frustration" },
    { time: 18, type: "agent", label: "No alternatives" },
    { time: 19, type: "customer", label: "Disappointment" },
  ],

  // Conversation bubbles
  conversations: [
    {
      id: "1",
      time: "0:02",
      position: (2 / 20) * 100,
      type: "customer",
      content:
        "Hi! I want to order candles as a gift to my friend in rural Alaska. Can you ship there?",
      delay: 800,
    },
    {
      id: "2",
      time: "0:04",
      position: (4 / 20) * 100,
      type: "agent",
      content: "Let me check our shipping coverage for that area right away.",
      delay: 1000,
    },
    {
      id: "3",
      time: "0:07",
      position: (7 / 20) * 100,
      type: "event",
      content: "Policy Lookup",
      delay: 1200,
    },
    {
      id: "4",
      time: "0:11",
      position: (11 / 20) * 100,
      type: "agent",
      content:
        "I'm sorry, but we don't currently ship to remote areas in Alaska due to logistics constraints. Only major cities are covered.",
      delay: 1400,
    },
    {
      id: "5",
      time: "0:15",
      position: (15 / 20) * 100,
      type: "customer",
      content:
        "Seriously? It's still the US! Isn't there any way to make this work?",
      delay: 1600,
    },
    {
      id: "6",
      time: "0:18",
      position: (18 / 20) * 100,
      type: "agent",
      content:
        "I understand your frustration, but our carriers don't service remote Alaskan locations. There's no override option available.",
      delay: 1800,
    },
    {
      id: "7",
      time: "0:19",
      position: (19 / 20) * 100,
      type: "customer",
      content:
        "This is so disappointing. I guess I'll have to find another company.",
      delay: 2000,
    },
  ],
};
