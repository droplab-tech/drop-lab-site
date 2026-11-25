/**
 * Vídeos de fundo (hero e chamada final):
 *  - loop emendado: perto do fim, a segunda cópia começa do zero e as duas se cruzam
 *  - pausa sozinho quando sai da tela ou a aba fica oculta (economiza bateria)
 *  - botão de pausar/continuar (o visitante sempre pode parar o movimento)
 *  - performance: o vídeo só começa a baixar depois que a página terminou de carregar
 *    (a imagem de capa aparece na hora); no celular, na primeira interação. Com economia de dados ligada ou conexão 2G,
 *    fica só a imagem de capa.
 */
import { onFirstInteraction } from './interaction';
const FADE = 1.2; // segundos de transição entre as cópias

type Schedule = (start: () => void) => void;

/** Liga um par de <video data-src> em loop emendado, com pausa e economia de bateria. */
function setupLoopVideo(wrap: HTMLElement, toggle: HTMLButtonElement | null, schedule: Schedule) {
  const [a, b] = Array.from(wrap.querySelectorAll<HTMLVideoElement>('video'));
  if (!a || !b) return;

  let active = a;
  let idle = b;
  let swapping = false;
  let userPaused = false;
  let visible = true;
  let loaded = false;

  const conn = (
    navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
  ).connection;
  const slow = Boolean(conn?.saveData) || /2g/.test(conn?.effectiveType ?? '');
  if (slow) {
    toggle?.classList.add('hidden');
    return;
  }

  const play = (v: HTMLVideoElement) => v.play().catch(() => {});

  const tick = () => {
    if (!swapping && active.duration && active.currentTime >= active.duration - FADE) {
      swapping = true;
      idle.currentTime = 0;
      void play(idle);
      idle.style.opacity = '1';
      active.style.opacity = '0';
      const old = active;
      window.setTimeout(() => {
        old.pause();
        swapping = false;
      }, FADE * 1000);
      active = idle;
      idle = old;
    }
    if (!active.paused) requestAnimationFrame(tick);
  };

  const resume = () => {
    if (!loaded || userPaused || !visible || document.hidden) return;
    void play(active).then(() => requestAnimationFrame(tick));
  };
  const pauseAll = () => {
    a.pause();
    b.pause();
  };

  a.addEventListener('playing', () => requestAnimationFrame(tick), { once: true });

  // O vídeo só começa a baixar quando `schedule` mandar
  const start = () => {
    loaded = true;
    a.preload = 'auto';
    a.src = a.dataset.src ?? '';
    b.src = b.dataset.src ?? '';
    resume();
  };
  schedule(start);

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) resume();
    else pauseAll();
  }).observe(wrap);
  document.addEventListener('visibilitychange', () => (document.hidden ? pauseAll() : resume()));

  toggle?.addEventListener('click', () => {
    userPaused = !userPaused;
    if (userPaused) pauseAll();
    else resume();
    toggle.setAttribute(
      'aria-label',
      userPaused ? 'Continuar vídeo de fundo' : 'Pausar vídeo de fundo',
    );
    toggle.querySelector('[data-icon="pause"]')?.classList.toggle('hidden', userPaused);
    toggle.querySelector('[data-icon="play"]')?.classList.toggle('hidden', !userPaused);
  });
}

const startIdle = (start: () => void) => {
  if ('requestIdleCallback' in window) window.requestIdleCallback(start, { timeout: 2000 });
  else start();
};

/**
 * Hero: no desktop, logo depois do carregamento; no celular, na primeira interação ou
 * após 6 s, para não disputar processamento e rede com o carregamento inicial.
 */
export function initHeroVideo() {
  const wrap = document.querySelector<HTMLElement>('[data-hero-video]');
  if (!wrap) return;
  setupLoopVideo(wrap, document.querySelector('[data-video-toggle]'), (start) => {
    const later = () => {
      if (matchMedia('(max-width: 767px)').matches)
        onFirstInteraction(() => startIdle(start), 6000);
      else window.setTimeout(() => startIdle(start), 400);
    };
    if (document.readyState === 'complete') later();
    else window.addEventListener('load', later, { once: true });
  });
}

/** Chamada final: o vídeo só baixa quando a seção chega perto da tela. */
export function initCtaVideo() {
  const wrap = document.querySelector<HTMLElement>('[data-cta-video]');
  if (!wrap) return;
  setupLoopVideo(wrap, document.querySelector('[data-cta-video-toggle]'), (start) => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        startIdle(start);
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(wrap);
  });
}
