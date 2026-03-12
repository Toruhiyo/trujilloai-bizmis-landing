import SlideDeck from "@/components/slides/SlideDeck";
import { SLIDES } from "@/components/slides/registry";

const ALL_SLIDES = [
  SLIDES.hero,
  SLIDES.benefit1,
  SLIDES.benefit2,
  SLIDES.benefit3,
  SLIDES.setup,
  SLIDES.customization,
  SLIDES.cta,
];

const Slides = () => <SlideDeck slides={ALL_SLIDES} />;

export default Slides;
