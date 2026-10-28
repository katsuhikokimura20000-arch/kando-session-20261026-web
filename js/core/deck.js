(function () {
  'use strict';
  const KS = window.KS, U = KS.U, T = KS.T, G = KS.G, TX = KS.Text, WD = KS.world, E = KS.E;
  const D = KS.DIST;

  KS.SECTIONS = [
    { id: 0, label: 'はじめに' },
    { id: 1, label: 'この1年、手元で起きたこと' },
    { id: 2, label: '「もう人と仕事をする時代ではない」と感じる理由' },
    { id: 3, label: 'この先に延ばしてみると' },
    { id: 4, label: '前著『神のブートローダー』' },
    { id: 5, label: '新刊『人類という通過点』' },
    { id: 6, label: 'むすび' },
    { id: 'qa', label: 'FAQ（よくある質問）' },
  ];

  const DK = (KS.deck = {
    list: [], byId: {}, cur: -1, beat: 0, S: null, sections: KS.SECTIONS, flightEnd: 0, previewing: null,
    black: false, total: 0,
  });
  const exits = new Set();
  let seq = 0, jumping = false, qaReturn = null, worldEl = null, veilEl = null, previewBusy = false;

  KS.scene = (def) => {
    const L = DK.list, i = L.length;
    if (def.sec === undefined) def.sec = i ? L[i - 1].sec : 0;
    if (def.anchor) def.pin = def.anchor;
    def.index = i;
    def.steps = def.steps || [];
    def.images = def.images || [];
    def.world = def.world || {};
    L.push(def);
    DK.byId[def.id] = def;
    return def;
  };
  const beatsOf = (d) => Math.max(1, d.steps.length);
  const isQA = (i) => {
    const d = DK.list[i];
    return !!d && d.qa != null;
  };

  function finalize() {
    const L = DK.list, rank = (d) => (d.qa == null ? -1 : d.qa);
    L.sort((a, b) => rank(a) - rank(b));
    let n = 0, runX = 0, runZ = 0, runSec;
    L.forEach((d, i) => {
      d.index = i;
      d.no = d.qa == null && d.num !== false ? ++n : null;
      if (d.pin) {
        runX = d.pin[0];
        runZ = d.pin[2] || 0;
        d.anchor = [d.pin[0], d.pin[1] || 0, d.pin[2] || 0];
      } else {
        if (i) {
          runX += d.gap != null ? d.gap : 2400;
          if (d.sec !== runSec) runZ -= 3000;
        }
        d.anchor = [runX, Math.round(Math.sin(i * 0.9) * 140), runZ];
      }
      runSec = d.sec;
    });
    DK.total = n;
  }
  DK.byNo = (n) => DK.list.find((d) => d.no === n) || null;
  const qaIndex = () => {
    const d = DK.list.find((x) => x.qa === 0);
    return d ? d.index : null;
  };
  const lastMain = () => {
    let j = null;
    DK.list.forEach((d, i) => d.qa == null && (j = i));
    return j;
  };
  const qaFirst = (n) => DK.list.find((d) => d.qa === n) || null;
  const sameEntry = (i, j) => !!DK.list[j] && DK.list[j].qa === DK.list[i].qa;

  function nextIndex(i) {
    const d = DK.list[i];
    if (!d) return null;
    if (d.qa === 0) {
      const q = qaFirst(1);
      return q ? q.index : null;
    }
    if (d.qa > 0) return sameEntry(i, i + 1) ? i + 1 : qaIndex();
    return DK.list[i + 1] && !isQA(i + 1) ? i + 1 : null;
  }
  function prevIndex(i) {
    const d = DK.list[i];
    if (!d) return null;
    if (d.qa > 0) return sameEntry(i, i - 1) ? i - 1 : qaIndex();
    if (d.qa === 0) return null;
    return i > 0 ? i - 1 : null;
  }

  const QA_KEYS = { 0: 10, '-': 11, '^': 12, '=': 12 };
  const qaKey = (S, e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return false;
    const n = /^[1-9]$/.test(e.key) ? +e.key : QA_KEYS[e.key], d = n ? qaFirst(n) : null;
    if (!d) return false;
    DK.goto(d.index);
    return true;
  };
  Object.assign(DK, { beatsOf, isQA, nextIndex, prevIndex, qaIndex, qaFirst, qaKey, lastMain });

  const copy = (o) => {
    const r = {};
    for (const k in o) r[k] = Array.isArray(o[k]) ? o[k].slice() : o[k];
    return r;
  };
  const isNumArr = (v) => Array.isArray(v) && v.length > 0 && v.every((x) => typeof x === 'number');

  function numeric(o, ...ex) {
    const r = {};
    if (!o) return r;
    for (const k in o) {
      if (ex.indexOf(k) >= 0) continue;
      const v = o[k];
      if (typeof v === 'number') r[k] = v;
      else if (isNumArr(v)) r[k] = v.slice();
    }
    return r;
  }
  function assignNum(dst, src, ...ex) {
    const n = numeric(src, ...ex);
    for (const k in n) dst[k] = n[k];
  }

  function skyOf(s, partial) {
    if (s == null) return numeric(KS.skyPreset('deep'), 'seed');
    if (typeof s === 'string') return numeric(KS.skyPreset(s), 'seed');
    if (partial && !s.preset) return numeric(s, 'seed');
    return numeric(KS.skyPreset(s.preset || 'deep', s), 'seed');
  }
  function baseWorld(def) {
    const w = def.world || {}, c = w.cam || {}, a = def.anchor;
    return {
      cam: { x: a[0] + (c.x || 0), y: a[1] + (c.y || 0), z: a[2] + (c.z || 0), roll: c.roll || 0, dz: 0, bank: 0 },
      sky: skyOf(w.sky),
      post: Object.assign(copy(KS.POST), w.post || {}),
      dust: Object.assign(copy(KS.DUST), w.dust || {}),
      amb: Object.assign({ a: 1, x: 12, y: 6 }, w.amb || {}),
    };
  }
  function setWorld(w) {
    T.kill('world');
    const c = WD.cam;
    c.x = w.cam.x;
    c.y = w.cam.y;
    c.z = w.cam.z;
    c.roll = w.cam.roll || 0;
    c.dz = w.cam.dz || 0;
    c.bank = w.cam.bank || 0;
    assignNum(WD.sky, w.sky, 'seed');
    assignNum(WD.post, w.post);
    assignNum(WD.dust, w.dust);
    assignNum(WD.amb, w.amb);
  }
  const snapWorld = () => ({ cam: copy(WD.cam), sky: copy(WD.sky), post: copy(WD.post), dust: copy(WD.dust), amb: copy(WD.amb) });

  function fly(to, o = {}) {
    T.kill('world');
    const c = WD.cam;
    const from = { x: c.x, y: c.y, z: c.z, roll: c.roll || 0, dz: c.dz || 0, bank: c.bank || 0 };
    const tc = to.cam, dx = tc.x - from.x, dy = tc.y - from.y, dzz = tc.z - from.z, dr = (tc.roll || 0) - from.roll;
    const lateral = Math.hypot(dx, dy), dist = Math.hypot(lateral, dzz);
    const dur = o.dur != null ? o.dur
      : dist < 50 ? 0.9 : Math.abs(dzz) > 1500 ? 2.4 : 1.7 + 0.25 * Math.log2(Math.max(1, lateral / 2400));
    const arc = o.arc != null ? o.arc : lateral < 200 ? 0 : Math.min(900, lateral * 0.25);
    const bank = o.bank != null ? o.bank : -U.clamp(dx / 2400, -1, 1) * 1.2;
    const delay = o.delay || 0, prog = { p: 0 };
    T.to(prog, { p: 1 }, {
      dur, delay, ease: 'linear', group: 'world',
      onUpdate() {
        const p = prog.p, e = E.film(p), ez = E.inOutCubic(p), s = Math.sin(Math.PI * e);
        c.x = from.x + dx * e;
        c.y = from.y + dy * e;
        c.z = from.z + dzz * ez;
        c.roll = from.roll + dr * e;
        c.dz = from.dz * (1 - e) + arc * s;
        c.bank = from.bank * (1 - e) + bank * s;
      },
      onComplete() {
        c.dz = 0;
        c.bank = 0;
      },
    });
    const look = { dur, delay, ease: 'inOutSine', group: 'world' };
    T.to(WD.sky, numeric(to.sky, 'seed'), look);
    T.to(WD.post, numeric(to.post), look);
    T.to(WD.dust, numeric(to.dust), look);
    T.to(WD.amb, numeric(to.amb), look);
    DK.flightEnd = T.now() + delay + dur;
    return dur;
  }

  function land() {
    if (T.busy('world')) {
      T.finishAll('world');
      WD.cut();
    }
    DK.flightEnd = Math.min(DK.flightEnd, T.now());
  }

  const SW_LOOK = {
    i: 1, size: 2.2, sharp: 0, wob: 3, wobF: 1, flow: 0, flowF: 0.0025, flowS: 0.06, twk: 0, reveal: 1, revOrd: 0,
    coc: 0, near: 30, focus: D,
  };
  const SW_KEYS = Object.keys(SW_LOOK).concat('o');
  const SW_M = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1, px: 0, py: 0, pz: 0 };
  const wrapA = (v) => ((((v + 180) % 360) + 360) % 360) - 180;

  const SCATTER = { type: 'scatter', box: [3400, 2000, 2400], gauss: true, color: '#f2b766', alpha: 0, seed: 9, key: 'deck:scatter' };

  function resetSwarm(def, instant) {
    const sw = WD.swarm;
    if (!sw) return;
    T.kill('swarm');
    T.killOf(sw);
    T.killOf(sw.m);
    T.killOf(sw.spin);
    sw.spin.x = sw.spin.y = sw.spin.z = 0;
    const m = sw.m;
    m.rx = wrapA(m.rx);
    m.ry = wrapA(m.ry);
    m.rz = wrapA(m.rz);
    const look = Object.assign({}, SW_LOOK, { o: def.swarm ? (typeof def.swarm === 'number' ? def.swarm : 1) : 0 });
    if (instant) {
      Object.assign(sw, look);
      Object.assign(m, SW_M);
    } else {
      T.to(sw, look, { dur: 0.9, ease: 'inOutSine', group: 'swarm' });

      if (look.o) T.to(m, SW_M, { dur: 1.2, ease: 'inOutSine', group: 'swarm' });
      else T.to(m, SW_M, { dur: 0.01, delay: 0.9, group: 'swarm' });
    }
  }
  function snapSwarm() {
    const sw = WD.swarm;
    if (!sw) return null;
    const look = {};
    for (const k of SW_KEYS) look[k] = sw[k];
    const m = Object.assign({}, sw.m);
    m.rx = wrapA(m.rx);
    m.ry = wrapA(m.ry);
    m.rz = wrapA(m.rz);
    return { look, m };
  }
  function restoreSwarm(s) {
    const sw = WD.swarm;
    T.killOf(sw);
    T.killOf(sw.m);
    Object.assign(sw, s.look);
    Object.assign(sw.m, s.m);
  }
  function tweenSwarm(s, dur) {
    const sw = WD.swarm, m = Object.assign({}, s.m);
    for (const k of ['rx', 'ry', 'rz']) m[k] = sw.m[k] + wrapA(m[k] - sw.m[k]);
    T.to(sw, s.look, { dur, ease: 'inOutSine', group: 'swarm' });
    T.to(sw.m, m, { dur, ease: 'inOutSine', group: 'swarm' });
  }

  function shiftPl(a, mo) {
    const m = Object.assign({}, mo);
    m.x = (mo.x || 0) + a[0];
    m.y = (mo.y || 0) + a[1];
    m.z = (mo.z || 0) + a[2];
    if (mo.swc) m.swc = [mo.swc[0] + a[0], mo.swc[1] + a[1], (mo.swc[2] || 0) + a[2]];
    if (mo.fromPlace) {
      const f = mo.fromPlace;
      m.fromPlace = Object.assign({}, f, { x: (f.x || 0) + a[0], y: (f.y || 0) + a[1], z: (f.z || 0) + a[2] });
    }
    return m;
  }

  const ANF = { tl: [0, 0], tc: [0.5, 0], tr: [1, 0], cl: [0, 0.5], cc: [0.5, 0.5], cr: [1, 0.5], bl: [0, 1], bc: [0.5, 1], br: [1, 1] };
  function place(el, o) {
    const s = el.style, f = ANF[o.anchor || 'tl'] || ANF.tl, w = o.w || 0, h = o.h || 0;
    s.position = 'absolute';
    s.left = (o.x || 0) - w * f[0] + 'px';
    s.top = (o.y || 0) - h * f[1] + 'px';
    if (o.w != null) s.width = o.w + 'px';
    if (o.h != null) s.height = o.h + 'px';
    if (o.style) Object.assign(s, o.style);
  }
  const NS = 'http://www.w3.org/2000/svg';
  const inert = () => ({
    o: 1, i: 1, prog: 1, tail: 0, size: 1, rv: 1, N: 1, inert: true,
    m: Object.assign({}, SW_M), spin: { x: 0, y: 0, z: 0 }, u: { p: 1 },
    morph() { return null; }, set() {}, dispose() {}, draw() {}, update() {},
  });

  function makeS(def, mode) {
    if (!worldEl) worldEl = document.getElementById('L-world');
    const root = document.createElement('div');
    root.className = 'scene';
    root.dataset.id = def.id;
    worldEl.appendChild(root);
    const a = def.anchor;
    const S = {
      def, sc: def, id: def.id, a, root, layers: [], gl: [], vids: [], imgs: new Set(), data: {}, syncs: [], offs: [],
      mode, instant: mode !== 'normal', t0: KS.clock.t - (mode === 'kf' ? 30 : 0), arrive: 0, promises: [],
      alive: true, kf: !!KS.params.export || mode === 'kf', g: def.id + '#' + ++seq, groups: new Set(),
      swarmUsed: false, swarmLast: null, deferSwarm: false,
    };
    S.groups.add(S.g + ':amb');
    const own = (d) => {
      S.gl.push(d);
      WD.add(d);
      return d;
    };

    S.layer = (zl = 0, cls, o = {}) => {
      const el = document.createElement('div');
      el.className = 'layer' + (cls ? ' ' + cls : '');
      el.style.zIndex = U.clamp(5000 + Math.round(zl / 2), 1, 8999);
      root.appendChild(el);
      const rec = WD.addLayer(el, a, zl);
      if (o.fade === false) rec.fade = false;
      el._rec = rec;
      S.layers.push(rec);
      return el;
    };

    S.flat = (cls) => {
      const el = document.createElement('div');
      el.className = 'layer flat' + (cls ? ' ' + cls : '');
      el.style.zIndex = 9000;
      root.appendChild(el);
      return el;
    };
    S.el = S.layer(0);
    S.text = (text, o = {}) => TX.block(o.layer || S.el, text, o);
    S.div = (o = {}) => {
      const el = document.createElement(o.tag || 'div');
      if (o.cls) el.className = o.cls;
      place(el, o);
      if (o.html != null) el.innerHTML = o.html;
      (o.layer || S.el).appendChild(el);
      if (!o.show) T.setEl(el, { o: 0 });
      return el;
    };
    S.svg = (o = {}) => {
      const el = document.createElementNS(NS, 'svg');
      const w = o.w || 1920, h = o.h || 1080;
      el.setAttribute('viewBox', o.vb || '0 0 ' + w + ' ' + h);
      el.setAttribute('width', w);
      el.setAttribute('height', h);
      if (o.cls) el.setAttribute('class', o.cls);
      place(el, Object.assign({}, o, { w, h }));
      el.style.overflow = 'visible';
      if (o.html) el.innerHTML = o.html;
      (o.layer || S.el).appendChild(el);
      if (!o.show) T.setEl(el, { o: 0 });
      return el;
    };

    S.img = (name, o = {}) => {
      const el = new Image();
      el.decoding = 'async';
      el.src = (KS.media && KS.media[name]) || name;
      el.className = 'img' + (o.cls ? ' ' + o.cls : '');
      el.alt = '';
      place(el, o);
      if (o.fit) el.style.objectFit = o.fit;
      (o.layer || S.el).appendChild(el);
      S.promises.push(el.decode ? el.decode().catch(() => 0) : Promise.resolve());
      if (!o.show) T.setEl(el, { o: 0 });
      return el;
    };

    S.w = (x, y, z = 0) => U.w(x, y, z);
    S.at = (x, y, z = 0) => [((x - 960) * (D - z)) / D, ((540 - y) * (D - z)) / D, z];
    S.pos = (x, y, z = 0) => {
      const p = S.at(x, y, z);
      return { x: p[0], y: p[1], z: p[2] };
    };
    S.kz = (z = 0) => (D - z) / D;

    S.plate = (o) => {
      S.imgs.add(o.img);
      (def._seen = def._seen || new Set()).add(o.img);
      if (!G.ok) return domPlate(S, o);
      const p = KS.Plates.make(Object.assign({}, o, { bx: a[0], by: a[1], bz: a[2] }));
      if (p.tex && p.tex.p) S.promises.push(p.tex.p);
      return own(p);
    };
    S.ribbon = (o) => {
      if (!G.ok) return inert();
      const r = KS.Ribbons.make(o);
      r.m.bx = a[0];
      r.m.by = a[1];
      r.m.bz = a[2];
      return own(r);
    };
    S.sprite = (o) => {
      if (!G.ok) return inert();
      return own(KS.Sprites.make(Object.assign({}, o, { bx: a[0], by: a[1], bz: a[2] })));
    };

    S.particles = (o = {}) => {
      if (!G.ok) return inert();
      const ps = KS.Particles.make(o);
      ps.m.bx = a[0];
      ps.m.by = a[1];
      ps.m.bz = a[2];
      const morph = ps.morph, set = ps.set;
      ps.morph = (r, mo) => {
        S.prep(r, ps.N);
        return morph(r, mo);
      };
      ps.set = (r, pl) => {
        S.prep(r, ps.N);
        return set(r, pl);
      };
      return own(ps);
    };

    S.swarm = (recipe, mo = {}) => {
      const sw = WD.swarm;
      S.swarmUsed = true;
      const m = shiftPl(a, mo);
      S.swarmLast = [recipe, m];
      if (!sw) return null;
      S.prep(recipe, sw.N);
      if (mo.from) S.prep(mo.from, sw.N);
      if (S.deferSwarm) return null;
      if (mo.from === undefined && sw.o < 0.05) {
        m.from = SCATTER;
        m.fromPlace = { x: m.x, y: m.y, z: m.z };
      }
      return sw.morph(recipe, m);
    };
    S.swarmSet = (recipe, pl = {}) => {
      const sw = WD.swarm;
      S.swarmUsed = true;
      const m = shiftPl(a, pl);
      S.swarmLast = [recipe, m];
      if (!sw) return;
      S.prep(recipe, sw.N);
      if (!S.deferSwarm) sw.set(recipe, m);
    };
    S.swarmLook = (props, o = {}) => {
      const sw = WD.swarm;
      if (!sw) return null;
      if (o.dur === 0) return T.set(sw, props);
      return T.to(sw, props, { dur: o.dur != null ? o.dur : 1.2, delay: o.delay || 0, ease: o.ease || 'inOutSine' });
    };

    S.swarmPivot = (x = 0, y = 0, z = 0) => {
      if (WD.swarm) T.set(WD.swarm.m, { px: a[0] + x, py: a[1] + y, pz: a[2] + z });
    };

    S.video = (file, o = {}) => {
      const base = 'assets/video/', stem = file.replace(/\.[^.]+$/, '');
      const poster = base + (o.poster || stem + '.jpg');
      let el;
      if (S.kf) {
        el = new Image();
        el.src = poster;
        S.promises.push(el.decode ? el.decode().catch(() => 0) : Promise.resolve());
      } else {
        el = document.createElement('video');
        el.muted = true;
        el.defaultMuted = true;
        el.loop = o.loop !== false;
        el.playsInline = true;
        el.preload = 'auto';
        el.setAttribute('muted', '');
        el.setAttribute('playsinline', '');
        el.poster = poster;
        el.src = base + file;
        S.vids.push(el);
      }
      el.className = 'vid' + (o.cls ? ' ' + o.cls : '');
      place(el, o);
      el.style.objectFit = o.fit || 'cover';
      (o.layer || S.el).appendChild(el);
      if (!o.show) T.setEl(el, { o: 0 });
      el._start = o.start || 0;
      return el;
    };
    S.play = (v, from) => {
      if (!v || v.tagName !== 'VIDEO' || !S.alive) return;
      try {
        v.currentTime = from != null ? from : v._start || 0;
      } catch (e) {

      }
      const p = v.play();
      if (p && p.catch) p.catch(() => 0);
    };
    S.need = (p) => {
      if (p && p.then) S.promises.push(p);
      return p;
    };
    S.prep = (recipe, N) => {
      const e = KS.Tg.prep(recipe, N);
      if (e && e.p) S.promises.push(e.p);
      return e;
    };

    S.cam = (st, o = {}) => {
      const tgt = {};
      if (st.x != null) tgt.x = a[0] + st.x;
      if (st.y != null) tgt.y = a[1] + st.y;
      if (st.z != null) tgt.z = a[2] + st.z;
      if (st.roll != null) tgt.roll = st.roll;
      const wait = S.instant ? 0 : Math.max(0, DK.flightEnd - T.now());
      return T.to(WD.cam, tgt, { dur: o.dur != null ? o.dur : 2.4, ease: o.ease || 'film', delay: Math.max(o.delay || 0, wait) });
    };

    S.world = (st, o = {}) => {
      const opt = { dur: o.dur != null ? o.dur : 2.4, ease: o.ease || 'inOutSine', delay: o.delay || 0 };
      const tw = [];
      if (st.sky != null) tw.push(T.to(WD.sky, skyOf(st.sky, true), opt));
      if (st.post) tw.push(T.to(WD.post, numeric(st.post), opt));
      if (st.dust) tw.push(T.to(WD.dust, numeric(st.dust), opt));
      if (st.amb) tw.push(T.to(WD.amb, numeric(st.amb), opt));
      if (st.cam) S.cam(st.cam, o);
      return tw;
    };

    S.loop = (target, props, o = {}) =>
      T.to(target, props, Object.assign({ dur: 4, ease: 'inOutSine', repeat: -1, yoyo: true }, o, { group: S.g + ':amb' }));
    S.on = (ev, fn) => {
      KS.on(ev, fn);
      S.offs.push(() => KS.off(ev, fn));
    };
    return S;
  }

  function domPlate(S, o) {
    const z = o.z || 0, k = D / (D - z);
    const layer = S.layer(z);
    const img = new Image();
    img.src = (KS.media && KS.media[o.img]) || '';
    const s = img.style, w = (o.w || 1000) * k;
    s.position = 'absolute';
    s.left = 960 + (o.x || 0) * k + 'px';
    s.top = 540 - (o.y || 0) * k + 'px';
    s.width = w + 'px';
    if (o.h) s.height = o.h * k + 'px';
    s.objectFit = 'cover';
    s.transform = 'translate(-50%,-50%)' + (o.r ? ' rotate(' + -o.r + 'deg)' : '');
    if (o.round) s.borderRadius = o.round * k + 'px';
    layer.appendChild(img);
    S.promises.push(img.decode ? img.decode().catch(() => 0) : Promise.resolve());
    const p = Object.assign({ o: 1, rv: 1 }, o, { inert: true, dispose() {}, draw() {} });
    let last = '';
    S.syncs.push(() => {
      const v = String(Math.round(U.clamp(p.o * Math.min(1, p.rv * 1.5)) * 1000) / 1000);
      if (v !== last) {
        s.opacity = v;
        last = v;
      }
    });
    return p;
  }

  function run(S, group, fn) {
    if (!fn) return;
    const g = T.defGroup;
    T.defGroup = group;
    S.groups.add(group);
    try {
      fn(S);
    } catch (e) {
      console.error('[KS] scene ' + S.id + ' ' + group, e);
    }
    T.defGroup = g;
  }
  const runStep = (S, k) => run(S, S.g + ':' + k, S.def.steps[k]);
  function settle(S) {
    T.finishAll(S.g + ':b');
    T.finishAll(S.g + ':in');
    for (let k = 0; k < DK.beat; k++) T.finishAll(S.g + ':' + k);
  }

  function retire(S, dur = 0.6, delay = 0) {
    if (!S || !S.alive) return;
    S.alive = false;
    for (const g of S.groups) T.kill(g);
    if (S.def.leave) {
      try {
        S.def.leave(S);
      } catch (e) {
        console.error('[KS] leave ' + S.id, e);
      }
    }
    S.vids.forEach((v) => {
      try {
        v.pause();
      } catch (e) {

      }
    });
    if (dur <= 0) return dispose(S);
    const xg = 'x:' + S.g;
    T.el(S.root, { o: 0, b: WD.tier === 'high' ? 6 : 0 }, { dur, delay, ease: 'inQuad', group: xg });
    S.gl.forEach((d) => {
      if (!d.persistent && d.o != null) T.to(d, { o: 0 }, { dur, delay, ease: 'inQuad', group: xg });
    });
    T.call(() => dispose(S), delay + dur + 0.05, xg);
    exits.add(S);
  }
  function dispose(S) {
    if (S.disposed) return;
    S.disposed = true;
    S.alive = false;
    exits.delete(S);
    T.kill('x:' + S.g);
    for (const g of S.groups) T.kill(g);
    S.layers.forEach((r) => WD.removeLayer(r));
    S.gl.forEach((d) => {
      WD.remove(d);
      try {
        if (d.dispose) d.dispose();
      } catch (e) {
        console.error('[KS] dispose', e);
      }
    });
    S.vids.forEach((v) => {
      try {
        v.pause();
        v.removeAttribute('src');
        v.load();
      } catch (e) {

      }
    });
    S.offs.forEach((f) => f());
    S.syncs.length = 0;
    S.root.remove();
  }
  function flushExits() {
    for (const S of Array.from(exits)) dispose(S);
  }
  function fadeIn(S, dur) {
    const g = S.g + ':in';
    S.groups.add(g);
    T.setEl(S.root, { o: 0 });
    T.el(S.root, { o: 1 }, { dur, ease: 'outQuad', group: g });
    for (const d of S.gl) {
      const o = d.o;
      if (o == null || o <= 0) continue;
      d.o = 0;
      T.to(d, { o }, { dur, ease: 'outQuad', group: g });
    }
  }

  const imagesOf = (d) => (d._seen ? d.images.concat(Array.from(d._seen)) : d.images);
  function preloadAround(i) {
    for (const j of [i + 1, i + 2]) {
      const d = DK.list[j];
      if (d) G.preload(imagesOf(d));
    }
  }

  function trim() {
    if (!G.ok) return;
    const keep = new Set();
    for (let j = DK.cur - 3; j <= DK.cur + 3; j++) {
      const d = DK.list[j];
      if (d) imagesOf(d).forEach((n) => keep.add(n));
    }
    if (DK.S) DK.S.imgs.forEach((n) => keep.add(n));
    for (const S of exits) S.imgs.forEach((n) => keep.add(n));
    G.trim(keep);
  }

  function enter(i, o = {}) {
    const def = DK.list[i];
    if (!def) return null;
    retire(DK.S, 0.6);
    DK.cur = i;
    DK.beat = 1;
    const S = makeS(def, 'normal');
    DK.S = S;
    resetSwarm(def, !!o.cut);
    const bw = baseWorld(def);
    let dur = 0, dist = 0;
    if (o.cut) {
      setWorld(bw);
      WD.cut();
      DK.flightEnd = 0;
    } else {
      const c = WD.cam;
      dist = Math.hypot(bw.cam.x - c.x, bw.cam.y - c.y, bw.cam.z - c.z);
      dur = fly(bw);
    }
    const w = def.world;
    S.arrive = w.enterAt != null ? w.enterAt : o.cut ? 0.45 : 0.35 + 0.4 * dur * U.clamp(dist / 2400);
    run(S, S.g + ':b', def.build);
    if (def.steps.length) {
      S.groups.add(S.g + ':0');
      T.call(() => runStep(S, 0), S.arrive, S.g + ':0');
    }
    preloadAround(i);
    T.call(trim, 1.2, 'deck');
    emitChange();
    return S;
  }

  function buildAt(i, nb, mode) {
    const def = DK.list[i];
    if (!def) return null;
    const soft = mode === 'soft';
    let snap = null, swSnap = null;
    if (soft) {
      snap = snapWorld();
      swSnap = snapSwarm();
      retire(DK.S, 0.5, 0.1);
    } else {
      retire(DK.S, 0);
      flushExits();
    }
    setWorld(baseWorld(def));
    DK.flightEnd = 0;
    DK.cur = i;
    const S = makeS(def, mode);
    DK.S = S;
    S.deferSwarm = soft;
    resetSwarm(def, true);
    run(S, S.g + ':b', def.build);
    T.finishAll(S.g + ':b');
    const n = U.clamp(Math.round(nb) || 1, 1, beatsOf(def));
    for (let k = 0; k < Math.min(n, def.steps.length); k++) {
      runStep(S, k);
      T.finishAll(S.g + ':' + k);
    }
    DK.beat = n;
    S.instant = false;
    S.deferSwarm = false;
    if (soft) {
      const end = snapWorld(), swEnd = snapSwarm();
      setWorld(snap);
      fly(end, { dur: 1.3 });
      if (swSnap) {
        restoreSwarm(swSnap);
        tweenSwarm(swEnd, 1.2);
      }
      fadeIn(S, 0.45);
      if (S.swarmLast && WD.swarm) {
        const m = Object.assign({}, S.swarmLast[1], { dur: 1.2, delay: 0, group: 'swarm' });
        delete m.from;
        delete m.fromPlace;
        WD.swarm.morph(S.swarmLast[0], m);
      }
    } else WD.cut();
    preloadAround(i);
    if (mode !== 'kf') T.call(trim, 1.2, 'deck');
    emitChange();
    return S;
  }

  DK.next = () => {
    if (jumping || DK.previewing) return;
    const S = DK.S;
    if (!S) return void enter(0, { cut: true });
    if (DK.beat < beatsOf(S.def)) {
      land();
      settle(S);
      runStep(S, DK.beat);
      DK.beat++;
      emitChange();
    } else {
      const j = nextIndex(DK.cur);
      if (j != null) enter(j);
    }
  };
  DK.prev = () => {
    if (jumping || DK.previewing || !DK.S) return;
    if (DK.beat > 1) buildAt(DK.cur, DK.beat - 1, 'soft');
    else {
      const j = prevIndex(DK.cur);
      if (j != null) buildAt(j, beatsOf(DK.list[j]), 'soft');
    }
  };
  DK.nextScene = () => {
    if (jumping || DK.previewing) return;
    const j = nextIndex(DK.cur);
    if (j != null) enter(j);
  };
  DK.prevScene = () => {
    if (jumping || DK.previewing) return;
    const j = prevIndex(DK.cur);
    if (j != null) buildAt(j, beatsOf(DK.list[j]), 'soft');
  };

  DK.goto = (i, o = {}) => {
    if (i == null || !DK.list[i] || jumping || DK.previewing) return;
    const near = DK.cur >= 0 && (Math.abs(i - DK.cur) <= 2 || (isQA(i) && isQA(DK.cur)));
    if (o.beat == null && near) enter(i);
    else jump(i, o.beat);
  };
  DK.nav = (id) => {
    const d = DK.byId[id];
    if (d) DK.goto(d.index);
  };
  function jump(i, beat) {
    if (!DK.list[i] || jumping || DK.previewing) return;
    jumping = true;
    DK.veil(1, 0.32, () => {
      try {
        if (beat != null) buildAt(i, beat, 'cut');
        else enter(i, { cut: true });
      } finally {
        jumping = false;
      }
      if (!DK.black) DK.veil(0, 0.5);
    });
  }
  DK.jump = jump;
  DK.home = () => jump(0);
  DK.end = () => jump(lastMain());

  DK.toggleQA = () => {
    if (jumping || DK.previewing) return;
    if (isQA(DK.cur)) {
      const r = qaReturn || { index: lastMain(), beat: null };
      qaReturn = null;
      jump(r.index, r.beat);
    } else {
      const q = qaIndex();
      if (q == null) return;
      qaReturn = { index: DK.cur, beat: DK.beat };
      jump(q);
    }
  };
  DK.key = (e) => {
    const S = DK.S;
    if (!S || !S.def.key) return false;
    try {
      return !!S.def.key(S, e);
    } catch (err) {
      console.error('[KS] key', err);
      return false;
    }
  };
  Object.assign(DK, { enter, buildAt, fly, retire, flushExits });

  DK.veil = (o, dur = 0.5, done) => {
    if (!veilEl) veilEl = document.getElementById('veil');
    if (!veilEl) {
      if (done) done();
      return;
    }
    if (dur <= 0) {
      T.setEl(veilEl, { o });
      if (done) done();
      return;
    }
    T.el(veilEl, { o }, { dur, ease: 'inOutSine', group: 'veil' });

    if (done) T.call(done, dur, 'veil');
  };
  DK.blackout = (on) => {
    if (jumping) return;
    DK.black = on != null ? !!on : !DK.black;
    DK.veil(DK.black ? 1 : 0, 0.6);
    KS.emit('black', DK.black);
  };

  DK.keyframes = () => {
    finalize();
    const out = [];
    DK.list.forEach((d, index) => {
      if (d.pdf === false) return;
      const beats = beatsOf(d);
      const ks = d.kf == null ? [beats] : Array.isArray(d.kf) ? d.kf : [d.kf];
      ks.forEach((b) =>
        out.push({
          n: out.length, index, id: d.id, beat: U.clamp(Math.round(b), 1, beats), title: d.title || d.id, sec: d.sec,
          qa: d.qa != null ? d.qa : null, no: d.no,
        }),
      );
    });
    return out;
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const raf = () => new Promise((r) => requestAnimationFrame(() => r()));

  DK.renderKeyframe = async (n) => {
    const kf = DK.keyframes()[n];
    if (!kf) return null;
    const clk = KS.clock;
    clk.frozen = true;
    clk.t = 100 + n * 3.7;
    DK.black = false;
    DK.veil(0, 0);
    flushExits();
    T.kill('world');
    T.kill('swarm');
    const S = buildAt(kf.index, kf.beat, 'kf');
    T.finishAll();
    flushExits();
    const imgs = imagesOf(S.def).concat(Array.from(S.imgs));
    const all = S.promises.concat([G.preload(imgs), document.fonts ? document.fonts.ready : null]);
    await Promise.race([Promise.all(all), sleep(10000)]);
    T.finishAll();
    WD.cut();
    WD.step(0);
    await raf();
    await raf();
    WD.step(0);
    return kf;
  };

  DK.preview = async (on) => {
    if (on == null) on = !DK.previewing;
    if (previewBusy || jumping) return;
    if (on) {
      if (DK.previewing) return;
      const cur = DK.cur;
      DK.previewing = { index: cur, beat: DK.beat, t: KS.clock.t };
      document.body.classList.add('kf');
      previewBusy = true;
      try {
        let n = -1;
        for (const k of DK.keyframes()) {
          if (k.index !== cur) continue;
          n = k.n;
          if (k.beat >= DK.previewing.beat) break;
        }
        if (n >= 0) await DK.renderKeyframe(n);
        else {
          KS.clock.frozen = true;
          buildAt(cur, beatsOf(DK.list[cur]), 'kf');
          T.finishAll();
          flushExits();
          WD.cut();
          WD.step(0);
        }
      } finally {
        previewBusy = false;
      }
      KS.emit('preview', true);
    } else {
      if (!DK.previewing) return;
      const p = DK.previewing;
      DK.previewing = null;
      document.body.classList.remove('kf');
      KS.clock.t = Math.max(KS.clock.t, p.t);
      KS.clock.frozen = false;
      buildAt(p.index, p.beat, 'cut');
      KS.emit('preview', false);
    }
  };

  KS.on('resize', () => {
    if (KS.clock.frozen) WD.step(0);
  });

  DK.busy = () => {
    const S = DK.S;
    if (!S || !S.alive || DK.previewing) return false;
    if (T.now() < DK.flightEnd) return true;
    return [S.g + ':b', S.g + ':in', S.g + ':' + (DK.beat - 1)].some((g) => T.busy(g, 8));
  };

  DK.state = () => {
    const S = DK.S;
    if (!S) return { index: -1 };
    const d = S.def, beats = beatsOf(d);
    let next = '（最後）';
    if (DK.beat < beats) next = '（同じページの次の段）';
    else {
      const j = nextIndex(DK.cur);
      if (j != null) next = DK.list[j].title || DK.list[j].id;
    }
    const sec = KS.SECTIONS.find((s) => s.id === d.sec);
    return {
      index: DK.cur, beat: DK.beat, beats, id: d.id, title: d.title || d.id, next,
      sec: d.sec, secLabel: sec ? sec.label : '', n: d.no, total: DK.total,
      qa: d.qa != null ? d.qa : null,
      label: d.qa != null ? (d.qa ? 'FAQ ' + d.qa : 'FAQ') : d.no != null ? String(d.no) : '',
    };
  };
  function emitChange() {
    const st = DK.state();
    KS.emit('change', st);
    if (KS.params.export) return;
    try {
      history.replaceState(null, '', '#s=' + encodeURIComponent(st.id) + '&b=' + st.beat);
    } catch (e) {

    }
  }

  function tick(S, dt) {
    if (!S.def.update || S.updErr) return;
    const g = T.defGroup;
    T.defGroup = S.g + ':amb';
    try {
      S.def.update(S, KS.clock.t - S.t0, dt);
    } catch (e) {
      S.updErr = true;
      console.error('[KS] update ' + S.id, e);
    }
    T.defGroup = g;
  }
  KS.on('update', (dt) => {
    if (DK.S && DK.S.alive) tick(DK.S, dt);
    for (const S of exits) tick(S, dt);
  });
  KS.on('frame', () => {
    if (DK.S) for (const f of DK.S.syncs) f();
    for (const S of exits) for (const f of S.syncs) f();
  });

  function parseHash() {
    const r = {};
    (location.hash || '').replace(/^#/, '').split('&').forEach((kv) => {
      const i = kv.indexOf('=');
      if (i > 0) r[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1));
    });
    const b = r.b != null ? parseInt(r.b, 10) : NaN;
    return { s: r.s, b: isNaN(b) ? null : b };
  }
  DK.boot = () => {
    finalize();
    if (KS.params.export) {
      DK.veil(0, 0);
      return;
    }
    DK.veil(1, 0);
    let i = 0, b = null;
    const h = parseHash(), P = KS.params;
    if (h.s && DK.byId[h.s]) {
      i = DK.byId[h.s].index;
      b = h.b;
    } else if (P.scene != null) {
      const d = DK.byId[P.scene] || DK.byNo(parseInt(P.scene, 10));
      if (d) i = d.index;
    }
    if (!DK.list.length) return;
    if (b != null) buildAt(i, b, 'cut');
    else enter(i, { cut: true });
    DK.veil(0, 2.2);
  };
})();
