// Professional driver reel
const DUR = 39.01;
const KN = [[0.0, 0], [4.0, 4], [8.083, 8], [11.883, 12.5], [14.571, 15.5], [18.617, 20], [22.536, 24], [26.717, 27], [31.717, 33], [35.607, 37], [39.007, 40]];
const SCENES = [[0, '#3A7BFF', '#00C2FF'], [4, '#FF7A45', '#E8336D'], [8, '#8B5CF6', '#E056FD'], [12.5, '#2563FF', '#22C5E0'],
  [15.5, '#00B894', '#0098C7'], [20, '#FF4F8B', '#FF8A5B'], [24, '#5B5BF0', '#9B7BFF'], [27, '#00B894', '#0098C7'],
  [33, '#FF8A3D', '#FF3D71'], [37, '#8B5CF6', '#E056FD']];
const SUB = [
  [0, 4, 'Profesyonel şoförlerin yarısından fazlası, bel ağrısı yaşıyor.'],
  [4, 8, 'Sebebi: saatlerce oturmak, titreşim ve desteksiz bir sırt.'],
  [8, 12.5, 'Bel çöker, omuzlar öne gelir, kollar fazla uzanır.'],
  [12.5, 15.5, 'Üç küçük ayar, bunu değiştirir.'],
  [15.5, 20, 'Bir: Koltuğu yaklaştır. Dizlerin hafif bükülü olsun.'],
  [20, 24, 'İki: Sırtlığı hafif geriye yatır, beline destek koy.'],
  [24, 27, 'Üç: En geç iki saatte bir mola ver, arabadan in ve yürü.'],
  [27, 33, 'Molada ellerini beline koy, hafifçe geriye esne.'],
  [33, 37, 'Ağrı ya da uyuşma geçmiyorsa, bir fizyoterapiste görün.'],
  [37, 40, 'Şoför bir arkadaşına gönder!'],
];
const TOP = '#0EA5E9', BOT = '#1E3A8A';
const K = .8, OX = 40, OY = 200;
const sx = x => OX + x * K, sy = y => OY + y * K;
const G = [565, 820], WC = [590, 880], P = [700, 1268];

function car(t, shake) {
  // glass + roof + dashboard + floor (local coords)
  g.fillStyle = 'rgba(224,242,254,.35)'; g.beginPath(); g.moveTo(520, 560); g.lineTo(1300, 560); g.lineTo(1300, 900); g.lineTo(660, 900); g.closePath(); g.fill();
  segs([[60, 560, 520, 560, 30, '#E2E8F0'], [520, 560, 670, 900, 26, '#E2E8F0'], [60, 1300, 1200, 1300, 26, '#94A3B8'], [1000, 1040, 1060, 1300, 22, '#94A3B8']]);
  blob(() => { g.beginPath(); g.moveTo(640, 900); g.lineTo(1250, 900); g.lineTo(1250, 1040); g.lineTo(700, 1040); g.closePath(); }, '#475569', 10);
  g.fillStyle = '#1F2937'; rr(760, 930, 160, 50, 12); g.fill(); g.fillStyle = C.cyan; rr(770, 940, 60, 30, 6); g.fill();
  // steering column + wheel
  segs([[WC[0], WC[1], 760, 960, 22, '#334155']]);
  g.save(); g.translate(WC[0], WC[1]); g.rotate(-1.15);
  blob(() => rr(-90, -14, 180, 28, 14), '#1F2937', 10); g.restore();
  // pedal
  g.save(); g.translate(P[0] + 20, P[1] - 4); g.rotate(-.6); blob(() => rr(-10, -30, 20, 60, 6), '#334155', 6); g.restore();
}
function seat(SX, rec, lumbar) {
  const top = [SX - 360 * Math.sin(rec), 1150 - 360 * Math.cos(rec)];
  segs([[SX - 10, 1150, SX + 30, 1300, 22, '#334155']]);
  segs([[SX, 1150, top[0], top[1], 62, '#334155'], [SX, 1150, SX + 220, 1128, 60, '#334155']]);
  const hr = [top[0] - 20 * Math.sin(rec), top[1] - 40 * Math.cos(rec)];
  blob(() => { g.beginPath(); g.ellipse(hr[0], hr[1], 34, 46, -rec, 0, Math.PI * 2); }, '#334155', 10);
  return top;
}
function driver(o) {
  const { SX = 330, rec = .28, slump = 0, poke = 0, slide = 0, t = 0, pain = 0, painB = 0, lumbar = 0 } = o;
  const H = [SX + 55 + slide, 1100];
  const r2 = rec + slump * .12;
  const S = add(H, rot([0, -262], -r2));
  const mid = [(H[0] + S[0]) / 2, (H[1] + S[1]) / 2], dv = [(S[0] - H[0]) / 262, (S[1] - H[1]) / 262];
  const Cp = [mid[0] - dv[1] * slump * 60 * -1, mid[1] + dv[0] * slump * 60 * -1];
  // legs (far then near)
  const [Kf, Ff] = ik([H[0] - 6, H[1]], [P[0] - 14, P[1] - 6], 190, 200, 'up');
  segs([[H[0] - 6, H[1], Kf[0], Kf[1], 44, shade(BOT, .8)], [Kf[0], Kf[1], Ff[0], Ff[1], 40, shade(BOT, .8)]]);
  const [Kn, Fn] = ik(H, P, 190, 200, 'up');
  segs([[H[0], H[1], Kn[0], Kn[1], 46, BOT], [Kn[0], Kn[1], Fn[0], Fn[1], 42, BOT], [Fn[0], Fn[1] + 4, Fn[0] + 50, Fn[1] - 10, 28, C.navy]]);
  // far arm
  const A = [S[0] + 10 + poke * 20, S[1] + 22], Af = [A[0] - 12, A[1] - 4];
  const [Ef, Hf] = ik(Af, [G[0] + 8, G[1] + 6], 128, 140, 'down');
  segs([[Af[0], Af[1], Ef[0], Ef[1], 32, shade(TOP, .82)], [Ef[0], Ef[1], Hf[0], Hf[1], 26, shade(C.skin, .9)]]);
  // torso
  strokePath(() => { g.beginPath(); g.moveTo(H[0], H[1]); g.quadraticCurveTo(Cp[0], Cp[1], S[0], S[1]); }, 72, TOP);
  g.fillStyle = BOT; circ(H[0], H[1], 32); g.fill();
  if (lumbar > 0) { const L = add(H, rot([-44, -86], -rec)); g.save(); g.translate(L[0], L[1]); g.scale(lumbar, lumbar); blob(() => { g.beginPath(); g.ellipse(0, 0, 22, 40, -rec, 0, Math.PI * 2); }, C.orange, 8); g.restore(); }
  const ha = -r2 + .28 + poke * .55;
  const N = add(add(S, [poke * 30, 0]), rot([16, -58], ha));
  segs([[S[0], S[1], N[0], N[1], 30, C.skin]]);
  const B = add(H, rot([-36, -100], -rec));
  if (pain > 0) pulse((S[0] + N[0]) / 2 - 16, (S[1] + N[1]) / 2, t, pain);
  if (painB > 0) pulse(B[0], B[1], t, painB);
  g.save(); g.translate(N[0], N[1]); g.rotate(ha); drawHead(10, -55, t, Math.max(pain, painB)); g.restore();
  // near arm
  const [En, Hn] = ik(A, G, 128, 140, 'down');
  segs([[A[0], A[1], En[0], En[1], 34, TOP], [En[0], En[1], Hn[0], Hn[1], 28, C.skin]]);
  g.fillStyle = C.navy; circ(Hn[0], Hn[1], 21); g.fill(); g.fillStyle = C.skin; circ(Hn[0], Hn[1], 15); g.fill();
  return { H, S, A, E: En, Kn, B, N };
}

function render(t) {
  t = remapKN(t);
  bg(t);
  OV = 1;

  // ---- car scenes 0-12.5 (bad), 15.5-24 (fixes)
  let k = Math.max(win(t, -1, 12.5), win(t, 15.5, 24)); OV = k;
  if (k > 0) {
    const fix = t >= 15.5, f1 = fix ? eio(prog(t, 15.9, 1.3)) : 0, f2 = fix ? eio(prog(t, 20.3, 1.2)) : 0;
    const shake = t >= 4 && t < 8 ? Math.sin(t * 60) * 3 : 0;
    const SX = lerp(250, 320, f1), rec = lerp(.5, .3, f2), slump = lerp(1, .5, f1) * (1 - f2), poke = lerp(1, .4, f1) * (1 - f2), slide = lerp(35, 0, f1);
    g.save(); g.globalAlpha = k; g.translate(OX, OY + shake); g.scale(K, K);
    car(t, shake);
    seat(SX, rec, 0);
    const j = driver({ SX, rec, slump, poke, slide, t, painB: fix ? 0 : clamp((t - .3) / .4) * .9, pain: fix ? 0 : (t > 8 ? .7 : 0), lumbar: fix ? back(prog(t, 21.2, .45)) : 0 });
    g.restore();
    if (t >= 4 && t < 8) {
      clockIcon(150, 760, 66, t * 3);
      g.save(); g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 6; g.lineCap = 'round';
      for (let i = 0; i < 3; i++) { const y = 1150 + i * 26, o = Math.sin(t * 30 + i) * 6; line(sx(80), y + o, sx(200), y - o); }
      g.restore();
    }
    if (t >= 8 && t < 12.5) {
      label(t, 8.4, sx(j.B[0]) - 90, sy(j.B[1]) + 30, 'BEL ÇÖKÜK');
      label(t, 9.2, sx(j.S[0]) - 40, sy(j.S[1]) - 170, 'OMUZ ÖNDE');
      label(t, 10.0, 690, sy(j.E[1]) - 130, 'KOL GERGİN');
    }
    if (fix && t < 20) { label(t, 17.4, 620, sy(j.Kn[1]) - 120, 'DİZ HAFİF BÜKÜLÜ', C.navy); checkAt(t, 18, 880, sy(j.Kn[1]) - 200); }
    if (t >= 20 && t < 24) {
      const a = clamp((t - 21.4) / .4);
      if (a > 0) {
        g.save(); g.globalAlpha = a; g.translate(OX, OY); g.scale(K, K);
        g.strokeStyle = C.navy; g.lineWidth = 16; g.beginPath(); g.arc(SX, 1150, 120, -Math.PI / 2 - rec, 0); g.stroke();
        g.strokeStyle = C.sun; g.lineWidth = 9; g.beginPath(); g.arc(SX, 1150, 120, -Math.PI / 2 - rec, 0); g.stroke(); g.restore();
        label(t, 21.6, sx(SX) + 40, sy(1150) + 80, '100–110°', C.navy);
      }
      label(t, 21.4, sx(j.B[0]) - 120, sy(j.B[1]) - 120, 'BEL DESTEĞİ', C.orange);
      checkAt(t, 22.2, 860, 700);
    }
  }

  fixCards(t, 12.5, 15.5, ['KOLTUĞU YAKLAŞTIR', 'BELE DESTEK KOY', '2 SAATTE 1 MOLA']);

  // ---- 24-27 break: walk
  k = win(t, 24, 27); OV = k;
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    const ph = (t - 24) * 6;
    stand({ x: 300 + (t - 24) * 70, fy: 1250, s: .8, t, top: TOP, bottom: BOT, shoe: C.navy, footShift: Math.sin(ph) * 30,
      armN: [360 + (t - 24) * 70 + Math.sin(ph) * 40, 1010], armF: [330 + (t - 24) * 70 - Math.sin(ph) * 40, 1010] });
    g.restore();
    g.save(); g.globalAlpha = k; pill(760, 700, 260, 100, '#fff'); txt('2 SAAT', 760, 704, 54, C.navy, { weight: 900 }); g.restore();
    checkAt(t, 25.2, 900, 640);
  }
  // ---- 27-33 back extension
  k = win(t, 27, 33); OV = k;
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    const e = eio(prog(t, 27.4, .9)) * (1 - eio(prog(t, 32.2, .6)));
    const j = stand({ x: 430, fy: 1250, s: .8, t, top: TOP, bottom: BOT, shoe: C.navy, lean: -.32 * e, neck: -.12 * e,
      armN: [400, 960], armF: [385, 950], prefN: 'back', prefF: 'back' });
    g.restore();
    if (e > .5) arrow(j.head[0] + 30, j.head[1] - 90, j.head[0] - 90, j.head[1] - 60, C.sun, 16);
    label(t, 27.8, 760, 760, 'ELLER BELDE', C.navy);
  }

  warnCard(t, 33, 37);
  shareCTA(t, 37, 40.3);

  headline(t, -0.45, 4, [['ŞOFÖRLERİN', C.ink, 90], ['YARISINDAN FAZLASI', C.coral, 80], ['BEL AĞRISI ÇEKİYOR', C.teal, 64]], 290);
  headline(t, 4, 8, [['SAATLERCE', C.ink, 96], ['DİREKSİYONDA', C.coral, 92]], 330);
  headline(t, 8, 12.5, [['TANIDIK MI?', C.ink, 110]], 360);
  headline(t, 12.5, 15.5, [['3 KÜÇÜK', C.ink, 100], ['AYAR', C.teal, 130]], 330);
  headline(t, 15.5, 20, [['1. KOLTUĞU', C.ink, 90], ['YAKLAŞTIR', C.teal, 116]], 320);
  headline(t, 20, 24, [['2. BELE', C.ink, 90], ['DESTEK KOY', C.teal, 116]], 320);
  headline(t, 24, 27, [['3. 2 SAATTE', C.ink, 90], ['BİR MOLA', C.teal, 116]], 320);
  headline(t, 27, 33, [['MOLADA', C.ink, 90], ['GERİYE ESNE', C.teal, 110]], 300);
  headline(t, 33, 37, [['DİKKAT', C.ink, 110]], 360);
  headline(t, 37, 40.3, [['ŞOFÖR', C.ink, 100], ['ARKADAŞINA GÖNDER', C.coral, 76]], 320);
  sourceNote(t, .3, 4, 'Kaynak: Joseph ve ark., J Occup Health 2020 (sistematik derleme)');
  subs(t, SUB);
}
