import { useRef, useCallback, useState, type ReactNode } from "react";
import { toPng } from "html-to-image";
import { FaDownload, FaBorderAll } from "react-icons/fa";

/** Distance in px from slide canvas (1600×900) edges to content safe zone and guides */
export const CONTENT_INSET_PX = 100;

const SLIDE_BASE_WIDTH = 1600;
const SLIDE_BASE_HEIGHT = 900;

const EXPORT_RESOLUTIONS = [
  { label: "1600 × 900", pixelRatio: 1 },
  { label: "3200 × 1800 (2×)", pixelRatio: 2 },
  { label: "4800 × 2700 (3×)", pixelRatio: 3 },
];

export interface SlideDefinition {
  label: string;
  Background: () => JSX.Element;
  isStudio?: boolean;
  content?: ReactNode;
}

interface SlideDeckProps {
  slides: SlideDefinition[];
  filenamePrefix?: string;
}

const SlideDeck = ({ slides, filenamePrefix = "bizmis-slide" }: SlideDeckProps) => {
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [guidesVisible, setGuidesVisible] = useState(false);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  const handleDownload = useCallback(
    async (index: number, pixelRatio: number) => {
      setOpenMenuIndex(null);
      const node = slideRefs.current[index];
      if (!node) return;

      const guide = node.querySelector("[data-guide]") as HTMLElement | null;
      if (guide) guide.style.display = "none";

      const dataUrl = await toPng(node, {
        width: SLIDE_BASE_WIDTH,
        height: SLIDE_BASE_HEIGHT,
        pixelRatio,
      });

      if (guide) guide.style.display = "";

      const slug = slides[index].label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      const res = SLIDE_BASE_WIDTH * pixelRatio;
      const link = document.createElement("a");
      link.download = `${filenamePrefix}-${index + 1}-${slug}-${res}w.png`;
      link.href = dataUrl;
      link.click();
    },
    [slides, filenamePrefix],
  );

  return (
    <div className="min-h-screen bg-neutral-800 py-16 flex flex-col items-center gap-16">
      <button
        onClick={() => setGuidesVisible((v) => !v)}
        className={`fixed top-4 right-4 z-50 inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-colors ${
          guidesVisible
            ? "bg-primary text-white"
            : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white"
        }`}
      >
        <FaBorderAll className="w-3 h-3" />
        {guidesVisible ? "Hide Guides" : "Show Guides"}
      </button>

      {slides.map((slide, i) => (
        <div key={`${slide.label}-${i}`} className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-4">
            <span className="text-neutral-400 text-sm font-mono">
              {i + 1} / {slides.length} — {slide.label}
            </span>
            <div className="relative">
              <button
                onClick={() => setOpenMenuIndex(openMenuIndex === i ? null : i)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-neutral-700 hover:bg-neutral-600 text-neutral-300 hover:text-white text-xs font-medium transition-colors"
              >
                <FaDownload className="w-3 h-3" />
                Download PNG
              </button>
              {openMenuIndex === i && (
                <div className="absolute top-full mt-1 left-0 bg-neutral-700 rounded-md shadow-lg border border-neutral-600 py-1 z-50 min-w-[160px]">
                  {EXPORT_RESOLUTIONS.map((res) => (
                    <button
                      key={res.pixelRatio}
                      onClick={() => handleDownload(i, res.pixelRatio)}
                      className="block w-full text-left px-4 py-2 text-xs text-neutral-300 hover:bg-neutral-600 hover:text-white transition-colors"
                    >
                      {res.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className={`relative w-[1600px] h-[900px] overflow-visible shadow-2xl ${
              slide.isStudio ? "studio-lighting-base" : ""
            }`}
          >
            <slide.Background />
            {guidesVisible && (
              <div
                data-guide
                className="absolute z-50 border-2 border-dashed border-black/20 pointer-events-none"
                style={{
                  top: CONTENT_INSET_PX,
                  right: CONTENT_INSET_PX,
                  bottom: CONTENT_INSET_PX,
                  left: CONTENT_INSET_PX,
                }}
              />
            )}
            {slide.content && (
              <div
                className="absolute overflow-visible min-w-0 min-h-0"
                style={{
                  top: CONTENT_INSET_PX,
                  right: CONTENT_INSET_PX,
                  bottom: CONTENT_INSET_PX,
                  left: CONTENT_INSET_PX,
                }}
              >
                {slide.content}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SlideDeck;
