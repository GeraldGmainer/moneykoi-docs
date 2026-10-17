# MoneyKoi Docs — AI guide

Human-facing docs for MoneyKoi: features, tiers, business rules, journeys, edge cases, what to test, open work. Astro + Starlight, run locally. Gerald reads the **site**, never the YAML.

## 💬 Replies
Same as `moneykoi-app/CLAUDE.md`: keyword-style bullets, answer first, `file:line` instead of prose.

## 🚫 Git
Same as `moneykoi-app/CLAUDE.md`: **you never write git history or move a ref.** Read-only git is fine. When work is ready, end with one `bash` block of `git add <paths>` + `git commit -m "…"` for Gerald to paste.

## Where things live
| What | Where | Rule |
|---|---|---|
| Tier, needs, live/planned of a gated feature | `moneykoi-app/lib/features/monetization/domain/feature.dart` | **read on every build — never copy it into YAML** |
| Paywall names and details | `moneykoi-app/assets/translations/en.json` (`paywall.feature.*`, `paywall.detail.*`) | read on every build |
| Feature catalog | `src/data/catalog.yaml` | one row per user-facing feature; a row with `feature:` carries **no** `tier`/`status` |
| Rules, journeys, edge cases, checks, tasks, decisions | `src/data/<area>/<kind>.yaml` | schema in `src/content.config.ts`; wrong field = build fails |
| Prose (overview, pricing, legal) | `src/content/docs/<area>/*.mdx` | tables and short lists; escape `{x}` as `\{x\}` in MDX prose |
| Areas | `src/areas.mjs` | one line per area; the sidebar and the home table read it |
| Releases | `src/data/releases/<version>.yaml` | items name their area and **check ids**; notes carry *open / fixed / changed / decided* |
| Rendering | `src/components/*.astro` | a kind page = frontmatter + one component |

## Writing content
- **Source everything.** Every fact comes from code, a test, or an `*_AI_CONTEXT.md` in the app repo. Never invent a command, a price or a reason — write "no reason recorded" instead.
- **Tests are links, not claims.** `tests: [{ file, name }]` — `name` is a substring of the test's description, copied from the test file. The build checks it exists.
- **Ids are permanent** (`R-`, `J-`, `E-`, `C-`, `T-`, `D…`, `Q-`). Never renumber; retire by deleting. Trello cards cite them.
- **One fact, one place.** Link across areas with `related: [ids]` (renders *See also*) instead of copying an entry.
- **Release notes go stale.** When an item's risk or gap is fixed or decided later, mark the note `fixed` / `changed` / `decided` with `now:` naming the source — never delete it.
- **User-facing words** as the app shows them, in *italics* (`*Get Pro*`, `*Sign back in*`). Code in backticks.
- One fact per line. A journey step is a few words. No paragraph where a table works.
- en-US spelling; no trailing period on titles.

## When the app changes
A change in `moneykoi-app` that alters behavior updates this repo in the same pass:
- a `Feature` added → a row in `catalog.yaml` with `feature:`
- a rule, journey or edge case changed → its YAML entry, tests linked
- something Gerald must do or decide → `tasks.yaml` / `decisions.yaml`
- something only a device can prove → `checks.yaml`

## Commands
```sh
nvm use          # Node 24
npm run dev      # http://localhost:4321 — re-reads the app repo on every page load
npm run check    # build + fail on any problem listed on /meta/health/
```
`npm run check` must pass before you hand work back.
