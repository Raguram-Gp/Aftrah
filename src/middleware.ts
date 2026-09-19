import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
  const path = context.url.pathname.replace(/\/+$/, '') || '/';
  if (path !== '/afrah-app' && path.startsWith('/afrah-app/')) {
    return next('/afrah-app');
  }
  return next();
});
