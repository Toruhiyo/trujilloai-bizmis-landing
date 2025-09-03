import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  Clock,
  Search,
  ShoppingCart,
  User,
  MessageCircle,
  DollarSign,
  Flame,
  Coffee,
  Gift,
  Leaf,
  LucideIcon,
  FileSearch,
  Shield,
  Globe,
} from "lucide-react";
import ConversationAudioPlayer from "./ConversationAudioPlayer";
import SectionBadge from "./SectionBadge";
import ConfettiExplosion from "./ConfettiExplosion";
import {
  SessionReplayData,
  ConversationBubble,
  ConversationMark,
} from "../data/benefit-3-sessionreplay-1-conversation";

interface SessionReplayCardProps {
  sessionData: SessionReplayData;
  className?: string;
}

interface TimelineMarker {
  time: string;
  position: number;
  type: "chat" | "search" | "cart" | "checkout";
}

// Icon mapping for dynamic icon resolution
const iconMap: Record<string, LucideIcon> = {
  DollarSign,
  Gift,
  ShoppingCart,
  Search,
  Flame,
  Coffee,
  Leaf,
  Clock,
  User,
  MessageCircle,
  FileSearch,
  Shield,
  Globe,
};

const SessionReplayCard: React.FC<SessionReplayCardProps> = ({
  sessionData,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatePlayhead, setAnimatePlayhead] = useState(false);
  const [visibleBubbles, setVisibleBubbles] = useState<Set<string>>(new Set());
  const [currentFocusedMessage, setCurrentFocusedMessage] = useState<
    string | null
  >(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Refs for message elements to enable scrolling
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const conversationContainerRef = useRef<HTMLDivElement>(null);

  // Helper function to convert time string (e.g., "0:17") to seconds
  const timeStringToSeconds = useCallback((timeStr: string): number => {
    const [minutes, seconds] = timeStr.split(":").map(Number);
    return minutes * 60 + seconds;
  }, []);

  // Extract data from props
  const {
    audioUrl,
    totalDurationSeconds,
    language,
    duration,
    messageCount,
    title,
    category,
    success,
    conversationMarks,
    conversations,
  } = sessionData;

  // Generate tag display based on category and success
  const getTagIcon = () => {
    if (category === "Sale") {
      return success ? DollarSign : ShoppingCart;
    } else {
      return success ? MessageCircle : User;
    }
  };

  const getTagText = () => {
    const status = success ? "Success" : "Failed";
    return `${category} ${status}`;
  };

  const TagIcon = getTagIcon();

  // Function to determine which message should be focused based on current audio time
  const getFocusedMessageId = useCallback(
    (currentTime: number) => {
      // Find the message that should be active at the current time
      // We want the message that was sent at or before the current time
      // but hasn't been superseded by a later message
      let focusedMessage = null;

      for (const conversation of conversations) {
        const messageTime = timeStringToSeconds(conversation.time);
        if (messageTime <= currentTime) {
          focusedMessage = conversation.id;
        } else {
          break; // We've found the first message after current time, so stop
        }
      }
      return focusedMessage;
    },
    [conversations, timeStringToSeconds]
  );

  // Smooth scroll to focused message
  const scrollToMessage = useCallback((messageId: string) => {
    const messageElement = messageRefs.current[messageId];

    if (messageElement) {
      messageElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }, []);

  // Handle audio time updates
  const handleAudioTimeUpdate = useCallback(
    (currentTime: number, isPlaying: boolean) => {
      setIsAudioPlaying(isPlaying);

      if (isPlaying) {
        const newFocusedMessage = getFocusedMessageId(currentTime);

        if (newFocusedMessage && newFocusedMessage !== currentFocusedMessage) {
          setCurrentFocusedMessage(newFocusedMessage);
          // Immediate scroll for audio start, small delay for ongoing playback
          const delay = currentTime < 0.5 ? 0 : 100;
          setTimeout(() => scrollToMessage(newFocusedMessage), delay);
        }
      } else {
        // Clear focus when audio stops
        setCurrentFocusedMessage(null);
      }
    },
    [currentFocusedMessage, getFocusedMessageId, scrollToMessage]
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
    <div className={`w-full max-w-2xl ${className}`}>
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
                <span>{language}</span>
                <span>{duration}</span>
                <span>{messageCount}</span>
              </div>
            </div>
          </div>
          <SectionBadge icon={TagIcon} text={getTagText()} className="mb-0" />
        </div>

        {/* Audio Player with Conversation Marks */}
        <ConversationAudioPlayer
          audioUrl={audioUrl}
          conversationMarks={conversationMarks}
          onTimeUpdate={handleAudioTimeUpdate}
        />

        {/* Conversation Area */}
        <div
          ref={conversationContainerRef}
          className="space-y-4 mb-8 max-h-80 overflow-y-auto conversation-scrollbar"
        >
          {conversations.map((bubble, index) => (
            <div
              key={bubble.id}
              ref={(el) => (messageRefs.current[bubble.id] = el)}
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
                    <div
                      className={`bg-muted/30 rounded-lg p-4 border border-border/30 transition-all duration-500 ${
                        currentFocusedMessage === bubble.id && isAudioPlaying
                          ? "scale-105 ring-2 ring-orange-400/50 bg-orange-50 shadow-lg shadow-orange-400/20 transform-gpu"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Search className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          Product Search
                        </span>
                        <span className="text-xs text-muted-foreground">
                          "gift search"
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {bubble.time}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {/* Cozy Candle Set */}
                        <div className="bg-card rounded-lg p-2 border border-border/50">
                          <div className="w-full h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                            <Flame className="w-6 h-6 text-primary" />
                          </div>
                          <h4 className="text-xs font-medium text-foreground mb-1">
                            Cozy Candle Set
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Clean Scents • €35
                          </p>
                        </div>

                        {/* Insulated Mug */}
                        <div className="bg-card rounded-lg p-2 border border-border/50">
                          <div className="w-full h-12 bg-accent rounded-lg flex items-center justify-center mb-2">
                            <Coffee className="w-6 h-6 text-accent-foreground" />
                          </div>
                          <h4 className="text-xs font-medium text-foreground mb-1">
                            Insulated Mug
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Travel Ready • €28
                          </p>
                        </div>

                        {/* Plant Gift Set */}
                        <div className="bg-card rounded-lg p-2 border border-border/50">
                          <div className="w-full h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-2">
                            <Leaf className="w-6 h-6 text-primary" />
                          </div>
                          <h4 className="text-xs font-medium text-foreground mb-1">
                            Plant Gift Set
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Low Maintenance • €42
                          </p>
                        </div>
                      </div>

                      <div className="text-center text-xs text-muted-foreground mt-2">
                        3 results found
                      </div>
                    </div>
                  )}

                  {bubble.content === "Policy Lookup" && (
                    <div
                      className={`bg-muted/30 rounded-lg p-4 border border-border/30 transition-all duration-500 ${
                        currentFocusedMessage === bubble.id && isAudioPlaying
                          ? "scale-105 ring-2 ring-orange-400/50 bg-orange-50 shadow-lg shadow-orange-400/20 transform-gpu"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <FileSearch className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          Policy Lookup
                        </span>
                        <span className="text-xs text-muted-foreground">
                          "international shipping"
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {bubble.time}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Shipping Policy */}
                        <div className="bg-card rounded-lg p-3 border border-border/50">
                          <div className="w-full h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                            <Globe className="w-6 h-6 text-primary" />
                          </div>
                          <h4 className="text-xs font-medium text-foreground mb-1">
                            International Shipping
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Canada: 5-7 days • $12 or Free $75+
                          </p>
                        </div>

                        {/* Customs Policy */}
                        <div className="bg-card rounded-lg p-3 border border-border/50">
                          <div className="w-full h-12 bg-accent rounded-lg flex items-center justify-center mb-2">
                            <Shield className="w-6 h-6 text-accent-foreground" />
                          </div>
                          <h4 className="text-xs font-medium text-foreground mb-1">
                            Customs & Duties
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Forms handled • Local rates may apply
                          </p>
                        </div>
                      </div>

                      <div className="text-center text-xs text-muted-foreground mt-3">
                        ✓ Policy terms retrieved
                      </div>
                    </div>
                  )}

                  {bubble.content === "Add to Cart" && (
                    <div
                      className={`relative bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg p-4 border-2 border-primary/20 shadow-lg overflow-hidden transition-all duration-500 ${
                        currentFocusedMessage === bubble.id && isAudioPlaying
                          ? "scale-105 ring-2 ring-orange-400/50 shadow-xl shadow-orange-400/20 transform-gpu"
                          : ""
                      }`}
                    >
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
                          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center mb-2 shadow-lg">
                            <Flame className="text-2xl text-primary w-8 h-8" />
                          </div>
                          <h4 className="text-xs font-bold text-foreground text-center mb-1">
                            Cozy Candle Set
                          </h4>
                          <p className="text-xs text-muted-foreground text-center">
                            Clean Scents • €35
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
                    className={`max-w-[70%] px-3 py-2 rounded-lg transition-all duration-500 ${
                      bubble.type === "customer"
                        ? "bg-primary text-background"
                        : "bg-muted text-foreground"
                    } ${
                      currentFocusedMessage === bubble.id && isAudioPlaying
                        ? "scale-105 ring-2 ring-orange-400/50 shadow-lg shadow-orange-400/20 transform-gpu"
                        : ""
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

          {/* End of Call Indicator */}
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 border-2 border-primary/20">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L6.16 11.37c-.532.3-.532 1.127.035 1.462C7.34 13.664 8.536 14.86 9.368 16.005c.337.567 1.164.567 1.462.035l1.983-4.064a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V17a2 2 0 01-2 2h-1C9.716 19 4 13.284 4 6V5z"
                  />
                </svg>
              </div>
            </div>
            <h4 className="text-sm font-medium text-foreground mb-1">
              Call Ended
            </h4>
            <p className="text-xs text-muted-foreground">
              Session completed successfully • Duration: {duration}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionReplayCard;
