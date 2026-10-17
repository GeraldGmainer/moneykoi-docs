import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type Repo = 'app' | 'web' | 'supabase' | 'admin';

const dirs: Record<Repo, string> = {
  app: 'moneykoi-app',
  web: 'moneykoi-web',
  supabase: 'moneykoi-supabase',
  admin: 'moneykoi-admin',
};

// The sibling repos of the moneykoi workspace; MONEYKOI_ROOT points elsewhere, e.g. in CI.
const root = resolve(process.env.MONEYKOI_ROOT ?? resolve(process.cwd(), '..'));

export function repoPath(repo: Repo, rel = ''): string {
  return resolve(root, dirs[repo], rel);
}

export function hasRepo(repo: Repo): boolean {
  return existsSync(repoPath(repo));
}

export function readRepoFile(repo: Repo, rel: string): string | null {
  const path = repoPath(repo, rel);
  return existsSync(path) ? readFileSync(path, 'utf8') : null;
}

export function githubUrl(repo: Repo, rel: string): string {
  return `https://github.com/GeraldGmainer/${dirs[repo]}/blob/main/${rel}`;
}
