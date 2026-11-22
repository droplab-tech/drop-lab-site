/** Alterna entre modo escuro e claro e salva a escolha do visitante. */
const STORAGE_KEY = 'droplab-theme';
const THEME_COLORS = { dark: '#05070D', light: '#F5F8FD' } as const;

type Theme = keyof typeof THEME_COLORS;

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  // Desliga transições por um frame para a troca não "arrastar" cada elemento
  root.classList.add('theme-switching');
  root.dataset.theme = theme;
  document
    .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    .forEach((m) => (m.content = THEME_COLORS[theme]));
  requestAnimationFrame(() =>
    requestAnimationFrame(() => root.classList.remove('theme-switching')),
  );
}

export function initTheme() {
  // O tema inicial já foi aplicado pelo script inline no <head>; aqui só sincronizamos
  // a cor da barra do navegador (sem forçar recálculo de estilos da página).
  const current = (document.documentElement.dataset.theme as Theme) || 'dark';
  document
    .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    .forEach((m) => (m.content = THEME_COLORS[current]));

  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next: Theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* modo privado: ignora */
      }
    });
  });
}
