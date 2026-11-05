// Motorcycle courier reel
const DUR = 39.41;
const KN = [[0.0, 0], [4.546, 4], [8.56, 8], [12.455, 12.5], [15.143, 15.5], [19.143, 20], [23.143, 24], [27.118, 27], [32.118, 33], [36.008, 37], [39.408, 40]];
const SCENES = [[0, '#FF7A45', '#E8336D'], [4, '#2563FF', '#22C5E0'], [8, '#8B5CF6', '#E056FD'], [12.5, '#FF4F8B', '#FF8A5B'],
  [15.5, '#00B894', '#0098C7'], [20, '#3A7BFF', '#00C2FF'], [24, '#5B5BF0', '#9B7BFF'], [27, '#00B894', '#0098C7'],
  [33, '#FF8A3D', '#FF3D71'], [37, '#8B5CF6', '#E056FD']];
const SUB = [
  [0, 4, 'Bazı araştırmalarda motokuryelerin dörtte üçü, bel ağrısı yaşıyor.'],
  [4, 8, 'Sebebi: saatlerce motor üstünde, sırtta ağır bir çanta.'],
  [8, 12.5, 'Bel kamburlaşır, boyun öne uzanır, omuzlar yük taşır.'],
  [12.5, 15.5, 'Üç küçük ayar, bunu değiştirir.'],
  [15.5, 20, 'Bir: Yükü sırtta değil, motorun kutusunda taşı.'],
  [20, 24, 'İki: Gidonu ayarla, dirseklerin hafif bükülü olsun.'],
  [24, 27, 'Üç: Teslimatlar arasında motordan in, birkaç adım yürü.'],
  [27, 33, 'Molada çeneni geri çek, ellerini beline koy, geriye esne.'],
  [33, 37, 'Ağrı ya da uyuşma geçmiyorsa, bir fizyoterapiste görün.'],
  [37, 40, 'Motokurye bir arkadaşına gönder!'],
];
const TOP = '#FF8A3D', BOT = '#1E293B', BAG = '#22C55E', HELM = '#E11D48';
const K = .85, OX = 30, OY = 170;
const sx = x => OX + x * K, sy = y => OY + y * K;
const RW = [280, 1185], FW = [800, 1185], PEG = [500, 1150];

function wheel(c, t) {
  blob(() => circ(c[0], c[1], 92), '#1F2937', 10);
  g.fillStyle = '#94A3B8'; circ(c[0], c[1], 46); g.fill();
  g.strokeStyle = '#475569'; g.lineWidth = 6; for (let i = 0; i < 3; i++) { const a = t * 8 + i * 2.09; line(c[0], c[1], c[0] + Math.cos(a) * 44, c[1] + Math.sin(a) * 44); }
}
function bike(t, bar) {
  // road
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 8; g.lineCap = 'round';
  for (let i = 0; i < 6; i++) { const x = ((i * 220 - t * 400) % 1320 + 1320) % 1320 - 120; line(x, 1290, x + 110, 1290); }
  wheel(RW, t); wheel(FW, t);
  segs([[RW[0], RW[1], 470, 1060, 26, '#475569'], [FW[0], FW[1], 740, 930, 24, '#94A3B8'], [740, 930, bar[0], bar[1], 18, '#334155']]);
  blob(() => { g.beginPath(); g.moveTo(300, 1040); g.lineTo(560, 1030); g.lineTo(700, 960); g.lineTo(760, 990); g.lineTo(700, 1110); g.lineTo(380, 1120); g.closePath(); }, C.coral, 10);
  blob(() => rr(330, 1000, 230, 36, 16), '#1F2937', 8);
  blob(() => { g.beginPath(); g.ellipse(775, 970, 26, 20, 0, 0, Math.PI * 2); }, '#FDE68A', 8);
  segs([[PEG[0] - 30, PEG[1], PEG[0] + 30, PEG[1], 14, '#334155']]);
  // top box
  blob(() => rr(150, 880, 170, 140, 18), '#F8FAFC', 10);
  g.fillStyle = C.coral; rr(170, 930, 130, 18, 6); g.fill();
}
function rider(o) {
  const { lean = .3, slump = 0, poke = 0, tuck = 0, bar, t = 0, painB = 0, pain = 0, painS = 0, bag = 1, bagTo = 0 } = o;
  const H = [440, 1000];
  const S = add(H, rot([10, -262], lean));
  const mid = [(H[0] + S[0]) / 2, (H[1] + S[1]) / 2], dv = [(S[0] - H[0]) / 262, (S[1] - H[1]) / 262];
  const Cp = [mid[0] + dv[1] * slump * 60, mid[1] - dv[0] * slump * 60];
  // legs
  const [Kn, Ft] = ik(H, PEG, 190, 200, 'up');
  segs([[H[0], H[1], Kn[0], Kn[1], 46, BOT], [Kn[0], Kn[1], Ft[0], Ft[1], 42, BOT], [Ft[0], Ft[1], Ft[0] + 50, Ft[1] + 4, 28, C.navy]]);
  // backpack (behind torso), can travel to the top box
  if (bag > 0) {
    const back = [Cp[0] - 70, Cp[1] - 10], box = [235, 950];
    const p = [lerp(back[0], box[0], bagTo), lerp(back[1], box[1], bagTo) - Math.sin(bagTo * Math.PI) * 120];
    g.save(); g.translate(p[0], p[1]); g.rotate(lerp(lean, 0, bagTo)); const sc = lerp(1, .8, bagTo); g.scale(sc, sc);
    blob(() => rr(-75, -85, 150, 170, 22), BAG, 10); g.fillStyle = 'rgba(0,0,0,.18)'; rr(-55, -10, 110, 50, 12); g.fill(); g.restore();
  }
  const A = [S[0] + 8 + poke * 18, S[1] + 22], Af = [A[0] - 12, A[1] - 4];
  const [Ef, Hf] = ik(Af, [bar[0] - 6, bar[1] + 4], 128, 140, 'down');
  segs([[Af[0], Af[1], Ef[0], Ef[1], 32, shade(TOP, .82)], [Ef[0], Ef[1], Hf[0], Hf[1], 26, shade(C.skin, .9)]]);
  strokePath(() => { g.beginPath(); g.moveTo(H[0], H[1]); g.quadraticCurveTo(Cp[0], Cp[1], S[0], S[1]); }, 72, TOP);
  if (bag > 0 && bagTo < .3) { g.strokeStyle = C.navy; g.lineWidth = 10; line(S[0] - 10, S[1] + 10, Cp[0] - 20, Cp[1] + 30); }
  const ha = lean + .1 + poke * .45;
  const N = add(add(S, [poke * 26 - tuck * .35, 0]), rot([16, -58], ha));
  segs([[S[0], S[1], N[0], N[1], 30, C.skin]]);
  if (pain > 0) pulse((S[0] + N[0]) / 2 - 16, (S[1] + N[1]) / 2, t, pain);
  const B = [Cp[0] + 4, Cp[1] + 40];
  if (painB > 0) pulse(B[0], B[1], t, painB);
  g.save(); g.translate(N[0] - tuck * .65, N[1]); g.rotate(ha); drawHead(10, -55, t, Math.max(pain, painB));
  // helmet
  g.fillStyle = C.navy; g.beginPath(); g.arc(10, -60, 74, Math.PI * .92, Math.PI * 2.02); g.closePath(); g.fill();
  g.fillStyle = HELM; g.beginPath(); g.arc(10, -60, 68, Math.PI * .95, Math.PI * 1.98); g.closePath(); g.fill();
  g.fillStyle = '#1F2937'; g.beginPath(); g.arc(10, -60, 68, Math.PI * 1.72, Math.PI * 1.98); g.lineTo(70, -40); g.closePath(); g.fill();
  g.restore();
  if (painS > 0) pulse(A[0] - 4, A[1] - 16, t, painS, 40);
  const [En, Hn] = ik(A, bar, 128, 140, 'down');
  segs([[A[0], A[1], En[0], En[1], 34, TOP], [En[0], En[1], Hn[0], Hn[1], 28, C.skin]]);
  g.fillStyle = C.navy; circ(Hn[0], Hn[1], 21); g.fill(); g.fillStyle = '#1F2937'; circ(Hn[0], Hn[1], 15); g.fill();
  return { H, S, A, E: En, B, N };
}

function render(t) {
  t = remapKN(t);
  bg(t);
  OV = 1;

  // ---- riding scenes: bad 0-12.5, fixes 15.5-24
  let k = Math.max(win(t, -1, 12.5), win(t, 15.5, 24)); OV = k;
  if (k > 0) {
    const fix = t >= 15.5;
    const bagTo = fix ? eio(prog(t, 16, 1.3)) : 0;
    const f2 = t >= 20 ? eio(prog(t, 20.3, 1.2)) : 0;
    const relax = fix ? eio(prog(t, 16.4, 1.4)) : 0;
    const bar = [lerp(700, 650, f2), lerp(905, 860, f2)];
    g.save(); g.globalAlpha = k; g.translate(OX, OY); g.scale(K, K);
    bike(t, bar);
    const j = rider({ lean: lerp(.62, .32, relax) - f2 * .06, slump: lerp(1, .3, relax) * (1 - f2), poke: lerp(1, .35, relax) * (1 - f2), bar, t, bag: 1, bagTo,
      painB: fix ? 0 : clamp((t - .3) / .4) * .9, pain: !fix && t > 8 ? .8 : 0, painS: !fix && t > 8 ? clamp((t - 10) / .3) * .8 : 0 });
    g.restore();
    if (t >= 4 && t < 8) { clockIcon(150, 700, 66, t * 3); label(t, 4.8, 200, 900, 'AĞIR ÇANTA', C.navy); }
    if (t >= 8 && t < 12.5) {
      label(t, 8.4, sx(j.B[0]) - 120, sy(j.B[1]) + 60, 'BEL KAMBUR');
      label(t, 9.2, sx(j.N[0]) + 180, sy(j.N[1]) - 150, 'BOYUN ÖNDE');
      label(t, 10.0, sx(j.A[0]) - 120, sy(j.A[1]) - 230, 'OMUZDA YÜK');
    }
    if (fix && t < 20) { label(t, 17.4, sx(235) + 60, sy(800), 'YÜK KUTUDA', C.navy); checkAt(t, 18, sx(560), sy(700)); }
    if (t >= 20) { label(t, 21.4, sx(j.E[0]) + 120, sy(j.E[1]) + 120, 'DİRSEK HAFİF BÜKÜK', C.navy); checkAt(t, 22.2, 880, 700); }
  }

  fixCards(t, 12.5, 15.5, ['YÜK KUTUDA', 'GİDONU AYARLA', 'İN VE YÜRÜ']);

  // ---- 24-27 walk
  k = win(t, 24, 27); OV = k;
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    const ph = (t - 24) * 6;
    stand({ x: 300 + (t - 24) * 70, fy: 1250, s: .8, t, top: TOP, bottom: BOT, shoe: C.navy, footShift: Math.sin(ph) * 30,
      armN: [360 + (t - 24) * 70 + Math.sin(ph) * 40, 1010], armF: [330 + (t - 24) * 70 - Math.sin(ph) * 40, 1010] });
    g.restore();
    label(t, 24.4, 760, 700, 'BİRKAÇ ADIM', C.navy); checkAt(t, 25.2, 900, 620);
  }
  // ---- 27-33 chin tuck, then back extension
  k = win(t, 27, 33); OV = k;
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    const tuck = t < 29.6 ? 34 * Math.max(0, Math.sin((t - 27.3) * 2.6)) : 0;
    const e = eio(prog(t, 29.8, .8)) * (1 - eio(prog(t, 32.3, .5)));
    const j = stand({ x: 430, fy: 1250, s: .8, t, top: TOP, bottom: BOT, shoe: C.navy, tuck, lean: -.32 * e, neck: -.12 * e,
      armN: e > 0 ? [400, 960] : [470, 1010], armF: e > 0 ? [385, 950] : [400, 1010], prefN: e > 0 ? 'back' : 'down', prefF: e > 0 ? 'back' : 'down' });
    g.restore();
    if (t < 29.6 && tuck > 8) { g.save(); g.globalAlpha = k; arrow(j.head[0] + 70, j.head[1] - 110, j.head[0] - 50, j.head[1] - 110, C.sun, 16); g.restore(); }
    if (e > .5) { g.save(); g.globalAlpha = k; arrow(j.head[0] + 30, j.head[1] - 90, j.head[0] - 90, j.head[1] - 60, C.sun, 16); g.restore(); }
    label(t, 27.4, 760, 760, t < 29.6 ? 'ÇENE GERİ' : 'ELLER BELDE', C.navy);
  }

  warnCard(t, 33, 37);
  shareCTA(t, 37, 40.3);

  headline(t, -0.45, 4, [['MOTOKURYELERİN', C.ink, 76], ['DÖRTTE ÜÇÜ', C.coral, 96], ['BEL AĞRISI ÇEKİYOR*', C.teal, 64]], 290);
  headline(t, 4, 8, [['SAATLERCE MOTOR', C.ink, 82], ['SIRTTA YÜK', C.coral, 100]], 330);
  headline(t, 8, 12.5, [['TANIDIK MI?', C.ink, 110]], 360);
  headline(t, 12.5, 15.5, [['3 KÜÇÜK', C.ink, 100], ['AYAR', C.teal, 130]], 330);
  headline(t, 15.5, 20, [['1. YÜKÜ', C.ink, 90], ['KUTUYA KOY', C.teal, 116]], 320);
  headline(t, 20, 24, [['2. GİDONU', C.ink, 90], ['AYARLA', C.teal, 120]], 320);
  headline(t, 24, 27, [['3. İN VE', C.ink, 90], ['YÜRÜ', C.teal, 130]], 320);
  headline(t, 27, 33, [['MOLADA', C.ink, 90], ['ESNE', C.teal, 130]], 300);
  headline(t, 33, 37, [['DİKKAT', C.ink, 110]], 360);
  headline(t, 37, 40.3, [['MOTOKURYE', C.ink, 96], ['ARKADAŞINA GÖNDER', C.coral, 76]], 320);
  sourceNote(t, .3, 4, '*Bazı çalışmalarda. Malezya, 191 teslimat kuryesi (REBA çalışması)');
  subs(t, SUB);
}
