/**
 * Ponto de entrada do JavaScript do site (bundle pequeno; as animações vêm depois, sob demanda).
 * Cada módulo verifica se os elementos existem antes de agir.
 *
 * A inicialização é dividida em 3 momentos para não bloquear a primeira pintura:
 *  1. imediato: o que afeta o que o visitante vê/usa logo de cara
 *  2. próximo frame: o que lê a posição de rolagem (evita forçar layout durante o parse)
 *  3. ocioso: o que só é necessário depois (scrollspy, formulário, analytics)
 */
import { initTheme } from './theme';
import { initHeader, initMobileMenu, initScrollSpy, initFloatingWhatsApp } from './navigation';
import { initReveal } from './reveal';
import { initAnalytics } from './analytics';
import { initContactForm } from './form';
import { initHeroVideo, initCtaVideo } from './hero-video';
import { onFirstInteraction } from './interaction';
import { initIntro, afterIntro } from './intro';
import { initTitleHover } from './title-hover';
import { initServicesFx } from './services-fx';
import { initAbout3D } from './about-3d-loader';

initIntro();
initTheme();
initMobileMenu();
initReveal();
initHeroVideo();
initCtaVideo();

requestAnimationFrame(() => {
  initHeader();
  initFloatingWhatsApp();
});

const whenIdle: (cb: () => void) => void =
  'requestIdleCallback' in window
    ? (cb) => window.requestIdleCallback(cb, { timeout: 1500 })
    : (cb) => setTimeout(cb, 300);

whenIdle(() => {
  initAnalytics();
  initScrollSpy();
  initContactForm();
  initTitleHover();
  initServicesFx();
  initAbout3D();
});

// Animações (GSAP + Lenis) num pacote separado, carregado só na primeira interação
// (rolar, tocar, clicar): elas só agem na rolagem, então não precisam pesar no
// carregamento. Antes, libera a renderização das seções adiadas (.cv-auto), uma por
// tarefa ociosa, para que as medidas de rolagem usem as alturas reais.
const renderAllNow = () =>
  document.querySelectorAll('.cv-auto').forEach((el) => el.classList.remove('cv-auto'));
const renderDeferred = (done: () => void) => {
  const pending = Array.from(document.querySelectorAll<HTMLElement>('.cv-auto'));
  const next = () => {
    const el = pending.shift();
    if (!el) return done();
    el.classList.remove('cv-auto');
    whenIdle(next);
  };
  next();
};
// Com a intro aberta, espera ela terminar (a GPU e a rede ficam com a intro)
afterIntro(
  () =>
    onFirstInteraction(() =>
      renderDeferred(() => whenIdle(() => void import('./motion').then((m) => m.initMotion()))),
    ),
  'done',
);

// Links internos (#secao): renderiza tudo antes de rolar, para cair no lugar certo
document.addEventListener(
  'click',
  (e) => {
    if ((e.target as Element | null)?.closest?.('a[href^="#"], a[href^="/#"]')) renderAllNow();
  },
  { capture: true },
);
if (location.hash) renderAllNow();
