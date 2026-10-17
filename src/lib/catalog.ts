import { getCollection } from 'astro:content';
import { codeFeatures, type CodeFeature, type Needs, type Tier } from './features';

export interface CatalogRow {
  id: string;
  name: string;
  area: string;
  tier: Tier;
  status: 'live' | 'planned';
  needs: Needs;
  note?: string;
  since?: string;
  web?: 'parity' | 'partial' | 'missing' | 'app-only' | 'web-only';
  webNote?: string;
  docs?: string;
  code?: CodeFeature;
}

export const areas: Record<string, string> = {
  money: 'Money',
  viewing: 'Viewing',
  scanner: 'Receipt scanner',
  data: 'Data in & out',
  sync: 'Sync & sharing',
  web: 'Web',
  app: 'App & privacy',
};

export const tierNames: Record<Tier, string> = { free: 'Free', pro: 'Pro', cloud: 'Cloud' };
export const tierRank: Record<Tier, number> = { free: 0, pro: 1, cloud: 2 };

export async function resolvedCatalog(): Promise<CatalogRow[]> {
  const code = new Map((codeFeatures() ?? []).map((f) => [f.id, f]));
  const rows: CatalogRow[] = (await getCollection('catalog')).map(({ id, data }) => {
    const f = data.feature ? code.get(data.feature) : undefined;
    return {
      id,
      name: data.name,
      area: data.area,
      tier: f?.tier ?? data.tier ?? 'free',
      status: f ? (f.isLive ? 'live' : 'planned') : (data.status ?? 'live'),
      needs: f?.needs ?? 'nothing',
      note: data.note,
      since: data.since,
      web: data.web,
      webNote: data.webNote,
      docs: data.docs,
      code: f,
    };
  });
  return rows.sort((a, b) => a.name.localeCompare(b.name));
}
