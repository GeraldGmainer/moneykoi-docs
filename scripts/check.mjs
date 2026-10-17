import { readFileSync } from 'node:fs';

const { problems, tests } = JSON.parse(readFileSync(new URL('../dist/health.json', import.meta.url), 'utf8'));

console.log(`test links: ${tests.ok} / ${tests.total} found`);
for (const p of problems) console.log(`✗ [${p.kind}] ${p.where}: ${p.message}`);

if (problems.length > 0) {
  console.log(`\n${problems.length} problem(s), see /meta/health/`);
  process.exit(1);
}
console.log('health: all good');
