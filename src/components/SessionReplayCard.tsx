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
  User,
  MessageCircle,
  Coffee,
  LucideIcon,
  FileSearch,
  Shield,
  Globe,
} from "lucide-react";
import { FaShoppingCart, FaDollarSign, FaComments } from "react-icons/fa";
import ConversationAudioPlayer from "./ConversationAudioPlayer";
import SectionBadge from "./SectionBadge";
import ConfettiExplosion from "./ConfettiExplosion";
import { SessionReplayData } from "../data/session-replays";
import { formatDuration, timeStringToSeconds } from "../lib/utils/time";

interface SessionReplayCardProps {
  sessionData: SessionReplayData;
  className?: string;
}
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

  // Extract data from props
  const {
    audioUrl,
    date,
    language,
    durationSeconds,
    messageCount,
    customer,
    title,
    category,
    success,
    conversationMarks,
    conversations,
  } = sessionData;

  // Helper functions to format the new data types
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Generate tag display based on category
  const getTagIcon = () => {
    return category === "Sale" ? FaDollarSign : FaComments;
  };

  const getTagText = () => {
    return category;
  };

  const TagIcon = getTagIcon();

  // Function to get product image based on conversation content
  const getProductImageFromContent = useCallback(() => {
    const allContent = conversations
      .map((c) => c.content.toLowerCase())
      .join(" ");

    // Check for specific products mentioned in conversations
    if (
      allContent.includes("cozy candle set") ||
      (allContent.includes("candle") && allContent.includes("set"))
    ) {
      return {
        src: "/images/benefit-3-session-replay-cozy-candle-set.png",
        name: "Cozy Candle Set",
        description: "Scented • €35",
      };
    }
    if (allContent.includes("french press")) {
      return {
        src: "/images/benefit-3-session-replay-french-press.png",
        name: "French Press Set",
        description: "Borosilicate • €45",
      };
    }
    if (
      allContent.includes("ethiopian beans") ||
      (allContent.includes("ethiopian") && allContent.includes("beans"))
    ) {
      return {
        src: "/images/benefit-3-session-replay-ethiopian-beans.png",
        name: "Ethiopian Beans",
        description: "Premium Roast • €25",
      };
    }
    if (
      allContent.includes("insulated travel mug") ||
      allContent.includes("travel mug")
    ) {
      return {
        src: "/images/benefit-3-session-replay-insulated-travel-mug.png",
        name: "Insulated Travel Mug",
        description: "Copper • €22",
      };
    }
    if (allContent.includes("insulated mug")) {
      return {
        src: "/images/benefit-3-session-replay-insulated-mug.png",
        name: "Insulated Mug",
        description: "Ceramic • €18",
      };
    }
    if (
      allContent.includes("premium roast subscription") ||
      (allContent.includes("subscription") && allContent.includes("coffee"))
    ) {
      return {
        src: "/images/benefit-3-session-replay-premium-rost-subscription.png",
        name: "Premium Coffee Subscription",
        description: "Monthly • €29",
      };
    }
    if (allContent.includes("candles") || allContent.includes("candle")) {
      return {
        src: "/images/benefit-3-session-replay-candles.png",
        name: "Artisan Candles",
        description: "Natural Wax • €28",
      };
    }

    // Default fallback to French Press
    return {
      src: "/images/benefit-3-session-replay-french-press.png",
      name: "French Press Set",
      description: "Borosilicate • €45",
    };
  }, [conversations]);

  const productInfo = useMemo(
    () => getProductImageFromContent(),
    [getProductImageFromContent],
  );

  // Function to get product search results based on conversation content
  const getProductSearchResults = useCallback(() => {
    const allContent = conversations
      .map((c) => c.content.toLowerCase())
      .join(" ");

    // Coffee equipment search results
    if (
      allContent.includes("coffee") ||
      allContent.includes("french press") ||
      allContent.includes("subscription") ||
      allContent.includes("beans")
    ) {
      return [
        {
          name: "French Press",
          description: "Borosilicate • €45",
          image: "/images/benefit-3-session-replay-french-press.png",
        },
        {
          name: "Copper Travel Mug",
          description: "Insulated • €32",
          image: "/images/benefit-3-session-replay-insulated-travel-mug.png",
        },
        {
          name: "Ethiopian Beans",
          description: "Premium Roast • €25",
          image: "/images/benefit-3-session-replay-ethiopian-beans.png",
        },
      ];
    }

    // Gift search results (candles, etc.)
    return [
      {
        name: "Cozy Candle Set",
        description: "Scented • €35",
        image: "/images/benefit-3-session-replay-cozy-candle-set.png",
      },
      {
        name: "Artisan Candles",
        description: "Natural Wax • €28",
        image: "/images/benefit-3-session-replay-candles.png",
      },
      {
        name: "Insulated Mug",
        description: "Ceramic • €18",
        image: "/images/benefit-3-session-replay-insulated-mug.png",
      },
    ];
  }, [conversations]);

  const productSearchResults = useMemo(
    () => getProductSearchResults(),
    [getProductSearchResults],
  );

  // Helper to check if conversation is about coffee/equipment
  const isCoffeeConversation = useMemo(() => {
    const allContent = conversations
      .map((c) => c.content.toLowerCase())
      .join(" ");
    return (
      allContent.includes("coffee") ||
      allContent.includes("french press") ||
      allContent.includes("subscription") ||
      allContent.includes("beans")
    );
  }, [conversations]);

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
    [conversations],
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
    [currentFocusedMessage, getFocusedMessageId, scrollToMessage],
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

  return (
    <div className={`w-full min-w-0 max-w-2xl ${className}`}>
      {/* Integrated Session Replay Card */}
      <div
        className={`bg-card backdrop-blur-sm rounded-2xl px-4 pt-4 pb-0 sm:px-8 sm:pt-8 sm:pb-0 border border-primary/20 shadow-brand transform lg:rotate-2 lg:hover:rotate-1 transition-all duration-500 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        {/* Conversation Details Header */}
        <div className="mb-5 sm:mb-8">
          {/* Status Strip */}
          <div
            className={`w-full h-1 rounded-full mb-4 sm:mb-6 ${
              success
                ? "bg-gradient-to-r from-primary via-primary/80 to-primary/40"
                : "bg-gradient-to-r from-muted-foreground/40 via-muted-foreground/20 to-muted-foreground/10"
            }`}
          />

          {/* Conversation Context — title shrinks (min-w-0) so the badge
              stays inline on phones without pushing past the viewport. */}
          <div className="flex items-start justify-between gap-2.5 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-heading font-semibold text-foreground text-base sm:text-lg leading-tight mb-1 sm:mb-2">
                {title}
              </h3>
              <div
                className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${
                  success ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {success ? "✓ Sucessful" : "⚠ UnResolved"}
              </div>
            </div>

            <SectionBadge icon={TagIcon} text={getTagText()} className="mb-0" />
          </div>
        </div>

        {/* Audio Player with Conversation Marks */}
        {/* Session Details - Above Audio Player */}
        <div className="mb-3 sm:mb-4 pb-4 sm:pb-6 border-b border-border/30">
          {/* All Session Info - Spread with Dots */}
          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-x-3 gap-y-2 text-xs text-muted-foreground">
            {/* Customer Info */}
            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  customer.isLoyal
                    ? "bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30"
                    : "bg-muted"
                }`}
              >
                {customer.avatar ? (
                  <img
                    src={customer.avatar}
                    alt={customer.name || "Customer"}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <User
                    className={`w-2.5 h-2.5 ${
                      customer.isLoyal
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                )}
              </div>
              <span
                className={`text-xs font-medium ${
                  customer.name ? "text-foreground" : "text-muted-foreground/70"
                }`}
              >
                {customer.name || "Anonymous Customer"}
                {customer.isLoyal && (
                  <span className="ml-1.5 text-xs text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded-full">
                    VIP
                  </span>
                )}
              </span>
            </div>

            <div className="hidden sm:block w-1 h-1 bg-muted-foreground/40 rounded-full" />

            {/* Language */}
            <div className="flex items-center gap-1.5">
              <Globe className="w-3 h-3" />
              <span>{language}</span>
            </div>

            <div className="hidden sm:block w-1 h-1 bg-muted-foreground/40 rounded-full" />

            {/* Duration */}
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(durationSeconds)}</span>
            </div>

            <div className="hidden sm:block w-1 h-1 bg-muted-foreground/40 rounded-full" />

            {/* Messages */}
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-3 h-3" />
              <span>{messageCount}</span>
            </div>

            <div className="hidden sm:block w-1 h-1 bg-muted-foreground/40 rounded-full" />

            {/* Date */}
            <div className="flex items-center gap-1.5">
              <span>{formatDate(date)}</span>
            </div>
          </div>
        </div>

        <ConversationAudioPlayer
          audioUrl={audioUrl}
          conversationMarks={conversationMarks}
          onTimeUpdate={handleAudioTimeUpdate}
        />

        {/* Conversation Area — taller viewport + bottom fade into modal bg */}
        <div className="relative">
          <div
            ref={conversationContainerRef}
            className="space-y-4 max-h-96 sm:max-h-[26rem] overflow-y-auto conversation-scrollbar pb-6"
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
                      className={`bg-primary/[0.05] rounded-lg p-4 border border-primary/15 transition-all duration-500 ${
                        currentFocusedMessage === bubble.id && isAudioPlaying
                          ? "scale-105 ring-2 ring-primary/50 bg-[#FDF7E2] shadow-lg shadow-primary/20 transform-gpu"
                          : ""
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-3">
                        {isCoffeeConversation ? (
                          <Coffee className="w-4 h-4 text-primary shrink-0" />
                        ) : (
                          <Search className="w-4 h-4 text-primary shrink-0" />
                        )}
                        <span className="text-sm font-medium text-foreground">
                          {bubble.content}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {isCoffeeConversation
                            ? '"coffee equipment"'
                            : '"gift search"'}
                        </span>
                        <span className="text-xs text-muted-foreground sm:ml-auto">
                          {bubble.time}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {productSearchResults.map((product, index) => (
                          <div
                            key={product.name}
                            className="bg-card rounded-lg p-3 border border-border/50"
                          >
                            <div className="w-full h-20 rounded-lg flex items-center justify-center mb-3 overflow-hidden aspect-[3/4]">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                            <h4 className="text-xs font-medium text-foreground mb-1">
                              {product.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {product.description}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="text-center text-xs text-muted-foreground mt-2">
                        3 results found
                      </div>
                    </div>
                  )}

                  {bubble.content === "Policy Lookup" && (
                    <div
                      className={`bg-primary/[0.05] rounded-lg p-4 border border-primary/15 transition-all duration-500 ${
                        currentFocusedMessage === bubble.id && isAudioPlaying
                          ? "scale-105 ring-2 ring-primary/50 bg-[#FDF7E2] shadow-lg shadow-primary/20 transform-gpu"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <FileSearch className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          Policy Lookup
                        </span>
                        <span className="text-xs text-muted-foreground">
                          "shipping coverage"
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {bubble.time}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Shipping Coverage */}
                        <div className="bg-card rounded-lg p-3 border border-border/50">
                          <div className="w-full h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                            <Globe className="w-6 h-6 text-primary" />
                          </div>
                          <h4 className="text-xs font-medium text-foreground mb-1">
                            Alaska Coverage
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Major cities only • Remote areas excluded
                          </p>
                        </div>

                        {/* Location Check */}
                        <div className="bg-card rounded-lg p-3 border border-border/50">
                          <div className="w-full h-12 bg-accent rounded-lg flex items-center justify-center mb-2">
                            <Shield className="w-6 h-6 text-accent-foreground" />
                          </div>
                          <h4 className="text-xs font-medium text-foreground mb-1">
                            Requested Location
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Rural Alaska • Not serviceable
                          </p>
                        </div>
                      </div>

                      <div className="text-center text-xs text-muted-foreground mt-3">
                        ⚠ Shipping restriction applies
                      </div>
                    </div>
                  )}

                  {bubble.content === "Add to Cart" && (
                    <div
                      className={`relative bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg p-4 border-2 border-primary/20 shadow-lg overflow-hidden transition-all duration-500 ${
                        currentFocusedMessage === bubble.id && isAudioPlaying
                          ? "scale-105 ring-2 ring-primary/50 shadow-xl shadow-primary/20 transform-gpu"
                          : ""
                      }`}
                    >
                      {/* EXPLOSIVE Confetti Animation */}
                      <ConfettiExplosion className="z-5" />

                      {/* Success Header */}
                      <div className="flex items-center justify-between mb-3 relative z-10">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                            <FaShoppingCart className="w-3 h-3 text-white" />
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
                          <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-2 shadow-lg overflow-hidden">
                            <img
                              src={productInfo.src}
                              alt={productInfo.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          <h4 className="text-xs font-bold text-foreground text-center mb-1">
                            {productInfo.name}
                          </h4>
                          <p className="text-xs text-muted-foreground text-center">
                            {productInfo.description}
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
                      bubble.type === "agent"
                        ? "bg-primary text-background"
                        : "bg-muted text-foreground"
                    } ${
                      currentFocusedMessage === bubble.id && isAudioPlaying
                        ? "scale-105 ring-2 ring-primary/50 shadow-lg shadow-primary/20 transform-gpu"
                        : ""
                    }`}
                  >
                    <p className="text-sm">{bubble.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {bubble.time}
                    </span>
                  </div>
                  {bubble.type === "customer" && (
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {customer.avatar ? (
                        <img
                          src={customer.avatar}
                          alt={customer.name || "Customer"}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-3 h-3 text-primary" />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* End of Call Indicator */}
          <div className="flex flex-col items-center py-5 sm:py-8 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3 sm:mb-4 border-2 border-primary/20">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground"
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
              Session completed successfully • Duration:{" "}
              {formatDuration(durationSeconds)}
            </p>
          </div>
          </div>

          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-16 bg-gradient-to-t from-card from-[28%] via-card/80 via-[52%] to-transparent sm:h-[4.5rem]"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
};

export default SessionReplayCard;
