/**
 * Gera os assets de marca a partir de public/favicon.svg e public/logo.png:
 *  - favicon.ico (16/32/48), apple-touch-icon.png, icon-192.png, icon-512.png, icon-maskable-512.png
 *  - og-image.png (1200×630)
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
const BG = '#05070D';

const iconSvg = await readFile(pub('favicon.svg'));

/** Renderiza o ícone num quadrado, com padding e fundo opcionais. */
async function renderIcon(size, { padding = 0, background = null } = {}) {
  const inner = Math.round(size * (1 - padding * 2));
  const icon = await sharp(iconSvg, { density: 600 }).resize(inner, inner).png().toBuffer();
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
await writeFile(
  pub('apple-touch-icon.png'),
  await renderIcon(180, { padding: 0.14, background: BG }),
);
await writeFile(pub('icon-192.png'), await renderIcon(192, { padding: 0.08 }));
await writeFile(pub('icon-512.png'), await renderIcon(512, { padding: 0.08 }));
await writeFile(
  pub('icon-maskable-512.png'),
  await renderIcon(512, { padding: 0.2, background: BG }),
);
console.log('✓ favicons');

// ---------- Open Graph 1200×630 ----------
const ogBg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <radialGradient id="a" cx="15%" cy="0%" r="70%"><stop offset="0" stop-color="#0A6CFF" stop-opacity=".45"/><stop offset="1" stop-color="#0A6CFF" stop-opacity="0"/></radialGradient>
    <radialGradient id="b" cx="95%" cy="100%" r="60%"><stop offset="0" stop-color="#22D3EE" stop-opacity=".28"/><stop offset="1" stop-color="#22D3EE" stop-opacity="0"/></radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#fff" stroke-opacity=".05"/></pattern>
    <linearGradient id="line" x1="0" x2="1"><stop offset="0" stop-color="#22D3EE"/><stop offset=".55" stop-color="#0A6CFF"/><stop offset="1" stop-color="#0B1E4A"/></linearGradient>
  </defs>
  <rect width="1200" height="630" fill="${BG}"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#a)"/>
  <rect width="1200" height="630" fill="url(#b)"/>
  <rect y="622" width="1200" height="8" fill="url(#line)"/>
  <text x="600" y="505" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="40" font-weight="600" fill="#F8FAFC">Sites e landing pages que transformam visitantes em clientes</text>
</svg>`);
const logo = await sharp(await transparentLogo())
  .trim()
  .resize({ width: 940 })
  .toBuffer();
await sharp(ogBg)
  .composite([{ input: logo, top: 120, left: 130 }])
  .png({ compressionLevel: 9 })
  .toFile(pub('og-image.png'));
await writeFile(pub('logo-transparent.png'), await transparentLogo());
console.log('✓ og-image.png');
