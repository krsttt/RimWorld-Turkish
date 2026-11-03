// Hairdresser reel
const DUR = 38.08;
const KN = [[0.0, 0], [4.14, 4], [8.14, 8], [11.94, 12.5], [14.628, 15.5], [18.709, 20], [22.295, 24], [25.791, 27], [30.791, 33], [34.68, 37], [38.08, 40]];
const SCENES = [[0, '#FF4F8B', '#FF8A5B'], [4, '#8B5CF6', '#E056FD'], [8, '#2563FF', '#22C5E0'], [12.5, '#FF7A45', '#E8336D'],
  [15.5, '#00B894', '#0098C7'], [20, '#3A7BFF', '#00C2FF'], [24, '#5B5BF0', '#9B7BFF'], [27, '#FF4F8B', '#FF8A5B'],
  [33, '#FF8A3D', '#FF3D71'], [37, '#8B5CF6', '#E056FD']];
const SUB = [
  [0, 4, 'Bazı araştırmalarda kuaförlerin dörtte üçü, bel ağrısı yaşıyor.'],
  [4, 8, 'Sebebi: gün boyu ayakta, kollar havada çalışmak.'],
  [8, 12.5, 'Bel öne eğilir, omuzlar kalkar, bilek zorlanır.'],
  [12.5, 15.5, 'Üç küçük ayar, bunu değiştirir.'],
  [15.5, 20, 'Bir: Koltuğu yükselt. Saç, göğüs hizana gelsin.'],
  [20, 24, 'İki: Kollarını, omuz hizasının altında tut.'],
  [24, 27, 'Üç: Yumuşak bir paspas ve rahat ayakkabı kullan.'],
  [27, 33, 'Müşteri arasında omuzlarını geriye doğru çevir, bileklerini esnet.'],
  [33, 37, 'Ağrı ya da uyuşma geçmiyorsa, bir fizyoterapiste görün.'],
  [37, 40, 'Kuaför bir arkadaşına gönder!'],
];
const TOP = '#1F2937', BOT = '#64748B', CAPE = '#C4B5FD', CH = '#8B5CF6';
const scissors = (h, a) => {
  g.save(); g.translate(h[0], h[1]); g.rotate(a - .3); g.lineCap = 'round';
  g.strokeStyle = C.navy; g.lineWidth = 12; line(0, 0, 58, -12); line(0, 0, 58, 12);
  g.strokeStyle = '#E2E8F0'; g.lineWidth = 6; line(0, 0, 58, -12); line(0, 0, 58, 12);
  g.fillStyle = C.navy; circ(-6, -8, 9); g.fill(); circ(-6, 8, 9); g.fill(); g.restore();
};
const HX = 470, FY = 1270;
function salonChair(seatY) {
  g.fillStyle = 'rgba(20,10,60,.22)'; g.beginPath(); g.ellipse(HX + 60, FY + 4, 170, 20, 0, 0, Math.PI * 2); g.fill();
  blob(() => { g.beginPath(); g.ellipse(HX + 50, FY - 10, 120, 18, 0, 0, Math.PI * 2); }, '#94A3B8', 10);
  blob(() => rr(HX + 30, seatY + 10, 40, FY - 20 - seatY - 10, 8), '#CBD5E1', 8);
  segs([[HX - 50, seatY, HX + 120, seatY, 40, CH], [HX - 58, seatY, HX - 70, seatY - 170, 36, CH]]);
}
function client(seatY, t) {
  const h = fig(HX, seatY - 22, { s: .72, furniture: false, laptop: false, mug: false, t });
  // cape
  g.save(); g.fillStyle = C.navy; g.beginPath(); g.moveTo(h.nx - 34, h.ny + 6); g.lineTo(h.nx + 36, h.ny + 4); g.lineTo(HX + 150, seatY + 40); g.lineTo(HX - 40, seatY + 40); g.closePath(); g.fill();
  g.fillStyle = CAPE; g.beginPath(); g.moveTo(h.nx - 28, h.ny + 10); g.lineTo(h.nx + 30, h.ny + 8); g.lineTo(HX + 142, seatY + 32); g.lineTo(HX - 34, seatY + 32); g.closePath(); g.fill(); g.restore();
  return h;
}
function mirror() {
  g.save(); g.fillStyle = C.navy; rr(760 + 6, 600 + 10, 150, 420, 75); g.fill(); g.fillStyle = '#E0F2FE'; rr(760, 600, 150, 420, 75); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 10; g.lineCap = 'round'; line(800, 680, 850, 640); line(800, 730, 870, 670); g.restore();
}
function mat(a) {
  if (a <= 0) return;
  g.save(); g.globalAlpha *= a; blob(() => rr(150, FY - 6, 330, 26, 12), '#334155', 8);
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 4; for (let x = 170; x < 470; x += 22) line(x, FY - 2, x + 10, FY + 16); g.restore();
}

function render(t) {
  t = remapKN(t);
  bg(t);
  OV = 1;

  // ---- salon scenes 0-12.5 (bad) and 15.5-27 (fixes)
  let k = Math.max(win(t, -1, 12.5), win(t, 15.5, 27)); OV = k;
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    const fix = t >= 15.5, f = fix ? eio(prog(t, 15.9, 1.3)) : 0, f2 = fix ? eio(prog(t, 20.4, 1)) : 0;
    const seatY = lerp(1210, 1120, f);
    mirror();
    mat(t >= 24 ? clamp((t - 24.3) / .4) : 0);
    salonChair(seatY);
    const hc = client(seatY, t);
    const lean = lerp(.42, .05, f), shrug = lerp(.85, .35, f) * (1 - f2), elbowUp = !fix || f2 < .5;
    const j = stand({ x: 300, fy: FY, s: .8, lean, neck: lerp(.35, .1, f), shrug, t, top: TOP, bottom: BOT, shoe: C.pink,
      painB: fix ? 0 : clamp((t - .3) / .4) * .85, painS: fix ? 0 : (t > 8 ? clamp((t - 9.2) / .3) * .8 : 0),
      armN: [hc.hx - 20 + 10 * Math.sin(t * 5), hc.hy - 70], armF: [hc.hx + 10, hc.hy - 30], prefN: elbowUp ? 'up' : 'down', prefF: 'down', toolN: scissors });
    g.restore();
    if (t >= 4 && t < 8) clockIcon(150, 680, 70, t * 3);
    if (t >= 8 && t < 12.5) {
      label(t, 8.4, j.B[0] - 80, j.B[1] + 40, 'BEL ÖNE EĞİK');
      label(t, 9.2, j.A[0] - 60, j.A[1] - 190, 'OMUZ YUKARIDA');
      label(t, 10.0, j.Hn[0] + 150, j.Hn[1] - 120, 'BİLEK BÜKÜLÜ');
    }
    if (t >= 17.2 && t < 20) { hline(t, 17.2, 150, 720, j.S[1] + 60, 'SAÇ = GÖĞÜS HİZASI'); checkAt(t, 18, 760, j.S[1] + 60); }
    if (t >= 20.6 && t < 24) { hline(t, 20.6, 150, 720, j.A[1], 'OMUZ HİZASI'); checkAt(t, 21.8, 760, j.A[1] + 80); }
    if (t >= 24.4 && t < 27) { label(t, 24.6, 330, 1150, 'YUMUŞAK PASPAS', C.navy); sparkle(t, 25.2, 340, 1250, 200, 10); checkAt(t, 25.6, 560, 1150); }
  }

  fixCards(t, 12.5, 15.5, ['KOLTUĞU YÜKSELT', 'KOL OMUZ ALTINDA', 'PASPAS + AYAKKABI']);

  // ---- 27-33 stretches: shoulder rolls, wrist stretch
  k = win(t, 27, 33); OV = k;
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    const roll = t < 30 ? Math.max(0, Math.sin((t - 27.2) * 4.2)) : 0;
    const w = t >= 30 ? eio(prog(t, 30.1, .5)) * (1 - eio(prog(t, 32.5, .4))) : 0;
    const j = stand({ x: 400, fy: FY, s: .8, t, top: TOP, bottom: BOT, shoe: C.pink, shrug: roll * .9,
      armN: w > 0 ? [lerp(470, 640, w), lerp(1000, 740, w)] : [460, 1010], armF: w > 0 ? [lerp(390, 600, w), lerp(1000, 720, w)] : [390, 1010], prefN: 'down', prefF: 'down' });
    g.restore();
    if (t >= 27.2 && t < 30) {
      g.save(); g.globalAlpha = k; g.strokeStyle = C.navy; g.lineWidth = 18; g.lineCap = 'round';
      const cx = j.A[0] - 10, cy = j.A[1] - 30, r = 70, a0 = (t - 27.2) * 5;
      g.beginPath(); g.arc(cx, cy, r, a0, a0 + 4.6); g.stroke(); g.strokeStyle = C.sun; g.lineWidth = 10; g.beginPath(); g.arc(cx, cy, r, a0, a0 + 4.6); g.stroke();
      g.restore();
      label(t, 27.4, 700, 640, 'OMUZ GERİYE ÇEVİR', C.navy);
    }
    if (t >= 30.1 && t < 33) label(t, 30.4, 700, 640, 'BİLEK ESNET', C.navy);
  }

  warnCard(t, 33, 37);
  shareCTA(t, 37, 40.3);

  headline(t, -0.45, 4, [['KUAFÖRLERİN', C.ink, 86], ['DÖRTTE ÜÇÜ', C.coral, 96], ['BEL AĞRISI ÇEKİYOR*', C.teal, 64]], 290);
  headline(t, 4, 8, [['GÜN BOYU AYAKTA', C.ink, 84], ['KOLLAR HAVADA', C.coral, 86]], 330);
  headline(t, 8, 12.5, [['TANIDIK MI?', C.ink, 110]], 360);
  headline(t, 12.5, 15.5, [['3 KÜÇÜK', C.ink, 100], ['AYAR', C.teal, 130]], 330);
  headline(t, 15.5, 20, [['1. KOLTUĞU', C.ink, 90], ['YÜKSELT', C.teal, 120]], 320);
  headline(t, 20, 24, [['2. KOLLAR', C.ink, 90], ['OMUZ ALTINDA', C.teal, 110]], 320);
  headline(t, 24, 27, [['3. PASPAS', C.ink, 90], ['RAHAT AYAKKABI', C.teal, 96]], 320);
  headline(t, 27, 33, [['MÜŞTERİ ARASINDA', C.ink, 78], ['30 SN ESNE', C.teal, 110]], 300);
  headline(t, 33, 37, [['DİKKAT', C.ink, 110]], 360);
  headline(t, 37, 40.3, [['KUAFÖR', C.ink, 100], ['ARKADAŞINA GÖNDER', C.coral, 76]], 320);
  sourceNote(t, .3, 4, '*Bazı çalışmalarda. Kozak ve ark., J Occup Med Toxicol 2019');
  subs(t, SUB);
}
