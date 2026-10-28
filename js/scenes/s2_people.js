(function () {
  'use strict';
  const KS = window.KS, K = KS.kit, TX = KS.Text, T = KS.T, C = KS.C, U = KS.U;
  const SW = () => KS.world.swarm;
  const TAU = Math.PI * 2;

  const wp = (x, y, z = 0) => [x - 960, 540 - y, z];

  const fnR = (key, seed, fn) => ({ type: 'fn', key, seed, sort: 'path', fn });
  const mx = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const hid = (el) => (T.setEl(el, { o: 0 }), el);
  const prep = (S, R) => { const sw = SW(); if (sw && !sw.inert) S.prep(R, sw.N); };
  const look = (S, o, dur) => S.swarmLook(Object.assign({ o: 1, size: 2.0, i: 1, wob: 0.6, wobF: 0.6, flow: 0, twk: 0 }, o), { dur: dur != null ? dur : 1.2 });
  const glowTo = (sp, o, opt) => { if (sp && !sp.inert) T.to(sp, { o }, Object.assign({ dur: 1.2, ease: 'inOutSine' }, opt)); };
  const WORLD = (sky) => ({ sky: sky || 'deep', post: { vig: 0.5 }, dust: { o: 0.35 } });
  const DIM = 'rgba(243,234,216,.7)';
  const GA = Math.PI * (3 - Math.sqrt(5));

  const figPt = (k, n, cx, cy, H, j1, j2) => {
    const nr = Math.round(n * 0.24), nf = n - nr, nh = Math.round(nf * 0.142), top = cy - H / 2, bot = cy + H / 2;
    if (k >= nf) {
      const u = ((k - nf + 0.5) / nr) * 2.367;
      if (u < 0.817) {
        const th = (u / 0.817) * TAU;
        return [cx + 0.13 * H * Math.cos(th) + j1 * 0.5, top + 0.13 * H + 0.13 * H * Math.sin(th) + j2 * 0.5];
      }
      const th = ((u - 0.817) / 1.55) * Math.PI;
      return [cx + 0.32 * H * Math.cos(th) + j1 * 0.5, bot - 0.64 * H * Math.sin(th) + j2 * 0.5];
    }
    if (k < nh) {
      const r = 0.13 * H * Math.sqrt((k + 0.5) / nh), th = k * GA;
      return [cx + r * Math.cos(th) + j1, top + 0.13 * H + r * Math.sin(th) + j2];
    }
    const m = nf - nh, q = k - nh, r = Math.sqrt((q + 0.5) / m), th = Math.PI * ((q * 0.6180339887) % 1);
    return [cx + 0.32 * H * r * Math.cos(th) + j1, bot - 0.64 * H * r * Math.sin(th) + j2];
  };

  KS.scene({
    id: 'sec2', sec: 2, title: 'PART 02　「もう人と仕事をする時代ではない」と感じる理由', swarm: true,
    world: WORLD(),
    build(S) {
      S.data.card = K.card(S, { no: 2, y: 300, label: '「もう人と仕事をする\n時代ではない」と\n感じる理由', sub: '好き嫌いではなく、速さの話 ／ 時間の単位\n言葉という細い管 ／ 生身の幸せは別' });
    },
    steps: [(S) => { S.data.card.in({ delay: 0 }); }],
  });

  const NL_A = [600, 862], NL_B = [1320, 862], NL_H = 230, NL_FIG = 0.3;
  const NLR = [0, 1, 2].map((st) => fnR('s2:nl' + st, 5301, (P, cnt, rnd) => {
    const ak = 65536 / cnt, nf = Math.floor(cnt * NL_FIG), half = Math.floor(nf / 2);
    const cg = U.lin(C.gold2), cc = U.lin(C.cream), cy = U.lin(C.cyan), cb = U.lin(C.blue), cw = U.lin(C.white);
    for (let i = 0; i < cnt; i++) {
      const g1 = U.gauss(rnd), g2 = U.gauss(rnd), r1 = rnd(), r2 = rnd(), r3 = rnd(), aux = (i + 0.5) / cnt;
      if (i < nf) {
        const L = i < half, k = L ? i : i - half, n = L ? half : nf - half, c0 = L ? NL_A : NL_B;
        const q = figPt(k, n, c0[0], c0[1], NL_H, g1 * 0.7, g2 * 0.7), p = wp(q[0], q[1]);
        const c = st === 2 && !L ? mx(cy, cw, 0.15 + r1 * 0.35) : mx(cg, cc, r1 * 0.45);
        P.add(p[0], p[1], 0, 1.7, c[0], c[1], c[2], Math.min(1, (st === 1 ? 0.05 : 0.075) * ak), aux);
        continue;
      }
      const j = i - nf;
      if (!st) {

        const arc = j % 3, u = (Math.floor(j / 3) % 13 + 0.5) / 13, hgt = 150 + arc * 55, x0 = 700, x1 = 1220, yb = 770;
        const x = x0 + (x1 - x0) * u + g1 * 7, y = yb - 4 * hgt * u * (1 - u) + g2 * 2.4, c = mx(cc, cg, r2 * 0.6);
        const p = wp(x, y);
        P.add(p[0], p[1], 0, 1.5, c[0], c[1], c[2], Math.min(1, 0.03 * ak), aux);
      } else {

        const ln = j % 26, y = 590 + ln * 5.6 + g2 * 0.8, len = 260 + 760 * ((ln * 0.618) % 1), xh = 320 + ((ln * 0.381) % 1) * 1500;
        const u = Math.pow(r1, 0.6), x = xh - len * (1 - u), c = mx(cb, cy, u), hot = u > 0.985 ? mx(c, cw, 0.6) : c;
        const p = wp(x, y);
        P.add(p[0], p[1], 0, 1.4, hot[0], hot[1], hot[2], Math.min(1, (st === 2 ? 0.012 : 0.02) * u * u * ak), aux);
      }
    }
  }));
  const nlLines = () => {
    const rnd = U.rng(5302), cv = [];
    for (let i = 0; i < 12; i++) {
      const y = 594 + i * 12 + (rnd() - 0.5) * 4, x0 = -80 + rnd() * 300, pts = [];
      for (let k = 0; k <= 12; k++) pts.push(wp(x0 + (k / 12) * (2100 - x0), y + Math.sin(k * 0.5 + i) * 1.5));
      cv.push({ pts, w: 0.7 + rnd() * 0.7, col: i % 3 ? C.cyan : C.blue, mul: 0.4 + rnd() * 0.3, delay: rnd() * 0.4, seed: rnd(), taper: true, fade: [0.08, 0.12] });
    }
    return cv;
  };
  KS.scene({
    id: 'notlike', sec: 2, title: '好き嫌いではなく、速さの話', swarm: true, kf: [2, 3],
    world: WORLD(),
    build(S) {
      const d = S.data;
      prep(S, NLR[1]); prep(S, NLR[2]);
      d.eye = K.label(S, '誤解のないように言うと', { x: 960, y: 176, anchor: 'tc', size: 22, color: C.gold, ls: 0.28 });
      d.a = K.h(S, 'これは、好き嫌いの話ではありません', { x: 960, y: 226, anchor: 'tc', size: 60, lh: 1.2 });
      d.b = K.h(S, '人と話すのは、{今でも楽しい}', { x: 960, y: 336, anchor: 'tc', size: 40, color: DIM, lh: 1.2 });
      d.c = K.h(S, '速さの話です', { x: 960, y: 452, anchor: 'tc', size: 92, color: '#cfefff', lh: 1.1 });
      d.rb = S.ribbon({ curves: nlLines(), prog: 0, glow: 0.3, core: 0.9, head: 0.6, pulse: 1.5, pulseS: 0.75, pulseW: 0.035 });

      d.ey3 = K.label(S, '先ほどの、7月の1か月分の仕事を', { x: 960, y: 136, anchor: 'tc', size: 22, color: C.gold, ls: 0.28 });
      d.st = K.h(S, '一人でできた、一番大きな理由は\n作る過程に{人がいなかった}こと', { x: 960, y: 182, anchor: 'tc', size: 54, lh: 1.5 });
      d.st2 = K.label(S, '一緒に作った相手は、全員AI', { x: 960, y: 372, anchor: 'tc', size: 28, color: 'rgba(111,211,255,.92)', ls: 0.06 });
      d.me = K.label(S, '私', { x: NL_A[0], y: NL_A[1] + NL_H / 2 + 22, anchor: 'tc', size: 24, color: C.gold });
      d.ai = K.label(S, 'AI', { x: NL_B[0], y: NL_B[1] + NL_H / 2 + 22, anchor: 'tc', size: 24, color: '#bfe9ff' });
    },
    steps: [
      (S) => {
        const d = S.data;
        K.show(d.eye, { delay: 0.1, dy: 8 });
        TX.in(d.a, 'rise', { delay: 0.3, stagger: 0.035 });
        K.sw(S, NLR[0], { dur: 2.8, ord: 1, amt: 0.55, spread: 120, ease: 'out' });
        look(S, { wob: 1.0, wobF: 0.7 });
        TX.in(d.b, 'rise', { delay: 1.5, stagger: 0.04 });
      },
      (S) => {
        const d = S.data;
        [d.eye, d.a, d.b].forEach((el) => TX.dim(el, 0.35));
        K.sw(S, NLR[1], { dur: 1.6, ord: 1, amt: 0.5, spread: 30, ease: 'expo' });
        look(S, { wob: 0.4, wobF: 0.6 }, 1);
        K.weave(d.rb, { dur: 1.1, delay: 0.2, ease: 'inOutSine' });
        TX.in(d.c, 'spread', { delay: 0.5 });
        TX.glint(d.c, { delay: 1.6, dur: 1.4 });
      },
      (S) => {
        const d = S.data;
        [d.eye, d.a, d.b].forEach((el) => K.hide(el, { dur: 0.6 }));
        TX.dim(d.c, 0.3);
        if (!d.rb.inert) T.to(d.rb, { o: 0.35 }, { dur: 1.2 });
        K.sw(S, NLR[2], { dur: 1.8, ord: 0, amt: 0, spread: 0, ease: 'out' });
        look(S, { wob: 0.5, wobF: 0.6 }, 1);
        K.show(d.ey3, { delay: 0.5, dy: 8 });
        TX.in(d.st, 'lines', { delay: 0.8, stagger: 0.5 });
        K.show(d.me, { delay: 1.2, dy: 6 });
        K.show(d.ai, { delay: 1.4, dy: 6 });
        K.show(d.st2, { delay: 2.0, dy: 8 });
      },
    ],
  });

  const TSX = (sec) => 240 + ((Math.log10(sec) - 1.6) / 5) * 1480;
  const TS_HU = [TSX(604800), TSX(2592000)], TS_AI = [TSX(180), TSX(86400)], TS_YH = 650, TS_YA = 462, TS_AX = 790;
  const TS_TICKS = [['1分', 60], ['1時間', 3600], ['1日', 86400], ['1週間', 604800], ['1か月', 2592000]];
  const TS_FH = (TS_HU[1] - TS_HU[0]) / (TS_HU[1] - TS_HU[0] + TS_AI[1] - TS_AI[0]);
  const TSR = [0, 1, 2].map((st) => fnR('s2:ts' + st, 5304, (P, cnt, rnd) => {
    const ak = 65536 / cnt, nH = Math.floor(cnt * TS_FH);
    const cy = U.lin(C.cyan), cb = U.lin(C.blue), cg = U.lin(C.gold2), ca = U.lin(C.amber), cw = U.lin(C.white);
    for (let i = 0; i < cnt; i++) {
      const g1 = U.gauss(rnd), g2 = U.gauss(rnd), r1 = rnd(), r2 = rnd(), aux = (i + 0.5) / cnt;
      const hu = i < nH, u = hu ? (i + 0.5) / nH : (i - nH + 0.5) / (cnt - nH), B = hu ? TS_HU : TS_AI, y0 = hu ? TS_YH : TS_YA;

      const core = r1 < 0.4, x = B[0] + (B[1] - B[0]) * u + g1 * 5, e = Math.max(0, Math.min(1, Math.min(x - B[0] + 20, B[1] + 20 - x) / 40));
      const y = y0 + g2 * (core ? 2.0 : 8.5), c = hu ? mx(cg, ca, r2 * 0.55) : mx(cy, cb, r2 * 0.55), cc = core && r2 < 0.2 ? mx(c, cw, 0.5) : c;
      let al = e * (core ? 0.06 : 0.03) * ak;
      if (!hu && st === 0) al = 0;
      if (st === 2) al *= 1.25;
      const p = wp(x, y);
      P.add(p[0], p[1], 0, core ? 1.6 : 1.9, cc[0], cc[1], cc[2], Math.min(1, al), aux);
    }
  }));
  KS.scene({
    id: 'timescale', sec: 2, title: 'やりとりの、時間の単位', swarm: true,
    world: WORLD(),
    build(S) {
      const d = S.data, sv = (d.svg = K.svg(S));
      prep(S, TSR[1]); prep(S, TSR[2]);
      d.hd = K.head(S, 'やりとりの、時間の単位', { eye: 'TIME SCALE' });
      d.ax = K.line(sv, 240, TS_AX, 1720, TS_AX, 'dim');
      d.ticks = TS_TICKS.map(([t, s]) => hid(K.line(sv, TSX(s), TS_AX - 9, TSX(s), TS_AX + 9, 'dim')));
      d.tl = TS_TICKS.map(([t, s]) => K.label(S, t, { x: TSX(s), y: TS_AX + 26, anchor: 'tc', size: 23, color: DIM }));
      d.axc = K.cap(S, '1回のやりとりにかかる時間（対数目盛）', { x: 1720, y: TS_AX + 76, anchor: 'tr', size: 20 });
      const guide = (x, y) => hid(K.line(sv, x, y + 16, x, TS_AX - 12, 'k-ln thin dim', { 'stroke-dasharray': '2 7' }));
      d.gh = TS_HU.map((x) => guide(x, TS_YH));
      d.ga = TS_AI.map((x) => guide(x, TS_YA));
      d.lh = K.label(S, '人とのやりとり', { x: 120, y: TS_YH, anchor: 'cl', size: 28, color: C.gold });
      d.la = K.label(S, 'AIとのやりとり', { x: 120, y: TS_YA, anchor: 'cl', size: 28, color: C.cyan });
      d.rh = K.label(S, '1週間〜1か月', { x: (TS_HU[0] + TS_HU[1]) / 2, y: TS_YH - 28, anchor: 'bc', size: 30, color: C.gold2 });
      d.ra = [['数分', 180], ['数時間', 10800], ['長くても1日', 86400]].map(([t, s]) => K.label(S, t, { x: TSX(s), y: TS_YA - 28, anchor: 'bc', size: 30, color: '#cfefff' }));
      d.spk = K.glow(S, { size: 64, col: C.white, mul: 1.3, x: 240, y: TS_AX, z: 10, o: 0 });
      d.st = K.h(S, '人が悪いのではなく、{時間の単位}が、まるで違う', { x: 960, y: 932, anchor: 'tc', size: 46, lh: 1.2 });
    },
    steps: [
      (S) => {
        const d = S.data;
        d.hd.in({ delay: 0 });
        K.draw(d.ax, { dur: 1.6, delay: 0.3 });
        if (d.spk && !d.spk.inert) {
          T.set(d.spk, { x: S.at(240, TS_AX, 10)[0] });
          T.to(d.spk, { x: S.at(1720, TS_AX, 10)[0] }, { dur: 1.6, delay: 0.3, ease: 'inOutCubic' });
          T.to(d.spk, { o: 0.9 }, { dur: 0.3, delay: 0.3 });
          T.to(d.spk, { o: 0 }, { dur: 0.6, delay: 1.7, overwrite: false });
        }

        d.ticks.forEach((el, i) => K.fade(el, 1, { dur: 0.4, delay: 0.3 + 1.6 * ((TSX(TS_TICKS[i][1]) - 240) / 1480) }));
        d.tl.forEach((el, i) => K.show(el, { dy: 6, dur: 0.7, delay: 0.4 + 1.6 * ((TSX(TS_TICKS[i][1]) - 240) / 1480) }));
        K.show(d.axc, { delay: 2.0, dy: 6 });
        K.sw(S, TSR[0], { dur: 2.4, delay: 1.0, ord: 1, amt: 0.6, spread: 60, ease: 'out' });
        look(S, { wob: 0.5 });
        K.show(d.lh, { delay: 1.6, dy: 8 });
        d.gh.forEach((el) => K.fade(el, 1, { delay: 2.2 }));
        K.show(d.rh, { delay: 2.3, dy: 10 });
      },
      (S) => {
        const d = S.data;
        K.sw(S, TSR[1], { dur: 2.6, ord: 1, amt: 0.75, spread: 0, ease: 'out' });
        K.show(d.la, { delay: 0.2, dy: 8 });
        K.each(d.ra, 0.55, (el, t) => K.show(el, { delay: t, dy: 10 }), 0.9);
        d.ga.forEach((el) => K.fade(el, 1, { delay: 2.4 }));
      },
      (S) => {
        const d = S.data;
        K.sw(S, TSR[2], { dur: 1.4, ord: 0, amt: 0, spread: 0, ease: 'out' });
        look(S, { i: 1.15, wob: 0.5 }, 1.4);
        TX.in(d.st, 'rise', { delay: 0.3 });
        TX.glint(d.st, { delay: 1.4, dur: 1.4 });
      },
    ],
  });

  const BN_N = 10, BN_FT = 0.94, BN_SLIT = [1045, 536], BN_ME = [1045, 640];
  const BN_GRID = (t) => [192 + (t % 5) * 108, t < 5 ? 482 : 590];
  const BN_SHELF = (t) => [1332 + (t % 5) * 108, t < 5 ? 482 : 590];
  const BN_JAM = [[905, 536], [850, 470], [850, 602], [790, 420], [790, 536], [790, 652], [730, 470], [730, 602], [672, 536]];
  const BN_ROT = [0, -6, 5, 8, -4, -9, 4, -7, 3];
  const BN_SIDES = [0, 3, 4, 6, 0, 3, 4, 6, 0, 3];
  const BN_TOP = 'M760 370C880 380 960 515 1010 523L1080 523C1120 523 1150 505 1180 490';
  const BN_BOT = 'M760 702C880 692 960 557 1010 549L1080 549C1120 549 1150 567 1180 582';

  const bnRR = (x, y, h, r) =>
    'M' + (x - h + r) + ' ' + (y - h) + 'H' + (x + h - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + h) + ' ' + (y - h + r) +
    'V' + (y + h - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + h - r) + ' ' + (y + h) + 'H' + (x - h + r) +
    'A' + r + ' ' + r + ' 0 0 1 ' + (x - h) + ' ' + (y + h - r) + 'V' + (y - h + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x - h + r) + ' ' + (y - h) + 'Z';

  const bnRsq = (h, r, u) => {
    const s = 2 * (h - r), q = s + (TAU * r) / 4, f = u * 4, k = Math.min(3, Math.floor(f)), d = (f - k) * q;
    let x, y;
    if (d < s) (x = -h + r + d), (y = -h);
    else {
      const a = -Math.PI / 2 + (d - s) / r;
      (x = h - r + r * Math.cos(a)), (y = -h + r + r * Math.sin(a));
    }
    const c = [[1, 0], [0, 1], [-1, 0], [0, -1]][k];
    return [x * c[0] - y * c[1], x * c[1] + y * c[0]];
  };

  const bnPoly = (sides, r, u) => {
    if (!sides) return [r * Math.cos(u * TAU), r * Math.sin(u * TAU)];
    const f = u * sides, e = Math.floor(f), t = f - e, a0 = -Math.PI / 2 + (e * TAU) / sides, a1 = a0 + TAU / sides;
    return [r * (Math.cos(a0) + t * (Math.cos(a1) - Math.cos(a0))), r * (Math.sin(a0) + t * (Math.sin(a1) - Math.sin(a0)))];
  };

  const BNR = [0, 1, 2].map((st) => fnR('s2:bn' + st, 5305, (P, cnt, rnd) => {
    const ak = 65536 / cnt, nT = Math.floor((cnt * BN_FT) / BN_N), nP = BN_N * nT, nO = Math.floor(nT * 0.45), nF = Math.floor(nT * 0.8);
    const cy = U.lin(C.cyan), cb = U.lin(C.blue), cw = U.lin(C.white), cc = U.lin(C.cream), cg = U.lin(C.gold2);
    for (let i = 0; i < cnt; i++) {
      const g1 = U.gauss(rnd), g2 = U.gauss(rnd), r1 = rnd(), r2 = rnd(), r3 = rnd();
      if (i >= nP) {

        const q = figPt(i - nP, cnt - nP, BN_ME[0], BN_ME[1], 64, g1 * 0.7, g2 * 0.7), p = wp(q[0], q[1]);
        P.add(p[0], p[1], 0, 1.5, cg[0], cg[1], cg[2], st ? Math.min(1, 0.05 * ak) : 0, 0.9 + 0.1 * r3);
        continue;
      }
      const t = Math.floor(i / nT), k = i - t * nT, aux = (t + 0.6 * r3) / BN_N;
      let lx, ly, c, al, sz;
      if (k < nO) {
        const q = bnRsq(40, 16, (k + 0.5) / nO);
        (lx = q[0] + g1 * 0.6), (ly = q[1] + g2 * 0.6), (c = mx(cy, cb, r2 * 0.4)), (al = 0.035), (sz = 1.5);
        if (lx + ly < -44) c = mx(c, cw, 0.45);
      } else if (k < nF) {
        (lx = (r1 * 2 - 1) * 38), (ly = (r2 * 2 - 1) * 38), (c = cb), (al = 0.02), (sz = 2.2);
        const ex = Math.abs(lx) - 22, ey = Math.abs(ly) - 22, l = Math.hypot(ex, ey);
        if (ex > 0 && ey > 0 && l > 16) (lx = Math.sign(lx) * (22 + (ex * 16) / l)), (ly = Math.sign(ly) * (22 + (ey * 16) / l));
      } else {
        const q = bnPoly(BN_SIDES[t], 15, (k - nF + 0.5) / (nT - nF));
        (lx = q[0] + g1 * 0.5), (ly = q[1] + g2 * 0.5), (c = mx(cc, cw, r2 * 0.5)), (al = 0.045), (sz = 1.4);
      }
      let o = BN_GRID(t), sx = 1, sy = 1, rot = 0;
      if (st && t === 0) {
        if (st === 1) (o = [BN_SLIT[0] + 6, BN_SLIT[1]]), (sx = 0.5), (sy = 0.26);
        else o = BN_SHELF(0);
      } else if (st) (o = BN_JAM[t - 1]), (rot = (BN_ROT[t - 1] * Math.PI) / 180);
      const ax = lx * sx, ay = ly * sy, cr = Math.cos(rot), sr = Math.sin(rot), p = wp(o[0] + ax * cr - ay * sr, o[1] + ax * sr + ay * cr);
      P.add(p[0], p[1], 0, sz, c[0], c[1], c[2], Math.min(1, al * ak), aux);
    }
  }));
  KS.scene({
    id: 'bottleneck', sec: 2, title: 'アプリ自体は、すぐできるのに', swarm: true, world: WORLD(),
    build(S) {
      const d = S.data, sv = (d.svg = K.svg(S));
      BNR.slice(1).forEach((R) => prep(S, R));
      d.hd = K.head(S, 'アプリ自体は、すぐできるのに', { eye: 'BOTTLENECK' });
      d.slots = Array.from({ length: BN_N }, (_, t) => {
        const q = BN_SHELF(t);
        return hid(K.path(sv, bnRR(q[0], q[1], 42, 16), 'thin dim', { 'stroke-dasharray': '3 7' }));
      });
      d.fun = [BN_TOP, BN_BOT].map((p) => K.path(sv, p, 'dim'));
      d.funA = [BN_TOP, BN_BOT].map((p) => hid(K.path(sv, p, '', { style: 'stroke:' + C.amber })));
      d.lead = hid(K.line(sv, 1045, 410, 1045, 512, 'thin dim'));
      d.lp = K.label(S, '人による操作が強制される\nストアへの申請手続き', { x: 1045, y: 398, anchor: 'bc', size: 24, color: DIM, align: 'center' });
      d.ca = K.label(S, 'アプリ本体：AIと一緒に、すぐできる', { x: 150, y: 680, size: 24, color: DIM });
      d.cb = K.label(S, 'ストアで公開', { x: 1290, y: 680, size: 24, color: DIM });
      d.me = K.label(S, '私', { x: BN_ME[0], y: 684, anchor: 'tc', size: 22, color: C.gold2 });
      d.stop = K.label(S, '私が、そこで止まってしまう', { x: BN_ME[0], y: 742, anchor: 'tc', size: 30 });
      d.gate = K.glow(S, { x: BN_SLIT[0], y: BN_SLIT[1], size: 260, col: C.amber });
      d.st = K.h(S, 'これからは、AIでできないところが、\n{全部ボトルネック}になる', { x: 960, y: 842, anchor: 'tc', size: 46, lh: 1.45 });
    },
    steps: [
      (S) => {
        const d = S.data;
        d.hd.in({ delay: 0 });
        K.sw(S, BNR[0], { dur: 2.4, delay: 0.3, ord: 1, amt: 0.65, spread: 90, ease: 'out' });
        look(S, { wob: 0.4 });
        K.show(d.ca, { delay: 1.8, dy: 8 });
        d.fun.forEach((el) => K.draw(el, { dur: 1.6, delay: 1.2 }));
        K.fade(d.lead, 1, { delay: 2.2 });
        K.show(d.lp, { delay: 2.2, dy: 8 });
        K.each(d.slots, 0.05, (el, t) => K.fade(el, 1, { delay: t }), 2.0);
        K.show(d.cb, { delay: 2.4, dy: 8 });
      },
      (S) => {
        const d = S.data;

        K.sw(S, BNR[1], { dur: 2.0, ord: 1, amt: 0.55, spread: 0, ease: 'out' });
        K.sw(S, BNR[2], { dur: 1.3, delay: 2.4, ord: 0, amt: 0, spread: 0, ease: 'out' });
        look(S, { wob: 0.9, wobF: 0.9 });
        K.show(d.me, { delay: 0.6, dy: 6 });
        glowTo(d.gate, 0.22, { delay: 0.8, dur: 1.4 });
        K.show(d.stop, { delay: 3.2, dy: 10 });
      },
      (S) => {
        const d = S.data;
        look(S, { i: 0.75, wob: 0.9, wobF: 0.9 }, 1.6);
        d.fun.forEach((el) => K.fade(el, 0.25, { dur: 1.4 }));
        d.funA.forEach((el) => K.fade(el, 1, { dur: 1.4 }));
        glowTo(d.gate, 0.36, { dur: 1.6 });
        [d.ca, d.cb, d.lp].forEach((el) => K.fade(el, 0.45));
        K.fade(d.stop, 0.5);
        TX.in(d.st, 'lines', { delay: 0.5, stagger: 0.5 });
        TX.glint(d.st, { delay: 1.8, dur: 1.4 });
      },
    ],
  });

  const PI_TREE = (() => {
    const rnd = U.rng(5306), segs = [], tips = [];
    const grow = (x, y, a, len, w, dep) => {
      const x1 = x + Math.cos(a) * len, y1 = y + Math.sin(a) * len;
      segs.push([x, y, x1, y1, w, dep]);
      if (dep >= 7) return void tips.push([x1, y1]);
      const nb = rnd() < 0.45 ? 3 : 2;
      for (let b = 0; b < nb; b++) {
        const sp = nb === 3 ? (b - 1) * 0.55 : (b - 0.5) * 0.8;
        grow(x1, y1, a + sp + (rnd() - 0.5) * 0.35, len * (0.7 + rnd() * 0.12), w * 0.72, dep + 1);
      }
    };
    grow(0, 0, -Math.PI / 2, 100, 7, 0);
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    segs.forEach((s) => ((x0 = Math.min(x0, s[0], s[2])), (x1 = Math.max(x1, s[0], s[2])), (y0 = Math.min(y0, s[1], s[3])), (y1 = Math.max(y1, s[1], s[3]))));
    const k = Math.min(380 / (y1 - y0), 400 / (x1 - x0)), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const P = (x, y) => [(x - cx) * k, (y - cy) * k];
    const out = segs.map((s) => { const a = P(s[0], s[1]), b = P(s[2], s[3]); return [a[0], a[1], b[0], b[1], s[4] * k, s[5]]; });
    let acc = 0;
    const cum = out.map((s) => (acc += Math.hypot(s[2] - s[0], s[3] - s[1]) * (0.6 + s[4])));
    return { segs: out, cum: cum.map((c) => c / acc), tips: tips.map((t) => P(t[0], t[1])) };
  })();
  const PI_L = [430, 600], PI_R = [1490, 600], PI_TOP = 'M690 560C740 560 750 588 790 588L1130 588C1170 588 1180 560 1230 560';
  const PI_BOT = 'M690 640C740 640 750 612 790 612L1130 612C1170 612 1180 640 1230 640';
  const piSeg = (u) => { const c = PI_TREE.cum; let a = 0, b = c.length - 1; while (a < b) { const m = (a + b) >> 1; if (c[m] < u) a = m + 1; else b = m; } return PI_TREE.segs[a]; };

  const PIR = [0, 1, 2, 3].map((st) => fnR('s2:pi' + st, 5307, (P, cnt, rnd) => {
    const ak = 65536 / cnt, nB = Math.floor(cnt * 0.55), nt = PI_TREE.tips.length;
    const cg = U.lin(C.gold2), ca = U.lin(C.amber), cc = U.lin(C.cream), cw = U.lin(C.white);
    for (let i = 0; i < cnt; i++) {
      const g1 = U.gauss(rnd), g2 = U.gauss(rnd), r1 = rnd(), r2 = rnd(), r3 = rnd();
      let lx, ly, c, al, sz, aux, sk = false;
      if (i < nB) {
        const s = piSeg(r1), w = s[4];
        (lx = s[0] + (s[2] - s[0]) * r2 + g1 * w * 0.3), (ly = s[1] + (s[3] - s[1]) * r2 + g2 * w * 0.3);
        (c = mx(cg, ca, Math.min(1, s[5] / 7 + 0.2 * r3))), (al = 0.05), (sz = 1.5), (aux = (s[5] + r2) / 8), (sk = s[5] <= 3 && r3 < 0.5);
      } else {
        const t = PI_TREE.tips[(i - nB) % nt];
        (lx = t[0] + g1 * 4.5), (ly = t[1] + g2 * 4.5), (c = r3 < 0.12 ? mx(cc, cw, 0.6) : mx(cg, cc, r2 * 0.6)), (al = 0.07), (sz = 1.8), (aux = 0.88 + 0.12 * r2);
      }
      let x = PI_L[0] + lx, y = PI_L[1] + ly;
      if (st === 0) (x = 1450 + lx), (y = 580 + ly), (al *= 0.45);
      else if (sk && st === 2) (x = 1200 - 480 * Math.min(1, aux * 2) + g1 * 0.8), (y = 600 + g2 * 1.1), (al *= 0.7), (c = mx(c, cw, 0.35));
      else if (sk && st === 3) (x = PI_R[0] + lx), (y = PI_R[1] + ly);
      const p = wp(x, y);
      P.add(p[0], p[1], 0, sz, c[0], c[1], c[2], Math.min(1, al * ak), aux);
    }
  }));

  const piStream = () => {
    const pts = [];
    for (let k = 0; k <= 16; k++) pts.push(wp(700 + (k / 16) * 520, 600));
    return [{ pts, w: 1.5, col: C.gold2, col2: C.cream, mul: 0.8, seed: 0.37, taper: true, fade: [0.06, 0.1] }];
  };
  KS.scene({
    id: 'pipe', sec: 2, title: '言葉という、細い管', swarm: true, world: WORLD(),
    build(S) {
      const d = S.data, sv = (d.svg = K.svg(S));
      PIR.slice(1).forEach((R) => prep(S, R));
      d.q = K.quote(S, '人間の知性を縛る最大の制約は、\n熱く遅い脳と、\n言葉という細い管と、\n数十キロの身体という荷物である。', { x: 200, y: 330, size: 52, src: '『人類という通過点』第2章' });
      d.hd = K.head(S, '言葉という、細い管', { eye: 'WORDS' });
      d.walls = [PI_TOP, PI_BOT].map((p) => K.undrawn(K.path(sv, p, 'dim')));
      d.rb = S.ribbon({ curves: piStream(), prog: 0, glow: 0.5, core: 0.9, head: 0.8, pulse: 1.4, pulseS: 0.55, pulseW: 0.05 });
      d.lL = K.label(S, '頭の中の像', { x: PI_L[0], y: 826, anchor: 'tc', size: 26, color: C.gold2 });
      d.lP = K.label(S, '言葉という細い管', { x: 960, y: 548, anchor: 'bc', size: 26, color: DIM });
      d.lR = K.label(S, '相手の頭の中', { x: PI_R[0], y: 826, anchor: 'tc', size: 26, color: DIM });
      d.s1 = K.stat(S, { x: 1800, y: 96, anchor: 'tr', size: 100, value: 39, pre: '毎秒およそ', unit: 'ビット' });
      d.c1 = K.label(S, '話し言葉の情報量。調べられた17の言語で、ほぼ同じ', { x: 1800, y: 222, anchor: 'tr', size: 23, color: DIM });
      d.src = K.src(S, 'Coupé, Oh, Dediu & Pellegrino, Science Advances 5, eaaw2594 (2019)');
      d.rg = K.glow(S, { x: PI_R[0], y: PI_R[1], size: 320, col: C.gold2 });
    },
    steps: [
      (S) => {
        const d = S.data;
        d.q.in({ delay: 0.2 });
        K.sw(S, PIR[0], { dur: 3.4, delay: 0.4, ord: 1, amt: 0.7, spread: 40, ease: 'out' });
        look(S, { wob: 0.5, wobF: 0.5 });
      },
      (S) => {
        const d = S.data;
        [d.q.bar, d.q.text, d.q.src].forEach((el) => K.hide(el, { dur: 0.8 }));
        d.hd.in({ delay: 0.5 });

        K.sw(S, PIR[1], { dur: 2.0, ord: 0, amt: 0, spread: 30, ease: 'out' });
        K.sw(S, PIR[2], { dur: 1.6, delay: 2.4, ord: 1, amt: 0.6, spread: 0, ease: 'out' });
        K.sw(S, PIR[3], { dur: 1.8, delay: 4.2, ord: 1, amt: 0.5, spread: 0, ease: 'out' });
        K.show(d.lL, { delay: 1.4, dy: 8 });
        d.walls.forEach((el) => K.draw(el, { dur: 1.2, delay: 1.2 }));
        K.show(d.lP, { delay: 1.8, dy: 8 });
        K.weave(d.rb, { dur: 1.4, delay: 2.6 });
        K.show(d.lR, { delay: 5.0, dy: 8 });
        glowTo(d.rg, 0.09, { delay: 4.8, dur: 1.6 });
        d.s1.in({ delay: 1.0, from: 0, dur: 2.0 });
        K.show(d.c1, { delay: 2.2, dy: 6 });
        K.show(d.src, { delay: 2.6, dy: 6 });
      },
    ],
  });

  KS.scene({
    id: 'heavy', sec: 2, title: '重機がある今', swarm: false, world: WORLD(), images: ['heavy_machine', 'stone_lift'],
    build(S) {
      const d = S.data;
      d.bg1 = K.photo(S, 'heavy_machine', { z: -1200, w: 2200, fe: 90, exp: 0.8 });

      d.bg2 = K.photo(S, 'stone_lift', { z: -1190, w: 2200, fe: 90, exp: 0.8, rt: 2, ix: 0.18, iy: 0.04, rs: 0.22, rn: 0.22, rw: 0.75 });
      d.scrim = S.div({ x: 0, y: 0, w: 1920, h: 1080 });
      d.scrim.style.background = 'radial-gradient(ellipse 1250px 720px at 0% 0%, rgba(5,7,13,.82) 0%, rgba(5,7,13,.6) 45%, rgba(5,7,13,0) 100%)';
      d.shade = S.div({ x: 0, y: 0, w: 1920, h: 1080 });
      d.shade.style.background = 'linear-gradient(180deg, rgba(5,7,13,.3) 0%, rgba(5,7,13,.42) 45%, rgba(5,7,13,.86) 100%)';
      d.hd = K.head(S, '重機がある今、\n岩を持ち上げる力は', { eye: 'STRENGTH', size: 58 });
      d.l2 = K.h(S, '仕事というより、\n{見て楽しむもの}に', { y: 346, size: 58 });
      d.bar = K.vrule(S, { x: 92, y: 650, h: 172 });
      d.st = K.h(S, '人間が頭を使うことも、\nだんだん、{楽しみの側}へ', { y: 640, size: 60, lh: 1.42 });
      d.st2 = K.h(S, '──移っていくのかもしれません', { y: 846, size: 32, color: DIM });
    },
    steps: [
      (S) => {
        const d = S.data;
        K.reveal(d.bg1, { dur: 2.8 });
        K.drift(S, d.bg1, { zoom: 1.035, px: -0.01, dur: 20 });
        K.fade(d.scrim, 1, { dur: 1.8 });
        d.hd.in({ delay: 0.9 });
      },
      (S) => {
        const d = S.data;
        K.unreveal(d.bg1, { dur: 2.4, delay: 0.3 });
        K.reveal(d.bg2, { dur: 2.6, ease: 'inOutSine' });
        K.drift(S, d.bg2, { zoom: 1.03, px: 0.008, dur: 20 });
        TX.in(d.l2, 'rise', { delay: 1.3, stagger: 0.035 });
        TX.glint(d.l2, { delay: 2.8 });
      },
      (S) => {
        const d = S.data;
        T.to(d.bg2, { exp: 0.42, sat: 0.62 }, { dur: 2.4, ease: 'inOutSine' });
        K.fade(d.shade, 1, { dur: 2.0 });
        [d.hd.eye, d.hd.h, d.l2].forEach((el) => TX.dim(el, 0.42, { dur: 1.2 }));
        K.grow(d.bar, { delay: 0.8, dur: 1.2 });
        TX.in(d.st, 'lines', { delay: 0.9 });
        TX.glint(d.st, { delay: 2.5 });
        K.show(d.st2, { delay: 2.5, dy: 8 });
      },
    ],
  });

  const SE_NET = (() => {
    const r = U.rng(5309), N = [], E = [], seen = {}, cum = [];
    for (let j = 0; j < 3; j++) for (let i = 0; i < 6; i++) N.push([236 + i * 118 + (r() - 0.5) * 64, 476 + j * 136 + (r() - 0.5) * 70, r()]);
    N.forEach((a, i) => {
      N.map((b, k) => [k, Math.hypot(a[0] - b[0], a[1] - b[1])]).filter((q) => q[0] !== i).sort((p, q) => p[1] - q[1]).slice(0, 2).forEach((q) => {
        const key = Math.min(i, q[0]) + '-' + Math.max(i, q[0]);
        if (!seen[key]) { seen[key] = 1; E.push([i, q[0]]); }
      });
    });
    let acc = 0;
    E.forEach(([a, b]) => { acc += Math.hypot(N[a][0] - N[b][0], N[a][1] - N[b][1]); cum.push(acc); });
    return { N, E, cum, len: acc };
  })();

  const SE_BOK = (() => {

    const r = U.rng(5310), pal = [C.gold2, C.gold2, C.amber, '#ffb877', '#ffb877', '#ffe2b0'], out = [];
    for (let tries = 0; out.length < 22 && tries < 4000; tries++) {
      const t = r(), off = (r() - 0.5) * 210, rad = 10 + 58 * Math.pow(r(), 2.2), col = pal[Math.floor(r() * pal.length)], v = r();
      const x = 1110 + t * 680 + off * 0.35, y = 790 - t * 250 + Math.sin(t * Math.PI) * -40 + off;
      if (x - rad < 1070 || x + rad > 1830 || y + rad > 846 || y - rad < 470 || (x < 1430 && y - rad < 506)) continue;
      if (out.some((b) => Math.hypot(b[0] - x, b[1] - y) < (b[2] + rad) * 0.82)) continue;
      out.push([Math.round(x), Math.round(y), Math.round(rad), col, Math.min(0.95, Math.max(0.26, (0.98 - rad / 92) * (0.85 + 0.3 * v)))]);
    }
    return out;
  })();
  const SER = fnR('s2:se', 5308, (P, cnt, rnd) => {
    const ak = 65536 / cnt, { N, E, cum, len } = SE_NET;
    const cy = U.lin(C.cyan), bl = U.lin(C.blue), wh = U.lin(C.white), bcol = SE_BOK.map((b) => mx(U.lin(b[3]), wh, 0.25)), area = [];
    let at = 0;
    SE_BOK.forEach((b) => { at += b[2]; area.push(at); });
    const nN = Math.floor(cnt * 0.14), nE = Math.floor(cnt * 0.38);
    for (let i = 0; i < cnt; i++) {
      const r1 = rnd(), r2 = rnd(), r3 = rnd(), r4 = rnd(), g1 = U.gauss(rnd), g2 = U.gauss(rnd);
      if (i < nN) {

        const n = N[i % N.length], big = n[2] > 0.72 ? 1.6 : 1, c = r1 < 0.22 ? wh : cy;
        P.add(...wp(n[0] + g1 * 4 * big, n[1] + g2 * 4 * big, (r3 - 0.5) * 24), 1.7, c[0], c[1], c[2], 0.06 * ak, ((n[0] - 200) / 660) * 0.45 + r4 * 0.04);
      } else if (i < nN + nE) {

        const u = r1 * len;
        let lo = 0, hi = cum.length - 1;
        while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] < u) lo = m + 1; else hi = m; }
        const a = N[E[lo][0]], b = N[E[lo][1]], x = a[0] + (b[0] - a[0]) * r2 + g1 * 1.1, y = a[1] + (b[1] - a[1]) * r2 + g2 * 1.1, c = mx(bl, cy, r3);
        P.add(...wp(x, y, (r4 - 0.5) * 16), 1.3, c[0], c[1], c[2], 0.05 * ak, ((x - 200) / 660) * 0.45 + r4 * 0.04);
      } else {

        const u = r1 * at;
        let k = 0;
        while (k < area.length - 1 && area[k] < u) k++;
        const b = SE_BOK[k], c = bcol[k], th = r2 * TAU, aux = 0.5 + ((b[0] - 1060) / 760) * 0.4 + r4 * 0.06;
        if (r3 < 0.15) P.add(...wp(b[0] + Math.cos(th) * b[2] * (1.25 + r4 * 1.1), b[1] + Math.sin(th) * b[2] * (1.25 + r4 * 1.1), 0), 1.3, c[0], c[1], c[2], 0.045 * ak, aux);
        else { const rr = b[2] + g1 * 0.7; P.add(...wp(b[0] + Math.cos(th) * rr, b[1] + Math.sin(th) * rr, 0), 1.1, c[0], c[1], c[2], 0.03 * ak, aux); }
      }
    }
  });

  KS.scene({
    id: 'separate', sec: 2, title: '分けて考える', swarm: true, world: WORLD(),
    build(S) {
      const d = S.data;
      prep(S, SER);
      d.hd = K.head(S, '私自身は、分けて考えています', { eye: 'TWO THINGS', size: 52 });
      d.rule = K.vrule(S, { x: 959, y: 290, h: 530 });
      d.lt = K.h(S, '実利を生む取り組み', { x: 200, y: 300, size: 44, color: '#cfefff' });
      d.rt = K.h(S, '生身の人間としての幸せ', { x: 1060, y: 300, size: 44, color: C.gold2 });
      d.c0 = K.chip(S, 'AIと共に行う', { cyan: true, x: 200, y: 384, style: { fontSize: '26px' } });
      d.c1 = K.chip(S, '人と関わる', { x: 1060, y: 384, style: { fontSize: '26px' } });
      d.bk = SE_BOK.map((b) => K.glow(S, { x: b[0], y: b[1], size: b[2] / 0.775, type: 'bokeh', col: b[3], i: b[4] }));
      d.st = K.h(S, 'これは、将来の{予測}の話。\nどう生きたいかは、一人一人が{選べる}こと。', { x: 960, y: 872, anchor: 'tc', size: 44, lh: 1.5 });
    },
    steps: [
      (S) => {
        const d = S.data;
        d.hd.in({ delay: 0.2 });
        K.grow(d.rule, { delay: 0.6, dur: 1.4 });
        K.show(d.lt, { delay: 1.0, dy: 10 });
        K.show(d.c0, { delay: 1.6, dy: 8 });
        K.sw(S, SER, { dur: 3.2, delay: 0.5, ord: 1, amt: 0.6, spread: 60, ease: 'out' });
        look(S, { i: 1, wob: 0.35, wobF: 0.5, twk: 0.3 }, 1.6);
        K.show(d.rt, { delay: 2.0, dy: 10 });
        K.show(d.c1, { delay: 2.6, dy: 8 });
        d.bk.forEach((sp, k) => glowTo(sp, 1, { delay: 2.0 + ((SE_BOK[k][0] - 1060) / 760) * 1.2, dur: 1.8 }));
      },
      (S) => {
        const d = S.data;
        look(S, { i: 0.72, wob: 0.3, wobF: 0.5, twk: 0.3 }, 1.6);
        [d.lt, d.rt, d.c0, d.c1].forEach((el) => K.fade(el, 0.6, { dur: 1.2 }));
        K.fade(d.rule, 0.5, { dur: 1.2 });
        d.bk.forEach((sp) => glowTo(sp, 0.72, { dur: 1.4 }));
        TX.in(d.st, 'lines', { delay: 0.6 });
        TX.glint(d.st, { delay: 2.0 });
      },
    ],
  });
})();
