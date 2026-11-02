const DUR = 34;
const SUB = [
  [0, 3, 'Akşam boynun ağrıyorsa, 10 saniye ver.'],
  [3, 6, 'Başın yaklaşık 5 kilo.'],
  [6, 9.5, 'Ekrana bakarken farkında olmadan öne kayıyor.'],
  [9.5, 13, 'Boynun arkası o 5 kiloyu bütün gün tutuyor.'],
  [13, 15.5, 'Dik otur, karşıya bak.'],
  [15.5, 19, 'Çeneni düz geriye doğru it, çift çene yapar gibi.'],
  [19, 23.5, '3 saniye tut, bırak. 10 tekrar.'],
  [23.5, 26.5, 'Başını eğme, sadece geriye kaydır.'],
  [26.5, 28.5, 'Günde 3-4 kez yap.'],
  [28.5, 31, 'Kolunda uyuşma varsa önce muayene ol.'],
  [31, 34, 'Bunu kaydet, akşam boynun ağrıyınca aç.'],
];
const HX = 300, HY = 1070;

function pill(x, y, w, h, col, al = 1) { g.save(); g.globalAlpha *= al; g.fillStyle = col; rr(x - w / 2, y - h / 2, w, h, h / 2); g.fill(); g.restore(); }

// head-forward amount over the first 23.5 s
function fwdAt(t) {
  if (t < 6) return 42;
  if (t < 9.5) return lerp(0, 58, eio(prog(t, 6.6, 2.2)));
  if (t < 13) return 58;
  if (t < 15.5) return lerp(58, 0, eio(prog(t, 13, 1.4)));
  if (t < 19) { // two quick demo reps
    const c = (t - 15.7) % 1.65; if (t < 15.7) return 0;
    return c < .45 ? lerp(0, -30, eio(c / .45)) : c < 1.05 ? -30 : lerp(-30, 0, eio((c - 1.05) / .45));
  }
  // one full rep: in .5, hold 3, out .5
  if (t < 19.3) return 0;
  if (t < 19.8) return lerp(0, -30, eio(prog(t, 19.3, .5)));
  if (t < 22.8) return -30;
  return lerp(-30, 0, eio(prog(t, 22.8, .5)));
}

function render(t) {
  bg(t);

  // ---- seated figure 0 - 23.5 ----
  const a = win(t, 0, 23.5);
  if (a > 0) {
    g.save(); g.globalAlpha = a;
    const fwd = fwdAt(t);
    let pain = 0;
    if (t < 3) pain = .9;
    else if (t >= 9.5 && t < 13) pain = clamp((t - 9.6) / .4);
    // ghost of forward head while showing the tuck
    if (t >= 15.5 && t < 23.5) {
      const f0 = 50, nx = HX + 26 + f0 * .6, ny = HY - 320 + f0 * .22;
      g.save(); g.globalAlpha *= .8; g.setLineDash([16, 12]); g.strokeStyle = C.coral; g.lineWidth = 7;
      circ(nx + 10 + f0 * .45, ny - 55, 60); g.stroke(); g.restore();
    }
    const h = fig(HX, HY, { fwd, pain, t, glow: 1 });
    g.restore();

    // 3-6: weight tag
    let k = win(t, 3, 6);
    if (k > 0) {
      const p = back(prog(t, 3.1, .5));
      g.save(); g.globalAlpha = k;
      g.strokeStyle = C.ink; g.lineWidth = 6; line(h.hx, h.hy - 60, h.hx + 40, h.hy - 170);
      g.translate(h.hx + 140, h.hy - 200); g.scale(p, p);
      pill(0, 0, 280, 110, C.ink); txt('≈ 5 KG', 0, 4, 62, C.white, { weight: 900 });
      g.restore();
    }
    // 6-9.5: forward arrow
    k = win(t, 7, 9.5);
    if (k > 0) { g.save(); g.globalAlpha = k; arrow(h.hx - 40, h.hy - 110, h.hx + 70, h.hy - 110, C.coral, 14); g.restore(); }
    // 9.5-13: load arrows on head
    k = win(t, 9.6, 13);
    if (k > 0) {
      g.save(); g.globalAlpha = k;
      const bob = Math.sin(t * 6) * 8;
      arrow(h.hx, h.hy - 175 + bob, h.hx, h.hy - 78 + bob, C.coral, 16);
      pill(h.hx - 200, h.hy - 150 + bob, 200, 80, C.coral); txt('5 KG', h.hx - 200, h.hy - 147 + bob, 48, C.white);
      g.restore();
    }
    // 13-15.5: upright check
    k = win(t, 14.2, 15.5);
    if (k > 0) { g.save(); g.globalAlpha = k; check(h.hx - 170, h.hy - 60, 46 * back(prog(t, 14.2, .4)), C.green); g.restore(); }
    // 15.5-23.5: back arrow during tuck
    k = win(t, 15.5, 23.5);
    if (k > 0 && fwd < -5) { g.save(); g.globalAlpha = k; arrow(h.hx + 60, h.hy + 100, h.hx - 60, h.hy + 100, C.teal, 14); g.restore(); }
    // 19-23.5: hold countdown + reps
    k = win(t, 19.2, 23.5);
    if (k > 0) {
      g.save(); g.globalAlpha = k;
      const x = 780, y = 680, r = 90;
      g.fillStyle = C.white; circ(x, y, r); g.fill();
      const hp = prog(t, 19.8, 3);
      g.strokeStyle = C.teal; g.lineWidth = 18; g.lineCap = 'round';
      g.beginPath(); g.arc(x, y, r - 14, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * hp); g.stroke();
      const n = t < 19.8 ? 3 : Math.max(1, 3 - Math.floor(t - 19.8));
      txt(t > 22.8 ? '✓' : String(n), x, y + 4, 90, t > 22.8 ? C.green : C.ink, { weight: 900 });
      txt('TUT', x, y + 130, 38, C.mut, { weight: 800 });
      g.restore();
    }
  }

  // headlines
  headline(t, 0, 3, [['BOYUN AĞRISI?', C.coral, 100], ['10 SANİYE VER', C.teal, 90]], 330);
  headline(t, 3, 6, [['BAŞIN ≈ 5 KG', C.ink, 110]], 360);
  headline(t, 6, 9.5, [['EKRANA', C.ink, 90], ['ÖNE KAYIYOR', C.coral, 110]], 320);
  headline(t, 9.5, 13, [['BÜTÜN GÜN', C.ink, 90], ['5 KG TAŞIYOR', C.coral, 110]], 290);
  headline(t, 13, 15.5, [['DİK OTUR', C.teal, 120]], 360);
  headline(t, 15.5, 19, [['ÇENEYİ', C.ink, 90], ['GERİ İT', C.teal, 130]], 320);
  headline(t, 19, 23.5, [['3 SN TUT', C.teal, 110], ['× 10 TEKRAR', C.ink, 90]], 320);

  // 23.5-26.5: wrong vs right
  let k = win(t, 23.5, 26.5);
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    fig(170, 1000, { down: .5, furniture: false, s: .62 });
    fig(560, 1000, { fwd: -30, furniture: false, s: .62 });
    const p1 = back(prog(t, 23.8, .4)), p2 = back(prog(t, 24.4, .4));
    cross(250, 1130, 55 * p1, C.coral); check(640, 1130, 55 * p2, C.green);
    txt('Aşağı eğme', 250, 1220, 46, C.coral, { a: clamp(p1) });
    txt('Geriye kaydır', 640, 1220, 46, C.green, { a: clamp(p2) });
    g.restore();
    headline(t, 23.5, 26.5, [['EĞME,', C.coral, 110], ['KAYDIR', C.teal, 110]], 330);
  }

  // 26.5-28.5: times per day
  k = win(t, 26.5, 28.5);
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    const times = ['10:00', '13:00', '15:30', '17:30'];
    times.forEach((s, i) => {
      const p = back(prog(t, 26.6 + i * .2, .35));
      const x = 230 + (i % 2) * 300, y = 760 + Math.floor(i / 2) * 290;
      g.save(); g.translate(x, y); g.scale(p, p);
      g.fillStyle = i === 3 ? 'rgba(14,124,123,.35)' : C.teal; circ(0, 0, 115); g.fill();
      txt(s, 0, 4, 52, C.white, { weight: 900 }); g.restore();
    });
    g.restore();
    headline(t, 26.5, 28.5, [['GÜNDE 3–4 KEZ', C.ink, 100]], 360);
  }

  // 28.5-31: warning
  k = win(t, 28.5, 31);
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    const p = back(prog(t, 28.6, .5));
    g.translate(CX, 830); g.scale(p, p);
    g.fillStyle = '#FFF4D6'; rr(-360, -260, 720, 520, 50); g.fill();
    g.strokeStyle = C.yel; g.lineWidth = 10; rr(-360, -260, 720, 520, 50); g.stroke();
    g.fillStyle = C.yel; g.beginPath(); g.moveTo(0, -210); g.lineTo(80, -70); g.lineTo(-80, -70); g.closePath(); g.fill();
    txt('!', 0, -112, 80, C.ink, { weight: 900 });
    txt('Kolunda uyuşma', 0, 10, 62, C.ink, { weight: 800 });
    txt('varsa önce', 0, 90, 62, C.ink, { weight: 800 });
    txt('muayene ol', 0, 170, 62, C.coral, { weight: 900 });
    g.restore();
    headline(t, 28.5, 31, [['DİKKAT', C.ink, 110]], 360);
  }

  // 31-34: save
  k = win(t, 31, 34.2);
  if (k > 0) {
    g.save(); g.globalAlpha = k;
    const p = back(prog(t, 31.1, .5));
    const bounce = 1 + Math.max(0, Math.sin((t - 31.8) * 8)) * .06 * (t > 31.8 && t < 32.6 ? 1 : 0);
    g.translate(CX, 820); g.scale(p * bounce, p * bounce);
    const fill = prog(t, 31.8, .4);
    g.lineJoin = 'round'; g.lineWidth = 22; g.strokeStyle = C.teal;
    g.beginPath(); g.moveTo(-120, -190); g.lineTo(120, -190); g.lineTo(120, 200); g.lineTo(0, 90); g.lineTo(-120, 200); g.closePath();
    g.stroke(); g.save(); g.globalAlpha *= fill; g.fillStyle = C.teal; g.fill(); g.restore();
    g.restore();
    txt('Akşam boynun', CX, 1110, 56, C.ink, { a: k * prog(t, 32, .4), weight: 700 });
    txt('ağrıyınca aç.', CX, 1180, 56, C.ink, { a: k * prog(t, 32, .4), weight: 700 });
    headline(t, 31, 34.2, [['KAYDET', C.teal, 130]], 380);
  }

  subs(t, SUB);
}
