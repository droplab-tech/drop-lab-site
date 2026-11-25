/**
 * Executa `cb` na primeira interação do visitante (rolar, tocar, clicar, teclar)
 * ou imediatamente se a página já abriu rolada. Usado para adiar trabalho que só
 * importa depois que a pessoa começa a usar a página (animações de rolagem etc.).
 */
const EVENTS = ['scroll', 'wheel', 'touchstart', 'pointerdown', 'keydown'] as const;

export function onFirstInteraction(cb: () => void, fallbackMs?: number) {
  let done = false;
  let timer = 0;
  const run = () => {
    if (done) return;
    done = true;
    EVENTS.forEach((e) => window.removeEventListener(e, run, { capture: true }));
    window.clearTimeout(timer);
    cb();
  };
  if (window.scrollY > 0) return run();
  EVENTS.forEach((e) => window.addEventListener(e, run, { capture: true, passive: true }));
  if (fallbackMs) timer = window.setTimeout(run, fallbackMs);
}
