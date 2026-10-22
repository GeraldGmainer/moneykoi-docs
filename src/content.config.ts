import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

const tier = z.enum(['free', 'pro', 'cloud']);
const repo = z.enum(['app', 'web', 'supabase', 'admin']);

// `name` is a substring of the test's description, so a rename shows up on /meta/health/.
const testRef = z.object({
  file: z.string(),
  name: z.string().optional(),
  repo: repo.default('app'),
});

const tests = z.array(testRef).default([]);
const ids = z.array(z.string()).default([]);

// YAML reads a bare 2026-10-16 as a Date.
const day = z
  .union([z.string(), z.date()])
  .transform((d) => (typeof d === 'string' ? d : d.toISOString().slice(0, 10)));

// One YAML file per area and kind: src/data/<area>/<kind>.yaml, entry id = <area>.
const perArea = (kind: string) =>
  glob({
    base: './src/data',
    pattern: `*/${kind}.yaml`,
    generateId: ({ entry }) => entry.split('/')[0],
  });

const catalog = defineCollection({
  loader: file('src/data/catalog.yaml'),
  schema: z.object({
    name: z.string(),
    area: z.enum(['money', 'viewing', 'scanner', 'data', 'sync', 'web', 'app']),
    feature: z.string().optional(),
    tier: tier.optional(),
    status: z.enum(['live', 'planned']).optional(),
    note: z.string().optional(),
    since: z.string().optional(),
    web: z.enum(['parity', 'partial', 'missing', 'app-only', 'web-only']).optional(),
    webNote: z.string().optional(),
    docs: z.string().optional(),
  }),
});

const rules = defineCollection({
  loader: perArea('rules'),
  schema: z.object({
    items: z.array(
      z.object({
        id: z.string(),
        group: z.string(),
        title: z.string(),
        text: z.string(),
        source: z.string().optional(),
        tests,
        related: ids,
      }),
    ),
  }),
});

const journeys = defineCollection({
  loader: perArea('journeys'),
  schema: z.object({
    items: z.array(
      z.object({
        id: z.string(),
        group: z.string(),
        title: z.string(),
        from: z.string(),
        steps: z.array(z.string()).min(1),
        result: z.string(),
        status: z.enum(['built', 'waiting', 'by-design']).default('built'),
        note: z.string().optional(),
        tests,
        checks: ids,
        related: ids,
      }),
    ),
  }),
});

const edgeCases = defineCollection({
  loader: perArea('edge-cases'),
  schema: z.object({
    items: z.array(
      z.object({
        id: z.string(),
        group: z.string(),
        title: z.string(),
        when: z.string(),
        then: z.string(),
        status: z.enum(['handled', 'fixed', 'known-issue', 'by-design']).default('handled'),
        risk: z.enum(['high', 'medium', 'low']).default('medium'),
        tests,
        related: ids,
      }),
    ),
  }),
});

const checks = defineCollection({
  loader: perArea('checks'),
  schema: z.object({
    groups: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        setup: z.string().optional(),
        items: z.array(z.object({ id: z.string(), text: z.string() })).min(1),
      }),
    ),
  }),
});

const tasks = defineCollection({
  loader: perArea('tasks'),
  schema: z.object({
    items: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        owner: z.enum(['gerald', 'ai']),
        status: z.enum(['open', 'blocked', 'done']).default('open'),
        waitsFor: ids,
        detail: z.string(),
        command: z.string().optional(),
        prompt: z.string().optional(),
      }),
    ),
  }),
});

const decisions = defineCollection({
  loader: perArea('decisions'),
  schema: z.object({
    items: z.array(
      z.object({
        id: z.string(),
        question: z.string(),
        status: z.enum(['open', 'decided', 'dropped']),
        answer: z.string(),
        date: day.optional(),
        related: ids,
      }),
    ),
  }),
});

const releases = defineCollection({
  loader: glob({
    base: './src/data/releases',
    pattern: '*.yaml',
    generateId: ({ entry }) => entry.replace(/\.yaml$/, ''),
  }),
  schema: z.object({
    version: z.string(),
    status: z.enum(['testing', 'released']),
    source: z.string(),
    items: z.array(
      z.object({
        n: z.number(),
        title: z.string(),
        area: z.string(),
        what: z.string(),
        checks: ids,
        related: ids,
        screens: z.array(z.string()).default([]),
        notes: z
          .array(
            z.object({
              text: z.string(),
              status: z.enum(['open', 'fixed', 'changed', 'decided']),
              now: z.string().optional(),
            }),
          )
          .default([]),
      }),
    ),
  }),
});

// Order = file order. Every `ref` is a catalog row id or a docs id (R-, T-, D-…), so it links.
const roadmap = defineCollection({
  loader: file('src/data/roadmap.yaml'),
  schema: z.object({
    title: z.string(),
    date: day.optional(),
    goal: z.string(),
    items: z
      .array(
        z.object({
          ref: z.string(),
          size: z.string().optional(),
          why: z.string(),
        }),
      )
      .min(1),
  }),
});

// Diagram sources are src/diagrams/<id>.mmd; this registry says what each one draws and from where.
const diagrams = defineCollection({
  loader: file('src/data/diagrams.yaml'),
  schema: z.object({
    title: z.string(),
    page: z.string(),
    areas: z.array(z.string()).default([]),
    caption: z.string(),
    sources: z.array(z.object({ repo, file: z.string() })).min(1),
    checked: day,
  }),
});

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  catalog,
  rules,
  journeys,
  edgeCases,
  checks,
  tasks,
  decisions,
  releases,
  diagrams,
  roadmap,
};
