// usage: node pv.js page.html out.jpg t1,t2,...  -> one contact sheet
const { chromium } = require('playwright'); const path = require('path'); const { execFileSync } = require('child_process');
(async () => {
  const [, , html, out, ts] = process.argv; const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.resolve(html)); await p.evaluate(async () => { for (const w of [600, 700, 800, 900]) await document.fonts.load(w + ' 60px Inter'); });
  const files = [];
  for (const t of ts.split(',')) { await p.evaluate(x => render(x), +t); const f = `/tmp/claude-0/-home-user-RimWorld-Turkish/db99d8a9-580e-542a-b548-df16cc4ac28f/scratchpad/reels/prev/_pv_${files.length}.jpg`; await p.screenshot({ path: f, type: 'jpeg', quality: 70 }); files.push(f); }
  await b.close(); if (errs.length) console.log('ERRORS:', errs.slice(0, 5).join(' | '));
  const n = files.length, cols = Math.min(n, 7), rows = Math.ceil(n / cols);
  const args = ['-loglevel', 'error', '-y']; files.forEach(f => args.push('-i', f));
  args.push('-filter_complex', `${files.map((_, i) => `[${i}]`).join('')}xstack=inputs=${n}:layout=${files.map((_, i) => `${(i % cols)}*w0_${Math.floor(i / cols)}*h0`).join('|').replace(/(\d+)\*w0/g, (m, a) => a === '0' ? '0' : Array(+a).fill('w0').join('+')).replace(/_(\d+)\*h0/g, (m, a) => '_' + (a === '0' ? '0' : Array(+a).fill('h0').join('+')))}:fill=black,scale=${cols * 270}:-1`, out);
  execFileSync('ffmpeg', args);
})();
