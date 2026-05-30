# @afuchat/rewards

Zero-config gamification SDK. Install and use in under 30 seconds — no database, no API keys, no setup.

## Run & Operate

- `pnpm --filter @afuchat/rewards run typecheck` — typecheck the SDK
- `pnpm --filter @afuchat/rewards run build` — build ESM + CJS bundles + declarations into `dist/`
- `pnpm run typecheck` — full typecheck across all packages
- `node lib/afuchat-rewards/dist/index.js` — verify the built output directly

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Pure TypeScript library — no runtime dependencies
- Dual output: ESM (`dist/index.js`) + CJS (`dist/index.cjs`) + declarations (`dist/index.d.ts`)
- Build: esbuild (bundles) + tsc (declarations)

## Where things live

- `lib/afuchat-rewards/src/` — all SDK source
  - `types.ts` — shared types/interfaces
  - `storage/memory-store.ts` — in-memory data store
  - `modules/xp.ts` — XP system
  - `modules/points.ts` — Points system (add/deduct)
  - `modules/levels.ts` — Level calculation (configurable formula)
  - `modules/badges.ts` — Badge unlock + registry
  - `modules/streaks.ts` — Daily streak tracking
  - `modules/leaderboard.ts` — Sorted leaderboards by XP or points
  - `modules/events.ts` — Custom event emitter
  - `AfuRewards.ts` — Main facade class
  - `index.ts` — Public exports
- `lib/afuchat-rewards/dist/` — compiled output (gitignore or publish)
- `lib/afuchat-rewards/demo.ts` — runnable demo
- `lib/afuchat-rewards/README.md` — full API docs

## Architecture decisions

- **Facade pattern** — `AfuRewards` is a single class that delegates to focused module classes. This gives developers a clean Stripe-like API surface without exposing internals.
- **Auto-create user records** — `MemoryStore.getOrCreate()` initializes user state on first access, so no explicit user registration is needed.
- **Built-in events on every reward action** — `xp_added`, `badge_unlocked`, etc. fire automatically, enabling reactive logic without polling.
- **Configurable level formula** — default formula `floor(sqrt(xp/100)) + 1` is gentle for early users; pass a custom `level.formula` to the constructor to override.
- **Streak idempotency** — calling `updateStreak` multiple times on the same calendar day is safe (no-op after the first call), preventing accidental streak inflation.

## Product

A developer installs `@afuchat/rewards`, creates one `new AfuRewards()` instance, and immediately has a full gamification engine: XP, points, level-ups, badge unlocks, daily streaks, leaderboards, and a custom event bus — all backed by fast in-memory storage.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The `demo.ts` file imports from `./src/index.js` (TypeScript ESM convention). Run it with `tsx` or Node 24's `--experimental-strip-types --experimental-transform-types` — or run the built `dist/index.js` directly.
- `pnpm run build` inside the SDK package runs esbuild first (JS bundles), then `tsc -p tsconfig.build.json` (declarations). Both steps are needed for a complete `dist/`.
- In-memory storage resets on process restart — intentional for zero-config MVP.

## Pointers

- See `lib/afuchat-rewards/README.md` for full API docs and examples
- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
