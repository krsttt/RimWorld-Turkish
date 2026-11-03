const W = 1080, H = 1920, CX = 500;
const C = {
  // legacy names used by the reels, now vivid
  teal: '#2563FF', tealD: '#1D3FD1', coral: '#FF3D71', ink: '#1B1745', mut: '#6B6B8A',
  yel: '#FFD23F', green: '#16C784', white: '#FFFFFF', wood: '#B9773F', steel: '#9AA5B1',
  // new
  navy: '#1B1745', sun: '#FFE45C', pink: '#FF4F8B', cyan: '#2EE6D6', orange: '#FF8A3D', purple: '#8B5CF6',
  skin: '#F6C7A1', skinD: '#E3A983', hair: '#3A2230', shirt: '#FFFFFF', pants: '#3B3FB6', shoe: '#FF4F8B',
  chair: '#FFD23F', laptop: '#E6EBF2', screen: '#BFE9FF'
};
const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const g = cv.getContext('2d');

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const eo = t => 1 - Math.pow(1 - clamp(t), 3);
const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const back = t => { t = clamp(t); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const prog = (t, s, d) => clamp((t - s) / d);
const win = (t, s, e, f = .25) => Math.min(clamp((t - s) / f), clamp((e - t) / f));

function line(x1, y1, x2, y2) { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }
function rr(x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function circ(x, y, r) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); }
function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function mix(a, b, k) { const A = hex2rgb(a), B = hex2rgb(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; }

// deterministic pseudo random
function rnd(i) { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

// ---------- background: vivid per-scene gradient + floating shapes ----------
function bg(t) {
  const S = (typeof SCENES !== 'undefined') ? SCENES : [[0, '#FF7A45', '#E8336D']];
  let i = 0; while (i + 1 < S.length && t >= S[i + 1][0] - .3) i++;
  let a1 = S[i][1], a2 = S[i][2];
  if (i > 0) { const k = eio(prog(t, S[i][0] - .3, .6)); a1 = mix(S[i - 1][1], S[i][1], k); a2 = mix(S[i - 1][2], S[i][2], k); }
  const gr = g.createLinearGradient(0, 0, W * .6, H);
  gr.addColorStop(0, a1.startsWith('#') ? a1 : a1); gr.addColorStop(1, a2);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // soft light at the top
  const rg = g.createRadialGradient(W * .45, 260, 0, W * .45, 260, 900);
  rg.addColorStop(0, 'rgba(255,255,255,.22)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  // floating shapes
  for (let k = 0; k < 16; k++) {
    const sp = 20 + rnd(k) * 40, sz = 18 + rnd(k + 50) * 46;
    const x = (rnd(k + 9) * W + Math.sin(t * .7 + k) * 30);
    const y = ((rnd(k + 20) * (H + 300) - t * sp) % (H + 300) + H + 300) % (H + 300) - 150;
    const rot = t * (rnd(k + 3) - .5) * 1.6 + k;
    g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = .16 + rnd(k + 7) * .14;
    g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineWidth = sz * .22; g.lineCap = 'round';
    const ty = k % 4;
    if (ty === 0) { circ(0, 0, sz * .5); g.fill(); }
    else if (ty === 1) { circ(0, 0, sz * .55); g.stroke(); }
    else if (ty === 2) { line(-sz * .5, 0, sz * .5, 0); line(0, -sz * .5, 0, sz * .5); }
    else { g.beginPath(); g.moveTo(-sz * .6, 0); for (let j = 0; j <= 6; j++) g.lineTo(-sz * .6 + j * sz * .2, (j % 2 ? -1 : 1) * sz * .18); g.stroke(); }
    g.restore();
  }
  // bottom shade so subtitles read well
  const vg = g.createLinearGradient(0, H * .62, 0, H);
  vg.addColorStop(0, 'rgba(20,10,60,0)'); vg.addColorStop(1, 'rgba(20,10,60,.28)');
  g.fillStyle = vg; g.fillRect(0, H * .62, W, H * .38);
}

// sparkle burst around a point, starting at time s
function sparkle(t, s, x, y, spread = 260, n = 12) {
  const p = prog(t, s, .8); if (p <= 0 || p >= 1) return;
  const cols = [C.sun, '#fff', C.cyan, C.pink];
  for (let i = 0; i < n; i++) {
    const an = i / n * Math.PI * 2 + rnd(i + s) * .5, d = eo(p) * spread * (.6 + rnd(i * 3 + s) * .5);
    const r = (1 - p) * (8 + rnd(i + 1) * 10);
    g.save(); g.globalAlpha = 1 - p; g.fillStyle = cols[i % 4];
    g.translate(x + Math.cos(an) * d, y + Math.sin(an) * d * .7); g.rotate(p * 4);
    if (i % 2) { circ(0, 0, r); g.fill(); }
    else { g.beginPath(); for (let j = 0; j < 8; j++) { const rr2 = j % 2 ? r * .4 : r * 1.3; g.lineTo(Math.cos(j * Math.PI / 4) * rr2, Math.sin(j * Math.PI / 4) * rr2); } g.fill(); }
    g.restore();
  }
}

function txt(s, x, y, size, col, o = {}) {
  const { a = 1, weight = 800, align = 'center', sc = 1, maxW = 880, rot = 0 } = o;
  if (a <= 0) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot);
  g.font = `${weight} ${size}px Inter`;
  const w = g.measureText(s).width;
  const k = w > maxW ? maxW / w : 1;
  g.scale(sc * k, sc * k);
  g.fillStyle = col; g.textAlign = align; g.textBaseline = 'middle';
  g.fillText(s, 0, 0); g.restore();
}

// sticker text for use directly on the colourful background
function stext(s, x, y, size, col = '#fff', o = {}) {
  const { a = 1, weight = 900, sc = 1, maxW = 900, rot = 0 } = o;
  if (a <= 0) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot);
  g.font = `${weight} ${size}px Inter`;
  const w = g.measureText(s).width, k = w > maxW ? maxW / w : 1;
  g.scale(sc * k, sc * k); g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.fillStyle = C.navy; g.fillText(s, 0, size * .08);
  g.strokeStyle = C.navy; g.lineWidth = size * .17; g.strokeText(s, 0, 0);
  g.fillStyle = col; g.fillText(s, 0, 0);
  g.restore();
}

// Big headline. ink = white, teal = yellow, coral = white on a hot-pink tag
function headline(t, s, e, rows, y = 430, size = 110) {
  const a = win(t, s, e, .2);
  if (a <= 0) return;
  let cur = y, prevH = 0;
  rows.forEach((r, i) => {
    const sz = r[2] || size, p = back(prog(t, s + i * .15, .45));
    const hh = (r[1] === C.coral ? 1.32 : 1.08) * sz;
    if (i > 0) cur += prevH / 2 + hh / 2 + 6;
    prevH = hh;
    const yy = cur, al = a * clamp(p * 2), sc = .6 + .4 * p;
    const rot = (i % 2 ? 1 : -1) * .025;
    if (r[1] === C.coral) {
      g.font = `900 ${sz}px Inter`;
      const w = Math.min(920, g.measureText(r[0]).width + sz * .7), h = sz * 1.25;
      g.save(); g.globalAlpha = al; g.translate(CX, yy); g.rotate(rot); g.scale(sc, sc);
      g.fillStyle = C.navy; rr(-w / 2 + 8, -h / 2 + 12, w, h, 26); g.fill();
      g.fillStyle = C.coral; rr(-w / 2, -h / 2, w, h, 26); g.fill();
      g.restore();
      txt(r[0], CX, yy + 4, sz, '#fff', { a: al, sc, weight: 900, rot, maxW: 860 });
    } else {
      stext(r[0], CX, yy, sz, r[1] === C.teal ? C.sun : '#fff', { a: al, sc, rot });
    }
  });
  sparkle(t, s + .1, CX, y, 380, 14);
}

function wrap(s, size, maxW, weight = 700) {
  g.font = `${weight} ${size}px Inter`;
  const words = s.split(' '); const out = []; let cur = '';
  for (const w of words) {
    const tryS = cur ? cur + ' ' + w : w;
    if (g.measureText(tryS).width > maxW && cur) { out.push(cur); cur = w; } else cur = tryS;
  }
  if (cur) out.push(cur);
  return out;
}

// Burned-in subtitle, inside the Reels safe zone
function subs(t, list) {
  for (const it of list) {
    if (t < it[0] || t >= it[1]) continue;
    const a = win(t, it[0], it[1], .12);
    const size = 48, lh = 62;
    const ls = wrap(it[2], size, 720);
    g.font = `800 ${size}px Inter`;
    const w = Math.max(...ls.map(l => g.measureText(l).width)) + 70;
    const h = ls.length * lh + 34; const y = 1330;
    g.save(); g.globalAlpha = a; g.fillStyle = C.navy; rr(CX - w / 2 + 6, y - h / 2 + 8, w, h, 28); g.fill();
    g.fillStyle = '#fff'; rr(CX - w / 2, y - h / 2, w, h, 28); g.fill(); g.restore();
    ls.forEach((l, i) => txt(l, CX, y + (i - (ls.length - 1) / 2) * lh, size, C.navy, { a, weight: 800 }));
  }
}

function pulse(x, y, t, k = 1, r0 = 45) {
  if (k <= 0) return;
  const r = r0 + 12 * Math.sin(t * 7);
  const gr = g.createRadialGradient(x, y, 0, x, y, r * 1.6);
  gr.addColorStop(0, `rgba(255,30,70,${k})`);
  gr.addColorStop(.5, `rgba(255,30,70,${.55 * k})`);
  gr.addColorStop(1, 'rgba(255,30,70,0)');
  g.fillStyle = gr; circ(x, y, r * 1.6); g.fill();
  const rp = (t * 1.4) % 1;
  g.save(); g.globalAlpha = k * (1 - rp); g.strokeStyle = '#fff'; g.lineWidth = 6; circ(x, y, r0 * (.6 + rp * 1.4)); g.stroke(); g.restore();
}

// outlined stroke helpers (two passes: outlines first, then fills)
function segs(list, ow = 12) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (const s of list) { g.strokeStyle = C.navy; g.lineWidth = s[4] + ow; line(s[0], s[1], s[2], s[3]); }
  for (const s of list) { g.strokeStyle = s[5]; g.lineWidth = s[4]; line(s[0], s[1], s[2], s[3]); }
}
function blob(drawPath, fill, ow = 12) {
  g.lineJoin = 'round'; drawPath(); g.strokeStyle = C.navy; g.lineWidth = ow; g.stroke(); g.fillStyle = fill; g.fill();
}

function drawHead(hx0, hy0, t, pain) {
  // head, hair, face (in head-local frame facing right)
  g.fillStyle = C.navy; circ(hx0, hy0, 66); g.fill();
  g.fillStyle = C.skin; circ(hx0, hy0, 60); g.fill();
  // nose
  g.beginPath(); g.moveTo(hx0 + 52, hy0 - 8); g.quadraticCurveTo(hx0 + 80, hy0 + 8, hx0 + 54, hy0 + 18); g.fill();
  g.strokeStyle = C.navy; g.lineWidth = 5; g.beginPath(); g.moveTo(hx0 + 58, hy0 - 4); g.quadraticCurveTo(hx0 + 80, hy0 + 8, hx0 + 56, hy0 + 18); g.stroke();
  // hair cap
  g.fillStyle = C.hair; g.beginPath();
  g.arc(hx0, hy0, 63, Math.PI * .62, Math.PI * 1.88);
  g.quadraticCurveTo(hx0 + 10, hy0 - 30, hx0 - 18, hy0 - 6);
  g.quadraticCurveTo(hx0 - 30, hy0 + 30, hx0 - 30, hy0 + 55); g.closePath(); g.fill();
  // ear
  g.fillStyle = C.skinD; circ(hx0 - 6, hy0 + 6, 13); g.fill();
  // eye + brow + mouth
  const blink = (t % 3.1) < .12 ? .2 : 1;
  g.fillStyle = C.navy; g.save(); g.translate(hx0 + 30, hy0 - 10); g.scale(1, blink); circ(0, 0, 7.5); g.fill(); g.restore();
  g.strokeStyle = C.navy; g.lineWidth = 5; g.lineCap = 'round';
  if (pain > .3) { line(hx0 + 18, hy0 - 30, hx0 + 42, hy0 - 24); g.beginPath(); g.arc(hx0 + 36, hy0 + 34, 10, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
  else { line(hx0 + 20, hy0 - 28, hx0 + 42, hy0 - 30); g.beginPath(); g.arc(hx0 + 34, hy0 + 18, 12, Math.PI * .15, Math.PI * .75); g.stroke(); }
  // cheek
  g.fillStyle = 'rgba(255,90,120,.35)'; circ(hx0 + 22, hy0 + 14, 10); g.fill();
}

// Side-view seated person facing right. (x,y) = hip. Returns head centre in canvas coords.
function fig(x, y, o = {}) {
  const { fwd = 0, down = 0, pain = 0, t = 0, s = 1, furniture = true, glow = 1, laptop = true, mug = true } = o;
  g.save(); g.translate(x, y); g.scale(s, s); g.lineCap = 'round'; g.lineJoin = 'round';
  // floor shadow
  g.fillStyle = 'rgba(20,10,60,.22)'; g.beginPath(); g.ellipse(170, 212, 330, 26, 0, 0, Math.PI * 2); g.fill();
  if (furniture) {
    // chair
    segs([[-80, 36, -80, 205, 14, C.navy], [40, 36, 40, 205, 14, C.navy]], 0);
    segs([[-112, 30, 72, 30, 26, C.chair], [-112, 30, -130, -215, 26, C.chair]]);
    // desk
    segs([[445, -100, 445, 205, 20, C.wood], [150, -110, 475, -110, 24, C.wood]]);
    if (mug) {
    // mug with steam
    blob(() => { rr(410, -190, 46, 60, 10); }, C.pink, 8);
    g.strokeStyle = C.navy; g.lineWidth = 8; g.beginPath(); g.arc(458, -160, 14, -Math.PI / 2, Math.PI / 2); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 6;
    for (let k = 0; k < 2; k++) { g.beginPath(); for (let j = 0; j < 12; j++) { const yy = -200 - j * 6; g.lineTo(424 + k * 18 + Math.sin(t * 4 + j * .7 + k) * 6, yy); } g.stroke(); }
    }
    if (laptop) {
    blob(() => rr(222, -134, 176, 20, 7), C.laptop, 8);
    g.save(); g.translate(392, -124); g.rotate(-1.33);
    blob(() => rr(0, -10, 205, 20, 8), C.laptop, 8); g.restore();
    if (glow > 0) {
      const gr = g.createRadialGradient(380, -230, 0, 380, -230, 170);
      gr.addColorStop(0, `rgba(150,230,255,${.45 * glow})`); gr.addColorStop(1, 'rgba(150,230,255,0)');
      g.fillStyle = gr; circ(380, -230, 170); g.fill();
    }
    }
  }
  const sx = 10, sy = -262;
  const nx = sx + 16 + fwd * .6, ny = sy - 58 + Math.max(fwd, 0) * .22;
  // body: outlines then fills
  segs([
    [0, 0, 172, 6, 44, C.pants], [172, 6, 178, 186, 40, C.pants], [176, 194, 234, 196, 28, C.shoe],
    [2, -10, sx, sy, 70, C.shirt], [sx, sy, nx, ny, 30, C.skin],
  ]);
  // shirt collar detail
  g.strokeStyle = 'rgba(37,99,255,.35)'; g.lineWidth = 10; line(sx - 4, sy + 60, sx + 2, -40);
  if (pain > 0) pulse((sx + nx) / 2 - 22, (sy + ny) / 2, t, pain);
  // head
  const hx0 = 10 + fwd * .45, hy0 = -55;
  const cs = Math.cos(down), sn = Math.sin(down);
  const hx = nx + hx0 * cs - hy0 * sn, hy = ny + hx0 * sn + hy0 * cs;
  g.save(); g.translate(nx, ny); g.rotate(down); drawHead(hx0, hy0, t, pain); g.restore();
  // arm
  segs([[sx + 6, sy + 22, sx + 80, sy + 132, 34, C.shirt], [sx + 80, sy + 132, sx + 226, sy + 128, 26, C.skin]]);
  g.fillStyle = C.navy; circ(sx + 236, sy + 126, 21); g.fill(); g.fillStyle = C.skin; circ(sx + 236, sy + 126, 15); g.fill();
  g.restore();
  return { hx: x + hx * s, hy: y + hy * s, nx: x + nx * s, ny: y + ny * s };
}

function figFront(cx, cy, s = 1) {
  g.save(); g.translate(cx, cy); g.scale(s, s); g.lineCap = 'round';
  g.fillStyle = 'rgba(20,10,60,.22)'; g.beginPath(); g.ellipse(0, 345, 150, 22, 0, 0, Math.PI * 2); g.fill();
  segs([[-112, -205, -150, -60, 46, C.shirt], [112, -205, 150, -60, 46, C.shirt],
        [-150, -60, -168, 40, 36, C.skin], [150, -60, 168, 40, 36, C.skin],
        [-55, 40, -66, 320, 58, C.pants], [55, 40, 66, 320, 58, C.pants],
        [-70, 332, -96, 336, 34, C.shoe], [70, 332, 96, 336, 34, C.shoe]]);
  blob(() => rr(-26, -285, 52, 60, 10), C.skin, 10);
  blob(() => rr(-118, -248, 236, 300, 70), C.shirt, 12);
  g.fillStyle = C.pants; rr(-112, 10, 224, 40, [0, 0, 40, 40]); g.fill();
  // head
  g.fillStyle = C.navy; circ(0, -340, 80); g.fill(); g.fillStyle = C.skin; circ(0, -340, 74); g.fill();
  g.fillStyle = C.hair; g.beginPath(); g.arc(0, -340, 76, Math.PI * 1.02, Math.PI * 1.98); g.quadraticCurveTo(10, -380, -76, -336); g.fill();
  g.fillStyle = C.navy; circ(-26, -332, 8); g.fill(); circ(26, -332, 8); g.fill();
  g.strokeStyle = C.navy; g.lineWidth = 6; g.beginPath(); g.arc(0, -312, 18, Math.PI * .2, Math.PI * .8); g.stroke();
  g.fillStyle = 'rgba(255,90,120,.35)'; circ(-44, -312, 11); g.fill(); circ(44, -312, 11); g.fill();
  g.restore();
}

function check(x, y, r, col) {
  if (r <= 0) return;
  g.save(); g.fillStyle = C.navy; circ(x + 4, y + 6, r + 6); g.fill(); g.fillStyle = col; circ(x, y, r); g.fill();
  g.strokeStyle = C.white; g.lineWidth = r * .22; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(x - r * .45, y); g.lineTo(x - r * .1, y + r * .38); g.lineTo(x + r * .5, y - r * .38); g.stroke(); g.restore();
}
function cross(x, y, r, col) {
  if (r <= 0) return;
  g.save(); g.fillStyle = C.navy; circ(x + 4, y + 6, r + 6); g.fill(); g.fillStyle = col; circ(x, y, r); g.fill();
  g.strokeStyle = C.white; g.lineWidth = r * .22; g.lineCap = 'round';
  line(x - r * .4, y - r * .4, x + r * .4, y + r * .4); line(x + r * .4, y - r * .4, x - r * .4, y + r * .4); g.restore();
}
function arrow(x1, y1, x2, y2, col, w = 14) {
  const a = Math.atan2(y2 - y1, x2 - x1), L = w * 2.6;
  const head = () => { g.beginPath(); g.moveTo(x2 + Math.cos(a) * w, y2 + Math.sin(a) * w);
    g.lineTo(x2 - Math.cos(a - .5) * L, y2 - Math.sin(a - .5) * L); g.lineTo(x2 - Math.cos(a + .5) * L, y2 - Math.sin(a + .5) * L); g.closePath(); };
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = C.navy; g.lineWidth = w + 10; line(x1, y1, x2, y2); head(); g.lineWidth = 10; g.stroke();
  g.strokeStyle = col; g.fillStyle = col; g.lineWidth = w; line(x1, y1, x2, y2); head(); g.fill(); g.restore();
}
