# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Donos e gestores de pequenas e médias empresas e prestadores de serviço no Brasil (base em Uberlândia/MG, atendimento remoto para todo o país). Chegam pelo celular na maioria das vezes, muitas vezes vindos do Instagram ou de indicação, querendo entender rápido se a Droplab é séria o bastante para cuidar da presença digital do negócio, e então pedir um orçamento pelo WhatsApp ou formulário.

## Product Purpose

Site institucional one-page da Droplab (domínio www.droplabweb.com), um estúdio que cria sites institucionais, páginas de conversão, e-commerce/catálogo, SEO e manutenção. O site existe para gerar pedidos de orçamento qualificados. Sucesso = o visitante percebe em poucos segundos que a Droplab domina design, marketing e conversão, e inicia uma conversa.

## Positioning

Design feito do zero (sem template), pensado para conversão, com atendimento direto com quem desenvolve, pelo WhatsApp, e suporte depois da entrega. Trabalhar com a Droplab deve parecer uma vantagem competitiva quase injusta sobre os concorrentes do cliente, comunicada com calma e confiança, sem exageros de agência.

## Capabilities and Constraints

- Stack: Astro 7 + Tailwind CSS 4, site estático com deploy na Vercel.
- Funcionalidades a preservar: navegação por âncoras com menu mobile, alternância de tema claro/escuro, formulário de contato (src/scripts/form.ts) com o tipo de projeto pré-selecionado pelos planos, botão flutuante de WhatsApp, banner de cookies/LGPD, analytics, página de política de privacidade, 404, sitemap e robots, JSON-LD.
- Planos continuam (Página de conversão, Site Institucional, Personalizado) **sem valores em reais**; cada um leva a "Pedir proposta".
- Sem PWA: nada de manifest nem convite para instalar o site como aplicativo.
- Portfólio e depoimentos ficam escondidos enquanto as listas em src/data estiverem vazias.

## Brand Commitments

- Nome: Droplab (domínio droplabweb.com). Marca "D + gota" em azul (#0A6CFF), ciano (#22D3EE) e navy (#0B1E4A) sobre quase-preto (#05070D). Paleta da marca deve ser mantida.
- Favicon da marca na aba do navegador.
- Terminologia: **não usar "landing page" em nenhum texto do site** (reconfirmado pelo usuário em 2026-11-24, depois do ajuste de SEO); o serviço se chama "Página de conversão". Os termos de SEO usados são "criação de sites", "site profissional" e "design de sites". Slogan: "Sites · Páginas de conversão · Soluções web".
- Voz: calma, confiante, direta, em português do Brasil; sem superlativos de agência.
- Referência visual escolhida pelo usuário para esta versão: https://www.bluesqx.com/ (inspiração de linguagem, não cópia).

## Evidence on Hand

- Logo e ícone: public/logo.png, public/favicon.svg, src/components/ui/LogoMark.astro.
- Não há portfólio, depoimentos, logos de clientes nem números de resultados. Não inventar nenhum deles.

## Product Principles

1. Provar competência pelo próprio site: o acabamento é o argumento.
2. Um caminho claro até a conversa (WhatsApp ou formulário), sem atrito.
3. Calma vence barulho: confiança sem promessas exageradas.
4. Celular primeiro.

## Accessibility & Inclusion

Contraste WCAG AA nos dois temas, foco visível, respeito a prefers-reduced-motion.
