export interface ShopperProduct {
  id: string;
  name: string;
  price: string;
  /** Label shown on non-recommended products (the recommended one always shows "Best Match"). */
  label: string;
  image: string;
}

export interface ShopperCase {
  id: string;
  customerImage: string;
  customerQuote: string;
  /** Always exactly three products for the recommendation row. */
  products: [ShopperProduct, ShopperProduct, ShopperProduct];
  recommendedProductId: string;
  deliveryEstimate: string;
}

const COZY_CANDLES: ShopperProduct = {
  id: "cozy-candles",
  name: "Cozy Candle Set",
  price: "$48",
  label: "Cozy Pick",
  image: "/images/benefit-3-session-replay-cozy-candle-set.png",
};

const FRENCH_PRESS: ShopperProduct = {
  id: "french-press",
  name: "French Press Kit",
  price: "$89",
  label: "Pro Pick",
  image: "/images/benefit-3-session-replay-french-press.png",
};

const ETHIOPIAN_BEANS: ShopperProduct = {
  id: "ethiopian-beans",
  name: "Ethiopian Beans",
  price: "$32",
  label: "Great Value",
  image: "/images/benefit-3-session-replay-ethiopian-beans.png",
};

const PREMIUM_ROAST_SUB: ShopperProduct = {
  id: "premium-roast-subscription",
  name: "Roast Subscription",
  price: "$24/mo",
  label: "Recurring",
  image: "/images/benefit-3-session-replay-premium-rost-subscription.png",
};

const INSULATED_TRAVEL_MUG: ShopperProduct = {
  id: "insulated-travel-mug",
  name: "Travel Mug",
  price: "$36",
  label: "On-the-go",
  image: "/images/benefit-3-session-replay-insulated-travel-mug.png",
};

const CANDLES: ShopperProduct = {
  id: "candles",
  name: "Scented Candles",
  price: "$22",
  label: "Calming",
  image: "/images/benefit-3-session-replay-candles.png",
};

const DEFAULT_DELIVERY = "Delivery in 2-3 days";

export const SHOPPER_CASES: ShopperCase[] = [
  {
    id: "birthday-gift",
    customerImage: "/images/benefit-1-driven-sales-pipeline-customer.png",
    customerQuote: '"Looking for a birthday gift."',
    products: [COZY_CANDLES, FRENCH_PRESS, ETHIOPIAN_BEANS],
    recommendedProductId: FRENCH_PRESS.id,
    deliveryEstimate: DEFAULT_DELIVERY,
  },
  {
    id: "morning-routine",
    customerImage: "/images/benefit-2-customer-1.png",
    customerQuote: '"Help me build my morning routine."',
    products: [FRENCH_PRESS, PREMIUM_ROAST_SUB, ETHIOPIAN_BEANS],
    recommendedProductId: PREMIUM_ROAST_SUB.id,
    deliveryEstimate: DEFAULT_DELIVERY,
  },
  {
    id: "cozy-for-mom",
    customerImage: "/images/benefit-2-customer-3.png",
    customerQuote: '"Something cozy for my mom."',
    products: [ETHIOPIAN_BEANS, COZY_CANDLES, CANDLES],
    recommendedProductId: COZY_CANDLES.id,
    deliveryEstimate: DEFAULT_DELIVERY,
  },
  {
    id: "camping-coffee",
    customerImage: "/images/benefit-2-customer-5.png",
    customerQuote: '"I need coffee for camping trips."',
    products: [FRENCH_PRESS, ETHIOPIAN_BEANS, INSULATED_TRAVEL_MUG],
    recommendedProductId: INSULATED_TRAVEL_MUG.id,
    deliveryEstimate: DEFAULT_DELIVERY,
  },
];
