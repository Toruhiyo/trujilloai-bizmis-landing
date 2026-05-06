const PRIMARY_FALLBACK_COMMA = "hsl(29, 93%, 65%)";

/**
 * Parses `H S% L%` from a CSS custom property into comma-separated `hsl(...)`
 * for APIs that mishandle CSS Color Level 4 space-separated `hsl(H S% L%)`.
 * Canvas-based libs (e.g. canvas-confetti) often rendered wrong hues otherwise.
 */
export const hslFromCssVar = (name: string): string => {
  if (typeof document === "undefined") return PRIMARY_FALLBACK_COMMA;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  if (!raw) return PRIMARY_FALLBACK_COMMA;
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length >= 3) {
    const [h, s, l] = parts;
    return `hsl(${h}, ${s}, ${l})`;
  }
  return PRIMARY_FALLBACK_COMMA;
};

/**
 * Canonical Bizmis orange / cream hex palette for canvas-confetti. Hex parses
 * reliably on canvas; dynamic hsl(var...) strings caused mint/incorrect hues in production.
 * Anchored to design token `--primary` ≈ #FD912A.
 */
export const BIZMIS_CONFETTI_HEX = [
  "#FD912A",
  "#D9710F",
  "#FFB366",
  "#FFC889",
  "#FFEAD6",
  "#FFF8F0",
  "#FFFFFF",
] as const;

export const bizmisConfettiColors = (): string[] => [...BIZMIS_CONFETTI_HEX];
