import { getCollection, getEntry } from 'astro:content';

export async function areaRules(area: string) {
  return (await getEntry('rules', area))?.data.items ?? [];
}
export async function areaJourneys(area: string) {
  return (await getEntry('journeys', area))?.data.items ?? [];
}
export async function areaEdgeCases(area: string) {
  return (await getEntry('edgeCases', area))?.data.items ?? [];
}
export async function areaChecks(area: string) {
  return (await getEntry('checks', area))?.data.groups ?? [];
}
export async function areaTasks(area: string) {
  return (await getEntry('tasks', area))?.data.items ?? [];
}
export async function areaDecisions(area: string) {
  return (await getEntry('decisions', area))?.data.items ?? [];
}

export function groupBy<T>(items: T[], key: (t: T) => string): [string, T[]][] {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    map.set(k, [...(map.get(k) ?? []), item]);
  }
  return [...map.entries()];
}

export async function allAreas(): Promise<string[]> {
  const kinds = ['rules', 'journeys', 'edgeCases', 'checks', 'tasks', 'decisions'] as const;
  const seen = new Set<string>();
  for (const kind of kinds) for (const e of await getCollection(kind)) seen.add(e.id);
  return [...seen].sort();
}
