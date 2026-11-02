/**
 * Where the avatar renders live and how they're offered (AgentImage), kept
 * free of React so the build can name the hero's render in each landing page's
 * static HTML (a preload, src/seo/prerender.tsx) exactly as the page asks for it.
 */
export const AGENT_IMAGE_BASE = "/landing/agents";
export const AGENT_IMAGE_WIDTHS = [360, 720, 1080];

/** A render's srcset in one format, e.g. "…-360.avif 360w, …-720.avif 720w, …". */
export const agentSrcSet = (name: string, ext: string) =>
  AGENT_IMAGE_WIDTHS.map((width) => `${AGENT_IMAGE_BASE}/${name}-${width}.${ext} ${width}w`).join(", ");

/** The hero's agent render (HeroAgent): the landing's largest first paint on phones. */
export const HERO_AGENT_IMAGE = {
  name: "support-yusuke",
  sizes: "(min-width: 1024px) 20vw, 50vw",
} as const;
