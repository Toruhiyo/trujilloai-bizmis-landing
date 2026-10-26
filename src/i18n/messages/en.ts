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
    /** The hero agent's lines: a hello, what it does, then (pointing at play) the invite. */
    agentHello: "Hi! I'm your Bizmis sales agent.",
    agentPitch: "I match every shopper's needs, clear their doubts and win you the sale.",
    agentInvite: "Press play and watch me sell!",
  },

  film: {
    watch: "Watch the film",
    replay: "Replay",
    play: "Play",
    pause: "Pause",
    mute: "Mute",
    unmute: "Unmute",
    enterFullscreen: "Full screen",
    exitFullscreen: "Exit full screen",
    seek: "Seek",
    region: "Bizmis film",
    quality: "Quality",
    auto: "Auto",
    close: "Close the film",
  },

  /** The film-led landing (/v2): copy it adds to the classic landing's messages. */
  landing: {
    /** The hero's line under the title (the classic keeps hero.subtitle*): the last part is the merchant's win, highlighted. */
    heroLine: ["Match needs.", "Clear doubts.", "Win sales."],
    /** Under the hero's Install button (the classic landing keeps hero.installSubline). */
    installSubline: "One-click install, ready right away",
    switch: {
      chatbot: "Chatbot",
      agent: "Sales agent",
      toggleAria: "Compare a typical chatbot with the Bizmis sales agent",
      chatbotMessage: "Hi! How can I help you today?",
      chatbotReply: "Here are some links that might help.",
      agentMessage: "Looking for a gift? Tell me who it's for and I'll find the right one.",
      /** What the shopper does: with a chatbot, then with the Bizmis sales agent. */
      shopper: "Your shopper",
      chatbotOutcome: ["Can't find it", "Doubts it", "Leaves"],
      agentOutcome: ["Finds it", "Trusts it", "Buys it"],
      /** The shopper's patience while using the chatbot: it drains with every reply. */
      patience: {
        label: "Shopper patience",
        reading: "+{s} s of reading",
        stages: ["Reading a wall of text…", "Skimming. Still no answer.", "Opening a competitor's tab…", "Typing \"talk to a human\"…", "Gone."],
        leftTitle: "The shopper left.",
        leftBody: "Sale lost. Nobody noticed.",
        cta: "Try the sales agent",
      },
      /** The typical chatbot, interactive: verbose, dull, useless to sell. */
      bot: {
        title: "Chatbot",
        hint: "Go on, ask it something",
        placeholder: "Type your message...",
        send: "Send",
        open: "Open chat",
        close: "Close chat",
        greeting: "Hi there! 👋 I'm your virtual assistant. How can I help you today? Please choose one of the options below or type your question.",
        chips: ["Track order", "Returns", "Contact us"],
        helpful: "Was this helpful?",
        product: "Thanks for your message! This product is part of our bestselling collection and makes a great choice for many occasions. Full details, including materials, dimensions and care instructions, can be found in the product description. Please note that delivery times may vary depending on your location and the shipping method selected at checkout. For information about exchanges and refunds, please refer to our Returns Policy page. Our support team usually replies within 2–3 business days. Is there anything else I can help you with today?",
        productLinks: ["Returns Policy", "Shipping Information"],
        track: "To track your order, please enter your order number and the email address you used at checkout on our Order Tracking page. Your order number starts with # and can be found in your confirmation email. Please allow 24–48 hours for tracking information to update after your order has shipped. If you have not received a confirmation email, please check your spam or junk folder.",
        trackLinks: ["Order Tracking"],
        returns: "We accept returns within 30 days of delivery, provided items are unused, unwashed and in their original packaging with all tags attached. Sale items, gift cards and personalised products are final sale. To start a return, please visit our Returns Portal. Refunds are issued to the original payment method within 5–10 business days after we receive and inspect your return. Return shipping costs are non-refundable.",
        returnsLinks: ["Returns Portal"],
        contact: "Our customer support team is available Monday to Friday, 9 am – 5 pm (EST), excluding public holidays. Please email us and include your order number in the subject line. We aim to respond to all enquiries within 2–3 business days. Thank you for your patience!",
        contactLinks: ["Contact form"],
        human: "I'm sorry, no agents are available right now. Please leave your email address and a member of our team will get back to you within 2–3 business days.",
        confused: "I'm sorry, I didn't quite understand that. Could you please rephrase your question? You can also choose one of the options below.",
        thanks: "Thanks for your feedback! We're always working to improve our service.",
      },
    },
    /** The film's end-card scarcity line. */
    onlySpots: "Only 50 spots!",
    /** The personalization carousel. */
    carousel: { label: "Choose an avatar", prev: "Previous avatar", next: "Next avatar" },
    yourStore: "Your store",
    agentAlt: "The Bizmis sales agent avatar",
    /** UI text of the real widget, as it appears in the mockups. */
    widget: {
      placeholder: "Help me find the right product.",
      takingYouTo: "Taking you to",
      addingToCart: "Adding to cart",
      searchResults: "Search results",
      cartItem: "Sphere",
    },
    /** Boost Sales on /v2: the title stays on screen while each sub-benefit lights up its part (find it / trust it / buy it). */
    sales: {
      titleLead: "",
      titleParts: ["Match needs.", "Clear doubts.", "Win sales."],
      /** Each part's stage of the sales funnel (the kicker over its words). */
      stages: ["Discovery", "Decision", "Checkout"],
      /** One per title part: a short merchant-side benefit and one line. */
      panels: [
        { title: "More shoppers find a fit", body: "It narrows your whole catalog to the few that fit." },
        { title: "Doubts turn into decisions", body: "It compares, advises and answers every doubt." },
        { title: "Carts turn into orders", body: "It clears last-minute questions and walks them to checkout." },
      ],
      /** The words over the payoff, every part lit. */
      payoff: { kicker: "All together", title: "More sales from the same visits.", body: "No fatigue. No paralysis. No hesitation." },
      /** The mockups: what the shopper says, then what the agent says (captions). */
      findQuery: "A gift for my sister, under $50",
      findCaption: "Here are three she will love.",
      compareQuery: "Which one should I get?",
      compareCaption: "This one. It is the lightest and the best reviewed.",
      bestMatch: "Best match",
      decided: "Added to cart",
      buyQuery: "Will it arrive by Friday?",
      buyCaption: "Yes, it ships today and returns are free. Ready to check out?",
      /** Each beat's words: the merchant's loss, struck through at the fix, then the win written in. No figures.
       * [[…]] marks each sentence's core (what hurts in the loss, what pays in the win): one per sentence,
       * highlighted by the headline swaps (?beat=5a..5e); keep the marks around the equivalent words when translating. */
      flip: [
        { problem: "Visitors browsing your catalog [[tire out and give up]].", fix: "Visitors browsing your catalog [[find products worth buying, fast]]." },
        { problem: "Shoppers comparing options [[freeze and walk away]].", fix: "Shoppers comparing options [[choose with confidence]]." },
        { problem: "Buyers ready to buy [[hesitate and hold off]].", fix: "Buyers ready to buy [[commit and check out]]." },
      ],
      /** ?beat=1..6: the small labels of the alternative loss → win looks. */
      flipLabels: { lose: "You lose", win: "You win", you: "You, today", withBizmis: "With Bizmis" },
      /** ?beat=4: each loss as the merchant says it (the speech bubble). */
      flipQuote: [
        "Shoppers give up searching my catalog, then buy the same products from a competitor.",
        "My hesitant shoppers leave to compare, and become someone else's customers.",
        "Shoppers get to checkout, hit one last doubt, and walk away.",
      ],
      /** The one-shopper variant (?case=one): the same shopper and gift from Find through Trust to Buy. */
      caseOne: {
        compareQuery: "Which of the three would she like best?",
        compareCaption: "This one. It is the best reviewed of the three.",
        buyQuery: "Will it arrive before her birthday on Friday?",
        buyCaption: "Yes, it ships today and returns are free. Ready to check out?",
      },
      /** The store's cart in the Buy it mockup. */
      cart: { title: "Your cart", subtotal: "Subtotal", checkout: "Checkout", perks: ["Ships today", "Free returns"], placed: "Order placed" },
      /** The at-scale funnel beside each moment: the whole store's shoppers, one funnel fixed stage by stage (illustrative, no figures). */
      funnel: {
        /** Each stage's status, as the film's pills: the problem (grey), then fixed by Bizmis (orange check). */
        problems: ["Give up looking", "Leave to compare", "Abandon the cart"],
        solutions: ["Find it fast", "Decide here", "Buy it"],
        /** The word at the open mouth, with its arrow: the dots are store visits. */
        visits: "visits",
      },
      /** ?win=4..6: the metrics merchants know, drawn moving the right way as stages get fixed (no figures). */
      metrics: {
        conversion: "Conversion rate",
        orders: "Orders",
        abandoned: "Abandoned carts",
        ordersToday: "Orders today",
        before: "before",
        after: "after",
      },
      /** The store's currency in the mockups' prices (an ISO code for Intl). */
      pulse: { currency: "USD" },
    },
    /** Customer Support on /v2: a short promise, questions answered live by voice, and three capabilities. */
    support: {
      title: "Fewer tickets.",
      titleTail: "Happier customers.",
      /** The area's full name, the chapter eyebrow over the outcome (the pillar openers, ?open=1..6). */
      area: "Customer Support",
      lead: "Answers in seconds, day or night, as warmly as your best clerk.",
      capabilities: [
        { title: "Always on", body: "Every question gets answered the moment it's asked." },
        { title: "Knows your store", body: "It answers from your own policies and catalog." },
        { title: "Reads the mood", body: "It calms upset shoppers before they leave a bad review." },
      ],
      /** The pillar's animation: shoppers' questions answered live, by voice (one heads for the support email and never gets there). */
      live: {
        label: "Shoppers ask, Bizmis answers out loud",
        questions: ["Where's my order?", "Does it run small?", "Can I return it?", "Ships to Canada?"],
        email: "Support email",
        done: "Answered on the spot",
      },
    },
    /** Store Insights on /v2: a short promise, noise that turns into a chart, and three features. */
    insights: {
      title: "See what sells.",
      titleTail: "Fix what doesn't.",
      /** The area's full name, the chapter eyebrow over the outcome (the pillar openers, ?open=1..6). */
      area: "Store Insights",
      lead: "Every conversation becomes a clear next step.",
      features: [
        { title: "Session replays", body: "Hear the exact moment a shopper hesitated." },
        { title: "Auto-tagged chats", body: "Questions group themselves, so one fix stops many tickets." },
        { title: "Funnel insights", body: "See which fixes pay off first." },
      ],
      /** The pillar's animation: scattered questions that sort into a rising chart. */
      clarity: {
        snippets: ["Ships to Canada?", "Size M or L?", "Returns?", "Gift wrap?"],
        topAsk: "Top ask: shipping",
      },
    },
    /** Boost Sales's area, the chapter eyebrow over its outcome (its outcome is already "Boost Sales"). */
    salesArea: "Sales",
    /** Personalization on /v2. */
    customize: {
      lead: "Pick its look and put your logo on its shirt.",
      avatar: { title: "Your avatar", body: "Choose a face that fits your brand." },
      voice: { title: "Your voice", body: "Clone yours so it sounds like you." },
    },
    /** The closing card, as the film's: the title is the install button, then the handwritten invite and, apart, the note. */
    endCard: {
      install: "Install now",
      invite: "for Early Access benefits!",
      note: "Only 50 spots!",
      /** The ad-1 film's Early Access perks, then the quieter extras under them. */
      perks: ["120 free sessions", "50% off upgrades", "Shape the roadmap"],
      extras: ["No card needed", "No commitment", "A direct line to the founder"],
    },
    /** Setup on /v2: the title alone, a plain line under it, and the opening's install button states. */
    setup: {
      title: "One-Click Setup",
      lead: "One click and your agent's selling right away. Change anything in your store and it already knows.",
      install: "Install",
      syncing: "Syncing your store",
      synced: "Synced",
      readyNow: "Ready right away",
    },
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
    conversationsPerMonth: "sessions / month",
    extraConversations: (price: string) =>
      `Extra sessions ${price} each, up to the spend cap you set`,
    conversationDefinition:
      "A session is one shopper's visit with your clerk, by voice or text. Sessions longer than 5 minutes of voice or 40 messages count as two. Visits where the shopper says nothing are free.",
    off: "off",
    discountTitle: (percent: number) => `${percent}% off vs. list price`,
    introPeriodTitle: "Discounted intro period",
    introMonths: (months: number, standardPrice: string) =>
      `first ${months} ${months === 1 ? "month" : "months"}, then $${standardPrice}/mo`,
    free: {
      name: "Free",
      noCommitment: "No commitment",
      description: (conversations: string) =>
        `${conversations} free sessions to try Bizmis. No card needed.`,
      cta: "Start free",
    },
    plans: {
      starter: {
        name: "Starter",
        features: [
          "1 Bizmis Store Clerk",
          "Voice and text",
          "Support: Email (48h)",
        ],
      },
      growth: {
        name: "Growth",
        features: [
          "Up to 5 Bizmis Store Clerks",
          "History, transcripts and replays",
          "Avatar customization",
          "Support: Email (24h) and scheduled call",
        ],
      },
      scale: {
        name: "Scale",
        features: [
          "Unlimited Bizmis Store Clerks",
          "Auto-tagged sessions",
          "Priority support and live onboarding",
        ],
      },
    },
    enterprise: {
      name: "Enterprise",
      priceFrom: "From",
      description:
        "Tailored solutions for large-scale operations with custom volume and requirements.",
      everythingInScale: "Everything in Scale, plus:",
      features: [
        "Custom session volume",
        "Guaranteed capacity for traffic peaks",
        "SLA and custom voice",
        "Invoicing outside Shopify",
      ],
    },
    guarantees: {
      spendLimit: "You choose your spend limit",
      cancelAnytime: "Cancel anytime",
      moneyBack: "30-day money-back guarantee",
      cardNote: "30-day money-back guarantee",
      bannerTitle: "Try it risk-free for 30 days",
      bannerBody: "If Bizmis isn't worth it in your first 30 days, cancel and we refund your first month in full. No questions asked.",
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
      discountEnd: ".",
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
          "Yes for the cart. Once the shopper says yes, Bizmis adds items to your store's own cart, and the cart count updates right away. It flags out-of-stock options, offers an alternative, and can take the shopper to the cart or checkout. It doesn't send abandoned-cart emails, but it picks up the conversation where it left off as the shopper moves between pages.",
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
          "Yes. History, transcripts and replays are available on Growth and above. You can scrub through any conversation, see the transcript, and tag patterns to refine your sales and support rules.",
      },
      "how-much-cost": {
        question: "How much does Bizmis cost?",
        answer:
          "Three plans plus Enterprise, billed monthly, or yearly for about 20% off. **Starter** ($79/mo, 260 sessions) for solo or small stores. **Growth** ($199/mo, 660 sessions) for growing stores, most popular. **Scale** ($499/mo, 1,650 sessions) for high-volume stores. **Enterprise** from $1,500/mo for custom volume, guaranteed capacity for traffic peaks and SLAs. Extra sessions cost $0.30 each, up to the spend cap you set. You can start with 120 free sessions.",
      },
      "what-counts-as-session": {
        question: "What counts as a session?",
        answer:
          "A session is one shopper's visit with your clerk, by voice or text. Sessions longer than 5 minutes of voice or 40 messages count as two. Visits where the shopper says nothing are free. Your own previews in the Bizmis admin are free too. Each plan includes a number of sessions (Starter 260 / Growth 660 / Scale 1,650) that resets every month. Beyond that, extra sessions cost $0.30 each, only up to the spend cap you set in the Bizmis admin. The cap starts at $0, so nothing extra is billed until you raise it. Once the cap is reached, the clerk pauses until the next period or until you raise the cap. Unused sessions don't roll over.",
      },
      "monthly-billing": {
        question: "Is there yearly billing?",
        answer:
          "Yes. You can pay for a full year upfront and get about 20% off the monthly price. Your included sessions still reset every month.",
      },
      "early-access-offer": {
        question: "What is the Early Access offer?",
        answer:
          "Early Access gives invited Shopify stores the Free plan's **120 free sessions**, once per store. There is no subscription, usage charge, automatic upgrade, or renewal. When the sessions run out, Bizmis pauses unless you choose and approve a paid plan in Shopify. Members also get 1-to-1 onboarding, priority support, prioritized product feedback, and a personal discount if they later upgrade.",
      },
      "free-plan": {
        question: "Is there a free plan?",
        answer:
          "Yes. The **Free plan** runs Bizmis live in your store for **120 free sessions**, once per store. No subscription, no commitment, no card needed, and nothing renews. It's a real test with real shoppers. When you're ready for ongoing capacity, upgrade to a paid plan. Every Bizmis charge runs through Shopify on the account you already use, so you never add a separate card for Bizmis, and the Free plan has nothing to charge.",
      },
      "billing-payment-method": {
        question: "How does payment work? Do I need to add a card?",
        answer:
          "All Bizmis billing runs through Shopify's Billing API on the same account you already use to run your store. You approve Bizmis charges directly inside Shopify, and everything (your plan plus any overage) lands on your regular Shopify invoice alongside your other app charges. You never enter a separate payment card into Bizmis. Paid usage is still billed, it's just collected by Shopify rather than by us. The Free plan has nothing to charge, so there's nothing to approve until you decide to upgrade.",
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
      "cancel-anytime": {
        question: "Can I cancel anytime?",
        answer:
          "Yes, from the Bizmis admin or by uninstalling the app. Cancellation is immediate, the voice widget stops serving shoppers as soon as it's confirmed.",
      },
      "refund-policy": {
        question: "What's your refund policy?",
        answer:
          "**30-day money-back guarantee:** cancel within 30 days of your first paid plan charge and we'll refund that plan fee, no questions asked. It doesn't cover later months or extra sessions.\n**After that:** charges already billed for the current month are non-refundable, but you won't be billed again. Unused sessions don't carry over.",
      },
      "personalize-voice-avatar": {
        question: "Can I personalize the voice and the avatar?",
        answer:
          "Yes. Choose from a curated set of natural-sounding voices across 25+ languages, or pick from four avatar characters (Growth and above). You can also configure greeting, tone, and behavior to match your brand.",
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
          "One on Starter, up to five on Growth, unlimited on Scale and Enterprise. Each clerk can have its own voice, avatar, and rule set, useful if you sell across distinct collections or markets.",
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
          "Claim Early Access in the app and use 120 live sessions at no cost. No subscription, no commitment.",
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
          "Your Early Access code unlocks discounted monthly intro pricing when you upgrade.",
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
      "*Free for Early Access members = 120 live sessions, once per store, no renewal.",
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
