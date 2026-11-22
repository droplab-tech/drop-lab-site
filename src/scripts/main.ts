/**
 * Ponto de entrada do JavaScript do site (um único bundle pequeno).
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

initTheme();
initMobileMenu();
initReveal();

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
