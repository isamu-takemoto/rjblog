import type { APIRoute } from 'astro';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

interface Comment {
  id: string;
  name: string;
  body: string;
  createdAt: string;
}

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug!;
  const comments = await redis.lrange<Comment>(`comments:${slug}`, 0, -1);

  return new Response(JSON.stringify(comments), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ params, request }) => {
  const slug = params.slug!;
  const body = await request.json();

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

  await redis.lpush(`comments:${slug}`, comment);

  return new Response(JSON.stringify(comment), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
