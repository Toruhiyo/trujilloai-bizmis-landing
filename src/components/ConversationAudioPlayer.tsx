import React, { useEffect, useState, useRef } from "react";
import { Play, Pause, Search, ShoppingCart } from "lucide-react";

interface ConversationMark {
  time: number; // seconds
  type: "customer" | "agent" | "event";
  label: string;
}

interface ConversationAudioPlayerProps {
  audioUrl: string;
  conversationMarks: ConversationMark[];
  className?: string;
}

const ConversationAudioPlayer: React.FC<ConversationAudioPlayerProps> = ({
  audioUrl,
  conversationMarks,
  className = "",
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(78); // Default duration in seconds (1:18)
  const [currentTime, setCurrentTime] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setAudioProgress(audio.currentTime / audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setAudioProgress(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getMarkerColor = (type: ConversationMark["type"]) => {
    switch (type) {
      case "customer":
        return "bg-primary";
      case "agent":
        return "bg-accent";
      case "event":
        return "bg-primary-light";
      default:
        return "bg-primary";
    }
  };

  const getMarkerIcon = (type: ConversationMark["type"], label?: string) => {
    // Only handle event markers now
    if (type === "event" && label) {
      const lowerLabel = label.toLowerCase();

      // Magnifying glass for search events
      if (lowerLabel.includes("search")) {
        return <Search className="w-3 h-3 text-background" />;
      }

      // Shopping cart for cart/add events
      if (lowerLabel.includes("cart") || lowerLabel.includes("added")) {
        return <ShoppingCart className="w-3 h-3 text-background" />;
      }
    }

    // Default fallback
    return <ShoppingCart className="w-3 h-3 text-background" />;
  };

  return (
    <div
      className={`mb-6 p-4 bg-muted/20 rounded-lg border border-border/30 ${className}`}
    >
      {/* Hidden audio element */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex items-center gap-3">
        <button
          onClick={togglePlayPause}
          className="w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-background" />
          ) : (
            <Play className="w-4 h-4 text-background ml-0.5" />
          )}
        </button>

        {/* Waveform Background - EXACT copy from SessionReplayCard */}
        <div className="flex-1 h-16 bg-muted/30 rounded-lg relative overflow-hidden">
          {/* Waveform Bars - Fixed Heights */}
          <div className="absolute inset-0 flex items-center justify-center px-3">
            <div className="flex items-end gap-1 w-full h-10">
              {Array.from({ length: 40 }, (_, i) => {
                // Create fixed heights pattern that looks like realistic audio
                const heights = [
                  30, 45, 60, 35, 50, 40, 65, 25, 55, 70, 35, 45, 30, 60, 40,
                  50, 35, 45, 55, 40, 60, 35, 50, 45, 40, 55, 30, 65, 40, 50,
                  35, 45, 60, 30, 55, 40, 50, 35, 45, 60,
                ];
                return (
                  <div
                    key={i}
                    className="bg-primary/30 rounded-full flex-1 transition-all duration-300"
                    style={{
                      height: `${heights[i]}%`,
                      opacity: i <= audioProgress * 40 ? 1 : 0.3,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Timeline Markers - Only Events (🔍 Product search @ 6s + 🛒 Added to cart @ 17s) */}
          {conversationMarks
            .filter((mark) => mark.type === "event")
            .map((mark, index) => (
              <div
                key={index}
                className={`absolute top-0 h-full w-0.5 ${getMarkerColor(
                  mark.type
                )} transition-all duration-500 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2"
                }`}
                style={{
                  left: `${(mark.time / duration) * 100}%`,
                  transitionDelay: `${index * 200 + 800}ms`,
                }}
              >
                {/* Marker Dot with Icon - Only Events */}
                <div
                  className={`absolute -top-1 -left-3 w-6 h-6 rounded-full ${getMarkerColor(
                    mark.type
                  )} border-2 border-card flex items-center justify-center`}
                >
                  {getMarkerIcon(mark.type, mark.label)}
                </div>
              </div>
            ))}

          {/* Playhead - Simplified */}
          <div
            className="absolute top-0 h-full w-0.5 bg-primary transition-all duration-200"
            style={{ left: `${audioProgress * 100}%` }}
          />
        </div>

        <div className="text-xs text-muted-foreground font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  );
};

export default ConversationAudioPlayer;
