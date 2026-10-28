(function () {
  'use strict';
  const KS = window.KS, U = KS.U, E = KS.E;

  const D = (KS.D = { dirty: new Set() });
  const BASE = { x: 0, y: 0, s: 1, sx: 1, sy: 1, r: 0, rx: 0, ry: 0, o: 1, b: 0 };
  D.st = (el) => {
    if (!el._st) {
      el._st = Object.assign({ __el: el }, BASE);

      el._st.ls = el._st.wg = el._st.mk = el._st.gl = el._st.br = null;
    }
    return el._st;
  };
  D.set = (el, props) => {
    const st = D.st(el);
    Object.assign(st, props);
    D.dirty.add(st);
    return el;
  };
  const f3 = (v) => Math.round(v * 1000) / 1000;
  function write(st) {
    const el = st.__el, s = el.style;
    let tf = '';
    if (st.x || st.y) tf += 'translate(' + f3(st.x) + 'px,' + f3(st.y) + 'px) ';
    if (st.rx || st.ry) tf += 'perspective(1400px) rotateX(' + f3(st.rx) + 'deg) rotateY(' + f3(st.ry) + 'deg) ';
    if (st.r) tf += 'rotate(' + f3(st.r) + 'deg) ';
    const sx = st.s * st.sx, sy = st.s * st.sy;
    if (sx !== 1 || sy !== 1) tf += 'scale(' + f3(sx) + ',' + f3(sy) + ')';
    s.transform = tf;
    s.opacity = st.o >= 0.999 ? '' : f3(Math.max(0, st.o));
    s.visibility = st.o <= 0.001 ? 'hidden' : '';
    let filt = '';
    if (st.b > 0.04) filt += 'blur(' + f3(st.b) + 'px) ';
    if (st.br != null && Math.abs(st.br - 1) > 0.002) filt += 'brightness(' + f3(st.br) + ')';
    s.filter = filt;
    if (st.ls != null) s.letterSpacing = f3(st.ls) + 'em';
    if (st.wg != null) s.fontVariationSettings = "'wght' " + Math.round(st.wg);
    if (st.mk != null) {

      const fe = st.mf || 18, p = st.mk * (100 + fe) - fe;
      const g = st.mk >= 1 ? 'none' :
        'linear-gradient(' + (st.ma || 90) + 'deg,#000 ' + f3(p) + '%,transparent ' + f3(p + fe) + '%)';
      s.webkitMaskImage = s.maskImage = g;
    }
    if (st.gl != null) {
      const c = st.gc || '242,183,102';
      s.textShadow = st.gl > 0.01
        ? '0 0 ' + f3(st.gl * 18) + 'px rgba(' + c + ',' + f3(st.gl * 0.55) + '),0 0 ' + f3(st.gl * 52) + 'px rgba(' + c + ',' + f3(st.gl * 0.28) + ')'
        : '';
    }
  }
  D.flush = () => {
    if (!D.dirty.size) return;
    for (const st of D.dirty) write(st);
    D.dirty.clear();
  };

  const T = (KS.T = { instant: false, live: [] });
  const live = T.live;
  let seq = 0, finishing = 0, vnow = 0;
  T.now = () => (finishing ? vnow : KS.clock.t);

  const isArr = Array.isArray;
  const cloneV = (v) => (isArr(v) ? v.slice() : v);

  function resolve(tw) {
    const a = {}, b = {}, tg = tw.target, fr = tw.from;
    for (const k of tw.keys) {
      let av = fr && fr[k] !== undefined ? fr[k] : tg[k];
      if (av === undefined || av === null) av = isArr(tw.props[k]) ? tw.props[k].map(() => 0) : 0;
      a[k] = cloneV(av);
      b[k] = tw.props[k];
      if (fr && fr[k] !== undefined) tg[k] = cloneV(av);
    }
    tw.a = a;
    tw.b = b;
  }
  function overwrite(tw) {
    for (const o of live) {
      if (o === tw || o.done || o.call || o.target !== tw.target || o.repeat) continue;

      if (!o.started && (o.start > tw.start || (o.start === tw.start && o.id > tw.id))) continue;
      let left = 0;
      for (let i = o.keys.length - 1; i >= 0; i--) {
        if (tw.props[o.keys[i]] !== undefined) o.keys.splice(i, 1);
        else left++;
      }
      if (!left) o.done = true;
    }
  }
  function apply(tw, p) {
    const e = tw.ease(p), tg = tw.target;
    for (const k of tw.keys) {
      const a = tw.a[k], b = tw.b[k];
      if (isArr(b)) {
        let out = tg[k];
        if (!isArr(out) || out.length !== b.length) out = tg[k] = b.slice();
        for (let i = 0; i < b.length; i++) out[i] = a[i] + (b[i] - a[i]) * e;
      } else tg[k] = a + (b - a) * e;
    }
    if (tg.__el) D.dirty.add(tg);
    if (tw.onUpdate) tw.onUpdate(tg, e, p);
  }

  function cb(tw, fn, arg) {
    const g = T.defGroup;
    T.defGroup = tw.group;
    try {
      fn(arg);
    } catch (e) {
      console.error('[KS] tween callback', e);
    }
    T.defGroup = g;
  }
  function start(tw) {
    tw.started = true;
    resolve(tw);
    if (tw.ow) overwrite(tw);
    if (tw.onStart) cb(tw, tw.onStart, tw.target);
  }
  function complete(tw) {
    if (!tw.started) start(tw);
    apply(tw, 1);
    tw.done = true;
    if (tw.onComplete) cb(tw, tw.onComplete, tw.target);
  }

  T.to = (target, props, o = {}) => {
    const tw = {
      id: ++seq, target, props, keys: Object.keys(props),
      dur: o.dur != null ? o.dur : 1,

      start: (o.repeat && finishing ? KS.clock.t : T.now()) + (o.delay || 0),
      ease: E.get(o.ease), from: o.from || null,
      onStart: o.onStart, onUpdate: o.onUpdate, onComplete: o.onComplete,
      group: o.group !== undefined ? o.group : T.defGroup,
      repeat: o.repeat || 0, yoyo: !!o.yoyo, ow: o.overwrite !== false,
      started: false, done: false,
    };
    live.push(tw);
    return tw;
  };
  T.call = (fn, delay = 0, group) => {
    const c = { id: ++seq, call: fn, start: T.now() + delay, group: group !== undefined ? group : T.defGroup, done: false };
    live.push(c);
    return c;
  };

  T.el = (el, props, o) => T.to(D.st(el), props, o);

  T.set = (target, props) => {
    const tw = T.to(target, props, { dur: 0, group: null });
    complete(tw);
    return tw;
  };
  T.setEl = (el, props) => T.set(D.st(el), props);

  T.update = (now) => {
    const n = live.length;
    for (let i = 0; i < n; i++) {
      const tw = live[i];
      if (tw.done || now < tw.start) continue;
      if (tw.call) {
        tw.done = true;
        cb(tw, tw.call);
        continue;
      }
      if (!tw.started) start(tw);
      if (tw.done) continue;
      let p = tw.dur > 0 ? (now - tw.start) / tw.dur : 1;
      if (tw.repeat && p >= 1) {
        const cycles = Math.floor(p);
        if (tw.repeat > 0 && cycles > tw.repeat) p = 1;
        else {
          p = p - cycles;
          if (tw.yoyo && cycles % 2 === 1) p = 1 - p;
          apply(tw, p);
          continue;
        }
      }
      if (p >= 1) complete(tw);
      else apply(tw, U.clamp(p));
    }

    let w = 0;
    for (let i = 0; i < live.length; i++) if (!live[i].done) live[w++] = live[i];
    live.length = w;
  };

  T.finishAll = (group) => {
    finishing++;
    const saveV = vnow;
    vnow = KS.clock.t;
    for (let guard = 0; guard < 20000; guard++) {
      let best = null;
      for (const tw of live) {
        if (tw.done || tw.repeat) continue;
        if (group !== undefined && tw.group !== group) continue;
        if (!best || tw.start < best.start || (tw.start === best.start && tw.id < best.id)) best = tw;
      }
      if (!best) break;
      vnow = Math.max(vnow, best.start);
      if (best.call) {
        best.done = true;
        cb(best, best.call);
      } else {
        if (!best.started) start(best);
        if (!best.done) {
          vnow = best.start + best.dur;
          complete(best);
        }
      }
    }
    let w = 0;
    for (let i = 0; i < live.length; i++) if (!live[i].done) live[w++] = live[i];
    live.length = w;
    vnow = saveV;
    finishing--;
  };

  T.busy = (group, maxDur) => live.some((tw) => !tw.done && !tw.repeat && tw.group === group && (maxDur == null || tw.call || tw.dur < maxDur));
  T.kill = (group) => {
    for (const tw of live) if (tw.group === group) tw.done = true;
  };
  T.killOf = (target) => {
    for (const tw of live) if (tw.target === target) tw.done = true;
  };
  T.defGroup = null;
})();
