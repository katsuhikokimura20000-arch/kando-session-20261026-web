(function () {
  'use strict';
  const KS = window.KS, K = KS.kit, TX = KS.Text, T = KS.T, C = KS.C, U = KS.U;
  const SW = () => KS.world.swarm;
  const TAU = Math.PI * 2;

  const wp = (x, y, z = 0) => [x - 960, 540 - y, z];

  const fnR = (key, seed, fn) => ({ type: 'fn', key, seed, sort: 'path', fn });
  const mx = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const hid = (el) => (T.setEl(el, { o: 0 }), el);
  const oc = (p) => 1 - Math.pow(1 - p, 3);
  const ss = (e) => e * e * (3 - 2 * e);
  const prep = (S, R) => { const sw = SW(); if (sw && !sw.inert) S.prep(R, sw.N); };
  const look = (S, o, dur) => S.swarmLook(Object.assign({ o: 1, size: 2.0, i: 1, wob: 0.6, wobF: 0.6, flow: 0 }, o), { dur: dur != null ? dur : 1.2 });
  const glowTo = (sp, o, opt) => { if (sp && !sp.inert) T.to(sp, { o }, Object.assign({ dur: 1.2, ease: 'inOutSine' }, opt)); };
  const WORLD = (sky) => ({ sky: sky || 'deep', post: { vig: 0.5 }, dust: { o: 0.35 } });
  const DIM = 'rgba(243,234,216,.7)';

  KS.scene({
    id: 'sec1', sec: 1, title: 'PART 01　この1年、手元で起きたこと', swarm: true,
    world: WORLD(),
    build(S) {
      S.data.card = K.card(S, { no: 1, label: 'この1年、\n手元で起きたこと', sub: 'AIのIQ ── 1年前の予想の答え合わせ\n1人で、数十人体制から数百人体制へ\n研究開発まで、AIに任せる' });
    },
    steps: [(S) => { S.data.card.in({ delay: 0 }); }],
  });

  const IQ = { asOf: '2026.10.18', mensa: { top: 147, next: 145 }, offline: { top: 135, next: 134, max: 136 } };
  const vx = (v) => 240 + (v - 90) * (1440 / 65);
  const LA = 540, LB = 730, RY = 850, XW = vx(IQ.offline.max);
  const TICKS = [];
  for (let v = 90; v <= 155; v += 5) TICKS.push({ x: vx(v), h: v % 10 === 0 ? 22 : 11 });
  const TICK_LEN = TICKS.reduce((s, t) => s + t.h * 0.7, 0);

  function lane(P, cnt, rnd, i0, i1, live, y0, val, pile) {
    const ak = 65536 / cnt, m = i1 - i0, nh = Math.floor(m * 0.03), np = nh + 0.5 * (m - nh), L = vx(val) - 240;
    const cw = U.lin(C.white), c1 = U.lin(C.copper), c2 = U.lin(C.amber), c3 = U.lin(C.gold2);
    for (let j = 0; j < m; j++) {
      const g1 = U.gauss(rnd), g2 = U.gauss(rnd), u = rnd();
      let x, y, s, c, a;
      if (j < nh) { x = 240 + L + g1 * 3.2; y = y0 + g2 * 3.2; s = 2.4; c = cw; a = 0.06; }
      else if (pile && j < np) {
        const k = Math.abs(g1);
        x = Math.max(XW - 37, XW - 2 - k * 10); y = y0 + g2 * 19; s = 1.6; c = mx(c3, cw, U.clamp(1 - k / 2.5, 0, 1)); a = 0.03;
      } else {
        x = 240 + L * u; y = y0 + g2 * (0.6 + 5 * (1 - u) * (1 - u)); s = 1.2 + 0.8 * u;
        c = u < 0.5 ? mx(c1, c2, u * 2) : mx(c2, c3, u * 2 - 1); a = 0.02 + 0.04 * u;
      }
      if (!live) { x = 240 + g1 * 3; y = y0 + g2 * 3; a = 0; }
      const p = wp(x, y);
      P.add(p[0], p[1], 0, s, c[0], c[1], c[2], Math.min(1, a * ak), (i0 + j + 0.5) / cnt);
    }
  }

  const iqR = (stage) => fnR('s1:iq' + stage, 4711, (P, cnt, rnd) => {
    const ak = 65536 / cnt, n1 = Math.floor(cnt * 0.22), n2 = Math.floor(cnt * 0.6), tot = 1440 + TICK_LEN, gc = U.lin(C.gold, 0.8);
    for (let i = 0; i < n1; i++) {
      let s = ((i + 0.5) / n1) * tot, x, y;
      const g = U.gauss(rnd) * 0.5;
      if (s < 1440) { x = 240 + s; y = RY + g; }
      else {
        s -= 1440;
        let k = 0;
        while (k < TICKS.length - 1 && s > TICKS[k].h * 0.7) { s -= TICKS[k].h * 0.7; k++; }
        x = TICKS[k].x + g; y = RY - s / 0.7;
      }
      const p = wp(x, y);
      P.add(p[0], p[1], 0, 1.5, gc[0], gc[1], gc[2], Math.min(1, 0.05 * ak), (i + 0.5) / cnt);
    }
    lane(P, cnt, rnd, n1, n2, stage >= 2, LA, IQ.mensa.top, false);
    lane(P, cnt, rnd, n2, cnt, stage >= 3, LB, IQ.offline.top, stage >= 4);
  });
  const IQR = [1, 2, 3, 4].map(iqR);

  function ride(S, stat, o) {
    const st = KS.D.st(stat.el), q = { p: 0 }, sp = o.sp;
    const put = () => {
      const w = ss(oc(U.clamp(q.p, 0, 1)));
      st.x = -o.L * (1 - w);
      KS.D.dirty.add(st);
      stat.v.textContent = String(Math.round(90 + (o.val - 90) * w));
      if (sp && !sp.inert) { const a = S.at(240 + o.L * w, o.y, 20); sp.x = a[0]; sp.y = a[1]; }
    };
    put();
    K.show(stat.el, { delay: o.delay, dy: 0, blur: 6, dur: 0.5 });
    T.to(q, { p: 1 }, { dur: o.dur, delay: o.delay, ease: 'linear', onUpdate: put });
    if (sp && !sp.inert) {
      T.to(sp, { o: 1 }, { dur: 0.4, delay: o.delay, ease: 'outCubic' });
      T.to(sp, { o: 0.55 }, { dur: 1.2, delay: o.delay + o.dur, ease: 'inOutSine', overwrite: false });
    }
  }
  KS.scene({
    id: 'iq', sec: 1, title: 'AIのIQ ── 1年前の予想の答え合わせ', swarm: true,
    world: WORLD(),
    build(S) {
      const d = S.data;
      d.hd = K.head(S, 'AIのIQ、1年前の予想の答え合わせ', { eye: 'AI IQ / CHECKING THE FORECAST', size: 54 });
      d.fl = K.label(S, '1年前に話していた予想', { x: 1240, y: 112, size: 22, color: C.gold });
      d.q = K.quote(S, '{AIのIQ}は、2026年の春には\n130〜140くらいになって、\n人間の大半を超える', { x: 1240, y: 150, size: 34, lh: 1.55 });
      d.verdict = K.label(S, '→ 春から半年たった今の値としては、予想どおり', { x: 1240, y: 330, size: 24, color: C.gold2 });
      const g = K.svg(S, {});
      d.band = hid(K.node(g, 'rect', { x: vx(130), y: 492, width: vx(140) - vx(130), height: RY - 492, style: 'fill:rgba(242,183,102,.07);stroke:none' }));
      d.edges = [vx(130), vx(140)].map((x) => hid(K.line(g, x, 492, x, RY, 'thin', { style: 'stroke:rgba(242,183,102,.45);stroke-dasharray:4 6' })));
      d.bandL = K.cap(S, '1年前の予想　130〜140', { x: vx(135), y: 906, anchor: 'tc', size: 20, color: 'rgba(242,183,102,.85)' });
      d.ticks = [];
      for (let v = 90; v <= 150; v += 10) d.ticks.push(K.cap(S, String(v), { cls: 'mono', x: vx(v), y: RY + 20, anchor: 'tc', size: 18, ls: 0, color: 'rgba(140,147,166,.8)' }));
      d.unit = K.cap(S, 'IQスコア', { x: 1700, y: RY, anchor: 'cl', size: 18 });
      d.laL = K.label(S, 'ネットで公開されているIQテスト（Mensa Norway）', { x: 240, y: LA + 16, size: 22, color: DIM });
      d.trA = K.line(g, 240, LA, 1760, LA, 'thin', { style: 'stroke:rgba(242,183,102,.28)' });
      K.undrawn(d.trA);
      d.arA = hid(K.path(g, 'M1748 ' + (LA - 7) + ' L1760 ' + LA + ' L1748 ' + (LA + 7), 'thin', { style: 'stroke:rgba(242,183,102,.28)' }));
      d.lbL = K.label(S, 'ネットに出回っていないIQテスト（答えを覚えようがない）', { x: 240, y: LB + 16, size: 22, color: DIM });
      d.trB = K.line(g, 240, LB, XW, LB, 'thin', { style: 'stroke:rgba(242,183,102,.28)' });
      K.undrawn(d.trB);
      d.wall = K.line(g, XW, LB - 50, XW, LB + 50, '', { style: 'stroke:#ffcf8a;stroke-width:3' });
      K.undrawn(d.wall);
      d.wl1 = K.cap(S, 'このテストで取れる最高点', { x: XW + 23, y: LB - 22, size: 20, color: DIM });
      d.wl2 = K.h(S, String(IQ.offline.max), { x: XW + 23, y: LB + 6, size: 44, color: C.gold2, lh: 1 });
      d.sA = K.stat(S, { x: vx(IQ.mensa.top), y: LA - 22, anchor: 'bc', size: 60, value: IQ.mensa.top });
      d.sB = K.stat(S, { x: vx(IQ.offline.top) - 14, y: LB - 16, anchor: 'br', size: 52, value: IQ.offline.top });
      d.nA = hid(K.circle(g, vx(IQ.mensa.next), LA, 4.5, '', { style: 'fill:#ffcf8a;stroke:none' }));
      d.nAL = K.cap(S, '次点 ' + IQ.mensa.next, { x: vx(IQ.mensa.next), y: LA + 16, anchor: 'tc', size: 18 });
      d.nB = hid(K.circle(g, vx(IQ.offline.next), LB, 4.5, '', { style: 'fill:#ffcf8a;stroke:none' }));
      d.nBL = K.cap(S, '次点 ' + IQ.offline.next, { x: vx(IQ.offline.next) - 9, y: LB + 16, anchor: 'tr', size: 18 });
      d.gA = K.glow(S, { size: 90, col: C.gold2, x: 240, y: LA, z: 20, o: 0 });
      d.gB = K.glow(S, { size: 80, col: C.gold2, x: 240, y: LB, z: 20, o: 0 });
      d.gW = K.glow(S, { size: 150, col: C.gold2, x: XW, y: LB, z: 10, o: 0 });
      d.src = K.src(S, '出典：TrackingAI（trackingai.org）' + IQ.asOf + ' 時点・各モデルの直近7回の平均\n※AIの点数は、人間のIQとそのまま比べられるものではありません');
      d.m1 = K.label(S, 'いくつものAIが、IQテストで測れる上限の近くに並んで', { x: 120, y: 330, size: 26, color: DIM });
      d.m2 = K.h(S, '物差しの方が、先に足りなくなってきた', { x: 120, y: 372, size: 48 });
      IQR.slice(1).forEach((R) => prep(S, R));
    },
    steps: [
      (S) => {
        const d = S.data;
        d.hd.in({ delay: 0 });
        K.show(d.fl, { delay: 0.3, dy: 8 });
        d.q.in({ delay: 0.45 });
        K.sw(S, IQR[0], { dur: 2.4, ord: 1, amt: 0.6, spread: 60, ease: 'out' });
        look(S, { wob: 0.4 });
        K.each(d.ticks, 0.06, (el, t) => K.show(el, { delay: t, dy: 6, blur: 4, dur: 0.6 }), 1.0);
        K.show(d.unit, { delay: 1.5, dy: 6 });
        K.fade(d.band, 1, { delay: 1.6, dur: 1.2 });
        d.edges.forEach((e) => K.fade(e, 1, { delay: 1.6, dur: 1.2 }));
        K.show(d.bandL, { delay: 1.9, dy: 8 });
        K.show(d.src, { delay: 2.2, dy: 6 });
      },
      (S) => {
        const d = S.data;
        K.show(d.laL, { delay: 0, dy: 8 });
        K.draw(d.trA, { dur: 1.2 });
        K.fade(d.arA, 1, { delay: 1.0, dur: 0.6 });
        K.sw(S, IQR[1], { dur: 2.4, delay: 0.5, spread: 0, amt: 0, ord: 0, ease: 'out', glow: 0 });
        ride(S, d.sA, { L: vx(IQ.mensa.top) - 240, val: IQ.mensa.top, y: LA, delay: 0.5, dur: 2.4, sp: d.gA });
        K.fade(d.nA, 1, { delay: 2.6, dur: 0.6 });
        K.show(d.nAL, { delay: 2.7, dy: 6 });
      },
      (S) => {
        const d = S.data;
        K.show(d.lbL, { delay: 0, dy: 8 });
        K.draw(d.trB, { dur: 1.0 });
        K.draw(d.wall, { delay: 0.2, dur: 0.8 });
        K.show(d.wl1, { delay: 1.0, dy: 6 });
        K.show(d.wl2, { delay: 1.2, dy: 6 });
        K.sw(S, IQR[2], { dur: 2.4, delay: 0.5, spread: 0, amt: 0, ord: 0, ease: 'out', glow: 0 });
        ride(S, d.sB, { L: vx(IQ.offline.top) - 240, val: IQ.offline.top, y: LB, delay: 0.5, dur: 2.4, sp: d.gB });
        K.fade(d.nB, 1, { delay: 2.8, dur: 0.6 });
        K.show(d.nBL, { delay: 2.8, dy: 6 });
        K.show(d.verdict, { delay: 3.2, dy: 8 });
      },
      (S) => {
        const d = S.data;
        K.sw(S, IQR[3], { dur: 2.4, amt: 0.5, ord: 0, spread: 0, ease: 'out', glow: 0 });
        glowTo(d.gW, 0.6, { dur: 1.6, delay: 0.6 });
        TX.dim(d.q.text, 0.5);
        K.fade(d.q.bar, 0.4);
        TX.in(d.m1, 'rise', { delay: 0.8 });
        TX.in(d.m2, 'rise', { delay: 1.3 });
      },
    ],
  });

  const NC = [1340, 560];

  const NET = (() => {
    const fr = (v) => v - Math.floor(v), h = (i, s) => fr(Math.sin(i * 127.1 + s * 311.7) * 43758.5453);
    const nodes = [{ id: 0, x: NC[0], y: NC[1], ring: 0, a: 0, par: -1, anc: 0 }];
    [[100, 8, 0.0625], [178, 14, 0.3], [256, 18, 0.15], [330, 90, 0.4], [404, 150, 0.1]].forEach(([R, n, ph], ri) => {
      for (let k = 0; k < n; k++) {
        const id = nodes.length, a = TAU * (k / n + ph) + (h(id, 1) - 0.5) * 0.12 * Math.min(1, 18 / n), r = R * (1 + (h(id, 2) - 0.5) * (ri < 3 ? 0.08 : 0.12));
        nodes.push({ id, x: NC[0] + Math.cos(a) * r, y: NC[1] + Math.sin(a) * r * 0.92, ring: ri + 1, a, par: 0, anc: id });
      }
    });
    const ring = (ri) => nodes.filter((nd) => nd.ring === ri);
    const adist = (a, b) => { const d = Math.abs(a - b) % TAU; return d > Math.PI ? TAU - d : d; };
    const near = (a, list) => list.reduce((b, c) => (adist(c.a, a) < adist(b.a, a) ? c : b), list[0]);
    const links = [];
    ring(1).forEach((nd) => links.push([0, nd.id, 0]));
    for (let ri = 2; ri <= 5; ri++) {
      const inner = ring(ri - 1);

      ring(ri).forEach((nd) => { nd.par = near(nd.a, inner).id; if (ri > 3) nd.anc = nodes[nd.par].anc; links.push([nd.par, nd.id, 0]); });
    }
    const r2 = ring(2), r5 = ring(5);
    r2.forEach((nd, k) => { if (k % 2 === 0) links.push([nd.id, r2[(k + 1) % r2.length].id, 1]); });
    const chains = [];
    for (let i = 0; i < 8; i++) {
      const c = [];
      for (let nd = r5[Math.floor((i * r5.length) / 8)]; nd; nd = nd.par >= 0 ? nodes[nd.par] : null) c.unshift([nd.x, nd.y]);
      chains.push(c);
    }
    const roles = [['実装', -160], ['テスト', -112], ['設計', -64], ['調査', -18], ['レビュー', 28], ['画像', 74], ['音', 160]].map(([t, deg]) => {
      const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a), rr = 404 * 1.06 + 12;
      return { t, x: NC[0] + c * rr, y: NC[1] + s * rr * 0.92, anchor: c > 0.5 ? 'cl' : c < -0.5 ? 'cr' : s < 0 ? 'bc' : 'tc' };
    });
    return { nodes, links, chains, roles };
  })();

  const NW = [0, 7, 5, 4, 1, 0.75], NA = [0, 0.035, 0.04, 0.045, 0.09, 0.11], NSG = [0, 4, 3.2, 3, 2.2, 1.8];
  const netR = (stage) => fnR('s1:net' + stage, 5150, (P, cnt, rnd) => {
    const ak = 65536 / cnt, n0 = Math.floor(cnt * 0.04), n1 = n0 + Math.floor(cnt * 0.46), n2 = n1 + Math.floor(cnt * 0.4);
    const cg = U.lin(C.gold2), cc = U.lin(C.cyan), cb = U.lin(C.blue), cw = U.lin(C.white);
    const ncol = [cg, mx(cc, cw, 0.45), mx(cc, cw, 0.2), cc, mx(cc, cb, 0.4), mx(cc, cb, 0.6)];
    const N = NET.nodes, tree = NET.links.filter((l) => !l[2]), cross = NET.links.filter((l) => l[2]);
    const len = (l) => Math.hypot(N[l[1]].x - N[l[0]].x, N[l[1]].y - N[l[0]].y);
    const lw = (l) => len(l) * (N[l[1]].ring <= 3 ? 3.5 : 1);
    const cum = (ls, w) => { let s = 0; return ls.map((l) => (s += w(l))); };
    const ag = N.slice(1), cn = cum(ag, (nd) => NW[nd.ring]), ct = cum(tree, lw), cx = cum(cross, len);
    const onLink = (ls, cs, w, k, f, g1, g2) => {
      const l = ls[k], A = N[l[0]], B = N[l[1]], u = 1 - (cs[k] - f) / w(l);
      return [A.x + (B.x - A.x) * u + g1 * 0.7, A.y + (B.y - A.y) * u + g2 * 0.7];
    };
    let ln = 0, lt = 0, lc = 0;
    for (let i = 0; i < cnt; i++) {
      const g1 = U.gauss(rnd), g2 = U.gauss(rnd);
      let q, s, c, a, nd = null;
      if (i < n0) { const t = ((i + 0.5) / n0) * TAU; q = [NC[0] + Math.cos(t) * 34 + g1 * 1.2, NC[1] + Math.sin(t) * 34 + g2 * 1.2]; s = 1.6; c = cg; a = 0.05; }
      else if (i < n1) { const f = ((i - n0 + 0.5) / (n1 - n0)) * cn[cn.length - 1]; while (ln < cn.length - 1 && f > cn[ln]) ln++;
        nd = ag[ln]; const sg = NSG[nd.ring];
        q = [nd.x + g1 * sg, nd.y + g2 * sg]; s = nd.ring < 5 ? 1.6 : 1.4; c = ncol[nd.ring]; a = NA[nd.ring]; }
      else if (i < n2) { const f = ((i - n1 + 0.5) / (n2 - n1)) * ct[ct.length - 1]; while (lt < ct.length - 1 && f > ct[lt]) lt++;
        nd = N[tree[lt][1]]; q = onLink(tree, ct, lw, lt, f, g1, g2); s = 1.2; a = nd.ring <= 3 ? 0.07 : 0.12;
        const rn = Math.hypot(q[0] - NC[0], q[1] - NC[1]) / 404;
        c = rn < 0.7 ? mx(cg, cc, U.clamp(rn * 1.45, 0, 1)) : mx(cc, cb, U.clamp((rn - 0.7) * 1.6, 0, 0.5)); }
      else { const f = ((i - n2 + 0.5) / (cnt - n2)) * cx[cx.length - 1]; while (lc < cx.length - 1 && f > cx[lc]) lc++;
        q = onLink(cross, cx, len, lc, f, g1, g2); s = 1.1; c = mx(cc, cb, 0.5); a = 0.03; }
      const aux = Math.hypot(q[0] - NC[0], q[1] - NC[1]) / 400;
      if (stage === 1 && nd && nd.ring > 3) { const an = N[nd.anc]; q = [an.x + g1 * 3, an.y + g2 * 3]; a = 0; }
      const p = wp(q[0], q[1]);
      P.add(p[0], p[1], 0, s, c[0], c[1], c[2], Math.min(1, a * ak), aux);
    }
  });
  const NETR = [1, 2].map(netR);
  KS.scene({
    id: 'subordinates', sec: 1, title: '1人で、数十人体制から数百人体制へ', swarm: true,
    world: WORLD(),
    build(S) {
      const d = S.data;
      d.eye = K.label(S, '1年前に話していたこと', { x: 200, y: 236, size: 22, color: C.gold, ls: 0.28 });
      d.q = K.quote(S, '数年前なら、\n何十人もの部下を抱えて\nやっていた仕事が、\nAIがあれば、{1人で}できる', { x: 200, y: 290, size: 50 });
      d.me = K.h(S, '私', { x: NC[0], y: NC[1], anchor: 'cc', size: 40, color: C.white, lh: 1 });
      d.meG = K.glow(S, { size: 160, col: C.gold, x: NC[0], y: NC[1], z: 5, o: 0 });
      d.roles = NET.roles.map((r) => K.cap(S, r.t, { x: r.x, y: r.y, anchor: r.anchor, size: 17, color: 'rgba(111,211,255,.75)', ls: 0.12 }));
      d.cap = K.h(S, '1年たった今は、1人で\n{数百人}の体制に相当', { x: 200, y: 680, size: 44, lh: 1.5 });
      d.agents = K.label(S, '私が指示を出すと、AIのエージェントたちが手分けして動く', { x: 204, y: 838, size: 24, color: 'rgba(111,211,255,.85)' });
      d.sparks = NET.chains.map(() => K.glow(S, { size: 26, col: C.gold2, mul: 1.4, x: NC[0], y: NC[1], z: 15, o: 0 }));
      d.flow = { v: 0 };
      prep(S, NETR[1]);
    },

    update(S, t) {
      const d = S.data;
      if (!d.sparks) return;
      d.sparks.forEach((sp, i) => {
        if (!sp || sp.inert) return;
        if (S.kf || d.flow.v <= 0) { sp.o = 0; return; }
        const ph = (t * 0.32 + i / 8) % 1, ch = NET.chains[i], f = ph * (ch.length - 1), k = Math.min(ch.length - 2, Math.floor(f)), u = f - k;
        const a = S.at(ch[k][0] + (ch[k + 1][0] - ch[k][0]) * u, ch[k][1] + (ch[k + 1][1] - ch[k][1]) * u, 15);
        sp.x = a[0]; sp.y = a[1]; sp.o = d.flow.v * Math.sin(Math.PI * ph) * 0.9;
      });
    },
    steps: [
      (S) => {
        const d = S.data;
        K.show(d.eye, { delay: 0.1, dy: 8 });
        d.q.in({ delay: 0.3 });
        K.sw(S, NETR[0], { dur: 2.6, amt: 0.5, ord: 0, spread: 140, ease: 'out' });
        look(S, { wob: 1.2, wobF: 0.8 });
        K.show(d.me, { delay: 1.4, dy: 0, blur: 10, dur: 1 });
        glowTo(d.meG, 0.55, { delay: 1.4 });
      },
      (S) => {
        const d = S.data;
        TX.dim(d.q.text, 0.4);
        K.fade(d.q.bar, 0.3);
        TX.dim(d.eye, 0.4);
        K.sw(S, NETR[1], { dur: 3.0, ord: 1, amt: 0.6, spread: 14, ease: 'out' });
        K.each(d.roles, 0.12, (el, t) => K.show(el, { delay: t, dy: 6, blur: 6, dur: 0.8 }), 2.0);
        TX.in(d.cap, 'lines', { delay: 1.6, stagger: 0.3 });
        K.show(d.agents, { delay: 2.5, dy: 8 });
        T.to(d.flow, { v: 1 }, { dur: 1, delay: 2.2 });
      },
    ],
  });

  const COLS = 148, ROWS = 50, PITCH = 9, GCX = 960, GCY = 690, SITES = COLS * ROWS, SPLIT = 3800, PAID = [720, 700];
  const siteXY = (s) => { const c = Math.floor(s / ROWS), r = s % ROWS; return [GCX + (c - (COLS - 1) / 2) * PITCH, GCY + (r - (ROWS - 1) / 2) * PITCH]; };
  const GRID = fnR('s1:grid', 101, (P, cnt, rnd) => {
    const a = Math.min(1, 2.4 / (cnt / SITES)), hi = U.lin(C.gold2), lo = U.lin(C.copper);
    for (let i = 0; i < cnt; i++) {
      const s = Math.min(SITES - 1, Math.floor((i * SITES) / cnt)), q = siteXY(s), p = wp(q[0], q[1]), b = s < SPLIT, c = b ? hi : lo;
      P.add(p[0] + U.gauss(rnd) * 0.9, p[1] + U.gauss(rnd) * 0.9, 0, 1.7, c[0], c[1], c[2], b ? a : a * 0.4, (i + 0.5) / cnt);
    }
  });

  const AWAY = fnR('s1:away', 102, (P, cnt, rnd) => {
    const ak = 65536 / cnt, hot = U.lin(C.white), hi = U.lin(C.gold2), lo = U.lin(C.copper);
    for (let i = 0; i < cnt; i++) {
      const s = Math.min(SITES - 1, Math.floor((i * SITES) / cnt)), g1 = U.gauss(rnd), g2 = U.gauss(rnd), r1 = rnd(), r2 = rnd();
      if (s === 0) {
        const p = wp(PAID[0] + g1 * 1.6, PAID[1] + g2 * 1.6);
        P.add(p[0], p[1], 0, 2.2, hot[0], hot[1], hot[2], Math.min(1, 0.5 * ak), (i + 0.5) / cnt);
        continue;
      }
      const q = siteXY(s), dx = q[0] - 960, dy = q[1] - GCY, dl = Math.hypot(dx, dy) || 1, k = 200 + 500 * r1, c = s < SPLIT ? hi : lo;
      const p = wp(q[0] + (dx / dl) * k, q[1] + (dy / dl) * k, (r2 - 0.5) * 800);
      P.add(p[0], p[1], p[2], 1.7, c[0], c[1], c[2], 0, (i + 0.5) / cnt);
    }
  });

  const YR_N = 45600, YR_PER = 400, GA = Math.PI * (3 - Math.sqrt(5));
  const yrFig = (f) => [240 + (f % 19) * 80, 420 + Math.floor(f / 19) * 100];

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
  const YEAR = fnR('s1:year', 104, (P, cnt, rnd) => {
    const a = Math.min(1, 0.3 * Math.max(1, YR_N / cnt)), hi = U.lin(C.gold2), lo = U.lin(C.copper);
    for (let i = 0; i < cnt; i++) {
      const g1 = U.gauss(rnd), g2 = U.gauss(rnd), r1 = rnd();
      const s = Math.min(YR_N - 1, Math.floor((i * YR_N) / cnt)), first = i === 0 || Math.floor(((i - 1) * YR_N) / cnt) !== s;
      const o = yrFig(Math.floor(s / YR_PER)), q = figPt(s % YR_PER, YR_PER, o[0], o[1], 76, g1 * 0.55, g2 * 0.55), p = wp(q[0], q[1]), c = mx(hi, lo, 0.1 + 0.45 * r1);
      P.add(p[0], p[1], 0, 1.7, c[0], c[1], c[2], first ? a : 0, (i + 0.5) / cnt);
    }
  });
  KS.scene({
    id: 'estimate', sec: 1, title: '2026年7月の1か月を、外注したら', swarm: true, kf: [1, 3, 4],
    world: WORLD(),
    build(S) {
      const d = S.data;
      d.hd = K.head(S, '2026年7月の1か月で作ったものを、外注したら', { eye: 'JULY 2026 / ONE MONTH' });
      d.sub = K.label(S, '私がAIのエージェントたちと開発・公開した、趣味のアプリやゲーム', { x: 120, y: 262, size: 26, color: DIM });
      d.estL = K.label(S, '外注した場合の見積もり', { x: 690, y: 384, anchor: 'cr', size: 28, color: DIM });
      d.s1 = K.stat(S, { x: 930, y: 316, anchor: 'tr', size: 110, value: 3.8, digits: 1, unit: '億' });
      d.s2 = K.stat(S, { x: 990, y: 316, anchor: 'tl', size: 110, value: 7.4, digits: 1, unit: '億円' });
      d.tilde = K.h(S, '〜', { x: 960, y: 346, anchor: 'tc', size: 52, lh: 1 });
      d.cap = K.label(S, '約10人の体制で2年以上、つまり{数百人}の体制で1か月かかる量\n（AIが書き足したコードは約50万行）', { x: 298, y: 936, size: 26 });
      d.leg = K.cap(S, '1つの点＝10万円', { x: 1622, y: 940, anchor: 'tr', size: 20 });
      d.paidL = K.label(S, '実際に払ったのは', { x: 800, y: 590, size: 30 });
      d.paid = K.h(S, '10万円弱', { x: 800, y: 636, size: 120, color: C.gold, lh: 1.1 });
      d.paidS = K.cap(S, 'AIなどのサービス利用料の合計（1か月分）', { x: 806, y: 790, size: 24 });
      d.dotL = K.cap(S, '点1つ分', { x: PAID[0], y: PAID[1] + 30, anchor: 'tc', size: 20 });
      d.flare = K.glow(S, { type: 'flare', size: 90, spikes: 4, col: C.gold2, mul: 1.4, x: PAID[0], y: PAID[1], z: 10, o: 0 });
      d.dotG = K.glow(S, { size: 70, col: C.gold2, x: PAID[0], y: PAID[1], z: 8, o: 0 });
      d.chips = [['売上や利益ではなく、ほとんど趣味', 520], ['品質は仕事のレベル', 960], ['同じものを人に頼んだら、という換算', 1400]].map(([t, x]) => K.chip(S, t, { x, y: 920, anchor: 'tc' }));

      d.yh = K.head(S, '7月の数字を、1年に直すと', { eye: 'ONE YEAR' });
      d.y1 = K.stat(S, { x: 1800, y: 96, anchor: 'tr', size: 100, value: 45, pre: '約', unit: '億円' });
      d.yc1 = K.label(S, '7月の外注換算（低い方の3.8億円）× 12か月', { x: 1800, y: 222, anchor: 'tr', size: 23, color: DIM });
      d.yc2 = K.label(S, '÷ 一人あたり年4,000万円（かなり高めに見積もって）', { x: 1800, y: 256, anchor: 'tr', size: 23, color: DIM });
      d.yres = K.h(S, '＝ {100人以上}分', { x: 1800, y: 296, anchor: 'tr', size: 60, lh: 1.1 });
      d.ysrc = K.src(S, '1つの点＝10万円 ／ 1人分＝400点（年4,000万円）');
      prep(S, AWAY);
      prep(S, YEAR);
    },
    steps: [
      (S) => {
        const d = S.data;
        d.hd.in({ delay: 0 });
        K.show(d.sub, { delay: 0.5, dy: 8 });
        K.show(d.estL, { delay: 0.7, dy: 8 });

        K.sw(S, GRID, { dur: 3.2, ord: 1, amt: 0.75, spread: 120, ease: 'out' });
        look(S, {});
        d.s1.in({ delay: 0.8, from: 0, dur: 1.23, ease: 'linear' });
        K.show(d.tilde, { delay: 2.0, dy: 6 });
        d.s2.in({ delay: 2.03, from: 3.8, dur: 1.17, ease: 'linear' });
        K.show(d.cap, { delay: 3.0, dy: 8 });
        K.show(d.leg, { delay: 3.3, dy: 6 });
      },
      (S) => {
        const d = S.data;
        K.sw(S, AWAY, { dur: 2.6, ord: 0, amt: 0.6, spread: 100, ease: 'out' });
        [d.s1.el, d.s2.el, d.tilde, d.sub, d.estL].forEach((el) => K.fade(el, 0.25, { dur: 1.2 }));
        K.hide(d.cap);
        K.hide(d.leg);
        K.show(d.paidL, { delay: 1.0, dy: 10 });
        TX.in(d.paid, 'rise', { delay: 1.4 });
        K.spark(d.flare, { delay: 2.2, fall: 1.6 });
        glowTo(d.dotG, 0.5, { dur: 1.4, delay: 2.2 });
        K.show(d.dotL, { delay: 2.5, dy: 6 });
        K.show(d.paidS, { delay: 2.6, dy: 8 });
      },
      (S) => { K.each(S.data.chips, 0.25, (el, t) => K.pop(el, { delay: t }), 0.1); },
      (S) => {
        const d = S.data;

        K.hide(d.hd.h);
        if (d.hd.eye) K.hide(d.hd.eye);
        [d.s1.el, d.s2.el, d.tilde, d.sub, d.estL, d.paidL, d.paid, d.paidS, d.dotL].concat(d.chips).forEach((el) => K.hide(el));
        glowTo(d.dotG, 0, { dur: 0.8 });
        d.yh.in({ delay: 0.5 });

        K.sw(S, YEAR, { dur: 3.4, ord: 1, amt: 0.7, spread: 60, ease: 'out' });
        d.y1.in({ delay: 0.9, from: 0, dur: 2.2, ease: 'outCubic' });
        K.show(d.yc1, { delay: 1.4, dy: 8 });
        K.show(d.yc2, { delay: 2.1, dy: 8 });
        TX.in(d.yres, 'rise', { delay: 2.8 });
        TX.glint(d.yres, { delay: 3.6, dur: 1.4 });
        K.show(d.ysrc, { delay: 1.2, dy: 6 });
      },
    ],
  });

  const VC = [440, 590];

  const GROOVE = fnR('s1:groove', 303, (P, cnt, rnd) => {
    const ak = 65536 / cnt, r0 = 352, r1 = 440, turns = 22, cg = U.lin(C.gold), cc = U.lin(C.copper);
    for (let i = 0; i < cnt; i++) {
      const u = (i + 0.5) / cnt, th = u * turns * TAU, g = U.gauss(rnd), v = rnd();
      const r = r0 + (r1 - r0) * u + g * 0.5, sheen = 0.5 + 0.5 * Math.pow(Math.abs(Math.cos(th - 0.7)), 8);
      const c = mx(cg, cc, 0.25 + 0.5 * v), p = wp(VC[0] + Math.cos(th) * r, VC[1] + Math.sin(th) * r);
      P.add(p[0], p[1], 0, 1.2 + 0.7 * v, c[0], c[1], c[2], Math.min(1, (0.12 + 0.1 * v) * sheen * ak), u);
    }
  });
  KS.scene({
    id: 'vinyl', sec: 1, title: 'Vinyl Simulator', swarm: true, kf: [1, 3],
    world: WORLD(),
    build(S) {
      const d = S.data;
      d.hd = K.head(S, 'レコードの音を、針と溝の物理から再現する', { eye: 'VINYL SIMULATOR' });
      d.fr = K.video(S, 'vinyl.mp4', { x: VC[0] - 240, y: VC[1] - 240, w: 480, h: 480 });
      d.frL = K.cap(S, '開発中の画面：溝の中の針先と、接触の計算値', { x: VC[0], y: VC[1] + 256, anchor: 'tc', size: 19 });
      d.ex1 = K.label(S, 'よくある「レコード風」エフェクトは、ノイズや歪みを後から足すもの', { x: 900, y: 330, size: 24, color: DIM });
      d.ex2 = K.h(S, 'これは、針と溝の接触そのものを\n{物理で計算}する', { x: 900, y: 384, size: 44, lh: 1.5 });
      d.ex3 = K.label(S, '針先の形・針圧・針を支えるサスペンション・塩ビの弾性・針の浮き上がりまで', { x: 900, y: 540, size: 22, color: DIM });
      d.ex4 = K.label(S, '→ 本物のレコードのような雑音や歪みが、計算の結果として現れる', { x: 900, y: 610, size: 28, color: C.gold2 });
      d.lab = K.label(S, '開発の途中、AIとこんなやりとりが何度も', { x: 900, y: 318, size: 22, color: DIM });
      d.ai = K.bubble(S, '精度が出ませんでした', { who: 'ai', x: 900, y: 380 });
      d.me = K.bubble(S, 'まだ検討してない物理現象があるよね', { who: 'me', x: 1780, y: 520, anchor: 'tr' });
      d.again = K.label(S, '→ また頑張って、ちゃんと形にしてくる', { x: 900, y: 690, size: 28 });
      d.review = K.h(S, '会社員時代に、研究開発をレビューしていた時の\nやりとり、そのもの', { x: 900, y: 780, size: 40, lh: 1.5 });
      d.pat = K.label(S, '→ 一昔前なら論文や特許級の工夫が、趣味の開発から次々と', { x: 900, y: 932, size: 26, color: C.gold2 });
    },
    steps: [
      (S) => {
        const d = S.data;
        d.hd.in({ delay: 0 });
        K.show(d.fr, { delay: 0.3, dur: 1.2, blur: 10, dy: 0, s0: 0.97 });
        K.play(S, d.fr, { delay: 0.3 });
        K.show(d.frL, { delay: 1.1, dy: 6 });
        K.sw(S, GROOVE, { z: -300, dur: 3, amt: 0.5, ord: 1, spread: 140, ease: 'expo' });
        look(S, { o: 0.9, i: 0.8, size: 1.8, wob: 1 });
        K.show(d.ex1, { delay: 0.8, dy: 8 });
        TX.in(d.ex2, 'lines', { delay: 1.3, stagger: 0.3 });
        K.show(d.ex3, { delay: 2.1, dy: 8 });
        TX.in(d.ex4, 'rise', { delay: 2.7 });
      },
      (S) => {
        const d = S.data;
        [d.ex1, d.ex2, d.ex3, d.ex4].forEach((el) => TX.out(el, 'blur', { dur: 0.6 }));
        K.show(d.lab, { delay: 0.5, dy: 8 });
        K.pop(d.ai, { delay: 0.9 });
        S.swarmLook({ i: 0.55 }, { dur: 1.6, delay: 0.9 });
      },
      (S) => {
        const d = S.data;
        K.pop(d.me, { delay: 0 });
        K.show(d.again, { delay: 0.9, dy: 10 });
        S.swarmLook({ i: 1.15 }, { dur: 1.8, delay: 1.0 });
        TX.in(d.review, 'lines', { delay: 1.8, stagger: 0.3 });
        K.show(d.pat, { delay: 3.1, dy: 8 });
      },
    ],
  });

  const MUS = {
    mel: [0, 2, 4, 7, 5, 4, 2, 4, 9, 7, 4, 2],
    chords: [[0, 4, 7], [-3, 0, 4], [-7, -3, 0], [-5, -1, 2], [0, 4, 7], [-3, 0, 4], [-7, -3, 0], [-5, -1, 2]],
    bass: [0, 0, -3, -3, -7, -7, -5, -5, 0, 0, -3, -3, -7, -7, -5, -2],
  };

  const VOICE = { bass: [870, 950, 1], chords: [760, 890, 0.7], mel: [600, 790, 0.85] };
  const pitchR = (stage) => fnR('s1:pitch' + stage, 707, (P, cnt, rnd) => {
    const ak = 65536 / cnt, nb = Math.floor(cnt * 0.2), nc = nb + Math.floor(cnt * 0.35);
    const X = (x) => (stage === 1 ? x : 120 + (x - 120) * 0.702);
    const Y = (v, off) => (stage === 1 ? VOICE[v][0] + off : VOICE[v][1] + off * VOICE[v][2]);
    const cB = U.lin(C.blue, 0.8), cC = U.lin(C.cyan, 0.7), cM = U.lin(C.cyan), cW = U.lin(C.white);
    for (let i = 0; i < cnt; i++) {
      const g = U.gauss(rnd);
      let x, y, s, c, a;
      if (i < nb) {
        const f = ((i + 0.5) / nb) * 16, k = Math.floor(f), u = f - k;
        x = 120 + k * 105 + 4 + u * 97; y = Y('bass', -MUS.bass[k] * 3) + g * 1.4; s = 1.4; c = cB; a = 0.08;
      } else if (i < nc) {
        const f = ((i - nb + 0.5) / (nc - nb)) * 24, k = Math.floor(f), u = f - k, ch = Math.floor(k / 3);
        x = 120 + ch * 210 + 6 + u * 198; y = Y('chords', -MUS.chords[ch][k % 3] * 6) + g * 1.5; s = 1.4; c = cC; a = 0.1;
      } else {
        const u = (i - nc + 0.5) / (cnt - nc), xx = 120 + u * 1680, f = u * 12, k = Math.min(11, Math.floor(f)), w = f - k;
        const prev = MUS.mel[Math.max(0, k - 1)], cur = MUS.mel[k], gl = U.smooth(0, 0.18, w);
        const vib = 3 * Math.sin((xx / 18) * TAU) * U.clamp((w - 0.4) / 0.2, 0, 1);
        x = xx; y = Y('mel', -(prev + (cur - prev) * gl) * 7 + vib) + g * 0.9; s = 1.6; c = mx(cM, cW, u * 0.6); a = 0.07;
      }
      const p = wp(X(x), y);
      P.add(p[0], p[1], 0, s, c[0], c[1], c[2], Math.min(1, a * ak), (i + 0.5) / cnt);
    }
  });
  const MELO = [1, 2].map(pitchR);
  KS.scene({
    id: 'vibe', sec: 1, title: 'Vibe Research', swarm: true, kf: [2, 3],
    world: WORLD('cool'),
    build(S) {
      const d = S.data;
      d.hd = K.head(S, '研究開発そのものを、AIに任せる', { eye: 'VIBE RESEARCH' });
      d.sub = K.label(S, 'ノリと勢いで研究するので、Vibe Research', { x: 120, y: 270, size: 30, color: DIM });
      d.l1 = K.label(S, '音楽を聴いて、今鳴っている音の高さを、全部聞き分ける', { x: 120, y: 350, size: 30 });
      d.l2 = K.h(S, '絶対音感・耳コピのエンジン', { x: 120, y: 400, size: 56, color: C.gold2 });
      d.chips = [['スマホやブラウザでも動く軽さ', 120, 530], ['世界最高とも十分比べられる性能', 560, 530], ['自作の音楽アプリに組み込み', 120, 592]]
        .map(([t, x, y]) => K.chip(S, t, { x, y, cyan: true }));
      d.ph = K.video(S, 'f0.mp4', { x: 1400, y: 170, w: 360, h: 640, style: { borderRadius: '42px', border: '9px solid #10141d', boxShadow: '0 0 0 1px rgba(242,183,102,.35), 0 30px 80px rgba(0,0,0,.6)' } });
      d.phL = K.cap(S, 'F0 ESTIMATION', { cls: 'mono', x: 1580, y: 836, anchor: 'tc', size: 16, ls: 0.3, color: 'rgba(111,211,255,.8)' });
      d.nc = K.h(S, '自分では、コードを{一行も}書かず、\n実験も{一回も}回していない', { x: 120, y: 300, size: 50, lh: 1.45 });
      d.ncL = K.label(S, '普通の言葉で、AIのエージェントに指示を出しているだけ。たとえば ──', { x: 120, y: 470, size: 28 });
      d.me = K.bubble(S, '次は、和音が重なっても聞き分けられるか、試してみて', { who: 'me', x: 120, y: 524 });
      prep(S, MELO[1]);
    },
    steps: [
      (S) => {
        const d = S.data;
        d.hd.in({ delay: 0 });
        K.show(d.sub, { delay: 0.6, dy: 8 });
        K.sw(S, MELO[0], { dur: 3.0, ord: 1, amt: 0.6, spread: 120, ease: 'out' });
        look(S, { wob: 0.8 });
      },
      (S) => {
        const d = S.data;
        K.fade(d.sub, 0.5);
        K.sw(S, MELO[1], { dur: 2.2, ord: 1, amt: 0.4, spread: 30, ease: 'out' });
        K.show(d.l1, { delay: 0.3, dy: 10 });
        TX.in(d.l2, 'rise', { delay: 0.7 });
        K.show(d.ph, { delay: 0.9, dur: 1.2, dy: 30, blur: 10 });
        K.play(S, d.ph, { delay: 0.9 });
        K.show(d.phL, { delay: 1.6, dy: 6 });
        K.each(d.chips, 0.22, (el, t) => K.pop(el, { delay: t }), 1.6);
      },
      (S) => {
        const d = S.data;

        [d.l1, d.l2].forEach((el) => TX.out(el, 'blur', { dur: 0.6 }));
        [d.sub].concat(d.chips).forEach((el) => K.hide(el));
        TX.in(d.nc, 'lines', { delay: 0.5, stagger: 0.35 });
        K.show(d.ncL, { delay: 1.5, dy: 8 });
        K.pop(d.me, { delay: 2.0 });
      },
    ],
  });

  const BX0 = 300, BX1 = 1500, BY = 460, NY = 700;

  const barR = (stage) => fnR('s1:bar' + stage, 909, (P, cnt, rnd) => {
    const ak = 65536 / cnt, cols = [U.lin(C.gold, 0.9), U.lin(C.amber, 0.9), U.lin(C.cyan, 0.9)];
    for (let i = 0; i < cnt; i++) {
      const u = (i + 0.5) / cnt, v = rnd(), g = U.gauss(rnd), c = cols[u < 0.2 ? 0 : u < 0.75 ? 1 : 2];
      let x = BX0 + (BX1 - BX0) * u + g * 0.6, y = BY + (v - 0.5) * 26, a = 0.18;
      if (stage === 2) { if (i % 16) a = 0.018; else { x = BX0 + 50 * u + g * 0.3; y = NY + (v - 0.5) * 26; } }
      const p = wp(x, y);
      P.add(p[0], p[1], 0, 1.4, c[0], c[1], c[2], Math.min(1, a * ak), u);
    }
  });
  const BAR = [1, 2].map(barR);
  KS.scene({
    id: 'speed', sec: 1, title: '丸3日 → 3時間', swarm: true,
    world: WORLD(),
    build(S) {
      const d = S.data;
      d.hd = K.head(S, '速さも、まるで変わりました', { eye: 'SPEED' });
      d.sub = K.label(S, 'AIが、大きな機能を1つ足す時間（計画 → 実装 → テスト）', { x: 120, y: 290, size: 26, color: DIM });
      const g = K.svg(S, {});
      d.ticks = [700, 1100].map((x) => hid(K.line(g, x, BY - 22, x, BY + 22, 'thin', { style: 'stroke:rgba(243,234,216,.35)' })));
      d.ghost = hid(K.node(g, 'rect', { x: BX0, y: BY - 13, width: BX1 - BX0, height: 26, rx: 3, style: 'fill:none;stroke:rgba(242,183,102,.4);stroke-width:1.2;stroke-dasharray:5 7' }));
      d.fun = [[BX0, BY + 13, BX0, NY - 13], [BX1, BY + 13, BX0 + 50, NY - 13]].map((l) => hid(K.line(g, l[0], l[1], l[2], l[3], 'thin', { style: 'stroke:rgba(242,183,102,.3);stroke-dasharray:4 7' })));
      d.segL = [['計画', 0.1], ['実装', 0.475], ['テスト', 0.875]].map(([t, u]) => K.cap(S, t, { x: BX0 + (BX1 - BX0) * u, y: BY - 20, anchor: 'bc', size: 20, color: DIM }));
      d.dayL = ['1日目', '2日目', '3日目'].map((t, k) => K.cap(S, t, { x: 500 + k * 400, y: BY + 30, anchor: 'tc', size: 18 }));
      d.old = K.label(S, '1年前', { x: 120, y: BY, anchor: 'cl', size: 28 });
      d.oldV = K.h(S, '丸3日', { x: BX1 + 40, y: BY, anchor: 'cl', size: 52, lh: 1 });
      d.now = K.label(S, '今', { x: 120, y: NY, anchor: 'cl', size: 28 });
      d.nowV = K.h(S, '3時間', { x: 390, y: NY, anchor: 'cl', size: 52, lh: 1, color: C.gold2 });
      d.tired = K.h(S, '速すぎて、付きっ切りだと人間の方が疲れちゃう', { x: 120, y: 790, size: 40 });
      d.rs1 = K.label(S, 'なので研究は、AIの報告を朝・昼・寝る前に見て、方向を伝えるだけ', { x: 120, y: 872, size: 30, color: DIM });
      d.rs2 = K.h(S, '→ 3日ほどで、{実用的な研究成果}が出てくる', { x: 120, y: 922, size: 44, lh: 1.2 });
      prep(S, BAR[1]);
    },
    steps: [
      (S) => {
        const d = S.data;
        d.hd.in({ delay: 0 });
        K.show(d.sub, { delay: 0.5, dy: 8 });
        K.show(d.old, { delay: 0.8, dy: 8 });

        K.sw(S, BAR[0], { dur: 3.0, ord: 1, amt: 0.7, spread: 80, ease: 'out' });
        look(S, { wob: 0.5 });
        [1.2, 2.0, 2.8].forEach((t, i) => K.show(d.segL[i], { delay: t, dy: 6 }));
        d.ticks.forEach((e) => K.fade(e, 1, { delay: 2.2, dur: 0.8 }));
        K.each(d.dayL, 0.15, (el, t) => K.show(el, { delay: t, dy: 6 }), 2.4);
        TX.in(d.oldV, 'rise', { delay: 3.0 });
      },
      (S) => {
        const d = S.data;
        K.sw(S, BAR[1], { dur: 1.6, ord: 0, amt: 0, spread: 0, ease: 'expo', glow: 0 });
        K.fade(d.ghost, 1, { delay: 0.2, dur: 0.8 });
        d.fun.forEach((e) => K.fade(e, 1, { delay: 0.3, dur: 0.8 }));
        d.segL.concat(d.dayL).forEach((el) => TX.dim(el, 0.35));
        d.ticks.forEach((e) => K.fade(e, 0.35));
        TX.dim(d.oldV, 0.6);
        TX.dim(d.old, 0.6);
        K.show(d.now, { delay: 0.8, dy: 8 });
        TX.in(d.nowV, 'rise', { delay: 1.1 });
      },
      (S) => { TX.in(S.data.tired, 'type', { delay: 0.1 }); },
      (S) => {
        const d = S.data;
        TX.dim(d.tired, 0.5);
        K.show(d.rs1, { delay: 0.2, dy: 8 });
        TX.in(d.rs2, 'rise', { delay: 0.9 });
        TX.glint(d.rs2, { delay: 1.8, dur: 1.4 });
      },
    ],
  });

  const FAN0 = [360, 640], CL = [960, 800];

  const fanR = (stage) => fnR('s1:fan' + stage, 1111, (P, cnt, rnd) => {
    const ak = 65536 / cnt, n = 40, m = Math.ceil(cnt / n), cg = U.lin(C.gold, 0.9), ca = U.lin(C.amber, 0.8), cw = U.lin(C.white);
    for (let i = 0; i < cnt; i++) {
      const k = i % n, u = (Math.floor(i / n) + 0.5) / m, g1 = U.gauss(rnd), g2 = U.gauss(rnd);
      const th = ((-24 + (36 * k) / (n - 1)) * Math.PI) / 180, j = 0.6 + 2.4 * u;
      let x = FAN0[0] + 1340 * u + g1 * j, y = FAN0[1] + Math.tan(th) * 1340 * u * u + g2 * j, c = mx(cg, ca, u), a = 0.3 * (1 - 0.6 * u), s = 1.3;
      if (stage === 2) {
        if (i % 10 === 0) { x = CL[0] + g1 * 5; y = CL[1] + g2 * 5; c = mx(cg, cw, 0.6); a = 0.012; s = 1.6; }
        else { x += g2 * 40; y += g1 * 40; a = 0; }
      }
      const p = wp(x, y);
      P.add(p[0], p[1], 0, s, c[0], c[1], c[2], Math.min(1, a * ak), (i + 0.5) / cnt);
    }
  });
  const FAN = [1, 2].map(fanR);
  KS.scene({
    id: 'measured', sec: 1, title: '一人分の実測値', swarm: true,
    world: WORLD(),
    build(S) {
      const d = S.data;
      d.t1 = K.h(S, 'これは、未来の予言ではなく', { x: 960, y: 380, anchor: 'cc', size: 52, lh: 1.4 });
      d.t2 = K.h(S, 'もう起きていることの、\nたった一人分の実測値', { x: 960, y: 560, anchor: 'cc', size: 64, lh: 1.6, color: C.white });
      const g = K.svg(S, {});
      d.ret = K.circle(g, CL[0], CL[1], 40, 'thin', { style: 'stroke:rgba(242,183,102,.7)' });
      K.undrawn(d.ret);
      d.cross = [[0, -1], [1, 0], [0, 1], [-1, 0]].map(([dx, dy]) => {
        const e = K.line(g, CL[0] + dx * 48, CL[1] + dy * 48, CL[0] + dx * 62, CL[1] + dy * 62, 'thin', { style: 'stroke:rgba(242,183,102,.7)' });
        K.undrawn(e);
        return e;
      });
      d.n1 = K.cap(S, 'n = 1', { cls: 'mono', x: CL[0] + 52, y: CL[1] + 40, size: 18, ls: 0.1, color: C.gold });
      d.g = K.glow(S, { size: 120, col: C.gold2, x: CL[0], y: CL[1], z: 10, o: 0 });
      prep(S, FAN[1]);
    },
    steps: [
      (S) => {
        const d = S.data;
        K.sw(S, FAN[0], { dur: 3.0, ord: 1, amt: 0.6, spread: 100, ease: 'out' });
        look(S, { wob: 1 });
        TX.in(d.t1, 'rise', { delay: 0.6, stagger: 0.05 });
      },
      (S) => {
        const d = S.data;
        TX.dim(d.t1, 0.35);
        K.sw(S, FAN[1], { dur: 2.6, ord: 0, amt: 0.5, spread: 100, ease: 'out' });
        TX.in(d.t2, 'lines', { delay: 0.6, stagger: 0.5 });
        glowTo(d.g, 0.5, { dur: 1.4, delay: 1.6 });
        K.draw(d.ret, { delay: 1.8, dur: 1.0 });
        d.cross.forEach((e, i) => K.draw(e, { delay: 2.0 + i * 0.08, dur: 0.5 }));
        K.show(d.n1, { delay: 2.6, dy: 6 });
      },
    ],
  });
})();
