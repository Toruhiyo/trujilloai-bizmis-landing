import { useEffect, useRef } from "react";

/**
 * For a .bzl-stack section: measures its sticky .bzl-head and publishes the
 * height as --bzl-head on the section, so each .bzl-sub can fill exactly the
 * space left under it.
 */
export const useStickyHead = <S extends HTMLElement, H extends HTMLElement>() => {
  const section = useRef<S>(null);
  const head = useRef<H>(null);
  useEffect(() => {
    const s = section.current;
    const h = head.current;
    if (!s || !h || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => s.style.setProperty("--bzl-head", `${h.offsetHeight}px`));
    ro.observe(h);
    return () => ro.disconnect();
  }, []);
  return { section, head };
};
