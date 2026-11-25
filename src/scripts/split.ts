/**
 * Quebra o texto de um título em palavras mascaradas (.w > span), mantendo o texto
 * acessível pelo aria-label. Usado pela entrada dos títulos (motion.ts) e pelo
 * hover letra a letra (title-hover.ts); qualquer um dos dois pode quebrar primeiro.
 */
export function splitWords(el: HTMLElement): HTMLElement[] {
  if (el.dataset.split !== 'done') {
    const text = el.textContent?.trim().replace(/\s+/g, ' ') ?? '';
    el.setAttribute('aria-label', text);
    el.textContent = '';
    text.split(' ').forEach((word, i) => {
      if (i) el.append(' ');
      const w = document.createElement('span');
      w.className = 'w';
      w.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span');
      inner.textContent = word;
      w.append(inner);
      el.append(w);
    });
    el.dataset.split = 'done';
  }
  return Array.from(el.querySelectorAll<HTMLElement>('.w > span'));
}
