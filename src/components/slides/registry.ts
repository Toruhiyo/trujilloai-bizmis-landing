import type { SlideDefinition } from "./SlideDeck";
import {
  HeroBackground,
  Benefit1Background,
  Benefit2Background,
  Benefit3Background,
  SetupBackground,
  CustomizationBackground,
  CTABackground,
} from "./backgrounds";

export const SLIDES: Record<string, SlideDefinition> = {
  hero: { label: "Hero", Background: HeroBackground, isStudio: true },
  benefit1: { label: "Benefit 1 — Boost Sales", Background: Benefit1Background },
  benefit2: { label: "Benefit 2 — Customer Support", Background: Benefit2Background },
  benefit3: { label: "Benefit 3 — Store Insights", Background: Benefit3Background },
  setup: { label: "Setup", Background: SetupBackground },
  customization: { label: "Customization", Background: CustomizationBackground },
  cta: { label: "CTA", Background: CTABackground, isStudio: true },
};
