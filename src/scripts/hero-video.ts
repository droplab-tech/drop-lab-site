/**
 * Vídeo de fundo do hero:
 *  - loop emendado: perto do fim, a segunda cópia começa do zero e as duas se cruzam
 *  - pausa sozinho quando sai da tela ou a aba fica oculta (economiza bateria)
 *  - botão de pausar/continuar (o visitante sempre pode parar o movimento)
 *  - performance: o vídeo só começa a baixar depois que a página terminou de carregar
 *    (a imagem de capa aparece na hora). Com economia de dados ligada ou conexão 2G,
 *    fica só a imagem de capa.
 */
const FADE = 1.2; // segundos de transição entre as cópias

export function initHeroVideo() {
  const wrap = document.querySelector<HTMLElement>('[data-hero-video]');
  if (!wrap) return;
  const [a, b] = Array.from(wrap.querySelectorAll<HTMLVideoElement>('video'));
  if (!a || !b) return;
  const toggle = document.querySelector<HTMLButtonElement>('[data-video-toggle]');

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

  // Começa a baixar o vídeo só depois do carregamento (no celular, um pouco mais tarde)
  const start = () => {
    loaded = true;
    a.preload = 'auto';
    a.src = a.dataset.src ?? '';
    b.src = b.dataset.src ?? '';
    resume();
  };
  const later = () => {
    const delay = matchMedia('(max-width: 767px)').matches ? 2500 : 400;
    window.setTimeout(() => {
      if ('requestIdleCallback' in window) window.requestIdleCallback(start, { timeout: 2000 });
      else start();
    }, delay);
  };
  if (document.readyState === 'complete') later();
  else window.addEventListener('load', later, { once: true });

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
