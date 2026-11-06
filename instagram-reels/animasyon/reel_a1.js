// Mothers 1: breastfeeding posture
const DUR = 39.93;
const KN = [[0.0, 0], [4.215, 4], [7.713, 8], [11.772, 12.5], [14.46, 15.5], [18.46, 20], [23.35, 24], [27.64, 27], [32.64, 33], [36.529, 37], [39.929, 40]];
const SCENES = [[0, '#F472B6', '#8B5CF6'], [4, '#FF7A45', '#E8336D'], [8, '#8B5CF6', '#E056FD'], [12.5, '#2563FF', '#22C5E0'],
  [15.5, '#00B894', '#0098C7'], [20, '#FF4F8B', '#FF8A5B'], [24, '#5B5BF0', '#9B7BFF'], [27, '#00B894', '#0098C7'],
  [33, '#FF8A3D', '#FF3D71'], [37, '#F472B6', '#8B5CF6']];
const SUB = [
  [0, 4, 'Emziren annelerin yaklaşık yarısı, her hafta boyun ağrısı yaşıyor.'],
  [4, 8, 'Sebebi: saatlerce öne eğilip bebeğe bakmak.'],
  [8, 12.5, 'Boyun öne düşer, omuzlar kalkar, sırt kamburlaşır.'],
  [12.5, 15.5, 'Üç küçük ayar, bunu değiştirir.'],
  [15.5, 20, 'Bir: Bebeği kendine getir, sen ona eğilme.'],
  [20, 24, 'İki: Yarı uzanarak ya da yan yatarak emzirmeyi dene, başını destekle.'],
  [24, 27, 'Üç: Sırtına ve kollarının altına yastık koy, ayaklarını yere bas.'],
  [27, 33, 'Emzirmeden sonra çeneni geri çek, omuzlarını geriye çevir.'],
  [33, 37, 'Ağrı ya da uyuşma geçmiyorsa, bir fizyoterapiste görün.'],
  [37, 40, 'Yeni bir anneye gönder!'],
];

function render(t) {
  t = remapKN(t);
  bg(t);
  OV = 1;

  let k = Math.max(win(t, -1, 12.5), win(t, 15.5, 27)); OV = k;
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    const f1 = t >= 15.5 ? eio(prog(t, 15.9, 1.3)) : 0, f2 = t >= 20 ? eio(prog(t, 20.3, 1.3)) : 0, f3 = t >= 24 ? eio(prog(t, 24.3, .8)) : 0;
    const lean = lerp(lerp(.38, .06, f1), -.32, f2) + f3 * .26, neck = lerp(lerp(.8, .32, f1), .18, f2);
    const bp = [lerp(lerp(500, 440, f1), 420, f2), lerp(lerp(1030, 900, f1), 860, f2) + f3 * 30];
    const j = seatedMom({ x: 330, y: 1060, s: .85, lean, neck, t, bp, bRot: lerp(.15, -.1, f1) + f2 * -.25,
      pain: t < 15.5 ? clamp((t - .3) / .4) * .9 : 0, painS: t >= 8 && t < 12.5 ? clamp((t - 9.2) / .3) * .8 : 0,
      armPillow: Math.max(f1 * (1 - f2), f3), headRest: f2 * (1 - f3), backPillow: f3, stool: f3 });
    g.restore();
    if (t >= 4 && t < 8) clockIcon(150, 700, 66, t * 3);
    if (t >= 8 && t < 12.5) {
      label(t, 8.4, j.N[0] + 200, j.N[1] - 120, 'BOYUN ÖNDE');
      label(t, 9.2, j.A[0] - 80, j.A[1] - 220, 'OMUZ YUKARIDA');
      label(t, 10.0, j.back[0] - 60, j.back[1] + 40, 'SIRT KAMBUR');
    }
    if (t >= 15.5 && t < 20) { label(t, 17.2, 720, 1170, 'BEBEK GÖĞSE GELİR', C.navy); checkAt(t, 17.8, 860, 1060); }
    if (t >= 20 && t < 24) { label(t, 21.4, 720, 1170, 'BAŞ DESTEKLİ', C.navy); checkAt(t, 21.8, 860, 1060); }
    if (t >= 24 && t < 27) { label(t, 24.6, 640, 1180, 'YASTIK + AYAK DESTEĞİ', C.navy); checkAt(t, 25.4, 860, 1060); }
  }

  fixCards(t, 12.5, 15.5, ['BEBEĞİ KENDİNE GETİR', 'YARI UZAN, BAŞI DESTEKLE', 'YASTIK + AYAK DESTEĞİ']);

  k = win(t, 27, 33); OV = k;
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    const tuck = t < 30 ? 34 * Math.max(0, Math.sin((t - 27.3) * 2.6)) : 0;
    const roll = t >= 30 ? Math.max(0, Math.sin((t - 30.2) * 4.2)) : 0;
    const j = stand({ x: 430, fy: 1250, s: .8, t, top: MTOP, bottom: MBOT, shoe: C.navy, tuck, shrug: roll * .9, armN: [470, 1010], armF: [400, 1010] });
    g.restore();
    if (t < 30 && tuck > 8) { g.save(); g.globalAlpha = k; arrow(j.head[0] + 70, j.head[1] - 110, j.head[0] - 50, j.head[1] - 110, C.sun, 16); g.restore(); }
    if (t >= 30.2) { g.save(); g.globalAlpha = k; g.strokeStyle = C.navy; g.lineWidth = 18; g.lineCap = 'round'; const a0 = (t - 30.2) * 5;
      g.beginPath(); g.arc(j.A[0] - 10, j.A[1] - 30, 70, a0, a0 + 4.6); g.stroke(); g.strokeStyle = C.sun; g.lineWidth = 10; g.beginPath(); g.arc(j.A[0] - 10, j.A[1] - 30, 70, a0, a0 + 4.6); g.stroke(); g.restore(); }
    label(t, 27.4, 760, 760, t < 30 ? 'ÇENE GERİ' : 'OMUZ GERİYE ÇEVİR', C.navy);
  }

  warnCard(t, 33, 37);
  shareCTA(t, 37, 40.3);

  headline(t, -0.45, 4, [['EMZİREN ANNELERİN', C.ink, 74], ['YARISI', C.coral, 110], ['HER HAFTA BOYUN AĞRISI', C.teal, 58]], 290);
  headline(t, 4, 8, [['SAATLERCE', C.ink, 96], ['BEBEĞE EĞİLMEK', C.coral, 84]], 330);
  headline(t, 8, 12.5, [['TANIDIK MI?', C.ink, 110]], 360);
  headline(t, 12.5, 15.5, [['3 KÜÇÜK', C.ink, 100], ['AYAR', C.teal, 130]], 330);
  headline(t, 15.5, 20, [['1. BEBEĞİ', C.ink, 90], ['KENDİNE GETİR', C.teal, 100]], 320);
  headline(t, 20, 24, [['2. YARI UZAN', C.ink, 86], ['BAŞINI DESTEKLE', C.teal, 92]], 320);
  headline(t, 24, 27, [['3. YASTIK VE', C.ink, 86], ['AYAK DESTEĞİ', C.teal, 100]], 320);
  headline(t, 27, 33, [['EMZİRMEDEN SONRA', C.ink, 76], ['30 SN ESNE', C.teal, 110]], 300);
  headline(t, 33, 37, [['DİKKAT', C.ink, 110]], 360);
  headline(t, 37, 40.3, [['YENİ BİR ANNEYE', C.ink, 86], ['GÖNDER', C.coral, 100]], 320);
  sourceNote(t, .3, 4, 'Kaynak: BMC Musculoskelet Disord 2024 (çevrimiçi anket, %48 haftalık boyun ağrısı)');
  subs(t, SUB);
}
