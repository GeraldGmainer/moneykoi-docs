# MoneyKoi Docs

What MoneyKoi does, for people: features, tiers, business rules, journeys, edge cases, what to test, open work.

```sh
nvm use
npm install
npm run dev      # http://localhost:4321
npm run check    # build + health check (drift vs. code, broken test links)
```

Needs `moneykoi-app` checked out next to this folder (or `MONEYKOI_ROOT=/path/to/workspace`): tiers and tests are read from it on every build.

Agents: read `CLAUDE.md`.
