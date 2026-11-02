const W = 1080, H = 1920, CX = 500;
const C = {
  bg1: '#F7F3EC', bg2: '#DDEDEA', teal: '#0E7C7B', tealD: '#0A5958', coral: '#E8524D',
  ink: '#1F2933', mut: '#6B7A86', yel: '#F4B942', green: '#2BA84A', white: '#FFFFFF',
  wood: '#B08968', steel: '#9AA5B1'
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

function bg(t) {
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, C.bg1); gr.addColorStop(1, C.bg2);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = .06; g.fillStyle = C.teal;
  for (let i = 0; i < 6; i++) {
    const x = ((i * 233 + t * 18 * (i % 2 ? 1 : -1)) % W + W) % W;
    const y = 200 + i * 300 + Math.sin(t * .6 + i) * 40;
    circ(x, y, 80 + i * 22); g.fill();
  }
  g.restore();
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

// Big headline: array of [text, color] lines, popping in at time s
function headline(t, s, e, rows, y = 430, size = 110) {
  const a = win(t, s, e, .2);
  if (a <= 0) return;
  rows.forEach((r, i) => {
    const p = back(prog(t, s + i * .15, .45));
    txt(r[0], CX, y + i * size * 1.12, r[2] || size, r[1], { a: a * clamp(p * 2), sc: .6 + .4 * p });
  });
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
    g.font = `700 ${size}px Inter`;
    const w = Math.max(...ls.map(l => g.measureText(l).width)) + 70;
    const h = ls.length * lh + 34; const y = 1330;
    g.save(); g.globalAlpha = a * .88; g.fillStyle = C.ink; rr(CX - w / 2, y - h / 2, w, h, 26); g.fill(); g.restore();
    ls.forEach((l, i) => txt(l, CX, y + (i - (ls.length - 1) / 2) * lh, size, C.white, { a, weight: 700 }));
  }
}

function pulse(x, y, t, k = 1, r0 = 45) {
  if (k <= 0) return;
  const r = r0 + 14 * Math.sin(t * 7);
  const gr = g.createRadialGradient(x, y, 0, x, y, r * 1.6);
  gr.addColorStop(0, `rgba(232,82,77,${.95 * k})`);
  gr.addColorStop(.45, `rgba(232,82,77,${.45 * k})`);
  gr.addColorStop(1, 'rgba(232,82,77,0)');
  g.fillStyle = gr; circ(x, y, r * 1.6); g.fill();
}

// Side-view seated person facing right. (x,y) = hip. Returns head centre in canvas coords.
function fig(x, y, o = {}) {
  const { fwd = 0, down = 0, pain = 0, t = 0, s = 1, col = C.teal, furniture = true, glow = 1 } = o;
  g.save(); g.translate(x, y); g.scale(s, s); g.lineCap = 'round'; g.lineJoin = 'round';
  if (furniture) {
    g.strokeStyle = C.steel; g.lineWidth = 16;
    line(-110, 32, 70, 32); line(-110, 32, -128, -215); line(-80, 32, -80, 205); line(40, 32, 40, 205);
    g.strokeStyle = C.wood; g.lineWidth = 20;
    line(150, -110, 470, -110); line(445, -110, 445, 205);
    // laptop
    g.fillStyle = '#52606D'; rr(225, -132, 170, 18, 6); g.fill();
    g.save(); g.translate(392, -124); g.rotate(-1.33);
    g.fillStyle = '#3E4C59'; rr(0, -9, 200, 18, 7); g.fill(); g.restore();
    if (glow > 0) {
      const gr = g.createRadialGradient(405, -220, 0, 405, -220, 160);
      gr.addColorStop(0, `rgba(120,200,255,${.35 * glow})`); gr.addColorStop(1, 'rgba(120,200,255,0)');
      g.fillStyle = gr; circ(405, -220, 160); g.fill();
    }
    g.strokeStyle = C.steel; g.lineWidth = 10; line(-20, 205, 500, 205);
  }
  const sx = 10, sy = -262;
  g.strokeStyle = col;
  g.lineWidth = 40; line(0, 0, 172, 6); line(172, 6, 178, 188); line(178, 188, 230, 190);
  g.lineWidth = 64; line(0, 0, sx, sy);
  const nx = sx + 16 + fwd * .6, ny = sy - 58 + Math.max(fwd, 0) * .22;
  g.lineWidth = 36; line(sx, sy, nx, ny);
  if (pain > 0) pulse((sx + nx) / 2 - 22, (sy + ny) / 2, t, pain);
  // head
  const hx0 = 10 + fwd * .45, hy0 = -55;
  const cs = Math.cos(down), sn = Math.sin(down);
  const hx = nx + hx0 * cs - hy0 * sn, hy = ny + hx0 * sn + hy0 * cs;
  g.save(); g.translate(nx, ny); g.rotate(down);
  g.fillStyle = col; circ(hx0, hy0, 60); g.fill();
  g.beginPath(); g.moveTo(hx0 + 52, hy0 - 6); g.lineTo(hx0 + 76, hy0 + 14); g.lineTo(hx0 + 50, hy0 + 20); g.fill();
  g.fillStyle = C.white; circ(hx0 + 30, hy0 - 12, 8); g.fill();
  g.restore();
  // arm
  g.strokeStyle = col; g.lineWidth = 32;
  g.beginPath(); g.moveTo(sx + 6, sy + 20); g.lineTo(sx + 80, sy + 132); g.lineTo(sx + 238, sy + 128); g.stroke();
  g.restore();
  return { hx: x + hx * s, hy: y + hy * s, nx: x + nx * s, ny: y + ny * s };
}

function figFront(cx, cy, s = 1, col = C.teal) {
  g.save(); g.translate(cx, cy); g.scale(s, s); g.lineCap = 'round';
  g.fillStyle = col; g.strokeStyle = col;
  circ(0, -340, 74); g.fill();
  rr(-26, -280, 52, 50, 10); g.fill();
  rr(-115, -245, 230, 300, 70); g.fill();
  g.lineWidth = 46; line(-112, -205, -168, 40); line(112, -205, 168, 40);
  g.lineWidth = 56; line(-55, 40, -66, 330); line(55, 40, 66, 330);
  g.restore();
}

function check(x, y, r, col) {
  g.save(); g.fillStyle = col; circ(x, y, r); g.fill();
  g.strokeStyle = C.white; g.lineWidth = r * .22; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(x - r * .45, y); g.lineTo(x - r * .1, y + r * .38); g.lineTo(x + r * .5, y - r * .38); g.stroke(); g.restore();
}
function cross(x, y, r, col) {
  g.save(); g.fillStyle = col; circ(x, y, r); g.fill();
  g.strokeStyle = C.white; g.lineWidth = r * .22; g.lineCap = 'round';
  line(x - r * .4, y - r * .4, x + r * .4, y + r * .4); line(x + r * .4, y - r * .4, x - r * .4, y + r * .4); g.restore();
}
function arrow(x1, y1, x2, y2, col, w = 14) {
  g.save(); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = w; g.lineCap = 'round';
  line(x1, y1, x2, y2);
  const a = Math.atan2(y2 - y1, x2 - x1), L = w * 2.6;
  g.beginPath(); g.moveTo(x2 + Math.cos(a) * w, y2 + Math.sin(a) * w);
  g.lineTo(x2 - Math.cos(a - .5) * L, y2 - Math.sin(a - .5) * L);
  g.lineTo(x2 - Math.cos(a + .5) * L, y2 - Math.sin(a + .5) * L); g.fill(); g.restore();
}
