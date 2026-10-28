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
  const tw = (o, props, opt) => { if (o && !o.inert) T.to(o, props, opt); };
  const WORLD = (sky) => ({ sky: sky || 'deep', post: { vig: 0.5 }, dust: { o: 0.35 } });
  const VOID = () => ({ sky: 'void', post: { vig: 0.45 }, dust: { o: 0.2 } });
  const DIM = 'rgba(243,234,216,.7)';

  const bez = (a, b, c, d, t) => {
    const u = 1 - t, k0 = u * u * u, k1 = 3 * u * u * t, k2 = 3 * u * t * t, k3 = t * t * t;
    return [k0 * a[0] + k1 * b[0] + k2 * c[0] + k3 * d[0], k0 * a[1] + k1 * b[1] + k2 * c[1] + k3 * d[1]];
  };
  const PARK = (P, x, y, c, aux) => { const p = wp(x, y); P.add(p[0], p[1], 0, 1.6, c[0], c[1], c[2], 0, aux); };

  const scrim = (S, css, o = {}) => { const el = S.div({ x: o.x || 0, y: o.y || 0, w: o.w || 1920, h: o.h || 1080 }); el.style.background = css; T.setEl(el, { o: 0 }); return el; };
  const ignite = (sp, o) => { if (!sp || sp.inert) return; const a = o.rise || 0.18, b = o.fall || 1.1, dl = o.delay || 0; T.set(sp, { o: 0 }); T.to(sp, { o: o.peak || 1 }, { dur: a, delay: dl, ease: 'outCubic' }); T.to(sp, { o: o.rest }, { dur: b, delay: dl + a, ease: 'inOutSine', overwrite: false }); };

  const KZ = (z) => (KS.DIST - z) / KS.DIST;
  const wpz = (x, y, z) => { const k = KZ(z); return [(x - 960) * k, (540 - y) * k, z]; };
  const PZ = -1200, PW = 2200, PH = (2200 * 941) / 1672;
  const fxy = (fx, fy) => [960 + (fx - 0.5) * PW, 540 + (fy - 0.5) * PH];
  const onPlate = (p, fx, fy) => { const Z = p.zoom || 1; return [960 + (fx - 0.5 - (p.px || 0)) * Z * PW, 540 + (fy - 0.5 + (p.py || 0)) * Z * PH]; };

  const pinGlow = (S, f, o, rnd) => {
    const s = fxy(f[0], f[1]), size = o.size * KZ(PZ);
    const g = { x: s[0], y: s[1], z: PZ, size, col: o.col, i: o.i || 1 };
    if (o.type) g.type = o.type;
    if (o.spikes) g.spikes = o.spikes;
    if (o.mul) g.mul = o.mul;
    return { sp: K.glow(S, g), f, size, i: o.i || 1, tw: o.tw || 0, w: 0.5 + rnd() * 1.1, ph: rnd() * TAU };
  };
  const pin = (S, p, list, t) => {
    if (!p || p.inert) return;
    const Z = p.zoom || 1;
    list.forEach((q) => {
      const sp = q.sp;
      if (!sp || sp.inert) return;
      const s = onPlate(p, q.f[0], q.f[1]), w = S.at(s[0], s[1], PZ);
      sp.x = w[0]; sp.y = w[1]; sp.size = q.size * Z;
      sp.i = q.i * (S.kf || !q.tw ? 1 : 1 + q.tw * Math.sin(t * q.w + q.ph));
    });
  };

  const pinRibbon = (p, r) => {
    if (!p || p.inert || !r || r.inert) return;
    const Z = p.zoom || 1, m = r.m, k = KZ(PZ);
    m.s = Z; m.pz = PZ; m.x = -(p.px || 0) * Z * PW * k; m.y = -(p.py || 0) * Z * PH * k;
  };

  const Q1 = '人類が進化の途中なら、\n今を生きる人生の意味は何ですか？', Q2 = '人類が通過点だと知ることは、\nどんな新しい可能性をもたらしますか？';
  const Q1T = Q1.replace('\n', ''), Q2T = Q2.replace('\n', '');
  const qtag = (S, n, text, o) => K.box(S, Object.assign({ x: 120, y: 100, anchor: 'tl', cls: 'k-chip faq', html: '<b>FAQ 0' + n + '</b>' + K.esc(text) }, o));
  const key = KS.deck.qaKey;
  const SRC = (ch) => '『人類という通過点』' + ch + 'より';

  const LV_CREST = [[0.2125, 0.403], [0.275, 0.418], [0.333, 0.43], [0.375, 0.444], [0.417, 0.474], [0.467, 0.496], [0.5, 0.511], [0.55, 0.521],
    [0.6, 0.541], [0.667, 0.57], [0.717, 0.581], [0.792, 0.593], [0.808, 0.63], [0.867, 0.652], [0.933, 0.674], [1.0, 0.696]];
  const LV_TOWN = [[0.098, 0.29], [0.117, 0.292], [0.147, 0.292], [0.169, 0.29], [0.231, 0.3], [0.253, 0.305], [0.272, 0.303], [0.288, 0.298], [0.318, 0.281], [0.34, 0.283], [0.368, 0.303], [0.394, 0.298], [0.424, 0.3], [0.468, 0.292], [0.489, 0.295], [0.462, 0.326], [0.478, 0.329], [0.526, 0.324], [0.563, 0.322]];
  const LV_FIELD = [0.22, 0.3, 0.38, 0.46, 0.54, 0.62, 0.68, 0.72];
  const LV_WAT = [[0.52, 0.56], [0.55, 0.58], [0.58, 0.57], [0.85, 0.7], [0.88, 0.74], [0.24, 0.44], [0.27, 0.45]];
  const LV_FIX = [1, 4, 6, 9, 12, 14];
  KS.scene({
    id: 'levee', sec: 'qa', qa: 1, key, title: '人類が進化の途中なら、人生の意味は？', swarm: false, kf: [1, 2, 3],
    world: VOID(), images: ['levee', 'levee_stone'],
    build(S) {
      const d = S.data, r = U.rng(5621);
      d.bg = K.photo(S, 'levee', { z: PZ, w: PW, fe: 90 });
      d.st = K.photo(S, 'levee_stone', { z: PZ + 10, w: PW, fe: 90, rt: 2, ix: 0.24, iy: 0.34, rs: 0.22, rn: 0.22, rw: 0.75, sh: -1.6, shw: 0.14, shc: [1, 0.9, 0.72], order: 11 });
      d.crest = S.ribbon({
        curves: [{ pts: LV_CREST.map((f) => { const s = fxy(f[0], f[1]); return wpz(s[0], s[1], PZ); }), w: 4.2, col: C.gold2, col2: '#fff1d6', mul: 1.1, gk: 1 }],
        prog: 0, head: 1.0, core: 1.0, glow: 0.7, glowW: 10, order: 22,
      });
      d.town = LV_TOWN.map((f) => pinGlow(S, [f[0] + (r() - 0.5) * 0.004, f[1] + (r() - 0.5) * 0.004], { size: 14, col: '#ffd9a0', tw: 0.3 }, r));
      d.field = LV_FIELD.map((fx) => pinGlow(S, [fx, 0.33 + 0.04 * r()], { size: 60, col: C.gold }, r));
      d.wat = LV_WAT.map((f) => pinGlow(S, f, { size: 40, type: 'flare', spikes: 4, col: '#dff3ff', tw: 0.2 }, r));
      d.fix = LV_FIX.map((k) => pinGlow(S, LV_CREST[k], { size: 70, type: 'flare', col: C.gold2 }, r));
      d.pins = [].concat(d.town, d.field, d.wat, d.fix);
      d.sc = scrim(S, 'radial-gradient(ellipse 1300px 460px at 400px 940px, rgba(2,3,8,.8) 0%, rgba(2,3,8,.5) 50%, rgba(2,3,8,0) 100%)');
      d.scT = scrim(S, 'radial-gradient(ellipse 1100px 260px at 420px 125px, rgba(2,3,8,.84) 0%, rgba(2,3,8,.62) 50%, rgba(2,3,8,0) 100%)');
      d.eye = K.eyebrow(S, 'FAQ 01', { x: 120, y: 96 });
      d.q = S.text(Q1, { cls: 'serif', size: 44, x: 120, y: 140, color: C.white, lh: 1.45, ls: 0.04 });
      d.l1 = S.text('『人類という通過点』に書いた、ある堤防の話', { cls: 'sans', size: 26, x: 120, y: 790, color: C.cream, ls: 0.08 });
      const M = { cls: 'serif', size: 42, x: 116, y: 836, color: C.white, lh: 1.5, ls: 0.04 };
      d.m1 = S.text('二千年あまり前に築かれ、\n今も川の水を分けている堤防がある', M);
      d.m2 = S.text('石を切り出し、運び、積んだ人たちの名前は、\n{どこにも残っていない}', M);
      d.m3 = S.text('それでも修繕が繰り返され、\n堤防の内側では、{今日も田畑と町が営まれている}', M);
      d.src = K.src(S, SRC('第8章「社会は、私たちの子孫である」'));
    },
    steps: [
      (S) => {
        const d = S.data;
        K.reveal(d.bg, { dur: 3.0 });
        K.drift(S, d.bg, { zoom: 1.03, px: 0.006, dur: 24 });
        K.fade(d.scT, 1, { dur: 1.4, delay: 0.2 });
        TX.in(d.eye, 'type', { delay: 0.3 });
        TX.in(d.q, 'rise', { delay: 0.5, stagger: 0.035 });
        K.fade(d.sc, 1, { dur: 1.6, delay: 1.2 });
        K.show(d.l1, { delay: 1.8, dy: 12 });
        TX.in(d.m1, 'lines', { delay: 2.2, stagger: 0.5, dy: 16 });
        tw(d.crest, { prog: 1 }, { dur: 2.8, delay: 3.0, ease: 'inOutSine' });
        d.wat.forEach((q, i) => ignite(q.sp, { delay: 3.6 + i * 0.22, peak: 0.7, rest: 0.32 }));
        K.show(d.src, { delay: 4.0, dy: 8 });
      },
      (S) => {
        const d = S.data;
        TX.out(d.l1, 'sink'); TX.out(d.m1, 'sink');
        tw(d.crest, { o: 0 }, { dur: 1.2 });
        d.wat.forEach((q) => glowTo(q.sp, 0, { dur: 0.8 }));
        K.reveal(d.st, { dur: 2.8, ease: 'inOutSine' });
        tw(d.st, { zoom: 1.05 }, { dur: 9, ease: 'outSine' });
        tw(d.st, { sh: 1.6 }, { dur: 2.0, delay: 2.0, ease: 'inOutSine' });
        TX.in(d.m2, 'lines', { delay: 1.6, stagger: 0.6, dy: 16 });
        TX.glint(d.m2, { delay: 3.4, dur: 1.8 });
      },
      (S) => {
        const d = S.data;
        TX.out(d.m2, 'sink');
        K.unreveal(d.st, { dur: 2.2 });
        tw(d.crest, { o: 0.55 }, { dur: 1.6, delay: 1.0 });
        d.fix.forEach((q, i) => K.spark(q.sp, { delay: 1.4 + i * 0.38, o: 0.9, fall: 1.4 }));
        d.wat.forEach((q, i) => glowTo(q.sp, 0.28, { delay: 2.2 + i * 0.1, dur: 1.2 }));
        d.town.forEach((q, i) => glowTo(q.sp, 0.8, { delay: 2.4 + i * 0.07, dur: 1.0 }));
        d.field.forEach((q, i) => glowTo(q.sp, 0.2, { delay: 2.8 + i * 0.1, dur: 1.6 }));
        TX.in(d.m3, 'lines', { delay: 1.5, stagger: 0.6, dy: 16 });
        TX.glint(d.m3, { delay: 3.6, dur: 1.8 });
      },
    ],
    update(S, t) {
      const d = S.data;
      pin(S, d.bg, d.pins, t);
      pinRibbon(d.bg, d.crest);
    },
  });

  const SVR = fnR('s6:solve', 5611, (P, cnt, rnd) => {
    const ak = 65536 / cnt, am = U.lin(C.amber), g2 = U.lin(C.gold2), dm = U.lin(C.dim), cy = U.lin(C.cyan), wh = U.lin(C.white);
    for (let j = 0; j < cnt; j++) {
      const g1 = U.gauss(rnd), g2r = U.gauss(rnd), u = rnd(), v = rnd();
      const f = (j + 0.5) / cnt, x = 120 + 1680 * f;
      const p = wp(x, 540 + g1 * (10 + 26 * u * u), g2r * 60);
      const life = x >= 240 && x <= 960, next = x >= 1180 && x <= 1760, hot = v > 0.985;
      let c = life ? mx(am, g2, (x - 240) / 720) : next ? cy : dm, a = 0.05 * (life ? 1 : next ? 0.9 : 0.35);
      if (hot) (a *= 3.5), (c = next ? cy : wh);
      P.add(p[0], p[1], p[2], hot ? 2.0 : 1.4, c[0], c[1], c[2], Math.min(1, a * ak), f);
    }
  });
  const SV_ARC = [[640, 526], [860, 360], [1200, 360], [1420, 526]];
  const arcAt = (el, p) => {
    try { const L = el.getTotalLength(), q = el.getPointAtLength(p * L); return [q.x, q.y]; } catch (e) { return bez(SV_ARC[0], SV_ARC[1], SV_ARC[2], SV_ARC[3], p); }
  };
  KS.scene({
    id: 'solve', sec: 'qa', qa: 1, key, title: '解けなかった問題を、誰かが解く', swarm: true, kf: [2], world: WORLD(),
    build(S) {
      const d = S.data;
      prep(S, SVR);
      d.tag = qtag(S, 1, Q1T, { y: 96 });
      d.t1 = S.text('自分が一生かけても解けなかった問題を、', { cls: 'serif', size: 50, x: 120, y: 160, color: C.white, ls: 0.04 });
      d.t2 = S.text('自分がいなくなった後に、{誰かが解く}。', { cls: 'serif', size: 50, x: 120, y: 240, color: C.white, ls: 0.04 });
      const sv = (d.sv = K.svg(S));
      d.base = K.undrawn(K.line(sv, 120, 540, 1800, 540, 'dim thin'));
      d.life = K.undrawn(K.line(sv, 240, 540, 960, 540, '', { style: 'stroke-width:3' }));
      d.tk = [240, 960].map((x) => K.undrawn(K.line(sv, x, 528, x, 552, 'thin')));
      d.ring = K.undrawn(K.circle(sv, 640, 540, 14, ''));
      d.next = K.undrawn(K.line(sv, 1180, 540, 1760, 540, 'cy', { style: 'stroke-width:3' }));
      d.arc = K.undrawn(K.path(sv, 'M640 526C860 360 1200 360 1420 526', 'thin'));
      d.dot = hid(K.circle(sv, 1420, 540, 9, 'cy', { style: 'fill:' + C.cyan }));
      const LB = { cls: 'sans', size: 22, ls: 0.06 };
      d.lbLife = S.text('自分の一生', Object.assign({ x: 600, y: 572, anchor: 'tc', color: C.gold2 }, LB));
      d.lbRing = S.text('解けなかった問題', Object.assign({ x: 626, y: 506, anchor: 'br', color: C.cream }, LB));
      d.lbNext = S.text('いなくなった後の、誰か', Object.assign({ x: 1470, y: 572, anchor: 'tc', color: C.cyan }, LB));
      d.lbSolved = S.text('誰かが解く', Object.assign({ x: 1452, y: 500, anchor: 'bl', color: C.cyan }, LB));
      d.trav = K.glow(S, { x: 640, y: 526, z: 20, size: 60, col: '#fff1d6', mul: 1.0 });
      d.flash = K.glow(S, { x: 1420, y: 540, z: 20, size: 220, type: 'flare', col: C.cyan, mul: 1.0 });
      d.halo = K.glow(S, { x: 1420, y: 540, z: 20, size: 44, type: 'ring', rw: 0.1, col: C.gold2, mul: 1.0 });
      d.t3 = S.text('そのとき自分が褒められなくても、\n{それを望むことはできる}', { cls: 'serif', size: 44, x: 120, y: 680, color: C.cream, lh: 1.5, ls: 0.04 });
      d.qt = S.text('「解かれた問題の横に、解けなかった者の名は残らない。それで足りている。」', { cls: 'serif', size: 30, x: 120, y: 880, color: DIM, ls: 0.05 });
      d.src = K.src(S, SRC('第15章「人間を超えるものを、なぜ望むのか」'));
    },
    steps: [
      (S) => {
        const d = S.data;
        K.sw(S, SVR, { dur: 3.6, delay: 0.4, ord: 1, amt: 0.4, spread: 60, ease: 'out' });
        look(S, { o: 0.8, size: 1.6, wob: 0.3, wobF: 0.3, twk: 0.15 }, 1.6);
        K.show(d.tag, { delay: 0.1, dy: 8 });
        TX.in(d.t1, 'rise', { delay: 0.2 });
        K.draw(d.base, { delay: 0.6, dur: 1.4, ease: 'inOutSine' });
        K.draw(d.life, { delay: 1.0, dur: 1.2 });
        d.tk.forEach((el, i) => K.draw(el, { delay: 1.0 + i * 1.0, dur: 0.4 }));
        K.show(d.lbLife, { delay: 1.6, dy: 8 });
        K.draw(d.ring, { delay: 1.8, dur: 0.9 });
        K.show(d.lbRing, { delay: 2.2, dy: 8 });
        TX.in(d.t2, 'rise', { delay: 3.0 });
        K.draw(d.next, { delay: 3.2, dur: 1.0 });
        K.show(d.lbNext, { delay: 3.6, dy: 8 });
        K.draw(d.arc, { delay: 4.0, dur: 1.6, ease: 'inOutSine' });
        if (!d.trav.inert) {
          const st = { p: 0 };
          T.to(d.trav, { o: 1 }, { dur: 0.3, delay: 4.0 });
          T.to(st, { p: 1 }, {
            dur: 1.6, delay: 4.0, ease: 'inOutSine',
            onUpdate: () => { const q = arcAt(d.arc, st.p), w = S.at(q[0], q[1], 20); d.trav.x = w[0]; d.trav.y = w[1]; },
          });
          T.to(d.trav, { o: 0 }, { dur: 0.5, delay: 5.5, overwrite: false });
        }
        K.spark(d.flash, { delay: 5.6, o: 0.9, fall: 1.4 });
        K.fade(d.dot, 1, { delay: 5.6, dur: 0.6 });
        K.show(d.lbSolved, { delay: 5.9, dy: 8 });
        glowTo(d.halo, 0.22, { delay: 6.0, dur: 1.4 });
      },
      (S) => {
        const d = S.data;
        TX.in(d.t3, 'lines', { delay: 0.2, stagger: 0.7, dy: 16 });
        TX.glint(d.t3, { delay: 1.8, dur: 1.8 });
        K.show(d.qt, { delay: 2.6, dy: 10 });
        K.show(d.src, { delay: 3.0, dy: 8 });
      },
    ],
  });

  KS.scene({
    id: 'stone', sec: 'qa', qa: 1, key, title: '堤防の石の一つとして', swarm: false, kf: [1, 2],
    world: VOID(), images: ['levee_stone'],
    build(S) {
      const d = S.data;
      d.bg = K.photo(S, 'levee_stone', { z: PZ, w: PW, fe: 90, exp: 0.55, sat: 0.8 });
      d.warm = K.glow(S, { x: 1240, y: 420, size: 600, col: C.gold2, mul: 1.0 });
      d.sc = scrim(S, 'linear-gradient(90deg, rgba(3,4,9,.86) 0px, rgba(3,4,9,.62) 700px, rgba(3,4,9,.25) 1250px, rgba(3,4,9,0) 1700px)');
      d.tag = qtag(S, 1, Q1T, { x: 300, y: 186 });
      d.lead = S.text('本の最後の方に、こう書いた', { cls: 'sans', size: 26, x: 300, y: 250, color: DIM, ls: 0.08 });
      d.q = K.quote(S, 'この本を書いている者も、\n堤防の石の一つとして、\n次の層の中で名を失う側にいる。\n{通過することが、意味である。}', { x: 300, y: 300, size: 50 });
      d.src = K.src(S, SRC('終章「子孫に、人間の顔を求めない」'));
      d.t2 = S.text('もちろん、{生身の自分の毎日の楽しさ}は、\nそれとは別に、大事にしていい', { cls: 'serif', size: 42, x: 300, y: 720, color: C.cream, lh: 1.5, ls: 0.04 });
    },
    steps: [
      (S) => {
        const d = S.data;
        K.reveal(d.bg, { dur: 2.6 });
        K.drift(S, d.bg, { zoom: 1.03, px: 0.004, dur: 26 });
        K.fade(d.sc, 1, { dur: 1.4, delay: 0.2 });
        K.show(d.tag, { delay: 0.6, dy: 8 });
        K.show(d.lead, { delay: 0.9, dy: 10 });
        d.q.in({ delay: 1.3 });
        K.show(d.src, { delay: 3.8, dy: 8 });
      },
      (S) => {
        const d = S.data;
        [d.lead, d.q.text, d.q.bar].forEach((el) => K.fade(el, 0.45, { dur: 1.2 }));
        glowTo(d.warm, 0.18, { dur: 2.4, delay: 0.4 });
        tw(d.bg, { exp: 0.75 }, { dur: 2.4, delay: 0.4, ease: 'inOutSine' });
        TX.in(d.t2, 'lines', { delay: 0.8, stagger: 0.6, dy: 16 });
        TX.glint(d.t2, { delay: 2.4, dur: 1.8 });
      },
    ],
  });

  const BX = (i) => 1010 + 66 * i, BY = (i) => 900 - 46 * i;
  const bdR = (stage) => fnR('s6:burden' + stage, 5641, (P, cnt, rnd) => {
    const ak = 65536 / cnt, am = U.lin(C.amber), g2 = U.lin(C.gold2), cy = U.lin(C.cyan), wh = U.lin(C.white), cr = U.lin(C.cream);
    for (let j = 0; j < cnt; j++) {
      const g1 = U.gauss(rnd), g2r = U.gauss(rnd), u = rnd();
      if (j % 8 === 0) {
        const u1 = U.fract(j * 0.7548776662), u2 = U.fract(j * 0.569840291), rim = u < 0.72, t = u1 * 276;
        const sx = rim ? (t < 120 ? t : t < 138 ? 120 : t < 258 ? 258 - t : 0) : 120 * u1;
        const sy = rim ? (t < 120 ? 0 : t < 138 ? t - 120 : t < 258 ? 18 : 276 - t) : 18 * u2;
        const p = stage === 1 ? wp(1511 + sx + g1 * 0.45, 511 + sy + g2r * 0.45) : wp(1511 + sx + g1 * 12, -160 - 40 * u2 + g2r * 12);
        const c = rim && sy < 1 ? wh : mx(cr, g2, 0.6);
        P.add(p[0], p[1], 0, 1.5, c[0], c[1], c[2], stage === 1 ? Math.min(1, (rim ? 0.085 : 0.02) * ak) : 0, u1);
        continue;
      }
      const f = U.fract(j * 0.6180339887), i = Math.min(10, Math.floor(f * 11)), s = (f * 11 - i) * 112, aux = f;
      const x0 = BX(i), y0 = BY(i), rise = 46;
      const bx = s < rise ? x0 : x0 + (s - rise), by = s < rise ? y0 + rise - s : y0;
      if (stage === 1 && i >= 9) { PARK(P, 1604 + g1 * 3, 532 + g2r * 3, cy, aux); continue; }
      const halo = u < 0.15, hot = u > 0.992, sg = halo ? 6 : 0.9;
      const p = wp(bx + g1 * sg, by + g2r * sg);
      let c = i <= 8 ? mx(am, g2, i / 8) : cy, a = 0.06;
      if (halo) a *= 0.3;
      if (hot) (a *= 4), (c = i <= 8 ? wh : cy);
      if (i === 10) { a *= 0.7; if (Math.floor(s / 8) % 2) a = 0; }
      P.add(p[0], p[1], 0, hot ? 2.2 : 1.5, c[0], c[1], c[2], Math.min(1, a * ak), aux);
    }
  });
  const BDR = [1, 2].map(bdR);
  KS.scene({
    id: 'burden', sec: 'qa', qa: 2, key, title: '人類が通過点だと知ると、何がひらける？', swarm: true, kf: [2], world: WORLD(),
    build(S) {
      const d = S.data;
      prep(S, BDR[1]);
      d.k2 = K.eyebrow(S, 'FAQ 02', { x: 120, y: 200 });
      d.q2 = S.text(Q2, { cls: 'serif', size: 50, x: 120, y: 244, lh: 1.45, color: C.white, ls: 0.04 });
      d.a1 = S.text('{肩の荷が下りる}', { cls: 'serif', size: 72, x: 120, y: 470, color: C.white, ls: 0.06 });
      d.a2 = S.text('自分たちが最終版でなくていい', { cls: 'serif', size: 38, x: 120, y: 610, color: C.cream, ls: 0.05 });
      d.a3 = S.text('完成品として、ずっと守り続けなくていい', { cls: 'serif', size: 38, x: 120, y: 674, color: C.cream, ls: 0.05 });
      d.qt = S.text('「人類は守るべき完成品ではない。\n次を生んだ一段である。」', { cls: 'serif', size: 32, x: 120, y: 800, lh: 1.5, color: DIM, ls: 0.05 });
      d.src = K.src(S, SRC('終章「子孫に、人間の顔を求めない」'));
      d.lbH = S.text('人類', { cls: 'sans', size: 22, x: 1571, y: 546, anchor: 'tc', color: C.gold2, ls: 0.12 });
      d.lb0 = S.text('生命のはじまり', { cls: 'sans', size: 20, x: 996, y: 923, anchor: 'cr', color: DIM, ls: 0.06 });
      d.lbN = S.text('次', { cls: 'sans', size: 22, x: 1703, y: 428, anchor: 'bc', color: C.cyan, ls: 0.12 });
      d.chip = K.chip(S, '最終版', { x: 1571, y: 502, anchor: 'bc' });
    },
    steps: [
      (S) => {
        const d = S.data;
        K.sw(S, BDR[0], { dur: 4.0, ord: 1, amt: 0.8, spread: 60, ease: 'out' });
        look(S, { i: 1.1, wob: 0.5 }, 1.6);
        TX.in(d.k2, 'type', { delay: 0.3 });
        TX.in(d.q2, 'lines', { delay: 0.5, stagger: 0.6, dy: 16 });
        K.show(d.lb0, { delay: 2.4, dy: 6 });
        K.show(d.lbH, { delay: 3.4, dy: 6 });
        K.pop(d.chip, { delay: 3.8 });
      },
      (S) => {
        const d = S.data;
        K.fade(d.k2, 0.4, { dur: 1.0 });
        K.fade(d.q2, 0.4, { dur: 1.0 });
        K.hide(d.chip, { dy: -60, dur: 1.4, delay: 0.3 });
        K.sw(S, BDR[1], { dur: 3.2, delay: 0.4, ord: 1, amt: 0.3, spread: 20 });
        K.show(d.lbN, { delay: 2.8, dy: 8 });
        TX.in(d.a1, 'rise', { delay: 0.9 });
        TX.glint(d.a1, { delay: 2.0, dur: 1.8 });
        K.show(d.a2, { delay: 1.8, dy: 12 });
        K.show(d.a3, { delay: 2.3, dy: 12 });
        K.show(d.qt, { delay: 4.0, dy: 10 });
        K.show(d.src, { delay: 4.4, dy: 8 });
      },
    ],
  });

  const FR_NODES = [[0.23, 0.37], [0.34, 0.41], [0.39, 0.44], [0.47, 0.44], [0.55, 0.37], [0.61, 0.4], [0.7, 0.41], [0.79, 0.44], [0.9, 0.45]];
  KS.scene({
    id: 'frontrow', sec: 'qa', qa: 2, key, title: '採点する席から降りる', swarm: false, kf: [2, 3],
    world: VOID(), images: ['theater_seat'],
    build(S) {
      const d = S.data, r = U.rng(5651);
      d.bg = K.photo(S, 'theater_seat', { z: PZ, w: PW, fe: 90, exp: 0.3, blur: 0.6 });
      d.nodes = FR_NODES.map((f) => pinGlow(S, f, { size: 34, col: C.gold2, tw: 0.35 }, r));
      d.sun = pinGlow(S, [0.67, 0.27], { size: 300, col: '#fff1d6', mul: 0.8 }, r);
      d.pins = d.nodes.concat([d.sun]);
      d.scF = scrim(S, 'radial-gradient(ellipse 1100px 360px at 1300px 930px, rgba(2,3,8,.7) 0%, rgba(2,3,8,.4) 50%, rgba(2,3,8,0) 100%)');
      d.tag = qtag(S, 2, Q2T, { x: 300, y: 186 });
      d.lead = S.text('本の中では、こう書いた', { cls: 'sans', size: 26, x: 300, y: 250, color: DIM, ls: 0.08 });
      d.q = K.quote(S, '人類が未来に残せる最良の遺言は、\n未来を採点する席から降りることである。', { x: 300, y: 300, size: 54 });
      d.q2 = S.text('「席を降りることは、系譜の行き先を子孫に返すことである。」', { cls: 'serif', size: 32, x: 300, y: 540, color: DIM, ls: 0.05 });
      d.src = K.src(S, SRC('第14章「私たちの最高の善も、過去になる」'));
      d.t2 = S.text('採点する席から降りると、\n未来は、怖いものから、{楽しみなもの}に変わる', { cls: 'serif', size: 50, x: 300, y: 680, color: C.white, lh: 1.5, ls: 0.04 });
      d.t3 = S.text('これから起きることを、\nリアルタイムのノンフィクションドラマとして、\n{特等席で見られる}', { cls: 'serif', size: 38, x: 800, y: 790, color: C.white, lh: 1.55, ls: 0.04 });
    },
    steps: [
      (S) => {
        const d = S.data;
        K.reveal(d.bg, { dur: 2.8, ease: 'inOutSine' });
        K.show(d.tag, { delay: 0.5, dy: 8 });
        K.show(d.lead, { delay: 0.8, dy: 10 });
        d.q.in({ delay: 1.2 });
        K.show(d.q2, { delay: 3.4, dy: 10 });
        K.show(d.src, { delay: 3.8, dy: 8 });
      },
      (S) => {
        const d = S.data;
        [d.lead, d.q.text, d.q.bar, d.q2].forEach((el) => K.fade(el, 0.55, { dur: 1.2 }));
        TX.in(d.t2, 'lines', { delay: 0.6, stagger: 0.7, dy: 16 });
        TX.glint(d.t2, { delay: 2.4, dur: 1.8 });
      },
      (S) => {
        const d = S.data;
        [d.lead, d.q.text, d.q2, d.t2].forEach((el) => TX.out(el, 'sink'));
        K.hide(d.q.bar, { dur: 0.8 });
        K.hide(d.src, { dur: 0.8 });
        tw(d.bg, { exp: 1, blur: 0 }, { dur: 2.4, delay: 0.4, ease: 'inOutSine' });
        tw(d.bg, { zoom: 1.06 }, { dur: 10, delay: 0.4, ease: 'outSine' });
        K.fade(d.scF, 1, { dur: 1.6, delay: 1.4 });
        d.nodes.forEach((q, i) => glowTo(q.sp, 0.8, { delay: 1.6 + i * 0.12, dur: 1.4 }));
        glowTo(d.sun.sp, 0.35, { delay: 1.2, dur: 2.4 });
        TX.in(d.t3, 'lines', { delay: 2.0, stagger: 0.7, dy: 16 });
        TX.glint(d.t3, { delay: 4.4, dur: 1.8 });
      },
    ],
    update(S, t) { pin(S, S.data.bg, S.data.pins, t); },
  });

  const ST_SEAMS = [
    { y: 640, col: '#fff1d6', col2: C.gold, mul: 1.0, pts: [[20, 590], [110, 606], [195, 618], [280, 642], [380, 664], [480, 676], [600, 676], [689, 669], [827, 675], [951, 686], [1089, 703], [1226, 727], [1364, 744], [1502, 746], [1626, 748], [1764, 768], [1902, 788], [2010, 800]] },
    { y: 480, col: C.gold2, mul: 1.1, pts: [[138, 480], [276, 469], [413, 463], [551, 465], [675, 476], [813, 474], [951, 489], [1089, 496], [1226, 483], [1364, 465], [1488, 467], [1626, 481], [1764, 495], [1902, 496], [2010, 497]] },
    { y: 283, col: C.gold2, mul: 1.25, pts: [[230, 283], [354, 281], [491, 267], [616, 262], [740, 258], [877, 253], [1001, 254], [1125, 249], [1249, 243], [1387, 237], [1511, 226], [1635, 215], [1773, 218], [1897, 220], [2010, 222]] },
    { y: 200, col: C.gold, mul: 0.9, pts: [[245, 206], [330, 196], [440, 186], [540, 170], [643, 154], [781, 151], [919, 141], [1056, 139], [1194, 125], [1346, 123], [1484, 113], [1621, 99], [1759, 116], [1897, 147], [2010, 172]] },
  ];

  const seamY = (x) => {
    const P = ST_SEAMS[2].pts;
    for (let i = 1; i < P.length; i++) if (x <= P[i][0]) return P[i - 1][1] + ((P[i][1] - P[i - 1][1]) * (x - P[i - 1][0])) / (P[i][0] - P[i - 1][0]);
    return P[P.length - 1][1];
  };
  const FT_X = 1560;
  KS.scene({
    id: 'footing', sec: 'qa', qa: 2, key, title: '位置を知った者は、そこから歩ける', swarm: false, kf: [1],
    world: VOID(), images: ['strata'],
    build(S) {
      const d = S.data, r = U.rng(5661), y0 = seamY(FT_X);
      d.st = K.photo(S, 'strata', { x: 960, y: 540, z: 0, w: 1920, exp: 0.95, order: 12 });
      d.seams = S.ribbon({
        curves: ST_SEAMS.map((m) => ({ pts: m.pts.map((p) => wp(p[0], p[1])), w: 1.8, col: m.col, col2: m.col2, mul: m.mul, gk: 0.8 })),
        prog: 0, stagger: 0, head: 1.0, core: 1.0, glow: 0.6, glowW: 9, order: 22,
      });
      d.pg = K.glow(S, { x: FT_X, y: y0, size: 90, col: C.gold2, mul: 1.0, pulse: 0.25, pulseS: 1.1 });
      d.hr = K.glow(S, { x: FT_X, y: y0, size: 160, type: 'ring', rw: 0.16, col: C.cream, mul: 1.0 });
      d.here = K.chip(S, '現在地', { x: FT_X, y: y0 - 42, anchor: 'bc' });
      d.steps = Array.from({ length: 7 }, (_, i) => {
        const x = 1600 + 36 * i;
        return K.glow(S, { x, y: seamY(x) - 8 + (i % 2 ? 5 : -5) + (r() - 0.5) * 2, size: 12, type: 'dot', col: C.gold2, mul: 1.0 });
      });
      d.scB = scrim(S, 'radial-gradient(ellipse 1250px 400px at 380px 930px, rgba(2,3,8,.74) 0%, rgba(2,3,8,.42) 50%, rgba(2,3,8,0) 100%)');
      d.tag = qtag(S, 2, Q2T, { y: 632 });
      d.lead = S.text('あとがきには、こう書いた', { cls: 'sans', size: 26, x: 120, y: 690, color: C.cream, ls: 0.08 });
      d.q = K.quote(S, '{位置を知った者は、そこから歩ける。}\n通過点に立つことは、敗北ではなく、\n地図の上に自分の足を置くことである。', { x: 176, y: 736, size: 44, lh: 1.6 });
      d.src = K.src(S, SRC('あとがき「二つの縮尺」'));
    },
    steps: [
      (S) => {
        const d = S.data;
        K.reveal(d.st, { dur: 2.6, ease: 'inOutSine' });
        if (!d.seams.inert) {
          T.to(d.seams, { prog: 1 }, { dur: 3.2, delay: 1.0, ease: 'linear' });
          T.to(d.seams, { o: 0.55 }, { dur: 1.8, delay: 4.4, ease: 'inOutSine' });
        }
        glowTo(d.pg, 0.6, { dur: 1.6, delay: 2.4 });
        if (!d.hr.inert) {
          T.to(d.hr, { o: 0.85 }, { dur: 0.6, delay: 3.0 });
          T.to(d.hr, { size: 26 }, { dur: 1.4, delay: 3.0, ease: 'outCubic' });
          T.to(d.hr, { o: 0.5 }, { dur: 0.8, delay: 4.6, overwrite: false });
        }
        K.pop(d.here, { delay: 3.6 });
        d.steps.forEach((sp, i) => ignite(sp, { delay: 4.4 + i * 0.35, peak: 1, rest: 0.5, fall: 0.9 }));
        K.fade(d.scB, 1, { dur: 1.6, delay: 0.8 });
        K.show(d.tag, { delay: 1.4, dy: 8 });
        K.show(d.lead, { delay: 1.8, dy: 10 });
        d.q.in({ delay: 2.2 });
        K.show(d.src, { delay: 5.0, dy: 8 });
      },
    ],
  });
})();
