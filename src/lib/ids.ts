import { getCollection } from 'astro:content';

const pageOf = {
  rules: 'rules',
  journeys: 'journeys',
  edgeCases: 'edge-cases',
  checks: 'testing',
  tasks: 'open',
  decisions: 'open',
} as const;

export type IdKind = keyof typeof pageOf;

export interface IdRef {
  id: string;
  area: string;
  kind: IdKind;
  title: string;
  href: string;
}

export async function idIndex(): Promise<Map<string, IdRef>> {
  const index = new Map<string, IdRef>();
  const add = (kind: IdKind, area: string, id: string, title: string) => {
    if (!index.has(id)) index.set(id, { id, area, kind, title, href: `/${area}/${pageOf[kind]}/#${id}` });
  };
  for (const e of await getCollection('rules')) for (const i of e.data.items) add('rules', e.id, i.id, i.title);
  for (const e of await getCollection('journeys')) for (const i of e.data.items) add('journeys', e.id, i.id, i.title);
  for (const e of await getCollection('edgeCases')) for (const i of e.data.items) add('edgeCases', e.id, i.id, i.title);
  for (const e of await getCollection('checks'))
    for (const g of e.data.groups) for (const i of g.items) add('checks', e.id, i.id, i.text);
  for (const e of await getCollection('tasks')) for (const i of e.data.items) add('tasks', e.id, i.id, i.title);
  for (const e of await getCollection('decisions')) for (const i of e.data.items) add('decisions', e.id, i.id, i.question);
  return index;
}
