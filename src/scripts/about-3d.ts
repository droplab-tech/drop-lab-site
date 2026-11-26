/**
 * Seção "Sobre": o "D" da Droplab em 3D com a gota no meio, no fundo do mar.
 * O ambiente (raios de luz, partículas, areia com cáusticas) gira em volta do logo e a
 * câmera balança devagar, como no hero da referência (o cubo com a sala girando).
 *
 * Leveza:
 *  - Three.js só é baixado quando a seção chega perto da tela (outro arquivo, sob demanda)
 *  - só renderiza com a seção visível e a aba aberta
 *  - resolução limitada (1,5x no computador, 1x no celular) e menos partículas no celular
 *  - guarda de desempenho: se ficar lento, baixa a resolução; se continuar, congela num
 *    quadro bonito e para de animar
 *  - sem WebGL, com economia de dados ou em aparelho fraco: fica a versão estática (CSS)
 */
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Desenho do logo (o mesmo de src/components/ui/LogoMark.astro), em unidades do SVG
const D_PATH =
  'M110 143q0-12 12-12h223a250.5 250.5 0 0 1 0 501H85q-12 0-12-12V452q0-8 6-14l154-151v200l-28 31h140a137.5 137.5 0 0 0 0-275H122q-12 0-12-12z';
const CENTER = { x: 334, y: 382 };
const DROP = { x: 352, y: 412, r: 65 };
const S = 1 / 200; // SVG -> unidades da cena

// Cáustica de água (linhas de luz que se mexem), usada na areia e na luz sobre o logo
const CAUSTIC_GLSL = /* glsl */ `
float caustic(vec2 p, float t) {
  vec2 q = p;
  float v = 0.0;
  for (int n = 0; n < 3; n++) {
    float fn = float(n);
    q += vec2(sin(q.y * 1.7 + t * 0.9 + fn), cos(q.x * 1.3 - t * 0.7 + fn * 1.7)) * 0.6;
    v += abs(sin(q.x + q.y));
  }
  v = 1.0 - v / 3.0;
  return clamp(pow(clamp(v, 0.0, 1.0), 5.0) * 2.0, 0.0, 2.0);
}`;

function softDot() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.55)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function seaGradient() {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 256;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#0f6386');
  grad.addColorStop(0.35, '#08304f');
  grad.addColorStop(0.75, '#041a31');
  grad.addColorStop(1, '#020a16');
  g.fillStyle = grad;
  g.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Perfil de gota (meio corte) para o LatheGeometry: base redonda e ponta no alto. */
function dropProfile(r: number, tip: number) {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 18; i++) {
    const a = -Math.PI / 2 + (i / 18) * (Math.PI / 2 + 0.55);
    pts.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r));
  }
  const last = pts[pts.length - 1];
  const ctrl = new THREE.Vector2(last.x * 0.55, tip * 0.62);
  const curve = new THREE.QuadraticBezierCurve(last, ctrl, new THREE.Vector2(0, tip));
  curve
    .getPoints(14)
    .slice(1)
    .forEach((p) => pts.push(p));
  return pts;
}

export interface SeaScene {
  stop(): void;
}

export function startAboutScene(host: HTMLElement): SeaScene | null {
  const small = matchMedia('(max-width: 1023px)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canvas = document.createElement('canvas');
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !small && (window.devicePixelRatio || 1) < 2,
      alpha: false,
      powerPreference: 'high-performance',
    });
  } catch {
    return null;
  }
  let pixelRatio = Math.min(window.devicePixelRatio || 1, small ? 1 : 1.5);
  renderer.setPixelRatio(pixelRatio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.prepend(canvas);

  const scene = new THREE.Scene();
  scene.background = seaGradient();
  scene.fog = new THREE.Fog('#05203a', 7, 24);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(small ? 40 : 32, 1, 0.1, 60);

  // ---------- luz ----------
  scene.add(new THREE.HemisphereLight('#8fe3ff', '#021226', 1.1));
  const sun = new THREE.DirectionalLight('#c8f4ff', 2.4);
  sun.position.set(2, 9, 3);
  scene.add(sun);
  const rim = new THREE.PointLight('#22d3ee', 18, 14, 1.6);
  rim.position.set(-2.5, 1.2, -3);
  scene.add(rim);
  const front = new THREE.PointLight('#2f86ff', 10, 12, 1.6);
  front.position.set(2.5, -0.5, 3.5);
  scene.add(front);

  // ---------- o logo ----------
  const time = { value: 0 };
  const addCaustics = (mat: THREE.MeshPhysicalMaterial, strength: number) => {
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = time;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;')
        .replace(
          '#include <worldpos_vertex>',
          '#include <worldpos_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;',
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>\nuniform float uTime;\nvarying vec3 vWPos;\n${CAUSTIC_GLSL}`,
        )
        .replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>
          float up = max(dot(normal, normalize((viewMatrix * vec4(0.0, 1.0, 0.3, 0.0)).xyz)), 0.0);
          float cst = caustic(vWPos.xz * 2.2 + vec2(vWPos.y * 0.6, 0.0), uTime * 0.6);
          totalEmissiveRadiance += vec3(0.45, 0.85, 1.0) * cst * (0.25 + up) * ${strength.toFixed(2)};`,
        );
    };
  };

  const logo = new THREE.Group();
  scene.add(logo);

  const shapes = new SVGLoader()
    .parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${D_PATH}"/></svg>`)
    .paths.flatMap((p) => SVGLoader.createShapes(p));
  const DEPTH = 90;
  const dGeo = new THREE.ExtrudeGeometry(shapes, {
    depth: DEPTH,
    bevelEnabled: true,
    bevelThickness: 16,
    bevelSize: 9,
    bevelSegments: small ? 3 : 6,
    curveSegments: small ? 18 : 32,
  });
  dGeo.translate(-CENTER.x, -CENTER.y, -DEPTH / 2);
  dGeo.computeVertexNormals();
  const dMat = new THREE.MeshPhysicalMaterial({
    color: '#0a6cff',
    metalness: 0.35,
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    envMapIntensity: 0.55,
    emissive: '#062a7a',
    emissiveIntensity: 0.35,
  });
  addCaustics(dMat, 1.1);
  const dMesh = new THREE.Mesh(dGeo, dMat);
  // Girar em X inverte o eixo Y do SVG (que cresce para baixo) sem espelhar as faces
  dMesh.rotation.x = Math.PI;
  dMesh.scale.setScalar(S);
  logo.add(dMesh);

  const dropGeo = new THREE.LatheGeometry(
    dropProfile(DROP.r * S, DROP.r * S * 1.85),
    small ? 32 : 56,
  );
  const dropMat = new THREE.MeshPhysicalMaterial({
    color: '#22d3ee',
    metalness: 0.05,
    roughness: 0.06,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.3,
    emissive: '#0a7d99',
    emissiveIntensity: 0.45,
    iridescence: small ? 0 : 0.35,
  });
  addCaustics(dropMat, 0.8);
  const drop = new THREE.Mesh(dropGeo, dropMat);
  const dropHome = new THREE.Vector3((DROP.x - CENTER.x) * S, -(DROP.y - CENTER.y) * S, 0);
  drop.position.copy(dropHome);
  logo.add(drop);

  // ---------- ambiente que gira em volta ----------
  const world = new THREE.Group();
  scene.add(world);

  // Areia com cáusticas animadas
  const sandMat = new THREE.ShaderMaterial({
    uniforms: { uTime: time, uFog: { value: new THREE.Color('#05203a') } },
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying float vDist;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vDist = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform vec3 uFog;
      varying vec2 vUv; varying float vDist;
      ${CAUSTIC_GLSL}
      void main() {
        vec2 p = vUv * 34.0;
        float c = caustic(p, uTime * 0.5);
        vec3 sand = mix(vec3(0.03, 0.12, 0.2), vec3(0.06, 0.2, 0.28), smoothstep(0.0, 1.0, vUv.y));
        vec3 col = sand + vec3(0.35, 0.75, 0.95) * c * 0.7;
        float f = smoothstep(6.0, 22.0, vDist);
        gl_FragColor = vec4(mix(col, uFog, f), 1.0);
        #include <colorspace_fragment>
      }`,
    fog: false,
  });
  const sand = new THREE.Mesh(new THREE.CircleGeometry(26, 48), sandMat);
  sand.rotation.x = -Math.PI / 2;
  sand.position.y = -2.3;
  world.add(sand);

  // Raios de luz vindos da superfície
  const rayMat = new THREE.ShaderMaterial({
    uniforms: { uTime: time },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; varying vec2 vUv;
      void main() {
        float side = smoothstep(0.0, 0.5, vUv.x) * smoothstep(1.0, 0.5, vUv.x);
        float fall = smoothstep(0.0, 0.85, vUv.y);
        float flick = 0.75 + 0.25 * sin(uTime * 0.8 + vUv.y * 3.0);
        gl_FragColor = vec4(vec3(0.55, 0.9, 1.0), side * side * fall * 0.22 * flick);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const rays: THREE.Mesh[] = [];
  const RAY_COUNT = small ? 5 : 8;
  for (let i = 0; i < RAY_COUNT; i++) {
    const w = 0.8 + Math.random() * 1.8;
    const ray = new THREE.Mesh(new THREE.PlaneGeometry(w, 16), rayMat);
    const a = (i / RAY_COUNT) * Math.PI * 2 + Math.random() * 0.4;
    const r = 3.2 + Math.random() * 5;
    ray.position.set(Math.cos(a) * r, 4.5, Math.sin(a) * r);
    ray.rotation.z = 0.25 + Math.random() * 0.15;
    ray.userData.phase = Math.random() * 10;
    rays.push(ray);
    world.add(ray);
  }

  // Partículas em suspensão (plâncton) subindo devagar
  const N = small || coarse ? 220 : 520;
  const pos = new Float32Array(N * 3);
  const speed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 1.6 + Math.random() * 9;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = -2.3 + Math.random() * 7;
    pos[i * 3 + 2] = Math.sin(a) * r;
    speed[i] = 0.05 + Math.random() * 0.18;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const particles = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({
      size: small ? 0.07 : 0.055,
      map: softDot(),
      color: '#a8ecff',
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    }),
  );
  world.add(particles);

  // Bolhas saindo da gota
  const B = small ? 10 : 18;
  const bPos = new Float32Array(B * 3);
  const bLife = new Float32Array(B);
  for (let i = 0; i < B; i++) bLife[i] = Math.random();
  const bGeo = new THREE.BufferGeometry();
  bGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
  const bubbles = new THREE.Points(
    bGeo,
    new THREE.PointsMaterial({
      size: 0.09,
      map: softDot(),
      color: '#e6fbff',
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  scene.add(bubbles);

  // ---------- tamanho ----------
  // Teto de pixels desenhados (≈2 MP no computador, 0,9 MP no celular): telas grandes
  // e de alta densidade não multiplicam o trabalho da placa de vídeo
  const MAX_PIXELS = small ? 0.9e6 : 2e6;
  const resize = () => {
    const w = Math.max(1, host.clientWidth);
    const h = Math.max(1, host.clientHeight);
    renderer.setPixelRatio(Math.min(pixelRatio, Math.sqrt(MAX_PIXELS / (w * h))));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Telas estreitas: afasta a câmera para o logo caber
    camera.userData.dist = (small ? 6.4 : 12.5) * Math.max(1, 1.25 / camera.aspect);
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  // ---------- cursor (só computador) ----------
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointer = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  };
  const section = host.closest('section');
  if (!coarse) section?.addEventListener('pointermove', onPointer, { passive: true });

  // ---------- laço ----------
  const clock = new THREE.Clock();
  let raf = 0;
  let visible = false;
  let frozen = false;
  let frames = 0;
  let slowTime = 0;
  let t = 0;
  const pace = reduced ? 0.45 : 1;

  const frame = () => {
    raf = 0;
    if (!visible || document.hidden || frozen) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    t += dt * pace;
    time.value = t;

    // Guarda de desempenho
    frames++;
    if (frames > 30) slowTime += dt;
    if (frames === 120) {
      const avg = (slowTime / 90) * 1000;
      if (avg > 40 && renderer.getPixelRatio() <= 0.75) frozen = true;
      else if (avg > 28) {
        pixelRatio = Math.max(0.6, renderer.getPixelRatio() * 0.7);
        resize();
        frames = 0;
        slowTime = 0;
      }
    }

    // O ambiente gira em volta; a câmera balança e acompanha o cursor de leve
    world.rotation.y = t * 0.12;
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;
    const swing = Math.sin(t * 0.22) * 0.55 + pointer.x * 0.25;
    const dist = camera.userData.dist as number;
    camera.position.set(
      Math.sin(swing) * dist,
      0.35 + Math.sin(t * 0.31) * 0.3 - pointer.y * 0.35,
      Math.cos(swing) * dist,
    );
    camera.lookAt(0, 0.05, 0);

    // O logo flutua; a gota respira e balança dentro do D
    logo.position.y = Math.sin(t * 0.7) * 0.08;
    logo.rotation.y = Math.sin(t * 0.35) * 0.12;
    logo.rotation.z = Math.sin(t * 0.5) * 0.025;
    drop.position.y = dropHome.y + Math.sin(t * 1.3) * 0.035;
    drop.rotation.y = t * 0.6;
    drop.scale.setScalar(1 + Math.sin(t * 1.3 + 1) * 0.015);

    for (const ray of rays) {
      ray.lookAt(camera.position.x, ray.position.y, camera.position.z);
      ray.rotation.z = 0.3 + Math.sin(t * 0.2 + ray.userData.phase) * 0.08;
    }

    const p = pGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < N; i++) {
      p[i * 3 + 1] += speed[i] * dt * pace;
      p[i * 3] += Math.sin(t * 0.5 + i) * 0.0015;
      if (p[i * 3 + 1] > 4.7) p[i * 3 + 1] = -2.3;
    }
    pGeo.attributes.position.needsUpdate = true;

    // Bolhas: nascem na ponta da gota e sobem balançando
    const bp = bGeo.attributes.position.array as Float32Array;
    const tipY = logo.position.y + drop.position.y + DROP.r * S * 1.85;
    for (let i = 0; i < B; i++) {
      bLife[i] += dt * pace * (0.18 + (i % 5) * 0.03);
      if (bLife[i] > 1) bLife[i] -= 1;
      const l = bLife[i];
      bp[i * 3] = drop.position.x + Math.sin(l * 9 + i) * 0.08 * l;
      bp[i * 3 + 1] = tipY + l * 3.2;
      bp[i * 3 + 2] = Math.cos(l * 7 + i) * 0.08 * l;
    }
    bGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
    if (!canvas.classList.contains('is-on')) {
      canvas.classList.add('is-on');
      host.classList.add('is-3d');
    }
  };

  const start = () => {
    if (!raf && visible && !frozen) {
      clock.getDelta();
      raf = requestAnimationFrame(frame);
    }
  };
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) start();
  });
  io.observe(host);
  const onVis = () => !document.hidden && start();
  document.addEventListener('visibilitychange', onVis);

  return {
    stop() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      section?.removeEventListener('pointermove', onPointer);
      renderer.dispose();
      canvas.remove();
    },
  };
}
