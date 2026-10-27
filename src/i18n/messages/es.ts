import type { Messages } from "./en";

export const es: Messages = {
  common: {
    installNow: "Instalar ahora",
    installOnShopify: "Instalar en Shopify",
    installOnYourStore: "Instalar en tu tienda",
    installBizmisOnShopify: "Instalar Bizmis en Shopify",
    liveDemo: "Demo",
    bookACall: "Reservar una llamada",
    getStarted: "Empezar",
    contactSupport: "Contactar con soporte",
    contactSales: "Hablar con ventas",
    soon: "Pronto",
    email: "hello@bizmis.ai",
  },

  languageSwitcher: {
    label: "Idioma",
    ariaLabel: "Elegir idioma",
  },

  nav: {
    earlyAccess: "Acceso anticipado",
    benefits: "Ventajas",
    setup: "Instalación",
    pricing: "Precios",
    faqs: "Preguntas frecuentes",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
  },

  hero: {
    badgeLabel: "Acceso anticipado",
    badgeDetailShort: "Primeras 50 tiendas",
    badgeDetailLong: "Gratis para las primeras 50 tiendas Shopify",
    titleLine1: "El mejor vendedor",
    // Non-breaking space keeps "ahora online" together if this line wraps.
    titleLine2: "de tu tienda, ahora\u00A0online",
    subtitleLead: "Ayuda a cada cliente a",
    subtitleFind: "encontrarlo",
    subtitleTrust: "confiar",
    subtitleBuy: "comprarlo",
    subtitleConnector: " y a",
    pitchLead: "Esto no es un chatbot.",
    pitchShort:
      "Los clientes se van cuando no encuentran el producto adecuado o dudan antes de comprar, justo los momentos que un dependiente resolvería en tienda. Bizmis lleva esa ayuda a tu web, con voz, acotando tu catálogo al producto correcto y despejando dudas para que compren con confianza.",
    pitchLong:
      "Los clientes se van cuando no encuentran el producto adecuado o dudan antes de comprar, justo los momentos que un dependiente resolvería en tienda. Bizmis lleva esa ayuda a tu web, con voz. Escucha, acota tu catálogo al producto correcto y despeja las dudas para que compren con confianza.",
    installSubline: "Instalación en un clic, listo en minutos",
    alsoAvailableFor: "También disponible para",
    customWebsites: "webs a medida",
    ratherTalk: "¿Prefieres que lo hablemos?",
    avatarAlt: "Asistente de ventas digital atendiendo a clientes",
    agentHello: "¡Hola! Soy tu agente de ventas Bizmis.",
    agentPitch: "Entiendo lo que necesita cada cliente, resuelvo sus dudas y te consigo la venta.",
    agentInvite: "¡Dale al play y mírame vender!",
  },

  film: {
    watch: "Mira el vídeo",
    replay: "Volver a ver",
    play: "Reproducir",
    pause: "Pausa",
    mute: "Silenciar",
    unmute: "Activar sonido",
    enterFullscreen: "Pantalla completa",
    exitFullscreen: "Salir de pantalla completa",
    seek: "Buscar",
    region: "Vídeo de Bizmis",
    quality: "Calidad",
    auto: "Auto",
    close: "Cerrar el vídeo",
  },

  /** The film-led landing (/v2): copy it adds to the classic landing's messages. */
  landing: {
    /** The hero's line under the title (the classic keeps hero.subtitle*): the last part is the merchant's win, highlighted. */
    heroLine: ["Entiende necesidades.", "Resuelve dudas.", "Gana ventas."],
    /** Under the hero's Install button (the classic landing keeps hero.installSubline). */
    installSubline: "Instalación en un clic, lista al instante",
    switch: {
      chatbot: "Chatbot",
      agent: "Agente de ventas",
      toggleAria: "Compara un chatbot típico con el agente de ventas de Bizmis",
      chatbotMessage: "¡Hola! ¿En qué puedo ayudarte hoy?",
      chatbotReply: "Aquí tienes algunos enlaces que pueden ayudarte.",
      agentMessage: "¿Buscas un regalo? Dime para quién es y encontraré el ideal.",
      /** What the shopper does: with a chatbot, then with the Bizmis sales agent. */
      shopper: "Tu cliente",
      chatbotOutcome: ["No lo encuentra", "Duda", "Se va"],
      agentOutcome: ["Lo encuentra", "Confía", "Lo compra"],
      /** The shopper's patience while using the chatbot: it drains with every reply. */
      patience: {
        label: "Paciencia del cliente",
        reading: "+{s} s de lectura",
        stages: ["Leyendo un muro de texto…", "Leyendo en diagonal. Sigue sin respuesta.", "Abriendo la web de la competencia…", "Escribiendo \"quiero hablar con una persona\"…", "Se fue."],
        leftTitle: "El cliente se fue.",
        leftBody: "Venta perdida. Nadie se dio cuenta.",
        cta: "Prueba el agente de ventas",
      },
      /** The typical chatbot, interactive: verbose, dull, useless to sell. */
      bot: {
        title: "Chatbot",
        hint: "Venga, pregúntale algo",
        placeholder: "Escribe tu mensaje...",
        send: "Enviar",
        open: "Abrir chat",
        close: "Cerrar chat",
        greeting: "¡Hola! 👋 Soy tu asistente virtual. ¿En qué puedo ayudarte hoy? Elige una de las opciones de abajo o escribe tu pregunta.",
        chips: ["Seguir pedido", "Devoluciones", "Contacto"],
        helpful: "¿Te ha resultado útil?",
        product: "¡Gracias por tu mensaje! Este producto forma parte de nuestra colección más vendida y es una gran opción para muchas ocasiones. Encontrarás todos los detalles, incluidos materiales, medidas e instrucciones de cuidado, en la descripción del producto. Ten en cuenta que los plazos de entrega pueden variar según tu ubicación y el método de envío elegido al pagar. Para información sobre cambios y reembolsos, consulta nuestra página de Política de devoluciones. Nuestro equipo de soporte suele responder en 2–3 días hábiles. ¿Hay algo más en lo que pueda ayudarte hoy?",
        productLinks: ["Política de devoluciones", "Información de envío"],
        track: "Para seguir tu pedido, introduce tu número de pedido y el correo que usaste al pagar en nuestra página de Seguimiento de pedidos. El número de pedido empieza por # y lo encontrarás en tu correo de confirmación. La información de seguimiento puede tardar 24–48 horas en actualizarse tras el envío. Si no has recibido el correo de confirmación, revisa tu carpeta de spam.",
        trackLinks: ["Seguimiento de pedidos"],
        returns: "Aceptamos devoluciones en un plazo de 30 días desde la entrega, siempre que los artículos no se hayan usado ni lavado y estén en su embalaje original con todas las etiquetas. Los artículos rebajados, las tarjetas regalo y los productos personalizados no admiten devolución. Para iniciar una devolución, visita nuestro Portal de devoluciones. Los reembolsos se emiten al método de pago original en 5–10 días hábiles tras recibir e inspeccionar la devolución. Los gastos de envío de la devolución no son reembolsables.",
        returnsLinks: ["Portal de devoluciones"],
        contact: "Nuestro equipo de atención al cliente está disponible de lunes a viernes, de 9:00 a 17:00, excepto festivos. Escríbenos por correo e incluye tu número de pedido en el asunto. Intentamos responder a todas las consultas en 2–3 días hábiles. ¡Gracias por tu paciencia!",
        contactLinks: ["Formulario de contacto"],
        human: "Lo siento, ahora mismo no hay agentes disponibles. Déjanos tu correo electrónico y un miembro de nuestro equipo te responderá en 2–3 días hábiles.",
        confused: "Lo siento, no he entendido bien tu mensaje. ¿Podrías reformular tu pregunta? También puedes elegir una de las opciones de abajo.",
        thanks: "¡Gracias por tu opinión! Trabajamos constantemente para mejorar nuestro servicio.",
      },
    },
    /** The film's end-card scarcity line. */
    onlySpots: "¡Solo 50 plazas!",
    /** The personalization carousel. */
    carousel: { label: "Elige un avatar", prev: "Avatar anterior", next: "Avatar siguiente" },
    yourStore: "Tu tienda",
    agentAlt: "El avatar del agente de ventas de Bizmis",
    /** UI text of the real widget, as it appears in the mockups. */
    widget: {
      placeholder: "Ayúdame a encontrar el producto ideal.",
      /** The hero widget's rotating composer placeholders (the first is placeholder). */
      placeholders: ["Ayúdame a encontrar el producto ideal.", "Compárame las mejores opciones.", "¿Esto me sirve para lo que necesito?", "¿Me resuelves una duda de compra?"],
      takingYouTo: "Te llevo a",
      addingToCart: "Añadiendo al carrito",
      searchResults: "Resultados de búsqueda",
      cartItem: "Esfera",
    },
    /** Boost Sales on /v2: the title stays on screen while each sub-benefit lights up its part (find it / trust it / buy it). */
    sales: {
      titleLead: "",
      titleParts: ["Entiende necesidades.", "Resuelve dudas.", "Gana ventas."],
      stages: ["Descubrimiento", "Decisión", "Pago"],
      panels: [
        { title: "Más clientes encuentran lo suyo", body: "Reduce tu catálogo a los pocos que encajan." },
        { title: "Las dudas se vuelven decisiones", body: "Compara, aconseja y responde cada duda." },
        { title: "Los carritos se vuelven pedidos", body: "Resuelve las dudas de última hora y los lleva al pago." },
      ],
      payoff: { kicker: "Todo junto", title: "Visitas convertidas en ventas.", body: "Sin cansancio. Sin bloqueos. Sin dudas.", jar: "Ventas" },
      findQuery: "Un regalo para mi hermana, menos de 50 €",
      findCaption: "Aquí tienes tres que le van a encantar.",
      compareQuery: "¿Cuál me llevo?",
      compareCaption: "Este. Es el más ligero y el mejor valorado.",
      bestMatch: "El mejor",
      decided: "En el carrito",
      buyQuery: "¿Llega antes del viernes?",
      buyCaption: "Sí, sale hoy y la devolución es gratis. ¿Vamos a pagar?",
      /** Each beat's words: the merchant's loss, struck through at the fix, then the win written in. No figures. */
      flip: [
        { problem: "Los visitantes que recorren tu catálogo [[se cansan y abandonan]].", fix: "Los visitantes que recorren tu catálogo [[encuentran rápido productos que valen la pena]]." },
        { problem: "Los clientes que comparan opciones [[se bloquean y se van]].", fix: "Los clientes que comparan opciones [[eligen con seguridad]]." },
        { problem: "Los compradores a punto de comprar [[dudan y se frenan]].", fix: "Los compradores a punto de comprar [[se deciden y pasan al pago]]." },
      ],
      openers: ["Visitantes que quieren el producto adecuado", "Compradores dudando entre opciones", "Compradores con el carrito lleno"],
      /** ?beat=1..6: the small labels of the alternative loss → win looks. */
      flipLabels: { lose: "Pierdes", win: "Ganas", you: "Tú, hoy", withBizmis: "Con Bizmis" },
      /** ?beat=4: each loss as the merchant says it (the speech bubble). */
      flipQuote: [
        "Los clientes se cansan de buscar en mi catálogo y compran lo mismo a la competencia.",
        "Mis clientes indecisos se van a comparar y acaban comprando a otro.",
        "Los clientes llegan al pago, les surge una última duda y se van.",
      ],
      /** The one-shopper variant (?case=one): the same shopper and gift from Find through Trust to Buy. */
      caseOne: {
        compareQuery: "¿Cuál de los tres le gustará más?",
        compareCaption: "Este. Es el mejor valorado de los tres.",
        buyQuery: "¿Llega antes de su cumpleaños, el viernes?",
        buyCaption: "Sí, sale hoy y la devolución es gratis. ¿Vamos a pagar?",
      },
      cart: { title: "Tu carrito", add: "Añadir al carrito", subtotal: "Subtotal", checkout: "Pagar", perks: ["Sale hoy", "Devolución gratis"], placed: "Pedido realizado" },
      funnel: {
        problems: ["Se cansan de buscar", "Se van a comparar", "Abandonan el carrito"],
        solutions: ["Lo encuentran rápido", "Deciden aquí", "Compran"],
        /** The word at the open mouth, with its arrow: the dots are store visits. */
        visits: "visitas",
      },
      /** ?win=4..6: the metrics merchants know, drawn moving the right way as stages get fixed (no figures). */
      metrics: {
        conversion: "Tasa de conversión",
        orders: "Pedidos",
        abandoned: "Carritos abandonados",
        ordersToday: "Pedidos de hoy",
        before: "antes",
        after: "después",
      },
      pulse: { currency: "EUR" },
    },
    support: {
      title: "Recorta la carga de soporte.",
      titleTail: "Día y noche.",
      /** The area's full name, the chapter eyebrow over the outcome (the pillar openers, ?open=1..6). */
      area: "Atención al cliente",
      lead: "Atiende a cada cliente, de día o de noche, con la calidez de tu mejor dependiente.",
      /** The support mockup's widget placeholder (the composer's prompt before the shopper types). */
      placeholder: "Pregúntame por tu pedido.",
      /** The pillar's animation, the merchant's support at scale: questions round the clock piling up as tickets, then answered
       * right away by voice once the agent lands. One label, as the Sales funnel's: the loss, struck at the fix, then the win (short, present tense). */
      day: {
        label: "Preguntas de clientes a todas horas: se acumulan como tickets en la bandeja de soporte hasta que llega el agente, y desde entonces cada una se responde al momento, en voz alta",
        problem: "Se acumulan tickets",
        solution: "Respuesta al momento",
        inbox: "Bandeja de soporte",
      },
      options: {
        sky: { label: "Las preguntas de los clientes llegan de día y de noche; se responden en voz alta antes de llegar a la bandeja de soporte, que queda despejada", problem: "La bandeja se desborda", solution: "Bandeja despejada, de día y de noche" },
        clock: { label: "Las preguntas de los clientes llegan de todas partes y se acumulan en la bandeja de soporte; cuando llega el agente responde las pendientes y atrapa las nuevas, y solo quedan las pocas que necesitan al comerciante", problem: "Las preguntas se acumulan", solution: "Solo las pocas que te necesitan" },
        morning: { label: "Preguntas toda la noche, respondidas en voz alta al llegar: el comerciante se despierta con la bandeja vacía", problem: "Preguntas toda la noche", solution: "Despiertas con la bandeja vacía" },
      },
    },
    insights: {
      title: "Mira qué vende.",
      titleTail: "Arregla lo que no.",
      /** The area's full name, the chapter eyebrow over the outcome (the pillar openers, ?open=1..6). */
      area: "Datos de tu tienda",
      lead: "Cada conversación se convierte en un siguiente paso claro.",
      clarity: {
        snippets: ["¿Enviáis a Canadá?", "¿Talla M o L?", "¿Devoluciones?", "¿Envoltorio de regalo?"],
        topAsk: "Lo más preguntado: envíos",
      },
      options: {
        why: {
          label: "Muchas sesiones que acabaron sin venta, repasadas de una vez: aparece lo que estorbaba",
          problem: "¿Por qué no compran?",
          reasons: ["Un pop-up tapa el carrito", "La búsqueda no encuentra nada", "El envío aparece demasiado tarde", "La página tarda en cargar", "Se van a buscar cupones"],
        },
        carts: { label: "Una semana de carritos abandonados, revisada día a día, se reduce a un motivo", problem: "Carritos abandonados toda la semana", solution: "El motivo: las tallas" },
        week: { label: "Una semana de conversaciones ordenada en una imagen de lo que quieren los clientes", problem: "Demasiadas para leer", solution: "Lo que quieren tus clientes" },
      },
    },
    /** Boost Sales's area, the chapter eyebrow over its outcome (its outcome is already "Boost Sales"). */
    salesArea: "Ventas",
    customize: {
      /** The section's own eyebrow (a pill, as the pillars' openers) and title, in sentence case. */
      eyebrow: "Personalización",
      title: "Hazlo totalmente tuyo",
      lead: "Elige su aspecto y pon tu logo en su camiseta.",
      avatar: { title: "Tu avatar", body: "Elige una cara que encaje con tu marca." },
      voice: { title: "Tu voz", body: "Clónala para que suene como tú." },
    },
    /** The closing card, as the film's: the title is the install button, then the handwritten invite and, apart, the note. */
    endCard: {
      install: "Instalar ahora",
      invite: "¡con las ventajas de Early Access!",
      note: "¡Solo 50 plazas!",
      /** The ad-1 film's Early Access perks, then the quieter extras under them. */
      perks: ["120 sesiones gratis", "50% de descuento al mejorar tu plan", "Decide el roadmap con nosotros"],
      extras: ["Sin tarjeta", "Sin compromiso", "Línea directa con el fundador"],
    },
    setup: {
      /** The eyebrow (a pill, as the pillars' openers) and the store card's rows (same order as setup.dataCards), in sentence case; the classic landing keeps setup.badge and setup.dataCards. */
      eyebrow: "Listo para usar",
      cards: ["Web de la tienda", "Catálogo de productos", "Descuentos", "Políticas", "Clientes", "Pedidos"],
      title: "Instalación en un clic",
      /** The lead reads on from the title ("One-click setup" …and your agent's selling right away.), then one short line. */
      leadOn: "…y tu agente ya está vendiendo.",
      leadSync: "Cada cambio se sincroniza solo.",
      install: "Instalar",
      storeTitle: "Tu tienda online",
      syncing: "Sincronizando tu tienda",
      synced: "Sincronizada",
      alwaysInSync: "Siempre sincronizado",
    },
  },

  benefits: {
    sales: {
      badge: "Más ventas",
      title: "Convierte. Aumenta. Fideliza.",
      leadShort:
        "Un gran dependiente que guía a tus clientes, sube el valor del carrito y hace que vuelvan.",
      leadLong:
        "Bizmis actúa como un gran dependiente de tienda: guía a los clientes, aumenta el valor del carrito y crea esa experiencia cercana y personal que hace que vuelvan.",
      pillars: [
        {
          title: "Convierte más visitas",
          subtitle: "Elimina las dudas de compra",
          body: "Bizmis responde al instante y guía a cada cliente hasta el producto adecuado, así más visitas se deciden a comprar.",
        },
        {
          title: "Aumenta el valor del pedido",
          subtitle: "Ventas cruzadas inteligentes",
          body: "Recomendaciones, mejoras y productos complementarios que aparecen de forma natural durante la conversación.",
        },
        {
          title: "Fideliza a tus clientes",
          subtitle: "Una experiencia de compra personal",
          body: "Una experiencia de compra cercana que los clientes recuerdan y por la que vuelven.",
        },
      ],
    },
    support: {
      badge: "Atención al cliente",
      titleLine1: "Ahorra horas de soporte.",
      titleLine2: "Gana clientes fieles.",
      leadShort:
        "Soporte inmediato y empático 24/7 que se siente humano: sube la satisfacción y te ahorra horas de trabajo.",
      leadLong:
        "La inteligencia emocional y el soporte instantáneo 24/7 mejoran la satisfacción del cliente con respuestas inmediatas, cercanas y empáticas, como la ayuda de un buen dependiente, mientras ahorras un tiempo valioso de soporte.",
      outcomes: {
        saveHours: "Ahorra horas de soporte",
        betterReviews: "Consigue mejores reseñas",
        repeatSales: "Aumenta la recompra",
      },
      capabilities: [
        {
          title: "Soporte instantáneo 24/7",
          tagline: "Sin esperas, sin frustración",
          body: "Tus clientes reciben ayuda en el momento en que la necesitan: sin esperas, sin frustración y sin malas reseñas por preguntas sin responder.",
        },
        {
          title: "Conoce tu tienda",
          tagline: "Políticas, productos y documentación al instante",
          body: "Responde al instante sobre políticas, productos y documentación, así tus clientes reciben respuestas claras sin esperar a tu equipo.",
        },
        {
          title: "Inteligencia emocional",
          tagline: "Respuestas cercanas y empáticas",
          body: "Una IA que entiende las emociones del cliente y responde con verdadera atención y comprensión.",
        },
      ],
    },
    insights: {
      badge: "Datos de tu tienda",
      title: "Aprende. Ajusta. Crece.",
      lead: "Descubre dónde dudan tus compradores, qué preguntan y qué caminos convierten, para corregir menos, ahorrar horas e invertir donde crecen los ingresos.",
      features: [
        {
          title: "Repeticiones de sesión",
          tagline: "Ve directo a los abandonos",
          body: "Ve directo a los puntos de abandono y de duda. Corrige una vez, evita carritos abandonados y recupera ventas en riesgo.",
        },
        {
          title: "Conversaciones etiquetadas",
          tagline: "Un arreglo, menos tickets repetidos",
          body: "Las conversaciones se agrupan solas por tema e intención. Actualiza una FAQ o política, reduce tickets repetidos y baja la carga de soporte.",
        },
        {
          title: "Análisis del embudo",
          tagline: "Detecta de un vistazo lo que más rinde",
          body: "Consulta rutas de conversión, abandonos e impacto por producto de un vistazo. Prioriza lo que más rinde y refuerza lo que funciona.",
        },
      ],
    },
  },

  salesDemo: {
    steps: ["Descubrir y recomendar", "Comparar productos", "Cerrar la venta"],
    recommended: "Recomendado",
    added: "Añadido",
    orderConfirmed: "Pedido confirmado",
    subtotal: "Subtotal",
    shipping: "Envío",
    free: "Gratis",
    total: "Total",
    assistantAlt: "Asistente Bizmis",
    deliveryEstimate: "Entrega en 2-3 días",
    productLabels: {
      cozyPick: "Acogedor",
      proPick: "Para expertos",
      greatValue: "Buen precio",
      recurring: "Suscripción",
      onTheGo: "Para llevar",
      calming: "Relajante",
    },
    productNames: {
      cozyCandles: "Set de velas de hogar",
      frenchPress: "Kit de prensa francesa",
      ethiopianBeans: "Café de Etiopía",
      roastSubscription: "Suscripción de café",
      travelMug: "Taza de viaje",
      scentedCandles: "Velas aromáticas",
    },
    shopperQuotes: {
      birthdayGift: '"Busco un regalo de cumpleaños."',
      morningRoutine: '"Ayúdame a montar mi rutina de mañana."',
      cozyForMom: '"Algo acogedor para mi madre."',
      campingCoffee: '"Necesito café para ir de acampada."',
    },
  },

  supportDemo: {
    steps: ["Pregunta recibida", "Fuente consultada", "Resuelto"],
    done: "Listo",
    processing: "Procesando",
    assistantAlt: "Asistente de soporte de Bizmis",
    cases: {
      returnPolicy: {
        quote: '"¿Puedo devolverlo si no me queda bien?"',
        action: "Política consultada",
        response:
          "Claro, tienes 30 días. Si quieres, te explico cómo hacerlo paso a paso.",
      },
      orderTracking: {
        quote: '"¿Dónde está mi pedido?"',
        action: "Pedido localizado",
        response:
          "Salió ayer y debería llegar el lunes. ¿Te paso el enlace de seguimiento?",
      },
      shippingTime: {
        quote: '"¿Cuánto tarda el envío?"',
        action: "Envío comprobado",
        response:
          "Normalmente 2-3 días laborables. También puedo enseñarte opciones más rápidas.",
      },
      changeAddress: {
        quote: '"Puse mal la dirección de envío."',
        action: "Dirección actualizada",
        response: "Sin problema, puedo cambiarla antes de que salga el pedido.",
      },
      cancelOrder: {
        quote: '"¿Puedo cancelar mi pedido?"',
        action: "Pedido cancelado",
        response: "Sí, todavía no se ha procesado. Puedo cancelarlo ahora.",
      },
      warranty: {
        quote: '"¿Esto tiene garantía?"',
        action: "Garantía confirmada",
        response: "Sí, todo incluye 2 años de garantía.",
      },
      startReturn: {
        quote: '"Quiero devolver esto."',
        action: "Devolución iniciada",
        response: "Por supuesto. Puedo iniciar la devolución por ti.",
      },
    },
  },

  sessionReplay: {
    categories: {
      sale: "Venta",
      support: "Soporte",
    },
    tabTooltips: {
      sale: "Sesión de venta anónima, búsqueda de regalo que acaba en compra",
      saleLoyal: "Sesión de venta con usuario identificado, cliente recurrente",
      supportSuccess: "Sesión de soporte, consulta de política resuelta",
      supportFailed: "Sesión de soporte, solicitud no completada",
    },
    successful: "Resuelta",
    unresolved: "Sin resolver",
    anonymousCustomer: "Cliente anónimo",
    customer: "Cliente",
    vip: "VIP",
    transcriptNote: "Sesión grabada, idioma original",
  },

  setup: {
    badge: "Listo para usar",
    title: "Instalación en un clic, ventas y soporte al momento",
    lead: "Instala la app de Bizmis para Shopify y empieza a vender y atender clientes de inmediato.",
    storeDataTitle: "Los datos de tu tienda Shopify",
    dataCards: [
      { title: "Web de la tienda", description: "Visión, misión y valores" },
      {
        title: "Catálogo de productos",
        description: "Colecciones, inventario, pedidos de compra",
      },
      { title: "Descuentos", description: "Todas las promociones activas" },
      {
        title: "Políticas",
        description: "Envíos, devoluciones y políticas de la tienda",
      },
      {
        title: "Clientes",
        description: "Historial de ventas y soporte por cliente",
      },
      { title: "Pedidos", description: "Historial de pedidos" },
    ],
    badges: {
      oneClick: "Instalación en un clic",
      alwaysSynced: "Siempre sincronizado",
      readyInMinutes: "Listo en minutos",
    },
    ctaNote: "Empieza a vender y atender clientes ahora.",
  },

  customization: {
    badge: "Personalización",
    titleLead: "Hazlo",
    titleHighlight: "totalmente tuyo",
    lead: "Construye relaciones auténticas que generan fidelidad personalizando la voz y la apariencia.",
    avatar: {
      title: "Avatar personalizado",
      body: "Crea conexiones auténticas haciendo que tu representante de ventas hable y se vea como tú.",
    },
    voiceCloning: {
      title: "Clonación de voz",
      body: "Interacciones auténticas replicando tu forma de hablar y tu personalidad.",
    },
    imageAlt: "Centro de personalización: voz y apariencia",
  },

  finalCta: {
    title: "Instala en Shopify en 1 clic. Empieza a vender hoy.",
    lead: "Bizmis saluda a tus visitantes, responde sus preguntas y los guía hasta el checkout, totalmente sincronizado con tus productos, descuentos y pedidos de Shopify.",
    bullets: [
      "Saluda y cualifica a los compradores",
      "Compara productos y recomienda",
      "Atiende el soporte y reduce tickets",
    ],
    installAria: "Instalar Bizmis en Shopify",
    bookCallAria: "Reservar una llamada con el equipo de Bizmis",
    cancelAnytime: "Cancela cuando quieras",
    gdprReady: "Cumple el RGPD",
    builtForShopify: "Built for Shopify",
  },

  earlyAccessCard: {
    badge: "Acceso anticipado",
    titleLead: "Llega primero.",
    titleHighlight: "Vende más.",
    lead: "Únete al grupo exclusivo de los primeros 50 comercios que están definiendo el futuro del comercio conversacional.",
    perks: [
      {
        title: "50% de descuento los 3 primeros meses",
        caption: "Asegura nuestro precio de lanzamiento más bajo.",
      },
      {
        title: "Influencia directa en la hoja de ruta",
        caption: "Tus peticiones de funciones pasan a tener prioridad.",
      },
      {
        title: "Onboarding VIP",
        caption: "Sesión de configuración y arranque personalizada incluida.",
      },
    ],
    limitedSpots: "Plazas limitadas",
    cta: "Conseguir el acceso anticipado",
  },

  footer: {
    tagline:
      "El mejor vendedor de tu tienda, trabajando 24/7 para vender más, dar soporte y entender a tus clientes.",
    builtFor: "Hecho para",
    columns: {
      product: "Producto",
      support: "Soporte",
      legal: "Legal",
    },
    links: {
      features: "Funcionalidades",
      pricing: "Precios",
      demo: "Demo",
      contact: "Contacto",
      bookACall: "Reservar una llamada",
      faqs: "Preguntas frecuentes",
      privacy: "Política de privacidad",
      terms: "Términos del servicio",
    },
    legalNotice: "Las páginas legales están disponibles en inglés.",
    copyright: (year: number) =>
      `© ${year} Bizmis. Todos los derechos reservados.`,
  },

  pricing: {
    badge: "Precios",
    title: "Precios simples y transparentes",
    lead: "Elige el plan que encaja con tu negocio. Todos incluyen la integración completa con Shopify.",
    monthly: "Mensual",
    yearly: "Anual",
    billedYearly: "facturado anualmente",
    perMonth: "/mes",
    popular: "Popular",
    conversationsPerMonth: "sesiones / mes",
    extraConversations: (price: string) =>
      `Sesiones extra a ${price} cada una, hasta el límite de gasto que fijes`,
    conversationDefinition:
      "Una sesión es la visita de un cliente a tu dependiente, por voz o por texto. Las sesiones de más de 5 minutos de voz o 40 mensajes cuentan como dos. Las visitas en las que el cliente no dice nada son gratis.",
    off: "dto.",
    discountTitle: (percent: number) => `${percent}% menos que el precio de lista`,
    introPeriodTitle: "Periodo inicial con descuento",
    introMonths: (months: number, standardPrice: string) =>
      `${months === 1 ? "primer mes" : `primeros ${months} meses`}, después ${standardPrice} $/mes`,
    free: {
      name: "Gratis",
      noCommitment: "Sin compromiso",
      description: (conversations: string) =>
        `${conversations} sesiones gratis para probar Bizmis. Sin tarjeta.`,
      cta: "Empezar gratis",
    },
    plans: {
      starter: {
        name: "Starter",
        features: [
          "1 dependiente Bizmis",
          "Voz y texto",
          "Soporte: email (48 h)",
        ],
      },
      growth: {
        name: "Growth",
        features: [
          "Hasta 5 dependientes Bizmis",
          "Historial, transcripciones y repeticiones",
          "Personalización del avatar",
          "Soporte: email (24 h) y llamada programada",
        ],
      },
      scale: {
        name: "Scale",
        features: [
          "Dependientes Bizmis ilimitados",
          "Sesiones etiquetadas automáticamente",
          "Soporte prioritario y onboarding en directo",
        ],
      },
    },
    enterprise: {
      name: "Enterprise",
      priceFrom: "Desde",
      description:
        "Soluciones a medida para operaciones a gran escala, con volumen y requisitos personalizados.",
      everythingInScale: "Todo lo de Scale y además:",
      features: [
        "Volumen de sesiones a medida",
        "Capacidad garantizada para picos de tráfico",
        "SLA y voz personalizada",
        "Facturación fuera de Shopify",
      ],
    },
    guarantees: {
      spendLimit: "Tú decides tu límite de gasto",
      cancelAnytime: "Cancela cuando quieras",
      moneyBack: "30 días de garantía de devolución en los planes anuales",
      cardNote: "Garantía de devolución de 30 días en el plan anual",
      bannerTitle: "Prueba un plan anual sin riesgo durante 30 días",
      bannerBody: "Si Bizmis no te compensa en los primeros 30 días de tu plan anual, cancela y te devolvemos tu primer pago anual entero. Sin preguntas.",
    },
    coupon: {
      prompt:
        "¿Tienes un código de descuento? Introdúcelo y pulsa Enter o Aplicar para actualizar los precios.",
      placeholder: "Código de descuento",
      inputAria: "Código de cupón de descuento",
      apply: "Aplicar",
      applying: "Aplicando…",
      remove: "Quitar cupón",
      active: (label: string) => `${label} activo`,
      viewingPricing: (label: string, cap: number) =>
        `Estás viendo los precios de ${label}, reservados solo para nuestros primeros ${cap} comercios.`,
      shapeProduct:
        "Ayúdanos a dar forma al producto con tu feedback sobre la hoja de ruta. Los precios de arriba incluyen",
      monthlyDiscount: (percent: number, months: number) =>
        months > 0
          ? `${percent}% de descuento ${months === 1 ? "el primer mes" : `los primeros ${months} meses`}`
          : `${percent}% de descuento`,
      discountEnd: ".",
      onMonthlyBilling: "en facturación mensual, o",
      yearlyDiscount: (percent: number) => `${percent}% de descuento anual`,
      whenYearlySelected: "si eliges facturación anual.",
      errors: {
        empty: "Introduce primero un código.",
        notFound: "Ese código no es válido.",
        expired: "Ese código ha caducado.",
        notYetActive: "Ese código todavía no está activo.",
        invalidFormat: "El formato del código no cuadra, revisa si hay erratas.",
        alreadyClaimed: "Ese código ya se ha canjeado.",
        invalidToken: "La sesión ha caducado. Inténtalo de nuevo.",
        generic: "No hemos podido verificar el código. Inténtalo de nuevo.",
      },
    },
    viewAllFaqs: "Ver todas las preguntas frecuentes",
    enterpriseInquirySubject: "Consulta sobre el plan Enterprise",
  },

  faqsPage: {
    title: "Todo lo que necesitas saber sobre Bizmis",
    lead: "Respuestas a las preguntas más habituales sobre nuestro asistente de ventas para Shopify",
    searchPlaceholder: "Buscar preguntas...",
    searchAria: "Buscar preguntas frecuentes",
    allQuestions: "Todas las preguntas",
    noResults: "No hay preguntas que coincidan con tu búsqueda.",
    stillHaveQuestions: "¿Te queda alguna duda?",
    teamIsHere:
      "Nuestro equipo está aquí para ayudarte a sacar el máximo partido a Bizmis.",
  },

  faqs: {
    categories: {
      "getting-started": "Primeros pasos",
      "what-bizmis-does": "Qué hace Bizmis",
      "pricing-billing": "Precios y facturación",
      customization: "Personalización",
      "privacy-data": "Privacidad y datos",
      "shopify-integration": "Integración con Shopify",
    },
    items: {
      "what-is-bizmis": {
        question: "¿Qué es Bizmis?",
        answer:
          "Bizmis es un dependiente con IA y voz para Shopify. Saluda a los compradores, responde preguntas sobre productos, pedidos, devoluciones y políticas, y los guía hasta el checkout, igual que haría un buen dependiente en tienda. Funciona 24/7 dentro de tu tienda como un pequeño widget de voz.",
      },
      "is-chatbot": {
        question: "¿Bizmis es un chatbot?",
        answer:
          "No. Bizmis funciona por voz, no por texto. El comprador habla, Bizmis responde y la conversación fluye como un intercambio real con un dependiente, no como un árbol de chat con guion. El widget muestra la transcripción para que se pueda leer lo dicho, pero la interacción principal es la voz.",
      },
      "how-fast-start": {
        question: "¿Cómo de rápido puedo empezar?",
        answer:
          "Un clic para instalarlo desde la Shopify App Store. Bizmis sincroniza automáticamente tus productos, colecciones, políticas y FAQs. Sin configuración manual, sin entrenar modelos y sin desarrollo. La mayoría de tiendas están en marcha en minutos.",
      },
      "when-see-value": {
        question: "¿Cuándo empezaré a ver resultados?",
        answer:
          "Desde la primera conversación. Bizmis se activa en cuanto termina la instalación y empieza a ayudar a tus compradores de inmediato.",
      },
      "what-it-does": {
        question: "¿Qué hace Bizmis exactamente?",
        answer:
          "Tres cosas. **Ventas:** saluda a los compradores, detecta su intención, recomienda productos y los acompaña hasta el checkout. **Soporte:** gestiona estado de pedidos, envíos, devoluciones, políticas y FAQs a cualquier hora. **Datos:** repeticiones de sesión, recorridos etiquetados automáticamente y analítica de embudo para ver qué preguntan, qué quieren y dónde abandonan.",
      },
      "place-orders": {
        question: "¿Bizmis tramita pedidos o cobra pagos?",
        answer:
          "No. El checkout, los pagos, los reembolsos y las modificaciones de pedido siguen en Shopify y en tus flujos actuales. Bizmis aporta información y guía decisiones, pero nunca completa una transacción ni modifica un pedido en nombre del comprador.",
      },
      "cart-management": {
        question: "¿Bizmis gestiona carritos o recupera carritos abandonados?",
        answer:
          "El carrito sí. Cuando el cliente dice que sí, Bizmis añade artículos al carrito de tu propia tienda y el contador se actualiza al momento. Avisa si una opción está agotada, ofrece una alternativa y puede llevar al cliente al carrito o al pago. No envía emails de carrito abandonado, pero retoma la conversación donde la dejó cuando el cliente cambia de página.",
      },
      "feels-human": {
        question: "¿El asistente sonará humano?",
        answer:
          "Sí. El tono, el ritmo, la expresión y la cercanía están diseñados para parecer un dependiente real, no una voz robótica. Los compradores saben que hablan con una IA (Bizmis lo indica desde el principio, según el Reglamento de IA de la UE), pero la experiencia es conversacional, no transaccional.",
      },
      "insights-analytics": {
        question: "¿Qué información obtengo?",
        answer:
          "Un panel con repeticiones de sesión, transcripciones, temas etiquetados automáticamente (ventas / soporte / desconocido), resultados (respondido / escalado / sin resolver) y eventos del embudo (productos mostrados, productos comentados, intención de compra). Ves qué quieren tus compradores, dónde dudan y qué no está respondiendo bien tu tienda.",
      },
      "review-conversations": {
        question: "¿Puedo revisar conversaciones anteriores?",
        answer:
          "Sí. El historial, las transcripciones y las repeticiones están disponibles a partir del plan Growth. Puedes recorrer cualquier conversación, leer la transcripción y etiquetar patrones para afinar tus reglas de venta y soporte.",
      },
      "how-much-cost": {
        question: "¿Cuánto cuesta Bizmis?",
        answer:
          "Tres planes más Enterprise, con facturación mensual, o anual con alrededor de un 20% de descuento. **Starter** (79 $/mes, 260 sesiones) para tiendas pequeñas o de una persona. **Growth** (199 $/mes, 660 sesiones) para tiendas en crecimiento, el más popular. **Scale** (499 $/mes, 1.650 sesiones) para tiendas de alto volumen. **Enterprise** desde 1.500 $/mes, con volumen a medida, capacidad garantizada para picos de tráfico y SLA. Cada sesión extra cuesta 0,30 $, hasta el límite de gasto que fijes. Puedes empezar con 120 sesiones gratis.",
      },
      "what-counts-as-session": {
        question: "¿Qué cuenta como una sesión?",
        answer:
          "Una sesión es la visita de un cliente a tu dependiente, por voz o por texto. Las sesiones de más de 5 minutos de voz o 40 mensajes cuentan como dos. Las visitas en las que el cliente no dice nada son gratis. Tus propias pruebas en el panel de Bizmis tampoco cuentan. Cada plan incluye un número de sesiones (Starter 260 / Growth 660 / Scale 1.650) que se renueva cada mes. A partir de ahí, cada sesión extra cuesta 0,30 $, solo hasta el límite de gasto que fijes en el panel de Bizmis. El límite empieza en 0 $, así que no se cobra nada extra hasta que lo subas. Al alcanzarlo, el dependiente se pausa hasta el siguiente periodo o hasta que subas el límite. Las sesiones no usadas no se acumulan.",
      },
      "monthly-billing": {
        question: "¿Hay facturación anual?",
        answer:
          "Sí. Puedes pagar un año entero por adelantado y te ahorras alrededor de un 20% sobre el precio mensual. Tus sesiones incluidas se siguen reiniciando cada mes. Los planes anuales tienen una garantía de devolución de 30 días sobre el primer pago anual.",
      },
      "early-access-offer": {
        question: "¿Qué es la oferta de acceso anticipado?",
        answer:
          "El acceso anticipado ofrece a las tiendas Shopify invitadas las **120 sesiones gratis** del plan gratuito, una sola vez por tienda. No hay suscripción, cargos por uso, actualización automática ni renovación. Cuando se agotan las sesiones, Bizmis se pausa, salvo que elijas y apruebes un plan de pago en Shopify. Los miembros también reciben onboarding 1 a 1, soporte prioritario, prioridad para sus comentarios sobre el producto y un descuento personal si más adelante deciden mejorar su plan.",
      },
      "free-plan": {
        question: "¿Hay un plan gratuito?",
        answer:
          "Sí. El **plan gratuito** pone Bizmis en marcha en tu tienda durante **120 sesiones gratis**, una sola vez por tienda. Sin suscripción, sin compromiso, sin tarjeta y sin renovaciones. Es una prueba real con compradores reales. Cuando necesites capacidad continua, pasa a un plan de pago. Todos los cargos de Bizmis pasan por Shopify con la cuenta que ya usas, así que nunca añades otra tarjeta, y el plan gratuito no tiene nada que cobrar.",
      },
      "billing-payment-method": {
        question: "¿Cómo funciona el pago? ¿Tengo que añadir una tarjeta?",
        answer:
          "Toda la facturación de Bizmis pasa por la Billing API de Shopify, en la misma cuenta que ya usas para tu tienda. Apruebas los cargos dentro de Shopify y todo (tu plan y cualquier exceso) aparece en tu factura habitual de Shopify junto al resto de apps. Nunca introduces una tarjeta aparte en Bizmis. El uso de pago se factura igualmente, solo que lo cobra Shopify en vez de nosotros. El plan gratuito no tiene nada que cobrar, así que no hay nada que aprobar hasta que decidas mejorar de plan.",
      },
      "upgrade-plan": {
        question: "¿Qué pasa cuando mejoro de plan?",
        answer:
          "Las mejoras se aplican de inmediato. Se te cobra la diferencia prorrateada por el resto del periodo actual; los contadores de uso y la fecha de facturación no cambian. Las nuevas funciones se desbloquean al momento.",
      },
      "downgrade-plan": {
        question: "¿Qué pasa cuando bajo de plan?",
        answer:
          "Las bajadas de plan se aplican en la siguiente renovación: mantienes tu plan actual y sus funciones hasta entonces. No se reinician los contadores de uso ni hay prorrateo.",
      },
      "cancel-anytime": {
        question: "¿Puedo cancelar cuando quiera?",
        answer:
          "Sí, desde el panel de Bizmis o desinstalando la app. La cancelación es inmediata: el widget de voz deja de atender a los compradores en cuanto se confirma.",
      },
      "refund-policy": {
        question: "¿Cuál es vuestra política de reembolsos?",
        answer:
          "**Planes anuales:** garantía de devolución de 30 días. Si cancelas dentro de los 30 días siguientes a tu primer pago anual, te devolvemos ese cargo, sin preguntas. No cubre las renovaciones ni las sesiones extra.\n**Planes mensuales:** puedes cancelar cuando quieras, pero los cargos ya facturados del mes en curso no son reembolsables. No se te volverá a cobrar. Las sesiones no usadas no se acumulan.",
      },
      "personalize-voice-avatar": {
        question: "¿Puedo personalizar la voz y el avatar?",
        answer:
          "Sí. Elige entre un conjunto de voces naturales en más de 25 idiomas o entre cuatro personajes de avatar (a partir de Growth). También puedes configurar el saludo, el tono y el comportamiento para que encajen con tu marca.",
      },
      "multi-language": {
        question: "¿Bizmis habla varios idiomas?",
        answer:
          "Sí. Bizmis detecta automáticamente el idioma del comprador y responde en el mismo: más de 25 idiomas, en todos los planes. No hace falta configurar nada por idioma.",
      },
      "customize-content": {
        question: "¿Puedo personalizar lo que Bizmis dice de mis productos?",
        answer:
          "Sí. Configura **reglas de venta** (cómo recomienda, compara y sugiere mejoras), **reglas de soporte** (cuándo escalar, qué no responder) y una **base de conocimiento** (FAQs, políticas de la tienda, notas de producto que no están en las fichas) directamente desde el panel integrado.",
      },
      "multiple-clerks": {
        question: "¿Cuántos dependientes Bizmis puedo tener?",
        answer:
          "Uno en Starter, hasta cinco en Growth e ilimitados en Scale y Enterprise. Cada dependiente puede tener su propia voz, avatar y conjunto de reglas, algo útil si vendes en colecciones o mercados distintos.",
      },
      "data-collected": {
        question: "¿Qué datos recoge Bizmis?",
        answer:
          "De los compradores: audio de voz, transcripciones, actividad de navegación durante la sesión y preferencia de idioma. El email solo se recoge si el comprador ha iniciado sesión en tu tienda Shopify. De los comercios: datos de la tienda, preferencias de configuración y los tokens de acceso de Shopify necesarios para operar la app.",
      },
      "train-on-data": {
        question: "¿Entrenáis modelos de IA con los datos de los compradores?",
        answer:
          "**No.** Las grabaciones de voz y las transcripciones nunca se usan para entrenar ningún modelo de IA, ni nuestro ni de nuestros subencargados. Por defecto, AWS Bedrock no usa los datos del cliente para entrenar modelos; Anthropic no entrena sus modelos con datos de clientes de API ni de Bedrock; y nuestra integración con ElevenLabs está configurada para que el audio de las conversaciones no se use para mejorar sus modelos.",
      },
      "sub-processors": {
        question: "¿Quiénes son vuestros subencargados?",
        answer:
          "**ElevenLabs** para voz a texto, texto a voz y orquestación del agente de voz. **Anthropic** (familia Claude) para la generación de respuestas, vía ElevenLabs y vía AWS Bedrock para tareas de backend. **Amazon Web Services** para alojamiento, almacenamiento e inferencia de modelos en Bedrock. **Shopify** para el contexto de tienda y cliente. Los plazos de conservación y las regiones de procesamiento están en nuestra política de privacidad.",
      },
      "gdpr-compliant": {
        question: "¿Bizmis cumple el RGPD?",
        answer:
          "Sí. Bizmis actúa como encargado del tratamiento por cuenta del comercio respecto a los datos de los compradores; la sección 12 de nuestros términos es un DPA del artículo 28 del RGPD. Los compradores conservan sus derechos RGPD/CPRA: acceso, rectificación, supresión, limitación y portabilidad. Atendemos los webhooks de cumplimiento obligatorios de Shopify y respondemos a solicitudes directas en hello@bizmis.ai. Las cláusulas contractuales tipo de la UE están disponibles a petición.",
      },
      "data-retention": {
        question: "¿Cuánto tiempo guardáis los datos de conversación?",
        answer:
          "Los metadatos de sesión se eliminan automáticamente tras 60 minutos de inactividad. Las grabaciones y transcripciones se conservan mientras tu instalación esté activa. Tras desinstalar, los datos se mantienen durante la ventana de reinstalación de 48 horas de Shopify y luego se eliminan en un plazo de 30 días desde el webhook shop/redact. Cualquier conversación puede borrarse bajo petición en cualquier momento.",
      },
      "shopify-only": {
        question: "¿Bizmis solo funciona con Shopify?",
        answer:
          "Sí. Bizmis está creado específicamente para Shopify y usa sus APIs para datos de productos, clientes, pedidos y políticas. No hay planes de soportar otras plataformas a corto plazo.",
      },
      "what-syncs": {
        question: "¿Qué sincroniza Bizmis de mi tienda?",
        answer:
          "Productos y colecciones, precios y descuentos, fichas de cliente (cuando han iniciado sesión), historial de pedidos y políticas de la tienda (envíos, devoluciones, FAQ). La sincronización es automática y continua: cuando actualizas un producto, Bizmis lo ve.",
      },
      "private-testing": {
        question: "¿Puedo probar Bizmis sin mostrarlo a los compradores?",
        answer:
          "Sí. Bizmis permanece oculto hasta que un administrador activa su integración en el tema. Para probar respuestas reales en privado, duplica tu tema publicado, activa Bizmis solo en la copia no publicada y ábrela con la vista previa de temas de Shopify. Usará tu catálogo y tus políticas reales mientras tu tienda publicada permanece intacta. El interruptor Pausar del panel de Bizmis lo oculta inmediatamente en cualquier momento.",
      },
      permissions: {
        question: "¿Qué permisos pide Bizmis?",
        answer:
          "Bizmis lee productos, clientes, pedidos y políticas de la tienda para responder preguntas de venta y soporte. El acceso a las políticas legales es de solo lectura, por lo que no puede editarlas. El único acceso de escritura es a Shopify Files y solo se usa cuando eliges subir una imagen, como tu logo, para la camiseta del avatar. Bizmis no modifica archivos existentes.",
      },
      uninstall: {
        question: "¿Qué pasa si desinstalo la app?",
        answer:
          "El widget se detiene de inmediato, Shopify elimina la extensión del tema y revoca los tokens de acceso de Bizmis. Conservamos los datos de configuración y conversación durante la ventana de reinstalación de 48 horas de Shopify para poder restaurar tu cuenta si reinstalas. Después, Shopify activa la eliminación y borramos esos datos en un plazo de 30 días. Cualquier imagen del avatar que hayas subido permanece en tus propios Shopify Files y puedes eliminarla allí.",
      },
    },
  },

  contact: {
    title: "Hablemos",
    lead: "¿Tienes preguntas sobre Bizmis? Nos encantará leerte. Escríbenos y te responderemos lo antes posible.",
    successTitle: "¡Mensaje enviado!",
    successBody:
      "Gracias por escribirnos. Te responderemos lo antes posible.",
    sendAnother: "Enviar otro mensaje",
    errorBody:
      "No se ha podido enviar el mensaje. Inténtalo de nuevo o escríbenos directamente a",
    nameLabel: "Tu nombre",
    namePlaceholder: "Juan Pérez",
    emailLabel: "Correo electrónico",
    emailPlaceholder: "juan@ejemplo.com",
    subjectLabel: "Asunto",
    subjectPlaceholder: "¿En qué podemos ayudarte?",
    messageLabel: "Mensaje",
    messagePlaceholder: "Cuéntanos más sobre tu consulta o tu feedback...",
    sending: "Enviando...",
    send: "Enviar mensaje",
    orEmailUs: "O escríbenos directamente a",
  },

  earlyAccessPage: {
    badge: (cap: number) => `Solo las primeras ${cap} tiendas`,
    titleLine1: "Únete al programa de",
    titleLine2: "acceso anticipado",
    lead: (cap: number) =>
      `Solo pueden entrar ${cap} tiendas Shopify. Instala Bizmis gratis mientras el acceso anticipado esté abierto y conserva tus ventajas de miembro cuando mejores de plan.`,
    seeLiveDemo: "Ver la demo en vivo",
    bookFounderCall: "Reservar 30 min con el fundador",
    avatarAlt: "Invitación al acceso anticipado de Bizmis",
    benefitsBadge: "Ventajas del acceso anticipado",
    benefitsTitle: "Esto es lo que te llevas",
    benefitsLead:
      "Pasa el cursor por cada tarjeta para ver qué incluye tu acceso anticipado.",
    benefits: [
      {
        title: "Gratis como miembro*",
        detail:
          "Activa el acceso anticipado en la app y usa 120 sesiones en directo sin coste. Sin suscripción, sin compromiso.",
      },
      {
        title: "Define la hoja de ruta",
        detail:
          "Tu feedback tiene prioridad. Las preguntas de tus compradores ayudan a decidir las próximas funciones, correcciones y decisiones de producto.",
      },
      {
        title: "Soporte prioritario",
        detail:
          "Línea directa con el fundador para dudas de instalación, guía de configuración y ayuda prioritaria como miembro de acceso anticipado.",
      },
      {
        title: "Descuentos exclusivos",
        detail:
          "Tu código de acceso anticipado desbloquea precios mensuales de inicio con descuento cuando mejores de plan.",
      },
    ],
    ctaTitle: "Elige por dónde empezar",
    fastestPath: "La vía más rápida",
    installCardBody: "Activa el acceso anticipado desde la propia app de Shopify.",
    wantHelp: "¿Quieres ayuda?",
    bookCallTitle: "Reserva una llamada con el fundador",
    bookCallBody: "30 minutos de recorrido guiado antes de instalar.",
    seeDemoFirst: "Ver antes la demo en vivo",
    founderLed: "Proyecto liderado por su fundador. ¿Dudas?",
    footnote:
      "*Gratis para miembros de acceso anticipado = 120 sesiones en directo, una sola vez por tienda, sin renovación.",
  },

  unsubscribe: {
    confirmTitle: "¿Darte de baja de los correos de Bizmis?",
    confirmBody:
      "Dejarás de recibir invitaciones de acceso anticipado y otros correos de Bizmis.",
    confirmButton: "Confirmar la baja",
    processing: "Procesando tu solicitud...",
    successTitle: "Te has dado de baja",
    successBody:
      "No recibirás más correos nuestros. Si ha sido un error, responde a cualquier correo anterior o escríbenos a",
    errorTitle: "Algo ha ido mal",
    invalidLink:
      "Este enlace de baja no es válido. Si has llegado desde un correo, escríbenos a hello@bizmis.ai.",
    genericError: "Algo ha ido mal. Inténtalo de nuevo.",
    networkError:
      "No hemos podido conectar con el servidor. Inténtalo de nuevo o escríbenos a hello@bizmis.ai.",
    tryAgain: "Reintentar",
    questions: "¿Dudas?",
  },

  notFound: {
    title: "404",
    message: "Vaya, no encontramos esta página",
    backHome: "Volver al inicio",
  },

  seo: {
    home: {
      title: "Bizmis — El dependiente por voz para tu tienda Shopify",
      description:
        "Bizmis saluda a tus compradores, responde sus preguntas y los guía hasta la compra, como un gran dependiente de tienda, 24/7 dentro de tu tienda Shopify.",
      jsonLdDescription:
        "Dependiente por voz para Shopify que saluda a los compradores, responde preguntas y los guía hasta la compra.",
    },
    pricing: {
      title: "Precios de Bizmis — Planes para tiendas Shopify",
      description:
        "Precios claros de Bizmis para tiendas Shopify de cualquier tamaño. Elige un plan, instala en un clic y empieza a vender con un dependiente por voz.",
    },
    faqs: {
      title: "Preguntas frecuentes de Bizmis — Instalación, precios y datos",
      description:
        "Respuestas a las dudas más habituales sobre Bizmis: cómo funciona en Shopify, tiempo de instalación, tratamiento de datos, comportamiento de la voz, precios y más.",
    },
    contact: {
      title: "Contacto Bizmis — Hablemos",
      description:
        "Contacta con el equipo de Bizmis sobre la instalación en Shopify, integraciones en webs a medida, colaboraciones o lo que necesites. Respondemos rápido.",
    },
    earlyAccess: {
      title: "Acceso anticipado a Bizmis — gratis para las 50 primeras tiendas",
      description:
        "Hazte miembro del acceso anticipado de Bizmis: instala gratis, ten línea directa con el fundador, define la hoja de ruta y conserva tus descuentos al mejorar de plan. Solo las 50 primeras tiendas Shopify.",
    },
  },
};
