(function () {
  'use strict';
  const KS = window.KS, G = KS.G, U = KS.U;
  const PL = (KS.Plates = {});
  let prog;

  const VS = `
uniform mat4 uVP, uM; uniform vec2 uSize; uniform float uGrow;
out vec2 vUv; out vec2 vQ; out vec2 vP;
void main(){
  vec2 q = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1)) * 2. - 1.;
  vec2 hs = uSize * .5 + uGrow;
  vQ = q * hs / (uSize * .5); vUv = vQ * .5 + .5; vP = q * hs;
  gl_Position = uVP * uM * vec4(q * hs, 0., 1.);
}`;

  const FS = G.NOISE + `
in vec2 vUv; in vec2 vQ; in vec2 vP; out vec4 o;
uniform sampler2D uTex;
uniform vec4 uUv;            // xy scale, zw offset
uniform vec2 uSize;
uniform float uO, uExp, uCon, uSat, uLift, uFe, uFv, uRound, uBlur, uAdd, uLod;
uniform float uRv, uRt, uRa, uRs, uRn, uRw, uSh, uShw, uShadow, uSeed, uTime;
uniform vec3 uTint, uRc, uShc;
uniform vec2 uIc;
uniform int uHasTex;
float sdRound(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.)) + min(max(q.x, q.y), 0.) - r; }
const vec2 PD[12] = vec2[12](vec2(-.326,-.406),vec2(-.840,-.074),vec2(-.696,.457),vec2(-.203,.621),vec2(.962,-.195),vec2(.473,-.480),
  vec2(.519,.767),vec2(.185,-.893),vec2(.507,.064),vec2(.896,.412),vec2(-.322,-.933),vec2(-.792,-.598));
void main(){
  vec2 hs = uSize * .5;
  float sd = sdRound(vP, hs, uRound);
  if (uShadow > 0.) {
    // soft drop shadow for the quad below the plate
    float sh = exp(-max(sd, 0.) * max(sd, 0.) / (2. * 30. * 30.)) * uShadow * uO;
    o = vec4(0., 0., 0., sh * .7);
    return;
  }
  float aa = max(fwidth(sd), 1e-3);
  float m = clamp(.5 - sd / aa, 0., 1.);
  if (uFe > 0.) m *= smoothstep(0., uFe, -sd);
  if (uFv > 0.) m *= smoothstep(1., 1. - uFv, length(vQ));
  vec2 uv = (vUv - .5) * uUv.xy + .5 + uUv.zw;
  vec3 c = vec3(1.);
  float texA = 1.;
  if (uHasTex == 1) {
    if (uBlur > .001) {
      float r = uBlur * .025;
      float lod = uLod + log2(max(uBlur * 40., 1.));
      c = vec3(0.);
      float rot = hash12(gl_FragCoord.xy) * 6.2832;
      mat2 R = mat2(cos(rot), sin(rot), -sin(rot), cos(rot));
      for (int i = 0; i < 12; i++) c += textureLod(uTex, uv + R * PD[i] * r * vec2(1., uUv.x / uUv.y * uSize.x / uSize.y), lod).rgb;
      c /= 12.;
    } else {
      vec4 tx = texture(uTex, uv);
      c = tx.rgb;
      texA = tx.a;
    }
  }
  // grade in gamma space
  c = pow(max(c, 0.), vec3(1. / 2.2));
  c = (c - .5) * uCon + .5 + uLift;
  float l = dot(c, vec3(.2126, .7152, .0722));
  c = mix(vec3(l), c, uSat) * uTint;
  c = pow(max(c, 0.), vec3(2.2)) * uExp;
  // reveal
  float edge = 0.;
  if (uRv < .9999) {
    float F;
    if (uRt < .5) {
      F = clamp((fbm(vUv * vec2(uSize.x / uSize.y, 1.) * 3.2 + uSeed * 7.1, 5) - .18) / .64, 0., 1.);
    } else if (uRt < 1.5) {
      vec2 dir = vec2(cos(uRa * .0174533), sin(uRa * .0174533));
      vec2 qq = vQ * normalize(uSize);
      F = dot(qq, dir) / (abs(dir.x) * normalize(uSize).x + abs(dir.y) * normalize(uSize).y) * .5 + .5;
    } else {
      vec2 qq = (vQ - uIc) * vec2(uSize.x / uSize.y, 1.);
      F = length(qq) / (length(vec2(uSize.x / uSize.y, 1.)) + length(uIc * vec2(uSize.x / uSize.y, 1.)));
    }
    if (uRn > 0.) F += (fbm(vUv * vec2(uSize.x / uSize.y, 1.) * 5. + uSeed * 3.3 + uTime * .05, 4) - .5) * uRn;
    float s = max(uRs, .002);
    float e = (uRv * (1. + s + uRn * .5) - F) / s;
    float mm = smoothstep(0., 1., clamp(e, 0., 1.));
    edge = exp(-pow((e - .35) * 2.2, 2.)) * uRw * smoothstep(-.18, 0., e) * step(e, 1.6);
    m *= mm;
    c += uRc * edge;
  }
  if (uShw > 0.) {
    float d = dot(vQ, normalize(vec2(1., .55)));
    c += uShc * exp(-pow((d - uSh) / uShw, 2.));
  }
  float a = m * uO;
  o = vec4(c * a + uRc * edge * uO * (1. - m) * .5, a * (1. - uAdd)) * texA;
}`;

  PL.init = () => {
    prog = G.prog(VS, FS);
  };

  const DEF = {
    x: 0, y: 0, z: 0, w: 1000, h: 0, r: 0, rx: 0, ry: 0, o: 1,
    zoom: 1, px: 0, py: 0, exp: 1, con: 1, sat: 1, tint: [1, 1, 1], lift: 0,
    fe: 0, fv: 0, round: 0, rv: 1, rt: 0, ra: 0, rs: 0.12, rn: 0, rc: [1.6, 0.9, 0.35], rw: 0, ix: 0, iy: 0,
    sh: -2, shw: 0, shc: [1, 0.85, 0.6], blur: 0, add: 0, shadow: 0, order: 10, color: null,
  };

  function model(p) {
    const r = p.r * U.deg, ry = p.ry * U.deg, rx = p.rx * U.deg;
    const cz = Math.cos(r), sz = Math.sin(r), cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);

    const m00 = cz * cy, m01 = sz * cy, m02 = -sy;
    const m10 = cz * sy * sx - sz * cx, m11 = sz * sy * sx + cz * cx, m12 = cy * sx;
    const m20 = cz * sy * cx + sz * sx, m21 = sz * sy * cx - cz * sx, m22 = cy * cx;

    return new Float32Array([m00, m01, m02, 0, m10, m11, m12, 0, m20, m21, m22, 0, p.x + (p.bx || 0), p.y + (p.by || 0), p.z + (p.bz || 0), 1]);
  }

  PL.make = (opts) => {
    const p = Object.assign({}, DEF, opts);
    p.tint = (opts.tint || DEF.tint).slice();
    p.rc = (opts.rc || DEF.rc).slice();
    p.shc = (opts.shc || DEF.shc).slice();
    p.seed = opts.seed != null ? opts.seed : (U.hashStr(String(opts.img || 'c')) % 1000) / 100;
    p.kind = 'plate';
    p.tex = opts.img ? G.image(opts.img) : null;
    p.draw = (ctx) => drawPlate(p, ctx);
    p.dispose = () => {};
    Object.defineProperty(p, 'ready', { get: () => !p.tex || p.tex.ready });
    return p;
  };

  function drawPlate(p, ctx) {
    if (p.o <= 0.001 || p.rv <= 0.0001) return;
    const tex = p.tex;
    if (tex && !tex.ready) return;
    const gl = G.gl;
    const ia = tex ? tex.w / tex.h : 1;
    const w = p.w, h = p.h > 0 ? p.h : w / ia;
    const pa = w / h;

    let sx = 1, sy = 1;
    if (tex) {
      if (pa > ia) sy = ia / pa;
      else sx = pa / ia;
    }
    const zoom = Math.max(0.01, p.zoom);

    const pxW = (w * ctx.kAt(p.z + (p.bz || 0))) * ctx.px;
    const lod = tex ? Math.max(0, Math.log2((tex.w * sx / zoom) / Math.max(1, pxW))) : 0;
    const M = model(p);
    prog.use();
    gl.bindVertexArray(G.vao);
    if (p.shadow > 0.001) {
      G.blend('pre');
      const sm = M.slice();
      sm[12] += 0; sm[13] -= 26; sm[14] -= 2;
      prog.u({ uVP: ctx.vp, uM: sm, uSize: [w, h], uGrow: 90, uShadow: p.shadow, uO: p.o, uRound: p.round });
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    G.blend('pre');
    prog.u({
      uVP: ctx.vp, uM: M, uSize: [w, h], uGrow: 0, uShadow: 0,
      uTex: tex ? tex.tex : null, uHasTex: tex ? 1 : 0,
      uUv: [sx / zoom, sy / zoom, p.px, p.py],
      uO: p.o, uExp: p.exp, uCon: p.con, uSat: p.sat, uLift: p.lift, uTint: p.color || p.tint,
      uFe: p.fe, uFv: p.fv, uRound: p.round, uBlur: p.blur, uAdd: p.add, uLod: lod,
      uRv: Math.min(1, p.rv), uRt: p.rt, uRa: p.ra, uRs: p.rs, uRn: p.rn, uRc: p.rc, uRw: p.rw, uIc: [p.ix, p.iy],
      uSh: p.sh, uShw: p.shw, uShc: p.shc, uSeed: p.seed, uTime: ctx.t,
    });
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
})();
