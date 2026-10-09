import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

/**
 * "Chatbot" as a worn-out shop sign with an OBSOLETE tag (P1a·2). At rest a few
 * letters hang loose on nails; when the sales agent wins, the o slips off its
 * nail and falls, the first t settles at a steeper tilt a beat later, and once
 * the o has landed the last t gives up too and drops beside it. The motion is
 * a small physics simulation (decaying pendulums, gravity, bouncing that loses
 * energy, rocking to rest) baked into Web Animations keyframes. The nails stay
 * on the wall. Letter roles count from the end of the word, so translations
 * ("Xatbot") work too.
 */

type Pose = { nail: number; r0: number };
type Swing = { k: number; r1: number; T: number; z: number; delay: number };
type Drop = { k: number; delay: number };

const rad = (d: number) => (d * Math.PI) / 180;

function choreography(n: number) {
  const pose: Record<number, Pose> = {
    [n - 4]: { nail: 0.88, r0: 6 },
    [n - 2]: { nail: 0.22, r0: 4 },
    [n - 1]: { nail: 0.14, r0: 9 },
  };
  const swings: Swing[] = [{ k: n - 4, r1: 22, T: 0.88, z: 0.14, delay: 260 }];
  const drops: Drop[] = [
    { k: n - 2, delay: 0 },
    { k: n - 1, delay: 1050 },
  ];
  return { pose, swings, drops };
}

/** rotate a letter by `deg` around its nail, expressed around its centre */
function pivot(el: HTMLElement, nailX: number, deg: number) {
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const f = parseFloat(getComputedStyle(el).fontSize);
  const cx = w / 2 - nailX * w;
  const cy = h / 2 - 0.1 * f;
  const a = rad(deg);
  const rx = cx * Math.cos(a) - cy * Math.sin(a);
  const ry = cx * Math.sin(a) + cy * Math.cos(a);
  return { tx: rx - cx, ty: ry - cy, deg };
}
const tf = (p: { tx: number; ty: number; deg: number }) =>
  `translate(${p.tx.toFixed(2)}px, ${p.ty.toFixed(2)}px) rotate(${p.deg.toFixed(2)}deg)`;

function swing(el: HTMLElement, nailX: number, r0: number, s: Swing) {
  const w = (2 * Math.PI) / s.T;
  const wd = w * Math.sqrt(1 - s.z * s.z);
  const A = r0 - s.r1;
  const dur = Math.min(4, Math.log(Math.abs(A) / 0.25) / (s.z * w));
  const frames: Keyframe[] = [];
  for (let t = 0; t <= dur; t += 1 / 60)
    frames.push({
      transform: tf(
        pivot(el, nailX, s.r1 + A * Math.exp(-s.z * w * t) * Math.cos(wd * t)),
      ),
      offset: t / dur,
    });
  frames[frames.length - 1].offset = 1;
  return el.animate(frames, {
    duration: dur * 1000,
    delay: s.delay,
    fill: "forwards",
  });
}

/** slip round the nail, fall (gravity), bounce (losing energy), rock to rest on its side */
function drop(el: HTMLElement, nailX: number, r0: number, d: Drop) {
  const f = parseFloat(getComputedStyle(el).fontSize);
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const g = 14 * f;
  const e = 0.3;
  const floor = 0.78 * f;
  const frames: { t: number; transform: string }[] = [];
  let t = 0;
  const slip = 0.3;
  const out = 44;
  for (; t < slip; t += 1 / 60) {
    const u = t / slip;
    frames.push({
      t,
      transform: tf(pivot(el, nailX, r0 + (out - r0) * u * u)),
    });
  }
  const p = pivot(el, nailX, out);
  let x = p.tx;
  let y = p.ty;
  let a = out;
  let wv = ((2 * (out - r0)) / slip) * 0.55;
  const cx = w / 2 - nailX * w;
  const cy = h / 2 - 0.1 * f;
  const ar = rad(out);
  const wr = rad((2 * (out - r0)) / slip);
  // the nail scrapes off most of the sideways speed: it drops almost straight
  let vx = -0.32 * wr * (cx * Math.sin(ar) + cy * Math.cos(ar));
  let vy = 0.6 * wr * (cx * Math.cos(ar) - cy * Math.sin(ar));
  const ext = (deg: number) =>
    Math.abs((h / 2) * Math.cos(rad(deg))) +
    Math.abs((w / 2) * Math.sin(rad(deg))) -
    h / 2;
  let bounces = 0;
  let settling = false;
  const dt = 1 / 240;
  for (let i = 0; i < 240 * 4; i++) {
    t += dt;
    if (!settling) {
      vy += g * dt;
      x += vx * dt;
      y += vy * dt;
      a += wv * dt;
      if (y + ext(a) >= floor && vy > 0) {
        y = floor - ext(a);
        bounces++;
        vy = -vy * e;
        vx *= 0.55;
        wv *= 0.45;
        if (Math.abs(vy) < 0.9 * f || bounces >= 3) settling = true;
      }
    } else {
      const target = Math.round(a / 90) * 90;
      wv += (-60 * (a - target) - 9 * wv) * dt;
      a += wv * dt;
      vx *= 0.96;
      x += vx * dt;
      y = floor - ext(a);
      if (Math.abs(a - target) < 0.15 && Math.abs(wv) < 2) {
        a = target;
        y = floor - ext(a);
        frames.push({ t, transform: tf({ tx: x, ty: y, deg: a }) });
        break;
      }
    }
    if (i % 4 === 0)
      frames.push({ t, transform: tf({ tx: x, ty: y, deg: a }) });
  }
  const dur = frames[frames.length - 1].t;
  return el.animate(
    frames.map((fr) => ({
      transform: fr.transform,
      offset: Math.min(1, fr.t / dur),
    })),
    { duration: dur * 1000, delay: d.delay, fill: "forwards" },
  );
}

const ObsoleteWord = ({ text, beaten }: { text: string; beaten: boolean }) => {
  const word = useRef<HTMLSpanElement>(null);
  const anims = useRef<Animation[]>([]);
  const letters = [...text];

  // the resting pose: loose letters tilted on their nails, nails on the wall
  const rest = useCallback(() => {
    const el = word.current;
    if (!el) return;
    const { pose } = choreography(letters.length);
    anims.current.forEach((a) => a.cancel());
    anims.current = [];
    el.querySelectorAll(".bzl-obs-nail").forEach((n) => n.remove());
    el.querySelectorAll<HTMLElement>(".bzl-obs-c").forEach((c, k) => {
      const p = pose[k];
      c.style.transform = p ? tf(pivot(c, p.nail, p.r0)) : "";
      if (!p) return;
      const nail = document.createElement("span");
      nail.className = "bzl-obs-nail";
      nail.style.left = `${c.offsetLeft + p.nail * c.offsetWidth}px`;
      nail.style.top = `${c.offsetTop + 0.1 * parseFloat(getComputedStyle(c).fontSize)}px`;
      el.appendChild(nail);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const play = useCallback(() => {
    const el = word.current;
    if (!el) return;
    rest();
    const { pose, swings, drops } = choreography(letters.length);
    const c = el.querySelectorAll<HTMLElement>(".bzl-obs-c");
    const list = [
      ...swings.map((s) => swing(c[s.k], pose[s.k].nail, pose[s.k].r0, s)),
      ...drops.map((d) => drop(c[d.k], pose[d.k].nail, pose[d.k].r0, d)),
    ];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      list.forEach((a) => a.finish());
    anims.current = list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rest, text]);

  useLayoutEffect(() => {
    rest();
    document.fonts?.ready.then(() => !beaten && rest());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rest]);

  useEffect(() => {
    if (beaten) play();
    else rest();
  }, [beaten, play, rest]);

  useEffect(() => {
    const onResize = () => (beaten ? play() : rest());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [beaten, play, rest]);

  return (
    <span ref={word} className={beaten ? "bzl-obs is-beaten" : "bzl-obs"}>
      <span className="sr-only">{text}</span>
      {letters.map((ch, k) => (
        <span key={k} aria-hidden="true" className="bzl-obs-c">
          {ch}
        </span>
      ))}
      <span aria-hidden="true" className="bzl-obs-tag">
        OBSOLETE
      </span>
    </span>
  );
};

export default ObsoleteWord;
