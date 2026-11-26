/**
 * Simulação de fluido (WebGL2) da tela de intro: o cursor "mexe na água" e a fumaça
 * do vídeo se curva e espirala junto. Baseada no método "stable fluids" (advecção,
 * vorticidade, pressão), em resolução baixa para rodar leve:
 *  - a velocidade do fluido desloca a imagem do vídeo (distorção)
 *  - uma camada de "fumaça" é arrastada pelo mesmo fluido e clareia a imagem
 * Se o aparelho não suportar (sem WebGL2 / texturas float) ou ficar lento, devolve
 * null ou se desliga sozinho, e fica só o vídeo.
 */

export interface Fluid {
  /** Força + fumaça num ponto (x, y em 0..1; dx, dy em fração da tela por evento) */
  splat(x: number, y: number, dx: number, dy: number, amount?: number): void;
  /** Explosão radial (a gota caindo na água) */
  burst(x: number, y: number): void;
  stop(): void;
  /** Para o laço sem liberar a GPU (para retomar depois) */
  pause(): void;
  resume(): void;
  /** Reajusta o canvas depois de ele mudar de tamanho/lugar */
  refit(): void;
}

interface Options {
  simRes: number;
  dyeRes: number;
  iterations: number;
  /** Escala do canvas em relação aos pixels CSS */
  scale: number;
  /** Raio da pincelada em fração da altura² (padrão: proporcional à tela) */
  splatRadius?: number;
  /** Chamado se o aparelho não aguentar: quem chamou mostra só o vídeo */
  onFail: () => void;
}

const VERT = `#version 300 es
in vec2 aPos;
uniform vec2 texel;
out vec2 vUv, vL, vR, vT, vB;
void main() {
  vUv = aPos * .5 + .5;
  vL = vUv - vec2(texel.x, 0.); vR = vUv + vec2(texel.x, 0.);
  vT = vUv + vec2(0., texel.y); vB = vUv - vec2(0., texel.y);
  gl_Position = vec4(aPos, 0., 1.);
}`;

const HEAD = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv, vL, vR, vT, vB;
out vec4 o;
`;

const FRAG = {
  splat: `${HEAD}
uniform sampler2D uTarget; uniform float aspect, radius; uniform vec3 color; uniform vec2 point;
void main() {
  vec2 p = vUv - point; p.x *= aspect;
  o = vec4(texture(uTarget, vUv).xyz + exp(-dot(p, p) / radius) * color, 1.);
}`,
  advect: `${HEAD}
uniform sampler2D uVelocity, uSource; uniform vec2 simTexel; uniform float dt, dissipation;
void main() {
  vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * simTexel;
  o = texture(uSource, coord) / (1. + dissipation * dt);
}`,
  divergence: `${HEAD}
uniform sampler2D uVelocity;
void main() {
  float L = texture(uVelocity, vL).x, R = texture(uVelocity, vR).x;
  float T = texture(uVelocity, vT).y, B = texture(uVelocity, vB).y;
  vec2 C = texture(uVelocity, vUv).xy;
  if (vL.x < 0.) L = -C.x; if (vR.x > 1.) R = -C.x;
  if (vT.y > 1.) T = -C.y; if (vB.y < 0.) B = -C.y;
  o = vec4(.5 * (R - L + T - B), 0., 0., 1.);
}`,
  curl: `${HEAD}
uniform sampler2D uVelocity;
void main() {
  float L = texture(uVelocity, vL).y, R = texture(uVelocity, vR).y;
  float T = texture(uVelocity, vT).x, B = texture(uVelocity, vB).x;
  o = vec4(.5 * (R - L - T + B), 0., 0., 1.);
}`,
  vorticity: `${HEAD}
uniform sampler2D uVelocity, uCurl; uniform float curl, dt;
void main() {
  float L = texture(uCurl, vL).x, R = texture(uCurl, vR).x;
  float T = texture(uCurl, vT).x, B = texture(uCurl, vB).x, C = texture(uCurl, vUv).x;
  vec2 f = .5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  f /= length(f) + .0001; f *= curl * C; f.y *= -1.;
  o = vec4(clamp(texture(uVelocity, vUv).xy + f * dt, -1000., 1000.), 0., 1.);
}`,
  pressure: `${HEAD}
uniform sampler2D uPressure, uDivergence;
void main() {
  float L = texture(uPressure, vL).x, R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x, B = texture(uPressure, vB).x;
  o = vec4((L + R + B + T - texture(uDivergence, vUv).x) * .25, 0., 0., 1.);
}`,
  gradient: `${HEAD}
uniform sampler2D uPressure, uVelocity;
void main() {
  float L = texture(uPressure, vL).x, R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x, B = texture(uPressure, vB).x;
  o = vec4(texture(uVelocity, vUv).xy - vec2(R - L, T - B), 0., 1.);
}`,
  fade: `${HEAD}
uniform sampler2D uTex; uniform float value;
void main() { o = value * texture(uTex, vUv); }`,
  display: `${HEAD}
uniform sampler2D uImage, uVelocity, uDye;
uniform vec2 coverScale, coverOffset, simTexel; uniform float disp;
void main() {
  vec2 v = texture(uVelocity, vUv).xy * simTexel;
  vec2 uv = vUv - v * disp;
  vec3 c = texture(uImage, clamp(uv, 0., 1.) * coverScale + coverOffset).rgb;
  float d = clamp(texture(uDye, uv).r, 0., 1.);
  // fumaça: clareia em branco-azulado, com um toque do azul da marca nas bordas
  c = mix(c, vec3(.8, .92, 1.), d * .42);
  c += vec3(.04, .42, 1.) * d * (1. - d) * .35;
  o = vec4(c, 1.);
}`,
};

export function startFluid(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  poster: HTMLImageElement | null,
  opts: Options,
): Fluid | null {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
  });
  if (!gl || !gl.getExtension('EXT_color_buffer_float')) return null;

  // ---------- programas ----------
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? '');
    return s;
  };
  type Prog = { p: WebGLProgram; u: Record<string, WebGLUniformLocation | null> };
  let vs: WebGLShader;
  const progs = {} as Record<keyof typeof FRAG, Prog>;
  try {
    vs = compile(gl.VERTEX_SHADER, VERT);
    for (const key of Object.keys(FRAG) as (keyof typeof FRAG)[]) {
      const p = gl.createProgram()!;
      gl.attachShader(p, vs);
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, FRAG[key]));
      gl.bindAttribLocation(p, 0, 'aPos');
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS))
        throw new Error(gl.getProgramInfoLog(p) ?? '');
      const u: Prog['u'] = {};
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS) as number;
      for (let i = 0; i < n; i++) {
        const name = gl.getActiveUniform(p, i)!.name;
        u[name] = gl.getUniformLocation(p, name);
      }
      progs[key] = { p, u };
    }
  } catch {
    return null;
  }

  // ---------- geometria: um quadrado que cobre a tela ----------
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  // ---------- texturas de simulação ----------
  type FBO = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number };
  type Double = { read: FBO; write: FBO; swap(): void };
  const fbos: FBO[] = [];

  const makeFBO = (w: number, h: number, internal: number, format: number): FBO => {
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, gl.HALF_FLOAT, null);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const f = { tex, fbo, w, h };
    fbos.push(f);
    return f;
  };
  const makeDouble = (w: number, h: number, internal: number, format: number): Double => {
    const d = {
      read: makeFBO(w, h, internal, format),
      write: makeFBO(w, h, internal, format),
      swap() {
        [d.read, d.write] = [d.write, d.read];
      },
    };
    return d;
  };
  const res = (r: number) => {
    let a = canvas.width / canvas.height;
    if (a < 1) a = 1 / a;
    const min = Math.round(r);
    const max = Math.round(r * a);
    return canvas.width > canvas.height ? [max, min] : [min, max];
  };

  // ---------- tamanho do canvas ----------
  let scale = opts.scale;
  const resize = () => {
    const w = Math.max(1, Math.round(canvas.clientWidth * scale));
    const h = Math.max(1, Math.round(canvas.clientHeight * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  };
  resize();

  const [sw, sh] = res(opts.simRes);
  const [dw, dh] = res(opts.dyeRes);
  const RG = [gl.RG16F, gl.RG] as const;
  const R = [gl.R16F, gl.RED] as const;
  const velocity = makeDouble(sw, sh, ...RG);
  const dye = makeDouble(dw, dh, ...R);
  const pressure = makeDouble(sw, sh, ...R);
  const divergence = makeFBO(sw, sh, ...R);
  const curlFBO = makeFBO(sw, sh, ...R);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) return null;
  const simTexel = [1 / sw, 1 / sh];

  // ---------- textura da imagem (vídeo ou capa) ----------
  const image = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  let imgW = 0;
  let imgH = 0;
  let hasImage = false;
  let videoFrame = true; // há um quadro novo do vídeo para enviar
  const upload = (src: TexImageSource, w: number, h: number) => {
    gl.bindTexture(gl.TEXTURE_2D, image);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    imgW = w;
    imgH = h;
    hasImage = true;
  };
  // Envia só quadros novos (o vídeo tem 24 fps; a tela, 60)
  type RVFC = (cb: () => void) => number;
  const rvfc = (video as HTMLVideoElement & { requestVideoFrameCallback?: RVFC })
    .requestVideoFrameCallback;
  if (rvfc) {
    const onFrame = () => {
      videoFrame = true;
      if (running) rvfc.call(video, onFrame);
    };
    rvfc.call(video, onFrame);
  }

  // ---------- passos ----------
  const blit = (target: FBO | null) => {
    if (target) {
      gl.viewport(0, 0, target.w, target.h);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    } else {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  let unit = 0;
  const use = (p: Prog, texel: number[]) => {
    gl.useProgram(p.p);
    gl.uniform2f(p.u.texel, texel[0], texel[1]);
    unit = 0;
    return p;
  };
  const bind = (p: Prog, name: string, tex: WebGLTexture | null) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(p.u[name], unit++);
  };

  const splatInto = (target: Double, x: number, y: number, c: number[], radius: number) => {
    const p = use(progs.splat, [1 / target.read.w, 1 / target.read.h]);
    bind(p, 'uTarget', target.read.tex);
    gl.uniform1f(p.u.aspect, canvas.width / canvas.height);
    gl.uniform2f(p.u.point, x, y);
    gl.uniform3f(p.u.color, c[0], c[1], c[2]);
    gl.uniform1f(p.u.radius, radius);
    blit(target.write);
    target.swap();
  };
  const aspectR = () => {
    if (opts.splatRadius) return opts.splatRadius;
    const a = canvas.width / canvas.height;
    return a > 1 ? 0.0022 * a : 0.0022;
  };
  const FORCE = 5200;
  const splat = (x: number, y: number, dx: number, dy: number, amount = 0.3) => {
    splatInto(velocity, x, y, [dx * FORCE, dy * FORCE, 0], aspectR());
    splatInto(dye, x, y, [amount, 0, 0], aspectR());
  };

  const step = (dt: number) => {
    let p = use(progs.curl, simTexel);
    bind(p, 'uVelocity', velocity.read.tex);
    blit(curlFBO);

    p = use(progs.vorticity, simTexel);
    bind(p, 'uVelocity', velocity.read.tex);
    bind(p, 'uCurl', curlFBO.tex);
    gl.uniform1f(p.u.curl, 24);
    gl.uniform1f(p.u.dt, dt);
    blit(velocity.write);
    velocity.swap();

    p = use(progs.divergence, simTexel);
    bind(p, 'uVelocity', velocity.read.tex);
    blit(divergence);

    p = use(progs.fade, simTexel);
    bind(p, 'uTex', pressure.read.tex);
    gl.uniform1f(p.u.value, 0.8);
    blit(pressure.write);
    pressure.swap();

    p = use(progs.pressure, simTexel);
    bind(p, 'uDivergence', divergence.tex);
    const pLoc = p.u.uPressure;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.uniform1i(pLoc, unit);
    for (let i = 0; i < opts.iterations; i++) {
      gl.bindTexture(gl.TEXTURE_2D, pressure.read.tex);
      blit(pressure.write);
      pressure.swap();
    }

    p = use(progs.gradient, simTexel);
    bind(p, 'uPressure', pressure.read.tex);
    bind(p, 'uVelocity', velocity.read.tex);
    blit(velocity.write);
    velocity.swap();

    p = use(progs.advect, simTexel);
    gl.uniform2f(p.u.simTexel, simTexel[0], simTexel[1]);
    bind(p, 'uVelocity', velocity.read.tex);
    bind(p, 'uSource', velocity.read.tex);
    gl.uniform1f(p.u.dt, dt);
    gl.uniform1f(p.u.dissipation, 0.6);
    blit(velocity.write);
    velocity.swap();

    p = use(progs.advect, [1 / dw, 1 / dh]);
    gl.uniform2f(p.u.simTexel, simTexel[0], simTexel[1]);
    bind(p, 'uVelocity', velocity.read.tex);
    bind(p, 'uSource', dye.read.tex);
    gl.uniform1f(p.u.dt, dt);
    gl.uniform1f(p.u.dissipation, 0.9);
    blit(dye.write);
    dye.swap();
  };

  const render = () => {
    // Recorte "cover" da imagem para o formato da tela
    const ca = canvas.width / canvas.height;
    const ia = imgW / imgH || 16 / 9;
    const cs = ca > ia ? [1, ia / ca] : [ca / ia, 1];
    const p = use(progs.display, [1 / canvas.width, 1 / canvas.height]);
    bind(p, 'uImage', image);
    bind(p, 'uVelocity', velocity.read.tex);
    bind(p, 'uDye', dye.read.tex);
    gl.uniform2f(p.u.coverScale, cs[0], cs[1]);
    gl.uniform2f(p.u.coverOffset, (1 - cs[0]) / 2, (1 - cs[1]) / 2);
    gl.uniform2f(p.u.simTexel, simTexel[0], simTexel[1]);
    gl.uniform1f(p.u.disp, 0.0045);
    blit(null);
  };

  // ---------- laço ----------
  let running = true;
  let raf = 0;
  let last = performance.now();
  let frames = 0;
  let slowTime = 0;
  let shown = false;

  let paused = false;
  const loop = (now: number) => {
    if (!running || paused) {
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(loop);
    const elapsed = now - last;
    last = now;
    if (document.hidden) return;

    // Guarda de desempenho: se a média passar de ~30 ms por quadro, reduz a resolução;
    // se continuar lento, desliga e deixa só o vídeo.
    frames++;
    if (frames > 20) slowTime += elapsed;
    if (frames === 80) {
      const avg = slowTime / 60;
      if (avg > 45 && scale <= 0.6) return fail();
      if (avg > 30) {
        scale = Math.max(0.5, scale * 0.6);
        resize();
        frames = 0;
        slowTime = 0;
      }
    }

    if (video.readyState >= 2 && (videoFrame || !rvfc)) {
      upload(video, video.videoWidth, video.videoHeight);
      videoFrame = false;
    } else if (!hasImage && poster?.complete && poster.naturalWidth) {
      upload(poster, poster.naturalWidth, poster.naturalHeight);
    }
    if (!hasImage) return;

    step(Math.min(elapsed / 1000, 1 / 60));
    render();
    if (!shown) {
      shown = true;
      canvas.classList.add('is-on');
    }
  };
  raf = requestAnimationFrame(loop);

  const onResize = () => resize();
  window.addEventListener('resize', onResize);

  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', onResize);
    for (const f of fbos) {
      gl.deleteTexture(f.tex);
      gl.deleteFramebuffer(f.fbo);
    }
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
  const fail = () => {
    stop();
    canvas.classList.remove('is-on');
    opts.onFail();
  };

  return {
    splat: (x, y, dx, dy, amount) => running && splat(x, y, dx, dy, amount),
    burst(x, y) {
      if (!running) return;
      const n = 10;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.3;
        const r = 0.012;
        splat(
          x + Math.cos(a) * r,
          y + Math.sin(a) * r,
          Math.cos(a) * 0.05,
          Math.sin(a) * 0.05,
          0.22,
        );
      }
    },
    stop,
    pause() {
      paused = true;
    },
    resume() {
      if (!running) return;
      paused = false;
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    },
    refit: () => resize(),
  };
}
