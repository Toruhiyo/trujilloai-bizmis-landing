// v24 demo storefront HOME: mounts the real Bizmis widget (local build, offline) and
// exposes __frame(t) which poses the page at time t (seconds). The recorder calls
// __frame for each video frame and steps the virtual clock between frames.
// The page never scrolls: a theme-style hero fills the screen, alive (slow push-in,
// drifting details, the pointer on the CTA), while the shopper's question is typed
// and sent in the widget's composer and the agent answers by voice (no text bubbles).
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
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
  const easeOut = (u) => 1 - Math.pow(1 - u, 3);
  const W = window.AvatarVoicechat;
  const vh = window.innerHeight;
  const vw = window.innerWidth;

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
  // the shopper asks in the composer, sends; the agent answers by voice (never text)
  function widgetFrame(t) {
    const q = S.question;
    const n = Math.round(q.length * seg(t, 0.12, 1.0));
    if (t < 1.08) { if (n !== typedLen) { typedLen = n; setComposer(q.slice(0, n)); } }
    else if (phase < 1) { phase = 1; setComposer(''); try { W.simulateToolActivity({ toolName: 'show_products', phase: 'loading', toolCallId: 'demo-1' }); } catch (e) {} }
    if (t >= 1.18 && phase < 2) { phase = 2; try { W.setSpeaking(true); } catch (e) {} }
    if (t >= 2.05 && phase < 3) { phase = 3; try { W.simulateToolActivity({ toolName: 'show_products', phase: 'success', toolCallId: 'demo-1' }); } catch (e) {} }
  }

  // [data-push="from,to"]: slow push-in (scale) over the clip; [data-drift="px"]: slow horizontal drift;
  // [data-rise="px"]: slow vertical drift; .marquee__track: an endless ticker
  const pushers = $$('[data-push]').map((el) => { const [a, b] = el.dataset.push.split(',').map(Number); return { el, a, b }; });
  const drifters = $$('[data-drift]').map((el) => ({ el, d: Number(el.dataset.drift) }));
  const risers = $$('[data-rise]').map((el) => ({ el, d: Number(el.dataset.rise) }));
  const tracks = $$('.marquee__track').map((el) => ({ el, w: el.scrollWidth / 2 }));
  const cta = $('.cta-main');
  const cursor = $('.cursor');
  const tap = $('.tap');
  const annA = $('.announce__a');
  const annB = $('.announce__b');
  const T = 3.2;

  function homeFrame(t) {
    window.scrollTo(0, 0);
    const u = t / T;
    pushers.forEach(({ el, a, b }) => { el.style.transform = `scale(${(a + (b - a) * u).toFixed(4)})`; });
    drifters.forEach(({ el, d }) => { el.style.transform = `translate3d(${(d * (u - 0.5)).toFixed(2)}px,0,0)`; });
    risers.forEach(({ el, d }) => { el.style.transform = `translate3d(0,${(d * (u - 0.5)).toFixed(2)}px,0)`; });
    tracks.forEach(({ el, w }) => { el.style.transform = `translate3d(${(-(t * 46) % w).toFixed(2)}px,0,0)`; });
    if (annA && annB) {
      const k = ease(seg(t, 1.5, 1.95));
      const h = annA.parentElement.getBoundingClientRect().height;
      annA.style.transform = `translateY(${(-h * k).toFixed(2)}px)`;
      annB.style.transform = `translateY(${(-h * k).toFixed(2)}px)`;
    }
    if (cta) {
      const cr = cta.getBoundingClientRect();
      const hover = ease(seg(t, 1.25, 1.55));
      if (!mobile) {
        const start = { x: vw * 0.5, y: vh * 0.94 };
        const end = { x: cr.left + cr.width * 0.58, y: cr.top + cr.height * 0.6 };
        const a = ease(seg(t, 0.3, 1.4));
        const x = start.x + (end.x - start.x) * a; const y = start.y + (end.y - start.y) * a - Math.sin(a * Math.PI) * 40;
        cursor.style.opacity = String(seg(t, 0.0, 0.25));
        cursor.style.transform = `translate(${x - 6}px, ${y - 3}px) scale(${t > 2.1 && t < 2.22 ? 0.86 : 1})`;
        cta.style.transform = `translateY(${(-2 * hover).toFixed(2)}px) scale(${(1 + 0.04 * hover - (t > 2.1 && t < 2.22 ? 0.02 : 0)).toFixed(4)})`;
        cta.style.boxShadow = `0 ${10 * hover}px ${26 * hover}px color-mix(in srgb, var(--primary) ${Math.round(50 * hover)}%, transparent)`;
        cta.style.filter = `brightness(${(1 + 0.08 * hover).toFixed(3)})`;
      } else {
        const p = seg(t, 1.75, 2.3);
        const press = t > 1.75 && t < 1.95 ? 0.95 : 1;
        cta.style.transform = `scale(${press})`;
        cta.style.filter = `brightness(${(1 + 0.1 * (p > 0 && p < 1 ? 1 - p : 0)).toFixed(3)})`;
        tap.style.opacity = String(p > 0 && p < 1 ? 0.9 * (1 - p) : 0);
        tap.style.transform = `translate(${cr.left + cr.width / 2}px, ${cr.top + cr.height / 2}px) scale(${0.5 + 0.9 * easeOut(p)})`;
      }
    }
    widgetFrame(t);
  }

  window.__T = T;
  window.__frame = (t) => homeFrame(t);
})();
