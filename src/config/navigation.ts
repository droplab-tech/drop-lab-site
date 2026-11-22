import { site } from './site';
import { projects } from '@/data/portfolio';

/**
 * Menu efetivo do site (header, menu mobile e rodapé).
 * Enquanto src/data/portfolio.ts estiver vazio, o item "Portfólio" vira "Entregas"
 * (seção "O que você recebe"). Com projetos, volta a ser "Portfólio" automaticamente.
 *
 * Fica separado de site.ts porque site.ts também é lido pelo astro.config.ts,
 * que não pode importar imagens.
 */
export const hasProjects = projects.length > 0;

export const navItems = site.nav.map((item) =>
  item.href === '#portfolio' && !hasProjects ? { label: 'Entregas', href: '#entregas' } : item,
);
