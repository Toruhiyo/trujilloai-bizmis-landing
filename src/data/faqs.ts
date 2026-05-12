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
          "Bizmis is a voice-first AI store clerk for Shopify. It greets shoppers, answers questions about products, orders, returns, and policies, and guides them toward checkout — the way a knowledgeable in-store clerk would. It runs 24/7 inside your storefront as a small voice widget.",
        category: "getting-started",
      },
      {
        id: "is-chatbot",
        question: "Is Bizmis a chatbot?",
        answer:
          "No. Bizmis is voice-first, not text-first. Shoppers speak, Bizmis speaks back, and the conversation flows like a real exchange with a store clerk — not a scripted chat tree. The on-screen widget shows a transcript so they can see what's been said, but the primary interaction is voice.",
        category: "getting-started",
      },
      {
        id: "how-fast-start",
        question: "How fast can I get started?",
        answer:
          "One click to install from the Shopify App Store. Bizmis auto-syncs your products, collections, policies, and FAQs from your store. No manual configuration, no model training, no engineering required. Most stores are live within minutes.",
        category: "getting-started",
      },
      {
        id: "when-see-value",
        question: "When will I start seeing value?",
        answer:
          "From the first conversation. Bizmis goes live the moment install completes and starts helping shoppers immediately.",
        category: "getting-started",
      },
    ],
  },
  {
    id: "what-bizmis-does",
    name: "What Bizmis Does",
    faqs: [
      {
        id: "what-it-does",
        question: "What does Bizmis actually do?",
        answer:
          "Three things. **Sales:** greets shoppers, qualifies intent, recommends products, and walks them to checkout. **Support:** handles order status, shipping, returns, policies, and FAQs around the clock. **Insights:** session replays, auto-tagged journeys, and funnel analytics so you can see what shoppers actually ask, want, and abandon over.",
        category: "what-bizmis-does",
      },
      {
        id: "place-orders",
        question: "Does Bizmis place orders or take payments?",
        answer:
          "No. Checkout, payment, refunds, and order modifications stay with Shopify and your existing flows. Bizmis surfaces information and guides decisions; it never completes a transaction or modifies an order on the shopper's behalf.",
        category: "what-bizmis-does",
      },
      {
        id: "cart-management",
        question: "Does Bizmis manage carts or recover abandoned carts?",
        answer:
          "Not currently. Cart management is intentionally disabled while we tune the explicit voice-confirmation pattern needed for write actions. Bizmis can recommend products and walk shoppers toward checkout, but it won't add, remove, or modify cart items on their behalf. This may change in a future release.",
        category: "what-bizmis-does",
      },
      {
        id: "feels-human",
        question: "Will the assistant feel human?",
        answer:
          "Yes. Tone, pacing, expression, and warmth are designed to feel like a real clerk, not a robotic voice. Shoppers know they're talking to AI — Bizmis says so up front, per the EU AI Act — but the experience is conversational, not transactional.",
        category: "what-bizmis-does",
      },
      {
        id: "insights-analytics",
        question: "What insights do I get?",
        answer:
          "A dashboard with session replays, conversation transcripts, auto-tagged conversation themes (Sales / Support / Unknown), outcomes (Answered / Escalated / Unresolved), and funnel events (e.g. products shown, products discussed, intent to buy). You see what shoppers actually want, where they hesitate, and what your storefront isn't answering well.",
        category: "what-bizmis-does",
      },
      {
        id: "review-conversations",
        question: "Can I review past conversations?",
        answer:
          "Yes. Session history and replays are available on Plus and above. You can scrub through any conversation, see the transcript, and tag patterns to refine your sales and support rules.",
        category: "what-bizmis-does",
      },
    ],
  },
  {
    id: "pricing-billing",
    name: "Pricing & Billing",
    faqs: [
      {
        id: "how-much-cost",
        question: "How much does Bizmis cost?",
        answer:
          "Three plans plus Enterprise. **Starter** ($149/mo, 2,500 credits) for solo or small stores. **Plus** ($499/mo, 9,000 credits) for growing stores -- most popular. **Pro** ($1,499/mo, 30,000 credits) for high-volume stores. **Enterprise** for custom volume and SLAs. Credits cover both voice and text interactions (1 voice min = 10 credits, 1 text msg = 1 credit). Yearly billing saves ~20%.",
        category: "pricing-billing",
      },
      {
        id: "credit-model",
        question: "How does the credit model work?",
        answer:
          "Each plan includes a credit pool (Starter 2,500 / Plus 9,000 / Pro 30,000) that resets every billing period. Credits cover both voice and text: 1 voice minute = 10 credits, 1 text message = 1 credit. Usage beyond the pool is billed at your plan's overage rate ($0.06 / $0.055 / $0.05 per credit). You set a hard spend cap inside the Bizmis admin -- once hit, usage pauses until the next period or until you raise the cap. Unused credits don't roll over.",
        category: "pricing-billing",
      },
      {
        id: "yearly-billing",
        question: "How does yearly billing work?",
        answer:
          "Yearly billing is paid upfront and gives you ~20% off the monthly price. Included credits still reset every month. Yearly plans don't include overage -- once your monthly credit pool is exhausted, usage pauses until next month.",
        category: "pricing-billing",
      },
      {
        id: "early-access-offer",
        question: "What is the Early Access offer?",
        answer:
          "The first 50 merchants get **50% off the first 3 months** on monthly plans, or **~33% off** yearly plans (Starter $99, Plus $333, Pro $999 monthly equivalent). Apply with code EARLY_BIRD_50. After the first 3 months on monthly, standard rates resume. Overage credits are billed at standard rates throughout.",
        category: "pricing-billing",
      },
      {
        id: "upgrade-plan",
        question: "What happens when I upgrade my plan?",
        answer:
          "Upgrades take effect immediately. You're charged the prorated difference for the rest of the current period; usage counters and billing date stay the same. New entitlements unlock right away.",
        category: "pricing-billing",
      },
      {
        id: "downgrade-plan",
        question: "What happens when I downgrade my plan?",
        answer:
          "Downgrades take effect at the next renewal — you keep your current plan and entitlements until then. No usage counter resets, no proration.",
        category: "pricing-billing",
      },
      {
        id: "monthly-to-yearly",
        question: "Can I switch from monthly to yearly?",
        answer:
          "Yes. Switch within your first 90 days and we'll credit the monthly commitment fees you've already paid toward your yearly plan. Credit applies to commitment fees only — overage usage isn't credited.",
        category: "pricing-billing",
      },
      {
        id: "cancel-anytime",
        question: "Can I cancel anytime?",
        answer:
          "Yes, from the Bizmis admin or by uninstalling the app. Cancellation is immediate — the voice widget stops serving shoppers as soon as it's confirmed.",
        category: "pricing-billing",
      },
      {
        id: "refund-policy",
        question: "What's your refund policy?",
        answer:
          "**Yearly plans:** 30-day money-back guarantee on the initial yearly charge -- cancel within 30 days of your first yearly payment and we'll refund the commitment fee, no questions asked. The guarantee doesn't cover renewal years or overage usage.\n**Monthly plans:** charges already billed for the current period are non-refundable, but you won't be billed again. Unused credits don't carry over.",
        category: "pricing-billing",
      },
    ],
  },
  {
    id: "customization",
    name: "Customization",
    faqs: [
      {
        id: "personalize-voice-avatar",
        question: "Can I personalize the voice and the avatar?",
        answer:
          "Yes. Choose from a curated set of natural-sounding voices across 25+ languages, or pick from four avatar characters (Plus and above). You can also configure greeting, tone, and behavior to match your brand.",
        category: "customization",
      },
      {
        id: "multi-language",
        question: "Does Bizmis speak multiple languages?",
        answer:
          "Yes. Bizmis auto-detects the shopper's language and replies in the same one — 25+ languages supported, on every plan. No per-language configuration needed.",
        category: "customization",
      },
      {
        id: "customize-content",
        question: "Can I customize what Bizmis says about my products?",
        answer:
          "Yes. Configure **Sales rules** (how Bizmis recommends, compares, upsells), **Support rules** (escalation triggers, refusal patterns), and a **Knowledge base** (FAQs, store policies, product notes that aren't on your product pages) directly from the embedded admin.",
        category: "customization",
      },
      {
        id: "multiple-clerks",
        question: "How many Bizmis Store Clerks can I run?",
        answer:
          "One on Starter, up to five on Plus, unlimited on Pro and Enterprise. Each clerk can have its own voice, avatar, and rule set — useful if you sell across distinct collections or markets.",
        category: "customization",
      },
    ],
  },
  {
    id: "privacy-data",
    name: "Privacy & Data",
    faqs: [
      {
        id: "data-collected",
        question: "What data does Bizmis collect?",
        answer:
          "From shoppers: voice audio, conversation transcripts, browsing activity during the session, and language preference. Email is collected only if the shopper is signed in to your Shopify storefront. From merchants: store details, configuration preferences, and Shopify access tokens used to operate the app.",
        category: "privacy-data",
      },
      {
        id: "train-on-data",
        question: "Do you train AI models on shopper data?",
        answer:
          "**No.** Shopper voice recordings and conversation transcripts are never used to train any AI model — ours or our sub-processors'. AWS Bedrock customer data isn't used for model training by default; Anthropic doesn't train its foundation models on API or Bedrock customer data; and our ElevenLabs integration is configured so conversation audio isn't used to improve their models.",
        category: "privacy-data",
      },
      {
        id: "sub-processors",
        question: "Who are your sub-processors?",
        answer:
          "**ElevenLabs** for speech-to-text, text-to-speech, and orchestration of the voice agent. **Anthropic** (Claude family) for response generation, via ElevenLabs and via AWS Bedrock for backend tasks. **Amazon Web Services** for hosting, storage, and Bedrock model inference. **Shopify** for store and customer context. Full retention windows and processing regions are in our Privacy Policy.",
        category: "privacy-data",
      },
      {
        id: "gdpr-compliant",
        question: "Is Bizmis GDPR-compliant?",
        answer:
          "Yes. Bizmis acts as a data processor on the merchant's behalf for shopper data; Section 12 of our Terms is an inline GDPR Article 28 DPA. Shoppers retain GDPR/CPRA data rights — access, correction, deletion, restriction, portability. We honor Shopify's mandatory compliance webhooks and respond to direct requests at hello@bizmis.ai. EU Standard Contractual Clauses are available on request.",
        category: "privacy-data",
      },
      {
        id: "data-retention",
        question: "How long do you keep conversation data?",
        answer:
          "Session metadata is auto-deleted after 60 minutes of inactivity. Conversation recordings and transcripts are retained while your installation is active. After uninstall, data is held during Shopify's 48-hour reinstall window, then deleted within 30 days of the shop/redact webhook. Individual conversations can be deleted on demand at any time.",
        category: "privacy-data",
      },
    ],
  },
  {
    id: "shopify-integration",
    name: "Shopify Integration",
    faqs: [
      {
        id: "shopify-only",
        question: "Does Bizmis only work with Shopify?",
        answer:
          "Yes. Bizmis is purpose-built for Shopify and uses Shopify APIs for product, customer, order, and policy data. No plans to support other platforms in the near term.",
        category: "shopify-integration",
      },
      {
        id: "what-syncs",
        question: "What does Bizmis sync from my store?",
        answer:
          "Products and collections, prices and discounts, customer records (when signed in), order history, and store policies (shipping, returns, FAQ). Sync is automatic and continuous — when you update a product, Bizmis sees it.",
        category: "shopify-integration",
      },
      {
        id: "permissions",
        question: "What permissions does Bizmis request?",
        answer:
          "Standard Shopify scopes for product, customer, order, and policy reads, plus protected customer data scopes (read_customers, read_orders) for the support flows. We follow Shopify's Protected Customer Data Requirements: encryption in transit and at rest, least-privilege access, no resale or advertising use of protected data. Tokens are revoked immediately on uninstall.",
        category: "shopify-integration",
      },
      {
        id: "uninstall",
        question: "What happens when I uninstall?",
        answer:
          "The widget stops serving shoppers immediately. Shopify's app/uninstalled webhook revokes access tokens. Configuration data is held for Shopify's 48-hour reinstall window — if you reinstall within that window, everything (history included) is restored. After 48 hours, Shopify dispatches shop/redact and we delete configuration and conversation data within 30 days.",
        category: "shopify-integration",
      },
    ],
  },
];

// Flatten all FAQs for search functionality
export const allFAQs: FAQ[] = faqCategories.flatMap(
  (category) => category.faqs
);
