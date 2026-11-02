const DUR = 38.73;
const KN = [[0.0, 0], [3.741, 4], [7.532, 8], [11.732, 12.5], [14.42, 15.5], [18.82, 20], [22.501, 24], [25.836, 27], [31.436, 33], [35.325, 37], [38.725, 40]];
function remap(t) {
  for (let i = 1; i < KN.length; i++) if (t <= KN[i][0]) {
    const [r0, o0] = KN[i - 1], [r1, o1] = KN[i]; return o0 + (t - r0) / (r1 - r0) * (o1 - o0);
  }
  return KN[KN.length - 1][1];
}
const SCENES = [[0, '#FF7A45', '#E8336D'], [4, '#FF5E62', '#FF9966'], [8, '#8B5CF6', '#E056FD'], [12.5, '#2563FF', '#22C5E0'],
  [15.5, '#00B894', '#0098C7'], [20, '#3A7BFF', '#00C2FF'], [24, '#FF4F8B', '#FF8A5B'], [27, '#5B5BF0', '#9B7BFF'],
  [33, '#FF8A3D', '#FF3D71'], [37, '#8B5CF6', '#E056FD']];
const SUB = [
  [0, 4, 'Diş hekimlerinin yarısından fazlası, boyun ağrısı yaşıyor.'],
  [4, 8, 'Sebebi belli: saatlerce hastanın ağzına eğilmek.'],
  [8, 12.5, 'Boyun öne düşer, omuzlar kalkar, bel kamburlaşır.'],
  [12.5, 15.5, 'Üç küçük ayar, bunu değiştirir.'],
  [15.5, 20, 'Bir: Hastayı yükselt. Ağzı, dirsek hizana gelsin.'],
  [20, 24, 'İki: Sen eğilme, büyüteçli gözlükle yaklaş.'],
  [24, 27, 'Üç: Her hastadan sonra, otuz saniye esne.'],
  [27, 33, 'Çeneni geri çek, kürek kemiklerini sıkıştır, göğsünü aç.'],
  [33, 37, 'Ağrı ya da uyuşma geçmiyorsa, bir fizyoterapiste görün.'],
  [37, 40, 'Diş hekimi bir arkadaşına gönder!'],
];
const D = { coat: '#FFFFFF', scrub: '#14B8A6', mask: '#9AD8FF', cap: '#14B8A6', glove: '#7DD3FC', chair: '#FFD23F', metal: '#94A3B8', pshirt: '#FF4F8B' };
// clinic group transform (local -> screen)
const K = .94, OX = -12, FY = 1290, OY = FY * (1 - K) - 60;
const sx = x => OX + x * K, sy = y => OY + y * K;

function pill(x, y, w, h, col, al = 1) { g.save(); g.globalAlpha *= al; g.fillStyle = C.navy; rr(x - w / 2 + 5, y - h / 2 + 8, w, h, h / 2); g.fill(); g.fillStyle = col; rr(x - w / 2, y - h / 2, w, h, h / 2); g.fill(); g.restore(); }
function rot(v, a) { return [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)]; }
function add(a, b) { return [a[0] + b[0], a[1] + b[1]]; }
function ik(A, T, L1, L2, pref = 'down') {
  let dx = T[0] - A[0], dy = T[1] - A[1], d = Math.hypot(dx, dy);
  d = clamp(d, Math.abs(L1 - L2) + 1, L1 + L2 - 1);
  const th = Math.atan2(dy, dx), al = Math.acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d));
  const e1 = [A[0] + L1 * Math.cos(th + al), A[1] + L1 * Math.sin(th + al)], e2 = [A[0] + L1 * Math.cos(th - al), A[1] + L1 * Math.sin(th - al)];
  const E = pref === 'down' ? (e1[1] > e2[1] ? e1 : e2) : pref === 'back' ? (e1[0] < e2[0] ? e1 : e2) : (e1[1] < e2[1] ? e1 : e2);
  const a2 = Math.atan2(T[1] - E[1], T[0] - E[0]);
  return [E, [E[0] + L2 * Math.cos(a2), E[1] + L2 * Math.sin(a2)]];
}
function strokePath(drawFn, w, col) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  drawFn(); g.strokeStyle = C.navy; g.lineWidth = w + 12; g.stroke();
  drawFn(); g.strokeStyle = col; g.lineWidth = w; g.stroke();
}

// ---------- dental chair + patient (local coords) ----------
const PC = 716;
function patientMouth(seatY) { return [PC - 268 + 26, seatY - 128]; }
function clinic(seatY, t, lamp = 1) {
  // floor shadow
  g.fillStyle = 'rgba(20,10,60,.22)'; g.beginPath(); g.ellipse(560, FY + 6, 520, 30, 0, 0, Math.PI * 2); g.fill();
  // pedestal
  blob(() => rr(PC - 120, FY - 26, 240, 26, 10), C.metal, 10);
  blob(() => rr(PC - 34, seatY + 20, 68, FY - 26 - seatY - 20, 10), '#CBD5E1', 10);
  // chair: seat, backrest, headrest, leg rest
  segs([[PC - 60, seatY, PC + 190, seatY, 46, D.chair], [PC - 60, seatY, PC - 240, seatY - 26, 46, D.chair],
        [PC + 190, seatY, PC + 262, seatY + 62, 42, D.chair]]);
  blob(() => rr(PC - 312, seatY - 62, 86, 36, 18), D.chair, 10);
  // patient
  const hx = PC - 268, hy = seatY - 90;
  segs([[PC - 220, seatY - 50, PC + 110, seatY - 36, 72, D.pshirt], [PC + 110, seatY - 36, PC + 200, seatY - 34, 54, C.pants],
        [PC + 200, seatY - 34, PC + 250, seatY + 40, 44, C.pants], [PC + 252, seatY + 52, PC + 280, seatY + 30, 30, C.navy]]);
  g.fillStyle = C.navy; circ(hx, hy, 58); g.fill(); g.fillStyle = C.skin; circ(hx, hy, 52); g.fill();
  g.fillStyle = C.hair; g.beginPath(); g.arc(hx, hy, 55, Math.PI * .45, Math.PI * 1.25); g.quadraticCurveTo(hx - 10, hy, hx + 8, hy + 54); g.fill();
  g.fillStyle = C.skin; g.beginPath(); g.moveTo(hx - 4, hy - 48); g.quadraticCurveTo(hx + 4, hy - 72, hx + 14, hy - 48); g.fill();
  g.strokeStyle = C.navy; g.lineWidth = 5; g.beginPath(); g.moveTo(hx - 2, hy - 50); g.quadraticCurveTo(hx + 4, hy - 72, hx + 16, hy - 50); g.stroke();
  g.beginPath(); g.arc(hx - 18, hy - 36, 9, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
  const [mx, my] = patientMouth(seatY);
  g.fillStyle = '#7A1E3A'; g.beginPath(); g.ellipse(mx, my + 8, 12, 9, .3, 0, Math.PI * 2); g.fill();
  // lamp
  if (lamp > 0) {
    g.save(); g.globalAlpha *= lamp;
    const lx = mx + 70, ly = 610;
    const gr = g.createLinearGradient(lx, ly, mx, my);
    gr.addColorStop(0, 'rgba(255,245,180,.55)'); gr.addColorStop(1, 'rgba(255,245,180,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(lx - 40, ly + 20); g.lineTo(lx + 40, ly + 20); g.lineTo(mx + 60, my); g.lineTo(mx - 60, my); g.closePath(); g.fill();
    segs([[lx + 30, ly - 10, 1200, ly - 90, 16, C.metal]]);
    blob(() => { g.beginPath(); g.ellipse(lx, ly, 62, 30, -.25, 0, Math.PI * 2); }, '#E2E8F0', 10);
    g.fillStyle = '#FFF6B0'; g.beginPath(); g.ellipse(lx - 4, ly + 14, 40, 12, -.25, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  return [mx, my];
}

// ---------- dentist (local coords) ----------
function dentist(o) {
  const { hx = 210, hy = 1085, lean = 0, neck = 0, shrug = 0, slump = 0, loupes = 0, tuck = 0, t = 0, arm = 'rest', target = null, pain = 0, painS = 0, painB = 0, armK = 0 } = o;
  // stool
  blob(() => { g.beginPath(); g.ellipse(hx - 10, hy + 34, 90, 22, 0, 0, Math.PI * 2); }, '#475569', 10);
  segs([[hx - 10, hy + 54, hx - 10, FY - 30, 18, C.metal], [hx - 90, FY - 22, hx + 70, FY - 22, 14, C.metal]]);
  g.fillStyle = C.navy; circ(hx - 90, FY - 10, 13); g.fill(); circ(hx + 70, FY - 10, 13); g.fill();
  // legs + coat tail
  segs([[hx, hy, hx + 165, hy + 8, 44, D.scrub], [hx + 165, hy + 8, hx + 172, FY - 14, 40, D.scrub], [hx + 168, FY - 10, hx + 222, FY - 8, 28, '#F1F5F9']]);
  segs([[hx - 4, hy - 6, hx + 64, hy + 22, 58, D.coat]]);
  const H = [hx, hy], S = add(H, rot([10, -262], lean));
  // torso with slump curve
  const mid = [(H[0] + S[0]) / 2, (H[1] + S[1]) / 2], dv = [(S[0] - H[0]) / 262, (S[1] - H[1]) / 262];
  const Cp = [mid[0] + dv[1] * slump * 70, mid[1] - dv[0] * slump * 70];
  strokePath(() => { g.beginPath(); g.moveTo(H[0], H[1] - 6); g.quadraticCurveTo(Cp[0], Cp[1], S[0], S[1]); }, 72, D.coat);
  // scrub V collar
  g.strokeStyle = D.scrub; g.lineWidth = 10; line(S[0] + 4, S[1] + 10, S[0] + 20 + 30 * Math.sin(lean), S[1] + 50);
  const ha = lean + neck;
  const N = add(add(S, [0, -shrug * 10]), rot([16, -58], ha)); N[0] -= tuck * .35;
  segs([[S[0], S[1] - shrug * 10, N[0], N[1], 30, C.skin]]);
  if (pain > 0) pulse((S[0] + N[0]) / 2 - 18, (S[1] + N[1]) / 2, t, pain);
  if (painB > 0) pulse(Cp[0] - 10, Cp[1] + 30, t, painB);
  // head (with cap, mask, loupes)
  const hx0 = 10, hy0 = -55;
  g.save(); g.translate(N[0] - tuck * .65, N[1]); g.rotate(ha);
  drawHead(hx0, hy0, t, pain);
  // surgical cap
  g.fillStyle = C.navy; g.beginPath(); g.arc(hx0, hy0, 68, Math.PI * 1.0, Math.PI * 1.95); g.closePath(); g.fill();
  g.fillStyle = D.cap; g.beginPath(); g.arc(hx0, hy0, 63, Math.PI * 1.02, Math.PI * 1.93); g.closePath(); g.fill();
  // mask
  g.strokeStyle = C.navy; g.lineWidth = 4; line(hx0 + 22, hy0 + 8, hx0 - 6, hy0 + 2);
  g.fillStyle = C.navy; rr(hx0 + 18, hy0 + 2, 60, 46, 14); g.fill(); g.fillStyle = D.mask; rr(hx0 + 22, hy0 + 6, 52, 38, 11); g.fill();
  g.strokeStyle = 'rgba(27,23,69,.35)'; g.lineWidth = 3; line(hx0 + 26, hy0 + 18, hx0 + 70, hy0 + 18); line(hx0 + 26, hy0 + 30, hx0 + 70, hy0 + 30);
  if (loupes > 0) {
    g.save(); g.translate(hx0 + 34, hy0 - 12); g.scale(loupes, loupes);
    g.strokeStyle = C.navy; g.lineWidth = 6; line(-40, 2, 0, 0);
    g.rotate(.4); g.fillStyle = C.navy; rr(-4, -12, 46, 24, 6); g.fill(); g.fillStyle = '#334155'; rr(0, -8, 38, 16, 4); g.fill();
    g.fillStyle = C.cyan; circ(40, 0, 8); g.fill();
    g.restore();
  }
  g.restore();
  const headC = add([N[0] - tuck * .65, N[1]], rot([hx0, hy0], ha));
  // arm
  const A = [S[0] + 6, S[1] + 22 - shrug * 26];
  let T;
  if (arm === 'reach' && target) T = target;
  else if (arm === 'squeeze') T = add(A, [lerp(105, 30, armK), lerp(150, 105, armK)]);
  else if (arm === 'open') T = add(A, [lerp(105, -150, armK), lerp(150, -170, armK)]);
  else T = add(A, [110, 150]);
  const pref = arm === 'squeeze' && armK > .3 ? 'back' : arm === 'open' && armK > .3 ? 'up' : 'down';
  const [E, Hd] = ik(A, T, 135, 148, pref);
  if (painS > 0) pulse(A[0] - 6, A[1] - 14, t, painS, 40);
  segs([[A[0], A[1], E[0], E[1], 36, D.coat], [E[0], E[1], Hd[0], Hd[1], 30, D.coat]]);
  g.fillStyle = C.navy; circ(Hd[0], Hd[1], 21); g.fill(); g.fillStyle = arm === 'reach' ? D.glove : C.skin; circ(Hd[0], Hd[1], 15); g.fill();
  if (arm === 'reach') { const u = [T[0] - E[0], T[1] - E[1]], L = Math.hypot(...u); g.strokeStyle = C.navy; g.lineWidth = 7; line(Hd[0], Hd[1], Hd[0] + u[0] / L * 46, Hd[1] + u[1] / L * 46); g.fillStyle = '#E2E8F0'; circ(Hd[0] + u[0] / L * 50, Hd[1] + u[1] / L * 50, 8); g.fill(); }
  return { S, A, E, Hd, N, headC, back: [Cp[0] - 10, Cp[1] + 30] };
}

function clock(x, y, r, t) {
  g.save(); g.fillStyle = C.navy; circ(x + 5, y + 8, r + 8); g.fill(); g.fillStyle = C.white; circ(x, y, r); g.fill();
  g.strokeStyle = C.navy; g.lineWidth = r * .1; circ(x, y, r); g.stroke(); g.lineCap = 'round';
  const m = t * 6, h = t * .5;
  g.lineWidth = r * .1; line(x, y, x + Math.sin(h) * r * .45, y - Math.cos(h) * r * .45);
  g.strokeStyle = C.coral; g.lineWidth = r * .07; line(x, y, x + Math.sin(m) * r * .7, y - Math.cos(m) * r * .7); g.restore();
}
function label(t, s, x, y, text, col = C.coral) {
  const p = back(prog(t, s, .4)); if (p <= 0) return;
  g.font = '900 42px Inter'; const w = g.measureText(text).width + 50;
  x = clamp(x, w / 2 + 24, 900 - w / 2);
  g.save(); g.translate(x, y); g.scale(p, p); pill(0, 0, w, 76, col); txt(text, 0, 3, 42, '#fff', { weight: 900 }); g.restore();
}

function render(t) {
  t = remap(t);
  bg(t);

  // ---------------- clinic scenes ----------------
  const ca = Math.min(win(t, -1, 12.5, .25), 1) + win(t, 15.5, 24, .25);
  if (ca > 0) {
    // parameters over time
    let seatY = 1198, lean = .45, neck = .6, shrug = .9, slump = .9, loupes = 0, pain = 0, painS = 0, painB = 0;
    if (t < 4) { pain = clamp((t - .3) / .4) * .9; lean = .4; neck = .55; }
    else if (t < 12.5) { const k = eio(prog(t, 4.2, 2)); lean = lerp(.4, .47, k); neck = lerp(.55, .64, k); pain = .9;
      if (t > 8) { painS = clamp((t - 9.2) / .3) * .9; painB = clamp((t - 10) / .3) * .9; } }
    else {
      const up = eio(prog(t, 15.8, 1.2)), st = eio(prog(t, 16.3, 1.2));
      seatY = lerp(1198, 1108, up); lean = lerp(.47, .08, st); neck = lerp(.64, .3, st); shrug = lerp(.9, 0, st); slump = lerp(.9, 0, st);
      pain = lerp(.6, 0, st);
      loupes = back(prog(t, 20.5, .45)); if (t > 20.5) neck = lerp(.3, .22, eio(prog(t, 20.6, .8)));
    }
    g.save(); g.globalAlpha = ca; g.translate(OX, OY); g.scale(K, K);
    const M = clinic(seatY, t);
    const j = dentist({ lean, neck, shrug, slump, loupes, pain, painS, painB, t, arm: 'reach', target: [M[0] - 8, M[1] - 6] });
    g.restore();
    // overlays in screen space
    if (t >= 4 && t < 8) clock(sx(120), sy(700), 70, t * 3);
    if (t >= 8 && t < 12.5) {
      label(t, 8.4, sx(j.N[0]) + 250, sy(j.N[1]) - 50, 'BOYUN ÖNDE');
      label(t, 9.2, sx(j.A[0]) - 60, sy(j.A[1]) - 250, 'OMUZ YUKARIDA');
      label(t, 10.0, sx(j.back[0]) - 40, sy(j.back[1]) - 40, 'BEL KAMBUR');
    }
    if (t >= 17.4 && t < 20) {
      const k = prog(t, 17.4, .5), ey = sy(j.E[1]), x0 = sx(j.E[0]) - 40, x1 = sx(M[0]) + 70;
      g.save(); g.globalAlpha = ca * k; g.setLineDash([18, 12]); g.strokeStyle = '#fff'; g.lineWidth = 8; line(x0, ey, lerp(x0, x1, eo(k)), ey); g.restore();
      check(x1 + 50, ey, 40 * back(prog(t, 17.6, .4)), C.green);
      label(t, 17.8, sx(M[0]) + 30, ey + 110, 'AĞIZ = DİRSEK HİZASI', C.navy);
    }
    if (t >= 20.5 && t < 24) {
      // magnifier bubble
      const p = back(prog(t, 20.9, .5)), bx = sx(M[0]) + 200, by = sy(M[1]) - 260;
      if (p > 0) {
        g.save(); g.globalAlpha = ca; g.translate(bx, by); g.scale(p, p);
        g.strokeStyle = C.navy; g.lineWidth = 22; line(70, 70, 120, 120); g.strokeStyle = C.metal; g.lineWidth = 14; line(70, 70, 118, 118);
        g.fillStyle = C.navy; circ(0, 0, 104); g.fill(); g.fillStyle = '#FFF7EE'; circ(0, 0, 92); g.fill();
        // tooth
        g.fillStyle = C.navy; g.beginPath(); g.moveTo(-44, -38); g.quadraticCurveTo(-50, -70, -18, -64); g.quadraticCurveTo(0, -56, 18, -64);
        g.quadraticCurveTo(50, -70, 44, -38); g.quadraticCurveTo(40, 0, 30, 40); g.quadraticCurveTo(18, 70, 10, 30); g.quadraticCurveTo(0, 10, -10, 30);
        g.quadraticCurveTo(-18, 70, -30, 40); g.quadraticCurveTo(-40, 0, -44, -38); g.fill();
        g.save(); g.scale(.86, .86); g.translate(0, 2); g.fillStyle = '#fff'; g.fill(); g.restore();
        g.fillStyle = 'rgba(46,230,214,.25)'; circ(-30, -30, 30); g.fill();
        g.restore();
        check(bx + 90, by - 80, 38 * back(prog(t, 21.6, .4)), C.green);
      }
    }
  }

  // ---------------- 12.5-15.5: three fixes ----------------
  let k = win(t, 12.5, 15.5);
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    const items = [['1', 'HASTAYI', 'YÜKSELT', C.coral], ['2', 'LUP', 'KULLAN', C.teal], ['3', '30 SN', 'ESNE', C.green]];
    items.forEach(([n, a, b, col], i) => {
      const p = back(prog(t, 12.7 + i * .2, .45)), y = 720 + i * 210;
      g.save(); g.translate(CX, y); g.scale(p, p);
      g.fillStyle = C.navy; rr(-330 + 6, -85 + 10, 660, 170, 40); g.fill(); g.fillStyle = '#fff'; rr(-330, -85, 660, 170, 40); g.fill();
      g.fillStyle = C.navy; circ(-235 + 4, 6, 64); g.fill(); g.fillStyle = col; circ(-235, 0, 60); g.fill();
      txt(n, -235, 4, 70, '#fff', { weight: 900 });
      txt(a + ' ' + b, 70, 4, 54, C.navy, { weight: 900, maxW: 380 });
      g.restore();
    });
    g.restore();
  }

  // ---------------- 24-33: dentist alone, stretches ----------------
  k = win(t, 24, 33);
  if (k > 0) {
    let arm = 'rest', armK = 0, tuck = 0;
    if (t >= 27 && t < 29) { const c = (t - 27.2) % 1; tuck = t > 27.2 ? 34 * Math.sin(Math.PI * clamp(c / .9)) : 0; }
    else if (t >= 29 && t < 31) { arm = 'squeeze'; armK = eio(prog(t, 29.1, .5)) * (1 - eio(prog(t, 30.6, .35))); }
    else if (t >= 31 && t < 33) { arm = 'open'; armK = eio(prog(t, 31.1, .5)) * (1 - eio(prog(t, 32.6, .35))); }
    g.save(); g.globalAlpha = k; g.translate(OX, OY); g.scale(K, K);
    g.fillStyle = 'rgba(20,10,60,.22)'; g.beginPath(); g.ellipse(540, FY + 6, 300, 26, 0, 0, Math.PI * 2); g.fill();
    const j = dentist({ hx: 430, lean: .04, neck: .08, t, arm, armK, tuck, loupes: 1 });
    g.restore();
    if (t >= 27 && t < 29) { g.save(); g.globalAlpha = k * clamp((t - 27.2) / .3); arrow(sx(j.headC[0]) + 70, sy(j.headC[1]) - 110, sx(j.headC[0]) - 50, sy(j.headC[1]) - 110, C.sun, 16); g.restore(); }
    if (t >= 29 && t < 31 && armK > .5) { g.save(); g.globalAlpha = k; arrow(sx(j.A[0]) + 60, sy(j.A[1]) + 60, sx(j.A[0]) - 60, sy(j.A[1]) + 60, C.sun, 14); g.restore(); }
    // stopwatch 24-27
    const sw = win(t, 24.3, 27);
    if (sw > 0) {
      const x = 800, y = 760, r = 110, p = back(prog(t, 24.3, .45));
      g.save(); g.globalAlpha = sw; g.translate(x, y); g.scale(p, p);
      g.fillStyle = C.navy; rr(-24, -r - 40, 48, 30, 8); g.fill(); circ(6, 10, r + 6); g.fill();
      g.fillStyle = '#fff'; circ(0, 0, r); g.fill();
      const sec = Math.min(30, Math.floor(prog(t, 24.6, 2) * 30));
      g.strokeStyle = C.pink; g.lineWidth = 18; g.lineCap = 'round'; g.beginPath(); g.arc(0, 0, r - 22, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * sec / 30); g.stroke();
      txt(String(sec), 0, -8, 76, C.navy, { weight: 900 }); txt('SN', 0, 44, 30, C.mut, { weight: 800 });
      g.restore();
    }
  }

  // ---------------- 33-37: warning ----------------
  k = win(t, 33, 37);
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    const p = back(prog(t, 33.1, .5));
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

  // ---------------- 37-40: share CTA ----------------
  k = win(t, 37, 40.3);
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    const p = back(prog(t, 37.2, .5)), fly = eio(prog(t, 38.4, 1.2));
    g.translate(CX + fly * 380, 860 - fly * 300); g.rotate(-.35 + fly * .1); g.scale(p * (1 - fly * .4), p * (1 - fly * .4));
    const plane = () => { g.beginPath(); g.moveTo(-150, 10); g.lineTo(170, -110); g.lineTo(60, 130); g.lineTo(10, 40); g.closePath(); };
    plane(); g.fillStyle = C.navy; g.save(); g.translate(8, 12); g.fill(); g.restore();
    plane(); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.navy; g.lineWidth = 10; g.lineJoin = 'round'; g.stroke();
    g.beginPath(); g.moveTo(10, 40); g.lineTo(170, -110); g.stroke();
    g.restore();
    sparkle(t, 38.4, CX, 860, 360, 16);
    pill(CX, 1130, 470, 104, C.coral, k * clamp((t - 37.6) / .3)); txt('GÖNDER  ➤', CX, 1133, 54, '#fff', { a: k * clamp((t - 37.6) / .3), weight: 900 });
  }

  // headlines
  headline(t, -0.45, 4, [['DİŞ HEKİMLERİNİN', C.ink, 72], ['YARISINDAN FAZLASI', C.coral, 80], ['BOYUN AĞRISI ÇEKİYOR', C.teal, 64]], 290);
  headline(t, 4, 8, [['SAATLERCE', C.ink, 100], ['ÖNE EĞİK', C.coral, 110]], 330);
  headline(t, 8, 12.5, [['TANIDIK MI?', C.ink, 110]], 360);
  headline(t, 12.5, 15.5, [['3 KÜÇÜK', C.ink, 100], ['AYAR', C.teal, 130]], 330);
  headline(t, 15.5, 20, [['1. HASTAYI', C.ink, 90], ['YÜKSELT', C.teal, 120]], 320);
  headline(t, 20, 24, [['2. EĞİLME,', C.ink, 90], ['LUP KULLAN', C.teal, 110]], 320);
  headline(t, 24, 27, [['3. HER HASTADAN', C.ink, 76], ['SONRA ESNE', C.teal, 110]], 320);
  headline(t, 27, 29, [['ÇENENİ', C.ink, 90], ['GERİ ÇEK', C.teal, 120]], 320);
  headline(t, 29, 31, [['KÜREK KEMİKLERİ', C.ink, 80], ['SIKIŞTIR', C.teal, 120]], 320);
  headline(t, 31, 33, [['GÖĞSÜNÜ', C.ink, 90], ['AÇ', C.teal, 140]], 320);
  headline(t, 33, 37, [['DİKKAT', C.ink, 110]], 360);
  headline(t, 37, 40.3, [['DİŞ HEKİMİ', C.ink, 96], ['ARKADAŞINA GÖNDER', C.coral, 76]], 320);
  // source note for the statistic
  const sa = win(t, .3, 4);
  if (sa > 0) txt('Kaynak: Lietz ve ark., PLoS ONE 2018 (meta-analiz)', CX, 1432, 26, '#fff', { a: sa * .92, weight: 700 });

  subs(t, SUB);
}
