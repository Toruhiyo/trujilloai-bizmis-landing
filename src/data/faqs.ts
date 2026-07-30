import type { Messages } from "@/i18n/messages/en";

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

/** Category ids, in display order. Names come from `messages.faqs.categories`. */
const CATEGORY_IDS = [
  "getting-started",
  "what-bizmis-does",
  "pricing-billing",
  "customization",
  "privacy-data",
  "shopify-integration",
] as const;

/** FAQ item ids grouped by category, in display order. Question/answer text
 *  comes from `messages.faqs.items`. */
const CATEGORY_ITEM_IDS: Record<(typeof CATEGORY_IDS)[number], string[]> = {
  "getting-started": [
    "what-is-bizmis",
    "is-chatbot",
    "how-fast-start",
    "when-see-value",
  ],
  "what-bizmis-does": [
    "what-it-does",
    "place-orders",
    "cart-management",
    "feels-human",
    "insights-analytics",
    "review-conversations",
  ],
  "pricing-billing": [
    "how-much-cost",
    "credit-model",
    "yearly-billing",
    "early-access-offer",
    "free-plan",
    "billing-payment-method",
    "upgrade-plan",
    "downgrade-plan",
    "monthly-to-yearly",
    "cancel-anytime",
    "refund-policy",
  ],
  customization: [
    "personalize-voice-avatar",
    "multi-language",
    "customize-content",
    "multiple-clerks",
  ],
  "privacy-data": [
    "data-collected",
    "train-on-data",
    "sub-processors",
    "gdpr-compliant",
    "data-retention",
  ],
  "shopify-integration": [
    "shopify-only",
    "what-syncs",
    "permissions",
    "uninstall",
  ],
};

export const buildFaqCategories = (messages: Messages): FAQCategory[] =>
  CATEGORY_IDS.map((categoryId) => ({
    id: categoryId,
    name: messages.faqs.categories[categoryId],
    faqs: CATEGORY_ITEM_IDS[categoryId].map((itemId) => {
      const item = messages.faqs.items[itemId];
      return {
        id: itemId,
        question: item.question,
        answer: item.answer,
        category: categoryId,
      };
    }),
  }));

export const buildAllFaqs = (messages: Messages): FAQ[] =>
  buildFaqCategories(messages).flatMap((category) => category.faqs);
