/**
 * Caixas de serviços: ao passar o cursor, o vídeo de fundo ganha nitidez e a fumaça
 * segue o mouse (a mesma simulação da intro, em resolução menor).
 *
 * Leve por desenho:
 *  - um único <video> e um único canvas/WebGL para todas as linhas: eles "mudam de casa"
 *    para a linha com o cursor
 *  - o vídeo só começa a baixar quando a seção chega perto da tela; nada roda sem hover
 *  - a simulação para 1 s depois que o cursor sai e só é criada no primeiro hover
 *  - só com mouse/trackpad; em toque e em aparelhos fracos fica o fundo embaçado
 *    (aparelho fraco com mouse: vídeo nítido, sem a fumaça)
 */
import type { Fluid } from './intro-fluid';

export function initServicesFx() {
  const list = document.querySelector<HTMLElement>('[data-services]');
  if (!list || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  if (nav.connection?.saveData || /2g/.test(nav.connection?.effectiveType ?? '')) return;
  const weak = (nav.deviceMemory ?? 8) <= 2 || (navigator.hardwareConcurrency ?? 8) <= 2;

  const rows = Array.from(list.querySelectorAll<HTMLElement>('[data-service]'));
  const video = document.createElement('video');
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'none';
  video.setAttribute('aria-hidden', 'true');
  video.tabIndex = -1;
  const canvas = document.createElement('canvas');

  // Baixa o vídeo (400 KB) só quando a seção estiver chegando
  const io = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      video.preload = 'auto';
      video.src = '/video/services.mp4';
    },
    { rootMargin: '400px 0px' },
  );
  io.observe(list);

  let fluid: Fluid | null = null;
  let fluidTried = weak;
  let current: HTMLElement | null = null;
  let sleepTimer = 0;
  let lastX = -1;
  let lastY = -1;

  const ensureFluid = () => {
    if (fluidTried) return;
    fluidTried = true;
    void import('./intro-fluid')
      .then(({ startFluid }) => {
        fluid = startFluid(canvas, video, null, {
          simRes: 56,
          dyeRes: 180,
          iterations: 10,
          splatRadius: 0.04,
          scale: Math.min(window.devicePixelRatio || 1, 1),
          onFail: () => {
            fluid = null;
            canvas.remove();
          },
        });
        if (!fluid) canvas.remove();
        else if (!current) fluid.pause();
      })
      .catch(() => canvas.remove());
  };

  const enter = (row: HTMLElement) => {
    window.clearTimeout(sleepTimer);
    if (current && current !== row) current.classList.remove('is-live');
    current = row;
    const live = row.querySelector<HTMLElement>('[data-svc-live]');
    if (live && video.parentElement !== live) {
      live.append(video);
      if (!fluidTried || fluid) live.append(canvas);
    }
    row.classList.add('is-live');
    void video.play().catch(() => {});
    ensureFluid();
    fluid?.refit();
    fluid?.resume();
    lastX = -1;
  };

  const leave = (row: HTMLElement) => {
    row.classList.remove('is-live');
    if (current !== row) return;
    current = null;
    // Espera o fade terminar antes de parar o vídeo e a simulação
    sleepTimer = window.setTimeout(() => {
      if (current) return;
      video.pause();
      fluid?.pause();
    }, 1000);
  };

  for (const row of rows) {
    row.addEventListener('pointerenter', () => enter(row));
    row.addEventListener('pointerleave', () => leave(row));
    row.addEventListener(
      'pointermove',
      (e) => {
        if (!fluid || current !== row) return;
        const r = row.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = 1 - (e.clientY - r.top) / r.height;
        if (lastX >= 0) {
          // Movimento em proporção da linha (larga e baixa): corrige para não exagerar no eixo Y
          const dx = x - lastX;
          const dy = (y - lastY) * (r.height / r.width) * 2;
          if (Math.abs(dx) + Math.abs(dy) > 0.0004) fluid.splat(x, y, dx, dy, 0.2);
        }
        lastX = x;
        lastY = y;
      },
      { passive: true },
    );
  }
}
