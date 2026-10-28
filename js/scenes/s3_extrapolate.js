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
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  const sm = (a, b, x) => U.smooth(a, b, x);

  KS.scene({
    id: 'sec3', sec: 3, title: 'PART 03　この先に延ばしてみると', swarm: true,
    world: WORLD(),
    build(S) {
      S.data.card = K.card(S, { no: 3, y: 300, label: 'この先に\n延ばしてみると', sub: '一人で、どこまで ／ 人口の上限がない\n方向ははっきりしている ／ アキレス点バイアス' });
    },
    steps: [(S) => { S.data.card.in({ delay: 0 }); }],
  });

  const SCX = 1290, SCY = 545;
  const SC_V = [1, 10, 200, 2000, 20000, 2e5, 3.2e6];
  const SC_S = SC_V.map(Math.sqrt);
  const SC_U = 620;
  const SC_L = [0, 1, 3, 5, 6];
  const SC_Z = [620, 620 / SC_S[1], 620 / SC_S[3], 620 / SC_S[5], 760 / SC_S[6]];
  const SC_LAB = ['年間 数十億円', '数百億円', '1兆円', '10兆円', '100兆円', '1,000兆円', '人類の活動全体'];
  const SC_NC = 9;

  const SC_C = (() => {
    const out = [];
    let prev = null;
    SC_Z.forEach((z, k) => {
      const L = SC_L[k], w = [];
      for (let l = 0; l <= L; l++) w.push((SC_V[l] - (l ? SC_V[l - 1] : 0)) * z * z * Math.min(8, Math.pow(2, L - l)));
      const tot = w.reduce((a, b) => a + b, 0);
      let acc = 0;
      const c = w.map((v) => (acc += v / tot));
      c[L] = 1;
      if (prev) for (let l = 0; l < L; l++) c[l] = Math.min(c[l], l < prev.length ? prev[l] : 1);
      out.push(c);
      prev = c;
    });
    return out;
  })();

  const sqB = (t) => {
    const k = Math.floor(t) & 3, f = (t - Math.floor(t)) * 2 - 1;
    return k === 0 ? [1, f] : k === 1 ? [-f, 1] : k === 2 ? [-1, -f] : [f, -1];
  };
  const ringAB = (l) => [(l ? SC_S[l - 1] : 0) * SC_U / 2, SC_S[l] * SC_U / 2];

  const SC_CT = SC_S.map((_, l) => {
    const [a, b] = ringAB(l), out = [];
    for (let c = 0; c < SC_NC; c++) {
      if (!l && !c) { out.push({ x: 0, y: 0, sg: b * 0.07 }); continue; }
      const t = ((c + 0.5 + 0.7 * (hash(l, c) - 0.5)) / SC_NC) * 4, v = 0.2 + 0.6 * hash(c + 11, l + 5);
      const rho = l ? Math.sqrt(a * a + v * (b * b - a * a)) : b * (0.3 + 0.55 * v), q = sqB(t);
      out.push({ x: q[0] * rho, y: q[1] * rho, sg: (b - a) * (0.045 + 0.075 * hash(l + 3, c + 2)) });
    }
    return out;
  });

  const fitRing = (x, y, a, b) => {
    const q = Math.max(Math.abs(x), Math.abs(y)) || 1e-6;
    let k = q > b ? (2 * b - q) / q : q < a ? (2 * a - q) / q : 1;
    const q2 = q * Math.abs(k);
    if (q2 > b || q2 < a) k = (q > b ? b * 0.99 : a * 1.01) / q;
    return [x * k, y * k];
  };
  const SC_COOL = [U.lin('#9fdcff'), U.lin('#d8f1ff')];
  const SCR = SC_L.map((L, st) => fnR('s3:sc' + st, 5401, (P, cnt, rnd) => {
    const ak = 65536 / cnt, cum = SC_C[st];
    const cg = U.lin(C.gold2), ca = U.lin(C.amber), cc = U.lin(C.cream), cw = U.lin(C.white);
    for (let i = 0; i < cnt; i++) {
      const r1 = rnd(), r2 = rnd(), r3 = rnd(), r4 = rnd(), r5 = rnd(), r6 = rnd(), r7 = rnd(), r8 = rnd(), r9 = rnd();
      const g1 = U.gauss(rnd), g2 = U.gauss(rnd);
      const u = (i + 0.5) / cnt;
      let l = 0;
      while (l < L && u >= cum[l]) l++;
      const [a, b] = ringAB(l), ct = SC_CT[l], dim = 1 / Math.sqrt(Math.min(8, Math.pow(2, L - l)));
      const cool = r9 < Math.min(0.45, 0.075 * l);
      let x, y, sz, col, al;
      if (r1 < 0.4) {
        const k = ct[Math.floor(r4 * SC_NC)];
        x = k.x + g1 * k.sg; y = k.y + g2 * k.sg;
        sz = 1.6 + 0.35 * r7; al = 0.3;
        col = cool ? SC_COOL[0] : mx(cg, ca, r6 * 0.55);
      } else if (r1 < 0.54) {
        const k = ct[Math.floor(r4 * SC_NC)], h = 2.2 * k.sg;
        x = k.x + g1 * h; y = k.y + g2 * h;
        sz = 1.35 + 0.25 * r7; al = 0.075;
        col = cool ? SC_COOL[0] : mx(cg, cc, 0.5 * r6);
      } else if (r1 < 0.76) {
        const c1 = Math.floor(r4 * SC_NC), A = l ? ct[c1] : ct[0], B = l ? ct[(c1 + 1) % SC_NC] : ct[1 + (c1 % (SC_NC - 1))];
        const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy) || 1;
        const bow = Math.sin(Math.PI * r5) * (l ? 0.14 : 0.22) * len * (hash(l, c1 + 30) - 0.5);
        const fs = (b - a) * 0.008;
        x = A.x + dx * r5 - (dy / len) * bow + g1 * fs; y = A.y + dy * r5 + (dx / len) * bow + g2 * fs;
        sz = 1.45; al = 0.24;
        col = cool ? SC_COOL[1] : mx(cg, cc, 0.35 * r6);
      } else if (r1 < 0.96) {
        const k = ct[Math.floor(r4 * SC_NC)], h = (4.2 + 1.6 * r3) * k.sg;
        x = k.x + g1 * h; y = k.y + g2 * h;
        sz = 2.6 + 1.6 * r7; al = 0.028;
        col = cool ? SC_COOL[0] : mx(cg, cc, 0.5 * r6);
      } else {
        const k = ct[Math.floor(r4 * SC_NC)], h = 1.9 * k.sg;
        x = k.x + g1 * h; y = k.y + g2 * h;
        sz = 2.1 + 0.8 * r7; al = 0.62;
        col = cool ? SC_COOL[1] : r6 < 0.5 ? cw : cg;
      }
      const f = fitRing(x, y, a, b);
      P.add(f[0], f[1], 0, sz, col[0], col[1], col[2], Math.min(1, al * dim * ak), u);
    }
  }));

  const SC_SEED = fnR('s3:scseed', 5401, (P, cnt, rnd) => {
    const ak = 65536 / cnt, cg = U.lin(C.gold2);
    for (let i = 0; i < cnt; i++) {
      const g1 = U.gauss(rnd), g2 = U.gauss(rnd);
      P.add(g1 * 6, g2 * 6, 0, 1.6, cg[0], cg[1], cg[2], Math.min(1, 0.02 * ak), (i + 0.5) / cnt);
    }
  });
  const SC_ROWS = [
    ['この夏', '年間 {数十億円}'],
    ['数か月〜1年後', '{数百億円}'],
    ['その先', '{1兆円} → {10兆円}'],
    ['さらに', '{100兆円} → {1,000兆円}'],
    ['ゆくゆくは', '{人類の活動全体}'],
  ];
  const SC_RY = (k) => 428 + 72 * k;
  const SC_DUR = [0, 2.6, 3.4, 3.0, 2.8];
  const scRow = (S, k, delay) => {
    const d = S.data, r = d.rows[k];
    if (k) {
      TX.dim(d.rows[k - 1].val, 0.42, { dur: 0.8, delay });
      K.draw(r.seg, { dur: 0.6, delay });
    }
    K.fade(r.dot, 1, { dur: 0.5, delay: delay + 0.45 });
    K.show(r.cap, { dy: 8, delay: delay + 0.45 });
    K.show(r.val, { dy: 12, delay: delay + 0.6 });
  };
  const scZoom = (S, k) => {
    const d = S.data, c = d.c, Dz = SC_DUR[k];
    T.to(d.zm, { lz: Math.log(SC_Z[k]) }, { dur: Dz, delay: 0.1, ease: 'inOutCubic' });
    if (!d.fx.inert) d.fx.morph(SCR[k], { x: c[0], y: c[1], z: 0, dur: Dz * 1.1, delay: 0.1 + Dz * 0.22, ord: 0.55, amt: 0.45, spread: (30 * SC_U) / SC_Z[k], ease: 'out' });
    scRow(S, k, 0.5);
  };

  KS.scene({
    id: 'scale', sec: 3, title: '私一人の仕事を、この先に延ばすと', swarm: false,
    world: WORLD('deep'),
    build(S) {
      const d = S.data, sv = (d.svg = K.svg(S)), c = (d.c = S.at(SCX, SCY, 0));
      d.zm = { lz: Math.log(SC_Z[0]) };
      d.gate = { v: 0 };
      d.fx = K.ps(S, { side: KS.world.tier === 'low' ? 128 : 256, o: 0, i: 1, size: 2.0, wob: 0, order: 30 });
      if (!d.fx.inert) {
        SCR.forEach((R) => S.prep(R, d.fx.N));
        d.fx.set(SC_SEED, { x: c[0], y: c[1], z: 0 });
      }
      d.nuc = K.glow(S, { x: SCX, y: SCY, z: 10, size: 90, col: C.gold2, mul: 1.2, o: 0 });
      d.fr = SC_S.map(() => K.node(sv, 'rect', { class: 'k-ln thin', x: 0, y: 0, width: 0, height: 0, style: 'opacity:0;fill:rgba(242,183,102,.026)' }));
      d.lab = SC_LAB.map((t) => {
        const el = S.text(t, { x: 0, y: 0, anchor: 'bl', cls: 'serif', size: 28, color: C.gold2, ls: 0.04 });
        el.style.transformOrigin = '0 100%';
        return el;
      });
      d.hd = K.head(S, '私一人の仕事を、\nこの先に延ばすと', { eye: 'SCALE', size: 52 });
      d.unit = K.cap(S, '仕事の量を、外注した場合の金額に換算して\n「この夏」は、先ほどの7月の1か月分を1年に直した数字', { x: 120, y: 318, size: 22 });
      d.rows = SC_ROWS.map(([cap, val], k) => ({
        cap: K.cap(S, cap, { x: 120, y: SC_RY(k), anchor: 'cl', size: 21 }),
        val: K.h(S, val, { x: 322, y: SC_RY(k), anchor: 'cl', size: 40, lh: 1.2 }),
        dot: hid(K.circle(sv, 294, SC_RY(k), 4.5, '', { style: 'fill:#f2b766;stroke:none' })),
        seg: k ? K.undrawn(K.line(sv, 294, SC_RY(k - 1) + 11, 294, SC_RY(k) - 11, 'thin dim')) : null,
      }));
      d.big = K.chip(S, '大企業レベル', { x: 664, y: SC_RY(2), anchor: 'cl' });
      d.me = K.chip(S, '私', { x: 1146, y: 676, anchor: 'cc' });
      d.meL = K.undrawn(K.line(sv, 1166, 656, 1281, 553, 'thin'));
      d.aside = K.body(S, 'そのはるか手前で、私が関わる意味は\nなくなっていると思いますが', { x: 120, y: 790, size: 28, color: DIM });
    },
    steps: [
      (S) => {
        const d = S.data, c = d.c;
        d.hd.in({ delay: 0 });
        glowTo(d.nuc, 0.95, { dur: 0.8, delay: 0.3 });
        T.to(d.gate, { v: 1 }, { dur: 1.6, delay: 1.2, ease: 'inOutSine' });
        if (!d.fx.inert) {
          T.to(d.fx, { o: 1 }, { dur: 0.5, delay: 0.4 });
          d.fx.morph(SCR[0], { x: c[0], y: c[1], z: 0, dur: 3.6, delay: 0.5, ord: 0.25, amt: 0.55, spread: 60, ease: 'out' });
        }
        scRow(S, 0, 1.0);
        K.show(d.unit, { delay: 0.6, dy: 6 });
      },
      (S) => scZoom(S, 1),
      (S) => {
        scZoom(S, 2);
        K.show(S.data.big, { dy: 8, delay: 2.8 });
      },
      (S) => scZoom(S, 3),
      (S) => scZoom(S, 4),
      (S) => {
        const d = S.data;
        K.draw(d.meL, { dur: 0.8, delay: 0.2, reverse: true });
        K.show(d.me, { dy: 6, delay: 0.7 });
        K.show(d.aside, { delay: 1.1 });
        glowTo(d.nuc, 1.25, { dur: 0.9, delay: 0.3 });
      },
    ],
    update(S) {
      const d = S.data;
      if (!d.zm) return;
      const z = Math.exp(d.zm.lz), c = d.c, g = d.gate.v, n = SC_S.length;
      if (!d.fx.inert) {
        const m = d.fx.m;
        m.s = z / SC_U;
        m.px = c[0]; m.py = c[1]; m.pz = 0;
        m.x = 0; m.y = 0; m.z = 0;
        d.fx.wob = 0.45 / m.s;
      }

      const side = SC_S.map((s) => s * z), app = side.map((sd) => g * (1 - sm(800, 1000, sd)));
      for (let l = 0; l < n; l++) {
        const sd = side[l], hi = app[l] * (1 - (l + 1 < n ? app[l + 1] : 0)), q = 1 - hi, fr = d.fr[l];
        const o = app[l] * sm(2, 8, sd) * (0.42 + 0.58 * hi);
        fr.setAttribute('x', (SCX - sd / 2).toFixed(2));
        fr.setAttribute('y', (SCY - sd / 2).toFixed(2));
        fr.setAttribute('width', sd.toFixed(2));
        fr.setAttribute('height', sd.toFixed(2));
        fr.style.opacity = o.toFixed(3);
        fr.style.stroke = 'rgb(' + Math.round(242 + q) + ',' + Math.round(183 + 51 * q) + ',' + Math.round(102 + 114 * q) + ')';
        fr.style.strokeWidth = (1.1 + 0.5 * hi).toFixed(2);
        const lo = app[l] * sm(120, 200, sd) * (1 - sm(1100, 1500, sd)) * (0.66 + 0.34 * hi);
        T.setEl(d.lab[l], { x: SCX - sd / 2, y: SCY - sd / 2 - 10, s: U.clamp(0.55 + (0.45 * (sd - 200)) / 420, 0.55, 1), o: lo });
      }
      if (d.nuc && !d.nuc.inert) d.nuc.size = 16 + 74 * sm(8, 620, z);
    },
  });

  const NL_HX = 430, NL_HY = 702, NL_HR = 158;
  const NL_OX = 1170, NL_OY = 640;
  const NL_GS = 38, NL_TS = 22;
  const NL_RX = 1330, NL_RY = 590, NL_RR = 250;
  const NL_TILES = (() => {
    const out = [];
    for (let gx = -8; gx <= 22; gx++) for (let gy = -18; gy <= 13; gy++) {
      const x = NL_OX + gx * NL_GS, y = NL_OY + gy * NL_GS;
      if (x < 890 || x > 1990 || y < -30 || y > 1110) continue;
      out.push({ x, y, dist: Math.hypot(x - NL_OX, y - NL_OY) + 6 * hash(gx, gy), ang: Math.atan2(y - NL_RY, x - NL_RX), h: hash(gx + 40, gy + 40), e: hash(gx + 90, gy + 17) });
    }
    out.sort((a, b) => a.dist - b.dist);
    return out;
  })();
  const NL_BYANG = NL_TILES.slice().sort((a, b) => a.ang - b.ang);
  const NL_CITY = Array.from({ length: 34 }, (_, c) => {
    const r = NL_HR * 0.9 * Math.sqrt(hash(c, 3)), a = TAU * hash(c, 7);
    return { x: Math.cos(a) * r, y: Math.sin(a) * r, sg: 5 + 10 * hash(c, 11) };
  });

  const nlTile = (t, r1, r2, r3, g1, g2, sc = 1) => {
    const ts = NL_TS * sc, hs = ts / 2;
    if (r1 < 0.76) { const q = sqB(r2 * 4); return [t.x + q[0] * hs + g1 * 0.3, t.y + q[1] * hs + g2 * 0.3, 0]; }
    if (r1 < 0.88) return [t.x + (r2 - 0.5) * ts * 0.8, t.y + (r3 - 0.5) * ts * 0.8, 1];
    return [t.x + g1 * 0.6 * sc * sc, t.y + g2 * 0.6 * sc * sc, 2];
  };
  const NLR = [0, 1, 2].map((st) => fnR('s3:nl' + st, 5402, (P, cnt, rnd) => {
    const ak = 65536 / cnt, nH = Math.floor(cnt * 0.3), nC = cnt - nH, nT = NL_TILES.length, k0 = Math.max(1, Math.round((420 * nT) / nC));
    const cg = U.lin(C.gold2), ca = U.lin(C.amber), cw = U.lin(C.white), cy = U.lin(C.cyan), cb = U.lin(C.blue), cl = U.lin('#d8f1ff');
    for (let i = 0; i < cnt; i++) {
      const r1 = rnd(), r2 = rnd(), r3 = rnd(), r4 = rnd(), g1 = U.gauss(rnd), g2 = U.gauss(rnd);
      const aux = (i + 0.5) / cnt;
      let x, y, sz, col, al;
      if (i >= nC) {
        if (r1 < 0.68) {
          const rr = NL_HR * Math.sqrt(r2), a = TAU * r3;
          x = NL_HX + Math.cos(a) * rr; y = NL_HY + Math.sin(a) * rr;
          sz = 1.5 + 0.4 * r4; al = 0.13; col = mx(cg, ca, 0.55 * r4);
        } else if (r1 < 0.93) {
          const k = NL_CITY[Math.floor(r2 * NL_CITY.length)];
          x = NL_HX + k.x + g1 * k.sg; y = NL_HY + k.y + g2 * k.sg;
          sz = 1.6; al = 0.26; col = mx(cg, cw, 0.25 * r4);
        } else {
          const rr = NL_HR * Math.sqrt(r2), a = TAU * r3;
          x = NL_HX + Math.cos(a) * rr; y = NL_HY + Math.sin(a) * rr;
          sz = 2.2 + 0.6 * r4; al = 0.6; col = r4 < 0.5 ? cw : cg;
        }
        const e = Math.hypot(x - NL_HX, y - NL_HY);
        if (e > NL_HR) { const k = NL_HR / e; x = NL_HX + (x - NL_HX) * k; y = NL_HY + (y - NL_HY) * k; }
      } else {
        const k = Math.min(nT - 1, Math.floor((i * nT) / nC)), t = NL_TILES[k];
        const p = st === 0 ? nlTile(NL_TILES[0], r1, r2, r3, g1, g2, 2.2) : nlTile(t, r1, r2, r3, g1, g2);
        x = p[0]; y = p[1];
        sz = p[2] === 2 ? 2.3 : 1.5; col = p[2] === 0 ? mx(cy, cl, 0.3 * r4) : p[2] === 1 ? mx(cb, cy, r4) : cl;
        al = p[2] === 0 ? 0.42 : p[2] === 1 ? 0.12 : 0.7;
        const fall = 1 - 0.7 * sm(260, 1000, t.dist), hot = t.h > 0.86, edge = sm(880, 1120, t.x);
        al *= fall * (hot ? (p[2] === 0 ? 1.15 : 2.2) : 0.32 + 0.5 * t.h * t.h) * (0.35 + 0.65 * edge);
        if (t.e > 0.25 + edge || (t.x > 1690 && t.y > 990)) al = 0;
        if (hot && p[2] === 2) sz = 2.8;
        if (st === 0) al = k >= k0 ? 0 : (p[2] === 0 ? 0.16 : p[2] === 1 ? 0.025 : 0.3) / ak;
        if (st === 2) al *= Math.hypot(t.x - NL_RX, t.y - NL_RY) < NL_RR + 70 ? 0.07 : 0.3;
      }
      const q = wp(x, y);
      P.add(q[0], q[1], 0, sz, col[0], col[1], col[2], Math.min(1, al * ak), aux);
    }
  }));

  const NL_ANN = NL_BYANG.filter((t) => Math.abs(Math.hypot(t.x - NL_RX, t.y - NL_RY) - NL_RR) < 64);
  const NL_PHI = [0, 1, 2].map((k) => -Math.PI / 2 + (k * TAU) / 3);
  const nlComet = (a) => {
    let b = 0;
    NL_PHI.forEach((p) => { const dl = (((p - a) % TAU) + TAU) % TAU; b = Math.max(b, Math.exp(-dl / 0.55)); });
    return b;
  };
  const NLG = [0, 1].map((st) => fnR('s3:nlr' + st, 5403, (P, cnt, rnd) => {
    const ak = 16384 / cnt, nA = NL_ANN.length;
    const cy = U.lin(C.cyan), cl = U.lin('#d8f1ff'), cw = U.lin(C.white), cb = U.lin(C.blue);
    for (let i = 0; i < cnt; i++) {
      const r1 = rnd(), r2 = rnd(), r3 = rnd(), r4 = rnd(), g1 = U.gauss(rnd), g2 = U.gauss(rnd);
      const aux = (i + 0.5) / cnt, t = NL_ANN[Math.min(nA - 1, Math.floor(aux * nA))];
      let x, y, sz, col, al;
      if (st === 0) {
        const p = nlTile(t, r1, r2, r3, g1, g2);
        x = p[0]; y = p[1];
        sz = p[2] === 2 ? 2.3 : 1.5; col = p[2] === 2 ? cl : mx(cy, cl, 0.3 * r4);
        al = (p[2] === 1 ? 0.1 : 0.34) * (1 - 0.72 * sm(260, 980, t.dist));
      } else {
        const a = -Math.PI + TAU * aux + 0.004 * g2, b = nlComet(a);
        const rr = NL_RR + (r1 < 0.62 ? g1 * (1.8 + 1.6 * b) : r1 < 0.92 ? g1 * (9 + 5 * b) : g1 * 3);
        x = NL_RX + Math.cos(a) * rr; y = NL_RY + Math.sin(a) * rr;
        if (r1 < 0.62) { sz = 1.5 + 0.9 * b; al = 0.1 + 0.5 * b; col = mx(mx(cb, cy, 0.6 + 0.4 * r4), cl, b); }
        else if (r1 < 0.92) { sz = 2.2 + 1.2 * b; al = 0.03 + 0.08 * b; col = mx(cb, cy, r4); }
        else { sz = 2.0 + 1.4 * b; al = 0.12 + 0.75 * b * b; col = mx(cl, cw, b); }
      }
      const q = wp(x, y);
      P.add(q[0], q[1], 0, sz, col[0], col[1], col[2], Math.min(1, al * ak), aux);
    }
  }));

  const WD_D = KS.DIST;
  const WD_A = { h: 640, th: 11, zb: 0 }, WD_B = { h: 4200, th: 16, zb: 8000 };
  const WD_R = 175, WD_SX = 540, WD_SZ = 560;

  const wdCam = (c, X, Y, F) => {
    const t = c.th * U.deg, dy = Y - c.h, dz = F + c.zb;
    return [X, dy * Math.cos(t) + dz * Math.sin(t), -dy * Math.sin(t) + dz * Math.cos(t)];
  };
  const wdScr = (c, X, Y, F) => { const q = wdCam(c, X, Y, F); return [960 + (WD_D * q[0]) / q[2], 540 - (WD_D * q[1]) / q[2], q[2]]; };

  const WD_M = (() => {
    const dY = WD_B.h - WD_A.h, dZ = WD_B.zb - WD_A.zb, t = WD_B.th * U.deg;
    return { x: 0, y: -dY * Math.cos(t) + dZ * Math.sin(t), z: -(dY * Math.sin(t) + dZ * Math.cos(t)), rx: WD_B.th - WD_A.th };
  })();
  const wdPos = (i, j) => [(i + 0.5 * (j & 1)) * WD_SX + (hash(i + 51, j + 7) - 0.5) * 0.64 * WD_SX, 700 + j * WD_SZ + (hash(j + 13, i + 77) - 0.5) * 0.64 * WD_SZ];
  const WD_GP = wdPos(-1, 3);

  const WD_W = (() => {
    const out = [], hA = WD_A.h, hB = WD_B.h;
    for (let j = -8; j <= 69; j++) for (let i = -90; i <= 90; i++) {
      const p = wdPos(i, j), X = p[0], F = p[1], a = wdScr(WD_A, X, 0, F), b = wdScr(WD_B, X, 0, F);
      const inA = F > 0 && a[2] > 200 && a[0] > -250 && a[0] < 2170 && a[1] > 200 && a[1] < 1250;
      const inB = b[2] > 200 && b[0] > -250 && b[0] < 2170 && b[1] > -150 && b[1] < 1250;
      const gold = i === -1 && j === 3;
      if ((!inA && !inB) || (!gold && hash(i + 101, j + 57) < 0.12)) continue;
      const big = !gold && hash(i + 17, j + 43) < 0.07;
      const R = gold ? WD_R : WD_R * (0.75 + 0.4 * hash(i + 3, j + 91)) * (big ? 1.5 : 1);
      const aA = inA ? Math.pow((WD_D * R) / a[2], 2) * (hA / Math.hypot(hA, F + WD_A.zb)) : 0;
      const aB = inB ? Math.pow((WD_D * R) / b[2], 2) * (hB / Math.hypot(hB, F + WD_B.zb)) : 0;
      const tw = Array.from({ length: 6 }, (_, k) => {
        const r = 0.75 * R * Math.sqrt(hash(i * 7 + k, j * 3 + 1)), an = TAU * hash(i + k * 13, j - 5);
        return [Math.cos(an) * r, Math.sin(an) * r, 0.4 + 0.6 * hash(i + k * 5, j + 29)];
      });
      const key = gold ? 1e9 : Math.hypot(X - WD_GP[0], F - WD_GP[1]) + 900 * hash(i + 7, j + 3) + (inA ? 0 : 1e6);
      out.push({ i, j, X, F, R, gold, fA: a[2], fB: b[2], aA, aB, tw, ph: 0.8 + 0.8 * hash(i + 31, j + 17), lum: gold ? 1 : (big ? 1.5 : 0.5 + 0.9 * Math.pow(hash(i + 61, j + 23), 2)), key });
    }
    return out.sort((a, b) => a.key - b.key);
  })();
  const WD_GW = WD_W[WD_W.length - 1];

  const WD_N = {};
  const wdAlloc = (cnt) => {
    if (WD_N[cnt]) return WD_N[cnt];
    const n = WD_W.length - 1, base = cnt >= 32768 ? 2 : 1, rest = cnt - Math.round(cnt * 0.06) - base * n;
    const sw = WD_W.reduce((s, w) => s + (w.gold ? 0 : Math.max(w.aA, w.aB)), 0), cnts = [], nA = [], nB = [];
    let acc = 0, prev = 0;
    WD_W.forEach((w, k) => {
      nA.push(0.35 + (rest * w.aA) / sw); nB.push(0.35 + (rest * w.aB) / sw);
      if (w.gold) return cnts.push(cnt - prev);
      acc += Math.max(w.aA, w.aB);
      const c = Math.round(base * (k + 1) + (rest * acc) / sw);
      cnts.push(c - prev); prev = c;
    });
    return (WD_N[cnt] = { cnts, nA, nB });
  };
  const WD_COL = { c: [C.blue, C.cyan, '#d8f1ff', '#bfe9ff', C.white].map((c) => U.lin(c)), g: [C.amber, C.gold2, C.gold, C.gold2, C.white].map((c) => U.lin(c)) };

  const WDR = [0, 1, 2, 3].map((st) => fnR('s3:wd' + st, 5404, (P, cnt, rnd) => {
    const ak = 65536 / cnt, al = wdAlloc(cnt);
    let i = 0;
    WD_W.forEach((w, k) => {
      const n = al.cnts[k], dot = n < 24, gold = w.gold, cs = gold ? WD_COL.g : WD_COL.c, R = w.R;
      const on = st >= 2 || (st === 1 && gold), vis = st === 0 ? 0 : st === 1 ? (gold ? 1 : 0) : 1;
      const fv = st === 3 ? w.fB : Math.max(w.fA, 300);
      const dens = Math.min(1, (st === 3 ? al.nB[k] : al.nA[k]) / n) * (1 - 0.7 * sm(9000, 46000, fv)) * (1 - 0.8 * sm(24000, 39600, w.F)) * (gold ? (st === 3 ? 5 : 4.2) : w.lum);
      for (let e = 0; e < n; e++, i++) {
        const r1 = rnd(), r2 = rnd(), r3 = rnd(), r4 = rnd(), g1 = U.gauss(rnd), g2 = U.gauss(rnd);
        let x = 0, y = 0, z = 0, px, a, col;
        if (dot) {
          x = g1 * 0.25 * R; z = g2 * 0.25 * R; px = 2.8; a = 1; col = mx(cs[1], cs[2], r4);
        } else if (r1 < 0.46) {
          const rr = R * Math.sqrt(r2), an = TAU * r3;
          x = Math.cos(an) * rr; z = Math.sin(an) * rr; px = 2.0; a = 0.35; col = mx(cs[0], cs[1], r4);
        } else if (r1 < 0.7) {
          const t = w.tw[Math.floor(r2 * 6)];
          x = t[0] + g1 * 0.07 * R; z = t[1] + g2 * 0.07 * R; px = 2.4; a = 0.85; col = mx(cs[1], cs[2], 0.5 * r4);
        } else if (r1 < 0.8) {
          const an = TAU * r2, rr = R * (1 + 0.015 * g1);
          x = Math.cos(an) * rr; z = Math.sin(an) * rr; px = 2.0; a = 0.7; col = cs[1];
        } else if (r1 < 0.84) {
          x = g1 * 0.05 * R; z = g2 * 0.05 * R; px = 3.2; a = 1; col = mx(cs[2], cs[4], r4);
        } else {
          const t = w.tw[Math.floor(r3 * 6)], hh = Math.pow(r2, 1.5);
          x = t[0] + g1 * 0.02 * R; z = t[1] + g2 * 0.02 * R; y = w.ph * t[2] * R * hh;
          px = 1.8; a = 0.6 * (1 - hh) * (st === 3 ? 0.45 : 1); col = cs[3];
        }
        if (!on) { x = 0; y = 0; z = 0; }
        const q = wdCam(WD_A, w.X + x, y, w.F + z);
        P.add(q[0], q[1], WD_D - q[2], (px * fv) / (2 * WD_D), col[0], col[1], col[2], Math.min(1, a * dens * vis * ak), (i + 0.5) / cnt);
      }
    });
  }));
  KS.scene({
    id: 'nolimit', sec: 3, title: 'AIには、人口の上限がない', swarm: true, kf: [2, 3, 4, 5],
    images: ['chip_world'],
    world: WORLD('deep'),
    build(S) {
      const d = S.data, sv = (d.svg = K.svg(S));
      NLR.forEach((R) => prep(S, R));
      WDR.forEach((R) => prep(S, R));
      d.rg = K.ps(S, { side: KS.world.tier === 'low' ? 64 : 128, o: 0, i: 1, size: 2.0, wob: 0.4, order: 31 });
      if (!d.rg.inert) {
        NLG.forEach((R) => S.prep(R, d.rg.N));
        d.rg.set(NLG[0], { x: 0, y: 0, z: 0 });
        const pv = S.at(NL_RX, NL_RY, 0);
        d.rg.m.px = pv[0]; d.rg.m.py = pv[1]; d.rg.m.pz = 0;
      }

      d.bg = K.photo(S, 'chip_world', { z: -1200, w: 2200, y: 623, fe: 90, exp: 0.8 });
      d.scrim = S.div({ x: 0, y: 0, w: 1920, h: 1080 });
      d.scrim.style.background = 'radial-gradient(ellipse 1300px 560px at 0% 0%, rgba(5,7,13,.85) 0%, rgba(5,7,13,.6) 50%, rgba(5,7,13,0) 100%)';
      d.hd = K.head(S, 'AIには、\n人口の上限がない', { eye: 'NO CEILING', size: 56 });
      d.bound = K.undrawn(K.circle(sv, NL_HX, NL_HY, NL_HR + 18, 'thin'));
      d.hum = K.h(S, '人間　{80億人}', { x: NL_HX, y: NL_HY + NL_HR + 44, anchor: 'tc', size: 44, lh: 1.2 });
      d.agL = K.label(S, 'AIのエージェント', { x: NL_OX, y: NL_OY + 46, anchor: 'tc', size: 24, color: '#bfe9ff' });
      d.ag = K.glow(S, { x: NL_OX, y: NL_OY, z: 4, size: 64, col: C.cyan, mul: 1.0, o: 0 });
      d.b2 = K.body(S, '何十、何百と並べて\n{24時間365日}、動かせる', { x: 120, y: 356 });
      d.b3 = K.body(S, 'その輪が、\n{回り始めている}', { x: 120, y: 356 });
      d.ring = K.say(S, 'AIが\nAIの開発を\n{速くする}', { x: NL_RX, y: NL_RY, size: 40, lh: 1.5 });
      d.heads = NL_PHI.map(() => K.glow(S, { x: NL_RX, y: NL_RY - NL_RR, z: 6, size: 70, col: '#bfe9ff', mul: 1.1, o: 0 }));
      d.hv = { o: 0 };
      d.a = K.h(S, '人間の社会全体に匹敵する規模のものが、\n計算機の中に、{無数に}立ち上がってくる', { x: 120, y: 104, size: 46 });
      d.b = K.h(S, 'その中で、人間の社会は\n全体の{ごく一部}になっていく', { x: 120, y: 104, size: 46 });
      d.hl = K.chip(S, '人間の社会', { x: 0, y: 0, anchor: 'tc' });
      d.gg = K.glow(S, { x: 0, y: 0, z: 0, size: 200, col: C.gold2, mul: 1.0, o: 0 });

      const g = WD_GW, o = wdScr(WD_B, g.X, 0, g.F), hw = wdScr(WD_B, g.X + g.R, 0, g.F)[0] - o[0];
      const hh = (wdScr(WD_B, g.X, 0, g.F - g.R)[1] - wdScr(WD_B, g.X, 0, g.F + g.R)[1]) / 2;
      d.wring = K.undrawn(K.node(sv, 'ellipse', { class: 'k-ln thin', cx: o[0], cy: o[1] - 4, rx: 1.8 * hw, ry: 1.8 * hh + 6 }));
      d.stage = 0;
    },
    steps: [
      (S) => {
        const d = S.data;
        d.hd.in({ delay: 0 });
        K.sw(S, NLR[0], { dur: 3.2, ord: 1, amt: 0.5, spread: 90, ease: 'out' });
        look(S, { wob: 0.7, wobF: 0.6 });
        K.draw(d.bound, { dur: 2.2, delay: 1.3, ease: 'inOutCubic' });
        K.show(d.hum, { dy: 12, delay: 1.7 });
        glowTo(d.ag, 0.5, { dur: 1.0, delay: 2.4 });
        K.show(d.agL, { dy: 8, delay: 2.7 });
      },
      (S) => {
        const d = S.data;
        K.sw(S, NLR[1], { dur: 4.8, ord: 1, amt: 0.8, spread: 24, ease: 'out' });
        look(S, { wob: 0.5, wobF: 0.6, twk: 0.45 }, 2.0);
        glowTo(d.ag, 0.22, { dur: 1.6, delay: 0.4 });
        K.hide(d.agL, { dur: 0.8, delay: 0.5 });
        K.show(d.b2, { delay: 0.9 });
      },
      (S) => {
        const d = S.data;
        K.sw(S, NLR[2], { dur: 1.8, ord: 0, amt: 0, spread: 0, ease: 'out' });
        look(S, { wob: 0.5, wobF: 0.6, twk: 0.25 }, 1.5);
        glowTo(d.ag, 0, { dur: 0.8 });
        K.hide(d.b2, { dur: 0.6 });
        K.show(d.b3, { delay: 0.8 });
        if (!d.rg.inert) {
          T.to(d.rg, { o: 1 }, { dur: 0.6 });
          d.rg.morph(NLG[1], { x: 0, y: 0, z: 0, dur: 2.8, delay: 0.3, ord: 1, amt: 0.55, spread: 30, ease: 'out' });
          T.to(d.rg.spin, { z: -72 }, { dur: 12, delay: 2.6, ease: 'inQuad' });
        }
        T.to(d.hv, { o: 1 }, { dur: 1.2, delay: 2.4, ease: 'inOutSine' });
        K.show(d.ring, { delay: 2.6, blur: 10 });
      },
      (S) => {
        const d = S.data;
        d.stage = 4;
        [d.hd.eye, d.hd.h, d.hum, d.b3, d.ring].forEach((el) => el && K.hide(el, { dur: 0.6 }));
        K.fade(d.bound, 0, { dur: 0.6 });
        T.to(d.hv, { o: 0 }, { dur: 0.6 });
        if (!d.rg.inert) T.to(d.rg, { o: 0 }, { dur: 0.6 });
        K.reveal(d.bg, { dur: 2.6 });
        K.drift(S, d.bg, { zoom: 1.04, px: 0.008 });
        K.fade(d.scrim, 1, { dur: 1.6 });
        look(S, { o: 0 }, 0.6);
        T.call(() => {
          if (!S.alive || d.stage !== 4) return;
          T.set(SW().m, { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1 });
          S.swarmPivot(0, 0, WD_D);
          K.sw(S, WDR[1], { from: WDR[0], dur: 2.2, ord: 0, amt: 0, spread: 20, lift: 60, ease: 'out' });
          look(S, { o: 1, wob: 0.25, wobF: 0.5, twk: 0.3 }, 0.3);
          glowTo(d.gg, 0.16, { dur: 1.6, delay: 0.4 });
          T.to(d.bg, { exp: 0.28 }, { dur: 1.6 });
          K.show(d.hl, { dy: 8, delay: 1.0 });
        }, 0.7);
        K.show(d.a, { delay: 1.6 });
        T.call(() => {
          if (!S.alive || d.stage !== 4) return;
          K.sw(S, WDR[2], { dur: 6.5, ord: 1, amt: 0.72, spread: 14, lift: 90, ease: 'out' });
          T.to(d.bg, { exp: 0.05, blur: 0.45 }, { dur: 4 });
        }, 3.0);
      },
      (S) => {
        const d = S.data;
        d.stage = 5;
        K.unreveal(d.bg, { dur: 2.4, delay: 0.3 });
        K.hide(d.a);
        K.show(d.b, { delay: 0.8 });
        T.call(() => {
          if (!S.alive || d.stage !== 5) return;
          T.to(SW().m, { x: WD_M.x, y: WD_M.y, z: WD_M.z, rx: WD_M.rx }, { dur: 6.5, ease: 'inOutCubic' });
          K.sw(S, WDR[3], { dur: 6.5, ord: 0, amt: 0, spread: 0 });
          glowTo(d.gg, 0.4, { dur: 4 });
          K.draw(d.wring, { dur: 1.6, delay: 6.0, ease: 'inOutCubic' });
        }, 2.0);
      },
    ],
    update(S) {
      const d = S.data;
      if (d.hv && d.rg && !d.rg.inert) {
        const rot = -d.rg.m.rz * U.deg, o = d.hv.o * d.rg.o;
        d.heads.forEach((g, k) => {
          if (g.inert) return;
          const a = NL_PHI[k] + rot, p = S.at(NL_RX + Math.cos(a) * NL_RR, NL_RY + Math.sin(a) * NL_RR, 6);
          g.x = p[0]; g.y = p[1]; g.o = 0.72 * o;
        });
      }

      const sw = SW();
      if (d.stage < 4 || !sw || sw.inert || !d.hl) return;
      const m = sw.m, a = S.a, px = m.px - a[0], py = m.py - a[1], pz = m.pz - a[2], t = m.rx * U.deg, c = Math.cos(t), s = Math.sin(t);
      const pr = (X, F) => {
        const q = wdCam(WD_A, X, 0, F), ry = q[1] - py, rz = WD_D - q[2] - pz;
        const x = m.x + px + (q[0] - px), y = m.y + py + c * ry - s * rz, z = m.z + pz + s * ry + c * rz, k = WD_D / (WD_D - z);
        return [960 + x * k, 540 - y * k];
      };
      const g = WD_GW, o = pr(g.X, g.F), hw = pr(g.X + g.R, g.F)[0] - o[0], hn = pr(g.X, g.F - g.R)[1];
      const ws = d.hl._wrap.style;
      ws.left = o[0].toFixed(1) + 'px';
      ws.top = (hn + 16).toFixed(1) + 'px';
      if (d.gg && !d.gg.inert) { const p = S.at(o[0], o[1], 0); d.gg.x = p[0]; d.gg.y = p[1]; d.gg.size = 2.0 * hw; }
    },
  });

  const DR_X = 300, DR_Y = 600, DR_TH = 6, DR_SG = 5.2, DR_L = 1480, DR_RC = 210;
  const drNT = (cnt) => Math.max(36, Math.round(cnt / 1024));
  const drPar = (i, nt) => {
    const q = (i + 0.5) / nt, z = 4.91 * (Math.pow(q, 0.14) - Math.pow(1 - q, 0.14)) + (hash(i + 3, 71) - 0.5) * 0.3;
    return {
      th: (DR_TH + DR_SG * z) * U.deg, L: DR_L * (0.8 + 0.2 * hash(i + 5, 13)), A: 40 + 56 * hash(i + 9, 17),
      f: [0.7 + 1.3 * hash(i + 11, 19), 2.3 + 2.2 * hash(i + 13, 23), 5.5 + 3.5 * hash(i + 15, 29)],
      ph: [TAU * hash(i + 17, 31), TAU * hash(i + 19, 37), TAU * hash(i + 21, 41)],
      b: (hash(i + 23, 43) - 0.5) * 150, lum: 0.45 + 0.55 * hash(i + 25, 47) + (hash(i + 27, 53) < 0.12 ? 0.7 : 0),
    };
  };

  const drAt = (P, u) => {
    const v = u / DR_L, e = Math.pow(v, 1.35);
    const w = e * P.A * (Math.sin(TAU * P.f[0] * v + P.ph[0]) + 0.45 * Math.sin(TAU * P.f[1] * v + P.ph[1]) + 0.18 * Math.sin(TAU * P.f[2] * v + P.ph[2])) + P.b * v * v;
    const c = Math.cos(P.th), s = Math.sin(P.th);
    return [u * c - w * s, u * s + w * c];
  };
  const DRR = fnR('s3:dr', 5405, (P, cnt, rnd) => {
    const nt = drNT(cnt), ak = Math.min(4, 65536 / cnt), nc = Math.round(cnt * 0.03), per = (cnt - nc) / nt, pars = [];
    for (let i = 0; i < nt; i++) pars.push(drPar(i, nt));
    const cG = U.lin(C.gold2), cW = U.lin('#fff1d6'), cC = U.lin('#d8f1ff'), cB = U.lin(C.cyan);
    for (let k = 0; k < cnt; k++) {
      const r1 = rnd(), r2 = rnd(), r3 = rnd(), g1 = U.gauss(rnd), g2 = U.gauss(rnd);
      if (k < nc) {
        P.add(g1 * 6, g2 * 6, 0, 1.2, cG[0], cG[1], cG[2], Math.min(1, 0.5 * ak), r1 * 0.002);
        continue;
      }
      const Q = pars[Math.min(nt - 1, Math.floor((k - nc) / per))];
      const u = Q.L * r1, v = u / DR_L, p = drAt(Q, u), fz = 0.5 + 2.6 * v, sp = r3 < 0.05;
      const c = v < 0.2 ? mx(cG, cW, v / 0.2) : mx(cW, r2 < 0.5 ? cC : cB, Math.min(1, (v - 0.2) / 0.55) * (0.6 + 0.4 * r2));
      const a = (0.9 - 0.62 * v) * (1 - 0.7 * sm(0.8, 1, u / Q.L)) * Q.lum * (sp ? 2.4 : 1) * 0.5 * ak;
      P.add(p[0] - g1 * fz * Math.sin(Q.th), p[1] + g1 * fz * Math.cos(Q.th), g2 * 4, sp ? 1.5 : 0.9, c[0], c[1], c[2], Math.min(1, a), 0.004 + 0.996 * v);
    }
  });
  const drLab = (S, a, b, col, o) => K.box(S, { cls: 'k-chip', x: o.x, y: o.y, anchor: o.anchor,
    html: '<span style="color:' + col + '">' + a + '</span><span style="margin-left:18px;font-size:19px;color:rgba(243,234,216,.62)">' + b + '</span>' });
  const drAp = (u) => [DR_X + u * Math.cos(DR_TH * U.deg), DR_Y - u * Math.sin(DR_TH * U.deg)];
  const drP = (p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1);
  const drPa = (deg, r) => [DR_X + r * Math.cos(deg * U.deg), DR_Y - r * Math.sin(deg * U.deg)];
  KS.scene({
    id: 'direction', sec: 3, title: '方向ははっきりしている', kf: [2, 3],
    world: WORLD('deep'),
    build(S) {
      const d = S.data, sv = (d.svg = K.svg(S));
      d.fx = K.ps(S, { side: KS.world.tier === 'low' ? 128 : 256, o: 0, i: 1, size: 2.0, wob: 0.35, wobF: 0.4, twk: 0.25, order: 30 });
      if (!d.fx.inert) {
        const c = S.at(DR_X, DR_Y, 0);
        S.prep(DRR, d.fx.N);
        d.fx.set(DRR, { x: c[0], y: c[1], z: 0 });
        d.fx.reveal = 0; d.fx.revOrd = 1;
      }
      d.kn = K.glow(S, { x: DR_X, y: DR_Y, z: 4, size: 200, col: C.gold2, mul: 1.1, o: 0 });
      d.tp = K.glow(S, { x: DR_X, y: DR_Y, z: 6, size: 90, col: '#fff1d6', mul: 1.0, o: 0 });

      d.ring = hid(K.circle(sv, DR_X, DR_Y, DR_RC, 'thin dim'));
      let tk = '';
      for (let a = 0; a < 360; a += 10) tk += 'M' + drP(drPa(a, DR_RC + 4)) + 'L' + drP(drPa(a, DR_RC + (a % 30 ? 12 : 20)));
      d.ticks = hid(K.path(sv, tk, 'thin dim'));
      const a0 = DR_TH - 2 * DR_SG, a1 = DR_TH + 2 * DR_SG;
      d.arc = K.undrawn(K.path(sv, 'M' + drP(drPa(a0, DR_RC)) + 'A' + DR_RC + ' ' + DR_RC + ' 0 0 0 ' + drP(drPa(a1, DR_RC)), '', { style: 'stroke-width:5' }));
      const gr = K.node(K.node(sv, 'defs'), 'radialGradient', { id: 'dr-beam', gradientUnits: 'userSpaceOnUse', cx: DR_X, cy: DR_Y, r: 1650 });
      [[0, 0.2], [0.35, 0.07], [1, 0]].forEach(([o, a]) => K.node(gr, 'stop', { offset: o, 'stop-color': C.gold2, 'stop-opacity': a }));
      d.beam = hid(K.node(sv, 'path', { d: 'M' + drP([DR_X, DR_Y]) + 'L' + drP(drPa(a0, 1650)) + 'A1650 1650 0 0 0 ' + drP(drPa(a1, 1650)) + 'Z', style: 'fill:url(#dr-beam);stroke:none' }));
      d.edges = [a0, a1].map((a) => hid(K.path(sv, 'M' + drP(drPa(a, DR_RC + 24)) + 'L' + drP(drPa(a, 1650)), 'thin dim', { 'stroke-dasharray': '3 9' })));

      const nt = drNT(d.fx.inert ? 65536 : d.fx.N), arY = (x) => DR_Y - (x - DR_X) * Math.tan(DR_TH * U.deg);
      let Q = drPar(Math.floor(0.13 * nt), nt), best = -1;
      for (let i = 0; i < nt; i++) {
        const P = drPar(i, nt), q = (i + 0.5) / nt, t = drAt(P, P.L);
        if (q < 0.06 || q > 0.32 || DR_Y - t[1] - arY(DR_X + t[0]) < 90) continue;
        let sc = P.L / 40;
        for (let k = 1; k <= 24; k++) { const p = drAt(P, (P.L * k) / 24); sc += Math.abs(p[1] * Math.cos(P.th) - p[0] * Math.sin(P.th)); }
        if (sc > best) (best = sc), (Q = P);
      }
      const n = Math.ceil(Q.L / 8);
      let pl = '', ly = 0;
      for (let k = 0; k <= n; k++) { const p = drAt(Q, (Q.L * k) / n); pl += (k ? 'L' : 'M') + drP([DR_X + p[0], DR_Y - p[1]]); if (DR_X + p[0] > DR_X + drAt(Q, Q.L)[0] - 440) ly = Math.max(ly, DR_Y - p[1]); }
      d.hl = K.undrawn(K.path(sv, pl, '', { style: 'stroke:#fff1d6;stroke-width:2' }));
      const tp = drAt(Q, Q.L), tx = DR_X + tp[0], ty = DR_Y - tp[1];
      d.hd = hid(K.circle(sv, tx.toFixed(1), ty.toFixed(1), 5, '', { style: 'fill:#fff1d6;stroke:none' }));

      const s0 = drAp(30), s1 = drAp(1390), hp = (da) => { const a = (DR_TH + 180 + da) * U.deg; return [s1[0] + 26 * Math.cos(a), s1[1] - 26 * Math.sin(a)]; };
      d.ar = K.undrawn(K.path(sv, 'M' + drP(s0) + 'L' + drP(s1), '', { style: 'stroke-width:3' }));
      d.ah = K.undrawn(K.path(sv, 'M' + drP(hp(-26)) + 'L' + drP(s1) + 'L' + drP(hp(26)), '', { style: 'stroke-width:3;fill:none' }));
      const la = drAp(1080);
      d.lt = drLab(S, 'TikTokのような、具体的な形', '誰も予想できなかった', C.cream, { x: tx, y: ly + 26, anchor: 'tr' });
      d.la = drLab(S, '個人が発信者になる、という方向', '予想できた', C.gold2, { x: la[0], y: la[1] - 30, anchor: 'bc' });

      const ie = drAp(820);
      d.ie = drLab(S, '知能爆発', 'AIがAIを改良して、賢さが加速度的に高まる', C.gold2, { x: ie[0], y: ie[1] - 30, anchor: 'bc' });
      d.si = drLab(S, '超知能の実現', '人間をはるかに超える知能', C.gold2, { x: s1[0] - 40, y: s1[1] - 30, anchor: 'bc' });
      d.now = K.chip(S, '今', { x: DR_X - 40, y: DR_Y, anchor: 'cr' });
      d.past = K.chip(S, 'かつて', { x: DR_X - 40, y: DR_Y, anchor: 'cr' });
      d.a = K.h(S, 'もちろん、\n細かいところは{当たらない}', { x: 120, y: 104, size: 46 });
      d.c = K.h(S, 'それと同じで、\n{方向}は、はっきりしている', { x: 120, y: 104, size: 46 });
      d.pv = { v: 0 };
    },
    steps: [
      (S) => {
        const d = S.data;
        glowTo(d.kn, 0.5, { dur: 1.0 });
        K.show(d.now, { dy: 6, delay: 0.3 });
        if (!d.fx.inert) {
          T.to(d.fx, { o: 1 }, { dur: 0.4 });
          T.to(d.fx, { reveal: 1 }, { dur: 3.6, delay: 0.2, ease: 'outCubic' });
        }
        K.show(d.a, { delay: 0.9 });
      },
      (S) => {
        const d = S.data;
        K.hide(d.now, { dur: 0.4 });
        K.show(d.past, { dy: 6, delay: 0.3 });
        if (!d.fx.inert) T.to(d.fx, { o: 0.55 }, { dur: 1.2 });
        K.draw(d.hl, { dur: 2.0, delay: 0.5, ease: 'inOutSine' });
        K.fade(d.hd, 1, { dur: 0.4, delay: 2.4 });
        K.show(d.lt, { dy: 6, delay: 2.4 });
        K.draw(d.ar, { dur: 1.6, delay: 3.6, ease: 'inOutCubic' });
        K.draw(d.ah, { dur: 0.4, delay: 5.1, ease: 'outCubic' });
        K.show(d.la, { dy: 6, delay: 5.0 });
      },
      (S) => {
        const d = S.data;
        K.hide(d.past, { dur: 0.4 });
        K.show(d.now, { dy: 6, delay: 0.3 });
        K.hide(d.lt);
        K.hide(d.la);
        K.fade(d.hd, 0, { dur: 0.7 });
        K.fade(d.hl, 0, { dur: 0.9 });
        K.hide(d.a);
        K.show(d.c, { delay: 0.6 });
        if (!d.fx.inert) T.to(d.fx, { o: 0.9 }, { dur: 1.4 });
        K.fade(d.ring, 1, { dur: 1.2, delay: 0.8 });
        K.fade(d.ticks, 1, { dur: 1.2, delay: 1.0 });
        K.draw(d.arc, { dur: 1.4, delay: 1.4, ease: 'inOutCubic' });
        d.edges.forEach((e) => K.fade(e, 1, { dur: 1.2, delay: 1.8 }));
        K.fade(d.beam, 1, { dur: 2.0, delay: 1.8 });
        T.to(d.pv, { v: 1 }, { dur: 2.6, delay: 2.2, ease: 'inOutCubic' });
        glowTo(d.tp, 0.8, { dur: 0.6, delay: 2.2 });
        glowTo(d.tp, 0.28, { dur: 1.4, delay: 4.8, overwrite: false });
        K.show(d.ie, { dy: 6, delay: 3.5 });
        K.show(d.si, { dy: 6, delay: 4.7 });
      },
    ],
    update(S) {
      const d = S.data;
      if (!d.tp || d.tp.inert) return;
      const a = drAp(30 + 1360 * d.pv.v), p = S.at(a[0], a[1], 6);
      d.tp.x = p[0]; d.tp.y = p[1];
    },
  });

  const AC_Y = 690, AC_X = 1400, AC_D = 1000, AC_R = 0.5, AC_TL = Math.log(0.6) / Math.log(AC_R), AC_TAIL = 560, AC_XF = 520;
  const AC_Q = ['いつ追いつく？', 'どう制御する？'];
  const acOff = (n, z) => AC_D * Math.pow(AC_R, n - z);
  const acFmt = (m) => {
    for (const [v, u] of [[1e16, '京'], [1e12, '兆'], [1e8, '億'], [1e4, '万']]) {
      if (m < v) continue;
      const q = m / v;
      return (q < 10 ? q.toFixed(1) : Math.floor(q).toLocaleString('en-US')) + u;
    }
    return Math.round(m).toLocaleString('en-US');
  };

  const ACC = fnR('s3:acC', 5406, (P, cnt, rnd) => {
    const ak = Math.min(4, 16384 / cnt), nh = Math.round(cnt * 0.06), nc = Math.round(cnt * 0.14);
    const cW = U.lin('#eaf8ff'), cL = U.lin('#bfe9ff'), cC = U.lin(C.cyan), cB = U.lin(C.blue);
    for (let k = 0; k < cnt; k++) {
      const r1 = rnd(), r2 = rnd(), g1 = U.gauss(rnd), g2 = U.gauss(rnd), g3 = U.gauss(rnd);
      if (k < nh) { P.add(g1 * 3, g2 * 3, g3 * 3, 1.3, cW[0], cW[1], cW[2], Math.min(1, 0.8 * ak), r1 * 0.004); continue; }
      if (k < nh + nc) { P.add(g1 * 13, g2 * 11, g3 * 13, 1.0, cL[0], cL[1], cL[2], Math.min(1, 0.22 * ak), 0.004 + r1 * 0.008); continue; }
      const u = Math.pow(r1, 1.7), sg = 2 + 30 * Math.pow(u, 1.1), sp = r2 < 0.04;
      const c = u < 0.35 ? mx(cL, cC, u / 0.35) : mx(cC, cB, Math.min(1, (u - 0.35) / 0.65));
      const a = Math.pow(1 - u, 1.5) * 0.42 * ak * (sp ? 2.2 : 1);
      P.add(-AC_TAIL * u, g1 * sg * 0.55, g2 * sg, sp ? 1.4 : 0.85, c[0], c[1], c[2], Math.min(1, a), 0.012 + 0.988 * u);
    }
  });

  const ACT = fnR('s3:acT', 5416, (P, cnt, rnd) => {
    const ak = Math.min(4, 4096 / cnt), n1 = Math.round(cnt * 0.25), n2 = Math.round(cnt * 0.7);
    const cW = U.lin('#fff1d6'), cG = U.lin(C.gold2), cA = U.lin(C.amber);
    for (let k = 0; k < cnt; k++) {
      const r1 = rnd(), r2 = rnd(), g1 = U.gauss(rnd), g2 = U.gauss(rnd), g3 = U.gauss(rnd);
      if (k < n1) { P.add(g1 * 4, g2 * 4, g3 * 4, 1.2, cW[0], cW[1], cW[2], Math.min(1, 0.6 * ak), r1 * 0.3); continue; }
      if (k < n2) {
        const th = TAU * r1, ph = Math.acos(2 * r2 - 1), R = 15 + g3 * 1.5;
        P.add(R * Math.sin(ph) * Math.cos(th), R * Math.cos(ph), R * Math.sin(ph) * Math.sin(th), 0.9, cG[0], cG[1], cG[2], Math.min(1, 0.32 * ak), 0.3 + r1 * 0.4);
        continue;
      }
      P.add(g1 * 26, g2 * 22, g3 * 26, 0.8, cA[0], cA[1], cA[2], Math.min(1, 0.1 * ak), 0.7 + r1 * 0.3);
    }
  });
  const acSp = (S, sp, x, y, z) => { if (!sp || sp.inert) return; const p = S.at(x, y, z); sp.x = p[0]; sp.y = p[1]; };
  const acAt = (el, x, y) => { el._wrap.style.left = x.toFixed(1) + 'px'; el._wrap.style.top = y.toFixed(1) + 'px'; };
  const acF = (v) => v.toFixed(1);
  KS.scene({
    id: 'achilles', sec: 3, title: 'アキレス点バイアス', kf: [1, 3, 5, 6], images: ['cover_boot', 'cover_new'],
    world: WORLD('deep'),
    build(S) {
      const d = S.data, sv = (d.svg = K.svg(S)), low = KS.world.tier === 'low';

      d.zt = { v: 0 }; d.lk = { v: 0 }; d.cam = { zo: 0, cx: AC_X };
      d.pa = { v: 0, P: 420 }; d.pt = { v: 0, P: 0 };
      d.vis = { tick: 0, fut: 0, arc: 0, q: 0, fw: 0 };
      d.roS = { frozen: false, last: '' };
      d.cm = K.ps(S, { side: low ? 64 : 128, o: 0, i: 1, size: 2.0, wob: 0.6, wobF: 0.5, flow: 3, flowF: 0.02, flowS: 0.7, twk: 0.3, order: 31 });
      if (!d.cm.inert) {
        const c = S.at(AC_X - AC_D, AC_Y, 0);
        S.prep(ACC, d.cm.N);
        d.cm.set(ACC, { x: c[0], y: c[1], z: 0 });
        d.cm.reveal = 0; d.cm.revOrd = 1;
      }
      d.tt = K.ps(S, { side: 64, o: 0, i: 1, size: 2.0, wob: 0.8, wobF: 0.8, twk: 0.4, order: 31 });
      if (!d.tt.inert) {
        const c = S.at(AC_X - AC_D * AC_R, AC_Y, 0);
        S.prep(ACT, d.tt.N);
        d.tt.set(ACT, { x: c[0], y: c[1], z: 0 });
      }
      d.ag = K.glow(S, { x: AC_X - AC_D, y: AC_Y, z: 2, size: 120, col: '#bfe9ff', mul: 1.0, o: 0 });
      d.as = K.glow(S, { type: 'streak', x: AC_X - AC_D, y: AC_Y, z: 2, size: 360, col: '#d8f1ff', mul: 0.7, o: 0 });
      d.tg = K.glow(S, { x: AC_X - AC_D * AC_R, y: AC_Y, z: 2, size: 130, col: C.gold2, mul: 1.0, o: 0 });
      d.tf = K.glow(S, { type: 'flare', spikes: 4, x: AC_X - AC_D * AC_R, y: AC_Y, z: 3, size: 210, col: '#fff1d6', mul: 1.0, o: 0 });
      d.xr = K.glow(S, { type: 'ring', rw: 0.022, x: AC_X, y: AC_Y, z: 3, size: 80, col: '#d8f1ff', mul: 0.8, o: 0 });
      d.fg = K.glow(S, { x: 2010, y: AC_Y, z: -300, size: 620, col: '#ffe2b0', mul: 0.24, o: 0 });
      d.fs = K.glow(S, { type: 'streak', x: 1990, y: AC_Y, z: -300, size: 2000, col: '#fff1d6', mul: 0.45, o: 0 });

      const df = K.node(sv, 'defs');
      const gs = K.node(df, 'linearGradient', { id: 'ac-sk', x1: 0, y1: 0, x2: 0, y2: 1 });
      [[0, 0.32], [1, 0]].forEach(([o, a]) => K.node(gs, 'stop', { offset: o, 'stop-color': C.gold2, 'stop-opacity': a }));
      const gb = K.node(df, 'linearGradient', { id: 'ac-br', gradientUnits: 'userSpaceOnUse', x1: AC_XF + 40, y1: 0, x2: 1880, y2: 0 });
      [[0, 1], [0.55, 0.6], [1, 0]].forEach(([o, a]) => K.node(gb, 'stop', { offset: o, 'stop-color': C.gold2, 'stop-opacity': a }));
      d.track = K.undrawn(K.path(sv, 'M0 ' + AC_Y + 'L1920 ' + AC_Y, 'thin', { style: 'stroke:rgba(243,234,216,.34)' }));
      d.pMin = K.path(sv, '', 'thin', { style: 'stroke:rgba(243,234,216,.3)' });
      d.pMaj = K.path(sv, '', 'thin', { style: 'stroke:rgba(243,234,216,.68)' });
      d.pFut = K.path(sv, '', 'thin', { style: 'stroke:rgba(255,207,138,.55)' });
      d.arcs = [];
      for (let i = 0; i < 12; i++) d.arcs.push(K.path(sv, '', 'thin cy', { style: 'fill:none', opacity: 0 }));
      d.labs = [];
      for (let i = 0; i < 8; i++) {
        const t = K.stext(sv, '', 0, 0, { cls: 'serif', anchor: 'middle', fill: 'rgba(243,234,216,.82)', show: true });
        t.style.opacity = '0'; t._n = null;
        d.labs.push(t);
      }

      d.xm = hid(K.node(sv, 'g', {}));
      K.path(d.xm, 'M0 ' + (AC_Y - 236) + 'L0 ' + (AC_Y + 34), 'thin', { 'stroke-dasharray': '4 7', style: 'stroke:rgba(243,234,216,.72)' });
      K.circle(d.xm, 0, AC_Y, 4.5, '', { style: 'fill:#fff1d6;stroke:none' });
      let sk = 'M' + (AC_XF - 420) + ' ' + (AC_Y - 2);
      for (let x = -416; x <= 0; x += 4) sk += 'L' + acF(AC_XF + x) + ' ' + acF(AC_Y - 2 - 300 * Math.exp(x / 34));
      d.skF = hid(K.node(sv, 'path', { d: sk + 'L' + AC_XF + ' ' + AC_Y + 'L' + (AC_XF - 420) + ' ' + AC_Y + 'Z', style: 'fill:url(#ac-sk);stroke:none' }));
      d.skL = K.undrawn(K.path(sv, sk + 'L' + AC_XF + ' ' + AC_Y, '', { style: 'stroke-width:2;fill:none' }));
      const by = AC_Y - 150;
      d.br = K.undrawn(K.path(sv, 'M' + (AC_XF + 40) + ' ' + (by + 18) + 'L' + (AC_XF + 40) + ' ' + by + 'L1880 ' + by, '', { style: 'stroke:url(#ac-br);stroke-width:2;fill:none' }));

      d.cA = K.chip(S, 'アキレス', { anchor: 'tc' });
      d.cAI = K.chip(S, 'AI', { anchor: 'tc', cyan: true });
      d.cT = K.chip(S, '亀', { anchor: 'bc' });
      d.cH = K.chip(S, '人間', { anchor: 'bc' });
      d.cX = K.chip(S, '追い抜かれる瞬間', { anchor: 'tc' });
      d.cXA = K.chip(S, 'アキレス点', { anchor: 'tc' });
      d.roEl = K.chip(S, '拡大　1.0倍', { anchor: 'tc', cyan: true });
      d.q1 = K.chip(S, 'いつ、人間に追いつくのか', { x: 1180, y: 452, anchor: 'cc', cyan: true });
      d.q2 = K.chip(S, 'どう、制御するのか', { x: 1180, y: 518, anchor: 'cc', cyan: true });
      d.skT = K.label(S, '議論が集中しているところ', { x: AC_XF - 36, y: AC_Y - 316, anchor: 'br', color: C.gold2 });
      d.brT = K.h(S, '本当に大事なのは、追い抜かれた後の{長い未来}', { x: AC_XF + 70, y: by - 22, size: 34, anchor: 'bl' });
      d.h1 = K.head(S, '足の速いアキレスは、先を行く亀に、\n理屈の上では{いつまでも追いつけない}', { eye: 'アキレスと亀', x: 120, y: 92, size: 46 });
      d.h2 = K.h(S, '{AI}の議論は、これに似ている', { x: 120, y: 136, size: 46 });
      d.h3 = K.h(S, '追い抜かれる瞬間の手前を、\n{どんどん細かく分けて}議論している', { x: 120, y: 136, size: 46 });
      d.h4 = K.h(S, 'でも現実には、\nアキレスは{普通に追い抜く}', { x: 120, y: 136, size: 46 });
      d.h4b = K.h(S, 'その後も、未来は{続いていく}', { x: 120, y: 292, size: 34 });
      d.h5a = K.cap(S, '私はこれを、こう呼んでいます', { x: 120, y: 74, size: 22 });
      d.h5 = K.h(S, '{アキレス点}バイアス', { x: 120, y: 112, size: 60 });
      d.h5b = K.body(S, '議論が、追い抜かれる瞬間の手前に集中してしまう', { x: 120, y: 212, size: 28 });
      d.h6 = K.h(S, 'その先の未来で、\n人類は、どこにいるのか', { x: 120, y: 136, size: 46 });
      d.h6b = K.h(S, 'それを考えたのが、\n今日ご紹介する{2冊の本}です', { x: 120, y: 372, size: 38 });
      d.cv1 = K.cover(S, 'cover_boot', { x: 1290, y: 436, w: 300 });
      d.cv2 = K.cover(S, 'cover_new', { x: 1650, y: 436, w: 300 });
      d.e1 = K.eyebrow(S, '前著', { x: 1290, y: 166, anchor: 'bc' });
      d.e2 = K.eyebrow(S, '新刊', { x: 1650, y: 166, anchor: 'bc' });
    },
    steps: [
      (S) => {
        const d = S.data;
        d.h1.in({ delay: 0.2 });
        K.draw(d.track, { dur: 1.6, delay: 0.1, ease: 'inOutCubic' });
        T.to(d.vis, { tick: 1, arc: 1 }, { dur: 0.8, delay: 0.7 });
        if (!d.cm.inert) {
          T.to(d.cm, { o: 1 }, { dur: 0.6, delay: 0.8 });
          T.to(d.cm, { reveal: 0.5 }, { dur: 1.4, delay: 0.8, ease: 'outCubic' });
        }
        if (!d.tt.inert) T.to(d.tt, { o: 1 }, { dur: 0.6, delay: 0.9 });
        glowTo(d.ag, 0.55, { dur: 0.8, delay: 0.8 });
        glowTo(d.as, 0.35, { dur: 0.8, delay: 0.8 });
        glowTo(d.tg, 0.7, { dur: 0.8, delay: 0.9 });
        K.show(d.cA, { dy: 6, delay: 1.2 });
        K.show(d.cT, { dy: 6, delay: 1.35 });
        T.to(d.zt, { v: 3 }, { dur: 6.6, delay: 1.8, ease: 'inOutSine' });
      },
      (S) => {
        const d = S.data;
        K.hide(d.h1.h);
        K.show(d.h2, { delay: 0.4 });
        K.hide(d.cA, { dur: 0.5 });
        K.show(d.cAI, { dy: 6, delay: 0.4 });
        K.hide(d.cT, { dur: 0.5 });
        K.show(d.cH, { dy: 6, delay: 0.5 });
        K.show(d.q1, { dy: 10, delay: 1.4 });
        K.show(d.q2, { dy: 10, delay: 2.0 });
        T.to(d.zt, { v: 4.5 }, { dur: 9, ease: 'inOutSine' });
      },
      (S) => {
        const d = S.data;
        K.hide(d.h2);
        K.show(d.h3, { delay: 0.4 });
        K.hide(d.q1);
        K.hide(d.q2, { delay: 0.1 });
        K.hide(d.cAI);
        K.hide(d.cH);
        T.to(d.lk, { v: 1 }, { dur: 3.2, ease: 'inOutCubic' });
        T.to(d.zt, { v: d.zt.v + 24 }, { dur: 40, ease: 'linear' });
        T.to(d.vis, { fut: 1 }, { dur: 2.0, delay: 0.6 });
        T.to(d.vis, { q: 1 }, { dur: 1.6, delay: 2.2 });
        K.fade(d.xm, 1, { dur: 0.8, delay: 0.8 });
        K.show(d.cX, { dy: 6, delay: 1.0 });
        K.show(d.roEl, { dy: 6, delay: 1.6 });
        if (!d.cm.inert) T.to(d.cm, { reveal: 0.35 }, { dur: 1.6 });
      },
      (S) => {
        const d = S.data;

        d.roS.frozen = true;
        let v = d.zt.v;
        if (d.lk.v > 0.999) v -= Math.max(0, Math.floor((v - 2) / 2)) * 2;
        T.set(d.zt, { v });
        T.to(d.zt, { v: v + 0.2 }, { dur: 0.6, ease: 'outSine' });
        K.hide(d.h3);
        K.show(d.h4, { delay: 0.3 });
        K.show(d.h4b, { delay: 3.9 });
        K.hide(d.roEl, { dur: 0.5 });
        T.to(d.vis, { q: 0 }, { dur: 0.6 });
        T.to(d.vis, { arc: 0 }, { dur: 1.0, delay: 0.4 });
        T.to(d.pa, { v: 1 }, { dur: 1.1, delay: 0.3, ease: 'inOutCubic' });
        if (!d.cm.inert) T.to(d.cm, { reveal: 1 }, { dur: 0.9, delay: 0.3, ease: 'outCubic' });
        glowTo(d.as, 0.8, { dur: 0.4, delay: 0.3 });
        glowTo(d.ag, 0.85, { dur: 0.6, delay: 0.3 });
        glowTo(d.as, 0.35, { dur: 1.2, delay: 1.4, overwrite: false });
        K.spark(d.tf, { o: 0.65, delay: 0.7, rise: 0.15, fall: 1.0 });
        K.spark(d.xr, { o: 0.45, delay: 0.86, rise: 0.12, fall: 1.4 });
        T.set(d.xr, { size: 80 });
        T.to(d.xr, { size: 720 }, { dur: 1.8, delay: 0.86, ease: 'outCubic' });
        T.to(d.lk, { v: 0 }, { dur: 3.2, delay: 1.0, ease: 'inOutSine' });
        T.to(d.cam, { zo: -1.4, cx: AC_XF }, { dur: 3.2, delay: 1.0, ease: 'inOutCubic' });
        T.to(d.pa, { P: 1150 }, { dur: 3.2, delay: 1.0, ease: 'inOutCubic' });
        T.to(d.pt, { v: 1, P: 70 }, { dur: 3.2, delay: 1.0, ease: 'inOutCubic' });
        T.to(d.vis, { fw: 1 }, { dur: 2.4, delay: 3.4, ease: 'inOutSine' });
        glowTo(d.fg, 0.55, { dur: 2.4, delay: 3.4 });
        glowTo(d.fs, 0.5, { dur: 2.4, delay: 3.4 });
        K.show(d.cAI, { dy: 6, delay: 3.8 });
        K.show(d.cH, { dy: 6, delay: 4.0 });
      },
      (S) => {
        const d = S.data;
        K.hide(d.h1.eye);
        K.hide(d.h4);
        K.hide(d.h4b);
        K.show(d.h5a, { delay: 0.1, dy: 6 });
        K.show(d.h5, { delay: 0.3 });
        K.show(d.h5b, { delay: 0.9 });
        K.hide(d.cX, { dur: 0.5 });
        K.show(d.cXA, { dy: 6, delay: 0.6 });
        K.draw(d.skL, { dur: 1.6, delay: 1.2, ease: 'inOutCubic' });
        K.fade(d.skF, 1, { dur: 1.6, delay: 1.8 });
        K.show(d.skT, { dy: 6, delay: 2.4 });
        K.draw(d.br, { dur: 1.8, delay: 3.2, ease: 'inOutCubic' });
        K.show(d.brT, { delay: 3.8 });
        T.to(d.pa, { P: 1260 }, { dur: 14, ease: 'inOutSine' });
      },
      (S) => {
        const d = S.data;
        K.hide(d.h5a);
        K.hide(d.h5);
        K.hide(d.h5b);
        K.hide(d.skT);
        K.hide(d.brT);
        K.fade(d.br, 0, { dur: 1.0 });
        K.fade(d.skF, 0, { dur: 1.0 });
        K.fade(d.skL, 0, { dur: 1.0 });
        K.hide(d.cXA);
        K.show(d.h6, { delay: 0.4 });
        K.spark(d.tf, { o: 0.7, delay: 1.0, rise: 0.4, fall: 1.6 });
        glowTo(d.tg, 1, { dur: 0.6, delay: 1.0 });
        glowTo(d.tg, 0.75, { dur: 1.6, delay: 1.6, overwrite: false });
        T.to(d.pa, { P: 1700 }, { dur: 6, delay: 0.6, ease: 'inSine' });
        K.hide(d.cAI, { delay: 1.2 });
        K.coverIn(d.cv1, { delay: 2.0 });
        K.coverIn(d.cv2, { delay: 2.4 });
        K.show(d.e1, { dy: 6, delay: 2.6 });
        K.show(d.e2, { dy: 6, delay: 3.0 });
        K.show(d.h6b, { delay: 3.4 });
      },
    ],
    update(S) {
      const d = S.data;
      if (!d.zt) return;
      const tau = d.zt.v, z = d.lk.v * (tau - AC_TL) + d.cam.zo, cx = d.cam.cx, zA = acOff(tau, z);
      const ax = cx - (zA * (1 - d.pa.v) - d.pa.P * d.pa.v), tx = cx - (AC_R * zA * (1 - d.pt.v) - d.pt.P * d.pt.v);
      if (!d.cm.inert) d.cm.m.x = ax - (AC_X - AC_D);
      if (!d.tt.inert) d.tt.m.x = tx - (AC_X - AC_D * AC_R);
      acSp(S, d.ag, ax, AC_Y, 2); acSp(S, d.as, ax, AC_Y, 2);
      acSp(S, d.tg, tx, AC_Y, 2); acSp(S, d.tf, tx, AC_Y, 3); acSp(S, d.xr, cx, AC_Y, 3);
      acAt(d.cA, ax, AC_Y + 40); acAt(d.cAI, ax, AC_Y + 40); acAt(d.cT, tx, AC_Y - 40); acAt(d.cH, tx, AC_Y - 40);
      acAt(d.cX, cx, AC_Y + 52); acAt(d.cXA, cx, AC_Y + 52); acAt(d.roEl, cx, AC_Y + 108);
      d.xm.setAttribute('transform', 'translate(' + acF(cx) + ' 0)');

      const tk = d.vis.tick, fut = d.vis.fut, lr = Math.log(AC_R);
      let pM = '', pm = '', pf = '';
      if (tk > 0.001) {
        const nA = Math.max(0, Math.ceil(z + Math.log((cx + 60) / AC_D) / lr)), nB = Math.floor(z + 10.5);
        for (let n = nA; n <= nB; n++) {
          const o = acOff(n, z), x = cx - o, w = o * (1 - AC_R), g = tk * Math.max(sm(n - 1.3, n - 1.0, tau), fut);
          if (g < 0.01) continue;
          pM += 'M' + acF(x) + ' ' + AC_Y + 'v' + acF(-g * Math.min(34, 2 + 0.1 * w));
          if (w < 30) continue;
          const hm = g * Math.min(11, 0.03 * w) * sm(30, 90, w);
          for (let k = 1; k < 10; k++) pm += 'M' + acF(x + (w * k) / 10) + ' ' + AC_Y + 'v' + acF(-hm);
        }
      }
      if (d.vis.fw > 0.001) for (let k = 1; k <= 14; k++) {
        const x = cx + k * 115, h = sm((k - 1) / 14, k / 14 + 0.05, d.vis.fw) * (k % 4 ? 8 : 16);
        if (x > 1940) break;
        if (h > 0.2) pf += 'M' + acF(x) + ' ' + AC_Y + 'v' + acF(-h);
      }
      if (pM !== d._pM) d.pMaj.setAttribute('d', (d._pM = pM));
      if (pm !== d._pm) d.pMin.setAttribute('d', (d._pm = pm));
      if (pf !== d._pf) d.pFut.setAttribute('d', (d._pf = pf));

      let ai = 0;
      if (d.vis.arc > 0.001) {
        const nT = Math.floor(tau);
        for (let n = Math.max(0, nT - 6); n <= nT && ai < d.arcs.length; n++) {
          const o = acOff(n, z), x0 = cx - o, w = o * (1 - AC_R);
          const u = n < nT ? 1 : (1 - Math.pow(AC_R, tau - n)) / (1 - AC_R);
          const al = d.vis.arc * (1 - sm(700, 1500, w)) * sm(1.5, 5, w);
          if (u <= 0.001 || x0 + w < -20 || al < 0.01) continue;
          const p1x = x0 + w / 2, p1y = AC_Y - 0.6 * w, p2x = x0 + w, v = 1 - u;
          const el = d.arcs[ai++];
          el.setAttribute('d', 'M' + acF(x0) + ' ' + AC_Y + 'Q' + acF(x0 + u * (p1x - x0)) + ' ' + acF(AC_Y + u * (p1y - AC_Y)) + ' ' +
            acF(v * v * x0 + 2 * u * v * p1x + u * u * p2x) + ' ' + acF(v * v * AC_Y + 2 * u * v * p1y + u * u * AC_Y));
          el.setAttribute('opacity', al.toFixed(3));
        }
      }
      for (; ai < d.arcs.length; ai++) if (d.arcs[ai].getAttribute('opacity') !== '0') d.arcs[ai].setAttribute('opacity', '0');

      const used = [];
      if (d.vis.q > 0.001) {
        for (let n = Math.max(0, Math.ceil(z - 0.3)); n <= Math.floor(z + 3.6); n++) {
          const o = acOff(n, z), w = o * (1 - AC_R), s = 0.105 * w, el = d.labs[n % d.labs.length];
          used[n % d.labs.length] = 1;
          if (el._n !== n) { el.textContent = AC_Q[n & 1]; el._n = n; }
          el.setAttribute('x', acF(cx - o + w / 2));
          el.setAttribute('y', acF(AC_Y + 50 + s));
          el.style.fontSize = acF(s) + 'px';
          el.style.opacity = (d.vis.q * sm(5, 9, s) * (1 - sm(34, 56, s))).toFixed(3);
        }
      }
      d.labs.forEach((el, i) => { if (!used[i] && el.style.opacity !== '0') el.style.opacity = '0'; });
      if (!d.roS.frozen) {
        const m = Math.pow(1 / AC_R, Math.max(0, z)), txt = '拡大　' + (m < 10 ? m.toFixed(1) : acFmt(m)) + '倍';
        if (txt !== d.roS.last) d.roEl.textContent = d.roS.last = txt;
      }
    },
  });
})();
