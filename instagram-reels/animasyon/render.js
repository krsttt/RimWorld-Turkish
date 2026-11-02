const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const [, , html, out, mode, ...rest] = process.argv;   // mode: video | frames t1,t2,...
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.resolve(html));
  await p.evaluate(async () => { await document.fonts.load('800 60px Inter'); await document.fonts.load('900 60px Inter'); await document.fonts.load('700 60px Inter'); await document.fonts.load('600 60px Inter'); });
  if (mode === 'frames') {
    for (const ts of rest[0].split(',')) {
      await p.evaluate(t => render(t), +ts);
      await p.screenshot({ path: `${out}_${ts}.jpg`, type: 'jpeg', quality: 70 });
    }
  } else {
    const fps = 30, dur = await p.evaluate(() => DUR);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
      '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-r', String(fps),
      '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const n = Math.round(dur * fps);
    for (let i = 0; i < n; i++) {
      await p.evaluate(t => render(t), i / fps);
      const buf = await p.screenshot({ type: 'jpeg', quality: 93 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await b.close();
})();
