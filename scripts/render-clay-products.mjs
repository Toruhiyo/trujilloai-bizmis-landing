import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WIDGET = path.resolve(ROOT, '../trujilloai-bizmis-widget');
const OUT = path.join(ROOT, 'public/promo');
const SIZE = 512;
const KINDS = [];
const TURNS = [-20, 0, 20];
const FINISHES = ['matte', 'satin'];

function turnKey(turn) {
  if (turn < 0) return 'b';
  if (turn > 0) return 'c';
  return '';
}

function fileKey(kind, turn, finish) {
  const turnPart = turnKey(turn);
  const satin = finish === 'satin' ? 'satin' : '';
  return [kind, turnPart, satin].filter(Boolean).join('-');
}

const playwright = await import('/Users/toruhiyo/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs');
const threeSrc = fs.readFileSync(path.join(WIDGET, 'node_modules/three/build/three.module.js'));

const browser = await playwright.chromium.launch({ headless: true, channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 640, height: 640 } });
await page.exposeFunction('saveClay', (name, dataUrl) => {
  const file = path.join(OUT, `promo-product-${name}.png`);
  fs.writeFileSync(file, Buffer.from(dataUrl.split(',')[1], 'base64'));
  process.stdout.write(`${name} ${fs.statSync(file).size}\n`);
});
await page.route('https://clay.local/three.module.js', (route) => route.fulfill({
  status: 200,
  contentType: 'text/javascript',
  body: threeSrc,
}));

const jobs = [];
for (const kind of KINDS) {
  for (const turn of TURNS) {
    for (const finish of FINISHES) {
      jobs.push({ kind, turn, finish, name: fileKey(kind, turn, finish) });
    }
  }
}

await page.setContent(`<!doctype html><canvas id="c" width="${SIZE}" height="${SIZE}"></canvas><script type="module">
import * as THREE from 'https://clay.local/three.module.js';

const SIZE = ${SIZE};
const JOBS = ${JSON.stringify(jobs)};
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setSize(SIZE, SIZE, false);
renderer.setPixelRatio(1);
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
const scene = new THREE.Scene();
scene.add(new THREE.AmbientLight(0xffffff, 0.58));
scene.add(new THREE.HemisphereLight(0xffffff, 0xf9a353, 0.24));
const key = new THREE.DirectionalLight(0xffffff, 1.32);
key.position.set(-4.5, 6, 5.5);
scene.add(key);
const fill = new THREE.DirectionalLight(0xffffff, 0.12);
fill.position.set(5.5, 2, 4);
scene.add(fill);
const rim = new THREE.DirectionalLight(0xc5d2f4, 0.18);
rim.position.set(1.4, 3.2, -6);
scene.add(rim);
const clay = new THREE.MeshPhysicalMaterial({
  color: 0xE4E0DA,
  roughness: 0.94,
  metalness: 0,
  clearcoat: 0,
  clearcoatRoughness: 0.6,
});

function applyFinish(finish) {
  if (finish === 'satin') {
    clay.roughness = 0.46;
    clay.clearcoat = 0.28;
    clay.clearcoatRoughness = 0.42;
    return;
  }
  clay.roughness = 0.94;
  clay.clearcoat = 0;
  clay.clearcoatRoughness = 0.6;
}

function mesh(geometry, y) {
  const item = new THREE.Mesh(geometry, clay);
  if (y) item.position.y = y;
  return item;
}

function makeObject(kind) {
  if (kind === 'bottle') {
    const group = new THREE.Group();
    group.add(
      mesh(new THREE.CylinderGeometry(0.58, 0.66, 1.05, 48), 0.52),
      mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.48, 32), 1.26),
      mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.14, 32), 1.54),
    );
    return group;
  }
  if (kind === 'bowl') {
    const points = [
      new THREE.Vector2(0.02, 0.12),
      new THREE.Vector2(0.42, 0.16),
      new THREE.Vector2(0.78, 0.42),
      new THREE.Vector2(0.92, 0.62),
      new THREE.Vector2(0.84, 0.68),
    ];
    return mesh(new THREE.LatheGeometry(points, 48), 0);
  }
  if (kind === 'pyramid') return mesh(new THREE.ConeGeometry(0.92, 1.35, 4), 0);
  if (kind === 'hex-prism') return mesh(new THREE.CylinderGeometry(0.72, 0.72, 1.12, 6), 0);
  if (kind === 'pebble') {
    const geo = new THREE.SphereGeometry(1, 48, 32);
    geo.scale(1.32, 0.58, 1.02);
    return mesh(geo, 0);
  }
  if (kind === 'vase') {
    const points = [
      new THREE.Vector2(0.16, 0),
      new THREE.Vector2(0.52, 0.04),
      new THREE.Vector2(0.7, 0.42),
      new THREE.Vector2(0.46, 0.88),
      new THREE.Vector2(0.26, 1.12),
      new THREE.Vector2(0.4, 1.42),
    ];
    return mesh(new THREE.LatheGeometry(points, 40), 0);
  }
  if (kind === 'ring-stack') {
    const group = new THREE.Group();
    [0.2, 0.62, 1.04].forEach((y, index) => {
      const ring = new THREE.TorusGeometry(0.62 - index * 0.08, 0.16, 16, 48);
      ring.rotateX(Math.PI / 2);
      group.add(mesh(ring, y));
    });
    return group;
  }
  const group = new THREE.Group();
  group.add(
    mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.12, 32), 0.06),
    mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.85, 20), 0.52),
    mesh(new THREE.ConeGeometry(0.62, 0.48, 32, 1, true), 1.12),
  );
  return group;
}

function sit(object, turn) {
  object.rotation.y = THREE.MathUtils.degToRad(turn);
  object.scale.setScalar(1);
  object.position.set(0, 0, 0);
  object.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);
  object.scale.setScalar(1.72 / Math.max(size.x, size.y, size.z));
  object.updateMatrixWorld(true);
  const seated = new THREE.Box3().setFromObject(object);
  object.position.y -= seated.min.y;
}

function disposeObject(object) {
  object.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
  });
}

const camera = new THREE.PerspectiveCamera(18, 1, 0.1, 40);
const elevation = THREE.MathUtils.degToRad(15);
const azimuth = THREE.MathUtils.degToRad(38);
const distance = 9.5;
const look = new THREE.Vector3(0, 0.78, 0);
camera.position.set(
  look.x + Math.sin(azimuth) * Math.cos(elevation) * distance,
  look.y + Math.sin(elevation) * distance,
  look.z + Math.cos(azimuth) * Math.cos(elevation) * distance,
);
camera.lookAt(look);

async function bakeContact(url) {
  const img = new Image();
  img.src = url;
  await img.decode();
  const src = document.createElement('canvas');
  src.width = SIZE;
  src.height = SIZE;
  const read = src.getContext('2d', { willReadFrequently: true });
  read.drawImage(img, 0, 0);
  const pixels = read.getImageData(0, 0, SIZE, SIZE).data;
  let minX = SIZE;
  let maxX = 0;
  let minY = SIZE;
  let maxY = 0;
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      if (pixels[(y * SIZE + x) * 4 + 3] < 24) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (minX < 8 || maxX > SIZE - 9 || minY < 8 || maxY > SIZE - 9) {
    throw new Error('clay clipped ' + [minX, minY, maxX, maxY].join(','));
  }
  const blob = document.createElement('canvas');
  blob.width = 128;
  blob.height = 64;
  const blobDraw = blob.getContext('2d');
  const shade = blobDraw.createRadialGradient(64, 32, 0, 64, 32, 60);
  shade.addColorStop(0, 'rgba(28,25,23,0.34)');
  shade.addColorStop(0.5, 'rgba(28,25,23,0.1)');
  shade.addColorStop(1, 'rgba(28,25,23,0)');
  blobDraw.fillStyle = shade;
  blobDraw.fillRect(0, 0, 128, 64);
  const out = document.createElement('canvas');
  out.width = SIZE;
  out.height = SIZE;
  const ctx = out.getContext('2d');
  const radiusX = (maxX - minX) * 0.42;
  const radiusY = Math.max(14, radiusX * 0.18);
  const centerX = (minX + maxX) / 2;
  ctx.drawImage(blob, centerX - radiusX, maxY - radiusY, radiusX * 2, radiusY * 2);
  ctx.drawImage(img, 0, 0);
  return out.toDataURL('image/png');
}

try {
  for (const job of JOBS) {
    applyFinish(job.finish);
    const object = makeObject(job.kind);
    sit(object, job.turn);
    scene.add(object);
    renderer.render(scene, camera);
    const baked = await bakeContact(canvas.toDataURL('image/png'));
    await saveClay(job.name, baked);
    scene.remove(object);
    disposeObject(object);
  }
  window.__clayDone = true;
} catch (error) {
  window.__clayError = String(error && error.stack || error);
}
</script>`, { waitUntil: 'load' });

await page.waitForFunction(() => window.__clayDone || window.__clayError, null, { timeout: 180000 });
const failed = await page.evaluate(() => window.__clayError || '');
await browser.close();
if (failed) throw new Error(failed);

const assetsPath = path.join(OUT, 'film-assets.json');
const assets = JSON.parse(fs.readFileSync(assetsPath, 'utf8'));
for (const job of jobs) {
  assets.clay[job.name] = `/promo/promo-product-${job.name}.png`;
}
fs.writeFileSync(assetsPath, `${JSON.stringify(assets)}\n`);
process.stdout.write(`renders ${jobs.length}\n`);
