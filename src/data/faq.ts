export interface FaqItem {
  question: string;
  answer: string;
}

export const faq: FaqItem[] = [
  {
    question: 'Quanto tempo leva para meu site ficar pronto?',
    answer:
      'Uma landing page costuma ficar pronta entre 7 e 10 dias úteis. Um site institucional leva de 15 a 25 dias úteis. O prazo exato vai na proposta e depende principalmente da agilidade no envio de textos e imagens.',
  },
  {
    question: 'Quanto custa a criação de um site?',
    answer:
      'Depende do tamanho e das funcionalidades. Cada projeto é orçado sob medida: depois de entender o seu negócio e o que você precisa, enviamos uma proposta fechada, por escrito e sem surpresas. O orçamento é gratuito.',
  },
  {
    question: 'Preciso ter domínio e hospedagem?',
    answer:
      'Não precisa se preocupar. Se você ainda não tem, orientamos a compra do domínio (.com.br ou .com) e cuidamos da publicação. Usamos hospedagens modernas e rápidas que, em muitos casos, não têm custo mensal.',
  },
  {
    question: 'Posso pedir alterações durante o projeto?',
    answer:
      'Sim. Todas as etapas têm rodadas de ajustes incluídas. Você vê o layout antes do desenvolvimento e aprova cada fase. Mudanças grandes de escopo são combinadas com transparência.',
  },
  {
    question: 'Vocês fazem manutenção depois da entrega?',
    answer:
      'Sim. Todo projeto tem um período de suporte pós-entrega e, se você quiser, oferecemos planos mensais de manutenção com atualizações, backups e alterações de conteúdo.',
  },
  {
    question: 'Meu site vai aparecer no Google?',
    answer:
      'Todos os sites saem com SEO técnico: estrutura correta, velocidade, sitemap, dados estruturados e cadastro no Google Search Console. O posicionamento orgânico é construído com o tempo, e começamos com a base certa.',
  },
  {
    question: 'O site funciona bem no celular?',
    answer:
      'Sim, e é por onde começamos. A maior parte das visitas vem do celular, por isso todo projeto é pensado primeiro para telas pequenas e testado em diferentes dispositivos.',
  },
  {
    question: 'Como funciona o pagamento?',
    answer:
      'Normalmente dividimos em entrada e entrega, via Pix ou boleto. Condições de parcelamento podem ser combinadas na proposta.',
  },
];
