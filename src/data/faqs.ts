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
    id: "pricing",
    name: "Pricing & Plans",
    faqs: [
      {
        id: "conversations-per-plan",
        question: "How many conversations are included per plan?",
        answer:
          "**Starter ($29/mo):** 500 monthly conversations\n\n**Growth ($79/mo):** 2,500 monthly conversations\n\n**Pro ($179/mo):** Unlimited conversations",
        category: "pricing",
      },
      {
        id: "plan-features",
        question: "What else is included in each plan?",
        answer:
          "**Starter:** Product recommendations, basic voice customization, 24/7 support, basic analytics\n\n**Growth (Most Popular):** Advanced voice cloning, custom avatar design, session replays, tagged insights, cart abandonment recovery\n\n**Pro:** Full personalization, behavioral A/B testing, white-labeling, dedicated manager, multi-language support",
        category: "pricing",
      },
      {
        id: "dedicated-manager",
        question: "Is there a dedicated manager option?",
        answer: "Yes—Pro includes a dedicated manager.",
        category: "pricing",
      },
      {
        id: "what-counts-as-conversation",
        question: "What counts as conversation?",
        answer:
          "A conversation is any interaction where a customer engages with Bizmis. This includes voice interactions, text exchanges, product inquiries, support questions, or any back-and-forth dialogue. Simple page views or browsing without interaction don't count toward your conversation limit.",
        category: "pricing",
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
