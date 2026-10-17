// v35: the agent visibly TALKS in each home loop (mouth, body, the widget's speaking pulses), on the recorder's
// virtual clock: the mouth is pinned to a syllable envelope, the body plays exaggerated_talking.
(() => {
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
    const roots = document.querySelectorAll('#bizmis-avatar-embed, .avatar-widget-container, .bizmis-mobile-lite-chat, canvas');   // v35: the store pages' widget roots
    for (const root of roots) {
      const key = Object.keys(root).find((name) => name.startsWith('__reactFiber'));
      let fiber = key ? root[key] : null;
      for (let step = 0; fiber && step < 4; step += 1) {
        const mesh = sceneFromFiber(fiber);
        if (mesh) return mesh;
        fiber = fiber.return;
      }
    }
    return null;
  }

  let mesh = null; let proxy = null; let open = 0; let started = false;
  // the tunnel stores fly past for about a second each: there the agent talks from the first frame and nothing is typed
  const FROM0 = Boolean(window.__TALK_FROM0);
  if (FROM0 && window.__STORE) window.__STORE.question = '';
  const START = FROM0 ? 0 : 1.18;   // as store24.js: the agent answers once the question is sent
  function pin(m) {
    const dict = m.morphTargetDictionary || {};
    const idx = ['A', 'jawOpen'].map((k) => dict[k]).filter((i) => i != null);
    const original = m.morphTargetInfluences;
    if (!original || !idx.length) return null;
    const p = new Proxy(original, { set(target, prop, value) { const i = Number(prop); if (idx.includes(i)) { idx.forEach((j) => { target[j] = open; }); return true; } target[prop] = value; return true; } });
    m.morphTargetInfluences = p;
    return { idx, original, p };
  }
  // speech-like: ~4.6 syllables/s, each a quick open-close, with a phrase-level swell and a short breath
  function envelope(t) {
    const u = t - START;
    if (u < 0) return 0;
    const syl = Math.max(0, Math.sin(2 * Math.PI * 4.6 * u)) ** 0.8;
    const phrase = 0.62 + 0.38 * Math.sin(2 * Math.PI * 0.85 * u + 0.6);
    const breath = u % 1.25 > 1.08 ? 0.15 : 1;
    return Math.min(1, syl * phrase * breath);
  }
  const orig = window.__frame;
  window.__frame = (t) => {
    orig(t);
    if (t >= START && !started) {
      started = true;
      window.dispatchEvent(new CustomEvent('avatar-animation', { detail: { name: 'exaggerated_talking', lifecycle: { times: 3, when: null, duration_in_ms: null }, toolCallId: 'demo-talk' } }));
      try { window.AvatarVoicechat.setSpeaking(true); } catch (e) {}
    }
    if (!mesh) { mesh = (window.__morphMeshes || []).find((m) => m.morphTargetDictionary && (m.morphTargetDictionary.A != null || m.morphTargetDictionary.jawOpen != null) && m.morphTargetInfluences) || findMouthMesh(); if (mesh) proxy = pin(mesh); }
    open = envelope(t);
    if (proxy) proxy.idx.forEach((j) => { proxy.original[j] = open; });
    window.__talkState = { mesh: Boolean(mesh), pinned: Boolean(proxy), open: Number(open.toFixed(3)) };
  };
})();
