/* ============================================================
   CRIMSON INDEX — Theme JavaScript
   ============================================================ */

(function () {
  'use strict';

  const PROMO_VIDEO_PARAM = 'promo_video';
  const PROMO_MARKETING_PARAM = 'marketing';
  const PROMO_MARKETING_AD = 'ad-1';
  const promoBootParams = new URLSearchParams(location.search);
  const legacyPromoVideo = promoBootParams.get(PROMO_VIDEO_PARAM);
  const marketingValue = promoBootParams.get(PROMO_MARKETING_PARAM);
  const PROMO_END_CTA = {
    demo: { scarcity: '', label: 'See it in action', url: 'bizmis.ai/demo', vo: 'see-it' },
    install: { scarcity: 'Installs in one click.', label: 'Install on Shopify', url: '', vo: 'install-shopify' },
    ea: {
      scarcity: '',
      label: 'Install now',
      invite: 'for Early Access benefits!',
      aside: 'Only 50 spots',
      terms: ['Generous free credits', '50% off upgrades', 'Shape the roadmap'],
      // v24: the short take ("Install now to join Early Access! Generous free credits, fifty percent off
      // upgrades, and you shape the roadmap. Only fifty spots. Secure yours by installing now.", 11.38 s). Each mark is a phrase
      // of the take's alignment; its offset (ms) puts the beat on the word as measured by STT (scribe_v1:
      // Generous 2.60, 50% 4.26, shape 6.30, Only 7.60, Secure 9.08, now ends 10.92), each pill rising 80 ms ahead
      termMarks: ['Generous', 'fifty percent', 'shape'],
      termOffsets: [-40, 100, -20],
      handMark: ['Only fifty', 'start', -307],   // the pen starts 120 ms before "Only" (the alignment runs 187 ms late here)
      heroMark: ['Secure yours', 'start', -540],   // 260 ms before "Secure" (the alignment runs 280 ms late here)
      closeMark: ['installing now', 'end', -40],   // the closing lockup starts after "...by installing now."
      find: 'Find Bizmis on the Shopify App Store',
      pills: true,   // v11: the three benefits as glass pills, then "Only 50 spots" (v24: the card is exactly what the VO says)
      shopify: true,
      url: '',
      vo: 't-ea',
    },
    none: null,
  };
  // Skincare first: The Apricot Theory's color is the nearest to Bizmis
  // orange, so the orange field hands over to it.
  const PROMO_PASS_SECTORS = [
    'Skincare & beauty',
    'Consumer electronics',
    'Clothing & apparel',
    'Books & stationery',
    'Gaming gear',
    'Home & DIY',
    'Car parts & accessories',
    'Wine & spirits',
  ];
  const PROMO_REEL_IN_MS = 700;
  const PROMO_SYNC_HOLD_MS = 100;   // v23: after the take, before the hand-off (the reel's anchor may hold it a little longer, alive)
  const PROMO_SYNC_HANDOFF_MS = 460;   // the reel crossfades in over the sync scene (never an empty frame)
  const PROMO_REEL_TUNNEL_SCALE = 1.15;   // v24: tunnel cards (x their close-up size; was 0.8)
  const PROMO_REEL_TUNNEL_NEAR = 1.5;   // v24: the nearest card's starting depth (x perspective; was 0.9): it is still there when the clerk lands in it
  const PROMO_REEL_TUNNEL_TILT = 12;   // v24: the lanes angle in (deg), outer edges nearer, like a corridor
  const PROMO_REEL_DOCK_AT = { x: 0.872, y: 0.744, h: 0.26 };   // v24: the widget's clerk in a desktop store recording (share of its screen)
  const PROMO_SYNC_MORPH_MS = 520;   // v23b: the checked Install disc swells and softens into the clerk's glow...
  const PROMO_SYNC_RISE_MS = 380;   // ...while the clerk rises out of it (fully there ~0.4 s after the check)
  const PROMO_SYNC_PRESS_DELAY_MS = 60;   // the press (and its click) on the onset of "click" (1.58 s, measured; the take's timing says 1.52)
  const PROMO_SYNC_FOLD_LEAD_MS = 40;   // the Installed button folds into the clerk on "whole store" (2.83 s)
  const PROMO_SYNC_TILE_STAGGER_MS = 25;   // the orbs popping out after the fold
  const PROMO_SYNC_ABSORB_LEAD_MS = 60;   // the first orb leaves on "stays"...
  const PROMO_SYNC_ORB_MS = 460;
  const PROMO_SYNC_ORB_STAGGER_MS = 45;   // ...the last one goes in on "sync"
  const PROMO_SYNC_HEART_DY = 0.08;   // the orbs go into the shirt, this far (x canvas height) under the seat's centre
  const PROMO_SYNC_AVATAR_H = 0.7;   // the clerk's view, as a share of the canvas height
  const PROMO_SYNC_ACTION = 'charge_up';   // crouch, two gulps of energy, release (2.4 s)
  const PROMO_YOURSTORE_HOLD_MS = 900;
  const PROMO_YOURSTORE_DIVE_MS = 1000;
  // v22 sync: the store's Shopify areas as the film's peach orbs around the clerk.
  // x/y: the orb's centre as a share of the canvas (the v9 ring, Catalog and Website
  // on top). glyph: thin SF-Symbols-like strokes on a 24-unit grid (our own drawings).
  const PROMO_SYNC_PARTS = [
    { key: 'catalog', label: 'Catalog', x: 0.345, y: 0.215,
      glyph: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><path d="M13.5 13.5h3.9l3.4 3.4-3.9 3.9-3.4-3.4z"/><circle class="is-dot" cx="15.6" cy="15.6" r="1"/>' },
    { key: 'website', label: 'Website', x: 0.655, y: 0.215,
      glyph: '<rect x="2.75" y="4" width="18.5" height="16" rx="3.2"/><path d="M2.75 8.7h18.5"/><circle class="is-dot" cx="5.7" cy="6.35" r=".8"/><circle class="is-dot" cx="8.1" cy="6.35" r=".8"/><circle class="is-dot" cx="10.5" cy="6.35" r=".8"/><rect x="6" y="11.6" width="5.2" height="5.2" rx="1.2"/><path d="M14 12.6h4M14 15.8h2.6"/>' },
    { key: 'customers', label: 'Customers', x: 0.19, y: 0.5,
      glyph: '<circle cx="9.2" cy="8.3" r="3.4"/><path d="M3.1 19.8c.5-3.5 3-5.8 6.1-5.8s5.6 2.3 6.1 5.8"/><path d="M15.3 5.1a3.2 3.2 0 0 1 .2 6.3"/><path d="M17.6 14.4c1.9.7 3.1 2.6 3.4 5.4"/>' },
    { key: 'policies', label: 'Policies', x: 0.81, y: 0.5,
      glyph: '<path d="M14.2 3H7.6a2.1 2.1 0 0 0-2.1 2.1v13.8A2.1 2.1 0 0 0 7.6 21h8.8a2.1 2.1 0 0 0 2.1-2.1V7.3z"/><path d="M14.2 3v3c0 .7.6 1.3 1.3 1.3h3"/><path d="M8.9 10.6h4.2"/><path d="M8.9 15.3l2.1 2.1 4-4.2"/>' },
    { key: 'orders', label: 'Orders', x: 0.345, y: 0.785,
      glyph: '<path d="M12 2.9l7.9 4.2v9.8L12 21.1l-7.9-4.2V7.1z"/><path d="M4.3 7.2 12 11.3l7.7-4.1M12 11.3v9.6"/><path d="M8.1 5 16 9.2"/>' },
    { key: 'discounts', label: 'Discounts', x: 0.655, y: 0.785,
      glyph: '<path d="M3.5 11.6V5.3c0-1 .8-1.8 1.8-1.8h6.3c.5 0 .9.2 1.3.5l7.5 7.5c.7.7.7 1.8 0 2.5l-6.4 6.4c-.7.7-1.8.7-2.5 0L4 12.9c-.3-.4-.5-.8-.5-1.3z"/><circle class="is-dot" cx="7.6" cy="7.6" r="1.15"/><path d="M10.6 15.7l4.8-4.8"/><circle cx="11.2" cy="11.4" r="1"/><circle cx="14.8" cy="15.1" r="1"/>' },
  ];
  const PROMO_REEL_ORANGE_MS = 0;
  const PROMO_REEL_REST_SCALE = 0.48;   // carousel cards at rest, as a share of their close-up size
  const PROMO_REEL_GAP = 0.05;   // between cards at rest, x canvas height
  const PROMO_REEL_HERO_X = 0.6;   // a close-up's centre, x canvas width
  const PROMO_REEL_LEAD_W = 1.15;   // how far (canvas widths) the carousel travels before the first store
  const PROMO_REEL_GROW_MS = 950;
  const PROMO_REEL_SHRINK_MS = 820;
  const PROMO_REEL_TYPE_ZOOM = 1.1;   // the whole phone stays in frame
  const PROMO_REEL_TYPE_Y = 0.9;   // where the typing lands, x canvas height
  const PROMO_REEL_DRIFT_MS = 4200;
  const PROMO_REEL_DIVE_MS = 1300;
  const PROMO_REEL_TRAVEL_MS = [1250, 1000, 850, 750];
  const PROMO_REEL_LEAN_MS = 640;   // the lean-out ends before the recording changes page
  const PROMO_REEL_OUTRO_MS = 1600;
  const PROMO_REEL_CLOSE_GAP = 0.14;   // neighbours mostly out of frame at close-up distance   // between close-ups on the dolly, x canvas width
  const PROMO_REEL_WIDE_MS = 2600;   // the wide look at the whole carousel
  const PROMO_REEL_PUSH_MS = 1100;   // the push in to the first store
  const PROMO_REEL_DOLLY_MS = 1250;   // store to store at close-up distance
  const PROMO_REEL_WHIP_MS = 460;   // the whip's first stop; each one shorter
  const PROMO_REEL_WHIP_SPEEDUP = 0.78;
  const PROMO_REEL_WHIP_MIN_MS = 170;
  const PROMO_REEL_LAND_MS = 1100;   // the rush slows onto "Your store"
  const PROMO_REEL_ORANGE_CUT_MS = 2300;   // v21: 1 s shorter so the reel always waits for its bar (never late)
  const PROMO_REEL_OUT_MS = 600;
  const PROMO_REEL_SLIDE_MS = [820, 680, 540];   // v11: store to store on the conveyor, quicker each time
  const PROMO_REEL_HANDOFF_MS = 320;
  const PROMO_REEL_TURN_DEG = 34;   // v11b: how far a neighbouring store turns away in the 3D carousel
  const PROMO_REEL_DEPTH = 0.22;   // how far back it sits, x canvas width
  const PROMO_REEL_TINT_MS = 700;   // the ambient light's glide into a store's colour   // the conveyor moves on while a store's take is still fading out
  // v24 light law (operator): every card window [cut_i, cut_i+1] on the cuts' own clock: the light peaks mid-card
  // (still), dims to its trough at each cut (where the motion peaks) and crossfades colour through the trough
  const PROMO_REEL_LAW = { edgeMs: 520, floor: 0.12, glowLo: 0.26, glowHi: 1, push: 0.07, slide: 0.06, homeMs: 1300 };
  const PROMO_PASS_FAST_MS = 2600;
  const PROMO_PASS_READ_MS = 2000;
  const PROMO_PASS_STEP_MS = 1400;
  const PROMO_PASS_SPEEDUP = 0.8;
  const PROMO_PASS_MIN_MS = 820;
  const PROMO_PASS_FINAL_MS = 1500;
  const PROMO_PASS_DIVE_MS = 720;
  const PROMO_RACK_IN_MS = 560;
  const PROMO_RACK_HOLD_MS = 140;
  const PROMO_RACK_PULL_MS = 1600;
  const PROMO_RACK_TOTAL_MS = PROMO_RACK_IN_MS + PROMO_RACK_HOLD_MS + PROMO_RACK_PULL_MS;
  const PROMO_RACK_BLUR_PX = 44;
  const PROMO_STORE_VOICES = ['store-1', 'store-2', 'store-3', 'store-4', 'store-5', 'store-6', 'store-7', 'store-2'];
  const PROMO_PASS_TAG_MS = 220;
  const PROMO_PASS_TITLE_MS = 420;
  const PROMO_PASS_SLOW_MS = 4800;
  const PROMO_PASS_SLOT_IN_MS = 420;
  const PROMO_PHONE_PAN_MS = 820;
  const PROMO_SOLD_WAVE_MS = 700;
  const PROMO_EA_WRITE_MS = 1700;
  const PROMO_EA_STAMP_MS = 460;
  const PROMO_EA_BEAT_MS = 780;
  const PROMO_EA_LOGO_LEAD_MS = 420;
  const PROMO_EA_FLY_MS = 620;
  const PROMO_EA_TERM_GAP_MS = 720;
  const PROMO_EA_TERM_IN_MS = 560;
  const PROMO_EA_HOLD_MS = 2200;
  const PROMO_EA_CLOSE_MS = 1000;   // v13: the closing move, landing on the score's final chord
  const PROMO_EA_FINAL_HOLD_MS = 3200;   // the lasting final frame (v21: the last chord rings)
  const PROMO_EA_HERO_LEAD_MS = 250;
  const PROMO_EA_FADE_MS = 1600;
  const PROMO_PAIN_END_GAP_MS = 300;
  // v21: the picture follows the score (Suno v6, one song built chapter by chapter with Extend at bar
  // lines; music time = film time + 0.9 s). Film-clock anchors (s from the film's first frame):
  // the burst on the drop's first downbeat, the reel on the stores section's first bar, the EA
  // close's hit on the score's final hit. Every store cut sits on one of the song's own claps.
  // v23: reel 119.72 -> 119.45 (the sync scene now ends 0.5 s after its take and hands straight over),
  // final 168.82 -> 166.40 (the reel is 2.15 s shorter): both to be re-snapped by the music re-fit
  const PROMO_FILM_ANCHORS = { burst: 50.376, reel: 120.84, final: 159.206 };   // v24 final: the v22 song, -1 stores bar, -4 closing bars (144.022-152.590), score at offset +0.25 (the sync scene now hands straight to the reel)
  // v23: from the reel start (s): [0] the tunnel lands on hero 1; [1..3] heroes 2..4 (each window = its line + 0.1 s);
  // [4..21] the run's 18 cards, one accelerating ladder (quick stores 1.0 / 0.8 / 0.62 / 0.55 s, their voices clipped
  // with a short fade); [22] "Your store". The music re-fit may snap any of these to a clap; the ladder reads its
  // windows from here (PROMO_REEL_RUN only names the cards).
  const PROMO_REEL_CUTS_S = [3.802, 7.024, 10.115, 13.325, 15.212, 16.141, 16.939, 17.612, 18.277, 18.814, 19.345, 19.751, 20.146, 20.419, 20.672, 20.924, 21.09, 21.223, 21.357, 21.49, 21.624, 21.743, 22.048];   // v23: on the trimmed song's claps (tmp/ad-1-audio/music/suno/v23-stores-cuts.json)
  const PROMO_SHOPIFY_BAG = 'M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.018-.116-.114-.192-.211-.192s-1.929-.136-1.929-.136-1.275-1.274-1.439-1.411c-.045-.037-.075-.057-.121-.074l-.914 21.104h.023zM11.71 11.305s-.81-.424-1.774-.424c-1.447 0-1.504.906-1.504 1.141 0 1.232 3.24 1.715 3.24 4.629 0 2.295-1.44 3.76-3.406 3.76-2.354 0-3.54-1.465-3.54-1.465l.646-2.086s1.245 1.066 2.28 1.066c.675 0 .975-.545.975-.932 0-1.619-2.654-1.694-2.654-4.359-.034-2.237 1.571-4.416 4.827-4.416 1.257 0 1.875.361 1.875.361l-.945 2.715-.02.01zM11.17.83c.136 0 .271.038.405.135-.984.465-2.064 1.639-2.508 3.992-.656.213-1.293.405-1.889.578C7.697 3.75 8.951.84 11.17.84V.83zm1.235 2.949v.135c-.754.232-1.583.484-2.394.736.466-1.777 1.333-2.645 2.085-2.971.193.501.309 1.176.309 2.1zm.539-2.234c.694.074 1.141.867 1.429 1.755-.349.114-.735.231-1.158.366v-.252c0-.752-.096-1.371-.271-1.871v.002zm2.992 1.289c-.02 0-.06.021-.078.021s-.289.075-.714.21c-.423-1.233-1.176-2.37-2.508-2.37h-.115C12.135.209 11.669 0 11.265 0 8.159 0 6.675 3.877 6.21 5.846c-1.194.365-2.063.636-2.16.674-.675.213-.694.232-.772.87-.075.462-1.83 14.063-1.83 14.063L15.009 24l.927-21.166z';
  const PROMO_VO_ON = promoBootParams.get('vo') === '1';
  const PROMO_VO_BUDGET_S = [
    { scene: 'pain', seconds: 13 },
    { scene: 'dull-sea', seconds: 6 },
    { scene: 'switch-reveal', seconds: 8 },
    { scene: 'pitch', seconds: 14 },
    { scene: 'selling-sea', seconds: 6 },
    { scene: 'stores-end', seconds: 9 },
  ];
  // The narrator speaks in whole takes (Claudia, Eleven v4, audio tags in the
  // text); the picture syncs to phrases inside each take (speakTake().at()).
  const PROMO_VO = [
    { scene: 'pain', id: 't-pain', line: "Every day, shoppers walk into your store... ready to buy. Some get lost in the catalog. Clicking, comparing, scrolling... with no one there to help them choose. Others get stuck on one last question... and go looking for help. A chatbot? Here's a wall of text... go read it. A real person? The perfect answer... hours later. When the sale's already gone. Either way, they leave." },
    { scene: 'pain', id: 't-pain-end', line: 'Sale lost.' },   // v18: its own take, on the sea's first LOST stamps
    { scene: 'switch', id: 't-switch', line: 'In a physical store... the best salesperson turns these moments into sales. So we built one... for your online store!' },
    { scene: 'reveal', id: 't-reveal', line: "Meet Bizmis. Your store's new salesperson. Well... sales agent." },
    { scene: 'rewind', id: 't-rewind-a', line: "Let's rewind." },
    { scene: 'rewind', id: 't-rewind-b', line: 'Same store... now with Bizmis.' },
    { scene: 'pitch', id: 't-lost', line: "When a shopper's lost in your catalog... your Bizmis sales agent finds them the right one." },
    { scene: 'pitch', id: 't-doubt', line: "And when a doubt holds them back... it answers on the spot." },
    { scene: 'selling-sea', id: 't-sold', line: "That's how more visits... turn into sales." },
    { scene: 'sync', id: 't-sync', line: "It all takes just one click. And your whole store stays in sync... automatically." },
    { scene: 'stores', id: 't-stores', line: 'Whatever your store sells... your Bizmis agent sells it.' },   // v18: to the merchant (the reel shows devices and languages)
    { scene: 'end', id: 'see-it', line: 'See it in action.', cta: 'demo' },
    { scene: 'end', id: 't-ea', line: 'Install now to join Early Access! Generous free credits, fifty percent off upgrades, and you shape the roadmap. Only fifty spots. Secure yours by installing now.', cta: 'ea' },   // v24: the short take
    { scene: 'end', id: 'install-shopify', line: 'Install it on Shopify.', cta: 'install' },
  ];
  function ensureInviteFont() {
    if (document.getElementById('promo-invite-font')) return;
    const link = document.createElement('link');
    link.id = 'promo-invite-font';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&display=swap';
    document.head.append(link);
  }
  function shopifyBag() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('promo-pass-slot__bag');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', PROMO_SHOPIFY_BAG);
    svg.append(path);
    return svg;
  }
  function handwrittenTick() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('promo-pass-slot__tick');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('pathLength', '1');
    path.setAttribute('d', 'M4.5 12.5 L9.5 17.5 L19.5 6.5');
    svg.append(path);
    return svg;
  }
  function promoVoCue(id) {
    return PROMO_VO.find((cue) => cue.id === id) || null;
  }
  function promoVoGuard(id) {
    const cue = promoVoCue(id);
    return cue && cue.guardMs ? cue.guardMs : 0;
  }
  function markPromoVo(id) {
    const cue = promoVoCue(id);
    if (!cue) return;
    document.documentElement.dataset.promoVo = id;
    const row = { scene: cue.scene, id: cue.id, line: cue.line, at: Math.round(performance.now()) };
    const log = window.__promoVoTimeline || (window.__promoVoTimeline = []);
    log.push(row);
    if (!PROMO_VO_ON) return;
    let node = document.querySelector('[data-promo-vo-debug]');
    if (!node) {
      node = document.createElement('p');
      node.className = 'promo-vo-debug';
      node.setAttribute('data-promo-vo-debug', '');
      document.body.appendChild(node);
    }
    node.textContent = cue.id;
    node.title = cue.line;
  }
  // Picture events the sound design follows: the exporter writes them to
  // markers.json (sfx) and the mixer lays each sound on its frame, so a
  // retime never knocks the sound out of sync.
  function promoSfx(id, extra = {}, at = performance.now()) {
    (window.__promoSfxTimeline = window.__promoSfxTimeline || []).push({ id, at: Math.round(at), ...extra });
  }
  window.__promoVo = PROMO_VO;
  window.__promoVoBudget = PROMO_VO_BUDGET_S;
  let promoCtaFallbackLogged = false;
  function readPromoCta() {
    const raw = (promoBootParams.get('cta') || 'install').trim().toLowerCase();
    if (Object.prototype.hasOwnProperty.call(PROMO_END_CTA, raw)) return raw;
    if (!promoCtaFallbackLogged) {
      promoCtaFallbackLogged = true;
      const host = location.hostname;
      const dev = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.myshopify.com');
      if (dev) console.warn(`Unknown cta "${raw}". Using install.`);
    }
    return 'install';
  }
  const promoVideoConfig = { cta: readPromoCta() };
  const isMarketingAd = marketingValue === PROMO_MARKETING_AD || legacyPromoVideo === 'opening';
  const promoVideo = isMarketingAd ? 'opening' : legacyPromoVideo;
  if (isMarketingAd) {
    const openingPart = (promoBootParams.get('part') || 'full').trim().toLowerCase();
    document.documentElement.style.setProperty('--ad-warmth', openingPart === 'pitch' ? '1' : '0');
    document.documentElement.classList.add('is-promo-opening');
    document.documentElement.classList.remove('is-promo-cover');
  }
  const PROMO_GREYSCALE = promoVideo === 'mock' || promoVideo === 'unattended';
  document.documentElement.classList.toggle('is-promo-greyscale', PROMO_GREYSCALE);
  document.body.classList.toggle('is-promo-greyscale', PROMO_GREYSCALE);

  function propagatePromoVideoParam() {
    const source = new URLSearchParams(location.search);
    const keys = [];
    if (source.get(PROMO_MARKETING_PARAM)) keys.push(PROMO_MARKETING_PARAM);
    if (source.get(PROMO_VIDEO_PARAM)) keys.push(PROMO_VIDEO_PARAM);
    if (!keys.length) return;
    const carry = ['part', 'hold', 'cta', 'store', 'auto', 'nocover', 'lighting', 'moments', 'clip', 'device', 'motion', 'chat', 'tone'];

    const updateLink = (link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      let url;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      keys.forEach((key) => url.searchParams.set(key, source.get(key)));
      carry.forEach((key) => {
        const value = source.get(key);
        if (value != null && value !== '') url.searchParams.set(key, value);
      });
      link.href = url.toString();
    };

    const updateForm = (form) => {
      const method = (form.getAttribute('method') || 'get').toLowerCase();
      if (method !== 'get') return;
      keys.forEach((key) => {
        if (form.querySelector(`[name="${key}"]`)) return;
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = source.get(key);
        form.appendChild(input);
      });
    };

    const updateNode = (node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      if (node.matches('a[href]')) updateLink(node);
      if (node.matches('form')) updateForm(node);
      node.querySelectorAll('a[href]').forEach(updateLink);
      node.querySelectorAll('form').forEach(updateForm);
    };

    document.querySelectorAll('a[href]').forEach(updateLink);
    document.querySelectorAll('form').forEach(updateForm);

    new MutationObserver((records) => {
      records.forEach(record => record.addedNodes.forEach(updateNode));
    }).observe(document.body, { childList: true, subtree: true });
  }

  function applyCollectionPromoBlurb(title, cta) {
    const collectionBlurb = document.querySelector('.collection-header .text-muted');
    if (!collectionBlurb) return;
    if (!/clerk|just say what you need|always replies|shoppers browse|came to buy/i.test(collectionBlurb.textContent)) return;

    collectionBlurb.replaceChildren();

    const headline = document.createElement('span');
    headline.textContent = title;
    collectionBlurb.appendChild(headline);

    const line = document.createElement('button');
    line.type = 'button';
    line.className = 'hero__title-cta';
    line.setAttribute('data-open-voice-clerk', '');
    line.textContent = cta;
    collectionBlurb.appendChild(line);
  }

  function applyPlainPromoHero(eyebrow, title, cta) {
    const subtitle = document.querySelector('.hero__subtitle');
    const titleLine = document.querySelector('.hero__title-line');
    const ctaEl = document.querySelector('.hero__title-cta');

    if (subtitle) {
      subtitle.classList.remove('hero__subtitle--mark');
      subtitle.removeAttribute('aria-label');
      subtitle.textContent = eyebrow;
    }
    if (titleLine) {
      titleLine.removeAttribute('data-hero-redefine');
      titleLine.removeAttribute('aria-label');
      titleLine.textContent = title;
    }
    if (ctaEl) ctaEl.textContent = cta;

    applyCollectionPromoBlurb(title, cta);
  }

  function applyUnattendedLandingCopy() {
    const eyebrow = document.querySelector('.hero-voice__eyebrow');
    const heading = document.querySelector('.hero-voice__heading');
    if (eyebrow) eyebrow.textContent = 'NO CLERK. NO CHAT.';
    if (heading) heading.textContent = 'They figure it out alone.';
  }

  function applyPromoVideoHero() {
    if (promoVideo === 'mock') {
      applyPlainPromoHero(
        'YOUR STORE, WITH A TYPICAL CHATBOT.',
        'It always replies.',
        'It never sells.'
      );
      return;
    }

    if (promoVideo === 'unattended') {
      applyPlainPromoHero(
        'YOUR STORE, UNATTENDED.',
        'Shoppers browse.',
        'Nobody sells.'
      );
      applyUnattendedLandingCopy();
    }
  }

  const PROMO_FLIP_KNOB_MS = 200;
  const PROMO_FLIP_SPARKS = 18;
  const PROMO_FLIP_POP_HOLD_MS = 650;
  const PROMO_TOGGLE_REST_MS = 650;
  const PROMO_RECAP_BUBBLES = ['Can I help you find something?', "That one's perfect for them."];
  const PROMO_RECAP_STAGGER_MS = 380;
  const PROMO_OPENING_REVEAL_STORE = false;
  const PROMO_OPENING_CLOCK = true;
  const PROMO_SWITCH_MOVE_MS = 900;
  const PROMO_SWITCH_GROW_MS = 1800;
  const PROMO_SWITCH_SCALE = 10;
  // The toggle label is 70px; the zoom was tuned on 84px.
  const PROMO_SWITCH_LABEL_GAIN = 84 / 70;
  const PROMO_SWITCH_BURST_AT_MS = 680;
  const PROMO_SWITCH_WHITE_AT_MS = 220;   // the label whitens once the orange is behind it (no white-on-white frame)
  const PROMO_SWITCH_FADE_AT_MS = 460;
  const PROMO_SWITCH_FADE_MS = 380;
  const PROMO_FLIP_BURST_MS = 760;   // the knob's fill covers the frame (ease in-out), then the logo resolves
  const PROMO_KNOB_WARM_MS = 160;
  const PROMO_SWITCH_CHIPS = [["Can't find it", 'Found it'], ["Can't decide", 'Compared'], ['Not sure', 'Doubt cleared']];   // the white knob turns orange before it grows
  const PROMO_FLOOD_MS = 600;
  const PROMO_FLIP_HOLD_MS = 650;   // the logo on orange meets "Meet Bizmis" at once
  const PROMO_PITCH_LOGO_HOLD_MS = 300;
  const PROMO_LOGO_DOCK_MS = 720;
  const PROMO_PITCH_LOGO_OUT_MS = 420;
  const PROMO_PITCH_WORD_STAGGER_MS = 85;   // a visible write-in, word by word
  const PROMO_PITCH_WORD_IN_MS = 340;
  const PROMO_PITCH_REPLACE_PAUSE_MS = 500;
  const PROMO_PITCH_HEADLINE_HOLD_MS = 1500;
  const PROMO_PITCH_DOUBT_MS = 1800;
  const PROMO_PITCH_POOF_MS = 1100;
  const PROMO_DOUBT_ORBIT_RATIO = 0.6;
  const PROMO_DOUBT_BUBBLE_PX = 26;
  const PROMO_TYPE_LINE_MS = 1100;
  // Quick, but readable as typing: about 26 characters a second.
  const PROMO_FILM_TYPE_CHAR_MS = 30;
  const PROMO_PITCH_WORD_OUT_MS = 400;
  const PROMO_PITCH_WORD_OUT_STAGGER_MS = [0, 140, 70, 210];
  const PROMO_AVATAR_MAX_SCALE = 2.5;
  const PROMO_AVATAR_BOX_W = 440;
  const PROMO_AVATAR_BOX_H = 340;
  const PROMO_AVATAR_EXPORT_DPR = 2;
  const PROMO_REVEAL_GAP_PX = 40;
  const PROMO_REVEAL_BODY = 0.27;
  const PROMO_REVEAL_BODY_SHIFT_PX = 140;
  const PROMO_AVATAR_LIFT_PX = -120;
  const PROMO_CLERK_CORNER_MS = 1080;
  const PROMO_INSTALL_LEAD_MS = 950;
  const PROMO_INSTALL_MORPH_MS = 220;
  const PROMO_XSELL_SPIN_MS = 1500;
  const PROMO_XSELL_HOLD_MS = 450;
  const PROMO_XSELL_LAYOUT_MS = 420;
  const PROMO_XSELL_FLY_MS = 700;
  // v24: a clean, unmistakable rewind (scripts/render-vhs-rewind.py --clean): the pain races
  // backwards and settles on the first store frame by SCRUB_MS; the DOM adds the shrinking
  // "player" frame, the ◀◀ glyph and a scrubber whose playhead runs back with the tape.
  const PROMO_REWIND_VIDEO = '/promo/rewind/pain-rewind-clean.mp4';
  const PROMO_REWIND_MS = 1600;
  const PROMO_REWIND_REVEAL_MS = 200;
  const PROMO_REWIND_SCRUB = { from: 58.3, to: 1.2, ms: 1300 };   // tape seconds: MUST match the clip's --from/--to/--scrub
  // the clip's tape speed (spin-up, run, slow-down): MUST match ease_clean() in the render script
  function promoRewindEase(u) {
    const A = 0.14; const D = 0.34; const V = 1 / (A / 2 + (1 - A - D) + D / 2);
    if (u <= 0) return 0;
    if (u >= 1) return 1;
    if (u < A) return V * u * u / (2 * A);
    if (u < 1 - D) return V * (A / 2 + (u - A));
    return 1 - V * (1 - u) * (1 - u) / (2 * D);
  }
  const PROMO_INSTALL_CARD_MS = 650;
  const PROMO_INSTALL_AIM_MS = 520;
  const PROMO_INSTALL_RING_MS = 460;
  const PROMO_INSTALL_CHECK_MS = 200;
  const PROMO_INSTALL_FLY_MS = 560;
  const PROMO_INSTALL_DONE_MS = 620;
  const PROMO_INSTALL_ARRIVE_MS = 700;
  const PROMO_INSTALL_GRAB_MS = 220;
  const PROMO_INSTALL_DRAG_MS = 1400;
  const PROMO_INSTALL_DROP_MS = 300;
  const PROMO_INSTALL_GRIP = 0.34;   // v11: the hand holds the clerk by its body (share of the card's height)
  // v11: the macOS pointer (black arrow, white rim), never a Windows-style one
  // v12c: SF Symbols-like glyphs (filled, Apple's proportions): storefront and person
  const PROMO_SF_STORE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4.8 3.6h14.4l2 5.3c.1.3.1.5.1.7 0 1.6-1.3 2.8-2.9 2.8-1.2 0-2.3-.8-2.7-1.9-.4 1.1-1.5 1.9-2.7 1.9h-.1c-1.2 0-2.3-.8-2.7-1.9-.4 1.1-1.5 1.9-2.7 1.9-1.6 0-2.9-1.3-2.9-2.8 0-.2 0-.5.1-.7z"/><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" d="M4.6 13.6v5.6c0 .7.5 1.2 1.2 1.2h12.4c.7 0 1.2-.5 1.2-1.2v-5.6"/><path fill="currentColor" d="M10 20.4v-4.2c0-.4.3-.7.7-.7h2.6c.4 0 .7.3.7.7v4.2z"/></svg>';
  const PROMO_PERSON_MARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle fill="currentColor" cx="12" cy="7.4" r="4.1"/><path fill="currentColor" d="M3.9 20.1c0-4.1 3.6-6.9 8.1-6.9s8.1 2.8 8.1 6.9c0 .6-.4 1-1 1H4.9c-.6 0-1-.4-1-1z"/></svg>';
  // v23: Emma's portrait (a flat illustration drawn for the film, in its palette: peach, sage, warm browns;
  // no ids, so every copy of the phone can carry it). The avatar's round mask clips it.
  const PROMO_HUMAN_PORTRAIT = '<svg viewBox="0 0 96 96" aria-hidden="true"><rect width="96" height="96" fill="#F3D9C4"/><circle cx="48" cy="30" r="52" fill="#FBEADC" opacity=".75"/>'
    + '<g transform="matrix(1.24 0 0 1.24 -11.5 -6.5)"><path fill="#5A3A2D" d="M27 52C24 31 35 18 49 18c15 0 25 12 23 31-1 10 3 19 1 29H26c-3-9 2-17 1-26z"/><path fill="#DFA785" d="M42 58h12v13c0 4-12 4-12 0z"/>'
    + '<path fill="#7FA591" d="M12 98c2-17 16-27 36-27s34 10 36 27z"/><path fill="#F4EEE4" d="M40.5 71.5 48 80l7.5-8.5c-2.4-.6-4.9-.9-7.5-.9s-5.1.3-7.5.9z"/><path fill="#DFA785" d="M42.6 71.2 48 77.4l5.4-6.2c-1.8-.3-3.6-.4-5.4-.4s-3.6.1-5.4.4z"/>'
    + '<circle cx="63.6" cy="47.5" r="3.4" fill="#EDB898"/><ellipse cx="48" cy="45.5" rx="15.6" ry="18.2" fill="#F1C4A4"/>'
    + '<path fill="#5A3A2D" d="M32.3 45.5c-1.4-13 6.4-21.4 17-21.2 8.6.2 14.6 6 15 15.6-1.6 1.4-3.4-3.4-7.6-6.2-3.6 4.6-10.8 7.6-16.2 7.4-3.4 0-6.4 1.6-8.2 4.4z"/><path fill="#5A3A2D" d="M32.6 41c-1.8 5-1.6 11 .4 16.6-3.2-1.6-4.8-6-4.4-10.4.3-3 1.8-5.2 4-6.2z"/>'
    + '<path fill="none" stroke="#6E4A3B" stroke-width=".7" stroke-linecap="round" opacity=".7" d="M44.5 27.5c-3 1.6-6 4.6-7.6 8.6M51 26.6c2.6 1.6 4.4 3.6 5.6 6"/><path fill="none" stroke="#4A2F25" stroke-width="1.25" stroke-linecap="round" d="M38.6 41.2q3.4-1.9 6.8-.5M51 40.7q3.4-1.4 6.8.5"/>'
    + '<ellipse cx="42" cy="46.6" rx="1.75" ry="2.15" fill="#33231D"/><ellipse cx="54.2" cy="46.6" rx="1.75" ry="2.15" fill="#33231D"/><circle cx="42.6" cy="45.9" r=".6" fill="#fff"/><circle cx="54.8" cy="45.9" r=".6" fill="#fff"/>'
    + '<circle cx="38.6" cy="52.6" r="3.1" fill="#EE9580" opacity=".3"/><circle cx="57.6" cy="52.6" r="3.1" fill="#EE9580" opacity=".3"/><path fill="none" stroke="#D69878" stroke-width="1.1" stroke-linecap="round" d="M48.4 48.8q-1.4 3.4.9 4"/>'
    + '<path fill="#B9584A" d="M42.6 55.6q5.5 5.6 11 0-5.5 1.8-11 0z"/><path fill="#fff" d="M43.5 55.9q4.6 1.3 9.2 0l-.5.9q-4.1 1.1-8.2 0z"/>'
    + '<path fill="none" stroke="#3F3D42" stroke-width="2.2" stroke-linecap="round" d="M30.6 45.5C29.2 15.6 66.8 15.6 65.4 45.5"/><rect x="27.6" y="42" width="6.6" height="10.6" rx="3.3" fill="#3F3D42"/>'
    + '<path fill="none" stroke="#3F3D42" stroke-width="1.4" stroke-linecap="round" d="M31.2 52.2c.4 6.6 4.2 8.4 8.6 8.2"/><circle cx="40.8" cy="60.3" r="1.8" fill="#5E8A73"/><circle cx="64" cy="51.6" r="1.1" fill="#E0B266"/></g></svg>';
  const PROMO_HUMAN_TICKS = '<svg viewBox="0 0 18 11" aria-hidden="true"><path d="M1.2 6.2 4.4 9.4 11.2 1.6M7.6 8.6l.8.8 8.4-7.8"/></svg>';   // v23: sent / read ticks
  const PROMO_HUMAN_CLOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.4 2"/></svg>';
  const PROMO_HUMAN_REPLY = "Hi! So sorry for the wait. Yes, it makes a lovely gift: most people love it, and we can gift-wrap it for free. Want me to reserve one for you?";
  const PROMO_MAC_POINTER = '<svg class="promo-mac-pointer" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 2.6v16.9l4.1-4 2.8 6.4 2.9-1.3-2.8-6.3h5.9z"/></svg>';
  const PROMO_HAND_OPEN = '<svg class="is-open" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.6 11.2V5.6a1.3 1.3 0 0 1 2.6 0v5M11.2 10.4V4.4a1.3 1.3 0 0 1 2.6 0v6M13.8 10.6V5.4a1.3 1.3 0 0 1 2.6 0v6.2M16.4 11.4V8.2a1.3 1.3 0 0 1 2.6 0v6.1c0 4-2.6 6.6-6.5 6.6-2.6 0-4.1-1.1-5.5-3l-2.7-4c-.6-.9-.3-1.9.6-2.3.7-.3 1.5 0 2 .6l1.3 1.7"/></svg>';
  const PROMO_HAND_GRAB = '<svg class="is-grab" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.4 11.4c0-1 .8-1.6 1.6-1.6s1.4.6 1.4 1.4M10.4 11c0-1 .7-1.6 1.5-1.6s1.5.6 1.5 1.5M13.4 11.2c0-.9.7-1.5 1.5-1.5s1.4.6 1.4 1.5M16.3 11.6c0-.8.7-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4v2.8c0 4-2.6 6.5-6.5 6.5-2.6 0-4.1-1.1-5.4-2.9l-2-3c-.5-.8-.3-1.8.5-2.2.7-.3 1.4-.1 1.8.4l.9 1.2v-2.6"/></svg>';
  const PROMO_CLERK_CORNER_SCALE = 1.65;
  const PROMO_CLERK_CORNER_INSET_X = -110;
  const PROMO_CLERK_CORNER_INSET_Y = 52;
  const PROMO_AVATAR_CANVAS_WIDTH_PX = Math.ceil(
    PROMO_AVATAR_BOX_W * PROMO_AVATAR_MAX_SCALE * Math.max(PROMO_AVATAR_EXPORT_DPR, window.devicePixelRatio || 1),
  );
  const PROMO_PITCH_REPLACE_GAP_MS = 180;
  const PROMO_PITCH_HERO_IN_MS = 140;
  const PROMO_PITCH_HERO_HOLD_MS = 30;
  const PROMO_PITCH_HERO_OUT_MS = 110;
  const PROMO_PITCH_HERO_OVERLAP_MS = 60;
  const PROMO_PITCH_SELL_HOLD_MS = 240;
  const PROMO_SELL_OUT_MS = 380;
  const PROMO_PAIN_EASE = 'cubic-bezier(0.45, 0.05, 0.2, 1)';
  const PROMO_PAIN_POOL = 48;
  const PROMO_PAIN_CARD_W = 150;
  const PROMO_PAIN_CARD_H = 200;
  const PROMO_STORE_MARK = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M3.6 10.2 6.1 4.8h11.8l2.5 5.4"/><path d="M4.4 10.2h15.2V19.6H4.4z"/><path d="M10.1 19.6V14h3.8v5.6"/></svg>';
  const PROMO_PAIN_PAD = 24;
  const PROMO_PAIN_SCROLL_MS = 860;
  const PROMO_PAIN_TYPE_CHAR_MS = 38;
  const PROMO_PAIN_EXIT_MS = 420;
  const PROMO_WINDOW_AIM_MS = 1600;
  const PROMO_WINDOW_LEAVE_MS = 400;
  const PROMO_WINDOW_HOLD_MS = 560;
  const PROMO_WINDOW_CLOSE_MS = 760;
  const PROMO_CHAT_AIM_MS = 360;
  const PROMO_LAUNCHER_AIM_MS = 520;
  const PROMO_WINDOW_IN_MS = 900;
  const PROMO_STORE_TITLE_IN_MS = 0;
  const PROMO_STORE_TITLE_HOLD_MS = 650;
  const PROMO_STORE_TITLE_OUT_MS = 520;
  const PROMO_LOST_SIZE_RATIO = 0.046;   // v11: the LOST / SOLD chip text, as a share of the card width
  const PROMO_LOST_SIZE_MIN = 5;
  const PROMO_SCALE_SNAP_CLASS_MS = 50;
  const PROMO_SCALE_WHITE_MS = 200;
  const PROMO_SCALE_HOLD_MS = 1000;
  const PROMO_END_CTA_DELAY_MS = 400;
  const PROMO_END_CTA_HOLD_MS = 3000;
  const PROMO_END_CARD_MOVE_MS = 700;
  const PROMO_END_CARD_OPEN_MS = 420;
  const PROMO_END_CARD_BUTTON_MS = 280;
  const PROMO_END_CARD_COPY_DELAY_MS = 300;
  const PROMO_END_CARD_COPY_MS = 300;
  const PROMO_END_CARD_CURSOR_MS = 800;
  const PROMO_END_CARD_HOLD_MS = 4000;
  const PROMO_SCALE_FADE_MS = 250;
  const PROMO_SCALE_LOOP_MS = 3000;
  const PROMO_GRID = {
    cols: 8,
    hero: 0.8,
    inset: 0.92,
    easeMs: 900,
    settleMs: 750,
    fadeMs: 250,
    statusMs: 200,
    introMs: 1500,
    zoomMs: 7400,
    stampDwell: 680,
    stampSpread: 520,
    fieldAt: 0.5,
    holdMs: 1600,
    lostAt: 280,
    gapRatio: 0.012,
    steps: [1, 2, 4, 8],
    devices: [
      { id: 'desktop', ratio: 16 / 10, frame: 800 },
      { id: 'phone', ratio: 9 / 19, frame: 800 },
      { id: 'tablet', ratio: 3 / 4, frame: 800 },
    ],
    variants: ['scroll-up', 'scroll-down', 'wander-near', 'wander-far', 'product-read', 'product-scroll', 'compare'],
    burstMin: 4,
    burstMax: 5,
    gapMin: 300,
    gapMax: 380,
    lostShare: 0.9,
    rushMs: 2600,
    rushEase: 1.55,
    wash: 0.72,
    fieldMs: 3700,
    shimmerMs: 600,
    riseMs: 400,
    pitchHoldMs: 800,
    resolveMs: 500,
    texture: 64,
    fieldCount: 20,
    lostField: '#F3F0EC',
    flowGap: 0.08,
    frameMargin: 0.06,
    stampWidth: 0.78,
    stampInk: 0.7,
    stampAngle: -12,
    stampPressMs: 120,
    deviceMix: { desktop: 0.28, tablet: 0.26, phone: 0.46 },
    deviceWidth: { desktop: 1, tablet: 0.44, phone: 0.22 },
    nearWidth: 0.8,
    farWidth: 0.14,
    stagger: 0,
    intervals: [1200, 500],
    aspect: 16 / 10,
    flashMs: 33,
    collapseMs: 120,
    exitMs: 300,
    liveCount: 4,
    stillSec: 1.15,
    travelLine: 0.42,
    ringMs: 200,
  };
  const PROMO_CORRIDOR = PROMO_GRID;
  const PROMO_CONVEYOR = PROMO_CORRIDOR;
  const PROMO_CONVEYOR_INTERVALS = PROMO_CORRIDOR.intervals;
  const PROMO_CONVEYOR_SIZE_START = PROMO_CORRIDOR.nearWidth;
  const PROMO_CONVEYOR_SIZE_END = PROMO_CORRIDOR.farWidth;
  const PROMO_CONVEYOR_GAP = PROMO_CORRIDOR.stagger;
  const PROMO_CONVEYOR_STREAM_MS = 15000;
  const PROMO_CONVEYOR_FLASH_MS = PROMO_CORRIDOR.flashMs;
  const PROMO_CONVEYOR_PUFF_MS = PROMO_CORRIDOR.collapseMs;
  const PROMO_CONVEYOR_BURST_MS = PROMO_CORRIDOR.exitMs;
  const PROMO_CONVEYOR_PUFF_LIFE_MS = PROMO_CORRIDOR.flashMs + PROMO_CORRIDOR.collapseMs;
  const PROMO_CONVEYOR_ASPECT = PROMO_CORRIDOR.aspect;
  const PROMO_CONVEYOR_LIVE = PROMO_CORRIDOR.liveCount;
  const PROMO_CONVEYOR_MID_MS = 4500;
  const PROMO_CONVEYOR_STILL_MS = PROMO_CORRIDOR.stillSec;
  const PROMO_WALL_SEED = 40721;
  const PROMO_GLIDE = {
    tilt: 28,
    yaw: -8,
    perspective: 1600,
    cellScale: 0.52,
    baseH: 100,
    layDownMs: 1400,
    rampMs: 4000,
    speedFrom: 0,
    speedTo: 2400,
    blurFrom: 900,
    blurPx: 8,
    claimLeadMs: 700,
    washMs: 2000,
    washBlurPx: 22,   // v9: soft rack focus; the cards still read behind the caption
    liveRows: 2,
    liveMaxSpeed: 600,
    blurStart: 0.72,
    blurMax: 24,
    poofMs: 680,
    dustMs: 1100,
    poofShare: 0.4,
    bloomMs: 180,
    burstMs: 320,
    dissolveMs: 800,
    fieldHoldMs: 500,
    resolveMs: 1100,
    endHoldMs: 500,
    captionInMs: 350,
    captionPauseMs: 720,
    captionQuietMs: 980,
    captionLeadMs: -600,
    captionHoldMs: 1400,
    horizonMs: 600,
    horizonTilt: 54,
    painFieldHoldMs: 150,
    pool: 240,
    dirX: 0.34,
    dirY: 0.94,
    stepMs: 36,
  };
  const GLIDE_CART = {
    desktop: { x: 0.9, y: 0.16 },
    tablet: { x: 0.88, y: 0.14 },
    phone: { x: 0.82, y: 0.07 },
  };
  const GLIDE_PAIN_CAPTION = [
    ['Unattended visits', 'cost you sales.'],
    ['Every day.', 'And counting.'],
  ];
  const GLIDE_PAIN_BEATS = GLIDE_PAIN_CAPTION.flat().length;
  const GLIDE_SOLD_CAPTION = [
    ['Visits turn into', 'sales.'],   // as the VO says it
    ['Every day.', 'And counting.'],
  ];

  // v12c: the claims as one week of the merchant's store, no numbers. Each
  // day a tall outlined column of visits rises; the orange sales fill comes up
  // inside it. LOST: the fill never comes (a sliver on the floor). SOLD: it
  // fills each day's visits: visits turn into sales. Painted from one clock
  // (deterministic for export); each day lands with its own sound.
  const PROMO_TALLY = { sold: { fill: 0.86 }, lost: { fill: 0.035 } };
  const PROMO_WEEK = [['M', 0.56], ['T', 0.7], ['W', 0.62], ['T', 0.84], ['F', 0.74], ['S', 0.95], ['S', 0.82]];
  function buildCartTally(kind) {
    const wrap = document.createElement('div');
    wrap.className = `promo-tally promo-week is-${kind}`;
    wrap.innerHTML = `<div class="promo-week__chart"><div class="promo-week__legend"><span class="is-visits"><i></i>Visits</span><span class="is-sales"><i></i>Sales</span></div><div class="promo-week__cols">${PROMO_WEEK.map(([day, h]) => `<span class="promo-week__col" style="--h:${h}"><span class="promo-week__visits"><span class="promo-week__sales"></span></span><span class="promo-week__day">${day}</span></span>`).join('')}</div></div>`;
    return wrap;
  }
  function tallyNumber(n) { return Math.round(n).toLocaleString('en-US'); }
  // ms: time since the visual began; span: its whole life; fade: 0..1 opacity
  function paintCartTally(wrap, kind, ms, span, fade, H) {
    if (!wrap) return;
    const cfg = PROMO_TALLY[kind];
    const smooth = (x) => x * x * (3 - 2 * x);
    const inU = Math.min(1, Math.max(0, ms / 420));
    wrap.style.opacity = (smooth(inU) * fade).toFixed(3);
    wrap.style.setProperty('--week-h', `${H.toFixed(1)}px`);
    const cols = wrap._cols || (wrap._cols = [...wrap.querySelectorAll('.promo-week__col')]);
    const n = cols.length;
    cols.forEach((col, i) => {
      const at = span * 0.05 + span * 0.6 * (i / (n - 1));   // one day per beat, evenly, like a clock
      const t = ms - at;
      const visits = col._v || (col._v = col.querySelector('.promo-week__visits'));
      const sales = col._s || (col._s = col.querySelector('.promo-week__sales'));
      const rise = Math.min(1, Math.max(0, t / 460));
      const r = 1 - (1 - rise) ** 3;
      visits.style.transform = `scaleY(${Math.max(0.0001, r).toFixed(4)})`;
      col.style.opacity = Math.min(1, Math.max(0, t / 220)).toFixed(3);
      // the sales fill, inside the visits column (as a share of it)
      const ft = Math.max(0, (t - 300) / 560);
      const f = ft <= 0 ? 0 : Math.min(1.04, 1 - Math.exp(-ft * 5.2) * Math.cos(ft * 7));   // a soft spring
      sales.style.transform = `scaleY(${Math.max(0.0001, cfg.fill * Math.min(1, f) * (f > 1 ? f : 1)).toFixed(4)})`;
      if (t >= 0 && col.dataset.sfx !== '1') {
        col.dataset.sfx = '1';
        promoSfx(kind === 'sold' ? 'week-sold' : 'week-lost', { index: i }, performance.now() - t);
      }
    });
  }

  function captionBeatOffset(index) {
    const step = PROMO_GLIDE.captionInMs + PROMO_GLIDE.captionPauseMs;
    if (index <= 0) return 0;
    if (index < 3 || GLIDE_PAIN_BEATS <= 3) return step * index;
    return step * 2 + PROMO_GLIDE.captionInMs + PROMO_GLIDE.captionQuietMs;
  }
  const PROMO_GLIDE_NEIGHBOR_IN_MS = 1400;

  // 0..1 reveal of a sea card around the close-up. Cards further from the
  // lead wait a little longer, so the sea opens outward.
  function glideNeighborIn(cell, lead, timeMs) {
    if (!lead) return 1;
    const dx = (cell.x + cell.w / 2) - (lead.x + lead.w / 2);
    const dy = (cell.y + cell.h / 2) - (lead.y + lead.h / 2);
    const dist = Math.hypot(dx, dy) / PROMO_GLIDE.baseH;
    const delay = Math.min(900, 120 + dist * 260);
    const u = Math.min(1, Math.max(0, (timeMs - delay) / PROMO_GLIDE_NEIGHBOR_IN_MS));
    return u * u * (3 - 2 * u);
  }
  const glideRows = new Map();
  let glideLeadDevice = 'desktop';
  const glideWarmMedia = [];
  const glideDecodedStills = new Map();
  let glideEventCache = { key: '', list: [] };
  let glideActiveTilt = PROMO_GLIDE.tilt * Math.PI / 180;

  function glideMarks(mode) {
    const laydown = PROMO_GLIDE.layDownMs;
    const glideEnd = laydown + PROMO_GLIDE.rampMs;
    const claimAt = glideEnd - PROMO_GLIDE.claimLeadMs;
    if (mode !== 'pain') {
      // v26: the sales lane comes in after the caption: the hand-off waits for its widen
      const fieldEnd = glideEnd + PROMO_GLIDE.dissolveMs + PROMO_GLIDE.fieldHoldMs + PROMO_SALES_PITCH_SHIFT;
      return {
        laydown,
        glideEnd,
        claimAt,
        captionStart: glideEnd,
        captionInEnd: glideEnd,
        captionHoldEnd: glideEnd,
        captionPoofEnd: glideEnd,
        horizonEnd: glideEnd,
        fieldEnd,
        playEnd: fieldEnd + PROMO_GLIDE.resolveMs + PROMO_GLIDE.endHoldMs,
      };
    }
    const captionAnchor = claimAt;
    const captionStart = captionAnchor - PROMO_GLIDE.captionLeadMs;
    const quietlyAt = captionBeatOffset(GLIDE_PAIN_BEATS - 1);
    const captionInEnd = captionStart + quietlyAt + PROMO_GLIDE.captionInMs;
    const captionHoldEnd = captionInEnd + PROMO_SALES_BAR.painHoldMs;   // v26: the sales lane plays out under the held caption
    const captionPoofEnd = captionHoldEnd + PROMO_GLIDE.poofMs + PROMO_GLIDE.dustMs;
    const horizonEnd = captionPoofEnd + PROMO_GLIDE.horizonMs;
    const fieldEnd = horizonEnd + PROMO_GLIDE.painFieldHoldMs;
    return {
      laydown,
      glideEnd,
      claimAt,
      captionStart,
      captionInEnd,
      captionHoldEnd,
      captionPoofEnd,
      horizonEnd,
      fieldEnd,
      playEnd: fieldEnd,
    };
  }

  function glidePlayEnd(mode) {
    return glideMarks(mode || 'pitch').playEnd;
  }

  function glideArrive(timeMs) {
    const u = Math.min(1, Math.max(0, timeMs / PROMO_GLIDE.layDownMs));
    return u * u * (3 - 2 * u);
  }

  function glidePhase(timeMs, mode) {
    const marks = glideMarks(mode || 'pitch');
    if (timeMs < marks.laydown) return 'laydown';
    if (timeMs < marks.glideEnd) return 'glide';
    if ((mode || 'pitch') === 'pain') {
      if (timeMs < marks.captionPoofEnd) return 'caption';
      if (timeMs < marks.horizonEnd) return 'horizon';
      if (timeMs < marks.fieldEnd) return 'field';
      return 'end';
    }
    if (timeMs < marks.fieldEnd) return 'field';
    return 'end';
  }

  function glideTiltAt() {
    return PROMO_GLIDE.tilt;
  }

  function glideTilt() {
    return glideActiveTilt;
  }

  function glideYaw() {
    return PROMO_GLIDE.yaw * Math.PI / 180;
  }

  function glideProject(localX, localY) {
    const yaw = glideYaw();
    const tilt = glideTilt();
    const x1 = localX * Math.cos(yaw) - localY * Math.sin(yaw);
    const y1 = localX * Math.sin(yaw) + localY * Math.cos(yaw);
    const y2 = y1 * Math.cos(tilt);
    const z2 = y1 * Math.sin(tilt);
    const depth = Math.max(80, PROMO_GLIDE.perspective - z2);
    const scale = PROMO_GLIDE.perspective / depth;
    return { x: x1 * scale, y: y2 * scale, scale };
  }

  function glideUnproject(screenX, screenY) {
    const yaw = glideYaw();
    const tilt = glideTilt();
    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);
    const minDenom = Math.max(48, PROMO_GLIDE.perspective * 0.08);
    let denom = PROMO_GLIDE.perspective * cosT + screenY * sinT;
    if (denom < minDenom) denom = minDenom;
    const y1 = (screenY * PROMO_GLIDE.perspective) / denom;
    const z2 = y1 * sinT;
    const scale = PROMO_GLIDE.perspective / Math.max(80, PROMO_GLIDE.perspective - z2);
    const x1 = screenX / scale;
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    return {
      x: x1 * cosY + y1 * sinY,
      y: -x1 * sinY + y1 * cosY,
    };
  }

  function glideUnit(frame) {
    const local = glideUnproject(0, frame.height * 0.46);
    const scale = Math.max(0.2, glideProject(local.x, local.y).scale);
    const desktopW = PROMO_GLIDE.baseH * (16 / 10);
    return (frame.width * PROMO_GLIDE.cellScale) / (desktopW * scale);
  }

  function glideRamp(u) {
    const t = Math.min(1, Math.max(0, u));
    return t * t * t * t;
  }

  function glideRampDistance(u) {
    const t = Math.min(1, Math.max(0, u));
    return (t * t * t * t * t) / 5;
  }

  function glideBlurPx(speed) {
    if (speed <= PROMO_GLIDE.blurFrom) return 0;
    const span = Math.max(1, PROMO_GLIDE.speedTo - PROMO_GLIDE.blurFrom);
    const u = Math.min(1, (speed - PROMO_GLIDE.blurFrom) / span);
    return Math.round(u * u * PROMO_GLIDE.blurPx * 2) / 2;
  }

  function glideWash(timeMs, mode) {
    const marks = glideMarks(mode || 'pitch');
    // v24: the pitch field is laid by the sales bar's widen (salesBarMarks), not a fade
    if (mode !== 'pain') return timeMs >= PROMO_SALES_BAR.pitchWiden + PROMO_SALES_BAR.widenMs ? 1 : 0;
    const start = mode === 'pain' ? marks.captionPoofEnd : marks.claimAt;
    const u = Math.min(1, Math.max(0, (timeMs - start) / PROMO_GLIDE.washMs));
    return u * u * (3 - 2 * u);
  }

  function glideSpeed(glideMs) {
    const u = Math.min(1, Math.max(0, glideMs / PROMO_GLIDE.rampMs));
    return PROMO_GLIDE.speedFrom + (PROMO_GLIDE.speedTo - PROMO_GLIDE.speedFrom) * glideRamp(u);
  }

  function glideDistance(glideMs) {
    const span = PROMO_GLIDE.rampMs;
    const from = PROMO_GLIDE.speedFrom;
    const to = PROMO_GLIDE.speedTo;
    const elapsed = Math.max(0, glideMs);
    if (elapsed >= span) {
      const ramp = from * span + (to - from) * span * glideRampDistance(1);
      return (ramp + to * (elapsed - span)) / 1000;
    }
    const u = elapsed / span;
    return (from * elapsed + (to - from) * span * glideRampDistance(u)) / 1000;
  }

  function glideCamera(timeMs) {
    const glideMs = Math.max(0, timeMs);
    const dist = glideDistance(glideMs);
    const len = Math.hypot(PROMO_GLIDE.dirX, PROMO_GLIDE.dirY) || 1;
    return {
      x: dist * PROMO_GLIDE.dirX / len,
      y: dist * PROMO_GLIDE.dirY / len,
      speed: glideSpeed(glideMs),
    };
  }

  function glideSpec(id) {
    const devices = PROMO_GRID.devices;
    const desktop = devices[0];
    const device = devices.find((item) => item.id === id) || desktop;
    const desktopW = PROMO_GLIDE.baseH * desktop.ratio;
    let w = desktopW * (PROMO_GRID.deviceWidth[id] || 1);
    let h = w / device.ratio;
    const rowH = PROMO_GLIDE.baseH * 0.98;
    if (h < rowH) {
      const grow = rowH / h;
      w *= grow;
      h *= grow;
    }
    return { id, device, w, h };
  }

  function glidePitch() {
    return PROMO_GLIDE.baseH * (1 + PROMO_GRID.flowGap);
  }

  function glideOtherDevice(id, row, col) {
    const roll = wallSeededUnit(row * 19 + col * 7 + 11, 41);
    if (id === 'desktop') return roll < 0.62 ? 'phone' : 'tablet';
    if (id === 'tablet') return roll < 0.68 ? 'phone' : 'desktop';
    return roll < 0.55 ? 'tablet' : 'desktop';
  }

  function glideDeviceId(row, col, neighborA, neighborB) {
    if (row === 0 && col === 0) return 'desktop';
    if (row === 0 && col === 1) return 'phone';
    const roll = wallSeededUnit(row * 17 + col * 13 + 400, 29);
    const mix = PROMO_GRID.deviceMix;
    let id = 'desktop';
    if (roll < mix.phone) id = 'phone';
    else if (roll < mix.phone + mix.tablet) id = 'tablet';
    const above = glideRows.get(row - 1)?.cells.find((cell) => cell.col === col)?.id;
    const triple = Boolean(neighborA && neighborA === neighborB && id === neighborA);
    const boxed = Boolean(neighborA && id === neighborA && id === above);
    if (triple || boxed) id = glideOtherDevice(neighborA, row, col);
    return id;
  }

  function glideEnsureRow(row, minX, maxX) {
    let line = glideRows.get(row);
    if (!line) {
      line = { cells: [], minCol: 0, maxCol: -1, left: 0, right: 0 };
      glideRows.set(row, line);
    }
    const gap = PROMO_GLIDE.baseH * PROMO_GRID.flowGap;
    let guard = 0;
    while (line.right < maxX && guard < 200) {
      const col = line.maxCol + 1;
      const prev = line.cells[line.cells.length - 1];
      const prev2 = line.cells[line.cells.length - 2];
      const id = glideDeviceId(row, col, prev?.id, prev2?.id);
      const spec = glideSpec(id);
      const cell = {
        id,
        device: spec.device,
        w: spec.w,
        h: spec.h,
        x: line.right,
        y: row * glidePitch() + (PROMO_GLIDE.baseH - spec.h),
        col,
        row,
        key: `${row}:${col}`,
      };
      line.cells.push(cell);
      line.right += spec.w + gap;
      line.maxCol = col;
      guard += 1;
    }
    guard = 0;
    while (line.left > minX && guard < 200) {
      const col = line.minCol - 1;
      const id = glideDeviceId(row, col, line.cells[0]?.id, line.cells[1]?.id);
      const spec = glideSpec(id);
      line.left -= spec.w + gap;
      line.cells.unshift({
        id,
        device: spec.device,
        w: spec.w,
        h: spec.h,
        x: line.left,
        y: row * glidePitch() + (PROMO_GLIDE.baseH - spec.h),
        col,
        row,
        key: `${row}:${col}`,
      });
      line.minCol = col;
      guard += 1;
    }
    return line;
  }

  function glideSpan(timeMs, frame) {
    const cam = glideCamera(timeMs);
    const unit = glideUnit(frame);
    const padX = frame.width * 0.12;
    const padY = frame.height * 0.12;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    [-1, -0.5, 0, 0.5, 1].forEach((sx) => [-1, -0.5, 0, 0.5, 1].forEach((sy) => {
      const local = glideUnproject(sx * (frame.width / 2 + padX), sy * (frame.height / 2 + padY));
      const x = (local.x + cam.x) / unit;
      const y = (local.y + cam.y) / unit;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }));
    const extraX = (maxX - minX) * 0.08;
    const extraY = (maxY - minY) * 0.08;
    return {
      minX: minX - extraX,
      maxX: maxX + extraX,
      minY: minY - extraY,
      maxY: maxY + extraY,
      cam,
      unit,
    };
  }

  function glideCells(timeMs, frame, mode) {
    glideActiveTilt = glideTiltAt(timeMs, mode || 'pitch') * Math.PI / 180;
    const span = glideSpan(timeMs, frame);
    const pitch = glidePitch();
    const row0 = Math.floor(span.minY / pitch) - 1;
    const row1 = Math.floor(span.maxY / pitch) + 1;
    const cells = [];
    for (let row = row0; row <= row1; row += 1) {
      const line = glideEnsureRow(row, span.minX - 40, span.maxX + 40);
      line.cells.forEach((cell) => {
        if (cell.x + cell.w < span.minX || cell.x > span.maxX) return;
        if (cell.y + cell.h < span.minY || cell.y > span.maxY) return;
        cells.push(cell);
      });
    }
    return { cells, span, pitch };
  }

  function glideCellScreen(cell, cam, unit, frame) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    [[0, 0], [cell.w, 0], [cell.w, cell.h], [0, cell.h]].forEach(([x, y]) => {
      const point = glideProject((cell.x + x) * unit - cam.x, (cell.y + y) * unit - cam.y);
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    });
    return {
      x: frame.width / 2 + minX,
      y: frame.height / 2 + minY,
      w: Math.max(1, maxX - minX),
      h: Math.max(1, maxY - minY),
      cx: frame.width / 2 + (minX + maxX) / 2,
      cy: frame.height / 2 + (minY + maxY) / 2,
    };
  }

  function glideLeadCell(frame) {
    const view = glideCells(0, frame);
    let best = null;
    let bestDist = Infinity;
    const targetX = frame.width / 2;
    const targetY = frame.height * 0.68;
    view.cells.forEach((cell) => {
      if (cell.id !== 'desktop') return;
      const screen = glideCellScreen(cell, view.span.cam, view.span.unit, frame);
      const dist = Math.hypot(screen.cx - targetX, screen.cy - targetY);
      if (dist < bestDist) {
        best = cell;
        bestDist = dist;
      }
    });
    const lead = best || view.cells[0] || null;
    glideFlankLead(lead);
    if (glideLeadDevice === 'phone' && lead) {
      const phone = glideRows.get(lead.row)?.cells.find((cell) => cell.col === lead.col + 1);
      if (phone) return phone;
    }
    return lead;
  }

  function glideRetargetDevice(cell, id, lead) {
    const spec = glideSpec(id);
    cell.id = spec.id;
    cell.device = spec.device;
    cell.w = spec.w;
    cell.h = spec.h;
    cell.y = lead.y + (lead.h - spec.h) / 2;
  }

  function glideFlankLead(lead) {
    if (!lead || lead.flanked) return;
    const line = glideRows.get(lead.row);
    if (!line) return;
    const gap = PROMO_GLIDE.baseH * PROMO_GRID.flowGap;
    glideEnsureRow(lead.row, lead.x - lead.w * 3, lead.x + lead.w * 3);
    const left = line.cells.find((cell) => cell.col === lead.col - 1);
    const right = line.cells.find((cell) => cell.col === lead.col + 1);
    if (!left || !right) return;
    glideRetargetDevice(left, 'tablet', lead);
    glideRetargetDevice(right, 'phone', lead);
    left.kept = true;
    right.kept = true;
    const index = line.cells.findIndex((cell) => cell.key === lead.key);
    for (let i = index - 1; i >= 0; i -= 1) {
      const next = line.cells[i + 1];
      line.cells[i].x = next.x - gap - line.cells[i].w;
    }
    for (let i = index + 1; i < line.cells.length; i += 1) {
      const prev = line.cells[i - 1];
      line.cells[i].x = prev.x + prev.w + gap;
    }
    line.left = line.cells[0].x;
    const last = line.cells[line.cells.length - 1];
    line.right = last.x + last.w + gap;
    lead.flanked = true;
  }

  // What each sea card shows. Picked once per card and remembered, so a card
  // can look at what its neighbours already show and never repeat an image
  // that sits beside it, above it, or below it.
  const glideContentMemo = new Map();
  const GLIDE_NO_CHAT_SHARE = 0.34;

  function glideEffectiveLook(tone, device, motion, chat, look) {
    if (!look || look === 'classic') return 'classic';
    const urls = promoClipUrls();
    return urls[clipFileKey(tone, device, motion, chat, look)] ? look : 'classic';
  }

  // The same moment on a phone, a tablet, or a desktop still reads as the
  // same screen, so the device does not make two cards different.
  function glideVisualKey(cell, content) {
    const family = content.motion.replace(/-[ab]$/, '');
    return `${family}|${content.look}|${content.chat ? 1 : 0}`;
  }

  function glideNeighborKeys(cell, mode) {
    const keys = new Set();
    const take = (other) => {
      if (!other || other.key === cell.key) return;
      const memo = glideContentMemo.get(`${mode}:${other.key}`);
      if (memo) keys.add(memo.visual);
    };
    const line = glideRows.get(cell.row);
    line?.cells.forEach((other) => {
      if (Math.abs(other.col - cell.col) <= 2) take(other);
    });
    [-2, -1, 1, 2].forEach((dy) => {
      const reach = Math.abs(dy) === 1 ? 1.2 : 0.4;
      const left = cell.x - cell.w * reach;
      const right = cell.x + cell.w * (1 + reach);
      glideRows.get(cell.row + dy)?.cells.forEach((other) => {
        if (other.x < right && other.x + other.w > left) take(other);
      });
    });
    return keys;
  }

  function glideContent(cell, mode) {
    const memoKey = `${mode}:${cell.key}`;
    const known = glideContentMemo.get(memoKey);
    if (known) return known;
    const tone = mode === 'pitch' ? 'pitch' : 'pain';
    const motions = mode === 'pitch'
      ? PROMO_PITCH_MOMENTS
      : (PROMO_CLIP_MOTIONS[cell.id] || PROMO_CLIP_MOTIONS.desktop);
    const deviceSalt = cell.id === 'phone' ? 2 : cell.id === 'tablet' ? 4 : 0;
    const m0 = Math.floor(gridMix(cell.col, cell.row, (mode === 'pitch' ? 7 : 3) + deviceSalt) * motions.length);
    const l0 = Math.floor(gridMix(cell.col, cell.row, (mode === 'pitch' ? 11 : 5) + deviceSalt) * PROMO_STORE_LOOKS.length);
    const wantsChat = mode !== 'pitch'
      && glideHashUnit(cell.row, cell.col, 97) >= GLIDE_NO_CHAT_SHARE;
    const taken = glideNeighborKeys(cell, mode);
    let pick = null;
    for (let i = 0; i < motions.length && !pick; i += 1) {
      const motion = motions[(m0 + i) % motions.length];
      for (let j = 0; j < PROMO_STORE_LOOKS.length && !pick; j += 1) {
        const rawLook = PROMO_STORE_LOOKS[(l0 + j) % PROMO_STORE_LOOKS.length];
        const chat = mode === 'pitch' ? false : wantsChat;
        const look = glideEffectiveLook(tone, cell.id, motion, chat, rawLook);
        const content = { motion, look, chat };
        const visual = glideVisualKey(cell, content);
        if (!taken.has(visual)) pick = { ...content, visual };
      }
    }
    if (!pick) {
      const motion = motions[m0];
      const content = { motion, look: 'classic', chat: mode !== 'pitch' && wantsChat };
      pick = { ...content, visual: glideVisualKey(cell, content) };
    }
    glideContentMemo.set(memoKey, pick);
    return pick;
  }

  function glideMotion(cell, mode) {
    return glideContent(cell, mode).motion;
  }

  function glideLook(cell, mode) {
    return glideContent(cell, mode).look;
  }

  function glideChat(cell, mode, leadKey) {
    if (mode === 'pitch' || cell.key === leadKey) return false;
    return glideContent(cell, mode).chat;
  }

  function glideStillSrc(tone, device, motion, chat, look) {
    const match = clipSrc(tone, device, motion, chat, look).match(/promo-clip-([^/?#]+)\.mp4/);
    return match ? `/promo/sea-of-cards/${tone}/images/promo-still-${match[1]}.jpg` : '';
  }

  function glideEventStart() {
    return PROMO_GLIDE.layDownMs;
  }

  // Integer hash (lowbias32). wallSeededUnit is linear in its inputs, so
  // neighbouring cards got neighbouring seeds and stamped in stripes.
  function glideHashUnit(row, col, salt) {
    let h = (Math.imul(row + 1013, 0x9e3779b1) ^ Math.imul(col + 7919, 0x85ebca77) ^ Math.imul(salt + 31, 0xc2b2ae3d)) >>> 0;
    h ^= h >>> 16;
    h = Math.imul(h, 0x7feb352d) >>> 0;
    h ^= h >>> 15;
    h = Math.imul(h, 0x846ca68b) >>> 0;
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }

  // v24b: a card stamps just after it comes into view, so the verdicts keep
  // pace with the camera (accelerating with it) and there is never a stretch
  // of unstamped cards. The cards already on screen when the glide starts
  // ripple through over the slow first second instead of all at once.
  function glideStampAt(cell, entry, exit, mode) {
    const u = glideHashUnit(cell.row, cell.col, mode === 'pitch' ? 71 : 29);
    const ripple = glideEventStart() + 120 + 1250 * u;
    if (entry <= glideEventStart() + 1) return ripple;
    const dwell = Math.max(120, exit - entry);
    return Math.max(Math.min(ripple, entry + 120), entry + Math.min(dwell * (0.01 + 0.05 * u), 20 + 140 * u));
  }

  function glideKeepsStamp(cell, mode) {
    if (mode !== 'pain') return true;
    return glideHashUnit(cell.row, cell.col, 53) < 0.93 && !glideSells(cell, mode);
  }

  // v24: the pain's few buyers: no LOST, they keep their colour and their
  // sale flies into the sales bar.
  function glideSells(cell, mode) {
    return mode === 'pain' && glideHashUnit(cell.row, cell.col, 211) < PROMO_SALES_BAR.painShare;
  }

  // v24b: "in view" = the card's leading edge has come into the frame (an
  // eighth of it), so a card takes its verdict as it slides in, at the pace
  // the camera brings it, not once its centre is well inside
  function glideMiddle(cell, cam, unit, frame) {
    const screen = glideCellScreen(cell, cam, unit, frame);
    return screen.x + screen.w * 0.12 < frame.width
      && screen.x + screen.w * 0.88 > 0
      && screen.y + screen.h * 0.12 < frame.height
      && screen.y + screen.h * 0.88 > 0;
  }

  function glideMiddleAt(cell, frame, mode, timeMs) {
    const previous = glideActiveTilt;
    glideActiveTilt = glideTiltAt(timeMs, mode) * Math.PI / 180;
    const hit = glideMiddle(cell, glideCamera(timeMs), glideUnit(frame), frame);
    glideActiveTilt = previous;
    return hit;
  }

  function glideMiddleEntry(cell, frame, mode, now) {
    if (!glideMiddleAt(cell, frame, mode, now)) return null;
    const start = glideEventStart();
    if (glideMiddleAt(cell, frame, mode, start)) return start;
    let lo = start;
    let hi = now;
    for (let step = 0; step < 14; step += 1) {
      const mid = (lo + hi) / 2;
      if (glideMiddleAt(cell, frame, mode, mid)) hi = mid;
      else lo = mid;
    }
    return hi;
  }

  function glideMiddleExit(cell, frame, mode, entry) {
    const limit = glideMarks(mode).playEnd + 2000;
    let lo = entry;
    let hi = null;
    for (let t = entry + 80; t <= limit; t += 80) {
      if (!glideMiddleAt(cell, frame, mode, t)) {
        hi = t;
        break;
      }
      lo = t;
    }
    if (hi == null) return limit;
    for (let step = 0; step < 8; step += 1) {
      const mid = (lo + hi) / 2;
      if (glideMiddleAt(cell, frame, mode, mid)) lo = mid;
      else hi = mid;
    }
    return lo;
  }

  function glideEvents(mode, frame) {
    const key = `${mode}:${frame.width}x${frame.height}`;
    if (glideEventCache.key === key) return glideEventCache.list;
    const list = [];
    const seen = new Set();
    // Keep stamping for as long as the sea is on screen, not only through the
    // ramp: the camera is fastest after it, under the caption.
    const end = glideMarks(mode).playEnd;
    for (let time = glideEventStart(); time < end; time += PROMO_GLIDE.stepMs) {
      const view = glideCells(time, frame, mode);
      view.cells.forEach((cell) => {
        const sells = glideSells(cell, mode);   // v24b: the pain's buyers turn warm (no LOST)
        if (seen.has(cell.key) || (!sells && !glideKeepsStamp(cell, mode))) return;
        if (!glideMiddle(cell, view.span.cam, view.span.unit, frame)) return;
        seen.add(cell.key);
        const entry = glideMiddleEntry(cell, frame, mode, time) ?? time;
        const exit = glideMiddleExit(cell, frame, mode, entry);
        list.push({
          t: glideStampAt(cell, entry, exit, mode),
          key: cell.key,
          row: cell.row,
          col: cell.col,
          sold: sells || undefined,
        });
      });
    }
    const lead = glideLeadCell(frame);
    if (lead) {
      const existing = list.find((event) => event.key === lead.key);
      if (existing) existing.t = -400;
      else list.push({ t: -400, key: lead.key, row: lead.row, col: lead.col });
    }
    glideEventCache = { key, list };
    return list;
  }

  function glideEventAt(mode, frame, key, timeMs) {
    return glideEvents(mode, frame).find((event) => event.key === key && event.t <= timeMs) || null;
  }

  // v26 (E4): the claims' SALES LANE. One wide white glass lane, centred
  // behind the caption, rising from the bottom edge, "Sales" at its base; one
  // flat bar inside it. It comes in only once the caption's last beat ("And
  // counting.") has landed. Marks fly from the sea's own stamped cards to the
  // bar top: a ✓ lands (a soft ring, the mark shrinks into the bar) and raises
  // it; a ✕ clips the rim, kicks off sideways and tumbles out. Pain: ~1 in 7
  // lands, the bar ends a short grey stub. Pitch: nearly all land, the bar
  // fills the lane, leaves the frame top, then widens into the orange field
  // the next scene comes out of. Everything is a pure function of the sea's
  // clock (export-safe); the marks are one canvas.
  const PROMO_SALES_BAR = {
    laneW: 0.3,          // the lane, share of the frame width (centred)
    laneTop: 0.12,       // its top, share of the frame height (it bleeds off the bottom)
    radius: 28 / 720,    // rounded top corners, share of the frame height
    inMs: 600,
    inLift: 60 / 720,    // the lane rises this far (share of the height) as it fades in
    painInAfter: 180,    // after the pain caption's last beat has landed
    painFlowDelay: 150,
    painFlowMs: 1450,
    painMarks: 21,       // every 7th (from the 4th) is a ✓; the ✕s pile up on the floor
    painHoldMs: 2900,    // the pain caption's hold (was 1400): the marks play out under it
    painOutMs: 900,
    painBase: 0.06,      // the grey stub, share of the frame height ...
    painGain: 0.07,      // ... plus this once every ✓ has landed
    pitchIn: 5200,       // "And counting." lands ~5070 (t-sold "sales." + the pain's cadence)
    pitchFlowFrom: 5350,
    pitchFlowMs: 1400,
    pitchMarks: 44,
    pitchHit: 0.94,
    pitchExit: 6950,     // the fill leaves the frame top (v23b: -300 ms, the music fit)
    exitMs: 500,
    pitchWiden: 7200,    // ... then widens into the whole frame
    widenMs: 600,
    landMs: 240,         // a ✓'s share of the level eases in over this
    painShare: 0.1,      // the pain's buyers: this share of its cards sells (no LOST)
  };
  // the pitch sea holds its hand-off this much later than the glide's end
  const PROMO_SALES_PITCH_SHIFT = PROMO_SALES_BAR.pitchWiden + PROMO_SALES_BAR.widenMs - (PROMO_GLIDE.layDownMs + PROMO_GLIDE.rampMs);

  function salesBarMarks(mode) {
    const B = PROMO_SALES_BAR;
    if (mode === 'pain') {
      const marks = glideMarks('pain');
      const inAt = marks.captionInEnd + B.painInAfter;
      const flow = inAt + B.painFlowDelay;
      return { in: inAt, flow, flowEnd: flow + B.painFlowMs, out: marks.captionHoldEnd, outEnd: marks.captionHoldEnd + B.painOutMs };
    }
    return {
      in: B.pitchIn,
      flow: B.pitchFlowFrom,
      flowEnd: B.pitchFlowFrom + B.pitchFlowMs,
      exit: B.pitchExit,
      widen: B.pitchWiden,
      widenEnd: B.pitchWiden + B.widenMs,
    };
  }

  // The lane (x, w from laneTop down past the bottom edge), in frame px; k is
  // the frame height over the 720 px the design was drawn at.
  function salesBarGeom(frame) {
    const B = PROMO_SALES_BAR;
    const W = frame.width;
    const H = frame.height;
    const k = H / 720;
    const w = Math.round(W * B.laneW / 2) * 2;
    const x = Math.round(W / 2 - w / 2);
    return { W, H, k, x, w, cx: x + w / 2, laneTop: H * B.laneTop, R: H * B.radius, labelY: H - 40 * k, labelPx: 30 * k };
  }

  function salesEase(u) {
    const t = Math.min(1, Math.max(0, u));
    return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
  }

  function salesSmooth(u) {
    const t = Math.min(1, Math.max(0, u));
    return t * t * (3 - 2 * t);
  }

  function salesClamp(u) {
    return Math.min(1, Math.max(0, u));
  }

  let salesBarCache = { key: '', data: null };

  // Every mark's flight, once per sea: the card it lifts off (where that card
  // is on screen at that moment of the glide), when it lands or bounces, and
  // the bar's level over time.
  function salesBarFlights(mode, frame, exclude) {
    const key = `v26:${mode}:${frame.width}x${frame.height}:${[...(exclude || [])].join(',')}`;
    if (salesBarCache.key === key) return salesBarCache.data;
    const B = PROMO_SALES_BAR;
    const g = salesBarGeom(frame);
    const m = salesBarMarks(mode);
    const pitch = mode === 'pitch';
    const n = pitch ? B.pitchMarks : B.painMarks;
    const stampedAt = new Map();
    glideEvents(mode, frame).forEach((event) => stampedAt.set(event.key, event.t));
    const previousTilt = glideActiveTilt;
    const used = new Set();
    // a card on screen at t0, off the lane: a stamped one (LOST in the pain,
    // SOLD in the pitch) for its mark, a pain buyer for a pain ✓
    const source = (t0, hit, salt) => {
      const view = glideCells(t0, frame, mode);
      const picks = [];
      view.cells.forEach((cell) => {
        if (used.has(cell.key) || exclude?.has(cell.key)) return;
        const screen = glideCellScreen(cell, view.span.cam, view.span.unit, frame);
        if (screen.cx < g.W * 0.05 || screen.cx > g.W * 0.95 || screen.cy < g.H * 0.1 || screen.cy > g.H * 0.88) return;
        if (Math.abs(screen.cx - g.cx) < g.w * 0.5 + g.W * 0.03) return;
        const stamp = stampedAt.get(cell.key);
        const stamped = stamp != null && stamp <= t0 + 250;   // stamped, or stamping as its mark lifts off
        const fit = pitch
          ? (hit ? stamped : !stamped)
          : (hit ? glideSells(cell, 'pain') : stamped && !glideSells(cell, 'pain'));
        picks.push({ cell, screen, fit });
      });
      const fits = picks.filter((pick) => pick.fit);
      const list = fits.length ? fits : picks;
      if (!list.length) return null;
      const pick = list[Math.min(list.length - 1, Math.floor(salt * list.length))];
      used.add(pick.cell.key);
      return { x: pick.screen.cx, y: pick.screen.cy, key: pick.cell.key, real: fits.length > 0 };
    };
    const marks = [];
    for (let i = 0; i < n; i += 1) {
      const h = (salt) => glideHashUnit(i, salt, pitch ? 409 : 401);
      const hit = pitch ? (i === 0 || h(1) < B.pitchHit) : i % 7 === 3;
      const u = i / n;
      const at = m.flow + (m.flowEnd - m.flow) * (pitch ? u ** 1.35 : u) + 80 * h(2);
      const from = source(at, hit, h(3)) || {
        x: g.W * (h(5) < 0.5 ? 0.06 + 0.24 * h(4) : 0.7 + 0.24 * h(4)),
        y: g.H * (0.14 + 0.66 * h(6)),
        key: null,
        real: false,
      };
      marks.push({
        hit,
        at,
        dur: 620 + 180 * h(7),
        sx: from.x,
        sy: from.y,
        key: from.key,
        real: from.real,
        side: h(8) < 0.5 ? -1 : 1,
        jit: (h(10) - 0.5) * 0.22,
        s: 0.85 + 0.3 * h(9),
      });
    }
    glideActiveTilt = previousTilt;
    marks.sort((a, b) => a.at - b.at);
    let hits = 0;
    let misses = 0;
    marks.forEach((mark, index) => {
      mark.index = index;
      if (mark.hit) mark.hitIndex = hits++;
      else mark.missIndex = misses++;
    });
    const hitTimes = marks.filter((mark) => mark.hit).map((mark) => mark.at + mark.dur).sort((a, b) => a - b);
    const total = Math.max(1, hitTimes.length);
    const count = (t) => {
      let sum = 0;
      for (let index = 0; index < hitTimes.length; index += 1) {
        const u = (t - hitTimes[index]) / B.landMs;
        if (u <= 0) break;
        sum += u >= 1 ? 1 : salesSmooth(u);
      }
      return sum;
    };
    const enter = (t) => 1 - (1 - salesClamp((t - m.in) / B.inMs)) ** 3;
    // the bar's height, share of the frame height (> 1: past the frame top)
    const level = (t) => {
      const e = enter(t);
      if (e <= 0) return 0;
      if (!pitch) return (B.painBase + B.painGain * (count(t) / total)) * e;
      let lv = 0.04 + (count(t) / total) ** 0.9;   // full to the lane top just as it leaves
      if (t > m.exit) lv += salesClamp((t - m.exit) / B.exitMs) ** 3 * 0.9;
      return lv * e;
    };
    let overflowAt = m.exit;
    if (pitch) {
      for (let t = m.in; t <= m.exit + B.exitMs; t += 8) {
        if (level(t) >= 1 - B.laneTop) { overflowAt = t; break; }
      }
    }
    // v26b: the pain's lost marks stay: each drops to the frame's bottom edge
    // (the floor), bounces softly twice and comes to rest in a pile beside the
    // lane, both sides, never inside it (rest spots precomputed in order)
    if (!pitch) {
      const piles = { '-1': [], 1: [] };
      const grav = 3000 * g.k;   // px/s²
      marks.filter((mark) => !mark.hit).forEach((mark) => {
        const hh = (salt) => glideHashUnit(mark.index, salt, 433);
        const t1 = mark.at + mark.dur * 0.78;
        const tx = g.cx + mark.side * g.w * 0.36;
        const ty = Math.max(-40 * g.k, g.H - level(t1) * g.H) - 6 * g.k;
        const r = 17 * 1.45 * mark.s * g.k;
        const rc = r * 0.84;   // they overlap a little
        const edge = mark.side < 0 ? g.x : g.x + g.w;
        const wall = edge + mark.side * (r + 3 * g.k);   // the lane's side: it never rests inside
        const fit = (x) => (mark.side > 0 ? Math.max(wall, x) : Math.min(wall, x));
        const pile = piles[mark.side];
        const restAt = (x) => {
          let y = g.H - r * 0.92;
          pile.forEach((c) => {
            const dx = Math.abs(x - c.x);
            const reach = rc + c.rc;
            if (dx < reach) y = Math.min(y, c.y - Math.sqrt(reach * reach - dx * dx));
          });
          return y;
        };
        // it lands near the lane, then rolls down the pile's slope until it
        // sits in a hollow, against the lane or on the floor (a mound, not a tower)
        let rx = fit(edge + mark.side * (r + 3 * g.k + r * (0.1 + 4 * hh(1) ** 2)));
        let ry = restAt(rx);
        const step = r * 0.06;
        for (let roll = 0; roll < 400; roll += 1) {
          const outX = fit(rx + mark.side * step);
          const inX = fit(rx - mark.side * step);
          const yOut = restAt(outX);
          const yIn = restAt(inX);
          if (yOut > ry + 0.01 && yOut >= yIn) { rx = outX; ry = yOut; }
          else if (yIn > ry + 0.01) { rx = inX; ry = yIn; }
          else break;
        }
        pile.push({ x: rx, y: ry, rc });
        const apex = Math.min(ty, ry) - 26 * g.k;
        const vy0 = -Math.sqrt(2 * grav * Math.max(1, ty - apex));
        const tFall = (-vy0 + Math.sqrt(Math.max(0, vy0 * vy0 + 2 * grav * (ry - ty)))) / grav;
        const v1 = (vy0 + grav * tFall) * 0.3;
        const v2 = v1 * 0.3;
        mark.pile = {
          t1, tx, ty, rx, ry, vy0, grav, tFall, v1, v2,
          tEnd: tFall + (2 * (v1 + v2)) / grav,
          rot: (hh(2) - 0.5) * 1.1,
          spin: Math.min(3.2, Math.abs(rx - tx) / r),
          floorAt: t1 + tFall * 1000,
        };
      });
    }
    const data = { mode, geom: g, times: m, marks, hitTimes, count, enter, level, overflowAt, stampedAt };
    salesBarCache = { key, data };
    window.__promoSalesBar = data;   // dev: inspect the marks from the console
    return data;
  }

  // Where a mark is at t: it arcs from its card to the bar top; a ✓ lands
  // there (phase 'in'), a ✕ clips the rim at 78% of its flight and tumbles out.
  function salesMarkAt(mark, t, g, topY) {
    const k = g.k;
    const u = salesClamp((t - mark.at) / mark.dur);
    const tx = g.cx + (mark.hit ? mark.jit * g.w : mark.side * g.w * 0.36);
    const rim = Math.max(-40 * k, topY);
    const ty = rim - 6 * k;
    if (mark.hit || u < 0.78) {
      const e = salesEase(Math.min(1, u / (mark.hit ? 1 : 0.78)));
      return {
        x: mark.sx + (tx - mark.sx) * e,
        y: mark.sy + (ty - mark.sy) * e - 120 * k * Math.sin(e * Math.PI) * mark.s,
        phase: mark.hit && u >= 1 ? 'in' : 'fly',
        rim,
      };
    }
    if (mark.pile) {   // the pain: it drops to the floor and rests in the pile
      const p = mark.pile;
      const s = Math.max(0, (t - p.t1) / 1000);
      let y = p.ry;
      if (s < p.tFall) y = p.ty + p.vy0 * s + 0.5 * p.grav * s * s;
      else {
        let q = s - p.tFall;
        const b1 = (2 * p.v1) / p.grav;
        const b2 = (2 * p.v2) / p.grav;
        if (q < b1) y = p.ry - (p.v1 * q - 0.5 * p.grav * q * q);
        else if ((q -= b1) < b2) y = p.ry - (p.v2 * q - 0.5 * p.grav * q * q);
      }
      const px = 1 - (1 - Math.min(1, s / p.tEnd)) ** 3;
      return { x: p.tx + (p.rx - p.tx) * px, y, phase: 'pile', rot: p.rot - mark.side * p.spin * (1 - px), rim };
    }
    const fall = salesClamp((t - mark.at - mark.dur * 0.78) / 900);
    return {
      x: tx + mark.side * k * (150 * fall + 60 * (1 - (1 - fall) ** 4)),
      y: ty - 30 * k * Math.sin(Math.min(1, fall * 2.2) * Math.PI) + 520 * k * fall * fall,
      phase: 'miss',
      fall,
      rim,
    };
  }

  // The marks as sprites (shadows baked once): the film's light glass chip
  // (icon only, thin graphite glyph) and, for the pitch's sales, the solid
  // orange disc with a white ✓. Drawn at SALES_MARK_PX sprite px per design px.
  const SALES_MARK_PX = 2.6;
  const SALES_MARK_HALF = 160;
  const SALES_GLYPH_X = 'M3.5 3.5 8.5 8.5M8.5 3.5 3.5 8.5';   // PROMO_MARK_X's path
  const SALES_GLYPH_CHECK = 'M2.4 6.3 4.9 8.8 9.8 3.3';       // PROMO_MARK_CHECK's path
  let salesMarkSprites = null;
  function salesMarkSprite(kind) {
    if (!salesMarkSprites) salesMarkSprites = {};
    if (salesMarkSprites[kind]) return salesMarkSprites[kind];
    const f = SALES_MARK_PX;
    const sprite = document.createElement('canvas');
    sprite.width = SALES_MARK_HALF * 2;
    sprite.height = SALES_MARK_HALF * 2;
    const ctx = sprite.getContext('2d');
    ctx.translate(SALES_MARK_HALF, SALES_MARK_HALF);
    const disc = kind === 'disc';
    const scale = (disc ? 1.35 : 1.45) * f;
    ctx.save();
    ctx.scale(scale, scale);
    ctx.shadowColor = disc ? 'rgba(20, 20, 24, 0.25)' : 'rgba(30, 24, 18, 0.22)';
    ctx.shadowBlur = (disc ? 14 : 16) * f;
    ctx.shadowOffsetY = (disc ? 5 : 6) * f;
    ctx.beginPath();
    ctx.arc(0, 0, 17, 0, Math.PI * 2);
    if (disc) {
      const grad = ctx.createLinearGradient(0, -17, 0, 17);
      grad.addColorStop(0, '#FBB46E');
      grad.addColorStop(1, '#EF8A2E');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    }
    ctx.fill();
    ctx.shadowColor = 'transparent';
    if (!disc) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(30, 24, 18, 0.07)';
      ctx.stroke();
    }
    // the glyph: the film's own 12-unit paths, ~24 chip units across
    const glyph = disc ? 21.7 : 24;
    ctx.scale(glyph / 12, glyph / 12);
    ctx.translate(-6, -6);
    ctx.strokeStyle = disc ? '#fff' : '#3B3632';   // --promo-pain-ink
    ctx.lineWidth = disc ? 1.21 : 0.95;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke(new Path2D(kind === 'chip-x' ? SALES_GLYPH_X : SALES_GLYPH_CHECK));
    ctx.restore();
    salesMarkSprites[kind] = sprite;
    return sprite;
  }

  function painPoofWindow() {
    return PROMO_GLIDE.poofMs + PROMO_GLIDE.dustMs;
  }

  function painInView(screen, frame, timeMs) {
    const arrive = glideArrive(timeMs);
    const insetX = (1 - arrive) * frame.width * 0.1 + frame.width * 0.035;
    const insetY = (1 - arrive) * frame.height * 0.08 + frame.height * 0.03;
    return screen.cx > insetX
      && screen.cx < frame.width - insetX
      && screen.cy > insetY
      && screen.cy < frame.height - insetY;
  }

  function painScreenAt(cell, timeMs, frame) {
    const previous = glideActiveTilt;
    glideActiveTilt = glideTiltAt(timeMs, 'pain') * Math.PI / 180;
    const screen = glideCellScreen(cell, glideCamera(timeMs), glideUnit(frame), frame);
    glideActiveTilt = previous;
    return screen;
  }

  function painEntryTime(cell, frame, now) {
    const visible = (timeMs) => painInView(painScreenAt(cell, timeMs, frame), frame, timeMs);
    if (!visible(now)) return null;
    if (visible(0)) return 0;
    let lo = 0;
    let hi = now;
    for (let step = 0; step < 14; step += 1) {
      const mid = (lo + hi) / 2;
      if (visible(mid)) hi = mid;
      else lo = mid;
    }
    return hi;
  }

  function painPoofState(cell, timeMs, frame) {
    if (cell.kept) return { age: null, opacity: 1 };
    if (cell.poofFrameW !== frame.width) {
      cell.poofEntry = null;
      cell.poofFrameW = frame.width;
    }
    if (cell.poofEntry == null) {
      const entry = painEntryTime(cell, frame, timeMs);
      if (entry == null) return { age: null, opacity: 1 };
      const speed = glideSpeed(entry);
      const haste = Math.min(1, Math.max(0, (speed - 280) / (PROMO_GLIDE.speedTo - 280)));
      const seed = wallSeededUnit(cell.row * 19 + 3, cell.col * 11 + 7);
      cell.poofEntry = entry;
      cell.poofHaste = haste;
      cell.poofBlows = haste > 0.42 || seed < PROMO_GLIDE.poofShare;
      cell.poofLead = (1 - haste) * (140 + seed * 820) + haste * (20 + seed * 70);
      cell.poofRate = 1 + haste * 2.6;
    }
    if (!cell.poofBlows) return { age: null, opacity: 1 };
    const elapsed = (timeMs - cell.poofEntry - cell.poofLead) * cell.poofRate;
    if (elapsed < 0) return { age: null, opacity: 1 };
    const window = painPoofWindow();
    if (cell.poofRate > 1.8) {
      if (elapsed < window) return { age: elapsed, opacity: null };
      return { age: null, opacity: 0 };
    }
    const cycle = window / PROMO_GLIDE.poofShare;
    const local = elapsed % cycle;
    if (local < window) return { age: local, opacity: null };
    return { age: null, opacity: Math.min(1, (local - window) / 280) };
  }

  function buildPainPoof() {
    const poof = document.createElement('div');
    poof.className = 'promo-glide__poof';
    for (let puff = 0; puff < 10; puff += 1) {
      const smoke = document.createElement('i');
      smoke.className = 'promo-glide__smoke';
      poof.append(smoke);
    }
    for (let bit = 0; bit < 64; bit += 1) {
      const ash = document.createElement('i');
      ash.className = 'promo-glide__ash';
      const size = bit % 9 === 0 ? 9 : bit % 3 === 0 ? 5 : 3;
      ash.style.setProperty('--ash', `${size}px`);
      poof.append(ash);
    }
    return poof;
  }

  function writePaint(node, key, value) {
    if (!node) return;
    const wrote = node._paint || (node._paint = {});
    const next = value == null ? '' : String(value);
    if (wrote[key] === next) return;
    wrote[key] = next;
    if (key === 'opacity') node.style.opacity = next;
    else if (key === 'transform') node.style.transform = next;
    else if (key === 'width') node.style.width = next;
    else if (key === 'height') node.style.height = next;
    else node.style.setProperty(key, next);
  }

  function writeHidden(node, hidden) {
    if (!node || node.hidden === hidden) return;
    node.hidden = hidden;
  }

  function glideParts(node, fx) {
    if (node._parts) return node._parts;
    const poof = fx ? fx.querySelector('.promo-glide__poof') : null;
    const parts = {
      still: node.querySelector('.promo-glide__still'),
      video: node.querySelector('.promo-glide__video'),
      veil: node.querySelector('.promo-glide__veil'),
      mark: node.querySelector('.promo-glide__mark'),
      lost: node.querySelector('.promo-glide__lost-mark'),
      bloom: fx ? fx.querySelector('.promo-glide__bloom') : null,
      rays: fx ? fx.querySelector('.promo-glide__rays') : null,
      poof,
      smokes: poof ? [...poof.querySelectorAll('.promo-glide__smoke')] : [],
      ashes: poof ? [...poof.querySelectorAll('.promo-glide__ash')] : [],
    };
    node._parts = parts;
    return parts;
  }

  function glideCellScreenAt(cell, cam, unit, frame, tiltDeg) {
    const prev = glideActiveTilt;
    glideActiveTilt = tiltDeg * Math.PI / 180;
    const screen = glideCellScreen(cell, cam, unit, frame);
    glideActiveTilt = prev;
    return screen;
  }

  function releaseHeldVideo(video, still) {
    if (!video || !still || video.dataset.still === '1' || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    const width = Math.min(480, video.videoWidth);
    const height = Math.max(1, Math.round(width * video.videoHeight / Math.max(1, video.videoWidth)));
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return;
    try {
      context.drawImage(video, 0, 0, width, height);
    } catch (error) {
      return;
    }
    const url = canvas.toDataURL('image/jpeg', 0.72);
    still.src = url;
    still.dataset.src = url;
    video.dataset.still = '1';
    video.pause();
    video.removeAttribute('src');
    video.load();
    writeHidden(video, true);
    writeHidden(still, false);
  }

  const GLIDE_LIVE_CAP = 16;

  const PROMO_CHECK_DRAW_MS = 220;
  const PROMO_CHECK_POP_MS = 380;
  const PROMO_CHECK_SETTLE_MS = 460;
  const PROMO_CHECK_PATH = 14;

  // v11: LOST and SOLD are one light glass chip in the film's pill style: a
  // thin ✕ + "Lost" in graphite, a thin ✓ + "Sold" in orange. The glyph draws
  // in as the chip pops (paintCheckPop), and the card under it reacts.
  const PROMO_MARK_X = '<span class="promo-chip-mark__glyph"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 3.5 8.5 8.5M8.5 3.5 3.5 8.5" fill="none" stroke="currentColor" stroke-linecap="round"/></svg></span><span class="promo-chip-mark__word">Lost</span>';
  const PROMO_MARK_CHECK = '<span class="promo-chip-mark__glyph"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.4 6.3 4.9 8.8 9.8 3.3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="promo-chip-mark__word">Sold</span>';
  function fillLostMark(mark) {
    if (!mark || mark.querySelector('.promo-chip-mark__glyph')) return mark;
    mark.classList.add('promo-chip-mark', 'is-lost');
    mark.innerHTML = PROMO_MARK_X;
    return mark;
  }
  function fillSoldMark(mark) {
    if (!mark || mark.querySelector('.promo-chip-mark__glyph')) return mark;
    mark.classList.add('promo-chip-mark', 'is-sold');
    mark.innerHTML = PROMO_MARK_CHECK;
    return mark;
  }
  // 0..1 how far a stamped card has reacted (sunk / lifted)
  function markReact(age) {
    const u = Math.min(1, Math.max(0, (age - 80) / 560));
    return u * u * (3 - 2 * u);
  }
  // the card's own reaction: a lost card greys and sinks, a sold card warms and lifts
  function markReactFilter(kind, r) {
    if (r <= 0.001 || kind === 'lost') return '';   // a lost card only sinks (pain is already grey; a filter bent its long shadow)
    return kind === 'lost'
      ? `grayscale(${(0.92 * r).toFixed(3)}) brightness(${(1 - 0.05 * r).toFixed(3)}) contrast(${(1 - 0.1 * r).toFixed(3)})`
      : `saturate(${(1 + 0.22 * r).toFixed(3)}) sepia(${(0.1 * r).toFixed(3)}) brightness(${(1 + 0.035 * r).toFixed(3)})`;
  }

  function lostMarkSize(width, height = 0) {
    return `${Math.max(PROMO_LOST_SIZE_MIN, Math.max(width, height * 0.66) * PROMO_LOST_SIZE_RATIO).toFixed(0)}px`;
  }

  function checkPopScale(t) {
    if (t < 0.62) {
      const u = t / 0.62;
      return 0.86 + (1.06 - 0.86) * (1 - (1 - u) ** 3);
    }
    const u = (t - 0.62) / 0.38;
    return 1.06 + (1 - 1.06) * (1 - (1 - u) ** 2);
  }

  function armCheckPop(mark) {
    if (mark.dataset.armed === '1') return;
    mark.dataset.armed = '1';
    const path = mark.querySelector('path');
    if (path) {
      path.style.strokeDasharray = String(PROMO_CHECK_PATH);
      path.style.strokeDashoffset = String(PROMO_CHECK_PATH);
    }
  }

  function settleCheckPop(mark) {
    const path = mark.querySelector('path');
    if (path) path.style.strokeDashoffset = '0';
    mark.style.opacity = '1';
    mark.style.transform = 'translate(-50%, -50%) scale(1)';
  }

  function paintCheckPop(mark, age) {
    if (prefersReducedMotion()) {
      settleCheckPop(mark);
      mark.dataset.settled = '1';
      return;
    }
    armCheckPop(mark);
    const path = mark.querySelector('path');
    const draw = Math.min(1, Math.max(0, age) / PROMO_CHECK_DRAW_MS);
    if (path) path.style.strokeDashoffset = (PROMO_CHECK_PATH * (1 - draw)).toFixed(2);
    mark.style.opacity = '1';
    const pop = Math.min(1, Math.max(0, age) / PROMO_CHECK_POP_MS);
    mark.style.transform = `translate(-50%, -50%) scale(${checkPopScale(pop).toFixed(3)})`;
    if (age >= PROMO_CHECK_SETTLE_MS) {
      settleCheckPop(mark);
      mark.dataset.settled = '1';
    }
  }

  function paintGlideStamp(veil, mark, age, veilStrength) {
    const check = mark?.querySelector('svg');
    const settleAt = check ? PROMO_CHECK_SETTLE_MS : 260;
    if (mark?.dataset.settled === '1' && age >= settleAt) return;
    const veilIn = Math.min(1, Math.max(0, age) / PROMO_GLIDE.bloomMs);
    const flash = veilIn < 1 ? Math.sin(veilIn * Math.PI) * 0.08 : 0;
    if (veil) veil.style.opacity = Math.min(1, veilStrength * veilIn + flash).toFixed(3);
    if (!mark) return;
    if (check) {
      paintCheckPop(mark, age);
      return;
    }
    // a stamp: it lands from above (1.32x) and settles with a small give
    const pop = Math.min(1, Math.max(0, age) / 340);
    const back = 1 + 2.2 * (pop - 1) ** 3 + 1.2 * (pop - 1) ** 2;   // ease-out-back, 0 -> 1
    mark.style.opacity = Math.min(1, pop * 3).toFixed(3);
    mark.style.transform = `translate(-50%, -50%) scale(${(1.32 - 0.32 * back).toFixed(3)})`;
    if (age >= 340) mark.dataset.settled = '1';
  }

  function paintPainPoof(poof, seedA, seedB, age) {
    const dustLife = PROMO_GLIDE.poofMs + PROMO_GLIDE.dustMs;
    const cardU = Math.min(1, Math.max(0, age) / PROMO_GLIDE.poofMs);
    const dustU = Math.min(1, Math.max(0, age) / dustLife);
    const fade = cardU >= 1 ? 0 : (1 - cardU * cardU);
    if (!poof) return fade;
    if (!poof._parts) {
      poof._parts = {
        smokes: [...poof.querySelectorAll('.promo-glide__smoke')],
        ashes: [...poof.querySelectorAll('.promo-glide__ash')],
      };
    }
    writePaint(poof, 'opacity', '1');
    poof._parts.smokes.forEach((smoke, index) => {
      const seed = wallSeededUnit(seedA * 17 + seedB, 31 + index);
      const speck = wallSeededUnit(seedB * 13 + index, 47 + seedA);
      const puff = 1 - (1 - Math.min(1, dustU * 2.1)) ** 2;
      const life = dustU < 0.06 ? dustU / 0.06 : Math.max(0, 1 - (dustU - 0.06) / 0.78);
      const angle = seed * Math.PI * 2;
      const reach = (80 + speck * 460) * puff;
      const x = Math.cos(angle) * reach;
      const y = Math.sin(angle) * reach * 0.72 - puff * 70;
      const scale = 0.7 + puff * (6.5 + seed * 3.4);
      smoke.style.opacity = (life * 0.92).toFixed(3);
      smoke.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${scale.toFixed(3)})`;
    });
    poof._parts.ashes.forEach((ash, index) => {
      const seed = wallSeededUnit(seedA + index * 3, 61 + seedB);
      const speck = wallSeededUnit(index + seedB, 73 + seedA);
      const seedC = wallSeededUnit(index * 9 + seedA, 89 + seedB);
      const fly = 1 - (1 - Math.min(1, dustU * 1.35)) ** 3;
      const angle = seed * Math.PI * 2 + (seedC - 0.5) * 0.9;
      const reach = (64 + speck * speck * 860) * fly;
      const x = (seedC - 0.5) * 48 + Math.cos(angle) * reach;
      const y = (seed - 0.5) * 28 + Math.sin(angle) * reach * 0.82 - fly * 54;
      const left = dustU < 0.05 ? dustU / 0.05 : Math.max(0, 1 - (dustU - 0.05) / 0.82);
      ash.style.opacity = (left * (0.8 + speck * 0.2)).toFixed(3);
      ash.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
    return fade;
  }

  function glideCoverage(timeMs, frame) {
    const span = glideSpan(timeMs, frame);
    const pitch = glidePitch();
    return [-1, 0, 1].every((sx) => [-1, 0, 1].every((sy) => {
      const local = glideUnproject(sx * frame.width / 2, sy * frame.height / 2);
      const x = (local.x + span.cam.x) / span.unit;
      const y = (local.y + span.cam.y) / span.unit;
      const row = Math.floor(y / pitch);
      const line = glideRows.get(row) || glideEnsureRow(row, x - 30, x + 30);
      return x >= line.left && x <= line.right;
    }));
  }

  function glideNearWidth(frame) {
    const unit = glideUnit(frame);
    const local = glideUnproject(0, frame.height * 0.46);
    return glideSpec('desktop').w * unit * glideProject(local.x, local.y).scale;
  }
  const PROMO_CLIP_DEVICES = ['desktop', 'phone', 'tablet'];
  const PROMO_STORE_LOOKS = ['classic', 'home-hero', 'collection-dense', 'lookbook', 'list'];
  const PROMO_PAIN_ACTS = ['search-empty', 'filter-hop', 'variant-doubt', 'cart-abandon', 'back-bounce'];
  const PROMO_CLIP_MOTIONS = {
    desktop: ['scroll-up', 'scroll-down', 'wander-near', 'wander-far', 'product-read', 'product-scroll', 'compare', ...PROMO_PAIN_ACTS],
    phone: ['scroll-up', 'scroll-down', 'product-read', 'product-scroll', 'compare', ...PROMO_PAIN_ACTS],
    tablet: ['scroll-up', 'scroll-down', 'product-read', 'product-scroll', 'compare', ...PROMO_PAIN_ACTS],
  };
  const PROMO_CLIP_MOTION_ALL = ['scroll-up', 'scroll-down', 'wander-near', 'wander-far', 'product-read', 'product-scroll', 'compare', ...PROMO_PAIN_ACTS];
  const PROMO_PITCH_MOMENTS = [
    'moment-catalog-a',
    'moment-catalog-b',
    'moment-product-a',
    'moment-product-b',
    'moment-compare-a',
    'moment-compare-b',
    'moment-bundle-a',
    'moment-bundle-b',
    'moment-search-a',
    'moment-search-b',
    'moment-variant-a',
    'moment-variant-b',
    'moment-cart-a',
    'moment-cart-b',
    'moment-upsell-a',
    'moment-upsell-b',
  ];
  const PROMO_MOMENT_CLIP_POSE = {
    catalog: 'grid',
    product: 'close',
    compare: 'choice',
    bundle: 'bundle',
    search: 'grid',
    variant: 'close',
    cart: 'bundle',
    upsell: 'choice',
  };
  const PROMO_MOMENT_WIDGET = {
    'moment-catalog-a': { action: 'idle_neutral' },
    'moment-catalog-b': { action: 'waving' },
    'moment-product-a': { action: 'exaggerated_talking' },
    'moment-product-b': { action: 'nod', event: 'product' },
    'moment-compare-a': { action: 'thinking' },
    'moment-compare-b': { action: 'salute' },
    'moment-bundle-a': { action: 'thumbsup', event: 'cart' },
    'moment-bundle-b': { action: 'exaggerated_talking' },
    'moment-search-a': { action: 'thinking', event: 'products' },
    'moment-search-b': { action: 'bow' },
    'moment-variant-a': { action: 'nod', event: 'policies' },
    'moment-variant-b': { action: 'idle_neutral' },
    'moment-cart-a': { action: 'thumbsup', event: 'cart' },
    'moment-cart-b': { action: 'exaggerated_talking' },
    'moment-upsell-a': { action: 'waving' },
    'moment-upsell-b': { action: 'thinking' },
  };
  const PROMO_MOMENT_TAKE_HEROES = {
    b: { go: 'cone', pick: 'cylinder', other: 'dome', extra: 'slab' },
  };
  const PROMO_CURSOR_HOT_X = 33 * (5 / 24);
  const PROMO_CURSOR_HOT_Y = 33 * (3.2 / 24);
  const PROMO_PAIN_LINE_1 = 'Looking for something light I can take everywhere.';
  const PROMO_PAIN_LINE_2 = "Is this a good gift for a friend?";
  const PROMO_PITCH_LINE_1 = 'A gift for a friend, under $50';   // fits the widget input whole (v8 clipped its start)
  const PROMO_PITCH_LINE_2 = "What if she doesn't like it?";
  // The clerk's lines. Short, spoken to the shopper, never to the viewer.
  const PROMO_PITCH_CLERK_1 = 'Here are the three that fit. Let me compare them for you.';
  const PROMO_PITCH_CLERK_COMPARE = "This one's the lightest, and it packs flat. It's the one.";
  const PROMO_PITCH_CLERK_2 = 'Yes. It fits a full weekend, and still packs flat.';
  const PROMO_PITCH_CLERK_UPSELL = 'Great pick. Pair it with this sleeve: made for it, and it keeps it safe on the road.';
  const PROMO_PITCH_SPEAK_1_MS = 3000;
  const PROMO_PITCH_SPEAK_COMPARE_MS = 3600;
  const PROMO_PITCH_SPEAK_2_MS = 3200;
  const PROMO_PITCH_SPEAK_UPSELL_MS = 4400;
  // One full turn of the widget's activity laser (--bizmis-laser-spin-duration).
  const PROMO_LASER_LAP_MS = 1400;
  const PROMO_LASER_FAST_MS = 550;
  const PROMO_CAM_ZOOM = 1.7;
  const PROMO_CAM_MS = 1100;
  const PROMO_CHAPTER_CHAR_MS = 16;
  const PROMO_PAIN_ANSWER_1 = 'Thanks for reaching out! You can browse our full collection using the menu above. To narrow your search, use the filters for size, weight and category. Product details, specifications and customer reviews are available on each product page. Let me know if there\'s anything else I can help you with.';
  const PROMO_PAIN_LINKS = ['View collection', 'Size guide', 'Shipping info'];
  const PROMO_PAIN_ANSWER_2 = "Thanks for your message! This product is part of our bestselling collection and makes a great gift for many occasions. Full details, including materials, dimensions and care instructions, can be found in the product description. Gift cards are also available in our online store. Please note that delivery times may vary depending on your location and the shipping method selected at checkout. For information about exchanges and refunds, please refer to our Returns Policy page. For order status updates, use the Track order link below. Our support team usually replies within 2–3 business days. Is there anything else I can help you with today?";   // v9: a real wall (it read as a normal reply)
  const PROMO_PAIN_ACTIONS = ['Gift cards', 'Contact us'];
  const PROMO_PAIN_CHIPS = ['Track order', 'Returns', 'Contact us'];
  const PROMO_THUMB_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 10.5v9H4.8a.8.8 0 0 1-.8-.8v-7.4a.8.8 0 0 1 .8-.8h2.7zm0 0 3.6-6.2c.4-.7 1.3-1 2-.6.6.3.9 1 .8 1.7l-.6 3.6h5.1a1.6 1.6 0 0 1 1.6 1.9l-1.2 6.6a2 2 0 0 1-2 1.7H7.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  const PROMO_PAIN_MARK = '<svg viewBox="-0.9 0.55 24 24" aria-hidden="true"><path fill="currentColor" d="M5.4 3.4h11.4a3.8 3.8 0 0 1 3.8 3.8v7.1a3.8 3.8 0 0 1-3.8 3.8h-4.7L8 21.7v-3.6H5.4a3.8 3.8 0 0 1-3.8-3.8V7.2a3.8 3.8 0 0 1 3.8-3.8z"/><circle cx="8.7" cy="10.8" r="1.45" fill="var(--bot-user)"/><circle cx="14.1" cy="10.8" r="1.45" fill="var(--bot-user)"/></svg>';
  const PROMO_PAIN_SEND = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>';
  const PROMO_PAIN_THUMB_UP = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const PROMO_PAIN_THUMB_DOWN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function appendDullUser(log, text) {
    const line = document.createElement('p');
    line.className = 'promo-pain__msg is-user';
    line.textContent = text;
    log.appendChild(line);
  }

  function appendDullBot(log, lines, links, actions) {
    const block = document.createElement('div');
    block.className = 'promo-pain__msg is-bot';
    const bubble = document.createElement('div');
    bubble.className = 'promo-pain__bubble';
    const copy = Array.isArray(lines) ? lines : [lines];
    copy.forEach((text) => {
      const line = document.createElement('p');
      line.textContent = text;
      bubble.appendChild(line);
    });
    if (links?.length) {
      const list = document.createElement('div');
      list.className = 'promo-pain__links';
      links.forEach((label) => {
        const link = document.createElement('span');
        link.textContent = label;
        list.appendChild(link);
      });
      bubble.appendChild(list);
    }
    if (actions?.length) {
      const row = document.createElement('div');
      row.className = 'promo-pain__actions';
      actions.forEach((label, index) => {
        const button = document.createElement('span');
        if (index === 0) button.className = 'is-primary';
        button.textContent = label;
        row.appendChild(button);
      });
      bubble.appendChild(row);
    }
    block.appendChild(bubble);
    log.appendChild(block);
  }

  function dullThumb(which) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'promo-pain__vote';
    button.setAttribute('data-promo-thumb', which);
    button.setAttribute('aria-hidden', 'true');
    button.tabIndex = -1;
    button.innerHTML = which === 'down' ? PROMO_PAIN_THUMB_DOWN : PROMO_PAIN_THUMB_UP;
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const row = button.parentElement;
      row?.querySelectorAll('.promo-pain__vote').forEach((node) => node.classList.remove('is-down'));
      if (which === 'down') button.classList.add('is-down');
    });
    return button;
  }

  function appendDullThink(log) {
    const dots = document.createElement('p');
    dots.className = 'promo-pain__typing';
    dots.innerHTML = '<i></i><i></i><i></i>';
    log.appendChild(dots);
  }

  function appendDullCloser(log) {
    log.querySelector('.promo-pain__helpful')?.remove();
    const helpful = document.createElement('div');
    helpful.className = 'promo-pain__helpful';
    const label = document.createElement('span');
    label.textContent = 'Was I helpful?';
    const votes = document.createElement('span');
    votes.className = 'promo-pain__votes';
    votes.append(dullThumb('up'), dullThumb('down'));
    helpful.append(label, votes);
    log.appendChild(helpful);
  }

  function scrollDullLog(log) {
    log.scrollTop = log.scrollHeight;
  }
  // The pain opens straight on the catalog and moves fast: the viewer only
  // needs the shape of each moment, and the narrator sets the pace.
  // Desktop: a store with no help at all. The shopper bounces between
  // look-alikes, finds nothing to ask, and drifts out of the window.
  const PROMO_PAIN_A = [
    ['grid', 60],
    ['enter', 80],
    ['open', 600],
    ['back', 60],
    ['hover-b', 260],
  ];
  const PROMO_PAIN_A2 = [
    ['open-2', 560],
    ['back-2', 60],
    ['scroll-2', 420],
    ['leave', 500],
  ];
  const PROMO_PAIN_THINK_MS = 550;
  const PROMO_PAIN_FAST_CHAR_MS = 22;
  const PROMO_PAIN_FAST_LINE_MS = 700;
  const PROMO_PAIN_B = [
    ['launcher', 80],
    ['panel', 140],
    ['typed-1', 0],
    ['think-1', PROMO_PAIN_THINK_MS],
    ['answer-1', 1300],
  ];
  const PROMO_PITCH_SETTLE_MS = 700;
  const PROMO_MOMENTS_VO_MS = 280;
  const PROMO_MOMENTS_SALESPERSON_VO_MS = 1200;
  const PROMO_MOMENTS_CATALOG_MS = 3200;
  const PROMO_MOMENTS_CATALOG_LOOK_MS = 2000;
  const PROMO_MOMENTS_CHOICE_MS = 4200;
  const PROMO_MOMENTS_DOUBT_MS = 6200;
  const PROMO_MOMENTS_EXTRA_MS = 5400;
  const PROMO_MOMENTS_SALESPERSON_MS = 800;
  const PROMO_MOMENTS_HOLD_MS = 700;
  const PROMO_MOMENTS_VAPOR_MS = 720;
  const PROMO_MOMENTS_CART_GAP_MS = 900;
  const PROMO_MOMENTS_ACCESSORY_MS = 350;
  const PROMO_MOMENTS_COLLAPSE_MS = 560;
  const PROMO_MOMENT_RING_GAP_MS = 300;
  const PROMO_MOMENT_SEEK_AT_MS = 600;
  const PROMO_MOMENT_SEEK_MS = 680;
  const PROMO_MOMENT_OTHER_RING_MS = 600;
  const PROMO_MOMENTS_SHORTLIST_MS = 1680;
  const PROMO_MOMENTS_DOCK_MS = 820;
  const PROMO_MOMENTS_BUNDLE_CELEBRATE_MS = 120;
  const PROMO_MOMENTS_FLY_MS = 780;
  const PROMO_MOMENTS_ORBIT_MS = 14000;
  const PROMO_MOMENTS_BADGE_TICK_MS = 280;
  const PROMO_MOMENTS_LABEL_RATIO = 0.4;
  const PROMO_MOMENTS_PAYOFF_RATIO = 0.6;
  const PROMO_MOMENTS_CLOSE_AT = 0.3;
  const PROMO_MOMENTS_BUNDLE_AT = 0.44;
  const PROMO_MOMENTS_TAIL_MS = 600;
  const PROMO_SEE_HOLD_MS = 2400;
  const PROMO_SEE_ROW_AT_MS = 3120;
  const PROMO_CLERK_ROW_MS = 1200;
  const PROMO_SEE_LAND_HOLD_MS = 1200;
  const PROMO_SEE_CTA_HOLD_MS = 4000;
  const PROMO_SEE_CURSOR_MS = 800;
  const PROMO_SEE_GLIDE_MS = 9800;
  const PROMO_SEE_WAVE_MS = 1280;
  const PROMO_SEE_STAIN_MS = 920;
  const PROMO_SEE_STAIN_COUNT = 9;
  const PROMO_SEE_STAIN_BODY_COUNT = 5;
  const PROMO_WHEEL_YAW_DEG = 42;
  const PROMO_WHEEL_MAX_YAW_DEG = 56;
  const PROMO_WHEEL_DEPTH_PX = 140;
  const PROMO_WHEEL_MAX_DEPTH_PX = 220;
  const PROMO_WHEEL_TUCK_PX = 28;
  const PROMO_WHEEL_NEIGHBOR_SCALE = 0.42;
  const PROMO_WHEEL_NEIGHBOR_PULL = 0.44;
  const PROMO_WHEEL_FAR_SCALE = 0.72;
  const PROMO_WHEEL_SELECT_AT = 0.5;
  const PROMO_WHEEL_SELECT_SPAN = 0.2;
  const PROMO_SEE_REDUCED_HOLD_MS = 1000;
  const PROMO_DEPART_MS = 1100;
  function readAdToken(name) {
    const root = document.querySelector('.promo-opening') || document.documentElement;
    const value = getComputedStyle(root).getPropertyValue(name).trim();
    if (value) return value;
    return getComputedStyle(document.documentElement).getPropertyValue('--bizmis-orange').trim();
  }

  const BIZMIS_ORANGE = readAdToken('--bizmis-primary');
  const PROMO_BIZMIS_MESH_COLORS = {
    UPPERBODY_Top: BIZMIS_ORANGE,
    HEAD_Hat: BIZMIS_ORANGE,
  };
  const PROMO_BIZMIS_STAMP_SCALE = 0.9;
  const PROMO_BIZMIS_STAMP_OFFSET_X = 0;   // the v2 wordmark has symmetric padding (-0.022 compensated the old mark+wordmark)
  const PROMO_BIZMIS_AVATAR_MODEL_URL = 'https://cdn.bizmis.ai/common/avatars/models/yusuke.glb';
  const PROMO_WIDGET_REMOUNT_MS = 280;
  const PROMO_WIDGET_FADE_MS = 480;
  const PROMO_COVER_HOLD_MS = 600;
  const PROMO_COVER_FADE_MS = 500;
  const PROMO_REDUCED_NAV_MS = 400;
  let promoStoreUnlocked = promoVideo === 'true';
  const PROMO_TYPE_QUERY = 'I want a portable laptop with long battery life for coding.';
  const PROMO_TYPE_AFTER_MS = 8000;
  const PROMO_TYPE_CHAR_MS = 55;
  const PROMO_TYPE_FIND_MS = 15000;

  function createPromoWidgetBridge() {
    let originalInit = null;
    let originalDestroy = null;
    let storeConfig = null;
    let wrapped = false;
    let solidStampUrl = null;
    let stampReady = false;
    const stampWaiters = [];

    function isOpening() {
      const params = promoSearchParams();
      return params.get(PROMO_MARKETING_PARAM) === PROMO_MARKETING_AD
        || params.get(PROMO_VIDEO_PARAM) === 'opening';
    }

    function lookForPromo(config) {
      const next = applyPromoLighting(config);
      if (!isOpening()) return next;
      const stamp = solidStampUrl
        || document.documentElement.getAttribute('data-promo-bizmis-stamp');
      return Object.assign({}, next, {
        avatarModelUrl: PROMO_BIZMIS_AVATAR_MODEL_URL,
        avatarMeshColors: Object.assign({}, next.avatarMeshColors || {}, PROMO_BIZMIS_MESH_COLORS),
        shirtStampUrl: stamp || next.shirtStampUrl,
        shirtStampScale: PROMO_BIZMIS_STAMP_SCALE,
        shirtStampOffsetX: PROMO_BIZMIS_STAMP_OFFSET_X,
        canvasWidth: PROMO_AVATAR_CANVAS_WIDTH_PX,
        themeColor: BIZMIS_ORANGE,
        secondaryColor: BIZMIS_ORANGE,
      });
    }

    function parseLightingQuery(raw) {
      if (raw == null || raw === '') return null;
      if (raw === 'default' || raw === 'studio') return raw;
      if (raw.charAt(0) === '{') {
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      }
      return null;
    }

    function applyPromoLighting(config) {
      const fromQuery = parseLightingQuery(promoSearchParams().get('lighting'));
      if (fromQuery != null) {
        return Object.assign({}, config, { lighting: fromQuery });
      }
      if (config && config.lighting != null) return config;
      const mode = promoSearchParams().get(PROMO_VIDEO_PARAM);
      if (isOpening() || promoVideo === 'opening' || mode === 'opening' || mode === 'true') {
        return Object.assign({}, config, { lighting: 'studio' });
      }
      return config;
    }

    const whiteStamps = new Map();

    function hardenStamp(url, isGate) {
      if (!url) {
        if (isGate) {
          stampReady = true;
          stampWaiters.splice(0).forEach((run) => run());
        }
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const px = image.data;
        for (let i = 0; i < px.length; i += 4) {
          if (!px[i + 3]) continue;
          px[i] = 255;
          px[i + 1] = 255;
          px[i + 2] = 255;
          px[i + 3] = 255;
        }
        ctx.putImageData(image, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        whiteStamps.set(url, dataUrl);
        if (isGate) {
          solidStampUrl = dataUrl;
          stampReady = true;
          stampWaiters.splice(0).forEach((run) => run());
        }
      };
      img.onerror = () => {
        whiteStamps.set(url, url);
        if (isGate) {
          solidStampUrl = url;
          stampReady = true;
          stampWaiters.splice(0).forEach((run) => run());
        }
      };
      img.src = url;
    }

    function whiteStampFor(url) {
      return whiteStamps.get(url) || url;
    }

    function preloadStoreStamps(stores) {
      const seen = new Set();
      (stores || []).forEach((store) => {
        if (!store || !store.stamp || seen.has(store.stamp)) return;
        seen.add(store.stamp);
        hardenStamp(store.stamp, false);
      });
    }

    function applyStoreLook(look) {
      const api = window.AvatarVoicechat;
      if (!look || !api || typeof api.setAppearance !== 'function') return;
      const scale = typeof look.stampScale === 'number'
        ? look.stampScale
        : PROMO_BIZMIS_STAMP_SCALE;
      api.setAppearance({
        avatarModelUrl: look.model || null,
        avatarMeshColors: look.meshColors || {},
        shirtStampUrl: look.stamp ? (whiteStampFor(look.stamp) || null) : null,
        shirtStampScale: scale,
        shirtStampOffsetX: typeof look.stampOffsetX === 'number' ? look.stampOffsetX : 0,
        shirtStampOffsetY: typeof look.stampOffsetY === 'number' ? look.stampOffsetY : 0,
      });
    }

    if (promoVideo === 'opening') {
      hardenStamp(document.documentElement.getAttribute('data-promo-bizmis-stamp'), true);
    } else {
      stampReady = true;
    }

    function wrap() {
      const api = window.AvatarVoicechat;
      if (!api || wrapped || typeof api.init !== 'function') return false;
      originalInit = api.init.bind(api);
      originalDestroy = typeof api.destroy === 'function' ? api.destroy.bind(api) : null;
      api.init = function (config) {
        storeConfig = config;
        const start = () => originalInit(lookForPromo(config));
        if (!isOpening() || stampReady) return start();
        stampWaiters.push(start);
      };
      wrapped = true;
      return true;
    }

    function hide() {
      document.documentElement.classList.add('is-promo-widget-hidden');
      document.documentElement.classList.remove('is-promo-widget-entering');
    }

    function show() {
      document.documentElement.classList.add('is-promo-widget-entering');
      document.documentElement.classList.remove('is-promo-widget-hidden');
      window.setTimeout(() => {
        document.documentElement.classList.remove('is-promo-widget-entering');
      }, PROMO_WIDGET_FADE_MS);
    }

    function remountForStore() {
      hide();
      if (!originalInit || !storeConfig) {
        window.setTimeout(show, PROMO_WIDGET_REMOUNT_MS);
        return;
      }
      if (originalDestroy) originalDestroy('bizmis-avatar-embed');
      window.setTimeout(() => {
        originalInit(applyPromoLighting(storeConfig));
        show();
      }, PROMO_WIDGET_REMOUNT_MS);
    }

    function arm() {
      if (wrap()) return;
      let tries = 0;
      const tick = () => {
        if (wrap() || tries > 80) return;
        tries += 1;
        window.setTimeout(tick, 80);
      };
      tick();
    }

    return { arm, hide, remountForStore, applyStoreLook, preloadStoreStamps };
  }

  let openingWaveStarted = false;
  let openingWavePlayed = false;

  function setOpeningAvatarAction(name) {
    window.dispatchEvent(new CustomEvent('avatar-animation', {
      detail: {
        name,
        lifecycle: { times: 1, when: null, duration_in_ms: null },
        toolCallId: `promo-${name}-${Date.now()}`,
      },
    }));
  }

  function waveOpeningAvatar() {
    if (openingWavePlayed) return true;
    const embed = document.getElementById('bizmis-avatar-embed');
    if (!embed) return false;
    const target = embed.querySelector('.bizmis-desktop-lite-chat [role="button"]')
      || embed.querySelector('.bizmis-desktop-lite-chat')
      || embed.querySelector('canvas');
    if (!target) return false;
    openingWavePlayed = true;
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  }

  function armOpeningWave() {
    if (openingWaveStarted) return;
    openingWaveStarted = true;
    let tries = 0;
    const run = () => {
      if (waveOpeningAvatar()) return;
      tries += 1;
      if (tries < 50) window.setTimeout(run, 100);
    };
    run();
  }

  window.addEventListener('avatar-animation', (event) => {
    const detail = event.detail;
    if (!detail || detail.name !== 'waving') return;
    if (String(detail.toolCallId || '').startsWith('promo-')) return;
    event.stopImmediatePropagation();
  }, true);

  function momentsEnabled() {
    return promoSearchParams().get('moments') !== '0';
  }

  // Opacity stepped per frame (a CSS transition started in the same tick as the
  // element's creation is not sampled by the export clock: it read as a hard cut).
  function fadeStep(node, from, to, ms, ease = (u) => u * u * (3 - 2 * u)) {
    return new Promise((resolve) => {
      if (!node) { resolve(); return; }
      node.style.transition = 'none';
      node.style.opacity = String(from);
      const t0 = performance.now();
      const step = (now) => {
        const u = Math.min(1, (now - t0) / Math.max(1, ms));
        node.style.opacity = (from + (to - from) * ease(u)).toFixed(4);
        if (u < 1) window.requestAnimationFrame(step); else resolve();
      };
      window.requestAnimationFrame(step);
    });
  }

  function promoEaseInOut(u) { return u < 0.5 ? 4 * u * u * u : 1 - ((-2 * u + 2) ** 3) / 2; }
  function promoEaseOut(u) { return 1 - (1 - u) ** 3; }

  // Any per-frame tween (export-safe): fn(eased, raw) on every frame, the
  // first one synchronously so nothing pops for a frame before it starts.
  function tweenStep(ms, fn, ease = promoEaseInOut) {
    return new Promise((resolve) => {
      const t0 = performance.now();
      const step = (now) => {
        const u = Math.min(1, Math.max(0, (now - t0) / Math.max(1, ms)));
        fn(ease(u), u);
        if (u < 1) window.requestAnimationFrame(step); else resolve();
      };
      step(t0);
    });
  }

  // v24 reel light law: where time t (ms) sits in one card window [a, b]. edge: 0 at both cuts, 1 past edgeMs
  // (sin^2, its half-width min(len / 2, edgeMs): a 0.12 s strobe window is one pure sin^2 bell, a 3 s hero a long
  // bright plateau); bell = edge with a gentle peak at the window's centre (the light). go: the motion's progress
  // 0..1 across the window, its speed (floor + 1 - edge) / norm: fastest at the cuts, near-still mid-card.
  function promoReelPhase(t, a, b, edgeMs, floor) {
    const len = Math.max(1, b - a);
    const x = Math.min(len, Math.max(0, t - a));
    const u = x / len;
    const h = Math.min(len / 2, edgeMs);
    const d = Math.min(x, len - x);
    const edge = d >= h ? 1 : Math.sin((Math.PI / 2) * (d / h)) ** 2;
    const g = (s) => s / 2 + (h / (2 * Math.PI)) * Math.sin((Math.PI * s) / h);   // the integral of cos^2 over one edge
    // the floor (never frozen) dips to half at the centre, so the stillest moment is exactly mid-card
    const f = (s) => floor * (s - (0.5 * len / Math.PI) * (1 - Math.cos((Math.PI * s) / len)));
    const norm = f(len) + h;
    const go = (f(x) + (x <= h ? g(x) : (x < len - h ? h / 2 : h - g(len - x)))) / norm;
    return { u, x, len, h, edge, bell: edge * (0.86 + 0.14 * Math.sin(Math.PI * u)), go, speed: (floor * (1 - 0.5 * Math.sin(Math.PI * u)) + 1 - edge) / norm };
  }

  // One device look for the whole film: thin frosted-glass frames (translucent
  // white rim, hairline edge, inner highlight, soft shadow), never a dark
  // contour (operator). Sizes are the close-up's; cards scale down.
  // v10: one glass device family for the whole film, the same as the pitch's
  // own store window: a white glass panel with a fine light edge and a soft
  // shadow. Desktop = a browser window (three dots), tablet = a plain panel,
  // phone = a panel with a status bar (9:41, the island). No black bezels.
  const PROMO_DEVICE_SPEC = {
    phone: { aspect: 1080 / 2280, bar: 0.13, radius: 0.12 },
    tablet: { aspect: 1620 / 2160, bar: 0, radius: 0.04 },
    desktop: { aspect: 2880 / 1800, bar: 0.042, radius: 0.016 },
  };
  function promoDeviceSize(device, W, H) {
    const spec = PROMO_DEVICE_SPEC[device] || PROMO_DEVICE_SPEC.desktop;
    const heightFor = (w) => w / spec.aspect + spec.bar * w;
    const maxH = H * (device === 'desktop' ? 0.84 : 0.9);
    let w = device === 'desktop' ? W * 0.66 : maxH / heightFor(1);
    if (heightFor(w) > maxH) w = maxH / heightFor(1);
    return { w, h: heightFor(w) };
  }
  // v13 demo stores: the burst of skeleton stores (new ones, never a repeat)
  const PROMO_REEL_BURST_MS = 2300;
  const PROMO_REEL_BEAT_MS = 60000 / 112;   // the pitch score's tempo: every cut lands on its grid
  const PROMO_REEL_TUNNEL_BEATS = 7;   // v16: the narrator's "Any store. Any device. Any language." fills the tunnel, before any store speaks
  const PROMO_REEL_QUICK_VOICES = ['quick-es', 'quick-ja', 'quick-pt', 'quick-zh'];   // biggest markets, not origins; Chinese last
  // v14: after the quick stores, new stores strobe past faster and faster (beats), barely visible, into "Your store"
  // v14b: one continuous acceleration: every store is shorter than the one before (beats on the score's grid)
  const PROMO_REEL_PACE = { heroes: [6, 5.5, 5.25, 4] };   // v18: the film's story order (fashion, electronics, books, gaming), each shorter than the last
  // v18: one accelerating run after the heroes: the quick stores speak (a different line each), real stores flash
  // between them, and only at the very end a few skeletons blur into "Your store". [kind, index]
  // v23: each card's window is PROMO_REEL_CUTS_S[4 + n + 1] - PROMO_REEL_CUTS_S[4 + n] (one ladder, faster every card)
  const PROMO_REEL_RUN = [
    ['quick', 0], ['flash', 0], ['quick', 1], ['flash', 1], ['quick', 2], ['flash', 2], ['quick', 3],
    ['flash', 3], ['skeleton', 0],
    ['flash', 4], ['skeleton', 1], ['flash', 5], ['skeleton', 2],
    ['flash', 6], ['skeleton', 3], ['flash', 7], ['skeleton', 4], ['flash', 8],
  ];
  // v23: real store cards for the run (new demo-store videos or stills): { video | img, device, color, start? }.
  // They take the skeleton slots in order, then (if there are more) the run's last flashes, so the ladder and its
  // cut list never change. Non-hero items of the store-reel JSON beyond the quick stores join this list automatically.
  // v23: the new demo stores (public/promo/stores/reel/v23/manifest.json): 3.2 s home-page loops (never the catalog), the jpg is each one's poster
  const PROMO_REEL_STORES_V23 = {
    'fetch-and-fern': { device: 'desktop', color: '#1F7A6C', video: '/promo/stores/reel/v23/fetch-and-fern-desktop-home.mp4', img: '/promo/stores/reel/v23/fetch-and-fern-desktop-home.jpg' },
    'kettle-and-crow': { device: 'phone', color: '#C8932B', video: '/promo/stores/reel/v23/kettle-and-crow-phone-home.mp4', img: '/promo/stores/reel/v23/kettle-and-crow-phone-home.jpg' },
    'liora': { device: 'tablet', color: '#B86E78', video: '/promo/stores/reel/v23/liora-tablet-home.mp4', img: '/promo/stores/reel/v23/liora-tablet-home.jpg' },
    'ridgeline-supply': { device: 'desktop', color: '#E2662F', video: '/promo/stores/reel/v23/ridgeline-supply-desktop-home.mp4', img: '/promo/stores/reel/v23/ridgeline-supply-desktop-home.jpg' },
    'little-timber': { device: 'tablet', color: '#3C8DDB', video: '/promo/stores/reel/v23/little-timber-tablet-home.mp4', img: '/promo/stores/reel/v23/little-timber-tablet-home.jpg' },
    'leaf-and-loam': { device: 'phone', color: '#3F7A3D', video: '/promo/stores/reel/v23/leaf-and-loam-phone-home.mp4', img: '/promo/stores/reel/v23/leaf-and-loam-phone-home.jpg' },
    'copperleaf': { device: 'desktop', color: '#A9542D', video: '/promo/stores/reel/v23/copperleaf-desktop-home.mp4', img: '/promo/stores/reel/v23/copperleaf-desktop-home.jpg' },
    'northpeak': { device: 'phone', color: '#2747D6', video: '/promo/stores/reel/v23/northpeak-phone-home.mp4', img: '/promo/stores/reel/v23/northpeak-phone-home.jpg' },
    'halcyon-optics': { device: 'desktop', color: '#6B4BD1', video: '/promo/stores/reel/v23/halcyon-optics-desktop-home.mp4', img: '/promo/stores/reel/v23/halcyon-optics-desktop-home.jpg' },
    'nest-and-nook': { device: 'tablet', color: '#6E9E7F', video: '/promo/stores/reel/v23/nest-and-nook-tablet-home.mp4', img: '/promo/stores/reel/v23/nest-and-nook-tablet-home.jpg' },
    'outsole': { device: 'phone', color: '#E63946', video: '/promo/stores/reel/v23/outsole-phone-home.mp4', img: '/promo/stores/reel/v23/outsole-phone-home.jpg' },
    'inkwell': { device: 'tablet', color: '#1F3A6E', video: '/promo/stores/reel/v23/inkwell-tablet-home.mp4', img: '/promo/stores/reel/v23/inkwell-tablet-home.jpg' },
    'atelier-noor': { device: 'desktop', color: '#8A68A8', video: '/promo/stores/reel/v23/atelier-noor-desktop-home.mp4', img: '/promo/stores/reel/v23/atelier-noor-desktop-home.jpg' },
    'spokehaus': { device: 'phone', color: '#C6E03A', video: '/promo/stores/reel/v23/spokehaus-phone-home.mp4', img: '/promo/stores/reel/v23/spokehaus-phone-home.jpg' },
    'tonewood': { device: 'tablet', color: '#8E2A3A', video: '/promo/stores/reel/v23/tonewood-tablet-home.mp4', img: '/promo/stores/reel/v23/tonewood-tablet-home.jpg' },
    'saltline': { device: 'desktop', color: '#14A0B2', video: '/promo/stores/reel/v23/saltline-desktop-home.mp4', img: '/promo/stores/reel/v23/saltline-desktop-home.jpg' },
  };
  // v24: 22 unique demo stores, no brand twice in the reel, none of the 4 heroes' or the 4 quick stores' brands
  // (public/promo/stores/reel/v24/manifest.json): 3.2 s theme-style home-page loops (never the catalog), the jpg is each one's poster.
  // Colours follow a plan (tmp/demo-stores-v24/_plan/colour-plan.json): the tunnel in light, fresh tones; the run in saturated
  // jewel tones, pinks alternating with deep cools, landing on Your store orange (every neighbour >= 35 CIEDE2000 apart).
  const PROMO_REEL_STORES_V24 = {
    'halcyon-optics': { device: 'desktop', color: '#C8B6F0', video: '/promo/stores/reel/v24/halcyon-optics-desktop-home.mp4', img: '/promo/stores/reel/v24/halcyon-optics-desktop-home.jpg' },
    'kumo-tea': { device: 'phone', color: '#5BC76B', video: '/promo/stores/reel/v24/kumo-tea-phone-home.mp4', img: '/promo/stores/reel/v24/kumo-tea-phone-home.jpg' },
    'sora-ceramics': { device: 'tablet', color: '#B07A9A', video: '/promo/stores/reel/v24/sora-ceramics-tablet-home.mp4', img: '/promo/stores/reel/v24/sora-ceramics-tablet-home.jpg' },
    'powderline': { device: 'desktop', color: '#9ED8E8', video: '/promo/stores/reel/v24/powderline-desktop-home.mp4', img: '/promo/stores/reel/v24/powderline-desktop-home.jpg' },
    'tidewater': { device: 'phone', color: '#F2705A', video: '/promo/stores/reel/v24/tidewater-phone-home.mp4', img: '/promo/stores/reel/v24/tidewater-phone-home.jpg' },
    'maison-cacao': { device: 'desktop', color: '#2BBFA4', video: '/promo/stores/reel/v24/maison-cacao-desktop-home.mp4', img: '/promo/stores/reel/v24/maison-cacao-desktop-home.jpg' },
    'liora': { device: 'tablet', color: '#E597A8', video: '/promo/stores/reel/v24/liora-tablet-home.mp4', img: '/promo/stores/reel/v24/liora-tablet-home.jpg' },
    'grindline': { device: 'phone', color: '#1A7FC4', video: '/promo/stores/reel/v24/grindline-phone-home.mp4', img: '/promo/stores/reel/v24/grindline-phone-home.jpg' },
    'kettle-and-crow': { device: 'phone', color: '#B8306A', video: '/promo/stores/reel/v24/kettle-and-crow-phone-home.mp4', img: '/promo/stores/reel/v24/kettle-and-crow-phone-home.jpg' },
    'northpeak': { device: 'phone', color: '#2A4FD6', video: '/promo/stores/reel/v24/northpeak-phone-home.mp4', img: '/promo/stores/reel/v24/northpeak-phone-home.jpg' },
    'saltline': { device: 'desktop', color: '#10A7B8', video: '/promo/stores/reel/v24/saltline-desktop-home.mp4', img: '/promo/stores/reel/v24/saltline-desktop-home.jpg' },
    'ridgeline-supply': { device: 'desktop', color: '#0E6185', video: '/promo/stores/reel/v24/ridgeline-supply-desktop-home.mp4', img: '/promo/stores/reel/v24/ridgeline-supply-desktop-home.jpg' },
    'nest-and-nook': { device: 'tablet', color: '#86C2A2', video: '/promo/stores/reel/v24/nest-and-nook-tablet-home.mp4', img: '/promo/stores/reel/v24/nest-and-nook-tablet-home.jpg' },
    'atelier-noor': { device: 'desktop', color: '#A4408F', video: '/promo/stores/reel/v24/atelier-noor-desktop-home.mp4', img: '/promo/stores/reel/v24/atelier-noor-desktop-home.jpg' },
    'little-timber': { device: 'tablet', color: '#3A9FE6', video: '/promo/stores/reel/v24/little-timber-tablet-home.mp4', img: '/promo/stores/reel/v24/little-timber-tablet-home.jpg' },
    'inkwell': { device: 'tablet', color: '#22407C', video: '/promo/stores/reel/v24/inkwell-tablet-home.mp4', img: '/promo/stores/reel/v24/inkwell-tablet-home.jpg' },
    'leaf-and-loam': { device: 'tablet', color: '#139E6E', video: '/promo/stores/reel/v24/leaf-and-loam-tablet-home.mp4', img: '/promo/stores/reel/v24/leaf-and-loam-tablet-home.jpg' },
    'spokehaus': { device: 'phone', color: '#EE3F87', video: '/promo/stores/reel/v24/spokehaus-phone-home.mp4', img: '/promo/stores/reel/v24/spokehaus-phone-home.jpg' },
    'juniper-linen': { device: 'desktop', color: '#8E9FE8', video: '/promo/stores/reel/v24/juniper-linen-desktop-home.mp4', img: '/promo/stores/reel/v24/juniper-linen-desktop-home.jpg' },
    'tonewood': { device: 'tablet', color: '#5E2A63', video: '/promo/stores/reel/v24/tonewood-tablet-home.mp4', img: '/promo/stores/reel/v24/tonewood-tablet-home.jpg' },
    'fetch-and-fern': { device: 'desktop', color: '#138A86', video: '/promo/stores/reel/v24/fetch-and-fern-desktop-home.mp4', img: '/promo/stores/reel/v24/fetch-and-fern-desktop-home.jpg' },
    'petal-and-post': { device: 'phone', color: '#D63BC0', video: '/promo/stores/reel/v24/petal-and-post-phone-home.mp4', img: '/promo/stores/reel/v24/petal-and-post-phone-home.jpg' },
  };
  // the run's cards: 0..4 take the skeleton slots in order, 5..13 take all nine flash slots in order, so the run plays
  // (flash, skeleton): kettle-and-crow, northpeak, saltline, ridgeline-supply, nest-and-nook, atelier-noor, little-timber, inkwell,
  // leaf-and-loam, spokehaus, juniper-linen, tonewood, fetch-and-fern, petal-and-post (between the four quick stores at the start)
  const PROMO_REEL_CARDS = ['nest-and-nook', 'little-timber', 'leaf-and-loam', 'juniper-linen', 'fetch-and-fern', 'kettle-and-crow', 'northpeak', 'saltline', 'ridgeline-supply', 'atelier-noor', 'inkwell', 'spokehaus', 'tonewood', 'petal-and-post'].map((slug) => ({ slug, ...PROMO_REEL_STORES_V24[slug] }));
  // the tunnel's flyers (they replace PROMO_REEL_SKELETONS 0..7; the skeleton colours stay as the fallback light)
  const PROMO_REEL_TUNNEL_CARDS = ['halcyon-optics', 'kumo-tea', 'sora-ceramics', 'powderline', 'tidewater', 'maison-cacao', 'liora', 'grindline'].map((slug) => ({ slug, ...PROMO_REEL_STORES_V24[slug] }));
  const PROMO_REEL_SOFT_S = 0.5;   // a run card shorter than this hits soft (the strobe's tick, no streak)
  const PROMO_REEL_QUICK_FADE_S = 0.12;   // a quick store's voice fades out this long at its cut
  const PROMO_REEL_FLASH = [   // v24: fallback stills only (PROMO_REEL_CARDS fill every flash slot): the same v24 store each slot shows, never a hero or quick store
    { img: '/promo/stores/reel/v24/kettle-and-crow-phone-home.jpg', device: 'phone', color: '#B8306A' },
    { img: '/promo/stores/reel/v24/northpeak-phone-home.jpg', device: 'phone', color: '#2A4FD6' },
    { img: '/promo/stores/reel/v24/saltline-desktop-home.jpg', device: 'desktop', color: '#10A7B8' },
    { img: '/promo/stores/reel/v24/ridgeline-supply-desktop-home.jpg', device: 'desktop', color: '#0E6185' },
    { img: '/promo/stores/reel/v24/atelier-noor-desktop-home.jpg', device: 'desktop', color: '#A4408F' },
    { img: '/promo/stores/reel/v24/inkwell-tablet-home.jpg', device: 'tablet', color: '#22407C' },
    { img: '/promo/stores/reel/v24/spokehaus-phone-home.jpg', device: 'phone', color: '#EE3F87' },
    { img: '/promo/stores/reel/v24/tonewood-tablet-home.jpg', device: 'tablet', color: '#5E2A63' },
    { img: '/promo/stores/reel/v24/petal-and-post-phone-home.jpg', device: 'phone', color: '#D63BC0' },
  ];
  const PROMO_REEL_STROBE = [{ device: 'desktop', color: '#5B8DEF', v: 0 }, { device: 'tablet', color: '#EF6F8E', v: 1 }, { device: 'phone', color: '#3DBE8B', v: 2 }, { device: 'desktop', color: '#F2A541', v: 0 }, { device: 'tablet', color: '#9B7BEA', v: 1 }, { device: 'phone', color: '#2BB3C9', v: 2 }, { device: 'desktop', color: '#E8644A', v: 0 }, { device: 'tablet', color: '#C9A227', v: 1 }, { device: 'phone', color: '#6C7A89', v: 2 }, { device: 'desktop', color: '#F07ACB', v: 0 }, { device: 'tablet', color: '#4FA3E0', v: 1 }, { device: 'phone', color: '#8BC34A', v: 2 }, { device: 'desktop', color: '#FF8A65', v: 0 }, { device: 'tablet', color: '#7E57C2', v: 1 }, { device: 'phone', color: '#26A69A', v: 2 }, { device: 'desktop', color: '#EC407A', v: 0 }, { device: 'tablet', color: '#FFCA28', v: 1 }, { device: 'phone', color: '#5C6BC0', v: 2 }, { device: 'desktop', color: '#66BB6A', v: 0 }, { device: 'tablet', color: '#AB47BC', v: 1 }, { device: 'phone', color: '#29B6F6', v: 2 }, { device: 'desktop', color: '#FFA726', v: 0 }];
  function promoBackOut(u) { const c1 = 1.5; const c3 = c1 + 1; return 1 + c3 * (u - 1) ** 3 + c1 * (u - 1) ** 2; }
  const PROMO_REEL_WHIP_HOLD_MS = 900;   // a quick store holds this long (shorter each time)
  const PROMO_REEL_SKELETONS = [   // v13b: soft, muted store colours (the tunnel must read calm, not trippy)
    { device: 'desktop', color: '#9DB4E8', v: 0 }, { device: 'phone', color: '#E8B4BE', v: 1 }, { device: 'tablet', color: '#A9D4BC', v: 2 },
    { device: 'desktop', color: '#EBC9A2', v: 1 }, { device: 'phone', color: '#C5B8E8', v: 0 }, { device: 'desktop', color: '#A8D3DA', v: 2 },
    { device: 'tablet', color: '#E6B8A8', v: 0 }, { device: 'phone', color: '#D9CC9A', v: 2 },
  ];
  function promoSkeletonStore(sk) {
    const tiles = sk.device === 'desktop' ? 8 : sk.device === 'tablet' ? 6 : 4;
    return `<div class="promo-skel is-v${sk.v}" style="--sk:${sk.color}"><i class="promo-skel__nav"><b></b><b></b><b></b></i><i class="promo-skel__hero"><b></b><b></b></i><span class="promo-skel__grid">${'<i><b></b></i>'.repeat(tiles)}</span></div>`;
  }
  // a store's page copy: its category in the store's colour, then what the
  // agent does -> what the merchant gets (the benefit never breaks inside).
  // Desktop: the title above the browser, the line centred under it. Phone
  // and tablet: the device on the right, a column on the left.
  function promoReelCopy(item, box, W, H, S) {
    const copy = document.createElement('div');
    const desk = item.device === 'desktop';
    copy.className = `promo-reel__copy is-${desk ? 'desk' : 'col'}${item.whip ? ' is-shown' : ''}`;
    copy.style.setProperty('--tint', item.color);
    copy.dataset.s = String(S);
    let k = 0;
    const letters = (text) => text.split(' ').map((word) => `<span class="promo-reel__w">${[...word].map((c) => `<span data-k="${k++}">${c}</span>`).join('')}</span>`).join(' ');
    const cat = item.category || '';
    const feat = item.feat || item.does || '';
    const ben = item.ben || '';
    if (desk) {
      copy.innerHTML = `<p class="promo-reel__t" style="top:${(28 * S).toFixed(1)}px">${letters(cat)}</p>`
        + `<p class="promo-reel__fb" style="top:${(box.y + box.h + 26 * S).toFixed(1)}px"><span class="promo-reel__f">${feat}</span>${ben ? `<span class="promo-reel__arrow">→</span><span class="promo-reel__b">${ben}</span>` : ''}</p>`;
    } else {
      const lines = cat.includes(' & ') ? [cat.split(' & ')[0], `& ${cat.split(' & ')[1]}`] : cat.split(' ');
      const left = 110 * S; const colW = box.x - box.w / 2 - left - 90 * S;
      copy.dataset.colw = String(colW);
      copy.dataset.maxh = String(box.h * 0.56);
      copy.innerHTML = `<div class="promo-reel__col" style="left:${left.toFixed(1)}px;top:${box.y.toFixed(1)}px;width:${colW.toFixed(1)}px;height:${box.h.toFixed(1)}px">`
        + `<p class="promo-reel__t">${lines.map(letters).join('<br>')}</p><p class="promo-reel__f">${feat}</p>${ben ? `<p class="promo-reel__b"><span class="promo-reel__arrow">→</span>${ben}</p>` : ''}</div>`;
    }
    return copy;
  }
  function fitReelCopy(copy, S) {
    const shrink = (node, start, fits, min) => {
      if (!node) return;
      let fs = start; node.style.fontSize = `${fs}px`;
      while (!fits(node) && fs > min) { fs -= Math.max(1, S); node.style.fontSize = `${fs}px`; }
    };
    const W = copy.parentElement?.parentElement?.clientWidth || 1920 * S;
    if (copy.classList.contains('is-desk')) {
      shrink(copy.querySelector('.promo-reel__t'), 150 * S, (n) => n.offsetWidth <= 1700 * S, 60 * S);
      const fb = copy.querySelector('.promo-reel__fb');
      shrink(fb, 34 * S, (n) => n.offsetWidth <= W * 0.92, 18 * S);
      return;
    }
    const colW = Number(copy.dataset.colw); const maxH = Number(copy.dataset.maxh);
    shrink(copy.querySelector('.promo-reel__t'), 230 * S, (n) => n.offsetWidth <= colW && n.offsetHeight <= maxH, 60 * S);
    shrink(copy.querySelector('.promo-reel__f'), 32 * S, (n) => n.offsetWidth <= colW, 18 * S);
    shrink(copy.querySelector('.promo-reel__b'), 40 * S, (n) => n.offsetWidth <= colW, 20 * S);
  }
  // the title writes in letter by letter, then the line (stepped: export-safe)
  function revealReelCopy(copy, mode) {
    if (!copy || copy.dataset.in === '1' || copy.classList.contains('is-shown')) return;
    copy.dataset.in = '1';
    if (mode === 'slam') {   // v13 (E3): the title slams in on the hit, the line follows
      const t = copy.querySelector('.promo-reel__t');
      const rest = copy.querySelector('.promo-reel__fb') ? [copy.querySelector('.promo-reel__fb')] : [...copy.querySelectorAll('.promo-reel__f, .promo-reel__b')];
      copy.classList.add('is-shown');
      t.querySelectorAll('span[data-k]').forEach((span) => { span.style.opacity = '1'; span.style.transform = 'none'; });
      rest.forEach((node) => { node.style.opacity = '0'; });
      tweenStep(420, (e, u) => {
        t.style.opacity = Math.min(1, u * 3.2).toFixed(3);
        t.style.scale = (1 + 0.2 * (1 - e)).toFixed(4);
        t.style.filter = u < 1 ? `blur(${((1 - e) * 9).toFixed(2)}px)` : '';
      }, promoEaseOut);
      rest.forEach((node, k) => window.setTimeout(() => tweenStep(380, (e) => {
        node.style.opacity = e.toFixed(3);
        node.style.translate = `${node.classList.contains('promo-reel__fb') ? '-50%' : '0'} ${((1 - e) * 0.4).toFixed(3)}em`;
      }, promoEaseOut), 160 + k * 110));
      return;
    }
    const chars = [...copy.querySelectorAll('.promo-reel__t span[data-k]')];
    const rest = copy.querySelector('.promo-reel__fb') ? [copy.querySelector('.promo-reel__fb')] : [...copy.querySelectorAll('.promo-reel__f, .promo-reel__b')];
    const total = 380 + chars.length * 22 + 700;
    copy.classList.add('is-revealing');
    tweenStep(total, (e, raw) => {
      const ms = raw * total;
      chars.forEach((span, k) => {
        const u = Math.min(1, Math.max(0, (ms - k * 22) / 460)); const v = 1 - (1 - u) ** 3;
        span.style.opacity = v.toFixed(3);
        span.style.transform = `translateY(${((1 - v) * 0.32).toFixed(3)}em)`;
      });
      rest.forEach((node, k) => {
        const u = Math.min(1, Math.max(0, (ms - 300 - chars.length * 14 - k * 180) / 520)); const v = 1 - (1 - u) ** 3;
        node.style.opacity = v.toFixed(3);
        node.style.translate = `${node.classList.contains('promo-reel__fb') ? '-50%' : '0'} ${((1 - v) * 0.5).toFixed(3)}em`;   // the desktop line keeps its centring
      });
    }, (u) => u).then(() => copy.classList.add('is-shown'));
  }
  // where the shopper's words sit on a store's page (screen space, the page in view)
  function reelSaidSpot(cell, W, H, S) {
    const box = cell.full;
    return (pill) => {
      if (cell.src.device === 'desktop') {
        Object.assign(pill.style, { left: '50%', right: 'auto', top: 'auto', bottom: `${(H - (box.y + box.h) + 44 * S).toFixed(1)}px`, translate: '-50% 0', maxWidth: `${(box.w * 0.8).toFixed(0)}px` });
      } else {
        const colW = box.x - box.w / 2 - 200 * S;
        Object.assign(pill.style, { left: `${(110 * S).toFixed(1)}px`, right: 'auto', top: 'auto', bottom: `${(H - (box.y + box.h)).toFixed(1)}px`, translate: 'none', maxWidth: `${colW.toFixed(0)}px` });
      }
    };
  }

  function promoDevice(device, size, inner) {
    const spec = PROMO_DEVICE_SPEC[device] || PROMO_DEVICE_SPEC.desktop;
    const dev = document.createElement('div');
    dev.className = `promo-dev is-${device}`;
    const u = size.w / 100;
    Object.assign(dev.style, { width: `${size.w}px`, height: `${size.h}px` });
    dev.style.setProperty('--u', `${u}px`);
    dev.style.setProperty('--bar', `${spec.bar * size.w}px`);
    dev.style.setProperty('--radius', `${spec.radius * size.w}px`);
    const bar = device === 'desktop'
      ? '<div class="promo-dev__bar"><i></i><i></i><i></i></div>'
      : device === 'phone' ? '<div class="promo-dev__status"><b>9:41</b><span class="promo-dev__island"></span><span class="promo-dev__icons"><i></i><i></i><i></i></span></div>' : '';
    dev.innerHTML = `<div class="promo-dev__body">${bar}<div class="promo-dev__screen" style="aspect-ratio:${spec.aspect}">${inner}</div></div>`;
    return dev;
  }

  // the film's own clock: seconds since its first frame (set when the pain take starts)
  function untilFilm(sec) {
    const t0 = window.__promoFilmT0;
    if (t0 == null) return Promise.resolve();
    promoSfx('anchor-call', { target: Number(sec.toFixed(3)), lateMs: Math.round(performance.now() - (t0 + sec * 1000)) });   // natural arrival vs the music anchor (for the music fit)
    return waitMs(Math.max(0, t0 + sec * 1000 - performance.now()));
  }

  function waitMs(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  function typeOver(text, write, charMs = PROMO_FILM_TYPE_CHAR_MS, minMs = PROMO_TYPE_LINE_MS) {
    promoSfx('typing', { ms: Math.max(minMs, text.length * charMs) });
    return new Promise((resolve) => {
      const started = performance.now();
      const tick = (now) => {
        const u = Math.min(1, (now - started) / Math.max(minMs, text.length * charMs));
        const count = u >= 1 ? text.length : Math.max(1, Math.round(text.length * u));
        write(text.slice(0, count));
        if (u < 1) window.requestAnimationFrame(tick);
        else resolve();
      };
      window.requestAnimationFrame(tick);
    });
  }

  let openingAgentEnded = false;

  function muteOpeningAgent() {
    const api = window.AvatarVoicechat;
    if (api && typeof api.muteAgent === 'function') {
      api.muteAgent();
      return;
    }
    window.dispatchEvent(new CustomEvent('bizmis:agent-audio-mute'));
  }

  function endOpeningAgent() {
    if (openingAgentEnded) return;
    openingAgentEnded = true;
    const api = window.AvatarVoicechat;
    if (api && typeof api.endSession === 'function') {
      api.endSession();
      return;
    }
    muteOpeningAgent();
    window.dispatchEvent(new CustomEvent('bizmis:agent-session-end'));
  }

  function widgetDraftInput() {
    const embed = document.getElementById('bizmis-avatar-embed');
    const input = embed?.querySelector('input[type="text"]:not([disabled])');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    if (!input || !setter) return null;
    return { input, setter };
  }

  let promoSaySwap = null;

  function installPromoSayRewrite() {
    if (window.__promoSayPatched) return;
    window.__promoSayPatched = true;
    const send = WebSocket.prototype.send;
    WebSocket.prototype.send = function (data) {
      if (promoSaySwap && typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (parsed && parsed.type === 'user_message' && typeof parsed.text === 'string') {
            parsed.text = promoSaySwap.to;
            promoSaySwap = null;
            data = JSON.stringify(parsed);
          }
        } catch (error) {
          /* binary or non-json frames stay as they are */
        }
      }
      return send.call(this, data);
    };
  }

  // Widget debug steering (init({ debug: true }) in AdFilm.tsx). Absent on
  // older widget builds, which fall back to rewriting the socket frame.
  function promoDebugWidget() {
    const api = window.AvatarVoicechat;
    return api && typeof api.sendHiddenMessage === 'function' ? api : null;
  }

  // The shopper's line goes out as typed and stays in the chat. The clerk's
  // scripted line goes right behind it as a hidden message the viewer never
  // sees. See docs/agent-steering.md.
  // Typed text set from code does not scroll its field the way a keyboard
  // does. Keep the end of the text, where the caret is, in view.
  function showInputEnd(input) {
    if (!input) return;
    if (typeof input.setSelectionRange === 'function') {
      const end = (input.value || '').length;
      try {
        input.setSelectionRange(end, end);
      } catch {
        /* inputs that refuse a selection still scroll below */
      }
    }
    input.scrollLeft = input.scrollWidth;
    input.scrollTop = input.scrollHeight;
  }

  function sayClerkLine(line) {
    const draft = widgetDraftInput();
    if (!draft) return false;
    const { input } = draft;
    const from = (input.value || '').trim();
    if (!from) return false;
    const form = input.form || input.closest('form');
    if (!form || typeof form.requestSubmit !== 'function') return false;
    const steer = `Say this: "${line}"`;
    const api = promoDebugWidget();
    if (!api || !api.sendHiddenMessage(steer, { afterNextUserMessage: true })) {
      installPromoSayRewrite();
      promoSaySwap = { from, to: steer };
    }
    form.requestSubmit();
    return true;
  }

  // The clerk's lines, recorded once from the live agent through the real
  // widget (scripts/capture-clerk-voice.mjs): public/promo/voice/<id>.wav
  // with the agent's own character timings in <id>.json.
  const promoVoiceCache = new Map();
  function clerkVoice(id) {
    if (!promoVoiceCache.has(id)) {
      promoVoiceCache.set(id, fetch(`/promo/voice/${id}.json`)
        .then((response) => (response.ok ? response.json() : null))
        .catch(() => null));
    }
    return promoVoiceCache.get(id);
  }
  ['clerk-results', 'clerk-compare', 'clerk-answer', 'clerk-upsell', 'shopper-upsell', 'clerk-upsell-done', 'store-1', 'store-2', 'store-3', 'store-4', 'store-5', 'store-6', 'store-7',
    'shopper-doubt', ...PROMO_VO.filter((cue) => cue.id.startsWith('t-')).map((cue) => cue.id)]
    .forEach((id) => clerkVoice(id));

  // The narrator's lines are generated (scripts/generate-film-voice.mjs) and
  // logged like the clerk's, so the exporter lays them under the frames. The
  // promise ends with the line, so a scene can wait for the narrator.
  // A whole take: plays at once; .done ends with it, and .at(phrase, 'start' |
  // 'end') resolves when that phrase is spoken, so picture beats land on the
  // words instead of the words being squeezed between beats.
  function speakTake(id) {
    let begin;
    const started = new Promise((resolve) => { begin = resolve; });
    const done = (async () => {
      markPromoVo(id);
      const voice = await clerkVoice(id);
      if (!voice) { begin(null); return; }
      const src = `/promo/voice/${id}.wav`;
      const now = performance.now();
      (window.__promoAudioCues = window.__promoAudioCues || []).push({ src, atMs: now, fromSec: 0, endMs: now + voice.durationMs });
      window.__promoNarratorUntil = now + voice.durationMs;
      if (!document.documentElement.classList.contains('is-promo-export')) new Audio(src).play().catch(() => { });
      begin({ voice, now });
      if (!prefersReducedMotion()) await waitMs(voice.durationMs);
    })();
    const at = async (phrase, edge = 'start', offsetMs = 0) => {
      const take = await started;
      if (!take || prefersReducedMotion()) return;
      const text = take.voice.chars.map((c) => c.char).join('');
      const i = text.indexOf(phrase);
      if (i < 0) return;
      const c = take.voice.chars[edge === 'end' ? i + phrase.length - 1 : i];
      const wait = take.now + c.startMs + (edge === 'end' ? c.durMs : 0) + offsetMs - performance.now();
      if (wait > 0) await waitMs(wait);
    };
    return { done, at };
  }
  function speakNarrator(id) {
    return speakTake(id).done;
  }

  // Word start times (ms) from the agent's character timings.
  function voiceWords(voice) {
    const words = [];
    let current = null;
    (voice?.chars || []).forEach((entry) => {
      if (/\s/.test(entry.char)) {
        current = null;
        return;
      }
      if (!current) {
        current = { text: '', startMs: entry.startMs };
        words.push(current);
      }
      current.text += entry.char;
    });
    return words;
  }

  function promoWidgetDebug(method, ...args) {
    const api = window.AvatarVoicechat;
    if (api && typeof api[method] === 'function') return api[method](...args);
    return false;
  }

  // The clerk speaks on its own, with no shopper message: only the hidden
  // steer goes out.
  function sayClerkAlone(line) {
    const api = promoDebugWidget();
    if (!api) return false;
    return api.sendHiddenMessage(`Say this: "${line}"`);
  }

  function hideSayThisBubbles() {
    const root = document.getElementById('bizmis-avatar-embed');
    if (!root || root.dataset.sayHidden === '1') return;
    root.dataset.sayHidden = '1';
    const hide = () => {
      root.querySelectorAll('div').forEach((node) => {
        if (node.children.length > 0) return;
        const text = (node.textContent || '').trim();
        if (!text.startsWith('Say this:')) return;
        node.style.setProperty('display', 'none', 'important');
        const parent = node.parentElement;
        if (!parent || parent.querySelector('canvas, input, .bizmis-chat-input-bar')) return;
        parent.style.setProperty('display', 'none', 'important');
      });
    };
    hide();
    const observer = new MutationObserver(hide);
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    root._promoSayObserver = observer;
  }

  function releaseSayThisBubbles() {
    const root = document.getElementById('bizmis-avatar-embed');
    if (!root) return;
    root._promoSayObserver?.disconnect();
    root._promoSayObserver = null;
    delete root.dataset.sayHidden;
  }

  function playClerkLine(line, speakMs, onStart) {
    sayClerkLine(line);
    onStart();
    return waitMs(speakMs);
  }

  function emitShopper(detail) {
    if (detail.kind === 'cart') promoSfx('cart');
    window.dispatchEvent(new CustomEvent('bizmis:shopper-event', { detail }));
  }

  function pitchEventLabel(detail) {
    if (detail.kind === 'search') return 'Searching the catalog…';
    if (detail.kind === 'compare') return 'Checking product details…';
    if (detail.kind === 'products') return 'Preparing product results…';
    if (detail.kind === 'product') return 'Opening the product…';
    if (detail.kind === 'policies') return 'Checking store policies…';
    if (detail.kind === 'cart') return 'Adding to your cart…';
    return '';
  }

  const LASER_VIEWBOX = 100;
  const LASER_RADIUS = 42;
  const LASER_TAIL_COUNT = 24;
  const LASER_TAIL_SWEEP = 225;
  const LASER_TAIL_OVERLAP = 0.8;
  const DESKTOP_ACTIVITY_HALO_PX = 144;
  const ACTIVITY_HALO_RATIO = 1.34;
  const LASER_ICON_NODES = {
    search: [
      ['circle', { cx: '11', cy: '11', r: '8' }],
      ['path', { d: 'm21 21-4.3-4.3' }],
    ],
    compare: [
      ['path', { d: 'M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14' }],
      ['path', { d: 'm7.5 4.27 9 5.15' }],
      ['polyline', { points: '3.29 7 12 12 20.71 7' }],
      ['line', { x1: '12', x2: '12', y1: '22', y2: '12' }],
      ['circle', { cx: '18.5', cy: '15.5', r: '2.5' }],
      ['path', { d: 'M20.27 17.27 22 19' }],
    ],
    product: [
      ['path', { d: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z' }],
      ['circle', { cx: '12', cy: '12', r: '3' }],
    ],
    policies: [
      ['path', { d: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z' }],
      ['path', { d: 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' }],
    ],
    cart: [
      ['circle', { cx: '8', cy: '21', r: '1' }],
      ['circle', { cx: '19', cy: '21', r: '1' }],
      ['path', { d: 'M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12' }],
    ],
    products: [
      ['rect', { width: '7', height: '7', x: '3', y: '3', rx: '1' }],
      ['rect', { width: '7', height: '7', x: '14', y: '3', rx: '1' }],
      ['rect', { width: '7', height: '7', x: '14', y: '14', rx: '1' }],
      ['rect', { width: '7', height: '7', x: '3', y: '14', rx: '1' }],
    ],
  };

  function laserPolar(angleDeg) {
    const radians = (angleDeg * Math.PI) / 180;
    return {
      x: LASER_VIEWBOX / 2 + LASER_RADIUS * Math.sin(radians),
      y: LASER_VIEWBOX / 2 - LASER_RADIUS * Math.cos(radians),
    };
  }

  function laserArc(startAngle, endAngle) {
    const start = laserPolar(startAngle);
    const end = laserPolar(endAngle);
    return `M ${start.x.toFixed(3)} ${start.y.toFixed(3)} A ${LASER_RADIUS} ${LASER_RADIUS} 0 0 1 ${end.x.toFixed(3)} ${end.y.toFixed(3)}`;
  }

  function laserIcon(kind) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.stroke = 'currentColor';
    svg.style.strokeWidth = '2.75';
    svg.style.strokeLinecap = 'round';
    svg.style.strokeLinejoin = 'round';
    (LASER_ICON_NODES[kind] || LASER_ICON_NODES.products).forEach(([tag, attrs]) => {
      const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
      Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
      svg.append(node);
    });
    return svg;
  }

  function activityStage() {
    const phoneStore = document.querySelector('.promo-opening__store.is-phone, .promo-opening__store.is-tablet');
    const desktop = document.querySelector('.bizmis-desktop-lite-chat canvas');
    if (desktop && !phoneStore) {
      const layer = desktop.closest('.absolute');
      const stage = layer?.parentElement;
      if (stage && layer.parentElement === stage) return { stage, before: layer };
    }
    const button = document.querySelector('.bizmis-mobile-lite-chat button.relative.rounded-full, .bizmis-bar-row .relative.rounded-full');
    if (button) {
      const before = [...button.children].find((node) => !node.hasAttribute('data-activity-laser')) || null;
      return { stage: button, before };
    }
    return null;
  }

  function activityHaloPx(stage) {
    if (stage.closest('.bizmis-desktop-lite-chat')) return DESKTOP_ACTIVITY_HALO_PX;
    return stage.offsetWidth * ACTIVITY_HALO_RATIO;
  }

  const PROMO_MOMENT_POSES = ['grid', 'row', 'choice', 'doubt', 'close', 'extra', 'bundle', 'fly', 'gone'];
  const PROMO_MOMENT_GRID_COLS = 4;
  const PROMO_MOMENT_CARD_COUNT = 12;
  const PROMO_CATALOG_SEED = 40721;
  const PROMO_CATALOG_COLS = 4;
  const PROMO_CATALOG_GUTTER = 20;
  const PROMO_CATALOG_ROW_GAP = 18;
  const PROMO_CATALOG_VISIBLE_ROWS = 2.2;
  const PROMO_CATALOG_PAD_X = 36;
  const PROMO_CATALOG_PAD_Y = 28;
  const PROMO_CATALOG_TOP_GAP = 18;
  const PROMO_ROW_CLERK_LANE = 220;
  const PROMO_COMPARE_RESERVE = 172;   // v10: room under the row for the criteria legend
  const PROMO_ROW_GAP = 20;
  // Only product images used in pain and pitch. Files live in products/images/ as promo-product-<key>.png.
  const PROMO_CLAY_TINTS = ['stone', 'sand', 'blush', 'sage', 'warm-grey'];
  const PROMO_CATALOG = {
    capsule: { family: 'round', tint: 'stone' },
    sphere: { family: 'round', tint: 'sand' },
    cylinder: { family: 'round', tint: 'blush' },
    dome: { family: 'round', tint: 'sage' },
    torus: { family: 'round', tint: 'warm-grey' },
    egg: { family: 'round', tint: 'blush' },
    'tall-cylinder': { family: 'round', tint: 'sage' },
    arch: { family: 'round', tint: 'stone' },
    'rounded-cube': { family: 'boxy', tint: 'warm-grey' },
    'tall-box': { family: 'boxy', tint: 'sand' },
    'hexagonal-prism': { family: 'boxy', tint: 'blush' },
    cone: { family: 'pointed', tint: 'sage' },
    'truncated-cone': { family: 'pointed', tint: 'stone' },
    icosahedron: { family: 'pointed', tint: 'sand' },
    dodecahedron: { family: 'pointed', tint: 'blush' },
    'rounded-tetrahedron': { family: 'pointed', tint: 'warm-grey' },
    slab: { family: 'flat', tint: 'sand' },
    lens: { family: 'flat', tint: 'sage' },
    'squircle-slab': { family: 'flat', tint: 'blush' },
  };
  const PROMO_CLAY_KINDS = Object.keys(PROMO_CATALOG).filter((kind) => PROMO_CLAY_TINTS.includes(PROMO_CATALOG[kind].tint));
  const PROMO_CLAY_TURNS = ['m20', '0', 'p20'];
  const PROMO_CLAY_FINISHES = ['matte', 'satin'];
  const PROMO_CLAY_SCALES = [0.8, 0.86, 0.92, 0.98, 1.04, 1.1];
  const PROMO_MOMENT_SPEC_KINDS = ['spec-star', 'spec-tag', 'spec-truck'];
  const PROMO_MOMENT_GO_INDEX = 0;
  const PROMO_MOMENT_PICK_INDEX = 5;
  const PROMO_MOMENT_OTHER_INDEX = 3;
  const PROMO_COMPARE_SHAPES = { go: 'capsule', pick: 'sphere', other: 'rounded-cube' };
  const PROMO_COMPARE_TINTS = { go: 'sage', pick: 'apricot', other: 'stone' };
  const PROMO_ACCESSORY_OBJECT_SCALE = 1.08;
  const PROMO_TINT_FILE = {
    sphere: { stone: 'sphere-b' },
    capsule: { stone: 'capsule' },
    'rounded-cube': { stone: 'rounded-cube' },
    torus: { stone: 'torus-b' },
  };
  const PROMO_MOMENT_GRID_PITCH_X = 168;
  const PROMO_MOMENT_GRID_PITCH_Y = 208;
  const PROMO_MOMENT_TITLE_WIDTHS = [68, 54, 76, 48, 62, 72, 58, 80, 50, 66, 74, 60];
  const PROMO_MOMENT_PRICE_WIDTHS = [36, 28, 42, 24, 32, 38, 26, 44, 30, 34, 40, 28];
  const PROMO_MOMENT_NEW_INDEXES = [0];
  const PROMO_MOMENT_ICONS = {
    'spec-star': '<path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z"/>',
    'spec-tag': '<path d="M3 3h8.4l9.6 9.6-8.4 8.4L3 11.4z"/><circle cx="7.6" cy="7.6" r="1.7" fill="#fff"/>',
    'spec-truck': '<path d="M1.8 6h12v9.6H1.8zM13.8 9.4h4.4l3.4 3.4v2.8h-7.8z"/><circle cx="6" cy="17.4" r="2.2"/><circle cx="17.6" cy="17.4" r="2.2"/>',
    'spec-bolt': '<path d="M13.2 2.2 5.4 13.2h5.2l-1.1 8.6 8.6-12.2h-5.4z"/>',
    'spec-gauge': '<path fill-rule="evenodd" d="M3.2 17.6a8.8 8.8 0 0 1 17.6 0h-3.4a5.4 5.4 0 0 0-10.8 0z"/><path d="M11.1 16.8 16.2 7.6 13.4 16.2z"/>',
    'spec-shield': '<path d="M12 2.4 20.2 5.6v6.2c0 4.4-3 7.6-8.2 9.8-5.2-2.2-8.2-5.4-8.2-9.8V5.6z"/>',
    // v13: lightness (a feather) and easy care (a sparkle)
    'spec-feather': '<path d="M20.4 3.6c-5.6-.4-10.4 2-12.8 6.6-1.2 2.3-1.6 4.8-1.4 7.2L3.6 20l1 1 2.6-2.6c2.4.2 4.9-.2 7.2-1.4l-2.3-.5 3.9-1.4c1.4-1.1 2.5-2.5 3.2-4.1l-2.8-.2 3.6-1.5c.6-1.8.8-3.7.4-5.7zM8.2 17.4l6.4-8.8-1.6-.4z"/>',
    'spec-sparkle': '<path d="M10.4 3.2 12.2 8.4l5.2 1.8-5.2 1.8-1.8 5.2-1.8-5.2-5.2-1.8 5.2-1.8z"/><path d="M17.6 13.4l.9 2.5 2.5.9-2.5.9-.9 2.5-.9-2.5-2.5-.9 2.5-.9z"/>',
  };

  const PROMO_GRID_LIFE_MS = 4000;
  const PROMO_GRID_LIFT_MS = 600;
  const PROMO_PAIN_LIFE_HOLD = ['open', 'back', 'scroll-1', 'open-2', 'back-2', 'scroll-2', 'scroll-3', 'scroll-4', 'leave'];
  let gridLifeTimer = 0;

  function paintShelf(card, index) {
    card.style.setProperty('--shelf', 'var(--ad-surface)');
    card.style.setProperty('--shelf-deep', 'var(--ad-line)');
    card.style.setProperty('--enter', String(index));
  }

  function mulberry32(seed) {
    let state = seed >>> 0;
    return () => {
      state = (state + 0x6D2B79F5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function clayVariantKey(look) {
    const kind = typeof look === 'string' ? look : look.kind;
    const turn = typeof look === 'string' ? '0' : look.turn;
    const satin = look && look.finish === 'satin' ? '-satin' : '';
    if (turn === 'm20') return `${kind}-b${satin}`;
    if (turn === 'p20') return `${kind}-c${satin}`;
    return `${kind}${satin}`;
  }

  function claySrc(look) {
    const urls = promoClayUrls();
    const key = look.file || clayVariantKey(look);
    if (urls[key]) return urls[key];
    const plain = key.replace(/-satin$/, '').replace(/-[bc]$/, '');
    return urls[plain] || '';
  }

  function clayTintOf(kind) {
    return PROMO_CATALOG[kind]?.tint || 'stone';
  }

  function clayFamilyOf(kind) {
    return PROMO_CATALOG[kind]?.family || 'round';
  }

  function tintsClash(left, right) {
    return !!left && left === right;
  }

  function catalogNeighbors(index, cols, count) {
    const neighbors = [];
    if (index % cols) neighbors.push(index - 1);
    if (index % cols < cols - 1 && index + 1 < count) neighbors.push(index + 1);
    if (index >= cols) neighbors.push(index - cols);
    if (index + cols < count) neighbors.push(index + cols);
    return neighbors;
  }

  function makeCatalogLook(kind, rand) {
    return {
      kind,
      turn: PROMO_CLAY_TURNS[Math.floor(rand() * PROMO_CLAY_TURNS.length)],
      finish: PROMO_CLAY_FINISHES[Math.floor(rand() * PROMO_CLAY_FINISHES.length)],
      scale: PROMO_CLAY_SCALES[Math.floor(rand() * PROMO_CLAY_SCALES.length)],
      tint: clayTintOf(kind),
    };
  }

  function catalogVariantSeed(variant) {
    const key = String(variant || 'classic');
    let hash = PROMO_CATALOG_SEED;
    for (let index = 0; index < key.length; index += 1) {
      hash = Math.imul(hash ^ key.charCodeAt(index), 16777619);
    }
    return hash >>> 0;
  }

  function catalogWindow(cols) {
    return cols * Math.ceil(PROMO_CATALOG_VISIBLE_ROWS);
  }

  function catalogHeroKind(index) {
    if (index === PROMO_MOMENT_GO_INDEX) return PROMO_COMPARE_SHAPES.go;
    if (index === PROMO_MOMENT_PICK_INDEX) return PROMO_COMPARE_SHAPES.pick;
    if (index === PROMO_MOMENT_OTHER_INDEX) return PROMO_COMPARE_SHAPES.other;
    return '';
  }

  function catalogLooks(count, cols, variant) {
    const rand = mulberry32(catalogVariantSeed(variant));
    const span = catalogWindow(cols);
    const preference = [...PROMO_CLAY_KINDS];
    for (let index = preference.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(rand() * (index + 1));
      const held = preference[index];
      preference[index] = preference[swap];
      preference[swap] = held;
    }
    const kinds = new Array(count);
    const knownKind = (index) => kinds[index] || catalogHeroKind(index);
    const knownTint = (index) => compareTintAt(index) || (kinds[index] ? clayTintOf(kinds[index]) : '');
    const fits = (index, kind) => {
      const start = Math.max(0, index - span + 1);
      const end = Math.min(count, index + span);
      for (let prev = start; prev < index; prev += 1) {
        if (knownKind(prev) === kind) return false;
      }
      for (let ahead = index + 1; ahead < end; ahead += 1) {
        if (catalogHeroKind(ahead) === kind) return false;
      }
      const family = clayFamilyOf(kind);
      const tint = compareTintAt(index) || clayTintOf(kind);
      return catalogNeighbors(index, cols, count).every((other) => {
        const otherKind = knownKind(other);
        if (!otherKind || other > index && !catalogHeroKind(other)) return true;
        if (otherKind === kind) return false;
        if (clayFamilyOf(otherKind) === family) return false;
        return !tintsClash(knownTint(other), tint);
      });
    };
    const place = (index) => {
      if (index === count) return true;
      const hero = catalogHeroKind(index);
      const options = hero ? [hero] : preference.filter((candidate) => fits(index, candidate));
      for (let option = 0; option < options.length; option += 1) {
        kinds[index] = options[option];
        if (place(index + 1)) return true;
      }
      kinds[index] = undefined;
      return false;
    };
    if (!place(0)) {
      throw new Error(`catalog look failed for ${variant || 'classic'}`);
    }
    return kinds.map((kind, index) => (
      catalogHeroKind(index)
        ? lookForTint(kind, compareTintAt(index))
        : makeCatalogLook(kind, rand)
    ));
  }

  function gridAllLooks(variant) {
    return catalogLooks(PROMO_MOMENT_CARD_COUNT, PROMO_CATALOG_COLS, variant);
  }

  function compareTintAt(index) {
    if (index === PROMO_MOMENT_GO_INDEX) return PROMO_COMPARE_TINTS.go;
    if (index === PROMO_MOMENT_PICK_INDEX) return PROMO_COMPARE_TINTS.pick;
    if (index === PROMO_MOMENT_OTHER_INDEX) return PROMO_COMPARE_TINTS.other;
    return '';
  }

  function lookForTint(shape, tint) {
    const file = PROMO_TINT_FILE[shape]?.[tint];
    return {
      kind: shape,
      turn: '0',
      finish: 'matte',
      scale: 1,
      tint,
      ...(file ? { file } : {}),
    };
  }

  function accessoryLook() {
    return {
      kind: 'slab',
      turn: '0',
      finish: 'matte',
      scale: 1,
      tint: 'stone',
    };
  }

  function applyClayLook(card, look) {
    PROMO_CLAY_KINDS.forEach((kind) => card.classList.remove(`is-${kind}`));
    card.classList.add(`is-${look.kind}`);
    card.dataset.clayKind = look.kind;
    card.dataset.clayTurn = look.turn;
    card.dataset.clayFinish = look.finish;
    card.dataset.tint = look.tint;
    card.style.setProperty('--clay-scale', String(look.scale));
    const img = card.querySelector('.promo-moments__glyph img');
    const src = claySrc(look);
    if (img && img.getAttribute('src') !== src) img.src = src;
  }

  function paintCatalogClay(board, cols) {
    if (!board || board.dataset.clayReady === '1') return;
    const cards = [...board.querySelectorAll('.promo-moments__card:not(.is-extra)')];
    const columnCount = cols || Number(board.dataset.painCols) || PROMO_CATALOG_COLS;
    const variant = board.dataset.catalogVariant || board.dataset.storeLook || 'classic';
    const looks = catalogLooks(cards.length, columnCount, variant);
    cards.forEach((card, index) => applyClayLook(card, looks[index]));
    const extra = board.querySelector('.promo-moments__card.is-extra');
    const pick = looks[PROMO_MOMENT_PICK_INDEX];
    const accessory = accessoryLook();
    if (extra && pick) applyClayLook(extra, accessory);
    board.style.setProperty('--promo-accessory-object', String(PROMO_ACCESSORY_OBJECT_SCALE));
    board.dataset.clayReady = '1';
  }

  function momentTakeLook(kind) {
    return {
      kind,
      turn: '0',
      finish: 'matte',
      scale: 1,
      tint: clayTintOf(kind),
      file: kind,
    };
  }

  function applyMomentTake(board, take) {
    const heroes = PROMO_MOMENT_TAKE_HEROES[take];
    if (!board || !heroes) return;
    const assign = (selector, kind) => {
      const card = board.querySelector(selector);
      if (card) applyClayLook(card, momentTakeLook(kind));
    };
    assign('.promo-moments__card.is-go', heroes.go);
    assign('.promo-moments__card.is-pick', heroes.pick);
    assign('.promo-moments__card.is-other', heroes.other);
    assign('.promo-moments__card.is-extra', heroes.extra);
    const drops = [...board.querySelectorAll('.promo-moments__card.is-drop .promo-moments__glyph img')];
    const srcs = drops.map((img) => img.getAttribute('src') || '');
    drops.forEach((img, index) => {
      const next = srcs[(index + 3) % srcs.length];
      if (next) img.src = next;
    });
  }

  function promoClayUrls() {
    if (promoClayUrls.cache) return promoClayUrls.cache;
    try {
      promoClayUrls.cache = JSON.parse(document.documentElement.getAttribute('data-promo-clay') || '{}');
    } catch (error) {
      promoClayUrls.cache = {};
    }
    return promoClayUrls.cache;
  }

  function armGridEntrance(board) {
    if (!board || board.dataset.entered || prefersReducedMotion()) return;
    board.dataset.entered = '1';
  }

  function stopGridLife() {
    window.clearInterval(gridLifeTimer);
    gridLifeTimer = 0;
    document.querySelectorAll('.promo-moments__card.is-idle-lift').forEach((card) => {
      card.classList.remove('is-idle-lift');
    });
  }

  function startGridLife(board) {
    if (!board || gridLifeTimer || prefersReducedMotion()) return;
    gridLifeTimer = window.setInterval(() => {
      if (board.dataset.life === 'hold' || !board.classList.contains('is-pose-grid')) return;
      const stage = board.parentElement;
      if (!stage) return;
      const stageBox = stage.getBoundingClientRect();
      const visible = [...board.querySelectorAll('.promo-moments__card:not(.is-extra):not(.is-pain-hover):not(.is-pain-open):not(.is-idle-lift)')].filter((card) => {
        const box = card.getBoundingClientRect();
        return box.top >= stageBox.top - 8
          && box.bottom <= stageBox.bottom + 8
          && box.right > stageBox.left + 8
          && box.left < stageBox.right - 8;
      });
      if (!visible.length) return;
      const card = visible[Math.floor(Math.random() * visible.length)];
      card.classList.add('is-idle-lift');
      window.setTimeout(() => card.classList.remove('is-idle-lift'), PROMO_GRID_LIFT_MS);
    }, PROMO_GRID_LIFE_MS);
  }

  function momentShapeRole(index) {
    if (index === PROMO_MOMENT_PICK_INDEX) return 'pick';
    if (index === PROMO_MOMENT_OTHER_INDEX) return 'other';
    if (index === PROMO_MOMENT_GO_INDEX) return 'go';
    return 'drop';
  }

  function momentGlyph() {
    const glyph = document.createElement('span');
    glyph.className = 'promo-moments__glyph';
    const img = document.createElement('img');
    img.alt = '';
    img.draggable = false;
    glyph.appendChild(img);
    return glyph;
  }

  function momentBadge(index) {
    if (!PROMO_MOMENT_NEW_INDEXES.includes(index)) return null;
    const pill = document.createElement('span');
    pill.className = 'promo-moments__new';
    pill.textContent = 'NEW';
    return pill;
  }

  function momentPhoto(index) {
    const photo = document.createElement('span');
    photo.className = 'promo-moments__photo';
    photo.appendChild(momentGlyph());
    const badge = momentBadge(index);
    if (badge) photo.appendChild(badge);
    return photo;
  }

  function momentMeta(index) {
    const meta = document.createElement('span');
    meta.className = 'promo-moments__meta';
    const title = document.createElement('i');
    title.className = 'promo-moments__title';
    title.style.setProperty('--bar', `${PROMO_MOMENT_TITLE_WIDTHS[index] || 64}%`);
    const price = document.createElement('span');
    price.className = 'promo-moments__price';
    const dollar = document.createElement('b');
    dollar.textContent = '$';
    const bar = document.createElement('i');
    bar.style.setProperty('--bar', `${PROMO_MOMENT_PRICE_WIDTHS[index] || 32}%`);
    price.append(dollar, bar);
    meta.append(title, price);
    return meta;
  }

  function momentAdd(copy) {
    const add = document.createElement('span');
    add.className = 'promo-moments__add';
    const label = document.createElement('span');
    label.className = 'promo-moments__add-label';
    label.textContent = copy?.label || 'Add';
    const done = document.createElement('span');
    done.className = 'promo-moments__add-done';
    done.append(momentMark('yes'), document.createTextNode(copy?.done || 'Added'));
    add.append(label, done);
    return add;
  }

  function momentKept() {
    const kept = document.createElement('span');
    kept.className = 'promo-moments__kept';
    kept.appendChild(momentMark('yes'));
    return kept;
  }

  function momentMark(kind) {
    const mark = document.createElement('span');
    mark.className = `promo-moments__mark is-${kind}`;
    const path = kind === 'no'
      ? 'M2.2 2.2 9.8 9.8M9.8 2.2 2.2 9.8'
      : 'M1.8 6.1 4.6 9.1 10.2 2.8';
    mark.innerHTML = `<svg viewBox="0 0 12 12" aria-hidden="true"><path d="${path}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    return mark;
  }

  // The comparison sits on each product: three glass chips in the photo's
  // top-right corner, each an attribute icon and its verdict.
  const PROMO_CHIP_VERDICTS = {
    go: ['yes', 'yes', 'no'],
    pick: ['yes', 'yes', 'yes'],
    other: ['yes', 'no', 'yes'],
  };

  // v10: the comparison reads at a glance. The criteria are named once in a
  // legend above the row; each card carries a glass strip of the same three
  // icons, each with its verdict (orange check = meets it, grey dash = not).
  const PROMO_VERDICT_WORDS = { 'spec-star': 'Top rated', 'spec-tag': 'Under $50', 'spec-truck': 'Arrives Friday', 'spec-bolt': 'Power', 'spec-shield': 'Durability', 'spec-gauge': 'Efficiency', 'spec-feather': 'Lightness', 'spec-sparkle': 'Easy care' };
  // v11b: all three already fit the ask (the narrowing did the filtering), so
  // the comparison is product to product: three qualities, each a level of 3
  const PROMO_VERDICT_KINDS = ['spec-shield', 'spec-feather', 'spec-sparkle'];   // v13: "the most durable, the lightest, and easy to care for"
  const PROMO_VERDICT_LEVELS = { go: [2, 3, 1], pick: [3, 3, 3], other: [3, 1, 2] };
  const PROMO_VERDICT_ORDER = { go: 0, pick: 1, other: 2 };
  function momentChips(role) {
    const levels = PROMO_VERDICT_LEVELS[role];
    if (!levels) return null;
    const strip = document.createElement('span');
    strip.className = 'promo-verdict';
    PROMO_VERDICT_KINDS.forEach((kind, row) => {
      const cell = document.createElement('span');
      cell.className = `promo-verdict__cell is-level-${levels[row]}${levels[row] === 3 ? ' is-best' : ''}`;
      cell.style.setProperty('--verdict-delay', `${(PROMO_VERDICT_ORDER[role] || 0) * 230 + row * 110}ms`);
      const icon = document.createElement('span');
      icon.className = 'promo-verdict__icon';
      icon.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${PROMO_MOMENT_ICONS[kind]}</svg>`;
      const mark = document.createElement('span');
      mark.className = 'promo-verdict__meter';
      mark.innerHTML = [1, 2, 3].map((k) => `<i class="${k <= levels[row] ? 'is-on' : ''}"></i>`).join('');
      cell.append(icon, mark);
      strip.appendChild(cell);
    });
    return strip;
  }

  function momentLegend() {
    const legend = document.createElement('div');
    legend.className = 'promo-verdict-legend';
    PROMO_VERDICT_KINDS.forEach((kind) => {
      const item = document.createElement('span');
      item.className = 'promo-verdict-legend__item';
      item.innerHTML = `<span class="promo-verdict__icon"><svg viewBox="0 0 24 24" aria-hidden="true">${PROMO_MOMENT_ICONS[kind]}</svg></span><span>${PROMO_VERDICT_WORDS[kind]}</span>`;
      legend.appendChild(item);
    });
    return legend;
  }

  function momentCompare() {
    const panel = document.createElement('div');
    panel.className = 'promo-moments__compare';
    PROMO_MOMENT_SPEC_KINDS.forEach((kind, row) => {
      const line = document.createElement('div');
      line.className = 'promo-moments__compare-row';
      const icon = document.createElement('span');
      icon.className = 'promo-moments__spec-icon';
      icon.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${PROMO_MOMENT_ICONS[kind]}</svg>`;
      const go = document.createElement('span');
      go.className = 'promo-moments__compare-cell';
      go.appendChild(momentMark(row === 2 ? 'no' : 'yes'));
      const winner = document.createElement('span');
      winner.className = 'promo-moments__compare-cell';
      winner.appendChild(momentMark('yes'));
      const other = document.createElement('span');
      other.className = 'promo-moments__compare-cell';
      other.appendChild(momentMark(row === 1 ? 'no' : 'yes'));
      line.append(icon, go, winner, other);
      panel.appendChild(line);
    });
    return panel;
  }

  function ensureMomentBoard(stage) {
    if (!stage) return null;
    const existing = stage.querySelector('.promo-moments__board');
    if (existing) return existing;
    const board = document.createElement('div');
    board.className = 'promo-moments__board is-pose-grid';
    board.dataset.pose = 'grid';
    if (prefersReducedMotion()) board.classList.add('is-reduced');
    for (let index = 0; index < PROMO_MOMENT_CARD_COUNT; index += 1) {
      const column = index % PROMO_MOMENT_GRID_COLS;
      const row = Math.floor(index / PROMO_MOMENT_GRID_COLS);
      const role = momentShapeRole(index);
      const card = document.createElement('div');
      card.className = `promo-moments__card is-${role}`;
      paintShelf(card, index);
      card.style.setProperty('--gx', `${((column - 1.5) * PROMO_MOMENT_GRID_PITCH_X).toFixed(0)}px`);
      card.style.setProperty('--gy', `${((row - 1) * PROMO_MOMENT_GRID_PITCH_Y).toFixed(0)}px`);
      const photo = momentPhoto(index);
      const chips = momentChips(role);
      if (chips) photo.appendChild(chips);
      card.append(photo, momentMeta(index), momentAdd());
      if (role === 'pick') card.appendChild(momentKept());
      board.appendChild(card);
    }
    for (let index = PROMO_MOMENT_CARD_COUNT; index < PROMO_PAIN_POOL; index += 1) {
      const extra = document.createElement('div');
      extra.className = 'promo-moments__card is-drop is-catalog';
      paintShelf(extra, index);
      extra.style.setProperty('--gx', '0px');
      extra.style.setProperty('--gy', '0px');
      extra.append(momentPhoto(index), momentMeta(index), momentAdd());
      board.appendChild(extra);
    }
    const accessory = document.createElement('div');
    accessory.className = 'promo-moments__card is-extra';
    accessory.append(
      momentPhoto(PROMO_MOMENT_CARD_COUNT),
      momentMeta(PROMO_MOMENT_CARD_COUNT),
      momentAdd({ label: 'Add to cart', done: 'Added' }),
    );
    board.appendChild(accessory);
    board.appendChild(momentCompare());
    board.appendChild(momentLegend());
    const orbits = [
      ['1', '0'],
      ['2', '-0.25'],
      ['3', '-0.5'],
      ['4', '-0.75'],
    ];
    orbits.forEach(([slot, phase]) => {
      const orbit = document.createElement('span');
      orbit.className = `promo-moments__orbit is-bubble-${slot}`;
      orbit.style.setProperty('--orbit-phase', phase);
      const bubble = document.createElement('span');
      bubble.className = 'promo-moments__bubble';
      const ask = document.createElement('span');
      ask.className = 'promo-moments__ask';
      ask.textContent = '?';
      const yes = document.createElement('span');
      yes.className = 'promo-moments__yes';
      yes.appendChild(momentMark('yes'));
      bubble.append(ask, yes);
      orbit.appendChild(bubble);
      for (let bit = 0; bit < 6; bit += 1) {
        const particle = document.createElement('span');
        particle.className = 'promo-moments__vapor-bit';
        const angle = (bit / 6) * Math.PI * 2 + Number(slot) * 0.55;
        const dist = 2.1 + (bit % 3) * 1.25;
        particle.style.setProperty('--dx', `${Math.cos(angle) * dist}rem`);
        particle.style.setProperty('--dy', `${Math.sin(angle) * dist}rem`);
        particle.style.setProperty('--bit-delay', `${bit * 40}ms`);
        orbit.appendChild(particle);
      }
      board.appendChild(orbit);
    });
    const added = document.createElement('span');
    added.className = 'promo-moments__added';
    added.append(momentMark('yes'), document.createTextNode('Added'));
    const plus = document.createElement('span');
    plus.className = 'promo-moments__plus';
    plus.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3.5v13M3.5 10h13"/></svg>';
    const outline = document.createElement('div');
    outline.className = 'promo-moments__outline';
    const celebrate = document.createElement('div');
    celebrate.className = 'promo-moments__celebrate';
    celebrate.setAttribute('aria-hidden', 'true');
    const bloom = document.createElement('span');
    bloom.className = 'promo-moments__bloom';
    const halo = document.createElement('span');
    halo.className = 'promo-moments__halo';
    const burstCheck = document.createElement('span');
    burstCheck.className = 'promo-moments__burst-check';
    burstCheck.appendChild(momentMark('yes'));
    celebrate.append(bloom, halo, burstCheck);
    [[1, -0.15], [0.62, -0.82], [-0.2, -1], [-0.86, -0.42], [0.9, 0.42], [-0.48, 0.78], [0.12, 0.96], [-0.95, 0.22]].forEach(([sx, sy]) => {
      const spark = document.createElement('span');
      spark.className = 'promo-moments__spark';
      spark.style.setProperty('--sx', String(sx));
      spark.style.setProperty('--sy', String(sy));
      celebrate.appendChild(spark);
    });
    board.append(added, plus, outline, celebrate);
    board.querySelector('.promo-moments__cart')?.remove();
    board.querySelector('.promo-moments__fly')?.remove();
    board.classList.add('is-instant');
    stage.replaceChildren(board);
    return board;
  }

  function layoutStoreGrid(board) {
    const stage = board?.parentElement;
    const storeNode = stage?.closest('.promo-opening__store');
    const phone = Boolean(storeNode?.classList.contains('is-phone'));
    const tablet = Boolean(storeNode?.classList.contains('is-tablet'));
    if (!stage || stage.clientWidth < (phone ? 160 : 240) || stage.clientHeight < (phone ? 120 : 160)) return false;
    const shiftRaw = getComputedStyle(board).getPropertyValue('--promo-board-x').trim();
    const shift = phone || tablet ? 0 : (shiftRaw.endsWith('rem') ? parseFloat(shiftRaw) * 16 : (parseFloat(shiftRaw) || 0));
    const opening = board.closest('.promo-opening');
    const clipLayout = Boolean(opening?.classList.contains('is-clip'));
    const stageWidth = stage.clientWidth;
    const contentWidth = stageWidth;
    const look = board.dataset.storeLook || 'classic';
    let cols = look === 'collection-dense' ? 5
      : look === 'lookbook' ? 2
        : look === 'list' ? 1
          : look === 'home-hero' ? 3
            : PROMO_CATALOG_COLS;
    if (phone) cols = look === 'lookbook' ? 1 : Math.min(cols, 2);
    else if (tablet && clipLayout) cols = look === 'list' ? 1 : look === 'lookbook' ? 2 : look === 'collection-dense' ? 3 : 2;
    else if (tablet) cols = Math.min(cols, 3);
    else if (clipLayout && look !== 'list' && look !== 'lookbook') cols = look === 'collection-dense' ? 3 : 2;
    const padX = phone ? 14 : tablet ? 22 : PROMO_CATALOG_PAD_X;
    const gutter = look === 'collection-dense' ? 12 : look === 'lookbook' ? 28 : (phone ? 12 : PROMO_CATALOG_GUTTER);
    const rowGapY = look === 'list' ? 12 : PROMO_CATALOG_ROW_GAP;
    let cardW = (contentWidth - padX * 2 - (cols - 1) * gutter) / cols;
    const cardFooter = look === 'lookbook' ? 72 : look === 'list' ? 8 : 52;
    let cardH = look === 'list' ? 96 : cardW + cardFooter;
    let pitchX = cardW + gutter;
    let pitchY = cardH + rowGapY;
    const inset = padX;
    let gx0 = inset + cardW / 2 - (stageWidth / 2 + shift);
    const pitchBoard = !board.closest('.promo-opening')?.classList.contains('is-pain');
    const actControl = stage.querySelector('.promo-clip__chips, .promo-clip__sizes');
    const actReserve = actControl ? Math.round(stage.clientWidth * 0.024 + 56) : 0;
    const heroWide = phone || tablet;
    const heroReserve = look === 'home-hero' && !opening.classList.contains('is-motion-scroll-down')
      ? (clipLayout
        ? (heroWide
          ? Math.round((stage.clientWidth - (phone ? 28 : 36)) * 9 / 16 + 18)
          : Math.round(Math.min(stage.clientWidth * 0.46, 620) * 9 / 16 + 20))
        : 132)
      : 0;
    const padY = (pitchBoard ? 28 : PROMO_CATALOG_PAD_Y) + heroReserve + actReserve;
    let visibleRows = 99;
    if (clipLayout) {
      const rows = look === 'list' ? (phone || tablet ? 5 : 4)
        : look === 'collection-dense' ? (phone ? 3 : 2)
          : look === 'home-hero' ? (phone ? 2 : 1)
            : look === 'lookbook' ? 1
              : (phone ? 3 : 2);
      visibleRows = rows + (opening.classList.contains('is-motion-scroll-down') ? 1 : 0);
      const budget = Math.max(160, stage.clientHeight - padY - 16);
      const fitted = (budget - (rows - 1) * rowGapY) / rows;
      cardH = look === 'list' ? Math.max(92, Math.min(phone ? 132 : 168, fitted)) : Math.max(160, fitted);
      // A lookbook card is its photo plus a caption, never a tall empty strip.
      if (look === 'lookbook') cardH = Math.min(cardH, cardW * 1.45 + 72);
      pitchY = cardH + rowGapY;
      if (look === 'home-hero' && !clipLayout && !opening.classList.contains('is-motion-scroll-down')) {
        const photo = cardH - 96;
        if (photo > 180 && cardW > photo) {
          cardW = photo;
          pitchX = cardW + gutter;
          const group = cols * cardW + (cols - 1) * gutter;
          gx0 = (stageWidth - group) / 2 + cardW / 2 - stageWidth / 2 - shift;
        }
      }
    }
    const fillsWindow = !phone && !tablet && !clipLayout && look !== 'list' && look !== 'lookbook' && look !== 'home-hero';
    if (fillsWindow && look !== 'list') {
      const footer = 52;
      const painStore = Boolean(opening?.classList.contains('is-pain'));
      const bottomPad = painStore ? 88 : 16;
      const rowsOnScreen = 2;
      const budget = stage.clientHeight - padY - bottomPad - (rowsOnScreen - 1) * rowGapY;
      const side = Math.min(cardW, Math.max(96, budget / rowsOnScreen - footer));
      cardW = side;
      cardH = side + footer;
      pitchX = cardW + gutter;
      pitchY = cardH + rowGapY;
      const group = cols * cardW + (cols - 1) * gutter;
      gx0 = (stageWidth - group) / 2 + cardW / 2 - stageWidth / 2 - shift;
    }
    if (pitchBoard && look !== 'home-hero') {
      const fitRaw = parseFloat(getComputedStyle(board).getPropertyValue('--promo-grid-fit'));
      const fit = Number.isFinite(fitRaw) && fitRaw > 0 && fitRaw <= 1 ? fitRaw : 1;
      const naturalGap = stage.clientHeight * (1 - fit) / 2 + fit * padY;
      board.style.setProperty('--promo-grid-rest-y', `${(PROMO_CATALOG_TOP_GAP - naturalGap).toFixed(1)}px`);
    }
    if (clipLayout && look !== 'list' && look !== 'lookbook') {
      const cardFooter = 64;
      const square = Math.min(cardW, Math.max(140, cardH - cardFooter));
      cardW = square;
      cardH = square + cardFooter;
      pitchX = cardW + gutter;
      pitchY = cardH + rowGapY;
      const group = cols * cardW + (cols - 1) * gutter;
      gx0 = (stageWidth - group) / 2 + cardW / 2 - stageWidth / 2 - shift;
    }
    const gy0 = -stage.clientHeight / 2 + padY + cardH / 2;
    const rowGap = phone ? 12 : PROMO_ROW_GAP;
    const rowInset = phone ? 16 : tablet ? 20 : 28;
    const laneRaw = parseFloat(getComputedStyle(stage).getPropertyValue('--clip-clerk-lane'));
    const clerkLane = phone || tablet || !clipLayout
      ? 0
      : (Number.isFinite(laneRaw) && laneRaw > 40 ? laneRaw : 0);
    const rowBudget = contentWidth - clerkLane - rowInset;
    const rowCardW = phone
      ? Math.min(contentWidth - rowInset * 2, stage.clientWidth * 0.86)
      : (rowBudget - rowGap * 2) / 3;
    const rowCardH = phone
      ? Math.max(112, Math.min(200, (stage.clientHeight - 160) / 3.2))
      : tablet
        ? Math.round(Math.min(stage.clientHeight * 0.36, Math.max(210, rowCardW * 1.22)))
        : Math.max(200, stage.clientHeight - 64 - PROMO_COMPARE_RESERVE);
    const rowSeat = phone ? rowCardH + rowGap : rowCardW + rowGap;
    const groupHalf = rowSeat + rowCardW / 2;
    const minShift = rowInset - contentWidth / 2 + groupHalf;
    const rowNudge = Math.max(0, minShift - shift);
    board.style.setProperty('--catalog-w', `${cardW.toFixed(1)}px`);
    board.style.setProperty('--catalog-h', `${cardH.toFixed(1)}px`);
    board.style.setProperty('--row-card-w', `${rowCardW.toFixed(1)}px`);
    board.style.setProperty('--row-card-h', `${rowCardH.toFixed(1)}px`);
    board.style.setProperty('--row-seat', `${rowSeat.toFixed(1)}px`);
    board.style.setProperty('--row-nudge', `${rowNudge.toFixed(1)}px`);
    board.style.setProperty('--row-compare-y', `${(rowCardH / 2 + 40).toFixed(1)}px`);
    board.style.setProperty('--row-lift', `${(PROMO_COMPARE_RESERVE / 2).toFixed(1)}px`);
    if (clipLayout && opening.classList.contains('is-clip-moment')) {
      const gap = phone ? 12 : 16;
      if (phone) {
        const wide = Math.max(120, stage.clientWidth - 28);
        const tall = Math.max(108, (stage.clientHeight - 36) / 3.15);
        board.style.setProperty('--row-card-w', `${wide.toFixed(1)}px`);
        board.style.setProperty('--row-card-h', `${tall.toFixed(1)}px`);
        board.style.setProperty('--row-seat', `${(tall + gap).toFixed(1)}px`);
        board.style.setProperty('--row-nudge', '0px');
        board.style.setProperty('--row-lift', '0px');
      } else if (tablet) {
        const wide = Math.max(120, (stage.clientWidth - 36 - gap * 2) / 3);
        // A product card's own shape, not a strip the height of the stage.
        const tall = Math.min(stage.clientHeight - 72, wide * 1.3 + 56);
        board.style.setProperty('--row-card-w', `${wide.toFixed(1)}px`);
        board.style.setProperty('--row-card-h', `${tall.toFixed(1)}px`);
        board.style.setProperty('--row-seat', `${(wide + gap).toFixed(1)}px`);
        board.style.setProperty('--row-nudge', '0px');
        board.style.setProperty('--row-lift', '0px');
      } else {
        const wide = Math.max(180, (stage.clientWidth - 48 - gap * 2) / 3);
        const tall = Math.min(stage.clientHeight - 72, wide * 1.3 + 56);
        board.style.setProperty('--row-card-w', `${wide.toFixed(1)}px`);
        board.style.setProperty('--row-card-h', `${tall.toFixed(1)}px`);
        board.style.setProperty('--row-seat', `${(wide + gap).toFixed(1)}px`);
        board.style.setProperty('--row-nudge', '0px');
        board.style.setProperty('--row-lift', '0px');
      }
    }
    stage.closest('.promo-opening__store')?.style.setProperty('--catalog-inset', `${Math.max(inset, 0).toFixed(1)}px`);
    const momentPose = clipLayout
      && opening.classList.contains('is-clip-moment')
      && !board.classList.contains('is-pose-grid');
    board.querySelectorAll('.promo-moments__card:not(.is-extra)').forEach((card, index) => {
      const column = index % cols;
      const row = Math.floor(index / cols);
      card.hidden = clipLayout && !momentPose && row >= visibleRows;
      if (momentPose) return;
      card.style.setProperty('--gx', `${(gx0 + column * pitchX).toFixed(1)}px`);
      card.style.setProperty('--gy', `${(gy0 + row * pitchY).toFixed(1)}px`);
    });
    board.dataset.rowAxis = phone ? 'y' : 'x';
    board.dataset.painCols = String(cols);
    board.dataset.painPitch = String(pitchY);
    stampMomentRoles(board);
    paintCatalogClay(board, cols);
    return true;
  }

  function stampMomentRoles(board) {
    board.querySelectorAll('.promo-moments__card:not(.is-extra)').forEach((card, index) => {
      card.classList.remove('is-go', 'is-pick', 'is-other', 'is-drop');
      card.classList.add(`is-${momentShapeRole(index)}`);
      if (momentShapeRole(index) === 'pick' && !card.querySelector('.promo-moments__kept')) {
        card.appendChild(momentKept());
      }
    });
  }

  function momentCatalogSeek(board) {
    const card = board?.querySelector('.promo-moments__card.is-other');
    const store = board?.closest('.promo-opening__store');
    if (!card || !store) return 0;
    const pitch = Number.parseFloat(board.dataset.painPitch) || 0;
    const gy = Number.parseFloat(card.style.getPropertyValue('--gy')) || 0;
    const cardH = card.getBoundingClientRect().height || pitch || 200;
    const limit = store.clientHeight / 2 - 28;
    const needed = Math.min(0, limit - cardH * 0.45 - gy);
    if (!pitch) return needed;
    return Math.max(needed, -pitch * 0.72);
  }

  function armCatalogEntrance(stage, board) {
    const root = stage?.closest('.promo-opening');
    if (!board || !root || root.classList.contains('is-pain')) return;
    if (board.classList.contains('is-reduced') || board.dataset.catalogEntered) return;
    board.dataset.catalogEntered = '1';
    board.classList.add('is-entering');
  }

  function clearDoubtOrbitFit(board) {
    const photo = board?.querySelector('.promo-moments__card.is-pick .promo-moments__photo');
    if (!photo) return;
    photo.style.width = '';
    photo.style.height = '';
    photo.style.maxWidth = '';
    photo.style.maxHeight = '';
    photo.style.marginLeft = '';
    photo.style.marginRight = '';
    photo.style.alignSelf = '';
    photo.style.justifySelf = '';
  }

  function placeDoubtOrbits(board) {
    const photo = board?.querySelector('.promo-moments__card.is-pick .promo-moments__photo');
    const orbits = board?.querySelectorAll('.promo-moments__orbit');
    if (!photo || !orbits?.length || !board.offsetWidth || !board.offsetHeight) return;
    const boardBox = board.getBoundingClientRect();
    const scaleX = boardBox.width / board.offsetWidth || 1;
    const phone = Boolean(board.closest('.promo-opening__store.is-phone'));
    if (phone) {
      const side = Math.min(board.offsetWidth * 0.9, board.offsetHeight * 0.68);
      photo.style.width = `${side}px`;
      photo.style.height = `${side}px`;
      photo.style.maxWidth = `${side}px`;
      photo.style.maxHeight = `${side}px`;
      photo.style.alignSelf = 'center';
      photo.style.justifySelf = 'center';
      photo.style.marginLeft = '0';
      photo.style.marginRight = '';
    } else {
      photo.style.width = '';
      photo.style.height = '';
      photo.style.maxWidth = '';
      photo.style.maxHeight = '';
      photo.style.alignSelf = '';
      photo.style.justifySelf = '';
      photo.style.marginLeft = '';
      photo.style.marginRight = '';
    }
    const fitted = photo.getBoundingClientRect();
    if (!fitted.width || !fitted.height) return;
    const scaleY = boardBox.height / board.offsetHeight || 1;
    const centerX = (fitted.left + fitted.width / 2 - boardBox.left) / scaleX;
    const centerY = (fitted.top + fitted.height / 2 - boardBox.top) / scaleY;
    const fittedSide = Math.min(fitted.width / scaleX, fitted.height / scaleY);
    const orbitCenterX = centerX;
    const orbitCenterY = centerY;
    const radius = fittedSide * 0.375;
    orbits.forEach((orbit) => {
      orbit.style.left = `${orbitCenterX}px`;
      orbit.style.top = `${orbitCenterY}px`;
      orbit.style.setProperty('--orbit', `${radius}px`);
    });
  }

  function applyMomentPose(stage, pose, options = {}) {
    if (!options.instant && document.documentElement.classList.contains('is-promo-pitch')) promoSfx(`pose-${pose}`);
    const board = ensureMomentBoard(stage);
    if (!board || !pose) return;
    const host = stage.closest('[data-promo-moments]');
    const label = host?.querySelector('[data-promo-moments-label]');
    const samePose = board.dataset.pose === pose;
    if (options.instant) board.classList.add('is-instant');
    if (options.instant) board.classList.add('is-settled');
    else if (!samePose) board.classList.remove('is-settled');
    board.classList.remove('is-shortlist', 'is-catalog-seek');
    if (pose !== 'row') board.classList.remove('is-narrowed');
    if (board.dataset.pose !== pose) {
      PROMO_MOMENT_POSES.forEach((name) => {
        board.classList.toggle(`is-pose-${name}`, name === pose);
      });
      board.dataset.pose = pose;
    }
    host?.classList.remove('is-title');
    host?.classList.toggle('is-vignette-gone', pose === 'fly' || pose === 'gone');
    if (pose === 'grid') armCatalogEntrance(stage, board);
    if (host) {
      host.classList.toggle('is-instant', board.classList.contains('is-instant'));
      host.classList.toggle('is-settled', board.classList.contains('is-settled'));
      host.classList.toggle('is-reduced', board.classList.contains('is-reduced'));
      PROMO_MOMENT_POSES.forEach((name) => {
        host.classList.toggle(`is-pose-${name}`, name === pose);
      });
    }
    if (label) label.textContent = '';
    const snapGrid = !board.dataset.gridLaid && (pose === 'grid' || pose === 'row' || pose === 'choice');
    if (snapGrid) board.classList.add('is-instant');
    if (pose === 'grid' || pose === 'row' || pose === 'choice') {
      const laid = layoutStoreGrid(board);
      if (snapGrid && laid) {
        board.dataset.gridLaid = '1';
        void board.offsetWidth;
        if (!options.instant) {
          board.classList.remove('is-instant');
          host?.classList.remove('is-instant');
        }
      }
    }
    if (pose === 'grid') {
      armGridEntrance(board);
      startGridLife(board);
    } else {
      stopGridLife();
    }
    if (pose === 'doubt' || pose === 'close') {
      placeDoubtOrbits(board);
      // The photo grows into place over the pose change. Follow it until it
      // settles so the orbit centers on the final photo, not a mid-tween one.
      const followFrom = performance.now();
      const follow = () => {
        if (board.dataset.pose !== pose) return;
        placeDoubtOrbits(board);
        if (performance.now() - followFrom < 1600) window.requestAnimationFrame(follow);
      };
      window.requestAnimationFrame(follow);
    } else {
      clearDoubtOrbitFit(board);
    }
    if (options.instant) {
      void board.offsetWidth;
      board.classList.remove('is-instant');
      host?.classList.remove('is-instant');
    }
  }

  function momentHostOf(stage) {
    return stage?.closest('[data-promo-moments]') || stage;
  }

  function momentMotions(stage) {
    const host = momentHostOf(stage);
    if (!host || typeof document.getAnimations !== 'function') return [];
    return document.getAnimations().filter((anim) => {
      const target = anim.effect && anim.effect.target;
      return target && target.nodeType === 1 && host.contains(target);
    });
  }

  function motionSpan(anim) {
    const timing = anim.effect && anim.effect.getTiming ? anim.effect.getTiming() : {};
    const duration = Number(timing.duration) || 0;
    const delay = Number(timing.delay) || 0;
    return { delay, duration, total: delay + duration, iterations: timing.iterations };
  }

  function clearMomentInline(stage) {
    const host = momentHostOf(stage);
    if (!host) return;
    [host, ...host.querySelectorAll('[style]')].forEach((node) => {
      [...node.style].forEach((prop) => {
        if (prop.startsWith('--')) return;
        node.style.removeProperty(prop);
      });
    });
  }

  function restartMomentPose(stage, pose) {
    const board = ensureMomentBoard(stage);
    if (!board) return null;
    const host = momentHostOf(stage);
    momentMotions(stage).forEach((anim) => {
      try {
        anim.cancel();
      } catch (error) {
        return;
      }
    });
    clearMomentInline(stage);
    board.style.removeProperty('--moment-scroll');
    board.classList.remove('is-catalog-seek', 'is-shortlist');
    board.dataset.pose = '';
    const firstGrid = pose === 'grid' && !board.dataset.gridLaid;
    board.classList.remove('is-settled', 'is-reduced');
    host?.classList.remove('is-settled', 'is-reduced', 'is-vignette-gone');
    if (firstGrid) {
      board.classList.add('is-instant');
      host?.classList.add('is-instant');
    } else {
      board.classList.remove('is-instant');
      host?.classList.remove('is-instant');
    }
    PROMO_MOMENT_POSES.forEach((name) => {
      board.classList.remove(`is-pose-${name}`);
      host?.classList.remove(`is-pose-${name}`);
    });
    void board.offsetWidth;
    applyMomentPose(stage, pose);
    void board.offsetWidth;
    return board;
  }

  function whenMomentsRest(stage) {
    return new Promise((resolve) => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          const pending = momentMotions(stage).filter((anim) => {
            const span = motionSpan(anim);
            if (span.iterations === Infinity) return false;
            return anim.playState === 'running' || anim.playState === 'pending';
          });
          if (!pending.length) {
            resolve();
            return;
          }
          Promise.all(pending.map((anim) => anim.finished.catch(() => { }))).then(() => resolve());
        });
      });
    });
  }

  function scrubMoment(stage, pose, timeOf) {
    restartMomentPose(stage, pose);
    const host = momentHostOf(stage);
    if (host) void host.offsetWidth;
    return new Promise((resolve) => {
      const freeze = (attempt) => {
        const motions = document.getAnimations().filter((anim) => {
          const node = anim.effect && anim.effect.target;
          return node && host && (node === host || host.contains(node));
        });
        const named = motions.some((anim) => anim.animationName);
        if (!named && attempt < 6) {
          window.requestAnimationFrame(() => freeze(attempt + 1));
          return;
        }
        motions.forEach((anim) => {
          const span = motionSpan(anim);
          const time = timeOf(anim, span);
          if (!Number.isFinite(time)) return;
          const cap = span.total > 0 ? span.total : time;
          try {
            anim.currentTime = Math.max(0, Math.min(cap, time));
            if (typeof anim.commitStyles === 'function') anim.commitStyles();
          } catch (error) {
            return;
          }
          anim.cancel();
        });
        resolve();
      };
      window.requestAnimationFrame(() => freeze(0));
    });
  }

  function placeExportFly(stage, progress) {
    const host = momentHostOf(stage);
    const fly = host?.querySelector('.promo-moments__fly');
    const store = host?.querySelector('.promo-opening__store');
    const travel = Math.min(1, Math.max(0, (progress - 0.28) / 0.72));
    const scale = progress < 0.28
      ? 0.2 + 0.8 * (progress / 0.28)
      : 1 + (0.12 - 1) * travel;
    const opacity = progress < 0.28 ? 1 : 1 - travel;
    if (store) store.style.opacity = progress < 0.4 ? String(1 - progress / 0.4) : '0';
    if (!fly) return;
    fly.style.opacity = String(opacity);
    fly.style.transform = `translate3d(calc(-50% + ${22 * travel}rem), calc(-50% + ${1.2 * travel}rem), 0) scale(${scale})`;
  }

  function playMomentPose(stage, pose) {
    restartMomentPose(stage, pose);
    return whenMomentsRest(stage);
  }

  let speechMouthHold = null;
  let speechMouthArmed = false;

  function mouthMeshFrom(object, depth) {
    if (!object || depth > 40) return null;
    const dict = object.morphTargetDictionary;
    if (dict && (dict.A != null || dict.jawOpen != null)) return object;
    const children = object.children || [];
    for (let index = 0; index < children.length; index += 1) {
      const found = mouthMeshFrom(children[index], depth + 1);
      if (found) return found;
    }
    return null;
  }

  function sceneFromFiber(start) {
    const stack = start ? [start] : [];
    const seen = new Set();
    while (stack.length) {
      const node = stack.pop();
      if (!node || seen.has(node)) continue;
      seen.add(node);
      const props = node.memoizedProps || {};
      const mesh = mouthMeshFrom(node.stateNode, 0) || mouthMeshFrom(props.object, 0);
      if (mesh) return mesh;
      let hook = node.memoizedState;
      while (hook) {
        const value = hook.memoizedState;
        const store = value && typeof value.getState === 'function'
          ? value
          : value && value.current && typeof value.current.getState === 'function'
            ? value.current
            : null;
        if (store) {
          try {
            const state = store.getState();
            const found = mouthMeshFrom(state && state.scene, 0);
            if (found) return found;
          } catch (error) {
            hook = hook.next;
            continue;
          }
        }
        const direct = mouthMeshFrom(value && value.scene, 0);
        if (direct) return direct;
        hook = hook.next;
      }
      if (node.child) stack.push(node.child);
      if (node.sibling) stack.push(node.sibling);
    }
    return null;
  }

  function findMouthMesh() {
    if (window.__promoMouthMesh && window.__promoMouthMesh.morphTargetDictionary) {
      return window.__promoMouthMesh;
    }
    const roots = document.querySelectorAll('[data-promo-widget], canvas');
    for (const root of roots) {
      const key = Object.keys(root).find((name) => name.startsWith('__reactFiber'));
      let fiber = key ? root[key] : null;
      for (let step = 0; fiber && step < 16; step += 1) {
        const mesh = sceneFromFiber(fiber);
        if (mesh) return mesh;
        fiber = fiber.return;
      }
    }
    return null;
  }

  function releaseSpeechMouth() {
    if (speechMouthHold) {
      speechMouthHold.mesh.morphTargetInfluences = speechMouthHold.original;
      speechMouthHold = null;
    }
    if (!speechMouthArmed) return;
    speechMouthArmed = false;
    setOpeningAvatarAction('idle_neutral');
  }

  function pinMouth(mesh) {
    const dict = mesh.morphTargetDictionary || {};
    const openNames = ['A', 'smile'];
    const openIndexes = openNames.map((name) => dict[name]).filter((index) => index != null);
    const original = mesh.morphTargetInfluences;
    if (!original || !openIndexes.length) return false;
    const proxy = new Proxy(original, {
      set(target, prop, value) {
        const index = Number(prop);
        if (openIndexes.includes(index)) {
          openIndexes.forEach((openIndex) => {
            target[openIndex] = 1;
          });
          return true;
        }
        target[prop] = value;
        return true;
      },
    });
    openIndexes.forEach((index) => {
      original[index] = 1;
    });
    mesh.morphTargetInfluences = proxy;
    speechMouthHold = { mesh, original, proxy };
    return true;
  }

  function holdSpeechMouth() {
    releaseSpeechMouth();
    speechMouthArmed = true;
    document.documentElement.dataset.promoMouth = 'seeking';
    setOpeningAvatarAction('exaggerated_talking');
    return new Promise((resolve) => {
      const watch = (left) => {
        if (!speechMouthArmed) {
          resolve();
          return;
        }
        const mesh = findMouthMesh();
        const pinned = mesh && (speechMouthHold?.mesh === mesh && mesh.morphTargetInfluences === speechMouthHold.proxy || pinMouth(mesh));
        document.documentElement.dataset.promoMouth = pinned ? 'open' : 'missing';
        if (left <= 0) {
          resolve();
          return;
        }
        window.requestAnimationFrame(() => watch(pinned ? 0 : left - 1));
      };
      watch(30);
    });
  }

  function holdMomentAt(anim, time) {
    const span = motionSpan(anim);
    const cap = span.total > 0 ? span.total : time;
    anim.currentTime = Math.max(0, Math.min(cap, time));
    anim.pause();
  }

  function poseOnTimeline(stage, pose, place) {
    restartMomentPose(stage, pose);
    const host = momentHostOf(stage);
    if (host) void host.offsetWidth;
    return new Promise((resolve) => {
      const freeze = (attempt) => {
        const motions = momentMotions(stage);
        if (!motions.some((anim) => anim.animationName) && attempt < 8) {
          window.requestAnimationFrame(() => freeze(attempt + 1));
          return;
        }
        motions.forEach((anim) => {
          const span = motionSpan(anim);
          const placed = place(anim, span);
          if (!placed || !Number.isFinite(placed.time)) return;
          try {
            holdMomentAt(anim, placed.time);
          } catch (error) {
            return;
          }
        });
        resolve();
      };
      window.requestAnimationFrame(() => freeze(0));
    });
  }

  function playChoiceUntilTicks(stage) {
    restartMomentPose(stage, 'choice');
    return new Promise((resolve) => {
      const watch = (attempt) => {
        const motions = momentMotions(stage);
        const ticks = motions.filter((anim) => (anim.animationName || '') === 'promo-moments-tick');
        const ticksDone = ticks.length >= 9 && ticks.every((anim) => anim.playState === 'finished');
        if (!ticksDone) {
          window.requestAnimationFrame(() => watch(attempt + 1));
          return;
        }
        motions.forEach((anim) => {
          const name = anim.animationName || '';
          if (name === 'promo-moments-pair-lift' || name === 'promo-moments-ring' || name === 'promo-moments-compare-fold' || name === 'promo-moments-add-reveal') {
            holdMomentAt(anim, 0);
          }
        });
        resolve();
      };
      window.requestAnimationFrame(() => watch(0));
    });
  }

  const PROMO_MOMENT_BEATS = [
    {
      line: '[fast pace] [bursting with energy, huge smile, thrilled] I narrow it down to the best few.',
      voMs: PROMO_MOMENTS_VO_MS,
      speakMs: PROMO_MOMENTS_CATALOG_MS,
      lookMs: PROMO_MOMENTS_CATALOG_LOOK_MS,
      holdPose: 'grid',
      playPose: 'row',
      endPose: 'row',
    },
    {
      line: '[fast pace] [fired up, confident, beaming] I recommend the one that fits them best.',
      voMs: PROMO_MOMENTS_VO_MS,
      speakMs: PROMO_MOMENTS_CHOICE_MS,
      holdPose: 'row',
      playPose: 'choice',
      endPose: 'choice',
    },
    {
      line: '[fast pace] [bright, delighted, on a roll] I clear them like an expert. [fast pace] [punchy, grinning, triumphant] And close the deal.',
      voMs: PROMO_MOMENTS_VO_MS,
      speakMs: PROMO_MOMENTS_DOUBT_MS,
      holdPose: 'choice',
      playPose: 'doubt',
      endPose: 'close',
      closeAt: PROMO_MOMENTS_CLOSE_AT,
    },
    {
      line: '[fast pace] [cheerful, quick, excited, cannot wait] I suggest what goes best with it.',
      voMs: PROMO_MOMENTS_VO_MS,
      speakMs: PROMO_MOMENTS_EXTRA_MS,
      holdPose: 'close',
      playPose: 'extra',
      endPose: 'bundle',
      bundleAt: PROMO_MOMENTS_BUNDLE_AT,
    },
  ];

  const promoWidget = createPromoWidgetBridge();
  promoWidget.arm();

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function floodEase(t) {
    const x1 = 0.16;
    const y1 = 1;
    const x2 = 0.3;
    const y2 = 1;
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;
    const sampleX = (u) => ((ax * u + bx) * u + cx) * u;
    const sampleY = (u) => ((ay * u + by) * u + cy) * u;
    const sampleDX = (u) => (3 * ax * u + 2 * bx) * u + cx;
    let u = t;
    for (let step = 0; step < 6; step += 1) {
      const slope = sampleDX(u);
      if (Math.abs(slope) < 1e-6) break;
      u = Math.min(1, Math.max(0, u - (sampleX(u) - t) / slope));
    }
    return sampleY(u);
  }

  function tweenAdWarmth() {
    const root = document.documentElement;
    const from = Number.parseFloat(getComputedStyle(root).getPropertyValue('--ad-warmth'));
    const startValue = Number.isFinite(from) ? from : 0;
    if (startValue >= 1) {
      root.style.setProperty('--ad-warmth', '1');
      return;
    }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / PROMO_FLOOD_MS);
      const value = startValue + (1 - startValue) * floodEase(t);
      root.style.setProperty('--ad-warmth', t >= 1 ? '1' : value.toFixed(4));
      if (t < 1) window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  }

  function promoSearchParams() {
    return new URLSearchParams(window.location.search);
  }

  function marketingPart() {
    if (!isMarketingAd) return 'pitch';
    const part = (promoSearchParams().get('part') || 'full').trim().toLowerCase();
    if (part === 'pain' || part === 'pitch' || part === 'full' || part === 'cta' || part === 'reel' || part === 'sync') return part;   // reel: dev preview of the demo stores; sync: the one-click / always-in-sync scene alone
    if (part === 'climax-pain' || part === 'climax-pitch') return part;   // dev: a claim sea (and its sales bar) alone
    return 'full';
  }

  function promoHoldMs() {
    const raw = Number(promoSearchParams().get('hold'));
    if (!Number.isFinite(raw) || raw < 0) return 0;
    return raw;
  }

  function wallSeededUnit(index, salt) {
    let seed = (PROMO_WALL_SEED + index * 7919 + salt * 104729) >>> 0;
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  function readPromoClip() {
    const raw = (promoBootParams.get('clip') || '').trim().toLowerCase();
    if (!raw) return null;
    const deviceRaw = (promoBootParams.get('device') || (PROMO_CLIP_DEVICES.includes(raw) ? raw : 'desktop')).trim().toLowerCase();
    const device = PROMO_CLIP_DEVICES.includes(deviceRaw) ? deviceRaw : 'desktop';
    const motions = PROMO_CLIP_MOTIONS[device];
    const motionRaw = (promoBootParams.get('motion') || motions[0]).trim().toLowerCase();
    const toneRaw = (promoBootParams.get('tone') || 'pain').trim().toLowerCase();
    const lookRaw = (promoBootParams.get('look') || 'classic').trim().toLowerCase();
    const moment = PROMO_PITCH_MOMENTS.includes(motionRaw);
    return {
      device,
      motion: moment || motions.includes(motionRaw) ? motionRaw : motions[0],
      chat: promoBootParams.get('chat') === '1',
      tone: moment || toneRaw === 'pitch' ? 'pitch' : 'pain',
      look: PROMO_STORE_LOOKS.includes(lookRaw) ? lookRaw : 'classic',
    };
  }

  function promoClipUrls() {
    const raw = document.documentElement.getAttribute('data-promo-clips');
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  function clipFileKey(tone, device, motion, chat, look) {
    const base = `${tone}-${device}-${motion}-${chat ? '1' : '0'}`;
    if (!look || look === 'classic') return base;
    return `${base}-${look}`;
  }

  function clipSrc(tone, device, motion, chat, look) {
    const urls = promoClipUrls();
    const key = clipFileKey(tone, device, motion, chat, look);
    if (urls[key]) return urls[key];
    const classic = clipFileKey(tone, device, motion, chat, 'classic');
    if (urls[classic]) return urls[classic];
    return `/promo/sea-of-cards/${tone}/videos/promo-clip-${classic}.mp4`;
  }

  function gridMix(col, row, salt) {
    let n = (Math.imul(col + 1, 374761393) + Math.imul(row + 1, 668265263) + Math.imul(salt + 1, 1442695041) + PROMO_WALL_SEED) >>> 0;
    n = Math.imul(n ^ (n >>> 13), 1274126177) >>> 0;
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  function gridSlot(col, row, salt, count, blocked) {
    let slot = Math.floor(gridMix(col, row, salt) * count);
    let guard = 0;
    while (guard < count && blocked(slot)) {
      slot = (slot + 1) % count;
      guard += 1;
    }
    return slot;
  }

  function momentClipParts(motion) {
    const bits = String(motion || '').split('-');
    if (bits[0] !== 'moment') return null;
    const scene = bits[1];
    const take = bits[2] || 'a';
    if (!PROMO_MOMENT_CLIP_POSE[scene]) return null;
    return { scene, take, pose: PROMO_MOMENT_CLIP_POSE[scene] };
  }

  function gridCssColor(root, name, fallback) {
    const value = getComputedStyle(root).getPropertyValue(name).trim();
    return value || fallback;
  }

  const PROMO_MOCKUP_RADIUS_PX = 32;

  // Device corner radius as a share of its width, close to real hardware:
  // a browser window, an iPad, an iPhone. Never so round it eats the screen.
  function gridMockupRadius(device, width) {
    if (device.id === 'tablet') return width * 0.042;
    if (device.id === 'phone') return width * 0.1;
    return width * (22 / device.frame);
  }

  // Card depth by level: 0 flush on the floor, 1 resting, 2.2 raised.
  function glideDepth(width, height, level) {
    const edgeBase = Math.max(8, width * 0.024);
    const rest = Math.min(1, level);
    const up = Math.max(0, level - 1) / 1.2;
    return {
      edge: Math.max(0, edgeBase * (rest + up * 0.8)),
      drop: 4 + 40 * rest + 34 * up,
      blur: 10 + 52 * rest + 30 * up,
      alpha: 0.1 + 0.08 * rest + 0.06 * up,
      scale: 0.982 + 0.018 * rest + 0.035 * up,
      lift: -height * (0.022 * rest + 0.05 * up) + height * 0.012 * (1 - rest),
    };
  }

  function glideDepthShadow(depth) {
    // a thin glass card floats: soft contact shadow + a long soft drop, never a solid slab edge
    return `0 ${(depth.edge * 0.6).toFixed(1)}px ${(depth.edge * 1.6).toFixed(1)}px rgba(28, 24, 20, 0.07), 0 ${depth.drop.toFixed(1)}px ${depth.blur.toFixed(1)}px -12px rgba(28, 24, 20, ${depth.alpha.toFixed(3)})`;
  }

  function applyMockupShape(node, device, width) {
    // the film's one device look (PROMO_DEVICE_SPEC): a thin frosted-glass frame
    const spec = PROMO_DEVICE_SPEC[device] || PROMO_DEVICE_SPEC.desktop;
    node.style.borderRadius = `${(spec.radius * width).toFixed(2)}px`;
    node.style.clipPath = '';
    node.style.overflow = 'hidden';
    node.style.border = `${Math.max(1, spec.bezel * width).toFixed(2)}px solid rgba(255, 255, 255, 0.62)`;
    node.style.background = 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(238, 234, 229, 0.6)) border-box';
    node.style.outline = '1px solid rgba(24, 24, 32, 0.09)';
    node.style.outlineOffset = '0px';
    node.style.boxShadow = glideDepthShadow(glideDepth(width, width, 1));
  }

  function glideElevationLevel(mode, age) {
    if (age == null || age < 0) return 1;
    if (mode === 'pitch') {
      // A click up: fast rise, small overshoot, settle high.
      const u = Math.min(1, age / 300);
      const rise = 1 - (1 - u) ** 3;
      const overshoot = Math.sin(u * Math.PI) * 0.18;
      return 1 + 1.2 * rise + overshoot;
    }
    // LOST presses the card flat, almost at once, and it stays down.
    const u = Math.min(1, age / 140);
    return 1 - (1 - (1 - u) ** 2);
  }

  function paintGlideElevation(node, cell, unit, mode, age, react = 0) {
    const width = cell.w * unit;
    const height = cell.h * unit;
    const level = glideElevationLevel(mode, age);
    const rounded = Math.round(level * 20) / 20;
    const widthKey = String(Math.round(width));
    if (node.dataset.elevation !== String(rounded) || node.dataset.elevationW !== widthKey) {
      node.dataset.elevation = String(rounded);
      node.dataset.elevationW = widthKey;
      const depth = glideDepth(width, height, rounded);
      node._depthShadow = glideDepthShadow(depth);
      node.style.boxShadow = node._depthShadow;
      node.dataset.cardScale = depth.scale.toFixed(4);
      node.dataset.cardLift = depth.lift.toFixed(2);
    }
    // A sold card sends one fine orange line out from its edge, which
    // drifts outward and fades: a hairline, not a band.
    const waveAge = mode === 'pitch' && age != null ? age : -1;
    if (waveAge >= 0 && waveAge < PROMO_SOLD_WAVE_MS) {
      const u = waveAge / PROMO_SOLD_WAVE_MS;
      const reach = width * 0.05 * (1 - (1 - u) ** 3);
      const alpha = 0.75 * (1 - u) ** 1.4;
      node.style.outline = `1.5px solid rgba(247, 162, 82, ${alpha.toFixed(3)})`;
      node.style.outlineOffset = `${reach.toFixed(1)}px`;
      node.dataset.waving = '1';
    } else if (node.dataset.waving === '1') {
      delete node.dataset.waving;
      node.style.outline = '1px solid rgba(24, 24, 32, 0.09)';
      node.style.outlineOffset = '0px';
    }
    const sold = mode === 'pitch';
    const r = Math.round(react * 50) / 50;
    const scale = (Number(node.dataset.cardScale || '1') * (1 + (sold ? 0.028 : -0.03) * r)).toFixed(4);
    const lift = (Number(node.dataset.cardLift) || 0) + (sold ? -0.035 : 0.03) * height * r;
    const filter = markReactFilter(sold ? 'sold' : 'lost', r);
    if (node.dataset.react !== String(r)) { node.dataset.react = String(r); node.style.filter = filter; }
    node.style.transformOrigin = 'center bottom';
    node.style.transform = `translate3d(${(cell.x * unit).toFixed(2)}px, ${(cell.y * unit + lift).toFixed(2)}px, 0) scale(${scale})`;
  }

  // The store reel (script#promo-store-reel): live recordings of the agent on
  // different stores, devices, avatars and modes, one vignette each.
  function loadStoreReel() {
    const node = document.getElementById('promo-store-reel');
    if (!node) return [];
    try {
      const parsed = JSON.parse(node.textContent || '[]');
      return Array.isArray(parsed) ? parsed.filter((item) => item && item.video) : [];
    } catch {
      return [];
    }
  }

  function loadPromoStores() {
    const node = document.getElementById('promo-opening-stores');
    if (!node) return [];
    try {
      const parsed = JSON.parse(node.textContent || '[]');
      return Array.isArray(parsed) ? parsed.filter((store) => store && store.slug) : [];
    } catch {
      return [];
    }
  }

  function landingStoreIndex(stores) {
    if (!stores.length) return 0;
    const raw = (promoSearchParams().get('store') || 'meridian').trim().toLowerCase();
    const match = stores.findIndex((store) => store.slug === raw);
    if (match >= 0) return match;
    const meridian = stores.findIndex((store) => store.slug === 'meridian');
    return meridian >= 0 ? meridian : 0;
  }

  function loopLandingOrder(stores) {
    const count = stores.length;
    if (count < 2) return { stores, landIndex: 0 };
    const selected = landingStoreIndex(stores);
    const landIndex = count - 2;
    const shift = (selected - landIndex + count) % count;
    return {
      stores: stores.map((_, index) => stores[(index + shift) % count]),
      landIndex,
    };
  }

  function loopDistance(index, active, count) {
    if (count < 2) return index - active;
    let distance = index - active;
    distance = ((distance % count) + count) % count;
    if (distance > count / 2) distance -= count;
    return distance;
  }

  function mixAccent(from, to, amount) {
    const parse = (hex) => {
      const raw = String(hex || '').replace('#', '');
      if (!/^[0-9a-fA-F]{6}$/.test(raw)) return [249, 163, 83];
      return [
        parseInt(raw.slice(0, 2), 16),
        parseInt(raw.slice(2, 4), 16),
        parseInt(raw.slice(4, 6), 16),
      ];
    };
    const start = parse(from);
    const end = parse(to);
    const blend = Math.min(1, Math.max(0, amount));
    const channel = (index) => Math.round(start[index] + (end[index] - start[index]) * blend);
    return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
  }

  function storeInk(accent) {
    const hex = String(accent || '').replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
      return accent || getComputedStyle(document.documentElement).getPropertyValue('--color-fg').trim();
    }
    const red = parseInt(hex.slice(0, 2), 16);
    const green = parseInt(hex.slice(2, 4), 16);
    const blue = parseInt(hex.slice(4, 6), 16);
    const luma = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
    if (luma < 0.72) return `#${hex}`;
    const mix = 0.42;
    const channel = (value) => Math.round(value * (1 - mix)).toString(16).padStart(2, '0');
    return `#${channel(red)}${channel(green)}${channel(blue)}`;
  }

  function waveSample(elapsed) {
    if (elapsed < 0) return { amount: 0, travel: 0, presence: 0 };
    const u = Math.min(1, elapsed / PROMO_SEE_WAVE_MS);
    const edge = 0.1;
    let presence = 1;
    if (u < edge) presence = u / edge;
    else if (u > 1 - edge) presence = (1 - u) / edge;
    const phase = u * Math.PI * 4;
    return {
      amount: Math.abs(Math.sin(phase)),
      travel: (Math.sin(phase) + 1) / 2,
      presence,
    };
  }

  function glideEase(linear) {
    const t = Math.min(1, Math.max(0, linear));
    return t * t * (3 - 2 * t);
  }

  function smoothstep(t) {
    const x = Math.min(1, Math.max(0, t));
    return x * x * (3 - 2 * x);
  }

  function easeCap(value, max, span) {
    const start = max - span;
    if (value <= start) return value;
    const end = max + span;
    if (value >= end) return max;
    const blend = smoothstep((value - start) / (end - start));
    return value * (1 - blend) + max * blend;
  }

  function wheelYaw(abs) {
    return easeCap(abs * PROMO_WHEEL_YAW_DEG, PROMO_WHEEL_MAX_YAW_DEG, 6);
  }

  function wheelDepth(abs) {
    return easeCap(abs * PROMO_WHEEL_DEPTH_PX, PROMO_WHEEL_MAX_DEPTH_PX, 140);
  }

  function wheelScale(abs) {
    const drop = 1 - PROMO_WHEEL_NEIGHBOR_SCALE;
    if (abs <= 1) return 1 - drop * smoothstep(abs);
    const far = smoothstep(Math.min(1, abs - 1));
    return PROMO_WHEEL_NEIGHBOR_SCALE * (1 - (1 - PROMO_WHEEL_FAR_SCALE) * far);
  }

  function wheelFade(abs) {
    const start = 1;
    const end = 1.4;
    if (abs <= start) return 1;
    if (abs >= end) return 0;
    return 1 - smoothstep((abs - start) / (end - start));
  }

  function wheelFocus(abs) {
    const start = PROMO_WHEEL_SELECT_AT - PROMO_WHEEL_SELECT_SPAN / 2;
    const end = PROMO_WHEEL_SELECT_AT + PROMO_WHEEL_SELECT_SPAN / 2;
    if (abs <= start) return 1;
    if (abs >= end) return 0;
    return 1 - smoothstep((abs - start) / (end - start));
  }

  function storeImageUrls(store) {
    if (!store) return [];
    return [store.hero, store.logo, store.stamp].filter(Boolean);
  }

  function storeModelUrls(stores) {
    const urls = new Set([PROMO_BIZMIS_AVATAR_MODEL_URL]);
    (stores || []).forEach((store) => {
      if (store && store.model) urls.add(store.model);
    });
    return [...urls];
  }

  function preloadAvatarModels(urls) {
    const started = Date.now();
    return new Promise((resolve) => {
      const tick = () => {
        const api = window.AvatarVoicechat;
        if (api && typeof api.preloadAvatars === 'function') {
          api.preloadAvatars(urls).then(() => resolve()).catch(() => resolve());
          return;
        }
        if (Date.now() - started > 20000) {
          Promise.all(urls.map((url) => fetch(url, { mode: 'cors', cache: 'force-cache' })
            .then((response) => response.arrayBuffer())
            .catch(() => { }))).then(() => resolve());
          return;
        }
        window.setTimeout(tick, 80);
      };
      tick();
    });
  }

  function preloadPromoImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      const done = () => resolve();
      img.onload = () => {
        if (typeof img.decode === 'function') {
          img.decode().then(done).catch(done);
          return;
        }
        done();
      };
      img.onerror = done;
      img.src = url;
    });
  }

  function preloadPromoVideo(url) {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.muted = true;
      video.defaultMuted = true;
      video.preload = 'auto';
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      glideWarmMedia.push(video);
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        resolve();
      };
      video.addEventListener('canplaythrough', done, { once: true });
      video.addEventListener('error', done, { once: true });
      window.setTimeout(done, 12000);
      video.src = url;
    });
  }

  function glidePreloadFrame() {
    const width = Math.round(window.innerWidth || 0);
    const height = Math.round(window.innerHeight || 0);
    if (width >= 40 && height >= 40) return { width, height };
    return { width: 1440, height: 810 };
  }

  function glideSeaStills(frame) {
    const urls = new Set();
    const leadKey = glideLeadCell(frame)?.key;
    ['pain', 'pitch'].forEach((mode) => {
      const end = glidePlayEnd(mode);
      for (let time = 0; time <= end; time += 40) {
        const view = glideCells(time, frame, mode);
        view.cells.forEach((cell) => {
          const tone = mode === 'pitch' ? 'pitch' : 'pain';
          const chat = glideChat(cell, mode, leadKey);
          const url = glideStillSrc(tone, cell.id, glideMotion(cell, mode), chat, glideLook(cell, mode));
          if (url) urls.add(url);
        });
      }
      glideEvents(mode, frame);
    });
    return urls;
  }

  function preloadDecodedStill(url) {
    if (!url) return Promise.resolve();
    if (glideDecodedStills.has(url)) return Promise.resolve();
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'sync';
      const finish = () => {
        if (img.naturalWidth) glideDecodedStills.set(url, img);
        resolve();
      };
      img.onload = () => {
        if (typeof img.decode === 'function') img.decode().then(finish).catch(finish);
        else finish();
      };
      img.onerror = () => resolve();
      img.src = url;
    });
  }

  function inlineRasterTree(source, target) {
    if (!(source instanceof Element) || !(target instanceof Element)) return;
    const computed = getComputedStyle(source);
    let css = '';
    for (let index = 0; index < computed.length; index += 1) {
      const prop = computed.item(index);
      if (prop === 'backdrop-filter' || prop === '-webkit-backdrop-filter') continue;
      if (prop.startsWith('animation') || prop.startsWith('transition')) continue;   // a raster is a still: never replay the store's animations inside it
      let value = computed.getPropertyValue(prop);
      if (value.includes('url(') && !value.includes('data:')) value = 'none';
      css += `${prop}:${value};`;
    }
    target.setAttribute('style', `${css}animation:none;transition:none;`);
    if (source instanceof HTMLCanvasElement) {
      const img = document.createElement('img');
      img.setAttribute('style', css);
      try {
        img.src = source.toDataURL('image/png');
      } catch (error) {
        return;
      }
      target.replaceWith(img);
      return;
    }
    const count = Math.min(source.children.length, target.children.length);
    for (let index = 0; index < count; index += 1) {
      inlineRasterTree(source.children[index], target.children[index]);
    }
  }

  function rasterImageUrl(img) {
    if (!img.naturalWidth) return img.currentSrc || img.src || '';
    const scratch = document.createElement('canvas');
    scratch.width = img.naturalWidth;
    scratch.height = img.naturalHeight;
    const ctx = scratch.getContext('2d');
    if (!ctx) return img.currentSrc || img.src || '';
    try {
      ctx.drawImage(img, 0, 0);
      return scratch.toDataURL('image/png');
    } catch (error) {
      return img.currentSrc || img.src || '';
    }
  }

  async function rasterStore(node) {
    const rect = node.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    if (width < 8 || height < 8) return '';
    const clone = node.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
    clone.querySelectorAll('.promo-close__veil, .promo-close__mark, .promo-glide__veil, .promo-glide__mark, .promo-glide__lost-mark, .promo-close__lost-mark').forEach((veil) => veil.remove());
    inlineRasterTree(node, clone);
    clone.style.transform = 'none';
    clone.style.position = 'relative';
    clone.style.inset = 'auto';
    clone.style.left = '0';
    clone.style.top = '0';
    clone.style.margin = '0';
    clone.style.width = `${width}px`;
    clone.style.height = `${height}px`;
    const liveImages = [...node.querySelectorAll('img')];
    const cloneImages = [...clone.querySelectorAll('img')];
    liveImages.forEach((img, index) => {
      const dest = cloneImages[index];
      if (dest) dest.setAttribute('src', rasterImageUrl(img));
    });
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('class', 'promo-glide__raster');
    const foreign = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    foreign.setAttribute('x', '0');
    foreign.setAttribute('y', '0');
    foreign.setAttribute('width', String(width));
    foreign.setAttribute('height', String(height));
    foreign.append(clone);
    svg.append(foreign);
    return svg;
  }

  function paintLeadRaster(node, svg) {
    if (!node || !svg) return;
    if (svg.parentElement !== node) node.append(svg);
    const still = node.querySelector(':scope > .promo-glide__still');
    if (still) still.style.visibility = 'hidden';
  }

  function paintGlideStill(canvas, url, cssW, cssH, pain, fill) {
    const img = glideDecodedStills.get(url);
    if (!canvas || !img || !img.naturalWidth || cssW < 2 || cssH < 2) return;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(cssW * dpr));
    const h = Math.max(1, Math.round(cssH * dpr));
    const key = `${url}|${w}x${h}|${pain ? 'pain' : 'pitch'}|${fill ? 'fill' : 'cover'}`;
    if (canvas.dataset.paint === key) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    canvas.dataset.paint = key;
    canvas.dataset.src = url;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    if (pain) ctx.filter = 'grayscale(1) sepia(0.1) hue-rotate(-12deg)';   // = --promo-pain-filter: warm grey, not blue-grey
    if (fill) {
      ctx.drawImage(img, 0, 0, w, h);
    } else {
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    }
    ctx.filter = 'none';
  }

  function preloadGlideMedia() {
    const urls = [...glideSeaStills(glidePreloadFrame())];
    const size = 8;
    const chunks = [];
    for (let index = 0; index < urls.length; index += size) {
      chunks.push(urls.slice(index, index + size));
    }
    return chunks.reduce(
      (chain, chunk) => chain.then(() => Promise.all(chunk.map((url) => preloadDecodedStill(url)))),
      Promise.resolve(),
    );
  }

  // The film's type (the v2 landing's): Inter for all copy, Caveat for the handwritten lines.
  // Every face is loaded before is-promo-ready, so no exported frame shows a fallback font.
  const PROMO_FONT_FACES = [
    '400 32px Inter', '500 32px Inter', '600 32px Inter', '700 32px Inter', '800 32px Inter',
    '600 48px Caveat', '700 48px Caveat',
  ];
  function preloadPromoFonts() {
    if (!document.fonts || typeof document.fonts.load !== 'function') return Promise.resolve();
    ensureInviteFont();
    const sheet = document.getElementById('promo-invite-font');
    const sheetReady = sheet && !sheet.sheet
      ? new Promise((resolve) => { sheet.addEventListener('load', resolve, { once: true }); sheet.addEventListener('error', resolve, { once: true }); })
      : Promise.resolve();
    const loads = () => Promise.all(PROMO_FONT_FACES.map((face) => document.fonts.load(face).catch(() => null)));
    const timeout = new Promise((resolve) => { window.setTimeout(resolve, 8000); });
    return Promise.race([sheetReady.then(loads).then(() => document.fonts.ready), timeout]);
  }

  function preloadPromoOpening(stores) {
    const images = new Set();
    (stores || []).forEach((store) => {
      storeImageUrls(store).forEach((url) => images.add(url));
    });
    return Promise.all([
      ...[...images].map((url) => preloadPromoImage(url)),
      preloadAvatarModels(storeModelUrls(stores)),
      preloadGlideMedia(),
      preloadPromoFonts(),
    ]);
  }

  function renderStoreCarousel(row, stores) {
    if (row) row.replaceChildren();
    const viewport = document.createElement('div');
    viewport.className = 'promo-opening__carousel';
    const track = document.createElement('div');
    track.className = 'promo-opening__carousel-track';
    track.style.setProperty(
      '--promo-wheel-overlap',
      `calc(${PROMO_WHEEL_NEIGHBOR_PULL} * min(36rem, 62cqw) + ${PROMO_WHEEL_TUCK_PX}px)`,
    );
    (stores || []).forEach((store) => {
      const accent = store.accent || getComputedStyle(document.documentElement).getPropertyValue('--color-fg').trim();
      const slide = document.createElement('article');
      slide.className = 'promo-opening__slide';
      slide.dataset.store = store.slug;
      slide.style.setProperty('--promo-store-accent', accent);
      const meta = document.createElement('header');
      meta.className = 'promo-opening__slide-meta';
      const ink = storeInk(accent);
      const sector = document.createElement('p');
      sector.className = 'promo-opening__slide-sector';
      sector.style.color = ink;
      sector.textContent = store.sector || '';
      const name = document.createElement('p');
      name.className = 'promo-opening__slide-name';
      name.textContent = store.name || '';
      meta.append(sector, name);
      const card = document.createElement('div');
      card.className = 'promo-opening__slide-card';
      const glow = document.createElement('span');
      glow.className = 'promo-opening__slide-glow';
      let hero;
      if (store.video) {
        hero = document.createElement('video');
        hero.className = 'promo-opening__slide-hero promo-opening__slide-video';
        hero.muted = true;
        hero.playsInline = true;
        hero.preload = 'auto';
        hero.poster = store.hero || '';
        hero.dataset.promoStart = String(store.videoStart || 0);
        hero.dataset.promoIdle = '1';
        // Park the clip on its first frame so the card never flashes the poster.
        hero.addEventListener('loadedmetadata', () => {
          try {
            hero.currentTime = Number(hero.dataset.promoStart) || 0;
          } catch {
            /* seek again when the store comes up */
          }
        }, { once: true });
        hero.src = store.video;
      } else {
        hero = document.createElement('img');
        hero.className = 'promo-opening__slide-hero';
        hero.alt = '';
        hero.src = store.hero || '';
      }
      card.append(glow, hero);
      slide.append(meta, card);
      track.appendChild(slide);
    });
    if (row) {
      viewport.appendChild(track);
      row.appendChild(viewport);
    }
    mountNakedCta(row);
    mountWaveField(row);
    return track;
  }

  function mountWaveField(row) {
    if (!row || row.querySelector('.promo-opening__wave-field')) return;
    const field = document.createElement('div');
    field.className = 'promo-opening__wave-field';
    field.setAttribute('aria-hidden', 'true');
    const ambient = document.createElement('div');
    ambient.className = 'promo-opening__wave-ambient';
    field.append(ambient);
    row.prepend(field);
  }

  function seeCtaCopy() {
    return PROMO_END_CTA[promoVideoConfig.cta] || null;
  }

  function mountNakedCta(row) {
    const copy = seeCtaCopy();
    if (!row || !copy || promoVideoConfig.cta === 'demo') return;
    if (row.querySelector('.promo-opening__naked-cta')) return;
    const cta = document.createElement('div');
    cta.className = 'promo-opening__naked-cta';
    if (copy.scarcity) {
      const note = document.createElement('p');
      note.className = 'promo-opening__see-note';
      note.textContent = copy.scarcity;
      cta.append(note);
    }
    const button = document.createElement('span');
    button.className = 'promo-opening__see-button';
    button.textContent = copy.label;
    const cursor = document.createElement('span');
    cursor.className = 'promo-opening__see-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.innerHTML = PROMO_MAC_POINTER;
    cta.append(button, cursor);
    if (copy.url) {
      const url = document.createElement('p');
      url.className = 'promo-opening__see-url';
      url.textContent = copy.url;
      cta.append(url);
    }
    row.append(cta);
  }

  function hasPromoCover() {
    return document.body.classList.contains('template-index')
      && promoVideo !== 'opening'
      && promoSearchParams().get('nocover') !== '1';
  }

  function whenImageReady(img) {
    if (!img) return Promise.resolve();
    if (img.complete && img.naturalWidth) return Promise.resolve();
    return new Promise((resolve) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    });
  }

  class PromoOpening {
    constructor(root, onStoreReady) {
      this.root = root;
      this.onStoreReady = onStoreReady;
      this.toggle = root.querySelector('[data-promo-opening-toggle]');
      this.knob = root.querySelector('.promo-opening__knob');
      this.line = root.querySelector('[data-promo-pitch-line]');
      this.storesRow = root.querySelector('[data-promo-stores]');
      const loop = loopLandingOrder(loadPromoStores());
      this.stores = loop.stores;
      this.carouselTrack = renderStoreCarousel(this.storesRow, this.stores);
      this.landIndex = loop.landIndex;
      this.assetsReady = false;
      this.flipWhenReady = false;
      this.flipping = false;
      this.parkedEmbed = null;
      this.parkedParent = null;
      this.parkedNext = null;
      this.parkedStyle = null;
      this.parkTimer = 0;
      this.glideFrame = 0;
      this.planeFrame = 0;
      this.glideStats = null;
      this.clerkGlow = this.ensureClerkGlow();
      this.camera = this.ensureCamera();
      window.__promoGlideProbe = () => this.glideProbe();
      window.__promoOpening = this;   // dev: drive single scenes from the console
      this.boundDock = () => this.fitOpeningLayout();
      this.toggle?.addEventListener('click', () => this.flip());
      promoWidget.preloadStoreStamps(this.stores);
      preloadPromoOpening(this.stores).then(() => this.finishBoot());
      this.armAutoFlip();
    }

    finishBoot() {
      if (this.assetsReady) return;
      this.assetsReady = true;
      document.documentElement.classList.add('is-promo-ready');
      if (promoBootParams.get('export') === '1') {
        window.__promoExportBoot = () => {
          if (marketingPart() === 'cta') {
            this.playEndCard();
            return;
          }
          if (marketingPart() === 'sync' || marketingPart() === 'reel') {
            const ended = () => { window.__promoExportEnded = true; };
            this.playReelDev(marketingPart() === 'reel').then(ended, ended);
            return;
          }
          if (marketingPart().startsWith('climax-')) {
            const ended = () => { window.__promoExportEnded = true; };
            this.playClimaxDev(marketingPart().slice(7)).then(ended, (error) => { console.error(error); ended(); });
            return;
          }
          if (marketingPart() === 'pitch') {
            this.flip();
            return;
          }
          const playing = this.playPain();
          if (marketingPart() === 'pain') {
            Promise.resolve(playing).then(
              () => { window.__promoExportEnded = true; },
              () => { window.__promoExportEnded = true; },
            );
          }
        };
        return;
      }
      if (this.flipWhenReady) {
        this.flip();
        return;
      }
      if (readPromoClip()) {
        this.showClip();
        return;
      }
      if (marketingPart() === 'cta') {
        this.playEndCard();
        return;
      }
      if (marketingPart() === 'reel') {
        window.setTimeout(() => this.playStoreReel(loadStoreReel()), 1500);
        return;
      }
      if (marketingPart() === 'sync') {
        window.setTimeout(() => this.playReelDev(false), 1500);
        return;
      }
      if (marketingPart().startsWith('climax-')) {
        window.setTimeout(() => this.playClimaxDev(marketingPart().slice(7)), 1500);
        return;
      }
      if (marketingPart() !== 'pitch') this.playPain();
    }

    armAutoFlip() {
      if (marketingPart() !== 'pitch') return;
      const raw = promoSearchParams().get('auto');
      if (raw == null || raw === '') return;
      const autoMs = Number(raw);
      if (!Number.isFinite(autoMs) || autoMs < 0) return;
      this.autoTimer = window.setTimeout(() => this.flip(), autoMs);
    }

    canvasFrame() {
      const frame = this.root.querySelector('[data-promo-canvas]');
      if (!frame) return { left: 0, top: 0 };
      return frame.getBoundingClientRect();
    }

    // "Sales agent" charges up while the narrator builds to "So we built it!".
    chargeSwitch(take) {
      if (prefersReducedMotion()) return;
      const t0 = performance.now();
      let end = t0 + 6000;
      take.at('built one').then(() => { end = performance.now(); });   // v13 (W1): "Salesperson" is fully lit as "So we built one" is said
      const step = (now) => {
        if (this.root.classList.contains('is-on')) {
          this.root.style.removeProperty('--switch-charge');
          this.root.classList.remove('is-charged');
          return;
        }
        const u = Math.min(1, (now - t0) / Math.max(1, end - t0));
        this.root.style.setProperty('--switch-charge', (u * u).toFixed(3));
        this.root.classList.toggle('is-charged', u > 0.78);
        window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    }

    // The flip lands like a hit: the knob snaps and overshoots, one clean
    // flash ring, and the whole picture punches in.
    playFlipPop() {
      if (!this.knob || prefersReducedMotion()) return;
      const canvas = this.root.querySelector('[data-promo-canvas]') || this.root;
      const frame = canvas.getBoundingClientRect();
      const fit = canvas.clientWidth / (frame.width || 1);
      const box = this.knob.getBoundingClientRect();
      const pop = document.createElement('div');
      pop.className = 'promo-flippop';
      pop.style.left = `${((box.left + box.width / 2 - frame.left) * fit).toFixed(1)}px`;
      pop.style.top = `${((box.top + box.height / 2 - frame.top) * fit).toFixed(1)}px`;
      pop.style.setProperty('--pop-size', `${(box.width * fit).toFixed(1)}px`);
      pop.innerHTML = '<span class="promo-flippop__flash"></span><span class="promo-flippop__ring"></span>';
      this.camera?.classList.add('is-punch');
      window.setTimeout(() => this.camera?.classList.remove('is-punch'), 420);
      canvas.appendChild(pop);
      this.root.classList.add('is-knob-pop');
      promoSfx('flip-pop');
      window.setTimeout(() => {
        pop.remove();
        this.root.classList.remove('is-knob-pop');
      }, 1100);
    }

    pinKnobOrigin() {
      if (!this.knob) return;
      const rect = this.knob.getBoundingClientRect();
      const frame = this.canvasFrame();
      this.root.style.setProperty('--promo-knob-x', `${rect.left + rect.width / 2 - frame.left}px`);
      this.root.style.setProperty('--promo-knob-y', `${rect.top + rect.height / 2 - frame.top}px`);
    }

    fitOpeningType() {
      if (this.line) this.line.style.fontSize = '';
    }

    fitClerk() {
      if (this.clerkCornerActive) return;
      const embed = this.parkedEmbed || document.getElementById('bizmis-avatar-embed');
      if (!embed || !embed.classList.contains('is-promo-widget-parked')) return;
      embed.style.setProperty('--promo-avatar-scale', String(PROMO_AVATAR_MAX_SCALE));
      embed.style.setProperty('--promo-avatar-lift', `${PROMO_AVATAR_LIFT_PX}px`);
    }

    seatRevealPair() {
      const line = this.root.querySelector('[data-promo-pitch-line]');
      const reveal = line.classList.contains('is-revealing')
        && !this.root.classList.contains('is-moments')
        && !this.root.classList.contains('is-see')
        && !this.clerkCornerActive;
      if (!line || !reveal) {
        if (line) line.style.transform = '';
        this.root.style.removeProperty('--promo-reveal-right');
        return;
      }
      line.style.transform = '';
      const frame = this.root.getBoundingClientRect();
      const words = [...line.querySelectorAll('.promo-opening__word')];
      let textLeft = Infinity;
      let textRight = -Infinity;
      words.forEach((word) => {
        const box = word.getBoundingClientRect();
        if (box.width < 1 || box.height < 1) return;
        textLeft = Math.min(textLeft, box.left);
        textRight = Math.max(textRight, box.right);
      });
      const textWidth = textRight - textLeft;
      if (frame.width < 40 || textWidth < 40 || !Number.isFinite(textLeft)) return;
      const boxW = PROMO_AVATAR_BOX_W * PROMO_AVATAR_MAX_SCALE;
      const avatarW = boxW * PROMO_REVEAL_BODY;
      // The avatar stays where it stood beside the logo; the line fits to
      // its left. Without a logo seat yet, the pair centers as a group.
      const pairRight = parseFloat(this.root.style.getPropertyValue('--promo-logo-pair-right'));
      let widgetRight;
      let visibleLeft;
      if (Number.isFinite(pairRight)) {
        widgetRight = pairRight;
        visibleLeft = frame.right - widgetRight - boxW / 2 - avatarW / 2 + PROMO_REVEAL_BODY_SHIFT_PX;
      } else {
        const group = textWidth + PROMO_REVEAL_GAP_PX + avatarW;
        visibleLeft = frame.left + Math.max(0, (frame.width - group) / 2) + textWidth + PROMO_REVEAL_GAP_PX;
        widgetRight = frame.right - visibleLeft - boxW / 2 - avatarW / 2 + PROMO_REVEAL_BODY_SHIFT_PX;
      }
      const shift = visibleLeft - PROMO_REVEAL_GAP_PX - textWidth - textLeft;
      line.style.transform = `translateX(${shift.toFixed(1)}px)`;
      this.root.style.setProperty('--promo-reveal-right', `${widgetRight.toFixed(1)}px`);
    }

    fitOpeningLayout() {
      this.fitOpeningType();
      this.fitClerk();
      this.seatRevealPair();
      this.dockLogo();
      const board = this.root.querySelector('.promo-moments__board.is-pose-grid');
      if (board && this.root.classList.contains('is-moments')) layoutStoreGrid(board);
    }

    dockLogo() {
      const logo = this.root.querySelector('.promo-opening__logo');
      const target = this.root.querySelector('[data-promo-logo-target]');
      if (!logo || !target) return;

      const to = target.getBoundingClientRect();
      if (to.width < 4 || to.height < 4) return;
      const frame = this.canvasFrame();
      const line = this.root.querySelector('.promo-opening__line');
      const pairing = this.root.classList.contains('is-pitch')
        && !this.root.classList.contains('is-moments')
        && !this.root.classList.contains('is-see')
        && !line?.classList.contains('is-revealing');
      let logoLeft = to.left + to.width / 2 - frame.left;
      if (pairing) {
        const boxW = PROMO_AVATAR_BOX_W * PROMO_AVATAR_MAX_SCALE;
        const avatarW = boxW * PROMO_REVEAL_BODY;
        const gap = 36;
        const group = to.width + gap + avatarW;
        const groupLeft = frame.left + Math.max(0, (frame.width - group) / 2);
        logoLeft = groupLeft + to.width / 2 - frame.left;
        const visibleLeft = groupLeft + to.width + gap;
        const widgetRight = frame.right - visibleLeft - boxW / 2 - avatarW / 2 + PROMO_REVEAL_BODY_SHIFT_PX;
        this.root.style.setProperty('--promo-logo-pair-right', `${widgetRight.toFixed(1)}px`);
      } else if (!line?.classList.contains('is-revealing')) {
        // Kept through the line reveal, so the avatar does not move.
        this.root.style.removeProperty('--promo-logo-pair-right');
      }

      this.root.style.setProperty('--promo-logo-left', `${logoLeft}px`);
      this.root.style.setProperty('--promo-logo-top', `${to.top + to.height / 2 - frame.top}px`);
      this.root.style.setProperty('--promo-logo-w', `${to.width}px`);
      this.root.style.setProperty('--promo-logo-h', `${to.height}px`);
      this.root.classList.add('is-logo-docked');
    }

    parkWidget() {
      if (this.parkedEmbed) return;
      const slot = this.root.querySelector('[data-promo-widget]');
      const embed = document.getElementById('bizmis-avatar-embed');
      if (!slot || !embed) return;

      this.parkedEmbed = embed;
      this.parkedParent = embed.parentNode;
      this.parkedNext = embed.nextSibling;
      this.parkedStyle = embed.getAttribute('style');
      embed.removeAttribute('style');
      embed.classList.add('is-promo-widget-parked');
      slot.appendChild(embed);
      this.fitClerk();
    }

    restoreWidget() {
      window.clearTimeout(this.parkTimer);
      const embed = this.parkedEmbed;
      if (embed && this.parkedParent) {
        this.parkedParent.insertBefore(embed, this.parkedNext);
        if (this.parkedStyle != null) embed.setAttribute('style', this.parkedStyle);
        else embed.removeAttribute('style');
        embed.classList.remove('is-promo-widget-parked');
      }
      this.parkedEmbed = null;
      this.parkedParent = null;
      this.parkedNext = null;
      this.parkedStyle = null;
    }

    armPark() {
      let tries = 0;
      const run = () => {
        this.parkWidget();
        tries += 1;
        if (!this.parkedEmbed && tries < 40) this.parkTimer = window.setTimeout(run, 80);
      };
      run();
    }

    startOpeningClock() {
      if (!PROMO_OPENING_CLOCK) return;
      if (this.root.querySelector('[data-promo-clock]')) return;
      const node = document.createElement('div');
      node.className = 'promo-opening__clock';
      node.setAttribute('data-promo-clock', '');
      node.setAttribute('aria-hidden', 'true');
      const frame = this.root.querySelector('[data-promo-canvas]') || this.root;
      frame.appendChild(node);
      const started = performance.now();
      const paint = () => {
        if (!node.isConnected || node.hidden) return;
        const elapsed = performance.now() - started;
        const seconds = Math.floor(elapsed / 1000);
        const millis = Math.floor(elapsed % 1000);
        node.textContent = `${seconds}.${String(millis).padStart(3, '0')}`;
        window.requestAnimationFrame(paint);
      };
      window.requestAnimationFrame(paint);
    }

    flip() {
      if (this.flipping) return;
      if (!this.assetsReady) {
        this.flipWhenReady = true;
        return;
      }
      this.flipping = true;
      window.clearTimeout(this.autoTimer);
      if (this.toggle) {
        this.toggle.setAttribute('aria-pressed', 'true');
        this.toggle.disabled = true;
      }

      if (prefersReducedMotion()) {
        this.showReducedSee();
        return;
      }

      this.pinKnobOrigin();
      promoSfx('toggle');
      this.root.classList.add('is-on');
      window.setTimeout(() => this.playFlipPop(), PROMO_FLIP_KNOB_MS);
      this.startOpeningClock();
      // v10: the knob itself becomes the orange field. It warms to orange,
      // grows from its own size until it fills the frame, and the logo
      // resolves on it (no giant ghost label).
      window.setTimeout(() => {
        this.root.classList.add('is-cleared', 'is-knob-fill');
        this.pinKnobOrigin();
        const fill = this.root.querySelector('.promo-opening__fill--orange');
        const knob = this.knob?.getBoundingClientRect();
        const frame = this.canvasFrame();
        if (fill && knob?.width) fill.style.setProperty('--promo-knob-s', (knob.width / Math.max(1, fill.offsetWidth || frame.width * 2.8)).toFixed(4));
        this.fadeSwitchLabel();
        const chips = this.root.querySelector('.promo-switch-moments');
        if (chips) fadeStep(chips, 1, 0, 200);
        window.setTimeout(() => this.burst(), PROMO_KNOB_WARM_MS);
      }, PROMO_FLIP_KNOB_MS + PROMO_FLIP_POP_HOLD_MS);   // the pop lands on the switch before it clears
    }

    centerSwitchLabel() {
      const label = this.root.querySelector('.promo-opening__choice--right');
      const stage = this.root.querySelector('.promo-opening__center');
      if (!label || !stage) return;
      label.style.transform = 'none';
      const labelRect = label.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const dx = (stageRect.left + stageRect.width / 2) - (labelRect.left + labelRect.width / 2);
      const dy = (stageRect.top + stageRect.height / 2) - (labelRect.top + labelRect.height / 2);
      this.switchLabelShift = { dx, dy };
      label.style.transform = `translate(${dx}px, ${dy}px) scale(1)`;
    }

    scaleSwitchLabel(scale = PROMO_SWITCH_SCALE) {
      const label = this.root.querySelector('.promo-opening__choice--right');
      if (!label) return;
      if (!this.switchLabelShift) this.centerSwitchLabel();
      const { dx, dy } = this.switchLabelShift;
      if (label.style.transition !== 'none') {
        label.style.transition = `transform ${PROMO_SWITCH_GROW_MS}ms linear, opacity ${PROMO_SWITCH_FADE_MS}ms linear`;
      }
      label.style.transform = `translate(${dx}px, ${dy}px) scale(${scale * PROMO_SWITCH_LABEL_GAIN})`;
    }

    pinLabelOrigin() {
      const label = this.root.querySelector('.promo-opening__choice--right');
      if (!label) {
        this.pinKnobOrigin();
        return;
      }
      const rect = label.getBoundingClientRect();
      const frame = this.canvasFrame();
      this.root.style.setProperty('--promo-knob-x', `${rect.left + rect.width / 2 - frame.left}px`);
      this.root.style.setProperty('--promo-knob-y', `${rect.top + rect.height / 2 - frame.top}px`);
    }

    burst() {
      promoSfx('burst');
      if (!this.root.classList.contains('is-knob-fill')) this.pinLabelOrigin();
      else {
        // the knob's fill, stepped per frame (a class transition was never sampled by the export clock)
        const fill = this.root.querySelector('.promo-opening__fill--orange');
        const k0 = Number(fill?.style.getPropertyValue('--promo-knob-s')) || 0.01;
        if (fill) {
          fill.style.transition = 'none';
          const t0 = performance.now();
          const step = (now) => {
            const u = Math.min(1, (now - t0) / PROMO_FLIP_BURST_MS);
            const e = u < 0.5 ? 4 * u * u * u : 1 - ((-2 * u + 2) ** 3) / 2;
            fill.style.transform = `scale(${(k0 + (1 - k0) * e).toFixed(4)})`;
            if (u < 1) window.requestAnimationFrame(step);
            else { fill.style.transform = ''; fill.style.transition = ''; }
          };
          fill.style.transform = `scale(${k0.toFixed(4)})`;
          window.requestAnimationFrame(step);
        }
      }
      this.root.classList.add('is-bursting');
      tweenAdWarmth();
      window.setTimeout(() => {
        this.root.classList.add('is-switch-white');
      }, PROMO_SWITCH_WHITE_AT_MS);
      window.setTimeout(() => this.fadeSwitchLabel(), PROMO_SWITCH_FADE_AT_MS);
      window.setTimeout(() => this.hold(), PROMO_FLIP_BURST_MS);
    }

    fadeSwitchLabel() {
      const label = this.root.querySelector('.promo-opening__choice--right');
      if (!label) return;
      label.style.opacity = '0';
    }

    hold() {
      this.root.classList.add('is-holding');
      window.setTimeout(() => this.pitch(), PROMO_FLIP_HOLD_MS);
    }

    async pitch() {
      promoSfx('logo-in');
      window.setTimeout(() => promoSfx('appear'), PROMO_LOGO_DOCK_MS);
      this.revealTake = speakTake('t-reveal');
      document.documentElement.style.setProperty('--ad-warmth', '1');
      this.releasePainStage();
      document.documentElement.classList.add('is-promo-pitch');
      this.root.classList.add('is-pitch');
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => this.fitOpeningLayout());
      });
      window.addEventListener('resize', this.boundDock);
      this.armPark();
      window.setTimeout(() => {
        document.documentElement.classList.add('is-promo-clerk');
        // the clerk springs in (it used to appear at full size in one frame)
        const arriving = [...document.querySelectorAll('[id="bizmis-avatar-embed"]')].find((node) => !node.closest('svg'))?.closest('[data-promo-widget]');
        arriving?.classList.add('is-arriving');
        window.setTimeout(() => arriving?.classList.remove('is-arriving'), 900);
        armOpeningWave();
      }, PROMO_LOGO_DOCK_MS);
      // the headline writes in as the narrator says it ("Your store's new salesperson"),
      // the logo leaving just as it does: no empty beat between them
      Promise.all([waitMs(PROMO_LOGO_DOCK_MS + PROMO_PITCH_LOGO_HOLD_MS), this.revealTake.at('Your store', 'start', -380)]).then(() => {
        this.root.classList.add('is-logo-leaving');
        window.setTimeout(() => this.playPitchLine(), 300);   // starts as the logo is nearly gone: no empty frame, no overlap
      });
    }

    playHeroWords(toFace, onDone) {
      const words = toFace ? [...toFace.querySelectorAll('[data-promo-to-word]')] : [];
      if (!words.length) {
        onDone();
        return;
      }

      let index = 0;
      const showWord = () => {
        const word = words[index];
        word.classList.add('is-in');
        const isLast = index === words.length - 1;
        if (isLast) {
          window.setTimeout(onDone, PROMO_PITCH_HERO_IN_MS + PROMO_PITCH_SELL_HOLD_MS);
          return;
        }
        window.setTimeout(() => {
          word.classList.remove('is-in');
          word.classList.add('is-out');
          index += 1;
          window.setTimeout(
            showWord,
            Math.max(0, PROMO_PITCH_HERO_OUT_MS - PROMO_PITCH_HERO_OVERLAP_MS)
          );
        }, PROMO_PITCH_HERO_IN_MS + PROMO_PITCH_HERO_HOLD_MS);
      };
      showWord();
    }

    // Warm the browser cache with clips that show later (detached, muted, never played).
    preloadVideos(urls) {
      this.preloaded = this.preloaded || new Map();
      urls.filter(Boolean).forEach((url) => {
        if (this.preloaded.has(url)) return;
        const video = document.createElement('video');
        video.muted = true; video.preload = 'auto'; video.dataset.promoIdle = '1'; video.src = url;
        this.preloaded.set(url, video);
      });
    }

    playPitchLine() {
      this.preloadVideos([PROMO_REWIND_VIDEO]);
      const line = this.line;
      const fromFace = this.root.querySelector('[data-promo-face-from]');
      if (!line || !fromFace) {
        this.playSeeForYourself();
        return;
      }
      const fromWords = [...fromFace.querySelectorAll('[data-promo-from-word]')];
      fromWords.forEach((word, index) => {
        word.style.animationDelay = `${index * PROMO_PITCH_WORD_STAGGER_MS}ms`;
      });
      line.classList.add('is-revealing');
      promoSfx('headline');
      this.seatRevealPair();
      window.requestAnimationFrame(() => this.seatRevealPair());
      const wordsInAt = (fromWords.length - 1) * PROMO_PITCH_WORD_STAGGER_MS + PROMO_PITCH_WORD_IN_MS;
      const strikeAt = wordsInAt + PROMO_PITCH_REPLACE_PAUSE_MS;
      window.setTimeout(async () => {
        const take = this.revealTake || speakTake('t-reveal');
        await take.at('Well');
        line.classList.add('is-striking');
        promoSfx('strike');
        // v10: the wave alone greets (no salute on top)
        await take.done;
        await waitMs(450);
        // rewind to the very same store the pain started in, now with Bizmis
        const rewind = momentsEnabled() ? this.beginRewind() : null;
        this.root.classList.add('is-pitch-cards');
        if (momentsEnabled()) this.playPitchPair(rewind);
        else this.playSeeForYourself();
      }, strikeAt);
    }

    async typeWidgetDraft(text) {
      const draft = widgetDraftInput();
      if (!draft) return false;
      const { input, setter } = draft;
      if (input.value && input.value !== text) {
        input.style.transition = 'opacity 260ms cubic-bezier(0.22, 1, 0.36, 1)';
        input.style.opacity = '0';
        await waitMs(260);
        setter.call(input, '');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.style.opacity = '1';
        await waitMs(180);
      }
      if (prefersReducedMotion()) {
        setter.call(input, text);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        showInputEnd(input);
        return true;
      }
      await typeOver(text, (slice) => {
        setter.call(input, slice);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        showInputEnd(input);
      });
      return true;
    }

    async typeShopperLine(text) {
      if (document.documentElement.classList.contains('is-promo-live-card')) {
        const typed = await this.typeWidgetDraft(text);
        if (typed) return;
      }
      const store = this.painStore();
      if (!store) return;
      let node = store.querySelector('[data-promo-shopper-line]');
      if (!node) {
        node = document.createElement('p');
        node.className = 'promo-shopper-line';
        node.setAttribute('data-promo-shopper-line', '');
        store.append(node);
      }
      node.hidden = false;
      if (prefersReducedMotion()) {
        node.textContent = text;
        return;
      }
      await typeOver(text, (slice) => {
        node.textContent = slice;
      });
    }

    clearPitchEvents() {
      this.painStore()?.querySelector('[data-promo-widget-events]')?.replaceChildren();
      document.querySelectorAll('[data-promo-laser]').forEach((node) => node.remove());
    }

    // Keeps only the film's scripted activity on the widget: the agent's own
    // tool calls and thinking state would show its real catalog search over
    // a later beat.
    muteWidgetActivity(muted) {
      const api = window.AvatarVoicechat;
      if (api && typeof api.muteRealActivity === 'function') api.muteRealActivity(muted);
    }

    paintPitchEvent(detail) {
      const labelText = pitchEventLabel(detail);
      if (!labelText) return;
      this.clearPitchEvents();
      const mount = activityStage();
      if (!mount) return;
      const sizePx = activityHaloPx(mount.stage);
      const orbitRadiusPx = (LASER_RADIUS / LASER_VIEWBOX) * sizePx;
      const iconPx = (11 / LASER_VIEWBOX) * sizePx;
      const focus = laserPolar(0);
      const filterId = `promo-laser-${detail.kind}`;
      const bloomId = `${filterId}-bloom`;
      const laser = document.createElement('div');
      laser.setAttribute('data-activity-laser', '');
      laser.setAttribute('data-promo-laser', '');
      laser.setAttribute('role', 'status');
      laser.setAttribute('aria-label', labelText);
      laser.className = 'theme-text-primary';
      laser.style.position = 'absolute';
      laser.style.left = '50%';
      laser.style.top = '50%';
      laser.style.width = `${sizePx}px`;
      laser.style.height = `${sizePx}px`;
      laser.style.transform = 'translate(-50%, -50%)';
      laser.style.pointerEvents = 'none';
      laser.style.setProperty('--bizmis-laser-spin-duration', `${PROMO_LASER_LAP_MS / 1000}s`);

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', `0 0 ${LASER_VIEWBOX} ${LASER_VIEWBOX}`);
      svg.setAttribute('fill', 'none');
      svg.setAttribute('aria-hidden', 'true');
      svg.classList.add('bizmis-laser-orbit');
      svg.style.position = 'absolute';
      svg.style.inset = '0';
      svg.style.overflow = 'visible';
      svg.style.width = '100%';
      svg.style.height = '100%';

      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      filter.id = filterId;
      filter.setAttribute('x', '-40%');
      filter.setAttribute('y', '-40%');
      filter.setAttribute('width', '180%');
      filter.setAttribute('height', '180%');
      const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
      blur.setAttribute('stdDeviation', '1.4');
      blur.setAttribute('result', 'bloom');
      const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
      ['bloom', 'SourceGraphic'].forEach((source) => {
        const node = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        node.setAttribute('in', source);
        merge.append(node);
      });
      filter.append(blur, merge);
      const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
      gradient.id = bloomId;
      [[0, '0.55'], [55, '0.22'], [100, '0']].forEach(([offset, opacity]) => {
        const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop.setAttribute('offset', `${offset}%`);
        stop.setAttribute('stop-color', 'currentColor');
        stop.setAttribute('stop-opacity', opacity);
        gradient.append(stop);
      });
      defs.append(filter, gradient);
      svg.append(defs);

      const track = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      track.setAttribute('cx', String(LASER_VIEWBOX / 2));
      track.setAttribute('cy', String(LASER_VIEWBOX / 2));
      track.setAttribute('r', String(LASER_RADIUS));
      track.setAttribute('stroke', 'currentColor');
      track.setAttribute('stroke-width', '1.5');
      track.setAttribute('opacity', '0.16');
      track.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.append(track);

      const tail = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      tail.setAttribute('filter', `url(#${filterId})`);
      const segmentSweep = LASER_TAIL_SWEEP / LASER_TAIL_COUNT;
      for (let index = 0; index < LASER_TAIL_COUNT; index += 1) {
        const endAngle = -LASER_TAIL_SWEEP + segmentSweep * (index + 1);
        const intensity = ((index + 1) / LASER_TAIL_COUNT) ** 2.15;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', laserArc(endAngle - segmentSweep - LASER_TAIL_OVERLAP, endAngle));
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', String(0.8 + (2.5 - 0.8) * intensity));
        path.setAttribute('stroke-opacity', String(0.025 + (0.82 - 0.025) * intensity));
        path.setAttribute('stroke-linecap', 'butt');
        path.setAttribute('vector-effect', 'non-scaling-stroke');
        tail.append(path);
      }
      svg.append(tail);

      const focusGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const bloom = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      bloom.setAttribute('cx', String(focus.x));
      bloom.setAttribute('cy', String(focus.y));
      bloom.setAttribute('r', '15');
      bloom.setAttribute('fill', `url(#${bloomId})`);
      const disc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      disc.setAttribute('cx', String(focus.x));
      disc.setAttribute('cy', String(focus.y));
      disc.setAttribute('r', '9');
      disc.setAttribute('fill', 'currentColor');
      disc.setAttribute('filter', `url(#${filterId})`);
      focusGroup.append(bloom, disc);
      svg.append(focusGroup);
      laser.append(svg);

      const rider = document.createElement('div');
      rider.className = 'bizmis-laser-orbit';
      rider.style.position = 'absolute';
      rider.style.inset = '0';
      rider.setAttribute('aria-hidden', 'true');
      const tip = document.createElement('span');
      tip.className = 'bizmis-laser-icon-lock theme-text-on-primary';
      tip.style.position = 'absolute';
      tip.style.left = '50%';
      tip.style.top = '50%';
      tip.style.display = 'flex';
      tip.style.alignItems = 'center';
      tip.style.justifyContent = 'center';
      tip.style.width = `${iconPx}px`;
      tip.style.height = `${iconPx}px`;
      tip.style.marginLeft = `${-iconPx / 2}px`;
      tip.style.marginTop = `${-iconPx / 2 - orbitRadiusPx}px`;
      tip.append(laserIcon(detail.kind));
      rider.append(tip);
      laser.append(rider);
      if (mount.before && mount.before.parentNode === mount.stage) mount.stage.insertBefore(laser, mount.before);
      else mount.stage.appendChild(laser);
    }

    stageTravel(node) {
      const stage = node.closest('[data-promo-canvas]') || node.offsetParent || node.parentElement;
      const stageBox = stage?.getBoundingClientRect();
      const box = node.getBoundingClientRect();
      return Math.ceil(Math.max(stageBox?.width || 0, box.width) + box.width);
    }

    async slideStoreToPhone() {
      const store = this.painStore();
      if (!store || prefersReducedMotion()) {
        store?.classList.remove('is-desktop');
        store?.classList.add('is-phone');
        store?.setAttribute('data-promo-widget-host', '');
        if (typeof window.__promoMountWidget === 'function') {
          window.__promoMountWidget({ isMobile: true, viewportHostSelector: '[data-promo-widget-host]' });
        }
        return;
      }
      const leave = this.stageTravel(store);
      store.style.transition = 'transform 450ms cubic-bezier(0.45, 0, 0.2, 1)';
      store.style.transform = `translateX(-${leave}px)`;
      await waitMs(450);
      store.classList.remove('is-desktop');
      store.classList.add('is-phone');
      store.setAttribute('data-promo-widget-host', '');
      store.querySelector('[data-promo-shopper-line]')?.replaceChildren();
      this.root.querySelector('[data-promo-moments]')?.classList.remove('is-cart-one', 'is-cart-two');
      applyMomentPose(this.momentStage(), 'doubt', { instant: true });
      const mount = window.__promoMountWidget;
      if (typeof mount === 'function') {
        mount({ isMobile: true, viewportHostSelector: '[data-promo-widget-host]' });
        hideSayThisBubbles();
      }
      await waitMs(640);
      const enter = this.stageTravel(store);
      store.style.transition = 'none';
      store.style.transform = `translateX(${enter}px)`;
      store.getBoundingClientRect();
      store.style.transition = 'transform 450ms cubic-bezier(0.45, 0, 0.2, 1)';
      store.style.transform = 'translateX(0)';
      await waitMs(460);
      store.style.transition = '';
      store.style.transform = '';
    }

    // Copy of the widget's caption (Subtitles.tsx, "progress" style), for
    // exports only: there the live agent's voice never plays, so the widget
    // has nothing to caption. Live playback keeps the widget's own captions.
    playFilmCaption(line, speakMs, timedWords = null, kind = 'clerk') {
      const canvas = this.root.querySelector('[data-promo-canvas]') || this.root;
      const card = document.querySelector('.bizmis-desktop-lite-chat');
      if (!card) return;
      canvas.querySelector('[data-promo-caption]')?.remove();
      const pill = document.createElement('div');
      pill.className = kind === 'shopper' ? 'promo-caption is-shopper' : 'promo-caption is-agent';
      pill.setAttribute('data-promo-caption', '');
      const text = document.createElement('p');
      text.className = 'promo-caption__text';
      if (kind !== 'shopper') {   // v24: the agent's words sit in a Siri-like glass panel; its pastel edge turns slowly (stepped)
        const halo = document.createElement('span');
        halo.className = 'promo-caption__halo';
        halo.setAttribute('aria-hidden', 'true');
        pill.appendChild(halo);
        const t0 = performance.now();
        const turn = (now) => {
          if (!pill.isConnected) return;
          pill.style.setProperty('--glow-a', `${(210 + ((now - t0) / 1000) * 70).toFixed(1)}deg`);
          window.requestAnimationFrame(turn);
        };
        turn(t0);
      }
      pill.appendChild(text);
      canvas.appendChild(pill);
      const frame = canvas.getBoundingClientRect();
      const scale = frame.width / (canvas.offsetWidth || frame.width) || 1;
      const box = card.getBoundingClientRect();
      const zoom = box.width / scale / (card.offsetWidth || box.width);
      // Bottom center of the browser window, inside it, where a store's
      // captions sit.
      const store = this.painStore()?.getBoundingClientRect() || box;
      pill.style.left = `${((store.left + store.width / 2 - frame.left) / scale).toFixed(1)}px`;
      pill.style.bottom = `${((frame.bottom - store.bottom) / scale + store.height / scale * 0.06).toFixed(1)}px`;
      pill.style.setProperty('--caption-zoom', zoom.toFixed(4));
      // Chunks of a few words, one line each, paced across the spoken time.
      // Audio tags ([curious]) never show; lines break on sentence or clause
      // ends, and no chunk is a lone word.
      const isTag = (word) => /^\[[^\]]*\]$/.test(word);
      timedWords = timedWords?.length ? timedWords.filter((word) => !isTag(word.text)) : null;
      const words = timedWords?.length ? timedWords.map((word) => word.text) : line.replace(/\[[^\]]*\]\s*/g, '').split(/\s+/).filter(Boolean);
      const chunkOf = [];
      const chunks = [];
      let open = [];
      words.forEach((word, index) => {
        open.push(word);
        const rest = words.length - index - 1;
        const stop = /[.!?]$/.test(word) || (/[,;:…]$/.test(word) && open.length >= 3) || open.length >= 6;
        if ((stop && rest !== 1) || rest === 0) { chunks.push(open); open = []; }
      });
      chunks.forEach((chunk, c) => chunk.forEach(() => chunkOf.push(c)));
      const firstOf = chunks.map((_, c) => chunkOf.indexOf(c));
      const span = Math.max(600, speakMs);
      const starts = [];
      if (timedWords?.length) {
        timedWords.forEach((word) => starts.push(word.startMs));
      } else {
        const total = words.reduce((sum, word) => sum + word.length + 1, 0);
        let acc = 0;
        words.forEach((word) => {
          starts.push((acc / total) * span * 0.94);
          acc += word.length + 1;
        });
      }
      const began = performance.now();
      let shownChunk = -1;
      const step = () => {
        if (!pill.isConnected) return;
        const t = performance.now() - began;
        if (t > span + 350) {
          pill.classList.remove('is-in');
          window.setTimeout(() => pill.remove(), 320);
          return;
        }
        let current = 0;
        while (current + 1 < words.length && starts[current + 1] <= t) current += 1;
        const chunk = chunkOf[current] ?? 0;
        if (chunk !== shownChunk) {
          shownChunk = chunk;
          text.replaceChildren(...chunks[chunk].map((word, index) => {
            const node = document.createElement('span');
            node.className = 'promo-caption__word';
            node.textContent = index === chunks[chunk].length - 1 ? word : `${word} `;
            return node;
          }));
        }
        text.querySelectorAll('.promo-caption__word').forEach((node, index) => {
          const at = firstOf[chunk] + index;
          node.classList.toggle('is-current', at === current);
          node.classList.toggle('is-upcoming', at > current);
          if (kind !== 'shopper') {   // v24: each word eases from faint to ink over ~240 ms (Siri-like, frame-stepped)
            const r = Math.min(1, Math.max(0, (t - (starts[at] ?? 0)) / 240));
            node.style.opacity = (0.3 + 0.7 * r * r * (3 - 2 * r)).toFixed(3);
          }
        });
        window.requestAnimationFrame(step);
      };
      pill.getBoundingClientRect();
      pill.classList.add('is-in');
      step();
    }

    // The clerk says a recorded line: the avatar talks for exactly its
    // length, the captions follow its word timings, and the sound is logged
    // so the exporter lays it under the frames.
    // A camera over the whole picture (overlays appended to the canvas later
    // stay put): built at boot, before the widget mounts, so no live node is
    // moved mid-film. Kept apart from the canvas, whose transform the 4K
    // export uses.
    ensureCamera() {
      const canvas = this.root.querySelector('[data-promo-canvas]');
      if (!canvas) return null;
      const existing = canvas.querySelector(':scope > [data-promo-camera]');
      if (existing) return existing;
      const camera = document.createElement('div');
      camera.className = 'promo-opening__camera';
      camera.setAttribute('data-promo-camera', '');
      while (canvas.firstChild) camera.appendChild(canvas.firstChild);
      canvas.appendChild(camera);
      return camera;
    }

    // Cap-style zoom: ease into an element (kept inside the frame), or back
    // out with no element.
    cameraTo(target, scale = PROMO_CAM_ZOOM) {
      const camera = this.camera;
      if (!camera || prefersReducedMotion()) return;
      camera.classList.add('is-moving');
      window.clearTimeout(this.cameraTimer);
      this.cameraTimer = window.setTimeout(() => camera.classList.remove('is-moving'), PROMO_CAM_MS + 60);
      if (!target) {
        camera.style.transform = 'none';
        return;
      }
      const canvas = camera.parentElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const frame = canvas.getBoundingClientRect();
      const fit = width / (frame.width || width);
      const box = target.getBoundingClientRect();
      const cx = (box.left + box.width / 2 - frame.left) * fit;
      const cy = (box.top + box.height / 2 - frame.top) * fit;
      const halfW = width / (2 * scale);
      const halfH = height / (2 * scale);
      const fx = Math.min(width - halfW, Math.max(halfW, cx));
      const fy = Math.min(height - halfH, Math.max(halfH, cy));
      camera.style.transform = `translate(${(width / 2 - scale * fx).toFixed(1)}px, ${(height / 2 - scale * fy).toFixed(1)}px) scale(${scale})`;
    }

    async speakClerk(id, reduced, cues = {}) {
      const voice = await clerkVoice(id);
      if (!voice) return;
      const durationMs = voice.durationMs;
      const src = `/promo/voice/${id}.wav`;
      const now = performance.now();
      // picture beats on the clerk's own words
      const said = voice.chars.map((c) => c.char).join('');
      Object.entries(cues).forEach(([phrase, run]) => {
        const at = said.indexOf(phrase);
        window.setTimeout(run, reduced || at < 0 ? 0 : voice.chars[at].startMs);
      });
      (window.__promoAudioCues = window.__promoAudioCues || []).push({ src, atMs: now, fromSec: 0, endMs: now + durationMs });
      if (!document.documentElement.classList.contains('is-promo-export')) {
        const audio = new Audio(src);
        audio.play().catch(() => { });
      }
      this.playFilmCaption(voice.text, durationMs, voiceWords(voice));
      promoWidgetDebug('setSpeaking', true);
      await waitMs(reduced ? 200 : durationMs);
      promoWidgetDebug('setSpeaking', false);
    }

    // The shopper's line goes out: the composer empties as if sent. Nothing
    // reaches the live agent, so it never talks over the recorded clerk.
    // The shopper calls the agent by voice: the widget's own call states
    // (connecting spinner, then live with the hang-up button), the shopper's
    // recorded words play, and a film caption carries them for muted viewers.
    async speakShopperLine(id, reduced, cues = {}) {
      const voice = await clerkVoice(id);
      if (voice && !reduced) {   // picture beats on the shopper's own words
        const said = voice.chars.map((c) => c.char).join('');
        Object.entries(cues).forEach(([phrase, run]) => {
          const at = said.indexOf(phrase);
          window.setTimeout(run, (this._voiceLive ? 160 : 800) + (at < 0 ? 0 : voice.chars[at].startMs));
        });
      }
      if (!voice || reduced) {
        await this.sendShopperLine(voice?.text || PROMO_PITCH_LINE_2);
        return;
      }
      if (!this._voiceLive) {
        promoWidgetDebug('debugVoiceMode', { on: true, pending: true });
        promoSfx('call-start');
        await waitMs(500);
        promoWidgetDebug('debugVoiceMode', { on: true, pending: false });
        await waitMs(300);
      } else await waitMs(160);
      const src = `/promo/voice/${id}.wav`;
      const began = performance.now();
      (window.__promoAudioCues = window.__promoAudioCues || []).push({ src, atMs: began, fromSec: 0, endMs: began + voice.durationMs });
      if (!document.documentElement.classList.contains('is-promo-export')) new Audio(src).play().catch(() => { });
      const canvas = this.root.querySelector('[data-promo-canvas]') || this.root;
      const spoken = voiceWords(voice).filter((w) => !/^\[[^\]]*\]$/.test(w.text)).map((w) => [w.startMs / 1000, w.text]);
      if (spoken.length) this.playSaidPill(canvas, spoken, { color: '#F9A353', kind: 'shopper', where: 'moments' });
      else this.playFilmCaption(voice.text, voice.durationMs, voiceWords(voice), 'shopper');
      await waitMs(voice.durationMs);
    }

    async sendShopperLine(text) {
      await this.typeShopperLine(text);
      await waitMs(240);
      this.sendDraft();
    }

    sendDraft() {
      const draft = widgetDraftInput();
      promoSfx('send');
      if (draft) {
        draft.setter.call(draft.input, '');
        draft.input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    // v23: the typed ask leaves the composer as the widget's own sent bubble
    // (trujilloai-bizmis-widget DesktopLiteChat, submittedMessage): primary
    // fill, on-primary text, rounded-2xl, px-3.5 py-2, text-sm, shadow-sm,
    // right-aligned 10px above the card, at most 85% of its width. It rises in
    // (y 10 -> 0, scale .96 -> 1), holds, then drifts up and fades (y -> -18).
    // The film never really sends it (the live agent stays silent), so it is
    // drawn here in the widget's own window, sized to the card every frame
    // (stepped: export-safe).
    playSentBubble(text, holdMs = 1300) {
      const card = document.querySelector('.bizmis-desktop-lite-chat');
      const surface = card?.querySelector('[class*="group/card"]') || card?.lastElementChild || card;
      if (!surface) return Promise.resolve();
      const positioned = (node) => node && getComputedStyle(node).position !== 'static';
      const host = [card.closest('[data-promo-widget-host]'), this.camera, this.root.querySelector('[data-promo-canvas]')].find(positioned) || this.root;
      const look = getComputedStyle(surface);
      const primary = look.getPropertyValue('--widget-primary').trim();
      const onPrimary = (look.getPropertyValue('--widget-primary-text') || look.getPropertyValue('--widget-primary-foreground')).trim();
      const bubble = document.createElement('div');
      bubble.className = 'promo-sent-bubble';
      bubble.textContent = text;
      if (primary) bubble.style.backgroundColor = `hsl(${primary})`;
      if (onPrimary) bubble.style.color = `hsl(${onPrimary})`;
      bubble.style.fontFamily = look.fontFamily;
      bubble.style.opacity = '0';
      host.appendChild(bubble);
      // where the widget would put it, in the host's own (untransformed) pixels
      const place = (rise, grow) => {
        if (!bubble.isConnected || !surface.isConnected) return;
        const hb = host.getBoundingClientRect();
        const k = hb.width / (host.offsetWidth || hb.width) || 1;
        const sb = surface.getBoundingClientRect();
        const zoom = sb.width / k / (surface.offsetWidth || sb.width / k);
        const px = (v) => `${(v * zoom).toFixed(2)}px`;
        bubble.style.fontSize = px(14);
        bubble.style.padding = `${px(8)} ${px(14)}`;
        bubble.style.borderRadius = px(16);
        bubble.style.maxWidth = `${(sb.width / k * 0.85).toFixed(1)}px`;
        bubble.style.boxShadow = `0 ${px(1)} ${px(2)} rgba(0, 0, 0, 0.05), 0 ${px(6)} ${px(16)} ${px(-6)} rgba(0, 0, 0, 0.14)`;
        bubble.style.left = `${((sb.right - hb.left) / k - host.clientLeft).toFixed(1)}px`;
        bubble.style.top = `${((sb.top - hb.top) / k - host.clientTop - 10 * zoom).toFixed(1)}px`;
        bubble.style.transform = `translate(-100%, -100%) translateY(${(rise * zoom).toFixed(2)}px) scale(${grow.toFixed(4)})`;
      };
      place(10, 0.96);
      return (async () => {
        await tweenStep(260, (e) => { bubble.style.opacity = e.toFixed(3); place(10 * (1 - e), 0.96 + 0.04 * e); }, promoEaseOut);
        const t0 = performance.now();
        await new Promise((resolve) => {
          const hold = (now) => {
            place(0, 1);
            if (now - t0 < holdMs) window.requestAnimationFrame(hold); else resolve();
          };
          hold(t0);
        });
        await tweenStep(380, (e) => { bubble.style.opacity = (1 - e).toFixed(3); place(-18 * e, 1 - 0.02 * e); }, promoEaseOut);
        bubble.remove();
      })();
    }

    // The loading ring runs from the moment a message goes out, or from the
    // end of the clerk's own line, until the next moment shows. At least one
    // full lap, so it never flickers.
    async laserUntilNext(kind, reduced, ms = PROMO_LASER_LAP_MS) {
      this.paintPitchEvent({ kind });
      await waitMs(reduced ? 40 : ms);
      this.clearPitchEvents();
    }

    async playPitchPair(rewind = null) {
      const reduced = prefersReducedMotion();
      this.pitchCardsPlayed = true;
      promoWidgetDebug('setPlaceholder', "Ask what you're looking for");
      if (!reduced && await this.playInstallMoment(rewind)) {
        // the clerk is already in its corner: it arrived with the install
      } else {
        this.seatClerkInStore(reduced);
        if (!reduced) await waitMs(PROMO_CLERK_CORNER_MS);
      }
      const stage = this.momentStage();
      const host = this.root.querySelector('[data-promo-moments]');
      applyMomentPose(stage, 'grid', { instant: true });
      const cursor = this.root.querySelector('[data-promo-pain-cursor]');
      if (cursor) {
        cursor.hidden = true;
        cursor.style.opacity = '0';
      }
      this.clearPitchEvents();
      this.muteWidgetActivity(true);
      const clay = promoClayUrls();
      const product = (title, key) => ({ title, url: `https://bizmis.ai/demo/${key}`, imageUrl: clay[key] || '' });
      const pick = product('The favorite', 'sphere');
      const match = product('The match', 'slab');

      this.preloadVideos(loadStoreReel().flatMap((item) => [item.video, item.ambient]));   // decoded long before the reel
      // Moment 1. The narrator names it first; then the interaction runs with
      // no narration over it, the agent answering the instant the shopper
      // sends (real-time, never waiting on a voice-over).
      this.chapterMargin();   // measure now, before the camera moves
      const widget = this.root.querySelector('[data-promo-widget]');
      const lostTake = speakTake('t-lost');
      lostTake.at('catalog', 'end').then(() => this.showChapter('Lost in the catalog', 'Found the right one'));
      await lostTake.at('lost', 'start', reduced ? 0 : 120);   // the shopper is already typing as the line names them
      if (!reduced) {
        this.cameraTo(widget);
        await waitMs(PROMO_CAM_MS * 0.55);
      }
      await this.typeShopperLine(PROMO_PITCH_LINE_1);
      await waitMs(reduced ? 40 : 120);
      this.sendDraft();   // sent the moment it's typed: no waiting on the narrator
      if (!reduced) this.playSentBubble(PROMO_PITCH_LINE_1);   // v23: the widget's own sent bubble above the card (no separate typed pill)
      setOpeningAvatarAction('nod');   // got it
      this.cameraTo(null);
      // the pull-back finishes before the products rearrange (no mid-move snap)
      await Promise.all([this.laserUntilNext('search', reduced, PROMO_LASER_FAST_MS), waitMs(reduced ? 0 : PROMO_CAM_MS)]);
      applyMomentPose(stage, 'row', { instant: reduced });
      emitShopper({ kind: 'products', products: [product('The classic', 'capsule'), pick, product('The new one', 'rounded-cube')] });
      promoWidgetDebug('setPlaceholder', 'Ask me to compare them');
      await lostTake.done;
      await this.speakClerk('clerk-results', reduced, {
        compare: () => {
          applyMomentPose(stage, 'choice', { instant: reduced });   // v11: still "Lost in the catalog" until it's the one (v9 chips)
        },
      });
      await this.speakClerk('clerk-compare', reduced, {
        "It's the one": () => {
          stage?.querySelector('.promo-moments__board')?.classList.add('is-decided');
          this.resolveChapter();
        },
      });
      promoWidgetDebug('setPlaceholder', 'Ask anything about it');
      await this.laserUntilNext('product', reduced, PROMO_LASER_FAST_MS);
      const leavingBoard = stage?.querySelector('.promo-moments__board');
      leavingBoard?.classList.add('is-leaving-choice');
      await waitMs(reduced ? 0 : 200);
      // a page change: a quick dissolve into the product page (the layout morph
      // shrank the winner into a thumbnail for a frame)
      if (!reduced && leavingBoard) await fadeStep(leavingBoard, 1, 0, 150);
      applyMomentPose(stage, 'doubt', { instant: true });
      // v13: the doubt scene is a voice chat from its first frame (no call
      // connecting on screen, no hang-up): already live when the page lands
      promoWidgetDebug('debugVoiceMode', { on: true, pending: false });
      this._voiceLive = true;
      if (!reduced && leavingBoard) fadeStep(leavingBoard, 0, 1, 260).then(() => { leavingBoard.style.opacity = ''; leavingBoard.style.transition = ''; });
      window.setTimeout(() => stage?.querySelector('.promo-moments__board')?.classList.remove('is-leaving-choice'), 900);
      const board = stage?.querySelector('.promo-moments__board');
      board?.classList.remove('is-decided');
      board?.classList.add('is-doubts-hidden');
      emitShopper({ kind: 'product', product: pick });

      // Moment 2. Named first; then the shopper asks out loud and the answer
      // comes at once. The doubts burst as the clerk says "Perfect"; the cart
      // only after the clerk has finished.
      const doubtTake = speakTake('t-doubt');
      await doubtTake.at('a doubt');
      board?.classList.remove('is-doubts-hidden');
      doubtTake.at('holds them back', 'end').then(() => this.showChapter('Stuck on a doubt', 'Doubt cleared'));
      await doubtTake.done;
      await this.speakShopperLine('shopper-doubt', reduced);
      setOpeningAvatarAction('thinking');
      await this.laserUntilNext('compare', reduced, PROMO_LASER_FAST_MS);
      await this.speakClerk('clerk-answer', reduced, {
        Absolutely: () => {
          // only the doubts go now; the cart waits for the clerk to finish
          promoSfx('doubt-poof');
          board?.classList.add('is-doubts-gone');
          window.setTimeout(() => this.resolveChapter(), reduced ? 0 : PROMO_MOMENTS_VAPOR_MS * 0.6);
        },
      });
      applyMomentPose(stage, 'close', { instant: reduced });
      promoWidgetDebug('setPlaceholder', 'Ask what goes with it');
      await waitMs(reduced ? 40 : 300);
      setOpeningAvatarAction('thumbsup');   // the doubt is gone: into the cart
      host?.classList.add('is-cart-one');
      emitShopper({ kind: 'cart', product: pick, quantity: 1 });
      await waitMs(reduced ? 40 : 950);   // "Added" and the cart badge land inside "Stuck on a doubt"
      this.hideChapter();
      // Moment 3. Like a good salesperson, the clerk suggests (it doesn't
      // push) what goes with it: only the main product at first, then a
      // vertical carousel of the catalog spins and settles on the match,
      // which flies into place beside it. Added once the clerk is done.
      await this.laserUntilNext('products', reduced, PROMO_LASER_FAST_MS);
      const spin = reduced ? null : this.spinCrossSell('slab');
      let bundled = false;
      const bundle = () => {
        if (bundled) return; bundled = true;
        applyMomentPose(stage, 'bundle', { instant: reduced });
        host?.classList.remove('is-cart-one');
        host?.classList.add('is-cart-two');
        emitShopper({ kind: 'cart', product: match, quantity: 1 });
      };
      // the chapter is named when the clerk names the pairing, not before
      // v13: a live, back-and-forth voice exchange: the clerk suggests and asks,
      // the shopper says yes, the clerk confirms (the add-on lands on "add it")
      const upsell = this.speakClerk('clerk-upsell', reduced, { pairs: () => this.showChapter('Missed add-on', 'Paired perfectly') })
        .then(() => this.speakShopperLine('shopper-upsell', reduced, { 'add it': bundle }))
        .then(() => this.speakClerk('clerk-upsell-done', reduced));
      await spin?.landed;
      await spin?.fly(() => {
        applyMomentPose(stage, 'extra', { instant: true });   // the flight steps the morph itself
        emitShopper({ kind: 'products', products: [match] });
      });
      if (!spin) {
        applyMomentPose(stage, 'extra', { instant: true });
        emitShopper({ kind: 'products', products: [match] });
      }
      await upsell;
      promoWidgetDebug('setPlaceholder', 'Ask about shipping or returns');
      bundle();
      this.resolveChapter();
      window.setTimeout(() => setOpeningAvatarAction('bow'), 350);   // a small thank-you
      await waitMs(reduced ? 40 : 1100);
      this.hideChapter();
      this.painStore()?.querySelectorAll('.promo-close__veil, .promo-close__mark, .promo-glide__lost-mark, .promo-glide__veil').forEach((node) => node.remove());
      this.painStore()?.querySelectorAll('[style*="grayscale"]').forEach((node) => { node.style.filter = ''; });
      await this.markCloseStoreSold();
      await this.rememberPitchLead();
      this.muteWidgetActivity(false);
      promoWidgetDebug('debugVoiceMode', { on: false });
      this._voiceLive = false;
      promoWidgetDebug('setPlaceholder', null);
      endOpeningAgent();
      await this.releaseLiveCard();
      this.playPitchConveyor();
    }

    // A chapter line above the window: the pain in grey, struck through in
    // Bizmis orange when the clerk resolves it, rewritten as the outcome
    // (the same move as the reveal's salesperson -> salesagent).
    // One click: the grey store with its old chat bubble, a Shopify app card,
    // the cursor clicks Install, the bubble becomes the clerk and the store
    // warms up. Returns false when the stage isn't there (caller falls back).
    // "Let's rewind." The pain plays backwards like a VHS tape (a pre-rendered
    // clip, scripts/render-vhs-rewind.py) and slows to a stop on the pain's
    // first store frame: the very window the pitch then installs Bizmis into.
    // land() resolves once the tape has stopped and the live store shows.
    beginRewind() {
      if (prefersReducedMotion()) return null;
      const canvas = this.root.querySelector('[data-promo-canvas]');
      if (!canvas) return null;
      const overlay = document.createElement('div');
      overlay.className = 'promo-rewind';
      overlay.innerHTML = '<div class="promo-rewind__screen"><video muted playsinline preload="auto"></video></div>'
        // v24b: the ◀◀ lives in the player chrome under the frame, never over the picture
        + '<div class="promo-rewind__scrub" aria-hidden="true"><span class="promo-rewind__glyph"><svg viewBox="0 0 24 24"><path class="is-a" d="M11.2 6.2 3.6 12l7.6 5.8z"/><path class="is-b" d="M20.4 6.2 12.8 12l7.6 5.8z"/></svg></span>'
        + '<span class="promo-rewind__time">0:00</span><span class="promo-rewind__track"><i></i><b></b></span></div>';
      const video = overlay.querySelector('video');
      video.dataset.promoIdle = '1';
      video.dataset.promoStart = '0';
      video.src = PROMO_REWIND_VIDEO;
      canvas.appendChild(overlay);
      overlay.classList.add('is-cover');   // covers the frame at once: no stray store frame before the tape starts
      const ready = new Promise((resolve) => {
        if (video.readyState >= 2) resolve();
        else video.addEventListener('loadeddata', resolve, { once: true });
        window.setTimeout(resolve, 4000);
      });
      const started = ready.then(() => {
        try { video.currentTime = 0; } catch { }
        delete video.dataset.promoIdle;
        video.__promoOriginMs = null;
        if (!document.documentElement.classList.contains('is-promo-export')) video.play().catch(() => { });
        overlay.classList.add('is-in');
        promoSfx('rewind');
        speakTake('t-rewind-a');
        const at = performance.now();
        this.driveRewindChrome(overlay, at);
        return at;
      });
      return {
        land: async () => {
          const at = await started;
          const left = PROMO_REWIND_MS - (performance.now() - at);
          if (left > 0) await waitMs(left);
          this.rewindTail = speakTake('t-rewind-b');
          promoSfx('rewind-land');
          // the tape has stopped on the very store the pitch shows: dissolve into it (stepped)
          fadeStep(overlay, 1, 0, 260).then(() => overlay.remove());
          await waitMs(PROMO_REWIND_REVEAL_MS);
        },
      };
    }

    // v24 rewind chrome, frame-stepped from the tape's start: the picture shrinks into a
    // floating "player" frame while it races back (and grows back to full bleed as it lands),
    // a frosted ◀◀ disc pulses its two chevrons, and a scrubber's playhead + timecode run
    // back in step with the clip (same ease as the render).
    driveRewindChrome(overlay, at) {
      const screen = overlay.querySelector('.promo-rewind__screen');
      const glyph = overlay.querySelector('.promo-rewind__glyph');
      const [chevA, chevB] = overlay.querySelectorAll('.promo-rewind__glyph path');
      const scrub = overlay.querySelector('.promo-rewind__scrub');
      const fill = overlay.querySelector('.promo-rewind__track i');
      const head = overlay.querySelector('.promo-rewind__track b');
      const time = overlay.querySelector('.promo-rewind__time');
      const { from, to, ms } = PROMO_REWIND_SCRUB;
      const out = (u) => 1 - (1 - u) ** 3;
      const io = (u) => (u < 0.5 ? 4 * u * u * u : 1 - ((-2 * u + 2) ** 3) / 2);
      const clamp = (u) => Math.min(1, Math.max(0, u));
      const SHRINK = 0.84;
      const frame = (now) => {
        if (!overlay.isConnected) return;
        const c = now - at;
        const into = out(clamp(c / 260));
        const back = io(clamp((c - ms - 20) / (PROMO_REWIND_MS - ms - 20)));
        const k = into * (1 - back);   // 0 = full bleed, 1 = the floating frame
        if (screen) {
          screen.style.scale = (1 - (1 - SHRINK) * k).toFixed(4);
          screen.style.borderRadius = `${(1.8 * k).toFixed(3)}cqh`;
          screen.style.boxShadow = `0 ${(2.6 * k).toFixed(2)}cqh ${(7 * k).toFixed(2)}cqh rgba(28, 24, 20, ${(0.22 * k).toFixed(3)}), 0 0 0 1px rgba(28, 24, 20, ${(0.06 * k).toFixed(3)})`;
        }
        const show = clamp(c / 180) * (1 - clamp((c - ms + 120) / 220));
        if (glyph) {
          glyph.style.scale = (0.86 + 0.14 * out(clamp(c / 260))).toFixed(4);
          const beat = (c / 1000) * 5.2 * Math.PI * 2;   // the two chevrons chase leftward
          if (chevA) chevA.style.opacity = (0.62 + 0.38 * (0.5 + 0.5 * Math.cos(beat))).toFixed(3);
          if (chevB) chevB.style.opacity = (0.62 + 0.38 * (0.5 + 0.5 * Math.cos(beat - 1.6))).toFixed(3);
        }
        const tape = from - (from - to) * promoRewindEase(c / ms);
        const p = clamp(tape / from) * 0.94 + 0.03;
        if (scrub) scrub.style.opacity = (show * Math.min(1, k * 1.4)).toFixed(3);
        if (fill) fill.style.scale = `${p.toFixed(4)} 1`;
        if (head) head.style.left = `${(p * 100).toFixed(2)}%`;
        if (time) {
          const sec = Math.max(0, Math.round(tape));
          time.textContent = `0:${String(sec).padStart(2, '0')}`;
        }
        window.requestAnimationFrame(frame);
      };
      frame(performance.now());
    }

    async playInstallMoment(rewind = null) {
      const store = this.painStore();
      const widget = this.root.querySelector('[data-promo-widget]');
      if (!store || !widget) return false;
      const root = document.documentElement;
      root.style.setProperty('--ad-warmth', '0');
      store.style.filter = ''; store.style.translate = '';
      store.querySelectorAll('[style*="grayscale"], [style*="sepia"]').forEach((node) => { node.style.filter = ''; });
      this.seatClerkInStore(true);
      widget.style.transformOrigin = '100% 100%';
      widget.classList.add('is-uninstalled');
      const storeBox = store.getBoundingClientRect();
      const fit = store.clientWidth / (storeBox.width || 1);
      const local = (box) => ({ x: (box.left - storeBox.left) * fit, y: (box.top - storeBox.top) * fit, w: box.width * fit, h: box.height * fit });
      const unit = store.clientWidth * 0.027;
      const seat = local(widget.getBoundingClientRect());
      // the very same "Typical Chatbot" launcher the pain's stores used
      const bubble = document.createElement('span');
      bubble.className = 'promo-install__bubble promo-pain__launcher';
      bubble.innerHTML = PROMO_PAIN_MARK;
      const size = unit * 2.5;   // the launcher at a real size (v8 read huge)
      bubble.style.width = bubble.style.height = `${size.toFixed(1)}px`;
      bubble.style.left = `${(seat.x + seat.w - size).toFixed(1)}px`;
      bubble.style.top = `${(seat.y + seat.h - size).toFixed(1)}px`;
      // v11: no install UI at all. The cursor brings the clerk in from beyond
      // the window's right edge, already held by its body (no card yet); the
      // clerk swings from the grip as it is carried in an arc to the corner,
      // is dropped onto the old chatbot (which bursts), lands with a squash,
      // and only then does its glass card form around it.
      const cursor = document.createElement('span');
      cursor.className = 'promo-install__cursor promo-install__cursor--hand is-grabbing';
      cursor.innerHTML = PROMO_HAND_OPEN + PROMO_HAND_GRAB;
      cursor.style.width = cursor.style.height = `${(unit * 2.3).toFixed(1)}px`;
      store.append(bubble, cursor);
      bubble.classList.add('is-in');
      if (rewind) await rewind.land();
      const take = this.rewindTail;
      const arriveAt = take ? take.at('Bizmis', 'end', 0) : null;
      const carryMs = PROMO_INSTALL_AIM_MS + PROMO_INSTALL_GRAB_MS + PROMO_INSTALL_DRAG_MS;
      if (take) await take.at('Bizmis', 'end', -(carryMs + PROMO_INSTALL_DROP_MS + 60));
      else await waitMs(PROMO_INSTALL_CARD_MS);
      const hot = { x: unit * 0.95, y: unit * 0.55 };   // the hand's grip point inside its box
      // the widget's true seat (unscaled: it sits shrunk while uninstalled)
      const prevTransition = widget.style.transition;
      widget.style.transition = 'none';
      widget.classList.remove('is-uninstalled');
      widget.style.scale = '1';
      const trueSeat = local(widget.getBoundingClientRect());
      // held by the body: the grip is the clerk's chest (the head sits at ~11% of the card)
      const cardEl = widget.querySelector('.bizmis-desktop-lite-chat') || widget;
      const card = local(cardEl.getBoundingClientRect());
      widget.style.scale = '';
      widget.classList.add('is-uninstalled');
      widget.style.transition = prevTransition;
      const pivot = { x: card.x + card.w * 0.5 - trueSeat.x, y: card.y + card.h * PROMO_INSTALL_GRIP - trueSeat.y };
      const seatC = { x: trueSeat.x + pivot.x, y: trueSeat.y + pivot.y };
      widget.classList.remove('is-uninstalled');
      widget.classList.add('is-dragged');
      widget.style.transformOrigin = `${pivot.x.toFixed(1)}px ${pivot.y.toFixed(1)}px`;
      const lift = (x, y, k, deg) => {
        // individual properties: they compose with the widget's own CSS transform (its corner seat)
        widget.style.translate = `${(x - seatC.x).toFixed(1)}px ${(y - seatC.y).toFixed(1)}px`;
        widget.style.rotate = `${deg.toFixed(2)}deg`;
        widget.style.scale = k.toFixed(4);
      };
      widget.style.transition = 'none';
      widget.style.opacity = '1';
      // in from off the right edge, an arc through the store, down to just above the corner
      const W = store.clientWidth; const H = store.clientHeight;
      const drop = { x: seatC.x, y: seatC.y - trueSeat.h * 0.3 };
      const P0 = { x: W + trueSeat.w * 0.75, y: H * 0.34 };
      const P1 = { x: W * 0.52, y: H * 0.14 };
      const P2 = { x: W * 0.5, y: Math.min(H * 0.62, drop.y - H * 0.04) };
      const at = (u) => {
        const e = u < 0.5 ? 4 * u * u * u : 1 - ((-2 * u + 2) ** 3) / 2;
        const q = 1 - e;
        return {
          x: q * q * q * P0.x + 3 * q * q * e * P1.x + 3 * q * e * e * P2.x + e * e * e * drop.x,
          y: q * q * q * P0.y + 3 * q * q * e * P1.y + 3 * q * e * e * P2.y + e * e * e * drop.y,
        };
      };
      const sCarry = 0.9;
      const pend = { th: 0, w: 0 };
      const L = trueSeat.h * 0.45;
      let last = null;
      lift(P0.x, P0.y, sCarry, 0);
      cursor.style.transition = 'none';
      cursor.style.transform = `translate(${(P0.x - hot.x).toFixed(1)}px, ${(P0.y - hot.y).toFixed(1)}px)`;
      cursor.classList.add('is-in');
      cursor.style.opacity = '1';
      promoWidgetDebug('debugDrag', { phase: 'start' });   // the widget's own held pose + drag springs (PROD physics)
      await new Promise((resolve) => {
        const t0 = performance.now();
        let prev = at(0); let prevV = { x: 0, y: 0 }; let prevT = t0;
        const step = (now) => {
          const u = Math.min(1, (now - t0) / carryMs);
          const p = at(u);
          const dt = Math.max(1, now - prevT) / 1000;
          const v = { x: (p.x - prev.x) / dt, y: (p.y - prev.y) / dt };
          const a = { x: (v.x - prevV.x) / dt, y: (v.y - prevV.y) / dt };
          // a pendulum hanging from the grip: th'' = -(g + ay)/L sin th - ax/L cos th - damping
          // (fixed sub-steps: stable at any frame rate)
          const subs = Math.max(1, Math.round(dt / 0.004));
          const g = 2600;
          for (let i = 0; i < subs; i += 1) {
            const h = dt / subs;
            const acc = -((g + a.y * 0.5) / Math.max(40, L)) * Math.sin(pend.th) - (a.x * 0.5 / Math.max(40, L)) * Math.cos(pend.th) - 2 * 0.22 * 6.2 * pend.w;
            pend.w += acc * h; pend.th += pend.w * h;
          }
          pend.th = Math.max(-0.42, Math.min(0.42, pend.th));   // a lively swing, never sideways
          lift(p.x, p.y, sCarry, (pend.th * 180) / Math.PI);
          cursor.style.transform = `translate(${(p.x - hot.x).toFixed(1)}px, ${(p.y - hot.y).toFixed(1)}px)`;
          const sp = storeBox.width / (W || 1);   // store px -> screen px
          promoWidgetDebug('debugDrag', { phase: 'move', vx: v.x * sp, vy: v.y * sp });
          prev = p; prevV = v; prevT = now; last = p;
          if (u < 1) window.requestAnimationFrame(step); else resolve();
        };
        step(t0);
        promoSfx('install-drag', { ms: carryMs });
      });
      const sEnd = sCarry;
      // release: the hand opens and the clerk falls into its seat
      promoWidgetDebug('debugDrag', { phase: 'move', vx: 0, vy: 0 });
      cursor.classList.remove('is-grabbing');
      promoSfx('install-release');
      const from = last || drop;
      await new Promise((resolve) => {
        const t0 = performance.now();
        const th0 = pend.th;
        const step = (now) => {
          const u = Math.min(1, (now - t0) / PROMO_INSTALL_DROP_MS);
          const g = u * u;   // gravity
          lift(from.x + (seatC.x - from.x) * u, from.y + (seatC.y - from.y) * g, sEnd + (1 - sEnd) * u, (th0 * (1 - u) * 180) / Math.PI);
          if (u < 1) window.requestAnimationFrame(step); else resolve();
        };
        window.requestAnimationFrame(step);
      });
      if (arriveAt) await arriveAt;
      // impact: the old chatbot bursts, the clerk squashes and settles, its
      // card forms, and the store's colour ripples out from the corner
      const to = { x: seat.x + seat.w - size / 2, y: seat.y + seat.h - size / 2 };
      {   // the old chatbot pops and vanishes (stepped: CSS keyframes were never sampled)
        bubble.style.transition = 'none'; bubble.style.animation = 'none';
        const t0 = performance.now();
        const pop = (now) => {
          const u = Math.min(1, (now - t0) / 300);
          const k = u < 0.35 ? 1 - 0.25 * (u / 0.35) : 0.75 + 0.75 * ((u - 0.35) / 0.65);
          bubble.style.transform = `scale(${k.toFixed(3)})`; bubble.style.opacity = (u < 0.35 ? 1 : 1 - (u - 0.35) / 0.65).toFixed(3);
          if (u < 1) window.requestAnimationFrame(pop);
        };
        window.requestAnimationFrame(pop);
      }
      const wave = document.createElement('span');
      wave.className = 'promo-install__wave';
      wave.style.left = `${to.x.toFixed(1)}px`;
      wave.style.top = `${to.y.toFixed(1)}px`;
      wave.style.setProperty('--wave', `${(Math.hypot(store.clientWidth, store.clientHeight) * 2.2).toFixed(1)}px`);
      const ring = document.createElement('span');
      ring.className = 'promo-install__shock';
      ring.style.left = wave.style.left; ring.style.top = wave.style.top;
      ring.style.setProperty('--shock', `${(size * 7).toFixed(1)}px`);
      store.append(wave, ring);
      promoSfx('clerk-in');
      promoWidgetDebug('debugDrag', { phase: 'end' });
      widget.style.transformOrigin = '50% 100%';
      widget.classList.remove('is-dragged');
      widget.classList.add('is-landed', 'is-forming');
      {   // the glass card forms around the clerk (stepped)
        const t0 = performance.now();
        const form = (now) => {
          const u = Math.min(1, (now - t0) / 520); const e = 1 - (1 - u) ** 3;
          widget.style.setProperty('--chrome', e.toFixed(3));
          if (u < 1) window.requestAnimationFrame(form); else { widget.classList.remove('is-forming'); widget.style.removeProperty('--chrome'); }
        };
        widget.style.setProperty('--chrome', '0');
        window.requestAnimationFrame(form);
      }
      tweenAdWarmth();
      {   // the open hand drifts up and away as it fades (a class transition was never sampled)
        const c0 = cursor.style.transform;
        tweenStep(420, (e) => { cursor.style.opacity = (1 - e).toFixed(3); cursor.style.transform = `${c0} translate(${(e * unit * 1.2).toFixed(1)}px, ${(-e * unit * 1.6).toFixed(1)}px)`; }, promoEaseOut);
      }
      await new Promise((resolve) => {
        const t0 = performance.now();
        const step = (now) => {
          const t = (now - t0) / 1000;
          // squash on contact, then a damped spring back to round
          const sq = Math.exp(-t * 9) * Math.cos(t * 26) * 0.12;
          widget.style.translate = '0px 0px'; widget.style.rotate = '0deg';
          widget.style.scale = `${(1 + sq * 0.6).toFixed(4)} ${(1 - sq).toFixed(4)}`;
          if (t < 0.6) window.requestAnimationFrame(step); else resolve();
        };
        window.requestAnimationFrame(step);
      });
      widget.style.translate = ''; widget.style.rotate = ''; widget.style.scale = '';
      widget.style.transformOrigin = '100% 100%';
      window.setTimeout(() => setOpeningAvatarAction('waving'), 60);   // hello, store
      window.setTimeout(() => { wave.remove(); ring.remove(); }, 1500);
      await waitMs(Math.max(0, PROMO_INSTALL_ARRIVE_MS - 600));
      widget.classList.remove('is-landed');
      cursor.remove();
      bubble.remove();
      return true;
    }

    // The cross-sell carousel: a column of the catalog beside the product
    // spins (decelerating, picker ticks) and settles on the match; fly()
    // switches the board to the pair and flies the picked card into its slot.
    spinCrossSell(matchKey) {
      const store = this.painStore();
      if (!store) return null;
      const clay = promoClayUrls();
      const src = (key) => clay[key] || `/promo/products/images/promo-product-${key}.png`;
      const keys = ['cone', 'dome', 'egg', 'icosahedron', 'cylinder', 'lens', 'arch', 'capsule', 'rounded-cube', matchKey, 'dodecahedron', 'squircle-slab'];
      const pickAt = keys.indexOf(matchKey);
      // v11: a tight column of the catalog scrolls past and eases to a stop on
      // the match, like the agent scanning the catalog (no picker frame, no
      // mark); it runs under the clerk's card, never over it
      const rail = document.createElement('div');
      rail.className = 'promo-xsell';
      rail.innerHTML = `<div class="promo-xsell__track">${keys.map((key, i) => `<figure class="promo-xsell__card${i === pickAt ? ' is-match' : ''}"><img src="${src(key)}" alt=""><span></span><span></span></figure>`).join('')}</div>`;
      store.appendChild(rail);
      const track = rail.querySelector('.promo-xsell__track');
      const cards = [...rail.querySelectorAll('.promo-xsell__card')];
      rail.getBoundingClientRect();
      const stepY = cards[1].offsetTop - cards[0].offsetTop;
      const centre = (rail.clientHeight - cards[0].offsetHeight) / 2;
      const y0 = centre + stepY * 1.5; const y1 = centre - pickAt * stepY;
      const focus = (y) => cards.forEach((card, i) => {   // the cards near the middle read; the rest recede
        const d = Math.abs(y + i * stepY - centre) / Math.max(1, stepY);
        card.style.opacity = (1 - Math.min(0.62, d * 0.24)).toFixed(3);
        card.style.scale = (1 - Math.min(0.08, d * 0.03)).toFixed(4);
      });
      track.style.transform = `translateY(${y0.toFixed(1)}px)`;
      focus(y0);
      fadeStep(rail, 0, 1, 300);
      promoSfx('xsell-scan', { ms: PROMO_XSELL_SPIN_MS });
      const landed = tweenStep(PROMO_XSELL_SPIN_MS, (e) => {
        const y = y0 + (y1 - y0) * e;
        track.style.transform = `translateY(${y.toFixed(2)}px)`;
        focus(y);
      }, (u) => 1 - (1 - u) ** 4).then(() => promoSfx('xsell-stop'));
      // The product page becomes the pair: its own photo glides from the big
      // product shot into its card, the copy re-forms around it, and the
      // matched card carries on from the rail into the slot beside it, all
      // stepped per frame on the live layout (nothing swaps or pops).
      const fly = async (switchPose) => {
        await waitMs(Math.max(0, PROMO_XSELL_HOLD_MS - 200));
        const frame = store.getBoundingClientRect();
        const fit = store.clientWidth / (frame.width || 1);
        const box = (r) => ({ x: (r.left - frame.left) * fit, y: (r.top - frame.top) * fit, w: r.width * fit, h: r.height * fit });
        const main = store.querySelector('.promo-moments__card.is-pick');
        const mainPhoto = main?.querySelector('.promo-moments__photo');
        const mainRest = main ? [...main.children].filter((node) => node !== mainPhoto) : [];
        await Promise.all(mainRest.map((node) => fadeStep(node, 1, 0, 200)));   // the page's copy steps back first
        const fromMain = mainPhoto ? box(mainPhoto.getBoundingClientRect()) : null;
        // the photo's own look, read now (its tint and corners come from the page pose and its card)
        const look0 = mainPhoto ? getComputedStyle(mainPhoto) : null;
        const ghostLook = look0 ? { r0: (Number.parseFloat(look0.borderTopLeftRadius) || 0) * fit,
          vars: ['--ad-tile', '--ad-photo', '--tint-warm', '--tint-stone', '--ad-warmth'].map((k) => [k, look0.getPropertyValue(k).trim()]).filter(([, v]) => v),
          bg: look0.backgroundColor, filter: look0.filter } : null;
        // its classes too: the tint is styled through the board's pose and the card's role
        // (classes and inline custom properties: the warm tint is a --tint-warm on the card)
        const ghostShell = main ? [main.closest('[data-promo-moments]'), main.closest('.promo-moments__board'), main].map((node) => ({ cls: node?.className || '', css: node?.getAttribute('style') || '' })) : null;
        const fromPhoto = box(cards[pickAt].querySelector('img').getBoundingClientRect());
        switchPose();
        promoSfx('xsell-morph');
        const slot = store.querySelector('.promo-moments__card.is-extra');
        const slotPhoto = slot?.querySelector('.promo-moments__photo') || slot;
        cards[pickAt].style.visibility = 'hidden';
        fadeStep(rail, 1, 0, 320);
        window.setTimeout(() => rail.remove(), 400);
        // one flight helper: each frame, the element's natural box (still
        // settling into the pair pose) is measured and translate/scale (which
        // compose with the pose's own transform) put its photo on the eased path
        const flight = (el, photo, from, arc) => {
          if (!el || !photo || !from) return Promise.resolve();
          let ox = 0; let oy = 0; let node = photo;
          while (node && node !== el) { ox += node.offsetLeft; oy += node.offsetTop; node = node.offsetParent; }
          el.style.transformOrigin = `${ox.toFixed(1)}px ${oy.toFixed(1)}px`;
          el.style.transition = 'none';
          el.style.animation = 'none';   // its add-on entrance (opacity 0 until late) hid the flight
          el.style.opacity = '1';
          return tweenStep(PROMO_XSELL_FLY_MS, (e) => {
            el.style.translate = '0px 0px'; el.style.scale = '1';
            const natural = box(photo.getBoundingClientRect());
            const k = (from.w + (natural.w - from.w) * e) / Math.max(1, natural.w);
            const x = from.x + (natural.x - from.x) * e;
            const y = from.y + (natural.y - from.y) * e - Math.sin(e * Math.PI) * store.clientHeight * arc;
            const local = el.offsetWidth / Math.max(1, box(el.getBoundingClientRect()).w);   // store px -> the card's own px
            el.style.scale = k.toFixed(4);
            el.style.translate = `${((x - natural.x) * local).toFixed(1)}px ${((y - natural.y) * local).toFixed(1)}px`;
          }).then(() => { el.style.translate = ''; el.style.scale = ''; el.style.transformOrigin = ''; el.style.transition = ''; });
        };
        mainRest.forEach((node) => { node.style.opacity = ''; node.style.transition = ''; });
        // the real card (in its pair place) fades in under a copy of its photo that glides there from the product shot
        const ghost = mainPhoto && fromMain ? mainPhoto.cloneNode(true) : null;
        if (ghost) {
          Object.assign(ghost.style, { position: 'absolute', margin: '0', zIndex: '30', pointerEvents: 'none', transition: 'none', animation: 'none', transform: 'none', translate: 'none', scale: 'none',
            overflow: 'hidden', boxSizing: 'border-box', borderRadius: `${ghostLook.r0.toFixed(1)}px`, backgroundColor: ghostLook.bg, filter: ghostLook.filter,
            left: `${fromMain.x.toFixed(1)}px`, top: `${fromMain.y.toFixed(1)}px`, width: `${fromMain.w.toFixed(1)}px`, height: `${fromMain.h.toFixed(1)}px` });
          // boxless copies of its board and card (display: contents), so the same rules style it
          const shell = ghostShell.map(({ cls, css }) => { const node = document.createElement('div'); node.className = cls; node.setAttribute('style', css); Object.assign(node.style, { display: 'contents', transform: 'none', translate: 'none', scale: 'none', opacity: '1' }); return node; });
          shell[0].appendChild(shell[1]); shell[1].appendChild(shell[2]); shell[2].appendChild(ghost);
          ghostLook.vars.forEach(([k, v]) => ghost.style.setProperty(k, v));   // the tint's own values, whatever rule set them
          store.appendChild(shell[0]);
          ghost._shell = shell[0];
        }
        const r1 = mainPhoto ? (Number.parseFloat(getComputedStyle(mainPhoto).borderTopLeftRadius) || 0) * fit : 0;
        if (main) { main.style.transition = 'none'; main.style.opacity = '0'; }
        const plus = store.querySelector('.promo-moments__plus');
        if (plus) plus.style.opacity = '0';
        window.setTimeout(() => {
          promoSfx('xsell-land');
          if (main) fadeStep(main, 0, 1, 360).then(() => { main.style.opacity = ''; main.style.transition = ''; });
          if (plus) fadeStep(plus, 0, 1, 300).then(() => { plus.style.opacity = ''; plus.style.transition = ''; });
        }, PROMO_XSELL_FLY_MS * 0.5);
        const glide = ghost ? tweenStep(PROMO_XSELL_FLY_MS, (e) => {
          const to = box(mainPhoto.getBoundingClientRect());
          ghost.style.left = `${(fromMain.x + (to.x - fromMain.x) * e).toFixed(1)}px`;
          ghost.style.top = `${(fromMain.y + (to.y - fromMain.y) * e).toFixed(1)}px`;
          ghost.style.width = `${(fromMain.w + (to.w - fromMain.w) * e).toFixed(1)}px`;
          ghost.style.height = `${(fromMain.h + (to.h - fromMain.h) * e).toFixed(1)}px`;
          ghost.style.borderRadius = `${(ghostLook.r0 + (r1 - ghostLook.r0) * e).toFixed(1)}px`;
          ghost.style.opacity = (e < 0.72 ? 1 : Math.max(0, 1 - (e - 0.72) / 0.28)).toFixed(3);   // hands over to the real card as it lands
        }).then(() => ghost._shell.remove()) : Promise.resolve();
        await Promise.all([glide, flight(slot, slotPhoto, fromPhoto, 0.03)]);
      };
      return { landed, fly };
    }

    chapterMargin() {
      const camera = this.camera;
      const resting = !camera || ((!camera.style.transform || camera.style.transform === 'none') && !camera.classList.contains('is-moving'));
      if (!resting) return this.chapterMarginAtRest || 0;
      const canvas = this.root.querySelector('[data-promo-canvas]') || this.root;
      const store = this.painStore()?.getBoundingClientRect();
      if (!store) return this.chapterMarginAtRest || 0;
      const frame = canvas.getBoundingClientRect();
      const scale = frame.width / (canvas.offsetWidth || frame.width) || 1;
      this.chapterMarginAtRest = (store.top - frame.top) / scale;
      return this.chapterMarginAtRest;
    }

    showChapter(from, to) {
      const canvas = this.root.querySelector('[data-promo-canvas]') || this.root;
      let line = canvas.querySelector('[data-promo-chapter]');
      if (!line) {
        line = document.createElement('p');
        line.className = 'promo-chapter';
        line.setAttribute('data-promo-chapter', '');
        canvas.appendChild(line);
      }
      line.classList.remove('is-in', 'is-struck');
      line.replaceChildren();
      // a status chip: a grey ring that resolves into a ticked orange disc
      const mark = document.createElement('span');
      mark.className = 'promo-chapter__mark';
      mark.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle class="promo-chapter__ring" cx="12" cy="12" r="10"/><circle class="promo-chapter__disc" cx="12" cy="12" r="11"/><path class="promo-chapter__check" pathLength="1" d="M7.2 12.4l3.2 3.2 6.4-6.6"/></svg>';
      const words = document.createElement('span');
      words.className = 'promo-chapter__words';
      const a = document.createElement('span');
      a.className = 'promo-chapter__from';
      a.textContent = from;
      const b = document.createElement('span');
      b.className = 'promo-chapter__to';
      b.textContent = to;
      words.append(a, b);
      line.append(mark, words);
      // Sized to the margin above the window, so it reads large without
      // touching it. Measured with the camera at rest (it may be zooming into
      // the widget right now): the last at-rest measure is reused.
      // v9: the margin above the window is too thin for a readable chip, so it
      // floats over the window's empty header band instead, centred, at a
      // size that reads on a phone (~2.7% of the frame).
      const margin = this.chapterMargin();
      const frameH = canvas.offsetHeight || 1080;
      line.style.setProperty('--chapter-mid', `${((margin || 0) + frameH * 0.052).toFixed(1)}px`);
      line.style.fontSize = `${(frameH * 0.027).toFixed(1)}px`;
      line.getBoundingClientRect();
      line.classList.add('is-in');
      promoSfx('chapter');
      // the letters fly in from outward to their place, one after another
      if (prefersReducedMotion()) return;
      a.textContent = '';
      const mid = (from.length - 1) / 2;
      [...from].forEach((char, i) => {
        const letter = document.createElement('span');
        letter.className = 'promo-chapter__l';
        letter.textContent = char;
        const out = (i - mid) / Math.max(1, mid);
        letter.style.setProperty('--lx', `${(out * 1.6).toFixed(2)}em`);
        letter.style.setProperty('--ly', `${(((i * 37) % 7) - 3) * 0.12}em`);
        letter.style.setProperty('--ld', `${i * PROMO_CHAPTER_CHAR_MS}ms`);
        a.appendChild(letter);
      });
    }

    // one chapter hands over to the next: the old chip leaves, the new one flies in
    nextChapter(from, to, reduced = false) {
      this.hideChapter();
      window.setTimeout(() => this.showChapter(from, to), reduced ? 0 : 340);
    }

    resolveChapter() {
      const line = this.root.querySelector('[data-promo-chapter]');
      if (!line || line.classList.contains('is-struck')) return;
      line.classList.add('is-struck');
      promoSfx('chapter-tick');
    }

    hideChapter() {
      this.root.querySelector('[data-promo-chapter]')?.classList.remove('is-in');
    }

    async rememberPitchLead() {
      const store = this.painStore();
      if (!store) return;
      const previous = glideLeadDevice;
      glideLeadDevice = 'desktop';
      this.pitchLeadKey = glideLeadCell(this.gridFrame())?.key || '';
      glideLeadDevice = previous;
      this.pinWidgetInStore(store);
      await this.rememberRaster(store, this.pitchLeadKey);
    }

    // A still of the live widget card, pinned into the store window where the
    // card sits, so the zoom-out keeps the widget in the picture.
    pinWidgetInStore(store) {
      const card = document.querySelector('.bizmis-desktop-lite-chat');
      if (!card || store.querySelector('[data-promo-widget-still]')) return;
      const storeBox = store.getBoundingClientRect();
      const cardBox = card.getBoundingClientRect();
      if (cardBox.width < 8) return;
      const scale = storeBox.width / (store.offsetWidth || storeBox.width) || 1;
      const clone = card.cloneNode(true);
      inlineRasterTree(card, clone);
      clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
      const native = card.offsetWidth || cardBox.width;
      const width = cardBox.width / scale;
      Object.assign(clone.style, {
        position: 'absolute',
        left: '0',
        top: '0',
        right: 'auto',
        bottom: 'auto',
        margin: '0',
        width: `${native}px`,
        transformOrigin: 'top left',
        transform: `scale(${(width / native).toFixed(4)})`,
      });
      const still = document.createElement('div');
      still.setAttribute('data-promo-widget-still', '');
      // Placed in percent of the store, so it stays in the corner however
      // the sea scales the window.
      const pct = (value, total) => `${((value / total) * 100).toFixed(3)}%`;
      Object.assign(still.style, {
        position: 'absolute',
        left: 'auto',
        top: 'auto',
        right: pct(storeBox.right - cardBox.right, storeBox.width),
        bottom: pct(storeBox.bottom - cardBox.bottom, storeBox.height),
        width: pct(cardBox.width, storeBox.width),
        height: pct(cardBox.height, storeBox.height),
        zIndex: '30',
        pointerEvents: 'none',
      });
      if (getComputedStyle(store).position === 'static') store.style.position = 'relative';
      still.appendChild(clone);
      // Before any veil or mark: store captures drop those and then pair
      // styles by child index, so anything after them gets the wrong style.
      const veil = store.querySelector(':scope > .promo-close__veil, :scope > .promo-close__mark, :scope > .promo-glide__veil, :scope > .promo-glide__mark, :scope > .promo-glide__lost-mark, :scope > .promo-close__lost-mark');
      if (veil) store.insertBefore(still, veil);
      else store.appendChild(still);
    }

    bizmisLook() {
      return {
        model: PROMO_BIZMIS_AVATAR_MODEL_URL,
        meshColors: PROMO_BIZMIS_MESH_COLORS,
        stamp: document.documentElement.getAttribute('data-promo-bizmis-stamp'),
        stampScale: PROMO_BIZMIS_STAMP_SCALE,
        stampOffsetX: PROMO_BIZMIS_STAMP_OFFSET_X,
      };
    }

    stopGlide() {
      if (!this.glideFrame) return;
      window.cancelAnimationFrame(this.glideFrame);
      this.glideFrame = 0;
    }

    settleClerkRow() {
      const widget = this.root.querySelector('[data-promo-widget]');
      const animation = this.clerkMove;
      this.clerkMove = null;
      if (widget) {
        widget.style.transition = '';
        widget.style.transform = '';
        widget.style.transformOrigin = '';
      }
      if (animation) animation.cancel();
    }

    playClerkScale(fromScale, fromLift, toScale, toLift) {
      const embed = this.parkedEmbed || document.getElementById('bizmis-avatar-embed');
      if (!embed) return;
      window.cancelAnimationFrame(this.clerkScaleFrame);
      if (prefersReducedMotion()) {
        embed.style.setProperty('--promo-avatar-scale', String(toScale));
        embed.style.setProperty('--promo-avatar-lift', `${toLift}px`);
        return;
      }
      const started = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - started) / PROMO_CLERK_CORNER_MS);
        const eased = 1 - (1 - t) ** 3;
        const scale = fromScale + (toScale - fromScale) * eased;
        const lift = fromLift + (toLift - fromLift) * eased;
        embed.style.setProperty('--promo-avatar-scale', scale.toFixed(4));
        embed.style.setProperty('--promo-avatar-lift', `${lift.toFixed(2)}px`);
        if (t < 1) this.clerkScaleFrame = window.requestAnimationFrame(step);
      };
      step(started);
    }

    seatClipWidget() {
      this.root.classList.remove('is-clerk-corner', 'is-clerk-head', 'is-clerk-moving');
      this.root.classList.add('is-pitch-cards');
      this.seatLiveCard(true);
    }

    poseMomentWidget(clip) {
      const beat = PROMO_MOMENT_WIDGET[clip?.motion] || { action: 'idle_neutral' };
      this.clearPitchEvents();
      const place = () => {
        setOpeningAvatarAction(beat.action);
        if (!beat.event) return;
        this.clearPitchEvents();
        this.paintPitchEvent({ kind: beat.event });
      };
      let tries = 0;
      const run = () => {
        const ready = document.querySelector('#bizmis-avatar-embed canvas, .bizmis-mobile-lite-chat, .bizmis-bar-row');
        tries += 1;
        if (!ready && tries < 40) {
          window.setTimeout(run, 100);
          return;
        }
        place();
        window.setTimeout(place, 220);
      };
      run();
    }

    seatLiveCard(instant) {
      const widget = this.root.querySelector('[data-promo-widget]');
      const store = this.painStore();
      const embed = this.parkedEmbed || document.getElementById('bizmis-avatar-embed');
      if (!widget || !store) return;
      document.documentElement.classList.add('is-promo-live-card');
      document.documentElement.classList.remove('is-promo-card-out');
      hideSayThisBubbles();
      if (embed) {
        embed.style.setProperty('--promo-avatar-scale', '1');
        embed.style.setProperty('--promo-avatar-lift', '0px');
      }
      const from = widget.getBoundingClientRect();
      if (widget.parentElement !== store) store.appendChild(widget);
      widget.style.top = 'auto';
      widget.style.left = 'auto';
      widget.style.right = '';
      widget.style.bottom = '';
      widget.style.margin = '0';
      widget.style.transformOrigin = 'top left';
      widget.style.transition = 'none';
      widget.style.transform = 'none';
      if (instant) return;
      const to = widget.getBoundingClientRect();
      const dx = from.left - to.left;
      const dy = from.top - to.top;
      const scale = to.width > 8 ? from.width / to.width : 1;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(scale - 1) < 0.04) return;
      widget.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${scale.toFixed(4)})`;
      widget.getBoundingClientRect();
      widget.style.transition = 'transform 900ms cubic-bezier(0.22, 1, 0.36, 1)';
      widget.style.transform = 'none';
      window.setTimeout(() => {
        if (!document.documentElement.classList.contains('is-promo-live-card')) return;
        widget.style.transition = '';
        widget.style.transform = '';
        widget.style.transformOrigin = '';
      }, 940);
    }

    async releaseLiveCard() {
      const widget = this.root.querySelector('[data-promo-widget]');
      const stage = this.root.querySelector('.promo-opening__stage');
      document.documentElement.classList.add('is-promo-card-out');
      if (!prefersReducedMotion()) await waitMs(420);
      if (widget && stage && widget.parentElement !== stage) stage.appendChild(widget);
      if (widget) {
        widget.style.top = '';
        widget.style.left = '';
        widget.style.right = '';
        widget.style.bottom = '';
        widget.style.margin = '';
        widget.style.transform = '';
        widget.style.transformOrigin = '';
        widget.style.transition = '';
      }
      document.documentElement.classList.remove('is-promo-live-card', 'is-promo-saying');
      releaseSayThisBubbles();
      this.clearPitchEvents();
    }

    seatClerkInStore(instant) {
      const embed = this.parkedEmbed || document.getElementById('bizmis-avatar-embed');
      const widget = this.root.querySelector('[data-promo-widget]');
      const canvas = this.root.querySelector('[data-promo-canvas]');
      const store = this.root.querySelector('.promo-opening__store');
      if (store) {
        store.style.visibility = '';
        store.style.opacity = '';
      }
      this.root.classList.remove('is-close-seat');
      this.root.classList.add('is-moments');
      const stage = this.momentStage();
      void stage?.offsetWidth;
      if (stage && !this.root.classList.contains('is-clip-moment')) {
        stage.querySelector('.promo-moments__board')?.removeAttribute('data-grid-laid');
        applyMomentPose(stage, 'grid', { instant: true });
      }
      if (!embed || !widget || !canvas || !store) return;
      if (this.root.classList.contains('is-pitch-cards') && !this.root.classList.contains('is-clip-moment')) {
        this.seatLiveCard(instant || prefersReducedMotion());
        return;
      }
      this.settleClerkRow();
      this.clerkCornerActive = true;
      const snap = instant || prefersReducedMotion();
      this.root.classList.toggle('is-clerk-instant', snap);
      if (!snap) this.root.classList.add('is-clerk-moving');
      canvas.getBoundingClientRect();
      const storeBox = store.getBoundingClientRect();
      const canvasBox = canvas.getBoundingClientRect();
      if (storeBox.width < 40 || canvasBox.width < 40) return;
      const clipMoment = this.root.classList.contains('is-clip-moment');
      const scale = clipMoment ? (this.clipClerkScale || 0.72) : PROMO_CLERK_CORNER_SCALE;
      const insetX = clipMoment ? 28 : PROMO_CLERK_CORNER_INSET_X;
      const insetY = clipMoment ? 18 : PROMO_CLERK_CORNER_INSET_Y;
      const height = PROMO_AVATAR_BOX_H * scale;
      const right = canvasBox.right - (storeBox.right - insetX);
      const top = storeBox.bottom - insetY - height - canvasBox.top;
      this.root.style.setProperty('--promo-clerk-top', `${top.toFixed(1)}px`);
      this.root.style.setProperty('--promo-clerk-right', `${right.toFixed(1)}px`);
      if (snap) {
        embed.style.setProperty('--promo-avatar-scale', String(scale));
        embed.style.setProperty('--promo-avatar-lift', '0px');
        this.root.classList.add('is-clerk-corner');
        return;
      }
      embed.style.setProperty('--promo-avatar-scale', String(PROMO_AVATAR_MAX_SCALE));
      embed.style.setProperty('--promo-avatar-lift', `${PROMO_AVATAR_LIFT_PX}px`);
      window.requestAnimationFrame(() => {
        this.root.classList.add('is-clerk-corner');
        this.playClerkScale(PROMO_AVATAR_MAX_SCALE, PROMO_AVATAR_LIFT_PX, PROMO_CLERK_CORNER_SCALE, 0);
      });
    }

    restoreClerkSeat() {
      if (!this.clerkCornerActive && !this.root.classList.contains('is-clerk-corner')) return;
      if (prefersReducedMotion()) {
        this.root.classList.remove('is-clerk-corner', 'is-clerk-instant', 'is-clerk-moving');
        this.clerkCornerActive = false;
        this.fitClerk();
        return;
      }
      this.root.classList.remove('is-clerk-instant');
      this.root.classList.add('is-clerk-moving');
      window.requestAnimationFrame(() => {
        this.root.classList.remove('is-clerk-corner');
        this.playClerkScale(PROMO_CLERK_CORNER_SCALE, 0, PROMO_AVATAR_MAX_SCALE, PROMO_AVATAR_LIFT_PX);
      });
      window.setTimeout(() => {
        this.clerkCornerActive = false;
        this.root.classList.remove('is-clerk-moving');
        this.fitClerk();
      }, PROMO_CLERK_CORNER_MS + 80);
    }

    glideClerkIntoRow(positionClass = 'is-see-row') {
      const embed = this.parkedEmbed || document.getElementById('bizmis-avatar-embed');
      const widget = this.root.querySelector('[data-promo-widget]');
      const park = () => {
        this.root.classList.add(positionClass);
        if (positionClass === 'is-see-row') this.root.classList.remove('is-moments');
      };
      if (!embed || !widget || prefersReducedMotion()) {
        park();
        return;
      }

      const first = embed.getBoundingClientRect();
      park();
      const last = embed.getBoundingClientRect();
      const dx = first.left - last.left;
      const dy = first.top - last.top;
      const still = Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5;
      if (still) return;

      const from = `translate(${dx}px, ${dy}px) translateY(-50%)`;
      const to = 'translate(0px, 0px) translateY(-50%)';
      widget.style.transition = 'none';
      widget.style.transformOrigin = 'center center';
      widget.style.transform = from;
      this.clerkMove?.cancel();
      const animation = widget.animate(
        [
          { transform: from },
          { transform: to },
        ],
        {
          duration: PROMO_CLERK_ROW_MS,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'both',
        },
      );
      this.clerkMove = animation;
      animation.finished.then(() => {
        if (this.clerkMove !== animation) return;
        this.settleClerkRow();
      }).catch(() => { });
    }

    resetSee() {
      this.stopGlide();
      this.settleClerkRow();
      this.root.classList.remove(
        'is-see',
        'is-see-in',
        'is-see-docked',
        'is-see-row',
        'is-see-landed',
        'is-moments'
      );
      this.carouselTrack?.querySelectorAll('.promo-opening__slide').forEach((slide) => {
        slide.classList.remove('is-on');
      });
      if (this.carouselTrack) {
        this.carouselTrack.style.transition = '';
        this.carouselTrack.style.transform = '';
        [...this.carouselTrack.children].forEach((slide) => {
          slide.style.transform = '';
          slide.style.transformOrigin = '';
          slide.style.zIndex = '';
          slide.style.removeProperty('--promo-wheel-fade');
          slide.style.removeProperty('--promo-wheel-focus');
        });
      }
    }

    carouselOffset(index) {
      const track = this.carouselTrack;
      const slide = track?.children[index];
      const view = track?.parentElement;
      if (!track || !slide || !view) return 0;
      const targetLeft = (view.clientWidth - slide.offsetWidth) / 2;
      return slide.offsetLeft - targetLeft;
    }

    wheelTransform(distance, shift) {
      const abs = Math.abs(distance);
      const sign = Math.sign(distance) || 1;
      const yaw = sign * wheelYaw(abs);
      const depth = wheelDepth(abs);
      const scale = wheelScale(abs);
      return `translate3d(${shift}px, 0, ${-depth}px) rotateY(${yaw}deg) scale(${scale})`;
    }

    applyWheel(activeIndex) {
      const track = this.carouselTrack;
      if (!track) return;
      const slides = [...track.children];
      const count = slides.length;
      const stride = count > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : 0;
      slides.forEach((slide, index) => {
        const layout = index - activeIndex;
        const distance = loopDistance(index, activeIndex, count);
        const shift = stride * (distance - layout);
        const abs = Math.abs(distance);
        slide.style.transform = this.wheelTransform(distance, shift);
        slide.style.transformOrigin = 'center center';
        slide.style.zIndex = String(1000 - Math.round(abs * 100));
        slide.style.setProperty('--promo-wheel-fade', String(wheelFade(abs)));
        slide.style.setProperty('--promo-wheel-focus', wheelFocus(abs).toFixed(4));
      });
      this.paintClerkGlow(activeIndex);
    }

    ensureClerkGlow() {
      const widget = this.root.querySelector('[data-promo-widget]');
      const host = widget?.parentElement;
      if (!host) return null;
      let glow = this.root.querySelector('[data-promo-clerk-glow]');
      if (!glow) {
        glow = document.createElement('div');
        glow.className = 'promo-opening__clerk-glow';
        glow.setAttribute('data-promo-clerk-glow', '');
        glow.setAttribute('aria-hidden', 'true');
      }
      if (glow.parentElement !== host) host.appendChild(glow);
      return glow;
    }

    paintClerkGlow(activeIndex) {
      const glow = this.clerkGlow;
      const stores = this.stores || [];
      if (!glow || !stores.length) return;
      const count = stores.length;
      const max = count - 1;
      const base = Math.max(0, Math.min(max, Math.floor(activeIndex)));
      const next = Math.min(max, base + 1);
      const leftFocus = wheelFocus(Math.abs(loopDistance(base, activeIndex, count)));
      const rightFocus = next === base
        ? 0
        : wheelFocus(Math.abs(loopDistance(next, activeIndex, count)));
      const total = leftFocus + rightFocus;
      const amount = total > 0 ? rightFocus / total : 0;
      glow.style.setProperty('--promo-clerk-glow', mixAccent(stores[base].accent, stores[next].accent, amount));
    }

    syncWheelPerspective() {
      const view = this.carouselTrack?.parentElement;
      if (view) view.style.perspectiveOrigin = 'center center';
    }

    placeCarousel(index, snap) {
      const track = this.carouselTrack;
      if (!track) return;
      if (snap) track.style.transition = 'none';
      track.style.transform = `translate3d(${-this.carouselOffset(index)}px, 0, 0)`;
      this.syncWheelPerspective();
      this.applyWheel(index);
      if (snap) {
        track.getBoundingClientRect();
        track.style.transition = '';
      }
    }

    setActiveSlide(index, landed) {
      const slides = this.carouselTrack
        ? [...this.carouselTrack.querySelectorAll('.promo-opening__slide')]
        : [];
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-on', slideIndex === index);
      });
      this.root.classList.toggle('is-see-landed', Boolean(landed));
    }

    highlightStore(index, landed, snap) {
      this.setActiveSlide(index, landed);
      if (index >= 0) this.placeCarousel(index, Boolean(snap));
    }

    snapSeeLanded() {
      const ask = promoVideoConfig.cta !== 'demo' && promoVideoConfig.cta !== 'none';
      this.root.classList.add('is-see', 'is-see-in', 'is-see-docked', 'is-see-row', 'is-see-landed', 'is-see-wave');
      if (ask) {
        this.paintWave(-1, 0, 0);
        this.root.classList.add('is-see-cta', 'is-cta-aim');
      } else {
        this.paintWave(this.landIndex, 1, 0.5);
      }
      const store = this.stores[this.landIndex];
      if (store) promoWidget.applyStoreLook(store);
    }

    showReducedSee() {
      document.documentElement.style.setProperty('--ad-warmth', '1');
      this.releasePainStage();
      document.documentElement.classList.add('is-promo-pitch');
      this.root.classList.add('is-on', 'is-bursting', 'is-holding', 'is-pitch', 'is-logo-leaving');
      window.requestAnimationFrame(() => this.fitOpeningLayout());
      this.armPark();
      document.documentElement.classList.add('is-promo-clerk');
      this.snapSeeLanded();
      window.setTimeout(() => this.revealStore(), PROMO_SEE_REDUCED_HOLD_MS);
    }

    clearMomentTimers() {
      (this.momentTimers || []).forEach((timer) => window.clearTimeout(timer));
      this.momentTimers = [];
    }

    ensureMoments() {
      const copy = this.root.querySelector('.promo-opening__copy');
      if (!copy) return null;
      let host = copy.querySelector('[data-promo-moments]');
      if (!host) {
        host = document.createElement('div');
        host.className = 'promo-opening__moments';
        host.setAttribute('data-promo-moments', '');
        host.setAttribute('aria-hidden', 'true');
        const label = document.createElement('p');
        label.className = 'promo-opening__moments-label';
        label.setAttribute('data-promo-moments-label', '');
        const stage = document.createElement('div');
        stage.className = 'promo-opening__moments-stage';
        stage.setAttribute('data-promo-moments-stage', '');
        host.append(label, stage);
        const stores = copy.querySelector('[data-promo-stores]');
        copy.insertBefore(host, stores);
      }
      if (!host.querySelector('.promo-opening__store')) {
        const store = document.createElement('div');
        store.className = 'promo-opening__store';
        const bar = document.createElement('div');
        bar.className = 'promo-opening__store-bar';
        const brand = document.createElement('span');
        brand.className = 'promo-opening__store-brand';
        const mark = document.createElement('span');
        mark.className = 'promo-opening__store-mark';
        mark.setAttribute('aria-hidden', 'true');
        mark.innerHTML = PROMO_STORE_MARK;
        const name = document.createElement('span');
        name.className = 'promo-opening__store-name';
        name.textContent = 'Your store';
        brand.append(mark, name);
        const cart = document.createElement('div');
        cart.className = 'promo-moments__cart';
        cart.setAttribute('aria-hidden', 'true');
        cart.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 7h13l-1.4 8.2H8.1L6.5 7z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M6.5 7 5.2 4H2.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="9.2" cy="19.2" r="1.35" fill="currentColor"/><circle cx="16.6" cy="19.2" r="1.35" fill="currentColor"/></svg><span class="promo-moments__count is-one">1</span><span class="promo-moments__count is-two">2</span>';
        bar.append(brand, cart);
        const field = host.querySelector('.promo-opening__moments-field');
        const stage = host.querySelector('[data-promo-moments-stage]');
        if (field) store.appendChild(field);
        store.appendChild(bar);
        if (stage) store.appendChild(stage);
        host.insertBefore(store, host.firstChild);
      }
      if (!host.querySelector('.promo-opening__browser')) {
        const browser = document.createElement('div');
        browser.className = 'promo-opening__browser';
        browser.innerHTML = '<span class="promo-opening__browser-dots" aria-hidden="true"><i data-promo-window-close></i><i></i><i></i></span><span class="promo-opening__browser-pill" aria-hidden="true"></span>';
        host.querySelector('.promo-opening__store')?.prepend(browser);
      }
      host.querySelector('.promo-opening__browser-dots i')?.setAttribute('data-promo-window-close', '');
      host.querySelector('.promo-opening__collection')?.remove();
      host.querySelector('.promo-opening__search')?.remove();
      host.querySelector('.promo-moments__fest')?.remove();
      const storeMark = host.querySelector('.promo-opening__store-mark');
      if (storeMark) {
        storeMark.innerHTML = PROMO_STORE_MARK;
        const bar = storeMark.closest('.promo-opening__store-bar');
        let brand = storeMark.closest('.promo-opening__store-brand');
        if (bar && !brand) {
          brand = document.createElement('span');
          brand.className = 'promo-opening__store-brand';
          bar.insertBefore(brand, storeMark);
          brand.appendChild(storeMark);
        }
        if (brand && !brand.querySelector('.promo-opening__store-name')) {
          const name = document.createElement('span');
          name.className = 'promo-opening__store-name';
          name.textContent = 'Your store';
          brand.appendChild(name);
        }
      }
      host.querySelectorAll('.promo-moments__cart-piece').forEach((piece) => piece.remove());
      host.querySelectorAll('.promo-moments__cart').forEach((cart) => {
        if (cart.querySelector('.promo-moments__cart-burst')) return;
        const burst = document.createElement('span');
        burst.className = 'promo-moments__cart-burst';
        burst.setAttribute('aria-hidden', 'true');
        cart.prepend(burst);
      });
      if (!host.querySelector('.promo-moments__fly')) {
        const fly = document.createElement('span');
        fly.className = 'promo-moments__fly';
        fly.setAttribute('aria-hidden', 'true');
        host.appendChild(fly);
      }
      if (!host.querySelector('.promo-opening__moments-field')) {
        const field = document.createElement('div');
        field.className = 'promo-opening__moments-field';
        field.setAttribute('aria-hidden', 'true');
        ['is-rose', 'is-orange', 'is-blue'].forEach((name) => {
          const blob = document.createElement('span');
          blob.className = `promo-opening__moments-blob ${name}`;
          field.appendChild(blob);
        });
        host.querySelector('.promo-opening__store')?.appendChild(field);
      }
      this.root.style.setProperty('--promo-moments-label', String(PROMO_MOMENTS_LABEL_RATIO));
      this.root.style.setProperty('--promo-moments-payoff', String(PROMO_MOMENTS_PAYOFF_RATIO));
      this.root.style.setProperty('--promo-moments-accessory', `${PROMO_MOMENTS_ACCESSORY_MS}ms`);
      this.root.style.setProperty('--promo-moments-orbit', `${PROMO_MOMENTS_ORBIT_MS}ms`);
      this.root.style.setProperty('--promo-moments-vapor', `${PROMO_MOMENTS_VAPOR_MS}ms`);
      this.root.style.setProperty('--promo-close-cart-at', `${PROMO_MOMENTS_VAPOR_MS + PROMO_MOMENTS_CART_GAP_MS}ms`);
      this.root.style.setProperty('--promo-moments-collapse', `${PROMO_MOMENTS_COLLAPSE_MS}ms`);
      this.root.style.setProperty('--promo-moments-fly', `${PROMO_MOMENTS_FLY_MS}ms`);
      this.root.style.setProperty('--promo-moments-tick', `${PROMO_MOMENTS_BADGE_TICK_MS}ms`);
      this.root.style.setProperty('--promo-moments-choice', `${PROMO_MOMENTS_CHOICE_MS}ms`);
      this.root.style.setProperty('--promo-compare-fold', `${PROMO_MOMENTS_CHOICE_MS - 200}ms`);
      this.root.style.setProperty('--promo-settle-end', `${PROMO_MOMENTS_DOCK_MS}ms`);
      this.root.style.setProperty('--promo-bundle-celebrate', `${PROMO_MOMENTS_BUNDLE_CELEBRATE_MS}ms`);
      this.root.style.setProperty('--promo-ring-gap', `${PROMO_MOMENT_RING_GAP_MS}ms`);
      this.root.style.setProperty('--promo-other-ring', `${PROMO_MOMENT_OTHER_RING_MS}ms`);
      this.root.style.setProperty('--promo-catalog-seek', `${PROMO_MOMENT_SEEK_MS}ms`);
      return host;
    }

    momentStage() {
      return this.ensureMoments()?.querySelector('[data-promo-moments-stage]') || null;
    }

    showMoment(beat, settled) {
      const stage = this.momentStage();
      const host = this.root.querySelector('[data-promo-moments]');
      if (host) host.setAttribute('aria-hidden', 'false');
      if (!stage) return;
      this.clearMomentTimers();
      applyMomentPose(stage, settled ? beat.endPose : beat.holdPose, {
        instant: settled,
      });
    }

    playMoment(beat) {
      const stage = this.momentStage();
      if (!stage) return;
      if (beat.playPose === 'row' && !prefersReducedMotion()) {
        const board = stage.querySelector('.promo-moments__board');
        const seek = momentCatalogSeek(board);
        board?.classList.add('is-shortlist');
        this.momentTimers.push(window.setTimeout(() => {
          board?.style.setProperty('--moment-scroll', `${seek}px`);
          board?.classList.add('is-catalog-seek');
        }, PROMO_MOMENT_SEEK_AT_MS));
        this.momentTimers.push(window.setTimeout(() => {
          board?.classList.remove('is-catalog-seek', 'is-shortlist');
          applyMomentPose(stage, 'row');
        }, PROMO_MOMENTS_SHORTLIST_MS));
      } else {
        applyMomentPose(stage, beat.playPose);
      }
      if (beat.nod) setOpeningAvatarAction('nod');
      else if (beat.wave) setOpeningAvatarAction('waving');
      if (beat.playPose === 'extra' && !prefersReducedMotion()) {
        this.momentTimers.push(window.setTimeout(() => {
          this.emitClick();
        }, PROMO_MOMENTS_DOCK_MS));
      }
      if (typeof beat.closeAt === 'number' || typeof beat.bundleAt === 'number') {
        const at = beat.closeAt ?? beat.bundleAt;
        this.momentTimers.push(window.setTimeout(() => {
          applyMomentPose(stage, beat.endPose);
        }, beat.speakMs * at));
      }
    }

    async playMoments(onDone) {
      const sell = this.root.querySelector('.promo-opening__word--sell');
      const reduced = prefersReducedMotion();
      sell?.classList.remove('is-in');
      sell?.classList.add('is-out');
      if (!reduced) await waitMs(PROMO_SELL_OUT_MS);
      this.seatClerkInStore(reduced);
      if (!reduced) await waitMs(PROMO_CLERK_CORNER_MS);

      for (const [index, beat] of PROMO_MOMENT_BEATS.entries()) {
        if (index === 2) {
          markPromoVo('narrows');
          if (!reduced) await waitMs(promoVoGuard('narrows'));
        }
        this.showMoment(beat, reduced);
        if (!reduced && beat.lookMs) await waitMs(beat.lookMs);
        await waitMs(beat.voMs);
        if (reduced) {
          await waitMs(beat.speakMs);
        } else {
          await playClerkLine(beat.line, beat.speakMs, () => this.playMoment(beat));
          applyMomentPose(this.momentStage(), beat.endPose, {
            instant: true,
          });
          await waitMs(beat.holdMs || PROMO_MOMENTS_TAIL_MS);
        }
      }
      this.clearMomentTimers();
      endOpeningAgent();
      setOpeningAvatarAction('nod');
      applyMomentPose(this.momentStage(), 'bundle', { instant: true });
      markPromoVo('closes');
      onDone();
    }

    seeEndIndex() {
      const cta = this.carouselTrack?.querySelector('.promo-opening__slide.is-cta');
      if (!cta || !this.carouselTrack) return this.landIndex;
      return [...this.carouselTrack.children].indexOf(cta);
    }

    releaseSea() {
      window.cancelAnimationFrame(this.planeFrame);
      this.stopGlide();
      this.root.classList.remove(
        'is-close-seat',
        'is-scale-white',
        'is-scale-zero',
        'is-grid-locked',
        'is-pitch-belt',
        'is-clerk-corner',
      );
      this.root.classList.add('is-scale-out');
      const scale = this.root.querySelector('.promo-scale');
      if (scale) {
        scale.style.transition = 'none';
        scale.style.opacity = '0';
      }
    }

    holdOrangeField() {
      this.stopGlide();
      this.root.classList.remove('is-scale-out', 'is-scale-white', 'is-scale-zero');
      this.root.classList.add('is-store-pass', 'is-see', 'is-see-in', 'is-see-docked', 'is-see-row', 'is-see-wave', 'is-end-pitch');
      document.documentElement.classList.add('is-promo-clerk');
      const scale = this.root.querySelector('[data-promo-scale]');
      if (scale) {
        scale.hidden = false;
        scale.style.opacity = '1';
        const stores = this.root.querySelector('[data-promo-stores]');
        if (stores && stores.parentElement !== scale) scale.appendChild(stores);
        if (stores) {
          stores.style.position = 'absolute';
          stores.style.inset = '0';
          stores.style.left = '0';
          stores.style.right = '0';
          stores.style.width = '100%';
          stores.style.maxWidth = 'none';
          stores.style.margin = '0';
          stores.style.transform = 'none';
        }
        const widget = this.root.querySelector('[data-promo-widget]');
        if (widget && widget.parentElement !== scale) scale.appendChild(widget);
      }
      const field = this.root.querySelector('.promo-glide__field');
      if (field) field.style.opacity = '1';
      const verdict = this.root.querySelector('[data-promo-scale-verdict]');
      if (verdict) {
        verdict.style.opacity = '1';
        verdict.style.transform = 'none';
      }
      const sold = this.root.querySelector('.promo-scale__sold');
      if (sold) sold.style.opacity = '0';
      const mark = this.root.querySelector('[data-promo-end-mark]');
      if (mark) {
        mark.style.background = 'var(--bizmis-primary)';
        mark.style.transition = 'background-color 800ms linear';
      }
      this.ensurePassLight();
      this.root.querySelectorAll('.promo-opening__slide').forEach((slide) => {
        const sector = slide.querySelector('.promo-opening__slide-sector');
        const name = slide.querySelector('.promo-opening__slide-name');
        const store = this.stores.find((item) => item.slug === slide.dataset.store);
        if (!store) return;
        const ink = storeInk(store.accent);
        if (sector) sector.style.color = ink;
        if (name) name.style.color = ink;
      });
    }

    ensurePassLight() {
      const scale = this.root.querySelector('[data-promo-scale]');
      if (!scale) return null;
      let light = scale.querySelector('[data-promo-pass-light]');
      if (light) return light;
      light = document.createElement('div');
      light.className = 'promo-pass-light';
      light.setAttribute('data-promo-pass-light', '');
      light.setAttribute('aria-hidden', 'true');
      const glide = scale.querySelector('.promo-glide');
      if (glide) glide.after(light);
      else scale.prepend(light);
      return light;
    }

    paintPassLight() {
      // The light is driven every frame by runPassLight.
    }

    // Trailer lighting for one store: the backlight is at its brightest and
    // almost still at the middle of the hold, then speeds up and dims to its
    // lowest right at the switch. Brightness follows sin^2, the sweep moves
    // fastest where the light is dimmest.
    runPassLight(durationMs) {
      this.stopPassLight();
      const root = this.root;
      const start = performance.now();
      const span = Math.max(400, durationMs);
      const frame = () => {
        const now = performance.now();
        const u = Math.min(1, (now - start) / span);
        const t = now / 1000;
        // Slow waves at unrelated rates: the light drifts and breathes on
        // its own, on top of the sin^2 cycle, and never repeats.
        const drift = (a, b, c) => Math.sin(t * a + c) * 0.6 + Math.sin(t * b + c * 1.7) * 0.4;
        const glow = Math.sin(Math.PI * u) ** 2 * (0.86 + 0.14 * drift(1.3, 2.9, 0.4));
        const sweep = u + Math.sin(2 * Math.PI * u) / (2 * Math.PI);
        const x = (-1 + 2 * sweep) * 150 + 70 * drift(0.7, 1.9, 1.1);
        const y = Math.sin(Math.PI * sweep) * -40 + 45 * drift(0.9, 1.6, 2.3);
        root.style.setProperty('--pass-glow', Math.max(0.05, 0.08 + 0.92 * glow).toFixed(3));
        root.style.setProperty('--pass-glow-x', `${x.toFixed(1)}px`);
        root.style.setProperty('--pass-glow-y', `${y.toFixed(1)}px`);
        root.style.setProperty('--pass-glow-spread', (1 + 0.12 * drift(0.5, 1.2, 0.8)).toFixed(3));
        if (u < 1) this.passLightFrame = window.requestAnimationFrame(frame);
      };
      frame();
    }

    stopPassLight() {
      if (this.passLightFrame) window.cancelAnimationFrame(this.passLightFrame);
      this.passLightFrame = 0;
    }

    // Only the store on screen plays its clip, with its sound, from its
    // chosen moment. Each stretch is logged in window.__promoAudioCues so the
    // exporter can lay the same sound under the frames.
    playPassVideo(slides, index) {
      const now = performance.now();
      slides.forEach((slide, slideIndex) => {
        const video = slide.querySelector('video.promo-opening__slide-video');
        if (!video) return;
        const on = slideIndex === index;
        const start = Number(video.dataset.promoStart) || 0;
        if (!on) {
          if (video._promoCue && video._promoCue.endMs == null) video._promoCue.endMs = now;
          video.dataset.promoIdle = '1';
          video.muted = true;
          video.pause();
          return;
        }
        // The clip plays silent: each store gets a short recorded
        // confirmation from the clerk instead (store-N voices).
        video.muted = true;
        if (video.dataset.promoIdle === '1' || video.dataset.promoArmed !== '1') {
          video.dataset.promoArmed = '1';
          video.__promoOriginMs = null;
          try {
            video.currentTime = start;
          } catch {
            /* metadata not ready yet */
          }
        }
        delete video.dataset.promoIdle;
        if (!document.documentElement.classList.contains('is-promo-export')) video.play().catch(() => { });
      });
    }

    orderPassStores() {
      if (!this.carouselTrack) return;
      const slides = [...this.carouselTrack.querySelectorAll('.promo-opening__slide')];
      const paired = this.stores.map((store, index) => ({ store, slide: slides[index] }));
      paired.sort((a, b) => {
        const ai = PROMO_PASS_SECTORS.indexOf(a.store.sector);
        const bi = PROMO_PASS_SECTORS.indexOf(b.store.sector);
        return (ai < 0 ? PROMO_PASS_SECTORS.length : ai) - (bi < 0 ? PROMO_PASS_SECTORS.length : bi);
      });
      this.stores = paired.map((item) => item.store);
      paired.forEach((item) => {
        if (item.slide) this.carouselTrack.appendChild(item.slide);
      });
    }

    playStorePass(onDone, rack = null) {
      document.documentElement.classList.remove('is-promo-card-out');
      const slides = this.carouselTrack
        ? [...this.carouselTrack.querySelectorAll('.promo-opening__slide')]
        : [];
      if (!slides.length) {
        onDone();
        return;
      }
      speakNarrator('t-stores');
      const finalSlide = this.ensureFinalPassSlide();
      if (finalSlide && !slides.includes(finalSlide)) slides.push(finalSlide);
      const count = slides.length;
      // The first two stores hold long enough to read; then each store is
      // shorter than the last, so the pass gathers speed into "Your store".
      const durations = slides.map((slide, index) => {
        if (slide === finalSlide) return PROMO_PASS_FINAL_MS;
        if (index < 2) return PROMO_PASS_READ_MS;
        return Math.round(Math.max(PROMO_PASS_MIN_MS, PROMO_PASS_STEP_MS * PROMO_PASS_SPEEDUP ** (index - 2)));
      });
      let index = 0;
      slides.forEach((slide) => {
        slide.style.transition = '';
        slide.style.opacity = '';
        slide.style.transform = '';
      });
      const placePassSlides = () => {
        const canvas = this.root.querySelector('[data-promo-canvas]')?.getBoundingClientRect();
        const host = this.root.querySelector('[data-promo-stores]');
        if (!canvas || canvas.width < 40 || !host) return;
        if (this.carouselTrack) {
          this.carouselTrack.style.transform = 'none';
          this.carouselTrack.style.position = 'static';
        }
        const carousel = this.carouselTrack?.parentElement;
        if (carousel) carousel.style.position = 'static';
        // Tag and name share one line above the card, so the card can be taller.
        const width = Math.min(canvas.width * 0.8, canvas.height * 0.74 * (1024 / 640));
        const height = width * (640 / 1024);
        const origin = host.getBoundingClientRect();
        const left = canvas.left + (canvas.width - width) / 2 - origin.left;
        host.style.perspective = '1600px';
        host.style.setProperty('--wheel-r', `${Math.round(height * 0.72)}px`);
        slides.forEach((slide) => {
          slide.style.position = 'absolute';
          slide.style.width = `${width.toFixed(1)}px`;
          slide.style.margin = '0';
          slide.style.right = 'auto';
          slide.style.left = `${left.toFixed(1)}px`;
          slide.style.top = '';
          slide.style.transform = '';
          slide.style.transformOrigin = '';
        });
      };
      const step = () => {
        const isFinal = slides[index] === finalSlide;
        const store = isFinal ? null : this.stores[index];
        if (store) {
          this.arriveStore(store);
          this.paintPassLight(store.accent);
          // A short confirmation from the clerk on each store.
          promoSfx('store-switch', { index });
          const line = PROMO_STORE_VOICES[index % PROMO_STORE_VOICES.length];
          window.setTimeout(() => this.playVoiceSound(line), PROMO_PASS_TITLE_MS);
        }
        this.paintWave(index, 1, 0.5, 1);
        placePassSlides();
        if (isFinal) {
          this.fitFinalWidget(finalSlide);
          this.root.style.setProperty('--promo-store-accent', 'var(--bizmis-primary)');
        }
        slides.forEach((slide, slideIndex) => {
          slide.classList.toggle('is-pass-current', slideIndex === index);
          slide.classList.toggle('is-pass-leaving', slideIndex === index - 1);
          slide.classList.remove('is-pass-tag', 'is-pass-title');
        });
        const current = slides[index];
        // The wheel turn scales with how long the store holds, so a quick
        // store never shows two cards crossing.
        const turnMs = Math.round(Math.min(640, Math.max(300, durations[index] * 0.32)));
        slides.forEach((slide) => slide.style.setProperty('--pass-turn', `${turnMs}ms`));
        this.playPassVideo(slides, index);
        this.runPassLight(durations[index] + (rack && index === 0 ? PROMO_RACK_TOTAL_MS : 0));
        const holdStore = () => {
        window.setTimeout(() => {
          if (current?.classList.contains('is-pass-current')) current.classList.add('is-pass-tag');
        }, PROMO_PASS_TAG_MS);
        window.setTimeout(() => {
          if (current?.classList.contains('is-pass-current')) current.classList.add('is-pass-title');
        }, PROMO_PASS_TITLE_MS);
        window.setTimeout(async () => {
          index += 1;
          if (index >= count) {
            this.paintWave(-1, 0, 0, 0);
            this.paintPassLight(null);
            this.stopPassLight();
            this.playPassVideo(slides, -1);
            if (finalSlide) await this.diveIntoFinal(finalSlide);
            onDone();
            return;
          }
          step();
        }, durations[index]);
        };
        if (rack && index === 0) this.rackFocusIn(current, rack).then(holdStore);
        else holdStore();
      };
      step();
    }

    // The orange "Boost sales with" field is the first store seen fully out
    // of focus, filling the frame. The words fade, then the focus pulls in
    // while the camera eases back to the store's window. Stepped per frame.
    async rackFocusIn(slide, rack) {
      const card = slide?.querySelector('.promo-opening__slide-card');
      if (!card) return;
      slide.classList.add('is-rack');
      const canvas = (this.root.querySelector('[data-promo-canvas]') || this.root).getBoundingClientRect();
      const box = card.getBoundingClientRect();
      const cover = Math.max(canvas.width / box.width, canvas.height / box.height) * 1.06;
      const dx = canvas.left + canvas.width / 2 - (box.left + box.width / 2);
      const dy = canvas.top + canvas.height / 2 - (box.top + box.height / 2);
      card.style.transformOrigin = 'center center';
      // An orange veil over the blurred store: the frame stays Bizmis orange
      // until the focus pulls, then clears to the store's own colors.
      const veil = document.createElement('span');
      veil.className = 'promo-rack-veil';
      card.appendChild(veil);
      const paint = (scale, x, y, blur, opacity) => {
        card.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${scale.toFixed(4)})`;
        card.style.filter = blur > 0.2 ? `blur(${blur.toFixed(1)}px) saturate(1.08)` : '';
        card.style.opacity = opacity.toFixed(3);
      };
      const frames = (ms, draw) => new Promise((resolve) => {
        const began = performance.now();
        const tick = () => {
          const u = Math.min(1, (performance.now() - began) / ms);
          draw(u);
          if (u < 1) window.requestAnimationFrame(tick);
          else resolve();
        };
        tick();
      });
      const smooth = (u) => u * u * (3 - 2 * u);
      // The blurred store fades up over the orange; the words leave.
      await frames(PROMO_RACK_IN_MS, (u) => {
        paint(cover, dx, dy, PROMO_RACK_BLUR_PX, smooth(u));
        veil.style.opacity = '1';
        const words = Math.max(0, 1 - u * 1.6).toFixed(3);
        if (rack.lead) rack.lead.style.opacity = words;
        if (rack.mark) rack.mark.style.opacity = words;
      });
      if (rack.sheet) rack.sheet.style.opacity = '1';
      this.root.classList.add('is-pass-white');
      if (rack.mark) rack.mark.style.opacity = '';
      await waitMs(PROMO_RACK_HOLD_MS);
      // Focus pulls in as the camera eases back to the window.
      await frames(PROMO_RACK_PULL_MS, (u) => {
        const move = u < 0.5 ? 4 * u * u * u : 1 - ((-2 * u + 2) ** 3) / 2;
        const focus = 1 - (1 - u) ** 2.2;
        const scale = cover + (1 - cover) * move;
        paint(scale, dx * (1 - move), dy * (1 - move), PROMO_RACK_BLUR_PX * (1 - focus), 1);
        veil.style.opacity = Math.max(0, 1 - focus * 1.5).toFixed(3);
      });
      veil.remove();
      card.style.transform = '';
      card.style.filter = '';
      card.style.opacity = '';
      card.style.transformOrigin = '';
      slide.classList.remove('is-rack');
    }

    // Plays a recorded clerk line with no avatar on screen (store pass).
    async playVoiceSound(id) {
      // The clerk's store confirmations never talk over the narrator.
      if (performance.now() < (window.__promoNarratorUntil || 0)) return;
      const voice = await clerkVoice(id);
      if (!voice) return;
      const src = `/promo/voice/${id}.wav`;
      const now = performance.now();
      (window.__promoAudioCues = window.__promoAudioCues || []).push({ src, atMs: now, fromSec: 0, endMs: now + voice.durationMs });
      if (!document.documentElement.classList.contains('is-promo-export')) {
        new Audio(src).play().catch(() => { });
      }
    }

    // The last card of the pass: a blank "Your store" window with the Bizmis
    // widget in its corner. The wheel brings it in like any other store.
    ensureFinalPassSlide() {
      if (!this.carouselTrack) return null;
      let slide = this.carouselTrack.querySelector('.promo-opening__slide.is-final');
      if (slide) return slide;
      slide = document.createElement('div');
      slide.className = 'promo-opening__slide is-final';
      slide.style.setProperty('--promo-store-accent', 'var(--bizmis-primary)');
      const meta = document.createElement('div');
      meta.className = 'promo-opening__slide-meta';
      const sector = document.createElement('p');
      sector.className = 'promo-opening__slide-sector';
      sector.textContent = 'Your store';
      sector.style.color = 'var(--promo-orange)';
      meta.appendChild(sector);
      const card = document.createElement('div');
      card.className = 'promo-opening__slide-card promo-pass-final';
      const bar = document.createElement('div');
      bar.className = 'promo-pass-final__bar';
      bar.innerHTML = '<i></i><i></i><i></i>';
      const head = document.createElement('div');
      head.className = 'promo-pass-final__head';
      const brand = document.createElement('span');
      brand.className = 'promo-pass-final__brand';
      brand.innerHTML = `<span class="promo-pass-final__mark">${PROMO_STORE_MARK}</span><span>Your store</span>`;
      head.appendChild(brand);
      const page = document.createElement('div');
      page.className = 'promo-pass-final__page';
      card.append(bar, head, page);
      const widget = document.querySelector('[data-promo-widget-still]');
      if (widget) {
        const copy = widget.cloneNode(true);
        copy.removeAttribute('style');
        copy.className = 'promo-pass-final__widget';
        card.appendChild(copy);
      }
      slide.append(meta, card);
      this.carouselTrack.appendChild(slide);
      return slide;
    }

    fitFinalWidget(slide) {
      const holder = slide.querySelector('.promo-pass-final__widget');
      const inner = holder?.firstElementChild;
      if (!holder || !inner) return;
      const native = parseFloat(inner.style.width) || inner.offsetWidth || 288;
      inner.style.transform = `scale(${(holder.offsetWidth / native).toFixed(4)})`;
    }

    // The camera dives into the blank page until the window is gone and the
    // frame is white, ready for the call to action. Stepped per frame.
    // Back to "Your store" (the pitch's own window, Bizmis installed), and
    // the camera dives into it: the Early Access card opens from inside.
    async diveIntoYourStore() {
      const raster = this.pitchLeadKey && this.cellRasters?.get(this.pitchLeadKey);
      const canvas = this.root.querySelector('[data-promo-canvas]');
      if (!raster || !canvas || prefersReducedMotion()) return;
      const stage = document.createElement('div');
      stage.className = 'promo-yourstore';
      const card = document.createElement('figure');
      card.className = 'promo-yourstore__card';
      const img = raster.cloneNode(true);
      const box = (img.getAttribute('viewBox') || '0 0 16 10').split(/\s+/).map(Number);
      card.style.aspectRatio = `${box[2]} / ${box[3]}`;
      img.removeAttribute('class');
      img.setAttribute('width', '100%');
      img.setAttribute('height', '100%');
      card.append(img);
      stage.append(card);
      canvas.appendChild(stage);
      stage.getBoundingClientRect();
      stage.classList.add('is-in');
      await waitMs(PROMO_YOURSTORE_HOLD_MS);
      promoSfx('dive');
      stage.classList.add('is-diving');
      await waitMs(PROMO_YOURSTORE_DIVE_MS);
      stage.classList.add('is-out');
      window.setTimeout(() => stage.remove(), 700);
    }

    async diveIntoFinal(slide) {
      promoSfx('dive');
      const card = slide.querySelector('.promo-opening__slide-card');
      const meta = slide.querySelector('.promo-opening__slide-meta');
      if (!card) return;
      const box = card.getBoundingClientRect();
      const frame = this.root.getBoundingClientRect();
      const target = Math.max(frame.width / box.width, frame.height / box.height) * 1.6;
      const dx = frame.left + frame.width / 2 - (box.left + box.width / 2);
      const dy = frame.top + frame.height / 2 - (box.top + box.height * 0.58);
      card.style.transformOrigin = 'center 58%';
      await new Promise((resolve) => {
        const began = performance.now();
        const tick = () => {
          const u = Math.min(1, (performance.now() - began) / PROMO_PASS_DIVE_MS);
          const e = u * u * u;
          const scale = 1 + (target - 1) * e;
          card.style.transform = `translate(${(dx * e).toFixed(1)}px, ${(dy * e).toFixed(1)}px) scale(${scale.toFixed(4)})`;
          if (meta) meta.style.opacity = Math.max(0, 1 - u * 3).toFixed(3);
          card.style.setProperty('--final-chrome', Math.max(0, 1 - u * 1.4).toFixed(3));
          if (u < 1) window.requestAnimationFrame(tick);
          else resolve();
        };
        tick();
      });
    }

    ensurePassSlot(ctaKey) {
      const key = ctaKey && Object.prototype.hasOwnProperty.call(PROMO_END_CTA, ctaKey)
        ? ctaKey
        : promoVideoConfig.cta;
      const scale = this.root.querySelector('[data-promo-scale]');
      const existing = scale?.querySelector('[data-promo-pass-slot]');
      if (existing && existing.dataset.cta === key) return existing;
      existing?.remove();
      const copy = PROMO_END_CTA[key];
      this.root.classList.toggle('is-ea-card', Boolean(copy?.shopify));
      if (!scale || !copy) return null;
      const slot = document.createElement('div');
      slot.className = 'promo-pass-slot';
      slot.setAttribute('data-promo-pass-slot', '');
      slot.dataset.cta = key;
      if (copy.scarcity) {
        const line = document.createElement('p');
        line.className = 'promo-pass-slot__line';
        line.textContent = copy.scarcity;
        slot.append(line);
      }
      const action = document.createElement('p');
      action.className = 'promo-pass-slot__action';
      if (copy.shopify) {
        ensureInviteFont();
        action.classList.add('is-shopify');
        const label = document.createElement('span');
        label.className = 'promo-pass-slot__shopify-label';
        label.textContent = copy.label;
        action.append(shopifyBag(), label);
      } else {
        action.textContent = copy.label;
      }
      slot.append(action);
      if (copy.invite) {
        const invite = document.createElement('p');
        invite.className = 'promo-pass-slot__invite';
        const written = document.createElement('span');
        written.className = 'promo-pass-slot__invite-line';
        written.textContent = copy.invite;
        invite.append(written);
        slot.append(invite);
        if (copy.aside && !copy.morph && !copy.pills) {
          const aside = document.createElement('span');
          aside.className = 'promo-pass-slot__aside';
          const mark = '50 stores';
          const at = copy.aside.indexOf(mark);
          if (at < 0) aside.textContent = copy.aside;
          else {
            const strong = document.createElement('strong');
            strong.className = 'promo-pass-slot__aside-mark';
            strong.textContent = mark;
            aside.append(copy.aside.slice(0, at), strong, copy.aside.slice(at + mark.length));
          }
          slot.append(aside);
        }
      }
      if (copy.shopify && copy.pills) {
        const row = document.createElement('div');
        row.className = 'promo-ea-pills';
        row.innerHTML = `<div class="promo-ea-pills__row">${(copy.terms || []).map((t) => `<p class="promo-ea-pill is-benefit"><svg class="promo-ea-pill__check" viewBox="0 0 24 24" aria-hidden="true"><path pathLength="1" d="M5 12.5l4.4 4.4L19 7.4"/></svg><span>${t}</span></p>`).join('')}</div>`
          // v14: no extras row: the three benefits and the scarcity are the whole card (the VO says the rest)
          // v13 (S1): the scarcity handwritten in Bizmis orange, a hand-drawn underline under it
          + `<div class="promo-ea-pills__row is-hand"><p class="promo-ea-hand"><span class="promo-ea-hand__text">${copy.aside || 'Only 50 spots'}!</span><svg class="promo-ea-hand__line" viewBox="0 0 240 24" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M6 15.5c38-5.2 92-7.6 150-6.4 26 .6 52 2.2 78 4.8"/><path pathLength="1" d="M28 20.2c44-3.4 104-4.2 168-1.6"/></svg></p></div>`;
        slot.append(row);
      }
      if (copy.shopify && copy.morph) {
        // v10: one pill that becomes each benefit as it is said, then the scarcity
        const pill = document.createElement('p');
        pill.className = 'promo-ea-pill';
        pill.innerHTML = '<span class="promo-ea-pill__tick" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.4 4.4L19 7.4"/></svg></span><span class="promo-ea-pill__text"></span>';
        const quiet = document.createElement('p');
        quiet.className = 'promo-ea-quiet';
        quiet.textContent = copy.quiet || '';
        slot.append(pill, quiet);
      }
      if (copy.terms?.length && !copy.morph && !copy.pills) {
        const terms = document.createElement('p');
        terms.className = 'promo-pass-slot__terms';
        copy.terms.forEach((text) => {
          const piece = document.createElement('span');
          piece.className = 'promo-pass-slot__piece';
          const label = document.createElement('span');
          label.className = 'promo-pass-slot__term';
          label.textContent = text;
          piece.append(handwrittenTick(), label);
          terms.append(piece);
        });
        slot.append(terms);
      }
      if (copy.extras?.length && !copy.morph && !copy.pills) {
        const extras = document.createElement('p');
        extras.className = 'promo-pass-slot__extras';
        copy.extras.forEach((text) => {
          const item = document.createElement('span');
          item.className = 'promo-pass-slot__extra';
          item.textContent = text;
          extras.append(item);
        });
        slot.append(extras);
      }
      if (copy.find && !copy.morph && !copy.pills) {
        const find = document.createElement('p');
        find.className = 'promo-pass-slot__find';
        find.append(shopifyBag(), document.createTextNode(copy.find));
        slot.append(find);
      }
      if (copy.shopify) {   // the brand signs the card
        const brand = document.createElement('img');
        brand.className = 'promo-pass-slot__brand';
        brand.src = '/images/bizmis-logo-full-orange-transparent.svg';
        brand.alt = 'Bizmis';
        slot.prepend(brand);
      }
      if (copy.url) {
        const url = document.createElement('p');
        url.className = 'promo-pass-slot__url';
        url.textContent = copy.url;
        slot.append(url);
      }
      scale.append(slot);
      return slot;
    }

    settlePassSlot(ctaKey) {
      this.holdOrangeField();
      this.root.classList.add('is-pass-slot');
      const mark = this.root.querySelector('[data-promo-end-mark]');
      if (mark) mark.style.background = 'var(--bizmis-primary)';
      const slot = this.ensurePassSlot(ctaKey);
      if (!slot) return;
      slot.classList.add('is-in', 'is-settled');
      if (slot.querySelector('.is-shopify')) {
        this.root.classList.add('is-ea-in', 'is-ea-logo', 'is-ea-action');
        slot.classList.add('is-action-in');
      }
      const key = ctaKey && Object.prototype.hasOwnProperty.call(PROMO_END_CTA, ctaKey)
        ? ctaKey
        : promoVideoConfig.cta;
      markPromoVo(PROMO_END_CTA[key]?.vo);
    }

    async landPassSlot() {
      this.root.classList.add('is-pass-slot');
      this.paintPassLight(null);
      const mark = this.root.querySelector('[data-promo-end-mark]');
      if (mark) mark.style.background = 'var(--bizmis-primary)';
      const copy = PROMO_END_CTA[promoVideoConfig.cta];
      if (!copy) {
        await waitMs(PROMO_END_CARD_HOLD_MS + promoHoldMs());
        this.depart();
        return;
      }
      const slot = this.ensurePassSlot();
      // v23: the whole final block (brand, Install now, the handwritten line, the benefits,
      // the scarcity) is laid out from the start and stays put: every row enters in its own
      // final place (the old re-centring glided the card down, then up, then up again)
      const shown = new Set(['brand', 'action']);
      const recenter = (ms = 650) => {
        if (slot && copy.pills) { slot.style.translate = ''; return; }
        if (!slot || !copy.pills) return;
        const parts = [['brand', '.promo-pass-slot__brand'], ['action', '.promo-pass-slot__action'], ['invite', '.promo-pass-slot__invite'],
          ['ben', '.promo-ea-pills__row:not(.is-extras):not(.is-hand)'], ['roll', '.promo-ea-pills__row.is-extras'], ['hand', '.promo-ea-pills__row.is-hand']]
          .map(([key, sel]) => [key, slot.querySelector(sel)]).filter(([, el]) => el);
        const last = parts.filter(([key]) => shown.has(key)).pop()?.[1];
        const lastAll = parts[parts.length - 1]?.[1];
        if (!last || !lastAll) return;
        // measured on screen (the card is scaled; its rows may sit in a transformed block), in the canvas's px
        const canvasEl = this.root.querySelector('[data-promo-canvas]') || this.root;
        const fit = canvasEl.clientWidth / Math.max(1, canvasEl.getBoundingClientRect().width);
        const hidden = Math.max(0, (lastAll.getBoundingClientRect().bottom - last.getBoundingClientRect().bottom) * fit);
        const from = parseFloat((slot.style.translate || '0 0').split(' ')[1]) || 0;
        const to = hidden / 2;
        if (!ms) { slot.style.translate = `0 ${to.toFixed(1)}px`; return; }
        tweenStep(ms, (e) => { slot.style.translate = `0 ${(from + (to - from) * e).toFixed(1)}px`; }, promoEaseInOut);
      };
      // the handwriting's font and the brand mark are in before the block is measured or shown (no late reflow)
      if (slot && copy.pills) await Promise.race([Promise.all([document.fonts?.load?.('700 48px Caveat'), slot.querySelector('.promo-pass-slot__brand')?.decode?.()].map((p) => Promise.resolve(p).catch(() => { }))), waitMs(400)]);
      recenter(0);
      if (copy.shopify) {
        slot?.classList.add('is-in');
        await waitMs(80);
        this.root.classList.add('is-ea-logo');
        promoSfx('ea-logo');
        await waitMs(PROMO_EA_LOGO_LEAD_MS);
        slot?.classList.add('is-action-in');
        promoSfx('ea-action');
        this.root.classList.add('is-ea-in', 'is-ea-action');
        await waitMs(PROMO_EA_FLY_MS);
      } else {
        await waitMs(PROMO_PASS_SLOT_IN_MS);
        slot?.classList.add('is-in');
      }
      if (copy.shopify && slot) {
        // "Install now to join Early Access!" over the handwriting, the
        // benefit pills rise in as they're said, "Only 50 spots" lands on
        // "only fifty spots", and "Install now to secure your spot" clears to the hero.
        const take = speakTake(copy.vo);
        await waitMs(200);
        slot.classList.add('is-writing');
        shown.add('invite'); recenter(700);
        promoSfx('ea-write', { ms: PROMO_EA_WRITE_MS });
        await Promise.all([waitMs(PROMO_EA_WRITE_MS * 0.6), take.at('Early Access', 'end')]);
        slot.classList.add('is-written');
        if (copy.pills) {
          // each benefit pill rises in as it is said; the scarcity lands on "only fifty"
          const pills = [...slot.querySelectorAll('.promo-ea-pill.is-benefit')];
          // v11: no pills: the words rise in and the tick draws itself beside them
          const rise = (pill) => {
            const check = pill.querySelector('.promo-ea-pill__check path');
            if (check) { check.style.strokeDasharray = '1'; check.style.strokeDashoffset = '1'; }
            tweenStep(520, (e) => { pill.style.opacity = Math.min(1, e * 1.6).toFixed(3); pill.style.translate = `0 ${((1 - e) * 0.4).toFixed(3)}em`; }, promoEaseOut);
            if (check) window.setTimeout(() => tweenStep(380, (e) => { check.style.strokeDashoffset = (1 - e).toFixed(3); }, promoEaseOut), 120);
          };
          for (const [k, mark] of (copy.termMarks || []).entries()) {
            await take.at(mark, 'start', copy.termOffsets?.[k] || 0);
            if (!k) { shown.add('ben'); recenter(560); }
            if (pills[k]) rise(pills[k]);
            promoSfx('ea-tick', { index: k });
          }
          await take.at(...(copy.handMark || ['only fifty', 'start', -120]));
          shown.add('hand'); recenter(520);
          const hand = slot.querySelector('.promo-ea-hand');
          if (hand) {
            // written left to right (a pen's reveal), then the underline is drawn in two strokes
            const text = hand.querySelector('.promo-ea-hand__text');
            const lines = [...hand.querySelectorAll('.promo-ea-hand__line path')];
            lines.forEach((p) => { p.style.strokeDasharray = '1'; p.style.strokeDashoffset = '1'; });
            hand.style.opacity = '1';
            promoSfx('hand-write');
            await tweenStep(820, (e) => { text.style.clipPath = `inset(-30% ${((1 - e) * 115 - 15).toFixed(2)}% -40% -10%)`; }, (u) => u * (2 - u) * 0.6 + u * 0.4);
            promoSfx('ea-stamp');
            await tweenStep(360, (e) => { lines[0].style.strokeDashoffset = (1 - e).toFixed(3); }, promoEaseOut);
            if (lines[1]) tweenStep(300, (e) => { lines[1].style.strokeDashoffset = (1 - e).toFixed(3); }, promoEaseOut);
          }
        } else if (copy.morph) {
          const pill = slot.querySelector('.promo-ea-pill');
          const texts = [...(copy.terms || []), ...(copy.extras || [])];
          const marks = [...(copy.termMarks || []), ...(copy.extraMarks || [])];
          for (const [k, mark] of marks.entries()) {
            await take.at(mark);
            this.morphEaPill(pill, texts[k]);
            promoSfx(k ? 'ea-morph' : 'ea-tick', { index: k });
          }
          await take.at('only fifty');
          this.morphEaPill(pill, copy.aside || 'Only 50 spots', true);
          promoSfx('ea-stamp');
          window.setTimeout(() => slot.querySelector('.promo-ea-quiet')?.classList.add('is-in'), 420);
        } else {
          await this.playEaTerms(slot, take, copy.termMarks || []);
          const extras = [...slot.querySelectorAll('.promo-pass-slot__extra')];
          for (const [k, mark] of (copy.extraMarks || []).entries()) {
            await take.at(mark);
            extras[k]?.classList.add('is-in');
          }
          await take.at('only fifty');
          slot.querySelector('.promo-pass-slot__aside')?.classList.add('is-stamped');
          promoSfx('ea-stamp');
        }
        await take.at(...(copy.heroMark || (copy.pills ? ['now to secure', 'start', -260] : ['so install now', 'start', 0])));
        slot.classList.add('is-hero');
        this.root.classList.add('is-ea-hero');
        promoSfx('ea-hero');
        await (copy.closeMark ? take.at(...copy.closeMark) : copy.pills ? take.at('secure yours', 'end') : take.done);   // v18: the close starts on the last word (not the take's tail), so its hit lands on the score's last hit
        const finalAt = marketingPart() === 'full' && window.__promoFilmT0 != null ? window.__promoFilmT0 + PROMO_FILM_ANCHORS.final * 1000 : null;
        // v21: its hit on the final hit. v24: the take is ~9 s shorter, so until the music re-fit moves
        // the anchor the finished card simply holds here (settled, nothing pending); an anchor already
        // passed resolves at once and the close plays at its own pace (glide >= 300 ms)
        if (finalAt != null) await untilFilm(PROMO_FILM_ANCHORS.final - PROMO_EA_CLOSE_MS / 1000);
        // v13: a closing move that lands on the music's final chord ('ea-final'
        // marks the hit; the score is fitted to it), then a lasting final frame
        await this.playEaClosing(slot, finalAt);
        await waitMs(PROMO_EA_FINAL_HOLD_MS + promoHoldMs());
      } else {
        await waitMs(PROMO_END_CARD_HOLD_MS + promoHoldMs());
      }
      this.depart();
    }

    // The end card closes: the benefits (already read) bow out, the card
    // draws in a touch, and on the hit a warm Bizmis-orange light blooms
    // behind "Install now" and stays. Stepped (export-safe).
    async playEaClosing(slot, finalAt = null) {
      if (!slot || prefersReducedMotion()) return;
      // v13 (C1): the card re-arranges itself into one lockup, gracefully: the
      // benefits and the invite bow out, then the brand, "Install now" and the
      // handwritten scarcity glide (FLIP, stepped) into a centred stack and grow
      // a touch; on the hit, a Bizmis-orange shine runs across "Install now"
      // and a warm light settles behind it. The last frame holds.
      const canvas = this.root.querySelector('[data-promo-canvas]') || this.root;
      const cb = canvas.getBoundingClientRect();
      const fit = canvas.clientWidth / Math.max(1, cb.width);   // layout px per screen px
      const brand = slot.querySelector('.promo-pass-slot__brand');
      const action = slot.querySelector('.promo-pass-slot__action');
      const invite = slot.querySelector('.promo-pass-slot__invite');
      const benefits = slot.querySelector('.promo-ea-pills__row:not(.is-extras):not(.is-hand)');
      const roll = slot.querySelector('.promo-ea-pills__row.is-extras');
      const hand = slot.querySelector('.promo-ea-hand');
      const keep = [[brand, 1.14], [action, 1.12], [hand, 1.04]].filter(([el]) => el);
      if (!keep.length) return;
      const box = (el) => { const r = el.getBoundingClientRect(); return { x: (r.left - cb.left + r.width / 2) * fit, y: (r.top - cb.top + r.height / 2) * fit, h: r.height * fit, s: el.offsetWidth / Math.max(1, r.width * fit) }; };   // s: the element's own px per canvas px
      const from = keep.map(([el, k]) => ({ el, k, ...box(el) }));
      // the target stack, centred on the canvas
      const gapA = brand && action ? Math.max(0, (box(action).y - box(action).h / 2) - (box(brand).y + box(brand).h / 2)) * 1.1 : 0;
      const gapB = action ? box(action).h * 0.42 : 0;
      const gaps = [gapA, gapB];
      const total = from.reduce((sum, f, i) => sum + f.h * f.k + (i ? gaps[i - 1] || 0 : 0), 0);
      let y = canvas.clientHeight * 0.5 - total / 2;
      const to = from.map((f, i) => { if (i) y += gaps[i - 1] || 0; const c = y + (f.h * f.k) / 2; y += f.h * f.k; return { x: canvas.clientWidth / 2, y: c }; });
      let bloom = null;
      if (action) {
        bloom = document.createElement('span');
        bloom.className = 'promo-ea-bloom';
        bloom.setAttribute('aria-hidden', 'true');
        action.prepend(bloom);
      }
      promoSfx('ea-close', { ms: PROMO_EA_CLOSE_MS });
      // 1. what has been read bows out (soft blur, a small drift toward the action)
      const bowOut = (el, delay, dy) => el && window.setTimeout(() => tweenStep(520, (e) => {
        el.style.opacity = (1 - e).toFixed(3);
        el.style.filter = `blur(${(e * 6).toFixed(2)}px)`;
        el.style.translate = `0 ${(dy * e).toFixed(2)}em`;
        el.style.scale = (1 - 0.06 * e).toFixed(4);
      }, promoEaseInOut), delay);
      bowOut(benefits, 0, -0.5);
      bowOut(roll, 0, -0.3);
      bowOut(invite, 120, -0.25);
      // 2. the lockup glides into place, each piece a beat after the one above
      await waitMs(220);
      const glide = finalAt != null ? Math.max(300, finalAt - performance.now()) : PROMO_EA_CLOSE_MS - 220;   // v21: ends exactly on the score's final hit
      await tweenStep(glide, (e, u) => {
        from.forEach((f, i) => {
          const lag = i * 0.08; const v = Math.min(1, Math.max(0, (u - lag) / (1 - 0.16)));
          const w = v < 0.5 ? 4 * v * v * v : 1 - ((-2 * v + 2) ** 3) / 2;
          f.el.style.translate = `${((to[i].x - f.x) * w * f.s).toFixed(2)}px ${((to[i].y - f.y) * w * f.s).toFixed(2)}px`;
          f.el.style.scale = (1 + (f.k - 1) * w).toFixed(4);
        });
        if (bloom) bloom.style.opacity = (0.4 * u * u).toFixed(3);
      }, (u) => u);
      // 3. the hit: an orange shine runs across "Install now"; the light settles
      promoSfx('ea-final');
      const label = action?.querySelector('.promo-pass-slot__shopify-label');
      if (label) {
        label.classList.add('is-shine');
        tweenStep(760, (e) => { label.style.backgroundPosition = `${(100 - e * 100).toFixed(2)}% 0`; }, promoEaseInOut)
          .then(() => { label.classList.remove('is-shine'); label.style.backgroundPosition = ''; });
      }
      if (bloom) tweenStep(1100, (e) => { bloom.style.opacity = (0.4 + 0.3 * Math.sin(e * Math.PI) - 0.08 * e).toFixed(3); bloom.style.scale = (1 + 0.1 * e).toFixed(3); }, promoEaseOut);
    }

    // The pill's words roll over (old up and out, new up and in) while its
    // width glides to fit, all stepped per frame (export-safe).
    morphEaPill(pill, text, scarce = false) {
      if (!pill) return;
      const holder = pill.querySelector('.promo-ea-pill__text');
      const old = holder.querySelector('.promo-ea-pill__word:not(.is-leaving)');
      const from = pill.offsetWidth;
      const word = document.createElement('span');
      word.className = 'promo-ea-pill__word';
      word.textContent = text;
      word.style.opacity = '0';   // hidden until its turn (no frame with both texts)
      holder.appendChild(word);
      pill.style.width = 'auto';
      if (old) old.style.position = 'absolute';
      const to = pill.offsetWidth;
      if (old) old.style.position = '';
      const first = !pill.classList.contains('is-in');
      pill.classList.add('is-in');
      pill.classList.toggle('is-scarce', scarce);
      const ms = first ? 480 : 560;
      const t0 = performance.now();
      if (old) old.classList.add('is-leaving');
      const ease = (u) => 1 - (1 - u) ** 3;
      const easeOut = ease;
      const step = (now) => {
        const u = Math.min(1, (now - t0) / ms); const e = ease(u);
        // sequential: the old words roll up and out (0-40%), the pill glides to its new
        // width (20-60%), then the new words roll up into place (50-100%): never two texts at once, never clipped
        const out = Math.min(1, u / 0.4); const wide = Math.min(1, Math.max(0, (u - 0.2) / 0.4)); const inn = Math.min(1, Math.max(0, (u - 0.5) / 0.5));
        pill.style.width = `${(first ? to : from + (to - from) * easeOut(wide)).toFixed(1)}px`;
        word.style.opacity = inn.toFixed(3);
        word.style.transform = `translateY(${((1 - easeOut(inn)) * 1.1).toFixed(3)}em)`;
        if (old) { old.style.opacity = (1 - out).toFixed(3); old.style.transform = `translateY(${(-easeOut(out) * 1.1).toFixed(3)}em)`; }
        if (first) pill.style.opacity = e.toFixed(3);
        if (u < 1) window.requestAnimationFrame(step);
        else { old?.remove(); pill.style.width = ''; }
      };
      step(t0);
    }

    // Each term ticks in as the narrator says it.
    async playEaTerms(slot, take = null, marks = []) {
      const pieces = [...slot.querySelectorAll('.promo-pass-slot__piece')];
      for (let index = 0; index < pieces.length; index += 1) {
        if (take && marks[index]) await take.at(marks[index]);
        else if (index > 0) await waitMs(PROMO_EA_TERM_GAP_MS + PROMO_EA_BEAT_MS);
        pieces[index].classList.add('is-in');
        if (pieces[index].querySelector('.promo-pass-slot__tick')) promoSfx('ea-tick');
      }
    }

    // "It all takes just one click. And your whole store stays in sync... automatically."
    // v23b: one continuous object. The landing's white "Install" pill (orange Shopify bag)
    // sits alone centre-frame, the film's pointer presses it on "click" (press, peach bloom,
    // click), a quick progress ring, a check; then the checked disc itself becomes Bizmis:
    // it swells and softens into the clerk's peach glow and the clerk rises out of it; on
    // "whole store" the store's six areas pop out as the film's peach orbs. On "stays in sync" the orbs fly into the clerk's
    // chest one after another (a peach glow pulse per orb, the last on "sync"), and
    // "Always in sync" writes in on "automatically".
    // Stepped per frame only (tweenStep, one rAF loop on performance.now): export-safe.
    async playSyncScene() {
      if (prefersReducedMotion()) return;
      const canvas = this.root.querySelector('[data-promo-canvas]') || this.root;
      const scene = document.createElement('div');
      scene.className = 'promo-sync is-orbs is-install';
      const tick = '<svg viewBox="0 0 24 24" aria-hidden="true"><path pathLength="1" d="M6.4 12.6l3.6 3.6 7.6-7.8"/></svg>';
      scene.innerHTML = `
        <div class="promo-sync__glow"></div>
        <span class="promo-sync__ring"></span>
        <div class="promo-sync__avatar" data-sync-avatar></div>
        ${PROMO_SYNC_PARTS.map((p) => `<div class="promo-sync__tile" data-sync-tile="${p.key}" style="left:${p.x * 100}%;top:${p.y * 100}%">
          <span class="promo-sync__app"><svg viewBox="0 0 24 24" aria-hidden="true">${p.glyph}</svg></span>
          <span class="promo-sync__label">${p.label}</span>
        </div>`).join('')}
        <div class="promo-sync__install">
          <span class="promo-sync__aura"></span>
          <span class="promo-sync__focus"></span>
          <span class="promo-sync__pill">
            <span class="promo-sync__fill"></span>
            <span class="promo-sync__face is-install"><svg class="promo-sync__bag" viewBox="0 0 24 24" aria-hidden="true"><path d="${PROMO_SHOPIFY_BAG}"/></svg><span>Install</span></span>
            <svg class="promo-sync__progress" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="13.5"/><circle pathLength="1" cx="20" cy="20" r="13.5"/></svg>
            <span class="promo-sync__check">${tick}</span>
            <span class="promo-sync__face is-done"><span class="promo-sync__disc">${tick}</span><span>Installed</span></span>
            <span class="promo-sync__gloss"></span>
          </span>
        </div>
        <span class="promo-sync__pointer">${PROMO_MAC_POINTER}</span>`;
      canvas.appendChild(scene);
      const seat = this.seatSyncAvatar(scene);
      const $ = (sel) => scene.querySelector(sel);
      const host = $('[data-sync-avatar]'); const install = $('.promo-sync__install'); const pill = $('.promo-sync__pill');
      const fill = $('.promo-sync__fill'); const gloss = $('.promo-sync__gloss'); const aura = $('.promo-sync__aura'); const focus = $('.promo-sync__focus');
      const faceIn = $('.promo-sync__face.is-install'); const faceDone = $('.promo-sync__face.is-done');
      const progress = $('.promo-sync__progress'); const arc = progress.lastElementChild; const check = $('.promo-sync__check');
      const pointer = $('.promo-sync__pointer'); const glow = $('.promo-sync__glow'); const ring = $('.promo-sync__ring');
      const tiles = [...scene.querySelectorAll('[data-sync-tile]')];
      const clamp01 = (v) => Math.min(1, Math.max(0, v));
      const lerp = (a, b, u) => a + (b - a) * u;
      const backOut = (u) => 1 + 2.4 * (u - 1) ** 3 + 1.4 * (u - 1) ** 2;   // a soft spring (slight overshoot)
      const quintOut = (u) => 1 - (1 - u) ** 5;
      const linear = (u) => u;
      // the clerk's chest (seatSyncAvatar), as shares of the scene
      const sr = scene.getBoundingClientRect();
      const core = seat ? { x: seat.core.x / Math.max(1, sr.width), y: seat.core.y / Math.max(1, sr.height) } : { x: 0.5, y: 0.58 };
      const W = scene.clientWidth; const H = scene.clientHeight;   // layout px (the pointer, the pill's width)

      const heart = { x: core.x, y: core.y + PROMO_SYNC_HEART_DY };   // where the orbs go in: the shirt

      // one rAF loop for everything continuous: the clerk's glow (a peach pulse per absorbed
      // orb, charging up as they go in) and the chip's turning glyph
      const st = { live: true, absorbed: 0, absorbAt: -1e9, flashAt: -1e9, chip: null, chipAt: 0 };
      const loop = (now) => {
        if (!st.live) return;
        const pulse = Math.max(Math.exp(-Math.max(0, now - st.flashAt) / 320), Math.exp(-Math.max(0, now - st.absorbAt) / 260));
        const charge = st.absorbed / tiles.length;
        glow.style.opacity = ((0.16 + 0.42 * charge + 0.34 * pulse + (charge === 1 ? 0.05 * Math.sin(now / 700) : 0)) * (st.glowK ?? 1)).toFixed(3);
        glow.style.scale = (0.82 + 0.3 * charge + 0.12 * pulse).toFixed(4);
        if (st.chip) st.chip.style.rotate = `${(((now - st.chipAt) / 1700) * 360).toFixed(2)}deg`;
        window.requestAnimationFrame(loop);
      };
      // one orb flies into the clerk's chest: a slight curve, gathering speed, shrinking,
      // gone just before it reaches the body; the clerk glows as it takes it in
      const absorb = (i) => {
        const tile = tiles[i]; const p = PROMO_SYNC_PARTS[i]; const label = tile.querySelector('.promo-sync__label');
        const dx = (heart.x - p.x) * W; const dy = (heart.y - p.y) * H;
        // curve outward (never across the face): the top orbs swing down beside the head
        const bend = (p.x < 0.5 ? 1 : -1) * (p.y < 0.4 ? 0.34 : 0.14);
        let taken = false;
        return tweenStep(PROMO_SYNC_ORB_MS, (e, u) => {
          const arc = Math.sin(Math.PI * e) * bend;
          tile.style.translate = `calc(-50% + ${(dx * e - dy * arc).toFixed(1)}px) calc(-50% + ${(dy * e + dx * arc).toFixed(1)}px)`;
          tile.style.scale = lerp(1, 0.28, e).toFixed(4);
          tile.style.opacity = (1 - clamp01((e - 0.62) / 0.3)).toFixed(3);
          label.style.opacity = (1 - clamp01(u / 0.3)).toFixed(3);
          if (!taken && e >= 0.86) {
            taken = true;
            st.absorbed += 1; st.absorbAt = performance.now();
            promoSfx('order-in', { index: i });
          }
        }, (u) => u * u * (1.6 - 0.6 * u));   // eases in: the clerk pulls it in
      };

      // v23b: one continuous object. The Install pill sits alone centre-frame; the pointer presses it
      // on "click"; a quick ring, a check; then the pill itself becomes Bizmis: the orange disc grows and
      // softens into the clerk's peach glow while the clerk rises out of it (no cut, no white frame)
      const tall = pill.offsetHeight; const pad = tall * 0.46;
      const wInstall = faceIn.offsetWidth + pad * 2;
      pill.style.width = `${wInstall.toFixed(1)}px`;
      const tipAt = (x, y) => { pointer.style.left = `${x.toFixed(1)}px`; pointer.style.top = `${y.toFixed(1)}px`; };
      const from = { x: W * 0.665, y: H * 0.9 }; const aim = { x: W * 0.5 + wInstall * 0.18, y: H * 0.5 + tall * 0.16 };
      tipAt(from.x, from.y);
      host.style.opacity = '0';
      host.style.transformOrigin = `${(core.x * 100).toFixed(2)}% ${(core.y * 100).toFixed(2)}%`;
      glow.style.left = `${(core.x * 100).toFixed(2)}%`; glow.style.top = `${(core.y * 100).toFixed(2)}%`;
      ring.style.left = `${(core.x * 100).toFixed(2)}%`; ring.style.top = `${((core.y + PROMO_SYNC_HEART_DY) * 100).toFixed(2)}%`;
      st.glowK = 0.35;   // a faint warmth behind the button; the morph turns it into the clerk's glow
      scene.classList.add('is-in');
      fadeStep(scene, 0, 1, 380);   // out of the sold sea's orange
      const take = speakTake('t-sync');
      loop(performance.now());

      // 1. the Install button comes in; the pointer glides to it
      promoSfx('appear');
      tweenStep(560, (e, u) => {
        install.style.opacity = clamp01(u * 2.4).toFixed(3);
        install.style.scale = lerp(0.88, 1, e).toFixed(4);
        install.style.translate = `-50% calc(-50% + ${((1 - e) * 2.6).toFixed(3)}cqh)`;
      }, quintOut);
      tweenStep(700, (e) => { aura.style.opacity = (0.3 * e).toFixed(3); }, promoEaseOut);
      await waitMs(260);
      tweenStep(200, (e) => { pointer.style.opacity = e.toFixed(3); }, promoEaseOut);
      await tweenStep(780, (e, u) => {
        tipAt(lerp(from.x, aim.x, e) + Math.sin(e * Math.PI) * W * 0.018, lerp(from.y, aim.y, e));
        const hover = promoEaseInOut(clamp01((u - 0.7) / 0.3));   // the button lifts as the pointer arrives
        pill.style.scale = (1 + 0.025 * hover).toFixed(4);
        gloss.style.opacity = (0.06 * hover).toFixed(3);
      }, (u) => 1 - (1 - u) ** 3.2);

      // 2. the press, on "click": the button gives, the light answers
      await take.at('click', 'start', PROMO_SYNC_PRESS_DELAY_MS);
      promoSfx('click');
      tweenStep(300, (e, u) => {
        const d = u < 0.28 ? quintOut(u / 0.28) : 1 - promoEaseInOut((u - 0.28) / 0.72);
        pill.style.scale = (u < 0.28 ? lerp(1.025, 0.965, d) : lerp(1, 0.965, d)).toFixed(4);
        pointer.style.scale = (1 - 0.12 * d).toFixed(4);
        gloss.style.opacity = (0.2 * d).toFixed(3);
      }, linear);
      tweenStep(640, (e) => { focus.style.opacity = (0.55 * (1 - e)).toFixed(3); focus.style.inset = `${(-0.5 - 3.6 * e).toFixed(3)}cqh`; }, promoEaseOut);
      tweenStep(1000, (e, u) => { aura.style.opacity = (0.3 + 0.55 * Math.sin(Math.min(1, u * 2.4) * Math.PI / 2) * (1 - 0.5 * clamp01((u - 0.4) / 0.6))).toFixed(3); }, linear);
      waitMs(160).then(() => tweenStep(420, (e) => { tipAt(aim.x + e * H * 0.05, aim.y + e * H * 0.075); pointer.style.opacity = (1 - e).toFixed(3); }, promoEaseInOut));
      // 3. Install -> progress ring -> check (quick)
      await waitMs(50);
      tweenStep(130, (e) => { faceIn.style.opacity = (1 - e).toFixed(3); faceIn.style.scale = (1 - 0.1 * e).toFixed(4); }, promoEaseOut);
      await tweenStep(200, (e) => { pill.style.width = `${lerp(wInstall, tall, e).toFixed(1)}px`; }, promoEaseInOut);
      tweenStep(110, (e) => { progress.style.opacity = e.toFixed(3); }, promoEaseOut);
      await tweenStep(260, (e, u) => { arc.style.strokeDashoffset = (1 - e).toFixed(4); progress.style.rotate = `${(-90 + 240 * u).toFixed(2)}deg`; }, promoEaseInOut);
      promoSfx('install');
      tweenStep(200, (e) => { progress.style.opacity = (1 - e).toFixed(3); progress.style.scale = (1 + 0.18 * e).toFixed(4); }, promoEaseOut);
      tweenStep(220, (e) => { fill.style.opacity = e.toFixed(3); }, promoEaseOut);
      const checkPath = check.querySelector('path');
      check.style.opacity = '1';
      tweenStep(340, (e, u) => { checkPath.style.strokeDashoffset = (1 - promoEaseOut(clamp01(u / 0.75))).toFixed(4); check.style.scale = lerp(0.6, 1, backOut(u)).toFixed(4); }, linear);
      tweenStep(260, (e, u) => { pill.style.scale = (1 + 0.06 * Math.sin(u * Math.PI)).toFixed(4); }, linear);
      await waitMs(130);   // the check reads, and the disc is already on its way

      // 4. the morph: the checked orange disc becomes Bizmis. It glides down onto the clerk's chest,
      // swells and softens (blur, peach) into the clerk's glow, and the clerk rises out of it:
      // fully there ~0.4 s after the check
      promoSfx('install-fly');
      const shadow = getComputedStyle(pill).boxShadow;
      const morphAt = performance.now();
      // v24: the disc goes BEHIND the clerk (never a blur over the face): its solid orange opens
      // into a soft radial peach glow (gradient edges, barely any blur) as the clerk rises crisp in front
      install.style.zIndex = '1';
      tweenStep(PROMO_SYNC_MORPH_MS, (e, u) => {
        install.style.translate = `calc(-50% + ${((core.x - 0.5) * 100 * e).toFixed(3)}cqw) calc(-50% + ${((core.y - 0.5) * 100 * e).toFixed(3)}cqh)`;
        install.style.scale = lerp(1, 4.4, e).toFixed(4);
        pill.style.filter = e > 0.02 ? `blur(${(e * 0.5).toFixed(3)}cqh)` : '';
        pill.style.boxShadow = u < 0.05 ? shadow : 'none';
        pill.style.background = 'transparent';
        fill.style.opacity = '1';
        const tone = `color-mix(in oklab, #F28C38 ${((1 - Math.min(1, e * 2.2)) * 100).toFixed(1)}%, #FFDCBE)`;   // peach before the clerk is in front of it
        fill.style.background = `radial-gradient(circle closest-side, ${tone} 0%, ${tone} ${lerp(99, 18, e).toFixed(1)}%, color-mix(in oklab, ${tone} ${lerp(100, 40, e).toFixed(1)}%, transparent) ${lerp(99.5, 58, e).toFixed(1)}%, transparent 100%)`;
        install.style.opacity = (1 - clamp01((u - 0.3) / 0.7) ** 1.3).toFixed(3);
        check.style.opacity = (1 - clamp01(u / 0.3)).toFixed(3);
        aura.style.opacity = (0.4 * (1 - e)).toFixed(3);
        st.glowK = lerp(0.35, 1, e);
      }, (u) => 1 - (1 - u) ** 2.4);
      waitMs(110).then(() => {   // v24: once the disc is a pale glow: the clerk comes in opaque fast (never a ghost over the glow)
        st.flashAt = performance.now();
        tweenStep(PROMO_SYNC_RISE_MS, (e, u) => {
          host.style.opacity = clamp01(u * 4).toFixed(3);
          host.style.scale = lerp(0.86, 1, e).toFixed(4);
          host.style.translate = `0 ${((1 - e) * 5).toFixed(3)}cqh`;
        }, quintOut);
      });

      // 5. "your whole store": the store's areas pop out around the clerk
      await take.at('whole store', 'start', -PROMO_SYNC_FOLD_LEAD_MS);
      await waitMs(Math.max(0, morphAt + PROMO_SYNC_MORPH_MS - 80 - performance.now()));   // the clerk is in first
      const foldAt = performance.now();
      tiles.forEach((tile, i) => {
        const p = PROMO_SYNC_PARTS[i];
        // each orb pops out just on the clerk's side of its own place (never across the clerk)
        const dx = (heart.x - p.x) * 15; const dy = (heart.y - p.y) * 15;
        const label = tile.querySelector('.promo-sync__label');
        waitMs(i * PROMO_SYNC_TILE_STAGGER_MS).then(() => tweenStep(400, (e, u) => {
          const k = backOut(u);
          tile.style.translate = `calc(-50% + ${((1 - k) * dx).toFixed(3)}cqw) calc(-50% + ${((1 - k) * dy).toFixed(3)}cqh)`;
          tile.style.scale = lerp(0.35, 1, quintOut(u)).toFixed(4);
          tile.style.opacity = clamp01(u * 4).toFixed(3);
          label.style.opacity = clamp01((u - 0.35) / 0.4).toFixed(3);
        }, linear));
      });
      await take.at('whole store');
      setOpeningAvatarAction(PROMO_SYNC_ACTION);
      // "stays in sync": the orbs go into the clerk one after another, the last on "sync"
      await take.at('stays', 'start', -PROMO_SYNC_ABSORB_LEAD_MS);
      await waitMs(Math.max(0, foldAt + 560 - performance.now()));   // never before every orb is out
      promoSfx('sync-flow');
      promoSfx('orb-absorb', { index: 0 });   // one charge-up for the whole stream
      await Promise.all(tiles.map((tile, i) => waitMs(i * PROMO_SYNC_ORB_STAGGER_MS).then(() => absorb(i))));
      promoSfx('sync-done');
      tweenStep(1000, (e) => { ring.style.opacity = (0.5 * (1 - e)).toFixed(3); ring.style.scale = lerp(0.7, 2.6, e).toFixed(4); }, promoEaseOut);

      // 5. "automatically": a small glass chip writes in under the clerk, its glyph turning
      await take.at('automatically', 'start', -80);
      const chip = document.createElement('div');
      chip.className = 'promo-sync__always';
      chip.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.5 12a7.5 7.5 0 0 1-12.9 5.2M4.5 12a7.5 7.5 0 0 1 12.9-5.2"/><path d="M17.6 3.4v3.7h-3.7M6.4 20.6v-3.7h3.7"/></svg><span>Always in sync</span>`;
      scene.appendChild(chip);
      st.chip = chip.querySelector('svg'); st.chipAt = performance.now();
      promoSfx('ui-tick');
      tweenStep(460, (e) => { chip.style.opacity = e.toFixed(3); chip.style.translate = `-50% ${((1 - e) * 1.4).toFixed(3)}cqh`; chip.style.scale = lerp(0.94, 1, e).toFixed(4); }, quintOut);
      await take.done;
      await waitMs(PROMO_SYNC_HOLD_MS);
      // v23: the scene never fades to an empty frame on its own: it holds (alive) until the next
      // scene is over it, then leave() pushes it in and removes it under the reel's crossfade
      let gone = false;
      const leave = async (ms = PROMO_SYNC_HANDOFF_MS, aim = null) => {
        if (gone) return;
        gone = true;
        const first = aim ? aim() : null;
        if (first) {
          // v24: the scene sits over the (already whole) reel; its light lifts off, and the clerk flies
          // into the first tunnel store's widget (shrinking to its size, landing on it as it fades in)
          scene.style.zIndex = '71';
          const under = document.createElement('div');
          under.style.cssText = `position:absolute;inset:0;pointer-events:none;background:${getComputedStyle(scene).backgroundImage}`;
          scene.style.background = 'transparent';
          scene.prepend(under);
          const always = scene.querySelector('.promo-sync__always');
          const viewH = H * PROMO_SYNC_AVATAR_H; const cx = core.x * W; const cy = core.y * H;
          const k0 = Number.parseFloat(host.style.scale) || 1;
          await tweenStep(ms, (e, u) => {
            const t = aim() || first;
            const k = k0 * (t.h / viewH / k0) ** e;   // a geometric shrink (reads as distance, not squash)
            host.style.translate = `${((t.x - cx) * e).toFixed(2)}px ${((t.y - cy) * e).toFixed(2)}px`;
            host.style.scale = k.toFixed(5);
            host.style.opacity = (1 - clamp01((u - 0.55) / 0.45) ** 1.5).toFixed(3);
            under.style.opacity = (1 - promoEaseInOut(clamp01(u / 0.8))).toFixed(3);
            st.glowK = 1 - promoEaseOut(clamp01(u / 0.6));
            if (always) always.style.opacity = (1 - promoEaseOut(clamp01(u / 0.3))).toFixed(3);
          }, (u) => promoEaseInOut(u) * 0.6 + promoEaseOut(u) * 0.4);
        } else await tweenStep(ms, (e) => { scene.style.scale = (1 + 0.08 * e).toFixed(4); }, (u) => u * u);
        st.live = false;
        this.unseatSyncAvatar(seat); scene.remove();
      };
      return leave;
    }

    // The live clerk (its 3D canvas is oversampled, so it scales crisply)
    // lifted out of its card into the scene's centre, card chrome hidden.
    seatSyncAvatar(scene) {
      // the live clerk, never a copy: the sea-of-cards rasters hold cloned widgets
      const embed = [...document.querySelectorAll('[id="bizmis-avatar-embed"]')].find((node) => !node.closest('svg'));
      const widget = embed?.closest('[data-promo-widget]');
      const host = scene.querySelector('[data-sync-avatar]');
      const view = embed?.querySelector('.bizmis-desktop-lite-chat .relative.z-10');
      if (!widget || !host || !view) return null;
      const home = widget.parentElement;
      document.documentElement.classList.remove('is-promo-card-out', 'is-promo-live-card', 'is-promo-saying');
      document.documentElement.classList.add('is-promo-sync-hero');
      host.appendChild(widget);
      Object.assign(widget.style, { top: '0px', left: '0px', right: 'auto', bottom: 'auto', margin: '0', transition: 'none', transform: 'none', transformOrigin: '0 0' });
      const sr = scene.getBoundingClientRect(); const wr = widget.getBoundingClientRect(); const vr = view.getBoundingClientRect();
      const scale = (sr.height * PROMO_SYNC_AVATAR_H) / Math.max(1, vr.height);
      const ox = vr.left + vr.width / 2 - wr.left; const oy = vr.top + vr.height / 2 - wr.top;
      const core = { x: sr.width / 2, y: sr.height * 0.58 };   // the orbs go into the chest, not the face
      widget.style.transformOrigin = `${ox}px ${oy}px`;
      widget.style.transform = `translate(${core.x - (wr.left - sr.left) - ox}px, ${core.y - (wr.top - sr.top) - oy}px) scale(${scale.toFixed(4)})`;
      return { widget, home, core };
    }

    unseatSyncAvatar(seat) {
      document.documentElement.classList.remove('is-promo-sync-hero');
      document.documentElement.classList.add('is-promo-card-out');
      if (!seat) return;
      const stage = this.root.querySelector('.promo-opening__stage') || seat.home;
      stage?.appendChild(seat.widget);
      Object.assign(seat.widget.style, { top: '', left: '', right: '', bottom: '', margin: '', transition: '', transform: '', transformOrigin: '' });
    }

    // part=sync (dev): the scene alone, from the same state the film reaches it in
    // (agent ended, orange field held behind), then stop.
    async playSyncDev() {
      endOpeningAgent();
      document.documentElement.style.setProperty('--ad-warmth', '1');
      document.documentElement.classList.add('is-promo-pitch');
      this.root.classList.add('is-pitch');
      this.parkWidget();   // the film has the clerk docked in the stage by now
      this.holdOrangeField();
      await waitMs(400);
      return this.playSyncScene();   // v23: resolves with the scene's leave() (the reel crossfades over it)
    }

    // part=sync / part=reel (export): the sync scene, its hand-off, then the reel's
    // first seconds (sync) or the whole reel (reel), then stop.
    async playReelDev(whole) {
      const leave = await this.playSyncDev();
      const reel = loadStoreReel();
      const playing = this.playStoreReel(reel, { handoff: leave });
      if (whole) await playing;
      else await waitMs(PROMO_SYNC_HANDOFF_MS + 2400);
      await waitMs(whole ? PROMO_REEL_OUT_MS + 400 : 0);
    }

    // part=climax-pain / climax-pitch (dev): one claim sea alone, from a state
    // close to the one the film reaches it in, then (pitch) its hand-off.
    async playClimaxDev(mode) {
      if (mode === 'pitch') {
        document.documentElement.style.setProperty('--ad-warmth', '1');
        document.documentElement.classList.add('is-promo-pitch');
        this.openPainStage();
        this.applyPainBeat('answer-2', true);
        this.root.classList.add('is-pitch', 'is-moments');
        this.painStore()?.querySelectorAll('[data-promo-pain-chat], [data-promo-pain-cursor]').forEach((node) => { node.hidden = true; });
        const stage = this.momentStage();
        if (stage) applyMomentPose(stage, 'bundle', { instant: true });
        await waitMs(400);
        await this.rememberPitchLead();
        await this.playPitchConveyor();
        await waitMs(3200);
        return;
      }
      this.root.classList.add('is-pain');
      this.openPainStage();
      this.applyPainBeat('answer-2', true);
      this.prepareScaleScene();
      await waitMs(400);
      const desktop = this.painStore();
      await this.stampLost(desktop);
      this.glideLeadKey = glideLeadCell(this.gridFrame())?.key || '';
      await this.rememberRaster(desktop, this.glideLeadKey);
      this.glideLeadStamped = true;
      this.glideKeepStore = false;
      this.captureGlideClose('pain');
      this.revealScaleLayer();
      this.mountGlide('pain');
      this.paintGlideAt(0, 'pain');
      this.runGlide('pain', 0);
      speakTake('t-pain-end');
      await waitMs(glidePlayEnd('pain'));
      await this.playConveyorEnd('pain', { settled: true });
      await waitMs(600);
    }

    playSeeForYourself() {
      endOpeningAgent();
      this.holdOrangeField();
      const reel = loadStoreReel();
      if (reel.length && !prefersReducedMotion()) {
        this.playSyncScene().then((leave) => this.playStoreReel(reel, { handoff: leave })).then(() => this.landPassSlot());
        return;
      }
      this.orderPassStores();
      if (!this.stores.length || prefersReducedMotion()) {
        this.settlePassSlot();
        const hold = PROMO_END_CTA[promoVideoConfig.cta]?.shopify ? PROMO_EA_HOLD_MS : PROMO_END_CARD_HOLD_MS;
        window.setTimeout(() => this.depart(), hold);
        return;
      }
      // Rack focus: the orange field is the first store, fully out of focus.
      // A white sheet waits behind it for when the camera pulls back.
      const scaleLayer = this.root.querySelector('[data-promo-scale]');
      const sheet = document.createElement('div');
      sheet.className = 'promo-pass-white';
      scaleLayer?.prepend(sheet);
      this.playStorePass(() => {
        this.landPassSlot();
      }, {
        sheet,
        lead: this.root.querySelector('.promo-scale__lead'),
        mark: this.root.querySelector('[data-promo-end-mark]'),
      });
    }

    // One vignette at a time: what the shopper asked on the left, the live
    // recording in its own device on the right, with its own sound.
    // The store reel, as one continuous camera over a "world" of devices: a
    // strip of every demo store drifts in and slows to a stop under "In any
    // store... on any device", then the camera dives into each hero store in
    // turn (its recording plays with its sound), passing the others on the
    // way, faster each time. While a shopper types or speaks, the whole
    // picture leans in toward the widget (item.zooms: [s, zoom, x%, y%] on the
    // device). Category type lives in screen space and may overlap the
    // devices. Ambient light in the store's colour follows a sin^2 rhythm:
    // slow and bright mid-store, fast and dim at each hand-off.
    // The demo stores: a fixed camera over an endless carousel of thin,
    // Apple-like devices, each one live. The strip glides store to store
    // (faster each time); a hero grows in place to a close-up and plays its
    // recording (its own sound), leaning in only while the shopper types, so
    // the typing sits bottom-centre. "Your store" is just the next card in the
    // carousel: it comes to the centre and the camera enters it, to white.
    async playStoreReel(items, { handoff = null } = {}) {
      // v13: the demo stores as pages. A burst of skeleton stores rushes past
      // out of "Always in sync" and brakes onto the first store; then each
      // store is its own page (only that store in view during its close-up):
      // its category in the store's colour, what the agent does -> what the
      // merchant gets, its live recording beside it. Store to store the page
      // slides (no tilt), quicker each time; the ambient light takes the
      // store's colour: brightest and slowest on a store, dimmest and fastest
      // mid-slide (driven by the camera's speed). "Your store" lands centred.
      const canvas = this.root.querySelector('[data-promo-canvas]') || this.root;
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      const S = W / 1920;   // the layout is drawn at 1920 and scaled
      const reel = document.createElement('div');
      reel.className = 'promo-reel is-world is-pages';
      reel.innerHTML = '<div class="promo-reel__ambient" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="promo-reel__strip"></div>';
      const strip = reel.querySelector('.promo-reel__strip');
      const blobs = [...reel.querySelectorAll('.promo-reel__ambient i')];
      const heroItems = items.filter((item) => item.hero);
      const extras = items.filter((item) => !item.hero);
      const yours = { yours: true, device: 'desktop', color: '#F28C38', category: 'Your store' };
      const asAmbient = (item) => ({ ...item, hero: false, video: item.ambient || item.video });
      const order = [];
      heroItems.forEach((hero) => order.push(hero));
      // v23: real store cards (the store-reel JSON's extra stores, then PROMO_REEL_CARDS) take the skeleton
      // slots first, then the run's last flashes: the ladder (and its cut list) never changes length
      const cards = [...extras.slice(PROMO_REEL_QUICK_VOICES.length).map(asAmbient), ...PROMO_REEL_CARDS].filter((card) => card && (card.video || card.img));
      const flashSlots = PROMO_REEL_RUN.map(([kind], n) => (kind === 'flash' ? n : -1)).filter((n) => n >= 0);
      const skelCount = PROMO_REEL_RUN.filter(([kind]) => kind === 'skeleton').length;
      const spare = cards.slice(skelCount);
      const flashTaken = new Set(flashSlots.slice(flashSlots.length - Math.min(spare.length, flashSlots.length)));
      let nextSkel = 0; let nextSpare = 0;
      PROMO_REEL_RUN.forEach(([kind, i], n) => {
        const real = kind === 'skeleton' ? cards[nextSkel++] : (flashTaken.has(n) ? spare[nextSpare++] : null);
        if (real) order.push({ ...real, card: true, strobe: true });
        else if (kind === 'quick' && extras[i]) order.push({ ...asAmbient(extras[i]), whip: true, quick: i });
        else if (kind === 'flash' && PROMO_REEL_FLASH[i]) order.push({ ...PROMO_REEL_FLASH[i], flash: true, strobe: true });
        else if (kind === 'skeleton' && PROMO_REEL_STROBE[i]) order.push({ ...PROMO_REEL_STROBE[i], skeleton: true, strobe: true });
      });
      order.push(yours);
      // where a device sits in its page, at 1920x1080 (scaled)
      const SIZES = { desktop: 1180, phone: 410, tablet: 660 };
      const place = (item) => {
        const spec = PROMO_DEVICE_SPEC[item.device] || PROMO_DEVICE_SPEC.desktop;
        const w = (item.skeleton ? SIZES[item.device] * 0.74 : SIZES[item.device]) * S;
        const h = w / spec.aspect + spec.bar * w;
        if (item.strobe) { const ws = SIZES[item.device] * S * 0.92; const hs = ws / spec.aspect + spec.bar * ws; return { w: ws, h: hs, x: W / 2, y: (H - hs) / 2 }; }
        if (item.skeleton) return { w, h, x: 0, y: (H - h) / 2 };
        if (item.yours) return { w, h, x: W / 2, y: (H - h) / 2 };
        if (item.device === 'desktop') return { w, h, x: W / 2, y: 205 * S };
        return { w, h, x: (item.device === 'phone' ? 1420 : 1380) * S, y: (H - h) / 2 };
      };
      let px = 0;
      const seq = order.map((item, n) => {
        const box = place(item);
        const pageW = item.skeleton && !item.strobe ? W * 0.4 : W;
        const cell = { src: item, n, full: box, hero: !!item.hero, whip: !!item.whip, yours: !!item.yours, skeleton: !!item.skeleton && !item.strobe, strobe: !!item.strobe };
        cell.x0 = px;
        cell.cx = px + (item.skeleton && !item.strobe ? pageW / 2 : box.x);   // the device's centre along the strip
        px += pageW;
        const inner = cell.yours
          ? `<div class="promo-reel__blank"><div class="promo-reel__blank-brand"><span class="promo-reel__blank-mark">${PROMO_STORE_MARK}</span><b>Your store</b></div><div class="promo-reel__yours-widget"></div></div>`
          : (item.flash || (item.card && item.img && !item.video)) ? `<img class="promo-reel__flash-shot" src="${item.img}" alt="" decoding="sync">`
          : item.card ? `<video class="is-ambient" muted playsinline preload="auto"${item.img ? ` poster="${item.img}"` : ''}></video>`
          : (cell.skeleton || cell.strobe) ? promoSkeletonStore(item)
          : cell.hero ? '<video class="is-hero" muted playsinline preload="auto"></video>' : '<video class="is-ambient" muted playsinline preload="auto"></video>';
        cell.dev = promoDevice(item.device, box, inner);
        if (cell.hero) cell.dev.classList.add('has-hero');
        if (cell.skeleton) cell.dev.classList.add('is-skeleton');
        Object.assign(cell.dev.style, { left: `${-box.w / 2}px`, top: `${box.y}px` });
        cell.ambientVideo = cell.dev.querySelector('video.is-ambient');
        cell.heroVideo = cell.dev.querySelector('video.is-hero');
        [[cell.ambientVideo, item.ambient || item.video], [cell.heroVideo, item.video]].forEach(([video, src]) => {
          if (!video || !src) return;
          video.dataset.promoIdle = '1';
          video.src = src;
        });
        if (cell.heroVideo) {
          cell.heroVideo.addEventListener('loadeddata', () => { try { cell.heroVideo.currentTime = item.start || 0.05; } catch { } }, { once: true });
        }
        cell.t = { tx: 0, ty: 0, k: 1 };
        strip.appendChild(cell.dev);
        if (cell.hero || cell.whip) {
          cell.copy = promoReelCopy(item, box, W, H, S);
          Object.assign(cell.copy.style, { left: `${cell.x0}px`, width: `${W}px` });
          strip.appendChild(cell.copy);
        }
        return cell;
      });
      canvas.appendChild(reel);
      // the titles fit their room (never cut, never under the device): measured once the type is in
      await document.fonts?.ready;
      seq.forEach((cell) => { if (cell.copy) fitReelCopy(cell.copy, S); });
      const ready = (video) => new Promise((resolve) => {
        if (!video || video.readyState >= 2) resolve();
        else video.addEventListener('loadeddata', resolve, { once: true });
        window.setTimeout(resolve, 8000);
      });
      const roll = (video, from) => {
        if (!video) return;
        try { video.currentTime = from; } catch { }
        video.dataset.promoStart = String(from);
        delete video.dataset.promoIdle;
        video.__promoOriginMs = null;
        if (!document.documentElement.classList.contains('is-promo-export')) video.play().catch(() => { });
      };
      const park = (video) => {
        if (!video || video.dataset.promoIdle === '1') return;
        video.dataset.promoIdle = '1';
        try { video.pause(); } catch { }
      };
      // 1. (built now, shown at the reel's start) the tunnel: v23 the new demo stores (PROMO_REEL_TUNNEL_CARDS),
      // their videos idle and preloading (poster first) until the tunnel starts; skeletons only as a fallback
      const tunnel = document.createElement('div');
      tunnel.className = 'promo-reel__tunnel';
      tunnel.style.perspective = `${(W * 0.58).toFixed(0)}px`;
      const P = W * 0.58;
      const flyers = PROMO_REEL_SKELETONS.map((skeleton, i) => {
        const card = PROMO_REEL_TUNNEL_CARDS[i];
        const sk = card ? { ...skeleton, ...card } : skeleton;
        const size = { w: { desktop: 1180, phone: 410, tablet: 660 }[sk.device] * S * PROMO_REEL_TUNNEL_SCALE };
        const spec = PROMO_DEVICE_SPEC[sk.device];
        size.h = size.w / spec.aspect + spec.bar * size.w;
        const dev = promoDevice(sk.device, size, card ? `<video class="is-ambient" muted playsinline preload="auto" poster="${card.img}"></video>` : promoSkeletonStore(sk));
        if (!card) dev.classList.add('is-skeleton');
        Object.assign(dev.style, { left: `${-size.w / 2}px`, top: `${-size.h / 2}px` });
        tunnel.appendChild(dev);
        const video = dev.querySelector('video');
        if (video) { video.dataset.promoIdle = '1'; video.src = card.video; }
        // v13b: calm and orderly: two lanes (left / right), level, evenly spaced. v24: bigger cards, the lanes
        // angled in like a corridor's walls (outer edge nearer), and the whole run starts deeper (more depth)
        const side = i % 2 ? 1 : -1;
        return { dev, sk, video, size, x: W / 2 + side * W * 0.32, y: H / 2 + (i % 4 < 2 ? -1 : 1) * H * 0.06, z: -P * PROMO_REEL_TUNNEL_NEAR - i * P * 0.55, rot: -side * PROMO_REEL_TUNNEL_TILT };
      });
      // every new store's first frame is decoded before the reel can show it (never a blank or black card)
      await Promise.race([Promise.all([...flyers.map((f) => f.video), ...seq.map((cell) => (cell.src.card ? cell.ambientVideo : null))].map((video) => ready(video))), waitMs(2500)]);
      // the camera: x along the strip (px), so the page under it fills the frame
      const cam = { x: 0 };
      const camFor = (cell) => cell.x0 + (cell.skeleton ? cell.cx - cell.x0 - W / 2 : 0);
      const motion = { last: performance.now(), x: 0, v: 0 };
      const paint = () => {
        // v24 light law: the cut clock alone picks the card on screen, its camera push and the light, in the same
        // frame (never a timer or a transition): the light can never lag or lead its card
        const L = lawAt(performance.now());
        if (L.cell && L.w !== motion.w) { cam.x = camFor(L.cell); motion.w = L.w; }
        const camX = cam.x + L.off;
        strip.style.transform = `translateX(${(-camX).toFixed(2)}px)`;
        const blur = Math.min(3, (L.vx / W) * 2.4);   // a touch of motion blur where the camera is fastest (the cuts)
        strip.style.filter = blur > 0.3 ? `blur(${blur.toFixed(2)}px)` : '';
        if (light.on) {
          reel.style.setProperty('--reel-glow', L.glow.toFixed(3));
          setLight(L.from, L.to, L.p);
          blobs.forEach((blob, j) => {   // the light's drift: on the same law (still mid-card, fastest at the cuts)
            const q = L.phi * (0.6 + 0.16 * j) + j * 1.9;
            blob.style.transform = `translate(${(Math.sin(q) * 22).toFixed(2)}%, ${(Math.cos(q * 0.83) * 16).toFixed(2)}%) scale(${(1 + 0.1 * L.bell + 0.08 * Math.sin(q * 1.27)).toFixed(3)})`;
          });
        }
        reel.__law = L;   // (the light probe reads it)
        seq.forEach((cell, i) => {
          const t = cell.t;
          const kk = t.k * (cell === L.cell ? L.k : (cell === firstHero && L.w < 0 ? L.k0 : 1));
          cell.dev.style.transform = `translate3d(${(cell.cx + t.tx).toFixed(2)}px, ${t.ty.toFixed(2)}px, 0) scale(${kk.toFixed(4)})`;
          const sx = cell.cx - camX;
          const half = (cell.full.w * kk) / 2;
          const onScreen = sx + half > -W * 0.05 && sx - half < W * 1.05;
          cell.dev.style.visibility = onScreen ? '' : 'hidden';
          if (cell.copy) cell.copy.style.visibility = (cell.x0 - camX) < W && (cell.x0 - camX) > -W ? '' : 'hidden';
          // skeletons: a soft tick as each one crosses the centre (the rush's rhythm, braking)
          if (cell.skeleton && !cell.ticked && sx <= W / 2) { cell.ticked = true; promoSfx('reel-tick', { index: i }); }
          const video = cell.ambientVideo;
          if (!video) return;
          if (onScreen) {
            if (video.dataset.promoIdle === '1' && !cell.live) roll(video, cell.src.card ? (cell.src.start || 0) : ((cell.src.ambientStart || 0) + (i % 5) * 1.7) % 9);
          } else park(video);
        });
      };
      const tween = (obj, to, ms, ease = promoEaseInOut) => new Promise((resolve) => {
        const from = {}; Object.keys(to).forEach((key) => { from[key] = obj[key]; });
        const t0 = performance.now();
        const step = (now) => {
          const u = Math.min(1, (now - t0) / Math.max(1, ms)); const e = ease(u);
          Object.keys(to).forEach((key) => { obj[key] = from[key] + (to[key] - from[key]) * e; });
          if (u < 1) window.requestAnimationFrame(step); else resolve();
        };
        window.requestAnimationFrame(step);
      });
      let painting = true;
      const loop = () => { if (!painting || !reel.isConnected) return; paint(); window.requestAnimationFrame(loop); };

      // the ambient light (v24): painted by paint() from the cut clock (lawAt below), never by its own timer
      const light = { on: true, key: '' };
      const tunnelColor = flyers[0]?.sk.color || PROMO_REEL_SKELETONS[0]?.color || '#F28C38';
      const setLight = (from, to, p) => {
        const key = `${from}|${to}|${p.toFixed(3)}`;
        if (key === light.key) return;
        light.key = key;
        const mix = (c, pct, base) => `color-mix(in oklab, ${c} ${pct}%, ${base})`;
        const blend = (pct, base) => `color-mix(in oklab, ${mix(to, pct, base)} ${(p * 100).toFixed(1)}%, ${mix(from, pct, base)})`;
        reel.style.setProperty('--reel-a', blend(64, '#FBFAF8'));
        reel.style.setProperty('--reel-b', blend(46, '#FFF6EC'));
        reel.style.setProperty('--reel-c', blend(34, '#F6F2FF'));
      };
      setLight(tunnelColor, tunnelColor, 0);
      reel.style.setProperty('--reel-glow', String(PROMO_REEL_LAW.glowLo));

      const firstHero = seq.find((cell) => cell.hero);
      const home = seq.find((cell) => cell.yours);
      // v13 (E1 + E3): everything lands on the score's beat grid (112 bpm,
      // counted from the reel's first frame): a tunnel of new stores flies at
      // the camera and brakes onto the first store on a hit; from there every
      // store is a hard cut on the beat: a flash, the device punches in, its
      // title slams; the quick ones come faster and faster; "Your store" last.
      const anchored = marketingPart() === 'full' && window.__promoFilmT0 != null;
      if (anchored) await untilFilm(PROMO_FILM_ANCHORS.reel);   // v21: the reel starts on the stores section's first bar
      // the cuts count from the anchor itself, not from the frame the wait resumed on (the export clock steps per frame)
      const t0 = anchored ? window.__promoFilmT0 + PROMO_FILM_ANCHORS.reel * 1000 : performance.now();
      // v23: a cut past the list's end (more run cards than cuts) keeps the ladder's last step
      const cutS = (i) => (i < PROMO_REEL_CUTS_S.length ? PROMO_REEL_CUTS_S[i] : PROMO_REEL_CUTS_S[PROMO_REEL_CUTS_S.length - 1] + (i - PROMO_REEL_CUTS_S.length + 1) * 0.13);
      const cutAt = (i) => t0 + cutS(i) * 1000;   // v21: every cut on one of the song's claps
      const onBeat = (minMs = 0) => {   // wait for the first beat at least minMs away
        const now = performance.now();
        const k = Math.ceil((now + minMs - t0) / PROMO_REEL_BEAT_MS - 0.02);
        return waitMs(Math.max(0, t0 + k * PROMO_REEL_BEAT_MS - now));
      };
      const flash = document.createElement('div');
      flash.className = 'promo-reel__flash';
      reel.appendChild(flash);
      const streak = document.createElement('div');
      streak.className = 'promo-reel__streak';
      reel.appendChild(streak);
      // v24 light law: one clock for the cut, the camera and the light. Window -1 is the tunnel [t0, cut 0], then
      // seq[w] owns [cut w, cut w+1] ("Your store" the last PROMO_REEL_LAW.homeMs). Per window (promoReelPhase):
      // light = lo + (hi - lo) * bell (brightest mid-card, its trough on the cuts); the camera's whip (in from the
      // right, held, out to the left), the card's push and the light's drift all ride go (fastest at the cuts,
      // near-still mid-card); the colour crosses from one store to the next through the trough, half on each side
      // of the cut, so everywhere else it is the colour of the card on screen.
      const lawEnd = (w) => (w < seq.length - 1 ? cutAt(w + 1) : cutAt(w) + PROMO_REEL_LAW.homeMs);
      const lawColor = (w) => (w < 0 ? tunnelColor : (seq[w]?.src.color || '#F28C38'));
      reel.__lawColors = seq.map((cell, w) => lawColor(w));   // (the light probe reads it)
      const lawAt = (now) => {
        const { edgeMs, floor, glowLo, glowHi, push, slide } = PROMO_REEL_LAW;
        let w = -1;
        while (w + 1 < seq.length && now >= cutAt(w + 1)) w += 1;
        const ph = promoReelPhase(now, w < 0 ? t0 : cutAt(w), lawEnd(w), edgeMs, floor);
        const cell = w >= 0 ? seq[w] : null;
        const at = ph.go - 0.5;
        const amp = slide * W * Math.min(1.5, Math.max(0.7, (ph.len / 600) ** 0.35));   // the whip's reach: a little longer on a long card, shorter in the strobe
        // the tunnel flies on its own (the first store comes out of it already on its window's start mark, so it keeps
        // moving through its cut); "Your store" only arrives (its dive follows)
        const lat = w < 0 ? -0.5 : (cell.yours ? Math.min(0, at) : at);
        const moving = !(w < 0 || (cell.yours && at > 0));
        let from = lawColor(w); let to = from; let p = 0;
        if (w >= 0 && ph.x < ph.h) { from = lawColor(w - 1); to = lawColor(w); p = 0.5 + 0.5 * Math.sin((Math.PI / 2) * (ph.x / ph.h)); }
        else if (w < seq.length - 1 && ph.len - ph.x < ph.h) { to = lawColor(w + 1); p = 0.5 - 0.5 * Math.sin((Math.PI / 2) * ((ph.len - ph.x) / ph.h)); }
        return {
          w, cell, t: now, t0, a: w < 0 ? t0 : cutAt(w), b: lawEnd(w), u: ph.u, bell: ph.bell, phi: w + ph.go,
          glow: glowLo + (glowHi - glowLo) * ph.bell,
          off: amp * lat, vx: moving ? amp * ph.speed * 1000 : 0,
          k: cell?.yours ? 1 : 1 + push * at, k0: 1 - push / 2,
          from, to, p,
        };
      };
      const slam = (cell, index) => {   // v24: the hit is the cut's sound only (the light law owns the picture: no flash, no punch)
        const soft = cell.strobe && (cell.win ?? 1) < PROMO_REEL_SOFT_S;   // v18: the run's slower flashes still hit like a store
        promoSfx(soft ? 'strobe-tick' : 'reel-slam', { index });
      };
      const preCut = () => { };   // v24: the outgoing push is the light law's (paint), not a tween before the cut
      const beatTime = (minMs, frac = 1) => {
        const grid = PROMO_REEL_BEAT_MS * frac; const now = performance.now();
        return t0 + Math.ceil((now + minMs - t0) / grid - 0.02) * grid;
      };
      let cutClock = 0;   // when the last cut landed: the next one is exactly its beats later
      const untilAt = async (cell, at, whoosh = true) => {
        const now = performance.now();
        if (whoosh && at - now > 520) window.setTimeout(() => promoSfx('reel-pre'), at - now - 330);
        if (at - now > 320) { await waitMs(at - now - 150); preCut(cell); }
        await waitMs(Math.max(0, at - performance.now()));
        cutClock = at;
      };
      const untilCut = async (cell, minMs, frac = 1, whoosh = true) => {
        const at = beatTime(minMs, frac);
        const now = performance.now();
        if (whoosh && at - now > 340) window.setTimeout(() => promoSfx('reel-pre'), at - now - 330);
        if (at - now > 160) { await waitMs(at - now - 150); preCut(cell); }
        await waitMs(Math.max(0, at - performance.now()));
      };
      const cutTo = (cell, index) => {   // v24: the camera and the light are already on this card (paint follows the cut clock)
        slam(cell, index);
        paint();
      };
      cam.x = camFor(firstHero);
      firstHero.t.k = 0.0001;
      paint();
      window.requestAnimationFrame(loop);
      // 1. the tunnel: new stores (never one we show later) fly at the camera
      reel.classList.add('is-in');
      // v23: the reel crossfades in over the held sync scene (which pushes in and goes once covered): never a blank frame
      // v24: ...and its clerk flies into the first tunnel store's own widget as the tunnel opens: the reel is
      // whole under the sync scene at once, the sync's light lifts off it, the clerk lands in the store
      const tun = { camZ: 0 };
      const dock = flyers[0]?.video && flyers[0].sk.device === 'desktop' ? flyers[0] : null;
      const aim = dock ? () => {
        const { w } = dock.size; const sh = w / PROMO_DEVICE_SPEC.desktop.aspect; const bar = PROMO_DEVICE_SPEC.desktop.bar * w;
        const lx = w * (PROMO_REEL_DOCK_AT.x - 0.5); const ly = -dock.size.h / 2 + bar + sh * PROMO_REEL_DOCK_AT.y;
        const th = (dock.rot * Math.PI) / 180;
        const X = dock.x + lx * Math.cos(th); const Y = dock.y + ly; const Z = dock.z - tun.camZ - lx * Math.sin(th);
        const k = P / Math.max(1, P - Z);
        return { x: W / 2 + (X - W / 2) * k, y: H / 2 + (Y - H / 2) * k, h: sh * PROMO_REEL_DOCK_AT.h * k };
      } : null;
      if (handoff && aim) { reel.style.transition = 'none'; reel.style.opacity = '1'; } else fadeStep(reel, 0, 1, handoff ? PROMO_SYNC_HANDOFF_MS : 200);
      if (handoff) handoff(PROMO_SYNC_HANDOFF_MS, aim);
      promoSfx('reel-in');
      speakTake('t-stores');   // v16: the narrator speaks over the tunnel only (never over a store's own voice)
      reel.insertBefore(tunnel, strip);
      flyers.forEach((f, i) => roll(f.video, (i * 0.4) % 3.2));   // v23: the new stores play as they fly (deterministic: the export clock seeks them)
      const zEnd = -P * 0.9 - flyers.length * P * 0.55 - P * 0.6;   // (unchanged: the first store still lands on its clap)
      const tunnelMs = Math.max(400, cutAt(0) - performance.now());   // v21: the first store lands on its clap
      // v24 light law: the tunnel's light (its first store's colour) and its crossfade into the first hero are paint()'s
      await tweenStep(tunnelMs, (e) => {
        const camZ = zEnd * e;
        tun.camZ = camZ;
        flyers.forEach((f, i) => {
          const rel = f.z - camZ;
          // each card fades well before it would reach the camera (never a giant, distorted card)
          const o = rel > -P * 0.15 ? 0 : (rel > -P * 0.55 ? (-P * 0.15 - rel) / (P * 0.4) : Math.min(1, (rel + P * 7) / (P * 2.5)));
          f.dev.style.transform = `translate3d(${f.x.toFixed(1)}px, ${f.y.toFixed(1)}px, ${rel.toFixed(1)}px) rotateY(${f.rot.toFixed(2)}deg)`;
          f.dev.style.opacity = Math.max(0, o).toFixed(3);
          f.dev.style.visibility = o <= 0.001 ? 'hidden' : '';
          f.dev.style.zIndex = String(Math.round(rel + 100000));
          if (rel > -P * 0.5 && !f.passed) { f.passed = true; promoSfx('reel-tick', { index: i }); }   // one soft tick as each card passes
        });
        // the first store comes out of the depth onto its slot (v24: still rushing on the clap, the law settles it)
        const d = (zEnd - camZ);   // <= 0: how far behind the slot it still is
        const k = P / Math.max(1, P - d);
        firstHero.t.k = Math.max(0.0001, Math.min(1, k));
        firstHero.t.tx = (W / 2 - (firstHero.cx - cam.x)) * (1 - firstHero.t.k);
        firstHero.t.ty = (H / 2 - (firstHero.full.y + firstHero.full.h / 2)) * (1 - firstHero.t.k);
      }, (u) => 0.4 * (1 - (1 - u) ** 3) + 0.6 * u ** 4);   // v24 law: quick off the sync, a calmer glide mid-tunnel, fastest into the cut
      firstHero.t.tx = 0; firstHero.t.ty = 0;
      tunnel.remove();
      slam(firstHero, 0);
      paint();
      cutClock = performance.now();

      // 2. the four stores: hard cuts on the beat
      const heroes = seq.filter((cell) => cell.hero);
      for (const [index, hero] of heroes.entries()) {
        const item = hero.src;
        if (index > 0) { await ready(hero.heroVideo); cutTo(hero, index); }
        hero.live = true;
        hero.dev.classList.add('is-live');
        roll(hero.heroVideo, item.start || 0);
        const now = performance.now();
        const heroMs = Math.min(item.dur * 1000, (cutS(index + 1) - cutS(index)) * 1000 - 40);   // never into the next store
        (window.__promoAudioCues = window.__promoAudioCues || []).push({ src: item.video, atMs: now, fromSec: item.start || 0, endMs: now + heroMs });
        window.__promoNarratorUntil = Math.max(window.__promoNarratorUntil || 0, now + heroMs);
        revealReelCopy(hero.copy, 'slam');
        const saidLines = Array.isArray(item.said?.[0]?.[0]) ? item.said : (item.said?.length ? [item.said] : []);
        const spot = reelSaidSpot(hero, W, H, S);
        saidLines.forEach((line) => this.playSaidPill(reel, line, { color: item.color, kind: item.saidKind || 'shopper', hold: 0.6, place: spot }));
        (item.keys || []).forEach(([from, to]) => window.setTimeout(() => promoSfx(item.device === 'desktop' ? 'typing' : 'tapping', { ms: Math.round((to - from) * 1000) }), from * 1000));
        (item.sfx || []).forEach(([at, id]) => window.setTimeout(() => promoSfx(id), at * 1000));
        // the take plays out, then the cut comes on the nearest beat (never a held frame of more than half a beat)
        await untilAt(hero, cutAt(index + 1));
        reel.querySelectorAll('.promo-reel__said:not(.is-out)').forEach((pill) => { pill.classList.add('is-out'); pill.style.opacity = '0'; });
        park(hero.heroVideo);
        hero.dev.classList.remove('is-live');
      }

      // 3. the run: one accelerating ladder (PROMO_REEL_RUN): the quick stores speak, each in its own
      // language and its own line; real stores flash between them; a few skeletons blur in at the end
      const run = seq.filter((cell) => cell.whip || cell.strobe);
      run.forEach((cell, n) => { cell.win = cutS(heroes.length + n + 1) - cutS(heroes.length + n); });   // v23: each card's window, from the cut list
      let strobing = false;
      for (const [index, cell] of run.entries()) {
        if (!index) promoSfx('reel-quick');   // marks the run for the score
        if (!strobing && cell.win < PROMO_REEL_SOFT_S) { strobing = true; promoSfx('reel-strobe', { ms: Math.round((cutS(heroes.length + run.length) - cutS(heroes.length + index)) * 1000) }); }
        reel.querySelectorAll('.promo-reel__said:not(.is-out)').forEach((pill) => { pill.classList.add('is-out'); pill.style.opacity = '0'; });
        cutTo(cell, cell.whip ? heroes.length + cell.src.quick : 100 + index);
        const id = cell.whip ? PROMO_REEL_QUICK_VOICES[cell.src.quick] : null;
        const voice = id ? await clerkVoice(id) : null;
        if (voice) {
          const now = performance.now();
          const src = `/promo/voice/${id}.wav`;
          const spoken = voiceWords(voice).filter((w) => !/^\[[^\]]*\]$/.test(w.text));
          const lead = Math.max(0, (spoken[0]?.startMs || 0) / 1000 - 0.03);   // the line starts the moment the store lands
          // v23: the window is the card's, not the line's: the voice is clipped at the cut with a short fade-out
          const windowMs = cell.win * 1000 - 40;   // never spills into the next card
          const clipMs = Math.min(voice.durationMs - lead * 1000, windowMs);
          (window.__promoAudioCues = window.__promoAudioCues || []).push({ src, atMs: now + 20, fromSec: lead, endMs: now + 20 + clipMs, fadeIn: 0.02, fadeOut: clipMs < voice.durationMs - lead * 1000 ? Math.min(PROMO_REEL_QUICK_FADE_S, clipMs / 3000) : 0.02 });   // v24: a line that fits its card (each take is cut to fit) plays whole, no fade into its last word
          if (!document.documentElement.classList.contains('is-promo-export')) window.setTimeout(() => { const a = new Audio(src); a.currentTime = lead; a.play().catch(() => { }); window.setTimeout(() => a.pause(), clipMs); }, 20);
          const words = spoken.map((w) => [0.04 + w.startMs / 1000 - lead, w.text]);
          if (words.length) this.playSaidPill(reel, words.map(([t, w]) => [Math.max(Math.min(0.3, cell.win * 0.2), t), w]), { color: cell.src.color, kind: 'voice-agent', hold: 0.15, place: reelSaidSpot(cell, W, H, S) });   // v23: in early on the shorter cards
        }
        await untilAt(cell, cutAt(heroes.length + index + 1), cell.win >= 0.67 && index < run.length - 1);
      }
      reel.querySelectorAll('.promo-reel__said:not(.is-out)').forEach((pill) => { pill.classList.add('is-out'); pill.style.opacity = '0'; });
      // ...and they slam into "Your store", centred: one violent hit, then the CTA's calm
      promoWidgetDebug('setPlaceholder', 'Ask me anything');
      this.seatReelWidget(home);
      cutTo(home, heroes.length + PROMO_REEL_QUICK_VOICES.length);
      slam(home, 200, 2.6);
      promoSfx('yourstore-hit');
      tweenStep(420, (e, u) => { strip.style.translate = `${(Math.sin(u * 50) * (1 - u) * W * 0.008).toFixed(1)}px ${(Math.cos(u * 43) * (1 - u) * H * 0.008).toFixed(1)}px`; }, (u) => u)
        .then(() => { strip.style.translate = ''; });
      promoSfx('reel-land');
      setOpeningAvatarAction('beckon');   // v18: "come on in" (new clip; waving is used earlier)
      await waitMs(PROMO_YOURSTORE_HOLD_MS - 300);   // v21: shorter, so the EA close always waits for the score's final hit (never late)
      promoSfx('dive');
      reel.classList.add('is-entering');
      const fill = Math.max(W / (home.full.w * 0.9), H / (home.full.h * 0.62)) * 1.5;
      tween(home.t, { k: fill * 1.25, ty: H * 0.04 * fill * 1.25 }, PROMO_YOURSTORE_DIVE_MS + PROMO_REEL_OUT_MS, (u) => u * u * u);
      await waitMs(PROMO_YOURSTORE_DIVE_MS * 0.7);
      reel.classList.add('is-out');
      promoSfx('reel-out');
      fadeStep(reel, 1, 0, PROMO_REEL_OUT_MS + 200);
      window.setTimeout(() => { light.on = false; painting = false; this.unseatReelWidget(); reel.remove(); }, PROMO_REEL_OUT_MS + 260);
    }

    // the live clerk takes its corner in the empty "Your store" (never a copy)
    seatReelWidget(home) {
      const holder = home?.dev.querySelector('.promo-reel__yours-widget');
      const embed = [...document.querySelectorAll('[id="bizmis-avatar-embed"]')].find((node) => !node.closest('svg'));
      const widget = embed?.closest('[data-promo-widget]');
      if (!holder || !widget) return;
      this.reelWidgetHome = { widget, parent: widget.parentElement, next: widget.nextSibling, style: widget.getAttribute('style') };
      document.documentElement.classList.remove('is-promo-card-out', 'is-promo-sync-hero');
      document.documentElement.classList.add('is-promo-yours', 'is-promo-live-card');   // the full card: avatar, composer, chrome
      holder.appendChild(widget);
      Object.assign(widget.style, { position: 'absolute', left: '0', top: '0', right: 'auto', bottom: 'auto', margin: '0', transition: 'none', transformOrigin: '0 0' });
      // v11: the card itself (the widget box is larger than its card) sits in
      // the store's bottom-right corner, at the holder's width
      const card = widget.querySelector('.bizmis-desktop-lite-chat [class*="group/card"]') || widget.querySelector('.bizmis-desktop-lite-chat') || widget;
      widget.style.transform = 'none';
      const hb = holder.getBoundingClientRect();
      const px = hb.width / Math.max(1, holder.offsetWidth);   // screen px per holder px (the device is scaled)
      const cb0 = card.getBoundingClientRect();
      const scale = hb.width / Math.max(1, cb0.width);
      widget.style.transform = `scale(${scale.toFixed(4)})`;
      const cb = card.getBoundingClientRect();
      const dx = (hb.right - cb.right) / px; const dy = (hb.bottom - cb.bottom) / px;
      widget.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${scale.toFixed(4)})`;
    }

    unseatReelWidget() {
      const home = this.reelWidgetHome;
      document.documentElement.classList.remove('is-promo-yours', 'is-promo-live-card');
      if (!home) return;
      home.parent?.insertBefore(home.widget, home.next);
      if (home.style != null) home.widget.setAttribute('style', home.style); else home.widget.removeAttribute('style');
      this.reelWidgetHome = null;
    }

    // "Typed, or spoken": a spoken ask shows as a listening pill (mic, then the
    // words as they're said) just under the device, gone shortly after.
    playSaidPill(reel, said, at) {
      const pill = document.createElement('div');
      pill.className = `promo-reel__said is-${at.kind || 'shopper'}${at.where ? ` is-${at.where}` : ''}`;
      pill.style.setProperty('--tint', at.color);
      const icon = at.kind === 'typed'
        ? '<span class="promo-reel__said-mic is-typed"><svg viewBox="0 0 24 24"><path d="M4 7.5h16v9H4zM7 10.5h1M10 10.5h1M13 10.5h1M16 10.5h1M8 13.5h8"/></svg></span>'
        : at.kind === 'clerk'
        ? '<span class="promo-reel__said-mic is-clerk"><svg viewBox="0 0 24 24"><path d="M5 6.5h14a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H11l-4 3v-3H5A1.5 1.5 0 0 1 3.5 15V8A1.5 1.5 0 0 1 5 6.5z"/></svg></span>'
        // v11: a spoken line is plain words in a pill whose edge glows (Siri-like), no badge
        : '';
      if (!icon) pill.classList.add('is-voice');
      pill.innerHTML = `${icon ? '' : '<span class="promo-reel__said-halo" aria-hidden="true"></span>'}${icon}<span class="promo-reel__said-text">${said.map(([, word]) => `<span>${word}</span>`).join(' ')}</span>`;
      if (!icon) {   // the glow turns slowly while the pill is up (stepped: export-safe)
        const t0 = performance.now();
        const turn = (now) => {
          if (!pill.isConnected) return;
          pill.style.setProperty('--glow-a', `${(210 + ((now - t0) / 1000) * 70).toFixed(1)}deg`);
          window.requestAnimationFrame(turn);
        };
        turn(t0);
      }
      const clock = pill.querySelector('.promo-reel__live b');
      if (clock) {
        const t0 = performance.now() - (at.callAt ?? 4) * 1000;   // the call began a few seconds earlier
        const tick = (now) => {
          if (!pill.isConnected) return;
          const sec = Math.floor((now - t0) / 1000);
          const text = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
          if (clock.textContent !== text) clock.textContent = text;
          window.requestAnimationFrame(tick);
        };
        window.requestAnimationFrame(tick);
      }
      at.place?.(pill);
      reel.appendChild(pill);
      const words = [...pill.querySelectorAll('.promo-reel__said-text > span')];
      pill.getBoundingClientRect();
      window.setTimeout(() => {
        const others = [...reel.querySelectorAll('.promo-reel__said.is-in:not(.is-out)')].filter((other) => other !== pill);
        others.forEach((other) => { other.classList.add('is-out'); fadeStep(other, Number(other.style.opacity || 1), 0, 160); });
        // one voice at a time: the previous line is gone before this one fades in (never two texts on top of each other)
        window.setTimeout(() => { pill.classList.add('is-in'); fadeStep(pill, 0, 1, 260); }, others.length ? 180 : 0);
      }, Math.max(0, (said[0][0] - 0.3) * 1000));
      said.forEach(([t], k) => window.setTimeout(() => words[k].classList.add('is-said'), t * 1000));
      const end = said[said.length - 1][0] + (at.hold ?? (at.where === 'moments' ? 0.35 : 1.4));   // in the store the answer follows at once
      window.setTimeout(() => { if (!pill.classList.contains('is-out')) { pill.classList.add('is-out'); fadeStep(pill, 1, 0, 260); } }, end * 1000);
      window.setTimeout(() => pill.remove(), end * 1000 + 600);
    }

    playStoreStack(onDone) {
      const slides = this.carouselTrack ? [...this.carouselTrack.children] : [];
      if (!slides.length) {
        onDone();
        return;
      }
      const ask = promoVideoConfig.cta !== 'none';
      const lookMs = 640;
      const liftMs = 560;
      slides.forEach((slide, index) => {
        slide.style.zIndex = String(slides.length - index);
      });
      let index = 0;
      const step = () => {
        const store = this.stores[index];
        if (store) this.arriveStore(store);
        const last = index >= slides.length - 1;
        window.setTimeout(() => {
          if (last && !ask) {
            onDone();
            return;
          }
          slides[index].classList.add('is-lift');
          index += 1;
          if (index >= slides.length) {
            this.root.classList.add('is-see-cta');
            window.setTimeout(onDone, liftMs);
            return;
          }
          window.setTimeout(step, liftMs);
        }, lookMs);
      };
      step();
    }

    playStoreWave(onDone) {
      const slides = this.carouselTrack
        ? [...this.carouselTrack.querySelectorAll('.promo-opening__slide')]
        : [];
      if (!slides.length) {
        onDone();
        return;
      }
      this.stopGlide();
      if (this.carouselTrack) {
        this.carouselTrack.style.transition = 'none';
        this.carouselTrack.style.transform = 'none';
      }
      const cycle = PROMO_SEE_WAVE_MS;
      const started = performance.now();
      let shown = -1;
      const frame = (now) => {
        const elapsed = now - started;
        if (elapsed >= cycle * slides.length) {
          this.paintWave(-1, 0, 0);
          this.glideFrame = 0;
          onDone();
          return;
        }
        const index = Math.min(slides.length - 1, Math.floor(elapsed / cycle));
        const sample = waveSample(elapsed - index * cycle);
        this.paintWave(index, sample.amount, sample.travel, sample.presence);
        if (index !== shown) {
          shown = index;
          const store = this.stores[index];
          if (store) this.arriveStore(store);
        }
        this.glideFrame = window.requestAnimationFrame(frame);
      };
      this.glideFrame = window.requestAnimationFrame(frame);
    }

    paintWave(index, amount, travel, presence) {
      const slides = this.carouselTrack
        ? [...this.carouselTrack.querySelectorAll('.promo-opening__slide')]
        : [];
      const wave = Math.min(1, Math.max(0, amount));
      const motion = Math.min(1, Math.max(0, travel));
      const shown = presence == null
        ? (wave <= 0.08 ? wave / 0.08 : 1)
        : Math.min(1, Math.max(0, presence));
      this.root.style.setProperty('--see-wave', wave.toFixed(4));
      this.root.style.setProperty('--see-travel', motion.toFixed(4));
      const store = this.stores[index];
      if (store?.accent) this.root.style.setProperty('--promo-store-accent', store.accent);
      const pass = this.root.classList.contains('is-store-pass');
      slides.forEach((slide, slideIndex) => {
        const on = slideIndex === index && shown > 0.01;
        slide.classList.toggle('is-wave', on);
        slide.style.setProperty('--wave', on ? wave.toFixed(4) : '0');
        slide.style.setProperty('--wave-x', on ? motion.toFixed(4) : '0.5');
        if (pass) return;
        slide.style.opacity = on ? shown.toFixed(4) : '0';
        slide.style.zIndex = on ? '2' : '1';
        slide.style.transform = on ? 'scale(1)' : 'scale(0.96)';
      });
      const glow = this.ensureClerkGlow();
      if (!glow) return;
      if (store) glow.style.setProperty('--promo-clerk-glow', store.accent || 'transparent');
      glow.style.opacity = wave.toFixed(4);
    }

    playStoreGlide(onDone) {
      const end = this.seeEndIndex();
      const track = this.carouselTrack;
      if (!track || !track.children.length) {
        onDone();
        return;
      }
      this.stopGlide();
      track.style.transition = 'none';
      track.style.transform = `translate3d(${-this.carouselOffset(0)}px, 0, 0)`;
      this.syncWheelPerspective();
      this.applyWheel(0);
      this.setActiveSlide(0, end <= 0);
      const first = this.stores[0];
      if (first) this.arriveStore(first);
      if (end <= 0) {
        onDone();
        return;
      }

      const started = performance.now();
      let arrived = 0;

      const frame = (now) => {
        const linear = (now - started) / PROMO_SEE_GLIDE_MS;
        if (linear >= 1) {
          this.placeCarousel(end, true);
          this.setActiveSlide(end, true);
          if (arrived < end) {
            const store = this.stores[end];
            if (store) this.arriveStore(store);
          }
          this.glideFrame = 0;
          onDone();
          return;
        }
        const index = end * glideEase(linear);
        const base = Math.min(end - 1, Math.floor(index));
        const next = base + 1;
        const frac = index - base;
        const offset = this.carouselOffset(base)
          + (this.carouselOffset(next) - this.carouselOffset(base)) * frac;
        track.style.transform = `translate3d(${-offset}px, 0, 0)`;
        this.syncWheelPerspective();
        this.applyWheel(index);
        const centered = Math.round(index);
        if (centered > arrived) {
          arrived = centered;
          this.setActiveSlide(arrived, false);
          const store = this.stores[arrived];
          if (store) this.arriveStore(store);
        }
        this.glideFrame = window.requestAnimationFrame(frame);
      };
      this.glideFrame = window.requestAnimationFrame(frame);
    }

    arriveStore(store) {
      this.stainClerk(store.accent);
      promoWidget.applyStoreLook(store);
    }

    stainClerk() {
      this.root.querySelector('[data-promo-stains]')?.replaceChildren();
    }

    depart() {
      window.__promoExportEnded = true;
      this.stopGlide();
      this.settleClerkRow();
      window.removeEventListener('resize', this.boundDock);
      promoWidget.hide();
      this.restoreWidget();
      document.documentElement.classList.remove('is-promo-pitch');
      document.documentElement.classList.add('is-promo-depart');
      this.root.classList.add('is-depart');
      window.setTimeout(() => this.revealStore(), PROMO_DEPART_MS);
    }

    revealStore() {
      if (!PROMO_OPENING_REVEAL_STORE) return;
      const url = new URL(window.location.href);
      url.searchParams.set(PROMO_VIDEO_PARAM, 'true');
      url.searchParams.delete('auto');
      window.history.replaceState({}, '', url.toString());
      promoStoreUnlocked = true;

      this.restoreWidget();
      document.documentElement.classList.remove('is-promo-opening', 'is-promo-pitch', 'is-promo-depart');
      this.root.remove();
      promoWidget.remountForStore();
      this.onStoreReady?.();
    }

    clearPainTimers() {
      (this.painTimers || []).forEach((timer) => window.clearTimeout(timer));
      this.painTimers = [];
    }

    painHost() {
      return this.root.querySelector('[data-promo-moments]');
    }

    painStore() {
      return this.root.querySelector('.promo-opening__store');
    }

    painCards() {
      const board = this.painHost()?.querySelector('.promo-moments__board');
      if (!board) return [];
      return [...board.querySelectorAll('.promo-moments__card:not(.is-extra)')];
    }

    releasePainStage() {
      this.clearPainTimers();
      this.resetScaleScene();
      this.root.classList.remove(
        'is-pain',
        'is-pain-loop',
        'is-pain-zoom',
        'is-pain-out',
        'is-moments',
        'is-window-aim',
        'is-window-shut',
        'is-chat-aim',
        'is-scale-shrink',
      );
      const store = this.painStore();
      if (store) {
        const host = store.parentElement;
        if (host?.classList.contains('promo-puff__host')) host.replaceWith(store);
        store.classList.remove('promo-puff__body');
        store.style.visibility = '';
        store.style.opacity = '';
        store.style.transform = '';
        store.style.transition = '';
        store.style.transformOrigin = '';
        store.querySelectorAll('.promo-close__veil, .promo-close__mark, .promo-close__lost-mark, .promo-glide__lost-mark, .promo-glide__veil').forEach((node) => node.remove());
        store.style.filter = ''; store.querySelectorAll('[style*="grayscale"]').forEach((node) => { node.style.filter = ''; });
      }
      this.root.classList.remove('is-close-seat');
      this.root.querySelectorAll('.promo-close__lost, .promo-close__poof').forEach((node) => node.remove());
      const host = this.painHost();
      host?.querySelector('.promo-moments__board')?.style.removeProperty('--pain-scroll');
      host?.classList.remove('is-pain-dim');
      this.painCards().forEach((card) => {
        card.classList.remove('is-pain-open', 'is-pain-hover', 'is-pain-add');
      });
      host?.querySelector('.promo-moments__board')?.classList.remove('is-instant');
      this.root.querySelector('[data-promo-pain-chat]')?.setAttribute('hidden', '');
      const cursor = this.root.querySelector('[data-promo-pain-cursor]');
      if (cursor) cursor.hidden = true;
    }

    ensurePainChrome() {
      const store = this.painStore();
      if (!store) return;
      if (!store.querySelector('[data-promo-pain-cursor]')) {
        const cursor = document.createElement('span');
        cursor.className = 'promo-pain__cursor';
        cursor.setAttribute('data-promo-pain-cursor', '');
        cursor.setAttribute('aria-hidden', 'true');
        cursor.innerHTML = PROMO_MAC_POINTER;
        store.appendChild(cursor);
      }
      if (store.querySelector('[data-promo-pain-chat]')) return;
      const chat = document.createElement('div');
      chat.className = 'promo-pain__chat';
      chat.setAttribute('data-promo-pain-chat', '');
      chat.setAttribute('hidden', '');
      const launcher = document.createElement('button');
      launcher.type = 'button';
      launcher.className = 'promo-pain__launcher';
      launcher.setAttribute('aria-hidden', 'true');
      launcher.tabIndex = -1;
      launcher.innerHTML = PROMO_PAIN_MARK;
      launcher.addEventListener('click', (event) => {
        event.preventDefault();
        chat.classList.add('is-open');
        chat.classList.remove('is-shut');
        chat.removeAttribute('hidden');
      });
      const panel = document.createElement('div');
      panel.className = 'promo-pain__panel';
      const avatar = document.createElement('span');
      avatar.className = 'promo-pain__avatar';
      avatar.innerHTML = PROMO_PAIN_MARK;
      const title = document.createElement('p');
      title.className = 'promo-pain__title';
      title.textContent = 'Chatbot';
      const brand = document.createElement('div');
      brand.className = 'promo-pain__brand';
      brand.append(avatar, title);
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'promo-pain__close';
      close.setAttribute('data-promo-chat-close', '');
      close.setAttribute('aria-hidden', 'true');
      close.tabIndex = -1;
      close.addEventListener('click', (event) => {
        event.preventDefault();
        chat.classList.remove('is-open', 'is-shut');
        chat.removeAttribute('hidden');
      });
      const head = document.createElement('div');
      head.className = 'promo-pain__head';
      head.append(brand, close);
      const chips = document.createElement('div');
      chips.className = 'promo-pain__chips';
      PROMO_PAIN_CHIPS.forEach((label) => {
        const chip = document.createElement('span');
        chip.className = 'promo-pain__chip';
        chip.textContent = label;
        chips.appendChild(chip);
      });
      const log = document.createElement('div');
      log.className = 'promo-pain__log';
      log.setAttribute('data-promo-pain-log', '');
      const input = document.createElement('p');
      input.className = 'promo-pain__input';
      input.setAttribute('data-promo-pain-input', '');
      const send = document.createElement('span');
      send.className = 'promo-pain__send';
      send.innerHTML = PROMO_PAIN_SEND;
      const composer = document.createElement('div');
      composer.className = 'promo-pain__composer';
      composer.append(input, send);
      const typing = document.createElement('p');
      typing.className = 'promo-pain__typing';
      typing.setAttribute('data-promo-pain-typing', '');
      typing.innerHTML = '<i></i><i></i><i></i>';
      const footer = document.createElement('p');
      footer.className = 'promo-pain__footer';
      footer.hidden = true;
      panel.append(head, log, typing, chips, composer, footer);
      chat.append(panel, launcher);
      store.appendChild(chat);
      this.lockPainChatBox();
    }

    lockPainChatBox() {
      const panel = this.root.querySelector('[data-promo-pain-chat] .promo-pain__panel');
      if (panel) panel.style.height = '';
    }

    openPainStage() {
      this.root.style.setProperty('--promo-pain-ease', PROMO_PAIN_EASE);
      this.root.style.setProperty('--promo-pain-open', `${PROMO_PAIN_SCROLL_MS}ms`);
      this.root.style.setProperty('--promo-pain-card', '720ms');
      this.root.style.setProperty('--promo-pain-exit', `${PROMO_PAIN_EXIT_MS}ms`);
      this.ensureMoments();
      const openingStore = this.painStore();
      if (openingStore) openingStore.style.visibility = '';
      this.root.classList.add('is-pain', 'is-moments');
      document.documentElement.style.setProperty('--ad-warmth', '0');
      const stage = this.momentStage();
      void stage?.offsetWidth;
      applyMomentPose(stage, 'grid', { instant: true });
      this.ensurePainChrome();
      this.root.classList.remove('is-pain-zoom');
      const host = this.painHost();
      host?.setAttribute('data-promo-pain', '');
      host?.setAttribute('data-promo-pain-scene', 'unattended');
      host?.setAttribute('data-promo-pain-beat', 'grid');
      const cursor = this.root.querySelector('[data-promo-pain-cursor]');
      if (cursor) {
        cursor.hidden = true;
        cursor.style.opacity = '0';
      }
      this.root.querySelector('[data-promo-pain-chat]')?.setAttribute('hidden', '');
      this.lockPainChatBox();
    }

    painCols() {
      const board = this.painHost()?.querySelector('.promo-moments__board');
      return Number(board?.dataset.painCols) || PROMO_MOMENT_GRID_COLS;
    }

    painBrowseCard(slot) {
      const cols = this.painCols();
      const row = 1 + Math.max(0, slot);
      const column = slot === 0 ? 1 : 2;
      const index = row * cols + column;
      return this.painCards()[index] || null;
    }

    painBrowseScroll(slot) {
      const card = this.painBrowseCard(slot);
      const gy = Number.parseFloat(card?.style.getPropertyValue('--gy')) || 0;
      return -gy;
    }

    setPainScroll(px) {
      const board = this.painHost()?.querySelector('.promo-moments__board');
      if (!board) return 0;
      const previous = Number.parseFloat(board.style.getPropertyValue('--pain-scroll')) || 0;
      board.style.setProperty('--pain-scroll', `${px}px`);
      return px - previous;
    }

    placePainCursor(target, visible, scrollDelta = 0) {
      const cursor = this.root.querySelector('[data-promo-pain-cursor]');
      const store = this.painStore();
      if (!cursor || !store) return;
      const reveal = cursor.hidden || cursor.style.opacity !== '1';
      cursor.hidden = false;
      if (!target) {
        cursor.style.opacity = '0';
        return;
      }
      if (reveal) cursor.style.transition = 'none';
      const storeBox = store.getBoundingClientRect();
      const box = target.getBoundingClientRect();
      const x = box.left + box.width * 0.55 - storeBox.left;
      const y = box.top + box.height * 0.34 - storeBox.top + scrollDelta;
      cursor.style.setProperty('--pain-x', `${Math.round(x)}px`);
      cursor.style.setProperty('--pain-y', `${Math.round(y)}px`);
      if (reveal) {
        cursor.getBoundingClientRect();
        cursor.style.transition = '';
      }
      cursor.style.opacity = visible ? '1' : '0';
    }

    placePainCursorEdge() {
      const cursor = this.root.querySelector('[data-promo-pain-cursor]');
      const store = this.painStore();
      if (!cursor || !store) return;
      cursor.hidden = false;
      cursor.style.setProperty('--pain-x', `${store.clientWidth - 18}px`);
      cursor.style.setProperty('--pain-y', `${Math.round(store.clientHeight * 0.62)}px`);
      cursor.style.opacity = '0';
    }

    paintPainLog(through) {
      const log = this.root.querySelector('[data-promo-pain-log]');
      const input = this.root.querySelector('[data-promo-pain-input]');
      const typing = this.root.querySelector('[data-promo-pain-typing]');
      if (!log || !input || !typing) return;
      log.replaceChildren();
      input.textContent = '';
      input.classList.remove('is-live');
      typing.hidden = true;
      if (through === 'typed-1') {
        input.textContent = PROMO_PAIN_LINE_1;
        showInputEnd(input);
      }
      if (through === 'think-1' || through === 'answer-1' || through === 'down' || through === 'typed-2' || through === 'think-2' || through === 'answer-2') {
        appendDullUser(log, PROMO_PAIN_LINE_1);
      }
      if (through === 'think-1') appendDullThink(log);
      if (through === 'answer-1' || through === 'down' || through === 'typed-2' || through === 'think-2' || through === 'answer-2') {
        appendDullBot(log, PROMO_PAIN_ANSWER_1, PROMO_PAIN_LINKS);
      }
      if (through === 'typed-2') {
        input.textContent = PROMO_PAIN_LINE_2;
        showInputEnd(input);
      }
      if (through === 'think-2' || through === 'answer-2') {
        appendDullUser(log, PROMO_PAIN_LINE_2);
      }
      if (through === 'think-2') appendDullThink(log);
      if (through === 'answer-2') {
        appendDullBot(log, PROMO_PAIN_ANSWER_2, null, PROMO_PAIN_ACTIONS);
      }

      scrollDullLog(log);
    }

    applyPainBeat(beat, instant) {
      const host = this.painHost();
      const board = host?.querySelector('.promo-moments__board');
      if (!host || !board) return;
      const scene = PROMO_PAIN_B.some(([name]) => name === beat) ? 'chat' : 'unattended';
      host.setAttribute('data-promo-pain-scene', scene);
      host.setAttribute('data-promo-pain-beat', beat);
      board.classList.toggle('is-instant', !!instant);
      if (PROMO_PAIN_LIFE_HOLD.includes(beat)) board.dataset.life = 'hold';
      else delete board.dataset.life;
      const browseSlot = beat === 'enter' || beat === 'open' || beat === 'back' || beat === 'hover-a' ? 0
        : beat === 'scroll-1' || beat === 'open-2' || beat === 'back-2' || beat === 'hover-b' ? 1
          : beat === 'scroll-2' ? 2
            : beat === 'scroll-3' ? 3
              : beat === 'scroll-4' ? 4
                : -1;
      const scrollSlot = browseSlot >= 0 ? browseSlot : beat === 'leave' ? 2 : -1;
      const scrollTarget = scrollSlot < 0 ? 0 : this.painBrowseScroll(scrollSlot);
      const scrollDelta = scene === 'unattended' ? this.setPainScroll(scrollTarget) : 0;
      if (instant && scene === 'unattended') board.offsetWidth;
      host.classList.remove('is-pain-dim');
      const opened = beat === 'open' ? this.painBrowseCard(0)
        : beat === 'open-2' ? this.painBrowseCard(1)
          : null;
      this.painCards().forEach((card) => {
        card.classList.remove('is-pain-add');
        const wasOpen = card.classList.contains('is-pain-open');
        card.classList.toggle('is-pain-open', card === opened);
        if (wasOpen && card !== opened && !instant) {   // stays on top while it shrinks back into the grid
          card.classList.add('is-pain-closing');
          window.setTimeout(() => card.classList.remove('is-pain-closing'), 900);
        }
        card.classList.toggle('is-pain-hover', browseSlot >= 0 && card === this.painBrowseCard(browseSlot));
      });
      const chat = this.root.querySelector('[data-promo-pain-chat]');
      const cursor = this.root.querySelector('[data-promo-pain-cursor]');
      const chatBeats = ['launcher', 'panel', 'typed-1', 'think-1', 'answer-1', 'down', 'typed-2', 'think-2', 'answer-2'];
      const chatOn = chatBeats.includes(beat);
      if (chat) {
        if (chatOn) chat.removeAttribute('hidden');
        else chat.setAttribute('hidden', '');
        chat.classList.toggle('is-open', chatOn && beat !== 'launcher');
      }
      if (cursor) {
        cursor.style.transitionDuration = instant ? '0ms' : '';
        if ((scene === 'chat' && beat !== 'launcher' && beat !== 'down') || beat === 'grid') {
          cursor.style.opacity = '0';
        }
      }
      this.root.classList.remove('is-pain-zoom');
      if (chatOn) this.lockPainChatBox();
      if (scene === 'unattended' && beat !== 'grid') {
        if (beat === 'leave') this.placePainCursorEdge();
        else if (browseSlot >= 0) this.placePainCursor(this.painBrowseCard(browseSlot), true, instant ? 0 : scrollDelta);
      }
      this.paintPainLog(beat);
      if (!instant && beat === 'panel') promoSfx('panel');
      if (!instant && beat === 'think-1') promoSfx('send');
      if (!instant && beat === 'answer-1') promoSfx('reply');
      if (!instant && (beat === 'open' || beat === 'open-2')) promoSfx('page');
    }

    whenPainRest(host) {
      return new Promise((resolve) => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            const stage = host?.closest('.promo-opening__stage') || host;
            const pending = (stage?.getAnimations({ subtree: true }) || []).filter((anim) => {
              if (anim.playState === 'finished' || anim.playState === 'idle') return false;
              const timing = anim.effect?.getComputedTiming?.();
              if (!timing || timing.iterations === Infinity || timing.duration === Infinity) return false;
              const duration = Number(timing.duration) || 0;
              const current = Number(anim.currentTime) || 0;
              return duration > 0 && current < duration - 16;
            });
            if (!pending.length) {
              resolve();
              return;
            }
            if (document.documentElement.classList.contains('is-promo-export')) {
              const remaining = Math.max(...pending.map((anim) => {
                const duration = Number(anim.effect?.getComputedTiming?.().duration) || 0;
                const current = Number(anim.currentTime) || 0;
                return Math.max(0, duration - current);
              }));
              waitMs(remaining + 32).then(() => resolve());
              return;
            }
            Promise.all(pending.map((anim) => anim.finished.catch(() => { }))).then(() => resolve());
          });
        });
      });
    }

    async playPainSteps(steps, scene) {
      const host = this.painHost();
      host?.setAttribute('data-promo-pain-scene', scene);
      for (const [beat, ms] of steps) {
        this.applyPainBeat(beat, prefersReducedMotion());
        if (beat === 'launcher' && !prefersReducedMotion()) {
          await this.aimCursorAtLauncher();
          continue;
        }
        if (beat === 'down' && !prefersReducedMotion()) {
          this.root.querySelector('[data-promo-thumb="down"]')?.classList.remove('is-down');
          await this.aimCursorAtThumbDown();
          continue;
        }
        if (prefersReducedMotion()) continue;
        if (beat === 'typed-1' || beat === 'typed-2') {
          const input = this.root.querySelector('[data-promo-pain-input]');
          const text = beat === 'typed-1' ? PROMO_PAIN_LINE_1 : PROMO_PAIN_LINE_2;
          if (input) {
            input.textContent = '';
            input.classList.add('is-live');
          }
          await typeOver(text, (slice) => {
            if (input) {
              input.textContent = slice;
              showInputEnd(input);
            }
          }, PROMO_PAIN_FAST_CHAR_MS, PROMO_PAIN_FAST_LINE_MS);
          input?.classList.remove('is-live');
          continue;
        }
        await Promise.all([
          this.whenPainRest(host),
          ms > 0 ? waitMs(ms) : Promise.resolve(),
        ]);
      }
      const hold = promoHoldMs();
      if (hold > 0 && !prefersReducedMotion()) await waitMs(hold);
    }

    seekPainLoop(ms) {
      const span = PROMO_SCALE_LOOP_MS;
      const t = ((ms % span) + span) % span;
      this.openPainStage();
      this.root.classList.add('is-pain-loop');
      const store = this.painStore();
      const cursor = this.root.querySelector('[data-promo-pain-cursor]');
      if (!store || !cursor) return;
      cursor.hidden = false;
      cursor.style.transition = 'none';
      store.style.transition = 'none';
      const point = (target) => this.painCursorPoint(target);
      const place = (x, y) => {
        cursor.style.setProperty('--pain-x', `${Math.round(x)}px`);
        cursor.style.setProperty('--pain-y', `${Math.round(y)}px`);
        cursor.style.opacity = '1';
      };
      const cards = this.painCards();
      const wander = [cards[0], cards[1], cards[2]].map(point).filter(Boolean);
      this.root.classList.remove('is-window-aim');
      if (t < 700 && wander.length) {
        this.applyPainBeat('grid', true);
        this.setPainScroll(0);
        const u = t / 700;
        const slot = u * (wander.length - 1);
        const from = wander[Math.floor(slot)];
        const to = wander[Math.min(wander.length - 1, Math.floor(slot) + 1)];
        const mix = slot - Math.floor(slot);
        place(from.x + (to.x - from.x) * mix, from.y + (to.y - from.y) * mix);
      } else if (t < 1100) {
        this.applyPainBeat('panel', true);
        const chat = this.root.querySelector('[data-promo-pain-chat]');
        const at = point(chat) || { x: store.clientWidth * 0.72, y: store.clientHeight * 0.7 };
        place(at.x, at.y);
      } else if (t < 1900) {
        this.applyPainBeat(t < 1500 ? 'answer-1' : 'answer-2', true);
        const chat = this.root.querySelector('[data-promo-pain-chat]');
        const at = point(chat) || { x: store.clientWidth * 0.72, y: store.clientHeight * 0.62 };
        place(at.x, at.y);
      } else {
        this.applyPainBeat('answer-2', true);
        const dot = store.querySelector('[data-promo-window-close]');
        const aim = point(dot) || { x: 32, y: 32 };
        const from = { x: store.clientWidth * 0.62, y: store.clientHeight * 0.7 };
        const u = Math.min(1, (t - 1900) / 500);
        place(from.x + (aim.x - from.x) * u, from.y + (aim.y - from.y) * u);
        if (t >= 2500) this.root.classList.add('is-window-aim');
      }
      const shaking = t >= 2500 && t < 2560;
      const kick = shaking ? Math.sin(((t - 2500) / 60) * Math.PI * 2) * 3 : 0;
      store.style.transform = `translate3d(${kick.toFixed(2)}px, calc(-0.4rem + ${(-kick * 0.35).toFixed(2)}px), 0)`;
    }

    async playPain() {
      if (this.painPlayed) return;
      this.painPlayed = true;
      this.startOpeningClock();
      this.openPainStage();
      if (prefersReducedMotion()) {
        glideLeadDevice = 'phone';
        this.glideLeadStamped = true;
        await this.playScaleScene();
        return;
      }
      const cursor = this.root.querySelector('[data-promo-pain-cursor]');
      if (cursor) {
        cursor.hidden = true;
        cursor.style.opacity = '0';
      }
      if (marketingPart() === 'full') window.__promoFilmT0 = performance.now();   // v21: the film clock (score anchors)
      const take = speakTake('t-pain');
      this.painTake = take;
      // v24 hook: no title card, no fade from white: frame 0 is the store, composed, with the
      // shopper's cursor already browsing it (same span as the old title, so no cue moves)
      await this.playStoreBrowseOpen(PROMO_WINDOW_IN_MS + PROMO_STORE_TITLE_IN_MS + PROMO_STORE_TITLE_HOLD_MS + Math.max(320, PROMO_STORE_TITLE_OUT_MS) + PROMO_PAIN_A[0][1]);
      await this.playPainSteps(PROMO_PAIN_A.slice(1), 'unattended');
      await take.at('Some get lost');
      await this.playPainSteps(PROMO_PAIN_A2, 'unattended');
      this.painLine = take.at('choose.', 'end', -300);   // v23b: STT "choose." ends 10.92 s; the .json's end runs ~0.36 s late
      this.painChatUsed = false;
      await this.playScaleScene();
    }

    painCursorPoint(target, store = this.painStore()) {
      if (!store || !target) return null;
      const local = this.painCursorLocal(target, store);
      if (local) return local;
      const storeBox = store.getBoundingClientRect();
      const box = target.getBoundingClientRect();
      const scale = storeBox.width / (store.offsetWidth || storeBox.width) || 1;
      return {
        x: (box.left + box.width / 2 - storeBox.left) / scale - PROMO_CURSOR_HOT_X,
        y: (box.top + box.height / 2 - storeBox.top) / scale - PROMO_CURSOR_HOT_Y,
      };
    }

    painCursorLocal(target, store) {
      if (!store.contains(target)) return null;
      let x = target.offsetWidth / 2 - PROMO_CURSOR_HOT_X;
      let y = target.offsetHeight / 2 - PROMO_CURSOR_HOT_Y;
      let node = target;
      while (node && node !== store) {
        x += node.offsetLeft;
        y += node.offsetTop;
        node = node.offsetParent;
      }
      return node === store ? { x, y } : null;
    }

    pinWindowCloseOrigin() {
      const store = this.painStore();
      const dot = store?.querySelector('[data-promo-window-close]');
      if (!store || !dot) return;
      const storeBox = store.getBoundingClientRect();
      const box = dot.getBoundingClientRect();
      store.style.setProperty('--window-close-x', `${box.left + box.width / 2 - storeBox.left}px`);
      store.style.setProperty('--window-close-y', `${box.top + box.height / 2 - storeBox.top}px`);
    }

    parkPainCursor() {
      const cursor = this.root.querySelector('[data-promo-pain-cursor]');
      const host = this.painHost();
      const store = this.painStore();
      if (!cursor || !host || !store || cursor.parentElement === host) return;
      const hostBox = host.getBoundingClientRect();
      const box = cursor.getBoundingClientRect();
      host.appendChild(cursor);
      cursor.style.transitionDuration = '0ms';
      cursor.style.setProperty('--pain-x', `${Math.round(box.left - hostBox.left - host.clientLeft)}px`);
      cursor.style.setProperty('--pain-y', `${Math.round(box.top - hostBox.top - host.clientTop)}px`);
      cursor.getBoundingClientRect();
      cursor.style.transitionDuration = '';
    }

    async dismissPainStage() {
      if (!this.root.classList.contains('is-pain')) return;
      const store = this.painStore();
      const cursor = this.root.querySelector('[data-promo-pain-cursor]');
      const dot = store?.querySelector('[data-promo-window-close]');
      if (!store || !cursor || !dot || prefersReducedMotion()) {
        this.root.classList.add('is-pain-out');
        if (!prefersReducedMotion()) await waitMs(PROMO_PAIN_EXIT_MS);
        this.releasePainStage();
        return;
      }
      cursor.hidden = false;
      cursor.style.transitionDuration = '0ms';
      cursor.style.setProperty('--pain-x', `${Math.round(store.clientWidth * 0.46)}px`);
      cursor.style.setProperty('--pain-y', `${Math.round(store.clientHeight * 0.62)}px`);
      cursor.style.opacity = '0';
      cursor.getBoundingClientRect();
      this.root.style.setProperty('--promo-pain-open', `${PROMO_WINDOW_AIM_MS}ms`);
      this.root.style.setProperty('--promo-window-leave', `${PROMO_WINDOW_LEAVE_MS}ms`);
      this.root.style.setProperty('--promo-window-close', `${PROMO_WINDOW_CLOSE_MS}ms`);
      cursor.style.transitionDuration = '';
      const aim = this.painCursorPoint(dot);
      cursor.style.setProperty('--pain-x', `${Math.round(aim.x)}px`);
      cursor.style.setProperty('--pain-y', `${Math.round(aim.y)}px`);
      cursor.style.opacity = '1';
      this.pinWindowCloseOrigin();
      this.root.classList.add('is-window-aim');
      await waitMs(PROMO_WINDOW_AIM_MS);
      this.pinWindowCloseOrigin();
      await waitMs(PROMO_WINDOW_HOLD_MS);
      this.root.classList.add('is-window-shut');
      window.setTimeout(() => {
        cursor.style.opacity = '0';
      }, Math.round(PROMO_WINDOW_CLOSE_MS * 0.62));
      await waitMs(PROMO_WINDOW_CLOSE_MS);
      store.style.visibility = 'hidden';
      this.releasePainStage();
    }

    prepareScaleScene() {
      this.scaleGeneration = (this.scaleGeneration || 0) + 1;
      this.root.style.setProperty('--promo-scale-fade', `${PROMO_SCALE_FADE_MS}ms`);
      this.root.style.setProperty('--promo-puff-flash', `${PROMO_CONVEYOR_FLASH_MS}ms`);
      this.root.style.setProperty('--promo-puff-ms', `${PROMO_CONVEYOR_PUFF_MS}ms`);
      this.root.style.setProperty('--promo-puff-burst', `${PROMO_CONVEYOR_BURST_MS}ms`);
      this.root.style.setProperty('--promo-travel-line', String(PROMO_CORRIDOR.travelLine));
      this.root.style.setProperty('--promo-ring', `${PROMO_CORRIDOR.ringMs}ms`);
      this.root.style.setProperty('--promo-perspective', `${PROMO_CORRIDOR.perspective}px`);
      this.root.style.setProperty('--promo-origin-y', `${PROMO_CORRIDOR.originY * 100}%`);
      this.ensureWall();
      this.captureConveyorStill();
    }

    resetScaleScene() {
      this.scaleGeneration = (this.scaleGeneration || 0) + 1;
      this.wallClock = 0;
      window.cancelAnimationFrame(this.conveyorFrame);
      window.clearTimeout(this.snapTimer);
      window.clearTimeout(this.thudTimer);
      window.clearTimeout(this.puffTimer);
      this.root.classList.remove(
        'is-scale',
        'is-scale-shrink',
        'is-scale-white',
        'is-scale-zero',
        'is-scale-still',
        'is-scale-out',
        'is-end-pain',
        'is-end-pitch',
        'is-pitch-belt',
        'is-corridor',
        'is-grid',
        'is-grid-locked',
        'snap',
        'thud',
        'puff',
        'click',
      );
      this.residue?.reset();
      this.residue = null;
      this.openingResidueAt = 0;
      this.glideLeadPoofed = false;
      this.gridPaletteCache = null;
      this.gridThudSent = false;
      const caption = this.root.querySelector('[data-promo-end-caption]');
      if (caption) caption.textContent = '';
      const scale = this.root.querySelector('[data-promo-scale]');
      if (scale) scale.hidden = true;
      const wall = this.root.querySelector('[data-promo-scale-wall]');
      if (wall) {
        wall.classList.remove('is-one');
        wall.style.transition = '';
        wall.style.removeProperty('--wall-n');
        wall.style.removeProperty('--wall-scale');
        delete wall.dataset.cameraLocked;
        wall.replaceChildren();
      }
      const center = this.root.querySelector('.promo-opening__center');
      if (center) {
        center.style.transition = '';
        center.style.opacity = '';
      }
    }

    revealScaleLayer() {
      const scale = this.root.querySelector('[data-promo-scale]');
      if (scale) scale.hidden = false;
      this.root.classList.add('is-scale', 'is-grid');
    }

    ensureWall() {
      const scale = this.root.querySelector('[data-promo-scale]');
      if (!scale) return null;
      let wall = scale.querySelector('[data-promo-scale-wall]');
      if (!wall) {
        wall = document.createElement('div');
        wall.className = 'promo-scale__wall';
        wall.setAttribute('data-promo-scale-wall', '');
        scale.prepend(wall);
      }
      let verdict = scale.querySelector('[data-promo-scale-verdict]');
      if (!verdict) {
        verdict = document.createElement('div');
        verdict.className = 'promo-scale__verdict';
        verdict.setAttribute('data-promo-scale-verdict', '');
        scale.append(verdict);
      }
      if (!verdict.querySelector('.promo-scale__end-hero')) {
        const hero = document.createElement('div');
        hero.className = 'promo-scale__end-hero';
        const zero = verdict.querySelector('.promo-scale__zero') || document.createElement('p');
        zero.className = 'promo-scale__zero';
        if (!zero.textContent) zero.textContent = '0';
        const mark = document.createElement('span');
        mark.className = 'promo-scale__mark';
        mark.setAttribute('data-promo-end-mark', '');
        const stamp = document.documentElement.getAttribute('data-promo-bizmis-stamp');
        if (stamp) {
          mark.style.webkitMaskImage = `url('${stamp}')`;
          mark.style.maskImage = `url('${stamp}')`;
        }
        hero.append(zero, mark);
        const caption = verdict.querySelector('.promo-scale__sold') || document.createElement('p');
        caption.className = 'promo-scale__sold';
        caption.setAttribute('data-promo-end-caption', '');
        if (!caption.textContent) caption.textContent = '';
        verdict.replaceChildren(hero, caption);
      }
      const hero = verdict.querySelector('.promo-scale__end-hero');
      // "Boost sales with [bizmis]": the words sit just before the mark.
      if (hero && !hero.querySelector('.promo-scale__lead')) {
        const lead = document.createElement('p');
        lead.className = 'promo-scale__lead';
        lead.textContent = 'Boost sales with';
        const markNode = hero.querySelector('[data-promo-end-mark]');
        if (markNode) hero.insertBefore(lead, markNode);
        else hero.appendChild(lead);
      }
      if (hero && !this.root.querySelector('[data-promo-end-mark]')) {
        const mark = document.createElement('span');
        mark.className = 'promo-scale__mark';
        mark.setAttribute('data-promo-end-mark', '');
        const stamp = document.documentElement.getAttribute('data-promo-bizmis-stamp');
        if (stamp) {
          mark.style.webkitMaskImage = `url('${stamp}')`;
          mark.style.maskImage = `url('${stamp}')`;
        }
        hero.append(mark);
      }
      scale.querySelector('[data-promo-residue]')?.remove();
      scale.querySelector('.promo-scale__world')?.setAttribute('hidden', '');
      scale.querySelector('.promo-scale__readout')?.setAttribute('hidden', '');
      return wall;
    }

    conveyorFrameWidth() {
      const canvas = this.root.querySelector('[data-promo-canvas]');
      return canvas?.clientWidth || this.root.querySelector('[data-promo-scale]')?.clientWidth || 1440;
    }

    conveyorSources() {
      const scale = this.root.querySelector('[data-promo-scale]');
      return {
        webm: scale?.getAttribute('data-promo-wall-webm') || '',
        mp4: scale?.getAttribute('data-promo-wall-mp4') || '',
      };
    }

    captureConveyorStill() {
      if (this.conveyorStill) return Promise.resolve(this.conveyorStill);
      if (this.conveyorStillTask) return this.conveyorStillTask;
      const { mp4 } = this.conveyorSources();
      if (!mp4) return Promise.resolve('');
      this.conveyorStillTask = new Promise((resolve) => {
        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';
        video.src = mp4;
        const finish = (still) => {
          this.conveyorStill = still || '';
          resolve(this.conveyorStill);
        };
        video.addEventListener('error', () => finish(''), { once: true });
        video.addEventListener('loadeddata', () => {
          const paint = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = video.videoWidth || 480;
              canvas.height = video.videoHeight || 300;
              canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
              finish(canvas.toDataURL('image/jpeg', 0.72));
            } catch {
              finish('');
            }
          };
          video.addEventListener('seeked', paint, { once: true });
          try {
            video.currentTime = Math.min(PROMO_CONVEYOR_STILL_MS, (video.duration || 3) * 0.4);
          } catch {
            paint();
          }
        }, { once: true });
      });
      return this.conveyorStillTask;
    }

    conveyorPicture(live) {
      if (!live && this.conveyorStill) {
        const img = document.createElement('img');
        img.alt = '';
        img.draggable = false;
        img.src = this.conveyorStill;
        return img;
      }
      const { webm, mp4 } = this.conveyorSources();
      const video = document.createElement('video');
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.preload = 'auto';
      video.loop = live;
      if (webm) {
        const source = document.createElement('source');
        source.src = webm;
        source.type = 'video/webm';
        video.append(source);
      }
      if (mp4) {
        const source = document.createElement('source');
        source.src = mp4;
        source.type = 'video/mp4';
        video.append(source);
      }
      if (live) {
        video.autoplay = true;
        video.play().catch(() => { });
      } else {
        video.addEventListener('loadeddata', () => {
          try { video.currentTime = PROMO_CONVEYOR_STILL_MS; } catch { /* first frame */ }
          video.pause();
        }, { once: true });
      }
      return video;
    }

    mountPuff(host, index, basisWidth) {
      if (host.querySelector('.promo-scale__burst')) return;
      const width = host.getBoundingClientRect().width || parseFloat(host.style.width) || basisWidth;
      const fit = Math.max(1, width / Math.max(1, basisWidth));
      host.style.setProperty('--puff-fit', fit.toFixed(3));
      const burst = document.createElement('span');
      burst.className = 'promo-scale__burst';
      const specks = 20 + Math.floor(wallSeededUnit(index, 5) * 11);
      for (let bit = 0; bit < specks; bit += 1) {
        const speck = document.createElement('i');
        speck.className = 'promo-scale__speck';
        const angle = wallSeededUnit(index, 20 + bit) * Math.PI * 2;
        const dist = (18 + wallSeededUnit(index, 80 + bit) * 56) * fit;
        speck.style.setProperty('--dx', `${(Math.cos(angle) * dist).toFixed(1)}px`);
        speck.style.setProperty('--dy', `${(Math.sin(angle) * dist).toFixed(1)}px`);
        burst.appendChild(speck);
      }
      host.append(burst);
    }

    mountPitchChrome(frame) {
      const cart = document.createElement('span');
      cart.className = 'promo-scale__cart';
      cart.textContent = '1';
      frame.append(cart);
    }

    captureNeutralStage() {
      const store = this.painStore();
      if (!store) return;
      const rect = store.getBoundingClientRect();
      const wide = Math.round(rect.width) || store.offsetWidth;
      const tall = Math.round(rect.height) || store.offsetHeight;
      if (wide < 40 || tall < 40) return;
      if (this.neutralStage && this.neutralStageWidth >= 40) return;
      const clone = store.cloneNode(true);
      clone.querySelectorAll('[data-promo-pain-chat], [data-promo-pain-cursor]').forEach((node) => node.remove());
      clone.removeAttribute('id');
      clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
      clone.classList.remove('is-belt-stage');
      clone.removeAttribute('style');
      this.neutralStage = clone;
      this.neutralStageWidth = wide;
      this.neutralStageHeight = tall;
    }

    mountPitchStage(frame, width) {
      frame.classList.add('is-neutral');
      if (!this.neutralStage || !this.neutralStageWidth) return;
      const height = Math.round(width / PROMO_CONVEYOR.aspect);
      const naturalW = this.neutralStageWidth;
      const naturalH = this.neutralStageHeight || Math.round(naturalW / PROMO_CONVEYOR.aspect);
      const scale = Math.min(width / naturalW, height / naturalH);
      const clone = this.neutralStage.cloneNode(true);
      clone.classList.add('is-belt-stage');
      clone.style.position = 'absolute';
      clone.style.width = `${naturalW}px`;
      clone.style.height = `${naturalH}px`;
      clone.style.maxWidth = 'none';
      clone.style.maxHeight = 'none';
      clone.style.transformOrigin = 'top left';
      clone.style.left = `${((width - naturalW * scale) / 2).toFixed(1)}px`;
      clone.style.top = `${((height - naturalH * scale) / 2).toFixed(1)}px`;
      clone.style.transform = `scale(${scale.toFixed(4)})`;
      frame.appendChild(clone);
    }

    // Sea-of-cards stills: whatever the pose laid out, fit it into the part
    // of the store the viewer can see. The safe area is the stage minus the
    // widget and the dull chatbot. Content is scaled and centered into it.
    // An axis where the content runs past the stage (a scrolling catalog)
    // keeps its bleed and is only fitted across the other axis.
    fitClip() {
      const store = this.root.querySelector('.promo-opening__store');
      const stage = store?.querySelector('.promo-opening__moments-stage');
      if (!store || !stage) return null;
      stage.style.scale = '';
      stage.style.translate = '';
      stage.style.clipPath = '';
      stage.style.transformOrigin = '';
      const box = stage.getBoundingClientRect();
      if (box.width < 40 || box.height < 40) return null;
      const area = box.width * box.height;
      const shown = (el) => (typeof el.checkVisibility === 'function'
        ? el.checkVisibility({ opacityProperty: true, visibilityProperty: true })
        : el.offsetParent !== null);
      let left = Infinity;
      let top = Infinity;
      let right = -Infinity;
      let bottom = -Infinity;
      // What actually paints: each box cut to the ancestors that clip it.
      const clipped = (el) => {
        const r = el.getBoundingClientRect();
        let l = r.left;
        let t = r.top;
        let rr = r.right;
        let bb = r.bottom;
        for (let node = el.parentElement; node && node !== stage; node = node.parentElement) {
          const cs = getComputedStyle(node);
          if (cs.overflowX === 'visible' && cs.overflowY === 'visible' && cs.clipPath === 'none') continue;
          const c = node.getBoundingClientRect();
          l = Math.max(l, c.left);
          t = Math.max(t, c.top);
          rr = Math.min(rr, c.right);
          bb = Math.min(bb, c.bottom);
        }
        return { left: l, top: t, right: rr, bottom: bb, width: rr - l, height: bb - t };
      };
      stage.querySelectorAll('*').forEach((el) => {
        const raw = el.getBoundingClientRect();
        if (raw.width < 3 || raw.height < 3 || raw.width * raw.height > area * 0.6) return;
        if (!shown(el)) return;
        const r = clipped(el);
        if (r.width < 3 || r.height < 3) return;
        left = Math.min(left, r.left);
        top = Math.min(top, r.top);
        right = Math.max(right, r.right);
        bottom = Math.max(bottom, r.bottom);
      });
      if (!Number.isFinite(left)) return null;
      // Stores scroll vertically, so only a vertical overflow is a bleed.
      const bleedX = false;
      const bleedY = top < box.top - 4 || bottom > box.bottom + 4;
      // Safe area: trim whichever side loses less to each obstacle.
      const gap = Math.round(box.width * 0.02) + 8;
      const safe = { left: box.left + gap, top: box.top + gap * 0.5, right: box.right - gap, bottom: box.bottom - gap };
      const obstacles = [
        document.querySelector('.bizmis-desktop-lite-chat, .bizmis-mobile-lite-chat, .bizmis-bar-row'),
        store.querySelector('.promo-pain__chat.is-open .promo-pain__panel'),
        store.querySelector('.promo-pain__chat:not(.is-open) .promo-pain__launcher'),
      ].filter((el) => el && shown(el));
      obstacles.forEach((el) => {
        const o = el.getBoundingClientRect();
        if (o.right <= safe.left || o.left >= safe.right || o.bottom <= safe.top || o.top >= safe.bottom) return;
        const cutRight = (safe.right - (o.left - gap)) * (safe.bottom - safe.top);
        const cutBottom = (safe.bottom - (o.top - gap)) * (safe.right - safe.left);
        if (cutRight <= cutBottom) safe.right = Math.min(safe.right, o.left - gap);
        else safe.bottom = Math.min(safe.bottom, o.top - gap);
      });
      const cw = Math.max(1, right - left);
      const ch = Math.max(1, bottom - top);
      const sw = Math.max(40, safe.right - safe.left);
      const sh = Math.max(40, safe.bottom - safe.top);
      let scale = Math.min(bleedX ? Infinity : sw / cw, bleedY ? Infinity : sh / ch, 1.3);
      if (!Number.isFinite(scale)) scale = 1;
      // Content position after scaling about the stage's top-left corner.
      const at = (x, y) => ({ x: box.left + (x - box.left) * scale, y: box.top + (y - box.top) * scale });
      const a = at(left, top);
      const b = at(right, bottom);
      const tx = bleedX ? 0 : (safe.left + safe.right) / 2 - (a.x + b.x) / 2;
      const ty = bleedY ? (safe.top - box.top) * 0 : (safe.top + safe.bottom) / 2 - (a.y + b.y) / 2;
      stage.style.transformOrigin = '0 0';
      stage.style.scale = scale.toFixed(4);
      stage.style.translate = `${tx.toFixed(1)}px ${ty.toFixed(1)}px`;
      return { scale, tx, ty, bleedX, bleedY };
    }

    showClip(overrides) {
      const fromUrl = readPromoClip();
      const fitStage = this.root.querySelector('.promo-opening__moments-stage');
      if (fitStage) {
        fitStage.style.scale = '';
        fitStage.style.translate = '';
      }
      const clip = {
        device: 'desktop',
        motion: 'scroll-up',
        chat: false,
        tone: 'pain',
        look: 'classic',
        ...(fromUrl || {}),
        ...(overrides || {}),
      };
      const motions = PROMO_CLIP_MOTIONS[clip.device] || PROMO_CLIP_MOTIONS.desktop;
      const moment = momentClipParts(clip.motion);
      if (!PROMO_CLIP_DEVICES.includes(clip.device)) clip.device = 'desktop';
      if (!moment && !motions.includes(clip.motion)) clip.motion = motions[0];
      if (!PROMO_STORE_LOOKS.includes(clip.look)) clip.look = 'classic';
      clip.tone = moment || clip.tone === 'pitch' ? 'pitch' : 'pain';
      clip.chat = !!clip.chat && !moment;

      if (new URLSearchParams(window.location.search).get('still') === '1') {
        document.documentElement.classList.add('is-promo-still');
      }
      document.documentElement.classList.remove('is-promo-pitch', 'is-clip-moment', 'is-promo-clerk', 'is-promo-live-card');
      this.root.classList.remove('is-pitch', 'is-moments', 'is-clip-moment', 'is-pitch-cards', 'is-clerk-corner', 'is-clerk-head', 'is-clerk-moving');
      const leakedEmbed = document.getElementById('bizmis-avatar-embed');
      if (leakedEmbed && !moment) leakedEmbed.style.visibility = 'hidden';

      document.documentElement.classList.add('is-promo-clip');
      document.getElementById('page-loader')?.setAttribute('hidden', '');
      this.root.classList.add('is-clip');
      PROMO_CLIP_DEVICES.forEach((id) => {
        const on = id === clip.device;
        this.root.classList.toggle(`is-clip-${id}`, on);
        document.documentElement.classList.toggle(`is-clip-${id}`, on);
      });
      PROMO_CLIP_MOTION_ALL.forEach((id) => this.root.classList.toggle(`is-motion-${id}`, id === clip.motion));
      PROMO_PITCH_MOMENTS.forEach((id) => this.root.classList.toggle(`is-motion-${id}`, id === clip.motion));
      PROMO_STORE_LOOKS.forEach((id) => this.root.classList.toggle(`is-look-${id}`, id === clip.look));
      this.root.classList.toggle('is-clerk-head', clip.device === 'phone' && clip.chat && !moment);
      this.root.classList.toggle('is-tone-pain', clip.tone === 'pain');
      this.root.classList.toggle('is-tone-pitch', clip.tone === 'pitch');
      this.root.classList.toggle('is-pain-loop', clip.tone === 'pain');
      this.root.classList.toggle('is-chat', clip.chat);
      document.documentElement.style.setProperty('--ad-warmth', clip.tone === 'pitch' ? '1' : '0');

      const priorStage = this.painStore()?.querySelector('.promo-opening__moments-stage');
      const priorBoard = priorStage?.querySelector('.promo-moments__board');
      priorBoard?.style.setProperty('--pain-scroll', '0px');
      priorStage?.style.setProperty('--pain-scroll', '0px');
      this.openPainStage();
      this.applyPainBeat(clip.chat && clip.tone === 'pain' ? 'answer-2' : 'grid', true);
      this.root.querySelectorAll('.promo-clip__product, .promo-clip__clerk, .promo-clip__act, .promo-clip__banner, [data-promo-clip]').forEach((node) => node.remove());
      this.painHost()?.querySelector('.promo-moments__board')?.removeAttribute('hidden');

      const chat = this.root.querySelector('[data-promo-pain-chat]');
      const cursor = this.root.querySelector('[data-promo-pain-cursor]');
      const wander = clip.device === 'desktop' && (clip.motion === 'wander-near' || clip.motion === 'wander-far');
      if (chat && !(clip.chat && clip.tone === 'pain')) {
        chat.setAttribute('hidden', '');
        chat.classList.remove('is-open');
      }
      if (cursor) {
        cursor.hidden = !wander;
        cursor.style.opacity = wander ? '1' : '0';
        cursor.style.transitionDuration = '0ms';
      }

      const store = this.painStore();
      if (moment) {
        this.showMomentClip(clip, moment);
        return;
      }
      const stage = store?.querySelector('.promo-opening__moments-stage');
      this.applyClipLook(stage, clip.look);
      this.root.classList.remove('is-clerk-corner', 'is-clerk-head');
      const widget = this.root.querySelector('[data-promo-widget]');
      if (widget) widget.style.visibility = 'hidden';
      if (clip.device === 'desktop') {
        if (store) store.style.visibility = '';
        if (clip.motion === 'product-read' || clip.motion === 'product-scroll' || clip.motion === 'compare' || clip.motion === 'back-bounce' || clip.motion === 'variant-doubt') {
          this.mountClipProduct(stage, clip);
        }
        this.mountClipBehavior(stage, clip);
        const board = stage?.querySelector('.promo-moments__board');
        if (board) layoutStoreGrid(board);
      } else if (store) {
        store.style.visibility = 'hidden';
        this.mountHandheldClip(clip);
      }
      this.poseStill(clip);
      this.root.dataset.clipDevice = clip.device;
      this.root.dataset.clipMotion = clip.motion;
      this.root.dataset.clipTone = clip.tone;
      this.root.dataset.clipChat = clip.chat ? '1' : '0';
      this.root.dataset.clipLook = clip.look;
      this.root.setAttribute('data-promo-clip-ready', '1');
    }

    showMomentClip(clip, moment) {
      document.documentElement.classList.add('is-promo-pitch', 'is-clip-moment', 'is-promo-clerk');
      document.documentElement.style.setProperty('--ad-warmth', '1');
      this.root.classList.add('is-pitch', 'is-moments', 'is-clip-moment');
      this.root.classList.remove('is-pain-loop', 'is-tone-pain');
      this.root.querySelector('[data-promo-clip]')?.remove();
      this.root.querySelectorAll('.promo-clip__clerk, .promo-grid__clerk').forEach((node) => node.remove());
      const store = this.painStore();
      if (store) {
        store.style.visibility = '';
        store.classList.remove('is-desktop', 'is-phone', 'is-tablet');
        store.classList.add(clip.device === 'phone' ? 'is-phone' : clip.device === 'tablet' ? 'is-tablet' : 'is-desktop');
      }
      const stage = this.momentStage();
      const board = stage?.querySelector('.promo-moments__board');
      if (board) {
        delete board.dataset.clayReady;
        delete board.dataset.gridLaid;
        board.dataset.catalogVariant = clip.motion || clip.look || 'classic';
      }
      promoWidget.applyStoreLook(this.bizmisLook());
      this.mountDeviceChrome(store, clip.device);
      if ((clip.device === 'phone' || clip.device === 'tablet') && !this.clipMobileWidget) {
        this.clipMobileWidget = true;
        store?.setAttribute('data-promo-widget-host', '');
        window.__promoMountWidget?.({ isMobile: true, viewportHostSelector: '[data-promo-widget-host]' });
      }
      const widget = this.root.querySelector('[data-promo-widget]');
      if (widget) widget.style.visibility = 'visible';
      this.parkWidget();
      this.clipClerkScale = clip.device === 'phone' ? 0.34 : clip.device === 'tablet' ? 0.46 : 0.72;
      if (stage) {
        const board = stage.querySelector('.promo-moments__board');
        if (board) board.dataset.storeLook = clip.look || 'classic';
        applyMomentPose(stage, moment.pose, { instant: false });
        applyMomentTake(stage.querySelector('.promo-moments__board'), moment.take);
        this.mountClipBehavior(stage, { motion: moment.scene, look: clip.look, take: moment.take });
        this.applyClipLook(stage, clip.look);
      }
      this.seatClipWidget();
      this.poseMomentWidget(clip);
      this.root.dataset.clipDevice = clip.device;
      this.root.dataset.clipMotion = clip.motion;
      this.root.dataset.clipTone = 'pitch';
      this.root.dataset.clipChat = '0';
      this.root.dataset.clipLook = clip.look || 'classic';
      this.root.setAttribute('data-promo-clip-ready', '1');
    }

    applyClipLook(stage, look) {
      const board = stage?.querySelector('.promo-moments__board');
      if (!board) return;
      board.dataset.storeLook = look || 'classic';
      board.querySelector('.promo-clip__banner')?.remove();
      stage.querySelector(':scope > .promo-clip__banner')?.remove();
      if (look === 'home-hero') {
        const banner = document.createElement('div');
        banner.className = 'promo-clip__banner';
        stage.appendChild(banner);
      }
      delete board.dataset.gridLaid;
      layoutStoreGrid(board);
    }

    mountClipBehavior(host, clip) {
      if (!host || !PROMO_PAIN_ACTS.includes(clip.motion) && !['search', 'variant', 'cart', 'upsell'].includes(clip.motion)) return;
      host.querySelector('.promo-clip__act')?.remove();
      const layer = document.createElement('div');
      layer.className = `promo-clip__act is-${clip.motion}${clip.take ? ` is-take-${clip.take}` : ''}`;
      if (clip.motion === 'search') return;
      if (clip.motion === 'search-empty') {
        layer.innerHTML = '<p class="promo-clip__empty">No matches</p>';
      } else if (clip.motion === 'filter-hop') {
        layer.innerHTML = '<div class="promo-clip__chips"><b>Light</b><b>Small</b><b>Stone</b><b>New</b></div>';
      } else if (clip.motion === 'variant-doubt' || clip.motion === 'variant') {
        layer.innerHTML = '<div class="promo-clip__sizes"><b>S</b><b>M</b><b>L</b></div>';
      } else if (clip.motion === 'cart-abandon' || clip.motion === 'cart') {
        layer.innerHTML = '<aside class="promo-clip__drawer"><i class="promo-clip__drawer-title"></i><div class="promo-clip__drawer-row"><span></span><i></i><i class="is-short"></i></div><div class="promo-clip__drawer-row"><span></span><i></i><i class="is-short"></i></div><b>Checkout</b></aside>';
      } else if (clip.motion === 'back-bounce') {
        layer.innerHTML = '<div class="promo-clip__back">Back</div>';
      } else if (clip.motion === 'upsell') {
        layer.innerHTML = '<div class="promo-clip__upsell"><i></i><span>Add the pair</span></div>';
      }
      host.appendChild(layer);
    }

    mountClipProduct(host, clip) {
      if (!host) return;
      const stage = document.createElement('div');
      stage.className = `promo-clip__product is-${clip.motion}`;
      const looks = gridAllLooks(clip.look);
      const scroller = document.createElement('div');
      scroller.className = 'promo-clip__scroll';
      const count = clip.motion === 'compare' ? 2 : 1;
      for (let index = 0; index < count; index += 1) {
        scroller.appendChild(this.clipHero(looks[index], true, clip.motion === 'product-scroll' && index === 0));
      }
      stage.appendChild(scroller);
      host.appendChild(stage);
    }

    clipHero(look, withCopy, withBlurb) {
      const card = document.createElement('div');
      card.className = 'promo-clip__hero';
      card.dataset.tint = look?.tint || 'stone';
      const img = document.createElement('img');
      img.alt = '';
      img.draggable = false;
      const src = claySrc(look);
      if (src) img.src = src;
      const frame = document.createElement('span');
      frame.className = 'promo-clip__frame';
      frame.appendChild(img);
      card.appendChild(frame);
      if (withCopy) {
        const copy = document.createElement('div');
        copy.className = 'promo-clip__copy';
        copy.innerHTML = '<i></i><i class="is-short"></i><i class="is-mid"></i>';
        card.appendChild(copy);
        if (withBlurb) {
          const blurb = document.createElement('div');
          blurb.className = 'promo-clip__blurb';
          blurb.innerHTML = '<i></i><i class="is-short"></i>';
          card.appendChild(blurb);
        }
        const buy = document.createElement('div');
        buy.className = 'promo-clip__buy';
        buy.innerHTML = '<p class="promo-clip__price"><span>$</span><i></i></p><b>Add</b>';
        card.appendChild(buy);
      }
      return card;
    }

    clipCard(look, lined) {
      const card = document.createElement('article');
      card.className = 'promo-clip__card';
      card.dataset.tint = look?.tint || 'stone';
      const img = document.createElement('img');
      img.alt = '';
      img.draggable = false;
      const src = claySrc(look);
      if (src) img.src = src;
      const frame = document.createElement('span');
      frame.className = 'promo-clip__frame';
      frame.appendChild(img);
      const price = document.createElement('p');
      price.className = 'promo-clip__price';
      price.innerHTML = '<span>$</span><i></i>';
      if (lined) {
        const copy = document.createElement('div');
        copy.className = 'promo-clip__copy';
        copy.innerHTML = '<i></i><i class="is-short"></i>';
        copy.appendChild(price);
        card.append(frame, copy);
      } else {
        card.append(frame, price);
      }
      return card;
    }

    poseStill(clip) {
      if (!document.documentElement.classList.contains('is-promo-still')) return;
      const board = this.painHost()?.querySelector('.promo-moments__board');
      const stage = board?.closest('.promo-opening__moments-stage');
      if (clip.motion !== 'scroll-down') {
        board?.style.setProperty('--pain-scroll', '0px');
        stage?.style.setProperty('--pain-scroll', '0px');
      }
      if (clip.motion === 'scroll-down') {
        const cols = Number.parseInt(board?.dataset.painCols || '', 10);
        if (board && stage && Number.isFinite(cols) && cols > 0) {
          board.style.setProperty('--pain-scroll', '0px');
          stage.style.setProperty('--pain-scroll', '0px');
          const nextRow = board.querySelectorAll('.promo-moments__card:not([hidden])')[cols];
          if (nextRow) {
            const delta = nextRow.getBoundingClientRect().top - stage.getBoundingClientRect().top;
            const scroll = `${(-delta).toFixed(1)}px`;
            board.style.setProperty('--pain-scroll', scroll);
            stage.style.setProperty('--pain-scroll', scroll);
          }
        }
        const screen = this.root.querySelector('.promo-clip__screen');
        const banner = screen?.querySelector(':scope > .promo-clip__banner');
        const track = screen?.querySelector(':scope > .promo-clip__track');
        if (clip.look === 'home-hero' && banner && track) {
          const shift = Math.round(banner.getBoundingClientRect().height + 16);
          banner.style.transform = `translateY(-${shift}px)`;
          track.style.transform = `translateY(-${shift}px)`;
        } else if (track && !this.root.querySelector('.promo-clip .promo-pain__chat.is-open')) {
          const card = this.root.querySelector('.promo-clip__card');
          const row = card?.getBoundingClientRect().height || 0;
          if (row > 20) track.style.transform = `translateY(-${Math.round(row)}px)`;
        }
      }
      this.settleHeroChat(clip);
    }

    settleHeroChat(clip) {
      if (clip.look !== 'home-hero' || clip.motion === 'scroll-down') return;
      const screen = this.root.querySelector('.promo-clip__screen');
      const banner = screen?.querySelector(':scope > .promo-clip__banner');
      const chat = screen?.querySelector('.promo-pain__chat.is-open');
      if (!screen || !banner || !chat) return;
      const top = banner.getBoundingClientRect().bottom - screen.getBoundingClientRect().top + 8;
      chat.style.top = `${Math.round(top)}px`;
      chat.style.height = 'auto';
      chat.style.bottom = '0px';
    }

    clipStatus(device) {
      const phone = device === 'phone';
      const status = document.createElement('div');
      status.className = 'promo-clip__status';
      status.dataset.device = device;
      const time = document.createElement('span');
      time.className = 'promo-clip__time';
      time.textContent = '9:41';
      const icons = document.createElement('span');
      icons.className = 'promo-clip__status-icons';
      icons.innerHTML = this.clipStatusIcons(device);
      if (phone) {
        const island = document.createElement('span');
        island.className = 'promo-clip__island';
        status.append(time, island, icons);
      } else {
        const date = document.createElement('span');
        date.className = 'promo-clip__date';
        date.textContent = 'Tue 29';
        status.append(time, date, icons);
      }
      return status;
    }

    clipStatusIcons(device) {
      const cellular = '<svg viewBox="0 0 15 11" aria-hidden="true"><rect x="0.4" y="7.2" width="2" height="3.2" rx="0.6"/><rect x="3.6" y="5" width="2" height="5.4" rx="0.6"/><rect x="6.8" y="2.6" width="2" height="7.8" rx="0.6"/><rect x="10" y="0.5" width="2" height="9.9" rx="0.6" opacity="0.28"/></svg>';
      const wifi = '<svg viewBox="0 0 15 11" aria-hidden="true"><path d="M1.2 4.2a8 8 0 0 1 12.6 0" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/><path d="M3.4 6.5a5 5 0 0 1 8.2 0" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/><circle cx="7.5" cy="9.2" r="0.95"/></svg>';
      const battery = '<svg viewBox="0 0 26 12" aria-hidden="true"><rect x="0.6" y="0.6" width="21.2" height="10.8" rx="3.1" fill="none" stroke="currentColor" stroke-width="1.1" opacity="0.55"/><rect x="2.1" y="2.1" width="14.2" height="7.8" rx="1.5"/><path d="M23.2 4c.7.35 1.15 1 1.15 2s-.45 1.65-1.15 2" fill="currentColor" opacity="0.45"/></svg>';
      return device === 'tablet' ? wifi + battery : cellular + wifi + battery;
    }

    mountDeviceChrome(store, device) {
      if (!store) return;
      store.querySelector(':scope > .promo-clip__status')?.remove();
      store.querySelector(':scope > .promo-clip__home')?.remove();
      if (device !== 'phone' && device !== 'tablet') return;
      store.prepend(this.clipStatus(device));
      const home = document.createElement('span');
      home.className = 'promo-clip__home';
      store.append(home);
    }

    clipStoreBar() {
      const bar = this.painStore()?.querySelector('.promo-opening__store-bar');
      if (!bar) return document.createElement('div');
      const clone = bar.cloneNode(true);
      clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
      return clone;
    }

    mountClipClerk(host) {
      const clerk = document.createElement('span');
      clerk.className = 'promo-clip__clerk';
      clerk.setAttribute('aria-hidden', 'true');
      host.appendChild(clerk);
    }

    mountHandheldClip(clip) {
      const frame = document.createElement('div');
      frame.className = `promo-clip is-${clip.device}`;
      frame.setAttribute('data-promo-clip', '');
      const bezel = document.createElement('div');
      bezel.className = 'promo-clip__bezel';
      const screen = document.createElement('div');
      screen.className = 'promo-clip__screen';
      const cols = clip.look === 'collection-dense' ? (clip.device === 'tablet' ? 5 : 4)
        : clip.look === 'lookbook' ? 2
          : clip.look === 'list' ? 1
            : clip.device === 'tablet' ? 3 : 2;
    const count = clip.look === 'list' ? 5 : clip.look === 'lookbook' ? 4 : cols * 4;
      const looks = gridAllLooks(clip.look).slice(0, count);
      const track = document.createElement('div');
      track.className = 'promo-clip__track';
      for (let copy = 0; copy < 2; copy += 1) {
        const sheet = document.createElement('div');
        sheet.className = `promo-clip__sheet is-look-${clip.look || 'classic'}`;
        sheet.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
        looks.forEach((look) => sheet.appendChild(this.clipCard(look, clip.look === 'list')));
        track.appendChild(sheet);
      }
      screen.appendChild(track);
      if (clip.look === 'home-hero') {
        const banner = document.createElement('div');
        banner.className = 'promo-clip__banner';
        screen.prepend(banner);
      }
      if (clip.motion === 'product-read' || clip.motion === 'product-scroll' || clip.motion === 'compare' || clip.motion === 'back-bounce' || clip.motion === 'variant-doubt') {
        this.mountClipProduct(screen, clip);
      }
      this.mountClipBehavior(screen, clip);
      if (clip.chat && clip.tone === 'pain') {
        const chat = this.root.querySelector('[data-promo-pain-chat]');
        if (chat) {
          const clone = chat.cloneNode(true);
          clone.removeAttribute('id');
          clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
          clone.removeAttribute('hidden');
          clone.classList.add('is-open');
          screen.appendChild(clone);
        }
      }
      const home = document.createElement('span');
      home.className = 'promo-clip__home';
      bezel.append(this.clipStatus(clip.device), this.clipStoreBar(), screen, home);
      frame.appendChild(bezel);
      this.root.appendChild(frame);
    }

    gridFrame() {
      const scale = this.root.querySelector('[data-promo-scale]');
      const rect = scale && !scale.hidden ? scale.getBoundingClientRect() : null;
      const width = Math.round(rect?.width || 0);
      const height = Math.round(rect?.height || 0);
      if (width >= 40 && height >= 40) return { width, height };
      const root = this.root.getBoundingClientRect();
      const rootW = Math.round(root.width || 0);
      const rootH = Math.round(root.height || 0);
      if (rootW >= 40 && rootH >= 40) return { width: rootW, height: rootH };
      return { width: 1440, height: 810 };
    }

    gridLeadNode(mode) {
      const store = this.painStore();
      if (!store) return null;
      const clone = store.cloneNode(true);
      if (mode === 'pitch') {
        clone.querySelectorAll('[data-promo-pain-chat], [data-promo-pain-cursor]').forEach((node) => node.remove());
      }
      clone.removeAttribute('id');
      clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
      clone.classList.remove('is-belt-stage');
      clone.removeAttribute('style');
      const rect = store.getBoundingClientRect();
      clone.dataset.naturalW = String(rect.width || store.offsetWidth || 0);
      clone.dataset.naturalH = String(rect.height || store.offsetHeight || 0);
      return clone;
    }

    gridPalette() {
      if (this.gridPaletteCache) return this.gridPaletteCache;
      const fontProbe = document.createElement('span');
      fontProbe.style.fontFamily = 'var(--font-heading)';
      this.root.appendChild(fontProbe);
      const font = getComputedStyle(fontProbe).fontFamily || 'sans-serif';
      fontProbe.remove();
      this.gridPaletteCache = {
        primary: gridCssColor(this.root, '--bizmis-primary', '#f9a353'),
        red: gridCssColor(this.root, '--ad-red', '#E5533D'),
        ink: gridCssColor(this.root, '--ad-ink', '#171717'),
        ink3: gridCssColor(this.root, '--ad-ink-3', '#969696'),
        surface: gridCssColor(this.root, '--ad-surface', '#F6F4F1'),
        font,
      };
      return this.gridPaletteCache;
    }

    glideProbe() {
      return this.glideStats || {
        coverage: false,
        nearCellWidth: 0,
        activeEvents: 0,
        phase: '',
        mode: '',
      };
    }

    ensureGlideFilter() {
      if (document.getElementById('promo-glide-blur')) return;
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('aria-hidden', 'true');
      svg.style.position = 'absolute';
      svg.style.width = '0';
      svg.style.height = '0';
      const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      filter.id = 'promo-glide-blur';
      filter.setAttribute('x', '-30%');
      filter.setAttribute('y', '-30%');
      filter.setAttribute('width', '160%');
      filter.setAttribute('height', '160%');
      const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
      blur.id = 'promo-glide-blur-node';
      blur.setAttribute('stdDeviation', '0 0');
      filter.append(blur);
      svg.append(filter);
      document.body.append(svg);
    }

    mountGlide(mode) {
      const wall = this.ensureWall();
      if (!wall) return null;
      this.ensureGlideFilter();
      const frame = this.gridFrame();
      const existing = wall.querySelector('[data-promo-glide]');
      if (existing && existing.dataset.mode === mode && existing.dataset.frameW === String(frame.width)) return existing;
      const store = this.painStore();
      const wallBox = wall.getBoundingClientRect();
      const storeBox = store?.getBoundingClientRect();
      wall.replaceChildren();
      const root = document.createElement('div');
      root.className = `promo-glide${mode === 'pitch' ? ' is-pitch' : ' is-pain'}`;
      root.setAttribute('data-promo-glide', '');
      root.dataset.mode = mode;
      root.dataset.frameW = String(frame.width);
      const streak = document.createElement('div');
      streak.className = 'promo-glide__streak';
      const level = document.createElement('div');
      level.className = 'promo-glide__level';
      const world = document.createElement('div');
      world.className = 'promo-glide__world';
      world.style.perspective = `${PROMO_GLIDE.perspective}px`;
      const tilt = document.createElement('div');
      tilt.className = 'promo-glide__tilt';
      tilt.style.transform = 'rotateX(0deg) rotateZ(0deg)';
      const sheet = document.createElement('div');
      sheet.className = 'promo-glide__sheet';
      const fxLayer = document.createElement('div');
      fxLayer.className = 'promo-glide__fx-layer';
      const pool = [];
      for (let index = 0; index < PROMO_GLIDE.pool; index += 1) {
        const cell = document.createElement('div');
        cell.className = 'promo-glide__cell promo-device';
        const still = document.createElement('canvas');
        still.className = 'promo-glide__still';
        const bloom = document.createElement('div');
        bloom.className = 'promo-glide__bloom';
        const rays = document.createElement('div');
        rays.className = 'promo-glide__rays';
        for (let ray = 0; ray < 8; ray += 1) {
          const spoke = document.createElement('i');
          spoke.style.setProperty('--ray', String(ray));
          spoke.style.setProperty('--ray-len', `${0.55 + (ray % 3) * 0.22}`);
          rays.append(spoke);
        }
        for (let bit = 0; bit < 10; bit += 1) {
          const spark = document.createElement('i');
          spark.className = 'promo-glide__spark';
          rays.append(spark);
        }
        const poof = buildPainPoof();
        const veil = document.createElement('div');
        veil.className = 'promo-glide__veil';
        const mark = document.createElement('span');
        mark.className = 'promo-glide__mark';
        fillSoldMark(mark);
        const lost = document.createElement('span');
        lost.className = 'promo-glide__lost-mark';
        fillLostMark(lost);
        const fx = document.createElement('div');
        fx.className = 'promo-glide__fx';
        fx.append(bloom, rays, poof);
        fx.hidden = true;
        cell.append(still, veil, mark, lost);
        sheet.append(cell);
        fxLayer.append(fx);
        pool.push({ cell, fx });
      }
      tilt.append(sheet);
      world.append(tilt);
      level.append(world);
      streak.append(level);
      const light = document.createElement('div');
      light.className = 'promo-glide__light';
      const dofMid = document.createElement('div');
      dofMid.className = 'promo-glide__dof promo-glide__dof-mid';
      const dofFar = document.createElement('div');
      dofFar.className = 'promo-glide__dof promo-glide__dof-far';
      const horizon = document.createElement('div');
      horizon.className = 'promo-glide__horizon';
      const field = document.createElement('div');
      field.className = 'promo-glide__field';
      field.setAttribute('data-promo-grid-field', '');
      const lead = document.createElement('div');
      lead.className = 'promo-glide__lead';
      const pitchRaster = mode === 'pitch' && this.pitchLeadKey && this.cellRasters?.has(this.pitchLeadKey);
      const clone = (mode === 'pain' && this.cellRasters?.size) || pitchRaster ? null : this.gridLeadNode(mode);
      if (clone) lead.append(clone);
      const viewWrap = document.createElement('div');
      viewWrap.className = 'promo-glide__view';
      viewWrap.append(streak, fxLayer);
      const caption = document.createElement('div');
      caption.className = 'promo-glide__caption';
      caption.setAttribute('data-promo-glide-caption', '');
      caption.hidden = mode !== 'pain';
      if (mode === 'pain') {
        const haze = document.createElement('div');
        haze.className = 'promo-glide__haze';
        const body = document.createElement('div');
        body.className = 'promo-glide__caption-body';
        const text = document.createElement('p');
        text.className = 'promo-glide__caption-text';
        let beat = 0;
        GLIDE_PAIN_CAPTION.forEach((line) => {
          const row = document.createElement('span');
          row.className = 'promo-glide__caption-line';
          line.forEach((part) => {
            const span = document.createElement('span');
            span.className = 'promo-glide__caption-beat';
            span.dataset.captionBeat = String(beat);
            span.textContent = part;
            beat += 1;
            row.append(span);
          });
          text.append(row);
        });
        body.append(text, buildPainPoof());
        caption.append(haze, body);   // v13: the claims are words only
      }
      root.append(viewWrap, light, dofMid, dofFar, horizon, caption, field, lead);
      root._glidePool = pool;
      wall.append(root);
      if (store && !this.glideKeepStore) store.style.visibility = 'hidden';
      const start = storeBox && storeBox.width > 40
        ? {
          x: storeBox.left - wallBox.left,
          y: storeBox.top - wallBox.top,
          w: storeBox.width,
          h: storeBox.height,
        }
        : null;
      this.glideLeadStart = start;
      this.glideLeadKey = (mode === 'pitch' && this.pitchLeadKey) || glideLeadCell(frame)?.key || '';
      this.glideZoomFrom = 0;
      this.glideZoomFromY = 0;
      this.glideAnchor = null;
      return root;
    }

    captureGlideClose(mode) {
      const frameBox = this.root.getBoundingClientRect();
      this.glideZoomFrom = 0;
      this.glideZoomFromY = 0;
      this.glideAnchor = null;
      const box = this.glideCloseBox(mode);
      if (!box || frameBox.width < 40 || box.width < 40) {
        this.glideCloseRect = null;
        return;
      }
      this.glideCloseRect = {
        cx: box.left - frameBox.left + box.width / 2,
        cy: box.top - frameBox.top + box.height / 2,
        w: box.width,
        h: box.height,
      };
    }

    glideCloseBox(mode) {
      const store = this.painStore();
      const storeBox = store?.getBoundingClientRect();
      const storeStyle = store ? getComputedStyle(store) : null;
      if (storeBox && storeBox.width > 40 && storeBox.height > 40 && storeStyle.visibility !== 'hidden' && Number(storeStyle.opacity) > 0.05) {
        return storeBox;
      }
      if (mode !== 'pitch') return storeBox || null;
      const stage = this.momentStage();
      const cards = [...(stage?.querySelectorAll('.promo-moments__card') || [])].filter((card) => {
        const box = card.getBoundingClientRect();
        const style = getComputedStyle(card);
        return box.width > 40 && style.visibility !== 'hidden' && Number(style.opacity) > 0.05;
      });
      if (!cards.length) return stage?.getBoundingClientRect() || null;
      const boxes = cards.map((card) => card.getBoundingClientRect());
      const left = Math.min(...boxes.map((box) => box.left));
      const top = Math.min(...boxes.map((box) => box.top));
      const right = Math.max(...boxes.map((box) => box.right));
      const bottom = Math.max(...boxes.map((box) => box.bottom));
      return { left, top, width: right - left, height: bottom - top };
    }

    paintLostLead(node, fx, cell, view) {
      const unit = view.span.unit;
      const width = cell.w * unit;
      const height = cell.h * unit;
      if (node.dataset.stamp !== `${cell.key}|lost`) {
        node.dataset.stamp = `${cell.key}|lost`;
        node.dataset.key = cell.key;
        node.classList.add('is-lost', 'is-desktop');
        node.classList.remove('is-dusting', 'is-tablet', 'is-phone');
        node.style.width = `${width.toFixed(2)}px`;
        node.style.height = `${height.toFixed(2)}px`;
        node.style.transform = `translate3d(${(cell.x * unit).toFixed(2)}px, ${(cell.y * unit).toFixed(2)}px, 0)`;
        applyMockupShape(node, cell.device, width);
        node.style.background = 'transparent';
        node.style.boxShadow = 'none';
        const parts = glideParts(node, fx);
        writeHidden(parts.still, true);
        writeHidden(parts.video, true);
        writePaint(parts.veil, 'opacity', '0');
        writePaint(parts.mark, 'opacity', '0');
        let lost = node.querySelector('.promo-glide__lost');
        if (!lost) {
          lost = document.createElement('div');
          lost.className = 'promo-glide__lost';
          lost.textContent = 'LOST';
          node.append(lost);
        }
        lost.style.fontSize = `${Math.max(64, width * 0.22).toFixed(0)}px`;
      }
      node.hidden = false;
      node.style.opacity = '1';
      if (fx) writeHidden(fx, true);
      this.root.querySelector('.promo-close__lost')?.setAttribute('hidden', '');
    }

    releaseGlideVideo(node) {
      const video = node?.querySelector('video.promo-glide__video');
      if (!video?.getAttribute('src')) return;
      video.pause();
      video.removeAttribute('src');
      video.load();
      delete video.dataset.clip;
      delete video.dataset.held;
      delete video.dataset.still;
    }

    paintGlideCell(node, fx, cell, mode, timeMs, view, live) {
      const frame = this.gridFrame();
      const parts = glideParts(node, fx);
      if (mode !== 'pitch' && this.glideLeadPoofed && cell.key === this.glideLeadKey) {
        this.paintLostLead(node, fx, cell, view);
        return true;
      }
      const event = glideEventAt(mode, frame, cell.key, timeMs);
      if (this.cellRasters?.has(cell.key) && node.dataset.rasterLead !== '1') {
        node.dataset.rasterLead = '1';
        delete node.dataset.stamp;
      }
      const stamp = `${cell.key}|${event ? Math.round(event.t) : ''}`;
      if (node.dataset.stamp !== stamp) {
        node.dataset.stamp = stamp;
        if (parts.mark) {
          delete parts.mark.dataset.settled;
          delete parts.mark.dataset.armed;
          const path = parts.mark.querySelector('path');
          if (path) {
            path.style.strokeDasharray = '';
            path.style.strokeDashoffset = '';
          }
        }
        const keepLeadLost = mode !== 'pitch' && (
          (this.glideLeadStamped && cell.key === this.glideLeadKey)
          || this.painLostKeys?.has(cell.key)
        );
        if (parts.lost && !keepLeadLost) delete parts.lost.dataset.settled;
        node.classList.remove('is-dusting');
        node.style.opacity = '';
        node.style.removeProperty('--card-left');
        const unit = view.span.unit;
        const tone = mode === 'pitch' ? 'pitch' : 'pain';
        const chat = glideChat(cell, mode, this.glideLeadKey);
        const motion = glideMotion(cell, mode);
        const look = glideLook(cell, mode);
        const clipKey = clipFileKey(tone, cell.id, motion, chat, look);
        node.dataset.key = cell.key;
        node.classList.toggle('is-desktop', cell.id === 'desktop');
        node.classList.toggle('is-tablet', cell.id === 'tablet');
        node.classList.toggle('is-phone', cell.id === 'phone');
        const width = cell.w * unit;
        const height = cell.h * unit;
        node.style.width = `${width.toFixed(2)}px`;
        node.style.height = `${height.toFixed(2)}px`;
        if (parts.lost) parts.lost.style.fontSize = lostMarkSize(width, height);
        if (parts.mark) parts.mark.style.fontSize = lostMarkSize(width, height);
        applyMockupShape(node, cell.device, width);
        const still = parts.still;
        const video = parts.video;
        const raster = this.cellRasters?.get(cell.key) || null;
        node.classList.toggle('is-raster-lead', !!raster);
        if (raster) paintLeadRaster(node, raster);
        else if (still) paintGlideStill(still, glideStillSrc(tone, cell.id, motion, chat, look), width, height, mode === 'pain');   // v25: the pain stays in its greys, buyers too
        if (still && raster) {
          still.hidden = true;
          still.style.visibility = 'hidden';
        }
        const wantVideo = false;
        if (video && wantVideo && video.dataset.clip !== clipKey) {
          video.style.opacity = '';
          delete video.dataset.held;
          delete video.dataset.still;
          video.dataset.clip = clipKey;
          video.src = clipSrc(tone, cell.id, motion, chat, look);
          const offset = wallSeededUnit(cell.row * 3 + cell.col, 19) * 1.4;
          const seek = () => {
            if (video.duration && offset < video.duration) video.currentTime = offset;
          };
          video.addEventListener('loadeddata', seek, { once: true });
          video.play().catch(() => { });
        }
      }
      const stillNode = parts.still;
      const videoNode = parts.video;
      if (!live) this.releaseGlideVideo(node);
      const showVideo = false;
      if (videoNode) {
        if (showVideo && videoNode.paused && videoNode.dataset.held !== '1') videoNode.play().catch(() => { });
        if (!showVideo && !videoNode.paused && videoNode.dataset.held !== '1') videoNode.pause();
        writeHidden(videoNode, !showVideo);
      }
      if (stillNode) writeHidden(stillNode, showVideo || this.cellRasters?.has(cell.key));
      node.hidden = false;
      const leadLost = mode !== 'pitch' && (
        (this.glideLeadStamped && cell.key === this.glideLeadKey)
        || this.painLostKeys?.has(cell.key)
      );
      if (!event && !leadLost) {
        if (node.classList.contains('is-sold-tint')) node.classList.remove('is-sold-tint');
        writePaint(parts.veil, 'opacity', '0');
        writePaint(parts.mark, 'opacity', '0');
        writePaint(parts.lost, 'opacity', '0');
        if (fx) writeHidden(fx, true);
        node.classList.remove('is-dusting');
        const stamping = mode !== 'pitch' && cell.key === this.glideLeadKey && this.glideLeadStampT;   // the close-up's own stamp is running
        paintGlideElevation(node, cell, view.span.unit, mode, null, stamping ? markReact(performance.now() - this.glideLeadStampT) : 0);
        return true;
      }
      const age = leadLost ? PROMO_CHECK_SETTLE_MS + 1000 : timeMs - event.t;
      if (event && !leadLost && age >= 0 && age < 600) {
        const id = `${mode}|${cell.key}|${Math.round(event.t)}`;
        this.sfxStamped = this.sfxStamped || new Set();
        if (!this.sfxStamped.has(id)) {
          this.sfxStamped.add(id);
          const box = node.getBoundingClientRect();
          const frameBox = this.root.getBoundingClientRect();
          const x = frameBox.width ? ((box.left + box.width / 2 - frameBox.left) / frameBox.width) : 0.5;
          promoSfx(mode === 'pitch' || event.sold ? 'sold-sea' : 'lost-sea', { x: Number(x.toFixed(3)) }, performance.now() - age);
        }
      }
      // The close-up phone was upright; press it into the floor gently so the
      // first sea frame does not jump.
      const pressAge = mode !== 'pitch' && cell.key === this.glideLeadKey
        ? Math.max(0, timeMs) * (140 / 900)
        : age;
      const buyer = mode !== 'pitch' && !!event?.sold && !leadLost;   // v24b: a pain buyer warms like a sold card
      if (node.classList.contains('is-sold-tint') !== buyer) node.classList.toggle('is-sold-tint', buyer);
      if (mode === 'pitch' || buyer) {
        paintGlideStamp(parts.veil, mode === 'pitch' ? parts.mark : null, age, 0.58);   // v24b: the warm SOLD tint (multiply, promo-ad.css); the card warms and lifts
        writePaint(parts.lost, 'opacity', '0');
        if (buyer) writePaint(parts.mark, 'opacity', '0');
      } else {
        if (parts.lost) {
          const width = Number.parseFloat(node.style.width) || cell.w * view.span.unit;
          const size = lostMarkSize(width, Number.parseFloat(node.style.height) || cell.h * view.span.unit);
          if (parts.lost.style.fontSize !== size) parts.lost.style.fontSize = size;
        }
        paintGlideStamp(parts.veil, parts.lost, age, 0.82);   // v24b: the pain-grey LOST tint (multiply, promo-ad.css); the card sinks
        writePaint(parts.mark, 'opacity', '0');
      }
      if (fx) writeHidden(fx, true);
      node.classList.remove('is-dusting');
      const reactAge = leadLost && cell.key === this.glideLeadKey && this.glideLeadStampT ? performance.now() - this.glideLeadStampT : age;
      paintGlideElevation(node, cell, view.span.unit, buyer ? 'pitch' : mode, pressAge, markReact(reactAge));
      return true;
    }

    salesBarExclude(mode) {
      if (mode === 'pitch') return null;
      const keys = new Set(this.painLostKeys || []);
      if (this.glideLeadKey) keys.add(this.glideLeadKey);
      if (this.painDesktopKey) keys.add(this.painDesktopKey);
      return keys;
    }

    mountSalesBar(root) {
      let bar = root.querySelector(':scope > .promo-salesbar');
      if (bar) return bar;
      bar = document.createElement('div');
      bar.className = 'promo-salesbar';
      bar.setAttribute('aria-hidden', 'true');
      const haze = document.createElement('div');
      haze.className = 'promo-salesbar__haze';   // the pitch caption's soft backdrop; the lane and the orange pass over it
      haze.style.opacity = '0';
      const track = document.createElement('div');
      track.className = 'promo-salesbar__track';   // v26: the white glass lane
      const label = document.createElement('span');
      label.className = 'promo-salesbar__label';
      label.textContent = 'Sales';
      const col = document.createElement('div');
      col.className = 'promo-salesbar__col';   // the bar
      const fill = document.createElement('div');
      fill.className = 'promo-salesbar__fill';   // its lighter top edge
      const labelOn = document.createElement('span');
      labelOn.className = 'promo-salesbar__label is-on';   // "Sales" in white where the bar covers it
      labelOn.textContent = 'Sales';
      col.append(fill, labelOn);
      const motes = document.createElement('canvas');
      motes.className = 'promo-salesbar__motes';   // the marks
      bar.append(haze, track, label, col, motes);
      bar._parts = { haze, track, label, col, fill, labelOn, motes };
      root._salesBarFired = new Set();
      const caption = root.querySelector(':scope > .promo-glide__caption');
      if (caption) caption.before(bar);
      else root.append(bar);
      return bar;
    }

    // The sales lane at sea time t: the lane, the bar (in the pitch it fills,
    // leaves the frame top, then widens into the orange field), "Sales", and
    // the marks flying into it, on one canvas.
    paintSalesBar(root, timeMs, mode, frame, reduced) {
      const bar = this.mountSalesBar(root);
      const p = bar._parts;
      if (reduced) {
        bar.hidden = true;
        return;
      }
      const B = PROMO_SALES_BAR;
      const data = salesBarFlights(mode, frame, this.salesBarExclude(mode));
      const g = data.geom;
      const m = data.times;
      const k = g.k;
      const fired = root._salesBarFired || (root._salesBarFired = new Set());
      const fire = (id, at, extra = {}, once = id) => {
        if (at == null || timeMs < at || fired.has(once)) return;
        fired.add(once);
        promoSfx(id, { mode, ...extra }, performance.now() - (timeMs - at));
      };
      const pitch = mode === 'pitch';
      if (pitch && timeMs >= m.widenEnd) {
        if (!bar.hidden) bar.hidden = true;
        fire('bar-widen-end', m.widenEnd);
        this.inkSoldCaption(bar, frame, 'all');
        return;
      }
      if (!pitch && timeMs >= m.outEnd) {
        if (!bar.hidden) bar.hidden = true;
        return;
      }
      bar.hidden = false;
      const enter = data.enter(timeMs);
      const widen = pitch ? salesEase((timeMs - m.widen) / B.widenMs) : 0;
      const out = pitch ? 0 : salesSmooth((timeMs - m.out) / B.painOutMs);
      bar.style.opacity = out ? (1 - out).toFixed(3) : '';
      bar.style.transform = out ? `translate3d(0, ${(out * out * g.H * 0.16).toFixed(2)}px, 0)` : '';
      const shown = enter * (1 - widen);
      // the lane: white glass, rounded top, bleeding off the bottom edge
      const laneTop = g.laneTop + (1 - enter) * B.inLift * g.H;
      p.track.style.cssText = `left:${g.x}px;top:${laneTop.toFixed(2)}px;width:${g.w}px;height:${(g.H - laneTop + g.R + 10).toFixed(2)}px;border-radius:${g.R.toFixed(2)}px;opacity:${shown.toFixed(3)};box-shadow:0 0 0 ${(1.1 * k).toFixed(2)}px rgba(59, 54, 50, 0.10), 0 ${(10 * k).toFixed(1)}px ${(30 * k).toFixed(1)}px rgba(30, 24, 18, 0.16)`;
      const labelCss = `width:${g.w}px;font-size:${g.labelPx.toFixed(2)}px;line-height:${g.labelPx.toFixed(2)}px;margin-top:${(-g.labelPx / 2).toFixed(2)}px;opacity:${shown.toFixed(3)}`;
      p.label.style.cssText = `left:${g.x}px;top:${g.labelY.toFixed(2)}px;${labelCss}`;
      // the bar: flat, rounded top, standing on the bottom edge
      const h = data.level(timeMs) * g.H;
      const topY = g.H - h;
      let left = g.x;
      let width = g.w;
      let top = topY;
      let height = h + g.R + 10;
      let radius = g.R;
      if (widen > 0) {
        left = g.x * (1 - widen);
        width = g.w + (g.W - g.w) * widen;
        top = Math.min(topY, -10);
        height = g.H + 20 - top - 10;
        radius = g.R * (1 - widen);
      }
      const hasBar = widen > 0 || h > 1;
      if (p.col.hidden === hasBar) p.col.hidden = !hasBar;
      if (hasBar) {
        const glow = pitch
          ? `0 ${(-4 * k).toFixed(1)}px ${(36 * k).toFixed(1)}px rgba(239, 138, 46, ${(0.36 * (1 - widen)).toFixed(3)})`
          : `0 ${(-4 * k).toFixed(1)}px ${(36 * k).toFixed(1)}px rgba(28, 24, 20, 0.12)`;
        p.col.style.cssText = `left:${left.toFixed(2)}px;top:${top.toFixed(2)}px;width:${width.toFixed(2)}px;height:${height.toFixed(2)}px;border-radius:${radius.toFixed(2)}px ${radius.toFixed(2)}px 0 0;background:${pitch ? '#F9A353' : '#BCB8B1'};box-shadow:${glow}`;
        p.fill.style.cssText = `height:${(26 * k).toFixed(1)}px;opacity:${((pitch ? 1 : 0.8) * (1 - widen)).toFixed(3)}`;
        p.labelOn.style.cssText = `left:${(g.x - left).toFixed(2)}px;top:${(g.labelY - top).toFixed(2)}px;${labelCss}`;
      }
      if (pitch) {
        let region = null;
        if (widen > 0) region = { L: left, R: left + width, T: -20, r: 0 };
        else if (h > 1) region = { L: g.x, R: g.x + g.w, T: topY, r: g.R };
        this.inkSoldCaption(bar, frame, region);
      }
      // the sounds the score lands on
      fire('bar-in', m.in, { ms: B.inMs });
      data.marks.forEach((mark) => {
        if (mark.hit) fire('mark-hit', mark.at + mark.dur, { index: mark.hitIndex, mark: mark.index }, `hit-${mark.index}`);
        else fire('mark-miss', mark.at + mark.dur * 0.78, { index: mark.missIndex, mark: mark.index }, `miss-${mark.index}`);
        if (mark.pile) fire('mark-floor', mark.pile.floorAt, { index: mark.missIndex, mark: mark.index }, `floor-${mark.index}`);   // a lost mark hits the floor
      });
      const firstHit = data.hitTimes[0];
      const lastHit = data.hitTimes[data.hitTimes.length - 1];
      fire('bar-fill', firstHit);
      if (pitch) {
        if (firstHit != null) fire('bar-stream', firstHit, { ms: Math.round(data.overflowAt - firstHit) });
        fire('bar-overflow', data.overflowAt);
        fire('bar-exit', m.exit, { ms: B.exitMs });
        fire('bar-widen', m.widen, { ms: B.widenMs });
      } else {
        data.hitTimes.forEach((at, index) => { if (index) fire('bar-drop', at, { index }, `drop-${index}`); });
        fire('bar-sliver', lastHit);
        fire('bar-out', m.out, { ms: B.painOutMs });
      }
      // the words stay on top and legible: marks passing behind them soften
      let words = null;
      const beats = pitch
        ? [...(this.soldCaption?.isConnected ? this.soldCaption.querySelectorAll('.promo-sold-caption__beat') : [])]
        : [...root.querySelectorAll(':scope > .promo-glide__caption .promo-glide__caption-beat')];
      const host = beats.length ? bar.getBoundingClientRect() : null;
      if (host && host.width > 4) {
        const kx = host.width / frame.width;
        const ky = host.height / frame.height;
        beats.forEach((beat) => {
          if ((Number.parseFloat(beat.style.opacity) || 0) < 0.05) return;
          const b = beat.getBoundingClientRect();
          if (b.width < 1) return;
          const x0 = (b.left - host.left) / kx;
          const x1 = (b.right - host.left) / kx;
          const y0 = (b.top - host.top) / ky;
          const y1 = (b.bottom - host.top) / ky;
          words = words
            ? { x0: Math.min(words.x0, x0), x1: Math.max(words.x1, x1), y0: Math.min(words.y0, y0), y1: Math.max(words.y1, y1) }
            : { x0, x1, y0, y1 };
        });
      }
      this.paintSalesMarks(p.motes, data, timeMs, frame, topY, 1 - widen, words);
    }

    // The pitch caption over the light sea is ink on a soft white haze; where
    // the orange is behind a word (the bar's rounded top, then the widening
    // field) it turns white; on the field it is white. region: null (all
    // ink), 'all' (all white) or { L, R, T, r } in frame px.
    inkSoldCaption(bar, frame, region) {
      const caption = this.soldCaption;
      const haze = bar._parts.haze;
      if (!caption || !caption.isConnected) {
        if (haze.style.opacity !== '0') haze.style.opacity = '0';
        return;
      }
      const ink = '#2b2520';   // --promo-ink
      const beats = caption._beats || (caption._beats = [...caption.querySelectorAll('.promo-sold-caption__beat')]);
      const clear = (beat) => {
        if (!beat.dataset.inked) return;
        ['background', '-webkit-background-clip', 'background-clip', '-webkit-text-fill-color'].forEach((prop) => beat.style.removeProperty(prop));
        delete beat.dataset.inked;
      };
      caption.style.setProperty('text-shadow', 'none', 'important');
      if (region === 'all') {
        caption.style.setProperty('color', '#fff', 'important');
        beats.forEach(clear);
        if (haze.style.opacity !== '0') haze.style.opacity = '0';
        return;
      }
      const host = bar.getBoundingClientRect();
      const kx = host.width / Math.max(1, frame.width);
      const ky = host.height / Math.max(1, frame.height);
      const box = caption.getBoundingClientRect();
      if (box.width > 4 && host.width > 4) {
        const w = box.width / kx;
        const h = box.height / ky;
        haze.style.left = `${((box.left - host.left) / kx - w * 0.32).toFixed(1)}px`;
        haze.style.top = `${((box.top - host.top) / ky - h * 0.75).toFixed(1)}px`;
        haze.style.width = `${(w * 1.64).toFixed(1)}px`;
        haze.style.height = `${(h * 2.5).toFixed(1)}px`;
      }
      const shownBeat = Math.max(0, ...beats.map((beat) => Number.parseFloat(beat.style.opacity) || 0));
      const captionFade = Number.parseFloat(caption.style.opacity || '1');
      haze.style.opacity = (shownBeat * (Number.isFinite(captionFade) ? captionFade : 1)).toFixed(3);
      caption.style.setProperty('color', ink, 'important');
      beats.forEach((beat) => {
        const b = beat.getBoundingClientRect();
        if (!region || b.width < 1 || host.width < 4) { clear(beat); return; }
        // the orange region in the beat's own px
        const sc = (beat.offsetWidth || b.width) / b.width;
        const L = (host.left + region.L * kx - b.left) * sc;
        const R = (host.left + region.R * kx - b.left) * sc;
        const T = (host.top + region.T * ky - b.top) * sc;
        const bw = b.width * sc;
        const bh = b.height * sc;
        if (R <= 0 || L >= bw || T >= bh) { clear(beat); return; }
        const r = Math.max(0, Math.min(region.r * kx * sc, (R - L) / 2));
        const tall = bh - T + 12;
        const rect = (x, y, w, hh) => `linear-gradient(#fff, #fff) ${x.toFixed(2)}px ${y.toFixed(2)}px / ${Math.max(0, w).toFixed(2)}px ${Math.max(0, hh).toFixed(2)}px no-repeat`;
        const layers = [];
        if (r > 0.5) {
          const dot = (cx) => `radial-gradient(circle closest-side, #fff calc(100% - 0.8px), rgba(255, 255, 255, 0) 100%) ${(cx - r).toFixed(2)}px ${T.toFixed(2)}px / ${(2 * r).toFixed(2)}px ${(2 * r).toFixed(2)}px no-repeat`;
          layers.push(rect(L + r, T, R - L - 2 * r, tall), rect(L, T + r, R - L, tall - r), dot(L + r), dot(R - r));
        } else {
          layers.push(rect(L, T, R - L, tall));
        }
        beat.dataset.inked = '1';
        beat.style.setProperty('background', `${layers.join(', ')}, linear-gradient(${ink}, ${ink})`, 'important');
        beat.style.setProperty('-webkit-background-clip', 'text', 'important');
        beat.style.setProperty('background-clip', 'text', 'important');
        beat.style.setProperty('-webkit-text-fill-color', 'transparent', 'important');
      });
    }

    // The marks on one canvas: chips and discs from sprites, the ✓'s landing
    // ring drawn live.
    paintSalesMarks(canvas, data, timeMs, frame, topY, fade, words = null) {
      const quad = document.documentElement.classList.contains('is-promo-export');
      const dpr = Math.min(2, Math.max(quad ? 2 : 1, window.devicePixelRatio || 1));
      const w = Math.round(frame.width * dpr);
      const h = Math.round(frame.height * dpr);
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const live = fade > 0.01
        ? data.marks.filter((mark) => timeMs >= mark.at && (mark.pile || timeMs <= mark.at + mark.dur + (mark.hit ? 240 : 1100)))
        : [];
      if (!live.length && canvas.dataset.clear === '1') return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);
      canvas.dataset.clear = live.length ? '0' : '1';
      if (!live.length) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = data.geom;
      const k = g.k;
      const pitch = data.mode === 'pitch';
      const half = SALES_MARK_HALF;
      live.forEach((mark) => {
        const pos = salesMarkAt(mark, timeMs, g, topY);
        let alpha = salesClamp((timeMs - mark.at) / 150) * fade;
        if (words) {   // behind the caption's words a mark softens to a ghost
          const dx = Math.max(words.x0 - pos.x, 0, pos.x - words.x1);
          const dy = Math.max(words.y0 - pos.y, 0, pos.y - words.y1);
          alpha *= 0.22 + 0.78 * salesSmooth(Math.hypot(dx, dy) / (34 * k));
        }
        let size = mark.s;
        let rot = 0;
        if (pos.phase === 'in') {
          // it lands: a soft ring blooms on the bar top and the mark sinks in
          const q = salesClamp((timeMs - mark.at - mark.dur) / 220);
          ctx.globalAlpha = (1 - q) * 0.5 * Math.min(1, alpha);
          ctx.strokeStyle = pitch ? '#EF8A2E' : '#9A978F';
          ctx.lineWidth = 2 * k;
          ctx.beginPath();
          ctx.ellipse(pos.x, pos.rim + 2 * k, (20 + 50 * q) * k, (6 + 10 * q) * k, 0, 0, Math.PI * 2);
          ctx.stroke();
          if (q >= 1) return;
          alpha *= 1 - q;
          size *= 1 - 0.6 * q;
        }
        if (pos.phase === 'pile') rot = pos.rot;
        if (pos.phase === 'miss') {
          alpha *= 1 - salesClamp((pos.fall - 0.35) / 0.65);
          rot = mark.side * pos.fall * 2.4;
        }
        if (alpha <= 0.01) return;
        const sprite = salesMarkSprite(mark.hit ? (pitch ? 'disc' : 'chip-v') : 'chip-x');
        const q = (k * size) / SALES_MARK_PX;
        ctx.globalAlpha = Math.min(1, alpha);
        ctx.save();
        ctx.translate(pos.x, pos.y);
        if (rot) ctx.rotate(rot);
        ctx.drawImage(sprite, -half * q, -half * q, half * 2 * q, half * 2 * q);
        ctx.restore();
      });
      ctx.globalAlpha = 1;
    }

    paintPainCaption(root, timeMs) {
      const caption = root.querySelector('[data-promo-glide-caption]');
      const text = caption?.querySelector('.promo-glide__caption-text');
      if (!caption || !text) return;
      const marks = glideMarks('pain');
      const haze = caption.querySelector('.promo-glide__haze');
      const poof = caption.querySelector('.promo-glide__poof');
      const show = timeMs >= marks.captionStart;
      caption.hidden = !show;
      if (!show) return;
      const exitSpan = Math.max(1, marks.captionPoofEnd - marks.captionHoldEnd);
      const exitU = timeMs <= marks.captionHoldEnd ? 0 : Math.min(1, (timeMs - marks.captionHoldEnd) / exitSpan);
      const exitFade = 1 - exitU;
      text.querySelectorAll('[data-caption-beat]').forEach((beat) => {
        const start = marks.captionStart + captionBeatOffset(Number(beat.dataset.captionBeat));
        if (timeMs >= start && beat.dataset.sfx !== '1') {
          beat.dataset.sfx = '1';
          promoSfx('climax-beat', { index: Number(beat.dataset.captionBeat) }, performance.now() - (timeMs - start));
        }
        const inU = Math.min(1, Math.max(0, (timeMs - start) / PROMO_GLIDE.captionInMs));
        const inEase = inU * inU * (3 - 2 * inU);
        beat.style.opacity = Math.max(0, inEase * exitFade).toFixed(3);
      });
      const tally = caption.querySelector('.promo-tally');
      if (tally) {
        const span = marks.captionPoofEnd - marks.captionStart;
        const ms = timeMs - marks.captionStart;
        paintCartTally(tally, 'lost', ms, span, exitFade, root.clientHeight || 1080);
        if (tally.dataset.wind !== '1') { tally.dataset.wind = '1'; promoSfx('lost-wind', { ms: span }, performance.now() - ms); }
      }
      const hazeIn = Math.min(1, Math.max(0, (timeMs - marks.captionStart) / PROMO_GLIDE.captionInMs));
      const hazeEase = hazeIn * hazeIn * (3 - 2 * hazeIn);
      if (haze) haze.style.opacity = Math.max(0, hazeEase * exitFade).toFixed(3);
      if (poof) poof.style.opacity = '0';
      if (timeMs >= marks.captionPoofEnd) caption.hidden = true;
    }

    paintGlideEnd(timeMs, mode) {
      const verdict = this.root.querySelector('[data-promo-scale-verdict]');
      const hero = verdict?.querySelector('.promo-scale__end-hero');
      const caption = verdict?.querySelector('.promo-scale__sold');
      if (!verdict || !hero) return;
      if (mode !== 'pitch') {
        verdict.style.opacity = '0';
        if (caption) caption.style.opacity = '0';
        this.root.classList.remove('is-end-pitch');
        this.root.classList.add('is-end-pain');
        return;
      }
      const endAt = glideMarks('pitch').claimAt;
      this.root.classList.add('is-end-pitch');
      this.root.classList.remove('is-end-pain');
      const streak = this.root.querySelector('.promo-glide__streak');
      if (timeMs < endAt) {
        verdict.style.opacity = '0';
        verdict.style.transform = '';
        if (caption) caption.style.opacity = '0';
        if (streak && streak.style.opacity !== '1') streak.style.opacity = '1';
        return;
      }
      if (!this.voAllDay) {
        this.voAllDay = true;
        promoSfx('boost');
      }
      const elapsed = timeMs - endAt;
      const settle = Math.min(1, elapsed / PROMO_GLIDE.resolveMs);
      const ease = 1 - (1 - settle) ** 3;
      const mark = verdict.querySelector('.promo-scale__mark');
      verdict.style.opacity = '1';
      if (streak && streak.style.opacity !== '1') streak.style.opacity = '1';
      if (mode === 'pitch') {
        verdict.style.opacity = '0';
        verdict.style.transformOrigin = 'center center';
        verdict.style.transform = 'none';
        if (mark) {
          mark.style.background = '#fff';
          mark.style.transform = 'none';
        }
        if (caption) {
          caption.textContent = '';
          caption.style.color = '#fff';
          caption.style.opacity = '1';
          caption.style.transform = 'none';
        }
        if (ease >= 1 && !this.gridThudSent) {
          this.gridThudSent = true;
          this.emitThud();
        }
      }
    }

    clipGlideOpen(root, arrive) {
      if (!root || !this.glideCloseRect || arrive >= 0.995) {
        if (root?.style.clipPath) root.style.clipPath = '';
        return;
      }
      const keep = 1 - arrive;
      const host = root.getBoundingClientRect();
      const frame = this.root.getBoundingClientRect();
      const close = this.glideCloseRect;
      const left = close.cx - close.w / 2 + frame.left;
      const top = close.cy - close.h / 2 + frame.top;
      const right = left + close.w;
      const bottom = top + close.h;
      const slack = 2 * keep;
      const insetTop = Math.max(0, (top - host.top) * keep - slack);
      const insetRight = Math.max(0, (host.right - right) * keep - slack);
      const insetBottom = Math.max(0, (host.bottom - bottom) * keep - slack);
      const insetLeft = Math.max(0, (left - host.left) * keep - slack);
      root.style.clipPath = `inset(${insetTop.toFixed(1)}px ${insetRight.toFixed(1)}px ${insetBottom.toFixed(1)}px ${insetLeft.toFixed(1)}px)`;
    }

    placeCloseStore(root) {
      const store = this.painStore();
      if (!store || !this.glideKeepStore || !this.glideCloseRect) return;
      this.root.classList.add('is-close-seat');
      const lead = [...(root?._glidePool || [])].find((item) => item.cell.dataset.key === this.glideLeadKey)?.cell;
      const box = lead && !lead.hidden ? lead.getBoundingClientRect() : null;
      if (!box || box.width < 8) return;
      if (!this.closeStoreLock) {
        this.closeStoreLock = { left: box.left, top: box.top, width: box.width };
        store.style.transform = 'none';
        return;
      }
      const lock = this.closeStoreLock;
      const scale = box.width / lock.width;
      const dx = box.left - lock.left;
      const dy = box.top - lock.top;
      store.style.transition = 'none';
      store.style.transformOrigin = '0 0';
      store.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${scale.toFixed(4)})`;
    }

    paintGlideAt(timeMs, mode, options = {}) {
      const root = this.mountGlide(mode);
      if (!root) return;
      const frame = this.gridFrame();
      const marks = glideMarks(mode);
      const time = options.reduced
        ? (mode === 'pain' ? marks.captionHoldEnd - 120 : PROMO_GLIDE.layDownMs + 1500)
        : timeMs;
      if (!options.reduced) salesBarFlights(mode, frame, this.salesBarExclude(mode));   // v24: plan the sales before the cells are painted
      const view = glideCells(time, frame, mode);
      const sheet = root.querySelector('.promo-glide__sheet');
      const streak = root.querySelector('.promo-glide__streak');
      const level = root.querySelector('.promo-glide__level');
      const lead = root.querySelector('.promo-glide__lead');
      const field = root.querySelector('.promo-glide__field');
      const cam = view.span.cam;
      if (sheet) {
        sheet.style.transform = `translate3d(${(frame.width / 2 - cam.x).toFixed(2)}px, ${(frame.height / 2 - cam.y).toFixed(2)}px, 0)`;
        if (sheet.style.opacity !== '1') sheet.style.opacity = '1';
        const wash = options.reduced ? 1 : glideWash(time, mode);
        const blur = Math.max(glideBlurPx(cam.speed), Math.round(wash * PROMO_GLIDE.washBlurPx * 2) / 2);
        const filter = blur ? `blur(${blur}px)` : '';
        if (sheet.style.filter !== filter) sheet.style.filter = filter;
      }
      const arrive = options.reduced ? 1 : glideArrive(time);
      const tiltNode = root.querySelector('.promo-glide__tilt');
      if (tiltNode) {
        const tilt = PROMO_GLIDE.tilt * arrive;
        view.visibleTilt = tilt;
        const yaw = PROMO_GLIDE.yaw * arrive;
        tiltNode.style.transform = `rotateX(${tilt.toFixed(2)}deg) rotateZ(${yaw.toFixed(2)}deg)`;
      }
      const viewWrap = root.querySelector('.promo-glide__view');
      const leadCell = view.cells.find((cell) => cell.key === this.glideLeadKey) || glideLeadCell(frame);
      let pull = { zoom: 1, dx: 0, dy: 0, ox: frame.width / 2, oy: frame.height * 0.62 };
      if (viewWrap && leadCell && arrive < 0.995) {
        const unit = view.span.unit;
        const faceW = Math.max(1, leadCell.w * unit);
        const faceH = Math.max(1, leadCell.h * unit);
        if (!this.glideZoomFrom) {
          const closeW = this.glideCloseRect?.w || faceW;
          const closeH = this.glideCloseRect?.h || faceH;
          const cover = Math.max(closeW / faceW, closeH / faceH);
          this.glideZoomFrom = cover;
          this.glideZoomFromY = cover;
          this.glideAnchor = null;
        }
        const pullU = 1 - arrive;
        const zoom = 1 + pullU * (this.glideZoomFrom - 1);
        const anchor = this.glideAnchor;
        const close = this.glideCloseRect;
        if (anchor) {
          const dx = close ? (close.cx - anchor.x) * pullU : 0;
          const dy = close ? (close.cy - anchor.y) * pullU : 0;
          pull = { zoom, dx, dy, ox: anchor.x, oy: anchor.y };
          viewWrap.style.transformOrigin = `${anchor.x.toFixed(1)}px ${anchor.y.toFixed(1)}px`;
          viewWrap.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) scale(${zoom.toFixed(4)})`;
        } else {
          viewWrap.style.transform = 'none';
        }
      } else if (viewWrap) {
        viewWrap.style.transform = '';
      }
      root._glidePull = pull;
      if (streak && level && (streak.style.filter || streak.style.transform)) {
        streak.style.transform = '';
        level.style.transform = '';
        streak.style.filter = '';
      }
      root.querySelectorAll('.promo-glide__dof, .promo-glide__light').forEach((layer) => {
        if (layer.style.visibility !== 'hidden') layer.style.visibility = 'hidden';
      });
      const fxLayer = root.querySelector('.promo-glide__fx-layer');
      if (fxLayer) fxLayer.style.visibility = arrive < 0.35 ? 'hidden' : '';
      const nearRow = Math.floor(view.span.maxY / view.pitch);
      const speed = cam.speed;
      const phase = glidePhase(time, mode);
      const liveOk = speed <= PROMO_GLIDE.liveMaxSpeed && (phase === 'glide' || phase === 'laydown');
      const pool = root._glidePool || [];
      const used = new Set();
      let shown = 0;
      const keyed = new Map();
      const free = [];
      pool.forEach((item) => {
        const key = item.cell.dataset.key;
        if (key) keyed.set(key, item);
        else free.push(item);
      });
      const pending = [];
      view.cells.forEach((cell) => {
        let slot = keyed.get(cell.key);
        if (!slot || used.has(slot)) {
          slot = free.find((item) => !used.has(item)) || pool.find((item) => !used.has(item));
        }
        if (!slot) return;
        used.add(slot);
        const near = liveOk && cell.row >= nearRow - (PROMO_GLIDE.liveRows - 1) && cell.row <= nearRow;
        pending.push({ slot, cell, near });
      });
      const liveSlots = new Set();
      if (liveOk) {
        pending.filter((item) => item.near)
          .sort((a, b) => b.cell.y - a.cell.y)
          .slice(0, GLIDE_LIVE_CAP)
          .forEach((item) => liveSlots.add(item.slot));
      }
      pending.forEach((item) => {
        const keep = this.paintGlideCell(item.slot.cell, item.slot.fx, item.cell, mode, time, view, liveSlots.has(item.slot));
        const slot = item.slot;
        if (!keep) {
          slot.cell.hidden = true;
          slot.fx.hidden = true;
          return;
        }
        // The sea grows out of the close-up: neighbours fade in as the camera
        // pulls back, nearest last-to-first outward, so there is no cut.
        if (item.cell.key !== this.glideLeadKey && time < PROMO_GLIDE_NEIGHBOR_IN_MS + 900) {
          const u = glideNeighborIn(item.cell, leadCell, time);
          slot.cell.style.opacity = u >= 1 ? '' : u.toFixed(3);
        } else if (item.cell.key !== this.glideLeadKey && slot.cell.style.opacity) {
          slot.cell.style.opacity = '';
        }
        const trackLead = this.glideKeepStore && arrive < 0.992 && item.cell.key === this.glideLeadKey;
        const leadFace = '.promo-glide__still, .promo-glide__video, .promo-glide__veil, .promo-glide__mark, .promo-glide__lost-mark';
        if (trackLead) {
          slot.cell.style.background = 'transparent';
          slot.cell.style.boxShadow = 'none';
          slot.cell.querySelectorAll(leadFace).forEach((node) => {
            node.style.visibility = 'hidden';
          });
        } else if (item.cell.key === this.glideLeadKey) {
          const covered = arrive < 0.98 && slot.cell.querySelector(':scope > .promo-opening__store');
          if (covered) {
            delete slot.cell.dataset.leadOpen;
          } else if (slot.cell.dataset.leadOpen !== '1') {
            slot.cell.dataset.leadOpen = '1';
            slot.cell.style.background = '';
            slot.cell.style.boxShadow = '';
            slot.cell.querySelectorAll(leadFace).forEach((node) => {
              if (node.style.visibility) node.style.visibility = '';
            });
          }
        }
        shown += 1;
      });
      if (this.glideKeepStore && arrive < 0.992) this.placeCloseStore(root);
      else if (this.glideKeepStore) this.releaseCloseStore();
      pool.forEach((slot) => {
        if (!used.has(slot)) {
          this.releaseGlideVideo(slot.cell);
          slot.cell.hidden = true;
          slot.fx.hidden = true;
        }
      });
      const leadNode = (root._glidePool || []).find((item) => item.cell.dataset.key === this.glideLeadKey)?.cell;
      this.measureGlideAnchor(root, leadNode);
      this.placeGlideLead(root, leadNode, arrive);
      if (mode === 'pain') this.paintPainCaption(root, options.reduced ? marks.captionHoldEnd - 120 : time);
      this.paintSalesBar(root, time, mode, frame, options.reduced);   // v24: the claims' sales bar
      const horizon = root.querySelector('.promo-glide__horizon');
      if (horizon && horizon.style.opacity !== '0') horizon.style.opacity = '0';
      const wash = options.reduced ? 1 : glideWash(time, mode);
      if (field) field.style.opacity = wash.toFixed(3);
      glideActiveTilt = glideTiltAt(time, mode) * Math.PI / 180;
      if (!options.reduced) this.paintGlideEnd(time, mode);
      if (wash >= 0.995) this.root.classList.add('is-wash-covered');
      const activeEvents = glideEvents(mode, frame).filter((event) => event.t <= time).length;
      this.glideStats = {
        coverage: glideCoverage(time, frame),
        nearCellWidth: Math.round(glideNearWidth(frame) * 10) / 10,
        activeEvents,
        shown,
        phase: options.reduced ? (mode === 'pain' ? 'caption' : 'glide') : glidePhase(time, mode),
        mode,
      };
    }

    measureGlideAnchor(root, leadNode) {
      if (this.glideAnchor || !leadNode || leadNode.hidden || !this.glideCloseRect) return;
      const box = leadNode.getBoundingClientRect();
      const host = this.root.getBoundingClientRect();
      if (box.width < 8 || box.height < 8) return;
      const originX = box.left - host.left + box.width / 2;
      const originY = box.top - host.top + box.height / 2;
      const cover = Math.max(this.glideCloseRect.w / box.width, this.glideCloseRect.h / box.height);
      this.glideZoomFrom = cover;
      this.glideZoomFromY = cover;
      this.glideAnchor = { x: originX, y: originY };
      const viewWrap = root.querySelector('.promo-glide__view');
      if (!viewWrap) return;
      const dx = this.glideCloseRect.cx - originX;
      const dy = this.glideCloseRect.cy - originY;
      viewWrap.style.transformOrigin = `${originX.toFixed(1)}px ${originY.toFixed(1)}px`;
      viewWrap.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) scale(${cover.toFixed(4)})`;
    }

    placeGlideLead(root, cellNode, arrive) {
      const lead = root.querySelector('.promo-glide__lead');
      const clone = root.querySelector('.promo-glide__cell > .promo-opening__store')
        || lead?.querySelector('.promo-opening__store');
      if (!clone) return;
      const fadeStart = 0.96;
      const fadeEnd = 0.99;
      if (!cellNode || cellNode.hidden || arrive >= fadeEnd) {
        clone.style.visibility = 'hidden';
        clone.style.opacity = '0';
        clone.style.boxShadow = '';
        cellNode?.classList.remove('is-lead-match');
        if (cellNode && this.glideLeadStamped) {
          cellNode.querySelectorAll(':scope > .promo-glide__veil, :scope > .promo-glide__lost-mark').forEach((node) => {
            node.style.visibility = 'visible';
          });
        }
        if (lead) lead.hidden = true;
        this.placeLeadShade(null, 0);
        return;
      }
      if (clone.parentElement !== cellNode) cellNode.appendChild(clone);
      const width = parseFloat(cellNode.style.width) || cellNode.offsetWidth;
      const height = parseFloat(cellNode.style.height) || cellNode.offsetHeight;
      const naturalW = Number(clone.dataset.naturalW) || width;
      const naturalH = Number(clone.dataset.naturalH) || height;
      const blend = arrive <= fadeStart ? 1 : 1 - (arrive - fadeStart) / (fadeEnd - fadeStart);
      clone.style.visibility = 'visible';
      clone.style.opacity = blend.toFixed(3);
      clone.style.zIndex = '2';
      clone.style.width = `${naturalW.toFixed(1)}px`;
      clone.style.height = `${naturalH.toFixed(1)}px`;
      clone.style.transform = `scale(${(width / naturalW).toFixed(4)}, ${(height / naturalH).toFixed(4)})`;
      clone.style.boxShadow = 'none';
      {
        // v10: the close-up keeps its own device corners inside the sea cell
        // (a CSS reset squared them for a few frames: the "border that doesn't fit")
        const leadDeviceId = cellNode.classList.contains('is-phone') ? 'phone' : cellNode.classList.contains('is-tablet') ? 'tablet' : 'desktop';
        const leadDevice = PROMO_GRID.devices.find((item) => item.id === leadDeviceId) || PROMO_GRID.devices[0];
        clone.style.borderRadius = `${gridMockupRadius(leadDevice, naturalW).toFixed(2)}px`;
        clone.style.overflow = 'hidden';
      }
      const matched = blend > 0.98;
      const wasMatched = cellNode.classList.contains('is-lead-match');
      cellNode.classList.toggle('is-lead-match', matched);
      if (matched) {
        cellNode.style.border = 'none';
        cellNode.style.boxShadow = 'none';
        cellNode.style.background = 'transparent';
        cellNode.style.clipPath = 'none';
        const deviceId = cellNode.classList.contains('is-phone')
          ? 'phone'
          : cellNode.classList.contains('is-tablet') ? 'tablet' : 'desktop';
        const device = PROMO_GRID.devices.find((item) => item.id === deviceId) || PROMO_GRID.devices[0];
        const curve = gridMockupRadius(device, naturalW) * (width / Math.max(1, naturalW));
        cellNode.style.borderRadius = `${curve.toFixed(2)}px`;   // v10: its glass edge follows the device corners (was a square line)
        cellNode.querySelectorAll(':scope > .promo-glide__veil').forEach((veil) => {
          veil.style.borderRadius = `${curve.toFixed(2)}px`;
        });
      } else if (wasMatched) {
        cellNode.style.border = '';
        cellNode.style.boxShadow = '';
        cellNode.style.background = '';
        cellNode.querySelectorAll(':scope > .promo-glide__veil').forEach((veil) => {
          veil.style.borderRadius = '';
        });
        const deviceId = cellNode.classList.contains('is-phone')
          ? 'phone'
          : cellNode.classList.contains('is-tablet') ? 'tablet' : 'desktop';
        const device = PROMO_GRID.devices.find((item) => item.id === deviceId) || PROMO_GRID.devices[0];
        applyMockupShape(cellNode, device, width);
      }
      cellNode.querySelectorAll(':scope > .promo-glide__still, :scope > .promo-glide__video, :scope > .promo-glide__mark').forEach((node) => {
        if (node.classList.contains('promo-glide__still')) {
          const showStill = blend < 0.04;
          node.style.visibility = showStill ? '' : 'hidden';
          node.style.opacity = showStill ? '1' : '0';
          return;
        }
        node.style.visibility = 'hidden';
      });
      cellNode.querySelectorAll(':scope > .promo-glide__veil, :scope > .promo-glide__lost-mark').forEach((node) => {
        // The clone carries its own veil and LOST; the cell's take over only
        // once the clone has mostly faded, or they stack into a grey slab.
        if (!this.glideLeadStamped || blend > 0.5) {
          node.style.visibility = 'hidden';
          return;
        }
        node.style.visibility = 'visible';
        node.style.zIndex = node.classList.contains('promo-glide__lost-mark') ? '7' : '6';
      });
      if (lead) lead.hidden = true;
      this.placeLeadShade(clone, blend);
    }

    placeLeadShade(clone, blend) {
      const host = this.root.querySelector('[data-promo-scale]');
      if (!host) return;
      let shade = host.querySelector(':scope > .promo-glide__shade');
      if (!clone || blend <= 0) {
        if (shade) shade.hidden = true;
        return;
      }
      if (!shade) {
        shade = document.createElement('div');
        shade.className = 'promo-glide__shade';
        host.append(shade);
      }
      const hostBox = host.getBoundingClientRect();
      const box = clone.getBoundingClientRect();
      shade.hidden = false;
      shade.style.opacity = blend.toFixed(3);
      shade.style.left = `${(box.left - hostBox.left).toFixed(2)}px`;
      shade.style.top = `${(box.top - hostBox.top).toFixed(2)}px`;
      shade.style.width = `${box.width.toFixed(2)}px`;
      shade.style.height = `${box.height.toFixed(2)}px`;
    }

    releaseCloseStore() {
      const store = this.painStore();
      if (store) {
        store.style.visibility = 'hidden';
        store.style.transform = '';
      }
      this.root.classList.remove('is-close-seat');
    }

    runGlide(mode, offsetMs = 0) {
      window.cancelAnimationFrame(this.planeFrame);
      glideEvents(mode, this.gridFrame());
      const start = performance.now() - offsetMs;
      const step = (now) => {
        const elapsed = now - start;
        try {
          this.paintGlideAt(elapsed, mode);
        } catch (error) {
          console.error(error);
        }
        if (elapsed < glidePlayEnd(mode)) this.planeFrame = window.requestAnimationFrame(step);
      };
      this.planeFrame = window.requestAnimationFrame(step);
    }

    whenGlideMediaReady() {
      const videos = [...this.root.querySelectorAll('.promo-glide__cell:not([hidden]) video.promo-glide__video')];
      const pending = videos.filter((video) => video.getAttribute('src') && video.readyState < 2);
      if (!pending.length) return Promise.resolve();
      return Promise.race([
        Promise.all(pending.map((video) => new Promise((resolve) => {
          const done = () => resolve();
          video.addEventListener('loadeddata', done, { once: true });
          video.addEventListener('error', done, { once: true });
        }))),
        waitMs(2500),
      ]);
    }

    clearGridResolve() {
      const verdict = this.root.querySelector('[data-promo-scale-verdict]');
      const hero = verdict?.querySelector('.promo-scale__end-hero');
      const zero = verdict?.querySelector('.promo-scale__zero');
      const mark = verdict?.querySelector('.promo-scale__mark');
      const caption = verdict?.querySelector('.promo-scale__sold');
      [verdict, hero, zero, mark, caption].forEach((node) => {
        if (!node) return;
        node.style.opacity = '';
        node.style.transform = '';
        node.style.color = '';
        node.style.background = '';
      });
    }

    puffPainStore() {
      const store = this.painStore();
      if (!store) return;
      store.style.transform = '';
      store.style.transition = 'none';
      let host = store.parentElement;
      if (!host?.classList.contains('promo-puff__host')) {
        host = document.createElement('div');
        host.className = 'promo-puff__host';
        store.parentElement.insertBefore(host, store);
        host.appendChild(store);
      }
      store.classList.add('promo-puff__body');
      this.openingResidueAt = performance.now();
      this.mountPuff(host, 0, this.conveyorFrameWidth() * PROMO_CONVEYOR_SIZE_START);
      host.classList.remove('is-puff');
      void host.offsetWidth;
      host.classList.add('is-puff');
      this.emitPuff();
    }

    emitSnap() {
      const root = this.root;
      window.clearTimeout(this.snapTimer);
      root.classList.remove('snap');
      void root.offsetWidth;
      root.classList.add('snap');
      this.snapTimer = window.setTimeout(() => {
        root.classList.remove('snap');
      }, PROMO_SCALE_SNAP_CLASS_MS);
      this.painTimers = this.painTimers || [];
      this.painTimers.push(this.snapTimer);
    }

    emitClick() {
      promoSfx('click');
      const root = this.root;
      window.clearTimeout(this.clickTimer);
      root.classList.remove('click');
      void root.offsetWidth;
      root.classList.add('click');
      this.clickTimer = window.setTimeout(() => {
        root.classList.remove('click');
      }, PROMO_SCALE_SNAP_CLASS_MS);
      this.momentTimers = this.momentTimers || [];
      this.momentTimers.push(this.clickTimer);
    }

    emitPuff() {
      const root = this.root;
      window.clearTimeout(this.puffTimer);
      root.classList.remove('puff');
      void root.offsetWidth;
      root.classList.add('puff');
      this.puffTimer = window.setTimeout(() => {
        root.classList.remove('puff');
      }, PROMO_SCALE_SNAP_CLASS_MS);
      this.painTimers = this.painTimers || [];
      this.painTimers.push(this.puffTimer);
    }

    emitThud() {
      const root = this.root;
      window.clearTimeout(this.thudTimer);
      root.classList.remove('thud');
      void root.offsetWidth;
      root.classList.add('thud');
      this.thudTimer = window.setTimeout(() => {
        root.classList.remove('thud');
      }, PROMO_SCALE_SNAP_CLASS_MS);
      this.painTimers = this.painTimers || [];
      this.painTimers.push(this.thudTimer);
    }

    armScaleTimer(fn, ms) {
      const timer = window.setTimeout(fn, ms);
      this.painTimers = this.painTimers || [];
      this.painTimers.push(timer);
      return timer;
    }

    hideScaleStore() {
      const store = this.painStore();
      const host = store?.parentElement?.classList.contains('promo-puff__host') ? store.parentElement : store;
      if (host) host.style.visibility = 'hidden';
      const cursor = this.root.querySelector('[data-promo-pain-cursor]');
      if (cursor) cursor.style.opacity = '0';
    }

    // The two lost moments side by side while the narrator says what a
    // salesperson in a physical store would have done.
    async playLostRecap(take) {
      const canvas = this.root.querySelector('[data-promo-canvas]') || this.root;
      const keys = [this.painDesktopKey, this.glideLeadKey].filter((key) => key && this.cellRasters?.has(key));
      const recap = document.createElement('div');
      recap.className = 'promo-recap';
      keys.forEach((key, index) => {
        const card = document.createElement('figure');
        card.className = `promo-recap__card ${index === 0 ? 'is-desktop' : 'is-phone'}`;
        // the rasters are live SVG nodes used by the sea: show a copy
        const img = this.cellRasters.get(key).cloneNode(true);
        const box = (img.getAttribute('viewBox') || '0 0 16 10').split(/\s+/).map(Number);
        card.style.aspectRatio = `${box[2]} / ${box[3]}`;
        img.removeAttribute('class');
        img.setAttribute('width', '100%');
        img.setAttribute('height', '100%');
        const veil = document.createElement('span');
        veil.className = 'promo-recap__veil';
        const lost = document.createElement('span');
        lost.className = 'promo-recap__lost';
        lost.textContent = 'LOST';
        const sold = document.createElement('span');
        sold.className = 'promo-recap__sold';
        sold.textContent = 'SOLD';
        // what a good salesperson on the floor would have said
        const bubble = document.createElement('span');
        bubble.className = 'promo-recap__bubble';
        // the line comes from a person on the shop floor, not from the UI
        bubble.innerHTML = `<span class="promo-recap__person" aria-hidden="true"><svg viewBox="0 0 40 40"><circle cx="20" cy="15" r="7.2"/><path d="M6.5 37c1.6-8.2 7-12.6 13.5-12.6S31.9 28.8 33.5 37z"/><path class="promo-recap__tag" d="M23.5 29.5h5.5v3.6h-5.5z"/></svg></span><span>${PROMO_RECAP_BUBBLES[index] || ''}</span>`;
        card.append(img, veil, lost, sold, bubble);
        recap.appendChild(card);
      });
      canvas.appendChild(recap);
      recap.getBoundingClientRect();
      recap.classList.add('is-in');
      promoSfx('recap');
      const cards = [...recap.querySelectorAll('.promo-recap__card')];
      take.at('catches these').then(async () => {
        for (const [index, card] of cards.entries()) {
          if (index) await waitMs(PROMO_RECAP_STAGGER_MS);
          card.classList.add('is-helped');
          promoSfx('recap-bubble', { index });
        }
      });
      take.at('into sales').then(async () => {
        for (const [index, card] of cards.entries()) {
          if (index) await waitMs(PROMO_RECAP_STAGGER_MS);
          card.classList.add('is-sold');
          promoSfx('recap-sold', { index });
        }
      });
      // "So we built it!": the toggle takes over while the cards fade
      await take.at('So we built');
      recap.classList.add('is-out');
      window.setTimeout(() => recap.remove(), 500);
    }

    // "Visits become sales. / Every day. / And counting." over the SOLD sea,
    // the pain's own caption turned around.
    async playSoldCaption(claimAt, take = null, exitBy = null) {
      const calledAt = performance.now();
      const canvas = this.root.querySelector('[data-promo-canvas]') || this.root;
      const caption = document.createElement('p');
      caption.className = 'promo-sold-caption';
      this.soldCaption = caption;   // v24: the sales bar inks it while the sea behind is light
      const beats = [];
      GLIDE_SOLD_CAPTION.forEach((line) => {
        const row = document.createElement('span');
        row.className = 'promo-sold-caption__line';
        line.forEach((part) => {
          const beat = document.createElement('span');
          beat.className = 'promo-sold-caption__beat';
          beat.textContent = part;
          row.append(beat);
          beats.push(beat);
        });
        caption.append(row);
      });
      canvas.appendChild(caption);
      // v13: the claims are words only (no chart)
      const start = Math.max(1200, claimAt - 4400);
      // v11b: the words land as the narrator says them ("visits", "sales."),
      // then "Every day." and "And counting." at the pain claim's own cadence;
      // each fades in stepped (export-safe), like the LOST claim
      let leaving = false;
      const show = (index) => {
        const beat = beats[index];
        if (!beat || leaving) return;
        beat.style.transition = 'none';
        beat.classList.add('is-in');
        tweenStep(PROMO_GLIDE.captionInMs, (e) => { beat.style.opacity = e.toFixed(3); });
        promoSfx('sold-beat', { index });
      };
      beats.forEach((beat) => { beat.style.transition = 'none'; beat.style.opacity = '0'; });
      const sequence = (async () => {
        await Promise.all([waitMs(start), take ? take.at('visits', 'start', -60) : Promise.resolve()]);
        show(0);
        if (take) await take.at('sales.', 'start', -40); else await waitMs(captionBeatOffset(1));
        show(1);
        for (let index = 2; index < beats.length; index += 1) {
          await waitMs(captionBeatOffset(index) - captionBeatOffset(index - 1));
          show(index);
        }
        await waitMs(PROMO_GLIDE.captionHoldMs);
      })();
      // v24: the words drift up and out before the next scene fades in over
      // the orange (exitBy: ms after this call), never under it, even if the
      // narrator runs late (a beat not yet shown then stays out)
      const outMs = 520;
      // v26: the words hold over the sales lane until the hand-off (exitBy), not just the beats' own hold
      await (exitBy == null ? sequence : waitMs(Math.max(0, exitBy - outMs - (performance.now() - calledAt))));
      leaving = true;
      caption.style.transition = 'none';
      promoSfx('sold-caption-out', { ms: outMs });
      await tweenStep(outMs, (e) => {
        caption.style.setProperty('opacity', (1 - e).toFixed(3), 'important');
        caption.style.translate = `0 ${(-e * 18).toFixed(2)}px`;
      }, (u) => u * u);
      caption.remove();
      if (this.soldCaption === caption) this.soldCaption = null;
    }

    async fadeScaleToSwitch() {
      promoSfx('switch-in');
      const center = this.root.querySelector('.promo-opening__center');
      this.root.classList.add('is-scale-out');
      if (center) {
        center.style.transition = 'none';
        center.style.opacity = '0';
        center.getBoundingClientRect();
        center.style.transition = `opacity ${PROMO_SCALE_FADE_MS}ms linear`;
        center.style.opacity = '1';
      }
      await waitMs(PROMO_SCALE_FADE_MS);
      this.releasePainStage();
    }

    async playScaleScene() {
      if (!this.root.classList.contains('is-pain')) return;
      if (!this.root.querySelector('[data-promo-scale]')) return;
      this.prepareScaleScene();
      if (prefersReducedMotion()) {
        this.hideScaleStore();
        this.revealScaleLayer();
        this.root.classList.add('is-scale-still');
        await this.captureConveyorStill();
        this.paintGlideAt(0, 'pain', { reduced: true });
        await waitMs(PROMO_GLIDE.captionHoldMs);
        const caption = this.root.querySelector('[data-promo-glide-caption]');
        if (caption) caption.hidden = true;
        await this.playConveyorEnd('pain');
        if (marketingPart() === 'full') {
          await this.fadeScaleToSwitch();
          await waitMs(PROMO_TOGGLE_REST_MS);
          this.flip();
        }
        return;
      }
      await this.playScaleTimeline();
      if (marketingPart() === 'full') {
        const take = speakTake('t-switch');
        // v11: the physical store first: "Your best salesperson" over its
        // three moments; on "So we built it!" the title gives way to the
        // toggle, "Sales agent" charging, and the knob lands on "it!"
        const title = this.showSwitchTitle();
        await this.fadeScaleToSwitch();
        this.chargeSwitch(take);
        const moments = this.showSwitchMoments(take);
        const walkedIn = take.at('store...', 'end', -40).then(() => this.enterSwitchStore(title));
        Promise.all([take.at('the best', 'start', -60), walkedIn]).then(() => this.morphSwitchTitle(title));
        take.at('into sales').then(() => moments?.resolve());
        take.at('So we built', 'start', -160).then(() => { this.swapSwitchTitle(title); moments?.exit(); });   // v23: the outcomes bow out as the toggle takes the stage (it stands alone)
        take.at('for your online', 'start', -220).then(() => this.writeOnlineStore(title));
        await take.at('for your online', 'start');   // v22: the flip may start on "store!" so the burst lands as the word ends (the drop)
        await untilFilm(PROMO_FILM_ANCHORS.burst - (PROMO_FLIP_KNOB_MS + PROMO_FLIP_POP_HOLD_MS + PROMO_KNOB_WARM_MS) / 1000);   // v21: the burst lands on the drop
        this.flip();
        window.setTimeout(() => { moments?.clear(); if (title?.online) fadeStep(title.online, 1, 0, 300).then(() => title.online.remove()); }, PROMO_FLIP_KNOB_MS);
      }
    }

    // v12c: the physical store first, as if we walk into it: "In a physical
    // store" stands big at the centre and rushes past the viewer; then "The
    // best salesperson" takes the toggle's place over its three moments.
    showSwitchTitle() {
      const center = this.root.querySelector('.promo-opening__center');
      const parts = [...this.root.querySelectorAll('.promo-opening__choice--left, .promo-opening__switch, .promo-opening__choice--right')];
      if (!center || !parts.length || prefersReducedMotion()) return null;
      ensureInviteFont();
      parts.forEach((node) => { node.style.transition = 'none'; node.style.opacity = '0'; });
      const entry = document.createElement('div');
      entry.className = 'promo-switch-entry';
      entry.innerHTML = `<span class="promo-switch-entry__mark">${PROMO_SF_STORE}</span><span class="promo-switch-entry__words">In a physical store</span>`;
      center.appendChild(entry);
      const title = document.createElement('p');
      title.className = 'promo-switch-title';
      title.innerHTML = `<span class="promo-switch-title__mark">${PROMO_PERSON_MARK}</span><span class="promo-switch-title__words">The best salesperson</span>`;
      title.style.opacity = '0';
      const left = this.root.querySelector('.promo-opening__choice--left');
      if (left) title.style.fontSize = getComputedStyle(left).fontSize;
      center.appendChild(title);
      const sw = this.root.querySelector('.promo-opening__switch')?.getBoundingClientRect();
      const cb = center.getBoundingClientRect();
      if (sw && cb.width) {
        title.style.left = `${(((sw.left + sw.width / 2) - cb.left) / cb.width * 100).toFixed(2)}%`;
        title.style.top = `${(((sw.top + sw.height / 2) - cb.top) / cb.height * 100).toFixed(2)}%`;
      }
      return { title, parts, entry, center };
    }

    // "...store": we walk in: the words rush toward the viewer and are gone
    enterSwitchStore(state) {
      if (!state?.entry) return;
      const { entry } = state;
      promoSfx('store-enter');
      return tweenStep(520, (e) => {
        entry.style.scale = (1 + e * e * 3.4).toFixed(4);
        entry.style.opacity = Math.max(0, 1 - e * 1.25).toFixed(3);
        entry.style.filter = `blur(${(e * e * 14).toFixed(2)}px)`;
      }, (u) => u).then(() => entry.remove());
    }

    // "...the best salesperson": the title rises in where the toggle will be
    morphSwitchTitle(state) {
      if (!state) return;
      const { title } = state;
      promoSfx('chapter');
      tweenStep(420, (e) => { title.style.opacity = e.toFixed(3); title.style.translate = `-50% calc(-50% + ${((1 - e) * 0.4).toFixed(3)}em)`; }, promoEaseOut);
    }

    // "...for your online store!": written in by hand under the toggle, "online" in orange
    writeOnlineStore(state) {
      if (!state) return;
      const line = document.createElement('p');
      line.className = 'promo-switch-online';
      line.innerHTML = 'for your <b>online</b> store!';
      state.center.appendChild(line);
      const sw = this.root.querySelector('.promo-opening__switch')?.getBoundingClientRect();
      const cb = state.center.getBoundingClientRect();
      if (sw && cb.width) {
        line.style.left = `${(((sw.left + sw.width / 2) - cb.left) / cb.width * 100).toFixed(2)}%`;
        line.style.top = `${(((sw.top - sw.height * 0.95) - cb.top) / cb.height * 100).toFixed(2)}%`;
      }
      promoSfx('ea-write', { ms: 640 });
      tweenStep(640, (e) => { line.style.clipPath = `inset(-45% ${((1 - e) * 100).toFixed(2)}% -45% -10%)`; }, (u) => u);
      state.online = line;
    }

    // the title steps aside and the toggle forms in its place (stepped)
    swapSwitchTitle(state) {
      if (!state) return;
      const { title, parts } = state;
      promoSfx('switch-in');
      tweenStep(320, (e) => {
        title.style.opacity = (1 - e).toFixed(3);
        title.style.translate = `-50% calc(-50% - ${(e * 0.35).toFixed(3)}em)`;
        parts.forEach((node) => { node.style.opacity = e.toFixed(3); });
      }, promoEaseOut).then(() => {
        title.remove();
        parts.forEach((node) => { node.style.opacity = ''; node.style.transition = ''; });
      });
    }

    // "...catches both moments": the two pains appear under the toggle as
    // grey status chips; when the knob lands they turn into their outcomes
    // (the same chips the moments resolve later), then clear with the toggle.
    showSwitchMoments(take) {
      const center = this.root.querySelector('.promo-opening__center');
      if (!center || prefersReducedMotion()) return null;
      const row = document.createElement('div');
      row.className = 'promo-switch-moments';
      const chip = (from, to) => `<span class="promo-switch-moments__chip"><span class="promo-switch-moments__dot"><svg viewBox="0 0 24 24" aria-hidden="true"><path pathLength="1" d="M7.2 12.4l3.2 3.2 6.4-6.6"/></svg></span><span class="promo-switch-moments__words"><span>${from}</span><span>${to}</span></span></span>`;
      // v10: the three shopper problems the pitch then solves one by one
      row.innerHTML = PROMO_SWITCH_CHIPS.map(([from, to]) => chip(from, to)).join('');
      center.appendChild(row);
      const chips = [...row.children];
      take.at('catches').then(() => {
        chips.forEach((node, k) => window.setTimeout(() => { node.classList.add('is-in'); promoSfx('chapter'); }, k * 220));
      });
      // centred under the switch itself (the label widths differ, so the toggle's centre isn't the frame's)
      const sw = this.root.querySelector('.promo-opening__switch')?.getBoundingClientRect();
      const cb = center.getBoundingClientRect();
      if (sw && cb.width) row.style.left = `${(((sw.left + sw.width / 2) - cb.left) / cb.width * 100).toFixed(2)}%`;
      return {
        resolve: () => chips.forEach((node, k) => window.setTimeout(() => { node.classList.add('is-struck'); promoSfx('chapter-tick'); }, k * 140)),
        clear: () => window.setTimeout(() => { row.classList.add('is-out'); window.setTimeout(() => row.remove(), 500); }, PROMO_FLIP_POP_HOLD_MS),
        // v23: one by one, left to right, each chip lifts a little toward the
        // toggle and dissolves (stepped: export-safe), so the toggle stands alone
        exit: () => {
          chips.forEach((node, k) => window.setTimeout(() => {
            node.style.transition = 'none';
            tweenStep(420, (e) => {
              node.style.opacity = (1 - e).toFixed(3);
              node.style.translate = `0 ${(-e * 0.55).toFixed(3)}em`;
              node.style.scale = (1 - e * 0.06).toFixed(4);
              node.style.filter = `blur(${(e * e * 6).toFixed(2)}px)`;
            }, promoEaseOut);
          }, k * 70));
          window.setTimeout(() => row.remove(), 420 + chips.length * 70 + 40);
        },
      };
    }

    placeOverStore(host, store) {
      const rootBox = this.root.getBoundingClientRect();
      const box = store.getBoundingClientRect();
      host.style.left = `${(box.left - rootBox.left).toFixed(1)}px`;
      host.style.top = `${(box.top - rootBox.top).toFixed(1)}px`;
      host.style.width = `${box.width.toFixed(1)}px`;
      host.style.height = `${box.height.toFixed(1)}px`;
    }

    visibleCloseStore() {
      const seated = this.root.querySelector('.promo-glide__cell > .promo-opening__store');
      if (seated && seated.style.visibility !== 'hidden') return seated;
      return this.root.querySelector('.promo-glide__lead .promo-opening__store') || this.painStore();
    }

    leadGlideCell() {
      const root = this.root.querySelector('[data-promo-glide]');
      const pooled = (root?._glidePool || []).find((item) => item.cell.dataset.key === this.glideLeadKey)?.cell;
      if (pooled) return pooled;
      return this.root.querySelector('.promo-glide__cell > .promo-opening__store')?.parentElement || null;
    }

    async poofCloseStore(voice) {
      if (prefersReducedMotion()) return;
      if (voice) markPromoVo('loses-both');
      const cell = this.leadGlideCell();
      const veil = cell?.querySelector(':scope > .promo-glide__veil');
      const mark = cell?.querySelector(':scope > .promo-glide__lost-mark');
      if (!cell || !veil || !mark) return;
      cell.querySelectorAll('.promo-close__veil, .promo-close__lost-mark').forEach((node) => node.remove());
      fillLostMark(mark);
      const width = Number.parseFloat(cell.style.width) || cell.offsetWidth;
      mark.style.fontSize = lostMarkSize(width, Number.parseFloat(cell.style.height) || cell.offsetHeight);
      veil.style.visibility = 'visible';
      mark.style.visibility = 'visible';
      veil.style.zIndex = '6';
      mark.style.zIndex = '7';
      const life = 260 + 900;
      const started = performance.now();
      this.glideLeadStampT = started;   // the sea paints the card's sink from this moment
      await new Promise((resolve) => {
        const step = (now) => {
          paintGlideStamp(veil, mark, now - started, 0.34);
          if (now - started < life) window.requestAnimationFrame(step);
          else resolve();
        };
        window.requestAnimationFrame(step);
      });
      this.glideLeadStamped = true;
      mark.dataset.settled = '1';
    }

    async markCloseStoreSold() {
      const store = this.painStore();
      if (!store || prefersReducedMotion()) return;
      promoSfx('sold');
      const veil = document.createElement('div');
      veil.className = 'promo-glide__veil promo-close__veil';
      const mark = document.createElement('span');
      mark.className = 'promo-glide__mark promo-close__mark';
      fillSoldMark(mark);
      mark.style.fontSize = lostMarkSize((store.clientWidth || 640) * 0.72, store.clientHeight * 0.72);   // the close-up's chip: a stamp, not a banner
      store.append(veil, mark);
      const hold = 380;   // a beat, not a hold
      const life = PROMO_CHECK_SETTLE_MS + hold;
      const started = performance.now();
      await new Promise((resolve) => {
        const step = (now) => {
          paintGlideStamp(veil, mark, now - started, 0.3);
          const r = markReact(now - started);
          store.style.filter = markReactFilter('sold', r);
          store.style.translate = `0 ${(-r * 0.025 * (store.offsetHeight || 0)).toFixed(1)}px`;
          if (now - started < life) window.requestAnimationFrame(step);
          else resolve();
        };
        window.requestAnimationFrame(step);
      });
    }

    async aimCursorAtWindowClose() {
      const store = this.painStore();
      const cursor = this.root.querySelector('[data-promo-pain-cursor]');
      const dot = store?.querySelector('[data-promo-window-close]');
      if (!store || !cursor || !dot) return;
      cursor.hidden = false;
      cursor.style.transitionDuration = '0ms';
      cursor.style.opacity = '0';
      cursor.style.setProperty('--pain-x', `${Math.round(store.clientWidth * 0.42)}px`);
      cursor.style.setProperty('--pain-y', `${Math.round(store.clientHeight * 0.58)}px`);
      cursor.getBoundingClientRect();
      cursor.style.transitionDuration = '';
      cursor.style.opacity = '1';
      await waitMs(320);
      this.root.style.setProperty('--promo-pain-ease', 'cubic-bezier(0.45, 0, 0.2, 1)');
      this.root.style.setProperty('--promo-pain-open', `${PROMO_WINDOW_AIM_MS}ms`);
      const aim = this.painCursorPoint(dot);
      if (!aim) return;
      cursor.style.setProperty('--pain-x', `${Math.round(aim.x)}px`);
      cursor.style.setProperty('--pain-y', `${Math.round(aim.y)}px`);
      this.pinWindowCloseOrigin();
      this.root.classList.add('is-window-aim');
      await waitMs(PROMO_WINDOW_AIM_MS + PROMO_WINDOW_HOLD_MS);
      this.emitClick();
    }

    async aimCursorAtLauncher() {
      const store = this.visibleCloseStore();
      const chat = store?.querySelector('[data-promo-pain-chat]');
      const cursor = store?.querySelector('[data-promo-pain-cursor]');
      const launcher = chat?.querySelector('.promo-pain__launcher');
      if (!store || !chat || !cursor || !launcher) return;
      chat.classList.remove('is-open');
      chat.removeAttribute('hidden');
      cursor.hidden = false;
      cursor.style.opacity = '1';
      this.root.style.setProperty('--promo-pain-ease', 'cubic-bezier(0.45, 0, 0.2, 1)');
      this.root.style.setProperty('--promo-pain-open', `${PROMO_LAUNCHER_AIM_MS}ms`);
      const aim = this.painCursorPoint(launcher, store);
      if (!aim) return;
      cursor.style.setProperty('--pain-x', `${Math.round(aim.x)}px`);
      cursor.style.setProperty('--pain-y', `${Math.round(aim.y)}px`);
      await waitMs(PROMO_LAUNCHER_AIM_MS);
      this.emitClick();
      await waitMs(140);
    }

    revealDullThumb(log, thumb) {
      if (!log || !thumb) return;
      const frame = log.getBoundingClientRect();
      const box = thumb.getBoundingClientRect();
      if (box.bottom > frame.bottom - 6) log.scrollTop += box.bottom - frame.bottom + 14;
      if (box.top < frame.top + 6) log.scrollTop -= frame.top + 14 - box.top;
    }

    painCursorVisual(target, store) {
      if (!store || !target) return null;
      const storeBox = store.getBoundingClientRect();
      const box = target.getBoundingClientRect();
      const scale = storeBox.width / (store.offsetWidth || storeBox.width) || 1;
      return {
        x: (box.left + box.width / 2 - storeBox.left) / scale - PROMO_CURSOR_HOT_X,
        y: (box.top + box.height / 2 - storeBox.top) / scale - PROMO_CURSOR_HOT_Y,
      };
    }

    async aimCursorAtThumbDown(store = this.painStore()) {
      const chat = store?.querySelector('[data-promo-pain-chat]');
      const cursor = store?.querySelector('[data-promo-pain-cursor]')
        || this.root.querySelector('[data-promo-pain-cursor]');
      const thumb = chat?.querySelector('[data-promo-thumb="down"]');
      const log = chat?.querySelector('[data-promo-pain-log]');
      if (!store || !chat || !cursor || !thumb) return;
      this.revealDullThumb(log, thumb);
      const place = (target) => {
        const spot = this.painCursorVisual(target, store);
        if (!spot) return;
        cursor.style.setProperty('--pain-x', `${Math.round(spot.x)}px`);
        cursor.style.setProperty('--pain-y', `${Math.round(spot.y)}px`);
      };
      cursor.hidden = false;
      cursor.style.transitionDuration = '0ms';
      cursor.style.opacity = '0';
      place(chat.querySelector('.promo-pain__composer') || thumb);
      cursor.getBoundingClientRect();
      cursor.style.transitionDuration = '';
      cursor.style.opacity = '1';
      await waitMs(220);
      this.root.style.setProperty('--promo-pain-ease', 'cubic-bezier(0.45, 0, 0.2, 1)');
      this.root.style.setProperty('--promo-pain-open', `${PROMO_CHAT_AIM_MS}ms`);
      this.revealDullThumb(log, thumb);
      place(thumb);
      this.root.classList.add('is-thumb-aim');
      await waitMs(PROMO_CHAT_AIM_MS);
      this.emitClick();
      thumb.click();
      await waitMs(560);
      this.root.classList.remove('is-thumb-aim');
    }

    async closeChatForLost() {
      if (prefersReducedMotion() || this.painChatUsed === false) return;
      const store = this.visibleCloseStore();
      const chat = store?.querySelector('[data-promo-pain-chat]');
      const cursor = store?.querySelector('[data-promo-pain-cursor]');
      const dot = chat?.querySelector('[data-promo-chat-close]');
      if (!store || !chat || !cursor || !dot) return;
      chat.classList.remove('is-shut');
      chat.classList.add('is-open');
      chat.removeAttribute('hidden');
      cursor.hidden = false;
      cursor.style.transitionDuration = '0ms';
      cursor.style.opacity = '0';
      cursor.style.setProperty('--pain-x', `${Math.round(store.clientWidth * 0.58)}px`);
      cursor.style.setProperty('--pain-y', `${Math.round(store.clientHeight * 0.7)}px`);
      cursor.getBoundingClientRect();
      cursor.style.transitionDuration = '';
      cursor.style.opacity = '1';
      await waitMs(160);
      this.root.style.setProperty('--promo-pain-ease', 'cubic-bezier(0.45, 0, 0.2, 1)');
      this.root.style.setProperty('--promo-pain-open', `${PROMO_CHAT_AIM_MS}ms`);
      const aim = this.painCursorPoint(dot, store);
      if (aim) {
        cursor.style.setProperty('--pain-x', `${Math.round(aim.x)}px`);
        cursor.style.setProperty('--pain-y', `${Math.round(aim.y)}px`);
        this.root.classList.add('is-chat-aim');
        await waitMs(PROMO_CHAT_AIM_MS);
        this.emitClick();
        await waitMs(120);
      }
      chat.classList.remove('is-open', 'is-shut');
      chat.removeAttribute('hidden');
      cursor.style.opacity = '0';
      await waitMs(180);
    }

    phoneNeighborKey() {
      const frame = this.gridFrame();
      const view = glideCells(0, frame, 'pain');
      const lead = view.cells.find((cell) => cell.key === this.glideLeadKey);
      if (!lead) return '';
      glideFlankLead(lead);
      return glideRows.get(lead.row)?.cells.find((cell) => cell.col === lead.col + 1)?.key || '';
    }

    async panCloseUpTo(cellKey) {
      const root = this.root.querySelector('[data-promo-glide]');
      const viewWrap = root?.querySelector('.promo-glide__view');
      const frame = this.gridFrame();
      const view = glideCells(0, frame, 'pain');
      const from = view.cells.find((cell) => cell.key === this.glideLeadKey);
      const to = view.cells.find((cell) => cell.key === cellKey);
      if (!viewWrap || !from || !to) return;
      const unit = view.span.unit;
      const zoomX = this.glideZoomFrom || 1;
      const zoomY = this.glideZoomFromY || zoomX;
      const shiftX = ((from.x + from.w / 2) - (to.x + to.w / 2)) * unit * zoomX;
      const shiftY = ((from.y + from.h / 2) - (to.y + to.h / 2)) * unit * zoomY;
      const match = viewWrap.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)\s*scale\(([-\d.]+),\s*([-\d.]+)\)/);
      const baseX = match ? Number(match[1]) : 0;
      const baseY = match ? Number(match[2]) : 0;
      const scaleX = match ? match[3] : zoomX.toFixed(4);
      const scaleY = match ? match[4] : zoomY.toFixed(4);
      const started = performance.now();
      const dur = 450;
      await new Promise((resolve) => {
        const step = (now) => {
          const u = Math.min(1, (now - started) / dur);
          const ease = u * u * (3 - 2 * u);
          viewWrap.style.transform = `translate(${(baseX + shiftX * ease).toFixed(2)}px, ${(baseY + shiftY * ease).toFixed(2)}px) scale(${scaleX}, ${scaleY})`;
          if (u < 1) window.requestAnimationFrame(step);
          else resolve();
        };
        window.requestAnimationFrame(step);
      });
    }

    seatPhoneClone(phoneKey) {
      const root = this.root.querySelector('[data-promo-glide]');
      const clone = this.root.querySelector('.promo-glide__cell > .promo-opening__store');
      const phoneNode = (root?._glidePool || []).find((item) => item.cell.dataset.key === phoneKey)?.cell;
      if (!clone || !phoneNode) return null;
      this.painLostKeys = this.painLostKeys || new Set();
      if (this.glideLeadKey) this.painLostKeys.add(this.glideLeadKey);
      const desk = this.leadGlideCell();
      desk?.querySelector(':scope > .promo-glide__veil')?.style.setProperty('visibility', 'visible');
      desk?.querySelector(':scope > .promo-glide__lost-mark')?.style.setProperty('visibility', 'visible');
      clone.querySelector('[data-promo-pain-chat]')?.setAttribute('hidden', '');
      clone.classList.remove('is-desktop');
      clone.classList.add('is-phone');
      clone.style.width = '360px';
      clone.style.height = '840px';
      clone.dataset.naturalW = '360';
      clone.dataset.naturalH = '840';
      phoneNode.appendChild(clone);
      phoneNode.classList.add('is-phone', 'is-lead-match');
      phoneNode.classList.remove('is-desktop');
      phoneNode.querySelector(':scope > .promo-glide__name')?.style.setProperty('visibility', 'hidden');
      const width = Number.parseFloat(phoneNode.style.width) || phoneNode.offsetWidth || 360;
      const height = Number.parseFloat(phoneNode.style.height) || phoneNode.offsetHeight || 840;
      clone.style.transformOrigin = '0 0';
      clone.style.transform = `scale(${(width / 360).toFixed(4)}, ${(height / 840).toFixed(4)})`;
      clone.style.visibility = 'visible';
      clone.style.opacity = '1';
      this.glideLeadKey = phoneKey;
      const stage = clone.querySelector('[data-promo-moments-stage]');
      if (stage) applyMomentPose(stage, 'doubt', { instant: true });
      return clone;
    }

    clipGlideTo(node) {
      const root = this.root.querySelector('[data-promo-glide]');
      if (!root || !node) return;
      const host = root.getBoundingClientRect();
      const box = node.getBoundingClientRect();
      const top = Math.max(0, box.top - host.top);
      const right = Math.max(0, host.right - box.right);
      const bottom = Math.max(0, host.bottom - box.bottom);
      const left = Math.max(0, box.left - host.left);
      root.style.clipPath = `inset(${top.toFixed(1)}px ${right.toFixed(1)}px ${bottom.toFixed(1)}px ${left.toFixed(1)}px)`;
    }

    growPhoneClose(phoneNode) {
      const glide = this.root.querySelector('[data-promo-glide]');
      const close = this.glideCloseRect;
      if (!glide || !phoneNode || !close) return;
      const box = phoneNode.getBoundingClientRect();
      if (box.height < 8) return;
      const factor = Math.min(close.h / box.height, (close.w * 0.62) / Math.max(1, box.width));
      if (factor < 1.08) return;
      const rootBox = this.root.getBoundingClientRect();
      const ox = box.left - rootBox.left + box.width / 2;
      const oy = box.top - rootBox.top + box.height / 2;
      glide.style.transformOrigin = `${ox.toFixed(1)}px ${oy.toFixed(1)}px`;
      glide.style.transition = 'transform 280ms ease';
      glide.style.transform = `scale(${Math.min(factor, 4.2).toFixed(3)})`;
    }

    framePhoneClose(clone) {
      const frameBox = this.root.getBoundingClientRect();
      const box = clone.getBoundingClientRect();
      this.glideZoomFrom = 0;
      this.glideZoomFromY = 0;
      this.glideAnchor = null;
      if (box.width < 40) return;
      this.glideCloseRect = {
        cx: box.left - frameBox.left + box.width / 2,
        cy: box.top - frameBox.top + box.height / 2,
        w: box.width,
        h: box.height,
      };
    }

    // Center of a node in the phone's own coordinates, for the touch dot.
    // v23: from the boxes on screen, so a scrolled chat log and the zoomed phone both land right
    thumbSpot(target, clone) {
      if (!target || !clone.contains(target)) return null;
      const cb = clone.getBoundingClientRect(); const tb = target.getBoundingClientRect();
      const sx = cb.width / (clone.offsetWidth || cb.width) || 1; const sy = cb.height / (clone.offsetHeight || cb.height) || 1;
      return {
        x: (tb.left + tb.width / 2 - cb.left) / sx - clone.clientLeft - 14,
        y: (tb.top + tb.height / 2 - cb.top) / sy - clone.clientTop - 14,
      };
    }

    // A finger comes in and taps the dull chatbot's circle to open it.
    // v13: the bot offers a person ("Message us"), the chat becomes the team's
    // inbox (a generic green chat, never a real brand), the clock races ahead,
    // and the perfect reply lands, hours later.
    offerHumanChat(clone) {
      const log = clone.querySelector('[data-promo-pain-log]');
      if (!log) return;
      const block = document.createElement('div');
      block.className = 'promo-pain__msg is-bot';
      block.innerHTML = '<div class="promo-pain__bubble"><p>Want to talk to a real person?</p><span class="promo-pain__handoff">Talk to a person</span></div>';
      log.appendChild(block);
      fadeStep(block, 0, 1, 220);
      const from = log.scrollTop; const to = Math.max(from, log.scrollHeight - log.clientHeight);   // v23: the log glides up to it (never a jump)
      tweenStep(300, (e) => { log.scrollTop = from + (to - from) * e; }, promoEaseOut);
      promoSfx('reply');
    }

    // v23: one WhatsApp-like bubble (tail, time, ticks) for Emma's chat, in the film's palette
    humanBubble(kind, text, time) {
      const block = document.createElement('div');
      block.className = `promo-pain__msg promo-pain__wa is-${kind}`;
      const bubble = document.createElement('p');
      bubble.textContent = text;
      const meta = document.createElement('span');
      meta.className = 'promo-pain__meta';
      meta.innerHTML = `<time>${time}</time>${kind === 'out' ? PROMO_HUMAN_TICKS : ''}`;
      bubble.appendChild(meta);
      block.appendChild(bubble);
      return block;
    }

    async tapPhoneTarget(clone, target) {
      const cursor = clone.querySelector('[data-promo-pain-cursor]');
      const spot = target && this.thumbSpot(target, clone);
      if (!cursor || !spot) return;
      cursor.hidden = false;
      cursor.classList.add('is-thumb');
      cursor.style.transition = 'none';   // v24: the touch is stepped only (no CSS transition can replay under the export clock)
      cursor.style.setProperty('--pain-x', `${Math.round(spot.x + clone.clientWidth * 0.14)}px`);
      cursor.style.setProperty('--pain-y', `${Math.round(spot.y + clone.clientHeight * 0.12)}px`);
      cursor.getBoundingClientRect();
      fadeStep(cursor, 0, 1, 140);
      await waitMs(90);
      await this.moveThumb(clone, spot.x, spot.y, 380);
      this.pressTouch(cursor);
      promoSfx('click');
      await waitMs(60);
      await this.liftTouch(cursor, 120);   // v24: lifted before the chat changes under it (same 180 ms as before)
    }

    openHumanChat(clone) {
      const chat = clone.querySelector('[data-promo-pain-chat]');
      const log = clone.querySelector('[data-promo-pain-log]');
      if (!chat || !log) return;
      chat.classList.add('is-human');
      const title = chat.querySelector('.promo-pain__title');
      // v23: a WhatsApp-like chat in the film's palette: Emma's portrait, "Today", the question sent at 9:41
      if (title) title.innerHTML = 'Emma<small>typically replies in a few hours</small>';
      const avatar = chat.querySelector('.promo-pain__avatar');
      if (avatar) avatar.innerHTML = PROMO_HUMAN_PORTRAIT;
      log.replaceChildren();
      const day = document.createElement('p');
      day.className = 'promo-pain__day';
      day.textContent = 'Today';
      log.append(day, this.humanBubble('out', PROMO_PAIN_LINE_2, '9:41 AM'));
      fadeStep(log, 0, 1, 260);
      scrollDullLog(log);
    }

    // the status bar's clock races ahead (9:41 -> 1:27), stepped; v23: and so does a time pill in
    // Emma's chat (the zoomed camera keeps the status bar out of frame)
    fastForwardClock(clone, ms) {
      const log = clone.querySelector('.promo-pain__chat.is-human [data-promo-pain-log]');
      if (log) {
        const lapse = document.createElement('p');
        lapse.className = 'promo-pain__day promo-pain__lapse';
        lapse.innerHTML = `${PROMO_HUMAN_CLOCK}<time data-ampm>9:41 AM</time>`;
        log.appendChild(lapse);
        fadeStep(lapse, 0, 1, 200);
        const from = log.scrollTop; const to = Math.max(from, log.scrollHeight - log.clientHeight);
        if (to > from) tweenStep(260, (e) => { log.scrollTop = from + (to - from) * e; }, promoEaseOut);
      }
      const times = [...clone.querySelectorAll('.promo-clip__time, .promo-dev__status b, .promo-pain__lapse time')];
      if (!times.length) return waitMs(ms);
      promoSfx('clock-ff', { ms });
      const from = 9 * 60 + 41; const to = 13 * 60 + 27;
      return tweenStep(ms, (e) => {
        const m = Math.round(from + (to - from) * e); const h = Math.floor(m / 60) % 12 || 12;
        const text = `${h}:${String(m % 60).padStart(2, '0')}`;
        times.forEach((node) => {
          const label = node.hasAttribute('data-ampm') ? `${text} ${m < 720 ? 'AM' : 'PM'}` : text;
          if (node.textContent !== label) node.textContent = label;
        });
      }, (u) => u * u * (3 - 2 * u));
    }

    humanReplyArrives(clone) {
      const log = clone.querySelector('[data-promo-pain-log]');
      if (!log) return;
      log.querySelectorAll('.promo-pain__wa.is-out').forEach((node) => node.classList.add('is-read'));   // the ticks turn: read, at last
      const block = this.humanBubble('in', PROMO_HUMAN_REPLY, '1:27 PM');
      log.appendChild(block);
      tweenStep(320, (e) => { block.style.opacity = e.toFixed(3); block.style.translate = `0 ${((1 - e) * 10).toFixed(1)}px`; }, promoEaseOut);
      const from = log.scrollTop; const to = Math.max(from, log.scrollHeight - log.clientHeight);
      if (to > from) tweenStep(320, (e) => { log.scrollTop = from + (to - from) * e; }, promoEaseOut);
    }

    // the shopper's thumb taps 👎 on the chatbot's answer
    async tapThumbsDown(clone) {
      const down = clone.querySelector('.promo-pain__rate [data-rate="down"]');
      const cursor = clone.querySelector('[data-promo-pain-cursor]');
      const spot = down && this.thumbSpot(down, clone);
      if (!cursor || !spot) return;
      cursor.hidden = false;
      cursor.classList.add('is-thumb');
      cursor.style.transition = 'none';   // v24: the touch is stepped only (no CSS transition can replay under the export clock)
      cursor.style.opacity = '0';
      cursor.style.setProperty('--pain-x', `${Math.round(spot.x + clone.clientWidth * 0.16)}px`);
      cursor.style.setProperty('--pain-y', `${Math.round(spot.y + clone.clientHeight * 0.14)}px`);
      cursor.getBoundingClientRect();
      fadeStep(cursor, 0, 1, 160);
      await waitMs(100);
      await this.moveThumb(clone, spot.x, spot.y, 460);
      this.pressTouch(cursor);
      promoSfx('click');
      down.classList.add('is-on');
      tweenStep(300, (e, u) => { down.style.scale = (1 + Math.sin(u * Math.PI) * 0.28).toFixed(3); }, (u) => u);
      await waitMs(80);
      await this.liftTouch(cursor, 120);   // v24: same 200 ms as before
    }

    async tapPhoneLauncher(clone) {
      const launcher = clone.querySelector('.promo-pain__launcher');
      const cursor = clone.querySelector('[data-promo-pain-cursor]');
      const spot = launcher && this.thumbSpot(launcher, clone);
      if (!cursor || !spot) return;
      cursor.hidden = false;
      cursor.classList.add('is-thumb');
      cursor.style.transition = 'none';   // v24: the touch is stepped only (no CSS transition can replay under the export clock)
      cursor.style.opacity = '0';
      cursor.style.setProperty('--pain-x', `${Math.round(spot.x - clone.clientWidth * 0.22)}px`);
      cursor.style.setProperty('--pain-y', `${Math.round(spot.y - clone.clientHeight * 0.16)}px`);
      cursor.getBoundingClientRect();
      cursor.style.setProperty('--tap-scale', '1.12');
      fadeStep(cursor, 0, 1, 160);
      await waitMs(120);
      await this.moveThumb(clone, spot.x, spot.y, 520);
      this.pressTouch(cursor);
      this.emitClick();
      await waitMs(80);
      await this.liftTouch(cursor, 120);   // v24: gone before the panel opens (same 200 ms as before)
    }

    // v24: the fingertip glides in (stepped, a slight arc) and settles onto the glass as it arrives
    async moveThumb(clone, x, y, ms) {
      const cursor = clone.querySelector('[data-promo-pain-cursor]');
      if (!cursor) return;
      cursor.hidden = false;
      cursor.classList.add('is-thumb');
      cursor.style.transition = 'none';
      if (!(Number.parseFloat(cursor.style.opacity) > 0)) cursor.style.opacity = '1';
      const x0 = Number.parseFloat(cursor.style.getPropertyValue('--pain-x'));
      const y0 = Number.parseFloat(cursor.style.getPropertyValue('--pain-y'));
      const ax = Number.isFinite(x0) ? x0 : x; const ay = Number.isFinite(y0) ? y0 : y;
      const k0 = Number.parseFloat(cursor.style.getPropertyValue('--tap-scale')) || 1.12;
      const dx = x - ax; const dy = y - ay;
      await tweenStep(ms, (e) => {
        const arc = Math.sin(Math.PI * e) * 0.07;
        cursor.style.setProperty('--pain-x', `${(ax + dx * e - dy * arc).toFixed(1)}px`);
        cursor.style.setProperty('--pain-y', `${(ay + dy * e + dx * arc).toFixed(1)}px`);
        cursor.style.setProperty('--tap-scale', (k0 + (1 - k0) * e).toFixed(4));
      }, (u) => promoEaseInOut(u) * 0.45 + promoEaseOut(u) * 0.55);
    }

    // v24: the press: the fingertip gives (and darkens), a ring ripples out from it. Stepped.
    pressTouch(cursor) {
      if (!cursor) return Promise.resolve();
      const clamp01 = (v) => Math.min(1, Math.max(0, v));
      return tweenStep(440, (e, u) => {
        const press = u < 0.2 ? promoEaseOut(u / 0.2) : 1 - promoEaseInOut(clamp01((u - 0.2) / 0.55));
        cursor.style.setProperty('--tap-scale', (1 - 0.13 * press).toFixed(4));
        cursor.style.setProperty('--tap-down', press.toFixed(3));
        const r = clamp01((u - 0.04) / 0.96);
        cursor.style.setProperty('--tap-ring', (1 + 1.45 * promoEaseOut(r)).toFixed(4));
        cursor.style.setProperty('--tap-ring-o', (0.85 * Math.min(1, r * 7) * (1 - r) ** 1.6).toFixed(3));
      }, (u) => u);
    }

    // v24: the finger lifts off the glass: it grows a touch as it fades
    liftTouch(cursor, ms) {
      if (!cursor) return Promise.resolve();
      cursor.style.transition = 'none';
      const o0 = Number.parseFloat(cursor.style.opacity);
      const from = Number.isFinite(o0) ? o0 : 1;
      return tweenStep(ms, (e) => {
        cursor.style.opacity = (from * (1 - e)).toFixed(3);
        cursor.style.setProperty('--tap-scale', (1 + 0.12 * e).toFixed(4));
      }, promoEaseOut);
    }

    fillCloneChat(clone, through) {
      const chat = clone.querySelector('[data-promo-pain-chat]');
      const log = clone.querySelector('[data-promo-pain-log]');
      const input = clone.querySelector('[data-promo-pain-input]');
      const typing = clone.querySelector('[data-promo-pain-typing]');
      if (!chat || !log || !input) return;
      chat.hidden = false;
      chat.removeAttribute('hidden');
      chat.classList.add('is-open');
      chat.classList.remove('is-shut');
      log.replaceChildren();
      input.classList.remove('is-live');
      if (typing) typing.hidden = true;
      if (through === 'typed-2') {
        input.textContent = PROMO_PAIN_LINE_2;
        showInputEnd(input);
      }
      if (through === 'think-2' || through === 'answer-2') {
        appendDullUser(log, PROMO_PAIN_LINE_2);
        input.textContent = '';
      }
      if (through === 'think-2') appendDullThink(log);
      if (through === 'answer-2') {
        appendDullBot(log, PROMO_PAIN_ANSWER_2, null, PROMO_PAIN_ACTIONS);
        // v11: the typical rating row under the wall of text (the shopper taps 👎)
        const rate = document.createElement('div');
        rate.className = 'promo-pain__rate';
        rate.innerHTML = `<span>Was this helpful?</span><i data-rate="up">${PROMO_THUMB_SVG}</i><i data-rate="down">${PROMO_THUMB_SVG}</i>`;
        (log.lastElementChild?.querySelector('.promo-pain__bubble') || log.lastElementChild)?.appendChild(rate);
      }
      scrollDullLog(log);
    }

    async playPhoneDoubt(clone) {
      const stage = clone.querySelector('[data-promo-moments-stage]');
      if (stage) applyMomentPose(stage, 'doubt', { instant: true });
      clone.classList.add('is-orbit-open');
      const cell = clone.closest('.promo-glide__cell');
      if (cell) {
        cell.style.overflow = 'visible';
        cell.style.clipPath = 'none';
      }
      const cursor = clone.querySelector('[data-promo-pain-cursor]');
      if (cursor) {
        cursor.classList.add('is-thumb');
        cursor.style.opacity = '0';
      }
      // v13: "...and go looking for help." the closed chatbot launcher is seen first (two soft rings call
      // the eye to it), then the thumb taps it on "A chatbot?". v23: no push-in on the launcher any more:
      // the chat zoom below is the phone's only camera move (operator: "still too crazy").
      const closedChat = clone.querySelector('[data-promo-pain-chat]');
      if (closedChat) { closedChat.hidden = false; closedChat.classList.remove('is-open'); }   // the launcher waits on the product page from the start
      const launcher = clone.querySelector('.promo-pain__launcher');
      if (launcher && !prefersReducedMotion()) {
        await this.painTake?.at('looking for help', 'start', -300);
        // stepped, never WAAPI: export-safe
        tweenStep(1600, (e, u) => { const k = (u * 2) % 1; launcher.style.boxShadow = `0 0 0 ${(k * 14).toFixed(1)}px rgba(30, 30, 30, ${(0.28 * (1 - k)).toFixed(3)})`; }, (u) => u)
          .then(() => { launcher.style.boxShadow = ''; });
        await this.painTake?.at('help.', 'end', -340);   // the thumb lands as "A chatbot?" begins (v23b STT: "help." ends 15.36 s, "A chatbot?" 15.96 s)
      } else await waitMs(150);
      await this.tapPhoneLauncher(clone);
      const input = clone.querySelector('[data-promo-pain-input]');
      this.fillCloneChat(clone, 'panel');
      const sheet = clone.querySelector('[data-promo-pain-chat]');
      if (sheet) {   // the panel rises in (stepped), and is settled before the camera measures it
        await tweenStep(320, (e) => { sheet.style.opacity = e.toFixed(3); sheet.style.translate = `0 ${((1 - e) * 9).toFixed(2)}%`; }, promoEaseOut);
        sheet.style.opacity = ''; sheet.style.translate = '';
      }
      // v23: ONE camera move: as the shopper starts typing, the phone glides in until the chat panel fills
      // the frame, and it holds through the bot's wall, the hand-off and Emma's reply; playPhonePain
      // pulls back as the chat closes
      const zoom = this.zoomPhoneToChat(clone, 1500);
      if (input) {
        input.textContent = '';
        input.classList.add('is-live');
      }
      await typeOver(PROMO_PAIN_LINE_2, (slice) => {
        if (input) {
          input.textContent = slice;
          showInputEnd(input);
        }
      }, PROMO_PAIN_FAST_CHAR_MS, PROMO_PAIN_FAST_LINE_MS);
      input?.classList.remove('is-live');
      this.fillCloneChat(clone, 'think-2');
      promoSfx('send');
      await Promise.all([waitMs(250), this.painTake?.at('wall of text', 'start', -80)]);   // v23: the wall lands on "wall" (v23b STT 17.56 s), a short think
      this.fillCloneChat(clone, 'answer-2');
      promoSfx('reply');
      // the wall rolls on while "go read it" plays (never a frozen frame); the camera holds
      const log = clone.querySelector('[data-promo-pain-log]');
      if (log) {
        log.scrollTop = 0;
        const t0 = performance.now();
        const roll = (now) => {
          const u = Math.min(1, Math.max(0, (now - t0 - 200) / 900)); const e = u * u * (3 - 2 * u);
          log.scrollTop = (log.scrollHeight - log.clientHeight) * e;
          if (u < 1 && log.isConnected) window.requestAnimationFrame(roll);
        };
        window.requestAnimationFrame(roll);
      }
      await zoom;
      // the shopper rates the wall 👎 as "go read it" ends (v23b STT: "it." ends 19.22 s; the tap lands ~540 ms after it starts)
      await this.painTake?.at('go read it', 'end', -540);
      await this.tapThumbsDown(clone);
      // "A real person?" (v23b STT: "A" ~19.8 s, "person?" 20.36-20.78 s): the offer pops in the beat
      // before, the thumb taps "Talk to a person" on "person?", and Emma's chat opens as the word ends
      await this.painTake?.at('A real person?', 'start', -250);
      this.offerHumanChat(clone);
      await this.painTake?.at('A real person?', 'start', 40);
      const handoff = clone.querySelector('.promo-pain__handoff');
      if (handoff) await this.tapPhoneTarget(clone, handoff);
      await this.painTake?.at('A real person?', 'start', 900);
      this.openHumanChat(clone);
      promoSfx('panel');
      // "The perfect answer... hours later.": the clock races, the reply lands as "later" ends
      // (v23b STT: "hours" 22.92 s, "later" ends 23.58 s; the .json's end runs ~0.22 s late)
      await this.painTake?.at('hours later.', 'start', -700);
      await this.fastForwardClock(clone, 900);
      await this.painTake?.at('hours later.', 'end', -300);
      this.humanReplyArrives(clone);
      promoSfx('reply');
      // "...already gone.": the shopper closes the chat, the thumb on the ✕ as "gone." ends (v23b STT 25.22 s)
      await this.painTake?.at('already gone.', 'end', -620);
      const close = clone.querySelector('.promo-pain__chat.is-open .promo-pain__close');
      if (close) await this.tapPhoneTarget(clone, close);
    }

    // v23: the phone pain's one zoom: the chat panel fills the frame (scale from the panel's box vs the
    // canvas, with margins: never clipped), centred; stepped per frame (export-safe)
    zoomPhoneToChat(clone, ms) {
      const panel = clone.querySelector('[data-promo-pain-chat] .promo-pain__panel');
      const canvas = this.root.querySelector('[data-promo-canvas]') || this.root;
      if (!panel || prefersReducedMotion()) return Promise.resolve();
      const base = clone.style.transform || '';
      const frame = canvas.getBoundingClientRect(); const cb = clone.getBoundingClientRect(); const pb = panel.getBoundingClientRect();
      if (pb.width < 8 || pb.height < 8) return Promise.resolve();
      const s = cb.width / (clone.offsetWidth || cb.width) || 1;   // screen px per phone px
      const k = Math.min((frame.width * 0.9) / pb.width, (frame.height * 0.92) / pb.height);
      // the panel's centre (phone px) is the fixed point; then the panel slides to the frame's centre
      const ox = (pb.left + pb.width / 2 - cb.left) / s; const oy = (pb.top + pb.height / 2 - cb.top) / s;
      const tx = (frame.left + frame.width / 2 - (pb.left + pb.width / 2)) / s;
      const ty = (frame.top + frame.height / 2 - (pb.top + pb.height / 2)) / s;
      clone.style.transition = 'none';
      clone.style.transformOrigin = `${ox.toFixed(2)}px ${oy.toFixed(2)}px`;
      const paint = (e) => { clone.style.transform = `${base} translate(${(tx * e).toFixed(2)}px, ${(ty * e).toFixed(2)}px) scale(${(1 + (k - 1) * e).toFixed(4)})`; };
      this.phoneChatZoom = { clone, paint, base };
      return tweenStep(ms, paint, promoEaseInOut);
    }

    // ...and back to the regular framing as the shopper closes the chat
    unzoomPhoneChat(ms) {
      const zoom = this.phoneChatZoom;
      this.phoneChatZoom = null;
      if (!zoom) return Promise.resolve();
      return tweenStep(ms, (e) => zoom.paint(1 - e), promoEaseInOut).then(() => {
        zoom.clone.style.transition = 'none'; zoom.clone.style.transformOrigin = ''; zoom.clone.style.transform = zoom.base;   // later moves stay instant
      });
    }

    hideSeaNeighbors() {
      const root = this.root.querySelector('[data-promo-glide]');
      (root?._glidePool || []).forEach((item) => {
        if (item.cell.dataset.key === this.glideLeadKey) return;
        item.cell.hidden = true;
        item.fx.hidden = true;
      });
    }

    clearCloseFace() {
      this.root.querySelectorAll('.promo-close-face').forEach((node) => node.remove());
    }

    async stampLost(node) {
      if (!node || prefersReducedMotion()) return;
      const veil = document.createElement('div');
      veil.className = 'promo-close__veil is-lost';
      const mark = document.createElement('span');
      mark.className = 'promo-glide__lost-mark';
      fillLostMark(mark);
      mark.style.fontSize = lostMarkSize(node.clientWidth || 640, node.clientHeight);
      node.append(veil, mark);
      promoSfx('lost-close');
      const life = 1100;
      const started = performance.now();
      await new Promise((resolve) => {
        const step = (now) => {
          paintGlideStamp(veil, mark, now - started, 0.34);
          node.style.filter = markReactFilter('lost', markReact(now - started));
          if (now - started < life) window.requestAnimationFrame(step);
          else resolve();
        };
        window.requestAnimationFrame(step);
      });
    }

    async rememberRaster(node, key) {
      if (!node || !key) return;
      const image = await rasterStore(node);
      if (!image) return;
      if (!this.cellRasters) this.cellRasters = new Map();
      this.cellRasters.set(key, image);
    }

    async slideInPhoneProduct(desktop) {
      promoSfx('pan');
      const canvas = this.root.querySelector('[data-promo-canvas]') || this.root;
      const host = canvas.getBoundingClientRect();
      const phone = desktop.cloneNode(true);
      phone.removeAttribute('id');
      phone.querySelectorAll('[id]').forEach((item) => item.removeAttribute('id'));
      phone.querySelectorAll('.promo-close__veil, .promo-glide__lost-mark, .promo-glide__veil').forEach((item) => item.remove());
      phone.style.filter = '';
      phone.classList.remove('is-desktop');
      phone.classList.add('is-phone');
      // the same phone as everywhere else in the film: a 9:41 status bar with the island
      if (!phone.querySelector(':scope > .promo-clip__status')) phone.insertBefore(this.clipStatus('phone'), phone.firstChild);
      const phoneH = host.height * 0.78;
      const phoneW = phoneH * (9 / 19);
      // The phone waits just right of the desktop, as the next mockup on the
      // same table, and the camera pans across to it.
      const desk = desktop.getBoundingClientRect();
      const scale = host.width / (canvas.offsetWidth || host.width) || 1;
      const deskRight = (desk.right - host.left) / scale;
      const start = Math.max(host.width * 0.55, deskRight + host.width * 0.08);
      const home = (host.width - phoneW) / 2;
      phone.style.position = 'absolute';
      phone.style.zIndex = '9';
      phone.style.margin = '0';
      phone.style.left = `${start.toFixed(1)}px`;
      phone.style.top = `${((host.height - phoneH) / 2).toFixed(1)}px`;
      phone.style.width = `${phoneW.toFixed(1)}px`;
      phone.style.height = `${phoneH.toFixed(1)}px`;
      phone.style.visibility = 'hidden';
      canvas.appendChild(phone);
      const stage = phone.querySelector('[data-promo-moments-stage]');
      const board = phone.querySelector('.promo-moments__board');
      if (stage) applyMomentPose(stage, 'doubt', { instant: true });
      if (board) layoutStoreGrid(board);
      phone.style.visibility = '';
      phone.getBoundingClientRect();
      // Stepped per frame so the export clock samples every step of the pan.
      const pan = home - start;
      desktop.style.transition = 'none';
      phone.style.transition = 'none';
      await new Promise((resolve) => {
        const began = performance.now();
        const step = () => {
          const u = Math.min(1, (performance.now() - began) / PROMO_PHONE_PAN_MS);
          const eased = u < 0.5 ? 4 * u * u * u : 1 - ((-2 * u + 2) ** 3) / 2;
          const x = `translateX(${(pan * eased).toFixed(1)}px)`;
          desktop.style.transform = x;
          phone.style.transform = x;
          // The desktop fades away as the camera leaves it; it comes back
          // with the rest of the sea.
          desktop.style.opacity = Math.max(0, 1 - u * 1.6).toFixed(3);
          if (u < 1) window.requestAnimationFrame(step);
          else resolve();
        };
        step();
      });
      return phone;
    }

    restorePhoneLead(clone) {
      const glide = this.root.querySelector('[data-promo-glide]');
      const frameBox = this.root.getBoundingClientRect();
      const box = clone.getBoundingClientRect();
      this.glideZoomFrom = 0;
      this.glideZoomFromY = 0;
      this.glideAnchor = null;
      if (box.width > 40) {
        this.glideCloseRect = {
          cx: box.left - frameBox.left + box.width / 2,
          cy: box.top - frameBox.top + box.height / 2,
          w: box.width,
          h: box.height,
        };
      }
      const lead = glide?.querySelector('.promo-glide__lead');
      if (lead) lead.appendChild(clone);
      clone.style.position = '';
      clone.style.left = '';
      clone.style.top = '';
      clone.style.margin = '';
      clone.style.zIndex = '';
      clone.style.transition = '';
      clone.style.transform = '';
      if (glide) {
        glide.style.display = '';
        glide.style.clipPath = '';
        glide.style.transform = '';
        glide.style.transformOrigin = '';
      }
      glideLeadDevice = 'phone';
      this.paintGlideAt(0, 'pain');
    }

    async playPhonePain() {
      const desktop = this.painStore();
      if (!desktop) return;
      const phoneKey = this.phoneNeighborKey();
      this.painLostKeys = this.painLostKeys || new Set();
      if (this.glideLeadKey) this.painLostKeys.add(this.glideLeadKey);
      const phone = await this.slideInPhoneProduct(desktop);
      await this.playPhoneDoubt(phone);
      const chat = phone.querySelector('[data-promo-pain-chat]');
      const reframe = this.unzoomPhoneChat(800);   // v23: the camera pulls back to the regular framing as the chat closes
      if (chat) {   // the chatbot slides away, then the phone is stamped
        await new Promise((resolve) => {
          const t0 = performance.now();
          const step = (now) => {
            const u = Math.min(1, (now - t0) / 300); const e = u * u;
            chat.style.opacity = (1 - e).toFixed(3); chat.style.translate = `0 ${(e * 9).toFixed(2)}%`;
            if (u < 1) window.requestAnimationFrame(step); else resolve();
          };
          window.requestAnimationFrame(step);
        });
        chat.classList.remove('is-open'); chat.style.opacity = ''; chat.style.translate = '';
      }
      await reframe;
      const cursor = phone.querySelector('[data-promo-pain-cursor]');
      if (cursor) cursor.style.opacity = '0';
      await waitMs(120);
      await this.stampLost(phone);
      if (phoneKey) {
        this.painLostKeys.add(phoneKey);
        await this.rememberRaster(phone, phoneKey);
        this.glideLeadKey = phoneKey;
      }
      // The phone the sea grows from is already stamped: keep its LOST and veil.
      this.glideLeadStamped = true;
      const frame = this.root.getBoundingClientRect();
      const box = phone.getBoundingClientRect();
      this.glideZoomFrom = 0;
      this.glideZoomFromY = 0;
      this.glideAnchor = null;
      if (box.width > 40) {
        this.glideCloseRect = {
          cx: box.left - frame.left + box.width / 2,
          cy: box.top - frame.top + box.height / 2,
          w: box.width,
          h: box.height,
        };
      }
      this.painPhoneLead = phone;
      desktop.style.visibility = 'hidden';
    }

    seatPhoneLead() {
      const phone = this.painPhoneLead;
      const lead = this.root.querySelector('.promo-glide__lead');
      if (!phone || !lead) return;
      const close = this.glideCloseRect;
      phone.dataset.naturalW = String(Math.round(close?.w || phone.offsetWidth));
      phone.dataset.naturalH = String(Math.round(close?.h || phone.offsetHeight));
      phone.style.position = '';
      phone.style.left = '';
      phone.style.top = '';
      phone.style.margin = '';
      phone.style.zIndex = '';
      phone.style.transition = '';
      phone.style.transform = '';
      lead.hidden = false;
      lead.appendChild(phone);
    }

    mountStoreOpenTitle() {
      const stage = this.root.querySelector('.promo-opening__store.is-desktop [data-promo-moments-stage]');
      if (!stage || stage.querySelector('[data-promo-store-open]')) return null;
      const veil = document.createElement('div');
      veil.className = 'promo-store-open';
      veil.setAttribute('data-promo-store-open', '');
      const brand = document.createElement('div');
      brand.className = 'promo-store-open__brand';
      const mark = document.createElement('span');
      mark.className = 'promo-opening__store-mark';
      mark.setAttribute('aria-hidden', 'true');
      mark.innerHTML = PROMO_STORE_MARK;
      const title = document.createElement('p');
      title.className = 'promo-store-open__title';
      title.textContent = 'Your store';
      brand.append(mark, title);
      veil.append(brand);
      stage.append(veil);
      return veil;
    }

    async playStoreOpenTitle(veil) {
      if (!veil) return;
      if (prefersReducedMotion()) {
        veil.remove();
        return;
      }
      // Under a second: the window opens with "Your store" already on it,
      // then the title gives way to the catalog.
      const store = this.painStore();
      veil.getBoundingClientRect();
      veil.classList.add('is-in');
      store?.classList.add('is-window-in');
      await waitMs(PROMO_WINDOW_IN_MS);
      store?.classList.remove('is-window-in');
      await waitMs(PROMO_STORE_TITLE_IN_MS + PROMO_STORE_TITLE_HOLD_MS - 200);
      store?.classList.add('is-bar-in');
      await waitMs(200);
      await fadeStep(veil, 1, 0, Math.max(320, PROMO_STORE_TITLE_OUT_MS));
      veil.remove();
    }

    // v24 hook: the film opens mid-motion. Frame 0 is the store already composed (bar, catalog)
    // with the shopper's cursor caught mid-stroke; it browses (stroke, hover, stroke, hover) and
    // ends on the card the 'enter' beat aims at, so the pain's own steps carry on seamlessly.
    // Stepped per frame (tweenStep on performance.now): export-safe.
    // v24 opening (<1 s): the desktop window rises and settles from slightly below, its
    // shadow blooming in, while the catalogue's tiles cascade up row by row. Frame 0 is
    // already a third of the way in (a window on its way, never a white frame). Inline
    // individual properties only (they compose with the CSS transforms) and all cleared after.
    async playStoreEntrance(store, cards, cols) {
      if (!store) return;
      const MS = 780; const U0 = 0.2;
      const base = getComputedStyle(store).boxShadow;
      const keep = base && base !== 'none' ? `${base}, ` : '';
      const tiles = cards.slice(0, cols * 3);
      const lift = store.clientHeight * 0.03;
      const out = (u) => 1 - (1 - u) ** 3;
      const settle = (u) => 1 - (1 - u) ** 4;   // the window lands softer than the tiles
      await tweenStep(MS * (1 - U0), (e, u) => {
        const k = U0 + (1 - U0) * u;
        const w = settle(k);
        store.style.translate = `0 ${((1 - w) * store.clientHeight * 0.075).toFixed(2)}px`;
        store.style.scale = (0.945 + 0.055 * w).toFixed(4);
        store.style.opacity = Math.min(1, 0.25 + 0.75 * out(Math.min(1, k * 1.6))).toFixed(4);
        // the shadow blooms wide while it travels, then tightens into its resting one
        const bloom = Math.sin(Math.PI * Math.min(1, k * 1.15));
        store.style.boxShadow = `${keep}0 ${(2.4 + 2.2 * bloom).toFixed(2)}vh ${(7 * bloom + 1).toFixed(2)}vh rgba(28, 24, 20, ${(0.16 * bloom).toFixed(3)})`;
        tiles.forEach((tile, i) => {
          const row = Math.floor(i / cols); const col = i % cols;
          const d = (row * 0.16 + col * 0.05);   // a diagonal cascade, top-left first
          const t = Math.min(1, Math.max(0, (k - d) / 0.5));
          const s = out(t);
          tile.style.translate = `0 ${((1 - s) * lift).toFixed(2)}px`;
          tile.style.opacity = (0.15 + 0.85 * s).toFixed(4);
        });
      }, (u) => u);
      store.style.translate = ''; store.style.scale = ''; store.style.opacity = ''; store.style.boxShadow = '';
      tiles.forEach((tile) => { tile.style.translate = ''; tile.style.opacity = ''; });
    }

    async playStoreBrowseOpen(totalMs) {
      const store = this.painStore();
      const cursor = this.root.querySelector('[data-promo-pain-cursor]');
      const cards = this.painCards();
      const cols = this.painCols();
      this.applyPainBeat('grid', true);
      // the stage layer's own 1.2 s fade-in (is-pain) would open the film on white: it is already there
      const layer = this.root.querySelector('.promo-opening__pitch');
      if (layer) { layer.style.transition = 'none'; layer.style.opacity = '1'; layer.getBoundingClientRect(); }
      waitMs(totalMs).then(() => { if (layer) { layer.style.opacity = ''; layer.getBoundingClientRect(); layer.style.transition = ''; } });
      if (!store || !cursor || cards.length < cols * 2 || prefersReducedMotion()) { await waitMs(totalMs); return; }
      const sb = store.getBoundingClientRect();
      const at = (card, fx, fy) => { const b = card.getBoundingClientRect(); return { x: b.left + b.width * fx - sb.left, y: b.top + b.height * fy - sb.top }; };
      const [c1, c2, c3] = [cards[1], cards[2], cards[3]];
      const target = this.painBrowseCard(0) || cards[cols + 1];
      // [from, to, ms, kind, start u]: strokes are quick and slightly curved, hovers are slow drifts
      const legs = [
        [at(c3, 0.6, 0.74), at(c2, 0.58, 0.42), 640, 'stroke', 0.36],
        [at(c2, 0.58, 0.42), at(c2, 0.46, 0.5), 540, 'hover', 0],
        [at(c2, 0.46, 0.5), at(c1, 0.6, 0.4), 500, 'stroke', 0],
        [at(c1, 0.6, 0.4), at(c1, 0.5, 0.47), 300, 'hover', 0],
        [at(c1, 0.5, 0.47), at(target, 0.55, 0.34), 0, 'stroke', 0],
      ];
      const fixed = legs.slice(0, -1).reduce((sum, [, , ms, , u0]) => sum + ms * (1 - u0), 0);
      legs[legs.length - 1][2] = Math.max(260, totalMs - fixed);
      cursor.hidden = false;
      cursor.classList.remove('is-thumb');
      cursor.style.transition = 'none';
      cursor.style.opacity = '1';
      const place = (p) => { cursor.style.setProperty('--pain-x', `${p.x.toFixed(1)}px`); cursor.style.setProperty('--pain-y', `${p.y.toFixed(1)}px`); };
      const hover = (card) => cards.forEach((node) => node.classList.toggle('is-pain-hover', node === card));
      const strokeEase = (u) => (u < 0.5 ? 4 * u * u * u : 1 - ((-2 * u + 2) ** 3) / 2) * 0.7 + (1 - (1 - u) ** 2) * 0.3;
      this.playStoreEntrance(store, cards, cols);   // v24: the window rises in (frame 0 already mid-motion) while the cursor browses
      for (const [index, [a, b, ms, kind, u0]] of legs.entries()) {
        const span = ms * (1 - u0);
        const dx = b.x - a.x; const dy = b.y - a.y;
        const bend = kind === 'stroke' ? (index % 2 ? -0.12 : 0.1) : 0;
        await tweenStep(span, (e, u) => {
          const k = u0 + (1 - u0) * u;
          const s = kind === 'stroke' ? strokeEase(k) : k * k * (3 - 2 * k);
          const arc = Math.sin(Math.PI * s) * bend;
          place({ x: a.x + dx * s - dy * arc, y: a.y + dy * s + dx * arc });
          if (kind === 'stroke' && index === 0 && k > 0.72) hover(c2);
          if (kind === 'stroke' && index === 2 && k > 0.25) hover(k > 0.75 ? c1 : null);
          if (kind === 'stroke' && index === 4 && k > 0.3) hover(null);
        }, (u) => u);
      }
      hover(null);
      cursor.getBoundingClientRect();
      cursor.style.transition = '';
    }

    async rememberLeadRaster() {
      const store = this.visibleCloseStore();
      const key = this.glideLeadKey;
      if (!store || !key) return;
      const image = await rasterStore(store);
      if (!image) return;
      if (!this.cellRasters) this.cellRasters = new Map();
      this.cellRasters.set(key, image);
    }

    async playScaleTimeline() {
      const generation = this.scaleGeneration;
      this.glideLeadStamped = false;
      this.glideKeepStore = false;
      await this.closeChatForLost();
      if (generation !== this.scaleGeneration) return;
      const desktop = this.painStore();
      await this.painLine;
      await this.stampLost(desktop);
      if (generation !== this.scaleGeneration) return;
      this.glideLeadKey = glideLeadCell(this.gridFrame())?.key || '';
      await this.rememberRaster(desktop, this.glideLeadKey);
      this.painDesktopKey = this.glideLeadKey;
      if (generation !== this.scaleGeneration) return;
      await this.painTake?.at('Others');
      await this.playPhonePain();
      if (generation !== this.scaleGeneration) return;
      glideLeadDevice = 'phone';
      this.revealScaleLayer();
      this.mountGlide('pain');
      if (generation !== this.scaleGeneration) return;
      this.seatPhoneLead();
      this.paintGlideAt(0, 'pain');
      promoSfx('pullback', { mode: 'pain' });
      this.runGlide('pain', 0);
      const saleLost = (this.painTake?.done || Promise.resolve())
        .then(() => waitMs(PROMO_PAIN_END_GAP_MS))
        .then(() => (generation === this.scaleGeneration ? speakTake('t-pain-end').done : null));
      await Promise.all([waitMs(glidePlayEnd('pain')), saleLost]);
      if (generation !== this.scaleGeneration) return;
      await this.playConveyorEnd('pain', { settled: true });
    }

    leaveCorridor() {
      window.cancelAnimationFrame(this.conveyorFrame);
      window.cancelAnimationFrame(this.planeFrame);
      this.scaleGeneration = (this.scaleGeneration || 0) + 1;
      this.root.classList.remove(
        'is-scale',
        'is-scale-white',
        'is-scale-zero',
        'is-scale-still',
        'is-corridor',
        'is-grid',
        'is-end-pain',
        'is-end-pitch',
        'is-pitch-belt',
      );
      const scale = this.root.querySelector('[data-promo-scale]');
      if (scale) scale.hidden = true;
      const store = this.painStore();
      if (store) store.style.visibility = '';
      const stage = this.momentStage();
      if (stage) applyMomentPose(stage, 'gone', { instant: true });
      this.residue?.reset();
      this.residue = null;
    }

    mountEndCta(value) {
      const verdict = this.root.querySelector('[data-promo-scale-verdict]');
      if (!verdict) return;
      const key = Object.prototype.hasOwnProperty.call(PROMO_END_CTA, value) ? value : promoVideoConfig.cta;
      const copy = PROMO_END_CTA[key];
      this.root.classList.toggle('is-cta-none', !copy);
      this.root.dataset.promoCta = key;
      let slot = verdict.querySelector('[data-promo-end-cta]');
      if (!slot) {
        slot = document.createElement('div');
        slot.className = 'promo-scale__cta';
        slot.setAttribute('data-promo-end-cta', '');
        verdict.append(slot);
      }
      slot.replaceChildren();
      if (!copy) return;
      if (copy.scarcity) {
        const scarcity = document.createElement('p');
        scarcity.className = 'promo-scale__cta-note';
        scarcity.textContent = copy.scarcity;
        slot.append(scarcity);
      }
      const button = document.createElement('span');
      button.className = 'promo-scale__cta-button';
      button.textContent = copy.label;
      slot.append(button);
      if (copy.extras?.length) {
        const extras = document.createElement('p');
        extras.className = 'promo-pass-slot__extras';
        copy.extras.forEach((text) => {
          const item = document.createElement('span');
          item.className = 'promo-pass-slot__extra';
          item.textContent = text;
          extras.append(item);
        });
        slot.append(extras);
      }
      if (copy.find) {
        const find = document.createElement('p');
        find.className = 'promo-pass-slot__find';
        find.append(shopifyBag(), document.createTextNode(copy.find));
        slot.append(find);
      }
      if (copy.shopify) {   // the brand signs the card
        const brand = document.createElement('img');
        brand.className = 'promo-pass-slot__brand';
        brand.src = '/images/bizmis-logo-full-orange-transparent.svg';
        brand.alt = 'Bizmis';
        slot.prepend(brand);
      }
      if (copy.url) {
        const url = document.createElement('p');
        url.className = 'promo-scale__cta-url';
        url.textContent = copy.url;
        slot.append(url);
      }
    }

    setConveyorEnd(mode, ctaKey) {
      const caption = this.root.querySelector('[data-promo-end-caption]');
      if (caption) caption.textContent = '';
      this.root.classList.toggle('is-end-pitch', mode === 'pitch');
      this.root.classList.toggle('is-end-pain', mode !== 'pitch');
      this.mountEndCta('none');
    }

    async playConveyorEnd(mode, options = {}) {
      window.cancelAnimationFrame(this.conveyorFrame);
      this.setConveyorEnd(mode);
      if (mode !== 'pitch') {
        const verdict = this.root.querySelector('[data-promo-scale-verdict]');
        if (verdict) verdict.style.opacity = '0';
        await waitMs(promoHoldMs());
        return;
      }
      if (options.settled) {
        // The settled pitch sea is already a solid orange field that the store
        // pass eases out of. Turning the scale white here flashed a white
        // second before the orange came back.
        this.root.classList.add('is-grid-locked');
        this.clearGridResolve();
        const verdict = this.root.querySelector('[data-promo-scale-verdict]');
        if (verdict) verdict.style.opacity = '0';
        // with the store reel next, the orange field is a breath, not a hold
        if (loadStoreReel().length) {
          await waitMs(PROMO_REEL_ORANGE_MS + promoHoldMs());
          return;
        }
      } else {
        this.root.classList.add('is-scale-white');
        await waitMs(PROMO_SCALE_WHITE_MS);
        this.root.classList.add('is-scale-zero');
        this.emitThud();
      }
      await waitMs(PROMO_SCALE_HOLD_MS + promoHoldMs());
    }

    seatClerkOnBelt(instant) {
      const embed = this.parkedEmbed || document.getElementById('bizmis-avatar-embed');
      const canvas = this.root.querySelector('[data-promo-canvas]');
      const scale = this.root.querySelector('[data-promo-scale]');
      if (!embed || !canvas || !scale) return;
      this.clerkCornerActive = true;
      this.root.classList.add('is-pitch-belt', 'is-clerk-corner');
      this.root.classList.toggle('is-clerk-instant', instant || prefersReducedMotion());
      const scaleBox = scale.getBoundingClientRect();
      const canvasBox = canvas.getBoundingClientRect();
      if (scaleBox.width < 40 || canvasBox.width < 40) return;
      const height = PROMO_AVATAR_BOX_H * PROMO_CLERK_CORNER_SCALE;
      const right = canvasBox.right - (scaleBox.right - 36);
      const top = scaleBox.bottom - 20 - height - canvasBox.top;
      this.root.style.setProperty('--promo-clerk-top', `${top.toFixed(1)}px`);
      this.root.style.setProperty('--promo-clerk-right', `${right.toFixed(1)}px`);
      embed.style.setProperty('--promo-avatar-scale', String(PROMO_CLERK_CORNER_SCALE));
      embed.style.setProperty('--promo-avatar-lift', '0px');
    }

    async playPitchConveyor() {
      if (this.pitchBeltStarted) return;
      this.pitchBeltStarted = true;
      this.prepareScaleScene();
      promoWidget.applyStoreLook(this.bizmisLook());
      const generation = this.scaleGeneration;
      glideLeadDevice = 'desktop';
      const stage = this.momentStage();
      if (stage && !this.pitchCardsPlayed) applyMomentPose(stage, 'bundle', { instant: true });
      this.captureNeutralStage();
      this.root.classList.add('is-pitch-belt');
      if (prefersReducedMotion()) {
        this.root.classList.add('is-scale-still');
        this.revealScaleLayer();
        this.paintGlideAt(0, 'pitch', { reduced: true });
        await waitMs(400);
        await this.playConveyorEnd('pitch');
        this.playSeeForYourself();
        return;
      }
      this.glideKeepStore = false;
      const pitchRaster = this.pitchLeadKey ? this.cellRasters?.get(this.pitchLeadKey) : null;
      this.cellRasters = new Map();
      this.painLostKeys = new Set();
      if (pitchRaster && this.pitchLeadKey) this.cellRasters.set(this.pitchLeadKey, pitchRaster);
      this.captureGlideClose('pitch');
      if (!this.pitchCardsPlayed) await this.markCloseStoreSold();
      if (generation !== this.scaleGeneration) return;
      this.revealScaleLayer();
      this.mountGlide('pitch');
      if (generation !== this.scaleGeneration) return;
      this.paintGlideAt(0, 'pitch');
      this.runGlide('pitch');
      const soldTake = speakTake('t-sold');
      this.playSoldCaption(glideMarks('pitch').claimAt, soldTake, glidePlayEnd('pitch') - (loadStoreReel().length ? PROMO_REEL_ORANGE_CUT_MS : 0) - 120);   // v24: gone before the next scene shows
      // with the store reel next, cut the orange field's resolve hold short:
      // the reel fades in over it instead of after it
      await waitMs(glidePlayEnd('pitch') - (loadStoreReel().length ? PROMO_REEL_ORANGE_CUT_MS : 0));
      if (generation !== this.scaleGeneration) return;
      await this.playConveyorEnd('pitch', { settled: true });
      this.playSeeForYourself();
    }

    ensureEndCard(ctaKey) {
      const key = ctaKey && Object.prototype.hasOwnProperty.call(PROMO_END_CTA, ctaKey)
        ? ctaKey
        : promoVideoConfig.cta;
      const existing = this.root.querySelector('[data-promo-end-card]');
      if (existing && existing.dataset.cta === key) return existing;
      const parkedMark = existing?.querySelector('[data-promo-end-mark]');
      const hero = this.root.querySelector('.promo-scale__end-hero');
      if (parkedMark && hero) hero.appendChild(parkedMark);
      existing?.remove();
      const copy = PROMO_END_CTA[key];
      const card = document.createElement('div');
      card.className = 'promo-end';
      card.setAttribute('data-promo-end-card', '');
      card.dataset.cta = key;
      const lockup = document.createElement('div');
      lockup.className = 'promo-end__lockup';
      const column = document.createElement('div');
      column.className = 'promo-end__stack';
      column.append(lockup);
      if (copy?.scarcity) {
        const eyebrow = document.createElement('p');
        eyebrow.className = 'promo-end__eyebrow';
        eyebrow.textContent = copy.scarcity;
        column.append(eyebrow);
      }
      if (copy) {
        const claim = document.createElement('p');
        claim.className = 'promo-end__claim';
        claim.textContent = copy.label;
        column.append(claim);
        if (copy.url) {
          const url = document.createElement('p');
          url.className = 'promo-end__url';
          url.textContent = copy.url;
          column.append(url);
        }
      }
      card.append(column);
      this.root.append(card);
      return card;
    }

    placeEndClerk() {
      this.parkWidget();
      promoWidget.applyStoreLook(this.bizmisLook());
      const embed = this.parkedEmbed || document.getElementById('bizmis-avatar-embed');
      if (!embed) return;
      this.root.classList.add('is-clerk-instant');
      embed.style.setProperty('--promo-avatar-scale', '2.05');
      embed.style.setProperty('--promo-avatar-lift', '0px');
    }

    dockEndMark(card, animate) {
      const mark = this.root.querySelector('[data-promo-end-mark]');
      const lockup = card.querySelector('.promo-end__lockup');
      if (!mark || !lockup || lockup.contains(mark)) return;
      mark.style.background = '';
      if (!animate) {
        mark.style.transition = 'none';
        mark.style.transform = '';
        lockup.appendChild(mark);
        return;
      }
      const first = mark.getBoundingClientRect();
      lockup.appendChild(mark);
      const last = mark.getBoundingClientRect();
      const sx = last.width > 1 ? first.width / last.width : 1;
      const sy = last.height > 1 ? first.height / last.height : 1;
      mark.style.transformOrigin = '0 0';
      mark.style.transition = 'none';
      mark.style.transform = `translate(${(first.left - last.left).toFixed(1)}px, ${(first.top - last.top).toFixed(1)}px) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
      mark.getBoundingClientRect();
      mark.style.transition = `transform ${PROMO_END_CARD_MOVE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
      mark.style.transform = '';
    }

    settleEndCard(ctaKey) {
      this.settlePassSlot(ctaKey);
    }

    async animateEndCard() {
      await this.landPassSlot();
    }

    async playEndCard() {
      if (!this.root.classList.contains('is-store-pass')) this.holdOrangeField();
      if (prefersReducedMotion()) {
        this.settlePassSlot();
        const hold = PROMO_END_CTA[promoVideoConfig.cta]?.shopify ? PROMO_EA_HOLD_MS : PROMO_END_CARD_HOLD_MS;
        await waitMs(hold + promoHoldMs());
        this.depart();
        return;
      }
      await this.landPassSlot();
    }

    async showEndCardExport(ctaKey) {
      await this.showScaleExport('end', 'pitch', ctaKey);
      this.settleEndCard(ctaKey);
      return this.whenPainRest(this.painHost());
    }

    async showScaleExport(kind, mode = 'pain', ctaKey) {
      this.resetScaleScene();
      this.prepareScaleScene();
      if (mode === 'pitch') {
        document.documentElement.classList.remove('is-promo-depart', 'is-promo-pitch');
        this.resetSee();
        this.root.classList.remove('is-pitch');
        this.openPainStage();
        this.applyPainBeat('answer-2', true);
        this.neutralStage = null;
        this.neutralStageWidth = 0;
        this.captureNeutralStage();
        this.root.classList.add('is-pitch', 'is-pitch-belt', 'is-moments');
        const stage = this.momentStage();
        if (stage) applyMomentPose(stage, 'bundle', { instant: true });
        promoWidget.applyStoreLook(this.bizmisLook());
      } else {
        this.root.classList.remove('is-pitch');
        this.openPainStage();
        this.applyPainBeat('answer-2', true);
        this.hideScaleStore();
      }
      this.captureGlideClose(mode);
      this.revealScaleLayer();
      this.root.classList.add('is-scale-still');
      if (mode !== 'pitch') await Promise.race([this.captureConveyorStill(), waitMs(1200)]);
      const shot = kind === 'puff' ? 'event' : (kind === 'stream' ? 'lanes-7' : (kind === 'zero' ? 'end' : kind));
      const marks = glideMarks(mode);
      const fieldAt = mode === 'pain'
        ? marks.horizonEnd
        : PROMO_GLIDE.layDownMs + PROMO_GLIDE.rampMs + PROMO_GLIDE.dissolveMs;
      const gridAt = {
        travel: 280,
        'lane-1': 280,
        event: 1900,
        mid: 3400,
        'lanes-3': 2600,
        'lanes-5': 4200,
        'lanes-7': 5400,
        'residue-10': 2600,
        'residue-20': 3400,
        'residue-100': 4800,
        'residue-full': 5600,
        texture: 5400,
        field: fieldAt + (mode === 'pain' ? 40 : 200),
        resolve: mode === 'pain' ? marks.fieldEnd - 40 : fieldAt + PROMO_GLIDE.fieldHoldMs + 280,
        white: fieldAt + (mode === 'pain' ? 40 : 200),
        caption: mode === 'pain' ? marks.captionHoldEnd - 80 : null,
      };
      if (gridAt[shot] != null) {
        this.paintGlideAt(gridAt[shot], mode);
        await this.whenGlideMediaReady();
      }
      if (shot === 'end') {
        if (mode === 'pain') this.paintGlideAt(marks.fieldEnd - 40, 'pain');
        this.setConveyorEnd(mode, ctaKey);
        this.root.classList.add('is-scale-white', 'is-scale-zero', 'is-grid-locked');
        this.clearGridResolve();
      }
      return this.whenPainRest(this.painHost());
    }

    paintFloodStill(warmth) {
      const root = this.root;
      document.documentElement.classList.add('is-promo-opening');
      document.documentElement.classList.remove('is-promo-pitch', 'is-promo-depart');
      root.classList.add('is-on', 'is-cleared', 'is-bursting');
      this.openPainStage();
      document.documentElement.style.setProperty('--ad-warmth', String(warmth));
      const label = root.querySelector('.promo-opening__choice--right');
      if (label) label.style.transition = 'none';
      root.querySelectorAll('.promo-opening__choice--left, .promo-opening__switch').forEach((node) => {
        node.style.transition = 'none';
        node.style.opacity = '0';
      });
      this.centerSwitchLabel();
      this.scaleSwitchLabel(2.25 + warmth * 2.35);
      this.pinLabelOrigin();
      const fill = root.querySelector('.promo-opening__fill--orange');
      if (fill) {
        fill.style.transition = 'none';
        fill.style.transform = `scale(${(warmth * 0.42).toFixed(3)})`;
      }
      return 160;
    }

    showPainExport(beat) {
      this.openPainStage();
      this.applyPainBeat(beat, false);
      const host = this.painHost();
      return this.whenPainRest(host);
    }

    showPainCloseAim() {
      this.openPainStage();
      this.applyPainBeat('answer-2', true);
      const store = this.painStore();
      const cursor = this.root.querySelector('[data-promo-pain-cursor]');
      const dot = store?.querySelector('[data-promo-window-close]');
      const aim = this.painCursorPoint(dot);
      if (cursor && aim) {
        cursor.hidden = false;
        cursor.style.transitionDuration = '0ms';
        cursor.style.setProperty('--pain-x', `${Math.round(aim.x)}px`);
        cursor.style.setProperty('--pain-y', `${Math.round(aim.y)}px`);
        cursor.style.opacity = '1';
      }
      this.pinWindowCloseOrigin();
      this.root.classList.add('is-window-aim');
      return this.whenPainRest(this.painHost());
    }

    showExportFrame(name) {
      this.clearPainTimers();
      if (!String(name).startsWith('pain-')) this.releasePainStage();
      releaseSpeechMouth();
      const root = this.root;
      const clock = root.querySelector('[data-promo-clock]');
      if (clock) clock.hidden = true;
      const html = document.documentElement;
      const center = root.querySelector('.promo-opening__center');
      const logo = root.querySelector('.promo-opening__logo');
      const line = this.line;
      const fromFace = root.querySelector('[data-promo-face-from]');
      const toFace = root.querySelector('[data-promo-face-to]');
      const fromWords = fromFace ? [...fromFace.querySelectorAll('[data-promo-from-word]')] : [];
      const toWords = toFace ? [...toFace.querySelectorAll('[data-promo-to-word]')] : [];

      const resetText = () => {
        this.resetSee();
        line?.classList.remove('is-revealing', 'is-striking', 'is-erasing', 'is-redefined', 'is-replaced');
        fromFace?.classList.remove('is-exiting');
        if (fromFace) {
          fromFace.style.visibility = '';
          fromFace.style.opacity = '';
        }
        if (toFace) {
          toFace.style.visibility = '';
          toFace.style.opacity = '';
        }
        fromWords.forEach((word) => {
          word.style.opacity = '';
          word.style.animation = 'none';
          word.style.transform = 'none';
        });
        toWords.forEach((word) => {
          word.classList.remove('is-in', 'is-out');
          word.style.opacity = '';
          word.style.animation = 'none';
          word.style.transform = '';
        });
      };

      const hideToggle = () => {
        if (!center) return;
        center.style.visibility = 'hidden';
        center.style.opacity = '0';
      };

      const showToggle = () => {
        if (!center) return;
        center.style.visibility = '';
        center.style.opacity = '';
      };

      const enterPitch = () => {
        document.documentElement.style.setProperty('--ad-warmth', '1');
        html.classList.add('is-promo-opening', 'is-promo-pitch', 'is-promo-clerk');
        root.classList.add('is-on', 'is-bursting', 'is-holding', 'is-pitch');
        root.classList.remove('is-logo-leaving', 'is-depart', 'is-moments');
        hideToggle();
        this.parkWidget();
        this.fitOpeningLayout();
        promoWidget.applyStoreLook(this.bizmisLook());
      };

      const hideCopy = () => {
        resetText();
        if (fromFace) fromFace.style.visibility = 'hidden';
        if (toFace) toFace.style.visibility = 'hidden';
        fromWords.forEach((word) => {
          word.style.opacity = '0';
        });
      };

      const showFromCount = (count) => {
        enterPitch();
        root.classList.add('is-logo-leaving');
        if (logo) {
          logo.style.opacity = '0';
          logo.style.visibility = 'hidden';
        }
        resetText();
        line?.classList.add('is-revealing');
        this.seatRevealPair();
        if (fromFace) {
          fromFace.style.visibility = 'visible';
          fromFace.style.opacity = '1';
        }
        if (toFace) {
          toFace.style.visibility = 'hidden';
          toFace.style.opacity = '0';
        }
        fromWords.forEach((word, index) => {
          word.style.opacity = index < count ? '1' : '0';
        });
      };

      const showHero = (index) => {
        enterPitch();
        root.classList.add('is-logo-leaving');
        if (logo) {
          logo.style.opacity = '0';
          logo.style.visibility = 'hidden';
        }
        resetText();
        line?.classList.add('is-replaced');
        if (fromFace) {
          fromFace.style.visibility = 'hidden';
          fromFace.style.opacity = '0';
        }
        if (toFace) {
          toFace.style.visibility = 'visible';
          toFace.style.opacity = '1';
        }
        toWords.forEach((word, wordIndex) => {
          word.classList.toggle('is-in', wordIndex === index);
          word.classList.toggle('is-out', wordIndex < index);
          word.style.opacity = wordIndex === index ? '1' : '0';
          word.style.transform = 'none';
          word.style.animation = 'none';
        });
      };

      const showSee = (phase) => {
        showHero(2);
        toWords.forEach((word) => {
          word.classList.remove('is-in');
          word.classList.add('is-out');
          word.style.opacity = '0';
        });
        root.classList.add('is-see', 'is-see-in');
        root.querySelectorAll('.promo-opening__see-word').forEach((word) => {
          word.style.animation = 'none';
          word.style.opacity = '1';
          word.style.filter = 'none';
          word.style.transform = 'none';
        });
        if (phase !== 'hero') root.classList.add('is-see-docked', 'is-see-row');
        if (phase === 'landed') root.classList.add('is-see-landed');
        if (phase !== 'hero') root.classList.add('is-see-wave');

        const midIndex = Math.min(2, Math.max(0, this.stores.length - 1));
        const highlight = phase === 'hero'
          ? -1
          : phase === 'row'
            ? 0
            : phase === 'roulette'
              ? midIndex
              : this.landIndex;
        const ask = promoVideoConfig.cta !== 'demo' && promoVideoConfig.cta !== 'none';
        if (phase === 'landed' && ask) {
          this.paintWave(-1, 0, 0);
          root.classList.add('is-see-cta', 'is-cta-aim');
        } else if (highlight >= 0) {
          const rising = phase === 'row';
          this.paintWave(highlight, rising ? 0.35 : 1, rising ? 0.18 : 0.5);
        }

        if (phase === 'hero') {
          root.classList.add('is-moments');
          promoWidget.applyStoreLook(this.bizmisLook());
        } else {
          root.classList.remove('is-moments');
          const store = this.stores[Math.min(highlight, this.stores.length - 1)];
          if (store) promoWidget.applyStoreLook(store);
        }
      };

      const rest = () => {
        html.classList.add('is-promo-opening');
        html.classList.remove('is-promo-pitch', 'is-promo-depart');
        root.classList.remove(
          'is-on',
          'is-cleared',
          'is-bursting',
          'is-holding',
          'is-pitch',
          'is-logo-docked',
          'is-logo-leaving',
          'is-depart',
          'is-moments'
        );
        showToggle();
        const toggle = root.querySelector('.promo-opening__toggle');
        if (toggle) {
          toggle.style.transition = '';
          toggle.style.opacity = '';
        }
        const label = root.querySelector('.promo-opening__choice--right');
        if (label) {
          label.style.transition = '';
          label.style.transform = '';
        }
        root.querySelectorAll('.promo-opening__choice--left, .promo-opening__switch').forEach((node) => {
          node.style.transition = '';
          node.style.opacity = '';
        });
        if (logo) {
          logo.style.opacity = '';
          logo.style.visibility = '';
        }
        resetText();
        document.documentElement.style.setProperty('--ad-warmth', '0');
      };

      const openMoments = () => {
        showHero(2);
        root.classList.add('is-moments');
        this.seatClerkInStore(true);
        setOpeningAvatarAction('idle_neutral');
        return this.momentStage();
      };

      const frames = {
        '01-toggle-rest': () => {
          rest();
          return 120;
        },
        '02-toggle-on': () => {
          rest();
          root.classList.add('is-on');
          return 120;
        },
        '02b-toggle-gone': () => {
          rest();
          root.classList.add('is-on', 'is-cleared');
          const label = root.querySelector('.promo-opening__choice--right');
          if (label) label.style.transition = 'none';
          root.querySelectorAll('.promo-opening__choice--left, .promo-opening__switch').forEach((node) => {
            node.style.transition = 'none';
            node.style.opacity = '0';
          });
          this.centerSwitchLabel();
          return 80;
        },
        '02c-switch-scaled': () => {
          rest();
          root.classList.add('is-on', 'is-cleared');
          const label = root.querySelector('.promo-opening__choice--right');
          if (label) label.style.transition = 'none';
          root.querySelectorAll('.promo-opening__choice--left, .promo-opening__switch').forEach((node) => {
            node.style.transition = 'none';
            node.style.opacity = '0';
          });
          this.centerSwitchLabel();
          this.scaleSwitchLabel(2.25);
          return 80;
        },
        '03a-flood-warmth-0': () => this.paintFloodStill(0),
        '03b-flood-warmth-05': () => this.paintFloodStill(0.5),
        '03c-flood-warmth-1': () => this.paintFloodStill(1),
        '03-orange-burst': () => {
          rest();
          root.classList.add('is-on', 'is-cleared', 'is-bursting', 'is-switch-white');
          const label = root.querySelector('.promo-opening__choice--right');
          if (label) label.style.transition = 'none';
          root.querySelectorAll('.promo-opening__choice-layer--hot').forEach((node) => {
            node.style.transition = 'none';
          });
          root.querySelectorAll('.promo-opening__choice--left, .promo-opening__switch').forEach((node) => {
            node.style.transition = 'none';
            node.style.opacity = '0';
          });
          this.centerSwitchLabel();
          this.scaleSwitchLabel(4.6);
          this.pinLabelOrigin();
          document.documentElement.style.setProperty('--ad-warmth', '1');
          const fill = root.querySelector('.promo-opening__fill--orange');
          if (fill) {
            fill.style.transition = 'none';
            fill.style.transform = 'scale(1)';
          }
          return 200;
        },
        '04-logo-docked': () => {
          enterPitch();
          root.classList.remove('is-logo-leaving');
          if (logo) {
            logo.style.opacity = '1';
            logo.style.visibility = 'visible';
          }
          hideCopy();
          this.fitOpeningLayout();
          return 240;
        },
        '05-logo-gone': () => {
          enterPitch();
          root.classList.add('is-logo-leaving');
          if (logo) {
            logo.style.opacity = '0';
            logo.style.visibility = 'hidden';
          }
          hideCopy();
          return 180;
        },
        '06-your': () => {
          showFromCount(1);
          return 180;
        },
        '07-your-store': () => {
          showFromCount(2);
          return 180;
        },
        '08-eyebrow': () => {
          showFromCount(4);
          return 180;
        },
        '11-built': () => {
          showHero(0);
          return 180;
        },
        '12-to': () => {
          showHero(1);
          return 180;
        },
        '13-sell': () => {
          showHero(2);
          return 180;
        },
        '14-sell-wave': () => {
          showHero(2);
          return 180;
        },
        '14b1-beat-1-grid': () => {
          const stage = openMoments();
          return playMomentPose(stage, 'grid');
        },
        '14b2-beat-1-shortlist': () => {
          const stage = openMoments();
          const board = restartMomentPose(stage, 'grid');
          return whenMomentsRest(stage).then(() => {
            board?.style.setProperty('--moment-scroll', `${momentCatalogSeek(board)}px`);
            board?.classList.add('is-catalog-seek', 'is-shortlist');
            return whenMomentsRest(stage);
          });
        },
        '14b3-beat-1-collapse': () => {
          const stage = openMoments();
          return scrubMoment(stage, 'row', (anim, span) => {
            const name = anim.animationName || '';
            if (name === 'promo-moments-select' || name === 'promo-moments-catalog-out') {
              return span.delay + span.duration * 0.45;
            }
            return 0;
          });
        },
        '14b4-beat-1-row': () => {
          const stage = openMoments();
          return playMomentPose(stage, 'row');
        },
        '14b5-beat-1-speech': () => {
          const stage = openMoments();
          return playMomentPose(stage, 'row').then(() => holdSpeechMouth());
        },
        '14c1-beat-2-hold': () => {
          const stage = openMoments();
          return playMomentPose(stage, 'row');
        },
        '14c2-beat-2-specs': () => {
          const stage = openMoments();
          return poseOnTimeline(stage, 'choice', (anim, span) => {
            const name = anim.animationName || '';
            if (name === 'promo-moments-tick' || name === 'promo-moments-ring' || name === 'promo-moments-pair-lift' || name === 'promo-moments-compare-fold' || name === 'promo-moments-add-reveal') return { time: 0 };
            return { time: span.delay + span.duration };
          });
        },
        '14c3-beat-2-ticked': () => {
          const stage = openMoments();
          return playChoiceUntilTicks(stage);
        },
        '14c4-beat-2-lifted': () => {
          const stage = openMoments();
          return playMomentPose(stage, 'choice');
        },
        '14c5-beat-2-speech': () => {
          const stage = openMoments();
          return playChoiceUntilTicks(stage).then(() => holdSpeechMouth());
        },
        '14d1-beat-3-hold': () => {
          const stage = openMoments();
          return playMomentPose(stage, 'choice');
        },
        '14d2-beat-3-doubt': () => {
          const stage = openMoments();
          return playMomentPose(stage, 'doubt');
        },
        '14d3-beat-3-vapor': () => {
          const stage = openMoments();
          return poseOnTimeline(stage, 'close', (anim, span) => {
            const name = anim.animationName || '';
            if (name === 'promo-moments-vapor' || name === 'promo-moments-vapor-bit') {
              return { time: span.delay + span.duration * 0.45 };
            }
            return { time: 0 };
          });
        },
        '14d4-beat-3-close': () => {
          const stage = openMoments();
          return playMomentPose(stage, 'close');
        },
        '14d5-beat-3-speech': () => {
          const stage = openMoments();
          return playMomentPose(stage, 'doubt').then(() => holdSpeechMouth());
        },
        '14e1-beat-4-hold': () => {
          const stage = openMoments();
          return playMomentPose(stage, 'close');
        },
        '14e2-beat-4-arriving': () => {
          const stage = openMoments();
          return poseOnTimeline(stage, 'extra', (anim, span) => {
            const name = anim.animationName || '';
            if (name === 'promo-moments-addon-in') return { time: span.delay + span.duration * 0.15 };
            if (name === 'promo-moments-plus-in') return { time: span.delay + span.duration };
            return { time: 0 };
          });
        },
        '14e3-beat-4-docked': () => {
          const stage = openMoments();
          return playMomentPose(stage, 'extra');
        },
        '14e4-beat-4-bundle': () => {
          const stage = openMoments();
          return playMomentPose(stage, 'bundle');
        },
        '14e5-beat-4-speech': () => {
          const stage = openMoments();
          return playMomentPose(stage, 'extra').then(() => holdSpeechMouth());
        },
        '14f1-moments-contract': () => {
          const stage = openMoments();
          return scrubMoment(stage, 'fly', () => 200).then(() => placeExportFly(stage, 0.2));
        },
        '14f2-moments-dot': () => {
          const stage = openMoments();
          return scrubMoment(stage, 'fly', () => 430).then(() => placeExportFly(stage, 0.62));
        },
        '14f3-moments-nod': () => {
          const stage = openMoments();
          setOpeningAvatarAction('nod');
          return playMomentPose(stage, 'gone');
        },
        '15-see-yourself': () => {
          showSee('hero');
          return Promise.resolve();
        },
        '16-see-stores': () => {
          showSee('row');
          return 180;
        },
        '17-see-roulette': () => {
          showSee('roulette');
          return 120;
        },
        '18-see-meridian': () => {
          showSee('landed');
          return 220;
        },
        'pain-a-grid': () => this.showPainExport('grid'),
        'pain-a-enter': () => this.showPainExport('enter'),
        'pain-a-open': () => this.showPainExport('open'),
        'pain-a-back': () => this.showPainExport('back'),
        'pain-a-scroll-1': () => this.showPainExport('scroll-1'),
        'pain-a-scroll-2': () => this.showPainExport('scroll-2'),
        'pain-a-scroll-3': () => this.showPainExport('scroll-3'),
        'pain-a-scroll-4': () => this.showPainExport('scroll-4'),
        'pain-a-scroll-up': () => this.showPainExport('scroll-4'),
        'pain-a-leave': () => this.showPainExport('leave'),
        'pain-b-launcher': () => this.showPainExport('launcher'),
        'pain-b-panel': () => this.showPainExport('panel'),
        'pain-b-typed-1': () => this.showPainExport('typed-1'),
        'pain-b-answer-1': () => this.showPainExport('answer-1'),
        'pain-b-typed-2': () => this.showPainExport('typed-2'),
        'pain-b-answer-2': () => this.showPainExport('answer-2'),
        'pain-c-travel': () => this.showScaleExport('lane-1', 'pain'),
        'pain-c-lane-1': () => this.showScaleExport('lane-1', 'pain'),
        'pain-c-event': () => this.showScaleExport('event', 'pain'),
        'pain-c-puff': () => this.showScaleExport('event', 'pain'),
        'pain-c-mid': () => this.showScaleExport('lanes-3', 'pain'),
        'pain-c-lanes-3': () => this.showScaleExport('lanes-3', 'pain'),
        'pain-c-lanes-5': () => this.showScaleExport('lanes-5', 'pain'),
        'pain-c-lanes-7': () => this.showScaleExport('lanes-7', 'pain'),
        'pain-c-texture': () => this.showScaleExport('texture', 'pain'),
        'pain-c-caption': () => this.showScaleExport('caption', 'pain'),
        'pain-c-field': () => this.showScaleExport('field', 'pain'),
        'pain-c-resolve': () => this.showScaleExport('resolve', 'pain'),
        'pain-c-residue-10': () => this.showScaleExport('lanes-5', 'pain'),
        'pain-c-residue-20': () => this.showScaleExport('lanes-5', 'pain'),
        'pain-c-residue-100': () => this.showScaleExport('lanes-7', 'pain'),
        'pain-c-residue-full': () => this.showScaleExport('lanes-7', 'pain'),
        'pain-c-stream': () => this.showScaleExport('lanes-7', 'pain'),
        'pain-c-white': () => this.showScaleExport('white', 'pain'),
        'pain-c-end': () => this.showScaleExport('end', 'pain'),
        'pain-c-zero': () => this.showScaleExport('end', 'pain'),
        'pitch-c-travel': () => this.showScaleExport('lane-1', 'pitch'),
        'pitch-c-lane-1': () => this.showScaleExport('lane-1', 'pitch'),
        'pitch-c-event': () => this.showScaleExport('event', 'pitch'),
        'pitch-c-mid': () => this.showScaleExport('lanes-3', 'pitch'),
        'pitch-c-lanes-3': () => this.showScaleExport('lanes-3', 'pitch'),
        'pitch-c-lanes-5': () => this.showScaleExport('lanes-5', 'pitch'),
        'pitch-c-lanes-7': () => this.showScaleExport('lanes-7', 'pitch'),
        'pitch-c-texture': () => this.showScaleExport('texture', 'pitch'),
        'pitch-c-field': () => this.showScaleExport('field', 'pitch'),
        'pitch-c-resolve': () => this.showScaleExport('resolve', 'pitch'),
        'pitch-c-residue-10': () => this.showScaleExport('lanes-5', 'pitch'),
        'pitch-c-residue-20': () => this.showScaleExport('lanes-5', 'pitch'),
        'pitch-c-residue-100': () => this.showScaleExport('lanes-7', 'pitch'),
        'pitch-c-residue-full': () => this.showScaleExport('lanes-7', 'pitch'),
        'pitch-c-white': () => this.showScaleExport('white', 'pitch'),
        'pitch-c-end': () => this.showScaleExport('end', 'pitch'),
        'pitch-c-end-demo': () => this.showScaleExport('end', 'pitch', 'demo'),
        'pitch-c-end-install': () => this.showScaleExport('end', 'pitch', 'install'),
        'pitch-c-end-ea': () => this.showScaleExport('end', 'pitch', 'ea'),
        'pitch-c-end-none': () => this.showScaleExport('end', 'pitch', 'none'),
        'end-card': () => this.showEndCardExport(promoVideoConfig.cta),
        'end-card-demo': () => this.showEndCardExport('demo'),
        'end-card-install': () => this.showEndCardExport('install'),
        'end-card-ea': () => this.showEndCardExport('ea'),
        'end-card-none': () => this.showEndCardExport('none'),
        'pain-c-aim': () => this.showPainCloseAim(),
        'pain-b-zoom': () => this.showPainExport('answer-2'),
      };

      const run = frames[name];
      if (!run) throw new Error(`Unknown promo opening frame: ${name}`);
      return run();
    }
  }

  class PromoCover {
    constructor(node, heroReveal, onReady) {
      this.node = node;
      this.heroReveal = heroReveal;
      this.onReady = onReady;
    }

    async start() {
      const img = document.querySelector('.hero__slide.is-active .hero__media img');
      if (img) img.loading = 'eager';
      await whenImageReady(img);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      if (prefersReducedMotion()) {
        this.finish();
        return;
      }

      await new Promise((resolve) => window.setTimeout(resolve, PROMO_COVER_HOLD_MS));
      this.revealPage();
      this.node.classList.add('is-fading');
      window.setTimeout(() => this.finish(), PROMO_COVER_FADE_MS);
    }

    revealPage() {
      this.node.classList.add('is-held');
      document.documentElement.classList.remove('is-promo-cover');
      document.documentElement.style.background = '';
      document.body.style.background = '';
    }

    finish() {
      this.dismiss();
      this.heroReveal?.begin();
      this.onReady?.();
    }

    dismiss() {
      this.node.remove();
      document.documentElement.classList.remove('is-promo-cover');
      document.documentElement.style.background = '';
      document.body.style.background = '';
    }
  }

  /* --- Cart Lock (prevents concurrent cart API mutations) --- */
  const cartLock = {
    _locked: false,
    _queue: [],
    async acquire() {
      if (!this._locked) { this._locked = true; return; }
      return new Promise(r => this._queue.push(r));
    },
    release() {
      if (this._queue.length > 0) this._queue.shift()();
      else this._locked = false;
    }
  };

  /* --- Cart Sync Bus (keeps drawer + page + header badge in sync) --- */
  const cartBus = {
    _listeners: [],
    on(fn) { this._listeners.push(fn); },
    emit(cart) {
      const badge = document.querySelector('[data-cart-count]');
      if (badge) {
        badge.textContent = cart.item_count;
        badge.style.display = cart.item_count > 0 ? '' : 'none';
      }
      this._listeners.forEach(fn => fn(cart));
    }
  };

  /* --- Cart Drawer --- */
  class CartDrawer {
    constructor() {
      this.drawer = document.querySelector('.cart-drawer');
      this.backdrop = document.querySelector('.cart-drawer__backdrop');
      if (!this.drawer) return;

      this.modal = this.drawer.querySelector('[data-remove-modal]');
      this.modalBackdrop = this.drawer.querySelector('[data-modal-backdrop]');
      this.pendingRemoveKey = null;
      this.debounceTimers = new Map();
      this.DEBOUNCE_MS = 400;

      this.bindEvents();
      this.bindCartItems();
      this.bindModal();
      cartBus.on(cart => this.refreshDrawer(cart));
    }

    bindEvents() {
      document.querySelectorAll('[data-cart-toggle]').forEach(btn => {
        btn.addEventListener('click', (e) => { e.preventDefault(); this.toggle(); });
      });
      this.bindCloseControls();
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (this.modal?.style.display !== 'none') { this.hideModal(); return; }
          if (this.isOpen()) this.close();
        }
      });
    }

    bindCloseControls() {
      if (this.backdrop) this.backdrop.addEventListener('click', () => this.close());
      this.drawer.querySelector('[data-cart-close]')?.addEventListener('click', () => this.close());
    }

    _itemId(el) {
      return (el.dataset.itemKey || el.dataset.variantId || '').trim();
    }

    bindCartItems() {
      this.drawer.querySelectorAll('[data-cart-item]').forEach(item => {
        const input = item.querySelector('[data-qty-input]');
        const minus = item.querySelector('[data-qty-minus]');
        const plus = item.querySelector('[data-qty-plus]');
        const remove = item.querySelector('[data-remove-item]');

        minus?.addEventListener('click', () => {
          const id = this._itemId(item);
          const val = parseInt(input.value, 10) - 1;
          if (val <= 0) { this.confirmRemove(id); return; }
          input.value = val;
          this.scheduleUpdate(id, val);
        });

        plus?.addEventListener('click', () => {
          const id = this._itemId(item);
          const val = Math.min(parseInt(input.value, 10) + 1, 99);
          input.value = val;
          this.scheduleUpdate(id, val);
        });

        input?.addEventListener('change', () => {
          const id = this._itemId(item);
          const val = parseInt(input.value, 10);
          if (isNaN(val) || val <= 0) { this.confirmRemove(id); input.value = 1; return; }
          input.value = Math.min(val, 99);
          this.scheduleUpdate(id, Math.min(val, 99));
        });

        remove?.addEventListener('click', () => this.confirmRemove(this._itemId(item)));
      });
    }

    bindModal() {
      this.drawer.querySelector('[data-modal-cancel]')?.addEventListener('click', () => this.hideModal());
      this.drawer.querySelector('[data-modal-confirm]')?.addEventListener('click', () => {
        if (this.pendingRemoveKey) this.removeItem(this.pendingRemoveKey);
        this.hideModal();
      });
      this.modalBackdrop?.addEventListener('click', () => this.hideModal());
    }

    confirmRemove(key) {
      this.pendingRemoveKey = key;
      if (this.modal) this.modal.style.display = '';
      if (this.modalBackdrop) this.modalBackdrop.style.display = '';
    }

    hideModal() {
      this.pendingRemoveKey = null;
      if (this.modal) this.modal.style.display = 'none';
      if (this.modalBackdrop) this.modalBackdrop.style.display = 'none';
    }

    removeItem(id) {
      const el = this.drawer.querySelector(`[data-item-key="${id}"]`)
        || this.drawer.querySelector(`[data-variant-id="${id}"]`);
      if (el) {
        el.style.transition = 'opacity 200ms ease, max-height 300ms ease';
        el.style.opacity = '0';
        el.style.maxHeight = el.offsetHeight + 'px';
        requestAnimationFrame(() => { el.style.maxHeight = '0'; el.style.overflow = 'hidden'; });
        setTimeout(() => el.remove(), 300);
      }

      const remaining = this.drawer.querySelectorAll('[data-cart-item]').length - 1;
      this.updateCartCount(remaining);

      this.updateCart(id, 0);
    }

    updateCartCount(count) {
      const title = this.drawer.querySelector('.cart-drawer__title');
      if (title) title.textContent = `${title.textContent.split('(')[0].trim()} (${count})`;
    }

    scheduleUpdate(key, quantity) {
      clearTimeout(this.debounceTimers.get(key));
      this.debounceTimers.set(key, setTimeout(() => this.updateCart(key, quantity), this.DEBOUNCE_MS));
    }

    async _cartChange(id, quantity) {
      const res = await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id, quantity })
      });
      const data = await res.json();
      if (data.items) return data;
      return null;
    }

    async updateCart(id, quantity) {
      await cartLock.acquire();
      try {
        let cart = await this._cartChange(id, quantity);
        if (!cart) {
          const freshCart = await (await fetch('/cart.js')).json();
          const match = freshCart.items?.find(i =>
            i.key === id || String(i.variant_id) === String(id)
          );
          if (match) cart = await this._cartChange(match.key, quantity);
        }
        if (cart) cartBus.emit(cart);
      } catch { /* network failure */ }
      finally { cartLock.release(); }
    }

    _findLineItem(cart, el) {
      const key = el.dataset.itemKey;
      const vid = el.dataset.variantId;
      return cart.items.find(i => i.key === key)
        || cart.items.find(i => String(i.key) === String(key))
        || cart.items.find(i => String(i.variant_id) === String(vid));
    }

    refreshDrawer(cart) {
      if (!this.drawer) return;
      this.updateCartCount(cart.item_count);

      if (cart.item_count === 0) {
        const items = this.drawer.querySelector('[data-cart-items]');
        const footer = this.drawer.querySelector('.cart-drawer__footer');
        const empty = this.drawer.querySelector('.cart-drawer__empty');
        if (items) items.remove();
        if (footer) footer.remove();
        if (empty) { empty.style.display = ''; }
        else {
          this.drawer.insertAdjacentHTML('beforeend',
            '<div class="cart-drawer__empty"><p>Your cart is empty</p><a href="/" class="btn btn--primary">Continue shopping</a></div>');
        }
        return;
      }

      this.drawer.querySelectorAll('[data-cart-item]').forEach(el => {
        const lineItem = this._findLineItem(cart, el);
        if (!lineItem) { el.remove(); return; }

        if (lineItem.key) el.dataset.itemKey = lineItem.key;

        const input = el.querySelector('[data-qty-input]');
        if (input) input.value = lineItem.quantity;

        const priceEl = el.querySelector('[data-line-price]');
        if (priceEl) {
          let html = formatMoney(lineItem.final_line_price);
          if (lineItem.original_line_price > lineItem.final_line_price) {
            html += ` <s class="cart-drawer__item-compare">${formatMoney(lineItem.original_line_price)}</s>`;
          }
          priceEl.innerHTML = html;
        }
      });

      const subtotalEl = this.drawer.querySelector('.cart-drawer__subtotal span:last-child');
      if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);

      const savingsEl = this.drawer.querySelector('.cart-drawer__savings');
      let totalSavings = 0;
      for (const item of cart.items) {
        if (item.original_line_price > item.final_line_price) {
          totalSavings += item.original_line_price - item.final_line_price;
        }
      }
      if (savingsEl) {
        if (totalSavings > 0) {
          savingsEl.style.display = '';
          const savingsAmt = savingsEl.querySelector('span:last-child');
          if (savingsAmt) savingsAmt.textContent = `-${formatMoney(totalSavings)}`;
        } else {
          savingsEl.style.display = 'none';
        }
      }
    }

    isOpen() { return this.drawer.classList.contains('is-open'); }

    open() {
      this.drawer.classList.add('is-open');
      this.backdrop?.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      this.drawer.querySelector('[data-cart-close]')?.focus();
    }

    close() {
      this.drawer.classList.remove('is-open');
      this.backdrop?.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    toggle() { this.isOpen() ? this.close() : this.open(); }

    async reload() {
      if (!this.drawer) return;
      try {
        const res = await fetch(window.location.pathname + window.location.search);
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const newDrawer = doc.querySelector('.cart-drawer');
        const newBackdrop = doc.querySelector('.cart-drawer__backdrop');
        if (!newDrawer) return;

        const wasOpen = this.isOpen();
        this.drawer.replaceWith(newDrawer);
        this.drawer = newDrawer;
        this.modal = this.drawer.querySelector('[data-remove-modal]');
        this.modalBackdrop = this.drawer.querySelector('[data-modal-backdrop]');
        this.bindCartItems();
        this.bindModal();

        if (newBackdrop) {
          if (this.backdrop) this.backdrop.replaceWith(newBackdrop);
          else document.body.prepend(newBackdrop);
          this.backdrop = newBackdrop;
        }
        this.bindCloseControls();
        if (wasOpen) this.open();
      } catch { /* keep existing drawer markup */ }
    }
  }

  /* --- Add to Cart (AJAX — stay on page, success feedback) --- */
  class AddToCart {
    constructor(cartDrawer) {
      this.cartDrawer = cartDrawer;
      this.SUCCESS_MS = 1800;
      this.PULSE_MS = 900;
      document.addEventListener('submit', (e) => {
        const form = e.target;
        if (!(form instanceof HTMLFormElement)) return;
        const action = form.getAttribute('action') || '';
        if (!action.includes('/cart/add')) return;
        e.preventDefault();
        this.submit(form);
      });
    }

    async submit(form) {
      const submitBtn = form.querySelector('[type="submit"]');
      const stickyBtn = document.querySelector('.pdp-sticky-bar .btn--primary:not([disabled])');
      if (submitBtn) submitBtn.disabled = true;
      if (stickyBtn) stickyBtn.disabled = true;

      try {
        await cartLock.acquire();
        const root = window.Shopify?.routes?.root || '/';
        const res = await fetch(`${root}cart/add.js`, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form)
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.description || data.message || 'Could not add to cart');
        }

        const cart = await (await fetch(`${root}cart.js`)).json();
        cartBus.emit(cart);
        this.playSuccess(submitBtn);
        if (stickyBtn && stickyBtn !== submitBtn) this.playSuccess(stickyBtn);
        this.pulseCartIcon();
        if (this.cartDrawer?.drawer) this.cartDrawer.reload();
      } catch (err) {
        window.alert(err.message || 'Could not add to cart');
        if (submitBtn) submitBtn.disabled = false;
        if (stickyBtn) stickyBtn.disabled = false;
      } finally {
        cartLock.release();
      }
    }

    playSuccess(btn) {
      if (!btn) return;
      clearTimeout(btn._addedTimer);
      const label = window.themeStrings?.addedToCart || 'Added to cart';
      const isIcon = btn.classList.contains('btn--icon');
      if (!btn.dataset.originalHtml) btn.dataset.originalHtml = btn.innerHTML;
      btn.classList.add('is-added-to-cart');
      btn.disabled = true;
      if (isIcon) {
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
      } else {
        btn.textContent = label;
      }
      btn._addedTimer = setTimeout(() => {
        btn.classList.remove('is-added-to-cart');
        btn.innerHTML = btn.dataset.originalHtml;
        delete btn.dataset.originalHtml;
        btn.disabled = false;
      }, this.SUCCESS_MS);
    }

    pulseCartIcon() {
      const toggle = document.querySelector('[data-cart-toggle]');
      const badge = document.querySelector('[data-cart-count]');
      if (!toggle) return;
      toggle.classList.remove('is-cart-pulse');
      badge?.classList.remove('is-cart-count-pop');
      void toggle.offsetWidth;
      toggle.classList.add('is-cart-pulse');
      badge?.classList.add('is-cart-count-pop');
      clearTimeout(this._pulseTimer);
      this._pulseTimer = setTimeout(() => {
        toggle.classList.remove('is-cart-pulse');
        badge?.classList.remove('is-cart-count-pop');
      }, this.PULSE_MS);
    }
  }

  /* --- Cart Page (AJAX qty updates for /cart) --- */
  class CartPage {
    constructor() {
      this.section = document.querySelector('.main-cart-section');
      this.form = this.section?.querySelector('[data-cart-form]');
      if (!this.form) return;

      this.debounceTimers = new Map();
      this.DEBOUNCE_MS = 500;
      this.bindInputs();
      cartBus.on(cart => this.refreshPage(cart));
    }

    _itemId(el) {
      return (el.dataset.itemKey || el.dataset.variantId || '').trim();
    }

    bindInputs() {
      this.form.querySelectorAll('[data-cart-page-item]').forEach(row => {
        const selector = row.querySelector('.qty-selector');
        const input = selector?.querySelector('[data-qty-input]');
        if (!input) return;

        const minus = selector.querySelector('[data-qty-minus]');
        const plus = selector.querySelector('[data-qty-plus]');

        minus?.addEventListener('click', (e) => {
          e.preventDefault();
          const val = Math.max(parseInt(input.value, 10) - 1, 0);
          input.value = val;
          this.scheduleUpdate(this._itemId(row), val);
        });

        plus?.addEventListener('click', (e) => {
          e.preventDefault();
          const val = Math.min(parseInt(input.value, 10) + 1, 99);
          input.value = val;
          this.scheduleUpdate(this._itemId(row), val);
        });

        input.addEventListener('change', () => {
          const val = Math.max(0, Math.min(parseInt(input.value, 10) || 0, 99));
          input.value = val;
          this.scheduleUpdate(this._itemId(row), val);
        });
      });
    }

    scheduleUpdate(id, quantity) {
      clearTimeout(this.debounceTimers.get(id));
      this.debounceTimers.set(id, setTimeout(() => this.updateItem(id, quantity), this.DEBOUNCE_MS));
    }

    async _cartChange(id, quantity) {
      const res = await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id, quantity })
      });
      const data = await res.json();
      if (data.items) return data;
      return null;
    }

    async updateItem(id, quantity) {
      await cartLock.acquire();
      try {
        let cart = await this._cartChange(id, quantity);
        if (!cart) {
          const freshCart = await (await fetch('/cart.js')).json();
          const match = freshCart.items?.find(i =>
            i.key === id || String(i.variant_id) === String(id)
          );
          if (match) cart = await this._cartChange(match.key, quantity);
        }
        if (cart) cartBus.emit(cart);
      } catch { /* network failure */ }
      finally { cartLock.release(); }
    }

    _findItem(cart, el) {
      const key = (el.dataset.itemKey || '').trim();
      const vid = (el.dataset.variantId || '').trim();
      return cart.items.find(i => i.key === key)
        || cart.items.find(i => String(i.key) === String(key))
        || cart.items.find(i => String(i.variant_id) === String(vid));
    }

    refreshPage(cart) {
      if (!this.form) return;
      if (cart.item_count === 0) {
        window.location.reload();
        return;
      }

      this.form.querySelectorAll('[data-cart-page-item]').forEach(row => {
        const lineItem = this._findItem(cart, row);
        if (!lineItem) { row.remove(); return; }

        if (lineItem.key) row.dataset.itemKey = lineItem.key;

        const input = row.querySelector('[data-qty-input]');
        if (input) input.value = lineItem.quantity;

        const totalEl = row.querySelector('[data-line-total]');
        if (totalEl) {
          let html = `<span style="font-weight: 700;">${formatMoney(lineItem.final_line_price)}</span>`;
          if (lineItem.original_line_price > lineItem.final_line_price) {
            html += `<br><s class="text-muted" style="font-size: 0.8125rem;">${formatMoney(lineItem.original_line_price)}</s>`;
          }
          totalEl.innerHTML = html;
        }
      });

      const subtotalEl = this.form.querySelector('[data-cart-page-subtotal]');
      if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);

      const savingsRow = this.form.querySelector('[data-cart-page-savings]');
      let totalSavings = 0;
      for (const item of cart.items) {
        if (item.original_line_price > item.final_line_price) {
          totalSavings += item.original_line_price - item.final_line_price;
        }
      }
      if (savingsRow) {
        if (totalSavings > 0) {
          savingsRow.style.display = '';
          const amt = savingsRow.querySelector('[data-savings-amount]');
          if (amt) amt.textContent = `-${formatMoney(totalSavings)}`;
        } else {
          savingsRow.style.display = 'none';
        }
      }
    }
  }

  /* --- Desktop Navigation (mega menus driven by menu links) --- */
  class DesktopNav {
    constructor() {
      this.header = document.querySelector('[data-header]');
      if (!this.header) return;

      this.megaItems = this.header.querySelectorAll('[data-nav-mega]');
      this.activeMega = null;
      this.hoverTimeout = null;
      this.leaveTimeout = null;

      this.bindMegaItems();
      this.bindHeaderLeave();
      this.bindKeyboard();
    }

    bindMegaItems() {
      this.megaItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
          clearTimeout(this.leaveTimeout);
          clearTimeout(this.hoverTimeout);
          this.hoverTimeout = setTimeout(() => this.showMega(item), 80);
        });

        item.addEventListener('mouseleave', () => {
          clearTimeout(this.hoverTimeout);
          this.leaveTimeout = setTimeout(() => this.hideMega(), 150);
        });

        const trigger = item.querySelector('.header__nav-link');
        trigger?.addEventListener('click', (e) => {
          if (window.innerWidth < 990) return;
          const isActive = item.classList.contains('is-mega-active');
          if (isActive) {
            this.hideMega();
          } else {
            e.preventDefault();
            this.showMega(item);
          }
        });
      });
    }

    bindHeaderLeave() {
      this.header.addEventListener('mouseleave', () => {
        clearTimeout(this.hoverTimeout);
        this.leaveTimeout = setTimeout(() => this.hideMega(), 200);
      });

      this.header.addEventListener('mouseenter', () => {
        clearTimeout(this.leaveTimeout);
      });
    }

    bindKeyboard() {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.activeMega) {
          const trigger = this.activeMega.querySelector('.header__nav-link');
          this.hideMega();
          trigger?.focus();
        }
      });
    }

    showMega(item) {
      if (this.activeMega && this.activeMega !== item) {
        this.setExpanded(this.activeMega, false);
      }
      this.setExpanded(item, true);
      this.activeMega = item;
    }

    hideMega() {
      if (this.activeMega) {
        this.setExpanded(this.activeMega, false);
        this.activeMega = null;
      }
    }

    setExpanded(item, expanded) {
      item.classList.toggle('is-mega-active', expanded);
      const trigger = item.querySelector('[aria-expanded]');
      if (trigger) trigger.setAttribute('aria-expanded', String(expanded));
    }
  }

  /* --- Nav overflow: move items that don't fit into "More" dropdown --- */
  class NavOverflow {
    constructor() {
      this.nav = document.querySelector('[data-header] .header__nav');
      this.list = document.querySelector('[data-nav-list]');
      if (!this.nav || !this.list) return;

      this.moreItem = this.list.querySelector('[data-more]');
      this.moreContent = this.list.querySelector('[data-more-content]');
      this.moreTrigger = this.list.querySelector('[data-more-trigger]');
      if (!this.moreItem || !this.moreContent || !this.moreTrigger) return;

      this.items = () => Array.from(this.list.querySelectorAll('[data-nav-item]:not([data-more])'));
      this.overflowClass = 'header__nav-item--overflow';
      this.moreActiveClass = 'header__nav-item--more-active';

      this.moreTrigger.addEventListener('click', (e) => {
        if (window.innerWidth < 990) return;
        e.preventDefault();
        this.toggleMore();
      });
      this.moreItem.addEventListener('mouseenter', () => this.openMore());
      this.moreItem.addEventListener('mouseleave', () => this.closeMore());
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.closeMore();
      });

      this.resizeObserver = new ResizeObserver(() => this.update());
      this.resizeObserver.observe(this.nav);
      this.update();
      // Re-measure once the web font is in: fallback-font widths at
      // DOMContentLoaded are narrower and skip the collapse.
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => this.update());
      }
      window.addEventListener('load', () => this.update());
    }

    update() {
      if (window.innerWidth < 990) {
        this.moreItem.setAttribute('aria-hidden', 'true');
        this.moreItem.classList.remove(this.moreActiveClass);
        this.items().forEach(el => el.classList.remove(this.overflowClass));
        return;
      }

      // Reveal everything before measuring: hidden items report 0 width.
      const itemEls = this.items();
      itemEls.forEach(el => el.classList.remove(this.overflowClass));
      this.moreItem.removeAttribute('aria-hidden');

      const listWidth = this.list.getBoundingClientRect().width;
      const moreWidth = this.moreItem.getBoundingClientRect().width;
      const available = listWidth - moreWidth - 8;

      let total = 0;
      let overflowStart = itemEls.length;

      for (let i = 0; i < itemEls.length; i++) {
        const w = itemEls[i].getBoundingClientRect().width;
        if (total + w > available) {
          overflowStart = i;
          break;
        }
        total += w;
      }

      if (overflowStart >= itemEls.length) {
        this.moreItem.setAttribute('aria-hidden', 'true');
        this.moreItem.classList.remove(this.moreActiveClass);
        this.moreContent.innerHTML = '';
        itemEls.forEach(el => el.classList.remove(this.overflowClass));
        return;
      }

      itemEls.forEach((el, i) => {
        el.classList.toggle(this.overflowClass, i >= overflowStart);
      });
      this.buildMoreContent(itemEls.slice(overflowStart));
      this.moreItem.removeAttribute('aria-hidden');
    }

    buildMoreContent(overflowItems) {
      const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const parts = [];
      overflowItems.forEach(item => {
        const link = item.querySelector('.header__nav-link');
        const tiles = item.querySelectorAll('.mega-menu__tile');
        const href = escape(link?.getAttribute('href') || '#');
        const title = escape(link?.textContent?.trim() || '');
        if (tiles.length > 0) {
          parts.push(`<div class="header__more-group"><a href="${href}" class="header__more-link header__more-link--parent">${title}</a>`);
          tiles.forEach(tile => {
            const tHref = escape(tile.getAttribute('href') || '#');
            const tTitle = escape(tile.querySelector('.mega-menu__tile-title')?.textContent?.trim() || tile.textContent?.trim() || '');
            parts.push(`<a href="${tHref}" class="header__more-link header__more-link--child" role="menuitem">${tTitle}</a>`);
          });
          parts.push('</div>');
        } else {
          parts.push(`<a href="${href}" class="header__more-link" role="menuitem">${title}</a>`);
        }
      });
      this.moreContent.innerHTML = parts.join('');
    }

    openMore() {
      if (this.moreContent.innerHTML) this.moreItem.classList.add(this.moreActiveClass);
      const trigger = this.moreTrigger;
      if (trigger) trigger.setAttribute('aria-expanded', 'true');
    }

    closeMore() {
      this.moreItem.classList.remove(this.moreActiveClass);
      const trigger = this.moreTrigger;
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    }

    toggleMore() {
      if (this.moreItem.classList.contains(this.moreActiveClass)) this.closeMore();
      else this.openMore();
    }
  }

  /* --- Support Dropdown --- */
  class SupportDropdown {
    constructor() {
      this.el = document.querySelector('[data-support-dropdown]');
      if (!this.el) return;

      this.timeout = null;

      this.el.addEventListener('mouseenter', () => {
        clearTimeout(this.timeout);
        this.el.classList.add('is-open');
      });

      this.el.addEventListener('mouseleave', () => {
        this.timeout = setTimeout(() => this.el.classList.remove('is-open'), 150);
      });

      this.el.querySelector('.header__support-trigger')?.addEventListener('click', () => {
        this.el.classList.toggle('is-open');
      });

      document.addEventListener('click', (e) => {
        if (!this.el.contains(e.target)) {
          this.el.classList.remove('is-open');
        }
      });
    }
  }

  /* --- Locale Selector --- */
  class LocaleSelector {
    constructor() {
      document.querySelectorAll('[data-locale-selector]').forEach(el => {
        const trigger = el.querySelector('.locale-selector__trigger');
        if (!trigger) return;

        trigger.addEventListener('click', (e) => {
          e.stopPropagation();
          document.querySelectorAll('[data-locale-selector].is-open').forEach(other => {
            if (other !== el) other.classList.remove('is-open');
          });
          const open = el.classList.toggle('is-open');
          trigger.setAttribute('aria-expanded', open);
          el.querySelector('.locale-selector__dropdown')?.setAttribute('aria-hidden', !open);
        });
      });

      document.addEventListener('click', () => {
        document.querySelectorAll('[data-locale-selector].is-open').forEach(el => {
          el.classList.remove('is-open');
          el.querySelector('.locale-selector__trigger')?.setAttribute('aria-expanded', 'false');
          el.querySelector('.locale-selector__dropdown')?.setAttribute('aria-hidden', 'true');
        });
      });
    }
  }

  /* --- Mobile Menu --- */
  class MobileMenu {
    constructor() {
      this.menu = document.querySelector('.mobile-menu');
      if (!this.menu) return;

      this.bindEvents();
      this.initAccordions();
    }

    bindEvents() {
      document.querySelectorAll('[data-menu-toggle]').forEach(btn => {
        btn.addEventListener('click', () => this.toggle());
      });

      this.menu.querySelector('[data-menu-close]')?.addEventListener('click', () => this.close());

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen()) this.close();
      });
    }

    initAccordions() {
      this.menu.querySelectorAll('[data-mobile-accordion-trigger]').forEach(trigger => {
        trigger.addEventListener('click', () => {
          const parent = trigger.closest('[data-mobile-accordion]');
          const content = parent?.querySelector('[data-mobile-accordion-content]');
          if (!content) return;

          const isOpen = trigger.getAttribute('aria-expanded') === 'true';
          trigger.setAttribute('aria-expanded', String(!isOpen));
          content.setAttribute('aria-hidden', String(isOpen));

          if (isOpen) {
            content.style.maxHeight = '0';
          } else {
            content.style.maxHeight = content.scrollHeight + 'px';
            this.updateParentHeights(content);
          }
        });
      });
    }

    updateParentHeights(el) {
      let parent = el.parentElement?.closest('[data-mobile-accordion-content]');
      while (parent) {
        parent.style.maxHeight = parent.scrollHeight + el.scrollHeight + 'px';
        parent = parent.parentElement?.closest('[data-mobile-accordion-content]');
      }
    }

    isOpen() {
      return this.menu.classList.contains('is-open');
    }

    open() {
      this.menu.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    close() {
      this.menu.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    toggle() {
      this.isOpen() ? this.close() : this.open();
    }
  }

  /* --- Search Overlay --- */
  class SearchOverlay {
    constructor() {
      this.overlay = document.querySelector('.search-overlay');
      if (!this.overlay) return;

      this.input = this.overlay.querySelector('.search-overlay__input');
      this.bindEvents();
    }

    bindEvents() {
      document.querySelectorAll('[data-search-toggle]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggle();
        });
      });

      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) this.close();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen()) this.close();
        if (e.key === '/' && !this.isOpen() && !isInputFocused()) {
          e.preventDefault();
          this.open();
        }
      });
    }

    isOpen() {
      return this.overlay.classList.contains('is-open');
    }

    open() {
      this.overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => this.input?.focus(), 100);
    }

    close() {
      this.overlay.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    toggle() {
      this.isOpen() ? this.close() : this.open();
    }
  }

  /* --- Tabs --- */
  class Tabs {
    constructor(container) {
      this.container = container;
      this.tabs = container.querySelectorAll('.tabs__tab');
      this.panels = container.querySelectorAll('.tabs__panel');

      this.tabs.forEach(tab => {
        tab.addEventListener('click', () => this.activate(tab.dataset.tab));
      });
    }

    activate(id) {
      this.tabs.forEach(t => t.classList.toggle('is-active', t.dataset.tab === id));
      this.panels.forEach(p => p.classList.toggle('is-active', p.dataset.panel === id));
    }
  }

  /* --- Accordion --- */
  class Accordion {
    constructor(container) {
      this.items = container.querySelectorAll('.accordion__item');

      this.items.forEach(item => {
        const trigger = item.querySelector('.accordion__trigger');
        const content = item.querySelector('.accordion__content');

        trigger?.addEventListener('click', () => {
          const isOpen = trigger.getAttribute('aria-expanded') === 'true';
          trigger.setAttribute('aria-expanded', !isOpen);
          content.setAttribute('aria-hidden', isOpen);

          if (!isOpen) {
            content.style.maxHeight = content.scrollHeight + 'px';
          } else {
            content.style.maxHeight = '0';
          }
        });
      });
    }
  }

  /* --- Product Gallery --- */
  class ProductGallery {
    constructor(container) {
      this.main = container.querySelector('.pdp__gallery-main img');
      this.thumbs = container.querySelectorAll('.pdp__gallery-thumb');

      this.thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
          this.thumbs.forEach(t => t.classList.remove('is-active'));
          thumb.classList.add('is-active');
          if (this.main) {
            this.main.src = thumb.querySelector('img').dataset.fullSrc || thumb.querySelector('img').src;
          }
        });
      });
    }
  }

  /* --- Quantity Selector --- */
  class QuantitySelector {
    constructor(container) {
      this.input = container.querySelector('input');
      const minus = container.querySelector('[data-qty-minus]');
      const plus = container.querySelector('[data-qty-plus]');

      minus?.addEventListener('click', () => this.update(-1));
      plus?.addEventListener('click', () => this.update(1));
    }

    update(delta) {
      const current = parseInt(this.input.value) || 1;
      const min = parseInt(this.input.min) || 1;
      const max = parseInt(this.input.max) || 99;
      this.input.value = Math.min(Math.max(current + delta, min), max);
      this.input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  /* --- Carousel --- */
  class Carousel {
    constructor(container) {
      this.track = container.querySelector('.carousel__track');
      if (!this.track) return;

      this.prevBtn = container.querySelector('[data-carousel-prev]');
      this.nextBtn = container.querySelector('[data-carousel-next]');

      this.prevBtn?.addEventListener('click', () => this.scroll(-1));
      this.nextBtn?.addEventListener('click', () => this.scroll(1));

      this.track.addEventListener('scroll', () => this.updateArrows(), { passive: true });
      this.updateArrows();

      this.initDrag();
    }

    scroll(direction) {
      const slide = this.track.querySelector('.carousel__slide');
      if (!slide) return;
      const gap = parseFloat(getComputedStyle(this.track).gap) || 16;
      this.track.scrollBy({ left: direction * (slide.offsetWidth + gap), behavior: 'smooth' });
    }

    updateArrows() {
      const { scrollLeft, scrollWidth, clientWidth } = this.track;
      const atStart = scrollLeft <= 2;
      const atEnd = scrollLeft + clientWidth >= scrollWidth - 2;
      if (this.prevBtn) this.prevBtn.classList.toggle('is-hidden', atStart);
      if (this.nextBtn) this.nextBtn.classList.toggle('is-hidden', atEnd);
    }

    initDrag() {
      const DRAG_THRESHOLD_PX = 8;
      const SNAP_THRESHOLD_PX = 30;
      let isPointerDown = false;
      let hasDragged = false;
      let startX = 0;
      let scrollStart = 0;
      let activePointerId = null;

      const endDrag = (e) => {
        if (!isPointerDown) return;
        isPointerDown = false;
        this.track.style.scrollSnapType = '';
        this.track.style.cursor = '';

        if (hasDragged && activePointerId != null) {
          try {
            this.track.releasePointerCapture(activePointerId);
          } catch (_) { /* already released */ }

          const dx = e.clientX - startX;
          if (Math.abs(dx) > SNAP_THRESHOLD_PX) {
            this.scroll(dx < 0 ? 1 : -1);
          }
        }

        activePointerId = null;
      };

      this.track.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        isPointerDown = true;
        hasDragged = false;
        startX = e.clientX;
        scrollStart = this.track.scrollLeft;
        activePointerId = e.pointerId;
      });

      this.track.addEventListener('pointermove', (e) => {
        if (!isPointerDown) return;

        const dx = e.clientX - startX;
        if (!hasDragged) {
          if (Math.abs(dx) < DRAG_THRESHOLD_PX) return;
          hasDragged = true;
          this.track.style.scrollSnapType = 'none';
          this.track.style.cursor = 'grabbing';
          this.track.setPointerCapture(e.pointerId);
        }

        this.track.scrollLeft = scrollStart - dx;
      });

      this.track.addEventListener('pointerup', endDrag);
      this.track.addEventListener('pointercancel', endDrag);

      // Only suppress link/button activation after a real drag, not on a tap/click.
      this.track.addEventListener('click', (e) => {
        if (hasDragged) {
          e.preventDefault();
          e.stopPropagation();
          hasDragged = false;
        }
      }, true);
    }
  }

  /* --- Sticky Header --- */
  /* Transparent over the hero, solid chrome once it scrolls past. On pages
     without a hero the header is just a solid sticky bar. */
  class StickyHeader {
    constructor() {
      this.header = document.querySelector('.header');
      if (!this.header) return;

      this.section = this.header.closest('.header-section');
      this.promo = document.querySelector('.announcement-bar-section');
      this.hero = document.querySelector('.hero-section');
      this.heroExitOffset = 100;
      this.scrollThreshold = 50;

      this.update = this.update.bind(this);
      this.update();
      window.addEventListener('scroll', this.update, { passive: true });
      window.addEventListener('resize', this.update, { passive: true });
    }

    update() {
      const scrollY = window.pageYOffset;

      if (this.hero) {
        const inHero = scrollY < this.hero.offsetHeight - this.heroExitOffset;
        if (this.section) this.section.classList.toggle('is-pinned', !inHero);
        if (this.promo) this.promo.classList.toggle('is-pinned', !inHero);
        this.header.classList.toggle('is-transparent', inHero);
        this.header.classList.toggle('scrolled', !inHero);
      } else {
        this.header.classList.toggle('scrolled', scrollY > this.scrollThreshold);
      }
    }
  }

  /* --- Bizmis voice demo (snippets/bizmis-voice-demo.liquid) ---
     Cycles the shopper "say this" prompts. The benefit pills hold steady across
     same-benefit slides while the sub-benefit + enabling feature fade in with
     each one, mirroring the coachmark. Pauses on hover so a prompt can be read. */
  class VoiceDemo {
    constructor(root) {
      this.root = root;
      this.slides = Array.from(root.querySelectorAll('[data-voice-demo-slide]'));
      if (!this.slides.length) return;

      const sceneScope = root.closest('[data-voice-demo-scope]') || document;
      this.scenes = Array.from(sceneScope.querySelectorAll('[data-voice-demo-scene]'));

      this.benefitPills = Array.from(root.querySelectorAll('[data-benefit-pill]'));
      this.subEl = root.querySelector('[data-voice-demo-sub]');
      this.featureEl = root.querySelector('[data-voice-demo-feature]');
      this.askEl = root.querySelector('[data-voice-demo-ask]');
      this.dotsWrap = root.querySelector('[data-voice-demo-dots]');
      this.index = 0;
      this.timer = null;
      this.paused = false;
      this.showMs = 3600;
      this.fadeMs = 600;
      this.gapMs = 250;
      this.wordMs = 340;
      this.askDelayMs = 550;
      this.wordTimers = [];

      this.show = this.show.bind(this);
      this.hide = this.hide.bind(this);
      this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.dots = this.buildDots();
      this.bindBenefitPills();

      this.show();

      if (!this.reduceMotion && this.slides.length > 1) {
        root.addEventListener('mouseenter', () => this.pause());
        root.addEventListener('mouseleave', () => this.resume());
      }
    }

    /* Benefit badges act as tabs: jump to the first sub-benefit of that branch. */
    bindBenefitPills() {
      this.benefitPills.forEach(pill => {
        pill.addEventListener('click', () => {
          const type = pill.getAttribute('data-benefit-pill');
          const idx = this.slides.findIndex(s => s.getAttribute('data-benefit-type') === type);
          if (idx >= 0) this.jumpTo(idx);
        });
      });
    }

    buildDots() {
      if (!this.dotsWrap) return [];
      return this.slides.map((slide, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'voice-demo__dot';
        dot.setAttribute('aria-label', `Show example ${i + 1} of ${this.slides.length}`);
        dot.addEventListener('click', () => this.jumpTo(i));
        this.dotsWrap.appendChild(dot);
        return dot;
      });
    }

    setScene(i) {
      if (!this.scenes.length) return;
      this.scenes.forEach((scene, k) => scene.classList.toggle('is-active', k === i));
    }

    updateDots(slide) {
      if (!this.dots.length) return;
      const isSupport = slide.getAttribute('data-benefit-type') === 'support';
      this.dots.forEach((dot, i) => {
        const active = i === this.index;
        dot.classList.toggle('is-active', active);
        dot.classList.toggle('is-support', active && isSupport);
      });
    }

    clearTimer() {
      if (this.timer) {
        window.clearTimeout(this.timer);
        this.timer = null;
      }
    }

    jumpTo(i) {
      if (i === this.index && this.timer) return;
      this.clearWordTimers();
      this.clearTimer();
      const current = this.slides[this.index];
      current.classList.remove('is-active');
      current.querySelectorAll('.voice-demo__word').forEach(w => w.classList.remove('is-current'));
      if (this.askEl) this.askEl.classList.remove('is-shown');
      if (this.subEl) this.subEl.classList.remove('is-shown');
      if (this.featureEl) this.featureEl.classList.remove('is-shown');
      this.index = i;
      this.paused = false;
      this.show();
    }

    showEyebrow(slide) {
      const sub = slide.getAttribute('data-sub') || '';
      const benefitType = slide.getAttribute('data-benefit-type');

      this.benefitPills.forEach(pill => {
        pill.classList.toggle('is-active', pill.getAttribute('data-benefit-pill') === benefitType);
      });

      if (this.subEl) {
        this.subEl.textContent = sub;
        this.subEl.hidden = !sub;
        this.subEl.classList.toggle('is-support', benefitType === 'support');
        this.subEl.classList.add('is-shown');
      }

      if (this.featureEl) {
        const feature = slide.getAttribute('data-feature') || '';
        this.featureEl.textContent = feature;
        this.featureEl.hidden = !feature;
        this.featureEl.classList.toggle('is-support', benefitType === 'support');
        this.featureEl.classList.add('is-shown');
      }
    }

    clearWordTimers() {
      this.wordTimers.forEach(t => window.clearTimeout(t));
      this.wordTimers = [];
    }

    /* Sweep the red highlight chip across the phrase one word at a time. */
    runKaraoke(words) {
      this.clearWordTimers();
      if (!words.length) return;

      const step = (i) => {
        words.forEach(w => w.classList.remove('is-current'));
        if (i >= words.length) return;
        words[i].classList.add('is-current');
        this.wordTimers.push(window.setTimeout(() => step(i + 1), this.wordMs));
      };
      step(0);
    }

    /* Staggered reveal: the outcome (sub-benefit + feature) lands first, then
       the ask ("Just say" + use case phrase) follows and the karaoke starts. */
    show() {
      this.clearTimer();
      const slide = this.slides[this.index];
      this.showEyebrow(slide);
      this.updateDots(slide);
      this.setScene(this.index);
      this.slides.forEach(s => s.classList.remove('is-active'));
      if (this.askEl) this.askEl.classList.remove('is-shown');

      const revealAsk = () => {
        slide.classList.add('is-active');
        if (this.askEl) this.askEl.classList.add('is-shown');
        const words = slide.querySelectorAll('.voice-demo__word');
        this.runKaraoke(words);
        const dwell = Math.max(this.showMs, words.length * this.wordMs + 1400);
        if (!this.reduceMotion && this.slides.length > 1) {
          this.timer = window.setTimeout(this.hide, dwell);
        }
      };

      if (this.reduceMotion) {
        revealAsk();
      } else {
        this.timer = window.setTimeout(revealAsk, this.askDelayMs);
      }
    }

    hide() {
      if (this.paused) return;
      this.clearWordTimers();
      this.clearTimer();
      const current = this.slides[this.index];
      current.querySelectorAll('.voice-demo__word').forEach(w => w.classList.remove('is-current'));
      current.classList.remove('is-active');
      if (this.askEl) this.askEl.classList.remove('is-shown');
      if (this.subEl) this.subEl.classList.remove('is-shown');
      if (this.featureEl) this.featureEl.classList.remove('is-shown');

      this.timer = window.setTimeout(() => {
        this.timer = null;
        if (this.paused) return;
        this.index = (this.index + 1) % this.slides.length;
        this.show();
      }, this.fadeMs + this.gapMs);
    }

    /* Pause/resume always restart the current slide cleanly so the rotation can
       never get stranded mid-fade with no active slide. */
    pause() {
      this.paused = true;
      this.clearWordTimers();
      this.clearTimer();
    }

    resume() {
      if (!this.paused) return;
      this.paused = false;
      this.show();
    }
  }

  /* --- Variant Selector --- */
  class VariantSelector {
    constructor(container) {
      this.form = container;
      this.idInput = container.querySelector('[data-variant-id-input]');
      this.variants = JSON.parse(
        (container.querySelector('[data-product-variants]') || {}).textContent || '[]'
      );
      this.pills = container.querySelectorAll('.variant-pill');
      this.priceEl = document.querySelector('.pdp__price');
      this.compareEl = document.querySelector('.pdp__compare-price');
      this.badgeEl = document.querySelector('.pdp__price-row .badge--sale');
      this.addBtn = container.querySelector('[type="submit"]');
      this.mainImage = document.getElementById('pdp-main-image');
      this.stickyPrice = document.querySelector('[data-sticky-price]');
      this.stickyCompare = document.querySelector('[data-sticky-compare]');
      this.stickyBadge = document.querySelector('[data-sticky-badge]');

      this.initFromUrl();
      this.pills.forEach(pill => pill.addEventListener('click', () => this.onPillClick(pill)));
      this.interceptProductLinkClicks();
    }

    initFromUrl() {
      const params = new URLSearchParams(window.location.search);

      const variantId = parseInt(params.get('variant'), 10);
      if (variantId) {
        const variant = this.variants.find(v => v.id === variantId);
        if (variant) {
          this.selectVariantPills(variant);
          this.updateVariant(variant);
          return;
        }
      }

      const size = params.get('size');
      if (size && this.variants.length > 0) {
        const variant = this.variants.find(v =>
          v.available && v.options.some(o => o === size)
        ) || this.variants.find(v => v.options.some(o => o === size));
        if (variant) {
          this.selectVariantPills(variant);
          this.updateVariant(variant);
        }
      }
    }

    selectVariantPills(variant) {
      const groups = this.form.querySelectorAll('.pdp__variants');
      let optionIdx = 0;
      groups.forEach(group => {
        if (group.querySelector('[data-product-link-group]')) return;
        const targetValue = variant.options[optionIdx];
        if (targetValue) {
          group.querySelectorAll('.variant-pill').forEach(p => {
            p.classList.toggle('is-active', p.dataset.optionValue === targetValue);
          });
        }
        optionIdx++;
      });
    }

    interceptProductLinkClicks() {
      const links = this.form.querySelectorAll('[data-product-link]');
      links.forEach(link => {
        link.addEventListener('click', (e) => {
          const activeOption = this.getSelectedNonLinkOption();
          if (!activeOption) return;
          e.preventDefault();
          const url = new URL(link.href, window.location.origin);
          url.searchParams.set('size', activeOption);
          window.location.href = url.toString();
        });
      });
    }

    getSelectedNonLinkOption() {
      const groups = this.form.querySelectorAll('.pdp__variants');
      for (const group of groups) {
        if (group.querySelector('[data-product-link-group]')) continue;
        const active = group.querySelector('.variant-pill.is-active');
        if (active) return active.dataset.optionValue;
      }
      return null;
    }

    onPillClick(pill) {
      const group = pill.closest('.pdp__variants');
      group.querySelectorAll('.variant-pill').forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');

      const selectedOptions = [];
      this.form.querySelectorAll('.pdp__variants').forEach(g => {
        const active = g.querySelector('.variant-pill.is-active');
        if (active) selectedOptions.push(active.dataset.optionValue);
      });

      const variant = this.variants.find(v =>
        v.options.length === selectedOptions.length &&
        v.options.every((opt, i) => opt === selectedOptions[i])
      );

      if (variant) this.updateVariant(variant);
    }

    updateVariant(variant) {
      if (this.idInput) this.idInput.value = variant.id;

      const url = new URL(window.location);
      url.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', url);

      let onSale = variant.compare_at_price && variant.compare_at_price > variant.price;
      let displayPrice = variant.price_formatted;
      let strikePrice = variant.compare_at_price_formatted;
      let salePct = 0;

      if (onSale) {
        salePct = Math.round((variant.compare_at_price - variant.price) / variant.compare_at_price * 100);
      }

      if (this.priceEl) {
        this.priceEl.textContent = displayPrice;
        this.priceEl.classList.toggle('pdp__price--sale', onSale);
      }
      if (this.compareEl) {
        this.compareEl.textContent = onSale ? strikePrice : '';
        this.compareEl.style.display = onSale ? '' : 'none';
      }
      if (this.badgeEl) {
        this.badgeEl.textContent = onSale ? `-${salePct}%` : '';
        this.badgeEl.style.display = onSale ? '' : 'none';
      }

      if (this.addBtn) {
        if (variant.available) {
          this.addBtn.disabled = false;
          this.addBtn.textContent = this.addBtn.dataset.addText || 'Add to Cart';
        } else {
          this.addBtn.disabled = true;
          this.addBtn.textContent = 'Sold Out';
        }
      }

      if (this.stickyPrice) this.stickyPrice.textContent = displayPrice;
      if (this.stickyCompare) {
        this.stickyCompare.textContent = onSale ? strikePrice : '';
        this.stickyCompare.style.display = onSale ? '' : 'none';
      }
      if (this.stickyBadge) {
        this.stickyBadge.textContent = onSale ? `-${salePct}%` : '';
        this.stickyBadge.style.display = onSale ? '' : 'none';
      }

      if (variant.featured_image && this.mainImage) {
        this.mainImage.src = variant.featured_image;
      }
    }
  }

  /* --- Collection Filters --- */
  class CollectionFilters {
    constructor() {
      this.section = document.querySelector('[data-collection-section]');
      if (!this.section) return;

      this.drawer = this.section.querySelector('[data-filter-drawer]');
      this.overlay = this.section.querySelector('[data-filter-overlay]');
      this.form = this.section.querySelector('[data-filter-form]');
      this.productsContainer = this.section.querySelector('[data-collection-products]');
      this.badgesContainer = this.section.querySelector('[data-filter-badges]');
      this.sortSelect = this.section.querySelector('#sort-by');
      this.sectionId = this.section.dataset.sectionId;

      this.debounceTimer = null;
      this.bindEvents();
    }

    bindEvents() {
      this.section.querySelectorAll('[data-filter-toggle]').forEach(btn =>
        btn.addEventListener('click', () => this.openDrawer())
      );
      this.section.querySelector('[data-filter-close]')?.addEventListener('click', () => this.closeDrawer());
      this.overlay?.addEventListener('click', () => this.closeDrawer());

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.drawer?.classList.contains('is-open')) this.closeDrawer();
      });

      this.form?.addEventListener('change', () => this.onFilterChange());

      this.section.querySelectorAll('[data-filter-remove]').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.applyUrl(link.href);
        });
      });

      this.section.querySelector('[data-filter-clear]')?.addEventListener('click', (e) => {
        e.preventDefault();
        this.applyUrl(e.currentTarget.href);
        this.closeDrawer();
      });

      this.sortSelect?.addEventListener('change', () => {
        const url = new URL(window.location.href);
        url.searchParams.set('sort_by', this.sortSelect.value);
        this.applyUrl(url.toString());
      });

      this.section.querySelectorAll('[data-price-min], [data-price-max]').forEach(input => {
        input.addEventListener('change', () => this.onFilterChange());
      });
    }

    openDrawer() {
      this.drawer?.classList.add('is-open');
      this.overlay?.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    closeDrawer() {
      this.drawer?.classList.remove('is-open');
      this.overlay?.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    onFilterChange() {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        const formData = new FormData(this.form);
        const url = new URL(window.location.href);

        const filterParams = Array.from(url.searchParams.entries())
          .filter(([key]) => key.startsWith('filter.') || key === 'page');
        filterParams.forEach(([key]) => url.searchParams.delete(key));

        for (const [key, value] of formData.entries()) {
          if (value !== '') url.searchParams.append(key, value);
        }

        url.searchParams.delete('page');
        this.applyUrl(url.toString());
      }, 300);
    }

    async applyUrl(urlString) {
      const url = new URL(urlString);
      url.searchParams.set('sections', this.sectionId);

      history.replaceState({}, '', urlString);
      this.section.classList.add('is-loading');

      try {
        const res = await fetch(url.toString());
        const data = await res.json();
        const html = data[this.sectionId];
        if (!html) return;

        const doc = new DOMParser().parseFromString(html, 'text/html');

        const newProducts = doc.querySelector('[data-collection-products]');
        if (newProducts && this.productsContainer) {
          this.productsContainer.innerHTML = newProducts.innerHTML;
        }

        const newBadges = doc.querySelector('[data-filter-badges]');
        if (newBadges && this.badgesContainer) {
          this.badgesContainer.innerHTML = newBadges.innerHTML;
          this.badgesContainer.querySelectorAll('[data-filter-remove]').forEach(link => {
            link.addEventListener('click', (e) => {
              e.preventDefault();
              this.applyUrl(link.href);
            });
          });
        }

        const newForm = doc.querySelector('[data-filter-form]');
        if (newForm && this.form) {
          this.form.innerHTML = newForm.innerHTML;
          this.section.querySelectorAll('[data-price-min], [data-price-max]').forEach(input => {
            input.addEventListener('change', () => this.onFilterChange());
          });
        }

        const newCount = doc.querySelector('[data-products-count]');
        const currentCount = this.section.querySelector('[data-products-count]');
        if (newCount && currentCount) {
          currentCount.textContent = newCount.textContent;
        }

        const newSort = doc.querySelector('#sort-by');
        if (newSort && this.sortSelect) {
          this.sortSelect.value = newSort.value;
        }
      } catch {
        window.location = urlString;
      } finally {
        this.section.classList.remove('is-loading');
      }
    }
  }

  /* --- Search Infinite Scroll --- */
  class SearchInfiniteScroll {
    constructor() {
      this.section = document.querySelector('[data-search-section]');
      if (!this.section) return;

      this.grid = this.section.querySelector('[data-search-results]');
      this.sentinel = this.section.querySelector('[data-search-load-more]');
      if (!this.grid || !this.sentinel) return;

      this.loading = false;
      this.observer = new IntersectionObserver(
        (entries) => {
          if (this.loading) return;
          if (entries[0].isIntersecting) this.loadNext();
        },
        { rootMargin: '200px', threshold: 0 }
      );
      this.observer.observe(this.sentinel);
    }

    getFetchUrl() {
      const nextUrl = this.sentinel.dataset.nextUrl;
      if (!nextUrl) return null;
      const sectionId = this.section.dataset.sectionId;
      if (!sectionId) return null;
      const sep = nextUrl.includes('?') ? '&' : '?';
      const base = window.Shopify?.routes?.root ?? '/';
      const path = nextUrl.startsWith('/') ? nextUrl : base + nextUrl;
      return `${path}${sep}sections=${encodeURIComponent(sectionId)}`;
    }

    async loadNext() {
      const url = this.getFetchUrl();
      if (!url) return;

      this.loading = true;
      this.sentinel.classList.add('is-loading');

      try {
        const res = await fetch(url);
        const data = await res.json();
        const sectionId = this.section.dataset.sectionId;
        const html = data[sectionId];
        if (!html) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newGrid = doc.querySelector('[data-search-results]');
        const newSentinel = doc.querySelector('[data-search-load-more]');

        if (newGrid) {
          while (newGrid.firstChild) {
            this.grid.appendChild(newGrid.firstChild);
          }
        }

        if (newSentinel?.dataset.nextUrl) {
          this.sentinel.dataset.nextUrl = newSentinel.dataset.nextUrl;
        } else {
          this.sentinel.remove();
          this.observer.disconnect();
        }
      } catch {
        this.sentinel.classList.remove('is-loading');
      } finally {
        this.loading = false;
        this.sentinel.classList.remove('is-loading');
      }
    }
  }

  /* --- Helpers --- */
  function isInputFocused() {
    const el = document.activeElement;
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
  }

  /* --- Hero Slideshow --- */
  class HeroSlideshow {
    constructor(el) {
      this.el = el;
      this.slides = el.querySelectorAll('[data-hero-slide]');
      this.dots = el.querySelectorAll('[data-hero-dot]');
      this.current = 0;
      this.total = this.slides.length;
      this.interval = parseInt(el.dataset.autoplayInterval, 10) || 6000;
      this.timer = null;
      this.paused = false;

      if (this.total <= 1) return;

      this.bindControls();
      this.startAutoplay();
    }

    bindControls() {
      this.el.querySelector('[data-hero-prev]')?.addEventListener('click', () => this.prev());
      this.el.querySelector('[data-hero-next]')?.addEventListener('click', () => this.next());
      this.dots.forEach(dot => {
        dot.addEventListener('click', () => this.goTo(parseInt(dot.dataset.heroDot, 10)));
      });

      // No hover pause: the hero is fullscreen, so the cursor is almost always
      // over it and pausing made the slideshow look stuck. Focus pause stays
      // so keyboard users can operate the controls.
      this.el.addEventListener('focusin', () => this.pause());
      this.el.addEventListener('focusout', () => this.resume());

      this.bindSwipe();
    }

    // Touch devices hide the nav pill (base.css), so a horizontal swipe is
    // the way to change slides there.
    bindSwipe() {
      const SWIPE_MIN_PX = 48;
      let startX = null;
      let startY = null;

      this.el.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }, { passive: true });

      this.el.addEventListener('touchend', (e) => {
        if (startX === null) return;
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        startX = null;
        startY = null;
        // Mostly-horizontal gestures only; let vertical scrolling through.
        if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < Math.abs(dy)) return;
        if (dx < 0) this.next(); else this.prev();
      }, { passive: true });
    }

    goTo(index) {
      if (index === this.current) return;
      this.slides[this.current].classList.remove('is-active');
      this.dots[this.current]?.classList.remove('is-active');
      this.current = (index + this.total) % this.total;
      this.slides[this.current].classList.add('is-active');
      this.dots[this.current]?.classList.add('is-active');
      this.resetAutoplay();
    }

    next() { this.goTo(this.current + 1); }
    prev() { this.goTo(this.current - 1); }

    startAutoplay() {
      this.timer = setInterval(() => {
        if (!this.paused) this.next();
      }, this.interval);
    }

    resetAutoplay() {
      clearInterval(this.timer);
      this.startAutoplay();
    }

    pause() { this.paused = true; }
    resume() { this.paused = false; }
  }

  /* --- Hero copy intro ---
     Word-by-word fade on the shared overlay: eyebrow, then headline, then
     the red line. The underline paints after the last red-line word lands.
     Starts once the page loader is out of the way. */
  const HERO_WORD_STAGGER_MS = 150;
  const HERO_LINE_PAUSE_MS = 420;
  const HERO_REDEFINE_HOLD_MS = 640;
  const HERO_REDEFINE_STRIKE_MS = 640;
  const HERO_REDEFINE_STRIKE_HOLD_MS = 260;
  const HERO_REDEFINE_MORPH_MS = 920;
  const HERO_REDEFINE_SETTLE_MS = 280;
  const HERO_REDEFINE_TOTAL_MS =
    HERO_REDEFINE_HOLD_MS
    + HERO_REDEFINE_STRIKE_MS
    + HERO_REDEFINE_STRIKE_HOLD_MS
    + HERO_REDEFINE_MORPH_MS
    + HERO_REDEFINE_SETTLE_MS;
  const HERO_LINE_UNDERLINE_MS = 400;

  class HeroCopyReveal {
    constructor(slideshow) {
      this.root = slideshow.querySelector('.hero__content');
      this.cta = null;
      this.titleLine = null;
      this.underlineAt = 0;
      this.redefineAt = 0;
      this.started = false;
      if (!this.root) return;
      requestAnimationFrame(() => this.prepare());
    }

    prepare() {
      this.cta = this.root.querySelector('.hero__title-cta');
      this.titleLine = this.root.querySelector('.hero__title-line');
      const intro = [
        this.root.querySelector('.hero__subtitle'),
        this.titleLine
      ].filter(Boolean);

      if (!intro.length && !this.cta) return;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        if (this.cta) {
          this.ensureCtaInk(this.cta);
          this.wrapWords(this.cta.querySelector('.hero__title-cta-ink') || this.cta);
        }
        this.titleLine?.classList.add('is-redefined');
        this.root.classList.add('is-hero-animated');
        this.root.classList.add('is-revealing');
        this.groupCtaLines();
        this.cta?.classList.add('is-underlined');
        this.cta?.querySelectorAll('.hero__title-cta-line').forEach((line) => {
          line.classList.add('is-underlined');
        });
        return;
      }

      intro.forEach((line) => this.wrapWords(line));
      if (this.cta) {
        this.ensureCtaInk(this.cta);
        this.wrapWords(this.cta.querySelector('.hero__title-cta-ink') || this.cta);
      }

      let delay = 140;
      intro.forEach((line) => {
        const words = line.querySelectorAll('.hero__word');
        words.forEach((word, wordIndex) => {
          word.style.animationDelay = `${delay + wordIndex * HERO_WORD_STAGGER_MS}ms`;
        });
        const lineEnd = delay + Math.max(words.length - 1, 0) * HERO_WORD_STAGGER_MS;
        delay = lineEnd + HERO_WORD_STAGGER_MS + HERO_LINE_PAUSE_MS;
      });

      if (this.titleLine?.hasAttribute('data-hero-redefine')) {
        const titleEnd = delay - HERO_WORD_STAGGER_MS - HERO_LINE_PAUSE_MS;
        this.redefineAt = titleEnd + HERO_REDEFINE_HOLD_MS;
        delay = titleEnd + HERO_REDEFINE_TOTAL_MS + HERO_LINE_PAUSE_MS;
      }

      if (this.cta) {
        const words = this.cta.querySelectorAll('.hero__word');
        words.forEach((word, wordIndex) => {
          word.style.animationDelay = `${delay + wordIndex * HERO_WORD_STAGGER_MS}ms`;
        });
        const lineEnd = delay + Math.max(words.length - 1, 0) * HERO_WORD_STAGGER_MS;
        this.underlineAt = lineEnd + 280;
      }

      this.root.classList.add('is-hero-animated');
      requestAnimationFrame(() => this.groupCtaLines());
      this.armStart();
    }

    wrapWords(el) {
      const existing = el.querySelectorAll('.hero__word');
      if (existing.length) {
        existing.forEach((word) => word.setAttribute('aria-hidden', 'true'));
        return existing.length;
      }

      const text = el.textContent.replace(/\s+/g, ' ').trim();
      if (!text) return 0;

      el.setAttribute('aria-label', text);
      el.textContent = '';

      const words = text.split(' ');
      words.forEach((word, index) => {
        const span = document.createElement('span');
        span.className = 'hero__word';
        span.textContent = word;
        span.setAttribute('aria-hidden', 'true');
        el.appendChild(span);
        if (index < words.length - 1) el.appendChild(document.createTextNode(' '));
      });

      return words.length;
    }

    ensureCtaInk(el) {
      if (!el || el.querySelector(':scope > .hero__title-cta-ink')) return;
      const ink = document.createElement('span');
      ink.className = 'hero__title-cta-ink';
      while (el.firstChild) ink.appendChild(el.firstChild);
      el.appendChild(ink);
    }

    groupCtaLines() {
      const ink = this.cta?.querySelector('.hero__title-cta-ink');
      if (!ink || ink.querySelector('.hero__title-cta-line')) return;

      const words = [...ink.querySelectorAll('.hero__word')];
      if (!words.length) return;

      const buckets = [];
      words.forEach((word, index) => {
        const top = Math.round(word.getBoundingClientRect().top);
        let bucket = buckets.find((entry) => Math.abs(entry.top - top) < 6);
        if (!bucket) {
          bucket = { top, nodes: [] };
          buckets.push(bucket);
        }
        bucket.nodes.push(word);
        const nextWord = words[index + 1];
        const space = word.nextSibling;
        if (
          nextWord
          && space
          && space.nodeType === Node.TEXT_NODE
          && Math.abs(Math.round(nextWord.getBoundingClientRect().top) - top) < 6
        ) {
          bucket.nodes.push(space);
        }
      });

      buckets.forEach((bucket) => {
        const line = document.createElement('span');
        line.className = 'hero__title-cta-line';
        bucket.nodes[0].parentNode.insertBefore(line, bucket.nodes[0]);
        bucket.nodes.forEach((node) => line.appendChild(node));
        const rule = document.createElement('span');
        rule.className = 'hero__title-cta-rule';
        rule.setAttribute('aria-hidden', 'true');
        line.appendChild(rule);
      });
    }

    playCtaUnderline() {
      if (!this.cta) return;
      this.groupCtaLines();
      this.cta.classList.add('is-underlined');
      const lines = [...this.cta.querySelectorAll('.hero__title-cta-line')];
      lines.forEach((line, index) => {
        window.setTimeout(() => line.classList.add('is-underlined'), index * HERO_LINE_UNDERLINE_MS);
      });
    }

    playRedefine(line) {
      if (!line || line.classList.contains('is-redefined')) return;

      const from = line.querySelector('.hero__redefine-from');
      const to = line.querySelector('.hero__redefine-to');
      if (!from || !to) {
        line.classList.add('is-redefined');
        return;
      }

      from.style.width = `${from.getBoundingClientRect().width}px`;
      to.style.width = '0px';
      line.classList.add('is-striking');

      const morphAt = HERO_REDEFINE_STRIKE_MS + HERO_REDEFINE_STRIKE_HOLD_MS;
      window.setTimeout(() => {
        const nextWidth = to.scrollWidth;
        line.classList.add('is-erasing', 'is-redefined');
        from.style.width = '0px';
        to.style.width = `${nextWidth}px`;
      }, morphAt);

      window.setTimeout(() => {
        line.classList.remove('is-striking', 'is-erasing');
        from.style.width = '';
        to.style.width = '';
      }, morphAt + HERO_REDEFINE_MORPH_MS);
    }

    begin() {
      if (this.started) return;
      this.started = true;
      this.root.classList.add('is-revealing');
      if (this.cta) {
        window.setTimeout(() => this.playCtaUnderline(), this.underlineAt);
      }
      if (this.redefineAt) {
        window.setTimeout(() => this.playRedefine(this.titleLine), this.redefineAt);
      }
    }

    armStart() {
      if (promoVideo === 'opening' || hasPromoCover()) return;

      const loader = document.getElementById('page-loader');
      if (!loader || loader.classList.contains('is-hidden')) {
        this.begin();
        return;
      }

      loader.addEventListener('transitionend', (event) => {
        if (event.target === loader) this.begin();
      });
      window.addEventListener('load', () => window.setTimeout(() => this.begin(), 520), { once: true });
    }
  }

  /* --- Money Formatter --- */
  function formatMoney(cents) {
    const fmt = window.Shopify?.money_format || '${{amount}}';
    const raw = (cents / 100).toFixed(2);
    const withCommas = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const noDecimals = Math.round(cents / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return fmt
      .replace('{{amount_with_comma_separator}}', raw.replace('.', ','))
      .replace('{{amount_no_decimals_with_comma_separator}}', Math.round(cents / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'))
      .replace('{{amount_no_decimals}}', noDecimals)
      .replace('{{amount}}', withCommas);
  }

  /* --- Newsletter Confetti --- */
  function fireConfetti() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const primary = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#D1001A';
    const gravity = 0.32;
    const drag = 0.006;
    const duration = 2600;
    const originX = canvas.width / 2;
    const originY = canvas.height * 0.35;

    const particles = Array.from({ length: 150 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 11;
      return {
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: 6 + Math.random() * 6,
        color: primary,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.3,
      };
    });

    const start = performance.now();

    const frame = (now) => {
      const elapsed = now - start;
      const life = Math.max(0, 1 - elapsed / duration);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.vy += gravity;
        p.vx *= (1 - drag);
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.spin;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = life;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      if (elapsed < duration) {
        requestAnimationFrame(frame);
      } else {
        window.removeEventListener('resize', resize);
        canvas.remove();
      }
    };

    requestAnimationFrame(frame);
  }

  /* --- Subscription celebration ---
     After a successful subscribe, Shopify reloads with ?customer_posted=true
     and the form id as the fragment (e.g. #footer-newsletter). Auto-scroll to
     that section, then fire confetti once the scroll has settled. */
  function whenScrollSettles(callback) {
    let done = false;
    let idle;
    const finish = () => {
      if (done) return;
      done = true;
      window.removeEventListener('scroll', onScroll);
      clearTimeout(idle);
      clearTimeout(safety);
      callback();
    };
    const onScroll = () => {
      clearTimeout(idle);
      idle = setTimeout(finish, 140);
    };
    const safety = setTimeout(finish, 2000);
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initSubscriptionCelebration() {
    const successEl = document.querySelector('[data-newsletter-success]');
    if (!successEl) return;

    const hashId = window.location.hash.length > 1
      ? decodeURIComponent(window.location.hash.slice(1))
      : null;
    const target = (hashId && document.getElementById(hashId))
      || successEl.closest('section, .footer__newsletter-banner')
      || successEl;

    const absoluteTop = target.getBoundingClientRect().top + window.scrollY;
    const centerMargin = Math.max(0, (window.innerHeight - target.offsetHeight) / 2);
    const targetY = Math.max(0, absoluteTop - centerMargin);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || Math.abs(window.scrollY - targetY) < 4) {
      window.scrollTo(0, targetY);
      fireConfetti();
      return;
    }

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    whenScrollSettles(fireConfetti);
    requestAnimationFrame(() => window.scrollTo({ top: targetY, behavior: 'smooth' }));
  }

  /* --- Bizmis voice clerk trigger ---
     "Talk to the clerk" starts a voicechat through the widget's imperative API
     (window.AvatarVoicechat.startVoicechat). Older widget builds without that
     API fall back to surfacing + pulsing the floating widget. */
  const VOICE_WIDGET_SELECTORS = ['#bizmis-avatar-embed', '.bizmis-avatar-widget-root', '#avatar-root', '[data-avatar-widget]'];

  function findVoiceWidget() {
    for (let i = 0; i < VOICE_WIDGET_SELECTORS.length; i++) {
      const el = document.querySelector(VOICE_WIDGET_SELECTORS[i]);
      if (el) return el;
    }
    return document.getElementById('bizmis-shopify-avatar-widget');
  }

  function isPromoTrueHome() {
    return promoStoreUnlocked && document.body.classList.contains('template-index');
  }

  function promoTypeAfterMs() {
    const raw = promoSearchParams().get('type_after');
    if (raw == null || raw === '') return PROMO_TYPE_AFTER_MS;
    const ms = Number(raw);
    return Number.isFinite(ms) && ms >= 0 ? ms : PROMO_TYPE_AFTER_MS;
  }

  class PromoQueryTypewriter {
    constructor() {
      this.input = null;
      this.timer = 0;
      this.aborted = false;
    }

    schedule() {
      if (!isPromoTrueHome()) return;
      window.setTimeout(() => this.begin(), promoTypeAfterMs());
    }

    begin() {
      this.findInput().then((input) => {
        if (!input || this.aborted) return;
        this.input = input;
        this.watchAbort();
        input.focus({ preventScroll: true });
        if (prefersReducedMotion()) {
          this.setValue(PROMO_TYPE_QUERY);
          return;
        }
        this.type(0);
      });
    }

    findInput() {
      const deadline = Date.now() + PROMO_TYPE_FIND_MS;
      return new Promise((resolve) => {
        const tick = () => {
          const input = this.locateInput();
          if (input) {
            resolve(input);
            return;
          }
          if (Date.now() >= deadline) {
            resolve(null);
            return;
          }
          window.setTimeout(tick, 120);
        };
        tick();
      });
    }

    locateInput() {
      const widget = findVoiceWidget();
      if (!widget) return null;
      const candidates = widget.querySelectorAll('textarea, .bizmis-chat-input-bar input');
      for (let i = 0; i < candidates.length; i++) {
        if (this.isUsable(candidates[i])) return candidates[i];
      }
      return null;
    }

    isUsable(el) {
      if (!el || el.disabled || el.value) return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 8 && rect.height > 8;
    }

    watchAbort() {
      const abort = (event) => {
        if (!event.isTrusted) return;
        this.aborted = true;
        window.clearTimeout(this.timer);
      };
      this.input.addEventListener('keydown', abort);
      this.input.addEventListener('pointerdown', abort);
    }

    type(index) {
      if (this.aborted) return;
      this.setValue(PROMO_TYPE_QUERY.slice(0, index));
      if (index >= PROMO_TYPE_QUERY.length) return;
      this.timer = window.setTimeout(() => this.type(index + 1), PROMO_TYPE_CHAR_MS);
    }

    followCaret() {
      const input = this.input;
      if (!input) return;
      const len = input.value.length;
      input.focus({ preventScroll: true });
      try {
        input.setSelectionRange(len, len);
      } catch {
        /* some input types reject selection */
      }
      input.scrollLeft = input.scrollWidth;
      input.scrollTop = input.scrollHeight;
    }

    setValue(value) {
      const proto = this.input.tagName === 'TEXTAREA'
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
      setter.call(this.input, value);
      this.input.dispatchEvent(new Event('input', { bubbles: true }));
      this.followCaret();
      requestAnimationFrame(() => {
        this.followCaret();
        requestAnimationFrame(() => this.followCaret());
      });
    }
  }

  function openVoiceClerk() {
    const api = window.AvatarVoicechat;
    if (api && typeof api.startVoicechat === 'function' && api.startVoicechat()) return;

    const widget = findVoiceWidget();
    if (!widget) return;

    widget.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    widget.classList.add('bizmis-widget-pulse');
    window.setTimeout(() => widget.classList.remove('bizmis-widget-pulse'), 1800);
  }

  function initVoiceClerkTriggers() {
    document.querySelectorAll('[data-open-voice-clerk]').forEach(btn => {
      btn.addEventListener('click', openVoiceClerk);
    });
  }

  /* Measure the demo promo bar so the index header floats just below it (and the
     hero fills exactly the remaining viewport). Handles wrapping on small screens. */
  function initPromoBar() {
    const bar = document.querySelector('.promo-bar');
    if (!bar) {
      document.documentElement.style.setProperty('--promo-height', '28px');
      document.body.style.setProperty('--promo-height', '28px');
      return;
    }
    const apply = () => document.body.style.setProperty('--promo-height', `${bar.offsetHeight}px`);
    apply();
    window.addEventListener('resize', apply, { passive: true });
    window.addEventListener('load', apply);
  }

  /* --- Initialize --- */
  function init() {
    if (promoVideo === 'opening') {
      const opening = document.querySelector('[data-promo-opening]');
      if (opening) {
        const openingController = new PromoOpening(opening, () => { });
        window.__promoOpeningFrames = openingController;
      }
    }
    propagatePromoVideoParam();
  }

  function dismissLoader() {
    const loader = document.getElementById('page-loader');
    if (!loader) return;
    loader.classList.add('is-hidden');
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', () => {
    dismissLoader();
    // Wait out the loader fade so the scroll and confetti are not hidden behind it.
    setTimeout(initSubscriptionCelebration, 600);
  });
})();
