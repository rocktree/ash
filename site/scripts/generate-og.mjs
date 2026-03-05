import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630' viewBox='0 0 1200 630'>
  <!-- Background -->
  <rect width='1200' height='630' fill='#0b0b0f'/>

  <!-- Subtle grid pattern -->
  <defs>
    <pattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'>
      <path d='M 40 0 L 0 0 0 40' fill='none' stroke='#1e1e2a' stroke-width='1'/>
    </pattern>
  </defs>
  <rect width='1200' height='630' fill='url(#grid)' opacity='0.5'/>

  <!-- Accent glow behind logo -->
  <ellipse cx='600' cy='290' rx='200' ry='120' fill='#818cf8' opacity='0.06'/>

  <!-- Logo icon (scaled from 32x32, centered at 600, 230) -->
  <g transform='translate(562, 192) scale(2.375)'>
    <rect width='32' height='32' rx='8' fill='#131318'/>
    <rect x='4' y='4' width='24' height='24' rx='6' fill='#1a1a22'/>
    <path d='M9 23L12.5 11L16 19L19 14L23 23' stroke='#818cf8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/>
  </g>

  <!-- Wordmark: Ash -->
  <text x='600' y='338' font-family="ui-sans-serif, system-ui, -apple-system, sans-serif" font-size='72' font-weight='700' fill='#e2e2f0' text-anchor='middle' letter-spacing='-2'>Ash</text>

  <!-- Tagline -->
  <text x='600' y='390' font-family="ui-sans-serif, system-ui, -apple-system, sans-serif" font-size='22' font-weight='400' fill='#8080a0' text-anchor='middle' letter-spacing='0.2'>A keyboard-driven, markdown-aware text editor for React</text>

  <!-- Decorative accent line -->
  <line x1='480' y1='418' x2='720' y2='418' stroke='#2d2d3f' stroke-width='1'/>

  <!-- Bottom domain -->
  <text x='600' y='560' font-family="ui-monospace, Menlo, Consolas, monospace" font-size='16' font-weight='400' fill='#50506a' text-anchor='middle'>ash.rocktree.ai</text>
</svg>`;

const outputPath = join(__dirname, '../public/og.png');

await sharp(Buffer.from(svg))
  .png({ compressionLevel: 9 })
  .toFile(outputPath);

console.log(`OG image generated at ${outputPath}`);
