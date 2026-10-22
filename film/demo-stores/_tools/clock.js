// Virtual clock: the page (and the widget) only advance when the recorder steps.
(() => {
  const realNow = performance.now.bind(performance);
  const realDateNow = Date.now;
  const start = realNow();
  const dateStart = realDateNow();
  let virt = 0;            // ms since page start, virtual
  let live = true;         // before the recorder takes over, time runs real
  const now = () => live ? realNow() - start : virt;
  performance.now = () => start + now();
  Date.now = () => dateStart + now();
  const RealDate = Date;
  // rAF queue
  const realRaf = window.requestAnimationFrame.bind(window);
  let queue = new Map(); let nextId = 1;
  window.requestAnimationFrame = (cb) => {
    const id = nextId++;
    if (live) { const rid = realRaf((ts) => { if (queue.has(id)) { queue.delete(id); cb(performance.now()); } }); queue.set(id, cb); return id; }
    queue.set(id, cb); return id;
  };
  window.cancelAnimationFrame = (id) => { queue.delete(id); };
  const tracked = new WeakSet();
  window.__clock = {
    freeze() { virt = realNow() - start; live = false; },
    get t() { return now(); },
    step(ms) {
      virt += ms;
      // CSS animations / transitions follow the virtual clock
      for (const a of document.getAnimations()) {
        try {
          if (!tracked.has(a)) { tracked.add(a); a.pause(); }
          a.currentTime = (a.currentTime || 0) + ms;
        } catch (e) {}
      }
      const q = queue; queue = new Map();
      const ts = performance.now();
      q.forEach((cb) => { try { cb(ts); } catch (e) { console.error(e); } });
    },
  };
})();
