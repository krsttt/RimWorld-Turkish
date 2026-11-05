// Nurse reel
const DUR = 39.18;
const KN = [[0.0, 0], [4.0, 4], [7.817, 8], [11.617, 12.5], [14.305, 15.5], [18.305, 20], [23.323, 24], [26.891, 27], [31.891, 33], [35.781, 37], [39.181, 40]];
const SCENES = [[0, '#14B8A6', '#2563FF'], [4, '#FF7A45', '#E8336D'], [8, '#8B5CF6', '#E056FD'], [12.5, '#2563FF', '#22C5E0'],
  [15.5, '#00B894', '#0098C7'], [20, '#FF4F8B', '#FF8A5B'], [24, '#5B5BF0', '#9B7BFF'], [27, '#00B894', '#0098C7'],
  [33, '#FF8A3D', '#FF3D71'], [37, '#8B5CF6', '#E056FD']];
const SUB = [
  [0, 4, 'Hemşirelerin yaklaşık üçte ikisi, işe bağlı bel ağrısı yaşıyor.'],
  [4, 8, 'En büyük risk: hastayı kaldırmak, çevirmek ve taşımak.'],
  [8, 12.5, 'Bel bükülür, yük vücuttan uzaklaşır, gövde döner.'],
  [12.5, 15.5, 'Üç küçük ayar, bunu değiştirir.'],
  [15.5, 20, 'Bir: Yatağı yükselt, bel hizana getir.'],
  [20, 24, 'İki: Ağır hastayı tek başına kaldırma, kaydırma örtüsü ve yardım iste.'],
  [24, 27, 'Üç: Dönerken gövdeni değil, ayaklarını çevir.'],
  [27, 33, 'Vardiya arasında ellerini beline koy, hafifçe geriye esne.'],
  [33, 37, 'Ağrı ya da uyuşma geçmiyorsa, bir fizyoterapiste görün.'],
  [37, 40, 'Hemşire bir arkadaşına gönder!'],
];
const TOP = '#14B8A6', BOT = '#0F766E', FY = 1270;
const BX0 = 400, BX1 = 830;

function bed(top, sheet = 0) {
  // frame + legs (height adjustable)
  segs([[BX0 + 30, top + 40, BX0 + 30, FY - 20, 18, '#94A3B8'], [BX1 - 30, top + 40, BX1 - 30, FY - 20, 18, '#94A3B8']]);
  g.fillStyle = C.navy; circ(BX0 + 30, FY - 10, 14); g.fill(); circ(BX1 - 30, FY - 10, 14); g.fill();
  blob(() => rr(BX0, top + 20, BX1 - BX0, 30, 10), '#CBD5E1', 10);
  blob(() => rr(BX0, top - 16, BX1 - BX0, 40, 16), '#fff', 10);
  if (sheet > 0) { g.save(); g.globalAlpha *= sheet; g.fillStyle = C.cyan; rr(BX0 + 30, top - 22, BX1 - BX0 - 60, 14, 6); g.fill(); g.restore(); }
  segs([[BX1 - 4, top - 10, BX1 - 4, top - 120, 16, '#94A3B8']]);
}
function patient(top, t) {
  const hx = BX0 + 70, hy = top - 60;
  segs([[hx + 50, top - 40, BX1 - 120, top - 34, 66, '#A5B4FC'], [BX1 - 120, top - 34, BX1 - 40, top - 30, 44, '#A5B4FC']]);
  g.fillStyle = C.navy; circ(hx, hy, 52); g.fill(); g.fillStyle = C.skin; circ(hx, hy, 46); g.fill();
  g.fillStyle = C.hair; g.beginPath(); g.arc(hx, hy, 48, Math.PI * .5, Math.PI * 1.3); g.closePath(); g.fill();
  g.strokeStyle = C.navy; g.lineWidth = 5; g.beginPath(); g.arc(hx + 10, hy - 18, 8, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
  // blanket
  blob(() => rr(hx + 70, top - 74, BX1 - hx - 100, 50, 22), '#FDE68A', 8);
  return [hx + 40, top - 50];
}
function feetDiagram(t, x, y, a) {
  g.save(); g.translate(x, y);
  g.fillStyle = '#fff'; g.strokeStyle = C.navy; g.lineWidth = 8;
  rr(-150, -150, 300, 300, 40); g.fill(); g.stroke();
  g.rotate(a);
  for (const dx of [-40, 40]) { g.fillStyle = C.navy; g.beginPath(); g.ellipse(dx, 0, 26, 56, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = TOP; g.beginPath(); g.ellipse(dx, 0, 20, 50, 0, 0, Math.PI * 2); g.fill(); }
  g.restore();
  g.save(); g.translate(x, y); g.strokeStyle = C.coral; g.lineWidth = 10; g.lineCap = 'round';
  g.beginPath(); g.arc(0, 0, 110, -Math.PI * .9, -Math.PI * .3); g.stroke(); g.restore();
}

function render(t) {
  t = remapKN(t);
  bg(t);
  OV = 1;

  // ---- bedside scenes: bad 0-12.5, fixes 15.5-24
  let k = Math.max(win(t, -1, 12.5), win(t, 15.5, 24)); OV = k;
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    const fix = t >= 15.5, f = fix ? eio(prog(t, 15.9, 1.3)) : 0;
    const top = lerp(1150, 1000, f);
    const sheet = t >= 20 ? clamp((t - 20.4) / .5) : 0;
    bed(top, sheet);
    const P = patient(top, t);
    if (t >= 20) {
      // helper on the far side
      g.save(); g.globalAlpha *= clamp((t - 20.8) / .5);
      stand({ x: 820, fy: FY, s: .72, lean: .15, t, top: '#0EA5E9', bottom: '#075985', shoe: C.navy, armN: [P[0] + 160, top - 40], armF: [P[0] + 140, top - 50] });
      g.restore();
    }
    const lift = t >= 4 && t < 8 ? Math.max(0, Math.sin((t - 4.2) * 2.2)) : 0;
    const lean = lerp(.62, .14, f) - lift * .12, neck = lerp(.3, .08, f);
    const j = stand({ x: 300, fy: FY, s: .8, lean, neck, t, top: TOP, bottom: BOT, shoe: '#fff', knee: fix ? .25 : 0,
      painB: fix ? 0 : clamp((t - .3) / .4) * .9, armN: [P[0] + 30, P[1] - lift * 40], armF: [P[0] + 60, P[1] - 10 - lift * 40] });
    g.restore();
    if (t >= 4 && t < 8) { g.save(); g.globalAlpha = k; arrow(760, 1000, 760, 860, C.sun, 16); g.restore(); clockIcon(150, 700, 66, t * 3); }
    if (t >= 8 && t < 12.5) {
      label(t, 8.4, j.B[0] - 60, j.B[1] + 70, 'BEL BÜKÜK');
      label(t, 9.2, j.Hn[0] + 160, j.Hn[1] - 230, 'YÜK UZAKTA');
      label(t, 10.0, j.S[0] - 40, j.S[1] - 200, 'GÖVDE DÖNÜK');
    }
    if (fix && t < 20) { hline(t, 17.2, 150, 900, j.H[1], 'BEL HİZASI'); checkAt(t, 18, 940, j.H[1] - 80); }
    if (t >= 20) { if (sheet > .5) { g.save(); g.globalAlpha = k; arrow(560, top - 120, 760, top - 120, C.sun, 14); g.restore(); }
      label(t, 21, 640, top - 220, 'ÖRTÜ + YARDIM', C.navy); checkAt(t, 21.8, 900, top - 300); }
  }

  fixCards(t, 12.5, 15.5, ['YATAĞI YÜKSELT', 'ÖRTÜ + YARDIM', 'AYAKLARINI ÇEVİR']);

  // ---- 24-27 pivot with the feet
  k = win(t, 24, 27); OV = k;
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    stand({ x: 300, fy: FY, s: .8, t, top: TOP, bottom: BOT, shoe: '#fff', footShift: Math.sin((t - 24) * 3) * 8, armN: [380, 1000], armF: [350, 1000] });
    feetDiagram(t, 700, 900, -eio(prog(t, 24.4, 1.2)) * Math.PI / 2);
    g.restore();
    label(t, 24.6, 700, 700, 'AYAKLAR DÖNER', C.navy); checkAt(t, 25.6, 850, 780);
  }
  // ---- 27-33 back extension
  k = win(t, 27, 33); OV = k;
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    const e = eio(prog(t, 27.4, .9)) * (1 - eio(prog(t, 32.2, .6)));
    const j = stand({ x: 430, fy: 1250, s: .8, t, top: TOP, bottom: BOT, shoe: '#fff', lean: -.32 * e, neck: -.12 * e,
      armN: [400, 960], armF: [385, 950], prefN: 'back', prefF: 'back' });
    g.restore();
    if (e > .5) { g.save(); g.globalAlpha = k; arrow(j.head[0] + 30, j.head[1] - 90, j.head[0] - 90, j.head[1] - 60, C.sun, 16); g.restore(); }
    label(t, 27.8, 760, 760, 'ELLER BELDE', C.navy);
  }

  warnCard(t, 33, 37);
  shareCTA(t, 37, 40.3);

  headline(t, -0.45, 4, [['HEMŞİRELERİN', C.ink, 84], ['ÜÇTE İKİSİ', C.coral, 96], ['BEL AĞRISI ÇEKİYOR', C.teal, 64]], 290);
  headline(t, 4, 8, [['KALDIR, ÇEVİR,', C.ink, 86], ['TAŞI', C.coral, 110]], 330);
  headline(t, 8, 12.5, [['TANIDIK MI?', C.ink, 110]], 360);
  headline(t, 12.5, 15.5, [['3 KÜÇÜK', C.ink, 100], ['AYAR', C.teal, 130]], 330);
  headline(t, 15.5, 20, [['1. YATAĞI', C.ink, 90], ['YÜKSELT', C.teal, 120]], 320);
  headline(t, 20, 24, [['2. TEK BAŞINA', C.ink, 84], ['KALDIRMA', C.teal, 116]], 320);
  headline(t, 24, 27, [['3. AYAKLARINLA', C.ink, 80], ['DÖN', C.teal, 130]], 320);
  headline(t, 27, 33, [['VARDİYA ARASI', C.ink, 84], ['GERİYE ESNE', C.teal, 110]], 300);
  headline(t, 33, 37, [['DİKKAT', C.ink, 110]], 360);
  headline(t, 37, 40.3, [['HEMŞİRE', C.ink, 100], ['ARKADAŞINA GÖNDER', C.coral, 76]], 320);
  sourceNote(t, .3, 4, 'Kaynak: hemşirelerde işe bağlı bel ağrısı meta-analizi (IJOSH)');
  subs(t, SUB);
}
