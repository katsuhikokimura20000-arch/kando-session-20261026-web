(function () {
  'use strict';
  const KS = window.KS, T = KS.T, Dm = KS.D, U = KS.U;
  const TX = (KS.Text = {});

  const MARK = /(\{[^{}]*\}|\(\([^()]*\)\)|\^[^^]*\^)/;
  function segments(line) {
    const out = [];
    line.split(MARK).forEach((s) => {
      if (!s) return;
      if (s[0] === '{' && s[s.length - 1] === '}') out.push([s.slice(1, -1), 'em']);
      else if (s.startsWith('((') && s.endsWith('))')) out.push([s.slice(2, -2), 'dim']);
      else if (s[0] === '^' && s[s.length - 1] === '^' && s.length > 1) out.push([s.slice(1, -1), 'sm']);
      else out.push([s, '']);
    });
    return out;
  }
  const isSpace = (c) => c === ' ' || c === '　';

  TX.split = (el, text, o = {}) => {
    el.textContent = '';
    const lines = [], chars = [];
    const byWord = !!o.words;
    String(text == null ? '' : text).split('\n').forEach((ln) => {
      const L = document.createElement('span');
      L.className = 'ln';
      const lc = [];
      segments(ln).forEach(([s, cls]) => {
        let host = L;
        if (cls) {
          host = document.createElement('span');
          host.className = cls;
          L.appendChild(host);
        }
        if (byWord) {
          s.split(/(\s+)/).forEach((w) => {
            if (!w) return;
            if (/^\s+$/.test(w)) return host.appendChild(document.createTextNode(w));
            const c = document.createElement('span');
            c.className = 'ch';
            c.textContent = w;
            host.appendChild(c);
            lc.push(c);
            chars.push(c);
          });
          return;
        }
        for (const ch of Array.from(s)) {
          if (isSpace(ch)) {
            host.appendChild(document.createTextNode(ch));
            continue;
          }
          const c = document.createElement('span');
          c.className = 'ch';
          c.textContent = ch;
          host.appendChild(c);
          lc.push(c);
          chars.push(c);
        }
      });
      if (!lc.length) L.innerHTML = '&#8203;';
      el.appendChild(L);
      lines.push(lc);
    });
    el._lines = lines;
    el._chars = chars;
    el._text = text;
    return el;
  };

  const ANCH = {
    tl: [0, 0], tc: [-50, 0], tr: [-100, 0], cl: [0, -50], cc: [-50, -50], cr: [-100, -50],
    bl: [0, -100], bc: [-50, -100], br: [-100, -100],
  };
  TX.block = (parent, text, o = {}) => {
    const wrap = document.createElement('div');
    wrap.className = 'txw';
    const a = ANCH[o.anchor || 'tl'] || ANCH.tl;
    const s = wrap.style;
    s.left = (o.x || 0) + 'px';
    s.top = (o.y || 0) + 'px';
    if (a[0] || a[1]) s.transform = 'translate(' + a[0] + '%,' + a[1] + '%)';
    if (o.w) s.width = o.w + 'px';
    const el = document.createElement('div');
    el.className = 'tx ' + (o.cls || 'sans');
    const es = el.style;
    if (o.size) es.fontSize = o.size + 'px';
    if (o.color) es.color = o.color;
    if (o.weight) es.fontWeight = o.weight;
    if (o.lh) es.lineHeight = o.lh;
    if (o.ls != null) es.letterSpacing = o.ls + 'em';
    es.textAlign = o.align || (a[0] === -50 ? 'center' : a[0] === -100 ? 'right' : 'left');
    if (o.style) Object.assign(es, o.style);
    wrap.appendChild(el);
    parent.appendChild(wrap);
    TX.split(el, text, o);
    el._wrap = wrap;
    if (!o.show) T.setEl(el, { o: 0 });
    return el;
  };

  TX.set = (el, text, o = {}) => {
    TX.split(el, text, o);
    return el;
  };

  function order(n, how, seed) {
    const idx = [];
    for (let i = 0; i < n; i++) idx.push(i);
    if (how === 'end') idx.reverse();
    else if (how === 'center') {
      const c = (n - 1) / 2;
      idx.sort((a, b) => Math.abs(a - c) - Math.abs(b - c) || a - b);
    } else if (how === 'random') U.shuffle(idx, U.rng(seed || 11));
    const rank = new Array(n);
    idx.forEach((v, k) => (rank[v] = k));
    return rank;
  }

  TX.in = (el, preset = 'rise', o = {}) => {
    if (!el) return 0;
    const chars = el._chars || [];
    const d0 = o.delay || 0;
    T.setEl(el, { o: 1 });
    const n = chars.length;
    let end = d0;
    const per = (fromSt, toSt, dur, stg, ease, ord) => {
      const rk = order(n, ord || o.order, o.seed);
      for (let i = 0; i < n; i++) T.setEl(chars[i], fromSt);
      for (let i = 0; i < n; i++) {
        const dl = d0 + rk[i] * stg;
        T.el(chars[i], toSt, { dur, delay: dl, ease });
        end = Math.max(end, dl + dur);
      }
    };
    switch (preset) {
      case 'rise': {
        const dy = o.dy != null ? o.dy : 30, bl = o.blur != null ? o.blur : 12;
        per({ y: dy, o: 0, b: bl }, { y: 0, o: 1, b: 0 }, o.dur || 1.1, o.stagger != null ? o.stagger : 0.03, o.ease || 'cine');
        break;
      }
      case 'drop': {
        per({ y: -(o.dy || 26), o: 0, b: o.blur != null ? o.blur : 8 }, { y: 0, o: 1, b: 0 }, o.dur || 1.0, o.stagger != null ? o.stagger : 0.028, o.ease || 'cine');
        break;
      }
      case 'zoom': {
        per({ s: o.s0 || 1.7, o: 0, b: o.blur != null ? o.blur : 14 }, { s: 1, o: 1, b: 0 }, o.dur || 1.3, o.stagger != null ? o.stagger : 0.035, o.ease || 'cine', o.order || 'center');
        break;
      }
      case 'blurin': {
        per({ o: 0, b: o.blur != null ? o.blur : 18 }, { o: 1, b: 0 }, o.dur || 1.4, o.stagger != null ? o.stagger : 0.02, o.ease || 'outCubic', o.order || 'random');
        break;
      }
      case 'type': {
        const stg = o.stagger != null ? o.stagger : 0.045;
        per({ o: 0 }, { o: 1 }, 0.02, stg, 'linear');
        break;
      }
      case 'lines': {

        const lines = el._lines || [];
        const dur = o.dur || 1.2, stg = o.stagger != null ? o.stagger : 0.16;
        lines.forEach((lc, li) => {
          lc.forEach((c) => T.setEl(c, { y: o.dy != null ? o.dy : 22, o: 0, b: o.blur != null ? o.blur : 8 }));
          lc.forEach((c, ci) => {
            const dl = d0 + li * stg + ci * (o.cstag || 0.004);
            T.el(c, { y: 0, o: 1, b: 0 }, { dur, delay: dl, ease: o.ease || 'cine' });
            end = Math.max(end, dl + dur);
          });
        });
        break;
      }
      case 'spread': {
        const ls1 = o.ls != null ? o.ls : parseFloat(el.style.letterSpacing) || 0.02;
        T.setEl(el, { o: 0, ls: o.ls0 != null ? o.ls0 : ls1 + 0.45, b: o.blur != null ? o.blur : 8 });
        const dur = o.dur || 1.8;
        T.el(el, { o: 1, ls: ls1, b: 0 }, { dur, delay: d0, ease: o.ease || 'cine' });
        end = d0 + dur;
        break;
      }
      case 'wipe': {
        T.setEl(el, { mk: 0, ma: o.angle || 90, mf: o.feather || 22 });
        const dur = o.dur || 1.3;
        T.el(el, { mk: 1 }, { dur, delay: d0, ease: o.ease || 'inOutCubic' });
        end = d0 + dur;
        break;
      }
      case 'fade':
      default: {
        T.setEl(el, { o: 0, y: o.dy != null ? o.dy : 12, b: o.blur != null ? o.blur : 6 });
        const dur = o.dur || 1.1;
        T.el(el, { o: 1, y: 0, b: 0 }, { dur, delay: d0, ease: o.ease || 'cine' });
        end = d0 + dur;
      }
    }
    return end;
  };

  TX.out = (el, preset = 'fade', o = {}) => {
    if (!el) return 0;
    const d0 = o.delay || 0, dur = o.dur || 0.7;
    if (preset === 'rise' && el._chars && el._chars.length) {
      const n = el._chars.length, stg = o.stagger != null ? o.stagger : 0.012;
      el._chars.forEach((c, i) => T.el(c, { y: -(o.dy || 24), o: 0, b: o.blur != null ? o.blur : 8 }, { dur, delay: d0 + i * stg, ease: 'inCubic' }));
      return d0 + dur + n * stg;
    }
    if (preset === 'blur') {
      T.el(el, { o: 0, b: o.blur || 14, s: o.s || 1.04 }, { dur, delay: d0, ease: 'inOutQuad' });
      return d0 + dur;
    }
    if (preset === 'sink') {
      T.el(el, { o: 0, y: o.dy || 18, b: 6 }, { dur, delay: d0, ease: 'inCubic' });
      return d0 + dur;
    }
    T.el(el, { o: 0, b: o.blur != null ? o.blur : 4 }, { dur, delay: d0, ease: 'inOutQuad' });
    return d0 + dur;
  };

  TX.dim = (el, to = 0.35, o = {}) => T.el(el, { o: to }, { dur: o.dur || 0.8, delay: o.delay || 0, ease: o.ease || 'inOutQuad' });

  TX.glint = (el, o = {}) => {
    if (!el) return 0;
    let g = el._glint;
    if (!g) {
      g = el.cloneNode(true);
      g.removeAttribute('style');
      g.className = el.className + ' glint';
      g.setAttribute('aria-hidden', 'true');
      g.querySelectorAll('[style]').forEach((n) => n.removeAttribute('style'));
      const cs = el.style;
      ['fontSize', 'color', 'fontWeight', 'lineHeight', 'letterSpacing', 'textAlign', 'fontFeatureSettings', 'fontFamily'].forEach((k) => (g.style[k] = cs[k]));
      el._wrap.appendChild(g);
      el._glint = g;
    }
    const col = o.color || 'rgba(255,244,222,.95)';
    g.style.backgroundImage = 'linear-gradient(105deg,transparent 0%,transparent 42%,' + col + ' 50%,transparent 58%,transparent 100%)';
    const st = { p: 0 };
    const dur = o.dur || 1.5, d0 = o.delay || 0;
    T.to(st, { p: 1 }, {
      dur, delay: d0, ease: o.ease || 'inOutSine',
      onStart: () => (g.style.visibility = 'visible'),
      onUpdate: () => {
        g.style.backgroundPosition = U.lerp(118, -18, st.p).toFixed(2) + '% 0';
        g.style.opacity = (Math.sin(Math.PI * st.p) * (o.i || 1)).toFixed(3);
      },
      onComplete: () => {
        g.style.visibility = 'hidden';
        g.style.opacity = '0';
      },
    });
    return d0 + dur;
  };

  TX.count = (el, to, o = {}) => {
    const st = { v: o.from != null ? o.from : 0 };
    const digits = o.digits || 0;
    const f = o.fmt || ((v) => U.fmt(v, digits));
    const show = (v) => (el.textContent = (o.pre || '') + f(v) + (o.suf || ''));
    show(st.v);
    T.setEl(el, { o: 1 });
    const dur = o.dur || 2.2, d0 = o.delay || 0;
    T.to(st, { v: to }, { dur, delay: d0, ease: o.ease || 'outQuart', onUpdate: () => show(st.v), onComplete: () => show(to) });
    return d0 + dur;
  };
})();
