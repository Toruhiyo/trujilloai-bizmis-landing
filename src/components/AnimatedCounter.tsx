import React, { useEffect, useState, useRef } from "react";

interface AnimatedCounterProps {
  targetValue: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  startAnimation?: boolean;
  decimals?: number;
  isPercentage?: boolean;
  isMultiplier?: boolean;
  direction?: "up" | "down";
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  targetValue,
  duration = 2000,
  suffix = "",
  prefix = "",
  className = "",
  startAnimation = true,
  decimals = 0,
  isPercentage = false,
  isMultiplier = false,
  direction = "up",
}) => {
  const [currentValue, setCurrentValue] = useState(
    direction === "down" ? 100 : 0
  );
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !startAnimation) return;

    const startValue = direction === "down" ? 100 : 0;
    const endValue = targetValue;
    const range = Math.abs(endValue - startValue);
    const increment = range / (duration / 16); // 60 FPS

    let current = startValue;
    const timer = setInterval(() => {
      if (direction === "down") {
        current -= increment;
        if (current <= endValue) {
          current = endValue;
          clearInterval(timer);
        }
      } else {
        current += increment;
        if (current >= endValue) {
          current = endValue;
          clearInterval(timer);
        }
      }

      setCurrentValue(current);
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, startAnimation, targetValue, duration, direction]);

  const formatValue = (value: number) => {
    if (isMultiplier) {
      return `${value.toFixed(1)}×`;
    }
    if (isPercentage) {
      return `${Math.round(value)}%`;
    }
    return value.toFixed(decimals);
  };

  return (
    <div ref={counterRef} className={`inline-block ${className}`}>
      <span className="tabular-nums font-bold tracking-tight">
        {prefix}
        {formatValue(currentValue)}
        {suffix}
      </span>
    </div>
  );
};

export default AnimatedCounter;
