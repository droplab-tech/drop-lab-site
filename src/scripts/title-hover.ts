/**
 * Títulos grandes (hero, seções, chamada final): ao passar o cursor, cada letra acende
 * no azul da marca e apaga devagar, deixando um rastro. Só com mouse/trackpad.
 * As letras só são separadas quando o cursor chega no título (nada pesa no carregamento).
 */
import { splitWords } from './split';

const SELECTOR = '#inicio h1, main h2.text-title, .cta-title';

function splitLetters(el: HTMLElement) {
  if (el.dataset.letters === 'done') return;
  for (const word of splitWords(el)) {
    if (word.querySelector('.ch')) continue;
    const text = word.textContent ?? '';
    word.textContent = '';
    for (const c of text) {
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = c;
      word.append(s);
    }
  }
  el.dataset.letters = 'done';
}

export function initTitleHover() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
    el.addEventListener('pointerenter', () => splitLetters(el), { once: true });
  });
}
