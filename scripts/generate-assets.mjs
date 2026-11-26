/**
 * Gera os assets de marca a partir de public/favicon.svg e public/logo.png:
 *  - favicon.ico (16/32/48), favicon-48x48.png, favicon-96x96.png, favicon-192x192.png
 *    (o Google pede ícones quadrados em múltiplos de 48 px), apple-touch-icon.png (180,
 *    quadrado cheio: o iOS arredonda sozinho) e icon-512.png (logo dos dados estruturados)
 *
 * Uso:  npm run assets
 * Rode novamente sempre que trocar o logo ou o ícone.
 */
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = (f) => path.join(root, 'public', f);

const iconSvg = await readFile(pub('favicon.svg'));
// Versão de cantos retos para o iOS (ele aplica a própria máscara arredondada)
const squareSvg = Buffer.from(iconSvg.toString().replace(/ rx="\d+"/, ''));

/** Renderiza o ícone num quadrado, com padding e fundo opcionais. */
async function renderIcon(size, { padding = 0, background = null, svg = iconSvg } = {}) {
  const inner = Math.round(size * (1 - padding * 2));
  const icon = await sharp(svg, { density: 600 }).resize(inner, inner).png().toBuffer();
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: icon, gravity: 'center' }])
    .png()
    .toBuffer();
}

/** Monta um .ico com PNGs embutidos (formato suportado por todos os navegadores modernos). */
function buildIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const entries = [];
  let offset = 6 + 16 * pngs.length;
  for (const { size, data } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

/** Remove o fundo escuro sólido do logo.png (des-multiplica pela cor de fundo). */
async function transparentLogo() {
  const { data, info } = await sharp(pub('logo.png'))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const bg = [5, 7, 13];
  for (let i = 0; i < data.length; i += 4) {
    let a = 0;
    for (let c = 0; c < 3; c++) a = Math.max(a, Math.abs(data[i + c] - bg[c]) / (255 - bg[c]));
    if (a < 0.02) {
      data[i + 3] = 0;
      continue;
    }
    for (let c = 0; c < 3; c++) {
      data[i + c] = Math.min(255, Math.max(0, Math.round((data[i + c] - bg[c] * (1 - a)) / a)));
    }
    data[i + 3] = Math.round(a * 255);
  }
  return sharp(data, { raw: info }).png().toBuffer();
}

// ---------- Favicons ----------
const icoPngs = [];
for (const size of [16, 32, 48]) icoPngs.push({ size, data: await renderIcon(size) });
await writeFile(pub('favicon.ico'), buildIco(icoPngs));
for (const size of [48, 96, 192])
  await writeFile(pub(`favicon-${size}x${size}.png`), await renderIcon(size));
await writeFile(pub('apple-touch-icon.png'), await renderIcon(180, { svg: squareSvg }));
await writeFile(pub('icon-512.png'), await renderIcon(512));
console.log('✓ favicons');

// ---------- Logo com fundo transparente ----------
// A imagem de compartilhamento (public/og-image.png, 1200×630) não é mais gerada aqui:
// ela é uma captura da logo do rodapé do site, com a mesma tipografia, e fica fixa.
await writeFile(pub('logo-transparent.png'), await transparentLogo());
console.log('✓ logo-transparent.png');
