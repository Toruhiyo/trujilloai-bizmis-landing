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
  title: "Coffee Subscription Renewal",
  category: "Sale",
  success: true,

  // Conversation marks for audio player (adjusted for 20-second audio)
  conversationMarks: [
    { time: 2, type: "customer", label: "Coffee subscription" },
    { time: 4, type: "agent", label: "Personal recognition" },
    { time: 7, type: "customer", label: "Equipment interest" },
    { time: 9, type: "agent", label: "Remembered preference" },
    { time: 12, type: "event", label: "Product Search" },
    { time: 15, type: "customer", label: "Accessory request" },
    { time: 17, type: "event", label: "Add to Cart" },
    { time: 19, type: "agent", label: "Delivery confirmation" },
    { time: 20, type: "customer", label: "Appreciation" },
  ],

  // Conversation bubbles
  conversations: [
    {
      id: "1",
      time: "0:02",
      position: (2 / 20) * 100,
      type: "customer",
      content:
        "Hi! Time for my monthly coffee subscription renewal—and I'm running low!",
      delay: 800,
    },
    {
      id: "2",
      time: "0:04",
      position: (4 / 20) * 100,
      type: "agent",
      content:
        "Jane! Great to see you back. How are those Ethiopian beans working out? Ready for your usual Premium Roast subscription?",
      delay: 1000,
    },
    {
      id: "3",
      time: "0:07",
      position: (7 / 20) * 100,
      type: "customer",
      content:
        "They're amazing! Yes, definitely the subscription again, but I've been eyeing that French press you mentioned last month.",
      delay: 1200,
    },
    {
      id: "4",
      time: "0:09",
      position: (9 / 20) * 100,
      type: "agent",
      content:
        "Perfect! The Borosilicate French Press—I added it to your favorites. It'll pair beautifully with your Ethiopian beans. Let me bundle everything.",
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
        "Excellent! Could we also add that insulated travel mug? My morning commute coffee keeps getting cold.",
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
        "Done! Premium Coffee Subscription, French Press, and Copper Travel Mug. Same address on Oak Street?",
      delay: 2200,
    },
    {
      id: "9",
      time: "0:20",
      position: (20 / 20) * 100,
      type: "customer",
      content:
        "Perfect! You always remember my preferences. Thanks for keeping my coffee ritual going strong!",
      delay: 2400,
    },
    {
      id: "10",
      time: "0:21",
      position: (21 / 20) * 100, // slightly beyond to show completion
      type: "agent",
      content:
        "That's what I'm here for! Your subscription renews today, equipment ships Wednesday. Enjoy your perfect morning brew!",
      delay: 2600,
    },
  ],
};
