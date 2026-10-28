(function () {
  'use strict';
  const KS = window.KS, G = KS.G, U = KS.U;
  const SKY = (KS.sky = {});
  let pNeb, pStar, rtNeb = null;

  const NEB_FS = G.NOISE + `
in vec2 vUv; out vec4 o;
uniform float uAspect, uZoom, uTime, uInt, uBal, uAng, uClear, uDark, uScale, uGrad, uSeed, uOct;
uniform vec2 uOff;
uniform vec3 uWarm, uCool, uBase, uBase2, uHaze;
void main(){
  vec2 p = (vUv - .5) * vec2(uAspect, 1.) / uZoom;
  vec2 q = p * uScale + uOff + vec2(uSeed * 3.17, uSeed * 1.93);
  int oc = int(uOct);
  vec2 w1 = vec2(fbm(q + vec2(0., uTime * .004), oc), fbm(q + vec2(5.2, 1.3) - uTime * .003, oc));
  vec2 w2 = vec2(fbm(q + 2.8 * w1 + vec2(1.7, 9.2), oc), fbm(q + 2.8 * w1 + vec2(8.3, 2.8), oc));
  float d = fbm(q + 2.4 * w2, oc + 1);
  float dens = smoothstep(.38, .92, d);
  float fil = pow(clamp(1. - abs(d - .56) * 3.2, 0., 1.), 4.);
  vec2 dir = vec2(cos(uAng), sin(uAng));
  float g = dot(p, dir) * .85 + .5 + (uBal - .5) * 1.4 + (w2.x - .5) * .5;
  vec3 col = mix(uWarm, uCool, smoothstep(.15, .85, g));
  // hot cores where density peaks
  col = mix(col, col * vec3(1.25, 1.15, 1.05) + .02, smoothstep(.75, .95, d));
  vec3 neb = col * (dens * dens * 1.25 + fil * .45);
  float lanes = smoothstep(.42, .78, fbm(q * 2.2 + w1 * 2.1 + 7.7, 4));
  neb *= mix(1., .28, lanes * uDark);
  // keep the reading area calm
  float cm = smoothstep(.12, .78, length(p * vec2(.72, 1.15)));
  neb *= mix(1., cm, uClear);
  float gy = clamp(vUv.y * uGrad + (1. - uGrad) * .5, 0., 1.);
  vec3 base = mix(uBase, uBase2, gy);
  // soft large-scale haze glow along the gradient direction
  base += uHaze * smoothstep(.9, -.6, dot(p, dir) + .25) * .9;
  o = vec4(base + neb * uInt, 1.);
}`;

  const STAR_FS = G.NOISE + `
in vec2 vUv; out vec4 o;
uniform sampler2D uNeb;
uniform vec2 uRes;      // drawing buffer px
uniform float uPx;      // device px per stage px
uniform vec2 uCam;      // camera world xy
uniform float uCamZ;    // camera dolly (world units)
uniform vec2 uVel;      // camera velocity (world units / s)
uniform float uVz;      // dolly velocity
uniform float uTime, uStars, uTwinkle, uStreak, uSeed;
// one copy of a star layer at sampling scale k (screen px -> layer units) and integer seed sI
vec3 starCopy(vec2 sp, float k, float sI, float f, float cs, float dens, float rad, float bright, float L){
  vec2 lp = uCam * f + sp * k + vec2(L * 131.7 + uSeed * 37.1 + sI * 71.37, L * 71.3 + sI * 29.71);
  vec2 v = (uVel * f + sp * (uVz * f / 1483.6)) * uStreak * k;   // streak vector, layer units
  float rk = rad * k;
  vec3 acc = vec3(0.);
  vec2 cell = floor(lp / cs), fc = lp - cell * cs;
  // stars sit in the inner 70% of their cell: skip neighbours that cannot reach this pixel
  float reach = rk * 7. + length(v) - cs * .15;
  bvec4 nb = bvec4(fc.x < reach, cs - fc.x < reach, fc.y < reach, cs - fc.y < reach);
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    if ((i < 0 && !nb.x) || (i > 0 && !nb.y) || (j < 0 && !nb.z) || (j > 0 && !nb.w)) continue;
    vec2 c = cell + vec2(float(i), float(j));
    vec3 h = hash32(c + L * 17.13 + sI * 3.71);
    if (h.z > dens) continue;
    vec2 sp0 = (c + .15 + .7 * h.xy) * cs;
    vec2 d = lp - sp0;
    float vl = dot(v, v);
    float tt = vl > 1e-6 ? clamp(dot(d, v) / vl, 0., 1.) : 0.;
    vec2 dd = d - v * tt;
    float r2 = dot(dd, dd) / (rk * rk);
    float b = pow(1. - h.z / dens, 2.2) * bright;
    float tw = 1. + uTwinkle * .35 * sin(uTime * (1.3 + h.x * 2.7) + h.y * 40.);
    float spread = 1. / (1. + sqrt(vl) / (rk * 2.));
    float core = exp(-r2 * 2.2) + .08 * exp(-r2 * .18);
    vec3 tint = mix(vec3(1., .78, .55), vec3(.68, .82, 1.), hash12(c * 1.7 + 3.1 + sI));
    acc += tint * core * b * tw * spread;
    if (b > bright * .62) { // spikes on the brightest
      vec2 a = abs(dd) / rk;
      float s = exp(-a.x * 1.4) * exp(-a.y * 14.) + exp(-a.y * 1.4) * exp(-a.x * 14.);
      acc += tint * s * b * .35 * spread;
    }
  }
  return acc;
}
// log-periodic infinite dolly: two copies one octave apart cross-fade, so pushing in forever
// keeps the density and star size constant while stars stream outward
vec3 starLayer(vec2 sp, float f, float cs, float dens, float rad, float bright, float L){
  float phi = -uCamZ * f / (1483.6 * .6931472);
  float n = floor(phi), fr = phi - n;
  float wA = cos(fr * 1.5707963); wA *= wA;
  float wB = 1. - wA;
  vec3 acc = vec3(0.);
  if (wA > .004) acc += starCopy(sp, exp2(-fr), n, f, cs, dens, rad, bright, L) * wA;
  if (wB > .004) acc += starCopy(sp, exp2(1. - fr), n + 1., f, cs, dens, rad, bright, L) * wB;
  return acc;
}
void main(){
  vec3 c = texture(uNeb, vUv).rgb;
  vec2 sp = (gl_FragCoord.xy - uRes * .5) / uPx;
  vec3 s = vec3(0.);
  s += starLayer(sp, .05, 15., .32, .55, .55, 0.);
  s += starLayer(sp, .14, 38., .30, .75, 1.0, 1.);
  s += starLayer(sp, .32, 95., .22, 1.05, 2.4, 2.);
  o = vec4(c + s * uStars, 1.);
}`;

  SKY.init = () => {
    pNeb = G.prog(G.FS_VS, NEB_FS);
    pStar = G.prog(G.FS_VS, STAR_FS);
  };
  SKY.resize = (w, h, q) => {
    G.freeRT(rtNeb);
    const div = q.nebDiv;
    rtNeb = G.rt(Math.max(2, Math.round(w / div)), Math.max(2, Math.round(h / div)), G.hdr, 1);
  };

  SKY.render = (ctx) => {
    const gl = G.gl, sk = KS.world.sky, cam = ctx.cam;
    G.bind(rtNeb);
    G.blend(null);
    pNeb.use().u({
      uAspect: ctx.aspect, uZoom: Math.exp(-Math.tanh(cam.z / 30000) * 0.9),
      uTime: ctx.t, uInt: sk.int, uBal: sk.bal, uAng: sk.ang, uClear: sk.clear, uDark: sk.dark,
      uScale: sk.scale, uGrad: sk.grad, uSeed: sk.seed, uOct: ctx.q.oct,
      uOff: [cam.x * 0.000045, cam.y * 0.000045],
      uWarm: sk.warm, uCool: sk.cool, uBase: sk.base, uBase2: sk.base2, uHaze: sk.haze,
    });
    G.fs();
    G.bind(ctx.hdr);
    pStar.use().u({
      uNeb: rtNeb, uRes: [ctx.w, ctx.h], uPx: ctx.px,
      uCam: [cam.x, cam.y], uCamZ: cam.z, uVel: ctx.vel, uVz: ctx.velZ,
      uTime: ctx.t, uStars: sk.stars * (ctx.safe ? 0.8 : 1), uTwinkle: ctx.safe || ctx.frozen ? 0 : 1,
      uStreak: ctx.frozen ? 0 : 0.05, uSeed: sk.seed,
    });
    G.fs();
  };

  const L = U.lin;
  KS.SKY = {
    void:   { warm: L('#c8743a', .12), cool: L('#3aa0ff', .10), base: L('#020308'), base2: L('#04060c'), haze: [0, 0, 0], int: .12, bal: .5, ang: .62, clear: .8, dark: .9, scale: 1.25, grad: .6, stars: .55, seed: 0 },
    deep:   { warm: L('#dc9a56', .2), cool: L('#3a92ec', .27), base: L('#02040a'), base2: L('#050914'), haze: L('#0e0c1c', .2), int: .34, bal: .56, ang: .62, clear: .88, dark: .9, scale: 1.2, grad: .7, stars: .85, seed: 0 },
    amber:  { warm: L('#f2a24a', .55), cool: L('#3a7fd0', .30), base: L('#050509'), base2: L('#070912'), haze: L('#40200c', .35), int: .62, bal: .36, ang: .62, clear: .75, dark: .8, scale: 1.15, grad: .7, stars: 1, seed: 0 },
    cool:   { warm: L('#c87a3a', .25), cool: L('#4fb4ff', .55), base: L('#03060c'), base2: L('#061024'), haze: L('#0a1a38', .4), int: .58, bal: .72, ang: .62, clear: .75, dark: .8, scale: 1.15, grad: .8, stars: 1.1, seed: 0 },
    cosmos: { warm: L('#ffb35c', .85), cool: L('#56b8ff', .75), base: L('#040509'), base2: L('#060914'), haze: L('#2a1830', .3), int: .95, bal: .5, ang: .62, clear: .55, dark: .75, scale: 1.05, grad: .7, stars: 1.25, seed: 0 },
    dawn:   { warm: L('#ff9a48', .6), cool: L('#6a9adc', .28), base: L('#120a08'), base2: L('#05070d'), haze: L('#5a2a10', .5), int: .5, bal: .38, ang: 1.45, clear: .8, dark: .8, scale: 1.2, grad: 1, stars: .7, seed: 0 },
    ink:    { warm: L('#b07040', .14), cool: L('#3a70b0', .14), base: L('#05060a'), base2: L('#080b14'), haze: [0, 0, 0], int: .2, bal: .5, ang: .62, clear: .9, dark: .9, scale: 1.3, grad: .5, stars: .45, seed: 0 },
  };
  KS.skyPreset = (name, over) => {
    const p = KS.SKY[name] || KS.SKY.deep, o = {};
    for (const k in p) o[k] = Array.isArray(p[k]) ? p[k].slice() : p[k];
    if (over) for (const k in over) o[k] = Array.isArray(over[k]) ? over[k].slice() : over[k];
    return o;
  };
})();
