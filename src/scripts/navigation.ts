/** Header (estado ao rolar), menu mobile acessível, scrollspy e botão flutuante. */

/** Header ganha fundo com blur e borda depois de rolar. */
export function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  const update = () => (header.dataset.scrolled = String(window.scrollY > 12));
  update();
  window.addEventListener('scroll', update, { passive: true });
}

/** Botão flutuante do WhatsApp aparece depois de rolar além do Hero. */
export function initFloatingWhatsApp() {
  const btn = document.querySelector<HTMLElement>('[data-wa-float]');
  if (!btn) return;
  const update = () => (btn.dataset.visible = String(window.scrollY > window.innerHeight * 0.5));
  update();
  window.addEventListener('scroll', update, { passive: true });
}

/** Menu mobile: aria-expanded, foco preso, fecha com ESC, clique fora ou em um link. */
export function initMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const openBtn = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  if (!menu || !openBtn) return;

  const focusables = () =>
    Array.from(
      menu.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => el.offsetParent !== null);

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = focusables();
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  function open() {
    menu!.hidden = false;
    openBtn!.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeydown);
    focusables()[0]?.focus();
  }

  function close(returnFocus = true) {
    menu!.hidden = true;
    openBtn!.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKeydown);
    if (returnFocus) openBtn!.focus();
  }

  openBtn.addEventListener('click', open);
  menu
    .querySelectorAll('[data-menu-close]')
    .forEach((el) => el.addEventListener('click', () => close()));
  menu
    .querySelectorAll('[data-menu-link]')
    .forEach((el) => el.addEventListener('click', () => close(false)));
  // Ao crescer para desktop com o menu aberto, fecha
  matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
    if (e.matches && !menu.hidden) close(false);
  });
}

/** Destaca no menu o link da seção visível (aria-current). */
export function initScrollSpy() {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]'));
  const ids = [...new Set(links.map((l) => l.hash.slice(1)).filter(Boolean))];
  const sections = ids
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => Boolean(el));
  if (!sections.length) return;

  const setActive = (id: string) => {
    links.forEach((l) => {
      if (l.hash === `#${id}`) l.setAttribute('aria-current', 'true');
      else l.removeAttribute('aria-current');
    });
  };

  // Linha de detecção no terço superior da tela
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-35% 0px -60% 0px' },
  );
  sections.forEach((s) => observer.observe(s));
}
