import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';
import { areas } from './src/areas.mjs';

// `npm run check` builds while `npm run dev` keeps running. Sharing Vite's dependency cache let the
// build rewrite it under the dev server, and every diagram page then failed with
// "504 Outdated Optimize Dep" on mermaid.js.
const building = process.argv.includes('build');

export default defineConfig({
  devToolbar: { enabled: false },
  vite: {
    cacheDir: building ? 'node_modules/.vite-build' : 'node_modules/.vite',
    optimizeDeps: { include: ['mermaid'] },
  },
  redirects: { '/architecture/offline-first/': '/offline/how-it-works/' },
  integrations: [
    starlight({
      title: 'Money Koi Docs',
      logo: { src: './src/assets/logo.png' },
      favicon: '/favicon.png',
      customCss: ['./src/styles/custom.css'],
      pagination: false,
      sidebar: [
        {
          label: 'Start',
          items: [
            { label: 'Overview', link: '/' },
            { label: 'All features', link: '/features/' },
            { label: 'Roadmap', link: '/roadmap/' },
          ],
        },
        { label: 'Releases', items: [{ autogenerate: { directory: 'releases' } }] },
        { label: 'How it works', collapsed: true, items: [{ autogenerate: { directory: 'architecture' } }] },
        ...areas.map((a) => ({ label: a.name, collapsed: true, items: [{ autogenerate: { directory: a.id } }] })),
        { label: 'This site', items: [{ autogenerate: { directory: 'meta' } }] },
      ],
      components: { ThemeSelect: './src/components/ThemeSelect.astro' },
      // Applied before first paint so a remembered width or text size does not jump in after load.
      head: [
        {
          tag: 'script',
          content:
            "try{var r=document.documentElement,w=localStorage.getItem('mk-docs:width'),t=localStorage.getItem('mk-docs:text');" +
            "if(w&&r.hasAttribute('data-has-sidebar'))r.style.setProperty('--sl-content-width',w==='full'?'100vw':w+'rem');" +
            "if(t)r.style.setProperty('--mk-text-scale',String(t/16))}catch(e){}",
        },
      ],
      plugins: [starlightLinksValidator({ errorOnInvalidHashes: false })],
    }),
  ],
});
