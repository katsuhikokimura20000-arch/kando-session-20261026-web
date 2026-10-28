(function () {
  'use strict';
  const KS = window.KS;
  const G = (KS.G = { gl: null, ok: false });

  G.init = (canvas) => {
    if (KS.params.nogl) return false;
    let gl = null;
    try {
      gl = canvas.getContext('webgl2', {
        alpha: false, antialias: false, depth: false, stencil: false,
        premultipliedAlpha: false, powerPreference: 'high-performance',
        preserveDrawingBuffer: KS.params.export,
      });
    } catch (e) {
      gl = null;
    }
    if (!gl) return false;
    G.gl = gl;
    G.cbf = !!gl.getExtension('EXT_color_buffer_float');
    G.fl = !!gl.getExtension('OES_texture_float_linear');
    gl.getExtension('EXT_color_buffer_half_float');
    G.hdr = G.cbf ? gl.RGBA16F : gl.RGBA8;
    G.maxPoint = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)[1];
    G.vao = gl.createVertexArray();
    G.ok = true;
    return true;
  };

  const HEADER = '#version 300 es\nprecision highp float;\nprecision highp int;\nprecision highp sampler2D;\n';

  G.NOISE = `
float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
vec2 hash22(vec2 p){vec3 p3=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));p3+=dot(p3,p3.yzx+33.33);return fract((p3.xx+p3.yz)*p3.zy);}
vec3 hash32(vec2 p){vec3 p3=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));p3+=dot(p3,p3.yxz+33.33);return fract((p3.xxy+p3.yzz)*p3.zyx);}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
 return mix(mix(hash12(i),hash12(i+vec2(1,0)),u.x),mix(hash12(i+vec2(0,1)),hash12(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p,int oct){float a=.5,s=0.;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<8;i++){if(i>=oct)break;s+=a*vnoise(p);p=m*p;a*=.5;}return s;}
vec3 hash33(vec3 p3){p3=fract(p3*vec3(.1031,.1030,.0973));p3+=dot(p3,p3.yxz+33.33);return fract((p3.xxy+p3.yxx)*p3.zyx);}
float vnoise3(vec3 p){vec3 i=floor(p),f=fract(p);vec3 u=f*f*(3.-2.*f);
 float n000=hash33(i).x,n100=hash33(i+vec3(1,0,0)).x,n010=hash33(i+vec3(0,1,0)).x,n110=hash33(i+vec3(1,1,0)).x;
 float n001=hash33(i+vec3(0,0,1)).x,n101=hash33(i+vec3(1,0,1)).x,n011=hash33(i+vec3(0,1,1)).x,n111=hash33(i+vec3(1,1,1)).x;
 return mix(mix(mix(n000,n100,u.x),mix(n010,n110,u.x),u.y),mix(mix(n001,n101,u.x),mix(n011,n111,u.x),u.y),u.z);}
`;

  function compile(type, src) {
    const gl = G.gl, sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(sh);
      const lines = src.split('\n').map((l, i) => (i + 1) + ': ' + l).join('\n');
      console.error('[KS] shader compile error\n' + log + '\n' + lines);
      throw new Error('shader compile: ' + log);
    }
    return sh;
  }

  G.prog = (vs, fs) => {
    const gl = G.gl, p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, HEADER + vs));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, HEADER + fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(p));
    const U = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    let unit = 0;
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(p, i);
      const name = info.name.replace(/\[0\]$/, '');
      const u = { loc: gl.getUniformLocation(p, info.name), type: info.type, size: info.size };
      if (info.type === gl.SAMPLER_2D) u.unit = unit++;
      U[name] = u;
    }
    gl.useProgram(p);
    for (const k in U) if (U[k].unit !== undefined) gl.uniform1i(U[k].loc, U[k].unit);
    const P = {
      p, U,
      use() {
        gl.useProgram(p);
        return P;
      },
      u(obj) {
        for (const k in obj) {
          const u = U[k];
          if (!u) continue;
          const v = obj[k];
          switch (u.type) {
            case gl.FLOAT: u.size > 1 ? gl.uniform1fv(u.loc, v) : gl.uniform1f(u.loc, v); break;
            case gl.FLOAT_VEC2: gl.uniform2fv(u.loc, v); break;
            case gl.FLOAT_VEC3: gl.uniform3fv(u.loc, v); break;
            case gl.FLOAT_VEC4: gl.uniform4fv(u.loc, v); break;
            case gl.INT: case gl.BOOL: gl.uniform1i(u.loc, v); break;
            case gl.FLOAT_MAT4: gl.uniformMatrix4fv(u.loc, false, v); break;
            case gl.FLOAT_MAT3: gl.uniformMatrix3fv(u.loc, false, v); break;
            case gl.SAMPLER_2D:
              gl.activeTexture(gl.TEXTURE0 + u.unit);
              gl.bindTexture(gl.TEXTURE_2D, v && v.tex !== undefined ? v.tex : v);
              break;
          }
        }
        return P;
      },
    };
    return P;
  };

  G.tex = (o) => {
    const gl = G.gl, t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, o.internal || gl.RGBA8, o.w, o.h, 0, o.format || gl.RGBA, o.type || gl.UNSIGNED_BYTE, o.data || null);
    const f = o.filter || gl.LINEAR;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f === gl.LINEAR_MIPMAP_LINEAR ? gl.LINEAR : f);
    const w = o.wrap || gl.CLAMP_TO_EDGE;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, w);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, w);
    return { tex: t, w: o.w, h: o.h };
  };

  G.rt = (w, h, internal, n = 1, filter) => {
    const gl = G.gl;
    const isF = internal === gl.RGBA16F || internal === gl.RGBA32F;
    const type = internal === gl.RGBA32F ? gl.FLOAT : internal === gl.RGBA16F ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE;
    const texs = [];
    for (let i = 0; i < n; i++)
      texs.push(G.tex({ w, h, internal, format: gl.RGBA, type, filter: filter || (isF && internal === gl.RGBA32F && !G.fl ? gl.NEAREST : gl.LINEAR) }));
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    texs.forEach((t, i) => gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, t.tex, 0));
    if (n > 1) gl.drawBuffers(texs.map((_, i) => gl.COLOR_ATTACHMENT0 + i));
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { fb, tex: texs[0].tex, texs, w, h, ok };
  };
  G.freeRT = (r) => {
    if (!r) return;
    const gl = G.gl;
    gl.deleteFramebuffer(r.fb);
    r.texs.forEach((t) => gl.deleteTexture(t.tex));
  };
  G.bind = (r) => {
    const gl = G.gl;
    if (r) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, r.fb);
      gl.viewport(0, 0, r.w, r.h);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }
  };

  G.FS_VS = `out vec2 vUv;void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);vUv=p;gl_Position=vec4(p*2.-1.,0,1);}`;
  G.fs = () => {
    const gl = G.gl;
    gl.bindVertexArray(G.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  G.blend = (mode) => {
    const gl = G.gl;
    if (!mode) return gl.disable(gl.BLEND);
    gl.enable(gl.BLEND);
    if (mode === 'add') gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ZERO, gl.ONE);
    else if (mode === 'alpha') gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
    else if (mode === 'pre') gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
  };

  const cache = {};
  G.image = (name) => {
    if (cache[name]) return cache[name];
    const rec = (cache[name] = { name, tex: null, ready: false, w: 1, h: 1, img: null, used: 0, p: null });
    const src = (KS.media && KS.media[name]) || null;
    if (!src) {
      console.warn('[KS] missing media', name);
      rec.p = Promise.resolve(rec);
      return rec;
    }
    const img = new Image();
    rec.img = img;
    rec.p = new Promise((res) => {
      img.onload = () => {
        const gl = G.gl;
        if (gl) {
          const t = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, t);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.SRGB8_ALPHA8, gl.RGBA, gl.UNSIGNED_BYTE, img);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
          gl.generateMipmap(gl.TEXTURE_2D);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          const ext = gl.getExtension('EXT_texture_filter_anisotropic');
          if (ext) gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 8);
          rec.tex = t;
        }
        rec.w = img.naturalWidth;
        rec.h = img.naturalHeight;
        rec.ready = true;
        res(rec);
      };
      img.onerror = () => res(rec);
    });
    img.src = src;
    return rec;
  };
  G.preload = (names) => Promise.all((names || []).map((n) => G.image(n).p));

  G.trim = (keep) => {
    const gl = G.gl;
    for (const k in cache) {
      const r = cache[k];
      if (keep.has(k) || !r.ready || !r.tex) continue;
      gl.deleteTexture(r.tex);
      delete cache[k];
    }
  };
})();
