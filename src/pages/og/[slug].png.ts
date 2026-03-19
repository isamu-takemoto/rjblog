import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { createElement } from 'react';
import satori from 'satori';
import sharp from 'sharp';

export const prerender = false;

let cachedFont: ArrayBuffer | null = null;

async function getFont(text: string): Promise<ArrayBuffer> {
  if (cachedFont) return cachedFont;

  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent(text)}`,
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

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug) return new Response('Not found', { status: 404 });

  const posts = await getCollection('blog');
  const post = posts.find((p) => p.id === slug);
  const title = post?.data.title ?? 'takeisa.dev';

  const fontData = await getFont(title + 'takeisa.dev');

  const svg = await satori(
    createElement(
      'div',
      {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px 80px',
          background: '#ffffff',
          borderLeft: '12px solid #ff6b2b',
          fontFamily: '"Noto Sans JP"',
        },
      },
      createElement(
        'div',
        {
          style: {
            fontSize: title.length > 28 ? 44 : 58,
            fontWeight: 700,
            color: '#1a1a1a',
            lineHeight: 1.4,
            marginBottom: '40px',
          },
        },
        title
      ),
      createElement(
        'div',
        {
          style: {
            fontSize: 28,
            color: '#ff6b2b',
            fontWeight: 700,
          },
        },
        'takeisa.dev'
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
    }
  );

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=604800, s-maxage=604800',
    },
  });
};
