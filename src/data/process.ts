import type { IconName } from '@/components/ui/icons';

export interface ProcessStep {
  icon: IconName;
  title: string;
  description: string;
  duration: string;
}

export const processSteps: ProcessStep[] = [
  {
    icon: 'message',
    title: 'Briefing',
    description:
      'Uma conversa rápida para entender seu negócio, seu público e o objetivo do projeto.',
    duration: 'Dia 1',
  },
  {
    icon: 'file',
    title: 'Proposta',
    description: 'Você recebe escopo, prazo e investimento por escrito. Sem letras miúdas.',
    duration: 'Até 48h',
  },
  {
    icon: 'pen',
    title: 'Design',
    description: 'Criamos o layout exclusivo e ajustamos com você até ficar do jeito que imaginou.',
    duration: '3 a 7 dias',
  },
  {
    icon: 'code',
    title: 'Desenvolvimento',
    description:
      'Código rápido, responsivo e otimizado para SEO, com integrações e testes em todos os dispositivos.',
    duration: '5 a 15 dias',
  },
  {
    icon: 'rocket',
    title: 'Lançamento & Suporte',
    description:
      'Publicamos no seu domínio, configuramos o analytics e seguimos ao seu lado depois da entrega.',
    duration: 'Contínuo',
  },
];
