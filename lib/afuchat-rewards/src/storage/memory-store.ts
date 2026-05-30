import type { UserRecord } from "../types.js";

export class MemoryStore {
  private users = new Map<string, UserRecord>();

  getOrCreate(userId: string): UserRecord {
    if (!this.users.has(userId)) {
      this.users.set(userId, {
        xp: 0,
        points: 0,
        badges: [],
        streak: { current: 0, longest: 0, lastUpdated: null },
      });
    }
    return this.users.get(userId)!;
  }

  get(userId: string): UserRecord | undefined {
    return this.users.get(userId);
  }

  all(): Map<string, UserRecord> {
    return this.users;
  }
}
