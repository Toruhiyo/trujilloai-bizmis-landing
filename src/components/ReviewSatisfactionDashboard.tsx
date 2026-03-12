import React, { useState, useEffect, useMemo } from "react";
import {
  Star,
  Heart,
  TrendingUp,
  ThumbsUp,
  Clock,
  CheckCircle2,
  Zap,
  Truck,
  CreditCard,
  Package,
  RotateCcw,
  MessageSquare,
  Shield,
  Gift,
  MapPin,
} from "lucide-react";

interface Review {
  id: string;
  text: string;
  author: string;
  rating: number;
  type: "satisfaction" | "speed" | "resolution" | "empathy";
  timestamp: string;
}

const REVIEW_FLOW_INTERVAL = 1800;
const METRIC_UPDATE_INTERVAL = 3000;
const MAX_VISIBLE_REVIEWS = 6;
const UPWARD_DRIFT_DURATION = 4000;

const ReviewSatisfactionDashboard: React.FC = () => {
  const [visibleReviews, setVisibleReviews] = useState<Set<string>>(new Set());
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [metrics, setMetrics] = useState({
    satisfaction: 98.4,
    avgResolution: 23,
  });
  const [celebrationBurst, setCelebrationBurst] = useState(false);

  const reviews: Review[] = useMemo(
    () => [
      {
        id: "review-1",
        text: "Incredible support! Fixed my issue in under 30 seconds. Mind blown! 🤯",
        author: "Sarah Chen",
        rating: 5,
        type: "speed",
        timestamp: "2 min ago",
      },
      {
        id: "review-2",
        text: "The AI understood my frustration and responded with such genuine care ❤️",
        author: "Marcus Johnson",
        rating: 5,
        type: "empathy",
        timestamp: "just now",
      },
      {
        id: "review-3",
        text: "Payment glitch resolved instantly! No transfers, no waiting. Pure magic! ✨",
        author: "Elena Rodriguez",
        rating: 5,
        type: "resolution",
        timestamp: "1 min ago",
      },
      {
        id: "review-4",
        text: "98.4% satisfaction rate and I can see why. Absolutely phenomenal service! 🌟",
        author: "David Kim",
        rating: 5,
        type: "satisfaction",
        timestamp: "3 min ago",
      },
      {
        id: "review-5",
        text: "Wrong size delivered, exchange processed before I finished typing! Wow! 📦",
        author: "Amanda Foster",
        rating: 5,
        type: "speed",
        timestamp: "2 min ago",
      },
      {
        id: "review-6",
        text: "24/7 support that actually feels human. This AI has emotions! 🥺",
        author: "Carlos Rivera",
        rating: 5,
        type: "empathy",
        timestamp: "4 min ago",
      },
      {
        id: "review-7",
        text: "Complex return policy explained perfectly. No confusion, just clarity! 📋",
        author: "Jennifer Wu",
        rating: 5,
        type: "resolution",
        timestamp: "1 min ago",
      },
      {
        id: "review-8",
        text: "Customer satisfaction through the roof! Keep up the amazing work! 🚀",
        author: "Michael Brown",
        rating: 5,
        type: "satisfaction",
        timestamp: "just now",
      },
      {
        id: "review-9",
        text: "Refund processed in 15 seconds. Faster than I could blink! ⚡",
        author: "Lisa Thompson",
        rating: 5,
        type: "speed",
        timestamp: "2 min ago",
      },
      {
        id: "review-10",
        text: "Felt truly heard and valued. This AI genuinely cares! 💝",
        author: "Robert Lee",
        rating: 5,
        type: "empathy",
        timestamp: "3 min ago",
      },
      {
        id: "review-11",
        text: "Resolution time under 25 seconds every time! Absolutely incredible! ⏱️",
        author: "Jessica Park",
        rating: 5,
        type: "speed",
        timestamp: "just now",
      },
      {
        id: "review-12",
        text: "98%+ satisfaction rate speaks for itself. This is the future! 🚀",
        author: "Ryan Martinez",
        rating: 5,
        type: "satisfaction",
        timestamp: "1 min ago",
      },
    ],
    []
  );

  // Review flow animation
  useEffect(() => {
    const interval = setInterval(() => {
      const review = reviews[currentReviewIndex];

      // Add new review
      setVisibleReviews((prev) => {
        const newSet = new Set(prev);
        newSet.add(review.id);

        // Remove oldest if too many
        if (newSet.size > MAX_VISIBLE_REVIEWS) {
          const reviewsArray = Array.from(newSet);
          newSet.delete(reviewsArray[0]);
        }

        return newSet;
      });

      // Remove review after upward drift completes
      setTimeout(() => {
        setVisibleReviews((prev) => {
          const newSet = new Set(prev);
          newSet.delete(review.id);
          return newSet;
        });
      }, UPWARD_DRIFT_DURATION);

      setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
    }, REVIEW_FLOW_INTERVAL);

    return () => clearInterval(interval);
  }, [currentReviewIndex, reviews]);

  // Metrics animation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        satisfaction: Math.min(99.9, prev.satisfaction + Math.random() * 0.1),
        avgResolution: Math.max(15, prev.avgResolution - Math.random() * 0.8),
      }));

      // Trigger celebration burst occasionally
      if (Math.random() > 0.8) {
        setCelebrationBurst(true);
        setTimeout(() => setCelebrationBurst(false), 800);
      }
    }, METRIC_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const getReviewPosition = (index: number) => {
    // Organic pattern for side selection - creates natural alternating without strict pattern
    const organicPattern = [0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0]; // 0 = left, 1 = right
    const isRightSide = organicPattern[index % organicPattern.length];

    const leftPositions = [
      { startTop: "90%", left: "2%", direction: "slide-in-left" },
      { startTop: "85%", left: "6%", direction: "slide-in-left" },
      { startTop: "80%", left: "1%", direction: "slide-in-left" },
      { startTop: "95%", left: "8%", direction: "slide-in-left" },
      { startTop: "88%", left: "4%", direction: "slide-in-left" },
      { startTop: "92%", left: "10%", direction: "slide-in-left" },
    ];

    const rightPositions = [
      { startTop: "90%", right: "2%", direction: "slide-in-right" },
      { startTop: "85%", right: "6%", direction: "slide-in-right" },
      { startTop: "80%", right: "1%", direction: "slide-in-right" },
      { startTop: "95%", right: "8%", direction: "slide-in-right" },
      { startTop: "88%", right: "4%", direction: "slide-in-right" },
      { startTop: "92%", right: "10%", direction: "slide-in-right" },
    ];

    const selectedPositions = isRightSide ? rightPositions : leftPositions;
    return selectedPositions[index % selectedPositions.length];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "satisfaction":
        return <Heart className="w-6 h-6 text-primary" />;
      case "speed":
        return <Zap className="w-6 h-6 text-primary" />;
      case "resolution":
        return <Shield className="w-6 h-6 text-primary" />;
      case "empathy":
        return <MessageSquare className="w-6 h-6 text-primary" />;
      default:
        return <ThumbsUp className="w-6 h-6 text-primary" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "satisfaction":
        return "border-primary/60 bg-[#FDF7E2]/95";
      case "speed":
        return "border-primary/60 bg-[#FDF7E2]/95";
      case "resolution":
        return "border-primary/70 bg-[#FDF7E2]/95";
      case "empathy":
        return "border-primary/70 bg-[#FDF7E2]/95";
      default:
        return "border-primary/50 bg-[#FDF7E2]/95";
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* CSS Animation for Upward Drift */}
      <style>{`
        @keyframes upwardDrift {
          0% {
            transform: translateY(0px);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translateY(-300px);
            opacity: 0;
          }
        }
      `}</style>
      {/* Customer Loyalty Focused Cards */}
      <div className="absolute top-14 left-10 z-20">
        <div className="bg-primary rounded-2xl p-5 shadow-2xl w-[220px] transform hover:scale-105 transition-all duration-300">
          <div className="text-center text-white">
            <Heart className="w-12 h-12 mx-auto mb-3 opacity-90" />
            <div className="text-xl font-bold mb-1">
              Earn Loyalty on Auto-Pilot
            </div>
            <div className="text-sm opacity-90">
              Exceptional support = lifelong customers
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-14 right-10 z-20">
        <div className="bg-primary rounded-2xl p-5 shadow-2xl w-[220px] transform hover:scale-105 transition-all duration-300">
          <div className="text-center text-white">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-90" />
            <div className="text-xl font-bold mb-1">Save Time & Money</div>
            <div className="text-sm opacity-90">No more support headaches</div>
          </div>
        </div>
      </div>

      {/* Flowing Reviews */}
      {reviews.map((review, index) => {
        const isVisible = visibleReviews.has(review.id);
        const position = getReviewPosition(index);

        return (
          <div
            key={review.id}
            className={`absolute z-10 transition-all duration-700 ease-out transform ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
            } ${
              position.direction === "slide-in-left"
                ? isVisible
                  ? "translate-x-0"
                  : "-translate-x-8"
                : isVisible
                ? "translate-x-0"
                : "translate-x-8"
            }`}
            style={{
              top: position.startTop,
              ...("left" in position
                ? { left: position.left }
                : { right: position.right }),
              animationDelay: `${index * 100}ms`,
              animation: isVisible
                ? `upwardDrift ${UPWARD_DRIFT_DURATION}ms ease-out forwards`
                : "none",
            }}
          >
            <div
              className={`${getTypeColor(
                review.type
              )} backdrop-blur-xl rounded-2xl p-5 shadow-2xl border-2 max-w-sm hover:scale-105 transition-transform duration-200 cursor-pointer`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(review.type)}
                </div>
                <div className="space-y-3">
                  <p className="text-base text-foreground font-semibold leading-relaxed">
                    {review.text}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground font-bold">
                      {review.author}
                    </span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-primary text-primary"
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-primary font-bold">
                    {review.timestamp}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Celebration Particles */}
      {celebrationBurst && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary rounded-full animate-ping"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 100}ms`,
                animationDuration: `${800 + Math.random() * 400}ms`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSatisfactionDashboard;
