import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { testimonials, type Testimonial } from "@/data/testimonials";

interface TestimonialCarouselProps {
  autoRotate?: boolean;
  rotationInterval?: number;
  className?: string;
}

const TRANSITION_DURATION = 3000;
const ROTATION_INTERVAL = 5000;

const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({
  autoRotate = true,
  rotationInterval = ROTATION_INTERVAL,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
        setIsTransitioning(false);
      }, TRANSITION_DURATION / 2);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [autoRotate, rotationInterval]);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div
      className={`bg-white rounded-2xl p-8 shadow-2xl border border-orange-100/20 max-w-sm w-full ${className}`}
    >
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className="w-6 h-6 text-orange-500 fill-current"
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Quote with transition */}
      <div className="min-h-[2.5rem] mb-4">
        <blockquote
          className={`text-lg font-medium text-foreground leading-relaxed transition-opacity duration-300 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          "{currentTestimonial.quote}"
        </blockquote>
      </div>

      {/* Attribution with transition */}
      <div className="min-h-[1.5rem] mb-6">
        <cite
          className={`text-muted-foreground font-medium not-italic transition-opacity duration-300 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          — {currentTestimonial.author}, {currentTestimonial.company}
        </cite>
      </div>

      {/* Trust line */}
      <p className="text-muted-foreground text-sm pt-6 border-t border-orange-100">
        Trusted by 1,000+ stores
      </p>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentIndex(index);
                setIsTransitioning(false);
              }, TRANSITION_DURATION / 2);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentIndex
                ? "bg-orange-500 w-6"
                : "bg-orange-200 hover:bg-orange-300"
            }`}
            aria-label={`View testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialCarousel;
