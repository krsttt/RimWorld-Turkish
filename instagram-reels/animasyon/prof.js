// Shared pieces for the profession reels (teacher, hairdresser, driver). Loaded after common.js.
let OV = 1; // alpha of the current scene, applied to overlays (labels, checks, lines)
function remapKN(t) {
  for (let i = 1; i < KN.length; i++) if (t <= KN[i][0]) {
    const [r0, o0] = KN[i - 1], [r1, o1] = KN[i]; return o0 + (t - r0) / (r1 - r0) * (o1 - o0);
  }
  return KN[KN.length - 1][1];
}
function pill(x, y, w, h, col, al = 1) { g.save(); g.globalAlpha *= al; g.fillStyle = C.navy; rr(x - w / 2 + 5, y - h / 2 + 8, w, h, h / 2); g.fill(); g.fillStyle = col; rr(x - w / 2, y - h / 2, w, h, h / 2); g.fill(); g.restore(); }
function rot(v, a) { return [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)]; }
function add(a, b) { return [a[0] + b[0], a[1] + b[1]]; }
function ik(A, T, L1, L2, pref = 'down') {
  let dx = T[0] - A[0], dy = T[1] - A[1], d = Math.hypot(dx, dy);
  d = clamp(d, Math.abs(L1 - L2) + 1, L1 + L2 - 1);
  const th = Math.atan2(dy, dx), al = Math.acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d));
  const e1 = [A[0] + L1 * Math.cos(th + al), A[1] + L1 * Math.sin(th + al)], e2 = [A[0] + L1 * Math.cos(th - al), A[1] + L1 * Math.sin(th - al)];
  const pick = { down: (a, b) => a[1] > b[1], up: (a, b) => a[1] < b[1], back: (a, b) => a[0] < b[0], front: (a, b) => a[0] > b[0] }[pref];
  const E = pick(e1, e2) ? e1 : e2, a2 = Math.atan2(T[1] - E[1], T[0] - E[0]);
  return [E, [E[0] + L2 * Math.cos(a2), E[1] + L2 * Math.sin(a2)]];
}
function strokePath(drawFn, w, col) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  drawFn(); g.strokeStyle = C.navy; g.lineWidth = w + 12; g.stroke();
  drawFn(); g.strokeStyle = col; g.lineWidth = w; g.stroke();
}
function shade(hex, k) { const [r, gg, b] = hex2rgb(hex); return `rgb(${Math.round(r * k)},${Math.round(gg * k)},${Math.round(b * k)})`; }
function clockIcon(x, y, r, t) {
  g.save(); g.globalAlpha *= OV; g.fillStyle = C.navy; circ(x + 5, y + 8, r + 8); g.fill(); g.fillStyle = C.white; circ(x, y, r); g.fill();
  g.strokeStyle = C.navy; g.lineWidth = r * .1; circ(x, y, r); g.stroke(); g.lineCap = 'round';
  const m = t * 6, h = t * .5;
  g.lineWidth = r * .1; line(x, y, x + Math.sin(h) * r * .45, y - Math.cos(h) * r * .45);
  g.strokeStyle = C.coral; g.lineWidth = r * .07; line(x, y, x + Math.sin(m) * r * .7, y - Math.cos(m) * r * .7); g.restore();
}
function label(t, s, x, y, text, col = C.coral) {
  const p = back(prog(t, s, .4)); if (p <= 0) return;
  g.font = '900 42px Inter'; const w = g.measureText(text).width + 50;
  x = clamp(x, w / 2 + 24, 900 - w / 2);
  g.save(); g.globalAlpha *= OV; g.translate(x, y); g.scale(p, p); pill(0, 0, w, 76, col); txt(text, 0, 3, 42, '#fff', { weight: 900, a: 1 }); g.restore();
}
function hline(t, s, x0, x1, y, txtLabel, col = '#fff') {
  const k = prog(t, s, .5); if (k <= 0) return;
  g.save(); g.globalAlpha *= OV; g.setLineDash([18, 12]); g.strokeStyle = C.navy; g.lineWidth = 12; line(x0, y + 3, lerp(x0, x1, eo(k)), y + 3);
  g.strokeStyle = col; g.lineWidth = 7; line(x0, y, lerp(x0, x1, eo(k)), y); g.restore();
  if (txtLabel) label(t, s + .3, x1 - 60, y - 52, txtLabel, C.navy);
}
function fixCards(t, s, e, items) {
  const k = win(t, s, e); if (k <= 0) return;
  g.save(); g.globalAlpha = k;
  const cols = [C.coral, C.teal, C.green];
  items.forEach((it, i) => {
    const p = back(prog(t, s + .2 + i * .2, .45)), y = 720 + i * 210;
    g.save(); g.translate(CX, y); g.scale(p, p);
    g.fillStyle = C.navy; rr(-340 + 6, -85 + 10, 680, 170, 40); g.fill(); g.fillStyle = '#fff'; rr(-340, -85, 680, 170, 40); g.fill();
    g.fillStyle = C.navy; circ(-245 + 4, 6, 64); g.fill(); g.fillStyle = cols[i]; circ(-245, 0, 60); g.fill();
    txt(String(i + 1), -245, 4, 70, '#fff', { weight: 900 });
    txt(it, 65, 4, 50, C.navy, { weight: 900, maxW: 400 });
    g.restore();
  });
  g.restore();
}
function warnCard(t, s, e) {
  const k = win(t, s, e); if (k <= 0) return;
  g.save(); g.globalAlpha = k;
  const p = back(prog(t, s + .1, .5));
  g.translate(CX, 840); g.scale(p, p);
  g.fillStyle = C.navy; rr(-360 + 8, -270 + 12, 720, 540, 50); g.fill();
  g.fillStyle = '#FFF4D6'; rr(-360, -270, 720, 540, 50); g.fill();
  g.fillStyle = C.yel; g.beginPath(); g.moveTo(0, -220); g.lineTo(80, -80); g.lineTo(-80, -80); g.closePath(); g.fill();
  txt('!', 0, -122, 80, C.ink, { weight: 900 });
  txt('Ağrı ya da uyuşma', 0, 0, 58, C.ink, { weight: 800 });
  txt('geçmiyorsa', 0, 78, 58, C.ink, { weight: 800 });
  txt('fizyoterapiste görün', 0, 160, 58, C.coral, { weight: 900 });
  g.restore();
}
function shareCTA(t, s, e) {
  const k = win(t, s, e); if (k <= 0) return;
  g.save(); g.globalAlpha = k;
  const p = back(prog(t, s + .2, .5)), fly = eio(prog(t, s + 1.4, 1.2));
  g.translate(CX + fly * 380, 860 - fly * 300); g.rotate(-.35 + fly * .1); g.scale(p * (1 - fly * .4), p * (1 - fly * .4));
  const plane = () => { g.beginPath(); g.moveTo(-150, 10); g.lineTo(170, -110); g.lineTo(60, 130); g.lineTo(10, 40); g.closePath(); };
  plane(); g.fillStyle = C.navy; g.save(); g.translate(8, 12); g.fill(); g.restore();
  plane(); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.navy; g.lineWidth = 10; g.lineJoin = 'round'; g.stroke();
  g.beginPath(); g.moveTo(10, 40); g.lineTo(170, -110); g.stroke();
  g.restore();
  sparkle(t, s + 1.4, CX, 860, 360, 16);
  const a2 = k * clamp((t - s - .6) / .3);
  pill(CX, 1130, 470, 104, C.coral, a2); txt('GÖNDER  ➤', CX, 1133, 54, '#fff', { a: a2, weight: 900 });
}
function stopwatch(t, s, e, x, y, r = 110, secs = 30) {
  const k = win(t, s, e); if (k <= 0) return;
  const p = back(prog(t, s, .45));
  g.save(); g.globalAlpha = k; g.translate(x, y); g.scale(p, p);
  g.fillStyle = C.navy; rr(-24, -r - 40, 48, 30, 8); g.fill(); circ(6, 10, r + 6); g.fill();
  g.fillStyle = '#fff'; circ(0, 0, r); g.fill();
  const sec = Math.min(secs, Math.floor(prog(t, s + .3, (e - s) * .7) * secs));
  g.strokeStyle = C.pink; g.lineWidth = 18; g.lineCap = 'round'; g.beginPath(); g.arc(0, 0, r - 22, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * sec / secs); g.stroke();
  txt(String(sec), 0, -8, 76, C.navy, { weight: 900 }); txt('SN', 0, 44, 30, C.mut, { weight: 800 });
  g.restore();
}
function sourceNote(t, s, e, text) { const a = win(t, s, e); if (a > 0) txt(text, CX, 1466, 26, '#fff', { a: a * .92, weight: 700 }); }

// ---------- standing person, side view facing right. (x, fy) = feet on the floor ----------
function stand(o) {
  const { x = 400, fy = 1250, s = .8, lean = 0, neck = 0, shrug = 0, knee = 0, tuck = 0, t = 0, pain = 0, painB = 0, painS = 0,
          armN = null, armF = null, prefN = 'down', prefF = 'down', top = C.shirt, bottom = C.pants, shoe = C.shoe, toolN = null, footShift = 0 } = o;
  const W2L = p => [(p[0] - x) / s, (p[1] - fy) / s], L2W = p => [x + p[0] * s, fy + p[1] * s];
  g.save(); g.translate(x, fy); g.scale(s, s); g.lineCap = 'round'; g.lineJoin = 'round';
  g.fillStyle = 'rgba(20,10,60,.22)'; g.beginPath(); g.ellipse(10, 4, 170, 22, 0, 0, Math.PI * 2); g.fill();
  const H = [knee * 10, -404 + knee * 18];
  const Kf = [-10 + knee * 34, -214 + knee * 8], Kn = [6 + knee * 34, -214 + knee * 8];
  // far leg, near leg
  segs([[H[0] - 8, H[1], Kf[0], Kf[1], 44, shade(bottom, .8)], [Kf[0], Kf[1], -16 - footShift, -18, 40, shade(bottom, .8)], [-16 - footShift, -14, 40 - footShift, -12, 28, shade(shoe, .85)]]);
  segs([[H[0], H[1], Kn[0], Kn[1], 46, bottom], [Kn[0], Kn[1], 4 + footShift, -18, 42, bottom], [4 + footShift, -14, 62 + footShift, -12, 30, shoe]]);
  const S = add(H, rot([8, -262], lean));
  const A = [S[0] + 6, S[1] + 22 - shrug * 26], Af = [A[0] - 12, A[1] - 4];
  const reach = (root, T, pref) => { const tl = T ? W2L(T) : add(root, [40, 250]); return ik(root, tl, 128, 140, pref); };
  // far arm (behind)
  const [Ef, Hf] = reach(Af, armF, prefF);
  segs([[Af[0], Af[1], Ef[0], Ef[1], 32, shade(top, .82)], [Ef[0], Ef[1], Hf[0], Hf[1], 26, shade(C.skin, .9)]]);
  g.fillStyle = C.navy; circ(Hf[0], Hf[1], 19); g.fill(); g.fillStyle = shade(C.skin, .9); circ(Hf[0], Hf[1], 13); g.fill();
  // torso
  segs([[H[0], H[1], S[0], S[1], 72, top]]);
  g.fillStyle = bottom; g.beginPath(); g.arc(H[0], H[1], 30, 0, Math.PI * 2); g.fill();
  const ha = lean + neck;
  const N = add(add(S, [0, -shrug * 10]), rot([16, -58], ha)); N[0] -= tuck * .35;
  segs([[S[0], S[1] - shrug * 10, N[0], N[1], 30, C.skin]]);
  if (pain > 0) pulse((S[0] + N[0]) / 2 - 18, (S[1] + N[1]) / 2, t, pain);
  const B = add(H, rot([-30, -90], lean));
  if (painB > 0) pulse(B[0], B[1], t, painB);
  g.save(); g.translate(N[0] - tuck * .65, N[1]); g.rotate(ha); drawHead(10, -55, t, Math.max(pain, painB, painS)); g.restore();
  if (painS > 0) pulse(A[0] - 4, A[1] - 16, t, painS, 40);
  // near arm
  const [En, Hn] = reach(A, armN, prefN);
  segs([[A[0], A[1], En[0], En[1], 34, top], [En[0], En[1], Hn[0], Hn[1], 28, C.skin]]);
  g.fillStyle = C.navy; circ(Hn[0], Hn[1], 21); g.fill(); g.fillStyle = C.skin; circ(Hn[0], Hn[1], 15); g.fill();
  if (toolN) toolN(Hn, Math.atan2(Hn[1] - En[1], Hn[0] - En[0]));
  g.restore();
  const head = L2W(add([N[0] - tuck * .65, N[1]], rot([10, -55], ha)));
  return { S: L2W(S), A: L2W(A), E: L2W(En), Hn: L2W(Hn), N: L2W(N), H: L2W(H), B: L2W(B), head, eye: L2W(add([N[0], N[1]], rot([40, -65], ha))) };
}

// ---------- front view standing stretch: arms overhead, side bend ----------
function frontStretch(cx, fy, o = {}) {
  const { s = .8, bend = 0, up = 1, t = 0, top = C.shirt, bottom = C.pants, shoe = C.shoe, handsHip = 0, archBack = 0 } = o;
  g.save(); g.translate(cx, fy); g.scale(s, s); g.lineCap = 'round';
  g.fillStyle = 'rgba(20,10,60,.22)'; g.beginPath(); g.ellipse(0, 4, 170, 22, 0, 0, Math.PI * 2); g.fill();
  segs([[-50, -400, -62, -20, 56, bottom], [50, -400, 62, -20, 56, bottom], [-66, -12, -100, -10, 32, shoe], [66, -12, 100, -10, 32, shoe]]);
  g.save(); g.translate(0, -400); g.rotate(bend);
  const sh = -270;
  const armL = up > 0 ? [[-110, sh + 20, lerp(-150, -60, up), lerp(sh + 170, sh - 130, up), 42, top], [lerp(-150, -60, up), lerp(sh + 170, sh - 130, up), lerp(-150, -30, up), lerp(sh + 260, sh - 250, up), 34, C.skin]] : [];
  const armR = up > 0 ? [[110, sh + 20, lerp(150, 60, up), lerp(sh + 170, sh - 130, up), 42, top], [lerp(150, 60, up), lerp(sh + 170, sh - 130, up), lerp(150, 30, up), lerp(sh + 260, sh - 250, up), 34, C.skin]] : [];
  segs([...armL, ...armR]);
  blob(() => rr(-26, sh - 40, 52, 60, 10), C.skin, 10);
  blob(() => rr(-118, sh, 236, 290, 70), top, 12);
  g.fillStyle = bottom; rr(-112, -30, 224, 40, [0, 0, 40, 40]); g.fill();
  g.fillStyle = C.navy; circ(0, sh - 90, 80); g.fill(); g.fillStyle = C.skin; circ(0, sh - 90, 74); g.fill();
  g.fillStyle = C.hair; g.beginPath(); g.arc(0, sh - 90, 76, Math.PI * 1.02, Math.PI * 1.98); g.quadraticCurveTo(10, sh - 130, -76, sh - 86); g.fill();
  g.fillStyle = C.navy; circ(-26, sh - 82, 8); g.fill(); circ(26, sh - 82, 8); g.fill();
  g.strokeStyle = C.navy; g.lineWidth = 6; g.beginPath(); g.arc(0, sh - 62, 18, Math.PI * .2, Math.PI * .8); g.stroke();
  g.fillStyle = 'rgba(255,90,120,.35)'; circ(-44, sh - 62, 11); g.fill(); circ(44, sh - 62, 11); g.fill();
  if (up > .6) { g.fillStyle = C.navy; circ(0, sh - 250 * up - 10, 26); g.fill(); g.fillStyle = C.skin; circ(0, sh - 250 * up - 10, 20); g.fill(); }
  g.restore(); g.restore();
}

function checkAt(t, s, x, y, r = 40) { g.save(); g.globalAlpha *= OV; check(x, y, r * back(prog(t, s, .4)), C.green); g.restore(); }
