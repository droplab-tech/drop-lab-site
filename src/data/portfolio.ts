import type { ImageMetadata } from 'astro';

/**
 * PORTFÓLIO
 * A seção "Portfólio" (e o link dela no menu) fica ESCONDIDA enquanto esta lista
 * estiver vazia. Com pelo menos 1 projeto, ela aparece sozinha logo depois da
 * seção "O que você recebe" e o menu troca "Entregas" por "Portfólio".
 *
 * Adicione apenas projetos reais, com autorização do cliente. Passo a passo:
 *  1. Coloque o print do projeto em src/assets/portfolio/ (PNG/JPG/WebP, idealmente 1600×1000)
 *  2. Importe a imagem no topo deste arquivo, por exemplo:
 *       import clienteX from '@/assets/portfolio/cliente-x.png';
 *  3. Adicione um item na lista `projects`:
 *       {
 *         name: 'Nome do projeto',
 *         type: 'Site institucional',        // ou 'Página de conversão', 'E-commerce'…
 *         description: 'Resumo do que foi feito e do objetivo do cliente.',
 *         image: clienteX,
 *         url: 'https://site-do-cliente.com.br', // '' para não mostrar o link
 *         tags: ['Saúde', 'Agendamento'],
 *       },
 */
export interface Project {
  name: string;
  type: string;
  description: string;
  image: ImageMetadata;
  /** Link do projeto publicado. Deixe '' para não exibir o botão. */
  url: string;
  tags: string[];
}

export const projects: Project[] = [];
