import type { IconName } from '@/components/ui/icons';

export interface Service {
  icon: IconName;
  title: string;
  description: string;
  benefit: string;
}

export const services: Service[] = [
  {
    icon: 'layout',
    title: 'Sites Institucionais',
    description:
      'Um site completo que apresenta sua empresa com autoridade: quem você é, o que faz e por que confiar em você.',
    benefit: 'Credibilidade imediata para fechar mais negócios',
  },
  {
    icon: 'target',
    title: 'Páginas de Conversão',
    description:
      'Páginas focadas em uma única ação, com copy persuasiva e estrutura testada para campanhas e lançamentos.',
    benefit: 'Mais leads com o mesmo investimento em anúncios',
  },
  {
    icon: 'cart',
    title: 'E-commerce & Catálogo',
    description:
      'Vitrine online para seus produtos, com pedidos direto no WhatsApp ou checkout integrado.',
    benefit: 'Venda 24 horas por dia, sem depender de marketplace',
  },
  {
    icon: 'wrench',
    title: 'Manutenção & Suporte',
    description:
      'Atualizações, backups, ajustes de conteúdo e monitoramento para seu site estar sempre no ar.',
    benefit: 'Tranquilidade para focar no seu negócio',
  },
  {
    icon: 'gauge',
    title: 'SEO & Performance',
    description:
      'Otimização técnica, velocidade e estrutura de conteúdo para aparecer melhor nas buscas do Google.',
    benefit: 'Clientes encontrando você de forma orgânica',
  },
  {
    icon: 'plug',
    title: 'Integrações',
    description:
      'WhatsApp, Google Analytics, Meta Pixel, formulários e ferramentas de marketing conectados ao seu site.',
    benefit: 'Dados reais para decidir onde investir',
  },
];
