/**
 * Decide se a seção "Sobre" ganha a cena 3D e só baixa o Three.js (≈150 KB) quando a
 * seção estiver chegando perto da tela. Sem WebGL2, com economia de dados, conexão 2G
 * ou aparelho fraco, fica a versão estática em CSS.
 */
export function initAbout3D() {
  const host = document.querySelector<HTMLElement>('[data-about-3d]');
  if (!host) return;

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  if (nav.connection?.saveData || /2g/.test(nav.connection?.effectiveType ?? '')) return;
  if ((nav.deviceMemory ?? 8) <= 2 || (navigator.hardwareConcurrency ?? 8) <= 2) return;
  try {
    if (!document.createElement('canvas').getContext('webgl2')) return;
  } catch {
    return;
  }

  const io = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      void import('./about-3d')
        .then((m) => m.startAboutScene(host))
        .catch(() => {
          /* sem a cena: a versão estática continua */
        });
    },
    { rootMargin: '900px 0px' },
  );
  io.observe(host);
}
