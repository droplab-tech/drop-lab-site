import { site } from '@/config/site';

export interface Plan {
  name: string;
  description: string;
  price: string;
  priceLabel: string;
  features: string[];
  highlighted?: boolean;
  /** Valor pré-selecionado no campo "Tipo de projeto" do formulário */
  projectType: 'Landing Page' | 'Site Institucional' | 'E-commerce' | 'Outro';
}

export const plans: Plan[] = [
  {
    name: 'Landing Page',
    description: 'Ideal para campanhas, lançamentos e captação de leads.',
    price: site.pricing.landingPage,
    priceLabel: 'a partir de',
    features: [
      'Página única com design exclusivo',
      'Copy orientada à conversão',
      'Botão e integração com WhatsApp',
      'Formulário de captação',
      'Google Analytics e Meta Pixel',
      '100% responsiva e otimizada',
    ],
    projectType: 'Landing Page',
  },
  {
    name: 'Site Institucional',
    description: 'A presença digital completa para empresas e profissionais.',
    price: site.pricing.institutional,
    priceLabel: 'a partir de',
    features: [
      'Até 6 seções ou páginas',
      'Design exclusivo com sua identidade',
      'SEO técnico para o Google',
      'Formulário + WhatsApp integrados',
      'Política de privacidade (LGPD)',
      '30 dias de suporte pós-entrega',
    ],
    highlighted: true,
    projectType: 'Site Institucional',
  },
  {
    name: 'Personalizado',
    description: 'Projetos sob medida: e-commerce, catálogos e sistemas web.',
    price: site.pricing.custom,
    priceLabel: 'investimento',
    features: [
      'Escopo desenhado para o seu negócio',
      'E-commerce ou catálogo online',
      'Integrações e automações',
      'Área administrativa, se necessário',
      'Manutenção mensal opcional',
      'Atendimento prioritário',
    ],
    projectType: 'Outro',
  },
];
