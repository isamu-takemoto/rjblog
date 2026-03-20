import type { APIRoute } from 'astro';
import { getRedis } from '../../../lib/redis';

interface Comment {
  id: string;
  name: string;
  body: string;
  createdAt: string;
}

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug!;
  const redis = getRedis();
  const raw = await redis.lrange(`comments:${slug}`, 0, -1);
  const comments: Comment[] = raw.map((s) => JSON.parse(s));

  return new Response(JSON.stringify(comments), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ params, request }) => {
  const slug = params.slug!;
  const body = await request.json();
  const redis = getRedis();

  const name = (body.name ?? '').toString().trim().slice(0, 50) || '匿名';
  const text = (body.body ?? '').toString().trim().slice(0, 500);

  if (!text) {
    return new Response(JSON.stringify({ error: 'コメントが空です' }), { status: 400 });
  }

  const comment: Comment = {
    id: crypto.randomUUID(),
    name,
    body: text,
    createdAt: new Date().toISOString(),
  };

  await redis.lpush(`comments:${slug}`, JSON.stringify(comment));

  return new Response(JSON.stringify(comment), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
