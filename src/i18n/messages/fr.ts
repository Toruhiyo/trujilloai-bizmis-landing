import type { Messages } from "./en";

export const fr: Messages = {
  common: {
    installNow: "Installer maintenant",
    installOnShopify: "Installer sur Shopify",
    installOnYourStore: "Installer sur votre boutique",
    installBizmisOnShopify: "Installer Bizmis sur Shopify",
    liveDemo: "Démo",
    bookACall: "Réserver un appel",
    getStarted: "Commencer",
    contactSupport: "Contacter le support",
    contactSales: "Parler aux ventes",
    soon: "Bientôt",
    email: "hello@bizmis.ai",
  },

  languageSwitcher: {
    label: "Langue",
    ariaLabel: "Choisir la langue",
  },

  nav: {
    earlyAccess: "Accès anticipé",
    benefits: "Avantages",
    setup: "Installation",
    pricing: "Tarifs",
    faqs: "FAQ",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
  },

  hero: {
    badgeLabel: "Accès anticipé",
    badgeDetailShort: "50 premières boutiques",
    badgeDetailLong: "Gratuit pour les 50 premières boutiques Shopify",
    titleLine1: "Le meilleur vendeur",
    // Non-breaking space keeps "en ligne" together if this line wraps.
    titleLine2: "de votre boutique, maintenant en\u00A0ligne",
    subtitleLead: "Il aide chaque client à",
    subtitleFind: "le trouver",
    subtitleTrust: "s'y fier",
    subtitleBuy: "l'acheter",
    subtitleConnector: " et à",
    pitchLead: "Ce n'est pas un chatbot.",
    pitchShort:
      "Les clients partent quand ils ne trouvent pas le bon produit ou hésitent avant d'acheter, exactement les moments qu'un vendeur en boutique rattraperait. Bizmis apporte cette aide en ligne, par la voix, en réduisant votre catalogue au bon produit et en levant les doutes pour qu'ils achètent en confiance.",
    pitchLong:
      "Les clients partent quand ils ne trouvent pas le bon produit ou hésitent avant d'acheter, exactement les moments qu'un vendeur en boutique rattraperait. Bizmis apporte cette aide en ligne, par la voix. Il écoute, réduit votre catalogue au bon produit et lève les doutes pour qu'ils achètent en confiance.",
    installSubline: "Installation en un clic, prêt en quelques minutes",
    alsoAvailableFor: "Également disponible pour les",
    customWebsites: "sites sur mesure",
    ratherTalk: "Vous préférez en discuter ?",
    avatarAlt: "Assistant de vente numérique aidant des clients",
    agentHello: "Bonjour ! Je suis votre agent commercial Bizmis.",
    agentPitch: "Je cerne les besoins de chaque client, je lève ses doutes et je vous fais gagner la vente.",
    agentInvite: "Appuyez sur play et regardez-moi vendre !",
  },

  film: {
    watch: "Regarder le film",
    replay: "Revoir",
    play: "Lecture",
    pause: "Pause",
    mute: "Couper le son",
    unmute: "Activer le son",
    enterFullscreen: "Plein écran",
    exitFullscreen: "Quitter le plein écran",
    seek: "Rechercher",
    region: "Film Bizmis",
    quality: "Qualité",
    auto: "Auto",
    close: "Fermer la vidéo",
  },

  /** The film-led landing (/v2): copy it adds to the classic landing's messages. */
  landing: {
    /** The hero's line under the title (the classic keeps hero.subtitle*): the last part is the merchant's win, highlighted. */
    heroLine: ["Cerner les besoins.", "Lever les doutes.", "Gagner des ventes."],
    /** Under the hero's Install button (the classic landing keeps hero.installSubline). */
    installSubline: "Installation en un clic, prête tout de suite",
    switch: {
      chatbot: "Chatbot",
      agent: "Agent de vente",
      toggleAria: "Comparer un chatbot classique avec l'agent de vente Bizmis",
      chatbotMessage: "Bonjour ! Comment puis-je vous aider ?",
      chatbotReply: "Voici quelques liens qui pourraient vous aider.",
      agentMessage: "Vous cherchez un cadeau ? Dites-moi pour qui, je trouve le bon.",
      /** What the shopper does: with a chatbot, then with the Bizmis sales agent. */
      shopper: "Votre client",
      chatbotOutcome: ["Ne trouve pas", "Hésite", "Part"],
      agentOutcome: ["Le trouve", "S'y fie", "L'achète"],
      /** The shopper's patience while using the chatbot: it drains with every reply. */
      patience: {
        label: "Patience du client",
        reading: "+{s} s de lecture",
        stages: ["Lit un mur de texte…", "Survole. Toujours pas de réponse.", "Ouvre l'onglet d'un concurrent…", "Tape « parler à un humain »…", "Parti."],
        leftTitle: "Le client est parti.",
        leftBody: "Vente perdue. Personne n'a rien vu.",
        cta: "Essayez l'agent commercial",
      },
      /** The typical chatbot, interactive: verbose, dull, useless to sell. */
      bot: {
        title: "Chatbot",
        hint: "Allez, posez-lui une question",
        placeholder: "Écrivez votre message...",
        send: "Envoyer",
        open: "Ouvrir le chat",
        close: "Fermer le chat",
        greeting: "Bonjour ! 👋 Je suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui ? Choisissez l'une des options ci-dessous ou écrivez votre question.",
        chips: ["Suivre ma commande", "Retours", "Nous contacter"],
        helpful: "Cette réponse vous a-t-elle aidé ?",
        product: "Merci pour votre message ! Ce produit fait partie de notre collection la plus vendue et constitue un excellent choix pour de nombreuses occasions. Tous les détails, y compris les matériaux, les dimensions et les conseils d'entretien, figurent dans la description du produit. Veuillez noter que les délais de livraison peuvent varier selon votre localisation et le mode de livraison choisi lors du paiement. Pour toute information sur les échanges et remboursements, consultez notre page Politique de retour. Notre service client répond généralement sous 2 à 3 jours ouvrés. Puis-je vous aider pour autre chose aujourd'hui ?",
        productLinks: ["Politique de retour", "Informations de livraison"],
        track: "Pour suivre votre commande, saisissez votre numéro de commande et l'adresse e-mail utilisée lors du paiement sur notre page Suivi de commande. Votre numéro de commande commence par # et figure dans votre e-mail de confirmation. Les informations de suivi peuvent mettre 24 à 48 heures à s'actualiser après l'expédition. Si vous n'avez pas reçu d'e-mail de confirmation, vérifiez vos courriers indésirables.",
        trackLinks: ["Suivi de commande"],
        returns: "Nous acceptons les retours dans un délai de 30 jours après la livraison, à condition que les articles soient inutilisés, non lavés et dans leur emballage d'origine avec toutes les étiquettes. Les articles soldés, les cartes cadeaux et les produits personnalisés ne sont ni repris ni échangés. Pour lancer un retour, rendez-vous sur notre Portail de retour. Les remboursements sont effectués sur le moyen de paiement d'origine sous 5 à 10 jours ouvrés après réception et contrôle de votre retour. Les frais de retour ne sont pas remboursables.",
        returnsLinks: ["Portail de retour"],
        contact: "Notre service client est disponible du lundi au vendredi, de 9 h à 17 h, hors jours fériés. Écrivez-nous par e-mail en indiquant votre numéro de commande dans l'objet. Nous nous efforçons de répondre à toutes les demandes sous 2 à 3 jours ouvrés. Merci de votre patience !",
        contactLinks: ["Formulaire de contact"],
        human: "Désolé, aucun conseiller n'est disponible pour le moment. Laissez-nous votre adresse e-mail et un membre de notre équipe vous répondra sous 2 à 3 jours ouvrés.",
        confused: "Désolé, je n'ai pas bien compris. Pourriez-vous reformuler votre question ? Vous pouvez aussi choisir l'une des options ci-dessous.",
        thanks: "Merci pour votre retour ! Nous travaillons constamment à améliorer notre service.",
      },
    },
    /** The film's end-card scarcity line. */
    onlySpots: "Seulement 50 places !",
    /** The personalization carousel. */
    carousel: { label: "Choisissez un avatar", prev: "Avatar précédent", next: "Avatar suivant" },
    yourStore: "Votre boutique",
    agentAlt: "L'avatar de l'agent de vente Bizmis",
    /** UI text of the real widget, as it appears in the mockups. */
    widget: {
      placeholder: "Aide-moi à trouver le bon produit.",
      takingYouTo: "Je vous emmène à",
      addingToCart: "Ajout au panier",
      searchResults: "Résultats de recherche",
      cartItem: "Sphère",
    },
    /** Boost Sales on /v2: the title stays on screen while each sub-benefit lights up its part (find it / trust it / buy it). */
    sales: {
      titleLead: "",
      titleParts: ["Cerner les besoins.", "Lever les doutes.", "Gagner des ventes."],
      stages: ["Découverte", "Décision", "Paiement"],
      panels: [
        { title: "Plus de clients trouvent leur bonheur", body: "Il réduit votre catalogue aux quelques produits qui conviennent." },
        { title: "Les doutes deviennent des décisions", body: "Il compare, conseille et répond à chaque doute." },
        { title: "Les paniers deviennent des commandes", body: "Il lève les dernières questions et les guide jusqu'au paiement." },
      ],
      payoff: { kicker: "Au total", title: "Plus de ventes avec les mêmes visites.", body: "Sans lassitude. Sans blocage. Sans hésitation." },
      findQuery: "Un cadeau pour ma sœur, moins de 50 €",
      findCaption: "En voici trois qu'elle va adorer.",
      compareQuery: "Lequel je prends ?",
      compareCaption: "Celui-ci. Le plus léger et le mieux noté.",
      bestMatch: "Meilleur choix",
      decided: "Dans le panier",
      buyQuery: "Il arrive avant vendredi ?",
      buyCaption: "Oui, il part aujourd'hui et le retour est gratuit. On passe au paiement ?",
      /** Each beat's words: the merchant's loss, struck through at the fix, then the win written in. No figures. */
      flip: [
        { problem: "Les visiteurs qui parcourent votre catalogue [[se lassent et abandonnent]].", fix: "Les visiteurs qui parcourent votre catalogue [[trouvent vite des produits qui valent le coup]]." },
        { problem: "Les acheteurs qui comparent leurs options [[se figent et repartent]].", fix: "Les acheteurs qui comparent leurs options [[choisissent en toute confiance]]." },
        { problem: "Les clients prêts à acheter [[hésitent et attendent]].", fix: "Les clients prêts à acheter [[se décident et passent au paiement]]." },
      ],
      /** ?beat=1..6: the small labels of the alternative loss → win looks. */
      flipLabels: { lose: "Vous perdez", win: "Vous gagnez", you: "Vous, aujourd'hui", withBizmis: "Avec Bizmis" },
      /** ?beat=4: each loss as the merchant says it (the speech bubble). */
      flipQuote: [
        "Les acheteurs se lassent de chercher dans mon catalogue, puis achètent les mêmes produits chez un concurrent.",
        "Mes acheteurs hésitants partent comparer et deviennent les clients d'un autre.",
        "Les acheteurs arrivent au paiement, un dernier doute surgit, et ils s'en vont.",
      ],
      /** The one-shopper variant (?case=one): the same shopper and gift from Find through Trust to Buy. */
      caseOne: {
        compareQuery: "Lequel des trois lui plaira le plus ?",
        compareCaption: "Celui-ci. Le mieux noté des trois.",
        buyQuery: "Il arrive avant son anniversaire vendredi ?",
        buyCaption: "Oui, il part aujourd'hui et le retour est gratuit. On passe au paiement ?",
      },
      cart: { title: "Votre panier", subtotal: "Sous-total", checkout: "Paiement", perks: ["Expédié aujourd'hui", "Retours gratuits"], placed: "Commande passée" },
      funnel: {
        problems: ["Renoncent à chercher", "Partent comparer", "Abandonnent le panier"],
        solutions: ["Trouvent vite", "Décident ici", "Achètent"],
        /** The word at the open mouth, with its arrow: the dots are store visits. */
        visits: "visites",
      },
      /** ?win=4..6: the metrics merchants know, drawn moving the right way as stages get fixed (no figures). */
      metrics: {
        conversion: "Taux de conversion",
        orders: "Commandes",
        abandoned: "Paniers abandonnés",
        ordersToday: "Commandes du jour",
        before: "avant",
        after: "après",
      },
      pulse: { currency: "EUR" },
    },
    support: {
      title: "Moins de tickets.",
      titleTail: "Des clients plus heureux.",
      /** The area's full name, the chapter eyebrow over the outcome (the pillar openers, ?open=1..6). */
      area: "Service client",
      lead: "Il répond en quelques secondes, jour et nuit, avec la chaleur de votre meilleur vendeur.",
      capabilities: [
        { title: "Toujours là", body: "Chaque question reçoit une réponse dès qu'elle est posée." },
        { title: "Connaît votre boutique", body: "Il répond à partir de vos propres politiques et de votre catalogue." },
        { title: "Sent l'humeur", body: "Il apaise les clients mécontents avant qu'ils ne laissent un mauvais avis." },
      ],
      live: {
        label: "Les clients demandent, Bizmis répond à voix haute",
        questions: ["Où est ma commande ?", "Ça taille petit ?", "Je peux le retourner ?", "Livrez-vous au Canada ?"],
        email: "E-mail support",
        done: "Répondu sur le moment",
      },
    },
    insights: {
      title: "Voyez ce qui vend.",
      titleTail: "Corrigez le reste.",
      /** The area's full name, the chapter eyebrow over the outcome (the pillar openers, ?open=1..6). */
      area: "Données de la boutique",
      lead: "Chaque conversation devient une prochaine étape claire.",
      features: [
        { title: "Replays de session", body: "Écoutez le moment exact où un client a hésité." },
        { title: "Chats tagués tout seuls", body: "Les questions se regroupent seules, et une correction évite de nombreux tickets." },
        { title: "Insights du tunnel", body: "Voyez quelles corrections rapportent en premier." },
      ],
      clarity: {
        snippets: ["Livraison au Canada ?", "Taille M ou L ?", "Retours ?", "Emballage cadeau ?"],
        topAsk: "Question n°1 : la livraison",
      },
    },
    /** Boost Sales's area, the chapter eyebrow over its outcome (its outcome is already "Boost Sales"). */
    salesArea: "Ventes",
    customize: {
      lead: "Choisissez son look et mettez votre logo sur son t-shirt.",
      avatar: { title: "Votre avatar", body: "Choisissez un visage qui colle à votre marque." },
      voice: { title: "Votre voix", body: "Clonez-la pour qu'il parle comme vous." },
    },
    /** The closing card, as the film's: the title is the install button, then the handwritten invite and, apart, the note. */
    endCard: {
      install: "Installer maintenant",
      invite: "pour les avantages Early Access !",
      note: "Seulement 50 places !",
      /** The ad-1 film's Early Access perks, then the quieter extras under them. */
      perks: ["120 conversations gratuites", "-50 % sur les forfaits supérieurs", "Orientez la feuille de route"],
      extras: ["Sans carte bancaire", "Sans engagement", "Une ligne directe avec le fondateur"],
    },
    setup: {
      title: "Installation en un clic",
      lead: "Un clic et votre agent vend déjà. Modifiez quoi que ce soit dans votre boutique, il le sait aussitôt.",
      install: "Installer",
      syncing: "Synchronisation de votre boutique",
      synced: "Synchronisée",
      readyNow: "Prêt tout de suite",
    },
  },

  benefits: {
    sales: {
      badge: "Plus de ventes",
      title: "Convertir. Augmenter. Fidéliser.",
      leadShort:
        "Un excellent vendeur qui guide vos clients, augmente le panier moyen et les fait revenir.",
      leadLong:
        "Bizmis agit comme un excellent vendeur en boutique : il guide les clients, augmente la valeur du panier et crée cette expérience chaleureuse et personnelle qui donne envie de revenir.",
      pillars: [
        {
          title: "Convertir plus de visiteurs",
          subtitle: "Lever les hésitations d'achat",
          body: "Bizmis répond instantanément et guide chaque client vers le bon produit, pour que davantage de visiteurs se sentent prêts à acheter.",
        },
        {
          title: "Augmenter le panier moyen",
          subtitle: "Ventes additionnelles pertinentes",
          body: "Recommandations, montées en gamme et produits complémentaires apparaissent naturellement au fil de la conversation.",
        },
        {
          title: "Fidéliser vos clients",
          subtitle: "Une expérience d'achat personnelle",
          body: "Une expérience d'achat chaleureuse dont les clients se souviennent et pour laquelle ils reviennent.",
        },
      ],
    },
    support: {
      badge: "Service client",
      titleLine1: "Gagnez des heures de support.",
      titleLine2: "Gagnez des clients fidèles.",
      leadShort:
        "Un support immédiat et empathique 24/7 qui semble humain : plus de satisfaction, des heures de travail en moins.",
      leadLong:
        "L'intelligence émotionnelle et un support instantané 24/7 améliorent la satisfaction client avec des réponses immédiates, chaleureuses et empathiques, comme l'aide d'un bon vendeur, tout en économisant un temps de support précieux.",
      outcomes: {
        saveHours: "Gagner des heures de support",
        betterReviews: "Obtenir de meilleurs avis",
        repeatSales: "Développer le réachat",
      },
      capabilities: [
        {
          title: "Support instantané 24/7",
          tagline: "Sans attente, sans frustration",
          body: "Vos clients sont aidés au moment précis où ils en ont besoin : sans attente, sans frustration et sans mauvais avis liés à des questions sans réponse.",
        },
        {
          title: "Connaissance de la boutique",
          tagline: "Politiques, produits et documents en un instant",
          body: "Répond instantanément aux questions sur les politiques, les produits et la documentation, pour que vos clients aient des réponses claires sans attendre votre équipe.",
        },
        {
          title: "Intelligence émotionnelle",
          tagline: "Des réponses chaleureuses et empathiques",
          body: "Une IA qui comprend les émotions des clients et répond avec une véritable attention.",
        },
      ],
    },
    insights: {
      badge: "Données de la boutique",
      title: "Apprendre. Ajuster. Croître.",
      lead: "Voyez où les acheteurs hésitent, ce qu'ils demandent et quels parcours convertissent, pour corriger moins, gagner des heures et investir là où le chiffre d'affaires progresse.",
      features: [
        {
          title: "Relectures de session",
          tagline: "Allez droit aux abandons",
          body: "Allez droit aux points d'abandon et d'hésitation. Corrigez une fois, évitez les paniers abandonnés et récupérez les ventes menacées.",
        },
        {
          title: "Conversations étiquetées",
          tagline: "Une correction, moins de tickets répétés",
          body: "Les conversations se regroupent seules par thème et intention. Mettez à jour une FAQ ou une politique, réduisez les tickets récurrents et allégez le support.",
        },
        {
          title: "Analyse du tunnel",
          tagline: "Repérez d'un coup d'œil ce qui rapporte",
          body: "Visualisez les parcours de conversion, les abandons et l'impact par produit d'un coup d'œil. Priorisez ce qui rapporte le plus et misez sur ce qui marche.",
        },
      ],
    },
  },

  salesDemo: {
    steps: ["Découvrir et recommander", "Comparer les produits", "Conclure la vente"],
    recommended: "Recommandé",
    added: "Ajouté",
    orderConfirmed: "Commande confirmée",
    subtotal: "Sous-total",
    shipping: "Livraison",
    free: "Offerte",
    total: "Total",
    assistantAlt: "Assistant Bizmis",
    deliveryEstimate: "Livraison en 2-3 jours",
    productLabels: {
      cozyPick: "Cocooning",
      proPick: "Choix expert",
      greatValue: "Bon rapport qualité-prix",
      recurring: "Abonnement",
      onTheGo: "Nomade",
      calming: "Apaisant",
    },
    productNames: {
      cozyCandles: "Coffret de bougies cosy",
      frenchPress: "Kit cafetière à piston",
      ethiopianBeans: "Café d'Éthiopie",
      roastSubscription: "Abonnement café torréfié",
      travelMug: "Mug de voyage",
      scentedCandles: "Bougies parfumées",
    },
    shopperQuotes: {
      birthdayGift: '"Je cherche un cadeau d\'anniversaire."',
      morningRoutine: '"Aidez-moi à composer ma routine du matin."',
      cozyForMom: '"Quelque chose de cosy pour ma mère."',
      campingCoffee: '"J\'ai besoin de café pour le camping."',
    },
  },

  supportDemo: {
    steps: ["Question reçue", "Source vérifiée", "Résolu"],
    done: "Terminé",
    processing: "En cours",
    assistantAlt: "Assistant support Bizmis",
    cases: {
      returnPolicy: {
        quote: '"Puis-je le retourner si la taille ne va pas ?"',
        action: "Politique consultée",
        response:
          "Bien sûr, vous avez 30 jours. Je peux vous guider pas à pas si besoin.",
      },
      orderTracking: {
        quote: '"Où est ma commande ?"',
        action: "Commande localisée",
        response:
          "Elle est partie hier et devrait arriver lundi. Je vous envoie le lien de suivi ?",
      },
      shippingTime: {
        quote: '"Combien de temps prend la livraison ?"',
        action: "Livraison vérifiée",
        response:
          "En général 2 à 3 jours ouvrés. Je peux aussi vous montrer des options plus rapides.",
      },
      changeAddress: {
        quote: '"Je me suis trompé d\'adresse de livraison."',
        action: "Adresse mise à jour",
        response:
          "Aucun souci, je peux la modifier avant l'expédition de la commande.",
      },
      cancelOrder: {
        quote: '"Puis-je annuler ma commande ?"',
        action: "Commande annulée",
        response:
          "Oui, elle n'a pas encore été traitée. Je peux l'annuler tout de suite.",
      },
      warranty: {
        quote: '"Y a-t-il une garantie ?"',
        action: "Garantie confirmée",
        response: "Oui, tout est couvert par une garantie de 2 ans.",
      },
      startReturn: {
        quote: '"Je souhaite retourner cet article."',
        action: "Retour lancé",
        response: "Bien sûr. Je peux lancer le retour pour vous.",
      },
    },
  },

  sessionReplay: {
    categories: {
      sale: "Vente",
      support: "Support",
    },
    tabTooltips: {
      sale: "Session de vente anonyme, recherche de cadeau aboutissant à un achat",
      saleLoyal: "Session de vente avec utilisateur connecté, client fidèle",
      supportSuccess: "Session de support, question de politique résolue",
      supportFailed: "Session de support, demande non aboutie",
    },
    successful: "Résolue",
    unresolved: "Non résolue",
    anonymousCustomer: "Client anonyme",
    customer: "Client",
    vip: "VIP",
    transcriptNote: "Session enregistrée, langue d'origine",
  },

  setup: {
    badge: "Prêt à l'emploi",
    title: "Installation en un clic, ventes et support immédiats",
    lead: "Installez l'application Bizmis pour Shopify et commencez à vendre et à assister vos clients immédiatement.",
    storeDataTitle: "Les données de votre boutique Shopify",
    dataCards: [
      { title: "Site de la boutique", description: "Vision, mission et valeurs" },
      {
        title: "Catalogue produits",
        description: "Collections, stock, commandes fournisseurs",
      },
      { title: "Remises", description: "Toutes les promotions en cours" },
      {
        title: "Politiques",
        description: "Livraison, retours et politiques de la boutique",
      },
      {
        title: "Clients",
        description: "Historique de ventes et de support par client",
      },
      { title: "Commandes", description: "Historique des commandes" },
    ],
    badges: {
      oneClick: "Installation en un clic",
      alwaysSynced: "Toujours synchronisé",
      readyInMinutes: "Prêt en quelques minutes",
    },
    ctaNote: "Commencez à vendre et à assister vos clients dès maintenant.",
  },

  customization: {
    badge: "Personnalisation",
    titleLead: "Faites-en",
    titleHighlight: "votre vendeur",
    lead: "Créez des relations authentiques qui fidélisent grâce à la personnalisation de la voix et de l'apparence.",
    avatar: {
      title: "Avatar personnalisé",
      body: "Créez des liens authentiques en donnant à votre vendeur votre voix et votre apparence.",
    },
    voiceCloning: {
      title: "Clonage de voix",
      body: "Des échanges authentiques grâce à la reproduction de votre façon de parler et de votre personnalité.",
    },
    imageAlt: "Espace de personnalisation : voix et apparence",
  },

  finalCta: {
    title: "Installez sur Shopify en 1 clic. Vendez dès aujourd'hui.",
    lead: "Bizmis accueille vos visiteurs, répond à leurs questions et les accompagne jusqu'au paiement, en synchronisation complète avec vos produits, remises et commandes Shopify.",
    bullets: [
      "Accueille et qualifie les acheteurs",
      "Compare les produits et recommande",
      "Gère le support et réduit les tickets",
    ],
    installAria: "Installer Bizmis sur Shopify",
    bookCallAria: "Réserver un appel avec l'équipe Bizmis",
    cancelAnytime: "Annulation à tout moment",
    gdprReady: "Conforme RGPD",
    builtForShopify: "Built for Shopify",
  },

  earlyAccessCard: {
    badge: "Accès anticipé",
    titleLead: "Soyez parmi les premiers.",
    titleHighlight: "Vendez plus.",
    lead: "Rejoignez le cercle des 50 premiers marchands qui façonnent l'avenir du commerce conversationnel.",
    perks: [
      {
        title: "50 % de remise les 3 premiers mois",
        caption: "Bloquez notre tarif de lancement le plus bas.",
      },
      {
        title: "Influence directe sur la feuille de route",
        caption: "Vos demandes de fonctionnalités passent en priorité.",
      },
      {
        title: "Onboarding VIP",
        caption: "Session de configuration et de démarrage personnalisée incluse.",
      },
    ],
    limitedSpots: "Places limitées",
    cta: "Profiter de l'accès anticipé",
  },

  footer: {
    tagline:
      "Le meilleur vendeur de votre boutique, actif 24/7 pour vendre plus, assister vos clients et mieux les comprendre.",
    builtFor: "Conçu pour",
    columns: {
      product: "Produit",
      support: "Support",
      legal: "Mentions légales",
    },
    links: {
      features: "Fonctionnalités",
      pricing: "Tarifs",
      demo: "Démo",
      contact: "Contact",
      bookACall: "Réserver un appel",
      faqs: "FAQ",
      privacy: "Politique de confidentialité",
      terms: "Conditions d'utilisation",
    },
    legalNotice: "Les pages légales sont disponibles en anglais.",
    copyright: (year: number) => `© ${year} Bizmis. Tous droits réservés.`,
  },

  pricing: {
    badge: "Tarifs",
    title: "Des tarifs simples et transparents",
    lead: "Choisissez le plan adapté à votre activité. Tous incluent l'intégration Shopify complète.",
    perMonth: "/mois",
    popular: "Populaire",
    conversationsPerMonth: "conversations / mois",
    extraConversations: (price: string) =>
      `Conversations supplémentaires à ${price} l'unité, dans la limite du plafond de dépenses que vous fixez`,
    conversationDefinition:
      "Une conversation, c'est l'échange d'un client avec votre vendeur, à la voix ou par écrit. Elle couvre jusqu'à 2 minutes de voix ou 20 messages ; au-delà, elle compte pour deux. Les échanges où le client ne dit rien sont gratuits.",
    off: "de remise",
    discountTitle: (percent: number) => `${percent} % de moins que le tarif public`,
    introPeriodTitle: "Période de lancement remisée",
    introMonths: (months: number, standardPrice: string) =>
      `${months === 1 ? "1er mois" : `${months} premiers mois`}, puis ${standardPrice} $/mois`,
    free: {
      name: "Gratuit",
      noCommitment: "Sans engagement",
      description: (conversations: string) =>
        `${conversations} conversations gratuites pour essayer Bizmis. Sans carte bancaire.`,
      cta: "Commencer gratuitement",
    },
    plans: {
      starter: {
        name: "Starter",
        features: [
          "1 vendeur Bizmis",
          "Voix et texte",
          "Support : e-mail (48 h)",
        ],
      },
      growth: {
        name: "Growth",
        features: [
          "Jusqu'à 5 vendeurs Bizmis",
          "Historique, transcriptions et relectures",
          "Personnalisation de l'avatar",
          "Support : e-mail (24 h) et appel programmé",
        ],
      },
      scale: {
        name: "Scale",
        features: [
          "Vendeurs Bizmis illimités",
          "Conversations étiquetées automatiquement",
          "Support prioritaire et onboarding en direct",
        ],
      },
    },
    enterprise: {
      name: "Enterprise",
      priceFrom: "À partir de",
      description:
        "Des solutions sur mesure pour les opérations à grande échelle, avec volume et exigences personnalisés.",
      everythingInScale: "Tout le plan Scale, plus :",
      features: [
        "Volume de conversations sur mesure",
        "Capacité garantie pour les pics de trafic",
        "SLA et voix personnalisée",
        "Facturation en dehors de Shopify",
      ],
    },
    guarantees: {
      spendLimit: "Vous fixez votre plafond de dépenses",
      cancelAnytime: "Annulation à tout moment",
      moneyBack: "Garantie satisfait ou remboursé 30 jours",
    },
    coupon: {
      prompt:
        "Vous avez un code promo ? Saisissez-le puis appuyez sur Entrée ou Appliquer pour mettre à jour les tarifs.",
      placeholder: "Code promo",
      inputAria: "Code promotionnel",
      apply: "Appliquer",
      applying: "Application…",
      remove: "Retirer le code",
      active: (label: string) => `${label} actif`,
      viewingPricing: (label: string, cap: number) =>
        `Vous consultez les tarifs ${label}, réservés à nos ${cap} premiers marchands.`,
      shapeProduct:
        "Aidez-nous à façonner le produit avec vos retours sur la feuille de route. Les tarifs ci-dessus incluent",
      monthlyDiscount: (percent: number, months: number) =>
        months > 0
          ? `${percent} % de remise ${months === 1 ? "le 1er mois" : `les ${months} premiers mois`}`
          : `${percent} % de remise`,
      discountEnd: ".",
      errors: {
        empty: "Saisissez d'abord un code.",
        notFound: "Ce code n'est pas valide.",
        expired: "Ce code a expiré.",
        notYetActive: "Ce code n'est pas encore actif.",
        invalidFormat: "Le format du code semble incorrect, vérifiez la saisie.",
        alreadyClaimed: "Ce code a déjà été utilisé.",
        invalidToken: "Session expirée. Merci de réessayer.",
        generic: "Impossible de vérifier le code pour le moment. Réessayez.",
      },
    },
    viewAllFaqs: "Voir toutes les questions fréquentes",
    enterpriseInquirySubject: "Demande concernant le plan Enterprise",
  },

  faqsPage: {
    title: "Tout ce qu'il faut savoir sur Bizmis",
    lead: "Les réponses aux questions les plus fréquentes sur notre assistant de vente pour Shopify",
    searchPlaceholder: "Rechercher dans la FAQ...",
    searchAria: "Rechercher dans la FAQ",
    allQuestions: "Toutes les questions",
    noResults: "Aucune question ne correspond à votre recherche.",
    stillHaveQuestions: "Il vous reste une question ?",
    teamIsHere:
      "Notre équipe est là pour vous aider à tirer le meilleur de Bizmis.",
  },

  faqs: {
    categories: {
      "getting-started": "Premiers pas",
      "what-bizmis-does": "Ce que fait Bizmis",
      "pricing-billing": "Tarifs et facturation",
      customization: "Personnalisation",
      "privacy-data": "Confidentialité et données",
      "shopify-integration": "Intégration Shopify",
    },
    items: {
      "what-is-bizmis": {
        question: "Qu'est-ce que Bizmis ?",
        answer:
          "Bizmis est un vendeur IA vocal pour Shopify. Il accueille les acheteurs, répond aux questions sur les produits, les commandes, les retours et les politiques, et les accompagne jusqu'au paiement, comme le ferait un bon vendeur en boutique. Il fonctionne 24/7 dans votre boutique sous la forme d'un petit widget vocal.",
      },
      "is-chatbot": {
        question: "Bizmis est-il un chatbot ?",
        answer:
          "Non. Bizmis fonctionne d'abord par la voix, pas par le texte. L'acheteur parle, Bizmis répond, et l'échange se déroule comme une vraie conversation avec un vendeur, pas comme un arbre de dialogue scripté. Le widget affiche une transcription pour relire ce qui a été dit, mais l'interaction principale reste vocale.",
      },
      "how-fast-start": {
        question: "En combien de temps puis-je démarrer ?",
        answer:
          "Un clic pour installer depuis le Shopify App Store. Bizmis synchronise automatiquement vos produits, collections, politiques et FAQ. Aucune configuration manuelle, aucun entraînement de modèle, aucun développement. La plupart des boutiques sont opérationnelles en quelques minutes.",
      },
      "when-see-value": {
        question: "Quand vais-je voir les premiers résultats ?",
        answer:
          "Dès la première conversation. Bizmis est actif dès la fin de l'installation et commence immédiatement à aider vos acheteurs.",
      },
      "what-it-does": {
        question: "Que fait concrètement Bizmis ?",
        answer:
          "Trois choses. **Ventes :** il accueille les acheteurs, qualifie leur intention, recommande des produits et les accompagne jusqu'au paiement. **Support :** il gère le suivi de commande, la livraison, les retours, les politiques et la FAQ à toute heure. **Analyse :** relectures de session, parcours étiquetés automatiquement et analyse du tunnel pour voir ce que vos acheteurs demandent, veulent et abandonnent.",
      },
      "place-orders": {
        question: "Bizmis passe-t-il des commandes ou encaisse-t-il des paiements ?",
        answer:
          "Non. Le paiement, les remboursements et les modifications de commande restent gérés par Shopify et vos processus existants. Bizmis fournit de l'information et guide la décision, mais ne finalise jamais une transaction et ne modifie jamais une commande à la place de l'acheteur.",
      },
      "cart-management": {
        question: "Bizmis gère-t-il les paniers ou récupère-t-il les paniers abandonnés ?",
        answer:
          "Pour le panier, oui. Dès que le client dit oui, Bizmis ajoute les articles au panier de votre propre boutique et le compteur se met à jour tout de suite. Il signale les options en rupture, propose une alternative et peut emmener le client au panier ou au paiement. Il n'envoie pas d'e-mails de panier abandonné, mais reprend la conversation là où elle s'était arrêtée quand le client change de page.",
      },
      "feels-human": {
        question: "L'assistant paraîtra-t-il humain ?",
        answer:
          "Oui. Le ton, le rythme, l'expressivité et la chaleur sont conçus pour évoquer un vrai vendeur, pas une voix robotique. Les acheteurs savent qu'ils parlent à une IA, Bizmis l'annonce d'emblée conformément au règlement européen sur l'IA, mais l'expérience reste conversationnelle et non transactionnelle.",
      },
      "insights-analytics": {
        question: "Quelles données vais-je obtenir ?",
        answer:
          "Un tableau de bord avec les relectures de session, les transcriptions, les thèmes étiquetés automatiquement (ventes / support / inconnu), les issues (répondu / escaladé / non résolu) et les événements du tunnel (produits présentés, produits discutés, intention d'achat). Vous voyez ce que veulent vos acheteurs, où ils hésitent et ce à quoi votre boutique répond mal.",
      },
      "review-conversations": {
        question: "Puis-je revoir les conversations passées ?",
        answer:
          "Oui. L'historique, les transcriptions et les relectures sont disponibles à partir du plan Growth. Vous pouvez parcourir n'importe quelle conversation, lire la transcription et étiqueter des tendances pour affiner vos règles de vente et de support.",
      },
      "how-much-cost": {
        question: "Combien coûte Bizmis ?",
        answer:
          "Trois plans plus Enterprise, tous facturés au mois. **Starter** (79 $/mois, 260 conversations) pour les boutiques individuelles ou de petite taille. **Growth** (199 $/mois, 660 conversations) pour les boutiques en croissance, le plus populaire. **Scale** (499 $/mois, 1 650 conversations) pour les boutiques à fort volume. **Enterprise** à partir de 1 500 $/mois, avec un volume sur mesure, une capacité garantie pour les pics de trafic et des SLA. Chaque conversation supplémentaire coûte 0,30 $, dans la limite du plafond de dépenses que vous fixez. Vous pouvez commencer avec 120 conversations gratuites.",
      },
      "what-counts-as-conversation": {
        question: "Qu'est-ce qui compte comme une conversation ?",
        answer:
          "Une conversation, c'est l'échange d'un client avec votre vendeur, à la voix ou par écrit. Elle couvre jusqu'à 2 minutes de voix ou 20 messages ; au-delà, elle compte pour deux. Les échanges où le client ne dit rien sont gratuits, tout comme vos propres aperçus dans l'administration Bizmis. Chaque plan inclut un nombre de conversations (Starter 260 / Growth 660 / Scale 1 650) renouvelé chaque mois. Au-delà, chaque conversation supplémentaire coûte 0,30 $, uniquement dans la limite du plafond de dépenses que vous fixez dans l'administration Bizmis. Le plafond démarre à 0 $ : rien de plus n'est facturé tant que vous ne le relevez pas. Une fois le plafond atteint, le vendeur se met en pause jusqu'à la période suivante ou jusqu'à ce que vous releviez le plafond. Les conversations non utilisées ne sont pas reportées.",
      },
      "monthly-billing": {
        question: "Existe-t-il une facturation annuelle ?",
        answer:
          "Pas pour l'instant. Tous les plans sont facturés au mois via Shopify, et vous pouvez annuler à tout moment.",
      },
      "early-access-offer": {
        question: "Qu'est-ce que l'offre d'accès anticipé ?",
        answer:
          "L'accès anticipé offre aux boutiques Shopify invitées les **120 conversations gratuites** du plan gratuit, une seule fois par boutique. Il n'y a aucun abonnement, frais d'utilisation, passage automatique à un plan supérieur ni renouvellement. Lorsque les conversations sont épuisées, Bizmis se met en pause, sauf si vous choisissez et approuvez un plan payant dans Shopify. Les membres bénéficient également d'un accompagnement individuel, d'une assistance prioritaire, d'une prise en compte prioritaire de leurs retours produit et d'une remise personnelle s'ils passent ensuite à un plan payant.",
      },
      "free-plan": {
        question: "Existe-t-il un plan gratuit ?",
        answer:
          "Oui. Le **plan gratuit** fait fonctionner Bizmis dans votre boutique pendant **120 conversations gratuites**, une seule fois par boutique. Sans abonnement, sans engagement, sans carte bancaire et sans renouvellement. C'est un vrai test avec de vrais acheteurs. Quand vous voulez de la capacité continue, passez à un plan payant. Toute facturation Bizmis passe par Shopify sur le compte que vous utilisez déjà : vous n'ajoutez jamais de carte séparée, et le plan gratuit n'a rien à facturer.",
      },
      "billing-payment-method": {
        question: "Comment se passe le paiement ? Dois-je ajouter une carte ?",
        answer:
          "Toute la facturation Bizmis passe par l'API de facturation de Shopify, sur le compte que vous utilisez déjà pour votre boutique. Vous approuvez les frais directement dans Shopify, et tout (votre plan et les éventuels dépassements) apparaît sur votre facture Shopify habituelle, à côté de vos autres applications. Vous n'enregistrez jamais de carte bancaire dans Bizmis. L'usage payant est bien facturé, simplement encaissé par Shopify plutôt que par nous. Le plan gratuit n'a rien à facturer : il n'y a donc rien à approuver tant que vous ne changez pas de plan.",
      },
      "upgrade-plan": {
        question: "Que se passe-t-il si je passe à un plan supérieur ?",
        answer:
          "Le changement prend effet immédiatement. La différence est facturée au prorata pour le reste de la période en cours ; les compteurs d'usage et la date de facturation restent inchangés. Les nouvelles fonctionnalités sont débloquées aussitôt.",
      },
      "downgrade-plan": {
        question: "Que se passe-t-il si je passe à un plan inférieur ?",
        answer:
          "Le changement prend effet au renouvellement suivant : vous conservez votre plan actuel et ses fonctionnalités jusque-là. Aucun compteur d'usage n'est réinitialisé et aucun prorata n'est appliqué.",
      },
      "cancel-anytime": {
        question: "Puis-je annuler à tout moment ?",
        answer:
          "Oui, depuis l'administration Bizmis ou en désinstallant l'application. L'annulation est immédiate : le widget vocal cesse de répondre aux acheteurs dès qu'elle est confirmée.",
      },
      "refund-policy": {
        question: "Quelle est votre politique de remboursement ?",
        answer:
          "**Garantie satisfait ou remboursé de 30 jours :** annulez dans les 30 jours suivant votre premier paiement d'un plan payant et nous remboursons ce montant, sans justification. La garantie ne couvre ni les mois suivants ni les conversations supplémentaires.\n**Ensuite :** les montants déjà facturés pour le mois en cours ne sont pas remboursables, mais vous ne serez plus facturé. Les conversations non utilisées ne sont pas reportées.",
      },
      "personalize-voice-avatar": {
        question: "Puis-je personnaliser la voix et l'avatar ?",
        answer:
          "Oui. Choisissez parmi une sélection de voix naturelles dans plus de 25 langues, ou parmi quatre personnages d'avatar (à partir du plan Growth). Vous pouvez aussi configurer l'accueil, le ton et le comportement pour coller à votre marque.",
      },
      "multi-language": {
        question: "Bizmis parle-t-il plusieurs langues ?",
        answer:
          "Oui. Bizmis détecte automatiquement la langue de l'acheteur et répond dans la même : plus de 25 langues, sur tous les plans. Aucune configuration par langue n'est nécessaire.",
      },
      "customize-content": {
        question: "Puis-je personnaliser ce que Bizmis dit de mes produits ?",
        answer:
          "Oui. Configurez des **règles de vente** (comment il recommande, compare, propose des montées en gamme), des **règles de support** (déclencheurs d'escalade, sujets à refuser) et une **base de connaissances** (FAQ, politiques de la boutique, précisions produit absentes de vos fiches) directement depuis l'administration intégrée.",
      },
      "multiple-clerks": {
        question: "Combien de vendeurs Bizmis puis-je activer ?",
        answer:
          "Un avec Starter, jusqu'à cinq avec Growth, en nombre illimité avec Scale et Enterprise. Chaque vendeur peut avoir sa propre voix, son avatar et ses règles, utile si vous vendez sur des collections ou des marchés distincts.",
      },
      "data-collected": {
        question: "Quelles données Bizmis collecte-t-il ?",
        answer:
          "Côté acheteurs : audio de la voix, transcriptions, navigation pendant la session et langue préférée. L'e-mail n'est collecté que si l'acheteur est connecté à votre boutique Shopify. Côté marchands : informations de la boutique, préférences de configuration et jetons d'accès Shopify nécessaires au fonctionnement de l'application.",
      },
      "train-on-data": {
        question: "Entraînez-vous des modèles d'IA sur les données des acheteurs ?",
        answer:
          "**Non.** Les enregistrements vocaux et les transcriptions ne servent jamais à entraîner un modèle d'IA, ni le nôtre ni celui de nos sous-traitants. Par défaut, AWS Bedrock n'utilise pas les données client pour entraîner ses modèles ; Anthropic n'entraîne pas ses modèles de fondation sur les données client issues de l'API ou de Bedrock ; et notre intégration ElevenLabs est configurée pour que l'audio des conversations ne serve pas à améliorer leurs modèles.",
      },
      "sub-processors": {
        question: "Qui sont vos sous-traitants ?",
        answer:
          "**ElevenLabs** pour la reconnaissance vocale, la synthèse vocale et l'orchestration de l'agent vocal. **Anthropic** (famille Claude) pour la génération des réponses, via ElevenLabs et via AWS Bedrock pour les traitements en arrière-plan. **Amazon Web Services** pour l'hébergement, le stockage et l'inférence des modèles Bedrock. **Shopify** pour le contexte boutique et client. Les durées de conservation et les régions de traitement figurent dans notre politique de confidentialité.",
      },
      "gdpr-compliant": {
        question: "Bizmis est-il conforme au RGPD ?",
        answer:
          "Oui. Bizmis agit comme sous-traitant pour le compte du marchand s'agissant des données des acheteurs ; la section 12 de nos conditions constitue un DPA au sens de l'article 28 du RGPD. Les acheteurs conservent leurs droits RGPD/CPRA : accès, rectification, effacement, limitation, portabilité. Nous traitons les webhooks de conformité obligatoires de Shopify et répondons aux demandes directes à hello@bizmis.ai. Les clauses contractuelles types de l'UE sont disponibles sur demande.",
      },
      "data-retention": {
        question: "Combien de temps conservez-vous les données de conversation ?",
        answer:
          "Les métadonnées de session sont supprimées automatiquement après 60 minutes d'inactivité. Les enregistrements et transcriptions sont conservés tant que votre installation est active. Après désinstallation, les données sont conservées pendant la fenêtre de réinstallation de 48 heures de Shopify, puis supprimées dans les 30 jours suivant le webhook shop/redact. Toute conversation peut être supprimée à la demande à tout moment.",
      },
      "shopify-only": {
        question: "Bizmis fonctionne-t-il uniquement avec Shopify ?",
        answer:
          "Oui. Bizmis est conçu spécifiquement pour Shopify et utilise ses API pour les données produits, clients, commandes et politiques. Aucun support d'autres plateformes n'est prévu à court terme.",
      },
      "what-syncs": {
        question: "Que synchronise Bizmis depuis ma boutique ?",
        answer:
          "Produits et collections, prix et remises, fiches clients (lorsqu'ils sont connectés), historique des commandes et politiques de la boutique (livraison, retours, FAQ). La synchronisation est automatique et continue : dès que vous modifiez un produit, Bizmis le voit.",
      },
      "private-testing": {
        question: "Puis-je tester Bizmis sans le montrer aux acheteurs ?",
        answer:
          "Oui. Bizmis reste masqué jusqu'à ce qu'un administrateur active son intégration au thème. Pour tester de vraies réponses en privé, dupliquez votre thème publié, activez Bizmis uniquement sur la copie non publiée et ouvrez-la avec l'aperçu de thème Shopify. Bizmis utilisera votre vrai catalogue et vos politiques, tandis que votre boutique publiée restera inchangée. L'interrupteur Pause du tableau de bord Bizmis permet de le masquer immédiatement à tout moment.",
      },
      permissions: {
        question: "Quelles autorisations Bizmis demande-t-il ?",
        answer:
          "Bizmis lit les produits, les clients, les commandes et les politiques de la boutique pour répondre aux questions de vente et d'assistance. L'accès aux politiques légales est en lecture seule, Bizmis ne peut donc pas les modifier. Le seul accès en écriture concerne Shopify Files et n'est utilisé que si vous choisissez de téléverser une image, comme votre logo, pour le t-shirt de l'avatar. Bizmis ne modifie pas les fichiers existants.",
      },
      uninstall: {
        question: "Que se passe-t-il si je désinstalle ?",
        answer:
          "Le widget s'arrête immédiatement, Shopify supprime l'extension du thème et révoque les jetons d'accès de Bizmis. Nous conservons les données de configuration et de conversation pendant la fenêtre de réinstallation de 48 heures de Shopify afin de pouvoir restaurer votre compte si vous réinstallez l'application. Shopify déclenche ensuite la suppression, et nous effaçons ces données dans un délai de 30 jours. Toute image d'avatar que vous avez téléversée reste dans vos propres Shopify Files et peut y être supprimée.",
      },
    },
  },

  contact: {
    title: "Parlons-en",
    lead: "Des questions sur Bizmis ? Écrivez-nous, nous vous répondrons dans les meilleurs délais.",
    successTitle: "Message envoyé !",
    successBody:
      "Merci de nous avoir écrit. Nous revenons vers vous au plus vite.",
    sendAnother: "Envoyer un autre message",
    errorBody:
      "L'envoi du message a échoué. Réessayez ou écrivez-nous directement à",
    nameLabel: "Votre nom",
    namePlaceholder: "Jean Dupont",
    emailLabel: "Adresse e-mail",
    emailPlaceholder: "jean@exemple.com",
    subjectLabel: "Objet",
    subjectPlaceholder: "Comment pouvons-nous vous aider ?",
    messageLabel: "Message",
    messagePlaceholder: "Détaillez votre question ou votre retour...",
    sending: "Envoi...",
    send: "Envoyer le message",
    orEmailUs: "Ou écrivez-nous directement à",
  },

  earlyAccessPage: {
    badge: (cap: number) => `Les ${cap} premières boutiques seulement`,
    titleLine1: "Rejoignez le programme",
    titleLine2: "d'accès anticipé",
    lead: (cap: number) =>
      `Seules ${cap} boutiques Shopify peuvent participer. Installez Bizmis gratuitement pendant l'accès anticipé et conservez vos avantages de membre lors du passage à un plan payant.`,
    seeLiveDemo: "Voir la démo en direct",
    bookFounderCall: "Réserver 30 min avec le fondateur",
    avatarAlt: "Invitation à l'accès anticipé Bizmis",
    benefitsBadge: "Avantages de l'accès anticipé",
    benefitsTitle: "Ce que vous obtenez",
    benefitsLead:
      "Survolez chaque carte pour voir ce que comprennent vos avantages d'accès anticipé.",
    benefits: [
      {
        title: "Gratuit en tant que membre*",
        detail:
          "Activez l'accès anticipé dans l'application et utilisez 120 conversations en conditions réelles, sans frais. Sans abonnement, sans engagement.",
      },
      {
        title: "Façonnez la feuille de route",
        detail:
          "Vos retours sont prioritaires. Les questions de vos acheteurs orientent les prochaines fonctionnalités, corrections et décisions produit.",
      },
      {
        title: "Support prioritaire",
        detail:
          "Une ligne directe avec le fondateur pour vos questions d'installation, la configuration et une aide prioritaire en tant que membre.",
      },
      {
        title: "Remises exclusives",
        detail:
          "Votre code d'accès anticipé débloque un tarif mensuel de lancement remisé lors du passage à un plan payant.",
      },
    ],
    ctaTitle: "Choisissez votre point d'entrée",
    fastestPath: "La voie la plus rapide",
    installCardBody: "Activez l'accès anticipé directement depuis l'application Shopify.",
    wantHelp: "Besoin d'aide ?",
    bookCallTitle: "Réserver un appel avec le fondateur",
    bookCallBody: "30 minutes de présentation guidée avant l'installation.",
    seeDemoFirst: "Voir d'abord la démo en direct",
    founderLed: "Projet mené par son fondateur. Des questions ?",
    footnote:
      "*Gratuit pour les membres de l'accès anticipé = 120 conversations en conditions réelles, une seule fois par boutique, sans renouvellement.",
  },

  unsubscribe: {
    confirmTitle: "Se désabonner des e-mails Bizmis ?",
    confirmBody:
      "Vous ne recevrez plus d'invitations à l'accès anticipé ni d'autres e-mails de Bizmis.",
    confirmButton: "Confirmer le désabonnement",
    processing: "Traitement de votre demande...",
    successTitle: "Vous êtes désabonné",
    successBody:
      "Vous ne recevrez plus d'e-mails de notre part. En cas d'erreur, répondez simplement à un e-mail précédent ou écrivez-nous à",
    errorTitle: "Une erreur est survenue",
    invalidLink:
      "Ce lien de désabonnement n'est pas valide. Si vous venez d'un e-mail, contactez-nous à hello@bizmis.ai.",
    genericError: "Une erreur est survenue. Merci de réessayer.",
    networkError:
      "Impossible de joindre le serveur. Réessayez ou écrivez-nous à hello@bizmis.ai.",
    tryAgain: "Réessayer",
    questions: "Des questions ?",
  },

  notFound: {
    title: "404",
    message: "Oups, page introuvable",
    backHome: "Retour à l'accueil",
  },

  seo: {
    home: {
      title: "Bizmis — Le vendeur vocal pour votre boutique Shopify",
      description:
        "Bizmis accueille vos acheteurs, répond à leurs questions et les accompagne jusqu'à l'achat, comme un excellent vendeur en boutique, 24/7 dans votre boutique Shopify.",
      jsonLdDescription:
        "Vendeur vocal pour Shopify qui accueille les acheteurs, répond à leurs questions et les accompagne jusqu'à l'achat.",
    },
    pricing: {
      title: "Tarifs Bizmis — Des plans pour toutes les boutiques Shopify",
      description:
        "Des tarifs Bizmis simples pour les boutiques Shopify de toute taille. Choisissez un plan, installez en un clic et vendez avec un vendeur vocal.",
    },
    faqs: {
      title: "FAQ Bizmis — Installation, tarifs, données et comportement",
      description:
        "Réponses aux questions fréquentes sur Bizmis : fonctionnement sur Shopify, temps d'installation, traitement des données, comportement vocal, tarifs et plus encore.",
    },
    contact: {
      title: "Contact Bizmis — Parlons-en",
      description:
        "Contactez l'équipe Bizmis pour l'installation Shopify, les intégrations sur sites sur mesure, les partenariats ou toute autre question. Nous répondons vite.",
    },
    earlyAccess: {
      title: "Accès anticipé Bizmis — gratuit pour les 50 premières boutiques Shopify",
      description:
        "Devenez membre de l'accès anticipé Bizmis : installation gratuite, ligne directe avec le fondateur, influence sur la feuille de route et remises conservées lors du passage à un plan payant. Réservé aux 50 premières boutiques Shopify.",
    },
  },
};
