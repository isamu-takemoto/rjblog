import type { APIRoute } from 'astro';
import sharp from 'sharp';

export const prerender = false;

let cachedTurtlePng: Buffer | null = null;

async function getTurtlePng(): Promise<Buffer> {
  if (cachedTurtlePng) return cachedTurtlePng;
  const svg = await fetch(
    'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f422.svg'
  ).then((r) => r.text());
  cachedTurtlePng = await sharp(Buffer.from(svg)).resize(280, 280).png().toBuffer();
  return cachedTurtlePng;
}

export const GET: APIRoute = async () => {
  const turtlePng = await getTurtlePng();

  const bgSvg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e8f5e9" />
      <stop offset="100%" stop-color="#c8e6c9" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <rect x="0" y="0" width="16" height="630" fill="#4caf50" />
  <text x="600" y="490" font-size="80" font-weight="bold" text-anchor="middle" fill="#1b5e20" font-family="sans-serif">rjblog</text>
  <text x="600" y="566" font-size="34" text-anchor="middle" fill="#388e3c" font-family="sans-serif">&#x308A;&#x3087;&#x3046;&#x3058;&#x308D;&#x3046;&#x306E;&#x30D6;&#x30ED;&#x30B0;</text>
</svg>`;

  const png = await sharp(Buffer.from(bgSvg))
    .composite([{ input: turtlePng, top: 90, left: 460 }])
    .png()
    .toBuffer();

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
};
