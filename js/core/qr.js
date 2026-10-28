(function () {
  'use strict';
  const KS = window.KS;

  const EC = {
    L: [[26, 7, 1, 19, 0, 0], [44, 10, 1, 34, 0, 0], [70, 15, 1, 55, 0, 0], [100, 20, 1, 80, 0, 0], [134, 26, 1, 108, 0, 0],
      [172, 18, 2, 68, 0, 0], [196, 20, 2, 78, 0, 0], [242, 24, 2, 97, 0, 0], [292, 30, 2, 116, 0, 0], [346, 18, 2, 68, 2, 69]],
    M: [[26, 10, 1, 16, 0, 0], [44, 16, 1, 28, 0, 0], [70, 26, 1, 44, 0, 0], [100, 18, 2, 32, 0, 0], [134, 24, 2, 43, 0, 0],
      [172, 16, 4, 27, 0, 0], [196, 18, 4, 31, 0, 0], [242, 22, 2, 38, 2, 39], [292, 22, 3, 36, 2, 37], [346, 26, 4, 43, 1, 44]],
    Q: [[26, 13, 1, 13, 0, 0], [44, 22, 1, 22, 0, 0], [70, 18, 2, 17, 0, 0], [100, 26, 2, 24, 0, 0], [134, 18, 2, 15, 2, 16],
      [172, 24, 4, 19, 0, 0], [196, 18, 2, 14, 4, 15], [242, 22, 4, 18, 2, 19], [292, 20, 4, 16, 4, 17], [346, 24, 6, 19, 2, 20]],
    H: [[26, 17, 1, 9, 0, 0], [44, 28, 1, 16, 0, 0], [70, 22, 2, 13, 0, 0], [100, 16, 4, 9, 0, 0], [134, 22, 2, 11, 2, 12],
      [172, 28, 4, 15, 0, 0], [196, 26, 4, 13, 1, 14], [242, 26, 4, 14, 2, 15], [292, 24, 4, 12, 4, 13], [346, 28, 6, 15, 2, 16]],
  };
  const ALIGN = [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];
  const ECC_BITS = { L: 1, M: 0, Q: 3, H: 2 };

  const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
  for (let i = 0, x = 1; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  const mul = (a, b) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);
  function generator(n) {
    let g = [1];
    for (let i = 0; i < n; i++) {
      const ng = new Array(g.length + 1).fill(0);
      for (let j = 0; j < g.length; j++) {
        ng[j] ^= g[j];
        ng[j + 1] ^= mul(g[j], EXP[i]);
      }
      g = ng;
    }
    return g;
  }
  function rsEncode(data, n) {
    const g = generator(n), r = new Array(n).fill(0);
    for (const d of data) {
      const f = d ^ r[0];
      r.shift();
      r.push(0);
      for (let j = 0; j < n; j++) r[j] ^= mul(g[j + 1], f);
    }
    return r;
  }

  function utf8(s) {
    if (typeof TextEncoder !== 'undefined') return Array.from(new TextEncoder().encode(s));
    return Array.from(unescape(encodeURIComponent(s)), (c) => c.charCodeAt(0));
  }
  function codewords(bytes, ver, ecc) {
    const [, ecn, b1, d1, b2, d2] = EC[ecc][ver - 1];
    const cap = b1 * d1 + b2 * d2;
    const bits = [];
    const put = (v, n) => {
      for (let i = n - 1; i >= 0; i--) bits.push((v >>> i) & 1);
    };
    put(4, 4);
    put(bytes.length, ver < 10 ? 8 : 16);
    for (const b of bytes) put(b, 8);
    put(0, Math.min(4, cap * 8 - bits.length));
    while (bits.length % 8) bits.push(0);
    const data = [];
    for (let i = 0; i < bits.length; i += 8) {
      let v = 0;
      for (let j = 0; j < 8; j++) v = (v << 1) | bits[i + j];
      data.push(v);
    }
    for (let pad = 0; data.length < cap; pad ^= 1) data.push(pad ? 0x11 : 0xec);

    const blocks = [];
    let k = 0;
    for (let i = 0; i < b1 + b2; i++) {
      const len = i < b1 ? d1 : d2, d = data.slice(k, k + len);
      k += len;
      blocks.push({ d, e: rsEncode(d, ecn) });
    }
    const out = [];
    const maxD = Math.max(d1, d2);
    for (let i = 0; i < maxD; i++) for (const b of blocks) if (i < b.d.length) out.push(b.d[i]);
    for (let i = 0; i < ecn; i++) for (const b of blocks) out.push(b.e[i]);
    return out;
  }
  function pickVersion(n, ecc) {
    for (let v = 1; v <= 10; v++) {
      const [, , b1, d1, b2, d2] = EC[ecc][v - 1];
      const cap = b1 * d1 + b2 * d2;
      const need = 4 + (v < 10 ? 8 : 16) + 8 * n;
      if (need <= cap * 8) return v;
    }
    throw new Error('KS.qr: text too long for version 10');
  }

  function bch(v, poly, deg) {
    let r = v << deg;
    for (let i = 30; i >= deg; i--) if (r & (1 << i)) r ^= poly << (i - deg);
    return (v << deg) | r;
  }
  const formatBits = (ecc, mask) => bch((ECC_BITS[ecc] << 3) | mask, 0x537, 10) ^ 0x5412;
  const versionBits = (ver) => bch(ver, 0x1f25, 12);
  const MASKS = [
    (x, y) => (x + y) % 2 === 0,
    (x, y) => y % 2 === 0,
    (x) => x % 3 === 0,
    (x, y) => (x + y) % 3 === 0,
    (x, y) => (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0,
    (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
    (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
    (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
  ];

  function base(ver) {
    const n = 17 + 4 * ver;
    const m = new Int8Array(n * n).fill(-1);
    const fn = new Uint8Array(n * n);
    const set = (x, y, v) => {
      if (x < 0 || y < 0 || x >= n || y >= n) return;
      m[y * n + x] = v ? 1 : 0;
      fn[y * n + x] = 1;
    };
    const finder = (cx, cy) => {
      for (let dy = -4; dy <= 4; dy++)
        for (let dx = -4; dx <= 4; dx++) {
          const d = Math.max(Math.abs(dx), Math.abs(dy));
          set(cx + dx, cy + dy, d !== 2 && d !== 4);
        }
    };
    finder(3, 3);
    finder(n - 4, 3);
    finder(3, n - 4);
    for (let i = 8; i < n - 8; i++) {
      set(i, 6, i % 2 === 0);
      set(6, i, i % 2 === 0);
    }
    const al = ALIGN[ver - 1];
    for (const ay of al)
      for (const ax of al) {
        if ((ax === 6 && ay === 6) || (ax === 6 && ay === n - 7) || (ax === n - 7 && ay === 6)) continue;
        for (let dy = -2; dy <= 2; dy++)
          for (let dx = -2; dx <= 2; dx++) set(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }

    for (let i = 0; i < 9; i++) {
      if (!fn[8 * n + i]) set(i, 8, 0);
      if (!fn[i * n + 8]) set(8, i, 0);
    }
    for (let i = 0; i < 8; i++) {
      set(n - 1 - i, 8, 0);
      set(8, n - 1 - i, 0);
    }
    set(8, n - 8, 1);
    if (ver >= 7) {
      const vb = versionBits(ver);
      for (let i = 0; i < 18; i++) {
        const bit = (vb >>> i) & 1, a = Math.floor(i / 3), b = (i % 3) + n - 11;
        set(a, b, bit);
        set(b, a, bit);
      }
    }
    return { n, m, fn, set };
  }
  function placeData(Q, cw) {
    const { n, m, fn } = Q;
    let bit = 0;
    const total = cw.length * 8;
    for (let right = n - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < n; vert++) {
        for (let j = 0; j < 2; j++) {
          const x = right - j;
          const upward = ((right + 1) & 2) === 0;
          const y = upward ? n - 1 - vert : vert;
          const idx = y * n + x;
          if (fn[idx]) continue;
          let v = 0;
          if (bit < total) v = (cw[bit >>> 3] >>> (7 - (bit & 7))) & 1;
          bit++;
          m[idx] = v;
        }
      }
    }
  }
  function writeFormat(Q, ecc, mask) {
    const { n, set } = Q, f = formatBits(ecc, mask);

    for (let i = 0; i <= 5; i++) set(8, i, (f >>> i) & 1);
    set(8, 7, (f >>> 6) & 1);
    set(8, 8, (f >>> 7) & 1);
    set(7, 8, (f >>> 8) & 1);
    for (let i = 9; i < 15; i++) set(14 - i, 8, (f >>> i) & 1);
    for (let i = 0; i < 8; i++) set(n - 1 - i, 8, (f >>> i) & 1);
    for (let i = 8; i < 15; i++) set(8, n - 15 + i, (f >>> i) & 1);
    set(8, n - 8, 1);
  }
  function penalty(n, g) {
    let p = 0;

    for (let y = 0; y < n; y++) {
      for (const axis of [0, 1]) {
        let run = 1;
        for (let i = 1; i < n; i++) {
          const a = axis ? g(y, i) : g(i, y), b = axis ? g(y, i - 1) : g(i - 1, y);
          if (a === b) {
            run++;
            if (run === 5) p += 3;
            else if (run > 5) p += 1;
          } else run = 1;
        }
      }
    }

    for (let y = 0; y < n - 1; y++)
      for (let x = 0; x < n - 1; x++) {
        const c = g(x, y);
        if (c === g(x + 1, y) && c === g(x, y + 1) && c === g(x + 1, y + 1)) p += 3;
      }

    const pat1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0], pat2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
    for (let y = 0; y < n; y++)
      for (let x = 0; x <= n - 11; x++)
        for (const axis of [0, 1]) {
          let ok1 = true, ok2 = true;
          for (let k = 0; k < 11; k++) {
            const v = axis ? g(y, x + k) : g(x + k, y);
            if (v !== pat1[k]) ok1 = false;
            if (v !== pat2[k]) ok2 = false;
            if (!ok1 && !ok2) break;
          }
          if (ok1) p += 40;
          if (ok2) p += 40;
        }

    let dark = 0;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) dark += g(x, y);
    const k = Math.floor(Math.abs((dark * 100) / (n * n) - 50) / 5);
    p += k * 10;
    return p;
  }

  const QR = (KS.qr = {});
  QR.matrix = (text, o = {}) => {
    const ecc = o.ecc || 'M';
    const bytes = utf8(String(text));
    const ver = o.version || pickVersion(bytes.length, ecc);
    const cw = codewords(bytes, ver, ecc);
    let best = null;
    const masks = o.mask != null ? [o.mask] : [0, 1, 2, 3, 4, 5, 6, 7];
    for (const mk of masks) {
      const Q = base(ver);
      placeData(Q, cw);
      const { n, m, fn } = Q, fmask = MASKS[mk];
      for (let y = 0; y < n; y++)
        for (let x = 0; x < n; x++) {
          const i = y * n + x;
          if (!fn[i] && fmask(x, y)) m[i] ^= 1;
        }
      writeFormat(Q, ecc, mk);
      const g = (x, y) => m[y * n + x];
      const pen = penalty(n, g);
      if (!best || pen < best.pen) best = { pen, n, m, mask: mk, ver };
    }
    const { n, m } = best;
    return { size: n, version: best.ver, mask: best.mask, ecc, get: (x, y) => m[y * n + x] === 1 };
  };
  QR.svg = (text, o = {}) => {
    const q = QR.matrix(text, o), quiet = o.quiet != null ? o.quiet : 4, N = q.size + quiet * 2;
    let d = '';
    for (let y = 0; y < q.size; y++) {
      let x = 0;
      while (x < q.size) {
        if (!q.get(x, y)) {
          x++;
          continue;
        }
        let w = 1;
        while (x + w < q.size && q.get(x + w, y)) w++;
        d += 'M' + (x + quiet) + ' ' + (y + quiet) + 'h' + w + 'v1h-' + w + 'z';
        x += w;
      }
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + N + ' ' + N + '" shape-rendering="crispEdges">' +
      (o.light !== null ? '<rect width="' + N + '" height="' + N + '" fill="' + (o.light || '#fff8ec') + '"/>' : '') +
      '<path d="' + d + '" fill="' + (o.dark || '#05070d') + '"/></svg>';
  };
})();
