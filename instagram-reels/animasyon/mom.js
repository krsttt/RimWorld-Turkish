// Mother reels: shared drawings. Loaded after common.js and prof.js.
const MTOP = '#F472B6', MBOT = '#4338CA', SWAD = '#FDE68A', CHAIR = '#8B5CF6';

function baby(x, y, s = 1, rotA = 0, upright = false) {
  g.save(); g.translate(x, y); g.rotate(rotA); g.scale(s, s);
  if (upright) {
    blob(() => { g.beginPath(); g.ellipse(0, 40, 46, 70, 0, 0, Math.PI * 2); }, SWAD, 8);
    g.fillStyle = C.navy; circ(0, -50, 40); g.fill(); g.fillStyle = C.skin; circ(0, -50, 35); g.fill();
    g.fillStyle = C.navy; circ(-11, -52, 4); g.fill(); circ(11, -52, 4); g.fill();
    g.strokeStyle = C.navy; g.lineWidth = 4; g.beginPath(); g.arc(0, -40, 8, .2, Math.PI - .2); g.stroke();
  } else {
    blob(() => { g.beginPath(); g.ellipse(40, 0, 78, 40, 0, 0, Math.PI * 2); }, SWAD, 8);
    g.fillStyle = C.navy; circ(-50, -4, 40); g.fill(); g.fillStyle = C.skin; circ(-50, -4, 35); g.fill();
    g.fillStyle = C.navy; circ(-60, -12, 4); g.fill();
    g.strokeStyle = C.navy; g.lineWidth = 4; g.beginPath(); g.arc(-52, 6, 8, .2, Math.PI - .2); g.stroke();
    g.fillStyle = 'rgba(255,90,120,.35)'; circ(-40, 6, 7); g.fill();
  }
  g.restore();
}

// seated mother, side view facing right. (x, y) = hip. lean < 0 reclines. bp = baby position (canvas coords)
function seatedMom(o) {
  const { x = 300, y = 1080, s = .85, lean = 0, neck = 0, t = 0, pain = 0, painS = 0, bp, bRot = 0, backPillow = 0, armPillow = 0, headRest = 0, stool = 0, wristBend = 0 } = o;
  const L2W = p => [x + p[0] * s, y + p[1] * s], W2L = p => [(p[0] - x) / s, (p[1] - y) / s];
  g.save(); g.translate(x, y); g.scale(s, s); g.lineCap = 'round'; g.lineJoin = 'round';
  g.fillStyle = 'rgba(20,10,60,.22)'; g.beginPath(); g.ellipse(90, 214, 260, 24, 0, 0, Math.PI * 2); g.fill();
  // armchair
  const bk = rot([0, -340], lean * .9);
  segs([[-95, 40, -95, 205, 14, C.navy], [120, 40, 120, 205, 14, C.navy]], 0);
  segs([[-120, 34, 140, 34, 32, CHAIR], [-120, 34, -120 + bk[0], 34 + bk[1], 34, CHAIR]]);
  if (headRest > 0) { const hr = add([-120, 34], rot([0, -380], lean * .9)); g.save(); g.globalAlpha *= headRest; blob(() => { g.beginPath(); g.ellipse(hr[0] + 20, hr[1], 34, 46, lean, 0, Math.PI * 2); }, '#fff', 8); g.restore(); }
  if (stool > 0) { g.save(); g.globalAlpha *= stool; blob(() => rr(150, 150, 120, 50, 12), CHAIR, 8); g.restore(); }
  const sx = 10, sy = -262;
  const S = rot([sx, sy], lean);
  segs([[0, 0, 172, 6, 44, MBOT], [172, 6, 178 + stool * 40, 188 - stool * 50, 40, MBOT], [178 + stool * 40, 194 - stool * 50, 232 + stool * 40, 196 - stool * 50, 28, C.navy]]);
  if (backPillow > 0) { const bpw = add([0, 0], rot([-46, -110], lean)); g.save(); g.globalAlpha *= backPillow; blob(() => { g.beginPath(); g.ellipse(bpw[0], bpw[1], 36, 70, lean, 0, Math.PI * 2); }, '#fff', 8); g.restore(); }
  segs([[2, -10, S[0], S[1], 72, MTOP]]);
  const ha = lean + neck;
  const N = add(S, rot([16, -58], ha));
  segs([[S[0], S[1], N[0], N[1], 30, C.skin]]);
  if (pain > 0) pulse((S[0] + N[0]) / 2 - 20, (S[1] + N[1]) / 2, t, pain);
  g.save(); g.translate(N[0], N[1]); g.rotate(ha); drawHead(10, -55, t, pain);
  // long hair / bun
  g.fillStyle = C.hair; circ(-40, -78, 26); g.fill(); g.restore();
  const A = [S[0] + 6, S[1] + 22];
  if (painS > 0) pulse(A[0] - 4, A[1] - 16, t, painS, 40);
  g.restore();
  // baby + arm pillow (canvas space)
  if (armPillow > 0) { g.save(); g.globalAlpha *= armPillow; blob(() => rr(bp[0] - 110, bp[1] + 26, 230, 52, 24), '#fff', 8); g.restore(); }
  baby(bp[0], bp[1], .9, bRot);
  // arms in local space again
  g.save(); g.translate(x, y); g.scale(s, s); g.lineCap = 'round'; g.lineJoin = 'round';
  const bL = W2L(bp);
  const [Ef, Hf] = ik([A[0] - 12, A[1] - 4], add(bL, [-50, 8]), 128, 140, 'down');
  const [En, Hn] = ik(A, add(bL, [40, 34]), 128, 140, 'down');
  segs([[A[0], A[1], En[0], En[1], 34, MTOP], [En[0], En[1], Hn[0], Hn[1], 28, C.skin]]);
  g.fillStyle = C.navy; circ(Hn[0], Hn[1], 21); g.fill(); g.fillStyle = C.skin; circ(Hn[0], Hn[1], 15); g.fill();
  g.restore();
  return { S: L2W(S), N: L2W(N), A: L2W(A), H: L2W([0, 0]), head: L2W(add(N, rot([10, -55], ha))), E: L2W(En), Hn: L2W(Hn), back: L2W(rot([-40, -100], lean)) };
}

// front view mother carrying the baby on a hip. hip: -1..1 (sideways shift), side: which hip holds the baby
function frontMom(cx, fy, o = {}) {
  const { s = .8, hip = 0, side = 1, t = 0, painB = 0 } = o;
  g.save(); g.translate(cx, fy); g.scale(s, s); g.lineCap = 'round';
  g.fillStyle = 'rgba(20,10,60,.22)'; g.beginPath(); g.ellipse(0, 4, 170, 22, 0, 0, Math.PI * 2); g.fill();
  const px = hip * side * 50;
  segs([[px - 50, -400, -62, -20, 56, MBOT], [px + 50, -400, 62, -20, 56, MBOT], [-66, -12, -100, -10, 32, C.navy], [66, -12, 100, -10, 32, C.navy]]);
  g.save(); g.translate(px, -400); g.rotate(-hip * side * .14);
  const sh = -270, bx = side * 150, by = -120;
  // free arm
  segs([[-side * 110, sh + 20, -side * 150, sh + 170, 42, MTOP], [-side * 150, sh + 170, -side * 160, sh + 260, 34, C.skin]]);
  blob(() => rr(-26, sh - 40, 52, 60, 10), C.skin, 10);
  blob(() => rr(-118, sh, 236, 290, 70), MTOP, 12);
  g.fillStyle = MBOT; rr(-112, -30, 224, 40, [0, 0, 40, 40]); g.fill();
  if (painB > 0) pulse(-side * 70, -40, t, painB);
  g.fillStyle = C.navy; circ(0, sh - 90, 80); g.fill(); g.fillStyle = C.skin; circ(0, sh - 90, 74); g.fill();
  g.fillStyle = C.hair; g.beginPath(); g.arc(0, sh - 90, 78, Math.PI * .95, Math.PI * 2.05); g.closePath(); g.fill(); circ(0, sh - 170, 30); g.fill();
  g.fillStyle = C.navy; circ(-26, sh - 82, 8); g.fill(); circ(26, sh - 82, 8); g.fill();
  g.strokeStyle = C.navy; g.lineWidth = 6; g.beginPath(); g.arc(0, sh - 62, 18, Math.PI * .2, Math.PI * .8); g.stroke();
  // baby on the hip
  baby(bx, by - 40, 1, 0, true);
  segs([[side * 110, sh + 20, side * 140, sh + 170, 42, MTOP], [side * 140, sh + 170, bx - side * 30, by + 10, 34, C.skin]]);
  g.restore(); g.restore();
}

// lying on the back, knees to chest (k 0..1)
function lyingKnees(cx, y, k, t) {
  g.save(); g.lineCap = 'round';
  blob(() => rr(cx - 420, y + 20, 760, 34, 16), C.cyan, 8);
  const H = [cx, y], S = [cx - 262, y];
  const Kn = [lerp(cx + 150, cx + 40, k), lerp(y - 150, y - 200, k)], F = [lerp(cx + 260, cx - 30, k), lerp(y + 10, y - 120, k)];
  segs([[H[0], H[1], Kn[0], Kn[1], 46, MBOT], [Kn[0], Kn[1], F[0], F[1], 40, MBOT], [S[0], S[1], H[0], H[1], 72, MTOP]]);
  g.save(); g.translate(S[0] - 70, S[1] - 10); g.rotate(-Math.PI / 2); drawHead(10, -10, t, 0); g.restore();
  const A = [S[0] + 30, S[1] - 20], T = [lerp(cx - 40, Kn[0] - 10, k), lerp(y - 40, Kn[1] + 10, k)];
  const [E, Hn] = ik(A, T, 128, 140, 'up');
  segs([[A[0], A[1], E[0], E[1], 34, MTOP], [E[0], E[1], Hn[0], Hn[1], 28, C.skin]]);
  g.restore();
}

// zoomed hand: thumb (0 tucked .. 1 spread), dev = wrist side bend (rad), pain at the thumb side of the wrist
function handZoom(x, y, o = {}) {
  const { thumb = 0, dev = 0, pain = 0, t = 0, fingers = 0, r = 170 } = o;
  g.save(); g.translate(x, y);
  g.fillStyle = C.navy; circ(6, 10, r + 8); g.fill(); g.fillStyle = '#FFF7EE'; circ(0, 0, r); g.fill();
  g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.clip();
  segs([[-200, 160, -20, 40, 70, C.skin]]);
  g.translate(-20, 40); g.rotate(-.6 + dev);
  // palm and fingers
  const fold = fingers;
  for (let i = 0; i < 4; i++) { const fx = -24 + i * 18; segs([[fx, -70, fx + fold * 10, lerp(-150, -95, fold), 16, C.skin]], 8); }
  blob(() => rr(-40, -80, 80, 90, 24), C.skin, 8);
  const ta = lerp(-.3, -1.4, thumb);
  segs([[-36, -30, -36 + Math.sin(ta) * 70, -30 - Math.cos(ta) * 70, 20, C.skin]], 8);
  g.restore();
  if (pain > 0) pulse(x - 60, y + 10, t, pain, 34);
  g.restore();
}
