/**
 * Controle da tela de intro (src/components/Intro.astro).
 *  - escolhe o vídeo pelo tamanho da tela (720p no computador, 360p no celular)
 *  - liga a simulação de fluido só em aparelhos que aguentam; nos mais simples,
 *    uma luz suave segue o cursor (CSS) e o vídeo roda normal
 *  - entra no site pelo botão, Enter/Esc, rolando/arrastando para cima, ou sozinha
 *  - ao sair: libera a GPU, para o vídeo, remove a intro e avisa o resto do site
 *    (eventos 'intro:exit' no início da saída e 'intro:done' no fim)
 */
import type { Fluid } from './intro-fluid';

const AUTO_MS = 9100; // 2,9 s de entrada + 6,2 s da barra
const BURST_MS = 1450; // momento em que a gota toca a água

let phase: 'open' | 'exit' | 'done' = 'open';

/** A intro foi aberta nesta visita e ainda não terminou de sair? */
export function introActive() {
  return phase !== 'done' && document.documentElement.classList.contains('intro-on');
}

export function initIntro() {
  const root = document.documentElement;
  const el = document.querySelector<HTMLElement>('[data-intro]');
  if (!el || !introActive()) return;

  const video = el.querySelector<HTMLVideoElement>('[data-intro-video]')!;
  const canvas = el.querySelector<HTMLCanvasElement>('[data-intro-canvas]')!;
  const poster = el.querySelector<HTMLImageElement>('[data-intro-poster]');
  const enter = el.querySelector<HTMLButtonElement>('[data-intro-enter]')!;
  const mark = el.querySelector<HTMLElement>('[data-intro-mark]');

  // O resto da página fica fora do alcance do teclado/leitor de tela enquanto a intro está aberta
  const others = Array.from(document.body.children).filter(
    (n): n is HTMLElement => n !== el && n instanceof HTMLElement && n.tagName !== 'SCRIPT',
  );
  others.forEach((n) => (n.inert = true));
  enter.focus({ preventScroll: true });

  // ---------- capacidade do aparelho ----------
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  const small = matchMedia('(max-width: 767px)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const slowNet =
    Boolean(nav.connection?.saveData) || /2g/.test(nav.connection?.effectiveType ?? '');
  const weak = (nav.deviceMemory ?? 8) <= 2 || (navigator.hardwareConcurrency ?? 8) <= 2;

  if (!slowNet) {
    video.src = (small ? video.dataset.srcSm : video.dataset.src) ?? '';
    video.preload = 'auto';
    void video.play().catch(() => {});
  }

  let fluid: Fluid | null = null;
  let leaving = false;
  let autoTimer = 0;
  const lite = () => el.classList.add('is-lite');
  if (weak) lite();
  else {
    void import('./intro-fluid')
      .then(({ startFluid }) => {
        if (leaving) return;
        fluid = startFluid(canvas, video, poster, {
          simRes: small || coarse ? 80 : 128,
          dyeRes: small || coarse ? 320 : 640,
          iterations: small || coarse ? 10 : 18,
          scale: Math.min(window.devicePixelRatio || 1, small ? 1 : 1.25),
          onFail: () => {
            fluid = null;
            lite();
          },
        });
        if (!fluid) lite();
      })
      .catch(lite);
  }

  // ---------- cursor / toque ----------
  let lastX = -1;
  let lastY = -1;
  const onMove = (e: PointerEvent) => {
    const x = e.clientX / innerWidth;
    const y = 1 - e.clientY / innerHeight;
    el.style.setProperty('--mx', `${e.clientX}px`);
    el.style.setProperty('--my', `${e.clientY}px`);
    if (lastX >= 0) {
      const dx = x - lastX;
      const dy = y - lastY;
      if (Math.abs(dx) + Math.abs(dy) > 0.0005)
        fluid?.splat(x, y, dx, dy, e.pointerType === 'touch' ? 0.35 : 0.22);
    }
    lastX = x;
    lastY = y;
  };
  el.addEventListener('pointermove', onMove, { passive: true });
  el.addEventListener('pointerleave', () => (lastX = -1));
  el.addEventListener('pointerdown', (e) => {
    lastX = e.clientX / innerWidth;
    lastY = 1 - e.clientY / innerHeight;
  });

  // A gota cai na água: a fumaça "explode" a partir da logo
  const burstTimer = window.setTimeout(() => {
    if (!mark) return;
    const r = mark.getBoundingClientRect();
    fluid?.burst(
      (r.left + r.width * 0.535) / innerWidth,
      1 - (r.top + r.height * 0.68) / innerHeight,
    );
  }, BURST_MS);

  // Movimento ambiente leve quando ninguém mexe (celular sem toque ainda, por exemplo)
  let idleT = 0;
  const ambient = window.setInterval(() => {
    if (!fluid || performance.now() - idleT < 1800) return;
    const t = performance.now() / 1000;
    const x = 0.5 + Math.sin(t * 0.7) * 0.32;
    const y = 0.5 + Math.cos(t * 0.9) * 0.22;
    fluid.splat(x, y, Math.cos(t * 0.7) * 0.012, -Math.sin(t * 0.9) * 0.012, 0.08);
  }, 260);
  el.addEventListener('pointermove', () => (idleT = performance.now()), { passive: true });

  // ---------- saída ----------
  const leave = () => {
    if (leaving) return;
    leaving = true;
    window.clearTimeout(autoTimer);
    window.clearTimeout(burstTimer);
    window.clearInterval(ambient);
    try {
      sessionStorage.setItem('dl-intro', '1');
    } catch {
      /* sem sessionStorage: a intro só volta ao recarregar */
    }
    window.scrollTo(0, 0);
    root.classList.remove('intro-hold'); // o hero começa a entrada por baixo da cortina
    others.forEach((n) => (n.inert = false));
    phase = 'exit';
    document.dispatchEvent(new Event('intro:exit'));
    el.classList.add('is-out');

    const finish = () => {
      fluid?.stop();
      fluid = null;
      video.pause();
      video.removeAttribute('src');
      video.load();
      el.remove();
      root.classList.remove('intro-on');
      removeEventListener('keydown', onKey);
      phase = 'done';
      document.dispatchEvent(new Event('intro:done'));
    };
    // Tempo da animação de saída (com folga), sem depender de animationend
    window.setTimeout(finish, 1600);
  };

  const onKey = (e: KeyboardEvent) => {
    if (['Escape', 'Enter', ' ', 'ArrowDown', 'PageDown'].includes(e.key)) {
      e.preventDefault();
      leave();
    }
  };
  addEventListener('keydown', onKey);
  enter.addEventListener('click', leave);
  el.addEventListener(
    'wheel',
    (e) => {
      if (e.deltaY > 20) leave();
    },
    { passive: true },
  );
  let touchY = 0;
  el.addEventListener('touchstart', (e) => (touchY = e.touches[0].clientY), { passive: true });
  el.addEventListener(
    'touchend',
    (e) => {
      // arrastar rápido para cima entra; arrastar devagar é brincar com a água
      if (touchY - e.changedTouches[0].clientY > 120) leave();
    },
    { passive: true },
  );

  // Entra sozinha; se a aba estiver escondida, espera voltar
  const schedule = (ms: number) => {
    autoTimer = window.setTimeout(() => {
      if (document.hidden) {
        document.addEventListener('visibilitychange', () => schedule(1500), { once: true });
      } else leave();
    }, ms);
  };
  schedule(AUTO_MS);
}

/** Executa `cb` quando a intro começa a sair (ou já, se não houver intro). */
export function afterIntro(cb: () => void, when: 'exit' | 'done' = 'exit') {
  if (!introActive() || (when === 'exit' && phase === 'exit')) return cb();
  document.addEventListener(`intro:${when}`, () => cb(), { once: true });
}
