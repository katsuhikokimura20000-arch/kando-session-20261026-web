(function () {
  'use strict';
  const KS = window.KS, K = KS.kit, TX = KS.Text, T = KS.T, C = KS.C, U = KS.U;

  const stageXY = (el) => {
    let x = 0, y = 0;
    for (let e = el; e && e.id !== 'stage'; e = e.offsetParent) {
      x += e.offsetLeft;
      y += e.offsetTop;
    }
    return [x, y];
  };

  const wp = (x, y, z = 0) => [x - 960, 540 - y, z];

  function along(S, sp, pts, z, o = {}) {
    if (!sp || sp.inert) return 0;
    const P = pts.map((p) => S.at(p[0], p[1], z)), n = P.length - 1, st = { p: 0 };
    const cr = (a, b, c, d, u) => 0.5 * (2 * b + (c - a) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (3 * b - a - 3 * c + d) * u * u * u);
    const put = () => {
      const f = U.clamp(st.p, 0, 1) * n, i = Math.min(n - 1, Math.floor(f)), u = f - i;
      const a = P[Math.max(0, i - 1)], b = P[i], c = P[i + 1], d = P[Math.min(n, i + 2)];
      sp.x = cr(a[0], b[0], c[0], d[0], u);
      sp.y = cr(a[1], b[1], c[1], d[1], u);
    };
    put();
    const dur = o.dur || 3, delay = o.delay || 0;
    T.to(st, { p: 1 }, { dur, delay, ease: o.ease || 'inOutSine', onUpdate: put });
    return delay + dur;
  }

  const titleRecipe = (el) => ({
    type: 'canvas', key: 's01:title', w: 1920, h: 1080, res: 1,
    fonts: ['500 132px "Noto Serif JP"', '500 81.84px "Noto Serif JP"'],
    color: C.gold2, color2: C.amber, grad: 'y', sort: 'read', depth: 6, sizeVar: 0.5, sparkle: 0.04, n: 26000,
    draw(ctx) {
      ctx.textBaseline = 'alphabetic';
      el._chars.forEach((c) => {
        const cs = getComputedStyle(c), f = parseFloat(cs.fontSize);
        const L = /px$/.test(cs.lineHeight) ? parseFloat(cs.lineHeight) : 1.18 * f;
        ctx.font = '500 ' + f + 'px "Noto Serif JP"';
        const m = ctx.measureText(c.textContent), A = m.fontBoundingBoxAscent, De = m.fontBoundingBoxDescent;
        const p = stageXY(c);
        ctx.fillText(c.textContent, p[0], p[1] + (L - (A + De)) / 2 + A);
      });
    },
  });

  const THREAD = [[419, 838], [676, 781], [949, 628], [1168, 496], [1389, 323]];
  KS.scene({
    id: 'title', sec: 0, title: '人類という通過点', hud: false, swarm: true,
    world: { sky: 'deep', post: { vig: 0.46, bloom: 1 }, dust: { o: 0.5 } },
    images: ['hand_light'],
    build(S) {
      const d = S.data;
      d.bg = K.photo(S, 'hand_light', { z: -700, w: 2100, fe: 44, exp: 0.85 });
      d.eye = S.text('感動セッション #26　──　2026.10.26', { cls: 'sans', size: 19, x: 151, y: 92, color: C.gold, ls: 0.3, weight: 500 });
      d.title = S.text('人類^という^\n通過点', { cls: 'serif', size: 132, x: 148, y: 150, color: C.white, lh: 1.18, ls: 0.02, style: { fontFeatureSettings: '"palt" 0' } });
      d.subt = S.text('生命の系譜と、子孫としての超知能', { cls: 'serif', size: 40, x: 152, y: 492, color: 'rgba(243,234,216,.8)', ls: 0.08 });
      d.rule = K.rule(S, { x: 152, y: 574, w: 520 });
      d.name = S.text('小林由幸　^Frieve-A^', { cls: 'serif', size: 36, x: 152, y: 600, color: C.cream, ls: 0.14 });
      d.flare = K.glow(S, { x: THREAD[0][0], y: THREAD[0][1], z: -700, type: 'flare', size: 210, spikes: 4, col: C.gold2, mul: 1.6 });
      d.hub = K.glow(S, { x: 1389, y: 323, z: -700, size: 520, col: C.gold2, mul: 1.1 });
    },
    steps: [
      (S) => {
        const d = S.data;
        K.reveal(d.bg, { dur: 3.2, settle: 1.04 });
        K.drift(S, d.bg, { zoom: 1.04, px: 0.008, dur: 26 });
        K.sw(S, titleRecipe(d.title), { x: 960, y: 540, z: 0, dur: 3.0, amt: 0.5, ord: 1, spread: 200, swirl: 0.3, glow: 0.8, ease: 'expo' });
        S.swarmLook({ size: 2.0, i: 1, wob: 1.5 }, { dur: 1.2 });
        S.swarmLook({ size: 1.7, i: 0.3, wob: 1.2 }, { dur: 2.2, delay: 2.4 });
        K.show(d.title, { dy: 0, blur: 16, dur: 1.9, delay: 2.3, ease: 'outCubic' });
        TX.in(d.subt, 'rise', { delay: 3.3, stagger: 0.035 });
        K.grow(d.rule, { delay: 3.9, dur: 1.6 });
        K.show(d.name, { delay: 4.3 });
        TX.in(d.eye, 'type', { delay: 4.8 });

        const f = d.flare;
        if (f && !f.inert) {
          const t1 = along(S, f, THREAD, -700, { delay: 3.6, dur: 3.4, ease: 'inOutSine' });
          T.to(f, { o: 1 }, { dur: 0.5, delay: 3.6, ease: 'outCubic' });
          T.to(f, { o: 0 }, { dur: 0.7, delay: t1 - 0.5, ease: 'inOutSine', overwrite: false });
          T.to(d.hub, { o: 0.95 }, { dur: 0.45, delay: t1 - 0.3, ease: 'outCubic' });
          T.to(d.hub, { o: 0.5 }, { dur: 1.8, delay: t1 + 0.2, ease: 'inOutSine', overwrite: false });
          S.loop(d.hub, { i: 1.35 }, { dur: 3.4, delay: t1 + 2.2 });
          TX.glint(d.title, { delay: t1 + 0.1, dur: 1.9, i: 0.8 });
        }
      },
    ],
  });

  const PF_DOT = [1290, 430];
  KS.scene({
    id: 'profile', sec: 0, title: '自己紹介', swarm: false,
    world: { sky: 'deep', post: { vig: 0.42, bloom: 1 }, dust: { o: 0.3 } },
    images: ['portrait', 'nnc', 'cover_boot'],
    build(S) {
      const d = S.data;

      d.back = K.glow(S, { x: 1560, y: 430, z: -300, size: 1100, col: C.amber, mul: 0.32, order: 5 });
      d.ph = K.photo(S, 'portrait', { x: 1530, y: 580, w: 860, h: 1000, exp: 0.94 });
      d.eye = S.text('自己紹介', { cls: 'sans', size: 22, x: 150, y: 150, color: C.gold, ls: 0.28, weight: 500 });
      d.copy = S.text('AIを作る側と\n使い倒す側、\nその両方の経験から、\nAIと人類のこれからを考える。', { cls: 'serif', size: 62, x: 146, y: 196, color: C.white, lh: 1.42, ls: 0.03 });
      d.thA = K.threads(S, { from: [590, 238, 0], to: [PF_DOT[0], PF_DOT[1], 0], n: 3, bow: 16, jit: 5, w: 1.4, col: C.gold2, mul: 0.7, glow: 0.45, seed: 11 });
      d.thB = K.threads(S, { from: [580, 324, 0], to: [PF_DOT[0], PF_DOT[1], 0], n: 3, bow: 14, jit: 5, w: 1.4, col: C.cyan, mul: 0.7, glow: 0.45, seed: 23 });
      d.dot = K.glow(S, { x: PF_DOT[0], y: PF_DOT[1], z: 4, size: 46, col: C.gold2, mul: 1.1 });
      d.spark = K.glow(S, { x: PF_DOT[0], y: PF_DOT[1], z: 6, type: 'flare', size: 130, spikes: 4, col: C.gold2, mul: 1.4 });
      d.rule = K.rule(S, { x: 150, y: 588, w: 560 });
      d.name = S.text('小林 由幸　^｜　デジタルクリエイター^', { cls: 'serif', size: 40, x: 150, y: 610, color: C.cream, ls: 0.1 });
      d.prof = S.text('Frieve代表\n元 ソニーグループ AI領域 Corporate Distinguished Engineer\nNeural Network Consoleの開発とDeep Learningの解説\n現在 ｜ AIの動向と実践を発信\nX ｜ @frievea', { cls: 'sans', size: 23, x: 152, y: 686, color: 'rgba(243,234,216,.84)', lh: 1.72, ls: 0.03 });

      d.qr = K.link(S, { x: 1012, y: 808, anchor: 'tc', size: 150, url: 'https://x.com/frievea', label: 'x.com/frievea', usize: 18 });
      d.nnc = K.photo(S, 'nnc', { x: 1352, y: 852, w: 384, h: 216, round: 6, order: 12, exp: 0.95 });
      d.nncL = S.text('Neural Network Console', { cls: 'sans', size: 17, x: 1352, y: 976, anchor: 'tc', color: 'rgba(243,234,216,.62)', ls: 0.06 });
      d.book = K.cover(S, 'cover_boot', { x: 1736, y: 814, w: 196, order: 12 });
      d.bookL = S.text('著書『神のブートローダー』', { cls: 'sans', size: 17, x: 1736, y: 976, anchor: 'tc', color: 'rgba(243,234,216,.62)', ls: 0.06 });
    },
    steps: [
      (S) => {
        const d = S.data;
        T.to(d.back, { o: 0.9 }, { dur: 2.4, ease: 'inOutSine' });
        K.reveal(d.ph, { dur: 2.6, settle: 1.03 });
        TX.in(d.eye, 'type', { delay: 0.3 });
        TX.in(d.copy, 'lines', { delay: 0.6, stagger: 0.22 });

        K.weave(d.thA, { dur: 2.0, delay: 1.5, ease: 'inOutSine' });
        K.weave(d.thB, { dur: 2.0, delay: 1.8, ease: 'inOutSine' });
        K.spark(d.spark, { delay: 3.5, fall: 1.4, o: 1 });
        T.to(d.dot, { o: 0.9 }, { dur: 0.5, delay: 3.5, ease: 'outCubic' });
        K.grow(d.rule, { delay: 2.2, dur: 1.4 });
        K.show(d.name, { delay: 2.5 });
        TX.in(d.prof, 'lines', { delay: 2.8, stagger: 0.12 });
        K.pop(d.qr, { delay: 3.6 });
        K.reveal(d.nnc, { delay: 3.8, dur: 1.8 });
        K.coverIn(d.book, { delay: 4.1, dur: 1.8 });
        K.show(d.nncL, { delay: 4.6, dy: 6 });
        K.show(d.bookL, { delay: 4.9, dy: 6 });
      },
    ],
  });

  const TL_Y = 820;
  KS.scene({
    id: 'lastyear', sec: 0, title: '1年前の問い', swarm: 0.7,
    world: { sky: 'deep', post: { vig: 0.48 }, dust: { o: 0.36 } },
    build(S) {
      const d = S.data;
      d.eye = S.text('1年前に、私が話していた問い', { cls: 'sans', size: 22, x: 300, y: 250, color: C.gold, ls: 0.28, weight: 500 });
      d.q = K.quote(S, 'AIで何でもできるようになった時に、\n我々は本当に何がしたいのか？', { x: 300, y: 312, size: 64 });
      d.svg = K.svg(S, { w: 1920, h: 1080 });
      d.line = K.undrawn(K.path(d.svg, 'M300 ' + TL_Y + ' L1990 ' + TL_Y, 'thin', { style: 'stroke:rgba(242,183,102,.55)' }));
      d.n1 = K.undrawn(K.circle(d.svg, 420, TL_Y, 7, '', { style: 'fill:#f2b766;stroke:none' }));
      d.n2 = K.undrawn(K.circle(d.svg, 1500, TL_Y, 9, '', { style: 'fill:#ffcf8a;stroke:none' }));
      d.n2r = K.undrawn(K.circle(d.svg, 1500, TL_Y, 22, 'thin'));
      d.l1 = S.text('1年前', { cls: 'sans', size: 24, x: 420, y: TL_Y + 30, anchor: 'tc', color: 'rgba(243,234,216,.72)', ls: 0.16 });
      d.l2 = S.text('今日', { cls: 'sans', size: 26, x: 1500, y: TL_Y + 34, anchor: 'tc', color: C.gold2, ls: 0.2, weight: 500 });
      d.l2d = S.text('2026.10.26', { cls: 'mono', size: 17, x: 1500, y: TL_Y + 76, anchor: 'tc', color: 'rgba(242,183,102,.7)', ls: 0.16 });
      d.cont = S.text('今日は、この問いの続きを', { cls: 'serif', size: 44, x: 1500, y: TL_Y - 64, anchor: 'bc', color: C.cream, ls: 0.06 });
      d.spark = K.glow(S, { x: 1500, y: TL_Y, z: 10, type: 'flare', size: 120, spikes: 4, col: C.gold2, mul: 1.5 });
    },
    steps: [
      (S) => {
        const d = S.data;
        TX.in(d.eye, 'type', { delay: 0 });
        d.q.in({ delay: 0.35 });

        K.sw(S, { type: 'scatter', key: 's02:band', box: [1900, 60, 240], gauss: true, color: C.gold2, color2: C.copper, grad: 'random', alpha: 0.5, sizeVar: 0.8, n: 9000 }, { x: 1145, y: TL_Y, z: -60, dur: 3.2, amt: 0.6, spread: 220, ease: 'out' });
        S.swarmLook({ o: 0.7, size: 1.8, i: 0.75, wob: 6, wobF: 0.4, flow: 30, flowF: 0.002, flowS: 0.04 }, { dur: 2.4 });
      },
      (S) => {
        const d = S.data;
        TX.dim(d.q.text, 0.62, { dur: 1.2 });
        K.fade(d.q.bar, 0.5, { dur: 1.2 });
        K.draw(d.line, { dur: 2.2, ease: 'inOutSine' });
        K.draw(d.n1, { dur: 0.6, delay: 0.25 });
        K.show(d.l1, { delay: 0.35, dy: 10 });
        S.swarmLook({ o: 1, size: 1.9, i: 0.95, wob: 2, flow: 8 }, { dur: 1.2 });
        K.sw(S, { type: 'line', key: 's02:tl', pts: [wp(300, TL_Y), wp(1990, TL_Y)], w: 2.6, n: 22000, color: C.gold2, color2: C.amber, grad: 'x', sort: 'path', sizeVar: 0.5, sparkle: 0.05 }, { dur: 2.4, ord: 1, amt: 0.7, spread: 60, ease: 'out' });
        K.draw(d.n2, { dur: 0.5, delay: 1.35 });
        K.draw(d.n2r, { dur: 1.1, delay: 1.45, ease: 'outCubic' });
        K.spark(d.spark, { delay: 1.35, fall: 1.4, o: 1 });
        K.show(d.l2, { delay: 1.55, dy: 10 });
        K.show(d.l2d, { delay: 1.75, dy: 8 });
        TX.in(d.cont, 'rise', { delay: 1.9, stagger: 0.04 });
      },
    ],
  });

  const FOG = { type: 'scatter', key: 's03:fog', box: [2900, 560, 800], gauss: true, color: '#aab8d6', color2: '#56688e', grad: 'random', alpha: 0.022, sizeVar: 0.6, seed: 31 };
  const HALO = { type: 'scatter', key: 's03:halo', box: [2300, 640, 500], gauss: true, color: C.gold2, color2: C.copper, grad: 'random', alpha: 0.55, sizeVar: 0.8, sparkle: 0.04, n: 16000 };
  const HORIZON = { type: 'line', key: 's03:horizon', pts: [wp(560, 936), wp(1360, 936)], w: 1.3, taper: true, n: 16000, color: C.gold2, color2: C.amber, grad: 'x', sort: 'random', sizeVar: 0.4, sparkle: 0.06 };
  KS.scene({
    id: 'theme', sec: 0, title: 'テーマ ── 「ばかげている」と感じて当然', swarm: true, kf: [2, 3],
    world: { sky: 'deep', post: { vig: 0.5 }, dust: { o: 0.34 } },
    build(S) {
      const d = S.data;
      d.lead = S.text('今日のテーマ', { cls: 'sans', size: 22, x: 960, y: 380, anchor: 'tc', color: C.gold, ls: 0.4, weight: 500 });
      d.title = S.text('『人類^という^通過点』', { cls: 'serif', size: 104, x: 960, y: 520, anchor: 'cc', color: C.white, ls: 0.06, lh: 1.2 });
      d.sub = S.text('生命の系譜と、子孫としての超知能', { cls: 'serif', size: 34, x: 960, y: 628, anchor: 'tc', color: 'rgba(243,234,216,.7)', ls: 0.12 });

      d.voiceL = S.text('このタイトルを聞いて、多くの人が感じること', { cls: 'sans', size: 22, x: 960, y: 742, anchor: 'tc', color: 'rgba(242,183,102,.85)', ls: 0.24 });
      d.voice = S.text('「人類を『通過点』扱いするなんて、ばかげている」', { cls: 'serif', size: 50, x: 960, y: 812, anchor: 'cc', color: C.white, ls: 0.04 });
      d.feel = S.text('人間なんだから、そう感じて普通なんです。', { cls: 'serif', size: 36, x: 960, y: 894, anchor: 'cc', color: 'rgba(243,234,216,.86)', ls: 0.08 });
      d.not = S.text('これが正しいから信じてください、という話はしません。', { cls: 'serif', size: 46, x: 960, y: 830, anchor: 'cc', color: C.cream, ls: 0.06 });
      d.yours = S.text('なるべく具体的にお話しして、どう感じるかは皆さんにお任せします。', { cls: 'serif', size: 32, x: 960, y: 908, anchor: 'cc', color: 'rgba(243,234,216,.86)', ls: 0.08 });
      d.fog = K.ps(S, { side: 64, o: 0, i: 0.5, size: 190, wob: 14, wobF: 0.35, flow: 160, flowF: 0.0014, flowS: 0.05, order: 32 });
      if (!d.fog.inert) d.fog.set(FOG, { x: 0, y: -18, z: 140 });
    },
    steps: [
      (S) => {
        const d = S.data;
        TX.in(d.lead, 'type', { delay: 0 });
        TX.in(d.title, 'spread', { delay: 0.2, dur: 2.2 });
        TX.in(d.sub, 'rise', { delay: 1.1, stagger: 0.03 });
        K.sw(S, HALO, { x: 960, y: 560, z: -260, dur: 3.2, ord: 0, amt: 0.6, spread: 260, ease: 'out' });
        S.swarmLook({ size: 2.3, i: 1, wob: 6, wobF: 0.6, flow: 40, flowF: 0.002, flowS: 0.05 }, { dur: 2 });
      },
      (S) => {
        const d = S.data;

        if (!d.fog.inert) {
          T.set(d.fog.m, { x: -320 });
          T.to(d.fog.m, { x: 0 }, { dur: 5.5, ease: 'outCubic' });
          T.to(d.fog, { o: 1 }, { dur: 3.2, ease: 'inOutSine' });
        }
        S.swarmLook({ i: 0.4, wob: 10, wobF: 0.5, flow: 110, flowF: 0.0016, flowS: 0.05 }, { dur: 2.6 });
        K.fade(d.title, 0.42, { dur: 2.6, delay: 0.6, ease: 'inOutSine' });
        K.fade(d.sub, 0.3, { dur: 2.6, delay: 0.6, ease: 'inOutSine' });
        K.fade(d.lead, 0.3, { dur: 2.0, delay: 0.6 });
        K.show(d.voiceL, { delay: 1.0, dy: 8 });
        TX.in(d.voice, 'blurin', { delay: 1.3, dur: 1.6 });
        TX.in(d.feel, 'rise', { delay: 3.0, stagger: 0.03 });
      },
      (S) => {
        const d = S.data;
        [d.voiceL, d.voice, d.feel].forEach((el) => TX.out(el, 'blur', { dur: 0.8 }));

        if (!d.fog.inert) {
          T.to(d.fog, { o: 0 }, { dur: 2.4, ease: 'inOutSine' });
          T.to(d.fog.m, { x: 360 }, { dur: 3.2, ease: 'inSine' });
        }
        K.sw(S, HORIZON, { x: 960, y: 540, z: 0, dur: 2.8, ord: 0, amt: 0.5, spread: 120, ease: 'expo' });
        S.swarmLook({ size: 1.8, i: 1, wob: 1.5, wobF: 1, flow: 0 }, { dur: 2.2 });
        K.fade(d.title, 1, { dur: 1.8, delay: 0.5, ease: 'inOutSine' });
        K.fade(d.sub, 1, { dur: 1.8, delay: 0.6, ease: 'inOutSine' });
        K.fade(d.lead, 1, { dur: 1.4, delay: 0.6 });
        TX.glint(d.title, { delay: 1.6, dur: 1.8, i: 0.75 });
        TX.in(d.not, 'rise', { delay: 0.9, stagger: 0.03 });
        TX.in(d.yours, 'rise', { delay: 2.2, stagger: 0.025 });
      },
    ],
  });

  const R_Y = 600, NX = [420, 960, 1500];
  const ROUTE = { type: 'line', key: 's04:route', pts: [wp(200, R_Y), wp(1720, R_Y)], w: 2.2, n: 20000, color: C.gold2, color2: C.amber, grad: 'x', sort: 'path', sizeVar: 0.5, sparkle: 0.05 };
  KS.scene({
    id: 'route', sec: 0, title: '今日の道すじ', swarm: true,
    world: { sky: 'deep', post: { vig: 0.46 }, dust: { o: 0.36 } },
    build(S) {
      const d = S.data;
      d.head = K.head(S, '今日の道すじ', { eye: 'TODAY', x: 200, y: 214 });
      d.svg = K.svg(S, { w: 1920, h: 1080 });
      d.base = K.undrawn(K.path(d.svg, 'M200 ' + R_Y + ' L1720 ' + R_Y, 'thin', { style: 'stroke:rgba(242,183,102,.45)' }));
      const LB = ['この1年、\n手元で起きたこと', 'それを先に\n延ばしてみると', '2冊の本の中で\n考えたこと'];
      const PARTS = ['PART 01–02', 'PART 03', 'PART 04–05'];
      d.nodes = NX.map((x, i) => ({
        dot: K.undrawn(K.circle(d.svg, x, R_Y, 8, '', { style: 'fill:#f2b766;stroke:none' })),
        no: S.text(PARTS[i], { cls: 'mono', size: 17, x, y: R_Y - 46, anchor: 'bc', color: 'rgba(242,183,102,.85)', ls: 0.2 }),
        lb: S.text(LB[i], { cls: 'serif', size: 32, x, y: R_Y + 44, anchor: 'tc', color: C.cream, lh: 1.5, ls: 0.06 }),
        glow: K.glow(S, { x, y: R_Y, z: 12, size: 90, col: C.gold2, mul: 1.2 }),
      }));
    },
    steps: [
      (S) => {
        const d = S.data;
        d.head.in({ delay: 0 });
        K.draw(d.base, { dur: 2.4, delay: 0.3, ease: 'inOutSine' });
        K.sw(S, ROUTE, { x: 960, y: 540, z: 0, dur: 2.6, delay: 0.2, ord: 1, amt: 0.7, spread: 80, ease: 'out' });
        S.swarmLook({ size: 1.9, i: 0.95, wob: 2, flow: 6 }, { dur: 1.4 });
        d.nodes.forEach((n, i) => {
          const t = 0.7 + i * 0.6;
          K.draw(n.dot, { dur: 0.5, delay: t });
          K.spark(n.glow, { delay: t, fall: 1.6, o: 0.9 });
          T.to(n.glow, { o: 0.42 }, { dur: 1.0, delay: t + 1.4, ease: 'inOutSine', overwrite: false });
          K.show(n.no, { delay: t + 0.1, dy: 8 });
          TX.in(n.lb, 'lines', { delay: t + 0.2, stagger: 0.18 });
        });
      },
    ],
  });
})();
