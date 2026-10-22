import { getCollection, type CollectionEntry } from 'astro:content';

const files = import.meta.glob<string>('../diagrams/*.mmd', { query: '?raw', import: 'default', eager: true });

export function diagramSources(): Map<string, string> {
  return new Map(Object.entries(files).map(([path, source]) => [path.split('/').pop()!.replace(/\.mmd$/, ''), source]));
}

export type DiagramEntry = CollectionEntry<'diagrams'>;

export async function diagramsFor(filter: (d: DiagramEntry) => boolean): Promise<DiagramEntry[]> {
  return (await getCollection('diagrams')).filter(filter);
}
