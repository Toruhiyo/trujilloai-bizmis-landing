/* Export clock for ad-1. Inactive unless the page is opened with export=1.
   The film, its CSS, and the widget then read this clock instead of the wall clock. */
(function promoExportClock() {
  if (window.__promoClock) return;
  const params = new URLSearchParams(location.search);
  if (params.get('export') !== '1') return;

  const FPS = 30;
  const FRAME_MS = 1000 / FPS;
  const VIDEO_FPS = 30;
  const EPOCH_MS = 1700000000000;
  const SEED = 40721;
  const TASK_FLOOR = 1000000;
  const TIMER_GUARD = 100000;

  const realNow = performance.now.bind(performance);
  const realDateNow = Date.now.bind(Date);
  const realRAF = window.requestAnimationFrame.bind(window);
  const realCancelRAF = window.cancelAnimationFrame.bind(window);
  const realSetTimeout = window.setTimeout.bind(window);
  const realClearTimeout = window.clearTimeout.bind(window);
  const realSetInterval = window.setInterval.bind(window);
  const realClearInterval = window.clearInterval.bind(window);

  let armed = false;
  let filmMs = 0;
  let seq = TASK_FLOOR;
  const tasks = new Map();
  const rafs = new Map();

  let seed = SEED;
  function reseed() {
    seed = SEED;
    Math.random = function promoExportRandom() {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }
  reseed();

  Performance.prototype.now = function promoExportNow() {
    return armed ? filmMs : realNow();
  };
  Date.now = function promoExportDateNow() {
    return armed ? EPOCH_MS + Math.round(filmMs) : realDateNow();
  };

  window.setTimeout = function promoExportTimeout(fn, ms, ...args) {
    if (!armed || typeof fn !== 'function') return realSetTimeout(fn, ms, ...args);
    const id = seq++;
    const delay = Math.max(0, Number(ms) || 0);
    tasks.set(id, { at: filmMs + delay, fn, args, interval: 0 });
    return id;
  };
  window.clearTimeout = function promoExportClearTimeout(id) {
    if (!armed || id >= TASK_FLOOR) tasks.delete(id);
    if (!armed || id < TASK_FLOOR) realClearTimeout(id);
  };
  window.setInterval = function promoExportInterval(fn, ms, ...args) {
    if (!armed || typeof fn !== 'function') return realSetInterval(fn, ms, ...args);
    const id = seq++;
    const delay = Math.max(0, Number(ms) || 0);
    tasks.set(id, { at: filmMs + delay, fn, args, interval: delay || FRAME_MS });
    return id;
  };
  window.clearInterval = function promoExportClearInterval(id) {
    if (!armed || id >= TASK_FLOOR) tasks.delete(id);
    if (!armed || id < TASK_FLOOR) realClearInterval(id);
  };
  window.requestAnimationFrame = function promoExportRAF(fn) {
    if (!armed || typeof fn !== 'function') return realRAF(fn);
    const id = seq++;
    rafs.set(id, fn);
    return id;
  };
  window.cancelAnimationFrame = function promoExportCancelRAF(id) {
    if (!armed || id >= TASK_FLOOR) rafs.delete(id);
    if (!armed || id < TASK_FLOOR) realCancelRAF(id);
  };

  function drainUntil(limit) {
    let guard = 0;
    while (guard < TIMER_GUARD) {
      guard += 1;
      let pick = null;
      let pickAt = Infinity;
      tasks.forEach((task, id) => {
        if (task.at <= limit + 1e-6 && task.at < pickAt) {
          pick = id;
          pickAt = task.at;
        }
      });
      if (pick == null) break;
      const task = tasks.get(pick);
      tasks.delete(pick);
      if (task.interval > 0) {
        const gap = Math.max(task.interval, 1);
        tasks.set(pick, { at: task.at + gap, fn: task.fn, args: task.args, interval: task.interval });
      }
      filmMs = task.at;
      try {
        task.fn.apply(window, task.args);
      } catch (error) {
        console.error(error);
      }
      bindAnimations();
    }
  }

  function emitRaf() {
    const pending = [...rafs.entries()];
    rafs.clear();
    pending.forEach(([, fn]) => {
      try {
        fn(filmMs);
      } catch (error) {
        console.error(error);
      }
    });
  }

  function collectAnimations() {
    const found = new Set(document.getAnimations({ subtree: true }));
    document.querySelectorAll('*').forEach((node) => {
      if (!node.shadowRoot) return;
      node.shadowRoot.getAnimations({ subtree: true }).forEach((anim) => found.add(anim));
    });
    return [...found];
  }

  function bindAnimations() {
    document.documentElement.getBoundingClientRect();
    collectAnimations().forEach((anim) => {
      try {
        if (!anim.__promoSeen) {
          anim.__promoSeen = true;
          anim.__promoOrigin = filmMs;
        }
        anim.pause();
        anim.currentTime = Math.max(0, filmMs - anim.__promoOrigin);
      } catch (error) {
        /* finished or cancelled animations can reject a seek */
      }
    });
  }

  function seekVideos() {
    const pending = [];
    document.querySelectorAll('video').forEach((video) => {
      const src = video.currentSrc || video.getAttribute('src') || video.querySelector('source')?.src;
      if (!src) return;
      video.pause();
      video.autoplay = false;
      // Idle videos keep their frame and cost nothing. data-promo-start plays
      // a clip from that second once the film re-arms it (origin reset).
      if (video.dataset.promoIdle === '1') return;
      if (video.__promoOriginMs == null) video.__promoOriginMs = filmMs;
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      const startSec = Number(video.dataset.promoStart) || 0;
      const localSec = startSec + Math.max(0, (filmMs - video.__promoOriginMs) / 1000);
      const frameCount = Math.max(1, Math.round(video.duration * VIDEO_FPS));
      const frame = Math.floor(localSec * VIDEO_FPS) % frameCount;
      const next = Math.min(frame / VIDEO_FPS, Math.max(0, video.duration - 1 / VIDEO_FPS));
      if (Math.abs((video.currentTime || 0) - next) > 0.0005) {
        try {
          video.currentTime = next;
          pending.push(video);
        } catch (error) {
          /* metadata not ready yet; settle retries */
        }
      }
    });
    return pending;
  }

  function realWait(ms) {
    return new Promise((resolve) => {
      realSetTimeout(resolve, ms);
    });
  }

  function realFrame() {
    return new Promise((resolve) => {
      realRAF(() => resolve());
    });
  }

  function seek(targetMs) {
    const target = Math.max(0, Number(targetMs) || 0);
    if (target < filmMs - 0.01) {
      throw new Error('Export clock only moves forward');
    }
    if (target <= filmMs + 0.001) {
      drainUntil(filmMs);
      emitRaf();
      bindAnimations();
      seekVideos();
      return filmMs;
    }
    while (filmMs < target - 0.001) {
      const next = Math.min(target, filmMs + FRAME_MS);
      drainUntil(next);
      filmMs = next;
      emitRaf();
      bindAnimations();
    }
    seekVideos();
    return filmMs;
  }

  async function ready() {
    const deadline = realNow() + 8000;
    while (realNow() < deadline) {
      await realWait(20);
      drainUntil(filmMs);
      const canvas = document.querySelector('#bizmis-avatar-embed canvas');
      if (canvas && canvas.width > 32) break;
    }
    drainUntil(filmMs);
  }

  async function settle(timeoutMs) {
    const budget = Math.max(500, Number(timeoutMs) || 4000);
    const deadline = realNow() + budget;
    const expired = () => realNow() >= deadline;
    const within = (promise) => Promise.race([
      promise,
      realWait(Math.max(0, deadline - realNow())),
    ]);

    if (document.fonts && document.fonts.ready) {
      await within(document.fonts.ready);
    }

    const images = [...document.images];
    await Promise.all(images.map((img) => {
      if (img.complete) return null;
      const decode = typeof img.decode === 'function' ? img.decode() : Promise.resolve();
      return within(decode).catch(() => {});
    }));

    await realWait(0);
    drainUntil(filmMs);

    const videos = [...document.querySelectorAll('video')].filter((video) => {
      return video.currentSrc || video.getAttribute('src') || video.querySelector('source');
    });
    await Promise.all(videos.map((video) => {
      if (video.readyState >= 1) return null;
      return within(new Promise((resolve) => {
        video.addEventListener('loadedmetadata', () => resolve(), { once: true });
      }));
    }));

    const pending = seekVideos();
    await Promise.all(pending.map((video) => {
      if (!video.seeking) return null;
      return within(new Promise((resolve) => {
        video.addEventListener('seeked', () => resolve(), { once: true });
      }));
    }));

    bindAnimations();
    await realFrame();
    await realFrame();
    bindAnimations();
    await realFrame();

    return { timedOut: expired(), ms: filmMs };
  }

  window.__promoClock = {
    fps: FPS,
    frameMs: FRAME_MS,
    arm() {
      armed = true;
      filmMs = 0;
      document.documentElement.classList.add('is-promo-export');
    },
    reseed,
    now() {
      return filmMs;
    },
    seek,
    ready,
    settle,
  };
})();
