import type { StreakRecord } from "../types.js";
import type { MemoryStore } from "../storage/memory-store.js";

const MS_PER_DAY = 86_400_000;

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isConsecutiveDay(last: Date, now: Date): boolean {
  const diff = now.getTime() - last.getTime();
  return diff >= MS_PER_DAY && diff < 2 * MS_PER_DAY;
}

export class StreaksModule {
  constructor(private store: MemoryStore) {}

  updateStreak(userId: string): StreakRecord {
    const user = this.store.getOrCreate(userId);
    const now = new Date();
    const { streak } = user;

    if (streak.lastUpdated === null) {
      streak.current = 1;
      streak.longest = 1;
      streak.lastUpdated = now;
    } else if (isSameDay(streak.lastUpdated, now)) {
      // Already updated today — no change
    } else if (isConsecutiveDay(streak.lastUpdated, now)) {
      streak.current += 1;
      if (streak.current > streak.longest) streak.longest = streak.current;
      streak.lastUpdated = now;
    } else {
      // Streak broken
      streak.current = 1;
      streak.lastUpdated = now;
    }

    return { ...streak };
  }

  getStreak(userId: string): StreakRecord {
    return { ...this.store.getOrCreate(userId).streak };
  }

  resetStreak(userId: string): void {
    const user = this.store.getOrCreate(userId);
    user.streak.current = 0;
    user.streak.lastUpdated = null;
  }
}
