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
| Roadmap | `src/data/roadmap.yaml` → `/roadmap/` | buckets in order (next releases, then months, then *Later*); items are catalog ids or docs ids. **Every planned catalog row sits in a bucket** — the check fails otherwise. Order changes are Gerald's call |
| Releases | `src/data/releases/<version>.yaml` | items name their area and **check ids**; notes carry *open / fixed / changed / decided* |
| Diagrams | `src/diagrams/<id>.mmd` (Mermaid) + `src/data/diagrams.yaml` | registry: title, `page` (How it works), `areas` (embedded in their overviews), caption, `sources`, `checked` date. Shown with `<Diagram id="…" />` |
| Rendering | `src/components/*.astro` | a kind page = frontmatter + one component |

## Writing content
- **Source everything.** Every fact comes from code, a test, or an `*_AI_CONTEXT.md` in the app repo. Never invent a command, a price or a reason — write "no reason recorded" instead.
- **Tests are links, not claims.** `tests: [{ file, name }]` — `name` is a substring of the test's description, copied from the test file. The build checks it exists.
- **Ids are permanent** (`R-`, `J-`, `E-`, `C-`, `T-`, `D…`, `Q-`). Never renumber; retire by deleting. Trello cards cite them.
- **One fact, one place.** Link across areas with `related: [ids]` (renders *See also*) instead of copying an entry.
- **Release notes go stale.** When an item's risk or gap is fixed or decided later, mark the note `fixed` / `changed` / `decided` with `now:` naming the source — never delete it.
- **User-facing words** as the app shows them, in *italics* (`*Get Pro*`, `*Sign back in*`). Code in backticks.
- en-US spelling; no trailing period on titles.

### Keywords, not prose (Gerald has reading difficulties — this is the main rule)
- **Fragments, not sentences.** Drop filler: "so that", "which means", "deliberately", "in order to", "note that".
- **One fact per line, ≤ 12 words.** Two facts → a `- ` list, never a paragraph. A table where facts share a shape.
- **Bold the one word that matters** (`**never**`, `**Pro**`, `**owner**`) — at most one per line.
- **Symbols over words**: `→` for "then / leads to", `·` between short items, `+` for "and also", `≠`, `≤`.
- **No asides.** No parentheses or em-dash clauses inside a line — make it its own line.
- Limits per field:

| Field | Limit |
|---|---|
| `title` | ≤ 6 words |
| rule `text` | ≤ 4 lines, ≤ 12 words each |
| edge case `when` / `then` | ≤ 10 / ≤ 14 words |
| journey `from`, `result`, each step | ≤ 6 words |
| check `text` | action → expected, ≤ 20 words |
| task / decision / caption | ≤ 3 lines |
| overview page | a facts table + short lists, no paragraph over 2 lines |

- Long background stays in the context docs; the site links to them (`source:`), it does not retell them.

## Keeping it current — the contract every repo follows
`moneykoi-app`, `moneykoi-web`, `moneykoi-supabase`, `moneykoi-admin`, `moneykoi-site` and `moneykoi-receipts` all point here. **A change that alters what a user sees or what Gerald must test, do or decide updates this repo in the same pass** — not in a later "docs round". Gerald trusts the site; a stale page is worse than none.

### Two kinds of docs, one fact each
| | `*_AI_CONTEXT.md` (in each repo) | `moneykoi-docs` (this site) |
|---|---|---|
| Reader | agents | Gerald |
| Holds | how it is built: code paths, traps, invariants, why | what it does: rules, journeys, edge cases, tiers, web parity, checks, open work |
| Updated | when the code changes | when the behavior changes |

A pure refactor touches only the context doc. A behavior change touches both. Never paste a context doc into YAML — write the user-visible fact and name the doc in `source:`.

### What to update
| The change | Update here |
|---|---|
| a rule, limit, default or permission a user would notice (who may do what, what is Pro, what is kept) | `src/data/<area>/rules.yaml` — text, `source:`, `tests:` |
| a flow: steps, screens, where it lands, a renamed button | `journeys.yaml`; quoted UI words (`*Sign back in*`) follow the new copy |
| a corner case found, fixed, or ruled by design | `edge-cases.yaml` — `status: fixed` / `known-issue` / `by-design`; a fix keeps the entry |
| something only a device can prove | `checks.yaml` (new id; never reuse) |
| a feature added, removed, or moved between plans; a new `Feature` enum value | `src/data/catalog.yaml` (`feature:` rows take tier and live/planned from code — never copy them); a new planned row also goes into a `roadmap.yaml` bucket — *Later* when Gerald gave no date |
| the web gains, loses or diverges from an app feature (or the reverse) | the catalog row's `web:` / `webNote:`, and the area's *On the web* entries |
| something Gerald must run, buy, configure or decide | `tasks.yaml` (`owner: gerald`) / `decisions.yaml` (`open`) |
| a task done or a decision taken | `status: done` / `decided` with the date and `answer:` |
| a test the docs link to renamed, moved or deleted | the `tests:` link — `npm run check` names every broken one |
| a table, relation, flow, state or decision a diagram draws | `src/diagrams/<id>.mmd`, and `checked:` in `src/data/diagrams.yaml` — find them with `grep -n "<changed file>" src/data/diagrams.yaml` |
| a release prepared | `src/data/releases/<version>.yaml` + its page, see *Releases* below |
| a new area-sized feature (it got its own context doc) | a new area: `src/areas.mjs`, `src/data/<area>/`, pages — `/meta/how-it-works/` |

**Nothing to update** for: refactors, renames inside the code, performance work, test-only changes (unless a linked test was renamed), copy tweaks the docs do not quote. When unsure, check the area's pages — if nothing there became wrong, nothing needs writing.

### Which area
| Context doc (app · web · supabase) | Area |
|---|---|
| `MONETIZATION` · admin plan grants | `monetization` |
| `OFFLINE_FIRST` · `sync_all`, `sync_membership`, realtime policies, delete triggers | `offline` (Offline-first) — the outbox, the pull, realtime, conflicts, deletes, what works offline |
| `OFFLINE_TIER` · `AUTH_PROFILE_WEB` | `accounts` (Sign-in & accounts) |
| `DEMO` | `demo` (Demo) — the sample data files, the guards, leaving |
| `BOOK`, `FAMILY_ACCOUNTS` · `BOOKS_WEB` | `books` |
| `FORMS`, `QUICK_BOOKING`, `TRASH` · `BOOKING_ENTRY_WEB`, `BOOKINGS_WEB`, `TAGS_WEB` | `bookings` |
| `CATEGORY` · `CATEGORIES_WEB`, `ACCOUNTS_WEB` | `ledger` (Categories & accounts) |
| `RECURRING_BOOKINGS` · `RECURRING_WEB` | `recurring` |
| `BUDGET_BOOK`, `BUDGET_CALENDAR` | `budget-book` |
| `ANALYTICS` · `ANALYTICS_WEB`, `BALANCE_WEB` | `analytics` |
| `BUDGET_GOALS` · `BUDGETS_WEB`, `GOALS_WEB`, `LOANS_WEB` | `budgets` |
| `FORECAST` · `FORECAST_WEB` | `forecast` |
| `INVESTMENTS`, `SERIES_REPLICA` · `INVESTMENTS_WEB` · `INVESTMENT_PRICES_AI_CONTEXT.md` | `investments` |
| `RECONCILIATION` · `RECONCILIATION_WEB` | `balance-check` |
| `SCANNER` · `moneykoi-receipts` | `scanner` |
| `SHOPPING_LIST` · `SHOPPING_WEB` | `shopping` |
| `HOME_CARDS`, `NAVIGATION`, `HOME_WIDGET` · `DASHBOARD_WEB`, `APP_SHELL_WEB` | `home` |
| `NOTIFICATIONS` | `notifications` |
| `DATA_PORTABILITY`, `BOOKING_IMPORT`, `BOOKING_EXPORT`, `BACKUP_RESTORE` · `BACKUP_RESTORE_WEB`, `DATA_EXPORT_WEB`, `IMPORT_WEB` · `BACKUP_FORMAT.md` | `data` |
| `APP_LOCK`, `AMOUNT_PRIVACY`, `USAGE_STATS`, `WEB_SIGN_IN` · `USAGE_STATS_WEB` | `privacy` |
| `PROFILE_SETTINGS` · `SETTINGS_FORMATTING_WEB`, `ONBOARDING_WEB` · feedback, changelog | `settings` |
| `CLAUDE.md` rules, skills, CI, builds · `TESTING_WEB` | `platform` |

A server migration belongs to the area of the feature it serves. One fact lives in one area; others link to it with `related:`.

### Diagrams
- **Read from the sources, never from an older diagram.** The diagrams in `moneykoi-supabase/ARCHITECTURE.md` and `moneykoi-app/.agents/dev/` predate later changes; check every box and arrow against the current context doc or migration and list those in `sources:`.
- Every source a diagram names is a file the change must look at: when a commit touches one, re-read the diagrams that cite it and bump `checked:` once they are right.
- Mermaid reserves some words as node ids (`call`, `end`, `class`, `style`, `click`): use another id. A broken diagram shows a red error on its page, and the build does not catch it — open the page after editing.
- No emoji in labels; keep a label to a few words and put the explanation in `caption:`.
- `page: offline-first` diagrams live on `/offline/how-it-works/` in the order of `diagrams.yaml`, each placed by hand in that page's steps — a new one needs a line there too.

### Releases
`prepare-release` (app and web) adds `src/data/releases/<app version>.yaml` (`web-<version>.yaml` for a web-only release) with `status: testing` and one item per release-note entry: `area`, `what`, the `checks` that prove it (write missing ones into the area first), `related`. Add the page `src/content/docs/releases/<x-y-z>.mdx` — a copy of `1-17-0.mdx` with the new id. Gerald adds his test notes later; never invent `notes`. When the release ships, `status: released`, and its bucket leaves `src/data/roadmap.yaml`.

### Finishing
1. `npm run check` in this repo passes (Node 24: `export PATH="$HOME/.nvm/versions/node/v24.15.0/bin:$PATH"`).
2. The git block gets a **separate** commit for this repo — `git -C ../moneykoi-docs add <paths>` + `git -C ../moneykoi-docs commit -m "<area>: <what changed>"` — next to the code repo's commit. Every path named.
3. Say in the reply which docs entries changed (ids), or "docs: nothing user-visible changed".

## Commands
```sh
nvm use          # Node 24
npm run dev      # http://localhost:4321 — re-reads the app repo on every page load
npm run check    # build + fail on any problem listed on /meta/health/
```
`npm run check` must pass before you hand work back.
