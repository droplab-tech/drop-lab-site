/**
 * Formulário de contato
 * - Máscara de telefone BR, validação em tempo real e mensagens acessíveis
 * - Envio principal: abre o WhatsApp com a mensagem formatada
 * - Envio por e-mail (opcional): ativado por PUBLIC_WEB3FORMS_KEY ou PUBLIC_FORMSPREE_ID
 * - Honeypot anti-spam (campo "website" invisível para humanos)
 */
import { site, whatsappLink } from '@/config/site';

const WEB3FORMS_KEY = import.meta.env.PUBLIC_WEB3FORMS_KEY;
const FORMSPREE_ID = import.meta.env.PUBLIC_FORMSPREE_ID;

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/** (34) 99189-8546 ou (34) 3333-4444 */
export function maskPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Regras de validação. Retorna a mensagem de erro ou '' se válido. */
const validators: Record<string, (el: Field) => string> = {
  nome: (el) => {
    const v = el.value.trim();
    if (!v) return 'Informe seu nome.';
    if (v.length < 2) return 'O nome precisa ter pelo menos 2 letras.';
    return '';
  },
  telefone: (el) => {
    const digits = el.value.replace(/\D/g, '');
    if (!digits) return 'Informe seu WhatsApp ou telefone.';
    if (digits.length < 10) return 'Digite o número completo com DDD.';
    return '';
  },
  email: (el) => {
    const v = el.value.trim();
    if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Digite um e-mail válido.';
    return '';
  },
  tipo: (el) => (el.value ? '' : 'Selecione o tipo de projeto.'),
  mensagem: (el) => {
    const v = el.value.trim();
    if (!v) return 'Conte um pouco sobre o seu projeto.';
    if (v.length < 10) return 'Escreva pelo menos 10 caracteres.';
    return '';
  },
  consentimento: (el) =>
    (el as HTMLInputElement).checked ? '' : 'Você precisa concordar para continuarmos.',
};

function setError(el: Field, message: string) {
  const errorEl = document.getElementById(`${el.name}-error`);
  if (!errorEl) return;
  errorEl.textContent = message;
  errorEl.hidden = !message;
  el.setAttribute('aria-invalid', message ? 'true' : 'false');
}

function validate(el: Field): boolean {
  const rule = validators[el.name];
  if (!rule) return true;
  const msg = rule(el);
  setError(el, msg);
  return !msg;
}

function buildMessage(data: FormData): string {
  const line = (label: string, key: string) => {
    const v = String(data.get(key) ?? '').trim();
    return v ? `*${label}:* ${v}` : '';
  };
  // Campos opcionais vazios são omitidos
  const details = [
    line('Nome', 'nome'),
    line('WhatsApp', 'telefone'),
    line('E-mail', 'email'),
    line('Tipo de projeto', 'tipo'),
  ].filter(Boolean);
  return [
    `Olá! Vim pelo site da ${site.name} e quero um orçamento.`,
    details.join('\n'),
    line('Mensagem', 'mensagem'),
  ].join('\n\n');
}

/** Envio opcional por e-mail. Usa keepalive para não ser cancelado ao abrir o WhatsApp. */
async function sendEmail(data: FormData) {
  const payload = Object.fromEntries(
    ['nome', 'telefone', 'email', 'tipo', 'mensagem'].map((k) => [
      k,
      String(data.get(k) ?? ''),
    ]),
  );
  try {
    if (WEB3FORMS_KEY) {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Novo contato pelo site: ${payload.nome} (${payload.tipo})`,
          from_name: `Site ${site.name}`,
          ...payload,
        }),
      });
    } else if (FORMSPREE_ID) {
      await fetch(`https://formspree.io/f/${encodeURIComponent(FORMSPREE_ID)}`, {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ _subject: `Novo contato pelo site: ${payload.nome}`, ...payload }),
      });
    }
  } catch (err) {
    // O WhatsApp já foi aberto, então só registramos a falha do e-mail
    console.warn('Falha ao enviar o formulário por e-mail', err);
  }
}

export function initContactForm() {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form) return;
  // Sem JS, o navegador valida os campos (required). Com JS, assumimos a validação acessível.
  form.noValidate = true;

  const success = document.querySelector<HTMLElement>('[data-form-success]');
  const fields = Array.from(form.querySelectorAll<Field>('input, select, textarea')).filter(
    (el) => el.name in validators,
  );
  const touched = new Set<string>();

  // Máscara de telefone
  const phone = form.querySelector<HTMLInputElement>('input[name="telefone"]');
  phone?.addEventListener('input', () => {
    phone.value = maskPhone(phone.value);
  });

  // Validação em tempo real: no blur e, depois do primeiro contato, a cada digitação
  fields.forEach((el) => {
    el.addEventListener('blur', () => {
      touched.add(el.name);
      validate(el);
    });
    el.addEventListener(
      el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input',
      () => {
        if (touched.has(el.name) || el.type === 'checkbox' || el.tagName === 'SELECT') validate(el);
      },
    );
  });

  // Botões "Solicitar orçamento" dos planos pré-selecionam o tipo de projeto
  document.querySelectorAll<HTMLElement>('[data-project-type]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const select = form.querySelector<HTMLSelectElement>('select[name="tipo"]');
      if (select && btn.dataset.projectType) {
        select.value = btn.dataset.projectType;
        validate(select);
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(form);

    // Honeypot: robôs preenchem o campo escondido. Fingimos sucesso e não enviamos nada.
    if (String(data.get('website') ?? '').trim()) {
      form.reset();
      return;
    }

    const results = fields.map((el) => validate(el));
    if (results.includes(false)) {
      fields.forEach((el) => touched.add(el.name));
      const firstInvalid = fields.find((el) => el.getAttribute('aria-invalid') === 'true');
      firstInvalid?.focus();
      return;
    }

    // Abre o WhatsApp de forma síncrona (no clique) para não ser bloqueado como pop-up
    const url = whatsappLink(buildMessage(data));
    // (sem 'noopener' na chamada, pois com ele window.open sempre retorna null)
    const win = window.open(url, '_blank');
    if (win) win.opener = null;
    else window.location.href = url;

    void sendEmail(data);
    window.droplabTrack?.('form_submit', { project_type: String(data.get('tipo') ?? '') });

    // Feedback de sucesso
    form.reset();
    touched.clear();
    fields.forEach((el) => el.setAttribute('aria-invalid', 'false'));
    if (success) {
      success.hidden = false;
      success.focus();
    }
  });

  success?.querySelector('[data-form-reset]')?.addEventListener('click', () => {
    success.hidden = true;
    form.querySelector<HTMLElement>('input[name="nome"]')?.focus();
  });
}
