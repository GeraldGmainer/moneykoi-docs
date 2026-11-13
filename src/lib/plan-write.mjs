// Ticking a box on a /plans/ page writes the YAML, so the browser and the agents share one state.
// Dev server only (`npm run dev`): the built site is static and cannot save.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { parse, parseDocument } from 'yaml';

const DATA = fileURLToPath(new URL('../data/', import.meta.url));
const today = () => new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD, local time

// A task's state lives in src/data/<area>/tasks.yaml. Edited by line, never re-serialized: those files
// carry long `|` blocks and comments that a YAML round trip would reflow.
export function setTaskStatus(id, done) {
  if (!/^[A-Za-z0-9-]+$/.test(id)) throw new Error(`bad task id ${id}`);
  for (const area of readdirSync(DATA, { withFileTypes: true })) {
    const file = join(DATA, area.name, 'tasks.yaml');
    if (!area.isDirectory() || !existsSync(file)) continue;
    const lines = readFileSync(file, 'utf8').split('\n');
    const start = lines.findIndex((l) => new RegExp(`^  - id: ${id}\\s*$`).test(l));
    if (start < 0) continue;
    let end = lines.findIndex((l, i) => i > start && /^  - /.test(l));
    if (end < 0) end = lines.length;
    const at = (re) => {
      const i = lines.slice(start, end).findIndex((l) => re.test(l));
      return i < 0 ? -1 : start + i;
    };
    const status = at(/^    status:/);
    if (done) {
      if (status >= 0) lines[status] = '    status: done';
      else lines.splice((at(/^    owner:/) >= 0 ? at(/^    owner:/) : start) + 1, 0, '    status: done');
    } else if (status >= 0) {
      lines.splice(status, 1); // no status line = open
    }
    const text = lines.join('\n');
    const after = parse(text).items.find((t) => t.id === id)?.status ?? 'open';
    if (after !== (done ? 'done' : 'open')) throw new Error(`could not set ${id} in ${area.name}/tasks.yaml`);
    writeFileSync(file, text);
    return;
  }
  throw new Error(`task ${id} not found`);
}

// key = the item's `ref` or `text`; sub = the text of one of its sub-items.
export function setPlanItem({ plan, block, key, sub, done }) {
  if (!/^[a-z0-9-]+$/.test(plan ?? '')) throw new Error('bad plan id');
  if (block !== 'gerald' && block !== 'agents') throw new Error('bad block');
  const file = join(DATA, 'plans', `${plan}.yaml`);
  if (!existsSync(file)) throw new Error(`plan ${plan} not found`);
  const doc = parseDocument(readFileSync(file, 'utf8'));
  const item = doc.get(block)?.items.find((i) => i.get('ref') === key || i.get('text') === key);
  if (!item) throw new Error(`item not found: ${key}`);
  const target = sub === undefined ? item : item.get('sub')?.items.find((s) => s.get('text') === sub);
  if (!target) throw new Error(`sub-item not found: ${sub}`);
  if (target === item && item.get('ref')) return setTaskStatus(item.get('ref'), done);
  if (done) target.set('done', today());
  else target.delete('done');
  writeFileSync(file, doc.toString({ lineWidth: 0 }));
}

export function planToggle() {
  return {
    name: 'mk-plan-toggle',
    configureServer(server) {
      server.middlewares.use('/_plan/toggle', (req, res) => {
        const reply = (code, body) => {
          res.statusCode = code;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify(body));
        };
        // A JSON content type forces a preflight on other origins, so only this site can post.
        if (req.method !== 'POST' || !String(req.headers['content-type']).startsWith('application/json')) {
          return reply(405, { error: 'POST application/json only' });
        }
        let raw = '';
        req.on('data', (chunk) => (raw += chunk));
        req.on('end', () => {
          try {
            const body = JSON.parse(raw);
            setPlanItem({ ...body, done: body.done === true });
            reply(200, { ok: true });
          } catch (e) {
            reply(400, { error: String(e.message ?? e) });
          }
        });
      });
    },
  };
}
