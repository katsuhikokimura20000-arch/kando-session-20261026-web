(function () {
  'use strict';
  const KS = (window.KS = window.KS || {});
  KS.version = '1.0.0';
  KS.W = 1920;
  KS.H = 1080;
  KS.DIST = 1483.6;

  const U = (KS.U = {});
  U.clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.remap = (x, a, b, c, d) => c + (d - c) * U.clamp((x - a) / (b - a));
  U.smooth = (a, b, x) => {
    const t = U.clamp((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  };
  U.fract = (x) => x - Math.floor(x);
  U.TAU = Math.PI * 2;
  U.deg = Math.PI / 180;

  U.rng = (seed) => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  U.hashStr = (s) => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return h >>> 0;
  };
  U.shuffle = (arr, rnd) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (rnd() * (i + 1)) | 0;
      const t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    return arr;
  };

  U.gauss = (rnd) => {
    let u = 0, v = 0;
    while (u === 0) u = rnd();
    while (v === 0) v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(U.TAU * v);
  };
  U.fmt = (n, digits = 0) =>
    n.toLocaleString('ja-JP', { minimumFractionDigits: digits, maximumFractionDigits: digits });

  U.sx2w = (x) => x - KS.W / 2;
  U.sy2w = (y) => KS.H / 2 - y;
  U.w = (x, y, z = 0) => [x - KS.W / 2, KS.H / 2 - y, z];

  U.hex = (h) => {
    if (Array.isArray(h)) return h.slice(0, 3);
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  };
  const s2l = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  U.lin = (h, mul = 1) => U.hex(h).map((c) => s2l(c) * mul);
  U.mixc = (a, b, t) => [U.lerp(a[0], b[0], t), U.lerp(a[1], b[1], t), U.lerp(a[2], b[2], t)];

  KS.C = {
    navy: '#05070d',
    ink: '#0a1020',
    deep: '#0d1830',
    gold: '#f2b766',
    gold2: '#ffcf8a',
    amber: '#e89a3c',
    copper: '#c8743a',
    cyan: '#6fd3ff',
    blue: '#3aa0ff',
    cream: '#f3ead8',
    white: '#fff8ec',
    red: '#d9645a',
    dim: '#8c93a6',
  };

  const E = (KS.E = {});
  E.linear = (t) => t;
  E.inQuad = (t) => t * t;
  E.outQuad = (t) => 1 - (1 - t) * (1 - t);
  E.inOutQuad = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  E.inCubic = (t) => t * t * t;
  E.outCubic = (t) => 1 - Math.pow(1 - t, 3);
  E.inOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  E.outQuart = (t) => 1 - Math.pow(1 - t, 4);
  E.inOutQuart = (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);
  E.outQuint = (t) => 1 - Math.pow(1 - t, 5);
  E.inOutQuint = (t) => (t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2);
  E.inExpo = (t) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10));
  E.outExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
  E.inOutExpo = (t) =>
    t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
  E.inSine = (t) => 1 - Math.cos((t * Math.PI) / 2);
  E.outSine = (t) => Math.sin((t * Math.PI) / 2);
  E.inOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
  E.outCirc = (t) => Math.sqrt(1 - Math.pow(t - 1, 2));
  E.inOutCirc = (t) =>
    t < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;
  E.outBack = (t, s = 1.4) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
  E.inOutBack = (t) => {
    const c = 1.70158 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c + 1) * 2 * t - c)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c + 1) * (t * 2 - 2) + c) + 2) / 2;
  };
  E.outElastic = (t) =>
    t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3.2)) + 1;

  E.bezier = (x1, y1, x2, y2) => {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (t) => ((ax * t + bx) * t + cx) * t;
    const sy = (t) => ((ay * t + by) * t + cy) * t;
    const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => {
      let t = x;
      for (let i = 0; i < 6; i++) {
        const e = sx(t) - x;
        const d = dx(t);
        if (Math.abs(e) < 1e-5 || Math.abs(d) < 1e-6) break;
        t -= e / d;
      }
      return sy(U.clamp(t));
    };
  };

  E.cine = E.bezier(0.22, 1, 0.36, 1);
  E.film = E.bezier(0.65, 0, 0.35, 1);
  E.snap = E.bezier(0.2, 0.9, 0.1, 1);
  E.get = (e) => (typeof e === 'function' ? e : E[e] || E.cine);

  const handlers = {};
  KS.on = (ev, fn) => (handlers[ev] = handlers[ev] || []).push(fn);
  KS.off = (ev, fn) => {
    const a = handlers[ev];
    if (a) handlers[ev] = a.filter((f) => f !== fn);
  };
  KS.emit = (ev, data) => (handlers[ev] || []).forEach((f) => f(data));

  KS.clock = { t: 0, dt: 1 / 60, frozen: false, frame: 0 };

  const qs = new URLSearchParams(location.search);
  KS.params = {
    export: qs.has('export'),
    quality: qs.get('quality') || '',
    scene: qs.get('s'),
    debug: qs.has('debug'),
    nogl: qs.has('nogl'),
    cinema: qs.has('cinema'),
  };

  const M = (KS.M = {});
  M.perspective = (fovy, aspect, near, far) => {
    const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
  };
  M.mul = (a, b) => {
    const o = new Float32Array(16);
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++) {
        let s = 0;
        for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k];
        o[i * 4 + j] = s;
      }
    return o;
  };

  M.view = (x, y, z, r = 0) => {
    const c = Math.cos(-r), s = Math.sin(-r);
    return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, -(c * x - s * y), -(s * x + c * y), -z, 1]);
  };
})();
