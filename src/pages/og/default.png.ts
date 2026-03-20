import type { APIRoute } from 'astro';
import { createElement } from 'react';
import satori from 'satori';
import sharp from 'sharp';

export const prerender = false;

let cachedFont: ArrayBuffer | null = null;

async function getFont(): Promise<ArrayBuffer> {
  if (cachedFont) return cachedFont;
  const css = await fetch(
    'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=rjblog%E3%82%8A%E3%82%87%E3%81%86%E3%81%98%E3%82%8D%E3%81%86%E3%81%AE%E3%83%96%E3%83%AD%E3%82%B0',
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    }
  ).then((r) => r.text());
  const fontUrl = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
  if (!fontUrl) throw new Error('Font URL not found');
  cachedFont = await fetch(fontUrl).then((r) => r.arrayBuffer());
  return cachedFont;
}

async function loadEmoji(segment: string): Promise<string> {
  const codePoint = [...segment]
    .map((c) => c.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join('-');
  const url = `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${codePoint}.svg`;
  const svg = await fetch(url).then((r) => r.text());
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

export const GET: APIRoute = async () => {
  const fontData = await getFont();

  const svg = await satori(
    createElement(
      'div',
      {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
          borderLeft: '16px solid #4caf50',
          fontFamily: '"Noto Sans JP"',
          gap: '16px',
        },
      },
      createElement('div', { style: { fontSize: 200, lineHeight: 1 } }, '🐢'),
      createElement(
        'div',
        {
          style: {
            fontSize: 80,
            fontWeight: 700,
            color: '#1b5e20',
            marginTop: '8px',
          },
        },
        'rjblog'
      ),
      createElement(
        'div',
        {
          style: {
            fontSize: 32,
            color: '#388e3c',
          },
        },
        'りょうじろうのブログ'
      )
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Noto Sans JP',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
      loadAdditionalAsset: async (code: string, segment: string) => {
        if (code === 'emoji') {
          return loadEmoji(segment);
        }
        return '';
      },
    }
  );

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
};
