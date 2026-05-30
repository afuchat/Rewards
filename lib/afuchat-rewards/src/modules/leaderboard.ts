import type { LeaderboardEntry } from "../types.js";
import type { MemoryStore } from "../storage/memory-store.js";

export class LeaderboardModule {
  constructor(private store: MemoryStore) {}

  getLeaderboard(
    type: "xp" | "points",
    limit = 10,
  ): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = [];

    for (const [userId, record] of this.store.all()) {
      entries.push({
        userId,
        value: type === "xp" ? record.xp : record.points,
        rank: 0,
      });
    }

    entries.sort((a, b) => b.value - a.value);

    return entries.slice(0, limit).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }
}
