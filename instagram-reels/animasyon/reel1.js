const DUR = 30.6;
const KN = [[0, 0], [16.7, 16.5], [20.0, 18.3], [22.9, 20], [27.3, 23], [30.6, 25.5]];
function remap(t) {
  for (let i = 1; i < KN.length; i++) if (t <= KN[i][0]) {
    const [r0, o0] = KN[i - 1], [r1, o1] = KN[i]; return o0 + (t - r0) / (r1 - r0) * (o1 - o0);
  }
  return 25.5;
}
const SUB = [
  [0, 3.2, '8 saat masa başındaysan,'],
  [3.2, 5.5, 'bu hesap senin.'],
  [5.5, 9, 'Ben fizyoterapistim. Bugün ilk günüm.'],
  [9, 13, 'Boyun ağrısı, bel ağrısı, kola vuran uyuşma.'],
  [13, 16.5, '8 saat oturmanın faturası hep bu 3 yere çıkıyor.'],
  [16.5, 18.3, 'Burada ofiste yapılacak hareketler göstereceğim.'],
  [18.3, 20, 'Her biri 30 saniye, masadan kalkmadan.'],
  [20, 23, 'Hangisiyle başlayalım? Yorumlara "boyun" ya da "bel" yaz.'],
  [23, 25.5, '8 saat senin, 30 saniyesi benim.'],
];

function clock(x, y, r, t, a = 1) {
  g.save(); g.globalAlpha *= a;
  g.fillStyle = C.white; circ(x, y, r); g.fill();
  g.strokeStyle = C.ink; g.lineWidth = r * .12; circ(x, y, r); g.stroke();
  for (let i = 0; i < 12; i++) {
    const an = i * Math.PI / 6; g.lineWidth = r * .05;
    line(x + Math.cos(an) * r * .75, y + Math.sin(an) * r * .75, x + Math.cos(an) * r * .86, y + Math.sin(an) * r * .86);
  }
  g.lineCap = 'round';
  const m = t * 6, h = t * 6 / 12;
  g.lineWidth = r * .1; line(x, y, x + Math.sin(h) * r * .45, y - Math.cos(h) * r * .45);
  g.strokeStyle = C.coral; g.lineWidth = r * .07; line(x, y, x + Math.sin(m) * r * .7, y - Math.cos(m) * r * .7);
  g.restore();
}

function render(t) {
  t = remap(t);
  bg(t);

  // S1 0-5.5: desk, 8 hours
  let a = win(t, 0, 5.5);
  if (a > 0) {
    g.save(); g.globalAlpha = a;
    const f = eio(prog(t, .2, 4));
    fig(300, 1060, { fwd: lerp(5, 50, f), pain: f * .8, t });
    clock(170, 690, 78 * back(prog(t, 0, .5)), t);
    g.restore();
    headline(t, 0, 3.2, [['8 SAAT', C.coral, 190], ['MASA BAŞINDA MISIN?', C.ink, 72]], 400);
    headline(t, 3.2, 5.5, [['BU HESAP', C.teal], ['SENİN İÇİN', C.teal]], 420);
  }

  // S2 5.5-9: badge + stamp
  a = win(t, 5.5, 9);
  if (a > 0) {
    g.save(); g.globalAlpha = a;
    const p = back(prog(t, 5.5, .8));
    const sw = Math.sin((t - 5.5) * 5) * Math.exp(-(t - 5.5) * 1.6) * .12;
    g.save(); g.translate(CX, 620 + lerp(-700, 0, p)); g.rotate(sw);
    g.strokeStyle = C.mut; g.lineWidth = 10; line(0, -80, 0, -10);
    g.fillStyle = C.white; g.shadowColor = 'rgba(0,0,0,.15)'; g.shadowBlur = 40; g.shadowOffsetY = 14;
    rr(-230, 0, 460, 600, 40); g.fill(); g.shadowColor = 'transparent';
    g.fillStyle = C.teal; rr(-230, 0, 460, 120, [40, 40, 0, 0]); g.fill();
    g.fillStyle = '#C9D6D3'; rr(-50, 30, 100, 26, 13); g.fill();
    figFront(0, 360, .42);
    txt('FİZYOTERAPİST', 0, 470, 50, C.ink);
    txt('Masa başı çalışanlar için', 0, 530, 32, C.mut, { weight: 600 });
    g.restore();
    const sp = prog(t, 6.6, .35);
    if (sp > 0) {
      const sc = lerp(2.6, 1, eo(sp));
      g.save(); g.globalAlpha = a * clamp(sp * 3); g.translate(CX + 190, 650); g.rotate(-.2); g.scale(sc, sc);
      g.strokeStyle = C.coral; g.lineWidth = 12; rr(-150, -62, 300, 124, 20); g.stroke();
      txt('1. GÜN', 0, 4, 76, C.coral, { weight: 900 });
      g.restore();
    }
    g.restore();
    headline(t, 5.5, 9, [['BUGÜN', C.ink, 90], ['İLK GÜNÜM', C.teal, 120]], 300);
  }

  // S3 9-13: body + pain points
  a = win(t, 9, 13);
  if (a > 0) {
    g.save(); g.globalAlpha = a;
    figFront(CX, 920, 1);
    const pts = [
      [9.3, CX, 670, 'BOYUN', CX - 270, 640],
      [10.3, CX, 900, 'BEL', CX - 270, 920],
      [11.3, CX + 160, 930, 'KOL', CX + 290, 760],
    ];
    for (const [s, x, y, lab, lx, ly] of pts) {
      const k = prog(t, s, .3);
      if (k <= 0) continue;
      pulse(x, y, t, k, 50);
      g.save(); g.globalAlpha *= k; g.strokeStyle = C.coral; g.lineWidth = 6; line(x, y, lx, ly); g.restore();
      const p = back(prog(t, s, .45));
      g.save(); g.translate(lx, ly); g.scale(p, p); pill(0, 0, 230, 90, C.coral);
      txt(lab, 0, 3, 50, C.white); g.restore();
    }
    g.restore();
    headline(t, 9, 13, [['TANIDIK MI?', C.ink, 110]], 360);
  }

  // S4 13-16.5: receipt
  a = win(t, 13, 16.5);
  if (a > 0) {
    g.save(); g.globalAlpha = a;
    const hgt = lerp(0, 700, eo(prog(t, 13.1, 1.2)));
    const top = 560, w = 540;
    g.save(); rr(CX - w / 2, top, w, hgt, 10); g.clip();
    g.fillStyle = C.white; g.shadowColor = 'rgba(0,0,0,.15)'; g.shadowBlur = 30;
    g.fillRect(CX - w / 2, top, w, 700); g.shadowColor = 'transparent';
    txt('FATURA', CX, top + 70, 64, C.ink, { weight: 900 });
    txt('8 saat oturma', CX, top + 130, 36, C.mut, { weight: 600 });
    g.setLineDash([14, 12]); g.strokeStyle = C.mut; g.lineWidth = 4;
    line(CX - w / 2 + 40, top + 180, CX + w / 2 - 40, top + 180);
    const items = ['Boyun ağrısı', 'Bel ağrısı', 'Kol uyuşması'];
    items.forEach((it, i) => {
      const k = prog(t, 13.8 + i * .45, .3);
      g.fillStyle = C.coral; g.globalAlpha = a * k; circ(CX - w / 2 + 70, top + 250 + i * 90, 14); g.fill(); g.globalAlpha = a;
      txt(it, CX - w / 2 + 105, top + 250 + i * 90, 46, C.ink, { a: k, align: 'left', weight: 700 });
    });
    line(CX - w / 2 + 40, top + 520, CX + w / 2 - 40, top + 520); g.setLineDash([]);
    const k = prog(t, 15.3, .3);
    txt('TOPLAM', CX - w / 2 + 50, top + 600, 48, C.ink, { a: k, align: 'left', weight: 900 });
    txt('3 BÖLGE', CX + w / 2 - 50, top + 600, 48, C.coral, { a: k, align: 'right', weight: 900 });
    g.restore();
    g.restore();
    headline(t, 13, 16.5, [['8 SAATİN', C.ink, 100], ['FATURASI', C.coral, 100]], 300);
  }

  // S5 16.5-20: stopwatch
  a = win(t, 16.5, 20);
  if (a > 0) {
    g.save(); g.globalAlpha = a;
    const x = CX, y = 860, r = 230;
    const pp = back(prog(t, 16.5, .5));
    g.save(); g.translate(x, y); g.scale(pp, pp);
    g.fillStyle = C.ink; rr(-40, -r - 70, 80, 50, 12); g.fill();
    g.fillStyle = C.white; circ(0, 0, r); g.fill();
    g.strokeStyle = '#E4E7EB'; g.lineWidth = 34; circ(0, 0, r - 30); g.stroke();
    const sec = Math.min(30, Math.floor(prog(t, 16.9, 2.6) * 30));
    g.strokeStyle = C.teal; g.lineCap = 'round';
    g.beginPath(); g.arc(0, 0, r - 30, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * sec / 30); g.stroke();
    txt(String(sec), 0, -20, 150, C.ink, { weight: 900 });
    txt('SANİYE', 0, 85, 44, C.mut, { weight: 700 });
    g.restore();
    g.restore();
    headline(t, 16.5, 18.3, [['OFİSTE', C.ink, 100], ['30 SANİYE', C.teal, 110]], 300);
    headline(t, 18.3, 20, [['MASADAN', C.ink, 100], ['KALKMADAN', C.teal, 110]], 300);
  }

  // S6 20-23: comment bubble
  a = win(t, 20, 23);
  if (a > 0) {
    g.save(); g.globalAlpha = a;
    const pp = back(prog(t, 20, .5));
    g.save(); g.translate(CX, 860); g.scale(pp, pp);
    g.fillStyle = C.white; g.shadowColor = 'rgba(0,0,0,.15)'; g.shadowBlur = 40;
    rr(-330, -200, 660, 380, 50); g.fill();
    g.beginPath(); g.moveTo(-200, 170); g.lineTo(-250, 260); g.lineTo(-120, 175); g.fill();
    g.shadowColor = 'transparent';
    txt('Yorumlara yaz:', 0, -110, 52, C.mut, { weight: 700 });
    const chips = [['BOYUN', C.teal, -150, 20.5], ['BEL', C.coral, 160, 20.8]];
    for (const [lab, col, cx0, s] of chips) {
      const k = back(prog(t, s, .4));
      g.save(); g.translate(cx0, 40);
      const tap = (Math.floor((t - 21.3) / .7) % 2 === (lab === 'BEL' ? 1 : 0)) && t > 21.3 ? .92 : 1;
      g.scale(k * tap, k * tap); pill(0, 0, lab === 'BEL' ? 220 : 290, 120, col);
      txt(lab, 0, 4, 60, C.white, { weight: 900 }); g.restore();
    }
    g.restore();
    g.restore();
    headline(t, 20, 23, [['HANGİSİYLE', C.ink, 100], ['BAŞLAYALIM?', C.teal, 100]], 300);
  }

  // S7 23-25.5: end card
  a = win(t, 23, 25.6);
  if (a > 0) {
    const p1 = back(prog(t, 23.1, .45)), p2 = back(prog(t, 23.8, .45));
    txt('8 saat senin.', CX, 700, 110, C.ink, { a: a * clamp(p1 * 2), sc: p1 });
    txt('30 saniyesi', CX, 860, 120, C.teal, { a: a * clamp(p2 * 2), sc: p2 });
    txt('benim.', CX, 990, 120, C.teal, { a: a * clamp(p2 * 2), sc: p2 });
    const p3 = prog(t, 24.4, .4);
    g.save(); g.globalAlpha = a * p3; pill(CX, 1150, 420, 96, C.coral); g.restore();
    txt('TAKİP ET', CX, 1153, 50, C.white, { a: a * p3 });
  }

  subs(t, SUB);
}

function pill(x, y, w, h, col, al = 1) { g.save(); g.globalAlpha *= al; g.fillStyle = col; rr(x - w / 2, y - h / 2, w, h, h / 2); g.fill(); g.restore(); }
