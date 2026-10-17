// Demo storefront: mounts the real Bizmis widget (local build, offline) and
// exposes __frame(t) which poses the page at time t (seconds). The recorder
// calls __frame for each video frame and steps the virtual clock between.
(() => {
  const S = window.__STORE;
  const mobile = S.device !== 'desktop';
  const origin = location.origin;
  window.AvatarVoicechat.init({
    containerId: 'bizmis-avatar-embed',
    rootUrl: origin + '/_shared/widget',
    apiUrl: origin + '/_api',
    websocketUrl: 'ws://127.0.0.1:9',
    avatarAnimationsUrl: origin + '/_shared/models/avatar-animations.glb',
    avatarModelUrl: origin + '/_shared/models/' + S.avatar + '.glb',
    avatarMeshColors: { UPPERBODY_Top: S.primary, LOWERBODY_Dress: S.primary, HEAD_Hat: S.primary },
    shirtStampUrl: new URL(S.stamp, location.href).href,
    shirtStampScale: 0.9,
    themeColor: S.theme,
    language: 'en', showTryMeBanner: false, enableAcceptTerms: false,
    layout: 'card', anchor: 'bottom-right', mobileAnchor: 'bottom-center', mobileAlignment: 'center',
    themeMode: S.mode, themePalette: 'default', autoOpen: false, isMobile: mobile,
    enableSendingContextUpdateOnUrlChange: false, debug: true,
  });
  setTimeout(() => { try { AvatarVoicechat.setPlaceholder('Ask me anything'); } catch (e) {} }, 300);

  const $ = (s, r = document) => r.querySelector(s);
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
  const easeOut = (u) => 1 - Math.pow(1 - u, 3);
  const pop = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : 1 + 2.2 * Math.pow(u - 1, 3) + 1.2 * Math.pow(u - 1, 2));

  const cards = [...document.querySelectorAll('.card')];
  const card = cards[S.pick];
  const img = card.querySelector('.card__media img');
  const qa = card.querySelector('.qa, .qa-round');
  const qaDone = card.querySelector('.qa__done, .qa-round__done');
  const qaPlus = card.querySelector('.qa-round__plus');
  const cartN = $('.cart__n');
  const toast = $('.toast');
  const cursor = $('.cursor');
  const tap = $('.tap');
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const maxScroll = () => document.documentElement.scrollHeight - vh;
  // how far to scroll: the picked card sits comfortably in view
  function scrollTarget() {
    const r = card.getBoundingClientRect();
    const top = r.top + window.scrollY;
    const want = mobile ? top - vh * 0.30 : top - vh * 0.30;
    return clamp(want, 0, maxScroll());
  }
  let SCROLL = null;

  let typedLen = -1; let phase = 0;
  function composer() {
    return document.querySelector('#bizmis-avatar-embed input[type=text], #bizmis-avatar-embed textarea, .bizmis-viewport-portal-root input[type=text], .bizmis-viewport-portal-root textarea');
  }
  function setComposer(text) {
    const el = composer(); if (!el) return;
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, text);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
  const W = window.AvatarVoicechat;

  // the shopper asks in the composer, sends; the agent answers by voice (never text)
  function widgetFrame(t) {
    const q = S.question;
    const n = Math.round(q.length * seg(t, 0.12, 1.0));
    if (t < 1.08) { if (n !== typedLen) { typedLen = n; setComposer(q.slice(0, n)); } }
    else if (phase < 1) { phase = 1; setComposer(''); try { W.simulateToolActivity({ toolName: 'show_products', phase: 'loading', toolCallId: 'demo-1' }); } catch (e) {} }
    if (t >= 1.18 && phase < 2) { phase = 2; try { W.setSpeaking(true); } catch (e) {} }
    if (t >= 2.05 && phase < 3) { phase = 3; try { W.simulateToolActivity({ toolName: 'show_products', phase: 'success', toolCallId: 'demo-1' }); } catch (e) {} }
  }

  // HOME variant: the top of the home page only (never scrolls into the catalog)
  const heroImg = $('.hero__img img, .hero__bg, .hero__shoe img');
  const heroBase = $('.hero__shoe img') ? 1.08 : 1;
  const cta = $('.hero .btn--primary');
  const annA = $('.announce__a');
  const annB = $('.announce__b');
  const story = $('.story');
  if (story) {
    // a half-hidden line under the mobile widget bar looks broken: show it whole or not at all
    const sr = story.querySelector('p').getBoundingClientRect();
    const sa = story.querySelector('a').getBoundingClientRect();
    if (mobile && Math.max(sr.bottom, sa.bottom) > vh - 100) story.style.visibility = 'hidden';
  }
  function homeFrame(t) {
    window.scrollTo(0, 0);
    // slow push-in on the hero image
    const k = heroBase + 0.07 * (t / 3.2);
    if (heroImg) heroImg.style.transform = `scale(${k.toFixed(4)})`;
    // announcement ticker: the second message slides up
    if (annA && annB) {
      const u = ease(seg(t, 1.5, 1.95));
      const h = annA.parentElement.getBoundingClientRect().height;
      annA.style.transform = `translateY(${(-h * u).toFixed(2)}px)`;
      annB.style.transform = `translateY(${(-h * u).toFixed(2)}px)`;
    }
    // pointer to the hero CTA: hover (desktop) or a light tap (touch)
    const cr = cta.getBoundingClientRect();
    const hover = ease(seg(t, 1.25, 1.55));
    if (!mobile) {
      const start = { x: vw * 0.5, y: vh * 0.92 };
      const end = { x: cr.left + cr.width * 0.58, y: cr.top + cr.height * 0.6 };
      const a = ease(seg(t, 0.3, 1.4));
      const x = start.x + (end.x - start.x) * a; const y = start.y + (end.y - start.y) * a - Math.sin(a * Math.PI) * 40;
      cursor.style.opacity = String(seg(t, 0.0, 0.25));
      cursor.style.transform = `translate(${x - 6}px, ${y - 3}px)`;
      cta.style.transform = `translateY(${(-2 * hover).toFixed(2)}px) scale(${(1 + 0.035 * hover).toFixed(4)})`;
      cta.style.boxShadow = `0 ${10 * hover}px ${24 * hover}px color-mix(in srgb, var(--primary) ${Math.round(45 * hover)}%, transparent)`;
      cta.style.filter = `brightness(${(1 + 0.08 * hover).toFixed(3)})`;
    } else {
      const u = seg(t, 1.75, 2.3);
      const press = t > 1.75 && t < 1.95 ? 0.96 : 1;
      cta.style.transform = `scale(${press})`;
      cta.style.filter = `brightness(${(1 + 0.08 * (u > 0 && u < 1 ? 1 - u : 0)).toFixed(3)})`;
      tap.style.opacity = String(u > 0 && u < 1 ? 0.9 * (1 - u) : 0);
      tap.style.transform = `translate(${cr.left + cr.width / 2}px, ${cr.top + cr.height / 2}px) scale(${0.5 + 0.9 * easeOut(u)})`;
    }
    widgetFrame(t);
  }

  window.__T = 3.2;
  window.__frame = (t) => {
    if (S.home) return homeFrame(t);
    if (SCROLL === null) SCROLL = scrollTarget();
    // 1. the shopper scrolls down to the products
    const sy = SCROLL * ease(seg(t, 0.0, 1.45));
    window.scrollTo(0, Math.round(sy * 2) / 2);
    const r = card.getBoundingClientRect();
    // 2. the agent's pick lights up (show_products)
    const glow = easeOut(seg(t, 1.25, 1.6));
    card.querySelector('.card__media').style.boxShadow = glow > 0 ? `0 ${18 * glow}px ${40 * glow}px rgba(0,0,0,${0.14 * glow})` : '';
    card.style.transform = `translateY(${-6 * glow}px)`;
    // ring via ::after opacity
    let st = document.getElementById('ringst'); if (!st) { st = document.createElement('style'); st.id = 'ringst'; document.head.appendChild(st); }
    st.textContent = `.card[data-i="${S.pick}"]::after{opacity:${glow.toFixed(3)}}`;
    // 3. hover zoom on the picked product
    const hov = ease(seg(t, 1.35, 1.75));
    img.style.transform = `scale(${1 + 0.06 * hov})`;
    // 4. add to cart
    const tClick = 2.0;
    if (!mobile) {
      qa.style.opacity = String(ease(seg(t, 1.45, 1.7)));
      qa.style.transform = `translateY(${16 * (1 - ease(seg(t, 1.45, 1.7)))}px) scale(${t > tClick && t < tClick + 0.12 ? 0.96 : 1})`;
    } else {
      qa.style.transform = `scale(${t > tClick && t < tClick + 0.12 ? 0.88 : 1 + 0.06 * pop(seg(t, tClick + 0.12, tClick + 0.42)) * (1 - seg(t, tClick + 0.42, tClick + 0.7))})`;
      if (qaPlus) qaPlus.style.opacity = String(1 - seg(t, tClick + 0.05, tClick + 0.2));
    }
    qaDone.style.opacity = String(seg(t, tClick + 0.06, tClick + 0.22));
    const badge = pop(seg(t, tClick + 0.15, tClick + 0.55));
    cartN.style.opacity = String(seg(t, tClick + 0.15, tClick + 0.25));
    cartN.style.transform = `scale(${badge})`;
    const tt = easeOut(seg(t, tClick + 0.25, tClick + 0.6));
    toast.style.opacity = String(tt);
    toast.style.transform = `translateY(${-14 * (1 - tt)}px)`;
    // 5. pointer
    const target = mobile
      ? { x: r.right - 30, y: r.top + r.width - 30 }
      : { x: r.left + r.width / 2, y: r.bottom - 34 - (r.height - r.width) };
    if (!mobile) {
      const start = { x: vw * 0.56, y: vh * 0.86 };
      const mid = { x: r.left + r.width * 0.62, y: r.top + r.width * 0.45 };
      const a = ease(seg(t, 0.35, 1.3));
      const b = ease(seg(t, 1.45, 1.85));
      let x = start.x + (mid.x - start.x) * a; let y = start.y + (mid.y - start.y) * a;
      const qr = qa.getBoundingClientRect();
      x += (qr.left + qr.width * 0.55 - mid.x) * b; y += (qr.top + qr.height * 0.55 - mid.y) * b;
      cursor.style.opacity = String(seg(t, 0.0, 0.25));
      cursor.style.transform = `translate(${x - 6}px, ${y - 3}px) scale(${t > tClick && t < tClick + 0.12 ? 0.86 : 1})`;
    } else {
      const qr = qa.getBoundingClientRect();
      const u = seg(t, tClick - 0.05, tClick + 0.45);
      tap.style.opacity = String(u > 0 && u < 1 ? 0.9 * (1 - u) : 0);
      tap.style.transform = `translate(${qr.left + qr.width / 2}px, ${qr.top + qr.height / 2}px) scale(${0.5 + 0.9 * easeOut(u)})`;
    }
    // 6. the widget: the shopper types, sends; the agent answers by voice
    const q = S.question;
    const n = Math.round(q.length * seg(t, 0.12, 1.0));
    if (t < 1.08) { if (n !== typedLen) { typedLen = n; setComposer(q.slice(0, n)); } }
    else if (phase < 1) { phase = 1; setComposer(''); try { W.simulateToolActivity({ toolName: 'show_products', phase: 'loading', toolCallId: 'demo-1' }); } catch (e) {} }
    if (t >= 1.18 && phase < 2) { phase = 2; try { W.setSpeaking(true); } catch (e) {} }
    if (t >= 2.05 && phase < 3) { phase = 3; try { W.simulateToolActivity({ toolName: 'show_products', phase: 'success', toolCallId: 'demo-1' }); } catch (e) {} }
  };
})();
