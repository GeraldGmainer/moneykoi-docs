import { readRepoFile } from './repos';

export type Tier = 'free' | 'pro' | 'cloud';
export type Needs = 'nothing' | 'account' | 'sync';

export interface CodeFeature {
  id: string;
  order: number;
  tier: Tier;
  needs: Needs;
  isLive: boolean;
  name: string;
  body?: string;
  points: string[];
}

export const FEATURE_DART = 'lib/features/monetization/domain/feature.dart';
const EN_JSON = 'assets/translations/en.json';

export function codeFeatures(): CodeFeature[] | null {
  const dart = readRepoFile('app', FEATURE_DART);
  if (!dart) return null;
  const en = JSON.parse(readRepoFile('app', EN_JSON) ?? '{}');
  const names = en?.paywall?.feature ?? {};
  const details = en?.paywall?.detail ?? {};

  const body = dart.slice(dart.indexOf('enum Feature {'), dart.indexOf(';', dart.indexOf('enum Feature {')));
  const features: CodeFeature[] = [];
  for (const match of body.matchAll(/^\s*(\w+)\(([^)]*)\)/gm)) {
    const [, id, args] = match;
    const d = details[id] ?? {};
    features.push({
      id,
      order: features.length + 1,
      tier: (args.match(/Tier\.(\w+)/)?.[1] ?? 'free') as Tier,
      needs: (args.match(/needs:\s*Needs\.(\w+)/)?.[1] ?? 'nothing') as Needs,
      isLive: args.match(/isLive:\s*(true|false)/)?.[1] !== 'false',
      name: names[id] ?? id,
      body: d.body,
      points: [d.point1, d.point2, d.point3].filter(Boolean),
    });
  }
  return features;
}
