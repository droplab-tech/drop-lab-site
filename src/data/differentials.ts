import type { IconName } from '@/components/ui/icons';

export interface Differential {
  icon: IconName;
  title: string;
  description: string;
}

export const differentials: Differential[] = [
  {
    icon: 'palette',
    title: 'Design exclusivo',
    description:
      'Nada de template genérico. Cada projeto nasce do zero, com a identidade da sua marca.',
  },
  {
    icon: 'target',
    title: 'Foco em conversão',
    description:
      'Layout, textos e chamadas pensados para transformar visitas em mensagens e vendas.',
  },
  {
    icon: 'zap',
    title: 'Carregamento rápido',
    description: 'Código leve e otimizado. Sites que abrem em segundos, inclusive no 4G.',
  },
  {
    icon: 'message',
    title: 'Atendimento direto',
    description:
      'Fale com quem desenvolve o seu projeto pelo WhatsApp, sem intermediários nem robôs.',
  },
  {
    icon: 'shield',
    title: 'Suporte pós-entrega',
    description:
      'Seu site não fica abandonado: acompanhamos, ajustamos e orientamos após o lançamento.',
  },
];
