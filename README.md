# Droplab: site institucional

Site da **Droplab** (Sites • Landing Pages • Soluções Web), feito com **Astro 7** (estático), **TypeScript** e **Tailwind CSS v4**. One-page com modo claro e escuro, formulário que abre o WhatsApp, SEO completo e analytics preparado (desligado por padrão).

---

## Como rodar

Requisitos: **Node.js 22.23.4+** (recomendado: **26 LTS**) e npm.

```bash
npm install        # instala as dependências
npm run dev        # servidor de desenvolvimento em http://localhost:4321
npm run build      # checa tipos (astro check) e gera o site em /dist
npm run preview    # serve o /dist localmente para conferir o build
```

Outros scripts:

| Comando          | O que faz                                                        |
| ---------------- | ---------------------------------------------------------------- |
| `npm run lint`   | ESLint (TS + Astro)                                              |
| `npm run format` | Formata tudo com Prettier (inclui ordenação de classes Tailwind) |
| `npm run assets` | Regera favicons e imagem OG a partir do ícone e do logo          |

---

## Onde editar cada coisa

### Dados do negócio: `src/config/site.ts`

Tudo o que se repete no site fica aqui: nome, slogan, **WhatsApp**, mensagem padrão do WhatsApp, **e-mail**, **cidade**, horário, **redes sociais**, **domínio**, textos do Hero e do CTA final, preços "a partir de" dos planos, tema inicial e a microcopy de cada tema.

Itens marcados com `⚠️ PLACEHOLDER` precisam ser trocados antes de publicar:

- `url`: domínio do site, hoje **`https://www.droplabweb.com`** (com www, sem barra no fim). É usado em canonical, og:url, imagem de compartilhamento (og:image/twitter:image), `sitemap-index.xml`, linha Sitemap do robots.txt e URLs do JSON-LD. Se ficar vazio, todos esses itens deixam de ser gerados
- `contact.city`, `contact.state`, `contact.hours`
- `social.*`: o Instagram já está preenchido (`instagram.com/droplabtech`) e aparece no rodapé, no contato e no JSON-LD; LinkedIn/Behance/GitHub ficam escondidos enquanto vazios
- `contact.email`: deixe `''` para esconder o e-mail em todo o site
- `pricing`: valores "a partir de" dos planos

### Conteúdo das seções: `src/data/`

| Arquivo            | Seção                                                  |
| ------------------ | ------------------------------------------------------ |
| `services.ts`      | Cards de serviços                                      |
| `differentials.ts` | "Por que a Droplab"                                    |
| `process.ts`       | Timeline do processo                                   |
| `portfolio.ts`     | Projetos do portfólio (**vazio = seção escondida**)    |
| `deliverables.ts`  | "O que você recebe" (padrão incluso em todo projeto)   |
| `plans.ts`         | Planos/pacotes                                         |
| `faq.ts`           | Perguntas frequentes (também gera o JSON-LD `FAQPage`) |
| `testimonials.ts`  | Depoimentos (**vazio = seção escondida**)              |

O texto da seção **Sobre** (apresentação, missão, compromissos e nome do responsável) está no topo de `src/components/sections/About.astro`, em variáveis fáceis de editar.

### Portfólio

A seção **Portfólio** fica escondida enquanto `src/data/portfolio.ts` estiver vazio (mesma lógica dos depoimentos). Nesse caso, o menu mostra **"Entregas"**, que leva à seção "O que você recebe".

Ao adicionar o primeiro projeto real, a seção Portfólio aparece sozinha logo depois de "O que você recebe", e o menu volta a mostrar "Portfólio". O passo a passo (com modelo pronto) está nos comentários do próprio `portfolio.ts`:

1. Coloque o print em `src/assets/portfolio/` (PNG/JPG/WebP, de preferência 1600×1000).
2. Importe a imagem no topo de `src/data/portfolio.ts` e adicione um item na lista.
3. Preencha `url` para mostrar o botão de link do projeto.

Adicione apenas projetos reais, com autorização do cliente.

As imagens são otimizadas automaticamente (WebP, vários tamanhos, `loading="lazy"`, dimensões fixas para evitar CLS).

### Depoimentos

Adicione objetos em `src/data/testimonials.ts` (há um modelo comentado no arquivo). Com pelo menos um item, a seção aparece sozinha entre "Sobre" e "FAQ". **Use apenas depoimentos reais e autorizados.**

---

## Logo, ícone e identidade

- `public/logo.png`: logo original. Ele tem **fundo escuro sólido** (não é transparente), por isso o site **não** o usa diretamente.
- O ícone "D + gota" foi **recriado em SVG**:
  - `src/components/ui/LogoMark.astro`: versão inline usada no header, rodapé e elementos decorativos
  - `public/favicon.svg`: mesma arte, usada para gerar os favicons
- O wordmark "Droplab" é texto na fonte Sora ("Drop" na cor do título, "lab" em degradê azul), em `src/components/ui/Logo.astro`.

**Para trocar o logo:** edite o desenho em `public/favicon.svg` **e** em `LogoMark.astro` (o mesmo `path`) e rode `npm run assets` para regerar `favicon.ico`, `apple-touch-icon.png`, `icon-192/512.png`, `icon-maskable-512.png` e `og-image.png`. Se trocar o `logo.png`, rode `npm run assets` também, pois a imagem OG usa o logo.

### Cores e tipografia

Tokens em `src/styles/global.css`:

- Paleta fixa da marca no bloco `@theme` (`brand`, `cyan`, `navy`, `ink`…)
- Cores por tema (`--bg`, `--surface`, `--heading`, `--body`, `--muted`, `--eyebrow`…) em `:root` (escuro) e `[data-theme='light']` (claro)
- Utilitários da marca: `text-gradient`, `bg-brand-gradient`, `bg-button-gradient`, `glass`, `eyebrow`, `bg-grid`

Contraste WCAG AA verificado em ambos os temas. Duas adaptações em relação ao briefing:

- `#64748B` dá só 4,2:1 sobre o fundo escuro, então o texto secundário usa `#8291A7` (6,0:1).
- O degradê dos **botões** começa no azul `#0A6CFF`, porque o ciano não dá contraste com texto branco. O degradê completo da marca aparece em detalhes, bordas e na faixa de CTA (com uma camada escura por cima).

Fontes **Sora** (títulos) e **Inter** (corpo) auto-hospedadas via `@fontsource-variable`, com `font-display: swap` e preload.

### Modo claro e modo escuro

- Botão personalizado no header (a gota desliza entre sol e lua): `src/components/ui/ThemeToggle.astro`
- A escolha do visitante fica salva no navegador. O tema de quem visita pela primeira vez é definido em `site.defaultTheme` (`'dark'`, `'light'` ou `'system'`).
- Cada tema tem paleta e peso de títulos próprios (no claro, os títulos ficam mais encorpados) e **textos próprios**: o selo do Hero, o rótulo do botão e a frase do rodapé mudam com o tema (`site.themeCopy`). Para criar mais textos por tema, use `data-only="dark"` / `data-only="light"` em qualquer elemento.

---

## Formulário de contato

Campos: nome*, WhatsApp/telefone* (máscara BR), e-mail, tipo de projeto*, orçamento estimado, mensagem* e consentimento LGPD*. A validação é em tempo real e acessível (`aria-invalid`, `aria-describedby`, foco no primeiro erro). Tem honeypot anti-spam.

**Envio padrão:** abre o WhatsApp (`wa.me/5534991898546`) com todos os campos formatados. Os botões "Solicitar orçamento" dos planos já pré-selecionam o tipo de projeto.

### Ativar o envio também por e-mail

O código já está pronto em `src/scripts/form.ts` (`sendEmail`). Basta definir **uma** variável de ambiente e fazer um novo build:

**Opção A: Web3Forms (grátis, sem cadastro de formulário)**

1. Gere uma chave em <https://web3forms.com> com o e-mail que vai receber os contatos.
2. Defina `PUBLIC_WEB3FORMS_KEY=sua-chave`.

**Opção B: Formspree**

1. Crie um formulário em <https://formspree.io> e copie o ID (ex.: `xyzabcd` de `formspree.io/f/xyzabcd`).
2. Defina `PUBLIC_FORMSPREE_ID=xyzabcd`.

Localmente, copie `.env.example` para `.env`. Na Vercel/Netlify, cadastre a variável no painel (veja Deploy). O WhatsApp continua abrindo normalmente e o e-mail é enviado em paralelo.

> As chaves `PUBLIC_*` ficam visíveis no HTML. Isso é esperado nesses serviços: a chave do Web3Forms só permite _enviar_ para o seu e-mail.

---

## Analytics (desligado por padrão)

Defina as variáveis e faça um novo build:

```
PUBLIC_GA_ID=G-XXXXXXXXXX            # Google Analytics 4
PUBLIC_META_PIXEL_ID=123456789012345 # Meta Pixel
```

Com qualquer uma delas definida:

- aparece um **banner de cookies** (aceitar/recusar, LGPD), e os scripts **só carregam depois do "Aceitar"**
- o rodapé ganha o link "Preferências de cookies"
- a política de privacidade passa a citar as ferramentas automaticamente
- **eventos de conversão** são disparados:
  - clique em qualquer link do WhatsApp: GA4 `whatsapp_click` + `generate_lead` (method: whatsapp) | Pixel `Contact`
  - envio do formulário: GA4 `generate_lead` (method: form) | Pixel `Lead`

No GA4, marque `generate_lead` como **evento principal (conversão)**.

---

## SEO

- Title/description por página, canonical, `lang="pt-BR"`
- Open Graph + Twitter Card com `public/og-image.png` (1200×630)
- JSON-LD `ProfessionalService` + `WebSite` (no layout) e `FAQPage` (no FAQ)
- `sitemap-index.xml` (via `@astrojs/sitemap`) e `robots.txt` gerados no build com o domínio de `site.ts`
- Favicon SVG + ICO + apple-touch-icon + `manifest.webmanifest`
- Um único H1 por página, `alt` em todas as imagens

Cadastre o domínio no **Google Search Console** e envie o sitemap: **<https://www.droplabweb.com/sitemap-index.xml>**.

---

## Deploy

### Vercel (recomendado)

1. Suba o projeto para um repositório no GitHub.
2. Em <https://vercel.com/new>, importe o repositório. Não é preciso mudar nada nas configurações: o `vercel.json` já define instalação (`npm ci`), build (`npm run build`), saída (`dist`), URLs limpas e cache dos assets. A versão do Node vem de `engines` no `package.json` (`>=22.23.4`, mínimo exigido pelo Astro 7.4); a Vercel resolve esse intervalo para a maior versão suportada, hoje a **26.x** (padrão da Vercel e a mesma usada no desenvolvimento). Para fixar explicitamente, escolha **Node.js 26.x** em **Settings → Build and Deployment → Node.js Version** (a documentação da Vercel prevê só esses dois caminhos, `engines` ou painel, e não o `vercel.json`).
   - O site está publicado em **<https://www.droplabweb.com>** (o domínio sem www redireciona para o www). O endereço `*.vercel.app` continua existindo, mas canonical, sitemap e Open Graph apontam só para o domínio próprio.
3. (Opcional) Em **Settings → Environment Variables**, adicione `PUBLIC_WEB3FORMS_KEY`, `PUBLIC_GA_ID` etc. e faça **Redeploy**.
4. **Domínio próprio** (já feito para `droplabweb.com`): em **Settings → Domains**, adicione o domínio com e sem www. No painel do seu registrador (ex.: Registro.br), configure o DNS como a Vercel indicar:
   - domínio raiz (`droplabweb.com`): registro **A** → `76.76.21.21`
   - `www`: registro **CNAME** → `cname.vercel-dns.com`
   - O HTTPS é emitido automaticamente.
5. Confirme que `url` em `src/config/site.ts` é exatamente o domínio principal (com ou sem `www`, o mesmo que você escolher como principal na Vercel).

### Netlify

Importe o repositório em <https://app.netlify.com>. O `netlify.toml` já define build, pasta `dist`, Node 22 e headers. Domínio próprio: **Domain management → Add a domain**.

---

## Estrutura

```
src/
├─ config/site.ts           ← dados do negócio (comece por aqui)
├─ data/                    ← conteúdo das seções
├─ assets/portfolio/        ← imagens do portfólio (otimizadas no build)
├─ components/
│  ├─ ui/                   ← Button, Section, SectionHeading, Logo, LogoMark, Icon, ThemeToggle…
│  ├─ sections/             ← Hero, Services, Process, Deliverables, Portfolio, Plans, About, FAQ, Contact…
│  ├─ Header / Footer / WhatsAppFloat / CookieBanner
├─ layouts/BaseLayout.astro ← <head>, SEO, JSON-LD, tema, fontes
├─ pages/                   ← index, politica-de-privacidade, 404, robots.txt, manifest
├─ scripts/                 ← JS do cliente (tema, menu, scrollspy, reveal, formulário, analytics)
└─ styles/global.css        ← tokens de tema e utilitários da marca
scripts/generate-assets.mjs ← favicons e imagem OG
```

JavaScript no cliente: um único bundle pequeno, sem framework. O FAQ usa `<details>` nativo e funciona sem JS.

## Acessibilidade

Skip link "Pular para o conteúdo", foco visível, menu mobile com foco preso, ESC e `aria-expanded`, scrollspy com `aria-current`, formulário com erros anunciados, e `prefers-reduced-motion` respeitado (desliga animações e rolagem suave).
