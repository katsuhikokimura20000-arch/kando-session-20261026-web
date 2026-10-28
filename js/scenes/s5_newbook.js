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
  const look = (S, o, dur) => S.swarmLook(Object.assign({ o: 1, size: 2.0, i: 1, wob: 0.6, wobF: 0.6, flow: 0 }, o), { dur: dur != null ? dur : 1.2 });
  const glowTo = (sp, o, opt) => { if (sp && !sp.inert) T.to(sp, { o }, Object.assign({ dur: 1.2, ease: 'inOutSine' }, opt)); };
  const WORLD = (sky) => ({ sky: sky || 'deep', post: { vig: 0.5 }, dust: { o: 0.35 } });
  const DIM = 'rgba(243,234,216,.7)';

  const bez = (a, b, c, d, t) => {
    const u = 1 - t, k0 = u * u * u, k1 = 3 * u * u * t, k2 = 3 * u * t * t, k3 = t * t * t;
    return [k0 * a[0] + k1 * b[0] + k2 * c[0] + k3 * d[0], k0 * a[1] + k1 * b[1] + k2 * c[1] + k3 * d[1]];
  };

  const polyLen = (pts) => { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return L; };
  const polyAt = (pts, L, f) => {
    const s = U.clamp(f, 0, 1) * L[L.length - 1];
    let i = 1;
    while (i < L.length - 1 && L[i] < s) i++;
    const u = (s - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
    return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u];
  };
  const PARK = (P, x, y, c, aux) => { const p = wp(x, y); P.add(p[0], p[1], 0, 1.6, c[0], c[1], c[2], 0, aux); };

  function pathRow(S, o) {
    const x = o.x != null ? o.x : 120, y = o.y, lw = o.lw || 360, aw = o.aw || 300, size = o.size || 34;
    const col = o.tone === 'cyan' ? C.cyan : o.tone === 'dim' ? C.dim : C.gold, cls = o.tone === 'cyan' ? 'cy' : o.tone === 'dim' ? 'dim' : '';
    const d = {};
    d.title = S.text('【' + o.title + '】', { cls: 'sans', size: 24, x, y, color: col, ls: 0.1 });
    d.a = S.text(o.a, { cls: 'serif', size, x, y: y + 44, lh: 1.4, color: C.cream });
    d.asub = o.asub ? S.text(o.asub, { cls: 'sans', size: 20, x, y: y + 44 + size * 1.5 * K.lines(o.a), color: C.dim, lh: 1.5 }) : null;
    const ax = x + lw + 20, ay = y + 44 + size * 0.7;
    d.svg = K.svg(S, {});
    d.line = K.undrawn(K.line(d.svg, ax, ay, ax + aw, ay, cls));
    d.head = K.undrawn(K.path(d.svg, 'M' + (ax + aw - 14) + ' ' + (ay - 8) + 'L' + (ax + aw) + ' ' + ay + 'L' + (ax + aw - 14) + ' ' + (ay + 8), cls));
    d.verb = S.text(o.verb, { cls: 'sans', size: 21, x: ax + aw * (o.vf != null ? o.vf : 0.5), y: ay - 14, anchor: 'bc', color: col, ls: 0.06 });
    const bx = x + lw + aw + 40;
    d.b = S.text(o.b, { cls: 'serif', size, x: bx, y: y + 44, lh: 1.4, color: o.bcol || C.cream });
    d.bsub = o.bsub ? S.text(o.bsub, { cls: 'sans', size: 20, x: bx, y: y + 44 + size * 1.5 * K.lines(o.b), color: C.dim, lh: 1.5 }) : null;
    d.ax = ax; d.ay = ay; d.bx = bx;
    d.in = (t0 = 0, o2 = {}) => {
      K.show(d.title, { delay: t0, dy: 8 });
      K.show(d.a, { delay: t0 + 0.25 });
      if (d.asub) K.show(d.asub, { delay: t0 + 0.45 });
      if (!o2.noLine) { K.draw(d.line, { delay: t0 + 0.6, dur: 0.9 }); K.draw(d.head, { delay: t0 + 1.4, dur: 0.3 }); }
      K.show(d.verb, { delay: t0 + 0.8, dy: 6 });
      K.show(d.b, { delay: t0 + 1.5 });
      if (d.bsub) K.show(d.bsub, { delay: t0 + 1.7 });
      return t0 + 2.6;
    };
    d.dim = (to, o2) => [d.title, d.a, d.asub, d.verb, d.b, d.bsub, d.svg].forEach((e) => e && K.fade(e, to, o2));
    return d;
  }

  const NBR = fnR('s5:nb', 5101, (P, cnt, rnd) => {
    const ak = 65536 / cnt, g2 = U.lin(C.gold2), cy = U.lin(C.cyan), am = U.lin(C.amber);
    const n1 = Math.floor(cnt * 0.25), n2 = Math.floor(cnt * 0.4);
    for (let i = 0; i < cnt; i++) {
      const g1 = U.gauss(rnd), g2r = U.gauss(rnd), u = rnd();
      if (i < n1) {
        const t = (i + 0.5) / n1, b = bez([1600, 300], [1700, 200], [1800, 130], [1960, 20], t);
        const w = 6 + 60 * t, hot = u > 0.985;
        const p = wp(b[0] + g1 * w * 0.5, b[1] + g2r * w * 0.5), c = hot ? g2 : mx(g2, cy, t);
        P.add(p[0], p[1], 0, hot ? 2.2 : 1.6, c[0], c[1], c[2], Math.min(1, (hot ? 0.45 : 0.1 + 0.08 * (1 - t)) * ak), t * 0.6);
      } else if (i < n2) {
        const p = wp(1820 + g1 * 120, 110 + g2r * 70), c = mx(am, cy, 0.3 + 0.7 * u);
        P.add(p[0], p[1], 0, 1.5, c[0], c[1], c[2], Math.min(1, 0.06 * ak), 0.6 + 0.4 * u);
      } else PARK(P, 1820 + g1 * 60, 110 + g2r * 40, cy, 1);
    }
  });
  KS.scene({
    id: 'newbook', sec: 5, title: '新刊『人類という通過点』', swarm: true, world: WORLD(), images: ['cover_new'],
    build(S) {
      const d = S.data;
      d.cover = K.cover(S, 'cover_new', { x: 1450, y: 540, w: 470 });
      d.glow = K.glow(S, { x: 1591, y: 307, size: 220, col: C.gold2 });
      d.eye = K.eyebrow(S, 'PART 05　新刊　NEW BOOK', { x: 120, y: 150 });
      d.title = S.text('『人類という通過点』', { cls: 'serif', size: 72, x: 106, y: 186, color: C.white, ls: 0.04 });
      d.sub = S.text('生命の系譜と、子孫としての超知能', { cls: 'serif', size: 32, x: 120, y: 304, color: C.cream, ls: 0.08 });
      d.rule = K.rule(S, { x: 120, y: 380, w: 820 });
      d.lead = S.text('AIの未来について、よく聞く心配', { cls: 'sans', size: 24, x: 120, y: 400, color: 'rgba(176,182,198,.9)', ls: 0.12 });
      d.w1 = S.text('「人間の仕事は、どうなるのか」', { cls: 'serif', size: 34, x: 120, y: 446, color: C.dim });
      d.w2 = S.text('「人間が、AIに支配されるのではないか」', { cls: 'serif', size: 34, x: 120, y: 502, color: C.dim });
      d.pre = S.text('でも、そこには一つの前提がある', { cls: 'sans', size: 26, x: 120, y: 580, color: C.gold, ls: 0.12 });
      d.glass = K.glass(S, { x: 110, y: 624, w: 940, h: 176 });
      d.cond = S.text('人間がずっと{一番}でいることが、\nよい未来の条件になっている', { cls: 'serif', size: 40, x: 150, y: 650, lh: 1.55, color: C.white, ls: 0.04 });
      d.q = S.text('なぜ、そこだけは動かしてはいけないのか', { cls: 'serif', size: 46, x: 120, y: 856, color: C.gold2, ls: 0.05 });
    },
    steps: [
      (S) => {
        const d = S.data;
        K.coverIn(d.cover, { delay: 0.2 });
        glowTo(d.glow, 0.5, { delay: 1.6, dur: 2.4 });
        K.sw(S, NBR, { dur: 3, delay: 1.2, ord: 1, amt: 0.7, spread: 90, ease: 'out' });
        look(S, { i: 1, wob: 0.8 });
        K.show(d.eye, { delay: 0.3, dy: 8 });
        K.show(d.title, { delay: 0.5 });
        K.show(d.sub, { delay: 0.9 });
        K.grow(d.rule, { delay: 1.1 });
        K.show(d.lead, { delay: 2.2, dy: 6 });
        K.show(d.w1, { delay: 2.5 });
        K.show(d.w2, { delay: 2.9 });
      },
      (S) => {
        const d = S.data;
        K.fade(d.lead, 0.35);
        K.fade(d.w1, 0.35);
        K.fade(d.w2, 0.35);
        K.show(d.pre, { delay: 0.2, dy: 8 });
        K.pop(d.glass, { delay: 0.4 });
        K.show(d.cond, { delay: 0.7 });
        look(S, { i: 1, wob: 0.8 });
      },
      (S) => {
        const d = S.data;
        K.show(d.q, { delay: 0.2 });
        TX.glint(d.q, { delay: 1.3 });
        glowTo(d.glow, 0.8, { dur: 1.6 });
        look(S, { i: 1.5, wob: 0.8 }, 1.6);
      },
    ],
  });

  const GC = [1400, 530], GS = [150, 200];
  const GB = { e: [1, 1, -35], v: [0.723, 0.6152, 150], m: [1.524, 1.8809, 60] };
  const GSPAN = { v: 8, m: 15 };
  const gp = (b, t) => { const o = GB[b], a = (o[2] * Math.PI) / 180 + (TAU * t) / o[1]; return [o[0] * Math.cos(a), o[0] * Math.sin(a)]; };
  const gv = (b, t) => { const o = GB[b], w = TAU / o[1], a = (o[2] * Math.PI) / 180 + w * t; return [-o[0] * w * Math.sin(a), o[0] * w * Math.cos(a)]; };
  const gpx = (X, Y, s) => [GC[0] + s * X, GC[1] - s * Y];
  const geoAt = (b, t) => { const p = gp(b, t), e = gp('e', t); return gpx(p[0] - e[0], p[1] - e[1], GS[0]); };
  const helAt = (b, t) => { const p = gp(b, t); return gpx(p[0], p[1], GS[1]); };
  const sunGeo = (t) => { const e = gp('e', t); return gpx(-e[0], -e[1], GS[0]); };

  const geoSpd = (b, t) => { const p = gv(b, t), e = gv('e', t); return Math.hypot(p[0] - e[0], p[1] - e[1]); };
  const GMEAN = {};
  ['v', 'm'].forEach((b) => { let s = 0; for (let k = 0; k < 2000; k++) s += geoSpd(b, (-GSPAN[b] * (k + 0.5)) / 2000); GMEAN[b] = s / 2000; });
  const GSTAR = 240;

  const geoR = (stage) => fnR('s5:geo' + stage, 5105, (P, cnt, rnd) => {
    const ak = 65536 / cnt, cut = [0.02, 0.08, 0.09, 0.1, 0.16, 0.46, 0.85].map((f) => Math.floor(cnt * f));
    const cy = U.lin(C.cyan), bl = U.lin(C.blue), wh = U.lin(C.white), g2 = U.lin(C.gold2), am = U.lin(C.amber), cr = U.lin(C.cream), co = U.lin(C.copper);
    const fr = (v) => v - Math.floor(v), h = (k, s) => fr(Math.sin(k * 127.1 + s * 311.7) * 43758.5453);
    const one = stage === 1;
    for (let i = 0; i < cnt; i++) {
      const g1 = U.gauss(rnd), g2r = U.gauss(rnd), u = rnd();
      let q, s = 1.5, c, a;
      if (i < cut[0]) {
        const halo = u < 0.3, sg = halo ? 7 : 2.4, o = one ? GC : helAt('e', 0);
        q = [o[0] + g1 * sg, o[1] + g2r * sg]; c = halo ? bl : mx(cy, wh, 0.35); a = halo ? 0.003 : 0.012; s = 1.6;
      } else if (i < cut[1]) {
        const halo = u < 0.3, sg = (halo ? 14 : 4.5) * (one ? 1 : 1.4), o = one ? sunGeo(0) : GC;
        q = [o[0] + g1 * sg, o[1] + g2r * sg]; c = halo ? am : u > 0.95 ? wh : g2; a = halo ? 0.004 : 0.014; s = 1.6;
      } else if (i < cut[3]) {
        const b = i < cut[2] ? 'v' : 'm', o = one ? geoAt(b, 0) : helAt(b, 0);
        q = [o[0] + g1 * 2, o[1] + g2r * 2]; c = b === 'v' ? mx(cr, wh, 0.5) : mx(co, am, 0.4); a = 0.02; s = 1.6;
      } else if (i < cut[4]) {
        const t = (i - cut[3] + 0.5) / (cut[4] - cut[3]) - 1, back = one ? -t : fr(-t - 0.5);
        const o = one ? sunGeo(t) : helAt('e', t + 0.5);
        q = [o[0] + g1 * 0.8, o[1] + g2r * 0.8];
        c = one ? mx(g2, am, 0.15) : mx(cy, bl, 0.3); a = (one ? 0.03 : 0.012) + (one ? 0.08 : 0.06) * Math.exp(-back / 0.3);
      } else if (i < cut[6]) {
        const b = i < cut[5] ? 'v' : 'm', i0 = b === 'v' ? cut[4] : cut[5], i1 = b === 'v' ? cut[5] : cut[6];
        const t = -GSPAN[b] * (1 - (i - i0 + 0.5) / (i1 - i0)), near = Math.exp(t / (0.35 * GB[b][1])), a0 = b === 'v' ? 0.09 : 0.13;
        const o = one ? geoAt(b, t) : helAt(b, t);
        q = [o[0] + g1 * 0.8, o[1] + g2r * 0.8];

        a = one ? a0 * Math.pow(geoSpd(b, t) / GMEAN[b], 0.7) * (1 + 1.5 * Math.exp(t / 0.25)) : a0 * ((b === 'v' ? 0.03 : 0.045) + 2 * near);
        c = b === 'v' ? mx(cr, wh, near * 0.6) : mx(mx(co, am, 0.55), g2, near * 0.5);
      } else {
        const k = Math.floor(((i - cut[6]) / (cnt - cut[6])) * GSTAR), th = (TAU * (k + 0.5 + (h(k, 1) - 0.5) * 0.7)) / GSTAR, br = h(k, 2);
        let r = 430 + (h(k, 3) - 0.5) * 14;
        if (!one) {
          const ux = Math.cos(th), uy = -Math.sin(th);
          const ex = ux > 1e-6 ? (1920 - GC[0]) / ux : ux < -1e-6 ? (960 - GC[0]) / ux : 1e9, ey = uy > 1e-6 ? (1080 - GC[1]) / uy : uy < -1e-6 ? -GC[1] / uy : 1e9;
          r = 470 + Math.max(80, Math.min(ex, ey) - 350) * Math.pow(h(k, 4), 0.9);
        }
        const sg = one ? 0.9 : 0.7;
        q = [GC[0] + Math.cos(th) * r + g1 * sg, GC[1] - Math.sin(th) * r + g2r * sg];
        c = br > 0.85 ? wh : mx(cr, cy, h(k, 5));
        a = (0.006 + 0.03 * br * br) * (one ? 1 : Math.pow(470 / r, 0.3) * (q[0] < 1000 ? 0.35 : 1));
      }
      const p = wp(q[0], q[1]);
      P.add(p[0], p[1], 0, s, c[0], c[1], c[2], Math.min(1, a * ak), i / cnt);
    }
  });
  const GEOR = [1, 2].map(geoR);

  const glowMove = (S, sp, a, b, o = {}) => {
    if (!sp || sp.inert) return;
    const pa = S.at(a[0], a[1]), pb = S.at(b[0], b[1]), s0 = sp.size, s1 = o.size != null ? o.size : s0, pr = { v: 0 };
    const put = () => {
      const p = pr.v, e = p * p * p * (p * (p * 6 - 15) + 10);
      sp.x = pa[0] + (pb[0] - pa[0]) * e; sp.y = pa[1] + (pb[1] - pa[1]) * e; sp.size = s0 + (s1 - s0) * e;
    };
    T.to(pr, { v: 1 }, { dur: o.dur || 3.6, delay: o.delay || 0, ease: 'linear', onUpdate: put, onComplete: put });
  };
  KS.scene({
    id: 'geocentric', sec: 5, title: '人間中心主義は、現代の天動説', swarm: true, world: WORLD(), kf: [1, 3],
    build(S) {
      const d = S.data;
      prep(S, GEOR[1]);
      d.head = K.head(S, '人間中心主義は、\n{現代の天動説}', { eye: 'A MODERN GEOCENTRISM' });
      d.def = S.text('人間中心主義 ＝ 人間がずっと一番で、\n中心にいるのが当然、という見方', { cls: 'sans', size: 24, x: 120, y: 360, lh: 1.6, color: DIM });
      const row = (y, lab, main, sub) => [
        S.text(lab, { cls: 'sans', size: 24, x: 120, y, color: C.gold, ls: 0.12 }),
        S.text(main, { cls: 'serif', size: 32, x: 120, y: y + 36, color: C.white, ls: 0.04 }),
        S.text(sub, { cls: 'sans', size: 22, x: 120, y: y + 88, lh: 1.5, color: DIM }),
      ];
      d.r1 = row(476, '天動説', '地球が、宇宙の中心', '太陽も星も、地球のまわりを回っている。\nかつては、ほとんどの人がそう信じていた');
      d.r2 = row(660, '地動説', '地球は、太陽のまわりを回る惑星の一つ', '地球を中心から外したら、宇宙の見え方が広がった');
      d.glass = K.glass(S, { x: 110, y: 806, w: 700, h: 150 });
      d.k = S.text('人間も、中心から外してみると、\n{生命の歴史}の見え方が広がる', { cls: 'serif', size: 38, x: 146, y: 828, lh: 1.5, color: C.white, ls: 0.04 });

      const lab = (t, p, col, off = 24) => {
        const dx = p[0] - GC[0], dy = p[1] - GC[1], l = Math.hypot(dx, dy);
        if (l < 1) return K.label(S, t, { x: p[0], y: p[1] + off, size: 21, color: col, anchor: 'tc', ls: 0.1 });
        const c = dx / l, s = dy / l;
        return K.label(S, t, { x: p[0] + c * off, y: p[1] + s * off, size: 21, color: col, ls: 0.1, anchor: c > 0.5 ? 'cl' : c < -0.5 ? 'cr' : s < 0 ? 'bc' : 'tc' });
      };
      const star = (deg) => [GC[0] + Math.cos((deg * Math.PI) / 180) * 430, GC[1] - Math.sin((deg * Math.PI) / 180) * 430];
      d.l1 = [lab('地球', GC, C.cyan), lab('太陽', sunGeo(0), C.gold2), lab('金星', geoAt('v', 0), C.cream), lab('火星', geoAt('m', 0), C.amber), lab('星々', star(-20), C.dim, 16)];
      d.l2 = [lab('太陽', GC, C.gold2), lab('地球', helAt('e', 0), C.cyan), lab('金星', helAt('v', 0), C.cream), lab('火星', helAt('m', 0), C.amber)];
      d.cap1 = K.src(S, '図：地球を中心にして描いた、太陽・金星・火星の数年分の動き');
      d.cap2 = K.src(S, '図：同じ動きを、太陽を中心にして描き直したもの');
      const sg = sunGeo(0);
      d.sunG = K.glow(S, { x: sg[0], y: sg[1], size: 100, col: C.gold2 });
      d.earthG = K.glow(S, { x: GC[0], y: GC[1], size: 70, col: C.cyan });
    },
    steps: [
      (S) => {
        const d = S.data;
        d.head.in({ delay: 0 });
        K.show(d.def, { delay: 1.0 });
        K.sw(S, GEOR[0], { dur: 4, ord: 1, amt: 0.7, spread: 40, ease: 'out' });
        look(S, { size: 1.8, wob: 0.4 });
        glowTo(d.earthG, 0.5, { delay: 0.6 });
        glowTo(d.sunG, 0.4, { delay: 0.9 });
        K.each(d.r1, 0.25, (el, t) => K.show(el, { delay: t, dy: 8 }), 1.5);
        [1.0, 1.3, 1.6, 1.9, 3.6].forEach((t, i) => K.show(d.l1[i], { delay: t, dy: 6 }));
        K.show(d.cap1, { delay: 3.8, dy: 0 });
      },
      (S) => {
        const d = S.data;
        d.l1.forEach((el) => K.hide(el, { dur: 0.4 }));
        K.hide(d.cap1, { dur: 0.4 });
        d.r1.forEach((el) => K.fade(el, 0.4));
        K.sw(S, GEOR[1], { dur: 3.6, delay: 0.3, amt: 0, spread: 4 });
        look(S, { size: 1.8, wob: 0.4 });
        glowMove(S, d.sunG, sunGeo(0), GC, { delay: 0.3, size: 140 });
        glowMove(S, d.earthG, GC, helAt('e', 0), { delay: 0.3, size: 56 });
        glowTo(d.sunG, 0.5, { delay: 0.3, dur: 3.6 });
        glowTo(d.earthG, 0.35, { delay: 0.3, dur: 3.6 });
        K.show(d.r2[0], { delay: 0.6, dy: 8 });
        K.show(d.r2[1], { delay: 0.85 });
        K.show(d.r2[2], { delay: 3.4 });
        [3.8, 4.0, 4.2, 4.4].forEach((t, i) => K.show(d.l2[i], { delay: t, dy: 6 }));
        K.show(d.cap2, { delay: 4.2, dy: 0 });
      },
      (S) => {
        const d = S.data;
        d.r1.forEach((el) => K.fade(el, 0.3));
        d.r2.forEach((el) => K.fade(el, 0.55));
        K.pop(d.glass, { delay: 0.3 });
        K.show(d.k, { delay: 0.6 });
        TX.glint(d.k, { delay: 1.8 });
        look(S, { size: 1.8, wob: 0.4, i: 0.85 }, 1.6);
      },
    ],
  });

  const stX = (i) => 280 + 127 * i, stY = (i) => 900 - 62 * i;
  const ST_TIME = ['約40億年前', '約20億年前', '十数億年前', '約5億年前', '1億年余り前', '数十万年前', '約5千年前', '約5百年前', '数十年前', 'いま', '次'];
  const ST_NAME = ['細胞', '小器官を\n持つ細胞', '多細胞の体', '神経・脳・目', '群れ', '言葉', '都市と文字', '活版印刷・\n科学', '計算機と\nインターネット', 'AI', '超知能・\n人工超社会'];
  const stR = (stage) => fnR('s5:stairs' + stage, 5111, (P, cnt, rnd) => {
    const ak = 65536 / cnt, am = U.lin(C.amber), g2 = U.lin(C.gold2), cy = U.lin(C.cyan), wh = U.lin(C.white);
    for (let j = 0; j < cnt; j++) {
      const g1 = U.gauss(rnd), g2r = U.gauss(rnd), u = rnd();
      const f = (j + 0.5) * 11 / cnt, i = Math.min(10, Math.floor(f)), s = (f - i) * 189, aux = f / 11;
      const x0 = stX(i), y0 = stY(i), rise = i === 0 ? 62 : 62;
      const bx = s < rise ? x0 : x0 + (s - rise), by = s < rise ? y0 + rise - s : y0;
      if (stage === 1 && i >= 9) { PARK(P, 1423 + g1 * 3, 342 + g2r * 3, cy, aux); continue; }
      const halo = u < 0.15, hot = u > 0.992, sg = halo ? 6 : 0.9;
      const p = wp(bx + g1 * sg, by + g2r * sg);
      let c = i <= 8 ? mx(am, g2, i / 8) : cy, a = 0.06;
      if (halo) a *= 0.3;
      if (hot) (a *= 4), (c = i <= 8 ? wh : cy);
      if (i === 10) { a *= 0.7; if (Math.floor(s / 10) % 2) a = 0; }
      P.add(p[0], p[1], 0, hot ? 2.2 : 1.5, c[0], c[1], c[2], Math.min(1, a * ak), aux);
    }
  });
  const STR = [1, 2].map(stR);

  const RG_R = [60, 130, 200, 270, 340, 410], RG_NAME = ['分子', '細胞', '体', '群れ', '社会', '次'];
  const RINGR = fnR('s5:rings', 5112, (P, cnt, rnd) => {
    const ak = 65536 / cnt, am = U.lin(C.amber), g2 = U.lin(C.gold2), cy = U.lin(C.cyan), tot = RG_R.reduce((a, b) => a + b, 0);
    const cut = []; let acc = 0;
    RG_R.forEach((r) => { acc += r / tot; cut.push(acc); });
    for (let j = 0; j < cnt; j++) {
      const g1 = U.gauss(rnd), g2r = U.gauss(rnd), u = rnd();
      const f = (j + 0.5) / cnt;
      let k = 0;
      while (k < 5 && f > cut[k]) k++;
      const f0 = k ? cut[k - 1] : 0, v = (f - f0) / (cut[k] - f0), r = RG_R[k], th = Math.PI / 2 - TAU * v;
      const halo = u < 0.15, sg = halo ? 5 : 0.9;
      const x = Math.cos(th) * r + g1 * sg, y = Math.sin(th) * r + g2r * sg;
      const c = k < 5 ? mx(am, g2, k / 4) : cy;
      let a = 0.12;
      if (halo) a *= 0.3;
      if (k === 5 && Math.floor(v * 96) % 2) a = 0;
      P.add(x, y, 0, 1.5, c[0], c[1], c[2], Math.min(1, a * ak), f);
    }
  });
  KS.scene({
    id: 'stairs', sec: 5, title: '生命は、主役を乗り換えてきた', swarm: true, world: WORLD(), kf: [2, 3],
    build(S) {
      const d = S.data;
      prep(S, STR[1]); prep(S, RINGR);
      d.head = K.head(S, '生命は、主役を乗り換えてきた', { eye: 'STAIRS OF LIFE' });
      d.src = K.src(S, '図：情報を扱う単位と手段の階段（抜粋）');
      d.lab = ST_TIME.map((t, i) => {
        const col = i >= 9 ? C.cyan : C.gold;
        return [K.label(S, t, { x: stX(i) + 10, y: stY(i) + 12, size: 18, color: col, ls: 0.06 }),
          S.text(ST_NAME[i], { cls: 'sans', size: 22, x: stX(i) + 10, y: stY(i) + 34, lh: 1.3, color: i >= 9 ? C.cyan : C.cream })];
      });
      d.br = K.svg(S, {});
      d.brl = K.undrawn(K.path(d.br, 'M901 562L895 549L1403 301L1409 314', ''));
      d.brt = S.text('社会', { cls: 'serif', size: 30, x: 1128, y: 398, anchor: 'cc', color: C.gold, ls: 0.2 });
      d.glow = K.glow(S, { x: 1486, y: 342, size: 140, col: C.cyan });
      d.rl = RG_NAME.map((t, k) => S.text(t, { cls: 'sans', size: 20, x: 1340, y: 560 - RG_R[k] + 18, anchor: 'tc', color: k === 5 ? C.cyan : C.gold2, ls: 0.1 }));
      d.k1 = S.text('前の段は、消えない', { cls: 'serif', size: 52, x: 120, y: 330, color: C.white, ls: 0.05 });
      d.k2 = S.text('今も単細胞の生き物はいっぱいいるし、\n私たちの体の中にも細胞がある', { cls: 'sans', size: 30, x: 120, y: 440, lh: 1.7, color: DIM });
      d.k3 = S.text('昨日まで全体だったものが、\n今日の部分になる', { cls: 'serif', size: 44, x: 120, y: 620, lh: 1.55, color: C.gold2, ls: 0.05 });
    },
    steps: [
      (S) => {
        const d = S.data;
        d.head.in({ delay: 0 });
        K.show(d.src, { delay: 0.8, dy: 0 });
        K.sw(S, STR[0], { dur: 6, ord: 1, amt: 0.8, spread: 60, ease: 'out' });
        look(S, { i: 1.1, wob: 0.5 });
        for (let i = 0; i < 9; i++) { K.show(d.lab[i][0], { delay: 0.5 + 0.436 * i, dy: 6 }); K.show(d.lab[i][1], { delay: 0.65 + 0.436 * i, dy: 6 }); }
        K.draw(d.brl, { delay: 5, dur: 1.4 });
        K.show(d.brt, { delay: 5.6 });
      },
      (S) => {
        const d = S.data;
        K.sw(S, STR[1], { dur: 2.2, ord: 0, amt: 0.3, spread: 30, ease: 'out' });
        look(S, { i: 1.1, wob: 0.5 });
        for (let i = 9; i < 11; i++) { K.show(d.lab[i][0], { delay: 0.4 + 0.6 * (i - 9), dy: 6 }); K.show(d.lab[i][1], { delay: 0.55 + 0.6 * (i - 9), dy: 6 }); }
        glowTo(d.glow, 0.7, { delay: 0.4, dur: 1.6 });
      },
      (S) => {
        const d = S.data;
        d.lab.forEach((l) => { K.hide(l[0]); K.hide(l[1]); });
        K.fade(d.br, 0, { dur: 0.6 }); K.hide(d.brt); K.hide(d.src); glowTo(d.glow, 0, { dur: 0.8 });
        K.sw(S, RINGR, { x: 1340, y: 560, dur: 3.2, delay: 0.2, ord: 1, amt: 0.5, spread: 80, swirl: 0.3, ease: 'out' });
        look(S, { i: 1.1, wob: 0.5 });
        K.each(d.rl, 0.25, (el, t) => K.show(el, { delay: t, dy: 6 }), 1.6);
        K.show(d.k1, { delay: 0.6 });
        K.show(d.k2, { delay: 1.4 });
        K.show(d.k3, { delay: 3.2 });
        TX.glint(d.k3, { delay: 4.4 });
      },
    ],
  });

  const MI = [1466, 540], MI_TIP = [[1500, 200], [1660, 170], [1800, 250]];
  const miR = (stage) => fnR('s5:mito' + stage, 5121, (P, cnt, rnd) => {
    const ak = 65536 / cnt, am = U.lin(C.amber), g2 = U.lin(C.gold2), wh = U.lin(C.white);
    const n1 = Math.floor(cnt * 0.4), n2 = Math.floor(cnt * 0.85);
    for (let j = 0; j < cnt; j++) {
      const g1 = U.gauss(rnd), g2r = U.gauss(rnd), u = rnd(), u2 = rnd();
      if (j < n1) {

        const th = TAU * u, r = 1 + 0.15 * g1, aux = 0.3 * (j + 0.5) / n1;
        let x = MI[0] + Math.cos(th) * 200 * r, y = MI[1] + Math.sin(th) * 140 * r, a = 0.05;
        if (stage >= 2 && u2 >= 0.1) { const out = 150 + 250 * Math.abs(g2r) / 2; x += Math.cos(th) * out; y += Math.sin(th) * out * 0.8; a = 0; }
        else if (stage >= 2) a = 0.03;
        const p = wp(x, y), c = mx(am, g2, u2);
        P.add(p[0], p[1], 0, 1.5, c[0], c[1], c[2], Math.min(1, a * ak), aux);
      } else if (j < n2) {

        const v = (j - n1 + 0.5) / (n2 - n1), k = Math.min(2, Math.floor(v * 3)), t = v * 3 - k, aux = 0.3 + 0.7 * t;
        if (stage < 3) { PARK(P, MI[0] + g1 * 4, MI[1] + g2r * 4, g2, aux); continue; }
        const b = bez(MI, [1480, 470], [1530, 400], MI_TIP[k], t), w = 2 + 10 * (1 - t), hot = u > 0.99 || (t > 0.97 && u > 0.6);
        const p = wp(b[0] + g1 * w * 0.5, b[1] + g2r * w * 0.5), c = hot ? wh : mx(am, g2, t);
        P.add(p[0], p[1], 0, hot ? 2.2 : 1.5, c[0], c[1], c[2], Math.min(1, (hot ? 0.45 : 0.11) * ak), aux);
      } else PARK(P, MI[0] + g1 * 3, MI[1] + g2r * 3, am, 1);
    }
  });
  const MIR = [1, 2, 3].map(miR);
  KS.scene({
    id: 'mito', sec: 5, title: 'ミトコンドリアは、もとは独立した細菌だった', swarm: true, world: WORLD(), images: ['symbiosis'],
    build(S) {
      const d = S.data;
      MIR.slice(1).forEach((R) => prep(S, R));
      d.bg = K.photo(S, 'symbiosis', { z: -1200, w: 2200, fe: 90, exp: 0.75 });
      d.glow = K.glow(S, { x: MI[0], y: MI[1], size: 260, col: C.amber });
      d.scrim = S.div({ x: 0, y: 0, w: 1100, h: 1080 });
      d.scrim.style.background = 'linear-gradient(90deg, rgba(5,7,13,.78) 0%, rgba(5,7,13,.55) 60%, rgba(5,7,13,0) 100%)';
      d.h = K.h(S, 'ミトコンドリアは、\nもとは独立した細菌だった', { y: 150 });
      d.body = S.text('私たちの細胞の中で、エネルギーを取り出しているもの', { cls: 'sans', size: 30, x: 120, y: 368, color: DIM });
      d.r1 = pathRow(S, { y: 520, tone: 'dim', lw: 300, aw: 240, title: '独立した細菌の視点', a: '自由生活の細菌', verb: '細胞内共生', b: '自律を手放す\n遺伝子の大半を手放す' });
      d.r2 = pathRow(S, { y: 730, lw: 300, aw: 240, title: '生命史の視点', a: '入り込んだ細菌', verb: '真核細胞の誕生', b: '多細胞化・脳・社会', bcol: C.gold2 });
      d.tips = ['多細胞の体', '脳', '社会'].map((t, k) => S.text(t, { cls: 'serif', size: 30, x: MI_TIP[k][0], y: MI_TIP[k][1] - 22, anchor: 'bc', color: C.gold2, ls: 0.1 }));
    },
    steps: [
      (S) => {
        const d = S.data;
        K.reveal(d.bg, { dur: 2.6 });
        K.drift(S, d.bg, { zoom: 1.03, px: 0 });
        K.fade(d.scrim, 1, { dur: 1.6 });
        glowTo(d.glow, 0.45, { delay: 1.2, dur: 2 });
        K.sw(S, MIR[0], { dur: 2.8, delay: 0.6, ord: 1, amt: 0.6, spread: 60, ease: 'out' });
        look(S, { i: 1, wob: 1.2, wobF: 0.4 });
        K.show(d.h, { delay: 0.4 });
        K.show(d.body, { delay: 1.2 });
      },
      (S) => {
        const d = S.data;
        d.r1.in(0.2);
        K.sw(S, MIR[1], { dur: 3.2, delay: 0.8, ord: 0, amt: 0.5, spread: 0, ease: 'out' });
        look(S, { i: 1, wob: 1.2, wobF: 0.4 });
        glowTo(d.glow, 0.3, { dur: 2 });
      },
      (S) => {
        const d = S.data;
        d.r1.dim(0.4);
        d.r2.in(0.2);
        K.sw(S, MIR[2], { dur: 3.6, delay: 0.6, ord: 1, amt: 0.8, spread: 0, ease: 'out' });
        look(S, { i: 1.2, wob: 0.6, wobF: 0.4 });
        glowTo(d.glow, 0.7, { delay: 0.4, dur: 1.6 });
        K.each(d.tips, 0.3, (el, t) => K.show(el, { delay: t, dy: 8 }), 3.2);
      },
    ],
  });

  const frX = (i) => 160 + 115 * i, frY = (i) => 900 - 52 * i;
  const frR = (stage) => fnR('s5:final' + stage, 5131, (P, cnt, rnd) => {
    const ak = 65536 / cnt, am = U.lin(C.amber), g2 = U.lin(C.gold2), cy = U.lin(C.cyan), st = U.lin(C.dim), wh = U.lin(C.white);
    const n1 = Math.floor(cnt * 0.6);
    for (let j = 0; j < cnt; j++) {
      const g1 = U.gauss(rnd), g2r = U.gauss(rnd), u = rnd(), u2 = rnd();
      if (j < n1) {
        const f = (j + 0.5) * 9 / n1, i = Math.min(8, Math.floor(f)), s = (f - i) * 167, aux = 0.6 * f / 9;
        const bx = s < 52 ? frX(i) : frX(i) + (s - 52), by = s < 52 ? frY(i) + 52 - s : frY(i);
        const halo = u < 0.15, hot = u > 0.993, sg = halo ? 6 : 0.9;
        const p = wp(bx + g1 * sg, by + g2r * sg), c = hot ? wh : mx(am, g2, i / 8);
        P.add(p[0], p[1], 0, hot ? 2.2 : 1.5, c[0], c[1], c[2], Math.min(1, (hot ? 0.18 : halo ? 0.016 : 0.05) * ak), aux);
      } else {
        const v = (j - n1 + 0.5) / (cnt - n1), aux = 0.6 + 0.4 * v;
        if (stage === 1) {

          const edge = u < 0.3, x = 1080 + 720 * v, y = edge ? (u2 < 0.5 ? 400 : 410) + g1 * 0.8 : 400 + 10 * u2;
          const p = wp(x, y);
          P.add(p[0], p[1], 0, 1.5, st[0], st[1], st[2], Math.min(1, (edge ? 0.12 : 0.035) * ak), aux);
        } else {

          const f = v * 5, k = Math.min(4, Math.floor(f)) + 1, s = (f - k + 1) * 167;
          const x0 = 1080 + 115 * k, y0 = 484 - 52 * k;
          const bx = s < 52 ? x0 : x0 + (s - 52), by = s < 52 ? y0 + 52 - s : y0, halo = u < 0.15, sg = halo ? 6 : 0.9;
          let a = (halo ? 0.016 : 0.05) * (1 - 0.15 * (k - 1));
          if (k >= 4 && Math.floor(s / 10) % 2) a = 0;
          const p = wp(bx + g1 * sg, by + g2r * sg);
          P.add(p[0], p[1], 0, 1.5, cy[0], cy[1], cy[2], Math.min(1, a * ak), aux);
        }
      }
    }
  });
  const FRR = [1, 2].map(frR);
  KS.scene({
    id: 'finalrule', sec: 5, title: 'そして、人間が出てきた', swarm: true, world: WORLD(),
    build(S) {
      const d = S.data;
      prep(S, FRR[1]);
      d.h = K.h(S, 'そして、人間が出てきた');
      d.man = S.text('人間', { cls: 'serif', size: 30, x: 1137, y: 470, anchor: 'bc', color: C.gold2, ls: 0.2 });
      d.glass = K.glass(S, { x: 1223, y: 166, w: 576, h: 206 });
      d.glass.style.borderColor = 'rgba(140,147,166,.5)';
      d.glass.style.background = 'rgba(13,24,48,.55)';
      d.ne = K.eyebrow(S, 'NEW RULE', { x: 1262, y: 198 });
      d.ne.style.color = C.dim;
      d.nt = S.text('ここで完成。\nこの先、人間を超えてはならない', { cls: 'serif', size: 36, x: 1262, y: 234, lh: 1.5, color: C.cream });
      d.nc = S.text('急に追加されたルール', { cls: 'sans', size: 20, x: 1223, y: 428, color: C.dim, ls: 0.08 });
      d.t1 = S.text('人間が素晴らしくない、という話ではない', { cls: 'sans', size: 30, x: 120, y: 290, color: DIM });
      d.t2 = S.text('人間のようなものまで出てきたのなら、\nその先にも、また全然違うものが\n出てきていい', { cls: 'serif', size: 42, x: 120, y: 352, lh: 1.55, color: C.gold2, ls: 0.04 });
    },
    steps: [
      (S) => {
        const d = S.data;
        K.show(d.h, { delay: 0 });
        K.sw(S, FRR[0], { dur: 4.2, ord: 1, amt: 0.8, spread: 50, ease: 'out' });
        look(S, { i: 1.1, wob: 0.5 });
        K.show(d.man, { delay: 2.8, dy: 8 });
        K.pop(d.glass, { delay: 4.0 });
        K.show(d.ne, { delay: 4.3, dy: 6 });
        K.show(d.nt, { delay: 4.5 });
        K.show(d.nc, { delay: 5.2, dy: 6 });
      },
      (S) => {
        const d = S.data;
        [d.glass, d.ne, d.nt, d.nc].forEach((el) => K.hide(el, { blur: 10 }));
        K.sw(S, FRR[1], { dur: 3.4, delay: 0.5, ord: 1, amt: 0.7, spread: 20, ease: 'out' });
        look(S, { i: 1.1, wob: 0.5 });
        K.show(d.t1, { delay: 0.4 });
        K.show(d.t2, { delay: 1.4 });
        TX.glint(d.t2, { delay: 3.2 });
      },
    ],
  });

  const YOU = [1240, 560], CE_WORDS = ['言葉', '文字', '数', '道具', '名前', '問い'];
  const CE_CL = [[900, 300, '科学'], [1650, 420, '市場'], [1150, 860, '言葉']];
  let ceNetC = null;
  const ceNet = () => {
    if (ceNetC) return ceNetC;
    const r = U.rng(5142), N = [[YOU[0], YOU[1]]];
    for (let i = 0; i < 220; i++) {
      if (r() < 0.42) { const c = CE_CL[i % 3]; N.push([c[0] + U.gauss(r) * 75, c[1] + U.gauss(r) * 60]); }
      else N.push([700 + r() * 1150, 150 + r() * 800]);
    }
    const E = [], seen = {};
    N.forEach((a, i) => {
      const ds = N.map((b, j) => [Math.hypot(a[0] - b[0], a[1] - b[1]), j]).filter((x) => x[1] !== i).sort((x, y) => x[0] - y[0]);
      const k = i === 0 ? 6 : 2 + (i % 2);
      for (let q = 0; q < k; q++) { const j = ds[q][1], key = Math.min(i, j) + '-' + Math.max(i, j); if (!seen[key]) (seen[key] = 1), E.push([i, j, ds[q][0]]); }
    });
    const L = [0];
    E.forEach((e) => L.push(L[L.length - 1] + e[2]));
    return (ceNetC = { N, E, L });
  };
  const ceAux = (x, y) => 0.03 + 0.97 * Math.min(1, Math.hypot(x - YOU[0], y - YOU[1]) / 900);
  const ceR = (stage) => fnR('s5:cells' + stage, 5141, (P, cnt, rnd) => {
    const ak = 65536 / cnt, am = U.lin(C.amber), g2 = U.lin(C.gold2), cr = U.lin(C.cream), net = ceNet();
    const n0 = Math.floor(cnt * 0.03), n1 = Math.floor(cnt * 0.15), tot = net.L[net.L.length - 1], dimK = stage === 3 ? 0.35 : 1;
    for (let j = 0; j < cnt; j++) {
      const g1 = U.gauss(rnd), g2r = U.gauss(rnd), u = rnd(), u2 = rnd();
      if (j < n0) {
        const p = wp(YOU[0] + g1 * 6, YOU[1] + g2r * 6);
        P.add(p[0], p[1], 0, 2, g2[0], g2[1], g2[2], Math.min(1, 0.3 * dimK * ak), (0.03 * j) / n0);
        continue;
      }

      const v = (j - n0 + 0.5) / (cnt - n0);
      let x, y, a, c, s = 1.4;
      if (u < 0.25) {
        const nd = net.N[Math.floor(v * net.N.length)];
        x = nd[0] + g1 * 2.5; y = nd[1] + g2r * 2.5; a = 0.12; c = mx(g2, cr, u2); s = 1.8;
      } else {
        const L = v * tot;
        let lo = 0, hi = net.E.length - 1;
        while (lo < hi) { const m = (lo + hi) >> 1; if (net.L[m + 1] < L) lo = m + 1; else hi = m; }
        const e = net.E[lo], A = net.N[e[0]], B = net.N[e[1]], t = (L - net.L[lo]) / Math.max(1e-6, e[2]);
        x = A[0] + (B[0] - A[0]) * t + g1 * 0.8; y = A[1] + (B[1] - A[1]) * t + g2r * 0.8; a = 0.3; c = mx(am, g2, u2);
      }
      const aux = ceAux(x, y);
      if (stage === 1) {
        if (j < n1) {

          const k = j % 6, th = -Math.PI / 2 + (TAU * k) / 6, rr = 20 + 210 * u2, p = wp(YOU[0] + Math.cos(th) * rr + g1, YOU[1] + Math.sin(th) * rr + g2r);
          P.add(p[0], p[1], 0, 1.5, g2[0], g2[1], g2[2], Math.min(1, 0.12 * ak), aux);
        } else PARK(P, YOU[0] + g1 * 4, YOU[1] + g2r * 4, g2, aux);
        continue;
      }
      const p = wp(x, y);
      P.add(p[0], p[1], 0, s, c[0], c[1], c[2], Math.min(1, a * (stage === 3 ? 0.06 + 0.29 * U.smooth(950, 1300, x) : 1) * ak), aux);
    }
  });
  const CER = [1, 2, 3].map(ceR);
  KS.scene({
    id: 'cells', sec: 5, title: '私たちはすでに、より大きな存在の細胞である', swarm: true, kf: [3, 4],
    world: Object.assign(WORLD(), { cam: { x: 70, y: 0, z: -400 } }),
    build(S) {
      const d = S.data;
      CER.slice(1).forEach((R) => prep(S, R));
      d.flat = S.flat();
      d.h = K.h(S, '私たちはすでに、\nより大きな存在の細胞である', { layer: d.flat });
      d.b1 = S.text('自分の頭で考えている。\nでも、その言葉は誰が作った？', { layer: d.flat, cls: 'serif', size: 40, x: 120, y: 420, lh: 1.6, color: C.cream, ls: 0.04 });
      d.glow = K.glow(S, { x: YOU[0], y: YOU[1], size: 120, col: C.gold2 });
      d.words = CE_WORDS.map((t, k) => { const th = -Math.PI / 2 + (TAU * k) / 6; return S.text(t, { cls: 'serif', size: 26, x: YOU[0] + Math.cos(th) * 262, y: YOU[1] + Math.sin(th) * 262, anchor: 'cc', color: C.gold2, ls: 0.12 }); });
      d.cl = CE_CL.map((c) => S.text(c[2], { cls: 'serif', size: 30, x: c[0], y: c[1] - 120, anchor: 'bc', color: C.gold2, ls: 0.2 }));
      d.b2 = S.text('科学も、市場も、言葉も、\n一人より{大きな知性}', { layer: d.flat, cls: 'serif', size: 40, x: 120, y: 420, lh: 1.6, color: C.cream, ls: 0.04 });
      d.b3 = S.text('国や偉い人ではなく、\n無数の人のやりとりが積み上がった働き', { layer: d.flat, cls: 'sans', size: 28, x: 120, y: 600, lh: 1.7, color: DIM });
      d.q = K.quote(S, '私たちは細胞である。\nそして細胞は、\n自分が何の一部であるかを知らない。', { x: 240, y: 420, size: 50, src: '『人類という通過点』より' });

      d.k0 = S.text('1年前、この講演の場「感動セッション」で、木村克彦さんと対談した時のこと。\n私が「AIを加速することは、人類の夢、生命の夢、宇宙の夢に直結する」と話すと、', { cls: 'sans', size: 24, x: 240, y: 336, lh: 1.6, color: DIM });
      d.k = K.quote(S, 'その一部にみんな一人一人がなれてるって考えると、\nすごくワクワクしますよね', { x: 240, y: 452, size: 44, src: '木村克彦さん（感動セッション主宰）' });
      d.k2 = S.text('今日の話は、その「一部」が何なのかを、生命の歴史の側から考えたもの', { cls: 'sans', size: 28, x: 240, y: 710, color: C.gold });
    },
    steps: [
      (S) => {
        const d = S.data;
        K.show(d.h, { delay: 0.2 });
        K.sw(S, CER[0], { dur: 2.6, delay: 0.3, ord: 0, amt: 0.5, spread: 60, ease: 'out' });
        look(S, { i: 1.1, wob: 0.8 });
        glowTo(d.glow, 0.7, { delay: 0.6, dur: 1.6 });
        K.each(d.words, 0.18, (el, t) => K.show(el, { delay: t, dy: 0, blur: 10 }), 1.0);
        K.show(d.b1, { delay: 1.8 });
      },
      (S) => {
        const d = S.data;
        S.cam({ x: 0, y: 0, z: 0 }, { dur: 3.4 });
        d.words.forEach((el) => K.hide(el));
        K.hide(d.b1);
        glowTo(d.glow, 0.35, { dur: 2 });
        K.sw(S, CER[1], { dur: 4.2, delay: 0.3, ord: 1, amt: 0.8, spread: 30, ease: 'out' });
        look(S, { i: 1.1, wob: 0.8 });
        K.each(d.cl, 0.3, (el, t) => K.show(el, { delay: t, dy: 8 }), 2.6);
        K.show(d.b2, { delay: 1.2 });
        K.show(d.b3, { delay: 2.4 });
      },
      (S) => {
        const d = S.data;
        [d.b2, d.b3].forEach((el) => K.hide(el));
        d.cl.forEach((el) => K.fade(el, 0.3));
        glowTo(d.glow, 0.15, { dur: 1.6 });
        K.sw(S, CER[2], { dur: 1.8, ord: 0, amt: 0.3, spread: 0, ease: 'out' });
        look(S, { i: 1, wob: 0.8 });
        d.q.in({ delay: 0.6 });
      },
      (S) => {
        const d = S.data;
        [d.q.bar, d.q.text, d.q.src].forEach((el) => el && K.hide(el));
        K.sw(S, CER[2], { dur: 1.2, ord: 0, amt: 0.3, spread: 0, ease: 'out' });
        K.show(d.k0, { delay: 0.4, dy: 8 });
        d.k.in({ delay: 1.0 });
        K.show(d.k2, { delay: 2.6 });
      },
    ],
  });

  const AI_C = [1360, 560];
  const AI_HUB = [[1360, 560], [1240, 440], [1480, 440], [1480, 680], [1240, 680]];
  const AI_ROLE = ['編成', '調べる', '作る', '批判する', 'まとめる'];

  const netPt = (v, u, g1, g2r) => {
    const net = ceNet(), tot = net.L[net.L.length - 1];
    if (u < 0.25) { const nd = net.N[Math.floor(v * net.N.length)]; return [nd[0] + g1 * 2.5, nd[1] + g2r * 2.5, 0.12, 1.8, 1]; }
    const L = v * tot;
    let lo = 0, hi = net.E.length - 1;
    while (lo < hi) { const m = (lo + hi) >> 1; if (net.L[m + 1] < L) lo = m + 1; else hi = m; }
    const e = net.E[lo], A = net.N[e[0]], B = net.N[e[1]], t = (L - net.L[lo]) / Math.max(1e-6, e[2]);
    return [A[0] + (B[0] - A[0]) * t + g1 * 0.8, A[1] + (B[1] - A[1]) * t + g2r * 0.8, 0.3, 1.4, 0];
  };

  const AIR = fnR('s5:ai', 5151, (P, cnt, rnd) => {
    const ak = 65536 / cnt, am = U.lin(C.amber), g2 = U.lin(C.gold2), cr = U.lin(C.cream), cy = U.lin(C.cyan), wh = U.lin(C.white);
    const nc = Math.floor(cnt * 0.25);
    for (let j = 0; j < cnt; j++) {
      const g1 = U.gauss(rnd), g2r = U.gauss(rnd), u = rnd(), u2 = rnd(), u3 = rnd();
      if (j >= nc) {
        const q = netPt((j - nc + 0.5) / (cnt - nc), u, g1, g2r), c = q[4] ? mx(g2, cr, u2) : mx(am, g2, u2), p = wp(q[0], q[1]);

        P.add(p[0], p[1], 0, q[3], c[0], c[1], c[2], Math.min(1, q[2] * (0.06 + 0.29 * U.smooth(950, 1300, q[0])) * ak), 0.75 * Math.min(1, Math.hypot(q[0] - AI_C[0], q[1] - AI_C[1]) / 900));
        continue;
      }
      let x, y, a, s = 1.5;
      const c = mx(cy, wh, u2 * 0.4), f = j / nc;
      if (f < 0.5) {

        const h = AI_HUB[j % 5];
        if (u < 0.55) { x = h[0] + g1 * 10; y = h[1] + g2r * 10; a = 0.16; s = 1.8; }
        else { const th = TAU * u3; x = h[0] + Math.cos(th) * 26 + g1 * 0.8; y = h[1] + Math.sin(th) * 26 + g2r * 0.8; a = 0.2; }
      } else if (f < 0.75) {

        const h = AI_HUB[1 + (j % 4)], t = 0.12 + 0.76 * u3;
        x = AI_C[0] + (h[0] - AI_C[0]) * t + g1 * 0.7; y = AI_C[1] + (h[1] - AI_C[1]) * t + g2r * 0.7; a = 0.15;
      } else {

        const k = j % 4, A = AI_HUB[1 + k], B = AI_HUB[1 + ((k + 1) % 4)], t = 0.1 + 0.8 * u3;
        x = A[0] + (B[0] - A[0]) * t + g1 * 0.7; y = A[1] + (B[1] - A[1]) * t + g2r * 0.7; a = 0.18;
      }
      const p = wp(x, y);
      P.add(p[0], p[1], 0, s, c[0], c[1], c[2], Math.min(1, a * ak), 0.75 + 0.25 * u3);
    }
  });

  const SU_X = [200, 480, 760, 1040, 1320], SU_Y = 470, SU_AI = [1660, 470];
  const SU_NAME = ['分子', '細胞', '体', '群れ', '社会'];
  let suShC = null;
  const suShapes = () => {
    if (suShC) return suShC;
    const r = U.rng(5162), hex = [[0, 0]];
    for (let k = 0; k < 6; k++) hex.push([Math.cos((TAU * k) / 6) * 30, Math.sin((TAU * k) / 6) * 30]);
    for (let k = 0; k < 12; k++) { const rr = k % 2 ? 52 : 60, th = (TAU * k) / 12; hex.push([Math.cos(th) * rr, Math.sin(th) * rr]); }
    const disc = (n, R) => Array.from({ length: n }, () => { const a = TAU * r(), q = R * Math.sqrt(0.08 + 0.92 * r()); return [Math.cos(a) * q, Math.sin(a) * q]; });
    const graph = (N, k) => {
      const E = [], seen = {}, L = [0];
      N.forEach((a, i) => N.map((b, j) => [Math.hypot(a[0] - b[0], a[1] - b[1]), j]).filter((x) => x[1] !== i).sort((x, y) => x[0] - y[0]).slice(0, k)
        .forEach(([dd, j]) => { const key = Math.min(i, j) + '-' + Math.max(i, j); if (!seen[key]) (seen[key] = 1), E.push([i, j, dd]); }));
      E.forEach((e) => L.push(L[L.length - 1] + e[2]));
      return { N, E, L };
    };
    return (suShC = { hex, org: disc(7, 46), soc: graph(disc(22, 82), 2), net: graph(disc(90, 165), 3) });
  };

  const onEdge = (G, v) => {
    const L = v * G.L[G.L.length - 1];
    let lo = 0, hi = G.E.length - 1;
    while (lo < hi) { const m = (lo + hi) >> 1; if (G.L[m + 1] < L) lo = m + 1; else hi = m; }
    const e = G.E[lo], A = G.N[e[0]], B = G.N[e[1]], t = (L - G.L[lo]) / Math.max(1e-6, e[2]);
    return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A, lo, t];
  };
  const suR = (stage) => fnR('s5:super' + stage, 5161, (P, cnt, rnd) => {
    const ak = 65536 / cnt, g2 = U.lin(C.gold2), cr = U.lin(C.cream), cy = U.lin(C.cyan), wh = U.lin(C.white), bl = U.lin(C.blue), sh = suShapes();
    const ni = 0.09 * cnt, n1 = 0.45 * cnt, n2 = 0.85 * cnt;
    const socA = Math.min(0.3, (1.2 * sh.soc.L[sh.soc.L.length - 1]) / (65536 * 0.09 * 0.7));
    const netA = Math.min(0.3, (1.2 * sh.net.L[sh.net.L.length - 1]) / (65536 * 0.4 * 0.65));
    const ring = (R, f) => [Math.cos(TAU * f) * R, Math.sin(TAU * f) * R];
    for (let j = 0; j < cnt; j++) {
      const g1 = U.gauss(rnd), g2r = U.gauss(rnd), u = rnd(), u2 = rnd(), u3 = rnd();
      let x, y, a, s = 1.5, c = mx(g2, cr, u2 * 0.5), aux;
      if (j < n1) {

        const k = Math.min(4, Math.floor(j / ni)), fl = (j - k * ni) / ni, out = u < 0.5;
        let q, o = [0, 0];
        aux = k / 6 + 0.1 * u3;
        if (k === 0) {
          if (fl < 0.3) { q = out ? ring(18, u3) : [g1 * 7, g2r * 7]; a = out ? 0.15 : 0.12; }
          else if (fl < 0.7) { o = ring(50, (j % 4) / 4 + 0.125); q = out ? ring(12, u3) : [g1 * 5, g2r * 5]; a = out ? 0.3 : 0.18; }
          else { const t = 19 + 20 * u3, e = ring(1, (j % 4) / 4 + 0.125); q = [e[0] * t + g1 * 0.6, e[1] * t + g2r * 0.6]; a = 0.055; }
        } else if (k === 1) {
          if (fl < 0.4) { const rr = 70 + 3 * Math.sin(TAU * u3 * 5); q = ring(rr, u3); a = 0.22; }
          else if (fl < 0.65) { q = out ? ring(20, u3) : [g1 * 8, g2r * 8]; a = out ? 0.2 : 0.19; }
          else if (fl < 0.85) { o = sh.org[j % 7]; q = [g1 * 4, g2r * 4]; a = 0.2; }
          else { q = ring(62 * Math.sqrt(u), u3); a = 0.2; }
        } else if (k === 2) {
          o = sh.hex[j % 19]; q = fl < 0.8 ? ring(12.5, u3) : [g1 * 3, g2r * 3]; a = 0.3;
        } else if (k === 3) {
          const m = j % 6;
          if (m) o = ring(48, m / 5);
          q = fl < 0.6 ? ring(16, u3) : [g1 * 4, g2r * 4]; a = fl < 0.6 ? 0.2 : 0.1;
        } else {
          if (fl < 0.3) { o = sh.soc.N[j % 22]; q = [g1 * 3, g2r * 3]; a = 0.25; }
          else { const e = onEdge(sh.soc, (fl - 0.3) / 0.7); q = [e[0] + g1 * 0.7, e[1] + g2r * 0.7]; a = socA; }
          c = mx(g2, wh, u2 * 0.3);
        }
        if (stage === 2 && k < 4) a *= 0.55;
        x = SU_X[k] + o[0] + q[0]; y = SU_Y + o[1] + q[1];
      } else if (j < n2) {

        const fl = (j - n1) / (n2 - n1);
        aux = 0.72 + 0.12 * u3; c = mx(cy, wh, u2 * 0.35);
        if (fl < 0.35) { const o = sh.net.N[j % 90]; x = o[0] + g1 * 2.5; y = o[1] + g2r * 2.5; a = 0.13; s = 1.7; }
        else { const e = onEdge(sh.net, (fl - 0.35) / 0.65); x = e[0] + g1 * 0.7; y = e[1] + g2r * 0.7; a = netA; }
        x += SU_AI[0]; y += SU_AI[1];
      } else {

        aux = 0.86 + 0.12 * u3; c = mx(cy, bl, u2);
        const q = ring(175 + 85 * u, u3);
        x = SU_AI[0] + q[0] + g1 * 6; y = SU_AI[1] + q[1] + g2r * 6; a = 0.15 * (1 - u);
      }
      const p = wp(x, y);
      P.add(p[0], p[1], 0, s, c[0], c[1], c[2], Math.min(1, a * ak), aux);
    }
  });

  const SUR = [1, 2].map(suR);
  KS.scene({
    id: 'aisociety', sec: 5, title: 'AIは、生命の歴史をもう一度たどる', swarm: true, kf: [1, 3],
    world: WORLD(),
    build(S) {
      const d = S.data;
      prep(S, AIR); SUR.forEach((R) => prep(S, R));
      d.h = K.h(S, 'AIは、生命の歴史をもう一度たどる');

      d.t1 = S.text('AIも、役割を分けて働き始めている。', { cls: 'serif', size: 36, x: 120, y: 330, color: C.cream, ls: 0.04 });
      d.t2 = S.text('その{編成}も、AI自身が担い始めている。', { cls: 'serif', size: 36, x: 120, y: 400, color: C.cream, ls: 0.04 });
      d.glow = K.glow(S, { x: AI_C[0], y: AI_C[1], size: 200, col: C.cyan });
      const OFF = [[0, -46, 'bc'], [-38, -38, 'br'], [38, -38, 'bl'], [38, 38, 'tl'], [-38, 38, 'tr']];
      d.roles = AI_HUB.map((h, k) => S.text(AI_ROLE[k], { cls: 'sans', size: k ? 24 : 20, x: h[0] + OFF[k][0], y: h[1] + OFF[k][1], anchor: OFF[k][2], color: k ? C.cyan : 'rgba(111,211,255,.8)', ls: 0.12 }));
      d.q = K.quote(S, 'AIは、人間が社会を築いてきた道を、\n後から駆け足で追いかけている', { x: 180, y: 720, size: 40, src: '『人類という通過点』より' });

      d.fig = S.text('生命の主役は、より大きな単位へ', { cls: 'sans', size: 26, x: 120, y: 300, color: C.gold, ls: 0.12 });
      d.svg = K.svg(S);
      const tip = (x, cls) => K.path(d.svg, 'M' + (x - 9) + ' ' + (SU_Y - 8) + 'L' + x + ' ' + SU_Y + 'L' + (x - 9) + ' ' + (SU_Y + 8), cls);
      d.ar = SU_X.slice(0, 4).map((x) => [K.line(d.svg, x + 100, SU_Y, x + 180, SU_Y, 'thin'), tip(x + 180, 'thin')]);
      d.ar.forEach((pr) => pr.forEach(K.undrawn));
      d.dash = [K.line(d.svg, 1420, SU_Y, 1484, SU_Y, 'cy thin', { style: 'stroke-dasharray:6 8' }), tip(1484, 'cy thin')].map(hid);
      d.lab = SU_NAME.map((t, k) => S.text(t, { cls: 'serif', size: 30, x: SU_X[k], y: 600, anchor: 'tc', color: C.cream, ls: 0.12 }));
      d.lsub = S.text('（人間を細胞とする）', { cls: 'sans', size: 20, x: SU_X[4], y: 648, anchor: 'tc', color: DIM });
      d.ai = S.text('人工超社会', { cls: 'serif', size: 36, x: SU_AI[0], y: 690, anchor: 'tc', color: C.cyan, ls: 0.14 });
      d.aisub = S.text('（人間を細胞としない）', { cls: 'sans', size: 20, x: SU_AI[0], y: 742, anchor: 'tc', color: 'rgba(111,211,255,.75)' });
      d.l2 = S.text('人間一人を超えるだけでなく、人間の社会も超えていく、人工の社会', { cls: 'sans', size: 30, x: 960, y: 830, anchor: 'tc', color: C.cream, ls: 0.04 });
      d.l3 = S.text('外から来た侵略者ではなく、人間の社会が育てた{次の段}', { cls: 'serif', size: 44, x: 960, y: 900, anchor: 'tc', color: C.cream, ls: 0.06 });
      d.src = K.src(S, '図：主役の単位の推移');
      d.th = K.threads(S, { from: [1320, 470, 0], to: [1660, 470, 0], n: 9, bow: 36, jit: 12, w: 1.3, mul: 0.55, glow: 0.35 });
      d.sg = K.glow(S, { x: SU_AI[0], y: SU_AI[1], size: 360, col: C.cyan });
    },
    steps: [
      (S) => {
        const d = S.data;
        K.show(d.h, { delay: 0.2 });
        K.sw(S, AIR, { dur: 3, delay: 0.2, ord: 1, amt: 0.6, spread: 60, ease: 'out' });
        look(S, { i: 1.15, wob: 0.5 });
        glowTo(d.glow, 0.3, { delay: 1.4, dur: 2 });
        K.show(d.t1, { delay: 1.0 });
        K.show(d.t2, { delay: 1.8 });
        K.each(d.roles.slice(1), 0.25, (el, t) => K.show(el, { delay: t, dy: 0, blur: 8 }), 2.4);
        K.show(d.roles[0], { delay: 3.4, dy: 0 });
        d.q.in({ delay: 4.0 });
      },
      (S) => {
        const d = S.data;
        [d.t1, d.t2, ...d.roles, d.q.bar, d.q.text, d.q.src].forEach((el) => el && K.hide(el));
        glowTo(d.glow, 0, { dur: 1.2 });
        K.show(d.fig, { delay: 0.5, dy: 8 });
        K.sw(S, SUR[0], { dur: 3.4, delay: 0.3, ord: 1, amt: 0.85, spread: 50, ease: 'out' });
        look(S, { i: 1.15, wob: 0.5 });
        K.each(d.lab, 0.45, (el, t) => K.show(el, { delay: t, dy: 10 }), 0.8);
        K.each(d.ar, 0.45, (pr, t) => pr.forEach((e) => K.draw(e, { dur: 0.6, delay: t })), 1.1);
        K.show(d.lsub, { delay: 3.0 });
        K.show(d.src, { delay: 1.0 });
        d.dash.forEach((e) => K.fade(e, 1, { dur: 0.8, delay: 3.2 }));
        K.show(d.ai, { delay: 3.6 });
        K.show(d.aisub, { delay: 4.1 });
        K.show(d.l2, { delay: 4.8 });
        glowTo(d.sg, 0.45, { delay: 3.0, dur: 2 });
      },
      (S) => {
        const d = S.data;
        K.sw(S, SUR[1], { dur: 1.4, ord: 0, amt: 0.2, spread: 0 });
        look(S, { i: 1.15, wob: 0.5 });
        K.fade(d.l2, 0.45);
        K.weave(d.th, { dur: 2.6, delay: 0.2 });
        K.show(d.l3, { delay: 1.2 });
      },
    ],
  });

  const TW_ROOT = [1545, 615], TW_FAM = [800, 592];

  const TW_BLOCK = [[1040, 470, 1545, 765], [1040, 752, 1752, 888], [96, 752, 980, 888]];
  const twBlocked = (p, q) => {
    for (let s = 0; s <= 10; s++) {
      const x = p[0] + ((q[0] - p[0]) * s) / 10, y = p[1] + ((q[1] - p[1]) * s) / 10;
      for (const b of TW_BLOCK) if (x > b[0] && x < b[2] && y > b[1] && y < b[3]) return true;
    }
    return false;
  };
  let twTreeC = null;

  const twTree = () => {
    if (twTreeC) return twTreeC;
    const r = U.rng(5172), N = [TW_ROOT.slice()];
    for (let i = 0; i < 46; i++) N.push([1578 + r() * 266, 470 + r() * 278]);
    for (let i = 0; i < 10; i++) N.push([1772 + r() * 76, 765 + r() * 140]);
    for (let i = 0; i < 132; i++) N.push([92 + r() * 1756, 906 + r() * 126]);
    const n = N.length, inT = N.map((p, i) => i === 0), par = N.map(() => 0), dep = N.map(() => 0), E = [];
    const dist = (i, k) => (twBlocked(N[i], N[k]) ? Infinity : Math.hypot(N[i][0] - N[k][0], N[i][1] - N[k][1]));
    const best = N.map((p, i) => (i ? dist(i, 0) : 0));
    for (let it = 1; it < n; it++) {
      let k = -1;
      for (let i = 1; i < n; i++) if (!inT[i] && (k < 0 || best[i] < best[k])) k = i;
      inT[k] = true;
      if (!isFinite(best[k])) continue;
      dep[k] = dep[par[k]] + best[k];
      E.push([par[k], k, best[k]]);
      for (let i = 1; i < n; i++) if (!inT[i]) { const dd = dist(i, k); if (dd < best[i]) (best[i] = dd), (par[i] = k); }
    }
    const L = [0];
    E.forEach((e) => L.push(L[L.length - 1] + e[2]));
    return (twTreeC = { N, E, L, dep, maxD: Math.max(...dep) });
  };
  const twR = (stage) => fnR('s5:two' + stage, 5171, (P, cnt, rnd) => {
    const ak = 65536 / cnt, g2 = U.lin(C.gold2), am = U.lin(C.amber), cr = U.lin(C.cream), tr = twTree();
    const m0 = 0.08 * cnt, m1 = 0.23 * cnt, m2 = 0.58 * cnt, nN = tr.N.length;
    const trA = Math.min(0.22, (1.2 * tr.L[tr.L.length - 1]) / (65536 * 0.35 * 0.88));
    for (let j = 0; j < cnt; j++) {
      const g1 = U.gauss(rnd), g2r = U.gauss(rnd), u = rnd(), u2 = rnd();
      let x, y, a = 0, s = 1.5, c = mx(am, g2, u2), aux = u;
      if (j < m0) { x = 80 + u * 1760; y = 120 + u2 * 860; a = 0.05; s = 1.3; c = mx(g2, cr, u); }
      else if (j < m1) {

        const k = j % 11, an = (k * TAU) / 10 - Math.PI / 2;
        const cx = k ? TW_FAM[0] + Math.cos(an) * 74 : TW_FAM[0], cy = k ? TW_FAM[1] + Math.sin(an) * 74 : TW_FAM[1];
        if (stage === 1) { x = cx + g1 * 6; y = cy + g2r * 6; }
        else if (stage === 2) { x = cx + g1 * (k ? 8 : 11); y = cy + g2r * (k ? 8 : 11); a = k ? 0.13 : 0.08; s = 1.6; aux = k / 10; }
        else if (u < 0.7) { x = 92 + u2 * 1756; y = 906 + (u / 0.7) * 126; a = 0.13; s = 1.7; }
        else { x = 92 + u2 * 1756; y = 470 + ((u - 0.7) / 0.3) * 560; a = 0.07; s = 1.5; }
      } else if (j < m2) {

        if (stage === 4 && u < 0.12) {
          const v = 1 + Math.floor(u2 * (nN - 1)), q = tr.N[v];
          x = q[0] + g1 * 1.6; y = q[1] + g2r * 1.6; a = 0.3; s = 2.2; c = g2; aux = tr.dep[v] / tr.maxD;
        } else if (stage === 4) {
          const e = onEdge(tr, (j - m1 + 0.5) / (m2 - m1)), E = tr.E[e[3]];
          x = e[0] + g1 * 0.8; y = e[1] + g2r * 0.8; a = trA; c = mx(am, g2, 0.45 + u2 * 0.55); aux = (tr.dep[E[0]] + e[4] * E[2]) / tr.maxD;
        } else { x = TW_ROOT[0] + g1 * 3; y = TW_ROOT[1] + g2r * 3; }
      } else { x = TW_ROOT[0] + g1 * 40; y = TW_ROOT[1] + g2r * 40; }
      const p = wp(x, y);
      P.add(p[0], p[1], 0, s, c[0], c[1], c[2], Math.min(1, a * ak), aux);
    }
  });
  const TWR = [1, 2, 3, 4].map(twR);

  const DE_SPL = [0.08, 0.26, 0.44, 0.62, 0.8];

  const deFork = (lf, f, w) => {
    let o = 0;
    for (let b = 0; b < 5; b++) o += ((lf >> (4 - b)) & 1 ? 1 : -1) * U.smooth(DE_SPL[b], DE_SPL[b] + 0.14, f) * Math.pow(0.5, b + 1);
    return o * w;
  };

  const deWeb = (l, f) => 545 + deFork(l, f, 16 + 196 * Math.pow(f, 1.15)) + Math.sin(f * (6 + (l % 5)) + l * 0.9) * 34 * f;
  const deH = (l) => { const h = Math.sin(l * 12.9898 + 4.1) * 43758.5453; return h - Math.floor(h); };
  const deQ = (l, f) => { const o = deH(l); let q = (Math.floor(f * 7 + o) + 0.5 - o) / 7; while (q > 0.96) q -= 1 / 7; while (q < 0.3) q += 1 / 7; return q; };
  const DEW = fnR('s5:desc', 5181, (P, cnt, rnd) => {
    const ak = 65536 / cnt, g2 = U.lin(C.gold2), gd = U.lin(C.gold), cy = U.lin(C.cyan), cr = U.lin(C.cream);
    const m0 = 0.06 * cnt, m1 = 0.2 * cnt, m2 = 0.64 * cnt, m3 = 0.72 * cnt;
    for (let j = 0; j < cnt; j++) {
      const g1 = U.gauss(rnd), g2r = U.gauss(rnd), u = rnd(), u2 = rnd(), u3 = rnd(), u4 = rnd();
      if (j < m0) { const p = wp(80 + u * 1760, 110 + u2 * 880), c = mx(g2, cr, u3); P.add(p[0], p[1], 0, 1.3, c[0], c[1], c[2], Math.min(1, 0.04 * ak), u); continue; }
      if (j < m1 || j >= m3) { PARK(P, 170 + u * 1630, 545 + g1 * 30, gd, u); continue; }
      const lf = Math.floor(u2 * 32);
      let x, y, a, s = 1.5, c, aux;
      if (j < m2) {

        const f = Math.log2(1 + 31 * u) / 5, lk = u4 < 0.1 && ((lf & 1) === 0 || (lf & 3) === 1), fq = lk ? deQ(lf, f) : f;
        x = 170 + fq * 1630; y = deWeb(lf, fq) + g1 * 0.9; a = 0.3; aux = fq;
        if (lk) { y += (deWeb(lf + 1, fq) - deWeb(lf, fq)) * u3; x += g2r * 0.6; }
        c = mx(mx(gd, g2, u3), cy, U.smooth(0.7, 0.92, fq));
      } else {

        const fq = deQ(lf, 0.35 + 0.65 * Math.sqrt(u));
        x = 170 + fq * 1630 + g2r * 1.3; y = deWeb(lf, fq) + g1 * 1.3; a = 0.08; s = 2.2; c = fq > 0.78 ? cy : g2; aux = fq;
      }
      const p = wp(x, y);
      P.add(p[0], p[1], 0, s, c[0], c[1], c[2], Math.min(1, a * ak), aux);
    }
  });

  KS.scene({
    id: 'twopeople', sec: 5, title: '子孫は、遺伝子の外にもいる', swarm: true, kf: [3, 5],
    images: ['ancient_town', 'grain_measure'],
    world: WORLD(),
    build(S) {
      const d = S.data;
      TWR.slice(1).forEach((R) => prep(S, R));
      prep(S, DEW);
      d.bg = K.photo(S, 'ancient_town', { z: -1200, w: 2200, fe: 90, exp: 0.7 });
      d.scrim = S.div({ x: 0, y: 0, w: 1920, h: 480 });
      d.scrim.style.background = 'linear-gradient(180deg, rgba(5,7,13,.7) 0%, rgba(5,7,13,.42) 60%, rgba(5,7,13,0) 100%)';
      d.band = S.div({ x: 0, y: 740, w: 1920, h: 160 });
      d.band.style.background = 'linear-gradient(180deg, rgba(5,7,13,0) 0%, rgba(5,7,13,.5) 30%, rgba(5,7,13,.5) 70%, rgba(5,7,13,0) 100%)';
      d.h = K.h(S, '子孫は、遺伝子の外にもいる');
      d.sub = S.text('古代の町に生きた、二人の人', { cls: 'sans', size: 26, x: 120, y: 226, color: DIM, ls: 0.08 });
      const col = (x, who, txt) => [
        S.text(who, { cls: 'sans', size: 22, x, y: 300, color: C.gold, ls: 0.3 }),
        S.text(txt, { cls: 'serif', size: 36, x, y: 340, color: C.cream, lh: 1.5, ls: 0.04 }),
      ];
      d.a = col(120, '一人目', '広い土地と富を持ち、\n十人の子をもうけた家長');
      d.b = col(1060, '二人目', '子を残さず、麦の量り方を\n一つ直した、無名の人');
      d.vr = K.vrule(S, { x: 990, y: 300, h: 560 });
      d.ctr = S.div({ x: 0, y: 0, w: 1920, h: 1080 });
      d.num = S.text('1 / 2', { cls: 'mono', size: 54, x: 120, y: 500, color: C.gold2, layer: d.ctr });
      d.gen = S.text('1 世代後', { cls: 'sans', size: 22, x: 124, y: 580, color: DIM, ls: 0.06, layer: d.ctr });
      d.a2 = S.text('千年後、一本の血筋で、{平均して約百億分の一}', { cls: 'serif', size: 32, x: 120, y: 776, color: C.cream, ls: 0.04 });
      d.a3 = S.text('その血は町じゅうに薄く散らばり、名前を知る人もいない', { cls: 'sans', size: 24, x: 120, y: 834, color: DIM });
      d.ph = K.photo(S, 'grain_measure', { x: 1300, y: 615, w: 480, h: 270, round: 14 });
      d.b2 = S.text('千年後の町の道具の中で、{毎日使われている}', { cls: 'serif', size: 32, x: 1060, y: 776, color: C.cream, ls: 0.04 });
      d.b3 = S.text('使う人は、その人がいたことさえ知らない', { cls: 'sans', size: 24, x: 1060, y: 834, color: DIM });

      d.qs = S.div({ x: 0, y: 360, w: 1920, h: 360 });
      d.qs.style.background = 'linear-gradient(180deg, rgba(5,7,13,0) 0%, rgba(5,7,13,.5) 25%, rgba(5,7,13,.5) 80%, rgba(5,7,13,0) 100%)';
      d.lead = S.text('遺伝子の外の道は、{薄まらない}', { cls: 'serif', size: 44, x: 120, y: 262, color: C.cream, ls: 0.04 });
      d.q = K.quote(S, '人が残した情報が、人がいなくなった後も働き続けること。\nそれが、子孫を残すことである。', { x: 240, y: 440, size: 44, src: '『人類という通過点』より' });
      d.s1 = S.text('社会自体が、{私たちの子孫}だ、とも見える', { cls: 'serif', size: 44, x: 120, y: 822, color: C.cream, ls: 0.04 });
      d.s2 = S.text('その受け渡しの先に、いま、AIが加わっている', { cls: 'sans', size: 28, x: 122, y: 898, color: 'rgba(111,211,255,.92)', ls: 0.06 });
    },
    steps: [
      (S) => {
        const d = S.data;
        d.stage = 1;
        K.reveal(d.bg, { dur: 2.8 });
        K.drift(S, d.bg, { zoom: 1.04, px: 0.01 });
        K.fade(d.scrim, 1, { dur: 1.6 });
        K.show(d.h, { delay: 0.5 });
        K.show(d.sub, { delay: 1.1 });
        K.sw(S, TWR[0], { dur: 2.4, delay: 0.4 });
        look(S, { i: 1, wob: 0.6 });
      },
      (S) => {
        const d = S.data;
        d.stage = 2;
        T.to(d.bg, { exp: 0.42 }, { dur: 1.8 });
        K.fade(d.band, 1, { dur: 1.4 });
        K.fade(d.vr, 0.5, { dur: 1.2, delay: 0.4 });
        d.a.forEach((el, k) => K.show(el, { delay: 0.2 + k * 0.3 }));
        if (S.instant) K.sw(S, TWR[2], { dur: 1.2 });
        else {
          K.sw(S, TWR[1], { dur: 1.8, ease: 'out', ord: 1, amt: 0.5 });
          T.call(() => { if (S.alive && d.stage === 2) K.sw(S, TWR[2], { from: TWR[1], dur: 5, ord: 0, amt: 0.3, spread: 0 }); }, 2.6);
        }
        K.show(d.ctr, { delay: 1.4, dur: 0.8 });
        const cnt = { from: 1, dur: 4.6, delay: 2.6, ease: 'inOutSine' };
        TX.count(d.num, 33, Object.assign({ fmt: (g) => '1 / ' + Math.pow(2, Math.round(g)).toLocaleString('en-US') }, cnt));
        TX.count(d.gen, 33, Object.assign({ fmt: (g) => Math.round(g) + ' 世代後' + (g > 32.5 ? '（約千年）' : '') }, cnt));
        K.show(d.a2, { delay: 7.0 });
        K.show(d.a3, { delay: 7.6 });
      },
      (S) => {
        const d = S.data;
        d.stage = 3;
        T.to(d.bg, { exp: 0.36 }, { dur: 1.6 });
        [d.ctr, d.a2, d.a3, ...d.a].forEach((el) => K.fade(el, 0.55, { dur: 1.2 }));
        d.b.forEach((el, k) => K.show(el, { delay: 0.2 + k * 0.3 }));
        K.reveal(d.ph, { dur: 1.8, delay: 0.6 });
        K.sw(S, TWR[3], { dur: 4.2, delay: 1.4, ord: 1, amt: 0.9, spread: 0, ease: 'out' });
        look(S, { i: 1.05, wob: 0.35 });
        K.show(d.b2, { delay: 4.6 });
        K.show(d.b3, { delay: 5.2 });
      },
      (S) => {
        const d = S.data;
        d.stage = 4;
        T.to(d.bg, { exp: 0.22 }, { dur: 1.6 });
        K.unreveal(d.ph, { dur: 1.2 });
        K.fade(d.band, 0, { dur: 1.2 });
        K.fade(d.qs, 1, { dur: 1.2, delay: 0.6 });
        [d.sub, d.vr, d.ctr, d.a2, d.a3, d.b2, d.b3, ...d.a, ...d.b].forEach((el) => K.hide(el));
        look(S, { o: 0.45, wob: 0.35 });
        K.show(d.lead, { delay: 0.6 });
        d.q.in({ delay: 1.4 });
      },
      (S) => {
        const d = S.data;
        d.stage = 5;
        K.unreveal(d.bg, { dur: 2.4, delay: 0.3 });
        K.fade(d.scrim, 0, { dur: 1.6 });
        [d.q.bar, d.q.text, d.q.src, d.qs].forEach((el) => K.fade(el, 0, { dur: 0.9 }));
        K.sw(S, DEW, { dur: 4.4, delay: 0.5, ord: 1, amt: 0.8, spread: 40, ease: 'inOutCubic' });
        look(S, { o: 1, i: 1.05, wob: 0.45 });
        K.show(d.s1, { delay: 3.0 });
        K.show(d.s2, { delay: 4.3 });
      },
    ],
  });

  const EC_US = [[340, 690], [1260, 690]], EC_AH = [[680, 430], [1600, 430]];
  const ecR = (stage) => fnR('s5:enemy' + stage, 5191, (P, cnt, rnd) => {
    const ak = 65536 / cnt, g2 = U.lin(C.gold2), gd = U.lin(C.gold), am = U.lin(C.amber), dm = U.lin(C.dim), cy = U.lin(C.cyan), bl = U.lin(C.blue), cr = U.lin(C.cream);
    const m0 = 0.05 * cnt, m1 = 0.16 * cnt, m2 = 0.28 * cnt, m3 = 0.39 * cnt, m4 = 0.71 * cnt, m5 = 0.93 * cnt;
    const dl = stage === 1 ? 1 : 0.5, on = stage === 2 ? 1 : 0, R = EC_US[1], A = EC_AH[1];
    for (let j = 0; j < cnt; j++) {
      const g1 = U.gauss(rnd), g2r = U.gauss(rnd), u = rnd(), u2 = rnd(), u3 = rnd();
      let x, y, a = 0, s = 1.5, c = gd, aux = 0;

      const us = (o) => { const sg = u < 0.4 ? 18 : 50; x = o[0] + g1 * sg; y = o[1] + g2r * sg; c = mx(am, g2, 0.2 + u3 * 0.8); s = 1.6; };
      if (j < m0) { x = 80 + u * 1760; y = 110 + u2 * 880; a = 0.04; s = 1.3; c = mx(g2, cr, u3); aux = u; }
      else if (j < m1) { us(EC_US[0]); a = 0.14 * dl; }
      else if (j < m2) {

        const rr = 110 * Math.sqrt(u), th = TAU * u2;
        x = EC_AH[0][0] + Math.round((Math.cos(th) * rr) / 10) * 10 + g1 * 0.6;
        y = EC_AH[0][1] + Math.round((Math.sin(th) * rr) / 10) * 10 + g2r * 0.6;
        a = 0.065 * dl; s = 1.7; c = mx(dm, cr, 0.15 + 0.2 * u3);
      } else if (j < m3) { us(R); a = 0.14 * on; aux = 0.1 * u2; }
      else if (j < m4) {

        const k = j % 9, t = u, q = k - 4;
        const b = bez(R, [R[0] + 60 + q * 16, R[1] - 170 - q * 8], [A[0] - 190 + q * 10, A[1] + 90 + q * 22], A, t);
        if (on) { x = b[0] + g1 * 1.2; y = b[1] + g2r * 1.2; a = 0.2 * (0.55 + 0.45 * Math.sin(Math.PI * t)); c = mx(gd, cy, U.smooth(0.25, 0.9, t)); }
        else { x = R[0] + g1 * 8; y = R[1] + g2r * 8; }
        aux = 0.12 + 0.58 * t;
      } else if (j < m5) {

        if (on) {
          const sg = u < 0.12 ? 14 : u < 0.4 ? 22 : 64;
          x = A[0] + g1 * sg; y = A[1] + g2r * sg; a = 0.12; s = 1.6; c = u < 0.12 ? g2 : mx(cy, bl, u3 * 0.5);
        } else { x = R[0] + g1 * 8; y = R[1] + g2r * 8; }
        aux = 0.7 + 0.3 * u2;
      } else { x = R[0] + g1 * 10; y = R[1] + g2r * 10; }
      const p = wp(x, y);
      P.add(p[0], p[1], 0, s, c[0], c[1], c[2], Math.min(1, a * ak), aux);
    }
  });
  const ECR = [1, 2].map(ecR);

  const SP_HAND = [1416, 782];

  const spOff = (q) => q[0] > 1868 || q[1] < 72 || q[0] < (q[1] < 230 ? 1150 : 1010);
  let spTreeC = null;
  const spTree = () => {
    if (spTreeC) return spTreeC;
    const r = U.rng(5209), N = [SP_HAND.slice()], E = [], dep = [0], tips = [];
    const grow = (i, a, len, lvl) => {
      let k = i, s = 0, av = 0, nf = 50 + r() * 70;
      while (s < len) {
        av = av * 0.88 + (r() - 0.5) * 0.12;
        a += av + (1.72 - a) * 0.04;
        const p = N[k], xl = p[1] < 270 ? 1240 : 1100;
        if (p[0] < xl) a -= (xl - p[0]) * 0.0016;
        if (p[0] > 1790) a += (p[0] - 1790) * 0.0016;
        const q = [p[0] + Math.cos(a) * 12, p[1] - Math.sin(a) * 12];
        if (spOff(q) || (q[1] < 160 && r() < (160 - q[1]) * 0.004)) break;
        N.push(q); dep.push(dep[k] + 12); E.push([k, N.length - 1, 12]);
        k = N.length - 1; s += 12;
        if (lvl < 4 && s > nf) {
          nf = s + 90 + r() * 110;
          const side = r() < (a > 1.72 ? 0.7 : 0.3) ? -1 : 1;
          grow(k, a + side * (0.38 + r() * 0.42), (len - s) * (0.6 + r() * 0.35) + 40, lvl + 1);
        }
      }
      if (k !== i) tips.push(k);
    };
    grow(0, 2.05, 760, 0);
    const L = [0];
    E.forEach((e) => L.push(L[L.length - 1] + e[2]));
    return (spTreeC = { N, E, L, dep, tips, maxD: Math.max(...dep) });
  };
  const spR = (stage) => fnR('s5:start' + stage, 5201, (P, cnt, rnd) => {
    const ak = 65536 / cnt, g2 = U.lin(C.gold2), am = U.lin(C.amber), cr = U.lin(C.cream), cy = U.lin(C.cyan), bl = U.lin(C.blue), wh = U.lin(C.white), tr = spTree();
    const m0 = 0.05 * cnt, m1 = 0.8 * cnt, m2 = 0.88 * cnt, nT = tr.tips.length, TL = tr.L[tr.L.length - 1];
    const trA = Math.min(0.3, (1.2 * TL) / (65536 * 0.75));
    const tint = (f) => (f < 0.5 ? mx(g2, cy, U.smooth(0.02, 0.3, f)) : mx(cy, bl, U.smooth(0.6, 1, f) * 0.45));
    for (let j = 0; j < cnt; j++) {
      const g1 = U.gauss(rnd), g2r = U.gauss(rnd), u = rnd(), u2 = rnd(), u3 = rnd();
      let x, y, a = 0, s = 1.5, c = cy, aux = u;
      if (j < m0) { x = 80 + u * 1760; y = 90 + u2 * 900; a = 0.035; s = 1.3; c = mx(g2, cr, u3); }
      else {

        let px, py, f;
        if (j < m1 || j >= m2) {
          const e = onEdge(tr, j < m1 ? (j - m0) / (m1 - m0) : (j - m2) / (cnt - m2)), E = tr.E[e[3]];
          px = e[0]; py = e[1]; f = (tr.dep[E[0]] + e[4] * E[2]) / tr.maxD;
        } else { const v = tr.tips[Math.floor(u2 * nT)]; px = tr.N[v][0]; py = tr.N[v][1]; f = tr.dep[v] / tr.maxD; }
        aux = f;
        if (stage === 1) {

          const core = j < m1 && u < 0.04, halo = j < m1 && u < 0.12, sg = core ? 2.2 : halo ? 14 : 3;
          x = SP_HAND[0] + g1 * sg; y = SP_HAND[1] + g2r * sg;
          a = core ? 0.1 : halo ? 0.045 : 0; s = core ? 1.8 : 1.5; c = core ? mx(g2, wh, 0.35) : mx(am, g2, u3);
        } else if (j < m1) {
          const w = 0.8 + 1.8 * Math.pow(1 - f, 3);
          x = px + g1 * w; y = py + g2r * w; a = trA * (1.1 - 0.3 * f) * (1 + 1.2 * Math.pow(1 - f, 3)); c = tint(f);
        } else if (j < m2) {
          const sg = u < 0.5 ? 1.5 : 5;
          x = px + g1 * sg; y = py + g2r * sg; a = u < 0.5 ? 0.1 : 0.03; s = 2.2; c = mx(cy, wh, 0.3 + 0.4 * u3);
        } else { x = px + g1 * 6; y = py + g2r * 6; a = 0.1; s = 1.8; c = tint(f); }
      }
      const p = wp(x, y);
      P.add(p[0], p[1], 0, s, c[0], c[1], c[2], Math.min(1, a * ak), aux);
    }
  });
  const SPR = [1, 2].map(spR);

  KS.scene({
    id: 'enemychild', sec: 5, title: '敵か、子どもか', swarm: true, kf: [2, 3], world: WORLD(), images: ['parent_child'],
    build(S) {
      const d = S.data, tr = spTree();
      prep(S, ECR[1]);
      SPR.forEach((R) => prep(S, R));

      d.bg = K.photo(S, 'parent_child', { z: -1200, w: 2200, fe: 90, exp: 0.8 });
      d.scrim = S.div({ x: 0, y: 0, w: 1180, h: 1080 });
      d.scrim.style.background = 'linear-gradient(90deg, rgba(5,7,13,.8) 0%, rgba(5,7,13,.62) 55%, rgba(5,7,13,0) 100%)';
      d.gh = K.glow(S, { x: SP_HAND[0], y: SP_HAND[1], size: 200, col: C.amber });

      const pick = [];
      tr.tips.filter((v) => tr.N[v][1] > 150).sort((p, q) => tr.dep[q] - tr.dep[p]).forEach((v) => { if (pick.length < 3 && pick.every((w) => Math.hypot(tr.N[v][0] - tr.N[w][0], tr.N[v][1] - tr.N[w][1]) > 260)) pick.push(v); });
      d.gt = pick.map((v) => K.glow(S, { x: tr.N[v][0], y: tr.N[v][1], size: 80, col: C.cyan }));

      d.h = K.h(S, '敵か、子どもか');
      d.sub = S.text('AIに追い越される、という話を、どちらとして見るか', { cls: 'sans', size: 26, x: 120, y: 226, color: DIM, ls: 0.08 });
      d.vr = K.vrule(S, { x: 960, y: 310, h: 620 });
      const lab = (t, o, dy, col) => S.text(t, { cls: 'sans', size: 22, x: o[0], y: o[1] + dy, anchor: 'tc', color: col || DIM, ls: 0.1 });
      d.l = [lab('わたしたち', EC_US[0], 112, C.gold), lab('無関係な敵', EC_AH[0], 128)];
      d.r = [lab('わたしたち', EC_US[1], 112, C.gold), lab('わたしたちから生まれたもの', EC_AH[1], 128, C.cyan)];
      d.lc = S.text('無関係な敵に、負ける話', { cls: 'serif', size: 36, x: 120, y: 886, color: C.cream, ls: 0.04 });
      d.rc = S.text('自分たちから生まれたものが、{先へ進む}話', { cls: 'serif', size: 36, x: 1040, y: 886, color: C.cream, ls: 0.04 });
      d.gl = K.glow(S, { x: EC_US[0][0], y: EC_US[0][1], size: 240, col: C.amber });
      d.gr = K.glow(S, { x: EC_US[1][0], y: EC_US[1][1], size: 240, col: C.amber });
      d.gc = K.glow(S, { x: EC_AH[1][0], y: EC_AH[1][1], size: 300, col: C.cyan });

      d.lead = S.text('AIを、人類の子どもとして見るなら', { cls: 'sans', size: 24, x: 120, y: 90, color: C.gold, ls: 0.12 });
      d.h2 = K.h(S, '言葉は教える。文章は、子が書く');
      d.say = S.text('渡せるのは{出発点}であって、\n行き先まで、親のものではない', { cls: 'serif', size: 44, x: 120, y: 800, lh: 1.55, color: C.cream });
    },
    steps: [
      (S) => {
        const d = S.data;
        K.show(d.h, { delay: 0.2 });
        K.show(d.sub, { delay: 0.7 });
        K.sw(S, ECR[0], { dur: 2.8, delay: 0.5, ord: 0, amt: 0.4, spread: 60, ease: 'out' });
        look(S, { i: 1, wob: 0.4 });
        glowTo(d.gl, 0.45, { delay: 1.4, dur: 2 });
        K.fade(d.vr, 0.5, { delay: 1.2, dur: 1.2 });
        K.each(d.l, 0.5, (el, t) => K.show(el, { delay: t, dy: 8 }), 2.2);
        K.show(d.lc, { delay: 3.4 });
      },
      (S) => {
        const d = S.data;
        [d.lc, ...d.l].forEach((el) => K.fade(el, 0.4, { dur: 1.2 }));
        glowTo(d.gl, 0.18, { dur: 1.2 });
        glowTo(d.gr, 0.45, { delay: 0.3, dur: 1.6 });
        K.show(d.r[0], { delay: 0.6, dy: 8 });
        K.sw(S, ECR[1], { dur: 4.2, delay: 0.5, ord: 1, amt: 0.85, spread: 0, ease: 'inOutSine' });
        glowTo(d.gc, 0.55, { delay: 3.4, dur: 2 });
        K.show(d.r[1], { delay: 3.8, dy: 8 });
        K.show(d.rc, { delay: 4.6 });
      },
      (S) => {
        const d = S.data;
        [d.h, d.sub, d.vr, d.lc, d.rc, ...d.l, ...d.r].forEach((el) => K.hide(el));
        [d.gl, d.gr, d.gc].forEach((g) => glowTo(g, 0, { dur: 1 }));
        K.reveal(d.bg, { dur: 2.6, delay: 0.3 });
        K.drift(S, d.bg, { zoom: 1.012, px: 0 });
        K.fade(d.scrim, 1, { dur: 1.6 });
        K.show(d.lead, { delay: 0.8, dy: 6 });
        K.show(d.h2, { delay: 1.0 });
        glowTo(d.gh, 0.55, { delay: 1.0, dur: 1.6 });
        look(S, { i: 1.1, wob: 0.35, wobF: 0.5 });

        const grow = () => {
          T.to(d.bg, { exp: 0.55 }, { dur: 2.4, ease: 'inOutSine' });
          glowTo(d.gh, 0.3, { dur: 2 });
          d.gt.forEach((g, k) => glowTo(g, 0.16, { delay: 3.6 + k * 0.25, dur: 1.6 }));
        };
        if (S.instant) { K.sw(S, SPR[1], { dur: 1.2 }); grow(); }
        else {
          K.sw(S, SPR[0], { dur: 2.2, delay: 0.4, ord: 0, amt: 0.4, spread: 30, ease: 'out' });
          T.call(() => { if (S.alive) { K.sw(S, SPR[1], { from: SPR[0], dur: 4.6, ord: 1, amt: 0.85, spread: 0, ease: 'inOutSine' }); grow(); } }, 2.8);
        }
        K.show(d.say, { delay: 5.6 });
      },
    ],
  });

  const euX = (yr) => 160 + (yr - 1500) * 2.6;
  const EU_Y = 560, EU_NOW = 1528;
  const EU_MS = [[1790, '信教の自由', 1], [1840, '奴隷制の廃止', 0], [1860, '近代医学', 1], [1920, '女性の参政権', 0]];
  const EU_FU = [[1630, 1], [1730, 0]];
  const euBox = (hi) => (hi ? [464, 416] : [656, 704]);
  const euR = (stage) => fnR('s5:europe' + stage, 5205, (P, cnt, rnd) => {
    const ak = 65536 / cnt, g2 = U.lin(C.gold2), am = U.lin(C.amber), dm = U.lin(C.dim), cr = U.lin(C.cream), cy = U.lin(C.cyan), bl = U.lin(C.blue);
    const m0 = 0.05 * cnt, m1 = 0.78 * cnt, m2 = 0.9 * cnt, steel = mx(dm, cr, 0.22), RW = [0.6, 0.9, 1, 0.9, 0.6];
    for (let j = 0; j < cnt; j++) {
      const g1 = U.gauss(rnd), g2r = U.gauss(rnd), u = rnd(), u2 = rnd(), u3 = rnd();
      let x, y, a = 0, s = 1.5, c = steel, aux = 0;
      if (j < m0) { x = 80 + u * 1760; y = 90 + u2 * 900; a = 0.03; s = 1.3; c = mx(g2, cr, u3); aux = u; }
      else if (j < m1) {

        const col = Math.floor(u * 202), row = Math.floor(u2 * 5), xs = 190 + col * 8;
        aux = (xs - 190) / 1610;
        if (stage === 3 && xs < EU_NOW) {
          const xc = 190 + u * 1616, env = U.smooth(190, 260, xc) * (1 - U.smooth(1440, EU_NOW, xc));
          const yc = EU_Y + env * (6 * Math.sin(xc * 0.011) + 3 * Math.sin(xc * 0.031 + 1)), halo = u3 < 0.3;
          x = xc; y = yc + g1 * (halo ? 9 : 2.2); a = halo ? 0.014 : 0.065; c = mx(am, g2, 0.3 + 0.7 * u3);
        } else { x = xs + g1 * 0.25; y = EU_Y - 12 + row * 6 + g2r * 0.25; a = 0.028 * RW[row]; }
      } else if (j < m2) {

        const m = EU_MS[j % 4], xm = euX(m[0]), e = euBox(m[2]), y0 = m[2] ? EU_Y - 14 : EU_Y + 14;
        aux = (xm - 190) / 1610;
        if (stage === 1) { x = xm + g1 * 2; y = EU_Y + g2r * 2; }
        else if (stage === 2) { const core = u < 0.35, sg = core ? 3.5 : 12; x = xm + g1 * sg; y = EU_Y + g2r * sg; a = core ? 0.06 : 0.03; c = core ? g2 : am; }
        else if (u < 0.8) { x = xm + g1 * 0.7; y = y0 + (e[0] - y0) * u2; a = 0.05; c = mx(g2, cr, 0.3 * u3); }
        else { x = xm + g1 * 6; y = EU_Y + g2r * 6; a = 0.03; c = g2; }
      } else {

        const f = EU_FU[j % 2], sg = stage === 3 ? (u < 0.35 ? 3.5 : 12) : 2;
        aux = (f[0] - 190) / 1610;
        x = f[0] + g1 * sg; y = EU_Y + g2r * sg;
        if (stage === 3) { a = u < 0.35 ? 0.045 : 0.025; c = u < 0.35 ? mx(cy, cr, 0.3) : mx(cy, bl, 0.4); }
      }
      const p = wp(x, y);
      P.add(p[0], p[1], 0, s, c[0], c[1], c[2], Math.min(1, a * ak), aux);
    }
  });
  const EUR = [1, 2, 3].map(euR);

  KS.scene({
    id: 'europe500', sec: 5, title: '500年前の思考実験', swarm: true, kf: [2, 3], world: WORLD(),
    build(S) {
      const d = S.data, sv = (d.svg = K.svg(S));
      prep(S, EUR[1]); prep(S, EUR[2]);
      d.h = K.head(S, 'もし1500年ごろのヨーロッパで、当時の教えと道徳を\n寸分の狂いもなく実行する知性を作っていたら', { eye: 'THOUGHT EXPERIMENT  /  EUROPE, AROUND 1500', size: 52 });

      d.tk = [];
      for (let yr = 1500; yr <= 2000; yr += 100) {
        const x = euX(yr);
        d.tk.push(hid(K.line(sv, x, 584, x, 594, 'dim thin')), K.stext(sv, String(yr), x, 620, { cls: 'mono', size: 17, anchor: 'middle', fill: 'rgba(140,147,166,.9)' }));
      }

      const lock = (x, y) => {
        const g = hid(K.node(sv, 'g')), st = { v: -7 };
        const sh = K.path(g, 'M' + (x - 9) + ' ' + (y - 4) + 'V' + (y - 11) + 'A9 9 0 0 1 ' + (x + 9) + ' ' + (y - 11) + 'V' + (y - 4), 'dim', { transform: 'translate(0 -7)' });
        K.node(g, 'rect', { x: x - 14, y: y - 4, width: 28, height: 24, rx: 4, class: 'k-ln dim' });
        return { g, sh, st };
      };
      d.shut = (L, v, delay) => T.to(L.st, { v }, { dur: 0.5, delay, ease: 'outCubic', onUpdate: () => L.sh.setAttribute('transform', 'translate(0 ' + L.st.v.toFixed(2) + ')') });
      d.lk0 = lock(160, 556);
      d.lk1 = lock(EU_NOW, 500);

      d.ms = EU_MS.map((m) => {
        const x = euX(m[0]), e = euBox(m[2]), w = m[1].length * 24 + 32, cy = (e[0] + e[1]) / 2, y0 = m[2] ? EU_Y - 16 : EU_Y + 16;
        return {
          ln: hid(K.line(sv, x, y0, x, e[0], 'dim thin', { style: 'stroke-dasharray:4 6' })),
          gb: hid(K.node(sv, 'rect', { x: x - w / 2, y: cy - 24, width: w, height: 48, rx: 6, class: 'k-ln dim', style: 'stroke-dasharray:6 7' })),
          gt: K.stext(sv, m[1], x, cy + 8, { size: 24, anchor: 'middle', fill: 'rgba(243,234,216,.5)' }),
          rb: hid(K.node(sv, 'rect', { x: x - w / 2, y: cy - 24, width: w, height: 48, rx: 6, class: 'k-ln', style: 'fill:rgba(242,183,102,.08)' })),
          rt: K.stext(sv, m[1], x, cy + 8, { size: 24, anchor: 'middle', fill: C.cream }),
        };
      });
      d.fu = EU_FU.map((f) => {
        const x = f[0], e = euBox(f[1]), cy = (e[0] + e[1]) / 2, y0 = f[1] ? EU_Y - 16 : EU_Y + 16;
        return [hid(K.line(sv, x, y0, x, e[0], 'cy thin', { style: 'stroke-dasharray:4 6' })),
          hid(K.node(sv, 'rect', { x: x - 28, y: cy - 24, width: 56, height: 48, rx: 6, class: 'k-ln cy', style: 'stroke-dasharray:6 7' })),
          K.stext(sv, '？', x, cy + 8, { size: 24, anchor: 'middle', fill: C.cyan })];
      });
      d.nowLn = hid(K.line(sv, EU_NOW, 530, EU_NOW, 592, 'thin', { style: 'stroke:rgba(243,234,216,.8)' }));
      d.nowT = K.stext(sv, 'いま', EU_NOW, 620, { size: 22, anchor: 'middle', fill: C.cream });
      d.lbT = K.cap(S, '疑ってはいけない目的', { x: 120, y: 664 });
      d.lbA = S.text('異端の弾圧・身分秩序の維持', { cls: 'serif', size: 36, x: 120, y: 698, color: C.cream });
      d.lbB = K.cap(S, 'ずっと、守られ続ける', { x: 120, y: 758 });
      d.capG = K.cap(S, '歴史に現れなかったかもしれないもの', { x: 838, y: 362, color: 'rgba(255,207,138,.85)' });
      d.capR = K.cap(S, '実際には、現れた', { x: 838, y: 362, color: C.gold2 });
      d.capF = K.cap(S, 'この先', { x: 1602, y: 362, color: C.cyan });
      d.capK = K.cap(S, '今の価値観で、鍵をかけると', { x: 1500, y: 492, anchor: 'br', size: 20, color: 'rgba(243,234,216,.88)' });
      d.foot = K.src(S, '※位置はおおよその時代');
      d.good = S.text('当時の人たちは、考えられる限りの善意と知恵で、\n最高の善を守ったつもりだったはず', { cls: 'serif', size: 38, x: 120, y: 826, lh: 1.55, color: C.cream });
      d.fin1 = S.text('「過去の人は途中。今の自分たちは{最終版}」', { cls: 'serif', size: 44, x: 120, y: 820, color: C.cream });
      d.fin2 = S.text('＝ 人間で進化が完成する、という話と同じ', { cls: 'serif', size: 34, x: 120, y: 900, color: DIM });
    },
    steps: [
      (S) => {
        const d = S.data;
        d.h.in({ delay: 0.2 });
        K.each(d.tk, 0.05, (e, t) => K.fade(e, 1, { delay: t, dur: 0.8 }), 0.8);
        K.fade(d.lk0.g, 1, { delay: 1.5, dur: 0.6 }); d.shut(d.lk0, 0, 2.0);
        K.sw(S, EUR[0], { dur: 2.8, delay: 1.9, ord: 1, amt: 0.6, spread: 30, ease: 'out' });
        look(S, { i: 1, wob: 0.12, wobF: 0.4 });
        K.show(d.lbT, { delay: 2.8 }); K.show(d.lbA, { delay: 3.0 }); K.show(d.lbB, { delay: 3.4 });
      },
      (S) => {
        const d = S.data;
        K.sw(S, EUR[1], { dur: 2.2, delay: 0.3, ord: 1, amt: 0.3, ease: 'inOutSine' });
        K.show(d.capG, { delay: 0.8 });
        d.ms.forEach((r, k) => { const t = 1.0 + k * 0.35; K.fade(r.ln, 1, { delay: t }); K.fade(r.gb, 1, { delay: t + 0.2 }); K.fade(r.gt, 1, { delay: t + 0.3 }); });
        K.show(d.foot, { delay: 2.6, dy: 8 });
        K.show(d.good, { delay: 3.2 });
      },
      (S) => {
        const d = S.data;

        d.shut(d.lk0, -7, 0.2); K.fade(d.lk0.g, 0.3, { delay: 0.5, dur: 1 });
        [d.lbT, d.lbA, d.lbB, d.good, d.capG].forEach((e) => K.hide(e, { dur: 0.6 }));
        K.sw(S, EUR[2], { dur: 3.4, delay: 0.5, ord: 1, amt: 0.25, spread: 0, ease: 'inOutSine' });
        look(S, { i: 1, wob: 0.25, wobF: 0.5 });
        d.ms.forEach((r, k) => {
          const t = 1.6 + k * 0.35;
          [r.ln, r.gb, r.gt].forEach((e) => K.fade(e, 0, { delay: t }));
          K.fade(r.rb, 1, { delay: t + 0.1 }); K.fade(r.rt, 1, { delay: t + 0.2 });
        });
        K.show(d.capR, { delay: 1.8 });
        K.fade(d.nowLn, 1, { delay: 2.8 }); K.fade(d.nowT, 1, { delay: 2.9 });
        K.fade(d.lk1.g, 1, { delay: 3.0, dur: 0.6 }); d.shut(d.lk1, 0, 3.5);
        K.show(d.capK, { delay: 3.3 });
        d.fu.forEach((f, k) => f.forEach((e, i) => K.fade(e, 1, { delay: 3.9 + k * 0.3 + i * 0.15 })));
        K.show(d.capF, { delay: 3.9 });
        K.show(d.fin1, { delay: 4.4 }); K.show(d.fin2, { delay: 5.2 });
      },
    ],
  });

  const RL_P = [[110, 668], [360, 676], [600, 540], [900, 506]];

  const rlAt = (u) => {
    const P = RL_P, uc = U.clamp(u, 0, 1), p = bez(P[0], P[1], P[2], P[3], uc);
    const q = bez(P[0], P[1], P[2], P[3], Math.min(1, uc + 0.002)), r = bez(P[0], P[1], P[2], P[3], Math.max(0, uc - 0.002));
    let tx = q[0] - r[0], ty = q[1] - r[1];
    const l = Math.hypot(tx, ty) || 1, ex = (u > 1 ? u - 1 : u < 0 ? u : 0) * 900;
    tx /= l; ty /= l;
    return { x: p[0] + tx * ex, y: p[1] + ty * ex, nx: -ty, ny: tx };
  };
  const RL_CG = { x0: 1120, y0: 430, x1: 1720, y1: 700, cx: 1420, cy: 565 };
  const RL_LOOP = [[248, 98, 0.0], [232, 84, 1.3], [214, 72, 2.6], [240, 106, 3.9], [222, 90, 5.2]];
  const rlR = (stage) => fnR('s5:rail' + stage, 5211, (P, cnt, rnd) => {
    const ak = 65536 / cnt, g2 = U.lin(C.gold2), gd = U.lin(C.gold), am = U.lin(C.amber), dm = U.lin(C.dim), cr = U.lin(C.cream);
    const steel = mx(dm, cr, 0.22), m0 = 0.06 * cnt, m1 = 0.66 * cnt, m2 = 0.92 * cnt;
    const cageK = stage === 1 ? 0 : stage === 2 ? 1 : 0.38;
    for (let j = 0; j < cnt; j++) {
      const g1 = U.gauss(rnd), g2r = U.gauss(rnd), u = rnd(), u2 = rnd(), u3 = rnd();
      let x, y, a = 0, s = 1.5, c = steel;
      if (j < m0) { x = 80 + u * 1760; y = 90 + u2 * 900; a = 0.025; s = 1.3; c = mx(g2, cr, u3); }
      else if (j < m1) {

        const uu = -0.16 + u * 1.28, p = rlAt(uu), open = U.smooth(0.86, 1.12, uu), core = u2 < 0.62;
        const off = -8 + (core ? g1 * 7 : g1 * 20) * (1 + open * 3.2) - open * 18 * u3;
        x = p.x + p.nx * off + g2r * (1 + open * 14); y = p.y + p.ny * off;
        a = (core ? 0.042 : 0.015) * (1 - 0.65 * open) * U.smooth(-0.16, -0.02, uu);
        c = core ? mx(g2, gd, u3) : mx(am, gd, u3);
      } else if (j < m2) {

        const L = RL_LOOP[j % 5], th = u * TAU + L[2], rr = 1 + g1 * 0.025;
        x = RL_CG.cx + L[0] * rr * Math.cos(th); y = RL_CG.cy + L[1] * rr * Math.sin(th) + g2r * 1.5;
        a = 0.05 * cageK; c = mx(steel, cr, 0.25 * u3);
      } else {

        x = RL_CG.x0 + 14 + u * (RL_CG.x1 - RL_CG.x0 - 28); y = RL_CG.y0 + 12 + u2 * (RL_CG.y1 - RL_CG.y0 - 24);
        a = 0.008 * cageK; s = 1.3;
      }
      const p = wp(x, y);
      P.add(p[0], p[1], 0, s, c[0], c[1], c[2], Math.min(1, a * ak), (x - 80) / 1760);
    }
  });
  const RLR = [1, 2, 3].map(rlR);

  const rlThreads = () => {
    const rnd = U.rng(5212), cv = [];
    for (let i = 0; i < 7; i++) {
      const o0 = -27 + i * 6.5 + U.gauss(rnd) * 2, ph = rnd() * TAU, e = 1.02 + rnd() * 0.1, pts = [];
      for (let k = 0; k <= 34; k++) {
        const uu = -0.16 + (k / 34) * (e + 0.16), p = rlAt(uu), open = U.smooth(0.86, 1.1, uu);
        const off = (o0 + 3 * Math.sin(uu * 7 + ph)) * (1 + open * 2.6) - 8 * open;
        pts.push(wp(p.x + p.nx * off, p.y + p.ny * off));
      }
      cv.push({ pts, w: 1.1 + rnd() * 0.6, col: i % 2 ? C.gold2 : C.gold, mul: 0.5 + rnd() * 0.25, delay: rnd() * 0.5, seed: rnd(), taper: true, fade: [0.06, 0.3] });
    }
    return cv;
  };
  const rlLoops = () => {
    const rnd = U.rng(5213);
    return RL_LOOP.map((L, i) => {
      const pts = [], turns = 2.4 + rnd() * 0.6, t0 = rnd() * TAU;
      for (let k = 0; k <= 260; k++) {
        const th = t0 + (k / 260) * turns * TAU, rr = 1 + 0.03 * Math.sin(k * 0.11 + i);
        pts.push(wp(RL_CG.cx + L[0] * rr * Math.cos(th), RL_CG.cy + L[1] * rr * Math.sin(th)));
      }
      return { pts, curve: false, w: 1.1 + rnd() * 0.4, col: C.dim, mul: 0.75, delay: i / 4, seed: rnd(), taper: true };
    });
  };

  KS.scene({
    id: 'rail', sec: 5, title: '手すりと檻', swarm: true, world: WORLD(),
    build(S) {
      const d = S.data, sv = (d.svg = K.svg(S)), cg = RL_CG;
      prep(S, RLR[1]); prep(S, RLR[2]);
      d.h = K.head(S, '安全対策は、必要', { eye: 'SAFETY MEASURES', size: 60 });
      d.sub = K.cap(S, '賢くなれば何でも勝手に善くなる、という保証はない', { x: 120, y: 262 });

      d.th = S.ribbon({ curves: rlThreads(), prog: 0, glow: 0.35, core: 1.1, head: 0.8, pulse: 1.4, pulseS: 0.12, pulseW: 0.045 });
      d.gl = K.glow(S, { x: 1000, y: 490, size: 360, col: C.gold });
      const rp = [];
      for (let k = 0; k <= 60; k++) { const p = rlAt(0.02 + (k / 60) * 0.86); rp.push([p.x + p.nx * 40, p.y + p.ny * 40, p.nx, p.ny]); }
      d.rail = K.undrawn(K.path(sv, 'M' + rp.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L'), '', { style: 'stroke:rgba(243,234,216,.85);stroke-width:2.4' }));
      d.hach = rp.map((p, k) => { const l0 = 50, l1 = k % 2 ? 60 : 68; return hid(K.line(sv, (p[0] + p[2] * (l0 - 40)).toFixed(1), (p[1] + p[3] * (l0 - 40)).toFixed(1), (p[0] + p[2] * (l1 - 40)).toFixed(1), (p[1] + p[3] * (l1 - 40)).toFixed(1), 'dim thin')); });
      d.posts = rp.filter((p, k) => k % 4 === 0).map((p) => hid(K.circle(sv, p[0].toFixed(1), p[1].toFixed(1), 4.2, '', { style: 'fill:#05070d;stroke:rgba(243,234,216,.85);stroke-width:1.6' })));

      const bar = 'stroke:rgba(140,147,166,.85);stroke-width:2.4', rail = 'stroke:rgba(140,147,166,.95);stroke-width:4';
      d.cgT = K.undrawn(K.line(sv, cg.x0 - 16, cg.y0, cg.x1 + 16, cg.y0, '', { style: rail }));
      d.cgB = K.undrawn(K.line(sv, cg.x0 - 16, cg.y1, cg.x1 + 16, cg.y1, '', { style: rail }));
      d.bars = [];
      for (let x = cg.x0; x <= cg.x1 + 0.5; x += 60) d.bars.push(K.undrawn(K.line(sv, x, cg.y0, x, cg.y1, '', { style: bar })));
      d.cage = [d.cgT, d.cgB].concat(d.bars);
      d.lp = S.ribbon({ curves: rlLoops(), prog: 0, glow: 0.3, core: 1, head: 0.5, pulse: 1.2, pulseS: 0.05, pulseW: 0.03 });
      d.lbL = S.text('事故を減らすための安全対策', { cls: 'serif', size: 30, x: 150, y: 776, color: C.cream });
      d.lbR = S.text('人間が決めた目的を、ずっと書き換えさせない', { cls: 'serif', size: 30, x: cg.x0, y: 776, color: C.cream });
      d.nmL = S.text('手すり', { cls: 'serif', size: 50, x: 150, y: 336, color: C.gold2 });
      d.nmR = S.text('檻', { cls: 'serif', size: 50, x: cg.x0, y: 336, color: C.cream });
      d.two = S.text('この二つは、別の話', { cls: 'serif', size: 44, x: 960, y: 880, anchor: 'tc', color: C.cream });
      d.q = S.text('「{安全は要る。}服従は要らない。」', { cls: 'serif', size: 72, x: 960, y: 862, anchor: 'tc', color: C.cream });
      d.src = K.src(S, '『人類という通過点』より');
    },
    steps: [
      (S) => {
        const d = S.data;
        d.h.in({ delay: 0.2 }); K.show(d.sub, { delay: 0.8 });
        K.sw(S, RLR[0], { dur: 2.6, delay: 0.5, ord: 1, amt: 0.5, spread: 30, ease: 'out' });
        look(S, { i: 1, wob: 0.3, wobF: 0.5 });
        K.weave(d.th, { dur: 3.2, delay: 1.2, ease: 'inOutSine' });
        K.draw(d.rail, { dur: 2.4, delay: 1.6, ease: 'inOutSine' });
        K.each(d.posts, 0.13, (e, t) => K.fade(e, 1, { delay: t, dur: 0.5 }), 1.8);
        K.each(d.hach, 0.035, (e, t) => K.fade(e, 1, { delay: t, dur: 0.5 }), 1.8);
        glowTo(d.gl, 0.1, { delay: 3.4, dur: 2 });
        K.show(d.lbL, { delay: 3.0 });
      },
      (S) => {
        const d = S.data;
        K.draw(d.cgT, { dur: 0.9, delay: 0.2 }); K.draw(d.cgB, { dur: 0.9, delay: 0.3 });
        d.bars.forEach((b, k) => K.draw(b, { dur: 0.5, delay: 0.6 + k * 0.07, ease: 'outCubic' }));
        K.sw(S, RLR[1], { dur: 1.8, delay: 1.2, amt: 0, spread: 0, ord: 0, ease: 'inOutSine' });
        K.weave(d.lp, { dur: 2.6, delay: 1.1, ease: 'inOutSine' });
        K.show(d.lbR, { delay: 1.9 });
        K.show(d.two, { delay: 2.9 });
      },
      (S) => {
        const d = S.data;

        K.hide(d.two, { dur: 0.6 });
        K.sw(S, RLR[2], { dur: 1.6, delay: 0.3, amt: 0, spread: 0, ord: 0, ease: 'inOutSine' });
        if (d.lp && !d.lp.inert) T.to(d.lp, { o: 0.35 }, { dur: 1.4, delay: 0.3, ease: 'inOutSine' });
        d.cage.forEach((e) => K.fade(e, 0.4, { delay: 0.3, dur: 1.4 }));
        K.fade(d.lbR, 0.5, { delay: 0.4, dur: 1.2 });
        K.show(d.nmL, { delay: 0.8 }); K.show(d.nmR, { delay: 1.1, o: 0.6 });
        glowTo(d.gl, 0.16, { delay: 0.8, dur: 2 });
        K.show(d.q, { delay: 1.8 }); K.show(d.src, { delay: 2.6, dy: 8 });
      },
    ],
  });

  const TF_P1 = { x0: 200, y0: 210, x1: 880, y1: 593 }, TF_P2 = { x0: 1040, y0: 210, x1: 1720, y1: 593 };

  const TF_ROOT = (() => {
    const rnd = U.rng(5225), r = [];
    for (let i = 0; i < 5; i++) r.push([1110 + i * 142 + (rnd() - 0.5) * 40, 198]);
    for (let i = 0; i < 3; i++) r.push([1732, 282 + i * 128 + (rnd() - 0.5) * 30]);
    return r;
  })();
  const TF_CG = [U.lin(C.gold2), U.lin(C.cyan), U.lin(C.blue)];
  const tfCol = (d) => mx(mx(TF_CG[0], TF_CG[1], U.smooth(30, 230, d)), TF_CG[2], 0.6 * U.smooth(200, 440, d));
  const tfW = (tips) => Math.min(2.2, 0.32 + 0.3 * Math.sqrt(tips));
  const TF_SC = (() => {
    const rnd = U.rng(5223), D = 6, dI = 130, dK = 12, A = [];
    const okA = (x, y) => !((x > TF_P2.x0 - 34 && x < TF_P2.x1 + 30 && y > TF_P2.y0 - 26) || x < 1010 || y > 720);
    while (A.length < 680) {
      const x = 1000 + rnd() * 1000, y = -90 + rnd() * 830, r = rnd(), dE = Math.max(0, TF_P2.y0 - 12 - y, x - TF_P2.x1 - 12);
      if (okA(x, y) && r < 0.35 + 0.65 * Math.exp(-dE / 260)) A.push([x, y]);
    }
    const N = TF_ROOT.map(([x, y], i) => ({ x, y, p: -1, root: i, it: 0, kids: [] })), best = A.map(() => [-1, 1e9]);
    const near = (from) =>
      A.forEach((a, ai) => {
        if (!a) return;
        for (let k = from; k < N.length; k++) { const dd = Math.hypot(N[k].x - a[0], N[k].y - a[1]); if (dd < best[ai][1]) best[ai] = [k, dd]; }
      });
    near(0);
    let it = 0;
    for (; it < 240; it++) {
      A.forEach((a, ai) => { if (a && best[ai][1] < dK) A[ai] = null; });

      const acc = new Map();
      A.forEach((a, ai) => {
        if (!a || best[ai][1] > dI) return;
        const k = best[ai][0], n = N[k], dx = a[0] - n.x, dy = a[1] - n.y, l = Math.hypot(dx, dy) || 1, v = acc.get(k) || [0, 0];
        v[0] += dx / l; v[1] += dy / l; acc.set(k, v);
      });
      const from = N.length;
      acc.forEach((v, k) => {
        const l = Math.hypot(v[0], v[1]), n = N[k];
        if (l < 0.2) return;
        const x = n.x + (v[0] / l) * D, y = n.y + (v[1] / l) * D;
        if (n.kids.some((c) => Math.hypot(N[c].x - x, N[c].y - y) < D * 0.5)) return;
        n.kids.push(N.length);
        N.push({ x, y, p: k, root: n.root, it: it + 1, kids: [] });
      });
      if (N.length === from) break;
      near(from);
    }

    const dead = N.map(() => false);
    for (let pass = 0; pass < 2; pass++)
      N.forEach((n, k) => {
        if (dead[k] || n.kids.length || n.p < 0) return;
        const run = [k];
        let q = n.p;
        while (q >= 0 && N[q].kids.length === 1 && N[q].p >= 0) { run.push(q); q = N[q].p; }
        if (q >= 0 && N[q].kids.length > 1 && run.length < 6) { run.forEach((r) => (dead[r] = true)); N[q].kids = N[q].kids.filter((c) => c !== run[run.length - 1]); }
      });
    const tips = N.map(() => 0), dist = N.map(() => 0);
    for (let k = N.length - 1; k >= 0; k--) { if (dead[k]) continue; if (!N[k].kids.length) tips[k] += 1; if (N[k].p >= 0) tips[N[k].p] += tips[k]; }
    N.forEach((n, k) => { if (n.p >= 0) dist[k] = dist[n.p] + D; });
    return { N, tips, dist, IT: Math.max(1, it) };
  })();

  const TF_TREE = (() => {
    const { N, tips, dist, IT } = TF_SC, out = [];
    const chain = (s, c0) => {
      const ids = [s, c0];
      let k = c0;
      while (N[k].kids.length === 1) { k = N[k].kids[0]; ids.push(k); }
      const raw = ids.map((i) => [N[i].x, N[i].y]), last = raw.length - 1;
      const sm = raw.map((p, i) => (i === 0 || i === last ? p : [(raw[i - 1][0] + 2 * p[0] + raw[i + 1][0]) / 4, (raw[i - 1][1] + 2 * p[1] + raw[i + 1][1]) / 4]));
      const pts = sm.filter((_, i) => i === 0 || i === last || i % 2 === 0), L = polyLen(pts), e = N[k], tp = tips[c0], end = pts[pts.length - 1];
      const kt = e.kids.length ? Math.max(...e.kids.map((c) => tips[c])) : 0;
      out.push({
        pts, L, len: L[L.length - 1], d0: dist[s], root: N[s].root, tips: tp, w: tfW(tp), w1: kt ? tfW(kt) : 0.4, tipEnd: !kt,
        out: end[0] > 1925 || end[1] < -5, fork: e.kids.length > 1, gen: tp >= 12 ? 0 : tp >= 5 ? 1 : tp >= 2 ? 2 : 3, t: [N[s].it / IT, e.it / IT],
      });
      e.kids.forEach((c) => chain(k, c));
    };
    N.forEach((n, i) => { if (n.p < 0) n.kids.forEach((c) => chain(i, c)); });
    return out;
  })();

  const TF_BRIDGE = (() => {
    const tips = TF_TREE.filter((b) => b.tipEnd && !b.out), used = new Set(), out = [];
    tips.forEach((a, i) => {
      if (used.has(a) || out.length >= 12) return;
      const ea = a.pts[a.pts.length - 1];
      let best = null, bd = 1e9;
      tips.forEach((b) => {
        if (b === a || used.has(b) || b.root === a.root) return;
        const eb = b.pts[b.pts.length - 1], dd = Math.hypot(eb[0] - ea[0], eb[1] - ea[1]);
        if (dd > 24 && dd < 70 && dd < bd) { bd = dd; best = b; }
      });
      if (!best) return;
      used.add(a); used.add(best);
      a.tipEnd = best.tipEnd = false;
      const eb = best.pts[best.pts.length - 1], dx = eb[0] - ea[0], dy = eb[1] - ea[1], k = (i % 2 ? 1 : -1) * 0.18, pts = [];
      for (let s = 0; s <= 8; s++) { const t = s / 8, w = 4 * t * (1 - t) * k; pts.push([ea[0] + dx * t - dy * w, ea[1] + dy * t + dx * w]); }
      const L = polyLen(pts), t0 = Math.max(a.t[1], best.t[1]);
      out.push({ pts, L, len: L[L.length - 1], d0: Math.min(a.d0 + a.len, best.d0 + best.len), root: a.root, tips: 1, w: 0.5, w1: 0.5, tipEnd: false, out: false, fork: false, gen: 3, bridge: true, t: [t0, Math.min(1, t0 + 0.06)] });
    });
    return out;
  })();
  const TF_ALL = TF_TREE.concat(TF_BRIDGE);

  const TF_CUM = (() => { let acc = 0; const c = TF_ALL.map((b) => (acc += b.len * [1, 0.9, 0.8, 0.7][b.gen])); return c.map((v) => v / acc); })();
  const TF_KNOT = [];
  TF_TREE.forEach((b) => {
    const e = b.pts[b.pts.length - 1];
    if (b.d0 === 0) TF_KNOT.push({ x: b.pts[0][0], y: b.pts[0][1], root: b.root, d: 0, g: 0 });
    if (b.fork || (b.tipEnd && !b.out)) TF_KNOT.push({ x: e[0], y: e[1], root: b.root, d: b.d0 + b.len, g: b.fork ? b.gen : 3 });
  });
  const TF_TRUNK = TF_ROOT.map((_, i) => TF_TREE.find((b) => b.root === i && b.d0 === 0) || null);
  const tfNear = (x, y) => { let bi = null, bd = 1e9; TF_TRUNK.forEach((b) => { if (!b) return; const dd = Math.hypot(b.pts[0][0] - x, b.pts[0][1] - y); if (dd < bd) { bd = dd; bi = b; } }); return bi; };

  const tfPt = (b, t) => {
    const s = t < 0.99 ? 1 : -1, p = polyAt(b.pts, b.L, t), q = polyAt(b.pts, b.L, t + 0.01 * s), l = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
    return [p[0], p[1], (-(q[1] - p[1]) / l) * s, ((q[0] - p[0]) / l) * s];
  };

  const TF_PER = (R) => 2 * (R.x1 - R.x0 - 24) + 2 * (R.y1 - R.y0 - 24) + 2 * Math.PI * 24;
  const tfRR = (R, f) => {
    const x0 = R.x0 - 12, y0 = R.y0 - 12, x1 = R.x1 + 12, y1 = R.y1 + 12, r = 24, W = x1 - x0 - 2 * r, H = y1 - y0 - 2 * r, A = (Math.PI * r) / 2;
    let s = U.clamp(f, 0, 0.99999) * (2 * W + 2 * H + 4 * A), t;
    if (s < W) return [x0 + r + s, y0, 0];
    s -= W; if (s < A) { t = s / r - Math.PI / 2; return [x1 - r + r * Math.cos(t), y0 + r + r * Math.sin(t), 1]; }
    s -= A; if (s < H) return [x1, y0 + r + s, 1];
    s -= H; if (s < A) { t = s / r; return [x1 - r + r * Math.cos(t), y1 - r + r * Math.sin(t), s < A / 2 ? 1 : 2]; }
    s -= A; if (s < W) return [x1 - r - s, y1, 2];
    s -= W; if (s < A) { t = s / r + Math.PI / 2; return [x0 + r + r * Math.cos(t), y1 - r + r * Math.sin(t), 3]; }
    s -= A; if (s < H) return [x0, y1 - r - s, 3];
    s -= H; t = s / r + Math.PI; return [x0 + r + r * Math.cos(t), y0 + r + r * Math.sin(t), s < A / 2 ? 3 : 0];
  };

  const tfR = (stage) => fnR('s5:twofutures' + stage, 5221, (P, cnt, rnd) => {
    const ak = 65536 / cnt, g2 = U.lin(C.gold2), gd = U.lin(C.gold), wh = U.lin(C.white);
    const dm = U.lin(C.dim), cr = U.lin(C.cream), steel = mx(dm, cr, 0.22);
    const m0 = 0.06 * cnt, m1 = 0.16 * cnt, m2 = 0.26 * cnt, m3 = 0.9 * cnt, nd = Math.round(TF_PER(TF_P1) / 8);
    const k1 = stage === 3 ? 0.45 : 1, kN = stage === 1 ? 0 : stage === 2 ? 1 : 1.15, grown = stage > 1;
    const inPl = (x, y) => ((x > TF_P1.x0 - 24 && x < TF_P1.x1 + 24) || (x > TF_P2.x0 - 24 && x < TF_P2.x1 + 24)) && y > TF_P1.y0 - 24 && y < TF_P1.y1 + 24;
    for (let j = 0; j < cnt; j++) {
      const g1 = U.gauss(rnd), g2r = U.gauss(rnd), u = rnd(), u2 = rnd(), u3 = rnd();
      let x, y, a = 0, s = 1.5, c = steel, aux;
      if (j < m0) {
        x = 60 + u * 1800; y = 60 + u2 * 960; a = inPl(x, y) ? 0 : 0.02; s = 1.3; c = mx(g2, cr, u3); aux = 0.1 * u;
      } else if (j < m2) {

        const two = j >= m1, f = (Math.floor(u * nd) + 0.5) / nd, q = tfRR(two ? TF_P2 : TF_P1, f);
        x = q[0] + g1 * 0.55; y = q[1] + g2r * 0.55;
        if (!two) { a = 0.042 * k1; c = mx(steel, cr, 0.45); aux = 0.1 + 0.3 * f; }
        else {
          aux = 0.4 + 0.15 * f; a = 0.042 * (stage === 1 ? 0.45 : 0.8); c = mx(gd, cr, 0.3);
          const tr = grown && q[2] < 2 ? tfNear(q[0], q[1]) : null;
          if (tr) { const p = tfPt(tr, u2 * 0.5); x = p[0] + p[2] * g1 * 1.5; y = p[1] + p[3] * g1 * 1.5; a = 0.04; c = mx(g2, gd, u3); }
        }
      } else if (j < m3) {

        let lo = 0, hi = TF_ALL.length - 1;
        while (lo < hi) { const mid = (lo + hi) >> 1; if (TF_CUM[mid] < u3) lo = mid + 1; else hi = mid; }
        const b = TF_ALL[lo], core = u2 < 0.72, dd = b.d0 + u * b.len;
        aux = 0.55 + 0.44 * U.clamp(dd / 700);
        if (grown) {
          const p = tfPt(b, u), off = core ? g1 * 0.7 : g1 * (12 + 14 * u2);
          x = p[0] + p[2] * off; y = p[1] + p[3] * off;
          a = (core ? 0.028 : 0.006) * kN;
          c = core ? mx(tfCol(dd), wh, 0.25) : tfCol(dd);
        } else { const r = TF_ROOT[b.root]; x = r[0] + g1 * 3; y = r[1] + g2r * 3; }
      } else {

        const kn = TF_KNOT[Math.floor(u3 * TF_KNOT.length)], core = u2 < 0.6, sz = 1 - 0.12 * kn.g, sg = (core ? 1.4 : 6) * sz;
        aux = 0.55 + 0.44 * U.clamp(kn.d / 700);
        if (grown) { x = kn.x + g1 * sg; y = kn.y + g2r * sg; a = (core ? 0.1 : 0.012) * kN * sz; c = core ? mx(wh, tfCol(kn.d), 0.4) : tfCol(kn.d); }
        else { const r = TF_ROOT[kn.root]; x = r[0] + g1 * 3; y = r[1] + g2r * 3; }
      }
      const p = wp(x, y);
      P.add(p[0], p[1], 0, s, c[0], c[1], c[2], Math.min(1, a * ak), aux + j * 1e-9);
    }
  });
  const TFR = [1, 2, 3].map(tfR);

  const tfNet = () =>
    TF_ALL.map((b) => ({
      pts: b.pts.map((p) => wp(p[0], p[1])), seg: 3, w: b.w, w1: b.w1, tip: b.tipEnd, col: tfCol(b.d0), col2: tfCol(b.d0 + b.len),
      mul: b.bridge ? 0.4 : 0.42 + 0.1 * Math.min(2.4, Math.sqrt(b.tips)), t: b.t, gk: 0.4 + 0.6 * U.clamp(b.w / 2.6), seed: (b.root * 0.37 + b.d0 * 0.0013) % 1,
    }));

  const NR_TW = 165, NR_RH = 96, NR_CAP = 642;
  const nrX = (i) => 1020 + NR_TW * i, nrY = (i) => 760 - NR_RH * i;

  const nrAt = (i, s) => (s < NR_RH ? [nrX(i), nrY(i) + NR_RH - s] : [nrX(i) + s - NR_RH, nrY(i)]);

  const nrR = (stage) => fnR('s5:twofutures-nr' + stage, 5241, (P, cnt, rnd) => {
    const ak = 65536 / cnt, am = U.lin(C.amber), gd = U.lin(C.gold), g2 = U.lin(C.gold2), cy = U.lin(C.cyan), dm = U.lin(C.dim), cr = U.lin(C.cream), wh = U.lin(C.white);
    const steel = mx(dm, cr, 0.22), cyw = mx(cy, wh, 0.5), haze = mx(steel, cy, 0.4);
    const m0 = Math.floor(cnt * 0.05), m1 = Math.floor(cnt * 0.13), m2 = Math.floor(cnt * 0.43), m3 = Math.floor(cnt * 0.66), L = NR_RH + NR_TW;
    for (let j = 0; j < cnt; j++) {
      const g1 = U.gauss(rnd), g2r = U.gauss(rnd), u = rnd(), u2 = rnd(), u3 = rnd(), u4 = rnd();
      if (j < m0) {

        const p = wp(60 + u * 1800, 80 + u2 * 920), c = mx(steel, g2, u3 * 0.4);
        P.add(p[0], p[1], 0, 1.2, c[0], c[1], c[2], Math.min(1, 0.012 * ak), u * 0.01 + j * 1e-9);
        continue;
      }
      const i = j < m1 ? 0 : j < m2 ? 1 : j < m3 ? 2 : 3 + Math.min(2, Math.floor(u3 * 3));

      const role = u2 < 0.62 ? 0 : u2 < 0.8 ? 1 : i >= 3 ? 0 : 2;
      const sl = u * L, gap = Math.floor(sl / 9) % 2 === 1, hot = role === 0 && u4 > 0.986;
      let px, py, a, c, s = hot ? 2.2 : 1.5;
      if (role < 2) { const e = nrAt(i, sl), sg = role ? 5 : 0.8; px = e[0] + g1 * sg; py = e[1] + g2r * sg; }
      else { px = nrX(i) + u * NR_TW; py = nrY(i) + 2 + Math.abs(g1) * 24; }
      if (i === 0) {
        c = mx(am, gd, 0.4); a = [0.03, 0.007, 0.003][role];
      } else if (i === 1) {

        c = hot ? wh : mx(gd, g2, u3); a = [0.038, 0.012, 0.007][role] * (hot ? 4 : 1);
      } else if (i === 2) {
        if (stage === 1) { c = steel; a = role === 2 || gap ? 0 : [0.02, 0.004][role]; }
        else { c = hot ? cyw : cy; a = [0.045, 0.01, 0.006][role] * (hot ? 4 : 1); }

        if (role === 2 && stage === 1) { px = nrX(1) + u * NR_TW; py = nrY(1) + g1 * 2; c = g2; }
      } else {

        const fd = [1, 0.75, 0.5][i - 3] * (1 - U.smooth(1830, 1950, px));
        a = gap ? 0 : [0.02, 0.005][role] * fd;
        if (stage === 1) c = steel;
        else if (stage === 2) { c = haze; a *= 0.35; }
        else { c = hot ? cyw : cy; a *= 1.6 * (hot ? 3 : 1); }
      }
      const p = wp(px, py);
      P.add(p[0], p[1], 0, s, c[0], c[1], c[2], Math.min(1, a * ak), 0.1 + i * 0.15 + u * 0.1 + j * 1e-9);
    }
  });
  const NRR = [1, 2, 3].map(nrR);

  const nrRail = () => {
    const P0 = [[nrX(2), nrY(1)]], r = 10, Q = Math.PI / 2;
    for (let i = 2; i <= 5; i++) {
      const x = nrX(i), y = nrY(i), ex = x + NR_TW;
      for (let k = 0; k <= 6; k++) { const t = (k / 6) * Q; P0.push([x + r - r * Math.cos(t), y + r - r * Math.sin(t)]); }
      if (i === 5) { P0.push([1990, y]); break; }
      for (let k = 0; k <= 6; k++) { const t = (k / 6) * Q; P0.push([ex - r + r * Math.sin(t), y - r + r * Math.cos(t)]); }
    }
    const Lp = polyLen(P0), out = [];
    for (let k = 0; k <= 240; k++) { const q = polyAt(P0, Lp, k / 240); out.push(wp(q[0], q[1])); }
    return out;
  };

  KS.scene({
    id: 'twofutures', sec: 5, title: '二つの未来', swarm: true, world: WORLD(), kf: [3, 4, 5],
    build(S) {
      const d = S.data, sv = (d.svg = K.svg(S)), A = TF_P1, B = TF_P2;
      prep(S, TFR[1]); prep(S, TFR[2]); NRR.forEach((R) => prep(S, R));
      d.h = K.head(S, '同じ惑星の、二つの版', { x: A.x0, y: 80, eye: 'TWO VERSIONS OF ONE PLANET', size: 40 });

      d.p1 = K.photo(S, 'planet_v1', { x: (A.x0 + A.x1) / 2, y: (A.y0 + A.y1) / 2, w: A.x1 - A.x0, h: A.y1 - A.y0, round: 12, rt: 1, ra: 0, rs: 0.3, rn: 0.12, rw: 0.4 });
      d.p2 = K.photo(S, 'planet_v2', { x: (B.x0 + B.x1) / 2, y: (B.y0 + B.y1) / 2, w: B.x1 - B.x0, h: B.y1 - B.y0, round: 12, rt: 2, ix: -0.7, iy: 0, rs: 0.035, rn: 0.16, rw: 0.5, rc: [0.45, 0.9, 1.5] });
      d.nw = S.ribbon({ curves: tfNet(), prog: 0, glow: 0.35, core: 1.1, head: 0.8, pulse: S.kf ? 0 : 0.6, pulseS: 0.12, pulseW: 0.05 });
      d.gl = K.glow(S, { x: 1560, y: 120, size: 560, col: C.cyan });

      d.lb1 = S.text('第一の版', { cls: 'serif', size: 30, x: A.x0, y: 614, color: C.cream });
      d.lb2 = S.text('第二の版', { cls: 'serif', size: 30, x: B.x0, y: 614, color: C.gold2 });
      d.r1 = K.undrawn(K.line(sv, A.x0, 662, A.x1, 662, 'dim thin'));
      d.r2 = K.undrawn(K.line(sv, B.x0, 662, B.x1, 662, 'dim thin'));
      const L1 = ['人類が頂点に留まる', '知性は人類の水準で止まる', '飢えも戦争もない', '同じ形が並び続ける', '人類を超えて伸びるものはない'];
      const L2 = ['人類はいない', '人間には読めない構造が', '惑星の規模で組み上がり', '組み替わり続ける', '眺めて名付ける者はいない'];
      d.l1 = L1.map((t, i) => S.text(t, { cls: 'sans', size: 22, x: A.x0, y: 678 + i * 31, color: C.cream }));
      d.l2 = L2.map((t, i) => S.text(t, { cls: 'sans', size: 22, x: B.x0, y: 678 + i * 31, color: C.cream }));
      d.alt = S.text('未来は二択ではない。何を優先しているかを、はっきりさせるために並べている', { cls: 'sans', size: 26, x: 960, y: 874, anchor: 'tc', color: DIM });
      d.my = S.text('私は、{後者の方が豊かな未来}だと思う', { cls: 'serif', size: 40, x: 960, y: 916, anchor: 'tc', color: C.cream });
      d.src = K.src(S, '『人類という通過点』序章「同じ惑星の二つの版」より');

      d.eye = K.eyebrow(S, 'TO BE CLEAR', { x: 120, y: 100 });
      d.st = S.text('人間がいなくなった方がいい、という話ではない', { cls: 'serif', size: 56, x: 120, y: 156, color: C.white, ls: 0.04 });

      d.bar = K.vrule(S, { x: 94, y: 326, h: 236 });
      d.q = ['第一の版が止まっているのは、', '((人間が残ったからではない。))', '人間の形を保つことを、', '{他のどんな変化よりも上に}置いたからである。'].map((t, i) =>
        S.text(t, { cls: 'serif', size: 40, x: 120, y: [316, 374, 450, 508][i], color: C.cream, ls: 0.04 }));

      d.cb = S.text('生命の階段と同じく', { cls: 'sans', size: 22, x: 120, y: 612, color: C.gold, ls: 0.12 });
      d.n = [['前の段が残ったまま、', C.gold2], ['次の段が育つこともある', C.cyan]].map((r, i) =>
        S.text(r[0], { cls: 'serif', size: 40, x: 120, y: 652 + i * 60, color: r[1], ls: 0.05 }));
      d.qq = S.text('人間の形を守るためなら、{その先の可能性は、全部止めていいのか}', { cls: 'serif', size: 44, x: 120, y: 908, color: C.cream, ls: 0.04 });

      d.gH = K.glow(S, { x: nrX(1) + NR_TW / 2, y: nrY(1) + 30, size: 460, col: C.gold });
      d.gN = K.glow(S, { x: nrX(2) + NR_TW / 2, y: nrY(2) + 30, size: 380, col: C.cyan });
      d.gP = K.glow(S, { x: nrX(4), y: nrY(4) + 20, size: 560, col: C.cyan });
      d.cs = K.svg(S);
      d.cap = K.undrawn(K.line(d.cs, nrX(1) - 36, NR_CAP, 1900, NR_CAP, 'dim'));
      d.capL = S.text('人間の形を、何よりも上に', { cls: 'sans', size: 20, x: 1800, y: NR_CAP + 12, anchor: 'tr', color: 'rgba(176,182,198,.88)', ls: 0.1 });
      d.lH = S.text('人間', { cls: 'sans', size: 22, x: nrX(1) + 12, y: nrY(1) + 16, color: C.gold2, ls: 0.2 });
      d.lN = S.text('次の段', { cls: 'sans', size: 22, x: nrX(2) + 12, y: nrY(2) + 16, color: C.cyan, ls: 0.2 });
      d.lP = S.text('その先', { cls: 'sans', size: 20, x: nrX(3) + 12, y: nrY(3) + 16, color: 'rgba(111,211,255,.75)', ls: 0.2 });
      d.rb = S.ribbon({
        curves: [{ pts: nrRail(), curve: false, w: 1, col: C.cyan, mul: 0.26, seed: 0.37, taper: true, fade: [0.02, 0.2] }],
        prog: 0, glow: 0.3, core: 0.8, head: 0.3, pulse: S.kf ? 0 : 1.4, pulseS: 0.11, pulseW: 0.035,
      });
    },
    steps: [
      (S) => {
        const d = S.data;
        d.h.in({ delay: 0.2 });
        K.sw(S, TFR[0], { dur: 2.4, delay: 0.3, ord: 1, amt: 0.4, spread: 40, ease: 'out' });
        look(S, { i: 1, wob: 0.25, wobF: 0.4 });
        K.reveal(d.p1, { dur: 2.2, delay: 0.6, ease: 'inOutSine' });
        K.show(d.lb1, { delay: 1.5 }); K.draw(d.r1, { dur: 1.2, delay: 1.6 });
        K.each(d.l1, 0.22, (e, t) => K.show(e, { delay: t, dy: 10 }), 1.9);
        K.show(d.src, { delay: 3.2, dy: 8 });
      },
      (S) => {
        const d = S.data;

        K.reveal(d.p2, { dur: 2.4, delay: 0.1, ease: 'inOutSine' });
        K.drift(S, d.p2, { zoom: 1.03, px: 0.01, dur: 16 });
        K.sw(S, TFR[1], { dur: 4.8, delay: 1.1, ord: 1, amt: 0.6, spread: 0, ease: 'out' });
        const tw = K.weave(d.nw, { dur: 5.2, delay: 1.0, ease: 'inOutSine' });

        if (!S.kf) T.call(() => { if (S.alive && d.nw && !d.nw.inert) S.loop(d.nw, { prog: 0.93 }, { dur: 6 }); }, tw);
        look(S, { i: 1.05, wob: 0.3, wobF: 0.45, twk: 0.4 }, 3);
        glowTo(d.gl, 0.08, { delay: 1.6, dur: 2.4 });
        K.show(d.lb2, { delay: 1.2 }); K.draw(d.r2, { dur: 1.2, delay: 1.3 });
        K.each(d.l2, 0.22, (e, t) => K.show(e, { delay: t, dy: 10 }), 1.6);
      },
      (S) => {
        const d = S.data;

        K.sw(S, TFR[2], { dur: 1.6, delay: 0.3, amt: 0, spread: 0, ord: 0, ease: 'inOutSine' });
        if (d.p1 && !d.p1.inert) T.to(d.p1, { exp: 0.5, sat: 0.35 }, { dur: 1.8, delay: 0.3, ease: 'inOutSine' });
        d.l1.forEach((e) => K.fade(e, 0.45, { delay: 0.4, dur: 1.2 }));
        K.fade(d.lb1, 0.6, { delay: 0.4, dur: 1.2 });
        glowTo(d.gl, 0.13, { delay: 0.6, dur: 2 });
        K.show(d.alt, { delay: 0.5, dy: 10 });
        K.show(d.my, { delay: 1.5 });
      },
      (S) => {
        const d = S.data;

        [d.h.eye, d.h.h, d.lb1, d.lb2, d.alt, d.my, ...d.l1, ...d.l2].forEach((e) => K.hide(e));
        K.fade(d.svg, 0, { dur: 0.7 });
        K.unreveal(d.p1, { dur: 1.2 }); K.unreveal(d.p2, { dur: 1.2 });
        if (d.nw && !d.nw.inert) T.to(d.nw, { o: 0 }, { dur: 1.2, ease: 'inOutSine' });
        glowTo(d.gl, 0, { dur: 1 });
        K.sw(S, NRR[0], { dur: 2.8, delay: 0.5, ord: 1, amt: 0.5, spread: 60, ease: 'inOutSine' });
        look(S, { i: 1, wob: 0.25, wobF: 0.45 });
        TX.in(d.eye, 'type', { delay: 0.7 });
        TX.in(d.st, 'rise', { delay: 0.9, stagger: 0.03 });
        glowTo(d.gH, 0.09, { delay: 1.4, dur: 2 });
        K.show(d.lH, { delay: 2.4, dy: 6 });
        K.fade(d.st, 0.72, { delay: 3.4, dur: 1.2 });
        K.grow(d.bar, { delay: 3.6, dur: 1.6 });
        TX.in(d.q[0], 'rise', { delay: 3.7, stagger: 0.03 });
        TX.in(d.q[1], 'rise', { delay: 4.5, stagger: 0.03 });
        TX.in(d.q[2], 'rise', { delay: 5.5, stagger: 0.03 });
        TX.in(d.q[3], 'rise', { delay: 6.1, stagger: 0.03 });
        K.draw(d.cap, { dur: 1.6, delay: 6.3, ease: 'inOutSine' });
        K.show(d.capL, { delay: 7.3, dy: 6 });
      },
      (S) => {
        const d = S.data;

        T.el(d.cs, { y: -30, o: 0 }, { dur: 1.4, delay: 0.2, ease: 'inOutSine' });
        T.el(d.capL, { y: -30, o: 0 }, { dur: 1.2, delay: 0.2, ease: 'inOutSine' });
        d.q.forEach((q) => K.fade(q, 0.45, { delay: 0.2, dur: 1.2 }));
        K.fade(d.bar, 0.45, { delay: 0.2, dur: 1.2 });
        look(S, { i: 1.05, wob: 0.3, wobF: 0.5, twk: 0.3 }, 2);
        K.show(d.cb, { delay: 0.4, dy: 6 });
        TX.in(d.n[0], 'rise', { delay: 0.6, stagger: 0.03 });
        TX.in(d.n[1], 'rise', { delay: 1.6, stagger: 0.03 });
        glowTo(d.gN, 0.07, { delay: 1.6, dur: 2 });
        K.show(d.lN, { delay: 2.6, dy: 6 });

        const t2 = 3.6;
        if (S.instant) K.sw(S, NRR[2], { dur: 1.2 });
        else {
          K.sw(S, NRR[1], { dur: 2.6, delay: 0.7, ord: 1, amt: 0.15, spread: 10, ease: 'inOutSine' });
          T.call(() => { if (S.alive) K.sw(S, NRR[2], { from: NRR[1], dur: 2.6, ord: 1, amt: 0.1, spread: 0, ease: 'inOutSine' }); }, t2);
        }
        K.weave(d.rb, { dur: 3.2, delay: t2 + 0.3, ease: 'inOutSine' });
        glowTo(d.gP, 0.05, { delay: t2 + 0.8, dur: 2.4 });
        K.show(d.lP, { delay: t2 + 1.8, dy: 6 });
        [d.cb, ...d.n].forEach((e) => K.fade(e, 0.6, { delay: t2 + 1.0, dur: 1.2 }));
        TX.in(d.qq, 'rise', { delay: t2 + 1.4, stagger: 0.03 });
      },
    ],
  });

  const CH_Y = 300, CH_RX = 820, CH_RR = 34;
  const chPinch = (x) => 1 - Math.exp(-Math.pow((x - CH_RX) / 95, 2));

  const chW = (x, open) => 5 + 9 * chPinch(x) + (x > CH_RX ? open * 132 * Math.pow(U.smooth(CH_RX + 30, 1900, x), 1.2) : 0);
  const CH_LANE = (() => { const rnd = U.rng(5232), r = []; for (let l = 0; l < 9; l++) r.push([(l - 4) / 4, rnd() * TAU, 0.7 + rnd() * 0.6]); return r; })();

  const chLane = (l, x, open) => {
    const L = CH_LANE[l], far = x > CH_RX ? U.smooth(CH_RX, 1900, x) : 0;
    return CH_Y + 4 * Math.sin(x * 0.004 + 1.3) * chPinch(x) + L[0] * chW(x, open) + Math.sin(x * 0.0052 * L[2] + L[1]) * (2 + open * 22 * far);
  };
  const chR = (stage) => fnR('s5:choice' + stage, 5231, (P, cnt, rnd) => {
    const ak = 65536 / cnt, g2 = U.lin(C.gold2), gd = U.lin(C.gold), am = U.lin(C.amber), dm = U.lin(C.dim), cr = U.lin(C.cream);
    const steel = mx(dm, cr, 0.22), neu = mx(dm, cr, 0.5), wh = [1, 0.95, 0.85], m0 = 0.05 * cnt, m1 = 0.78 * cnt, m2 = 0.88 * cnt;
    const warm = stage >= 2 ? 1 : 0, open = stage === 3 ? 1 : 0;
    for (let j = 0; j < cnt; j++) {
      const g1 = U.gauss(rnd), g2r = U.gauss(rnd), u = rnd(), u2 = rnd(), u3 = rnd(), l = Math.floor(u3 * 9) % 9;
      let x, y, a = 0, s = 1.5, c = steel, aux = u;
      if (j < m0) { x = 60 + u * 1800; y = 80 + u2 * 920; a = 0.02; s = 1.3; c = mx(steel, cr, u3); }
      else if (j < m1) {

        x = -60 + u * 2040;
        const core = u2 < 0.68, past = U.smooth(CH_RX - 10, CH_RX + 150, x) * warm, op = x > CH_RX ? open : 0;
        y = chLane(l, x, open) + (core ? g1 * (1.1 + op * 1.4) : g1 * (7 + chW(x, open) * 0.35));
        x += g2r * 2;
        a = (core ? 0.032 : 0.009) * (1 - 0.35 * open * U.smooth(1500, 1960, x));
        c = mx(core ? mx(neu, cr, 0.3) : steel, core ? mx(g2, gd, u3) : mx(am, gd, u3), past);
      } else if (j < m2) {

        const th = u * TAU, core = u2 < 0.7, r = CH_RR + (core ? g1 : g1 * 4);
        x = CH_RX + r * Math.cos(th); y = CH_Y + r * Math.sin(th);
        a = core ? 0.05 : 0.012; c = core ? mx(neu, cr, 0.5) : steel; aux = 0.43 + u * 1e-3;
      } else {

        const xf = open ? 1540 + u * 420 : CH_RX + 40 + u * 900;
        x = xf; y = chLane(l, xf, open) + g1 * (open ? 4 : 2);
        a = (open ? 0.06 : 0.012 * warm) * (0.4 + u2); s = 1.4 + u2 * 1.2;
        c = warm ? mx(g2, wh, u2 * 0.5) : steel; aux = 0.45 + u * 0.55;
      }
      const p = wp(x, y);
      P.add(p[0], p[1], 0, s, c[0], c[1], c[2], Math.min(1, a * ak), aux + j * 1e-9);
    }
  });
  const CHR = [1, 2, 3].map(chR);

  const chThreads = (open) => {
    const rnd = U.rng(open ? 5234 : 5233), cv = [];
    (open ? [0, 1, 2, 3, 4, 5, 6, 7, 8] : [1, 4, 7]).forEach((l, i) => {
      const x0 = open ? CH_RX + 10 : -60, x1 = open ? 1990 : CH_RX + 70, pts = [];
      for (let k = 0; k <= 48; k++) { const x = x0 + (k / 48) * (x1 - x0); pts.push(wp(x, chLane(l, x, open ? 1 : 0))); }
      const t0 = open ? rnd() * 0.14 : 0;
      cv.push({
        pts, seg: 6, w: open ? 1 + rnd() * 0.7 : 0.9, col: open ? (i % 2 ? C.gold2 : C.gold) : C.dim, mul: open ? 0.5 + rnd() * 0.2 : 0.35,
        seed: rnd(), taper: true, fade: open ? [0.04, 0.22] : [0.08, 0.3], t: [t0, open ? t0 + 0.84 + rnd() * 0.02 : 1],
      });
    });
    return cv;
  };

  const chWarm = () => {
    const rnd = U.rng(5235);
    return [1, 4, 7].map((l) => {
      const pts = [];
      for (let k = 0; k <= 40; k++) { const x = CH_RX + 10 + (k / 40) * 1180; pts.push(wp(x, chLane(l, x, 0))); }
      return { pts, seg: 6, w: 0.9, col: C.gold2, mul: 0.4, seed: rnd(), taper: true, fade: [0.04, 0.3], t: [0, 1] };
    });
  };

  KS.scene({
    id: 'choice', sec: 5, title: '記述と選択', swarm: true, world: WORLD(),
    build(S) {
      const d = S.data, sv = (d.svg = K.svg(S));
      prep(S, CHR[1]); prep(S, CHR[2]);
      d.eye = K.eyebrow(S, 'DESCRIPTION  /  CHOICE', { x: 120, y: 100 });
      d.th0 = S.ribbon({ curves: chThreads(false), prog: 0, glow: 0.3, core: 1, head: 0.4 });
      d.thw = S.ribbon({ curves: chWarm(), prog: 0, glow: 0.3, core: 1, head: 0.35 });
      d.th1 = S.ribbon({ curves: chThreads(true), prog: 0, glow: 0.35, core: 1.1, head: 0.4, pulse: S.kf ? 0 : 0.9, pulseS: 0.1, pulseW: 0.045 });
      d.gl = K.glow(S, { x: 1700, y: CH_Y, size: 620, col: C.gold });
      d.lin = S.text('生命の系譜', { cls: 'sans', size: 20, x: 120, y: CH_Y - 22, anchor: 'bl', color: DIM, ls: 0.12 });
      d.hum = S.text('人類', { cls: 'sans', size: 20, x: CH_RX, y: CH_Y + CH_RR + 14, anchor: 'tc', color: C.cream, ls: 0.2 });

      const rx0 = CH_RX + 60, rx1 = 1800, ry = 528, cx = 1720, cy0 = CH_Y - 136, cy1 = CH_Y + 136;
      d.rul = K.undrawn(K.line(sv, rx0, ry, rx1, ry, 'thin'));
      let tk = '';
      for (let i = 0, x = rx0; x <= rx1 + 0.5; i++, x += 31) tk += 'M' + x.toFixed(1) + ' ' + ry + 'L' + x.toFixed(1) + ' ' + (ry - (i % 5 ? 6 : 14));
      d.tk = K.undrawn(K.path(sv, tk, 'thin'));
      d.cal = K.undrawn(K.path(sv, 'M' + (cx - 9) + ' ' + cy0 + 'L' + (cx + 9) + ' ' + cy0 + 'M' + cx + ' ' + cy0 + 'L' + cx + ' ' + cy1 + 'M' + (cx - 9) + ' ' + cy1 + 'L' + (cx + 9) + ' ' + cy1, 'thin'));
      d.far = S.text('どこまで遠く', { cls: 'sans', size: 22, x: rx1, y: ry + 16, anchor: 'tr', color: C.gold2, ls: 0.1 });
      d.wide = S.text('どこまで広く', { cls: 'sans', size: 22, x: cx, y: cy0 - 14, anchor: 'bc', color: C.gold2, ls: 0.1 });

      const ROW = [600, 704, 808];
      d.lb = [['記述', 'rgba(200,204,216,.92)'], ['選択', C.gold2], ['物差し', C.gold2]].map((r, i) => S.text(r[0], { cls: 'sans', size: 24, x: 240, y: ROW[i] + 13, color: r[1], ls: 0.2 }));
      d.q = ['人類が通過点であることは、生命史の記述である。', 'それを歓迎することは、本書の選択である。', '探索と継承が、{どこまで広く}、{どこまで遠く}続くか'].map((t, i) =>
        S.text(t, { cls: 'serif', size: 44, x: 400, y: ROW[i], color: C.cream, ls: 0.04 }));
      d.dv = [680, 784].map((y) => K.undrawn(K.line(sv, 240, y, 1680, y, 'dim thin')));
      d.src = K.src(S, '『人類という通過点』終章「子孫に、人間の顔を求めない」より');
    },
    steps: [
      (S) => {
        const d = S.data;
        TX.in(d.eye, 'type', { delay: 0.2 });
        K.sw(S, CHR[0], { dur: 2.6, delay: 0.3, ord: 1, amt: 0.4, spread: 40, ease: 'out' });
        look(S, { i: 1, wob: 0.25, wobF: 0.4 });
        K.weave(d.th0, { dur: 2.6, delay: 0.6, ease: 'inOutSine' });
        K.show(d.lin, { delay: 1.2, dy: 8 }); K.show(d.hum, { delay: 1.8, dy: 8 });
        K.show(d.lb[0], { delay: 2.2, dy: 10 }); TX.in(d.q[0], 'rise', { delay: 2.3, stagger: 0.03 });
        K.draw(d.dv[0], { dur: 1.4, delay: 3.6 });
        K.show(d.lb[1], { delay: 4.0, dy: 10 }); TX.in(d.q[1], 'rise', { delay: 4.1, stagger: 0.03 });

        K.sw(S, CHR[1], { dur: 2.2, delay: 4.6, ord: 1, amt: 0, spread: 0, ease: 'inOutSine' });
        K.weave(d.thw, { dur: 2.4, delay: 4.6, ease: 'inOutSine' });
        glowTo(d.gl, 0.045, { delay: 4.8, dur: 2 });
        K.show(d.src, { delay: 5.4, dy: 8 });
      },
      (S) => {
        const d = S.data;

        K.sw(S, CHR[2], { dur: 3.4, delay: 0.2, ord: 1, amt: 0.25, spread: 0, ease: 'inOutSine' });
        look(S, { i: 1.05, wob: 0.3, wobF: 0.45, twk: 0.4 }, 2.4);
        K.weave(d.th1, { dur: 4, delay: 0.5, ease: 'inOutSine' });
        if (d.thw && !d.thw.inert) T.to(d.thw, { o: 0 }, { dur: 2.6, delay: 1.2, ease: 'inOutSine' });
        glowTo(d.gl, 0.12, { delay: 0.8, dur: 2.4 });
        K.fade(d.q[0], 0.5, { delay: 0.3, dur: 1.2 }); K.fade(d.lb[0], 0.5, { delay: 0.3, dur: 1.2 });
        K.draw(d.dv[1], { dur: 1.4, delay: 0.6 });
        K.show(d.lb[2], { delay: 1.0, dy: 10 }); TX.in(d.q[2], 'rise', { delay: 1.1, stagger: 0.03 });
        K.draw(d.rul, { dur: 1.8, delay: 2.0, ease: 'inOutSine' }); K.draw(d.tk, { dur: 1.8, delay: 2.1, ease: 'inOutSine' });
        K.draw(d.cal, { dur: 1.2, delay: 2.8 });
        K.show(d.far, { delay: 3.4, dy: 8 }); K.show(d.wide, { delay: 3.6, dy: 8 });
      },
    ],
  });

  const DB_HEAD = [562, 510];
  const DB_BIRDS = [[1060, 250], [1115, 242], [1200, 207], [1290, 305], [1308, 180], [1410, 275], [1475, 100], [1590, 235], [1735, 60]];

  const dbArc = (a, b, lift, end, n) => {
    const dx = b[0] - a[0], dy = a[1] - b[1];
    const c1 = [a[0] + dx * 0.3, a[1] - dy * 0.3 - lift], c2 = [b[0] - dx * 0.3, b[1] + dy * 0.3 - lift * 0.5 + end], out = [];
    for (let k = 0; k <= n; k++) out.push(bez(a, c1, c2, b, k / n));
    return out;
  };

  const DB_STR = (() => {
    const rnd = U.rng(5252), order = DB_BIRDS.map((b, i) => [Math.hypot(b[0] - DB_HEAD[0], b[1] - DB_HEAD[1]), i]).sort((p, q) => p[0] - q[0]);
    const out = [];
    order.forEach(([, i], r) => {
      for (let s = 0; s < 2; s++) {
        const lift = -60 + rnd() * 120 + s * 35, end = (rnd() - 0.5) * 10, b = DB_BIRDS[i];
        const a = [DB_HEAD[0] + U.gauss(rnd) * 6, DB_HEAD[1] + U.gauss(rnd) * 6];
        out.push({ bird: i, rank: r, pts: dbArc(a, [b[0] + (rnd() - 0.5) * 6, b[1] + (rnd() - 0.5) * 4], lift, end, 48), w: 0.9 + rnd() * 0.5, mul: 0.16 + rnd() * 0.12, seed: rnd(), warm: rnd() });
      }
    });
    return out;
  })();
  const DB_T0 = 0.055, DB_TW = 0.5;
  const dbCurves = () => DB_STR.map((s) => ({
    pts: s.pts.map((p) => wp(p[0], p[1])), curve: false, w: s.w, col: s.warm < 0.5 ? C.gold2 : C.gold, mul: s.mul, seed: s.seed,
    taper: true, fade: [0.3, 0.08], t: [s.rank * DB_T0, s.rank * DB_T0 + DB_TW],
  }));

  const DBR = [1].map((stage) => fnR('s5:dinobird' + stage, 5251, (P, cnt, rnd) => {
    const ak = 65536 / cnt, g2 = U.lin(C.gold2), gd = U.lin(C.gold), am = U.lin(C.amber), cr = U.lin(C.cream), wh = U.lin(C.white);
    const m0 = 0.06 * cnt, L = DB_STR.map((s) => polyLen(s.pts)), NS = DB_STR.length;
    for (let j = 0; j < cnt; j++) {
      const g1 = U.gauss(rnd), g2r = U.gauss(rnd), u = rnd(), u2 = rnd(), u3 = rnd(), u4 = rnd();
      let x, y, a, s = 1.4, c, aux;
      if (j < m0) { x = 80 + u * 1760; y = 60 + u2 * 940; a = 0.01; s = 1.2; c = mx(g2, cr, u3); aux = u * 0.02 + j * 1e-9; }
      else {
        const k = Math.min(NS - 1, Math.floor(u * NS)), st = DB_STR[k], f = Math.pow(u2, 0.85);
        const p = polyAt(st.pts, L[k], f), q = polyAt(st.pts, L[k], Math.min(1, f + 0.01));
        const tx = q[0] - p[0], ty = q[1] - p[1], tl = Math.hypot(tx, ty) || 1, halo = u3 < 0.3;
        const off = g1 * (halo ? 9 : 2.2) * (0.4 + f);
        x = p[0] - (ty / tl) * off + g2r * 0.8; y = p[1] + (tx / tl) * off + g2r * 0.8;
        const fe = U.smooth(0.04, 0.38, f);
        a = (halo ? 0.007 : 0.017) * fe * (u4 > 0.985 ? 3 : 1);
        c = u4 > 0.985 ? wh : mx(mx(am, gd, f), g2, u3);
        if (u4 > 0.985) s = 2.1;
        aux = 0.05 + f * 0.9 + j * 1e-9;
      }
      const p = wp(x, y);
      P.add(p[0], p[1], 0, s, c[0], c[1], c[2], Math.min(1, a * ak), aux);
    }
  }));
  const DB_WD = 2.2, DB_WV = 4.2;

  KS.scene({
    id: 'dinobird', sec: 5, title: '恐竜は、鳥として今も飛んでいる', swarm: true, world: WORLD(), images: ['dino_bird'],
    build(S) {
      const d = S.data;
      prep(S, DBR[0]);
      d.bg = K.photo(S, 'dino_bird', { z: -1200, w: 2200, fe: 90, exp: 0.88 });
      d.scT = S.div({ x: 0, y: 0, w: 1400, h: 440 });
      d.scT.style.background = 'radial-gradient(ellipse 60% 76% at 26% 26%, rgba(5,7,13,.6) 0%, rgba(5,7,13,.36) 50%, rgba(5,7,13,0) 100%)';
      d.scB = S.div({ x: 0, y: 600, w: 1500, h: 480 });
      d.scB.style.background = 'radial-gradient(ellipse 64% 92% at 16% 100%, rgba(5,7,13,.9) 0%, rgba(5,7,13,.66) 46%, rgba(5,7,13,0) 100%)';
      d.gH = K.glow(S, { x: DB_HEAD[0], y: DB_HEAD[1], size: 220, col: C.amber });
      d.gB = DB_BIRDS.map((b) => K.glow(S, { x: b[0], y: b[1], size: 96, col: C.gold2 }));
      d.rb = S.ribbon({ curves: dbCurves(), prog: 0, glow: 0.2, core: 0.75, head: 0.28, pulse: S.kf ? 0 : 0.7, pulseS: 0.12, pulseW: 0.04 });
      d.s1 = S.text('恐竜は絶滅したと言われるが、', { cls: 'serif', size: 46, x: 120, y: 112, color: C.white, ls: 0.04 });
      d.s2 = S.text('その系統は{鳥として今も空を飛んでいる}', { cls: 'serif', size: 46, x: 120, y: 182, color: C.white, ls: 0.04 });
      d.r0 = S.text('同じ「終わり」でも、', { cls: 'serif', size: 40, x: 120, y: 776, color: C.cream, ls: 0.03 });
      d.r1 = S.text('全部が止まってしまう終わり', { cls: 'serif', size: 38, x: 246, y: 850, color: 'rgba(176,182,198,.92)', ls: 0.03 });
      d.r2 = S.text('{次へ渡った終わり}', { cls: 'serif', size: 38, x: 246, y: 916, color: C.cream, ls: 0.03 });

      d.gs = K.svg(S);
      const y1 = 878, y2 = 944;
      d.k1 = [K.undrawn(K.line(d.gs, 124, y1, 198, y1, 'dim')), K.undrawn(K.line(d.gs, 202, y1 - 12, 202, y1 + 12, 'dim'))];
      d.k2 = [K.undrawn(K.line(d.gs, 124, y2, 162, y2)), K.undrawn(K.circle(d.gs, 172, y2, 9)), K.undrawn(K.line(d.gs, 182, y2, 226, y2, 'cy'))];
      d.src = K.src(S, '『人類という通過点』第12章「「人類絶滅」という一語を解体する」より');
    },
    steps: [
      (S) => {
        const d = S.data;
        K.reveal(d.bg, { dur: 2.8 });
        K.drift(S, d.bg, { zoom: 1.015, px: 0 });
        K.fade(d.scT, 1, { dur: 1.6, delay: 0.3 });
        TX.in(d.s1, 'rise', { delay: 0.8 });
        TX.in(d.s2, 'rise', { delay: 1.7 });
        glowTo(d.gH, 0.14, { delay: 2, dur: 1.6 });
        K.weave(d.rb, { dur: DB_WV, delay: DB_WD, ease: 'linear' });

        d.gB.forEach((g, i) => {
          if (!g || g.inert) return;
          const at = DB_WD + DB_WV * (DB_STR.find((s) => s.bird === i).rank * DB_T0 + DB_TW);
          T.to(g, { o: 0.5 }, { dur: 0.3, delay: at - 0.12, ease: 'outCubic' });
          T.to(g, { o: 0.14 }, { dur: 1.4, delay: at + 0.2, ease: 'inOutSine', overwrite: false });
        });
        K.sw(S, DBR[0], { dur: 3.8, delay: DB_WD + 0.3, ord: 1, amt: 0.3, spread: 30, ease: 'out' });
        look(S, { i: 1, size: 1.8, wob: 0.45, wobF: 0.4 });
        K.show(d.src, { delay: 3.6, dy: 8 });
      },
      (S) => {
        const d = S.data;
        K.fade(d.scB, 1, { dur: 1.4 });
        TX.in(d.r0, 'rise', { delay: 0.3 });
        K.draw(d.k1[0], { dur: 0.9, delay: 1.1, ease: 'inOutSine' });
        K.draw(d.k1[1], { dur: 0.3, delay: 2.0 });
        TX.in(d.r1, 'rise', { delay: 1.3 });
        K.draw(d.k2[0], { dur: 0.5, delay: 2.5, ease: 'inSine' });
        K.draw(d.k2[1], { dur: 0.5, delay: 2.95 });
        K.draw(d.k2[2], { dur: 0.7, delay: 3.4, ease: 'outSine' });
        TX.in(d.r2, 'rise', { delay: 2.7 });

        if (d.rb && !d.rb.inert) T.to(d.rb, { glow: 0.3, core: 0.9 }, { dur: 1.8, delay: 3.2, ease: 'inOutSine' });
        d.gB.forEach((g, i) => glowTo(g, 0.22, { delay: 3.3 + i * 0.08, dur: 1.4 }));
        glowTo(d.gH, 0.1, { delay: 1.2, dur: 1.6 });
        look(S, { i: 1.15, size: 1.8, wob: 0.45, wobF: 0.4 }, 2);
      },
    ],
  });
})();
