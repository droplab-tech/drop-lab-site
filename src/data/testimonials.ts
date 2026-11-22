/**
 * DEPOIMENTOS
 * A seção de depoimentos fica ESCONDIDA enquanto este array estiver vazio.
 * Adicione apenas depoimentos reais, com autorização do cliente. Exemplo:
 *
 * {
 *   name: 'Nome do Cliente',
 *   role: 'Cargo, Empresa',
 *   quote: 'Texto do depoimento...',
 *   avatar: '', // opcional: caminho em /public, ex.: '/clientes/nome.webp'
 * },
 */
export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  avatar?: string;
}

export const testimonials: Testimonial[] = [];
