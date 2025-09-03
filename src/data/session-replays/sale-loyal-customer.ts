import { SessionReplayData } from "./index";

// Sale scenario - Loyal customer with personalized service
export const saleLoyalCustomerSessionReplayData: SessionReplayData = {
  // Audio configuration
  audioUrl: "/audio/benefit-1-customization-voice-cloning-original.mp3",
  totalDurationSeconds: 20, // 0:20 = 20 seconds (actual audio duration)

  // Session metadata
  date: new Date(2025, 11, 14), // Dec 14, 2025 (month is 0-indexed)
  language: "English",
  durationSeconds: 92, // 1:32 = 92 seconds
  messageCount: 10,

  // Customer information
  customer: {
    name: "Jane Doe",
    avatar: "/images/jane-doe-thumbnail-320px.jpg",
    isLoyal: false,
  },

  // Example information
  title: "Returning Customer Reorder",
  category: "Sale",
  success: true,

  // Conversation marks for audio player (adjusted for 20-second audio)
  conversationMarks: [
    { time: 2, type: "customer", label: "Reorder need" },
    { time: 4, type: "agent", label: "Personal recognition" },
    { time: 7, type: "customer", label: "Product feedback" },
    { time: 9, type: "agent", label: "Personalized suggestion" },
    { time: 12, type: "event", label: "Product Search" },
    { time: 15, type: "customer", label: "Additional request" },
    { time: 17, type: "event", label: "Add to Cart" },
    { time: 19, type: "agent", label: "Address confirmation" },
    { time: 20, type: "customer", label: "Appreciation" },
  ],

  // Conversation bubbles
  conversations: [
    {
      id: "1",
      time: "0:02",
      position: (2 / 20) * 100,
      type: "customer",
      content: "I need to reorder my skincare routine—I'm almost out!",
      delay: 800,
    },
    {
      id: "2",
      time: "0:04",
      position: (4 / 20) * 100,
      type: "agent",
      content:
        "Hi Jane! Perfect timing—I was just thinking about you. How's that vitamin C serum working out? Your usual Glow Kit reorder?",
      delay: 1000,
    },
    {
      id: "3",
      time: "0:07",
      position: (7 / 20) * 100,
      type: "customer",
      content:
        "The serum is incredible! Yes, the full kit again, but I'd love to try that new moisturizer you mentioned last time.",
      delay: 1200,
    },
    {
      id: "4",
      time: "0:09",
      position: (9 / 20) * 100,
      type: "agent",
      content:
        "Ah yes! The Hydrating Complex—I saved it to your wishlist. It's perfect for your skin type. Let me bundle that with your usual order.",
      delay: 1400,
    },
    {
      id: "5",
      time: "0:12",
      position: (12 / 20) * 100,
      type: "event",
      content: "Product Search",
      delay: 1600,
    },
    {
      id: "6",
      time: "0:15",
      position: (15 / 20) * 100,
      type: "customer",
      content:
        "Perfect! And maybe add that eye cream you recommended for my late work nights?",
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
      type: "agent",
      content:
        "All set! Glow Kit plus Hydrating Complex and Revitalizing Eye Cream. Same delivery address on Oak Street?",
      delay: 2200,
    },
    {
      id: "9",
      time: "0:20",
      position: (20 / 20) * 100,
      type: "customer",
      content:
        "Yes, exactly! You remember everything. Thanks for keeping track of my skincare journey!",
      delay: 2400,
    },
    {
      id: "10",
      time: "0:21",
      position: (21 / 20) * 100, // slightly beyond to show completion
      type: "agent",
      content:
        "That's what I'm here for! Your order ships today and arrives Wednesday. Your skin will thank you!",
      delay: 2600,
    },
  ],
};
