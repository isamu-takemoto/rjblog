import type { APIRoute } from 'astro';
import sharp from 'sharp';

export const prerender = false;

export const GET: APIRoute = async () => {
  const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#e8f5e9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#c8e6c9;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <rect x="0" y="0" width="16" height="630" fill="#4caf50" />
  <text x="600" y="270" font-size="180" text-anchor="middle" dominant-baseline="middle">🐢</text>
  <text x="600" y="430" font-size="72" font-weight="bold" text-anchor="middle" fill="#1b5e20" font-family="sans-serif">rjblog</text>
  <text x="600" y="510" font-size="32" text-anchor="middle" fill="#388e3c" font-family="sans-serif">りょうじろうのブログ</text>
</svg>`;

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
};
