import { useEffect, useRef, useState } from "react";

const DEFAULT_BAR_WIDTH_PX = 10;
const DEFAULT_BAR_GAP_PX = 1.5;
const DEFAULT_HEIGHT_MORPH_MS = 820;
const DEFAULT_HEIGHT_MORPH_EASING = "cubic-bezier(0.42, 0, 0.58, 1)";
const DEFAULT_PULSE_S = 1.2;
const DEFAULT_TALKING_OPACITY = 1;
const DEFAULT_SILENT_OPACITY = 0.4;

const DEFAULT_HEIGHTS = [
  44, 64, 80, 54, 84, 60, 74, 48, 68, 86, 52, 72, 56, 82,
  62, 76, 46, 70, 58, 80, 50, 66, 60, 78, 42, 68, 54, 84,
  58, 74, 48, 70, 62, 82, 52, 66, 56, 82, 50, 72,
];

const buildPhaseOffsets = (count: number, pulseDurationS: number) =>
  Array.from({ length: count }, (_, i) => {
    const pseudo = Math.sin(i * 12.9898) * 43758.5453;
    return +(pulseDurationS * (pseudo - Math.floor(pseudo))).toFixed(3);
  });

interface WaveformProps {
  /** Whether bars are currently animating (talking) or silent. */
  animating: boolean;
  /**
   * Target width per bar, in pixels. The number of bars is computed automatically
   * from the container's width so the bar width stays constant regardless of how
   * wide the waveform is rendered. Default 10px.
   */
  barWidthPx?: number;
  /** Per-bar height percentages while animating (loops if shorter than the bar count). */
  heights?: number[];
  /** Container className (typically sets height + width). */
  className?: string;
  /** Per-bar Tailwind className (color, rounding, etc.). */
  barClassName?: string;
  /** Gap between bars in pixels (default 1.5). */
  gapPx?: number;
  /** Per-bar pulse duration in seconds (default 1.2). */
  pulseDurationS?: number;
  /** Height morph duration in ms when toggling animating (default 820). */
  heightMorphMs?: number;
  /** Bar opacity while talking (default 1). */
  talkingOpacity?: number;
  /** Bar opacity while silent (default 0.4). */
  silentOpacity?: number;
}

const Waveform = ({
  animating,
  barWidthPx = DEFAULT_BAR_WIDTH_PX,
  heights = DEFAULT_HEIGHTS,
  className = "",
  barClassName = "bg-primary-light",
  gapPx = DEFAULT_BAR_GAP_PX,
  pulseDurationS = DEFAULT_PULSE_S,
  heightMorphMs = DEFAULT_HEIGHT_MORPH_MS,
  talkingOpacity = DEFAULT_TALKING_OPACITY,
  silentOpacity = DEFAULT_SILENT_OPACITY,
}: WaveformProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [bars, setBars] = useState(0);
  const phaseOffsets = useRef<number[]>(buildPhaseOffsets(bars, pulseDurationS));
  if (phaseOffsets.current.length !== bars) {
    phaseOffsets.current = buildPhaseOffsets(bars, pulseDurationS);
  }

  useEffect(() => {
    const node = rowRef.current;
    if (!node) return;

    const measure = () => {
      const rowWidth = node.clientWidth;
      if (rowWidth <= 0) return;
      const computedBars = Math.max(
        1,
        Math.floor((rowWidth + gapPx) / (barWidthPx + gapPx))
      );
      setBars(computedBars);
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(node);
    return () => resizeObserver.disconnect();
  }, [barWidthPx, gapPx]);

  return (
    <div
      ref={rowRef}
      className={`flex items-center w-full ${className}`}
      style={{ gap: `${gapPx}px` }}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`shrink-0 rounded-full ${barClassName}`}
          style={{
            width: `${barWidthPx}px`,
            height: animating
              ? `${heights[i % heights.length]}%`
              : `${barWidthPx}px`,
            opacity: animating ? talkingOpacity : silentOpacity,
            transformOrigin: "center",
            transition: `height ${heightMorphMs}ms ${DEFAULT_HEIGHT_MORPH_EASING}, opacity ${heightMorphMs}ms ${DEFAULT_HEIGHT_MORPH_EASING}`,
            animation: animating
              ? `voice-support-wave-bar ${pulseDurationS}s ease-in-out ${-phaseOffsets.current[i % phaseOffsets.current.length]}s infinite alternate`
              : "none",
          }}
        />
      ))}
    </div>
  );
};

export default Waveform;
