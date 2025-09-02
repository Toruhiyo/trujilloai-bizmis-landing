import React, { useState, useEffect, useMemo } from "react";
import {
  Clock,
  Search,
  ShoppingCart,
  User,
  MessageCircle,
  DollarSign,
} from "lucide-react";
import ConversationAudioPlayer from "./ConversationAudioPlayer";
import SectionBadge from "./SectionBadge";
import ConfettiExplosion from "./ConfettiExplosion";

interface ConversationBubble {
  id: string;
  time: string;
  position: number;
  type: "customer" | "agent" | "event";
  content: string;
  delay: number;
}

interface ConversationMark {
  time: number; // seconds
  type: "customer" | "agent" | "event";
  label: string;
}

interface TimelineMarker {
  time: string;
  position: number;
  type: "chat" | "search" | "cart" | "checkout";
}

const TOTAL_DURATION_SECONDS = 20; // 0:20 = 20 seconds (actual audio duration)
const PLAYHEAD_POSITION = 100; // At the end (1:18)

const SessionReplayCard = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatePlayhead, setAnimatePlayhead] = useState(false);
  const [visibleBubbles, setVisibleBubbles] = useState<Set<string>>(new Set());

  // Conversation marks for audio player (adjusted for 20-second audio)
  const conversationMarks: ConversationMark[] = [
    { time: 2, type: "customer", label: "Customer need" },
    { time: 4, type: "agent", label: "Agent response" },
    { time: 6, type: "event", label: "Product search" },
    { time: 10, type: "customer", label: "Comparison request" },
    { time: 12, type: "agent", label: "Recommendation" },
    { time: 15, type: "customer", label: "Agreement" },
    { time: 17, type: "event", label: "Added to cart" },
    { time: 19, type: "customer", label: "Thanks" },
    { time: 20, type: "agent", label: "Goodbye" },
  ];

  const conversations: ConversationBubble[] = useMemo(
    () => [
      {
        id: "1",
        time: "0:02",
        position: (2 / TOTAL_DURATION_SECONDS) * 100,
        type: "customer",
        content: "Hi! I need a workspace solution for my home office.",
        delay: 800,
      },
      {
        id: "2",
        time: "0:04",
        position: (4 / TOTAL_DURATION_SECONDS) * 100,
        type: "agent",
        content:
          "I'd be happy to help! Let me show you our top workspace solutions.",
        delay: 1000,
      },
      {
        id: "3",
        time: "0:06",
        position: (6 / TOTAL_DURATION_SECONDS) * 100,
        type: "event",
        content: "Product Search",
        delay: 1200,
      },
      {
        id: "4",
        time: "0:10",
        position: (10 / TOTAL_DURATION_SECONDS) * 100,
        type: "customer",
        content: "Could you compare these options for a small space?",
        delay: 1400,
      },
      {
        id: "5",
        time: "0:12",
        position: (12 / TOTAL_DURATION_SECONDS) * 100,
        type: "agent",
        content:
          "For small spaces, I'd recommend Product B - it's compact yet functional with great storage.",
        delay: 1600,
      },
      {
        id: "6",
        time: "0:15",
        position: (15 / TOTAL_DURATION_SECONDS) * 100,
        type: "customer",
        content: "That sounds perfect! I'll take it.",
        delay: 1800,
      },
      {
        id: "7",
        time: "0:17",
        position: (17 / TOTAL_DURATION_SECONDS) * 100,
        type: "event",
        content: "Added 1 Item",
        delay: 2000,
      },
      {
        id: "8",
        time: "0:19",
        position: (19 / TOTAL_DURATION_SECONDS) * 100,
        type: "customer",
        content: "Thanks for your help!",
        delay: 2200,
      },
      {
        id: "9",
        time: "0:20",
        position: (20 / TOTAL_DURATION_SECONDS) * 100,
        type: "agent",
        content:
          "My pleasure! Feel free to reach out anytime. We're here whenever you need us!",
        delay: 2400,
      },
    ],
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setTimeout(() => setAnimatePlayhead(true), 500);
    }, 300);

    // Show conversation bubbles sequentially
    conversations.forEach((bubble) => {
      setTimeout(() => {
        setVisibleBubbles((prev) => new Set([...prev, bubble.id]));
      }, bubble.delay);
    });

    return () => clearTimeout(timer);
  }, [conversations]);

  const getMarkerColor = (type: TimelineMarker["type"]) => {
    switch (type) {
      case "search":
        return "bg-primary-light";
      case "chat":
        return "bg-accent";
      case "cart":
        return "bg-primary";
      case "checkout":
        return "bg-primary-dark";
      default:
        return "bg-primary";
    }
  };

  const getMarkerIcon = (type: TimelineMarker["type"]) => {
    switch (type) {
      case "search":
        return <Search className="w-3 h-3 text-background" />;
      case "chat":
        return <MessageCircle className="w-3 h-3 text-background" />;
      case "cart":
        return <ShoppingCart className="w-3 h-3 text-background" />;
      case "checkout":
        return <ShoppingCart className="w-3 h-3 text-background" />;
      default:
        return <MessageCircle className="w-3 h-3 text-background" />;
    }
  };

  return (
    <div className="w-full max-w-2xl">
      {/* Integrated Session Replay Card */}
      <div
        className={`bg-card backdrop-blur-sm rounded-2xl p-8 border border-orange-200/50 shadow-brand transform rotate-2 hover:rotate-1 transition-all duration-500 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        {/* Conversation Details Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground">
                Customer
              </h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>English</span>
                <span>1:18</span>
                <span>9 messages</span>
              </div>
            </div>
          </div>
          <SectionBadge icon={DollarSign} text="Closed sale" className="mb-0" />
        </div>

        {/* Audio Player with Conversation Marks */}
        <ConversationAudioPlayer
          audioUrl="/audio/benefit-1-customization-voice-cloning-original.mp3"
          conversationMarks={conversationMarks}
        />

        {/* Conversation Area */}
        <div className="space-y-4 mb-8 max-h-80 overflow-y-auto conversation-scrollbar">
          {conversations.map((bubble, index) => (
            <div
              key={bubble.id}
              className={`transition-all duration-500 ${
                visibleBubbles.has(bubble.id)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              {bubble.type === "event" ? (
                // Event within conversation
                <div className="py-2">
                  {bubble.content === "Product Search" && (
                    <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
                      <div className="flex items-center gap-2 mb-3">
                        <Search className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          Product Search
                        </span>
                        <span className="text-xs text-muted-foreground">
                          "workspace"
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {bubble.time}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {/* Product A */}
                        <div className="bg-card rounded-lg p-2 border border-border/50">
                          <div className="w-full h-12 bg-secondary rounded-lg flex items-center justify-center mb-2">
                            <span className="text-lg font-bold text-secondary-foreground">
                              A
                            </span>
                          </div>
                          <h4 className="text-xs font-medium text-foreground mb-1">
                            Product A
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Compact Desk
                          </p>
                        </div>

                        {/* Product B */}
                        <div className="bg-card rounded-lg p-2 border border-border/50">
                          <div className="w-full h-12 bg-accent rounded-lg flex items-center justify-center mb-2">
                            <span className="text-lg font-bold text-accent-foreground">
                              B
                            </span>
                          </div>
                          <h4 className="text-xs font-medium text-foreground mb-1">
                            Product B
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Space Saver
                          </p>
                        </div>

                        {/* Product C */}
                        <div className="bg-card rounded-lg p-2 border border-border/50">
                          <div className="w-full h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-2">
                            <span className="text-lg font-bold text-primary">
                              C
                            </span>
                          </div>
                          <h4 className="text-xs font-medium text-foreground mb-1">
                            Product C
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Full Station
                          </p>
                        </div>
                      </div>

                      <div className="text-center text-xs text-muted-foreground mt-2">
                        3 products found
                      </div>
                    </div>
                  )}

                  {bubble.content === "Added 1 Item" && (
                    <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg p-4 border-2 border-primary/20 shadow-lg overflow-hidden">
                      {/* EXPLOSIVE Confetti Animation */}
                      <ConfettiExplosion className="z-5" />

                      {/* Success Header */}
                      <div className="flex items-center justify-between mb-3 relative z-10">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center shadow-lg">
                            <ShoppingCart className="w-4 h-4 text-background" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-primary">
                              ITEM ADDED TO CART
                            </h3>
                          </div>
                        </div>

                        <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                          Success
                        </span>
                      </div>

                      {/* Product Showcase */}
                      <div className="flex justify-center">
                        <div className="bg-background rounded-lg p-3 border border-primary/30 shadow-lg relative z-10">
                          <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-lg flex items-center justify-center mb-2 shadow-lg">
                            <span className="text-2xl font-black text-accent-foreground">
                              B
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-foreground text-center mb-1">
                            Product B
                          </h4>
                          <p className="text-xs text-muted-foreground text-center">
                            Space Saver
                          </p>

                          {/* Success Badge */}
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-xs font-black text-background">
                              +1
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Timestamp */}
                      <div className="mt-3 relative z-10">
                        <span className="text-xs opacity-70 text-muted-foreground">
                          {bubble.time}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Chat messages
                <div
                  className={`flex items-start gap-2 ${
                    bubble.type === "customer" ? "justify-end" : "justify-start"
                  }`}
                >
                  {bubble.type === "agent" && (
                    <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img
                        src="/images/benefit-3-session-replay-avatar-thumbnail.png"
                        alt="Agent Avatar"
                        className="w-4 h-4 object-cover rounded-full"
                      />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] px-3 py-2 rounded-lg ${
                      bubble.type === "customer"
                        ? "bg-primary text-background"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm">{bubble.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {bubble.time}
                    </span>
                  </div>
                  {bubble.type === "customer" && (
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3 text-primary" />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SessionReplayCard;
