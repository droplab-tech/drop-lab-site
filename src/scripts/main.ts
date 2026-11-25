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
import { initHeroVideo } from './hero-video';

initTheme();
initMobileMenu();
initReveal();
initHeroVideo();

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
});

// Animações (GSAP + Lenis) num pacote separado, carregado só depois que a página
// terminou de carregar e o navegador ficou ocioso: não pesa na primeira pintura.
// Antes, libera a renderização das seções adiadas (.cv-auto), uma por tarefa ociosa,
// para que as medidas de rolagem usem as alturas reais.
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
const loadMotion = () =>
  renderDeferred(() => whenIdle(() => void import('./motion').then((m) => m.initMotion())));
if (document.readyState === 'complete') loadMotion();
else window.addEventListener('load', loadMotion, { once: true });
