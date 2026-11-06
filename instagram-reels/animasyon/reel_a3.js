// Mothers 3: "mommy thumb" (de Quervain)
const DUR = 39.34;
const KN = [[0.0, 0], [4.0, 4], [8.448, 8], [12.948, 12.5], [15.636, 15.5], [19.636, 20], [22.476, 24], [27.051, 27], [32.051, 33], [35.941, 37], [39.341, 40]];
const SCENES = [[0, '#8B5CF6', '#E056FD'], [4, '#F472B6', '#8B5CF6'], [8, '#FF7A45', '#E8336D'], [12.5, '#2563FF', '#22C5E0'],
  [15.5, '#00B894', '#0098C7'], [20, '#3A7BFF', '#00C2FF'], [24, '#5B5BF0', '#9B7BFF'], [27, '#00B894', '#0098C7'],
  [33, '#FF8A3D', '#FF3D71'], [37, '#F472B6', '#8B5CF6']];
const SUB = [
  [0, 4, 'Bebeği kaldırırken, bileğinin başparmak tarafı ağrıyor mu?'],
  [4, 8, 'Buna anne bileği deniyor; tıbbi adı, De Quervain tenosinoviti.'],
  [8, 12.5, 'Sebebi: bebeği koltuk altından, başparmak açık kaldırmak.'],
  [12.5, 15.5, 'Üç küçük ayar, bunu değiştirir.'],
  [15.5, 20, 'Bir: Bebeği avucunla, alttan kavrayarak kaldır.'],
  [20, 24, 'İki: Bileğini düz tut, yana bükme.'],
  [24, 27, 'Üç: Emzirirken bebeğin başını bileğinle değil, yastıkla destekle.'],
  [27, 33, 'Gün içinde parmaklarını aç kapa, bileğini nazikçe çevir.'],
  [33, 37, 'Ağrı ya da uyuşma geçmiyorsa, bir fizyoterapiste görün.'],
  [37, 40, 'Yeni bir anneye gönder!'],
];

function lifter(t, mode, k) {
  // mode 'armpit' (bad) or 'scoop' (good)
  g.save(); g.globalAlpha = k;
  const bob = Math.sin(t * 2.2) * 14;
  if (mode === 'armpit') {
    const b = [560, 880 + bob];
    baby(b[0], b[1], .95, 0, true);
    stand({ x: 330, fy: 1250, s: .8, t, top: MTOP, bottom: MBOT, shoe: C.navy, lean: .1, armN: [b[0] - 30, b[1] - 10], armF: [b[0] + 20, b[1] - 14] });
  } else {
    const b = [520, 940 + bob * .5];
    baby(b[0], b[1], .95, -.15);
    stand({ x: 330, fy: 1250, s: .8, t, top: MTOP, bottom: MBOT, shoe: C.navy, lean: .05, armN: [b[0] + 60, b[1] + 34], armF: [b[0] - 50, b[1] + 20] });
  }
  g.restore();
}

function render(t) {
  t = remapKN(t);
  bg(t);
  OV = 1;

  let k = Math.max(win(t, -1, 4), win(t, 8, 12.5)); OV = k;
  if (k > 0) {
    lifter(t, 'armpit', k);
    g.save(); g.globalAlpha = k; handZoom(800, 700, { thumb: 1, dev: .45, pain: clamp((t - (t < 8 ? .8 : 8.4)) / .4) * .9, t, r: 150 }); g.restore();
    if (t >= 8) { label(t, 8.6, 780, 900, 'BAŞPARMAK AÇIK'); label(t, 9.6, 330, 640, 'KOLTUK ALTINDAN'); }
  }
  k = win(t, 4, 8); OV = k;
  if (k > 0) {
    g.save(); g.globalAlpha = k; handZoom(CX, 860, { thumb: .9, dev: .4, pain: .9, t, r: 230 }); g.restore();
    label(t, 4.4, CX, 1170, 'ANNE BİLEĞİ', C.coral); label(t, 5.4, CX, 560, 'De Quervain', C.navy);
  }
  fixCards(t, 12.5, 15.5, ['AVUÇLA, ALTTAN KALDIR', 'BİLEĞİ DÜZ TUT', 'YASTIKLA DESTEKLE']);

  k = win(t, 15.5, 20); OV = k;
  if (k > 0) {
    lifter(t, 'scoop', k);
    g.save(); g.globalAlpha = k; handZoom(820, 700, { thumb: 0, dev: 0, t, r: 140 }); g.restore();
    label(t, 16.6, 760, 900, 'ALTTAN KAVRA', C.navy); checkAt(t, 17.6, 940, 580);
  }
  k = win(t, 20, 24); OV = k;
  if (k > 0) {
    const d = lerp(.5, 0, eio(prog(t, 20.4, 1.2)));
    g.save(); g.globalAlpha = k; handZoom(CX, 860, { thumb: .2, dev: d, t, r: 230 });
    g.setLineDash([16, 12]); g.strokeStyle = '#fff'; g.lineWidth = 8; line(CX - 260, 980, CX + 120, 700); g.restore();
    label(t, 21.6, CX, 1170, 'BİLEK DÜZ', C.navy); checkAt(t, 22, CX + 200, 640);
  }
  k = win(t, 24, 27); OV = k;
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    seatedMom({ x: 330, y: 1060, s: .85, lean: .02, neck: .3, t, bp: [440, 900], bRot: -.1, armPillow: 1, backPillow: 1 });
    g.restore();
    label(t, 24.6, 720, 1170, 'YASTIK DESTEKLER', C.navy); checkAt(t, 25.4, 860, 1060);
  }
  k = win(t, 27, 33); OV = k;
  if (k > 0) {
    const fing = t < 30 ? .5 - .5 * Math.cos((t - 27.2) * 4) : 0;
    const dev = t >= 30 ? Math.sin((t - 30.1) * 3.4) * .35 : 0;
    g.save(); g.globalAlpha = k; handZoom(CX, 860, { thumb: .2, dev, fingers: fing, t, r: 230 }); g.restore();
    label(t, 27.4, CX, 1170, t < 30 ? 'AÇ – KAPA' : 'NAZİKÇE ÇEVİR', C.navy);
  }

  warnCard(t, 33, 37);
  shareCTA(t, 37, 40.3);

  headline(t, -0.45, 4, [['BEBEĞİ KALDIRIRKEN', C.ink, 72], ['BİLEĞİN AĞRIYOR MU?', C.coral, 76]], 320);
  headline(t, 4, 8, [['ANNE', C.ink, 110], ['BİLEĞİ', C.teal, 130]], 330);
  headline(t, 8, 12.5, [['SEBEBİ', C.ink, 110]], 360);
  headline(t, 12.5, 15.5, [['3 KÜÇÜK', C.ink, 100], ['AYAR', C.teal, 130]], 330);
  headline(t, 15.5, 20, [['1. ALTTAN', C.ink, 90], ['KAVRA', C.teal, 130]], 320);
  headline(t, 20, 24, [['2. BİLEĞİ', C.ink, 90], ['DÜZ TUT', C.teal, 120]], 320);
  headline(t, 24, 27, [['3. YASTIKLA', C.ink, 90], ['DESTEKLE', C.teal, 120]], 320);
  headline(t, 27, 33, [['GÜN İÇİNDE', C.ink, 90], ['NAZİKÇE ESNET', C.teal, 100]], 300);
  headline(t, 33, 37, [['DİKKAT', C.ink, 110]], 360);
  headline(t, 37, 40.3, [['YENİ BİR ANNEYE', C.ink, 86], ['GÖNDER', C.coral, 100]], 320);
  subs(t, SUB);
}
