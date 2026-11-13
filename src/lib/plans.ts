import { getCollection, type CollectionEntry } from 'astro:content';
import { idIndex } from './ids';
import { mdInline } from './inline';

type PlanData = CollectionEntry<'plans'>['data'];
type RawItem = PlanData['gerald'][number];

export interface PlanLine {
  key: string; // the ref or the text: what a tick sends back
  id?: string;
  href?: string;
  html: string;
  done: boolean;
  blocked: boolean;
  broken: boolean;
  sub: { text: string; html: string; done: boolean }[];
}
export interface PlanSection {
  title?: string;
  lines: PlanLine[];
}
export const blocks = [
  { id: 'gerald', title: 'Gerald' },
  { id: 'agents', title: 'Agents' },
] as const;

// Ids in running text become links; text inside <code> and <a> stays as written.
function linkIds(html: string, index: Awaited<ReturnType<typeof idIndex>>): string {
  let skip = 0;
  return html
    .split(/(<[^>]+>)/)
    .map((part) => {
      if (part.startsWith('<')) {
        if (/^<(code|a)\b/.test(part)) skip++;
        else if (/^<\/(code|a)>/.test(part)) skip--;
        return part;
      }
      if (skip > 0) return part;
      return part.replace(/\b[A-Z]{1,2}-[A-Z]+-\d+\b|\bD\d+\b/g, (id) => {
        const ref = index.get(id);
        return ref ? `<a href="${ref.href}">${id}</a>` : id;
      });
    })
    .join('');
}

export async function planSections(items: RawItem[]): Promise<PlanSection[]> {
  const index = await idIndex();
  const tasks = new Map<string, { title: string; status: string }>();
  for (const e of await getCollection('tasks')) for (const t of e.data.items) tasks.set(t.id, t);
  const text = (s: string) => linkIds(mdInline(s), index);

  const sections: PlanSection[] = [{ lines: [] }];
  for (const item of items) {
    if (item.section !== undefined) {
      sections.push({ title: item.section, lines: [] });
      continue;
    }
    const sub = item.sub.map((s) => ({ text: s.text, html: text(s.text), done: Boolean(s.done) }));
    const lines = sections[sections.length - 1].lines;
    if (item.ref) {
      const task = tasks.get(item.ref);
      lines.push({
        key: item.ref,
        id: item.ref,
        href: index.get(item.ref)?.href,
        html: text([task?.title ?? 'unknown task', item.note].filter(Boolean).join(' · ')),
        done: task?.status === 'done',
        blocked: task?.status === 'blocked',
        broken: !task,
        sub,
      });
    } else {
      lines.push({ key: item.text!, html: text(item.text!), done: Boolean(item.done), blocked: false, broken: false, sub });
    }
  }
  return sections.filter((s) => s.title || s.lines.length > 0);
}

export const count = (sections: PlanSection[]) => {
  const lines = sections.flatMap((s) => s.lines);
  return { done: lines.filter((l) => l.done).length, total: lines.length };
};
