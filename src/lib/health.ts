import { getCollection } from 'astro:content';
import { codeFeatures, FEATURE_DART } from './features';
import { resolvedCatalog } from './catalog';
import { idIndex, type IdKind } from './ids';
import { checkTest, testStatusLabel, type TestRef } from './tests';
import { areas } from '../areas.mjs';
import { diagramSources } from './diagrams';
import { readRepoFile, hasRepo } from './repos';

export interface Problem {
  kind: 'repo' | 'catalog' | 'test' | 'link' | 'duplicate' | 'diagram' | 'plan';
  where: string;
  message: string;
}

export interface Health {
  problems: Problem[];
  tests: { total: number; ok: number };
}

const page: Record<string, string> = {
  rules: 'rules',
  journeys: 'journeys',
  edgeCases: 'edge-cases',
};

export async function health(): Promise<Health> {
  const problems: Problem[] = [];
  const code = codeFeatures();
  const catalog = await getCollection('catalog');

  if (!code) {
    problems.push({ kind: 'repo', where: 'moneykoi-app', message: 'not found next to moneykoi-docs, so tiers and tests cannot be checked' });
  } else {
    const known = new Set(code.map((f) => f.id));
    const linked = new Set<string>();
    for (const { id, data } of catalog) {
      const where = `catalog.yaml → ${id}`;
      if (data.feature) {
        linked.add(data.feature);
        if (!known.has(data.feature)) problems.push({ kind: 'catalog', where, message: `\`${data.feature}\` is not in ${FEATURE_DART}` });
        if (data.tier || data.status) problems.push({ kind: 'catalog', where, message: 'tier and status come from feature.dart; delete them from the row' });
      } else if (!data.tier) {
        problems.push({ kind: 'catalog', where, message: 'needs `feature:` (read from code) or `tier:`' });
      }
      if (data.docs && !areas.some((a) => a.id === data.docs)) {
        problems.push({ kind: 'catalog', where, message: `docs: ${data.docs} is not an area in src/areas.mjs` });
      }
    }
    for (const f of code) {
      if (!linked.has(f.id)) problems.push({ kind: 'catalog', where: `feature.dart → ${f.id}`, message: 'has no row in src/data/catalog.yaml' });
    }
  }

  const seen = new Map<string, string>();
  const note = (id: string, where: string) => {
    const before = seen.get(id);
    if (before) problems.push({ kind: 'duplicate', where, message: `id ${id} is also used in ${before}` });
    else seen.set(id, where);
  };

  const index = await idIndex();
  const expect = (where: string, ids: string[], label: string, kinds?: IdKind[]) => {
    for (const id of ids) {
      const ref = index.get(id);
      if (!ref) problems.push({ kind: 'link', where, message: `${label} ${id}, which does not exist` });
      else if (kinds && !kinds.includes(ref.kind)) problems.push({ kind: 'link', where, message: `${label} ${id}, which is a ${ref.kind} entry` });
    }
  };

  const refs: { where: string; ref: TestRef }[] = [];
  for (const kind of ['rules', 'journeys', 'edgeCases'] as const) {
    for (const entry of await getCollection(kind)) {
      for (const item of entry.data.items) {
        const where = `${entry.id}/${page[kind]} → ${item.id}`;
        note(item.id, where);
        for (const ref of item.tests) refs.push({ where, ref });
        expect(where, item.related, 'see also');
        if ('checks' in item) expect(where, item.checks, 'test by hand', ['checks']);
      }
    }
  }

  for (const entry of await getCollection('checks')) {
    for (const group of entry.data.groups) {
      for (const item of group.items) note(item.id, `${entry.id}/checks → ${group.id}`);
    }
  }
  for (const entry of await getCollection('tasks')) {
    for (const t of entry.data.items) {
      const where = `${entry.id}/tasks → ${t.id}`;
      note(t.id, where);
      expect(where, t.waitsFor, 'waits for', ['tasks', 'decisions']);
    }
  }
  for (const entry of await getCollection('decisions')) {
    for (const d of entry.data.items) {
      const where = `${entry.id}/decisions → ${d.id}`;
      note(d.id, where);
      expect(where, d.related, 'see also');
    }
  }

  const scheduled = new Set<string>();
  for (const bucket of await getCollection('roadmap')) {
    for (const item of bucket.data.items) {
      scheduled.add(item.ref);
      const known = catalog.some((c) => c.id === item.ref) || index.has(item.ref);
      if (!known) problems.push({ kind: 'link', where: `roadmap.yaml → ${bucket.id}`, message: `${item.ref} is neither a catalog row nor a docs id` });
    }
  }
  if (code) {
    const resolved = await resolvedCatalog();
    for (const row of resolved) {
      if (row.status === 'planned' && !scheduled.has(row.id)) {
        problems.push({ kind: 'catalog', where: `catalog.yaml → ${row.id}`, message: 'planned, but in no bucket of src/data/roadmap.yaml' });
      }
    }
  }

  const areaIds = new Set(areas.map((a) => a.id));
  for (const release of await getCollection('releases')) {
    for (const item of release.data.items) {
      const where = `releases/${release.id} → item ${item.n}`;
      if (!areaIds.has(item.area)) problems.push({ kind: 'link', where, message: `area ${item.area} is not in src/areas.mjs` });
      expect(where, item.checks, 'check', ['checks']);
      expect(where, item.related, 'see also');
    }
  }

  const pages = new Set((await getCollection('docs')).map((d) => d.id));
  for (const plan of await getCollection('plans')) {
    const where = `plans/${plan.id}`;
    if (!pages.has(`plans/${plan.id}`)) problems.push({ kind: 'plan', where, message: `has no page src/content/docs/plans/${plan.id}.mdx` });
    for (const block of ['gerald', 'agents'] as const) {
      const keys = new Set<string>();
      for (const item of plan.data[block]) {
        const key = item.ref ?? item.text;
        if (key === undefined) continue;
        // A tick finds its item by ref or text, so each is unique within a block.
        if (keys.has(key)) problems.push({ kind: 'plan', where: `${where} → ${block}`, message: `"${key}" is listed twice` });
        keys.add(key);
        if (item.ref) expect(`${where} → ${block}`, [item.ref], 'ref', ['tasks']);
        if (new Set(item.sub.map((s) => s.text)).size < item.sub.length) problems.push({ kind: 'plan', where: `${where} → ${key}`, message: 'two sub-items share one text' });
      }
    }
  }

  const sources = diagramSources();
  const registered = new Set<string>();
  for (const d of await getCollection('diagrams')) {
    const where = `diagrams.yaml → ${d.id}`;
    registered.add(d.id);
    if (!sources.has(d.id)) problems.push({ kind: 'diagram', where, message: `src/diagrams/${d.id}.mmd does not exist` });
    for (const a of d.data.areas) if (!areaIds.has(a)) problems.push({ kind: 'diagram', where, message: `area ${a} is not in src/areas.mjs` });
    for (const s of d.data.sources) {
      if (hasRepo(s.repo) && readRepoFile(s.repo, s.file) === null) problems.push({ kind: 'diagram', where, message: `source ${s.repo}:${s.file} does not exist` });
    }
  }
  for (const id of sources.keys()) {
    if (!registered.has(id)) problems.push({ kind: 'diagram', where: `src/diagrams/${id}.mmd`, message: 'has no entry in src/data/diagrams.yaml' });
  }

  let ok = 0;
  for (const { where, ref } of refs) {
    const checked = checkTest(ref);
    if (checked.status === 'ok') ok++;
    else if (checked.status !== 'no-repo') {
      problems.push({ kind: 'test', where, message: `${ref.file}${ref.name ? ` “${ref.name}”` : ''}: ${testStatusLabel[checked.status]}` });
    }
  }

  return { problems, tests: { total: refs.length, ok } };
}
