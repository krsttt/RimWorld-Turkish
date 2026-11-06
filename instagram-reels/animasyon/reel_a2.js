// Mothers 2: lifting and carrying the baby
const DUR = 40.72;
const KN = [[0.0, 0], [4.903, 4], [9.203, 8], [13.264, 12.5], [15.952, 15.5], [20.452, 20], [24.452, 24], [28.427, 27], [33.427, 33], [37.316, 37], [40.716, 40]];
const SCENES = [[0, '#FF7A45', '#E8336D'], [4, '#F472B6', '#8B5CF6'], [8, '#8B5CF6', '#E056FD'], [12.5, '#2563FF', '#22C5E0'],
  [15.5, '#00B894', '#0098C7'], [20, '#FF4F8B', '#FF8A5B'], [24, '#5B5BF0', '#9B7BFF'], [27, '#00B894', '#0098C7'],
  [33, '#FF8A3D', '#FF3D71'], [37, '#F472B6', '#8B5CF6']];
const SUB = [
  [0, 4, 'Pek çok araştırmada, yeni annelerin yüzde kırkından fazlası bel ağrısı yaşıyor.'],
  [4, 8, 'Sebebi: bebeği günde onlarca kez kaldırmak ve kucakta taşımak.'],
  [8, 12.5, 'Bel bükülür, bebek vücuttan uzaklaşır, kalça yana kayar.'],
  [12.5, 15.5, 'Üç küçük ayar, bunu değiştirir.'],
  [15.5, 20, 'Bir: Yerden kaldırırken dizlerini bük, bebeği göğsüne yakın tut.'],
  [20, 24, 'İki: Bebeği hep aynı kalçanda taşıma, taraf değiştir.'],
  [24, 27, 'Üç: Uzun yürüyüşte, iyi oturan bir bebek taşıyıcısı kullan.'],
  [27, 33, 'Gün içinde sırt üstü uzan, dizlerini göğsüne çek, belini nazikçe esnet.'],
  [33, 37, 'Ağrı ya da uyuşma geçmiyorsa, bir fizyoterapiste görün.'],
  [37, 40, 'Yeni bir anneye gönder!'],
];
function mat() { blob(() => rr(520, 1240, 300, 22, 10), C.cyan, 8); }

function render(t) {
  t = remapKN(t);
  bg(t);
  OV = 1;

  // 0-4 bad pick-up from the floor
  let k = win(t, -1, 4); OV = k;
  if (k > 0) {
    g.save(); g.globalAlpha = k; mat(); baby(660, 1205, .9, 0);
    stand({ x: 360, fy: 1260, s: .8, lean: 1.0, neck: .1, t, top: MTOP, bottom: MBOT, shoe: C.navy, painB: clamp((t - .3) / .4) * .9, armN: [640, 1200], armF: [700, 1196] });
    g.restore();
  }
  // 4-8 one-hip carrying
  k = win(t, 4, 8); OV = k;
  if (k > 0) { g.save(); g.globalAlpha = k; frontMom(CX, 1250, { s: .8, hip: 1, side: 1, t, painB: .9 }); g.restore(); clockIcon(150, 700, 66, t * 3); }
  // 8-12.5 split
  k = win(t, 8, 12.5); OV = k;
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    baby(380, 1215, .6, 0);
    const j = stand({ x: 190, fy: 1250, s: .58, lean: 1.0, neck: .1, t, top: MTOP, bottom: MBOT, shoe: C.navy, painB: .9, armN: [370, 1210], armF: [400, 1205] });
    frontMom(740, 1250, { s: .56, hip: 1, side: 1, t, painB: .9 });
    g.restore();
    label(t, 8.4, j.B[0] + 30, j.B[1] - 110, 'BEL BÜKÜK');
    label(t, 9.2, 330, 1130, 'BEBEK UZAKTA');
    label(t, 10.0, 740, 680, 'KALÇA YANA KAYAR');
  }
  fixCards(t, 12.5, 15.5, ['DİZLERİNİ BÜK', 'TARAF DEĞİŞTİR', 'TAŞIYICI KULLAN']);

  // 15.5-20 squat and lift close
  k = win(t, 15.5, 20); OV = k;
  if (k > 0) {
    g.save(); g.globalAlpha = k; mat();
    const sq = eio(prog(t, 15.7, 1)) * (1 - eio(prog(t, 17.4, 1.2))), up = eio(prog(t, 17.4, 1.2));
    g.globalAlpha *= 0; const ghost = stand({ x: 420, fy: 1260, s: .8, t, knee: 3.4 * sq, lean: .35 * sq }); g.globalAlpha = k;
    const bpos = [lerp(640, ghost.S[0] + 90, up), lerp(1205, ghost.S[1] + 110, up)];
    baby(bpos[0], bpos[1], .9, -up * .3);
    stand({ x: 420, fy: 1260, s: .8, t, top: MTOP, bottom: MBOT, shoe: C.navy, knee: 3.4 * sq, lean: .35 * sq,
      armN: [bpos[0] + 20, bpos[1] + 20], armF: [bpos[0] - 40, bpos[1] + 4] });
    g.restore();
    label(t, 16.4, 760, 760, 'DİZLER BÜKÜK', C.navy); if (t > 18.4) label(t, 18.4, 760, 860, 'BEBEK GÖĞÜSTE', C.navy); checkAt(t, 18.8, 900, 680);
  }
  // 20-24 switch sides
  k = win(t, 20, 24); OV = k;
  if (k > 0) {
    g.save(); g.globalAlpha = k; const side = t < 21.9 ? 1 : -1;
    frontMom(CX, 1250, { s: .8, hip: .25, side, t });
    g.restore();
    if (t > 21.4 && t < 22.6) { g.save(); g.globalAlpha = k; arrow(CX + 160, 900, CX - 160, 900, C.sun, 16); g.restore(); }
    label(t, 20.6, 780, 640, 'TARAF DEĞİŞTİR', C.navy); checkAt(t, 22.4, 900, 560);
  }
  // 24-27 carrier
  k = win(t, 24, 27); OV = k;
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    g.globalAlpha *= 0; const gj = stand({ x: 400, fy: 1250, s: .8, t }); g.globalAlpha = k;
    const ph = (t - 24) * 6;
    const j = stand({ x: 400 + (t - 24) * 40, fy: 1250, s: .8, t, top: MTOP, bottom: MBOT, shoe: C.navy, footShift: Math.sin(ph) * 26,
      armN: [470 + (t - 24) * 40, 1000], armF: [430 + (t - 24) * 40, 1000] });
    const bx = j.S[0] + 70, by = j.S[1] + 120;
    g.strokeStyle = C.navy; g.lineWidth = 14; line(j.S[0] - 10, j.S[1] + 10, bx + 10, by - 50);
    blob(() => rr(bx - 60, by - 70, 120, 150, 30), C.coral, 8);
    baby(bx + 6, by - 30, .8, 0, true);
    g.restore();
    label(t, 24.6, 780, 700, 'TAŞIYICI', C.navy); checkAt(t, 25.4, 900, 620);
  }
  // 27-33 knees to chest
  k = win(t, 27, 33); OV = k;
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    const kk = .5 - .5 * Math.cos(clamp((t - 27.4) / 2.6) * Math.PI * 2);
    lyingKnees(560, 1150, kk, t);
    g.restore();
    label(t, 27.6, 640, 820, 'DİZLER GÖĞSE', C.navy);
  }

  warnCard(t, 33, 37);
  shareCTA(t, 37, 40.3);

  headline(t, -0.45, 4, [['YENİ ANNELERİN', C.ink, 80], ['%40\'TAN FAZLASI', C.coral, 88], ['BEL AĞRISI ÇEKİYOR*', C.teal, 64]], 290);
  headline(t, 4, 8, [['GÜNDE ONLARCA KEZ', C.ink, 74], ['KALDIR, TAŞI', C.coral, 96]], 330);
  headline(t, 8, 12.5, [['TANIDIK MI?', C.ink, 110]], 360);
  headline(t, 12.5, 15.5, [['3 KÜÇÜK', C.ink, 100], ['AYAR', C.teal, 130]], 330);
  headline(t, 15.5, 20, [['1. DİZLERİNİ', C.ink, 90], ['BÜK', C.teal, 130]], 320);
  headline(t, 20, 24, [['2. TARAF', C.ink, 90], ['DEĞİŞTİR', C.teal, 120]], 320);
  headline(t, 24, 27, [['3. TAŞIYICI', C.ink, 90], ['KULLAN', C.teal, 120]], 320);
  headline(t, 27, 33, [['DİZLER GÖĞSE', C.ink, 86], ['BELİ ESNET', C.teal, 110]], 300);
  headline(t, 33, 37, [['DİKKAT', C.ink, 110]], 360);
  headline(t, 37, 40.3, [['YENİ BİR ANNEYE', C.ink, 86], ['GÖNDER', C.coral, 100]], 320);
  sourceNote(t, .3, 4, '*Derlemedeki çalışmaların çoğunda. Doğum sonrası bel ağrısı sistematik derlemesi');
  subs(t, SUB);
}
