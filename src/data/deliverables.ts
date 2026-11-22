import type { IconName } from '@/components/ui/icons';

/**
 * "O que você recebe": o padrão de qualidade incluso em todo projeto.
 * Liste só o que realmente é entregue em todos os projetos.
 */
export interface Deliverable {
  icon: IconName;
  title: string;
  description: string;
}

export const deliverables: Deliverable[] = [
  {
    icon: 'palette',
    title: 'Design exclusivo',
    description: 'Layout criado do zero para a sua marca. Nada de template genérico.',
  },
  {
    icon: 'smartphone',
    title: '100% responsivo',
    description: 'Funciona bem no celular, no tablet e no computador, testado em diferentes telas.',
  },
  {
    icon: 'zap',
    title: 'Carregamento rápido',
    description: 'Código leve e imagens otimizadas, com meta de nota 90+ no Google Lighthouse.',
  },
  {
    icon: 'search',
    title: 'SEO básico configurado',
    description:
      'Títulos, descrições, sitemap e dados estruturados para o Google entender o seu site.',
  },
  {
    icon: 'message',
    title: 'WhatsApp e formulário',
    description: 'Botões de WhatsApp e formulário de contato integrados para receber pedidos.',
  },
  {
    icon: 'chart',
    title: 'Painel de métricas',
    description: 'Google Analytics configurado para você acompanhar visitas e contatos.',
  },
  {
    icon: 'globe',
    title: 'Domínio e hospedagem',
    description:
      'Orientamos o registro do domínio e publicamos o site em uma hospedagem rápida e segura.',
  },
  {
    icon: 'lifebuoy',
    title: 'Suporte após a entrega',
    description: 'Acompanhamos o lançamento e ajustamos o que for preciso depois da entrega.',
  },
];
