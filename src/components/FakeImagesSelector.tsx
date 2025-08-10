import React from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface ImageOption {
  id: string;
  title: string;
  url: string;
  alt?: string;
}

export interface FakeImagesSelectorProps {
  images: ImageOption[];
  selectedId?: string;
  orientation?: "vertical" | "horizontal";
  direction?: "forward" | "reverse";
  numberOfDuplicates?: number;
  autoRotateInterval?: number;
  containerSize?: {
    width: string;
    height: string;
  };
  imageSize?: {
    width: string;
    height: string;
  };
  containerClasses?: string;
  imageClasses?: string;
  showFading?: boolean;
  fadingColor?: string;
  draggable?: boolean;
  showArrows?: boolean;
  selectable?: boolean;
  onImageSelect?: (imageId: string) => void;
}

const FakeImagesSelector: React.FC<FakeImagesSelectorProps> = ({
  images,
  selectedId,
  orientation = "vertical",
  direction = "forward",
  numberOfDuplicates = 10,
  autoRotateInterval = 4000,
  containerSize = {
    width: "w-[28rem]",
    height: "h-[36rem]",
  },
  imageSize = {
    width: "w-28",
    height: "h-28",
  },
  containerClasses = "",
  imageClasses = "",
  showFading = true,
  fadingColor = "white",
  draggable = true,
  showArrows = false,
  selectable = true,
  onImageSelect,
}) => {
  // Create extended array for seamless infinite loop
  const extendedImages = Array(numberOfDuplicates).fill(images).flat();

  // Auto-spin carousel when idling
  const [currentSlide, setCurrentSlide] = React.useState(images.length); // Start from middle copy
  const [isDragging, setIsDragging] = React.useState(false);

  const isVertical = orientation === "vertical";
  const isReverse = direction === "reverse";

  React.useEffect(() => {
    if (isDragging || autoRotateInterval <= 0) return; // Don't auto-rotate while dragging or if disabled

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (isReverse ? prev - 1 : prev + 1));
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [isDragging, autoRotateInterval, isReverse]);

  // Seamless reset for infinite loop
  React.useEffect(() => {
    if (isReverse) {
      // Reverse direction: when we go below the second copy, reset to the end of the second copy
      if (currentSlide < images.length) {
        setTimeout(() => {
          setCurrentSlide(images.length * 2 - 1);
        }, 0);
      }
      // When we reach the end of the second copy, reset to the beginning of the second copy
      if (currentSlide >= images.length * 2) {
        setTimeout(() => {
          setCurrentSlide(images.length);
        }, 0);
      }
    } else {
      // Forward direction: when we reach the end of the second copy, reset to the beginning of the second copy
      if (currentSlide >= images.length * 2) {
        setTimeout(() => {
          setCurrentSlide(images.length);
        }, 0);
      }
      // If we go below the second copy, reset to the end of the second copy
      if (currentSlide < images.length) {
        setTimeout(() => {
          setCurrentSlide(images.length * 2 - 1);
        }, 0);
      }
    }
  }, [currentSlide, images.length, isReverse]);

  const slideSize = isVertical ? 144 : 144; // Size in pixels for each slide (36 * 4 + spacing = 144px)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!draggable) return;

    setIsDragging(true);
    const startPos = isVertical ? e.clientY : e.clientX;
    const startSlide = currentSlide;

    const handleMouseMove = (e: MouseEvent) => {
      const currentPos = isVertical ? e.clientY : e.clientX;
      const delta = startPos - currentPos;
      const slideChange = Math.round(delta / 40);
      const newSlide = startSlide + slideChange;
      setCurrentSlide(newSlide);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleImageClick = (image: ImageOption) => {
    if (selectable && onImageSelect) {
      onImageSelect(image.id);
    }
  };

  const handlePrevious = () => {
    setCurrentSlide((prev) => prev - 1);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => prev + 1);
  };

  const getImageClasses = (image: ImageOption) => {
    const isSelected = selectedId === image.id;
    const sizeClasses = isSelected
      ? "w-32 h-32" // Bigger size for selected image
      : `${imageSize.width} ${imageSize.height}`;

    const baseClasses = `${sizeClasses} bg-white/90 rounded-xl shadow-lg border flex items-center justify-center transition-all duration-300 ${
      selectable ? "cursor-pointer" : ""
    }`;

    const selectedClasses = isSelected
      ? "border-orange-600 bg-orange-50/90 shadow-orange-200/50 ring-2 ring-orange-600/30 scale-105"
      : `border-gray-200 ${selectable ? "hover:border-orange-300" : ""}`;

    return `${baseClasses} ${selectedClasses} ${imageClasses}`;
  };

  return (
    <div
      className={`relative ${containerSize.width} ${containerSize.height} overflow-hidden rounded-2xl ${containerClasses}`}
    >
      {/* Fading overlays */}
      {showFading && (
        <>
          {isVertical ? (
            <>
              <div
                className={`absolute top-0 left-1/2 transform -translate-x-1/2 ${imageSize.width} h-20 bg-gradient-to-b from-white via-white/60 to-transparent z-10`}
              ></div>
              <div
                className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 ${imageSize.width} h-20 bg-gradient-to-t from-white via-white/60 to-transparent z-10`}
              ></div>
            </>
          ) : (
            <>
              <div
                className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-20 ${imageSize.height} bg-gradient-to-r from-white via-white/60 to-transparent z-10`}
              ></div>
              <div
                className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-20 ${imageSize.height} bg-gradient-to-l from-white via-white/60 to-transparent z-10`}
              ></div>
            </>
          )}
        </>
      )}

      {/* Arrow controls */}
      {showArrows && (
        <>
          <button
            onClick={handlePrevious}
            className={`absolute ${isVertical ? "top-2" : "left-2"} ${
              isVertical
                ? "left-1/2 transform -translate-x-1/2"
                : "top-1/2 transform -translate-y-1/2"
            } z-20 bg-white/80 hover:bg-white border border-orange-200 text-orange-600 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110`}
          >
            {isVertical ? <ChevronUp size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button
            onClick={handleNext}
            className={`absolute ${isVertical ? "bottom-2" : "right-2"} ${
              isVertical
                ? "left-1/2 transform -translate-x-1/2"
                : "top-1/2 transform -translate-y-1/2"
            } z-20 bg-white/80 hover:bg-white border border-orange-200 text-orange-600 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110`}
          >
            {isVertical ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        </>
      )}

      {/* Auto-rotating carousel */}
      <div
        className={`flex ${
          isVertical ? "flex-col" : "flex-row"
        } transition-transform duration-1000 ease-in-out ${
          draggable ? "cursor-grab active:cursor-grabbing" : ""
        }`}
        style={{
          transform: isVertical
            ? `translateY(-${currentSlide * slideSize}px)`
            : `translateX(-${currentSlide * slideSize}px)`,
          [isVertical ? "height" : "width"]: `${
            extendedImages.length * slideSize
          }px`,
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Render extended images for seamless infinite loop */}
        {extendedImages.map((image, index) => (
          <div
            key={`${image.id}-${index}`}
            className={`${
              isVertical ? "w-full h-36" : "h-full w-36"
            } flex items-center justify-center flex-shrink-0 p-2`}
          >
            <div
              className={getImageClasses(image)}
              onClick={() => handleImageClick(image)}
            >
              <img
                src={image.url}
                alt={image.alt || image.title}
                className={`object-contain ${
                  selectedId === image.id ? "w-28 h-28" : "w-24 h-24"
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FakeImagesSelector;
