import React, { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import WaveSurfer from "wavesurfer.js";

interface AudioPlayerProps {
  audioUrl: string;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  className = "",
}) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!waveformRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "hsl(35 30% 82%)", // border color from project
      progressColor: "#FD912A",
      cursorColor: "#FD912A",
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      height: 50,
      normalize: true,
      fillParent: true,
    });

    wavesurferRef.current = wavesurfer;

    wavesurfer.on("ready", () => {
      setDuration(wavesurfer.getDuration());
    });

    wavesurfer.on("audioprocess", () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on("finish", () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    wavesurfer.load(audioUrl);

    return () => {
      wavesurfer.destroy();
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (!wavesurferRef.current) return;

    if (isPlaying) {
      wavesurferRef.current.pause();
    } else {
      wavesurferRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative group">
      {/* Subtle glow effect on hover */}
      <div className="absolute -inset-2 bg-[#FD912A]/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

      {/* Main container with sober styling */}
      <div
        className={`relative bg-white rounded-xl p-4 shadow-lg border border-[#FD912A]/20 hover:border-[#FD912A]/30 hover:shadow-xl transition-all duration-300 hover:scale-102 transform-gpu ${className}`}
      >
        {/* Simple pulse ring around play button when playing */}
        {isPlaying && (
          <div className="absolute top-2 left-2 w-12 h-12 rounded-full border border-[#FD912A]/30 animate-ping"></div>
        )}

        <div className="relative flex items-center gap-4">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="relative w-12 h-12 bg-[#FD912A] hover:bg-[#FD912A]/85 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#FD912A]/50 shadow-md hover:shadow-lg transform-gpu"
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>

          {/* Waveform Container */}
          <div className="flex-1 min-h-[50px] flex items-center relative">
            <div className="absolute inset-0 bg-[#FDF7E2]/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div ref={waveformRef} className="w-full relative z-10" />
          </div>

          {/* Time Display */}
          <div className="text-sm font-medium text-[#FD912A] min-w-[70px] text-right font-mono">
            <div className="bg-[#FDF7E2]/80 rounded-lg px-3 py-2 border border-[#FD912A]/20">
              <div className="text-xs text-[#FD912A]/70 mb-0.5">Duration</div>
              <div className="font-semibold">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
