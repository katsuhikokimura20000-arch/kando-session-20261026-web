(function () {
  'use strict';
  const KS = window.KS, G = KS.G, U = KS.U, T = KS.T;
  const PS = (KS.Particles = {});
  let pDraw = null, pCap = null, pDust = null;

  const STATE = `
uniform sampler2D uPosA, uColA, uPosB, uColB, uR;
uniform int uSide;
uniform float uP, uAmt, uOrd, uSpread, uSwirl, uLift, uEase;
uniform vec3 uSwC;
vec3 bez(vec3 a, vec3 b, vec3 c, vec3 d, float t){ float u = 1. - t; return u*u*u*a + 3.*u*u*t*b + 3.*u*t*t*c + t*t*t*d; }
float easeP(float p){
  if (uEase < .5) return p * p * p * (p * (p * 6. - 15.) + 10.);
  if (uEase < 1.5) return 1. - pow(1. - p, 3.);
  return 1. - pow(1. - p, 5.);
}
// morph state of particle id (no wobble): position, colour, size multiplier, eased progress
void particle(int id, out vec3 pos, out vec4 col, out float sz, out float e, out vec4 r){
  ivec2 ij = ivec2(id % uSide, id / uSide);
  vec4 pa = texelFetch(uPosA, ij, 0), pb = texelFetch(uPosB, ij, 0);
  vec4 ca = texelFetch(uColA, ij, 0), cb = texelFetch(uColB, ij, 0);
  r = texelFetch(uR, ij, 0);
  float d = mix(r.x, r.w, uOrd);
  float p = clamp((uP - d * uAmt) / max(1. - uAmt, 1e-4), 0., 1.);
  e = easeP(p);
  vec3 h1 = fract(r.xyz * vec3(17.13, 31.71, 13.37) + r.zxy * 7.3) * 2. - 1.;
  vec3 h2 = fract(r.yzx * vec3(23.91, 11.47, 29.63) + r.xzy * 5.1) * 2. - 1.;
  vec3 up = vec3(0., uLift, 0.);
  pos = bez(pa.xyz, pa.xyz + h1 * uSpread + up, pb.xyz + h2 * uSpread + up, pb.xyz, e);
  if (uSwirl != 0.) {
    float an = uSwirl * sin(3.14159265 * e) * (.5 + r.y);
    vec3 q = pos - uSwC; float c = cos(an), s = sin(an);
    pos = uSwC + vec3(c * q.x + s * q.z, q.y, -s * q.x + c * q.z);
  }
  col = mix(ca, cb, smoothstep(0., 1., p));
  sz = mix(pa.w, pb.w, e);
}`;

  const DRAW_VS = G.NOISE + STATE + `
uniform mat4 uVP, uM;
uniform float uTime, uSize, uPx, uMaxPt, uO, uI, uFG, uWob, uWobF, uFlow, uFlowF, uFlowS, uTwk;
uniform float uReveal, uRevOrd, uFocus, uCoc, uNear, uDZ, uDZ0, uDZ1;
out vec4 vCol; out float vSh;
void main(){
  vec3 pos; vec4 col; float sz, e; vec4 r;
  particle(gl_VertexID, pos, col, sz, e, r);
  float fz = 1.; // a stream through depth: z wraps inside [uDZ0, uDZ1] and fades in at the far end
  if (uDZ1 > uDZ0) { pos.z = uDZ0 + mod(pos.z - uDZ0 + uDZ, uDZ1 - uDZ0); fz = smoothstep(0., .1, (pos.z - uDZ0) / (uDZ1 - uDZ0)); }
  if (uFG > 0.) col.rgb *= 1. + uFG * sin(3.14159265 * e);
  vec3 w = (vec3(.55, .47, .63) + r.zxy * .6) * uWobF;
  pos += uWob * sin(uTime * w + r.xyz * 6.2832) * (.35 + .65 * r.y);
  if (uFlow > 0.) {
    vec3 fp = pos * uFlowF + vec3(0., 0., uTime * uFlowS);
    pos += uFlow * (vec3(vnoise3(fp), vnoise3(fp + 17.3), vnoise3(fp + 41.9)) - .5) * 2.;
  }
  vec4 clip = uVP * (uM * vec4(pos, 1.));
  float dist = clip.w;
  float a = col.a * uO * fz;
  if (uTwk > 0.) a *= 1. + uTwk * .5 * sin(uTime * (1.7 + r.y * 2.9) + r.x * 61.);
  if (uReveal < 1.) a *= clamp((uReveal * 1.03 - mix(r.x, r.w, uRevOrd)) * 34., 0., 1.);
  float s = uSize * sz * 1483.6 / max(dist, 1.) * uPx;
  if (uCoc > 0.) {
    float c = uCoc * abs(dist - uFocus) / max(dist, 1.) * uPx;
    float s2 = sqrt(s * s + c * c);
    a *= pow(s / s2, 1.6);
    s = s2;
  }
  if (s < 1.5) { a *= s * s / 2.25; s = 1.5; }
  a *= smoothstep(uNear, uNear * 4., dist);
  gl_PointSize = min(s, uMaxPt);
  vSh = smoothstep(2.5, 6., s);
  vCol = vec4(col.rgb * uI, a);
  gl_Position = (dist < 1. || a < .002) ? vec4(2., 2., 2., 1.) : clip;
}`;

  const DRAW_FS = `
in vec4 vCol; in float vSh; out vec4 o;
uniform float uSharp;
void main(){
  vec2 q = gl_PointCoord * 2. - 1.;
  float r2 = dot(q, q);
  if (r2 > 1.) discard;
  float g = exp(-r2 * 4.2);
  float dk = 1. - smoothstep(.45, 1., sqrt(r2));
  float a = mix(g, dk, uSharp * vSh) * vCol.a;
  o = vec4(vCol.rgb * a, 0.);
}`;

  const CAP_VS = STATE + `
flat out vec4 vPos; flat out vec4 vCol;
void main(){
  vec3 pos; vec4 col; float sz, e; vec4 r;
  particle(gl_VertexID, pos, col, sz, e, r);
  ivec2 ij = ivec2(gl_VertexID % uSide, gl_VertexID / uSide);
  gl_Position = vec4((vec2(ij) + .5) / float(uSide) * 2. - 1., 0., 1.);
  gl_PointSize = 1.;
  vPos = vec4(pos, sz);
  vCol = col;
}`;
  const CAP_FS = `
flat in vec4 vPos; flat in vec4 vCol;
layout(location = 0) out vec4 o0;
layout(location = 1) out vec4 o1;
void main(){ o0 = vPos; o1 = vCol; }`;

  PS.init = () => {
    pDraw = G.prog(DRAW_VS, DRAW_FS);
    pCap = G.prog(CAP_VS, CAP_FS);
    pDust = G.prog(DUST_VS, DUST_FS);
  };

  const ranks = {};
  PS.rank = (N) => {
    if (ranks[N]) return ranks[N];
    const bits = Math.round(Math.log2(N)), r = new Uint32Array(N);
    for (let i = 0; i < N; i++) {
      let x = i, v = 0;
      for (let b = 0; b < bits; b++) {
        v = (v << 1) | (x & 1);
        x >>= 1;
      }
      r[i] = v >>> 0;
    }
    return (ranks[N] = r);
  };

  function rot3(rx, ry, rz) {
    const ax = rx * U.deg, ay = ry * U.deg, az = rz * U.deg;
    const cz = Math.cos(az), sz = Math.sin(az), cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
    return [
      cz * cy, cz * sy * sx - sz * cx, cz * sy * cx + sz * sx,
      sz * cy, sz * sy * sx + cz * cx, sz * sy * cx - cz * sx,
      -sy, cy * sx, cy * cx,
    ];
  }
  PS.rot3 = rot3;

  function fill(sys, tgt, pl, outP, outC) {
    const N = sys.N, rank = sys.rank, n = tgt.n, d = tgt.d;
    if (!n) {
      outP.fill(0);
      outC.fill(0);
      return;
    }
    const s = pl.s != null ? pl.s : 1, ox = pl.x || 0, oy = pl.y || 0, oz = pl.z || 0;
    const sm = pl.size != null ? pl.size : 1, al = pl.alpha != null ? pl.alpha : 1;
    const tint = pl.tint || null, tr = tint ? tint[0] : 1, tg = tint ? tint[1] : 1, tb = tint ? tint[2] : 1;
    const rot = pl.rx || pl.ry || pl.rz;
    const R = rot ? rot3(pl.rx || 0, pl.ry || 0, pl.rz || 0) : null;
    for (let i = 0; i < N; i++) {
      const j = rank[i];
      const src = Math.floor((j * n) / N);
      const vis = j === 0 || Math.floor(((j - 1) * n) / N) !== src;
      const k = src * 8, o = i * 4;
      let x = d[k] * s, y = d[k + 1] * s, z = d[k + 2] * s;
      if (R) {
        const X = R[0] * x + R[1] * y + R[2] * z, Y = R[3] * x + R[4] * y + R[5] * z, Z = R[6] * x + R[7] * y + R[8] * z;
        x = X; y = Y; z = Z;
      }
      outP[o] = x + ox;
      outP[o + 1] = y + oy;
      outP[o + 2] = z + oz;
      outP[o + 3] = d[k + 3] * sm;
      outC[o] = d[k + 4] * tr;
      outC[o + 1] = d[k + 5] * tg;
      outC[o + 2] = d[k + 6] * tb;
      outC[o + 3] = vis ? d[k + 7] * al : 0;
    }
  }

  function modelOf(m, out) {
    const R = rot3(m.rx, m.ry, m.rz), s = m.s;
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

  PS.make = (o = {}) => {
    const gl = G.gl;
    const side = o.side || 256, N = side * side;
    const sys = {
      kind: 'particles', side, N, order: o.order != null ? o.order : 30, z: o.z || 0,
      o: o.o != null ? o.o : 1, i: o.i != null ? o.i : 1, size: o.size || 2.2, sharp: o.sharp || 0,
      wob: o.wob != null ? o.wob : 3, wobF: 1, flow: 0, flowF: 0.0025, flowS: 0.06, twk: 0,
      reveal: 1, revOrd: 0, focus: KS.DIST, coc: 0, near: 30, dz: 0, dz0: 0, dz1: 0,
      m: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1, px: 0, py: 0, pz: 0 },
      spin: { x: 0, y: 0, z: 0 },
      u: { p: 1, amt: 0.35, ord: 1, spread: 120, swirl: 0, swc: [0, 0, 0], lift: 0, fg: 0, ease: 0 },
      rank: PS.rank(N), cur: null,
    };
    const rnd = U.rng(o.seed || 1234), rd = new Float32Array(N * 4);
    for (let i = 0; i < N; i++) {
      rd[i * 4] = rnd();
      rd[i * 4 + 1] = rnd();
      rd[i * 4 + 2] = rnd();
      rd[i * 4 + 3] = sys.rank[i] / N;
    }
    const rTex = G.tex({ w: side, h: side, internal: gl.RGBA32F, format: gl.RGBA, type: gl.FLOAT, filter: gl.NEAREST, data: rd });
    const st = [0, 1, 2].map(() => G.rt(side, side, gl.RGBA32F, 2, gl.NEAREST));
    sys.canCapture = G.cbf && st.every((s) => s.ok);
    let A = 0, B = 1, C = 2;
    const sP = new Float32Array(N * 4), sC = new Float32Array(N * 4), Mm = new Float32Array(16);

    function put(si, tgt, pl) {
      fill(sys, tgt, pl, sP, sC);
      gl.bindTexture(gl.TEXTURE_2D, st[si].texs[0].tex);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, side, side, gl.RGBA, gl.FLOAT, sP);
      gl.bindTexture(gl.TEXTURE_2D, st[si].texs[1].tex);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, side, side, gl.RGBA, gl.FLOAT, sC);
    }

    const want = { A: null, B: null };
    function putWhenReady(slot, recipe, pl) {
      const tgt = KS.Tg.resolve(recipe, N);
      const token = (want[slot] = {});
      const go = () => {
        if (want[slot] === token && !sys.dead) put(slot === 'A' ? A : B, tgt, pl);
      };
      if (tgt.ready) go();
      else tgt.p.then(go);
    }
    function uState() {
      const u = sys.u;
      return {
        uPosA: st[A].texs[0], uColA: st[A].texs[1], uPosB: st[B].texs[0], uColB: st[B].texs[1], uR: rTex,
        uSide: side, uP: u.p, uAmt: u.amt, uOrd: u.ord, uSpread: u.spread, uSwirl: u.swirl, uSwC: u.swc,
        uLift: u.lift, uEase: u.ease,
      };
    }
    function capture() {
      G.bind(st[C]);
      G.blend(null);
      pCap.use().u(uState());
      gl.bindVertexArray(G.vao);
      gl.drawArrays(gl.POINTS, 0, N);
      G.bind(null);
    }
    function setMorph(mo) {
      const u = sys.u;
      u.p = 0;
      u.amt = mo.amt != null ? mo.amt : 0.35;
      u.ord = mo.ord != null ? mo.ord : 1;
      u.spread = mo.spread != null ? mo.spread : 120;
      u.swirl = mo.swirl || 0;
      u.swc = mo.swc ? mo.swc.slice() : [mo.x || 0, mo.y || 0, mo.z || 0];
      u.lift = mo.lift || 0;
      u.fg = mo.glow || 0;
      u.ease = mo.ease === 'out' ? 1 : mo.ease === 'expo' ? 2 : 0;
    }

    sys.morph = (recipe, mo = {}) => {
      const prog = { v: 0 };
      const tw = T.to(prog, { v: 1 }, {
        dur: mo.dur != null ? mo.dur : 2.6, delay: mo.delay || 0, ease: 'linear', group: mo.group,
        onStart: () => {
          if (sys.cur && sys.cur !== tw) sys.cur.done = true;
          sys.cur = tw;
          if (sys.u.p < 0.999 && sys.canCapture) {
            capture();
            const t = A; A = C; C = t;
          } else {
            const t = A; A = B; B = t;
          }
          want.A = want.B = null;
          if (mo.from) putWhenReady('A', mo.from, mo.fromPlace || mo);
          setMorph(mo);
          putWhenReady('B', recipe, mo);
        },
        onUpdate: () => {
          if (sys.cur === tw) sys.u.p = prog.v;
        },
      });
      return tw;
    };

    sys.set = (recipe, pl = {}) => {
      if (sys.cur) sys.cur.done = true;
      sys.cur = null;
      setMorph(pl);
      sys.u.p = 1;
      const tgt = KS.Tg.resolve(recipe, N);
      const token = {};
      want.A = want.B = token;
      const go = () => {
        if (want.A !== token || sys.dead) return;
        put(A, tgt, pl);
        put(B, tgt, pl);
      };
      if (tgt.ready) go();
      else tgt.p.then(go);
    };
    sys.update = (dt) => {
      const m = sys.m, sp = sys.spin;
      if (sp.x) m.rx += sp.x * dt;
      if (sp.y) m.ry += sp.y * dt;
      if (sp.z) m.rz += sp.z * dt;
    };
    sys.draw = (ctx) => {
      if (sys.o <= 0.001) return;
      pDraw.use().u(uState()).u({
        uVP: ctx.vp, uM: modelOf(sys.m, Mm), uTime: ctx.t, uSize: sys.size, uPx: ctx.px, uMaxPt: G.maxPoint,
        uO: sys.o, uI: sys.i, uFG: sys.u.fg, uWob: sys.wob, uWobF: sys.wobF, uFlow: sys.flow, uFlowF: sys.flowF,
        uFlowS: sys.flowS, uTwk: ctx.frozen ? 0 : sys.twk, uReveal: sys.reveal, uRevOrd: sys.revOrd,
        uFocus: sys.focus, uCoc: sys.coc, uNear: sys.near, uSharp: sys.sharp, uDZ: sys.dz, uDZ0: sys.dz0, uDZ1: sys.dz1,
      });
      G.blend('add');
      gl.bindVertexArray(G.vao);
      gl.drawArrays(gl.POINTS, 0, N);
    };
    sys.dispose = () => {
      sys.dead = true;
      if (sys.cur) sys.cur.done = true;
      st.forEach(G.freeRT);
      gl.deleteTexture(rTex.tex);
    };

    sP.fill(0);
    sC.fill(0);
    for (const si of [0, 1, 2]) {
      gl.bindTexture(gl.TEXTURE_2D, st[si].texs[0].tex);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, side, side, gl.RGBA, gl.FLOAT, sP);
      gl.bindTexture(gl.TEXTURE_2D, st[si].texs[1].tex);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, side, side, gl.RGBA, gl.FLOAT, sC);
    }
    return sys;
  };

  const DUST_VS = G.NOISE + `
uniform mat4 uVP; uniform vec3 uCam, uBox, uCol1, uCol2;
uniform float uTime, uSize, uPx, uMaxPt, uO, uCoc, uFocus, uDrift;
out vec4 vCol; out float vBok;
void main(){
  float id = float(gl_VertexID);
  vec3 h = hash33(vec3(id * .7131 + .3, id * .3711 + 7.1, id * 1.1173 + 3.3));
  vec3 h2 = hash33(h * 91.7 + 1.3);
  vec3 p = h * uBox;
  p.xy += sin(uTime * (.03 + h2.xy * .05) + h2.yz * 6.2832) * uDrift;
  p.y += uTime * (2. + h2.x * 4.);
  vec3 c = uCam - vec3(0., 0., uBox.z * .5 + 40.);
  vec3 rel = mod(p - c + uBox * .5, uBox) - uBox * .5;
  vec4 clip = uVP * vec4(c + rel, 1.);
  float dist = clip.w;
  float s = uSize * (.45 + h2.z * 1.1) * 1483.6 / max(dist, 1.) * uPx;
  float cc = uCoc * abs(dist - uFocus) / max(dist, 1.) * uPx;
  float S = sqrt(s * s + cc * cc);
  float a = uO * (.3 + .7 * h2.x) * pow(max(s, .6) / max(S, .6), 1.15);
  vec3 eb = abs(rel) / (uBox * .5);
  a *= (1. - smoothstep(.78, 1., eb.x)) * (1. - smoothstep(.78, 1., eb.y)) * (1. - smoothstep(.7, 1., eb.z));
  a *= smoothstep(80., 420., dist);
  if (S < 1.5) { a *= S * S / 2.25; S = 1.5; }
  gl_PointSize = min(S, uMaxPt);
  vBok = smoothstep(4., 14., S);
  vCol = vec4(mix(uCol1, uCol2, h2.y), a);
  gl_Position = (dist < 1. || a < .002) ? vec4(2., 2., 2., 1.) : clip;
}`;
  const DUST_FS = `
in vec4 vCol; in float vBok; out vec4 o;
void main(){
  vec2 q = gl_PointCoord * 2. - 1.;
  float r = length(q);
  if (r > 1.) discard;
  float g = exp(-r * r * 4.);
  float disc = (1. - smoothstep(.8, 1., r)) * (.74 + .26 * smoothstep(.4, .93, r));
  o = vec4(vCol.rgb * mix(g, disc, vBok) * vCol.a, 0.);
}`;

  const DUST = (KS.dust = { count: 0, order: 50, z: 0 });
  DUST.draw = (ctx) => {
    const d = KS.world.dust;
    if (!DUST.count || d.o <= 0.001) return;
    const gl = G.gl, cam = ctx.cam;
    pDust.use().u({
      uVP: ctx.vp, uCam: [cam.x, cam.y, KS.DIST + cam.z], uBox: d.box, uCol1: d.col1, uCol2: d.col2,
      uTime: ctx.t, uSize: d.size, uPx: ctx.px, uMaxPt: G.maxPoint, uO: d.o * (ctx.safe ? 0.6 : 1),
      uCoc: d.coc, uFocus: KS.DIST, uDrift: d.drift,
    });
    G.blend('add');
    gl.bindVertexArray(G.vao);
    gl.drawArrays(gl.POINTS, 0, Math.round(DUST.count * U.clamp(d.n != null ? d.n : 1)));
  };
  KS.DUST = {
    o: 0.55, size: 2.4, coc: 46, drift: 26, n: 1, box: [7600, 4600, 6200],
    col1: U.lin('#f2b766', 1.25), col2: U.lin('#fff1d8', 0.9),
  };
})();
