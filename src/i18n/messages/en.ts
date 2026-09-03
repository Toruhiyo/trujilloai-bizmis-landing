/**
 * English is the source dictionary: its shape types every other locale, so a
 * missing or misnamed key in a translation fails the build.
 */
export const en = {
  common: {
    installNow: "Install Now",
    installOnShopify: "Install on Shopify",
    installOnYourStore: "Install on your store",
    installBizmisOnShopify: "Install Bizmis on Shopify",
    liveDemo: "Live Demo",
    bookACall: "Book a call",
    getStarted: "Get Started",
    contactSupport: "Contact Support",
    contactSales: "Contact Sales",
    soon: "Soon",
    email: "hello@bizmis.ai",
  },

  languageSwitcher: {
    label: "Language",
    ariaLabel: "Choose language",
  },

  nav: {
    earlyAccess: "Early Access",
    benefits: "Benefits",
    setup: "Setup",
    pricing: "Pricing",
    faqs: "FAQs",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },

  hero: {
    badgeLabel: "Early Access",
    badgeDetailShort: "First 50 stores",
    badgeDetailLong: "Free for the first 50 Shopify stores",
    titleLine1: "Your Store's",
    titleLine2: "Best Salesperson",
    subtitleLead: "Helps Every Shopper",
    subtitleFind: "Find It",
    subtitleTrust: "Trust It",
    subtitleBuy: "Buy It",
    subtitleConnector: ", and",
    pitchLead: "This isn't a chatbot.",
    pitchShort:
      "Shoppers leave when they can't find the right product or second-guess the buy, the moments an in-store clerk would catch. Bizmis brings that help online, voice-first, narrowing your catalog to the right product and clearing doubts so they buy with confidence.",
    pitchLong:
      "Shoppers leave when they can't find the right product or second-guess the buy, the moments an in-store clerk would catch. Bizmis brings that help online, voice-first. It listens, narrows your catalog to the right product, and reassures away the doubts, so they buy with confidence.",
    installSubline: "One-click install, ready in minutes",
    alsoAvailableFor: "Also available for",
    customWebsites: "custom websites",
    ratherTalk: "Rather talk it through?",
    avatarAlt: "Digital sales assistant helping customers",
  },

  benefits: {
    sales: {
      badge: "Boost Sales",
      title: "Convert. Upsell. Retain.",
      leadShort:
        "A great in-store associate that guides shoppers, lifts cart value, and brings customers back.",
      leadLong:
        "Bizmis acts like a great in-store associate, guiding shoppers, increasing cart value, and creating the kind of personal, warm experience that brings customers back.",
      pillars: [
        {
          title: "Convert More Visitors",
          subtitle: "Remove Buying Hesitation",
          body: "Bizmis answers questions instantly and guides shoppers to the right product, so more visitors feel confident enough to buy.",
        },
        {
          title: "Increase Order Value",
          subtitle: "Smart Upsells & Add-Ons",
          body: "Smart recommendations, upgrades, and complementary products appear naturally during the conversation.",
        },
        {
          title: "Build Customer Loyalty",
          subtitle: "Personal Shopping Experience",
          body: "A warm, personal shopping experience customers remember, and come back for.",
        },
      ],
    },
    support: {
      badge: "Customer Support",
      titleLine1: "Save hours on support.",
      titleLine2: "Earn loyal customers.",
      leadShort:
        "Instant, empathetic 24/7 support that feels human, lifting satisfaction and saving hours of support work.",
      leadLong:
        "Emotional intelligence and instant 24/7 support improve customer satisfaction with immediate, warm, and empathetic resolutions that feel like help from a great in-store clerk, while saving valuable support time.",
      outcomes: {
        saveHours: "Save support hours",
        betterReviews: "Earn better reviews",
        repeatSales: "Grow repeat sales",
      },
      capabilities: [
        {
          title: "24/7 Instant Support",
          tagline: "No waiting, no frustration",
          body: "Customers get help the moment they need it, no waiting, no frustration, no bad reviews from unanswered questions.",
        },
        {
          title: "Store Knowledge",
          tagline: "Policy, product, and docs answered instantly",
          body: "Answers policy, product, and documentation questions instantly, so shoppers and customers get clear guidance without waiting for your team.",
        },
        {
          title: "Emotional Intelligence",
          tagline: "Warm, empathetic responses",
          body: "AI that understands customer emotions and responds with genuine care and understanding.",
        },
      ],
    },
    insights: {
      badge: "Store Insights",
      title: "Learn. Tune. Grow.",
      lead: "See where buyers hesitate, what they ask, and which paths convert, so you fix less, save hours, and invest where revenue grows.",
      features: [
        {
          title: "Session Replays",
          tagline: "Jump straight to drop-offs",
          body: "Jump straight to drop-offs and hesitation points. Fix once, prevent abandoned carts, and recover at-risk sales.",
        },
        {
          title: "Auto-Tagged Chats",
          tagline: "One fix, fewer repeat tickets",
          body: "Conversations auto-group by topic and intent. Update one FAQ/policy, cut repeat tickets, and reduce support load.",
        },
        {
          title: "Funnel Insights",
          tagline: "Spot high-ROI fixes at a glance",
          body: "See conversion paths, drop-offs, and product impact at a glance. Prioritize high-ROI fixes and back the winners.",
        },
      ],
    },
  },

  salesDemo: {
    steps: ["Discover & Recommend", "Compare Products", "Seal the Deal"],
    recommended: "Recommended",
    added: "Added",
    orderConfirmed: "Order Confirmed",
    subtotal: "Subtotal",
    shipping: "Shipping",
    free: "Free",
    total: "Total",
    assistantAlt: "Bizmis assistant",
    deliveryEstimate: "Delivery in 2-3 days",
    productLabels: {
      cozyPick: "Cozy Pick",
      proPick: "Pro Pick",
      greatValue: "Great Value",
      recurring: "Recurring",
      onTheGo: "On-the-go",
      calming: "Calming",
    },
    productNames: {
      cozyCandles: "Cozy Candle Set",
      frenchPress: "French Press Kit",
      ethiopianBeans: "Ethiopian Beans",
      roastSubscription: "Roast Subscription",
      travelMug: "Travel Mug",
      scentedCandles: "Scented Candles",
    },
    shopperQuotes: {
      birthdayGift: '"Looking for a birthday gift."',
      morningRoutine: '"Help me build my morning routine."',
      cozyForMom: '"Something cozy for my mom."',
      campingCoffee: '"I need coffee for camping trips."',
    },
  },

  supportDemo: {
    steps: ["Question received", "Source checked", "Answered & resolved"],
    done: "Done",
    processing: "Processing",
    assistantAlt: "Bizmis support assistant",
    cases: {
      returnPolicy: {
        quote: '"Can I return it if it doesn\'t fit?"',
        action: "Policy retrieved",
        response:
          "Absolutely, you've got 30 days. I can walk you through it if you need to.",
      },
      orderTracking: {
        quote: '"Where\'s my order?"',
        action: "Order tracked",
        response:
          "It shipped yesterday and should arrive Monday. Want the tracking link?",
      },
      shippingTime: {
        quote: '"How long does delivery take?"',
        action: "Shipping checked",
        response: "Usually 2-3 business days. I can show faster options too.",
      },
      changeAddress: {
        quote: '"I put the wrong shipping address."',
        action: "Address updated",
        response: "No problem, I can update it before the order ships.",
      },
      cancelOrder: {
        quote: '"Can I cancel my order?"',
        action: "Order cancelled",
        response: "Yes, it hasn't been processed yet. I can cancel it now.",
      },
      warranty: {
        quote: '"Is there a warranty on this?"',
        action: "Warranty confirmed",
        response: "Yes, everything includes a 2-year warranty.",
      },
      startReturn: {
        quote: '"I want to return this."',
        action: "Return started",
        response: "Of course. I can start the return for you.",
      },
    },
  },

  sessionReplay: {
    categories: {
      sale: "Sale",
      support: "Support",
    },
    tabTooltips: {
      sale: "Anonymous user sale session, gift search leading to purchase",
      saleLoyal: "Logged-in user sale session, returning customer purchase",
      supportSuccess: "Support session, policy question resolved successfully",
      supportFailed: "Support session, request not completed",
    },
    successful: "Successful",
    unresolved: "Unresolved",
    anonymousCustomer: "Anonymous Customer",
    customer: "Customer",
    vip: "VIP",
    /** Demo transcripts stay in English: they caption English session audio. */
    transcriptNote: "Recorded session, original language",
  },

  setup: {
    badge: "Plug and Play",
    title: "One-Click Setup, Instant Selling & Support",
    lead: "Install the Bizmis Shopify app and start selling and supporting customers immediately.",
    storeDataTitle: "Your Shopify Store Data",
    dataCards: [
      { title: "Store Website", description: "Vision, mission and core values" },
      {
        title: "Products Catalog",
        description: "Collections, inventory, purchase orders",
      },
      { title: "Discounts", description: "All current promotions" },
      { title: "Policies", description: "Shipping, returns, and store policies" },
      { title: "Customers", description: "Customer sales and support records" },
      { title: "Orders", description: "Customer order history" },
    ],
    badges: {
      oneClick: "One-click setup",
      alwaysSynced: "Always synced",
      readyInMinutes: "Ready in minutes",
    },
    ctaNote: "Start selling and supporting customers now.",
  },

  customization: {
    badge: "Personalization",
    titleLead: "Make It",
    titleHighlight: "Truly Yours",
    lead: "Build authentic relationships that drive customer loyalty through personalized voice and appearance customization.",
    avatar: {
      title: "Personal Avatar",
      body: "Creating genuine connections by making your sales representative sound and look like you.",
    },
    voiceCloning: {
      title: "Voice Cloning",
      body: "Authentic customer interactions through replication of your unique speaking style and personality.",
    },
    imageAlt: "Personalization hub, voice and appearance customization",
  },

  finalCta: {
    title: "Install on Shopify in 1 click. Start selling today.",
    lead: "Bizmis greets visitors, answers their questions, and guides them to checkout, fully synced with your Shopify products, discounts, and orders.",
    bullets: [
      "Greets and qualifies shoppers",
      "Compares products & recommends",
      "Handles support and reduces tickets",
    ],
    installAria: "Install Bizmis on Shopify",
    bookCallAria: "Book a call with the Bizmis team",
    cancelAnytime: "Cancel anytime",
    gdprReady: "GDPR-ready",
    builtForShopify: "Built for Shopify",
  },

  earlyAccessCard: {
    badge: "Early Access",
    titleLead: "Be First.",
    titleHighlight: "Sell More.",
    lead: "Join the exclusive group of first 50 merchants shaping the future of conversational commerce.",
    perks: [
      {
        title: "50% Off First 3 Months",
        caption: "Lock in our lowest launch pricing.",
      },
      {
        title: "Direct Roadmap Influence",
        caption: "Your feature requests get priority status.",
      },
      {
        title: "VIP Onboarding",
        caption: "Personal setup & onboarding session included.",
      },
    ],
    limitedSpots: "Limited spots available",
    cta: "Claim Early Access Offer",
  },

  footer: {
    tagline:
      "Your store's best salesperson, working 24/7 to boost sales, provide support, and understand your customers.",
    builtFor: "Built for",
    columns: {
      product: "Product",
      support: "Support",
      legal: "Legal",
    },
    links: {
      features: "Features",
      pricing: "Pricing",
      demo: "Demo",
      contact: "Contact",
      bookACall: "Book a call",
      faqs: "FAQs",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
    },
    /** Legal texts are published in English only. */
    legalNotice: "Legal pages are available in English.",
    copyright: (year: number) => `© ${year} Bizmis. All rights reserved.`,
  },

  pricing: {
    badge: "Pricing",
    title: "Simple, Transparent Pricing",
    lead: "Choose the plan that fits your business. All plans include full Shopify integration.",
    monthly: "Monthly",
    yearly: "Yearly",
    billedYearly: "billed yearly",
    perMonth: "/mo",
    popular: "Popular",
    creditsIncluded: "credits included",
    shopperSessionsPerMonth: "shopper sessions/mo",
    sessionEstimatesAria: (plan: string) =>
      `Estimated shopper sessions for ${plan}`,
    perCredit: "/credit",
    beyondIncluded: "beyond included",
    concurrentConversations: "concurrent voice conversations",
    concurrencyTooltip:
      "Voice-only limit. Text concurrency is effectively unlimited.",
    off: "off",
    discountTitle: (percent: number) => `${percent}% off vs. list price`,
    introPeriodTitle: "Discounted intro period",
    introMonths: (months: number, standardPrice: string) =>
      `first ${months} ${months === 1 ? "month" : "months"}, then $${standardPrice}/mo`,
    free: {
      name: "Free",
      noCommitment: "No commitment",
      description: (credits: string, voiceMinutes: string) =>
        `Run Bizmis live in your store up to a one-time ${credits} credits (~${voiceMinutes} voice minutes or ~${credits} text messages). Nothing renews, upgrade for ongoing monthly capacity.`,
      creditsLabel: (credits: string) => `${credits} credits`,
      cta: "Start free",
    },
    plans: {
      starter: {
        name: "Starter",
        features: ["1 Bizmis Store Clerk", "Support: Email (48h)"],
      },
      plus: {
        name: "Plus",
        features: [
          "Up to 5 Bizmis Store Clerks",
          "Session history and replays",
          "Avatar customization",
          "Support: Email (24h) and scheduled calls",
        ],
      },
      pro: {
        name: "Pro",
        features: [
          "Lowest overage rate",
          "Unlimited Bizmis Store Clerks",
          "Auto-tagged conversations",
          "Priority support and live onboarding",
        ],
      },
    },
    enterprise: {
      name: "Enterprise",
      price: "Custom",
      description:
        "Tailored solutions for large-scale operations with custom volume and requirements.",
      everythingInPro: "Everything in Pro plus:",
      features: [
        "Custom credits, concurrency & pricing",
        "Support: Dedicated CSM, 99.9%+ SLA",
      ],
    },
    conversions: {
      voice: "1 voice minute = 10 credits",
      text: "1 text message = 1 credit",
    },
    sessionFootnote:
      "Session estimates vary by voice/text mix and session length.",
    upgradeNote: {
      highlight: "Upgrade to yearly within 90 days",
      body: "and we'll credit what you already paid toward your yearly plan (commitment charges only).",
      learnMore: "Learn more",
      hideDetails: "Hide details",
      details:
        "Credit applies to commitment charges only. On-demand usage charges (overage credits) are excluded from the credit.",
    },
    guarantees: {
      spendLimit: "You choose your spend limit",
      cancelAnytime: "Cancel anytime",
      moneyBack: "30-day money-back guarantee (yearly plans)",
    },
    coupon: {
      prompt:
        "Have a discount code? Enter it and press Enter or Apply to update the prices above.",
      placeholder: "Discount code",
      inputAria: "Discount coupon code",
      apply: "Apply",
      applying: "Applying…",
      remove: "Remove coupon",
      active: (label: string) => `${label} active`,
      viewingPricing: (label: string, cap: number) =>
        `You're viewing ${label} pricing, reserved for our first ${cap} merchants only.`,
      shapeProduct:
        "Help shape the product with your feedback on the roadmap. Your plan prices above include",
      monthlyDiscount: (percent: number, months: number) =>
        months > 0
          ? `${percent}% off your first ${months} ${months === 1 ? "month" : "months"}`
          : `${percent}% off`,
      onMonthlyBilling: "on monthly billing, or",
      yearlyDiscount: (percent: number) => `${percent}% off yearly`,
      whenYearlySelected: "when yearly is selected.",
      errors: {
        empty: "Enter a code first.",
        notFound: "That code isn't valid.",
        expired: "That code has expired.",
        notYetActive: "That code isn't active yet.",
        invalidFormat: "Code format looks off, check for typos.",
        alreadyClaimed: "That code has already been claimed.",
        invalidToken: "Session expired. Please try again.",
        generic: "Couldn't verify the code right now. Please try again.",
      },
    },
    viewAllFaqs: "View all frequently asked questions",
    enterpriseInquirySubject: "Enterprise Plan Inquiry",
  },

  faqsPage: {
    title: "Everything you need to know about Bizmis",
    lead: "Find answers to the most common questions about our Shopify sales assistant",
    searchPlaceholder: "Search FAQs...",
    searchAria: "Search FAQs",
    allQuestions: "All Questions",
    noResults: "No FAQs found matching your search.",
    stillHaveQuestions: "Still have questions?",
    teamIsHere: "Our team is here to help you get the most out of Bizmis.",
  },

  faqs: {
    categories: {
      "getting-started": "Getting Started",
      "what-bizmis-does": "What Bizmis Does",
      "pricing-billing": "Pricing & Billing",
      customization: "Customization",
      "privacy-data": "Privacy & Data",
      "shopify-integration": "Shopify Integration",
    },
    items: {
      "what-is-bizmis": {
        question: "What is Bizmis?",
        answer:
          "Bizmis is a voice-first AI store clerk for Shopify. It greets shoppers, answers questions about products, orders, returns, and policies, and guides them toward checkout, the way a knowledgeable in-store clerk would. It runs 24/7 inside your storefront as a small voice widget.",
      },
      "is-chatbot": {
        question: "Is Bizmis a chatbot?",
        answer:
          "No. Bizmis is voice-first, not text-first. Shoppers speak, Bizmis speaks back, and the conversation flows like a real exchange with a store clerk, not a scripted chat tree. The on-screen widget shows a transcript so they can see what's been said, but the primary interaction is voice.",
      },
      "how-fast-start": {
        question: "How fast can I get started?",
        answer:
          "One click to install from the Shopify App Store. Bizmis auto-syncs your products, collections, policies, and FAQs from your store. No manual configuration, no model training, no engineering required. Most stores are live within minutes.",
      },
      "when-see-value": {
        question: "When will I start seeing value?",
        answer:
          "From the first conversation. Bizmis goes live the moment install completes and starts helping shoppers immediately.",
      },
      "what-it-does": {
        question: "What does Bizmis actually do?",
        answer:
          "Three things. **Sales:** greets shoppers, qualifies intent, recommends products, and walks them to checkout. **Support:** handles order status, shipping, returns, policies, and FAQs around the clock. **Insights:** session replays, auto-tagged journeys, and funnel analytics so you can see what shoppers actually ask, want, and abandon over.",
      },
      "place-orders": {
        question: "Does Bizmis place orders or take payments?",
        answer:
          "No. Checkout, payment, refunds, and order modifications stay with Shopify and your existing flows. Bizmis surfaces information and guides decisions; it never completes a transaction or modifies an order on the shopper's behalf.",
      },
      "cart-management": {
        question: "Does Bizmis manage carts or recover abandoned carts?",
        answer:
          "Not currently. Cart management is intentionally disabled while we tune the explicit voice-confirmation pattern needed for write actions. Bizmis can recommend products and walk shoppers toward checkout, but it won't add, remove, or modify cart items on their behalf. This may change in a future release.",
      },
      "feels-human": {
        question: "Will the assistant feel human?",
        answer:
          "Yes. Tone, pacing, expression, and warmth are designed to feel like a real clerk, not a robotic voice. Shoppers know they're talking to AI, Bizmis says so up front, per the EU AI Act, but the experience is conversational, not transactional.",
      },
      "insights-analytics": {
        question: "What insights do I get?",
        answer:
          "A dashboard with session replays, conversation transcripts, auto-tagged conversation themes (Sales / Support / Unknown), outcomes (Answered / Escalated / Unresolved), and funnel events (e.g. products shown, products discussed, intent to buy). You see what shoppers actually want, where they hesitate, and what your storefront isn't answering well.",
      },
      "review-conversations": {
        question: "Can I review past conversations?",
        answer:
          "Yes. Session history and replays are available on Plus and above. You can scrub through any conversation, see the transcript, and tag patterns to refine your sales and support rules.",
      },
      "how-much-cost": {
        question: "How much does Bizmis cost?",
        answer:
          "Three plans plus Enterprise. **Starter** ($149/mo, 2,500 credits) for solo or small stores. **Plus** ($499/mo, 9,000 credits) for growing stores, most popular. **Pro** ($1,499/mo, 30,000 credits) for high-volume stores. **Enterprise** for custom volume and SLAs. Credits cover both voice and text interactions (1 voice min = 10 credits, 1 text msg = 1 credit). Yearly billing saves ~20%.",
      },
      "credit-model": {
        question: "How does the credit model work?",
        answer:
          "Each plan includes a credit pool (Starter 2,500 / Plus 9,000 / Pro 30,000) that resets every billing period. Credits cover both voice and text: 1 voice minute = 10 credits, 1 text message = 1 credit. Usage beyond the pool is billed at your plan's overage rate ($0.06 / $0.055 / $0.05 per credit). You set a hard spend cap inside the Bizmis admin, once hit, usage pauses until the next period or until you raise the cap. Unused credits don't roll over.",
      },
      "yearly-billing": {
        question: "How does yearly billing work?",
        answer:
          "Yearly billing is paid upfront and gives you ~20% off the monthly price. Included credits still reset every month. Yearly plans don't include overage, once your monthly credit pool is exhausted, usage pauses until next month.",
      },
      "early-access-offer": {
        question: "What is the Early Access offer?",
        answer:
          "Early Access gives invited Shopify stores the Free plan's one-time **1,200 credits** (~120 voice minutes or ~1,200 text messages). There is no subscription, usage charge, automatic upgrade, or renewal. When the credits run out, Bizmis pauses unless you choose and approve a paid plan in Shopify. Members also get 1-to-1 onboarding, priority support, prioritized product feedback, and a personal discount if they later upgrade.",
      },
      "free-plan": {
        question: "Is there a free plan?",
        answer:
          "Yes. The **Free plan** runs Bizmis live in your store up to a one-time **1,200 credits** (~120 voice minutes or ~1,200 text messages). No subscription, no commitment, and nothing renews. It's a real test with real shoppers. When you're ready for ongoing capacity, upgrade to a paid plan. Every Bizmis charge runs through Shopify on the account you already use, so you never add a separate card for Bizmis, and the Free plan has nothing to charge.",
      },
      "billing-payment-method": {
        question: "How does payment work? Do I need to add a card?",
        answer:
          "All Bizmis billing runs through Shopify's Billing API on the same account you already use to run your store. You approve Bizmis charges directly inside Shopify, and everything (your plan plus any overage) lands on your regular Shopify invoice alongside your other app charges. You never enter a separate credit card into Bizmis. Paid usage is still billed, it's just collected by Shopify rather than by us. The Free plan has nothing to charge, so there's nothing to approve until you decide to upgrade.",
      },
      "upgrade-plan": {
        question: "What happens when I upgrade my plan?",
        answer:
          "Upgrades take effect immediately. You're charged the prorated difference for the rest of the current period; usage counters and billing date stay the same. New entitlements unlock right away.",
      },
      "downgrade-plan": {
        question: "What happens when I downgrade my plan?",
        answer:
          "Downgrades take effect at the next renewal, you keep your current plan and entitlements until then. No usage counter resets, no proration.",
      },
      "monthly-to-yearly": {
        question: "Can I switch from monthly to yearly?",
        answer:
          "Yes. Switch within your first 90 days and we'll credit the monthly commitment fees you've already paid toward your yearly plan. Credit applies to commitment fees only, overage usage isn't credited.",
      },
      "cancel-anytime": {
        question: "Can I cancel anytime?",
        answer:
          "Yes, from the Bizmis admin or by uninstalling the app. Cancellation is immediate, the voice widget stops serving shoppers as soon as it's confirmed.",
      },
      "refund-policy": {
        question: "What's your refund policy?",
        answer:
          "**Yearly plans:** 30-day money-back guarantee on the initial yearly charge, cancel within 30 days of your first yearly payment and we'll refund the commitment fee, no questions asked. The guarantee doesn't cover renewal years or overage usage.\n**Monthly plans:** charges already billed for the current period are non-refundable, but you won't be billed again. Unused credits don't carry over.",
      },
      "personalize-voice-avatar": {
        question: "Can I personalize the voice and the avatar?",
        answer:
          "Yes. Choose from a curated set of natural-sounding voices across 25+ languages, or pick from four avatar characters (Plus and above). You can also configure greeting, tone, and behavior to match your brand.",
      },
      "multi-language": {
        question: "Does Bizmis speak multiple languages?",
        answer:
          "Yes. Bizmis auto-detects the shopper's language and replies in the same one, 25+ languages supported, on every plan. No per-language configuration needed.",
      },
      "customize-content": {
        question: "Can I customize what Bizmis says about my products?",
        answer:
          "Yes. Configure **Sales rules** (how Bizmis recommends, compares, upsells), **Support rules** (escalation triggers, refusal patterns), and a **Knowledge base** (FAQs, store policies, product notes that aren't on your product pages) directly from the embedded admin.",
      },
      "multiple-clerks": {
        question: "How many Bizmis Store Clerks can I run?",
        answer:
          "One on Starter, up to five on Plus, unlimited on Pro and Enterprise. Each clerk can have its own voice, avatar, and rule set, useful if you sell across distinct collections or markets.",
      },
      "data-collected": {
        question: "What data does Bizmis collect?",
        answer:
          "From shoppers: voice audio, conversation transcripts, browsing activity during the session, and language preference. Email is collected only if the shopper is signed in to your Shopify storefront. From merchants: store details, configuration preferences, and Shopify access tokens used to operate the app.",
      },
      "train-on-data": {
        question: "Do you train AI models on shopper data?",
        answer:
          "**No.** Shopper voice recordings and conversation transcripts are never used to train any AI model, ours or our sub-processors'. AWS Bedrock customer data isn't used for model training by default; Anthropic doesn't train its foundation models on API or Bedrock customer data; and our ElevenLabs integration is configured so conversation audio isn't used to improve their models.",
      },
      "sub-processors": {
        question: "Who are your sub-processors?",
        answer:
          "**ElevenLabs** for speech-to-text, text-to-speech, and orchestration of the voice agent. **Anthropic** (Claude family) for response generation, via ElevenLabs and via AWS Bedrock for backend tasks. **Amazon Web Services** for hosting, storage, and Bedrock model inference. **Shopify** for store and customer context. Full retention windows and processing regions are in our Privacy Policy.",
      },
      "gdpr-compliant": {
        question: "Is Bizmis GDPR-compliant?",
        answer:
          "Yes. Bizmis acts as a data processor on the merchant's behalf for shopper data; Section 12 of our Terms is an inline GDPR Article 28 DPA. Shoppers retain GDPR/CPRA data rights: access, correction, deletion, restriction, portability. We honor Shopify's mandatory compliance webhooks and respond to direct requests at hello@bizmis.ai. EU Standard Contractual Clauses are available on request.",
      },
      "data-retention": {
        question: "How long do you keep conversation data?",
        answer:
          "Session metadata is auto-deleted after 60 minutes of inactivity. Conversation recordings and transcripts are retained while your installation is active. After uninstall, data is held during Shopify's 48-hour reinstall window, then deleted within 30 days of the shop/redact webhook. Individual conversations can be deleted on demand at any time.",
      },
      "shopify-only": {
        question: "Does Bizmis only work with Shopify?",
        answer:
          "Yes. Bizmis is purpose-built for Shopify and uses Shopify APIs for product, customer, order, and policy data. No plans to support other platforms in the near term.",
      },
      "what-syncs": {
        question: "What does Bizmis sync from my store?",
        answer:
          "Products and collections, prices and discounts, customer records (when signed in), order history, and store policies (shipping, returns, FAQ). Sync is automatic and continuous, when you update a product, Bizmis sees it.",
      },
      "private-testing": {
        question: "Can I test Bizmis without showing it to shoppers?",
        answer:
          "Yes. Bizmis stays hidden until an admin activates its theme app embed. To test real responses privately, duplicate your live theme, activate Bizmis only on the unpublished copy, and open it with Shopify's theme preview. It will use your real catalog and policies while your live store stays unchanged. The Pause switch in the Bizmis dashboard hides it immediately at any time.",
      },
      permissions: {
        question: "What permissions does Bizmis request?",
        answer:
          "Bizmis reads products, customers, orders, and store policies to handle sales and support questions. Its legal-policy access is read-only, so it cannot edit your policies. The only write access is Shopify Files, used only when you choose to upload an image, such as your logo, for the avatar's shirt. Bizmis does not modify existing files.",
      },
      uninstall: {
        question: "What happens when I uninstall?",
        answer:
          "The widget stops immediately, Shopify removes the theme app extension, and Shopify revokes Bizmis's access tokens. We keep configuration and conversation data during Shopify's 48-hour reinstall window so your account can be restored if you reinstall. Shopify then triggers deletion, and we delete that data within 30 days. An avatar image you uploaded remains in your own Shopify Files and can be deleted there.",
      },
    },
  },

  contact: {
    title: "Get in Touch",
    lead: "Have questions about Bizmis? We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
    successTitle: "Message Sent!",
    successBody:
      "Thank you for reaching out. We'll get back to you as soon as possible.",
    sendAnother: "Send Another Message",
    errorBody: "Failed to send message. Please try again or email us directly at",
    nameLabel: "Your Name",
    namePlaceholder: "John Doe",
    emailLabel: "Email Address",
    emailPlaceholder: "john@example.com",
    subjectLabel: "Subject",
    subjectPlaceholder: "How can we help you?",
    messageLabel: "Message",
    messagePlaceholder: "Tell us more about your question or feedback...",
    sending: "Sending...",
    send: "Send Message",
    orEmailUs: "Or email us directly at",
  },

  earlyAccessPage: {
    badge: (cap: number) => `First ${cap} stores only`,
    titleLine1: "Join the Early Access",
    titleLine2: "program",
    lead: (cap: number) =>
      `Only ${cap} Shopify stores can join. Install Bizmis free while Early Access is open, and keep your member benefits when you upgrade.`,
    seeLiveDemo: "See the live demo",
    bookFounderCall: "Book a 30-min call with the founder",
    avatarAlt: "Bizmis Early Access invitation",
    benefitsBadge: "Early Access benefits",
    benefitsTitle: "You'll get",
    benefitsLead:
      "Hover each card to see what's included with your Early Access benefits.",
    benefits: [
      {
        title: "Free as a member*",
        detail:
          "Claim Early Access in the app and use 1,200 live credits at no cost. No subscription, no commitment.",
      },
      {
        title: "Shape the roadmap",
        detail:
          "Your feedback gets priority. The questions your shoppers ask help decide the next features, fixes, and product decisions.",
      },
      {
        title: "Priority support",
        detail:
          "Get a direct line to the founder for setup questions, configuration guidance, and priority help as an Early Access member.",
      },
      {
        title: "Exclusive discounts",
        detail:
          "Your Early Access code unlocks discounted monthly intro pricing and discounted yearly pricing when you upgrade.",
      },
    ],
    ctaTitle: "Choose your way in",
    fastestPath: "Fastest path",
    installCardBody: "Claim Early Access directly from the Shopify app.",
    wantHelp: "Want help?",
    bookCallTitle: "Book a founder call",
    bookCallBody: "Get a 30-minute guided walkthrough before you install.",
    seeDemoFirst: "See the live demo first",
    founderLed: "Built founder-led. Questions?",
    footnote:
      "*Free for Early Access members = a one-time 1,200 credits of live usage (~120 voice minutes), no renewal.",
  },

  unsubscribe: {
    confirmTitle: "Unsubscribe from Bizmis emails?",
    confirmBody:
      "You will no longer receive early access invites or other outreach emails from Bizmis.",
    confirmButton: "Confirm Unsubscribe",
    processing: "Processing your request...",
    successTitle: "You've been unsubscribed",
    successBody:
      "You won't receive any more emails from us. If this was a mistake, just reply to any previous email or reach out at",
    errorTitle: "Something went wrong",
    invalidLink:
      "This unsubscribe link is invalid. If you reached this page from an email, please contact hello@bizmis.ai.",
    genericError: "Something went wrong. Please try again.",
    networkError:
      "Could not reach the server. Please try again or email hello@bizmis.ai.",
    tryAgain: "Try Again",
    questions: "Questions?",
  },

  notFound: {
    title: "404",
    message: "Oops! Page not found",
    backHome: "Return to Home",
  },

  seo: {
    home: {
      title: "Bizmis — Voice-First Sales Clerk for Shopify",
      description:
        "Bizmis welcomes shoppers, answers questions, and guides them to buy, like a great in-store associate, 24/7 inside your Shopify store.",
      jsonLdDescription:
        "Voice-first store clerk for Shopify that welcomes shoppers, answers questions, and guides them to buy.",
    },
    pricing: {
      title: "Bizmis Pricing — Plans for Shopify Stores",
      description:
        "Simple Bizmis pricing for Shopify stores of any size. Pick a plan, install in one click, and start selling with a voice-first store clerk.",
    },
    faqs: {
      title: "Bizmis FAQs — Setup, Pricing, Data, and Behavior",
      description:
        "Answers to common questions about Bizmis: how it works on Shopify, setup time, data handling, voice behavior, pricing, and more.",
    },
    contact: {
      title: "Contact Bizmis — Get in Touch",
      description:
        "Reach the Bizmis team about Shopify install, custom website integrations, partnerships, or anything else. We reply fast.",
    },
    earlyAccess: {
      title: "Bizmis Early Access — free for the first 50 Shopify stores",
      description:
        "Become a Bizmis Early Access member: install free, get a direct line to the founder, shape the roadmap, and keep member discounts when you upgrade. First 50 Shopify stores only.",
    },
  },
};

export type Messages = typeof en;
