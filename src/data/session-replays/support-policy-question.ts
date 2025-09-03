import { SessionReplayData } from "./index";

// Customer support scenario - International shipping policy inquiry
export const supportPolicyQuestionSessionReplayData: SessionReplayData = {
  // Audio configuration
  audioUrl: "/audio/benefit-1-customization-voice-cloning-original.mp3",
  totalDurationSeconds: 20, // 0:20 = 20 seconds (actual audio duration)

  // Session metadata
  language: "English",
  duration: "0:52",
  messageCount: "7 messages",

  // Example information
  title: "International Shipping Inquiry",
  category: "Support",
  success: true,

  // Conversation marks for audio player (adjusted for 20-second audio)
  conversationMarks: [
    { time: 2, type: "customer", label: "Shipping inquiry" },
    { time: 4, type: "agent", label: "Initial response" },
    { time: 7, type: "event", label: "Policy Lookup" },
    { time: 11, type: "agent", label: "Policy explanation" },
    { time: 15, type: "customer", label: "Follow-up question" },
    { time: 17, type: "agent", label: "Additional help" },
    { time: 19, type: "customer", label: "Thanks" },
  ],

  // Conversation bubbles
  conversations: [
    {
      id: "1",
      time: "0:02",
      position: (2 / 20) * 100,
      type: "customer",
      content:
        "Hi! Do you ship internationally? I'm in Canada and want to order.",
      delay: 800,
    },
    {
      id: "2",
      time: "0:04",
      position: (4 / 20) * 100,
      type: "agent",
      content:
        "Absolutely! Let me check our international shipping details for you.",
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
        "Great news! We ship to Canada in 5-7 business days. Free shipping over $75, otherwise $12.",
      delay: 1400,
    },
    {
      id: "5",
      time: "0:15",
      position: (15 / 20) * 100,
      type: "customer",
      content: "Perfect! What about customs or duties?",
      delay: 1600,
    },
    {
      id: "6",
      time: "0:17",
      position: (17 / 20) * 100,
      type: "agent",
      content:
        "All customs forms are handled by us. Duties may apply based on local Canadian rates.",
      delay: 1800,
    },
    {
      id: "7",
      time: "0:19",
      position: (19 / 20) * 100,
      type: "customer",
      content: "Excellent! Thank you for the quick help!",
      delay: 2000,
    },
  ],
};

