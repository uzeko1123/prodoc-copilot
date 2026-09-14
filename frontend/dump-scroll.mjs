import { chromium } from '@playwright/test';

const url = process.env.URL || 'http://localhost:5173/workbench/';

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

console.log('TITLE:', await page.title());

const results = await page.evaluate(() => {
  const out = [];
  const walker = document.querySelectorAll('*');
  for (const el of walker) {
    const {
      scrollHeight,
      clientHeight,
      scrollWidth,
      clientWidth,
      overflowY,
      overflowX,
      scrollTop,
    } = el;
    const scrollableY =
      scrollHeight > clientHeight + 1 && /scroll|auto|hidden/.test(overflowY);
    const scrollableX =
      scrollWidth > clientWidth + 1 && /scroll|auto|hidden/.test(overflowX);
    if (scrollableY || scrollableX) {
      out.push({
        tag: el.tagName.toLowerCase(),
        role: el.getAttribute('role'),
        className: (el.className && typeof el.className === 'string'
          ? el.className
          : ''
        ).slice(0, 140),
        data: Object.keys(el.dataset).join(','),
        clientH: clientHeight,
        scrollH: scrollHeight,
        clientW: clientWidth,
        scrollW: scrollWidth,
        overflowY,
        overflowX,
        scrollTop,
        top: Math.round(el.getBoundingClientRect().top),
      });
    }
  }
  return out;
});

for (const r of results) {
  console.log(JSON.stringify(r));
}
console.log('PAGE ERRORS:', errors.length);
for (const e of errors) console.log(e);
await browser.close();
