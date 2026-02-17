export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface FAQCategory {
  id: string;
  name: string;
  faqs: FAQ[];
}

export const faqCategories: FAQCategory[] = [
  {
    id: "getting-started",
    name: "Getting Started",
    faqs: [
      {
        id: "what-is-bizmis",
        question: "What is Bizmis?",
        answer:
          "Bizmis is a fully-integrated, plug-and-play digital sales assistant for Shopify stores. It welcomes shoppers, answers questions, and confidently guides them to purchase decisions—like a great in-store salesperson.",
        category: "getting-started",
      },
      {
        id: "is-chatbot",
        question: "Is Bizmis a chatbot?",
        answer:
          "No. Bizmis is not a chatbot. It's a professional, voice-powered sales and support presence embedded in your store.",
        category: "getting-started",
      },
      {
        id: "how-fast-start",
        question: "How fast can I get started?",
        answer:
          "Installation is one click from the Shopify App Store. Bizmis auto-syncs with your store and works immediately—no manual configuration and no training required.",
        category: "getting-started",
      },
      {
        id: "when-see-value",
        question: "When will I start seeing value?",
        answer:
          "From first install to first sale—Bizmis goes live and starts helping customers immediately.",
        category: "getting-started",
      },
    ],
  },
  {
    id: "features",
    name: "Features & Capabilities",
    faqs: [
      {
        id: "increase-sales",
        question: "How does Bizmis help increase sales?",
        answer:
          'It delivers expert product guidance, smart discovery and comparison, and upselling strategies, plus "confidence at checkout" to reduce hesitation and cart abandonment.',
        category: "features",
      },
      {
        id: "customer-support",
        question: "Does Bizmis handle customer support?",
        answer:
          "Yes. It handles support inquiries with empathy and efficiency, 24/7—resolving doubts and turning support conversations into sales opportunities.",
        category: "features",
      },
      {
        id: "cart-abandonment",
        question: "Does Bizmis help with cart abandonment?",
        answer: "Cart abandonment recovery is included in the Growth plan.",
        category: "features",
      },
      {
        id: "analytics-insights",
        question: "What analytics and insights do I get?",
        answer:
          "Session replays, auto-tagged conversations, and dashboard insights that summarize behavior, conversation outcomes, and conversion trends.",
        category: "features",
      },
      {
        id: "review-conversations",
        question: "Can I review conversations later?",
        answer:
          "Yes. You can view session replays and see auto-tagged chat themes to uncover common questions and interests.",
        category: "features",
      },
    ],
  },
  {
    id: "billing",
    name: "Billing",
    faqs: [
      {
        id: "how-billing-works",
        question: "How does the billing work?",
        answer: "Billing operates on monthly cycles. Your included minutes reset every month with no rollover. The monthly commitment is charged upfront at the start of each month.",
        category: "billing",
      },
      {
        id: "after-included-minutes",
        question: "What happens after I use my included minutes?",
        answer: "After your included minutes are used, additional minutes are billed at your plan's extra minutes rate. Usage is tracked in real-time in your dashboard.",
        category: "billing",
      },
      {
        id: "yearly-billing",
        question: "How does yearly billing work?",
        answer: "Yearly billing gives you ~20% off (up to 33% with Early Bird). Minutes still operate in monthly cycles, resetting each month. The yearly commitment is charged upfront.",
        category: "billing",
      },
      {
        id: "early-bird-offer",
        question: "What is the Early Bird offer?",
        answer: "The first 50 merchants receive special pricing: 50% off monthly plans for the first 3 months, or special yearly rates (up to 33% off). Extra minutes remain at standard rates.",
        category: "billing",
      },
      {
        id: "refund-policy",
        question: "What's your refund policy?",
        answer: "Yearly plans include a 30-day money-back guarantee, no questions asked (commitment fee only). Monthly plans can be cancelled anytime.",
        category: "billing",
      },
      {
        id: "upgrade-monthly-to-yearly",
        question: "Can I upgrade from monthly to yearly?",
        answer: "Yes! Upgrade to yearly within your first 90 days and we'll credit what you already paid toward your yearly plan. Credit applies to commit charges only; on-demand usage charges are excluded.",
        category: "billing",
      },
    ],
  },
  {
    id: "shopify-integration",
    name: "Shopify Integration",
    faqs: [
      {
        id: "bizmis-sync",
        question: "What does Bizmis sync from Shopify?",
        answer:
          "Products & collections, discounts & promotions, customer records, orders & history, and store policies & branding.",
        category: "shopify-integration",
      },
      {
        id: "only-shopify",
        question: "Does Bizmis only work with Shopify?",
        answer: "Yes—Bizmis is built exclusively for Shopify.",
        category: "shopify-integration",
      },
    ],
  },
  {
    id: "customization",
    name: "Customization",
    faqs: [
      {
        id: "personalize-voice-look",
        question: "Can I personalize the voice and look?",
        answer:
          "Yes. Bizmis offers voice cloning (so it can use your voice) and avatar customization to reflect your brand.",
        category: "customization",
      },
      {
        id: "feel-human",
        question: "Will the assistant feel human?",
        answer:
          "Yes. Tone, pacing, and expression are designed for a real, human-like presence.",
        category: "customization",
      },
      {
        id: "multi-language",
        question: "Is multi-language support available?",
        answer: "Yes—multi-language support is included in the Pro plan.",
        category: "customization",
      },
      {
        id: "ab-testing-whitelabel",
        question: "Do you support A/B testing or white-labeling?",
        answer:
          "Behavioral A/B testing and white-labeling are included in the Pro plan.",
        category: "customization",
      },
    ],
  },
  {
    id: "support",
    name: "Support & Guarantees",
    faqs: [
      {
        id: "free-trial",
        question: "Do you offer a free trial?",
        answer:
          "Yes. All plans include a 14-day free trial. No credit card required.",
        category: "support",
      },
      {
        id: "can-cancel",
        question: "Can I cancel if it's not a fit?",
        answer:
          "Yes. Cancel anytime. There's also a 30-day money-back guarantee.",
        category: "support",
      },
      {
        id: "who-uses",
        question: "Who uses Bizmis?",
        answer: "Bizmis is trusted by 1,000+ stores.",
        category: "support",
      },
    ],
  },
];

// Flatten all FAQs for search functionality
export const allFAQs: FAQ[] = faqCategories.flatMap(
  (category) => category.faqs
);
