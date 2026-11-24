/**
 * Formatos de projeto. Sem valores: cada proposta é feita sob medida.
 * O botão de cada formato pré-seleciona o "Tipo de projeto" no formulário.
 */
export type ProjectType = 'Página de Conversão' | 'Site Institucional' | 'E-commerce' | 'Outro';

export interface Plan {
  name: string;
  description: string;
  /** Prazo típico exibido como medida */
  timeline: string;
  features: string[];
  highlighted?: boolean;
  projectType: ProjectType;
}

export const plans: Plan[] = [
  {
    name: 'Página de Conversão',
    description: 'Uma página focada em uma única ação, para campanhas, lançamentos e captação.',
    timeline: '7 a 10 dias úteis',
    features: [
      'Página única com design exclusivo',
      'Textos orientados à conversão',
      'Botão e integração com WhatsApp',
      'Formulário de captação',
      'Google Analytics e Meta Pixel',
      '100% responsiva e otimizada',
    ],
    projectType: 'Página de Conversão',
  },
  {
    name: 'Site Institucional',
    description: 'A presença digital completa para empresas e profissionais.',
    timeline: '15 a 25 dias úteis',
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
    timeline: 'Prazo sob medida',
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
