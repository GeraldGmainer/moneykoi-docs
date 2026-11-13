import { defineRouteMiddleware } from '@astrojs/starlight/route-data';

// Sidebar › Releases: newest first. Autogenerate sorts by title, which puts 1.17.0 on top.
const version = (href: string) => (href.match(/(\d+)-(\d+)-(\d+)\/?$/) ?? []).slice(1).map(Number);

export const onRequest = defineRouteMiddleware((context) => {
  const group = context.locals.starlightRoute.sidebar.find((e) => e.type === 'group' && e.label === 'Releases');
  if (group?.type !== 'group') return;
  group.entries.sort((a, b) => {
    const [x, y] = [version(a.type === 'link' ? a.href : ''), version(b.type === 'link' ? b.href : '')];
    return (y[0] ?? -1) - (x[0] ?? -1) || (y[1] ?? 0) - (x[1] ?? 0) || (y[2] ?? 0) - (x[2] ?? 0);
  });
});
