import { chromium } from 'playwright';
const browser = await chromium.launch({
  headless: true,
  args: ['--disable-blink-features=AutomationControlled','--no-sandbox']
});
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 2,
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  locale: 'en-US',
});
await ctx.addInitScript(() => { Object.defineProperty(navigator,'webdriver',{get:()=>undefined}); });
const page = await ctx.newPage();
try {
  await page.goto('https://greerchicago.com', { waitUntil: 'domcontentloaded', timeout: 45000 });
} catch(e) { console.error('nav warn:', e.message); }
await new Promise(r => setTimeout(r, 9000));
const title = await page.title();
console.log('title:', title);
await page.screenshot({ path: '/tmp/greer_live.png', fullPage: false });
console.log('saved');
await browser.close();
