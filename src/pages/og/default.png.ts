import type { APIRoute } from 'astro';
import sharp from 'sharp';

export const prerender = false;

let cachedTurtle: string | null = null;

async function getTurtleSvg(): Promise<string> {
  if (cachedTurtle) return cachedTurtle;
  const res = await fetch(
    'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f422.svg'
  );
  cachedTurtle = await res.text();
  return cachedTurtle;
}

export const GET: APIRoute = async () => {
  const turtleSvg = await getTurtleSvg();
  const turtleDataUri = `data:image/svg+xml;base64,${Buffer.from(turtleSvg).toString('base64')}`;

  const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e8f5e9" />
      <stop offset="100%" stop-color="#c8e6c9" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <rect x="0" y="0" width="16" height="630" fill="#4caf50" />
  <image href="${turtleDataUri}" x="450" y="80" width="300" height="300" />
  <text x="600" y="460" font-size="80" font-weight="bold" text-anchor="middle" fill="#1b5e20" font-family="sans-serif">rjblog</text>
  <text x="600" y="540" font-size="34" text-anchor="middle" fill="#388e3c" font-family="sans-serif">&#x308A;&#x3087;&#x3046;&#x3058;&#x308D;&#x3046;&#x306E;&#x30D6;&#x30ED;&#x30B0;</text>
</svg>`;

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
};
