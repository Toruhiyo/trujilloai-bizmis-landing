import type { Messages } from "./en";

export const it: Messages = {
  common: {
    installNow: "Installa ora",
    installOnShopify: "Installa su Shopify",
    installOnYourStore: "Installa nel tuo negozio",
    installBizmisOnShopify: "Installa Bizmis su Shopify",
    liveDemo: "Demo",
    bookACall: "Prenota una call",
    getStarted: "Inizia",
    contactSupport: "Contatta il supporto",
    contactSales: "Parla con le vendite",
    soon: "Presto",
    email: "hello@bizmis.ai",
  },

  languageSwitcher: {
    label: "Lingua",
    ariaLabel: "Scegli la lingua",
  },

  nav: {
    earlyAccess: "Accesso anticipato",
    benefits: "Vantaggi",
    setup: "Installazione",
    pricing: "Prezzi",
    faqs: "FAQ",
    openMenu: "Apri il menu",
    closeMenu: "Chiudi il menu",
  },

  hero: {
    badgeLabel: "Accesso anticipato",
    badgeDetailShort: "Primi 50 negozi",
    badgeDetailLong: "Gratis per i primi 50 negozi Shopify",
    titleLine1: "Il miglior venditore",
    // Non-breaking space keeps "ora online" together if this line wraps.
    titleLine2: "del tuo negozio, ora\u00A0online",
    subtitleLead: "Aiuta ogni cliente a",
    subtitleFind: "trovarlo",
    subtitleTrust: "fidarsi",
    subtitleBuy: "comprarlo",
    subtitleConnector: " e a",
    pitchLead: "Non è un chatbot.",
    pitchShort:
      "I clienti se ne vanno quando non trovano il prodotto giusto o hanno un ripensamento prima di comprare, proprio i momenti in cui interverrebbe un commesso in negozio. Bizmis porta quell'aiuto online, prima di tutto con la voce, restringendo il catalogo al prodotto giusto e sciogliendo i dubbi perché comprino con fiducia.",
    pitchLong:
      "I clienti se ne vanno quando non trovano il prodotto giusto o hanno un ripensamento prima di comprare, proprio i momenti in cui interverrebbe un commesso in negozio. Bizmis porta quell'aiuto online, prima di tutto con la voce. Ascolta, restringe il catalogo al prodotto giusto e scioglie i dubbi, così comprano con fiducia.",
    installSubline: "Installazione in un clic, pronto in pochi minuti",
    alsoAvailableFor: "Disponibile anche per i",
    customWebsites: "siti su misura",
    ratherTalk: "Preferisci parlarne?",
    avatarAlt: "Assistente alle vendite digitale che aiuta i clienti",
    agentHello: "Ciao! Sono il tuo agente di vendita Bizmis.",
    agentPitch: "Capisco i bisogni di ogni cliente, sciolgo i suoi dubbi e ti porto la vendita.",
    agentInvite: "Premi play e guardami vendere!",
  },

  film: {
    watch: "Guarda il film",
    replay: "Riguarda",
    play: "Riproduci",
    pause: "Pausa",
    mute: "Disattiva audio",
    unmute: "Attiva audio",
    enterFullscreen: "Schermo intero",
    exitFullscreen: "Esci da schermo intero",
    seek: "Cerca",
    region: "Film di Bizmis",
    quality: "Qualità",
    auto: "Auto",
    close: "Chiudi il video",
  },

  /** The film-led landing (/v2): copy it adds to the classic landing's messages. */
  landing: {
    /** The hero's line under the title (the classic keeps hero.subtitle*): the last part is the merchant's win, highlighted. */
    heroLine: ["Capisci i bisogni.", "Sciogli i dubbi.", "Conquista vendite."],
    /** Under the hero's Install button (the classic landing keeps hero.installSubline). */
    installSubline: "Installazione con un clic, pronta subito",
    switch: {
      chatbot: "Chatbot",
      agent: "Agente di vendita",
      toggleAria: "Confronta un chatbot tipico con l'agente di vendita Bizmis",
      chatbotMessage: "Ciao! Come posso aiutarti oggi?",
      chatbotReply: "Ecco alcuni link che potrebbero aiutarti.",
      agentMessage: "Cerchi un regalo? Dimmi per chi è e trovo quello giusto.",
      /** What the shopper does: with a chatbot, then with the Bizmis sales agent. */
      shopper: "Il tuo cliente",
      chatbotOutcome: ["Non lo trova", "Dubita", "Se ne va"],
      agentOutcome: ["Lo trova", "Si fida", "Lo compra"],
      /** The shopper's patience while using the chatbot: it drains with every reply. */
      patience: {
        label: "Pazienza del cliente",
        reading: "+{s} s di lettura",
        stages: ["Legge un muro di testo…", "Scorre in fretta. Ancora nessuna risposta.", "Apre la scheda di un concorrente…", "Scrive \"voglio parlare con una persona\"…", "Sparito."],
        leftTitle: "Il cliente se n'è andato.",
        leftBody: "Vendita persa. Nessuno se n'è accorto.",
        cta: "Prova l'agente di vendita",
      },
      /** The typical chatbot, interactive: verbose, dull, useless to sell. */
      bot: {
        title: "Chatbot",
        hint: "Dai, chiedigli qualcosa",
        placeholder: "Scrivi il tuo messaggio...",
        send: "Invia",
        open: "Apri la chat",
        close: "Chiudi la chat",
        greeting: "Ciao! 👋 Sono il tuo assistente virtuale. Come posso aiutarti oggi? Scegli una delle opzioni qui sotto o scrivi la tua domanda.",
        chips: ["Traccia ordine", "Resi", "Contattaci"],
        helpful: "Ti è stato utile?",
        product: "Grazie per il tuo messaggio! Questo prodotto fa parte della nostra collezione più venduta ed è un'ottima scelta per molte occasioni. Tutti i dettagli, inclusi materiali, dimensioni e istruzioni per la cura, si trovano nella descrizione del prodotto. Tieni presente che i tempi di consegna possono variare in base alla tua posizione e al metodo di spedizione scelto al checkout. Per informazioni su cambi e rimborsi, consulta la nostra pagina Politica di reso. Il nostro team di assistenza risponde di solito entro 2–3 giorni lavorativi. Posso aiutarti con qualcos'altro oggi?",
        productLinks: ["Politica di reso", "Informazioni sulla spedizione"],
        track: "Per tracciare il tuo ordine, inserisci il numero d'ordine e l'indirizzo email usato al checkout nella nostra pagina Tracciamento ordini. Il numero d'ordine inizia con # e lo trovi nell'email di conferma. Le informazioni di tracciamento possono richiedere 24–48 ore per aggiornarsi dopo la spedizione. Se non hai ricevuto l'email di conferma, controlla la cartella spam.",
        trackLinks: ["Tracciamento ordini"],
        returns: "Accettiamo resi entro 30 giorni dalla consegna, a condizione che gli articoli siano inutilizzati, non lavati e nella confezione originale con tutte le etichette. Gli articoli in saldo, le carte regalo e i prodotti personalizzati non sono rimborsabili. Per avviare un reso, visita il nostro Portale resi. I rimborsi vengono emessi sul metodo di pagamento originale entro 5–10 giorni lavorativi dalla ricezione e dal controllo del reso. Le spese di spedizione del reso non sono rimborsabili.",
        returnsLinks: ["Portale resi"],
        contact: "Il nostro servizio clienti è disponibile dal lunedì al venerdì, dalle 9:00 alle 17:00, esclusi i giorni festivi. Scrivici via email indicando il numero d'ordine nell'oggetto. Cerchiamo di rispondere a tutte le richieste entro 2–3 giorni lavorativi. Grazie per la pazienza!",
        contactLinks: ["Modulo di contatto"],
        human: "Mi dispiace, al momento non ci sono operatori disponibili. Lasciaci il tuo indirizzo email e un membro del nostro team ti risponderà entro 2–3 giorni lavorativi.",
        confused: "Mi dispiace, non ho capito bene. Potresti riformulare la domanda? Puoi anche scegliere una delle opzioni qui sotto.",
        thanks: "Grazie per il tuo feedback! Lavoriamo costantemente per migliorare il nostro servizio.",
      },
    },
    /** The film's end-card scarcity line. */
    onlySpots: "Solo 50 posti!",
    /** The personalization carousel. */
    carousel: { label: "Scegli un avatar", prev: "Avatar precedente", next: "Avatar successivo" },
    yourStore: "Il tuo negozio",
    agentAlt: "L'avatar dell'agente di vendita Bizmis",
    /** UI text of the real widget, as it appears in the mockups. */
    widget: {
      placeholder: "Aiutami a trovare il prodotto giusto.",
      takingYouTo: "Ti porto a",
      addingToCart: "Aggiunta al carrello",
      searchResults: "Risultati della ricerca",
      cartItem: "Sfera",
    },
    /** Boost Sales on /v2: the title stays on screen while each sub-benefit lights up its part (find it / trust it / buy it). */
    sales: {
      titleLead: "",
      titleParts: ["Capisci i bisogni.", "Sciogli i dubbi.", "Conquista vendite."],
      stages: ["Scoperta", "Decisione", "Pagamento"],
      panels: [
        { title: "Più clienti trovano quello giusto", body: "Riduce il catalogo ai pochi prodotti giusti." },
        { title: "I dubbi diventano decisioni", body: "Confronta, consiglia e risponde a ogni dubbio." },
        { title: "I carrelli diventano ordini", body: "Chiarisce gli ultimi dubbi e li accompagna al pagamento." },
      ],
      payoff: { kicker: "Tutto insieme", title: "Visite che diventano vendite.", body: "Niente stanchezza. Niente blocchi. Niente esitazioni.", jar: "Vendite" },
      findQuery: "Un regalo per mia sorella, sotto i 50 €",
      findCaption: "Eccone tre che adorerà.",
      compareQuery: "Quale prendo?",
      compareCaption: "Questo. È il più leggero e il più apprezzato.",
      bestMatch: "Il migliore",
      decided: "Nel carrello",
      buyQuery: "Arriva entro venerdì?",
      buyCaption: "Sì, parte oggi e il reso è gratuito. Andiamo al pagamento?",
      /** Each beat's words: the merchant's loss, struck through at the fix, then the win written in. No figures. */
      flip: [
        { problem: "I visitatori che sfogliano il tuo catalogo [[si stancano e mollano]].", fix: "I visitatori che sfogliano il tuo catalogo [[trovano subito prodotti che valgono l'acquisto]]." },
        { problem: "I clienti che confrontano le opzioni [[si bloccano e se ne vanno]].", fix: "I clienti che confrontano le opzioni [[scelgono con sicurezza]]." },
        { problem: "I clienti pronti a comprare [[esitano e rimandano]].", fix: "I clienti pronti a comprare [[si decidono e vanno al pagamento]]." },
      ],
      openers: ["I visitatori che vogliono il prodotto giusto", "Gli acquirenti indecisi tra le opzioni", "Gli acquirenti con il carrello pieno"],
      /** ?beat=1..6: the small labels of the alternative loss → win looks. */
      flipLabels: { lose: "Perdi", win: "Vinci", you: "Tu, oggi", withBizmis: "Con Bizmis" },
      /** ?beat=4: each loss as the merchant says it (the speech bubble). */
      flipQuote: [
        "I clienti si stancano di cercare nel mio catalogo e comprano gli stessi prodotti da un concorrente.",
        "I miei clienti indecisi vanno a confrontare e diventano clienti di un altro.",
        "I clienti arrivano al pagamento, hanno un ultimo dubbio e se ne vanno.",
      ],
      /** The one-shopper variant (?case=one): the same shopper and gift from Find through Trust to Buy. */
      caseOne: {
        compareQuery: "Quale dei tre le piacerà di più?",
        compareCaption: "Questo. È il più apprezzato dei tre.",
        buyQuery: "Arriva prima del suo compleanno, venerdì?",
        buyCaption: "Sì, parte oggi e il reso è gratuito. Andiamo al pagamento?",
      },
      cart: { title: "Il tuo carrello", add: "Aggiungi al carrello", subtotal: "Subtotale", checkout: "Pagamento", perks: ["Spedito oggi", "Reso gratuito"], placed: "Ordine effettuato" },
      funnel: {
        problems: ["Smettono di cercare", "Vanno a confrontare", "Abbandonano il carrello"],
        solutions: ["Trovano subito", "Decidono qui", "Comprano"],
        /** The word at the open mouth, with its arrow: the dots are store visits. */
        visits: "visite",
      },
      /** ?win=4..6: the metrics merchants know, drawn moving the right way as stages get fixed (no figures). */
      metrics: {
        conversion: "Tasso di conversione",
        orders: "Ordini",
        abandoned: "Carrelli abbandonati",
        ordersToday: "Ordini di oggi",
        before: "prima",
        after: "dopo",
      },
      pulse: { currency: "EUR" },
    },
    support: {
      title: "Taglia il carico di supporto.",
      titleTail: "Giorno e notte.",
      /** The area's full name, the chapter eyebrow over the outcome (the pillar openers, ?open=1..6). */
      area: "Assistenza clienti",
      lead: "Risponde a ogni cliente, giorno e notte, con il calore del tuo miglior commesso.",
      /** The support mockup's widget placeholder (the composer's prompt before the shopper types). */
      placeholder: "Chiedimi del tuo ordine.",
      /** The pillar's animation, the merchant's support at scale: questions round the clock piling up as tickets, then answered
       * right away by voice once the agent lands. One label, as the Sales funnel's: the loss, struck at the fix, then the win (short, present tense). */
      day: {
        label: "Domande dei clienti a ogni ora: si accumulano come ticket nella casella assistenza finché arriva l'agente, poi ognuna riceve risposta subito, a voce",
        problem: "I ticket si accumulano",
        solution: "Risposta immediata",
        inbox: "Casella assistenza",
      },
      options: {
        sky: { label: "Le domande dei clienti arrivano giorno e notte; ricevono risposta a voce prima della casella assistenza, che resta libera", problem: "La casella trabocca", solution: "Casella libera, giorno e notte" },
        clock: { label: "Le domande dei clienti arrivano da ogni parte e si accumulano nella casella assistenza; quando l'agente le prende al volo, la pila smette di crescere", problem: "Le domande si accumulano", solution: "La pila smette di crescere" },
        morning: { label: "Domande tutta la notte, con risposta a voce appena arrivano: il commerciante si sveglia con la casella vuota", problem: "Domande tutta la notte", solution: "Ti svegli con la casella vuota" },
      },
    },
    insights: {
      title: "Scopri cosa vende.",
      titleTail: "Sistema il resto.",
      /** The area's full name, the chapter eyebrow over the outcome (the pillar openers, ?open=1..6). */
      area: "Dati del negozio",
      lead: "Ogni conversazione diventa un passo successivo chiaro.",
      clarity: {
        snippets: ["Spedite in Canada?", "Taglia M o L?", "Resi?", "Confezione regalo?"],
        topAsk: "Domanda n.1: spedizioni",
      },
      options: {
        why: {
          label: "Tante sessioni finite senza acquisto, riviste in un colpo: emerge cosa le bloccava",
          problem: "Perché non comprano?",
          reasons: ["Un pop-up copre il carrello", "La ricerca non trova nulla", "La spedizione appare troppo tardi", "La pagina è troppo lenta", "Vanno a caccia di coupon"],
        },
        carts: { label: "Una settimana di carrelli abbandonati, esaminata giorno per giorno, si riduce a un motivo", problem: "Carrelli abbandonati tutta la settimana", solution: "Il motivo: le taglie" },
        week: { label: "Una settimana di conversazioni, ordinata in un'unica immagine di cosa vogliono i clienti", problem: "Troppe da leggere", solution: "Cosa vogliono i clienti" },
      },
    },
    /** Boost Sales's area, the chapter eyebrow over its outcome (its outcome is already "Boost Sales"). */
    salesArea: "Vendite",
    customize: {
      lead: "Scegli il suo aspetto e metti il tuo logo sulla sua maglietta.",
      avatar: { title: "Il tuo avatar", body: "Scegli un volto adatto al tuo brand." },
      voice: { title: "La tua voce", body: "Clonala perché parli come te." },
    },
    /** The closing card, as the film's: the title is the install button, then the handwritten invite and, apart, the note. */
    endCard: {
      install: "Installa ora",
      invite: "per i vantaggi Early Access!",
      note: "Solo 50 posti!",
      /** The ad-1 film's Early Access perks, then the quieter extras under them. */
      perks: ["120 sessioni gratuite", "50% di sconto sugli upgrade", "Decidi la roadmap con noi"],
      extras: ["Nessuna carta", "Nessun vincolo", "Linea diretta con il fondatore"],
    },
    setup: {
      title: "Installazione con un clic",
      lead: "Un clic e il tuo agente vende già. Cambia qualsiasi cosa nel negozio e lo sa subito.",
      install: "Installa",
      storeTitle: "Il tuo negozio online",
      syncing: "Sincronizzazione del negozio",
      synced: "Sincronizzato",
      readyNow: "Pronto subito",
    },
  },

  benefits: {
    sales: {
      badge: "Più vendite",
      title: "Converti. Aumenta. Fidelizza.",
      leadShort:
        "Un ottimo commesso che guida i clienti, aumenta il valore del carrello e li fa tornare.",
      leadLong:
        "Bizmis si comporta come un ottimo commesso in negozio: guida i clienti, aumenta il valore del carrello e crea quell'esperienza calda e personale che fa tornare le persone.",
      pillars: [
        {
          title: "Converti più visitatori",
          subtitle: "Elimina le esitazioni all'acquisto",
          body: "Bizmis risponde all'istante e guida ogni cliente verso il prodotto giusto, così più visitatori si sentono pronti a comprare.",
        },
        {
          title: "Aumenta il valore dell'ordine",
          subtitle: "Upsell e accessori pertinenti",
          body: "Consigli mirati, versioni superiori e prodotti complementari emergono in modo naturale durante la conversazione.",
        },
        {
          title: "Costruisci fedeltà",
          subtitle: "Un'esperienza d'acquisto personale",
          body: "Un'esperienza d'acquisto calda e personale che i clienti ricordano e per cui tornano.",
        },
      ],
    },
    support: {
      badge: "Assistenza clienti",
      titleLine1: "Risparmia ore di assistenza.",
      titleLine2: "Conquista clienti fedeli.",
      leadShort:
        "Assistenza immediata ed empatica 24/7 che sembra umana: più soddisfazione e ore di lavoro risparmiate.",
      leadLong:
        "Intelligenza emotiva e assistenza immediata 24/7 migliorano la soddisfazione dei clienti con risposte rapide, calde ed empatiche, come l'aiuto di un bravo commesso, risparmiando tempo prezioso di supporto.",
      outcomes: {
        saveHours: "Risparmia ore di supporto",
        betterReviews: "Ottieni recensioni migliori",
        repeatSales: "Aumenta gli acquisti ripetuti",
      },
      capabilities: [
        {
          title: "Assistenza immediata 24/7",
          tagline: "Nessuna attesa, nessuna frustrazione",
          body: "I clienti ricevono aiuto nel momento esatto in cui serve: senza attese, senza frustrazione e senza recensioni negative per domande rimaste senza risposta.",
        },
        {
          title: "Conoscenza del negozio",
          tagline: "Politiche, prodotti e documenti in un attimo",
          body: "Risponde all'istante su politiche, prodotti e documentazione, così i clienti hanno indicazioni chiare senza aspettare il tuo team.",
        },
        {
          title: "Intelligenza emotiva",
          tagline: "Risposte calde ed empatiche",
          body: "Un'IA che comprende le emozioni dei clienti e risponde con attenzione autentica.",
        },
      ],
    },
    insights: {
      badge: "Dati del negozio",
      title: "Impara. Ottimizza. Cresci.",
      lead: "Scopri dove i clienti esitano, cosa chiedono e quali percorsi convertono, così correggi meno, risparmi ore e investi dove cresce il fatturato.",
      features: [
        {
          title: "Replay delle sessioni",
          tagline: "Vai dritto agli abbandoni",
          body: "Vai dritto ai punti di abbandono e di esitazione. Correggi una volta, previeni i carrelli abbandonati e recuperi le vendite a rischio.",
        },
        {
          title: "Conversazioni etichettate",
          tagline: "Una correzione, meno ticket ripetuti",
          body: "Le conversazioni si raggruppano da sole per tema e intento. Aggiorna una FAQ o una politica, riduci i ticket ricorrenti e alleggerisci il supporto.",
        },
        {
          title: "Analisi del funnel",
          tagline: "Individua a colpo d'occhio cosa rende",
          body: "Vedi percorsi di conversione, abbandoni e impatto per prodotto a colpo d'occhio. Dai priorità a ciò che rende di più e punta su ciò che funziona.",
        },
      ],
    },
  },

  salesDemo: {
    steps: ["Scopri e consiglia", "Confronta i prodotti", "Chiudi la vendita"],
    recommended: "Consigliato",
    added: "Aggiunto",
    orderConfirmed: "Ordine confermato",
    subtotal: "Subtotale",
    shipping: "Spedizione",
    free: "Gratuita",
    total: "Totale",
    assistantAlt: "Assistente Bizmis",
    deliveryEstimate: "Consegna in 2-3 giorni",
    productLabels: {
      cozyPick: "Scelta accogliente",
      proPick: "Scelta pro",
      greatValue: "Ottimo rapporto qualità-prezzo",
      recurring: "Abbonamento",
      onTheGo: "Da viaggio",
      calming: "Rilassante",
    },
    productNames: {
      cozyCandles: "Set di candele accoglienti",
      frenchPress: "Kit caffettiera a pressa",
      ethiopianBeans: "Caffè etiope in grani",
      roastSubscription: "Abbonamento caffè tostato",
      travelMug: "Tazza da viaggio",
      scentedCandles: "Candele profumate",
    },
    shopperQuotes: {
      birthdayGift: '"Cerco un regalo di compleanno."',
      morningRoutine: '"Aiutami a costruire la mia routine mattutina."',
      cozyForMom: '"Qualcosa di accogliente per mia madre."',
      campingCoffee: '"Mi serve del caffè per il campeggio."',
    },
  },

  supportDemo: {
    steps: ["Domanda ricevuta", "Fonte verificata", "Risolto"],
    done: "Fatto",
    processing: "In corso",
    assistantAlt: "Assistente supporto Bizmis",
    cases: {
      returnPolicy: {
        quote: '"Posso restituirlo se non mi va bene?"',
        action: "Politica consultata",
        response:
          "Certo, hai 30 giorni. Se ti serve ti guido passo passo.",
      },
      orderTracking: {
        quote: '"Dov\'è il mio ordine?"',
        action: "Ordine tracciato",
        response:
          "È partito ieri e dovrebbe arrivare lunedì. Ti mando il link di tracciamento?",
      },
      shippingTime: {
        quote: '"Quanto tempo richiede la consegna?"',
        action: "Spedizione verificata",
        response:
          "Di solito 2-3 giorni lavorativi. Posso anche mostrarti opzioni più rapide.",
      },
      changeAddress: {
        quote: '"Ho inserito l\'indirizzo di spedizione sbagliato."',
        action: "Indirizzo aggiornato",
        response:
          "Nessun problema, posso aggiornarlo prima che l'ordine parta.",
      },
      cancelOrder: {
        quote: '"Posso annullare il mio ordine?"',
        action: "Ordine annullato",
        response: "Sì, non è ancora stato elaborato. Posso annullarlo subito.",
      },
      warranty: {
        quote: '"C\'è una garanzia su questo?"',
        action: "Garanzia confermata",
        response: "Sì, tutto include una garanzia di 2 anni.",
      },
      startReturn: {
        quote: '"Voglio restituire questo articolo."',
        action: "Reso avviato",
        response: "Certo. Posso avviare il reso per te.",
      },
    },
  },

  sessionReplay: {
    categories: {
      sale: "Vendita",
      support: "Supporto",
    },
    tabTooltips: {
      sale: "Sessione di vendita anonima, ricerca di un regalo conclusa con un acquisto",
      saleLoyal: "Sessione di vendita con utente autenticato, cliente di ritorno",
      supportSuccess: "Sessione di supporto, domanda sulle politiche risolta",
      supportFailed: "Sessione di supporto, richiesta non completata",
    },
    successful: "Risolta",
    unresolved: "Non risolta",
    anonymousCustomer: "Cliente anonimo",
    customer: "Cliente",
    vip: "VIP",
    transcriptNote: "Sessione registrata, lingua originale",
  },

  setup: {
    badge: "Pronto all'uso",
    title: "Installazione in un clic, vendite e assistenza immediate",
    lead: "Installa l'app Bizmis per Shopify e inizia subito a vendere e ad assistere i clienti.",
    storeDataTitle: "I dati del tuo negozio Shopify",
    dataCards: [
      { title: "Sito del negozio", description: "Visione, missione e valori" },
      {
        title: "Catalogo prodotti",
        description: "Collezioni, magazzino, ordini di acquisto",
      },
      { title: "Sconti", description: "Tutte le promozioni attive" },
      {
        title: "Politiche",
        description: "Spedizioni, resi e politiche del negozio",
      },
      {
        title: "Clienti",
        description: "Storico di vendite e assistenza per cliente",
      },
      { title: "Ordini", description: "Storico degli ordini" },
    ],
    badges: {
      oneClick: "Installazione in un clic",
      alwaysSynced: "Sempre sincronizzato",
      readyInMinutes: "Pronto in pochi minuti",
    },
    ctaNote: "Inizia subito a vendere e ad assistere i clienti.",
  },

  customization: {
    badge: "Personalizzazione",
    titleLead: "Rendilo",
    titleHighlight: "davvero tuo",
    lead: "Costruisci relazioni autentiche che fidelizzano, personalizzando voce e aspetto.",
    avatar: {
      title: "Avatar personale",
      body: "Crea connessioni autentiche dando al tuo venditore la tua voce e il tuo aspetto.",
    },
    voiceCloning: {
      title: "Clonazione della voce",
      body: "Interazioni autentiche grazie alla riproduzione del tuo modo di parlare e della tua personalità.",
    },
    imageAlt: "Spazio di personalizzazione: voce e aspetto",
  },

  finalCta: {
    title: "Installa su Shopify in 1 clic. Inizia a vendere oggi.",
    lead: "Bizmis accoglie i visitatori, risponde alle loro domande e li accompagna al checkout, in piena sincronia con prodotti, sconti e ordini di Shopify.",
    bullets: [
      "Accoglie e qualifica i clienti",
      "Confronta i prodotti e consiglia",
      "Gestisce l'assistenza e riduce i ticket",
    ],
    installAria: "Installa Bizmis su Shopify",
    bookCallAria: "Prenota una call con il team Bizmis",
    cancelAnytime: "Disdici quando vuoi",
    gdprReady: "Conforme al GDPR",
    builtForShopify: "Built for Shopify",
  },

  earlyAccessCard: {
    badge: "Accesso anticipato",
    titleLead: "Arriva per primo.",
    titleHighlight: "Vendi di più.",
    lead: "Unisciti al gruppo esclusivo dei primi 50 merchant che stanno definendo il futuro del commercio conversazionale.",
    perks: [
      {
        title: "50% di sconto per i primi 3 mesi",
        caption: "Blocca il nostro prezzo di lancio più basso.",
      },
      {
        title: "Influenza diretta sulla roadmap",
        caption: "Le tue richieste di funzionalità hanno la priorità.",
      },
      {
        title: "Onboarding VIP",
        caption: "Sessione personale di configurazione e avvio inclusa.",
      },
    ],
    limitedSpots: "Posti limitati",
    cta: "Approfitta dell'accesso anticipato",
  },

  footer: {
    tagline:
      "Il miglior venditore del tuo negozio, attivo 24/7 per aumentare le vendite, assistere i clienti e capirli meglio.",
    builtFor: "Creato per",
    columns: {
      product: "Prodotto",
      support: "Supporto",
      legal: "Note legali",
    },
    links: {
      features: "Funzionalità",
      pricing: "Prezzi",
      demo: "Demo",
      contact: "Contatti",
      bookACall: "Prenota una call",
      faqs: "FAQ",
      privacy: "Informativa sulla privacy",
      terms: "Termini di servizio",
    },
    legalNotice: "Le pagine legali sono disponibili in inglese.",
    copyright: (year: number) => `© ${year} Bizmis. Tutti i diritti riservati.`,
  },

  pricing: {
    badge: "Prezzi",
    title: "Prezzi semplici e trasparenti",
    lead: "Scegli il piano adatto alla tua attività. Tutti includono l'integrazione Shopify completa.",
    monthly: "Mensile",
    yearly: "Annuale",
    billedYearly: "fatturato annualmente",
    perMonth: "/mese",
    popular: "Popolare",
    conversationsPerMonth: "sessioni / mese",
    extraConversations: (price: string) =>
      `Sessioni extra a ${price} l'una, fino al limite di spesa che imposti`,
    conversationDefinition:
      "Una sessione è la visita di un cliente al tuo venditore, a voce o per iscritto. Le sessioni oltre i 5 minuti di voce o i 40 messaggi contano come due. Le visite in cui il cliente non dice nulla sono gratuite.",
    off: "di sconto",
    discountTitle: (percent: number) => `${percent}% in meno rispetto al listino`,
    introPeriodTitle: "Periodo di lancio scontato",
    introMonths: (months: number, standardPrice: string) =>
      `${months === 1 ? "primo mese" : `primi ${months} mesi`}, poi $${standardPrice}/mese`,
    free: {
      name: "Gratis",
      noCommitment: "Nessun vincolo",
      description: (conversations: string) =>
        `${conversations} sessioni gratuite per provare Bizmis. Senza carta.`,
      cta: "Inizia gratis",
    },
    plans: {
      starter: {
        name: "Starter",
        features: [
          "1 venditore Bizmis",
          "Voce e testo",
          "Supporto: e-mail (48 h)",
        ],
      },
      growth: {
        name: "Growth",
        features: [
          "Fino a 5 venditori Bizmis",
          "Storico, trascrizioni e replay",
          "Personalizzazione dell'avatar",
          "Supporto: e-mail (24 h) e call programmata",
        ],
      },
      scale: {
        name: "Scale",
        features: [
          "Venditori Bizmis illimitati",
          "Sessioni etichettate automaticamente",
          "Supporto prioritario e onboarding dal vivo",
        ],
      },
    },
    enterprise: {
      name: "Enterprise",
      priceFrom: "Da",
      description:
        "Soluzioni su misura per operazioni su larga scala, con volumi e requisiti personalizzati.",
      everythingInScale: "Tutto il piano Scale, più:",
      features: [
        "Volume di sessioni su misura",
        "Capacità garantita per i picchi di traffico",
        "SLA e voce personalizzata",
        "Fatturazione al di fuori di Shopify",
      ],
    },
    guarantees: {
      spendLimit: "Decidi tu il limite di spesa",
      cancelAnytime: "Disdici quando vuoi",
      moneyBack: "Garanzia di rimborso entro 30 giorni sui piani annuali",
      cardNote: "Soddisfatti o rimborsati per 30 giorni sul piano annuale",
      bannerTitle: "Prova un piano annuale senza rischi per 30 giorni",
      bannerBody: "Se Bizmis non ne vale la pena nei primi 30 giorni del tuo piano annuale, annulla e ti rimborsiamo per intero il primo pagamento annuale. Senza domande.",
    },
    coupon: {
      prompt:
        "Hai un codice sconto? Inseriscilo e premi Invio o Applica per aggiornare i prezzi qui sopra.",
      placeholder: "Codice sconto",
      inputAria: "Codice coupon sconto",
      apply: "Applica",
      applying: "Applicazione…",
      remove: "Rimuovi il coupon",
      active: (label: string) => `${label} attivo`,
      viewingPricing: (label: string, cap: number) =>
        `Stai vedendo i prezzi ${label}, riservati ai nostri primi ${cap} merchant.`,
      shapeProduct:
        "Aiutaci a definire il prodotto con i tuoi riscontri sulla roadmap. I prezzi qui sopra includono",
      monthlyDiscount: (percent: number, months: number) =>
        months > 0
          ? `${percent}% di sconto ${months === 1 ? "sul primo mese" : `sui primi ${months} mesi`}`
          : `${percent}% di sconto`,
      discountEnd: ".",
      onMonthlyBilling: "con fatturazione mensile, oppure",
      yearlyDiscount: (percent: number) => `${percent}% di sconto sull'annuale`,
      whenYearlySelected: "se scegli la fatturazione annuale.",
      errors: {
        empty: "Inserisci prima un codice.",
        notFound: "Questo codice non è valido.",
        expired: "Questo codice è scaduto.",
        notYetActive: "Questo codice non è ancora attivo.",
        invalidFormat: "Il formato del codice non torna, controlla se ci sono errori.",
        alreadyClaimed: "Questo codice è già stato utilizzato.",
        invalidToken: "Sessione scaduta. Riprova.",
        generic: "Non riusciamo a verificare il codice adesso. Riprova.",
      },
    },
    viewAllFaqs: "Vedi tutte le domande frequenti",
    enterpriseInquirySubject: "Richiesta piano Enterprise",
  },

  faqsPage: {
    title: "Tutto quello che c'è da sapere su Bizmis",
    lead: "Le risposte alle domande più frequenti sul nostro assistente alle vendite per Shopify",
    searchPlaceholder: "Cerca nelle FAQ...",
    searchAria: "Cerca nelle FAQ",
    allQuestions: "Tutte le domande",
    noResults: "Nessuna domanda corrisponde alla tua ricerca.",
    stillHaveQuestions: "Hai ancora dubbi?",
    teamIsHere:
      "Il nostro team è qui per aiutarti a ottenere il massimo da Bizmis.",
  },

  faqs: {
    categories: {
      "getting-started": "Primi passi",
      "what-bizmis-does": "Cosa fa Bizmis",
      "pricing-billing": "Prezzi e fatturazione",
      customization: "Personalizzazione",
      "privacy-data": "Privacy e dati",
      "shopify-integration": "Integrazione con Shopify",
    },
    items: {
      "what-is-bizmis": {
        question: "Che cos'è Bizmis?",
        answer:
          "Bizmis è un commesso IA vocale per Shopify. Accoglie i clienti, risponde alle domande su prodotti, ordini, resi e politiche e li accompagna verso il checkout, come farebbe un commesso esperto in negozio. Funziona 24/7 nel tuo negozio sotto forma di un piccolo widget vocale.",
      },
      "is-chatbot": {
        question: "Bizmis è un chatbot?",
        answer:
          "No. Bizmis funziona prima di tutto con la voce, non con il testo. Il cliente parla, Bizmis risponde e la conversazione scorre come un vero scambio con un commesso, non come un albero di dialogo prestabilito. Il widget mostra una trascrizione per rileggere quanto detto, ma l'interazione principale resta vocale.",
      },
      "how-fast-start": {
        question: "Quanto ci vuole per iniziare?",
        answer:
          "Un clic per installarlo dallo Shopify App Store. Bizmis sincronizza automaticamente prodotti, collezioni, politiche e FAQ del tuo negozio. Nessuna configurazione manuale, nessun addestramento di modelli, nessuno sviluppo. La maggior parte dei negozi è operativa in pochi minuti.",
      },
      "when-see-value": {
        question: "Quando inizierò a vedere i risultati?",
        answer:
          "Dalla prima conversazione. Bizmis è attivo appena finisce l'installazione e inizia subito ad aiutare i clienti.",
      },
      "what-it-does": {
        question: "Cosa fa concretamente Bizmis?",
        answer:
          "Tre cose. **Vendite:** accoglie i clienti, qualifica l'intento, consiglia prodotti e li accompagna al checkout. **Assistenza:** gestisce stato degli ordini, spedizioni, resi, politiche e FAQ a qualsiasi ora. **Analisi:** replay delle sessioni, percorsi etichettati automaticamente e analisi del funnel per vedere cosa chiedono, cosa vogliono e su cosa abbandonano i tuoi clienti.",
      },
      "place-orders": {
        question: "Bizmis effettua ordini o incassa pagamenti?",
        answer:
          "No. Checkout, pagamenti, rimborsi e modifiche agli ordini restano su Shopify e sui tuoi flussi esistenti. Bizmis fornisce informazioni e guida le decisioni, ma non completa mai una transazione né modifica un ordine al posto del cliente.",
      },
      "cart-management": {
        question: "Bizmis gestisce i carrelli o recupera quelli abbandonati?",
        answer:
          "Il carrello sì. Quando il cliente dice sì, Bizmis aggiunge gli articoli al carrello del tuo negozio e il contatore si aggiorna subito. Segnala le opzioni esaurite, propone un'alternativa e può portare il cliente al carrello o al checkout. Non invia email di carrello abbandonato, ma riprende la conversazione da dove si era fermata quando il cliente cambia pagina.",
      },
      "feels-human": {
        question: "L'assistente sembrerà umano?",
        answer:
          "Sì. Tono, ritmo, espressività e calore sono pensati per ricordare un vero commesso, non una voce robotica. I clienti sanno di parlare con un'IA, Bizmis lo dichiara subito come previsto dall'AI Act europeo, ma l'esperienza resta conversazionale, non transazionale.",
      },
      "insights-analytics": {
        question: "Quali dati ottengo?",
        answer:
          "Una dashboard con replay delle sessioni, trascrizioni, temi etichettati automaticamente (Vendite / Supporto / Sconosciuto), esiti (Risolto / Escalation / Non risolto) ed eventi del funnel (prodotti mostrati, prodotti discussi, intenzione di acquisto). Vedi cosa vogliono davvero i clienti, dove esitano e a cosa il tuo negozio non risponde bene.",
      },
      "review-conversations": {
        question: "Posso rivedere le conversazioni passate?",
        answer:
          "Sì. Storico, trascrizioni e replay sono disponibili dal piano Growth in su. Puoi scorrere qualsiasi conversazione, leggere la trascrizione ed etichettare le tendenze per affinare le regole di vendita e assistenza.",
      },
      "how-much-cost": {
        question: "Quanto costa Bizmis?",
        answer:
          "Tre piani più Enterprise, con fatturazione mensile, oppure annuale con circa il 20% di sconto. **Starter** ($79/mese, 260 sessioni) per negozi individuali o piccoli. **Growth** ($199/mese, 660 sessioni) per negozi in crescita, il più scelto. **Scale** ($499/mese, 1.650 sessioni) per negozi ad alto volume. **Enterprise** da $1.500/mese, con volumi su misura, capacità garantita per i picchi di traffico e SLA. Ogni sessione extra costa $0,30, fino al limite di spesa che imposti. Puoi iniziare con 120 sessioni gratuite.",
      },
      "what-counts-as-session": {
        question: "Cosa conta come una sessione?",
        answer:
          "Una sessione è la visita di un cliente al tuo venditore, a voce o per iscritto. Le sessioni oltre i 5 minuti di voce o i 40 messaggi contano come due. Le visite in cui il cliente non dice nulla sono gratuite. Anche le tue anteprime nell'admin di Bizmis sono gratuite. Ogni piano include un numero di sessioni (Starter 260 / Growth 660 / Scale 1.650) che si rinnova ogni mese. Oltre quella soglia, ogni sessione extra costa $0,30, solo fino al limite di spesa che imposti nell'admin di Bizmis. Il limite parte da $0, quindi non paghi nulla in più finché non lo alzi. Una volta raggiunto, il venditore si mette in pausa fino al periodo successivo o finché non alzi il limite. Le sessioni non usate non si accumulano.",
      },
      "monthly-billing": {
        question: "C'è la fatturazione annuale?",
        answer:
          "Sì. Puoi pagare un anno intero in anticipo e risparmiare circa il 20% rispetto al prezzo mensile. Le sessioni incluse continuano ad azzerarsi ogni mese. I piani annuali hanno una garanzia di rimborso entro 30 giorni sul primo pagamento annuale.",
      },
      "early-access-offer": {
        question: "Cos'è l'offerta di accesso anticipato?",
        answer:
          "L'accesso anticipato offre ai negozi Shopify invitati le **120 sessioni gratuite** del piano gratuito, una sola volta per negozio. Non ci sono abbonamenti, costi di utilizzo, passaggi automatici a un piano superiore o rinnovi. Quando le sessioni terminano, Bizmis si mette in pausa, a meno che tu non scelga e approvi un piano a pagamento su Shopify. I membri ricevono anche onboarding individuale, assistenza prioritaria, priorità per il feedback sul prodotto e uno sconto personale se in seguito decidono di passare a un piano superiore.",
      },
      "free-plan": {
        question: "C'è un piano gratuito?",
        answer:
          "Sì. Il **piano gratuito** tiene Bizmis attivo nel tuo negozio per **120 sessioni gratuite**, una sola volta per negozio. Nessun abbonamento, nessun vincolo, nessuna carta e nessun rinnovo. È un test vero con clienti veri. Quando ti serve capacità continuativa, passi a un piano a pagamento. Tutti gli addebiti di Bizmis passano da Shopify sull'account che già usi: non aggiungi mai una carta separata, e il piano gratuito non ha nulla da addebitare.",
      },
      "billing-payment-method": {
        question: "Come funziona il pagamento? Devo aggiungere una carta?",
        answer:
          "Tutta la fatturazione di Bizmis passa dalla Billing API di Shopify, sullo stesso account che già usi per il tuo negozio. Approvi gli addebiti direttamente in Shopify e tutto (il piano più eventuali eccedenze) finisce sulla tua normale fattura Shopify, insieme alle altre app. Non inserisci mai una carta di pagamento in Bizmis. L'utilizzo a pagamento viene comunque fatturato, semplicemente lo incassa Shopify al posto nostro. Il piano gratuito non ha nulla da addebitare, quindi non c'è nulla da approvare finché non decidi di passare a un piano superiore.",
      },
      "upgrade-plan": {
        question: "Cosa succede se passo a un piano superiore?",
        answer:
          "Il passaggio è immediato. Ti viene addebitata la differenza in proporzione al resto del periodo in corso; i contatori di utilizzo e la data di fatturazione restano invariati. Le nuove funzionalità si sbloccano subito.",
      },
      "downgrade-plan": {
        question: "Cosa succede se passo a un piano inferiore?",
        answer:
          "Il passaggio ha effetto al rinnovo successivo: fino ad allora mantieni il piano attuale e le relative funzionalità. Nessun azzeramento dei contatori di utilizzo, nessun conguaglio.",
      },
      "cancel-anytime": {
        question: "Posso disdire quando voglio?",
        answer:
          "Sì, dall'admin di Bizmis o disinstallando l'app. La disdetta è immediata: il widget vocale smette di rispondere ai clienti non appena viene confermata.",
      },
      "refund-policy": {
        question: "Qual è la vostra politica di rimborso?",
        answer:
          "**Piani annuali:** garanzia di rimborso entro 30 giorni. Disdici entro 30 giorni dal primo pagamento annuale e ti rimborsiamo quell'importo, senza domande. La garanzia non copre gli anni di rinnovo né le sessioni extra.\n**Piani mensili:** puoi disdire quando vuoi, ma gli importi già fatturati per il mese in corso non sono rimborsabili. Non riceverai altri addebiti. Le sessioni non usate non si accumulano.",
      },
      "personalize-voice-avatar": {
        question: "Posso personalizzare la voce e l'avatar?",
        answer:
          "Sì. Scegli tra una selezione di voci naturali in oltre 25 lingue, oppure tra quattro personaggi avatar (dal piano Growth in su). Puoi anche configurare saluto, tono e comportamento in linea con il tuo marchio.",
      },
      "multi-language": {
        question: "Bizmis parla più lingue?",
        answer:
          "Sì. Bizmis rileva automaticamente la lingua del cliente e risponde nella stessa: oltre 25 lingue supportate, su tutti i piani. Nessuna configurazione per lingua.",
      },
      "customize-content": {
        question: "Posso personalizzare quello che Bizmis dice sui miei prodotti?",
        answer:
          "Sì. Configura **regole di vendita** (come consiglia, confronta e propone upgrade), **regole di assistenza** (trigger di escalation, argomenti da rifiutare) e una **base di conoscenza** (FAQ, politiche del negozio, note sui prodotti che non stanno nelle schede) direttamente dall'admin integrato.",
      },
      "multiple-clerks": {
        question: "Quanti venditori Bizmis posso attivare?",
        answer:
          "Uno con Starter, fino a cinque con Growth, illimitati con Scale ed Enterprise. Ogni venditore può avere voce, avatar e regole proprie, utile se vendi su collezioni o mercati distinti.",
      },
      "data-collected": {
        question: "Quali dati raccoglie Bizmis?",
        answer:
          "Dai clienti: audio della voce, trascrizioni, navigazione durante la sessione e lingua preferita. L'e-mail viene raccolta solo se il cliente ha effettuato l'accesso al tuo negozio Shopify. Dai merchant: dati del negozio, preferenze di configurazione e token di accesso Shopify necessari al funzionamento dell'app.",
      },
      "train-on-data": {
        question: "Addestrate modelli di IA sui dati dei clienti?",
        answer:
          "**No.** Le registrazioni vocali e le trascrizioni non vengono mai usate per addestrare modelli di IA, né nostri né dei nostri sub-responsabili. Per impostazione predefinita AWS Bedrock non usa i dati dei clienti per addestrare i modelli; Anthropic non addestra i suoi modelli di base sui dati dei clienti provenienti da API o Bedrock; e la nostra integrazione con ElevenLabs è configurata perché l'audio delle conversazioni non venga usato per migliorare i loro modelli.",
      },
      "sub-processors": {
        question: "Chi sono i vostri sub-responsabili?",
        answer:
          "**ElevenLabs** per riconoscimento vocale, sintesi vocale e orchestrazione dell'agente vocale. **Anthropic** (famiglia Claude) per la generazione delle risposte, tramite ElevenLabs e tramite AWS Bedrock per le elaborazioni di back-end. **Amazon Web Services** per hosting, archiviazione e inferenza dei modelli Bedrock. **Shopify** per il contesto di negozio e clienti. Tempi di conservazione e regioni di trattamento completi sono nella nostra informativa sulla privacy.",
      },
      "gdpr-compliant": {
        question: "Bizmis è conforme al GDPR?",
        answer:
          "Sì. Bizmis agisce come responsabile del trattamento per conto del merchant sui dati dei clienti; la sezione 12 dei nostri Termini è un DPA ai sensi dell'articolo 28 del GDPR. I clienti mantengono i diritti previsti da GDPR/CPRA: accesso, rettifica, cancellazione, limitazione, portabilità. Gestiamo i webhook di conformità obbligatori di Shopify e rispondiamo alle richieste dirette a hello@bizmis.ai. Le clausole contrattuali standard dell'UE sono disponibili su richiesta.",
      },
      "data-retention": {
        question: "Per quanto tempo conservate i dati delle conversazioni?",
        answer:
          "I metadati di sessione vengono eliminati automaticamente dopo 60 minuti di inattività. Registrazioni e trascrizioni sono conservate finché la tua installazione è attiva. Dopo la disinstallazione i dati restano per la finestra di reinstallazione di 48 ore di Shopify, poi vengono eliminati entro 30 giorni dal webhook shop/redact. Ogni singola conversazione può essere eliminata su richiesta in qualsiasi momento.",
      },
      "shopify-only": {
        question: "Bizmis funziona solo con Shopify?",
        answer:
          "Sì. Bizmis è costruito appositamente per Shopify e usa le sue API per dati di prodotti, clienti, ordini e politiche. Nessun piano di supportare altre piattaforme a breve termine.",
      },
      "what-syncs": {
        question: "Cosa sincronizza Bizmis dal mio negozio?",
        answer:
          "Prodotti e collezioni, prezzi e sconti, schede cliente (quando hanno effettuato l'accesso), storico degli ordini e politiche del negozio (spedizioni, resi, FAQ). La sincronizzazione è automatica e continua: appena aggiorni un prodotto, Bizmis lo vede.",
      },
      "private-testing": {
        question: "Posso provare Bizmis senza mostrarlo agli acquirenti?",
        answer:
          "Sì. Bizmis rimane nascosto finché un amministratore non attiva la sua integrazione nel tema. Per provare risposte reali in privato, duplica il tema pubblicato, attiva Bizmis solo sulla copia non pubblicata e aprila con l'anteprima del tema di Shopify. Utilizzerà il tuo catalogo e le tue politiche reali mentre il negozio pubblicato rimane invariato. L'interruttore Pausa nella dashboard di Bizmis lo nasconde immediatamente in qualsiasi momento.",
      },
      permissions: {
        question: "Quali autorizzazioni richiede Bizmis?",
        answer:
          "Bizmis legge prodotti, clienti, ordini e politiche del negozio per rispondere alle domande di vendita e assistenza. L'accesso alle politiche legali è di sola lettura, quindi Bizmis non può modificarle. L'unico accesso in scrittura riguarda Shopify Files e viene utilizzato solo quando scegli di caricare un'immagine, come il tuo logo, per la maglietta dell'avatar. Bizmis non modifica i file esistenti.",
      },
      uninstall: {
        question: "Cosa succede se disinstallo?",
        answer:
          "Il widget si arresta immediatamente, Shopify rimuove l'estensione del tema e revoca i token di accesso di Bizmis. Conserviamo i dati di configurazione e delle conversazioni durante la finestra di reinstallazione di 48 ore di Shopify, così possiamo ripristinare il tuo account se reinstalli l'app. Shopify avvia quindi l'eliminazione e cancelliamo questi dati entro 30 giorni. Qualsiasi immagine dell'avatar che hai caricato rimane nei tuoi Shopify Files e può essere eliminata da lì.",
      },
    },
  },

  contact: {
    title: "Parliamone",
    lead: "Hai domande su Bizmis? Scrivici, ti risponderemo il prima possibile.",
    successTitle: "Messaggio inviato!",
    successBody: "Grazie per averci scritto. Ti risponderemo il prima possibile.",
    sendAnother: "Invia un altro messaggio",
    errorBody:
      "Invio del messaggio non riuscito. Riprova oppure scrivici direttamente a",
    nameLabel: "Il tuo nome",
    namePlaceholder: "Mario Rossi",
    emailLabel: "Indirizzo e-mail",
    emailPlaceholder: "mario@esempio.com",
    subjectLabel: "Oggetto",
    subjectPlaceholder: "Come possiamo aiutarti?",
    messageLabel: "Messaggio",
    messagePlaceholder: "Raccontaci di più sulla tua domanda o sul tuo riscontro...",
    sending: "Invio...",
    send: "Invia il messaggio",
    orEmailUs: "Oppure scrivici direttamente a",
  },

  earlyAccessPage: {
    badge: (cap: number) => `Solo i primi ${cap} negozi`,
    titleLine1: "Entra nel programma",
    titleLine2: "di accesso anticipato",
    lead: (cap: number) =>
      `Possono partecipare solo ${cap} negozi Shopify. Installa Bizmis gratis mentre l'accesso anticipato è aperto e mantieni i vantaggi da membro quando passi a un piano a pagamento.`,
    seeLiveDemo: "Guarda la demo dal vivo",
    bookFounderCall: "Prenota 30 min con il fondatore",
    avatarAlt: "Invito all'accesso anticipato Bizmis",
    benefitsBadge: "Vantaggi dell'accesso anticipato",
    benefitsTitle: "Cosa ottieni",
    benefitsLead:
      "Passa il mouse su ogni scheda per vedere cosa comprendono i tuoi vantaggi.",
    benefits: [
      {
        title: "Gratis come membro*",
        detail:
          "Attiva l'accesso anticipato nell'app e usa 120 sessioni dal vivo senza costi. Nessun abbonamento, nessun vincolo.",
      },
      {
        title: "Dai forma alla roadmap",
        detail:
          "I tuoi riscontri hanno la priorità. Le domande dei tuoi clienti aiutano a decidere le prossime funzionalità, correzioni e scelte di prodotto.",
      },
      {
        title: "Supporto prioritario",
        detail:
          "Una linea diretta con il fondatore per domande sull'installazione, indicazioni di configurazione e aiuto prioritario da membro.",
      },
      {
        title: "Sconti esclusivi",
        detail:
          "Il tuo codice di accesso anticipato sblocca un prezzo mensile di lancio scontato quando passi a un piano a pagamento.",
      },
    ],
    ctaTitle: "Scegli da dove partire",
    fastestPath: "La via più rapida",
    installCardBody: "Attiva l'accesso anticipato direttamente dall'app Shopify.",
    wantHelp: "Vuoi una mano?",
    bookCallTitle: "Prenota una call con il fondatore",
    bookCallBody: "30 minuti di presentazione guidata prima di installare.",
    seeDemoFirst: "Guarda prima la demo dal vivo",
    founderLed: "Progetto guidato dal fondatore. Domande?",
    footnote:
      "*Gratis per i membri dell'accesso anticipato = 120 sessioni dal vivo, una sola volta per negozio, senza rinnovo.",
  },

  unsubscribe: {
    confirmTitle: "Vuoi disiscriverti dalle e-mail di Bizmis?",
    confirmBody:
      "Non riceverai più inviti all'accesso anticipato né altre e-mail da Bizmis.",
    confirmButton: "Conferma la disiscrizione",
    processing: "Elaborazione della richiesta...",
    successTitle: "Disiscrizione completata",
    successBody:
      "Non riceverai altre e-mail da noi. Se è stato un errore, rispondi a una e-mail precedente o scrivici a",
    errorTitle: "Qualcosa è andato storto",
    invalidLink:
      "Questo link di disiscrizione non è valido. Se sei arrivato da una e-mail, scrivi a hello@bizmis.ai.",
    genericError: "Qualcosa è andato storto. Riprova.",
    networkError:
      "Non riusciamo a raggiungere il server. Riprova o scrivi a hello@bizmis.ai.",
    tryAgain: "Riprova",
    questions: "Domande?",
  },

  notFound: {
    title: "404",
    message: "Ops! Pagina non trovata",
    backHome: "Torna alla home",
  },

  seo: {
    home: {
      title: "Bizmis — Il commesso vocale per il tuo negozio Shopify",
      description:
        "Bizmis accoglie i clienti, risponde alle domande e li accompagna all'acquisto, come un ottimo commesso in negozio, 24/7 dentro il tuo negozio Shopify.",
      jsonLdDescription:
        "Commesso vocale per Shopify che accoglie i clienti, risponde alle domande e li accompagna all'acquisto.",
    },
    pricing: {
      title: "Prezzi Bizmis — Piani per ogni negozio Shopify",
      description:
        "Prezzi Bizmis semplici per negozi Shopify di ogni dimensione. Scegli un piano, installa in un clic e inizia a vendere con un commesso vocale.",
    },
    faqs: {
      title: "FAQ Bizmis — Installazione, prezzi, dati e comportamento",
      description:
        "Risposte alle domande frequenti su Bizmis: come funziona su Shopify, tempi di installazione, trattamento dei dati, comportamento vocale, prezzi e altro.",
    },
    contact: {
      title: "Contatta Bizmis — Parliamone",
      description:
        "Contatta il team Bizmis per l'installazione su Shopify, integrazioni su siti su misura, partnership o qualsiasi altra cosa. Rispondiamo in fretta.",
    },
    earlyAccess: {
      title: "Accesso anticipato Bizmis — gratis per i primi 50 negozi Shopify",
      description:
        "Diventa membro dell'accesso anticipato Bizmis: installazione gratuita, linea diretta con il fondatore, influenza sulla roadmap e sconti mantenuti al passaggio a un piano a pagamento. Solo per i primi 50 negozi Shopify.",
    },
  },
};
