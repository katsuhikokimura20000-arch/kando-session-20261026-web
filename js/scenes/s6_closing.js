(function () {
  'use strict';
  const KS = window.KS, K = KS.kit, TX = KS.Text, T = KS.T, C = KS.C, U = KS.U;
  const SW = () => KS.world.swarm;
  const TAU = Math.PI * 2;
  const wp = (x, y, z = 0) => [x - 960, 540 - y, z];
  const fnR = (key, seed, fn) => ({ type: 'fn', key, seed, sort: 'path', fn });
  const mx = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const prep = (S, R) => { const sw = SW(); if (sw && !sw.inert) S.prep(R, sw.N); };
  const look = (S, o, dur) => S.swarmLook(Object.assign({ o: 1, size: 2.0, i: 1, wob: 0.6, wobF: 0.6, flow: 0, twk: 0 }, o), { dur: dur != null ? dur : 1.2 });
  const glowTo = (sp, o, opt) => { if (sp && !sp.inert) T.to(sp, { o }, Object.assign({ dur: 1.2, ease: 'inOutSine' }, opt)); };
  const tw = (o, props, opt) => { if (o && !o.inert) T.to(o, props, opt); };
  const WORLD = (sky) => ({ sky: sky || 'deep', post: { vig: 0.5 }, dust: { o: 0.35 } });
  const VOID = () => ({ sky: 'void', post: { vig: 0.45 }, dust: { o: 0.2 } });
  const DIM = 'rgba(243,234,216,.7)';
  const bez = (a, b, c, d, t) => {
    const u = 1 - t, k0 = u * u * u, k1 = 3 * u * u * t, k2 = 3 * u * t * t, k3 = t * t * t;
    return [k0 * a[0] + k1 * b[0] + k2 * c[0] + k3 * d[0], k0 * a[1] + k1 * b[1] + k2 * c[1] + k3 * d[1]];
  };
  const scrim = (S, css, o = {}) => {
    const el = S.div({ x: o.x || 0, y: o.y || 0, w: o.w || 1920, h: o.h || 1080 });
    el.style.background = css;
    T.setEl(el, { o: 0 });
    return el;
  };

  const ignite = (sp, o) => {
    if (!sp || sp.inert) return;
    const a = o.rise || 0.18, b = o.fall || 1.1, dl = o.delay || 0;
    T.set(sp, { o: 0 });
    T.to(sp, { o: o.peak || 1 }, { dur: a, delay: dl, ease: 'outCubic' });
    T.to(sp, { o: o.rest || 0 }, { dur: b, delay: dl + a, ease: 'inOutSine', overwrite: false });
  };

  const KZ = (z) => (KS.DIST - z) / KS.DIST;
  const wpz = (x, y, z) => { const k = KZ(z); return [(x - 960) * k, (540 - y) * k, z]; };
  const PZ = -1200, PW = 2200, PH = (2200 * 941) / 1672;
  const fxy = (fx, fy) => [960 + (fx - 0.5) * PW, 540 + (fy - 0.5) * PH];
  const onPlate = (p, fx, fy) => { const Z = p.zoom || 1; return [960 + (fx - 0.5 - (p.px || 0)) * Z * PW, 540 + (fy - 0.5 + (p.py || 0)) * Z * PH]; };
  const pinGlow = (S, f, o, rnd) => {
    const s = fxy(f[0], f[1]), size = o.size * KZ(PZ);
    const g = { x: s[0], y: s[1], z: PZ, size, col: o.col, i: o.i || 1 };
    if (o.type) g.type = o.type;
    if (o.spikes) g.spikes = o.spikes;
    if (o.mul) g.mul = o.mul;
    return { sp: K.glow(S, g), f, size, i: o.i || 1, tw: o.tw || 0, w: 0.5 + rnd() * 1.1, ph: rnd() * TAU };
  };

  const pin = (S, p, list, t) => {
    if (!p || p.inert) return;
    const Z = p.zoom || 1;
    list.forEach((q) => {
      const sp = q.sp;
      if (!sp || sp.inert) return;
      const s = onPlate(p, q.f[0], q.f[1]), w = S.at(s[0], s[1], PZ);
      sp.x = w[0]; sp.y = w[1]; sp.size = q.size * Z;
      sp.i = q.i * (S.kf || !q.tw ? 1 : 1 + q.tw * Math.sin(t * q.w + q.ph));
    });
  };
  const pinRibbon = (p, r) => {
    if (!p || p.inert || !r || r.inert) return;
    const Z = p.zoom || 1, m = r.m, k = KZ(PZ);
    m.s = Z; m.pz = PZ; m.x = -(p.px || 0) * Z * PW * k; m.y = -(p.py || 0) * Z * PH * k;
  };

  const follow = (S, p) => {
    const sw = SW();
    if (!S.alive || !sw || sw.inert || !p || p.inert) return;
    const Z = p.zoom || 1;
    sw.m.s = Z; sw.m.x = -(p.px || 0) * Z * PW; sw.m.y = -(p.py || 0) * Z * PH;
  };

  function along(S, sp, pts, z, o = {}) {
    if (!sp || sp.inert) return 0;
    const P = pts.map((p) => S.at(p[0], p[1], z)), n = P.length - 1, st = { p: 0 };
    const cr = (a, b, c, d, u) => 0.5 * (2 * b + (c - a) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (3 * b - a - 3 * c + d) * u * u * u);
    const put = () => {
      const f = U.clamp(st.p, 0, 1) * n, i = Math.min(n - 1, Math.floor(f)), u = f - i;
      const a = P[Math.max(0, i - 1)], b = P[i], c = P[i + 1], d = P[Math.min(n, i + 2)];
      sp.x = cr(a[0], b[0], c[0], d[0], u); sp.y = cr(a[1], b[1], c[1], d[1], u);
    };
    put();
    const dur = o.dur || 3, delay = o.delay || 0;
    T.to(st, { p: 1 }, { dur, delay, ease: o.ease || 'inOutSine', onUpdate: put });
    return delay + dur;
  }
  const sprAt = (S, sp, x, y, z) => { if (sp && !sp.inert) { const p = S.at(x, y, z || 0); T.set(sp, { x: p[0], y: p[1] }); } };

  KS.scene({
    id: 'sec6', sec: 6, title: 'PART 06　むすび', swarm: true, world: WORLD(),
    build(S) {
      S.data.card = K.card(S, { no: 6, label: 'むすび', sub: '最後に、少し個人的な話を' });
    },
    steps: [(S) => { S.data.card.in({ delay: 0 }); }],
  });

  const MS_VIS = [[0.7967, 0.0925], [0.6746, 0.1498], [0.7464, 0.1817], [0.8971, 0.1552], [0.7691, 0.1775], [0.7219, 0.0882], [0.7219, 0.1265],
    [0.8128, 0.1945], [0.6788, 0.1775], [0.7333, 0.1541], [0.8684, 0.1817], [0.802, 0.1265], [0.7039, 0.1541], [0.7333, 0.1286], [0.7213, 0.1116],
    [0.692, 0.1095], [0.6639, 0.1488], [0.6926, 0.152], [0.8977, 0.1764], [0.9217, 0.1467], [0.7022, 0.1126], [0.6657, 0.1934], [0.7213, 0.1541]];
  const MS_B2 = [16, 21, 1, 5, 14, 9, 0, 11, 7, 10, 3, 18];
  const MS_B3V = [2, 4, 6, 8, 12, 13, 15, 17, 19, 20, 22];

  const MS_OFF = [[0.9539, 0.0542], [0.9474, 0.2051], [0.9599, 0.0797], [0.9456, 0.0808], [0.9701, 0.1583], [0.93, 0.1817], [0.9492, 0.153],
    [0.9611, 0.187], [0.9641, 0.2051], [0.9384, 0.1668], [0.9797, 0.1807], [0.9569, 0.1222], [0.9504, 0.1041], [0.9815, 0.1647], [0.9474, 0.169],
    [0.7051, 0.0691], [0.6579, 0.0574], [0.9701, 0.1817]];
  const MS_LED = [[0.8938, 0.6021], [0.9014, 0.6043], [0.9087, 0.6063], [0.9142, 0.6079], [0.9211, 0.6097]];

  const CRT = { x0: 1138, y0: 246, step: 3, nx: 85, pal: ['#ce44ee', '#1f42b3', '#24eafc', '#df6499', '#f8db95', '#1199f7', '#faa672', '#204ef6'],
    pts: '0OT0Ob0Oj0On0Sn0S_0T10T90TH0UF0Z50ZD0ZL0dP0dX0df0dn0en0jX0jj0jr0jz0o10u90uL0uT0ub0yl0-n0-v0_10_910V10d10l18118918H18f18n18v19H19P19X19f19n1B71BF1BN1Ij1Ir1I_1J11JN1JV1Jd1Jl1Jt1Jw1K21KA1KI1KQ1KX1Ll1Lt1L_1TL1TV1TX1T_1U71UF1UN1UV1UY1Ug1Uo1Uw1V21V91WN1WV1Wd1dv1ed1el1et1e_1f71fA1fI1fQ1fY1fg1fn1fv1gn1g_1h71hF1pF1pN1pV1pd1pl1po1pw1q21qA1qI1qP1qX1rP1rd1rl1rt1wI1wQ1wY1wg1wn1yV1yb1yj1yr1yz1z11zD1zL1zT1zb1zj1zo1zw1-21-A1-I1-Q1-Y1-g1-o1-w1_11_920120F20N20V24w25225A25I27727F27N27V27d27l27r27z28528D28L28Q28Y28g28o28w29229A29I29Q29Y29f29n2FY2Fg2Fo2Fw2HN2HP2Hf2IL2IT2Ib2Ij2Ir2Iz2J22JA2JI2JQ2JY2Jg2Jo2Jw2K22KA2KH2KP2QA2QI2QQ2QY2Sz2T52TD2TL2TT2Tb2Tg2To2Tw2U22UA2UI2UQ2UY2Ug2Uo2Uv2V12bv2c12c92cv2db2dj2dr2dz2e52eA2eI2eQ2eY2eg2eo2ew2f22fA2fI2fQ2fX2ff2mT2mb2mj2mr2mz2n12n92nH2nP2nb2nj2nr2nz2o52oA2oI2oQ2oY2og2oo2ow2p22pA2pI2pT2pb2pj2pr2pz2q72q92qH2x52xD2xL2xT2xb2xf2xn2xv2y12yD2yL2yT2yb2yj2yo2yw2z22zA2zI2zQ2zY2zg2zo2zw2-52-D2-L2-T2-b2-l2-n2-v35j35r35z36536F36H36P36X36f36r36z37537D37L37Q37Y37g37o37w38238A38I38Q38Y38j38r38z39539D39H39P39X3GN3GT3Gb3Gj3Gt3Gv3H13H93HT3Hb3Hj3Hr3Hz3I23IA3II3IQ3IY3Ig3Io3Iw3J23JA3JL3JT3Jb3Jj3Jr3Jv3K13O03OF3ON3PN3PV3Pd3Pl3QV3Qd3Ql3Qt3Qz3R53RD3RL3RT3RY3Rg3Ro3Rw3S23SA3SI3SQ3SY3Sg3So3Sw3T23TA3TI3TQ3TY3Tg3To3Tz3U23UA3UI3UQ3UX3Uf3Un3Ye3Yt3Y_3Z_3a73aF3aN3b73bF3bN3bV3bb3bj3br3bz3c53cA3cI3cQ3cY3cg3co3cw3d23dA3dI3dQ3dY3dg3do3dz3e53eD3eL3eQ3ed3el3et3e_3f73f93j93jG3jV3jd3kd3kl3kt3k_3ll3ln3lv3m13mD3mL3mT3mb3mj3mo3mw3n23nA3nI3nQ3nY3ng3no3nw3o23oA3oI3oQ3ob3oj3or3ow3p23pF3pN3pV3pd3pl3pn3pv3tn3tu3u03u83vF3vN3vV3vd3wH3wP3wX3wf3wr3wz3x53xD3xI3xQ3xY3xg3xo3xw3y23yA3yI3yQ3yY3yg3yo3yw3z23zD3zL3zT3zY3zg3zt3z_3-73-F3-L3-P3-X40v42u43043843H43O43W43e44N44V44d44l44n44v45145945T45b45l45t45w46246A46I46Q46Y46g46o46w47247A47I47Q47Y47g47r47z48548A48L48T48b48j48r48z4914994DW4De4Dm4Dv4E04E84EG4E_4F74FF4FN4FV4Fd4Fl4Ft4F_4G24GA4GI4GQ4GY4Gg4Go4Gw4H24HA4HI4HQ4HY4Hj4Hr4Hz4I54ID4IN4IT4Ib4Ij4Ir4Iz4J54JD4JL4JT4Jb4Jf4Jn4Jv4K14O84OG4OO4OX4Oe4Om4Ou4Pd4Pl4Pt4P_4Q74QF4QN4QV4Qd4Qg4Qo4Qw4R24RA4RI4RQ4RY4Rg4Ro4Rw4S24SA4SL4ST4Sb4Sj4Sr4S_4T74TD4TN4TT4Td4Tf4Tn4Tv4Ym4Yu4Z04Z94ZG4ZO4ZW4aF4aN4aP4ad4al4at4a_4b74bF4bI4bQ4bY4bg4bo4bw4c24cA4cI4cQ4cY4cg4co4cz4d54dD4dL4dT4dd4dl4dr4dz4e54eF4eH4eP4eX4ef4ff4fo4fw4g54he4hm4hu4i14j14jO4jW4je4jn4ju4k04k84kt4kv4l14lN4lV4ld4ll4lt4lw4m24mA4mI4mQ4mY4mg4mo4mw4n24nA4nI4nQ4nb4nj4nr4nz4o54oF4oL4oT4ob4oj4on4ov4p14p94pH4pP4qL4qQ4qY4qf4sG4sO4sW4tX4te4tm4tv4u04u84uG4uO4uW4ue4um4uu4v74vF4vN4vV4vb4vj4vr4vw4w24wA4wI4wQ4wY4wg4wo4ww4x24xA4xI4xQ4xY4xg4xo4xw4y24yF4yL4yT4yb4yj4yr4yz4z54zD4zL4zP4zX4zl4zt4z_4-14-z4_24_A4_H50u51051852952H52P52X52e52m52u53053853G53O53W53l53t53_54754F54L54T54Y54g54o54w55255A55I55Q55Y55g55o55w56256D56L56T56b56j56t56z57557D57L57P57f57n57v59b59g59o5BW5Be5Bm5Cn5Cv5D15D95DG5DO5DW5De5Dm5Du5E05E85EN5EV5Ed5El5Et5Ez5F55FA5FI5FQ5FY5Fg5Fo5Fw5G25GA5GI5GQ5GY5Gg5Gr5Gz5H55HD5HL5HT5Hb5Hj5Hr5Hz5I15I95IH5IP5IX5Mh5Nu5O05O85OH5OO5OW5Oe5Om5O_5P75PF5PN5PV5Pb5Pj5Po5Pw5Q25QA5QI5QQ5QY5Qg5Qo5Qw5R25RA5RI5RT5Rb5Rj5Rr5Rz5S55SD5SL5ST5Sb5Sf5Sn5Sv5T75TF5XM5XU5Xc5Xf5Xn5Xv5Y35YB5YJ5YR5YW5Ye5Ym5Yu5Z05Z85ZG5ZR5Za5Zi5Zs5Zy5a45aC5aK5aS5aa5ai5aq5aw5b25bA5bI5bQ5bY5bg5bo5bw5c55cD5cL5cT5cb5cj5cr5cz5d55dD5dH5dV5dd5dl5dt5h-5i65iB5iH5iP5iX5ih5ip5ix5j35j85jG5jO5jW5je5jm5ju5k35kE5kM5kU5ka5ki5kq5ky5l45lC5lK5lS5lY5lg5lo5lw5m55mF5mN5mV5md5ml5mr5mz5n55nF5nN5nV5nd5nj5nr5nv5o15oF5oN5oV5sc5sk5sp5sv5t15t95tJ5tR5tZ5th5tm5tu5u05u85uG5uO5uW5uh5us5u-5v65vC5vK5vS5va5vi5vq5vy5w45wA5wI5wQ5wY5wj5wt5w_5x75xF5xN5xT5xb5xj5xr5x_5y75yF5yN5yP5zf5_j61J61R61x62362B62J62O62W62e62m62u63063863G63R63Z63h63q63y64464C64K64S64a64i64o64w65265A65L65V65d65l65t65z66566D66L66T66d66l66t66_6716AL6CE6CM6CU6Cc6Ck6Cs6C-6D66DE6DM6DU6Dc6Dk6Ds6D-6E46EC6EM6ES6Ea6Ei6Eq6Ey6F46FC6FK6FQ6FY6Fg6Fo6Fz6G76GF6GN6GV6Gb6Gj6Gr6Gz6H56HF6HN6HV6Hd6Hf6IX6Il6In6Iv6Kz6Ms6M-6N66NE6NM6NU6Nc6Nk6Ns6N-6O66OE6OM6OU6Oa6Oi6Oq6Oy6P46PC6PK6PS6PW6Pe6Pm6Pu6Q76QF6QN6QV6QX6Ql6Qt6Q_6R76RF6RL6RT6Rb6Rj6Rt6R_6S76SF6T96TN6TV6TX6Vb6XU6Xc6Xk6Xs6X-6Y66YE6YM6YU6Yc6Yk6Ys6Y-6Z66ZC6ZK6ZS6Za6Zi6Zq6Zy6a46a86aG6aO6aW6al6at6a_6b76b96bN6bV6bd6bl6bt6bz6c56cD6cN6dv6e76e96i66iE6iJ6iU6ic6ik6is6i-6j66jE6jM6jU6jc6jk6jq6jy6k46kC6kK6kS6ka6ki6km6ku6l06l86lN6lV6ld6ll6lt6l_6m76mF6mN6mT6mb6mj6mr6mv6nn6n_6o76o96qn6qv6rX6sE6sM6sU6sc6sk6ss6s-6t66tE6tM6tU6ta6ti6ts6t-6u46uC6uM6uS6ua6ui6uq6uy6v46vC6vK6vO6vW6ve6vm6v_6w76wF6wN6wV6wd6wl6wt6w_6x56xD6xL6xT6xX6yP6yd6yl6_T6_X6_f70s70-71671E71M71U71c71k71s71-72672C72K72S72a72i72q72y73673E73M73U73Z73h73p73x74074874G74O74W74e74m74u75175F75N75V75d75j75r75z76576978v79279D79L79P7A57A97AH7BU7Bc7Bk7Bs7B-7C67CE7CM7CU7Cc7Ci7Cq7Cy7D47DC7DK7DS7Da7Dk7Ds7D-7E67EB7EJ7ER7EZ7Ee7Em7Eu7F07F87FG7FO7FW7Ff7Ft7F_7G77G97GN7GV7Gd7Gl7JX7Jg7Jo7Jz7K17K97KH7LD7LL7LP7M67ME7MJ7MR7Mc7Mk7Ms7M-7N67NE7NK7NS7Na7Ni7Nq7Ny7O47OC7OM7OU7Oc7Ok7Op7Ox7P37PB7PG7PO7PW7Pe7Pm7Pu7Q07Q87QH7QV7Qd7Ql7Qn7Q_7R77RF7RN7U97UI7UQ7Ub7Uf7Un7Uv7Vr7Vz7W57W97WM7WU7Wc7Wk7Ws7W-7X47XC7XK7XS7Xa7Xi7Xq7Xy7Y47YC7YK7YS7Ya7Yi7Yq7Y-7Z67ZE7ZM7ZR7ZZ7Zh7Zp7Zu7a07a87aG7aO7aW7ae7am7av7b77bF7bN7bP7bd7bl7bt7b_7en7ew7f27fD7fH7fP7gT7gb7gj7gn7g-7h67hE7hM7hU7hc7hi7hq7hy7i47iC7iK7iS7ia7ii7iq7iy7j67jE7jM7jU7jZ7jh7jp7jx7k07k87kJ7kR7l07lF7lG7lO7lW7le7lm7lu7m07mP7mX7mf7mn7mv7n17pT7pY7pg7pr7pv7q17r57rD7rL7rP7rc7rk7rs7r-7s67sE7sK7sS7sa7si7sq7sy7t47tC7tK7tS7ta7tk7ts7t-7u67uB7uJ7uR7uZ7ue7um7uu7v07vl7vt7v_7w77w87wG7wO7wW7we7xN7xV7xd7xl7xn7-57-A7-I7-Q7-Y7-g7-r7-v7_17_97_L7_T7_b7_h7_p7_v80E80M80U80c80k80s80y81481C81K81S81a81i81q81y82482C82M82U82c82k82p82x83383B83G83O83W83e84G84O84d84l84m84u85085885G85_86786F86N86P88j88o88w89289A89I89Q89X89f89n89z8A58AD8AM8AS8Aa8Ak8Aq8Ay8B48BC8BK8BS8Ba8Bi8Bq8By8C48CC8CK8CS8Ca8Ci8Cq8C-8D68DE8DM8DU8Dc8Dk8Dp8Du8E08E88EG8Eu8F08F88FG8FO8FW8Fe8Fm8Fu8Gd8Gl8Gt8G_8JL8JQ8JY8Jg8Jo8Jw8K28K98KH8KP8Kb8Kj8Kr8K-8L68LC8LM8LS8La8Li8Lq8Ly8M48MC8MK8MS8Ma8Mi8Mq8My8N68NE8NM8NU8Nc8Nk8Ns8N-8O38OB8OJ8OR8OW8Oe8Om8Ou8PW8Pe8Pm8Pu8Q08Q88QG8QO8QW8RF8RN8RV8Rd8Tz8U28UA8UI8UQ8UY8Uj8Un8Uv8V58VD8VL8VT8Va8Vk8Vq8V-8W48WC8WK8WS8Wa8Wi8Wq8Wy8X48XC8XK8XS8Xa8Xk8Xs8X-8Y68YE8YM8YU8Yc8Yh8Ym8Yu8Z38Ze8Zm8Zu8eb8eg8eo8ew8f28fA8fI8fQ8fY8fg8fp8fz8g58gC8gK8gS8gc8gi8gq8gy8h48hC8hK8hS8ha8hi8hq8hy8i48iC8iM8iU8ic8ik8is8i-8j68jE8jJ8jO8jW8jh8kG8kO8kW8kf8pD8pI8pQ8pY8pg8po8pw8q28qA8qI8qS8qa8qi8qq8qy8r48rC8rK8rS8ra8ri8rq8ry8s48sC8sK8sS8sa8si8sq8s-8t68tE8tM8tU8tc8tk8ts8tx8u08u88uJ8uu8v08v88vH8zr8zw8-28-A8-I8-Q8-Y8-g8-o8-w8_48_C8_K8_S8_a8_i8_q8_y90490C90K90S90a90i90q90y91691E91M91U91c91k91s91-92692E92M92U92Z92h92p93W93e93m93v95P96H96P98T98Y98g98o98w99299A99I99Q99Y99i99q99y9A49AC9AK9AS9Aa9Ai9Aq9Ay9B49BC9BK9BS9Ba9Bk9Bs9B-9C69CE9CM9CU9Cc9Ch9Cp9Cx9D39F19Fv9G19G_9H79HF9HN9J79JF9JN9JT9JY9Jg9Jo9Jw9K29KA9KK9KS9Ka9Ki9Kq9Ky9L49LC9LK9LS9La9Li9Lq9Ly9M49MC9MM9MU9Mc9Mk9Ms9M-9N69NE9NJ9NR9NZ9Nh9RP9Rd9Rl9Rt9R_9Tl9Tt9T_9U59UA9UI9UQ9UY9Ug9Uo9Uw9V29VA9VK9VS9Va9Vi9Vq9Vy9W49WC9WK9WS9Wa9Wi9Wq9W-9X69XE9XM9XU9Xc9Xk9Xs9Xx9Y39YB9YJ9YZ9Ye9cF9cN9cV9cd9eN9eV9ed9ej9eo9ew9f29fA9fI9fQ9fY9fg9fo9fw9g29gA9gI9gS9ga9gi9gq9gy9h69hE9hK9hS9hc9hk9hs9h-9i69iE9iM9iU9ic9ik9is9ix9j39j89jG9op9o_9p79pF9pI9pQ9pY9pg9po9pw9q29qA9qI9qQ9qY9qg9qo9qw9r49rC9rK9rS9ra9rk9rq9ry9s49sE9sM9sU9sc9sp9sx9t39tB9tJ9tR9tZ9th9tm9tu9zR9zd9zj9zr9zw9-29-A9-I9-Q9-Y9-g9-o9-w9_29_A9_I9_Q9_Y9_i9_q9_yA04A0CA0MA0SA0aA0iA0sA0-A16A1EA1JA1RA1ZA1hA2hA2pA2xA83A89A8HA8PA8dA8jA8rA8wA92A9AA9IA9QA9YA9gA9oA9wAA2AAAAAKAASAAaAAiAAqAA-AB4ABCABKABUABcABkABsABxAC3ACBACJADJADRADZADeAIhAInAIvAJ1AJFAJNAJVAJdAJjAJrAJzAK2AKAAKIAKQAKYAKgAKoAKyAL4ALCALKALSALcALiALqALyAM6AMEAMMAMUAMZAMhAMpAMxANxAO3AO8AOGAPWAPeAPmAPuAS9ASHATJATPATXATfATtAT_AU7AUFAULAUTAUbAUgAUoAUwAV2AVAAVIAVTAVbAVjAVrAVyAW4AWCAWKAWSAWaAWkAWsAW-AX6AXBAXJAXRAXZAYZAYhAYmAYuAa8AaGAaOAaWAcfActAc_Ad1AdxAe5AeDAeLAeVAedAelAetAezAf5AfDAfIAfQAfYAfgAfoAfwAg5AgDAgLAgQAgYAggAgoAgwAh2AhAAjBAjJAjRAjWAkmAkuAl0Al8AoZAofAorAozAp7ApFApNApVApbApjAprApwAq2AqAAqIAqQAqYAqjAqoAqwAr2ArAArIArQArYArgAroAryAs6AsEAsMAvOAvWAveAvmAznAzvA-1A-DA-LA-TA-YA-gA-oA-wA_2A_AA_IA_QA_YA_gA_oA_wB02B0AB0IB0QB0cB0kB0sB0-B40B48B4GB4OB5nB5vB61B69B89B8HB8PB8XB8fB8nB8vB91B99B9HB9PB9bB9jB9oB9wBA2BAABAIBAQBAYBAgBAoBAwBB2BBEBBMBBUBBcBG9BGHBGPBGXBGfBGnBGvBH1BInBIvBJ1BJ9BJHBJPBJXBJfBJnBJvBK1BK9BKHBKPBKXBKfBKnBKvBL5BLDBLLBLQBLYBLgBLsBL-BM6BMEBQfBQnBQwBR2BRDBRLBRTBRXBRfBRnBTXBTfBTvBU1BU9BUHBUPBUXBUfBUvBV1BV9BVHBXJBbHBbPBbYBbgBboBbwBc2BcFBcHBcPBcXBcf' };
  const CA = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';

  const CRTP = (() => {
    const out = [], s = CRT.pts;
    for (let k = 0; k < s.length; k += 3) {
      const v = CA.indexOf(s[k]) * 4096 + CA.indexOf(s[k + 1]) * 64 + CA.indexOf(s[k + 2]);
      const c = v % 8, cell = (v - c) / 8, i = cell % CRT.nx, j = (cell - i) / CRT.nx;
      const f = fxy((CRT.x0 + i * CRT.step + 1) / 1672, (CRT.y0 + j * CRT.step + 1) / 941);
      out.push([f[0], f[1], c]);
    }
    return out;
  })();
  const NCRT = CRTP.length;
  const MS_L = MS_B2.map((i) => MS_VIS[i]).concat(MS_B3V.map((i) => MS_VIS[i]), MS_OFF), MS_N2 = MS_B2.length, MS_NL = MS_L.length;

  const MS_S = (() => {
    const r = U.rng(5712);
    return MS_L.map((f, s) => {
      let k = Math.floor(U.fract((s + 0.5) * 0.6180339887) * NCRT);
      while (CRTP[k][2] === 1 || CRTP[k][2] === 7) k = (k + 1) % NCRT;
      const o = [CRTP[k][0], CRTP[k][1]], e = fxy(f[0], f[1]), dx = e[0] - o[0], dy = e[1] - o[1], jt = (r() - 0.5) * 60;
      return { c: CRTP[k][2], a: o, b: [o[0] + dx * 0.1 + jt, o[1] + dy * 0.6], c2: [o[0] + dx * 0.7, e[1] - dy * 0.05], d: e };
    });
  })();
  const msCurve = (q) => {
    const pts = [];
    for (let i = 0; i <= 12; i++) { const p = bez(q.a, q.b, q.c2, q.d, i / 12); pts.push(wpz(p[0], p[1], PZ)); }
    return pts;
  };

  const msR = (stage) => fnR('s7:ms' + stage, 5711, (P, cnt, rnd) => {
    const ak = 65536 / cnt, pal = CRT.pal.map((h) => U.lin(h)), wa = U.lin('#ffd9a0');
    for (let j = 0; j < cnt; j++) {
      const g1 = U.gauss(rnd), g2r = U.gauss(rnd), u = rnd(), u2 = rnd(), tt = rnd(), h = rnd();
      const band = u < 0.5 ? 0 : u < 0.72 ? 2 : 3;
      if (band === 0) {
        const q = CRTP[Math.floor(u2 * NCRT)], c = pal[q[2]], hot = h > 0.996, p = wp(q[0] + g1 * 1.5, q[1] + g2r * 1.5);
        const a = (q[2] === 1 || q[2] === 7 ? 0.018 : 0.035) * (hot ? 3 : 1);
        P.add(p[0], p[1], 0, hot ? 2.2 : 1.6, c[0], c[1], c[2], Math.min(1, a * ak), U.clamp((q[1] - 230) / 310) * 0.98 + tt * 0.02);
        continue;
      }
      const fs = U.fract(j * 0.7548776662), s = band === 2 ? Math.floor(fs * MS_N2) : MS_N2 + Math.floor(fs * (MS_NL - MS_N2)), m = MS_S[s];
      if (stage < band) {
        const p = wp(m.a[0], m.a[1]), c = pal[m.c];
        P.add(p[0], p[1], 0, 1.6, c[0], c[1], c[2], 0, tt);
        continue;
      }
      const b = bez(m.a, m.b, m.c2, m.d, tt), halo = h < 0.2, sg = halo ? 6 : 1.8, p = wp(b[0] + g1 * sg, b[1] + g2r * sg);
      const c = mx(pal[m.c], wa, U.smooth(0.15, 0.85, tt));
      P.add(p[0], p[1], 0, 1.6, c[0], c[1], c[2], Math.min(1, 0.05 * (halo ? 0.3 : 1) * ak), tt);
    }
  });
  const MSR = [1, 2, 3].map(msR);

  const WV = [
    { cx: 300, H: 70, w: 110, t: '雑誌に投稿' },
    { cx: 610, H: 130, w: 140, t: 'ネットで無料公開' },
    { cx: 930, H: 190, w: 160, t: 'ブログ' },
    { cx: 1270, H: 290, w: 190, t: 'SNS・YouTube' },
    { cx: 1640, H: 420, w: 230, t: 'AIに伝える' },
  ];
  const WV_Y = 800;

  const wvC = (k, x) => { const q = WV[k], dx = x - q.cx, wk = dx < 0 ? q.w * 1.3 : q.w * 0.7; return q.H * Math.exp(-(dx / wk) * (dx / wk)); };

  const wvY = (x, n) => { let s = 0; for (let k = 0; k < n; k++) { const c = wvC(k, x); s += c * c * c; } return WV_Y - Math.cbrt(s); };
  const wvPath = (k0, k1, n) => Array.from({ length: 11 }, (_, i) => { const x = WV[k0].cx + ((WV[k1].cx - WV[k0].cx) * i) / 10; return [x, wvY(x, n) - 8]; });
  const wvR = (stage) => fnR('s7:waves' + stage, 5721, (P, cnt, rnd) => {
    const ak = 65536 / cnt, am = U.lin(C.amber), g2 = U.lin(C.gold2), cy = U.lin(C.cyan), wh = U.lin(C.white), n = stage + 2;
    for (let j = 0; j < cnt; j++) {
      const g1 = U.gauss(rnd), g2r = U.gauss(rnd), u = rnd(), v = rnd(), h = rnd();
      const xf = U.fract(j * 0.6180339887), x = 40 + xf * 1880, ys = wvY(x, n), fill = u < 0.25;
      let y = ys + g2r * 1.2, a = 0.03, sz = 1.5;
      if (fill) { const fr = Math.pow(v, 1.6); y = ys + fr * (940 - ys); a = 0.012 * (1 - fr); }
      a *= U.smooth(40, 160, x) * U.smooth(1880, 1760, x);
      if (stage < 3) a *= 1 - 0.7 * U.smooth(1450, 1700, x);
      let share = 0;
      if (stage === 3) { const c4 = wvC(4, x), dd = WV_Y - ys; share = dd > 0.5 ? Math.min(1, (c4 * c4 * c4) / (dd * dd * dd)) : 0; }
      let c = mx(mx(am, g2, xf), cy, share);
      if (!fill && h > 0.993) (a *= 4), (c = mx(wh, cy, share * 0.6)), (sz = 2.0);
      const p = wp(x + g1 * 0.8, y);
      P.add(p[0], p[1], 0, sz, c[0], c[1], c[2], Math.min(1, a * ak), xf);
    }
  });
  const WVR = [1, 2, 3].map(wvR);
  KS.scene({
    id: 'manuscript', sec: 6, title: '雑誌への投稿から、ネット、そしてAIへ', swarm: true, kf: [1, 2, 4],
    world: VOID(), images: ['retro_pc'],
    build(S) {
      const d = S.data, r = U.rng(5713);
      d.bg = K.photo(S, 'retro_pc', { z: PZ, w: PW, fe: 90 });
      d.sc = scrim(S, 'linear-gradient(90deg, rgba(2,3,8,.85) 0%, rgba(2,3,8,.7) 35%, rgba(2,3,8,0) 58%)');
      prep(S, MSR[1]);
      prep(S, MSR[2]);
      WVR.forEach((R) => prep(S, R));
      S.swarmPivot(0, 0, 0);
      const rib = (lo, hi, t0, tw0) => S.ribbon({
        curves: MS_S.slice(lo, hi).map((q, i) => ({ pts: msCurve(q), w: 3.6, col: CRT.pal[q.c], col2: '#ffe2b0', mul: 0.8, t: [i * t0, i * t0 + tw0] })),
        prog: 0, head: 1, pulse: 0.9, pulseS: 0.22, pulseW: 0.04, glow: 0.5, core: 1, glowW: 6, o: 0.8, order: 22,
      });
      d.r2 = rib(0, MS_N2, 0.05, 0.45);
      d.r3 = rib(MS_N2, MS_NL, 0.02, 0.44);
      d.ends2 = MS_L.slice(0, MS_N2).map((f) => pinGlow(S, f, { size: 16, col: '#ffd9a0', tw: 0.3 }, r));
      d.ends3 = MS_L.slice(MS_N2).map((f) => pinGlow(S, f, { size: 16, col: '#ffd9a0', tw: 0.3 }, r));
      d.flop = pinGlow(S, [0.445, 0.5], { size: 150, col: C.gold2, mul: 0.6 }, r);
      d.leds = MS_LED.map((f, i) => { const q = pinGlow(S, f, { size: 10, col: '#8dffb0', tw: 0.5 }, r); q.w = 6 + i * 1.7; return q; });
      d.pins = d.ends2.concat(d.ends3, [d.flop], d.leds);

      d.k1 = S.text('高校生の頃', { cls: 'sans', size: 26, x: 120, y: 150, color: C.gold, ls: 0.2 });
      d.m1 = S.text('自分で作ったゲームやソフトを、\nパソコン雑誌に投稿していた', { cls: 'serif', size: 44, x: 120, y: 196, color: C.white, lh: 1.5, ls: 0.04 });
      d.k1b = S.text('原稿料', { cls: 'sans', size: 24, x: 122, y: 392, color: DIM, ls: 0.2 });
      d.fee = S.text('{1本　3万〜5万円}', { cls: 'serif', size: 58, x: 118, y: 426, color: C.white, ls: 0.04 });

      d.k2 = S.text('大学に入ると　パソコン通信、Windows 95 の時代へ', { cls: 'sans', size: 26, x: 120, y: 150, color: C.gold, ls: 0.08 });
      d.m2 = S.text('作ったものを、すぐに\nネットで{無料で公開}', { cls: 'serif', size: 46, x: 120, y: 196, color: C.white, lh: 1.5, ls: 0.04 });
      d.m2b = S.text('「もったいない」とは、みじんも思わなかった', { cls: 'serif', size: 34, x: 120, y: 400, color: C.cream, ls: 0.04 });

      d.c1 = K.chip(S, '雑誌', { x: 120, y: 600, anchor: 'cl' });
      d.t1 = S.text('たまたま買った人にしか届かない', { cls: 'sans', size: 28, x: 252, y: 600, anchor: 'cl', color: DIM, ls: 0.06 });
      d.c2 = K.chip(S, 'ネット', { x: 120, y: 680, anchor: 'cl' });
      d.t2 = S.text('いずれ、{世界中の人に届く}', { cls: 'serif', size: 38, x: 252, y: 680, anchor: 'cl', color: C.white, ls: 0.04 });

      d.lab = WV.map((q, k) => S.text(q.t, { cls: 'sans', size: 22, x: q.cx, y: WV_Y - q.H - 30, anchor: 'bc', color: k === 4 ? C.cyan : C.gold2, ls: 0.1 }));
      d.dot = WV.map((q, k) => K.glow(S, { x: q.cx, y: WV_Y - q.H, size: 34, col: k === 4 ? C.cyan : C.gold2, mul: 1.0 }));
      d.rider = K.glow(S, { x: WV[2].cx, y: WV_Y - WV[2].H - 8, size: 120, type: 'flare', spikes: 4, col: C.gold2, mul: 1.3 });
      d.w1 = S.text('ブログで、誰でも発信できるようになった頃も', { cls: 'serif', size: 42, x: 120, y: 112, color: C.white, ls: 0.04 });
      d.qt = S.text('「素人の書いた記事なんて\n誰が読むの？」と言われていた', { cls: 'sans', size: 24, x: 930, y: 528, anchor: 'bc', color: DIM, lh: 1.55, ls: 0.06 });
      d.w2 = S.text('その先には、{SNSやYouTube}の世界が待っていた', { cls: 'serif', size: 42, x: 120, y: 174, color: C.white, ls: 0.04 });

      d.qt2 = S.text('「AIに学習されるのは嫌だ」\nという人もいる', { cls: 'sans', size: 24, x: WV[4].cx, y: WV_Y - WV[4].H - 82, anchor: 'bc', color: DIM, lh: 1.55, ls: 0.06 });
      d.w3 = S.text('知的な存在の{圧倒的大多数}は、いずれAIになる', { cls: 'serif', size: 42, x: 120, y: 236, color: C.white, ls: 0.04 });
      d.w4 = S.text('そのAIに、自分の考えや知識を{伝えられる}', { cls: 'serif', size: 42, x: 120, y: 298, color: C.white, ls: 0.04 });
      d.w5 = S.text('雑誌からネットに移った、あの頃と同じワクワク', { cls: 'serif', size: 42, x: 120, y: 360, color: C.gold2, ls: 0.04 });
    },
    steps: [
      (S) => {
        const d = S.data;
        K.reveal(d.bg, { dur: 3.0 });
        K.drift(S, d.bg, { zoom: 1.02, px: 0.005, py: 0.0023, dur: 26 });
        K.fade(d.sc, 1, { dur: 1.4, delay: 0.2 });
        K.sw(S, MSR[0], { dur: 3.4, delay: 0.8, ord: 1, amt: 0.6, spread: 40, ease: 'out' });
        look(S, { i: 1, size: 1.9, wob: 0.35, wobF: 0.5, twk: 0.2 }, 1.6);
        glowTo(d.flop.sp, 0.4, { delay: 2.6, dur: 1.6 });
        K.show(d.k1, { delay: 0.6, dy: 0, x0: -12 });
        TX.in(d.m1, 'lines', { delay: 0.9, dy: 16 });
        K.show(d.k1b, { delay: 2.2, dy: 8 });
        TX.in(d.fee, 'rise', { delay: 2.5, stagger: 0.05 });
        TX.glint(d.fee, { delay: 3.6, dur: 1.6 });
      },
      (S) => {
        const d = S.data;
        [d.k1, d.m1, d.k1b, d.fee].forEach((el, i) => TX.out(el, 'sink', { delay: i * 0.06 }));
        glowTo(d.flop.sp, 0, { dur: 1.0 });
        d.leds.forEach((q, i) => glowTo(q.sp, 0.9, { delay: 0.3 + i * 0.12, dur: 0.4 }));
        K.sw(S, MSR[1], { dur: 3.6, delay: 0.6, ord: 1, amt: 0.7, spread: 24, ease: 'out' });
        tw(d.r2, { prog: 1 }, { dur: 4.2, delay: 0.9, ease: 'linear' });
        d.ends2.forEach((q, i) => ignite(q.sp, { delay: 0.9 + (i * 0.05 + 0.45) * 4.2, peak: 1, rest: 0.6 }));
        K.show(d.k2, { delay: 0.7, dy: 0, x0: -12 });
        TX.in(d.m2, 'lines', { delay: 1.0, dy: 16 });
        TX.glint(d.m2, { delay: 2.6, dur: 1.6 });
        TX.in(d.m2b, 'rise', { delay: 2.4, stagger: 0.03 });

        const t0 = 5.6;
        TX.dim(d.m2b, 0.55, { dur: 1.0, delay: t0 });
        K.sw(S, MSR[2], { dur: 3.8, delay: t0, ord: 1, amt: 0.7, spread: 24, ease: 'out' });
        tw(d.r3, { prog: 1 }, { dur: 4.6, delay: t0 + 0.2, ease: 'linear' });
        d.ends3.forEach((q, i) => ignite(q.sp, { delay: t0 + 0.2 + (i * 0.02 + 0.44) * 4.6, peak: 1, rest: 0.6 }));
        K.pop(d.c1, { delay: t0 + 0.2 });
        K.show(d.t1, { delay: t0 + 0.4, dy: 0, x0: -10 });
        K.pop(d.c2, { delay: t0 + 1.2 });
        TX.in(d.t2, 'rise', { delay: t0 + 1.4, stagger: 0.04 });
        TX.glint(d.t2, { delay: t0 + 2.8, dur: 1.6 });
      },
      (S) => {
        const d = S.data;
        d.free = true;
        [d.k2, d.m2, d.m2b, d.c1, d.t1, d.c2, d.t2].forEach((el, i) => TX.out(el, 'sink', { delay: i * 0.05 }));
        K.unreveal(d.bg, { dur: 1.8 });
        K.fade(d.sc, 0, { dur: 1.2 });
        tw(d.r2, { o: 0 }, { dur: 1.2 });
        tw(d.r3, { o: 0 }, { dur: 1.2 });
        d.pins.forEach((q) => glowTo(q.sp, 0, { dur: 0.8 }));
        S.world(WORLD(), { dur: 2.4, delay: 0.4 });
        const sw = SW();
        if (sw && !sw.inert) T.to(sw.m, { s: 1, x: 0, y: 0 }, { dur: 1.6, ease: 'inOutSine' });
        K.sw(S, WVR[0], { dur: 3.2, delay: 0.5, ord: 1, amt: 0.6, spread: 60, ease: 'out' });
        look(S, { i: 1, size: 1.8, wob: 0.3, wobF: 0.5, twk: 0.2 }, 1.6);
        [0, 1, 2].forEach((k) => { glowTo(d.dot[k], 0.8, { delay: 1.4 + k * 0.5, dur: 0.8 }); K.show(d.lab[k], { delay: 1.5 + k * 0.5, dy: 8 }); });
        TX.in(d.w1, 'rise', { delay: 1.8, stagger: 0.03 });
        K.show(d.qt, { delay: 3.0, dy: 10 });
        if (!d.rider.inert) {
          sprAt(S, d.rider, WV[2].cx, WV_Y - WV[2].H - 8);
          T.to(d.rider, { o: 1 }, { dur: 0.6, delay: 2.8, ease: 'outCubic' });
          T.to(d.rider, { o: 0.75 }, { dur: 1.4, delay: 3.4, ease: 'inOutSine', overwrite: false });
        }

        TX.dim(d.qt, 0.4, { dur: 1.0, delay: 5.0 });
        TX.dim(d.w1, 0.55, { dur: 1.0, delay: 5.0 });
        K.sw(S, WVR[1], { dur: 3.2, delay: 5.0, ord: 1, amt: 0.5, spread: 30, ease: 'out' });
        TX.in(d.w2, 'rise', { delay: 5.4, stagger: 0.03 });
        glowTo(d.dot[3], 0.8, { delay: 7.2, dur: 0.8 });
        K.show(d.lab[3], { delay: 7.3, dy: 8 });
        const e = along(S, d.rider, wvPath(2, 3, 4), 0, { delay: 7.4, dur: 2.4, ease: 'inOutSine' });
        glowTo(d.rider, 1, { delay: 7.4, dur: 0.4 });
        glowTo(d.rider, 0.75, { delay: e, dur: 1.2, overwrite: false });
      },
      (S) => {
        const d = S.data;
        TX.dim(d.w1, 0.4, { dur: 1.0 });
        TX.dim(d.w2, 0.5, { dur: 1.0 });
        K.sw(S, WVR[2], { dur: 3.6, delay: 0.2, ord: 1, amt: 0.5, spread: 30, ease: 'out' });
        K.show(d.qt2, { delay: 1.6, dy: 10 });
        glowTo(d.dot[4], 0.9, { delay: 2.9, dur: 0.9 });
        TX.in(d.w3, 'rise', { delay: 4.2, stagger: 0.03 });

        const e = 7.6;
        K.show(d.lab[4], { delay: e - 0.2, dy: 8 });
        along(S, d.rider, wvPath(3, 4, 5), 0, { delay: e - 2.6, dur: 2.6, ease: 'inOutSine' });
        TX.in(d.w4, 'rise', { delay: e - 0.4, stagger: 0.03 });
        glowTo(d.rider, 0, { delay: e - 0.4, dur: 0.9 });
        if (d.dot[4] && !d.dot[4].inert) T.to(d.dot[4], { o: 1, size: 60 }, { dur: 0.5, delay: e - 0.3, ease: 'outCubic', overwrite: false });
        TX.dim(d.qt2, 0.55, { dur: 1.0, delay: e + 1.6 });
        TX.in(d.w5, 'rise', { delay: e + 2.4, stagger: 0.035 });
        TX.glint(d.w5, { delay: e + 3.6, dur: 1.8 });
      },
    ],
    update(S, t) {
      const d = S.data;
      pin(S, d.bg, d.pins, t);
      pinRibbon(d.bg, d.r2);
      pinRibbon(d.bg, d.r3);
      if (!d.free) follow(S, d.bg);
    },
  });

  const GM_F = { x: 820, y: 170, w: 960, h: 540 };
  const gmPer = (t) => {
    const F = GM_F, s = t * 2 * (F.w + F.h);
    if (s < F.w) return [F.x + s, F.y, 0, -1];
    if (s < F.w + F.h) return [F.x + F.w, F.y + s - F.w, 1, 0];
    if (s < 2 * F.w + F.h) return [F.x + F.w - (s - F.w - F.h), F.y + F.h, 0, 1];
    return [F.x, F.y + F.h - (s - 2 * F.w - F.h), -1, 0];
  };
  const GM_Y = 860, GM_X0 = 160, GM_X1 = 1760;
  const gmR = (stage) => fnR('s7:games' + stage, 5731, (P, cnt, rnd) => {
    const ak = 65536 / cnt, g2 = U.lin(C.gold2), cy = U.lin(C.cyan), cr = U.lin(C.cream), wh = U.lin(C.white);
    for (let j = 0; j < cnt; j++) {
      const g1 = U.gauss(rnd), g2r = U.gauss(rnd), u = rnd(), h = rnd();
      const t = U.fract(j * 0.6180339887);
      if (stage === 2 && u < 0.7) {
        const p = wp(GM_X0 + t * (GM_X1 - GM_X0) + g1 * 0.8, GM_Y + g2r * 1.2);
        let c = mx(g2, cy, U.smooth(0.3, 0.7, t)), a = 0.04, sz = 1.5;
        if (h > 0.994) (c = wh), (a *= 3), (sz = 2.0);
        P.add(p[0], p[1], 0, sz, c[0], c[1], c[2], Math.min(1, a * ak), t);
        continue;
      }
      const q = gmPer(t), off = Math.abs(g1) * 10 + 1.5, p = wp(q[0] + q[2] * off, q[1] + q[3] * off);
      let c = mx(g2, cr, 0.3), a = (0.012 + 0.03 * Math.exp(-off / 3)) * (stage === 2 ? 0.7 : 1), sz = 1.5;
      if (h > 0.995) (c = wh), (a *= 3), (sz = 2.0);
      P.add(p[0], p[1], 0, sz, c[0], c[1], c[2], Math.min(1, a * ak), t);
    }
  });
  const GMR = [1, 2].map(gmR);
  KS.scene({
    id: 'games', sec: 6, title: '30年前のゲームが、AIの手で', swarm: true, kf: [2], world: WORLD(),
    build(S) {
      const d = S.data;
      prep(S, GMR[1]);
      d.fr = K.video(S, 'games.mp4', { x: GM_F.x, y: GM_F.y, w: GM_F.w, h: GM_F.h, style: { boxShadow: '0 0 0 1px rgba(242,183,102,.35), 0 30px 90px rgba(0,0,0,.6)' } });
      T.setEl(d.fr, { o: 0 });
      d.g1 = S.text('その頃に作っていたゲームを', { cls: 'sans', size: 26, x: 120, y: 180, color: C.gold, ls: 0.1 });
      d.g2 = S.text('今年、{AIと一緒に}、\n今のブラウザで遊べるように\n移植・リメイクしている', { cls: 'serif', size: 46, x: 120, y: 226, color: C.white, lh: 1.5, ls: 0.04 });
      d.qr = K.link(S, { x: 120, y: 500, anchor: 'tl', size: 170, url: 'https://frievegames.com', label: 'frievegames.com' });

      d.n0 = K.glow(S, { x: GM_X0, y: GM_Y, size: 44, col: C.gold2, mul: 1.0 });
      d.n1 = K.glow(S, { x: GM_X1, y: GM_Y, size: 44, col: C.cyan, mul: 1.0 });
      d.bg = K.glow(S, { x: GM_X0, y: GM_Y, size: 110, type: 'flare', spikes: 4, col: C.gold2, mul: 1.3 });
      d.bc = K.glow(S, { x: GM_X0, y: GM_Y, size: 110, type: 'flare', spikes: 4, col: C.cyan, mul: 1.3 });
      d.la = S.text('30年以上前　自分の手で', { cls: 'sans', size: 24, x: 140, y: 884, color: C.gold2, ls: 0.08 });
      d.lb = S.text('いま　AIの手で、また動き出している', { cls: 'sans', size: 24, x: 1780, y: 884, anchor: 'tr', color: C.cyan, ls: 0.08 });
      d.st = S.text('これも、小さな受け渡しなのかもしれない', { cls: 'serif', size: 40, x: 960, y: 800, anchor: 'bc', color: C.gold2, ls: 0.06 });
    },
    steps: [
      (S) => {
        const d = S.data;
        K.show(d.fr, { delay: 0.4, dy: 20, blur: 10, dur: 1.4 });
        K.play(S, d.fr, { delay: 0.6 });
        K.sw(S, GMR[0], { dur: 3.0, delay: 0.5, ord: 1, amt: 0.6, spread: 40, ease: 'out' });
        look(S, { i: 1, size: 1.8, wob: 0.4, wobF: 0.5, twk: 0.25 }, 1.6);
        K.show(d.g1, { delay: 0.8, dy: 0, x0: -12 });
        TX.in(d.g2, 'lines', { delay: 1.1, dy: 16 });
        TX.glint(d.g2, { delay: 2.6, dur: 1.6 });
        K.pop(d.qr, { delay: 2.2 });
      },
      (S) => {
        const d = S.data;
        K.sw(S, GMR[1], { dur: 2.8, delay: 0.3, ord: 1, amt: 0.4, spread: 30, ease: 'out' });
        glowTo(d.n0, 0.8, { delay: 0.6, dur: 0.8 });
        K.show(d.la, { delay: 0.8, dy: 8 });
        if (!d.bg.inert) {
          const P = [[GM_X0, GM_Y], [960, GM_Y], [GM_X1, GM_Y]];
          const e = along(S, d.bg, P, 0, { delay: 1.6, dur: 3.2, ease: 'inOutSine' });
          along(S, d.bc, P, 0, { delay: 1.6, dur: 3.2, ease: 'inOutSine' });
          T.to(d.bg, { o: 1 }, { dur: 0.4, delay: 1.6, ease: 'outCubic' });
          T.to(d.bg, { o: 0 }, { dur: 1.4, delay: 2.6, ease: 'inOutSine', overwrite: false });
          T.to(d.bc, { o: 1 }, { dur: 1.4, delay: 2.6, ease: 'inOutSine' });
          T.to(d.bc, { o: 0 }, { dur: 0.8, delay: e, ease: 'inOutSine', overwrite: false });
          ignite(d.n1, { delay: e - 0.15, peak: 1.4, rest: 0.85, fall: 1.0 });
        } else glowTo(d.n1, 0.85, { delay: 3.8 });
        K.show(d.lb, { delay: 4.4, dy: 8 });
        TX.in(d.st, 'rise', { delay: 5.0, stagger: 0.04 });
        TX.glint(d.st, { delay: 6.2, dur: 1.8 });
      },
    ],
  });

  const RG_X = 1300, RG_Y = 560, RG_R = [70, 150, 250, 360, 450], RG_K = 0.85, RG_N = ['人間', '人類', '生命', '知性', '次のもの'];
  const rgPt = (r) => [RG_X + 0.866 * r, RG_Y + 0.5 * r];
  const rgR = (stage) => fnR('s7:rings' + stage, 5751, (P, cnt, rnd) => {
    const ak = 65536 / cnt, am = U.lin(C.amber), g2 = U.lin(C.gold2), cy = U.lin(C.cyan), wh = U.lin(C.white);
    const sk = stage === 4 ? RG_K : 1, ln = mx(g2, wh, 0.4);
    for (let j = 0; j < cnt; j++) {
      const g1 = U.gauss(rnd), g2r = U.gauss(rnd), u = rnd(), v = rnd(), h = rnd(), w = rnd();
      if (U.fract(j * 0.7548776662) < 0.06) {
        if (stage < 3) { const p = wp(RG_X, RG_Y); P.add(p[0], p[1], 0, 1.5, ln[0], ln[1], ln[2], 0, v * 0.999); continue; }
        const r = stage === 3 ? 420 * v : 480 * v * RG_K, q = rgPt(r), p = wp(q[0] + g1 * 0.8, q[1] + g2r * 0.8);
        const c = stage === 4 ? mx(ln, cy, U.smooth(310, 370, r)) : ln;
        P.add(p[0], p[1], 0, 1.5, c[0], c[1], c[2], Math.min(1, 0.05 * ak), v * 0.999);
        continue;
      }
      if (u < 0.13) {
        const th = ((Math.floor(w * 24) * 2 + U.fract(w * 24)) * TAU) / 48, R = stage < 4 ? RG_R[3] : RG_R[4] * RG_K;
        const p = wp(RG_X + R * Math.cos(th) + g1 * 1.4, RG_Y - R * Math.sin(th) + g2r * 1.4);
        P.add(p[0], p[1], 0, 1.5, cy[0], cy[1], cy[2], stage < 4 ? 0 : Math.min(1, 0.045 * ak), 0.8 + 0.2 * w);
        continue;
      }

      const k = w < 0.0843 ? 0 : w < 0.2651 ? 1 : w < 0.5663 ? 2 : 3, th = v * TAU;
      const R = RG_R[k] * sk, halo = h < 0.15, hot = h > 0.995;
      const sg = (halo ? 7 : 1.4) + (stage === 2 ? [0, 4, 10, 16][k] : 0);
      let a = 0.038 * (halo ? 0.3 : 1) * (stage === 2 ? [1, 0.85, 0.6, 0.45][k] : 1), c = mx(am, g2, k / 3);
      if (hot) (a *= 3), (c = wh);
      const p = wp(RG_X + R * Math.cos(th) + g1 * sg, RG_Y - R * Math.sin(th) + g2r * sg);
      P.add(p[0], p[1], 0, hot ? 2.0 : 1.5, c[0], c[1], c[2], Math.min(1, a * ak), (k + v * 0.999) * 0.2);
    }
  });
  const RGR = [1, 2, 3, 4].map(rgR);
  KS.scene({
    id: 'rings', sec: 6, title: '誰の子孫か', swarm: true, kf: [4], world: WORLD(),
    build(S) {
      const d = S.data;
      RGR.slice(1).forEach((R) => prep(S, R));
      d.head = K.head(S, '誰の子孫か', { eye: 'WHOSE DESCENDANTS', size: 56 });
      d.cap = S.text('「超知能は、人間の子孫である前に、\n生命の子孫であり、知性の系譜の次の一段である。」', { cls: 'sans', size: 24, x: 120, y: 262, color: DIM, lh: 1.6, ls: 0.04 });
      d.leg = ['{人間}　一人の一生', '{人類}　一つの生物種', '{生命}　40億年の系譜', '{知性}　次々に現れる、より大きな知性']
        .map((s, i) => S.text(s, { cls: 'sans', size: 26, x: 120, y: 390 + i * 46, color: C.cream, ls: 0.06 }));
      d.s1 = S.text('内周から見た外周は、妄想に見える', { cls: 'serif', size: 40, x: 120, y: 650, color: C.white, ls: 0.04 });
      d.s2 = S.text('外周から見た内周は、通過点である', { cls: 'serif', size: 40, x: 120, y: 720, color: C.gold2, ls: 0.04 });
      d.s3 = S.text('その外側の知性も、またいつか、\n次のものに超えられていく', { cls: 'serif', size: 40, x: 120, y: 800, color: C.white, lh: 1.5, ls: 0.04 });
      d.src = K.src(S, '図：誰の子孫か（『人類という通過点』第15章より）');
      d.lab = RG_N.map((s, k) => S.text(s, {
        cls: 'sans', size: 22, x: RG_X, y: RG_Y - (k === 4 ? RG_R[4] * RG_K : RG_R[k]) + 14, anchor: 'tc', color: k === 4 ? C.cyan : C.gold2, ls: 0.2,
      }));
      d.dots = RG_R.slice(0, 4).map((R) => { const q = rgPt(R); return K.glow(S, { x: q[0], y: q[1], size: 30, col: C.gold2, mul: 1.0 }); });
      const q5 = rgPt(RG_R[4] * RG_K);
      d.dot5 = K.glow(S, { x: q5[0], y: q5[1], size: 34, col: C.cyan, mul: 1.0 });
      const q0 = rgPt(RG_R[0]);
      d.mark = K.glow(S, { x: q0[0], y: q0[1], size: 90, type: 'flare', spikes: 4, col: C.gold2, mul: 1.3 });
    },
    steps: [
      (S) => {
        const d = S.data;
        K.sw(S, RGR[0], { dur: 3.6, delay: 0.4, ord: 1, amt: 0.5, spread: 60, ease: 'out' });
        look(S, { i: 1, size: 1.8, wob: 0.3, wobF: 0.5, twk: 0.25 }, 1.6);
        d.head.in({ delay: 0.2 });
        K.show(d.cap, { delay: 0.9, dy: 10 });
        d.leg.forEach((el, i) => K.show(el, { delay: 1.4 + i * 0.55, dy: 0, x0: -12 }));
        d.lab.slice(0, 4).forEach((el, k) => K.show(el, { delay: 1.3 + k * 0.6, dy: 6 }));
        K.show(d.src, { delay: 3.4, dy: 6 });
      },
      (S) => {
        const d = S.data;
        K.sw(S, RGR[1], { dur: 2.4, delay: 0.2, ord: 0, amt: 0, spread: 10, ease: 'out' });
        d.lab.slice(1, 4).forEach((el, i) => T.el(el, { b: [2, 4, 6][i], o: [0.8, 0.65, 0.5][i] }, { dur: 2.0, delay: 0.3, ease: 'inOutSine' }));
        glowTo(d.mark, 0.95, { delay: 0.4, dur: 0.6 });
        TX.in(d.s1, 'rise', { delay: 0.6, stagger: 0.035 });
      },
      (S) => {
        const d = S.data;
        TX.dim(d.s1, 0.55, { dur: 1.0 });
        K.sw(S, RGR[2], { dur: 2.6, delay: 0.2, ord: 1, amt: 0.5, spread: 10, ease: 'out' });
        d.lab.slice(1, 4).forEach((el) => T.el(el, { b: 0, o: 1 }, { dur: 1.2, delay: 0.2, ease: 'inOutSine' }));
        RG_R.slice(0, 4).forEach((R, k) => ignite(d.dots[k], { delay: 0.7 + (R / 420) * 2.0, peak: 1.2, rest: 0.7 }));
        along(S, d.mark, [rgPt(RG_R[0]), rgPt((RG_R[0] + RG_R[3]) / 2), rgPt(RG_R[3])], 0, { delay: 0.8, dur: 2.4, ease: 'inOutSine' });
        TX.in(d.s2, 'rise', { delay: 0.6, stagger: 0.035 });
        TX.glint(d.s2, { delay: 2.4, dur: 1.8 });
      },
      (S) => {
        const d = S.data;
        TX.dim(d.s2, 0.6, { dur: 1.0 });
        K.sw(S, RGR[3], { dur: 3.2, delay: 0.3, ord: 0, amt: 0, spread: 10, ease: 'out' });
        d.lab.slice(0, 4).forEach((el, k) => T.el(el, { y: (1 - RG_K) * RG_R[k] }, { dur: 3.2, delay: 0.4, ease: 'inOutSine' }));
        d.dots.forEach((sp, k) => { if (sp && !sp.inert) { const q = rgPt(RG_R[k] * RG_K), p = S.at(q[0], q[1], 0); T.to(sp, { x: p[0], y: p[1] }, { dur: 3.2, delay: 0.4, ease: 'inOutSine' }); } });
        const e = along(S, d.mark, [rgPt(RG_R[3]), rgPt(RG_R[3] * RG_K)], 0, { delay: 0.4, dur: 3.2, ease: 'inOutSine' });
        if (d.mark && !d.mark.inert) {

          const leg = { p: 0 }, a = rgPt(RG_R[3] * RG_K), b = rgPt(RG_R[4] * RG_K);
          T.to(leg, { p: 1 }, {
            dur: 1.6, delay: e + 0.3, ease: 'inOutSine',
            onUpdate: () => { const w = S.at(a[0] + (b[0] - a[0]) * leg.p, a[1] + (b[1] - a[1]) * leg.p, 0); d.mark.x = w[0]; d.mark.y = w[1]; },
          });
          ignite(d.dot5, { delay: e + 1.8, peak: 1.4, rest: 0.85 });
        } else glowTo(d.dot5, 0.85, { delay: 3.6 });
        K.show(d.lab[4], { delay: 3.0, dy: 6 });
        TX.in(d.s3, 'lines', { delay: 0.8, dy: 16 });
      },
    ],
  });

  const LF_THREAD = [[419, 838], [676, 781], [949, 628], [1168, 496], [1389, 323]];
  const LF_ON = [[1389, 323], [1650, 170], [1900, 40], [2100, -60]];
  KS.scene({
    id: 'lookforward', sec: 6, title: '自分たちの先を楽しみにする', swarm: false, kf: [2, 4],
    world: { sky: 'deep', post: { vig: 0.46, bloom: 1 }, dust: { o: 0.5 } }, images: ['hand_light'],
    build(S) {
      const d = S.data;
      d.bg = K.photo(S, 'hand_light', { z: -700, w: 2100, fe: 44, exp: 0.85 });
      d.sc = scrim(S, 'linear-gradient(90deg, rgba(3,4,9,.55) 0%, rgba(3,4,9,.3) 45%, rgba(3,4,9,0) 70%)');
      d.flare = K.glow(S, { x: LF_THREAD[0][0], y: LF_THREAD[0][1], z: -700, type: 'flare', size: 210, spikes: 4, col: C.gold2, mul: 1.6 });
      d.hub = K.glow(S, { x: 1389, y: 323, z: -700, size: 520, col: C.gold2, mul: 1.1 });
      d.far = K.glow(S, { x: 1820, y: 120, z: -700, size: 900, col: C.cyan, mul: 0.7 });

      d.q = K.quote(S, 'ワクワクできる私たち、\nワクワクさせる未来を、ひらいていこう', { x: 174, y: 170, size: 50, src: 'この講演の場「感動セッション」が掲げる言葉' });
      d.t2 = S.text('私にとって、そのワクワクさせる未来は、\n{人類の先にまで}続いている', { cls: 'serif', size: 44, x: 174, y: 480, color: C.white, lh: 1.55, ls: 0.04 });

      d.l1 = S.text('自分たちが最高であり続けることより、\n{自分たちの先がある}ことを\n楽しみにする', { cls: 'serif', size: 50, x: 120, y: 170, color: C.white, lh: 1.55, ls: 0.04 });
      d.l2 = S.text('私は、そっちの未来を見てみたい', { cls: 'serif', size: 56, x: 120, y: 470, color: C.gold2, ls: 0.05 });
    },
    steps: [
      (S) => {
        const d = S.data;
        K.reveal(d.bg, { dur: 3.0, settle: 1.04 });
        K.drift(S, d.bg, { zoom: 1.04, px: 0.008, dur: 26 });
        K.fade(d.sc, 1, { dur: 1.6, delay: 0.3 });
        d.q.in({ delay: 0.8 });
        const f = d.flare;
        if (f && !f.inert) {
          const t1 = along(S, f, LF_THREAD, -700, { delay: 2.4, dur: 3.2, ease: 'inOutSine' });
          T.to(f, { o: 1 }, { dur: 0.5, delay: 2.4, ease: 'outCubic' });
          T.to(f, { o: 0 }, { dur: 0.7, delay: t1 - 0.5, ease: 'inOutSine', overwrite: false });
          T.to(d.hub, { o: 0.95 }, { dur: 0.45, delay: t1 - 0.3, ease: 'outCubic' });
          T.to(d.hub, { o: 0.5 }, { dur: 1.8, delay: t1 + 0.2, ease: 'inOutSine', overwrite: false });
        }
      },
      (S) => {
        const d = S.data;
        TX.dim(d.q.text, 0.5, { dur: 1.2 });
        if (d.q.src) TX.dim(d.q.src, 0.55, { dur: 1.2 });
        TX.in(d.t2, 'lines', { delay: 0.6, dy: 16 });
        TX.glint(d.t2, { delay: 2.6, dur: 1.8 });
        const f = d.flare;
        if (f && !f.inert) {
          sprAt(S, f, LF_ON[0][0], LF_ON[0][1], -700);
          T.to(d.hub, { o: 1 }, { dur: 0.5, delay: 0.6, ease: 'outCubic' });
          T.to(d.hub, { o: 0.6 }, { dur: 2.0, delay: 1.2, ease: 'inOutSine', overwrite: false });
          T.to(f, { o: 1 }, { dur: 0.4, delay: 0.8, ease: 'outCubic' });
          const t1 = along(S, f, LF_ON, -700, { delay: 0.8, dur: 2.6, ease: 'inSine' });
          T.to(f, { o: 0 }, { dur: 0.5, delay: t1 - 0.5, ease: 'inOutSine', overwrite: false });
        }
      },
      (S) => {
        const d = S.data;
        [d.q.bar, d.q.text, d.q.src, d.t2].forEach((el, i) => TX.out(el, 'sink', { delay: i * 0.06 }));
        TX.in(d.l1, 'lines', { delay: 0.8, stagger: 0.5, dy: 18 });
        TX.glint(d.l1, { delay: 2.8, dur: 1.9, i: 0.8 });
        glowTo(d.hub, 0.45, { delay: 0.6, dur: 2.0 });
        glowTo(d.far, 0.35, { delay: 1.0, dur: 2.6 });
      },
      (S) => {
        const d = S.data;
        TX.dim(d.l1, 0.75, { dur: 1.0 });
        TX.in(d.l2, 'rise', { delay: 0.5, stagger: 0.045 });
        TX.glint(d.l2, { delay: 2.4, dur: 1.9, i: 0.8 });
        glowTo(d.far, 0.6, { delay: 0.8, dur: 2.4 });
        if (d.hub && !d.hub.inert) S.loop(d.hub, { i: 1.35 }, { dur: 3.4, delay: 1.6 });
      },
    ],
  });

  const BK = [
    { img: 'cover_new', x: 325, t: '『人類という通過点』（新刊）', web: 'https://deuslibri.com/book/humanity-as-a-transitional-point/ja', kindle: 'https://www.amazon.co.jp/dp/B0HKD4JWRG' },
    { img: 'cover_boot', x: 1185, t: '『神のブートローダー』（前著）', web: 'https://deuslibri.com/book/gods-bootloader/ja', kindle: 'https://www.amazon.co.jp/dp/B0GV9JJ3SZ' },
  ];
  KS.scene({
    id: 'books', sec: 6, title: '2冊とも、全文無料で', swarm: false, kf: [2], world: WORLD(), images: ['cover_new', 'cover_boot'],
    build(S) {
      const d = S.data;
      d.h = S.text('2冊とも、ネットで{全文無料}で読めます', { cls: 'serif', size: 52, x: 960, y: 100, anchor: 'tc', color: C.white, ls: 0.05 });
      d.h2 = S.text('Kindleでも出ています', { cls: 'sans', size: 30, x: 960, y: 178, anchor: 'tc', color: DIM, ls: 0.1 });
      d.cols = BK.map((b) => {
        const c = {};
        c.halo = K.glow(S, { x: b.x, y: 560, z: -40, size: 560, col: C.gold2, mul: 0.5 });
        c.cover = K.cover(S, b.img, { x: b.x, y: 560, w: 250 });
        c.t = S.text(b.t, { cls: 'serif', size: 34, x: b.x + 205, y: 290, anchor: 'tc', color: C.cream, ls: 0.04 });
        c.web = K.link(S, { x: b.x + 260, y: 430, anchor: 'tc', size: 160, tsize: 22, title: '全文（Web）', url: b.web, label: 'deuslibri.com' });
        c.kin = K.link(S, { x: b.x + 460, y: 430, anchor: 'tc', size: 160, tsize: 22, title: 'Kindle', url: b.kindle, label: 'amazon.co.jp' });
        return c;
      });
      d.thx = S.text('ご清聴ありがとうございました', { cls: 'serif', size: 48, x: 960, y: 850, anchor: 'cc', color: C.white, ls: 0.08 });
    },
    steps: [
      (S) => {
        const d = S.data;
        TX.in(d.h, 'rise', { delay: 0.3, stagger: 0.035 });
        K.show(d.h2, { delay: 1.0, dy: 8 });
        d.cols.forEach((c, i) => {
          const t0 = 0.9 + i * 0.5;
          glowTo(c.halo, 0.32, { delay: t0, dur: 2.0 });
          K.coverIn(c.cover, { delay: t0 });
          K.show(c.t, { delay: t0 + 0.4, dy: 10 });
          K.pop(c.web, { delay: t0 + 1.2 });
          K.pop(c.kin, { delay: t0 + 1.45 });
        });
        TX.glint(d.h, { delay: 3.4, dur: 1.8 });
      },
      (S) => {
        const d = S.data;
        TX.dim(d.h, 0.6, { dur: 1.0 });
        TX.dim(d.h2, 0.5, { dur: 1.0 });
        TX.in(d.thx, 'rise', { delay: 0.4, stagger: 0.05 });
        TX.glint(d.thx, { delay: 2.2, dur: 1.9 });
      },
    ],
  });
})();
