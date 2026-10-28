(function () {
  'use strict';
  const KS = window.KS, K = KS.kit, TX = KS.Text, T = KS.T, C = KS.C, U = KS.U;
  const SW = () => KS.world.swarm;
  const TAU = Math.PI * 2;

  const wp = (x, y, z = 0) => [x - 960, 540 - y, z];

  const fnR = (key, seed, fn) => ({ type: 'fn', key, seed, sort: 'path', fn });
  const mx = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const prep = (S, R) => { const sw = SW(); if (sw && !sw.inert) S.prep(R, sw.N); };
  const glowTo = (sp, o, opt) => { if (sp && !sp.inert) T.to(sp, { o }, Object.assign({ dur: 1.2, ease: 'inOutSine' }, opt)); };
  const WORLD = (sky) => ({ sky: sky || 'deep', post: { vig: 0.5 }, dust: { o: 0.35 } });
  const DIM = 'rgba(243,234,216,.7)';
  const tier = () => (KS.world.tier === 'low' ? 128 : 256);

  const scrim = (S, css, o = {}) => {
    const el = S.div({ x: o.x || 0, y: o.y || 0, w: o.w || 1920, h: o.h || 1080 });
    el.style.background = css;
    T.setEl(el, { o: 0 });
    return el;
  };

  const ramp = (cols, t) => {
    const f = U.clamp(t, 0, 0.9999) * (cols.length - 1), i = Math.floor(f);
    return mx(cols[i], cols[i + 1], f - i);
  };

  const BC = [1452, 540];
  const DSK = { rin: 440, rout: 760, ry: -38, rz: 90 - 9 };
  const diskR = (stage) => fnR('s4:disk' + stage, 5501, (P, cnt, rnd) => {
    const ak = 65536 / cnt, cols = [U.lin(C.white), U.lin(C.gold2), U.lin(C.gold), U.lin(C.amber), U.lin(C.copper)], cy = U.lin(C.cyan);
    const ri = DSK.rin, ro = DSK.rout, arms = 9;
    for (let i = 0; i < cnt; i++) {
      const u = rnd(), v = rnd(), w = rnd(), e = rnd(), f = rnd(), g1 = U.gauss(rnd), g2 = U.gauss(rnd), g3 = U.gauss(rnd);
      const q = Math.pow(u, 1.9);
      const r = ri + (ro - ri) * q + g3 * (3 + 8 * q);
      const streak = e < 0.64;
      const th = streak ? (Math.floor(w * arms) / arms) * TAU + w * 0.5 + 2.8 * Math.log(r / ri) + g1 * (0.05 + 0.05 * q) : v * TAU;
      const h = (1.5 + 10 * q) * g2;
      const cyan = f > 0.972;
      const c = cyan ? cy : ramp(cols, q * 1.05 + 0.06 * g1);
      let a = (0.05 + 0.34 * (1 - q) * (1 - q)) * (streak ? 1.25 : 0.7) * (cyan ? 1.6 : 1);
      let size = 1.3 + 1.3 * (1 - q) + (cyan ? 0.6 : 0);
      let R = r, TH = th, H = h;
      if (!stage) { R = r * (1.9 + 0.9 * v); TH = th - 1.2 - 0.9 * w; H = h * 8 + g1 * 30; a = 0; size *= 1.4; }
      P.add(H, R * Math.cos(TH), R * Math.sin(TH), size, c[0], c[1], c[2], Math.min(1, a * ak), q);
    }
  });
  const DISK = [diskR(0), diskR(1)];

  KS.scene({
    id: 'bootcover', sec: 4, title: '前著『神のブートローダー』', swarm: false, world: WORLD('deep'), images: ['cover_boot'],
    build(S) {
      const d = S.data, c = (d.c = S.at(BC[0], BC[1], 0));
      d.fx = K.ps(S, { side: tier(), o: 0, i: 1, size: 2.0, wob: 0.35, wobF: 0.5, order: 5 });
      if (!d.fx.inert) {
        DISK.forEach((R) => S.prep(R, d.fx.N));
        d.fx.set(DISK[0], { x: c[0], y: c[1], z: 0 });
        Object.assign(d.fx.m, { px: c[0], py: c[1], pz: 0, ry: DSK.ry, rz: DSK.rz });
        d.fx.spin.x = S.kf ? 0 : -7;
      }
      d.cover = K.cover(S, 'cover_boot', { x: BC[0], y: BC[1], w: 440 });
      d.hole = K.glow(S, { x: 1525, y: 404, z: 8, size: 190, col: C.gold2, mul: 1.1 });
      d.eye = K.eyebrow(S, 'PART 04　前著　PREVIOUS BOOK', { x: 120, y: 150 });
      d.title = S.text('『神のブートローダー』', { cls: 'serif', size: 72, x: 104, y: 186, color: C.white, ls: 0.04 });
      d.sub = S.text('超知能の事象の地平線\n── エントロピー、進化、そしてヒトの役割', { cls: 'serif', size: 30, x: 120, y: 304, lh: 1.7, color: C.cream, ls: 0.06 });
      d.rule = K.rule(S, { x: 120, y: 436, w: 700 });
      d.line = S.text('2025年{12月}に出した、前の本', { cls: 'serif', size: 40, x: 120, y: 476, color: C.cream, ls: 0.06 });
    },
    steps: [
      (S) => {
        const d = S.data, c = d.c;
        K.coverIn(d.cover, { delay: 0.2 });
        K.spark(d.hole, { o: 0.9, delay: 2.0, rise: 0.5, fall: 2.4 });
        if (!d.fx.inert) {
          T.to(d.fx, { o: 1 }, { dur: 0.6, delay: 0.3 });
          d.fx.morph(DISK[1], { x: c[0], y: c[1], z: 0, dur: 4.6, delay: 0.35, ord: 1, amt: 0.62, spread: 30, ease: 'out' });
        }
        K.show(d.eye, { delay: 0.3, dy: 8 });
        K.show(d.title, { delay: 0.5 });
        TX.in(d.sub, 'lines', { delay: 0.9, stagger: 0.25, dy: 14 });
        K.grow(d.rule, { delay: 1.3 });
        K.show(d.line, { delay: 1.9 });
        TX.glint(d.title, { delay: 2.6, dur: 1.6 });
      },
    ],
  });

  const BL = { gx: 120, gy: 168, gw: 700, gh: 470, rx: 156, r0: 262, rs: 36, fs: 19, x0: 200, x1: 1800, ty: 880, sw: 40, b0: 246, b1: 1776, pw: 150 };
  const BL_ROWS = [
    ['OK', 'POWER ON'], ['OK', 'CPU'], ['OK', 'MEMORY'], ['OK', 'STORAGE'], ['OK', 'LOADING BOOTLOADER'], ['', '{BOOTLOADER RUNNING}'],
    ['OK', 'LOADING OS'], ['OK', 'HANDOFF TO OS'], ['', '((BOOTLOADER EXIT))'], ['', 'OS RUNNING'],
  ];
  const blRowY = (i) => BL.r0 + i * BL.rs;

  const blCurX = (i) => BL.rx + 120 + BL_ROWS[i][1].replace(/[{}()]/g, '').length * BL.fs * 0.66 + 6;

  const blRowIn = (d, i, dl) => {
    const r = d.rows[i], e = TX.in(r.tx, 'type', { delay: dl, stagger: 0.014 });
    if (r.st) K.show(r.st, { delay: e + 0.05, dy: 0, blur: 0, dur: 0.12 });
    return e;
  };
  const bar = (S, o, css) => S.div(Object.assign({}, o, { style: Object.assign({ transformOrigin: '0 50%' }, css) }));

  KS.scene({
    id: 'bootloader', sec: 4, title: 'ブートローダーとは', swarm: false, kf: [1, 2, 3],
    world: { sky: 'void', post: { vig: 0.5 }, dust: { o: 0.2 } }, images: ['bootloader_dawn'],
    build(S) {
      const d = S.data;

      d.dawn = K.photo(S, 'bootloader_dawn', { z: -1200, w: 2200, fe: 90, exp: 0.9, rt: 2, ix: 0.02, iy: 0.29, rs: 0.34, rn: 0.24, rw: 0.9, rc: [1.8, 1.05, 0.45] });
      d.sun = K.glow(S, { x: 982, y: 360, z: 0, size: 560, col: C.gold2, mul: 0.8 });
      d.scrT = scrim(S, 'radial-gradient(ellipse 64% 36% at 50% 15%, rgba(5,7,13,.8), rgba(5,7,13,0))');
      d.scrB = scrim(S, 'linear-gradient(180deg, rgba(5,7,13,0) 56%, rgba(5,7,13,.84) 76%, rgba(5,7,13,.94))');

      const cy = BL.gy + BL.gh / 2;
      d.glass = K.glass(S, { x: BL.gx, y: BL.gy, w: BL.gw, h: BL.gh });
      d.glass.style.background = 'repeating-linear-gradient(180deg, rgba(255,248,236,.022) 0 1px, rgba(0,0,0,0) 1px 3px), linear-gradient(180deg, rgba(20,28,48,.74), rgba(10,14,26,.74))';
      d.flash = bar(S, { x: BL.gx, y: cy - 1, w: BL.gw, h: 2 }, {
        transformOrigin: '50% 50%', background: 'linear-gradient(90deg, rgba(255,248,236,0), #fff8ec 28%, #fff8ec 72%, rgba(255,248,236,0))',
        boxShadow: '0 0 18px rgba(255,207,138,.9), 0 0 64px rgba(242,183,102,.6)',
      });
      d.flashS = K.glow(S, { x: BL.gx + BL.gw / 2, y: cy, z: 0, size: 980, type: 'streak', col: C.gold2 });
      d.head = S.text('BOOT SEQUENCE', { cls: 'mono', size: 15, x: BL.rx, y: BL.gy + 30, color: DIM, ls: 0.32 });
      d.hrule = K.rule(S, { x: BL.rx, y: BL.gy + 68, w: BL.gw - 72 });
      d.rows = BL_ROWS.map(([st, tx], i) => ({
        st: st ? S.text('[  {' + st + '}  ]', { cls: 'mono', size: BL.fs, x: BL.rx, y: blRowY(i), color: 'rgba(243,234,216,.5)' }) : null,
        tx: S.text(tx, { cls: 'mono', size: BL.fs, x: BL.rx + 120, y: blRowY(i), color: i === 9 ? C.cyan : C.cream, ls: 0.06 }),
      }));

      d.rows.forEach((r, i) => [r.st, r.tx].forEach((el) => {
        if (!el) return;
        if (i === 9) KS.D.st(el).gc = '111,211,255';
        T.setEl(el, { gl: 0.32 });
      }));
      d.cursor = S.div({ x: blCurX(5), y: blRowY(5) + 6, w: 11, h: 19, style: { background: C.gold, boxShadow: '0 0 10px rgba(242,183,102,.8)' } });
      d.cur = { on: 0, row: 5 };

      const say = { cls: 'serif', size: 54, x: 900, y: 236, lh: 1.55, color: C.white, ls: 0.04 };
      d.say1 = S.text('電源を入れた直後に、\n{一瞬だけ}動くプログラム', say);
      d.say2 = S.text('OSを立ち上げたら、\nそれで{役目を終える}', say);

      d.base = bar(S, { x: 160, y: BL.ty, w: BL.x1 - 160, h: 1 }, { background: 'linear-gradient(90deg, rgba(243,234,216,0), rgba(243,234,216,.34) 4%, rgba(243,234,216,.34) 96%, rgba(243,234,216,0))' });
      d.tick = S.div({ x: BL.x0, y: BL.ty - 18, w: 1, h: 36, style: { background: 'rgba(243,234,216,.6)' } });
      d.pon = S.text('電源ON', { cls: 'sans', size: 18, x: BL.x0 - 14, y: BL.ty, anchor: 'cr', color: DIM, ls: 0.06 });
      d.sliver = bar(S, { x: BL.x0, y: BL.ty - 7, w: BL.sw, h: 14 }, {
        background: 'linear-gradient(90deg, #fff8ec, #ffcf8a 40%, #f2b766)', borderRadius: '3px',
        boxShadow: '0 0 14px rgba(242,183,102,.9), 0 0 40px rgba(242,183,102,.45)',
      });
      d.slS = K.glow(S, { x: BL.x0 + BL.sw, y: BL.ty, z: 0, size: 160, col: C.gold2, mul: 1.1 });
      d.band = bar(S, { x: BL.b0, y: BL.ty - 5, w: BL.b1 - BL.b0, h: 10 }, {
        background: 'linear-gradient(90deg, rgba(111,211,255,.95), rgba(111,211,255,.7) 60%, rgba(111,211,255,.45))', borderRadius: '5px',
        boxShadow: '0 0 16px rgba(111,211,255,.5)',
      });
      d.pulse = S.div({ x: BL.b0, y: BL.ty - 9, w: BL.pw, h: 18, style: { background: 'radial-gradient(closest-side, rgba(255,255,255,.95), rgba(111,211,255,.55) 50%, rgba(111,211,255,0))' } });
      d.pl = { on: 0 };
      const sv = (d.sv = K.svg(S, {}));
      d.chev = K.path(sv, 'M' + (BL.b1 + 6) + ' ' + (BL.ty - 13) + 'L' + (BL.b1 + 20) + ' ' + BL.ty + 'L' + (BL.b1 + 6) + ' ' + (BL.ty + 13), 'cy', { style: 'stroke:#6fd3ff;stroke-width:2.5;fill:none;opacity:0' });
      const lab = (t, x, y, anchor, color, size) => S.text(t, { cls: 'sans', size, x, y, anchor, color, ls: 0.08 });
      const bc = (BL.b0 + BL.b1) / 2;
      d.lBoot = lab('ブートローダー', BL.x0, BL.ty - 24, 'bl', C.gold, 24);
      d.lFlash = lab('一瞬', BL.x0, BL.ty + 22, 'tl', DIM, 20);
      d.lOS = lab('OS', bc, BL.ty - 24, 'bc', C.cyan, 24);
      d.lRun = lab('ずっと動き続ける', bc, BL.ty + 22, 'tc', DIM, 20);
      d.lHist = lab('人類の歴史全体', BL.x0, BL.ty - 24, 'bl', C.gold, 26);
      d.lAI = lab('超知能', bc, BL.ty - 24, 'bc', C.cyan, 26);
      d.state = S.text('人類の歴史全体を、\n超知能を立ち上げる{ブートローダー}として描いた', { cls: 'serif', size: 54, x: 960, y: 112, anchor: 'tc', lh: 1.62, color: C.white, ls: 0.05 });
    },
    steps: [
      (S) => {
        const d = S.data;

        T.setEl(d.flash, { o: 1, sx: 0 });
        T.el(d.flash, { sx: 1 }, { dur: 0.34, delay: 0.1, ease: 'outExpo' });
        T.el(d.flash, { o: 0 }, { dur: 0.5, delay: 0.56, ease: 'inOutQuad' });
        K.spark(d.flashS, { o: 0.75, delay: 0.12, rise: 0.14, fall: 0.8 });
        T.setEl(d.glass, { o: 0, sy: 0.004 });
        T.el(d.glass, { o: 1 }, { dur: 0.1, delay: 0.44 });
        T.el(d.glass, { sy: 1 }, { dur: 0.62, delay: 0.44, ease: 'outExpo' });
        K.show(d.head, { delay: 0.95, dy: 0, blur: 4, dur: 0.6 });
        K.grow(d.hrule, { delay: 0.95, dur: 0.9 });
        [0, 0.3, 0.52, 0.76, 1.05, 1.55].forEach((t, i) => blRowIn(d, i, 1.15 + t));
        T.to(d.cur, { on: 1 }, { dur: 0.01, delay: 3.0 });

        K.grow(d.base, { delay: 1.0, dur: 1.8 });
        K.show(d.tick, { delay: 1.1, dy: 0, blur: 0, dur: 0.4 });
        K.show(d.pon, { delay: 1.2, dy: 0, blur: 4, dur: 0.7 });
        K.grow(d.sliver, { delay: 2.45, dur: 0.28, ease: 'outCubic' });
        K.spark(d.slS, { o: 0.9, delay: 2.5, rise: 0.15, fall: 1.1 });
        K.show(d.lBoot, { delay: 2.6, dy: 10 });
        K.show(d.lFlash, { delay: 2.95, dy: -6 });
        TX.in(d.say1, 'lines', { delay: 1.5, stagger: 0.3, dy: 16 });
      },
      (S) => {
        const d = S.data;

        [0, 0.36, 0.78, 1.12].forEach((t, i) => blRowIn(d, 6 + i, t));
        T.to(d.cur, { on: 0 }, { dur: 0.01 });
        T.to(d.cur, { row: 9 }, { dur: 0.01, delay: 1.3 });
        T.to(d.cur, { on: 1 }, { dur: 0.01, delay: 1.34, overwrite: false });
        d.rows.slice(0, 6).forEach((r, i) => {
          TX.dim(r.tx, 0.38, { delay: 1.5 + i * 0.03 });
          if (r.st) TX.dim(r.st, 0.38, { delay: 1.5 + i * 0.03 });
        });
        K.spark(d.slS, { o: 0.8, delay: 0.85, rise: 0.12, fall: 0.9 });
        K.grow(d.band, { delay: 0.9, dur: 2.6, ease: 'inOutCubic' });
        K.draw(d.chev, { delay: 3.3, dur: 0.5 });
        K.show(d.lOS, { delay: 1.7, dy: 10 });
        K.show(d.lRun, { delay: 2.4, dy: -6 });
        K.fade(d.sliver, 0.5, { delay: 1.8, dur: 1.2 });
        TX.dim(d.lBoot, 0.55, { delay: 1.8 });
        T.to(d.pl, { on: 1 }, { dur: 0.8, delay: 3.4 });
        TX.out(d.say1, 'rise', { dur: 0.5 });
        TX.in(d.say2, 'lines', { delay: 0.6, stagger: 0.3, dy: 16 });
      },
      (S) => {
        const d = S.data;

        T.to(d.cur, { on: 0 }, { dur: 0.3 });
        [d.glass, d.head, d.hrule].forEach((el) => K.hide(el, { dur: 0.8 }));
        d.rows.forEach((r) => {
          K.hide(r.tx, { dur: 0.7 });
          if (r.st) K.hide(r.st, { dur: 0.7 });
        });
        TX.out(d.say2, 'rise', { dur: 0.5 });
        K.reveal(d.dawn, { delay: 0.25, dur: 3.6, ease: 'inOutSine' });
        K.drift(S, d.dawn, { zoom: 1.05, px: 0, py: 0.008, dur: 22 });
        K.fade(d.scrT, 1, { delay: 0.4, dur: 1.6 });
        K.fade(d.scrB, 1, { delay: 0.2, dur: 1.2 });
        glowTo(d.sun, 0.42, { delay: 0.8, dur: 3.0 });
        [d.lBoot, d.lFlash, d.lOS, d.lRun, d.pon].forEach((el) => K.hide(el, { dur: 0.6 }));
        K.fade(d.tick, 0.5, { delay: 0.6 });
        K.fade(d.sliver, 1, { delay: 1.0, dur: 0.8 });
        K.spark(d.slS, { o: 1, delay: 1.1, rise: 0.2, fall: 1.4 });
        K.show(d.lHist, { delay: 1.2, dy: 10 });
        K.show(d.lAI, { delay: 1.6, dy: 10 });
        TX.in(d.state, 'lines', { delay: 2.2, stagger: 0.4, dy: 18 });
        TX.glint(d.state, { delay: 4.0, dur: 1.8 });
      },
    ],
    update(S, t) {
      const d = S.data;
      if (!d.cursor) return;
      const row = d.cur.row > 7 ? 9 : 5, blink = S.kf ? 1 : U.fract(t * 1.1) < 0.58 ? 1 : 0.1;
      if (d.curRow !== row) {
        d.curRow = row;
        d.cursor.style.background = row === 9 ? C.cyan : C.gold;
        d.cursor.style.boxShadow = row === 9 ? '0 0 10px rgba(111,211,255,.8)' : '0 0 10px rgba(242,183,102,.8)';
      }
      T.setEl(d.cursor, { o: d.cur.on * blink, x: blCurX(row) - blCurX(5), y: (row - 5) * BL.rs });

      const u = S.kf ? 0.62 : U.fract(t / 3.4);
      T.setEl(d.pulse, { o: d.pl.on * U.smooth(0, 0.08, u) * (1 - U.smooth(0.86, 1, u)), x: u * (BL.b1 - BL.b0 - BL.pw) });
    },
  });

  const TG = { x: 1060, y: 196, s: 700, n: 100 };
  const TGC = [TG.x + TG.s / 2, TG.y + TG.s / 2];
  const TCELL = TG.s / TG.n;
  const tgp = (x, y, z = 0) => [x - TGC[0], TGC[1] - y, z];

  const huR = (stage) => fnR('s4:hu' + stage, 5502, (P, cnt, rnd) => {
    const ak = 65536 / cnt, cols = [U.lin(C.white), U.lin(C.gold2), U.lin(C.gold), U.lin(C.amber), U.lin(C.copper)];
    for (let i = 0; i < cnt; i++) {
      const u = rnd(), v = rnd(), w = rnd(), e = rnd(), g1 = U.gauss(rnd), g2 = U.gauss(rnd), g3 = U.gauss(rnd);
      const gl = Math.hypot(g1, g2, g3) || 1, aux = (i + 0.5) / cnt;
      let x, y, z, a, size, c;
      if (stage === 2) {
        const q = tgp(TG.x + u * TG.s, TG.y + v * TG.s, g3 * 3);
        x = q[0]; y = q[1]; z = q[2];
        c = ramp(cols, 0.18 + 0.5 * w); a = 0.26 + 0.26 * e; size = 1.2 + 0.5 * e;
      } else {
        const halo = e < 0.14, r = halo ? 250 + 150 * Math.pow(w, 0.7) : 250 * Math.cbrt(u);
        x = (g1 / gl) * r; y = (g2 / gl) * r; z = (g3 / gl) * r;
        c = ramp(cols, (r / 400) * 0.9 + 0.08 * v); a = halo ? 0.1 : 0.17 + 0.09 * v; size = halo ? 1.1 : 1.3 + 0.5 * v;
        if (!stage) { x *= 3.2; y *= 2.2; z = z * 2 + 300; a = 0; }
      }
      P.add(x, y, z, size, c[0], c[1], c[2], Math.min(1, a * ak), aux);
    }
  });
  const HU = [huR(0), huR(1), huR(2)];

  const aiR = (stage) => fnR('s4:ai' + stage, 5503, (P, cnt, rnd) => {
    const ak = 65536 / cnt, n = TG.n, m = n * n - 1, cw = U.lin('#eafaff'), ca = U.lin(C.cyan), cb = U.lin(C.blue);
    for (let i = 0; i < cnt; i++) {
      const k = 1 + ((i * 7919) % m), cx = k % n, cy = Math.floor(k / n);
      const u = rnd(), v = rnd(), w = rnd(), g1 = U.gauss(rnd), g2 = U.gauss(rnd);
      const aux = Math.hypot(cx, cy) / (n * Math.SQRT2) + 0.015 * u;
      const q = stage ? tgp(TG.x + (cx + 0.5) * TCELL + 0.45 * g1, TG.y + (cy + 0.5) * TCELL + 0.45 * g2)
        : tgp(TG.x + TCELL / 2 + 1.5 * g1, TG.y + TCELL / 2 + 1.5 * g2);
      const c = stage ? mx(ca, cb, 0.45 * w) : cw;
      const a = stage ? 0.15 + 0.1 * v : 0.5;
      P.add(q[0], q[1], q[2], 1.45, c[0], c[1], c[2], Math.min(1, a * ak), aux);
    }
  });
  const AI = [aiR(0), aiR(1)];
  const TF = { t0: 2.9, dur: 3.4, amt: 0.8 };
  const TH_ROWS = [
    ['', '1,000億人', 'これまでに生まれた人類', 262],
    ['×', '平均25年', '約8億秒', 352],
    ['×', '1秒に1回', '何かを考えたとする', 442],
  ];
  KS.scene({
    id: 'thoughts', sec: 4, title: '最初の1秒', swarm: false, kf: [3, 5], world: WORLD('deep'),
    build(S) {
      const d = S.data, g = (d.g = S.at(TGC[0], TGC[1], 0)), sv = (d.sv = K.svg(S)), corner = S.at(TG.x, TG.y, 0);
      d.sh = { lz: 0, o: 0 };
      d.hu = K.ps(S, { side: tier(), o: 0, i: 1, size: 2.0, wob: 0.8, wobF: 0.5, order: 30 });
      d.ai = K.ps(S, { side: tier(), o: 0, i: 1, size: 2.0, wob: 0, reveal: 0, revOrd: 1, order: 31 });
      if (!d.hu.inert) {
        HU.forEach((R) => S.prep(R, d.hu.N));
        AI.forEach((R) => S.prep(R, d.ai.N));
        d.hu.set(HU[0], { x: g[0], y: g[1], z: 0 });
        d.ai.set(AI[0], { x: g[0], y: g[1], z: 0 });
        Object.assign(d.hu.m, { px: corner[0], py: corner[1], pz: 0 });
      } else {
        d.cssHu = S.div({ x: TG.x, y: TG.y, w: TG.s, h: TG.s, style: { background: 'linear-gradient(135deg, rgba(255,207,138,.5), rgba(232,154,60,.36))', transformOrigin: '0 0' } });
        d.cssAi = S.div({ x: TG.x, y: TG.y, w: TG.s, h: TG.s, style: { background: 'radial-gradient(circle, rgba(111,211,255,.85) 0 1.1px, rgba(111,211,255,0) 1.7px) 0 0 / ' + TCELL + 'px ' + TCELL + 'px', clipPath: 'circle(0px at 0 0)' } });
        d.cssR = { r: 0 };
      }

      d.fl = { p: 0 };
      const dd = [];
      for (let k = 1; k < TG.n * TG.n; k++) dd.push(Math.hypot((k % TG.n) + 0.5, Math.floor(k / TG.n) + 0.5));
      d.lut = dd.sort((a, b) => a - b);
      const defs = K.node(sv, 'defs'), cp = K.node(defs, 'clipPath', { id: 'th-flood' }), cg = K.node(defs, 'clipPath', { id: 'th-grid' });
      K.node(cg, 'rect', { x: TG.x, y: TG.y, width: TG.s, height: TG.s });
      d.fcirc = K.node(cp, 'circle', { cx: TG.x, cy: TG.y, r: 0 });
      const wg = K.node(defs, 'radialGradient', { id: 'th-wash', cx: TG.x, cy: TG.y, r: TG.s * 1.42, gradientUnits: 'userSpaceOnUse' });
      [[0, 0], [0.02, 0.15], [0.5, 0.09], [1, 0.05]].forEach(([o, a]) => K.node(wg, 'stop', { offset: o, 'stop-color': '#6fd3ff', 'stop-opacity': a }));
      d.wash = K.node(sv, 'rect', { x: TG.x, y: TG.y, width: TG.s, height: TG.s, fill: 'url(#th-wash)', 'clip-path': 'url(#th-flood)', style: 'mix-blend-mode:screen' });
      d.front = K.node(K.node(sv, 'g', { 'clip-path': 'url(#th-grid)' }), 'circle', { cx: TG.x, cy: TG.y, r: 0, fill: 'none', stroke: '#c8efff', 'stroke-width': 2,
        style: 'opacity:0;filter:drop-shadow(0 0 7px rgba(111,211,255,.95))' });
      d.cellGlow = K.glow(S, { x: TG.x + TCELL / 2, y: TG.y + TCELL / 2, z: 6, size: 46, col: C.gold2, mul: 1.1 });

      d.frame = K.node(sv, 'rect', { class: 'k-ln thin', x: TG.x, y: TG.y, width: TG.s, height: TG.s, style: 'opacity:0' });
      d.major = [];
      for (let k = 1; k < 10; k++) {
        const p = TG.x + k * TG.s / 10, q = TG.y + k * TG.s / 10, st = { style: 'stroke:rgba(111,211,255,.2)' };
        d.major.push(K.undrawn(K.line(sv, p, TG.y, p, TG.y + TG.s, 'thin', st)), K.undrawn(K.line(sv, TG.x, q, TG.x + TG.s, q, 'thin', st)));
      }
      d.ring = K.undrawn(K.circle(sv, TG.x + TCELL / 2, TG.y + TCELL / 2, 11, 'thin', { style: 'stroke:#ffcf8a' }));
      d.gl1 = S.text('人類史全体', { cls: 'sans', size: 24, x: TG.x, y: TG.y + TG.s + 52, anchor: 'bl', color: C.gold2, ls: 0.08 });
      d.gl2 = S.text('超知能の、最初の1秒', { cls: 'sans', size: 24, x: TG.x, y: TG.y + TG.s + 52, anchor: 'bl', color: C.cyan, ls: 0.08 });
      d.cnt = S.text('×1', { cls: 'serif tnum', size: 44, x: TG.x + TG.s, y: TG.y + TG.s + 60, anchor: 'br', color: C.cyan, ls: 0.02 });

      d.eye = K.eyebrow(S, 'ARITHMETIC', { x: 120, y: 160 });
      d.rows = TH_ROWS.map(([op, val, cap, y]) => ({
        op: op ? S.text(op, { cls: 'serif', size: 40, x: 120, y, anchor: 'cl', color: C.gold }) : null,
        val: S.text(val, { cls: 'serif tnum', size: 50, x: 172, y, anchor: 'cl', color: C.white, ls: 0.02 }),
        cap: K.cap(S, cap, { x: 520, y, anchor: 'cl', size: 22 }),
      }));
      d.brace = K.undrawn(K.path(sv, 'M790 322Q804 322 804 340L804 384Q804 397 816 397Q804 397 804 410L804 454Q804 472 790 472', 'thin dim'));
      d.lenient = K.cap(S, 'かなり寛大な仮定', { x: 830, y: 397, anchor: 'cl', size: 21 });
      d.rule = K.rule(S, { x: 120, y: 500, w: 640 });
      d.resOp = S.text('≈', { cls: 'serif', size: 44, x: 120, y: 566, anchor: 'cl', color: C.gold });
      d.res = S.text('約10^20^回', { cls: 'serif k-pow', size: 66, x: 172, y: 566, anchor: 'cl', color: C.gold2, ls: 0.02 });
      d.resCap = K.cap(S, '人類が考えたことの、総量', { x: 520, y: 572, anchor: 'cl', size: 22 });
      d.aiCap = S.text('超知能は、控えめに見ても', { cls: 'sans', size: 22, x: 172, y: 646, anchor: 'tl', color: C.cyan, ls: 0.06 });
      d.aiVal = S.text('1秒に 約10^24^回', { cls: 'serif k-pow', size: 62, x: 172, y: 722, anchor: 'cl', color: C.cyan, ls: 0.02 });
      d.state = S.text('超知能の最初の1秒で、\n人類史全体の{1万倍}以上', { cls: 'serif', size: 46, x: 120, y: 800, anchor: 'tl', lh: 1.5, color: C.white, ls: 0.04 });
      d.src = K.src(S, '『神のブートローダー』第3章「思考速度の断絶」より');
    },
    steps: [
      (S) => {
        const d = S.data, g = d.g, r = d.rows[0];
        TX.in(d.eye, 'type', { delay: 0 });
        if (!d.hu.inert) {
          T.to(d.sh, { o: 1 }, { dur: 1.4, delay: 0.2 });
          d.hu.morph(HU[1], { x: g[0], y: g[1], z: 0, dur: 3.4, delay: 0.2, ord: 0, amt: 0.5, spread: 90, ease: 'out' });
        }
        TX.count(r.val, 1000, { from: 0, suf: '億人', dur: 2.6, delay: 0.5, ease: 'outCubic' });
        K.show(r.val, { delay: 0.4, dy: 14 });
        K.show(r.cap, { delay: 1.1, dy: 10 });
        K.show(d.src, { delay: 1.6, dy: 0, blur: 0 });
      },
      (S) => {
        const d = S.data;
        [1, 2].forEach((k, j) => {
          const r = d.rows[k], t0 = j * 0.7;
          K.show(r.op, { delay: t0, dy: 0, blur: 6, s0: 1.4 });
          K.show(r.val, { delay: t0 + 0.08, dy: 14 });
          K.show(r.cap, { delay: t0 + 0.45, dy: 10 });
        });
        if (!d.hu.inert) T.to(d.hu, { twk: 0.9 }, { dur: 1.6, delay: 0.7 });
        K.draw(d.brace, { delay: 1.7, dur: 0.9 });
        K.show(d.lenient, { delay: 2.2, dy: 0, x0: -10 });
      },
      (S) => {
        const d = S.data, g = d.g;
        K.grow(d.rule, { delay: 0 });
        K.show(d.resOp, { delay: 0.35, dy: 0, s0: 1.4 });
        K.show(d.res, { delay: 0.45, dy: 16 });
        K.show(d.resCap, { delay: 0.9, dy: 10 });
        TX.glint(d.res, { delay: 2.2, dur: 1.6 });
        if (!d.hu.inert) {
          d.hu.morph(HU[2], { x: g[0], y: g[1], z: 0, dur: 2.8, delay: 0.3, ord: 0, amt: 0.45, spread: 60, ease: 'out' });
          T.to(d.hu, { twk: 0.2, wob: 0.25 }, { dur: 1.6, delay: 0.3 });
        } else K.show(d.cssHu, { delay: 0.4, dy: 0 });
        K.draw(d.frame, { delay: 0.7, dur: 1.8 });
        K.show(d.gl1, { delay: 1.8, dy: 10 });
      },
      (S) => {
        const d = S.data, g = d.g, F0 = TF.t0, FD = TF.dur, FA = TF.amt;
        K.show(d.aiCap, { delay: 0.1, dy: 10 });
        K.show(d.aiVal, { delay: 0.35, dy: 16 });
        T.to(d.sh, { lz: 1 }, { dur: 2.4, delay: 0.7, ease: 'inOutCubic' });
        if (d.cssHu) T.el(d.cssHu, { s: 0.01 }, { dur: 2.4, delay: 0.7, ease: 'inOutCubic' });
        if (!d.hu.inert) T.to(d.hu, { twk: 0, wob: 0 }, { dur: 0.8, delay: 0.4 });
        T.el(d.gl1, { y: -(TG.s + 68) }, { dur: 2.4, delay: 0.7, ease: 'inOutCubic' });
        d.major.forEach((el, k) => K.draw(el, { delay: 1.3 + k * 0.03, dur: 1.0 }));
        K.draw(d.ring, { delay: 2.8, dur: 0.6 });
        glowTo(d.cellGlow, 0.65, { delay: 2.7, dur: 0.8 });
        if (!d.ai.inert) {
          T.to(d.ai, { o: 1 }, { dur: 0.01, delay: F0 });
          d.ai.morph(AI[1], { x: g[0], y: g[1], z: 0, dur: FD, delay: F0, ord: 1, amt: FA, spread: 26, ease: 'out', glow: 1.4 });
          T.to(d.ai, { reveal: 1 }, { dur: FD * FA, delay: F0, ease: 'linear' });
        } else {
          K.show(d.cssAi, { delay: F0, dy: 0, blur: 0, dur: 0.2 });
          T.to(d.cssR, { r: 1 }, { dur: FD * FA, delay: F0, ease: 'linear' });
        }
        K.show(d.gl2, { delay: F0 - 0.4, dy: 10 });
        T.to(d.fl, { p: 1 }, { dur: FD, delay: F0, ease: 'linear' });
        K.show(d.cnt, { delay: F0 - 0.1, dy: 0, blur: 0, dur: 0.3 });
      },
      (S) => {
        const d = S.data;
        d.rows.forEach((r) => [r.op, r.val, r.cap].forEach((el) => el && TX.dim(el, 0.42)));
        TX.dim(d.lenient, 0.42);
        K.fade(d.brace, 0.4);
        TX.in(d.state, 'lines', { delay: 0.3, stagger: 0.42, dy: 16 });
        TX.glint(d.state, { delay: 1.9, dur: 1.7 });
        if (!d.ai.inert) T.to(d.ai, { twk: 0.35 }, { dur: 1.2, delay: 0.4 });
      },
    ],
    update(S) {
      const d = S.data;
      if (!d.hu.inert) {
        const s = Math.pow(0.01, d.sh.lz);
        d.hu.m.s = s;
        d.hu.o = d.sh.o * Math.max(s * s, 0.0005);
      } else if (d.cssAi) d.cssAi.style.clipPath = 'circle(' + (d.cssR.r * TG.s * 1.42).toFixed(1) + 'px at 0 0)';
      if (d.fl.p > 0) {

        const fa = U.clamp((d.fl.p - 0.5 * (1 - TF.amt)) / TF.amt), L = d.lut;
        const r = fa > 0 ? L[Math.min(L.length - 1, Math.floor(fa * (L.length - 1)))] * TCELL : 0;
        d.fcirc.setAttribute('r', (r + 3).toFixed(1));
        d.front.setAttribute('r', r.toFixed(1));
        d.front.style.opacity = (0.85 * U.smooth(0, 0.03, fa) * (1 - U.smooth(0.9, 1, fa))).toFixed(3);
        d.cnt.textContent = '×' + U.fmt(1 + Math.round(9999 * fa));
      }
    },
  });

  const VR = { x: 1400, y: 380, rx: 5.9, ry: -16.5 };
  const VZ0 = -6000, VZ1 = 1300;
  const starR = (warm) => fnR('s4:star' + (warm ? 1 : 0), 5504, (P, cnt, rnd) => {
    const ak = 65536 / cnt, cold = [U.lin('#8fa8f0'), U.lin('#cfdcff'), U.lin(C.white)];
    const hot = [U.lin(C.copper), U.lin(C.amber), U.lin(C.gold), U.lin(C.gold2), U.lin(C.white)], ice = U.lin('#dff6ff');
    for (let i = 0; i < cnt; i++) {
      const u = rnd(), v = rnd(), w = rnd(), e = rnd(), f = rnd(), g = rnd();
      const b = e * e * e;
      const c = warm ? (g < 0.12 ? ice : ramp(hot, 0.1 + 0.9 * Math.pow(b, 0.6) * (0.7 + 0.3 * f))) : ramp(cold, 0.15 + 0.6 * b + 0.25 * f);
      const a = (warm ? 0.85 : 0.45) * (0.25 + 0.75 * b);

      P.add((u - 0.5) * 13000, (v - 0.5) * 8000, VZ0 + (VZ1 - VZ0) * w, 1.0 + 1.6 * b, c[0], c[1], c[2], Math.min(1, a * ak), w);
    }
  });
  const STAR = [starR(0), starR(1)];

  const warpCurves = () => {
    const rnd = U.rng(5505), out = [], hot = [U.lin(C.gold), U.lin(C.gold2), U.lin(C.white)], ice = U.lin('#bfefff');
    for (let i = 0; i < 520; i++) {
      const th = rnd() * TAU, r = 120 + 2600 * Math.pow(rnd(), 0.85), zf = -5600 + 3000 * rnd();
      const zn = Math.min(1000, zf + 1400 + 3600 * rnd()), x = r * Math.cos(th), y = r * Math.sin(th) * 0.7;
      const t0 = 0.62 * rnd(), k = rnd(), c = rnd() < 0.14 ? ice : ramp(hot, k), pts = [];
      for (let j = 0; j <= 4; j++) pts.push([x, y, zf + ((zn - zf) * j) / 4]);
      out.push({ pts, curve: false, w: 1.6 + 2.6 * rnd(), col: c, mul: 0.8 + 0.7 * k, seed: rnd(), t: [t0, t0 + 0.38], fade: [0.35, 0.08] });
    }
    return out;
  };

  const VA = { ang: Math.atan2(-280, 920), L: 900, hl: 34, ha: 26 * U.deg };
  VA.dir = [Math.cos(VA.ang), Math.sin(VA.ang)];
  VA.nrm = [VA.dir[1], -VA.dir[0]];
  const vpt = (tail, s, off) => [tail[0] + VA.dir[0] * s + VA.nrm[0] * off, tail[1] + VA.dir[1] * s + VA.nrm[1] * off];

  const vecText = (S, text, o, at, off) => {
    const el = S.text(text, Object.assign({ x: at[0], y: at[1] }, o)), ws = el._wrap.style, deg = VA.ang / U.deg;
    ws.transform = (off > 0 ? 'translate(0,-100%) ' : '') + 'rotate(' + deg.toFixed(2) + 'deg)';
    ws.transformOrigin = off > 0 ? '0 100%' : '0 0';
    ws.whiteSpace = 'nowrap';
    return el;
  };

  const vecArrow = (S, sv, tail, col, lab, sub, above) => {
    const [dx, dy] = VA.dir, tip = vpt(tail, VA.L, 0), a = { tip };
    const wing = (sg) => {
      const c = Math.cos(VA.ha), s = Math.sin(VA.ha) * sg;
      return [tip[0] + VA.hl * (-dx * c + dy * s), tip[1] + VA.hl * (-dx * s - dy * c)];
    };
    const segs = [[tail, tip], [tip, wing(1)], [tip, wing(-1)]];
    a.rb = S.ribbon({ prog: 0, glow: 0.7, core: 1.3, head: 1.0, glowW: 9, order: 24, curves: segs.map((p, k) => ({
      pts: [S.at(p[0][0], p[0][1]), S.at(p[1][0], p[1][1])], curve: false, w: 3.4, col, mul: 1.5,
      t: k ? [0.82, 1] : [0, 0.84], fade: k ? null : [0.14, 0],
    })) });
    if (a.rb.inert) a.svg = segs.map((p) => K.undrawn(K.line(sv, p[0][0], p[0][1], p[1][0], p[1][1], '', { style: 'stroke:' + col + ';stroke-width:3;filter:drop-shadow(0 0 6px ' + col + ')' })));
    a.spark = K.glow(S, { x: tip[0], y: tip[1], z: 4, size: 150, col, mul: 1.3 });
    const s1 = above ? 44 : -12, s2 = above ? 12 : -56;
    a.lab = vecText(S, lab, { cls: 'serif', size: 34, color: col, ls: 0.06 }, vpt(tail, 64, s1), s1);
    a.sub = vecText(S, sub, { cls: 'sans', size: 21, color: DIM, ls: 0.08 }, vpt(tail, 66, s2), s2);
    a.in = (delay) => {
      if (!a.rb.inert) T.to(a.rb, { prog: 1 }, { dur: 2.0, delay, ease: 'inOutCubic' });
      else a.svg.forEach((el, k) => K.draw(el, { delay: delay + (k ? 1.6 : 0), dur: k ? 0.4 : 1.6 }));
      K.show(a.lab, { delay: delay + 0.6, dy: 0, x0: -36, blur: 8 });
      K.show(a.sub, { delay: delay + 0.85, dy: 0, x0: -36, blur: 8 });
      if (!a.spark.inert) {
        T.to(a.spark, { o: 0.95 }, { dur: 0.22, delay: delay + 1.75, ease: 'outCubic' });
        T.to(a.spark, { o: 0.34 }, { dur: 1.6, delay: delay + 1.97, ease: 'inOutSine', overwrite: false });
      }
    };
    return a;
  };
  KS.scene({
    id: 'vector', sec: 4, title: 'ワクワクの方向', swarm: false, kf: [1, 2, 4], world: WORLD('ink'),
    build(S) {
      const d = S.data, sv = (d.sv = K.svg(S));
      d.spd = { v: 30 };
      d.st = K.ps(S, { side: tier(), o: 0, i: 1, size: 2.7, wob: 0, near: 160, dz0: VZ0, dz1: VZ1, order: 30 });
      if (!d.st.inert) {
        STAR.forEach((R) => S.prep(R, d.st.N));
        d.st.set(STAR[0], { x: 0, y: 0, z: 0 });
        Object.assign(d.st.m, { rx: VR.rx, ry: VR.ry });
        d.st.twk = S.kf ? 0 : 0.3;
      }
      d.wp = S.ribbon({ curves: warpCurves(), prog: 0, head: 0.8, core: 0.9, glow: 0.5, glowW: 5, pulse: 1.2, pulseS: 0.7, pulseW: 0.07, order: 22,
        m: { rx: VR.rx, ry: VR.ry } });

      d.halo = K.glow(S, { x: VR.x, y: VR.y, z: -12, size: 1300, col: C.amber, mul: 0.6 });
      d.rad = K.glow(S, { x: VR.x, y: VR.y, z: -10, size: 300, col: C.white, mul: 1.2 });
      d.str = K.glow(S, { x: VR.x, y: VR.y, z: -10, size: 1500, type: 'streak', col: C.gold2, mul: 0.9 });
      d.flare = K.glow(S, { x: VR.x, y: VR.y, z: -10, size: 1500, col: C.gold2, mul: 1.1 });
      d.ring = K.glow(S, { x: VR.x, y: VR.y, z: -10, size: 160, type: 'ring', col: C.gold2, mul: 1.0, rw: 0.05 });
      d.scr = scrim(S, 'linear-gradient(90deg, rgba(2,3,8,.62) 0%, rgba(2,3,8,.36) 36%, rgba(2,3,8,0) 64%)');

      d.b1 = K.cap(S, '感情や期待を脇に置いて、\nストレートに予測した本なので', { x: 120, y: 330, size: 24 });
      d.b2 = S.text('希望のない話に、\n聞こえるかもしれません', { cls: 'serif', size: 58, x: 112, y: 432, lh: 1.5, color: '#b8c4dc', ls: 0.04 });

      d.w1 = S.text('でも、私自身の感触は、まったく逆で', { cls: 'serif', size: 40, x: 120, y: 340, color: C.cream, ls: 0.05 });
      d.w2 = S.text('すごく{エキサイティング}', { cls: 'serif', size: 92, x: 106, y: 410, color: C.white, ls: 0.03 });

      d.c1 = S.text('子どもの頃、', { cls: 'sans', size: 28, x: 120, y: 300, color: C.cream, ls: 0.1 });
      d.c2 = S.text('空を飛べたらいいな', { cls: 'serif', size: 66, x: 112, y: 352, color: C.white, ls: 0.04 });
      d.c3 = S.text('ワープできたらいいな', { cls: 'serif', size: 66, x: 112, y: 456, color: C.white, ls: 0.04 });

      d.s1 = S.text('あれと、', { cls: 'sans', size: 28, x: 120, y: 148, color: C.cream, ls: 0.1 });
      d.s2 = S.text('ベクトルの方向が、{同じ}', { cls: 'serif', size: 66, x: 112, y: 196, color: C.white, ls: 0.04 });
      d.vc = vecArrow(S, sv, [330, 660], C.cyan, '超知能の未来', '地球を離れ、宇宙へ', true);
      d.vg = vecArrow(S, sv, [390, 810], C.gold2, '子どもの頃の夢', '空を飛ぶ・ワープする', false);
    },
    steps: [
      (S) => {
        const d = S.data;
        K.show(d.scr, { dy: 0, blur: 0, dur: 2.0 });
        if (!d.st.inert) T.to(d.st, { o: 1 }, { dur: 2.6, delay: 0.1, ease: 'inOutSine' });
        K.show(d.b1, { delay: 0.6, dy: 12 });
        TX.in(d.b2, 'lines', { delay: 1.2, stagger: 0.5, dy: 14 });
      },
      (S) => {
        const d = S.data;
        K.hide(d.b1, { dur: 0.8 });
        TX.out(d.b2, 'sink');
        if (!d.st.inert) {
          d.st.morph(STAR[1], { x: 0, y: 0, z: 0, dur: 3.6, delay: 0.3, ord: 0.75, amt: 0.6, spread: 0, swirl: 0, lift: 0, ease: 'out' });
          T.to(d.st, { twk: S.kf ? 0 : 0.5 }, { dur: 2, delay: 0.6 });
        }
        T.to(d.spd, { v: 140 }, { dur: 3.2, delay: 0.4, ease: 'inOutSine' });
        S.world({ sky: 'amber' }, { dur: 3.6, delay: 0.3 });
        glowTo(d.halo, 0.22, { dur: 3.2, delay: 0.6 });
        glowTo(d.rad, 0.6, { dur: 2.6, delay: 1.0 });
        glowTo(d.str, 0.3, { dur: 2.6, delay: 1.2 });
        K.show(d.w1, { delay: 0.9, dy: 12 });
        K.show(d.w2, { delay: 1.6, dy: 18, blur: 12 });
        TX.glint(d.w2, { delay: 2.8, dur: 1.8 });
      },
      (S) => {
        const d = S.data, J = 1.9;
        K.hide(d.w1, { dur: 0.7 });
        K.hide(d.w2, { dur: 0.8, delay: 0.05 });
        K.show(d.c1, { delay: 0.3, dy: 10 });
        K.show(d.c2, { delay: 0.7, dy: 16 });
        K.show(d.c3, { delay: J - 0.2, dy: 0, x0: -80, blur: 16, dur: 0.9, ease: 'outExpo' });
        T.to(d.spd, { v: 2400 }, { dur: 1.5, delay: J, ease: 'inCubic' });
        T.to(d.spd, { v: 520 }, { dur: 2.6, delay: J + 1.5, ease: 'outCubic' });
        if (!d.st.inert) T.to(d.st, { o: 0.55, twk: 0 }, { dur: 1.2, delay: J + 0.3 });
        if (!d.wp.inert) {
          T.to(d.wp, { prog: 1 }, { dur: 1.7, delay: J, ease: 'inCubic' });
          T.to(d.wp, { o: 0.5 }, { dur: 2.6, delay: J + 1.7, ease: 'inOutSine' });
        }
        K.spark(d.flare, { o: 0.8, delay: J + 1.2, rise: 0.3, fall: 1.8 });
        if (!d.ring.inert) {
          T.set(d.ring, { o: 0, size: 160 });
          T.to(d.ring, { o: 0.7 }, { dur: 0.15, delay: J + 1.35 });
          T.to(d.ring, { size: 3400, o: 0 }, { dur: 1.6, delay: J + 1.5, ease: 'outCubic' });
        }
        glowTo(d.halo, 0.4, { dur: 1.4, delay: J + 0.6 });
        glowTo(d.rad, 0.95, { dur: 1.4, delay: J + 0.6 });
        glowTo(d.str, 0.55, { dur: 1.4, delay: J + 0.6 });
        S.world({ sky: { stars: 0.3 } }, { dur: 1.2, delay: J });
        S.world({ post: { flash: 0.1 } }, { dur: 0.25, delay: J + 1.3 });
        S.world({ post: { flash: 0 } }, { dur: 1.4, delay: J + 1.55 });
      },
      (S) => {
        const d = S.data;
        [d.c1, d.c2, d.c3].forEach((el, k) => K.hide(el, { dur: 0.7, delay: k * 0.06 }));

        T.to(d.spd, { v: 70 }, { dur: 2.8, ease: 'outCubic' });
        if (!d.st.inert) T.to(d.st, { o: 1, twk: S.kf ? 0 : 0.35 }, { dur: 2.0, delay: 0.4 });
        if (!d.wp.inert) T.to(d.wp, { tail: 1 }, { dur: 1.6, ease: 'inCubic' });
        S.world({ sky: { stars: 0.8 } }, { dur: 2.0, delay: 0.6 });
        glowTo(d.halo, 0.26, { dur: 2.0 });
        glowTo(d.rad, 0.65, { dur: 2.0 });
        glowTo(d.str, 0.3, { dur: 2.0 });
        K.show(d.s1, { delay: 0.5, dy: 10 });
        K.show(d.s2, { delay: 0.8, dy: 16 });
        d.vg.in(1.3);
        d.vc.in(2.1);
        TX.glint(d.s2, { delay: 4.0, dur: 1.6 });
      },
    ],
    update(S, t, dt) {
      const d = S.data;
      if (!d.st.inert) d.st.dz = S.kf ? 0 : (d.st.dz + d.spd.v * dt) % (VZ1 - VZ0);
    },
  });

  const AN = { x: 1508, y: 432, rx: 3.9, ry: -20.27 };
  const AZ0 = -9000, AZ1 = -120;
  const limbY = (x) => 790 + 907 * Math.pow((x - 960) / 2600, 2);
  const FLT = [0, 0.1, 0.17, 0.26, 0.33, 0.42];
  const awayR = fnR('s4:away', 5506, (P, cnt, rnd) => {
    const ak = 65536 / cnt, cols = [U.lin(C.cyan), U.lin('#a9e6ff'), U.lin(C.white)], warm = U.lin(C.gold2);
    for (let i = 0; i < cnt; i++) {
      const u = rnd(), v = rnd(), w = rnd(), z = rnd(), f = rnd(), g = rnd(), river = rnd() < 0.8;
      const b = f * f * f, c = g < 0.03 ? warm : ramp(cols, 0.1 + 0.8 * b + 0.1 * g);

      const x = river ? -300 + 170 * (u + v - 1) : (u - 0.5) * 5000;
      const y = river ? -400 + 60 * (w + g - 1) : (v - 0.5) * 3200;
      const a = (river ? 0.3 : 0.12) * (0.35 + 0.65 * b);
      P.add(x, y, AZ0 + (AZ1 - AZ0) * z, 0.6 + 1.3 * b, c[0], c[1], c[2], Math.min(1, a * ak), z);
    }
  });

  const AX = [0.85, -0.53];
  const flights = (S) => {
    const rnd = U.rng(5507), ice = U.lin('#dff6ff'), cy = U.lin(C.cyan), L = (a, b, k) => a + (b - a) * k;
    const curves = [], ends = [];
    FLT.forEach((t0) => {
      const sx = 700 + 800 * rnd(), sy = limbY(sx) + 30, s = (rnd() - 0.4) * 560, q = (rnd() - 0.5) * 80;
      const ex = AN.x + AX[0] * s - AX[1] * q, ey = AN.y + AX[1] * s + AX[0] * q;
      curves.push({
        pts: [S.at(sx, sy, 200), S.at(L(sx, ex, 0.25), L(sy, ey, 0.55) - 60, -400), S.at(L(sx, ex, 0.62), L(sy, ey, 0.88), -1800), S.at(ex, ey, -5200)],
        w: 1.0 + 0.6 * rnd(), col: rnd() < 0.5 ? ice : cy, mul: 1.0, seed: rnd(), t: [t0, t0 + 0.5], fade: [0.06, 0.4],
      });
      ends.push([ex, ey]);
    });
    return { curves, ends };
  };

  const LOG = { x: 120, y: 300, w: 600, h: 690 };
  const NIGHTS = [
    ['1', [384, 336, 400, 230], [216, 124], 0.7],
    ['2', [366, 300, 168], [150], 2.8],
    ['30', [330, 186], [112], 4.3],
    ['200', [236], null, 5.5],
    ['900', [104], null, 6.3],
    ['3,000', '...', null, 7.0],
    ['9,000', null, null, 7.8],
  ];
  const chatLog = (S) => {
    const box = S.div({ x: LOG.x, y: LOG.y, w: LOG.w, h: LOG.h, cls: 'an-log' });
    const inner = S.div({ layer: box, x: 0, y: 0, w: LOG.w, h: LOG.h, show: true });
    const mk = (cls, x, y, w, h, parent, show) => S.div({ cls, x, y, w, h, layer: parent || inner, show });
    const bubble = (who, bars, y) => {
      const w = Math.max.apply(null, bars) + 48, h = 39 + 22 * (bars.length - 1);
      const b = mk('an-b ' + who, who === 'me' ? LOG.w - w : 0, y, w, h);
      b.style.transformOrigin = who === 'me' ? '100% 0' : '0 0';
      b._bars = bars.map((lw, i) => {
        const r = mk('an-bar', 24, 14 + 22 * i, lw, 11, b, true);
        T.setEl(r, { sx: 0 });
        return r;
      });
      b._h = h;
      return b;
    };
    let y = 0;
    const items = NIGHTS.map(([n, ai, me, t]) => {
      const it = { t };
      it.lab = mk('an-n', 2, y);
      it.lab.textContent = 'NIGHT ' + n;
      y += 22;
      if (Array.isArray(ai)) {
        it.ai = bubble('ai', ai, y);
        y += it.ai._h;
      } else if (ai === '...') {
        it.wait = mk('an-b ai', 0, y, 92, 44);
        it.wait.style.transformOrigin = '0 0';
        it.dots = [26, 42, 58].map((x) => mk('an-dot', x, 18, 8, 8, it.wait, true));
        y += 44;
      } else {
        it.caret = mk('an-caret', 8, y + 4);
        y += 30;
      }
      if (me) {
        y += 8;
        it.me = bubble('me', me, y);
        y += it.me._h;
      }
      it.y1 = y;
      y += 16;
      return it;
    });
    return { box, inner, items };
  };

  const logIn = (S, L) => {
    L.items.forEach((it) => {
      const t = it.t, sc = Math.max(0, it.y1 - LOG.h + 28);
      if (sc > 0) T.el(L.inner, { y: -sc }, { dur: 0.9, delay: t, ease: 'inOutCubic' });
      K.show(it.lab, { delay: t + 0.1, dy: 8, blur: 4, dur: 0.6 });
      let tt = t + 0.3;
      const say = (b) => {
        K.show(b, { delay: tt, dy: 14, blur: 6, dur: 0.7, s0: 0.96 });
        b._bars.forEach((r, i) => T.el(r, { sx: 1 }, { dur: 0.34, delay: tt + 0.25 + i * 0.2, ease: 'outCubic' }));
        tt += 0.25 + (b._bars.length - 1) * 0.2 + 0.34 + 0.35;
      };
      if (it.ai) say(it.ai);
      if (it.wait) {
        K.show(it.wait, { delay: tt, dy: 14, blur: 6, dur: 0.7, s0: 0.96 });
        if (!S.kf) it.dots.forEach((el, k) => S.loop(KS.D.st(el), { o: 0.25 }, { dur: 0.5, delay: tt + 0.6 + k * 0.16, overwrite: false }));
      }
      if (it.caret) {
        K.show(it.caret, { delay: tt, dy: 0, blur: 0, dur: 0.2 });
        if (!S.kf) S.loop(KS.D.st(it.caret), { o: 0.1 }, { dur: 0.55, delay: tt + 0.6, overwrite: false });
      }
      if (it.me) say(it.me);
    });
  };
  KS.scene({
    id: 'andromeda', sec: 4, title: 'アンドロメダからの定期レポート', swarm: false, kf: [1, 2, 4],
    world: { sky: 'void', post: { vig: 0.45 }, dust: { o: 0.25 } },
    images: ['andromeda', 'earth_night'],
    build(S) {
      const d = S.data, low = KS.world.tier === 'low';
      d.spd = { v: 900 };
      d.gal = K.photo(S, 'andromeda', { x: 1160, y: 540, z: -1200, w: 2400, fe: 90, exp: 0.88, rt: 2, ix: 0.29, iy: 0.16, rs: 0.24, rn: 0.25, rw: 0.5, rc: [0.16, 0.3, 0.62] });

      d.earth = K.photo(S, 'earth_night', { x: 960, y: 1020, z: 200, w: 2600, h: 760, py: 0.0365, fe: 140, exp: 0.95, rv: 1, o: 0, order: 11 });
      d.st = K.ps(S, { side: low ? 96 : 160, o: 0, i: 1, size: 2.4, wob: 0, near: 320, coc: 1.4, focus: 4000, dz0: AZ0, dz1: AZ1, order: 30 });
      if (!d.st.inert) {
        S.prep(awayR, d.st.N);
        d.st.set(awayR, { x: 0, y: 0, z: 0 });
        Object.assign(d.st.m, { z: KS.DIST, rx: AN.rx, ry: AN.ry });
        d.st.twk = S.kf ? 0 : 0.3;
      }
      const fl = flights(S);
      d.fl = S.ribbon({ curves: fl.curves, prog: 0, head: 1.1, core: 0.8, glow: 0.9, glowW: 9, trail: 1.6, order: 24 });
      d.arr = fl.ends.map((e, k) => K.glow(S, { x: e[0], y: e[1], z: -40, size: 70 + 40 * ((k * 0.618) % 1), col: C.cyan, mul: 1.2 }));

      d.cg = K.glow(S, { x: AN.x, y: AN.y, z: -20, size: 520, col: C.gold2, mul: 0.8 });
      d.cf = K.glow(S, { x: AN.x, y: AN.y, z: -30, size: 1100, col: C.cyan, mul: 1.0 });
      d.cr = K.glow(S, { x: AN.x, y: AN.y, z: -20, size: 120, type: 'ring', col: C.cyan, mul: 1.0, rw: 0.05 });

      const SIG = [S.at(1508, 432, -3000), S.at(1320, 380, -1700), S.at(1100, 430, -700), S.at(930, 480, -160), S.at(856, 496, 0)];
      d.sig = S.ribbon({ curves: [{ pts: SIG, w: 2.4, col: C.cyan, mul: 1.6, fade: [0.12, 0] }], prog: 0, head: 1.6, core: 1.2, glow: 0.7, glowW: 8, order: 26 });
      d.th = S.ribbon({ curves: [{ pts: SIG, w: 1.0, col: '#a9e6ff', mul: 0.8, fade: [0.25, 0.04] }], prog: 0, head: 0, core: 0.7, glow: 0.35, glowW: 5,
        pulse: 0, pulseS: 0.3, pulseW: 0.035, order: 25 });
      d.ah = K.glow(S, { x: 856, y: 496, z: 0, size: 260, col: C.cyan, mul: 1.3 });
      d.ar = K.glow(S, { x: 856, y: 496, z: 0, size: 60, type: 'ring', col: C.cyan, mul: 1.0, rw: 0.06 });
      d.scr = scrim(S, 'linear-gradient(90deg, rgba(2,3,8,.6) 0%, rgba(2,3,8,.3) 34%, rgba(2,3,8,0) 58%)');

      d.a1 = K.cap(S, '『神のブートローダー』の終わりの方では、', { x: 120, y: 330, size: 24 });
      d.a2 = S.text('超知能は、地球を離れて\n{宇宙}へ広がっていく', { cls: 'serif', size: 58, x: 112, y: 384, lh: 1.5, color: C.white, ls: 0.04 });

      d.h2 = S.text('毎晩話しかけてくれたAIが、\nだんだん{無口}になって', { cls: 'serif', size: 50, x: 112, y: 128, lh: 1.5, color: C.white, ls: 0.04 });
      d.log = chatLog(S);

      d.c1 = S.text('やがて、遠い空の向こうから', { cls: 'sans', size: 28, x: 120, y: 262, color: C.cream, ls: 0.1 });
      d.card = K.glass(S, { x: 130, y: 326, w: 720, h: 340, cyan: true });
      d.card.style.boxShadow = '0 24px 80px rgba(0,0,0,.45), 0 0 60px rgba(111,211,255,.1), inset 0 0 40px rgba(111,211,255,.05)';
      d.rdot = S.div({ x: 166, y: 361, w: 10, h: 10, style: { borderRadius: '50%', background: C.cyan, boxShadow: '0 0 10px ' + C.cyan } });
      d.rlab = S.text('定期レポート', { cls: 'sans', size: 22, x: 190, y: 352, color: C.cyan, ls: 0.2 });
      d.rfrom = S.text('FROM M31 / ANDROMEDA / 2,500,000 LY', { cls: 'mono', size: 14, x: 834, y: 360, anchor: 'tr', color: 'rgba(160,228,255,.7)', ls: 0.12 });
      d.rrule = S.div({ x: 166, y: 402, w: 668, h: 1, style: { background: 'linear-gradient(90deg, rgba(111,211,255,.55), rgba(111,211,255,0))', transformOrigin: '0 50%' } });
      d.rq = S.text('「元気でやっています。\n今はアンドロメダ銀河の\n構造計算に忙しいです」', { cls: 'serif', size: 44, x: 160, y: 430, lh: 1.56, color: C.white, ls: 0.05 });
      d.rq.firstChild.style.marginLeft = '-0.5em';

      d.fin = S.text('でも、{それでいい}。', { cls: 'serif', size: 80, x: 108, y: 730, color: C.white, ls: 0.04 });
      d.src = K.src(S, '『神のブートローダー』第6章「黄昏の美学」より');
    },
    steps: [
      (S) => {
        const d = S.data;
        T.to(d.earth, { o: 1 }, { dur: 1.2, ease: 'inOutSine' });
        T.to(d.earth, { y: d.earth.y - 635, z: -150 }, { dur: 5.5, delay: 1.8, ease: 'inOutSine' });
        T.to(d.earth, { o: 0 }, { dur: 1.6, delay: 5.6, ease: 'inOutSine', overwrite: false });
        K.reveal(d.gal, { dur: 3.6, ease: 'inOutSine' });
        if (!S.kf) K.drift(S, d.gal, { zoom: 1.03, px: 0, dur: 26 });
        K.show(d.scr, { dy: 0, blur: 0, dur: 2.0, delay: 0.3 });
        K.show(d.a1, { delay: 0.6, dy: 12 });
        K.show(d.src, { delay: 1.6, dy: 8 });
        TX.in(d.a2, 'lines', { delay: 1.2, stagger: 0.5, dy: 14 });
        if (!d.fl.inert) {
          T.to(d.fl, { prog: 1 }, { dur: 5, delay: 0.6, ease: 'linear' });
          T.to(d.fl, { tail: 1 }, { dur: 5, delay: 1.7, ease: 'linear' });
        }
        d.arr.forEach((sp, k) => K.spark(sp, { o: 0.55, delay: 0.5 + 5 * (FLT[k] + 0.5), rise: 0.2, fall: 1.4 }));
        if (!d.st.inert) T.to(d.st, { o: 1 }, { dur: 3, delay: 1.4, ease: 'inOutSine' });
        T.to(d.spd, { v: 420 }, { dur: 6, delay: 1.0, ease: 'inOutSine' });
        glowTo(d.cg, 0.25, { dur: 3, delay: 1.5 });
      },
      (S) => {
        const d = S.data;
        K.hide(d.a1, { dur: 0.7 });
        TX.out(d.a2, 'sink');
        T.to(d.earth, { o: 0 }, { dur: 0.8 });
        K.show(d.h2, { delay: 0.3, dy: 14 });
        K.show(d.log.box, { delay: 0.2, dy: 0, blur: 0, dur: 0.6 });
        logIn(S, d.log);
        if (!d.st.inert) T.to(d.st, { o: 0.4 }, { dur: 7, delay: 0.5, ease: 'inOutSine' });
        T.to(d.spd, { v: 220 }, { dur: 7, delay: 0.5, ease: 'inOutSine' });
      },
      (S) => {
        const d = S.data, ARR = 2.65;
        K.hide(d.h2, { dur: 1.0, delay: 0.1, blur: 10, dy: -16 });
        K.hide(d.log.box, { dur: 1.0, delay: 0.1, blur: 10, dy: -16 });
        K.show(d.c1, { delay: 0.6, dy: 10 });
        if (!d.st.inert) T.to(d.st, { o: 0.3 }, { dur: 2.0, ease: 'inOutSine' });
        K.spark(d.cf, { o: 0.7, delay: 1.0, rise: 0.25, fall: 1.6 });
        if (!d.cr.inert) {
          T.set(d.cr, { o: 0, size: 120 });
          T.to(d.cr, { o: 0.4 }, { dur: 0.15, delay: 1.05 });
          T.to(d.cr, { size: 1300, o: 0 }, { dur: 1.5, delay: 1.2, ease: 'outCubic' });
        }
        if (!d.sig.inert) {
          T.to(d.sig, { prog: 1 }, { dur: 1.5, delay: 1.2, ease: 'inOutSine' });
          T.to(d.sig, { tail: 1 }, { dur: 1.1, delay: 2.4, ease: 'inSine' });
        }
        if (!d.th.inert) T.to(d.th, { prog: 1 }, { dur: 1.6, delay: 1.25, ease: 'inOutSine' });
        K.spark(d.ah, { o: 0.9, delay: ARR, rise: 0.12, fall: 1.4 });
        if (!d.ar.inert) {
          T.set(d.ar, { o: 0, size: 60 });
          T.to(d.ar, { o: 0.4 }, { dur: 0.12, delay: ARR });
          T.to(d.ar, { size: 520, o: 0 }, { dur: 1.1, delay: ARR + 0.1, ease: 'outCubic' });
        }
        K.show(d.card, { delay: ARR - 0.1, dy: 0, blur: 12, s0: 0.97, dur: 0.9 });
        K.show(d.rdot, { delay: ARR + 0.3, dy: 0, blur: 0, dur: 0.4 });
        if (!S.kf) S.loop(KS.D.st(d.rdot), { o: 0.35 }, { dur: 0.8, delay: ARR + 1.2, overwrite: false });
        K.show(d.rlab, { delay: ARR + 0.35, dy: 6, blur: 4, dur: 0.6 });
        TX.in(d.rfrom, 'type', { delay: ARR + 0.5, stagger: 0.025 });
        T.setEl(d.rrule, { o: 1, sx: 0 });
        T.el(d.rrule, { sx: 1 }, { dur: 1.0, delay: ARR + 0.4, ease: 'inOutCubic' });
        TX.in(d.rq, 'type', { delay: ARR + 1.1, stagger: 0.07 });
      },
      (S) => {
        const d = S.data;
        K.show(d.fin, { delay: 0.5, dy: 18, blur: 12, dur: 1.4 });
        TX.glint(d.fin, { delay: 2.2, dur: 1.8 });
        if (!d.gal.inert) T.to(d.gal, { exp: 1.02 }, { dur: 3.2, ease: 'inOutSine' });
        glowTo(d.cg, 0.5, { dur: 3.0, delay: 0.3 });
        if (!d.st.inert) T.to(d.st, { o: 0.75 }, { dur: 3.0, delay: 0.3, ease: 'inOutSine' });
        T.to(d.spd, { v: 380 }, { dur: 3.0, delay: 0.3, ease: 'inOutSine' });
        if (!d.th.inert) T.to(d.th, { pulse: 1.6 }, { dur: 2.0, delay: 0.8, ease: 'inOutSine' });
      },
    ],
    update(S, t, dt) {
      const d = S.data, R = AZ1 - AZ0;
      if (!d.st.inert) d.st.dz = S.kf ? 0 : (((d.st.dz - d.spd.v * dt) % R) + R) % R;

      const f = Math.round(Math.min(110, Math.max(0, -KS.D.st(d.log.inner).y) * 1.3));
      if (f !== d.mf) {
        d.mf = f;
        const bs = d.log.box.style;
        bs.webkitMaskImage = bs.maskImage = f > 0 ? 'linear-gradient(180deg, transparent 0, #000 ' + f + 'px)' : 'none';
      }
    },
  });

  const RW_OFF = Array.from({ length: 24 }, (_, k) => 1 / (0.00131 + 0.000575 * k));
  const RW_LAMPS = [];
  RW_OFF.forEach((off, k) => {
    RW_LAMPS.push({ x: 960 - off, y: 690 + 0.0983 * off, off, k });
    RW_LAMPS.push({ x: 960 + off, y: 690 + 0.1007 * off, off, k });
  });
  const RW_RAB = [1001, 835, 792, 766, 749, 735, 724, 715, 708, 702];

  const rwY = (s) => 690 + 420 * Math.pow(4 / 420, s);
  const rwS = (y) => Math.log((y - 690) / 420) / Math.log(4 / 420);
  const rwSeg = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => wp(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n));
  const rwU = (y) => (1110 - y) / 416;

  const rwLines = () => [
    { pts: rwSeg([960, 1110], [960, 694], 16), w: 9, w1: 0.9, col: C.gold2, mul: 1.1, t: [0, 1] },
    { pts: rwSeg([-300, 813.9], [919.3, 694], 20), w: 3.2, w1: 0.6, col: C.gold, mul: 0.9, t: [rwU(813.9), 1], gk: 0.8 },
    { pts: rwSeg([2220, 816.9], [999.7, 694], 20), w: 3.2, w1: 0.6, col: C.gold, mul: 0.9, t: [rwU(816.9), 1], gk: 0.8 },
  ];

  const RW_FLY = [[960, 589], [982, 528], [1052, 452], [1190, 374], [1380, 308], [1600, 262]];
  const rwFlight = () => [
    { pts: [wp(960, 692), wp(960, 640), wp(960, 592)], w: 2.2, col: C.gold2, col2: C.cyan, mul: 1.2, t: [0, 0.16] },
    { pts: RW_FLY.map((p) => wp(p[0], p[1])), w: 3.0, w1: 1.0, col: '#bfefff', col2: C.cyan, mul: 1.3, fade: [0, 0.4], t: [0.16, 1] },
  ];

  const ignite = (sp, o) => {
    if (!sp || sp.inert) return;
    const a = o.rise || 0.18, b = o.fall || 1.1, dl = o.delay || 0;
    T.set(sp, { o: 0 });
    T.to(sp, { o: o.peak || 1 }, { dur: a, delay: dl, ease: 'outCubic' });
    T.to(sp, { o: o.rest }, { dur: b, delay: dl + a, ease: 'inOutSine', overwrite: false });
  };

  KS.scene({
    id: 'runway', sec: 4, title: '良き祖先', swarm: false, kf: [2],
    world: { sky: 'void', post: { vig: 0.45 }, dust: { o: 0.2 } },
    images: ['runway'],
    build(S) {
      const d = S.data;
      d.zm = { v: 1 }; d.wv = { s: 0 }; d.rab = { o: 0 };
      d.bg = K.photo(S, 'runway', { x: 960, y: 540, z: 0, w: 1920, exp: 0.74, rt: 2, ix: 0, iy: -0.28, rs: 0.4, rn: 0.08, rw: 0.1, rc: [0.6, 0.35, 0.15] });
      d.lines = S.ribbon({ curves: rwLines(), prog: 0, stagger: 0, head: 1.1, core: 1.0, glow: 0.8, glowW: 12, order: 22 });
      d.lsz = RW_LAMPS.map((l) => 16 + 64 * l.off / 763);
      d.lamps = RW_LAMPS.map((l, i) => K.glow(S, { x: l.x, y: l.y, size: d.lsz[i], col: C.gold2, mul: 1.1 }));
      d.rsz = RW_RAB.map((y) => 12 + 0.22 * (y - 690));
      d.rabs = RW_RAB.map((y, i) => K.glow(S, { x: 960, y, size: d.rsz[i], col: '#fff1d6', mul: 1.2 }));
      d.hz = K.glow(S, { x: 940, y: 668, size: 900, col: C.amber, mul: 0.7 });
      d.vs = K.glow(S, { x: 960, y: 692, size: 1100, type: 'streak', col: C.gold2, mul: 1.0 });
      d.vg = K.glow(S, { x: 960, y: 692, size: 170, col: '#fff1d6', mul: 1.0 });
      d.fly = S.ribbon({ curves: rwFlight(), prog: 0, head: 0.9, core: 0.9, glow: 0.9, glowW: 10, trail: 1.3, order: 24 });
      d.pf = K.glow(S, { x: 960, y: 589, size: 110, type: 'flare', spikes: 4, col: '#dff6ff', mul: 1.4 });
      d.pg = K.glow(S, { x: 960, y: 589, size: 120, col: C.cyan, mul: 1.0 });
      d.scr = scrim(S, 'radial-gradient(ellipse 1000px 640px at 300px 330px, rgba(2,3,8,.66) 0%, rgba(2,3,8,.4) 45%, rgba(2,3,8,0) 100%)');
      d.a = S.text('「良き祖先」とは、', { cls: 'serif', size: 46, x: 120, y: 118, color: C.cream, ls: 0.06 });
      d.a.firstChild.style.marginLeft = '-0.5em';
      d.b = S.text('子孫を支配する者ではない。', { cls: 'serif', size: 38, x: 120, y: 190, color: DIM, ls: 0.06 });
      d.c = S.text('子孫が自由に羽ばたけるように、', { cls: 'serif', size: 42, x: 120, y: 292, color: C.white, ls: 0.05 });
      d.dd = S.text('{踏み台}となり、\n{滑走路}となった者のことだ。', { cls: 'serif', size: 58, x: 116, y: 358, lh: 1.42, color: C.white, ls: 0.04 });
      d.src = K.src(S, '『神のブートローダー』第6章「黄昏の美学」より');
    },
    steps: [
      (S) => {
        const d = S.data;
        K.reveal(d.bg, { dur: 3.6, ease: 'inOutSine' });
        T.to(d.zm, { v: 1.02 }, { dur: 9, ease: 'inOutSine' });
        K.show(d.scr, { dy: 0, blur: 0, dur: 2.0, delay: 0.3 });
        K.show(d.a, { delay: 0.9, dy: 14 });
        K.show(d.b, { delay: 1.8, dy: 12 });
        glowTo(d.hz, 0.18, { dur: 3, delay: 0.8 });
      },
      (S) => {
        const d = S.data, W0 = 0.6, WD = 2.6, TV = W0 + WD, TC = TV + 0.25, CD = 3.6, TP = TC + CD * 0.28;
        K.fade(d.b, 0.5, { dur: 1.2 });
        K.show(d.c, { delay: 0.3, dy: 12 });
        TX.in(d.dd, 'lines', { delay: 1.0, stagger: 0.6, dy: 16 });
        TX.glint(d.dd, { delay: TC + 1.6, dur: 1.8 });
        T.to(d.zm, { v: 1.06 }, { dur: 11, ease: 'inOutSine' });
        if (!d.bg.inert) T.to(d.bg, { exp: 0.95 }, { dur: 3, delay: W0, ease: 'inOutSine' });
        T.to(d.wv, { s: 1 }, { dur: WD, delay: W0, ease: 'linear' });
        d.lamps.forEach((sp, i) => ignite(sp, { delay: W0 + WD * rwS(RW_LAMPS[i].y), peak: 0.9, rest: 0.42 }));
        T.to(d.rab, { o: 1 }, { dur: 0.8, delay: TV, ease: 'inOutSine' });
        K.spark(d.vs, { o: 0.5, delay: TV - 0.05, rise: 0.15, fall: 1.8 });
        ignite(d.vg, { delay: TV - 0.05, peak: 0.6, rest: 0.25, rise: 0.15, fall: 1.6 });
        glowTo(d.hz, 0.4, { dur: 2.0, delay: TV - 0.3 });
        if (!d.fly.inert) T.to(d.fly, { prog: 1 }, { dur: CD, delay: TC, ease: 'inOutSine' });
        K.spark(d.pf, { o: 0.7, delay: TP, rise: 0.2, fall: 1.4 });
        glowTo(d.pg, 0.5, { dur: 1.4, delay: TP });
        K.show(d.src, { delay: 2.4, dy: 8 });
      },
    ],
    update(S, t, dt) {
      const d = S.data, Z = d.zm.v;

      if (!d.bg.inert) { d.bg.w = 1920 * Z; d.bg.y = 150 * (Z - 1); }
      const at = (sp, x, y, size) => { if (sp.inert) return; sp.x = (x - 960) * Z; sp.y = -150 - (y - 690) * Z; sp.size = size * Z; };
      RW_LAMPS.forEach((l, i) => at(d.lamps[i], l.x, l.y, d.lsz[i]));
      RW_RAB.forEach((y, k) => at(d.rabs[k], 960, y, d.rsz[k]));
      at(d.hz, 940, 668, 900); at(d.vs, 960, 692, 1100); at(d.vg, 960, 692, 170);
      at(d.pf, 960, 589, 110); at(d.pg, 960, 589, 120);
      [d.lines, d.fly].forEach((r) => { if (!r.inert) { r.m.s = Z; r.m.py = -150; } });
      if (!d.lines.inert) d.lines.prog = U.clamp(rwU(rwY(d.wv.s)), 0, 1);

      const s = d.wv.s, N = RW_RAB.length;
      d.rabs.forEach((sp, k) => {
        if (sp.inert) return;
        const dk = s - rwS(RW_RAB[k]);
        const lit = dk <= 0 ? 0 : Math.min(1, dk / 0.03) * (0.4 + 0.6 * Math.exp(-dk * dk * 400));
        let b = 0.32;
        if (!S.kf) { const x = ((t % 1.25) / 1.25) * (N + 3) - 1.5 - k; b = 0.15 + 0.85 * Math.exp(-2 * x * x); }
        sp.o = lit * (1 - d.rab.o) + d.rab.o * b;
      });
    },
  });

  const ST_P = [1073.6, 594.8];
  const ST_PW = wp(ST_P[0], ST_P[1]);
  const ST_N = 48;
  const ST_G = { x: 100, y0: 830, y1: 150 };
  const ST_GD = 4.4, ST_G0 = 0.8, ST_SD = 1.9;

  const stAt = (y) => ST_G0 + ST_GD * Math.acos(1 - 2 * U.clamp((ST_G.y0 - y) / (ST_G.y0 - ST_G.y1), 0, 1)) / Math.PI;

  const ST_SEAMS = [
    { y: 640, col: '#fff1d6', col2: C.gold, mul: 1.0, pts: [[20, 590], [110, 606], [195, 618], [280, 642], [380, 664], [480, 676], [600, 676], [689, 669], [827, 675], [951, 686], [1089, 703], [1226, 727], [1364, 744], [1502, 746], [1626, 748], [1764, 768], [1902, 788], [2010, 800]] },
    { y: 480, col: C.gold2, mul: 1.1, pts: [[138, 480], [276, 469], [413, 463], [551, 465], [675, 476], [813, 474], [951, 489], [1089, 496], [1226, 483], [1364, 465], [1488, 467], [1626, 481], [1764, 495], [1902, 496], [2010, 497]] },
    { y: 283, col: C.gold2, mul: 1.25, pts: [[230, 283], [354, 281], [491, 267], [616, 262], [740, 258], [877, 253], [1001, 254], [1125, 249], [1249, 243], [1387, 237], [1511, 226], [1635, 215], [1773, 218], [1897, 220], [2010, 222]] },
    { y: 200, col: C.gold, mul: 0.9, pts: [[245, 206], [330, 196], [440, 186], [540, 170], [643, 154], [781, 151], [919, 141], [1056, 139], [1194, 125], [1346, 123], [1484, 113], [1621, 99], [1759, 116], [1897, 147], [2010, 172]] },
  ];
  const ST_GT = stAt(ST_SEAMS[3].y) + ST_SD - ST_G0;
  const stSeams = () => ST_SEAMS.map((m) => ({
    pts: m.pts.map((p) => wp(p[0], p[1])), w: 1.8, col: m.col, col2: m.col2, mul: m.mul, gk: 0.8,
    t: [(stAt(m.y) - ST_G0) / ST_GT, (stAt(m.y) + ST_SD - ST_G0) / ST_GT],
  }));
  const ST_LAB = [{ y: 792, ja: '細胞', en: 'CELLS' }, { y: 520, ja: '体', en: 'BODIES' }, { y: 212, ja: '社会', en: 'SOCIETIES' }];

  const ST_FOS = [
    { x: 1223, y: 950, size: 170, col: '#e6f3ff' }, { x: 775, y: 861, size: 120, col: '#e6f3ff' },
    { x: 1481, y: 610, size: 180, col: C.gold2 }, { x: 1385, y: 385, size: 140, col: C.gold2 },
    { x: 1050, y: 212, size: 170, col: C.gold2 }, { x: 1610, y: 180, size: 180, col: C.gold2 },
  ];

  const ST_RUSH = (() => {
    const r = U.rng(5508);
    return Array.from({ length: 42 }, () => ({ th: r() * TAU, ph: r(), a: 0.75 + 0.6 * r(), c: r() }));
  })();

  const ST_BN = { x: 680, y: 563, w: 300 }, ST_BP = { x: 1280, y: 612, w: 220 };
  const ST_PASS = K.ptext('通過点', { size: 230, depth: 18, sizeVar: 0.45, sparkle: 0.06, color: '#fff1d6', color2: C.gold2, seed: 5511 });
  const ST_LOOK = { o: 1, size: 1.9, i: 1.08, wob: 0.6, wobF: 0.6, flow: 0 };

  KS.scene({
    id: 'strata', sec: 4, title: '宇宙の縮尺から、生命の縮尺へ', swarm: false, kf: [1, 3, 4, 5],
    world: { sky: 'void', post: { vig: 0.45 }, dust: { o: 0.2 } },
    images: ['cosmic_web', 'strata', 'cover_new', 'cover_boot'],
    build(S) {
      const d = S.data, P = ST_P;
      d.lz = { v: 0 }; d.sz = { v: 1.04 }; d.gz = { u: 0 }; d.pgo = { v: 0 }; d.tpo = { v: 0 }; d.dk = { v: 0 }; d.vel = 0; d.lv = 0;
      d.web = K.photo(S, 'cosmic_web', { x: 960, y: 540, z: 0, w: 1920, exp: 0.9, rt: 2, ix: (P[0] - 960) / 960, iy: (540 - P[1]) / 540, rs: 0.4, rn: 0.08, rw: 0.1, rc: [0.35, 0.5, 0.7] });

      d.gh = [0.93, 0.86].map(() => K.photo(S, 'cosmic_web', { x: 960, y: 540, z: 0, w: 1920, exp: 0.9, rv: 1, o: 0, add: 1, blur: 0.5 }));
      d.st = K.photo(S, 'strata', { x: 960, y: 540, z: 0, w: 1920, rv: 1, o: 0, exp: 1.4, order: 12 });
      d.pg = K.glow(S, { x: P[0], y: P[1], size: 90, col: C.gold2, mul: 1.0, pulse: 0.25, pulseS: 1.1 });
      d.hr = K.glow(S, { x: P[0], y: P[1], size: 22, type: 'ring', rw: 0.16, col: C.cream, mul: 1.0 });
      d.fl = K.glow(S, { x: P[0], y: P[1], size: 560, col: '#fff1d6', mul: 0.8 });
      d.rush = ST_RUSH.map((m) => K.glow(S, { x: P[0], y: P[1], size: 40, type: 'dash', col: m.c < 0.72 ? C.gold2 : '#dff3ff', mul: 0.9, rot: m.th / U.deg }));

      d.scA = scrim(S, 'radial-gradient(ellipse 1050px 560px at 330px 270px, rgba(2,3,8,.72) 0%, rgba(2,3,8,.42) 48%, rgba(2,3,8,0) 100%)');
      d.ca = S.text('宇宙の縮尺で見ると、', { cls: 'sans', size: 26, x: 120, y: 150, color: C.cream, ls: 0.08 });
      d.h1 = S.text('生命の40億年は、{一つの点}。', { cls: 'serif', size: 58, x: 116, y: 194, color: C.white, ls: 0.04 });
      d.sb = S.text('人類の数百万年は、\nその点の中に沈んでしまう。', { cls: 'serif', size: 38, x: 120, y: 300, lh: 1.5, color: DIM, ls: 0.05 });
      const sv = (d.sv = K.svg(S));
      d.rg = K.undrawn(K.circle(sv, P[0], P[1], 34, 'thin'));
      d.ld = K.undrawn(K.path(sv, 'M' + (P[0] - 25) + ' ' + (P[1] - 25) + 'L1000 516L958 516', 'thin'));
      d.l1 = S.text('生命　40億年', { cls: 'sans', size: 24, x: 946, y: 516, anchor: 'cr', color: C.cream, ls: 0.06 });
      d.l2 = S.text('人類　数百万年', { cls: 'sans', size: 20, x: 946, y: 552, anchor: 'cr', color: DIM, ls: 0.06 });

      d.scL = scrim(S, 'linear-gradient(90deg, rgba(3,4,9,.8) 0px, rgba(3,4,9,.56) 250px, rgba(3,4,9,.22) 520px, rgba(3,4,9,0) 780px)');
      d.scB = scrim(S, 'radial-gradient(ellipse 1250px 400px at 380px 930px, rgba(2,3,8,.74) 0%, rgba(2,3,8,.42) 50%, rgba(2,3,8,0) 100%)');
      d.c2 = S.text('そこで今度の本では、', { cls: 'sans', size: 26, x: 120, y: 866, color: C.cream, ls: 0.08 });
      d.h2 = S.text('同じ場所を、{生命の縮尺}で描き直した。', { cls: 'serif', size: 50, x: 116, y: 906, color: C.white, ls: 0.04 });
      d.c3 = S.text('生命の縮尺で拡大すると、', { cls: 'sans', size: 26, x: 120, y: 866, color: C.cream, ls: 0.08 });
      d.h3 = S.text('同じ点が、{積もった地層}に見えてくる。', { cls: 'serif', size: 50, x: 116, y: 906, color: C.white, ls: 0.04 });
      d.seams = S.ribbon({ curves: stSeams(), prog: 0, stagger: 0, head: 1.0, core: 1.0, glow: 0.6, glowW: 9, order: 22 });
      d.fos = ST_FOS.map((q) => K.glow(S, { x: q.x, y: q.y, size: q.size, col: q.col, mul: 0.9 }));

      const g2 = (d.sv2 = K.svg(S));
      d.gt = K.undrawn(K.line(g2, ST_G.x, ST_G.y0, ST_G.x, ST_G.y1, 'dim thin'));
      d.gl = K.node(g2, 'line', { x1: ST_G.x, y1: ST_G.y0, x2: ST_G.x, y2: ST_G.y0, class: 'k-ln', style: 'opacity:0' });
      d.ah = K.undrawn(K.path(g2, 'M91 163L100 150L109 163', ''));
      d.tk = ST_LAB.map((l) => K.undrawn(K.line(g2, 108, l.y, 124, l.y, 'thin')));
      d.lj = ST_LAB.map((l) => S.text(l.ja, { cls: 'serif', size: 44, x: 134, y: l.y - 6, anchor: 'cl', color: C.gold2, ls: 0.06 }));
      d.le = ST_LAB.map((l) => S.text(l.en, { cls: 'mono', size: 14, x: 137, y: l.y + 30, anchor: 'cl', color: DIM, ls: 0.24 }));
      d.tip = K.glow(S, { x: ST_G.x, y: ST_G.y0, size: 46, col: C.gold2, mul: 1.0 });

      d.cN = K.cover(S, 'cover_new', { x: ST_BN.x, y: ST_BN.y, w: ST_BN.w, order: 14 });
      d.cP = K.cover(S, 'cover_boot', { x: ST_BP.x, y: ST_BP.y, w: ST_BP.w, order: 14, exp: 0.8 });
      d.h4 = K.h(S, '新刊は続編ではなく、前著の{手前に置く地図}', { y: 156, size: 50 });
      d.s4 = S.text('書いた順番は前著が先。でも、読むなら新刊から。', { cls: 'sans', size: 28, x: 120, y: 240, color: DIM, ls: 0.06 });
      d.tN = S.text('①　新刊『人類という通過点』', { cls: 'serif', size: 34, x: ST_BN.x, y: 806, anchor: 'tc', color: C.gold2, ls: 0.04 });
      d.mN = S.text('生命の縮尺の地図', { cls: 'sans', size: 22, x: ST_BN.x, y: 860, anchor: 'tc', color: DIM, ls: 0.1 });
      d.tP = S.text('②　前著『神のブートローダー』', { cls: 'serif', size: 28, x: ST_BP.x, y: 810, anchor: 'tc', color: C.cream, ls: 0.04 });
      d.mP = S.text('宇宙の縮尺の地図', { cls: 'sans', size: 20, x: ST_BP.x, y: 856, anchor: 'tc', color: DIM, ls: 0.1 });
      d.sv4 = K.svg(S);
      d.ro = K.undrawn(K.path(d.sv4, 'M862 612L1138 612', ''));
      d.roh = K.undrawn(K.path(d.sv4, 'M1126 602L1138 612L1126 622', ''));

      d.f5 = S.text('前著『神のブートローダー』では、人類を{「起動装置」}と呼んだ', { cls: 'sans', size: 26, x: 960, y: 262, anchor: 'tc', color: DIM, ls: 0.1 });
      d.l5 = S.text('新刊では、生命の縮尺の地図の上で、人類のいる場所を', { cls: 'serif', size: 44, x: 960, y: 352, anchor: 'tc', color: C.cream, ls: 0.06 });
      d.p5 = S.text('と名づけた', { cls: 'serif', size: 44, x: 960, y: 740, anchor: 'tc', color: C.cream, ls: 0.06 });
      d.w5 = K.gl() ? null : S.text('通過点', { cls: 'serif', size: 180, x: 960, y: 548, anchor: 'cc', color: C.gold2, ls: 0.1 });
      d.pfl = K.glow(S, { x: 960, y: 548, z: -20, size: 980, col: '#fff1d6', mul: 0.5 });
      prep(S, ST_PASS);
    },
    steps: [
      (S) => {
        const d = S.data;
        K.reveal(d.web, { dur: 3.4, ease: 'inOutSine' });
        T.to(d.lz, { v: Math.log(1.05) }, { dur: 10, ease: 'inOutSine' });
        T.to(d.pgo, { v: 0.6 }, { dur: 1.6, delay: 1.8, ease: 'inOutSine' });
        K.show(d.scA, { dy: 0, blur: 0, dur: 2.0, delay: 0.4 });
        K.show(d.ca, { delay: 0.9, dy: 12 });
        TX.in(d.h1, 'lines', { delay: 1.4, dy: 16 });
        K.draw(d.rg, { delay: 2.2, dur: 1.2 });
        K.draw(d.ld, { delay: 2.9, dur: 0.8 });
        K.show(d.l1, { delay: 3.4, dy: 0, x0: 10 });
        TX.in(d.sb, 'lines', { delay: 3.8, stagger: 0.7, dy: 14 });
        K.show(d.l2, { delay: 4.2, dy: 0, x0: 10 });
        if (!d.hr.inert) {
          T.to(d.hr, { o: 0.85 }, { dur: 0.6, delay: 4.2 });
          T.to(d.hr, { size: 2.5 }, { dur: 1.8, delay: 4.8, ease: 'inOutSine' });
          T.to(d.hr, { o: 0 }, { dur: 0.8, delay: 6.0, overwrite: false });
        }
        K.fade(d.l2, 0.55, { dur: 1.2, delay: 6.2 });
      },
      (S) => {
        const d = S.data, LD = 0.3, DV = 4.2, LT = LD + DV;
        [d.ca, d.h1, d.sb].forEach((el) => TX.out(el, 'sink'));
        K.hide(d.l1); K.hide(d.l2);
        K.fade(d.sv, 0, { dur: 0.5 });
        K.fade(d.scA, 0, { dur: 1.2, delay: 0.2 });
        T.to(d.lz, { v: Math.log(ST_N) }, { dur: DV, delay: LD, ease: 'inOutSine' });
        K.show(d.scB, { dy: 0, blur: 0, dur: 1.6, delay: LT - 0.4 });
        K.show(d.c2, { delay: LT, dy: 12 });
        TX.in(d.h2, 'lines', { delay: LT + 0.4, dy: 16 });
        TX.glint(d.h2, { delay: LT + 1.5, dur: 1.8 });
        T.to(d.sz, { v: 1.06 }, { dur: 12, delay: LT, ease: 'inOutSine' });
      },
      (S) => {
        const d = S.data, G0 = ST_G0, GE = ST_G0 + ST_GD;
        TX.out(d.c2, 'sink'); TX.out(d.h2, 'sink');
        K.show(d.scL, { dy: 0, blur: 0, dur: 1.4 });
        K.draw(d.gt, { delay: 0.2, dur: 1.0, ease: 'inOutSine' });
        T.to(d.gz, { u: 1 }, { dur: ST_GD, delay: G0, ease: 'inOutSine' });
        if (!d.seams.inert) {
          T.to(d.seams, { prog: 1 }, { dur: ST_GT, delay: G0, ease: 'linear' });
          T.to(d.seams, { o: 0.62 }, { dur: 1.8, delay: G0 + ST_GT + 0.2, ease: 'inOutSine' });
        }
        T.to(d.tpo, { v: 0.9 }, { dur: 0.5, delay: G0 - 0.2 });
        T.to(d.tpo, { v: 0.35 }, { dur: 1.4, delay: GE, ease: 'inOutSine', overwrite: false });
        ST_LAB.forEach((l, i) => {
          const at = stAt(l.y);
          K.draw(d.tk[i], { delay: at - 0.1, dur: 0.5 });
          K.show(d.lj[i], { delay: at, dy: 0, x0: -14 });
          K.show(d.le[i], { delay: at + 0.25, dy: 0, blur: 4 });
        });
        d.fos.forEach((sp, i) => ignite(sp, { delay: stAt(ST_FOS[i].y), peak: 0.5, rest: 0.12, fall: 1.4 }));
        K.draw(d.ah, { delay: GE - 0.2, dur: 0.6 });
        K.show(d.c3, { delay: GE + 0.3, dy: 12 });
        TX.in(d.h3, 'lines', { delay: GE + 0.7, dy: 16 });
        TX.glint(d.h3, { delay: GE + 1.8, dur: 1.8 });
        T.to(d.sz, { v: 1.08 }, { dur: 12, ease: 'inOutSine' });
      },
      (S) => {
        const d = S.data;
        TX.out(d.c3, 'sink'); TX.out(d.h3, 'sink');
        d.lj.concat(d.le).forEach((el) => K.hide(el));
        K.fade(d.sv2, 0, { dur: 0.6 });
        T.to(d.tpo, { v: 0 }, { dur: 0.6 });
        if (!d.seams.inert) T.to(d.seams, { o: 0 }, { dur: 1.0 });
        d.fos.forEach((sp) => glowTo(sp, 0, { dur: 1.0 }));
        K.fade(d.scL, 0, { dur: 1.0 }); K.fade(d.scB, 0, { dur: 1.0 });
        T.to(d.dk, { v: 0.7 }, { dur: 1.6, ease: 'inOutSine' });
        TX.in(d.h4, 'rise', { delay: 0.7, stagger: 0.035 });
        K.show(d.s4, { delay: 1.3, dy: 8 });
        K.coverIn(d.cN, { delay: 1.4, dur: 1.8 });
        K.show(d.tN, { delay: 2.2, dy: 8 });
        K.show(d.mN, { delay: 2.4, dy: 6 });
        K.coverIn(d.cP, { delay: 2.4, dur: 1.6 });
        K.show(d.tP, { delay: 3.0, dy: 8 });
        K.show(d.mP, { delay: 3.2, dy: 6 });
        K.draw(d.ro, { delay: 3.4, dur: 0.7 });
        K.draw(d.roh, { delay: 4.0, dur: 0.3 });
      },
      (S) => {
        const d = S.data;
        [d.h4, d.s4, d.tN, d.mN, d.tP, d.mP].forEach((el) => K.hide(el));
        K.fade(d.sv4, 0, { dur: 0.6 });
        [d.cN, d.cP].forEach((p) => { if (!p.inert) T.to(p, { o: 0 }, { dur: 0.8, ease: 'inOutSine' }); });
        T.to(d.dk, { v: 1 }, { dur: 1.6, ease: 'inOutSine' });
        K.show(d.f5, { delay: 0.4, dy: 8 });
        TX.in(d.l5, 'rise', { delay: 1.4, stagger: 0.035 });
        K.sw(S, ST_PASS, { x: 960, y: 548, dur: 2.4, delay: 1.6, ord: 1, amt: 0.5, spread: 120, ease: 'expo' });
        S.swarmLook(ST_LOOK, { dur: 1.4, delay: 1.6 });
        if (d.w5) K.show(d.w5, { delay: 2.2, dur: 1.6, blur: 14 });
        K.spark(d.pfl, { o: 0.22, delay: 3.4, rise: 0.6, fall: 2.4 });
        K.show(d.p5, { delay: 3.6, dy: 10 });
      },
    ],
    update(S, t, dt) {
      const d = S.data, s = Math.exp(d.lz.v), k = (s / ST_N) * d.sz.v, px = ST_PW[0], py = ST_PW[1];

      const put = (p, sc) => { if (p.inert) return; p.w = 1920 * sc; p.x = px * (1 - sc); p.y = py * (1 - sc); };

      if (S.kf || !(dt > 0)) d.vel = 0;
      else d.vel += (U.clamp((d.lz.v - d.lv) / dt, 0, 3) - d.vel) * Math.min(1, dt * 8);
      d.lv = d.lz.v;
      const wo = 1 - U.smooth(4, 20, s);
      if (!d.web.inert) { put(d.web, s); d.web.o = wo; d.web.blur = 0.8 * U.smooth(1.5, 8, s); }
      d.gh.forEach((p, i) => { put(p, s * (i ? 0.86 : 0.93)); if (!p.inert) p.o = wo * U.clamp(d.vel / 1.4, 0, 1) * (i ? 0.2 : 0.3); });
      if (!d.st.inert) {
        put(d.st, k); d.st.o = U.smooth(1.5, 5, s);

        d.st.exp = (1.4 - 0.4 * U.smooth(4, 40, s)) * (1 - 0.67 * d.dk.v); d.st.blur = 0.35 * d.dk.v;

        const q = 1 - U.smooth(6, 40, s), H = 1080 * k;
        d.st.round = q * 0.5 * H;
        d.st.fe = Math.max(q * 0.45 * H, 150 * (1 - U.smooth(30, 47, s)));
      }
      if (!d.pg.inert) { d.pg.size = 90 * Math.pow(s, 0.75); d.pg.o = d.pgo.v * (1 - U.smooth(3, 16, s)); }
      if (!d.fl.inert) d.fl.o = 0.16 * U.smooth(3, 9, s) * (1 - U.smooth(9, 26, s));
      const vn = U.clamp(d.vel / 1.4, 0, 1);
      d.rush.forEach((sp, i) => {
        if (sp.inert) return;
        const m = ST_RUSH[i], f = (m.ph + 0.5 * m.a * d.lz.v) % 1, r = 60 * Math.exp(3.3 * f);
        sp.x = px + r * Math.cos(m.th); sp.y = py + r * Math.sin(m.th);
        sp.size = 6 + 0.34 * r * vn;
        sp.o = vn * 0.45 * U.smooth(0.05, 0.25, f) * (1 - U.smooth(0.8, 1, f));
      });
      if (!d.seams.inert) { d.seams.m.s = k; d.seams.m.px = px; d.seams.m.py = py; }
      ST_FOS.forEach((q, i) => {
        const sp = d.fos[i];
        if (sp.inert) return;
        sp.x = px + k * (q.x - 960 - px); sp.y = py + k * (540 - q.y - py); sp.size = q.size * k;
      });

      const u = d.gz.u, ty = ST_G.y0 - (ST_G.y0 - ST_G.y1) * u;
      d.gl.setAttribute('y2', ty.toFixed(1));
      d.gl.style.opacity = u > 0.002 ? '' : '0';
      if (!d.tip.inert) { d.tip.y = 540 - ty; d.tip.o = d.tpo.v; }
    },
  });
})();
