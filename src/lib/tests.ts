import { githubUrl, hasRepo, readRepoFile, type Repo } from './repos';

export interface TestRef {
  file: string;
  name?: string;
  repo: Repo;
}

export type TestStatus = 'ok' | 'no-file' | 'no-name' | 'no-repo';

export interface CheckedTest extends TestRef {
  status: TestStatus;
  url: string;
}

export function checkTest(ref: TestRef): CheckedTest {
  const url = githubUrl(ref.repo, ref.file);
  if (!hasRepo(ref.repo)) return { ...ref, status: 'no-repo', url };
  const source = readRepoFile(ref.repo, ref.file);
  if (source === null) return { ...ref, status: 'no-file', url };
  if (ref.name && !source.includes(ref.name)) return { ...ref, status: 'no-name', url };
  return { ...ref, status: 'ok', url };
}

export const testStatusLabel: Record<TestStatus, string> = {
  ok: 'found',
  'no-file': 'file missing',
  'no-name': 'test name not found',
  'no-repo': 'repo not checked out',
};
