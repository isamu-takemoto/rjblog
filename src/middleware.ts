import { defineMiddleware } from 'astro:middleware';

// ローカル開発時のみ Basic 認証で保護（本番は Keystatic GitHub 認証に委譲）
const PROTECTED_PREFIXES = ['/keystatic', '/api/keystatic'];

export const onRequest = defineMiddleware((context, next) => {
  if (import.meta.env.PROD) {
    return next();
  }

  const url = new URL(context.request.url);
  const isProtected = PROTECTED_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));

  if (!isProtected) {
    return next();
  }

  const expectedUser = import.meta.env.CMS_USER ?? 'admin';
  const expectedPass = import.meta.env.CMS_PASSWORD;

  if (!expectedPass) {
    return new Response('CMS_PASSWORD environment variable is not set.', { status: 503 });
  }

  const authHeader = context.request.headers.get('Authorization');
  if (authHeader?.startsWith('Basic ')) {
    const decoded = atob(authHeader.slice(6));
    const [user, ...passParts] = decoded.split(':');
    const pass = passParts.join(':');
    if (user === expectedUser && pass === expectedPass) {
      return next();
    }
  }

  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Keystatic CMS"',
    },
  });
});
