/**
 * Movimento cinematográfico do site (inspirado na linguagem da referência):
 *  - rolagem suave (Lenis) sincronizada com o GSAP ScrollTrigger
 *  - partículas de poeira flutuando no feixe de luz do hero (canvas)
 *  - entrada do título palavra por palavra
 *  - parallax do hero ao rolar (a gota sobe, o texto se afasta, a luz diminui)
 *  - títulos das seções revelados por palavra
 *  - o comparador "se apresenta" uma vez ao entrar na tela
 * Com prefers-reduced-motion ativo no sistema, ficam só os efeitos suaves (luz,
 * poeira lenta e títulos aparecendo por opacidade); rolagem suave, parallax e
 * deslocamentos são desligados. Para ver a versão completa nesse caso: ?motion
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const reduced =
  matchMedia('(prefers-reduced-motion: reduce)').matches &&
  !new URLSearchParams(location.search).has('motion');

/** Quebra o texto de um elemento em palavras mascaradas (mantém o texto acessível). */
function splitWords(el: HTMLElement): HTMLElement[] {
  if (el.dataset.split === 'done') return Array.from(el.querySelectorAll<HTMLElement>('.w > span'));
  const text = el.textContent?.trim() ?? '';
  el.setAttribute('aria-label', text);
  el.innerHTML = text
    .split(/\s+/)
    .map((w) => `<span class="w" aria-hidden="true"><span>${w}</span></span>`)
    .join(' ');
  el.dataset.split = 'done';
  return Array.from(el.querySelectorAll<HTMLElement>('.w > span'));
}

/** Poeira no feixe de luz: poucas partículas, desenhadas só quando o hero está visível. */
function initMotes(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0;
  let h = 0;
  let running = false;
  let frame = 0;

  type Mote = { x: number; y: number; r: number; vx: number; vy: number; a: number; t: number };
  let motes: Mote[] = [];

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(90, (w * h) / 14000));
    motes = Array.from({ length: count }, () => spawn(true));
  };

  // O feixe desce do alto à direita até a gota: as partículas vivem ao longo dessa faixa
  const beamX = (y: number) => w * (w >= 1024 ? 0.86 : 0.78) - y * Math.tan((22 * Math.PI) / 180);
  const beamHalf = () => (w >= 1024 ? w * 0.13 : w * 0.3);

  function spawn(anywhere = false): Mote {
    const y = anywhere ? Math.random() * h : h + 10;
    const spread = (Math.random() - 0.5) * 2 * beamHalf();
    return {
      x: beamX(y) + spread,
      y,
      r: 0.4 + Math.random() * 1.5,
      vx: (Math.random() - 0.5) * 0.08,
      vy: -(0.05 + Math.random() * 0.18) * (reduced ? 0.4 : 1),
      a: 0.25 + Math.random() * 0.6,
      t: Math.random() * Math.PI * 2,
    };
  }

  const draw = () => {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    const light = document.documentElement.dataset.theme === 'light';
    const half = beamHalf();
    for (let i = 0; i < motes.length; i++) {
      const m = motes[i];
      m.t += 0.01;
      m.x += (m.vx + Math.sin(m.t) * 0.06) * (reduced ? 0.4 : 1);
      m.y += m.vy;
      if (m.y < -10) motes[i] = spawn();
      // Mais brilho perto do eixo do feixe, apagando nas bordas
      const d = Math.abs(m.x - beamX(m.y)) / half;
      const glow = Math.max(0, 1 - d) * (0.6 + 0.4 * Math.sin(m.t * 2));
      if (glow <= 0.01) continue;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fillStyle = light
        ? `rgba(10, 108, 255, ${m.a * glow * 0.5})`
        : `rgba(190, 240, 255, ${m.a * glow})`;
      ctx.fill();
    }
    frame = requestAnimationFrame(draw);
  };

  const start = () => {
    if (running) return;
    running = true;
    frame = requestAnimationFrame(draw);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(frame);
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });
  new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(canvas);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
}

export function initMotion() {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  root.classList.add('motion');
  if (reduced) root.classList.add('motion-calm');

  // Entrada das palavras: sobe pela máscara, ou só aparece no modo calmo
  const wordsIn = (words: HTMLElement[], vars: gsap.TweenVars) =>
    reduced
      ? gsap.from(words, { opacity: 0, duration: 1.2, ease: 'power2.out', stagger: 0.06, ...vars })
      : gsap.from(words, { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.06, ...vars });

  const hero = document.querySelector<HTMLElement>('#inicio');
  const canvas = document.querySelector<HTMLCanvasElement>('[data-motes]');
  if (canvas) initMotes(canvas);

  const title = hero?.querySelector<HTMLElement>('h1');
  if (title) {
    const words = splitWords(title);
    gsap.set(title, { opacity: 1 });
    wordsIn(words, { delay: 0.15 });
  }

  document.querySelectorAll<HTMLElement>('main h2.text-title').forEach((h2) => {
    wordsIn(splitWords(h2), {
      stagger: 0.045,
      scrollTrigger: { trigger: h2, start: 'top 85%', once: true },
    });
  });

  initPillars();

  if (reduced) return;

  // ---------- Rolagem suave ----------
  const lenis = new Lenis({ lerp: 0.09, anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  // O menu mobile trava a rolagem do body: pausa o Lenis junto
  new MutationObserver(() => {
    if (document.body.style.overflow === 'hidden') lenis.stop();
    else lenis.start();
  }).observe(document.body, { attributes: true, attributeFilter: ['style'] });

  // ---------- Parallax do hero ----------
  if (hero) {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
    tl.to('[data-hero-copy]', { y: -90, opacity: 0.15, ease: 'none' }, 0).to(
      '[data-hero-media]',
      { yPercent: 12, scale: 1.08, ease: 'none' },
      0,
    );
  }

  // ---------- Comparador: um movimento de apresentação ----------
  const fig = document.querySelector<HTMLElement>('[data-compare]');
  const input = fig?.querySelector<HTMLInputElement>('[data-compare-input]');
  if (fig && input) {
    const state = { pos: Number(input.value) };
    const apply = () => {
      input.value = String(Math.round(state.pos));
      fig.style.setProperty('--pos', `${state.pos}%`);
    };
    let touched = false;
    input.addEventListener('pointerdown', () => (touched = true), { once: true });
    input.addEventListener('keydown', () => (touched = true), { once: true });
    ScrollTrigger.create({
      trigger: fig,
      start: 'top 65%',
      once: true,
      onEnter: () => {
        if (touched) return;
        gsap
          .timeline({ onUpdate: apply })
          .to(state, { pos: 68, duration: 1.4, ease: 'power3.inOut' })
          .to(state, { pos: 42, duration: 1.2, ease: 'power3.inOut' });
      },
    });
  }
}

/**
 * Cartões dos pilares, como na referência: o movimento acompanha a rolagem o tempo
 * todo enquanto a seção está na tela (scrub). Os cartões chegam da direita
 * inclinados, se acomodam quando a seção está no centro e seguem derivando para a
 * esquerda ao sair, cada um num ritmo diferente (parallax).
 * Roda também com "reduzir movimento": é um movimento ligado à rolagem, controlado
 * pelo próprio visitante, e não uma animação automática.
 */
function initPillars() {
  const list = document.querySelector<HTMLElement>('[data-pillars]');
  if (!list) return;
  const cards = Array.from(list.querySelectorAll<HTMLElement>('[data-pillar]'));
  const restTilt = [-1.6, 1.1, -0.8, 1.9];

  const mm = gsap.matchMedia();

  mm.add('(min-width: 1024px)', () => {
    const startX = [260, 380, 520, 680];
    const startTilt = [-8, 6, 5, 10];
    const exitX = [-40, -90, -150, -220];
    const exitTilt = [1.5, -2.5, 2, -3];
    cards.forEach((card, i) => {
      gsap
        .timeline({
          scrollTrigger: { trigger: list, start: 'top bottom', end: 'bottom top', scrub: 0.9 },
        })
        .fromTo(
          card,
          { x: startX[i], rotate: startTilt[i], opacity: 0.4 },
          { x: 0, rotate: restTilt[i], opacity: 1, ease: 'power2.out', duration: 0.55 },
        )
        .to(card, { x: exitX[i], rotate: exitTilt[i], ease: 'none', duration: 0.45 });
    });
  });

  mm.add('(max-width: 1023px)', () => {
    cards.forEach((card, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      gsap
        .timeline({
          scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
        })
        .fromTo(
          card,
          { x: 90 * dir, rotate: 6 * dir, opacity: 0.3 },
          { x: 0, rotate: restTilt[i] * 0.6, opacity: 1, ease: 'power2.out', duration: 0.5 },
        )
        .to(card, { x: -40 * dir, rotate: -3 * dir, ease: 'none', duration: 0.5 });
    });
  });
}
