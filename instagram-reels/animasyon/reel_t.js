// Teacher reel
const DUR = 38.72;
const KN = [[0.0, 0], [3.809, 4], [7.835, 8], [11.635, 12.5], [14.323, 15.5], [18.366, 20], [22.366, 24], [26.434, 27], [31.434, 33], [35.324, 37], [38.724, 40]];
const SCENES = [[0, '#FF7A45', '#E8336D'], [4, '#2563FF', '#22C5E0'], [8, '#8B5CF6', '#E056FD'], [12.5, '#FF4F8B', '#FF8A5B'],
  [15.5, '#00B894', '#0098C7'], [20, '#5B5BF0', '#9B7BFF'], [24, '#FF8A3D', '#FF3D71'], [27, '#3A7BFF', '#00C2FF'],
  [33, '#FF8A3D', '#FF3D71'], [37, '#8B5CF6', '#E056FD']];
const SUB = [
  [0, 4, 'Öğretmenlerin neredeyse yarısı, bel ağrısı yaşıyor.'],
  [4, 8, 'Sebebi: saatlerce ayakta durmak ve eğilerek kağıt okumak.'],
  [8, 12.5, 'Bel yorulur, boyun eğilir, omuz zorlanır.'],
  [12.5, 15.5, 'Üç küçük ayar, bunu değiştirir.'],
  [15.5, 20, 'Bir: Tahtaya, omuz ile göz hizası arasında yaz.'],
  [20, 24, 'İki: Kağıt okurken kağıdı yükselt, boynunu eğme.'],
  [24, 27, 'Üç: Ayakta dururken ağırlığını değiştir, ara ara otur.'],
  [27, 33, 'Teneffüste kollarını yukarı uzat, iki yana doğru esne.'],
  [33, 37, 'Ağrı ya da uyuşma geçmiyorsa, bir fizyoterapiste görün.'],
  [37, 40, 'Öğretmen bir arkadaşına gönder!'],
];
const TOP = '#FFB020', BOT = '#3B3FB6';
const marker = (h, a) => { g.save(); g.translate(h[0], h[1]); g.rotate(a); g.fillStyle = C.navy; rr(-8, -12, 52, 24, 6); g.fill(); g.fillStyle = C.teal; rr(-4, -8, 40, 16, 4); g.fill(); g.restore(); };
const redpen = (h, a) => { g.save(); g.translate(h[0], h[1]); g.rotate(a + .6); g.fillStyle = C.navy; rr(-6, -7, 58, 14, 5); g.fill(); g.fillStyle = C.coral; rr(-2, -4, 48, 8, 3); g.fill(); g.restore(); };

function board(x0, y0, x1, y1, t, scribY, prog1 = 1, zone = null) {
  g.save();
  g.fillStyle = C.navy; rr(x0 - 14 + 6, y0 - 14 + 10, x1 - x0 + 28, y1 - y0 + 28, 18); g.fill();
  g.fillStyle = '#CBD5E1'; rr(x0 - 14, y0 - 14, x1 - x0 + 28, y1 - y0 + 28, 18); g.fill();
  g.fillStyle = '#F8FAFC'; rr(x0, y0, x1 - x0, y1 - y0, 8); g.fill();
  if (zone) { g.fillStyle = `rgba(22,199,132,${.35 * zone.a})`; rr(x0, zone.y0, x1 - x0, zone.y1 - zone.y0, 4); g.fill(); }
  // scribbles
  g.strokeStyle = C.teal; g.lineWidth = 6; g.lineCap = 'round';
  for (let r = 0; r < 3; r++) {
    const yy = scribY + r * 44, len = (x1 - x0 - 80) * clamp(prog1 * 3 - r);
    if (len <= 0) continue;
    g.beginPath(); for (let i = 0; i <= len; i += 8) g.lineTo(x0 + 40 + i, yy + Math.sin(i * .25 + r) * 7); g.stroke();
  }
  g.fillStyle = '#94A3B8'; rr(x0, y1 + 10, x1 - x0, 14, 6); g.fill();
  g.restore();
}
function papersFlat(x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); for (let i = 0; i < 3; i++) blob(() => rr(-70 + i * 4, -14 - i * 6, 150, 16, 4), '#fff', 6); g.restore(); }
function bookStand(x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  blob(() => { g.beginPath(); g.moveTo(-60, 0); g.lineTo(60, 0); g.lineTo(30, -150); g.closePath(); }, C.wood, 8);
  g.save(); g.translate(20, -80); g.rotate(-.35); blob(() => rr(-60, -95, 26, 190, 6), '#fff', 6);
  g.strokeStyle = C.mut; g.lineWidth = 4; for (let i = 0; i < 6; i++) line(-50, -70 + i * 26, -40, -70 + i * 26); g.restore();
  g.restore();
}
function stool(x, fy, s = .8) {
  g.save(); g.translate(x, fy); g.scale(s, s);
  segs([[-50, -10, -30, -230, 16, C.navy], [50, -10, 30, -230, 16, C.navy]], 0);
  blob(() => { g.beginPath(); g.ellipse(0, -240, 80, 22, 0, 0, Math.PI * 2); }, C.chair, 10);
  g.restore();
}

function render(t) {
  t = remapKN(t);
  bg(t);
  OV = 1;

  // ---- board scenes: 0-4 (bad) and 15.5-20 (fix)
  let k = Math.max(win(t, -1, 4), win(t, 15.5, 20)); OV = k;
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    const fix = t >= 15.5, f = fix ? eio(prog(t, 16, 1.2)) : 0;
    const bx0 = 560, by0 = 600, bx1 = 900, by1 = 1090;
    // zone between eye and shoulder, measured on the upright pose
    g.save(); g.globalAlpha = 0; const up = stand({ x: 330, fy: 1270, s: .72, t }); g.restore();
    const zy0 = up.eye[1] - 6, zy1 = up.S[1] + 10, zm = (zy0 + zy1) / 2;
    const zone = fix ? { y0: zy0, y1: zy1, a: clamp((t - 15.8) / .4) } : null;
    board(bx0, by0, bx1, by1, t, lerp(628, zm - 30, f), fix ? clamp((t - 17.2) / 2) : clamp(t / 3.5), zone);
    const j = stand({ x: 330, fy: 1270, s: .72, lean: lerp(-.06, 0, f), neck: lerp(-.38, 0, f), shrug: lerp(.85, 0, f), t, top: TOP, bottom: BOT,
      painB: fix ? 0 : clamp((t - .3) / .4) * .85, painS: fix ? 0 : clamp((t - .3) / .4) * .6,
      armN: [bx0 + 60 + 30 * Math.sin(t * 3), lerp(628, zm, f)], armF: [360, 1030], prefN: 'down', toolN: marker });
    g.restore();
    if (fix) { label(t, 16.4, 730, zy0 - 60, 'OMUZ – GÖZ ARASI', C.navy); checkAt(t, 17.6, 930, zm); }
  }

  // ---- grading scenes: 4-8 (bad) and 20-24 (fix)
  k = Math.max(win(t, 4, 8), win(t, 20, 24)); OV = k;
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    const fix = t >= 20, f = fix ? eio(prog(t, 20.4, 1.2)) : 0;
    const hx = 300, hy = 1090;
    const h = fig(hx, hy, { fwd: lerp(58, 0, f), down: lerp(.55, .12, f), pain: fix ? 0 : .9, t, laptop: false, mug: true });
    if (!fix || f < .5) papersFlat(hx + 300, hy - 120, 1);
    if (fix) { g.save(); g.globalAlpha *= clamp((t - 20.6) / .4); bookStand(hx + 330, hy - 118, 1); g.restore(); }
    g.restore();
    if (t >= 4 && t < 8) clockIcon(170, 690, 70, t * 3);
    if (fix) checkAt(t, 21.8, 840, 760);
  }

  // ---- 8-12.5 split: grading (neck) + board (back, shoulder)
  k = win(t, 8, 12.5); OV = k;
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    const h = fig(150, 1090, { s: .6, fwd: 58, down: .55, pain: .9, t, laptop: false });
    papersFlat(150 + 300 * .6, 1090 - 120 * .6, .6);
    board(700, 640, 900, 1000, t, 670, 1);
    const j = stand({ x: 640, fy: 1250, s: .6, lean: -.06, neck: -.38, shrug: .85, t, top: TOP, bottom: BOT, painB: .85, painS: .7,
      armN: [740, 660], armF: [660, 1060], toolN: marker });
    g.restore();
    label(t, 8.4, 250, 800, 'BOYUN EĞİLİR');
    label(t, 9.2, 560, 560, 'OMUZ ZORLANIR');
    label(t, 10.0, 640, 1150, 'BEL YORULUR');
  }

  fixCards(t, 12.5, 15.5, ['TAHTADA ORTADAN YAZ', 'KAĞIDI YÜKSELT', 'AĞIRLIĞI DEĞİŞTİR']);

  // ---- 24-27 weight shift + stool
  k = win(t, 24, 27); OV = k;
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    const sh = Math.sin((t - 24) * 4);
    stool(700, 1250, .85 * back(prog(t, 25.2, .5)));
    stand({ x: 400 + sh * 10, fy: 1250, s: .8, t, top: TOP, bottom: BOT, footShift: sh * 14, armN: [470, 1000], armF: [380, 1000] });
    g.restore();
    label(t, 25.4, 720, 860, 'ARA ARA OTUR', C.navy);
    checkAt(t, 25.8, 860, 760);
  }

  // ---- 27-33 front stretch
  k = win(t, 27, 33); OV = k;
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    const up = eio(prog(t, 27.2, .7)) * (1 - eio(prog(t, 32.4, .5)));
    const bend = -.28 * eio(prog(t, 28.2, .7)) * (1 - eio(prog(t, 29.6, .5))) + .28 * eio(prog(t, 30.2, .7)) * (1 - eio(prog(t, 31.6, .5)));
    frontStretch(CX, 1250, { s: .78, up, bend, t, top: TOP, bottom: BOT });
    g.restore();
    if (t > 28.2 && t < 29.8) { arrow(CX + 40, 560, CX - 160, 600, C.sun, 16); }
    if (t > 30.2 && t < 31.8) { arrow(CX - 40, 560, CX + 160, 600, C.sun, 16); }
  }

  warnCard(t, 33, 37);
  shareCTA(t, 37, 40.3);

  headline(t, -0.45, 4, [['ÖĞRETMENLERİN', C.ink, 78], ['NEREDEYSE YARISI', C.coral, 80], ['BEL AĞRISI ÇEKİYOR', C.teal, 64]], 290);
  headline(t, 4, 8, [['SAATLERCE AYAKTA', C.ink, 82], ['EĞİLEREK OKUMA', C.coral, 80]], 330);
  headline(t, 8, 12.5, [['TANIDIK MI?', C.ink, 110]], 360);
  headline(t, 12.5, 15.5, [['3 KÜÇÜK', C.ink, 100], ['AYAR', C.teal, 130]], 330);
  headline(t, 15.5, 20, [['1. TAHTAYA', C.ink, 90], ['ORTADAN YAZ', C.teal, 110]], 320);
  headline(t, 20, 24, [['2. KAĞIDI', C.ink, 90], ['YÜKSELT', C.teal, 120]], 320);
  headline(t, 24, 27, [['3. AĞIRLIĞINI', C.ink, 84], ['DEĞİŞTİR', C.teal, 120]], 320);
  headline(t, 27, 33, [['KOLLAR YUKARI', C.ink, 84], ['YANA ESNE', C.teal, 110]], 300);
  headline(t, 33, 37, [['DİKKAT', C.ink, 110]], 360);
  headline(t, 37, 40.3, [['ÖĞRETMEN', C.ink, 100], ['ARKADAŞINA GÖNDER', C.coral, 76]], 320);
  sourceNote(t, .3, 4, 'Kaynak: Tahernejad ve ark., Front. Public Health 2024 (meta-analiz)');
  subs(t, SUB);
}
