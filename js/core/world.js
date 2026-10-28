(function () {
  'use strict';
  const KS = window.KS, G = KS.G, U = KS.U, T = KS.T, Dm = KS.D;
  const D = KS.DIST;

  const copy = (o) => {
    const r = {};
    for (const k in o) r[k] = Array.isArray(o[k]) ? o[k].slice() : o[k];
    return r;
  };

  const WD = (KS.world = {
    cam: { x: 0, y: 0, z: 0, roll: 0, dz: 0, bank: 0 },
    sky: KS.skyPreset('void'),
    post: copy(KS.POST),
    dust: copy(KS.DUST),
    amb: { a: 1, x: 12, y: 6 },
    safe: !KS.params.cinema,
    tier: '', q: null, renderer: '',
    s: 1, cw: 1920, ch: 1080, bw: 1920, bh: 1080, px: 1, vfov: 0.7, aspect: 16 / 9,
  });

  const TIERS = {
    high: { name: 'high', scale: 1, maxW: 3840, nebDiv: 2, oct: 6, bloomLv: 6, side: 256, dust: 3000 },
    mid: { name: 'mid', scale: 0.85, maxW: 2560, nebDiv: 2.5, oct: 5, bloomLv: 5, side: 256, dust: 1600 },
    low: { name: 'low', scale: 0.66, maxW: 1920, nebDiv: 3, oct: 4, bloomLv: 4, side: 128, dust: 800 },
  };
  WD.TIERS = TIERS;

  let canvas = null, stage = null, hdr = null;
  const list = [];
  const layers = new Set();

  const isMobile = () => {
    try {
      return (navigator.maxTouchPoints || 0) > 0 || matchMedia('(pointer:coarse)').matches || Math.min(innerWidth, innerHeight) < 700;
    } catch (e) {
      return Math.min(innerWidth, innerHeight) < 700;
    }
  };

  function autoTier() {
    const gl = G.gl;
    if (isMobile()) return 'low';
    let r = '';
    try {
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      r = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    } catch (e) {
      r = '';
    }
    WD.renderer = r;
    if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(r)) return 'low';
    if (!G.cbf) return 'low';
    if (/intel|mali|adreno|powervr|videocore|vivante/i.test(r)) return 'mid';
    return 'high';
  }

  WD.init = (opts) => {
    canvas = opts.canvas;
    stage = opts.stage;
    const ok = G.init(canvas);
    if (!ok) {
      document.body.classList.add('nogl');
      WD.tier = 'none';
      WD.q = TIERS.low;
    } else {
      const want = KS.params.quality;
      WD.tier = TIERS[want] ? want : KS.params.export ? 'high' : autoTier();
      WD.q = TIERS[WD.tier];
      KS.sky.init();
      KS.post.init();
      KS.Plates.init();
      KS.Particles.init();
      KS.Ribbons.init();
      KS.Sprites.init();
      canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        console.error('[KS] WebGL context lost');
        KS.emit('glLost');
      });
    }
    KS.swarmN = WD.q.side * WD.q.side;
    if (G.ok) {
      WD.swarm = KS.Particles.make({ side: WD.q.side, order: 30, o: 0, size: 2.2, wob: 3, seed: 4242 });
      WD.swarm.persistent = true;
      WD.add(WD.swarm);
      KS.dust.count = WD.q.dust;
      WD.add(KS.dust);
    }
    document.body.dataset.tier = WD.tier;
    resize();
    window.addEventListener('resize', resize);
  };

  function resize() {
    const cw = Math.max(1, window.innerWidth), ch = Math.max(1, window.innerHeight);
    const s = Math.min(cw / KS.W, ch / KS.H);
    WD.s = s;
    WD.cw = cw;
    WD.ch = ch;
    stage.style.transform =
      'translate(' + ((cw - KS.W * s) / 2).toFixed(3) + 'px,' + ((ch - KS.H * s) / 2).toFixed(3) + 'px) scale(' + s.toFixed(6) + ')';

    WD.vfov = 2 * Math.atan(ch / s / 2 / D);
    WD.aspect = cw / ch;
    WD.proj = KS.M.perspective(WD.vfov, WD.aspect, 8, 400000);
    if (!G.ok) return;
    applyTier();
    KS.emit('resize', WD);
  }
  function applyTier() {
    const q = WD.q;
    const rawDpr = window.devicePixelRatio || 1;
    const cappedDpr = isMobile() && !KS.params.export ? Math.min(rawDpr, 2) : rawDpr;
    const dpr = cappedDpr * (KS.params.export ? 1 : q.scale);
    let bw = Math.round(WD.cw * dpr), bh = Math.round(WD.ch * dpr);
    const maxPixels = isMobile() && !KS.params.export ? 900000 : 8000000;
    if (bw * bh > maxPixels) {
      const k = Math.sqrt(maxPixels / (bw * bh));
      bw = Math.max(1, Math.round(bw * k));
      bh = Math.max(1, Math.round(bh * k));
    }
    if (bw > q.maxW) {
      bh = Math.round((bh * q.maxW) / bw);
      bw = q.maxW;
    }
    canvas.width = bw;
    canvas.height = bh;
    canvas.style.width = WD.cw + 'px';
    canvas.style.height = WD.ch + 'px';
    G.freeRT(hdr);
    hdr = G.rt(bw, bh, G.hdr, 1);
    KS.sky.resize(bw, bh, q);
    KS.post.resize(bw, bh, q);
    WD.bw = bw;
    WD.bh = bh;
    WD.px = (WD.s * bw) / WD.cw;
  }
  WD.resize = resize;
  WD.setTier = (name) => {
    if (!G.ok || !TIERS[name] || name === WD.tier) return;
    WD.tier = name;

    WD.q = Object.assign({}, TIERS[name], { side: WD.q.side });
    document.body.dataset.tier = name;
    KS.dust.count = WD.q.dust;
    applyTier();
    KS.emit('tier', name);
  };

  WD.add = (d) => {
    if (d && list.indexOf(d) < 0) list.push(d);
    return d;
  };
  WD.remove = (d) => {
    const i = list.indexOf(d);
    if (i >= 0) list.splice(i, 1);
  };
  WD.drawables = list;
  const zOf = (d) => (d.z != null ? d.z : 0) + (d.bz || 0) + (d.m ? d.m.z + (d.m.bz || 0) : 0);
  const byOrder = (a, b) => a.order - b.order || zOf(a) - zOf(b);

  WD.addLayer = (el, anchor, zl = 0) => {
    const rec = { el, a: anchor || [0, 0, 0], zl, o: 1, last: '', lastO: '', hidden: false, fade: true };
    layers.add(rec);
    return rec;
  };
  WD.removeLayer = (rec) => layers.delete(rec);

  WD.project = (x, y, z = 0, out) => {
    const c = ctx.cam, dist = D + c.z - z;
    const k = dist > 1 ? D / dist : 0;
    let sx = (x - c.x) * k, sy = -(y - c.y) * k;
    if (c.roll) {
      const r = c.roll * U.deg, cs = Math.cos(r), sn = Math.sin(r);
      const X = cs * sx - sn * sy, Y = sn * sx + cs * sy;
      sx = X;
      sy = Y;
    }
    out = out || {};
    out.x = KS.W / 2 + sx;
    out.y = KS.H / 2 + sy;
    out.k = k;
    out.vis = dist > 1;
    return out;
  };

  function projectLayers() {
    const c = ctx.cam;
    for (const L of layers) {
      const zl = L.zl, dz = D - zl;
      const dist = D + c.z - L.a[2] - zl;
      const k = dz / Math.max(dist, 1e-3);
      let o = L.o;
      if (L.fade) o *= 1 - U.smooth(2.4, 5, k);
      const hide = dist < 40 || k > 8 || k <= 0 || o <= 0.002;
      if (hide) {
        if (!L.hidden) {
          L.el.style.visibility = 'hidden';
          L.hidden = true;
        }
        continue;
      }
      if (L.hidden) {
        L.el.style.visibility = '';
        L.hidden = false;
      }
      const tx = ((L.a[0] - c.x) * D) / dz, ty = ((c.y - L.a[1]) * D) / dz;
      let tf = '';
      if (c.roll) tf += 'rotate(' + c.roll.toFixed(4) + 'deg) ';
      if (Math.abs(k - 1) > 1e-5) tf += 'scale(' + k.toFixed(5) + ') ';
      if (Math.abs(tx) > 1e-3 || Math.abs(ty) > 1e-3) tf += 'translate(' + tx.toFixed(3) + 'px,' + ty.toFixed(3) + 'px)';
      if (tf !== L.last) {
        L.el.style.transform = tf;
        L.last = tf;
      }
      const os = o >= 0.999 ? '' : o.toFixed(3);
      if (os !== L.lastO) {
        L.el.style.opacity = os;
        L.lastO = os;
      }
    }
  }

  const ctx = (WD.ctx = {
    vp: null, view: null, proj: null, cam: { x: 0, y: 0, z: 0, roll: 0 }, t: 0, px: 1, aspect: 16 / 9,
    q: null, hdr: null, w: 1, h: 1, vel: [0, 0], velZ: 0, safe: true, frozen: false, frame: 0,
    kAt: (z) => D / Math.max(1e-3, D + ctx.cam.z - z),
  });
  const prev = { x: 0, y: 0, z: 0, init: false };
  const VMAX = 4200;

  function camera(dt) {
    const c = WD.cam, e = ctx.cam, clk = KS.clock, a = WD.amb;
    let ax = 0, ay = 0;
    if (!clk.frozen && a.a > 0) {
      const t = clk.t;
      ax = a.a * a.x * (Math.sin(t * 0.071 * U.TAU) * 0.6 + Math.sin(t * 0.033 * U.TAU + 1.3) * 0.4);
      ay = a.a * a.y * (Math.sin(t * 0.053 * U.TAU + 0.7) * 0.6 + Math.sin(t * 0.029 * U.TAU + 2.1) * 0.4);
    }

    const cz = c.z + (c.dz || 0);
    e.x = c.x + ax;
    e.y = c.y + ay;
    e.z = cz;
    e.roll = (c.roll || 0) + (c.bank || 0);
    if (clk.frozen || !prev.init || dt <= 0) {
      ctx.vel[0] = ctx.vel[1] = ctx.velZ = 0;
    } else {
      const f = 1 - Math.exp(-dt * 10);
      ctx.vel[0] += ((c.x - prev.x) / dt - ctx.vel[0]) * f;
      ctx.vel[1] += ((c.y - prev.y) / dt - ctx.vel[1]) * f;
      ctx.velZ += ((cz - prev.z) / dt - ctx.velZ) * f;

      const vm = Math.hypot(ctx.vel[0], ctx.vel[1]);
      if (vm > VMAX) {
        ctx.vel[0] *= VMAX / vm;
        ctx.vel[1] *= VMAX / vm;
      }
      ctx.velZ = U.clamp(ctx.velZ, -VMAX, VMAX);
    }
    prev.x = c.x;
    prev.y = c.y;
    prev.z = cz;
    prev.init = true;
    ctx.view = KS.M.view(e.x, e.y, D + e.z, e.roll * U.deg);
    ctx.proj = WD.proj;
    ctx.vp = KS.M.mul(ctx.proj, ctx.view);
    ctx.t = clk.t;
    ctx.frozen = clk.frozen;
    ctx.frame = clk.frame;
    ctx.px = WD.px;
    ctx.aspect = WD.aspect;
    ctx.q = WD.q;
    ctx.w = WD.bw;
    ctx.h = WD.bh;
    ctx.hdr = hdr;
    ctx.safe = WD.safe || KS.params.export;
  }

  function render() {
    KS.sky.render(ctx);
    G.bind(hdr);
    const sorted = list.slice().sort(byOrder);
    for (let i = 0; i < sorted.length; i++) {
      try {
        sorted[i].draw(ctx);
      } catch (e) {
        console.error('[KS] draw', sorted[i], e);
        WD.remove(sorted[i]);
      }
    }
    KS.post.render(ctx);
  }

  WD.step = (dt) => {
    T.update(KS.clock.t);
    KS.emit('update', dt);
    for (let i = 0; i < list.length; i++) if (list[i].update) list[i].update(dt);
    camera(dt);
    projectLayers();
    Dm.flush();
    if (G.ok && !WD.lost) render();
    KS.emit('frame', dt);
  };

  let last = 0, ema = 16.7, slow = 0, steps = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    const clk = KS.clock;
    const raw = last ? now - last : 16.7;
    last = now;
    if (clk.frozen) return;
    const dt = Math.min(0.1, raw / 1000);
    clk.dt = dt;
    clk.t += dt;
    clk.frame++;
    WD.step(dt);

    if (!KS.params.quality && !KS.params.export && raw < 120 && G.ok) {
      ema += (raw - ema) * 0.05;
      slow = ema > 22 ? slow + dt : Math.max(0, slow - dt * 0.5);
      if (slow > 3 && steps < 2) {
        steps++;
        slow = 0;
        ema = 16.7;
        const next = WD.tier === 'high' ? 'mid' : 'low';
        console.warn('[KS] frame time high, quality ->', next);
        WD.setTier(next);
        KS.emit('toast', '描画品質を自動調整しました（' + next + '）');
      }
    }
  }

  WD.cut = () => {
    prev.init = false;
    ctx.vel[0] = ctx.vel[1] = ctx.velZ = 0;
  };
  WD.start = () => requestAnimationFrame(loop);
  WD.fps = () => 1000 / ema;
  KS.on('glLost', () => (WD.lost = true));
})();
