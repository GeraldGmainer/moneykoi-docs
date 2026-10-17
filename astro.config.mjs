import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';
import { areas } from './src/areas.mjs';

export default defineConfig({
  devToolbar: { enabled: false },
  integrations: [
    starlight({
      title: 'MoneyKoi Docs',
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
          ],
        },
        { label: 'Releases', items: [{ autogenerate: { directory: 'releases' } }] },
        ...areas.map((a) => ({ label: a.name, collapsed: true, items: [{ autogenerate: { directory: a.id } }] })),
        { label: 'This site', items: [{ autogenerate: { directory: 'meta' } }] },
      ],
      plugins: [starlightLinksValidator({ errorOnInvalidHashes: false })],
    }),
  ],
});
