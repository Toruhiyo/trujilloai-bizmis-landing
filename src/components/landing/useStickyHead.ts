import { useEffect, useRef, useState } from "react";

/**
 * For a .bzl-stack section: tracks whether its .bzl-head is stuck under the
 * nav, and publishes the head's stuck height (without the collapsible
 * `extra`, e.g. the subtitle) as --bzl-head on the section, so each .bzl-sub
 * fills exactly the space left under it. The height ignores `extra` on
 * purpose: the subs keep the same size while the subtitle folds away.
 */
export const useStickyHead = <
  S extends HTMLElement,
  H extends HTMLElement,
  E extends HTMLElement = HTMLDivElement,
>() => {
  const section = useRef<S>(null);
  const head = useRef<H>(null);
  const extra = useRef<E>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const s = section.current;
    const h = head.current;
    if (!s || !h || typeof ResizeObserver === "undefined") return;
    const measure = () =>
      s.style.setProperty(
        "--bzl-head",
        `${h.offsetHeight - (extra.current?.offsetHeight ?? 0)}px`,
      );
    const ro = new ResizeObserver(measure);
    ro.observe(h);
    if (extra.current) ro.observe(extra.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const s = section.current;
    const h = head.current;
    if (!s || !h) return;
    let frame = 0;
    const check = () => {
      frame = 0;
      const top = s.getBoundingClientRect().top;
      // stuck once the section has scrolled under the head's sticky top (0)
      setStuck(
        top < -8 && s.getBoundingClientRect().bottom > h.offsetHeight + 40,
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return { section, head, extra, stuck };
};
