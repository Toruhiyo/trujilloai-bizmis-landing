/**
 * The page's rem over 16px: 1 up to 1440 wide, more on big screens, where
 * src/styles/big-screen.css grows the root font size with the screen. A
 * layout measured in px times this keeps the 1440 layout's proportions, only
 * bigger (e.g. Boost Sales' stage, the devices' virtual screens).
 */
export const remScale = () =>
  typeof window === "undefined" || window.innerWidth <= 1440
    ? 1
    : Math.max(1, parseFloat(getComputedStyle(document.documentElement).fontSize) / 16 || 1);
