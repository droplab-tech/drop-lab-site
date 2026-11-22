/**
 * Analytics preparado e DESLIGADO por padrão.
 * Ativação: defina PUBLIC_GA_ID e/ou PUBLIC_META_PIXEL_ID no ambiente (ver README).
 * Os scripts só carregam após o consentimento no banner de cookies (LGPD).
 *
 * Eventos de conversão:
 *  - Clique em qualquer link do WhatsApp → GA4 "whatsapp_click" + "generate_lead" | Pixel "Contact"
 *  - Envio do formulário → GA4 "generate_lead" (method: form) | Pixel "Lead"
 */
const GA_ID = import.meta.env.PUBLIC_GA_ID;
const PIXEL_ID = import.meta.env.PUBLIC_META_PIXEL_ID;
const CONSENT_KEY = 'droplab-consent';

let loaded = false;

function getConsent(): 'granted' | 'denied' | null {
  try {
    return localStorage.getItem(CONSENT_KEY) as 'granted' | 'denied' | null;
  } catch {
    return null;
  }
}

function setConsent(value: 'granted' | 'denied') {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* ignora */
  }
}

function loadScript(src: string) {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

function loadTrackers() {
  if (loaded) return;
  loaded = true;

  if (GA_ID) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      // gtag exige o objeto `arguments` original
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`);
  }

  if (PIXEL_ID) {
    // Snippet oficial do Meta Pixel, em versão legível: enfileira chamadas até o script carregar
    type Fbq = ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue: unknown[];
      loaded: boolean;
      version: string;
      push: unknown;
    };
    const fbq = ((...args: unknown[]) => {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    }) as Fbq;
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.push = fbq;
    window.fbq = fbq;
    loadScript('https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', PIXEL_ID);
    fbq('track', 'PageView');
  }
}

/** Dispara eventos de conversão (só se o visitante aceitou os cookies). */
function track(event: 'whatsapp_click' | 'form_submit', data: Record<string, unknown> = {}) {
  if (!loaded) return;
  if (event === 'whatsapp_click') {
    window.gtag?.('event', 'whatsapp_click', data);
    window.gtag?.('event', 'generate_lead', { method: 'whatsapp', ...data });
    window.fbq?.('track', 'Contact', data);
  } else {
    window.gtag?.('event', 'generate_lead', { method: 'form', ...data });
    window.fbq?.('track', 'Lead', data);
  }
}

export function initAnalytics() {
  window.droplabTrack = track;

  // Conversão: qualquer link do WhatsApp na página
  document.addEventListener('click', (e) => {
    const link = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href*="wa.me/"]');
    if (link) track('whatsapp_click', { location: link.dataset.trackLocation ?? 'site' });
  });

  if (!GA_ID && !PIXEL_ID) return;

  const banner = document.querySelector<HTMLElement>('[data-cookie-banner]');
  const consent = getConsent();
  if (consent === 'granted') loadTrackers();
  else if (consent === null && banner) banner.hidden = false;

  banner?.querySelector('[data-cookie-accept]')?.addEventListener('click', () => {
    setConsent('granted');
    banner.hidden = true;
    loadTrackers();
  });
  banner?.querySelector('[data-cookie-decline]')?.addEventListener('click', () => {
    setConsent('denied');
    banner.hidden = true;
  });
  document.querySelector('[data-cookie-settings]')?.addEventListener('click', () => {
    if (banner) {
      banner.hidden = false;
      banner.querySelector<HTMLElement>('[data-cookie-accept]')?.focus();
    }
  });
}
