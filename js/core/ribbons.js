(function () {
  'use strict';
  const KS = window.KS, G = KS.G, U = KS.U;
  const RB = (KS.Ribbons = {});
  let prog = null;

  const VS = `
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aPrev;
layout(location=2) in vec3 aNext;
layout(location=3) in vec4 aU;    // u, side, width, delay
layout(location=4) in vec4 aC;    // rgb, phase
layout(location=5) in vec3 aT;    // own window t0, t1 (unused when equal), glow width scale
uniform mat4 uVP, uM;
uniform vec2 uRes;               // half drawing buffer px
uniform float uPx, uTime, uWave, uWaveF, uWaveS, uGlowW;
out float vU; out float vD; out float vW; out vec3 vCol; out float vDelay; out float vPhase; out vec3 vT;
vec3 wav(vec3 p, float u, float ph){
  if (uWave == 0.) return p;
  float a = sin(u * uWaveF * 6.2832 + uTime * uWaveS + ph * 6.2832);
  float b = sin(u * uWaveF * 3.7 + uTime * uWaveS * .63 + ph * 11.);
  float env = sin(3.14159 * clamp(u, 0., 1.));
  return p + vec3(0., (a * .7 + b * .3) * uWave * env, (b - a) * .3 * uWave * env);
}
void main(){
  float u = aU.x, side = aU.y;
  vec3 P = wav(aPos, u, aC.w), Pp = wav(aPrev, u - .003, aC.w), Pn = wav(aNext, u + .003, aC.w);
  vec4 c = uVP * uM * vec4(P, 1.), cp = uVP * uM * vec4(Pp, 1.), cn = uVP * uM * vec4(Pn, 1.);
  float cw = max(c.w, 1.);
  vec2 s = c.xy / cw * uRes, sp = cp.xy / max(cp.w, 1.) * uRes, sn = cn.xy / max(cn.w, 1.) * uRes;
  vec2 dir = sn - sp;
  if (dot(dir, dir) < 1e-6) dir = vec2(1., 0.);
  dir = normalize(dir);
  vec2 nrm = vec2(-dir.y, dir.x);
  float wpx = aU.z * 1483.6 / cw * uPx * .5;     // core half width, device px
  float half_ = wpx + 1. + uGlowW * uPx * aT.z;
  s += nrm * side * half_;
  gl_Position = c.w < 1. ? vec4(2., 2., 2., 1.) : vec4(s / uRes * c.w, c.z, c.w);
  vU = u; vD = side * half_; vW = wpx;
  vCol = aC.rgb; vDelay = aU.w; vPhase = aC.w; vT = aT;
}`;

  const FS = `
in float vU; in float vD; in float vW; in vec3 vCol; in float vDelay; in float vPhase; in vec3 vT;
out vec4 o;
uniform float uProg, uTail, uStagger, uGlow, uCore, uO, uTime, uPulse, uPulseS, uPulseW, uHead, uGlowW, uPx, uTrail;
float local(float p){
  return vT.y > vT.x ? clamp((p - vT.x) / (vT.y - vT.x), 0., 1.) : clamp((p - vDelay * uStagger) / max(1. - uStagger, 1e-4), 0., 1.);
}
void main(){
  float u = vU;
  float lp = local(uProg);
  float lt = local(uTail);
  float soft = .01;
  float m = smoothstep(lp + soft, lp - soft * .3, u);
  if (lt > 0.) m *= smoothstep(lt - soft, lt + soft, u);
  if (lp <= 0. || m <= 0.) discard;
  if (uTrail > 0.) m *= pow(clamp((u - lt) / max(lp - lt, 1e-4), 0., 1.), uTrail);
  float d = abs(vD);
  float w = max(vW, .5);
  float core = (1. - smoothstep(w - .7, w + .7, d)) * min(vW / .5, 1.);
  float sg = max(uGlowW * uPx * .42 * vT.z, .5);
  float glow = exp(-d * d / (2. * sg * sg));
  float head = uHead * exp(-pow((u - lp) / .02, 2.)) * step(lp, .999);
  float pul = 0.;
  if (uPulse > 0.) {
    float x = fract(u * 2.3 - uTime * uPulseS + vPhase);
    pul = exp(-pow((x - .5) / uPulseW, 2.)) * uPulse;
  }
  // the white of the head follows the colour's own fade, so a head that runs into a faded end fades with it
  float hf = smoothstep(0., .35, max(vCol.r, max(vCol.g, vCol.b)));
  vec3 c = vCol * (core * uCore + glow * uGlow) * (1. + pul + head * 2.5) + vec3(1., .95, .86) * head * hf * (core + glow * .5) * 1.6;
  o = vec4(c * m * uO, 0.);
}`;

  RB.init = () => {
    prog = G.prog(VS, FS);
  };

  const NF = 20;
  RB.make = (opts) => {
    const gl = G.gl;
    const r = Object.assign(
      {
        kind: 'ribbon', order: 20, z: 0, prog: 1, tail: 0, stagger: 0.25, glow: 0.55, core: 1.2, o: 1,
        wave: 0, waveF: 1.3, waveS: 0.6, pulse: 0, pulseS: 0.18, pulseW: 0.05, head: 0, glowW: 7, trail: 0,
      },
      opts,
    );
    r.m = Object.assign({ x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1, px: 0, py: 0, pz: 0 }, opts.m || {});
    const curves = opts.curves || [];
    let nV = 0;
    const paths = curves.map((cv) => {
      const raw = cv.pts.map((p) => [p[0], p[1], p[2] || 0]);
      const pts = cv.curve === false || raw.length < 3 ? raw : KS.Tg.smoothPath(raw, cv.seg || 40);
      nV += pts.length * 2;
      return pts;
    });
    const buf = new Float32Array(Math.max(1, nV) * NF), idx = [];
    let vi = 0;
    paths.forEach((pts, ci) => {
      const cv = curves[ci];
      const L = [0];
      for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]));
      const tot = L[L.length - 1] || 1;
      const col = Array.isArray(cv.col) ? cv.col.map((v) => v * (cv.mul || 1)) : U.lin(cv.col || '#f2b766', cv.mul || 1);
      const col2 = cv.col2 == null ? col : Array.isArray(cv.col2) ? cv.col2.map((v) => v * (cv.mul || 1)) : U.lin(cv.col2, cv.mul || 1);
      const w = cv.w != null ? cv.w : 2.4;
      const delay = cv.delay != null ? cv.delay : curves.length > 1 ? ci / (curves.length - 1) : 0;
      const ph = cv.seed != null ? cv.seed : (ci * 0.6180339) % 1;
      const t0 = cv.t ? cv.t[0] : 0, t1 = cv.t ? Math.max(cv.t[1], cv.t[0] + 1e-4) : 0, gk = cv.gk != null ? cv.gk : 1;
      const base = vi;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i], pp = pts[Math.max(0, i - 1)], pn = pts[Math.min(pts.length - 1, i + 1)];
        const u = L[i] / tot;

        const tw = cv.w1 != null ? (1 + (cv.w1 / w - 1) * u) * (cv.tip ? Math.pow(U.smooth(1, 0.8, u), 0.6) : 1) : cv.taper ? Math.pow(Math.sin(Math.PI * U.clamp(u * 0.94 + 0.03)), 0.55) : 1;

        const fa = cv.fade ? (cv.fade[0] ? U.smooth(0, cv.fade[0], u) : 1) * (cv.fade[1] ? U.smooth(1, 1 - cv.fade[1], u) : 1) : 1;
        for (let sd = -1; sd <= 1; sd += 2) {
          const o = vi * NF;
          buf[o] = p[0]; buf[o + 1] = p[1]; buf[o + 2] = p[2];
          buf[o + 3] = pp[0]; buf[o + 4] = pp[1]; buf[o + 5] = pp[2];
          buf[o + 6] = pn[0]; buf[o + 7] = pn[1]; buf[o + 8] = pn[2];
          buf[o + 9] = u; buf[o + 10] = sd; buf[o + 11] = w * tw; buf[o + 12] = delay;
          buf[o + 13] = (col[0] + (col2[0] - col[0]) * u) * fa; buf[o + 14] = (col[1] + (col2[1] - col[1]) * u) * fa; buf[o + 15] = (col[2] + (col2[2] - col[2]) * u) * fa; buf[o + 16] = ph;
          buf[o + 17] = t0; buf[o + 18] = t1; buf[o + 19] = gk;
          vi++;
        }
      }
      for (let i = 0; i < pts.length - 1; i++) {
        const a = base + i * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    });
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, buf, gl.STATIC_DRAW);
    const B = NF * 4;
    const attr = (loc, n, off) => {
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, n, gl.FLOAT, false, B, off);
    };
    attr(0, 3, 0);
    attr(1, 3, 12);
    attr(2, 3, 24);
    attr(3, 4, 36);
    attr(4, 4, 52);
    attr(5, 3, 68);
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    const big = nV > 65535;
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, big ? new Uint32Array(idx) : new Uint16Array(idx), gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    const nIdx = idx.length;
    const Mm = new Float32Array(16);

    r.draw = (ctx) => {
      if (!nIdx || r.o <= 0.001 || r.prog <= 0.0001 || r.tail >= 0.9999) return;
      prog.use().u({
        uVP: ctx.vp, uM: modelOf(r.m, Mm), uRes: [ctx.w * 0.5, ctx.h * 0.5], uPx: ctx.px, uTime: ctx.t,
        uWave: r.wave, uWaveF: r.waveF, uWaveS: r.waveS, uGlowW: r.glowW,
        uProg: r.prog, uTail: r.tail, uStagger: r.stagger, uGlow: r.glow, uCore: r.core, uO: r.o,
        uPulse: r.pulse, uPulseS: r.pulseS, uPulseW: r.pulseW, uHead: r.head, uTrail: r.trail,
      });
      G.blend('add');
      gl.bindVertexArray(vao);
      gl.drawElements(gl.TRIANGLES, nIdx, big ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, 0);
      gl.bindVertexArray(G.vao);
    };
    r.dispose = () => {
      gl.deleteBuffer(vbo);
      gl.deleteBuffer(ibo);
      gl.deleteVertexArray(vao);
    };
    return r;
  };

  function modelOf(m, out) {
    const R = KS.Particles.rot3(m.rx, m.ry, m.rz), s = m.s;
    out[0] = R[0] * s; out[1] = R[3] * s; out[2] = R[6] * s; out[3] = 0;
    out[4] = R[1] * s; out[5] = R[4] * s; out[6] = R[7] * s; out[7] = 0;
    out[8] = R[2] * s; out[9] = R[5] * s; out[10] = R[8] * s; out[11] = 0;
    const px = m.px, py = m.py, pz = m.pz;
    out[12] = m.x + (m.bx || 0) + px - (out[0] * px + out[4] * py + out[8] * pz);
    out[13] = m.y + (m.by || 0) + py - (out[1] * px + out[5] * py + out[9] * pz);
    out[14] = m.z + (m.bz || 0) + pz - (out[2] * px + out[6] * py + out[10] * pz);
    out[15] = 1;
    return out;
  }
  RB.modelOf = modelOf;

  RB.fan = (a, b, n, o = {}) => {
    const rnd = U.rng(o.seed || 7), curves = [];
    for (let i = 0; i < n; i++) {
      const t = n > 1 ? i / (n - 1) : 0.5;
      const bow = (o.bow != null ? o.bow : 220) * (t - 0.5) * 2 + U.gauss(rnd) * (o.jit != null ? o.jit : 60);
      const sa = o.spreadA || 0, sb = o.spreadB || 0;
      const aa = [a[0] + U.gauss(rnd) * sa, a[1] + U.gauss(rnd) * sa, (a[2] || 0) + U.gauss(rnd) * sa * 0.3];
      const bb = [b[0] + U.gauss(rnd) * sb, b[1] + U.gauss(rnd) * sb, (b[2] || 0) + U.gauss(rnd) * sb * 0.5];
      const mid = [U.lerp(aa[0], bb[0], 0.5), U.lerp(aa[1], bb[1], 0.5) + bow, U.lerp(aa[2], bb[2], 0.5) + U.gauss(rnd) * 60];
      const q1 = [U.lerp(aa[0], mid[0], 0.5) + U.gauss(rnd) * 30, U.lerp(aa[1], mid[1], 0.5) + bow * 0.25, U.lerp(aa[2], mid[2], 0.5)];
      const q2 = [U.lerp(mid[0], bb[0], 0.5) + U.gauss(rnd) * 30, U.lerp(mid[1], bb[1], 0.5) + bow * 0.25, U.lerp(mid[2], bb[2], 0.5)];
      curves.push({
        pts: [aa, q1, mid, q2, bb], w: (o.w || 2.2) * (0.6 + rnd() * 0.8),
        col: o.cols ? o.cols[i % o.cols.length] : o.col || '#f2b766', mul: (o.mul || 1) * (0.7 + rnd() * 0.6),
        delay: o.delays ? o.delays[i] : rnd(), seed: rnd(), taper: o.taper !== false,
      });
    }
    return curves;
  };
})();
