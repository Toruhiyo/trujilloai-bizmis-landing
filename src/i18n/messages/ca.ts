import type { Messages } from "./en";

export const ca: Messages = {
  common: {
    installNow: "Instal·la'l ara",
    installOnShopify: "Instal·la'l a Shopify",
    installOnYourStore: "Instal·la'l a la teva botiga",
    installBizmisOnShopify: "Instal·la Bizmis a Shopify",
    liveDemo: "Demo",
    bookACall: "Reserva una trucada",
    getStarted: "Comença",
    contactSupport: "Contacta amb suport",
    contactSales: "Parla amb vendes",
    soon: "Aviat",
    email: "hello@bizmis.ai",
  },

  languageSwitcher: {
    label: "Idioma",
    ariaLabel: "Tria l'idioma",
  },

  nav: {
    earlyAccess: "Accés anticipat",
    benefits: "Avantatges",
    setup: "Instal·lació",
    pricing: "Preus",
    faqs: "Preguntes freqüents",
    openMenu: "Obre el menú",
    closeMenu: "Tanca el menú",
  },

  hero: {
    badgeLabel: "Accés anticipat",
    badgeDetailShort: "Primeres 50 botigues",
    badgeDetailLong: "Gratuït per a les 50 primeres botigues Shopify",
    titleLine1: "El millor venedor",
    // Non-breaking space keeps "ara online" together if this line wraps.
    titleLine2: "de la teva botiga, ara\u00A0online",
    subtitleLead: "Ajuda cada client a",
    subtitleFind: "trobar-ho",
    subtitleTrust: "confiar-hi",
    subtitleBuy: "comprar-ho",
    subtitleConnector: " i a",
    pitchLead: "Això no és un xatbot.",
    pitchShort:
      "Els clients marxen quan no troben el producte adequat o dubten abans de comprar, just els moments que un dependent resoldria a la botiga. Bizmis porta aquesta ajuda al teu web, amb veu, acotant el catàleg al producte correcte i resolent dubtes perquè comprin amb confiança.",
    pitchLong:
      "Els clients marxen quan no troben el producte adequat o dubten abans de comprar, just els moments que un dependent resoldria a la botiga. Bizmis porta aquesta ajuda al teu web, amb veu. Escolta, acota el catàleg al producte correcte i resol els dubtes perquè comprin amb confiança.",
    installSubline: "Instal·lació en un clic, a punt en minuts",
    alsoAvailableFor: "També disponible per a",
    customWebsites: "webs a mida",
    ratherTalk: "Prefereixes que en parlem?",
    avatarAlt: "Assistent de vendes digital atenent clients",
    agentHello: "Hola! Sóc el teu agent de vendes Bizmis.",
    agentPitch: "Entenc el que necessita cada client, resolc els seus dubtes i et guanyo la venda.",
    agentInvite: "Prem play i mira'm vendre!",
  },

  film: {
    watch: "Mira el vídeo",
    replay: "Torna a veure",
    play: "Reprodueix",
    pause: "Pausa",
    mute: "Silencia",
    unmute: "Activa el so",
    enterFullscreen: "Pantalla completa",
    exitFullscreen: "Surt de la pantalla completa",
    seek: "Cerca",
    region: "Vídeo de Bizmis",
    quality: "Qualitat",
    auto: "Auto",
    /** The film player's CC button (closed captions of the voice-over). */
    captions: "Subtítols",
    /** The tag on a voice-over caption (the film's narrator is a woman's voice). */
    narrator: "Narradora",
    close: "Tanca el vídeo",
  },

  /** The film-led landing (/v2): copy it adds to the classic landing's messages. */
  landing: {
    /** The hero's line under the title (the classic keeps hero.subtitle*): the last part is the merchant's win, highlighted. */
    heroLine: ["Entén necessitats.", "Resol dubtes.", "Guanya vendes."],
    /** Under the hero's Install button (the classic landing keeps hero.installSubline). */
    installSubline: "Instal·lació amb un clic, a punt a l'instant",
    switch: {
      chatbot: "Xatbot",
      agent: "Agent de vendes",
      toggleAria: "Compara un xatbot típic amb l'agent de vendes de Bizmis",
      chatbotMessage: "Hola! En què et puc ajudar avui?",
      chatbotReply: "Aquí tens alguns enllaços que et poden ajudar.",
      agentMessage: "Busques un regal? Digues-me per a qui és i trobaré el que toca.",
      /** What the shopper does: with a chatbot, then with the Bizmis sales agent. */
      shopper: "El teu client",
      chatbotOutcome: ["No ho troba", "Dubta", "Se'n va"],
      agentOutcome: ["Ho troba", "Hi confia", "Ho compra"],
      /** The shopper's patience while using the chatbot: it drains with every reply. */
      patience: {
        label: "Paciència del client",
        reading: "+{s} s de lectura",
        stages: ["Llegint un mur de text…", "Llegint en diagonal. Encara sense resposta.", "Obrint la web de la competència…", "Escrivint \"vull parlar amb una persona\"…", "Se n'ha anat."],
        leftTitle: "El client se n'ha anat.",
        leftBody: "Venda perduda. Ningú se n'ha adonat.",
        cta: "Prova l'agent de vendes",
      },
      /** The typical chatbot, interactive: verbose, dull, useless to sell. */
      bot: {
        title: "Xatbot",
        hint: "Vinga, pregunta-li alguna cosa",
        placeholder: "Escriu el teu missatge...",
        send: "Envia",
        open: "Obre el xat",
        close: "Tanca el xat",
        greeting: "Hola! 👋 Soc el teu assistent virtual. En què et puc ajudar avui? Tria una de les opcions de sota o escriu la teva pregunta.",
        chips: ["Seguir comanda", "Devolucions", "Contacte"],
        helpful: "T'ha estat útil?",
        product: "Gràcies pel teu missatge! Aquest producte forma part de la nostra col·lecció més venuda i és una gran opció per a moltes ocasions. Trobaràs tots els detalls, inclosos materials, mides i instruccions de cura, a la descripció del producte. Tingues en compte que els terminis de lliurament poden variar segons la teva ubicació i el mètode d'enviament triat en pagar. Per a informació sobre canvis i reemborsaments, consulta la nostra pàgina de Política de devolucions. El nostre equip de suport sol respondre en 2–3 dies laborables. Hi ha alguna altra cosa en què et pugui ajudar avui?",
        productLinks: ["Política de devolucions", "Informació d'enviament"],
        track: "Per seguir la teva comanda, introdueix el número de comanda i el correu que vas fer servir en pagar a la nostra pàgina de Seguiment de comandes. El número de comanda comença per # i el trobaràs al correu de confirmació. La informació de seguiment pot trigar 24–48 hores a actualitzar-se després de l'enviament. Si no has rebut el correu de confirmació, revisa la carpeta de correu brossa.",
        trackLinks: ["Seguiment de comandes"],
        returns: "Acceptem devolucions en un termini de 30 dies des del lliurament, sempre que els articles no s'hagin fet servir ni rentat i siguin a l'embalatge original amb totes les etiquetes. Els articles rebaixats, les targetes regal i els productes personalitzats no admeten devolució. Per iniciar una devolució, visita el nostre Portal de devolucions. Els reemborsaments s'emeten al mètode de pagament original en 5–10 dies laborables després de rebre i revisar la devolució. Les despeses d'enviament de la devolució no són reemborsables.",
        returnsLinks: ["Portal de devolucions"],
        contact: "El nostre equip d'atenció al client està disponible de dilluns a divendres, de 9:00 a 17:00, excepte festius. Escriu-nos per correu i inclou el número de comanda a l'assumpte. Intentem respondre totes les consultes en 2–3 dies laborables. Gràcies per la paciència!",
        contactLinks: ["Formulari de contacte"],
        human: "Ho sento, ara mateix no hi ha cap agent disponible. Deixa'ns la teva adreça de correu i un membre del nostre equip et respondrà en 2–3 dies laborables.",
        confused: "Ho sento, no t'he entès bé. Podries reformular la pregunta? També pots triar una de les opcions de sota.",
        thanks: "Gràcies pels teus comentaris! Treballem constantment per millorar el nostre servei.",
      },
    },
    /** The film's end-card scarcity line. */
    onlySpots: "Només 50 places!",
    /** The personalization carousel. */
    carousel: { label: "Tria un avatar", prev: "Avatar anterior", next: "Avatar següent" },
    yourStore: "La teva botiga",
    agentAlt: "L'avatar de l'agent de vendes de Bizmis",
    /** UI text of the real widget, as it appears in the mockups. */
    widget: {
      placeholder: "Ajuda'm a trobar el producte ideal.",
      /** The hero widget's rotating composer placeholders (the first is placeholder). */
      placeholders: ["Ajuda'm a trobar el producte ideal.", "Compara'm les millors opcions.", "Això em serveix pel que necessito?", "Em resols un dubte de compra?"],
      takingYouTo: "Et porto a",
      addingToCart: "Afegint al carretó",
      searchResults: "Resultats de la cerca",
      cartItem: "Esfera",
    },
    /** Boost Sales on /v2: the title stays on screen while each sub-benefit lights up its part (find it / trust it / buy it). */
    sales: {
      titleLead: "",
      titleParts: ["Entén necessitats.", "Resol dubtes.", "Guanya vendes."],
      stages: ["Descoberta", "Decisió", "Pagament"],
      panels: [
        { title: "Més clients troben el que busquen", body: "Redueix el catàleg als pocs productes que encaixen." },
        { title: "Els dubtes es tornen decisions", body: "Compara, aconsella i respon cada dubte." },
        { title: "Els carretons es tornen comandes", body: "Resol els dubtes d'última hora i els porta a pagar." },
      ],
      payoff: { kicker: "Tot plegat", title: "Visites convertides en vendes.", body: "Sense cansament. Sense bloquejos. Sense dubtes.", jar: "Vendes" },
      findQuery: "Un regal per a la meva germana, menys de 50 €",
      findCaption: "Aquí en tens tres que li encantaran.",
      compareQuery: "Quin m'emporto?",
      compareCaption: "Aquest. És el més lleuger i el més ben valorat.",
      bestMatch: "El millor",
      decided: "Al carretó",
      buyQuery: "Arriba abans de divendres?",
      buyCaption: "Sí, surt avui i la devolució és gratuïta. Anem a pagar?",
      /** Each beat's words: the merchant's loss, struck through at the fix, then the win written in. No figures. */
      flip: [
        { problem: "Els visitants que recorren el teu catàleg [[es cansen i abandonen]].", fix: "Els visitants que recorren el teu catàleg [[troben ràpid productes que valen la pena]]." },
        { problem: "Els clients que comparen opcions [[es bloquegen i marxen]].", fix: "Els clients que comparen opcions [[trien amb seguretat]]." },
        { problem: "Els compradors a punt de comprar [[dubten i es frenen]].", fix: "Els compradors a punt de comprar [[es decideixen i passen al pagament]]." },
      ],
      openers: ["Visitants que volen el producte adequat", "Compradors que dubten entre opcions", "Compradors amb el carretó ple"],
      /** ?beat=1..6: the small labels of the alternative loss → win looks. */
      flipLabels: { lose: "Perds", win: "Guanyes", you: "Tu, avui", withBizmis: "Amb Bizmis" },
      /** ?beat=4: each loss as the merchant says it (the speech bubble). */
      flipQuote: [
        "Els clients es cansen de buscar al meu catàleg i compren el mateix a la competència.",
        "Els meus clients indecisos marxen a comparar i acaben comprant a un altre.",
        "Els clients arriben al pagament, els sorgeix un últim dubte i marxen.",
      ],
      /** The one-shopper variant (?case=one): the same shopper and gift from Find through Trust to Buy. */
      caseOne: {
        compareQuery: "Quin dels tres li agradarà més?",
        compareCaption: "Aquest. És el més ben valorat dels tres.",
        buyQuery: "Arriba abans del seu aniversari, divendres?",
        buyCaption: "Sí, surt avui i la devolució és gratuïta. Anem a pagar?",
      },
      cart: { title: "El teu carretó", add: "Afegeix a la cistella", subtotal: "Subtotal", checkout: "Pagar", perks: ["Surt avui", "Devolució gratuïta"], placed: "Comanda feta" },
      funnel: {
        problems: ["Es cansen de buscar", "Marxen a comparar", "Abandonen el carretó"],
        solutions: ["Ho troben de seguida", "Decideixen aquí", "Compren"],
        /** The word at the open mouth, with its arrow: the dots are store visits. */
        visits: "visites",
      },
      /** ?win=4..6: the metrics merchants know, drawn moving the right way as stages get fixed (no figures). */
      metrics: {
        conversion: "Taxa de conversió",
        orders: "Comandes",
        abandoned: "Cistelles abandonades",
        ordersToday: "Comandes d'avui",
        before: "abans",
        after: "després",
      },
      pulse: { currency: "EUR" },
    },
    support: {
      title: "Retalla la càrrega de suport.",
      titleTail: "Dia i nit.",
      /** The area's full name, the chapter eyebrow over the outcome (the pillar openers, ?open=1..6). */
      area: "Atenció al client",
      lead: "Atén cada client, de dia o de nit, amb la calidesa del teu millor dependent.",
      /** The support mockup's widget placeholder (the composer's prompt before the shopper types). */
      placeholder: "Pregunta'm per la teva comanda.",
      /** The pillar's animation, the merchant's support at scale: questions round the clock piling up as tickets, then answered
       * right away by voice once the agent lands. One label, as the Sales funnel's: the loss, struck at the fix, then the win (short, present tense). */
      day: {
        label: "Preguntes de clients a totes hores: s'acumulen com a tiquets a la safata de suport fins que arriba l'agent, i des de llavors cadascuna té resposta a l'instant, en veu alta",
        problem: "S'acumulen tiquets",
        solution: "Resposta a l'instant",
        inbox: "Safata de suport",
      },
      options: {
        sky: { label: "Les preguntes dels clients arriben de dia i de nit; es responen en veu alta abans d'arribar a la safata de suport, que queda neta", problem: "La safata es desborda", solution: "Safata neta, de dia i de nit" },
        clock: { label: "Les preguntes dels clients arriben de tot arreu i s'acumulen a la safata de suport; quan arriba l'agent respon les pendents i atrapa les noves, i només queden les poques que necessiten el botiguer", problem: "Les preguntes s'acumulen", solution: "Només les poques que et necessiten" },
        morning: { label: "Preguntes tota la nit, respostes en veu alta quan arriben: el botiguer es desperta amb la safata buida", problem: "Preguntes tota la nit", solution: "Et despertes amb la safata buida" },
      },
    },
    insights: {
      title: "Mira què ven.",
      titleTail: "Arregla la resta.",
      /** The area's full name, the chapter eyebrow over the outcome (the pillar openers, ?open=1..6). */
      area: "Dades de la botiga",
      lead: "Cada conversa es converteix en un pas següent clar.",
      clarity: {
        snippets: ["Envieu al Canadà?", "Talla M o L?", "Devolucions?", "Embolcall de regal?"],
        topAsk: "El més preguntat: enviaments",
      },
      options: {
        why: {
          label: "Moltes sessions acabades sense compra, repassades de cop: apareix el que feia nosa",
          problem: "Per què no compren?",
          reasons: ["Un pop-up tapa la cistella", "La cerca no troba res", "L'enviament surt massa tard", "La pàgina triga a carregar", "Se'n van a buscar cupons"],
        },
        carts: { label: "Una setmana de cistelles abandonades, revisada dia a dia, es redueix a un motiu", problem: "Cistelles abandonades tota la setmana", solution: "El motiu: les talles" },
        week: { label: "Una setmana de converses ordenada en una imatge del que volen els clients", problem: "Massa per llegir-les", solution: "El que volen els clients" },
      },
    },
    /** Boost Sales's area, the chapter eyebrow over its outcome (its outcome is already "Boost Sales"). */
    salesArea: "Vendes",
    customize: {
      /** The section's own eyebrow (a pill, as the pillars' openers) and title, in sentence case. */
      eyebrow: "Personalització",
      title: "Fes-lo totalment teu",
      lead: "Tria el seu aspecte i posa el teu logo a la seva samarreta.",
      avatar: { title: "El teu avatar", body: "Tria una cara que encaixi amb la teva marca." },
      voice: { title: "La teva veu", body: "Clona-la perquè soni com tu." },
    },
    /** The closing card, as the film's: the title is the install button, then the handwritten invite and, apart, the note. */
    endCard: {
      install: "Instal·la ara",
      invite: "per als avantatges d'Early Access!",
      note: "Només 50 places!",
      /** The ad-1 film's Early Access perks, then the quieter extras under them. */
      perks: ["120 sessions gratis", "50% de descompte en millorar el pla", "Decideix el full de ruta amb nosaltres"],
      extras: ["Sense targeta", "Sense compromís", "Línia directa amb el fundador"],
    },
    setup: {
      /** The eyebrow (a pill, as the pillars' openers) and the store card's rows (same order as setup.dataCards), in sentence case; the classic landing keeps setup.badge and setup.dataCards. */
      eyebrow: "Llest per fer servir",
      cards: ["Web de la botiga", "Catàleg de productes", "Descomptes", "Polítiques", "Clients", "Comandes"],
      title: "Instal·lació amb un clic",
      /** The lead reads on from the title ("One-click setup" …and your agent's selling right away.), then one short line. */
      leadOn: "…i el teu agent ja ven.",
      leadSync: "Cada canvi se sincronitza sol.",
      install: "Instal·lar",
      storeTitle: "La teva botiga online",
      alwaysInSync: "Sempre sincronitzat",
    },
  },

  benefits: {
    sales: {
      badge: "Més vendes",
      title: "Converteix. Amplia. Fidelitza.",
      leadShort:
        "Un bon dependent que guia els clients, apuja el valor de la cistella i fa que tornin.",
      leadLong:
        "Bizmis actua com un bon dependent de botiga: guia els compradors, augmenta el valor de la cistella i crea aquella experiència propera i personal que fa tornar els clients.",
      pillars: [
        {
          title: "Converteix més visites",
          subtitle: "Elimina els dubtes de compra",
          body: "Bizmis respon a l'instant i guia cada client fins al producte adequat, així més visites es decideixen a comprar.",
        },
        {
          title: "Augmenta el valor de la comanda",
          subtitle: "Vendes creuades intel·ligents",
          body: "Recomanacions, millores i productes complementaris que apareixen de manera natural durant la conversa.",
        },
        {
          title: "Fidelitza els clients",
          subtitle: "Una experiència de compra personal",
          body: "Una experiència de compra propera que els clients recorden i per la qual tornen.",
        },
      ],
    },
    support: {
      badge: "Atenció al client",
      titleLine1: "Estalvia hores de suport.",
      titleLine2: "Guanya clients fidels.",
      leadShort:
        "Suport immediat i empàtic 24/7 que se sent humà: apuja la satisfacció i t'estalvia hores de feina.",
      leadLong:
        "La intel·ligència emocional i el suport instantani 24/7 milloren la satisfacció del client amb respostes immediates, properes i empàtiques, com l'ajuda d'un bon dependent, mentre estalvies un temps valuós de suport.",
      outcomes: {
        saveHours: "Estalvia hores de suport",
        betterReviews: "Aconsegueix millors ressenyes",
        repeatSales: "Fes créixer la recompra",
      },
      capabilities: [
        {
          title: "Suport instantani 24/7",
          tagline: "Sense esperes ni frustració",
          body: "Els clients reben ajuda just quan la necessiten: sense esperes, sense frustració i sense males ressenyes per preguntes sense resposta.",
        },
        {
          title: "Coneix la teva botiga",
          tagline: "Polítiques, productes i documentació a l'instant",
          body: "Respon a l'instant sobre polítiques, productes i documentació, així els clients reben respostes clares sense esperar el teu equip.",
        },
        {
          title: "Intel·ligència emocional",
          tagline: "Respostes properes i empàtiques",
          body: "Una IA que entén les emocions del client i respon amb atenció i comprensió reals.",
        },
      ],
    },
    insights: {
      badge: "Dades de la botiga",
      title: "Aprèn. Ajusta. Creix.",
      lead: "Descobreix on dubten els compradors, què pregunten i quins camins converteixen, per corregir menys, estalviar hores i invertir on creixen els ingressos.",
      features: [
        {
          title: "Repeticions de sessió",
          tagline: "Ves directe als abandonaments",
          body: "Ves directe als punts d'abandonament i de dubte. Corregeix un cop, evita cistelles abandonades i recupera vendes en risc.",
        },
        {
          title: "Converses etiquetades",
          tagline: "Una correcció, menys tiquets repetits",
          body: "Les converses s'agrupen soles per tema i intenció. Actualitza una FAQ o política, redueix tiquets repetits i baixa la càrrega de suport.",
        },
        {
          title: "Anàlisi de l'embut",
          tagline: "Detecta d'un cop d'ull què rendeix més",
          body: "Consulta rutes de conversió, abandonaments i impacte per producte d'un cop d'ull. Prioritza el que més rendeix i reforça el que funciona.",
        },
      ],
    },
  },

  salesDemo: {
    steps: ["Descobrir i recomanar", "Comparar productes", "Tancar la venda"],
    recommended: "Recomanat",
    added: "Afegit",
    orderConfirmed: "Comanda confirmada",
    subtotal: "Subtotal",
    shipping: "Enviament",
    free: "Gratuït",
    total: "Total",
    assistantAlt: "Assistent Bizmis",
    deliveryEstimate: "Lliurament en 2-3 dies",
    productLabels: {
      cozyPick: "Acollidor",
      proPick: "Per a experts",
      greatValue: "Bon preu",
      recurring: "Subscripció",
      onTheGo: "Per emportar",
      calming: "Relaxant",
    },
    productNames: {
      cozyCandles: "Joc d'espelmes de llar",
      frenchPress: "Kit de premsa francesa",
      ethiopianBeans: "Cafè d'Etiòpia",
      roastSubscription: "Subscripció de cafè",
      travelMug: "Tassa de viatge",
      scentedCandles: "Espelmes aromàtiques",
    },
    shopperQuotes: {
      birthdayGift: '"Busco un regal d\'aniversari."',
      morningRoutine: '"Ajuda\'m a muntar la meva rutina del matí."',
      cozyForMom: '"Alguna cosa acollidora per a la meva mare."',
      campingCoffee: '"Necessito cafè per anar d\'acampada."',
    },
  },

  supportDemo: {
    steps: ["Pregunta rebuda", "Font consultada", "Resolt"],
    done: "Fet",
    processing: "Processant",
    assistantAlt: "Assistent de suport de Bizmis",
    cases: {
      returnPolicy: {
        quote: '"Ho puc tornar si no em va bé?"',
        action: "Política consultada",
        response:
          "És clar, tens 30 dies. Si vols, t'explico com fer-ho pas a pas.",
      },
      orderTracking: {
        quote: '"On és la meva comanda?"',
        action: "Comanda localitzada",
        response:
          "Va sortir ahir i hauria d'arribar dilluns. Et passo l'enllaç de seguiment?",
      },
      shippingTime: {
        quote: '"Quant triga l\'enviament?"',
        action: "Enviament comprovat",
        response:
          "Normalment 2-3 dies feiners. També et puc ensenyar opcions més ràpides.",
      },
      changeAddress: {
        quote: '"He posat malament l\'adreça d\'enviament."',
        action: "Adreça actualitzada",
        response: "Cap problema, la puc canviar abans que surti la comanda.",
      },
      cancelOrder: {
        quote: '"Puc cancel·lar la comanda?"',
        action: "Comanda cancel·lada",
        response: "Sí, encara no s'ha processat. La puc cancel·lar ara mateix.",
      },
      warranty: {
        quote: '"Això té garantia?"',
        action: "Garantia confirmada",
        response: "Sí, tot inclou 2 anys de garantia.",
      },
      startReturn: {
        quote: '"Vull tornar això."',
        action: "Devolució iniciada",
        response: "És clar. Puc iniciar la devolució per tu.",
      },
    },
  },

  sessionReplay: {
    categories: {
      sale: "Venda",
      support: "Suport",
    },
    tabTooltips: {
      sale: "Sessió de venda anònima, cerca de regal que acaba en compra",
      saleLoyal: "Sessió de venda amb usuari identificat, client recurrent",
      supportSuccess: "Sessió de suport, consulta de política resolta",
      supportFailed: "Sessió de suport, sol·licitud no completada",
    },
    successful: "Resolta",
    unresolved: "Sense resoldre",
    anonymousCustomer: "Client anònim",
    customer: "Client",
    vip: "VIP",
    transcriptNote: "Sessió gravada, idioma original",
  },

  setup: {
    badge: "Llest per fer servir",
    title: "Instal·lació en un clic, vendes i suport a l'instant",
    lead: "Instal·la l'app de Bizmis per a Shopify i comença a vendre i atendre clients immediatament.",
    storeDataTitle: "Les dades de la teva botiga Shopify",
    dataCards: [
      { title: "Web de la botiga", description: "Visió, missió i valors" },
      {
        title: "Catàleg de productes",
        description: "Col·leccions, inventari, comandes de compra",
      },
      { title: "Descomptes", description: "Totes les promocions actives" },
      {
        title: "Polítiques",
        description: "Enviaments, devolucions i polítiques de la botiga",
      },
      {
        title: "Clients",
        description: "Historial de vendes i suport per client",
      },
      { title: "Comandes", description: "Historial de comandes" },
    ],
    badges: {
      oneClick: "Instal·lació en un clic",
      alwaysSynced: "Sempre sincronitzat",
      readyInMinutes: "A punt en minuts",
    },
    ctaNote: "Comença a vendre i atendre clients ara.",
  },

  customization: {
    badge: "Personalització",
    titleLead: "Fes-lo",
    titleHighlight: "totalment teu",
    lead: "Construeix relacions autèntiques que generen fidelitat personalitzant la veu i l'aparença.",
    avatar: {
      title: "Avatar personalitzat",
      body: "Crea connexions autèntiques fent que el teu representant de vendes parli i s'assembli a tu.",
    },
    voiceCloning: {
      title: "Clonació de veu",
      body: "Interaccions autèntiques replicant la teva manera de parlar i la teva personalitat.",
    },
    imageAlt: "Centre de personalització: veu i aparença",
  },

  finalCta: {
    title: "Instal·la'l a Shopify en 1 clic. Comença a vendre avui.",
    lead: "Bizmis saluda els visitants, respon les seves preguntes i els guia fins al checkout, totalment sincronitzat amb els teus productes, descomptes i comandes de Shopify.",
    bullets: [
      "Saluda i qualifica els compradors",
      "Compara productes i recomana",
      "Atén el suport i redueix tiquets",
    ],
    installAria: "Instal·la Bizmis a Shopify",
    bookCallAria: "Reserva una trucada amb l'equip de Bizmis",
    cancelAnytime: "Cancel·la quan vulguis",
    gdprReady: "Compleix el RGPD",
    builtForShopify: "Built for Shopify",
  },

  earlyAccessCard: {
    badge: "Accés anticipat",
    titleLead: "Arriba primer.",
    titleHighlight: "Ven més.",
    lead: "Uneix-te al grup exclusiu dels primers 50 comerços que estan definint el futur del comerç conversacional.",
    perks: [
      {
        title: "50% de descompte els 3 primers mesos",
        caption: "Assegura el nostre preu de llançament més baix.",
      },
      {
        title: "Influència directa en el full de ruta",
        caption: "Les teves peticions de funcions passen a tenir prioritat.",
      },
      {
        title: "Onboarding VIP",
        caption: "Sessió de configuració i arrencada personalitzada inclosa.",
      },
    ],
    limitedSpots: "Places limitades",
    cta: "Aconsegueix l'accés anticipat",
  },

  footer: {
    tagline:
      "El millor venedor de la teva botiga, treballant 24/7 per vendre més, donar suport i entendre els teus clients.",
    builtFor: "Fet per a",
    columns: {
      product: "Producte",
      support: "Suport",
      legal: "Legal",
    },
    links: {
      features: "Funcionalitats",
      pricing: "Preus",
      demo: "Demo",
      contact: "Contacte",
      bookACall: "Reserva una trucada",
      faqs: "Preguntes freqüents",
      privacy: "Política de privadesa",
      terms: "Condicions del servei",
    },
    legalNotice: "Les pàgines legals estan disponibles en anglès.",
    copyright: (year: number) =>
      `© ${year} Bizmis. Tots els drets reservats.`,
  },

  pricing: {
    badge: "Preus",
    title: "Preus simples i transparents",
    lead: "Tria el pla que encaixa amb el teu negoci. Tots inclouen la integració completa amb Shopify.",
    monthly: "Mensual",
    yearly: "Anual",
    billedYearly: "facturat anualment",
    perMonth: "/mes",
    popular: "Popular",
    conversationsPerMonth: "sessions / mes",
    extraConversations: (price: string, saving?: { percent: number; plan: string }) =>
      `Sessions extra a ${price} cadascuna${saving ? ` (un ${saving.percent}% menys que a ${saving.plan})` : ""}, fins al límit de despesa que fixis`,
    conversationDefinition:
      "Una sessió és la visita d'un client al teu dependent, per veu o per text. Les sessions de més de 5 minuts de veu o 40 missatges compten com a dues. Les visites en què el client no diu res són gratis.",
    off: "dte.",
    discountTitle: (percent: number) =>
      `${percent}% menys que el preu de tarifa`,
    introPeriodTitle: "Període inicial amb descompte",
    introMonths: (months: number, standardPrice: string) =>
      `${months === 1 ? "primer mes" : `primers ${months} mesos`}, després ${standardPrice} $/mes`,
    free: {
      name: "Gratuït",
      noCommitment: "Sense compromís",
      description: (conversations: string) =>
        `${conversations} sessions gratis per provar Bizmis. Sense targeta.`,
      cta: "Comença gratis",
    },
    plans: {
      starter: {
        name: "Starter",
        features: [
          "1 dependent Bizmis",
          "Veu i text",
          "Suport: correu (48 h)",
        ],
      },
      growth: {
        name: "Growth",
        features: [
          "Fins a 5 dependents Bizmis",
          "Historial, transcripcions i repeticions",
          "Personalització de l'avatar",
          "Suport: correu (24 h) i trucada programada",
        ],
      },
      scale: {
        name: "Scale",
        features: [
          "Dependents Bizmis il·limitats",
          "Sessions etiquetades automàticament",
          "Suport prioritari i onboarding en directe",
        ],
      },
    },
    enterprise: {
      name: "Enterprise",
      customPrice: "Preu personalitzat",
      description:
        "Solucions a mida per a operacions a gran escala, amb volum i requisits personalitzats.",
      everythingInScale: "Tot el de Scale i a més:",
      features: [
        "Volum de sessions a mida",
        "Capacitat garantida per als pics de trànsit",
        "SLA i veu personalitzada",
        "Facturació fora de Shopify",
      ],
    },
    guarantees: {
      spendLimit: "Tu decideixes el teu límit de despesa",
      cancelAnytime: "Cancel·la quan vulguis",
      moneyBack: "30 dies de garantia de devolució als plans anuals",
      cardNote: "Garantia de devolució de 30 dies al pla anual",
      bannerTitle: "Prova un pla anual sense risc durant 30 dies",
      bannerBody: "Si Bizmis no et compensa els primers 30 dies del teu pla anual, cancel·la i et retornem el teu primer pagament anual sencer. Sense preguntes.",
    },
    coupon: {
      prompt:
        "Tens un codi de descompte? Introdueix-lo i prem Retorn o Aplica per actualitzar els preus.",
      placeholder: "Codi de descompte",
      inputAria: "Codi de cupó de descompte",
      apply: "Aplica",
      applying: "Aplicant…",
      remove: "Treu el cupó",
      active: (label: string) => `${label} actiu`,
      viewingPricing: (label: string, cap: number) =>
        `Estàs veient els preus de ${label}, reservats només per als nostres primers ${cap} comerços.`,
      shapeProduct:
        "Ajuda'ns a donar forma al producte amb el teu feedback sobre el full de ruta. Els preus de dalt inclouen",
      monthlyDiscount: (percent: number, months: number) =>
        months > 0
          ? `${percent}% de descompte ${months === 1 ? "el primer mes" : `els primers ${months} mesos`}`
          : `${percent}% de descompte`,
      discountEnd: ".",
      onMonthlyBilling: "en facturació mensual, o",
      yearlyDiscount: (percent: number) => `${percent}% de descompte anual`,
      whenYearlySelected: "si tries facturació anual.",
      errors: {
        empty: "Introdueix primer un codi.",
        notFound: "Aquest codi no és vàlid.",
        expired: "Aquest codi ha caducat.",
        notYetActive: "Aquest codi encara no està actiu.",
        invalidFormat: "El format del codi no quadra, revisa si hi ha errades.",
        alreadyClaimed: "Aquest codi ja s'ha bescanviat.",
        invalidToken: "La sessió ha caducat. Torna-ho a provar.",
        generic: "No hem pogut verificar el codi. Torna-ho a provar.",
      },
    },
    viewAllFaqs: "Consulta totes les preguntes freqüents",
    /** The plan cards show their top features; the rest open on demand. */
    seeAllFeatures: "Mostra totes les funcions",
    fewerFeatures: "Mostra menys funcions",
    enterpriseInquirySubject: "Consulta sobre el pla Enterprise",
  },

  faqsPage: {
    title: "Tot el que necessites saber sobre Bizmis",
    lead: "Respostes a les preguntes més habituals sobre el nostre assistent de vendes per a Shopify",
    searchPlaceholder: "Cerca preguntes...",
    searchAria: "Cerca preguntes freqüents",
    allQuestions: "Totes les preguntes",
    noResults: "No hi ha preguntes que coincideixin amb la teva cerca.",
    stillHaveQuestions: "Encara tens dubtes?",
    teamIsHere:
      "El nostre equip és aquí per ajudar-te a treure el màxim partit de Bizmis.",
  },

  faqs: {
    categories: {
      "getting-started": "Primeres passes",
      "what-bizmis-does": "Què fa Bizmis",
      "pricing-billing": "Preus i facturació",
      customization: "Personalització",
      "privacy-data": "Privadesa i dades",
      "shopify-integration": "Integració amb Shopify",
    },
    items: {
      "what-is-bizmis": {
        question: "Què és Bizmis?",
        answer:
          "Bizmis és un dependent amb IA i veu per a Shopify. Saluda els compradors, respon preguntes sobre productes, comandes, devolucions i polítiques, i els guia fins al checkout, igual que faria un bon dependent a la botiga. Funciona 24/7 dins la teva botiga com un petit widget de veu.",
      },
      "is-chatbot": {
        question: "Bizmis és un xatbot?",
        answer:
          "No. Bizmis funciona per veu, no per text. El comprador parla, Bizmis respon i la conversa flueix com un intercanvi real amb un dependent, no com un arbre de xat amb guió. El widget mostra la transcripció perquè es pugui llegir el que s'ha dit, però la interacció principal és la veu.",
      },
      "how-fast-start": {
        question: "Amb quina rapidesa puc començar?",
        answer:
          "Un clic per instal·lar-lo des de la Shopify App Store. Bizmis sincronitza automàticament els teus productes, col·leccions, polítiques i FAQs. Sense configuració manual, sense entrenar models i sense desenvolupament. La majoria de botigues estan en marxa en minuts.",
      },
      "when-see-value": {
        question: "Quan començaré a veure resultats?",
        answer:
          "Des de la primera conversa. Bizmis s'activa tan bon punt acaba la instal·lació i comença a ajudar els compradors immediatament.",
      },
      "what-it-does": {
        question: "Què fa exactament Bizmis?",
        answer:
          "Tres coses. **Vendes:** saluda els compradors, detecta la seva intenció, recomana productes i els acompanya fins al checkout. **Suport:** gestiona estat de comandes, enviaments, devolucions, polítiques i FAQs a qualsevol hora. **Dades:** repeticions de sessió, recorreguts etiquetats automàticament i analítica d'embut per veure què pregunten, què volen i on abandonen.",
      },
      "place-orders": {
        question: "Bizmis tramita comandes o cobra pagaments?",
        answer:
          "No. El checkout, els pagaments, les devolucions d'import i les modificacions de comanda continuen a Shopify i als teus fluxos actuals. Bizmis aporta informació i guia decisions, però mai completa una transacció ni modifica una comanda en nom del comprador.",
      },
      "cart-management": {
        question: "Bizmis gestiona cistelles o recupera cistelles abandonades?",
        answer:
          "La cistella, sí. Quan el client diu que sí, Bizmis afegeix articles a la cistella de la teva pròpia botiga i el comptador s'actualitza a l'instant. Avisa si una opció està esgotada, n'ofereix una alternativa i pot portar el client a la cistella o al pagament. No envia correus de cistella abandonada, però reprèn la conversa on l'havia deixat quan el client canvia de pàgina.",
      },
      "feels-human": {
        question: "L'assistent semblarà humà?",
        answer:
          "Sí. El to, el ritme, l'expressió i la proximitat estan dissenyats per semblar un dependent real, no una veu robòtica. Els compradors saben que parlen amb una IA (Bizmis ho indica des del principi, segons el Reglament d'IA de la UE), però l'experiència és conversacional, no transaccional.",
      },
      "insights-analytics": {
        question: "Quina informació obtinc?",
        answer:
          "Un tauler amb repeticions de sessió, transcripcions, temes etiquetats automàticament (vendes / suport / desconegut), resultats (respost / escalat / sense resoldre) i esdeveniments de l'embut (productes mostrats, productes comentats, intenció de compra). Veus què volen els compradors, on dubten i què no està responent bé la teva botiga.",
      },
      "review-conversations": {
        question: "Puc revisar converses anteriors?",
        answer:
          "Sí. L'historial, les transcripcions i les repeticions estan disponibles a partir del pla Growth. Pots recórrer qualsevol conversa, llegir-ne la transcripció i etiquetar patrons per afinar les teves regles de venda i suport.",
      },
      "how-much-cost": {
        question: "Quant costa Bizmis?",
        answer:
          "Tres plans més Enterprise, amb facturació mensual, o anual amb al voltant d'un 20% de descompte. **Starter** (79 $/mes, 260 sessions) per a botigues petites o d'una persona. **Growth** (199 $/mes, 660 sessions) per a botigues en creixement, el més popular. **Scale** (499 $/mes, 1.650 sessions) per a botigues d'alt volum. **Enterprise** té preu personalitzat per a botigues que necessiten més volum, capacitat garantida per als pics de trànsit i SLA. Les sessions extra surten més barates als plans grans: 0,45 $ cadascuna a Starter, 0,40 $ a Growth i 0,35 $ a Scale, fins al límit de despesa que fixis. Pots començar amb 120 sessions gratis.",
      },
      "what-counts-as-session": {
        question: "Què compta com una sessió?",
        answer:
          "Una sessió és la visita d'un client al teu dependent, per veu o per text. Les sessions de més de 5 minuts de veu o 40 missatges compten com a dues. Les visites en què el client no diu res són gratis. Les teves pròpies proves al tauler de Bizmis tampoc no compten. Cada pla inclou un nombre de sessions (Starter 260 / Growth 660 / Scale 1.650) que es renova cada mes. A partir d'aquí, cada sessió extra costa 0,45 $ a Starter, 0,40 $ a Growth i 0,35 $ a Scale, només fins al límit de despesa que fixis al tauler de Bizmis. El límit comença a 0 $, de manera que no es cobra res extra fins que l'apugis. Quan l'assoleixes, el dependent es posa en pausa fins al període següent o fins que apugis el límit. Les sessions no utilitzades no s'acumulen.",
      },
      "monthly-billing": {
        question: "Hi ha facturació anual?",
        answer:
          "Sí. Pots pagar un any sencer per avançat i estalviar-te al voltant d'un 20% sobre el preu mensual. Les sessions incloses continuen reiniciant-se cada mes. Els plans anuals tenen una garantia de devolució de 30 dies sobre el primer pagament anual.",
      },
      "early-access-offer": {
        question: "Què és l'oferta d'accés anticipat?",
        answer:
          "L'accés anticipat ofereix a les botigues Shopify convidades les **120 sessions gratis** del pla gratuït, una sola vegada per botiga. No hi ha subscripció, càrrecs per ús, actualització automàtica ni renovació. Quan s'esgoten les sessions, Bizmis es posa en pausa, tret que triïs i aprovis un pla de pagament a Shopify. Els membres també reben onboarding 1 a 1, suport prioritari, prioritat per als seus comentaris sobre el producte i un descompte personal si més endavant decideixen millorar el pla.",
      },
      "free-plan": {
        question: "Hi ha un pla gratuït?",
        answer:
          "Sí. El **pla gratuït** posa Bizmis en marxa a la teva botiga durant **120 sessions gratis**, una sola vegada per botiga. Sense subscripció, sense compromís, sense targeta i sense renovacions. És una prova real amb compradors reals. Quan necessitis capacitat continuada, passa a un pla de pagament. Tots els càrrecs de Bizmis passen per Shopify amb el compte que ja fas servir, així que mai afegeixes una altra targeta, i el pla gratuït no té res a cobrar.",
      },
      "billing-payment-method": {
        question: "Com funciona el pagament? He d'afegir una targeta?",
        answer:
          "Tota la facturació de Bizmis passa per la Billing API de Shopify, al mateix compte que ja fas servir per a la botiga. Aproves els càrrecs dins de Shopify i tot (el teu pla i qualsevol excés) apareix a la teva factura habitual de Shopify al costat de la resta d'apps. Mai introdueixes una targeta a part a Bizmis. L'ús de pagament es factura igualment, només que el cobra Shopify en lloc de nosaltres. El pla gratuït no té res a cobrar, així que no hi ha res a aprovar fins que decideixis canviar de pla.",
      },
      "upgrade-plan": {
        question: "Què passa quan pujo de pla?",
        answer:
          "Les millores s'apliquen immediatament. Se't cobra la diferència prorratejada per la resta del període actual; els comptadors d'ús i la data de facturació no canvien. Les noves funcions es desbloquegen a l'instant.",
      },
      "downgrade-plan": {
        question: "Què passa quan baixo de pla?",
        answer:
          "Les baixades de pla s'apliquen a la renovació següent: mantens el teu pla actual i les seves funcions fins llavors. No es reinicien els comptadors d'ús ni hi ha prorrateig.",
      },
      "cancel-anytime": {
        question: "Puc cancel·lar quan vulgui?",
        answer:
          "Sí, des del tauler de Bizmis o desinstal·lant l'app. La cancel·lació és immediata: el widget de veu deixa d'atendre els compradors tan bon punt es confirma.",
      },
      "refund-policy": {
        question: "Quina és la vostra política de reemborsaments?",
        answer:
          "**Plans anuals:** garantia de devolució de 30 dies. Si cancel·les dins dels 30 dies posteriors al teu primer pagament anual, et retornem aquest càrrec, sense preguntes. No cobreix les renovacions ni les sessions extra.\n**Plans mensuals:** pots cancel·lar quan vulguis, però els càrrecs ja facturats del mes en curs no són reemborsables. No se't tornarà a cobrar. Les sessions no utilitzades no s'acumulen.",
      },
      "personalize-voice-avatar": {
        question: "Puc personalitzar la veu i l'avatar?",
        answer:
          "Sí. Tria entre un conjunt de veus naturals en més de 25 idiomes o entre quatre personatges d'avatar (a partir de Growth). També pots configurar la salutació, el to i el comportament perquè encaixin amb la teva marca.",
      },
      "multi-language": {
        question: "Bizmis parla diversos idiomes?",
        answer:
          "Sí. Bizmis detecta automàticament l'idioma del comprador i respon en el mateix: més de 25 idiomes, en tots els plans. No cal configurar res per idioma.",
      },
      "customize-content": {
        question: "Puc personalitzar el que Bizmis diu dels meus productes?",
        answer:
          "Sí. Configura **regles de venda** (com recomana, compara i suggereix millores), **regles de suport** (quan escalar, què no respondre) i una **base de coneixement** (FAQs, polítiques de la botiga, notes de producte que no són a les fitxes) directament des del tauler integrat.",
      },
      "multiple-clerks": {
        question: "Quants dependents Bizmis puc tenir?",
        answer:
          "Un a Starter, fins a cinc a Growth i il·limitats a Scale i Enterprise. Cada dependent pot tenir la seva pròpia veu, avatar i conjunt de regles, cosa útil si véns en col·leccions o mercats diferents.",
      },
      "data-collected": {
        question: "Quines dades recull Bizmis?",
        answer:
          "Dels compradors: àudio de veu, transcripcions, activitat de navegació durant la sessió i preferència d'idioma. El correu només es recull si el comprador ha iniciat sessió a la teva botiga Shopify. Dels comerços: dades de la botiga, preferències de configuració i els tokens d'accés de Shopify necessaris per operar l'app.",
      },
      "train-on-data": {
        question: "Entreneu models d'IA amb les dades dels compradors?",
        answer:
          "**No.** Els enregistraments de veu i les transcripcions no es fan servir mai per entrenar cap model d'IA, ni nostre ni dels nostres subencarregats. Per defecte, AWS Bedrock no fa servir les dades del client per entrenar models; Anthropic no entrena els seus models amb dades de clients d'API ni de Bedrock; i la nostra integració amb ElevenLabs està configurada perquè l'àudio de les converses no es faci servir per millorar els seus models.",
      },
      "sub-processors": {
        question: "Qui són els vostres subencarregats?",
        answer:
          "**ElevenLabs** per a veu a text, text a veu i orquestració de l'agent de veu. **Anthropic** (família Claude) per a la generació de respostes, via ElevenLabs i via AWS Bedrock per a tasques de backend. **Amazon Web Services** per a allotjament, emmagatzematge i inferència de models a Bedrock. **Shopify** per al context de botiga i client. Els terminis de conservació i les regions de processament són a la nostra política de privadesa.",
      },
      "gdpr-compliant": {
        question: "Bizmis compleix el RGPD?",
        answer:
          "Sí. Bizmis actua com a encarregat del tractament per compte del comerç pel que fa a les dades dels compradors; la secció 12 de les nostres condicions és un DPA de l'article 28 del RGPD. Els compradors conserven els seus drets RGPD/CPRA: accés, rectificació, supressió, limitació i portabilitat. Atenem els webhooks de compliment obligatoris de Shopify i responem sol·licituds directes a hello@bizmis.ai. Les clàusules contractuals tipus de la UE estan disponibles a petició.",
      },
      "data-retention": {
        question: "Quant de temps guardeu les dades de conversa?",
        answer:
          "Les metadades de sessió s'eliminen automàticament després de 60 minuts d'inactivitat. Els enregistraments i les transcripcions es conserven mentre la teva instal·lació estigui activa. Després de desinstal·lar, les dades es mantenen durant la finestra de reinstal·lació de 48 hores de Shopify i després s'eliminen en un termini de 30 dies des del webhook shop/redact. Qualsevol conversa es pot esborrar sota petició en qualsevol moment.",
      },
      "shopify-only": {
        question: "Bizmis només funciona amb Shopify?",
        answer:
          "Sí. Bizmis està creat específicament per a Shopify i fa servir les seves APIs per a dades de productes, clients, comandes i polítiques. No hi ha plans de donar suport a altres plataformes a curt termini.",
      },
      "what-syncs": {
        question: "Què sincronitza Bizmis de la meva botiga?",
        answer:
          "Productes i col·leccions, preus i descomptes, fitxes de client (quan han iniciat sessió), historial de comandes i polítiques de la botiga (enviaments, devolucions, FAQ). La sincronització és automàtica i contínua: quan actualitzes un producte, Bizmis ho veu.",
      },
      "private-testing": {
        question: "Puc provar Bizmis sense mostrar-lo als compradors?",
        answer:
          "Sí. Bizmis es manté ocult fins que un administrador activa la seva integració al tema. Per provar respostes reals en privat, duplica el tema publicat, activa Bizmis només a la còpia no publicada i obre-la amb la vista prèvia de temes de Shopify. Utilitzarà el teu catàleg i les teves polítiques reals mentre la botiga publicada es manté intacta. L'interruptor Pausa del tauler de Bizmis l'oculta immediatament en qualsevol moment.",
      },
      permissions: {
        question: "Quins permisos demana Bizmis?",
        answer:
          "Bizmis llegeix productes, clients, comandes i polítiques de la botiga per respondre preguntes de venda i suport. L'accés a les polítiques legals és només de lectura, de manera que no les pot editar. L'únic accés d'escriptura és a Shopify Files i només s'utilitza quan tries pujar una imatge, com ara el teu logotip, per a la samarreta de l'avatar. Bizmis no modifica fitxers existents.",
      },
      uninstall: {
        question: "Què passa si desinstal·lo l'app?",
        answer:
          "El widget s'atura immediatament, Shopify elimina l'extensió del tema i revoca els tokens d'accés de Bizmis. Conservem les dades de configuració i conversa durant la finestra de reinstal·lació de 48 hores de Shopify per poder restaurar el teu compte si reinstal·les. Després, Shopify activa l'eliminació i esborrem aquestes dades en un termini de 30 dies. Qualsevol imatge de l'avatar que hagis pujat roman als teus propis Shopify Files i la pots eliminar allà.",
      },
    },
  },

  contact: {
    title: "Parlem-ne",
    lead: "Tens preguntes sobre Bizmis? Ens encantarà llegir-te. Escriu-nos i et respondrem al més aviat possible.",
    successTitle: "Missatge enviat!",
    successBody: "Gràcies per escriure'ns. Et respondrem al més aviat possible.",
    sendAnother: "Envia un altre missatge",
    errorBody:
      "No s'ha pogut enviar el missatge. Torna-ho a provar o escriu-nos directament a",
    nameLabel: "El teu nom",
    namePlaceholder: "Joan Puig",
    emailLabel: "Correu electrònic",
    emailPlaceholder: "joan@exemple.com",
    subjectLabel: "Assumpte",
    subjectPlaceholder: "En què et podem ajudar?",
    messageLabel: "Missatge",
    messagePlaceholder: "Explica'ns més sobre la teva consulta o el teu feedback...",
    sending: "Enviant...",
    send: "Envia el missatge",
    orEmailUs: "O escriu-nos directament a",
  },

  earlyAccessPage: {
    badge: (cap: number) => `Només les primeres ${cap} botigues`,
    titleLine1: "Uneix-te al programa",
    titleLine2: "d'accés anticipat",
    /** The hero's lead as three scannable facts: the key part (bold) and the rest. */
    leadPoints: (cap: number) => [
      { strong: `Només ${cap} botigues Shopify`, rest: "hi poden entrar" },
      { strong: `Instal·la Bizmis gratis`, rest: "mentre l'accés anticipat estigui obert" },
      { strong: `Conserva els teus avantatges de membre`, rest: "quan canviïs de pla" },
    ],
    seeLiveDemo: "Mira la demo en directe",
    bookFounderCall: "Reserva 30 min amb el fundador",
    avatarAlt: "Invitació a l'accés anticipat de Bizmis",
    benefitsBadge: "Avantatges de l'accés anticipat",
    benefitsTitle: "Això és el que t'emportes",
    benefitsLead:
      "El que rep cada membre de l'accés anticipat.",
    benefits: [
      {
        title: "Gratis com a membre*",
        detail:
          "Activa l'accés anticipat a l'app i fes servir 120 sessions en directe sense cost. Sense subscripció, sense compromís.",
      },
      {
        title: "Defineix el full de ruta",
        detail:
          "El teu feedback té prioritat. Les preguntes dels teus compradors ajuden a decidir les properes funcions, correccions i decisions de producte.",
      },
      {
        title: "Suport prioritari",
        detail:
          "Línia directa amb el fundador per a dubtes d'instal·lació, guia de configuració i ajuda prioritària com a membre d'accés anticipat.",
      },
      {
        title: "Descomptes exclusius",
        detail:
          "El teu codi d'accés anticipat desbloqueja preus mensuals d'inici amb descompte quan canviïs de pla.",
      },
    ],
    ctaTitle: "Tria per on començar",
    fastestPath: "La via més ràpida",
    installCardBody: "Activa l'accés anticipat des de la mateixa app de Shopify.",
    wantHelp: "Vols ajuda?",
    bookCallTitle: "Reserva una trucada amb el fundador",
    bookCallBody: "30 minuts de recorregut guiat abans d'instal·lar.",
    seeDemoFirst: "Mira abans la demo en directe",
    founderLed: "Projecte liderat pel seu fundador. Dubtes?",
    footnote:
      "*Gratis per a membres d'accés anticipat = 120 sessions en directe, una sola vegada per botiga, sense renovació.",
  },

  unsubscribe: {
    confirmTitle: "Vols donar-te de baixa dels correus de Bizmis?",
    confirmBody:
      "Deixaràs de rebre invitacions d'accés anticipat i altres correus de Bizmis.",
    confirmButton: "Confirma la baixa",
    processing: "Processant la teva sol·licitud...",
    successTitle: "T'has donat de baixa",
    successBody:
      "No rebràs més correus nostres. Si ha estat un error, respon a qualsevol correu anterior o escriu-nos a",
    errorTitle: "Alguna cosa ha fallat",
    invalidLink:
      "Aquest enllaç de baixa no és vàlid. Si hi has arribat des d'un correu, escriu-nos a hello@bizmis.ai.",
    genericError: "Alguna cosa ha fallat. Torna-ho a provar.",
    networkError:
      "No hem pogut connectar amb el servidor. Torna-ho a provar o escriu-nos a hello@bizmis.ai.",
    tryAgain: "Torna-ho a provar",
    questions: "Dubtes?",
  },

  notFound: {
    title: "404",
    message: "Vaja, no hem trobat aquesta pàgina",
    backHome: "Torna a l'inici",
  },

  seo: {
    home: {
      title: "Bizmis | El dependent per veu per a la teva botiga Shopify",
      description:
        "Bizmis saluda els compradors, respon les seves preguntes i els guia fins a la compra, com un bon dependent, 24/7 dins la teva botiga Shopify.",
      jsonLdDescription:
        "Dependent per veu per a Shopify que saluda els compradors, respon preguntes i els guia fins a la compra.",
    },
    pricing: {
      title: "Preus de Bizmis | Plans per a botigues Shopify",
      description:
        "Preus clars de Bizmis per a botigues Shopify de qualsevol mida. Tria un pla, instal·la'l en un clic i comença a vendre amb un dependent per veu.",
    },
    faqs: {
      title: "Preguntes freqüents de Bizmis | Instal·lació, preus i dades",
      description:
        "Respostes als dubtes habituals sobre Bizmis: com funciona a Shopify, instal·lació, dades, comportament de la veu, preus i més.",
    },
    contact: {
      title: "Contacte Bizmis | Parlem-ne",
      description:
        "Contacta amb l'equip de Bizmis sobre la instal·lació a Shopify, webs a mida, col·laboracions o el que necessitis. Responem ràpid.",
    },
    earlyAccess: {
      title: "Accés anticipat a Bizmis | Gratis, 50 primeres botigues",
      description:
        "Uneix-te a l'accés anticipat de Bizmis: instal·la'l gratis, línia directa amb el fundador, defineix el full de ruta i conserva els descomptes.",
    },
    notFound: {
      title: "Pàgina no trobada | Bizmis",
      description:
        "Aquesta pàgina no existeix. Torna a Bizmis, el dependent per veu per a botigues Shopify.",
    },
    /** The social preview image's alt text (og:image:alt). */
    ogImageAlt: "Bizmis, el dependent per veu per a botigues Shopify",
  },
};
