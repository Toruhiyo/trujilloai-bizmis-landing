// Contact sheets in reel order: (1) the colour plan as swatches, (2) every poster with its colour bar.
// node _tools/sheets24.mjs   (reads _plan/colour-plan.json; writes _plan/colour-plan.png + contact-sheet-v24.jpg)
import fs from 'fs';
import sharp from '/Users/toruhiyo/Projects/Bizmis/trujilloai-bizmis-landing/node_modules/sharp/lib/index.js';
const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const PUB = '/Users/toruhiyo/Projects/Bizmis/ad1-v24/public';
const plan = JSON.parse(fs.readFileSync(`${ROOT}/_plan/colour-plan.json`, 'utf8')).sequence;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };

// 1. swatches
{
  const cw = 150, ch = 230, gap = 6, cols = 16, pad = 40;
  const rows = Math.ceil(plan.length / cols);
  const W = pad * 2 + cols * cw + (cols - 1) * gap, H = 120 + rows * (ch + 60) + 40;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#faf4ed"/>
  <text x="${pad}" y="58" font-family="Inter,Helvetica" font-size="30" font-weight="700" fill="#2b2520">ad-1 store reel · v24 colour plan (reel order)</text>
  <text x="${pad}" y="92" font-family="Inter,Helvetica" font-size="17" fill="#6b5f55">tunnel: soft light tones · heroes: unchanged · run: saturated jewel tones, pinks alternating with deep cools, into Your store orange. Number = CIEDE2000 vs previous.</text>`;
  plan.forEach((s, i) => {
    const x = pad + (i % cols) * (cw + gap), y = 120 + Math.floor(i / cols) * (ch + 60);
    const fixed = s.kind !== 'v24';
    const ink = lum(s.color) > 0.55 ? '#2b2520' : '#ffffff';
    svg += `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="10" fill="${s.color}"/>`;
    if (fixed) svg += `<rect x="${x + 3}" y="${y + 3}" width="${cw - 6}" height="${ch - 6}" rx="8" fill="none" stroke="${ink}" stroke-opacity=".55" stroke-width="2" stroke-dasharray="6 5"/>`;
    svg += `<text x="${x + 12}" y="${y + 26}" font-family="Inter,Helvetica" font-size="13" font-weight="700" fill="${ink}" opacity=".85">${i + 1} · ${esc(s.section)}</text>
      <text x="${x + 12}" y="${y + ch - 48}" font-family="Inter,Helvetica" font-size="14" font-weight="700" fill="${ink}">${esc(s.brand.length > 17 ? s.brand.slice(0, 16) + '…' : s.brand)}</text>
      <text x="${x + 12}" y="${y + ch - 28}" font-family="Inter,Helvetica" font-size="12.5" fill="${ink}" opacity=".85">${s.color} · ${s.device}</text>
      <text x="${x + 12}" y="${y + ch - 11}" font-family="Inter,Helvetica" font-size="11.5" fill="${ink}" opacity=".7">${fixed ? 'fixed' : 'v24'}</text>
      <text x="${x + cw / 2}" y="${y + ch + 26}" text-anchor="middle" font-family="Inter,Helvetica" font-size="14" fill="#6b5f55">${s.dePrev == null ? '' : 'ΔE ' + s.dePrev}</text>`;
  });
  svg += '</svg>';
  await sharp(Buffer.from(svg)).png().toFile(`${ROOT}/_plan/colour-plan.png`);
  console.log('colour-plan.png');
}

// 2. posters in reel order, each over its colour bar
{
  const H = 340, gap = 10, pad = 24, bar = 46;
  const items = [];
  for (const s of plan) {
    let file = null;
    if (s.kind === 'v24') file = `${PUB}/promo/stores/reel/v24/${s.slug}-${s.device}-home.jpg`;
    if (!file || !fs.existsSync(file)) continue;
    const m = await sharp(file).metadata();
    const w = Math.round((H * m.width) / m.height);
    items.push({ s, file, w });
  }
  const rowsW = 2600;
  const rows = []; let cur = []; let cw = 0;
  for (const it of items) { if (cw + it.w > rowsW && cur.length) { rows.push(cur); cur = []; cw = 0; } cur.push(it); cw += it.w + gap; }
  if (cur.length) rows.push(cur);
  const W = rowsW + pad * 2; const TH = pad + rows.length * (H + bar + gap * 2) + 60;
  const comps = []; let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${TH}"><text x="${pad}" y="38" font-family="Inter,Helvetica" font-size="26" font-weight="700" fill="#faf4ed">ad-1 store reel · v24 posters in reel order (tunnel 1-8, then run cards 1-14)</text>`;
  let y = 60;
  for (const row of rows) {
    let x = pad;
    for (const it of row) {
      comps.push({ input: await sharp(it.file).resize({ height: H }).toBuffer(), left: x, top: y });
      const ink = lum(it.s.color) > 0.55 ? '#2b2520' : '#ffffff';
      svg += `<rect x="${x}" y="${y + H}" width="${it.w}" height="${bar}" fill="${it.s.color}"/><text x="${x + 10}" y="${y + H + 29}" font-family="Inter,Helvetica" font-size="16" font-weight="700" fill="${ink}">${it.s.n + 1}. ${esc(it.s.brand)} · ${it.s.color}</text>`;
      x += it.w + gap;
    }
    y += H + bar + gap * 2;
  }
  svg += '</svg>';
  await sharp({ create: { width: W, height: TH, channels: 3, background: '#1b1714' } }).composite([...comps, { input: Buffer.from(svg), left: 0, top: 0 }]).jpeg({ quality: 86 }).toFile(`${ROOT}/contact-sheet-v24.jpg`);
  console.log('contact-sheet-v24.jpg');
}
