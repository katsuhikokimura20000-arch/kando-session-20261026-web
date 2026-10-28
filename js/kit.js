(function () {
  'use strict';
  const KS = window.KS, U = KS.U, T = KS.T, TX = KS.Text, C = KS.C;
  const K = (KS.kit = {});
  const NS = 'http://www.w3.org/2000/svg';

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const omit = (o, keys) => {
    const r = {};
    for (const k in o) if (keys.indexOf(k) < 0) r[k] = o[k];
    return r;
  };
  K.esc = esc;
  K.omit = omit;
  K.gl = () => !!(KS.G && KS.G.ok);
  K.lines = (text) => String(text).split('\n').length;

  const tx = (S, text, base, o) => S.text(text, Object.assign({}, base, o));
  K.h = (S, text, o) => tx(S, text, { cls: 'serif', size: 64, x: 120, y: 132, color: C.cream, lh: 1.38, ls: 0.03 }, o);
  K.sub = (S, text, o) => tx(S, text, { cls: 'serif', size: 46, x: 120, y: 132, color: C.cream, lh: 1.5, ls: 0.03 }, o);
  K.body = (S, text, o) => tx(S, text, { cls: 'sans', size: 32, x: 120, y: 300, color: 'rgba(243,234,216,.86)', lh: 1.7, ls: 0.03 }, o);
  K.say = (S, text, o) => tx(S, text, { cls: 'serif', size: 56, x: 960, y: 540, anchor: 'cc', color: C.cream, lh: 1.6, ls: 0.04 }, o);
  K.cap = (S, text, o) => tx(S, text, { cls: 'sans', size: 21, color: 'rgba(140,147,166,.95)', lh: 1.5, ls: 0.04 }, o);
  K.label = (S, text, o) => tx(S, text, { cls: 'sans', size: 24, color: C.cream, lh: 1.4, ls: 0.04 }, o);
  K.eyebrow = (S, text, o) => tx(S, text, { cls: 'k-eyebrow' }, o);
  K.note = (S, text, o) => tx(S, text, { cls: 'sans k-note', x: 120, y: 1000, anchor: 'bl', lh: 1.5 }, o);
  K.src = (S, text, o) => tx(S, text, { cls: 'sans k-src', x: 120, y: 1016, anchor: 'bl', lh: 1.5 }, o);
  K.fig = (S, text, o) => tx(S, text, { cls: 'sans k-figlabel', lh: 1.35 }, o);

  const ANCH = { tl: [0, 0], tc: [-50, 0], tr: [-100, 0], cl: [0, -50], cc: [-50, -50], cr: [-100, -50], bl: [0, -100], bc: [-50, -100], br: [-100, -100] };

  K.box = (S, o = {}) => {
    const wrap = document.createElement('div');
    wrap.className = 'txw';
    const a = ANCH[o.anchor || 'tl'] || ANCH.tl, ws = wrap.style;
    ws.left = (o.x || 0) + 'px';
    ws.top = (o.y || 0) + 'px';
    if (a[0] || a[1]) ws.transform = 'translate(' + a[0] + '%,' + a[1] + '%)';
    if (o.w) ws.width = o.w + 'px';
    const el = document.createElement(o.tag || 'div');
    if (o.cls) el.className = o.cls;
    el.style.position = 'relative';
    if (o.html != null) el.innerHTML = o.html;
    if (o.style) Object.assign(el.style, o.style);
    wrap.appendChild(el);
    (o.layer || S.el).appendChild(wrap);
    el._wrap = wrap;
    if (!o.show) T.setEl(el, { o: 0 });
    return el;
  };
  K.chip = (S, text, o = {}) => K.box(S, Object.assign({ cls: 'k-chip' + (o.cyan ? ' cyan' : ''), html: esc(text) }, omit(o, ['cyan'])));
  K.glass = (S, o = {}) => S.div(Object.assign({ cls: 'k-glass' + (o.cyan ? ' cyan' : '') }, omit(o, ['cyan'])));

  K.bubble = (S, text, o = {}) => {
    const who = o.who || 'me';
    const tag = o.tag || (who === 'ai' ? 'AI' : '私');
    const el = K.box(S, Object.assign({ cls: 'k-bubble ' + who }, omit(o, ['who', 'tag'])));
    el.innerHTML = '<span class="who">' + esc(tag) + '</span>' + esc(text);
    if (o.w) el.style.width = o.w + 'px';
    if (o.size) el.style.fontSize = o.size + 'px';
    return el;
  };

  K.show = (el, o = {}) => {
    if (!el) return 0;
    const from = { o: 0, y: o.dy != null ? o.dy : 18, b: o.blur != null ? o.blur : 8 }, to = { o: o.o != null ? o.o : 1, y: 0, b: 0 };
    if (o.s0 != null) (from.s = o.s0), (to.s = 1);
    if (o.x0 != null) (from.x = o.x0), (to.x = 0);
    T.setEl(el, from);
    const dur = o.dur || 1.1, delay = o.delay || 0;
    T.el(el, to, { dur, delay, ease: o.ease || 'cine' });
    return delay + dur;
  };
  K.pop = (el, o = {}) => K.show(el, Object.assign({ s0: 0.94, dy: 12, blur: 6, dur: 0.9 }, o));
  K.hide = (el, o = {}) => {
    if (!el) return 0;
    const dur = o.dur || 0.7, delay = o.delay || 0, to = { o: 0, b: o.blur != null ? o.blur : 6 };
    if (o.dy) to.y = o.dy;
    T.el(el, to, { dur, delay, ease: o.ease || 'inOutQuad' });
    return delay + dur;
  };
  K.fade = (el, to, o = {}) => {
    if (!el) return 0;
    const dur = o.dur || 0.9, delay = o.delay || 0;
    T.el(el, { o: to }, { dur, delay, ease: o.ease || 'inOutQuad' });
    return delay + dur;
  };

  K.each = (list, gap, fn, d0 = 0) => list.forEach((el, i) => fn(el, d0 + i * gap, i));

  K.rule = (S, o = {}) =>
    S.div({ cls: 'k-rule' + (o.cls ? ' ' + o.cls : ''), x: o.x != null ? o.x : 120, y: o.y || 0, w: o.w || 600, h: 1, layer: o.layer, anchor: o.anchor, style: o.style });
  K.vrule = (S, o = {}) => S.div({ cls: 'k-vrule', x: o.x || 0, y: o.y || 0, w: 2, h: o.h || 200, layer: o.layer, style: o.style });

  K.grow = (el, o = {}) => {
    if (!el) return 0;
    const ax = o.axis === 'y' || el.className.indexOf('k-vrule') >= 0 ? 'sy' : 'sx';
    T.setEl(el, { o: o.o != null ? o.o : 1, [ax]: 0 });
    const dur = o.dur || 1.4, delay = o.delay || 0;
    T.el(el, { [ax]: 1 }, { dur, delay, ease: o.ease || 'inOutCubic' });
    return delay + dur;
  };

  K.stat = (S, o = {}) => {
    const el = K.box(S, { cls: 'k-num', x: o.x, y: o.y, anchor: o.anchor, layer: o.layer, style: Object.assign({ fontSize: (o.size || 120) + 'px' }, o.color ? { color: o.color } : null, o.style) });
    el.innerHTML = (o.pre ? '<span class="u pre">' + esc(o.pre) + '</span>' : '') + '<span class="v"></span>' + (o.unit ? '<span class="u">' + esc(o.unit) + '</span>' : '');
    const v = el.querySelector('.v');
    const digits = o.digits || 0, fmt = o.fmt || ((n) => U.fmt(n, digits));
    v.textContent = fmt(o.value);
    const d = { el, v };
    d.label = o.label ? K.cap(S, o.label, { x: o.lx != null ? o.lx : o.x, y: o.ly != null ? o.ly : (o.y || 0) + (o.size || 120) * 0.72, anchor: o.lanchor || 'tl', size: o.lsize || 22, layer: o.layer }) : null;
    d.in = (p = {}) => {
      const delay = p.delay || 0;
      K.show(el, { delay, dy: 14, blur: 10, dur: 0.9 });
      const end = TX.count(v, o.value, { from: p.from != null ? p.from : o.from || 0, dur: p.dur || o.dur || 2.2, delay, digits, fmt, ease: p.ease || o.ease });
      if (d.label) K.show(d.label, { delay: delay + 0.4 });
      return end;
    };
    return d;
  };

  K.ptext = (text, o = {}) =>
    Object.assign(
      { type: 'text', text, font: (o.weight || 600) + ' ' + (o.size || 200) + 'px "' + (o.family || 'Noto Serif JP') + '"', lh: 1.3, color: C.gold2, color2: C.amber, grad: 'y', sort: 'read' },
      omit(o, ['weight', 'size', 'family'])
    );

  K.sw = (S, recipe, o = {}) => {
    const z = o.z || 0, p = S.at(o.x != null ? o.x : 960, o.y != null ? o.y : 540, z);
    return S.swarm(recipe, Object.assign({}, o, { x: p[0], y: p[1], z, s: (o.s != null ? o.s : 1) * S.kz(z) }));
  };
  K.swSet = (S, recipe, o = {}) => {
    const z = o.z || 0, p = S.at(o.x != null ? o.x : 960, o.y != null ? o.y : 540, z);
    return S.swarmSet(recipe, Object.assign({}, o, { x: p[0], y: p[1], z, s: (o.s != null ? o.s : 1) * S.kz(z) }));
  };

  K.ps = (S, o = {}) => {
    const ps = S.particles(o);
    const look = ['wobF', 'flow', 'flowF', 'flowS', 'twk', 'reveal', 'revOrd', 'coc', 'near', 'focus', 'dz0', 'dz1'];
    look.forEach((k) => {
      if (o[k] != null) ps[k] = o[k];
    });
    return ps;
  };

  K.photo = (S, img, o = {}) => {
    const z = o.z || 0, k = S.kz(z), p = S.at(o.x != null ? o.x : 960, o.y != null ? o.y : 540, z);
    const pl = Object.assign({ rv: 0, rt: 0, rs: 0.14, rn: 0.35, rw: 0.55 }, o, { img, x: p[0], y: p[1], z, w: (o.w || 1920) * k, h: o.h ? o.h * k : 0 });
    if (o.round) pl.round = o.round * k;
    if (o.fe) pl.fe = o.fe * k;
    return S.plate(pl);
  };

  K.reveal = (p, o = {}) => {
    if (!p) return 0;
    const dur = o.dur || 2.4, delay = o.delay || 0;
    if (o.settle) {
      T.set(p, { zoom: (p.zoom || 1) * o.settle });
      T.to(p, { zoom: p.zoom / o.settle }, { dur: dur * 1.6, delay, ease: 'outCubic' });
    }
    T.to(p, { rv: 1 }, { dur, delay, ease: o.ease || 'inOutCubic' });
    return delay + dur;
  };
  K.unreveal = (p, o = {}) => {
    if (!p) return 0;
    const dur = o.dur || 1.4, delay = o.delay || 0;
    T.to(p, { rv: 0 }, { dur, delay, ease: o.ease || 'inOutCubic' });
    return delay + dur;
  };

  K.drift = (S, p, o = {}) => {
    if (!p || p.inert) return null;
    return S.loop(p, { zoom: (p.zoom || 1) * (o.zoom || 1.06), px: o.px != null ? o.px : 0.012, py: o.py || 0 }, { dur: o.dur || 18, ease: 'inOutSine' });
  };

  K.cover = (S, img, o = {}) => {
    const p = K.photo(S, img, Object.assign({ w: 440, shadow: 0.9, round: 4, rs: 0.2, rn: 0.5, rw: 1.1, rc: [1.7, 1.05, 0.5], sh: -1.6, shw: 0.14, shc: [1, 0.9, 0.72] }, o));
    return p;
  };
  K.coverIn = (p, o = {}) => {
    if (!p) return 0;
    const delay = o.delay || 0, dur = o.dur || 2.2;
    K.reveal(p, { delay, dur, ease: 'inOutSine' });
    T.to(p, { sh: 1.6 }, { dur: 1.7, delay: delay + dur * 0.7, ease: 'inOutSine' });
    return delay + dur * 0.7 + 1.7;
  };

  K.glow = (S, o = {}) => {
    const z = o.z || 0, p = S.at(o.x != null ? o.x : 960, o.y != null ? o.y : 540, z);
    return S.sprite(Object.assign({ type: 'glow', size: 120, i: 1, o: 0 }, o, { x: p[0], y: p[1], z }));
  };

  K.spark = (sp, o = {}) => {
    if (!sp || sp.inert) return 0;
    const delay = o.delay || 0, a = o.rise || 0.25, b = o.fall || 1.2;
    T.set(sp, { o: 0 });
    T.to(sp, { o: o.o || 1 }, { dur: a, delay, ease: 'outCubic' });
    T.to(sp, { o: 0 }, { dur: b, delay: delay + a, ease: 'inOutSine', overwrite: false });
    return delay + a + b;
  };

  K.threads = (S, o = {}) => {
    const a = S.at(o.from[0], o.from[1], o.from[2] || 0), b = S.at(o.to[0], o.to[1], o.to[2] || 0);
    const curves = KS.Ribbons ? KS.Ribbons.fan(a, b, o.n || 9, o) : [];
    return S.ribbon(Object.assign({ curves, prog: 0, glow: 0.6 }, omit(o, ['from', 'to', 'n', 'bow', 'jit', 'spreadA', 'spreadB', 'w', 'cols', 'col', 'mul', 'delays', 'taper', 'seed'])));
  };
  K.weave = (r, o = {}) => {
    if (!r || r.inert) return 0;
    const dur = o.dur || 2.8, delay = o.delay || 0;
    T.to(r, { prog: 1 }, { dur, delay, ease: o.ease || 'inOutCubic' });
    return delay + dur;
  };

  K.svg = (S, o = {}) => S.svg(Object.assign({ show: true }, o));
  K.node = (parent, tag, attrs = {}) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    parent.appendChild(e);
    return e;
  };
  K.path = (parent, d, cls = '', attrs = {}) => K.node(parent, 'path', Object.assign({ d, class: ('k-ln ' + cls).trim() }, attrs));
  K.line = (parent, x1, y1, x2, y2, cls = '', attrs = {}) => K.path(parent, 'M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2, cls, attrs);
  K.circle = (parent, cx, cy, r, cls = '', attrs = {}) => K.node(parent, 'circle', Object.assign({ cx, cy, r, class: ('k-ln ' + cls).trim() }, attrs));
  K.stext = (parent, text, x, y, o = {}) => {
    const t = K.node(parent, 'text', { x, y, class: o.cls || '', 'text-anchor': o.anchor || 'start', 'dominant-baseline': o.base || 'alphabetic' });
    t.textContent = text;
    const s = t.style;
    if (o.size) s.fontSize = o.size + 'px';
    if (o.fill) s.fill = o.fill;
    if (o.ls != null) s.letterSpacing = o.ls + 'em';
    if (o.weight) s.fontWeight = o.weight;
    if (!o.show) T.setEl(t, { o: 0 });
    return t;
  };

  K.draw = (el, o = {}) => {
    if (!el) return 0;
    let L = 1000;
    try {
      L = el.getTotalLength() || 1000;
    } catch (e) {

    }
    const s = el.style, st = { p: 0 }, rev = !!o.reverse;
    s.strokeDasharray = L + ' ' + (L + 4);
    const put = () => {
      s.strokeDashoffset = String((rev ? -L : L) * (1 - st.p));
      s.opacity = st.p > 0.002 ? '' : '0';
    };
    put();
    const dur = o.dur || 1.6, delay = o.delay || 0;
    T.to(st, { p: 1 }, {
      dur, delay, ease: o.ease || 'inOutCubic', onUpdate: put,
      onComplete: () => {
        s.strokeDasharray = '';
        s.strokeDashoffset = '';
        s.opacity = '';
      },
    });
    return delay + dur;
  };

  K.undrawn = (el) => {
    if (el) el.style.opacity = '0';
    return el;
  };

  K.video = (S, file, o = {}) => {
    const fr = S.div({ cls: 'k-frame', x: o.x, y: o.y, w: o.w || 640, h: o.h || 360, anchor: o.anchor || 'tl', layer: o.layer, style: o.style });
    const v = S.video(file, { layer: fr, show: true, start: o.start, poster: o.poster, fit: o.fit, loop: o.loop });
    if (o.cap) {
      const c = document.createElement('div');
      c.className = 'cap';
      c.textContent = o.cap;
      fr.appendChild(c);
    }
    fr._v = v;
    return fr;
  };
  K.play = (S, fr, o = {}) => T.call(() => S.play(fr && fr._v, o.from), o.delay || 0);

  const urlHtml = (u) => {
    const s = u.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const i = s.indexOf('/');
    return i < 0 ? '<b>' + esc(s) + '</b>' : '<b>' + esc(s.slice(0, i)) + '</b>' + esc(s.slice(i));
  };
  K.link = (S, o = {}) => {
    const size = o.size || 220;
    const el = K.box(S, { x: o.x, y: o.y, anchor: o.anchor || 'tc', layer: o.layer, style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } });
    let h = '';
    if (o.title) h += '<div class="serif" style="font-size:' + (o.tsize || 28) + 'px;letter-spacing:.06em;color:#f3ead8;margin-bottom:20px;white-space:nowrap">' + esc(o.title) + '</div>';
    if (o.qr !== false) h += '<div class="k-qr" style="position:relative;width:' + size + 'px;height:' + size + 'px">' + KS.qr.svg(o.url, { quiet: 3 }) + '</div>';
    h += '<div class="k-url" style="margin-top:18px;font-size:' + (o.usize || 20) + 'px">' + urlHtml(o.label || o.url) + '</div>';
    el.innerHTML = h;
    return el;
  };

  K.card = (S, o = {}) => {
    const no = String(o.no).padStart(2, '0'), x = o.x || 900, n = K.lines(o.label), size = o.size || 68, lh = 1.42;
    const d = { no };
    d.eye = K.eyebrow(S, 'PART ' + no, { x, y: o.y || 360 });
    const ly = (o.y || 360) + 52;
    d.label = S.text(o.label, { cls: 'serif', size, x, y: ly, color: C.white, lh, ls: 0.05 });
    const ry = ly + n * size * lh + 30;
    d.rule = K.rule(S, { x, y: ry, w: o.rw || 820 });
    if (o.sub) d.sub = S.text(o.sub, { cls: 'serif', size: o.subSize || 34, x, y: ry + 34, color: 'rgba(243,234,216,.66)', lh: 1.62, ls: 0.04 });
    d.num = K.gl() ? null : S.text(no, { cls: 'k-cardno', x: 560, y: 540, anchor: 'cc' });
    d.spark = K.glow(S, { x, y: ry, z: 20, size: 70, type: 'flare', spikes: 4, col: C.gold2, mul: 1.6 });
    d.in = (p = {}) => {
      const t0 = p.delay || 0;
      if (K.gl()) {
        K.sw(S, K.ptext(no, { size: 560, weight: 500, depth: 40, sizeVar: 0.5, sparkle: 0.06, color: C.gold2, color2: C.copper }), {
          x: o.nx || 540, y: o.ny || 540, z: -260, dur: 2.6, delay: t0, amt: 0.45, swirl: 0.5, spread: 160, ease: 'expo',
        });
        S.swarmLook({ i: 1.15, size: 2.3, wob: 2 }, { dur: 2, delay: t0 });
      } else K.show(d.num, { delay: t0 + 0.2, dur: 1.6, blur: 14 });
      TX.in(d.eye, 'type', { delay: t0 + 0.3 });
      TX.in(d.label, 'rise', { delay: t0 + 0.55, stagger: 0.045, dur: 1.3 });
      K.grow(d.rule, { delay: t0 + 1.1, dur: 1.6 });
      if (d.spark && !d.spark.inert) {
        const a = S.at(x, ry, 20), b = S.at(x + (o.rw || 820), ry, 20);
        T.set(d.spark, { x: a[0] });
        T.to(d.spark, { x: b[0] }, { dur: 1.6, delay: t0 + 1.1, ease: 'inOutCubic' });
        T.to(d.spark, { o: 1 }, { dur: 0.3, delay: t0 + 1.1, ease: 'outCubic' });
        T.to(d.spark, { o: 0 }, { dur: 0.7, delay: t0 + 2.4, ease: 'inOutSine', overwrite: false });
      }
      if (d.sub) TX.in(d.sub, 'lines', { delay: t0 + 1.7, stagger: 0.3, dy: 14 });
      TX.glint(d.label, { delay: t0 + 2.2, dur: 1.6 });
      return t0 + 3;
    };
    return d;
  };

  K.quote = (S, text, o = {}) => {
    const x = o.x != null ? o.x : 300, y = o.y != null ? o.y : 340, size = o.size || 54, lh = o.lh || 1.62, n = K.lines(text);
    const h = n * size * lh;
    const d = {};
    d.bar = K.vrule(S, { x: x - 54, y: y + size * 0.25, h: h - size * 0.5 });
    d.text = S.text(text, { cls: 'serif', size, x, y, lh, color: o.color || C.white, ls: o.ls != null ? o.ls : 0.05 });
    d.src = o.src ? S.text(o.src, { cls: 'sans k-src', x, y: y + h + 34, size: o.srcSize || 21 }) : null;
    d.in = (p = {}) => {
      const t0 = p.delay || 0;
      K.grow(d.bar, { delay: t0, dur: 1.2 + 0.25 * n });
      const end = TX.in(d.text, 'lines', { delay: t0 + 0.25, stagger: o.stagger || 0.55, cstag: 0.028, dy: 24, blur: 12, dur: 1.6 });
      TX.glint(d.text, { delay: t0 + 0.9 + n * (o.stagger || 0.55), dur: 1.8, i: 0.85 });
      if (d.src) K.show(d.src, { delay: t0 + 1.2 + n * (o.stagger || 0.55), dy: 8 });
      return end;
    };
    return d;
  };

  K.head = (S, text, o = {}) => {
    const d = {};
    const x = o.x != null ? o.x : 120, y = o.y != null ? o.y : 112;
    d.eye = o.eye ? K.eyebrow(S, o.eye, { x, y }) : null;
    d.h = K.h(S, text, Object.assign({ x, y: y + (o.eye ? 44 : 0) }, omit(o, ['x', 'y', 'eye'])));
    d.in = (p = {}) => {
      const t0 = p.delay || 0;
      if (d.eye) TX.in(d.eye, 'type', { delay: t0 });
      return TX.in(d.h, p.preset || 'rise', { delay: t0 + (d.eye ? 0.25 : 0), stagger: p.stagger || 0.035 });
    };
    return d;
  };

  K.lineset = (S, lines, o = {}) => {
    const size = o.size || 56, lh = o.lh || 1.7, y0 = o.y != null ? o.y : 540 - ((lines.length - 1) * size * lh) / 2;
    return lines.map((t, i) => S.text(t, Object.assign({ cls: 'serif', size, x: o.x || 960, y: y0 + i * size * lh, anchor: o.anchor || 'cc', color: C.cream, lh: 1.3, ls: 0.04 }, o.each ? o.each(i) : null)));
  };
})();
