/**
 * Vídeo de fundo do hero:
 *  - loop emendado: perto do fim, a segunda cópia começa do zero e as duas se cruzam
 *  - pausa sozinho quando sai da tela ou a aba fica oculta (economiza bateria)
 *  - botão de pausar/continuar (o visitante sempre pode parar o movimento)
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
    if (userPaused || !visible || document.hidden) return;
    void play(active).then(() => requestAnimationFrame(tick));
  };
  const pauseAll = () => {
    a.pause();
    b.pause();
  };

  a.addEventListener('playing', () => requestAnimationFrame(tick), { once: true });
  resume();

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
    toggle.setAttribute('aria-label', userPaused ? 'Continuar vídeo de fundo' : 'Pausar vídeo de fundo');
    toggle.querySelector('[data-icon="pause"]')?.classList.toggle('hidden', userPaused);
    toggle.querySelector('[data-icon="play"]')?.classList.toggle('hidden', !userPaused);
  });
}
