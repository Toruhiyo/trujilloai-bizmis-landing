export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  company: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "aurelia-home",
    quote: "Feels like a real clerk—our conversion jumped.",
    author: "Sarah Chen",
    company: "Aurelia Home",
  },
  {
    id: "modern-kitchen",
    quote: "Bizmis answers questions I never thought to ask. Sales are up 40%.",
    author: "Mike Rodriguez",
    company: "Modern Kitchen Co",
  },
  {
    id: "eco-threads",
    quote:
      "Our customers love the personalized experience. Support tickets dropped by half.",
    author: "Emma Thompson",
    company: "EcoThreads",
  },
  {
    id: "craft-corner",
    quote: "It's like having our best salesperson online 24/7. Game changer.",
    author: "David Park",
    company: "Craft Corner",
  },
  {
    id: "wellness-store",
    quote:
      "Bizmis knows our products better than some of our staff. Incredible results.",
    author: "Lisa Martinez",
    company: "Pure Wellness Store",
  },
  {
    id: "tech-gadgets",
    quote:
      "The upsells are natural and effective. Revenue per visitor is way up.",
    author: "Jason Kim",
    company: "TechGadgets Pro",
  },
];
