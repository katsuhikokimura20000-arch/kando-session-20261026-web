(function () {
  'use strict';
  const KS = window.KS, G = KS.G, U = KS.U;
  const SP = (KS.Sprites = {});
  let prog = null;

  const VS = `
uniform mat4 uVP; uniform vec3 uC; uniform float uSize, uPx, uScreen, uRot; uniform vec2 uRes;
out vec2 vQ;
void main(){
  vec2 q = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1)) * 2. - 1.;
  vec4 c = uVP * vec4(uC, 1.);
  float px = uScreen > .5 ? uSize * uPx : uSize * 1483.6 / max(c.w, 1.) * uPx;
  float cs = cos(uRot), sn = sin(uRot);
  vec2 rq = vec2(cs * q.x - sn * q.y, sn * q.x + cs * q.y);
  vQ = q;
  gl_Position = c.w < 1. ? vec4(2., 2., 2., 1.) : vec4(c.xy + rq * px / uRes * c.w, c.z, c.w);
}`;
  const FS = `
in vec2 vQ; out vec4 o;
uniform vec3 uCol; uniform float uI, uO, uType, uRw, uSpk;
void main(){
  float r = length(vQ);
  if (r > 1.) discard;
  float edge = uType > 4.5 ? 1. : 1. - smoothstep(.82, 1., r);
  float v = 0.;
  if (uType < .5) {            // glow
    v = exp(-r * r * 9.) + .22 * exp(-r * 4.2);
  } else if (uType < 1.5) {    // flare
    vec2 a = abs(vQ);
    float sp = exp(-a.x * 3.) * exp(-a.y * 60.) + exp(-a.y * 3.) * exp(-a.x * 60.);
    if (uSpk > 4.5) { vec2 b = abs(mat2(.7071, .7071, -.7071, .7071) * vQ); sp += .45 * (exp(-b.x * 5.) * exp(-b.y * 90.) + exp(-b.y * 5.) * exp(-b.x * 90.)); }
    v = exp(-r * r * 26.) * 1.6 + .2 * exp(-r * 5.) + sp * .8;
  } else if (uType < 2.5) {    // ring
    float rr = 1. - uRw * .5 - .08;
    v = exp(-pow((r - rr) / max(uRw * .5, .01), 2.)) + .12 * exp(-r * r * 6.);
  } else if (uType < 3.5) {    // dot
    v = 1. - smoothstep(.62, .7, r);
    v += .35 * exp(-r * r * 5.);
  } else if (uType < 4.5) {    // streak
    vec2 a = abs(vQ);
    v = exp(-a.y * 46.) * exp(-a.x * 2.4) + exp(-r * r * 30.) * 1.2;
  } else if (uType > 5.5) {    // dash: a hairline that thins out toward both ends, no hot core
    vec2 a = abs(vQ);
    v = exp(-a.y * 90.) * pow(1. - a.x, 1.6);
  } else {                     // bokeh: a creamy disc (edge at ~.775 of the quad) with a faint halo
    float e = 1. - smoothstep(.74, .81, r);
    v = (.92 - .39 * r * r) * e + .12 * exp(-pow((r - .78) / .025, 2.)) + .16 * exp(-pow((r - .8) / .07, 2.)) * (1. - e);
  }
  o = vec4(uCol * v * edge * uI * uO, 0.);
}`;

  SP.init = () => {
    prog = G.prog(VS, FS);
  };
  const TYPES = { glow: 0, flare: 1, ring: 2, dot: 3, streak: 4, bokeh: 5, dash: 6 };

  SP.make = (o) => {
    const s = Object.assign(
      { kind: 'sprite', order: 40, x: 0, y: 0, z: 0, size: 80, i: 1, o: 1, rot: 0, type: 'glow', rw: 0.12, spikes: 4, pulse: 0, pulseS: 1.4, screen: false },
      o,
    );
    s.col = Array.isArray(o.col) ? o.col.slice() : U.lin(o.col || '#ffcf8a', o.mul || 1);
    s.draw = (ctx) => {
      if (s.o <= 0.001 || s.i <= 0.001) return;
      const gl = G.gl;
      const pz = s.pulse && !ctx.frozen ? 1 + s.pulse * Math.sin(ctx.t * s.pulseS * U.TAU) : 1;
      prog.use().u({
        uVP: ctx.vp, uC: [s.x + (s.bx || 0), s.y + (s.by || 0), s.z + (s.bz || 0)], uSize: s.size * pz, uPx: ctx.px, uScreen: s.screen ? 1 : 0, uRot: s.rot * U.deg,
        uRes: [ctx.w * 0.5, ctx.h * 0.5], uCol: s.col, uI: s.i, uO: s.o, uType: TYPES[s.type] || 0, uRw: s.rw, uSpk: s.spikes,
      });
      G.blend('add');
      gl.bindVertexArray(G.vao);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    s.dispose = () => {};
    return s;
  };
})();
