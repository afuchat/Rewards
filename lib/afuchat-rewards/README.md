# @afuchat/rewards

Zero-config gamification SDK for Node.js. XP, points, levels, badges, streaks, leaderboards, and a built-in event system — all working instantly after install with no setup required.

## Install

```bash
npm install @afuchat/rewards
```

## Quick Start

```ts
import AfuRewards from "@afuchat/rewards";

const rewards = new AfuRewards();

rewards.addXP("user1", 50);
rewards.unlockBadge("user1", "Starter");

console.log(rewards.getXP("user1"));    // 50
console.log(rewards.getLevel("user1")); // 1
console.log(rewards.getBadges("user1")); // [{ id: "Starter", ... }]
```

That's it. No database, no API keys, no configuration.

---

## API Reference

### XP

```ts
rewards.addXP(userId: string, amount: number): number
rewards.getXP(userId: string): number
```

### Points

```ts
rewards.addPoints(userId: string, amount: number): number
rewards.deductPoints(userId: string, amount: number): number
rewards.getPoints(userId: string): number
```

### Levels

Level is automatically derived from XP using the default formula:
`level = floor(sqrt(xp / 100)) + 1`

```ts
rewards.getLevel(userId: string): number
rewards.calculateLevel(xp: number): number
```

**Custom formula:**

```ts
const rewards = new AfuRewards({
  level: {
    formula: (xp) => Math.floor(xp / 500) + 1,
  },
});
```

### Badges

```ts
// Optional: pre-define badge metadata
rewards.defineBadge("first_post", {
  name: "First Post",
  description: "Published your first post",
  icon: "📝",
});

rewards.unlockBadge(userId: string, badgeId: string): Badge | null
rewards.getBadges(userId: string): Badge[]
rewards.hasBadge(userId: string, badgeId: string): boolean
```

`unlockBadge` returns `null` if the badge was already unlocked. A badge can be
unlocked without pre-defining it — the `id` is used as the name.

### Streaks

```ts
rewards.updateStreak(userId: string): StreakRecord  // call once per day
rewards.getStreak(userId: string): StreakRecord
rewards.resetStreak(userId: string): void
```

`StreakRecord`:
```ts
{
  current: number;   // current consecutive days
  longest: number;   // all-time longest streak
  lastUpdated: Date | null;
}
```

Streak logic:
- Calling `updateStreak` on the **same day** is a no-op (idempotent).
- Calling it on the **next consecutive day** increments the streak.
- Calling it after **missing a day** resets the streak to 1.

### Leaderboard

```ts
rewards.getLeaderboard(type: "xp" | "points", limit?: number): LeaderboardEntry[]
```

Returns users sorted by value descending, with a `rank` field starting at 1.

```ts
LeaderboardEntry: {
  userId: string;
  value: number;
  rank: number;
}
```

### Events

Built-in events fire automatically when rewards are granted:

| Event             | Payload                                   |
|-------------------|-------------------------------------------|
| `xp_added`        | `{ userId, amount, total }`               |
| `points_added`    | `{ userId, amount, total }`               |
| `points_deducted` | `{ userId, amount, total }`               |
| `badge_unlocked`  | `{ userId, badge }`                       |
| `streak_updated`  | `{ userId, streak }`                      |
| `streak_reset`    | `{ userId }`                              |

You can also fire and listen to **custom events**:

```ts
rewards.on("user_posted", (payload) => {
  rewards.addXP(payload.userId, 10);
  rewards.addPoints(payload.userId, 5);
});

// Fire from your app logic
rewards.emit("user_posted", { userId: "user1" });
```

```ts
rewards.on(eventName: string, callback: (payload: T) => void): void
rewards.off(eventName: string, callback): void
rewards.emit(eventName: string, payload: T): void
rewards.removeAllListeners(eventName?: string): void
```

---

## Storage

By default, all data lives in-memory. It is reset when the process restarts. This is intentional for the MVP — no setup, no persistence concerns.

A persistent adapter (PostgreSQL, Redis) can be wired in by extending `MemoryStore` in a future release.

---

## TypeScript

The package ships with full type declarations. All types are exported:

```ts
import type {
  Badge,
  BadgeDefinition,
  AfuRewardsConfig,
  LeaderboardEntry,
  LevelConfig,
  StreakRecord,
} from "@afuchat/rewards";
```

---

## Non-Goals

This SDK intentionally excludes: payments, wallets, financial rewards, SMS, identity verification, and external APIs.
