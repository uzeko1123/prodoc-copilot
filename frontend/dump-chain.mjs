import { chromium } from '@playwright/test';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5173/workbench/', {
  waitUntil: 'networkidle',
});
await page.waitForTimeout(2000);

const data = await page.evaluate(() => {
  const lines = [];
  const push = (el, label) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    lines.push({
      label,
      cls: (el.className && typeof el.className === 'string'
        ? el.className
        : ''.trim()
      ).slice(0, 110),
      rect: [
        Math.round(r.width),
        Math.round(r.height),
        Math.round(r.top),
        Math.round(r.left),
      ],
      disp: cs.display,
      pos: cs.position,
      overflow: cs.overflow,
      overflowX: cs.overflowX,
      overflowY: cs.overflowY,
      scrollH: el.scrollHeight,
      clientH: el.clientHeight,
      scrollW: el.scrollWidth,
      clientW: el.clientWidth,
    });
  };

  // Editor chain: find PlateContainer (data-slot=plate-container?) — locate via .ignore-click-outside
  const container =
    document.querySelector('[data-slot="plate-container"]') ||
    document.querySelector('.ignore-click-outside-toolbar') ||
    [...document.querySelectorAll('div')].find((d) =>
      /overflow-y-auto/.test(d.className),
    );
  push(container, 'EditorContainer(PlateContainer)');

  const slate = document.querySelector('[data-slate-editor]');
  push(slate, 'slate-editor');
  const parent = slate?.parentElement;
  push(parent, 'parent-of-editable');
  push(parent?.parentElement, 'grandparent-of-editable');

  // toolbar
  const toolbar = document.querySelector(
    '[data-slot="toolbar"], [role="toolbar"]',
  );
  push(toolbar, 'FixedToolbar');
  // toolbar buttons inner scroller
  const tb = toolbar;
  if (tb) {
    const tbp = tb.parentElement;
    push(tbp, 'toolbar-parent');
    push(toolbar?.firstElementChild, 'toolbar-first-child');
  }

  // panels
  document
    .querySelectorAll('[data-panel]')
    .forEach((p, i) => push(p, 'panel#' + i));
  document
    .querySelectorAll('[data-panel-group]')
    .forEach((g, i) => push(g, 'panel-group#' + i));

  // All scroll containers (even overflow hidden)
  for (const el of document.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (
      el.scrollHeight > el.clientHeight + 2 ||
      el.scrollWidth > el.clientWidth + 2
    ) {
      lines.push({
        label: 'OVERFLOWSHOT',
        cls: (el.className && typeof el.className === 'string'
          ? el.className
          : ''
        ).slice(0, 90),
        overflow: cs.overflow,
        overflowY: cs.overflowY,
        overflowX: cs.overflowX,
        clientH: el.clientHeight,
        scrollH: el.scrollHeight,
        clientW: el.clientWidth,
        scrollW: el.scrollWidth,
      });
    }
  }
  return lines;
});

for (const l of data) console.log(JSON.stringify(l));
await browser.close();
