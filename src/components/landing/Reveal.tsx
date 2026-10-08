import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** True once the element has scrolled into view (never resets). */
export const useInView = <T extends Element>(threshold = 0.25) => {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, threshold]);
  return [ref, inView] as const;
};

interface RevealProps {
  as?: ElementType;
  delay?: number;
  className?: string;
  children: ReactNode;
}

/**
 * Fades and lifts its content in when it enters the viewport, and sets
 * `is-in` so CSS-driven moments inside (strikes, checks, stamps) can play.
 */
const Reveal = ({ as: Tag = "div", delay = 0, className, children }: RevealProps) => {
  const [ref, inView] = useInView<HTMLElement>();
  return (
    <Tag
      ref={ref}
      className={cn("bzl-reveal", inView && "is-in", className)}
      style={{ "--bzl-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
