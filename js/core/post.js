(function () {
  'use strict';
  const KS = window.KS, G = KS.G;
  const P = (KS.post = {});
  let pDown, pUp, pComp, mips = [];

  const LUM = 'float lum(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}';

  const DOWN_FS = LUM + `
in vec2 vUv; out vec4 o;
uniform sampler2D uSrc; uniform vec2 uTexel; uniform int uFirst; uniform vec2 uThr;
vec3 S(vec2 d){ return texture(uSrc, vUv + d * uTexel).rgb; }
void main(){
  vec3 a=S(vec2(-2, 2)), b=S(vec2(0, 2)), c=S(vec2(2, 2));
  vec3 d=S(vec2(-2, 0)), e=S(vec2(0, 0)), f=S(vec2(2, 0));
  vec3 g=S(vec2(-2,-2)), h=S(vec2(0,-2)), i=S(vec2(2,-2));
  vec3 j=S(vec2(-1, 1)), k=S(vec2(1, 1)), l=S(vec2(-1,-1)), m=S(vec2(1,-1));
  vec3 col;
  if (uFirst == 1) {
    // Karis average per group: kills single-pixel fireflies (twinkling stars) before they bloom
    vec3 g0=(a+b+d+e)*.25, g1=(b+c+e+f)*.25, g2=(d+e+g+h)*.25, g3=(e+f+h+i)*.25, g4=(j+k+l+m)*.25;
    float w0=.125/(1.+lum(g0)), w1=.125/(1.+lum(g1)), w2=.125/(1.+lum(g2)), w3=.125/(1.+lum(g3)), w4=.5/(1.+lum(g4));
    col = (g0*w0+g1*w1+g2*w2+g3*w3+g4*w4)/(w0+w1+w2+w3+w4);
    float br = max(col.r, max(col.g, col.b));
    float rq = clamp(br - uThr.x + uThr.y, 0., 2. * uThr.y);
    rq = rq * rq / (4. * uThr.y + 1e-5);
    col *= max(rq, br - uThr.x) / max(br, 1e-5);
  } else {
    col = e*.125 + (a+c+g+i)*.03125 + (b+d+f+h)*.0625 + (j+k+l+m)*.125;
  }
  o = vec4(max(col, 0.), 1.);
}`;

  const UP_FS = `
in vec2 vUv; out vec4 o;
uniform sampler2D uSrc; uniform vec2 uTexel; uniform float uRad, uW;
void main(){
  vec4 d = uTexel.xyxy * vec4(1., 1., -1., 0.) * uRad;
  vec3 s = texture(uSrc, vUv - d.xy).rgb;
  s += texture(uSrc, vUv - d.wy).rgb * 2.;
  s += texture(uSrc, vUv - d.zy).rgb;
  s += texture(uSrc, vUv + d.zw).rgb * 2.;
  s += texture(uSrc, vUv).rgb * 4.;
  s += texture(uSrc, vUv + d.xw).rgb * 2.;
  s += texture(uSrc, vUv + d.zy).rgb;
  s += texture(uSrc, vUv + d.wy).rgb * 2.;
  s += texture(uSrc, vUv + d.xy).rgb;
  o = vec4(s * (uW / 16.), 1.);
}`;

  const COMP_FS = G.NOISE + LUM + `
in vec2 vUv; out vec4 o;
uniform sampler2D uHdr, uBloom;
uniform vec2 uRes;
uniform float uExp, uBloomI, uVig, uCA, uGrain, uFade, uFlash, uSat, uSeed, uKnee, uLift;
uniform vec3 uTint, uFlashCol;
vec3 shoulder(vec3 c){
  // identity below the knee, smooth exponential roll-off to 1 above it
  vec3 k = vec3(uKnee), a = max(c - k, 0.), w = vec3(1. - uKnee);
  return mix(c, k + w * (1. - exp(-a / w)), step(k, c));
}
vec3 toSRGB(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1. / 2.4)) - .055, step(.0031308, c)); }
void main(){
  vec2 uv = vUv, cc = uv - .5;
  float asp = uRes.x / uRes.y;
  float r2 = dot(cc * vec2(asp, 1.), cc * vec2(asp, 1.)) / (.25 * (asp * asp + 1.));  // 0 center .. 1 corner
  vec3 col;
  if (uCA > .001) {
    vec2 off = cc * r2 * uCA * .006;
    col = vec3(texture(uHdr, uv - off).r, texture(uHdr, uv).g, texture(uHdr, uv + off).b);
  } else col = texture(uHdr, uv).rgb;
  col += texture(uBloom, uv).rgb * uBloomI;
  col *= uExp * uTint;
  float l = lum(col);
  col = max(mix(vec3(l), col, uSat), 0.);
  col = shoulder(col);
  col *= 1. - uVig * pow(smoothstep(.18, 1.05, r2), 1.25);
  col = col * (1. - uFade) + uFlashCol * uFlash;
  col = max(col + uLift * (1. - col), 0.);
  vec3 s = toSRGB(clamp(col, 0., 1.));
  // grain: luminance-weighted, strongest in the mids
  float ls = dot(s, vec3(.299, .587, .114));
  float gn = hash12(gl_FragCoord.xy + vec2(uSeed * 97.13, uSeed * 41.7)) + hash12(gl_FragCoord.xy * 1.73 + uSeed * 13.1) - 1.;
  s += gn * uGrain * (.35 + .65 * (1. - abs(ls - .45) * 1.8));
  // triangular dither, 1 LSB
  s += (hash12(gl_FragCoord.xy * .913 + uSeed) + hash12(gl_FragCoord.yx * 1.31 - uSeed) - 1.) / 255.;
  o = vec4(s, 1.);
}`;

  P.init = () => {
    pDown = G.prog(G.FS_VS, DOWN_FS);
    pUp = G.prog(G.FS_VS, UP_FS);
    pComp = G.prog(G.FS_VS, COMP_FS);
  };

  P.resize = (w, h, q) => {
    mips.forEach(G.freeRT);
    mips = [];
    let mw = Math.max(1, w >> 1), mh = Math.max(1, h >> 1);
    for (let i = 0; i < q.bloomLv && mw >= 2 && mh >= 2; i++) {
      mips.push(G.rt(mw, mh, G.hdr, 1));
      mw = Math.max(1, mw >> 1);
      mh = Math.max(1, mh >> 1);
    }
  };

  P.render = (ctx) => {
    const gl = G.gl, pp = KS.world.post;
    G.blend(null);

    let src = ctx.hdr;
    pDown.use();
    for (let i = 0; i < mips.length; i++) {
      G.bind(mips[i]);
      pDown.u({ uSrc: src, uTexel: [1 / src.w, 1 / src.h], uFirst: i === 0 ? 1 : 0, uThr: [pp.thr, pp.knee] });
      G.fs();
      src = mips[i];
    }

    pUp.use();
    G.blend('add');
    for (let i = mips.length - 1; i > 0; i--) {
      G.bind(mips[i - 1]);
      pUp.u({ uSrc: mips[i], uTexel: [1 / mips[i].w, 1 / mips[i].h], uRad: pp.rad, uW: 1 });
      G.fs();
    }
    G.blend(null);

    G.bind(null);
    const seed = ctx.frozen ? 7.123 + (ctx.t % 1) : ((ctx.frame * 0.618034) % 1) * 61.7;
    pComp.use().u({
      uHdr: ctx.hdr, uBloom: mips[0] || ctx.hdr, uRes: [gl.drawingBufferWidth, gl.drawingBufferHeight],
      uExp: pp.exp, uBloomI: mips.length ? pp.bloom / mips.length : 0,
      uVig: pp.vig, uCA: ctx.safe ? 0 : pp.ca, uGrain: ctx.safe ? 0 : pp.grain,
      uFade: pp.fade, uFlash: pp.flash, uFlashCol: pp.flashCol, uSat: pp.sat, uSeed: seed,
      uKnee: pp.knee2, uLift: pp.lift, uTint: pp.tint,
    });
    G.fs();
  };

  KS.POST = {
    exp: 1, bloom: 0.9, thr: 0.85, knee: 0.45, rad: 1.0, vig: 0.42, ca: 0.6, grain: 0.032,
    fade: 0, flash: 0, flashCol: [1, 0.93, 0.8], sat: 1, knee2: 0.8, lift: 0, tint: [1, 1, 1],
  };
})();
