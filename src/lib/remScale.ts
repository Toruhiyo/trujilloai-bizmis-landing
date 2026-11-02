/**
 * The page's rem over 16px: 1 up to 1440 wide, more on big screens, where
 * src/styles/big-screen.css grows the root font size with the screen. A
 * layout measured in px times this keeps the 1440 layout's proportions, only
 * bigger (e.g. Boost Sales' stage, the devices' virtual screens).
 *
 * Worked out once per page and kept until the window resizes: the funnel asks for it every frame, and reading the
 * window's width or the root's computed style makes the browser bring the
 * page's style and layout up to date first, mid-frame.
 */
let cached: { key: string; u: number } | null = null;

if (typeof window !== "undefined") window.addEventListener("resize", () => (cached = null));

export const remScale = () => {
  if (typeof window === "undefined") return 1;
  // (per page as well: big-screen.css grows the root only on the pages that hold .bzl or .bzl-site)
  const key = window.location.pathname;
  if (cached?.key !== key)
    cached = {
      key,
      u:
        window.innerWidth <= 1440
          ? 1
          : Math.max(1, parseFloat(getComputedStyle(document.documentElement).fontSize) / 16 || 1),
    };
  return cached.u;
};
