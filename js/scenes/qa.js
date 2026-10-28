(function () {
  'use strict';
  const KS = window.KS, K = KS.kit, TX = KS.Text, T = KS.T, C = KS.C, DK = KS.deck;
  const WORLD = () => ({ sky: 'deep', post: { vig: 0.5 }, dust: { o: 0.3 } });
  const DIM = 'rgba(243,234,216,.7)';
  const glowTo = (sp, o, opt) => { if (sp && !sp.inert) T.to(sp, { o }, Object.assign({ dur: 1.2, ease: 'inOutSine' }, opt)); };
  const two = (n) => String(n).padStart(2, '0');
  const key = DK.qaKey;

  const Q = [
    '人類が進化の途中なら、\n人生の意味は？', '人類が通過点だと\n知ると、何がひらける？', '結局、人間は\nいらない？', 'AIが\n暴走したら？',
    '仕事が\nなくなったら？', '子どもに\n何を伝える？', 'AIに感動は\nある？', 'AIに倫理を\n教えるべき？',
    '怖くは\nないですか？', '1年前の問いへの\n答えは？', '人類が主役で\nなくなる世界とは？', 'エントロピー・倫理・\n言語をどう捉える？',
  ];
  KS.scene({
    id: 'qa0', sec: 'qa', qa: 0, title: 'FAQ（目次）', swarm: false, kf: [1], world: WORLD(), key,
    build(S) {
      const d = S.data;
      d.glow = K.glow(S, { x: 960, y: 560, z: -400, size: 1100, col: C.gold2, mul: 0.35 });
      d.eye = K.eyebrow(S, 'FAQ', { x: 120, y: 96 });
      d.h = S.text('よくある質問', { cls: 'serif', size: 52, x: 120, y: 140, color: C.white, ls: 0.06 });
      d.sub = S.text('この講演と、2冊の本『人類という通過点』『神のブートローダー』についての質問と答え', { cls: 'sans', size: 24, x: 120, y: 222, color: DIM, ls: 0.08 });
      d.cards = Q.map((t, i) => {
        const el = K.glass(S, { x: 120 + (i % 4) * 426, y: 300 + Math.floor(i / 4) * 222, w: 401, h: 200 }), first = DK.qaFirst(i + 1);
        el.className += ' qa-card';
        if (first) el.dataset.nav = first.id;
        el.innerHTML = '<b>' + two(i + 1) + '</b><span>' + t.replace('\n', '<br>') + '</span>';
        return el;
      });
    },
    steps: [
      (S) => {
        const d = S.data;
        glowTo(d.glow, 0.3, { delay: 0.2, dur: 2.4 });
        TX.in(d.eye, 'type', { delay: 0.2 });
        TX.in(d.h, 'rise', { delay: 0.4, stagger: 0.05 });
        K.show(d.sub, { delay: 1.0, dy: 8 });
        K.each(d.cards, 0.07, (el, t) => K.show(el, { delay: t, dy: 18, dur: 0.9 }), 1.2);
        TX.glint(d.h, { delay: 2.4, dur: 1.6 });
      },
    ],
  });

  const QY = 148, QS = 46, MS = 31, SS = 21;
  function layout(S, n, c) {
    const d = S.data, x0 = c.flip ? 1010 : 120;
    if (c.img) d.ph = K.photo(S, c.img.k, { x: c.flip ? 520 : 1400, y: 540, z: -30, w: 1100, h: 1080, fe: 260, px: c.img.px || 0, py: c.img.py || 0, exp: c.img.exp || 0.92 });
    d.eye = K.eyebrow(S, 'FAQ ' + two(n), { x: x0, y: 96 });
    d.q = S.text(c.q, { cls: 'serif', size: QS, x: x0, y: QY, color: C.white, lh: 1.45, ls: 0.04 });
    let y = QY + K.lines(c.q) * QS * 1.45 + (c.qs ? 14 : 58);
    if (c.qs) {
      d.qs = S.text(c.qs, { cls: 'sans', size: 22, x: x0, y, color: DIM, lh: 1.6, ls: 0.05 });
      y += K.lines(c.qs) * 22 * 1.6 + 48;
    }
    d.pts = c.pts.map((p) => {
      const e = {}, y0 = y;
      e.m = S.text(p.m, { cls: 'serif', size: MS, x: x0 + 32, y, color: C.cream, lh: 1.6, ls: 0.04 });
      y += K.lines(p.m) * MS * 1.6;
      if (p.s) {
        e.s = S.text(p.s, { cls: 'sans', size: SS, x: x0 + 32, y: y + 6, color: DIM, lh: 1.65, ls: 0.05 });
        y += 6 + K.lines(p.s) * SS * 1.65;
      }
      e.bar = K.vrule(S, { x: x0, y: y0 + 10, h: y - y0 - 16 });
      y += 40;
      return e;
    });
    d.y = y;
    if (c.src) d.src = K.src(S, c.src, c.flip ? { x: 1010 } : {});
  }
  const ptIn = (e, t, last) => {
    K.grow(e.bar, { delay: t, dur: 0.9 });
    TX.in(e.m, 'rise', { delay: t + 0.15, stagger: 0.03 });
    if (e.s) TX.in(e.s, 'lines', { delay: t + 0.75, stagger: 0.28, dy: 10 });
    if (last) TX.glint(e.m, { delay: t + 1.5, dur: 1.6 });
  };
  const open = (S) => {
    const d = S.data;
    if (d.ph) {
      K.reveal(d.ph, { delay: 0.1, dur: 2.6 });
      K.drift(S, d.ph, { zoom: 1.05, px: 0.01, dur: 24 });
    }
    TX.in(d.eye, 'type', { delay: 0.3 });
    TX.in(d.q, 'rise', { delay: 0.5, stagger: 0.035 });
    if (d.qs) K.show(d.qs, { delay: 1.2, dy: 8 });
    if (d.src) K.show(d.src, { delay: 2.6, dy: 6 });
  };

  const nextPt = (S, k, t = 0.25) => {
    const d = S.data;
    d.pts.slice(0, k).forEach((e) => TX.dim(e.m, 0.72, { dur: 0.8 }));
    ptIn(d.pts[k], t, k === d.pts.length - 1);
  };
  const page = (n, c) => KS.scene(Object.assign({
    id: 'qa' + n, sec: 'qa', qa: n, title: c.title, swarm: false, kf: [c.pts.length], world: WORLD(), key,
    images: c.img ? [c.img.k] : [],
    build(S) { layout(S, n, c); },
    steps: c.pts.map((p, k) => (k ? (S) => nextPt(S, k) : (S) => {
      open(S);
      ptIn(S.data.pts[0], 1.7, c.pts.length === 1);
    })),
  }, c.over ? c.over(c) : {}));

  page(3, {
    title: '結局、人間はいらない？', img: { k: 'symbiosis' },
    q: '結局、人間は\nいらないということですか？',
    pts: [
      { m: 'いいえ。人間がいなくなった方がいい、\nという話ではまったくありません' },
      { m: '主役が替わっても、\nそれまでの主役はいなくならない', s: '単細胞生物も細菌も、今も地球にいる。\nミトコンドリアは、私たちの細胞の中で働き続けている' },
      { m: '未来が止まるのは、人間が残るからではない', s: '「人間の形を保つこと」を、ほかのどんな変化よりも上に置いたとき' },
    ],
    src: '新刊『人類という通過点』序章・第1章・第11章・終章',
  });
  page(4, {
    title: 'AIが暴走したら？', img: { k: 'aviation' },
    q: 'AIが暴走したら\nどうするんですか？',
    pts: [
      { m: '手すりと、檻は違う', s: '手すり＝事故を減らす安全装置\n檻＝後を継ぐ知性の目的を固定し、上書きを禁じること' },
      { m: '{安全は要る。服従は要らない。}' },
      { m: '初期の飛行機は、命がけだった', s: '「今の時点で安全であること」を条件にしていたら、航空は生まれなかった。\n事故から学び続けて、今では最も安全な乗り物の一つに' },
    ],
    src: '新刊『人類という通過点』第9章',
  });

  const TILES = [
    { k: 'horse_riding', x: 1128, px: 0.12, t: '馬は、乗馬に', s: '運搬は車へ' },
    { k: 'calligraphy', x: 1408, px: 0.1, t: '手書きの文字は、書に', s: '実用は活字・画面へ' },
    { k: 'mech_watch', x: 1688, px: 0.08, t: '手巻きの機械式時計', s: '電池の時計より高い値で' },
  ];
  page(5, {
    title: '仕事がなくなったら？',
    q: '仕事がなくなったら、\n人はどう生きればいいんですか？',
    pts: [
      { m: '「そうなりそう」と\n「どう生きたいか」は、別の話', s: '予測と、自分で選ぶことは、分けて考える' },
      { m: '役割を譲っても、残るものがある', s: '馬は運搬を車に譲って乗馬に。手書きの文字は書に。\n手巻きの機械式時計は、電池の時計より高い値で売られている' },
      { m: '実利を生む取り組みは、AIと共に行う。\n生身の人間としての幸せは、人と関わる', s: '目的を果たす手段としてではなく、\n遺伝子に組み込まれた「幸せを感じるしくみ」に従って' },
    ],
    src: '新刊『人類という通過点』（乗馬・書・機械式時計）',
    over: (c) => ({
      images: TILES.map((t) => t.k),
      build(S) {
        layout(S, 5, c);
        S.data.tiles = TILES.map((t) => ({
          ph: K.photo(S, t.k, { x: t.x, y: 470, z: 0, w: 252, h: 380, round: 10, px: t.px, exp: 0.95 }),
          t: S.text(t.t, { cls: 'serif', size: 24, x: t.x, y: 690, anchor: 'tc', color: C.cream, ls: 0.04 }),
          s: S.text(t.s, { cls: 'sans', size: 18, x: t.x, y: 732, anchor: 'tc', color: DIM, ls: 0.06 }),
        }));
      },
      steps: [
        (S) => {
          open(S);
          ptIn(S.data.pts[0], 1.7);
        },
        (S) => {
          nextPt(S, 1);
          S.data.tiles.forEach((e, i) => {
            const t = 0.5 + i * 0.45;
            K.reveal(e.ph, { delay: t, dur: 1.8 });
            K.show(e.t, { delay: t + 0.9, dy: 8 });
            K.show(e.s, { delay: t + 1.2, dy: 6 });
          });
        },
        (S) => {
          nextPt(S, 2);
          S.data.tiles.forEach((e) => [e.t, e.s].forEach((el) => K.fade(el, 0.55, { dur: 1.0 })));
        },
      ],
    }),
  });
  page(6, {
    title: '子どもに何を伝える？', img: { k: 'parent_child', px: 0.15 },
    q: '子どもに、何を\n伝えればいいですか？',
    pts: [
      { m: '親が渡せるのは、出発点（初期値）', s: '行き先は、子どものもの' },
      { m: '「何も教えなくていい」ではない', s: '最初に何を渡すかは、とても大事' },
    ],
    src: '新刊『人類という通過点』第10章（図10）',
  });
  page(7, {
    title: 'AIに感動はある？', img: { k: 'early_ocean' },
    q: 'AIに、感動やワクワクは\nあるんでしょうか？',
    pts: [
      { m: '人間と同じ感動である必要はない', s: '私たちも、祖先の単細胞生物と\n同じことを考えて暮らしてはいない' },
      { m: '「人間に似ていないから失敗作」と見るか、\n「似ていないところまで行けたのがすごい」と見るか' },
    ],
  });
  page(8, {
    title: 'AIに倫理を教えるべき？', img: { k: 'hand_light', px: 0.2 },
    q: 'AIに倫理を\n教えるべきですか？',
    pts: [
      { m: '倫理とは、個体どうしを協調させる知識', s: '協調する系（しくみ）が生き残る過程で、\n自ら生まれてきたもの' },
      { m: '今わかっていることは、出発点として渡す', s: 'ただし、行き先は固定しない' },
    ],
    src: '新刊『人類という通過点』',
  });
  page(9, {
    title: '怖くはないですか？', img: { k: 'theater_seat', px: -0.15 }, flip: true,
    q: '小林さんご自身は、\n怖くないんですか？',
    pts: [
      { m: '拒否感があるのは、自然なこと', s: '人間なんだから、そう反応して普通' },
      { m: '自分の感触は、むしろワクワク', s: '子どもの頃に思った「空を飛べたら」「ワープできたら」と、\n同じ向きの気持ち' },
      { m: 'リアルタイムのノンフィクションドラマを、\n特等席で見ている感覚' },
    ],
  });
  page(10, {
    title: '1年前の問いへの答えは？', img: { k: 'bootloader_dawn' },
    q: '1年前の問いへの答えは、\n変わりましたか？',
    qs: '1年前に話した問い：AIで何でもできるようになった時に、\n我々は本当に何がしたいのか？',
    pts: [
      { m: '1年前の答え', s: '「とにかくこの技術を一刻も早く、いろんな価値に\nつなげるところに、少しでも貢献していきたい」' },
      { m: '今は、作る楽しさと、次へ渡すこと', s: '30年以上前に作ったゲームを、AIと一緒に、\n今のブラウザで遊べるようにした。これも小さな受け渡し' },
      { m: 'そして、その先を特等席で見届けること', s: '自分たちが最高であり続けることより、\n自分たちの先があることを楽しみにしたい' },
    ],
  });
  page(11, {
    title: '人類が主役でなくなる世界とは？', img: { k: 'strata' },
    q: '人類が主役でなくなる世界とは、\nどんな世界ですか？',
    pts: [
      { m: '主役でなくなっても、役割を変えて残る', s: '馬は乗馬として、手書きの文字は書として残った（FAQ 05）' },
      { m: '生命は、環境を守ってきたのではなく、\n作り替えてきた', s: '酸素を吐き出した微生物が、海と空気を変えた。\n酸素を吸って生きる私たちは、その海で選ばれた細胞の子孫' },
    ],
    src: '新刊『人類という通過点』第1章ほか',
  });

  const COLS = [
    { h: 'エントロピー', b: '前著では、宇宙の目的関数（物差し）に\n「最大エントロピー生成原理」を置いた', g: '自然は、エネルギーをできるだけ速く\n散らす道を選ぶ、という仮説', q: '新刊では、\n「熱力学は、何を善とせよとも\n命じない。どんな価値も、\n選ばれたものである」', k: '物差しは、選ぶもの' },
    { h: '倫理', b: '個体どうしを\n協調させる知識', q: '協調する系（しくみ）が\n生き残る過程で、\n自ら生まれてきた', k: '渡すのは出発点、\n行き先は固定しない' },
    { h: '言語', b: '話し言葉は、\n毎秒数十ビット', q: '「言葉という細い管」が\n頭と頭をつないで、\n社会を作ってきた', k: 'AIは、その管の細さに\n縛られない' },
  ];
  page(12, {
    title: 'エントロピー・倫理・言語をどう捉える？', q: 'エントロピー、倫理、言語を、2冊の本ではどう捉えていますか？',
    pts: [{ m: '' }, { m: '' }, { m: '' }],
    src: '前著『神のブートローダー』／新刊『人類という通過点』',
    over: (c) => ({
      images: ['cosmic_web'],
      build(S) {
        const d = S.data;
        d.ph = K.photo(S, 'cosmic_web', { x: 960, y: 540, z: -120, w: 1920, h: 1080, exp: 0.5, fv: 0.6 });
        d.eye = K.eyebrow(S, 'FAQ 12', { x: 120, y: 96 });
        d.q = S.text(c.q, { cls: 'serif', size: QS, x: 120, y: QY, color: C.white, ls: 0.04 });
        d.cols = COLS.map((o, i) => {
          const x = 120 + i * 570, e = {};
          e.box = K.glass(S, { x, y: 286, w: 540, h: 640 });
          e.h = S.text(o.h, { cls: 'serif', size: 36, x: x + 40, y: 322, color: C.gold2, ls: 0.08 });
          e.r = K.rule(S, { x: x + 40, y: 386, w: 120 });
          e.b = S.text(o.b, { cls: 'serif', size: i ? 32 : 24, x: x + 40, y: 416, color: C.cream, lh: 1.6, ls: 0.04 });
          if (o.g) e.g = S.text(o.g, { cls: 'sans', size: 19, x: x + 40, y: 500, color: 'rgba(243,234,216,.55)', lh: 1.6, ls: 0.04 });
          e.q = S.text(o.q, { cls: 'sans', size: 21, x: x + 40, y: i ? 548 : o.g ? 590 : 512, color: DIM, lh: 1.7, ls: 0.05 });
          e.k = S.text('{' + o.k.replace('\n', '}\n{') + '}', { cls: 'serif', size: 28, x: x + 40, y: 790, color: C.cream, lh: 1.5, ls: 0.05 });
          return e;
        });
        d.src = K.src(S, c.src);
      },
      steps: [0, 1, 2].map((i) => (S) => {
        const d = S.data, e = d.cols[i], t = i ? 0.2 : 1.6;
        if (!i) {
          K.reveal(d.ph, { delay: 0.1, dur: 3.0 });
          K.drift(S, d.ph, { zoom: 1.06, px: 0.01, dur: 26 });
          TX.in(d.eye, 'type', { delay: 0.3 });
          TX.in(d.q, 'rise', { delay: 0.5, stagger: 0.04 });
          K.show(d.src, { delay: 2.8, dy: 6 });
        } else d.cols.slice(0, i).forEach((p) => [p.b, p.g, p.q].forEach((el) => el && TX.dim(el, 0.7, { dur: 0.8 })));
        const lag = e.g ? 0.5 : 0;
        K.show(e.box, { delay: t, dy: 24, dur: 1.0 });
        TX.in(e.h, 'rise', { delay: t + 0.35, stagger: 0.05 });
        K.grow(e.r, { delay: t + 0.6, dur: 0.9 });
        TX.in(e.b, 'rise', { delay: t + 0.8, stagger: 0.03 });
        if (e.g) TX.in(e.g, 'lines', { delay: t + 1.4, stagger: 0.25, dy: 8 });
        TX.in(e.q, 'lines', { delay: t + 1.5 + lag, stagger: 0.25, dy: 10 });
        TX.in(e.k, 'rise', { delay: t + 2.4 + lag, stagger: 0.04 });
        TX.glint(e.k, { delay: t + 3.2 + lag, dur: 1.5 });
      }),
    }),
  });
})();
