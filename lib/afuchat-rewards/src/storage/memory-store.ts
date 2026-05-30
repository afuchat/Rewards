import type { UserRecord } from "../types.js";

export interface SerializedStore {
  version: 1;
  savedAt: string;
  users: Record<string, SerializedUserRecord>;
}

interface SerializedUserRecord {
  xp: number;
  points: number;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon?: string;
    unlockedAt: string;
  }>;
  streak: {
    current: number;
    longest: number;
    lastUpdated: string | null;
  };
}

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

  serialize(): SerializedStore {
    const users: Record<string, SerializedUserRecord> = {};
    for (const [userId, record] of this.users) {
      users[userId] = {
        xp: record.xp,
        points: record.points,
        badges: record.badges.map((b) => ({
          id: b.id,
          name: b.name,
          description: b.description,
          icon: b.icon,
          unlockedAt: b.unlockedAt.toISOString(),
        })),
        streak: {
          current: record.streak.current,
          longest: record.streak.longest,
          lastUpdated: record.streak.lastUpdated?.toISOString() ?? null,
        },
      };
    }
    return { version: 1, savedAt: new Date().toISOString(), users };
  }

  deserialize(snapshot: SerializedStore): void {
    this.users.clear();
    for (const [userId, raw] of Object.entries(snapshot.users)) {
      this.users.set(userId, {
        xp: raw.xp,
        points: raw.points,
        badges: raw.badges.map((b) => ({
          id: b.id,
          name: b.name,
          description: b.description,
          icon: b.icon,
          unlockedAt: new Date(b.unlockedAt),
        })),
        streak: {
          current: raw.streak.current,
          longest: raw.streak.longest,
          lastUpdated: raw.streak.lastUpdated
            ? new Date(raw.streak.lastUpdated)
            : null,
        },
      });
    }
  }
}
