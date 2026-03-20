import type { APIRoute } from 'astro';
import { getRedis } from '../../../lib/redis';

function getIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
}

export const GET: APIRoute = async ({ params, request }) => {
  const slug = params.slug!;
  const ip = getIp(request);
  const redis = getRedis();

  const [count, hasLiked] = await Promise.all([
    redis.scard(`likes:${slug}`),
    redis.sismember(`likes:${slug}`, ip),
  ]);

  return new Response(JSON.stringify({ count, hasLiked: hasLiked === 1 }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ params, request }) => {
  const slug = params.slug!;
  const ip = getIp(request);
  const redis = getRedis();

  const hasLiked = await redis.sismember(`likes:${slug}`, ip);
  if (hasLiked) {
    await redis.srem(`likes:${slug}`, ip);
  } else {
    await redis.sadd(`likes:${slug}`, ip);
  }

  const count = await redis.scard(`likes:${slug}`);
  return new Response(JSON.stringify({ count, hasLiked: !hasLiked }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
