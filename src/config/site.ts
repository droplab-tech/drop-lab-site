/**
 * ============================================================
 *  CONFIGURAÇÃO CENTRAL DA DROPLAB
 * ============================================================
 *  Edite aqui nome, contatos, redes sociais, domínio e textos-chave.
 *  Tudo no site lê deste arquivo, então nada precisa ser alterado em
 *  outros lugares. Itens marcados com  ⚠️ PLACEHOLDER  devem ser trocados.
 */

const whatsappNumber = '5534991898546';
const whatsappDefaultMessage = 'Olá! Vim pelo site da Droplab e quero um orçamento.';

/** Monta um link wa.me com mensagem já codificada. */
export function whatsappLink(message: string = whatsappDefaultMessage): string {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const site = {
  name: 'Droplab',
  legalName: 'Droplab', // ⚠️ PLACEHOLDER: razão social, se houver
  slogan: 'Sites · Páginas de conversão · Soluções web',

  /**
   * Domínio final, com https:// e sem barra no fim (ex.: 'https://www.seudominio.com.br').
   * Enquanto estiver vazio, o site não gera canonical, og:url, og:image, sitemap nem a
   * linha Sitemap do robots.txt, pois todos exigem um endereço absoluto.
   */
  url: 'https://www.droplabweb.com' as string,

  /** Título e descrição padrão (SEO) */
  title: 'Droplab | Sites sob medida que transformam visitas em clientes',
  description:
    'A Droplab cria sites institucionais, páginas de conversão e soluções web sob medida. Design exclusivo, carregamento rápido e otimizado para o Google. Peça seu orçamento pelo WhatsApp.',
  ogImage: '/og-image.png',
  locale: 'pt_BR',

  contact: {
    whatsapp: whatsappNumber,
    whatsappDisplay: '+55 (34) 99189-8546',
    whatsappMessage: whatsappDefaultMessage,
    /** E-mail exibido no site. Deixe '' para esconder o e-mail em todo o site. */
    email: 'droplabtech@gmail.com',
    city: 'Uberlândia', // ⚠️ PLACEHOLDER
    state: 'MG', // ⚠️ PLACEHOLDER
    country: 'BR',
    /** Área de atuação (JSON-LD). Atendimento remoto para todo o Brasil. */
    areaServed: 'Brasil',
    hours: 'Seg a Sex, 9h às 18h', // ⚠️ PLACEHOLDER
  },

  /** ⚠️ PLACEHOLDER: deixe '' para esconder a rede no rodapé. */
  social: {
    instagram: 'https://www.instagram.com/droplabtech/',
    linkedin: '', // ex.: 'https://linkedin.com/company/droplab'
    behance: '',
    github: '',
  },

  /** Navegação principal (âncoras da one-page) */
  nav: [
    { label: 'Início', href: '#inicio' },
    { label: 'Serviços', href: '#servicos' },
    { label: 'Processo', href: '#processo' },
    // Enquanto src/data/portfolio.ts estiver vazio, este item aparece como "Entregas" (#entregas)
    { label: 'Portfólio', href: '#portfolio' },
    { label: 'Sobre', href: '#sobre' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contato', href: '#contato' },
  ],

  /** Textos-chave reutilizados em várias seções */
  copy: {
    heroTitle: 'Sites que fazem o seu negócio ser escolhido.',
    heroSubtitle:
      'Desenhados do zero para transmitir confiança em segundos e transformar visitas em conversas. Estratégia, design e código no mesmo lugar, com atendimento direto pelo WhatsApp.',
    proofStrip: ['Design feito do zero', 'Alta performance em qualquer conexão', 'Pensado para converter'],
    finalCtaTitle: 'Seu próximo cliente já está procurando. Que ele encontre você pronto.',
    finalCtaText:
      'Conte sua ideia em uma mensagem. Respondemos no mesmo dia útil, com uma proposta clara e sem compromisso.',
  },

  /**
   * Tema inicial para quem visita pela primeira vez:
   * 'dark' (padrão da marca), 'light' ou 'system' (segue o sistema do visitante).
   * Depois que o visitante clica no botão, a escolha dele fica salva.
   */
  defaultTheme: 'dark' as 'dark' | 'light' | 'system',

  /**
   * Microcopy específica de cada tema. O botão de tema troca esses textos
   * junto com as cores, para que cada modo tenha a sua personalidade.
   */
  themeCopy: {
    dark: {
      toggleLabel: 'Ativar modo claro',
      footerNote: 'Design e desenvolvimento web sob medida.',
    },
    light: {
      toggleLabel: 'Ativar modo escuro',
      footerNote: 'Design e desenvolvimento web sob medida.',
    },
  },
} as const;

export type Site = typeof site;
