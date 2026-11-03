/**
 * The agents' captions never wrap: a line too long for its room is shown in
 * parts, one after the other as they're said, like a film's subtitles. Shared
 * by the home hero's agent (HeroAgent) and the Early Access host.
 */

export const words = (line: string) => line.split(/\s+/);

/**
 * Splits a line into the fewest parts that each fit `room` (a part's width is
 * width(i, j), words i to j - 1), as even as they can be, and breaking after a
 * comma or a full stop where it can. Returns the word each part starts at.
 */
export const splitLine = (line: string[], width: (i: number, j: number) => number, room: number) => {
  const n = line.length;
  let parts = 0;
  for (let i = 0; i < n; parts++) {
    let j = i + 1;
    while (j < n && width(i, j + 1) <= room) j++;
    i = j;
  }
  // a part's cost: how full it is, squared (so the parts come out even), and more
  // when it breaks a phrase; one too wide never wins (a lone word too wide still can)
  const cost = (i: number, j: number) => {
    const w = width(i, j);
    if (w > room && j - i > 1) return Infinity;
    return (w / room) ** 2 + (j < n && !/[,.;:!?]$/.test(line[j - 1]) ? 0.5 : 0);
  };
  // best[p][j]: the cheapest split of the first j words into p parts
  const best = [[0, ...Array<number>(n).fill(Infinity)]];
  const cut: number[][] = [[]];
  for (let p = 1; p <= parts; p++) {
    best[p] = Array<number>(n + 1).fill(Infinity);
    cut[p] = [];
    for (let j = p; j <= n; j++)
      for (let i = p - 1; i < j; i++) {
        const c = best[p - 1][i] + cost(i, j);
        if (c < best[p][j]) [best[p][j], cut[p][j]] = [c, i];
      }
  }
  const starts: number[] = [];
  for (let p = parts, j = n; p > 0; j = cut[p][j], p--) starts.unshift(cut[p][j]);
  return starts.length ? starts : [0];
};

/**
 * A part's width in the caption `el`'s font (words i to j - 1 of `line`),
 * measured with its widest word bold, as the word being said is drawn; null
 * without a 2D canvas.
 */
export const partMeasure = (el: HTMLElement, line: string[]) => {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return null;
  const css = getComputedStyle(el);
  const font = (weight: number) => `${weight} ${css.fontSize} ${css.fontFamily}`;
  const width = (text: string, weight: number) => {
    ctx.font = font(weight);
    return ctx.measureText(text).width + text.length * (parseFloat(css.letterSpacing) || 0);
  };
  return (i: number, j: number) =>
    width(line.slice(i, j).join(" "), 500) + Math.max(...line.slice(i, j).map((w) => width(w, 700) - width(w, 500)));
};

/** The part holding word `current` (from its start to the next part's start). */
export const partAt = (starts: number[], current: number, n: number) => {
  const from = starts.filter((i) => i <= current).pop() ?? 0;
  const to = starts.find((i) => i > from) ?? n;
  return { from, to };
};

/**
 * A line's words for captions that are voiced word by word (the Early Access
 * host): as `words`, with a lone mark ("!" or "?" after a French space) kept
 * on the word before it, so it is never a word of its own.
 */
export const captionWords = (line: string) =>
  words(line.trim()).reduce<string[]>((all, w) => {
    if (all.length && /^[!?:;»]+$/.test(w)) all[all.length - 1] += `\u00a0${w}`;
    else all.push(w);
    return all;
  }, []);
