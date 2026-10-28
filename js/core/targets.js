(function () {
  'use strict';
  const KS = window.KS, U = KS.U;
  const Tg = (KS.Tg = {});
  const LRU = new Map();
  const MAX = 28;
  const DEFAULT_COL = U.lin('#ffe2b0', 1);

  const imgs = {};
  Tg.img = (name) => {
    if (imgs[name]) return imgs[name];
    const rec = (imgs[name] = { img: null, ready: false, p: null });
    const src = KS.media && KS.media[name];
    if (!src) {
      console.warn('[KS.Tg] missing media', name);
      rec.ready = true;
      rec.p = Promise.resolve(rec);
      return rec;
    }
    const im = new Image();
    rec.img = im;
    rec.p = new Promise((res) => {
      im.onload = () => {
        rec.ready = true;
        res(rec);
      };
      im.onerror = () => {
        rec.ready = true;
        rec.img = null;
        res(rec);
      };
    });
    im.src = src;
    return rec;
  };

  function Pts(cap) {
    this.d = new Float32Array(Math.max(64, cap | 0) * 8);
    this.aux = new Float32Array(Math.max(64, cap | 0));
    this.n = 0;
  }
  Pts.prototype.grow = function (need) {
    if (need * 8 <= this.d.length) return;
    let cap = this.d.length / 8;
    while (cap < need) cap *= 2;
    const d = new Float32Array(cap * 8);
    d.set(this.d);
    this.d = d;
    const a = new Float32Array(cap);
    a.set(this.aux);
    this.aux = a;
  };

  Pts.prototype.add = function (x, y, z, s, r, g, b, a, aux) {
    if ((this.n + 1) * 8 > this.d.length) this.grow(this.n + 1);
    const i = this.n++, k = i * 8, d = this.d;
    d[k] = x;
    d[k + 1] = y;
    d[k + 2] = z || 0;
    d[k + 3] = s == null ? 1 : s;
    if (r == null) {
      d[k + 4] = -1;
      d[k + 5] = d[k + 6] = 0;
    } else {
      d[k + 4] = r;
      d[k + 5] = g;
      d[k + 6] = b;
    }
    d[k + 7] = a == null ? 1 : a;
    this.aux[i] = aux || 0;
  };
  Pts.prototype.append = function (o) {
    this.grow(this.n + o.n);
    this.d.set(o.d.subarray(0, o.n * 8), this.n * 8);
    this.aux.set(o.aux.subarray(0, o.n), this.n);
    this.n += o.n;
  };

  const canvas2d = (w, h) => {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.ceil(w));
    c.height = Math.max(1, Math.ceil(h));
    return [c, c.getContext('2d', { willReadFrequently: true })];
  };

  function samplePixels(wt, W, H, cnt, rnd, emit) {
    let m = 0;
    for (let i = 0; i < wt.length; i++) if (wt[i] > 0) m++;
    if (!m || cnt <= 0) return;
    const idx = new Uint32Array(m), cdf = new Float64Array(m);
    let acc = 0, j = 0;
    for (let i = 0; i < wt.length; i++) {
      const w = wt[i];
      if (w > 0) {
        acc += w;
        idx[j] = i;
        cdf[j++] = acc;
      }
    }
    for (let i = 0; i < cnt; i++) {
      const u = ((i + rnd()) / cnt) * acc;
      let lo = 0, hi = m - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (cdf[mid] < u) lo = mid + 1;
        else hi = mid;
      }
      const p = idx[lo];
      emit((p % W) + rnd(), ((p / W) | 0) + rnd(), p);
    }
  }

  const GEN = {};

  const fontPx = (font) => {
    const m = /([\d.]+)px/.exec(font);
    return m ? parseFloat(m[1]) : 100;
  };

  GEN.text = (R, cnt, rnd) => {
    const font = R.font || '600 160px "Noto Serif JP"';
    const px = fontPx(font), res = R.res || 1;
    const lines = String(R.text == null ? '' : R.text).split('\n');
    const lh = (R.lh || 1.32) * px;
    const fScaled = font.replace(/([\d.]+)px/, (m, v) => parseFloat(v) * res + 'px');
    const [, mc] = canvas2d(4, 4);
    mc.font = fScaled;
    if (R.ls) mc.letterSpacing = R.ls * res + 'px';
    const widths = lines.map((l) => mc.measureText(l).width / res);
    const maxW = Math.max(1, ...widths);
    const pad = px * 0.35;
    const W = (maxW + pad * 2) * res, H = (lines.length * lh + pad * 2) * res;
    const [c, x] = canvas2d(W, H);
    x.font = fScaled;
    if (R.ls) x.letterSpacing = R.ls * res + 'px';
    x.textBaseline = 'middle';
    x.fillStyle = '#fff';
    x.strokeStyle = '#fff';
    const align = R.align || 'center';
    lines.forEach((l, i) => {
      const lw = widths[i];
      const lx = align === 'left' ? pad : align === 'right' ? pad + maxW - lw : pad + (maxW - lw) / 2;
      const ly = pad + (i + 0.5) * lh;
      if (R.outline) {
        x.lineWidth = R.outline * res;
        x.strokeText(l, lx * res, ly * res);
      } else x.fillText(l, lx * res, ly * res);
    });
    const im = x.getImageData(0, 0, c.width, c.height).data;
    const cw = c.width, ch = c.height, wt = new Float32Array(cw * ch);
    for (let i = 0; i < wt.length; i++) {
      const a = im[i * 4 + 3] / 255;
      wt[i] = a > 0.08 ? a : 0;
    }
    const P = new Pts(cnt);
    const anchor = R.anchor || 'center';
    const ox = anchor === 'left' ? pad : anchor === 'right' ? pad + maxW : pad + maxW / 2;
    const oy = pad + (lines.length * lh) / 2;
    samplePixels(wt, cw, ch, cnt, rnd, (sx, sy) => {
      const wx = sx / res - ox, wy = -(sy / res - oy);
      const line = Math.floor((sy / res - pad) / lh);
      P.add(wx, wy, 0, 1, null, 0, 0, 1, line);
    });
    return P;
  };

  GEN.canvas = (R, cnt, rnd) => {
    const res = R.res || 1, w = R.w || 800, h = R.h || 800;
    const [c, x] = canvas2d(w * res, h * res);
    x.scale(res, res);
    x.fillStyle = '#fff';
    x.strokeStyle = '#fff';
    R.draw(x, w, h);
    const im = x.getImageData(0, 0, c.width, c.height).data;
    const cw = c.width, ch = c.height, wt = new Float32Array(cw * ch);
    for (let i = 0; i < wt.length; i++) {
      const a = im[i * 4 + 3] / 255;
      wt[i] = a > 0.06 ? a : 0;
    }
    const keep = R.color === 'canvas';
    const P = new Pts(cnt);
    samplePixels(wt, cw, ch, cnt, rnd, (sx, sy, p) => {
      const wx = sx / res - w / 2, wy = -(sy / res - h / 2);
      if (keep) {
        const k = p * 4;
        P.add(wx, wy, 0, 1, s2l(im[k] / 255), s2l(im[k + 1] / 255), s2l(im[k + 2] / 255), 1);
      } else P.add(wx, wy, 0, 1);
    });
    return P;
  };

  const s2l = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

  GEN.image = (R, cnt, rnd) => {
    const rec = Tg.img(R.img);
    const P = new Pts(cnt);
    if (!rec.img) return P;
    const iw = rec.img.naturalWidth, ih = rec.img.naturalHeight;
    const res = R.res || 480, W = res, H = Math.max(1, Math.round((res * ih) / iw));
    const [c, x] = canvas2d(W, H);
    x.drawImage(rec.img, 0, 0, W, H);
    const im = x.getImageData(0, 0, W, H).data;
    const thr = R.thr != null ? R.thr : 0.08, gam = R.gamma || 1.4;
    const wt = new Float32Array(W * H), lum = new Float32Array(W * H);
    for (let i = 0; i < W * H; i++) {
      const r = s2l(im[i * 4] / 255), g = s2l(im[i * 4 + 1] / 255), b = s2l(im[i * 4 + 2] / 255);
      let l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      if (R.invert) l = 1 - l;
      lum[i] = l;
      const v = (l - thr) / (1 - thr);
      wt[i] = v > 0 ? Math.pow(v, gam) * (im[i * 4 + 3] / 255) : 0;
    }
    const wW = R.w || 1600, sc = wW / W;
    const useImg = !R.color || R.color === 'image';
    const chroma = R.chroma != null ? R.chroma : 1;
    samplePixels(wt, W, H, cnt, rnd, (sx, sy, p) => {
      const wx = (sx - W / 2) * sc, wy = -(sy - H / 2) * sc;
      if (useImg) {
        const k = p * 4, l = Math.max(lum[p], 0.02);
        let r = s2l(im[k] / 255), g = s2l(im[k + 1] / 255), b = s2l(im[k + 2] / 255);

        const f = (0.4 + 0.6 * Math.sqrt(l)) / l;
        r *= f;
        g *= f;
        b *= f;
        const m = (r + g + b) / 3;
        P.add(wx, wy, 0, 1, m + (r - m) * chroma, m + (g - m) * chroma, m + (b - m) * chroma, 1, lum[p]);
      } else P.add(wx, wy, 0, 1, null, 0, 0, 1, lum[p]);
    });
    return P;
  };

  GEN.ring = (R, cnt, rnd) => {
    const P = new Pts(cnt), r = R.r || 400, w = R.w != null ? R.w : 6;
    const a0 = (R.arc ? R.arc[0] : 0) * U.deg, a1 = (R.arc ? R.arc[1] : 360) * U.deg;
    const zw = R.zw != null ? R.zw : w * 0.5;
    for (let i = 0; i < cnt; i++) {
      const u = (i + rnd()) / cnt, a = a0 + (a1 - a0) * u;
      const rr = r + U.gauss(rnd) * w;
      P.add(Math.cos(a) * rr, Math.sin(a) * rr, U.gauss(rnd) * zw, 1, null, 0, 0, 1, u);
    }
    return P;
  };

  GEN.disk = (R, cnt, rnd) => {
    const P = new Pts(cnt), r = R.r || 400, r0 = R.r0 || 0;
    for (let i = 0; i < cnt; i++) {
      const a = rnd() * U.TAU, rr = Math.sqrt(r0 * r0 + rnd() * (r * r - r0 * r0));
      P.add(Math.cos(a) * rr, Math.sin(a) * rr, U.gauss(rnd) * (R.zw || 0), 1, null, 0, 0, 1, rr / r);
    }
    return P;
  };

  GEN.sphere = (R, cnt, rnd) => {
    const P = new Pts(cnt), r = R.r || 300, w = R.w != null ? R.w : 4;
    for (let i = 0; i < cnt; i++) {
      const zz = rnd() * 2 - 1, a = rnd() * U.TAU, s = Math.sqrt(1 - zz * zz);
      const rr = R.shell === false ? r * Math.cbrt(rnd()) : r + U.gauss(rnd) * w;
      P.add(Math.cos(a) * s * rr, zz * rr, Math.sin(a) * s * rr, 1, null, 0, 0, 1, (zz + 1) / 2);
    }
    return P;
  };

  GEN.galaxy = (R, cnt, rnd) => {
    const P = new Pts(cnt), r = R.r || 900, arms = R.arms || 2, tw = R.twist != null ? R.twist : 3.2;
    const th = R.thick || 26, core = R.core != null ? R.core : 0.16, spr = R.spread != null ? R.spread : 0.42;
    const cc = U.lin(R.colCore || '#ffd9a0', R.mulCore || 1.6), ca = U.lin(R.colArm || '#7cc6ff', 1.05);
    const cd = U.lin(R.colDust || '#ff9a6a', 0.9);
    for (let i = 0; i < cnt; i++) {
      if (rnd() < core) {
        const rr = Math.abs(U.gauss(rnd)) * r * 0.11, a = rnd() * U.TAU, zz = rnd() * 2 - 1, s = Math.sqrt(1 - zz * zz);
        P.add(Math.cos(a) * s * rr, Math.sin(a) * s * rr, zz * rr * 0.55, 1.05, cc[0], cc[1], cc[2], 1, rr / r);
        continue;
      }
      const t = Math.pow(rnd(), 0.72), rr = t * r;
      const arm = Math.floor(rnd() * arms);
      const sp = spr * (1 - t * 0.45);
      const a = (arm / arms) * U.TAU + t * tw * Math.PI + U.gauss(rnd) * sp;
      const g = 1 + t * 1.5;
      const x = Math.cos(a) * rr + U.gauss(rnd) * th * g, y = Math.sin(a) * rr + U.gauss(rnd) * th * g;
      const k = U.smooth(0.05, 0.75, t);
      let c = U.mixc(cc, ca, k);
      if (rnd() < 0.08) c = U.mixc(c, cd, 0.7);
      const f = 0.55 + 0.45 * (1 - t);
      P.add(x, y, U.gauss(rnd) * th * 0.7, 1, c[0] * f, c[1] * f, c[2] * f, 1, t);
    }
    return P;
  };

  GEN.network = (R, cnt, rnd) => {
    const P = new Pts(cnt);
    let nodes = R.nodes;
    if (!nodes) {
      const n = R.count || 48, b = R.box || [1400, 800, 300];
      nodes = [];
      for (let i = 0; i < n * 8 && nodes.length < n; i++) {
        const q = [(rnd() - 0.5) * b[0], (rnd() - 0.5) * b[1], (rnd() - 0.5) * b[2]];
        const md = (R.minD || 0.55) * Math.sqrt((b[0] * b[1]) / n);
        if (nodes.every((o) => Math.hypot(o[0] - q[0], o[1] - q[1]) > md)) nodes.push(q);
      }
    }
    const k = R.k || 3, links = [], seen = new Set();
    nodes.forEach((a, i) => {
      const ds = nodes.map((b, j) => [j, Math.hypot(a[0] - b[0], a[1] - b[1], (a[2] || 0) - (b[2] || 0))]).filter((e) => e[0] !== i);
      ds.sort((p, q) => p[1] - q[1]);
      for (let m = 0; m < Math.min(k, ds.length); m++) {
        const j = ds[m][0], key = i < j ? i + ',' + j : j + ',' + i;
        if (!seen.has(key)) {
          seen.add(key);
          links.push([i, j, ds[m][1]]);
        }
      }
    });
    const hub = nodes.map(() => 0.6 + Math.pow(rnd(), 3) * (R.hub || 2.4));
    const nf = R.nodeFrac != null ? R.nodeFrac : 0.32, nr = R.nodeR || 9, lw = R.lw != null ? R.lw : 1.6;
    const nN = Math.round(cnt * nf), hubSum = hub.reduce((a, b) => a + b, 0);
    for (let i = 0; i < nN; i++) {
      let u = rnd() * hubSum, j = 0;
      while (j < nodes.length - 1 && (u -= hub[j]) > 0) j++;
      const a = nodes[j], rr = nr * Math.sqrt(hub[j]);
      P.add(a[0] + U.gauss(rnd) * rr, a[1] + U.gauss(rnd) * rr, (a[2] || 0) + U.gauss(rnd) * rr, 1.15, null, 0, 0, 1, 0);
    }
    const total = links.reduce((s, l) => s + l[2], 0) || 1;
    const nL = cnt - nN;
    for (let i = 0; i < nL; i++) {
      let u = ((i + rnd()) / nL) * total, m = 0;
      while (m < links.length - 1 && (u -= links[m][2]) > 0) m++;
      const l = links[m], a = nodes[l[0]], b = nodes[l[1]], t = rnd();
      P.add(
        U.lerp(a[0], b[0], t) + U.gauss(rnd) * lw, U.lerp(a[1], b[1], t) + U.gauss(rnd) * lw,
        U.lerp(a[2] || 0, b[2] || 0, t) + U.gauss(rnd) * lw, 0.7, null, 0, 0, 0.8, t,
      );
    }
    P.nodes = nodes;
    P.links = links;
    return P;
  };

  GEN.grid = (R, cnt, rnd) => {
    const P = new Pts(cnt), cols = R.cols || 20, rows = R.rows || 10;
    const w = R.w || 1400, h = R.h || 700, dot = R.dot != null ? R.dot : 4;
    const sites = cols * rows;
    for (let i = 0; i < cnt; i++) {
      const s = Math.floor(((i + 0.5) / cnt) * sites), cx = s % cols, cy = (s / cols) | 0;
      const x = cols > 1 ? (cx / (cols - 1) - 0.5) * w : 0, y = rows > 1 ? (0.5 - cy / (rows - 1)) * h : 0;
      P.add(x + U.gauss(rnd) * dot, y + U.gauss(rnd) * dot, U.gauss(rnd) * dot * 0.5, 1, null, 0, 0, 1, s / sites);
    }
    return P;
  };

  function smoothPath(pts, seg) {
    const out = [];
    const n = pts.length;
    for (let i = 0; i < n - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
      for (let s = 0; s < seg; s++) {
        const t = s / seg, t2 = t * t, t3 = t2 * t;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1]), f(p0[2] || 0, p1[2] || 0, p2[2] || 0, p3[2] || 0)]);
      }
    }
    out.push(pts[n - 1].slice());
    return out;
  }
  Tg.smoothPath = smoothPath;

  GEN.line = (R, cnt, rnd) => {
    const P = new Pts(cnt);
    let pts = R.pts.map((p) => [p[0], p[1], p[2] || 0]);
    if (R.closed) pts.push(pts[0].slice());
    if (R.curve) pts = smoothPath(pts, 24);
    const L = [0];
    for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]));
    const tot = L[L.length - 1] || 1, w = R.w != null ? R.w : 2;
    let seg = 1;
    for (let i = 0; i < cnt; i++) {
      const u = (i + rnd()) / cnt, d = u * tot;
      while (seg < L.length - 1 && L[seg] < d) seg++;
      const a = pts[seg - 1], b = pts[seg], t = (d - L[seg - 1]) / Math.max(1e-6, L[seg] - L[seg - 1]);
      const ww = R.taper ? w * Math.sin(Math.PI * u) : w;
      P.add(U.lerp(a[0], b[0], t) + U.gauss(rnd) * ww, U.lerp(a[1], b[1], t) + U.gauss(rnd) * ww, U.lerp(a[2], b[2], t) + U.gauss(rnd) * ww, 1, null, 0, 0, 1, u);
    }
    return P;
  };

  GEN.helix = (R, cnt, rnd) => {
    const P = new Pts(cnt), r = R.r || 120, len = R.len || 900, turns = R.turns || 4, st = R.strands || 2;
    const w = R.w != null ? R.w : 3, rungF = R.rungs != null ? R.rungs : 0.18;
    const ax = R.axis === 'x';
    const put = (a, l, rr, s, al, u) => {
      const c = Math.cos(a) * rr, z = Math.sin(a) * rr;
      if (ax) P.add(l, c, z, s, null, 0, 0, al, u);
      else P.add(c, l, z, s, null, 0, 0, al, u);
    };
    for (let i = 0; i < cnt; i++) {
      const u = rnd(), l = (u - 0.5) * len;
      const base = u * turns * U.TAU;
      if (rnd() < rungF) {
        const nR = turns * 10, ri = Math.round(u * nR) / nR, lb = (ri - 0.5) * len, ab = ri * turns * U.TAU;
        const t = rnd() * 2 - 1;
        put(ab, lb + U.gauss(rnd) * w, r * t, 0.7, 0.65, ri);
      } else {
        const s = Math.floor(rnd() * st);
        put(base + (s / st) * U.TAU + U.gauss(rnd) * 0.02, l + U.gauss(rnd) * w, r + U.gauss(rnd) * w, 1, 1, u);
      }
    }
    return P;
  };

  GEN.scatter = (R, cnt, rnd) => {
    const P = new Pts(cnt), b = R.box || [3000, 1800, 1600];
    for (let i = 0; i < cnt; i++) {
      if (R.gauss) P.add(U.gauss(rnd) * b[0] * 0.5, U.gauss(rnd) * b[1] * 0.5, U.gauss(rnd) * b[2] * 0.5, 1);
      else P.add((rnd() - 0.5) * b[0], (rnd() - 0.5) * b[1], (rnd() - 0.5) * b[2], 1);
    }
    return P;
  };

  GEN.bars = (R, cnt, rnd) => {
    const P = new Pts(cnt), v = R.values || [1], w = R.w || 1000, h = R.h || 600;
    const gap = R.gap != null ? R.gap : 0.35, mx = R.max || Math.max(...v), nb = v.length;
    const bw = w / (nb + (nb - 1) * gap), mn = R.min || 2;
    const hs = v.map((x) => Math.max(mn, (x / mx) * h)), area = hs.reduce((a, b) => a + b, 0);
    const cols = (R.colors || []).map((c) => U.lin(c, R.mul || 1));
    for (let i = 0; i < cnt; i++) {
      let u = rnd() * area, b = 0;
      while (b < nb - 1 && (u -= hs[b]) > 0) b++;
      const x0 = -w / 2 + b * bw * (1 + gap);
      const c = cols[b];
      const y = -h / 2 + rnd() * hs[b];
      if (c) P.add(x0 + rnd() * bw, y, U.gauss(rnd) * 2, 1, c[0], c[1], c[2], 1, b);
      else P.add(x0 + rnd() * bw, y, U.gauss(rnd) * 2, 1, null, 0, 0, 1, b);
    }
    return P;
  };

  GEN.points = (R, cnt, rnd) => {
    const P = new Pts(cnt), pts = R.pts || [], cl = R.cluster || 0;
    if (!pts.length) return P;
    const per = cl ? Math.max(1, Math.floor(cnt / pts.length)) : 1;
    pts.forEach((p, i) => {
      for (let j = 0; j < per; j++) {
        const g = cl ? [U.gauss(rnd) * cl, U.gauss(rnd) * cl, U.gauss(rnd) * cl] : [0, 0, 0];
        P.add(p[0] + g[0], p[1] + g[1], (p[2] || 0) + g[2], p[3] || 1, null, 0, 0, 1, i / pts.length);
      }
    });
    return P;
  };

  GEN.fn = (R, cnt, rnd) => {
    const P = new Pts(cnt);
    R.fn(P, cnt, rnd, U);
    return P;
  };

  GEN.none = () => new Pts(1);

  GEN.mix = (R, cnt, rnd) => {
    const parts = R.parts || [], ws = R.weights || parts.map(() => 1);
    const tot = ws.reduce((a, b) => a + b, 0) || 1;
    const P = new Pts(cnt);
    let used = 0;
    parts.forEach((part, i) => {
      const c = i === parts.length - 1 ? cnt - used : Math.round((cnt * ws[i]) / tot);
      used += c;
      if (c > 0) P.append(finished(part, c, false));
    });
    return P;
  };

  function keyOf(P, sort, rnd) {
    const n = P.n, d = P.d, k = new Float64Array(n);
    const neg = sort[0] === '-', s = neg ? sort.slice(1) : sort;
    if (s === 'read') {
      let mnx = Infinity, mxx = -Infinity;
      for (let i = 0; i < n; i++) {
        mnx = Math.min(mnx, d[i * 8]);
        mxx = Math.max(mxx, d[i * 8]);
      }
      const span = mxx - mnx + 1;
      for (let i = 0; i < n; i++) k[i] = P.aux[i] * span + (d[i * 8] - mnx);
    } else
      for (let i = 0; i < n; i++) {
        const x = d[i * 8], y = d[i * 8 + 1], z = d[i * 8 + 2];
        k[i] =
          s === 'x' ? x : s === 'y' ? y : s === 'z' ? z : s === 'radial' ? Math.hypot(x, y, z) : s === 'angle' ? Math.atan2(y, x)
            : s === 'path' ? P.aux[i] : s === 'random' ? rnd() : rnd();
      }
    if (neg) for (let i = 0; i < n; i++) k[i] = -k[i];
    return k;
  }
  function sortPts(P, sort, rnd) {
    const n = P.n;
    if (n < 2 || !sort) return P;
    const k = keyOf(P, sort, rnd);
    let mn = Infinity, mx = -Infinity;
    for (let i = 0; i < n; i++) {
      if (k[i] < mn) mn = k[i];
      if (k[i] > mx) mx = k[i];
    }
    const span = mx - mn || 1, IDX = 1048576;
    const pk = new Float64Array(n);
    for (let i = 0; i < n; i++) pk[i] = Math.floor(((k[i] - mn) / span) * 1073741823) * IDX + i;
    pk.sort();
    const d = P.d, a = P.aux, nd = new Float32Array(d.length), na = new Float32Array(a.length);
    for (let i = 0; i < n; i++) {
      const j = pk[i] % IDX;
      nd.set(d.subarray(j * 8, j * 8 + 8), i * 8);
      na[i] = a[j];
    }
    P.d = nd;
    P.aux = na;
    return P;
  }

  function colorOf(c, mul) {
    if (c == null) return null;
    if (Array.isArray(c)) return c.map((v) => v * mul);
    return U.lin(c, mul);
  }
  function colorize(P, R, rnd, force) {
    const mul = R.mul != null ? R.mul : 1;
    const hasSpec = R.color != null || R.stops != null;
    if (!hasSpec && !force) return;
    const n = P.n, d = P.d;
    let stops = null;
    if (R.stops) stops = R.stops.map((s) => [s[0], colorOf(s[1], mul)]);
    else {
      const c1 = colorOf(R.color && R.color !== 'image' && R.color !== 'canvas' ? R.color : null, mul) || DEFAULT_COL.map((v) => v * mul);
      const c2 = colorOf(R.color2, mul);
      stops = c2 ? [[0, c1], [1, c2]] : [[0, c1]];
    }
    let gk = null;
    if (stops.length > 1) {
      const g = R.grad || 'x';
      gk = keyOf(P, g === 'random' ? 'random' : g, rnd);
      let mn = Infinity, mx = -Infinity;
      for (let i = 0; i < n; i++) {
        if (d[i * 8 + 4] >= 0) continue;
        mn = Math.min(mn, gk[i]);
        mx = Math.max(mx, gk[i]);
      }
      const sp = mx - mn || 1;
      for (let i = 0; i < n; i++) gk[i] = (gk[i] - mn) / sp;
    }
    const tmp = [0, 0, 0];
    for (let i = 0; i < n; i++) {
      const k = i * 8;
      if (d[k + 4] >= 0) continue;
      let c = stops[0][1];
      if (gk) {
        const t = gk[i];
        let j = 0;
        while (j < stops.length - 2 && t > stops[j + 1][0]) j++;
        const a = stops[j], b = stops[j + 1];
        const f = U.clamp((t - a[0]) / Math.max(1e-6, b[0] - a[0]));
        tmp[0] = U.lerp(a[1][0], b[1][0], f);
        tmp[1] = U.lerp(a[1][1], b[1][1], f);
        tmp[2] = U.lerp(a[1][2], b[1][2], f);
        c = tmp;
      }
      d[k + 4] = c[0];
      d[k + 5] = c[1];
      d[k + 6] = c[2];
    }
  }
  function decorate(P, R, rnd) {
    const n = P.n, d = P.d;
    const jit = R.jitter || 0, dep = R.depth || 0, sv = R.sizeVar || 0, sp = R.sparkle || 0;
    const sz = R.size != null ? R.size : 1, al = R.alpha != null ? R.alpha : 1;
    for (let i = 0; i < n; i++) {
      const k = i * 8;
      if (jit) {
        d[k] += (rnd() * 2 - 1) * jit;
        d[k + 1] += (rnd() * 2 - 1) * jit;
      }
      if (dep) d[k + 2] += U.gauss(rnd) * dep;
      let s = d[k + 3] * sz;
      if (sv) s *= Math.max(0.15, 1 + (rnd() * 2 - 1) * sv);
      if (sp && rnd() < sp) {
        s *= 1.8 + rnd() * 1.6;
        d[k + 4] *= 2.6;
        d[k + 5] *= 2.6;
        d[k + 6] *= 2.6;
      }
      d[k + 3] = s;
      d[k + 7] *= al;
    }
  }
  function transform(P, at) {
    if (!at) return;
    const s = at.s != null ? at.s : 1, x = at.x || 0, y = at.y || 0, z = at.z || 0;
    const R = at.rx || at.ry || at.rz ? KS.Particles.rot3(at.rx || 0, at.ry || 0, at.rz || 0) : null;
    const d = P.d;
    for (let i = 0; i < P.n; i++) {
      const k = i * 8;
      let px = d[k] * s, py = d[k + 1] * s, pz = d[k + 2] * s;
      if (R) {
        const X = R[0] * px + R[1] * py + R[2] * pz, Y = R[3] * px + R[4] * py + R[5] * pz, Z = R[6] * px + R[7] * py + R[8] * pz;
        px = X;
        py = Y;
        pz = Z;
      }
      d[k] = px + x;
      d[k + 1] = py + y;
      d[k + 2] = pz + z;
      if (at.size) d[k + 3] *= at.size;
    }
  }

  function finished(R, cnt, top) {
    const gen = GEN[R.type];
    if (!gen) {
      console.warn('[KS.Tg] unknown target type', R.type);
      return new Pts(1);
    }
    const rnd = U.rng(R.seed != null ? R.seed : (U.hashStr(R.type + (R.text || R.img || '')) % 99991) + 7);
    const P = gen(R, cnt, rnd);
    colorize(P, R, rnd, top);
    decorate(P, R, rnd);
    transform(P, R.at);
    return P;
  }

  function pending(R) {
    if (!R) return null;
    if (R.type === 'text') {
      const font = R.font || '600 160px "Noto Serif JP"';
      if (document.fonts && !document.fonts.check(font, R.text || 'a')) return document.fonts.load(font, R.text || 'a');
    }
    if (R.type === 'canvas' && R.fonts && document.fonts) {
      const miss = R.fonts.filter((f) => !document.fonts.check(f));
      if (miss.length) return Promise.all(miss.map((f) => document.fonts.load(f)));
    }
    if (R.type === 'image') {
      const r = Tg.img(R.img);
      if (!r.ready) return r.p;
    }
    if (R.type === 'mix') {
      const ps = (R.parts || []).map(pending).filter(Boolean);
      if (ps.length) return Promise.all(ps);
    }
    return null;
  }

  function build(e, R, N) {
    const cnt = Math.max(1, Math.min(N, R.n || N));
    const P = finished(R, cnt, true);
    sortPts(P, R.sort || 'random', U.rng(77));
    e.n = P.n;
    e.d = P.d.subarray(0, P.n * 8);
    e.aux = P.aux.subarray(0, P.n);
    if (P.nodes) {
      e.nodes = P.nodes;
      e.links = P.links;
    }
    e.ready = true;
  }

  Tg.resolve = (R, N) => {
    const key = (R.key || JSON.stringify(R)) + '|' + N;
    let e = LRU.get(key);
    if (e) {
      LRU.delete(key);
      LRU.set(key, e);
      return e;
    }
    e = { n: 0, d: new Float32Array(8), ready: false, p: null, key };
    LRU.set(key, e);
    while (LRU.size > MAX) LRU.delete(LRU.keys().next().value);
    let tries = 0;
    const tryBuild = () => {
      const w = tries++ < 4 ? pending(R) : null;
      if (w) return w.then(tryBuild, tryBuild);
      try {
        build(e, R, N);
      } catch (err) {
        console.error('[KS.Tg] build failed', R, err);
        e.ready = true;
      }
      return e;
    };
    const w = pending(R);
    if (w) e.p = w.then(tryBuild, tryBuild);
    else {
      tryBuild();
      e.p = Promise.resolve(e);
    }
    return e;
  };
  Tg.prep = (R, N) => Tg.resolve(R, N || KS.swarmN || 65536);
  Tg.clear = () => LRU.clear();
})();
